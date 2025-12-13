// maplebirch.d.ts
declare global {
  interface Window {
    maplebirch: MaplebirchCore;
    jsyaml: typeof yaml;
    StartConfig: {
      debug: boolean,
      enableImages: boolean,
      enableLinkNumberify: boolean,
      version: string,
      versionName: string,
      sneaky: boolean,
      socialMediaEnabled: boolean,
      sourceLinkEnabled: boolean,
    };
    modSC2DataManager: any;
    modUtils: any;
    addonBeautySelectorAddon: any;
    addonTweeReplacer: any;
    addonReplacePatcher: any;
    DateTime: typeof DateTime;
    getFormattedDate: any;
    getShortFormattedDate: any;
    lanSwitch(text: any): string;
    lanSwitch(english: string, chinese: string, ...args: any[]): string;
    lanSwitch(options: { EN: string; CN: string; [key: string]: string }): string;
    between: typeof between;
  }

  interface SugarCube {
    Macro: {
      add(name: string, definition: any): void;
      delete(name: string): void;
      get(name: string): any;
      has(name: string): boolean;
      [key: string]: any;
    };
    Wikifier: typeof Wikifier;
    Engine: {
      go(): any;
      show(): void;
      play(title: string, noHistory?: boolean): void;
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
    Scripting: {
      evalJavaScript(code, output, data): any;
      evalTwineScript(code, output, data): any;
      parse(rawCodeString): any;
    }
  };

  interface Math {
    clamp(value: number, min: number, max: number): number;
  }

  declare class Wikifier {
    constructor(
      destination: HTMLElement | DocumentFragment | JQuery | null,
      source: string,
      options?: object,
      passageObj?: { title: string },
      passageTitle?: string
    );

    source: string;
    options: object;
    output: HTMLElement | DocumentFragment | null;

    static Option: {
      readonly length: number;
      readonly options: object;
      clear(): void;
      get(index: number): object | undefined;
      pop(): object | undefined;
      push(options: object): number;
    };

    static Parser: {
      parsers: Array<{ name: string; match: string; handler: Function }>;
      add(parser: { name: string; match: string; handler: Function }): void;
      delete(name: string): void;
      has(name: string): boolean;
      get(name: string): { name: string; match: string; handler: Function } | null;
      Profile: {
        compile(): { all: any; core: any };
        isEmpty(): boolean;
        has(profile: string): boolean;
        get(profile: string): any;
      };
    };

    static helpers: {
      inlineCss: Function;
      evalText: (text: string) => string | number;
      evalPassageId: (passage: string) => string;
      hasBlockContext: (nodes: Node[]) => boolean;
      createShadowSetterCallback: (code: string) => () => any;
      parseSquareBracketedMarkup: (w: any) => any;
    };

    static stopWikify: boolean;
    static wikifyEval(text: string, passageObj?: { title: string }, passageTitle?: string): DocumentFragment;
    static createInternalLink(destination: any, passage: string | null, text: string, callback?: Function): HTMLElement;
    static createExternalLink(destination: any, url: string | null, text: string): HTMLElement;
    static isExternalLink(link: string): boolean;
    static getPassageTitleLast(): string;
    static getPassageObjLast(): { title: string } | undefined;
  }

  class MaplebirchCore {
    meta: {
      state: number;
      coreModules: string[];
      initializedAt: string;
    };
    modList: string[];
    logger: Logger;
    lang: LanguageManager;
    events: EventEmitter;
    modules: ModuleManager;
    modLoader: any;
    modUtils: any;
    SugarCube: SugarCube;
    addonPlugin: any;
    onLoad: boolean;
    state: TimeStateManager;
    audio: AudioManager;
    tool: tools;
    var: variablesModule;
    npc: NPCManager;
    shop: ShopManager;

    constructor();

    log(msg: string, level?: string, ...objs: any[]): void;
    on(evt: string, handler: Function, desc?: string): boolean;
    off(evt: string, identifier: string | Function): boolean;
    once(evt: string, handler: Function, desc?: string): boolean;
    trigger(evt: string, ...args: any[]): void;
    register(name: string, module: any, dependencies?: string[]): Promise<boolean>;

    preInit(): Promise<void>;
    init(): Promise<void>;
    loadInit(): Promise<void>;
    postInit(): Promise<void>;

    t(key: string, space?: boolean): string;
    autoTranslate(text: string): string;


    set Language(lang: string): string;
    set LogLevel(level: string): string;
    set ExModCount(count: number): number;

    getModule(name: string): any;
    get Language(): 'CN'|'EN';
    get LogLevel(): string;
    get expectedModuleCount(): number;
    get registeredModuleCount(): number;
    get dependencyGraph(): any;
    get yaml(): typeof yaml;
    get modLoader(): any;
    get modUtils(): any;
    get gameVersion(): string;

    static Manager: {
      Logger: typeof Logger;
      LanguageManager: typeof LanguageManager;
      EventEmitter: typeof EventEmitter;
      ModuleManager: typeof ModuleManager;
    };

    static constants: {
      ModuleState: typeof ModuleState;
      LogLevel: any;
    };

    static meta: {
      version: string;
      name: string;
      author: string;
      modifiedby: string;
      UpdateDate: string;
      availableLanguages: string[];
    };
  }

  class Logger {
    constructor(core: MaplebirchCore);

    log(message: string, levelName?: string | number, ...objects: any[]): void;

    set LevelName(levelName: string);
    get LevelName(): string;

    static LogConfig: any;
    static LogLevel: any;
  }

  class LanguageManager {
    constructor(core: MaplebirchCore);
    translations: Map<string, string>;

    setLanguage(lang: string): void;
    initDatabase(): Promise<void>;
    importAllLanguages(modName: string, languages?: string[]): Promise<boolean>;
    loadTranslations(modName: string, languageCode: string, filePath: string): Promise<boolean>;
    t(key: string, space?: boolean): string;
    autoTranslate(sourceText: string): string;
    preloadAllTranslations(): Promise<void>;
    clearDatabase(): Promise<void>;
    cleanOldVersions(): Promise<void>;

    get language(): string;

    static DEFAULT_LANGS: string[];
    static DEFAULT_IMPORT_CONCURRENCY: number;
    static DEFAULT_BATCH_SIZE: number;
    static DEFAULT_PRELOAD_YIELD: number;
  }

  class EventEmitter {
    constructor(core: MaplebirchCore);

    on(eventName: string, callback: Function, description?: string): boolean;
    off(eventName: string, identifier: Function | string): boolean;
    once(eventName: string, callback: Function, description?: string): boolean;
    trigger(eventName: string, ...args: any[]): void;

    static streamConfig: {
      batchSize: number;
      yieldInterval: number;
    };
  }

  class ModuleManager {
    constructor(core: MaplebirchCore);
    initPhase: {
      preInitCompleted: boolean;
      mainInitCompleted: boolean;
      loadInitExecuted: boolean;
      postInitExecuted: boolean;
      expectedModuleCount: number;
      registeredModuleCount: number;
      allModuleRegisteredTriggered: boolean;
    };

    register(name: string, module: any, dependencies?: string[]): Promise<boolean>;
    setExpectedModuleCount(count: number): void;
    getDependencyGraph(): any;
    preInit(): Promise<void>;
    init(): Promise<void>;
    loadInit(): Promise<void>;
    postInit(): Promise<void>;

    static streamConfig: {
      batchSize: number;
      yieldInterval: number;
    };
  }

  class TimeStateManager {
    logger: Logger;
    log: (message: string, level?: string, ...objects: any[]) => void;
    TimeManager: TimeManager;
    StateManager: StateManager;
    passage: any;
    savedata: any;
    solarEclipse: any;

    constructor();

    receiveVariables(variables: { saveId?: number | string }): void;
    get Passage(): any;
    get modifyWeather(): any;
    regTimeEvent(type: string, eventId: string, options: any): void;
    delTimeEvent(type: string, eventId: string): void;
    timeTravel(options?: any): void;
    get TimeEvents(): any;
    regStateEvent(type: string, eventId: string, options: any): void;
    delStateEvent(type: string, eventId: string): void;
    get StateEvents(): any;
    preInit(): Promise<void>;
    Init(): void;

    #shouldCollectPassage(passage: any): boolean;
  }

  class StateEvent {
    id: string;
    type: string;
    output: string;
    action: Function;
    cond: Function;
    priority: number;
    once: boolean;
    forceExit: boolean;
    extra: any;

    constructor(id: string, type: string, options?: any);

    tryRun(): [boolean, boolean, boolean] | null;
    #checkPassage(passageName: string): boolean;
    #check(): boolean;
  }

  class StateManager {
    static StateEvent: typeof StateEvent;

    manager: TimeStateManager;
    log: (message: string, level?: string, ...objects: any[]) => void;
    eventTypes: string[];
    stateEvents: { [key: string]: Map<string, StateEvent> };

    constructor(manager: TimeStateManager);

    trigger(type: string): string;
    #processInterruptEvents(passageName: string): string;
    #processOverlayEvents(passageName: string): string;
    register(type: string, eventId: string, options: any): boolean;
    unregister(type: string, eventId: string): boolean;
    _makeMacroHandler(): Function;
    initialize(): void;
  }

  class TimeEvent {
    id: string;
    type: string;
    action: Function;
    cond: Function;
    priority: number;
    once: boolean;
    accumulate: any;
    exact: boolean;
    accumulator: number;
    target: number;

    constructor(id: string, type: string, options?: any);

    tryRun(enhancedTimeData: any): boolean;
    #handleExactEvent(timeData: any): boolean;
    #handleAccumulateEvent(timeData: any): boolean;
    #handleRegularEvent(timeData: any): boolean;
    #executeEvent(timeData: any): boolean;
    #isExactPointCrossed(prevDate: any, currentDate: any): boolean;
  }

  class TimeManager {
    static TimeEvent: typeof TimeEvent;
    static moonPhases: any;
    static monthNames: any;
    static daysOfWeek: any;

    log: (message: string, level?: string, ...objects: any[]) => void;
    eventTypes: string[];
    timeEvents: { [key: string]: Map<string, TimeEvent> };
    prevDate: any;
    currentDate: any;
    originalTimePass: Function;
    cumulativeTime: any;
    lastReportedCumulative: any;

    constructor(manager: TimeStateManager);

    #trigger(type: string, timeData: any): void;
    #updateCumulativeTime(passedSeconds: number): void;
    #triggerTimeEventsWithCumulative(timeData: any): void;
    #calculateTimeDifference(prev: any, current: any, passedSec: number): any;
    register(type: string, eventId: string, options: any): boolean;
    unregister(type: string, eventId: string): boolean;
    #handleTimePass(passedSeconds: number): string;
    timeTravel(options?: any): boolean;
    #updateDateTime(): void;
    updateTimeLanguage(choice?: string | boolean): string | boolean | void;
    initialize(): void;
  }

  declare class DateTime {
    constructor(
      year?: number,
      month?: number,
      day?: number,
      hour?: number,
      minute?: number,
      second?: number
    );

    constructor(timestamp: number);

    constructor(dateTime: DateTime);

    readonly year: number;
    readonly month: number;
    readonly day: number;
    readonly hour: number;
    readonly minute: number;
    readonly second: number;
    readonly timeStamp: number;
    readonly weekDay: number;
    readonly weekDayName: string;
    readonly monthName: string;
    readonly weekEnd: boolean;
    readonly lastDayOfMonth: number;
    readonly yearDay: number;
    readonly moonPhaseFraction: number;
    readonly fractionOfDay: number;
    readonly fractionOfDayFromNoon: number;
    readonly simplifiedDayFactor: number;
    readonly fractionOfYear: number;
    readonly seasonFactor: number;
    compareWith(otherDateTime: DateTime,getSeconds?: boolean): {
      years: number;
      months: number;
      days: number;
      hours: number;
      minutes: number;
      seconds: number;
    }|number;
    dayDifference(otherDateTime: DateTime): number;
    getFirstWeekdayOfMonth(weekDay: number): DateTime;
    getNextWeekdayDate(weekDay: number): DateTime;
    getPreviousWeekdayDate(weekDay: number): DateTime;
    addYears(years: number): DateTime;
    addMonths(months: number): DateTime;
    addDays(days: number): DateTime;
    addHours(hours: number): DateTime;
    addMinutes(minutes: number): DateTime;
    addSeconds(seconds: number): DateTime;
    isLastDayOfMonth(): boolean;
    isFirstDayOfMonth(): boolean;
    between(startDate: DateTime, endDate: DateTime): boolean;
  }

  function getFormattedDate(date: any, includeWeekday?: boolean): string;
  function getShortFormattedDate(date: any): string;
  function ordinalSuffixOf(i: number): string;

  class AudioManager {
    static ModAudioPlayer: typeof ModAudioPlayer;

    log: (message: string, level?: string, ...objects: any[]) => void;
    audioContext: AudioContext | null;
    idbManager: AudioIDBManager;
    modPlayers: Map<string, ModAudioPlayer>;
    allAudioKeysCache: string[];
    volume: number;

    constructor();

    initAudioContext(): void;
    decodeAudioData(arrayBuffer: ArrayBuffer): Promise<AudioBuffer>;
    loadAudio(key: string, arrayBuffer: ArrayBuffer, modName?: string): Promise<boolean>;
    importAllAudio(modName: string, audioFolder?: string): Promise<boolean>;
    addAudioFromFile(file: File, modName?: string): Promise<boolean>;
    getPlayer(modName: string): ModAudioPlayer;
    getModAudioKeys(modName: string): Promise<string[]>;
    getAllAudioKeys(): Promise<string[]>;
    refreshCache(modName?: string): Promise<void>;
    refreshAllCache(): Promise<void>;

    set Volume(volume: number);
    get Volume(): number;
    get allAudioKeys(): string[];

    preInit(): Promise<void>;
  }

  class AudioIDBManager {
    constructor(core: MaplebirchCore);

    init(): Promise<void>;
    store(key: string, arrayBuffer: ArrayBuffer, modName: string): Promise<boolean>;
    get(key: string): Promise<ArrayBuffer | null>;
    getModKeys(modName: string): Promise<string[]>;
  }

  class ModAudioPlayer {
    audioManager: AudioManager;
    modName: string;
    activeSources: Map<string, any>;
    pausedStates: Map<string, any>;
    volume: number;
    globalGainNode: GainNode | null;
    loopCounters: Map<string, number>;
    defaultLoopCount: number;
    bufferCache: Map<string, AudioBuffer>;
    audioKeysCache: string[];

    constructor(audioManager: AudioManager, modName: string);

    initGainNode(): void;
    getAudioBuffer(key: string): Promise<AudioBuffer>;
    play(key: string, options?: AudioPlayOptions): Promise<any | null>;
    stop(key: string): void;
    stopAll(): void;
    set Volume(volume: number);
    setVolumeFor(key: string, volume: number): void;
    togglePause(key: string): Promise<{ status: string; offset?: number; audioSource?: any }>;
    isPlaying(): string[];
    get audioKeys(): string[];
    getDuration(key: string): number;
    setLoopCount(key: string, count: number): void;
    refreshCache(): Promise<void>;
    refreshAudioKeys(): Promise<void>;
  }

  interface AudioPlayOptions {
    allowOverlap?: boolean;
    stopOthers?: boolean;
    volume?: number;
    offset?: number;
    duration?: number;
    loop?: boolean;
    loopCount?: number;
    loopStart?: number;
    loopEnd?: number;
    onEnded?: Function;
  }

  class tools {
    migration: typeof migration;
    rand: typeof randSystem;
    widget: defineWidget;
    text: htmlTools;
    framework: frameworks;
    linkzone: typeof applyLinkZone;
    other: others;

    modhint: modhint;
    console: consoleTools;
    cheat: cheat;

    clone: typeof clone;
    merge: typeof merge;
    equal: typeof equal;
    contains: typeof contains;
    SelectCase: typeof SelectCase;
    random: typeof random;
    either: typeof either;
    loadImage: typeof loadImageWithModLoader;
    convert: typeof convert;

    constructor();

    createLog(prefix: string): (message: string, level?: string, ...objects: any[]) => void;
    preInit(): Promise<void>;
    Init(): void;
    postInit(): void;
  }

  class migration {
    static create(): migration;
    static logger: (message: string, level?: string, ...objects: any[]) => void;
    static init(createLog: (logname: string) => (message: string, level?: string, ...objects: any[]) => void): void;
    constructor();
    log: (message: string, level?: string, ...objects: any[]) => void;
    migrations: Array<{ fromVersion: string; toVersion: string; migrationFn: (data: any, utils: MigrationUtils) => void }>;
    utils: MigrationUtils;
    add(fromVersion: string, toVersion: string, migrationFn: (data: any, utils: MigrationUtils) => void): void;
    run(data: any, targetVersion: string): void;
    #compareVersions(a: string, b: string): number;
  }

  interface MigrationUtils {
    resolvePath(obj: any, path: string, createIfMissing?: boolean): { parent: any; key: string } | null;
    rename: (data: any, oldPath: string, newPath: string) => boolean;
    move: (data: any, oldPath: string, newPath: string) => boolean;
    remove: (data: any, path: string) => boolean;
    transform: (data: any, path: string, transformer: (value: any) => any) => boolean;
    fill: (target: any, defaults: any, options?: { arrayBehaviour?: string }) => void;
  }

  declare class randSystem {
    static logger: (message: string, level?: string, ...objects: any[]) => void;
    static init(createLog: (logname: string) => (message: string, level?: string, ...objects: any[]) => void): void;
    constructor();
    log: (message: string, level?: string, ...objects: any[]) => void;
    state: {
      seed: number | null;
      history: number[];
      pointer: number;
    };
    Seed: number | null;
    get(max: number): number;
    readonly rng: number;
    readonly history: number[];
    readonly pointer: number;
    backtrack(steps?: number): void;
  }

  class defineWidget {
    constructor(logger: (message: string, level?: string, ...objects: any[]) => void);

    _getMacro(data: any): boolean;
    defineMacro(macroName: string, macroFunction: Function, tags?: any[], skipArgs?: boolean, isAsync?: boolean): void;
    defineMacroS(macroName: string, macroFunction: Function, tags?: any, skipArgs?: boolean, maintainContext?: boolean): void;
    statChange(statType: string, amount: number, colorClass: string, condition?: () => boolean): DocumentFragment;
    create(name: string, fn: Function): void;
    callStatFunction(name: string, ...args: any[]): DocumentFragment;
  }

  class htmlTools {
    constructor(logger: (message: string, level?: string, ...objects: any[]) => void);

    _getWikifier(wikifier: any): boolean;
    reg(key: string, handler: Function, id?: string): string | false;
    unreg(key: string, idOrHandler?: string | Function): boolean;
    clear(): void;
    renderFragment(keys: string | string[], context?: any): DocumentFragment;
    renderToMacroOutput(macro: any, keys: string | string[]): void;
    makeMacroHandler(options?: { allowCSV?: boolean }): Function;
  }

  class frameworks {
    constructor(logger: (message: string, level?: string, ...objects: any[]) => void);

    data: FrameworkData;
    initFunction: any[];
    specialWidget: any[];
    default: any;
    widgethtml: string;
    patchedPassage: Set<string>;
    locationPassage: any;
    widgetPassage: any;

    onInit(...widgets: any[]): void;
    addTo(zone: string, ...widgets: any[]): void;
    storyInit(): void;
    play(zone: string, passageTitle?: string): string;
    patchPassage(passage: any, title: string): Promise<any>;
    widgetInit(passageData: any): Promise<any>;
    afterPatchModToGame(): Promise<void>;
  }

  interface FrameworkData {
    Init: any[];
    DataInit: any[];
    Header: any[];
    Footer: any[];
    Information: any[];
    Options: any[];
    Cheats: any[];
    Statistics: any[];
    Journal: any[];
    BeforeLinkZone: any[];
    AfterLinkZone: any[];
    CustomLinkZone: any[];
    CaptionDescription: any[];
    StatusBar: any[];
    MenuBig: any[];
    MenuSmall: any[];
    CaptionAfterDescription: any[];
    HintMobile: any[];
    StatsMobile: any[];
    CharaDescription: any[];
    DegreesBonusDisplay: any[];
    DegreesBox: any[];
    SkillsBonusDisplay: any[];
    SkillsBox: any[];
    SubjectBoxBonusDisplay: any[];
    SchoolSubjectsBox: any[];
    SchoolMarksText: any[];
    WeaponBox: any[];
    ReputationModify: any[];
    Reputation: any[];
    FameModify: any[];
    Fame: any[];
    StatusSocial: any[];
    NPCinit: any[];
    NPCspawn: any[];
  }

  declare const applyLinkZone: typeof LinkZoneManager & {
    apply(userConfig?: Partial<LinkZoneConfig>): boolean;
    add(config: LinkZoneConfig): void;
    removeZones(): void;
    readonly defaultConfig: LinkZoneConfig;
  };

  class LinkZoneManager {
    constructor(containerId?: string, linkSelector?: string, logger?: (message: string, level?: string, ...objects: any[]) => void);

    detectLinks(): LinkDetectionResult | null;
    applyZones(config: LinkZoneConfig): boolean;

    #resetState(): void;
    #detectLineBreakBeforeFirstLink(): void;
    #isLineBreakNode(node: Node): boolean;
    #isElementVisible(element: Element): boolean;
    #createZoneElement(id: string | null, config: LinkZoneConfig): HTMLDivElement;
    #applyCustomLinkZone(position: number, config: LinkZoneConfig): HTMLDivElement | null;
    #applyBeforeLinkZone(config: LinkZoneConfig): void;
    #applyAfterLinkZone(config: LinkZoneConfig): void;
  }

  interface LinkDetectionResult {
    firstLink: Element;
    lastLink: Element;
    totalLinks: number;
    lineBreakBeforeFirstLink: Node | null;
  }

  interface LinkZoneConfig {
    containerId?: string;
    linkSelector?: string;
    beforeMacro?: string | (() => string);
    afterMacro?: string | (() => string);
    customMacro?: string | (() => Array<{ position: number; macro: string }>);
    zoneStyle?: Partial<CSSStyleDeclaration> | Record<string, string>;
    onBeforeApply?: () => void;
    onAfterApply?: (result: boolean, config: LinkZoneConfig) => void;
    debug?: boolean;
  }

  class others {
    constructor(logger: (message: string, level?: string, ...objects: any[]) => void);

    static traitCategories: { [key: string]: string };
    static getTraitCategory(englishName: string): string;

    traitsTitle: string[];
    traitsData: any[];
    locationUpdates: any;

    addTraits(...data: any[]): void;
    initTraits(data: any): boolean;
    configureLocation(locationId: string, config: any, options?: { overwrite?: boolean; layer?: string; element?: string }): boolean;
    applyLocation(): boolean;
    addBodywriting(key: string, config: any): void;
    delBodywriting(key: string): void;
    applyBodywriting(): boolean;
  }

  class modhint {
    constructor(logger: (message: string, level?: string, ...objects: any[]) => void);

    hintClicked(): void;
    searchButtonClicked(): void;
    clearButtonClicked(): void;
  }

  class consoleTools {
    constructor(logger: (message: string, level?: string, ...objects: any[]) => void, allowedObjects?: string[]);

    enableFullAccess(): boolean;
    disableFullAccess(): boolean;
    allowObject(objectName: string): boolean;
    disallowObject(objectName: string): boolean;
    setAllowedObjects(objects: string[]): boolean;
    execute(type: 'javascript' | 'twine'): { success: boolean; error?: string; message?: string; result?: any };
  }

  declare class cheat {
    constructor();
    initDB(): Promise<void>;
    refreshCache(): Promise<void>;

    add(name: string, code: string): Promise<boolean>;
    remove(name: string): Promise<boolean>;
    execute(name: string): Promise<boolean>;

    search(term: string): CheatEntry[];
    searchAndDisplay(): void;
    displayAll(): Promise<void>;
    createFromForm(): Promise<void>;

    clearAll(confirm?: boolean): string | void;
    clearAllAsync(): Promise<void>;

    deleteConfirm(name: string): string;
    cancelDelete(name: string): void;

    updateContainer(containerId: string, content: string): void;
    HTML(cheats?: CheatEntry[]): string;
  }

  interface CheatEntry {
    name: string;
    code: string;
    type: 'javascript' | 'twine';
  }

  class variablesModule {
    check(): void;
    version: string;
    tool: tools;
    log: (message: string, level?: string, ...objects: any[]) => void;
    migration: migration;
    preInit(): void;
    Init(): void;
    loadInit(): void;
    postInit(): void;
    #mapProcessing(): void;
  }

  declare class NPCManager {
    lang: LanguageManager;
    tool: tools;
    log: (message: string, level?: string, ...objects: any[]) => void;
    data: Map<string, { Data: NamedNPC; Config: NPCConfig }>;
    NamedNPC: typeof NamedNPC;
    Schedules: typeof NPCSchedules;
    pregnancy: {
      infertile: string[];
      typesEnabled: string[];
      canBePregnant: string[];
    };
    type: {
      loveInterestNpcs: string[];
      importantNPCs: string[];
      specialNPCs: string[];
    };
    NPCNameList: string[];
    customStats: Record<string, NPCStatConfig>;
    Sidebar: NPCSidebar;
    Clothes: typeof NPCClothes;
    Schedules: typeof NPCSchedules;

    constructor(manager: any);
    add(npcData: NPCData, config?: NPCConfig, translationsData?: Record<string, any>): boolean;
    addStats(statsObject: Record<string, NPCStatConfig>): void;
    addClothes(...configs: NPCClothesConfig[]): void;
    injectModNPCs(): void;
    vanillaNPCConfig(npcConfig: Record<string, any>): Record<string, any>;
    applyStatDefaults(statDefaults: Record<string, any>): Record<string, any>;
    _vanillaNPCInit(...args: any[]): void;
    NPCSpawn(...args: any[]): void;
    Init(): void;
    loadInit(): void;
    postInit(): void;
    
    // 新增日程管理方法
    addSchedule(npcName: string, scheduleConfig: ScheduleConfig, location: string | ((date: EnhancedDate) => string), options?: ScheduleOptions): Schedule;
    getSchedule(npcName: string): Schedule;
    updateSchedule(npcName: string, specialId: number, updates: Partial<ScheduleSpecial>): Schedule;
    removeSchedule(npcName: string, specialId: number): Schedule;
    checkSchedules(): Record<string, string>;
    clearSchedule(npcName: string): Schedule;
    clearAllSchedules(): void;
  }

  declare class NPCSchedules {
    static schedules: Map<string, Schedule>;
    static init(manager: NPCManager): boolean;
    static add(npcName: string, scheduleConfig: ScheduleConfig, location: string | ((date: EnhancedDate) => string), options?: ScheduleOptions): Schedule;
    static get(npcName: string): Schedule;
    static update(npcName: string, specialId: number, updates: Partial<ScheduleSpecial>): Schedule;
    static remove(npcName: string, specialId: number): Schedule;
    static clear(npcName: string): Schedule;
    static clearAll(): void;
    static npcList: string[];
    static location: Record<string, string>;
  }

  declare class Schedule {
    constructor();
    daily: string[];
    specials: ScheduleSpecial[];
    location: string;
    sortedSpecials: ScheduleSpecial[] | null;
    
    add(
      scheduleConfig: ScheduleConfig, 
      location: string | Schedule | ((date: EnhancedDate) => string | Schedule), 
      options?: ScheduleOptions
    ): Schedule;
    
    set(
      scheduleConfig: ScheduleConfig, 
      location: string | Schedule | ((date: EnhancedDate) => string | Schedule), 
      options?: ScheduleOptions
    ): Schedule;
    
    if(
      condition: (date: EnhancedDate) => boolean, 
      location: string | Schedule | ((date: EnhancedDate) => string | Schedule), 
      options?: ScheduleOptions
    ): Schedule;
    
    update(specialId: number, updates: Partial<ScheduleSpecial>): Schedule;
    remove(specialId: number): Schedule;
    resolveLocation(
      loc: string | Schedule | ((date: EnhancedDate) => string | Schedule), 
      date: EnhancedDate
    ): string;
    createEnhancedDate(date: DateTime): EnhancedDate;
    buildEnhancedDateProto(): EnhancedDateProto;
  }

  interface ScheduleSpecial {
    id: number;
    condition: (date: EnhancedDate) => boolean;
    location: string | Schedule | ((date: EnhancedDate) => string | Schedule);
    priority: number;
  }

  declare interface EnhancedDate extends DateTime {
    readonly schedule: Schedule;
    isAt(time: [number, number] | number): boolean;
    isAfter(time: [number, number] | number): boolean;
    isBefore(time: [number, number] | number): boolean;
    isBetween(startTime: [number, number] | number, endTime: [number, number] | number): boolean;
    isHour(...hours: number[]): boolean;
    isHourBetween(start: number, end: number): boolean;
    isMinuteBetween(start: number, end: number): boolean;
    readonly schoolDay: boolean;
    readonly spring: boolean;
    readonly summer: boolean;
    readonly autumn: boolean;
    readonly winter: boolean;
    readonly dawn: boolean;
    readonly day: boolean;
    readonly dusk: boolean;
    readonly night: boolean;
    readonly weekEnd: boolean;
    
    [key: string]: any;
  }

  declare interface EnhancedDateProto {
    isAt(time: [number, number] | number): boolean;
    isAfter(time: [number, number] | number): boolean;
    isBefore(time: [number, number] | number): boolean;
    isBetween(startTime: [number, number] | number, endTime: [number, number] | number): boolean;
    isHour(...hours: number[]): boolean;
    isHourBetween(start: number, end: number): boolean;
    isMinuteBetween(start: number, end: number): boolean;
    readonly schoolDay: boolean;
    readonly spring: boolean;
    readonly summer: boolean;
    readonly autumn: boolean;
    readonly winter: boolean;
    readonly dawn: boolean;
    readonly day: boolean;
    readonly dusk: boolean;
    readonly night: boolean;
    readonly weekEnd: boolean;
  }

  type ScheduleConfig = 
    | [number, number]  // 时间范围 [开始小时, 结束小时]
    | number            // 具体小时
    | ((date: EnhancedDate) => boolean)  // 条件函数
    | { condition: (date: EnhancedDate) => boolean };

  interface ScheduleOptions {
    id?: string | number;
    priority?: number;
    [key: string]: any;
  }

  interface ScheduleSpecial {
    id: number;
    condition: (date: EnhancedDate) => boolean;
    location: string | ((date: EnhancedDate) => string);
    priority: number;
  }

  declare class NPCClothes {
    static log: (msg: string, level?: string) => void;
    manager: NPCManager;
    clothes: Map<string, NPCClothingItem>;
    outfits: string[];

    constructor(manager?: NPCManager);

    static add(...configs: NPCClothesConfig[]): void;
    static init(manager: { log: (msg: string, level?: string) => void }): void;
    importNPCClothesData(modName: string, filePath: string): Promise<boolean>;
    #processClothesData(data: any): boolean;
  }

  interface NPCClothingItem {
    over_upper?: any;
    over_lower?: any;
    upper?: any;
    lower?: any;
    under_upper?: any;
    under_lower?: any;
    over_head?: any;
    head?: any;
    face?: any;
    neck?: any;
    legs?: any;
    feet?: any;
    genital?: any;
    [key: string]: any;
  }

  interface NPCData {
    nam: string;
    title?: string;
    gender?: 'm' | 'f' | 'h' | 'n' | 't';
    type?: string;
    adult?: number;
    teen?: number;
    insecurity?: string;
    chastity?: { penis: string; vagina: string; anus: string };
    virginity?: Record<string, boolean>;
    eyeColour?: string;
    hairColour?: string;
    pronoun?: string;
    penissize?: number;
    breastsize?: number;
    ballssize?: number;
    bottomsize?: number;
    penisdesc?: string;
    breastdesc?: string;
    outfits?: string[];
    pregnancy?: any;
    skincolour?: number;
    init?: number;
    intro?: number;
    description?: string;
    [key: string]: any;
  }

  interface NPCConfig {
    love?: { maxValue: number };
    loveAlias?: [string, string] | (() => string);
    important?: boolean | (() => boolean);
    special?: boolean | (() => boolean);
    loveInterest?: boolean | (() => boolean);
    [key: string]: any;
  }

  interface NPCStatConfig {
    position?: number | 'first' | 'last' | 'secondLast' | false;
    [key: string]: any;
  }

  interface NPCClothesConfig {
    name: string;
    type?: string;
    gender?: 'm' | 'f' | 'n';
    outfit?: number;
    upper: string | {
      name: string;
      integrity_max?: number;
      word?: 'a' | 'n';
      action?: string;
      desc?: string;
    };
    lower: string | {
      name: string;
      integrity_max?: number;
      word?: 'a' | 'n';
      action?: string;
      desc?: string;
    };
    desc?: string;
  }

  declare class NamedNPC {
    nam: string;
    gender: 'm' | 'f' | 'h' | 'n' | 't';
    title: string;
    description: string;
    type: string;
    adult: number;
    teen: number;
    insecurity: string;
    chastity: { penis: string; vagina: string; anus: string };
    virginity: Record<string, boolean>;
    eyeColour: string;
    hairColour: string;
    pronoun: string;
    penissize: number;
    breastsize: number;
    ballssize: number;
    bottomsize: number;
    penisdesc: string;
    breastdesc: string;
    outfits: string[];
    pregnancy: any;
    skincolour: number;
    init: number;
    intro: number;
    pronouns: Record<string, string>;

    static add: (manager: any, npcData: NPCData, config?: NPCConfig, translationsData?: Record<string, any>) => boolean;
    static get: (manager: any) => NPCData[];
    static clear: (manager: any) => boolean;
    static update: (manager: any) => boolean;
    static setup: (manager: any) => void;
  }

  declare class NPCSidebar {
    init(force?: boolean): void;
    static get ZIndices(): any;
    display: object;
  }

  class ShopManager {
    static categoryMap: {
      [key: string]: {
        icon: string;
        text: string;
        widget: string;
      };
    };

    tool: any;
    log: (message: string, level?: string, ...objects: any[]) => void;
    widgets: string[];
    passages: Array<{ name: string; content: string }>;
    shopText: Record<string, string[]>;

    constructor();

    loadShopFromJson(modName: string, path: string): Promise<boolean>;
    regShop(shopName: string, clothesType: string[], type?: string[], content?: Record<string, any>, options?: Record<string, any>): void;

    #Text(shopName: string, type?: string[], content?: Record<string, any>): void;
    #processContentItem(item: any, output: any): void;
    #shopPassageCreate(shopName: string): string;
    #shopWidgetCreate(shopName: string, clothesType: string[], options?: Record<string, any>): string;
    #widgetInit(passageData: Map<string, any>): Promise<Map<string, any>>;
    #passageInit(passageData: Map<string, any>): Promise<Map<string, any>>;
    beforePatchModToGame(): Promise<void>;
    preInit(): void;
  }

  const yaml: {
    load: (str: string) => any;
    loadAll: (str: string) => any[];
    dump: (obj: any, options?: any) => string;
    safeLoad: (str: string) => any;
    safeLoadAll: (str: string) => any[];
    safeDump: (obj: any, options?: any) => string;
    DEFAULT_FULL_SCHEMA: any;
    DEFAULT_SAFE_SCHEMA: any;
    JSON_SCHEMA: any;
    CORE_SCHEMA: any;
  };

  const SugarCube: SugarCube;

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
  const V: any;
  const T: any;
  const C: any;
  declare const Time: {
    readonly date: DateTime;
    readonly holidayMonths: number[];
    readonly second: number;
    readonly minute: number;
    readonly hour: number;
    readonly weekDay: number;
    readonly weekDayName: string;
    readonly monthDay: number;
    readonly month: number;
    readonly monthName: string;
    readonly year: number;
    readonly days: number;
    readonly season: string;
    readonly startDate: DateTime;
    readonly tomorrow: DateTime;
    readonly yesterday: DateTime;
    readonly schoolTerm: boolean;
    readonly schoolDay: boolean;
    readonly schoolTime: boolean;
    readonly dayState: 'night' | 'dusk' | 'day' | 'dawn';
    readonly nextSchoolTermStartDate: DateTime;
    readonly nextSchoolTermEndDate: DateTime;
    readonly lastDayOfMonth: number;
    readonly dayOfYear: number;
    readonly secondsSinceMidnight: number;
    readonly currentMoonPhase: string;
    readonly moonPhases: Record<string, { start: number; end: number; description: string; endAlt?: number }>;
    readonly daysOfWeek: string[];
    set(time: number | DateTime): void;
    setDate(date: DateTime): void;
    setTime(hour: number, minute?: number): void;
    setTimeRelative(hour: number, minute?: number): void;
    pass(seconds: number): void;
    isSchoolTerm(date: DateTime): boolean;
    isSchoolDay(date: DateTime): boolean;
    isSchoolTime(date: DateTime): boolean;
    getDayOfYear(date: DateTime): number;
    getSecondsSinceMidnight(date: DateTime): number;
    getNextSchoolTermStartDate(date: DateTime): DateTime;
    getNextSchoolTermEndDate(date: DateTime): DateTime;
    nextMoonPhase(targetPhase: string): DateTime;
    previousMoonPhase(targetPhase: string): DateTime;
    isBloodMoon(date?: DateTime): boolean;
    getSeason(date: DateTime): 'winter' | 'spring' | 'summer' | 'autumn';
    getNextWeekdayDate(weekDay: number): DateTime;
    getPreviousWeekdayDate(weekDay: number): DateTime;
    isWeekEnd(): boolean;
    readonly monthNames: string[];
  };
  declare const Weather: {
    rain: boolean;
    thunder: boolean;
    snow: boolean;
    cloud: boolean;
    windy: boolean;
    fog: boolean;
    [key: string]: any;
  };

  declare const Dynamic: {
    [key: string]: any;
  };

  declare const TimeConstants: {
    standardYearMonths: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    leapYearMonths: [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    secondsPerDay: 86400;
    secondsPerHour: 3600;
    secondsPerMinute: 60;
    synodicMonth: 29.530588;
  };

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
    wiki(wikitext: string, ...args: any[]): JQuery;
    wiki(executor: (fragment: DocumentFragment) => void): JQuery;
    wiki(element: HTMLElement, wikitext: string, ...args: any[]): HTMLElement;
    wiki(element: DocumentFragment, wikitext: string, ...args: any[]): DocumentFragment;
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
    css(propertyName: string, value: string | number): this;

    on(event: string, handler: Function): this;
    off(event: string, handler?: Function): this;
    click(handler: Function): this;

    [key: string]: any;
  }

  function ordinalSuffixOf(i: number): number;
  function wikifier(widget: any, ...args: any[]): any;
  function drawCondition(): boolean;

  const ColourUtils: any;

  declare function clone<T>(source: T, options?: { deep?: boolean; preservePrototype?: boolean; }, map?: WeakMap<any, any>): T;
  declare function merge<T, S1, S2, S3, S4, S5>(target: T, source1: S1, source2?: S2, source3?: S3, source4?: S4, source5?: S5): T & S1 & S2 & S3 & S4 & S5;
  function equal(a: any, b: any): boolean;
  function contains(arr: any[], value: any, options?: ontainsOptions): boolean;
  function random(min?: any, max?: any, float?: boolean): number;
  declare function either<T>(itemsOrA: T[] | T, ...rest: any[]): T;
  declare function either<T>(itemsOrA: T[] | T, options?: { weights?: number[] }): T;
  function loadImageWithModLoader(src: string): Promise<string>;
  function convert(str: string, mode?: string, options?: { delimiter?: string; preserveAcronyms?: boolean; }): string;

  interface ContainsOptions {
    mode?: 'any' | 'all' | 'none';
    caseSensitive?: boolean;
    comparator?: (item: any, value: any) => boolean;
    deepEqual?: boolean;
  }

  class SelectCase {
    constructor();

    case(condition: any, result: any): SelectCase;
    casePredicate(fn: (input: any, meta: any) => boolean, result: any): SelectCase;
    caseRange(min: number, max: number, result: any): SelectCase;
    caseIn(values: any[], result: any): SelectCase;
    caseIncludes(substrings: string | string[], result: any): SelectCase;
    caseRegex(regex: RegExp, result: any): SelectCase;
    caseCompare(comparator: string, value: number, result: any): SelectCase;
    else(result: any): SelectCase;
    match(input: any, meta?: any): any;
  }

  declare const Renderer: {
    CanvasModels: {
      main: any;
    };
    [key: string]: any;
  };

  const playerNormalPregnancyType: () => string;
  function between(x: any, min: number, max: number): boolean;
  function getRobinLocation(): string;
  function sydneySchedule(): void;
}

export { };