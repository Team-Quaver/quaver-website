var St=r=>r;var F=r=>String(r??"").replace(/[&<>"']/g,n=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[n]),Tt=r=>Math.max(0,Math.min(1,Number.isFinite(r)?r:0)),he=(r,n,y)=>Math.max(n,Math.min(y,r)),Ue=r=>((!isFinite(r)||r<0)&&(r=0),`${Math.floor(r/60)}:${String(Math.floor(r%60)).padStart(2,"0")}`),Ve=[90,120,150,180,300,500,800],Xt=r=>{for(let n of Ve)if(n>=r)return n;return Ve[Ve.length-1]},Et=(r,n)=>{if(r?.localCover)return r.localCover;let y=r?.album?.pmid??"",z=y?y.split("_")[0]:r?.album?.mid??"";if(!z)return"";let i=Xt(n);return`https://y.gtimg.cn/music/photo_new/T002R${i}x${i}M000${z}.jpg`},Jt=r=>(r?.singer??[]).map(n=>n.name).filter(Boolean).join(" / "),Zt=r=>!!r&&(r.src?r.src!=="online":r.mid.startsWith("local:")),Kt=440,Qt=460,se=["off","translation","romanization"],Gt={off:"\u5173\u95ED",translation:"\u7FFB\u8BD1",romanization:"\u97F3\u8BD1"},S=(r,n="")=>`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${n}>${r}</svg>`,k={play:'<svg viewBox="0 0 24 24" width="34" height="34" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.53.85l10-6.5a1 1 0 0 0 0-1.7l-10-6.5A1 1 0 0 0 8 5.5z"/></svg>',pause:'<svg viewBox="0 0 24 24" width="34" height="34" fill="currentColor" aria-hidden="true"><path d="M7 5h3.2v14H7zM13.8 5H17v14h-3.2z"/></svg>',volHigh:S('<path d="M4 9.5h3.2L12 5.5v13L7.2 14.5H4z" fill="currentColor" stroke="none"/><path d="M15.6 9a4.2 4.2 0 0 1 0 6"/><path d="M18.2 6.6a7.6 7.6 0 0 1 0 10.8"/>'),volMid:S('<path d="M4 9.5h3.2L12 5.5v13L7.2 14.5H4z" fill="currentColor" stroke="none"/><path d="M15.6 9a4.2 4.2 0 0 1 0 6"/>'),volLow:S('<path d="M4 9.5h3.2L12 5.5v13L7.2 14.5H4z" fill="currentColor" stroke="none"/><path d="M15.6 9a4.2 4.2 0 0 1 0 6"/>'),volMute:S('<path d="M4 9.5h3.2L12 5.5v13L7.2 14.5H4z" fill="currentColor" stroke="none"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>'),heart:S('<path d="M12 20s-7-4.6-9-9c-1.3-3 .8-6.5 4-6.5 2 0 3.5 1.2 5 3 1.5-1.8 3-3 5-3 3.2 0 5.3 3.5 4 6.5-2 4.4-9 9-9 9z"/>'),heartFill:'<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 20s-7-4.6-9-9c-1.3-3 .8-6.5 4-6.5 2 0 3.5 1.2 5 3 1.5-1.8 3-3 5-3 3.2 0 5.3 3.5 4 6.5-2 4.4-9 9-9 9z"/></svg>',collapse:S('<path d="M6 9.5l6 6 6-6"/>','width="17" height="17"'),more:'<svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true"><circle cx="12" cy="5" r="1.85"/><circle cx="12" cy="12" r="1.85"/><circle cx="12" cy="19" r="1.85"/></svg>'},es=`
.fs-root{
  position:absolute; inset:0; display:flex; flex-direction:column;
  /* \u9876\u90E8\u53EA\u7559 18px\uFF1A\u5DE6\u4E0A\u89D2\u7684\u6309\u94AE\u7C07\u4E0D\u4E0E\u7A97\u53E3\u6309\u94AE\uFF08.winbtns\uFF0Cfixed top:18 right:12\uFF0C
     z-index 90\uFF09\u4E89\u4F4D \u2014\u2014 \u6240\u4EE5\u672C\u9875\u7684\u64CD\u4F5C\u6309\u94AE\u4E00\u5F8B\u9760\u5DE6\u653E\u3002 */
  padding:18px 30px 18px; gap:12px; color:#fff; min-height:0; overflow:hidden;
  font-family:var(--font-ui,inherit);

  /* \u4E94\u5F20\u5C01\u9762\u7528**\u540C\u4E00\u4E2A\u57FA\u51C6\u5C3A\u5BF8** --fs-cover\uFF0C\u4FA7\u5361\u53EA\u9760 --slot-scale + rotateY
     \u8868\u8FBE\u7EB5\u6DF1\uFF0C\u4E0D\u53E6\u8BBE\u5C3A\u5BF8\u4F53\u7CFB\uFF08\u4E24\u5957\u5C3A\u5BF8 = \u4E2D\u95F4\u5DE8\u5927\u4E24\u4FA7\u8FF7\u4F60\uFF09\u3002
     \u4E24\u6863\u95F4\u8DDD\u90FD\u6309 --fs-cover \u7684\u6BD4\u4F8B\u7B97\uFF1A\u95F4\u8DDD\u4E0E\u5C3A\u5BF8\u540C\u6E90\uFF0C\u7A97\u53E3\u7F29\u653E\u65F6\u6574\u4F53\u7B49\u6BD4\u3002
     \u4FA7\u4E8C\uFF08\xB12\uFF09\u7684\u4E2D\u5FC3\u8DDD\u6BD4\u4FA7\u4E00\u8FD1\uFF08.96 vs .58\uFF09\u2014\u2014 \u6295\u5F71\u5BBD\u5EA6\u968F\u7EB5\u6DF1\u7F29\uFF0C\u7B49\u8DDD\u6446\u4F1A\u8BA9
     \u8D8A\u5F80\u5916\u8D8A\u300C\u6563\u300D\uFF1B\u6536\u4E00\u70B9\u624D\u50CF\u4E00\u53E0\u4E13\u8F91\u3002 */
  --fs-cover:min(28vh, 24vw, 300px);
  --fs-gap:calc(var(--fs-cover) * .58);   /* \u4E2D\u5FC3 \u2194 \u4FA7\u4E00 */
  --fs-gap2:calc(var(--fs-cover) * .96);  /* \u4E2D\u5FC3 \u2194 \u4FA7\u4E8C */
  --fs-radius:13px;

  /* \u63A7\u5236\u5E26\u67D3\u8272\uFF1A**\u76F4\u8FDE**\u5BBF\u4E3B\u7684\u5C01\u9762\u4E3B\u8272\u53D8\u91CF\uFF0C\u4E0D\u505A JS \u6BCF\u9996\u53BB getComputedStyle \u6284\u4E00\u904D \u2014\u2014
     \u5BBF\u4E3B\u5BF9 --cvg-accent \u6CE8\u518C\u4E86 @property \u5E76\u5728 :root \u4E0A\u6302\u4E86 .45s \u8FC7\u6E21\uFF0C\u76F4\u8FDE\u5C31\u767D\u62FF\u4E00\u4EFD
     \u300C\u6362\u66F2\u65F6\u5E73\u6ED1\u626B\u8272\u300D\uFF1BJS \u6284\u4E00\u6B21\u53EA\u80FD\u786C\u8DF3\uFF0C\u8FD8\u4F1A\u505C\u5728\u4E0A\u4E00\u6B21\u8BFB\u5230\u7684\u989C\u8272\u4E0A\u3002
     \u515C\u5E95\u94FE\u4E0E\u5BBF\u4E3B\u6B63\u5728\u64AD\u653E\u9875\u7684\u53E3\u5F84\u4E00\u81F4\uFF08--cvg-accent \u2192 --cyan\uFF09\u3002
     --fs-acc \u662F**\u586B\u5145\u8272**\uFF08\u8FDB\u5EA6\u6761/\u65CB\u94AE/\u97F3\u91CF\u6761\uFF09\uFF0C--fs-acc-ink \u662F**\u524D\u666F\u8272**\u2014\u2014
     \u539F\u8272\u76F4\u63A5\u5F53\u5B57/\u56FE\u6807\u8272\u5728\u6D45\u8272\u5C01\u9762\u4E0A\u4F1A\u7CCA\uFF0C\u7528 color-mix \u628A\u4EAE\u5EA6\u951A\u5230\u767D\u4FA7\u3002 */
  --fs-acc:var(--cvg-accent, var(--cyan, #7fd7ff));
  --fs-acc-ink:color-mix(in srgb, var(--fs-acc) 42%, #fff);
}
.fs-root, .fs-root *{ -webkit-user-select:none; user-select:none; }

/* \u9876\u90E8\u64CD\u4F5C\u6761\uFF1A\u63A5\u7BA1\u6001\u7684\u51FA\u53E3\u300C\u6536\u8D77\u300D\u3002\u5DE6\u5BF9\u9F50\uFF08\u907F\u5F00 CSD \u7684\u7A97\u53E3\u6309\u94AE\uFF09\u3002
   \u300C\u66F4\u591A\u9009\u9879\u300D\u5DF2\u79FB\u5230**\u5E95\u90E8\u63A7\u5236\u5E26\u3001\u97F3\u8D28\u9009\u62E9\u5668\u5DE6\u8FB9** \u2014\u2014 \u6709\u4E9B\u5E73\u53F0\u7684 CSD\uFF08\u5BA2\u6237\u7AEF\u88C5\u9970\uFF0C
   \u5DE6\u4E0A\u89D2\u4EA4\u901A\u706F / \u6807\u9898\u680F\u6309\u94AE\uFF09\u4F1A\u76D6\u4F4F\u8FD9\u91CC\uFF0C\u9876\u90E8\u7684\u8FD9\u9897\u6709\u65F6\u70B9\u4E0D\u5230\u3002 */
.fs-top{
  flex:0 0 auto; display:flex; align-items:center; gap:6px; min-height:28px;
}
.fs-top .fs-iconbtn{ width:28px; height:28px; }

/* \u821E\u53F0\uFF1A\u5C01\u9762 + \u4FE1\u606F + \u6B4C\u8BCD\u3002flex:1 1 auto + min-height:0 \u5141\u8BB8\u5B83\u5728\u7A97\u53E3\u53D8\u77EE\u65F6
   \u6536\u7F29\uFF1B\u6B4C\u8BCD\u4E0E\u5E95\u90E8\u63A7\u5236\u5E26\u662F flex:0 0 auto\uFF0C\u6C38\u8FDC\u4E0D\u4F1A\u88AB\u6324\u51FA\u53EF\u89C6\u533A\u3002 */
.fs-stage{
  flex:1 1 auto; min-height:0; display:flex; flex-direction:column;
  align-items:center; justify-content:center; gap:16px;
}

/* \u2014\u2014 \u5C01\u9762\u6D41 \u2014\u2014
   **\u7EDD\u5BF9\u5B9A\u4F4D\u6309 offset \u6446\u4F4D**\uFF0C\u4E0D\u7528 flex + \u8D1F margin\u3002
   \u8D1F margin \u7684\u5751\uFF1A\u5B83\u53EA\u6536\u300C\u81EA\u5DF1\u8FD9\u4E00\u4FA7\u300D\uFF0C\u591A\u5F20\u5361\u4F1A**\u7D2F\u52A0**\u2014\u2014\u591A\u5F20\u5361\u5404\u81EA\u5E26\u4E00\u6BB5
   \u6536\u7F29\uFF0C\u6574\u6392\u8D8A\u7B97\u8D8A\u6563\u3002\u7EDD\u5BF9\u5B9A\u4F4D\u7684\u69FD\u4F4D\u4E92\u4E0D\u5E72\u6270\uFF0C\u4E14\u5207\u6B4C\u52A8\u753B\u53EA\u9700\u6539 --slot \u53D8\u91CF\u3002
   \u69FD\u4F4D\uFF1A--slot \u662F\u5361\u7247\u4E2D\u5FC3\u76F8\u5BF9\u5BB9\u5668\u4E2D\u5FC3\u7684\u6C34\u5E73\u504F\u79FB\uFF08\u8D1F=\u5DE6\uFF09\u3002
   \u9AD8\u5EA6\u6309 --fs-cover \u7ED9\uFF08\u4FA7\u5361\u88AB\u7F29\u5230 .82\uFF0C\u7EB5\u5411\u4E0D\u4F1A\u8D85\u51FA\u4E3B\u5C01\u9762\uFF09\u3002 */
.fs-covers{
  position:relative; flex:0 0 auto;
  width:100%; height:calc(var(--fs-cover) + 10px);
  /* \u6362\u69FD\u52A8\u753B\u65F6\u957F\uFF08JS \u7684 ANIM_MS / ANIM_DOUBLE_MS \u4E0E\u5B83\u4EEC\u540C\u6E90\uFF09\u3002
     .fs-double = \u70B9 \xB12 \u7684\u300C\u4E00\u683C\u8DE8\u4E24\u69FD\u300D\uFF1A\u5355\u6761\u66F2\u7EBF\u8DD1\u5B8C\u4E24\u683C\u4F4D\u79FB\uFF0C\u65F6\u957F\u2248\u666E\u901A\u6362\u69FD\u7565\u957F\u3002 */
  --fs-roll:.44s; --fs-fade:.3s;
  /* \u523B\u610F**\u4E0D**\u7528 transform-style:preserve-3d\uFF1A\u8FD9\u91CC\u7684\u7ACB\u65B9\u4F53\u611F\u5168\u90E8\u6765\u81EA .fs-art \u81EA\u5DF1
     \u90A3\u4E00\u6BB5 perspective() + rotateY()\uFF08\u81EA\u5E26\u900F\u89C6\uFF0C\u81EA\u6210\u4E00\u4F53\uFF09\uFF0C\u4E0D\u9700\u8981\u5B50\u5143\u7D20\u5171\u4EAB 3D \u7A7A\u95F4\u3002
     \u53CD\u800C\u6302\u4E0A preserve-3d \u4F1A\u628A z-index \u7684\u5C42\u7EA7\u5224\u5B9A\u4EA4\u7ED9 3D \u6392\u5E8F\uFF0C\u5361\u7247\u7684\u5C42\u5E8F\u4F1A\u53D8\u5F97\u4E0D\u53EF
     \u9884\u671F\uFF08\u8C01\u76D6\u8C01\u770B\u8FD0\u6C14\uFF09\u3002 */
}
/* \u8DE8\u4E24\u69FD\uFF08\u70B9 \xB12\uFF09\u7528**\u5BF9\u79F0\u7684 ease-in-out**\uFF08--fs-ease \u8986\u76D6\u5355\u683C\u90A3\u6761 ease-out\uFF09\uFF1A\u4F4D\u79FB\u662F\u5355\u683C
   \u7684 2 \u500D\uFF0C\u6CBF\u7528\u5355\u683C\u90A3\u6761\u201C\u8D77\u6B65\u5C31\u51B2\u201D\u7684 ease-out \u4F1A\u5728\u7B2C\u4E00\u5E27\u731B\u62C9\u4E00\u628A\uFF08~19px/\u5E27\uFF09\u2014\u2014\u7528\u6237\u70B9\u5B8C
   \u7684\u89C2\u611F\u5C31\u662F\u300C\u987F\u300D\u3002\u5BF9\u79F0\u7F13\u5165\u7F13\u51FA\u628A\u8D77\u6B65\u548C\u6536\u5C3E\u90FD\u653E\u8F6F\u3001\u5CF0\u503C\u901F\u5EA6\u538B\u5230\u6700\u4F4E\uFF08~11px/\u5E27\uFF09\uFF0C
   \u52A0\u52A0\u901F\u5EA6\u4E5F\u6700\u5C0F\uFF0C\u8DE8\u4E24\u683C\u6700\u987A\u3002\u65F6\u957F\u53EA\u6BD4\u5355\u683C\u7565\u957F\uFF08.45s vs .44s\uFF09\u3002 */
.fs-covers.fs-double{ --fs-roll:.45s; --fs-fade:.3s; --fs-ease:cubic-bezier(.33,0,.67,1); }
/* \u6362\u69FD\u52A8\u753B\u671F\u95F4\u628A\u8FD9\u4E94\u5F20\u5361\uFF08\u53CA\u5176\u5C01\u9762\u76D2\uFF09\u63D0\u5347\u5230\u5408\u6210\u5C42\uFF1Atransform/opacity \u7531\u5408\u6210\u5668
   \u8DD1\uFF0C\u4E3B\u7EBF\u7A0B\u6B64\u523B\u7684\u5176\u5B83\u6D3B\uFF08\u6362\u56FE\u89E3\u7801\u3001\u5176\u5B83 DOM \u5199\u5165\uFF09\u5C31\u4E0D\u4F1A\u628A\u8FC7\u6E21\u564E\u4F4F\u3002\u52A8\u753B\u4E00\u7ED3\u675F
   class \u4E00\u64A4\u5373\u56DE\u6536\uFF0C\u4E0D\u5E38\u9A7B\uFF08\u4E94\u5F20\u5E26\u56FE\u5361\u7247\u5E38\u9A7B will-change \u592A\u5403\u663E\u5B58\uFF09\u3002 */
.fs-covers.fs-anim-next .fs-card, .fs-covers.fs-anim-prev .fs-card,
.fs-covers.fs-anim-next .fs-card .fs-art, .fs-covers.fs-anim-prev .fs-card .fs-art{ will-change:transform, opacity, filter; }
.fs-card{
  position:absolute; left:50%; top:50%; border:0; padding:0; background:none; color:inherit;
  font:inherit; cursor:pointer;
  /* \u4F4D\u79FB + \u7F29\u653E\u5728 .fs-card \u4E0A\uFF08\u69FD\u4F4D\uFF09\uFF0C\u89D2\u5EA6\u5728 .fs-art \u4E0A\uFF08Cover Flow \u7684\u5916\u7FFB\uFF09\u2014\u2014
    \u4E24\u8005\u5206\u5F00\uFF0C\u52A8\u753B\u65F6\u5404\u6539\u5404\u7684\u4E92\u4E0D\u8986\u76D6\uFF0C\u4F46 transition \u7528\u540C\u4E00\u6761\u66F2\u7EBF\uFF0C\u65F6\u5E8F\u5BF9\u9F50\u3002 */
  transform:translate(-50%,-50%) translateX(var(--slot,0px)) scale(var(--slot-scale,1));
  transition:transform var(--fs-roll,.44s) var(--fs-ease,cubic-bezier(.22,.61,.36,1)), opacity var(--fs-fade,.3s) ease;
  isolation:isolate; /* \u5361\u5185\u8986\u76D6\u5C42\uFF08veil/spin\uFF09\u81EA\u6210\u4E00\u6808\uFF0C\u4E0D\u4E0E\u90BB\u5361\u4E92\u76F8\u6E17\u900F */
}
.fs-card:focus-visible{ outline:2px solid #fff9; outline-offset:6px; border-radius:var(--fs-radius); }
.fs-card:disabled{ cursor:default; }

/* \u5C01\u9762\u76D2\uFF1A**\u4E09\u5F20\u540C\u4E00\u4E2A\u5BBD\u5EA6**\uFF08--fs-cover\uFF09\uFF0C\u5927\u5C0F\u5DEE\u5F02\u5168\u90E8\u6765\u81EA --slot-scale\u3002 */
.fs-card .fs-art{
  position:relative; display:block; overflow:hidden;
  width:var(--fs-cover); aspect-ratio:1; border-radius:var(--fs-radius);
  background:#ffffff1a;
  box-shadow:0 18px 46px #000000a6, 0 2px 0 #ffffff1f inset;
  transition:transform var(--fs-roll,.44s) var(--fs-ease,cubic-bezier(.22,.61,.36,1)), opacity var(--fs-fade,.34s) ease, filter var(--fs-fade,.34s) ease, box-shadow .3s ease;
  /* \u5916\u7FFB\u7684\u8F74\uFF1A\u5DE6\u5361\u7ED5\u53F3\u8FB9\u7F18\u3001\u53F3\u5361\u7ED5\u5DE6\u8FB9\u7F18\uFF08--fs-dir \u5B9A\u65B9\u5411\uFF0C\u89C1\u4E0B\uFF09 */
  transform-origin:calc((1 - var(--fs-dir,0)) * 50%) center;
}
/* \u5360\u4F4D\u7B26\u4E0E\u56FE\u7247**\u5FC5\u987B\u7EDD\u5BF9\u5B9A\u4F4D**\uFF1A\u4E24\u8005\u90FD\u662F width/height:100% \u7684\u5757\u7EA7\u76D2\uFF0C
   \u82E5\u6309\u666E\u901A\u6D41\u6392\uFF0C\u5360\u4F4D\u7B26\u4F1A\u5148\u5360\u6EE1\u6574\u4E2A\u5C01\u9762\u76D2\u3001\u628A <img> \u6324\u5230\u76D2\u5916\u88AB overflow \u88C1\u6389
   \u2014\u2014 \u7ED3\u679C\u5C01\u9762\u6C38\u8FDC\u4E0D\u663E\u793A\uFF0C\u53EA\u5269 .fs-art \u90A3\u5C42 #ffffff1a \u534A\u900F\u660E\u5E95\uFF08\u300C\u5C01\u9762\u662F\u900F\u660E\u7684\u300D
   \u5C31\u662F\u8FD9\u4E2A\uFF09\u3002\u56FE\u7247\u76D6\u5728\u5360\u4F4D\u7B26\u4E4B\u4E0A\uFF0C\u8C01\u663E\u8C01\u9690\u7531 JS \u7684 display \u5207\u6362\u63A7\u5236\u3002 */
.fs-card .fs-art img, .fs-card .fs-ph{ position:absolute; inset:0; }
.fs-card .fs-art img{ width:100%; height:100%; object-fit:cover; display:block; }
.fs-card .fs-ph{ display:flex; align-items:center; justify-content:center; color:#ffffff40; }

/* \u69FD\u4F4D\uFF1A--slot \u4E2D\u5FC3\u504F\u79FB\u3001--slot-scale \u7EB5\u6DF1\u7F29\u653E\u3001--fs-dir \u51B3\u5B9A\u5916\u7FFB\u65B9\u5411
   \uFF08-1 \u5DE6 / 0 \u4E2D / +1 \u53F3\uFF0C\u4E00\u4E2A\u53D8\u91CF\u540C\u65F6\u9A71\u52A8 rotateY \u7684\u7B26\u53F7\u4E0E\u8F74\u5FC3\uFF0C
   \u7701\u6389\u300C\u5DE6\u8FB9\u4E00\u5957\u3001\u53F3\u8FB9\u4E00\u5957\u300D\u7684\u955C\u50CF\u89C4\u5219 \u2014\u2014 \u955C\u50CF\u89C4\u5219\u6F0F\u6539\u4E00\u8FB9\u5C31\u662F\u9519\u4F4D\uFF09\u3002
   \u4E94\u4E2A\u69FD\u4F4D\uFF08\xB12 \u4E0A\u4E0A/\u4E0B\u4E0B\u66F2\uFF09\uFF0C\u5C42\u5E8F = \u8D8A\u9760\u4E2D\u95F4\u8D8A\u9AD8\uFF08\u8FD1\u7684\u76D6\u8FDC\u7684\uFF09\u3002 */
.fs-card[data-off="0"]{ --slot:0px; --slot-scale:1; --fs-dir:0; z-index:5; }
.fs-card[data-off="-1"]{ --slot:calc(-1 * var(--fs-gap)); --slot-scale:.82; --fs-dir:-1; z-index:4; }
.fs-card[data-off="1"]{ --slot:var(--fs-gap); --slot-scale:.82; --fs-dir:1; z-index:4; }
.fs-card[data-off="-2"]{ --slot:calc(-1 * var(--fs-gap2)); --slot-scale:.62; --fs-dir:-1; z-index:3; }
.fs-card[data-off="2"]{ --slot:var(--fs-gap2); --slot-scale:.62; --fs-dir:1; z-index:3; }

/* \u4FA7\u5C01\u9762\uFF1ACover Flow \u7684\u62DB\u724C = \u5F3A\u900F\u89C6 + \u7ED5 Y \u8F74\u5916\u7FFB\u3002
   \u89D2\u5EA6\u591F\u5927\u662F\u5173\u952E \u2014\u2014 20\xB0 \u5728\u6B63\u89C6\u4E0B\u51E0\u4E4E\u770B\u4E0D\u51FA\u65CB\u8F6C\uFF0C\u6574\u6392\u5C31\u300C\u5E73\u94FA\u300D\u4E86\u3002
   perspective \u5199\u5728 transform \u9996\u4F4D\uFF08\u4F5C\u7528\u4E8E\u6B64\u5143\u7D20\u81EA\u8EAB\uFF09\uFF1B\u65CB\u8F6C\u91CF\u7531 --fs-dir \u5B9A\u7B26\u53F7\u3002
   \u4FA7\u4E8C\u6BD4\u4FA7\u4E00\u66F4\u8F6C\u3001\u66F4\u6697\u3001\u66F4\u9000\u540E \u2014\u2014 \u7EB5\u6DF1\u9760\u8FD9\u4E09\u4E2A\u91CF\u4E00\u8D77\u62C9\u5F00\u3002 */
.fs-card[data-off="-1"] .fs-art,
.fs-card[data-off="1"] .fs-art{
  transform:perspective(1500px) rotateY(calc(var(--fs-dir) * -46deg)) translateZ(-50px);
  opacity:.74; filter:saturate(.85) brightness(.92);
}
.fs-card[data-off="-2"] .fs-art,
.fs-card[data-off="2"] .fs-art{
  transform:perspective(1500px) rotateY(calc(var(--fs-dir) * -56deg)) translateZ(-90px);
  opacity:.58; filter:saturate(.8) brightness(.85);
}
/* \u5F53\u524D\u66F2\uFF1A**\u4E0D\u900F\u660E\u3001\u4E0D\u65CB\u8F6C\u3001\u4E0D\u538B\u6697**\u3002\u4E3B\u5361\u4E0D\u5F97\u5E26 .left/.right \u8BED\u4E49\u7C7B\uFF0C
   \u5426\u5219\u4F1A\u5403\u5230\u4FA7\u5361\u7684 transform/opacity\uFF08\u4E0A\u4E00\u7248\u4E2D\u95F4\u5C01\u9762\u53D1\u7070\u53D1\u900F\u7684\u539F\u56E0\uFF09\u3002 */
.fs-card[data-off="0"] .fs-art{ transform:none; opacity:1; filter:none; }
/* \u60AC\u505C\uFF1A\u8F6C\u5230\u63A5\u8FD1\u6B63\u9762\u5E76\u62AC\u4EAE \u2014\u2014 \u660E\u786E\u544A\u8BC9\u7528\u6237\u300C\u8FD9\u5F20\u53EF\u70B9\u300D\u3002
   \u53EA\u5728**\u975E\u52A8\u753B\u671F\u95F4**\u751F\u6548\uFF0C\u514D\u5F97\u8DDF data-to \u7684\u76EE\u6807\u6001\u62A2 transform\u3002 */
.fs-covers:not(.fs-anim-next):not(.fs-anim-prev) .fs-card[data-off="-1"]:hover .fs-art{
  transform:perspective(1500px) rotateY(26deg) translateZ(-10px); opacity:1; filter:none;
}
.fs-covers:not(.fs-anim-next):not(.fs-anim-prev) .fs-card[data-off="1"]:hover .fs-art{
  transform:perspective(1500px) rotateY(-26deg) translateZ(-10px); opacity:1; filter:none;
}
/* \u4FA7\u4E8C\u60AC\u505C\uFF1A\u8F6C\u5230\u63A5\u8FD1\u4FA7\u4E00\u7684\u89D2\u5EA6\u5E76\u62AC\u4EAE\uFF08\u79BB\u6B63\u9762\u8FD8\u8FDC\uFF0C\u70B9\u5230\u5373\u6B62\uFF09 */
.fs-covers:not(.fs-anim-next):not(.fs-anim-prev) .fs-card[data-off="-2"]:hover .fs-art{
  transform:perspective(1500px) rotateY(38deg) translateZ(-40px); opacity:.92; filter:none;
}
.fs-covers:not(.fs-anim-next):not(.fs-anim-prev) .fs-card[data-off="2"]:hover .fs-art{
  transform:perspective(1500px) rotateY(-38deg) translateZ(-40px); opacity:.92; filter:none;
}
/* \u4E09\u5F20\u5361\u65F6\u4EE3\u8FD9\u91CC\u6709\u4E00\u5C42\u300C\u5806\u53E0\u8F6E\u5ED3\u300D\u4F2A\u5143\u7D20\uFF08\u534A\u900F\u660E\u767D + \u9634\u5F71\u5F80\u5916\u504F\uFF09\u6697\u793A\u540E\u9762\u8FD8\u6709\u4E00\u53E0\uFF1B
   \u4E94\u5F20\u5168\u662F\u771F\u5361\u4E4B\u540E\u5B83\u6CA1\u4E86\u610F\u4E49\uFF0C\u53CD\u800C\u53D8\u6210\u60AC\u5728 \xB11 \u4E0E \xB12 \u4E4B\u95F4\u7684\u4E00\u5757\u534A\u900F\u660E\u8499\u7248 \u2014\u2014 \u5DF2\u5220\u3002
   \u987A\u5E26\u4E00\u63D0\uFF1A\u5220\u6389\u5B83\u4E4B\u540E .fs-card \u4E5F\u4E0D\u518D\u9700\u8981 isolation \u5EFA\u6808\u3002 */
/* \u90BB\u66F2\u4E0D\u5B58\u5728\uFF08\u961F\u5217\u5230\u5934\uFF09\uFF1A\u6574\u5F20\u5361\u9690\u6389\uFF0C\u4E0D\u7559\u7A7A\u58F3\u5360\u69FD\u4F4D */
.fs-card.empty{ opacity:0; pointer-events:none; }

.fs-card .fs-cap{
  position:absolute; left:0; right:0; bottom:0; padding:16px 8px 7px; text-align:center;
  font-size:11.5px; line-height:1.35; color:#ffffffe0;
  background:linear-gradient(180deg,transparent,#000000b8);
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
  opacity:0; transition:opacity .22s ease;
}
.fs-card .fs-badge{
  position:absolute; top:6px; left:6px; width:20px; height:20px; border-radius:50%;
  display:flex; align-items:center; justify-content:center;
  background:#00000073; color:#fff; opacity:0; transition:opacity .22s ease;
}
.fs-card .fs-badge svg{ width:11px; height:11px; }
/* \u6B4C\u540D\u6761 / \u8F6C\u5411\u89D2\u6807\u53EA\u5C5E\u4E8E\u4FA7\u69FD\uFF08\xB11/\xB12\uFF09\uFF1A\u4E2D\u95F4\u69FD\u4F4D\uFF08\u4EE5\u53CA\u52A8\u753B\u4E2D\u8F6C\u5230\u4E2D\u95F4\u7684\u90A3\u5F20\uFF09\u4E0D\u663E\u793A\u3002
   \u2014\u2014 \u4E94\u5F20\u5361\u7684 DOM \u957F\u5F97\u4E00\u6837\uFF0C\u9760\u8FD9\u91CC\u7684\u69FD\u4F4D\u65AD\u8A00\u5206\u5DE5\u3002 */
.fs-card[data-off="0"] .fs-cap, .fs-card[data-off="0"] .fs-badge,
.fs-card[data-to="0"] .fs-cap, .fs-card[data-to="0"] .fs-badge{ display:none; }
/* \u89D2\u6807\u56FE\u6807\u7EDF\u4E00\u662F\u300C\u6307\u5411\u53F3\u300D\uFF0C\u53F3\u69FD\uFF08+1/+2\uFF09\u955C\u50CF\u6210\u6307\u5411\u5DE6 \u2014\u2014 \u90FD\u6307\u5411\u4E2D\u95F4\u3002
   \u8282\u70B9\u4F1A\u8F6C\u683C\uFF0C\u56FE\u6807\u4E0D\u80FD\u6309\u521B\u5EFA\u65F6\u7684\u69FD\u4F4D\u5199\u6B7B\uFF0C\u6240\u4EE5\u6309 data-off/data-to \u73B0\u5224\u3002 */
.fs-card[data-off="1"] .fs-badge svg, .fs-card[data-off="2"] .fs-badge svg,
.fs-card[data-to="1"] .fs-badge svg, .fs-card[data-to="2"] .fs-badge svg,
.fs-card[data-to="3"] .fs-badge svg, .fs-card[data-to="4"] .fs-badge svg{ transform:scaleX(-1); }
.fs-card[data-off="-1"]:hover .fs-cap, .fs-card[data-off="1"]:hover .fs-cap,
.fs-card[data-off="-2"]:hover .fs-cap, .fs-card[data-off="2"]:hover .fs-cap{ opacity:1; }
.fs-card[data-off="-1"]:hover .fs-badge, .fs-card[data-off="1"]:hover .fs-badge,
.fs-card[data-off="-2"]:hover .fs-badge, .fs-card[data-off="2"]:hover .fs-badge{ opacity:.95; }
/* \u4E2D\u95F4\uFF1A\u6700\u5927\u3001\u6700\u4EAE\u3001\u53EF\u70B9\u64AD\u653E/\u6682\u505C\uFF08\u5C3A\u5BF8\u4E0E\u4FA7\u5361\u540C\u6E90\uFF0C\u53EA\u5DEE --slot-scale \u4E0E\u89D2\u7684\u5DEE\uFF09 */
.fs-card[data-off="0"] .fs-art{
  box-shadow:0 30px 80px #000a, 0 0 0 1px #ffffff1f, 0 1px 0 #ffffff2e inset;
}
.fs-card[data-off="0"] .fs-veil{
  position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
  background:#0000004d; opacity:0; transition:opacity .2s ease;
}
.fs-card[data-off="0"]:hover .fs-veil{ opacity:1; }
.fs-card .fs-spin{
  position:absolute; inset:0; display:none; align-items:center; justify-content:center;
  background:#00000066; color:#fff;
}
.fs-card.loading .fs-spin{ display:flex; }
.fs-spin svg{ animation:fs-spin .9s linear infinite; }
@keyframes fs-spin{ to{ transform:rotate(360deg); } }
.fs-card .fs-err{
  position:absolute; left:0; right:0; bottom:0; padding:7px 10px; display:none;
  background:#c0263acc; color:#fff; font-size:11.5px; text-align:center;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.fs-card.has-err .fs-err{ display:block; }

/* \u2014\u2014 \u66F2\u76EE\u4FE1\u606F \u2014\u2014 */
.fs-meta{ flex:0 0 auto; max-width:min(720px,90%); text-align:center; display:flex; flex-direction:column; gap:3px; }
.fs-line{ position:relative; overflow:hidden; max-width:100%; }
.fs-line > span{ display:inline-block; white-space:nowrap; will-change:transform; }
.fs-line.over{ mask-image:linear-gradient(90deg,transparent,#000 12px,#000 calc(100% - 12px),transparent); }
.fs-line.over > span{ animation:fs-marq var(--fs-md,8s) ease-in-out infinite alternate; }
.fs-line.over:hover > span{ animation-play-state:paused; }
@keyframes fs-marq{ from{ transform:translateX(0); } to{ transform:translateX(var(--fs-mx,0)); } }
.fs-title{ font-size:clamp(19px,2.3vw,29px); font-weight:800; letter-spacing:.2px; }
.fs-artist{ font-size:clamp(12.5px,1.25vw,15px); color:#ffffffcc; }
.fs-album{ font-size:12.5px; color:#ffffff8f; }
/* \u6536\u85CF\u6309\u94AE**\u4E0D\u80FD**\u653E\u5728 .fs-line \u91CC\u9762\uFF1A.fs-line \u662F overflow:hidden \u7684\u8DD1\u9A6C\u706F\u7A97\u53E3
   \uFF08\u6B63\u662F\u9760\u5B83\u88C1\u6389\u6EA2\u51FA\u6587\u5B57\uFF09\uFF0C\u8D34\u5728\u5B83\u53F3\u7F18\u5916\u4FA7\u7684\u6309\u94AE\u4F1A\u88AB\u6574\u5757\u88C1\u6389 \u2014\u2014 \u4E8E\u662F\u7EA2\u5FC3
   \u6C38\u8FDC\u4E0D\u663E\u793A\u3001\u4E5F\u70B9\u4E0D\u5230\u3002\u653E\u5230\u4E00\u4E2A\u300C\u521A\u597D\u88F9\u4F4F\u6B4C\u540D\u300D\u7684\u5B9A\u4F4D\u5BB9\u5668\u91CC\uFF0C\u6309\u94AE\u843D\u5728\u6807\u9898
   \u6587\u5B57\u53F3\u4FA7\uFF08\u4E0D\u5728\u88C1\u526A\u76D2\u5185\uFF09\u3002 */
.fs-titlewrap{ position:relative; width:fit-content; max-width:100%; align-self:center; }
.fs-love{
  position:absolute; top:50%; left:calc(100% + 7px); transform:translateY(-50%);
  width:24px; height:24px; border:0; border-radius:50%; cursor:pointer; padding:0;
  background:transparent; color:#ffffff59; transition:color .16s ease, transform .16s ease;
}
.fs-love:hover{ color:#fff; transform:translateY(-50%) scale(1.12); }
.fs-love.on{ color:#ff5c72; }
/* \u672C\u5730/NAS \u66F2\u76EE\u6574\u9897\u6536\u6389\uFF08hidden \u5C5E\u6027\uFF09\uFF1A\u663E\u5F0F\u5199\u6B7B display:none \u2014\u2014 UA \u90A3\u6761 [hidden] \u89C4\u5219
   \u4F1A\u88AB\u4EFB\u4F55 author \u5C42\u7684 button display \u9876\u7A7F\uFF08\u5BBF\u4E3B\u6216\u54EA\u5929\u54EA\u4E2A\u4E3B\u9898\u8865\u4E00\u5200\u5C31\u300C\u85CF\u4E0D\u4F4F\u300D\u4E86\uFF09\u3002 */
.fs-love[hidden]{ display:none; }
.fs-love svg{ width:15px; height:15px; }

/* \u2014\u2014 \u6B4C\u8BCD\uFF1A\u5355\u884C / \u4E94\u884C \u4E24\u79CD\u7248\u5F0F\uFF08\u8BBE\u7F6E\u91CC\u300C\u6B4C\u8BCD\u884C\u6570\u300D\u5207\u6362\uFF0C\u9ED8\u8BA4\u5355\u884C\uFF09\u2014\u2014
   mode-one\uFF1A\u53EA\u663E\u793A\u5F53\u524D\u8FD9\u4E00\u53E5\uFF08+ \u7FFB\u8BD1\uFF09\u3002\u9AD8\u5EA6\u9884\u7559\u4E00\u4E2A\u533A\u95F4\uFF0C\u907F\u514D\u7FFB\u8BD1\u51FA\u73B0/\u957F\u53E5
     \u6298\u884C\u628A\u4E0A\u9762\u7684\u5C01\u9762\u9876\u7740\u4E0A\u4E0B\u8DF3\u3002\u8FC7\u957F\u7684\u4E00\u53E5**\u81EA\u52A8\u7F29\u5B57\u53F7**\uFF08JS \u5199 --fs-fit\uFF09\u585E\u8FDB
     \u9884\u7559\u533A\uFF0C\u800C\u4E0D\u662F\u88AB overflow:hidden \u4ECE\u4E0A\u4E0B\u4E24\u5934\u88C1\u6389 \u2014\u2014 \u4E4B\u524D\u5C45\u4E2D\u7684\u5185\u5BB9\u4E00\u6EA2\u51FA\uFF0C
     \u5F00\u5934\u4E0E\u7ED3\u5C3E\u540C\u65F6\u770B\u4E0D\u89C1\uFF0C\u5C31\u662F\u300C\u5355\u884C\u6B4C\u8BCD\u88AB\u88C1\u65AD\u300D\u3002
   mode-five\uFF1A\u6574\u6BB5\u6B4C\u8BCD\u6392\u6210\u53EF\u6EDA\u5217\uFF0C\u7A97\u53E3\u56FA\u5B9A\u4E94\u884C\u9AD8\uFF0C\u5F53\u524D\u53E5\u5C45\u4E2D\u9AD8\u4EAE\uFF1B\u6EDA\u8F6E / \u89E6\u63A7\u677F
     \u7FFB\u9605\uFF0C\u505C\u624B 3s \u81EA\u52A8\u56DE\u5230\u8DDF\u968F\uFF08\u89C1 JS \u7684 browsing / BROWSE_MS\uFF09\u3002 */
.fs-lyrics{
  position:relative; flex:0 1 auto; width:min(720px,92%);
  margin-top:6px; padding:0 8px; text-align:center;
  font-size:calc(clamp(17px,2.1vw,26px) * var(--fs-ly-scale,1));
  font-family:var(--font-lyric,inherit);
  overflow:hidden;
}
/* \u5355\u884C\u7248\u5F0F\u9760\u7ED9\u8FD9\u4E00\u5C42\u5199 translateY \u505A\u5782\u76F4\u5C45\u4E2D\uFF1A\u53EA\u5728\u5355\u884C\u4E0B\u63D0\u5347\u56FE\u5C42\uFF0C\u4E94\u884C\u7528\u539F\u751F\u6EDA\u52A8\u4E0D\u5E38\u9A7B will-change\u3002 */
.fs-lyrics.mode-one .fs-ly-roll{ will-change:transform; }
.fs-lyrics.mode-one{ min-height:4.3em; max-height:8.6em; }
.fs-lyrics.mode-five{
  height:9em; overflow-y:auto; overscroll-behavior:contain;
  scrollbar-width:none; scroll-behavior:smooth;
}
.fs-lyrics.mode-five::-webkit-scrollbar{ width:0; height:0; }
.fs-ll{
  padding:.1em 4px; cursor:pointer; color:var(--fs-lyric-color,#fff); max-width:100%;
  font-size:calc(1em * var(--fs-fit,1)); font-weight:700; line-height:1.4;
  text-shadow:var(--fs-lyric-shadow,0 2px 22px #00000073);
  transition:opacity .26s ease, transform .26s ease;
}
.fs-lyrics.mode-five .fs-ll{ opacity:.4; padding:.2em 4px; }
.fs-lyrics.mode-five .fs-ll.cur{ opacity:1; font-weight:800; }
.fs-ll .t2{
  display:block; font-size:.56em; font-weight:400; opacity:.82; margin-top:.28em;
  text-shadow:var(--fs-lyric-translation-shadow,0 1px 12px #00000059);
}
.fs-lyrics.no-trans .fs-ll .t2{ display:none; }
/* \u2014\u2014 \u9010\u5B57\uFF08\u590D\u7528 AMLL \u63D0\u4F9B\u5668\u7684\u8BCD\u7EA7\u65F6\u95F4\u8F74\uFF09\u2014\u2014
   \u5355\u4EFD\u6587\u5B57\u7528 background-clip:text \u626B\u8272\uFF0C--p \u63A7\u5236\u6E10\u53D8\u7684\u5206\u754C\u70B9\u3002\u4E0D\u8981\u53E6\u6392\u4E00\u4EFD\u540C\u5B57
   \u4F2A\u5143\u7D20\uFF1Ainline \u6362\u884C\u540E\u7684\u7247\u6BB5\u4E0E\u7EDD\u5BF9\u5B9A\u4F4D\u6587\u672C\u7684\u5B57\u5F62/\u57FA\u7EBF\u53EF\u80FD\u4E0D\u4E00\u81F4\uFF0C\u53E0\u8D77\u6765\u4F1A\u91CD\u5F71\u3002
   \u4FDD\u7559 inline + pre-wrap\uFF0C\u8BA9\u957F\u8BCD\u3001\u7A7A\u683C\u4E0E\u4E2D\u82F1\u6DF7\u6392\u7EE7\u7EED\u6309\u539F\u6587\u672C\u6298\u884C\u3002
   \u5C01\u9762\u80CC\u666F\u4E0A\uFF0C\u6574\u53E5\u7528\u4E00\u5C42\u67D4\u9634\u5F71\u886C\u5B57\uFF1B\u7EAF\u8272\u8868\u9762\u7684\u4E3B\u9898\u901A\u8FC7 --fs-lyric-* \u540C\u65F6\u63D0\u4F9B
   \u524D\u666F\u8272\u3001\u626B\u8272\u548C\u9634\u5F71\u7B56\u7565\u3002\u6D45\u8272\u8868\u9762\u7528\u6DF1\u8272\u5B57\uFF0C\u4E0D\u9760\u767D\u5B57\u7684\u9ED1\u6295\u5F71\u6491\u5BF9\u6BD4\u5EA6\u3002
   \u900F\u660E\u5B57\u5F62\u4E0D\u4F7F\u7528 text-shadow\uFF08\u4F1A\u76D6\u5728\u6E10\u53D8\u4E0A\uFF09\uFF0C\u9010\u5B57\u4E3B\u884C\u4EC5\u5728\u6574\u53E5\u5916\u6295\u5F71\u3002 */
.fs-ll.kara{ font-weight:800; }
.fs-ll.kara .t1{
  display:block; text-shadow:none;
  filter:var(--fs-lyric-filter,drop-shadow(0 2px 8px #0007));
}
.fs-ll.kara .t2{ text-shadow:var(--fs-lyric-translation-shadow,0 1px 6px #0006); }
.fs-ll .kw{
  white-space:pre-wrap;
  background:linear-gradient(to right,
    var(--fs-lyric-highlight,color-mix(in srgb, var(--fs-acc) 45%, #fff)) calc(var(--p,0) * 100%),
    var(--fs-lyric-unsung,#ffffffa6) calc(var(--p,0) * 100%));
  background-clip:text; -webkit-background-clip:text;
  color:transparent; -webkit-text-fill-color:transparent;
}
.fs-ly-empty{ text-align:center; color:#ffffff7a; font-size:13px; padding:8px 0; }

/* \u2014\u2014 \u5207\u6B4C\u52A8\u753B\uFF08Cover Flow \u7684\u7075\u9B42\uFF09\u2014\u2014
   \u4E94\u5F20\u5361\uFF08-2/-1/0/+1/+2\uFF09\u6574\u6392\u5E73\u79FB\u4E00\u683C\uFF0C\u76EE\u6807\u69FD\u4F4D = \u5F53\u524D offset **\u51CF** 1\uFF1A
     \u4E0B\u4E00\u9996\uFF1A+2 \u2192 +1\u3001+1 \u2192 0\uFF08\u4E0B\u4E00\u9996\u6EDA\u8FDB\u6765\u5F53\u65B0\u4E2D\u95F4\uFF09\u30010 \u2192 -1\uFF08\u73B0\u5728\u7684\u5C01\u9762\u6EDA\u8D70\uFF09\u3001
             -1 \u2192 -2\u3001-2 \u2192 -3\uFF08\u6ED1\u5230\u6700\u5916\u4FA7\u5E76\u6DE1\u51FA\uFF0C\u6536\u5C3E\u65F6\u7ED5\u5230\u5BF9\u4FA7 +2\uFF09
     \u4E0A\u4E00\u9996\u955C\u50CF\uFF08\u65B9\u5411 -1\uFF09\u3002

   \u69FD\u4F4D\u7528 --slot / --slot-scale / --fs-dir \u8868\u8FBE\uFF0CJS \u53EA\u9700\u5728\u52A8\u753B\u671F\u95F4\u628A\u6BCF\u5F20\u5361\u7684
   **\u76EE\u6807\u69FD\u4F4D**\u5199\u8FDB data-to\uFF0C\u7531\u5C5E\u6027\u9009\u62E9\u5668\u6362\u4E0A\u4E00\u6574\u5957\uFF08\u4F4D\u79FB+\u7F29\u653E+\u89D2\u5EA6+\u900F\u660E\u5EA6\uFF09\u3002
   \u597D\u5904\uFF1A\u4E0D\u7528\u5728 JS \u91CC\u91CF\u5750\u6807\uFF08\u95F4\u8DDD\u968F\u5C3A\u5BF8\u53D8\uFF0C\u7B97\u4E0D\u51C6\uFF09\uFF0C\u4E14\u4F4D\u79FB\u4E0E\u89D2\u5EA6\u5171\u7528\u540C\u4E00\u6761
   transition \u66F2\u7EBF\uFF0C\u4E0D\u4F1A\u300C\u4F4D\u79FB\u8D70\u4E86\u3001\u89D2\u5EA6\u8FD8\u6CA1\u5230\u300D\u3002

   \u8FD9\u4E00\u7EC4\u89C4\u5219\u5BF9 \xB1\u65B9\u5411\u662F**\u540C\u4E00\u5957**\uFF08\u76EE\u6807\u69FD\u4F4D\u672C\u8EAB\u5C31\u5E26\u7B26\u53F7\uFF09\uFF0C\u4E0D\u518D\u5199 anim-next /
   anim-prev \u4E24\u4EFD\u955C\u50CF \u2014\u2014 \u4E24\u4EFD\u955C\u50CF\u5FC5\u7136\u6F0F\u6539\u4E00\u8FB9\u3002 */
.fs-card[data-to="0"]{ --slot:0px; --slot-scale:1; --fs-dir:0; z-index:5; }
.fs-card[data-to="-1"]{ --slot:calc(-1 * var(--fs-gap)); --slot-scale:.82; --fs-dir:-1; z-index:4; }
.fs-card[data-to="1"]{ --slot:var(--fs-gap); --slot-scale:.82; --fs-dir:1; z-index:4; }
.fs-card[data-to="-2"]{ --slot:calc(-1 * var(--fs-gap2)); --slot-scale:.62; --fs-dir:-1; z-index:3; }
.fs-card[data-to="2"]{ --slot:var(--fs-gap2); --slot-scale:.62; --fs-dir:1; z-index:3; }
.fs-card[data-to="-3"]{ --slot:calc(-1.6 * var(--fs-gap2)); --slot-scale:.5; --fs-dir:-1; z-index:2; opacity:0; pointer-events:none; }
.fs-card[data-to="3"]{ --slot:calc(1.6 * var(--fs-gap2)); --slot-scale:.5; --fs-dir:1; z-index:2; opacity:0; pointer-events:none; }
/* \u8DE8\u4E24\u69FD\uFF08\u70B9 \xB12\uFF09\u65F6**\u4E24\u5F20**\u5361\u540C\u65F6\u51FA\u753B\uFF1A-3/-4\uFF08\u6216 +3/+4\uFF09\u90FD\u505C\u5728\u6846\u5916\u6DE1\u51FA\u3002
   \xB14 \u7684\u6A2A\u5411\u4F4D\u7F6E\u6309\u300C\u4E0E\u76F8\u90BB\u69FD\u7B49\u8DDD\u300D\u7ED9\uFF082 * gap2\uFF09\uFF0C\u4E24\u5F20\u51FA\u753B\u5361\u5728\u6574\u6BB5\u4F4D\u79FB\u91CC\u4FDD\u6301\u4E00\u683C\u95F4\u8DDD\uFF0C
   \u4E0D\u4F1A\u5728\u4E2D\u9014\u53E0\u5230\u4E00\u8D77\u3002 */
.fs-card[data-to="-4"]{ --slot:calc(-2 * var(--fs-gap2)); --slot-scale:.5; --fs-dir:-1; z-index:2; opacity:0; pointer-events:none; }
.fs-card[data-to="4"]{ --slot:calc(2 * var(--fs-gap2)); --slot-scale:.5; --fs-dir:1; z-index:2; opacity:0; pointer-events:none; }
/* \u76EE\u6807\u59FF\u6001\u4E0E\u9759\u6001\u69FD\u4F4D\u540C\u8868\u3002**\u5FC5\u987B\u653E\u5728\u6240\u6709 data-off \u89C4\u5219\u4E4B\u540E**\uFF1A\u52A8\u753B\u4E2D\u4E00\u5F20\u5361\u540C\u65F6\u5E26
   data-off\uFF08\u73B0\u5728\u7684\u69FD\u4F4D\uFF09\u4E0E data-to\uFF08\u8981\u53BB\u69FD\u4F4D\uFF09\uFF0C\u4E24\u8FB9 specificity \u76F8\u540C\uFF0C\u540E\u58F0\u660E\u8005\u80DC \u2014\u2014
   \u8FD9\u91CC\u5728\u540E\uFF0C\u76EE\u6807\u6001\u624D\u80FD\u8D62\u8FC7\u9759\u6001\u6001\u3002 */
.fs-card[data-to="-1"] .fs-art, .fs-card[data-to="1"] .fs-art{
  transform:perspective(1500px) rotateY(calc(var(--fs-dir) * -46deg)) translateZ(-50px);
  opacity:.74; filter:saturate(.85) brightness(.92);
}
.fs-card[data-to="-2"] .fs-art, .fs-card[data-to="2"] .fs-art,
.fs-card[data-to="-3"] .fs-art, .fs-card[data-to="3"] .fs-art,
.fs-card[data-to="-4"] .fs-art, .fs-card[data-to="4"] .fs-art{
  transform:perspective(1500px) rotateY(calc(var(--fs-dir) * -56deg)) translateZ(-90px);
  opacity:.58; filter:saturate(.8) brightness(.85);
}
.fs-card[data-to="0"] .fs-art{ transform:none; opacity:1; filter:none; }
/* \u5806\u53E0\u8F6E\u5ED3\u53EA\u5C5E\u4E8E\u4FA7\u4E00\u69FD\uFF1A\u8F6C\u5230\u4E2D\u95F4\u7684\u4E0D\u80FD\u62D6\u7740\u81EA\u5DF1\u7684\u8F6E\u5ED3\u8D70\uFF0C\u8F6C\u5230\u4FA7\u4E8C/\u51FA\u753B\u7684\u8BA9\u5B83\u6DE1\u6389 */
/* \u5806\u53E0\u8F6E\u5ED3\u5DF2\u5220\uFF08\u4E94\u5F20\u771F\u5361\u4E4B\u540E\u5B83\u5C31\u662F \xB11 \u4E0E \xB12 \u4E4B\u95F4\u90A3\u5757\u900F\u660E\u8499\u7248\uFF09 */
/* \u300C\u77AC\u79FB\u300D\u7528\uFF1A\u51FA\u753B\u7684\u90A3\u5F20\u8981\u7ED5\u5230\u5BF9\u4FA7\u53BB\u5F53\u65B0\u90BB\u66F2\u3002\u4F4D\u79FB\u5FC5\u987B\u77AC\u95F4\u5B8C\u6210\uFF08\u5426\u5219\u4F1A\u6A2A\u7A7F\u6574\u6392\uFF09\uFF0C
   \u4F46\u900F\u660E\u5EA6\u7167\u5E38\u8FC7\u6E21 \u2014\u2014 \u5B83\u662F\u5728\u4E0D\u53EF\u89C1\u72B6\u6001\u4E0B\u6362\u597D\u56FE\u518D\u6DE1\u5165\u7684\u3002 */
.fs-card.fs-hop{ transition:opacity .3s ease; }
.fs-card.fs-hop .fs-art{ transition:opacity .34s ease, filter .34s ease; }

@keyframes fs-meta-in{ from{ opacity:0; transform:translate3d(0,10px,0); } to{ opacity:1; transform:none; } }
.fs-title.fs-anim-next,.fs-title.fs-anim-prev,
.fs-artist.fs-anim-next,.fs-artist.fs-anim-prev,
.fs-album.fs-anim-next,.fs-album.fs-anim-prev{ animation:fs-meta-in .32s cubic-bezier(.22,.61,.36,1) both; }
.fs-artist.fs-anim-next,.fs-artist.fs-anim-prev{ animation-delay:.06s; }
.fs-album.fs-anim-next,.fs-album.fs-anim-prev{ animation-delay:.12s; }

/* \u2014\u2014 \u5E95\u90E8\u63A7\u5236\u5E26 \u2014\u2014 */
/* flex:0 0 auto \u2014\u2014 \u6C38\u8FDC\u53EF\u89C1\uFF0C\u7A97\u53E3\u53D8\u77EE\u65F6\u88AB\u538B\u7684\u662F\u4E0A\u65B9\u821E\u53F0\u3002
   \u7ED9\u4E00\u70B9 min-height \u515C\u5E95\uFF1A\u6781\u7AEF\u5C0F\u7A97\u4E0B flex \u6536\u7F29\u53EF\u80FD\u628A\u5B83\u538B\u6210\u4E00\u6761\u7F1D\u3002 */
.fs-bar{ flex:0 0 auto; min-height:60px; width:min(860px,94%); margin:0 auto; display:flex; flex-direction:column; justify-content:flex-end; gap:9px; }
.fs-prow{ display:flex; align-items:center; gap:11px; }
.fs-time{ flex:0 0 auto; font-size:11.5px; color:#ffffffa1; font-variant-numeric:tabular-nums; min-width:38px; }
.fs-time.dur{ text-align:right; }
.fs-track{
  position:relative; flex:1 1 auto; height:16px; cursor:pointer; touch-action:none;
  display:flex; align-items:center;
}
.fs-track::before{
  content:""; position:absolute; left:0; right:0; height:4px; border-radius:999px;
  background:#ffffff26; transition:height .14s ease;
}
.fs-track:hover::before,.fs-track.scrub::before{ height:6px; }
.fs-fill{
  position:absolute; left:0; height:4px; border-radius:999px; width:calc((100% - 0px) * var(--fs-pf,0));
  background:var(--fs-acc); transition:height .14s ease; pointer-events:none;
}
.fs-track:hover .fs-fill,.fs-track.scrub .fs-fill{ height:6px; }
.fs-knob{
  position:absolute; left:calc(100% * var(--fs-pf,0)); width:11px; height:11px; border-radius:50%;
  background:var(--fs-acc); transform:translateX(-50%) scale(0); transition:transform .14s ease;
  box-shadow:0 1px 5px #0007; pointer-events:none;
}
.fs-track:hover .fs-knob,.fs-track.scrub .fs-knob{ transform:translateX(-50%) scale(1); }

.fs-ctl{ display:flex; align-items:center; justify-content:space-between; gap:16px; }
.fs-ctl-group{ display:flex; align-items:center; gap:10px; min-width:0; }
.fs-iconbtn{
  flex:0 0 auto; width:30px; height:30px; border:0; border-radius:50%; padding:0; cursor:pointer;
  display:flex; align-items:center; justify-content:center;
  background:transparent; color:#ffffffc7; transition:background .14s ease, color .14s ease;
}
.fs-iconbtn:hover{ background:#ffffff1f; color:#fff; }
.fs-iconbtn.on{ color:var(--fs-acc-ink); }
.fs-vol{ position:relative; width:96px; height:16px; display:flex; align-items:center; touch-action:none; cursor:pointer; }
.fs-vol::before{ content:""; position:absolute; left:0; right:0; height:4px; border-radius:999px; background:#ffffff26; }
/* \u97F3\u91CF\u6761\u7528\u300C\u5C01\u9762\u4E3B\u8272 + \u767D\u300D\u8C03\u4EAE\u4E00\u6863\uFF1A\u4E0E\u8FDB\u5EA6\u6761\u540C\u6E90\u4F46\u4E0D\u540C\u660E\u5EA6\uFF0C\u4E00\u773C\u80FD\u5206\u5F00\u4E24\u4E2A\u63A7\u5236\u3002
   \u4E0D\u989D\u5916\u6302 background \u8FC7\u6E21 \u2014\u2014 \u5BBF\u4E3B\u5BF9 --cvg-accent \u6CE8\u518C\u4E86 @property \u4E14\u6709 .45s \u8FC7\u6E21\uFF0C
   \u8FC7\u6E21\u94FE\u4E0A\u518D\u53E0\u4E00\u5C42\u53EA\u4F1A\u53D8\u6210\u300C\u8FFD\u7740\u8DD1\u300D\u7684\u8FDF\u6EDE\u3002 */
.fs-volfill{ position:absolute; left:0; height:4px; border-radius:999px; background:color-mix(in srgb, var(--fs-acc) 58%, #fff); width:calc(100% * var(--fs-v,0.8)); }
.fs-volnum{ font-size:11px; color:#ffffff8c; font-variant-numeric:tabular-nums; min-width:34px; text-align:right; }
.fs-qwrap{ position:relative; }
.fs-qbtn{
  height:26px; min-width:56px; padding:0 11px; border-radius:999px; cursor:pointer; font:inherit;
  font-size:11.5px; font-weight:600; letter-spacing:.2px; white-space:nowrap;
  border:1px solid #ffffff2e; background:#ffffff14; color:#fffc;
  transition:background .14s ease, border-color .14s ease;
}
.fs-qbtn:hover,.fs-qbtn.open{ background:#ffffff24; border-color:#ffffff4d; }
/* \u5F39\u51FA\u5C42\uFF08\u97F3\u8D28 / \u66F4\u591A\u9009\u9879\u5171\u7528\u4E00\u5957\u73BB\u7483\u8BED\u8A00\uFF1B\u4E00\u5F8B\u4ECE\u5E95\u90E8\u63A7\u5236\u5E26**\u671D\u4E0A**\u5F00\uFF1A
   right:0 + bottom:calc(100% + 8px)\uFF0C\u6240\u4EE5\u52A8\u753B\u539F\u70B9\u53D6\u53F3\u4E0B\u89D2\uFF09\u3002
   \u5F00\u5408\u8D70\u300C\u900F\u660E\u5EA6 + \u8F7B\u5FAE\u4E0A\u79FB + \u5FAE\u7F29\u300D\u8FC7\u6E21\uFF0C\u800C\u4E0D\u662F display:none/flex \u786C\u5207 \u2014\u2014 \u540E\u8005\u6CA1\u6709\u52A8\u753B\uFF0C
   \u4E00\u5F00\u4E00\u5173\u5C31\u662F\u556A\u5730\u95EA\u73B0\u3002\u6536\u8D77\u6001\u7528 visibility \u800C\u4E0D\u662F display\uFF1Avisibility \u53EF\u8FC7\u6E21\uFF08\u6536\u8D77\u65F6\u5B83
   \u4F1A\u7B49\u5230\u672B\u5E27\u624D\u7FFB\u6210 hidden\uFF09\uFF0C\u4E14 hidden \u6001\u4E0D\u8FDB a11y \u6811\u3001\u4E0D\u63A5\u6307\u9488\uFF08display:none \u5219\u65E0\u6CD5\u8FC7\u6E21\uFF09\u3002 */
.fs-pop{
  position:absolute; min-width:186px; padding:6px;
  border-radius:12px; background:#10131cd9; border:1px solid #ffffff1f; box-shadow:0 14px 40px #0007;
  backdrop-filter:blur(24px) saturate(1.5); -webkit-backdrop-filter:blur(24px) saturate(1.5);
  display:flex; flex-direction:column; gap:1px; z-index:6;
  transform-origin:bottom right;
  opacity:0; visibility:hidden; pointer-events:none; transform:translateY(6px) scale(.97);
  transition:opacity .16s ease, transform .18s cubic-bezier(.22,.61,.36,1), visibility .18s;
}
.fs-pop.open{ opacity:1; visibility:visible; pointer-events:auto; transform:none; }
.fs-qpop{ right:0; bottom:calc(100% + 8px); }
.fs-mwrap{ position:relative; }
.fs-mmenu{ right:0; bottom:calc(100% + 8px); min-width:224px; }
.fs-qi{
  display:flex; align-items:center; justify-content:space-between; gap:12px;
  padding:7px 9px; border:0; border-radius:8px; cursor:pointer; font:inherit; font-size:12.5px;
  background:transparent; color:#ffffffe0; text-align:left; width:100%;
}
.fs-qi:hover{ background:#ffffff17; color:#fff; }
.fs-qi.sel{ background:color-mix(in srgb, var(--fs-acc) 30%, transparent); color:#fff; font-weight:700; }
.fs-qi em{ font-style:normal; font-size:11px; color:#ffffff8f; }
.fs-qempty{ padding:9px 10px; font-size:12px; color:#ffffff8f; }
/* \u672C\u5730/NAS \u66F2\u76EE\u7684\u97F3\u8D28\u6D6E\u7A97\uFF1A\u4E00\u53E5\u8BF4\u660E\u3001\u96F6\u4E2A\u6309\u94AE\uFF08\u4E0E\u5BBF\u4E3B\u64AD\u653E\u6761\u7684 .qp-note \u540C\u53E3\u5F84\uFF09\u3002 */
.fs-qnote{ padding:9px 10px; font-size:12px; line-height:1.55; color:#ffffffa6; max-width:236px; }
/* \u8DF3\u8F6C\u4E09\u9879\uFF08\u540C\u540D\u641C\u7D22 / \u8DF3\u8F6C\u6B4C\u624B / \u8DF3\u8F6C\u4E13\u8F91\uFF09\u6BCF\u6B21\u5F00\u83DC\u5355\u6309\u5F53\u524D\u66F2\u73B0\u7B97\uFF0C\u6240\u4EE5\u662F\u52A8\u6001\u586B\u7684\uFF1B
   \u591A\u6B4C\u624B\u65F6\u9010\u9879\u5217\u51FA\uFF0C\u7F3A mid \u7684\u9879\u7981\u7528 \u2014\u2014 \u53E3\u5F84\u540C\u5BBF\u4E3B\u6B63\u5728\u64AD\u653E\u9875\u7684 \u22EE \u83DC\u5355\u3002 */
.fs-mjump{ display:flex; flex-direction:column; gap:1px; }
.fs-mjump:empty{ display:none; }
.fs-msep{ height:1px; margin:5px 6px; background:#ffffff1a; }
/* \u66F4\u591A\u9009\u9879\u91CC\u7684\u300C\u7FFB\u8BD1\u9009\u9879\u300D\u300C\u6B4C\u8BCD\u5927\u5C0F\u884C\u300D */
.fs-mrow{ display:flex; align-items:center; justify-content:space-between; gap:12px; padding:7px 9px; border-radius:8px; font-size:12.5px; color:#ffffffe0; cursor:pointer; }
.fs-mrow:hover{ background:#ffffff17; color:#fff; }
/* \u7FFB\u8BD1\u9009\u9879\u4E09\u6863\uFF1A\u53E3\u5F84\u540C\u5BBF\u4E3B\u6B63\u5728\u64AD\u653E\u9875\uFF1B\u9009\u4E2D\u6001\u7528\u5C01\u9762\u8272\u63BA\u6DF1\u906E\u7F69\uFF0C\u4FDD\u4F4F\u4EFB\u610F\u5C01\u9762\u4E0B\u7684\u767D\u5B57\u5BF9\u6BD4\u3002 */
.fs-maux{ display:grid; gap:4px; padding:7px 9px; border-radius:8px; font-size:12.5px; color:#ffffffe0; }
.fs-maux:hover{ background:#ffffff17; color:#fff; }
#fs-maux{ display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:3px; }
.fs-mopt{
  border:0; border-radius:7px; padding:5px 6px; background:transparent; color:#fffb;
  font:inherit; font-size:11.5px; text-align:center; cursor:pointer; white-space:nowrap;
  transition:background .12s ease, color .12s ease;
}
.fs-mopt:hover{ background:#ffffff1f; color:#fff; }
.fs-mopt.sel{ background:color-mix(in srgb, var(--fs-acc) 55%, #0b0e19); color:#fff; font-weight:600; }
.fs-mopt:focus-visible{ outline:2px solid #ffffff80; outline-offset:1px; }
.fs-msize{ display:flex; align-items:center; gap:2px; flex:0 0 auto; }
.fs-msize button{
  width:22px; height:22px; border:0; border-radius:6px; padding:0; cursor:pointer;
  background:#ffffff1a; color:#fff; font:inherit; font-size:13px; line-height:1; display:grid; place-items:center;
}
.fs-msize button:hover:not(:disabled){ background:#ffffff2b; }
.fs-msize button:disabled{ opacity:.32; cursor:default; }
.fs-mval{ min-width:42px; text-align:center; font-size:11.5px; color:#fffb; font-variant-numeric:tabular-nums; }

@media (prefers-reduced-motion: reduce){
  /* \u4F4D\u79FB\u4E0E\u89D2\u5EA6\u90FD\u5173\u6389\uFF1A\u5C01\u9762\u77AC\u79FB\u5230\u65B0\u69FD\u4F4D\uFF08\u5185\u5BB9\u4ECD\u4F1A\u66F4\u65B0\uFF0C\u53EA\u662F\u4E0D\u518D\u300C\u7FFB\u300D\uFF09 */
  .fs-card, .fs-card .fs-art{ transition:none; }
  .fs-line.over > span{ animation:none; }
  .fs-ll{ transition:none; }
  .fs-title.fs-anim-next,.fs-title.fs-anim-prev,
  .fs-artist.fs-anim-next,.fs-artist.fs-anim-prev,
  .fs-album.fs-anim-next,.fs-album.fs-anim-prev{ animation:none; }
  .fs-pop{ transition:none; }
}
`;function ts(){if(document.querySelector("style[data-sparkle-css='flowscape']"))return;let r=document.createElement("style");r.dataset.sparkleCss="flowscape",r.textContent=es,document.head.append(r)}var ne=null,be=.8,xe=1.5;function ss(r,n){r.classList.add("fs-root");let y=[-2,-1,0,1,2],z=e=>{let t=e===0,s=t?" main":` side ${e<0?"left":"right"}`,a=t?"\u64AD\u653E/\u6682\u505C":e===-1?"\u4E0A\u4E00\u9996":e===1?"\u4E0B\u4E00\u9996":e<0?"\u4E0A\u4E0A\u9996":"\u4E0B\u4E0B\u9996";return`<button class="fs-card${s}" data-off="${e}"
        type="button" aria-label="${a}">
        <span class="fs-art"><span class="fs-ph"></span><img alt="" decoding="async"/>
          <span class="fs-badge">${S('<path d="M10 6l6 6-6 6"/>','width="11" height="11"')}</span>
          <span class="fs-cap"></span>
          ${t?`<span class="fs-spin">${S('<path d="M12 3a9 9 0 1 1-6.4 2.6" stroke-width="2.4"/>','width="30" height="30"')}</span>
          <span class="fs-veil"></span><span class="fs-err"></span>`:""}</span>
      </button>`};r.innerHTML=`
    <div class="fs-top">
      <button class="fs-iconbtn" id="fs-collapse" type="button" title="\u6536\u8D77\u6B63\u5728\u64AD\u653E\u9875" aria-label="\u6536\u8D77\u6B63\u5728\u64AD\u653E\u9875">${k.collapse}</button>
    </div>
    <div class="fs-stage">
      <div class="fs-covers" id="fs-covers">${y.map(z).join("")}</div>
      <div class="fs-meta">
        <div class="fs-titlewrap">
          <div class="fs-line fs-title" id="fs-title"><span></span></div>
          <button class="fs-love" id="fs-love" type="button" aria-label="\u6536\u85CF" title="\u6536\u85CF"></button>
        </div>
        <div class="fs-line fs-artist" id="fs-artist"><span></span></div>
        <div class="fs-line fs-album" id="fs-album"><span></span></div>
      </div>
      <div class="fs-lyrics mode-one" id="fs-lyrics"><div class="fs-ly-roll" id="fs-ly-roll"></div></div>
    </div>
    <div class="fs-bar">
      <div class="fs-prow">
        <span class="fs-time" id="fs-cur">0:00</span>
        <div class="fs-track" id="fs-track" role="slider" tabindex="0" aria-label="\u64AD\u653E\u8FDB\u5EA6"
             aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
          <div class="fs-fill"></div><div class="fs-knob"></div>
        </div>
        <span class="fs-time dur" id="fs-dur">0:00</span>
      </div>
      <div class="fs-ctl">
        <div class="fs-ctl-group">
          <button class="fs-iconbtn" id="fs-mute" type="button" aria-label="\u9759\u97F3"></button>
          <div class="fs-vol" id="fs-vol" role="slider" tabindex="0" aria-label="\u97F3\u91CF" aria-valuemin="0" aria-valuemax="100" aria-valuenow="80">
            <div class="fs-volfill"></div>
          </div>
          <span class="fs-volnum" id="fs-volnum">80%</span>
        </div>
        <div class="fs-ctl-group">
          <div class="fs-mwrap">
            <button class="fs-iconbtn" id="fs-more" type="button" title="\u66F4\u591A\u9009\u9879" aria-label="\u66F4\u591A\u9009\u9879" aria-haspopup="menu" aria-expanded="false">${k.more}</button>
            <div class="fs-pop fs-mmenu" id="fs-mmenu" role="menu">
              <div id="fs-mjump"></div>
              <div class="fs-msep"></div>
              <div class="fs-maux" role="radiogroup" aria-label="\u6B4C\u8BCD\u7FFB\u8BD1\u9009\u9879">
                <span>\u7FFB\u8BD1\u9009\u9879</span>
                <div id="fs-maux">
                  ${se.map(e=>`<button class="fs-mopt" type="button" role="radio" data-aux="${e}">${Gt[e]}</button>`).join("")}
                </div>
              </div>
              <div class="fs-mrow">
                <span>\u6B4C\u8BCD\u5927\u5C0F</span>
                <div class="fs-msize">
                  <button type="button" id="fs-ly-dec" aria-label="\u7F29\u5C0F\u6B4C\u8BCD" title="\u7F29\u5C0F\u6B4C\u8BCD">\u2212</button>
                  <span class="fs-mval" id="fs-ly-val">100%</span>
                  <button type="button" id="fs-ly-inc" aria-label="\u653E\u5927\u6B4C\u8BCD" title="\u653E\u5927\u6B4C\u8BCD">+</button>
                </div>
              </div>
              <div class="fs-msep"></div>
              <button class="fs-qi" id="fs-mcollapse" type="button"><span>\u6536\u8D77\u6B63\u5728\u64AD\u653E\u9875</span></button>
            </div>
          </div>
          <div class="fs-qwrap">
            <button class="fs-qbtn" id="fs-qbtn" type="button" aria-haspopup="menu" aria-expanded="false" title="\u97F3\u8D28\uFF08\u672C\u4F1A\u8BDD\u751F\u6548\uFF09">\u97F3\u8D28</button>
            <div class="fs-pop fs-qpop" id="fs-qpop" role="menu" aria-label="\u97F3\u8D28"></div>
          </div>
        </div>
      </div>
    </div>`;let i=e=>r.querySelector("#"+e),w=[...r.querySelectorAll(".fs-card[data-off]")],T=new Map,p=()=>{T.clear();for(let e of w)T.set(Number(e.dataset.off),e)};p();let ye=e=>T.get(e),ae=i("fs-covers"),E=ye(0),Ht=E.querySelector(".fs-spin"),We=E.querySelector(".fs-veil"),Xe=E.querySelector(".fs-err"),At=()=>{let e=ye(0);if(e!==E){for(let t of w)t.classList.remove("loading","has-err");E=e,e.querySelector(".fs-art").append(Ht,We,Xe)}},C=i("fs-title"),oe=i("fs-artist"),re=i("fs-album"),I=i("fs-love"),v=i("fs-lyrics"),m=i("fs-ly-roll"),x=i("fs-track"),_=i("fs-cur"),ie=i("fs-dur"),we=i("fs-mute"),H=i("fs-vol"),Le=i("fs-volnum"),R=i("fs-qbtn"),$=i("fs-qpop"),qt=i("fs-collapse"),ke=i("fs-more"),Je=i("fs-mmenu"),Ze=[...i("fs-maux").querySelectorAll(".fs-mopt")],zt=i("fs-ly-val"),Ke=i("fs-ly-dec"),Qe=i("fs-ly-inc"),Ct=i("fs-mcollapse"),B=i("fs-mjump"),Ge="",M=he(Number(ne?.get("lyscale"))||1,be,xe),et=e=>{let t=ye(Math.max(-2,Math.min(2,e))).querySelector(".fs-art"),s=Math.max(64,Math.round(t.offsetWidth||(e===0?300:160))),a=Math.min(3,window.devicePixelRatio||1);return s*a},tt=[{btn:R,pop:$},{btn:ke,pop:Je}],st=e=>{let t=e.target;for(let s of tt)if(s.pop.contains(t)||s.btn.contains(t))return;A()},A=()=>{for(let e of tt)e.pop.classList.remove("open"),e.btn.classList.remove("open"),e.btn.setAttribute("aria-expanded","false");document.removeEventListener("pointerdown",st,!0)},nt=(e,t)=>{if(t.classList.contains("open")){A();return}A(),t.classList.add("open"),e.classList.add("open"),e.setAttribute("aria-expanded","true"),document.addEventListener("pointerdown",st,!0)},$t=140,Me=e=>{A(),window.setTimeout(()=>{n.collapse(),location.hash=e},$t)},Y=(e,t,s)=>{let a=document.createElement("button");return a.type="button",a.className="fs-qi",a.innerHTML=`<span>${F(e)}</span>`,a.disabled=t,s&&(a.onclick=s),a},Bt=()=>{let e=n.current();if(B.innerHTML="",!e){let o=document.createElement("div");o.className="fs-qempty",o.textContent="\u672A\u5728\u64AD\u653E",B.append(o);return}B.append(Y("\u540C\u540D\u641C\u7D22",!1,()=>Me(`#/search?keyword=${encodeURIComponent(e.name)}`)));let t=(e.singer??[]).filter(o=>!!o.mid);t.length||B.append(Y("\u8DF3\u8F6C\u6B4C\u624B",!0));for(let o of t)B.append(Y(t.length>1?`\u8DF3\u8F6C\u6B4C\u624B\uFF1A${o.name}`:"\u8DF3\u8F6C\u6B4C\u624B",!1,()=>Me(`#/singer?mid=${encodeURIComponent(o.mid)}&name=${encodeURIComponent(o.name)}`)));let s=e.album,a=!!(s?.mid||s?.pmid);B.append(a?Y("\u8DF3\u8F6C\u4E13\u8F91",!1,()=>{let o=String(s.pmid||s.mid).split("_")[0];Me(`#/album?mid=${encodeURIComponent(s.mid??o)}&name=${encodeURIComponent(s.name||"\u4E13\u8F91")}`)}):Y("\u8DF3\u8F6C\u4E13\u8F91",!0))};R.onclick=()=>nt(R,$),ke.onclick=()=>{Bt(),nt(ke,Je)};let at=[{box:C,inner:C.querySelector("span"),sig:""},{box:oe,inner:oe.querySelector("span"),sig:""},{box:re,inner:re.querySelector("span"),sig:""}],ot=()=>{},Se=()=>{for(let e of at){if(!e.sig)continue;let t=e.inner.scrollWidth-e.box.clientWidth;e.box.classList.toggle("over",t>1),t>1&&(e.box.style.setProperty("--fs-mx",`${-t}px`),e.box.style.setProperty("--fs-md",`${Math.max(5,Math.round((t+20)/26))}s`))}ot()},O=new ResizeObserver(Se);O.observe(C),O.observe(oe),O.observe(re),O.observe(v);let Te=(e,t)=>{let s=at[e];t!==s.sig&&(s.sig=t,s.inner.textContent=t,s.box.classList.remove("over"),Se())};for(let e of w)e.onclick=()=>{if(Q)return;let t=Number(e.dataset.off);t===0?n.toggle():n.jumpTo(t)};I.onclick=e=>{e.stopPropagation(),n.toggleLove()},we.onclick=()=>n.toggleMute(),qt.onclick=()=>n.collapse(),Ct.onclick=()=>{A(),n.collapse()};let Dt=e=>{let t=se.indexOf(n.lyricAux()),s=se.indexOf(e);for(let a=(s-t+se.length)%se.length;a>0;a--)n.toggleTrans()};Ze.forEach(e=>{e.onclick=()=>Dt(e.dataset.aux)});let Ee=()=>{r.style.setProperty("--fs-ly-scale",M.toFixed(2)),zt.textContent=`${Math.round(M*100)}%`,Ke.disabled=M<=be+1e-6,Qe.disabled=M>=xe-1e-6,ne?.set("lyscale",M.toFixed(2)),Se()};Ke.onclick=()=>{M=he(M-.05,be,xe),Ee()},Qe.onclick=()=>{M=he(M+.05,be,xe),Ee()},Ee(),x.onkeydown=e=>{e.key==="ArrowLeft"?(e.preventDefault(),n.seek(Math.max(0,n.time()-5))):e.key==="ArrowRight"&&(e.preventDefault(),n.seek(n.time()+5))},H.onkeydown=e=>{e.key==="ArrowLeft"||e.key==="ArrowDown"?(e.preventDefault(),n.setVolume(n.volume()-.05)):(e.key==="ArrowRight"||e.key==="ArrowUp")&&(e.preventDefault(),n.setVolume(n.volume()+.05))};let fe=(e,t)=>Tt((e.clientX-t.getBoundingClientRect().left)/Math.max(1,t.getBoundingClientRect().width)),U=0,V="",le=e=>{U=fe(e,x),x.style.setProperty("--fs-pf",String(U)),_.textContent=Ue(U*n.duration())},D=()=>{window.removeEventListener("pointermove",le),window.removeEventListener("pointerup",D),window.removeEventListener("pointercancel",D),x.classList.remove("scrub"),n.seek(U*n.duration()),V=""};x.addEventListener("pointerdown",e=>{n.duration()&&(e.preventDefault(),x.classList.add("scrub"),U=fe(e,x),le(e),window.addEventListener("pointermove",le),window.addEventListener("pointerup",D),window.addEventListener("pointercancel",D))}),x.addEventListener("keydown",e=>{if(e.key==="Home")e.preventDefault(),n.seek(0);else if(e.key==="End"){e.preventDefault();let t=n.duration();t&&n.seek(t-1)}});let W=0,He=!1,ce=e=>{W=fe(e,H),H.style.setProperty("--fs-v",String(W)),Le.textContent=`${Math.round(W*100)}%`},N=()=>{window.removeEventListener("pointermove",ce),window.removeEventListener("pointerup",N),window.removeEventListener("pointercancel",N),He=!1,n.setVolume(W)};H.addEventListener("pointerdown",e=>{e.preventDefault(),He=!0,W=fe(e,H),ce(e),window.addEventListener("pointermove",ce),window.addEventListener("pointerup",N),window.addEventListener("pointercancel",N)});let Ae=[],qe=[],g=[],h=[],X=-1,ze="",de=!1,P=[],J=1,u=-1,Z=!1,K=0,Nt=3e3,Pt=.55,Ce=e=>e.trans&&n.showTrans()?`<span class="t2">${F(e.trans)}</span>`:"",jt=(e,t)=>{if(t==="off")return"";let s=((t==="romanization"?e.romanLyric:e.translatedLyric)??"").trim(),a=((t==="romanization"?e.translatedLyric:e.romanLyric)??"").trim();return s||a},$e=(e,t,s)=>{let a=s&&!!t.words&&t.words.length>0;if(e.classList.toggle("kara",a),a){e.innerHTML=`<span class="t1">${t.words.map(()=>'<span class="kw"></span>').join("")}</span>`+Ce(t);let o=[...e.querySelectorAll(".kw")];return t.words.forEach((l,f)=>{let c=o[f];c&&(c.textContent=l.word)}),o}return e.innerHTML=`<span class="t1">${F(t.text)}</span>`+Ce(t),[]},rt=e=>{e.style.setProperty("--fs-fit","1");let t=1;for(let a=0;a<6;a++){let o=v.clientHeight,l=m.scrollHeight;if(l<=o+1)break;t=Math.max(Pt,t*(o/l)*.97),e.style.setProperty("--fs-fit",t.toFixed(3))}let s=m.scrollHeight;m.style.transform=`translateY(${Math.max(0,(v.clientHeight-s)/2).toFixed(1)}px)`},Be=e=>{let t=Math.max(0,v.scrollHeight-v.clientHeight),s=e.offsetTop-(v.clientHeight-e.offsetHeight)/2;v.scrollTop=he(s,0,t)},Ft=e=>{let t=n.lyricState(),s=n.karaokeActive(),a=ne?.get("lyrows")==="5"?5:1,o=`${e?.mid??""}|${t}|${n.lyricAux()}|${s?"k":"l"}|${a}`;if(o===Ge)return;if(Ge=o,J=a,de=s,X=-1,u=-1,ze="",h=[],P=[],Z=!1,window.clearTimeout(K),v.classList.toggle("mode-one",a===1),v.classList.toggle("mode-five",a===5),v.scrollTop=0,m.style.transform="",m.innerHTML="",qe=s?n.karaoke():[],Ae=s?[]:n.lyrics(),!e){m.innerHTML='<div class="fs-ly-empty">\u672A\u5728\u64AD\u653E</div>';return}let l=s?qe.length:Ae.length;if(t==="loading"||t==="idle"&&!l){m.innerHTML='<div class="fs-ly-empty">\u6B4C\u8BCD\u52A0\u8F7D\u4E2D\u2026</div>';return}if(!l){m.innerHTML='<div class="fs-ly-empty">\u6682\u65E0\u6B4C\u8BCD</div>';return}if(g=s?qe.map(f=>({t:f.startTime/1e3,text:f.words.map(c=>c.word).join(""),trans:jt(f,n.lyricAux()),words:f.words})):Ae.map(f=>({t:f.t,text:f.text,trans:f.trans})),a===5){m.innerHTML=g.map((f,c)=>`<div class="fs-ll" data-i="${c}" title="\u70B9\u51FB\u8DF3\u5230\u8FD9\u4E00\u53E5"><span class="t1">${F(f.text)}</span>${Ce(f)}</div>`).join(""),h=[...m.querySelectorAll(".fs-ll")];for(let f of h)f.onclick=()=>{Z=!1,window.clearTimeout(K),n.seek(Math.max(0,g[Number(f.dataset.i)].t+(n.lyricDelay?.()??0)/1e3))}}},it=e=>{let t=e>=0?g[e]:void 0,s=t?`${t.t}|${t.text}|${(t.words??[]).map(o=>o.word).join("")}|${t.trans??""}`:"empty";if(s===ze)return;if(ze=s,P=[],!t){m.innerHTML=g.length?"":'<div class="fs-ly-empty">\u6682\u65E0\u6B4C\u8BCD</div>';return}m.innerHTML="";let a=document.createElement("div");a.className="fs-ll cur",a.title="\u70B9\u51FB\u8DF3\u5230\u8FD9\u4E00\u53E5",P=$e(a,t,de),a.onclick=()=>n.seek(Math.max(0,t.t+(n.lyricDelay?.()??0)/1e3)),m.append(a),rt(a)},ft=e=>{if(e!==u){u>=0&&h[u]&&g[u]&&$e(h[u],g[u],!1),u=e;for(let a=0;a<h.length;a++)h[a].classList.toggle("cur",a===e);let s=e>=0?h[e]:void 0;P=s&&g[e]?$e(s,g[e],de):[]}let t=e>=0?h[e]:void 0;t&&!Z&&Be(t)},It=(e,t)=>{let s=e.words;if(s)for(let a=0;a<P.length;a++){let o=s[a],l=P[a];if(!o||!l)continue;let f=Math.max(1,o.endTime-o.startTime),c=t>=o.endTime?1:t<=o.startTime?0:(t-o.startTime)/f,L=Math.round(c*50)/50;l.dataset.p!==String(L)&&(l.dataset.p=String(L),l.style.setProperty("--p",String(L)))}},lt=()=>{J===5&&(Z=!0,window.clearTimeout(K),K=window.setTimeout(()=>{Z=!1,u>=0&&h[u]&&Be(h[u])},Nt))};v.addEventListener("wheel",lt,{passive:!0}),ot=()=>{if(J===5)u>=0&&h[u]&&Be(h[u]);else{let e=m.querySelector(".fs-ll");e&&rt(e)}};let ct="",dt="",pt="",mt="",ut="",vt="";for(let e of w){let t=e.querySelector("img"),s=e.querySelector(".fs-ph");t.onerror=()=>{t.removeAttribute("src"),t.style.display="none",s.style.display=""}}let _t=(e,t,s)=>{if(!s){e.removeAttribute("src"),e.style.display="none",t.style.display="";return}t.style.display="none",e.getAttribute("src")!==s&&(e.src=s,e.style.display="")},gt=new Set,De=(e,t)=>{let s=Et(e,et(t));if(!s||gt.has(s))return;gt.add(s);let a=new Image;a.decoding="async",a.src=s},Ne=new Map,pe="",Pe="",je="",Fe="",Ie="",Q=!1,ht=1,bt=1,_e=0,q=!1,me=0,Re=[C,oe,re],Ye=0,Rt=e=>{let t=e>0?"fs-anim-next":"fs-anim-prev",s=C.classList.contains(t);for(let a of Re)a.classList.remove("fs-anim-next","fs-anim-prev");s&&C.offsetWidth;for(let a of Re)a.classList.add(t);window.clearTimeout(Ye),Ye=window.setTimeout(()=>{for(let a of Re)a.classList.remove(t)},420)},Yt=(e,t)=>{ae.classList.remove("fs-anim-next","fs-anim-prev","fs-double");let s=e*t,a=[];for(let o of w){o.removeAttribute("data-to");let l=Number(o.dataset.off)-s;l<-2?(o.dataset.off=String(l+5),a.push(o)):l>2?(o.dataset.off=String(l-5),a.push(o)):o.dataset.off=String(l)}for(let o of a)o.classList.add("fs-hop"),requestAnimationFrame(()=>requestAnimationFrame(()=>o.classList.remove("fs-hop")));p(),At(),Ne.clear(),Q=!1,q=!1,Oe()},ue=(e,t=1)=>{ht=e,bt=t,Q=!0,ae.classList.toggle("fs-double",t===2);for(let s=1;s<=t+2;s++)De(n.songAt(s),s),De(n.songAt(-s),-s);ae.classList.remove("fs-anim-next","fs-anim-prev");for(let s of w)s.dataset.to=String(Number(s.dataset.off)-e*t);ae.classList.add(e>0?"fs-anim-next":"fs-anim-prev"),window.clearTimeout(_e),_e=window.setTimeout(()=>{r.isConnected&&Yt(ht,bt)},t===2?Qt:Kt)},Ot=e=>{for(let t of[-1,1,-2,2,-3,3])De(n.songAt(t),t);for(let t of w){let s=Number(t.dataset.off),a=t.querySelector("img"),o=t.querySelector(".fs-ph"),l=t.querySelector(".fs-cap"),f=s===0?"\u64AD\u653E/\u6682\u505C":s===-1?"\u4E0A\u4E00\u9996":s===1?"\u4E0B\u4E00\u9996":s<0?"\u4E0A\u4E0A\u9996":"\u4E0B\u4E0B\u9996";t.getAttribute("aria-label")!==f&&t.setAttribute("aria-label",f);let c=s===0?e:n.songAt(s),L=Et(c,et(s)),G=c?.name??"",ee=L+"|"+G;Ne.get(s)!==ee&&(Ne.set(s,ee),_t(a,o,L),l&&(l.textContent=G),t.classList.toggle("empty",!c),t.disabled=!c)}},Ut=e=>{let t=0;if(e&&!Q&&pe&&e.mid!==pe&&(e.mid===je?(q=!1,t=1,ue(1)):e.mid===Pe?(q=!1,t=-1,ue(-1)):e.mid===Ie?(q=!0,me=1,ue(1,2)):e.mid===Fe&&(q=!0,me=-1,ue(-1,2))),e?(pe=e.mid,je=n.songAt(1)?.mid??"",Pe=n.songAt(-1)?.mid??"",Ie=n.songAt(2)?.mid??"",Fe=n.songAt(-2)?.mid??""):(pe="",je="",Pe="",Ie="",Fe=""),Q||Ot(e),!q){Te(0,e?.name??"\u672A\u5728\u64AD\u653E"),Te(1,Jt(e)||"\u672A\u77E5\u6B4C\u624B"),Te(2,e?.album?.name||"");let s=t||me;s&&(Rt(s),me=0)}},Oe=()=>{let e=n.current();Ut(e),q||Ft(e);let t=n.loading(),s=n.error();E.classList.toggle("loading",t),E.classList.toggle("has-err",!!s&&!t),s!==vt&&(vt=s,Xe.textContent=s);let a=t?"load":s?"err":n.paused()?"paused":"playing";a!==ct&&(ct=a,We.innerHTML=s?S('<path d="M20 12a8 8 0 1 1-2.6-5.9M20 4v4.5h-4.5" stroke-width="2"/>','width="30" height="30"'):a==="paused"?k.play:k.pause);let o=n.muted()?0:n.volume();if(!He){let d=Math.round(o*100);H.style.setProperty("--fs-v",String(o)),Le.textContent!==`${d}%`&&(Le.textContent=`${d}%`)}we.classList.toggle("on",n.muted()||o===0);let l=`${Math.round(o*100)}|${n.muted()?1:0}`;l!==dt&&(dt=l,we.innerHTML=n.muted()||o===0?k.volMute:o<.34?k.volLow:o<.67?k.volMid:k.volHigh),H.setAttribute("aria-valuenow",String(Math.round(o*100)));let f=Zt(e),c=f?e?.src==="nas"?"NAS \u6D41":"\u672C\u5730\u6587\u4EF6":n.qualityLabel();c!==pt&&(pt=c,R.textContent=c,R.title=f?"\u97F3\u8D28\uFF1A\u66F2\u76EE\u6765\u81EA\u672C\u5730\u5E93/NAS\uFF0C\u6587\u4EF6\u672C\u8EAB\u5C31\u662F\u90A3\u4E00\u6863\uFF08\u65E0\u5728\u7EBF\u6863\u4F4D\u53EF\u5207\uFF09":"\u97F3\u8D28\uFF08\u672C\u4F1A\u8BDD\u751F\u6548\uFF09");let L=n.qualityTiers(),G=n.quality(),ee=(f?"L|":"")+L.map(d=>d.id+(d.locked?"!":"")).join(",")+"|"+G;if(ee!==mt)if(mt=ee,$.innerHTML="",f){let d=document.createElement("div");d.className="fs-qnote",d.textContent=`${c}\uFF1A\u66F2\u76EE\u6765\u81EA\u672C\u5730\u5E93/NAS\uFF0C\u65E0\u5728\u7EBF\u6863\u4F4D\u53EF\u5207\uFF08\u97F3\u8D28\u5373\u6587\u4EF6\u672C\u8EAB\uFF09`,$.append(d)}else{let d=(b,Wt,Mt="")=>{let te=document.createElement("button");te.type="button",te.className="fs-qi"+(G===b?" sel":""),te.innerHTML=`<span>${F(Wt)}</span>${Mt?`<em>${F(Mt)}</em>`:""}`,te.onclick=()=>{n.switchQuality(b),A()},$.append(te)};if(d("auto","\u81EA\u52A8","\u6700\u9AD8\u53EF\u64AD"),L.length)for(let b of L)d(b.id,b.label,b.locked?"\u{1F512} \u81EA\u52A8\u56DE\u9000":"");else{let b=document.createElement("div");b.className="fs-qempty",b.textContent="\u6863\u4F4D\u8BFB\u53D6\u4E2D\u2026",$.append(b)}}let ge=!!e&&!f&&n.loved(e.mid),Lt=`${e?.mid??""}|${ge?1:0}|${f?1:0}`;Lt!==ut&&(ut=Lt,I.hidden=f,I.classList.toggle("on",ge),I.innerHTML=ge?k.heartFill:k.heart,I.title=ge?"\u53D6\u6D88\u6536\u85CF":"\u6536\u85CF\u8FD9\u9996\u6B4C");let kt=n.lyricAux();for(let d of Ze){let b=d.dataset.aux===kt;d.classList.toggle("sel",b),d.setAttribute("aria-checked",String(b))}v.classList.toggle("no-trans",kt==="off")},xt=()=>{let e=n.time(),t=n.duration();if(t<=0){V!=="0"&&(V="0",x.style.setProperty("--fs-pf","0"),_.textContent!=="0:00"&&(_.textContent="0:00"),ie.textContent!=="0:00"&&(ie.textContent="0:00"));return}let s=Tt(e/t);if(!x.classList.contains("scrub")){x.style.setProperty("--fs-pf",s.toFixed(4));let o=Ue(e);_.textContent!==o&&(_.textContent=o);let l=Math.round(s*100);V!==String(l)&&(V=String(l),x.setAttribute("aria-valuenow",String(l)))}let a=Ue(t);ie.textContent!==a&&(ie.textContent=a)},j=0,ve=!1,yt=()=>{if(j=0,!n.expanded()||!r.isConnected){ve=!1;return}if(g.length){let e=n.time()+.2-(n.lyricDelay?.()??0)/1e3,t=-1;for(let s=0;s<g.length&&g[s].t<=e;s++)t=s;t!==X&&(X=t,J===5?ft(t):it(t)),de&&t>=0&&It(g[t],e*1e3)}else X!==-1&&(X=-1,J===5?ft(-1):it(-1));xt(),j=window.requestAnimationFrame(yt)},wt=()=>{n.expanded()&&!ve&&r.isConnected&&(ve=!0,j=window.requestAnimationFrame(yt))},Vt=n.onNotify(()=>{Oe(),wt()});return Oe(),xt(),wt(),()=>{Vt(),window.clearTimeout(_e),window.clearTimeout(Ye),window.clearTimeout(K),v.removeEventListener("wheel",lt),j&&window.cancelAnimationFrame(j),j=0,ve=!1,O.disconnect(),A(),window.removeEventListener("pointermove",le),window.removeEventListener("pointerup",D),window.removeEventListener("pointercancel",D),window.removeEventListener("pointermove",ce),window.removeEventListener("pointerup",N),window.removeEventListener("pointercancel",N),r.innerHTML=""}}var is=St({id:"flowscape",name:"Flowscape \u6D41\u5883",version:"1.6.3",author:"Team Quaver",kind:"third-party",description:"\u4E00\u4E2A\u590D\u523B\u79FB\u52A8\u542C\u6B4C\u53F2\u4E0A\u6700\u7ECF\u5178\u7684\u64AD\u653E\u9875\u6A21\u5F0F\u7684\u63D2\u4EF6",setup(r){ts(),ne=r.storage;let n=()=>r.storage.get("flow")!=="off";return r.registerNowPlayingView({id:"flowscape",enabled:n,render:ss}),r.registerSettingsSection({id:"flowscape-main",title:"\u63A5\u7BA1\u64AD\u653E\u9875",render(y){let z=()=>r.storage.get("lyrows")==="5"?5:1;y.innerHTML=`
          <div class="set-label">\u63A5\u7BA1\u6B63\u5728\u64AD\u653E\u9875 <span class="set-note-inline">\u5F00\u542F\u540E\u5728\u6B63\u5728\u64AD\u653E\u9875\u91CC\u9690\u85CF\u539F\u64AD\u653E\u6761\uFF0C\u63A7\u5236\u4E0E\u8FDB\u5EA6\u6539\u7531\u6D41\u5883\u81EA\u7ED8</span></div>
          <div class="opt-cards">
            <button class="opt-card" data-opt="on" type="button">\u5F00\u542F</button>
            <button class="opt-card" data-opt="off" type="button">\u5173\u95ED</button>
          </div>
          <div class="set-label">\u6B4C\u8BCD\u884C\u6570 <span class="set-note-inline">\u5355\u884C\u53EA\u663E\u793A\u5F53\u524D\u8FD9\u4E00\u53E5\uFF1B\u8FC7\u957F\u4F1A\u81EA\u9002\u5E94\u7F29\u5B57\u53F7\u800C\u4E0D\u662F\u88AB\u88C1\u65AD\u3002\u4E94\u884C\u6392\u6210\u6574\u6BB5\u6B4C\u8BCD\uFF0C\u5F53\u524D\u53E5\u5C45\u4E2D\uFF0C\u6EDA\u8F6E / \u89E6\u63A7\u677F\u53EF\u7FFB\u9605\uFF08\u505C\u624B 3 \u79D2\u56DE\u5230\u8DDF\u968F\uFF09</span></div>
          <div class="opt-cards">
            <button class="opt-card" data-lyr="1" type="button">\u5355\u884C</button>
            <button class="opt-card" data-lyr="5" type="button">\u4E94\u884C</button>
          </div>
          <p class="muted set-hint">\u6D41\u5883\u63A5\u7BA1\u6574\u4E2A\u6B63\u5728\u64AD\u653E\u9875\uFF1A\u5C01\u9762\u5728\u4E2D\u95F4\uFF0C\u4E0A\u4E00\u9996\u5728\u5DE6\u3001\u4E0B\u4E00\u9996\u5728\u53F3\uFF08\u70B9\u4FA7\u5C01\u9762\u76F4\u63A5\u8DF3\u5230\u90A3\u4E00\u9996\uFF09\uFF0C\u4E0B\u65B9\u662F\u6B4C\u540D\u3001\u6B4C\u624B\u3001\u4E13\u8F91\u4E0E\u6B4C\u8BCD\uFF08\u70B9\u6B4C\u8BCD\u8DF3\u64AD\uFF09\u3002\u5E95\u90E8\u81EA\u7ED8\u8FDB\u5EA6\u6761\uFF08\u53EF\u62D6\u62FD\uFF09\u3001\u97F3\u91CF\u4E0E\u97F3\u8D28\uFF08\u300C\u66F4\u591A\u9009\u9879\u300D\u5728\u97F3\u8D28\u9009\u62E9\u5668\u5DE6\u8FB9\uFF09\uFF1B\u5DE6\u4E0A\u89D2\u662F\u300C\u6536\u8D77\u300D\u2014\u2014 \u63A5\u7BA1\u65F6\u539F\u64AD\u653E\u6761\u4F1A\u88AB\u9690\u85CF\uFF0C\u4E0D\u4ECE\u8FD9\u91CC\u6536\u8D77\u5C31\u53EA\u80FD\u6309 ESC \u4E86\u3002\u505C\u7528\u672C\u63D2\u4EF6\u6216\u5173\u6389\u4E0A\u9762\u7684\u5F00\u5173\uFF0C\u5373\u56DE\u5230\u9ED8\u8BA4\u6B63\u5728\u64AD\u653E\u9875\u3002</p>`;let i=[...y.querySelectorAll("[data-opt]")],w=[...y.querySelectorAll("[data-lyr]")],T=()=>{i.forEach(p=>p.classList.toggle("sel",p.dataset.opt==="on"===n())),w.forEach(p=>p.classList.toggle("sel",Number(p.dataset.lyr)===z()))};i.forEach(p=>{p.onclick=()=>{r.storage.set("flow",p.dataset.opt==="off"?"off":"on"),T()}}),w.forEach(p=>{p.onclick=()=>{r.storage.set("lyrows",p.dataset.lyr),T()}}),T()}}),()=>{ne=null,document.querySelector("style[data-sparkle-css='flowscape']")?.remove()}}});export{is as default};
