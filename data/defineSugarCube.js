(() => {
  'use strict';

  const widget = maplebirch.tool.widget;
  const text = maplebirch.tool.text;
  widget._getMacro(Macro);
  text._getWikifier(Wikifier);
  maplebirch.SugarCube = { Macro, Wikifier, Engine, Story, Config, State, Util, Scripting, Save };
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
          <div class='input-row'><<textbox '_maplebirchCheatSearch' ''>>
            <<lanButton 'search' 'capitalize'>><<run maplebirch.tool?.cheat.searchAndDisplay()>><</lanButton>>
            <<lanButton 'all' 'capitalize'>><<run maplebirch.tool?.cheat.displayAll()>><</lanButton>>
            <<lanButton 'clear' 'capitalize'>><<run maplebirch.tool?.cheat.updateContainer('maplebirch-cheat-container', maplebirch.tool?.cheat.clearAll())>><</lanButton>>
          </div>
        </div>
        <div id='maplebirch-cheat-container' class='settingsGrid'><<= maplebirch.tool?.cheat.HTML()>></div>
      </details>
    </div>
    <<maplebirch-playback 'maplebirch-playback'>>
    `);
  });
})();
