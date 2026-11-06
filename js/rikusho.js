/* ============ 六書 Lục thư — hiểu cách kanji được tạo ra + luyện tập ============
   Dữ liệu: data/rikusho.js (RIKUSHO). Nạp TRƯỚC script chính nên chỉ khai báo hàm;
   cfg/store/$/opt/renderBars… chỉ được dùng lúc gọi. Dùng lại các hàm tiện ích của js/bothu.js (btEsc, btShuf). */

const RK_ORDER=['sk','zs','hy','hs','tc','kt'];
const RKT=RIKUSHO.types;
const RK_HS=[];
RIKUSHO.fam.forEach(f=>f.mem.forEach(m=>RK_HS.push({c:m.c,t:'hs',hv:m.hv,m:m.m,sem:m.sem,ph:[f.ph,f.on],on:m.on,drift:!!m.drift,fam:f})));
RIKUSHO.hsx.forEach(x=>RK_HS.push(Object.assign({t:'hs',fam:null},x)));
const RK_ALL=RIKUSHO.items.concat(RK_HS);
const RK_BY={};RK_ALL.forEach(it=>{RK_BY[it.t+':'+it.c]=it;});
const rkOf=t=>RK_ALL.filter(it=>it.t===t);
const RK_SOUND=RK_HS.filter(it=>it.fam&&!it.drift&&it.fam.mem.filter(m=>!m.drift).length>=3);
const RK_RAD=[];RIKUSHO.rad.forEach(R=>R.ex.forEach(e=>RK_RAD.push({k:e[0],hv:e[1],m:e[2],R})));
const RK_HY=RIKUSHO.items.filter(it=>it.t==='hy');
const rkTag=t=>`<span class="bjp">${RKT[t].jp}</span> ${RKT[t].vi}`;
let RQ=null;

function rkNormOn(s){
  return String(s).toLowerCase().replace(/[ōô]/g,'ou').replace(/ū/g,'uu').replace(/oo/g,'ou')
    .replace(/[^a-z]/g,'').replace(/tyo/g,'cho').replace(/syo/g,'sho').replace(/[zj]yo/g,'jo')
    .replace(/si/g,'shi').replace(/zi/g,'ji').replace(/ti/g,'chi').replace(/tu/g,'tsu').replace(/hu/g,'fu');
}
const rkTypesSel=()=>{const s=(cfg.rTypes||[]).filter(t=>RK_ORDER.includes(t));return s.length?RK_ORDER.filter(t=>s.includes(t)):RK_ORDER.slice();};

/* ---------- thanh chọn ---------- */
function renderRkBars(b1,b2){
  const m=cfg.rMode;
  let h=[['learn','📘 học 6 loại'],['fam','🧩 họ âm 形声'],['rad','🧱 bộ gợi nghĩa'],['quiz','🧠 luyện tập']].map(([k,l])=>opt(m===k,l,'rkm:'+k)).join('');
  h+='<span class="sep"></span>';
  if(m==='fam') h+=[['none','hiện hết'],['on','che âm đọc'],['mean','che nghĩa']].map(([k,l])=>opt(cfg.rHide===k,l,'rkh:'+k)).join('');
  else if(m==='rad') h+=[['none','hiện hết'],['mean','che nghĩa']].map(([k,l])=>opt((cfg.rHide==='on'?'none':cfg.rHide)===k,l,'rkh:'+k)).join('');
  else if(m==='quiz'){
    h+=[['mix','🔀 mix'],['type','loại chữ'],['sound','⌨ đoán âm On'],['rad','bộ gợi nghĩa'],['compose','ghép nghĩa']].map(([k,l])=>opt(cfg.rQ===k,l,'rkq:'+k)).join('');
    h+='<span class="sep"></span>'+[10,20,40].map(v=>opt(cfg.rCount===v,v,'rkc:'+v)).join('');
  }else h+='<span class="count">sáu cách tạo / dùng chữ Hán</span>';
  b1.innerHTML=h;
  if(m==='learn'||m==='quiz'){
    const sel=cfg.rTypes||[];
    b2.style.display='';
    b2.innerHTML=opt(!sel.length,'cả 6 loại','rkt:all')+RK_ORDER.map(t=>opt(sel.includes(t),`<span class="jp">${RKT[t].jp}</span> ${RKT[t].vi}`,'rkt:'+t)).join('')
      +(m==='quiz'?'<span class="sep"></span><span class="count">(lọc áp dụng cho câu “loại chữ”)</span>':'');
  }else{
    b2.style.display='';
    b2.innerHTML=m==='fam'?`<span class="count">${RIKUSHO.fam.length} họ âm · ${RK_HS.length} chữ hình thanh</span>`:`<span class="count">${RIKUSHO.rad.length} bộ thủ · ${RK_RAD.length} chữ ví dụ</span>`;
  }
  $('#tagbox').innerHTML='';
}
function rkBarAct(a,v){
  if(a==='rkm') cfg.rMode=v;
  else if(a==='rkh') cfg.rHide=v;
  else if(a==='rkq'){cfg.rQ=v;RQ=null;}
  else if(a==='rkc'){cfg.rCount=+v;RQ=null;}
  else if(a==='rkt'){
    if(v==='all') cfg.rTypes=[]; else{const s=new Set(cfg.rTypes||[]);s.has(v)?s.delete(v):s.add(v);cfg.rTypes=RK_ORDER.filter(t=>s.has(t));}
    if(cfg.rMode==='quiz') RQ=null;
  }
  saveCfg();renderBars();rkShow();
}
function rkShow(){
  $('#test').style.display='none';$('#res').classList.remove('show');
  $('#rk').style.display='';
  if(RQ&&RQ.timer){clearTimeout(RQ.timer);RQ.timer=0;}
  const m=cfg.rMode;
  if(m==='learn') rkRenderLearn(); else if(m==='fam') rkRenderFam(); else if(m==='rad') rkRenderRad(); else rkRenderQuiz();
}

