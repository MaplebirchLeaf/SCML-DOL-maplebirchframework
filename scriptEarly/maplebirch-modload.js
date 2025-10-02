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
    if (regex.test(modify.content)) {
      modify.content = modify.content.replace(regex,`<<= maplebirch.state.updateTimeLanguage('JournalTime')>>`);
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
        await modifyOptionsDateFormat();
        await modifyJournalTime();
      }
    },
  );
})();