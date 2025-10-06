# SCML-DOL-maplebirchframework
`maplebirchFramework` 是基于 **Sugarcube2 ModLoader** 为 **Degrees-of-Lewdity** 游戏设计的模块化开发框架，旨在能够为游戏扩展模组的开发提供一些便利，让开发者能够更轻松地构建和维护模组内容。
***
## 目录
- [基本介绍](#基本介绍)
- [安装与依赖方式说明](#安装与依赖方式说明)
- [反馈与讨论方式](#反馈与讨论方式)
- [功能介绍与示例](#功能介绍与示例)
    - [多语言管理](#多语言管理)
        - [addonPlugin注册](#addonPlugin注册)
    - [事件注册](#事件注册)
    - [模块管理](#模块管理)
    - [时间事件](#时间事件)
        - [时间事件的注册方式](#时间事件的注册方式)
        - [时间事件的配置选项](#时间事件的配置选项)
        - [时间数据对象](#时间数据对象)
        - [时间事件使用示例](#时间事件使用示例)
    - [时间旅行](#时间旅行)
        - [使用示例](#使用示例)
        - [选项参数](#选项参数)
    - [音频管理](#音频管理)
        - [导入音频文件](#导入音频文件)
        - [使用示例](#使用示例)
        - [参数说明](#参数说明)
    - [变量迁徙](#变量迁徙)
        - [使用示例](#使用示例)
        - [主要方法](#主要方法)
        - [工具集](#工具集)
    - [随机数生成](#随机数生成)
    - [文本片段](#文本片段)
        - [注册文本](#注册文本)
        - [输出文本](#输出文本)
    - [作弊控制台](#作弊控制台)
    - [addto区域注册](#addto区域注册)
        - [添加内容到指定区域](#添加内容到指定区域)
        - [注册初始化函数](#注册初始化函数)
    - [​​简易弹窗](#​​​​简易弹窗)
    - [特质注册](#特质注册)
    - [地点注册](#地点注册)
    - [NPC注册](#NPC注册)
        - [NPC的基本数据](#NPC的基本数据)
        - [添加自定义状态](#添加自定义状态)
        - [NPC的关系文本](#NPC的关系文本)
        - [NPC属性详解](#NPC属性详解)
- [致谢](#致谢)
- [未实现的功能构想](#未实现的功能构想)

## 基本介绍
- 本框架写成于 **Degrees-of-Lewdity-v0.5.4.9** 版本，将会持续随着游戏版本而更新。如 **Degrees-of-Lewdity-v0.5.4.9** 往前的版本不会考虑兼容。  

- 对于原来使用[**简易框架**](https://github.com/emicoto/SCMLSimpleFramework)的模组，可以直接将[**简易框架**](https://github.com/emicoto/SCMLSimpleFramework)替换成[**秋枫白桦框架**](https://github.com/MaplebirchLeaf/SCML-DOL-maplebirchframework)尝试执行，基本兼容了原依赖[**简易框架**](https://github.com/emicoto/SCMLSimpleFramework)的模组(如: [**猫咖出租屋**](https://github.com/Maomaoi/Degrees-of-Lewdity-Cattery))，但不兼容强依赖的模组(如: [**泰拉瑞亚拓展**](https://github.com/Nephthelana/DOL-Terra-Expanding-Modd/))，以及我之前的秋枫白桦拓展。  

- 提供了映射接口 `maplebirchFrameworks` 和 `simplebirchFrameworks` 对 `maplebirch` 的映射和快捷使用，以及防止大幅破坏原结构。

| 提供的功能 | 映射方法使用 | 对应路径 |
| :-: | :-: | :-: |
| 导入语言文件 | `maplebirchFrameworks.addLanguage` / `simplebirchFrameworks.addLanguage` | `maplebirch.lang.importAllLanguages` |
| 注册时间事件 | `maplebirchFrameworks.addTimeEvent` / `simplebirchFrameworks.addTimeEvent` | `maplebirch.state.regTimeEvent` |
| 时间旅行 | `maplebirchFrameworks.timeTravel` / `simplebirchFrameworks.timeTravel` | `maplebirch.state.timeTravel` |
| 导入音频文件 | `maplebirchFrameworks.addAudio` / `simplebirchFrameworks.addAudio` | `maplebirch.audio.importAllAudio` |
| 获取音频播放实例 | `maplebirchFrameworks.getPlayer` / `simplebirchFrameworks.getPlayer` | `maplebirch.audio.getPlayer` |
| 变量迁徙实例 | `maplebirchFrameworks.migration` / `simplebirchFrameworks.migration` | `maplebirch.tool.migration.create` |
| 获取随机值 | `maplebirchFrameworks.getRandom` / `simplebirchFrameworks.getRandom` | `maplebirch.tool.random.get` |
| 注册文本片段 | `maplebirchFrameworks.addText` / `simplebirchFrameworks.addText` | `maplebirch.tool.text.reg` |
| addto区域注册 | `maplebirchFrameworks.addto` / `simplebirchFrameworks.addto` | `maplebirch.tool.framework.addTo` |
| 初始化函数脚本 | `maplebirchFrameworks.onInit` / `simplebirchFrameworks.onInit` | `maplebirch.tool.framework.onInit` |
| 添加特质 | `maplebirchFrameworks.addTraits` / `simplebirchFrameworks.addTraits` | `maplebirch.tool.other.addTraits` |
| 添加地点 | `maplebirchFrameworks.addLocation` / `simplebirchFrameworks.addLocation` | `maplebirch.tool.other.configureLocation` |
| 添加NPC | `maplebirchFrameworks.addNPC` / `simplebirchFrameworks.addNPC` | `maplebirch.npc.add` |
| 添加NPC状态 | `maplebirchFrameworks.addStats` / `simplebirchFrameworks.addStats` | `maplebirch.npc.addStats` |

<details>
<summary>点击查看现已实现的功能</summary>
    
| 功能模块 | 核心作用 |
| :-: | :-: |
| 多语言管理 | 提供国际化和多语言翻译支持 |
| 事件注册 | 允许注册和触发自定义事件 |
| 模块管理​ | 管理模组依赖和生命周期 |
| 时间事件 | 管理各种时间触发事件 |
| 时间旅行​ | 实现游戏内时间跳跃功能 |
| 音频管理​ | 处理音频资源的加载和播放 |
| ​​变量迁徙​ | 处理数据迁移和版本兼容性​ |
| 随机数生成​​ | ​​提供可控的伪随机数生成​ |
| ​​文本片段 | ​​动态注册和渲染文本片段​ |
| 作弊控制台 | ​​提供游戏内的代码执行环境​ |
| ​​区域注册​ | 动态注册界面部件区域​ |
| ​​特质注册​ | 动态添加游戏特质 |
| 地点注册​​ | 动态添加游戏地点​ |
| NPC注册 | 为游戏内添加NPC​ |
</details>

## 安装与依赖方式说明

- 在侧边／底部的 **Releases** 中下载最新版的 `maplebirchframework.zip` 文件。

- 第一种依赖申明(依赖模组加载器申明依赖): 在模组 `boot.js` 文件中的 `dependenceInfo` 区域添加下方内容。
  
```
"dependenceInfo": [
    {
      "modName": "maplebirch",
      "version": ">=2.0.0"
    }
  ]
```
<details>
  <summary>点击查看图片</summary>
  <img width="654" height="1102" alt="image" src="https://github.com/user-attachments/assets/9a38dde3-6812-4627-811b-2f11751919a9" />
</details>


+ 第二种依赖申明(利用模组加载器的钩子): 这种方法可以让依赖框架的模组在框架之前加载。 
<details>
  <summary>点击查看图片</summary>
  <img width="1848" height="1192" alt="image" src="https://github.com/user-attachments/assets/dd8aca44-0619-4f1f-bec5-8d1f2f30f5f4" />
</details>

+ 第三种自助 `addonPlugin` 声明依赖，**详情**看对应区块说明

```
"addonPlugin": [
    {
      "modName": "maplebirch",
      "addonName": "maplebirchAddon",
      "modVersion": "^2.4.0",
      "params": {
        "language": [],
        "audio": "",
        "framework": [
          {
            "addto": "",
            "widget": ""
          },
          {
            "addto": "",
            "widget": {
              "widget": "",
              "exclude": [],
              "passage": [],
              "match": ""
            }
          },
          {
            "traits": []
          }
        ],
        "npc": [
          {
            "data": {},
            "state": {}
          }
        ]
      }
    }
```

## 反馈与讨论方式
 (暂无)，或在**污度孤儿中国模组制作群**联系我。

## 功能介绍与示例:
 ### 多语言管理
  - 通常的翻译文件存放路径:  
  ```
    根目录/  
    └── translations/  
        ├── cn.json  
        └── en.json  
  ```
  - 导入你的翻译文件(三个函数任选其一):  
  ```
    await maplebirchFrameworks.addLanguage(你的模组名);  
    await simpleFrameworks.addLanguage(你的模组名);  
    await maplebirch.lang.importAllLanguages(你的模组名);  
  ```
  - 在文件中使用翻译:
  ```
    maplebirch.t(键名) // 自动根据当前语言键名转换翻译  
    如: maplebirch.t('volume'); 在中文时输出 '音量'  
    maplebirch.autoTranslate(任意语言数据) // 自动根据当前语言自动转换  
    如: maplebirch.autoTranslate('音量'); 在英文时输出 'volume'  
    在sugarcube环境中使用 <<= maplebirch.t(键名)>> / <<= maplebirch.autoTranslate(任意语言数据)>>显示
    <<= XX>> 等效于 <<print XX>>
  ```
  #### addonPlugin注册
```
"language": true, // 布尔值：导入所有默认语言

"language": ["CN", "EN"], // 数组：导入指定语言

"language": { // 对象：自定义语言配置
  "CN": {
    "file": "translations/chinese.json" // 自定义文件路径
  },
  "EN": {
    "file": "translations/english.json" // 自定义文件路径
  }
```
 ### 事件注册
  - 使用 `maplebirch.on(evt[触发的时机], handler[需要触发的函数], desc = ''[你注册事件的标识符])` 进行事件注册
  - 使用 `maplebirch.once(evt[触发的时机], handler[需要触发的函数], desc = ''[你注册事件的标识符])` 进行一次性事件注册，即生效一次后删除
  - 使用 `maplebirch.off(evt[触发的时机], identifier[已注册事件的标识符])` 进行删除已注册的回调事件
  - 使用 `maplebirch.trigger(evt[触发的时机], ...args[需要传导的上下文变量])` 进行触发以及传递环境变量

<details>
  <summary>框架默认的事件类型(慎用不稳定!)</summary>
  <img width="788" height="490" alt="image" src="https://github.com/user-attachments/assets/eafee98a-0400-403d-839b-984050f59f48" />
</details>

 ### 模块管理
  + **~~!!![警告]慎用此功能!!!,作者写得实在太烂了(~~**  
```
主要功能：
- register(name, module, dependencies): 注册新模块
- preInit(): 执行预初始化阶段
- init(): 执行主初始化阶段
- loadInit(): 执行存档加载初始化
- postInit(): 执行后初始化阶段
```
  + 使用示例(必须要在 **`scriptFileList_earlyload`** 时机进行注册，且在注册前使用 **`maplebirch.ExModCount = maplebirch.expectedModuleCount + 1`** 来提升预期数量。)  
```
// 1. 注册UI组件模块（无依赖）
maplebirch.register('uiComponents', {
  preInit() {
    // 预初始化：注册基础UI组件
    this.registerButtonComponent();
  },
  init() {
    // 主初始化：绑定UI事件
    this.bindButtonEvents();
  },
  loadInit() {
    // 存档加载后：恢复UI状态
    this.restoreUIState();
  },
  postInit() {
    // 后初始化：执行UI动画
    this.startIntroAnimation();
  }
});

// 2. 注册游戏数据模块（依赖uiComponents）
maplebirch.register('gameData', {
  preInit() {
    // 预初始化：设置数据结构
    this.initDataStructures();
  },
  init() {
    // 主初始化：加载初始数据
    this.loadInitialData();
  }
}, ['uiComponents']); // 声明依赖uiComponents模块

// 3. 注册AI系统模块（依赖gameData）
maplebirch.register('aiSystem', {
  init() {
    // 主初始化：启动AI线程
    this.startAIProcessing();
  },
  postInit() {
    // 后初始化：连接AI到游戏界面
    this.connectToGameUI();
  }
}, ['gameData']);
```
 ### 时间事件
  #### 时间事件的注册方式
   - 使用 `maplebirchFrameworks.addTimeEvent` 、 `simpleFrameworks.addTimeEvent` 和 `maplebirch.state.regTimeEvent` 任选其一注册时间事件  
```
maplebirchFrameworks.addTimeEvent(
  type,       // 事件类型 (字符串)
  eventId,    // 事件唯一标识符 (字符串)
  options     // 事件配置选项 (对象)
);

支持的事件类型：
- 'onSec'     : 每秒触发
- 'onMin'     : 每分钟触发
- 'onHour'    : 每小时触发
- 'onDay'     : 每天触发
- 'onWeek'    : 每周触发
- 'onMonth'   : 每月触发
- 'onYear'    : 每年触发
- 'onBefore'  : 时间流逝前触发
- 'onThread'  : 时间流逝中触发
- 'onAfter'   : 时间流逝后触发
- 'onTimeTravel': 时间穿越时触发
```
  #### 时间事件的配置选项
```
{
  action: function(enhancedTimeData) { ... },  // 必需：事件触发时执行的回调函数
  cond: function(enhancedTimeData) { ... },    // 可选：条件检查函数，返回true时触发
  priority: 0,                                 // 可选：事件优先级（数值越大优先级越高）
  once: false,                                 // 可选：是否一次性事件（触发后自动移除）
  description: '事件描述',                      // 可选：事件描述文本
  accumulate: {                                // 可选：累积触发配置
    unit: 'sec',                               // 累积单位（'sec','min','hour','day','week','month','year'）
    target: 1                                  // 累积目标值
  },
  exact: false                                 // 可选：是否在精确时间点触发（仅对小时及以上事件有效）
}
```
  #### 时间数据对象
```
传递给 cond 和 action 函数的时间数据对象包含以下属性：
{
  passed: number,           // 实际流逝的秒数
  sec: number,              // 总流逝秒数
  min: number,              // 总流逝分钟数
  hour: number,             // 总流逝小时数
  day: number,              // 总流逝天数
  week: number,             // 总流逝周数
  month: number,            // 总流逝月数
  year: number,             // 总流逝年数
  weekday: [prev, current], // 流逝前后的星期几（1-7）
  prevDate: DateTime,       // 流逝前的完整时间对象
  currentDate: DateTime,    // 流逝后的完整时间对象
  detailedDiff: {           // 详细时间差
    years: number,
    months: number,
    days: number,
    hours: number,
    minutes: number,
    seconds: number
  },
  changes: {                // 本次流逝引起的变化量
    sec: number,
    min: number,
    hour: number,
    day: number,
    week: number,
    month: number,
    year: number
  },
  cumulative: {             // 累积时间量
    sec: number,
    min: number,
    hour: number,
    day: number,
    week: number,
    month: number,
    year: number
  },
  triggeredByAccumulator: { // 仅当由累积触发时存在
    unit: string,            // 触发单位
    target: number           // 触发目标值
  }
}
```
  #### 时间事件使用示例  
```
// 基础事件类型示例
maplebirch.state.regTimeEvent('onSec', 'sec-counter', {
  action: () => V.secondCounter = (V.secondCounter || 0) + 1,
  description: '每秒计数器'
});

maplebirch.state.regTimeEvent('onMin', 'minute-alert', {
  action: () => console.log('又过去了一分钟'),
  cond: () => V.player.awake, // 仅在玩家清醒时触发
  priority: 5,
  description: '每分钟提示'
});

// 精确时间点事件
maplebirch.state.regTimeEvent('onHour', 'dawn-event', {
  action: () => {
    if (Time.hour === 6) {
      console.log('黎明到来，新的一天开始了');
      V.energy += 20; // 清晨精力恢复
    }
  },
  exact: true,
  description: '黎明事件'
});

// 周期性累积事件
maplebirch.state.regTimeEvent('onDay', 'fatigue-system', {
  action: (data) => {
    const hoursAwake = data.cumulative.hour;
    if (hoursAwake > 16) {
      V.fatigueLevel = Math.min(10, V.fatigueLevel + 1);
      console.log(`连续清醒${hoursAwake}小时，疲劳度增加`);
    }
  },
  accumulate: { unit: 'hour', target: 1 },
  description: '疲劳度累积系统'
});

// 周循环事件
maplebirch.state.regTimeEvent('onWeek', 'market-day', {
  action: () => {
    if (Time.weekDay === 6) { // 星期六
      V.marketOpen = true;
      console.log('周末集市开放！');
    }
  },
  exact: true,
  description: '周末集市'
});

// 月相事件
maplebirch.state.regTimeEvent('onMonth', 'full-moon', {
  action: () => {
    if (Time.moonPhase === 'full') {
      console.log('满月之夜，特殊事件触发');
      V.werewolfForm = true;
    }
  },
  cond: () => Time.hour === 23, // 仅在夜晚触发
  description: '满月事件'
});

// 年度事件
maplebirch.state.regTimeEvent('onYear', 'birthday-event', {
  action: () => {
    console.log(`今天是${V.playerName}的生日！`);
    V.age += 1;
    V.birthdayGift = true;
  },
  cond: (data) => 
    data.currentDate.month === V.playerBirthMonth && 
    data.currentDate.day === V.playerBirthDay,
  once: false, // 每年重复
  description: '角色生日'
});

// 时间旅行事件
maplebirch.state.regTimeEvent('onTimeTravel', 'time-paradox', {
  action: (data) => {
    const diff = data.diffSeconds;
    if (Math.abs(diff) > 31536000) { // 超过1年
      console.warn('严重时间悖论警告！');
      V.timeParadoxCount = (V.timeParadoxCount || 0) + 1;
    }
  },
  priority: 100, // 最高优先级
  description: '时间悖论检测'
});

// 复合事件处理
maplebirch.state.regTimeEvent('onAfter', 'save-autosave', {
  action: (data) => {
    if (data.changes.day > 0) {
      console.log('每日自动存档');
      Save.slot.save('auto');
    }
  },
  description: '自动存档系统'
});

// 一次性事件示例
maplebirch.state.regTimeEvent('onDay', 'special-event-2025', {
  action: () => {
    console.log('限时事件触发！');
    V.specialEventCompleted = true;
  },
  cond: (data) => 
    data.currentDate.year === 2025 && 
    data.currentDate.month === 10 && 
    data.currentDate.day === 5,
  once: true, // 仅触发一次
  priority: 10,
  description: '2025年限定事件'
});

// 带累积的精确事件
maplebirch.state.regTimeEvent('onMin', 'meditation', {
  action: (data) => {
    if (data.triggeredByAccumulator) {
      console.log(`冥想完成！累计${data.triggeredByAccumulator.count}分钟`);
      V.meditationMinutes += data.triggeredByAccumulator.count;
    }
  },
  accumulate: { unit: 'min', target: 15 },
  exact: true, // 只在整15分钟时触发
  description: '冥想计时器'
});

// 条件复杂的事件
maplebirch.state.regTimeEvent('onHour', 'guard-patrol', {
  action: () => {
    const hour = Time.hour;
    if (hour >= 2 && hour <= 4) {
      console.log('深夜守卫巡逻');
      V.guardAlertLevel = 'high';
    }
  },
  cond: () => V.location === 'castle' && V.playerStealth < 30,
  priority: 7,
  description: '守卫巡逻系统'
});
```
 ### 时间旅行
  #### 使用示例
  - 此功能允许游戏时间向前或向后跳跃，支持精确时间点和相对时间偏移两种模式(时间旅行会触发 **'onTimeTravel'** 事件，并自动重置累积时间计数器)  
```
// 1. 精确时间点旅行（跳转到特定日期时间）
maplebirch.state.timeTravel({
  year: 2025,      // 目标年份
  month: 10,       // 目标月份 (1-12)
  day: 15,         // 目标日期 (1-31)
  hour: 14,        // 目标小时 (0-23, 可选)
  minute: 30,      // 目标分钟 (0-59, 可选)
  second: 0        // 目标秒数 (0-59, 可选)
});

// 2. 相对时间偏移（从当前时间加减）
maplebirch.state.timeTravel({
  addDays: 7,      // 向前推进7天
  addHours: -3     // 同时回退3小时
});

// 3. 使用DateTime对象指定目标时间
const targetDate = new DateTime(2026, 3, 20, 9, 0, 0);
maplebirch.state.timeTravel({
  target: targetDate
});

// 4. 复杂时间跳跃（结合绝对和相对）
maplebirch.state.timeTravel({
  year: 2025,      // 跳转到2025年
  addMonths: 6     // 再向前推进6个月
});

// 5. 时间旅行事件监听
maplebirch.events.on(':onTimeTravel', (data) => {
  console.log(`时间旅行完成: ${data.prev} → ${data.current}`);
  console.log(`方向: ${data.direction}, 时间差: ${data.diffSeconds}秒`);
});
```
  #### 选项参数
```
A. 精确时间点模式:
  - target: DateTime对象 或
  - year: 目标年份 (支持负数表示公元前)
  - month: 目标月份 (1-12)
  - day: 目标日期 (1-31)
  - hour: 目标小时 (0-23, 默认0)
  - minute: 目标分钟 (0-59, 默认0)
  - second: 目标秒数 (0-59, 默认0)

B. 相对时间偏移模式:
  - addYears: 增加的年数 (可负)
  - addMonths: 增加的月数 (可负)
  - addDays: 增加的天数 (可负)
  - addHours: 增加的小时数 (可负)
  - addMinutes: 增加的分钟数 (可负)
  - addSeconds: 增加的秒数 (可负)
```
 ### 音频管理
   #### 导入音频文件
  + 用sugarcube从游戏中导入文件 `<input type='file' accept='audio/*' onchange='maplebirch.audio.addAudioFromFile(this.files[0], ['你的模组名']).then(success => {if (success) maplebirch.audio.initStorage()});'>` ，其中 **['你的模组名']** 指的是你的模组所存储的音频文件。
  + 从模组中导入音频文件，最后在 **钩子依赖中用(`await maplebirchFramework.addAudio(你的模组名)`)** 或者 用 其它地方使用 **`await maplebirchFramework.addAudio(你的模组名)`** 来导入你模组zip里的音频文件
```
根目录/  
└── audio/  
    ├── XX.mp3
    ├── xx.wav  
    └── 音频文件等
```
  #### 使用示例
```
// 1. 从文件添加音频
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = 'audio/*';
fileInput.onchange = async (e) => {
  const file = e.target.files[0];
  await maplebirch.audio.addAudioFromFile(file, my-mod);
};
fileInput.click();

// 2. 从Mod加载音频
await maplebirch.audio.importAllAudio('my-mod', 'audio');

// 3. 获取音频播放器
const player = maplebirch.audio.getPlayer('maplebirch-audio');

// 4. 播放音频
player.play('background-music', {
  loop: true,
  volume: 0.7,
  allowOverlap: false
});

// 5. 暂停/恢复音频
player.togglePause('background-music');

// 6. 停止音频
player.stop('background-music');

// 7. 设置全局音量
player.setVolume(0.5);

// 8. 设置单个音频音量
player.setVolumeFor('sound-effect', 0.8);

// 9. 设置循环次数
player.setLoopCount('notification', 3);

// 10. 检查正在播放的音频
const playing = player.isPlaying();
console.log('正在播放:', playing);

// 11. 获取音频时长
const duration = player.getDuration('background-music');
console.log('音频时长:', duration);
```
  #### 参数说明
```
play() 方法选项:
  - loop: 是否循环播放 (默认false)
  - loopCount: 循环次数 (默认100)
  - volume: 音量 (0.0-1.0, 默认1.0)
  - offset: 开始播放位置 (秒)
  - duration: 播放时长 (秒)
  - allowOverlap: 是否允许多个实例同时播放 (默认false)
  - stopOthers: 是否停止其他正在播放的同名音频 (默认false)
  - onEnded: 播放结束回调函数
```
 ### 变量迁徙
  #### 使用示例
```
// 创建迁移系统（带日志记录）
const migrator = maplebirchFrameworks.migration.create();

// 添加迁移脚本（1.0.0 → 1.1.0）
migrator.add('1.0.0', '1.1.0', (data, utils) => {
  utils.rename(data, 'user.name', 'user.fullname');
  utils.remove(data, 'deprecatedField');
});

// 准备数据（带当前版本号）
const userData = { version: '1.0.0', user: { name: 'Alice' } };

// 执行迁移到目标版本
migrator.run(userData, '2.0.0');

// 填充默认值
migrator.utils.fill(userData, { settings: { theme: 'dark' } });
```
  #### 主要方法
- `create()`: 创建迁移器实例，返回包含add/run/utils的对象
- `add(fromVersion, toVersion, migrationFn)`: 添加迁移脚本
- `run(data, targetVersion)`: 执行数据迁移
  #### 工具集
- `resolvePath(obj, path, createIfMissing)`: 解析对象路径
- `rename/move(data, oldPath, newPath)`: 重命名/移动属性
- `remove(data, path)`: 删除属性
- `transform(data, path, transformer)`: 转换属性值
- `fill(target, defaults, options)`: 填充缺失属性
 ### 随机数生成
  + `const num1 = maplebirchFrameworks.getRandom();` // 1-100的随机整数  
  + `const num2 = maplebirchFrameworks.getRandom(10);` // 0-9的随机整数  
  + `const num3 = maplebirchFrameworks.getRandom({min:5, max:10});` // 5-10的随机整数  
  + `const num4 = maplebirchFrameworks.getRandom({min:1, max:5, float:true});` // 1-5的随机浮点数  
  + `const item = maplebirchFrameworks.getRandom(['a','b','c']);` // 随机选择数组元素  
 ### 文本片段
  #### 注册文本
  - 使用 maplebirchFrameworks.addText 方法注册文本处理器
```
// 基本文本片段
maplebirchFrameworks.addText('welcome', (t) => {
  t.text('欢迎来到游戏世界！');
  t.line('在这里你将开始一段奇妙的冒险。');
});

// 带样式的文本片段
maplebirchFrameworks.addText('warning', (t) => {
  t.text('危险警告！', 'red-text');
  t.line('前方发现敌人，请做好准备！');
});

// 使用维基语法的文本片段
maplebirchFrameworks.addText('choice', (t) => {
  t.text('请选择你的行动：');
  t.wikify('[[攻击敌人|战斗]] [[悄悄离开|逃跑]]');
});

// 带动态数据的文本片段
maplebirchFrameworks.addText('greet', (t) => {
  t.text(`你好，${t.ctx.playerName}！`, 'greeting');
  t.line(`今天是${t.ctx.day}，天气${t.ctx.weather}`);
});

// 组合多个元素的复杂片段
maplebirchFrameworks.addText('treasure', (t) => {
  t.text('你发现了宝藏！', 'gold-text');
  t.line();
  t.text(`里面装着${t.ctx.itemName}`, 'item-desc');
  t.line();
  t.raw('<button id="takeTreasure">拾取</button>');
});
```
  #### 输出文本
  - 使用 <<maplebirchTextOutput>> 宏输出注册的文本片段
```
// 输出单个片段
<<maplebirchTextOutput "welcome">>

// 输出多个片段（按顺序显示）
<<maplebirchTextOutput "welcome, warning">>

// 传递上下文数据
<<maplebirchTextOutput "greet" {
  playerName: "冒险者",
  day: "星期一",
  weather: "晴朗"
}>>

// 组合使用
<<maplebirchTextOutput "welcome, treasure" {
  itemName: "黄金宝箱"
}>>
<<maplebirchTextOutput "个性化问候" { name: "玩家名称" }>>
```
 ### 作弊控制台
 + 在游戏中允许作弊以及便携调试数据

<details>
  <summary>点击查看图片</summary>
   <img width="926" height="618" alt="image" src="https://github.com/user-attachments/assets/3539c6a0-b7ed-4c98-a815-5462eeefbea9" />
</details>

 ### addto区域注册
 + 沿袭了[**简易框架**](https://github.com/emicoto/SCMLSimpleFramework)的addto区域注册，对区域进行了优化和修改。

<details>
 <summary>点击查看详细区域</summary>
    
| 区域名称                 | 位置说明                |
| :---------------------: | :---------------------: |
| `Init`                  | 初始化脚本区域（静态变量/Setup） |
| `DataInit`              | 初始化变量区域（读档/新游戏时注入模组变量） |
| `Header`                | 页面顶部区域             |
| `Footer`                | 页面底部区域             |
| `Information`           | 信息栏区域               |
| `Options`               | 选项菜单区域             |
| `Cheats`                | 作弊栏区域               |
| `Statistics`            | 统计栏区域               |
| `Journal`               | 日志尾部区域             |
| `BeforeLinkZone`        | 选项链接前区域           |
| `AfterLinkZone`         | 选项链接后区域           |
| `CaptionDescription`    | 标题描述区域             |
| `StatusBar`             | 状态栏区域               |
| `MenuBig`               | 大菜单区域               |
| `MenuSmall`             | 小菜单区域               |
| `CaptionAfterDescription`| 标题描述后区域           |
| `HintMobile`            | 移动端提示区（疼痛图标上方） |
| `StatsMobile`           | 移动端状态区域（疼痛等状态显示） |
| `CharaDescription`      | 角色描述区域             |
| `DegreesBonusDisplay`   | 属性加成显示区域         |
| `DegreesBox`            | 属性显示区域             |
| `SkillsBonusDisplay`    | 技能加成显示区域         |
| `SkillsBox`             | 技能显示区域             |
| `SubjectBoxBonusDisplay`| 学科加成显示区域         |
| `SchoolSubjectsBox`     | 学科显示区域             |
| `SchoolMarksText`       | 成绩显示区域             |
| `WeaponBox`             | 武器显示区域             |
| `Reputation`            | 声誉显示区域             |
| `Fame`                  | 知名度显示区域           |
| `StatusSocial`          | 自定义社交状态区域       |
| `NPCinit`               | 原版NPC初遇初始化区域    |
</details>

  #### 添加内容到指定区域
  - 支持三种内容类型
1. 字符串：直接作为宏名称使用
2. 函数：动态生成内容，返回字符串或宏代码
3. 对象：带条件的宏配置（支持`exclude`/`match`/`passage`等条件）
  - 条件渲染参数说明
1. `exclude`: 字符串或数组，指定不显示该内容的段落
2. `match`: 正则表达式，匹配段落标题
3. `passage`: 字符串或数组，指定显示该内容的段落
```
示例：
// 添加简单宏
maplebirchFrameworks.addTo('Header', 'customHeader');

// 添加动态生成的内容
maplebirchFrameworks.addTo('StatusBar', () => {
  return `<<print "生命值: ${V.player.health}">>`;
});

// 添加带条件的宏（排除特定段落）
maplebirchFrameworks.addTo('Options', {
  widget: 'debugOptions',
  exclude: ['MainMenu'] // 在主菜单不显示
});

// 添加带条件的宏（匹配特定段落）
maplebirchFrameworks.addTo('Journal', {
  widget: 'questLog',
  match: /Chapter\d+/ // 在所有章节段落显示
});

// 添加带条件的宏（指定段落）
maplebirchFrameworks.addTo('Information', {
  widget: 'tutorialHints',
  passage: ['Tutorial', 'Introduction'] // 仅在教程段落显示
});

// 组合条件（在战斗场景显示但排除过场动画）
maplebirchFrameworks.addTo('StatusBar', {
  widget: 'combatStatus',
  passage: ['Battle', 'BossFight'],
  exclude: 'Cutscene'
});
```
  #### 注册初始化函数
 - 注册在游戏初始化时需要执行的函数，用于设置初始变量、加载数据等
```
maplebirchFrameworks.onInit(() => {
  setup.modEnabled = true;
  console.log('模组已激活');
});

// 注册带参数的初始化函数
maplebirchFrameworks.onInit((playerName) => {
  V.player.modName = playerName;
}, '玩家名称');

// 注册多个初始化函数
maplebirchFrameworks.onInit(
  initPlayerData,
  loadModSettings,
  setupEventListeners
);

// 注册异步初始化函数
maplebirchFrameworks.onInit(async () => {
  const data = await fetchPlayerData();
  Object.assign(V.player, data);
});

// 错误处理
maplebirchFrameworks.onInit(() => {
  try {
    // 可能出错的代码
  } catch (e) {
    console.error('初始化失败:', e);
  }
});
```
 ### ​​简易弹窗
  + 使用`<<maplebirchReplace>>`宏来进行便携弹窗，基本用法 `<<maplebirchReplace "弹窗键名">>`
```
示例:
<!-- 基础弹窗 -->
<<maplebirchReplace "基础弹窗">>

<!-- 带标题的弹窗 -->
<<maplebirchReplace "设置弹窗" "title">>

<!-- 自定义弹窗 -->  // 此方法与 简易框架 的 <<iModReplace>> 一致
<<maplebirchReplace "自定义弹窗" "customize">>
```
 + 弹窗定义模板
```
<<widget '弹窗键名'>>
  <!-- 弹窗内容 -->
  这里是弹窗主体内容
<</widget>>

<<widget 'title弹窗键名'>>
  <!-- 弹窗标题栏 -->
  <<setupTabs>>
  <div id="overlayTabs" class="tab">
    <<closeButtonMobile>>
  </div>
  <<closeButton>>
<</widget>>
```
 ### 特质注册
  - 原版特质对照
| 英文类别名称        | 中文类别名称 |
| :----------------: | :---------: |
| General Traits     | 一般特质     |
| Medicinal Traits   | 医疗特质     |
| Special Traits     | 特殊特质     |
| School Traits      | 学校特质     |
| Trauma Traits      | 创伤特质     |
| NPC Traits         | NPC特质      |
| Hypnosis Traits    | 催眠特质     |
| Acceptance Traits  | 接纳特质     |
 - 使用 `maplebirchFrameworks.addTraits(...data)` 添加或更新角色特质
```
特质对象结构：
{
  title: "特质类别", // 如"一般特质" (支持函数)
  name: "特质名称",  // 如"勇敢" (支持函数)
  colour: "颜色值",  // 支持函数或字符串
  has: true/false,   // 是否拥有该特质 (支持函数)
  text: "描述文本"   // 特质详细描述 (支持函数)
}

示例：
// 添加新特质
maplebirchFrameworks.addTraits({
  title: "特殊特质",
  name: "魔法亲和",
  colour: "purple",
  has: () => V.player.magicAffinity,
  text: "对魔法元素有天然的亲和力"
});

// 动态名称和类别
maplebirchFrameworks.addTraits({
  title: () => V.player.isStudent ? "学生特质" : "成人特质",
  name: () => `时间管理-${V.player.level}`,
  colour: "green",
  has: true,
  text: "更有效地安排时间"
});

// 批量添加特质
maplebirchFrameworks.addTraits(
  { title: "一般特质", name: "勇敢", colour: "blue", has: true, text: "面对危险时更加镇定" },
  { title: "学校特质", name: "学霸", colour: "gold", has: () => V.player.grades > 90, text: "学习效率提高20%" }
);
```
 ### 地点注册
  + 使用 `maplebirchFrameworks.addLocation(locationId, config, options = {})` 定制游戏地点
```
参数说明：
@param {string} locationId - 地点ID
@param {object} config - 配置对象
@param {object} [options] - 配置选项
  - overwrite: 是否覆盖整个配置 (默认false)
  - layer: 指定操作图层 (base/emissive/reflective/layerTop)
  - element: 指定操作元素

示例：
// 添加新地点
maplebirchFrameworks.addLocation('magic_academy', {
  folder: 'magic_academy',
  base: { main: { image: 'main.png' } }
});

// 更新特定元素
maplebirchFrameworks.addLocation('lake_ruin', {
  condition: () => Weather.bloodMoon && !Weather.isSnow
}, { layer: 'base', element: 'bloodmoon' });

// 完全覆盖地点配置
maplebirchFrameworks.addLocation('cafe', {
  folder: 'cafe_remastered',
  base: { ... }
}, { overwrite: true });

// 添加新图层元素
maplebirchFrameworks.addLocation('forest', {
  image: 'fireflies.png',
  animation: { frameDelay: 300 }
}, { layer: 'emissive', element: 'fireflies' });
```
 ### NPC注册
 #### NPC的基本数据
 - 添加NPC角色 (maplebirchFrameworks.addNPC)
```
添加NPC角色 (maplebirchFrameworks.addNPC(npcData, config, translationsData))
----------------------------------------------
向游戏中添加新的NPC角色或更新现有NPC

@param {Object} npcData - NPC数据对象
@param {string} npcData.nam - NPC唯一名称（必需）
@param {string} [npcData.title] - NPC称号
@param {string} [npcData.gender="f"] - 性别 (m/f/none)
@param {string} [npcData.type="human"] - 种族类型
@param {Object} [config] - NPC配置选项
  - important: 是否重要NPC（显示在状态栏）
  - special: 是否为特殊NPC
  - loveInterest: 是否为恋爱NPC
@param {Object} [translationsData] - 翻译数据对象

示例：
// 添加新NPC
maplebirchFrameworks.addNPC({
  nam: "Alice",
  title: "Magic Mentor",
  gender: "f",
  type: "human",
  description: "一位神秘的精灵魔法师",
  eyeColour: "紫色",
  hairColor: "银色"
}, {
  important: true,
  special: false
}, {
  "Alice": { EN: "Alice", CN: "艾莉丝" },
  "Magic Mentor": { EN: "Magic Mentor", CN: "魔法导师" }
});

// 更新现有NPC
maplebirchFrameworks.addNPC({
  nam: "Robin",
  title: "shop boss",
  gender: "m",
  newStat: 50 // 添加新状态
});

// 动态属性
maplebirchFrameworks.addNPC({
  nam: "Seasonal Elves",
  title: () => `季节守护者-${Season.current()}`,
  gender: "none",
  description: () => `掌管${Season.current()}季节的精灵`
});
```
 #### 添加自定义状态
 - 添加或更新NPC的自定义状态系统(maplebirchFrameworks.addStats(statsObject))
```
@param {Object} statsObject - 状态配置对象
@param {Object} statsObject[statName] - 状态配置
  - min: 状态最小值
  - max: 状态最大值
  - position: 在状态列表中的位置 (数字索引/"first"/"last"/"secondLast")

示例：
// 添加新状态
maplebirchFrameworks.addStats({
  trust: {
    min: 0,
    max: 100,
    position: "secondLast" // 显示在倒数第二位
  },
  loyalty: {
    min: 0,
    max: 10,
    position: 3 // 显示在第四位
  }
});

// 更新现有状态
maplebirchFrameworks.addStats({
  love: {
    min: -100, // 允许负值
    max: 100,
    position: "first" // 移动到第一位
  }
});
```
 #### NPC的关系文本
- 在sugarcube中填写你的NPC的关系文本 **`<<widget '(你的npc名字)relationshiptext'>>`**
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
  #### NPC属性详解
<details>
  <summary>点击查看图片</summary>
  <img width="588" height="882" alt="image" src="https://github.com/user-attachments/assets/52f37940-9424-4efc-9a5a-e7e64f9d51ac" />
</details>

### 致谢
在此，我想向所有支持、帮助过这个项目的朋友们表达最诚挚的感谢：  
- 感谢 [Lyoko-Jeremie](https://github.com/Lyoko-Jeremie) 开发的Modloader系统，为模组开发提供了基础支持。
- 感谢 [Lyoko-Jeremie](https://github.com/Lyoko-Jeremie) 、[Number_Sir](https://github.com/NumberSir) 开发的模组编写助手工具，提升了开发效率。
- 感谢 [狐千月](https://github.com/emicoto) 制作的 [简易框架](https://github.com/emicoto/SCMLSimpleFramework) 提供了重要的功能参考。
- 感谢 [苯环](https://github.com/Nephthelana) 、[零环](https://github.com/ZeroRing233) 、 [丧心](https://github.com/MissedHeart) 给予的技术指导。
- 感谢 污度孤儿中国模组制作群 提供的交流环境和新手引导。

### 未实现的功能构想

- 人类体型战斗系统重置、完善制作全新npc架构(画布...)













