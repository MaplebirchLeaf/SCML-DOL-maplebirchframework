// @ts-check
/// <reference path='../../maplebirch.d.ts' />
(() => {
  'use strict';

  const NPCSidebar = (() => {
    const display = new Map();

    class NPCSidebar {
      /**
       * 从模组加载 NPC 侧边栏图片
       * @param {JSZip} modZip 模组压缩包
       * @param {string[]} npcName NPC名称数组
       * @returns {string[]} 返回所有找到的图片路径
       */
      static loadFromMod(modZip, npcName) {
        if (!Array.isArray(npcName) || npcName.length === 0) return [];
        const formats = new Set(['png', 'jpg', 'gif']);
        const paths = [];
        for (const name of npcName) {
          const npcName = maplebirch.tool.convert(name, 'capitalize');
          if (!display.has(npcName)) display.set(npcName, new Set());
          const npcSet = display.get(npcName);
          const folder = `img/ui/nnpc/${npcName.toLowerCase()}/`;
          for (const file in modZip.zip.files) {
            if (file.startsWith(folder) && file !== folder) {
              // @ts-ignore
              const ext = file.split('.').pop().toLowerCase();
              if (formats.has(ext)) {
                // @ts-ignore
                const imgName = file.split('/').pop().split('.')[0];
                if (imgName) { npcSet.add(imgName); paths.push(file); }
              }
            }
          }
        }
        return paths;
      }

      /** @param {{ maplebirch: { nnpc?: any; npcsidebar?: any; }; filters: { nnpc_tan: any; }; }} options */
      static preprocess(options) {
        (options.maplebirch ??= {}).nnpc ??= {};
        options.maplebirch.nnpc.show = V.options.maplebirch.npcsidebar.show ? true : false;
        options.maplebirch.nnpc.model = V.options.maplebirch.npcsidebar.model ? true : false;
        options.maplebirch.nnpc.position = V.options.maplebirch.npcsidebar.position ?? 'front';
        options.maplebirch.nnpc.tan = V.options.maplebirch.npcsidebar.tan ??= 0;
        options.maplebirch.nnpc.skin_type = V.options.maplebirch.npcsidebar.skin_type ?? 'light';
        options.filters.nnpc_tan = setup.colours.getSkinFilter(options.maplebirch.nnpc.skin_type, options.maplebirch.nnpc.tan);
        
      }

      static layers = {
        nnpc: {
          srcfn() {
            if (V.NPCList[0].fullDescription && setup.NPCNameList.includes(V.NPCList[0].fullDescription)) {
              if (V.options?.maplebirch?.npcsidebar?.display[V.NPCList[0].fullDescription] === 'none') return;
              return `img/ui/nnpc/${V.NPCList[0].fullDescription.toLowerCase()}/${V.options?.maplebirch?.npcsidebar?.display[V.NPCList[0].fullDescription]}.png`;
            }
          },
          /** @param {{ maplebirch: { nnpc: { show: any; model: any; }; }; }} options */
          showfn(options) {
            return !!options.maplebirch.nnpc.show && !options.maplebirch.nnpc.model;
          },
          /** @param {{ maplebirch: { nnpc: { position: string; }; }; }} options */
          zfn(options) {
            return options.maplebirch.nnpc.position === 'front' ? 300 : -10;
          },
          filters: ['nnpc_tan'],
          animation: 'idle'
        },
      }

      /** @param {NPCManager} manager */
      static init(manager) {
        for (const npcName of manager.NPCNameList) if (!display.has(npcName)) display.set(npcName, new Set());
        manager.core.char.use('pre', NPCSidebar.preprocess);
        manager.core.char.use(NPCSidebar.layers);
      }
    }

    Object.defineProperties(NPCSidebar, {
      display:    { get: () => display },
    });

    return NPCSidebar;
  })()

  maplebirch.once(':npc-init', (/**@type {NPCManager}*/data) => { Object.assign(data, { Sidebar: NPCSidebar }); });
})();