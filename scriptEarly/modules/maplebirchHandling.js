(async() => {
  if (!window.maplebirch) {
    console.log('%c[maplebirch] 错误: 核心系统未初始化', 'color: #C62828; font-weight: bold;');
    return;
  }

  const maplebirch = window.maplebirch;
  
  class processHandling {
    constructor() {
      this.lang = null
      this.tool = null;
      this.log = null;
      this.updateTimer = null;
    }

    _fixDynamicTask(fn, name) {
      const taskFn = function() {
        try {
          return fn.apply(this, arguments);
        } catch (error) {
        console.error('[Dynamic.task] Error in task "' + name + '":', error);
          return null;
        }
      };
      Object.defineProperty(taskFn, 'toString', {
        value: function() { return name; },
        writable: true,
        configurable: true
      });
      if (Dynamic.stage === Dynamic.Stage.Settled) {
        taskFn();
      } else {
        Dynamic.tasks.push(taskFn);
      }
      return taskFn;
    }

    #getModName(modinfo) {
      if (!modinfo.nickName) return this.lang.autoTranslate(modinfo.name);
      if (typeof modinfo.nickName === 'string') return this.lang.autoTranslate(modinfo.nickName);
      if (typeof modinfo.nickName === 'object') {
        const translationsObj = Object.entries(modinfo.nickName).reduce((acc, [lang, text]) => {
          acc[lang.toUpperCase()] = text;
          return acc;
        }, {});
        const mapKey = `modList_${modinfo.name}`;
        if (!this.lang.translations.has(mapKey)) this.lang.translations.set(mapKey, translationsObj);
        return this.lang.t(mapKey);
      }
      return false
    }

    #getModDependenceInfo() {
      const modList = modUtils.getModListName();
      for (let i = 0; i < modList.length; i++) {
        const modName = modList[i];
        const modinfo = modUtils.getMod(modName);
        if (!modinfo) continue;
        if (modinfo.bootJson.dependenceInfo.some(dep => dep.modName === "maplebirch") && !maplebirch.modList.includes(modinfo.name)) {
          maplebirch.modList.push(modinfo.name);
        }
      }
    }

    _showModVersions() {
      const html = `<div id="modversions">Maplebirch Framework v${maplebirch.constructor.meta.version} | </div>`;
      return html;
    }

    _showFrameworkInfo() {
      let html_1 = `<div class="p-2 text-align-center">
          <h3>${maplebirch.t('Maplebirch Frameworks')}</h3>
          <div class="m-2">
            <span class="gold">${maplebirch.t('Version')}：</span>${maplebirch.constructor.meta.version}<br>
          </div>
          <div class="m-2">
            <span class="gold">${maplebirch.t('Author')}：</span>${maplebirch.autoTranslate(maplebirch.constructor.meta.author)}<br>
          </div>
          <div class="m-2">
            <span class="gold">${maplebirch.t('Last Modified By')}：</span>${maplebirch.autoTranslate(maplebirch.constructor.meta.modifiedby)}<br>
          </div>
      </div>`;

      this.#getModDependenceInfo();
      const modlist = maplebirch.modList;
      const html = [];

      for (let i = 0; i < modlist.length; i++) {
        const modId = modlist[i];
        const modinfo = modUtils.getMod(modId);
        if (!modinfo) continue;

        const modname = this.#getModName(modinfo);
        const modversion = modinfo.version;
        const text = `
          <div class="modinfo">
            ・ ${modname}：v${modversion}
          </div>
          `;
        html.push(text);
      }

      if (html.length > 0) {
        html_1 += `
          <div class="p-2 text-align-center">
            <h3>${maplebirch.t('Maplebirch Frameworks Mod List')}</h3>
            <div id="modlist">
              ${html.join('')}
            </div>
          </div>
        `;
      }
      
      return html_1;
    }

    _updatePermissions() {
      if (!V.options?.maplebirch?.sandbox) return;
      const sandbox = V.options.maplebirch.sandbox;
      const allowedObjects = this.tool.console.allowedObjects;
      if (sandbox.window) {
        sandbox.V = true;
        sandbox.T = true;
        sandbox.maplebirch = true;
        if (!this.tool.console.fullAccess) this.tool.console.enableFullAccess();
      } else if (sandbox.maplebirch) {
        sandbox.V = true;
        sandbox.T = true;
        if (this.tool.console.fullAccess) this.tool.console.disableFullAccess();
      }
      if (sandbox.maplebirch && (!sandbox.V || !sandbox.T)) sandbox.maplebirch = false;
      if (sandbox.window && !sandbox.maplebirch) sandbox.window = false;
      if (sandbox.V && !allowedObjects.has('V')) {
        this.tool.console.allowObject('V');
      } else if (!sandbox.V && allowedObjects.has('V')) {
        this.tool.console.disallowObject('V');
      }
      if (sandbox.T && !allowedObjects.has('T')) {
        this.tool.console.allowObject('T');
      } else if (!sandbox.T && allowedObjects.has('T')) {
        this.tool.console.disallowObject('T');
      }
      if (sandbox.maplebirch && !allowedObjects.has('maplebirch')) {
        this.tool.console.allowObject('maplebirch');
      } else if (!sandbox.maplebirch && allowedObjects.has('maplebirch')) {
        this.tool.console.disallowObject('maplebirch');
      }
      if (sandbox.window && !this.tool.console.fullAccess) {
        this.tool.console.enableFullAccess();
      } else if (!sandbox.window && this.tool.console.fullAccess) {
        this.tool.console.disableFullAccess();
      }
      const text = maplebirch.t('permission');
      const vItem = $(`label:contains("V ${text}")`).closest('.settingsToggleItem');
      const tItem = $(`label:contains("T ${text}")`).closest('.settingsToggleItem');
      const mbItem = $(`label:contains("Maplebirch ${text}")`).closest('.settingsToggleItem');
      const wItem = $(`label:contains("window ${text}")`).closest('.settingsToggleItem');
      const vDisabled = sandbox.window || sandbox.maplebirch;
      const tDisabled = sandbox.window || sandbox.maplebirch;
      const mbDisabled = sandbox.window || !(sandbox.V && sandbox.T);
      const wDisabled = !sandbox.maplebirch;
      vItem.css("color", vDisabled ? "var(--400)" : "var(--000)");
      vItem.find('input').prop('disabled', vDisabled).prop('checked', sandbox.V);
      tItem.css("color", tDisabled ? "var(--400)" : "var(--000)");
      tItem.find('input').prop('disabled', tDisabled).prop('checked', sandbox.T);
      mbItem.css("color", mbDisabled ? "var(--400)" : "var(--000)");
      mbItem.find('input').prop('disabled', mbDisabled).prop('checked', sandbox.maplebirch);
      wItem.css("color", wDisabled ? "var(--400)" : "var(--000)");
      wItem.find('input').prop('disabled', wDisabled).prop('checked', sandbox.window);
    }

    preInit() {
      this.lang = maplebirch.lang;
      this.tool = maplebirch.tool;
      this.log = this.tool.createLogger('widget');
      this.tool.framework.addTo('HintMobile', 'maplebirchModHintMobile');
      this.tool.framework.addTo('MenuBig', 'maplebirchModHintDesktop');
      this.tool.other.configureLocation('lake_ruin', {
        condition: () => Weather.bloodMoon && !Weather.isSnow
      }, { layer: 'base', element: 'bloodmoon' });

      this.tool.other.configureLocation('lake_ruin', {
        condition: () => Weather.bloodMoon && Weather.isSnow
      }, { layer: 'base', element: 'bloodmoon_snow' });

      maplebirch.once(':definewidget', () => {
        this.tool.widget.defineMacroS('maplebirchFrameworkVersions', () => this._showModVersions());
        this.tool.widget.defineMacroS('maplebirchFrameworkInfo', () => this._showFrameworkInfo());
      });

      maplebirch.on(':loadSaveData', () => maplebirch.Language = V?.maplebirch?.language);

      $(document).on('mouseup touchend', () => {
        if (!maplebirch.modules.initPhase.preInitCompleted) return;
        try {
          if (typeof T.selectedLang === 'string' && maplebirch.constructor.meta.availableLanguages.includes(T.selectedLang)) {
            if (T.selectedLang !== maplebirch.lang.language) {
              maplebirch.Language = T.selectedLang;
              if (typeof V.maplebirch !== 'object') V.maplebirch = {};
              V.maplebirch.language = T.selectedLang;
              T.tab.toggle();
              $.wiki('<<replace #customOverlayContent>><<maplebirchOptions>><</replace>>');
            }
          }
        } catch (error) {
          console.log('鼠标事件处理错误:', error);
        }
      });

      maplebirch.on('update', () => {
        if (this.updateTimer) clearTimeout(this.updateTimer);
        this.updateTimer = setTimeout(() => {
          this._updatePermissions();
          this.updateTimer = null;
        }, 50);
      });
    }

    Init() {
      Dynamic.task = (fn, name) => this._fixDynamicTask(fn, name);
    }

    postInit() {
      
    }
  }

  await maplebirch.register('processHandling', new processHandling(), ['tool']);
})();