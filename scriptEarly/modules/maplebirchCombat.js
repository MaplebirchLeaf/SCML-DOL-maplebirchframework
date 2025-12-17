(async() => {
  'use strict';
  if (!window.maplebirch) {
    console.log('%c[maplebirch] 错误: 核心系统未初始化', 'color: #C62828; font-weight: bold;');
    return;
  }
  const maplebirch = window.maplebirch;

  class CombatManager {
    constructor(manager) {
      this.Reaction = {
        Triggers: { herm: [], crossdress: [] },
        HermNameList: ['Sydney', 'Kylar', 'Gwylan'],
        CDNameList: [],
        reg: function (type, npc, cond, action) {
          this.Triggers[type].push({ npc, cond, action });
          const list = type === 'herm' ? this.HermNameList : this.CDNameList;
          if (!list.includes(npc)) list.push(npc);
        },
        regReaction: function (type, npc, config) {
          this.reg(type, npc,
            () => !V[`${npc.toLowerCase()}Seen`]?.includes(type),
            () => {
              if (V[`${npc.toLowerCase()}Seen`]?.includes(type)) return '';
              const single = V.npc.length === 1;
              const lang = maplebirch.Language === 'CN' ? 'CN' : 'EN';
              let output;
              if (typeof config.texts === 'function') { output = config.texts(lang, single); }
              else { output = single ? config.texts[lang].s : config.texts[lang].m; }
              const effects = typeof config.effects === 'function' ? config.effects() : (config.effects || '');
              return `<<set $${npc.toLowerCase()}Seen.pushUnique('${type}')>>${output}${effects}`;
            }
          );
        },
        check: function (type) {
          const npcList = type === 'herm' ? this.HermNameList : this.CDNameList;
          const outputs = [];
          for (const npcName of V.npc.filter(n => npcList.includes(n))) {
            const triggers = this.Triggers[type].filter(t => t.npc === npcName && t.cond());
            triggers.forEach(trigger => {
              const output = trigger.action();
              if (output) outputs.push(output);
            });
          }
          return outputs.join('<br><br>');
        },
        init: function () {
          const reg = this.regReaction.bind(this);
          reg('herm', 'Sydney', {
            texts: {
              CN: { s: `<<if _sydneyStatus.includes('corrupt')>><<He>>惊奇地盯着你的<<genitals>>。<<else>><<He>>将好奇的目光投向你的<<genitals>>。<</if>>`, m: `<<if _sydneyStatus.includes('corrupt')>>悉尼惊奇地盯着你的<<genitals>>。<<else>>悉尼将好奇的目光投向你的<<genitals>>。<</if>>` },
              EN: { s: `<<if _sydneyStatus.includes("corrupt")>><<He>> stares with wonder at your <<genitals>>.<<else>><<He>> eyes your <<genitals>> with great curiosity.<</if>>`, m: `<<if _sydneyStatus.includes("corrupt")>>Sydney stares with wonder at your <<genitals>>.<<else>>Sydney eyes your <<genitals>> with great curiosity.<</if>>` }
            },
            effects: '<<npcincr Sydney purity -2>><<lspurity>><<set $speechhermaroused to 2>>'
          });
          reg('crossdress', 'Sydney', {
            texts: {
              CN: { s: `<<if _sydneyStatus.includes('corrupt')>><<He>>被你的<<genitals>>吓了一跳。虽然这不是<<he>>所期望的，但是<<he>>好像并不介意。<<else>><<He>>迷茫地看着你的<<genitals>>。这不是<<he>>所期望的，但是<<he>>好像并不在乎。<</if>>`, m: `<<if _sydneyStatus.includes('corrupt')>>悉尼被你的<<genitals>>吓了一跳。虽然这不是<<nnpc_he 'Sydney'>>所期望的，但是<<nnpc_he 'Sydney'>>好像并不介意。<<else>>悉尼迷茫地看着你的<<genitals>>。这不是<<nnpc_he 'Sydney'>>所期望的，但是<<nnpc_he 'Sydney'>>好像并不在乎。<</if>>` },
              EN: { s: `<<if _sydneyStatus.includes('corrupt')>><<He>> looks taken aback by your <<genitals>>. It wasn't what <<he>> was expecting, but <<he>> doesn't seem to mind.<<else>><<He>> stares at your <<genitals>> with confusion. It wasn't what <<he>> was expecting, but <<he>> doesn't seem to mind.<</if>>`, m: `<<if _sydneyStatus.includes('corrupt')>>Sydney looks taken aback by your <<genitals>>. It wasn't what <<nnpc_he 'Sydney'>> was expecting, but <<nnpc_he 'Sydney'>> doesn't seem to mind.<<else>>Sydney stares at your <<genitals>> with confusion. It wasn't what <<nnpc_he 'Sydney'>> was expecting, but <<nnpc_he 'Sydney'>> doesn't seem to mind.<</if>>` }
            },
            effects: '<<run statusCheck("Sydney")>><<npcincr Sydney purity -2>><<lspurity>><<set $speechcrossdressaroused to 2>>'
          });
          reg('herm', 'Kylar', {
            texts: {
              CN: { s: `<span class='purple'><<He>>挥了挥手，在看到你的<<genitals>>后，<<his>>呼吸急促起来。</span>`, m: `<span class='purple'>凯拉尔挥了挥手，在看到你的<<genitals>>后，<<nnpc_his 'Kylar'>>呼吸急促起来。</span>` },
              EN: { s: `<span class='purple'><<His>> hands shake and <<his>> breath quickens at the sight of your <<genitals>>.</span>`, m: `<span class='purple'>Kylar hands shake and <<nnpc_his 'Kylar'>> breath quickens at the sight of your <<genitals>>.</span>` }
            },
            effects: '<<set $enemyarousal += 50>><<set $speechhermaroused to 2>>'
          });
          reg('crossdress', 'Kylar', {
            texts: (lang, s) => {
              const p = T.kylar.gender !== V.player.sex || T.kylar.gender === 'h';
              const t = {
                CN: { s: { p: `你的<<genitals 1>>显然不是<<he>>所期望的，但是<<he>>好像并不在乎。<<if _kylar.gender isnot 'h'>><span class='purple'>事实上，如果从<<his>>兴奋着颤抖的双手来看，<<he>>是相当高兴的！</span><</if>>`, n: `当<<He>>看到你的<<genitals>>时，<<he>>似乎很失望。这不是<<he>>所期望的。` }, m: { p: `你的<<genitals 1>>显然不是凯拉尔所期望的，但是凯拉尔好像并不在乎。<<if _kylar.gender isnot 'h'>><span class='purple'>事实上，如果从<<nnpc_his 'Kylar'>>兴奋着颤抖的双手来看，<<nnpc_he 'Kylar'>>是相当高兴的！</span><</if>>`, n: `当凯拉尔看到你的<<genitals>>时，凯拉尔似乎很失望。这不是凯拉尔所期望的。` } },
                EN: { s: { p: `Your <<genitals 1>> was clearly not what <<he>> was expecting, but <<he>> doesn't seem to mind. <<if _kylar.gender isnot "h">><span class="purple">In fact, if <<his>> shaking hands are anything to go by <<he>> is quite pleased.</span><</if>>`, n: `<<He>> looks disappointed by your <<genitals>>. It wasn't what <<he>> was expecting.` }, m: { p: `Your <<genitals 1>> was clearly not what kylar was expecting, but <<nnpc_he 'Kylar'>> doesn't seem to mind. <<if _kylar.gender isnot "h">><span class="purple">In fact, if <<nnpc_his 'Kylar'>> shaking hands are anything to go by <<nnpc_he 'Kylar'>> is quite pleased.</span><</if>>`, n: `Kylar looks disappointed by your <<genitals>>. It wasn't what <<nnpc_he 'Kylar'>> was expecting.` } }
              };
              return s ? t[lang].s[p ? 'p' : 'n'] : t[lang].m[p ? 'p' : 'n'];
            },
            effects: () => {
              const p = T.kylar.gender !== V.player.sex || T.kylar.gender === 'h';
              return p ? '<<set $enemyarousal += 50>><<set $speechcrossdressaroused to 2>>' : '<<set $enemyarousal -= 100>><<set $enemytrust -= 50>><<set $speechcrossdressdisappointed to 2>>';
            }
          });
          reg('herm', 'Gwylan', {
            texts: {
              CN: { s: `<<He>>见到你的<<genitals>>后，稍稍睁大了眼睛。`, m: `格威岚见到你的<<genitals>>后，稍稍睁大了眼睛。` },
              EN: { s: `<<His>> eyebrows raise upon seeing your <<genitals>>.`, m: `Gwylan's eyebrows raise upon seeing your <<genitals>>.` }
            },
            effects: '<<set $speechhermaroused to 2>>'
          });
          reg('crossdress', 'Gwylan', {
            texts: {
              CN: { s: `<<He>>看到你的<<genitals>>时挠了挠头。虽然这不是<<he>>预想中的样子，但<<he>>似乎并不在意。`, m: `格威岚看到你的<<genitals>>时挠了挠头。虽然这不是<<nnpc_he 'Gwylan'>>预想中的样子，但<<nnpc_he 'Gwylan'>>似乎并不在意。` },
              EN: { s: `<<He>> scratches <<his>> head upon seeing your <<genitals>>. It wasn't what <<he>> was expecting, but <<he>> doesn't seem to mind.`, m: `Gwylan scratches <<nnpc_his 'Gwylan'>> head upon seeing your <<genitals>>. It wasn't what <<nnpc_he 'Gwylan'>> was expecting, but <<nnpc_he 'Gwylan'>> doesn't seem to mind.` }
            },
            effects: '<<set $speechcrossdressaroused to 2>>'
          });
        }
      };
      this.Reaction.init();
    }

    ejaculation(index, ...args) {
      const npcName = V.npc[V.npcrow.indexOf(index)];
      const npc = V.NPCList[index]; if (!npc) return false;
      const output = args[0] ? ' ' + args[0] : '';
      if (npcName && maplebirch.SugarCube.Macro.has(`ejaculation-${npcName.toLowerCase()}`) && setup.NPCNameList.includes(npcName)) {
        return `<<ejaculation-${npcName.toLowerCase()}${output}>>`
      } if (V.position === 'wall') {
        if (V.walltype === 'pillory' || V.walltype === 'cleanpillory') { return `<<ejaculation-pillory${output}>>`; }
        else { return `<<ejaculation-wall${output}>>`; }
      } else if (V.punishmentposition === 'gloryhole' || V.gloryhole) {
        return `<<ejaculation-gloryhole${output}>>`
      } else if (V.NPCList[index].type === 'plant') {
        return `<<ejaculation-plant${output}>>`
      } else if (V.NPCList[index].fullDescription === 'Ivory Wraith') {
        return `<<ejaculation-wraith${output}>>`
      } else {
        return ''
      }
    }
  }

  await maplebirch.register('combat', new CombatManager(maplebirch), ['npc']);
})();