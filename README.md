# SCML-DOL-maplebirchframework
`maplebirchFramework` 是基于 **Sugarcube2 ModLoader** 为 **Degrees-of-Lewdity** 游戏设计的模块化开发框架，旨在能够为游戏扩展模组的开发提供一些便利，让开发者能够更轻松地构建和维护模组内容。
***
## 目录
- [基本介绍](#基本介绍)
- [安装与依赖方式说明](#安装与依赖方式说明)
- [反馈与讨论方式](#反馈与讨论方式)
- [功能介绍与示例](#功能介绍与示例)
    - [多语言管理](#多语言管理)
        - [语言addonPlugin注册](#语言addonPlugin注册)
    - [事件注册](#事件注册)
    - [模块管理](#模块管理)
    - [状态事件](#状态事件)
        - [状态事件的注册方式](#状态事件的注册方式)
        - [状态事件的配置选项](#状态事件的配置选项)
        - [状态事件使用示例](#状态事件使用示例)
    - [时间事件](#时间事件)
        - [时间事件的注册方式](#时间事件的注册方式)
        - [时间事件的配置选项](#时间事件的配置选项)
        - [时间数据对象](#时间数据对象)
        - [时间事件使用示例](#时间事件使用示例)
    - [时间旅行](#时间旅行)
        - [时间旅行使用示例](#时间旅行使用示例)
        - [选项参数](#选项参数)
    - [音频管理](#音频管理)
        - [导入音频文件](#导入音频文件)
        - [音频使用示例](#音频使用示例)
        - [参数说明](#参数说明)
        - [音频addonPlugin注册](#音频addonPlugin注册)
    - [框架的实用工具](#框架的实用工具)
        - [一般实用工具](#一般实用工具)
        - [灵活的条件匹配](#灵活的条件匹配)
        - [Sugarcube宏](#Sugarcube宏)
    - [变量迁徙](#变量迁徙)
        - [变量迁徙使用示例](#变量迁徙使用示例)
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
        - [区域addonPlugin注册](#区域addonPlugin注册)
    - [简易弹窗](#简易弹窗)
    - [特质注册](#特质注册)
        - [特质addonPlugin注册](#特质addonPlugin注册)
    - [地点注册](#地点注册)
    - [商店注册](#商店注册)
        - [特别参数说明](#特别参数说明)
        - [商店addonPlugin的注册](#商店addonPlugin的注册)
        - [商店使用示例](#商店使用示例)
    - [NPC注册](#NPC注册)
        - [NPC的基本数据](#NPC的基本数据)
        - [添加自定义状态](#添加自定义状态)
        - [添加NPC服装库数据](#添加NPC服装库数据)
        - [NPC的关系文本](#NPC的关系文本)
        - [NPC属性详解](#NPC属性详解)
        - [NPC的addonPlugin注册](#NPC的addonPlugin注册)
    - [NPC侧绘](#NPC侧绘)
        - [NPC侧绘说明](#NPC侧绘说明)
        - [NPC侧绘的addonPlugin注册](#NPC侧绘的addonPlugin注册)
    - [气象管理](#气象管理)
        - [天气渲染修改](#天气渲染修改)
        - [天气渲染修改示例](#天气渲染修改示例)
- [致谢](#致谢)
- [未实现的功能构想](#未实现的功能构想)

## 基本介绍
- 本框架写成于 **Degrees-of-Lewdity-v0.5.4.9** 版本，将会持续随着游戏版本而更新。如 **Degrees-of-Lewdity-v0.5.4.9** 往前的版本不会考虑兼容。  

- 对于原来使用[**简易框架**](https://github.com/emicoto/SCMLSimpleFramework)的模组，可以直接将[**简易框架**](https://github.com/emicoto/SCMLSimpleFramework)替换成[**秋枫白桦框架**](https://github.com/MaplebirchLeaf/SCML-DOL-maplebirchframework)尝试执行，基本兼容了原依赖[**简易框架**](https://github.com/emicoto/SCMLSimpleFramework)的模组(如: [**猫咖出租屋**](https://github.com/Maomaoi/Degrees-of-Lewdity-Cattery))，但不兼容强依赖的模组(如: 旧版本的[**泰拉瑞亚拓展**](https://github.com/Nephthelana/DOL-Terra-Expanding-Modd/))，以及我之前的秋枫白桦拓展。  

- 提供了映射接口 `maplebirchFrameworks` 和 `simplebirchFrameworks` 对 `maplebirch` 的映射和快捷使用，以防止大幅破坏原结构。
- 对于使用[**简易框架**](https://github.com/emicoto/SCMLSimpleFramework) `lanSwitch` 函数或宏的模组依然可以继续使用。

| 提供的功能 | 映射方法使用 | 对应路径 |
| :-: | :-: | :-: |
| 导入语言文件 | `maplebirchFrameworks.addLanguage` / `simplebirchFrameworks.addLanguage` | `maplebirch.lang.importAllLanguages` |
| 注册状态事件 | `maplebirchFrameworks.addStateEvent` / `simplebirchFrameworks.addStateEvent` | `maplebirch.state.regStateEvent` |
| 注册时间事件 | `maplebirchFrameworks.addTimeEvent` / `simplebirchFrameworks.addTimeEvent` | `maplebirch.state.regTimeEvent` |
| 时间旅行 | `maplebirchFrameworks.timeTravel` / `simplebirchFrameworks.timeTravel` | `maplebirch.state.timeTravel` |
| 导入音频文件 | `maplebirchFrameworks.addAudio` / `simplebirchFrameworks.addAudio` | `maplebirch.audio.importAllAudio` |
| 获取音频播放实例 | `maplebirchFrameworks.getPlayer` / `simplebirchFrameworks.getPlayer` | `maplebirch.audio.getPlayer` |
| 变量迁徙实例 | `maplebirchFrameworks.migration` / `simplebirchFrameworks.migration` | `maplebirch.tool.migration.create` |
| 获取随机值 | `maplebirchFrameworks.getRand` / `simplebirchFrameworks.getRand` | `maplebirch.tool.rand.get` |
| 注册文本片段 | `maplebirchFrameworks.addText` / `simplebirchFrameworks.addText` | `maplebirch.tool.text.reg` |
| addto区域注册 | `maplebirchFrameworks.addto` / `simplebirchFrameworks.addto` | `maplebirch.tool.framework.addTo` |
| 初始化函数脚本 | `maplebirchFrameworks.onInit` / `simplebirchFrameworks.onInit` | `maplebirch.tool.framework.onInit` |
| 添加特质 | `maplebirchFrameworks.addTraits` / `simplebirchFrameworks.addTraits` | `maplebirch.tool.other.addTraits` |
| 添加地点 | `maplebirchFrameworks.addLocation` / `simplebirchFrameworks.addLocation` | `maplebirch.tool.other.configureLocation` |
| 添加NPC | `maplebirchFrameworks.addNPC` / `simplebirchFrameworks.addNPC` | `maplebirch.npc.add` |
| 添加NPC状态 | `maplebirchFrameworks.addStats` / `simplebirchFrameworks.addStats` | `maplebirch.npc.addStats` |
| 添加NPC服装数据 | `maplebirchFrameworks.addNPCClothes` / `simplebirchFrameworks.addNPCClothes` | `maplebirch.npc.addClothes` |
| 气象管理 | `maplebirchFrameworks.modifyWeather` / `simplebirchFrameworks.modifyWeather` | `maplebirch.state.modifyWeather` |

<details>
<summary>点击查看现已实现的功能</summary>
    
| 功能模块 | 核心作用 |
| :-: | :-: |
| 多语言管理 | 提供国际化和多语言翻译支持 |
| 事件注册 | 允许注册和触发自定义事件 |
| 模块管理​ | 管理模组依赖和生命周期 |
| 状态事件 | 管理段落中的触发事件 |
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
| 商店注册 | 编写在游戏内添加商店 |
| NPC注册 | 为游戏内添加NPC​ |
| NPC侧绘 | 为游戏内添加NPC​的侧边栏立绘 |
| 气象管理 | 修改游戏内的气象相关功能 |
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


- 第二种依赖申明(利用模组加载器的钩子): 这种方法可以让依赖框架的模组在框架之前加载。 
<details>
  <summary>点击查看图片</summary>
  <img width="1848" height="1192" alt="image" src="https://github.com/user-attachments/assets/dd8aca44-0619-4f1f-bec5-8d1f2f30f5f4" />
</details>

- 第三种自助 `addonPlugin` 声明依赖只要用到了其中的功能框架就能检测，**详情**看对应区块说明 **(如果支持，推荐使用第三种声明方式)**。

```
"addonPlugin": [
    {
      "modName": "maplebirch",
      "addonName": "maplebirchAddon",
      "modVersion": "^2.4.0",
      "params": {
        "language": [],
        "audio": [""],
        "framework": [],
        "shop": [],
        "npc": [],
        "npcSidebar": [],
      }
    }
```

## 反馈与讨论方式
 (暂无)，或在**污度孤儿中国模组制作群**联系我。

## 功能介绍与示例:
 ### 多语言管理
  - 通常的翻译文件存放路径(支持 `.yml` 和 `.yaml` 格式文件):  
  ```
    根目录/  
    └── translations/
        ├── cn.yaml 
        ├── en.yaml   
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
  - 在 `cn.json` 文件中的示例
  ```
{
  "View All" : "查看全部",
  "View Headgear" : "查看外衣(头套)",
  "View Over Tops" : "查看外衣(上装)",
  "View Over Bottoms" : "查看外衣(下装)",
  "View Over Outfits" : "查看外衣(套装)",
  "View Outfits" : "查看套装",
  "View Tops" : "查看上装",
  "View Bottoms" : "查看下装",
  "View Under Outfits" : "查看内衣(套装)",
  "View Under Tops" : "查看内衣(上装)",
  "View Under Bottoms" : "查看内衣(下装)",
  "View Head Accessories" : "查看头饰",
  "View Face Accessories" : "查看面饰",
  "View Neck Accessories" : "查看颈饰",
  "View Handheld Items" : "查看手持物品",
  "View Hand Accessories" : "查看手饰",
  "View Legwear" : "查看袜子",
  "View Shoes" : "查看鞋类",
  "View Genital Wear" : "查看性器佩饰",
  "Changing room" : "更衣室",
  "Return clothes" : "归还衣服",
  "Buy clothes" : "购买衣物",
  "Buy clothes and send to wardrobe" : "购买衣物并送至衣柜",
  "Leave" : "离开",
}
  ```
  #### 语言addonPlugin注册
```
"params": {
  "language": true, // 布尔值：导入所有默认语言
  "language": ["CN", "EN"], // 数组：导入指定语言
  "language": { // 对象：自定义语言配置
    "CN": {
      "file": "translations/chinese.json" // 自定义文件路径
    },
    "EN": {
      "file": "translations/english.json" // 自定义文件路径
    }
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
 ### 状态事件
   #### 状态事件的注册方式
   - 使用 `maplebirchFrameworks.addStateEvent` 、 `simpleFrameworks.addStateEvent` 和 `maplebirch.state.regStateEvent` 任选其一注册时间事件
```
maplebirchFrameworks.addStateEvent(
  type,       // 事件类型 (字符串)
  eventId,    // 事件唯一标识符 (字符串)
  options     // 事件配置选项 (对象)
);

支持的事件类型：
- 'interrupt': 中断型事件 - 在段落开头触发，可选择是否中断后续内容显示
- 'overlay'  : 叠加型事件 - 在段落末尾触发，不影响主内容
```
  #### 状态事件的配置选项
 + **`output`** 文本输出 可与 **`action`** 回调函数 同时具有，但至少有其一
```
{
  output: 'widgetName',        // 可选：事件触发时输出的widget名称
  action: function() { ... },  // 可选：事件触发时执行的回调函数
  cond: function() { ... },    // 可选：条件检查函数，返回true时触发
  priority: 0,                 // 可选：事件优先级（数值越大优先级越高）
  once: false,                 // 可选：是否一次性事件（触发后自动移除）
  forceExit: false,            // 可选：是否强制中断（仅中断型事件有效）
  extra: {                     // 可选：段落过滤配置
    passage: ['passage1', 'passage2'],  // 指定段落名称数组
    exclude: ['passage3', 'passage4'],  // 排除段落名称数组  
    match: /pattern/                    // 正则表达式匹配段落名
  }
}
```
  #### 状态事件使用示例  
```
// 中断型事件 - 压力崩溃
maplebirchFrameworks.addStateEvent('interrupt', 'stress', {
  output: 'stress-widget',
  action: () => {
    V.stress / 5;
    console.log('压力过大导致崩溃！');
  },
  cond: () => V.stress >= V.stressmax;,
  forceExit: true, // 强制中断当前段落
});

// 叠加型事件 - 低金钱警告
maplebirchFrameworks.addStateEvent('overlay', 'low-money-warning', {
  output: 'moneyWarningWidget',
  cond: () => V.money < 5,
});
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
maplebirchFrameworks.addTimeEvent('onSec', 'sec-counter', {
  action: () => V.secondCounter = (V.secondCounter || 0) + 1,
});

maplebirchFrameworks.addTimeEvent('onMin', 'minute-alert', {
  action: () => console.log('又过去了一分钟'),
  cond: () => V.player.awake, // 仅在玩家清醒时触发
  priority: 5,
});

// 精确时间点事件
maplebirchFrameworks.addTimeEvent('onHour', 'dawn-event', {
  action: () => {
    if (Time.hour === 6) {
      console.log('黎明到来，新的一天开始了');
      V.energy += 20; // 清晨精力恢复
    }
  },
  exact: true,
});

// 周期性累积事件
maplebirchFrameworks.addTimeEvent('onDay', 'fatigue-system', {
  action: (data) => {
    const hoursAwake = data.cumulative.hour;
    if (hoursAwake > 16) {
      V.fatigueLevel = Math.min(10, V.fatigueLevel + 1);
      console.log(`连续清醒${hoursAwake}小时，疲劳度增加`);
    }
  },
  accumulate: { unit: 'hour', target: 1 },
});

// 周循环事件
maplebirchFrameworks.addTimeEvent('onWeek', 'market-day', {
  action: () => {
    if (Time.weekDay === 6) { // 星期六
      V.marketOpen = true;
      console.log('周末集市开放！');
    }
  },
  exact: true,
});

// 月相事件
maplebirchFrameworks.addTimeEvent('onMonth', 'full-moon', {
  action: () => {
    if (Time.moonPhase === 'full') {
      console.log('满月之夜，特殊事件触发');
      V.werewolfForm = true;
    }
  },
  cond: () => Time.hour === 23, // 仅在夜晚触发
});

// 年度事件
maplebirchFrameworks.addTimeEvent('onYear', 'birthday-event', {
  action: () => {
    console.log(`今天是${V.playerName}的生日！`);
    V.age += 1;
    V.birthdayGift = true;
  },
  cond: (data) => 
    data.currentDate.month === V.playerBirthMonth && 
    data.currentDate.day === V.playerBirthDay,
  once: false, // 每年重复
});

// 时间旅行事件
maplebirchFrameworks.addTimeEvent('onTimeTravel', 'time-paradox', {
  action: (data) => {
    const diff = data.diffSeconds;
    if (Math.abs(diff) > 31536000) { // 超过1年
      console.warn('严重时间悖论警告！');
      V.timeParadoxCount = (V.timeParadoxCount || 0) + 1;
    }
  },
  priority: 100, // 最高优先级
});

// 复合事件处理
maplebirchFrameworks.addTimeEvent('onAfter', 'save-autosave', {
  action: (data) => {
    if (data.changes.day > 0) {
      console.log('每日自动存档');
      Save.slot.save('auto');
    }
  },
});

// 一次性事件示例
maplebirchFrameworks.addTimeEvent('onDay', 'special-event-2025', {
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
});

// 带累积的精确事件
maplebirchFrameworks.addTimeEvent('onMin', 'meditation', {
  action: (data) => {
    if (data.triggeredByAccumulator) {
      console.log(`冥想完成！累计${data.triggeredByAccumulator.count}分钟`);
      V.meditationMinutes += data.triggeredByAccumulator.count;
    }
  },
  accumulate: { unit: 'min', target: 15 },
  exact: true, // 只在整15分钟时触发
});

// 条件复杂的事件
maplebirchFrameworks.addTimeEvent('onHour', 'guard-patrol', {
  action: () => {
    const hour = Time.hour;
    if (hour >= 2 && hour <= 4) {
      console.log('深夜守卫巡逻');
      V.guardAlertLevel = 'high';
    }
  },
  cond: () => V.location === 'castle' && V.playerStealth < 30,
  priority: 7,
});
```
 ### 时间旅行
  #### 时间旅行使用示例
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
  + 需要在你的 **`boot.json`** 文件中的 **`"additionFile"`** 填写你的文件路径，否则你的**音频文件**将不会被载入
```
示例：
"additionFile": [
  "audio/BiSH - innocent arrogance.mp3",
  "audio/Lizz Robinett,Lowlander - Bad Apple ~Reprise~ (English Version).mp3"
],
```
  #### 音频使用示例
```
// 1. 从文件添加音频(导入步骤)
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = 'audio/*';
fileInput.onchange = async (e) => {
  const file = e.target.files[0];
  await maplebirch.audio.addAudioFromFile(file, my-mod);
};
fileInput.click();

// 2. 从Mod加载音频(导入步骤)
await maplebirch.audio.importAllAudio('<模组名称>my-mod', '<音频路径>audio');

// 3. 获取音频播放器(播放步骤)
const player = maplebirch.audio.getPlayer('<模组名称>maplebirch-audio');

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

  #### 音频addonPlugin注册
```
"params": {
  "audio": true, // 布尔型：默认的 根目录/audio/ 的文件夹下的音频文件
  "audio": ["music", "audio"], // 数组型：自定义的 根目录/music/ 和 根目录/audio/ 文件夹下的音频文件
}
```
 ### 框架的实用工具
 + 可在 **非 `scriptFileList_inject_early` 时机** 使用如下逻辑，或 **确保可以使用的情况下** 使用。
 #### 一般实用工具
 + **`clone`** 函数
```
 - Date对象：创建新实例
 - RegExp对象：复制正则表达式
 - Map/Set对象：递归克隆元素
 - ArrayBuffer和TypedArray：复制底层缓冲区
 - 函数：直接返回原函数
 - 数组：递归克隆元素
 - 普通对象：复制所有可枚举属性（包括符号属性）
@param {any} source - 要克隆的对象（任意类型）
@param {Object} [options={}] - 克隆选项
@param {boolean} [options.deep=true] - 是否深克隆（默认true）
@param {boolean} [options.preservePrototype=true] - 是否保留原型链（默认true）
@param {WeakMap<object,any>} [map=new WeakMap()] - 内部WeakMap(处理循环引用，用户通常无需传递)
@returns {any} 克隆后的对象
@example
// 深克隆对象
const obj = { a: 1, b: { c: 2 } };
const cloned = clone(obj);
obj.b.c = 3; // 不影响克隆对象
console.log(cloned.b.c); // 2
@example
// 浅克隆数组
const arr = [1, [2, 3]];
const shallowCopy = clone(arr, { deep: false });
arr[1][0] = 99; // 影响克隆数组
console.log(shallowCopy[1][0]); // 99
   */
```
 + **`equal`** 函数
```
 - 基本类型：直接使用 === 比较
 - 日期对象：比较时间戳
 - 正则表达式：比较source和flags
 - 数组：递归比较每个元素
 - 普通对象：递归比较所有自身可枚举属性
 - 其他对象类型：使用默认比较规则
@param {any} a - 第一个比较值
@param {any} b - 第二个比较值
@returns {boolean} 是否相等
@example
// 比较日期对象
equal(new Date(2023, 0, 1), new Date(2023, 0, 1)); // true
@example
// 比较嵌套对象
equal({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] }); // true
@example
// 比较正则表达式
equal(/abc/i, /abc/i); // true
```
 + **`merge`** 函数
```
- 基本类型（string、number、boolean、function等）：直接覆盖目标值
- 对象：递归合并所有可枚举属性
- 数组：根据 arrayBehaviour 选项处理：
  - 'replace'：用源数组替换目标数组（默认）
  - 'concat'：将源数组连接到目标数组末尾
  - 'merge'：递归合并对应索引位置的数组元素
@param {Object} target - 目标对象（将被修改）
@param {...Object} sources - 要合并的源对象
@param {Object} [options] - 合并选项
@param {string} [options.arrayBehaviour='replace'] - 数组合并策略
@param {Function} [options.filterFn] - 属性过滤函数
@returns {Object} 合并后的目标对象
@example
// 基本合并
const target = { a: 1, b: { c: 2 } };
merge(target, { a: 3, b: { d: 4 } });
// 结果: { a: 3, b: { c: 2, d: 4 } }
@example
// 数组合并 - 替换策略
merge({ arr: [1, 2] }, { arr: [3, 4] });
// 结果: { arr: [3, 4] }
@example
// 数组合并 - 连接策略
merge({ arr: [1, 2] }, { arr: [3, 4] }, { arrayBehaviour: 'concat' });
// 结果: { arr: [1, 2, 3, 4] }
@example
// 数组合并 - 合并策略
const target = { arr: [{ a: 1 }, { b: 2 }] };
merge(target, { arr: [{ c: 3 }, { d: 4 }] }, { arrayBehaviour: 'merge' });
// 结果: { arr: [{ a: 1, c: 3 }, { b: 2, d: 4 }] }
@example
// 使用属性过滤
merge({}, { public: 'info', secret: 'data' }, {
  filterFn: (key) => key !== 'secret'
});
// 结果: { public: 'info' }
@example
// 合并多个源对象
merge({ a: 1 }, { b: 2 }, { c: 3 });
// 结果: { a: 1, b: 2, c: 3 }
```
 + **`contains`** 函数
```
 - 'any': 包含任意一个元素即返回true（默认）
 - 'all': 必须包含所有元素才返回true
 - 'none': 不包含任何元素才返回true
@param {Array<number|string>} arr - 目标数组
@param {any|Array<number|string>} value - 要查找的值或值数组
@param {Object} [options={}] - 配置选项
@param {string} [options.mode='any'] - 匹配模式('any', 'all', 'none')
@param {boolean} [options.caseSensitive=true] - 字符串是否区分大小写
@param {Function} [options.comparator] - 自定义比较函数(item, value) => boolean
@param {boolean} [options.deepEqual=false] - 是否使用深度相等比较
@returns {boolean} 检查结果
@example
// 检查单个元素
contains([1, 2, 3], 2); // true
@example
// 检查多个元素(all模式)
contains([1, 2, 3], [1, 2], { mode: 'all' }); // true
@example
// 检查多个元素(none模式)
contains([1, 2, 3], [4, 5], { mode: 'none' }); // true
@example
// 不区分大小写检查
contains(['a', 'B'], 'b', { caseSensitive: false }); // true
@example
// 深度对象检查
contains([{ a: 1 }], { a: 1 }, { deepEqual: true }); // true
```
 + **`random`** 函数
```
 - random()：返回0-1之间的随机浮点数
 - random(max)：返回0-max之间的随机整数
 - random(min, max)：返回min-max之间的随机整数
 - random(min, max, true)：返回min-max之间的随机浮点数
 - random({ min, max, float })：使用配置对象
@param {number|Object} [min] - 最小值或配置对象
@param {number} [max] - 最大值
@param {boolean} [float=false] - 是否生成浮点数（默认false）
@returns {number} 随机数
@example
// 生成0-1之间的随机浮点数
random(); // 0.756
@example
// 生成10-20之间的整数
random(10, 20); // 15
@example
// 生成5-10之间的浮点数
random(5, 10, true); // 7.231
@example
// 使用配置对象
random({ min: 5, max: 10, float: true }); // 7.231
```
 + **`either`** 函数
```
 - either([item1, item2, ...], options)
 - either(item1, item2, ..., options)
@param {Array<number|string>|any} itemsOrA - 选项数组或第一个选项
@param {...any} rest - 其他选项或配置对象
@param {Object} [options] - 配置选项
@param {number[]} [options.weights] - 选项权重数组（长度必须与选项一致）
@param {boolean} [options.allowNull=false] - 是否允许返回null（默认false）
@returns {any} 随机选择的选项（可能为null）
@example
// 简单随机选择
either(['a', 'b', 'c']); // 'b'
@example
// 加权随机选择
either(['a', 'b'], { weights: [0.8, 0.2] }); // 80%概率选'a'
@example
// 允许返回空值
either(['a', 'b'], { allowNull: true }); // 33%概率返回null
@example
// 直接传递选项
either('cat', 'dog', { weights: [0.3, 0.7] });
```
 + **`convert`** 函数
```
 @param {string} str - 要转换的字符串
 @param {string} [mode='lower'] - 转换模式:
   - 'upper': 全大写 (HELLO WORLD)
   - 'lower': 全小写 (hello world)
   - 'capitalize': 首字母大写 (Hello world)
   - 'title': 标题格式 (Hello World)
   - 'camel': 驼峰命名法 (helloWorld)
   - 'pascal': 帕斯卡命名法 (HelloWorld)
   - 'snake': 蛇形命名法 (hello_world)
   - 'kebab': 烤肉串命名法 (hello-world)
   - 'constant': 常量命名法 (HELLO_WORLD)
 @param {Object} [options={}] - 可选配置
 @param {string} [options.delimiter=' '] - 单词分隔符（用于title/camel/pascal模式）
 @param {boolean} [options.preserveAcronyms=true] - 是否保留首字母缩略词的大写
 @returns {string} 转换后的字符串
 @example
 // 基本用法
 convert('hello world', 'upper'); // 'HELLO WORLD'
 convert('Hello World', 'snake'); // 'hello_world'
 @example
 // 标题格式转换
 convert('the lord of the rings', 'title'); // 'The Lord of the Rings'
 @example
 // 驼峰命名法
 convert('user_profile_data', 'camel', { delimiter: '_' }); // 'userProfileData'
 @example
 // 保留首字母缩略词
 convert('NASA space program', 'title'); // 'NASA Space Program'
 convert('NASA space program', 'title', { preserveAcronyms: false }); // 'Nasa Space Program'
```
 #### 灵活的条件匹配
+ 这个类提供了多种匹配模式，包括精确匹配、范围匹配、集合匹配、子串匹配、正则匹配和比较匹配以及自定义条件函数匹配
```
**caseIncludes(substrings, result)**
  - 添加子字符串包含匹配条件
  - @param {string|string[]} substrings - 要匹配的子字符串或子字符串数组
  - @param {any} result - 匹配成功时返回的结果（可以是值或函数）
  - 当输入值是字符串且包含任意一个substrings中的子字符串时匹配

**caseRegex(regex, result)**
  - 添加正则表达式匹配条件
  - @param {RegExp} regex - 用于匹配的正则表达式对象
  - @param {any} result - 匹配成功时返回的结果（可以是值或函数）
  - 当输入值是字符串且匹配给定的正则表达式时匹配

**casePredicate(fn, result)**
  - 添加自定义条件函数
  - @param {Function} fn - 自定义条件函数，形式为 (input, meta) => boolean
  - @param {any} result - 匹配成功时返回的结果（可以是值或函数）
  - 当条件函数返回true时匹配，该函数接收输入值和元数据对象

**caseIn(values, result)**
  - 添加集合包含匹配条件
  - @param {Array} values - 要匹配的值数组
  - @param {any} result - 匹配成功时返回的结果
  - 当输入值严格等于values数组中的任意一个值时匹配

**caseRange(min, max, result)**
  - 添加数值范围匹配条件
  - @param {number} min - 范围最小值（包含）
  - @param {number} max - 范围最大值（包含）
  - @param {any} result - 匹配成功时返回的结果
  - 当输入值是数字且在[min, max]范围内时匹配

**caseCompare(comparator, value, result)**
  - 添加数值比较条件
  - @param {string} comparator - 比较运算符（'<', '<=', '>', '>='）
  - @param {number} value - 要比较的数值
  - @param {any} result - 匹配成功时返回的结果
  - 当输入值是数字且满足比较条件时匹配
```
+ 演示示例
```
@example <caption>基本用法（单一类型匹配）</caption>
// 创建数字选择器（所有条件都是数字类型）
const numberSelector = new selectCase()
  .case(1, 'One')
  .case(2, 'Two')
  .caseRange(3, 5, 'Three to Five')
  .caseCompare('>', 10, 'Greater than Ten')
  .else('Other number');

numberSelector.match(1); // 'One'
numberSelector.match(4); // 'Three to Five'
numberSelector.match(15); // 'Greater than Ten'
numberSelector.match(7); // 'Other number'

@example <caption>基本用法（字符串匹配）</caption>
// 创建字符串选择器（所有条件都是字符串类型）
const colorSelector = new selectCase()
  .case('red', '#FF0000')
  .case('green', '#00FF00')
  .case('blue', '#0000FF')
  .caseIncludes(['light', 'pale'], 'Light variant') // 包含子字符串匹配
  .caseRegex(/dark|black/i, 'Dark variant') // 正则表达式匹配
  .else('#FFFFFF');

colorSelector.match('green'); // '#00FF00'
colorSelector.match('light blue'); // 'Light variant'
colorSelector.match('dark red'); // 'Dark variant'
colorSelector.match('yellow'); // '#FFFFFF'
```
 #### Sugarcube宏
 + **`<<lanSwitch>>`** 简易双语的使用
```
  <<lanSwitch 'language' '语言'>> 会在中文时输出语言，英文时输出language 在模组设置中选择。
```
 + **`<<langlink>>`** 的说明: **`<<langlink>>`** 完全支持原版的 **`<<link>>`** 逻辑 [多语言管理](#多语言管理)，**`<<langlink>>`** 的第三个字符串将支持 **`convert`** 函数。
```
在你的翻译文件有对应数据时，使用 <<langlink '卧室' 'Bedroom'>><</langlink>> 会在游戏中英文时显示 (1)Bedroom ，中文时显示(1)卧室。
使用 <<langlink 'Temple' 'Temple'>><</langlink>> 会在游戏中英文时显示 (1)Temple ,中文时显示(1)神殿。
使用 <<langlink 'Temple' 'Temple' 'upper'>> 在英文情况将显示 (1)TEMPLE
使用 <<langlink [[卧室|Bedroom]]>><</langlink>> 时与 <<langlink 'Temple' 'Temple'>><</langlink>> 同理
```
 + **`<<langbutton>>`** 的说明: **`<<langbutton>>`** 完全支持原版的 **`<<button>>`** 逻辑，但添加了语言支持 [多语言管理](#多语言管理)，**`<<langbutton>>`** 的第三个字符串将支持 **`convert`** 函数。
```
在你的翻译文件有对应数据时，使用 <<langbutton '卧室'>><</langbutton>> 会在游戏中英文时显示 (1)Bedroom ，中文时显示(1)卧室。
使用 <<langbutton 'Temple'>><</langbutton>> 会在游戏中英文时显示 (1)Temple ，中文时显示(1)神殿。
使用 <<langbutton 'Temple' 'upper'>><</langbutton>> 会在游戏中英文时显示 (1)TEMPLE
```
 + **`<<radiobuttonsfrom>>`** 的说明，它是 **`<<radiobutton>>`** 宏的变种
```
生成包含多个label元素的span容器，每个label包含：
- 一个单选按钮input元素
- 对应的选项文本
- 选项间的分隔符
基本用法 - 创建颜色选择单选按钮组
<<radiobuttonsfrom "favoriteColor" ["红色", "蓝色", "绿色"]>>
自定义分隔符
<<radiobuttonsfrom "gender" ["男", "女", "其他"] " - ">>
使用变量作为选项源
<<set $colors = ["红", "蓝", "绿"]>>
<<radiobuttonsfrom "selectedColor" $colors>>
```
 ### 变量迁徙
  #### 变量迁徙使用示例
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
  + `const num1 = maplebirchFrameworks.getRand();` // 1-100的随机整数  
  + `const num2 = maplebirchFrameworks.getRand(10);` // 0-9的随机整数  
  + `const num3 = maplebirchFrameworks.getRand({min:5, max:10});` // 5-10的随机整数  
  + `const num4 = maplebirchFrameworks.getRand({min:1, max:5, float:true});` // 1-5的随机浮点数  
  + `const item = maplebirchFrameworks.getRand(['a','b','c']);` // 随机选择数组元素  
 ### 文本片段
 + 核心方法
```
- reg(key, handler, [id]): 注册处理器
- unreg(key, [idOrHandler]): 注销处理器
```
 + 渲染工具链说明 (handler的't'参数)
```
- text(content, style): 添加文本(可选CSS类)
- line(content, style): 添加换行+文本
- wikify(content): 解析维基语法
- raw(content): 添加原始HTML/节点
- box(content, style): 添加带样式的容器
```
  #### 注册文本
  - 使用 maplebirchFrameworks.addText 方法注册文本处理器
```
// 基本文本
maplebirchFrameworks.addText('welcome', t => {
  t.text('欢迎来到游戏世界！');
  t.line('开始你的冒险旅程吧！');
});
// 带样式文本
maplebirchFrameworks.addText('warning', t => {
  t.text('危险警告！', 'red-text');
  t.line('前方发现敌人，请做好准备！');
});
// 使用 <<link>> 宏的交互选项
maplebirchFrameworks.addText('choice', t => {
  t.text('请选择行动：');
  t.wikify('<<link "攻击">><<goto "combat">><</link>>');
  t.wikify('<<link "逃跑">><<goto "escape">><</link>>');
  t.wikify('<<link "对话">><<goto "talk">><</link>>');
});
// 带图标和样式的链接
maplebirchFrameworks.addText('styled_links', t => {
  t.wikify('<<link "查看地图" "map-link">><<run showMap()>><</link>>');
  t.wikify('<<link "打开背包" "inventory-link">><<run openInventory()>><</link>>');
});
// 带条件的交互选项
maplebirchFrameworks.addText('conditional_choice', t => {
  if (t.ctx.hasWeapon) {
    t.wikify('<<link "使用武器攻击">><<set $action = "weapon_attack">><</link>>');
  } else {
    t.wikify('<<link "徒手攻击">><<set $action = "barehand_attack">><</link>>');
    }
  if (t.ctx.isStealth) {
    t.wikify('<<link "潜行通过">><<goto "stealth_pass">><</link>>');
  }
});
// 带参数的链接
maplebirchFrameworks.addText('shop', t => {
  t.text('商店商品:', 'shop-header');
  t.wikify('<<link "药水 (50金币)">><<set $buyItem = "potion">><<goto "purchase">><</link>>');
  t.wikify('<<link "长剑 (120金币)">><<set $buyItem = "sword">><<goto "purchase">><</link>>');
});
// 带悬停提示的链接
maplebirchFrameworks.addText('hint_links', t => {
  t.wikify('<<link "神秘宝箱">><<replace "#hint">>内含稀有装备<</replace>><</link>>');
  t.wikify('<<link "古老卷轴">><<replace "#hint">>记载失传魔法<</replace>><</link>>');
  t.raw('<div id="hint">悬停查看详情</div>');
});
```
  #### 输出文本
  - 使用 `<<maplebirchTextOutput>>` 宏输出注册的文本片段
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
| `CustomLinkZone`        | 自定义任意位置的链接前    |
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
| `ReputationModify`      | 声誉显示修改区           |
| `Reputation`            | 声誉显示区域             |
| `FameModify`            | 知名度显示修改区         |
| `Fame`                  | 知名度显示区域           |
| `StatusSocial`          | 自定义社交状态区域       |
| `NPCinit`               | 原版NPC初遇初始化区域    |
| `NPCspawn`              | 原版NPC入场初始化区域    |
</details>

  #### 添加内容到指定区域
```
添加部件到指定区域
@param {string} zone - 目标区域名称（如 'Header', 'Footer', 'CustomLinkZone' 等）
@param {...(string|Function|Object|Array)} widgets - 要添加的部件，支持多种格式

@example 添加字符串部件（直接调用宏）
maplebirchFrameworks.addTo('Header', 'myHeaderMacro');
// 渲染结果: <<myHeaderMacro>>

@example 添加函数部件（自动包装为可执行宏）
maplebirchFrameworks.addTo('Footer', () => {
  return `当前时间: ${new Date().toLocaleTimeString()}`;
});
// 渲染结果: <<run func_xxxx()>> (自动生成函数名)

@example 添加条件部件对象（带匹配规则）
maplebirchFrameworks.addTo('Options', {
  widget: 'advancedOptions', // 宏名称
  passage: ['Town', 'Forest'], // 只在指定段落显示
  exclude: 'School' // 不在School段落显示
});

@example 添加正则匹配部件
maplebirchFrameworks.addTo('StatusBar', {
  widget: 'healthBar',
  match: /Battle.*/ // 匹配所有以Battle开头的段落
});

@example 添加到CustomLinkZone区域（数组格式）
// 在链接位置1前插入部件
maplebirchFrameworks.addTo('CustomLinkZone', [1, 'preLinkMenu']);

@example 添加到CustomLinkZone区域（对象格式带条件）
maplebirchFrameworks.addTo('CustomLinkZone', {
  widget: [2, 'contextMenu'], // 在链接位置2前插入
  passage: 'Forest' // 只在Forest段落显示
});

@example 批量添加多个部件
maplebirchFrameworks.addTo('Information', 
  'basicInfo',
  () => { /* 动态内容 *\/ },
  { widget: 'weatherDisplay', passage: 'Outdoor' }
);
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
 #### 区域addonPlugin注册
 + **CustomLinkZone区域** 为数组形式 如 **`[1, 'preLinkMenu']`**
```
"params": {
  "framework": [
    // 类型1: 简单部件注入
    {
      "addto": "区域名称", // 必需: 注入区域 (Header等)
      "widget": "部件名称" // 必需: 部件宏名称
    },
    // 类型2: 条件部件注入
    {
      "addto": "区域名称",
      "widget": {
        "widget": "部件名称", // 必需: 部件宏名称
        "exclude": ["场景1", "场景2"], // 可选: 排除的场景
        "passage": ["场景3", "场景4"], // 可选: 包含的场景
        "match": "关键词" // 可选: 包含关键词的场景
      }
    },
  ]
}
```
### 简易弹窗 
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
  #### 特质addonPlugin注册
```
"params": {
  "framework": [
    {
      "traits": [
        {
          "title": "特质标题", // 必需: 特质标题
          "name": "特质名称", // 必需: 特质名称
          "colour": "red", // css颜色
          "has": "V.traits === true", // 可选: 激活条件(JS表达式)
          "text": "特质描述" // 可选: 描述文本
        },
        {
          "title": "特质标题", // 必需: 特质标题
          "name": "特质名称", // 必需: 特质名称
          "colour": "blue", // css颜色
          "has": "false", // 可选: 布尔型
          "text": "特质描述" // 可选: 描述文本
        },
        {
          "title": "特质标题", // 必需: 特质标题
          "name": "特质名称", // 必需: 特质名称
          "colour": "red", // css颜色
          "has": "true", // 可选: 布尔型
          "text": "特质描述" // 可选: 描述文本
        }
      ]
    }
  ]
}
```
 ### 地点注册
  + 使用 `maplebirchFrameworks.addLocation(locationId, config, options = {})` 定制游戏地点，模板可查看原版 **setup.LocationImages** 功能后续可能做改动
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
  base: {
    default: {
      condition: () => !Weather.isSnow,
      image: "base.png",
    },
    snow: {
      condition: () => Weather.isSnow,
      image: "snow.png",
    },
  },
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
 ### 商店注册
 + 关于你的商店页面名称为 **"商店唯一标识名称" + Shop**，通过 **`<<link [[你的商店|"商店唯一标识名称" Shop]]>><</link>>`** 来进入，所以入口需要你自己填写
 #### 特别参数说明
 + 关于**三个额外外套槽**需要**ReOverfits模组**加载后才会在商店中生效逻辑，否则将不显示
```
"clothesType":  // 商店种类
[
  "all",         // 查看全部
  "overhead",    // 查看头套（需要ReOverfits模组支持）
  "overupper",   // 查看外套上衣（需要ReOverfits模组支持）
  "overlower",   // 查看外套下衣（需要ReOverfits模组支持）
  "overoutfit",  // 查看外衣套装
  "outfit",      // 查看套装
  "upper",       // 查看上装
  "lower",       // 查看下装
  "underoutfit", // 查看内衣套装
  "underupper",  // 查看内衣上衣
  "underlower",  // 查看内衣下衣
  "head",        // 查看头饰
  "face",        // 查看面饰
  "neck",        // 查看颈饰
  "handheld",    // 查看手持物品
  "hands",       // 查看手饰
  "legs",        // 查看袜子
  "feet",        // 查看鞋类
  "genital"      // 查看生殖器饰品
]

"type":  文本类型(即服装店中插入的文本或sugarcube语法)
[
  "intro",              // 商店欢迎文本（进入商店时显示）
  "beforeType",         // 类别选择前文本（显示在服装类别选择前）
  "afterType",          // 类别选择后文本（显示在服装类别选择后）
  "beforeChangingRoom", // 更衣室前文本（显示在更衣室链接前）
  "afterChangingRoom",  // 更衣室后文本（显示在更衣室链接后）
  "beforeLeave"         // 离开前文本（显示在离开链接前）
]
```
 #### 商店addonPlugin的注册
 + 在你的 `boot.json` 中申明载入此文件
```
"additionFile": [
  "shop/XXX.json"
],
```
 + 在 `boot.json` 中的 `"addonPlugin"` 填写注册逻辑
```
"params": {
  "shop": [
    "shop/XXX.json",
    "XXX/XXX.json
  ]
}
```
 #### 商店使用示例
 + 写在你的模组 **`根目录/shop/XXX.josn`** 或者 **`根目录/XXX/XXX.josn`** 都可以，这里涉及框架另一个功能: [文本片段](#文本片段)
```
{
  "shopName": "商店唯一标识名称", // 必填：商店的唯一标识名称（英文或拼音）
  "clothesType": ["类别1", "类别2"], // 必填：支持的服装类别数组
  "type": ["文本类型1", "文本类型2"], // 可选：使用的文本类型
  "content": {
    // 文本内容配置（根据type中指定的类型配置）
    "文本类型1": [
      // 数组形式，支持多种输出方式混合
      "简单文本内容（自动使用text方法）", 详情看框架另一功能，文本注册。
      {
        "method": "text", // 输出方法：text/line/wikify/raw/box
        "text": "带样式的文本",
        "style": "自定义CSS类名" // 可选
      },
      {
        "method": "line",
        "text": "带换行的文本"
      },
      {
        "method": "wikify",
        "text": "包含[[维基语法]]的文本"
      },
      {
        "method": "raw",
        "text": "<div>原始HTML内容</div>"
      },
      {
        "method": "box",
        "text": "容器中的文本",
        "style": "容器CSS类名"
      }
    ],
    "文本类型2": [
      // 另一种文本类型的配置
      "更多文本内容..."
    ]
  },
  "options": {
    // 商店选项配置
    "outside": 0, // 可选：是否在室外（0=室内，1=室外，影响天气显示）
    "stress": false, // 可选：是否启用压力检查（默认false）
    "stressMacro": "宏名称",     // 可选：压力过高时执行的宏widegt（需要stress=true）
    "changingRoom": true,       // 可选：是否显示更衣室（默认true）
    "changingRoomCondition": "条件表达式",     // 可选：更衣室显示条件（TwineScript表达式）
    "exitPassage": "离开后通道名称"            // 可选：离开后前往的Passage通道名称
  }
}
```
+ 如果想翻译对应文本如 **带样式的文本** 请自己在对应的语言json文件写数据并导入，详情请看[多语言管理](#多语言管理)
```
在cn.json文件中
{
"任意唯一不重复键名/Any unique and non repeating key name": "带样式的文本"
}
在en.json文件中
{
"任意唯一不重复键名/Any unique and non repeating key name": "Stylized text"
}
```
 ### NPC注册
 #### NPC的基本数据
 - 添加NPC角色 (maplebirchFrameworks.addNPC)
```
添加NPC角色 (maplebirchFrameworks.addNPC(npcData, config, translationsData))
----------------------------------------------
向游戏中添加新的NPC角色或更新现有NPC

向NPC管理器中添加一个新NPC角色
@param {Object} manager - NPC管理器实例
@param {Object} npcData - NPC数据对象
@param {string} npcData.nam - NPC唯一名称（必需）
@param {string} [npcData.title] - NPC的称号
@param {string} [npcData.gender="f"] - 性别 (m/f/h)
@param {string} [npcData.type="human"] - 种族类型
@param {Object} [config] - NPC配置选项
@param {string[]} [config.loveAlias] - NPC的好感别称数组 [CN, EN]
@param {boolean} [config.important=false] - 是否重要NPC（显示在状态栏）
@param {boolean} [config.special=false] - 是否为特殊NPC
@param {boolean} [config.loveInterest=false] - 是否为恋爱NPC
@param {Object} [translationsData] - 翻译数据对象
@returns {boolean} 添加成功返回true，失败返回false

示例：
// 添加新NPC
maplebirchFrameworks.addNPC({
  nam: "Alice",
  title: "Magic Mentor",
  gender: "f",
  type: "human",
  description: "一位神秘的精灵魔法师",
  eyeColour: "purple",
  hairColor: "silvery"
}, {
  loveAlias: ['爱意', 'Love']
  loveInterest: true,
  important: true,
  special: false
}, {
  "Alice": { EN: "Alice", CN: "艾莉丝" },
  "Magic Mentor": { EN: "Magic Mentor", CN: "魔法导师" }
});

注：当下方有不需要的功能时用{}替代
maplebirchFrameworks.addNPC({
  nam: "Alice",
  title: "Magic Mentor",
  gender: "f",
  type: "human",
  description: "一位神秘的精灵魔法师",
  eyeColour: "purple",
  hairColor: "silvery"
}, {

}, {

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
 #### 添加NPC服装库数据
- **`setup.npcClothesSets`** 方便扩充原版的NPC服装库数据
```
添加NPC服装套装
@param {...Object} configs - 套装配置对象或配置对象数组
配置对象详细说明：
@param {string} config.name - 套装唯一标识（必需）
@param {string} [config.type="custom"] - 套装类型
@param {string} [config.gender="n"] - 适用性别 (m-男性, f-女性, n-中性)
@param {number} [config.outfit=0] - outfit类型 (0-普通, 1-特殊连体衣物)
@param {string|Object} config.upper - 上身衣物配置（可简写为字符串或详细对象）
@param {string} [upper.name] - 上身衣物名称（必需）
@param {number} [upper.integrity_max=100] - 上身衣物耐久度
@param {string} [upper.word="a"] - 冠词类型 (a-用"a", n-不用冠词)
@param {string} [upper.action="lift"] - 脱衣动作，必须为以下值之一：
  - "lift"     -> 游戏中显示"掀开"
  - "pull"     -> 游戏中显示"扯开"
  - "unbutton" -> 游戏中显示"解开"  
  - "unzip"    -> 游戏中显示"解开"
  - "aside"    -> 游戏中显示"拉开"
  - "open"     -> 游戏中显示"打开"
  - "undo"     -> 游戏中显示"松开"
  - "unwrap"   -> 游戏中显示"打开"
@param {string} [upper.desc] - 上身衣物描述
@param {string|Object} config.lower - 下身衣物配置（可简写为字符串或详细对象）
@param {string} [lower.name] - 下身衣物名称（必需）
@param {number} [lower.integrity_max=100] - 下身衣物耐久度
@param {string} [lower.word="n"] - 冠词类型 (a-用"a", n-不用冠词)
@param {string} [lower.action="pull"] - 脱衣动作（同上身衣物action限制）
@param {string} [lower.desc] - 下身衣物描述
@param {string} [config.desc] - 套装描述，如未提供则自动生成
```
 - 使用示例
```
maplebirchFrameworks.addNPCClothes({
    name: "formalSet",
    type: "formal",
    gender: "m",
    outfit: 1,
    upper: {
        name: "dress_shirt",
        integrity_max: 120,     // 自定义耐久度
        word: "a",
        action: "unbutton",     // 必须使用有效action值
        desc: "正装衬衫"
    },
    lower: {
        name: "trousers", 
        integrity_max: 110,
        action: "unzip"         // 必须使用有效action值
    },
    desc: "商务正装"
});

@example
// 批量添加多个套装
maplebirchFrameworks.addNPCClothes(
    {name: "sportSet", type: "sport", upper: "jersey", lower: "shorts"},
    {name: "swimSet", type: "swim", upper: "bikini_top", lower: "bikini_bottoms"}
);

@example
// 使用数组批量添加
const outfits = [
    {name: "workSet", type: "work", upper: "uniform", lower: "pants"},
    {name: "partySet", type: "party", upper: "dress", lower: "heels"}
];
maplebirchFrameworks.addNPCClothes(outfits);
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

  #### NPC的addonPlugin注册
```
"params": {
  "npc": [
    {
      "data": {
        "nam": "Alice", // NPC唯一标识符 (必需)
        "title": "Magic Mentor", // NPC头衔
        "gender": "f", // 性别 (m/f/none)
        "type": "human", // NPC类型 (human/wolf/demon等)
        "description": "一位神秘的精灵魔法师", // 描述文本
        "eyeColour": "purple", // 眼睛颜色
        "hairColor": "silvery" // 头发颜色
      },
      "config": {
        "loveAlias": ["爱意", "Love"], // 好感度别名 [中文, 英文]
        "loveInterest": true, // 是否为可恋爱NPC
        "important": true, // 是否为重要NPC
        "special": false // 是否为特殊NPC
      },
      "translations": {
        "Alice": { // NPC名称翻译
          "EN": "Alice",
          "CN": "艾莉丝"
        },
        "Magic Mentor": { // NPC头衔翻译
          "EN": "Magic Mentor",
          "CN": "魔法导师"
        }
      },
      "state": {
        "trust": { // 信任值配置
          "min": 0, // 最小值
          "max": 100, // 最大值
          "position": "secondLast" // 显示位置 (secondLast: 倒数第二位)
        },
        "loyalty": { // 忠诚度配置
          "min": 0,
          "max": 10,
          "position": 3 // 显示位置 (数字索引: 第4位)
        }
      }
    }
  ]
}
```
### NPC侧绘
 #### NPC侧绘说明
+ 在模组设置中可以开启已命名npc的侧边栏立绘，需要自行导入相应的图片
+ 画布模式尚未完成，它将会是以pc模型为制作的立绘
 #### NPC侧绘的addonPlugin注册
```
"params": {
    "npcSidebar": [
      {
        "name": "sydney",
        "imgFile": [
          "img/ui/nnpc/sydney/au.png",
          "img/ui/nnpc/sydney/goose.png",
          "img/ui/nnpc/sydney/xxx.png"
        ]
      },
      {
        "name": "robin",
        "imgFile": [
          "img/ui/nnpc/robin/au.png",
          "img/ui/nnpc/robin/goose.png",
          "img/ui/nnpc/robin/xxx.png"
        ]
      }
    ]
  }
```
### 气象管理
 #### 天气渲染修改
 + 修改指定的天气效果 **`addEffect(effectName, patch, arrayBehaviour = "replace")`**
```
- effectName: 效果名称（如'colorOverlay'、'locationImage'等）
- patch: 要应用的修改内容对象
- arrayBehaviour: 数组合并策略
  - 'replace': 替换整个数组（默认）
  - 'concat': 在数组末尾添加新元素
  - 'merge': 递归合并对应索引的元素
```
 + 修改指定的天气图层 **`addLayer(layerName, patch, arrayBehaviour = "replace") `**
```
- layerName: 层名称（如'sun'、'bannerSky'、'clouds'等）
- patch: 要应用的修改内容对象
- arrayBehaviour: 数组合并策略
  - 'replace': 替换整个数组（默认）
  - 'concat': 在数组末尾添加新元素
  - 'merge': 递归合并对应索引的元素
```
 + 如果想添加原版没有的 效果和图层，直接使用 **`maplebirch.once(':weather', () => {});`** 即可
```
maplebirch.once(':weather', () => {
 Weather.Renderer.Effects.add({
  // 你要添加的逻辑
 });
 Weather.Renderer.Layers.add({
  // 你要添加的逻辑
 });
});
```
 #### 天气渲染修改示例
```
@example
// 修改颜色覆盖效果 - 添加日食支持
modifyWeather.addEffect('colorOverlay', {
  draw() {
    const nightColor = this.bloodMoon ? this.color.bloodMoon : ColourUtils.interpolateColor(this.color.nightDark, this.color.nightBright, this.moonFactor);
    let mixFactor = this.sunFactor;
    if (this.solarEclipse && this.sunFactor > 0) mixFactor = Math.min(this.sunFactor0.05, 0.05);
    const color = ColourUtils.interpolateTripleColor(nightColor, this.color.dawnDusk, this.color.day, mixFactor);
    this.canvas.ctx.fillStyle = color;
    this.canvas.fillRect();
  }
}, 'replace');
@example
// 修改太阳层 - 添加日食条件
modifyWeather.addLayer('sun', {
  effects: [{
    drawCondition() {
      return !Weather.solarEclipse && this.renderInstance.orbitals.sun.factor > -0.5 && !this.renderInstance.skyDisabled;
    }
  }]
}, 'merge');
@example
// 添加日食效果到太阳层
modifyWeather.addLayer('sun', {
  effects: [
    {
      effect: "skyOrbital",
      drawCondition() {
        return Weather.solarEclipse && this.renderInstance.orbitals.sun.factor > -0.5 && !this.renderInstance.skyDisabled && Weather.solarEclipseStage === 'pre';
      },
      params: { images: { orbital: 'img/misc/sky/solar-eclipse-0.png' } },
      bindings: {
        position() { return this.renderInstance.orbitals.sun.position; }
      }
    }
  ]
}, 'concat');
```
## 致谢
在此，我想向所有支持、帮助过这个项目的朋友们表达最诚挚的感谢：  
- 感谢 [Lyoko-Jeremie](https://github.com/Lyoko-Jeremie) 开发的Modloader系统，为模组开发提供了基础支持。
- 感谢 [Lyoko-Jeremie](https://github.com/Lyoko-Jeremie) 、[Number_Sir](https://github.com/NumberSir) 开发的模组编写助手工具，提升了开发效率。
- 感谢 [狐千月](https://github.com/emicoto) 制作的 [简易框架](https://github.com/emicoto/SCMLSimpleFramework) 提供了重要的功能参考。
- 感谢 [苯环](https://github.com/Nephthelana) 、[零环](https://github.com/ZeroRing233) 、 [丧心](https://github.com/MissedHeart) 给予的技术指导。
- 感谢 污度孤儿中国模组制作群 提供的交流环境和新手引导。

## 未实现的功能构想

- 人类体型战斗系统重置、完善制作全新npc架构(画布...)


