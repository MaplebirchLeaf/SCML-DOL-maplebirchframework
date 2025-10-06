(async() => {
  if (!window.maplebirch) {
    console.log('%c[maplebirch] 错误: 核心系统未初始化', 'color: #C62828; font-weight: bold;');
    return;
  }

  const maplebirch = window.maplebirch;

  class createNPC {
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

    // 性别代词映射表
    static pronounsMap = {
      m: {
        CN: { he: "他", his: "他的", hers: "他的", him: "他", himself: "他自己", man: "男人", boy: "男孩", men: "男人们" },
        EN: { he: "he", his: "his", hers: "his", him: "him", himself: "himself", man: "man", boy: "boy", men: "men" }
      },
      f: {
        CN: { he: "她", his: "她的", hers: "她的", him: "她", himself: "她自己", man: "女人", boy: "女孩", men: "女人们" },
        EN: { he: "she", his: "her", hers: "hers", him: "her", himself: "herself", man: "woman", boy: "girl", men: "women" }
      },
      i: {
        CN: { he: "它", his: "它的", hers: "它的", him: "它", himself: "它自己", man: "那个东西", boy: "小家伙", men: "它们" },
        EN: { he: "it", his: "its", hers: "its", him: "it", himself: "itself", man: "thing", boy: "little one", men: "them" }
      },
      n: {
        CN: { he: "她", his: "她的", hers: "她的", him: "她", himself: "她自己", man: "人", boy: "孩子", men: "人们" },
        EN: { he: "they", his: "their", hers: "theirs", him: "them", himself: "themself", man: "person", boy: "kid", men: "people" }
      },
      t: {
        CN: { he: "他们", his: "他们的", hers: "他们的", him: "他们", himself: "他们自己", man: "人", boy: "孩子们", men: "大家" },
        EN: { he: "they", his: "their", hers: "theirs", him: "them", himself: "themselves", man: "people", boy: "kids", men: "everyone" }
      }
    };

    // 童贞类型
    static virginityTypes = {
      anal:         true, // 肛门
      oral:         true, // 口腔
      penile:       true, // 阴茎
      vaginal:      true, // 阴道
      handholding:  true, // 牵手
      temple:       false,// 神殿
      kiss:         true, // 接吻
    }

    /**
     * 向NPC管理器中添加一个新NPC角色
     * @param {Object} manager - NPC管理器实例
     * @param {Object} npcData - NPC数据对象
     * @param {string} npcData.nam - NPC唯一名称（必需）
     * @param {string} [npcData.title] - NPC的称号
     * @param {string} [npcData.gender="f"] - 性别 (m/f/none)
     * @param {string} [npcData.type="human"] - 种族类型
     * @param {Object} [config] - NPC配置选项
     * @param {string[]} [config.loveAlias] - NPC的好感别称数组 [CN, EN]
     * @param {boolean} [config.important=false] - 是否重要NPC（显示在状态栏）
     * @param {boolean} [config.special=false] - 是否为特殊NPC
     * @param {boolean} [config.loveInterest=false] - 是否为恋爱NPC
     * @param {Object} [translationsData] - 翻译数据对象
     * @returns {boolean} 添加成功返回true，失败返回false
     */
    static add(manager, npcData, config, translationsData) {
      if (!npcData || !npcData.nam) {
        manager.log('提供的NPC数据无效', 'ERROR');
        return false;
      }
      const npcName = npcData.nam;
      if (manager.data[npcName]) {
        manager.log(`NPC ${npcName} 已存在于mod数据中`, 'ERROR');
        return false;
      }
      const newNPC = manager.tool.clone(createNPC.baseNamedNPC);
      for (const statName in manager.customStats) {
        if (manager.customStats.hasOwnProperty(statName)) {
          if (npcData[statName] === undefined) newNPC[statName] = 0;
        }
      }
      
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
      createNPC.#setPronouns(manager, newNPC);
      createNPC.#applyVanillaPregnancySystem(manager, newNPC, npcName);
      if (typeof config === 'object') manager.npcConfigData[npcName] = manager.tool.clone(config);
      if (typeof translationsData === 'object') {
        for (const key in translationsData) {
          if (translationsData.hasOwnProperty(key)) {
            manager.lang.translations.set(key, translationsData[key]);
          }
        }
      }
      manager.data[npcName] = newNPC;
      manager.log(`成功注入NPC: ${npcName}`, 'DEBUG')
      return true;
    }

    static #generatePronouns(gender) {
      const lang = modUtils.getMod('ModI18N') ? 'CN' : 'EN';
      const data = createNPC.pronounsMap[gender] || createNPC.pronounsMap.n;
      return data[lang] || data.EN;
    }

    static #setPronouns(manager, npc) {
      if (npc.pronoun && npc.pronoun !== "none") return npc;
      const random = manager.tool.random;
      let pronoun = npc.gender || "f";
      if (pronoun === 'h') pronoun = 'n';
      npc.pronoun = pronoun;
      if (!npc.pronouns) npc.pronouns = createNPC.#generatePronouns(pronoun);
      if (!npc.penis) npc.penis = pronoun === "m" || pronoun === "h" ? 'clothed' : 'none';
      if (!npc.penissize) npc.penissize = pronoun === "m" || pronoun === "h" ? random.get({ min: 1, max: 3 }) : 0;
      if (!npc.penisdesc) npc.penisdesc = pronoun === "m" || pronoun === "h" ? 'penis' : 'none';
      if (!npc.vagina) npc.vagina = pronoun === "f" || pronoun === "h" ? 'clothed' : 'none';
      if (!npc.breastsize) npc.breastsize = pronoun === "f" || pronoun === "h" ? random.get({ min: 1, max: 3 }) : 0;
      if (!npc.outfits || !Array.isArray(npc.outfits)) npc.outfits = [];
      const defaultOutfit = pronoun === "m" ? 'maleDefault' : pronoun === "f" ? 'femaleDefault' : 'neutralDefault';
      if (!npc.outfits.includes(defaultOutfit)) npc.outfits.push(defaultOutfit);
      return npc;
    }

    static #applyVanillaPregnancySystem(manager, npc, name) {
      const random = manager.tool.random;
      if (npc.pregnancy === undefined) npc.pregnancy = {};
      const pregnancy = npc.pregnancy;
      // 检查是否需要初始化怀孕系统
      const isInfertile = manager.pregnancy.infertile.includes(name);
      const typeEnabled = manager.pregnancy.typesEnabled.includes(npc.type);
      const canBePregnant = manager.pregnancy.canBePregnant.includes(name);
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
  }

  class NPCManager {
    static createNPC = createNPC;
    // 基本一般NPC数据
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
    // 替换原版 <<generatePronouns>>
    static #defineGeneratePronouns(widget) {
      widget.defineMacro('generatePronouns', function() {
        const npc = this.args[0];
        const key = npc.pronoun || "f";
        const lang = modUtils.getMod('ModI18N') ? 'CN' : 'EN';
        const data = createNPC.pronounsMap[key] || createNPC.pronounsMap.f;
        const pronouns = data[lang] || data.EN;
        if (!npc.pronouns) npc.pronouns = {};
        Object.assign(npc.pronouns, pronouns);
      });
    }

    static #npcSeenProperty(name) {
      const npcName = name.replace(/\s+/g, '');
      const SeenName = npcName + 'Seen';
      const FirstSeenName = npcName + 'FirstSeen';
      if (V[SeenName] !== undefined) {
        let seenValue = V[SeenName];
        Object.defineProperty(V.maplebirch.npc[name], 'Seen', {
          get: () => seenValue,
          set: (val) => { seenValue = val; V[SeenName] = val; }
        });
        Object.defineProperty(V, SeenName, {
          get: () => seenValue,
          set: (val) => { seenValue = val; V.maplebirch.npc[name].Seen = val; }
        });
      }
      if (V[FirstSeenName] !== undefined) {
        let firstSeenValue = V[FirstSeenName];
        Object.defineProperty(V.maplebirch.npc[name], 'FirstSeen', {
          get: () => firstSeenValue,
          set: (val) => { firstSeenValue = val; V[FirstSeenName] = val; }
        });
        Object.defineProperty(V, FirstSeenName, {
          get: () => firstSeenValue,
          set: (val) => { firstSeenValue = val; V.maplebirch.npc[name].FirstSeen = val; }
        });
      }
    }
    
    constructor() {
      this.lang = maplebirch.lang;
      this.tool = null;
      this.log = null;
      this.data = {};
      this.pregnancy = {
        // 不孕
        infertile: ['Bailey', 'Leighton'],
        // 可怀孕种类
        typesEnabled: ['human', 'wolf', 'wolfboy', 'wolfgirl', 'hawk', 'harpy'],
        // 可孕
        canBePregnant: ['Alex', 'Black Wolf', 'Great Hawk']
      };
      this.loveAlias = {}         // 好感状态别称
      this.loveInterestNpcs = []; // 可恋爱npc ,如罗宾
      this.importantNPCs = [];    // 重要npc ,如罗宾
      this.specialNPCs = [];      // 特殊npc ,如幽灵
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

    add(npcData, config, translationsData) {
      return createNPC.add(this, npcData, config, translationsData);
    }

    /**
     * 添加/修改NPC状态系统
     * @param {Object} statsObject - 状态配置对象
     * @param {Object} statsObject[statName] - 状态配置
     * @param {number} statsObject[statName].min - 状态最小值
     * @param {number} statsObject[statName].max - 状态最大值
     * @param {number|string} [statsObject[statName].position="secondLast"] - 在状态列表中的位置(数字索引/"first"/"last"/"secondLast")
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

    #clearInvalidNpcs() {
      setup.NPCNameList = [...new Set([...setup.NPCNameList, ...Object.keys(this.data)])];
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
            skippedCount++;
            continue;
          }
          this.NamedNPC.push(modNPC);
          this.NPCNameList.push(npcName);
          addedCount++;
          this.log(`注入模组NPC到内部状态: ${npcName}`, 'DEBUG');
        }
      }
      V.NPCName = [...this.NamedNPC];
      if (modUtils.getMod('ModI18N')) this.#vanillaNPCTranslations();
      this.log(`更新完成: 添加 ${addedCount} 个NPC, 跳过 ${skippedCount} 个重复NPC`, 'DEBUG');
      return true;
    }

    #updateNPCdata() {
      for (const npcId in this.npcConfigData) {
        if (Object.prototype.hasOwnProperty.call(this.npcConfigData, npcId)) {
          const config = this.npcConfigData[npcId];
          if (config && typeof config === 'object') {
            if (config.important === true && !this.importantNPCs.includes(npcId)) this.importantNPCs.push(npcId);
            if (config.special === true && !this.specialNPCs.includes(npcId)) this.specialNPCs.push(npcId);
            if (config.loveInterest === true && !this.loveInterestNpcs.includes(npcId)) this.loveInterestNpcs.push(npcId);
          }
        }
      }
    }

    #setupLoveAlias(npcName, loveAliasConfig) {
      if (typeof loveAliasConfig === 'function') {
        setup.loveAlias[npcName] = loveAliasConfig;
      } else if (Array.isArray(loveAliasConfig) && loveAliasConfig.length >= 2) {
        const [cnAlias, enAlias] = loveAliasConfig;
        setup.loveAlias[npcName] = () => maplebirch.Language === 'CN' ? cnAlias : enAlias;
      } else {
        setup.loveAlias[npcName] = () => maplebirch.Language === 'CN' ? '好感' : 'Affection';
      }
    }

    #processSetup() {
      setup.loveInterestNpc = [...new Set([...setup.loveInterestNpc, ...this.loveInterestNpcs])];
      for (const npcName of Object.keys(this.npcConfigData)) {
        const config = this.npcConfigData[npcName];
        this.#setupLoveAlias(npcName, config.loveAlias);
      }
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
      this.#getNamedNPC();
      this.#clearInvalidNpcs();
      this.#onUpdate();
      this.#updateNPCdata();
      this.#processSetup();
      this.#updateCNPCProxy();
    }

    #mergeConfigs(base, mod) {
      const filterFn = (key, value, depth) => {return Object.prototype.hasOwnProperty.call(mod, key);}
      return maplebirch.tool.merge(base, mod, {arrayBehaviour: "replace", filterFn});
    }

    vanillaNPCConfig(npcConfig) {
      if (!npcConfig || typeof npcConfig !== 'object') return {};
      const Config = this.tool.clone(npcConfig);
      for (const npcName in this.npcConfigData) {
        if (Object.prototype.hasOwnProperty.call(this.npcConfigData, npcName)) {
          const modConfig = this.npcConfigData[npcName];
          delete modConfig.loveAlias;
          delete modConfig.loveInterest;
          if (Config[npcName]) {
            Config[npcName] = this.#mergeConfigs(Config[npcName], modConfig);
            this.log(`合并NPC配置: ${npcName}`, 'DEBUG');
          } else {
            Config[npcName] = modConfig;
            this.log(`添加新NPC配置: ${npcName}`, 'DEBUG');
          }
        }
      }
      if (Array.isArray(T.importantNpcOrder)) this.importantNPCs.forEach(id => T.importantNpcOrder.pushUnique(id));
      if (Array.isArray(T.specialNPCs)) this.specialNPCs.forEach(id => T.specialNPCs.pushUnique(id));
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

    #npcList(maxValue) {
      const maxNPC = (typeof maxValue === "number") ? maxValue : 7;
      const NPCList = [];
      const existingNPCs = V.maplebirch.combat.npcList || [];
      for (let idx = 0; idx < maxNPC; ++idx) {
        NPCList.push(this.tool.clone(NPCManager.baseNPC));
        if (existingNPCs.length > idx && existingNPCs[idx].description) {
          const npc = NPCList[idx];
          Object.assign(npc, existingNPCs[idx]);
          npc.index = idx;
          if (!npc.type) npc.type = "human";
        }
      }
      V.maplebirch.combat.npcList = this.tool.clone(NPCList);
    }

    #npcData() {
      const NPCNameList = this.NPCNameList;
      NPCNameList.forEach(npcName => {
        const name = npcName.toLowerCase();
        if (!V.maplebirch.npc[name]) V.maplebirch.npc[name] = {};
        if (!V.maplebirch.npc[name].Seen) V.maplebirch.npc[name].Seen = [];
        if (!V.maplebirch.npc[name].FirstSeen) V.maplebirch.npc[name].FirstSeen = '';
        if (!V.maplebirch.npc[name].bodydata) V.maplebirch.npc[name].bodydata = {};
        if (!V.maplebirch.npc[name].clothes) V.maplebirch.npc[name].clothes = {};
        NPCManager.#npcSeenProperty(name);
      });
    }

    preInit() {
      this.tool = maplebirch.tool;
      this.log = this.tool.createLogger('npc');
      maplebirch.once(':passagestart',() => {
        if (this.tool.contains(['Start', 'Downgrade Waiting Room'], [maplebirch.state.passage.title], { mode: 'any' })) return;
        this.injectModNPCs();
      });
      maplebirch.once(':finally', () => NPCManager.#defineGeneratePronouns(this.tool.widget))
    }

    Init() {
      this.#npcList();
    }

    loadInit() {
      this.injectModNPCs();
      this.#npcList();
    }

    postInit() {
      this.#npcData();
    }
  }

  await maplebirch.register('npc', new NPCManager(), ['var']);
})();