var d=e=>e;var r=(e,a,o)=>o===void 0?{tone:e,chroma:a}:{tone:e,chroma:a,hueShift:o},v={primary:r(40,50),"on-primary":r(100,0),"primary-container":r(90,18),"on-primary-container":r(10,59),"secondary-container":r(90,13),"on-secondary-container":r(10,13),tertiary:r(40,20,60),"on-tertiary":r(100,0,60),"tertiary-container":r(90,15,60),"on-tertiary-container":r(10,18,60),surface:r(98,5),"surface-container-low":r(96,4),"surface-container":r(94,5),"surface-container-high":r(92,5),"surface-container-highest":r(90,5),"on-surface":r(10,4),"on-surface-variant":r(30,6),outline:r(50,6),"outline-variant":r(80,6),"inverse-surface":r(20,4),"inverse-on-surface":r(95,4),error:{fixed:"#b3261e"},"on-error":{fixed:"#ffffff"},"error-container":{fixed:"#ffdad6"},"on-error-container":{fixed:"#410002"}},h={primary:r(80,35),"on-primary":r(20,54),"primary-container":r(30,52),"on-primary-container":r(90,18),"secondary-container":r(30,13),"on-secondary-container":r(90,13),tertiary:r(80,22,60),"on-tertiary":r(20,19,60),"tertiary-container":r(30,20,60),"on-tertiary-container":r(90,15,60),surface:r(6,4),"surface-container-low":r(10,4),"surface-container":r(12,5),"surface-container-high":r(17,5),"surface-container-highest":r(22,5),"on-surface":r(90,5),"on-surface-variant":r(80,6),outline:r(60,6),"outline-variant":r(30,6),"inverse-surface":r(90,5),"inverse-on-surface":r(20,4),error:{fixed:"#ffb4ab"},"on-error":{fixed:"#690005"},"error-container":{fixed:"#93000a"},"on-error-container":{fixed:"#ffdad6"}},l=[{id:"md3-purple",label:"\u7D2B\u7F57\u5170",color:"#6750a4"},{id:"md3-blue",label:"\u975B\u84DD",color:"#0b57d0"},{id:"md3-teal",label:"\u9752\u78A7",color:"#00696d"},{id:"md3-green",label:"\u7FE0\u7EFF",color:"#2e7d32"},{id:"md3-amber",label:"\u7425\u73C0",color:"#8a5100"},{id:"md3-red",label:"\u6731\u7EA2",color:"#b3261e"},{id:"md3-magenta",label:"\u54C1\u7EA2",color:"#8e4585"},{id:"md3-system",label:"\u7CFB\u7EDF\u5F3A\u8C03\u8272",color:"system"},{id:"md3-cover",label:"\u5C01\u9762\u989C\u8272",color:"cover"}],m={none:"0",xs:"4px",s:"8px",m:"12px",l:"16px",xl:"28px",full:"999px"},u={light:{1:"0 1px 2px rgba(0,0,0,.30), 0 1px 3px 1px rgba(0,0,0,.15)",2:"0 1px 2px rgba(0,0,0,.30), 0 2px 6px 2px rgba(0,0,0,.15)",3:"0 1px 3px rgba(0,0,0,.30), 0 4px 8px 3px rgba(0,0,0,.15)",4:"0 2px 3px rgba(0,0,0,.30), 0 6px 10px 4px rgba(0,0,0,.15)",5:"0 4px 4px rgba(0,0,0,.30), 0 8px 12px 6px rgba(0,0,0,.15)"},dark:{1:"0 1px 3px rgba(0,0,0,.50), 0 1px 2px rgba(0,0,0,.35)",2:"0 2px 6px rgba(0,0,0,.50), 0 1px 2px rgba(0,0,0,.35)",3:"0 4px 8px rgba(0,0,0,.50), 0 1px 3px rgba(0,0,0,.35)",4:"0 6px 10px rgba(0,0,0,.50), 0 2px 3px rgba(0,0,0,.35)",5:"0 8px 12px rgba(0,0,0,.55), 0 4px 4px rgba(0,0,0,.35)"}},f={hover:.08,focus:.1,pressed:.1,drag:.16},x={light:v,dark:h};function y(e){if("fixed"in e)return e.fixed;let a=e.hueShift===void 0?"h":`calc(h + ${e.hueShift})`;return`lch(from var(--md-source) ${e.tone} ${e.chroma} ${a})`}var k=e=>`--md-${e}`;function b(e){return Object.entries(x[e]).map(([a,o])=>`${k(a)}:${y(o)};`)}var w="var(--cvg-bar-line, #6750a4)";function g(e,a){let o=b(e).map(t=>`${a}${t}`),i=Object.entries(u[e]).map(([t,s])=>`${a}--md-elev-${t}: ${s};`);return[...o,...i].join(`
`)}var S=[...Object.entries(m).map(([e,a])=>`  --md-shape-${e}: ${a};`),...Object.entries(f).map(([e,a])=>`  --md-state-${e}: ${a};`)].join(`
`),M=`
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
`,E=`
  --menu-filter: none;
  --menu-surface: var(--md-surface-container-high);
  --menu-line: var(--md-outline-variant);
  --menu-shadow: var(--md-elev-2);
  --menu-edge: transparent;
`,T=`
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
  /* \u5BBF\u4E3B\u90A3\u5C42 112px \u9876\u5E26\u6E10\u9690\uFF08style.css \u7684 .content::before\uFF09\u4E0D\u80FD\u6574\u6761\u5220 \u2014\u2014 \u5BBF\u4E3B\u628A
     \u300C\u5438\u9876\u6761 / \u5438\u9876\u9875\u5934\u538B\u4F4F\u4E0B\u6EDA\u5185\u5BB9\u300D\u8FD9\u4EF6\u4E8B\u5168\u4EA4\u7ED9\u4E86\u5B83\uFF0C.sticky-bar / .sticky-head
     \u81EA\u5DF1\u90FD\u4E0D\u753B\u5E95\u7247\uFF1B\u5220\u4E86\uFF0C\u957F\u5217\u8868\u4F1A\u76F4\u63A5\u4ECE\u5438\u9876\u533A\u5E95\u4E0B\u900F\u51FA\u6765\u3002
     \u4F46\u5B83\u4E5F\u4E0D\u80FD\u987A\u52BF\u94FA\u5230\u5438\u9876\u533A\u90A3\u4E48\u9AD8\uFF1A\u5185\u5BB9\u533A\u7B2C\u4E00\u5C4F\u91CC\u90A3\u4E9B**\u4E0D\u5438\u9876**\u7684\u5927\u6807\u9898
     \uFF08\u6211\u559C\u6B22 / \u8BBE\u7F6E / \u641C\u7D22\u9875\uFF09z-index \u662F auto\uFF0C\u4F1A\u88AB\u8FD9\u5C42\u5B9E\u5E95\u6574\u6761\u76D6\u6389 \u2014\u2014 \u660E\u6697\u90FD\u4E00\u6837\uFF0C
     \u6807\u9898\u76F4\u63A5\u6D88\u5931\u3002\u6240\u4EE5\u53CD\u8FC7\u6765\u5206\u5DE5\uFF1A
       \xB7 .content::before \u53EA\u7559 app bar \u90A3\u4E00\u683C\u5B9E\u5E95\uFF08\u90A3\u5E95\u4E0B\u672C\u6765\u5C31\u6CA1\u6709\u53EF\u6EDA\u7684\u4E1C\u897F\uFF1A
         .route \u4ECE\u9876\u5E26\u4E4B\u4E0B\u5F00\u59CB\uFF0C\u6EDA\u52A8\u5185\u5BB9\u5728\u81EA\u5DF1\u7684 padding box \u91CC\u5C31\u88AB\u88C1\u6389\uFF09\uFF1B
       \xB7 \u771F\u6B63\u9700\u8981\u6321\u5185\u5BB9\u7684\u5438\u9876\u8282\u70B9\u81EA\u5DF1\u94FA surface\uFF08\u89C1\u4E0B\u9762\u90A3\u4E24\u6761\uFF09\u3002
     \u26A0\uFE0F \u522B\u628A\u9AD8\u5EA6\u6539\u56DE calc(64px + var(--stuck-h)) \u52A0\u5B9E\u5E95\u6E10\u53D8 \u2014\u2014 \u90A3\u5C31\u662F\u76D6\u6389\u6807\u9898\u7684\u90A3\u7248\u3002 */
  & .content::before {
    height: 64px;
    min-height: 64px;
    background: var(--md-surface);
  }
  /* \u5438\u9876\u6761 / \u5438\u9876\u9875\u5934 = M3 app bar\uFF1A\u81EA\u5DF1\u94FA\u5B9E\u5E95 surface\u3002\u672A\u8D34\u9876\u65F6\u5E95\u8272\u4E0E\u5185\u5BB9\u533A\u540C\u8272
     \uFF08--panel \u5C31\u662F surface\uFF09\uFF0C\u7B49\u4E8E\u4E0D\u53EF\u89C1\uFF0C\u7248\u5F0F\u7167\u65E7\uFF1B\u8D34\u9876\u540E\u4ECE\u5E95\u4E0B\u6EDA\u8FC7\u53BB\u7684\u884C\u88AB\u5B83\u6321\u4F4F\u3002
     \u53F3\u7F18\u90A3\u6761 10px \u6EDA\u52A8\u6761\u69FD\u9732\u7684\u662F\u5185\u5BB9\u5361\u5E95\u8272\uFF08\u540C\u4E00\u4E2A surface\uFF09\uFF0C\u6240\u4EE5\u4E0D\u4F1A\u7559\u7F1D\u3002

     \u5149\u6709\u5B9E\u5E95\u4E0D\u591F\uFF1A\u5BBF\u4E3B\u5438\u9876\u8BED\u8A00\u91CC\u300C\u538B\u4E0D\u4F4F\u7684\u90A3\u622A\u300D\u4E00\u76F4\u662F\u4EA4\u7ED9 .content::before \u7684\u6E10\u9690
     \u5316\u5F00\u7684\uFF08Quaver Design \u4E0B\u5438\u9876\u6761\u81EA\u5DF1\u4E0D\u753B\u5E95\uFF0C\u5168\u9760\u90A3\u5C42\u6E10\u53D8\uFF1B\u8FD9\u91CC\u5E95\u7247\u642C\u5230\u4E86\u5438\u9876\u8282\u70B9
     \u8EAB\u4E0A\uFF0C\u4E0B\u7F18\u5C31\u6210\u4E86\u786C\u8FB9\uFF09\u3002\u6B63\u4E0B\u6EDA\u8FC7\u7684\u884C\u4F1A\u88AB\u62E6\u8170\u5207\u4E00\u5200 \u2014\u2014 \u89C2\u611F\u50CF bug\uFF0C\u4E0D\u662F\u50CF app bar\u3002
     \u6240\u4EE5\u7ED9\u8D34\u9876\u6001\u8865\u4E24\u6837\uFF1A\u4E00\u6839 outline-variant \u53D1\u4E1D\u7EBF\u753B\u6E05 app bar \u7684\u4E0B\u754C + \u4E0B\u7F18 20px
     \u540C\u8272\u6E10\u9690\uFF0C\u628A\u5207\u8FB9\u5316\u5F00\u3002\u4E24\u5C42\u5408\u8D77\u6765\u8BFB\u4F5C\u300C\u5185\u5BB9\u4ECE app bar \u5E95\u4E0B\u6ED1\u8FC7\u53BB\u300D\u3002\u7528 .stuck
     \uFF08views.ts \u7684 trackStuck \u5199\uFF09\u95E8\u63A7\uFF1A\u672A\u8D34\u9876\u65F6\u8FD9\u4E24\u6837\u90FD\u4E0D\u94FA\uFF0C\u7B2C\u4E00\u5C4F\u7248\u5F0F\u7EB9\u4E1D\u4E0D\u52A8\u3002 */
  & .sticky-bar, & .sticky-head { background: var(--md-surface); }
  & .sticky-bar::after, & .sticky-head::after {
    content: ""; position: absolute; left: 0; right: 0; top: 100%; height: 20px;
    background: linear-gradient(to bottom,
      var(--md-surface) 0%,
      color-mix(in srgb, var(--md-surface) 55%, transparent) 45%,
      transparent 100%);
    box-shadow: inset 0 1px 0 var(--md-outline-variant);
    pointer-events: none; opacity: 0; transition: opacity .18s ease;
  }
  & .sticky-bar.stuck::after, & .sticky-head.stuck::after { opacity: 1; }
  /* \u62BD\u5C49\u5BBD\u5EA6\uFF1AM3 navigation drawer = 360\u3002\u5BBF\u4E3B\u8BFB\u7684\u662F <body> \u7684 --side-w\uFF0C\u6240\u4EE5\u5199\u5728 body \u4E0A\u3002
     \u7528\u6237\u62D6\u8FC7\u5206\u9694\u6761\u540E body \u4E0A\u662F**\u884C\u5185**\u503C\uFF08shell.ts \u5199\uFF09\uFF0C\u884C\u5185\u4F18\u5148 \u2014\u2014 \u90A3\u65F6\u4EE5\u7528\u6237\u7684\u4E3A\u51C6\u3002 */
  & body { --side-w: 360px; font-size: 14px; line-height: 20px; }

  /* ===== \u2461 M3 \u523B\u5EA6 ===== */
  /* \u9876\u5E26 = top app bar\uFF1A64px\uFF08\u5BBF\u4E3B 42px\uFF09\u3002\u5DE6\u53F3 24px \u4E0E .route \u5BF9\u9F50 */
  & .content-top { min-height: 64px; padding: 0 24px; }
  /* \u641C\u7D22\u6846\uFF1AM3 search \u662F 56px\uFF0C\u4F46\u9876\u680F\u91CC\u8FD8\u5E76\u6392\u7740\u522B\u7684\u4E1C\u897F\uFF0C\u53D6 40px \u4E0E app bar \u7684\u6BD4\u4F8B\u534F\u8C03 */
  & .sb-field { height: 40px; padding: 0 16px; border-color: transparent; background: var(--md-surface-container-high); }
  /* \u83DC\u5355\u9879\u56DE\u5230 40px\uFF0C\u9879\u95F4 Gap \u56DE\u5230 4px\uFF1Amin-height \u662F\u547D\u4E2D\u533A\uFF0Cnav gap \u624D\u662F\u7EB5\u5411\u8282\u594F\u3002
     \u53EA\u5728\u5C55\u5F00\u6001\u8986\u76D6\uFF08\u7F29\u6001\u81EA\u5DF1\u58F0\u660E\u4E86 padding/gap\uFF0C\u89C1\u4E0A\u9762 \u26A0\uFE0F\uFF09 */
  & body:not(.side-collapsed) .nav a { min-height: 40px; padding: 0 14px; gap: 12px; }
  & body:not(.side-collapsed) .sidebar { padding: 14px 10px; gap: 8px; }
  & .nav { gap: 4px; }

  /* \u6B63\u5728\u64AD\u653E\u9875\u6807\u9898/\u6B4C\u624B\u4E0D\u5403\u5168\u5C40 body \u7684 14/20 \u6392\u7248\uFF1A
     \u5BBF\u4E3B\u8FD9\u4E24\u884C\u539F\u672C\u6CA1\u9489 line-height\uFF0C\u6807\u9898 22px \u4F1A\u88AB 20px \u884C\u9AD8\u88C1\u8FB9\u3002 */
  & .np-title { line-height: 1.25; }
  & .np-artist { line-height: 1.35; }

  /* \u641C\u7D22\u9875\u5927\u6807\u9898 + Tag \u680F\u662F\u4E00\u884C\u5F0F\u9875\u5934\uFF1AM3 \u523B\u5EA6\u4E0B\u518D\u7ED9\u4E00\u70B9\u7EB5\u5411\u6C14\u53E3\uFF0C
     \u5426\u5219 26px \u6807\u9898\u6CBF\u7528\u5168\u5C40 20px \u884C\u9AD8\uFF0CTag \u53C8\u8D34\u5728 4px \u4E0B\u8FB9\u8DDD\u4E0A\uFF0C\u89C2\u611F\u5F88\u6324\u3002 */
  & .search-head .page-title { margin: 4px 0 16px; line-height: 1.2; }
  & .search-head .search-tabs { gap: 8px; margin-bottom: 18px; }

  /* Flowscape \u4FE1\u606F\u884C\u540C\u7406\uFF1Afs-title \u7528 clamp \u5230 29px\uFF0C\u4E5F\u5FC5\u987B\u6309\u5B57\u53F7\u9489\u56DE\u884C\u9AD8\u3002 */
  & .fs-title { line-height: 1.25; }
  & .fs-artist, & .fs-album { line-height: 1.35; }
  /* M3 \u56FE\u6807\u6309\u94AE 40px \u5168\u5706\uFF08\u5BBF\u4E3B 36px / 9px \u5706\u89D2\uFF09 */
  & .side-btn { width: 40px; height: 40px; border-radius: var(--md-shape-full); }
  & .user { border-radius: var(--md-shape-full); }

  /* \u2014\u2014 \u5BFC\u822A\u9879\uFF1AM3 \u62BD\u5C49\u7684 pill \u9009\u4E2D \u2014\u2014 */
  & .nav a { border-radius: var(--md-shape-full); }
  /* M3 \u7528\u6574\u6761 pill \u8868\u793A\u9009\u4E2D\uFF0C\u4E0D\u9700\u8981\u672C\u4F53\u7684\u5DE6\u4FA7\u7AD6\u6761 */
  & .nav a::before { display: none; }
  & .nav a.active { background: var(--md-secondary-container); color: var(--md-on-secondary-container); }

  /* \u2014\u2014 \u5217\u8868\u884C / \u6B4C\u5355\u884C\uFF1A\u6B4C\u5355\u6761\u76EE\u4FDD\u6301 40px \u547D\u4E2D\u533A\uFF0C\u6761\u76EE\u95F4\u7ED9 4px \u7EB5\u5411 Gap\uFF1B
     \u4E24\u884C\u6807\u9898/\u526F\u9898\u518D\u7559 2px \u5185\u90E8\u884C\u8DDD\u3002compact \u7248\u4F1A\u8BA9\u6B4C\u5355\u533A\u6324\u6210\u4E00\u56E2\u3002 \u2014\u2014 */
  & .row { min-height: 56px; padding: 0 16px; border-radius: var(--md-shape-s); }
  & .pl { min-height: 56px; border-radius: var(--md-shape-full); }
  & body:not(.side-collapsed) .pl { min-height: 40px; padding: 4px 8px; }
  & body:not(.side-collapsed) .pl .pname { gap: 2px; }
  & .playlists { gap: 4px; }
  & .pl-group { padding: 8px 8px 2px; }
  & .row.sel { box-shadow: inset 3px 0 0 var(--md-primary); }
  & .row.playing { background: var(--md-secondary-container); color: var(--md-on-secondary-container); }
  /* \u4FA7\u680F\u6B4C\u5355\u5F53\u524D\u9879\uFF1A\u4E0E\u5BFC\u822A / \u6B63\u5728\u64AD\u653E\u884C\u540C\u4E00\u5BF9\u300C\u9009\u4E2D\u5BB9\u5668\u300D\u8BED\u4E49 */
  & .pl.active { background: var(--md-secondary-container); }
  & .pl.active .pname { color: var(--md-on-secondary-container); }

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
`,$=`
  &[data-md3-np="on"] .np {
    background: var(--md-surface);
    /* \u5C01\u9762\u6C1B\u56F4\u5C42\u53EA\u670D\u52A1\u539F\u6765\u7684\u6DF1\u8272\u73BB\u7483\uFF1B\u63A5\u7BA1\u540E\u5173\u6389\u5B83\uFF0C\u907F\u514D M3 \u8868\u9762\u5E95\u4E0B\u6F0F\u51FA\u968F\u673A\u5C01\u9762\u8272 */
    & .np-bg { opacity: 0 !important; }
    & .np-scrim { background: transparent; }
    /* \u9ED8\u8BA4\u9875\u7684\u6807\u9898 / \u6B4C\u8BCD\u6CBF\u7528\u767D\u5B57\u53E3\u5F84\uFF1B\u6362\u6210 M3 on-surface \u624D\u80FD\u5728\u6D45\u8272\u65B9\u6848\u4E0B\u8BFB\u6E05 */
    & .np-title, & .np-ly-line, & .np-ly-line.cur { color: var(--md-on-surface); }
    & .np-artist { color: var(--md-on-surface-variant); }
    & .np-ly-empty { color: color-mix(in srgb, var(--md-on-surface) 62%, transparent); }
    /* \u9875\u5185\u83DC\u5355\u4ECE\u300C\u6052\u6DF1\u8272\u73BB\u7483\u300D\u6539\u56DE M3 \u7684 elevation \u8868\u9762\uFF0C\u4E0E\u5168\u7AD9\u83DC\u5355\u4E00\u81F4 */
    --menu-surface: var(--md-surface-container-high);
    --menu-line: var(--md-outline-variant);
    & .np-menu-item, & .np-menu-switch, & .np-menu-size, & .np-menu-size button { color: var(--md-on-surface); }
    & .np-menu-empty, & .np-size-val { color: var(--md-on-surface-variant); }
    & .np-menu-item:hover:not(:disabled),
    & .np-menu-switch:hover,
    & .np-menu-size:hover,
    & .np-menu-size button:hover:not(:disabled) {
      color: var(--md-on-surface);
      background: color-mix(in srgb, var(--md-on-surface) 8%, transparent);
    }
    /* Flowscape \u6B4C\u8BCD\u4E0E\u5F53\u524D surface \u914D\u5BF9\uFF1A\u4E3B\u9898\u8272\u626B\u5B57\uFF0C\u7EAF\u8272\u8868\u9762\u4E0D\u9700\u8981\u666F\u6DF1\u9634\u5F71\u3002
       \u53D8\u91CF\u843D\u5728 .np \u4E0A\uFF0C\u907F\u514D\u63D2\u4EF6\u52A0\u8F7D\u987A\u5E8F\u5F71\u54CD\u8986\u76D6\uFF1B\u884C\u7EA7\u4E0E\u9010\u5B57\u5171\u7528\u540C\u4E00\u524D\u666F\u8272\u3002 */
    --fs-lyric-color: var(--md-on-surface);
    --fs-lyric-unsung: color-mix(in srgb, var(--md-on-surface) 62%, transparent);
    --fs-lyric-highlight: var(--md-primary);
    --fs-lyric-shadow: none;
    --fs-lyric-filter: none;
    --fs-lyric-translation-shadow: none;
    /* Flowscape \u4E3B\u8981\u4FE1\u606F\u5C42 */
    & .fs-title { color: var(--md-on-surface); }
    & .fs-artist { color: color-mix(in srgb, var(--md-on-surface) 82%, transparent); }
    & .fs-album { color: color-mix(in srgb, var(--md-on-surface) 64%, transparent); }
    & .fs-ly-empty { color: color-mix(in srgb, var(--md-on-surface) 58%, transparent); }
    & .fs-iconbtn { color: color-mix(in srgb, var(--md-on-surface) 84%, transparent); }
    & .fs-qbtn { color: color-mix(in srgb, var(--md-on-surface) 88%, transparent); border-color: var(--md-outline-variant); }
    & .fs-pop { background: var(--md-surface-container-high); border-color: var(--md-outline-variant); }
    & .fs-qi, & .fs-mrow { color: color-mix(in srgb, var(--md-on-surface) 88%, transparent); }
    & .fs-qi:hover, & .fs-mrow:hover { color: var(--md-on-surface); background: color-mix(in srgb, var(--md-on-surface) 8%, transparent); }
  }

  /* \u989C\u8272\u6863\u4F4D = \u968F\u4E3B\u9898\u8BBE\u7F6E\uFF1AM3 surface \u672C\u8EAB\u5DF2\u5E26\u660E\u6697\u4E24\u5957\u89D2\u8272 */
  &[data-md3-np="on"][data-md3-np-color="theme"] .np {
    background: var(--md-surface);
  }

  /* \u989C\u8272\u6863\u4F4D = \u6DF1\u7A7A\u9ED1\uFF1A\u548C\u5C01\u9762\u6C1B\u56F4\u5F7B\u5E95\u8131\u94A9\uFF0C\u4FDD\u7559\u63A5\u7BA1\u6001\u539F\u6709\u767D\u5B57\u7684\u53EF\u8BFB\u6027 */
  &[data-md3-np="on"][data-md3-np-color="deep"] .np {
    background: #000;
    & .np-scrim { background: #000; }
    /* \u6DF1\u7A7A\u9ED1\u72EC\u7ACB\u4E8E\u5E94\u7528\u660E\u6697\uFF1A\u56DE\u5230 Flowscape \u7684\u4EAE\u5B57\u4E0E\u67D4\u9634\u5F71\u9ED8\u8BA4\u503C\u3002 */
    --fs-lyric-color: initial;
    --fs-lyric-unsung: initial;
    --fs-lyric-highlight: initial;
    --fs-lyric-shadow: initial;
    --fs-lyric-filter: initial;
    --fs-lyric-translation-shadow: initial;
    /* deep \u6863\u628A on \u5757\u6362\u6389\u7684\u83DC\u5355\u8868\u9762\u518D\u62FF\u56DE\u300C\u6052\u6DF1\u8272\u300D\u90A3\u4E00\u7248 */
    --menu-surface: #10131c;
    --menu-line: rgba(255, 255, 255, .16);
    & .np-title, & .np-ly-line, & .np-ly-line.cur { color: #fff; }
    & .np-artist { color: #ffffffb8; }
    & .np-ly-empty { color: #ffffff80; }
    & .np-menu-item, & .np-menu-switch, & .np-menu-size, & .np-menu-size button { color: #ffffffe6; }
    & .np-menu-empty, & .np-size-val { color: #ffffff8c; }
    & .np-menu-item:hover:not(:disabled),
    & .np-menu-switch:hover,
    & .np-menu-size:hover,
    & .np-menu-size button:hover:not(:disabled) {
      color: #fff;
      background: #ffffff1f;
    }
    & .fs-title { color: #fff; }
    & .fs-artist { color: #ffffffcc; }
    & .fs-album { color: #ffffff8f; }
    & .fs-ly-empty { color: #ffffff7a; }
  }
`;function N(){return`
  /* ===== Material Design 3 \xB7 \u4EE4\u724C =====
     \u6E90\u8272 = \u5BBF\u4E3B\u6309\u672C\u4E3B\u9898 Tint \u65B9\u6848\u5199\u4E0B\u7684\u67D3\u8272\uFF08\u89C1\u6587\u4EF6\u9876\u90E8\u7684\u201C\u4E3A\u4EC0\u4E48\u4E0D\u7528 --cvg-accent\u201D\uFF09 */
  --md-source: ${w};

${g("light","  ")}

${S}

${M}

  /* \u83DC\u5355\u63A5\u7BA1\uFF08\u4E0D\u58F0\u660E menus\uFF09\uFF1A\u5347\u4E00\u7EA7\u7279\u5F02\u6027\uFF0C\u6697\u8272\u538B\u8FC7\u5BBF\u4E3B\u7684 html[data-theme="dark"] */
  &[data-theme] {
${E}
  }

  /* ===== \u6697\u8272\u65B9\u6848\uFF1A\u53EA\u6362\u89D2\u8272\u503C\uFF0C\u6620\u5C04\u4E0E\u7EC4\u4EF6\u89C4\u5219\u81EA\u7136\u8DDF\u968F ===== */
  &[data-theme="dark"] {
${g("dark","    ")}
  }

  /* ===== \u7EC4\u4EF6\u5F62\u6001 ===== */
${T}

  /* ===== \u6B63\u5728\u64AD\u653E / Flowscape \u63A5\u7BA1 ===== */
${$}
`}var P=d({id:"md3",name:"Lumen \u6D41\u5149",version:"1.3.4",minHostVersion:"1.4.1",allowBeta:!0,kind:"third-party",author:"Team Quaver",description:"\u4E00\u6B3E\u590D\u523B Material You \u8BBE\u8BA1\u7684\u4E3B\u9898\u63D2\u4EF6",setup(e){let a=()=>e.storage.get("np")!=="off",o=()=>e.storage.get("npColor")==="deep"?"deep":"theme",i=()=>{typeof document>"u"||(document.documentElement.dataset.md3Np=a()?"on":"off",document.documentElement.dataset.md3NpColor=o())};i(),e.registerTheme({id:"md3",name:"Material Design 3",css:N(),tint:{mode:"presets",presets:l}}),e.registerSettingsSection({id:"md3-theme",title:"\u4E3B\u9898\u8BBE\u7F6E",render(t){t.innerHTML=`
          <div class="set-label">\u662F\u5426\u4ECB\u5165\u6B63\u5728\u64AD\u653E\u9875/Flowscape</div>
          <div class="opt-cards">
            <button class="opt-card" data-np="on" type="button">\u5F00\u542F</button>
            <button class="opt-card" data-np="off" type="button">\u5173\u95ED</button>
          </div>
          <p class="muted set-hint">\u5F00\u542F\u540E Lumen \u4F1A\u7EDF\u4E00\u6B63\u5728\u64AD\u653E\u9875\u4E0E Flowscape \u7684\u8868\u9762\u8272\uFF1B\u5173\u95ED\u65F6\u4FDD\u7559\u5B83\u4EEC\u539F\u6709\u7684\u6DF1\u8272\u5C01\u9762\u6C1B\u56F4\u3002</p>

          <div class="set-label" style="margin-top:14px">\u6B63\u5728\u64AD\u653E\u9875/Flowscape \u989C\u8272</div>
          <div class="opt-cards">
            <button class="opt-card" data-np-color="theme" type="button">\u968F\u4E3B\u9898\u8BBE\u7F6E</button>
            <button class="opt-card" data-np-color="deep" type="button">\u6DF1\u7A7A\u9ED1</button>
          </div>
          <p class="muted set-hint">\u300C\u968F\u4E3B\u9898\u8BBE\u7F6E\u300D\u4F7F\u7528\u5F53\u524D Lumen \u660E\u6697\u65B9\u6848\u7684 M3 \u8868\u9762\uFF1B\u300C\u6DF1\u7A7A\u9ED1\u300D\u4F7F\u7528\u7EAF\u9ED1\u5E95\u8272\u3002</p>`;let s=[...t.querySelectorAll("[data-np]")],p=[...t.querySelectorAll("[data-np-color]")],c=()=>{s.forEach(n=>n.classList.toggle("sel",n.dataset.np==="on"===a())),p.forEach(n=>n.classList.toggle("sel",n.dataset.npColor===o()))};s.forEach(n=>{n.onclick=()=>{e.storage.set("np",n.dataset.np==="on"?"on":"off"),i(),c()}}),p.forEach(n=>{n.onclick=()=>{e.storage.set("npColor",n.dataset.npColor==="deep"?"deep":"theme"),i(),c()}}),c()}})}});export{P as default};
