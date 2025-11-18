// @ts-check
/// <reference path='../../maplebirch.d.ts' />
(() => {
  const maplebirch = window.maplebirch;

  class NPCClothes {
    /** @param {NPCManager} [manager] */
    constructor(manager) {
      /** @type {any} */
      this.manager = this.manager;
      this.clothes = new Map();
      /** @type {any[]} */
      this.outfits = [];
    }

    /** @param {string} modName @param {string} filePath */
    async importNPCClothesData(modName, filePath) {
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
      return this.#processClothesData(data);
    }

    /** @param {any} data */
    #processClothesData(data) {
      for (const item of data) {
        this.clothes.set(item.name, {
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
        this.outfits.push(item.name);
      }
      return true;
    }

    #vanillaNPCClothesData() {
      this.manager.addClothes(
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
    }

    init() {
      this.#vanillaNPCClothesData();
    }
  }

  maplebirch.once(':npc-init', (/** @type {NPCManager} */ data) => {
    Object.assign(data, { Clothes: new NPCClothes(data), });
    Object.assign(data.constructor, Object.freeze(NPCClothes));
  });
})();
