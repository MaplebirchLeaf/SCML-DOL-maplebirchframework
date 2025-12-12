// @ts-check
/// <reference path='../maplebirch.d.ts' />
(() => {
  'use strict';
  const maplebirch = window.maplebirch;

  class modifyWeather {
    /** @param {any} modSC2DataManager @param {any} addonReplacePatcher */
    constructor(modSC2DataManager, addonReplacePatcher) {
      this.modSC2DataManager = modSC2DataManager;
      this.addonReplacePatcher = addonReplacePatcher;
      this.layerModifications = new Map();
      this.effectModifications = new Map();
      this.weathertrigger = false;
      maplebirch.once(':definewidget', () => {
        this.#modifyDescriptions();
        this.#modifyProperty();
      });
    }

    /** @param {string} effectName @param {object} patch */
    addEffect(effectName, patch, arrayBehaviour = 'replace') {
      if (!this.effectModifications.has(effectName)) this.effectModifications.set(effectName, []);
      this.effectModifications.get(effectName).push({ patch, arrayBehaviour });
      return this;
    }

    /** @param {string} layerName @param {object} patch */
    addLayer(layerName, patch, arrayBehaviour = 'replace') {
      if (!this.layerModifications.has(layerName)) this.layerModifications.set(layerName, []);
      this.layerModifications.get(layerName).push({ patch, arrayBehaviour });
      return this;
    }

    /** @param {{ name: any; }} params */
    trigger(params) {
      const layerName = params.name;
      if (!this.weathertrigger) { maplebirch.trigger(':weather'); this.weathertrigger = true; }
      if (this.layerModifications.has(layerName)) {
        const modifications = this.layerModifications.get(layerName);
        for (const { patch, arrayBehaviour } of modifications) {
          const options = { arrayBehaviour };
          merge(params, patch, options);
        }
        this.layerModifications.delete(layerName);
        maplebirch.log(`[weather] 处理层 ${layerName}: 应用了 ${modifications.length} 个修改`, 'DEBUG');
      }
      if (this.effectModifications.size > 0) {
        for (const [effectName, modifications] of this.effectModifications) {
          const effect = Weather.Renderer.Effects.effects.get(effectName);
          if (effect) {
            for (const { patch, arrayBehaviour } of modifications) {
              const options = { arrayBehaviour };
              merge(effect, patch, options);
            }
            maplebirch.log(`[weather] 修改效果 ${effectName}: 应用了 ${modifications.length} 个修改`, 'DEBUG');
          }
        }
        this.effectModifications.clear();
      }
      return params;
    }

    #modifyRender() {
      this.addEffect('colorOverlay', {
        /** @this {any} */draw() {
          const nightColor = this.bloodMoon ? this.color.bloodMoon : ColourUtils.interpolateColor(this.color.nightDark, this.color.nightBright, this.moonFactor);
          let mixFactor = this.sunFactor;
          if (this.solarEclipse && this.sunFactor > 0) mixFactor = Math.min(this.sunFactor * 0.05, 0.05);
          const color = ColourUtils.interpolateTripleColor(nightColor, this.color.dawnDusk, this.color.day, mixFactor);
          this.canvas.ctx.fillStyle = color;
          this.canvas.fillRect();
        }
      }, 'replace');
      const eclipseEffect = { effects: [{}, { params: { color: { solarEclipse: '#1a1508d9' } }, bindings: { solarEclipse() { return Weather.solarEclipse; } } }] };

      this.addEffect('locationImage', eclipseEffect, 'merge');

      this.addEffect('locationReflective', eclipseEffect, 'merge');

      this.addLayer('sun', {
        effects: [{
          /** @this {any} */drawCondition() { return !Weather.solarEclipse && this.renderInstance.orbitals.sun.factor > -0.5 && !this.renderInstance.skyDisabled; }
        }]
      }, 'merge');

      const sunEclipseEffects = (() => {
        const stages = ['pre', 'total', 'post'];
        return stages.map((stage, i) => ({
          effect: 'skyOrbital',
          /** @this {any} */drawCondition() { return Weather.solarEclipse && this.renderInstance.orbitals.sun.factor > -0.5 && !this.renderInstance.skyDisabled && Weather.solarEclipseStage === stage; },
          params: { images: { orbital: `img/misc/sky/solar-eclipse-${i}.png` } },
          bindings: {
            /** @this {any} */position() { return this.renderInstance.orbitals.sun.position; } 
          }
        }));
      })();
      this.addLayer('sun', { effects: sunEclipseEffects }, 'concat');
      const getSkyColors = function () {
        const phase = Weather.solarEclipsePhase;
        const dayColors = { colorMin: { close: '#14145200', far: '#00001c00' }, colorMed: { close: '#d47d12', far: '#6c6d94' }, colorMax: { close: '#d4d7ff', far: '#4692d4' } };
        const eclipseColors = { colorMin: { close: '#2d1f0000', far: '#1a120000' }, colorMed: { close: '#2d1f00', far: '#1a1200' }, colorMax: { close: '#2d1f00', far: '#1a1200' } };
        let transitionFactor = phase < 0.3 ? phase / 0.3 : phase > 0.7 ? (1 - phase) / 0.3 : 1;
        return {
          colorMin: { close: ColourUtils.interpolateColor(dayColors.colorMin.close, eclipseColors.colorMin.close, transitionFactor), far: ColourUtils.interpolateColor(dayColors.colorMin.far, eclipseColors.colorMin.far, transitionFactor) },
          colorMed: { close: ColourUtils.interpolateColor(dayColors.colorMed.close, eclipseColors.colorMed.close, transitionFactor), far: ColourUtils.interpolateColor(dayColors.colorMed.far, eclipseColors.colorMed.far, transitionFactor) },
          colorMax: { close: ColourUtils.interpolateColor(dayColors.colorMax.close, eclipseColors.colorMax.close, transitionFactor), far: ColourUtils.interpolateColor(dayColors.colorMax.far, eclipseColors.colorMax.far, transitionFactor) }
        };
      };

      const skyGradientEffect = {
        effect: 'skyGradiant',
        /** @this {any} */drawCondition() { return Weather.solarEclipse && !this.renderInstance.skyDisabled; },
        params: { radius: 384 },
        bindings: { color: getSkyColors,
          /** @this {any} */position() { return this.renderInstance.orbitals.sun.position; },
          /** @this {any} */factor() { return this.renderInstance.orbitals.sun.factor; }
        }
      };
      ['bannerSky', 'sky'].forEach(layer => {
        this.addLayer(layer, { effects: [{}, {}, {
          /** @this {any} */drawCondition() { return !Weather.solarEclipse && !this.renderInstance.skyDisabled; } 
        }] }, 'merge');
        this.addLayer(layer, { effects: [skyGradientEffect] }, 'concat');
      });

      const glowConfigs = [
        { layer: 'bannerSunGlow', radius: 100, diameter: 28,
          /** @this {any} */factor: function () { return this.renderInstance.orbitals.sun.factor; } 
        },
        { layer: 'sunGlow', radius: 82, diameter: 24,
          factor: function () { return Math.max(0.3, (1 - Math.abs(Weather.solarEclipsePhase - 0.5) * 2)); }
        }
      ];

      glowConfigs.forEach(config => {
        this.addLayer(config.layer, {
          effects: [{
            /** @this {any} */drawCondition() { return !Weather.solarEclipse && this.renderInstance.orbitals.sun.factor > -0.7 && !Weather.isOvercast && !this.renderInstance.skyDisabled; }
          }]
        }, 'merge');
        this.addLayer(config.layer, {
          effects: [{
            effect: 'outerRadialGlow',
            /** @this {any} */drawCondition() { return Weather.solarEclipse && this.renderInstance.orbitals.sun.factor > -0.7 && !Weather.isOvercast && !this.renderInstance.skyDisabled; },
            params: { outerRadius: config.radius, colorInside: { dark: '#f0e5d944', med: '#f0e5d944', bright: '#f0e5d944' }, colorOutside: { dark: '#2d1f0000', med: '#2d1f0000', bright: '#2d1f0000' }, cutCenter: false, diameter: config.diameter },
            bindings: {
              /** @this {any} */position() { return this.renderInstance.orbitals.sun.position; }, factor: config.factor
            }
          }]
        }, 'concat');
      });

      ['bannerStarField', 'starField'].forEach(layer => {
        this.addLayer(layer, {
          effects: [{
            /** @this {any} */drawCondition() { return (this.renderInstance.orbitals.sun.factor < 0.75 || Weather.solarEclipse) && !this.renderInstance.skyDisabled; }
          }]
        }, 'merge');
      });

      const colorLayers = [
        { name: 'bannerClouds', color: '#5d4f20aa', count: 2 },
        { name: 'bannerOvercastClouds', color: '#5d4f20aa', count: 2 },
        { name: 'bannerCirrusClouds', color: '#5d4f20aa', count: 2 },
        { name: 'bannerPrecipitation', color: '#2a1a4aaa', count: 5 },
        { name: 'clouds', color: '#5d4f20aa', count: 2 },
        { name: 'overcastClouds', color: '#5d4f20aa', count: 2 },
        { name: 'cirrusClouds', color: '#5d4f20aa', count: 2 },
        { name: 'precipitation', color: '#2a1a4aaa', count: 5 },
        { name: 'fog', color: '#3d2e10cc', count: 2 }
      ];
      colorLayers.forEach(({ name, color, count }) => {
        const effects = Array(count).fill({}).map((_, i) => i === count - 1 ? { params: { color: { solarEclipse: color } }, bindings: { solarEclipse() { return Weather.solarEclipse; } } } : {});
        this.addLayer(name, { effects }, 'merge');
      });
    }

    #modifyDescriptions() {
      const descriptions = {
        clear: {
          solarEclipse: () => {
            const phase = Weather.solarEclipsePhase;
            const lang = maplebirch.Language;
            if (lang === 'CN') {
              if (phase < 0.3) return '天色开始诡异地变暗，仿佛黄昏提前降临。';
              else if (phase > 0.7) return '黑暗逐渐退去，白昼的光线重新洒向大地。';
              else return '日蚀让世界陷入昏暗，仿佛时间停滞了一般。';
            } else {
              if (phase < 0.3) return 'The sky begins to darken eerily, as if dusk has arrived early.';
              else if (phase > 0.7) return 'The darkness recedes, and daylight returns to the earth.';
              else return 'The solar eclipse plunges the world into gloom, as if time has stood still.';
            }
          }
        },
        lightClouds: {
          solarEclipse: () => {
            const phase = Weather.solarEclipsePhase;
            const lang = window.maplebirch.Language;
            if (lang === 'CN') {
              if (phase < 0.3) return '透过云层的光线开始减弱，天色变得诡异。';
              else if (phase > 0.7) return '光线透过云层逐渐增强，日食即将结束。';
              else return '在日蚀的黑暗中，云朵边缘泛着奇异的光晕。';
            } else {
              if (phase < 0.3) return 'The light filtering through the clouds begins to weaken, the sky turning eerie.';
              else if (phase > 0.7) return 'Light gradually strengthens through the clouds as the eclipse nears its end.';
              else return 'In the darkness of the eclipse, the edges of clouds glow with a strange halo.';
            }
          }
        },
        heavyClouds: {
          solarEclipse: () => {
            const phase = Weather.solarEclipsePhase;
            const lang = window.maplebirch.Language;
            if (lang === 'CN') {
              if (phase < 0.3) return '厚重的云层下，日食让世界陷入更深的昏暗。';
              else if (phase > 0.7) return '日食即将结束，但阴云依旧笼罩着昏暗的天空。';
              else return '日蚀的黑暗中，阴沉的天空几乎如同深夜。';
            } else {
              if (phase < 0.3) return 'Beneath the thick clouds, the eclipse plunges the world into deeper gloom.';
              else if (phase > 0.7) return 'The eclipse is ending, but gloomy clouds still shroud the dark sky.';
              else return 'In the darkness of the eclipse, the overcast sky is almost like deep night.';
            }
          }
        },
        lightPrecipitation: {
          solarEclipse: () => {
            const phase = Weather.solarEclipsePhase;
            const lang = window.maplebirch.Language;
            if (Weather.precipitation === 'rain') {
              if (lang === 'CN') {
                if (phase < 0.3) return '天色渐暗，细雨在异常的光线下闪烁着银光。';
                else if (phase > 0.7) return '日食将尽，雨滴开始映出逐渐恢复的光亮。';
                else return '日蚀的黑暗中，雨声显得格外清晰而神秘。';
              } else {
                if (phase < 0.3) return 'The sky darkens, and the drizzle shimmers silver in the abnormal light.';
                else if (phase > 0.7) return 'The eclipse is ending, and raindrops begin to reflect the returning light.';
                else return 'In the darkness of the eclipse, the sound of rain is particularly clear and mysterious.';
              }
            } else {
              if (lang === 'CN') {
                if (phase < 0.3) return '天色渐暗，雪花在异常的光线下如同飘落的萤火。';
                else if (phase > 0.7) return '日食将尽，雪地开始反射出微弱的光亮。';
                else return '日蚀的黑暗中，飘雪为世界披上了一层银白的寂静。';
              } else {
                if (phase < 0.3) return 'The sky darkens, and snowflakes fall like fireflies in the strange light.';
                else if (phase > 0.7) return 'The eclipse is ending, and the snow begins to reflect a faint light.';
                else return 'In the darkness of the eclipse, the falling snow drapes the world in a silent white veil.';
              }
            }
          }
        },
        heavyPrecipitation: {
          solarEclipse: () => {
            const phase = Weather.solarEclipsePhase;
            const lang = window.maplebirch.Language;
            if (Weather.precipitation === 'rain') {
              if (lang === 'CN') {
                if (phase < 0.3) return '暴雨在日食的昏暗天空中更显狂暴。';
                else if (phase > 0.7) return '日食渐退，但暴雨依旧倾盆而下。';
                else return '日蚀的黑暗中，暴雨声如同天地的怒吼。';
              } else {
                if (phase < 0.3) return 'The storm seems even more violent under the dim sky of the eclipse.';
                else if (phase > 0.7) return 'The eclipse is fading, but the heavy rain still pours down.';
                else return 'In the darkness of the eclipse, the sound of the storm is like the roar of heaven and earth.';
              }
            } else {
              if (lang === 'CN') {
                if (phase < 0.3) return '暴雪在日食的昏暗天空中更显猛烈。';
                else if (phase > 0.7) return '日食渐退，但暴风雪依旧肆虐。';
                else return '日蚀的黑暗中，暴风雪将世界笼罩在白色的混沌中。';
              } else {
                if (phase < 0.3) return 'The blizzard seems even more fierce under the dim sky of the eclipse.';
                else if (phase > 0.7) return 'The eclipse is fading, but the snowstorm still rages.';
                else return 'In the darkness of the eclipse, the blizzard envelops the world in white chaos.';
              }
            }
          }
        },
        thunderStorm: {
          solarEclipse: () => {
            const phase = Weather.solarEclipsePhase;
            const lang = window.maplebirch.Language;
            if (lang === 'CN') {
              if (phase < 0.3) return '日食开始，雷暴在逐渐暗淡的天空中显得更加骇人。';
              else if (phase > 0.7) return '日食即将结束，但雷电依旧在昏暗的天空中闪烁。';
              else return '日蚀的黑暗中，闪电的光芒格外刺眼。';
            } else {
              if (phase < 0.3) return 'The eclipse begins, and the thunderstorm appears even more terrifying in the fading sky.';
              else if (phase > 0.7) return 'The eclipse is ending, but lightning still flashes in the dim sky.';
              else return 'In the darkness of the eclipse, the flash of lightning is particularly dazzling.';
            }
          }
        }
      };
      // @ts-ignore
      Object.keys(descriptions).forEach(weatherType => { if (setup.WeatherDescriptions.type[weatherType]) Object.assign(setup.WeatherDescriptions.type[weatherType], descriptions[weatherType]); });
    }

    #modifyProperty() {
      Object.defineProperty(Weather, 'skyState', {
        get: function () {
          if (Weather.solarEclipse) return 'solarEclipse';
          if (Weather.bloodMoon) return 'bloodMoon';
          return this.dayState;;
        },
      });
      Object.defineProperty(Weather, 'solarEclipse', { get: function () { maplebirch.var.check(); return maplebirch.state.solarEclipse.solarEclipse; }, });
      Object.defineProperty(Weather, 'solarEclipsePhase', { get: function () { maplebirch.var.check(); return maplebirch.state.solarEclipse.solarEclipsePhase; }, });
      Object.defineProperty(Weather, 'solarEclipseStage', { get: function () { maplebirch.var.check(); return maplebirch.state.solarEclipse.solarEclipseStage; }, });
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
        this.#modifyRender();
      } catch (/** @type {any} */error) {
        maplebirch.log(`处理天气JavaScript时发生错误: ${error.message}`, 'ERROR');
      }
    }
  }

  class EclipseSystem {
    /** @param {{ regTimeEvent: (arg0: string, arg1: string, arg2: { action: () => void; cond: () => any; exact: boolean; }) => void; }} state @param { { rand: new () => any; createLog: (arg0: string) => (...data: any[]) => void;} } manger */
    constructor(state, manger) {
      this.log = manger.createLog('eclipse');
      this.Config = {
        months: [3, 6, 9, 12],
        day: 15,
      };
      this.time = 10;
      /** @type {any[]} */
      this.stored = [];
      /** @type {any|null} */
      this.cache = {
        eclipse: null,
        dateKey: null,
        storedList: null
      };
      state.regTimeEvent('onDay', ':solar-eclipse', {
        action: () => this.#updateStored(4),
        cond: () => V.options?.maplebirch?.solarEclipse,
        exact: true,
      });
      maplebirch.on(':dataInit', () => this.#updateStored(4));
    }

    #updateStored(count = 4) {
      const now = new DateTime(Time.date);
      const nowSeconds = now.hour * 3600 + now.minute * 60 + now.second;
      this.stored = this.stored.filter(eclipse => {
        const eclipseDate = new DateTime(eclipse.year, eclipse.month, eclipse.day);
        const eclipseEnd = eclipse.endHour * 3600 + eclipse.endMinute * 60;
        return eclipseDate > now || (eclipseDate.year === now.year && eclipseDate.month === now.month && eclipseDate.day === now.day && nowSeconds < eclipseEnd);
      });
      if (this.stored.length < count) {
        const newEclipses = this.#futureEclipses(count - this.stored.length);
        // @ts-ignore
        this.stored = [...this.stored, ...newEclipses].sort((a, b) => new DateTime(a.year, a.month, a.day) - new DateTime(b.year, b.month, b.day)).slice(0, count);
      }
      this.cache.eclipse = null;
      this.cache.dateKey = null;
      this.cache.storedList = null;
    }

    #futureEclipses(count = 4) {
      const now = new DateTime(Time.date);
      const eclipses = [];
      for (let i = 1; i <= 12 && eclipses.length < count; i++) {
        const month = (now.month + i - 1) % 12 + 1;
        const year = now.year + Math.floor((now.month + i - 1) / 12);
        if (this.Config.months.includes(month)) {
          const dateHash = (year * 12 + month) % 100;
          const startHour = 7 + (dateHash % 2);
          const startMinute = (dateHash * 13) % 60;
          eclipses.push({
            year, month, day: this.Config.day,
            startHour, startMinute,
            endHour: startHour + this.time,
            endMinute: startMinute,
            duration: this.time
          });
        }
      }
      return eclipses;
    }

    /** @param {{ year: number; month: number; day: number; }} date */
    #startTime(date) {
      const dateHash = (date.year * 12 + date.month) % 100;
      const minute = (dateHash * 13) % 60;
      const hour = 7 + (dateHash % 2);
      return {
        hour, minute,
        totalSeconds: hour * 3600 + minute * 60
      };
    }

    #calculate(date = new DateTime(Time.date)) {
      const dateKey = `${date.year}-${date.month}-${date.day}-${date.hour}-${date.minute}`;
      if (this.cache.eclipse && this.cache.dateKey === dateKey) return this.cache.eclipse;
      this.cache.dateKey = dateKey;
      if (!this.Config.months.includes(date.month) || date.day !== this.Config.day) {
        this.cache.eclipse = { isEclipse: false };
        return this.cache.eclipse;
      }
      const startTime = this.#startTime(date);
      const currentSeconds = date.hour * 3600 + date.minute * 60 + date.second;
      const endSeconds = startTime.totalSeconds + this.time * 3600;
      if (currentSeconds >= startTime.totalSeconds && currentSeconds <= endSeconds) {
        const phase = (currentSeconds - startTime.totalSeconds) / (this.time * 3600);
        let stage = 'total';
        if (phase < 0.3) stage = 'pre';
        else if (phase > 0.7) stage = 'post';
        this.cache.eclipse = {
          isEclipse: true,
          phase, stage, startTime
        };
      } else {
        this.cache.eclipse = { isEclipse: false };
      }
      return this.cache.eclipse;
    }

    isEclipse(date = new DateTime(Time.date)) {
      const info = this.#calculate(date);
      if (!info.isEclipse) return false;
      return {
        phase: info.phase,
        stage: info.stage,
        startTime: info.startTime,
        duration: this.time,
        currentStage: `${info.stage} phase (${(info.phase * 100).toFixed(1)}%)`
      };
    }

    get Stored() {
      if (!this.cache.storedList) this.cache.storedList = this.stored.slice();
      return this.cache.storedList;
    }

    get solarEclipse() {
      return V.options?.maplebirch?.solarEclipse ? !!this.isEclipse() : false;
    }

    get solarEclipsePhase() {
      // @ts-ignore
      return this.solarEclipse ? this.isEclipse().phase : false;
    }

    get solarEclipseStage() {
      // @ts-ignore
      return this.solarEclipse ? this.isEclipse().stage : false;
    }
  }

  maplebirch.once(':beforePatch', (/** @type {{ gSC2DataManager: any; addonReplacePatcher: any; }} */data) => {
    Object.assign(data, {
      modifyWeather: new modifyWeather(data.gSC2DataManager, data.addonReplacePatcher)
    });
  });
  maplebirch.once(':state-init', (/** @type {{ constructor: any; }} */data) => Object.assign(data.constructor, { solarEclipse: Object.freeze(EclipseSystem) }));
})();