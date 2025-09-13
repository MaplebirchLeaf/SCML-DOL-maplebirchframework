(() => {
  if (!window.maplebirch) {
    console.log('%c[maplebirch] 错误: 核心系统未初始化', 'color: #C62828; font-weight: bold;');
    return;
  }

  const maplebirch = window.maplebirch;

  class NPCManager {
    static baseNPC = {
      "chastity": { penis: "", vagina: "", anus: "" },
      "location": {},
      "skills": {},
      "pronouns": {},
      "traits": []
    }
    // 不安感 力量-外貌-道德-技术
    static insecurity = ['weak', 'looks', 'ethics', 'skill']
    // 眼睛颜色
    static eyeColor = ['purple', 'dark blue', 'light blue', 'amber', 'hazel', 'green', 'red', 'pink', 'grey', 'light grey', 'lime green']
    // 头发颜色
    static hairColor = ['red', 'black', 'brown', 'lightbrown', 'blond', 'platinumblond', 'strawberryblond', 'ginger']
    // 基本命名NPC数据
    static baseNamedNPC = {
      penis : 0         , // 阴茎
      vagina: 0         , // 阴道
      gender: "none"    , // 性别
      description: 0    , // 描述
      title: 0          , // 头衔
      insecurity: 0     , // 不安感
      pronoun: "none"   , // 代词
      penissize: 0      , // 阴茎尺寸
      penisdesc: "none" , // 阴茎描述
      bottomsize: 0     , // 臀部尺寸
      ballssize: 0      , // 睾丸尺寸
      breastsize: 0     , // 胸部尺寸
      breastdesc: 0     , // 胸部描述
      breastsdesc: 0    , // 胸部描述
      skincolour: 0     , // 皮肤颜色
      teen: 0           , // 是否青少年
      adult: 0          , // 是否成人人
      init: 0           , // 是否遇见
      intro: 0          , // 介绍
      type: "none"      , // 种族
      trust: 0          , // 自信
      love: 0           , // 好感
      dom: 0            , // 支配
      lust: 0           , // 性欲
      rage: 0           , // 阶段
      state: ""         , // 状态
      trauma: 0         , // 创伤
      eyeColour: 0      , // 眼睛颜色
      hairColour: 0     , // 头发颜色
      chastity: {
        penis: ""       , // 阴茎童贞
        vagina: ""      , // 阴道童贞
        anus: ""        , // 肛门童贞
      },
      virginity: {}     , // 贞洁
    }
    // 童贞类型
    static virginityTypes = {
      anal:         false, // 肛门
      oral:         false, // 口腔
      penile:       false, // 阴茎
      vaginal:      false, // 阴道
      handholding:  false, // 牵手
      temple:       false, // 神殿
      kiss:         false, // 接吻
    }
    
    constructor() {
      this.lang = maplebirch.lang;
      this.tool = null;
      this.log = null;
      this.ready = false;
      this.data = {};
      this.pregnancy = {
        // 不孕
        infertile: ['Bailey', 'Leighton'],
        // 可怀孕种类
        typesEnabled: ['human', 'wolf', 'wolfboy', 'wolfgirl', 'hawk', 'harpy'],
        // 可孕
        canBePregnant: ['Alex', 'Black Wolf', 'Great Hawk']
      };
      this.importantNPCs = [];  // 恋人npc ,如罗宾
      this.specialNPCs = [];    // 特殊npc ,如幽灵
      this.NamedNPC = [];
      this.NPCNameList = [];
      this.npcConfigData = {};
      this.customStats = {};
    }

    #getNamedNPC() {
      if (!V.NPCName) return [];
      const currentNPCs = this.tool.clone(V.NPCName);
      const existingNames = [...this.NamedNPC.map(npc => npc.nam), ...this.NPCNameList];
      const newNPCs = [];
      for (const npc of currentNPCs) {
        const name = npc.nam;
        if (this.tool.contains(existingNames, [name], { mode: 'any' })) continue;
        newNPCs.push(npc);
        this.NamedNPC.push(npc);
        this.NPCNameList.push(name);
      }
      
      return [...newNPCs];
    }

    /**
     * 向NPC管理器中添加一个新NPC角色
     * @param {Object} npcData - NPC数据对象
     * @param {string} npcData.nam - NPC唯一名称（必需）
     * @param {string} [npcData.gender="f"] - 性别 (m/f/none)
     * @param {string} [npcData.type="human"] - 种族类型
     * @param {number} [npcData.trust=0] - 初始信任值
     * @param {number} [npcData.love=0] - 初始好感值
     * @param {number} [npcData.dom=0] - 初始支配值
     * @param {number} [npcData.lust=0] - 初始性欲值
     * @param {number} [npcData.init=0] - 是否已初始化（0/1）
     * @param {Object} [config] - NPC配置选项
     * @param {boolean} [config.important=false] - 是否重要NPC（显示在状态栏）
     * @param {boolean} [config.special=false] - 是否为特殊NPC
     * @param {Object} [translationsData] - 翻译数据对象
     * @example
     * // 添加一个名为Lily的狐狸NPC
     * npc.add({
     *   nam: "Lily",         // NPC唯一名称
     *   gender: "f",         // 女性
     *   type: "fox",         // 狐狸种族
     *   trust: 20,           // 初始信任值
     *   love: 15,            // 初始好感值
     *   init: 1,             // 已初始化
     *   breastsize: 2,       // 胸部尺寸
     *   eyeColour: "amber"   // 眼睛颜色
     * }, 
     * {  // 如果添加原版没有的状态，请配合addStats使用
     *   important: true,           // 重要npc标记
     *   love : { maxValue : 30 },  // 设置好感
     *   dom : { maxValue: 20 }	    // 设置支配
     * },
     * {
     *   "Lily": {            // 翻译数据
     *     CN: "莉莉",        // 中文翻译
     *     EN: "Lily"        // 英文原文
     *   }
     * });
     * 
     * @returns {boolean} 添加成功返回true，失败返回false
     */
    add(npcData, config, translationsData) {
      if (!npcData || !npcData.nam) {
        this.log('提供的NPC数据无效', 'ERROR');
        return false;
      }

      const npcName = npcData.nam;

      if (this.data[npcName]) {
        this.log(`NPC ${npcName} 已存在于mod数据中`, 'ERROR');
        return false;
      }
      const newNPC = this.tool.clone(NPCManager.baseNamedNPC);
      Object.assign(newNPC.virginity, NPCManager.virginityTypes);
      Object.assign(newNPC, npcData);
      
      if (!newNPC.description) newNPC.description = npcName;
      if (!newNPC.title) newNPC.title = "none";
      if (!newNPC.chastity) newNPC.chastity = {penis: "", vagina: "", anus: ""};
      if (!newNPC.insecurity) newNPC.insecurity = NPCManager.insecurity[Math.floor(Math.random() * NPCManager.insecurity.length)];
      if (!newNPC.adult && !newNPC.teen) Math.random() < 0.5 ? newNPC.adult = 1 : newNPC.teen = 1;
      if (!newNPC.type) newNPC.type = "human";
      if (!newNPC.purity) newNPC.purity = 0;
      if (!newNPC.corruption) newNPC.corruption = 0;
      if (!newNPC.eyeColour) newNPC.eyeColour = NPCManager.eyeColor[Math.floor(Math.random() * NPCManager.eyeColor.length)];
      if (!newNPC.hairColor) newNPC.hairColor = NPCManager.hairColor[Math.floor(Math.random() * NPCManager.hairColor.length)];
      this.#setPronouns(newNPC);
      this.#applyVanillaPregnancySystem(newNPC, npcName);

      if (typeof config === 'object') this.npcConfigData[npcName] = this.tool.clone(config);

      if (typeof translationsData === 'object') {
        for (const key in translationsData) {
          if (translationsData.hasOwnProperty(key)) {
            this.lang.translations.set(key, translationsData[key]);
          }
        }
      }

      this.data[npcName] = newNPC;
      this.log(`成功注入NPC: ${npcName}`, 'DEBUG')
      
      return true;
    }

    /**
     * 添加/修改NPC状态系统
     * @param {Object} statsObject - 状态配置对象
     * @param {Object} statsObject[statName] - 状态配置
     * @param {number} statsObject[statName].min - 状态最小值
     * @param {number} statsObject[statName].max - 状态最大值
     * @param {number|string} [statsObject[statName].position="secondLast"] - 在状态列表中的位置
     *        (数字索引/"first"/"last"/"secondLast")
     * @example
     * // 添加新状态"arcana"并修改现有状态"purity"
     * npc.addStats({
     *   arcana: {           // 新状态-奥秘值
     *     min: 0,           // 最小值0
     *     max: 100,         // 最大值100
     *     position: 3       // 插入到第4个位置
     *   },
     *   purity: {           // 修改现有状态-纯洁值
     *     max: 200          // 调整最大值为200
     *   }
     * });
     */
    addStats(statsObject) {
      if (!statsObject || typeof statsObject !== 'object') return;
      for (const statName in statsObject) {
        if (statsObject.hasOwnProperty(statName)) {
          const statConfig = statsObject[statName];
          const clonedConfig = this.tool.clone(statConfig);
          this.customStats[statName] = this.customStats[statName] ? this.#mergeConfigs(this.customStats[statName], clonedConfig) : clonedConfig;
        }
      }
    }

    #setPronouns(npc) {
      if (npc.pronoun) return npc;
      const random = this.tool.random;
      const gender = npc.gender || 'f';
      if (!npc.pronouns) {
        npc.pronouns = {
          he: gender === 'm' ? 'he' : 'she',
          his: gender === 'm' ? 'his' : 'her',
          hers: gender === 'm' ? 'his' : 'hers',
          him: gender === 'm' ? 'him' : 'her',
          himself: gender === 'm' ? 'himself' : 'herself',
          man: gender === 'm' ? 'man' : 'woman',
          boy: gender === 'm' ? 'boy' : 'girl',
          men: gender === 'm' ? 'men' : 'women'
        };
      }
      npc.pronoun = gender;
      if (npc?.penis === undefined || npc?.penis === null) npc.penis = gender === 'm' ? 'clothed' : 'none';
      if (npc?.penissize === undefined || npc?.penissize === null) npc.penissize = gender === 'm' ? random.get({ min: 0, max: 3 }) : 0;
      if (npc?.penisdesc === undefined || npc?.penisdesc === null) npc.penisdesc = gender === 'm' ? 'penis' : 'none';
      if (npc?.vagina === undefined || npc?.vagina === null) npc.vagina = gender === 'm' ? 'none' : 'clothed';
      if (npc?.breastdesc === undefined) npc.breastdesc = 'breast';
      if (npc?.breastsdesc === undefined) npc.breastsdesc = 'breasts'; // 有些难以理解但最后都写
      if (!npc?.outfits || !Array.isArray(npc.outfits)) npc.outfits = [];
      const defaultOutfit = gender === 'm' ? 'maleDefault' : 'femaleDefault';
      if (npc?.outfits?.includes(defaultOutfit) === false) npc.outfits.push(defaultOutfit);
      return npc;
    }

    #applyVanillaPregnancySystem(npc, name) {
      const random = this.tool.random;
      if (npc.pregnancy === undefined) npc.pregnancy = {};
      const pregnancy = npc.pregnancy;
      
      // 检查是否需要初始化怀孕系统
      const isInfertile = this.pregnancy.infertile.includes(name);
      const typeEnabled = this.pregnancy.typesEnabled.includes(npc.type);
      const canBePregnant = this.pregnancy.canBePregnant.includes(name);
      const pregnancyEnabledUndefined = pregnancy.enabled === undefined;
      const incompletePregnancyDisable = V.incompletePregnancyDisable;
      
      const shouldInitialize = !isInfertile && typeEnabled && 
      ((incompletePregnancyDisable === "f" && pregnancyEnabledUndefined && 
      !setup.pregnancy.ignoresIncompleteCheck.includes(name)) || (canBePregnant && 
      pregnancyEnabledUndefined));
      
      if (shouldInitialize) {
        pregnancy.fetus = [];           // 胎儿
        pregnancy.givenBirth = 0;       // 已分娩次数
        pregnancy.totalBirthEvents = 0; // 总分娩事件
        pregnancy.timer = null;         // 怀孕计时器
        pregnancy.timerEnd = null;      // 预产期
        pregnancy.waterBreaking = null; // 破羊水时间
        pregnancy.npcAwareOf = null;    // NPC知晓怀孕的时间
        pregnancy.pcAwareOf = null;     // 玩家知晓怀孕的时间
        pregnancy.type = null;          // 胎儿种族
        pregnancy.enabled = true;       // 怀孕系统启用状态
        pregnancy.cycleDaysTotal = random.get({ min: 24, max: 32 }); // 月经周期总天数
        pregnancy.cycleDay = random.get({ min: 1, max: pregnancy.cycleDaysTotal }); // 当前周期天数
        pregnancy.cycleDangerousDay = 10; // 危险期起始日
        pregnancy.sperm = [];  // 精子信息
        pregnancy.potentialFathers = []; // 潜在父亲列表
        pregnancy.nonCycleRng = [random.get({ min: 0, max: 3 }), random.get({ min: 0, max: 3 })];  // 非周期随机因子
        pregnancy.pills = null; // 药物使用情况
      } else if (isInfertile || (!canBePregnant && incompletePregnancyDisable !== "f")) {
        npc.pregnancy = {};
      }
      if (!npc.pregnancyAvoidance || V.objectVersion?.pregnancyAvoidance === undefined) npc.pregnancyAvoidance = 100;
    }

    #clearInvalidNpcs() {
      this.log(`开始解析npc...`, 'DEBUG', this.tool.clone(V.NPCName), this.tool.clone(setup.NPCNameList));
      const Names = V.NPCName.map(npc => npc.nam);
      const needsCleaning = !this.tool.contains(Names, setup.NPCNameList, { mode: 'all' }) || !this.tool.contains(setup.NPCNameList, Names, { mode: 'all' });
      if (!needsCleaning) return false;
      const validNamesSet = new Set(setup.NPCNameList);
      V.NPCName = V.NPCName.filter(npc => validNamesSet.has(npc.nam));
      V.NPCNameList = [...setup.NPCNameList];
      this.log(`清理了 ${Names.length - V.NPCName.length} 个无效NPC`, 'DEBUG');
      return true;
    }

    #onUpdate() {
      let addedCount = 0;
      let skippedCount = 0;
      const modUtils = window.modUtils;
      const existingNames = [...this.NamedNPC.map(npc => npc.nam), ...this.NPCNameList];
      
      for (const npcName in this.data) {
        if (this.data.hasOwnProperty(npcName)) {
          const modNPC = this.data[npcName];
          if (this.tool.contains(existingNames, [npcName], { mode: 'any' })) {
            this.log.warn(`NPC名称冲突: ${npcName} 已存在，跳过添加`, 'WARN');
            skippedCount++;
            continue;
          }
          this.NamedNPC.push(modNPC);
          this.NPCNameList.push(npcName);
          addedCount++;
          this.log(`注入模组NPC到内部状态: ${npcName}`, 'DEBUG');
        }
      }
      if (modUtils.getMod('ModI18N')) this.#vanillaNPCTranslations();
      this.log(`更新完成: 添加 ${addedCount} 个NPC, 跳过 ${skippedCount} 个重复NPC`, 'DEBUG');
      return true;
    }

    #vanillaNPCTranslations() {
      if (!setup.NPCNameList_cn_name) return;
      const npcNames = Object.keys(setup.NPCNameList_cn_name);
      for (const npcName of npcNames) {
        const cnTranslation = setup.NPCNameList_cn_name[npcName][0];
        if (!maplebirch.lang.translations.has(npcName)) {
            maplebirch.lang.translations.set(npcName, {
              EN: npcName,
              CN: cnTranslation
            });
        } else {
          const existing = maplebirch.lang.translations.get(npcName);
          existing.CN = cnTranslation;
          existing.EN = npcName;
        }
      }
    }

    #updateCNPCProxy() {
      if (typeof C.npc === 'undefined') C.npc = {};
      for (const name of setup.NPCNameList) {
        if (C.npc.hasOwnProperty(name)) continue;
        const index = setup.NPCNameList.indexOf(name);
        Object.defineProperty(C.npc, name, {
          get: () => V.NPCName[index],
          set: (val) => V.NPCName[index] = val,
        });
        this.log('更新 C.npc 代理映射', 'DEBUG');
      }
    }

    injectModNPCs() {
      if (this.ready) return
      this.#getNamedNPC();
      this.#clearInvalidNpcs();
      this.#onUpdate();
      const globalNPCs = V.NPCName;
      const globalNameList = setup.NPCNameList;
      let injectedCount = 0;
      for (const npcName in this.data) {
        if (this.data.hasOwnProperty(npcName)) {
          const modNPC = this.data[npcName];
          if (globalNameList.includes(npcName)) continue;
          globalNPCs.push(modNPC);
          globalNameList.push(npcName);
          injectedCount++;
        }
      }
      V.NPCName = globalNPCs;
      setup.NPCNameList = globalNameList;
      this.#updateCNPCProxy();
      this.log(`模组NPC注入完成: 添加 ${injectedCount} 个NPC`, 'DEBUG');
      return this.ready = true;
    }

    #mergeConfigs(base, mod) {
      if (typeof base !== 'object' || typeof mod !== 'object') return mod !== undefined ? mod : base;
      if (Array.isArray(base) || Array.isArray(mod)) return this.tool.clone(mod);
      const result = this.tool.clone(base);
      Object.keys(mod).forEach(key => {
        if (mod[key] !== null && typeof mod[key] === 'object') {
          result[key] = this.#mergeConfigs(result[key] || {}, mod[key]);
        } else {
          result[key] = this.tool.clone(mod[key]);
        }
      });
      return result;
    }

    vanillaNPCConfig(npcConfig) {
      if (!npcConfig || typeof npcConfig !== 'object') return {};
      const Config = this.tool.clone(npcConfig);
      for (const npcName in this.npcConfigData) {
        if (this.npcConfigData.hasOwnProperty(npcName)) {
          const modConfig = this.npcConfigData[npcName];
          if (Config[npcName]) {
            Config[npcName] = this.#mergeConfigs(Config[npcName], modConfig);
            this.log(`合并NPC配置: ${npcName}` , 'DEBUG');
          } else {
            Config[npcName] = modConfig;
            this.log(`添加新NPC配置: ${npcName}`, 'DEBUG');
          }
        }
      }
      T.importantNpcOrder.pushUnique(...this.importantNPCs);
      T.specialNPCs.pushUnique(...this.specialNPCs);
      return T.npcConfig = Config;
    }

    applyStatDefaults(statDefaults) {
      if (!statDefaults || typeof statDefaults !== 'object') return statDefaults || {};
      for (const statName in this.customStats) {
        if (this.customStats.hasOwnProperty(statName)) {
          const customConfig = this.tool.clone(this.customStats[statName]);
          const position = customConfig.position;
          delete customConfig.position;
          if (statDefaults[statName]) {
            statDefaults[statName] = this.#mergeConfigs(statDefaults[statName], customConfig);
          } else {
            statDefaults[statName] = customConfig;
          }
          if (position !== false) {
            if (!T.importantNpcStats.includes(statName)) {
              let insertPosition;
              if (typeof position === 'number') {
                insertPosition = Math.max(0, Math.min(position, T.importantNpcStats.length));
              } else if (position === 'first') {
                insertPosition = 0;
              } else if (position === 'last') {
                insertPosition = T.importantNpcStats.length;
              } else {
                insertPosition = Math.max(0, T.importantNpcStats.length - 1);
              }    
              T.importantNpcStats.splice(insertPosition, 0, statName);
            }
          }
        }
      }
      return statDefaults;
    }

    _vanillaNPCInit(...args) {
      const nam = args[0];
      const idx = V.NPCNameList.indexOf(nam);
      V.NPCName[idx][Object.keys(maplebirch.npc.customStats)] = 0;
    }

    _npcList(maxValue) {
      const maxNPC = (typeof maxValue === "number") ? maxValue : 7;
      const NPCList = [];
      const existingNPCs = V.maplebirch.npcList || [];
      for (let idx = 0; idx < maxNPC; ++idx) {
        NPCList.push(this.tool.clone(NPCManager.baseNPC));
        if (existingNPCs.length > idx && existingNPCs[idx].description) {
          const npc = NPCList[idx];
          Object.assign(npc, existingNPCs[idx]);
          npc.index = idx;
          if (!npc.type) npc.type = "human";
        }
      }
      V.maplebirch.npcList = this.tool.clone(NPCList);
    }

    preInit() {
      this.tool = maplebirch.tool;
      this.log = this.tool.createLogger('npc');
    }

    Init() {
      if (!this.tool.contains(['Start', 'Downgrade Waiting Room'], [maplebirch.state.passage.title], { mode: 'any' })) {
        this.injectModNPCs();
        this._npcList();
        maplebirch.on(':onLoad', () => {
          this.ready = false;
          this.injectModNPCs();
        }, 3, 'npcinject');
      }
    }
  }

  maplebirch.register('npc', new NPCManager(), ['var']);
})();