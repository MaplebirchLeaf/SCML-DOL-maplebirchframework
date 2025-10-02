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
   * @param {any} source - 要克隆的对象
   * @param {Object} [options={}] - 克隆选项
   * @param {boolean} [options.deep=true] - 是否深克隆
   * @param {boolean} [options.preservePrototype=true] - 是否保留原型链
   * @param {WeakMap} [map=new WeakMap()] - 内部WeakMap(处理循环引用)
   * @returns {any} 克隆后的对象
   * 
   * @example
   * // 基本类型克隆
   * clone(42); // 42
   * 
   * @example
   * // 对象深克隆
   * const obj = { a: 1, b: { c: 2 } };
   * const cloned = clone(obj);
   * 
   * @example
   * // 浅克隆
   * const obj = { a: 1, b: { c: 2 } };
   * const cloned = clone(obj, { deep: false });
   */
  function clone(source, options = {}, map = new WeakMap()) {
    const { deep = true, preservePrototype = true } = options;
    if (source === null || typeof source !== 'object') return source;
    if (map.has(source)) return map.get(source);
    if (source instanceof Date) return new Date(source.getTime());
    if (source instanceof RegExp) return new RegExp(source.source, source.flags);
    if (source instanceof Map) {
      const clone = new Map();
      map.set(source, clone);
      source.forEach((value, key) => clone.set(deep ? this.clone(key, options, map) : key,deep ? this.clone(value, options, map) : value));
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
    
    if (Array.isArray(source)) {
      const clone = [];
      map.set(source, clone);
      for (let i = 0; i < source.length; i++) clone[i] = deep ? this.clone(source[i], options, map) : source[i];
      return clone;
    }
    
    const clone = preservePrototype ? Object.create(Object.getPrototypeOf(source)) : {};
    map.set(source, clone);
    const keys = [...Object.getOwnPropertyNames(source), ...Object.getOwnPropertySymbols(source)];
    
    for (const key of keys) {
      const descriptor = Object.getOwnPropertyDescriptor(source, key);
      if (descriptor && !descriptor.enumerable) continue;
      const value = source[key];
      clone[key] = deep ? this.clone(value, options, map) : value;
    }
    
    return clone;
  }

  /**
   * @param {Object} target - 目标对象
   * @param {...Object} sources - 要合并的源对象
   * @param {Object} [options={}] - 合并选项
   * @param {string} [options.arrayBehaviour="replace"] - 数组合并策略
   * @param {Function} [options.filterFn] - 属性过滤函数
   * @returns {Object} 合并后的对象
   * 
   * @example
   * // 基本合并
   * merge({ a: 1 }, { b: 2 }); // { a: 1, b: 2 }
   * 
   * @example
   * // 数组合并
   * merge({ arr: [1, 2] }, { arr: [3, 4] }, { arrayBehaviour: "concat" }); // { arr: [1, 2, 3, 4] }
   * 
   * @example
   * // 属性过滤
   * merge({}, { public: "info", secret: "data" }, { 
   *   arrayBehaviour: "replace",
   *   filterFn: (key) => key !== "secret"
   * });
   */
  function merge(target, ...sources) {
    const options = typeof sources[sources.length - 1] === "object" && !Array.isArray(sources[sources.length - 1]) ? sources.pop() : {};
    const {
      arrayBehaviour = "replace",
      filterFn = null
    } = options;
    const mergeRecursive = (target, source, depth = 1) => {
      if (source === null || typeof source !== 'object') return source;
      for (const key in source) {
        if (filterFn && !filterFn(key, source[key], depth)) continue;
        const sourceValue = source[key];
        const targetValue = target[key];
        if (Array.isArray(sourceValue) && Array.isArray(targetValue)) {
          switch (arrayBehaviour) {
            case "concat":
              target[key] = [...targetValue, ...sourceValue];
              break;
            case "merge":
              target[key] = targetValue.map((item, i) => i < sourceValue.length ? mergeRecursive(item, sourceValue[i], depth + 1) : item);
              break;
            default:
              target[key] = [...sourceValue];
          }
        } else if (typeof sourceValue === 'object' && sourceValue !== null && typeof targetValue === 'object' && targetValue !== null) {
          target[key] = mergeRecursive(targetValue, sourceValue, depth + 1);
        } else {
          target[key] = sourceValue;
        }
      }
      return target;
    };
    for (const source of sources) target = mergeRecursive(target, source);
    return target;
  }

  /**
   * @param {any} a - 第一个值
   * @param {any} b - 第二个值
   * @returns {boolean} 是否相等
   * 
   * @example
   * // 基本类型比较
   * equal(42, 42); // true
   * 
   * @example
   * // 对象比较
   * equal({ a: 1 }, { a: 1 }); // true
   * 
   * @example
   * // 日期比较
   * equal(new Date(2023, 0, 1), new Date(2023, 0, 1)); // true
   */
  function equal(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return a === b;
    if (typeof a !== 'object' || typeof b !== 'object') return a === b;
    if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
    if (a instanceof RegExp && b instanceof RegExp) return a.source === b.source && a.flags === b.flags;
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) if (!this.equal(a[i], b[i])) return false;
      return true;
    }
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    for (const key of aKeys) {
      if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
      if (!this.equal(a[key], b[key])) return false;
    }
    return true;
  }

  /**
   * @param {Array} arr - 目标数组
   * @param {Array} elements - 要检查的元素数组
   * @param {Object} [options={}] - 配置选项
   * @param {string} [options.mode='all'] - 匹配模式: 'all', 'any', 'none'
   * @param {boolean} [options.caseSensitive=false] - 是否区分大小写
   * @param {Function} [options.comparator] - 自定义比较函数
   * @returns {boolean} 检查结果
   * 
   * @example
   * // 检查所有元素
   * arrayContains([1, 2, 3], [2, 3]); // true
   * 
   * @example
   * // 不区分大小写检查
   * arrayContains(['a', 'B'], ['b'], { caseSensitive: false }); // true
   */
  function arrayContains(arr, elements, options = {}) {
    const {
      mode = 'all',
      caseSensitive = false,
      comparator = null
    } = options;
    const processValue = value => {
      if (!caseSensitive && typeof value === 'string') return value.toLowerCase();
      return value;
    };
    const mainArr = comparator ? arr : arr.map(processValue);
    const checkElements = comparator ? elements : elements.map(processValue);
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
      return src;
    } catch (error) {
      log(`ModLoader图片加载失败: ${error.message}`, 'ERROR');
      return src;
    }
  }

  // 部件系统 - 用于定义和管理宏部件
  class widgetSystem {
    constructor(logger) {
      this.log = logger;
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
     * 定义宏
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

      const renameFunc = (data, oldPath, newPath) => {
        const source = resolvePath(data, oldPath);
        if (!source?.parent[source.key]) return false;
        const value = source.parent[source.key];
        delete source.parent[source.key];
        const target = resolvePath(data, newPath, true);
        target.parent[target.key] = value;
        return true;
      };

      const utils = {
        /**
         * 解析对象路径
         * @param {Object} obj - 目标对象
         * @param {string} path - 点分隔路径 (如: 'a.b.c')
         * @param {boolean} [createIfMissing=false] - 是否自动创建缺失路径
         * @returns {Object|null} { parent: 父对象, key: 末级键名 } 或 null
         */
        resolvePath: (obj, path, createIfMissing = false) => {
          const parts = String(path).split('.');
          let current = obj;
          for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (current[part] === undefined) {
              if (!createIfMissing) return null;
              current[part] = {};
            }
            current = current[part];
            if (current === null || typeof current !== 'object') {
              if (!createIfMissing) return null;
              current = {};
            }
          }
          return { parent: current, key: parts.at(-1) };
        },

        /**
         * 重命名对象属性路径
         * @param {Object} data - 目标数据对象
         * @param {string} oldPath - 原路径
         * @param {string} newPath - 新路径
         * @returns {boolean} 是否成功
         */
        rename: renameFunc,

        /**
         * 删除对象属性
         * @param {Object} data - 目标数据对象
         * @param {string} path - 点分隔路径
         * @returns {boolean} 是否成功
         */
        remove: (data, path) => {
          const target = utils.resolvePath(data, path);
          if (target?.parent[target.key] !== undefined) {
            delete target.parent[target.key];
            return true;
          }
          return false;
        },

        move: renameFunc,

        /**
         * 转换属性值
         * @param {Object} data - 目标数据对象
         * @param {string} path - 点分隔路径
         * @param {Function} transformer - 转换函数 (value) => newValue
         * @returns {boolean} 是否成功
         */
        transform: (data, path, transformer) => {
          const target = utils.resolvePath(data, path);
          if (!target?.parent[target.key]) return false;
          try {
            target.parent[target.key] = transformer(target.parent[target.key]);
            return true;
          } catch {
            return false;
          }
        },

        /**
         * 填充缺失属性
         * @param {Object} target - 目标对象
         * @param {Object} defaults - 默认值模板对象
         */
        fill: (target, defaults) => {
          const filterFn = (key, value, depth) => {
            if (key === "version") return false;
            return !Object.prototype.hasOwnProperty.call(target, key);
          }
          try {
            maplebirch.tool.merge(target, defaults, { arrayBehaviour: "merge", filterFn});
          } catch (err) {
            this.log?.(`属性填充失败: ${err?.message || err}`, 'ERROR');
          }
        }
      };

      return Object.freeze({
        /**
         * 添加迁移脚本
         * @param {string} fromVersion - 起始版本号 (格式: 'x.y.z')
         * @param {string} toVersion - 目标版本号 (格式: 'x.y.z')
         * @param {Function} migrationFn - 迁移函数，格式: (data, utils) => void
         */
        add: (fromVersion, toVersion, migrationFn) => {
          if (typeof migrationFn !== 'function') return;
          const exists = migrations.some(m => m.fromVersion === fromVersion && m.toVersion === toVersion);
          if (exists) this.log?.(`重复迁移: ${fromVersion} -> ${toVersion}`, 'WARN');
          migrations.push({ fromVersion, toVersion, migrationFn });
        },

        /**
         * 执行数据迁移
         * @param {Object} data - 待迁移的数据对象 (需包含 version 属性)
         * @param {string} targetVersion - 要迁移到的目标版本
         * @throws {Error} 迁移失败时抛出异常
         */
        run: (data, targetVersion) => {
          data.version ||= '0.0.0';
          let currentVersion = data.version;
          if (this.#compareVersions(currentVersion, targetVersion) >= 0) return;

          const sortedMigrations = [...migrations].sort((a, b) => this.#compareVersions(a.fromVersion, b.fromVersion) ||this.#compareVersions(a.toVersion, b.toVersion));

          while (this.#compareVersions(currentVersion, targetVersion) < 0) {
            const migration = sortedMigrations.find(m =>this.#compareVersions(m.fromVersion, currentVersion) === 0 &&this.#compareVersions(m.toVersion, targetVersion) <= 0);
            if (!migration) {
              this.log?.(`迁移中断: ${currentVersion} -> ${targetVersion}`, 'WARN');
              break;
            }
            try {
              this.log?.(`迁移中: ${currentVersion} → ${migration.toVersion}`, 'DEBUG');
              migration.migrationFn(data, utils);
              data.version = currentVersion = migration.toVersion;
            } catch (e) {
              this.log?.(`迁移失败: ${e?.message || e}`, 'ERROR');
              throw e;
            }
          }
          if (this.#compareVersions(currentVersion, targetVersion) < 0) {
            this.log?.(`强制设置版本: ${targetVersion}`, 'WARN');
            data.version = targetVersion;
          }
        },

        utils
      });
    }

    #compareVersions(a, b) {
      const parse = v => String(v || '0.0.0').split('.').map(Number);
      const v1 = parse(a);
      const v2 = parse(b);
      for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
        const diff = (v1[i] || 0) - (v2[i] || 0);
        if (diff) return diff;
      }
      return 0;
    }
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

  // 文本系统 - 用于注册和渲染文本片段
/**
 *   - `text(content: string, style?: string)`：添加文本（可选样式），自动添加空格
 *   - `line(content?: string, style?: string)`：添加换行（可带文本内容）
 *   - `wikify(content: string)`：解析并添加维基语法文本
 *   - `raw(content: any)`：直接添加原始内容（DOM节点/字符串）
 *   - `ctx: object`：渲染上下文数据
 * 
 * 所有方法支持链式调用，例如：
 *   text("你好").line("世界").text("！", "bold");
 * 
 * @example // 基本注册和渲染
 * // 注册处理器
 * text.reg("welcome", ({ text }) => {
 *   text("欢迎来到奇幻世界！");
 * });
 * 
 * // 在SugarCube中使用
 * <<maplebirchTextOutput "welcome">>
 * 
 * // 生成结果：
 * // <span>欢迎来到奇幻世界！ </span>
 * 
 * @example // 带样式的文本
 * // 注册处理器
 * text.reg("warning", ({ text, line }) => {
 *   text("危险区域！", "red").line("请小心前进", "yellow");
 * });
 * 
 * // 在SugarCube中使用
 * <<maplebirchTextOutput "warning">>
 * 
 * // 生成结果：
 * // <span class="red">危险区域！ </span><br>
 * // <span class="yellow">请小心前进 </span>
 * 
 * @example // 使用上下文
 * // 注册处理器
 * text.reg("character_info", ({ text, ctx }) => {
 *   text(`姓名：${ctx.name}`)
 *     .text(`职业：${ctx.class}`)
 *     .text(`等级：${ctx.level}`);
 * });
 * 
 * // 在SugarCube中使用
 * <<set $player = { name: "艾拉", class: "游侠", level: 12 }>>
 * <<maplebirchTextOutput "character_info" $player>>
 * 
 * // 生成结果：
 * // <span>姓名：艾拉 </span>
 * // <span>职业：游侠 </span>
 * // <span>等级：12 </span>
 * 
 * @example // 维基语法解析
 * // 注册处理器
 * text.reg("npc_dialogue", ({ text, wikify, ctx }) => {
 *   text(`${ctx.npcName}:`).line();
 *   wikify(`"旅途小心，$player。[[前往${ctx.location}->NextScene]]"`);
 * });
 * 
 * // 在SugarCube中使用
 * <<set $npc = { npcName: "老巫师", location: "黑森林" }>>
 * <<maplebirchTextOutput "npc_dialogue" $npc>>
 * 
 * // 生成结果：
 * // <span>老巫师: </span><br>
 * // <span class="macro-text">"旅途小心，小明。</span>
 * // <a class="link-internal" href="NextScene">前往黑森林</a>
 * // <span class="macro-text">"</span>
 * 
 * @example // 组合元素与动态内容
 * // 注册处理器
 * text.reg("quest", ({ text, line, raw, ctx }) => {
 *   text(`任务：${ctx.title}`, "quest-title").line(ctx.description).line();
 *   
 *   const progress = document.createElement("progress");
 *   progress.value = ctx.progress;
 *   progress.max = 100;
 *   raw(progress);
 *   
 *   line(`进度：${ctx.progress}%`, "small-text");
 * });
 * 
 * // 在SugarCube中使用
 * <<set $quest = {
 *   title: "击败洞穴巨魔",
 *   description: "清除洞穴中的巨魔威胁",
 *   progress: 30
 * }>>
 * <<maplebirchTextOutput "quest" $quest>>
 * 
 * // 生成结果：
 * // <span class="quest-title">任务：击败洞穴巨魔 </span><br>
 * // <span>清除洞穴中的巨魔威胁 </span><br>
 * // <progress value="30" max="100"></progress><br>
 * // <span class="small-text">进度：30% </span>
 * 
 * @example // 嵌套渲染
 * // 注册处理器
 * text.reg("scene_container", async ({ text, raw, ctx }) => {
 *   text("=== 场景开始 ===").line();
 *   
 *   const nestedFrag = await text.renderFragment([
 *     "location_description",
 *     "npc_dialogue"
 *   ], ctx);
 *   
 *   raw(nestedFrag);
 *   
 *   text("=== 场景结束 ===").line();
 * });
 * 
 * text.reg("location_description", ({ text, ctx }) => {
 *   text(`你来到了${ctx.location}。`).line();
 * });
 * 
 * text.reg("npc_dialogue", ({ text, ctx }) => {
 *   text(`${ctx.npcName}说：`).text(ctx.dialogue);
 * });
 * 
 * // 在SugarCube中使用
 * <<set $sceneCtx = {
 *   location: "神秘洞穴",
 *   npcName: "守护者",
 *   dialogue: "这里藏着古老的宝藏。"
 * }>>
 * <<maplebirchTextOutput "scene_container" $sceneCtx>>
 * 
 * // 生成结果：
 * // <span>=== 场景开始 === </span><br>
 * // <span>你来到了神秘洞穴。 </span><br>
 * // <span>守护者说： </span><span>这里藏着古老的宝藏。 </span>
 * // <span>=== 场景结束 === </span><br>
 */
  class textSystem {
    constructor(logger, rng) {
      this.log = logger;
      this.store = new Map();
      this.rng = rng;
      this.Wikifier = null;
    }

    _getWikifier(wikifier) {
      if (!wikifier) return false;
      this.Wikifier = wikifier;
      return true;
    }

    /**
     * 注册文本处理器函数
     * @param {string} key - 要注册的文本片段标识键
     * @param {function} handler - 文本生成函数。接收优化后的渲染工具对象：
     *   - `text(content: string, style?: string)`：添加文本（可选样式），自动处理空格
     *   - `line(content?: string, style?: string)`：添加换行（可带文本内容）
     *   - `wikify(content: string)`：解析并添加维基语法文本
     *   - `raw(content: any)`：直接添加原始内容（DOM节点/字符串）
     *   - `ctx: object`：渲染上下文数据（context）
     * @param {string} [id] - 可选的自定义处理器ID
     * @example // 基本文本
     * text.reg("welcome", ({ text }) => {
     *   text("欢迎来到冒险世界！");
     * });
     * @example // 样式文本+换行
     * text.reg("warning", ({ text, line }) => {
     *   text("危险区域！", "red-text")
     *     .line("请小心前进", "yellow-text");
     * });
     * @example // 维基语法+上下文
     * text.reg("npc_dialogue", ({ text, wikify, ctx }) => {
     *   text(`${ctx.npcName}:`).line();
     *   wikify(`"你好旅行者，[[前往${ctx.location}->NextScene]]"`);
     * });
     * @example // 组合元素
     * text.reg("quest", ({ text, line, raw }) => {
     *   text("任务：击败巨魔", "quest-title")
     *     .line("奖励：50金币", "gold-text")
     *     .line();
     *   const progress = document.createElement("progress");
     *   progress.value = 30;
     *   raw(progress);
     * });
     */
    reg(key, handler, id) {
      if (!key || typeof handler !== 'function') {
        this.log('注册失败: 参数无效', 'WARN');
        return false;
      }
      if (!this.store.has(key)) this.store.set(key, []);
      const finalId = id ?? `ts_${this.rng.get({ min: 0, max: 0xFFFFFFFF })}`;
      this.store.get(key).push({ id: finalId, fn: handler });
      this.log(`已注册处理器 [${key}] (ID: ${finalId})`, 'DEBUG');
      return finalId;
    }

    unreg(key, idOrHandler) {
      if (!this.store.has(key)) return false;
      if (!idOrHandler) {
        this.store.delete(key);
        this.log(`已清除键值所有处理器 [${key}]`, 'DEBUG');
        return true;
      }
      const originalCount = this.store.get(key).length;
      const arr = this.store.get(key).filter(h => h.id !== idOrHandler && h.fn !== idOrHandler);
      if (arr.length) {
        this.store.set(key, arr);
        const removedCount = originalCount - arr.length;
        this.log(`已移除键值 [${key}] 的 ${removedCount} 个处理器`, 'DEBUG');
      } else {
        this.store.delete(key);
        this.log(`已移除键值所有处理器 [${key}]`, 'DEBUG');
      }
      return true;
    }

    clear() {
      const keyCount = this.store.size;
      this.store.clear();
      this.log(`已清除所有键值 (共 ${keyCount} 个)`, 'DEBUG');
    }

    async renderFragment(keys, context = {}) {
      const fragment = document.createDocumentFragment();
      const tools = {
        ctx: context,
        text: (content, style) => {
          if (!content) return tools;
          const el = document.createElement('span');
          if (style) el.classList.add(style);
          el.textContent = (content == null ? '' : String(content)) + ' ';
          fragment.appendChild(el);
          return tools;
        },
        line: (content, style) => {
          fragment.appendChild(document.createElement('br'));
          if (content) tools.text(content, style);
          return tools;
        },
        wikify: content => {
          if (this.Wikifier) {
            fragment.append(this.Wikifier.wikifyEval(String(content)));
          } else {
            tools.text(content);
          }
          return tools;
        },
        raw: content => {
          if (content instanceof Node) {
            fragment.appendChild(content);
          } else {
            fragment.appendChild(document.createTextNode(String(content)));
          }
          return tools;
        }
      };
      const list = Array.isArray(keys) ? keys.slice() : (keys == null ? [] : [keys]);
      for (const key of list) {
        if (!this.store.has(key)) {
          this.log(`渲染片段: 未找到键值 [${key}]`, 'DEBUG');
          continue;
        }
        const handlers = this.store.get(key).slice();
        this.log(`开始渲染键值 [${key}] (${handlers.length} 个处理器)`, 'DEBUG');
        for (const { fn } of handlers) {
          try {
            const res = fn(tools);
            if (res instanceof Promise) await res;
          } catch (e) {
            this.log(`处理器错误 [${key}]: ${e?.message || e}`, 'ERROR');
          }
        }
      }

      return fragment;
    }

    async renderToMacroOutput(macro, keys, context = {}) {
      if (!keys) return;
      try {
        const frag = await this.renderFragment(keys, context);
        if (macro?.output?.append) {
          macro.output.append(frag);
        } else if (macro?.output?.appendChild) {
          macro.output.appendChild(frag);
        } else {
          document.body.appendChild(frag);
        }
      } catch (e) {
        this.log(`渲染到宏输出失败: ${e?.message || e}`, 'ERROR');
      }
    }

    makeMacroHandler(options = {}) {
      const cfg = { allowCSV: true, ...options };
      const self = this;
      return function() {
        const raw = this.args && this.args.length ? this.args[0] : null;
        let keys = raw;
        if (cfg.allowCSV && typeof raw === 'string' && raw.includes(',')) {
          keys = raw.split(',').map(s => s.trim()).filter(Boolean);
        }
        (async () => await self.renderToMacroOutput(this, keys, {}))();
      };
    }
  }

  // 模块提示系统 - 用于显示和搜索模块提示信息
  class modhintSystem {
    constructor(logger) {
      this.log = logger;;
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
      this.log = logger;

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
              <span class="gold"><<= maplebirch.t("Maplebirch Frameworks")>></span>
            </div>
            <div class="settingsToggleItem">
              <span class="gold"><<= maplebirch.t("Current Mods Language Setting")>>:</span>
              <<set _selectedLang to maplebirch.lang.language>>
              <<set _langOptions = {
                [maplebirch.t('English')]: "EN",
                [maplebirch.t('Chinese')]: "CN",
                [maplebirch.t('Japanese')]: "JP"
              }>>
              <<listbox "_selectedLang" autoselect>>
                <<optionsfrom _langOptions>>
              <</listbox>>
            </div>
            <div class="settingsToggleItem">
              <label><<checkbox "$options.maplebirch.debug" false true autocheck>><<= maplebirch.t('DEBUGMode')>></label>
            </div>
            <div class="settingsToggleItemWide">
              <span class="gold"><<= maplebirch.t('Maplebirch',true) + maplebirch.autoTranslate('侧边栏位置选择')>>：</span>
              <span class="tooltip-anchor linkBlue" tooltip="在下次打开界面时更新">(?)</span>
              <br>
              <<set _modHintLocation = {
                [maplebirch.t('mobile client')]: "mobile",
                [maplebirch.t('desktop client')]: "desktop",
                [maplebirch.t('disable')]: "disable"
              }>>
              <<listbox "$options.maplebirch.modHint" autoselect>>
                <<optionsfrom _modHintLocation>>
              <</listbox>>
            </div>
          </div><hr>`,
        Cheats : `
          <div class="settingsGrid">
            <div class="settingsHeader options">
              <span class="gold"><<= maplebirch.t("Mods Cheats")>></span>
            </div>
            <<if $options.maplebirch.debug>><<run maplebirch.trigger("update")>>
              <div class="settingsToggleItem"><label onclick='maplebirch.trigger("update")'><<checkbox "$options.maplebirch.sandbox.V" false true autocheck>> V <<= maplebirch.t('permission')>></label></div>
              <div class="settingsToggleItem"><label onclick='maplebirch.trigger("update")'><<checkbox "$options.maplebirch.sandbox.T" false true autocheck>> T <<= maplebirch.t('permission')>></label></div>
              <div class="settingsToggleItem"><label onclick='maplebirch.trigger("update")'><<checkbox "$options.maplebirch.sandbox.maplebirch" false true autocheck>> Maplebirch <<= maplebirch.t('permission')>></label></div>
              <div class="settingsToggleItem"><label onclick='maplebirch.trigger("update")'><<checkbox "$options.maplebirch.sandbox.window" false true autocheck>> window <<= maplebirch.t('permission')>>(完全权限)</label></div>
              <div id="ConsoleCheat" class="settingsToggleItemWide">
                <<set _CodeCheater to maplebirch.t('Code Cheater')>>
                <details class="JSCheatConsole">
                  <summary class="JSCheatConsole">JavaScript <<= maplebirch.t('Code Cheater')>></summary>
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
                  <summary class="TwineCheatConsole">Twine <<= maplebirch.t('Code Cheater')>></summary>
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
        NPCinit : `<<run maplebirch.npc._vanillaNPCInit(_nam)>>`
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
          { src: '</div>\n\t<<closeButton>>\n<</widget>>\n\n<<widget "titleSaves">>', applybefore : '\t<<set $_name to maplebirch.t("Mods Settings")>>\n\t\t<<button $_name>>\n\t\t\t<<toggleTab>>\n\t\t\t<<replace #customOverlayContent>><<maplebirchOptions>><</replace>>\n\t\t<</button>>\n\t' },
          { src: '</div>\n\t<<closeButton>>\n<</widget>>\n\n<<widget "titleOptions">>', applybefore : '\t<<set $_name to maplebirch.t("Mods")>>\n\t\t<<button $_name>>\n\t\t\t<<toggleTab>>\n\t\t\t<<replace #cheatsShown>><<maplebirchCheats>><</replace>>\n\t\t\t<<run $("#customOverlayContent").scrollTop(0);>>\n\t\t<</button>>\n\t' },
          { src: '</div>\n\t<<closeButton>>\n<</widget>>\n\n<<widget "titleFeats">>', applybefore : '\t<<set $_name to maplebirch.t("Mods Statistics")>>\n\t\t<<button $_name>>\n\t\t\t<<toggleTab>>\n\t\t\t<<replace #customOverlayContent>><<maplebirchStatistics>><</replace>>\n\t\t<</button>>\n\t' }
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
          { srcmatch: /\t\t\t<<NPC_CN_NAME _npc>>|\t\t\t_npc/, to: '\t\t<<if Object.keys(maplebirch.npc.data).includes(_npc) && maplebirch.tool.widget.Macro.has(_npc+"relationshiptext")>>\n\t\t\t<<= maplebirch.autoTranslate(_npc)>><<= "<<"+_npc+"relationshiptext>>">>\n\t\t<<else>>\n\t\t\t<<= maplebirch.autoTranslate(_npc)>>' },
          { src: '<</if>>\n\t<</switch>>\n<</widget>>', to: '<</if>>\n\t\t<</if>>\n\t<</switch>>\n<</widget>>' },
          { src: '<</if>>\n<</widget>>\n\n<<widget "initNNPCClothes">>', applybefore: '\t<<maplebirchNPCinit _nam>>\n\t' }
        ],
        'Widgets Settings': [
          { srcmatch: /<<set\s+_npcList\s*\[\s*clone\s*\(\s*\$NPCNameList\s*\[\s*\$_i\s*\]\s*\)\s*(?:\.replace\s*\(\s*"[^"]+"\s*,\s*"[^"]+"\s*\)\s*)*\]\s+to\s+clone\s*\(\s*\$_i\s*\)\s*>>/, to: '<<set _npcList[maplebirch.autoTranslate(clone($NPCNameList[$_i]))] to clone($_i)>>' },
          { srcmatch: /<<run delete _npcList\["(?:象牙怨灵|Ivory Wraith)"\]>>/, to: '<<run delete _npcList[maplebirch.autoTranslate("Ivory Wraith")]>>' },
          { srcmatch: /\t<<NPC_CN_NAME \$NPCName\[_npcId\].nam>>|\t\$NPCName\[_npcId\].nam/, to: '\t<<= maplebirch.autoTranslate($NPCName[_npcId].nam)>>' },
          { srcmatch: /\$NPCName\[_npcId\]\.title|<<print\s+\$NPCName\s*\[\s*\_npcId\s*\]\s*\.title\s*(\s*\.replace\s*\(\s*"[^"]+"\s*,\s*"[^"]+"\s*\)\s*)+>>/, to: '\t<<= maplebirch.autoTranslate($NPCName[_npcId].title)>>' },
        ],
        Widgets: [
          { src: 'T.getStatConfig = function(stat) {', applybefore: 'maplebirch.npc.applyStatDefaults(statDefaults);\n\t\t\t' },
          { srcmatchgroup: /\t_npcData.nam|\t<<NPC_CN_NAME _npcData.nam>>/g, to: '\t<<= maplebirch.autoTranslate(_npcData.nam)>>' },
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
    async patchPassage(passage, title) { 
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
      this.log = logger;
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
          const nameValue = typeof traits.name === 'function' ? traits.name() : traits.name;
          const existingIndex = this.traitsData.findIndex(t => t.title === mappedTitle && t.name === nameValue);
          if (existingIndex >= 0) {
            this.traitsData[existingIndex] = {
              title: mappedTitle,
              name: nameValue,
              colour: traits.colour,
              has: traits.has,
              text: traits.text
            };
          } else {
            this.traitsData.push({
              title: mappedTitle,
              name: nameValue,
              colour: traits.colour,
              has: traits.has,
              text: traits.text
            });
          }
        }
      });
    }

    initTraits(data) {
      const titleMap = this.#getTraits(data);
      const result = maplebirch.tool.clone(data);
      this.traitsData.forEach(trait => {
        const title = trait.title;
        const colourValue = typeof trait.colour === 'function' ? trait.colour() : trait.colour || '';
        const hasValue = typeof trait.has === 'function' ? trait.has() : trait.has || false;
        const textValue = typeof trait.text === 'function' ? trait.text() : trait.text || '';
        if (titleMap[title] !== undefined) {
          result[titleMap[title]].traits.push({
            name: trait.name,
            colour: colourValue,
            has: hasValue,
            text: textValue
          });
        } else {
          result.push({
            title: title,
            traits: [{
              name: trait.name,
              colour: colourValue,
              has: hasValue,
              text: textValue
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
      const filterFn = (key, value, depth) => {
        if (depth === 1) return key === "folder" || ['base', 'emissive', 'reflective', 'layerTop'].includes(key);
        return true;
      }
      return maplebirch.tool.merge(target, source, { arrayBehaviour: "merge", filterFn });
    }
  }

  class toolsModule {
    static tools = {
      widget: widgetSystem,
      migration: migrationSystem,
      random: randomSystem,
      text: textSystem,
      modhint: modhintSystem,
      console: consoleTools,
      framework: frameworks,
      other: othersSystem,
    }

    constructor() {
      this.createLogger = createLogger;
      this.widget = new widgetSystem(createLogger('widget'));
      this.migration = new migrationSystem(createLogger('migration'));
      this.random = new randomSystem(createLogger('random'));
      this.text = new textSystem(createLogger('text'), this.random)
      this.modhint = new modhintSystem(createLogger('modhint'));
      this.console = new consoleTools(createLogger('console'));
      this.framework = new frameworks(createLogger('framework'));
      this.linkzone = applyLinkZone;
      this.other = new othersSystem(createLogger('other'));
    }
    
    clone = clone;
    merge = merge;
    equal = equal;
    contains = arrayContains;
    loadImg = loadImageWithModLoader;

    async preInit() {
      maplebirch.once(':definewidget', () => {
        this.widget.defineMacro('maplebirchTextOutput', () => this.text.makeMacroHandler());
      });
      
      maplebirch.once(':finally', () => {
        this.linkzone.removeZones();
        this.linkzone.apply({ debug: true });
      });
      maplebirch.on(':passagedisplay', () => this.linkzone.apply(), 'applylinkzone');
    }

    Init() {
      this.other.applyLocationUpdates();
    }

    postInit() {

    }
  }

  maplebirch.register('tool', new toolsModule(), ['state']);
})();