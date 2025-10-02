# SCML-DOL-maplebirchframework
基于 Sugarcube2 ModLoader 为 DOL 游戏设计的模块化开发框架，旨在简化游戏扩展模组的开发流程
<hr>

当前框架包含以下核心功能：
+ 事件注册系统
+ 多语言管理
+ 模块管理器
+ 变量迁移工具

随机数生成器

游戏内置作弊器

addto 区域快捷插入（覆盖游戏内侧边栏几乎所有功能，除成就和存档）

简易弹窗系统

特质添加工具

地点创建系统（左上角地点图片）

时间事件系统（支持 -9999 年至 9999 年，公元纪年）

NPC 注册系统（包含创新属性，避免重载时出现错误）

音频管理系统

文本注册系统

- [安装方式说明](#安装方式说明)
- [反馈与讨论方式](#反馈与讨论方式)
- [详细内容介绍](#详细内容介绍)
    - [多语言管理](#多语言管理)
    - [变量迁徙](#变量迁徙)
    - [addto区域快捷插入](#addto区域快捷插入)
    - [特质添加](#特质添加)
    - [地点创建](#地点创建)
    - [时间事件](#时间事件)
    - [NPC注册](#NPC注册)
    - [音频管理](#音频管理)
    - [文本注册](#文本注册)
- [致谢](#致谢)
- [未实现的功能构想](#未实现的功能构想)

### 反馈与讨论方式
 (暂无)，或在**污度孤儿中国模组制作群**联系我。

### 安装方式说明
  申明依赖两种方式。  
**第一种: 在boot.json中申明**  
```
"dependenceInfo": [
    {
      "modName": "maplebirch",
      "version": ">=2.0.0"
    }
  ]
```
**第二种：利用钩子依赖**

<details>
  <summary>点击查看图片</summary>
  <img width="1828" height="648" alt="image" src="https://github.com/user-attachments/assets/3ed72615-54f9-4590-8901-93da0262ddf4" />
</details>

### 详细内容介绍:
 - **simplebirchFrameworks**兼容支持，可直接使用**simpleFrameworks.addto**指令，映射直连而不用maplebirch。  
 - 同时**maplebirchFrameworks**和**simplebirchFrameworks**等效两者皆有映射可使用。  
```
    'addTraits': 'tool.other.addTraits',            // 添加特征
    'addLocation': 'tool.other.configureLocation',  // 配置位置
    'addTimeEvent': 'state.regTimeEvent',           // 添加时间事件
    'addNPC': 'npc.add',                            // 添加NPC
    'addStats': 'npc.addStats',                     // 添加状态 
    'addto': 'tool.framework.addTo',                // 添加到区域
    'addText': 'tool.text.reg',                     // 添加注册文本
    'onInit': 'tool.framework.onInit',              // 初始化回调
    'importLang': 'lang.importAllLanguages',        // 导入语言
    'getRandom': 'tool.random.get',                 // 获取随机值
    'migration': 'tool.migration.create',           // 创建迁移
    'importAudio': 'audio.importAllAudio',          // 导入音频
    'getPlayer': 'audio.getPlayer'                  // 获取播放器
```

```
 示例：
// 1. 添加特质示例
simpleFrameworks.addTraits({
  title: "General Traits",
  name: "魔法天赋",
  colour: "purple",
  has: () => V.magicTalent !== undefined,
  text: "你天生具有魔法亲和力"
});

// 2. 添加地点示例
simpleFrameworks.addLocation('magic_tower', {
  folder: 'magic_tower',
  base: { 
    main: { 
      image: 'tower_exterior.png',
      condition: () => Time.dayState === 'day'
    },
    night: {
      image: 'tower_night.png',
      condition: () => Time.dayState === 'night'
    }
  }
});

// 3. 添加时间事件示例
simpleFrameworks.addTimeEvent('onDay', 'dailyMagicEvent', {
  action: (data) => {
    if (V.magicTalent) {
      V.magicEnergy = Math.min(V.magicEnergy + 10, 100);
    }
  },
  description: '每日魔法能量恢复'
});

// 4. 添加NPC示例
simpleFrameworks.addNPC({
  nam: "Eldrin",
  gender: "m",
  title: "archmage"
}, {
  important: true,
  love: { maxValue: 50 }
});

// 5. 添加状态示例
simpleFrameworks.addStats({
  magic: {
    min: 0,
    max: 100,
    position: 4
  }
});

// 6. addto区域插入示例
simpleFrameworks.addto('header', 'magicHeader', () => {
  if (V.magicTalent) {
    return `<div class="magic-indicator">魔法能量: ${V.magicEnergy || 0}</div>`;
  }
  return '';
});

// 7. 初始化回调示例
simpleFrameworks.onInit(() => {
  console.log('模组初始化完成');
  // 初始化魔法系统
  if (!V.magicSystem) {
    V.magicSystem = {
      spells: [],
      mana: 100
    };
  }
});

// 8. 多语言导入示例
await simpleFrameworks.importLang('myMagicMod');

// 9. 自动翻译示例
const translatedText = simpleFrameworks.autoTranslate('火球术');

// 10. 随机数获取示例
const randomValue = simpleFrameworks.getRandom(1, 100);

// 11. 变量迁移示例
simpleFrameworks.migration('magicSystem', {
  from: 'oldMagicVar',
  to: 'V.magicSystem',
  transform: (oldValue) => {
    return { spells: oldValue.spells || [], mana: oldValue.mana || 100 };
  }
});

// 12. 音频导入示例
await simpleFrameworks.importAudio('myMagicMod');

// 13. 音频播放器获取示例
const audioPlayer = simpleFrameworks.getPlayer('myMagicMod');
audioPlayer.play('spell_cast', { volume: 0.8 });
```

<details>
  <summary>点击查看图片</summary>
  <img width="905" height="304" alt="image" src="https://github.com/user-attachments/assets/d33fb98e-211d-4595-8c6d-1f774b61d431" />
</details>

#### 多语言管理
  通常翻译数据文件路径  
```
根目录/  
└── translations/  
    ├── cn.json  
    ├── en.json  
    └── jp.json
```
通过 **`await maplebirch.lang.importAllLanguages(你的模组名);`** 或者 **`await maplebirchFrameworks.importLang(你的模组名);`** 来导入你的数据文件。  
- `maplebirch.t(键名)` : 根据键名转换翻译。  
- `maplebirch.autoTranslate(任意语言数据)` : 自动根据当前语言自动转换。
- `maplebirch.lang.t(键名)` : 根据键名转换翻译。  
- `maplebirch.lang.autoTranslate(任意语言数据)` : 自动根据当前语言自动转换。
```
示例:  
 cn.json中: "key" : "键"  
 en.josn中: "key" : "key"
 maplebirch.t('key') 在中文 输出'键'。在英文输出 'key'。
 maplebirch.lang.t('key') 在中文 输出'键'。在英文输出 'key'。
 maplebirch.autoTranslate('键') 在中文 输出'键'。在英文输出 'key'。
 maplebirch.lang.autoTranslate('键') 在中文 输出'键'。在英文输出 'key'。
```

#### 变量迁徙
通过 **`maplebirchFrameworks.migration();`** 或者 **`maplebirch.tool.migration.create();`** 来创建你模组的变量迁徙规则。 
```
 迁移路径：
 0.0.0 → 1.0.0: 初始化存档
 1.0.0 → 1.1.0: 重命名属性 + 删除属性
 1.1.0 → 1.2.0: 转换数值 + 添加新系统

// 创建迁移系统实例
const migrator = maplebirch.tool.migration.create();

// 0.0.0 → 1.0.0: 初始化存档
migrator.add('0.0.0', '1.0.0', (data, { fill }) => {
  fill(data, {
    version: '1.0.0',
    player: {
      name: '冒险者',
      hp: 100,
      mp: 50,
      coins: 0,
      items: ['剑', '药水']
    }
  });
});

// 1.0.0 → 1.1.0: 重命名和删除
migrator.add('1.0.0', '1.1.0', (data, { rename, remove }) => {
  // 重命名属性
  rename(data, 'player.hp', 'player.health');
  rename(data, 'player.mp', 'player.mana');
  
  // 删除旧属性
  remove(data, 'player.items');
});

// 1.1.0 → 1.2.0: 转换和添加新系统
migrator.add('1.1.0', '1.2.0', (data, { transform, fill }) => {
  // 转换金币为银币 (1金币 = 100银币)
  transform(data, 'player.coins', coins => coins * 100);
  
  // 添加新系统
  fill(data, {
    skills: ['攻击'],
    achievements: []
  });
});

// 使用示例
function upgradeSave(save) {
  migrator.run(save, '1.2.0');
  return save;
}

// 示例1: 全新玩家存档
const newSave = upgradeSave({});
结果:
{
  version: '1.2.0',
  player: {
    name: '冒险者',
    health: 100,  // 重命名
    mana: 50,     // 重命名
    coins: 0      // 转换为0银币
  },
  skills: ['攻击'],  // 新增
  achievements: []   // 新增
}

// 示例2: 老玩家存档升级
const oldSave = upgradeSave({
  player: {
    name: '战士',
    hp: 150,
    mp: 30,
    coins: 50,
    items: ['斧头', '盾牌']
  }
});
结果:
{
  version: '1.2.0',
  player: {
    name: '战士',
    health: 150,  // 重命名
    mana: 30,     // 重命名
    coins: 5000   // 50金币 → 5000银币
  },
  skills: ['攻击'],  // 新增
  achievements: []   // 新增
  // items属性被删除
}

// 示例3: 部分升级到1.1.0
const midSave = upgradeSave({
  player: {
    hp: 80,
    coins: 10
  }
}, '1.1.0');
结果:
{
  version: '1.1.0',
  player: {
    name: '冒险者', // 默认值
    health: 80,    // 重命名
    mana: 50,      // 默认值
    coins: 10      // 未转换
  }
  // items属性被删除
}
```

#### addto区域快捷插入
  与原来的**简易框架**一致，在对应区域插入widget或函数，详情看下方图片。 
1. `maplebirchFramework.addTo(zone, ...widgets)` - 将部件添加到指定UI区域  
2. `maplebirchFramework.onInit(...widgets)` - 注册游戏初始化逻辑  
框架已挂载到全局对象：`maplebirch.tool.framework`   
可通过以下方式使用：  
 - `maplebirchFramework.addTo` 映射到 `maplebirch.tool.framework.addTo`  
 - `maplebirchFramework.onInit` 映射到 `maplebirch.tool.framework.onInit`  
```
  ======================== 方法详解 ========================
  1. maplebirchFramework.onInit(...widgets)
    注册游戏初始化时执行的逻辑
  
    参数：
      ...widgets - 支持多种类型的初始化项：
        - 字符串: 宏命令名称 (如 'setupPlayerData')
        - 函数: 直接执行的JS函数
        - 对象: 包含init方法的对象
  
    执行时机：游戏启动时（StoryInit段落）
  
  2. maplebirchFramework.addTo(zone, ...widgets)
    向指定UI区域添加内容
  
    参数：
      zone - 目标区域名称 (字符串)
      ...widgets - 支持多种类型的UI内容：
        - 字符串: 宏命令名称 (如 'displayPlayerName')
        - 函数: 返回HTML/宏字符串的函数
        - 对象: 带条件的UI配置
```
  
- 框架提供多个预定义区域供添加内容：  
```
| 区域名称                | 位置说明                 |
|-------------------------|--------------------------|
| `Header`                | 页面顶部                 |
| `Footer`                | 页面底部                 |
| `Options`               | 选项菜单                 |
| `StatusBar`             | 状态栏                   |
| `Information`           | 信息区域                 |
| `BeforeLinkZone`        | 选项链接前               |
| `AfterLinkZone`         | 选项链接后               |
| `CharaDescription`      | 角色描述区               |
| `DegreesBox`            | 属性区域                 |
| `SkillsBox`             | 技能区域                 |
| `SchoolSubjectsBox`     | 学科区域                 |
| `HintMobile`            | 移动端提示区             |
| `Journal`               | 日志尾部                 |
| `Init`                  | 初始化脚本区域           |
| `Cheats`                | 作弊栏区域               |
| `Statistics`            | 统计栏区域               |
| `CaptionDescription`    | 标题描述区域             |
| `MenuBig`               | 大菜单区域               |
| `MenuSmall`             | 小菜单区域               |
| `CaptionAfterDescription`| 标题描述后区域           |
| `StatsMobile`           | 移动端状态区域           |
| `DegreesBonusDisplay`   | 属性加成显示区域         |
| `SkillsBonusDisplay`    | 技能加成显示区域         |
| `SubjectBoxBonusDisplay`| 学科加成显示区域         |
| `SchoolMarksText`       | 成绩文本区域             |
| `WeaponBox`             | 武器框区域               |
| `Reputation`            | 声誉显示区域             |
| `Fame`                  | 知名度显示区域           |
| `StatusSocial`          | 社交状态区域             |
| `NPCinit`               | NPC初始化区域            |
```
- 当使用对象作为widget参数时，支持以下配置：
```
{
  widget: 'macroName',     // 必需：宏命令名称
  exclude: ['Passage1'],   // 可选：排除的段落名称
  match: /Chapter\d+/,    // 可选：匹配段落名称的正则
  passage: ['Settings']    // 可选：仅在这些段落显示
}
```
- 使用示例：
```
 // 示例1：初始化玩家数据
  maplebirchFramework.onInit(() => {
    if (!V.playerModData) {
      V.playerModData = {
        modPoints: 0,
        modLevel: 1
      };
    }
  });
  
  // 示例2：添加页脚信息
  maplebirchFramework.addTo('Footer', () => {
    return `模组版本: 1.0 | 点数: ${V.playerModData?.modPoints || 0}`;
  });
  
  // 示例3：添加带条件的选项按钮
  maplebirchFramework.addTo('Options', {
    widget: 'modSettingsButton',
    exclude: ['Battle', 'Combat'] // 战斗场景不显示
  });
  
  // 示例4：添加多个初始化项
  maplebirchFramework.onInit(
    'initModSystem',           // 宏命令
    initModData,               // 函数
    { init: modConfig.init }   // 对象
  );
  
  // 示例5：添加动态状态显示
  maplebirchFramework.addTo('StatusBar', () => {
  return `模组等级: ${V.playerModData?.modLevel || 1}`;
});
```

<details>
  <summary>点击查看图片</summary>
  <img width="846" height="990" alt="image" src="https://github.com/user-attachments/assets/0fc25fa2-4bd9-4323-b17e-6d3a77376e1d" />
</details>  

#### 简易弹窗
  使用特殊的`<<maplebirchReplace>>`宏来弹窗。
```
示例:

<<maplebirchReplace "maplebirchModHint" "title">>

<<widget 'maplebirchModHint'>>  
<</widget>>

<<widget 'titleMaplebirchModHint'>>  
  <<setupTabs>>  
  <div id="overlayTabs" class="tab">  
    <<closeButtonMobile>>  
  </div>  
  <<closeButton>>  
<</widget>>

弹出带有'titleMaplebirchModHint'标题的首页面'maplebirchModHint'的弹窗。

<<maplebirchReplace 'maplebirchModHint'>> 单弹窗无标题。

<<maplebirchReplace 'maplebirchModHint' 'customize'>> 自定义 通过 <<print 'maplebirchModHint'>> 使用你的自设弹窗。
```
#### 特质添加
  便携添加特质，可重复添加下方为汉化包汉化后的中英文特质标题映射，输入对应英文进你的特质标题即可为对应特质区域添加特质(可修改原版特质)。
<details>
  <summary>点击查看图片</summary>
  <img width="438" height="247" alt="image" src="https://github.com/user-attachments/assets/7b2fd514-4819-4a5f-832c-5ca9bd00d1bf" />
</details>  

```
示例:  
maplebirch.tool.other.addTraits({  
  title: 特质标题,  
  name: '一个名字',                      // 特质名字  
  colour: 'red',                        // 文字颜色(或自己css?)   
  has: true, <-这是默认触发              // 触发条件  
  text: '这是一个特质'                   // 特质说明  
},{  
  title: "General Traits",  
  name: () => {maplebirch.lang.t('XX') / maplebirch.lang.autoTranslate('XX')},     // 函数态，这里是导入翻译数据后按语言显示名称，你也可以按自己条件写判断不同时候的名称，例如原版牛化。  
  colour: () => {},                                                                // 同理  
  has: () => {}    
  text: () => {}     
});  
```

#### 地点创建
  便携为你的地点添加右上角贴图，详情请查看原版对应的**setup.LocationImages**变量
```
/**
 * 地点配置方法（添加/更新）
 * @param {string} locationId - 地点ID
 * @param {object} config - 配置对象
 * @param {object} [options] - 配置选项
 * @param {boolean} [options.overwrite=false] - 是否覆盖整个配置
 * @param {string} [options.layer] - 指定操作图层
 * @param {string} [options.element] - 指定操作元素
 * 
 * 示例1：添加新地点
 * configureLocation('magic_academy', {
 *   folder: 'magic_academy',
 *   base: { main: { image: 'main.png' } }
 * });
 * 
 * 示例2：更新特定元素
 * configureLocation('lake_ruin', {
 *   condition: () => Weather.bloodMoon && !Weather.isSnow
 * }, { layer: 'base', element: 'bloodmoon' });
 * 
 * 示例3：完全覆盖地点
 * configureLocation('cafe', {
 *   folder: 'cafe_remastered',
 *   base: { ... }
 * }, { overwrite: true });
 * 
 * 示例4：添加新图层元素
 * configureLocation('forest', {
 *   image: 'fireflies.png',
 *   animation: { frameDelay: 300 }
 * }, { layer: 'emissive', element: 'fireflies' });
 */
```
#### 时间事件
 可用**maplebirchFrameworks.addTimeEvent**或者**maplebirch.state.regTimeEvent**进行注册。
```
/**
 * ======================== 事件注册方式 ========================
 * 
 * 使用 maplebirch.state.regTimeEvent() 方法注册时间事件：
 * 
 * maplebirch.state.regTimeEvent(
 *   type,       // 事件类型 (字符串)
 *   eventId,    // 事件唯一标识符 (字符串)
 *   options     // 事件配置选项 (对象)
 * );
 * 
 * 支持的事件类型：
 * - 'onSec'     : 每秒触发
 * - 'onMin'     : 每分钟触发
 * - 'onHour'    : 每小时触发
 * - 'onDay'     : 每天触发
 * - 'onWeek'    : 每周触发
 * - 'onMonth'   : 每月触发
 * - 'onYear'    : 每年触发
 * - 'onBefore'  : 时间流逝前触发
 * - 'onThread'  : 时间流逝中触发
 * - 'onAfter'   : 时间流逝后触发
 * - 'onTimeTravel': 时间穿越时触发
 * 
 * ======================== 配置选项 (options) ========================
 * 
 * {
 *   action: function(enhancedTimeData) { ... },  // 必需：事件触发时执行的回调函数
 *   cond: function(enhancedTimeData) { ... },    // 可选：条件检查函数，返回true时触发
 *   priority: 0,                                 // 可选：事件优先级（数值越大优先级越高）
 *   once: false,                                 // 可选：是否一次性事件（触发后自动移除）
 *   description: '事件描述',                      // 可选：事件描述文本
 *   accumulate: {                                // 可选：累积触发配置
 *     unit: 'sec',                               // 累积单位（'sec','min','hour','day','week','month','year'）
 *     target: 1                                  // 累积目标值
 *   },
 *   exact: false                                // 可选：是否在精确时间点触发（仅对小时及以上事件有效）
 * }
 * 
 * ======================== 时间数据对象 (enhancedTimeData) ========================
 * 
 * 传递给 cond 和 action 函数的时间数据对象包含以下属性：
 * 
 * {
 *   passed: number,           // 实际流逝的秒数
 *   sec: number,              // 总流逝秒数
 *   min: number,              // 总流逝分钟数
 *   hour: number,             // 总流逝小时数
 *   day: number,              // 总流逝天数
 *   week: number,             // 总流逝周数
 *   month: number,            // 总流逝月数
 *   year: number,             // 总流逝年数
 *   weekday: [prev, current], // 流逝前后的星期几（1-7）
 *   prevDate: DateTime,       // 流逝前的完整时间对象
 *   currentDate: DateTime,    // 流逝后的完整时间对象
 *   detailedDiff: {           // 详细时间差
 *     years: number,
 *     months: number,
 *     days: number,
 *     hours: number,
 *     minutes: number,
 *     seconds: number
 *   },
 *   changes: {                // 本次流逝引起的变化量
 *     sec: number,
 *     min: number,
 *     hour: number,
 *     day: number,
 *     week: number,
 *     month: number,
 *     year: number
 *   },
 *   cumulative: {             // 累积时间量
 *     sec: number,
 *     min: number,
 *     hour: number,
 *     day: number,
 *     week: number,
 *     month: number,
 *     year: number
 *   },
 *   triggeredByAccumulator: { // 仅当由累积触发时存在
 *     unit: string,            // 触发单位
 *     target: number           // 触发目标值
 *   }
 * }
 * 
 * ======================== 使用示例 ========================
 * 
 * // 注册一个每天午夜触发的精确事件
 * maplebirch.state.regTimeEvent('onDay', 'midnight-event', {
 *   action: () => console.log('午夜到了！新的一天开始了！'),
 *   exact: true,
 *   description: '每天午夜触发的事件'
 * });
 * 
 * // 注册一个整点触发的精确事件
 * maplebirch.state.regTimeEvent('onHour', 'hourly-event', {
 *   action: () => console.log('整点报时！'),
 *   exact: true,
 *   description: '每小时整点触发的事件'
 * });
 * 
 * // 注册一个累积型事件（每累积30分钟触发）
 * maplebirch.state.regTimeEvent('onMin', 'cumulative-event', {
 *   action: (data) => console.log(`已累积 ${data.cumulative.min} 分钟`),
 *   accumulate: { unit: 'min', target: 30 },
 *   description: '每30分钟触发的事件'
 * });
 * 
 * // 时间旅行示例（前进1天）
 * maplebirch.state.timeTravel({ addDays: 1 });
 */
```
#### NPC注册
 为你的模组便携添加npc，详情看**下方图片**，或去代码指定位置，选择你的npc数据。
```
// 添加一个名为Lily的狐狸NPC **(三个大括号是必要的，如果不要请在对应位置写false)**  
npc.add({
  nam: "Lily",         // NPC唯一名称（必需）
  gender: "f",         // 女性（m/f/none）
  title: "dancer"      // 头衔
  type: "human",       // 人类种族 （如果你可以解决战斗问题，你可以换全新种族）
}, 
{  // NPC配置（可选）
  important: true,     // 标记为重要NPC（显示在状态栏）
  love: { maxValue: 30 },  // 设置好感度上限
  dom: { maxValue: 20 }    // 设置支配值上限
},
{  // 翻译数据（可选）
  "Lily": {             
    CN: "莉莉",        // 中文翻译
    EN: "Lily"         // 英文原文
}
});

// 添加新状态"arcana"并修改现有状态"purity"
npc.addStats({
  arcana: {           // 新状态-奥秘值
    min: 0,           // 最小值0
    max: 100,         // 最大值100
    position: 3       // 插入到状态列表第4个位置
  },
  purity: {           // 修改现有状态-纯洁值
    max: 200          // 调整最大值为200（原值100）
  },
  corruption: {       // 修改现有状态-堕落值
    min: -50,         // 允许负值
    position: "last"  // 移动到列表末尾
  }
});
```
+ 然后关于npc关系文本的快捷注册需要你写相应的**宏`<<widget>>`**
```
<<widget '(你的npc名字)relationshiptext'>>
  <<if $NPCName[_i].love gte $npclovehigh>>
   <<if $NPCName[_i].dom gte $npcdomhigh>>
    认为你<span class="green">可爱十足。</span>
   <<elseif $NPCName[_i].dom lte $npcdomlow>>
    认为你<span class="green">鼓舞人心。</span>
   <<else>>
    认为你<span class="green">令人愉悦。</span>
   <</if>>
  <<elseif $NPCName[_i].love lte $npclovelow>>
   <<if $NPCName[_i].dom gte $npcdomhigh>>
    认为你<span class="red">十分可悲。</span>
   <<elseif $NPCName[_i].dom lte $npcdomlow>>
    认为你<span class="red">使人恼火。</span>
   <<else>>
    认为你<span class="red">非常讨厌。</span>
   <</if>>
  <<else>>
   <<if $NPCName[_i].dom gte $npcdomhigh>>
    认为你<span class="pink">很可爱。</span>
   <<elseif $NPCName[_i].dom lte $npcdomlow>>
    <span class="teal">敬仰着你。</span>
   <<else>>
    对你没什么看法。
   <</if>>
  <</if>>
<</widget>>
```

<details>
  <summary>点击查看图片</summary>
  <img width="510" height="1083" alt="image" src="https://github.com/user-attachments/assets/5e5c5625-2eab-4c15-9d86-eaa0da4b0da0" />
</details> 

#### 音频管理  
 在js中通过 **`await maplebirch.audio.importAllAudio(你的模组名);`** 来导入你的数据文件。
```
根目录/  
└── audio/  
    ├── XX.mpd
    ├── xx.wav  
    └── 音频文件
```
- `maplebirch.audio.getPlayer('my-mod');` : 获取播放器   
```
示例:  
 播放音频  
 maplebirch.audio.getPlayer('my-mod').play('background-music', {  
  loop: true, // 单曲循环  
  volume: 0.7  
 });  

maplebirch.audio.getPlayer('my-mod').togglePause('background-music'); // 暂停音频
maplebirch.audio.getPlayer('my-mod').setVolume(0.5);  // 设置音量

默认行为​​：play(key, { loop: true })会循环100次
​​无限循环​​：play(key, { loop: true, loopCount: Infinity })会无限循环
​​自定义次数​​：play(key, { loop: true, loopCount: 5 })会循环5次

```
#### 文本注册

通过 **`maplebirch.tool.text.reg`** 或者 **`maplebirchFramework.regText`** 来注册文本链接

```
/**
 *   - `text(content: string, style?: string)`：添加文本（可选样式），自动添加空格
 *   - `line(content?: string, style?: string)`：添加换行（可带文本内容）
 *   - `wikify(content: string)`：解析并添加维基语法文本
 *   - `raw(content: any)`：直接添加原始内容（DOM节点/字符串）
 *   - `ctx: object`：渲染上下文数据
 * 
 * 所有方法支持链式调用，例如：
 *   text("你好").line("世界").text("！", "bold");
 * 
 * @example // 基本注册和渲染
 * // 注册处理器
 * text.reg("welcome", ({ text }) => {
 *   text("欢迎来到奇幻世界！");
 * });
 * 
 * // 在SugarCube中使用
 * <<maplebirchTextOutput "welcome">>
 * 
 * // 生成结果：
 * // <span>欢迎来到奇幻世界！ </span>
 * 
 * @example // 带样式的文本
 * // 注册处理器
 * text.reg("warning", ({ text, line }) => {
 *   text("危险区域！", "red").line("请小心前进", "yellow");
 * });
 * 
 * // 在SugarCube中使用
 * <<maplebirchTextOutput "warning">>
 * 
 * // 生成结果：
 * // <span class="red">危险区域！ </span><br>
 * // <span class="yellow">请小心前进 </span>
 * 
 * @example // 使用上下文
 * // 注册处理器
 * text.reg("character_info", ({ text, ctx }) => {
 *   text(`姓名：${ctx.name}`)
 *     .text(`职业：${ctx.class}`)
 *     .text(`等级：${ctx.level}`);
 * });
 * 
 * // 在SugarCube中使用
 * <<set $player = { name: "艾拉", class: "游侠", level: 12 }>>
 * <<maplebirchTextOutput "character_info" $player>>
 * 
 * // 生成结果：
 * // <span>姓名：艾拉 </span>
 * // <span>职业：游侠 </span>
 * // <span>等级：12 </span>
 * 
 * @example // 维基语法解析
 * // 注册处理器
 * text.reg("npc_dialogue", ({ text, wikify, ctx }) => {
 *   text(`${ctx.npcName}:`).line();
 *   wikify(`"旅途小心，$player。[[前往${ctx.location}->NextScene]]"`);
 * });
 * 
 * // 在SugarCube中使用
 * <<set $npc = { npcName: "老巫师", location: "黑森林" }>>
 * <<maplebirchTextOutput "npc_dialogue" $npc>>
 * 
 * // 生成结果：
 * // <span>老巫师: </span><br>
 * // <span class="macro-text">"旅途小心，小明。</span>
 * // <a class="link-internal" href="NextScene">前往黑森林</a>
 * // <span class="macro-text">"</span>
 * 
 * @example // 组合元素与动态内容
 * // 注册处理器
 * text.reg("quest", ({ text, line, raw, ctx }) => {
 *   text(`任务：${ctx.title}`, "quest-title").line(ctx.description).line();
 *   
 *   const progress = document.createElement("progress");
 *   progress.value = ctx.progress;
 *   progress.max = 100;
 *   raw(progress);
 *   
 *   line(`进度：${ctx.progress}%`, "small-text");
 * });
 * 
 * // 在SugarCube中使用
 * <<set $quest = {
 *   title: "击败洞穴巨魔",
 *   description: "清除洞穴中的巨魔威胁",
 *   progress: 30
 * }>>
 * <<maplebirchTextOutput "quest" $quest>>
 * 
 * // 生成结果：
 * // <span class="quest-title">任务：击败洞穴巨魔 </span><br>
 * // <span>清除洞穴中的巨魔威胁 </span><br>
 * // <progress value="30" max="100"></progress><br>
 * // <span class="small-text">进度：30% </span>
 * 
 * @example // 嵌套渲染
 * // 注册处理器
 * text.reg("scene_container", async ({ text, raw, ctx }) => {
 *   text("=== 场景开始 ===").line();
 *   
 *   const nestedFrag = await text.renderFragment([
 *     "location_description",
 *     "npc_dialogue"
 *   ], ctx);
 *   
 *   raw(nestedFrag);
 *   
 *   text("=== 场景结束 ===").line();
 * });
 * 
 * text.reg("location_description", ({ text, ctx }) => {
 *   text(`你来到了${ctx.location}。`).line();
 * });
 * 
 * text.reg("npc_dialogue", ({ text, ctx }) => {
 *   text(`${ctx.npcName}说：`).text(ctx.dialogue);
 * });
 * 
 * // 在SugarCube中使用
 * <<set $sceneCtx = {
 *   location: "神秘洞穴",
 *   npcName: "守护者",
 *   dialogue: "这里藏着古老的宝藏。"
 * }>>
 * <<maplebirchTextOutput "scene_container" $sceneCtx>>
 * 
 * // 生成结果：
 * // <span>=== 场景开始 === </span><br>
 * // <span>你来到了神秘洞穴。 </span><br>
 * // <span>守护者说： </span><span>这里藏着古老的宝藏。 </span>
 * // <span>=== 场景结束 === </span><br>
 */
```

### 致谢
- 感谢 [Lyoko-Jeremie](https://github.com/Lyoko-Jeremie) 制作的Modloader和所支持的功能。
- 感谢 [Lyoko-Jeremie](https://github.com/Lyoko-Jeremie) 大神开发了Modloader以及所有预置模组、[Number_Sir](https://github.com/NumberSir) 大佬开发了模组编写助手，以及两位魔法师在模组开发群里提供的教程和指导。
- 感谢 [狐千月](https://github.com/emicoto) 制作的 [简易框架](https://github.com/emicoto/SCMLSimpleFramework) 。
- 感谢 [苯环](https://github.com/Nephthelana) 、[零环](https://github.com/ZeroRing233) 、 [丧心](https://github.com/MissedHeart) 的代码指导。
- 感谢 污度孤儿中国模组制作群 的新人引导。

### 未实现的功能构想

- 人类体型战斗系统重置、完善制作全新npc架构(画布...)