/* ---------- công thức / giải thích ---------- */
const rkP=(c,mean,cls)=>`<span class="rk-p ${cls||''}"><span class="bjp">${btEsc(c)}</span><small>${btEsc(mean)}</small></span>`;
const rkOp=o=>`<span class="rk-op">${o}</span>`;
function rkFormula(it){
  if(it.t==='hy') return it.parts.map(p=>rkP(p[0],p[1])).join(rkOp('＋'))+rkOp('＝')+rkP(it.c,it.m,'res');
  if(it.t==='hs') return rkP(it.sem[0],it.sem[1]+' · nghĩa','sem')+rkOp('＋')+rkP(it.ph[0],'âm '+it.ph[1],'ph')+rkOp('＝')+rkP(it.c,it.m,'res');
  return rkP(it.c,it.m,'res');
}
function rkWhy(it){
  if(it.t==='hs'){
    return `Bộ <b class="bjp">${it.sem[0]}</b> (${btEsc(it.sem[1])}) cho biết <b>nhóm nghĩa</b>; phần <b class="bjp">${it.ph[0]}</b> cho biết <b>âm On</b> “${btEsc(it.ph[1])}” → <span class="bjp">${it.c}</span> đọc <b>${it.on.join(' / ')}</b>.`
      +(it.drift?' ⚠ Âm đã lệch so với phần chỉ âm — vẫn là manh mối, nhưng đừng tin tuyệt đối.':'')+(it.note?' '+btEsc(it.note):'');
  }
  return btEsc(it.why);
}
function rkDetail(it){
  let h=`<div class="rk-formula">${rkFormula(it)}</div><div class="rk-meta"><b>${btEsc(it.hv)}</b> · ${btEsc(it.m)}`
    +(it.sub?` · <i>${btEsc(it.sub)}</i>`:'')+(it.orig?` · nghĩa gốc: <i>${btEsc(it.orig)}</i>`:'')+`</div><div class="rk-why">${rkWhy(it)}</div>`;
  if(it.t==='hs'&&it.fam) h+=`<div class="rk-why"><button class="mini" data-rk="goto" data-m="fam">🧩 xem cả họ âm ${it.fam.ph} →</button></div>`;
  return h;
}

