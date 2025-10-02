# SCML-DOL-maplebirchframework
`maplebirchFramework` 是基于 **Sugarcube2 ModLoader** 为 **Degrees-of-Lewdity** 游戏设计的模块化开发框架，旨在能够为游戏扩展模组的开发提供一些便利，让开发者能够更轻松地构建和维护模组内容。
***
## 目录
- [基本介绍](#基本介绍)
- [安装与依赖方式说明](#安装与依赖方式说明)
- [反馈与讨论方式](#反馈与讨论方式)
- [功能介绍与示例](#功能介绍与示例)
    - [多语言管理](#多语言管理)
    - [事件注册](#事件注册)
    - [模块管理](#模块管理)
    - [时间事件](#时间事件)
        - [时间事件的注册方式](#时间事件的注册方式)
        - [时间事件的配置选项](#时间事件的配置选项)
        - [时间数据对象](#时间数据对象)
        - [时间事件使用示例](#时间事件使用示例)
    - [时间旅行](#时间旅行)
        - [使用示例](#使用示例)
        - [选项参数](#选项参数(二选一))
    - [音频管理](#音频管理)
        - [导入音频文件](#导入音频文件)
        - [使用示例](#使用示例)
        - [参数说明](#参数说明)
    - [变量迁徙](#变量迁徙)
        - [使用示例](#使用示例)
        - [主要方法](#主要方法)
        - [工具集](#工具集(utils))
    - [随机数生成](#随机数生成)
    - [文本片段](#文本片段)
    - [作弊控制台](#作弊控制台)
    - [​​区域注册](#​​区域注册)
    - [​​简易弹窗](#​​​​简易弹窗)
    - [特质注册](#特质注册)
    - [地点注册](#地点注册)
    - [NPC注册](#NPC注册)
- [致谢](#致谢)
- [未实现的功能构想](#未实现的功能构想)

## 基本介绍
- 本框架写成于 **Degrees-of-Lewdity-v0.5.4.9** 版本，将会持续随着游戏版本而更新。如 **Degrees-of-Lewdity-v0.5.4.9** 往前的版本不会考虑兼容。  

- 对于原来使用[**简易框架**](https://github.com/emicoto/SCMLSimpleFramework)的模组，可以直接将[**简易框架**](https://github.com/emicoto/SCMLSimpleFramework)替换成[**秋枫白桦框架**](https://github.com/MaplebirchLeaf/SCML-DOL-maplebirchframework)尝试执行，基本兼容了原依赖[**简易框架**](https://github.com/emicoto/SCMLSimpleFramework)的模组(如: [**猫咖出租屋**](https://github.com/Maomaoi/Degrees-of-Lewdity-Cattery))，但不兼容强依赖的模组(如: [**泰拉瑞亚拓展**](https://github.com/Nephthelana/DOL-Terra-Expanding-Modd/))，以及我之前的秋枫白桦拓展。  

- 提供了映射接口 `maplebirchFrameworks` 和 `simplebirchFrameworks` 对 `maplebirch` 的映射和快捷使用，以及防止大幅破坏原结构。

| 提供的功能 | 映射方法使用 | 对应路径 |
| :-: | :-: | :-: |
| 导入语言文件 | maplebirchFrameworks.addLanguage / simplebirchFrameworks.addLanguage | maplebirch.lang.importAllLanguages |
| 注册时间事件 | maplebirchFrameworks.addTimeEvent / simplebirchFrameworks.addTimeEvent | maplebirch.state.regTimeEvent |
| 时间旅行 | maplebirchFrameworks.timeTravel / simplebirchFrameworks.timeTravel | maplebirch.state.timeTravel |
| 导入音频文件 | maplebirchFrameworks.addAudio / simplebirchFrameworks.addAudio | maplebirch.audio.importAllAudio |
| 获取音频播放实例 | maplebirchFrameworks.getPlayer / simplebirchFrameworks.getPlayer | maplebirch.audio.getPlayer |
| 变量迁徙实例 | maplebirchFrameworks.migration / simplebirchFrameworks.migration | maplebirch.tool.migration.create |
| 获取随机值 | maplebirchFrameworks.getRandom / simplebirchFrameworks.getRandom | maplebirch.tool.random.get |
| 注册文本片段 | maplebirchFrameworks.addText / simplebirchFrameworks.addText | maplebirch.tool.text.reg |
| addto区域注册 | maplebirchFrameworks.addto / simplebirchFrameworks.addto | maplebirch.tool.framework.addTo |
| 初始化函数脚本 | maplebirchFrameworks.onInit / simplebirchFrameworks.onInit | maplebirch.tool.framework.onInit |
| 添加特质 | maplebirchFrameworks.addTraits / simplebirchFrameworks.addTraits | maplebirch.tool.other.addTraits |
| 添加地点 | maplebirchFrameworks.addLocation / simplebirchFrameworks.addLocation | maplebirch.tool.other.configureLocation |
| 添加NPC | maplebirchFrameworks.addNPC / simplebirchFrameworks.addNPC | maplebirch.npc.add |
| 添加NPC状态 | maplebirchFrameworks.addStats / simplebirchFrameworks.addStats | maplebirch.npc.addStats |

<details>
<summary>现已实现的功能</summary>
    
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
  <img width="1837" height="1182" alt="image" src="https://github.com/user-attachments/assets/59f70994-0709-4661-be53-5496967f0679" />
</details>


+ 第二种依赖申明(利用模组加载器的钩子): 这种方法可以让依赖框架的模组在框架之前加载。 
<details>
  <summary>点击查看图片</summary>
  <img width="1848" height="1192" alt="image" src="https://github.com/user-attachments/assets/dd8aca44-0619-4f1f-bec5-8d1f2f30f5f4" />
</details>

## 反馈与讨论方式
 (暂无)，或在**污度孤儿中国模组制作群**联系我。

## 功能介绍与示例:
 ### 多语言管理
  - 通常的翻译文件存放路径:  
  ```
    根目录/  
    └── translations/  
        ├── cn.json  
        ├── en.json  
        └── jp.json
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
 ### 事件注册
  - 使用 `maplebirch.on(evt[触发的时机], handler[需要触发的函数], desc = ''[你注册事件的标识符])` 进行事件注册
  - 使用 `maplebirch.once(evt[触发的时机], handler[需要触发的函数], desc = ''[你注册事件的标识符])` 进行一次性事件注册，即生效一次后删除
  - 使用 `maplebirch.off(evt[触发的时机], identifier[已注册事件的标识符])` 进行删除已注册的回调事件
  - 使用 `maplebirch.trigger(evt[触发的时机], ...args[需要传导的上下文变量])` 进行触发以及传递环境变量
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
  #### 选项参数(二选一)
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
  #### 工具集(utils):
- `resolvePath(obj, path, createIfMissing)`: 解析对象路径
- `rename/move(data, oldPath, newPath)`: 重命名/移动属性
- `remove(data, path)`: 删除属性
- `transform(data, path, transformer)`: 转换属性值
- `fill(target, defaults, options)`: 填充缺失属性
  
 ### 随机数生成
 ### 文本片段
 ### 作弊控制台
 ### 区域注册
 ### 特质注册
 ### 地点注册
 ### NPC注册


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
地点配置方法（添加/更新）
@param {string} locationId - 地点ID
@param {object} config - 配置对象
@param {object} [options] - 配置选项
@param {boolean} [options.overwrite=false] - 是否覆盖整个配置
@param {string} [options.layer] - 指定操作图层
@param {string} [options.element] - 指定操作元素

示例1：添加新地点
configureLocation('magic_academy', {
  folder: 'magic_academy',
  base: { main: { image: 'main.png' } }
});

示例2：更新特定元素
configureLocation('lake_ruin', {
  condition: () => Weather.bloodMoon && !Weather.isSnow
}, { layer: 'base', element: 'bloodmoon' });

示例3：完全覆盖地点
configureLocation('cafe', {
  folder: 'cafe_remastered',
  base: { ... }
}, { overwrite: true });

示例4：添加新图层元素
configureLocation('forest', {
  image: 'fireflies.png',
  animation: { frameDelay: 300 }
}, { layer: 'emissive', element: 'fireflies' });
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
  - `text(content: string, style?: string)`：添加文本（可选样式），自动添加空格
  - `line(content?: string, style?: string)`：添加换行（可带文本内容）
  - `wikify(content: string)`：解析并添加维基语法文本
  - `raw(content: any)`：直接添加原始内容（DOM节点/字符串）
  - `ctx: object`：渲染上下文数据

所有方法支持链式调用，例如：
  text("你好").line("世界").text("！", "bold");

@example // 基本注册和渲染
// 注册处理器
text.reg("welcome", ({ text }) => {
  text("欢迎来到奇幻世界！");
});

// 在SugarCube中使用
<<maplebirchTextOutput "welcome">>

// 生成结果：
// <span>欢迎来到奇幻世界！ </span>

@example // 带样式的文本
// 注册处理器
text.reg("warning", ({ text, line }) => {
  text("危险区域！", "red").line("请小心前进", "yellow");
});

// 在SugarCube中使用
<<maplebirchTextOutput "warning">>

// 生成结果：
// <span class="red">危险区域！ </span><br>
// <span class="yellow">请小心前进 </span>

@example // 使用上下文
// 注册处理器
text.reg("character_info", ({ text, ctx }) => {
  text(`姓名：${ctx.name}`)
    .text(`职业：${ctx.class}`)
    .text(`等级：${ctx.level}`);
});

// 在SugarCube中使用
<<set $player = { name: "艾拉", class: "游侠", level: 12 }>>
<<maplebirchTextOutput "character_info" $player>>

// 生成结果：
// <span>姓名：艾拉 </span>
// <span>职业：游侠 </span>
// <span>等级：12 </span>

@example // 维基语法解析
// 注册处理器
text.reg("npc_dialogue", ({ text, wikify, ctx }) => {
  text(`${ctx.npcName}:`).line();
  wikify(`"旅途小心，$player。[[前往${ctx.location}->NextScene]]"`);
});

// 在SugarCube中使用
<<set $npc = { npcName: "老巫师", location: "黑森林" }>>
<<maplebirchTextOutput "npc_dialogue" $npc>>

// 生成结果：
// <span>老巫师: </span><br>
// <span class="macro-text">"旅途小心，小明。</span>
// <a class="link-internal" href="NextScene">前往黑森林</a>
// <span class="macro-text">"</span>

@example // 组合元素与动态内容
// 注册处理器
text.reg("quest", ({ text, line, raw, ctx }) => {
  text(`任务：${ctx.title}`, "quest-title").line(ctx.description).line();
  
  const progress = document.createElement("progress");
  progress.value = ctx.progress;
  progress.max = 100;
  raw(progress);
  
  line(`进度：${ctx.progress}%`, "small-text");
});

// 在SugarCube中使用
<<set $quest = {
  title: "击败洞穴巨魔",
  description: "清除洞穴中的巨魔威胁",
  progress: 30
}>>
<<maplebirchTextOutput "quest" $quest>>

// 生成结果：
// <span class="quest-title">任务：击败洞穴巨魔 </span><br>
// <span>清除洞穴中的巨魔威胁 </span><br>
// <progress value="30" max="100"></progress><br>
// <span class="small-text">进度：30% </span>

@example // 嵌套渲染
// 注册处理器
text.reg("scene_container", async ({ text, raw, ctx }) => {
  text("=== 场景开始 ===").line();
  
  const nestedFrag = await text.renderFragment([
    "location_description",
    "npc_dialogue"
  ], ctx);
  
  raw(nestedFrag);
  
  text("=== 场景结束 ===").line();
});

text.reg("location_description", ({ text, ctx }) => {
  text(`你来到了${ctx.location}。`).line();
});

text.reg("npc_dialogue", ({ text, ctx }) => {
  text(`${ctx.npcName}说：`).text(ctx.dialogue);
});

// 在SugarCube中使用
<<set $sceneCtx = {
  location: "神秘洞穴",
  npcName: "守护者",
  dialogue: "这里藏着古老的宝藏。"
}>>
<<maplebirchTextOutput "scene_container" $sceneCtx>>

// 生成结果：
// <span>=== 场景开始 === </span><br>
// <span>你来到了神秘洞穴。 </span><br>
// <span>守护者说： </span><span>这里藏着古老的宝藏。 </span>
// <span>=== 场景结束 === </span><br>
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











