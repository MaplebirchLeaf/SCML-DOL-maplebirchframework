// @ts-check
/// <reference path='../maplebirch.d.ts' />
(() => {
  'use strict';
  const maplebirch = window.maplebirch;

  const bodywriting = [
    `<<widget 'maplebirchBodyWriting'>>
      <<if Object.keys(_bodyPartOptions).length gt 0 && $options.maplebirch.bodywriting is true>><div class='settingsToggleItemWide'>
        <<set _maplebirchBodywriting to {}>>
        <<set _maplebirchBodywritingSpecialList to [...new Set(['none',...new Set(Object.values(setup.bodywriting).map(item => item.special).filter(Boolean)),'loveInterest'])].filter(special => !setup.loveInterestNpc?.includes(special))>>
        <<set _bodywritingSpecialTranslations to {none:{cn:'无',en:'None'},rape:{cn:'强奸',en:'Rape'},slave:{cn:'奴隶',en:'Slave'},violence:{cn:'暴力',en:'Violence'},sex:{cn:'性爱',en:'Sex'},bestiality:{cn:'兽交',en:'Bestiality'},prostitution:{cn:'卖淫',en:'Prostitution'},exhibitionism:{cn:'暴露癖',en:'Exhibitionism'},combat:{cn:'战斗',en:'Combat'},holy:{cn:'神圣',en:'Holy'},cattle:{cn:'牲畜',en:'Cattle'},criminal:{cn:'罪犯',en:'Criminal'},pregnancy:{cn:'怀孕',en:'Pregnancy'},impreg:{cn:'受孕',en:'Impregnation'},islander:{cn:'岛民',en:'Islander'},esoteric:{cn:'隐秘',en:'Esoteric'},loveInterest:{cn:'恋爱对象',en:'Love Interest'}}>>
        <<language>>
          <<option 'CN'>>
            <<set _maplebirchTextColorNames to [
              ['red', '<span class="red">红色</span>'],
              ['pink', '<span class="pink">粉色</span>'],
              ['light-pink', '<span class="light-pink">浅粉色</span>'],
              ['rose-gold', '<span class="rose-gold">玫瑰金</span>'],
              ['hospital-pink', '<span class="hospital-pink">医院粉</span>'],
              ['purple', '<span class="purple">紫色</span>'],
              ['lilac', '<span class="lilac">淡紫色</span>'],
              ['blue', '<span class="blue">蓝色</span>'],
              ['lblue', '<span class="lblue">浅蓝色</span>'],
              ['light-blue', '<span class="light-blue">亮蓝色</span>'],
              ['teal', '<span class="teal">青绿色</span>'],
              ['green', '<span class="green">绿色</span>'],
              ['lime-green', '<span class="lime-green">酸橙绿</span>'],
              ['light-green', '<span class="light-green">浅绿色</span>'],
              ['brown', '<span class="brown">棕色</span>'],
              ['gold', '<span class="gold">金色</span>'],
              ['silver', '<span class="silver">银色</span>'],
              ['bronze', '<span class="bronze">青铜色</span>'],
              ['steel', '<span class="steel">钢色</span>'],
              ['blue-steel', '<span class="blue-steel">蓝钢色</span>'],
              ['yellow', '<span class="yellow">黄色</span>'],
              ['pale-yellow', '<span class="pale-yellow">淡黄色</span>'],
              ['orange', '<span class="orange">橙色</span>'],
              ['tangerine', '<span class="tangerine">橘色</span>'],
              ['pale-tangerine', '<span class="pale-tangerine">淡橘色</span>'],
              ['black', '<span class="black">黑色</span>'],
              ['softbrown', '<span class="softbrown">软棕色</span>'],
              ['lightbrown', '<span class="lightbrown">浅棕色</span>'],
              ['burntorange', '<span class="burntorange">焦橙色</span>'],
              ['bloodorange', '<span class="bloodorange">血橙色</span>'],
              ['bluehair', '<span class="bluehair">蓝发色</span>'],
              ['deepblue', '<span class="deepblue">深蓝色</span>'],
              ['neonblue', '<span class="neonblue">霓虹蓝</span>'],
              ['greenhair', '<span class="greenhair">绿发色</span>'],
              ['darklime', '<span class="darklime">深柠檬绿</span>'],
              ['toxicgreen', '<span class="toxicgreen">毒绿色</span>'],
              ['tealhair', '<span class="tealhair">青绿发色</span>'],
              ['pinkhair', '<span class="pinkhair">粉发色</span>'],
              ['brightpink', '<span class="brightpink">亮粉色</span>'],
              ['hotpink', '<span class="hotpink">热粉色</span>'],
              ['softpink', '<span class="softpink">柔粉色</span>'],
              ['crimson', '<span class="crimson">深红色</span>'],
              ['purplehair', '<span class="purplehair">紫发色</span>'],
              ['mediumpurple', '<span class="mediumpurple">中紫色</span>'],
              ['brightpurple', '<span class="brightpurple">亮紫色</span>'],
              ['whitehair', '<span class="whitehair">白发色</span>'],
              ['snowwhitehair', '<span class="snowwhitehair">雪白色</span>'],
              ['softblond', '<span class="softblond">软金色</span>'],
              ['platinum', '<span class="platinum">铂金色</span>'],
              ['ashy', '<span class="ashy">灰金色</span>'],
              ['strawberry', '<span class="strawberry">草莓色</span>'],
              ['lewd', '<span class="lewd">淫荡色</span>'],
              ['grey', '<span class="grey">灰色</span>'],
              ['light-grey', '<span class="light-grey">浅灰色</span>'],
              ['tan', '<span class="tan">棕褐色</span>'],
              ['sand', '<span class="sand">沙色</span>'],
              ['olive', '<span class="olive">橄榄色</span>'],
              ['navy', '<span class="navy">海军蓝</span>'],
              ['wine', '<span class="wine">酒红色</span>'],
              ['russet', '<span class="russet">赤褐色</span>'],
              ['fleshy', '<span class="fleshy">肉色</span>'],
              ['brat', '<span class="brat">叛逆色</span>'],
              ['meek', '<span class="meek">温顺色</span>'],
              ['def', '<span class="def">反抗色</span>'],
              ['sub', '<span class="sub">顺从色</span>'],
              ['relaxed', '<span class="relaxed">放松色</span>'],
              ['anxious', '<span class="anxious">焦虑色</span>'],
              ['veteran', '<span class="veteran">老兵色</span>'],
              ['methodical', '<span class="methodical">有条不紊色</span>'],
              ['scarred', '<span class="scarred">伤疤色</span>'],
              ['tattooed', '<span class="tattooed">纹身色</span>'],
              ['manager', '<span class="manager">经理色</span>'],
              ['lustful', '<span class="lustful">欲望色</span>'],
              ['wraith', '<span class="wraith">幽灵色</span>'],
              ['witch', '<span class="witch">女巫色</span>'],
              ['custom', '自选']
            ]>>
            <<set _maplebirchBodywritingSpecialNames to {}>><<run _maplebirchBodywritingSpecialList.forEach(special => T.maplebirchBodywritingSpecialNames[T.bodywritingSpecialTranslations[special].cn] = special)>>
          <<option 'EN'>>
            <<set _maplebirchTextColorNames to [
              ['red', '<span class="red">Red</span>'],
              ['pink', '<span class="pink">Pink</span>'],
              ['light-pink', '<span class="light-pink">Light Pink</span>'],
              ['rose-gold', '<span class="rose-gold">Rose Gold</span>'],
              ['hospital-pink', '<span class="hospital-pink">Hospital Pink</span>'],
              ['purple', '<span class="purple">Purple</span>'],
              ['lilac', '<span class="lilac">Lilac</span>'],
              ['blue', '<span class="blue">Blue</span>'],
              ['lblue', '<span class="lblue">Light Blue</span>'],
              ['light-blue', '<span class="light-blue">Bright Blue</span>'],
              ['teal', '<span class="teal">Teal</span>'],
              ['green', '<span class="green">Green</span>'],
              ['lime-green', '<span class="lime-green">Lime Green</span>'],
              ['light-green', '<span class="light-green">Light Green</span>'],
              ['brown', '<span class="brown">Brown</span>'],
              ['gold', '<span class="gold">Gold</span>'],
              ['silver', '<span class="silver">Silver</span>'],
              ['bronze', '<span class="bronze">Bronze</span>'],
              ['steel', '<span class="steel">Steel</span>'],
              ['blue-steel', '<span class="blue-steel">Blue Steel</span>'],
              ['yellow', '<span class="yellow">Yellow</span>'],
              ['pale-yellow', '<span class="pale-yellow">Pale Yellow</span>'],
              ['orange', '<span class="orange">Orange</span>'],
              ['tangerine', '<span class="tangerine">Tangerine</span>'],
              ['pale-tangerine', '<span class="pale-tangerine">Pale Tangerine</span>'],
              ['black', '<span class="black">Black</span>'],
              ['softbrown', '<span class="softbrown">Soft Brown</span>'],
              ['lightbrown', '<span class="lightbrown">Light Brown</span>'],
              ['burntorange', '<span class="burntorange">Burnt Orange</span>'],
              ['bloodorange', '<span class="bloodorange">Blood Orange</span>'],
              ['bluehair', '<span class="bluehair">Blue Hair</span>'],
              ['deepblue', '<span class="deepblue">Deep Blue</span>'],
              ['neonblue', '<span class="neonblue">Neon Blue</span>'],
              ['greenhair', '<span class="greenhair">Green Hair</span>'],
              ['darklime', '<span class="darklime">Dark Lime</span>'],
              ['toxicgreen', '<span class="toxicgreen">Toxic Green</span>'],
              ['tealhair', '<span class="tealhair">Teal Hair</span>'],
              ['pinkhair', '<span class="pinkhair">Pink Hair</span>'],
              ['brightpink', '<span class="brightpink">Bright Pink</span>'],
              ['hotpink', '<span class="hotpink">Hot Pink</span>'],
              ['softpink', '<span class="softpink">Soft Pink</span>'],
              ['crimson', '<span class="crimson">Crimson</span>'],
              ['purplehair', '<span class="purplehair">Purple Hair</span>'],
              ['mediumpurple', '<span class="mediumpurple">Medium Purple</span>'],
              ['brightpurple', '<span class="brightpurple">Bright Purple</span>'],
              ['whitehair', '<span class="whitehair">White Hair</span>'],
              ['snowwhitehair', '<span class="snowwhitehair">Snow White</span>'],
              ['softblond', '<span class="softblond">Soft Blond</span>'],
              ['platinum', '<span class="platinum">Platinum</span>'],
              ['ashy', '<span class="ashy">Ashy</span>'],
              ['strawberry', '<span class="strawberry">Strawberry</span>'],
              ['lewd', '<span class="lewd">Lewd</span>'],
              ['grey', '<span class="grey">Grey</span>'],
              ['light-grey', '<span class="light-grey">Light Grey</span>'],
              ['tan', '<span class="tan">Tan</span>'],
              ['sand', '<span class="sand">Sand</span>'],
              ['olive', '<span class="olive">Olive</span>'],
              ['navy', '<span class="navy">Navy Blue</span>'],
              ['wine', '<span class="wine">Wine Red</span>'],
              ['russet', '<span class="russet">Russet</span>'],
              ['fleshy', '<span class="fleshy">Fleshy</span>'],
              ['brat', '<span class="brat">Brat</span>'],
              ['meek', '<span class="meek">Meek</span>'],
              ['def', '<span class="def">Defiant</span>'],
              ['sub', '<span class="sub">Submissive</span>'],
              ['relaxed', '<span class="relaxed">Relaxed</span>'],
              ['anxious', '<span class="anxious">Anxious</span>'],
              ['veteran', '<span class="veteran">Veteran</span>'],
              ['methodical', '<span class="methodical">Methodical</span>'],
              ['scarred', '<span class="scarred">Scarred</span>'],
              ['tattooed', '<span class="tattooed">Tattooed</span>'],
              ['manager', '<span class="manager">Manager</span>'],
              ['lustful', '<span class="lustful">Lustful</span>'],
              ['wraith', '<span class="wraith">Wraith</span>'],
              ['custom', 'Custom']
            ]>>
            <<set _maplebirchBodywritingSpecialNames to {}>><<run _maplebirchBodywritingSpecialList.forEach(special => T.maplebirchBodywritingSpecialNames[T.bodywritingSpecialTranslations[special].en] = special)>>
        <</language>>
        <span class="gold bold"><<lanSwitch 'Custom Bodywriting' '定制涂鸦'>></span><br>
        <<lanSwitch 'The characteristics of this bodywriting are' '这幅涂鸦的所具有的特定'>>：
        <br><<lanSwitch 'Color' '颜色'>>：<br><<radiobuttonsfrom '_maplebirchBodywriting.color' _maplebirchTextColorNames>>
        <div id='maplebirchBodyWriting' style='display:inline'></div><br><<lanSwitch 'Gender' '性别'>>：
        <<langlistbox '_maplebirchBodywriting.gender'>><<option 'asexual' 'n'>><<option 'male' 'm'>><<option 'famale' 'f'>><<option 'hermaphrodite' 'h'>><</langlistbox>>
        <br><<lanSwitch 'Category' '类别'>>：<<langlistbox '_maplebirchBodywriting.special' autoselect>><<optionsfrom _maplebirchBodywritingSpecialNames>><</langlistbox>>
        <br><<lanSwitch 'Related to the Love Interest?' '与恋爱对象有关?'>>
        <span class='tooltip-anchor linkBlue' tooltip="<span class='teal'><<lanSwitch 'This option will only take effect when the category is selected as &quot;Love Interest&quot;' '仅在类别选用&quot;恋爱对象&quot;时，此选项才会生效'>></span>">(?)</span>
        <<set _maplebirchBodywritingloveInterestNames = ['None', ...setup.loveInterestNpc.filter(name => isPossibleLoveInterest(name))]>>
        <br><<langlistbox '_maplebirchBodywriting.loveInterest' autoselect>><<optionsfrom _maplebirchBodywritingloveInterestNames>><</langlistbox>>
        <br><<lanSwitch 'A directional arrow?' '带有指向性的箭头?'>><br><<set _maplebirchBodywriting.arrow to 0>>
        <label><<lanSwitch 'YES' '是'>> <<radiobutton '_maplebirchBodywriting.arrow' 1 autocheck>></label>|<label><<lanSwitch 'NO' '否'>> <<radiobutton '_maplebirchBodywriting.arrow' 0 autocheck>></label>
        <br><<lanSwitch 'Does it imply lewd?' '具有淫秽暗示?'>><br><<set _maplebirchBodywriting.lewd to 0>>
        <label><<lanSwitch 'YES' '是'>> <<radiobutton '_maplebirchBodywriting.lewd' 1 autocheck>></label>|<label><<lanSwitch 'NO' '否'>> <<radiobutton '_maplebirchBodywriting.lewd' 0 autocheck>></label>
        <br><<set _maplebirchBodywritingPenNames to maplebirch.Language is 'CN' ? {普通笔: 'pen', 耐久笔: 'marker', 口红: 'lipstick', 泥巴: 'mud'} : {Pen: 'pen', Marker: 'marker', Lipstick: 'lipstick', Mud: 'mud'}>>
        <<language>>
        <<option 'CN'>>把 <<textbox '_maplebirchBodywriting.text' ''>> 用 <<langlistbox '_maplebirchBodywriting.pen'>><<optionsfrom _maplebirchBodywritingPenNames>><</langlistbox>> 写在你的 <<listbox '_maplebirchBodywriting.bodyPart'>><<optionsfrom _bodyPartOptions>><</listbox>> 上
        <<option 'EN'>>Write <<textbox '_maplebirchBodywriting.text' ''>> on your <<listbox '_maplebirchBodywriting.bodyPart'>><<optionsfrom _bodyPartOptions>><</listbox>> with a <<langlistbox '_maplebirchBodywriting.pen'>><<optionsfrom _maplebirchBodywritingPenNames>><</langlistbox>>
        <</language>>
        <<langlink '应用' $passage>>
          <<set _maplebirchBodywriting.skin to {
            writing: T.maplebirchBodywriting.color === 'custom' ? \`<span style='color:\${T.maplebirchBodywriting.custom}'>\${T.maplebirchBodywriting.text}</span>\` : \`<span class='\${T.maplebirchBodywriting.color}'>\${T.maplebirchBodywriting.text}</span>\`,
            writ_cn: T.maplebirchBodywriting.color === 'custom' ? \`<span style='color:\${T.maplebirchBodywriting.custom}'>\${T.maplebirchBodywriting.text}</span>\` : \`<span class='\${T.maplebirchBodywriting.color}'>\${T.maplebirchBodywriting.text}</span>\`,
            type: 'text',
            arrow: T.maplebirchBodywriting.arrow,
            lewd: T.maplebirchBodywriting.lewd,
            special: T.maplebirchBodywriting.special === 'loveInterest' ? T.maplebirchBodywriting.loveInterest : T.maplebirchBodywriting.special,
            gender: T.maplebirchBodywriting.gender,
            degree: 0
          }>>
          <<add_bodywriting _maplebirchBodywriting.bodyPart _maplebirchBodywriting.skin _maplebirchBodywriting.pen>>
        <</langlink>>
      </div><</if>>
    <</widget>>`
  ]

  const overlayWidgets = [
    `<<widget 'maplebirchReplace'>>
      <<set _key to _args[0]>>
      <<if !_key>><<exit>><</if>>
      <<if _currentOverlay is _key>>
        <<run closeOverlay()>>
        <<exit>>
      <</if>>
      <<script>>
        T.buttons.toggle();
        updateOptions();
        T.currentOverlay = T.key;
        $('#customOverlay').removeClass('hidden').parent().removeClass('hidden');
        $('#customOverlay').attr('data-overlay', T.currentOverlay);
      <</script>>
      <<if _args[1] is 'customize'>><<= '<<'+_key+'>>'>><<exit>><</if>>
      <<if _args[1] is 'title'>><<set _titleKey to 'title' + maplebirch.tool.convert(_key,'pascal')>><</if>>
      <<if maplebirch.tool.widget.Macro.has(_titleKey)>><<replace #customOverlayTitle>><<= '<<'+_titleKey+'>>'>><</replace>><</if>>
      <<replace #customOverlayContent>><<= '<<'+_key+'>>'>><</replace>>
    <</widget>>`,
  ];

  const audioWidgets = [
    `<<widget 'maplebirch-playback'>>
      <div class='settingsToggleItemWide'>
        <details class='maplebirch-playback'>
          <summary class='maplebirch-playback'><<= maplebirch.t('music player')>></summary>
          <div class='maplebirch-playback-content'>
            <<set _modName to _args[0]>>
            <<set $maplebirch.audio.playlist to maplebirch.audio.getPlayer(_modName).audioKeys>>
            <<for _key range $maplebirch.audio.playlist>>
              <<capture _key>>
              <<link _key>>
                <<run $maplebirch.audio.currentTrack = _key>>
                <<run $maplebirch.audio.currentIndex = $maplebirch.audio.playlist.indexOf(_key)>>
                <<run maplebirch.audio.getPlayer(_modName).stopAll()>>
                <<run maplebirch.audio.getPlayer(_modName).play(_key, { loop: V.maplebirch.audio.loopMode === 'single' })>>
                <<replace '#maplebirch-playback-controls'>><<maplebirch-playback-controls _modName>><</replace>>
              <</link>><br>
              <</capture>>
            <</for>><br>
            <div id='maplebirch-playback-controls'><<maplebirch-playback-controls _modName>></div><br>
            <<= maplebirch.t('import audio')>>: <input type='file' accept='audio/*' onchange='maplebirch.audio.addAudioFromFile(this.files[0], T.modName).then(success => {if (success) maplebirch.audio.refreshCache()});'>
            <<set $_clearCache to maplebirch.t('Clear',true)+maplebirch.t('Cache')>>
            <<link $_clearCache>><<run maplebirch.audio.refreshCache(_modName)>><</link>>
          </div>
        </details>
      </div>
    <</widget>>`,
    `<<widget 'maplebirch-playback-controls'>>
      <<set _playing to maplebirch.audio.getPlayer(_modName) ? maplebirch.audio.getPlayer(_modName).isPlaying() : []>>
      <<if !V.maplebirch.audio.currentAudio>>
        <<set V.maplebirch.audio.currentAudio to _playing[0] ? _playing[0] : V.maplebirch.audio.currentTrack>>
      <</if>>
      <<if !V.maplebirch.audio.volume>><<set V.maplebirch.audio.volume = 1.0>><</if>>
      <<set _isPaused to false>>
      <<if maplebirch.audio.getPlayer(_modName) && maplebirch.audio.getPlayer(_modName).pausedStates && V.maplebirch.audio.currentTrack>>
        <<set _isPaused to maplebirch.audio.getPlayer(_modName).pausedStates.has('maplebirch-audio:' + V.maplebirch.audio.currentTrack)>>
      <</if>>
      <div class='current-track-display'>
        <<if V.maplebirch.audio.currentTrack>>
          <<= maplebirch.t('currently playing')>>: <strong><span class='gold'><<= V.maplebirch.audio.currentTrack>></span></strong>
          <<if V.maplebirch.audio.loopMode === 'single'>>(<<= maplebirch.t('single repeat')>>)<</if>>
        <<else>>
          <<= maplebirch.t('there are no tracks playing')>>
        <</if>>
      </div>
      <<if V.maplebirch.audio.currentTrack && maplebirch.audio.getPlayer(_modName)>>
        <<set _duration to maplebirch.audio.getPlayer(_modName).getDuration(V.maplebirch.audio.currentTrack)>>
        <<set _currentTime to 0>>
        <<set _progress to 0>>
        <<if _playing.includes(V.maplebirch.audio.currentTrack)>>
          <<set _matchKey to Array.from(maplebirch.audio.getPlayer(_modName).activeSources.keys()).find(k => k.startsWith(\`maplebirch-audio:\${V.maplebirch.audio.currentTrack}\`))>>
          <<if _matchKey>>
            <<set _source to maplebirch.audio.getPlayer(_modName).activeSources.get(_matchKey)>>
            <<set _currentTime to Math.min(_duration, maplebirch.audio.getPlayer(_modName).audioManager.audioContext.currentTime - _source.playStartTime + _source.currentOffset)>>
            <<set _progress to Math.round((_currentTime / _duration) * 1000)>>
          <</if>>
        <</if>>
        <div class='audio-progress-container'>
          <input id='maplebirch-progress-range' class='maplebirch-progress' type='range' min='0' max='1000' step='1' value='<<= _progress>>' style='width: 100%;' disabled>
          <div class='audio-time-display'><<= Math.floor(_currentTime / 60)>>:<<= ('0' + Math.floor(_currentTime % 60)).slice(-2)>> / <<= Math.floor(_duration / 60)>>:<<= ('0' + Math.floor(_duration % 60)).slice(-2)>></div>
        </div>
        <<script>>
          (function() {
            const player = maplebirch.audio.getPlayer(T.modName);
            const currentTrack = V.maplebirch.audio.currentTrack;
            if (!player || !currentTrack) return;
            if (V.maplebirch.audio.progressTimer) clearInterval(V.maplebirch.audio.progressTimer);
            V.maplebirch.audio.progressTimer = setInterval(() => {
              const baseKey = \`maplebirch-audio:\${currentTrack}\`;
              const matchKey = Array.from(player.activeSources.keys()).find(k => k.startsWith(baseKey));
              let currentTime = 0;
              const duration = player.getDuration(currentTrack) || 0;
              if (matchKey) {
                const source = player.activeSources.get(matchKey);
                const elapsed = player.audioManager.audioContext.currentTime - source.playStartTime;
                currentTime = Math.min(duration, (source.currentOffset || 0) + elapsed);
              }
              const progress = Math.round((currentTime / duration) * 1000);
              const mins = Math.floor(currentTime / 60);
              const secs = Math.floor(currentTime % 60);
              const durationMins = Math.floor(duration / 60);
              const durationSecs = Math.floor(duration % 60);
              $('#maplebirch-playback-controls input.maplebirch-progress').val(progress);
              $('#maplebirch-playback-controls .audio-time-display').html(\`\${mins}:\${secs < 10 ? '0' : ''}\${secs} / \${durationMins}:\${durationSecs < 10 ? '0' : ''}\${durationSecs}\`);
            }, 100);
          })();
        <</script>>
      <</if>>
      <div class='audio-controls'>
        <<langlink 'previous song'>>
          <<if V.maplebirch.audio.currentIndex > 0>>
            <<set V.maplebirch.audio.currentIndex to V.maplebirch.audio.currentIndex - 1>>
          <<else>>
            <<set V.maplebirch.audio.currentIndex to V.maplebirch.audio.playlist.length - 1>>
          <</if>>
          <<set V.maplebirch.audio.currentTrack to V.maplebirch.audio.playlist[V.maplebirch.audio.currentIndex]>>
          <<run maplebirch.audio.getPlayer(_modName).stopAll()>>
          <<run maplebirch.audio.getPlayer(_modName).play(V.maplebirch.audio.currentTrack, {loop: V.maplebirch.audio.loopMode === 'single', volume: V.maplebirch.audio.volume})>>
          <<replace '#maplebirch-playback-controls'>><<maplebirch-playback-controls _modName>><</replace>>
        <</langlink>>
        <<if _playing.includes(V.maplebirch.audio.currentTrack)>>
          <<langlink 'pause'>>
            <<run maplebirch.audio.getPlayer(_modName).togglePause(V.maplebirch.audio.currentTrack)>>
            <<replace '#maplebirch-playback-controls'>><<maplebirch-playback-controls _modName>><</replace>>
          <</langlink>>
        <<elseif _isPaused>>
          <<langlink 'resume'>>
            <<run maplebirch.audio.getPlayer(_modName).togglePause(V.maplebirch.audio.currentTrack)>>
            <<replace '#maplebirch-playback-controls'>><<maplebirch-playback-controls _modName>><</replace>>
          <</langlink>>
        <<elseif V.maplebirch.audio.currentTrack>>
          <<langlink 'playback'>>
            <<run maplebirch.audio.getPlayer(_modName).play(
              V.maplebirch.audio.currentTrack,
              { loop: V.maplebirch.audio.loopMode === 'single', volume: V.maplebirch.audio.volume, stopOthers: false }
            )>>
            <<replace '#maplebirch-playback-controls'>><<maplebirch-playback-controls _modName>><</replace>>
          <</langlink>>
        <</if>>
        <<langlink 'next song'>>
          <<if V.maplebirch.audio.currentIndex < V.maplebirch.audio.playlist.length - 1>>
            <<set V.maplebirch.audio.currentIndex to V.maplebirch.audio.currentIndex + 1>>
          <<else>>
            <<set V.maplebirch.audio.currentIndex to 0>>
          <</if>>
          <<set V.maplebirch.audio.currentTrack to V.maplebirch.audio.playlist[V.maplebirch.audio.currentIndex]>>
          <<run maplebirch.audio.getPlayer(_modName).stopAll()>>
          <<run maplebirch.audio.getPlayer(_modName).play(V.maplebirch.audio.currentTrack, {loop: V.maplebirch.audio.loopMode === 'single', volume: V.maplebirch.audio.volume})>>
          <<replace '#maplebirch-playback-controls'>><<maplebirch-playback-controls _modName>><</replace>>
        <</langlink>>
        <<langlink 'stop'>>
          <<run maplebirch.audio.getPlayer(_modName).stopAll()>>
          <<set V.maplebirch.audio.currentTrack to null>>
          <<set V.maplebirch.audio.currentIndex to -1>>
          <<replace '#maplebirch-playback-controls'>><<maplebirch-playback-controls _modName>><</replace>>
        <</langlink>>
        <<langlink 'loop mode'>>
          <<if V.maplebirch.audio.loopMode === 'none'>>
            <<set V.maplebirch.audio.loopMode to 'single'>>
          <<else>>
            <<set V.maplebirch.audio.loopMode to 'none'>>
          <</if>>
          <<replace '#maplebirch-playback-controls'>><<maplebirch-playback-controls _modName>><</replace>>
        <</langlink>>
      </div>
      <label><<= maplebirch.t('volume')>>:</label>
      <<numberslider '$maplebirch.audio.volume' $maplebirch.audio.volume 0 1 0.01 {
        value: v => Math.round(v * 100) + '%',
        onInputChange: value => { maplebirch.audio.getPlayer(T.modName).Volume = value; }
      }>>
    <</widget>>`,
  ];

  const characterWidgets = [
    `<<widget 'maplebirch-npc-model'>>
      <div id='img-npc'>
        <<selectmodel 'npcmodel' 'sidebar'>>
        <<if $options.sidebarAnimations>>
          <<animatemodel 'mainCanvas'>>
        <<else>>
          <<rendermodel 'mainCanvas'>>
        <</if>>
      </div>
    <</widget>>`,
    `<<widget 'maplebirchTransformationMirror'>>
      <<set _modTransforms = []>>
      <<if V.maplebirch?.transformation>><<for _modName range Object.keys(V.maplebirch.transformation)>><<if V.maplebirch.transformation[_modName].level > 0>><<set _modTransforms.push(_modName)>><</if>><</for>><</if>>
      <<if _modTransforms.length>>
        <<for _modName range _modTransforms>>
          <<capture _modName>>
            <<set _config to maplebirch.char.transformation.config[_modName]>>
            <div class='settingsToggleItemWide'>
              <<if _config.icon>><<icon _config.icon>><</if>>
              <span class='gold bold'><<= maplebirch.t('Mods')+'：'+maplebirch.t(_modName)>></span>
              <<if $transformationParts[_modName]>><<for _partName, $_partValue range $transformationParts[_modName]>><<capture _partName, $_partValue>>
                <<if $_partValue isnot 'disabled'>>
                  <<set _varPath to '$transformationParts.'+_modName+'.'+_partName>>
                  <div class='tf-part-item'><<= maplebirch.t(String(_partName))>>：<<langlistbox _varPath autoselect>><<option '隐藏' 'hidden'>><<option '默认' 'default'>><</langlistbox>></div>
                <</if>>
              <</capture>><</for>><</if>>
            </div>
          <</capture>>
        <</for>>
      <</if>>
      <<if !_modTransforms.every(transform => V.transformationParts[transform]?.horns is 'disabled') && ['demon', 'cow'].every(transform => T[transform].horns is 'disabled') || 
        !_modTransforms.every(transform => V.transformationParts[transform]?.tail is 'disabled') && ['demon', 'cat', 'cow', 'wolf', 'bird', 'fox'].every(transform => T[transform].tail is 'disabled') || 
        !_modTransforms.every(transform => V.transformationParts[transform]?.wings is 'disabled') && ['angel', 'fallen', 'demon', 'bird'].every(transform => T[transform].wings is 'disabled')>>
        <div class='settingsToggleItemWide no-numberify'>
          <span class='gold bold'><<= maplebirch.tool.convert(maplebirch.t('layer',true)+maplebirch.t('adjustments'),'title')>>：</span>
          <br><div class='no-numberify'>
          <<if !_modTransforms.every(transform => V.transformationParts[transform]?.horns is 'disabled')>>
            <<set _front_text to $hornslayer is 'front' ? 'Prioritise headwear over horns' : 'Prioritise horns over headwear'>>
            <<set _front_value to $hornslayer is 'front' ? 'back' : 'front'>>
            <<langlink _front_text>><<run State.setVar('$hornslayer', _front_value)>><<run Engine.show()>><<updatesidebarimg true>><</langlink>><br>
          <</if>>
          <<if !_modTransforms.every(transform => V.transformationParts[transform]?.tail is 'disabled')>>
            <<set _tail_text = $taillayer === 'front' ? 'Push tail back' : 'Move tail forward'>>
            <<set _tail_value = $taillayer === 'front' ? 'back' : 'front'>>
            <<langlink _tail_text>><<run State.setVar('$taillayer', _tail_value)>><<run Engine.show()>><<updatesidebarimg true>><</langlink>><br>
          <</if>>
          <<if !_modTransforms.every(transform => V.transformationParts[transform]?.wings is 'disabled')>>
            <<set _wings_text = $wingslayer === 'front' ? 'Push wings behind' : 'Move wings forward'>>
            <<set _wings_value = $wingslayer === 'front' ? 'back' : 'front'>>
            <<langlink _wings_text>><<run State.setVar('$wingslayer', _wings_value)>><<run Engine.show()>><<updatesidebarimg true>><</langlink>><br>
          <</if>>
        </div>
        <<script>>jQuery('.passage').on('change', 'select.macro-langlistbox', function (e) { maplebirch.SugarCube.Wikifier.wikifyEval('<<updatesidebarimg true>>'); });<</script>>
      <</if>>
    <</widget>>`,
  ];

  const modHintWidgets = [
    `<<widget 'maplebirchModHint'>>
      <<if !$maplebirch.hintlocation>><<set $maplebirch.hintlocation to 'ModHint'>><</if>>
      <<switch $maplebirch.hintlocation>>
        <<case 'ModHint'>><<maplebirchModHintContent>>
        <<case 'Content'>><<maplebirchContent>>
        <<case 'Panel'>><<maplebirchPanel>>
        <<default>><<maplebirchModHintContent>>
      <</switch>>
    <</widget>>`,
    `<<widget 'titleMaplebirchModHint'>>
      <<if !$maplebirch.hintlocation>><<set $maplebirch.hintlocation to 'ModHint'>><</if>>
      <<switch $maplebirch.hintlocation>>
        <<case 'ModHint'>><<setupTabs 0>>
        <<case 'Content'>><<setupTabs 1>>
        <<case 'Panel'>><<setupTabs 2>>
        <<default>><<setupTabs 0>>
      <</switch>>
      <div id='overlayTabs' class='tab'>
        <<closeButtonMobile>>
        <<langbutton '模组介绍'>>
          <<toggleTab>><<set $maplebirch.hintlocation to 'ModHint'>>
          <<replace #customOverlayContent>><<maplebirchModHint>><</replace>>
        <</langbutton>>
        <<langbutton '模组内容'>>
          <<toggleTab>><<set $maplebirch.hintlocation to 'Content'>>
          <<replace #customOverlayContent>><<maplebirchModHint>><</replace>>
        <</langbutton>>
        <<langbutton '角色面板'>>
          <<toggleTab>><<set $maplebirch.hintlocation to 'Panel'>>
          <<replace #customOverlayContent>><<maplebirchModHint>><</replace>>
          <<run maplebirch.trigger('characterRender')>>
        <</langbutton>>
      </div>
      <<closeButton>>
    <</widget>>`,
    `<<widget 'maplebirchModHintMobile'>>
      <<if $options.maplebirch?.modHint is 'mobile' && $options.sidebarStats isnot 'disabled'>>
        <input type='button' class='saveMenuButton maplebirchModHintMobile' value='' onclick='maplebirch.tool.modhint.hintClicked()'>
      <</if>>
    <</widget>>`,
    `<<widget 'maplebirchModHintDesktop'>>
      <<if $options.maplebirch?.modHint is 'desktop'>>
        <<langbutton '秋枫白桦' 'upper'>>
          <<maplebirchReplace 'maplebirchModHint' 'title'>>
          <<run maplebirch.trigger('characterRender')>>
        <</langbutton>>
      <</if>>
    <</widget>>`,
    `<<widget 'maplebirchModHintContent'>>
      <span class='searchButtons'>
        <<textbox '_maplebirchModHintTextbox' ''>>
        <<langbutton 'search' 'capitalize'>><<run maplebirch.tool.modhint.searchButtonClicked()>><</langbutton>>
        <<langbutton 'clear' 'capitalize'>><<run maplebirch.tool.modhint.clearButtonClicked()>><</langbutton>>
      </span>
      <div id='maplebirchModHintContent'><<= setup.maplebirch.hint.play>></div>
    <</widget>>`,
    `<<widget 'maplebirchPanel'>>
      <div class='maplebirch-inventory-panel'>
        <!-- 状态区域（现在在左侧） -->
        <div class='maplebirch-status-section'>
          <h2>角色状态</h2>
          <div class='maplebirch-status-content'>
            <!-- 角色容器（包含角色图片和覆盖层） -->
            <div id='maplebirch-character-container'>
              <div id='maplebirch-character'></div>
              <div id='maplebirch-character-overlay'></div>
            </div>
          </div>
        </div>
      </div>
    <</widget>>`,
    `<<widget 'maplebirchContent'>><<= setup.maplebirch.content.play>><</widget>>`,
  ];

  const specialWidget = [
    ...bodywriting,
    ...overlayWidgets,
    ...audioWidgets,
    ...characterWidgets,
    ...modHintWidgets,
  ];

  const defaultData = {
    Init   : '<<run maplebirch.tool.framework.storyInit()>>',
    DataInit:'<<run maplebirch.trigger(":dataInit");>>',
    Header : '',
    Footer : '<<maplebirchFrameworkVersions>>',
    Information : '<<maplebirchFrameworkInfo>>',
    Options: `
      <<setupOptions>>
      <div class='settingsGrid'>
        <div class='settingsHeader options'>
          <span class='gold'><<= maplebirch.t('Maplebirch Frameworks')>></span>
        </div>
        <div class='settingsToggleItem'>
          <span class='gold'><<= maplebirch.t('Current Mods Language Setting')>></span>
          <<set _selectedLang to maplebirch.lang.language>>
          <<langlistbox '_selectedLang' autoselect>><<option 'English' 'EN'>><<option 'Chinese' 'CN'>><</langlistbox>>
        </div>
        <div class='settingsToggleItem'>
          <label><<checkbox '$options.maplebirch.debug' false true autocheck>><<= maplebirch.t('DEBUG')+maplebirch.t('Mode')>></label>
        </div>
        <div class='settingsToggleItem'>
          <span class='gold'><<= maplebirch.tool.convert(maplebirch.t('maplebirch',true)+maplebirch.t('sidebar',true)+maplebirch.t('position',true)+maplebirch.t('selection'),'capitalize')>></span>
          <<langlistbox '$options.maplebirch.modHint' autoselect>><<option 'mobile client' 'mobile'>><<option 'desktop client' 'desktop'>><<option 'disable' 'disable'>><</langlistbox>>
          <span class='tooltip-anchor linkBlue' tooltip="<span class='teal'><<lanSwitch 'Update next time the interface is opened' '在下次打开界面时更新'>></span>">(?)</span>
        </div>
        <div class='settingsToggleItem'>
          <label><<checkbox '$options.maplebirch.bodywriting' false true autocheck>><<lanSwitch 'Custom Bodywriting' '定制涂鸦'>></label>
          <span class='tooltip-anchor linkBlue' tooltip="<span class='teal'><<lanSwitch 'Customized bodywriting can be created at the mirror after activation.' '启用后在镜子处可定制涂鸦。'>></span>">(?)</span>
        </div>
        <div class='settingsToggleItem'>
          <span class='gold'><<= maplebirch.tool.convert(maplebirch.t('maplebirch',true)+maplebirch.t('celestial phenomenons settings'),'capitalize')>></span>
          <label><<checkbox '$options.maplebirch.solarEclipse' false true autocheck>><<= maplebirch.t('solar eclipse')>></label>
          <span class='tooltip-anchor linkBlue' tooltip="<span class='teal'><<lanSwitch 'When enabled, a solar eclipse will occur in the specified month.' '启用后将在指定月份出现日蚀。'>></span>">(?)</span>
        </div>
        <div class='settingsToggleItem'>
          <label><<checkbox '$options.maplebirch.npcschedules' false true autocheck>><<lanSwitch 'NPC Schedules' 'NPC 日程表'>></label>
          <span class='tooltip-anchor linkBlue' tooltip="<span class='teal'><<lanSwitch 'After enabling, it overrides the original schedule location detection for Robin and Sydney.' '启用后覆盖原版的罗宾和悉尼的日程地点检测。'>></span>">(?)</span>
        </div>
        <div class='settingsToggleItem'>
          <span class='gold'><<= maplebirch.tool.convert(maplebirch.t('total number of status displays'),'capitalize')>></span>
          <span class='tooltip-anchor linkBlue' tooltip="<span class='teal'><<lanSwitch 'Adjust the total number of status displays for Primary Relationships NPCs in the SOCIAL bar.' '调整社交栏中主要关系NPC的状态显示总数。'>></span>">(?)</span>
          <br><div class='maplebirch-relationcount-slider'><<numberslider '$options.maplebirch.relationcount' $options.maplebirch.relationcount 2 10 2>></div>
        </div>
        <div class='settingsToggleItemWide'>
          <<set _npcsidebarName = {}>>
          <<set setup.NPCNameList.forEach(name => T.npcsidebarName[maplebirch.autoTranslate(maplebirch.tool.convert(name, 'title'))] = name)>>
          <label onclick='maplebirch.trigger("update")'><<checkbox '$options.maplebirch.npcsidebar.show' false true autocheck>><<= maplebirch.tool.convert('NPC '+maplebirch.t('model',true)+maplebirch.t('display',true),'title')>></label> |
          <label onclick='maplebirch.trigger("update")'><<checkbox '$options.maplebirch.npcsidebar.model' false true autocheck>><<= maplebirch.tool.convert(maplebirch.t('canvas')+maplebirch.t('Mode'),'pascal')>></label>
          <span class='tooltip-anchor linkBlue' tooltip="<span class='teal'><<lanSwitch 'After enabling the display, named NPCs will show their models when nearby, with the canvas mode set to the player model' '开启显示后命名NPC在附近将显示模型，画布模式为玩家模型'>></span>">(?)</span><br>
          <<langlistbox '$options.maplebirch.npcsidebar.nnpc' autoselect>><<optionsfrom _npcsidebarName>><</langlistbox>>
          <<if $options.maplebirch.npcsidebar.nnpc>>
            <<if !['none'].concat(Array.from(maplebirch.npc.Sidebar.display[$options.maplebirch.npcsidebar.nnpc])).includes($options.maplebirch.npcsidebar.display[$options.maplebirch.npcsidebar.nnpc])>>
              <<set $options.maplebirch.npcsidebar.display[$options.maplebirch.npcsidebar.nnpc] = 'none'>>
            <</if>>
            <<set _fixedName = \`$options.maplebirch.npcsidebar.display.\${$options.maplebirch.npcsidebar.nnpc}\`>>
            <<set _npcsidebarDisplay = ['none'].concat(Array.from(maplebirch.npc.Sidebar.display[$options.maplebirch.npcsidebar.nnpc]))>>
            <<= maplebirch.tool.convert(maplebirch.t('graphic',true)+maplebirch.t('selection'), 'capitalize')>>：<<radiobuttonsfrom _fixedName _npcsidebarDisplay>>
          <</if>>
        </div>
      </div><hr>`,
    Cheats : `
      <div class='settingsGrid'>
        <div class='settingsHeader options'><span class='gold'><<= maplebirch.t('Mods Cheats')>></span></div>
        <<if $options.maplebirch.debug>><<run maplebirch.trigger('update')>>
          <div class='settingsToggleItem'><label onclick='maplebirch.trigger("update")'><<checkbox '$options.maplebirch.sandbox.V' false true autocheck>> V <<= maplebirch.t('permission')>></label></div>
          <div class='settingsToggleItem'><label onclick='maplebirch.trigger("update")'><<checkbox '$options.maplebirch.sandbox.T' false true autocheck>> T <<= maplebirch.t('permission')>></label></div>
          <div class='settingsToggleItem'><label onclick='maplebirch.trigger("update")'><<checkbox '$options.maplebirch.sandbox.maplebirch' false true autocheck>> Maplebirch <<= maplebirch.t('permission')>></label></div>
          <div class='settingsToggleItem'><label onclick='maplebirch.trigger("update")'><<checkbox '$options.maplebirch.sandbox.window' false true autocheck>> window <<= maplebirch.t('permission')>></label></div>
          <div id='ConsoleCheat' class='settingsToggleItemWide'>
            <<set _CodeCheater to maplebirch.t('Code Cheater')>>
            <details class='JSCheatConsole'>
              <summary class='JSCheatConsole'>JavaScript <<= maplebirch.t('Code Cheater')>></summary>
              <div class='searchButtons'>
                <div class='input-row'>
                  <<textbox '_maplebirchJSCheatConsole' ''>>
                  <<langbutton 'execute'>>
                    <<run maplebirch.tool.console.execute('javascript')>>
                  <</langbutton>>
                </div>
                <span id='js-cheat-console-status' class='cheat-console-status'></span>
              </div>
            </details>
            <details class='TwineCheatConsole'>
              <summary class='TwineCheatConsole'>Twine <<= maplebirch.t('Code Cheater')>></summary>
              <div class='searchButtons'>
                <div class='input-row'>
                  <<textbox '_maplebirchTwineCheatConsole' ''>>
                  <<langbutton 'execute'>>
                    <<run maplebirch.tool.console.execute('twine')>>
                  <</langbutton>>
                </div>
                <span id='twine-cheat-console-status' class='cheat-console-status'></span>
              </div>
            </details>
          </div>
        <</if>>
      </div><hr>
      <div class='settingsGrid'>
        <div class='settingsHeader options'><<= maplebirch.tool.convert(maplebirch.t('Mods',true)+maplebirch.t('transformation'),'title')>></div>
        <<if Object.keys(V.maplebirch?.transformation).length>><div class='settingsToggleItem'>
          <span class='gold'><<= maplebirch.tool.convert(maplebirch.t('Mods',true)+maplebirch.t('transformation',true)+maplebirch.t('type'),'title')>></span><br>
          <<for _modName range Object.keys(V.maplebirch?.transformation)>>
            <<capture _modName>>
            <<set _config = maplebirch.char.transformation.config[_modName]>>
              <<if _config.icon>><<icon _config.icon>><</if>>
              <<= maplebirch.t(_modName)>>：
              <<langlink 'Set'>>
                <<clearDivineTransformations>><<clearAnimalTransformations>>
                <<= \`<<\${_modName}Transform>>\`>><<updatesidebarimg>>
                <</langlink>> | 
              <<langlink 'Clear'>>
                <<clearDivineTransformations>><<clearAnimalTransformations>>
                <<= \`<<\${_modName}Transform 99>>\`>><<updatesidebarimg>>
              <</langlink>>
            <</capture>>
            <br>
          <</for>>
        </div>
        <div class='settingsToggleItem'>
          <span class='gold'><<= maplebirch.tool.convert(maplebirch.t('Mods',true)+maplebirch.t('transformation',true)+maplebirch.t('points'),'title')>></span><br>
          <<for _modName range Object.keys(V.maplebirch?.transformation || {})>>
            <<capture _modName>>
              <<set _config to maplebirch.char.transformation.config[_modName]>>
              <<set _title to _config.icon ? \`<<icon _config.icon>> \${maplebirch.t(_modName)}\` : \`\${maplebirch.t(_modName)}\`>>
              <<set _value = V.maplebirch.transformation[_modName].build || 0>>
              <<numberStepper _title _value {
                callback: (value) => { V.maplebirch.transformation[_modName].build = value; Wikifier.wikifyEval('<<transformationAlteration>><<updatesidebarimg>>'); },
                max: _config.build || 100, 
                percentage: false, 
                colorArr: ['--teal', '--purple']
              }>>
            <</capture>>
          <</for>>
        </div><</if>>
      </div>`,
    NPCinit : `<<run maplebirch.npc._vanillaNPCInit(_nam)>>`,
    NPCspawn : `<<run maplebirch.npc.NPCSpawn(_nam, _npcno)>>`
  };

  const locationPassage = {
    StoryCaption: [
      { src: '<<schoolday>>\n\t\t<br>', to: '<<schoolday>>\n\t\t<div id="maplebirchCaptionTextBox">\n\t\t<<maplebirchCaptionDescription>>\n\t\t<br>' },
      { src: '<<allurecaption>>', applybefore: '<<maplebirchStatusBar>>\n\t\t\t' },
      { src: '<</button>>\n\t\t\t<div class="sidebarButtonSplit">', to: '<</button>>\n\t\t\t<<maplebirchMenuBig>>\n\t\t\t<div class="sidebarButtonSplit">' },
      { src: '</div>\n\t\t\t<div class="sidebarButtonSplit">', to: '</div>\n\t\t\t<div class="sidebarButtonSplit"><<maplebirchMenuSmall>></div>\n\t\t\t<div class="sidebarButtonSplit">' },
      { src: '<<goo>>', to: '<<maplebirchCaptionAfterDescription>>\n\t\t<<goo>>\n\t\t</div>' },
      { src: '<<if $options.sidebarStats isnot "disabled">>', applybefore: '<<maplebirchHintMobile>>\n\t\t\t' },
      { src: '<<mobileStats>>', applyafter: '\n\t\t\t\t<<maplebirchStatsMobile>>' },
    ]
  };

  const widgetPassage = {
    Characteristics: [
      { src: '<<bodywriting>>', applyafter: '\n\n\t<<maplebirchCharaDescription>>' },
      { src: '<</silently>>\n\n\t\t\t<<characteristic-box _purityConfig>>', applybefore: '\t<<maplebirchDegreesBonusDisplay>>\n\t\t\t' },
      { src: '</div>\n\n\t\t<!--Common states for skills with grades-->', applybefore: '\t<<maplebirchDegreesBox>>\n\t\t' },
      { src: '<</silently>>\n\t\t\t<<characteristic-box _skulduggeryConfig>>', applybefore: '\t<<maplebirchSkillsBonusDisplay>>\n\t\t\t' },
      { src: '<<characteristic-box _housekeepingConfig>>', applyafter: '\n\n\t\t\t<<maplebirchSkillsBox>>' },
      { src: '<</silently>>\n\n\t\t\t<<characteristic-box _scienceConfig>>', applybefore: '\t<<maplebirchSubjectBoxBonusDisplay>>\n\t\t\t' },
      { src: '</div>\n\t\t<div class="characteristic-box-extras">', applybefore: '\t<<maplebirchSchoolSubjectsBox>>\n\t\t' },
      { src: '<<characteristic-text _schoolPerformanceConfig>>', applyafter: '\n\n\t\t\t<<maplebirchSchoolMarksText>>' },
      { src: '\t\t</div>\n\t</div>', applybefore: '\t\t\t<<maplebirchWeaponBox>>\n\t\t' }
    ],
    overlayReplace: [
      { src: '</div>\n\t<<closeButton>>\n<</widget>>\n\n<<widget "titleSaves">>', applybefore: '\t<<langbutton "Mods Settings">>\n\t\t\t<<toggleTab>>\n\t\t\t<<replace #customOverlayContent>><<maplebirchOptions>><</replace>>\n\t\t<</langbutton>>\n\t' },
      { src: '</div>\n\t<<closeButton>>\n<</widget>>\n\n<<widget "titleOptions">>', applybefore: '\t<<langbutton "Mods">>\n\t\t\t<<toggleTab>>\n\t\t\t<<replace #cheatsShown>><<maplebirchCheats>><</replace>>\n\t\t\t<<run $("#customOverlayContent").scrollTop(0);>>\n\t\t<</langbutton>>\n\t' },
      { src: '</div>\n\t<<closeButton>>\n<</widget>>\n\n<<widget "titleFeats">>', applybefore: '\t<<langbutton "Mods Statistics">>\n\t\t\t<<toggleTab>>\n\t\t\t<<replace #customOverlayContent>><<maplebirchStatistics>><</replace>>\n\t\t<</langbutton>>\n\t' }
    ],
    'Options Overlay': [
      { src: '<</widget>>\n\n<<widget "setFont">>', applybefore: '\t<<maplebirchInformation>>\n' }
    ],
    npcNamed: [
      { src: '<</widget>>\n\n<<widget "npcNamedUpdate">>', applybefore: '\t<<run maplebirch.npc.injectModNPCs()>>\n' }
    ],
    Social: [
      { src: 'T.importantNPCs = T.importantNpcOrder', applybefore: 'maplebirch.npc.vanillaNPCConfig(T.npcConfig);\n\t\t\t\t' },
      { src: '<</silently>>\n\t\t\t<<relation-box-simple _policeBoxConfig>>', applybefore: '\t<<maplebirchReputationModify>>\n\t\t\t' },
      { src: '<<relation-box-wolves>>', applyafter: '\n\n\t\t<<maplebirchReputation>>' },
      { src: '<</silently>>\n\n\t\t\t<<relation-box-simple _sexFameBoxConfig>>', applybefore: '\t<<maplebirchFameModify>>\n\t\t\t' },
      { src: '<<relation-box-simple _overallFameBoxConfig>>', applyafter: '\n\n\t\t\t<<maplebirchFame>>' },
      { src: '\t</div>\n\t<br>', applybefore: '\t<<maplebirchStatusSocial>>\n\t' }
    ],
    'Widgets Named Npcs': [
      { srcmatch: /\t\t\t<<NPC_CN_NAME _npc>>|\t\t\t_npc/, to: '\t\t<<if Object.keys(maplebirch.npc.data).includes(_npc) && maplebirch.tool.widget.Macro.has(_npc+"relationshiptext")>>\n\t\t\t<<= maplebirch.autoTranslate(_npc)>><<= "<<"+_npc+"relationshiptext>>">>\n\t\t<<else>>\n\t\t\t<<= maplebirch.autoTranslate(_npc)>>' },
      { src: '<</if>>\n\t<</switch>>\n<</widget>>', to: '<</if>>\n\t\t<</if>>\n\t<</switch>>\n<</widget>>' },
      { src: '<</if>>\n<</widget>>\n\n<<widget "initNNPCClothes">>', applybefore: '\t<<maplebirchNPCinit _nam>>\n\t' },
      { src: '<</widget>>\n\n<<widget "npcrelationship">>', applybefore: '\t<<maplebirchNPCspawn _nam _npcno>>\n\t' },
    ],
    'Widgets Settings': [
      { srcmatch: /<<set\s+_npcList\s*\[\s*(?:clone\s*\(\s*\$NPCNameList\s*\[\s*\$_i\s*\]\s*\)\s*(?:\.replace\s*\(\s*"[^"]+"\s*,\s*"[^"]+"\s*\)\s*)*|setup\.NPC_CN_NAME\s*\(\s*clone\s*\(\s*\$NPCNameList\s*\[\s*\$_i\s*\]\s*\)\s*\))\s*\]\s+to\s+clone\s*\(\s*\$_i\s*\)\s*>>/, to: '<<set _npcList[maplebirch.autoTranslate(clone($NPCNameList[$_i]))] to clone($_i)>>' },
      { srcmatch: /<<run delete _npcList\["(?:象牙怨灵|Ivory Wraith)"\]>>/, to: '<<run delete _npcList[maplebirch.autoTranslate("Ivory Wraith")]>>' },
      { srcmatch: /(?:<<NPC_CN_NAME \$NPCName\[_npcId\]\.nam>>——<span style="text-transform: capitalize;"><<print[\s\S]*?>><\/span>|\$NPCName\[_npcId\]\.nam the <span style="text-transform: capitalize;">\$NPCName\[_npcId\]\.title<\/span>|<<NPC_CN_NAME \$NPCName\[_npcId\]\.nam>>——<span style="text-transform: capitalize;"><<print setup\.NPC_CN_TITLE\(\$NPCName\[_npcId\]\.title\)>><\/span>)/, to: '<<= maplebirch.autoTranslate($NPCName[_npcId].nam) + (maplebirch.Language is "CN" ? "——" : " the ")>><span style="text-transform: capitalize;"><<= maplebirch.autoTranslate($NPCName[_npcId].title)>></span>' },
      { srcmatchgroup: /<<if _npcList\[(?:\$NPCName\[_npcId\]\.nam(?:\.replace\([^)]+\))*|setup\.NPC_CN_NAME\(\$NPCName\[_npcId\]\.nam\))\] is undefined>>/g, to: '<<if _npcList[maplebirch.lang.t($NPCName[_npcId].nam)] is undefined>>' },
      { src: '\t\t\t</span>\n\t\t</div>\n\t\t<div class="settingsToggleItem">\n\t\t\t<span class="gold">', applybefore: '\t\t\t<<if $debug is 1>>| <label><<radiobutton "$NPCName[_npcId].pronoun" "n" autocheck>><<= maplebirch.lang.t("hermaphrodite")+"/"+maplebirch.lang.t("asexual")>></label><</if>>\n' },
    ],
    Widgets: [
      { src: 'T.getStatConfig = function(stat) {', applybefore: 'maplebirch.npc.applyStatDefaults(statDefaults);\n\t\t\t' },
      { srcmatchgroup: /\t_npcData.nam|\t<<NPC_CN_NAME _npcData.nam>>/g, to: '\t<<= maplebirch.autoTranslate(_npcData.nam)>>' },
      { srcmatchgroup: /(?:<<print\s*_npcData\.title(?:\.replace\([^)]+\))+>>|<<print setup\.NPC_CN_TITLE\(_npcData\.title\)>>|The _npcData\.title)/g, to: '<<= (maplebirch.Language is "CN" ? "" : "The ") + maplebirch.autoTranslate(_npcData.title)>>' },
      { srcmatchgroup: /<<for _j to \$_statCount; _j lt 3; _j\+\+>>/g, to: '<<for _j to $_statCount; _j lt (($options.maplebirch?.relationcount ?? 4) - 1); _j++>>' },
    ],
    Traits: [
      { src: '<div id="traitListsSearch">', applybefore: '<<run maplebirch.tool.other.initTraits(_traitLists)>>\n\t' }
    ],
    'Widgets Journal': [
      { srcmatch: /<<print\s*("It is "\s*\+\s*getFormattedDate\(Time\.date\)\s*\+\s*",\s*"\s*\+\s*Time\.year\s*\+\s*"\."|"今天是"\s*\+\s*Time\.year\s*\+\s*"年"\s*\+\s*getFormattedDate\(Time\.date\)\s*\+\s*"。"|ordinalSuffixOf\(Time\.monthDay\)\s*\+\s*"\s*"\s*\+\s*Time\.monthName\.slice\(0,3\)|Time\.month\s*\+\s*"月"\s*\+\s*ordinalSuffixOf\(Time\.monthDay\)\s*\+\s*"日")\s*>>/, to: '<<= maplebirch.state.TimeManager.updateTimeLanguage("JournalTime")>>' },
      { src: '<br>\n<</widget>>', applybefore: '<br><hr>\n\t<<maplebirchJournal>>\n' },
    ],
    'Transformation Widgets': [
      { src: '<</widget>>\n\n<<widget "transform">>', applybefore: '\t<<run maplebirch.char.transformation.vanillaTransformation()>>\n' },
    ],
    'Widgets Mirror': [
      { src: '<</if>>\n\t\t<<if ![', to: '<</if>>\n\t\t<<maplebirchTransformationMirror>>\n\t\t<<if ![' },
      { src: '<<else>><<tficon "angel">>', to: '<<else>><<= maplebirch.char.transformation.icon>>' },
      { src: '</div>\n\t\t</div>\n\t\t<div class="settingsToggleItemWide">', to: '</div>\n\t\t</div>\n\t\t<<maplebirchBodyWriting>>\n\t\t<div class="settingsToggleItemWide">' },
    ],
    'Widgets Ejaculation': [
      { srcmatch: /<<if \$npc\[\$npcrow\.indexOf\(_nn\)\] is "Eden"\s*>>[\s\S]*?<<ejaculation-wraith _args\[0\]>>\s*/, to: '<<if !!maplebirch.combat.ejaculation(_nn, _args[0])>>\n\t\t\t\t<<= maplebirch.combat.ejaculation(_nn, _args[0])>>' },
    ],
    'Widgets NPCs': [
      { src: '<<if $genderknown.includes($npc[_iii])>>', to: '<<if maplebirch.tool.contains($genderknown, $npc)>>' },
      { srcmatch: /<<if \$npc\.length is 1 and \(\["Kylar","Sydney","Gwylan"\]\.includes\(\$npc\[0\]\)\)>>[\s\S]*?<<if \$npc\[0\] is "Sydney" and !\$sydneySeen\.includes\("herm"\)\s*>>[\s\S]*?<<set \$sydneySeen\.pushUnique\("herm"\)>>[\s\S]*?<<elseif \$npc\[0\] is "Kylar">>[\s\S]*?<<elseif \$npc\[0\] is "Gwylan" and !\$gwylanSeen\.includes\("herm"\)>>[\s\S]*?<<\/if>>/, to: '<<if $npc.some(npc => maplebirch.combat.Reaction.HermNameList.includes(npc))>>\n\t\t\t\t<<= maplebirch.combat.Reaction.check("herm")>>'},
      { srcmatch: /<<if \$npc\.length is 1 and \(\["Kylar","Sydney","Gwylan"\]\.includes\(\$npc\[0\]\)\)>>\s*<<if \$npc\[0\] is "Sydney" and !\$sydneySeen\.includes\("crossdress"\)\s*>>\s*<<set \$sydneySeen\.pushUnique\("crossdress"\)>>[\s\S]*?<<elseif \$npc\[0\] is "Kylar">>[\s\S]*?<<elseif \$npc\[0\] is "Gwylan" and !\$gwylanSeen\.includes\("crossdress"\)>>[\s\S]*?<<\/if>>/, to: '<<if $npc.some(npc => maplebirch.combat.Reaction.CDNameList.includes(npc))>>\n\t\t\t\t<<= maplebirch.combat.Reaction.check("crossdress")>>'},
    ]
  };

  maplebirch.once(':framework-init', (/** @type {any} */ data) => {
    Object.assign(data, {
      specialWidget,
      default: defaultData,
      locationPassage,
      widgetPassage
    });
  });
})();