// @ts-check
/// <reference path='../maplebirch.d.ts' />
(() => {
  'use strict';
  const maplebirch = window.maplebirch;

  maplebirch.npc.Schedules.add('Robin', [0, 23], 'orphanage')
    .if((date) => C.npc.Robin.init !== 1, 
      () => '', 
      { id: 'NotInit', priority: 9999 }
    ).if((date) => V.robinlocationoverride && V.robinlocationoverride.during.includes(date.hour),
      (date) => V.robinlocationoverride.location,
      { id: 'LocationOverride', priority: 45 }
    ).if((date) => ['docks', 'landfill', 'dinner', 'pillory', 'mansion'].includes(V.robinmissing),
      (date) => V.robinmissing,
      { id: 'Missing', priority: 40 }
    ).if((date) => !date.isHourBetween(7, 20),
      'sleep',
      { id: 'Sleeping', priority: 35 }
    ).if((date) => V.gwylanSeen?.includes('cafe_walk_robin') && V.robin.timer.hurt === 0 && V.daily.robin_in_cafe && !between(V.chef_state, 7, 8) && date.schoolDay && date.isBetween([8, 0], [8, 49]),
      'cafe',
      { id: 'Cafe', priority: 30 }
    ).if((date) => date.schoolDay && date.isHourBetween(8, 15),
      'school',
      { id: 'SchoolDay', priority: 25 }
    ).if((date) => date.isBetween([16, 31], [16, 59]),
      (date) => V.daily.robin.bath ? 'orphanage' : 'bath',
      { id: 'BathTime', priority: 20 }
    ).if((date) => V.halloween === 1 && date.isHourBetween(16, 18) && Time.monthDay === 31,
      'halloween',
      { id: 'Halloween', priority: 15 }
    ).if((date) => date.weekEnd && date.isHourBetween(9, 16) && C.npc.Robin.trauma < 80,
      (date) => date.winter ? 'park' : 'beach',
      { id: 'WeekendOuting', priority: 10 }
    ).if((date) => V.englishPlay === 'ongoing' && V.englishPlayDays === 0 && date.isHourBetween(17, 20),
      'englishPlay',
      { id: 'EnglishPlay', priority: 5 }
    );

  maplebirch.npc.Schedules.add('Sydney', [0, 23], 'home')
    .if((date) => date.schoolDay,
      (date) => {
        wikifier('schooleffects');
        return date.schedule
          .set([0, 5], 'home')
          .if(date => date.isBetween([6, 0], [9, 0]) && V.sydneyLate === 1, 'late')
          .set(6, 'temple')
          .if(date => date.isHourBetween(7, 8) || (date.isHour(9) && V.sydneyScience !== 1), 'library')
          .set(9, 'science')
          .if(date => ['second', 'third'].includes(V.schoolstate), 'class')
          .if(date => V.schoolstate === 'lunch' && V.daily.school.lunchEaten !== 1 && date.isMinuteBetween(0, 15), 'canteen')
          .if(date => V.englishPlay === 'ongoing' && V.schoolstate === 'afternoon', (date) => { T.sydney_location_message = 'rehearsal'; return 'rehearsal' })
          .if(date => date.isBetween([0, 0], [15, 0]) || (date.isHour(16) && date.isMinuteBetween(0, 40)), date => V.daily.sydney.templeSkip ? 'temple' : 'library')
          .set([16, 22], 'temple');
      },{ id: 'SchoolDay', priority: 5 }
    ).if((date) => !Time.schoolTerm,
      (date) => date.isHourBetween(6, 22) ? 'temple' : 'home',
      { id: 'NoSchoolTerm', priority: 10 }
    ).if((date) => V.sydneySeen !== undefined && V.adultshopunlocked && C.npc.Sydney.corruption > 10 && date.isHourBetween(16, 19),
      (date) => {
        const corruption = C.npc.Sydney.corruption;
        return date.schedule
          .if(date => V.adultshophelped === 1, 'temple')
          .if(date => corruption > 10 && date.weekDay === 4, (date) => { T.sydney_location_message = 'shop'; return 'shop' })
          .if(date => corruption > 20 && date.weekDay === 5, (date) => { T.sydney_location_message = 'shop'; return 'shop' })
          .if(date => corruption > 30 && date.weekDay === 3 && V.sydney.rank === 'initiate', (date) => { T.sydney_location_message = 'shop'; return 'shop' })
          .if(date => corruption > 40 && date.weekDay === 2 && V.sydney.rank === 'initiate', (date) => { T.sydney_location_message = 'shop'; return 'shop' })
          .if(date => true, (date) => { T.sydney_location_message = 'temple'; return 'temple' });
      },{ id: 'Shop', priority: 15 }
    ).if((date) => date.weekDay === 6 && date.isHourBetween(16, 19),
      (date) => V.adultshophelped === 1 ? 'temple' : 'shop',
      { id: 'Friday', priority: 20 }
    ).if((date) => date.weekDay === 7,
      (date) => {
        return date.schedule
          .if(date => V.adultshopopeningsydney === true && date.isBefore([21, 0]), 'shop')
          .set([6, 23], 'temple')
      },{ id: 'Saturday', priority: 25 }
    ).if((date) => date.weekDay === 1,
      'temple',
      { id: 'Sunday', priority: 30 }
    ).if((date) => V.englishPlay === 'ongoing' && V.englishPlayDays === 0 && date.isHourBetween(17, 20),
      'englishPlay',
      { id: 'EnglishPlay', priority: 35 }
    ).if((date) => V.daily.sydney.punish === 1,
      (date) => { T.sydney_location_message = 'home'; return 'home' },
      { id: 'Punish', priority: 40 }
    ).if((date) => V.sydney_location_override && V.replayScene,
      (date) => V.sydney_location_override,
      { id: 'DEBUG', priority: 9999 }
    );
})();