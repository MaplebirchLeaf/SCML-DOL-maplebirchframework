(async() => {
  'use strict';
  if (!window.maplebirch) {
    console.log('%c[maplebirch] 错误: 核心系统未初始化', 'color: #C62828; font-weight: bold;');
    return;
  }

  const maplebirch = window.maplebirch;
  /*
  class combatImg {
    static defaultOptions = {
      debug: false,
      root: 'img/sex/',
      position: 'missionary/',
      gender: 'girl',
      src: this.root + this.position + this.gender + '/',
      showPlayer: true,
      showFace: true,
      showClothing: true,
      showNPCs: true,
      showTan: true,        // 日晒因素
      speed: "idle",
      filters: { worn: {} },
    }
  }

  class combatImgProcess {
    static get position() {
      switch (V.position) {
        case 'doggy': return 'doggy';
        case 'missionary': return 'missionary';
        default: return 'missionary';
      }
    }

    static get PcAnimationSpeed() {
      if (combat.isRapid()) {
        return "vfast";
      }
      if (combat.isActive()) {
        if (V.enemytype === "machine") {
          switch (V.machine?.speed) {
            case 1:
              return "slow";
            case 2:
              return "fast";
            case 3:
              return "vfast";
            default:
              return "vfast";
          }
        } else {
          if (T.knotted || T.knotted_short) return "mid";
          if (V.enemyarousal >= (V.enemyarousalmax / 5) * 4) return "vfast";
          if (V.enemyarousal >= (V.enemyarousalmax / 5) * 3) return "fast";
          if (V.enemyarousal >= (V.enemyarousalmax / 5) * 1) return "mid";
          return "slow";
        }
      }
      return "idle";
    }
  }

  const combatMainPc = {
    name: 'maplebirchCombat',
    width: 256,  // 宽度
    height: 256, // 高度
    scale: true, // 是否支持尺寸缩放
    frames: 4,   // 精灵图帧率
    generatedOptions() {
      return [];
    },
    defaultOptions() {
      const result = combatImg.defaultOptions;

      return result
    },
    preprocess(options) {
      if (!options) options = this.defaultOptions();
      options.debug = !!V.debug;
      options.position = combatImgProcess.position;
      options.src = options.root + options.position + options.gender + '/';
    }
  }
*/
  class CombatManager {
    
  }
})();