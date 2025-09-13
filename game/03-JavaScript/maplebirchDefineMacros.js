(() => {
  'use strict';

  const maplebirch = window.maplebirch;
  const widget = maplebirch.tool.widget;
  widget._getMacro(Macro);
  maplebirch.trigger(':definewidget');
})();