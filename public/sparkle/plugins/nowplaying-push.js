var f=t=>t;var w="\u{1F3B5} \u6B63\u5728\u6536\u542C\uFF1A{title} - {artists}",v=15e3,S={title:"NowPlaying \u63A8\u9001\u6D4B\u8BD5",artists:"Team Quaver",album:"Quaver Music",cover:"",duration:0,mid:"",source:"online"},n=t=>String(t??"").trim(),l=(t,e)=>t.length>e?t.slice(0,Math.max(0,e-1))+"\u2026":t,k=t=>(t.singer??[]).map(e=>n(e?.name)).filter(Boolean).join(" / "),T=t=>{let e=n(t);return/^https?:\/\//i.test(e)?e:""},P=t=>{let e=T(t.localCover);if(e)return e;let o=n(t.album?.pmid),r=o?o.split("_")[0]:n(t.album?.mid);return r?`https://y.gtimg.cn/music/photo_new/T002R500x500M000${r}.jpg`:""},g=t=>({title:n(t.name)||"\u672A\u77E5\u6B4C\u66F2",artists:k(t)||"\u672A\u77E5\u6B4C\u624B",album:n(t.album?.name),cover:P(t),duration:Math.max(0,Math.round(Number(t.interval)||0)),mid:n(t.mid),source:t.src==="local"||t.src==="nas"?t.src:"online"}),E=t=>{let e=g(t);return`${e.source}|${e.mid}|${e.title}|${e.artists}|${e.album}`},_=(t,e)=>{let o={title:e.title,artists:e.artists,album:e.album};return String(t||"").replace(/\{(title|artists|album)\}/g,(r,s)=>o[s]??"")},u=t=>({webhook:n(t.storage.get("webhook")),format:t.storage.get("format")==="json"?"json":"discord",template:t.storage.get("template")??w}),M=t=>{if(!t)return null;try{let e=new URL(t);return e.protocol==="http:"||e.protocol==="https:"?e.toString():null}catch{return null}},L=(t,e,o)=>{let r=l(_(e,o),2e3);if(t==="discord"){let s={title:l(o.title,256),description:l(o.artists,4096)};return o.album&&(s.footer={text:l(o.album,2048)}),o.cover&&(s.thumbnail={url:o.cover}),{content:r,embeds:[s],allowed_mentions:{parse:[]}}}return{text:r,title:o.title,artists:o.artists,album:o.album,cover:o.cover,duration:o.duration,mid:o.mid,source:o.source}},W=async t=>{try{let e=n(await t.text());return e?`\uFF1A${l(e,180)}`:""}catch{return""}},b=async(t,e)=>{let o=M(t.webhook);if(!o)throw new Error("Webhook \u5730\u5740\u65E0\u6548\uFF0C\u8BF7\u586B\u5199\u5B8C\u6574\u7684 http(s) URL");let r;try{r=await fetch(o,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(L(t.format,t.template,e)),signal:AbortSignal.timeout(v)})}catch(s){throw s instanceof DOMException&&s.name==="TimeoutError"?new Error("Webhook \u8BF7\u6C42\u8D85\u65F6"):new Error("Webhook \u8BF7\u6C42\u5931\u8D25\uFF08\u8BF7\u786E\u8BA4\u5730\u5740\u53EF\u8FBE\uFF0C\u4E14\u76EE\u6807\u670D\u52A1\u5141\u8BB8\u8DE8\u57DF POST\uFF09")}if(!r.ok)throw new Error(`Webhook \u8FD4\u56DE HTTP ${r.status}${await W(r)}`)},N=async(t,e)=>{try{await b(u(t),e),t.log.info(`Now Playing \u5DF2\u63A8\u9001\uFF1A${e.title}`)}catch(o){let r=o instanceof Error?o.message:String(o);t.log.warn(`Now Playing \u63A8\u9001\u5931\u8D25\uFF1A${r}`)}},O=t=>{t.registerSettingsSection({id:"nowplaying-push-settings",title:"NowPlaying \u63A8\u9001",render(e){e.innerHTML=`
        <div class="set-label">Webhook \u5730\u5740 <span class="set-note-inline">Discord Webhook \u6216\u901A\u7528 JSON \u63A5\u6536\u7AEF</span></div>
        <div class="set-row">
          <div class="set-row__ctrl" style="flex:1">
            <input data-field="webhook" type="url" inputmode="url" autocomplete="off" spellcheck="false"
              placeholder="https://discord.com/api/webhooks/..." style="flex:1;min-width:0;width:100%" />
          </div>
        </div>
        <p class="muted set-hint">\u76EE\u6807\u670D\u52A1\u9700\u5141\u8BB8\u6765\u81EA Quaver \u7684\u8DE8\u57DF POST\uFF1B\u7559\u7A7A\u65F6\u4E0D\u4F1A\u53D1\u9001\u3002</p>

        <div class="set-label" style="margin-top:14px">\u63A8\u9001\u683C\u5F0F</div>
        <div class="set-row">
          <div class="set-row__ctrl" style="flex:1">
            <select data-field="format" style="min-width:180px">
              <option value="discord">Discord Webhook</option>
              <option value="json">\u901A\u7528 JSON</option>
            </select>
          </div>
        </div>

        <div class="set-label" style="margin-top:14px">\u6D88\u606F\u6A21\u677F</div>
        <div class="set-row">
          <div class="set-row__ctrl" style="flex:1">
            <input data-field="template" type="text" autocomplete="off"
              style="flex:1;min-width:0;width:100%" />
          </div>
        </div>
        <p class="muted set-hint">\u5360\u4F4D\u7B26\uFF1A<code>{title}</code> <code>{artists}</code> <code>{album}</code></p>

        <div class="set-row" style="margin-top:14px;align-items:center">
          <button class="ghost-btn" data-act="test" type="button">\u53D1\u9001\u6D4B\u8BD5</button>
          <span class="muted set-hint" data-role="status" role="status" aria-live="polite"></span>
        </div>
        <p class="muted set-hint">\u6D4B\u8BD5\u4F1A\u53D1\u9001\u5F53\u524D\u6B63\u5728\u64AD\u653E\u7684\u66F2\u76EE\uFF1B\u6CA1\u6709\u64AD\u653E\u65F6\u53D1\u9001\u4E00\u6761\u6837\u4F8B\u3002\u5207\u6B4C\u63A8\u9001\u6309\u66F2\u76EE\u53BB\u91CD\uFF0C\u6BCF\u9996\u53EA\u53D1\u4E00\u6B21\u3002</p>`;let o=e.querySelector('[data-field="webhook"]'),r=e.querySelector('[data-field="format"]'),s=e.querySelector('[data-field="template"]'),a=e.querySelector('[data-act="test"]'),h=e.querySelector('[data-role="status"]'),p=u(t);o.value=p.webhook,r.value=p.format,s.value=p.template;let c=(d,i)=>{h.textContent=d,h.style.color=i==="err"?"var(--danger, #e5484d)":""},m=()=>{t.storage.set("webhook",o.value.trim()),t.storage.set("format",r.value==="json"?"json":"discord"),t.storage.set("template",s.value),c("\u8BBE\u7F6E\u5DF2\u4FDD\u5B58")};o.addEventListener("input",m),s.addEventListener("input",m),r.addEventListener("change",m),a.addEventListener("click",async()=>{if(a.disabled)return;a.disabled=!0,a.textContent="\u53D1\u9001\u4E2D\u2026",c("\u6B63\u5728\u53D1\u9001\u6D4B\u8BD5\u2026");let d=t.player.current;try{await b(u(t),d?g(d):S),c("\u6D4B\u8BD5\u63A8\u9001\u5DF2\u53D1\u9001","ok"),t.toast("NowPlaying \u6D4B\u8BD5\u63A8\u9001\u5DF2\u53D1\u9001","ok")}catch(i){let y=i instanceof Error?i.message:String(i);c(y,"err"),t.log.warn(`Now Playing \u6D4B\u8BD5\u63A8\u9001\u5931\u8D25\uFF1A${y}`)}finally{a.disabled=!1,a.textContent="\u53D1\u9001\u6D4B\u8BD5"}})}})},j=f({id:"nowplaying-push",name:"NowPlaying \u63A8\u9001",version:"1.0.0",kind:"third-party",author:"Team Quaver",description:"\u5207\u6B4C\u65F6\u628A\u5F53\u524D\u64AD\u653E\u4FE1\u606F\u63A8\u9001\u5230 Discord \u6216\u901A\u7528 JSON Webhook",setup(t){O(t);let e="",o=()=>{let r=t.player.current;if(!r){e="";return}if(!u(t).webhook)return;let s=E(r);s!==e&&(e=s,N(t,g(r)))};return o(),t.player.on(o)}});export{j as default};
