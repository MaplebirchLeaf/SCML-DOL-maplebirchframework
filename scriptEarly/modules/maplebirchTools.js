(() => {
  if (!window.maplebirch) {
    console.log('%c[maplebirch] 错误: 核心系统未初始化', 'color: #C62828; font-weight: bold;');
    return;
  }

  const maplebirch = window.maplebirch;

  function log(message, level = 'INFO' , ...objects) {
    maplebirch.log(`[tool] ${message}`, level , ...objects);
  }

  function createLogger(prefix) {
    return (message, level = 'INFO', ...objects) => {
      maplebirch.log(`[${prefix}] ${message}`, level, ...objects);
    };
  }

  /**
   * 通用拷贝函数
   * @param {any} source - 要拷贝的对象
   * @param {Object} [options={}] - 拷贝选项
   * @param {boolean} [options.deep=true] - 是否深拷贝
   * @param {boolean} [options.preservePrototype=true] - 是否保留原型链
   * @param {WeakMap} [map=new WeakMap()] - 内部使用的WeakMap（递归调用）
   * @returns {any} 拷贝后的对象
   */   
  function universalCopy(source, options = {}, map = new WeakMap()) {
    const { deep = true, preservePrototype = true } = options;
    // 1. 处理原始类型值
    if (source === null || typeof source !== 'object') return source;
    
    // 2. 处理循环引用
    if (map.has(source)) return map.get(source);
    
    // 3. 处理特殊对象类型
    if (source instanceof Date) return new Date(source.getTime());
    if (source instanceof RegExp) return new RegExp(source.source, source.flags);
    if (source instanceof Map) {
      const clone = new Map();
      map.set(source, clone);
      source.forEach((value, key) => clone.set(deep ? this.clone(key, options, map) : key, deep ? this.clone(value, options, map) : value));
      return clone;
    }
    if (source instanceof Set) {
      const clone = new Set();
      map.set(source, clone);
      source.forEach(value => clone.add(deep ? this.clone(value, options, map) : value));
      return clone;
    }
    if (ArrayBuffer.isView(source)) return new source.constructor(source.buffer.slice(0), source.byteOffset, source.byteLength);
    if (source instanceof ArrayBuffer) return source.slice(0);
    if (typeof source === 'function') return source;
    
    // 4. 处理数组
    if (Array.isArray(source)) {
      const clone = [];
      map.set(source, clone);
      for (let i = 0; i < source.length; i++) clone[i] = deep ? this.clone(source[i], options, map) : source[i];
      return clone;
    }
    
    // 5. 处理普通对象
    const clone = preservePrototype ? Object.create(Object.getPrototypeOf(source)) : {};
    map.set(source, clone);
    // 获取所有属性（包括Symbol）
    const keys = [...Object.getOwnPropertyNames(source), ...Object.getOwnPropertySymbols(source)];
    
    for (const key of keys) {
      const descriptor = Object.getOwnPropertyDescriptor(source, key);
      if (descriptor && !descriptor.enumerable) continue;
      const value = source[key];
      if (deep) {
        clone[key] = this.clone(value, options, map);
      } else {
        clone[key] = value;
      }
    }
    
    return clone;
  };

  /**
   * 深度比较两个值是否相等
   * 支持基本类型、对象、数组、日期和正则表达式
   * 
   * @param {any} a - 第一个比较值
   * @param {any} b - 第二个比较值
   * @returns {boolean} 是否深度相等
   * 
   * @example
   * // 基本类型比较
   * deepEqual(42, 42); // true
   * 
   * @example
   * // 对象比较
   * const objA = { a: 1, b: { c: 2 } };
   * const objB = { a: 1, b: { c: 2 } };
   * deepEqual(objA, objB); // true
   * 
   * @example
   * // 日期比较
   * const date1 = new Date(2023, 0, 1);
   * const date2 = new Date(2023, 0, 1);
   * deepEqual(date1, date2); // true
   */
  function deepEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return a === b;
    if (typeof a !== 'object' || typeof b !== 'object') return a === b;
    if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
    if (a instanceof RegExp && b instanceof RegExp) return a.source === b.source && a.flags === b.flags;
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++)  if (!deepEqual(a[i], b[i])) return false;
      return true;
    }
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    for (const key of aKeys) {
      if (!bKeys.includes(key)) return false;
      if (!deepEqual(a[key], b[key])) return false;
    }
    return true;
  }

  /**
   * 检查目标数组是否包含指定元素集中的元素
   * 支持多种匹配模式：全部包含、任意包含或都不包含
   * 
   * @param {Array} arr - 要搜索的目标数组
   * @param {Array} elements - 需要检查是否存在的元素数组
   * @param {Object} [options={}] - 配置选项
   * @param {string} [options.mode='all'] - 匹配模式：
   *     'all' = 所有元素都必须存在
   *     'any' = 至少一个元素存在
   *     'none' = 所有元素都不存在
   * @param {boolean} [options.caseSensitive=false] - 是否区分大小写（仅适用于字符串元素）
   * @param {Function} [options.comparator=null] - 自定义比较函数，接收两个参数(arrItem, element)
   *     返回boolean表示是否匹配，默认使用严格相等(===)比较
   * @returns {boolean} 根据匹配模式返回检查结果
   * @throws {Error} 当提供无效的匹配模式时抛出错误
   * @example
   * // 检查所有元素是否存在
   * arrayContains([1, 2, 3], [2, 3]); // true
   * @example
   * // 不区分大小写检查任意元素是否存在
   * arrayContains(['a', 'B'], ['b'], {mode: 'any', caseSensitive: false}); // true
   * @example
   * // 使用自定义比较器
   * const caseInsensitiveCompare = (a, b) => typeof a === 'string' && typeof b === 'string' ? a.toLowerCase() === b.toLowerCase() : a === b;
   * arrayContains(['Hello', 'World'], ['hello'], {comparator: caseInsensitiveCompare}); // true
   */
  function arrayContains(arr, elements, options = {}) {
    const {
      mode = 'all',
      caseSensitive = false,
      comparator = null
    } = options;
    const mainArr = [...arr];
    if (!caseSensitive) {
      for (let i = 0; i < mainArr.length; i++) {
        if (typeof mainArr[i] === 'string') {
          mainArr[i] = mainArr[i].toLowerCase();
        }
      }
    }
    const checkElements = [...elements];
    if (!caseSensitive) {
      for (let i = 0; i < checkElements.length; i++) {
        if (typeof checkElements[i] === 'string') {
          checkElements[i] = checkElements[i].toLowerCase();
        }
      }
    }
    const compare = comparator || ((a, b) => a === b);
    switch (mode) {
      case 'all':
        return checkElements.every(elem => mainArr.some(item => compare(item, elem)));
      case 'any':
        return checkElements.some(elem => mainArr.some(item => compare(item, elem)));
      case 'none':
        return !checkElements.some(elem => mainArr.some(item => compare(item, elem)));
      default:
        throw new Error(`无效的匹配模式: ${mode}`);
    }
  }

  /**
   * 加载图片（支持ModLoader集成）
   * @param {string} src - 图片源路径
   * @returns {Promise<string>} 解析后的图片数据或原始路径
   * 
   * @example
   * loadImageWithModLoader('image.png').then(data => {
   *   console.log('加载的图片数据:', data);
   * });
   */
  async function loadImageWithModLoader(src) {
    try {
      // 检查是否启用了ModLoader系统
      if (typeof window.modSC2DataManager !== 'undefined' && typeof window.modSC2DataManager.getHtmlTagSrcHook?.()?.requestImageBySrc !== 'undefined') {
        // 通过ModLoader请求图片
        const imageData = await window.modSC2DataManager.getHtmlTagSrcHook().requestImageBySrc(src);
        if (imageData) return imageData;
      }
      
      // 回退到原始路径
      return src;
    } catch (error) {
      log(`ModLoader图片加载失败: ${error.message}`, 'ERROR');
      return src;
    }
  }

  // 部件系统 - 用于定义和管理宏部件
  class widgetSystem {
    constructor(logger) {
      this.log = logger || createLogger('widgetSystem');
      this.Macro = null;
      this.statFunctions = {};
      this.macro = [];
    }

    _getMacro(data) {
      if (!data) return false
      this.Macro = data;
      return true
    }

     /**
     * 定义宏（基础版）
     * @param {string} macroName - 宏名称
     * @param {Function} macroFunction - 宏处理函数
     * @param {object} [tags] - 标签配置
     * @param {boolean} [skipArgs] - 是否跳过参数解析
     */
    defineMacro(macroName, macroFunction, tags, skipArgs) {
      if (this.Macro.has(macroName)) {
        this.Macro.delete(macroName);
        this.log(`已删除现有宏: ${macroName}`, 'DEBUG');
      }
      const logger = this.log; 
      this.Macro.add(macroName, {
        isWidget: true,
        tags,
        skipArgs,
        handler() {
          try {
            const oldArgs = State.temporary.args;
            State.temporary.args = this.args.slice();
            macroFunction.apply(this, this.args);
            if (typeof oldArgs === "undefined") {
              delete State.temporary.args;
            } else {
              State.temporary.args = oldArgs;
            }
          } catch (error) {
            logger(`宏执行错误: ${macroName}\n${error}`, 'ERROR');
          }
        },
      });
      const index = this.macro.indexOf(macroName);
      if (index === -1) {
        this.macro.push(macroName);
      } else {
        this.macro[index] = macroName;
      }
      this.log(`已定义/更新宏: ${macroName}`, 'DEBUG');
    }

    /**
     * 定义字符串输出宏（简化版）
     * @param {string} macroName - 宏名称
     * @param {Function} macroFunction - 返回字符串的函数
     * @param {object} [tags] - 标签配置
     * @param {boolean} [skipArgs] - 是否跳过参数解析
     * @param {boolean} [maintainContext] - 是否保持上下文
     */
    defineMacroS(macroName, macroFunction, tags, skipArgs, maintainContext) {
      this.defineMacro(
        macroName,
        function () {$(this.output).wiki(macroFunction.apply(maintainContext ? this : null, this.args));},
        tags,
        skipArgs
      );
    }

    /**
     * 状态变化显示
     * @param {string} statType - 状态类型（如"力量"）
     * @param {number} amount - 变化量
     * @param {string} colorClass - 颜色CSS类名
     * @param {Function} [condition] - 显示条件（默认总是显示）
     * @returns {DocumentFragment} 状态变化元素片段
     */
    statChange(statType, amount, colorClass, condition = () => true) {
      amount = Number(amount);
      if (V?.statdisable === "t" || !condition()) return document.createDocumentFragment();
      const fragment = document.createDocumentFragment();
      const span = document.createElement("span");
      span.className = colorClass;
      const prefix = amount < 0 ? "- " : "+ ";
      span.textContent = `${prefix.repeat(Math.abs(amount))}${statType}`;
      fragment.appendChild(document.createTextNode(" | "));
      fragment.appendChild(span);

      return fragment;
    }
    
    /**
     * 创建状态显示函数
     * @param {string} name - 函数名称
     * @param {Function} fn - 状态显示函数
     */
    create(name, fn) {
      if (this.statFunctions[name] === undefined && !this.Macro.get(name)) {
        this.defineMacro(name, function() {
          this.output.append(fn(...this.args));
        });
        
        this.statFunctions[name] = fn;
        this.log(`已创建状态显示函数: ${name}`, 'DEBUG');
      } else {
        this.log(`已存在名为"${name}"的函数`, 'WARN');
      }
    }
    
    /**
     * 调用状态显示函数
     * @param {string} name - 函数名称
     * @param {...any} args - 函数参数
     * @returns {DocumentFragment} 渲染结果
     */
    callStatFunction(name, ...args) {
      if (this.statFunctions[name]) return this.statFunctions[name](...args);
      this.log(`未找到状态显示函数: ${name}`, 'ERROR');
      return document.createDocumentFragment();
    }
  }

  // 变量迁徙系统 - 用于管理数据迁移和版本控制
  class migrationSystem {
    constructor(logger) {
      this.log = logger;
    }

    create() {
      const migrations = [];
      const utils = {
        /**
         * 解析对象路径
         * @param {Object} obj - 目标对象
         * @param {string} path - 点分隔的路径（如 "a.b.c"）
         * @param {boolean} [createIfMissing=false] - 路径不存在时是否创建
         * @returns {Object|null} 包含父对象和最终键名的对象，或null（路径不存在）
         */
        resolvePath: (obj, path, createIfMissing = false) => {
          const parts = path.split('.');
          let current = obj;
          
          for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (!current[part]) {
              if (createIfMissing) {
                current[part] = {};
              } else {
                return null;
              }
            }
            current = current[part];
          }
          
          return {
            parent: current,
            key: parts[parts.length - 1]
          };
        },
        
        /**
         * 重命名字段
         * @param {Object} data - 目标数据对象
         * @param {string} oldPath - 原字段路径
         * @param {string} newPath - 新字段路径
         * @returns {boolean} 是否成功重命名
         */
        rename: (data, oldPath, newPath) => {
          const source = utils.resolvePath(data, oldPath);
          if (!source || source.parent[source.key] === undefined) return false;
          
          const value = source.parent[source.key];
          delete source.parent[source.key];
          
          const target = utils.resolvePath(data, newPath, true);
          target.parent[target.key] = value;
          return true;
        },
        
        /**
         * 删除字段
         * @param {Object} data - 目标数据对象
         * @param {string} path - 要删除的字段路径
         * @returns {boolean} 是否成功删除
         */
        remove: (data, path) => {
          const target = utils.resolvePath(data, path);
          if (target && target.parent[target.key] !== undefined) {
            delete target.parent[target.key];
            return true;
          }
          return false;
        },
        
        move: (data, oldPath, newPath) => {
          return utils.rename(data, oldPath, newPath);
        },
        
        /**
         * 转换字段值
         * @param {Object} data - 目标数据对象
         * @param {string} path - 字段路径
         * @param {Function} transformer - 值转换函数
         * @returns {boolean} 是否成功转换
         */
        transform: (data, path, transformer) => {
          const target = utils.resolvePath(data, path);
          if (target && target.parent[target.key] !== undefined) {
            target.parent[target.key] = transformer(target.parent[target.key]);
            return true;
          }
          return false;
        }
      };
      
      return Object.freeze({
        /**
         * 添加迁移脚本
         * @param {string} fromVersion - 起始版本
         * @param {string} toVersion - 目标版本
         * @param {Function} migrationFn - 迁移处理函数
         */
        add: (fromVersion, toVersion, migrationFn) => migrations.push({ fromVersion, toVersion, migrationFn }),
        
        /**
         * 执行迁移流程
         * @param {Object} data - 要迁移的数据对象（需包含version字段）
         * @param {string} targetVersion - 目标版本号
         */
        run: (data, targetVersion) => {
          if (!data.version) data.version = '0.0.0'; 
          const currentVersion = data.version;
          if (this.#compareVersions(currentVersion, targetVersion) >= 0) return;
          const applicableMigrations = migrations
            .filter(m => this.#compareVersions(currentVersion, m.fromVersion) < 0 && this.#compareVersions(m.toVersion, targetVersion) <= 0)
            .sort((a, b) => this.#compareVersions(a.toVersion, b.toVersion));
          for (const migration of applicableMigrations) {
            this.log(`迁移数据: ${data.version} → ${migration.toVersion}`);
            migration.migrationFn(data, utils);
            data.version = migration.toVersion;
          }
          if (data.version !== targetVersion) data.version = targetVersion;
        },
        
        utils
      });
    }
    
    /**
     * 比较版本号（内部方法）
     * @private
     * @param {string} a - 版本号A (格式: x.y.z)
     * @param {string} b - 版本号B (格式: x.y.z)
     * @returns {number} 比较结果：负数(a < b), 0(a = b), 正数(a > b)
     */
    #compareVersions(a, b) {
      const aParts = a.split('.').map(Number);
      const bParts = b.split('.').map(Number);
      
      for (let i = 0; i < 3; i++) {
        if (aParts[i] !== bParts[i]) {
          return aParts[i] - bParts[i];
        }
      }
      return 0;
    }
  }

  // 效果系统 - 用于管理和执行各种效果（部件、文本等）
  class effectSystem {
    constructor(logger) {
      this.log = logger;
      this.allArchiveStores = new Map(); // 所有存档的存储
      this.currentSaveId = 'default';    // 当前存档ID
    }
    
    #createNewStores() {
      return {
        widgets: new Map(),   // 部件存储
        texts: new Map(),      // 文本存储
        metadata: new Map(),   // 元数据存储
        cleanups: new Map()    // 清理函数存储
      };
    }
    
    /**
     * 设置当前激活的存档ID
     * @param {string} saveId - 存档ID
     * @returns {string} 设置的存档ID
     */
    setActiveSaveId(saveId) {
      if (!saveId || saveId === 'default') {
        this.currentSaveId = 'default';
        this.log("激活默认存档存储", 'DEBUG');
        return;
      }
      
      if (!this.allArchiveStores.has(saveId)) {
        this.allArchiveStores.set(saveId, this.#createNewStores());
        this.log(`为存档初始化存储: ${saveId}`, 'DEBUG');
      }
      
      if (this.currentSaveId !== saveId) {
        this.log(`切换到存档: ${saveId}`, 'DEBUG');
        this.currentSaveId = saveId;
      }
      
      return saveId;
    }
    
    #getCurrentStores() {
      if (!this.allArchiveStores.has(this.currentSaveId)) {
        this.allArchiveStores.set(this.currentSaveId, this.#createNewStores());
        this.log(`初始化存储: ${this.currentSaveId}`, 'DEBUG');
      }
      return this.allArchiveStores.get(this.currentSaveId);
    }
    
    /**
     * 从存档数据加载效果
     * @param {Object} saveData - 存档数据
     * @returns {number|boolean} 加载的项目数或false（失败时）
     */
    loadFromSave(saveData) {
      if (!saveData) {
        this.log("无存档数据可加载", 'DEBUG');
        return false;
      }
      
      const stores = this.#getCurrentStores();
      let loadedCount = 0;
      
      try {
        if (saveData.widgets) {
          Object.entries(saveData.widgets).forEach(([id, widget]) => {
            stores.widgets.set(id, widget);
            loadedCount++;
          });
        }
        
        if (saveData.texts) {
          Object.entries(saveData.texts).forEach(([id, text]) => {
            stores.texts.set(id, text);
            loadedCount++;
          });
        }
        
        if (saveData.metadata) {
          Object.entries(saveData.metadata).forEach(([id, meta]) => {
            stores.metadata.set(id, meta);
          });
        }
        
        this.log(`从存档加载 ${loadedCount} 个项目 (${this.currentSaveId})`, 'DEBUG');
        return loadedCount;
      } catch (error) {
        this.log(`存档数据加载失败: ${error.message}`, 'ERROR');
        return false;
      }
    }
    
    saveToCurrentArchive() {
      if (this.currentSaveId === 'default') {
        this.log("跳过默认存档保存", 'DEBUG');
        return null;
      }
      
      const stores = this.#getCurrentStores();
      const saveData = {
        widgets: {},
        texts: {},
        metadata: {}
      };
      
      let savedCount = 0;
      
      stores.widgets.forEach((widget, id) => {
        if (Array.isArray(widget)) {
          saveData.widgets[id] = widget;
          savedCount++;
        }
      });
      
      stores.texts.forEach((text, id) => {
        if (Array.isArray(text) || typeof text === 'string' || 
            (typeof text === 'object' && text !== null)) {
          saveData.texts[id] = text;
          savedCount++;
        }
      });
      
      stores.metadata.forEach((meta, id) => {
        const serializableMeta = {};
        for (const [key, value] of Object.entries(meta)) {
          if (typeof value !== 'function' && typeof value !== 'symbol') {
            serializableMeta[key] = value;
          }
        }
        saveData.metadata[id] = serializableMeta;
      });
      
      this.log(`保存 ${savedCount} 个项目到存档: ${this.currentSaveId}`, 'DEBUG');
      return saveData;
    }
    
    /**
     * 注册项目（内部方法）
     * @private
     * @param {string} type - 项目类型（'widget'或'text'）
     * @param {string} id - 项目ID
     * @param {*} item - 项目内容
     * @param {Function} [cleanup] - 清理函数
     * @param {Object} [meta] - 元数据
     * @returns {string|boolean} 注册ID或false（失败时）
     */
    #registerItem(type, id, item, cleanup, meta) {
      const stores = this.#getCurrentStores();
      
      if (type === 'widget' && typeof item === 'function') {
        stores.widgets.set(id, item);
        stores.metadata.set(id, { 
          type,
          created: Date.now(),
          ...meta 
        });
        
        if (typeof cleanup === 'function') {
          stores.cleanups.set(id, cleanup);
        }
        
        this.log(`注册函数部件: ${id}`, 'DEBUG');
        return id;
      }
      
      if (!item || (typeof item !== 'object' && !Array.isArray(item))) {
        this.log(`注册失败: 无效的 ${type} 项目 (ID: ${id})`, 'ERROR');
        return false;
      }
      
      stores[type === 'widget' ? 'widgets' : 'texts'].set(id, item);
      stores.metadata.set(id, { 
        type,
        created: Date.now(),
        ...meta 
      });
      
      if (typeof cleanup === 'function') {
        stores.cleanups.set(id, cleanup);
      }
      
      this.log(`注册 ${type}: ${id}`, 'DEBUG');
      return id;
    }
    
    /**
     * 注销项目
     * @param {string} id - 要注销的项目ID
     * @returns {boolean} 是否成功注销
     */
    unregister(id) {
      const stores = this.#getCurrentStores();
      if (!stores.metadata.has(id)) {
        this.log(`注销失败: ID ${id} 不存在`, 'WARN');
        return false;
      }
      
      if (stores.cleanups.has(id)) {
        try {
          this.log(`执行清理函数: ${id}`, 'DEBUG');
          stores.cleanups.get(id)();
        } catch(e) {
          this.log(`清理函数 ${id} 错误: ${e.message}`, 'ERROR');
        }
        stores.cleanups.delete(id);
      }
      
      stores.widgets.delete(id);
      stores.texts.delete(id);
      stores.metadata.delete(id);
      
      this.log(`已注销: ${id}`, 'DEBUG');
      return true;
    }
    
    #processResults() {
      const stores = this.#getCurrentStores();
      const results = [];
      let widgetCount = 0;
      let textCount = 0;
      
      stores.widgets.forEach((widget, id) => {
        if (typeof widget === 'function') {
          results.push({
            type: 'function',
            id,
            func: widget
          });
          widgetCount++;
        } else if (Array.isArray(widget)) {
          results.push({
            type: 'widget',
            id,
            command: widget[0],
            args: widget.slice(1)
          });
          widgetCount += widget.length;
        }
      });
      
      stores.texts.forEach((text, id) => {
        if (Array.isArray(text)) {
          const textItems = text.map(t => ({
            type: 'text',
            id,
            style: t.style || "span",
            text: t.text,
            colour: t.colour
          }));
          results.push(...textItems);
          textCount += text.length;
        } else if (typeof text === 'object' && text !== null) {
          results.push({
            type: 'text',
            id,
            style: text.style || "span",
            text: text.text,
            colour: text.colour
          });
          textCount++;
        }
      });
      
      if (results.length > 0) {
        this.log(`生成 ${results.length} 个结果 (部件: ${widgetCount}, 文本: ${textCount})`, 'DEBUG');
        return results;
      }
      
      return null;
    }
    
    /**
     * 执行所有效果
     * @param {Object} [context={}] - 执行上下文
     * @param {Function} [context.element] - 创建元素的函数
     * @param {HTMLElement} [context.container] - 文本容器
     * @param {Function} [context.wikifier] - wikifier函数
     */
    executeEffects(context = {}) {
      const stores = this.#getCurrentStores();
      const results = this.#processResults();
      
      if (!results) {
        this.log("没有效果需要执行", 'DEBUG');
        return;
      }

      let textCount = 0;
      let widgetCount = 0;
      let functionCount = 0;
      
      results.forEach(effect => {
        try {
          switch (effect.type) {
            case 'function':
              effect.func();
              functionCount++;
              break;
              
            case 'text':
              const { style, text, colour } = effect;
              if (context.element) {
                context.element(style, text, colour);
              } else {
                const el = document.createElement(style);
                if (colour) el.classList.add(colour);
                el.textContent = text;
                if (context.container) context.container.appendChild(el);
              }
              textCount++;
              break;
              
            case 'widget':
              const { command, args } = effect;
              if (context.wikifier) {
                context.wikifier(command, ...args);
                widgetCount++;
              }
              break;
          }
        } catch (e) {
          this.log(`执行效果时出错 (${effect.id}): ${e.message}`, 'ERROR');
        }
      });
      
      this.log(`执行效果: 函数 ${functionCount}, 部件 ${widgetCount}, 文本 ${textCount}`, 'DEBUG');

      const toRemove = [];
      stores.metadata.forEach((meta, id) => {
        if (!(meta.persistent || meta.keepAlive)) {
          toRemove.push(id);
        }
      });
      
      if (toRemove.length > 0) {
        this.log(`清理 ${toRemove.length} 个非持久化效果`, 'DEBUG');
        toRemove.forEach(id => this.unregister(id));
      }
    }

    cleanup() {
      const stores = this.#getCurrentStores();
      this.log(`执行 ${stores.cleanups.size} 个清理函数`, 'DEBUG');
      
      stores.cleanups.forEach((cleanup, id) => {
        try {
          cleanup();
        } catch(e) {
          this.log(`清理函数 ${id} 错误: ${e.message}`, 'ERROR');
        }
      });
      
      stores.cleanups.clear();
    }

    reset() {
      const stores = this.#getCurrentStores();
      this.log("重置效果系统", 'DEBUG');
      this.cleanup();
      stores.widgets.clear();
      stores.texts.clear();
      stores.metadata.clear();
    }
    
    debug() {
      const stores = this.#getCurrentStores();
      const output = [];
      
      output.push(`=== 效果系统状态 (${this.currentSaveId}) ===`);
      output.push(`注册项目总数: ${stores.metadata.size}`);
      output.push(`持久化项目: ${Array.from(stores.metadata.values()).filter(m => m.persistent).length}`);
      output.push(`清理函数: ${stores.cleanups.size}`);
      output.push("\n--- 所有注册项目 ---");
      
      stores.metadata.forEach((meta, id) => {
        const entry = [
          `ID: ${id}`,
          `类型: ${meta.type}`,
          `创建时间: ${new Date(meta.created).toLocaleTimeString()}`,
          `持久化: ${meta.persistent ? '是' : '否'}`,
          `描述: ${meta.description || '无'}`
        ];
        output.push(entry.join(" | "));
      });
      
      output.push("\n--- 状态统计 ---");
      const types = {
        widget: { count: 0 },
        text: { count: 0 }
      };
      
      stores.metadata.forEach(meta => {
        types[meta.type].count++;
      });
      
      output.push(`部件: ${types.widget.count} 个`);
      output.push(`文本: ${types.text.count} 个`);
      
      if (maplebirch && typeof maplebirch.log === 'function') {
        output.forEach(line => maplebirch.log(line, 'DEBUG'));
      } else {
        output.forEach(line => console.log(line));
      }
      
      return output;
    }
    
    registerWidget = (id, widget, cleanup, meta) => this.#registerItem('widget', id, widget, cleanup, meta);
    registerText = (id, text, cleanup, meta) => this.#registerItem('text', id, text, cleanup, meta);
    
    get widgetList() {
      const stores = this.#getCurrentStores();
      return Array.from(stores.widgets, ([id]) => ({
        id,
        type: 'widget',
        ...(stores.metadata.get(id) || {})
      }));
    }
    
    get textList() {
      const stores = this.#getCurrentStores();
      return Array.from(stores.texts, ([id]) => ({
        id,
        type: 'text',
        ...(stores.metadata.get(id) || {})
      }));
    }
    
    get allItems() {
      return [...this.widgetList, ...this.textList];
    }
    
    save = this.saveToCurrentArchive.bind(this);
    load = this.loadFromSave.bind(this);
    getAllResults = this.#processResults.bind(this);
  }

  // 随机数生成系统 - 提供伪随机数生成和状态管理
  class randomSystem {
    constructor(logger) {
      this.log = logger; // 带[random]前缀的日志函数
      this.state = {
        seed: null,        // 当前种子值
        a: 1664525,       // LCG乘数
        c: 1013904223,     // LCG增量
        m: 0x100000000,   // 模数 (2^32)
        callCount: 0,      // 调用计数器
        history: []        // 历史记录
      };
    }
    
    #initSeed() {
      const timeSeed = Date.now();
      const randomSeed = Math.floor(Math.random() * 0xFFFFFF);
      this.state.seed = (timeSeed ^ randomSeed) >>> 0; // 保证32位无符号整数
      this.state.callCount = 0;
      this.state.history = [];
      this.log(`随机种子初始化: ${this.state.seed}`, 'DEBUG');
    }
    
    /**
     * 生成随机数（内部方法）
     * @private
     * @param {*} [options] - 随机数选项
     * @returns {number} 生成的随机数
     */
    #generate(options) {
      if (this.state.seed === null) {
        this.#initSeed();
      }

      this.state.seed = (this.state.a * this.state.seed + this.state.c) % this.state.m;
      const randomValue = this.state.seed / this.state.m; // 转换为[0,1)范围
      this.state.callCount++;
      
      let result;
      let details = { type: "default" };
      
      // 根据选项处理不同生成模式
      if (typeof options === 'undefined') {
        // 默认: 1-100的整数
        result = Math.floor(randomValue * 100) + 1;
        details = { min: 1, max: 100, float: false };
      } 
      else if (typeof options === 'number') {
        // 指定上限的整数
        result = Math.floor(randomValue * options);
        details = { min: 0, max: options - 1, float: false };
      } 
      else if (Array.isArray(options)) {
        // 从数组中随机选择
        result = options[Math.floor(randomValue * options.length)];
        details = { type: "array", length: options.length };
      } 
      else if (typeof options === 'object') {
        // 范围随机数（整数或浮点数）
        const min = options.min || 0;
        const max = options.max || (options.min ? options.min + 1 : 100);
        const float = !!options.float;
        
        if (float) {
          result = randomValue * (max - min) + min;
          details = { min, max, float: true };
        } else {
          result = Math.floor(randomValue * (max - min + 1)) + min;
          details = { min, max, float: false };
        }
      } else {
        result = Math.floor(randomValue * 100) + 1;
        details = { error: "Invalid options", value: options };
      }
      
      this.state.history.push({
        call: this.state.callCount,
        value: result,
        seed: this.state.seed,
        options: details
      });
      if (this.state.history.length > 50) this.state.history.shift();
      
      if (typeof V.maplebirch !== 'object') V.maplebirch = {};
      if (V.maplebirch) V.maplebirch.rng = result;
      
      return result;
    }
    
    /**
     * 获取随机数
     * @param {*} [options] - 随机数选项
     * @returns {number} 生成的随机数
     * 
     * @example
     * random.get(); // 1-100之间的随机整数
     * random.get(10); // 0-9之间的随机整数
     * random.get({min:5, max:10}); // 5-10之间的随机整数
     * random.get({min:1, max:5, float:true}); // 1-5之间的随机浮点数
     * random.get(['a','b','c']); // 随机选择数组元素
     */
    get(options) {
      return this.#generate(options);
    }
    
    setSeed(newSeed) {
      const parsedSeed = parseInt(newSeed);
      
      if (isNaN(parsedSeed)) {
        this.log(`设置种子失败: 无效的种子值 ${newSeed}`, 'WARN');
        return false;
      }
      
      this.state.seed = parsedSeed >>> 0; // 转换为32位无符号整数
      this.state.callCount = 0;
      this.state.history = [];
      this.log(`种子已设置为: ${this.state.seed}`, 'DEBUG');
      return true;
    }
    
    getSeed() {
      return this.state.seed;
    }
    
    getState() {
      return {
        seed: this.state.seed,
        callCount: this.state.callCount,
        nextSeed: this.state.seed ? (this.state.a * this.state.seed + this.state.c) % this.state.m : null,
        history: [...this.state.history]
      };
    }
    
    reset() {
      this.#initSeed();
      return this.getState();
    }
    
    debug() {
      const output = [
        `随机系统状态:`,
        `- 当前种子: ${this.state.seed || "未初始化"}`,
        `- 调用次数: ${this.state.callCount}`,
        `- 历史记录: ${this.state.history.length} 条`,
        `- 下一个种子: ${this.state.seed ? (this.state.a * this.state.seed + this.state.c) % this.state.m : "N/A"}`
      ];
      
      if (this.state.history.length > 0) {
        output.push("\n最近5次调用:");
        this.state.history.slice(-5).forEach(entry => {
          output.push(`#${entry.call}: ${entry.value} (种子: ${entry.seed})`);
        });
      }
      
      return output.join("\n");
    }
  }

  // 模块提示系统 - 用于显示和搜索模块提示信息
  class modhintSystem {
    constructor(logger) {
      this.log = logger || createLogger('modhint');;
    }
    
    #insertBefore(newElement, targetElement) {
      if (targetElement && targetElement.parentNode) {
        targetElement.parentNode.insertBefore(newElement, targetElement);
      }
    }
    
    hintClicked() {
      if (window.$ && window.$.wiki) {
        $.wiki('<<maplebirchReplace "maplebirchModHint" "title">>');
      } else {
        const overlay = document.getElementById("maplebirchModHint");
        if (overlay) overlay.style.display = "block";
      }
    }
    
    searchButtonClicked() {
      this.clearButtonClicked();
      
      const value = T.maplebirchModHintTextbox;
      if (!value || value.trim() === "") return;
      
      const keyword = value.trim();
      const contentEl = document.getElementById("maplebirchModHintContent");
      if (!contentEl) return;
      
      const regex = new RegExp(keyword, 'gi');
      const originalHtml = contentEl.innerHTML;
      
      const highlightedHtml = originalHtml.replace(
        regex, 
        match => `<span class="gold searchResult">${match}</span>`
      );
      
      contentEl.innerHTML = highlightedHtml;
      
      const results = contentEl.getElementsByClassName('searchResult');
      if (results.length > 0) {
        results[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        const noResultEl = document.createElement('div');
        noResultEl.style.color = "gold";
        noResultEl.style.marginTop = "10px";
        noResultEl.id = "noSearchResult";
        noResultEl.textContent = "无结果";
        this.#insertBefore(noResultEl, contentEl);
      }
    }
    
    clearButtonClicked() {
      const noResultEl = document.getElementById("noSearchResult");
      if (noResultEl) noResultEl.remove();
      
      const contentEl = document.getElementById("maplebirchModHintContent");
      if (contentEl) {
        const results = contentEl.querySelectorAll('.searchResult');
        results.forEach(el => {
          const parent = el.parentNode;
          
          while (el.firstChild) {
            parent.insertBefore(el.firstChild, el);
          }

          parent.removeChild(el);
        });
      }
    }
  }

  class consoleTools {
    constructor(logger, allowedObjects = ['V', 'T']) {
      this.log = logger || this.createLogger('console');
      this.globalNamespace = {};
      this.allowedObjects = new Set(allowedObjects);
      this.fullAccess = false;
    }

    enableFullAccess() {
      this.fullAccess = true;
      this.log('已启用完全权限模式 - 开放所有 window 权限', 'WARN');
      return true;
    }
    
    disableFullAccess() {
      this.fullAccess = false;
      this.log('已禁用完全权限模式', 'INFO');
      return true;
    }
    
    allowObject(objectName) {
      if (typeof objectName === 'string') {
        if (this.allowedObjects.has(objectName)) {
          this.log(`对象 ${objectName} 已存在权限列表中`, 'WARN');
          return false;
        }
        this.allowedObjects.add(objectName);
        this.log(`已添加对象权限: ${objectName}`, 'INFO');
        return true;
      }
      return false;
    }
    
    disallowObject(objectName) {
      if (this.allowedObjects.has(objectName)) {
        this.allowedObjects.delete(objectName);
        this.log(`已移除对象权限: ${objectName}`, 'INFO');
        return true;
      }
      this.log(`对象 ${objectName} 不在权限列表中`, 'WARN');
      return false;
    }
    
    setAllowedObjects(objects) {
      if (Array.isArray(objects)) {
        this.allowedObjects = new Set(objects);
        this.log(`已设置对象权限: ${Array.from(this.allowedObjects).join(', ')}`, 'INFO');
        return true;
      }
      return false;
    }

    #executeJS() {
      let result;
      const code = T.maplebirchJSCheatConsole;
      const statusElement = $('#js-cheat-console-status');
      statusElement.empty().removeClass('success error visible');
      if (typeof code !== 'string' || code.trim() === '') {
        this.log('执行失败：请输入有效的 JavaScript 代码', 'ERROR');
        this.#updateJSStatus('执行失败：请输入有效的 JavaScript 代码', false);
        return { success: false, error: '请输入有效的 JavaScript 代码' };
      }
      try {
        result = this.#executeJSCode(code);
        if (result instanceof Error) throw result;
        const hasExplicitReturn = /\breturn\b\s*[^;]*;?$|return;/.test(code);
        const message = hasExplicitReturn ? `执行成功 → ${this.#formatResult(result)}` : '代码已执行';
        this.log('JS代码执行成功', 'INFO', result);
        this.#updateJSStatus(message, true);
        return { 
          success: true, 
          result: result,
          message: message,
          globals: this.globalNamespace
        };
      } catch (error) {
        const errorMsg = error.message || '未知错误';
        const message = `执行错误 → ${errorMsg}`;
        this.log('执行失败', 'ERROR', error);
        this.#updateJSStatus(message, false);
        return {
          success: false,
          error: errorMsg,
          message: message
        };
      }
    }

    #updateJSStatus(message, isSuccess) {
      const statusElement = $('#js-cheat-console-status');
      statusElement.text(message);
      statusElement.removeClass('success error visible');
      statusElement.addClass(isSuccess ? 'success visible' : 'error visible');
    }
    
    #executeJSCode(code) {
      const sandbox = {
        Math: Object.freeze(Math),
        JSON: Object.freeze(JSON),
        Date: Object.freeze(Date),
        String: Object.freeze(String),
        Number: Object.freeze(Number),
        Array: Object.freeze(Array),
        Object: Object.freeze(Object),
        global: this.globalNamespace,
      };
      
      for (const objName of this.allowedObjects) {
        if (window[objName] !== undefined) {
          sandbox[objName] = window[objName];
        } else {
          this.log(`对象 ${objName} 在全局作用域中不存在`, 'WARN');
        }
      }
      Object.freeze(Object.prototype);
      Object.freeze(Array.prototype);
      Object.freeze(Function.prototype);
      Object.freeze(Number.prototype);
      Object.freeze(String.prototype);
      Object.freeze(Date.prototype);
      const sandboxProxy = new Proxy(sandbox, {
        has: () => true,
        get: (target, prop) => {
          if (prop === Symbol.unscopables) return undefined;
          if (prop in target) return target[prop];
          if (this.fullAccess && prop in window) return window[prop];
          if (this.allowedObjects.has(prop) && prop in window) return window[prop];
          throw new ReferenceError(`对象 '${prop}' 未授权访问 - 权限不足`);
        },
        set: (target, prop, value) => {
          const canWrite = (obj, prop) => {
            const descriptor = Object.getOwnPropertyDescriptor(obj, prop);
            if (!descriptor) return true;
            if (descriptor.writable === false) return false;
            return true;
          };
          if (this.fullAccess && prop in window && canWrite(window, prop)) {
            window[prop] = value;
            return true;
          }
          if (this.allowedObjects.has(prop) && prop in window && canWrite(window, prop)) {
            window[prop] = value;
            return true;
          }
          if (prop === 'global') throw new Error('不能覆盖 global 命名空间');
          if (prop in sandbox && prop !== 'global') throw new Error(`修改 ${prop} 被禁止`);
          if (prop in window) {
            throw new Error(`修改 '${prop}' 被禁止 - 权限不足`);
          }
          target[prop] = value;
          return true;
        }
      });
      const wrappedCode = `"use strict";try {${code}} catch(e) {return e;}`;
      try {
        const executor = new Function('sandbox', `with(sandbox) {return (function() {${wrappedCode}})();}`);
        return executor(sandboxProxy);
      } catch (error) {
        return error;
      }
    }

    #formatResult(result) {
      if (result === null) return 'null';
      if (result === undefined) return 'undefined';
      if (typeof result === 'function') return 'function';
      try {
        return JSON.stringify(result, null, 2);
      } catch {
        return String(result);
      }
    }

    #executeTwine() {
      const code = T.maplebirchTwineCheatConsole;
      const statusElement = $('#twine-cheat-console-status');
      statusElement.empty().removeClass('success error visible');
      if (typeof code !== 'string' || code.trim() === '') {
        this.log('执行失败：请输入有效的Twine代码', 'ERROR');
        this.#updateTwineStatus('执行失败：请输入有效的Twine代码', false);
        return { success: false, error: '请输入有效的Twine代码' };
      }
      try {
        const linkMatch = code.match(/<<link\s+(["'])([^"']+)\1\s+(["'])([^"']+)\3\s*>>\s*<<\/link>>/);
        if (linkMatch) {
          const linkText = linkMatch[2];
          const passage = linkMatch[4];
          const $temp = $('<div>').appendTo(document.body).hide();
          $.wiki(code, $temp);
          $temp.remove();
          this.log(`导航到段落: ${passage}`, 'INFO');
          this.#updateTwineStatus(`正在导航到: ${passage}...`, true);
          setTimeout(() => {
            try {
              if (SugarCube.Engine?.play) {
                SugarCube.Engine.play(passage);
              } else if (SugarCube.Story?.show) {
                SugarCube.Story.show(passage);
              } else {
                throw new Error('导航API不可用');
              }
            } catch (err) {
              console.error('导航失败:', err);
              this.#updateTwineStatus(`导航失败: ${err.message}`, false);
            }
          }, 600);
          
          return { 
            success: true, 
            message: `导航到: ${passage}`
          };
        }
        
        const $temp = $('<div>').appendTo(document.body).hide();
        $.wiki(code, $temp);
        $temp.remove();
        this.#updateTwineStatus('执行成功', true);
        this.log('Twine代码执行成功', 'INFO');
        return { 
          success: true, 
          message: '代码执行成功'
        };
      } catch (error) {
        const errorMsg = error.message || '未知错误';
        this.#updateTwineStatus(`执行错误: ${errorMsg}`, false);
        this.log('Twine代码执行失败', 'ERROR', error);
        return {
          success: false,
          error: errorMsg,
          message: `执行错误: ${errorMsg}`
        };
      }
    }

    #updateTwineStatus(message, isSuccess) {
      const statusElement = $('#twine-cheat-console-status');
      statusElement.text(message);
      statusElement.removeClass('success error visible');
      statusElement.addClass(isSuccess ? 'success visible' : 'error visible');
    }
    
    execute(type) {
      if (type === 'javascript') {
        return this.#executeJS();
      } else if (type === 'twine') {
        return this.#executeTwine();
      } else {
        this.log(`未知执行类型: ${type}`, 'ERROR');
        return {
          success: false,
          error: `未知执行类型: ${type}`
        };
      }
    }
  }

  // 框架系统 - 用于管理和渲染各种框架部件
  class frameworks {
    constructor(logger) {
      this.log = logger || createLogger('framework');

      this.data = {
        Init                    : [], // 初始化脚本-静态变量(如setup)
        Header                  : [], // 页眉
        Footer                  : [], // 页脚
        Information             : [], // 信息栏
        Options                 : [], // 选项栏
        Cheats                  : [], // 作弊栏
        Statistics              : [], // 统计栏
        Journal                 : [], // 日志尾部

        BeforeLinkZone          : [], // 链接前区域
        AfterLinkZone           : [], // 链接后区域

        CaptionDescription      : [], // 标题描述
        StatusBar               : [], // 状态栏
        MenuBig                 : [], // 大菜单
        MenuSmall               : [], // 小菜单
        CaptionAfterDescription : [], // 标题描述后
        HintMobile              : [], // 移动端图标(即疼痛上方)
        StatsMobile             : [], // 移动端状态(即疼痛等)
        CharaDescription        : [], // 角色描述
        DegreesBonusDisplay     : [], // 属性加成显示
        DegreesBox              : [], // 属性
        SkillsBonusDisplay      : [], // 技能加成显示
        SkillsBox               : [], // 技能
        SubjectBoxBonusDisplay  : [], // 学科加成显示
        SchoolSubjectsBox       : [], // 学科
        SchoolMarksText         : [], // 成绩
        WeaponBox               : [], // 武器
        Reputation              : [], // 声誉
        Fame                    : [], // 知名度
        StatusSocial            : [], // 自定义社交状态

        NPCinit                 : [], // 原版NPC初遇初始化(详情看原版initnpc宏)
      };
      this.initFunction = [];
      this.specialWidget = {
        Replace: `
          <<widget "maplebirchReplace">>
            <<set _key to _args[0]>>
            <<if !_key>><<exit>><</if>>

            <<if _currentOverlay is _key>>
              <<run closeOverlay()>>
              <<exit>>
            <</if>>

            <<script>>
              T.buttons.toggle();
              updateOptions();
              T.currentOverlay = T.key;
              $("#customOverlay").removeClass("hidden").parent().removeClass("hidden");
              $("#customOverlay").attr("data-overlay", T.currentOverlay);
            <</script>>
            <<if _args[1] is 'customize'>><<= '<<'+_key+'>>'>><<exit>><</if>>
            <<if _args[1] is 'title'>><<set _titleKey to "title" + _key.charAt(0).toUpperCase() + _key.slice(1)>><</if>>
            <<if maplebirch.tool.widget.Macro.has(_titleKey)>><<replace #customOverlayTitle>><<= '<<'+_titleKey+'>>'>><</replace>><</if>>
            <<replace #customOverlayContent>><<= '<<'+_key+'>>'>><</replace>>
          <</widget>>`
      };
      this.default = {
        Init   : '<<run maplebirch.tool.framework.storyInit()>>',
        Header : '',
        Footer : '<<maplebirchFrameworkVersions>>',
        Information : '<<maplebirchFrameworkInfo>>',
        Options: `
          <<setupOptions>>
          <div class="settingsGrid">
            <div class="settingsHeader options">
              <span class="gold"><<= maplebirch.lang.t("Maplebirch Frameworks")>></span>
            </div>
            <div class="settingsToggleItem">
              <span class="gold"><<= maplebirch.lang.t("Current Mods Language Setting")>>:</span>
              <<set _selectedLang to maplebirch.lang.language>>
              <<set _langOptions = {
                [maplebirch.lang.t('English')]: "EN",
                [maplebirch.lang.t('Chinese')]: "CN",
                [maplebirch.lang.t('Japanese')]: "JP"
              }>>
              <<listbox "_selectedLang" autoselect>>
                <<optionsfrom _langOptions>>
              <</listbox>>
            </div>
            <div class="settingsToggleItem">
              <<set _debugChoice to $maplebirch.options.debug is true ? 'enable' : 'disable'>>
              <label><<checkbox "$maplebirch.options.debug" false true autocheck>><<= maplebirch.lang.t('DEBUGMode')>></label>
            </div>
            <div class="settingsToggleItemWide">
              <span class="gold"><<= maplebirch.lang.autoTranslate('秋枫白桦') + ' ' + maplebirch.lang.autoTranslate('侧边栏位置选择')>>：</span>
              <span class="tooltip-anchor linkBlue" tooltip="在下次打开界面时更新">(?)</span>
              <br>
              <<set _modHintLocation = {
                [maplebirch.lang.t('mobile client')]: "mobile",
                [maplebirch.lang.t('desktop client')]: "desktop",
                [maplebirch.lang.t('disable')]: "disable"
              }>>
              <<listbox "$maplebirch.options.modHint" autoselect>>
                <<optionsfrom _modHintLocation>>
              <</listbox>>
            </div>
          </div><hr>`,
        Cheats : `
          <div class="settingsGrid">
            <div class="settingsHeader options">
              <span class="gold"><<= maplebirch.lang.t("Mods Cheats")>></span>
            </div>
            <<if $maplebirch.options.debug>>
              <div class="settingsToggleItem"><label onclick='maplebirch.trigger("update")'><<checkbox "$maplebirch.options.V" false true autocheck>> V <<= maplebirch.lang.t('permission')>></label></div>
              <div class="settingsToggleItem"><label onclick='maplebirch.trigger("update")'><<checkbox "$maplebirch.options.T" false true autocheck>> T <<= maplebirch.lang.t('permission')>></label></div>
              <div class="settingsToggleItem"><label onclick='maplebirch.trigger("update")'><<checkbox "$maplebirch.options.maplebirch" false true autocheck>> Maplebirch <<= maplebirch.lang.t('permission')>></label></div>
              <div class="settingsToggleItem">
                <label onclick='maplebirch.trigger("update")'><<checkbox "$maplebirch.options.window" false true autocheck>> window <<= maplebirch.lang.t('permission')>>(完全权限)</label>
              </div>
              <div id="ConsoleCheat" class="settingsToggleItemWide">
                <<set _CodeCheater to maplebirch.lang.t('Code Cheater')>>
                <details class="JSCheatConsole">
                  <summary class="JSCheatConsole">JavaScript <<= maplebirch.lang.t('Code Cheater')>></summary>
                  <div class="searchButtons">
                    <div class="input-row">
                      <<textbox '_maplebirchJSCheatConsole' ''>>
                      <<button "执行">>
                        <<run maplebirch.tool.console.execute('javascript')>>
                      <</button>>
                    </div>
                    <span id="js-cheat-console-status" class="cheat-console-status"></span>
                  </div>
                </details>
                <details class="TwineCheatConsole">
                  <summary class="TwineCheatConsole">Twine <<= maplebirch.lang.t('Code Cheater')>></summary>
                  <div class="searchButtons">
                    <div class="input-row">
                      <<textbox '_maplebirchTwineCheatConsole' ''>>
                      <<button "执行">>
                        <<run maplebirch.tool.console.execute('twine')>>
                      <</button>>
                    </div>
                    <span id="twine-cheat-console-status" class="cheat-console-status"></span>
                  </div>
                </details>
              </div>
            <</if>>
          </div><hr>`,
        NPCinit : `
          <<run maplebirch.npc._vanillaNPCInit(_nam)>>`
      };

      this.widgethtml = '';

      this.patchedPassage = {};
      this.locationPassage = {
        StoryCaption: [
          { src: '<<schoolday>>\n\t\t<br>', to: '<<schoolday>>\n\t\t<div id="maplebirchCaptionTextBox">\n\t\t<<maplebirchCaptionDescription>>\n\t\t<br>' },
          { src: '<<allurecaption>>', applybefore: '<<maplebirchStatusBar>>\n\t\t\t' },
          { src: '<</button>>\n\t\t\t<div class="sidebarButtonSplit">', to: '<</button>>\n\t\t\t<<maplebirchMenuBig>>\n\t\t\t<div class="sidebarButtonSplit">' },
          { src: '</div>\n\t\t\t<div class="sidebarButtonSplit">', to: '</div>\n\t\t\t<div class="sidebarButtonSplit"><<maplebirchMenuSmall>></div>\n\t\t\t<div class="sidebarButtonSplit">' },
          { src: '<<goo>>', to: '<<maplebirchCaptionAfterDescription>>\n\t\t<<goo>>\n\t\t</div>' },
          { src: '<<if $options.sidebarStats isnot "disabled">>', applybefore: '<<maplebirchHintMobile>>\n\t\t\t' },
          { src: '<<mobileStats>>', applyafter: '\n\t\t\t\t<<maplebirchStatsMobile>>' },
        ]
      };
      this.widgetPassage = {
        Characteristics: [
          { src: '<<bodywriting>>', applyafter: '\n\n\t<<maplebirchCharaDescription>>' },
          { src: '<</silently>>\n\n\t\t\t<<characteristic-box _purityConfig>>', applybefore: '\t<<maplebirchDegreesBonusDisplay>>\n\t\t\t' },
          { src: '</div>\n\n\t\t<!--Common states for skills with grades-->', applybefore: '\t<<maplebirchDegreesBox>>\n\t\t' },
          { src: '<</silently>>\n\t\t\t<<characteristic-box _skulduggeryConfig>>', applybefore: '\t<<maplebirchSkillsBonusDisplay>>\n\t\t\t' },
          { src: '<<characteristic-box _housekeepingConfig>>', applyafter: '\n\n\t\t\t<<maplebirchSkillsBox>>' },
          { src: '<</silently>>\n\n\t\t\t<<characteristic-box _scienceConfig>>', applybefore: '\t<<maplebirchSubjectBoxBonusDisplay>>\n\t\t\t' },
          { src: '</div>\n\t\t<div class="characteristic-box-extras">', applybefore: '\t<<maplebirchSchoolSubjectsBox>>\n\t\t' },
          { src: '<<characteristic-text _schoolPerformanceConfig>>', applyafter: '\n\n\t\t\t<<maplebirchSchoolMarksText>>' },
          { src: '\t\t</div>\n\t</div>', applybefore: '\t\t\t<<maplebirchWeaponBox>>\n\t\t' }
        ],
        overlayReplace: [
          { src: '</div>\n\t<<closeButton>>\n<</widget>>\n\n<<widget "titleSaves">>', applybefore : '\t<<set $_name to maplebirch.lang.t("Mods Settings")>>\n\t\t<<button $_name>>\n\t\t\t<<toggleTab>>\n\t\t\t<<replace #customOverlayContent>><<maplebirchOptions>><</replace>>\n\t\t<</button>>\n\t' },
          { src: '</div>\n\t<<closeButton>>\n<</widget>>\n\n<<widget "titleOptions">>', applybefore : '\t<<set $_name to maplebirch.lang.t("Mods")>>\n\t\t<<button $_name>>\n\t\t\t<<toggleTab>>\n\t\t\t<<replace #cheatsShown>><<maplebirchCheats>><</replace>>\n\t\t\t<<run $("#customOverlayContent").scrollTop(0);>>\n\t\t<</button>>\n\t' },
          { src: '</div>\n\t<<closeButton>>\n<</widget>>\n\n<<widget "titleFeats">>', applybefore : '\t<<set $_name to maplebirch.lang.t("Mods Statistics")>>\n\t\t<<button $_name>>\n\t\t\t<<toggleTab>>\n\t\t\t<<replace #customOverlayContent>><<maplebirchStatistics>><</replace>>\n\t\t<</button>>\n\t' }
        ],
        'Options Overlay': [
          { src: '<</widget>>\n\n<<widget "setFont">>', applybefore : '\t<<maplebirchInformation>>\n' }
        ],
        npcNamed: [
          { src: '<</widget>>\n\n<<widget "npcNamedUpdate">>', applybefore : '\t<<run maplebirch.npc.injectModNPCs()>>\n' }
        ],
        Social: [
          { src: 'T.importantNPCs = T.importantNpcOrder', applybefore : 'maplebirch.npc.vanillaNPCConfig(T.npcConfig);\n\t\t\t\t' },
          { src: '<<relation-box-wolves>>', applyafter : '\n\n\t\t<<maplebirchReputation>>' },
          { src: '<<relation-box-simple _overallFameBoxConfig>>', applyafter : '\n\n\t\t\t<<maplebirchFame>>' },
          { src: '\t</div>\n\t<br>', applybefore: '\t<<maplebirchStatusSocial>>\n\t' }
        ],
        'Widgets Named Npcs': [
          { src: '<!-- Default cases for all other NNPCs -->\n\t\t<<default>>', applyafter: '\n\t\t<<if Object.keys(maplebirch.npc.data).includes(_npc) && maplebirch.tool.widget.Macro.has(_npc+"relationshiptext")>>\n\t\t\t<<= maplebirch.lang.autoTranslate(_npc)>><<= "<<"+_npc+"relationshiptext>>">>\n\t\t<<else>>' },
          { srcmatch: /\t\t\t<<NPC_CN_NAME _npc>>|\t\t\t_npc/, to: '\t\t\t<<= maplebirch.lang.autoTranslate(_npc)>>' },
          { src: '\<</if>>\n\t<</switch>>', to: '<</if>>\n\t\t<</if>>\n\t<</switch>>' },
          { src: '\<</if>>\n<</widget>>\n\n<<widget "initNNPCClothes">>', applybefore: '\t<<maplebirchNPCinit _nam>>\n\t' }
        ],
        'Widgets Settings': [
          { srcmatch: /<<set\s+_npcList\s*\[\s*clone\s*\(\s*\$NPCNameList\s*\[\s*\$_i\s*\]\s*\)\s*(?:\.replace\s*\(\s*"[^"]+"\s*,\s*"[^"]+"\s*\)\s*)*\]\s+to\s+clone\s*\(\s*\$_i\s*\)\s*>>/, to: '<<set _npcList[maplebirch.lang.autoTranslate(clone($NPCNameList[$_i]))] to clone($_i)>>' },
          { srcmatch: /<<run delete _npcList\["(?:象牙怨灵|Ivory Wraith)"\]>>/, to: '<<run delete _npcList[maplebirch.lang.autoTranslate("Ivory Wraith")]>>' },
          { srcmatch: /\t<<NPC_CN_NAME \$NPCName\[_npcId\].nam>>|\t\$NPCName\[_npcId\].nam/, to: '\t<<= maplebirch.lang.autoTranslate($NPCName[_npcId].nam)>>' },
          { srcmatch: /\$NPCName\[_npcId\]\.title|<<print\s+\$NPCName\s*\[\s*\_npcId\s*\]\s*\.title\s*(\s*\.replace\s*\(\s*"[^"]+"\s*,\s*"[^"]+"\s*\)\s*)+>>/, to: '\t<<= maplebirch.lang.autoTranslate($NPCName[_npcId].title)>>' },
        ],
        Widgets: [
          { src: 'T.getStatConfig = function(stat) {', applybefore: 'maplebirch.npc.applyStatDefaults(statDefaults);\n\t\t\t' },
          { srcmatchgroup: /\t_npcData.nam|\t<<NPC_CN_NAME _npcData.nam>>/g, to: '\t<<= maplebirch.lang.autoTranslate(_npcData.nam)>>' },
        ],
        Traits: [
          { src: '<div id="traitListsSearch">', applybefore: '<<run maplebirch.tool.other.initTraits(_traitLists)>>\n\t' }
        ],
        'Widgets Journal': [
          { src: '<br>\n<</widget>>', applybefore: '<br><hr>\n\t<<maplebirchJournal>>\n' }
        ]
      }
    }

    /**
     * 注册初始化部件
     * @param {...(string|Function|Object)} widgets - 要注册的部件
     */
    onInit(...widgets) {
      widgets.forEach(widget => {
        if (typeof widget === 'string') {
          this.data.Init.push(widget);
        } else {
          this.initFunction.push(widget);
        }
      });
    }

    /**
     * 添加部件到指定区域
     * 
     * 支持三种类型的部件参数：
     * 1. 字符串类型：直接作为宏名称使用，渲染时会自动包装为 <<宏名称>>
     * 2. 函数类型：函数会被转换为字符串并包装在 <<run>> 宏中执行
     * 3. 对象类型：支持条件渲染配置，包含以下属性：
     *    - widget: 必需，宏名称字符串
     *    - exclude: 可选，字符串或数组，指定要排除的段落标题
     *    - match: 可选，正则表达式，匹配段落标题
     *    - passage: 可选，字符串或数组，指定要包含的段落标题
     * 
     * 示例：
     * // 添加简单宏部件
     * framework.addTo('Header', 'maplebirchHeader');
     * 
     * // 添加函数部件
     * framework.addTo('Footer', bag) bag为函数名
     * framework.addTo('Footer', () => {
     *   return `<<print "当前时间: " + new Date().toLocaleString()>>`;
     * });
     * 
     * // 添加带条件的宏部件
     * framework.addTo('Options', {
     *   widget: 'customOptions',
     *   exclude: ['Settings', 'Preferences']
     * });
     * 
     * // 添加带匹配规则的对象部件
     * framework.addTo('Information', {
     *   widget: 'dynamicInfo',
     *   match: /Chapter\d+/,
     * });
     * 
     * @param {string} zone - 目标区域名称（如 'Header', 'Footer' 等）
     * @param {...(string|Function|Object)} widgets - 要添加的部件
     */
    addTo(zone, ...widgets) {
      if (!this.data[zone]) {
        this.log(`区域 ${zone} 不存在`, 'ERROR');
        return;
      }
      widgets.forEach(widget => {
        if (typeof widget === 'string') {
          this.data[zone].push(widget);
        } else if (typeof widget === 'function') {
          const funcName = widget.name || `func_${this.#hashCode(widget.toString())}`;
          this.initFunction.push({
            name: funcName,
            func: widget
          });
          this.data[zone].push(`run ${funcName}()`);
        } else if (typeof widget === 'object' && widget.widget) {
          this.data[zone].push(widget);
        }
      });
    }

    #hashCode(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
      }
      return Math.abs(hash).toString(16).substring(0, 8);
    }

    // 执行所有初始化函数
    storyInit() {
      if (this.initFunction.length === 0) return;
      this.log(`执行 ${this.initFunction.length} 个初始化函数`, 'DEBUG');
      
      this.initFunction.forEach(initfunc => {
        try {
          if (typeof initfunc === 'function') {
            initfunc();
          } else if (typeof initfunc === 'object' && typeof initfunc.init === 'function') {
            initfunc.init();
          }
        } catch (error) {
          this.log(`初始化函数执行失败: ${error.message}`, 'ERROR');
          this.log(error.stack, 'DEBUG');
        }
      });
    }

    /**
     * 创建部件代码
     * @returns {Promise} 异步操作
     */
    async #createWidgets() {
      const data = this.data;
      const print = {
        start : zone => {
          let html = `<<widget "maplebirch${zone}">>\n\t`;

          if (typeof this.default[zone] === 'function') {
            html += `${this.default[zone]()}\n\t`;
          } else if (typeof this.default[zone] === 'string') {
            html += `${this.default[zone]}\n\t`;
          }
          return html;
        },
        end : (zone, length) => {
          let html = '\n<</widget>>\n\n';
          const br = ['CaptionAfterDescription'];
          if (br.includes(zone) && length > 0) html = `<br>\n\t${html}`;
          return html;
        }
      };

      let html = '\r\n';

      for (const zone in data) {
        if (zone === 'BeforeLinkZone' || zone === 'AfterLinkZone') continue;
        let _html = print.start(zone);
        _html += `<<= maplebirch.tool.framework.play("${zone}")>>`;
        _html += print.end(zone, data[zone].length);
        html += _html;
      }
      
      this.widgethtml = html;
      this.log('部件代码创建完成', 'DEBUG');
    }

    /**
     * 创建特殊部件
     * @returns {Promise<string>} 特殊部件HTML
     */
    async #createSpecialWidgets() {
      let html = '\r\n';
      for (const widget in this.specialWidget) {
        if (typeof this.specialWidget[widget] === 'function') {
          html += this.specialWidget[widget]();
        } else if (typeof this.specialWidget[widget] === 'string') {
          html += this.specialWidget[widget];
        }
      }

      this.widgethtml += html;
      return html;
    }

    /**
     * 区域部件渲染
     * @param {string} zone - 目标区域
     * @param {string} [passageTitle] - 当前段落标题
     * @returns {string} 渲染后的部件代码
     */
    play(zone, passageTitle) {
      const data = this.data[zone];
      if (!data?.length) return '';
      
      const title = passageTitle ?? V.passage;
      
      return data.reduce((result, widget) => {
        if (typeof widget === 'string') {
          return result + `<<${widget}>>`;
        }
        
        if (typeof widget === 'object') {
          if (widget.type === 'function') {
            const funcString = widget.func.toString();
            return result + `<<run (${funcString})()>>`;
          }
          
          const { exclude, match, passage, widget: widgetName } = widget;
          
          if (exclude) {
            const shouldExclude = (typeof exclude === 'string' && exclude === title) || (Array.isArray(exclude) && exclude.includes(title));
            if (!shouldExclude) return result + `<<${widgetName}>>`;
            return result;
          }

          if (match instanceof RegExp && match.test(title)) {
            return result + `<<${widgetName}>>`;
          }
          
          if (passage) {
            const shouldInclude = (typeof passage === 'string' && passage === title) || (Array.isArray(passage) && passage.includes(title)) || (passage.length === 0);
            if (shouldInclude) return result + `<<${widgetName}>>`;
            return result;
          }
          
          if (widgetName) return result + `<<${widgetName}>>`;
        }
        
        return result;
      }, '');
    }

    /**
     * 统一替换函数
     * @param {string} source - 原始文本
     * @param {string|RegExp} pattern - 匹配模式
     * @param {Object} set - 替换配置
     * @returns {string} 替换后的文本
     */
    #applyReplacement(source, pattern, set) {
      if (!pattern) return source;
      
      if (set.to) {
        return source.replace(pattern, set.to);
      }
      
      if (set.applyafter) {
        return source.replace(pattern, (match) => match + set.applyafter);
      }
      
      if (set.applybefore) {
        return source.replace(pattern, (match) => set.applybefore + match);
      }
      
      return source;
    }

    /**
     * 统一匹配与应用函数
     * @param {Object} set - 匹配配置
     * @param {string} source - 原始文本
     * @returns {string} 处理后的文本
     */
    matchAndApply(set, source) {
      const patterns = [
        { type: 'src', pattern: set.src },
        { type: 'srcmatch', pattern: set.srcmatch },
        { type: 'srcmatchgroup', pattern: set.srcmatchgroup },
        { type: 'srcgroup', pattern: set.srcgroup }
      ];

      for (const { type, pattern } of patterns) {
        if (!pattern) continue;
        
        let matched = false;
        
        switch (type) {
          case 'src':
            if (source.includes(pattern)) {
              source = this.#applyReplacement(source, pattern, set);
              matched = true;
            }
            break;
          case 'srcmatch':
            if (pattern instanceof RegExp && pattern.test(source)) {
              source = this.#applyReplacement(source, pattern, set);
              matched = true;
            }
            break;
          case 'srcmatchgroup':
            if (pattern instanceof RegExp) {
              const matches = source.match(pattern) || [];
              if (matches.length > 0) {
                matches.forEach(match => {
                  source = this.#applyReplacement(source, match, set);
                });
                matched = true;
              }
            }
            break;
          case 'srcgroup':
            if (source.includes(pattern)) {
              source = this.#applyReplacement(source, pattern, set);
              matched = true;
            }
            break;
        }
        
        if (matched) break;
      }
      
      return source;
    }

    /**
     * 特殊段落包装处理
     * @param {Object} passage - 段落对象
     * @param {string} title - 段落标题
     * @returns {Object} 包装后的段落
     */
    #wrapSpecialPassages(passage, title) {
      const wrappers = {
        'StoryCaption': content => content,
        'PassageHeader': content => `<div id="passage-header">\n${content}\n<<maplebirchHeader>>\n</div>`,
        'PassageFooter': content => `<div id="passage-footer">\n${content}\n<<maplebirchFooter>>\n</div>`,
        'default': content => `<div id="passage-content">\n${content}\n</div>`
      };
      
      const wrapper = wrappers[title] || wrappers.default;
      passage.content = wrapper(passage.content);
      return passage;
    }

    /**
     * 应用内容修改补丁
     * @param {Object} passage - 段落对象
     * @param {string} title - 段落标题
     * @param {Object} patchSets - 补丁配置
     * @returns {Object} 修改后的段落
     */
    #applyContentPatches(passage, title, patchSets) {
      if (!patchSets || !patchSets[title]) return passage;
      
      let source = String(passage.content);
      
      for (const set of patchSets[title]) {
        source = this.matchAndApply(set, source);
      }
      
      passage.content = source;
      return passage;
    }

    /**
     * 主段落处理函数
     * @param {Object} passage - 段落对象
     * @param {string} title - 段落标题
     * @returns {Object} 处理后的段落
     */
    patchPassage(passage, title) { 
      if (!this.patchedPassage[title]) {
        if (passage.tags.includes('widget')) {
          if (Object.keys(this.widgetPassage).length > 0) {
            passage = this.#applyContentPatches(passage, title, this.widgetPassage);
          }
        } else {
          if (Object.keys(this.locationPassage).length > 0) {
            passage = this.#applyContentPatches(passage, title, this.locationPassage);
          }
        }
        this.patchedPassage[title] = true;
      }
      passage = this.#wrapSpecialPassages(passage, title);
      
      return passage;
    }

    /**
     * 部件初始化
     * @param {Map} passageData - 段落数据映射
     * @returns {Promise<Map>} 处理后的段落数据
     */
    async widgetInit(passageData) {
      await this.#createWidgets();
      await this.#createSpecialWidgets();

      let data = {
        id       : 0,
        name     : 'Maplebirch Frameworks Widgets',
        position : '100,100',
        size     : '100,100',
        tags     : ['widget']
      };

      data.content = this.widgethtml;
      passageData.set('Maplebirch Frameworks Widgets', data);
      this.log('创建部件段落: Maplebirch Frameworks Widgets', 'DEBUG');

      const storyInit = passageData.get('StoryInit');
      if (storyInit) {
        storyInit.content += '\n<<maplebirchInit>>\n';
        passageData.set('StoryInit', storyInit);
      }
      
      return passageData;
    }

    /**
     * 在Mod注入后执行的主要处理函数
     * @returns {Promise} 异步操作
     */
    async afterPatchModToGame() {
      const modSC2DataManager = window.modSC2DataManager;
      const addonTweeReplacer = window.addonTweeReplacer;

      const oldSCdata = modSC2DataManager.getSC2DataInfoAfterPatch();
      const SCdata = oldSCdata.cloneSC2DataInfo();
      const passageData = SCdata.passageDataItems.map;
  
      await this.widgetInit(passageData);
      
      for (const [title, passage] of passageData) {
        try {
          await this.patchPassage(passage, title);
        } catch (e) {
          const errorMsg = e?.message ? e.message : e;
          this.log(`处理段落 ${title} 时出错: ${errorMsg}`, 'ERROR');
          addonTweeReplacer.logger.error(`PatchScene: ${title} ${errorMsg}`);
        }
      }
      SCdata.passageDataItems.back2Array();
      addonTweeReplacer.gModUtils.replaceFollowSC2DataInfo(SCdata, oldSCdata);   
      this.log('框架补丁应用完成', 'DEBUG');
    }
  }

  // 链接区域管理工具 - 用于在链接前后插入区域
  const applyLinkZone = (() => {
    'use strict';

    const defaultConfig = {
      containerId: 'passage-content',
      linkSelector: '.macro-link',
      beforeMacro: () => maplebirch.tool.framework.play('BeforeLinkZone'),
      afterMacro: () => maplebirch.tool.framework.play('AfterLinkZone'),
      zoneStyle: {
        display: 'none',
        verticalAlign: 'top',
      },
      onBeforeApply: null,
      onAfterApply: null,
      debug: false
    };

    function log(message, level = 'INFO', ...objects) {
      maplebirch.log(`[tool] ${message}`, level, ...objects);
    }

    function apply(userConfig = {}) {
      const config = { ...defaultConfig, ...userConfig };
      config.onBeforeApply?.();
      const linkZone = new LinkZoneManager(config.containerId, config.linkSelector, log);
      const result = linkZone.applyZones(config);
      if (result) addMacroZones(config);
      config.onAfterApply?.(result, config);
      return result;
    }

    function addMacroZones(config) {
      const setMacroContent = (element, macro) => {
        if (!element) return;
        let macroContent;
        if (typeof macro === 'function') {
          macroContent = macro();
        } else if (typeof macro === 'string') {
          macroContent = macro;
        } else {
          return;
        }
        if (!macroContent) {
          element.innerHTML = '';
          element.style.display = 'none';
          return;
        }
        const tempContainer = document.createElement('div');
        if (typeof $.wiki === 'function') {
          $(tempContainer).wiki(macroContent);
        } else if (typeof Wikifier !== 'undefined') {
          new Wikifier(tempContainer, macroContent);
        } else if (typeof wikifier === 'function') {
          tempContainer.innerHTML = macroContent;
          wikifier(tempContainer);
        } else {
          tempContainer.innerHTML = macroContent;
        }
        element.innerHTML = '';
        element.append(...tempContainer.childNodes);
        element.querySelectorAll('script').forEach(script => {
          const newScript = document.createElement('script');
          newScript.textContent = script.textContent;
          script.replaceWith(newScript);
        });
        if (element.childNodes.length > 0) {
          element.style.display = 'block';
        } else {
          element.style.display = 'none';
        }
        if (config.debug) log('[link] 添加宏到区域', 'DEBUG', macroContent);
      };
      setMacroContent(document.getElementById('beforeLinkZone'), config.beforeMacro);
      setMacroContent(document.getElementById('afterLinkZone'), config.afterMacro);
    }

    class LinkZoneManager {
      constructor(containerId = 'passages', linkSelector = '.macro-link', logger) {
        this.log = logger || maplebirch.log;
        this.containerId = containerId;
        this.linkSelector = linkSelector;
        this.#resetState();
      }
      
      #resetState() {
        this.firstLink = null;
        this.lastLink = null;
        this.allLinks = [];
        this.lineBreakBeforeFirstLink = null;
      }
      
      detectLinks() {
        this.#resetState();
        const container = document.getElementById(this.containerId);
        if (!container) return null;
        this.allLinks = Array.from(container.querySelectorAll(this.linkSelector)).filter(link => this.#isElementVisible(link));
        if (this.allLinks.length === 0) return null;
        this.firstLink = this.allLinks[0];
        this.lastLink = this.allLinks[this.allLinks.length - 1];
        this.#detectLineBreakBeforeFirstLink();
        return {
          firstLink: this.firstLink,
          lastLink: this.lastLink,
          totalLinks: this.allLinks.length,
          lineBreakBeforeFirstLink: this.lineBreakBeforeFirstLink
        };
      }
      
      #detectLineBreakBeforeFirstLink() {
        let node = this.firstLink.previousSibling;
        while (node) {
          if (this.#isLineBreakNode(node)) {
            this.lineBreakBeforeFirstLink = node;
            return;
          }
          node = node.previousSibling;
        }
      }
      
      #isLineBreakNode(node) {
        if (!node) return false;
        switch (node.nodeType) {
          case Node.TEXT_NODE:
            return /\n/.test(node.textContent);
          case Node.ELEMENT_NODE:
            if (['BR', 'HR'].includes(node.nodeName)) return true;
            const blockTags = ['DIV', 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL', 'LI', 'TABLE'];
            if (blockTags.includes(node.nodeName)) return true;
            return ['block', 'flex', 'grid', 'table', 'table-row', 'table-cell'].includes(getComputedStyle(node).display);
          default:
            return false;
        }
      }
      
      #isElementVisible(element) {
        if (!element || !element.getBoundingClientRect) return false;
        const { display, visibility, opacity } = getComputedStyle(element);
        if (display === 'none' || visibility === 'hidden' || opacity === '0') return false;
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      }
      
      #createZoneElement(id, config) {
        const zone = document.createElement('div');
        zone.id = id;
        Object.assign(zone.style, config.zoneStyle);
        return zone;
      }
      
      applyZones(config) {
        const results = this.detectLinks();
        if (!results) {
          if (config.debug) this.log('[link] 没有找到可见链接', 'DEBUG');
          return false;
        }
        this.#applyBeforeLinkZone(config);
        this.#applyAfterLinkZone(config);
        return true;
      }
      
      #applyBeforeLinkZone(config) {
        if (!this.firstLink || !this.lineBreakBeforeFirstLink) return; 
        const zone = this.#createZoneElement('beforeLinkZone', config);
        if (this.lineBreakBeforeFirstLink.nodeType === Node.TEXT_NODE) {
          const content = this.lineBreakBeforeFirstLink.textContent;
          const breakIndex = content.lastIndexOf('\n');
          if (breakIndex === -1) {
            this.lineBreakBeforeFirstLink.after(zone);
          } else {
            const beforeText = content.substring(0, breakIndex + 1);
            const afterText = content.substring(breakIndex + 1);
            this.lineBreakBeforeFirstLink.textContent = beforeText;
            this.lineBreakBeforeFirstLink.after(zone, document.createTextNode(afterText));
          }
        } else {
          this.lineBreakBeforeFirstLink.after(zone);
        }
        if (config.debug) this.log('应用链接前区域', 'DEBUG', zone);
      }
      
      #applyAfterLinkZone(config) {
        if (!this.lastLink) return;   
        const zone = this.#createZoneElement('afterLinkZone', config);
        this.lastLink.after(zone);
        if (config.debug) this.log('应用链接后区域', 'DEBUG', zone);
      }
    }

    return {
      apply,
      manager: LinkZoneManager,
      addMacrosToZones: addMacroZones,
      get defaultConfig() { return { ...defaultConfig }; },
      removeZones: () => {
        document.getElementById('beforeLinkZone')?.remove();
        document.getElementById('afterLinkZone')?.remove();
      }
    }
  })()

  // 其他系统工具 - 用于管理特质和地点配置
  class othersSystem {
    static get traitCategories() {
      return {
        "General Traits"   : "一般特质",
        "Medicinal Traits" : "医疗特质",
        "Special Traits"   : "特殊特质",
        "School Traits"    : "学校特质",
        "Trauma Traits"    : "创伤特质",
        "NPC Traits"       : "NPC特质",
        "Hypnosis Traits"  : "催眠特质",
        "Acceptance Traits": "接纳特质"
      };
    }

    static getTraitCategory(englishName) {
      return this.traitCategories[englishName] || englishName;
    }

    constructor(logger) {
      this.log = logger || createLogger('modhint');
      this.traitsTitle = [];
      this.traitsData = [];
      this.locationUpdates = {};
    }

    #getTraits(data) {
      const titleMap = {};
      const traitLists = maplebirch.tool.clone(data);
      traitLists.forEach((category, index) => {
        const mappedTitle = othersSystem.getTraitCategory(category.title);
        titleMap[mappedTitle] = index;
        if (!this.traitsTitle.includes(mappedTitle)) this.traitsTitle.push(mappedTitle);
      });
      return titleMap;
    }

    addTraits(...data) {
      data.forEach(traits => {
        if (traits && traits.title && traits.name) {
          const mappedTitle = othersSystem.getTraitCategory(traits.title);
          this.traitsData.push({
            title: mappedTitle,
            name: typeof traits.name === 'function' ? traits.name() : traits.name,
            colour: typeof traits.colour === 'function' ? traits.colour() : traits.colour || '',
            has: typeof traits.has === 'function' ? traits.has() : traits.has || false,
            text: typeof traits.text === 'function' ? traits.text() : traits.text || ''
          });
        }
      });
    }

    initTraits(data) {
      const titleMap = this.#getTraits(data);
      const result = maplebirch.tool.clone(data);
      this.traitsData.forEach(trait => {
        const title = trait.title;
        if (titleMap[title] !== undefined) {
          result[titleMap[title]].traits.push({
            name: trait.name,
            colour: trait.colour,
            has: trait.has,
            text: trait.text
          });
        } else {
          result.push({
            title: title,
            traits: [{
              name: trait.name,
              colour: trait.colour,
              has: trait.has,
              text: trait.text
            }]
          });
          titleMap[title] = result.length - 1;
          if (!this.traitsTitle.includes(title)) this.traitsTitle.push(title);
        }
      });
      T.traitLists = result;
      return true;
    }

    /**
     * 地点配置方法（添加/更新）
     * @param {string} locationId - 地点ID
     * @param {object} config - 配置对象
     * @param {object} [options] - 配置选项
     * @param {boolean} [options.overwrite=false] - 是否覆盖整个配置
     * @param {string} [options.layer] - 指定操作图层
     * @param {string} [options.element] - 指定操作元素
     * 
     * 示例1：添加新地点
     * configureLocation('magic_academy', {
     *   folder: 'magic_academy',
     *   base: { main: { image: 'main.png' } }
     * });
     * 
     * 示例2：更新特定元素
     * configureLocation('lake_ruin', {
     *   condition: () => Weather.bloodMoon && !Weather.isSnow
     * }, { layer: 'base', element: 'bloodmoon' });
     * 
     * 示例3：完全覆盖地点
     * configureLocation('cafe', {
     *   folder: 'cafe_remastered',
     *   base: { ... }
     * }, { overwrite: true });
     * 
     * 示例4：添加新图层元素
     * configureLocation('forest', {
     *   image: 'fireflies.png',
     *   animation: { frameDelay: 300 }
     * }, { layer: 'emissive', element: 'fireflies' });
     */
    configureLocation(locationId, config, options = {}) {
      const { overwrite = false, layer, element } = options;
      if (!this.locationUpdates[locationId]) {
        this.locationUpdates[locationId] = {
          overwrite: false,
          config: {},
          customMapping: null
        };
      }
      const update = this.locationUpdates[locationId];
      if (overwrite) {
        update.overwrite = true;
        update.config = maplebirch.tool.clone(config);
        update.customMapping = config.customMapping || null;
      } else if (layer && element) {
        if (!update.config[layer]) update.config[layer] = {};
        update.config[layer][element] = {
          ...(update.config[layer][element] || {}),
          ...config
        };
      } else {
        update.config = this.#deepMergeLocationConfig(update.config, config);
        if (config.customMapping) update.customMapping = config.customMapping;
      }
      return true;
    }

    applyLocationUpdates() {
      for (const [locationId, update] of Object.entries(this.locationUpdates)) {
        const current = setup.LocationImages[locationId] || {};
        if (update.overwrite || !setup.LocationImages[locationId]) {
          setup.LocationImages[locationId] = {
            folder: update.config.folder || current.folder || 'default',
            base: update.config.base || current.base || {},
            emissive: update.config.emissive || current.emissive || {},
            reflective: update.config.reflective || current.reflective || {},
            layerTop: update.config.layerTop || current.layerTop || {}
          };
        } else {
          setup.LocationImages[locationId] = this.#deepMergeLocationConfig(current, update.config);
        }
        if (update.customMapping) setup.Locations[locationId] = update.customMapping;
      }
      this.locationUpdates = {};
      return true;
    }

    #deepMergeLocationConfig(target, source) {
      const result = maplebirch.tool.clone(target);
      if (source.folder) result.folder = source.folder;
      const layers = ['base', 'emissive', 'reflective', 'layerTop'];
      layers.forEach(layer => {
        if (source[layer]) {
          result[layer] = result[layer] || {};
          for (const [elementName, elementConfig] of Object.entries(source[layer])) {
            if (result[layer][elementName]) {
              result[layer][elementName] = {
                ...result[layer][elementName],
                ...elementConfig
              };
            } else {
              result[layer][elementName] = elementConfig;
            }
          }
        }
      });
      return result;
    }
  }

  class toolsModule {
    constructor() {
      this.createLogger = createLogger;
      this.widget = new widgetSystem(createLogger('widget'));
      this.migration = new migrationSystem(createLogger('migration'));
      this.effect = new effectSystem(createLogger('effect'));
      this.random = new randomSystem(createLogger('random'));
      this.modhint = new modhintSystem(createLogger('modhint'));
      this.console = new consoleTools(createLogger('console'));
      this.framework = new frameworks(createLogger('framework'));
      this.linkzone = applyLinkZone;
      this.other = new othersSystem(createLogger('other'));
    }
    
    clone = universalCopy;
    equal = deepEqual;
    contains = arrayContains;
    loadImg = loadImageWithModLoader;

    async preInit() {
      maplebirch.on(':onLoad', (variables) => {
        const saveId = variables.saveId;
        this.effect.setActiveSaveId(saveId);
        if (V.maplebirch?.effect) {
          this.effect.loadFromSave(V.maplebirch.effect);
          log(`从存档加载效果数据: ${saveId}`);
        } else {
          this.effect.reset();
          log(`新存档初始化: ${saveId}`);
        }
      }, 2, 'effect');
      
      maplebirch.on(':onSave', (variables) => {
        const saveId = variables.saveId;
        const effectData = this.effect.saveToCurrentArchive(); 
        if (effectData) {
          if (typeof V.maplebirch !== 'object') V.maplebirch = {};
          V.maplebirch.effect = effectData;
          log(`保存效果数据到存档: ${saveId}`);
        }
      }, 2, 'effect');
      
      maplebirch.on(':storyready', (variables) => {
        const saveId = variables.saveId;
        if (State.passage === 'Start' || State.passage === 'Downgrade Waiting Room') return;
        if (saveId) {
          this.effect.setActiveSaveId(saveId);
          if (V.maplebirch?.effect) {
            this.effect.loadFromSave(V.maplebirch.effect);
            log(`从全局状态恢复效果数据: ${saveId}`, 'DEBUG');
          } else {
            log(`初始化新存档效果数据: ${saveId}`, 'DEBUG');
          }
        } else {
          this.effect.setActiveSaveId('default');
          this.effect.reset();
          log("初始化默认效果状态");
        }
      }, 2, 'effect');

      maplebirch.once(':finally', () => {
        this.linkzone.removeZones();
        this.linkzone.apply({ debug: true });
      }, 3);
      maplebirch.on(':passagedisplay', () => this.linkzone.apply(), 3, 'applylinkzone');
    }

    Init() {
      this.other.applyLocationUpdates();
    }

    postInit() {

    }
  }

  maplebirch.register('tool', new toolsModule(), ['state']);
})();