/* =================== 1. HỌC 6 LOẠI =================== */
function rkRenderLearn(){
  const types=rkTypesSel();
  let h=`<div class="rk"><div class="rk-intro">${btEsc(RIKUSHO.intro)}</div>`;
  for(const t of types){
    const T=RKT[t];
    let items=rkOf(t),more='';
    if(t==='hs'){
      const pick=[];RIKUSHO.fam.slice(0,9).forEach(f=>f.mem.slice(0,2).forEach(m=>pick.push(RK_BY['hs:'+m.c])));
      RIKUSHO.hsx.forEach(x=>pick.push(RK_BY['hs:'+x.c]));
      more=`<button class="mini" data-rk="goto" data-m="fam">🧩 xem tất cả ${RK_HS.length} chữ theo họ âm →</button>`;
      items=pick;
    }
    h+=`<section class="rk-card" data-t="${t}"><div class="rk-h"><span class="bjp jp">${T.jp}</span><span class="ro">${T.ro}</span><b>${T.vi}</b><small>${rkOf(t).length} ví dụ</small></div>`
      +`<p>${btEsc(T.def)}</p><p class="rk-how"><b>Nhận biết:</b> ${btEsc(T.how)}</p><p class="rk-tip">💡 ${btEsc(T.tip)}</p>`
      +`<div class="rk-tiles">${items.map(it=>`<button class="rk-tile" data-rk="ex" data-k="${it.t}:${btEsc(it.c)}"><span class="bjp">${it.c}</span><small>${btEsc(it.hv)}</small></button>`).join('')}</div>${more}<div class="rk-detail"></div></section>`;
  }
  h+='</div>';
  $('#rk').innerHTML=h;
}

/* =================== 2. HỌ ÂM (hình thanh) =================== */
function rkRenderFam(){
  const hide=cfg.rHide;
  let h='<div class="rk"><div class="rk-intro">Nhiều chữ <b>形声</b> có chung một <b>phần chỉ âm</b> nên có cùng âm On. Học theo họ âm: nhớ 1 âm → đọc được cả nhóm. Bộ thủ bên cạnh (viền) cho biết nhóm nghĩa.</div>';
  for(const f of RIKUSHO.fam){
    h+=`<section class="rk-fam"><div class="rk-fh">${rkP(f.ph,'âm '+f.on,'ph')}<div class="rk-fi"><b>${btEsc(f.hv)}</b> · ${btEsc(f.m)}<br><span class="${hide==='on'?'bhid':''}">âm On: <b>${f.on}</b></span></div></div><div class="rk-mem">`;
    for(const m of f.mem){
      h+=`<div class="rk-m${m.drift?' dr':''}"><div class="rk-mf"><span class="rk-p sem sm"><span class="bjp">${m.sem[0]}</span></span><span class="rk-op">＋</span><span class="rk-p ph sm"><span class="bjp">${f.ph}</span></span></div>`
        +`<div class="rk-mc bjp">${m.c}</div><div class="rk-mh">${btEsc(m.hv)}</div><div class="rk-mm${hide==='mean'?' bhid':''}">${btEsc(m.m)}</div>`
        +`<div class="rk-mo${hide==='on'?' bhid':''}">${m.on.join(' / ')}${m.drift?' ⚠':''}</div><div class="rk-ms">${btEsc(m.sem[1])}</div></div>`;
    }
    h+='</div></section>';
  }
  h+='<div class="rk-intro">⚠ = âm đã lệch so với phần chỉ âm (vẫn cùng họ nhưng đọc khác). 4 chữ lẻ khác: '+RIKUSHO.hsx.map(x=>`<span class="bjp">${x.c}</span> (${x.sem[0]}＋${x.ph[0]})`).join(' · ')+'.</div></div>';
  $('#rk').innerHTML=h;
}

/* =================== 3. BỘ GỢI NGHĨA =================== */
function rkRenderRad(){
  const hide=cfg.rHide==='mean';
  let h='<div class="rk"><div class="rk-intro">Trong chữ <b>形声</b>, bộ thủ cho biết <b>nhóm nghĩa</b>. Nhìn thấy bộ này trong một kanji lạ, bạn có thể đoán chữ liên quan tới điều gì.</div><div class="rk-rads">';
  for(const R of RIKUSHO.rad){
    h+=`<section class="rk-rad"><div class="rk-rh"><span class="rk-rg bjp">${R.r}</span><div><b>${btEsc(R.hv)}</b>${R.alt?` <span class="bjp rk-alt">(${R.alt})</span>`:''}<div class="rk-rm${hide?' bhid':''}">${btEsc(R.m)}</div></div></div>`
      +(R.note?`<div class="rk-note">${btEsc(R.note)}</div>`:'')
      +`<div class="rk-ex">${R.ex.map(e=>`<div class="rk-e"><span class="bjp">${e[0]}</span><b>${btEsc(e[1])}</b><span class="${hide?'bhid':''}">${btEsc(e[2])}</span></div>`).join('')}</div></section>`;
  }
  h+='</div></div>';
  $('#rk').innerHTML=h;
}

