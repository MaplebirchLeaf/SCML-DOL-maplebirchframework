(() => {
  const frameworkVersion = '2.2.3';
  const lastUpdate = '2025.09.10';
  const lastModifiedBy = '楓樺葉';
  
  const ModuleState = {
    PENDING: 0,    // 等待初始化
    MOUNTED: 1,    // 已挂载/初始化完成
    ERROR: 2       // 初始化失败
  };

  if (window.maplebirch) return;

  // 日志系统 - 提供分级日志记录功能
  class Logger {
    // 日志系统配置
    static LogConfig = {
      DEBUG: { level: 0, tag: '[调试]', style: 'color: #9E9E9E; font-weight: bold;' },
      INFO:  { level: 1, tag: '[信息]', style: 'color: #2E7D32; font-weight: bold;' },
      WARN:  { level: 2, tag: '[警告]', style: 'color: #FF8F00; font-weight: bold;' },
      ERROR: { level: 3, tag: '[错误]', style: 'color: #C62828; font-weight: bold;' }
    };

    // 构建日志级别双向映射
    static LogLevel = (() => {
      const map = {};
      Object.entries(Logger.LogConfig).forEach(([name, config]) => {
        map[name] = config.level;
        map[config.level] = name;
      });
      return map;
    })();

    constructor(core) {
      this.core = core;
      this.level = Logger.LogLevel.INFO; // 初始日志等级
    }

    log(message, levelName = 'INFO', ...objects) {
      const level = Logger.LogLevel[levelName] ?? Logger.LogLevel.INFO;
      if (level < this.level) return;
      const config = Logger.LogConfig[levelName] || Logger.LogConfig.INFO;
      console.log(`%c[maplebirch]${config.tag} ${message}`, config.style);
      if (objects && objects.length > 0) objects.forEach(obj => console.dir(obj));
    }

    setLevel(levelName) {
      levelName = levelName.toUpperCase();
      if (!(levelName in Logger.LogConfig)) {
        this.log(`无效日志级别: ${levelName}`, 'WARN');
        return false;
      }
      
      this.level = Logger.LogLevel[levelName];
      this.log(`日志级别变更为: ${levelName}`, levelName);
      return true;
    }
  }

  // 语言管理器 - 提供多语言支持功能
  class LanguageManager {
    constructor(core) {
      this.core = core;
      this.language = this._detectLanguage();
      this.translations = new Map();
      this.cache = new Map();
      this.db = null;
      this.isPreloaded = false;
    }

    async initDatabase() {
      if (this.db) return;
      try {
        const idbRef = this.core.modUtils.getIdbRef();
        const dbName = 'maplebirch_translations';
        this.db = await idbRef.idb_openDB(dbName, 1, {
          upgrade: (db, oldVersion, newVersion, transaction) => {
            if (!db.objectStoreNames.contains('translations')) {
              const store = db.createObjectStore('translations', { keyPath: 'key' });
              store.createIndex('language', 'language', { multiEntry: true });
            }
            if (!db.objectStoreNames.contains('text_index')) {
              const textStore = db.createObjectStore('text_index', { autoIncrement: true });
              textStore.createIndex('text_value', 'text_value', { unique: false });
              textStore.createIndex('key', 'key', { unique: false });
            }
          }
        });
        
        this.core.logger.log('翻译数据库初始化成功', 'DEBUG');
      } catch (error) {
        this.core.logger.log(`翻译数据库初始化失败: ${error.message}`, 'ERROR');
      }
    }

    _detectLanguage() {
      const lang = V.maplebirch?.language || navigator.language || navigator.userLanguage;
      if (lang.includes('en')) return 'EN';
      if (lang.includes('zh')) return 'CN';
      if (lang.includes('ja')) return 'JP';
      return 'EN';
    }

    setLanguage(lang) {
      this.core.language = lang.toUpperCase();
      this.language = lang.toUpperCase();
      this.cache.clear();
      this.core.logger.log(`语言设置为: ${this.language}`, 'DEBUG');
    }

    async importAllLanguages(modName) {
      const languages = ['EN', 'CN', 'JP'];
      const results = await Promise.all(
        languages.map(lang => 
          this.loadTranslations(
            modName, 
            lang, 
            `translations/${lang.toLowerCase()}.json`
          )
        )
      );
      return results.every(success => success);
    }

    async loadTranslations(modName, languageCode, filePath) {
      if (!this.core.modLoader) {
        this.core.logger.log('Mod加载器未设置', 'ERROR');
        return false;
      }
      
      const modZip = this.core.modLoader.getModZip(modName);
      if (!modZip) {
        this.core.logger.log(`找不到Mod: ${modName}`, 'ERROR');
        return false;
      }
      
      const file = modZip.zip.file(filePath);
      if (!file) {
        this.core.logger.log(`找不到翻译文件: ${modName}/${filePath}`, 'WARN');
        return false;
      }
      
      try {
        const json = await file.async('text');
        const data = JSON.parse(json);
        const batchEntries = [];
        for (const [key, text] of Object.entries(data)) {
          if (!this.translations.has(key)) this.translations.set(key, {});
          this.translations.get(key)[languageCode] = text;
          if (this.db) batchEntries.push({ key, translations: this.translations.get(key) });
        }
        if (batchEntries.length > 0) await this.#storeBatchInDB(batchEntries);
        this.core.logger.log(`加载翻译: ${languageCode} (${Object.keys(data).length} 项)`, 'DEBUG');
        return true;
      } catch (error) {
        this.core.logger.log(`加载失败: ${modName}/${filePath} - ${error.message}`, 'ERROR');
        return false;
      }
    }

    t(key) {
      const translations = this.translations.get(key);
      if (!translations) {
        this.#loadTranslationFromIDB(key);
        return `[${key}]`;
      }
      return translations[this.language] || translations.EN || Object.values(translations)[0] || `[${key}]`;
    }

    autoTranslate(sourceText) {
      if (this.#isCurrentLanguage(sourceText)) return sourceText;
      if (this.cache.has(sourceText)) return this.t(this.cache.get(sourceText));
      for (const [key, translations] of this.translations) {
        for (const lang in translations) {
          if (translations[lang] === sourceText) {
            this.cache.set(sourceText, key);
            return this.t(key);
          }
        }
      }
      this.#findKeyByTextAsync(sourceText);
      return sourceText;
    }

    async preloadAllTranslations() {
      if (!this.db || this.isPreloaded) return;
      try {
        const tx = this.db.transaction('translations', 'readonly');
        const store = tx.objectStore('translations');
        let cursor = await store.openCursor();
        let loadedCount = 0;
        while (cursor) {
          const record = cursor.value;
          this.translations.set(record.key, record.translations);
          loadedCount++;
          cursor = await cursor.continue();
        }
        this.isPreloaded = true;
        this.core.logger.log(`预加载完成: ${loadedCount} 条翻译`, 'INFO');
        this.core.events.trigger(':finally');
      } catch (error) {
        this.core.logger.log(`预加载失败: ${error.message}`, 'ERROR');
      }
    }

    clearCache() {
      this.cache.clear();
      this.core.logger.log('清除翻译缓存', 'DEBUG');
    }

    #isCurrentLanguage(text) {
      if (this.cache.has(text)) {
        const key = this.cache.get(text);
        const translations = this.translations.get(key);
        if (translations && translations[this.language] === text) return true;
      }
      for (const translations of this.translations.values()) {
        if (translations[this.language] === text) return true;
      }
      return false;
    }

    async #loadTranslationFromIDB(key) {
      if (!this.db) return;
      try {
        const tx = this.db.transaction('translations', 'readonly');
        const store = tx.objectStore('translations');
        const record = await store.get(key);
        if (record) this.translations.set(key, record.translations);
      } catch (error) {
        this.core.logger.log(`加载翻译失败: ${key} - ${error.message}`, 'DEBUG');
      }
    }

    async #findKeyByTextAsync(text) {
      if (!this.db) return;
      try {
        const tx = this.db.transaction('text_index', 'readonly');
        const store = tx.objectStore('text_index');
        const index = store.index('text_value');
        const records = await index.getAll(text);
        if (records.length > 0) {
          const key = records[0].key;
          this.cache.set(text, key);
        }
      } catch (error) {
        this.core.logger.log(`查找翻译键失败: ${text} - ${error.message}`, 'DEBUG');
      }
    }

    async #storeBatchInDB(entries) {
      if (!this.db || entries.length === 0) return;
      try {
        const tx = this.db.transaction(['translations', 'text_index'], 'readwrite');
        const translationStore = tx.objectStore('translations');
        const textStore = tx.objectStore('text_index');
        for (const {key, translations} of entries) {
          translationStore.put({ 
            key, 
            translations,
            timestamp: Date.now()
          });
        }
        for (const {key, translations} of entries) {
          const keyIndex = textStore.index('key');
          let cursor = await keyIndex.openCursor(IDBKeyRange.only(key));
          while (cursor) {
            await cursor.delete();
            cursor = await cursor.continue();
          }
          for (const lang in translations) {
            textStore.add({
              text_value: translations[lang],
              key: key,
              language: lang
            });
          }
        }
        await tx.done;
      } catch (error) {
        this.core.logger.log(`批量存储失败: ${error.message}`, 'ERROR');
      }
    }

    async clearDatabase() {
      if (!this.db) return;
      try {
        const idbRef = this.core.modUtils.getIdbRef();
        await idbRef.idb_deleteDB('maplebirch_translations');
        this.core.logger.log('翻译数据库已清空', 'DEBUG');
        this.db = null;
        this.isPreloaded = false;
        this.translations.clear();
        this.cache.clear();
        await this.initDatabase();
      } catch (error) {
        this.core.logger.log(`数据库清空失败: ${error.message}`, 'ERROR');
      }
    }
  }

  // 事件管理器 - 提供事件注册、触发和移除功能
  class EventEmitter {
    static streamConfig = {
      batchSize: 10,
      yieldInterval: 5,
      priorityLevels: 3
    }

    constructor(core) {
      this.core = core;
      
      this.executionQueue = new Map();
      this.isProcessing = new Map();
      
      this.events = {
        ':mousemove':           [], // 移动鼠标
        ':coreReady':           [], // (本)框架核心完成
        ':expectedmodulecount': [], // (本)框架模块就绪
        ':onSave':              [], // 保存
        ':onLoad':              [], // 读档
        ':oncloseoverlay':      [], // 关闭窗口
        ':storyready':          [], // 游戏准备完成(即重载页面末尾)
        ':passageinit':         [], // 段落初始化
        ':passagestart':        [], // 段落开始
        ':passagerender':       [], // 段落渲染
        ':passagedisplay':      [], // 段落显示
        ':passageend':          [], // 段落结束
        ':definewidget':        [], // (本)框架宏定义时机
        ':finally':             [], // 最后时机
      };
    }

    on(eventName, callback, priority = 1, description = '') {
      if (!this.events[eventName]) {
        this.events[eventName] = [];
        this.executionQueue.set(eventName, []);
        this.isProcessing.set(eventName, false);
        this.core.logger.log(`创建新事件类型: ${eventName}`, 'DEBUG');
      }
      
      if (this.events[eventName].some(l => l.callback === callback || (description && l.description === description))) {
        this.core.logger.log(`回调函数已注册: ${eventName} (跳过重复)`, 'DEBUG');
        return false;
      }
      
      const listener = {
        callback,
        description,
        priority: Math.min(Math.max(1, priority), EventEmitter.streamConfig.priorityLevels)
      };
      
      this.events[eventName].push(listener);
      this.events[eventName].sort((a, b) => b.priority - a.priority);
      
      this.core.logger.log(`注册事件监听器: ${eventName} 优先级: ${priority}${description ? ` (描述: ${description})` : ''} (当前: ${this.events[eventName].length})`, 'DEBUG');
      return true;
    }

    off(eventName, identifier) {
      if (!this.events[eventName]) {
        this.core.logger.log(`无效事件名: ${eventName}`, 'WARN');
        return false;
      }
      
      const listeners = this.events[eventName];
      let removed = false;
      
      for (let i = listeners.length - 1; i >= 0; i--) {
        const listener = listeners[i];
        if (
          listener.callback === identifier || 
          listener.description === identifier
        ) {
          listeners.splice(i, 1);
          removed = true;
          this.core.logger.log(`移除事件监听器: ${eventName}${identifier instanceof Function ? ' (函数引用)' : ` (描述: ${identifier})`}`, 'DEBUG');
        }
      }

      if (!removed) {
        this.core.logger.log(`未找到匹配的监听器: ${eventName} (标识符: ${identifier instanceof Function ? '函数引用' : identifier})`, 'DEBUG');
      } else {
        this.core.logger.log(`移除后剩余监听器: ${listeners.length}`, 'DEBUG');
      }
      
      return removed;
    }

    once(eventName, callback, priority = 1, description = '') {
      const onceWrapper = (...args) => {
        callback(...args);
        this.off(eventName, onceWrapper);
      };
      return this.on(eventName, onceWrapper, priority, description);
    }

    trigger(eventName, ...args) {
      if (!this.events[eventName] || this.events[eventName].length === 0) return;
      const queue = this.executionQueue.get(eventName) || [];
      queue.push({ args });
      this.executionQueue.set(eventName, queue);
      if (!this.isProcessing.get(eventName)) this._processQueue(eventName);
    }

    async _processQueue(eventName) {
      this.isProcessing.set(eventName, true);
      const queue = this.executionQueue.get(eventName);
      const listeners = [...this.events[eventName]];
      while (queue.length > 0) {
        const eventData = queue.shift();
        for (let i = 0; i < listeners.length; i += EventEmitter.streamConfig.batchSize) {
          const batch = listeners.slice(i, i + EventEmitter.streamConfig.batchSize);
          await Promise.all(batch.map(listener => {
            return new Promise(resolve => {
              try {
                const result = listener.callback(...eventData.args);
                if (result instanceof Promise) {
                  result.then(resolve).catch(error => {
                    this.core.logger.log(`${eventName}事件处理错误: ${error.message}`, 'ERROR');
                    resolve();
                  });
                } else {
                  resolve();
                }
              } catch (error) {
                this.core.logger.log(`${eventName}事件处理错误: ${error.message}`, 'ERROR');
                resolve();
              }
            });
          }));
          if (EventEmitter.streamConfig.yieldInterval > 0) await new Promise(resolve => setTimeout(resolve, EventEmitter.streamConfig.yieldInterval));
        }
      }
      this.isProcessing.set(eventName, false);
    }
  }

  // 模块管理器 - 提供模块注册、初始化和依赖管理功能
  class ModuleManager {
    static streamConfig = {
      batchSize: 5,
      yieldInterval: 10,
    }

    constructor(core) {
      this.core = core;
      this.registry = {
        modules: new Map(),
        states: new Map(),
        dependencies: new Map(),
        dependents: new Map(),
        allDependencies: new Map(),
        waitingQueue: new Map(),
      };

      this.initPhase = {
        preInitCompleted: false,
        mainInitCompleted: false,
        postInitExecuted: false,
        expectedModuleCount: 99,
        registeredModuleCount: 0,
        allModuleRegisteredTriggered: false
      };
 
      this.preInitialized = new Set();
    }

    async register(name, module, dependencies = []) {
      const reg = this.registry;
      if (reg.modules.has(name)) {
        this.core.logger.log(`模块 ${name} 已注册`, 'WARN');
        return false;
      }

      const moduleDependencies = [...(module.dependencies || []), ...dependencies];
      const allDependencies = new Set();
      const collectDependencies = (depName, visited = new Set()) => {
        if (visited.has(depName)) return;
        visited.add(depName);
        
        if (reg.modules.has(depName)) {
          const depDeps = [...reg.dependencies.get(depName) || []];
          depDeps.forEach(dep => {
            allDependencies.add(dep);
            collectDependencies(dep, visited);
          });
        }
      };
      
      moduleDependencies.forEach(dep => {
        allDependencies.add(dep);
        collectDependencies(dep);
      });
      
      if (this.#detectCircularDependency(name, [...allDependencies])) {
        this.core.logger.log(`模块 ${name} 注册失败: 存在循环依赖`, 'ERROR');
        return false;
      }

      reg.modules.set(name, module);
      reg.states.set(name, ModuleState.PENDING);
      reg.dependencies.set(name, new Set(moduleDependencies));
      reg.allDependencies.set(name, allDependencies);
      
      if (!reg.dependents.has(name)) reg.dependents.set(name, new Set());
      moduleDependencies.forEach(dep => {
        if (!reg.dependents.has(dep)) reg.dependents.set(dep, new Set());
        reg.dependents.get(dep).add(name);
      });

      this.core.logger.log(`注册模块: ${name}, 依赖: [${moduleDependencies.join(', ')}]`, 'DEBUG');
      this.core.logger.log(`传递依赖: [${[...allDependencies].join(', ')}]`, 'DEBUG');
      
      this.initPhase.registeredModuleCount++;
      this._checkModuleRegistration();
      
      if (reg.waitingQueue.has(name)) {
        const waitingModules = [...reg.waitingQueue.get(name)];
        reg.waitingQueue.delete(name);
        waitingModules.forEach(moduleName => {
          if (reg.states.get(moduleName) === ModuleState.PENDING) {
            this.#initModule(moduleName);
          }
        });
      }
      
      return true;
    }

    _checkModuleRegistration() {
      if (this.initPhase.allModuleRegisteredTriggered) return;
      if (this.core.events.events[':expectedmodulecount'].length > 0) {
        this.core.events.trigger(':expectedmodulecount');
        return;
      }
      const { expectedModuleCount, registeredModuleCount } = this.initPhase;
      if (registeredModuleCount >= expectedModuleCount) {
        this.core.logger.log(`模块注册完成 (${registeredModuleCount}/${expectedModuleCount})`, 'DEBUG');
        this.core.events.trigger(':allModuleRegistered');
        this.initPhase.allModuleRegisteredTriggered = true;
      }
    }

    #detectCircularDependency(name, dependencies, path = []) {
      if (path.includes(name)) {
        const cycle = [...path, name].join(' -> ');
        this.core.logger.log(`循环依赖: ${cycle}`, 'ERROR');
        return true;
      }

      const newPath = [...path, name];
      const reg = this.registry;

      for (const dep of dependencies) {
        if (!reg.allDependencies.has(dep)) continue;
        const depDeps = [...reg.allDependencies.get(dep)];
        if (this.#detectCircularDependency(dep, depDeps, newPath)) {
          return true;
        }
      }
      
      return false;
    }

    async #checkDependencies(moduleName, isPreInit = false) {
      const reg = this.registry;
      const dependencies = [...(reg.allDependencies.get(moduleName) || [])];
      
      for (const dep of dependencies) {
        if (!reg.modules.has(dep)) {
          this.core.logger.log(`依赖缺失: ${moduleName} -> ${dep}`, 'DEBUG');
          
          if (!reg.waitingQueue.has(dep)) {
            reg.waitingQueue.set(dep, new Set());
          }
          reg.waitingQueue.get(dep).add(moduleName);
          
          return false;
        }

        if (isPreInit) {
          if (!this.preInitialized.has(dep)) {
            this.core.logger.log(`等待依赖预初始化: ${moduleName} -> ${dep}`, 'DEBUG');
            
            await new Promise(resolve => {
              const check = () => {
                if (this.preInitialized.has(dep)) {
                  resolve();
                } else {
                  setTimeout(check, 10);
                }
              };
              check();
            });
          }
        } else {
          const depState = reg.states.get(dep);
          if (depState !== ModuleState.MOUNTED) {
            this.core.logger.log(`等待依赖就绪: ${moduleName} -> ${dep} (当前状态: ${depState})`, 'DEBUG');
            
            await new Promise(resolve => {
              const check = () => {
                const currentState = reg.states.get(dep);
                if (currentState === ModuleState.MOUNTED || currentState === ModuleState.ERROR) {
                  resolve();
                } else {
                  setTimeout(check, 10);
                }
              };
              check();
            });
            
            if (reg.states.get(dep) === ModuleState.ERROR) {
              this.core.logger.log(`依赖模块错误: ${moduleName} -> ${dep}`, 'ERROR');
              return false;
            }
          }
        }
      }
      
      return true;
    }

    async #initModule(moduleName, isPreInit = false) {
      const reg = this.registry;
      const module = reg.modules.get(moduleName);
      const currentState = reg.states.get(moduleName);
      
      if ([ModuleState.MOUNTED, ModuleState.ERROR].includes(currentState)) return false;
      
      if (currentState === ModuleState.PENDING) {
        reg.states.set(moduleName, ModuleState.PENDING);
      }
      
      const dependenciesReady = await this.#checkDependencies(moduleName, isPreInit);
      if (!dependenciesReady) {
        reg.states.set(moduleName, ModuleState.ERROR);
        this.core.logger.log(`模块 ${moduleName} 初始化失败: 依赖不满足`, 'ERROR');
        return false;
      }

      try {
        const initType = isPreInit ? 'preInit' : 'Init';
        
        if (typeof module[initType] === 'function') {
          const initResult = module[initType]();
          if (initResult instanceof Promise) {
            await initResult;
          }
        }
        
        if (isPreInit) {
          if (this.core.meta.coreModules.includes(moduleName)) {
            this.core[moduleName] = module;
            this.core.logger.log(`[预初始化]核心模块挂载: ${moduleName}`, 'DEBUG');
          }
          this.preInitialized.add(moduleName);
        } else {
          reg.states.set(moduleName, ModuleState.MOUNTED);
          this.core.logger.log(`模块就绪: ${moduleName}`, 'DEBUG');
        }
        
        const dependents = [...(reg.dependents.get(moduleName) || [])];
        await Promise.all(dependents.map(dep => this.#initModule(dep)));
        
        return true;
      } catch (error) {
        this.core.logger.log(`${moduleName} ${isPreInit ? '预' : '主'}初始化失败: ${error.message}`, 'ERROR');
        reg.states.set(moduleName, ModuleState.ERROR);
        
        const dependents = [...(reg.dependents.get(moduleName) || [])];
        dependents.forEach(dep => {
          if (reg.states.get(dep) === ModuleState.PENDING) {
            reg.states.set(dep, ModuleState.ERROR);
          }
        });
        
        return false;
      }
    }

    #getTopologicalOrder() {
      const reg = this.registry;
      const inDegree = new Map();
      const queue = [];
      const result = [];
      
      reg.modules.forEach((_, name) => {
        const deps = reg.dependencies.get(name)?.size || 0;
        inDegree.set(name, deps);
        if (deps === 0) queue.push(name);
      });
      
      while (queue.length) {
        const name = queue.shift();
        result.push(name);
        
        (reg.dependents.get(name) || []).forEach(dependent => {
          const degree = inDegree.get(dependent) - 1;
          inDegree.set(dependent, degree);
          if (degree === 0) queue.push(dependent);
        });
      }
      
      return result;
    }

    getDependencyGraph() {
      const reg = this.registry;
      const graph = {};
      const StateName = {
        0: 'PENDING',
        1: 'MOUNTED',
        2: 'ERROR'
      };
      reg.modules.forEach((_, name) => {
        const stateValue = reg.states.get(name);
        graph[name] = {
          dependencies: Array.from(reg.dependencies.get(name) || []),
          dependents: Array.from(reg.dependents.get(name) || []),
          state: StateName[stateValue] || `UNKNOWN(${stateValue})`,
          allDependencies: Array.from(reg.allDependencies.get(name) || [])
        };
      });
      return graph;
    }
    
    async preInit() {
      if (this.initPhase.preInitCompleted) return;
      
      const reg = this.registry;
      const initOrder = this.#getTopologicalOrder();
      
      for (let i = 0; i < initOrder.length; i += ModuleManager.streamConfig.batchSize) {
        const batch = initOrder.slice(i, i + ModuleManager.streamConfig.batchSize);
        await Promise.all(batch.map(async name => {
          if (this.preInitialized.has(name)) return;
          const module = reg.modules.get(name);
          const dependenciesReady = await this.#checkDependencies(name, true);
          if (!dependenciesReady) return;
          
          try {
            if (typeof module.preInit === 'function') {
              this.core.logger.log(`执行预初始化: ${name}`, 'DEBUG');
              const result = module.preInit();
              if (result instanceof Promise) await result;
            }
            
            if (this.core.meta.coreModules.includes(name)) {
              this.core[name] = module;
              this.core.logger.log(`[预初始化]核心模块挂载: ${name}`, 'DEBUG');
            }
            
            this.preInitialized.add(name);
          } catch (error) {
            this.core.logger.log(`${name} 预初始化失败: ${error.message}`, 'ERROR');
          }
        }));
        await new Promise(resolve => setTimeout(resolve, ModuleManager.streamConfig.yieldInterval));
      }
      
      this.initPhase.preInitCompleted = true;
      this.core.logger.log(`预初始化完成`, 'INFO');
    }

    async init() {
      if (this.initPhase.mainInitCompleted) return;
      
      const initOrder = this.#getTopologicalOrder();

      let currentDepth = 0;
      let currentBatch = [];
      
      for (const name of initOrder) {
        const depth = this.#getModuleDepth(name);
        if (depth > currentDepth && currentBatch.length > 0) {
          await this.#processBatch(currentBatch);
          currentBatch = [];
          currentDepth = depth;
        }
        currentBatch.push(name);
      }
      if (currentBatch.length > 0) await this.#processBatch(currentBatch);
      
      this.initPhase.mainInitCompleted = true;
      this.core.logger.log(`主初始化完成`, 'INFO');
    }

    async postInit() {
      if (this.initPhase.postInitExecuted) return;
      
      this.core.logger.log('执行后初始化', 'DEBUG');
      const reg = this.registry;
      const initOrder = this.#getTopologicalOrder();
      
      for (let i = 0; i < initOrder.length; i += ModuleManager.streamConfig.batchSize) {
        const batch = initOrder.slice(i, i + ModuleManager.streamConfig.batchSize);
        await Promise.all(batch.map(async name => {
          const module = reg.modules.get(name);
          if (reg.states.get(name) !== ModuleState.MOUNTED) {
            this.core.logger.log(`跳过错误状态模块: ${name}`, 'WARN');
            return;
          }
          
          if (typeof module.postInit === 'function') {
            try {
              const result = module.postInit();
              if (result instanceof Promise) await result;
              this.core.logger.log(`[${name}] 后初始化完成`, 'DEBUG');
            } catch (error) {
              this.core.logger.log(`${name} 后初始化失败: ${error.message}`, 'ERROR');
            }
          }
        }));
        await new Promise(resolve => setTimeout(resolve, ModuleManager.streamConfig.yieldInterval));
      }
      
      this.initPhase.postInitExecuted = true;
      this.core.logger.log(`后初始化完成`, 'INFO');
    }

    #getModuleDepth(moduleName) {
      const reg = this.registry;
      const dependencies = reg.dependencies.get(moduleName) || new Set();
      if (dependencies.size === 0) return 0;

      let maxDepth = 0;
      for (const dep of dependencies) {
        const depDepth = this.#getModuleDepth(dep) + 1;
        if (depDepth > maxDepth) maxDepth = depDepth;
      }
      
      return maxDepth;
    }

    async #processBatch(batch) {
      this.core.logger.log(`处理批次: [${batch.join(', ')}]`, 'DEBUG');
      await Promise.all(batch.map(name => this.#initModule(name)));
      await new Promise(resolve => setTimeout(resolve, ModuleManager.streamConfig.yieldInterval));
    }
  }

  // 框架核心类
  class maplebirch {
    static constants = {
      ModuleState,
      LogLevel: Object.fromEntries(Object.entries(Logger.LogConfig).map(([name]) => [name, Logger.LogLevel[name]]))
    }

    static meta = {
      version: frameworkVersion,
      name: 'maplebirch Core',
      author: '楓樺葉',
      modifiedby: lastModifiedBy,
      UpdateDate: lastUpdate,
      availableLanguages: ['EN', 'CN', 'JP'],
    }

    constructor() {
      this.meta = {
        state: ModuleState.PENDING,
        coreModules: ['state', 'tool', 'var', 'npc', 'char'],
        initializedAt: new Date().toLocaleString(),
      };

      this.modList = [];

      this.logger = new Logger(this);
      this.lang = new LanguageManager(this);
      this.events = new EventEmitter(this);
      this.modules = new ModuleManager(this);
      this.modLoader = null;
      this.modUtils = null;

      this.language = this.lang._detectLanguage();
    }

    setModLoader(modLoader,  modUtils) {
      this.modLoader = modLoader;
      this.modUtils = modUtils;
      this.logger.log('Mod加载器已设置', 'DEBUG');
    }

    log(message, levelName = 'INFO', ...objects) {
      this.logger.log(message, levelName, ...objects);
    }
    
    setLogLevel(levelName) {
      return this.logger.setLevel(levelName);
    }
    
    on(eventName, callback, priority = 1, description = '') {
      return this.events.on(eventName, callback, priority, description);
    }
    
    off(eventName, identifier) {
      return this.events.off(eventName, identifier);
    }
    
    once(eventName, callback, priority = 1, description = '') {
      return this.events.once(eventName, callback, priority, description);
    }
    
    trigger(eventName, ...args) {
      this.events.trigger(eventName, ...args);
    }
    
    async register(name, module, dependencies = []) {
      return this.modules.register(name, module, dependencies);
    }
    
    async preInit() {
      return this.modules.preInit();
    }
    
    async init() {
      await this.modules.init();
    }
    
    async postInit() {
      return this.modules.postInit();
    }
    
    get modcount() {
      return this.modules.initPhase.expectedModuleCount;
    }

    setExModCount(count) {
      this.modules.initPhase.expectedModuleCount = count;
      this.logger.log(`设置预期模块数量: ${count}`, 'DEBUG');
      this.modules._checkModuleRegistration();
    }

    get DependencyGraph() {
      return this.modules.getDependencyGraph();
    }
  }

  // 初始化框架核心
  window.maplebirch = new maplebirch();
  const iModcore = window.maplebirch;

  iModcore.once(':coreReady',() => {
    iModcore.log(`核心系统创建完成 (v${maplebirch.meta.version})\n初始化时间: ${iModcore.meta.initializedAt}\n开始设置初始化流程`, 'INFO');
    iModcore.log('初始化内置监听', 'DEBUG');
    $(document).on('mousemove', () => iModcore.trigger(':mousemove'));
    $(document).on(':oncloseoverlay', () => iModcore.trigger(':oncloseoverlay'));
    $(document).on(':passageinit', (ev) => iModcore.trigger(':passageinit' , ev));
    $(document).on(':passagestart', () => iModcore.trigger(':passagestart'));
    $(document).on(':passagerender', () => iModcore.trigger(':passagerender'));
    $(document).on(':passagedisplay', () => iModcore.trigger(':passagedisplay'));
    $(document).on(':passageend', () => iModcore.trigger(':passageend'));
    $(document).on(':storyready', () => iModcore.trigger(':storyready', State.variables));
    iModcore.once(':allModuleRegistered', async () => {
      iModcore.log('所有模块注册完成，开始预初始化', 'INFO');
      const modLoader = window.modSC2DataManager.getModLoader();
      const modUtils = window.modSC2DataManager.getModUtils();
      iModcore.setModLoader(modLoader, modUtils);
      await iModcore.preInit();
      await iModcore.lang.clearDatabase();
      await iModcore.lang.initDatabase();
      await iModcore.lang.importAllLanguages('maplebirch');
      await iModcore.lang.preloadAllTranslations();
    }, 3);
    iModcore.on(':passageinit', async (ev) => {
      const passage = ev.passage;
      if (!passage || passage.tags.includes('widget')) return;
      if (passage.title == 'Start' || passage.title == 'Downgrade Waiting Room') return;
      iModcore.modules.initPhase.postInitExecuted = false;
      if (!iModcore.modules.initPhase.preInitCompleted) return;
      await iModcore.init();
    }, 3);
    iModcore.on(':passagerender', async () => {
      if (!iModcore.modules.initPhase.mainInitCompleted) return;
      await iModcore.postInit();
    }, 3);
    iModcore.once(':storyready' , () => {
      SugarCube.Save.onSave.add(() => iModcore.trigger(':onSave', State.variables));
      SugarCube.Save.onLoad.add(() => iModcore.trigger(':onLoad', State.variables));
    }, 3);

    iModcore.setExModCount(6);  // 预设总模块数量
    iModcore.log('初始化流程设置结束', 'INFO');
  }, 3)
  
  iModcore.trigger(':coreReady');
})();