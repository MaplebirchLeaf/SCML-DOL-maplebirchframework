// maplebirch.d.ts
declare global {
  interface Window {
    maplebirch: any;
    jsyaml: any;
    modSC2DataManager: any;
    modUtils: any;
    addonBeautySelectorAddon: any;
    addonTweeReplacer: any;
    addonReplacePatcher: any;
    DateTime: new (year: number, month: number, day: number, hour: number, minute: number, second: number) => any;
    getFormattedDate: any;
    getShortFormattedDate: any;
  }
  
  const SugarCube: {
    Macro: {
      add(name: string, definition: any): void;
      delete(name: string): void;
      get(name: string): any;
      has(name: string): boolean;
      [key: string]: any;
    };
    Wikifier: new (...args: any[]) => any;
    Engine: {
      go(): any;
      show(): void;
      play(title: string, noHistory: boolean): void;
    };
    Save: {
      autosave: any;
      onSave: any;
      onLoad: any;
    };
    setup: any;
    State: any;
    Story: {
      title: string;
      get(title: string): any;
      has(title: string): boolean;
    }
    Config: any;
  };
  
  const setup: any;
  const Macro: {
    add(name: string, definition: any): void;
    delete(name: string): void;
    get(name: string): any;
    has(name: string): boolean;
    [key: string]: any;
  };
  const Engine: {
    States: object;
    go(): any;
    show(): void;
    play(title: string, noHistory: boolean): void;
  };
  const Story: {
    title: string;
    get(title: string): any;
    has(title: string): boolean;
  }
  const State: {
    variables: any;
    temporary: any;
    active: any;
    passage: any;
    title: string;
    [key: string]: any;
  };
  const Config: any;
  const Wikifier: new (destination:any, source:string, options:Object|undefined, passageObj:Object|undefined, passageTitle:string|undefined) => any;
  const V: any;
  const T: any;
  const Time: {
    date: {
      year: number;
      month: number;
      day: number;
      hour: number;
      minute: number;
      second: number;
    }
    monthNames: any;
    moonPhases: Array;
    daysOfWeek: Array;
    pass: any;
  };
  const Weather: any;
  const Dynamic: any;
  const TimeConstants: any;
  
  const $: JQueryStatic;
  
  interface JQueryStatic {
    (selector: string, context?: Element | JQuery): JQuery;
    (element: Element): JQuery;
    (object: any): JQuery;
    (func: Function): JQuery;
    (array: any[]): JQuery;
    (): JQuery;
    ajax?: any;
    get?: any;
    post?: any;
  }
  
  interface JQuery {
    html(): string;
    html(htmlString: string): this;
    text(): string;
    text(textString: string): this;
    val(): any;
    val(value: any): this;
    
    addClass(className: string): this;
    removeClass(className?: string): this;
    
    css(propertyName: string): string;
    css(propertyName: string, value: string|number): this;
    
    on(event: string, handler: Function): this;
    off(event: string, handler?: Function): this;
    click(handler: Function): this;
    
    [key: string]: any;
  }
  
  class DateTime {
    constructor(year: number, month: number, day: number, hour: number, minute: number, second: number): any;
    addDays: any;
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
  } 

  function ordinalSuffixOf(i:number): number;
  function wikifier(widget, ...args): any;
}

export {};