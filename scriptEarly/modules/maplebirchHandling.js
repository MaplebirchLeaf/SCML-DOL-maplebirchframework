(async() => {
  'use strict';
  if (!window.maplebirch) {
    console.log('%c[maplebirch] 错误: 核心系统未初始化', 'color: #C62828; font-weight: bold;');
    return;
  }

  const maplebirch = window.maplebirch;

  class processHandling {
    static getTranslation(key, core = maplebirch) {
      try { key = String(key); }
      catch (e) { return ''; }
      const autoTranslated = core.autoTranslate(key);
      if (autoTranslated !== key) return autoTranslated;
      const result = core.t(key);
      return (result[0] === '[' && result[result.length - 1] === ']') ? autoTranslated : result;
    }

    constructor() {
      this.lang = maplebirch.lang;
      this.tool = maplebirch.tool;
      this.log = this.tool.createLog('widget');
      this.updateTimer = null;
    }

    #languageWidgetManager() {
      setup.maplebirch.language = {
        managers: {
          language: new Map(),
          langswitch: new Map(),
          langbutton: new Map(),
          langlink: new Map(),
          langlistbox: new Map(),
        },
        init() {
          if (this.initialized) return;
          Object.keys(this.managers).forEach(macroType => {
            maplebirch.on(':languageChange', () => {
              this.managers[macroType].forEach(updater => {
                try { updater(); }
                catch (e) { maplebirch.log(`Language update error for ${macroType}:`, 'ERROR', e); }
              });
            });
          });
          maplebirch.once(':passagestart', () => Object.values(this.managers).forEach(manager => manager.clear()));
          this.initialized = true;
        },
        add(macroType, id, updater) {
          if (!this.managers[macroType]) this.managers[macroType] = new Map();
          this.managers[macroType].set(id, updater);
          this.init();
        },
        remove(macroType, id) {
          if (this.managers[macroType]) this.managers[macroType].delete(id);
        }
      };
    }

    _language() {
      const $container = jQuery('<div style="display: contents;"></div>');
      const uniqueId = `language-${Date.now()}-${Math.random().toString(36)}`;
      const render = () => {
        const lang = maplebirch.Language;
        const content = this.payload.find(p => p.name === 'option' && p.args[0]?.toUpperCase() === lang.toUpperCase())?.contents || '';
        $container.empty();
        if (content) {
          const fragment = document.createDocumentFragment();
          new maplebirch.SugarCube.Wikifier(fragment, content);
          $container.append(fragment);
          Links.generate();
        }
      };
      render();
      $(this.output).append($container);
      setup.maplebirch.language.add('language', uniqueId, render);
      $container.on('remove', () => setup.maplebirch.language.remove('language', uniqueId));
    }

    _languageSwitch(...lanObj) {
      let lancheck = maplebirch.Language;
      let targetObj;
      if (typeof lanObj[0] === 'object' && lanObj[0] !== null && !Array.isArray(lanObj[0])) {
        targetObj = lanObj[0];
      } else {
        targetObj = { EN: lanObj[0], CN: lanObj[1] };
        if (Array.isArray(lanObj[0])) {
          targetObj.EN = lanObj[0][0];
          targetObj.CN = lanObj[0][1];
        }
      }

      if (targetObj[lancheck] == undefined) {
        const available = Object.keys(targetObj);
        lancheck = available.length > 0 ? available[0] : 'EN';
      }

      if (this.output) {
        try {
          const $container = jQuery('<span style="display: contents;"></span>');
          const uniqueId = `langswitch-${Date.now()}-${Math.random().toString(36)}`;
          const contentObj = targetObj;
          const renderContent = () => {
            $container.empty();
            const currentLang = maplebirch.Language;
            const content = contentObj[currentLang] || contentObj.EN || '';
            if (content) {
              const fragment = document.createDocumentFragment();
              new maplebirch.SugarCube.Wikifier(fragment, content);
              $container.append(fragment);
              Links.generate();
            }
          };
          renderContent();
          $(this.output).append($container);
          setup.maplebirch.language.add('langswitch', uniqueId, renderContent);
          $container.on('remove', () => setup.maplebirch.language.remove('langswitch', uniqueId));
          return $container[0];
        } catch (e) {
          console.error('lanSwitch 宏模式错误', e);
          return targetObj[lancheck];
        }
      } else {
        return targetObj[lancheck];
      }
    }

    _languageButton() {
      try {
        if (!this.args || this.args.length === 0) return this.error('<<langbutton>> 需要至少一个参数');
        const arg = this.args[0];
        let buttonText = '';
        let translationKey = '';
        let convertMode = null;
        let $image = null;

        if (typeof arg === 'string') {
          translationKey = arg;
          convertMode = this.args.length > 1 ? this.args[1] : null;
          buttonText = processHandling.getTranslation(translationKey, maplebirch);
        } else if (typeof arg === 'object') {
          if (arg.isImage) {
            $image = jQuery(document.createElement('img')).attr('src', arg.source);
            if (arg.passage) $image.attr('data-passage', arg.passage);
            if (arg.title) $image.attr('title', arg.title);
            if (arg.align) $image.attr('align', arg.align);
            translationKey = `image:${arg.source}`;
            convertMode = this.args.length > 1 ? this.args[1] : null;
          } else if (arg.text) {
            translationKey = arg.text;
            convertMode = this.args.length > 1 ? this.args[1] : null;
            buttonText = processHandling.getTranslation(translationKey, maplebirch);
          } else {
            return this.error('<<langbutton>> 不支持的参数对象类型');
          }
        } else {
          return this.error('<<langbutton>> 参数必须是字符串、函数或对象');
        }

        if (convertMode && buttonText) buttonText = maplebirch.tool.convert(buttonText, convertMode);

        const $button = jQuery(document.createElement('button')).addClass('macro-button link-internal').attr('data-translation-key', translationKey);
        const uniqueId = `${Date.now()}-${Math.random().toString(36)}`;

        if ($image) { $button.append($image).addClass('link-image'); }
        else { $button.append(document.createTextNode(buttonText)); }

        const payloadContent = this.payload[0]?.contents?.trim() || '';
        const macroThis = this;

        $button.ariaClick({
          namespace: '.macros',
          role: 'button',
          one: false
        }, this.createShadowWrapper(
          payloadContent ? () => { maplebirch.SugarCube.Wikifier.wikifyEval(payloadContent, macroThis.passageObj); } : null
        ));

        const updateButtonText = () => {
          if ($image) return;
          const newText = processHandling.getTranslation(translationKey, maplebirch);
          let finalText = newText;
          if (convertMode) finalText = maplebirch.tool.convert(newText, convertMode);
          $button.empty().append(document.createTextNode(finalText));
        };

        $button.appendTo(this.output);
        setup.maplebirch.language.add('langbutton', uniqueId, updateButtonText);
        $button.on('remove', () => setup.maplebirch.language.remove('langbutton', uniqueId));
      } catch (e) {
        console.error('<<langbutton>> 宏处理错误', e);
        return this.error(`<<langbutton>> 执行错误: ${e.message}`);
      }
    }

    _languageLink() {
      try {
        if (!this.args || this.args.length === 0) return this.error('<<langlink>> 需要至少一个参数');

        const arg = this.args[0];
        let linkText = '';
        let translationKey = '';
        let passageName = null;
        let convertMode = null;
        let $image = null;
        T.link = true;
        const uniqueId = `${Date.now()}-${Math.random().toString(36)}`;

        if (typeof arg === 'string') {
          translationKey = arg;
          passageName = this.args.length > 1 ? this.args[1] : null;
          convertMode = this.args.length > 2 ? this.args[2] : null;
          linkText = processHandling.getTranslation(translationKey, maplebirch);
        } else if (typeof arg === 'object') {
          if (arg.isImage) {
            $image = jQuery(document.createElement('img')).attr('src', arg.source);

            if (arg.passage) $image.attr('data-passage', arg.passage);
            if (arg.title) $image.attr('title', arg.title);
            if (arg.align) $image.attr('align', arg.align);

            passageName = arg.link;
            translationKey = `image:${arg.source}`;
            convertMode = this.args.length > 1 ? this.args[1] : null;
          } else if (arg.link) {
            translationKey = arg.text;
            passageName = arg.link;
            convertMode = this.args.length > 1 ? this.args[1] : null;
            linkText = processHandling.getTranslation(translationKey, maplebirch);
          } else {
            return this.error('<<langlink>> 不支持的参数对象类型');
          }
        } else {
          return this.error('<<langlink>> 参数必须是字符串、函数或链接对象');
        }

        const $container = jQuery(document.createElement('span'));
        const $link = jQuery(document.createElement('a')).addClass('macro-link link-internal').attr('data-translation-key', translationKey);

        if ($image) { $link.append($image).addClass('link-image'); }
        else { $link.append(document.createTextNode(linkText)); }

        if (passageName != null) {
          $link.attr('data-passage', passageName);
          if (maplebirch.SugarCube.Story.has(passageName)) {
            if (maplebirch.SugarCube.Config.addVisitedLinkClass && maplebirch.SugarCube.State.hasPlayed(passageName)) $link.addClass('link-visited');
          } else {
            $link.addClass('link-broken');
          }
        }

        if (convertMode) $link.attr('data-convert-mode', convertMode);
        const payloadContent = this.payload[0]?.contents?.trim() || '';
        const macroThis = this;

        $link.ariaClick({
          namespace: '.macros',
          role: passageName != null ? 'link' : 'button',
          one: passageName != null
        }, this.createShadowWrapper(
          payloadContent ? () => { maplebirch.SugarCube.Wikifier.wikifyEval(payloadContent, macroThis.passageObj); } : null,
          passageName != null ? () => maplebirch.SugarCube.Engine.play(passageName) : null
        ));

        const updateLinkText = () => {
          if ($image) return;
          const newText = processHandling.getTranslation(translationKey, maplebirch);
          let finalText = newText;
          if (convertMode) finalText = maplebirch.tool.convert(newText, convertMode);
          $link.empty().append(document.createTextNode(finalText));
        };

        if (!$image && convertMode && linkText) {
          linkText = maplebirch.tool.convert(linkText, convertMode);
          $link.empty().append(document.createTextNode(linkText));
        }

        $container.append($link);
        $container.appendTo(this.output);
        setup.maplebirch.language.add('langlink', uniqueId, updateLinkText);
        $container.on('remove', () => setup.maplebirch.language.remove('langlink', uniqueId));
      } catch (e) {
        console.error('<<langlink>> 宏处理错误', e);
        return this.error(`<<langlink>> 执行错误: ${e.message}`);
      }
    }

    _langlistbox() {
      try {
        if (!this.args || this.args.length === 0) return this.error('<<langlistbox>> 需要至少一个参数：变量名');
        const varName = String(this.args[0]).trim();
        if (!varName || (varName[0] !== '$' && varName[0] !== '_')) return this.error(`变量名 '${varName}' 缺少sigil（$ 或 _）`);
        const varId = maplebirch.SugarCube.Util.slugify(varName);
        const config = { autoselect: false };
        for (let i = 1; i < this.args.length; ++i) {
          const arg = this.args[i];
          if (arg === 'autoselect') config.autoselect = true;
        }

        const options = [];
        let selectedIdx = -1;
        const uniqueId = `${Date.now()}-${Math.random().toString(36)}`;
        for (let i = 1; i < this.payload.length; ++i) {
          const payload = this.payload[i];

          if (payload.name === 'option') {
            if (payload.args.length === 0) return this.error('<<option>> 需要参数');
            const label = String(payload.args[0]);
            const value = payload.args.length > 1 ? payload.args[1] : label;
            const isSelected = payload.args.includes('selected');
            options.push({ label, value });
            if (isSelected) {
              if (config.autoselect) return this.error('不能同时指定 autoselect 和 selected');
              if (selectedIdx !== -1) return this.error('只能有一个选中选项');
              selectedIdx = options.length - 1;
            }
          } else if (payload.name === 'optionsfrom') {
            if (!payload.args.full) return this.error('<<optionsfrom>> 需要表达式');
            let result;
            try {
              const exp = payload.args.full;
              result = maplebirch.SugarCube.Scripting.evalJavaScript(exp[0] === '{' ? `(${exp})` : exp);
            } catch (ex) {
              return this.error(`表达式错误: ${ex.message}`);
            }
            if (typeof result !== 'object' || result === null) return this.error('表达式必须返回对象或数组');
            if (Array.isArray(result) || result instanceof Set) {
              result.forEach(val => options.push({ label: String(val), value: val }));
            } else if (result instanceof Map) {
              result.forEach((val, key) => options.push({ label: String(key), value: val }));
            } else {
              Object.keys(result).forEach(key => options.push({ label: key, value: result[key] }));
            }
          }
        }

        if (options.length === 0) return this.error('没有指定选项');
        if (selectedIdx === -1) {
          selectedIdx = config.autoselect ? options.findIndex(opt => maplebirch.SugarCube.Util.sameValueZero(opt.value, State.getVar(varName))) : 0;
          if (selectedIdx === -1) selectedIdx = 0;
        }

        const $select = jQuery(document.createElement('select'))
          .attr({
            id: `langlistbox-${varId}-${uniqueId}`,
            name: `langlistbox-${varId}`,
            tabindex: 0
          })
          .addClass('macro-langlistbox')
          .on('change.macros', this.createShadowWrapper(function () { State.setVar(varName, options[Number(this.value)].value); }));
        options.forEach((opt, i) => {
          jQuery(document.createElement('option'))
            .val(i)
            .text(processHandling.getTranslation(opt.label, maplebirch) || opt.label)
            .attr('data-translation-key', opt.label)
            .prop('selected', i === selectedIdx)
            .appendTo($select);
        });

        $select.appendTo(this.output);
        State.setVar(varName, options[selectedIdx].value);
        const updateTexts = () => {
          $select.find('option').each(function () {
            const $opt = $(this);
            const newText = processHandling.getTranslation($opt.attr('data-translation-key'), maplebirch) || $opt.attr('data-translation-key');
            $opt.text(newText);
          });
        };
        setup.maplebirch.language.add('langlistbox', uniqueId, updateTexts);
        $select.on('remove', () => setup.maplebirch.language.remove('langlistbox', uniqueId));
      } catch (e) {
        console.error('<<langlistbox>> 错误', e);
        return this.error(`<<langlistbox>> 错误: ${e.message}`);
      }
    }

    _radiobuttonsfrom() {
      if (this.args.length < 2) return this.error('缺少参数：变量名和选项数组');
      let varPath = this.args[0];
      if (typeof varPath === 'string') {
      } else if (typeof varPath === 'object' && varPath.raw) {
        varPath = varPath.raw[0];
      } else {
        varPath = String(varPath);
      }
      const options = this.args[1];
      if (!Array.isArray(options)) return this.error('第二个参数必须是数组');
      const separator = this.args.length > 2 ? this.args[2] : ' | ';
      const container = $('<span>').addClass('radiobuttonsfrom-container');
      options.forEach((option, index) => {
        const label = $('<label>').addClass('radiobuttonsfrom-label');
        const temp = document.createElement('div');
        let optionValue, displayText;
        if (Array.isArray(option)) {
          optionValue = option[0];
          displayText = option[1];
        } else {
          optionValue = option;
          displayText = option;
        }
        new maplebirch.SugarCube.Wikifier(temp, `<<radiobutton '${varPath}' '${optionValue.replace(/'/g, "\\'")}' autocheck>>`);
        $(temp).children().appendTo(label);
        label.append(displayText);
        container.append(label);
        if (index < options.length - 1) container.append(document.createTextNode(separator));
      });
      container.appendTo(this.output);
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
      const modList = maplebirch.modUtils.getModListName();
      for (let i = 0; i < modList.length; i++) {
        const modName = modList[i];
        const modinfo = maplebirch.modUtils.getMod(modName);
        if (!modinfo) continue;
        if (!modinfo.bootJson.dependenceInfo) continue;
        if (modinfo.bootJson.dependenceInfo.some(dep => dep.modName === 'maplebirch') && !maplebirch.modList.includes(modinfo.name)) {
          maplebirch.modList.push(modinfo.name);
        }
      }
    }

    _showModVersions() {
      const html = `<div id='modversions'>Maplebirch Framework v${maplebirch.constructor.meta.version} | 
      ${maplebirch.autoTranslate('Dependence')}: ${maplebirch.modList.length}</div>`;
      return html;
    }

    _showFrameworkInfo() {
      let html_1 = `<div class='p-2 text-align-center'>
          <h3>[[${maplebirch.t('Maplebirch Frameworks')}|'https://github.com/MaplebirchLeaf/SCML-DOL-maplebirchframework']]</h3>
          <div class='m-2'><span class='gold'>${maplebirch.t('Version')}：</span>${maplebirch.constructor.meta.version}<br></div>
          <div class='m-2'><span class='gold'>${maplebirch.t('Author')}：</span>${maplebirch.autoTranslate(maplebirch.constructor.meta.author)}<br></div>
          <div class='m-2'><span class='gold'>${maplebirch.t('Last Modified By')}：</span>${maplebirch.autoTranslate(maplebirch.constructor.meta.modifiedby)}<br></div>
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
        const text = `<div class='modinfo'>・${modname}：v${modversion}</div>`;
        html.push(text);
      }

      if (html.length > 0) {
        html_1 += `
          <div class='p-2 text-align-center'>
            <h3>${maplebirch.t('Maplebirch Frameworks Mod List')}</h3>
            <div id='modlist'>${html.join('')}</div>
          </div>
        `;
      }
      
      return html_1;
    }

    #updatePermissions() {
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
      if (sandbox.V && !allowedObjects.has('V')) { this.tool.console.allowObject('V'); }
      else if (!sandbox.V && allowedObjects.has('V')) { this.tool.console.disallowObject('V'); }
      if (sandbox.T && !allowedObjects.has('T')) { this.tool.console.allowObject('T');}
      else if (!sandbox.T && allowedObjects.has('T')) { this.tool.console.disallowObject('T'); }
      if (sandbox.maplebirch && !allowedObjects.has('maplebirch')) { this.tool.console.allowObject('maplebirch'); }
      else if (!sandbox.maplebirch && allowedObjects.has('maplebirch')) { this.tool.console.disallowObject('maplebirch'); }
      if (sandbox.window && !this.tool.console.fullAccess) { this.tool.console.enableFullAccess(); }
      else if (!sandbox.window && this.tool.console.fullAccess) { this.tool.console.disableFullAccess(); }
      const text = maplebirch.t('permission');
      const vItem = $(`label:contains('V ${text}')`).closest('.settingsToggleItem');
      const tItem = $(`label:contains('T ${text}')`).closest('.settingsToggleItem');
      const mbItem = $(`label:contains('Maplebirch ${text}')`).closest('.settingsToggleItem');
      const wItem = $(`label:contains('window ${text}')`).closest('.settingsToggleItem');
      const vDisabled = sandbox.window || sandbox.maplebirch;
      const tDisabled = sandbox.window || sandbox.maplebirch;
      const mbDisabled = sandbox.window || !(sandbox.V && sandbox.T);
      const wDisabled = !sandbox.maplebirch;
      vItem.css('color', vDisabled ? 'var(--400)' : 'var(--000)');
      vItem.find('input').prop('disabled', vDisabled).prop('checked', sandbox.V);
      tItem.css('color', tDisabled ? 'var(--400)' : 'var(--000)');
      tItem.find('input').prop('disabled', tDisabled).prop('checked', sandbox.T);
      mbItem.css('color', mbDisabled ? 'var(--400)' : 'var(--000)');
      mbItem.find('input').prop('disabled', mbDisabled).prop('checked', sandbox.maplebirch);
      wItem.css('color', wDisabled ? 'var(--400)' : 'var(--000)');
      wItem.find('input').prop('disabled', wDisabled).prop('checked', sandbox.window);
    }

    compatibleModI18N() {
      if (maplebirch.modUtils.getMod('ModI18N')) {
        const originalName = setup.NPC_CN_NAME;
        setup.NPC_CN_NAME = function (args) {
          if (!args || typeof args !== 'string') return args;
          const originalResult = originalName(args);
          if (originalResult !== args) return originalResult;
          if (maplebirch.lang.translations.has(args)) return maplebirch.autoTranslate(args);
          return args;
        };
        const originalTitle = setup.NPC_CN_TITLE;
        setup.NPC_CN_TITLE = function (str) {
          if (!str || typeof str !== 'string') return str;
          const originalResult = originalTitle(str);
          if (originalResult !== str) return originalResult;
          if (maplebirch.lang.translations.has(str)) return maplebirch.autoTranslate(str);
          return str;
        };
      }
    }

    preInit() {
      Object.defineProperties(window, { lanSwitch: { value: this._languageSwitch }, });

      this.tool.framework.onInit(() => {
        setup.maplebirch = {};
        this.#languageWidgetManager();
        setup.maplebirch.hint = (() => {
          const hint = [];
          function push(...args) { args.forEach(item => { if (!hint.includes(item)) hint.push(item); }); }
          return { push, get play() { return hint.map(item => `${item}`).join(''); } };
        })();
        setup.maplebirch.content = (() => {
          const content = [];
          function push(...args) { args.forEach(item => { if (!content.includes(item)) content.push(item); }); }
          return { push, get play() { return content.map(item => `${item}`).join(''); } };
        })();
      });
      this.tool.framework.addTo('HintMobile', 'maplebirchModHintMobile');
      this.tool.framework.addTo('MenuBig', 'maplebirchModHintDesktop');
      
      this.tool.other.configureLocation('lake_ruin', {
        condition: () => Weather.bloodMoon && !Weather.isSnow
      }, { layer: 'base', element: 'bloodmoon' });

      this.tool.other.configureLocation('lake_ruin', {
        condition: () => Weather.bloodMoon && Weather.isSnow
      }, { layer: 'base', element: 'bloodmoon_snow' });

      maplebirch.once(':definewidget', () => {
        this.tool.widget.defineMacro('language', this._language, ['option'], false, false);
        this.tool.widget.defineMacro('lanSwitch', this._languageSwitch);
        this.tool.widget.defineMacro('langbutton', this._languageButton, null, false, true);
        this.tool.widget.defineMacro('langlink', this._languageLink, null, false, true);
        this.tool.widget.defineMacro('langlistbox', this._langlistbox, ['option', 'optionsfrom'], ['optionsfrom'], true);
        this.tool.widget.defineMacro('radiobuttonsfrom', this._radiobuttonsfrom);
        this.tool.widget.defineMacro('maplebirchTextOutput', this.tool.text.makeMacroHandler());
        this.tool.widget.defineMacroS('maplebirchFrameworkVersions', this._showModVersions);
        this.tool.widget.defineMacroS('maplebirchFrameworkInfo', () => this._showFrameworkInfo());
      });

      maplebirch.on(':passagestart', () => {
        if (!V.options) return;
        const c = V.options.maplebirch?.debug, d = V.debug
        this.debug ??= typeof c === 'boolean' ? c : (d === 0 || d === 1 ? d === 1 : false)
        typeof c === 'boolean' && c !== this.debug ? (this.debug = c, V.debug = c ? 1 : 0) : (d === 0 || d === 1) && (d === 1) !== this.debug ? (this.debug = d === 1, V.options.maplebirch.debug = this.debug) : 0
        V.options.maplebirch.debug = this.debug, V.debug = this.debug ? 1 : 0
      });

      maplebirch.on(':loadSaveData', () => maplebirch.Language = V?.maplebirch?.language);

      $(document).on('mouseup touchend', '.settingsToggleItem', () => {
        if (!maplebirch.modules.initPhase.preInitCompleted) return;
        try {
          let needsRefresh = false;
          if (typeof T.selectedLang === 'string' && maplebirch.constructor.meta.availableLanguages.includes(T.selectedLang)) {
            if (T.selectedLang !== maplebirch.lang.language) {
              maplebirch.Language = T.selectedLang;
              if (typeof V.maplebirch !== 'object') V.maplebirch = {};
              V.maplebirch.language = T.selectedLang;
              needsRefresh = true;
            }
          }
          const npcSidebarName = V.options?.maplebirch?.npcsidebar?.nnpc;
          if (T.fixedName && typeof T.fixedName === 'string' && npcSidebarName) if (T.fixedName.split('.')[T.fixedName.split('.').length - 1] !== npcSidebarName) needsRefresh = true;
          if (needsRefresh) $.wiki('<<replace #customOverlayContent>><<maplebirchOptions>><</replace>>');
        } catch (error) { console.log('鼠标事件处理错误:', error); }
      });

      maplebirch.on('update', () => {
        if (this.updateTimer) clearTimeout(this.updateTimer);
        this.updateTimer = setTimeout(() => {
          this.#updatePermissions();
          this.updateTimer = null;
        }, 50);
      });

      $(document).on('click', '.link-internal.macro-button', () => {
        if (!maplebirch.modules.initPhase.preInitCompleted) return;
        if (this.updateTimer) clearTimeout(this.updateTimer);
        try {
          this.updateTimer = setTimeout(() => {
          const count = ((V.options.maplebirch?.relationcount ?? 4) - 2);
          document.querySelectorAll('.relation-stat-list').forEach(list => list.style.setProperty('--maplebirch-relation-count', count));
        }, 100);
        } catch { console.log('点击事件处理错误:', error); }
      });

      $(document).on('change', 'input[name="radiobutton--maplebirchbodywritingcolor"]', function () {
        if (!maplebirch.modules.initPhase.preInitCompleted) return;
        if (T.maplebirchBodywriting.color === 'custom') {
          $.wiki('<<replace "#maplebirchBodyWriting">><br><<lanSwitch "Custom Color" "自定义颜色">>: <<textbox "_maplebirchBodywriting.custom" "#FFFFFF">><span id="colorPreviewBox" style="display: inline-block;width: 20px;height: 20px;border:1px solid #ccc;margin-left:5px;background-color: #FFFFFF;"></span><</replace>>');
        } else {
          $.wiki('<<replace "#maplebirchBodyWriting">><</replace>>');
        }
      });

      $(document).on('input', 'input[name="textbox--maplebirchbodywritingcustom"]', function () {
        if (!maplebirch.modules.initPhase.preInitCompleted) return;
        let color = this.value;
        if (!color.startsWith('#')) color = '#' + color;
        let preview = document.getElementById('colorPreviewBox');
        if (preview && /^#[0-9A-F]{3,6}$/i.test(color)) preview.style.backgroundColor = color;
      });
    }

    Init() {
      Dynamic.task = (fn, name) => this._fixDynamicTask(fn, name);
      if (maplebirch.gameVersion >= '0.5.6.10') this.compatibleModI18N();
    }

    postInit() {
    }
  }
  
  await maplebirch.register('processHandling', new processHandling(), ['tool']);
})();