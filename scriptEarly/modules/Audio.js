// @ts-check
/// <reference path='../../maplebirch.d.ts' />
(async() => {
  'use strict';

  class AudioIDBManager {
    /** @param {MaplebirchCore} core */
    constructor(core) {
      this.core = core;
      this.core.once(':IndexedDB', () => this.initIndexedDB());
    }

    initIndexedDB() {
      this.core.idb.register('audioBuffers', { keyPath: 'key' }, [
        { name: 'mod', keyPath: 'mod', options: { unique: false } }
      ]);
    }

    /** @param {any} key @param {any} arrayBuffer @param {string} modName */
    async store(key, arrayBuffer, modName) {
      try {
        await this.core.idb.withTransaction(['audioBuffers'], 'readwrite', async (tx) => {
          const store = tx.objectStore('audioBuffers');
          await store.put({ key, arrayBuffer, mod: modName });
        });
        return true;
      } catch (/**@type {any}*/err) {
        this.core.logger.log(`存储音频失败: ${key} - ${err?.message || err}`, 'ERROR');
        return false;
      }
    }

    /** @param {any} key */
    async get(key) {
      try {
        return await this.core.idb.withTransaction(['audioBuffers'], 'readonly', async (tx) => {
          const store = tx.objectStore('audioBuffers');
          const record = await store.get(key);
          return record ? record.arrayBuffer : null;
        });
      } catch (/**@type {any}*/err) {
        this.core.logger.log(`获取音频失败: ${key} - ${err?.message || err}`, 'ERROR');
        return null;
      }
    }

    /** @param {string} modName */
    async getModKeys(modName) {
      try {
        return await this.core.idb.withTransaction(['audioBuffers'], 'readonly', async (tx) => {
          const store = tx.objectStore('audioBuffers');
          const index = store.index('mod');
          const records = await index.getAll(modName);
          return records.map((/**@type {{ key: any; }}*/record) => record.key);
        });
      } catch (/**@type {any}*/err) {
        this.core.logger.log(`获取模块音频键失败: ${modName} - ${err?.message || err}`, 'ERROR');
        return [];
      }
    }

    /** @param {string} key */
    async delete(key) {
      try {
        await this.core.idb.withTransaction(['audioBuffers'], 'readwrite', async (tx) => {
          const store = tx.objectStore('audioBuffers');
          await store.delete(key);
        });
        return true;
      } catch (/**@type {any}*/err) {
        this.core.logger.log(`删除音频失败: ${key} - ${err?.message || err}`, 'ERROR');
        return false;
      }
    }

    /** @param {string} modName */
    async deleteMod(modName) {
      try {
        const keys = await this.getModKeys(modName);
        for (const key of keys) await this.delete(key);
        return true;
      } catch (/**@type {any}*/err) {
        this.core.logger.log(`删除模块音频失败: ${modName} - ${err?.message || err}`, 'ERROR');
        return false;
      }
    }

    /**
     * 清空所有音频
     * @returns {Promise<boolean>} 是否成功
     */
    async clear() {
      try {
        await this.core.idb.withTransaction(['audioBuffers'], 'readwrite', async (tx) => {
          const store = tx.objectStore('audioBuffers');
          await store.clear();
        });
        return true;
      } catch (/**@type {any}*/err) {
        this.core.logger.log(`清空音频失败: ${err?.message || err}`, 'ERROR');
        return false;
      }
    }
  }

  class ModAudioPlayer {
    /** @param {AudioManager} audioManager @param {string} modName */
    constructor(audioManager, modName) {
      /** @type {any} */
      this.audioManager = audioManager;        // 音频管理器实例
      this.modName = modName;                  // 所属模块名称
      this.activeSources = new Map();          // 当前活动的音频源
      this.pausedStates = new Map();           // 暂停状态的音频
      this.volume = 1.0;                       // 全局音量
      this.globalGainNode = null;              // 全局增益节点
      this.loopCounters = new Map();           // 音频循环计数器
      this.defaultLoopCount = 100;             // 默认循环次数
      this.bufferCache = new Map();            // 内存缓存解码后的AudioBuffer
      /** @type {never[]} */
      this.audioKeysCache = [];                // 音频键缓存
      this.initGainNode();                     // 初始化增益节点
      this.refreshAudioKeys();                 // 初始化时自动刷新缓存
    }

    initGainNode() {
      if (!this.audioManager.audioContext) return;
      this.globalGainNode = this.audioManager.audioContext.createGain();
      this.globalGainNode.connect(this.audioManager.audioContext.destination);
      this.globalGainNode.gain.value = this.volume;
    }

    /** @param {any} key */
    async getAudioBuffer(key) {
      if (this.bufferCache.has(key)) return this.bufferCache.get(key);
      const arrayBuffer = await this.audioManager.idbManager.get(key);
      if (!arrayBuffer) throw new Error(`音频未找到: ${key}`);
      const audioBuffer = await this.audioManager.decodeAudioData(arrayBuffer);
      this.bufferCache.set(key, audioBuffer);
      return audioBuffer;
    }

    /** @param {any} key */
    async play(key, options = {}) {
      try {
        const audioBuffer = await this.getAudioBuffer(key);
        return this.#playWithBuffer(audioBuffer, key, options);
      } catch (error) {
        this.audioManager.log(`播放音频失败: ${key}`, 'WARN');
        return null;
      }
    }

    /** @param {AudioBuffer|null} audioBuffer @param {any} key @param {any} options */
    #playWithBuffer(audioBuffer, key, options = {}) {
      const baseFullKey = `${this.modName}:${key}`;
      const allowOverlap = !!options.allowOverlap;
      const instanceKey = allowOverlap ? `${baseFullKey}|${Date.now()}|${Math.random().toString(36).slice(2,6)}` : baseFullKey;

      if (!allowOverlap && this.activeSources.has(baseFullKey)) {
        if (options.stopOthers === false) {
          return null;
        } else {
          const existing = this.activeSources.get(baseFullKey);
          try { existing.source.stop(); } catch(e) {}
          this.activeSources.delete(baseFullKey);
          this.loopCounters.delete(baseFullKey);
        }
      }

      if (options.stopOthers) {
        this.stopAll();
      }

      const source = this.audioManager.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      const gainNode = this.audioManager.audioContext.createGain();
      let volumeValue = (options.volume !== undefined) ? Number(options.volume) : this.volume;
      if (isNaN(volumeValue) || volumeValue < 0) volumeValue = this.volume;
      gainNode.gain.value = volumeValue;
      source.connect(gainNode);
      gainNode.connect(this.globalGainNode || this.audioManager.audioContext.destination);
      const startTime = this.audioManager.audioContext.currentTime;
      const offset = options.offset || 0;
      const duration = options.duration;
      const loopRequested = !!options.loop;
      const loopCount = (options.loopCount !== undefined) ? options.loopCount : (loopRequested ? Infinity : 1);

      if (loopRequested && loopCount === Infinity) {
        source.loop = true;
        if (options.loopStart !== undefined) source.loopStart = options.loopStart;
        if (options.loopEnd !== undefined) source.loopEnd = options.loopEnd;
        this.loopCounters.set(instanceKey, Infinity);
      } else if (loopRequested && loopCount > 1) {
        this.loopCounters.set(instanceKey, loopCount);
      }

      try {
        source.start(startTime, offset, duration);
      } catch (e) {
        this.audioManager.log(`启动音频源失败: ${key}`, 'WARN', e);
        return null;
      }

      const audioSource = {
        source,
        gainNode,
        startTime,
        playStartTime: startTime,
        currentOffset: offset,
        options: { ...options, volume: volumeValue },
        key: instanceKey,
        logicalKey: baseFullKey
      };

      this.activeSources.set(instanceKey, audioSource);
      source.onended = () => {
        source.disconnect();
        gainNode.disconnect();
        const lc = this.loopCounters.get(instanceKey);

        if (lc === Infinity) {
          this.activeSources.delete(instanceKey);
          this.loopCounters.delete(instanceKey);
          if (options.onEnded) options.onEnded();
          return;
        }

        if (lc && lc > 1) {
          this.loopCounters.set(instanceKey, lc - 1);
          source.disconnect();
          gainNode.disconnect();
          setTimeout(() => {
            this.play(key, {
              ...options,
              offset: 0,
              loop: lc - 1 > 0 && !!options.loop,
              loopCount: lc - 1,
              stopOthers: false,
              allowOverlap: false
            });
          }, 0);
          this.activeSources.delete(instanceKey);
          return;
        }

        this.activeSources.delete(instanceKey);
        this.loopCounters.delete(instanceKey);
        this.bufferCache.delete(key);
        if (options.onEnded) options.onEnded();
      };

      return audioSource;
    }

    /** @param {any} key */
    stop(key) {
      const baseFullKey = `${this.modName}:${key}`;
      const matchKey = Array.from(this.activeSources.keys()).find(k => k.startsWith(baseFullKey));

      if (matchKey) {
        const audioSource = this.activeSources.get(matchKey);
        try {
          audioSource.source.stop();
          audioSource.source.disconnect();
          audioSource.gainNode.disconnect();
        } catch(e) {}
        this.activeSources.delete(matchKey);
        this.loopCounters.delete(matchKey);
      }
      
      this.pausedStates.delete(baseFullKey);
    }

    stopAll() {
      this.activeSources.forEach((source, k) => {
        try { source.source.stop(); } catch(e) {}
        this.loopCounters.delete(k);
      });
      this.activeSources.clear();
      this.pausedStates.clear();
    }

    /** @param {any} volume */
    set Volume(volume) {
      if (isNaN(Number(volume)) || Number(volume) < 0) return;
      this.volume = Number(volume);
      if (this.globalGainNode) this.globalGainNode.gain.value = Number(volume);
      this.activeSources.forEach(source => {
        try { source.gainNode.gain.value = source.options.volume !== undefined ? source.options.volume : this.volume; } catch (e) { }
      });
    }

    /** @param {any} key @param {any} volume */
    setVolumeFor(key, volume) {
      const baseFullKey = `${this.modName}:${key}`;
      const matchKey = Array.from(this.activeSources.keys()).find(k => k.startsWith(baseFullKey));
      if (matchKey) {
        const volumeValue = Number(volume);
        if (isNaN(volumeValue) || volumeValue < 0) return;
        const audioSource = this.activeSources.get(matchKey);
        audioSource.gainNode.gain.value = volumeValue;
        audioSource.options.volume = volumeValue;
      }
    }

    /** @param {any} key */
    async togglePause(key) {
      const baseFullKey = `${this.modName}:${key}`;
      const matchKey = Array.from(this.activeSources.keys()).find(k => k.startsWith(baseFullKey));

      if (matchKey) {
        const audioSource = this.activeSources.get(matchKey);
        const currentTime = this.audioManager.audioContext.currentTime;
        const elapsed = currentTime - audioSource.playStartTime;
        const currentOffset = (audioSource.currentOffset || 0) + elapsed;

        try { 
          audioSource.source.stop();
          audioSource.source.disconnect();
          audioSource.gainNode.disconnect();
        } catch (e) {}
        this.activeSources.delete(matchKey);
        this.pausedStates.set(baseFullKey, {
          offset: currentOffset,
          options: {
            ...audioSource.options,
            loop: !!audioSource.source.loop,
            loopStart: audioSource.source.loopStart,
            loopEnd: audioSource.source.loopEnd
          }
        });

        return { status: 'paused', offset: currentOffset };
      }

      if (this.pausedStates.has(baseFullKey)) {
        const pausedState = this.pausedStates.get(baseFullKey);
        this.pausedStates.delete(baseFullKey);
        const audioSource = await this.play(key, {
          ...pausedState.options,
          offset: pausedState.offset,
          stopOthers: false,
          allowOverlap: false
        });

        if (audioSource) {
          return { status: 'resumed', audioSource };
        } else {
          this.pausedStates.set(baseFullKey, pausedState);
          return { status: 'failed' };
        }
      }

      return { status: 'not-found' };
    }

    isPlaying() {
      const playingKeys = new Set();
      for (const [fullKey] of this.activeSources) {
        const prefix = `${this.modName}:`;
        if (!fullKey.startsWith(prefix)) continue;
        const rest = fullKey.substring(prefix.length);
        const logical = rest.split('|')[0];
        playingKeys.add(logical);
      }
      return Array.from(playingKeys);
    }

    get audioKeys() {
      return this.audioKeysCache;
    }

    async refreshAudioKeys() {
      try { this.audioKeysCache = await this.audioManager.idbManager.getModKeys(this.modName); }
      catch { this.audioKeysCache = []; }
    }

    /** @param {any} key */
    getDuration(key) {
      if (this.bufferCache.has(key)) return this.bufferCache.get(key).duration;
      return 0;
    }

    /** @param {any} key @param {any} count */
    setLoopCount(key, count) {
      const baseFullKey = `${this.modName}:${key}`;
      Array.from(this.activeSources.keys()).forEach(k => {
        if (k.startsWith(baseFullKey)) {
          this.loopCounters.set(k, count);
        }
      });
    }
  }

  class AudioManager {
    static ModAudioPlayer = ModAudioPlayer;

    /** @param {MaplebirchCore} core */
    constructor(core) {
      this.core = core;
      this.log = core.tool.createLog('audio');
      this.audioContext = null;
      this.idbManager = new AudioIDBManager(core);
      this.modPlayers = new Map();
      /** @type {any[]} */
      this.allAudioKeysCache = [];
      this.initAudioContext();
    }

    initAudioContext() {
      if (this.audioContext) return;
      try {
        this.audioContext = new window.AudioContext();
      } catch (e) {
        this.log('AudioContext 初始化失败', 'WARN', e);
      }
    }

    /** @param {{ slice: (arg0: number) => ArrayBuffer; }} arrayBuffer */
    decodeAudioData(arrayBuffer) {
      return new Promise((resolve, reject) => {
        // @ts-ignore
        this.audioContext.decodeAudioData(arrayBuffer.slice(0), 
          (buffer) => resolve(buffer),
          (error) => reject(error)
        );
      });
    }

    /** @param {any} key @param {any} arrayBuffer */
    async loadAudio(key, arrayBuffer, modName = 'default') {
      if (!this.audioContext) return false;
      const success = await this.idbManager.store(key, arrayBuffer, modName);
      if (success) await this.refreshCache(modName);
      return success;
    }

    /** @param {string} modName */
    async importAllAudio(modName, audioFolder = 'audio') {
      const modLoader = maplebirch.modLoader;
      if (!modLoader) return false;
      const modZip = modLoader.getModZip(modName);
      if (!modZip || !modZip.modInfo || !modZip.modInfo.bootJson || !modZip.modInfo.bootJson.additionFile) return false;
      /** @type {any[]} */
      const allAudioFiles = [];
      modZip.zip.forEach((/** @type {string} */ path, /** @type {{ dir: any; }} */ file) => {
        if (path.startsWith(`${audioFolder}/`) && !file.dir) {
          // @ts-ignore
          const ext = path.split('.').pop().toLowerCase();
          if (['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(ext)) allAudioFiles.push(path);
        }
      });
      const additionFileSet = new Set(modZip.modInfo.bootJson.additionFile);
      allAudioFiles.forEach(path => { if (!additionFileSet.has(path)) this.log(`音频文件 "${path}" 在模组中找到但未在 additionFile 中列出`, 'WARN'); });
      /** @type {{ path: any; key: any; }[]} */
      const audioFiles = [];
      modZip.modInfo.bootJson.additionFile.forEach((/** @type {string} */path) => {
        if (path.startsWith(`${audioFolder}/`)) {
          // @ts-ignore
          const ext = path.split('.').pop().toLowerCase();
          if (['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(ext)) {
            let key = path.substring(audioFolder.length + 1);
            const lastDotIndex = key.lastIndexOf('.');
            if (lastDotIndex > 0) key = key.substring(0, lastDotIndex);
            audioFiles.push({ path, key });
          }
        }
      });
      for (const { path, key } of audioFiles) {
        const file = modZip.zip.file(path);
        if (!file) continue;
        try {
          const arrayBuffer = await file.async('arraybuffer');
          await this.loadAudio(key, arrayBuffer, modName);
        } catch (e) {
          this.log(`加载模组音频文件失败: ${path}`, 'WARN', e);
        }
      }
      if (!this.modPlayers.has(modName)) this.modPlayers.set(modName, new AudioManager.ModAudioPlayer(this, modName));
      return true;
    }

    /** @param {any} file */
    async addAudioFromFile(file, modName = 'maplebirch-audio') {
      if (!file) return false;
      const fileName = file.name;
      const fileExt = fileName.split('.').pop().toLowerCase();
      if (!['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(fileExt)) {
        this.log(`不支持的文件格式: ${fileExt}`, 'WARN');
        return false;
      }
      const key = fileName.substring(0, fileName.lastIndexOf('.'));
      try {
        const arrayBuffer = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsArrayBuffer(file);
        });
        const success = await this.loadAudio(key, arrayBuffer, modName);
        if (success) {
          if (!this.modPlayers.has(modName)) this.modPlayers.set(modName, new AudioManager.ModAudioPlayer(this, modName));
          this.log(`添加音频成功: ${key}`, 'INFO');
          return true;
        }
        return false;
      } catch (error) {
        this.log(`添加音频文件失败: ${error}`, 'WARN');
        return false;
      }
    }

    /** @param {string} modName */
    getPlayer(modName) {
      if (!this.modPlayers.has(modName)) this.modPlayers.set(modName, new AudioManager.ModAudioPlayer(this, modName));
      return this.modPlayers.get(modName);
    }
    
    get allAudioKeys() {
      return this.allAudioKeysCache;
    }

    set Volume(volume) {
      // @ts-ignore
      const volumeValue = Number(volume);
      if (isNaN(volumeValue) || volumeValue < 0 || volumeValue > 1) return;
      // @ts-ignore
      this.volume = volumeValue;
      this.modPlayers.forEach((player, modName) => player.Volume = volumeValue);
    }

    // @ts-ignore
    get Volume() {
      return this.volume;
    }

    /** @param {string} modName */
    async refreshCache(modName) {
      const player = this.modPlayers.get(modName);
      if (player) { player.bufferCache.clear(); await player.refreshAudioKeys(); }
      await this.#refreshAllAudioKeys();
    }

    async #refreshAllAudioKeys() {
      const allKeys = [];
      for (const modName of this.modPlayers.keys()) {
        const keys = await this.idbManager.getModKeys(modName);
        allKeys.push(...keys);
      }
      this.allAudioKeysCache = allKeys;
    }

    async refreshAllCache() {
      for (const player of this.modPlayers.values()) { player.bufferCache.clear(); await player.refreshAudioKeys(); }
      await this.#refreshAllAudioKeys();
    }


    /** @param {string} key @param {any} modName */
    async deleteAudio(key, modName) {
      const success = await this.idbManager.delete(key);
      if (success) {
        const player = this.modPlayers.get(modName);
        if (player) {
          player.bufferCache.delete(key);
          await player.refreshAudioKeys();
        }
        await this.#refreshAllAudioKeys();
        this.log(`已删除音频: ${key}`, 'DEBUG');
      }
      return success;
    }

    /** @param {string} modName */
    async deleteModAudio(modName) {
      const success = await this.idbManager.deleteMod(modName);
      if (success) {
        const player = this.modPlayers.get(modName);
        if (player) {
          player.bufferCache.clear();
          await player.refreshAudioKeys();
        }
        await this.#refreshAllAudioKeys();
        this.log(`已删除模块 ${modName} 的所有音频`, 'DEBUG');
      }
      return success;
    }
  }

  await maplebirch.register('audio', new AudioManager(maplebirch), ['tool']);
})();