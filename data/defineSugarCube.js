(() => {
  'use strict';

  if (!window.maplebirch) return;
  const maplebirch = window.maplebirch;
  const widget = maplebirch.tool.widget;
  const text = maplebirch.tool.text;
  widget._getMacro(Macro);
  text._getWikifier(Wikifier);
  maplebirch.SugarCube = { Macro, Wikifier, Engine, Story, Config, State, Util, Scripting };
  maplebirch.trigger(':defineSugarcube');

  maplebirch.once(':storyready', () => {
    setup.maplebirch.content.push(`
    <div id='ConsoleCheat'>
      <details class='cheat-section' open>
        <summary class='cheat-section'><span class='gold'><<lanSwitch 'Cheating Collection' '作弊集'>></span></summary>
        <div class='searchButtons'>
          <div class='input-row'>
            <span class='gold'><<lanSwitch 'NAME' '命名'>></span>
            <<textbox '_maplebirchModCheatNamebox' ''>>
            <span class='gold'><<lanSwitch 'CODE' '编码'>></span>
            <<textbox '_maplebirchModCheatCodebox' ''>>
            <<lanButton 'create' 'capitalize'>><<run maplebirch.tool?.cheat.createFromForm()>><</lanButton>>
          </div>
        </div>
        <div class='searchButtons'>
          <div class='input-row'>
            <<textbox '_maplebirchCheatSearch' ''>>
            <<lanButton 'search' 'capitalize'>><<run maplebirch.tool?.cheat.searchAndDisplay()>><</lanButton>>
            <<lanButton 'all' 'capitalize'>><<run maplebirch.tool?.cheat.displayAll()>><</lanButton>>
            <<lanButton 'clear' 'capitalize'>><<run maplebirch.tool?.cheat.updateContainer('maplebirch-cheat-container', maplebirch.tool?.cheat.clearAll())>><</lanButton>>
          </div>
        </div>
        <div id='maplebirch-cheat-container' class='settingsGrid'><<= maplebirch.tool?.cheat.HTML()>></div>
      </details>
    </div>`);
  });

  function isPossibleLoveInterest(name) {
    return {
      Robin: V.robinromance === 1,
      Whitney: V.whitneyromance === 1 && C.npc.Whitney.state !== 'dungeon',
      Kylar: V.kylarenglish >= 1 && C.npc.Kylar.state !== 'prison',
      Sydney: V.sydneyromance === 1,
      Eden: V.syndromeeden === 1,
      Avery: V.auriga_artefact && C.npc.Avery.state !== 'dismissed',
      'Black Wolf': V.syndromewolves === 1 && hasSexStat('deviancy', 3),
      'Great Hawk': V.syndromebird === 1,
      Alex: V.farm_stage >= 7 && V.alex_countdown === undefined,
      Gwylan: V.gwylanSeen?.includes('partners') || V.gwylanSeen?.includes('romance')
    }[name] ?? false;
  }

  window.isPossibleLoveInterest = isPossibleLoveInterest;
})();