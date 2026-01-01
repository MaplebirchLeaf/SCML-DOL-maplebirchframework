// @ts-check
/// <reference path='../maplebirch.d.ts' />
(async() => {
  'use strict';
  const logger = modUtils.getLogger();
  logger.log('[maplebirchMod] 开始执行');

  async function modifyEffect() {
    const oldSCdata = modSC2DataManager.getSC2DataInfoAfterPatch();
    const SCdata = oldSCdata.cloneSC2DataInfo();
    const effectJavascriptPath = 'effect.js';
    const file = SCdata.scriptFileItems.getByNameWithOrWithoutPath(effectJavascriptPath);
    const regex = /break;\n\t{4}default:/;
    if (regex.test(file.content)) {
      file.content = file.content.replace(
        regex,
        'break;\n\t\t\t\tdefault:\n\t\t\t\t\tif (maplebirch.char.transformation.message(messageKey, { element: element, sWikifier: sWikifier, fragment: fragment, wikifier: wikifier })) break;'
      );
    }
    addonReplacePatcher.gModUtils.replaceFollowSC2DataInfo(SCdata, oldSCdata);
  }

  async function modifyOptionsDateFormat() {
    const oldSCdata = modSC2DataManager.getSC2DataInfoAfterPatch();
    const SCdata = oldSCdata.cloneSC2DataInfo();
    const passageData = SCdata.passageDataItems.map;
    const OptionsOverlayTwinePath = 'Options Overlay';
    const modify = passageData.get(OptionsOverlayTwinePath);
    const regex1 = /<label\s+class="en-GB">\s*<<radiobutton\s*"\$options\.dateFormat"\s*"en-GB"\s*autocheck\s*>>\s*([^<]+)<\/label>/;
    const regex2 = /<label\s+class="en-US">\s*<<radiobutton\s*"\$options\.dateFormat"\s*"en-US"\s*autocheck\s*>>\s*([^<]+)<\/label>/;
    const regex3 = /<label\s+class="zh-CN">\s*<<radiobutton\s*"\$options\.dateFormat"\s*"zh-CN"\s*autocheck\s*>>\s*([^<]+)<\/label>/;
    const text1 = modUtils.getMod('ModI18N') ? '英(日/月/年)' : 'GB(dd/mm/yyyy)';
    const text2 = modUtils.getMod('ModI18N') ? '美(月/日/年)' : 'US(mm/dd/yyyy)';
    const text3 = modUtils.getMod('ModI18N') ? '中(年/月/日)' : 'CN(yyyy/mm/dd)';
    if (regex1.test(modify.content)) modify.content = modify.content.replace(regex1, `<label class="en-GB"><<radiobutton "$options.dateFormat" "en-GB" autocheck>> ${text1}</label>`);
    if (regex2.test(modify.content)) modify.content = modify.content.replace(regex2, `<label class="en-US"><<radiobutton "$options.dateFormat" "en-US" autocheck>> ${text2}</label>`);
    if (regex3.test(modify.content)) modify.content = modify.content.replace(regex3, `<label class="zh-CN"><<radiobutton "$options.dateFormat" "zh-CN" autocheck>> ${text3}</label>`);
    passageData.set(OptionsOverlayTwinePath, modify);
    SCdata.passageDataItems.back2Array();
    addonTweeReplacer.gModUtils.replaceFollowSC2DataInfo(SCdata, oldSCdata);  
  }

  class Process {
    /** @param {FrameworkAddon} addon */
    static async Language(addon) {
      if (addon.processed.language || addon.queue.language.length === 0) return;
      try {
        for (const task of addon.queue.language) {
          const { modName, modZip, config } = task;
          if (config === true) {
            await addon.core.lang.importAllLanguages(modName);
          } else if (Array.isArray(config)) {
            addon.core.log(`为${modName}导入指定语言: ${config.join(', ')}`, 'DEBUG');
            for (const lang of config) {
              const filePath = `translations/${lang.toLowerCase()}.json`;
              await addon.core.lang.loadTranslations(modName, lang.toUpperCase(), filePath);
            }
          } else if (typeof config === 'object' && config !== null) {
            addon.core.log(`为${modName}导入自定义语言配置`, 'DEBUG');
            for (const [lang, langConfig] of Object.entries(config)) {
              const filePath = langConfig.file || `translations/${lang.toLowerCase()}.json`;
              await addon.core.lang.loadTranslations(modName, lang.toUpperCase(), filePath);
            }
          }
        }
        addon.processed.language = true;
      } catch (/**@type {any}*/e) {
        addon.core.log(`语言配置处理失败: ${e.message}`, 'ERROR');
      }
    }

    /** @param {FrameworkAddon} addon */
    static async Audio(addon) {
      if (addon.processed.audio || addon.queue.audio.length === 0) return;
      try {
        for (const task of addon.queue.audio) {
          const { modName, modZip, config } = task;
          if (config === true) {
            addon.core.log(`为${modName}导入音频（默认路径）`, 'DEBUG');
            await addon.core.audio.importAllAudio(modName);
          } else if (Array.isArray(config)) {
            for (const path of config) {
              addon.core.log(`为${modName}导入音频（路径: ${path}）`, 'DEBUG');
              await addon.core.audio.importAllAudio(modName, path);
            }
          }
        }
        addon.processed.audio = true;
      } catch (/**@type {any}*/e) {
        addon.core.log(`音频配置处理失败: ${e.message}`, 'ERROR');
      }
    }

    /** @param {FrameworkAddon} addon */
    static async Framework(addon) {
      if (addon.processed.framework || addon.queue.framework.length === 0) return;
      try {
        for (const task of addon.queue.framework) {
          const { modName, config } = task;
          const configs = Array.isArray(config) ? config : [config];
          for (const singleConfig of configs) {
            if (singleConfig.traits) {
              if (!singleConfig.traits || !Array.isArray(singleConfig.traits) || singleConfig.traits.length === 0) return;
              singleConfig.traits.forEach((/**@type {{ title: string | Function; name:string|Function;colour:string|Function; has: boolean|Function; text: string|Function; }}*/ trait) => Process.#addTrait(addon, trait));
            } else if (singleConfig.addto && singleConfig.widget) {
              Process.#addWidget(addon, modName, singleConfig.addto, singleConfig.widget);
            } else {
              addon.core.log(`模块 ${modName} 的框架配置格式无效: ${JSON.stringify(singleConfig)}`, 'WARN');
            }
          }
        }
        addon.processed.framework = true;
      } catch (/**@type {any}*/e) {
        addon.core.log(`框架配置处理失败: ${e.message}`, 'ERROR');
      }
    }

    /** @param {FrameworkAddon} addon @param {{ title: string|Function; name: string|Function; colour: string|Function; has: boolean|Function; text: string|Function; }} traitConfig */
    static #addTrait(addon, traitConfig) {
      const { title, name, colour, has, text } = traitConfig;
      if (!title || !name) { addon.core.log(`无效的特质配置: ${JSON.stringify(traitConfig)}`, 'WARN'); return;}
      let hasCond;
      if (typeof has === 'string') {
        try { hasCond = new Function(`return ${has};`); }
        catch (e) { addon.core.log(`无效的 has 条件表达式: ${has}`, 'ERROR'); hasCond = () => false; }
      } else {
        const hasValue = has ?? false;
        hasCond = () => hasValue;
      }
      const trait = { title: title, name: name, colour: colour ?? '', has: hasCond, text: text ?? '', };
      addon.core.tool.other.addTraits(trait);
    }

    /** @param {FrameworkAddon} addon @param {string} modName 模块名称 @param {string} zone 目标区域 @param {string|Object<string, {widget: string,exclude: string[], match: RegExp, passage: string[]}>} widget 部件配置 */
    static #addWidget(addon, modName, zone, widget) {
      if (typeof widget === 'string') {
        addon.core.log(`为Mod ${modName}添加部件到区域: ${zone} (${widget})`, 'DEBUG');
        addon.core.tool.framework.addTo(zone, widget);
      } else if (typeof widget === 'object' && widget.widget) {
        const widgetObj = { widget: widget.widget, exclude: widget.exclude, match: widget.match, passage: widget.passage };
        addon.core.tool.framework.addTo(zone, widgetObj);
      } else {
        addon.core.log(`无效的部件配置: ${JSON.stringify(widget)}`, 'WARN');
      }
    }

    /** @param {FrameworkAddon} addon */
    static async NPC(addon) {
      if (addon.processed.npc || addon.queue.npc.length === 0) return;
      try {
        for (const task of addon.queue.npc) {
          const { config } = task;
          if (!Array.isArray(config)) { addon.core.log(`NPC 配置必须为数组格式，跳过处理`, 'WARN'); continue; }
          config.forEach(npcConfig => {
            if (!npcConfig || typeof npcConfig !== 'object') return;
            if (npcConfig.data) addon.core.npc.add(npcConfig.data, npcConfig?.config ?? {}, npcConfig?.translations ?? {});
            if (npcConfig.state) addon.core.npc.addStats(npcConfig.state);
          });
        }
        addon.processed.npc = true;
      } catch (/**@type {any}*/e) { addon.core.log(`NPC 配置处理失败: ${e.message}`, 'ERROR'); }
    }

    /** @param {FrameworkAddon} addon */
    static async NPCSidebar(addon) {
      if (addon.processed.npcSidebar || addon.queue.npcSidebar.length === 0) return;
      try {
        /**@type {Object<string,Set<string>>}*/const npcDisplay = {};
        for (const task of addon.queue.npcSidebar) {
          const { modName, modZip, config } = task;
          if (!Array.isArray(config)) continue;
          /**@type {string[]}*/const modImages = [];
          config.forEach(npcSidebar => {
            const npcName = addon.core.tool.convert(npcSidebar.name, 'capitalize');
            if (!npcName) return;
            if (!npcDisplay[npcName]) npcDisplay[npcName] = new Set();
            npcSidebar.imgFile.forEach((/** @type {string} */imgPath) => {
              const extractFileName = (/** @type {string} */path) => {
                if (!path) return null;
                const baseName = /** @type {string} */(path.split('/').pop());
                return baseName.split('.')[0];
              };
              const fileName = extractFileName(imgPath);
              if (fileName) {
                npcDisplay[npcName].add(fileName);
                modImages.push(imgPath);
              }
            });
          });
          if (modImages.length > 0) await Process.#injectBSAImages(addon, modName, modZip, modImages);
        }
        addon.core.npc.Sidebar.display = npcDisplay;
        addon.processed.npcSidebar = true;
      } catch (/**@type {any}*/e) {
        addon.core.log(`npcSidebar 处理失败: ${e.message}`, 'ERROR');
      }
    }

    /** @param {FrameworkAddon} addon @param {string} modName @param {any} modZip @param {string[]} imgPaths */
    static async #injectBSAImages(addon, modName, modZip, imgPaths) {
      try {
        const imgs = [];
        for (const imgPath of imgPaths) {
          try {
            if (typeof imgPath !== 'string') continue;
            const file = modZip.zip.file(imgPath);
            if (!file) { addon.core.log(`图片未找到: ${imgPath} (模组: ${modName})`, 'WARN'); continue; }
            const base64Data = await file.async('base64');
            const mimeType = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',  gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml' }[/** @type {string} */(imgPath.split('.').pop()?.toLowerCase())] || 'image/png';
            const dataUrl = `data:${mimeType};base64,${base64Data}`;
            imgs.push({ path: imgPath, getter: { getBase64Image: async () => dataUrl, invalid: false } });
          } catch (/**@type {any}*/e) {
            addon.core.log(`加载图片失败: ${imgPath} - ${e.message}`, 'WARN');
          }
        }
        if (imgs.length === 0) return;
        await addonBeautySelectorAddon.registerMod(
          'BeautySelectorAddon',
          {
            name: 'maplebirch',
            bootJson: { addonPlugin: [{ modName: 'BeautySelectorAddon', addonName: 'BeautySelectorAddon', params: { type: `npc-sidebar-[${modName}]` } }] },
            imgs: imgs
          },
          modZip
        );
        addon.core.log(`成功注册 ${modName} 的 ${imgs.length} 个 NPC 侧边栏图片`, 'DEBUG');
      } catch (/**@type {any}*/e) { addon.core.log(`注册 ${modName} 的 NPC 侧边栏图片失败: ${e.message}`, 'ERROR'); }
    }

    /** @param {FrameworkAddon} addon */
    static async Shop(addon) {
      if (addon.processed.shop || addon.queue.shop.length === 0) return;
      try {
        for (const task of addon.queue.shop) {
          const { modName, modZip, config } = task;
          if (Array.isArray(config)) {
            for (const filePath of config) {
              addon.core.log(`为${modName}加载商店配置: ${filePath}`, 'DEBUG');
              await addon.core.shop.loadShopFromJson(modName, filePath);
            }
          } else { addon.logger.error(`无效的商店配置: ${JSON.stringify(config)}`); }
        }
        addon.processed.shop = true;
      } catch (/**@type {any}*/e) { addon.core.log(`商店配置处理失败: ${e.message}`, 'ERROR'); }
    }

    /** @param {FrameworkAddon} addon */
    static async Script(addon) {
      if (addon.processed.script || addon.queue.script.length === 0) return;
      try {
        for (const task of addon.queue.script) {
          const { modName, modZip, config } = task;
          if (!Array.isArray(config)) { addon.core.log(`Script 配置必须为数组格式，跳过处理: ${modName}`, 'WARN'); continue; }
          for (const filePath of config) await Process.#loadScriptFile(addon, modName, modZip, filePath);
        }
        addon.processed.script = true;
        addon.core.log(`Script文件加载完成`, 'DEBUG');
      } catch (/**@type {any}*/e) { addon.core.log(`Script文件配置处理失败: ${e.message}`, 'ERROR'); }
    }

    /** @param {FrameworkAddon} addon @param {string} modName @param {any} modZip @param {string} filePath */
    static async #loadScriptFile(addon, modName, modZip, filePath) {  // 从 loadJSFile 更名为 loadScriptFile
      try {
        const file = modZip.zip.file(filePath);
        if (!file) { addon.core.log(`Script文件未找到: ${filePath}`, 'WARN'); return; }
        const content = await file.async('text');
        addon.jsFiles.push({ modName, filePath, content });
      } catch (/**@type {any}*/e) { addon.core.log(`加载 Script 文件失败: ${filePath}`, 'ERROR'); }
    }
  }

  class FrameworkAddon {
    /** @param {MaplebirchCore} core @param {modSC2DataManager} gSC2DataManager @param {modUtils} gModUtils */
    constructor(core, gSC2DataManager, gModUtils) {
      this.core = core;
      this.gSC2DataManager = gSC2DataManager;
      this.gModUtils = gModUtils;
      this.addonTweeReplacer = addonTweeReplacer;
      this.addonReplacePatcher = addonReplacePatcher;
      /** @type {{ modifyWeatherJavaScript: () => any; }} */
      this.modifyWeather;
      maplebirch.trigger(':beforePatch', this);
      this.info = new Map();
      this.logger = gModUtils.getLogger();
      this.gModUtils.getAddonPluginManager().registerAddonPlugin('maplebirch', 'maplebirchAddon', this);
      this.gSC2DataManager.getModLoadController().addLifeTimeCircleHook('maplebirchFramework', this);
      this.supportedConfigs = ['script', 'language', 'audio', 'framework', 'npc', 'shop', 'npcSidebar'];  // 从 js 改为 script
      /** @type {Object<any, {modName: string, mod: any, modZip: any}>} */
      this.queue = {};
      /** @type {Object<string, boolean>} */
      this.processed = {};
      /** @type {Array<{modName: string, filePath: string, content: string}>} */
      this.jsFiles = [];
      this.supportedConfigs.forEach(type => {
        this.queue[type] = [];
        this.processed[type] = false;
      });
      const theName = this.gModUtils.getNowRunningModName();
      if (!theName) { this.logger.error('[MaplebirchAddonPlugin] 初始化失败: 无法获取当前Mod名称'); return;}
      this.nowModName = theName;
      const mod = this.gModUtils.getMod(theName);
      if (!mod) { this.logger.error(`[MaplebirchAddonPlugin] 初始化失败: 无法获取当前Mod对象 [${theName}]`); return;}
      mod.modRef = this;
      this.core.log(`[MaplebirchAddonPlugin] 初始化完成, 当前Mod: ${theName}`, 'DEBUG');
      this.logger.log(`[MaplebirchAddonPlugin] 初始化完成, 当前Mod: ${theName}`);
    }

    async #vanillaDataReplace() {
      this.core.log('开始执行正则替换', 'DEBUG');
      try { await modifyEffect(); } catch (e) { this.core.log('modifyEffect 出错', 'ERROR'); }
      try { await modifyOptionsDateFormat(); } catch (e) { this.core.log('modifyOptionsDateFormat 出错', 'ERROR'); }
      try { await this.modifyWeather.modifyWeatherJavaScript(); } catch (e) { this.core.log('modifyWeatherJavaScript 出错', 'ERROR'); }
    }

    /** @param {{ bootJson: { addonPlugin: any[]; }; }} modInfo */
    #getModConfig(modInfo) {
      const pluginConfig = modInfo.bootJson.addonPlugin?.find(p => p.modName === 'maplebirch' && p.addonName === 'maplebirchAddon');
      return pluginConfig || {};
    }

    /** @param {string} addonName @param {{ name: string; bootJson: { addonPlugin: any[]; }; }} mod @param {any} modZip */
    async registerMod(addonName, mod, modZip) {
      this.info.set(mod.name, { addonName: addonName, mod: mod, modZip: modZip });
      const config = this.#getModConfig(mod);
      if (Object.keys(config.params || {}).length > 0) if (!this.core.modList.includes(mod.name)) this.core.modList.push(mod.name);
      this.supportedConfigs.forEach(type => { if (config.params?.[type]) this.queue[type].push({modName: mod.name,modZip: modZip,config: config.params[type]}); });
      this.core.log(`[MaplebirchAddonPlugin] 注册Mod: ${mod.name}`, 'DEBUG');
      this.logger.log(`[MaplebirchAddonPlugin] 注册Mod: ${mod.name}`);
    }

    async InjectEarlyLoad_start() {
      try { await this.#simpleFrameworkCheck() } catch {};
    }

    async PatchModToGame_end() {
      try { await this.#JSInject() } catch {};
    }

    async afterPatchModToGame() {
      await this.core.tool.framework.afterPatchModToGame();
    }

    async beforePatchModToGame() {
      await this.core.trigger(':import');
      await this.#vanillaDataReplace();
      await this.#processInit();
      try { await this.core.shop.beforePatchModToGame(); } catch (/**@type {any}*/e) { this.core.log(`商店数据注入失败: ${e.message}`, 'ERROR'); }
    }

    async #simpleFrameworkCheck() {
      const modLoadController = modUtils.getModLoadController();
      const [enabledMods, disabledMods] = await Promise.all([
        modLoadController.listModIndexDB(),
        modLoadController.loadHiddenModList()
      ]);
      const modName = 'Simple Frameworks';
      if (!enabledMods.includes(modName)) return false;
      enabledMods.splice(enabledMods.indexOf(modName), 1);
      if (!disabledMods.includes(modName)) disabledMods.push(modName);
      await Promise.all([
        modLoadController.overwriteModIndexDBModList(enabledMods),
        modLoadController.overwriteModIndexDBHiddenModList(disabledMods)
      ]);
      location.reload();
    }

    async #JSInject() {
      if (this.jsFiles.length === 0) return;
      this.core.log(`开始执行 ${this.jsFiles.length} 个 Script 文件`, 'DEBUG');
      for (const jsFile of this.jsFiles) {
        try {
          const { modName, filePath, content } = jsFile;
          const func = new Function(content);
          const result = func();
          if (result && typeof result.then === 'function') await result;
        } catch (/** @type {any} */e) { this.core.log(`执行 Script 文件失败: ${e.message}`, 'ERROR'); }
      }
      this.jsFiles = [];
    }

    async #processInit() {
      try { await Process.Script(this); } catch (/**@type {any}*/e) { this.core.log(`Script文件处理过程失败: ${e.message}`, 'ERROR'); }  // 从 Process.JS 改为 Process.Script
      try { await Process.Language(this); } catch (/**@type {any}*/e) { this.core.log(`语言处理过程失败: ${e.message}`, 'ERROR'); }
      try { await Process.Audio(this); } catch (/**@type {any}*/e) { this.core.log(`音频处理过程失败: ${e.message}`, 'ERROR'); }
      try { await Process.Framework(this); } catch (/**@type {any}*/e) { this.core.log(`框架处理过程失败: ${e.message}`, 'ERROR'); }
      try { await Process.NPC(this); } catch (/**@type {any}*/e) { this.core.log(`NPC处理过程失败: ${e.message}`, 'ERROR'); }
      try { await Process.NPCSidebar(this); } catch (/**@type {any}*/e) { this.core.log(`NPC侧边栏处理过程失败: ${e.message}`, 'ERROR'); }
      try { await Process.Shop(this); } catch (/**@type {any}*/e) { this.core.log(`商店处理过程失败: ${e.message}`, 'ERROR'); }
    }
  }

  await maplebirch.register('addonPlugin', new FrameworkAddon(maplebirch, modSC2DataManager, modUtils), []);
})();