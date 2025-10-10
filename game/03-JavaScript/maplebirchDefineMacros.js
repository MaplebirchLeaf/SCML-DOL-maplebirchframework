(() => {
  'use strict';

  if (!window.maplebirch) return;
  const maplebirch = window.maplebirch;
  const widget = maplebirch.tool.widget;
  const text = maplebirch.tool.text;
  widget._getMacro(Macro);
  text._getWikifier(Wikifier);
  maplebirch.trigger(':definewidget');

  DefineMacroS('lanSwitch', window.lanSwitch);
})();