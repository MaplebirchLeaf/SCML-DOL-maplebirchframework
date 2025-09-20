/**
 * 时间事件系统数据结构说明
 * 
 * 核心事件数据结构：
 * 
 * 所有事件类型共有的核心属性:
 *   passed: number,        // 流逝的总秒数
 *   prevDate: DateTime,    // 流逝前的时间对象
 *   currentDate: DateTime  // 流逝后的时间对象
 * 
 * 1. onBefore 事件 (时间流逝前触发)
 * @typedef {Object} BeforeEventData
 * @property {number} passed - 即将流逝的秒数
 * @property {number} timeStamp - 流逝前的时间戳
 * @property {DateTime} prev - 流逝前的时间对象（只读）
 * @property {Object} option - 预留选项对象（通常为空）
 * 
 * 2. onThread 事件 (时间流逝中触发)
 * @typedef {Object} ThreadEventData
 * @property {number} passed - 流逝的秒数
 * @property {number} sec - 秒数差
 * @property {number} min - 分钟差
 * @property {number} hour - 小时差
 * @property {number} day - 天数差
 * @property {number} week - 周数差
 * @property {number} month - 月数差
 * @property {number} year - 年数差
 * @property {number[]} weekday - 星期变化 [流逝前星期, 流逝后星期]
 * @property {Object} cumulative - 累积时间对象
 *   @property {number} cumulative.sec - 累积秒数
 *   @property {number} cumulative.min - 累积分钟
 *   @property {number} cumulative.hour - 累积小时
 *   @property {number} cumulative.day - 累积天数
 *   @property {number} cumulative.week - 累积周数
 *   @property {number} cumulative.month - 累积月数
 *   @property {number} cumulative.year - 累积年数
 * @property {DateTime} prevDate - 流逝前的时间对象
 * @property {DateTime} currentDate - 流逝后的时间对象
 * 
 * 3. onAfter 事件 (时间流逝后触发)
 * @typedef {Object} AfterEventData
 * @property {number} passed - 流逝的秒数
 * @property {number} sec - 秒数差
 * @property {number} min - 分钟差
 * @property {number} hour - 小时差
 * @property {number} day - 天数差
 * @property {number} week - 周数差
 * @property {number} month - 月数差
 * @property {number} year - 年数差
 * @property {number[]} weekday - 星期变化 [流逝前星期, 流逝后星期]
 * @property {Object} cumulative - 累积时间对象
 *   @property {number} cumulative.sec - 累积秒数
 *   @property {number} cumulative.min - 累积分钟
 *   @property {number} cumulative.hour - 累积小时
 *   @property {number} cumulative.day - 累积天数
 *   @property {number} cumulative.week - 累积周数
 *   @property {number} cumulative.month - 累积月数
 *   @property {number} cumulative.year - 累积年数
 * @property {DateTime} prevDate - 流逝前的时间对象
 * @property {DateTime} currentDate - 流逝后的时间对象
 * 
 * 4. 周期性事件 (onSec, onMin, onHour, onDay, onWeek, onMonth)
 * @typedef {Object} PeriodicEventData
 * @property {number} passed - 流逝的秒数
 * @property {number} sec - 秒数差
 * @property {number} min - 分钟差
 * @property {number} hour - 小时差
 * @property {number} day - 天数差
 * @property {number} week - 周数差
 * @property {number} month - 月数差
 * @property {number} year - 年数差
 * @property {number[]} weekday - 星期变化 [流逝前星期, 流逝后星期]
 * @property {Object} cumulative - 累积时间对象
 *   @property {number} cumulative.sec - 累积秒数
 *   @property {number} cumulative.min - 累积分钟
 *   @property {number} cumulative.hour - 累积小时
 *   @property {number} cumulative.day - 累积天数
 *   @property {number} cumulative.week - 累积周数
 *   @property {number} cumulative.month - 累积月数
 *   @property {number} cumulative.year - 累积年数
 * @property {Object} changes - 本次事件周期内累积的变化量
 *   @property {number} changes.sec - 秒数变化量
 *   @property {number} changes.min - 分钟变化量
 *   @property {number} changes.hour - 小时变化量
 *   @property {number} changes.day - 天数变化量
 *   @property {number} changes.week - 周数变化量
 *   @property {number} changes.month - 月数变化量
 *   @property {number} changes.year - 年数变化量
 * @property {DateTime} prevDate - 流逝前的时间对象
 * @property {DateTime} currentDate - 流逝后的时间对象
 * 
 * DateTime 对象结构
 * 
 * @typedef {Object} DateTime
 * @property {number} year - 年份（支持负值表示公元前）
 * @property {number} month - 月份 (1-12)
 * @property {number} day - 日期 (1-31)
 * @property {number} hour - 小时 (0-23)
 * @property {number} minute - 分钟 (0-59)
 * @property {number} second - 秒数 (0-59)
 * @property {number} weekDay - 星期 (1-7, 1=周日)
 * @property {number} timeStamp - Unix时间戳（秒）
 * @property {number} moonPhase - 月相 (0-1)
 * @property {number} moonPhaseFraction - 月相分数
 * @property {string} dayState - 时间段 ("dawn", "day", "dusk", "night")
 * @property {function} toString - 转换为字符串的方法
 * @property {function} addSeconds - 添加秒数
 * @property {function} addMinutes - 添加分钟
 * @property {function} addHours - 添加小时
 * @property {function} addDays - 添加天数
 * @property {function} addMonths - 添加月数
 * @property {function} addYears - 添加年数
 * @property {function} compareWith - 比较两个时间对象
 *   @param {DateTime} other - 要比较的时间对象
 *   @param {boolean} [getSeconds=false] - 是否只返回秒数差
 *   @returns {number|Object} - 秒数差或详细时间差对象
 * 
 * 时间事件系统功能：
 * - 提供精确的时间流逝事件处理
 * - 支持多种时间单位的事件（秒、分、时、日、周、月）
 * - 处理闰年、闰月等复杂日历计算
 * - 支持负年份（公元前）的时间计算
 * - 提供累积时间变化统计
 * - 自动优化底层DateTime实现
 */
