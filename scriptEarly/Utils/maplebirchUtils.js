(async() => {
  if (!window.maplebirch) return;
  const maplebirch = window.maplebirch;

  /**
   *  - Date对象：创建新实例
   *  - RegExp对象：复制正则表达式
   *  - Map/Set对象：递归克隆元素
   *  - ArrayBuffer和TypedArray：复制底层缓冲区
   *  - 函数：直接返回原函数
   *  - 数组：递归克隆元素
   *  - 普通对象：复制所有可枚举属性（包括符号属性）
   * @param {any} source - 要克隆的对象（任意类型）
   * @param {Object} [options={}] - 克隆选项
   * @param {boolean} [options.deep=true] - 是否深克隆（默认true）
   * @param {boolean} [options.preservePrototype=true] - 是否保留原型链（默认true）
   * @param {WeakMap} [map=new WeakMap()] - 内部WeakMap(处理循环引用，用户通常无需传递)
   * @returns {any} 克隆后的对象
   * 
   * @example
   * // 深克隆对象
   * const obj = { a: 1, b: { c: 2 } };
   * const cloned = clone(obj);
   * obj.b.c = 3; // 不影响克隆对象
   * console.log(cloned.b.c); // 2
   * 
   * @example
   * // 浅克隆数组
   * const arr = [1, [2, 3]];
   * const shallowCopy = clone(arr, { deep: false });
   * arr[1][0] = 99; // 影响克隆数组
   * console.log(shallowCopy[1][0]); // 99
   */
  function clone(source, options = {}, map = new WeakMap()) {
    const { deep = true, preservePrototype = true } = options;
    if (source === null || typeof source !== 'object') return source;
    if (map.has(source)) return map.get(source);
    if (source instanceof Date) return new Date(source.getTime());
    if (source instanceof RegExp) return new RegExp(source.source, source.flags);
    if (source instanceof Map) {
      const copy = new Map();
      map.set(source, copy);
      source.forEach((value, key) => copy.set(deep ? clone(key, options, map) : key, deep ? clone(value, options, map) : value));
      return copy;
    }
    
    if (source instanceof Set) {
      const copy = new Set();
      map.set(source, copy);
      source.forEach(value => copy.add(deep ? clone(value, options, map) : value));
      return copy;
    }
    
    if (ArrayBuffer.isView(source)) {
      return new source.constructor(
        source.buffer.slice(0),
        source.byteOffset,
        source.length || source.byteLength
      );
    }
    if (source instanceof ArrayBuffer) return source.slice(0);
    if (typeof source === 'function') return source;
    if (Array.isArray(source)) {
      const copy = [];
      map.set(source, copy);
      for (let i = 0; i < source.length; i++) copy[i] = deep ? clone(source[i], options, map) : source[i];
      return copy;
    }
    
    const copy = preservePrototype ? Object.create(Object.getPrototypeOf(source)) : {};
    map.set(source, copy);
    
    const keys = [...Object.getOwnPropertyNames(source), ...Object.getOwnPropertySymbols(source)];
    for (const key of keys) {
      const descriptor = Object.getOwnPropertyDescriptor(source, key);
      if (descriptor && !descriptor.enumerable) continue;
      const value = source[key];
      copy[key] = deep ? clone(value, options, map) : value;
    }
    
    return copy;
  }

  /**
   *  - 基本类型：直接使用 === 比较
   *  - 日期对象：比较时间戳
   *  - 正则表达式：比较source和flags
   *  - 数组：递归比较每个元素
   *  - 普通对象：递归比较所有自身可枚举属性
   *  - 其他对象类型：使用默认比较规则
   * @param {any} a - 第一个比较值
   * @param {any} b - 第二个比较值
   * @returns {boolean} 是否相等
   * 
   * @example
   * // 比较日期对象
   * equal(new Date(2023, 0, 1), new Date(2023, 0, 1)); // true
   * 
   * @example
   * // 比较嵌套对象
   * equal({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] }); // true
   * 
   * @example
   * // 比较正则表达式
   * equal(/abc/i, /abc/i); // true
   */
  function equal(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return a === b;
    if (typeof a !== 'object' || typeof b !== 'object') return a === b;
    if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
    if (a instanceof RegExp && b instanceof RegExp) return a.source === b.source && a.flags === b.flags;
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) if (!equal(a[i], b[i])) return false;
      return true;
    }
    
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    
    for (const key of aKeys) {
      if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
      if (!equal(a[key], b[key])) return false;
    }
    
    return true;
  }

  /**
   * - 基本类型：直接覆盖
   * - 对象：递归合并
   * - 数组：根据arrayBehaviour选项处理：
   *    - "replace"：替换整个数组（默认）
   *    - "concat"：连接两个数组
   *    - "merge"：递归合并对应索引的元素
   * @param {Object} target - 目标对象（将被修改）
   * @param {...Object} sources - 要合并的源对象
   * @param {Object} [options={}] - 合并选项
   * @param {string} [options.arrayBehaviour="replace"] - 数组合并策略("replace", "concat", "merge")
   * @param {Function} [options.filterFn] - 属性过滤函数(key, value, depth) => boolean
   * @returns {Object} 合并后的对象（即修改后的target）
   * 
   * @example
   * // 合并数组
   * const target = { arr: [1, 2] };
   * merge(target, { arr: [3, 4] }, { arrayBehaviour: "concat" });
   * // 结果: { arr: [1, 2, 3, 4] }
   * 
   * @example
   * // 递归合并对象
   * const target = { a: { b: 1, c: 2 } };
   * merge(target, { a: { c: 3, d: 4 } });
   * // 结果: { a: { b: 1, c: 3, d: 4 } }
   * 
   * @example
   * // 使用属性过滤
   * merge({}, { public: "info", secret: "data" }, {
   *   filterFn: (key) => key !== "secret"
   * });
   * // 结果: { public: "info" }
   */
  function merge(target, ...sources) {
    const options = typeof sources[sources.length - 1] === "object" && !Array.isArray(sources[sources.length - 1]) ? sources.pop() : {};
    const { arrayBehaviour = "replace", filterFn = null } = options;
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
   *  - 'any': 包含任意一个元素即返回true（默认）
   *  - 'all': 必须包含所有元素才返回true
   *  - 'none': 不包含任何元素才返回true
   * @param {Array} arr - 目标数组
   * @param {any|Array} value - 要查找的值或值数组
   * @param {Object} [options={}] - 配置选项
   * @param {string} [options.mode='any'] - 匹配模式('any', 'all', 'none')
   * @param {boolean} [options.caseSensitive=true] - 字符串是否区分大小写
   * @param {Function} [options.comparator] - 自定义比较函数(item, value) => boolean
   * @param {boolean} [options.deepEqual=false] - 是否使用深度相等比较
   * @returns {boolean} 检查结果
   * 
   * @example
   * // 检查单个元素
   * contains([1, 2, 3], 2); // true
   * 
   * @example
   * // 检查多个元素(all模式)
   * contains([1, 2, 3], [1, 2], { mode: 'all' }); // true
   * 
   * @example
   * // 检查多个元素(none模式)
   * contains([1, 2, 3], [4, 5], { mode: 'none' }); // true
   * 
   * @example
   * // 不区分大小写检查
   * contains(['a', 'B'], 'b', { caseSensitive: false }); // true
   * 
   * @example
   * // 深度对象检查
   * contains([{ a: 1 }], { a: 1 }, { deepEqual: true }); // true
   */
  function contains(arr, value, options = {}) {
    if (!Array.isArray(arr)) return false;
    const { 
      mode = 'any', 
      caseSensitive = true, 
      comparator = null,
      deepEqual = false
    } = options;
    if (!Array.isArray(value)) {
      if (typeof comparator === 'function') return arr.some(item => comparator(item, value));
      if (deepEqual) return arr.some(item => equal(item, value));
      if (!caseSensitive && typeof value === 'string') {
        const lv = value.toLowerCase();
        return arr.some(item => typeof item === 'string' && item.toLowerCase() === lv);
      }
      if (Number.isNaN(value)) return arr.some(item => Number.isNaN(item));
      return arr.includes(value);
    }
    switch (mode) {
      case 'any': return value.some(v => contains(arr, v, options));
      case 'all': return value.every(v => contains(arr, v, options));
      case 'none': return !value.some(v => contains(arr, v, options));
      default: throw new Error(`Invalid mode: ${mode}`);
    }
  }

  /**
   *  - random()：返回0-1之间的随机浮点数
   *  - random(max)：返回0-max之间的随机整数
   *  - random(min, max)：返回min-max之间的随机整数
   *  - random(min, max, true)：返回min-max之间的随机浮点数
   *  - random({ min, max, float })：使用配置对象
   * @param {number|Object} [min] - 最小值或配置对象
   * @param {number} [max] - 最大值
   * @param {boolean} [float=false] - 是否生成浮点数（默认false）
   * @returns {number} 随机数
   * 
   * @example
   * // 生成0-1之间的随机浮点数
   * random(); // 0.756
   * 
   * @example
   * // 生成10-20之间的整数
   * random(10, 20); // 15
   * 
   * @example
   * // 生成5-10之间的浮点数
   * random(5, 10, true); // 7.231
   * 
   * @example
   * // 使用配置对象
   * random({ min: 5, max: 10, float: true }); // 7.231
   */
  function random(min, max, float = false) {
    if (min === undefined && max === undefined) return Math.random();
    if (max === undefined) {
      if (typeof min === 'object' && min !== null) {
        const { min: mn = 0, max: mx = 1, float: flt = false } = min;
        return flt ? (Math.random() * (mx - mn) + mn) : Math.floor(Math.random() * (mx - mn + 1)) + mn;
      }
      return Math.floor(Math.random() * min);
    }
    return float ? (Math.random() * (max - min) + min) : Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   *  - either([item1, item2, ...], options)
   *  - either(item1, item2, ..., options)
   * @param {Array|any} itemsOrA - 选项数组或第一个选项
   * @param {...any} rest - 其他选项或配置对象
   * @param {Object} [options] - 配置选项
   * @param {number[]} [options.weights] - 选项权重数组（长度必须与选项一致）
   * @param {boolean} [options.allowNull=false] - 是否允许返回null（默认false）
   * @returns {any} 随机选择的选项（可能为null）
   * 
   * @example
   * // 简单随机选择
   * either(['a', 'b', 'c']); // 'b'
   * 
   * @example
   * // 加权随机选择
   * either(['a', 'b'], { weights: [0.8, 0.2] }); // 80%概率选'a'
   * 
   * @example
   * // 允许返回空值
   * either(['a', 'b'], { allowNull: true }); // 33%概率返回null
   * 
   * @example
   * // 直接传递选项
   * either('cat', 'dog', { weights: [0.3, 0.7] });
   */
  function either(itemsOrA, ...rest) {
    let options = {};
    let items;
    if (Array.isArray(itemsOrA)) {
      items = itemsOrA;
      if (rest.length && typeof rest[rest.length - 1] === 'object') options = rest.pop();
    } else {
      items = [itemsOrA, ...rest];
      if (typeof items[items.length - 1] === 'object' && !Array.isArray(items[items.length - 1])) options = items.pop();
    }
    const { weights = null, allowNull = false } = options;
    if (!items.length) return undefined;
    if (weights) {
      if (!Array.isArray(weights)) throw new TypeError('weights must be an array');
      if (weights.length !== items.length) throw new Error(`weights length (${weights.length}) must match items length (${items.length})`);
      const hasNegative = weights.some(w => w < 0);
      if (hasNegative) throw new Error('weights cannot contain negative values');
      const total = weights.reduce((s, w) => s + w, 0);
      if (total <= 0) return undefined;
      const r = random(0, 1, true);
      let cumulative = 0;
      for (let i = 0; i < weights.length; i++) {
        cumulative += weights[i] / total;
        if (r <= cumulative) return items[i];
      }
      return items[items.length - 1];
    }
    if (allowNull && random(0, 1, true) < 1 / (items.length + 1)) return null;
    return items[random(0, items.length - 1)];
  }

  /**
   * 高级条件选择器，支持多种匹配模式和链式调用
   * 
   * @example <caption>基本用法（单一类型匹配）</caption>
   * // 创建数字选择器（所有条件都是数字类型）
   * const numberSelector = new selectCase()
   *   .case(1, 'One')
   *   .case(2, 'Two')
   *   .caseRange(3, 5, 'Three to Five')
   *   .caseCompare('>', 10, 'Greater than Ten')
   *   .else('Other number');
   * 
   * numberSelector.match(1); // 'One'
   * numberSelector.match(4); // 'Three to Five'
   * numberSelector.match(15); // 'Greater than Ten'
   * numberSelector.match(7); // 'Other number'
   * 
   * @example <caption>基本用法（字符串匹配）</caption>
   * // 创建字符串选择器（所有条件都是字符串类型）
   * const colorSelector = new selectCase()
   *   .case('red', '#FF0000')
   *   .case('green', '#00FF00')
   *   .case('blue', '#0000FF')
   *   .caseIncludes(['light', 'pale'], 'Light variant') // 包含子字符串匹配
   *   .caseRegex(/dark|black/i, 'Dark variant') // 正则表达式匹配
   *   .else('#FFFFFF');
   * 
   * colorSelector.match('green'); // '#00FF00'
   * colorSelector.match('light blue'); // 'Light variant'
   * colorSelector.match('dark red'); // 'Dark variant'
   * colorSelector.match('yellow'); // '#FFFFFF'
   * 
   * ### 方法参数说明：
   * 
   * **caseIncludes(substrings, result)**
   *   - 添加子字符串包含匹配条件
   *   - @param {string|string[]} substrings - 要匹配的子字符串或子字符串数组
   *   - @param {any} result - 匹配成功时返回的结果（可以是值或函数）
   *   - 当输入值是字符串且包含任意一个substrings中的子字符串时匹配
   * 
   * **caseRegex(regex, result)**
   *   - 添加正则表达式匹配条件
   *   - @param {RegExp} regex - 用于匹配的正则表达式对象
   *   - @param {any} result - 匹配成功时返回的结果（可以是值或函数）
   *   - 当输入值是字符串且匹配给定的正则表达式时匹配
   * 
   * **casePredicate(fn, result)**
   *   - 添加自定义条件函数
   *   - @param {Function} fn - 自定义条件函数，形式为 (input, meta) => boolean
   *   - @param {any} result - 匹配成功时返回的结果（可以是值或函数）
   *   - 当条件函数返回true时匹配，该函数接收输入值和元数据对象
   * 
   * **caseIn(values, result)**
   *   - 添加集合包含匹配条件
   *   - @param {Array} values - 要匹配的值数组
   *   - @param {any} result - 匹配成功时返回的结果
   *   - 当输入值严格等于values数组中的任意一个值时匹配
   * 
   * **caseRange(min, max, result)**
   *   - 添加数值范围匹配条件
   *   - @param {number} min - 范围最小值（包含）
   *   - @param {number} max - 范围最大值（包含）
   *   - @param {any} result - 匹配成功时返回的结果
   *   - 当输入值是数字且在[min, max]范围内时匹配
   * 
   * **caseCompare(comparator, value, result)**
   *   - 添加数值比较条件
   *   - @param {string} comparator - 比较运算符（'<', '<=', '>', '>='）
   *   - @param {number} value - 要比较的数值
   *   - @param {any} result - 匹配成功时返回的结果
   *   - 当输入值是数字且满足比较条件时匹配
   */
  class selectCase {
    constructor() {
      this.cases = [];
      this.defaultResult = null;
      this.valueType = null;
      this.allowMixedTypes = false;
    }

    case(condition, result) {
      if (typeof condition === 'function') {
        this.allowMixedTypes = true;
        this.cases.push({ type: 'predicate', condition, result });
      } else {
        this.#validateType(condition);
        this.cases.push({ type: 'exact', condition, result });
      }
      return this;
    }

    casePredicate(fn, result) {
      if (typeof fn !== 'function') throw new TypeError('predicate must be a function');
      this.allowMixedTypes = true;
      this.cases.push({ type: 'predicate', condition: fn, result });
      return this;
    }

    caseRange(min, max, result) {
      if (typeof min !== 'number' || typeof max !== 'number') throw new TypeError('range values must be numbers');
      this.#validateType(min);
      this.cases.push({ type: 'range', condition: [min, max], result });
      return this;
    }

    caseIn(values, result) {
      if (!Array.isArray(values)) throw new TypeError('set values must be an array');
      if (values.length === 0) return this;
      this.#validateType(values[0]);
      this.cases.push({ type: 'set', condition: values, result });
      return this;
    }

    caseIncludes(substrings, result) {
      if (!Array.isArray(substrings)) substrings = [substrings];
      substrings.forEach(s => {
        if (typeof s !== 'string') throw new TypeError('substrings must be strings');
      });
      this.#validateType('string');
      this.cases.push({ type: 'substring', condition: substrings, result });
      return this;
    }

    caseRegex(regex, result) {
      if (!(regex instanceof RegExp)) throw new TypeError('condition must be a RegExp');
      this.#validateType('string');
      this.cases.push({ type: 'regex', condition: regex, result });
      return this;
    }

    caseCompare(comparator, value, result) {
      const validComparators = ['<', '<=', '>', '>='];
      if (!validComparators.includes(comparator)) throw new Error(`Invalid comparator: ${comparator}`);
      if (typeof value !== 'number') throw new TypeError('comparison value must be a number');
      this.#validateType(value);
      this.cases.push({ 
        type: 'comparison', 
        condition: { comparator, value }, 
        result 
      });
      return this;
    }

    else(result) {
      this.defaultResult = result;
      return this;
    }

    match(input, meta = {}) {
      for (const { type, condition, result } of this.cases) {
        let matched = false;
        
        switch (type) {
          case 'exact':
            matched = (input === condition);
            break;
          case 'range':
            matched = (input >= condition[0] && input <= condition[1]);
            break;
          case 'set':
            matched = condition.includes(input);
            break;
          case 'substring':
            if (typeof input === 'string') {
              matched = condition.some(sub => input.includes(sub));
            }
            break;
          case 'regex':
            if (typeof input === 'string') {
              matched = condition.test(input);
            }
            break;
          case 'comparison':
            const { comparator, value } = condition;
            switch (comparator) {
              case '<': matched = (input < value); break;
              case '<=': matched = (input <= value); break;
              case '>': matched = (input > value); break;
              case '>=': matched = (input >= value); break;
            }
            break;
          case 'predicate':
            try {
              matched = condition(input, meta);
            } catch (e) {
              console.error(`selectCase predicate error: ${e.message}`);
            }
            break;
        }
        if (matched) return typeof result === 'function' ? result(input, meta) : result;
      }
      return typeof this.defaultResult === 'function' ? this.defaultResult(input, meta) : this.defaultResult;
    }

    #validateType(value) {
      if (this.allowMixedTypes) return;
      const valueType = typeof value;
      if (this.valueType === null) {
        this.valueType = valueType;
        return;
      }
      if (this.valueType !== valueType) throw new TypeError(`Cannot mix ${this.valueType} and ${valueType} type conditions`);
    }
  }

  /**
   * @param {string} src - 图片源路径
   * @returns {Promise<string>} 解析后的图片数据（base64）或原始路径
   * @example
   * // 使用ModLoader加载
   * loadImageWithModLoader('character.png').then(data => {
   *   // 返回base64数据或原始URL
   *   imgElement.src = data;
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
      return src;
    }
  }

  const tools = {
    clone: Object.freeze(clone),
    merge: Object.freeze(merge),
    equal: Object.freeze(equal),
    contains: Object.freeze(contains),
    SelectCase: Object.freeze(selectCase),
    random: Object.freeze(random),
    either: Object.freeze(either),
    loadImage: Object.freeze(loadImageWithModLoader)
  };
  const toolNames = ['clone', 'merge', 'equal', 'contains', 'SelectCase','random','either','loadImage'];
  toolNames.forEach(name => { if (!window.hasOwnProperty(name)) Object.defineProperty(window, name, { value: tools[name], enumerable: true}); });
  maplebirch.once(':tool-init', (data) => Object.assign(data, tools));
})();