(async() => {
  'use strict';
  if (!window.maplebirch) {
    console.log('%c[maplebirch] 错误: 核心系统未初始化', 'color: #C62828; font-weight: bold;');
    return;
  }

  const maplebirch = window.maplebirch

  const NamedNPC = (() => {
    'use strict';
    // 不安感 力量-外貌-道德-技术
    const insecurity = ['weak', 'looks', 'ethics', 'skill'];
    // 眼睛颜色
    const eyeColour = ['purple', 'dark blue', 'light blue', 'amber', 'hazel', 'green', 'red', 'pink', 'grey', 'light grey', 'lime green']
    // 头发颜色
    const hairColour = ['red', 'black', 'brown', 'lightbrown', 'blond', 'platinumblond', 'strawberryblond', 'ginger']
    // 童贞类型
    const virginityTypes = {
      anal:         true, // 肛门
      oral:         true, // 口腔
      penile:       true, // 阴茎
      vaginal:      true, // 阴道
      handholding:  true, // 牵手
      temple:       false,// 神殿
      kiss:         true, // 接吻
    }
    // 性别代词映射表
    const pronounsMap = {
      m: {
        CN: { he: '他', his: '他的', hers: '他的', him: '他', himself: '他自己', man: '男人', boy: '男孩', men: '男人们' },
        EN: { he: 'he', his: 'his', hers: 'his', him: 'him', himself: 'himself', man: 'man', boy: 'boy', men: 'men' }
      },
      f: {
        CN: { he: '她', his: '她的', hers: '她的', him: '她', himself: '她自己', man: '女人', boy: '女孩', men: '女人们' },
        EN: { he: 'she', his: 'her', hers: 'hers', him: 'her', himself: 'herself', man: 'woman', boy: 'girl', men: 'women' }
      },
      i: {
        CN: { he: '它', his: '它的', hers: '它的', him: '它', himself: '它自己', man: '那个东西', boy: '小家伙', men: '它们' },
        EN: { he: 'it', his: 'its', hers: 'its', him: 'it', himself: 'itself', man: 'thing', boy: 'little one', men: 'them' }
      },
      n: {
        CN: { he: '她', his: '她的', hers: '她的', him: '她', himself: '她自己', man: '人', boy: '孩子', men: '人们' },
        EN: { he: 'they', his: 'their', hers: 'theirs', him: 'them', himself: 'themself', man: 'person', boy: 'kid', men: 'people' }
      },
      t: {
        CN: { he: '他们', his: '他们的', hers: '他们的', him: '他们', himself: '他们自己', man: '人', boy: '孩子们', men: '大家' },
        EN: { he: 'they', his: 'their', hers: 'theirs', him: 'them', himself: 'themselves', man: 'people', boy: 'kids', men: 'everyone' }
      }
    };
    // 身体部位映射表
    const bodyPartMap = {
      penis: {
        CN: [['细小阴茎','废物阴茎','可怜阴茎','小小阴茎','迷你阴茎','微型阴茎'],'阴茎',['厚重肉棒','笨重肉棒','大号肉棒','粗大肉棒','狰狞肉棒','肥厚肉棒'],['硕大肉棒','庞大肉棒','巨大肉棒','极大肉棒','超大肉棒','宏伟肉棒']],
        EN: [['tiny penis','pathetic cock','little penis','small penis','mini penis','micro penis'],'penis',['thick cock','hefty cock','big cock','large cock','veiny cock','meaty cock'],['massive cock','huge cock','humongous cock','immense cock','gigantic cock','enormous cock']]
      },
      breast: {
        CN: ['乳头','微隆的','小巧的','偏小的','坚挺的','适中的','饱满的','硕大的','丰腴的','高耸的','巨大的','庞大的','宏伟的'],
        EN: ['nipple','budding','tiny','small','pert','modest','full','large','ample','massive','huge','gigantic','enormous']
      },
      bottom: {
        CN: ['纤巧的', '苗条的', '适中的', '软弹的', '柔软的', '圆润的', ' 丰满的', '硕大的', '巨大的'],
        EN: ['slender', 'slim', 'modest', 'cushioned', 'soft', 'round', 'plump', 'large', 'huge']
      },
      balls: {
        CN: [['未发育的','极小的'],['小巧的','玲珑的'],'',['饱满的','有弹性的'],['硕大的','沉重的','肥硕的'],['巨大的','夸张的','宏伟的']],
        EN: [['undeveloped', 'tiny'], ['dainty', 'compact'], '', ['full', 'resilient'], ['large', 'heavy', 'massive'], ['huge', 'exaggerated', 'enormous']]
      }
    }

    function add(manager, npcData, config, translationsData) {
      if (!npcData || !npcData.nam) { manager.log('提供的NPC数据无效', 'ERROR'); return false; }
      const npcName = npcData.nam; let npcConfig = manager.tool.clone(config);
      if (manager.data.has(npcName)) { manager.log(`NPC ${npcName} 已存在于mod数据中`, 'ERROR'); return false; }
      if (typeof npcConfig !== 'object') npcConfig = {};
      if (Object.keys(npcConfig).length === 0) npcConfig.love = { maxValue: 50 };
      const newNPC = new NamedNPC(manager, npcData);
      for (const statName in manager.customStats) if (manager.customStats.hasOwnProperty(statName) && npcData[statName] === undefined) newNPC[statName] = 0;
      if (typeof translationsData === 'object') for (const key in translationsData) if (translationsData.hasOwnProperty(key)) manager.lang.translations.set(key, translationsData[key]);
      manager.data.set(npcName, { Data: newNPC, Config: npcConfig });
      manager.log(`成功注入NPC: ${npcName}`, 'DEBUG');
      return true;
    }

    class NamedNPC {
      constructor(manager, data) {
        if (!data.nam) manager.log('NamedNPC必须存在nam', 'ERROR');
        this.nam = data.nam;
        this.gender = data.gender ?? manager.tool.either(['m', 'f', 'h', 'n'], { weights: [0.47, 0.47, 0.05, 0.01] });;
        this.title = data.title ?? 'none';
        this.description = data.description ?? this.nam;
        this.type = data.type ?? 'human';
        this.adult = data.adult ?? 0;
        this.teen = data.teen ?? 0;
        if (!this.adult && !this.teen) this.adult = manager.tool.random(1), this.teen = this.adult ? 0 : 1;
        this.insecurity = data.insecurity ?? manager.tool.either(insecurity);
        this.chastity = typeof data.chastity === 'object' ? data.chastity : {penis: '', vagina: '', anus: ''};
        this.virginity = typeof data.virginity === 'object' ? data.virginity : virginityTypes;
        this.eyeColour = data.eyeColour ?? manager.tool.either(eyeColour);
        this.hairColour = data.hairColour ?? manager.tool.either(hairColour);
        this.pronoun = data.pronoun ?? this.gender;
        maplebirch.modUtils.getMod('ModI18N') ? this.pronouns = pronounsMap[this.gender].CN : Object.defineProperty(this, 'pronouns', { get: () => pronounsMap[this.gender][maplebirch.Language] });
        this.#setPronouns(manager, data);
        this.bottomsize = data.bottomsize ?? manager.tool.random(4);
        this.#bodyPartdescription(manager);
        this.pregnancy = data.pregnancy ?? null;
        this.#applyVanillaPregnancySystem(manager);
        this.skincolour = data.skincolour ?? 0;
        this.init = data.init ?? 0;
        this.intro = data.intro ?? 0;
      }

      #setPronouns(manager, data) {
        const random = manager.tool.random;
        switch (this.gender) {
          case 'm':
            this.penis = data.penis ?? 'clothed';
            this.penissize = data.penissize ?? random(1, 3);
            this.penisdesc = data.penisdesc ?? 'penis';
            this.vagina = data.vagina ?? 'none';
            this.breastsize = data.breastsize ?? 0;
            this.breastdesc = data.breastdesc ?? 'none';
            this.ballssize = data.ballssize ?? random(2, 4);
            break;
          case 'f':
            this.penis = data.penis ?? 'none';
            this.penissize = data.penissize ?? 0;
            this.penisdesc = data.penisdesc ?? 'none';
            this.vagina = data.vagina ?? 'clothed';
            this.breastsize = data.breastsize ?? random(1, 3);
            this.breastdesc = data.breastdesc ?? 'breasts';
            this.ballssize = data.ballssize ?? 0;
            break;
          case 'h':
            this.penis = data.penis ?? 'clothed';
            this.penissize = data.penissize ?? random(1, 3);
            this.penisdesc = data.penisdesc ?? 'penis';
            this.vagina = data.vagina ?? 'clothed';
            this.breastsize = data.breastsize ?? random(1, 3);
            this.breastdesc = data.breastdesc ?? 'breasts';
            this.ballssize = data.ballssize ?? random(2, 4);
            break;
          case 'n':
          default:
            this.penis = data.penis ?? 'none';
            this.penissize = data.penissize ?? 0;
            this.penisdesc = data.penisdesc ?? 'none';
            this.vagina = data.vagina ?? 'none';
            this.breastsize = data.breastsize ?? 0;
            this.breastdesc = data.breastdesc ?? 'none';
            this.ballssize = data.ballssize ?? 0;
            break;
        }
        this.outfits = Array.isArray(data.outfits) ? data.outfits : this.outfits = [];
        let defaultOutfit = 'femaleDefault';
        switch (this.gender) {
          case 'm': defaultOutfit = 'maleDefault'; break;
          case 'f': defaultOutfit = 'femaleDefault'; break;
          case 'h': defaultOutfit = 'hermDefault'; break;
          case 'n': defaultOutfit = 'neutralDefault'; break;
          default: defaultOutfit = 'femaleDefault'; break;
        }
        if (!this.outfits.includes(defaultOutfit)) this.outfits.push(defaultOutfit);
      }

      #applyVanillaPregnancySystem(manager) {
        const random = manager.tool.random;
        if (this.pregnancy == null) this.pregnancy = {};
        // 检查是否需要初始化怀孕系统
        const isInfertile = manager.pregnancy.infertile.includes(this.nam);
        const typeEnabled = manager.pregnancy.typesEnabled.includes(this.type);
        const canBePregnant = manager.pregnancy.canBePregnant.includes(this.nam);
        const pregnancyEnabledUndefined = this.pregnancy.enabled == undefined;
        const incompletePregnancyDisable = V.incompletePregnancyDisable;

        const shouldInitialize = !isInfertile && typeEnabled &&
        ((incompletePregnancyDisable === 'f' && pregnancyEnabledUndefined &&
        !setup.pregnancy.ignoresIncompleteCheck.includes(this.nam)) || (canBePregnant &&
        pregnancyEnabledUndefined));

        if (shouldInitialize) {
          this.pregnancy.fetus = [];           // 胎儿
          this.pregnancy.givenBirth = 0;       // 已分娩次数
          this.pregnancy.totalBirthEvents = 0; // 总分娩事件
          this.pregnancy.timer = null;         // 怀孕计时器
          this.pregnancy.timerEnd = null;      // 预产期
          this.pregnancy.waterBreaking = null; // 破羊水时间
          this.pregnancy.npcAwareOf = null;    // NPC知晓怀孕的时间
          this.pregnancy.pcAwareOf = null;     // 玩家知晓怀孕的时间
          this.pregnancy.type = null;          // 胎儿种族
          this.pregnancy.enabled = true;       // 怀孕系统启用状态
          this.pregnancy.cycleDaysTotal = random(24, 32); // 月经周期总天数
          this.pregnancy.cycleDay = random(1, this.pregnancy.cycleDaysTotal); // 当前周期天数
          this.pregnancy.cycleDangerousDay = 10; // 危险期起始日
          this.pregnancy.sperm = [];  // 精子信息
          this.pregnancy.potentialFathers = []; // 潜在父亲列表
          this.pregnancy.nonCycleRng = [random(3), random(3)];  // 非周期随机因子
          this.pregnancy.pills = null; // 药物使用情况
        } else if (isInfertile || (!canBePregnant && incompletePregnancyDisable !== 'f')) {
          this.pregnancy = {};
        }
        if (!this.pregnancyAvoidance || V.objectVersion?.pregnancyAvoidance == undefined) this.pregnancyAvoidance = 100;
      }

      #bodyPartdescription(manager) {
        const either = manager.tool.either;
        this.descCache = this.descCache ?? {};
        if ((this.penis === 'clothed' && this.penissize > 0) || this.penisdesc === 'penis') {
          Object.defineProperty(this, 'penisdesc', {
            get: () => {
              const cacheKey = `penis_${maplebirch.Language}_${this.penissize}`;
              if (!this.descCache[cacheKey]) this.descCache[cacheKey] = either(bodyPartMap.penis[maplebirch.Language]?.[this.penissize - 1]);
              return this.descCache[cacheKey];
            },
            set: (value) => {
              const cacheKey = `penis_${maplebirch.Language}_${this.penissize}`;
              this.descCache[cacheKey] = value;
            }
          });
        }

        if ((this.vagina === 'clothed' && this.breastsize > 0) || this.breastdesc === 'breasts') {
          Object.defineProperty(this, 'breastdesc', {
            get: () => {
              const cacheKey = `breast_${maplebirch.Language}_${this.breastsize}`;
              if (!this.descCache[cacheKey]) this.descCache[cacheKey] = either(bodyPartMap.breast[maplebirch.Language]?.[this.breastsize - 1]);
              return this.descCache[cacheKey];
            },
            set: (value) => {
              const cacheKey = `breast_${maplebirch.Language}_${this.breastsize}`;
              this.descCache[cacheKey] = value;
            }
          });
        } else {
          Object.defineProperty(this, 'breastdesc', {
            get: () => {
              const cacheKey = `breast_none_${maplebirch.Language}`;
              if (!this.descCache[cacheKey]) this.descCache[cacheKey] = either(bodyPartMap.breast[maplebirch.Language]?.[0]);
              return this.descCache[cacheKey];
            },
            set: (value) => {
              const cacheKey = `breast_none_${maplebirch.Language}`;
              this.descCache[cacheKey] = value;
            }
          });
        }

        Object.defineProperty(this, 'breastsdesc', {
          get: () => {
            const breastDesc = this.breastdesc;
            return maplebirch.Language === 'CN' ? breastDesc : breastDesc.endsWith('s') ? breastDesc : `${breastDesc}s`
          },
          set: (value) => {
            const cacheKey = `breastsdesc_${maplebirch.Language}`;
            this.descCache[cacheKey] = value;
          }
        });

        if (this.bottomsize != null) {
          Object.defineProperty(this, 'bottomdesc', {
            get: () => {
              const cacheKey = `bottom_${maplebirch.Language}_${this.bottomsize}`;
              if (!this.descCache[cacheKey]) this.descCache[cacheKey] = either(bodyPartMap.bottom[maplebirch.Language]?.[this.bottomsize]);
              return this.descCache[cacheKey];
            },
            set: (value) => {
              const cacheKey = `bottom_${maplebirch.Language}_${this.bottomsize}`;
              this.descCache[cacheKey] = value;
            }
          });
        }

        if (this.ballssize > 0) {
          Object.defineProperty(this, 'ballsdesc', {
            get: () => {
              const cacheKey = `balls_${maplebirch.Language}_${this.ballssize}`;
              if (!this.descCache[cacheKey]) this.descCache[cacheKey] = either(bodyPartMap.balls[maplebirch.Language]?.[this.ballssize - 1]);
              return this.descCache[cacheKey];
            },
            set: (value) => {
              const cacheKey = `balls_${maplebirch.Language}_${this.ballssize}`;
              this.descCache[cacheKey] = value;
            }
          });
        }
      }
    }

    function getNamedNPC(manager) {
      if (!V.NPCName) return [];
      const NamedNPCs = manager.tool.clone(V.NPCName);
      manager.NPCNameList = NamedNPCs.map(npc => npc.nam);
      const NowNPCNameList = new Set(manager.NPCNameList || []);
      const NewNPCNameList = [];
      for (const npc of NamedNPCs) {
        const name = npc.nam;
        if (!NowNPCNameList.has(name)) {
          NewNPCNameList.push(npc);
          manager.NPCNameList.push(name);
        }
      }
      return [...NewNPCNameList];
    }

    function clearInvalidNpcs(manager) {
      setup.NPCNameList = [...new Set([...setup.NPCNameList, ...Array.from(manager.data.keys())])];
      manager.log(`开始解析NPC...`, 'DEBUG', manager.tool.clone(V.NPCName), manager.tool.clone(setup.NPCNameList));
      const Names = (V.NPCName || []).map(npc => npc.nam);
      const needCleaning = !manager.tool.contains(Names, setup.NPCNameList, { mode: 'all' }) || !manager.tool.contains(setup.NPCNameList, Names, { mode: 'all' });
      if (!needCleaning) return false;
      const validNamesSet = new Set(setup.NPCNameList);
      V.NPCName = (V.NPCName || []).filter(npc => validNamesSet.has(npc.nam));
      manager.NPCNameList = manager.NPCNameList.filter(name => validNamesSet.has(name));
      manager.log(`清理了 ${Names.length - V.NPCName.length} 个无效NPC`, 'DEBUG');
      return true;
    }

    function onUpdate(manager) {
      let addedCount = 0;
      let skippedCount = 0;
      const NowNames = new Set(manager.NPCNameList || []);
      const allNPCs = [...(V.NPCName || [])];
      for (const [npcName, npcEntry] of manager.data) {
        const modNPC = npcEntry.Data;
        if (NowNames.has(npcName)) { skippedCount++; continue; }
        allNPCs.push(modNPC);
        manager.NPCNameList.push(npcName);
        addedCount++;
        manager.log(`注入模组NPC到内部状态: ${npcName}`, 'DEBUG');
      }
      V.NPCName = [...allNPCs];
      V.NPCNameList = manager.NPCNameList;
      updateCNPCProxy(manager);
      const nameListStr = typeof setup.NPCNameList_cn_name === 'string'
        ? setup.NPCNameList_cn_name
        : "Avery,艾弗里|Bailey,贝利|Briar,布莱尔|Charlie,查里|Darryl,达里尔|Doren,多伦|Eden,伊甸|Gwylan,格威岚|Harper,哈珀|Jordan,约旦|Kylar,凯拉尔|Landry,兰德里|Leighton,礼顿|Mason,梅森|Morgan,摩根|River,瑞沃|Robin,罗宾|Sam,萨姆|Sirris,西里斯|Whitney,惠特尼|Winter,温特|Black Wolf,黑狼|Niki,尼奇|Quinn,奎恩|Remy,雷米|Alex,艾利克斯|Great Hawk,巨鹰|Wren,伦恩|Sydney,悉尼|Ivory Wraith,象牙怨灵|Zephyr,泽菲尔|Nona,诺娜|Lake couple,湖边情侣|the witch,巫女|Taylor,泰勒|Casey,凯西|Sterling,斯特林|Cass,卡斯";
      const namePairs = nameListStr.split('|');
      for (const pair of namePairs) {
        const parts = pair.split(',');
        if (parts.length === 2) {
          const enName = parts[0].trim();
          const cnName = parts[1].trim();
          if (enName && cnName) maplebirch.lang.translations.set(enName, { EN: enName, CN: cnName });
        }
      }
      manager.log(`更新完成: 添加 ${addedCount} 个NPC, 跳过 ${skippedCount} 个重复NPC`, 'DEBUG');
      return true;
    }

    function updateNPCdata(manager) {
      setup.loveInterestNpc = [...new Set([...setup.loveInterestNpc, ...manager.loveInterestNpcs])];
      for (const [npcName, npcEntry] of manager.data) {
        const config = npcEntry.Config;
        setupLoveAlias(npcName, config.loveAlias);
        if (typeof config === 'object') {
          const checks = [['important',manager.importantNPCs],['special',manager.specialNPCs],['loveInterest',manager.loveInterestNpcs]];
          checks.forEach(([key, arr]) => {
            const value = typeof config[key] === 'function' ? config[key]() : config[key];
            if (value === true && !arr.includes(npcName)) arr.push(npcName);
          });
          
        }
      }
    }

    function setupLoveAlias(npcName, loveAliasConfig) {
      if (typeof loveAliasConfig === 'function') {
        setup.loveAlias[npcName] = loveAliasConfig;
      } else if (Array.isArray(loveAliasConfig) && loveAliasConfig.length >= 2) {
        const [cnAlias, enAlias] = loveAliasConfig;
        setup.loveAlias[npcName] = () => maplebirch.Language === 'CN' ? cnAlias : enAlias;
      } else {
        setup.loveAlias[npcName] = () => maplebirch.Language === 'CN' ? '好感' : 'Affection';
      }
    }

    function updateCNPCProxy(manager) {
      if (typeof C.npc === 'undefined') C.npc = {};
      for (const name of setup.NPCNameList) {
        if (C.npc.hasOwnProperty(name)) continue;
        const index = setup.NPCNameList.indexOf(name);
        Object.defineProperty(C.npc, name, {
          get: () => V.NPCName[index],
          set: (val) => V.NPCName[index] = val,
        });
        manager.log('更新 C.npc 代理映射', 'DEBUG');
      }
    }

    Object.defineProperties(NamedNPC, {
      add:    { value: add },
      get:    { value: getNamedNPC },
      clear:  { value: clearInvalidNpcs },
      update: { value: onUpdate },
      setup:  { value: updateNPCdata },
    });

    return NamedNPC;
  })()

  const NPCSchedules = (() => {
    const schedules = new Map();
    let nextId = 0;

    function initData(manager) {
      if (!Array.isArray(manager.NPCNameList)) { manager.log('NPCSchedules: 需要传入NPC名称数组', 'WARN'); return false; }
      for (const npcName of manager.NPCNameList) if (!schedules.has(npcName)) schedules.set(npcName, new Schedule());
      return manager.Schedules = NPCSchedules;
    }

    function addData(npcName, scheduleConfig, location, options = {}) {
      if (!schedules.has(npcName)) schedules.set(npcName, new Schedule());
      const schedule = schedules.get(npcName);
      schedule.add(scheduleConfig, location, options);
      return schedule;
    }

    function getData(npcName) {
      if (!schedules.has(npcName)) schedules.set(npcName, new Schedule());
      return schedules.get(npcName);
    }

    function updateData(npcName, specialId, updates) {
      if (!schedules.has(npcName)) schedules.set(npcName, new Schedule());
      const schedule = schedules.get(npcName);
      schedule.update(specialId, updates);
      return schedule;
    }

    function removeData(npcName, specialId) {
      if (!schedules.has(npcName)) schedules.set(npcName, new Schedule());
      const schedule = schedules.get(npcName);
      schedule.remove(specialId);
      return schedule;
    }

    function checkSchedule() {
      const result = {};
      for (const [npcName, schedule] of schedules) result[npcName] = schedule.location;
      return result;
    }

    class Schedule {
      constructor() {
        this.daily = new Array(24).fill('');
        this.specials = [];
      }

      add(scheduleConfig, location, options = {}) {
        const { id, priority = 0 } = options;
        if (typeof scheduleConfig === 'function') {
          this.specials.push({ id: id ?? (nextId++), cond: scheduleConfig, location, priority });
        } else if (Array.isArray(scheduleConfig) && scheduleConfig.length === 2) {
          const [start, end] = scheduleConfig;
          for (let hour = start; hour <= end; hour++) if (hour >= 0 && hour <= 23) this.daily[hour] = location;
        } else if (typeof scheduleConfig === 'number') {
          if (scheduleConfig >= 0 && scheduleConfig <= 23) this.daily[scheduleConfig] = location;
        }
        return this;
      }

      update(specialId, updates) {
        const special = this.specials.find(s => s.id === specialId);
        if (special) {
          if (updates.cond != null) special.cond = updates.cond;
          if (updates.location != null) special.location = updates.location;
          if (updates.priority != null) special.priority = updates.priority;
        }
        return this;
      }

      remove(specialId) {
        this.specials = this.specials.filter(s => s.id !== specialId);
        return this;
      }

      get location() {
        const hour = Time.hour;
        if (this.specials.length > 0) {
          const sorted = [...this.specials].sort((a, b) => b.priority - a.priority);
          for (const special of sorted) if (special.cond(Time.date)) return typeof special.location === 'function' ? special.location(Time.date) : special.location;
        }
        return this.daily[hour] || '';
      }
    }

    Object.defineProperties(Schedule, {
      schedules: { get: () => schedules },
      init: { value: initData },
      add: { value: addData },
      get: { value: getData },
      update: { value: updateData },
      remove: { value: removeData },
      check: { value: checkSchedule },
    });

    return Schedule;
  })()

  class NPCUtils {
    // 基本一般NPC数据
    static baseNPC = {
      'chastity': { penis: '', vagina: '', anus: '' },
      'location': {},
      'skills': {},
      'pronouns': {},
      'traits': []
    }

    static npcSeenProperty(name) {
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

    static bodyDataProperties(npcName) {
      const name = npcName.toLowerCase();
      const bodyProperties = ['eyeColour', 'hairColour', 'penissize', 'breastsize'];
      bodyProperties.forEach(prop => {
        Object.defineProperty(V.maplebirch.npc[name].bodydata, prop, {
          get: () => {
            const npc = V.NPCName.find(n => n.nam === npcName);
            return npc ? npc[prop] : undefined;
          },
          set: (val) => {
            const npcIndex = V.NPCName.findIndex(n => n.nam === npcName);
            if (npcIndex !== -1) V.NPCName[npcIndex][prop] = val;
          },
        });
      });
    }

    static outfitProperties(npcName) {
      const name = npcName.toLowerCase();
      Object.defineProperty(V.maplebirch.npc[name], 'outfits', {
        get: () => {
          const npc = V.NPCName.find(n => n.nam === npcName);
          return npc ? (npc.outfits || []) : [];
        },
        set: (val) => {
          const npcIndex = V.NPCName.findIndex(n => n.nam === npcName);
          if (npcIndex !== -1) V.NPCName[npcIndex].outfits = Array.isArray(val) ? val : [];
        }
      });
    }

    static npcList(manager, maxValue) {
      const maxNPC = (typeof maxValue === 'number') ? maxValue : 7;
      const NPCList = [];
      const existingNPCs = V.maplebirch.combat.npcList || [];
      for (let idx = 0; idx < maxNPC; ++idx) {
        NPCList.push(manager.tool.clone(NPCUtils.baseNPC));
        if (existingNPCs.length > idx && existingNPCs[idx].description) {
          const npc = NPCList[idx];
          Object.assign(npc, existingNPCs[idx]);
          npc.index = idx;
          if (!npc.type) npc.type = 'human';
        }
      }
      V.maplebirch.combat.npcList = manager.tool.clone(NPCList);
    }

    static setupNpcData(manager, phase = 'init') {
      const NPCNameList = manager.NPCNameList;
      NPCNameList.forEach(npcName => {
        const name = npcName.toLowerCase();
        if (!V.maplebirch.npc[name]) V.maplebirch.npc[name] = {};
        if (!V.maplebirch.npc[name].Seen) V.maplebirch.npc[name].Seen = [];
        if (!V.maplebirch.npc[name].FirstSeen) V.maplebirch.npc[name].FirstSeen = '';
        if (!V.maplebirch.npc[name].bodydata) V.maplebirch.npc[name].bodydata = {};
        if (!V.maplebirch.npc[name].outfits) V.maplebirch.npc[name].outfits = [];
        if (!V.maplebirch.npc[name].clothes) V.maplebirch.npc[name].clothes = {};
        if (!V.maplebirch.npc[name].location) V.maplebirch.npc[name].location = '';
        if (phase === 'postInit') {
          NPCUtils.bodyDataProperties(npcName);
          NPCUtils.outfitProperties(npcName);
          NPCUtils.npcSeenProperty(name);
        }
      });
    }
  }

  class NPCManager {
    constructor(manager) {
      this.lang = manager.lang;
      this.tool = manager.tool;
      this.log = this.tool.createLog('npc');
      this.data = new Map();
      this.pregnancy = {
        infertile: ['Bailey', 'Leighton'], // 不孕
        typesEnabled: ['human', 'wolf', 'wolfboy', 'wolfgirl', 'hawk', 'harpy'], // 可怀孕种类
        canBePregnant: ['Alex', 'Black Wolf', 'Great Hawk'] // 可孕
      };
      this.loveInterestNpcs = []; // 可恋爱npc ,如罗宾
      this.importantNPCs = [];    // 重要npc ,如罗宾
      this.specialNPCs = [];      // 特殊npc ,如幽灵
      this.NPCNameList = [];
      this.customStats = {};
      maplebirch.trigger(':npc-init', this);
      maplebirch.once(':passagestart',() => {
        if (this.tool.contains(['Start', 'Downgrade Waiting Room'], [maplebirch.state.passage.title], { mode: 'any' })) return;
        this.injectModNPCs();
      });
    }

    /**
     * 向NPC管理器中添加一个新NPC角色
     * @param {Object} manager - NPC管理器实例
     * @param {Object} npcData - NPC数据对象
     * @param {string} npcData.nam - NPC唯一名称（必需）
     * @param {string} [npcData.title] - NPC的称号
     * @param {string} [npcData.gender='f'] - 性别 (m/f/h)
     * @param {string} [npcData.type='human'] - 种族类型
     * @param {Object} [config] - NPC配置选项
     * @param {string[]} [config.loveAlias] - NPC的好感别称数组 [CN, EN]
     * @param {boolean} [config.important=false] - 是否重要NPC（显示在状态栏）
     * @param {boolean} [config.special=false] - 是否为特殊NPC
     * @param {boolean} [config.loveInterest=false] - 是否为恋爱NPC
     * @param {Object} [translationsData] - 翻译数据对象
     */
    add(npcData, config, translationsData) {
      return NamedNPC.add(this, npcData, config, translationsData);
    }

    /**
     * 为NPC添加日程安排
     * @param {string} npcName - NPC名称
     * @param {Array|number|Function|Object} scheduleConfig - 日程配置
     *  - Array: [开始小时, 结束小时] 如 [8, 15] 表示8点到15点
     *  - number: 具体小时 如 16 表示16点
     *  - Function: 条件函数，返回布尔值，用于特殊事件
     * @param {string|Function} location - 位置
     *  - string: 固定位置
     *  - Function: 位置函数，接收时间参数，返回动态位置
     * @param {Object} [options={}] - 选项
     * @param {string|number} [options.id] - 特殊事件ID（仅特殊事件需要）
     * @param {number} [options.priority=0] - 优先级，数字越大优先级越高
     * @returns {Object} 返回NPC的Schedule实例，支持链式调用
     */
    addSchedule() {
      return NPCSchedules.add(npcName, scheduleConfig, location, options = {});
    }

    /**
     * 添加/修改NPC状态系统
     * @param {Object} statsObject - 状态配置对象
     * @param {Object} statsObject[statName] - 状态配置
     * @param {number|string} [statsObject[statName].position='secondLast'] - 在状态列表中的位置(数字索引/'first'/'last'/'secondLast')
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

    /**
     * 添加NPC服装套装
     * @param {...Object} configs - 套装配置对象或配置对象数组
     * 配置对象详细说明：
     * @param {string} config.name - 套装唯一标识（必需）
     * @param {string} [config.type='custom'] - 套装类型
     * @param {string} [config.gender='n'] - 适用性别 (m-男性, f-女性, n-中性)
     * @param {number} [config.outfit=0] - outfit类型 (0-普通, 1-特殊)
     * @param {string|Object} config.upper - 上身衣物配置（可简写为字符串或详细对象）
     * @param {string} [upper.name] - 上身衣物名称（必需）
     * @param {number} [upper.integrity_max=100] - 上身衣物耐久度
     * @param {string} [upper.word='a'] - 冠词类型 (a-用'a', n-不用冠词)
     * @param {string} [upper.action='lift'] - 脱衣动作，必须为以下值之一：
     *   - 'lift'     -> 游戏中显示'掀开'
     *   - 'pull'     -> 游戏中显示'扯开'
     *   - 'unbutton' -> 游戏中显示'解开'
     *   - 'unzip'    -> 游戏中显示'解开'
     *   - 'aside'    -> 游戏中显示'拉开'
     *   - 'open'     -> 游戏中显示'打开'
     *   - 'undo'     -> 游戏中显示'松开'
     *   - 'unwrap'   -> 游戏中显示'打开'
     * @param {string} [upper.desc] - 上身衣物描述
     * @param {string|Object} config.lower - 下身衣物配置（可简写为字符串或详细对象）
     * @param {string} [lower.name] - 下身衣物名称（必需）
     * @param {number} [lower.integrity_max=100] - 下身衣物耐久度
     * @param {string} [lower.word='n'] - 冠词类型 (a-用'a', n-不用冠词)
     * @param {string} [lower.action='pull'] - 脱衣动作（同上身衣物action限制）
     * @param {string} [lower.desc] - 下身衣物描述
     * @param {string} [config.desc] - 套装描述，如未提供则自动生成
     */
    addClothes(...configs) {
      return this.Clothes.add(...configs);
    }

    injectModNPCs() {
      NamedNPC.get(this);
      NamedNPC.clear(this);
      NamedNPC.update(this);
      NamedNPC.setup(this);
      NPCSchedules.init(this);
      this.Sidebar.init(false);
    }

    #mergeConfigs(base, mod) {
      const filterFn = (key, value, depth) => {return Object.prototype.hasOwnProperty.call(mod, key);}
      return this.tool.merge(base, mod, {arrayBehaviour: 'replace', filterFn});
    }

    vanillaNPCConfig(npcConfig) {
      if (!npcConfig || typeof npcConfig !== 'object') return {};
      const Config = this.tool.clone(npcConfig);
      for (const [npcName, npcEntry] of this.data) {
        const modConfig = npcEntry.Config;
        if (modConfig && Object.keys(modConfig).length > 0) {
          const configClone = this.tool.clone(modConfig);
          ['loveAlias', 'loveInterest'].forEach(key => delete configClone[key]);
          if (Config[npcName]) {
            Config[npcName] = this.#mergeConfigs(Config[npcName], configClone);
            this.log(`合并NPC配置: ${npcName}`, 'DEBUG');
          } else {
            Config[npcName] = configClone;
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
              if (typeof position === 'number') { insertPosition = Math.max(0, Math.min(position, T.importantNpcStats.length)); }
              else if (position === 'first') { insertPosition = 0; }
              else if (position === 'last') { insertPosition = T.importantNpcStats.length; }
              else { insertPosition = Math.max(0, T.importantNpcStats.length - 1); }    
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

    NPCSpawn(...args) {
      NPCUtils.npcList(this, args[1]+1);
    }

    Init() {
      NPCUtils.setupNpcData(this, 'init');
      this.Clothes.init();
    }

    loadInit() {
      this.injectModNPCs();
      NPCUtils.setupNpcData(this, 'init');
    }

    postInit() {
      NamedNPC.setup(this);
      NPCUtils.setupNpcData(this, 'postInit');
    }
  }

  await maplebirch.register('npc', new NPCManager(maplebirch), ['var']);
})();