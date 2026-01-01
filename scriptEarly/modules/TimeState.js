// @ts-check
/// <reference path='../../maplebirch.d.ts' />
(async() => {
  'use strict';

  class TimeStateManager {
    /** @param {MaplebirchCore} core */
    constructor(core) {
      this.log = (/** @type {any} */message, level = 'DEBUG', /** @type {any} */...objects) => { core.logger.log(`[state] ${message}`, level, ...objects); };
      core.trigger(':state-init', this);
      const constructor = 
      /** @type {typeof TimeStateManager & {TimeManager: new (manager: TimeStateManager) => any; StateManager: new (manager: TimeStateManager) => any;}} */
      (this.constructor);
      this.TimeManager = new constructor.TimeManager(this);
      this.StateManager = new constructor.StateManager(this);

      this.passage = null;
      core.on(':passageinit', (/** @type {{ passage: any; }} */ev) => { this.passage = ev.passage; if (this.#shouldCollectPassage(this.passage)) this.log(`处理段落: ${this.passage.title}`, 'INFO'); });
    }

    /** @param {{ tags: string|string[]; }} passage */
    #shouldCollectPassage(passage) {
      return passage && !passage.tags.includes('widget');
    }

    get Passage() {
      return this.passage;
    }

    get modifyWeather() {
      return maplebirch.addonPlugin.modifyWeather;
    }

    /** @param {string} type @param {string} eventId @param {any} options */
    regTimeEvent(type, eventId, options) {
      this.TimeManager.register(type, eventId, options);
    }

    /** @param {string} type @param {string} eventId */
    delTimeEvent(type, eventId) {
      this.TimeManager.unregister(type, eventId);
    }

    timeTravel(options = {}) {
      this.TimeManager.timeTravel(options);
    }

    get TimeEvents() {
      return this.TimeManager.timeEvents;
    }

    /** @param {string} type @param {string} eventId @param {any} options */
    regStateEvent(type, eventId, options) {
      this.StateManager.register(type, eventId, options);
    }

    /** @param {string} type @param {string} eventId */
    delStateEvent(type, eventId) {
      this.StateManager.unregister(type, eventId);
    }

    get StateEvents() {
      return this.StateManager.stateEvents;
    }

    async preInit() {
      this.TimeManager.initialize();
      this.StateManager.initialize();
    }
  }

  await maplebirch.register('state', new TimeStateManager(maplebirch), ['addonPlugin']);
})();