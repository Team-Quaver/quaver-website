var at=a=>a;var A=a=>String(a??"").replace(/[&<>"']/g,n=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[n]),ot=a=>Math.max(0,Math.min(1,Number.isFinite(a)?a:0)),He=(a,n,v)=>Math.max(n,Math.min(v,a)),qe=a=>((!isFinite(a)||a<0)&&(a=0),`${Math.floor(a/60)}:${String(Math.floor(a%60)).padStart(2,"0")}`),Ce=[90,120,150,180,300,500,800],kt=a=>{for(let n of Ce)if(n>=a)return n;return Ce[Ce.length-1]},it=(a,n)=>{let v=a?.album?.pmid??"",y=v?v.split("_")[0]:a?.album?.mid??"";if(!y)return"";let r=kt(n);return`https://y.gtimg.cn/music/photo_new/T002R${r}x${r}M000${y}.jpg`},Lt=a=>(a?.singer??[]).map(n=>n.name).filter(Boolean).join(" / "),Mt=440,b=(a,n="")=>`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${n}>${a}</svg>`,g={play:'<svg viewBox="0 0 24 24" width="34" height="34" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.53.85l10-6.5a1 1 0 0 0 0-1.7l-10-6.5A1 1 0 0 0 8 5.5z"/></svg>',pause:'<svg viewBox="0 0 24 24" width="34" height="34" fill="currentColor" aria-hidden="true"><path d="M7 5h3.2v14H7zM13.8 5H17v14h-3.2z"/></svg>',volHigh:b('<path d="M4 9.5h3.2L12 5.5v13L7.2 14.5H4z" fill="currentColor" stroke="none"/><path d="M15.6 9a4.2 4.2 0 0 1 0 6"/><path d="M18.2 6.6a7.6 7.6 0 0 1 0 10.8"/>'),volMid:b('<path d="M4 9.5h3.2L12 5.5v13L7.2 14.5H4z" fill="currentColor" stroke="none"/><path d="M15.6 9a4.2 4.2 0 0 1 0 6"/>'),volLow:b('<path d="M4 9.5h3.2L12 5.5v13L7.2 14.5H4z" fill="currentColor" stroke="none"/><path d="M15.6 9a4.2 4.2 0 0 1 0 6"/>'),volMute:b('<path d="M4 9.5h3.2L12 5.5v13L7.2 14.5H4z" fill="currentColor" stroke="none"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>'),heart:b('<path d="M12 20s-7-4.6-9-9c-1.3-3 .8-6.5 4-6.5 2 0 3.5 1.2 5 3 1.5-1.8 3-3 5-3 3.2 0 5.3 3.5 4 6.5-2 4.4-9 9-9 9z"/>'),heartFill:'<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 20s-7-4.6-9-9c-1.3-3 .8-6.5 4-6.5 2 0 3.5 1.2 5 3 1.5-1.8 3-3 5-3 3.2 0 5.3 3.5 4 6.5-2 4.4-9 9-9 9z"/></svg>',collapse:b('<path d="M6 9.5l6 6 6-6"/>','width="17" height="17"'),more:'<svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true"><circle cx="12" cy="5" r="1.85"/><circle cx="12" cy="12" r="1.85"/><circle cx="12" cy="19" r="1.85"/></svg>'},St=`
.fs-root{
  position:absolute; inset:0; display:flex; flex-direction:column;
  /* \u9876\u90E8\u53EA\u7559 18px\uFF1A\u5DE6\u4E0A\u89D2\u7684\u6309\u94AE\u7C07\u4E0D\u4E0E\u7A97\u53E3\u6309\u94AE\uFF08.winbtns\uFF0Cfixed top:18 right:12\uFF0C
     z-index 90\uFF09\u4E89\u4F4D \u2014\u2014 \u6240\u4EE5\u672C\u9875\u7684\u64CD\u4F5C\u6309\u94AE\u4E00\u5F8B\u9760\u5DE6\u653E\u3002 */
  padding:18px 30px 18px; gap:12px; color:#fff; min-height:0; overflow:hidden;
  font-family:var(--font-ui,inherit);

  /* \u4E09\u4E2A\u5C01\u9762\u7528**\u540C\u4E00\u4E2A\u57FA\u51C6\u5C3A\u5BF8** --fs-cover\uFF0C\u4FA7\u5361\u53EA\u9760 --slot-scale + rotateY
     \u8868\u8FBE\u7EB5\u6DF1\u3002\u4E4B\u524D\u4FA7\u5361\u53E6\u6709\u4E00\u5957 --fs-side\uFF08clamp(80px,13vh,170px)\uFF0C\u6BD4\u4E2D\u95F4\u5C0F\u4E00\u534A\uFF09\uFF0C
     \u7B49\u4E8E\u4E24\u5957\u5C3A\u5BF8\u4F53\u7CFB \u2192 \u4E2D\u95F4\u5DE8\u5927\u3001\u4E24\u4FA7\u8FF7\u4F60\uFF0C\u65E2\u4E0D\u7EDF\u4E00\u4E5F\u4E0D\u50CF\u4E00\u53E0\u4E13\u8F91\u3002
     --fs-gap \u4E5F\u6539\u6210\u6309 --fs-cover \u7684\u6BD4\u4F8B\u7B97\uFF1A\u95F4\u8DDD\u4E0E\u5C3A\u5BF8\u540C\u6E90\uFF0C\u7A97\u53E3\u7F29\u653E\u65F6\u6574\u4F53\u7B49\u6BD4\uFF0C
     \u4E0D\u4F1A\u51FA\u73B0\u300C\u5C01\u9762\u53D8\u5C0F\u4E86\u3001\u95F4\u8DDD\u6CA1\u53D8\u300D\u7684\u6563\u67B6\u3002\u69FD\u4F4D\u8DDD < \u4E3B\u4F53\u5BBD \u2192 \u4FA7\u5361\u538B\u4F4F\u4E3B\u5C01\u9762
     \u4E00\u70B9\u8FB9\uFF0C\u624D\u6709\u4E00\u53E0\u7684\u4EA4\u53E0\u611F\u3002 */
  --fs-cover:min(28vh, 24vw, 300px);
  --fs-gap:calc(var(--fs-cover) * .66);
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

/* \u9876\u90E8\u64CD\u4F5C\u6761\uFF1A\u63A5\u7BA1\u6001\u7684\u51FA\u53E3\uFF08\u6536\u8D77\uFF09+ \u66F4\u591A\u9009\u9879\u3002\u5DE6\u5BF9\u9F50\u3002 */
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
  /* \u523B\u610F**\u4E0D**\u7528 transform-style:preserve-3d\uFF1A\u8FD9\u91CC\u7684\u7ACB\u65B9\u4F53\u611F\u5168\u90E8\u6765\u81EA .fs-art \u81EA\u5DF1
     \u90A3\u4E00\u6BB5 perspective() + rotateY()\uFF08\u81EA\u5E26\u900F\u89C6\uFF0C\u81EA\u6210\u4E00\u4F53\uFF09\uFF0C\u4E0D\u9700\u8981\u5B50\u5143\u7D20\u5171\u4EAB 3D \u7A7A\u95F4\u3002
     \u53CD\u800C\u6302\u4E0A preserve-3d \u4F1A\u628A z-index \u7684\u5C42\u7EA7\u5224\u5B9A\u4EA4\u7ED9 3D \u6392\u5E8F\uFF0C\u5361\u7247\u7684\u5C42\u5E8F\u4F1A\u53D8\u5F97\u4E0D\u53EF
     \u9884\u671F\uFF08\u8C01\u76D6\u8C01\u770B\u8FD0\u6C14\uFF09\u3002 */
}
.fs-card{
  position:absolute; left:50%; top:50%; border:0; padding:0; background:none; color:inherit;
  font:inherit; cursor:pointer;
  /* \u4F4D\u79FB + \u7F29\u653E\u5728 .fs-card \u4E0A\uFF08\u69FD\u4F4D\uFF09\uFF0C\u89D2\u5EA6\u5728 .fs-art \u4E0A\uFF08Cover Flow \u7684\u5916\u7FFB\uFF09\u2014\u2014
    \u4E24\u8005\u5206\u5F00\uFF0C\u52A8\u753B\u65F6\u5404\u6539\u5404\u7684\u4E92\u4E0D\u8986\u76D6\uFF0C\u4F46 transition \u7528\u540C\u4E00\u6761\u66F2\u7EBF\uFF0C\u65F6\u5E8F\u5BF9\u9F50\u3002 */
  transform:translate(-50%,-50%) translateX(var(--slot,0px)) scale(var(--slot-scale,1));
  transition:transform .44s cubic-bezier(.22,.61,.36,1), opacity .3s ease;
  isolation:isolate; /* \u8BA9 ::after \u7684 z-index:-1 \u538B\u5728\u672C\u5361\u5185\u5C42\uFF0C\u4E0D\u7A7F\u900F\u5230 np \u80CC\u666F */
}
.fs-card:focus-visible{ outline:2px solid #fff9; outline-offset:6px; border-radius:var(--fs-radius); }
.fs-card:disabled{ cursor:default; }

/* \u5C01\u9762\u76D2\uFF1A**\u4E09\u5F20\u540C\u4E00\u4E2A\u5BBD\u5EA6**\uFF08--fs-cover\uFF09\uFF0C\u5927\u5C0F\u5DEE\u5F02\u5168\u90E8\u6765\u81EA --slot-scale\u3002 */
.fs-card .fs-art{
  position:relative; display:block; overflow:hidden;
  width:var(--fs-cover); aspect-ratio:1; border-radius:var(--fs-radius);
  background:#ffffff1a;
  box-shadow:0 18px 46px #000000a6, 0 2px 0 #ffffff1f inset;
  transition:transform .44s cubic-bezier(.22,.61,.36,1), opacity .34s ease, filter .34s ease, box-shadow .3s ease;
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
   \uFF08-1 \u5DE6 / 0 \u4E2D / +1 \u53F3\uFF0C\u4E00\u4E2A\u53D8\u91CF\u540C\u65F6\u9A71\u52A8 rotateY \u7684\u7B26\u53F7\u4E0E <img> \u4E4B\u5916\u7684\u8F74\u5FC3\uFF0C
   \u7701\u6389\u300C\u5DE6\u8FB9\u4E00\u5957\u3001\u53F3\u8FB9\u4E00\u5957\u300D\u7684\u955C\u50CF\u89C4\u5219 \u2014\u2014 \u955C\u50CF\u89C4\u5219\u6F0F\u6539\u4E00\u8FB9\u5C31\u662F\u9519\u4F4D\uFF09\u3002 */
.fs-card[data-off="0"]{ --slot:0px; --slot-scale:1; --fs-dir:0; z-index:3; }
.fs-card[data-off="-1"]{ --slot:calc(-1 * var(--fs-gap)); --slot-scale:.82; --fs-dir:-1; z-index:2; }
.fs-card[data-off="1"]{ --slot:var(--fs-gap); --slot-scale:.82; --fs-dir:1; z-index:2; }

/* \u4FA7\u5C01\u9762\uFF1ACover Flow \u7684\u62DB\u724C = \u5F3A\u900F\u89C6 + \u7ED5 Y \u8F74\u5916\u7FFB\u3002
   \u89D2\u5EA6\u591F\u5927\u662F\u5173\u952E \u2014\u2014 20\xB0 \u5728\u6B63\u89C6\u4E0B\u51E0\u4E4E\u770B\u4E0D\u51FA\u65CB\u8F6C\uFF0C\u6574\u6392\u5C31\u300C\u5E73\u94FA\u300D\u4E86\u3002
   perspective \u5199\u5728 transform \u9996\u4F4D\uFF08\u4F5C\u7528\u4E8E\u6B64\u5143\u7D20\u81EA\u8EAB\uFF09\uFF1B\u65CB\u8F6C\u91CF\u7531 --fs-dir \u5B9A\u7B26\u53F7\u3002 */
.fs-card[data-off="-1"] .fs-art,
.fs-card[data-off="1"] .fs-art{
  transform:perspective(1500px) rotateY(calc(var(--fs-dir) * -48deg)) translateZ(-60px);
  opacity:.74; filter:saturate(.85) brightness(.92);
}
/* \u5F53\u524D\u66F2\uFF1A**\u4E0D\u900F\u660E\u3001\u4E0D\u65CB\u8F6C\u3001\u4E0D\u538B\u6697**\u3002\u4E3B\u5361\u4E0D\u5F97\u5E26 .left/.right \u8BED\u4E49\u7C7B\uFF0C
   \u5426\u5219\u4F1A\u5403\u5230\u4FA7\u5361\u7684 transform/opacity\uFF08\u4E0A\u4E00\u7248\u4E2D\u95F4\u5C01\u9762\u53D1\u7070\u53D1\u900F\u7684\u539F\u56E0\uFF09\u3002 */
.fs-card[data-off="0"] .fs-art{ transform:none; opacity:1; filter:none; }
/* \u60AC\u505C\uFF1A\u8F6C\u5230\u63A5\u8FD1\u6B63\u9762\u5E76\u62AC\u4EAE \u2014\u2014 \u660E\u786E\u544A\u8BC9\u7528\u6237\u300C\u8FD9\u5F20\u53EF\u70B9\u300D\u3002
   \u53EA\u5728**\u975E\u52A8\u753B\u671F\u95F4**\u751F\u6548\uFF0C\u514D\u5F97\u8DDF data-to \u7684\u76EE\u6807\u6001\u62A2 transform\u3002 */
.fs-covers:not(.fs-anim-next):not(.fs-anim-prev) .fs-card[data-off="-1"]:hover .fs-art{
  transform:perspective(1500px) rotateY(26deg) translateZ(-14px); opacity:1; filter:none;
}
.fs-covers:not(.fs-anim-next):not(.fs-anim-prev) .fs-card[data-off="1"]:hover .fs-art{
  transform:perspective(1500px) rotateY(-26deg) translateZ(-14px); opacity:1; filter:none;
}
/* \u7EB5\u6DF1\u5806\u53E0\uFF1A\u4FA7\u5C01\u9762\u540E\u65B9\u518D\u53E0\u4E00\u5F20\u300C\u66F4\u5916\u4FA7\u7684\u8F6E\u5ED3\u300D\u4F2A\u5143\u7D20\uFF08\u4E0D\u5360 DOM\u3001\u4E0D\u9700\u66F4\u591A\u90BB\u66F2\uFF09\uFF0C
   \u8FD9\u662F Cover Flow\u300C\u4E00\u53E0 albums \u94FA\u5F00\u300D\u89C2\u611F\u7684\u6765\u6E90\u3002 */
.fs-card::after{
  content:""; position:absolute; inset:0; z-index:-1; border-radius:var(--fs-radius);
  background:#ffffff14; box-shadow:0 8px 24px #00000073;
  transform:perspective(1500px) translate3d(calc(var(--fs-dir,0) * 26px),0,-70px) rotateY(calc(var(--fs-dir,0) * -26deg)) scale(.9);
  opacity:0; transition:transform .44s cubic-bezier(.22,.61,.36,1), opacity .3s ease;
}
.fs-card[data-off="-1"]::after, .fs-card[data-off="1"]::after{ opacity:1; }
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
/* \u6B4C\u540D\u6761 / \u8F6C\u5411\u89D2\u6807\u53EA\u5C5E\u4E8E\u4FA7\u69FD\uFF1A\u4E2D\u95F4\u69FD\u4F4D\uFF08\u4EE5\u53CA\u52A8\u753B\u4E2D\u8F6C\u5230\u4E2D\u95F4\u7684\u90A3\u5F20\uFF09\u4E0D\u663E\u793A\u3002
   \u2014\u2014 \u4E09\u5F20\u5361\u7684 DOM \u957F\u5F97\u4E00\u6837\uFF0C\u9760\u8FD9\u91CC\u7684\u69FD\u4F4D\u65AD\u8A00\u5206\u5DE5\u3002 */
.fs-card[data-off="0"] .fs-cap, .fs-card[data-off="0"] .fs-badge,
.fs-card[data-to="0"] .fs-cap, .fs-card[data-to="0"] .fs-badge{ display:none; }
/* \u89D2\u6807\u56FE\u6807\u7EDF\u4E00\u662F\u300C\u6307\u5411\u53F3\u300D\uFF0C\u5DE6\u69FD\u955C\u50CF\uFF08\u8282\u70B9\u4F1A\u8F6C\u683C\uFF0C\u56FE\u6807\u4E0D\u80FD\u6309\u521B\u5EFA\u65F6\u7684\u69FD\u4F4D\u5199\u6B7B\uFF09 */
.fs-card[data-off="1"] .fs-badge svg, .fs-card[data-to="1"] .fs-badge svg,
.fs-card[data-to="2"] .fs-badge svg{ transform:scaleX(-1); }
.fs-card[data-off="-1"]:hover .fs-cap, .fs-card[data-off="1"]:hover .fs-cap{ opacity:1; }
.fs-card[data-off="-1"]:hover .fs-badge, .fs-card[data-off="1"]:hover .fs-badge{ opacity:.95; }
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
.fs-love svg{ width:15px; height:15px; }

/* \u2014\u2014 \u6B4C\u8BCD\uFF08\u53EA\u6709\u5355\u884C\u7248\u5F0F\uFF09\u2014\u2014
   \u53EA\u663E\u793A\u5F53\u524D\u8FD9\u4E00\u53E5\uFF08+ \u7FFB\u8BD1\uFF09\uFF0C\u4F46**\u9AD8\u5EA6\u8981\u9884\u5B9A**\uFF1A\u4E0D\u9884\u5B9A\u7684\u8BDD\uFF0C\u7FFB\u8BD1\u51FA\u73B0/\u6D88\u5931\u3001
   \u957F\u53E5\u6298\u5230\u7B2C\u4E8C\u884C\u90FD\u4F1A\u8BA9\u6574\u5757\u53D8\u9AD8 \u2192 \u4E0A\u9762\u7684\u5C01\u9762\u8DDF\u7740\u4E0A\u4E0B\u8DF3\uFF0C\u89C2\u611F\u5C31\u662F\u300C\u6B4C\u8BCD\u6324\u7740\u5C01\u9762
   \u4E00\u8D77\u6324\u300D\u3002min-height \u8986\u76D6\u300C\u4E00\u53E5\u539F\u6587 + \u4E00\u53E5\u7FFB\u8BD1\u300D\uFF0C\u5E76\u7559\u51FA\u4E0E\u6B4C\u540D\u3001\u4E0E\u63A7\u5236\u5E26\u7684
   \u547C\u5438\u8DDD\u79BB\uFF08stage \u7684 gap + \u8FD9\u91CC\u7684 margin-top\uFF09\uFF0C\u8BA9\u8FD9\u53E5\u8BDD\u843D\u5728\u5C01\u9762\u4E0B\u65B9\u3001\u63A7\u5236\u5E26\u4E0A
   \u65B9\u7684\u72EC\u7ACB\u533A\u95F4\u91CC\u3002 */
.fs-lyrics{
  flex:0 1 auto; width:min(720px,92%);
  min-height:4.3em; max-height:8.6em; overflow:hidden;
  margin-top:6px;
  display:flex; align-items:center; justify-content:center;
  text-align:center; padding:0 8px;
  font-size:calc(clamp(17px,2.1vw,26px) * var(--fs-ly-scale,1));
  font-family:var(--font-lyric,inherit);
}
.fs-ll{
  padding:.1em 4px; cursor:pointer; color:#fff; max-width:100%;
  font-size:1em; font-weight:700; line-height:1.4;
  text-shadow:0 2px 22px #00000073;
  transition:opacity .26s ease, transform .26s ease;
}
.fs-ll .t2{
  display:block; font-size:.56em; font-weight:400; opacity:.82; margin-top:.28em;
  text-shadow:0 1px 12px #00000059;
}
.fs-lyrics.no-trans .fs-ll .t2{ display:none; }
/* \u2014\u2014 \u9010\u5B57\u5355\u884C\uFF08\u5BBF\u4E3B\u6709\u9010\u5B57\u63D0\u4F9B\u5668 + \u7528\u6237\u5728\u8BBE\u7F6E\u91CC\u6CA1\u5173\u65F6\u63A5\u7BA1\uFF09\u2014\u2014
   \u590D\u7528\u5BBF\u4E3B\u5DF2\u6FC0\u6D3B\u7684\u63D0\u4F9B\u5668\uFF08AMLL\uFF09\u89E3\u6790\u597D\u7684\u8BCD\u7EA7\u884C\uFF0C\u672C\u63D2\u4EF6\u53EA\u8D1F\u8D23\u300C\u5F53\u524D\u8FD9\u4E00\u53E5\u300D\u7684\u9010\u8BCD\u67D3\u8272\u3002
   \u67D3\u8272\u505A\u6CD5\uFF1A\u6BCF\u4E2A\u8BCD\u5E95\u4E0B\u57AB\u4E00\u5C42\u540C\u5B57\u6587\u672C\u7684\u4F2A\u5143\u7D20\uFF0C\u7528 clip-path \u6309 --p \u4ECE\u5DE6\u5F80\u53F3\u63ED\u5F00 \u2014\u2014
   \u53EA\u5199\u4E00\u4E2A CSS \u53D8\u91CF\u5C31\u662F\u4E00\u4E2A\u8BCD\u7684\u8FDB\u5EA6\uFF0C\u6BD4\u9010\u8BCD\u6362 color \u5C11\u4E00\u534A\u91CD\u7ED8\uFF0C\u4E5F\u4E0D\u7528\u91CF\u4EFB\u4F55\u5750\u6807\u3002
   \u57FA\u8272\u53D6 65% \u767D\uFF08\u6697\u5E95\u4E0A\u534A\u900F\u660E\u767D\u4F4E\u4E8E .5 \u4F1A\u770B\u4E0D\u6E05\uFF09\uFF0C\u5DF2\u5531\u90E8\u5206\u8D70\u9AD8\u4EAE\uFF08\u4E3B\u8272 + \u767D\uFF0C\u522B\u62FF
   \u5C01\u9762\u539F\u8272\u5F53\u5B57\u8272\uFF0C\u6D45\u8272\u5C01\u9762\u4E0A\u4F1A\u7CCA\uFF09\u3002 */
.fs-ll.kara{ font-weight:800; }
.fs-ll .kw{ position:relative; white-space:pre; color:#ffffffa6; }
.fs-ll .kw::after{
  content:attr(data-t); position:absolute; left:0; top:0; white-space:pre;
  color:color-mix(in srgb, var(--fs-acc) 45%, #fff);
  clip-path:inset(0 calc((1 - var(--p,0)) * 100%) 0 0);
}
.fs-ly-empty{ text-align:center; color:#ffffff7a; font-size:13px; padding:8px 0; }

/* \u2014\u2014 \u5207\u6B4C\u52A8\u753B\uFF08Cover Flow \u7684\u7075\u9B42\uFF09\u2014\u2014
   \u4E09\u5F20\u5361\uFF08-1 / 0 / +1\uFF09\u6574\u6392\u5E73\u79FB\u4E00\u683C\uFF1A
     \u4E0B\u4E00\u9996\uFF08\u65B9\u5411 +1\uFF0C\u76EE\u6807\u69FD\u4F4D = \u5F53\u524D offset **\u51CF** 1\uFF09\uFF1A
       +1 \u2192 0  \u8F6C\u6B63\u3001\u653E\u5927\u3001\u6210\u65B0\u4E2D\u95F4\uFF08\u4E0B\u4E00\u9996\u672C\u6765\u5C31\u5728\u53F3\u8FB9\uFF0C\u6EDA\u8FDB\u6765\uFF09
        0 \u2192 -1 \u5411\u5DE6\u8F6C\u51FA\u3001\u540E\u9000\u3001\u538B\u6697\uFF08\u73B0\u5728\u7684\u5C01\u9762\u7ED9\u4E0B\u4E00\u9996\u8BA9\u4F4D\uFF09
       -1 \u2192 -2 \u7EE7\u7EED\u5DE6\u79FB\u3001\u6DE1\u51FA\uFF08\u5B83\u5DF2\u7ECF\u662F\u300C\u4E0A\u4E0A\u9996\u300D\uFF0C\u79BB\u5F00\u89C6\u91CE\uFF09
     \u4E0A\u4E00\u9996\u955C\u50CF\u3002

   \u69FD\u4F4D\u7528 --slot / --slot-scale / --fs-dir \u8868\u8FBE\uFF0CJS \u53EA\u9700\u5728\u52A8\u753B\u671F\u95F4\u628A\u6BCF\u5F20\u5361\u7684
   **\u76EE\u6807\u69FD\u4F4D**\u5199\u8FDB data-to\uFF0C\u7531\u5C5E\u6027\u9009\u62E9\u5668\u6362\u4E0A\u4E00\u6574\u5957\uFF08\u4F4D\u79FB+\u7F29\u653E+\u89D2\u5EA6+\u900F\u660E\u5EA6\uFF09\u3002
   \u597D\u5904\uFF1A\u4E0D\u7528\u5728 JS \u91CC\u91CF\u5750\u6807\uFF08\u95F4\u8DDD\u968F\u5C3A\u5BF8\u53D8\uFF0C\u7B97\u4E0D\u51C6\uFF09\uFF0C\u4E14\u4F4D\u79FB\u4E0E\u89D2\u5EA6\u5171\u7528\u540C\u4E00\u6761
   transition \u66F2\u7EBF\uFF0C\u4E0D\u4F1A\u300C\u4F4D\u79FB\u8D70\u4E86\u3001\u89D2\u5EA6\u8FD8\u6CA1\u5230\u300D\u3002

   \u8FD9\u4E00\u7EC4\u89C4\u5219\u5BF9 \xB1\u65B9\u5411\u662F**\u540C\u4E00\u5957**\uFF08\u76EE\u6807\u69FD\u4F4D\u672C\u8EAB\u5C31\u5E26\u7B26\u53F7\uFF09\uFF0C\u4E0D\u518D\u5199 anim-next /
   anim-prev \u4E24\u4EFD\u955C\u50CF \u2014\u2014 \u4E24\u4EFD\u955C\u50CF\u5FC5\u7136\u6F0F\u6539\u4E00\u8FB9\u3002 */
.fs-card[data-to="0"]{ --slot:0px; --slot-scale:1; --fs-dir:0; z-index:3; }
.fs-card[data-to="-1"]{ --slot:calc(-1 * var(--fs-gap)); --slot-scale:.82; --fs-dir:-1; z-index:2; }
.fs-card[data-to="1"]{ --slot:var(--fs-gap); --slot-scale:.82; --fs-dir:1; z-index:2; }
.fs-card[data-to="-2"]{ --slot:calc(-2.1 * var(--fs-gap)); --slot-scale:.64; --fs-dir:-1; z-index:1; opacity:0; pointer-events:none; }
.fs-card[data-to="2"]{ --slot:calc(2.1 * var(--fs-gap)); --slot-scale:.64; --fs-dir:1; z-index:1; opacity:0; pointer-events:none; }
.fs-card[data-to] .fs-art{ transform:perspective(1500px) rotateY(calc(var(--fs-dir) * -48deg)) translateZ(-60px); opacity:.74; filter:saturate(.85) brightness(.92); }
.fs-card[data-to="0"] .fs-art{ transform:none; opacity:1; filter:none; }
.fs-card[data-to]::after{ opacity:1; }
/* \u8F6C\u5230\u4E2D\u95F4\u7684\u90A3\u5F20\u4E0D\u80FD\u62D6\u7740\u81EA\u5DF1\u7684\u5806\u53E0\u8F6E\u5ED3\u8D70\uFF08\u8F6E\u5ED3\u5C5E\u4E8E\u4FA7\u5361\uFF09 */
.fs-card[data-to="0"]::after{ opacity:0; }
/* \u300C\u77AC\u79FB\u300D\u7528\uFF1A\u51FA\u753B\u7684\u90A3\u5F20\u8981\u7ED5\u5230\u5BF9\u4FA7\u53BB\u5F53\u65B0\u90BB\u66F2\u3002\u4F4D\u79FB\u5FC5\u987B\u77AC\u95F4\u5B8C\u6210\uFF08\u5426\u5219\u4F1A\u6A2A\u7A7F\u6574\u6392\uFF09\uFF0C
   \u4F46\u900F\u660E\u5EA6\u7167\u5E38\u8FC7\u6E21 \u2014\u2014 \u5B83\u662F\u5728\u4E0D\u53EF\u89C1\u72B6\u6001\u4E0B\u6362\u597D\u56FE\u518D\u6DE1\u5165\u7684\u3002 */
.fs-card.fs-hop{ transition:opacity .3s ease; }
.fs-card.fs-hop .fs-art{ transition:opacity .34s ease, filter .34s ease; }
.fs-card.fs-hop::after{ transition:opacity .3s ease; }

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
/* \u5F39\u51FA\u5C42\uFF08\u97F3\u8D28 / \u66F4\u591A\u9009\u9879\u5171\u7528\u4E00\u5957\u73BB\u7483\u8BED\u8A00\uFF1Btop \u6216 bottom \u7531\u5404\u81EA\u7684 wrap \u51B3\u5B9A\uFF09 */
.fs-pop{
  position:absolute; min-width:186px; padding:6px;
  border-radius:12px; background:#10131cd9; border:1px solid #ffffff1f; box-shadow:0 14px 40px #0007;
  backdrop-filter:blur(24px) saturate(1.5); -webkit-backdrop-filter:blur(24px) saturate(1.5);
  display:none; flex-direction:column; gap:1px; z-index:6;
}
.fs-pop.open{ display:flex; }
.fs-qpop{ right:0; bottom:calc(100% + 8px); }
.fs-mwrap{ position:relative; }
.fs-mmenu{ left:0; top:calc(100% + 8px); min-width:224px; }
.fs-qi{
  display:flex; align-items:center; justify-content:space-between; gap:12px;
  padding:7px 9px; border:0; border-radius:8px; cursor:pointer; font:inherit; font-size:12.5px;
  background:transparent; color:#ffffffe0; text-align:left; width:100%;
}
.fs-qi:hover{ background:#ffffff17; color:#fff; }
.fs-qi.sel{ background:color-mix(in srgb, var(--fs-acc) 30%, transparent); color:#fff; font-weight:700; }
.fs-qi em{ font-style:normal; font-size:11px; color:#ffffff8f; }
.fs-qempty{ padding:9px 10px; font-size:12px; color:#ffffff8f; }
/* \u8DF3\u8F6C\u4E09\u9879\uFF08\u540C\u540D\u641C\u7D22 / \u8DF3\u8F6C\u6B4C\u624B / \u8DF3\u8F6C\u4E13\u8F91\uFF09\u6BCF\u6B21\u5F00\u83DC\u5355\u6309\u5F53\u524D\u66F2\u73B0\u7B97\uFF0C\u6240\u4EE5\u662F\u52A8\u6001\u586B\u7684\uFF1B
   \u591A\u6B4C\u624B\u65F6\u9010\u9879\u5217\u51FA\uFF0C\u7F3A mid \u7684\u9879\u7981\u7528 \u2014\u2014 \u53E3\u5F84\u540C\u5BBF\u4E3B\u6B63\u5728\u64AD\u653E\u9875\u7684 \u22EE \u83DC\u5355\u3002 */
.fs-mjump{ display:flex; flex-direction:column; gap:1px; }
.fs-mjump:empty{ display:none; }
.fs-msep{ height:1px; margin:5px 6px; background:#ffffff1a; }
/* \u66F4\u591A\u9009\u9879\u91CC\u7684\u300C\u5F00\u5173\u884C\u300D\u4E0E\u300C\u6B4C\u8BCD\u5927\u5C0F\u884C\u300D */
.fs-mrow{ display:flex; align-items:center; justify-content:space-between; gap:12px; padding:7px 9px; border-radius:8px; font-size:12.5px; color:#ffffffe0; cursor:pointer; }
.fs-mrow:hover{ background:#ffffff17; color:#fff; }
.fs-mrow input{ position:absolute; opacity:0; pointer-events:none; }
.fs-sw{ position:relative; flex:0 0 auto; width:30px; height:16px; border-radius:999px; background:#ffffff2e; transition:background .16s ease; }
.fs-sw::after{ content:""; position:absolute; top:2px; left:2px; width:12px; height:12px; border-radius:50%; background:#fff; transition:transform .16s ease; }
.fs-mrow input:checked + .fs-sw{ background:color-mix(in srgb, var(--fs-acc) 55%, #0b0e19); }
.fs-mrow input:checked + .fs-sw::after{ transform:translateX(14px); }
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
  .fs-card, .fs-card .fs-art, .fs-card::after{ transition:none; }
  .fs-line.over > span{ animation:none; }
  .fs-ll{ transition:none; }
  .fs-title.fs-anim-next,.fs-title.fs-anim-prev,
  .fs-artist.fs-anim-next,.fs-artist.fs-anim-prev,
  .fs-album.fs-anim-next,.fs-album.fs-anim-prev{ animation:none; }
}
`;function Tt(){if(document.querySelector("style[data-sparkle-css='flowscape']"))return;let a=document.createElement("style");a.dataset.sparkleCss="flowscape",a.textContent=St,document.head.append(a)}var ie=null,ae=.8,oe=1.5;function Et(a,n){a.classList.add("fs-root");let v=[-1,0,1],y=e=>{let t=e===0;return`<button class="fs-card${t?" main":` side ${e<0?"left":"right"}`}" data-off="${e}"
        type="button" aria-label="${t?"\u64AD\u653E/\u6682\u505C":e<0?"\u4E0A\u4E00\u9996":"\u4E0B\u4E00\u9996"}">
        <span class="fs-art"><span class="fs-ph"></span><img alt="" decoding="async"/>
          <span class="fs-badge">${b('<path d="M10 6l6 6-6 6"/>','width="11" height="11"')}</span>
          <span class="fs-cap"></span>
          ${t?`<span class="fs-spin">${b('<path d="M12 3a9 9 0 1 1-6.4 2.6" stroke-width="2.4"/>','width="30" height="30"')}</span>
          <span class="fs-veil"></span><span class="fs-err"></span>`:""}</span>
      </button>`};a.innerHTML=`
    <div class="fs-top">
      <button class="fs-iconbtn" id="fs-collapse" type="button" title="\u6536\u8D77\u6B63\u5728\u64AD\u653E\u9875" aria-label="\u6536\u8D77\u6B63\u5728\u64AD\u653E\u9875">${g.collapse}</button>
      <div class="fs-mwrap">
        <button class="fs-iconbtn" id="fs-more" type="button" title="\u66F4\u591A\u9009\u9879" aria-label="\u66F4\u591A\u9009\u9879" aria-haspopup="menu" aria-expanded="false">${g.more}</button>
        <div class="fs-pop fs-mmenu" id="fs-mmenu" role="menu">
          <div id="fs-mjump"></div>
          <div class="fs-msep"></div>
          <label class="fs-mrow" for="fs-mtrans"><span>\u7FFB\u8BD1\u6B4C\u8BCD</span><input type="checkbox" id="fs-mtrans"><span class="fs-sw" aria-hidden="true"></span></label>
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
    </div>
    <div class="fs-stage">
      <div class="fs-covers" id="fs-covers">${v.map(y).join("")}</div>
      <div class="fs-meta">
        <div class="fs-titlewrap">
          <div class="fs-line fs-title" id="fs-title"><span></span></div>
          <button class="fs-love" id="fs-love" type="button" aria-label="\u6536\u85CF" title="\u6536\u85CF"></button>
        </div>
        <div class="fs-line fs-artist" id="fs-artist"><span></span></div>
        <div class="fs-line fs-album" id="fs-album"><span></span></div>
      </div>
      <div class="fs-lyrics" id="fs-lyrics"></div>
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
          <div class="fs-qwrap">
            <button class="fs-qbtn" id="fs-qbtn" type="button" aria-haspopup="menu" aria-expanded="false" title="\u97F3\u8D28\uFF08\u672C\u4F1A\u8BDD\u751F\u6548\uFF09">\u97F3\u8D28</button>
            <div class="fs-pop fs-qpop" id="fs-qpop" role="menu" aria-label="\u97F3\u8D28"></div>
          </div>
        </div>
      </div>
    </div>`;let r=e=>a.querySelector("#"+e),f=[...a.querySelectorAll(".fs-card[data-off]")],re=new Map,$e=()=>{re.clear();for(let e of f)re.set(Number(e.dataset.off),e)};$e();let fe=e=>re.get(e),_=r("fs-covers"),w=fe(0),rt=w.querySelector(".fs-spin"),ze=w.querySelector(".fs-veil"),Ae=w.querySelector(".fs-err"),ft=()=>{let e=fe(0);if(e!==w){for(let t of f)t.classList.remove("loading","has-err");w=e,e.querySelector(".fs-art").append(rt,ze,Ae)}},B=r("fs-title"),P=r("fs-artist"),j=r("fs-album"),J=r("fs-love"),c=r("fs-lyrics"),p=r("fs-track"),N=r("fs-cur"),W=r("fs-dur"),le=r("fs-mute"),k=r("fs-vol"),ce=r("fs-volnum"),Q=r("fs-qbtn"),D=r("fs-qpop"),lt=r("fs-collapse"),pe=r("fs-more"),Be=r("fs-mmenu"),de=r("fs-mtrans"),ct=r("fs-ly-val"),Pe=r("fs-ly-dec"),je=r("fs-ly-inc"),pt=r("fs-mcollapse"),H=r("fs-mjump"),Ne="",h=He(Number(ie?.get("lyscale"))||1,ae,oe),De=e=>{let t=fe(e===0?0:e<0?-1:1).querySelector(".fs-art"),s=Math.max(64,Math.round(t.offsetWidth||(e===0?300:160))),o=Math.min(3,window.devicePixelRatio||1);return s*o},Fe=[{btn:Q,pop:D},{btn:pe,pop:Be}],Ie=e=>{let t=e.target;for(let s of Fe)if(s.pop.contains(t)||s.btn.contains(t))return;L()},L=()=>{for(let e of Fe)e.pop.classList.remove("open"),e.btn.classList.remove("open"),e.btn.setAttribute("aria-expanded","false");document.removeEventListener("pointerdown",Ie,!0)},Re=(e,t)=>{if(t.classList.contains("open")){L();return}L(),t.classList.add("open"),e.classList.add("open"),e.setAttribute("aria-expanded","true"),document.addEventListener("pointerdown",Ie,!0)},dt=140,me=e=>{L(),window.setTimeout(()=>{n.collapse(),location.hash=e},dt)},F=(e,t,s)=>{let o=document.createElement("button");return o.type="button",o.className="fs-qi",o.innerHTML=`<span>${A(e)}</span>`,o.disabled=t,s&&(o.onclick=s),o},mt=()=>{let e=n.current();if(H.innerHTML="",!e){let i=document.createElement("div");i.className="fs-qempty",i.textContent="\u672A\u5728\u64AD\u653E",H.append(i);return}H.append(F("\u540C\u540D\u641C\u7D22",!1,()=>me(`#/search?keyword=${encodeURIComponent(e.name)}`)));let t=(e.singer??[]).filter(i=>!!i.mid);t.length||H.append(F("\u8DF3\u8F6C\u6B4C\u624B",!0));for(let i of t)H.append(F(t.length>1?`\u8DF3\u8F6C\u6B4C\u624B\uFF1A${i.name}`:"\u8DF3\u8F6C\u6B4C\u624B",!1,()=>me(`#/singer?mid=${encodeURIComponent(i.mid)}&name=${encodeURIComponent(i.name)}`)));let s=e.album,o=!!(s?.mid||s?.pmid);H.append(o?F("\u8DF3\u8F6C\u4E13\u8F91",!1,()=>{let i=String(s.pmid||s.mid).split("_")[0];me(`#/album?mid=${encodeURIComponent(s.mid??i)}&name=${encodeURIComponent(s.name||"\u4E13\u8F91")}`)}):F("\u8DF3\u8F6C\u4E13\u8F91",!0))};Q.onclick=()=>Re(Q,D),pe.onclick=()=>{mt(),Re(pe,Be)};let Ye=[{box:B,inner:B.querySelector("span"),sig:""},{box:P,inner:P.querySelector("span"),sig:""},{box:j,inner:j.querySelector("span"),sig:""}],ue=()=>{for(let e of Ye){if(!e.sig)continue;let t=e.inner.scrollWidth-e.box.clientWidth;e.box.classList.toggle("over",t>1),t>1&&(e.box.style.setProperty("--fs-mx",`${-t}px`),e.box.style.setProperty("--fs-md",`${Math.max(5,Math.round((t+20)/26))}s`))}},Z=new ResizeObserver(ue);Z.observe(B),Z.observe(P),Z.observe(j);let ge=(e,t)=>{let s=Ye[e];t!==s.sig&&(s.sig=t,s.inner.textContent=t,s.box.classList.remove("over"),ue())};for(let e of f)e.onclick=()=>{if(K)return;let t=Number(e.dataset.off);t===0?n.toggle():n.jumpTo(t)};J.onclick=e=>{e.stopPropagation(),n.toggleLove()},le.onclick=()=>n.toggleMute(),lt.onclick=()=>n.collapse(),pt.onclick=()=>{L(),n.collapse()},de.onchange=()=>n.toggleTrans();let ve=()=>{a.style.setProperty("--fs-ly-scale",h.toFixed(2)),ct.textContent=`${Math.round(h*100)}%`,Pe.disabled=h<=ae+1e-6,je.disabled=h>=oe-1e-6,ie?.set("lyscale",h.toFixed(2)),ue()};Pe.onclick=()=>{h=He(h-.05,ae,oe),ve()},je.onclick=()=>{h=He(h+.05,ae,oe),ve()},ve(),p.onkeydown=e=>{e.key==="ArrowLeft"?(e.preventDefault(),n.seek(Math.max(0,n.time()-5))):e.key==="ArrowRight"&&(e.preventDefault(),n.seek(n.time()+5))},k.onkeydown=e=>{e.key==="ArrowLeft"||e.key==="ArrowDown"?(e.preventDefault(),n.setVolume(n.volume()-.05)):(e.key==="ArrowRight"||e.key==="ArrowUp")&&(e.preventDefault(),n.setVolume(n.volume()+.05))};let G=(e,t)=>ot((e.clientX-t.getBoundingClientRect().left)/Math.max(1,t.getBoundingClientRect().width)),I=0,R="",ee=e=>{I=G(e,p),p.style.setProperty("--fs-pf",String(I)),N.textContent=qe(I*n.duration())},q=()=>{window.removeEventListener("pointermove",ee),window.removeEventListener("pointerup",q),window.removeEventListener("pointercancel",q),p.classList.remove("scrub"),n.seek(I*n.duration()),R=""};p.addEventListener("pointerdown",e=>{n.duration()&&(e.preventDefault(),p.classList.add("scrub"),I=G(e,p),ee(e),window.addEventListener("pointermove",ee),window.addEventListener("pointerup",q),window.addEventListener("pointercancel",q))}),p.addEventListener("keydown",e=>{if(e.key==="Home")e.preventDefault(),n.seek(0);else if(e.key==="End"){e.preventDefault();let t=n.duration();t&&n.seek(t-1)}});let Y=0,he=!1,te=e=>{Y=G(e,k),k.style.setProperty("--fs-v",String(Y)),ce.textContent=`${Math.round(Y*100)}%`},C=()=>{window.removeEventListener("pointermove",te),window.removeEventListener("pointerup",C),window.removeEventListener("pointercancel",C),he=!1,n.setVolume(Y)};k.addEventListener("pointerdown",e=>{e.preventDefault(),he=!0,Y=G(e,k),te(e),window.addEventListener("pointermove",te),window.addEventListener("pointerup",C),window.addEventListener("pointercancel",C)});let M=[],V=[],S=-1,be=null,xe=!1,T=[],$=[],ye=null,ut=e=>{let t=n.lyricState(),s=n.karaokeActive(),o=`${e?.mid??""}|${t}|${n.showTrans()?1:0}|${s?"k":"l"}`;if(o===Ne)return;if(Ne=o,S=-1,be=null,ye=null,xe=s,T=s?n.karaoke():[],M=s?[]:n.lyrics(),V=[],$=[],!e){c.innerHTML='<div class="fs-ly-empty">\u672A\u5728\u64AD\u653E</div>';return}let i=xe?T.length:M.length;if(t==="loading"||t==="idle"&&!i){c.innerHTML='<div class="fs-ly-empty">\u6B4C\u8BCD\u52A0\u8F7D\u4E2D\u2026</div>';return}if(!i){c.innerHTML='<div class="fs-ly-empty">\u6682\u65E0\u6B4C\u8BCD</div>';return}c.innerHTML=""},Ve=e=>{let t=e>=0?M[e]:void 0,s=t?`${t.t}|${t.text}|${t.trans??""}`:"empty";if(s!==be){if(be=s,!t){c.innerHTML=M.length?"":'<div class="fs-ly-empty">\u6682\u65E0\u6B4C\u8BCD</div>',V=[];return}c.innerHTML=`<div class="fs-ll cur" title="\u70B9\u51FB\u8DF3\u5230\u8FD9\u4E00\u53E5"><span class="t1">${A(t.text)}</span>${t.trans&&n.showTrans()?`<span class="t2">${A(t.trans)}</span>`:""}</div>`,V=[...c.querySelectorAll(".fs-ll")],V[0]&&(V[0].onclick=()=>{n.seek(t.t)})}},gt=e=>{let t=e>=0?T[e]:void 0,s=t?`${t.startTime}|${t.words.map(i=>i.word).join("")}|${t.translatedLyric??""}`:"empty";if(s===ye)return;if(ye=s,!t){c.innerHTML=T.length?"":'<div class="fs-ly-empty">\u6682\u65E0\u6B4C\u8BCD</div>',$=[];return}c.innerHTML=`<div class="fs-ll kara" title="\u70B9\u51FB\u8DF3\u5230\u8FD9\u4E00\u53E5">${t.words.map(()=>'<span class="kw"></span>').join("")}${t.translatedLyric&&n.showTrans()?`<span class="t2">${A(t.translatedLyric)}</span>`:""}</div>`,$=[...c.querySelectorAll(".kw")],t.words.forEach((i,l)=>{let d=$[l];d&&(d.textContent=i.word,d.dataset.t=i.word)});let o=c.querySelector(".fs-ll");o&&(o.onclick=()=>n.seek(t.startTime/1e3))},vt=(e,t)=>{for(let s=0;s<$.length;s++){let o=e.words[s],i=$[s];if(!o||!i)continue;let l=Math.max(1,o.endTime-o.startTime),d=t>=o.endTime?1:t<=o.startTime?0:(t-o.startTime)/l,m=Math.round(d*50)/50;i.dataset.p!==String(m)&&(i.dataset.p=String(m),i.style.setProperty("--p",String(m)))}},Ke="",Oe="",Ue="",Xe="",_e="",Je="";for(let e of f){let t=e.querySelector("img"),s=e.querySelector(".fs-ph");t.onerror=()=>{t.removeAttribute("src"),t.style.display="none",s.style.display=""}}let ht=(e,t,s)=>{if(!s){e.removeAttribute("src"),e.style.display="none",t.style.display="";return}t.style.display="none",e.getAttribute("src")!==s&&(e.src=s,e.style.display="")},We=new Set,we=(e,t)=>{let s=it(e,De(t));if(!s||We.has(s))return;We.add(s);let o=new Image;o.decoding="async",o.src=s},ke=new Map,se="",Le="",Me="",K=!1,Qe=1,Se=0,bt=e=>{_.classList.remove("fs-anim-next","fs-anim-prev");for(let s of[B,P,j])s.classList.remove("fs-anim-next","fs-anim-prev");let t=null;for(let s of f){s.removeAttribute("data-to");let o=Number(s.dataset.off)-e;o<-1?(s.dataset.off="1",t=s):o>1?(s.dataset.off="-1",t=s):s.dataset.off=String(o)}if(t){let s=t;s.classList.add("fs-hop"),requestAnimationFrame(()=>requestAnimationFrame(()=>s.classList.remove("fs-hop")))}$e(),ft(),ke.clear(),K=!1,Te()},Ze=e=>{Qe=e,K=!0,we(n.songAt(1),1),we(n.songAt(-1),-1);let t=e>0?"fs-anim-next":"fs-anim-prev";_.classList.remove("fs-anim-next","fs-anim-prev"),_.offsetWidth;for(let s of f)s.dataset.to=String(Number(s.dataset.off)-e);_.classList.add(t);for(let s of[B,P,j])s.classList.add(t);window.clearTimeout(Se),Se=window.setTimeout(()=>{a.isConnected&&bt(Qe)},Mt)},xt=e=>{if(e&&!K&&se&&e.mid!==se&&(e.mid===Me?Ze(1):e.mid===Le&&Ze(-1)),e?(se=e.mid,Me=n.songAt(1)?.mid??"",Le=n.songAt(-1)?.mid??""):(se="",Me="",Le=""),!K){for(let t of[-1,1,-2,2])we(n.songAt(t),t);for(let t of f){let s=Number(t.dataset.off),o=t.querySelector("img"),i=t.querySelector(".fs-ph"),l=t.querySelector(".fs-cap"),d=s===0?"\u64AD\u653E/\u6682\u505C":s<0?"\u4E0A\u4E00\u9996":"\u4E0B\u4E00\u9996";t.getAttribute("aria-label")!==d&&t.setAttribute("aria-label",d);let m=s===0?e:n.songAt(s),O=it(m,De(s)),U=m?.name??"",E=O+"|"+U;ke.get(s)!==E&&(ke.set(s,E),ht(o,i,O),l&&(l.textContent=U),t.classList.toggle("empty",!m),t.disabled=!m)}}ge(0,e?.name??"\u672A\u5728\u64AD\u653E"),ge(1,Lt(e)||"\u672A\u77E5\u6B4C\u624B"),ge(2,e?.album?.name||"")},Te=()=>{let e=n.current();xt(e),ut(e);let t=n.loading(),s=n.error();w.classList.toggle("loading",t),w.classList.toggle("has-err",!!s&&!t),s!==Je&&(Je=s,Ae.textContent=s);let o=t?"load":s?"err":n.paused()?"paused":"playing";o!==Ke&&(Ke=o,ze.innerHTML=s?b('<path d="M20 12a8 8 0 1 1-2.6-5.9M20 4v4.5h-4.5" stroke-width="2"/>','width="30" height="30"'):o==="paused"?g.play:g.pause);let i=n.muted()?0:n.volume();if(!he){let x=Math.round(i*100);k.style.setProperty("--fs-v",String(i)),ce.textContent!==`${x}%`&&(ce.textContent=`${x}%`)}le.classList.toggle("on",n.muted()||i===0);let l=`${Math.round(i*100)}|${n.muted()?1:0}`;l!==Oe&&(Oe=l,le.innerHTML=n.muted()||i===0?g.volMute:i<.34?g.volLow:i<.67?g.volMid:g.volHigh),k.setAttribute("aria-valuenow",String(Math.round(i*100)));let d=n.qualityLabel();d!==Ue&&(Ue=d,Q.textContent=d);let m=n.qualityTiers(),O=n.quality(),U=m.map(x=>x.id+(x.locked?"!":"")).join(",")+"|"+O;if(U!==Xe){Xe=U,D.innerHTML="";let x=(u,wt,nt="")=>{let X=document.createElement("button");X.type="button",X.className="fs-qi"+(O===u?" sel":""),X.innerHTML=`<span>${A(wt)}</span>${nt?`<em>${A(nt)}</em>`:""}`,X.onclick=()=>{n.switchQuality(u),L()},D.append(X)};if(x("auto","\u81EA\u52A8","\u6700\u9AD8\u53EF\u64AD"),m.length)for(let u of m)x(u.id,u.label,u.locked?"\u{1F512} \u81EA\u52A8\u56DE\u9000":"");else{let u=document.createElement("div");u.className="fs-qempty",u.textContent="\u6863\u4F4D\u8BFB\u53D6\u4E2D\u2026",D.append(u)}}let E=!!e&&n.loved(e.mid),st=`${e?.mid??""}|${E?1:0}`;st!==_e&&(_e=st,J.classList.toggle("on",E),J.innerHTML=E?g.heartFill:g.heart,J.title=E?"\u53D6\u6D88\u6536\u85CF":"\u6536\u85CF\u8FD9\u9996\u6B4C");let Ee=n.showTrans();de.checked!==Ee&&(de.checked=Ee),c.classList.toggle("no-trans",!Ee)},Ge=()=>{let e=n.time(),t=n.duration();if(t<=0){R!=="0"&&(R="0",p.style.setProperty("--fs-pf","0"),N.textContent!=="0:00"&&(N.textContent="0:00"),W.textContent!=="0:00"&&(W.textContent="0:00"));return}let s=ot(e/t);if(!p.classList.contains("scrub")){p.style.setProperty("--fs-pf",s.toFixed(4));let i=qe(e);N.textContent!==i&&(N.textContent=i);let l=Math.round(s*100);R!==String(l)&&(R=String(l),p.setAttribute("aria-valuenow",String(l)))}let o=qe(t);W.textContent!==o&&(W.textContent=o)},z=0,ne=!1,et=()=>{if(z=0,!n.expanded()||!a.isConnected){ne=!1;return}if(xe){let e=(n.time()+.2)*1e3,t=-1;for(let s=0;s<T.length&&T[s].startTime<=e;s++)t=s;t!==S&&(S=t,gt(t)),t>=0&&vt(T[t],e)}else if(M.length){let e=n.time()+.2,t=-1;for(let s=0;s<M.length&&M[s].t<=e;s++)t=s;t!==S&&(S=t,Ve(t))}else S!==-1&&(S=-1,Ve(-1));Ge(),z=window.requestAnimationFrame(et)},tt=()=>{n.expanded()&&!ne&&a.isConnected&&(ne=!0,z=window.requestAnimationFrame(et))},yt=n.onNotify(()=>{Te(),tt()});return Te(),Ge(),tt(),()=>{yt(),window.clearTimeout(Se),z&&window.cancelAnimationFrame(z),z=0,ne=!1,Z.disconnect(),L(),window.removeEventListener("pointermove",ee),window.removeEventListener("pointerup",q),window.removeEventListener("pointercancel",q),window.removeEventListener("pointermove",te),window.removeEventListener("pointerup",C),window.removeEventListener("pointercancel",C),a.innerHTML=""}}var $t=at({id:"flowscape",name:"Flowscape \u6D41\u5883",version:"1.2.0",author:"Team Quaver",kind:"third-party",description:"\u628A\u6B63\u5728\u64AD\u653E\u9875\u53D8\u6210\u4E13\u8F91\u6D41\uFF1A\u4E2D\u95F4\u5927\u5C01\u9762\u3001\u5DE6\u53F3\u76F8\u90BB\u5C01\u9762\u70B9\u5207\u6B4C\uFF0C\u4E0B\u65B9\u6B4C\u540D/\u6B4C\u624B/\u4E13\u8F91/\u5F53\u524D\u8FD9\u4E00\u53E5\u6B4C\u8BCD\uFF0C\u5E95\u90E8\u81EA\u7ED8\u8FDB\u5EA6\u6761\u3001\u97F3\u91CF\u4E0E\u97F3\u8D28",setup(a){Tt(),ie=a.storage;let n=()=>a.storage.get("flow")!=="off";return a.registerNowPlayingView({id:"flowscape",enabled:n,render:Et}),a.registerSettingsSection({id:"flowscape-main",title:"\u6D41\u5883\u6A21\u5F0F",render(v){v.innerHTML=`
          <div class="set-label">\u63A5\u7BA1\u6B63\u5728\u64AD\u653E\u9875 <span class="set-note-inline">\u5F00\u542F\u540E\u5728\u6B63\u5728\u64AD\u653E\u9875\u91CC\u9690\u85CF\u539F\u64AD\u653E\u6761\uFF0C\u63A7\u5236\u4E0E\u8FDB\u5EA6\u6539\u7531\u6D41\u5883\u81EA\u7ED8</span></div>
          <div class="opt-cards">
            <button class="opt-card" data-opt="on" type="button">\u5F00\u542F</button>
            <button class="opt-card" data-opt="off" type="button">\u5173\u95ED</button>
          </div>
          <p class="muted set-hint">\u6D41\u5883\u63A5\u7BA1\u6574\u4E2A\u6B63\u5728\u64AD\u653E\u9875\uFF1A\u5C01\u9762\u5728\u4E2D\u95F4\uFF0C\u4E0A\u4E00\u9996\u5728\u5DE6\u3001\u4E0B\u4E00\u9996\u5728\u53F3\uFF08\u70B9\u4FA7\u5C01\u9762\u76F4\u63A5\u8DF3\u5230\u90A3\u4E00\u9996\uFF09\uFF0C\u4E0B\u65B9\u662F\u6B4C\u540D\u3001\u6B4C\u624B\u3001\u4E13\u8F91\u4E0E\u5F53\u524D\u8FD9\u4E00\u53E5\u6B4C\u8BCD\uFF08\u70B9\u6B4C\u8BCD\u8DF3\u64AD\uFF09\u3002\u5E95\u90E8\u81EA\u7ED8\u8FDB\u5EA6\u6761\uFF08\u53EF\u62D6\u62FD\uFF09\u3001\u97F3\u91CF\u4E0E\u97F3\u8D28\uFF1B\u5DE6\u4E0A\u89D2\u662F\u300C\u6536\u8D77\u300D\u4E0E\u300C\u66F4\u591A\u9009\u9879\u300D\u2014\u2014 \u63A5\u7BA1\u65F6\u539F\u64AD\u653E\u6761\u4F1A\u88AB\u9690\u85CF\uFF0C\u4E0D\u4ECE\u8FD9\u91CC\u6536\u8D77\u5C31\u53EA\u80FD\u6309 ESC \u4E86\u3002\u505C\u7528\u672C\u63D2\u4EF6\u6216\u5173\u6389\u4E0A\u9762\u7684\u5F00\u5173\uFF0C\u5373\u56DE\u5230\u9ED8\u8BA4\u6B63\u5728\u64AD\u653E\u9875\u3002</p>`;let y=[...v.querySelectorAll("[data-opt]")],r=()=>y.forEach(f=>f.classList.toggle("sel",f.dataset.opt==="on"===n()));y.forEach(f=>{f.onclick=()=>{a.storage.set("flow",f.dataset.opt==="off"?"off":"on"),r()}}),r()}}),()=>{ie=null,document.querySelector("style[data-sparkle-css='flowscape']")?.remove()}}});export{$t as default};
