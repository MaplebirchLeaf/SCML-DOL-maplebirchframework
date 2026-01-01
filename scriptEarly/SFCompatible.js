(async() => {
  'use strict';
  if (!window.maplebirch) return;
  const maplebirch = window.maplebirch;

  const zoneMap = {
    ModStatusBar:   'StatusBar',
    ModMenuBig:     'MenuBig',
    ModMenuSmall:   'ModMenuSmall',
    iModInit:       'Init',
    iModHeader:     'Header',
    iModFooter:     'Footer',
    iModOptions:    'Options',
    iModSettings:   'Settings',
    iModCheats:     'Cheats',
    iModStatus:     'Status',
    iModFame:       'Fame',
    iModStatist:    'Statistics',
    iModReady:      'DataInit',
    iModExtraStatist: 'Statistics',
    iModInformation:  'Information',
    ExtraLinkZone:    'AfterLinkZone',
    ModCaptionAfterDescription: 'CaptionAfterDescription',
  };

  const methodPaths = {
    addLanguage:   'lang.importAllLanguages',     // 导入语言
    addTimeEvent:  'state.regTimeEvent',          // 添加时间事件
    addStateEvent: 'state.regStateEvent',         // 添加状态事件
    timeTravel:    'state.timeTravel',            // 时间旅行
    addAudio:      'audio.importAllAudio',        // 导入音频
    getPlayer:     'audio.getPlayer',             // 获取播放器
    migration:     'tool.migration.create',       // 创建迁移
    addText:       'tool.text.reg',               // 注册文本片段
    addto:         'tool.framework.addTo',        // 添加到区域
    onInit:        'tool.framework.onInit',       // 初始化回调
    addTraits:     'tool.other.addTraits',        // 添加特质
    addLocation:   'tool.other.configureLocation',// 配置位置
    addBodywriting:'tool.other.addBodywriting',   // 添加涂鸦
    addNPC:        'npc.add',                     // 添加NPC
    addStats:      'npc.addStats',                // 添加状态
    addNPCClothes: 'npc.addClothes',              // 添加服装
    addTransform:  'char.transformation.add',     // 添加转化
  };

  const createFrameworkProxy = () => new Proxy({}, {
    get: (target, prop) => {
      if (methodPaths[prop]) {
        return (...args) => {
          const path = methodPaths[prop];
          const pathParts = path.split('.');
          const methodName = pathParts.pop();
          const context = pathParts.reduce((obj, key) => obj?.[key], maplebirch);
          if (!context || typeof context[methodName] !== 'function') return false;
          if (prop === 'addto') {
            const [zoneName, ...restArgs] = args;
            const targetZone = zoneMap[zoneName] || zoneName;
            return context[methodName].call(context, targetZone, ...restArgs);
          }
          return context[methodName].call(context, ...args);
        };
      }
      return maplebirch[prop];
    },
    set: (target, prop, value) => {
      maplebirch[prop] = value;
      return true;
    }
  });

  window.simpleFrameworks = createFrameworkProxy();
  window.maplebirchFrameworks = createFrameworkProxy();

  window.TimeEvent = class {
    constructor(type, eventId) {
      this.type = type;
      this.eventId = eventId;
      this._cond = () => true;
      this._action = () => {};
      this._options = { exact: true };
    }

    Cond(func) {
      this._cond = func;
      return this;
    }

    Action(func) {
      this._action = func;
      this._register();
      return this;
    }

    once(isOnce = true) {
      this._options.once = isOnce;
      return this;
    }

    priority(priority) {
      this._options.priority = priority;
      return this;
    }

    _register() {
      const convertTimeData = (timeData) => ({
        ...timeData,
        prev: timeData.prevDate || timeData.prev,
        current: timeData.currentDate || timeData.current,
        option: {}
      });

      maplebirch.state.regTimeEvent(
        this.type,
        this.eventId,
        {
          cond: (timeData) => this._cond(convertTimeData(timeData)),
          action: (timeData) => this._action(convertTimeData(timeData)),
          ...this._options
        }
      );
    }
  };
})();