(() => {
  'use strict';

  const widget = maplebirch.tool.widget;
  const text = maplebirch.tool.text;
  widget._getMacro(Macro);
  text._getWikifier(Wikifier);
  maplebirch.SugarCube = { Macro, Wikifier, Engine, Story, Config, State, Util, Scripting, Save };
  maplebirch.trigger(':defineSugarcube');
})();