(() => {
  if (!window.maplebirch) {
    console.log('%c[maplebirch] 错误: 核心系统未初始化', 'color: #C62828; font-weight: bold;');
    return;
  }

  const maplebirch = window.maplebirch;

  class TimeStateManager {
    constructor() {
      this.logger = maplebirch.logger;
      this.events = maplebirch.events;
      this.debug = false;

      this.eventTypes = [
        'onSec',     // 每秒事件
        'onMin',     // 每分钟事件
        'onHour',    // 每小时事件
        'onDay',     // 每日事件
        'onWeek',    // 每周事件
        'onMonth',   // 每月事件
        'onBefore',  // 时间流逝前事件
        'onThread',  // 时间流逝中事件
        'onAfter',   // 时间流逝后事件
        'onTimeTravel', // 时空穿越
      ];
      
      this.timeEvents = {};
      this.eventTypes.forEach(type => this.timeEvents[type] = new Map());
      
      this.passage = null;
      this.savedata = {};
      
      this.prevDate = null;
      this.currentDate = null;
      this.passData = null;
      this.originalTimePass = null;
      
      this.cumulativeTime = {
        sec: 0,
        min: 0,
        hour: 0,
        day: 0,
        week: 0,
        month: 0,
        year: 0
      };
    }

    #log(message, level = 'DEBUG', ...objects) {
      this.logger.log(`[state] ${message}`, level, ...objects);
    }
    
    #triggerEvents(type, timeData) {
      if (!this.timeEvents[type]) {
        this.#log(`事件类型未注册: ${type}`, 'WARN');
        return;
      }
      const events = Array.from(this.timeEvents[type].values());
      events.sort((a, b) => b.priority - a.priority);
      const toRemove = [];
      for (const event of events) {
        try {
          if (event.cond(timeData)) {
            this.#log(`执行事件: ${type}.${event.id}`, 'DEBUG');
            event.action(timeData);
            if (event.once) toRemove.push(event.id);
          }
        } catch (error) {
          this.#log(`事件执行错误: ${type}.${event.id} - ${error.message}`, 'ERROR');
        }
      }
      toRemove.forEach(eventId => {
        this.timeEvents[type].delete(eventId);
        this.#log(`移除一次性事件: ${type}.${eventId}`, 'DEBUG');
      });
    }
    
    #updateCumulativeTime(passedSeconds) {
      this.cumulativeTime.sec += passedSeconds;
      
      const minGained = Math.floor(this.cumulativeTime.sec / 60);
      this.cumulativeTime.sec %= 60;
      this.cumulativeTime.min += minGained;
      
      const hourGained = Math.floor(this.cumulativeTime.min / 60);
      this.cumulativeTime.min %= 60;
      this.cumulativeTime.hour += hourGained;
      
      const dayGained = Math.floor(this.cumulativeTime.hour / 24);
      this.cumulativeTime.hour %= 24;
      this.cumulativeTime.day += dayGained;
      
      const weekGained = Math.floor(this.cumulativeTime.day / 7);
      this.cumulativeTime.day %= 7;
      this.cumulativeTime.week += weekGained;
      
      if (this.cumulativeTime.day > 0) {
        const tempDate = new DateTime(V.startDate + V.timeStamp);
        tempDate.addDays(this.cumulativeTime.day);
        
        const monthDiff = tempDate.month - this.prevDate.month;
        if (monthDiff > 0) {
          this.cumulativeTime.month += monthDiff;
          this.cumulativeTime.day = 0;
        }
      }
      
      if (this.cumulativeTime.month >= 12) {
        this.cumulativeTime.year += Math.floor(this.cumulativeTime.month / 12);
        this.cumulativeTime.month %= 12;
      }
    }
    
    #triggerTimeEventsWithCumulative(timeData) {
      const changes = { ...this.cumulativeTime };
      Object.keys(this.cumulativeTime).forEach(key => this.cumulativeTime[key] = 0);
      
      const enhancedTimeData = {
        ...timeData,
        changes,
        cumulative: { ...changes }
      };
      
      const eventHierarchy = [
        { event: 'onYear', unit: 'year' },
        { event: 'onMonth', unit: 'month' },
        { event: 'onWeek', unit: 'week' },
        { event: 'onDay', unit: 'day' },
        { event: 'onHour', unit: 'hour' },
        { event: 'onMin', unit: 'min' },
        { event: 'onSec', unit: 'sec' }
      ];
      
      eventHierarchy.forEach(({ event, unit }) => {
        if (changes[unit] > 0) this.#triggerEvents(event, enhancedTimeData);
      });
      
      const compositeEvents = [
        { triggerUnits: ['year', 'month', 'week', 'day', 'hour', 'min'], event: 'onSec', unit: 'sec' },
        { triggerUnits: ['year', 'month', 'week', 'day', 'hour'], event: 'onMin', unit: 'min' },
        { triggerUnits: ['year', 'month', 'week', 'day'], event: 'onHour', unit: 'hour' },
        { triggerUnits: ['year', 'month', 'week'], event: 'onDay', unit: 'day' },
        { triggerUnits: ['year', 'month'], event: 'onWeek', unit: 'week' },
        { triggerUnits: ['year'], event: 'onMonth', unit: 'month' }
      ];
      
      compositeEvents.forEach(({ triggerUnits, event, unit }) => {
        if (triggerUnits.some(u => changes[u] > 0)) {
          this.#triggerEvents(event, {
            ...enhancedTimeData,
            changes: {
              ...changes,
              [unit]: changes[unit] > 0 ? changes[unit] : 1
            }
          });
        }
      });
    }
    
    #calculateTimeDifference(prev, current, passedSec) {
      const diffSeconds = current.compareWith(prev, true);
      const detailedDiff = current.compareWith(prev);
      return {
        passed: passedSec,
        sec: diffSeconds,
        min: Math.floor(diffSeconds / 60),
        hour: Math.floor(diffSeconds / 3600),
        day: Math.floor(diffSeconds / TimeConstants.secondsPerDay),
        week: Math.floor(diffSeconds / (TimeConstants.secondsPerDay * 7)),
        month: Math.abs(detailedDiff.months),
        year: Math.abs(detailedDiff.years),
        weekday: [prev.weekDay, current.weekDay],
        prevDate: prev,
        currentDate: current,
        detailedDiff
      };
    }
    
    _receiveVariables(variables) {
      this.savedata = variables;
      this.#log(`接收存档数据: ${variables.saveId || 'default'}`, 'DEBUG');
    }
    
    _shouldCollectPassage(passage) {
      return passage && !passage.tags.includes('widget');
    }

    /**
     * 注册时间事件
     * @param {string} type - 事件类型
     * @param {string} eventId - 事件唯一ID
     * @param {object} options - 事件配置
     * @param {function} options.action - 事件执行函数
     * @param {function} [options.cond] - 条件检查函数
     * @param {number} [options.priority=0] - 事件优先级
     * @param {boolean} [options.once=false] - 是否一次性事件
     * @param {string} [options.description] - 事件描述
     */
    regTimeEvent(type, eventId, options) {
      if (!this.eventTypes.includes(type)) {
        this.#log(`未知的时间事件类型: ${type}`, 'ERROR');
        return false;
      }
      
      if (this.timeEvents[type].has(eventId)) {
        this.#log(`事件ID已存在: ${type}.${eventId}`, 'WARN');
        return false;
      }
      
      const event = {
        id: eventId,
        type,
        action: options.action,
        cond: options.cond || (() => true),
        priority: options.priority || 0,
        once: options.once || false,
        description: options.description || ''
      };
      
      this.timeEvents[type].set(eventId, event);
      this.#log(`注册时间事件: ${type}.${eventId}`, 'DEBUG');
      return true;
    }
    
    unregTimeEvent(type, eventId) {
      if (!this.timeEvents[type]) {
        this.#log(`事件类型不存在: ${type}`, 'WARN');
        return false;
      }
      
      if (this.timeEvents[type].delete(eventId)) {
        this.#log(`取消注册时间事件: ${type}.${eventId}`, 'DEBUG');
        return true;
      }
      
      this.#log(`未找到事件: ${type}.${eventId}`, 'DEBUG');
      return false;
    }
    
    handleTimePass(passedSeconds) {
      try {
        this.#log(`处理时间流逝: ${passedSeconds}秒`, 'DEBUG');
        this.prevDate = new DateTime(V.startDate + V.timeStamp);
        this.#triggerEvents('onBefore', {
          passed: passedSeconds,
          timeStamp: V.timeStamp,
          prev: Object.freeze(this.prevDate)
        });
        const fragment = this.originalTimePass(passedSeconds);
        this.currentDate = Time.date;
        const timeData = this.#calculateTimeDifference(
          this.prevDate, 
          this.currentDate, 
          passedSeconds
        );
        this.#updateCumulativeTime(passedSeconds);
        this.#triggerEvents('onThread', timeData);
        this.#triggerTimeEventsWithCumulative(timeData);
        this.#triggerEvents('onAfter', timeData);
        return fragment;
      } catch (error) {
        this.#log(`时间流逝处理错误: ${error.message}`, 'ERROR');
        return this.originalTimePass(passedSeconds);
      }
    }

    /**
     * @param {object} options - 时间旅行选项
     * @param {DateTime} [options.target] - 目标时间点（DateTime对象）
     * @param {number} [options.year] - 目标年份
     * @param {number} [options.month] - 目标月份 (1-12)
     * @param {number} [options.day] - 目标日期 (1-31)
     * @param {number} [options.hour=0] - 目标小时 (0-23)
     * @param {number} [options.minute=0] - 目标分钟 (0-59)
     * @param {number} [options.second=0] - 目标秒数 (0-59)
     * @param {number} [options.addYears=0] - 增加的年数（可负）
     * @param {number} [options.addMonths=0] - 增加的月数（可负）
     * @param {number} [options.addDays=0] - 增加的天数（可负）
     * @param {number} [options.addHours=0] - 增加的小时数（可负）
     * @param {number} [options.addMinutes=0] - 增加的分钟数（可负）
     * @param {number} [options.addSeconds=0] - 增加的秒数（可负）
     */
    timeTravel(options = {}) {
      try {
        let targetDate;
        const currentDate = new DateTime(Time.date);

        if (options.target || (options.year !== undefined && options.month !== undefined && options.day !== undefined)) {
          if (options.target instanceof DateTime) {
            targetDate = new DateTime(options.target);
          } else {
            const { year, month, day, hour = 0, minute = 0, second = 0 } = options;
            targetDate = new DateTime(year, month, day, hour, minute, second);
          }
        } else if (options.addYears || options.addMonths || options.addDays || options.addHours || options.addMinutes || options.addSeconds) {
          targetDate = new DateTime(currentDate);
          if (options.addYears) targetDate.addYears(options.addYears);
          if (options.addMonths) targetDate.addMonths(options.addMonths);
          if (options.addDays) targetDate.addDays(options.addDays);
          if (options.addHours) targetDate.addHours(options.addHours);
          if (options.addMinutes) targetDate.addMinutes(options.addMinutes);
          if (options.addSeconds) targetDate.addSeconds(options.addSeconds);
        } else {
          throw new Error("无效的时间旅行参数");
        }
        const prevDate = new DateTime(Time.date);
        const diffSeconds = targetDate.timeStamp - prevDate.timeStamp;
        Time.setDate(targetDate);
        this.prevDate = prevDate;
        this.currentDate = targetDate;
        Object.keys(this.cumulativeTime).forEach(key => this.cumulativeTime[key] = 0);

        this.#triggerEvents('onTimeTravel', {
          prev: prevDate,
          current: targetDate,
          diffSeconds,
          direction: diffSeconds >= 0 ? 'forward' : 'backward',
          isLeap: DateTime.isLeapYear(targetDate.year)
        });
        this.#log(`时间穿越完成: prevDate → targetDate (${diffSeconds}秒)`, 'DEBUG', prevDate, targetDate);
        return true;
      } catch (error) {
        this.#log(`时间穿越失败: ${error.message}`, 'ERROR');
        return false;
      }
    }

    async modifyDateTimeScript() {
      const modSC2DataManager = window.modSC2DataManager;
      const addonReplacePatcher = window.addonReplacePatcher;
      const oldSCdata = modSC2DataManager.getSC2DataInfoAfterPatch();
      const SCdata = oldSCdata.cloneSC2DataInfo();
      const datetimeScriptPath = 'datetime.js';
      const datetimeFile = SCdata.scriptFileItems.getByNameWithOrWithoutPath(datetimeScriptPath);
      if (datetimeFile) {
        const originalContent = datetimeFile.content;
        datetimeFile.content = this.applyAllOptimizations(originalContent);
        if (this.debug) this.debugOptimizations();
      } else {
        this.#log(`找不到文件: ${datetimeScriptPath}`, 'ERROR');
      }
      addonReplacePatcher.gModUtils.replaceFollowSC2DataInfo(SCdata, oldSCdata);
    }
    
    applyAllOptimizations(content) {
      const appliedOptimizations = [];
      
      const regex1 = /if \(arguments\[0\] < 0 \|\| arguments\[0\] > 315569437199\)\s+throw new Error\("Invalid timestamp: Timestamp cannot be lower than 0 or higher than 315569437199\."\);/;
      if (regex1.test(content)) {
        content = content.replace(regex1, 'if (arguments[0] < -62135596800 || arguments[0] > 315569437199)\n        throw new Error("Invalid timestamp: Timestamp out of range.");');
        appliedOptimizations.push("优化1");
      }

      const regex2 = /static getTotalDaysSinceStart\(year\) \{\s+return \(year - 1\) \* 365 \+ Math\.floor\(\(year - 1\) \/ 4\) - Math\.floor\(\(year - 1\) \/ 100\) \+ Math\.floor\(\(year - 1\) \/ 400\);\s+\}/;
      if (regex2.test(content)) {
        content = content.replace(regex2, 'static getTotalDaysSinceStart(year) {\n    if (year === 0) return DateTime.getTotalDaysSinceStart(-1);\n    \n    let astronomicalYear;\n    if (year > 0) {\n      astronomicalYear = year;\n    } else {\n      astronomicalYear = year + 1;\n    }\n\n    if (astronomicalYear >= 1) {\n      const years = astronomicalYear - 1;\n      return years * 365 + Math.floor(years / 4) - Math.floor(years / 100) + Math.floor(years / 400);\n    } else {\n      const years = -astronomicalYear;\n      const leapCount = Math.floor((years + 3) / 4) - Math.floor((years + 99) / 100) + Math.floor((years + 399) / 400);\n      return -(years * 365 + leapCount + 366);\n    }\n  }');
        appliedOptimizations.push("优化2");
      }

      const regex3 = /static isLeapYear\(year\) \{\s+return year !== 0 && year % 4 === 0 && \(year % 100 !== 0 \|\| year % 400 === 0\);\s+\}/;
      if (regex3.test(content)) {
        content = content.replace(regex3, 'static isLeapYear(year) {\n    if (year === 0) return DateTime.isLeapYear(-1);\n    \n    let astronomicalYear;\n    if (year > 0) {\n      astronomicalYear = year;\n    } else {\n      astronomicalYear = year + 1;\n    }\n    \n    if (astronomicalYear % 4 !== 0) return false;\n    if (astronomicalYear % 100 !== 0) return true;\n    return astronomicalYear % 400 === 0;\n  }');
        appliedOptimizations.push("优化3");
      }

      const regex4 = /toTimestamp\(year, month, day, hour, minute, second\) \{\s+if \(year < 1 \|\| year > 9999\) throw new Error\("Invalid year: Year must be between 1-9999\."\);\s+if \(month < 1 \|\| month > 12\) throw new Error\("Invalid month: Month must be between 1-12\."\);\s+const daysInMonth = DateTime\.getDaysOfMonthFromYear\(year\);\s+if \(day < 1 \|\| day > daysInMonth\[month - 1\]\) throw new Error\("Invalid date: Day must be between 1-" \+ daysInMonth\[month - 1\] \+ "."\);\s+const totalDays = DateTime\.getTotalDaysSinceStart\(year\) \+ daysInMonth\.slice\(0, month - 1\)\.reduce\(\(a, b\) => a \+ b, 0\) \+ day - 1;\s+const totalSeconds = totalDays \* TimeConstants\.secondsPerDay \+ hour \* TimeConstants\.secondsPerHour \+ minute \* TimeConstants\.secondsPerMinute \+ second;\s+this\.timeStamp = totalSeconds;\s+this\.year = year;\s+this\.month = month;\s+this\.day = day;\s+this\.hour = hour;\s+this\.minute = minute;\s+this\.second = second;\s+\}/;
      if (regex4.test(content)) {
        content = content.replace(regex4, 'toTimestamp(year, month, day, hour, minute, second) {\n    if (year < -9999 || year > 9999) throw new Error("Invalid year: Year must be between -9999 to 9999.");\n    if (month < 1 || month > 12) throw new Error("Invalid month: Month must be 1-12.");\n    \n    const daysInMonth = DateTime.getDaysOfMonthFromYear(year);\n    if (day < 1 || day > daysInMonth[month - 1]) \n      throw new Error(`Invalid date: Day must be 1-${daysInMonth[month - 1]}.`);\n\n    const totalDays = DateTime.getTotalDaysSinceStart(year) + \n                      daysInMonth.slice(0, month - 1).reduce((a, b) => a + b, 0) + \n                      day - 1;\n    \n    const totalSeconds = totalDays * TimeConstants.secondsPerDay + \n                         hour * TimeConstants.secondsPerHour + \n                         minute * TimeConstants.secondsPerMinute + \n                         second;\n\n    this.timeStamp = totalSeconds;\n    this.year = year;\n    this.month = month;\n    this.day = day;\n    this.hour = hour;\n    this.minute = minute;\n    this.second = second;\n  }');
        appliedOptimizations.push("优化4");
      }

      const regex5 = /fromTimestamp\(timestamp\) \{\s*\/\/ Initialize the year to 1\s*let year = 1;\s*let month = 0;\s*let day = \(timestamp \/ TimeConstants\.secondsPerDay\) \| 0;\s*const hour = \(timestamp \/ TimeConstants\.secondsPerHour\) \| 0;\s*const minute = \(timestamp \/ TimeConstants\.secondsPerMinute\) \| 0;\s*const second = timestamp;\s*\/\/ Maps the total number of days to the corresponding year and day\.\s*while \(day > DateTime\.getDaysOfYear\(year\)\) \{\s*day -= DateTime\.getDaysOfYear\(year\+\+\);\s*\}\s*const daysPerMonth = DateTime\.getDaysOfMonthFromYear\(year\);\s*\/\/ Determines the month and day by subtracting the number of days in each month and incrementing the month value\.\s*while \(day >= daysPerMonth\[month\]\) \{\s*day -= daysPerMonth\[month\+\+\];\s*if \(month > 11\) \{\s*month = 0;\s*year\+\+;\s*\}\s*\}\s*this\.timeStamp = timestamp;\s*this\.year = year;\s*this\.month = month \+ 1;\s*this\.day = day \+ 1;\s*this\.hour = hour % 24;\s*this\.minute = minute % 60;\s*this\.second = second % 60;\s*\}/;
      if (regex5.test(content)) {
        content = content.replace(regex5, 'fromTimestamp(timestamp) {\n    let totalDays = Math.floor(timestamp / TimeConstants.secondsPerDay);\n    const remainingSeconds = timestamp - totalDays * TimeConstants.secondsPerDay;\n    \n    this.hour = Math.floor(remainingSeconds / TimeConstants.secondsPerHour) % 24;\n    this.minute = Math.floor(remainingSeconds / TimeConstants.secondsPerMinute) % 60;\n    this.second = remainingSeconds % 60;\n    \n    this.year = 1;\n    if (totalDays >= 0) {\n      while (totalDays >= DateTime.getDaysOfYear(this.year)) {\n        totalDays -= DateTime.getDaysOfYear(this.year);\n        this.year++;\n      }\n    } else {\n      while (totalDays < 0) {\n        this.year--;\n        if (this.year === 0) this.year = -1;\n        totalDays += DateTime.getDaysOfYear(this.year);\n      }\n    }\n    \n    const daysPerMonth = DateTime.getDaysOfMonthFromYear(this.year);\n    let month = 0;\n    let dayCount = totalDays;\n    while (dayCount >= daysPerMonth[month]) {\n      dayCount -= daysPerMonth[month];\n      month++;\n    }\n    \n    this.month = month + 1;\n    this.day = dayCount + 1;\n    this.timeStamp = timestamp;\n  }');
        appliedOptimizations.push("优化5");
      }

      const regex6 = /get weekDay\(\) \{\s+const daysSinceStart = DateTime\.getTotalDaysSinceStart\(this\.year \+ 1\);\s+const daysInMonth = TimeConstants\.standardYearMonths\.slice\(0, this\.month - 1\)\.reduce\(\(a, b\) => a \+ b, 0\);\s+const isLeapYear = DateTime\.isLeapYear\(this\.year\) && this\.month < 3;\s+const weekDayOffset = V\.weekDayOffset !== undefined \? V\.weekDayOffset : 6;\s+const totalDays = daysSinceStart \+ daysInMonth \+ this\.day - Number\(isLeapYear\) \+ weekDayOffset;\s+const weekDay = \(totalDays % 7\) \+ 1;\s+return weekDay;\s+\}/;
      if (regex6.test(content)) {
        content = content.replace(regex6, 'get weekDay() {\n    let y = this.year;\n    let m = this.month;\n    \n    if (y < 0) y = y + 1;\n    \n    if (m < 3) {\n      m += 12;\n      y--;\n    }\n    \n    const h = (this.day + Math.floor((13 * (m + 1)) / 5) + y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400)) % 7;\n    return h === 0 ? 7 : h;\n  }');
        appliedOptimizations.push("优化6");
      }

      const regex7 = /get moonPhaseFraction\(\) \{\s*\/\/ Real new moon \(in london\) as a reference point\s*const referenceNewMoon = new DateTime\(2022, 1, 2, 18, 33\);\s*let phaseFraction = \(\(this\.timeStamp - referenceNewMoon\.timeStamp\) \/ \(TimeConstants\.synodicMonth \* TimeConstants\.secondsPerDay\)\) % 1;\s*\/\/ Adjust in case of negative date \(date before the reference date\)\s*phaseFraction = \(phaseFraction \+ 1\) % 1;\s*\/\/ Special rounding cases - to round to a complete new-moon or full-moon more often\s*return phaseFraction >= 0\.48 && phaseFraction <= 0\.52 \? 0\.5 : phaseFraction < 0\.02 \|\| phaseFraction > 0\.98 \? 0 : round\(phaseFraction, 2\);\s*\}/;
      if (regex7.test(content)) {
        content = content.replace(regex7, 'get moonPhaseFraction() {\n    const referenceNewMoon = new DateTime(-4713, 1, 1, 12, 0, 0);\n    let phaseFraction = ((this.timeStamp - referenceNewMoon.timeStamp) / \n                        (TimeConstants.synodicMonth * TimeConstants.secondsPerDay)) % 1;\n    return phaseFraction < 0 ? phaseFraction + 1 : phaseFraction;\n  }');
        appliedOptimizations.push("优化7");
      }
      
      this.appliedOptimizations = appliedOptimizations;
      return content;
    }

    debugOptimizations() {
      if (this.appliedOptimizations.length > 0) {
        this.#log("应用的优化:", 'DEBUG');
        this.appliedOptimizations.forEach(opt => this.#log(`- ${opt}`, 'DEBUG'));
      } else {
        this.#log("未应用任何优化", 'DEBUG');
      }
    }
    
    async preInit() {
      await this.modifyDateTimeScript();
      maplebirch.on(':passageinit', (ev) => {
        this.passage = ev.passage;
        if (this._shouldCollectPassage(this.passage)) {
          this.#log(`处理段落: ${this.passage.title}`, 'INFO');
        }
      }, 3);
      maplebirch.on(':onLoad', (variables) => this._receiveVariables(variables), 3);
      maplebirch.on(':onSave', (variables) => this._receiveVariables(variables), 3);
      maplebirch.on(':storyready', (variables) => this._receiveVariables(variables), 3);
    }
    
    Init() {
      if (typeof Time.pass === 'function') {
        this.originalTimePass = Time.pass;
        this.#log('原始Time.pass方法已保存', 'DEBUG');
      } else {
        this.originalTimePass = function(passedSeconds) {
          V.timeStamp += passedSeconds;
          return '';
        };
        this.#log('使用默认时间流逝实现', 'WARN');
      }
      Time.pass = (passedSeconds) => this.handleTimePass(passedSeconds);
      this.#log('时间事件系统已激活', 'INFO');
    }
  }
  
  maplebirch.register('state', new TimeStateManager(), []);
})();