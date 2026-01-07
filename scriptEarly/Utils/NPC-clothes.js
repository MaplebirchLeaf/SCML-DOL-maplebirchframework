// @ts-check
/// <reference path='../../maplebirch.d.ts' />
(() => {

  const NPCClothes = (() => {
    /** @type {any[]} */
    const npcClothesSets = [];
    /** @param {any[]} configs */
    function addClothes(...configs) {
      if (configs.length === 0) return;
      const npcClothes = Array.isArray(configs[0]) ? configs[0] : configs;
      npcClothes.forEach(config => {
        const { name, type = 'custom', gender = 'n', outfit = 0, upper, lower, desc } = config;
        if (!name) return;
        const upperConfig = typeof upper === 'string' ? { name: upper } : upper;
        const lowerConfig = typeof lower === 'string' ? { name: lower } : lower;
        if (!upperConfig.name || !lowerConfig.name) { NPCClothes.log('衣物配置缺少name属性', 'ERROR'); return; }
        const newClothes = {
          name, type, gender, outfit,
          clothes: {
            upper: {
              name: upperConfig.name,
              integrity_max: upperConfig.integrity_max !== undefined ? upperConfig.integrity_max : 100,
              word: upperConfig.word ?? 'a',
              action: upperConfig.action ?? 'lift',
              desc: upperConfig.desc ?? upperConfig.name
            },
            lower: {
              name: lowerConfig.name,
              integrity_max: lowerConfig.integrity_max !== undefined ? lowerConfig.integrity_max : 100,
              word: lowerConfig.word ?? 'n',
              action: lowerConfig.action ?? 'lift',
              desc: lowerConfig.desc ?? lowerConfig.name
            }
          },
          desc: desc ?? `${upperConfig.name}和${lowerConfig.name}`
        };
        npcClothesSets.push(newClothes);
      });
      if (setup.npcClothesSets) NPCClothes.merge();
    }

    const clothes = new Map();
    /** @type {any[]} */
    const outfits = [];

    /** @param {string} modName @param {string} filePath */
    async function importNPCClothesData(modName, filePath) {
      const modZip = maplebirch.modLoader.getModZip(modName);
      const file = modZip.zip.file(filePath);
      const content = await file.async('text');
      let data;
      if (filePath.endsWith('.json')) {
        data = JSON.parse(content);
      } else if (filePath.endsWith('.yml') || filePath.endsWith('.yaml')) {
        data = maplebirch.yaml.load(content);
      } else {
        return false;
      }
      return NPCClothes.clothesData(data);
    }
    
    class NPCClothes {
      static log = new Function;
      /** @param {any} data */
      static clothesData(data) {
        for (const item of data) {
          clothes.set(item.name, {
            over_upper:  item.over_upper,
            over_lower:  item.over_lower,
            upper:       item.upper,
            lower:       item.lower,
            under_upper: item.under_upper,
            under_lower: item.under_lower,
            over_head:   item.over_head,
            head:        item.head,
            face:        item.face,
            neck:        item.neck,
            legs:        item.legs,
            feet:        item.feet,
            genital:     item.genital
          });
          outfits.push(item.name);
        }
      }

      static merge() {
        for (const clothesSet of npcClothesSets) {
          if (setup.npcClothesSets.some((/**@type {{ name: any; }}*/set) => set.name === clothesSet.name)) {
            NPCClothes.log(`服装套装 ${clothesSet.name} 已存在，跳过添加`, 'WARN'); 
            continue;
          }
          setup.npcClothesSets.push(clothesSet);
        }
        npcClothesSets.length = 0;
      }

      static init() {
        addClothes(
          {
            name: "neutralDefault",
            type: "default",
            gender: "n",
            outfit: 0,
            upper: {
              name: "shirt",
              integrity_max: 100,
              word: "a",
              action: "lift",
              get desc() { return maplebirch.Language === 'CN' ? '衬衫' : 'shirt'; }
            },
            lower: {
              name: "cargo trousers",
              integrity_max: 100,
              word: "n",
              action: "pull",
              get desc() { return maplebirch.Language === 'CN' ? '工装裤' : 'cargo trousers'; }
            },
            get desc() { return maplebirch.Language === 'CN' ? '衬衫和工装裤' : 'Shirt and cargo trousers'; }
          },
          {
            name: "hermDefault",
            type: "default",
            gender: "h",
            outfit: 0,
            upper: {
              name: "shirt",
              integrity_max: 100,
              word: "a",
              action: "lift",
              get desc() { return maplebirch.Language === 'CN' ? '衬衫' : 'shirt'; }
            },
            lower: {
              name: "miniskirt",
              integrity_max: 100,
              word: "a",
              action: "lift",
              get desc() { return maplebirch.Language === 'CN' ? '迷你裙' : 'miniskirt'; }
            },
            get desc() { return maplebirch.Language === 'CN' ? '衬衫和迷你裙' : 'Shirt and miniskirt'; }
          }
        );

        NPCClothes.merge();
      }
    }

    Object.defineProperties(NPCClothes, {
      add:    { value: addClothes },
      import: { value: importNPCClothesData },
    })

    return NPCClothes;
  })()

  maplebirch.once(':npc-init', (/**@type {NPCManager}*/data) => {
    NPCClothes.log = data.log;
    Object.assign(data, { Clothes: NPCClothes, });
  });
})();
