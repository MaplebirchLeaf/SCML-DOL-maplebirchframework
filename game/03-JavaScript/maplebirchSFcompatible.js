(() => {
  window.simpleFrameworks = window.simpleFrameworks || {};
  window.maplebirchFrameworks = window.maplebirchFrameworks || {};

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
    'ExtraLinkZone': 'AfterLinkZone'
  };

  const getSystem = (path) => {
    const { maplebirch } = window;
    return path.split('.').reduce((obj, key) => obj?.[key], maplebirch) || null;
  };

  const defineProperty = (name, path) => {
    Object.defineProperty(simpleFrameworks, name, {
      get: () => getSystem(path),
    });
    Object.defineProperty(maplebirchFrameworks, name, {
      get: () => getSystem(path),
    });
  };

  defineProperty('state', 'state');
  defineProperty('tool', 'tool');
  defineProperty('npc', 'npc');
  defineProperty('lang', 'lang');

  const defineMethod = (name, fn) => {
    Object.defineProperty(simpleFrameworks, name, {
      value: fn,
    });
    Object.defineProperty(maplebirchFrameworks, name, {
      value: fn,
    });
  };

  defineMethod('addTimeEvent', function(type, eventId, options) {
    return this.state?.regTimeEvent(type, eventId, options);
  });
  
  defineMethod('addto', function(zone, ...widgets) {
    const mappedZone = zoneMap[zone] || zone;
    return this.tool.framework?.addTo(mappedZone, ...widgets);
  });
  
  defineMethod('onInit', function(...args) {
    return this.tool.framework?.onInit(...args);
  });
  
  defineMethod('addTraits', function(...traits) {
    return this.tool.others?.addTraits(...traits);
  });
  
  defineMethod('addLocation', function(locationId, config, options = {}) {
    return this.tool.others?.configureLocation(locationId, config, options);
  });
  
  defineMethod('addNPC', function(npcData, config, translationsData) {
    return this.npc?.add(npcData, config, translationsData);
  });
  
  defineMethod('addStats', function(statsObject) {
    return this.npc?.addStats(statsObject);
  });
  
  defineMethod('importLang', function(modName) {
    return this.lang?.importAllLanguages(modName);
  });
  
  defineMethod('autoLang', function(sourceText) {
    return this.lang?.autoTranslate(sourceText);
  });
  
  defineMethod('getRandom', function(options) {
    return this.tool.random?.get(options);
  });

  defineMethod('migration', function() {
    return this.tool.migration?.create();
  });
})();