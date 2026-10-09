var i=e=>e;var r=(e,a,n)=>n===void 0?{tone:e,chroma:a}:{tone:e,chroma:a,hueShift:n},x={primary:r(40,50),"on-primary":r(100,0),"primary-container":r(90,18),"on-primary-container":r(10,59),"secondary-container":r(90,13),"on-secondary-container":r(10,13),tertiary:r(40,20,60),"on-tertiary":r(100,0,60),"tertiary-container":r(90,15,60),"on-tertiary-container":r(10,18,60),surface:r(98,5),"surface-container-low":r(96,4),"surface-container":r(94,5),"surface-container-high":r(92,5),"surface-container-highest":r(90,5),"on-surface":r(10,4),"on-surface-variant":r(30,6),outline:r(50,6),"outline-variant":r(80,6),"inverse-surface":r(20,4),"inverse-on-surface":r(95,4),error:{fixed:"#b3261e"},"on-error":{fixed:"#ffffff"},"error-container":{fixed:"#ffdad6"},"on-error-container":{fixed:"#410002"}},b={primary:r(80,35),"on-primary":r(20,54),"primary-container":r(30,52),"on-primary-container":r(90,18),"secondary-container":r(30,13),"on-secondary-container":r(90,13),tertiary:r(80,22,60),"on-tertiary":r(20,19,60),"tertiary-container":r(30,20,60),"on-tertiary-container":r(90,15,60),surface:r(6,4),"surface-container-low":r(10,4),"surface-container":r(12,5),"surface-container-high":r(17,5),"surface-container-highest":r(22,5),"on-surface":r(90,5),"on-surface-variant":r(80,6),outline:r(60,6),"outline-variant":r(30,6),"inverse-surface":r(90,5),"inverse-on-surface":r(20,4),error:{fixed:"#ffb4ab"},"on-error":{fixed:"#690005"},"error-container":{fixed:"#93000a"},"on-error-container":{fixed:"#ffdad6"}},t=[{id:"md3-purple",label:"\u7D2B\u7F57\u5170",color:"#6750a4"},{id:"md3-blue",label:"\u975B\u84DD",color:"#0b57d0"},{id:"md3-teal",label:"\u9752\u78A7",color:"#00696d"},{id:"md3-green",label:"\u7FE0\u7EFF",color:"#2e7d32"},{id:"md3-amber",label:"\u7425\u73C0",color:"#8a5100"},{id:"md3-red",label:"\u6731\u7EA2",color:"#b3261e"},{id:"md3-magenta",label:"\u54C1\u7EA2",color:"#8e4585"},{id:"md3-system",label:"\u7CFB\u7EDF\u5F3A\u8C03\u8272",color:"system"}],d={none:"0",xs:"4px",s:"8px",m:"12px",l:"16px",xl:"28px",full:"999px"},p={light:{1:"0 1px 2px rgba(0,0,0,.30), 0 1px 3px 1px rgba(0,0,0,.15)",2:"0 1px 2px rgba(0,0,0,.30), 0 2px 6px 2px rgba(0,0,0,.15)",3:"0 1px 3px rgba(0,0,0,.30), 0 4px 8px 3px rgba(0,0,0,.15)",4:"0 2px 3px rgba(0,0,0,.30), 0 6px 10px 4px rgba(0,0,0,.15)",5:"0 4px 4px rgba(0,0,0,.30), 0 8px 12px 6px rgba(0,0,0,.15)"},dark:{1:"0 1px 3px rgba(0,0,0,.50), 0 1px 2px rgba(0,0,0,.35)",2:"0 2px 6px rgba(0,0,0,.50), 0 1px 2px rgba(0,0,0,.35)",3:"0 4px 8px rgba(0,0,0,.50), 0 1px 3px rgba(0,0,0,.35)",4:"0 6px 10px rgba(0,0,0,.50), 0 2px 3px rgba(0,0,0,.35)",5:"0 8px 12px rgba(0,0,0,.55), 0 4px 4px rgba(0,0,0,.35)"}},s={hover:.08,focus:.1,pressed:.1,drag:.16},g={light:x,dark:b};function f(e){if("fixed"in e)return e.fixed;let a=e.hueShift===void 0?"h":`calc(h + ${e.hueShift})`;return`lch(from var(--md-source) ${e.tone} ${e.chroma} ${a})`}var v=e=>`--md-${e}`;function c(e){return Object.entries(g[e]).map(([a,n])=>`${v(a)}:${f(n)};`)}var h="var(--cvg-bar-line, #6750a4)";function l(e,a){let n=c(e).map(o=>`${a}${o}`),m=Object.entries(p[e]).map(([o,u])=>`${a}--md-elev-${o}: ${u};`);return[...n,...m].join(`
`)}var y=[...Object.entries(d).map(([e,a])=>`  --md-shape-${e}: ${a};`),...Object.entries(s).map(([e,a])=>`  --md-state-${e}: ${a};`)].join(`
`),S=`
  --bg: var(--md-surface);
  --card: var(--md-surface-container-low);
  --side: var(--md-surface-container);
  --ink: var(--md-on-surface);
  --ink2: var(--md-on-surface-variant);
  /* ink3 \u4ECB\u4E8E\u6B63\u6587\u4E0E\u6B21\u7EA7\u4E4B\u95F4\uFF1AM3 \u6CA1\u6709\u5BF9\u5E94\u89D2\u8272\uFF0C\u7528\u4E24\u7EA7 on-surface \u6309\u6BD4\u4F8B\u8C03\u51FA\u6765 */
  --ink3: color-mix(in srgb, var(--md-on-surface) 78%, var(--md-on-surface-variant));
  --idx: var(--md-outline);
  --line: var(--md-outline-variant);
  --sep: color-mix(in srgb, var(--md-outline-variant) 75%, transparent);
  --hover: var(--md-surface-container-high);
  --row-hover: var(--md-surface-container-high);
  --nav-active: var(--md-secondary-container);
  --nav-active-line: var(--md-outline-variant);
  --ph: var(--md-surface-container-high);
  --ph2: var(--md-surface-container-highest);
  --track: var(--md-surface-container-highest);
  --press: color-mix(in srgb, var(--md-on-surface) 10%, transparent);
  --tint-row: var(--md-primary-container);
  --pill: color-mix(in srgb, var(--md-surface-container-low) 55%, transparent);
  /* \u9762\u677F\u4E00\u5F8B**\u5B9E\u5E95**\uFF1AM3 \u662F\u300C\u540C\u5E95\u6EE1\u5E45 + tonal surface\u300D\uFF0C\u538B\u6839\u6CA1\u6709\u73BB\u7483\u90A3\u4E00\u5C42\u3002
     \u5BBF\u4E3B .sidebar/.content/.player \u5404\u81EA\u8FD8\u5E26 backdrop-filter\uFF0C\u90A3\u51E0\u6761\u5728 COMPONENTS \u91CC\u5173\u6389\u3002
     --glass \u7ED9\u4FA7\u680F\uFF08navigation drawer \u2192 surface-container-low\uFF09\u3001--panel \u7ED9\u5185\u5BB9\u533A\uFF08surface\uFF09\uFF0C
     \u64AD\u653E\u6761\uFF08bottom app bar\uFF09\u5728 COMPONENTS \u91CC\u5355\u72EC\u5B9A surface-container\u3002 */
  --panel: var(--md-surface);
  --panel-line: transparent;
  --glass: var(--md-surface-container-low);
  --glass-line: transparent;
  /* \u5F3A\u8C03\u8272\uFF1A\u7EAF var(--acc) \u7684\u6D88\u8D39\u70B9\uFF08\u8BBE\u7F6E\u9875\u9009\u4E2D\u5361 / \u66F4\u65B0\u6309\u94AE / \u8FDB\u5EA6\u6761\u2026\uFF09\u8DDF\u7740 M3 \u4E3B\u8272\u8D70 */
  --acc: var(--md-primary);
  --cyan: var(--md-tertiary);
`,k=`
  --menu-filter: none;
  --menu-surface: var(--md-surface-container-high);
  --menu-line: var(--md-outline-variant);
  --menu-shadow: var(--md-elev-2);
  --menu-edge: transparent;
`,M=`
  /* ===== \u2460 \u6EE1\u5E45\uFF1A\u53BB\u6389\u6D6E\u52A8\u9762\u677F\u4E0E\u73BB\u7483 ===== */
  & .body { padding: 0; gap: 0; }
  /* .side-resizer \u672C\u6765\u7528 margin:0 -10px \u53BB\u300C\u5403\u6389\u300D.body \u90A3 10px \u95F4\u8DDD\uFF1B\u95F4\u8DDD\u5F52\u96F6\u540E\u5B83\u4F1A\u76D6\u4F4F
     \u4FA7\u680F/\u5185\u5BB9\u5404 10px\uFF0C\u800C\u5B83 z-index:30 \u2014\u2014 \u90A3\u7247\u533A\u57DF\u7684\u70B9\u51FB\uFF08\u542B\u5BFC\u822A\u9879\u53F3\u7F18\uFF09\u4F1A\u88AB\u5B83\u541E\u6389\u3002
     \u6539\u6210\u4E0D\u91CD\u53E0\u7684 10px \u62D6\u62FD\u69FD\u3002 */
  & .side-resizer { margin: 0; }
  /* \u73BB\u7483\u5728 M3 \u91CC\u4E0D\u5B58\u5728\uFF1A\u4E09\u5757\u9762\u677F + \u64AD\u653E\u6761\u90A3\u5C42\u4F2A\u5143\u7D20\u7684\u6A21\u7CCA\u5168\u90E8\u5173\u6389\uFF08none \u800C\u975E blur(0)\uFF09 */
  & .sidebar, & .content, & .player, & .player::before { backdrop-filter: none; }
  & .sidebar, & .content { border-radius: 0; box-shadow: none; }
  & .sidebar { border: 0; border-right: 1px solid var(--md-outline-variant); }
  /* \u64AD\u653E\u6761 = M3 bottom app bar\uFF1A\u6EE1\u5E45\uFF08\u53BB\u6389 0 10px 10px \u5916\u8DDD\u4E0E 14px \u5706\u89D2\uFF09\uFF0C\u9760\u8272\u9636 + \u4E0A\u8FB9\u7EBF\u5206\u5C42 */
  & .player {
    margin: 0; border-radius: 0; box-shadow: none; border: 0;
    border-top: 1px solid var(--md-outline-variant); background: var(--md-surface-container);
  }
  /* \u8FDB\u5EA6\u6761\u88C1\u5207\u5C42\u539F\u4E0E\u64AD\u653E\u6761\u7684 14px \u5706\u89D2\u914D\u6210\u4E00\u5BF9\uFF1B\u64AD\u653E\u6761\u6539\u76F4\u89D2\u540E\u8FD9\u91CC\u4E5F\u5F52\u96F6 */
  & .pb-fill-clip { border-radius: 0; }
  /* \u9876\u5E26\u90A3\u6761 112px \u6E10\u9690\u662F\u7ED9\u6D6E\u52A8\u5361\u505A\u300C\u6807\u9898\u680F\u300D\u8FC7\u6E21\u7684\uFF1B\u6EE1\u5E45\u4E0B\u9876\u680F\u662F\u5B9E\u5E95 app bar\uFF0C\u7528\u4E0D\u4E0A */
  & .content::before { display: none; }
  /* \u62BD\u5C49\u5BBD\u5EA6\uFF1AM3 navigation drawer = 360\u3002\u5BBF\u4E3B\u8BFB\u7684\u662F <body> \u7684 --side-w\uFF0C\u6240\u4EE5\u5199\u5728 body \u4E0A\u3002
     \u7528\u6237\u62D6\u8FC7\u5206\u9694\u6761\u540E body \u4E0A\u662F**\u884C\u5185**\u503C\uFF08shell.ts \u5199\uFF09\uFF0C\u884C\u5185\u4F18\u5148 \u2014\u2014 \u90A3\u65F6\u4EE5\u7528\u6237\u7684\u4E3A\u51C6\u3002 */
  & body { --side-w: 360px; font-size: 14px; line-height: 20px; }

  /* ===== \u2461 M3 \u523B\u5EA6 ===== */
  /* \u9876\u5E26 = top app bar\uFF1A64px\uFF08\u5BBF\u4E3B 42px\uFF09\u3002\u5DE6\u53F3 24px \u4E0E .route \u5BF9\u9F50 */
  & .content-top { min-height: 64px; padding: 0 24px; }
  /* \u641C\u7D22\u6846\uFF1AM3 search \u662F 56px\uFF0C\u4F46\u9876\u680F\u91CC\u8FD8\u5E76\u6392\u7740\u522B\u7684\u4E1C\u897F\uFF0C\u53D6 40px \u4E0E app bar \u7684\u6BD4\u4F8B\u534F\u8C03 */
  & .sb-field { height: 40px; padding: 0 16px; border-color: transparent; background: var(--md-surface-container-high); }
  /* \u62BD\u5C49\u9879 56px \u2014\u2014 \u53EA\u5728\u5C55\u5F00\u6001\u8986\u76D6\uFF08\u7F29\u6001\u81EA\u5DF1\u58F0\u660E\u4E86 padding/gap\uFF0C\u89C1\u4E0A\u9762 \u26A0\uFE0F\uFF09 */
  & body:not(.side-collapsed) .nav a { min-height: 56px; padding: 0 16px; gap: 12px; }
  & body:not(.side-collapsed) .sidebar { padding: 16px 12px; }
  & .nav { gap: 4px; }
  /* M3 \u56FE\u6807\u6309\u94AE 40px \u5168\u5706\uFF08\u5BBF\u4E3B 36px / 9px \u5706\u89D2\uFF09 */
  & .side-btn { width: 40px; height: 40px; border-radius: var(--md-shape-full); }
  & .user { border-radius: var(--md-shape-full); }

  /* \u2014\u2014 \u5BFC\u822A\u9879\uFF1AM3 \u62BD\u5C49\u7684 pill \u9009\u4E2D \u2014\u2014 */
  & .nav a { border-radius: var(--md-shape-full); }
  /* M3 \u7528\u6574\u6761 pill \u8868\u793A\u9009\u4E2D\uFF0C\u4E0D\u9700\u8981\u672C\u4F53\u7684\u5DE6\u4FA7\u7AD6\u6761 */
  & .nav a::before { display: none; }
  & .nav a.active { background: var(--md-secondary-container); color: var(--md-on-secondary-container); }

  /* \u2014\u2014 \u5217\u8868\u884C / \u6B4C\u5355\u884C\uFF1AM3 list item 56px \u8D77 \u2014\u2014 */
  & .row { min-height: 56px; padding: 0 16px; border-radius: var(--md-shape-s); }
  & .pl { min-height: 56px; border-radius: var(--md-shape-full); }
  & .row.sel { box-shadow: inset 3px 0 0 var(--md-primary); }
  & .row.playing { background: var(--md-secondary-container); color: var(--md-on-secondary-container); }

  /* \u2014\u2014 \u961F\u5217\u9762\u677F\u300C\u6B63\u5728\u64AD\u653E\u300D\u90A3\u6761 \u2014\u2014
     \u672C\u4F53\uFF08style.css:1097\uFF09\u628A\u5B83\u5199\u6210 color-mix(--cvg-glow 26%, --tint-row) \u7684\u5E95 +
     var(--cvg-accent) \u7684\u5B57\uFF1A\u5E95\u548C\u5B57**\u540C\u6E90**\u67D3\u51FA\u6765\uFF0C\u7B49\u4E8E\u7D2B\u5B57\u538B\u7D2B\u5E95\uFF0C\u6697\u8272\u65B9\u6848\u4E0B\u51E0\u4E4E\u8BFB\u4E0D\u51FA\u3002
     \u6309 M3 \u7684\u300C\u9009\u4E2D\u5217\u8868\u9879\u300D\u6539\uFF1Acontainer \u5E95 + on-container \u5B57\uFF0C\u4E0E .row.playing \u540C\u4E00\u5BF9\u89D2\u8272 \u2014\u2014
     \u5217\u8868\u9875\u4E0E\u961F\u5217\u91CC\u7684\u300C\u6B63\u5728\u64AD\u653E\u300D\u770B\u8D77\u6765\u624D\u4E00\u81F4\u3002\u5E8F\u53F7 .qi-i \u540C\u7406\uFF08\u672C\u4F53\u4E5F\u628A\u5B83\u67D3\u6210\u4E86 --cvg-accent\uFF09\u3002
     \u26A0\uFE0F \u672C\u6BB5\u5728**\u6A21\u677F\u5B57\u7B26\u4E32\u5185\u90E8**\uFF0C\u6CE8\u91CA\u91CC\u4E0D\u80FD\u51FA\u73B0\u53CD\u5F15\u53F7 \u2014\u2014 \u4F1A\u628A COMPONENTS \u63D0\u524D\u95ED\u5408\u6389\u3002 */
  & .qp-item.cur { color: var(--md-on-secondary-container); }
  /* \u5E95\u8272\u5FC5\u987B\u6392\u9664\u62D6\u62FD\u6001\uFF1A\u672C\u4F53\u7684 .qp-item.dragging\uFF080,2,0\uFF0C\u5199\u5728 .cur \u4E4B\u540E\uFF09\u672C\u6765\u9760\u6E90\u7801\u987A\u5E8F\u8D62\u8FC7
     .qp-item.cur\uFF1B\u4E3B\u9898\u4E00\u52A0\u7279\u5F02\u6027\u5C31\u53CD\u8FC7\u6765\u628A\u62D6\u62FD\u9AD8\u4EAE\u9876\u6389\u4E86 \u2014\u2014 \u62D6\u7740\u6B63\u5728\u64AD\u653E\u90A3\u884C\u65F6\u5B83\u4E0D\u6D6E\u8D77\u3002 */
  & .qp-item.cur:not(.dragging) { background: var(--md-secondary-container); }
  & .qp-item.cur .qi-i { color: var(--md-on-secondary-container); }

  /* \u2014\u2014 \u5361\u7247 \u2014\u2014 */
  & .card, & .opt-card, & .home-panel { border-radius: var(--md-shape-m); }
  & .card .art, & .rthumb, & .pl .thumb, & .pl-art, & .pb-cover, & .qi-thumb, & .thumb, & .qr { border-radius: var(--md-shape-s); }
  & .avatar-big { border-radius: var(--md-shape-m); }

  /* \u2014\u2014 \u6309\u94AE\uFF1AM3 \u5168\u5706\u89D2 \u2014\u2014 */
  & .ghost-btn, & .fav-btn, & .hk-btn, & .row-btn button { border-radius: var(--md-shape-full); }
  /* \u66F4\u65B0\u6309\u94AE\uFF1A\u672C\u4F53\u662F\u300C--acc \u5E95 + \u767D\u5B57\u300D\uFF0C\u767D\u5B57\u538B M3 \u4E3B\u8272\u5728\u6697\u8272\u65B9\u6848\u4E0B\u4F1A\u584C \u2014\u2014 \u6362\u6210 M3 \u7684\u4E00\u5BF9 */
  & .upd-primary { background: var(--md-primary); color: var(--md-on-primary); border-radius: var(--md-shape-full); }

  /* \u2014\u2014 \u80F6\u56CA / \u6807\u7B7E \u2014\u2014 */
  & .chip, & .tag, & .badge, & .sparkle-badge { border-radius: var(--md-shape-s); }
  & .pb-q { border-radius: var(--md-shape-full); }

  /* \u2014\u2014 \u8F93\u5165 / \u641C\u7D22 \u2014\u2014 */
  & .sb-field, & .searchbar { border-radius: var(--md-shape-full); }
  & .tint-field input, & .tint-hex-row input, & .qp-q { border-radius: var(--md-shape-xs); }

  /* \u2014\u2014 \u6D6E\u5C42\uFF1AM3 \u83DC\u5355 4px \u2014\u2014 */
  & .ctx-menu, & .pb-qpop, & .pb-lpop, & .pb-volpop, & .np-menu, & .np-qinfo, & .tint-pop { border-radius: var(--md-shape-xs); }

  /* \u2014\u2014 \u5BF9\u8BDD\u6846 / \u63D0\u793A\u6761 \u2014\u2014 */
  & .upd-dialog, & .sparkle-settings-dialog { border-radius: var(--md-shape-xl); box-shadow: var(--md-elev-3); }
  & .toast {
    background: var(--md-inverse-surface); color: var(--md-inverse-on-surface);
    border-radius: var(--md-shape-xs); box-shadow: var(--md-elev-3);
  }
  /* \u6B63\u5728\u64AD\u653E\u9875\u6052\u4E3A\u6DF1\u8272\u73BB\u7483\uFF1A\u83DC\u5355\u8868\u9762\u53E6\u8D77\u4E00\u4EFD\uFF08\u6697\u8272 surface-container-high \u90A3\u4E00\u6863\uFF1Atone 17 / \u5F69\u5EA6 5\uFF09 */
  & .np {
    --menu-surface: lch(from var(--md-source) 17 5 h);
    --menu-line: rgba(255, 255, 255, .16);
  }
`;function w(){return`
  /* ===== Material Design 3 \xB7 \u4EE4\u724C =====
     \u6E90\u8272 = \u5BBF\u4E3B\u6309\u672C\u4E3B\u9898 Tint \u65B9\u6848\u5199\u4E0B\u7684\u67D3\u8272\uFF08\u89C1\u6587\u4EF6\u9876\u90E8\u7684\u201C\u4E3A\u4EC0\u4E48\u4E0D\u7528 --cvg-accent\u201D\uFF09 */
  --md-source: ${h};

${l("light","  ")}

${y}

${S}

  /* \u83DC\u5355\u63A5\u7BA1\uFF08\u4E0D\u58F0\u660E menus\uFF09\uFF1A\u5347\u4E00\u7EA7\u7279\u5F02\u6027\uFF0C\u6697\u8272\u538B\u8FC7\u5BBF\u4E3B\u7684 html[data-theme="dark"] */
  &[data-theme] {
${k}
  }

  /* ===== \u6697\u8272\u65B9\u6848\uFF1A\u53EA\u6362\u89D2\u8272\u503C\uFF0C\u6620\u5C04\u4E0E\u7EC4\u4EF6\u89C4\u5219\u81EA\u7136\u8DDF\u968F ===== */
  &[data-theme="dark"] {
${l("dark","    ")}
  }

  /* ===== \u7EC4\u4EF6\u5F62\u6001 ===== */
${M}
`}var R=i({id:"md3",name:"Lumen \u6D41\u5149",version:"1.1.0",kind:"third-party",author:"Team Quaver",description:"\u4E00\u6B3E\u590D\u523B Material You \u8BBE\u8BA1\u7684\u4E3B\u9898\u63D2\u4EF6",setup(e){e.registerTheme({id:"md3",name:"Material Design 3",css:w(),tint:{mode:"presets",presets:t}})}});export{R as default};
