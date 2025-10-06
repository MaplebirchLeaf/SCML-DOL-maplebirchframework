// 此处来源于Dom罗宾模组
(async() => {
  const modUtils = window.modUtils;
  const logger = modUtils.getLogger();
  const modSC2DataManager = window.modSC2DataManager;
  const addonTweeReplacer = window.addonTweeReplacer; // Twee
  const addonReplacePatcher = window.addonReplacePatcher; // JavaScript
  const maplebirch = window.maplebirch;
  logger.log('[maplebirchMod] 开始执行');

  /*async function fixDolGlitch() {
    const Widget_Named_NPCsPassagePath = 'Widgets Named Npcs';
    const passage1 = modUtils.getPassageData(Widget_Named_NPCsPassagePath);
    if (modUtils.getMod('ModI18N')) {
    modUtils.updatePassageData(
      passage1.name,
      passage1.content.replace(/rank: "见习教徒",/, 'rank: "initiate",'),
      passage1.tags,
      passage1.id);
    }
  }*/

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

  async function modifyJournalTime() {
    const oldSCdata = modSC2DataManager.getSC2DataInfoAfterPatch();
    const SCdata = oldSCdata.cloneSC2DataInfo();
    const passageData = SCdata.passageDataItems.map;
    const JournalTwinePath = 'Widgets Journal';
    const modify = passageData.get(JournalTwinePath);
    const regex = /<<print\s*("It is "\s*\+\s*getFormattedDate\(Time\.date\)\s*\+\s*",\s*"\s*\+\s*Time\.year\s*\+\s*"\."|"今天是"\s*\+\s*Time\.year\s*\+\s*"年"\s*\+\s*getFormattedDate\(Time\.date\)\s*\+\s*"。"|ordinalSuffixOf\(Time\.monthDay\)\s*\+\s*"\s*"\s*\+\s*Time\.monthName\.slice\(0,3\)|Time\.month\s*\+\s*"月"\s*\+\s*ordinalSuffixOf\(Time\.monthDay\)\s*\+\s*"日")\s*>>/;
    if (regex.test(modify.content)) modify.content = modify.content.replace(regex,`<<= maplebirch.state.updateTimeLanguage('JournalTime')>>`);
    passageData.set(JournalTwinePath, modify);
    SCdata.passageDataItems.back2Array();
    addonTweeReplacer.gModUtils.replaceFollowSC2DataInfo(SCdata, oldSCdata);  
  }

  class MaplebirchFrameworkAddon {
    constructor(core, gSC2DataManager, gModUtils) {
      this.core = core;
      this.gSC2DataManager = gSC2DataManager;
      this.gModUtils = gModUtils;
      this.info = new Map();
      this.logger = gModUtils.getLogger();
      this.gModUtils.getAddonPluginManager().registerAddonPlugin('maplebirch', 'maplebirchAddon', this);
      this.supportedConfigs = ['language', 'audio', 'framework', 'npc'];
      this.queue = {};
      this.processed = {};
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
      await this.core.tool.framework.afterPatchModToGame();
      await modifyOptionsDateFormat();
      await modifyJournalTime();
    }

    #getModConfig(modInfo) {
      const pluginConfig = modInfo.bootJson.addonPlugin?.find(p => p.modName === 'maplebirch' && p.addonName === 'maplebirchAddon');
      return pluginConfig || {};
    }

    async registerMod(addonName, mod, modZip) {
      this.info.set(mod.name, {
        addonName: addonName,
        mod: mod,
        modZip: modZip
      });
      const config = this.#getModConfig(mod);
      if (Object.keys(config.params || {}).length > 0) if (!this.core.modList.includes(mod.name)) this.core.modList.push(mod.name);
      this.supportedConfigs.forEach(type => {
        if (config.params?.[type]) {
          this.queue[type].push({
            modName: mod.name,
            modZip: modZip,
            config: config.params[type]
          });
        }
      });
      this.core.log(`[MaplebirchAddonPlugin] 注册Mod: ${mod.name}`, 'DEBUG');
      this.logger.log(`[MaplebirchAddonPlugin] 注册Mod: ${mod.name}`);
    }

    async afterPatchModToGame() {
      await this.#vanillaDataReplace();
      await this.#processLanguage();
      await this.#processAudio();
      await this.#processFramework();
      await this.#processNpc();
    }

    async #processLanguage() {
      if (this.processed.language || this.queue.language.length === 0) return;
      try {
        for (const task of this.queue.language) {
          const { modName, modZip, config } = task;
          if (config === true) {
            await this.core.lang.importAllLanguages(modName);
          } else if (Array.isArray(config)) {
            this.core.log(`为${modName}导入指定语言: ${config.join(', ')}`, 'DEBUG');
            for (const lang of config) {
              const filePath = `translations/${lang.toLowerCase()}.json`;
              await this.core.lang.loadTranslations(modName, lang.toUpperCase(), filePath);
            }
          } else if (typeof config === 'object' && config !== null) {
            this.core.log(`为${modName}导入自定义语言配置`, 'DEBUG');
            for (const [lang, langConfig] of Object.entries(config)) {
              const filePath = langConfig.file || `translations/${lang.toLowerCase()}.json`;
              await this.core.lang.loadTranslations(modName, lang.toUpperCase(), filePath);
            }
          }
        }
        this.processed.language = true;
      } catch (e) {
        this.core.log(`语言配置处理失败: ${e.message}`, 'ERROR');
      }
    }

    async #processAudio() {
      if (this.processed.audio || this.queue.audio.length === 0) return;
      try {
        for (const task of this.queue.audio) {
          const { modName, modZip, config } = task;
          if (config === true) {
            this.core.log(`为${modName}导入音频（默认路径）`, 'DEBUG');
            await this.core.audio.importAllAudio(modName);
          } else if (typeof config === 'string') {
            this.core.log(`为${modName}导入音频（路径: ${config}）`, 'DEBUG');
            await this.core.audio.importAllAudio(modName, config);
          }
        }
        this.processed.audio = true;
      } catch (e) {
        this.core.log(`音频配置处理失败: ${e.message}`, 'ERROR');
      }
    }

    async #processFramework() {
      if (this.processed.framework || this.queue.framework.length === 0) return;
      try {
        for (const task of this.queue.framework) {
          const { modName, config } = task;
          if (config.traits) this.#handleTraits(modName, config.traits);
          if (Array.isArray(config)) {
            config.forEach(item => {
              if (item.addto && item.widget) this.#addWidgetWithConditions(modName, item.addto, item.widget);
            });
          } else if (typeof config === 'object' && config.addto && config.widget) {
            this.#addWidgetWithConditions(modName, config.addto, config.widget);
          }
        }
        this.processed.framework = true;
      } catch (e) {
        this.core.log(`框架配置处理失败: ${e.message}`, 'ERROR');
      }
    }

    #addWidgetWithConditions(modName, zone, widget) {
      if (typeof widget === 'string') {
        this.core.log(`为Mod ${modName}添加部件到区域: ${zone} (${widget})`, 'DEBUG');
        this.core.tool.framework.addTo(zone, widget);
      } else if (typeof widget === 'object' && widget.widget) {
        const widgetObj = {
          widget: widget.widget,
          exclude: widget.exclude,
          match: widget.match,
          passage: widget.passage
        };
        this.core.tool.framework.addTo(zone, widgetObj);
      } else {
        this.core.log(`无效的部件配置: ${JSON.stringify(widget)}`, 'WARN');
      }
    }

    #handleTraits(modName, traitsConfig) {
      if (Array.isArray(traitsConfig)) {
        traitsConfig.forEach(trait => this.#addTrait(modName, trait));
      } else if (typeof traitsConfig === 'object') {
        this.#addTrait(traitsConfig);
      }
    }

    #addTrait(traitConfig) {
      const { title, name, colour, has, text } = traitConfig;
      if (!title || !name) { this.core.log(`无效的特质配置: ${JSON.stringify(traitConfig)}`, 'WARN'); return;}
      let hasCondition;
      if (typeof has === 'string') {
        try {
          hasCondition = new Function(`return ${has};`);
        } catch (e) {
          this.core.log(`无效的 has 条件表达式: ${has}`, 'ERROR');
          hasCondition = () => false;
        }
      } else {
        const hasValue = has || false;
        hasCondition = () => hasValue;
      }
      const trait = {
        title: title,
        name: name,
        colour: colour || '',
        has: hasCondition,
        text: text || ''
      };
      this.core.tool.other.addTraits(trait);
    }

    async #processNpc() {
      if (this.processed.npc || this.queue.npc.length === 0) return;
      try {
        for (const task of this.queue.npc) {
          const { config } = task;
          if (!Array.isArray(config)) {
            this.core.log(`NPC 配置必须为数组格式，跳过处理`, 'WARN');
            continue;
          }
          config.forEach(npcConfig => {
            if (!npcConfig || typeof npcConfig !== 'object') return;
            if (npcConfig.data) this.core.npc.add(npcConfig.data);
            if (npcConfig.state) this.core.npc.addStats(npcConfig.state);
          });
        }
        this.processed.npc = true;
      } catch (e) {
        this.core.log(`NPC 配置处理失败: ${e.message}`, 'ERROR');
      }
    }
  }

  maplebirch.addonPlugin = new MaplebirchFrameworkAddon(maplebirch, modSC2DataManager, modUtils);
})();