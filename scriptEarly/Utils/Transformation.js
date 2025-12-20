// @ts-check
/// <reference path='../../maplebirch.d.ts' />
(() => {
	'use strict';
	const maplebirch = window.maplebirch;

	class Transformation {
		/** @param {{ log: any; core: MaplebirchCore; }} manager */
		constructor(manager) {
			this.lang = manager.core.lang;
			this.log = manager.log;
			/** @type {any} */
			this.transformation = {};
			/** @type {any} */
			this.decayConditions = {
				wolf: [() => V.wolfbuild >= 1,() => V.worn.neck.name !== 'spiked collar',() => V.worn.neck.name !== 'spiked collar with leash',() => playerNormalPregnancyType() !== 'wolf'],
				cat: [() => V.catbuild >= 1,() => V.worn.neck.name !== 'cat bell collar',() => playerNormalPregnancyType() !== 'cat'],
				cow: [() => V.cowbuild >= 1,() => V.worn.neck.name !== 'cow bell',() => playerNormalPregnancyType() !== 'cow'],
				// 0.5.6：鸟类变形检查羽毛项链
				bird: [() => V.birdbuild >= 1,() => V.worn.head.name !== 'feathered hair clip',() => V.worn.neck.name !== 'feather necklace',() => playerNormalPregnancyType() !== 'hawk'],
				// 0.5.6：狐狸变形检查碧玉吊坠
				fox: [() => V.foxbuild >= 1,() => V.worn.head.name !== 'spirit mask',() => V.worn.neck.name !== 'jasper pendant',() => playerNormalPregnancyType() !== 'fox']
			};
			/**@type {any}*/
			this.config = {};
			this.defaultCallback = [() => ({})];
			this.preCallback = [(/**@type {any}*/opts) => {}];
			this.defaultOptions = () => { return this.defaultCallback.reduce((result, callback) => {return { ...result, ...callback() }; }, {});};
			this.preprocess = (/**@type {any}*/opts) => { this.preCallback.forEach(callback => callback(opts)); };
			this.layers = {};
			manager.core.once(':passagestart', () => {
				this.canvas();
				if (['Start', 'Downgrade Waiting Room'].includes(manager.core.state.passage.title)) return;
				this.inject();
			});
			manager.core.once(':finally', () => {
				manager.core.tool.widget.defineMacro('transform', (/**@type {String}*/name, /**@type {Number}*/change) => this._transform(name, change));
				manager.core.tool.widget.defineMacro('transformationAlteration', () => this._transformationAlteration());
				manager.core.tool.widget.defineMacro('transformationStateUpdate', () => this._transformationStateUpdate());
			});
		}

		get ZIndices() {
			return ZIndices;
		}

		/** @param {string} widget @param {any[]} args */
		#wikifier(widget, ...args) {
			return maplebirch.SugarCube.Wikifier.wikifyEval('<<' + widget + (args.length ? ' ' + args.join(' ') : '') + '>>');
		}

		/** @param {boolean} boolean */
		vanillaTransformation(boolean) {
			if (!V.transformationParts || boolean===true) {
				/**@type {any}*/
				this.vanilla = {
					transformation: new Set(['traits', 'angel', 'demon', 'fallenAngel', 'cat', 'cow', 'wolf', 'bird', 'fox']),
					traits: new Set()
				};
				return;
			}
			this.vanilla = {
				transformation: new Set(Object.keys(V.transformationParts)),
				traits: new Set()
			};
			if (V.transformationParts.traits && typeof V.transformationParts.traits === 'object') Object.keys(V.transformationParts.traits).forEach(trait => this.vanilla.traits.add(trait));
		}

		/** @param {{ z: string|number; zfn: (options: any) => any; }} config */
		#processLayerConfig(config) {
			if (config.z && typeof config.z === 'string') config.z = this.ZIndices[config.z] || this.ZIndices.lower;
			if (config.zfn && typeof config.zfn === 'function') {
				const originalZfn = config.zfn;
				config.zfn = (options) => {
					const result = originalZfn(options);
					if (typeof result === 'string') return this.ZIndices[result] || this.ZIndices.lower;
					return result;
				};
			}
			return config;
		}

		/** @param {string|number} name @param {string|number} type @param {any} options */
		add(name, type, options = {}) {
			/**@type {any}*/const physicalAttrs = {};
			if (type && !this.transformation[type]) this.transformation[type] = {};
			if (Array.isArray(options.physical)) options.physical.forEach((/**@type {string|number}*/attr) => physicalAttrs[attr] = 'disabled');
			this.transformation[type][name] = physicalAttrs;
			this.log(`转化 ${name} 已添加到 ${type} 类型`, 'DEBUG');
			if (options.traits && Array.isArray(options.traits)) {
				options.traits.forEach((/** @type {string} */trait) => {
					if (!(trait in this.transformation.traits)) this.transformation.traits[trait] = 'disabled';
				});
			}
			const config = {
				type: type,
				build: options.build ?? 100,
				level: options.level ?? 6,
				condition: options.condition,
				widget: options.widget,
				icon: options.icon,
				get message_up() {
					if (!options.message_up) return undefined;
					const lang = maplebirch.Language;
					/**@type {any}*/const processed = {};
					for (const [level, message] of Object.entries(options.message_up)) {
						if (typeof message === 'string') { processed[level] = message; }
						else if (typeof message === 'object') { processed[level] = message[lang] || message.EN || message[Object.keys(message)[0]]; }
					}
					return processed;
				},
				get message_down() {
					if (!options.message_down) return undefined;
					const lang = maplebirch.Language;
					/**@type {any}*/const processed = {};
					for (const [level, message] of Object.entries(options.message_down)) {
						if (typeof message === 'string') { processed[level] = message; } 
						else if (typeof message === 'object') { processed[level] = message[lang] || message.EN || message[Object.keys(message)[0]]; }
					}
					return processed;
				}
			};
			this.config[name] = config;
			if (options.defaultOptions) this.defaultCallback.push(options.defaultOptions);
			if (options.preprocess) this.preCallback.push(options.preprocess);
			if (options.layers) {
				/**@type {any}*/const Layers = {};
				Object.entries(options.layers).forEach(([layerName, layerConfig]) => { Layers[layerName] = this.#processLayerConfig(layerConfig); });
				Object.assign(this.layers, Layers);
			}
			if (type === 'physical' && options.decay !== false && !this.decayConditions[name]) this.decayConditions[name] = options.decayConditions ?? [() => V.maplebirch.transformation[name].build >= 1];
			if (typeof options.translations === 'object') {
				this.log(`开始处理翻译数据 (${Object.keys(options.translations).length} 个键)`, 'DEBUG');
				for (const key in options.translations) {
					if (options.translations.hasOwnProperty(key)) {
						try {
							this.lang.translations.set(key, options.translations[key]);
						} catch (/**@type {any}*/error) {
							this.log(`设置翻译键失败: ${key} - ${error.message}`, 'ERROR');
						}
					}
				}
			}
		}

		inject() {
			this.#getData();
			this.#update();
			this.#clear();
		}

		canvas() {
			const originalDefaultOptions = Renderer.CanvasModels.main.defaultOptions?.bind(Renderer.CanvasModels.main);
			const originalPreprocess = Renderer.CanvasModels.main.preprocess?.bind(Renderer.CanvasModels.main);
			if (originalDefaultOptions) {
				Renderer.CanvasModels.main.defaultOptions = () => {
					try {
						const originalResult = originalDefaultOptions();
						const customResult = this.defaultOptions();
						return { ...originalResult, ...customResult };
					} catch (/**@type {any}*/error) {
						this.log(`defaultOptions 错误: ${error.message}`, 'ERROR');
						try { return originalDefaultOptions(); }
						catch { return {}; }
					}
				};
			}
			if (originalPreprocess) {
				Renderer.CanvasModels.main.preprocess = (/**@type {any}*/options) => {
					try {
						originalPreprocess(options);
						this.preprocess(options);
					} catch (/**@type {any}*/error) {
						this.log(`preprocess 错误: ${error.message}`, 'ERROR');
					}
				};
			}
			if (Renderer.CanvasModels.main.layers) {
				try {
					Object.assign(Renderer.CanvasModels.main.layers, this.layers);
					this.log(`成功合并 ${Object.keys(this.layers).length} 个图层`, 'DEBUG');
				} catch (/**@type {any}*/error) {
					this.log(`图层合并错误: ${error.message}`, 'ERROR');
				}
			}
			this.log('画布系统初始化完成', 'DEBUG');
		}

		#getData() {
			if (!V.transformationParts) V.transformationParts = { traits: {}, special: {}, physical: {} };
			if (!this.transformation.traits) this.transformation.traits = {};
			if (!this.transformation.special) this.transformation.special = {};
			if (!this.transformation.physical) this.transformation.physical = {};
			const vanillaAnimals = ['cat', 'cow', 'wolf', 'bird', 'fox'];
			/**@type {any}*/const animals = {};
			vanillaAnimals.forEach(animal => {
				if (V.transformationParts[animal] && typeof V.transformationParts[animal] === 'object') animals[animal] = V.transformationParts[animal];
			});
			if (V.transformationParts.traits && typeof V.transformationParts.traits === 'object') Object.assign(this.transformation.traits, V.transformationParts.traits);
			const specialKeys = ['angel', 'demon', 'fallenAngel'];
			specialKeys.forEach(key => {
				if (V.transformationParts[key] && typeof V.transformationParts[key] === 'object') {
					if (!this.transformation.special[key]) this.transformation.special[key] = {};
					Object.keys(V.transformationParts[key]).forEach(attr => {
						if (!(attr in this.transformation.special[key])) this.transformation.special[key][attr] = V.transformationParts[key][attr];
					});
				}
			});
			if (Object.keys(animals).length > 0) {
				Object.entries(animals).forEach(([animal, data]) => {
					if (data && typeof data === 'object') {
						if (!this.transformation.physical[animal]) this.transformation.physical[animal] = {};
						Object.keys(data).forEach(attr => {
							if (!(attr in this.transformation.physical[animal])) this.transformation.physical[animal][attr] = data[attr];
						});
					}
				});
			}
		}

		#update() {
			this.log('开始更新变形数据', 'DEBUG');
			const vanillaAnimals = ['cat', 'cow', 'wolf', 'bird', 'fox'];
			const vanillaSpecial = ['angel', 'demon', 'fallenAngel'];
			Object.entries(this.config).forEach(([name, config]) => { if (!V.maplebirch.transformation[name]) V.maplebirch.transformation[name] = { build: 0, level: 0 }; });
			if (this.transformation.traits) {
				if (!V.transformationParts.traits) V.transformationParts.traits = {};
				Object.entries(this.transformation.traits).forEach(([trait, value]) => {
					if (V.transformationParts.traits[trait] === undefined) V.transformationParts.traits[trait] = value;
				});
			}
			if (this.transformation.special) {
				Object.entries(this.transformation.special).forEach(([key, data]) => {
					if (data && typeof data === 'object' && vanillaSpecial.includes(key)) {
						if (!V.transformationParts[key]) V.transformationParts[key] = {};
						Object.entries(data).forEach(([attr, value]) => {
							if (V.transformationParts[key][attr] === undefined) V.transformationParts[key][attr] = value;
						});
					}
				});
			}
			if (this.transformation.physical) {
				Object.entries(this.transformation.physical).forEach(([key, data]) => {
					if (data && typeof data === 'object' && vanillaAnimals.includes(key)) {
						if (!V.transformationParts[key]) V.transformationParts[key] = {};
						Object.entries(data).forEach(([attr, value]) => {
							if (V.transformationParts[key][attr] === undefined) V.transformationParts[key][attr] = value;
						});
					}
				});
			}
			const { traits, special, physical, ...otherTypes } = this.transformation;
			const allVanillaKeys = [...vanillaAnimals, ...vanillaSpecial, 'traits'];
			Object.entries(otherTypes).forEach(([type, data]) => {
				if (data && typeof data === 'object' && !allVanillaKeys.includes(type)) {
					if (!V.transformationParts[type]) V.transformationParts[type] = {};
					Object.entries(data).forEach(([attr, value]) => {
						if (V.transformationParts[type][attr] === undefined) V.transformationParts[type][attr] = value;
					});
				}
			});
		}

		#clear() {
			if (!V.transformationParts) return false;
			if (!this.vanilla) this.vanillaTransformation(true);
			Object.keys(V.transformationParts).forEach(data => {
				if (!this.vanilla.transformation.has(data) && !Object.keys(this.transformation).includes(data)) delete V.transformationParts[data];
			});
			if (V.transformationParts.traits && typeof V.transformationParts.traits === 'object') Object.keys(V.transformationParts.traits).forEach(trait => { if (!this.vanilla.traits.has(trait) && !(this.transformation.traits && trait in this.transformation.traits)) delete V.transformationParts.traits[trait]; });
			if (V.maplebirch.transformation) {
				const validTransformations = new Set(['wolf', 'cat', 'cow', 'bird', 'fox', 'angel', 'demon', 'fallen', ...Object.keys(this.config)]);
				Object.keys(V.maplebirch.transformation).forEach(name => {
					const isVanilla = ['wolf', 'cat', 'cow', 'bird', 'fox', 'angel', 'demon', 'fallen'].includes(name);
					if (!isVanilla && !validTransformations.has(name)) delete V.maplebirch.transformation[name];
				});
			}
		}

		/** @param {string} name @param {number} change */
		_transform(name, change) {
			if (!change) return;
			const type = this.config[name]?.type || this.#vanillaType(name);
			switch (name) {
				case 'wolf': V.wolfbuild = Math.clamp(V.wolfbuild + change, 0, 100); break;
				case 'cat': V.catbuild = Math.clamp(V.catbuild + change, 0, 100); break;
				case 'cow': V.cowbuild = Math.clamp(V.cowbuild + change, 0, 100); break;
				case 'bird': V.birdbuild = Math.clamp(V.birdbuild + change, 0, 100); break;
				case 'fox': V.foxbuild = Math.clamp(V.foxbuild + change, 0, 100); break;
				case 'angel': V.angelbuild = Math.clamp(V.angelbuild + change, 0, 100); break;
				case 'fallen': V.fallenbuild = Math.clamp(V.fallenbuild + change, 0, 100); break;
				case 'demon': V.demonbuild = Math.clamp(V.demonbuild + change, 0, 100); break;
				default: this.#modTransform(name, change); break;
			}
			if (change > 0 && type !== 'special') this.#suppress(name, type, change);
		}

		/** @param {string} name */
		#vanillaType(name) {
			if (['angel', 'fallen', 'demon'].includes(name)) return 'special';
			if (['wolf', 'cat', 'cow', 'bird', 'fox'].includes(name)) return 'physical';
			return 'physical';
		}

		/** @param {string|number} name @param {any} change */
		#modTransform(name, change) {
			const config = this.config[name];
			if (!config) return;
			const data = V.maplebirch.transformation[name];
			if (!data) return;
			data.build = Math.clamp(data.build + change, 0, config.build);
		}

		/** @param {string} name @param {string} type @param {number} change */
		#suppress(name, type, change) {
			const absChange = Math.abs(change);
			Object.entries(this.config).forEach(([otherName, config]) => {
				if (otherName === name || config.type === 'special' || config.type !== type) return;
				if (['wolf', 'cat', 'cow', 'bird', 'fox'].includes(otherName)) {
					this.#vanillaSuppress(name, otherName, absChange);
				} else {
					this.#modSuppress(name, otherName, config, absChange);
				}
			});
		}

		/** @param {string} name @param {string} otherName @param {number} absChange */
		#vanillaSuppress(name, otherName, absChange) {
			switch (otherName) {
				case 'wolf':
					if (name !== 'wolf' && V.worn.neck.name !== 'spiked collar' && V.worn.neck.name !== 'spiked collar with leash') V.wolfbuild = Math.clamp(V.wolfbuild - absChange, 0, 100);
					break;
				case 'cat':
					if (name !== 'cat' && V.worn.neck.name !== 'cat bell collar') V.catbuild = Math.clamp(V.catbuild - absChange, 0, 100);
					break;
				case 'cow':
					if (name !== 'cow' && V.worn.neck.name !== 'cow bell') V.cowbuild = Math.clamp(V.cowbuild - absChange, 0, 100);
					break;
				case 'bird':
					// 0.5.6：羽毛项链检查
					if (name !== 'bird' && V.worn.head.name !== 'feathered hair clip' && V.worn.neck.name !== 'feather necklace') V.birdbuild = Math.clamp(V.birdbuild - absChange, 0, 100);
					break;
				case 'fox':
					// 0.5.6：碧玉吊坠检查
					if (name !== 'fox' && V.worn.head.name !== 'spirit mask' && V.worn.neck.name !== 'jasper pendant') V.foxbuild = Math.clamp(V.foxbuild - absChange, 0, 100);
					break;
			}
		}

		/**
		 * @param {string} name
		 * @param {string|number} otherName
		 * @param {{ condition: (arg0: any) => any; build: any; }} config
		 * @param {number} absChange
		 */
		#modSuppress(name, otherName, config, absChange) {
			const data = V.maplebirch.transformation[otherName];
			if (!data) return;
			if (config.condition && typeof config.condition === 'function') {
				if (!config.condition(name)) data.build = Math.clamp(data.build - absChange, 0, config.build);
			} else {
				data.build = Math.clamp(data.build - absChange, 0, config.build);
			}
		}

		_transformationAlteration() {
			if (V.settings.transformDivineEnabled) {
				if ((V.demonbuild >= 5 && V.specialTransform !== 1) || (V.demon >= 1 && V.specialTransform === 1)) {
					this.#wikifier('demonTransform', V.demon);
				} else if ((V.angelbuild >= 5 && V.specialTransform !== 1) || (V.angel >= 1 && V.specialTransform === 1)) {
					this.#wikifier('angelTransform', V.angel);
				} else if (V.fallenangel >= 2) {
					this.#wikifier('fallenButNotOut', V.fallenangel);
				}
			}

			if (V.settings.transformAnimalEnabled) {
				const manifestArray = [V.wolfgirl, V.cat, V.cow, V.harpy, V.fox];
				const highestManifestIndex = manifestArray.indexOf(Math.max(...manifestArray));

				if (manifestArray[highestManifestIndex] > 0) {
					T.activeTransformIndex = highestManifestIndex;
				} else {
					const buildArray = [V.wolfbuild, V.catbuild, V.cowbuild, V.birdbuild, V.foxbuild];
					const buildMax = Math.max(...buildArray);
					const highestBuildIndex = buildArray.indexOf(buildMax);

					if (buildArray.filter(val => val === buildMax).length === 1 && buildArray[highestBuildIndex] >= 5) {
						T.activeTransformIndex = highestBuildIndex;
					}
				}
				/**@type {any}*/
				const modTransforms = Object.entries(this.config)
					.filter(([name, config]) => config.type === 'physical' && !['wolf', 'cat', 'cow', 'bird', 'fox'].includes(name))
					.map(([name, config]) => ({
						name,
						build: V.maplebirch.transformation[name]?.build || 0,
						widget: config.widget || name + 'Transform'
					}));

				if (modTransforms.length > 0) {
					const highestModTransform = modTransforms.reduce((/** @type {{ build: number; }} */max, /** @type {{ build: number; }} */transform) => transform.build > max.build ? transform : max, { build: -1 });
					if (highestModTransform.build >= 5) {
						const buildArray = [V.wolfbuild, V.catbuild, V.cowbuild, V.birdbuild, V.foxbuild];
						const maxVanillaBuild = Math.max(...buildArray);
						if (highestModTransform.build > maxVanillaBuild || (highestModTransform.build === maxVanillaBuild && buildArray.filter(val => val === maxVanillaBuild).length > 1)) {
							T.activeTransformIndex = 'mod_' + highestModTransform.name;
						}
					}
				}

				switch (T.activeTransformIndex) {
					case 0: this.#wikifier('wolfTransform', V.wolfgirl); break;
					case 1: this.#wikifier('catTransform', V.cat); break;
					case 2: this.#wikifier('cowTransform', V.cow); break;
					case 3: this.#wikifier('harpyTransform', V.harpy); break;
					case 4: this.#wikifier('foxTransform', V.fox); break;
					default:
						if (typeof T.activeTransformIndex === 'string' && T.activeTransformIndex.startsWith('mod_')) {
							const modName = T.activeTransformIndex.substring(4);
							const config = this.config[modName];
							const data = V.maplebirch.transformation[modName];
							if (config && data) {
								const widgetName = config.widget || modName + 'Transform';
								this.#wikifier(widgetName, data.level);
							}
						}
						break;
				}
			}
		}

		_transformationStateUpdate() {
			// 0.5.6：熟悉项圈检查
			if (!(V.worn.neck.name === 'familiar collar' && V.worn.neck.cursed === 1)) Object.entries(this.decayConditions).forEach(([animal, conditions]) => { if (conditions.every((/**@type {() => any}*/condition) => condition())) this._transform(animal, -1); });
			
			if (V.wolfgirl >= 6) this.#wikifier('def', 5);
			this._transformationAlteration();
			V.physicalTransform = this.#checkPhysicalTransformations() ? 1 : 0;
			
			// 0.5.6：检查催眠特质
			const hasHypnosisPeace = V.hypnosis_traits?.peace && V.settings?.hypnosisEnabled;
			if ((V.physicalTransform === 1 || V.specialTransform === 1) && !hasHypnosisPeace) this.#handleWingExclusion();
			
			// 0.5.6：更新变形历史记录
			this.#updateTransformationHistory();
		}
		
		#updateTransformationHistory() {
			if (!V.transformationHistory || !Array.isArray(V.transformationHistory)) V.transformationHistory = [];
			const vanillaTfs = ['angel', 'fallenangel', 'demon', 'dryad', 'wolfgirl', 'cat', 'cow', 'harpy', 'fox'];
			for (let i = 0; i < vanillaTfs.length; i++) {
				const tf = vanillaTfs[i];
				const threshold = tf === 'fallenangel' ? 2 : 6;
				if (V[tf] >= threshold) if (!V.transformationHistory.includes(tf)) V.transformationHistory.push(tf);
			}
			Object.entries(this.config).forEach(([name, config]) => {
				const data = V.maplebirch.transformation[name];
				if (data && data.level >= 6) if (!V.transformationHistory.includes(name)) V.transformationHistory.push(name);
			});
		}

		#handleWingExclusion() {
			let excludeWings = false;
			let hasHighBird = V.harpy >= 6;
			let hasHighSacred = (V.angel >= 6 || V.demon >= 6 || V.fallenangel >= 2);
			let allBirdWingsHidden = V.transformationParts.bird?.wings === 'hidden';
			let allSacredWingsHidden = true;
			Object.entries(this.config).forEach(([name, config]) => {
				const data = V.maplebirch.transformation[name];
				if (!data) return;
				if (config.type === 'physical' && data.level >= 6) {
					hasHighBird = true;
					if (V.transformationParts[name]?.wings !== 'hidden') allBirdWingsHidden = false;
				}
				if (config.type === 'special' && data.level >= 6) {
					hasHighSacred = true;
					if (V.transformationParts[name]?.wings !== 'hidden') allSacredWingsHidden = false;
				}
			});
			if (V.angel >= 6 && V.transformationParts.angel?.wings !== 'hidden') allSacredWingsHidden = false;
			if (V.demon >= 6 && V.transformationParts.demon?.wings !== 'hidden') allSacredWingsHidden = false;
			if (V.fallenangel >= 2 && V.transformationParts.fallenAngel?.wings !== 'hidden') allSacredWingsHidden = false;
			if (hasHighBird && hasHighSacred && !(allBirdWingsHidden && allSacredWingsHidden)) excludeWings = true;
			this.#processHiddenTransformations(excludeWings);
		}

		/** @param {any} excludeWings */
		#processHiddenTransformations(excludeWings) {
			const keys = Object.keys(V.transformationParts);
			if (V.panicattacks >= 2) {
				for (let i = 0; i < keys.length; i++) {
					const key = keys[i];
					// 0.5.6：排除'traits'键
					if (key === 'traits') continue;
					for (const [label, value] of Object.entries(V.transformationParts[key])) {
						// 0.5.6变更：从['pubes', 'pits', 'cheeks', 'flaunting']变为['pubes', 'pits']
						if (value === 'hidden' && !['pubes', 'pits'].includes(label) &&
							!(label === 'wings' && excludeWings)) {
							V.transformationParts[key][label] = 'default';
							V.effectsmessage = 1;
							V.hiddenTransformMessage = 1;
						}
					}
				}
			} else {
				for (let i = 0; i < keys.length; i++) {
					const key = keys[i];
					// 0.5.6：排除'traits'键
					if (key === 'traits') continue;
					for (const [label, value] of Object.entries(V.transformationParts[key])) {
						// 0.5.6变更：从['pubes', 'pits', 'cheeks', 'flaunting']变为['pubes', 'pits']
						if (value === 'hidden' && !['pubes', 'pits'].includes(label) &&
							!(label === 'wings' && excludeWings)) {
							this.#wikifier('trauma', 15);
							V.effectsmessage = 1;
							V.hiddenTransformMessage = 2;
						}
					}
				}
			}
		}

		#checkPhysicalTransformations() {
			if (V.cat > 0 || V.wolfgirl > 0 || V.cow > 0 || V.harpy > 0 || V.fox > 0) return true;
			for (const [name, config] of Object.entries(this.config)) {
				if (config.type === 'physical') {
					const data = V.maplebirch.transformation[name];
					if (data && data.level > 0) return true;
				}
			}
			return false;
		}

		/**
		 * @param {string} key
		 * @param {{ element: (arg0: string, arg1: string, arg2: string) => void; wikifier: (arg0: string, arg1: string) => void; }} tools
		 */
		message(key, tools) {
			const match = key.match(/^([a-z]+)(Up|Down)(\d+)$/i);
			if (!match) return false;
			const [, name, direction, level] = match;
			const config = this.config[name];
			if (!config) return false;
			const messageType = direction === 'Up' ? 'message_up' : 'message_down';
			const message = config[messageType] && config[messageType][level];
			if (message) {
				tools.element('span', message, 'gold');
				if (direction === 'Up' && parseInt(level) === config.level) tools.wikifier('earnFeat', `'${name}'`);
			} else {
				const lang = maplebirch.Language;
				let defaultMessage;
				if (direction === 'Up') {
					defaultMessage = lang === 'CN' ? `你的${name}变形达到了第${level}阶段。` : `Your ${name} transformation has reached stage ${level}.`;
				} else {
					defaultMessage = lang === 'CN' ? `你的${name}变形退化到第${level}阶段。` : `Your ${name} transformation has degraded to stage ${level}.`;
				}
				tools.element('span', defaultMessage, 'gold');
			}
			return true;
		}

		get icon() {
			if (!V.maplebirch?.transformation) return '<<tficon "angel">>';
			for (const modName of Object.keys(V.maplebirch.transformation)) {
				const modData = V.maplebirch.transformation[modName];
				const config = this.config[modName];
				if (modData.level >= 6 && config?.icon) return `<<icon "${config.icon}">>`;
			}
			return '<<tficon "angel">>';
		}
	}

	maplebirch.once(':char-init', (/**@type {{ log: any; core: MaplebirchCore; }}*/data) => Object.assign(data, { transformation: new Transformation(data) }));
})();