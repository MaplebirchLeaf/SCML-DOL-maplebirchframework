// @ts-check
/// <reference path='../../maplebirch.d.ts' />
(async() => {
  'use strict';
  if (!window.maplebirch) {
    console.log('%c[maplebirch] 错误: 核心系统未初始化', 'color: #C62828; font-weight: bold;');
    return;
  }

  const maplebirch = window.maplebirch;

  /** @param {string} prefix */
  function createLog(prefix) {
    return (/**@type {any}*/message, level = 'INFO', /**@type {any}*/...objects) => {maplebirch.log(`[${prefix}] ${message}`, level, ...objects); };
  }

  // 模块提示系统 - 用于显示和搜索模块提示信息
  class modhint {
    /** @param {{ (message: string, level?: string, ...objects: any[]): void; (msg: string, level?: string, ...objs: any[]): void; }} logger */
    constructor(logger) {
      this.log = logger;
    }
    
    /** @param {any} newElement @param {{ parentNode: { insertBefore: (arg0: any, arg1: any) => void; }; }} targetElement */
    #insertBefore(newElement, targetElement) {
      if (targetElement && targetElement.parentNode) {
        targetElement.parentNode.insertBefore(newElement, targetElement);
      }
    }
    
    hintClicked() {
      if ($?.wiki) {
        $.wiki('<<maplebirchReplace "maplebirchModHint" "title">>');
        maplebirch.trigger('characterRender');
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
      /** @type {any} */
      const contentEl = document.getElementById("maplebirchModHintContent");
      if (!contentEl) return;
      
      const regex = new RegExp(keyword, 'gi');
      const originalHtml = contentEl.innerHTML;
      
      const highlightedHtml = originalHtml.replace(
        regex,
        (/**@type {any}*/match) => `<span class="gold searchResult">${match}</span>`
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
          /** @type {any} */const parent = el.parentNode;
          while (el.firstChild) parent.insertBefore(el.firstChild, el);
          parent.removeChild(el);
        });
      }
    }
  }

  // 控制台系统 - 用于执行JS和Twine代码
  class consoleTools {
    /** @param {{ (message: string, level?: string, ...objects: any[]): void; (msg: string, level?: string, ...objs: any[]): void; }} logger */
    constructor(logger) {
      this.log = logger;
      this.globalNamespace = {};
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
      } catch (/**@type {any}*/error) {
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

    /** @param {string} message @param {any} isSuccess */
    #updateJSStatus(message, isSuccess) {
      const statusElement = $('#js-cheat-console-status');
      statusElement.text(message);
      statusElement.removeClass('success error visible');
      statusElement.addClass(isSuccess ? 'success visible' : 'error visible');
    }
    
    /** @param {any} code */
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
      
      const builtins = [
        'Boolean', 'RegExp', 'Error', 'EvalError', 'RangeError', 
        'ReferenceError', 'SyntaxError', 'TypeError', 'URIError',
        'Function', 'Promise', 'Map', 'Set', 'WeakMap', 'WeakSet',
        'Symbol', 'Proxy', 'Reflect', 'Intl', 'ArrayBuffer',
        'SharedArrayBuffer', 'DataView', 'Float32Array', 'Float64Array',
        'Int8Array', 'Int16Array', 'Int32Array', 'Uint8Array',
        'Uint8ClampedArray', 'Uint16Array', 'Uint32Array',
        'BigInt', 'BigInt64Array', 'BigUint64Array'
      ];
      // @ts-ignore
      builtins.forEach(name => { if (window[name]) sandbox[name] = Object.freeze(window[name]); });
      Object.freeze(Object.prototype);
      Object.freeze(Array.prototype);
      Object.freeze(Function.prototype);
      Object.freeze(Number.prototype);
      Object.freeze(String.prototype);
      Object.freeze(Date.prototype);
      Object.freeze(Boolean.prototype);
      Object.freeze(RegExp.prototype);
      Object.freeze(Error.prototype);
      Object.freeze(Promise.prototype);
      Object.freeze(Map.prototype);
      Object.freeze(Set.prototype);
      const sandboxProxy = new Proxy(sandbox, {
        has: () => true,
        get: (/**@type {any}*/target, /**@type {any}*/prop) => {
          if (prop === Symbol.unscopables) return undefined;
          if (prop in target) return target[prop];
          if (prop in window) return window[prop];
          return undefined;
        },
        set: (target, prop, value) => {
          if (prop in target) throw new Error(`不能修改内置对象: ${String(prop)}`);
          if (prop === 'global') throw new Error('不能覆盖 global 命名空间');
          if (prop in window) {
            const descriptor = Object.getOwnPropertyDescriptor(window, prop);
            if (descriptor && descriptor.writable === false) throw new Error(`不能修改只读属性: ${String(prop)}`);
            // @ts-ignore
            window[prop] = value;
            return true;
          }
          target.global[prop] = value;
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

    /** @param {null | undefined} result */
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
        const fragment = document.createDocumentFragment();
        const hasNavigation = /<<(?:link|goto|display)\b/i.test(code);
        try {
          new maplebirch.SugarCube.Wikifier(fragment, code);
          if (hasNavigation) {
            if (code.includes('<<link')) {
              const match = code.match(/<<link\s+(?:['"]([^'"]+)['"]\s*['"]([^'"]+)['"]|\[\[([^\]]+)\|([^\]]+)\]\]).*?>>/i);
              if (match) {
                let target = match[2] || match[4];
                if (target) {
                  this.#updateTwineStatus('执行成功，即将跳转...', true);
                  setTimeout(() => maplebirch.SugarCube.Engine.play(target), 300);
                  return {
                    success: true,
                    message: '代码执行成功',
                    hasNavigation: true
                  };
                }
              }
            }
            this.#updateTwineStatus('执行成功，即将跳转...', true);
            setTimeout(() => { if (fragment.children.length > 0) document.getElementById('your-output-container')?.appendChild(fragment); }, 300);
            return {
              success: true,
              message: '代码执行成功',
              hasNavigation: true
            };
          } else {
            this.#updateTwineStatus('执行成功', true);
            this.log('Twine代码执行成功', 'INFO');
            return {
              success: true,
              message: '代码执行成功',
              // @ts-ignore
              parsedContent: fragment.innerHTML
            };
          }
        } catch (/**@type {any}*/wikifyError) {
          const errorMsg = wikifyError.message || 'Wikifier解析错误';
          this.#updateTwineStatus(`解析错误: ${errorMsg}`, false);
          this.log('Twine代码解析失败', 'ERROR', wikifyError);
          return {
            success: false,
            error: errorMsg,
            message: `解析错误: ${errorMsg}`
          };
        }
      } catch (/**@type {any}*/error) {
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

    /** @param {string} message @param {any} isSuccess */
    #updateTwineStatus(message, isSuccess) {
      const statusElement = $('#twine-cheat-console-status');
      statusElement.text(message);
      statusElement.removeClass('success error visible');
      statusElement.addClass(isSuccess ? 'success visible' : 'error visible');
    }
    
    /** @param {string} type */
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

  // 作弊指令系统 - 用于管理和执行作弊指令
  class cheat {
    constructor() {
      /** @type {any[]} */
      this.cache = [];
      maplebirch.once(':IndexedDB', async() => await this.initDB());
    }

    async initDB() {
      maplebirch.idb.register('cheats', { keyPath: 'name' });
      await this.refreshCache();
    }

    async refreshCache() {
      try {
        this.cache = await maplebirch.idb.withTransaction(['cheats'], 'readonly', async (/**@type {{ objectStore: (arg0: string) => any; }}*/tx) => {
          const store = tx.objectStore('cheats');
          return await store.getAll();
        });
      } catch (/**@type {any}*/err) {
        maplebirch.logger.log(`刷新作弊指令缓存失败: ${err?.message || err}`, 'ERROR');
        this.cache = [];
      }
    }

    /** @param {string} name @param {string} code */
    async add(name, code) {
      if (!name?.trim() || !code?.trim()) return false;
      try {
        const existing = this.cache.find(c => c.name === name.trim());
        if (existing) return false;
        await maplebirch.idb.withTransaction(['cheats'], 'readwrite', async (/**@type {{ objectStore: (arg0: string) => any; }}*/tx) => {
          const store = tx.objectStore('cheats');
          const dbCheck = await store.get(name.trim());
          if (dbCheck) throw new Error('作弊指令已存在');
          await store.put({
            name: name.trim(),
            code: code.trim(),
            type: code.trim().startsWith('<<') ? 'twine' : 'javascript',
          });
        });
        await this.refreshCache();
        return true;
      } catch (/**@type {any}*/err) {
        maplebirch.logger.log(`添加作弊指令失败: ${name} - ${err?.message || err}`, 'ERROR');
        return false;
      }
    }

    /** @param {any} name */
    async remove(name) {
      try {
        await maplebirch.idb.withTransaction(['cheats'], 'readwrite', async (/**@type {{ objectStore: (arg0: string) => any; }}*/tx) => {
          const store = tx.objectStore('cheats');
          await store.delete(name);
        });
        await this.refreshCache();
        return true;
      } catch (/**@type {any}*/err) {
        maplebirch.logger.log(`删除作弊指令失败: ${name} - ${err?.message || err}`, 'ERROR');
        return false;
      }
    }

    /** @param {any} name */
    async execute(name) {
      const cheatItem = this.cache.find(c => c.name === name);
      if (!cheatItem) return false;
      if (cheatItem.type === 'javascript') { T.maplebirchJSCheatConsole = cheatItem.code; }
      else { T.maplebirchTwineCheatConsole = cheatItem.code; }
      const result = maplebirch.tool.console.execute(cheatItem.type);
      if (result?.success) {
        try {
          await maplebirch.idb.withTransaction(['cheats'], 'readwrite', async (/**@type {{ objectStore: (arg0: string) => any; }}*/tx) => {
            const store = tx.objectStore('cheats');
            await store.put(cheatItem);
          });
        } catch (/**@type {any}*/err) {
          maplebirch.logger.log(`更新作弊指令失败: ${name} - ${err?.message || err}`, 'ERROR');
        }
      }
      return result.success || false;
    }

    /** @param {string} term */
    search(term) {
      if (!term?.trim()) return this.cache;
      const searchTerm = term.toLowerCase();
      return this.cache.filter(item => item.name.toLowerCase().includes(searchTerm));
    }

    searchAndDisplay() {
      const term = T.maplebirchCheatSearch?.trim();
      const results = term ? this.search(term) : this.cache;
      this.updateContainer('maplebirch-cheat-container', this.HTML(results));
    }

    async displayAll() {
      T.maplebirchCheatSearch = '';
      await this.refreshCache();
      this.updateContainer('maplebirch-cheat-container', this.HTML());
    }

    async createFromForm() {
      const name = T.maplebirchModCheatNamebox?.trim();
      const code = T.maplebirchModCheatCodebox?.trim();
      if (name && code && await this.add(name, code)) {
        T.maplebirchModCheatNamebox = T.maplebirchModCheatCodebox = '';
        this.displayAll();
      }
    }

    clearAll(confirm = false) {
      if (!confirm) return `<div class='settingsToggleItem'><span class='red'><<lanSwitch 'Are you sure to clear' '确认清除'>> ${this.cache.length} <<lanSwitch 'codes' '个命令'>>?</span><br><<lanLink 'confirm' null 'capitalize'>><<run maplebirch.tool?.cheat.clearAll(true)>><</lanLink>> | <<lanLink 'cancel' null 'capitalize'>><<run maplebirch.tool?.cheat.displayAll()>><</lanLink>></div>`;
      this.clearAllAsync();
      return '';
    }

    async clearAllAsync() {
      try {
        await maplebirch.idb.clearStore('cheats');
        this.cache = [];
        this.displayAll();
      } catch (/**@type {any}*/err) {}
    }

    /** @param {string} containerId @param {string} content */
    updateContainer(containerId, content) {
      if (!containerId) return;
      try { new maplebirch.SugarCube.Wikifier(null, `<<replace "#${containerId}">>${content}<</replace>>`); }
      catch (/**@type {any}*/error) {}
    }

    /** @param {any} name */
    deleteConfirm(name) {
      const cheatItem = this.cache.find(c => c.name === name);
      if (!cheatItem) return '';
      const itemId = `cheat-item-${cheatItem.name.replace(/[^a-zA-Z0-9]/g, '-')}`;
      return `<span class='red'><<lanSwitch 'Confirm to clear' '确认清除'>> "${cheatItem.name}"?</span><br><<lanLink 'confirm' null 'capitalize'>><<run maplebirch.tool?.cheat.remove('${cheatItem.name.replace(/'/g, "\\'")}')>><<run maplebirch.tool?.cheat.displayAll()>><</lanLink>> | <<lanLink 'cancel' null 'capitalize'>><<run maplebirch.tool?.cheat.cancelDelete('${cheatItem.name.replace(/'/g, "\\'")}')>><</lanLink>>`;
    }

    /** @param {any} name */
    cancelDelete(name) {
      const cheatItem = this.cache.find(c => c.name === name);
      if (!cheatItem) return;
      const itemId = `cheat-item-${cheatItem.name.replace(/[^a-zA-Z0-9]/g, '-')}`;
      const normalHTML = `<span class='teal'>${cheatItem.name}</span><br><<lanLink 'execute' null 'capitalize'>><<run maplebirch.tool?.cheat.execute('${cheatItem.name.replace(/'/g, "\\'")}')>><</lanLink>> | <<lanLink 'delete' null 'capitalize'>><<run maplebirch.tool?.cheat.updateContainer('${itemId}', maplebirch.tool?.cheat.deleteConfirm('${cheatItem.name.replace(/'/g, "\\'")}'))>><</lanLink>>`;
      this.updateContainer(itemId, normalHTML);
    }

    HTML(cheats = this.cache) {
      if (cheats.length === 0) return '';
      return cheats.map(item => {
        const itemId = `cheat-item-${item.name.replace(/[^a-zA-Z0-9]/g, '-')}`;
        return `<div id="${itemId}" class='settingsToggleItem'><span class='teal'>${item.name}</span><br><<lanLink 'execute' null 'capitalize'>><<run maplebirch.tool?.cheat.execute('${item.name.replace(/'/g, "\\'")}')>><</lanLink>> | <<lanLink 'delete' null 'capitalize'>><<run maplebirch.tool?.cheat.updateContainer('${itemId}', maplebirch.tool?.cheat.deleteConfirm('${item.name.replace(/'/g, "\\'")}'))>><</lanLink>></div>`;
      }).join('');
    }
  }

  class tools {
    createLog = createLog;

    /** @param {MaplebirchCore} core */
    constructor(core) {
      this.core = core;
      this.modhint = new modhint(createLog('modhit'));
      this.console = new consoleTools(createLog('console'));
      this.cheat = new cheat();
      core.trigger(':tool-init', this);
    }

    async preInit() {
      // @ts-ignore
      maplebirch.once(':finally', () => { this.linkzone.removeZones(); this.linkzone.apply({ debug: true }); });
      // @ts-ignore
      maplebirch.on(':passagedisplay', () => this.linkzone.apply(), 'applylinkzone');
    }

    Init() {
      // @ts-ignore
      this.other.applyLocation();
      // @ts-ignore
      this.other.applyBodywriting();
    }

    postInit() {

    }
  }

  await maplebirch.register('tool', new tools(maplebirch), ['state']);
})();