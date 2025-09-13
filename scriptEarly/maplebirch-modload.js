// 此处来源于Dom罗宾模组
(async() => {
  const modUtils = window.modUtils;
  const logger = modUtils.getLogger();
  const modSC2DataManager = window.modSC2DataManager;
  const addonTweeReplacer = window.addonTweeReplacer; // Twee
  const addonReplacePatcher = window.addonReplacePatcher; // JavaScript
  const maplebirch = window.maplebirch;
  logger.log('[maplebirchMod] 开始执行');

  async function effectAddTextAndWidget() {
    const oldSCdata = modSC2DataManager.getSC2DataInfoAfterPatch();
    const SCdata = oldSCdata.cloneSC2DataInfo();
    const datetimeScriptPath = 'effect.js';
    const file = SCdata.scriptFileItems.getByNameWithOrWithoutPath(datetimeScriptPath);
    if (!file) {
      maplebirch.log(`找不到文件: ${datetimeScriptPath}`, 'ERROR');
      return;
    }
    const regex = /(if \(V\.combat === 0 && V\.ironmanmode === true\) IronMan\.scheduledSaves\(\);)/;
    
    if (regex.test(file.content)) {
      file.content = file.content.replace(
        regex,
        "$1\n\n\tmaplebirch.tool.effect.executeEffects({element: element,wikifier: (...args) => {const command = args[0];const params = args.slice(1).join(' ');sWikifier(`<<${command}${params ? ' ' + params : ''}>>`);},container: fragment});"
      );
    }
    addonReplacePatcher.gModUtils.replaceFollowSC2DataInfo(SCdata, oldSCdata);
  }

  async function fixDolGlitch() {
    const Widget_Named_NPCsPassagePath = 'Widgets Named Npcs';
    const passage1 = modUtils.getPassageData(Widget_Named_NPCsPassagePath);
    if (modUtils.getMod('ModI18N')) {
    modUtils.updatePassageData(
      passage1.name,
      passage1.content.replace(/rank: "见习教徒",/, 'rank: "initiate",'),
      passage1.tags,
      passage1.id);
    }
  }

  async function modifyJournalTime() {
    const oldSCdata = modSC2DataManager.getSC2DataInfoAfterPatch();
    const SCdata = oldSCdata.cloneSC2DataInfo();
    const passageData = SCdata.passageDataItems.map;
    const JournalTwinePath = 'Widgets Journal';
    const modify = passageData.get(JournalTwinePath);
    const regex = /<<print\s*"([^"]*)"\s*\+\s*((?:Time\.\w+|ordinalSuffixOf\(Time\.monthDay\))\s*\+\s*)*"(.*?)"\s*>>/;
    const text = modUtils.getMod('ModI18N') ? "'今天是' + (Time.year > 0 ? '公元' : '公元前') + Math.abs(Time.year) + '年' + Time.month + '月' + ordinalSuffixOf(Time.monthDay) + '日'" :"'It is the ' + ordinalSuffixOf(Time.monthDay) + ' of ' + Time.monthName + ', ' + Math.abs(Time.year) + (Time.year > 0 ? 'AD' : 'BC') + '.'"
    if (regex.test(modify.content)) {
      modify.content = modify.content.replace(
        regex,
        `<<= ${text}>>`
      );
      passageData.set(JournalTwinePath, modify);
    }
    SCdata.passageDataItems.back2Array();
    addonTweeReplacer.gModUtils.replaceFollowSC2DataInfo(SCdata, oldSCdata);  
  }

  modSC2DataManager.getAddonPluginManager().registerAddonPlugin(
    'maplebirch',
    'maplebirchRe',
    {
      afterPatchModToGame: async() => {
        maplebirch.log('开始执行正则替换', 'DEBUG');
        await maplebirch.tool.framework.afterPatchModToGame();
        await effectAddTextAndWidget();
        await fixDolGlitch();
        await modifyJournalTime();
      }
    },
  );
})();