/* =================== 4. LUYỆN TẬP =================== */
function rkBag(arr){
  let b=[];
  return ()=>{if(!b.length) b=btShuf(arr.slice());return b.pop();};
}
function rkTypeBag(){
  const sel=rkTypesSel(),bags=sel.map(t=>rkBag(rkOf(t)));let i=0;
  return ()=>bags[(i++)%bags.length]();
}
function rkQStart(specs){
  if(!specs){
    const n=cfg.rCount||10;
    const kinds=cfg.rQ==='mix'?['type','sound','rad','compose']:[cfg.rQ];
    const bag={type:rkTypeBag(),sound:rkBag(RK_SOUND),rad:rkBag(RK_RAD),compose:rkBag(RK_HY)};
    specs=[];
    for(let i=0;i<n;i++){const kind=kinds[i%kinds.length];specs.push({kind,it:bag[kind](),retry:false});}
    btShuf(specs);
  }
  RQ={q:specs,i:0,total:specs.length,doneU:0,ok:0,err:0,wrong:new Map(),t0:Date.now(),done:false,cur:null,timer:0};
  rkQMake();
}
function rkQMake(){
  const s=RQ.q[RQ.i],it=s.it,cur={kind:s.kind,it,retry:s.retry,answered:false,ok:false,pick:-1,given:''};
  if(s.kind==='type') cur.choices=(()=>{const sel=rkTypesSel();return (sel.length>=2?sel:RK_ORDER).slice();})();
  else if(s.kind==='rad'){
    const others=btShuf(RIKUSHO.rad.filter(R=>R!==it.R&&!R.ex.some(e=>e[0]===it.k)));
    cur.choices=btShuf([it.R].concat(others.slice(0,3)));
  }else if(s.kind==='compose'){
    const others=btShuf(RK_HY.filter(x=>x.m!==it.m));
    const out=[it];for(const x of others){if(out.length>=4) break;if(!out.some(o=>o.m===x.m)) out.push(x);}
    cur.choices=btShuf(out);
  }
  RQ.cur=cur;
}
const rkKey=n=>`<kbd>${n}</kbd>`;
function rkRenderQuiz(){
  const el=$('#rk');
  if(!RQ) rkQStart();
  if(RQ.done){rkQResult();return;}
  const c=RQ.cur,it=c.it,pct=Math.round(RQ.doneU/RQ.total*100);
  let h=`<div class="bq"><div class="bq-head"><span>câu <b>${Math.min(RQ.doneU+1,RQ.total)}</b>/${RQ.total}</span><span class="g">✓ ${RQ.ok}</span><span class="e">✗ ${RQ.err}</span>${c.retry?'<span class="rt">↻ hỏi lại</span>':''}<div class="bq-bar"><i style="width:${pct}%"></i></div></div><div class="bq-card">`;
  const mk=(cls,n,inner,state)=>`<button class="ch${state}" data-rk="pick" data-k="${n}">${rkKey(n+1)}${inner}</button>`;
  const st=(ok,k)=>c.answered?(ok?' ok':c.pick===k?' bad':''):'';
  if(c.kind==='type'){
    h+=`<div class="bq-g bjp">${it.c}</div><div class="bq-p"><b>${btEsc(it.hv)}</b> — ${btEsc(it.m)}</div><div class="bq-s">chữ này được tạo ra theo cách nào?</div><div class="bq-ch">`
      +c.choices.map((t,k)=>mk('',k,`<span>${rkTag(t)}</span>`,st(t===it.t,k))).join('')+'</div>';
  }else if(c.kind==='sound'){
    const f=it.fam,sib=btShuf(f.mem.filter(m=>!m.drift&&m.c!==it.c)).slice(0,3);
    h+=`<div class="bq-s">các chữ này cùng chứa một phần chỉ âm:</div><div class="rk-sibs">`
      +sib.map(m=>`<div class="rk-sib"><span class="bjp">${m.c}</span><small>${m.on.includes(f.on)?f.on:m.on[0]}</small></div>`).join('')+'</div>'
      +`<div class="bq-g bjp">${it.c}</div><div class="bq-p"><b>${btEsc(it.hv)}</b> — ${btEsc(it.m)} <small class="rk-hint">(bộ <span class="bjp">${it.sem[0]}</span> ${btEsc(it.sem[1])})</small></div>`
      +`<div class="bq-s">đoán <b>âm On</b> của chữ này (gõ romaji)</div>`
      +`<input id="rq-in" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="vd: sei" ${c.answered?'readonly value="'+btEsc(c.given)+'"':''}>`
      +(c.answered?'':`<div class="bq-btns"><button class="btn pri" data-rk="check">kiểm tra ↵</button><button class="btn" data-rk="skip">không biết</button></div>`);
  }else if(c.kind==='rad'){
    h+=`<div class="bq-g bjp">${it.k}</div><div class="bq-p"><b>${btEsc(it.hv)}</b> — ${btEsc(it.m)}</div><div class="bq-s">bộ nào trong chữ này <b>gợi nghĩa</b>?</div><div class="bq-ch">`
      +c.choices.map((R,k)=>mk('',k,`<span class="bjp rk-chg">${R.r}</span><span>${btEsc(R.m)}</span>`,st(R===it.R,k))).join('')+'</div>';
  }else{
    h+=`<div class="rk-formula big">${it.parts.map(p=>rkP(p[0],p[1])).join(rkOp('＋'))}${rkOp('＝')}<span class="rk-p res"><span class="bjp">${c.answered?it.c:'？'}</span></span></div><div class="bq-s">ghép nghĩa các phần lại, chữ mới có nghĩa là gì?</div><div class="bq-ch">`
      +c.choices.map((x,k)=>mk('',k,`<span>${btEsc(x.m)}</span>`,st(x===it,k))).join('')+'</div>';
  }
  if(c.answered){
    const full=c.kind==='rad'?(RK_BY['hs:'+it.k]||null):it;
    h+=`<div class="bq-fb ${c.ok?'ok':'bad'}">${c.ok?'✓ Đúng':'✗ Chưa đúng'}</div>`;
    if(c.kind==='type') h+=`<div class="bq-ans rk-ans"><div><b>${rkTag(it.t)}</b><br><small>${rkWhy(it)}</small></div></div>${'<div class="rk-formula">'+rkFormula(it)+'</div>'}`;
    else if(c.kind==='sound') h+=`<div class="bq-ans rk-ans"><div>Đáp án: <b>${it.on.join(' / ')}</b><br><small>${rkWhy(it)}</small></div></div><div class="rk-formula">${rkFormula(it)}</div>`;
    else if(c.kind==='rad') h+=`<div class="bq-ans rk-ans"><div>Bộ <b class="bjp">${it.R.r}</b> ${btEsc(it.R.hv)}: <b>${btEsc(it.R.m)}</b>${full?'<br><small>'+rkWhy(full)+'</small>':''}</div></div>`;
    else h+=`<div class="bq-ans rk-ans"><div><b class="bjp">${it.c}</b> ${btEsc(it.hv)} — ${btEsc(it.m)}<br><small>${btEsc(it.why)}</small></div></div>`;
    h+=`<div class="bq-btns"><button class="btn pri" data-rk="next">tiếp ↵</button></div>`;
  }
  h+='</div><div class="bq-foot"><button class="mini" data-rk="restart">↺ bắt đầu lại</button></div></div>';
  el.innerHTML=h;
  const inp=$('#rq-in');if(inp) inp.focus({preventScroll:true});
}
function rkQAnswer(ok,given,pick){
  const c=RQ.cur;if(c.answered) return;
  c.answered=true;c.ok=ok;c.given=given||'';c.pick=pick==null?-1:pick;
  if(!c.retry){if(ok) RQ.ok++;else{RQ.err++;RQ.wrong.set(c.kind+':'+(c.it.c||c.it.k),{kind:c.kind,it:c.it});}}
  if(ok) RQ.doneU++;
  else RQ.q.splice(Math.min(RQ.q.length,RQ.i+4),0,{kind:c.kind,it:c.it,retry:true});
  rkRenderQuiz();
  if(ok) RQ.timer=setTimeout(rkQNext,c.kind==='sound'?800:700);
}
function rkQNext(){
  if(!RQ||RQ.done) return;
  clearTimeout(RQ.timer);RQ.timer=0;
  RQ.i++;
  if(RQ.i>=RQ.q.length){RQ.done=true;RQ.t1=Date.now();}else rkQMake();
  rkRenderQuiz();
}
function rkQEnter(){
  if(!RQ||RQ.done) return;
  if(RQ.cur.answered){rkQNext();return;}
  if(RQ.cur.kind==='sound'){
    const i=$('#rq-in');
    if(i&&i.value.trim()){const t=rkNormOn(i.value);rkQAnswer(RQ.cur.it.on.some(o=>rkNormOn(o)===t),i.value);}
  }
}
function rkQPick(k){
  if(!RQ||RQ.done||RQ.cur.answered||RQ.cur.kind==='sound') return;
  const c=RQ.cur,x=c.choices[k];if(x===undefined) return;
  const ok=c.kind==='type'?x===c.it.t:c.kind==='rad'?x===c.it.R:x===c.it;
  rkQAnswer(ok,'',k);
}
function rkQResult(){
  const secs=Math.round((RQ.t1-RQ.t0)/1000),wr=[...RQ.wrong.values()];
  const acc=RQ.total?Math.round((RQ.total-wr.length)/RQ.total*100):0;
  let h=`<div class="bq"><div class="bq-res"><div class="big"><div class="lbl">đúng ngay lần đầu</div><div class="val">${acc}%</div></div>`
    +`<div class="stats"><div class="stat"><div class="lbl">câu hỏi</div><div class="val">${RQ.total}</div></div><div class="stat"><div class="lbl">sai</div><div class="val"><span class="bad">${wr.length}</span></div></div><div class="stat"><div class="lbl">thời gian</div><div class="val">${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}</div></div></div>`;
  if(wr.length){
    h+='<div class="miss"><div class="sec-lbl">cần ôn lại</div><div class="rk-wr">'+wr.map(w=>{
      const it=w.it,ch=it.c||it.k,full=w.kind==='rad'?(RK_BY['hs:'+it.k]||null):it;
      return `<div class="rk-w"><span class="bjp k">${ch}</span><div><b>${btEsc(it.hv)}</b> · ${btEsc(it.m)}${w.kind==='rad'?` · bộ <span class="bjp">${it.R.r}</span> (${btEsc(it.R.m)})`:full&&full.t?` · ${rkTag(full.t)}`:''}<br><small>${full?rkWhy(full):''}</small></div></div>`;
    }).join('')+'</div></div>';
  }else h+='<div class="pb">★ Không sai câu nào!</div>';
  h+=`<div class="btns">${wr.length?'<button class="btn pri" data-rk="drill">🔁 luyện lại câu sai</button>':''}<button class="btn${wr.length?'':' pri'}" data-rk="restart">▶ lượt mới</button></div></div></div>`;
  $('#rk').innerHTML=h;
}

