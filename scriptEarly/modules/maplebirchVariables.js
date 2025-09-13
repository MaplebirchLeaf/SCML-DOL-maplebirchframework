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
      if (typeof V.maplebirch.options !== 'object' || V.maplebirch.options === null) {
        V.maplebirch.options = {...this.constructor.options};
      } else {
        const defaultOptions = this.constructor.options;
        for (const key in defaultOptions) if (!(key in V.maplebirch.options)) V.maplebirch.options[key] = defaultOptions[key]
      }
      if (typeof V.maplebirch.language !== 'string') V.maplebirch.language = maplebirch.language;
    }

    static options = {
      modHint: 'disable',
      debug: false,
      V: true,
      T: true,
      maplebirch: false,
      window: false
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
      player:  {},
      npcList: [],
      enemy:   {},
      effect:  {},
      version: currentVersion,
    };
    
    constructor() {
      this.version = currentVersion;
      this.tool = null;
      this.log = null;
    }
    
    compareVersions(a, b) {
      const aParts = a.split('.').map(Number);
      const bParts = b.split('.').map(Number);
      
      for (let i = 0; i < 3; i++) {
        if (aParts[i] !== bParts[i]) {
          return aParts[i] - bParts[i];
        }
      }
      return 0;
    }

    mergeDefaults() {
      const defaults = variablesModule.defaultVar;
      const target = V.maplebirch;
      
      const merge = (dest, source) => {
        for (const key in source) {
          if (key === 'version') continue;
          
          if (!dest.hasOwnProperty(key)) {
            dest[key] = this.tool.clone(source[key]);
          } else if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
            merge(dest[key], source[key]);
          }
        }
      };
      
      merge(target, defaults);
    }

    addMigrations() {
      const migrationSystem = this.tool.migration.create();
      
      // 添加 0.0.0 -> 1.0.0 的空迁移（初始化）
      migrationSystem.add('0.0.0', '1.0.0', (data, utils) => {
        // 空白迁移，仅用于初始化数据结构，实际迁移逻辑由后面的mergeDefaults处理
      });
      
      migrationSystem.run();
    }

    preInit() { 
      this.tool = maplebirch.tool;
      this.log = this.tool.createLogger('var');
      maplebirch.once(':passageinit',() => variablesModule.check(), 3);
    }

    Init() {
      let isNewGame = false;
      if (maplebirch.state.passage.title === 'Start2') isNewGame = true;
      if (isNewGame) {
        V.maplebirch = this.tool.clone({
          ...variablesModule.defaultVar,
          options: variablesModule.options,
          version: this.version
        });
        this.log(`新游戏数据初始化完成 (v${this.version})`, 'DEBUG');
      } else if (!V.maplebirch.version || V.maplebirch.version !== this.version) {
        this.addMigrations();
        const migrationSystem = maplebirch.tool.migration.create();
        migrationSystem.run(V.maplebirch, this.version);
        this.mergeDefaults();
        this.log(`存档数据迁移完成 (v${V.maplebirch.version} → v${this.version})`, 'DEBUG');
      }
    }

    postInit() {
      if (V.maplebirch.version !== this.version) {
        const migrationSystem = maplebirch.tool.migration.create();
        migrationSystem.run(V.maplebirch, this.version);
        this.mergeDefaults();
        this.log(`存档数据修正完成 (v${V.maplebirch.version} → v${this.version})`, 'DEBUG');
      }
    }
  }

  maplebirch.register('var', new variablesModule(), ['tool']);
})();