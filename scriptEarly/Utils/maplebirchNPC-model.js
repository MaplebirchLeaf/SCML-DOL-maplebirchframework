(() => {
  'use strict';
  const maplebirch = window.maplebirch;

  class BaseBody {
    static layers = {
      'base': {
        src: 'img/body/basenoarms-classic.png',
        showfn(options) {
          return !!options.show_nnpc && !!options.canvas_mode;
        },
        z: 20,
        animation: "idle",
        filters: ['tan'],
      },
      'basehead': {
        src: 'img/body/basehead.png',
        showfn(options) {
          return !!options.show_nnpc && !!options.canvas_mode;
        },
        z: 5,
        animation: 'idle',
        filters: ['tan'],
      },
    }
  }
  
  class NPCSidebar {
    static generatedOptions() {
      return [];
    }

    static defaultOptions() {
      return {
        show_nnpc: false,
        canvas_mode: false
      }
    }

    static preprocess(options) {
      if (V.options.maplebirch.npcsidebar.show) options.show_nnpc = true;
      if (V.options.maplebirch.npcsidebar.model) options.canvas_mode = true;
    }

    static postprocess(options) {
      
    }

    constructor(manager) {
      this.manager = manager;
      this.display = {};
    }

    init() {
      Object.keys(this.display).forEach(npcName => { if (!new Set(this.manager.NPCNameList).has(npcName)) delete this.display[npcName]; });
      this.manager.NPCNameList.forEach(npcName => { if (!this.display[npcName] || !(this.display[npcName] instanceof Set)) this.display[npcName] = new Set(); });
      Renderer.CanvasModels.npcmodel = this.canvasModel;
    }

    canvasModel = {
      name: 'npc-model',
      width: 256,
      height: 256,
      frames: 2,
      scale: true,
      generatedOptions: () => NPCSidebar.generatedOptions(),
      defaultOptions: () => NPCSidebar.defaultOptions(),
      preprocess: (options) => NPCSidebar.preprocess(options),
      postprocess: (options) => NPCSidebar.postprocess(options),

      layers: {
        nnpc: {
          srcfn() {
            if (V.NPCList[0].fullDescription && setup.NPCNameList.includes(V.NPCList[0].fullDescription)) {
              if (V.options?.maplebirch?.npcsidebar?.display[V.NPCList[0].fullDescription] === 'none') return;
              return `img/ui/nnpc/${V.NPCList[0].fullDescription.toLowerCase()}/${V.options?.maplebirch?.npcsidebar?.display[V.NPCList[0].fullDescription]}.png`;
            }
          },
          showfn(options) {
            return !!options.show_nnpc && !options.canvas_mode;
          },
          z: 0,
          animation: "idle"
        },
        ...BaseBody.layers,
      }
    }
  }

  maplebirch.once(':npc-init', (data) => {
    Object.assign(data, {Sidebar: new NPCSidebar(data)});
    Object.assign(data.constructor, Object.freeze(NPCSidebar));
  });
})();





