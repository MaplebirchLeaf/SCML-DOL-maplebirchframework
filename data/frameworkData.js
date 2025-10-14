(() => {
  const maplebirch = window.maplebirch;

  const specialWidget = {
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

  const defaultData = {
    Init   : '<<run maplebirch.tool.framework.storyInit()>>',
    DataInit:'<<run maplebirch.trigger(":dataInit");>>',
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
                  <<langbutton 'execute'>>
                    <<run maplebirch.tool.console.execute('javascript')>>
                  <</langbutton>>
                </div>
                <span id="js-cheat-console-status" class="cheat-console-status"></span>
              </div>
            </details>
            <details class="TwineCheatConsole">
              <summary class="TwineCheatConsole">Twine <<= maplebirch.t('Code Cheater')>></summary>
              <div class="searchButtons">
                <div class="input-row">
                  <<textbox '_maplebirchTwineCheatConsole' ''>>
                  <<langbutton 'execute'>>
                    <<run maplebirch.tool.console.execute('twine')>>
                  <</langbutton>>
                </div>
                <span id="twine-cheat-console-status" class="cheat-console-status"></span>
              </div>
            </details>
          </div>
        <</if>>
      </div><hr>`,
    NPCinit : `<<run maplebirch.npc._vanillaNPCInit(_nam)>>`
  };

  const locationPassage = {
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

  const widgetPassage = {
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
      { src: '</div>\n\t<<closeButton>>\n<</widget>>\n\n<<widget "titleSaves">>', applybefore : '\t<<langbutton "Mods Settings">>\n\t\t\t<<toggleTab>>\n\t\t\t<<replace #customOverlayContent>><<maplebirchOptions>><</replace>>\n\t\t<</langbutton>>\n\t' },
      { src: '</div>\n\t<<closeButton>>\n<</widget>>\n\n<<widget "titleOptions">>', applybefore : '\t<<langbutton "Mods">>\n\t\t\t<<toggleTab>>\n\t\t\t<<replace #cheatsShown>><<maplebirchCheats>><</replace>>\n\t\t\t<<run $("#customOverlayContent").scrollTop(0);>>\n\t\t<</langbutton>>\n\t' },
      { src: '</div>\n\t<<closeButton>>\n<</widget>>\n\n<<widget "titleFeats">>', applybefore : '\t<<langbutton "Mods Statistics">>\n\t\t\t<<toggleTab>>\n\t\t\t<<replace #customOverlayContent>><<maplebirchStatistics>><</replace>>\n\t\t<</langbutton>>\n\t' }
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
      { srcmatch: /(?:<<NPC_CN_NAME \$NPCName\[_npcId\]\.nam>>——<span style="text-transform: capitalize;"><<print[\s\S]*?>><\/span>|\$NPCName\[_npcId\]\.nam the <span style="text-transform: capitalize;">\$NPCName\[_npcId\]\.title<\/span>)/, to: '<<= maplebirch.autoTranslate($NPCName[_npcId].nam) + (maplebirch.Language is "CN" ? "——" : " the ")>><span style="text-transform: capitalize;"><<= maplebirch.autoTranslate($NPCName[_npcId].title)>></span>' },
      { srcmatchgroup: /<<if _npcList\[\$NPCName\[_npcId\]\.nam(?:\.replace\([^)]+\))*\] is undefined>>/g, to: '<<if _npcList[maplebirch.lang.t($NPCName[_npcId].nam)] is undefined>>' },
      { src: '\t\t\t</span>\n\t\t</div>\n\t\t<div class="settingsToggleItem">\n\t\t\t<span class="gold">', applybefore: '\t\t\t<<if $debug is 1>>| <label><<radiobutton "$NPCName[_npcId].pronoun" "n" autocheck>><<= maplebirch.lang.t("hermaphrodite")+"/"+maplebirch.lang.t("asexual")>></label><</if>>\n' },
    ],
    Widgets: [
      { src: 'T.getStatConfig = function(stat) {', applybefore: 'maplebirch.npc.applyStatDefaults(statDefaults);\n\t\t\t' },
      { srcmatchgroup: /\t_npcData.nam|\t<<NPC_CN_NAME _npcData.nam>>/g, to: '\t<<= maplebirch.autoTranslate(_npcData.nam)>>' },
      { srcmatchgroup: /(?:<<print\s*_npcData\.title(?:\.replace\([^)]+\))+>>|The _npcData\.title)/g, to: '<<= (maplebirch.Language is "CN" ? "" : "The ") + maplebirch.autoTranslate(_npcData.title)>>' },
    ],
    Traits: [
      { src: '<div id="traitListsSearch">', applybefore: '<<run maplebirch.tool.other.initTraits(_traitLists)>>\n\t' }
    ],
    'Widgets Journal': [
      { src: '<br>\n<</widget>>', applybefore: '<br><hr>\n\t<<maplebirchJournal>>\n' }
    ]
  };

  maplebirch.once(':framework-init', (data) => {
    Object.assign(data, {
      specialWidget,
      default: defaultData,
      locationPassage,
      widgetPassage
    });
  });
})();