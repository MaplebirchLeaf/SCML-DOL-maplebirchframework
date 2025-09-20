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
    'addTraits': 'tool.other.addTraits',            // 添加特征
    'addLocation': 'tool.other.configureLocation',  // 配置位置
    'addTimeEvent': 'state.regTimeEvent',           // 添加时间事件
    'addNPC': 'npc.add',                            // 添加NPC
    'addStats': 'npc.addStats',                     // 添加状态
    'addto': 'tool.framework.addTo',                // 添加到区域
    'onInit': 'tool.framework.onInit',              // 初始化回调
    'importLang': 'lang.importAllLanguages',        // 导入语言
    'autoLang': 'lang.autoTranslate',               // 自动翻译
    'getRandom': 'tool.random.get',                 // 获取随机值
    'migration': 'tool.migration.create',           // 创建迁移
    'importAudio': 'audio.importAllAudio',          // 导入音频
    'getPlayer': 'audio.getPlayer'                  // 获取播放器
  };

  const createFrameworkProxy = () => new Proxy({}, {
    get: (target, prop) => {
      if (methodPaths[prop]) {
        return (...args) => {
          const path = methodPaths[prop];
          const tool = path.split('.').reduce((obj, key) => obj?.[key], maplebirch);
          if (!tool) return false;
          if (prop === 'addto') {
            const [zoneName, ...restArgs] = args;
            const targetZone = zoneMap[zoneName] || zoneName;
            if (typeof tool === 'function' && maplebirch.tool?.framework) return tool.call(maplebirch.tool.framework, targetZone, ...restArgs);
            return false;
          }
          return tool?.(...args);
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