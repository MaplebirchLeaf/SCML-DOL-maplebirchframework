// @ts-check
/// <reference path='../maplebirch.d.ts' />
(() => {
  'use strict';

  class modifyWeather {
    /** @param {MaplebirchCore} core @param {any} modSC2DataManager @param {any} addonReplacePatcher */
    constructor(core, modSC2DataManager, addonReplacePatcher) {
      this.core = core;
      this.modSC2DataManager = modSC2DataManager;
      this.addonReplacePatcher = addonReplacePatcher;
      this.layerModifications = new Map();
      this.effectModifications = new Map();
      this.weathertrigger = false;
    }

    /** @param {string} effectName @param {object} patch */
    addEffect(effectName, patch, mode = 'replace') {
      if (!this.effectModifications.has(effectName)) this.effectModifications.set(effectName, []);
      this.effectModifications.get(effectName).push({ patch, mode });
      return this;
    }

    /** @param {string} layerName @param {object} patch */
    addLayer(layerName, patch, mode = 'replace') {
      if (!this.layerModifications.has(layerName)) this.layerModifications.set(layerName, []);
      this.layerModifications.get(layerName).push({ patch, mode });
      return this;
    }

    /** @param {{ name: any; }} params */
    trigger(params) {
      const layerName = params.name;
      if (!this.weathertrigger) { this.core.trigger(':weather'); this.weathertrigger = true; }
      if (this.layerModifications.has(layerName)) {
        const modifications = this.layerModifications.get(layerName);
        for (const { patch, mode } of modifications) {
          const options = { mode };
          merge(params, patch, options);
        }
        this.layerModifications.delete(layerName);
        this.core.log(`[weather] 处理层 ${layerName}: 应用了 ${modifications.length} 个修改`, 'DEBUG');
      }
      if (this.effectModifications.size > 0) {
        for (const [effectName, modifications] of this.effectModifications) {
          const effect = Weather.Renderer.Effects.effects.get(effectName);
          if (effect) {
            for (const { patch, mode } of modifications) {
              const options = { mode };
              merge(effect, patch, options);
            }
            this.core.log(`[weather] 修改效果 ${effectName}: 应用了 ${modifications.length} 个修改`, 'DEBUG');
          }
        }
        this.effectModifications.clear();
      }
      return params;
    }

    async modifyWeatherJavaScript() {
      const oldSCdata = this.modSC2DataManager.getSC2DataInfoAfterPatch();
      const SCdata = oldSCdata.cloneSC2DataInfo();
      const weatherJavascriptPath = '00-layer-manager.js';
      const file = SCdata.scriptFileItems.getByNameWithOrWithoutPath(weatherJavascriptPath);
      try {
        const regex = /const\s+layer\s*=\s*new\s+Weather\.Renderer\.Layer\(([^)]+)\);/;
        if (regex.test(file.content)) {
          file.content = file.content.replace(
            regex,
            'maplebirch.state.modifyWeather.trigger(params);\n\t\tconst layer = new Weather.Renderer.Layer(params.name, params.blur, params.zIndex, params.animation);'
          );
        }
        this.addonReplacePatcher.gModUtils.replaceFollowSC2DataInfo(SCdata, oldSCdata);
      } catch (/** @type {any} */error) {
        this.core.log(`处理天气JavaScript时发生错误: ${error.message}`, 'ERROR');
      }
    }
  }

  maplebirch.once(':beforePatch', (/** @type {{ gSC2DataManager: any; addonReplacePatcher: any; }} */data) => { Object.assign(data, { modifyWeather: new modifyWeather(maplebirch, data.gSC2DataManager, data.addonReplacePatcher) }); });
})();