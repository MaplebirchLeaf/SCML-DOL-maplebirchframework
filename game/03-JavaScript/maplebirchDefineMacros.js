(() => {
  'use strict';

  if (!window.maplebirch) return;
  const maplebirch = window.maplebirch;
  const widget = maplebirch.tool.widget;
  const text = maplebirch.tool.text;
  widget._getMacro(Macro);
  text._getWikifier(Wikifier);
  maplebirch.SugarCube = { Macro, Wikifier, Engine, Story, Config, State, Util };
  maplebirch.trigger(':definewidget');

  maplebirch.once(':storyready', () => {
    setup.maplebirch.content.push(`
    <div id="ConsoleCheat">
      <details class="cheat-section" open>
        <summary class="cheat-section"><span class='gold'><<lanSwitch 'Cheating Collection' '作弊集'>></span></summary>
        <div class='searchButtons'>
          <div class='input-row'>
            <span class="gold"><<lanSwitch 'NAME' '命名'>></span>
            <<textbox '_maplebirchModCheatNamebox' ''>>
            <span class="gold"><<lanSwitch 'CODE' '编码'>></span>
            <<textbox '_maplebirchModCheatCodebox' ''>>
            <<langbutton 'create' 'capitalize'>><<run maplebirch.tool?.cheat.createFromForm()>><</langbutton>>
          </div>
        </div>
        <div class='searchButtons'>
          <div class='input-row'>
            <<textbox '_maplebirchCheatSearch' ''>>
            <<langbutton 'search' 'capitalize'>><<run maplebirch.tool?.cheat.searchAndDisplay()>><</langbutton>>
            <<langbutton 'all' 'capitalize'>><<run maplebirch.tool?.cheat.displayAll()>><</langbutton>>
            <<langbutton 'clear' 'capitalize'>><<run maplebirch.tool?.cheat.updateContainer('maplebirch-cheat-container', maplebirch.tool?.cheat.clearAll())>><</langbutton>>
          </div>
        </div>
        <div id="maplebirch-cheat-container" class='settingsGrid'><<= maplebirch.tool?.cheat.HTML()>></div>
      </details>
    </div>`);
  })  
})();