/* ---------- sự kiện ---------- */
function rkKeydown(e){
  const t=e.target;
  if(t&&t.id==='rq-in'){if(e.key==='Enter'){e.preventDefault();rkQEnter();}return;}
  if(t&&(t.tagName==='INPUT'||t.tagName==='SELECT'||t.tagName==='TEXTAREA')) return;
  if(e.ctrlKey||e.metaKey||e.altKey) return;
  if(e.key==='Tab'){e.preventDefault();if(cfg.rMode==='quiz'){RQ=null;rkShow();}return;}
  if(cfg.rMode!=='quiz') return;
  if(e.key==='Enter'||e.key===' '){e.preventDefault();rkQEnter();}
  else if(/^[1-6]$/.test(e.key)) rkQPick(+e.key-1);
}
document.addEventListener('click',e=>{
  if(cfg.app!=='rikusho') return;
  const root=e.target.closest('#rk');if(!root) return;
  const hid=e.target.closest('.bhid');
  if(hid){hid.classList.remove('bhid');e.stopPropagation();return;}
  const a=e.target.closest('[data-rk]');if(!a) return;
  const k=a.dataset.rk;
  if(k==='ex'){
    const it=RK_BY[a.dataset.k],card=a.closest('.rk-card'),det=card.querySelector('.rk-detail');
    const on=a.classList.contains('on');
    card.querySelectorAll('.rk-tile.on').forEach(x=>x.classList.remove('on'));
    if(on){det.innerHTML='';return;}
    a.classList.add('on');det.innerHTML=rkDetail(it);
  }
  else if(k==='goto'){cfg.rMode=a.dataset.m;saveCfg();renderBars();rkShow();window.scrollTo(0,0);}
  else if(k==='pick') rkQPick(+a.dataset.k);
  else if(k==='check'){const i=$('#rq-in');if(i&&i.value.trim()) rkQEnter();else if(i) i.focus();}
  else if(k==='skip') rkQAnswer(false,'');
  else if(k==='next') rkQNext();
  else if(k==='restart'){RQ=null;rkShow();}
  else if(k==='drill'&&RQ){
    const specs=btShuf([...RQ.wrong.values()].map(w=>({kind:w.kind,it:w.it,retry:false})));
    rkQStart(specs);rkShow();
  }
});
