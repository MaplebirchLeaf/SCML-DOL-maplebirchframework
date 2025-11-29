(async() => {
  'use strict';
  if (!window.maplebirch) {
    console.log('%c[maplebirch] 错误: 核心系统未初始化', 'color: #C62828; font-weight: bold;');
    return;
  }

  const maplebirch = window.maplebirch;

  function createLog(prefix) {
    return (message, level = 'INFO', ...objects) => {maplebirch.log(`[${prefix}] ${message}`, level, ...objects); };
  }

  // 模块提示系统 - 用于显示和搜索模块提示信息
  class modhintSystem {
    constructor(logger) {
      this.log = logger;
    }
    
    #insertBefore(newElement, targetElement) {
      if (targetElement && targetElement.parentNode) {
        targetElement.parentNode.insertBefore(newElement, targetElement);
      }
    }
    
    hintClicked() {
      if (window.$ && window.$.wiki) {
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

  // 控制台系统 - 用于执行JS和Twine代码
  class consoleTools {
    constructor(logger, allowedObjects = ['V', 'T']) {
      this.log = logger;
      this.globalNamespace = {};
      this.allowedObjects = new Set(allowedObjects);
      this.fullAccess = false;
    }

    enableFullAccess() {
      this.fullAccess = true;
      return true;
    }
    
    disableFullAccess() {
      this.fullAccess = false;
      return true;
    }
    
    allowObject(objectName) {
      if (typeof objectName === 'string') {
        if (this.allowedObjects.has(objectName)) return false;
        this.allowedObjects.add(objectName);
        this.log(`已添加对象权限: ${objectName}`, 'INFO');
        return true;
      }
      return false;
    }
    
    disallowObject(objectName) {
      if (this.allowedObjects.has(objectName)) { this.allowedObjects.delete(objectName); return true; }
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
          if (prop in window) throw new Error(`修改 '${prop}' 被禁止 - 权限不足`);
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
              parsedContent: fragment.innerHTML
            };
          }
        } catch (wikifyError) {
          const errorMsg = wikifyError.message || 'Wikifier解析错误';
          this.#updateTwineStatus(`解析错误: ${errorMsg}`, false);
          this.log('Twine代码解析失败', 'ERROR', wikifyError);
          return {
            success: false,
            error: errorMsg,
            message: `解析错误: ${errorMsg}`
          };
        }
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

  // 作弊指令系统 - 用于管理和执行作弊指令
  class cheatSystem {
    constructor() {
      this.db = null;
      this.cache = [];
      maplebirch.once(':dataImport', async() => await this.initDB());
    }

    async initDB() {
      const idbRef = maplebirch.modUtils.getIdbRef();
      this.db = await idbRef.idb_openDB('maplebirch-cheats', 1, {
        upgrade: (db) => { if (!db.objectStoreNames.contains('cheats')) db.createObjectStore('cheats', { keyPath: 'name' }); }
      });
      await this.refreshCache();
    }

    async refreshCache() {
      if (!this.db) return;
      const tx = this.db.transaction('cheats', 'readonly');
      const store = tx.objectStore('cheats');
      this.cache = await store.getAll();
    }

    async add(name, code) {
      if (!name?.trim() || !code?.trim()) return false;
      const tx = this.db.transaction('cheats', 'readwrite');
      const store = tx.objectStore('cheats');
      const existing = await store.get(name.trim());
      if (existing) return false;
      await store.put({
        name: name.trim(),
        code: code.trim(),
        type: code.trim().startsWith('<<') ? 'twine' : 'javascript',
      });
      await this.refreshCache();
      return true;
    }

    async remove(name) {
      const tx = this.db.transaction('cheats', 'readwrite');
      const store = tx.objectStore('cheats');
      await store.delete(name);
      await this.refreshCache();
      return true;
    }

    async execute(name) {
      const cheat = this.cache.find(c => c.name === name);
      if (!cheat) return false;
      if (cheat.type === 'javascript') { T.maplebirchJSCheatConsole = cheat.code; }
      else { T.maplebirchTwineCheatConsole = cheat.code; }
      const result = maplebirch.tool.console.execute(cheat.type);
      if (result?.success) {
        const tx = this.db.transaction('cheats', 'readwrite');
        const store = tx.objectStore('cheats');
        await store.put(cheat);
      }
      return result.success || false;
    }

    search(term) {
      if (!term?.trim()) return this.cache;
      const searchTerm = term.toLowerCase();
      return this.cache.filter(cheat => cheat.name.toLowerCase().includes(searchTerm));
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
      if (!confirm) return `<div class='settingsToggleItem'><span class='red'><<lanSwitch 'Are you sure to clear' '确认清除'>> ${this.cache.length} <<lanSwitch 'codes' '个命令'>>?</span><br><<langlink 'confirm' null 'capitalize'>><<run maplebirch.tool?.cheat.clearAll(true)>><</langlink>> | <<langlink 'cancel' null 'capitalize'>><<run maplebirch.tool?.cheat.displayAll()>><</langlink>></div>`;
      this.clearAllAsync();
      return '';
    }

    async clearAllAsync() {
      const tx = this.db.transaction('cheats', 'readwrite');
      const store = tx.objectStore('cheats');
      await store.clear();
      this.cache = [];
      this.displayAll();
    }

    updateContainer(containerId, content) {
      if (!containerId) return;
      try { new maplebirch.SugarCube.Wikifier(null, `<<replace "#${containerId}">>${content}<</replace>>`); }
      catch (error) {}
    }

    deleteConfirm(name) {
      const cheat = this.cache.find(c => c.name === name);
      if (!cheat) return '';
      const itemId = `cheat-item-${cheat.name.replace(/[^a-zA-Z0-9]/g, '-')}`;
      return `<span class='red'><<lanSwitch 'Confirm to clear' '确认清除'>> "${cheat.name}"?</span><br><<langlink 'confirm' null 'capitalize'>><<run maplebirch.tool?.cheat.remove('${cheat.name.replace(/'/g, "\\'")}')>><<run maplebirch.tool?.cheat.displayAll()>><</langlink>> | <<langlink 'cancel' null 'capitalize'>><<run maplebirch.tool?.cheat.cancelDelete('${cheat.name.replace(/'/g, "\\'")}')>><</langlink>>`;
    }

    cancelDelete(name) {
      const cheat = this.cache.find(c => c.name === name);
      if (!cheat) return;
      const itemId = `cheat-item-${cheat.name.replace(/[^a-zA-Z0-9]/g, '-')}`;
      const normalHTML = `<span class='teal'>${cheat.name}</span><br><<langlink 'execute' null 'capitalize'>><<run maplebirch.tool?.cheat.execute('${cheat.name.replace(/'/g, "\\'")}')>><</langlink>> | <<langlink 'delete' null 'capitalize'>><<run maplebirch.tool?.cheat.updateContainer('${itemId}', maplebirch.tool?.cheat.deleteConfirm('${cheat.name.replace(/'/g, "\\'")}'))>><</langlink>>`;
      this.updateContainer(itemId, normalHTML);
    }

    HTML(cheats = this.cache) {
      if (cheats.length === 0) return '';
      return cheats.map(cheat => {
        const itemId = `cheat-item-${cheat.name.replace(/[^a-zA-Z0-9]/g, '-')}`;
        return `<div id="${itemId}" class='settingsToggleItem'><span class='teal'>${cheat.name}</span><br><<langlink 'execute' null 'capitalize'>><<run maplebirch.tool?.cheat.execute('${cheat.name.replace(/'/g, "\\'")}')>><</langlink>> | <<langlink 'delete' null 'capitalize'>><<run maplebirch.tool?.cheat.updateContainer('${itemId}', maplebirch.tool?.cheat.deleteConfirm('${cheat.name.replace(/'/g, "\\'")}'))>><</langlink>></div>`;
      }).join('');
    }
  }

  class tools {
    static proto = {
      modhit: modhintSystem,
      console: consoleTools,
      cheat: cheatSystem,
    }

    createLog = createLog;

    constructor() {
      this.modhint = new tools.proto.modhit(createLog('modhit'));
      this.console = new tools.proto.console(createLog('console'));
      this.cheat = new tools.proto.cheat();
      maplebirch.trigger(':tool-init', this);
    }

    async preInit() {
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

  await maplebirch.register('tool', new tools(), ['state']);
})();