(() => {
  const maplebirch = window.maplebirch || {};
  
  const zoneMap = {
    'iModInit': 'Init',
    'iModHeader': 'Header',
    'iModFooter': 'Footer',
    'iModOptions': 'Options',
    'iModSettings': 'Settings',
    'iModCheats': 'Cheats',
    'iModStatus': 'Status',
    'iModFame': 'Fame',
    'iModStatist': 'Statistics',
    'iModExtraStatist': 'ExtraStatistics',
    'iModInformation': 'Information',
    'ExtraLinkZone': 'AfterLinkZone',
    'ModCaptionAfterDescription': 'CaptionAfterDescription',
  };

  const methodPaths = {
    'addLanguage': 'lang.importAllLanguages',       // 导入语言
    'addTimeEvent': 'state.regTimeEvent',           // 添加时间事件
    'timeTravel': 'state.timeTravel',               // 时间旅行
    'addAudio': 'audio.importAllAudio',             // 导入音频
    'getPlayer': 'audio.getPlayer',                 // 获取播放器
    'migration': 'tool.migration.create',           // 创建迁移
    'getRandom': 'tool.random.get',                 // 获取随机值
    'addText': 'tool.text.reg',                     // 注册文本片段
    'addto': 'tool.framework.addTo',                // 添加到区域
    'onInit': 'tool.framework.onInit',              // 初始化回调
    'addTraits': 'tool.other.addTraits',            // 添加特征
    'addLocation': 'tool.other.configureLocation',  // 配置位置
    'addNPC': 'npc.add',                            // 添加NPC
    'addStats': 'npc.addStats',                     // 添加状态 
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
})();