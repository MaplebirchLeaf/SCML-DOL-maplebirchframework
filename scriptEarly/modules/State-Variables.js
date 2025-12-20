// @ts-check
/// <reference path='../../maplebirch.d.ts' />
(async() => {
  'use strict';
  if (!window.maplebirch) {
    console.log('%c[maplebirch] 错误: 核心系统未初始化', 'color: #C62828; font-weight: bold;');
    return;
  }

  const maplebirch = window.maplebirch;
  const currentVersion = '1.0.4';

  class variablesModule {
    static options = {
      modHint: 'disable',
      debug: false,
      sandbox: {
        V: true,
        T: true,
        maplebirch: false,
        window: false
      },
      npcsidebar: {
        show: false,
        model: false,
        nnpc: false,
        display: {}
      },
      relationcount: 4,
      solarEclipse: true,
      bodywriting: false,
      npcschedules: false
    }

    static audio = {
      playlist: null,
      currentTrack: null,
      currentIndex: -1,
      loopMode: 'none',
      currentAudio: null,
      storage: {}
    }

    static combat = {
      npcList: [],
      enemy:   {},
      sex: {},
    }

    static player = {
      clothing: {}
    }

    static defaultVar = {
      audio:      variablesModule.audio,
      combat:     variablesModule.combat,
      player:     variablesModule.player,
      npc:            {},
      transformation: {},
      wardrobeSearch: '',
    };
    
    /** @param {MaplebirchCore} core */
    constructor(core) {
      this.version = currentVersion;
      this.tool = core.tool;
      this.log = this.tool.createLog('var');
      this.migration = new this.tool.migration();
      core.once(':passageinit', () => this.check());
      core.once(':finally', () => this.check());
    }

    #mapProcessing() {
      Object.defineProperty(V.maplebirch.player, 'clothing', {
        get: () => V.worn,
        set: (val) => maplebirch.log('V.maplebirch.player.clothing 是 V.worn 的只读镜像。请直接修改 V.worn', 'WARN'),
      });
    }

    check() {
      if (typeof V.maplebirch !== 'object' || V.maplebirch === null) V.maplebirch = {};
      if (typeof V.maplebirch.language !== 'string') V.maplebirch.language = maplebirch.Language;
      if (!V.options) return;
      if (typeof V.options?.maplebirch !== 'object' || V.options?.maplebirch === null) {
        V.options.maplebirch = this.tool.clone(variablesModule.options);
      } else {
        /**@type {any}*/const defaultOptions = variablesModule.options;
        for (const key in defaultOptions) if (!(key in V.options.maplebirch)) V.options.maplebirch[key] = this.tool.clone(defaultOptions[key]);
      }
    }

    Init() {
      try {
        if (maplebirch.state.passage.title === 'Start2') {
          V.maplebirch = this.tool.clone({
            ...variablesModule.defaultVar,
            version: this.version
          });
          this.log(`新游戏数据初始化完成 (v${this.version})`, 'DEBUG');
          return;
        }
        this.migration.run(V.maplebirch, this.version);
        $.wiki('<<maplebirchDataInit>>');
        this.log(`存档数据迁移完成 (→ v${this.version})`, 'DEBUG');
      } catch (/**@type {any}*/e) {
        this.log(`出现错误：${e?.message || e}`, 'ERROR');
      }
    }

    loadInit() {
      try {
        this.check();
        this.migration.run(V.maplebirch, this.version);
        $.wiki('<<maplebirchDataInit>>');
        this.log(`读档迁移/修正完成 (→ v${this.version})`, 'DEBUG');
      } catch (/**@type {any}*/e) {
        this.log(`读档迁移出错: ${e?.message || e}`, 'ERROR');
      }
      
    }

    postInit() {
      if (!V.maplebirch?.version || V.maplebirch?.version !== this.version) {
        try {
          this.migration.run(V.maplebirch, this.version);
          this.log(`存档数据修正完成 (→ v${this.version})`, 'DEBUG');
        } catch (/**@type {any}*/e) {
          this.log(`后初始化迁移出错: ${e?.message || e}`, 'ERROR');
        }
      }
      this.#mapProcessing();
    }
  }

  await maplebirch.register('var', new variablesModule(maplebirch), ['tool']);
})();