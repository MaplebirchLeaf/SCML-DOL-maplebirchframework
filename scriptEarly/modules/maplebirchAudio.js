(() => {
  if (!window.maplebirch) return;

  const maplebirch = window.maplebirch;

  class AudioManager {
    constructor() {
      this.audioContext = null;
      this.audioBuffers = new Map();
      this.modPlayers = new Map();
      this.initAudioContext();
    }

    initAudioContext() {
      if (this.audioContext) return;
      try {
        this.audioContext = new window.AudioContext();
      } catch (e) {
        maplebirch.log('[AudioManager] AudioContext init failed', 'WARN', e);
      }
    }

    async loadAudio(key, arrayBuffer) {
      if (!this.audioContext) return false;
      if (this.audioBuffers.has(key)) return true;
      
      return new Promise((resolve) => {
        this.audioContext.decodeAudioData(arrayBuffer.slice(0), 
          (buffer) => {
            this.audioBuffers.set(key, buffer);
            resolve(true);
          },
          (error) => {
            maplebirch.log(`[AudioManager] Failed to decode ${key}`, 'WARN', error);
            resolve(false);
          }
        );
      });
    }

    async importAllAudio(modName, audioFolder = 'audio') {
      const modLoader = maplebirch.modLoader;
      if (!modLoader) return false;
      const modZip = modLoader.getModZip(modName);
      if (!modZip || !modZip.zip) return false;
      
      const audioFiles = [];
      modZip.zip.forEach((path, file) => {
        if (path.startsWith(`${audioFolder}/`) && !file.dir) {
          const ext = path.split('.').pop().toLowerCase();
          if (['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(ext)) {
            let key = path.substring(audioFolder.length + 1);
            const lastDotIndex = key.lastIndexOf('.');
            if (lastDotIndex > 0) key = key.substring(0, lastDotIndex);
            audioFiles.push({ path, file, key });
          }
        }
      });
      
      for (const { file, key } of audioFiles) {
        try {
          const arrayBuffer = await file.async('arraybuffer');
          await this.loadAudio(key, arrayBuffer);
        } catch (e) {
          maplebirch.log(`[AudioManager] Failed to load ${key}`, 'WARN', e);
        }
      }
      
      if (!this.modPlayers.has(modName)) {
        this.modPlayers.set(modName, new AudioManager.ModAudioPlayer(this, modName));
      }
      
      return true;
    }

    getPlayer(modName) {
      return this.modPlayers.get(modName) || null;
    }
    
    getModAudioKeys(modName) {
      const player = this.getPlayer(modName);
      return player ? player.audioKeys : [];
    }

    get allAudioKeys() {
      return Array.from(this.audioBuffers.keys());
    }

    preInit() {

    }
  }

  AudioManager.ModAudioPlayer = class {
    constructor(audioManager, modName) {
      this.audioManager = audioManager;
      this.modName = modName;
      this.activeSources = new Map();
      this.pausedStates = new Map();
      this.volume = 1.0;
      this.globalGainNode = null;
      this.loopCounters = new Map();
      this.initGainNode();
    }

    initGainNode() {
      if (!this.audioManager.audioContext) return;
      this.globalGainNode = this.audioManager.audioContext.createGain();
      this.globalGainNode.connect(this.audioManager.audioContext.destination);
      this.globalGainNode.gain.value = this.volume;
    }

    play(key, options = {}) {
      const fullKey = `${this.modName}:${key}`;
      if (!this.audioManager.audioBuffers.has(key)) {
        maplebirch.log(`[AudioPlayer] Audio not found: ${key}`, 'WARN');
        return null;
      }

      if (options.loop) this.loopCounters.set(fullKey, 0);
      if (this.activeSources.has(fullKey)) {
        if (options.allowOverlap) {
          const existingSource = this.activeSources.get(fullKey);
          existingSource.source.stop();
          this.activeSources.delete(fullKey);
        } else {
          return null;
        }
      }
      
      if (options.stopOthers !== false) {
        this.stopAll();
      } else if (!options.allowOverlap) {
        this.stop(key);
      }
      
      const source = this.audioManager.audioContext.createBufferSource();
      source.buffer = this.audioManager.audioBuffers.get(key);
      const gainNode = this.audioManager.audioContext.createGain();
      gainNode.gain.value = options.volume !== undefined ? options.volume : this.volume;
      source.connect(gainNode);
      gainNode.connect(this.globalGainNode);
      const startTime = this.audioManager.audioContext.currentTime;
      source.start(startTime, options.offset, options.duration);
      if (options.loop) {
        source.loop = true;
        if (options.loopStart !== undefined) source.loopStart = options.loopStart;
        if (options.loopEnd !== undefined) source.loopEnd = options.loopEnd;
      }
      
      const audioSource = {
        source,
        gainNode,
        startTime,
        playStartTime: startTime,
        currentOffset: options.offset || 0,
        options,
        loopCounter: 0
      };
      
      this.activeSources.set(fullKey, audioSource);
      source.onended = () => {
        this.activeSources.delete(fullKey);
        this.loopCounters.delete(fullKey);
        if (options.onEnded) options.onEnded();
      };
      
      return audioSource;
    }

    stop(key) {
      const fullKey = `${this.modName}:${key}`;
      const audioSource = this.activeSources.get(fullKey);
      if (audioSource) {
        audioSource.source.stop();
        this.activeSources.delete(fullKey);
        this.loopCounters.delete(fullKey);
      }
      this.pausedStates.delete(fullKey);
    }

    stopAll() {
      this.activeSources.forEach(source => {
        source.source.stop();
        this.loopCounters.delete(`${this.modName}:${source.key}`);
      });
      this.activeSources.clear();
      this.pausedStates.clear();
    }

    setVolume(volume) {
      this.volume = volume;
      if (this.globalGainNode) {
        this.globalGainNode.gain.value = volume;
      }
      this.activeSources.forEach(source => {
        source.gainNode.gain.value = volume;
      });
    }

    setVolumeFor(key, volume) {
      const fullKey = `${this.modName}:${key}`;
      const audioSource = this.activeSources.get(fullKey);
      if (audioSource) {
        audioSource.gainNode.gain.value = volume;
      }
    }

    togglePause(key) {
      const fullKey = `${this.modName}:${key}`;
      if (this.activeSources.has(fullKey)) {
        const audioSource = this.activeSources.get(fullKey);
        const currentTime = this.audioManager.audioContext.currentTime;
        const elapsed = currentTime - audioSource.playStartTime;
        const currentOffset = audioSource.currentOffset + elapsed;
        
        audioSource.source.stop();
        this.activeSources.delete(fullKey);
        this.pausedStates.set(fullKey, {
          offset: currentOffset,
          options: {
            ...audioSource.options,
            loop: audioSource.source.loop,
            loopStart: audioSource.source.loopStart,
            loopEnd: audioSource.source.loopEnd
          }
        });
        
        return { status: 'paused', offset: currentOffset };
      } else if (this.pausedStates.has(fullKey)) {
        const pausedState = this.pausedStates.get(fullKey);
        this.pausedStates.delete(fullKey);
        const audioSource = this.play(key, {
          ...pausedState.options,
          offset: pausedState.offset,
          stopOthers: false
        });
        return { status: 'resumed', audioSource };
      }
      return { status: 'not-found' };
    }

    isPlaying() {
      const playingKeys = [];
      for (const [fullKey] of this.activeSources) {
        const key = fullKey.substring(this.modName.length + 1);
        playingKeys.push(key);
      }
      return playingKeys;
    }
    
    get audioKeys() {
      return Array.from(this.audioManager.audioBuffers.keys());
    }
    
    getDuration(key) {
      const buffer = this.audioManager.audioBuffers.get(key);
      return buffer ? buffer.duration : 0;
    }
    
    setLoopCount(key, count) {
      const fullKey = `${this.modName}:${key}`;
      this.loopCounters.set(fullKey, count);
    }
  };

  maplebirch.register('audio', new AudioManager(), []);
})();