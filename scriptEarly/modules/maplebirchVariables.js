(() => {
  if (!window.maplebirch) {
    console.log('%c[maplebirch] 错误: 核心系统未初始化', 'color: #C62828; font-weight: bold;');
    return;
  }

  const maplebirch = window.maplebirch;
  const currentVersion = '1.0.0';

  class variablesModule {
    static check() {
      if (typeof V.maplebirch !== 'object' || V.maplebirch === null) V.maplebirch = {};
      if (typeof V.maplebirch.language !== 'string') V.maplebirch.language = maplebirch.Language;
      if (!V.options) return;
      if (typeof V.options?.maplebirch !== 'object' || V.options?.maplebirch === null) {
        V.options.maplebirch = maplebirch.tool.clone(variablesModule.options);
      } else {
        const defaultOptions = variablesModule.options;
        for (const key in defaultOptions) if (!(key in V.options.maplebirch)) V.options.maplebirch[key] = maplebirch.tool.clone(defaultOptions[key]);
      }
    }

    static options = {
      modHint: 'disable',
      debug: false,
      sandbox: {
        V: true,
        T: true,
        maplebirch: false,
        window: false
      },
    }

    static audio = {
      playlist: null,
      currentTrack: null,
      currentIndex: -1,
      loopMode: "none",
      currentAudio: null,
      storage: {}
    }

    static time = {
      monthly:  {},
      weekly:   {},
      daily:    {},
      dawn:     {},
    }

    static npc = {
      robin:    {},
      sydney:   {},
      kylar:    {},
      whitney:  {},
      alex:     {},
      vivian:   {},
    }

    static character = {
      carrying:   {},
      attribute:  {}
    }

    static inventory = {
      items: [],
      maxSlots: 5,
      backpack: 'none'
    }

    static location = {
      temple: {},
    }

    static orchard = {
      tendingvars: {},
      FruitSeeds: {
        know: [],
        unlock: [] 
      }
    }

    static combat = {
      sex: {},
    }

    static defaultVar = {
      time:       variablesModule.time,
      npc:        variablesModule.npc,
      character:  variablesModule.character,
      inventory:  variablesModule.inventory,
      location:   variablesModule.location,
      orchard:    variablesModule.orchard,
      combat:     variablesModule.combat,
      audio:      variablesModule.audio,
      player:  {},
      npcList: [],
      enemy:   {},
      effect:  {},
    };
    
    constructor() {
      this.version = currentVersion;
      this.tool = null;
      this.migrationSystem = null;
      this.log = null;
    }

    setupMigrations() {
      if (this.migrationSystem) return;
      this.migrationSystem = this.tool.migration.create();
      this.migrationSystem.add('0.0.0', '1.0.0', (data, utils) => {
        const defaults = this.tool.clone(variablesModule.defaultVar);
        if (!data || Object.keys(data).length === 0 || !data.version || data.version === '0.0.0') {
          Object.assign(data, defaults);
          data.version = '1.0.0';
          return;
        }
        try {
          utils.fill(data, defaults);
        } catch (e) {
          this.log(`迁移合并默认值失败: ${e?.message || e}`, 'ERROR');
        }
        data.version = '1.0.0';
      });
    }

    preInit() { 
      this.tool = maplebirch.tool;
      this.log = this.tool.createLogger('var');
      maplebirch.once(':passageinit', () => variablesModule.check());
      maplebirch.once(':finally', () => variablesModule.check());
      this.setupMigrations();
    }

    Init() {
      if (maplebirch.state.passage.title === 'Start2') {
        V.maplebirch = this.tool.clone({
          ...variablesModule.defaultVar,
          version: this.version
        });
        this.log(`新游戏数据初始化完成 (v${this.version})`, 'DEBUG');
        return;
      }
      try {
        this.migrationSystem.run(V.maplebirch, this.version);
        this.log?.(`存档数据迁移完成 (→ v${this.version})`, 'DEBUG');
      } catch (e) {}
    }

    loadInit() {
      variablesModule.check();
      try {
        this.migrationSystem.run(V.maplebirch, this.version);
        this.log(`读档迁移/修正完成 (→ v${this.version})`, 'DEBUG');
      } catch (e) {
        this.log(`读档迁移出错: ${e?.message || e}`, 'ERROR');
      }
    }

    postInit() {
      if (!V.maplebirch.version || V.maplebirch.version !== this.version) {
        try {
          this.migrationSystem.run(V.maplebirch, this.version);
          this.log(`存档数据修正完成 (→ v${this.version})`, 'DEBUG');
        } catch (e) {
          this.log(`后初始化迁移出错: ${e?.message || e}`, 'ERROR');
        }
      }
    }
  }

  maplebirch.register('var', new variablesModule(), ['tool']);
})();