/*class npcdrip {
  static options = {
    // 滴落效果 - 根据图片中的实际文件名
    drip_vaginal: 'VeryFast',
    drip_anal: 'VeryFast',
    drip_mouth: 'VeryFast',
    // 精液效果 - 使用图片中实际存在的文件名
    cum_chest: '1',
    cum_face: '1,2',
    cum_feet: '2,3',
    cum_leftarm: '4,5',
    cum_rightarm: '1,2,3',
    cum_neck: '1,2',
    cum_thigh: '1',
    cum_tummy: '1',
    // 其他必要参数
    show_face: true,
    facestyle: 'normal',
    arm_left: 'normal',
    arm_right: 'normal',
    zarms: 30,
  }

  static layers = {
    drip_vaginal: {
      z: 55,
      srcfn(options) { return `${options.src}cum/VaginalCumDrip${options.drip_vaginal}.png`; },
      showfn(options) { return !!options.drip_vaginal; },
      animationfn(options) { return `VaginalCumDrip${options.drip_vaginal}`; },
    },
    drip_anal: {
      z: 55,
      srcfn(options) { return `${options.src}cum/AnalCumDrip${options.drip_anal}.png`; },
      showfn(options) { return !!options.drip_anal; },
      animationfn(options) { return `AnalCumDrip${options.drip_anal}`; },
    },
    drip_mouth: {
      z: 135,
      srcfn(options) { return `${options.src}cum/MouthCumDrip${options.drip_mouth}.png`; },
      showfn(options) { return options.show_face && !!options.drip_mouth && !options.worn?.face?.setup?.type?.includesAny?.("mask", "covered"); },
      dxfn(options) { return options.facestyle === 'small-eyes' ? 2 : 0; },
      animationfn(options) { return `MouthCumDrip${options.drip_mouth}`; },
    },
    cum_chest: {
      z: 55,
      animation: 'idle',
      srcfn(options) { return `${options.src}cum/Chest ${options.cum_chest}.png`; },
      showfn(options) { return !!options.cum_chest; },
    },
    cum_face: {
      z: 55,
      animation: 'idle',
      srcfn(options) { return `${options.src}cum/Face ${options.cum_face}.png`; },
      showfn(options) { return options.show_face && !!options.cum_face; },
    },
    cum_feet: {
      z: 55,
      animation: 'idle',
      srcfn(options) { return `${options.src}cum/Feet ${options.cum_feet}.png`; },
      showfn(options) { return !!options.cum_feet; },
    },
    cum_leftarm: {
      animation: 'idle',
      srcfn(options) { return `${options.src}cum/Left Arm ${options.cum_leftarm}.png`; },
      showfn(options) { return options.arm_left !== 'none' && options.arm_left !== 'cover' && !!options.cum_leftarm; },
      zfn(options) { return (options.arm_right === 'cover') ? ZIndices.arms_cover + 0.05 : options.zarms + 0.05; },
    },
    cum_rightarm: {
      animation: 'idle',
      srcfn(options) { return `${options.src}cum/Right Arm ${options.cum_rightarm}.png`; },
      showfn(options) { return options.arm_right !== 'none' && options.arm_right !== 'cover' && options.arm_right !== 'hold' && !!options.cum_rightarm; },
      zfn(options) { return (options.arm_right === 'cover' || options.arm_right === 'hold') ? ZIndices.arms_cover + 0.05 : options.zarms + 0.05; },
    },
    cum_neck: {
      z: 55,
      animation: 'idle',
      srcfn(options) { return `${options.src}cum/Neck ${options.cum_neck}.png`; },
      showfn(options) { return !!options.cum_neck; },
    },
    cum_thigh: {
      z: 55,
      animation: 'idle',
      srcfn(options) { return `${options.src}cum/Thighs ${options.cum_thigh}.png`; },
      showfn(options) { return !!options.cum_thigh; },
    },
    cum_tummy: {
      z: 55,
      animation: 'idle',
      srcfn(options) { return `${options.src}cum/Tummy ${options.cum_tummy}.png`; },
      showfn(options) { return !!options.cum_tummy; },
    },
  }
}

const npcSidebar = {
  T.activeNNPC: 'npc-model',
  width: 256,
  height: 256,
  frames: 2,
  scale: true,

  generatedOptions() {
    return [];
  },

  defaultOptions() {
    return {
      src: 'img/body/',
      body_type: 'classic',
      breasts: 'default',
      breast_size: 0,
      crotch_visible: true,
      balls: true,
      penis: true,
      penis_size: 4,


      ...npcdrip.options,
      show_hair: true,


      hair_sides_type: 'default',
      hair_sides_length: 'navel',
      hair_fringe_type: 'default',
      hair_fringe_length: 'navel'
    };
  },

  preprocess(options) {
    // 可以在这里添加预处理逻辑
    if (["fro", "afro pouf", "afro puffs"].includes(options.hair_sides_type) && options.hair_fringe_type === "fro") {
			options.fringe_mask_src = `img/hair/fringe/${options.hair_fringe_type}/mask.png`;
		} else {
			options.fringe_mask_src = null;
		}
  },

  postprocess(options) {
    // 可以在这里添加后处理逻辑
  },

  layers: {
    base: {
			show: true,
			filters: ["tan"],
			z: ZIndices.base,
			animation: "idle",

			srcfn(options) {
				return `img/body/basenoarms-${options.body_type}.png`;
			},
		},
		basehead: {
			show: true,
			filters: ["tan"],
			z: ZIndices.basehead,
			animation: "idle",
			src: 'img/body/basehead.png',
		},
    breasts: {
      show: true,
      z: 35,
      animation: 'idle',
      srcfn(options) {
        const suffix = options.breasts === 'cleavage' && options.breast_size >= 3 ? '_clothed.png' : '.png';
        return `${options.src}breasts/breasts${options.breast_size}${suffix}`;
      },
    },
    penis: {
			animation: 'idle',
			zfn(options) {
				if (!options.crotch_exposed) return 64.3
				return (options.genitals_chastity) ? 64 : 104
			},
			srcfn(options) {
				if (options.genitals_chastity) {
					if (['chastity belt', 'flat chastity cage', 'chastity parasite'].includes(options.worn.genitals)) return;
					if (options.worn.genitals === 'small chastity cage') return `${options.src}penis/penis_chastitysmall.png`;
					return `${options.src}penis/penis_chastity.png`;
				}
				//if (!(V.worn.under_lower.type.includes("strap-on") && V.worn.under_lower.state === "waist")) {// 之后修改
					return `${options.src}${options.balls ? 'penis' : 'penisnoballs'}/${options.penis === 'virgin' ? 'penis_virgin' : 'penis'}${options.penis_size}.png`;
				//}
				//return;
			},
			showfn(options) {
				return options.crotch_visible && !!options.penis;
			},
		},


    // 使用展开运算符将npcdrip的所有图层合并到layers中
    ...npcdrip.layers,



    "hair_sides": {
			filters: ["hair"],
			animation: "idle",

			srcfn(options) {
				return `img/hair/sides/${options.hair_sides_type}/${options.hair_sides_length}.png`;
			},
			zfn(options) {
				return options.hair_sides_position === "front" ? 132 : 10;
			},
			masksrcfn(options) {
				return options.head_mask_src;
			},
			showfn(options) {
				return !!options.show_hair && !!options.hair_sides_type;
			},
		},
		"hair_fringe": {
			filters: ["hair_fringe"],
			z: 133,
			animation: "idle",

			srcfn(options) {
				return `img/hair/fringe/${options.hair_fringe_type}/${options.hair_fringe_length}.png`;
			},
			showfn(options) {
				return !!options.show_hair && !!options.hair_fringe_type;
			},
			masksrcfn(options) {
				return options.head_mask_src ? options.head_mask_src : options.fringe_mask_src;
			},
		},
		"hair_extra": { // Extra layer for thighs+ long hair for certain styles
			filters: ["hair"],
			z: 10,
			animation: "idle",

			srcfn(options) {
				const hairs = [
					"default",
					"loose",
					"curl",
					"defined curl",
					"neat",
					"dreads",
					"afro pouf",
					"thick ponytail",
					"all down",
					"half-up",
					"messy ponytail",
					"ruffled",
					"half up twintail",
					"princess wave",
					"space buns",
					"sleek",
					"bedhead",
				];

				const path = `img/hair/back/${options.hair_sides_type}`;
				if (options.hair_sides_length === "feet" && [...hairs, "straight"].includes(options.hair_sides_type))
					return `${path}/feet.png`;
				if (options.hair_sides_length === "thighs" && hairs.includes(options.hair_sides_type))
					return `${path}/thighs.png`;
				if (options.hair_sides_length === "navel" && options.hair_sides_type === "messy ponytail")
					return `${path}/navel.png`;
				return "";
			},
			masksrcfn(options) {
				return options.head_mask_src;
			},
			showfn(options) {
				return !!options.show_hair && !!options.hair_sides_type;
			},
		},
  }
};

window.Renderer.CanvasModels.npcmodel = npcSidebar;*/