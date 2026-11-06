/* ============ Bộ thủ 214 — bảng · luyện nhớ · luyện viết (từng nét) ============
   Dữ liệu: data/botthu.js (BOTHU). Nét viết: KanjiVG (c) Ulrich Apel, CC BY-SA 3.0.
   File này được nạp TRƯỚC script chính nên chỉ khai báo hàm; mọi tham chiếu tới cfg/store/$/opt... chỉ chạy lúc gọi. */

const BT_NS='http://www.w3.org/2000/svg';
const BT_VI={'㇐':'ngang','㇑':'sổ','㇒':'phẩy','㇏':'mác','㇔':'chấm','㇀':'hất','㇚':'sổ móc','㇕':'ngang gập','㇆':'ngang gập móc','㇇':'ngang phẩy','㇖':'ngang móc','㇄':'sổ cong','㇟':'sổ cong móc','㇗':'sổ gập','㇈':'ngang gập cong móc','㇜':'phẩy chấm'};
const btStrokeName=t=>BT_VI[t]||'nét gập';
const btEsc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const btShuf=a=>{for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]];}return a;};
const btNorm=s=>String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[đĐ]/g,'d').toLowerCase().replace(/[^a-z]/g,'');

const BT=(typeof BOTHU!=='undefined'?BOTHU:[]).map((r,i)=>{
  const forms=[];
  if(r.s) forms.push({ch:r.c,s:r.s,t:r.t});
  for(const [ch,v] of Object.entries(r.vs||{})) forms.push({ch,s:v.s,t:v.t});
  return {i,c:r.c,n:r.n,hv:r.hv,m:r.m,v:r.v,forms,alts:r.hv.split(' / ')};
});

let BSTAT=null,BDRILL=null,BQ=null,BW=null;
const btStat=()=>BSTAT||(BSTAT=store.get('kanatype.bstat',{}));
const btS=c=>{const s=btStat();return s[c]||(s[c]={o:0,e:0,w:0,k:0});};
const btSave=()=>store.set('kanatype.bstat',btStat());
const btKey=r=>r.n>=8?'8+':String(r.n);

/* ---------- danh sách theo bộ lọc ---------- */
function btList(){
  if(BDRILL) return BT.filter(r=>BDRILL.has(r.c));
  let L=BT;
  const sel=cfg.bSel||[];
  if(sel.length) L=L.filter(r=>sel.includes(btKey(r)));
  const st=btStat();
  if(cfg.bOnly==='weak') L=L.filter(r=>{const s=st[r.c];return s&&s.e>0&&s.e/(s.o+s.e)>=.3;});
  else if(cfg.bOnly==='todo') L=L.filter(r=>!(st[r.c]&&st[r.c].k));
  return L;
}
function btEmpty(){
  return `<div class="empty">Không có bộ nào khớp bộ lọc hiện tại.<br><br><button class="btn" data-bt="reset">bỏ bộ lọc</button></div>`;
}

/* ---------- thanh chọn ---------- */
function renderBtBars(b1,b2){
  const m=cfg.bMode;
  let h=opt(m==='table','📖 bảng 214','btm:table')+opt(m==='quiz','🧠 luyện nhớ','btm:quiz')+opt(m==='write','✍ luyện viết','btm:write');
  h+='<span class="sep"></span>';
  if(m==='table'){
    h+=[['none','hiện hết'],['name','che tên'],['mean','che nghĩa'],['char','che bộ']].map(([k,l])=>opt(cfg.bHide===k,l,'bth:'+k)).join('');
  }else if(m==='quiz'){
    h+=[['type','⌨ gõ tên Hán Việt'],['mean','chọn nghĩa'],['char','chọn bộ'],['mix','🔀 mix']].map(([k,l])=>opt(cfg.bQ===k,l,'btq:'+k)).join('');
    h+='<span class="sep"></span>'+[10,20,50,0].map(v=>opt(cfg.bCount===v,v||'tất cả','btc:'+v)).join('');
    h+='<span class="sep"></span>'+opt(cfg.bHint,'💡 hiện nghĩa','bthint:1');
  }else{
    h+=[['watch','👁 xem nét'],['trace','✍ tập (nét mờ)'],['blind','🧠 nhớ (không gợi ý)']].map(([k,l])=>opt(cfg.bWrite===k,l,'btw:'+k)).join('');
  }
  b1.innerHTML=h;
  const sel=cfg.bSel||[];
  const cnt=k=>BT.filter(r=>btKey(r)===k).length;
  let h2=opt(!sel.length&&!BDRILL,'tất cả 214','bts:all')+['1','2','3','4','5','6','7','8+'].map(k=>opt(sel.includes(k)&&!BDRILL,k+' nét <small style="opacity:.6">'+cnt(k)+'</small>','bts:'+k)).join('');
  h2+='<span class="sep"></span>'+[['all','mọi bộ'],['weak','❗ hay sai'],['todo','☆ chưa thuộc']].map(([k,l])=>opt((cfg.bOnly||'all')===k&&!BDRILL,l,'bto:'+k)).join('');
  const n=btList().length,known=BT.filter(r=>(btStat()[r.c]||{}).k).length;
  h2+=`<span class="sep"></span><span class="count">${n} bộ · đã thuộc ${known}/214</span>`;
  b2.innerHTML=h2;
  $('#tagbox').innerHTML=BDRILL?`<span class="tag">đang luyện ${BDRILL.size} bộ sai<button id="untag" title="thoát">✕</button></span>`:'';
  const u=$('#untag');if(u) u.onclick=()=>{BDRILL=null;BQ=null;renderBars();btShow();};
}
function btBarAct(a,v){
  if(a==='btm'){cfg.bMode=v;if(BW) BW.dead=true;}
  else if(a==='bts'){
    if(v==='all') cfg.bSel=[]; else{const s=new Set(cfg.bSel||[]);s.has(v)?s.delete(v):s.add(v);cfg.bSel=[...s];}
    BDRILL=null;BQ=null;
  }
  else if(a==='bto'){cfg.bOnly=v;BDRILL=null;BQ=null;}
  else if(a==='btq'){cfg.bQ=v;BQ=null;}
  else if(a==='btc'){cfg.bCount=+v;BQ=null;}
  else if(a==='bth') cfg.bHide=v;
  else if(a==='bthint') cfg.bHint=!cfg.bHint;
  else if(a==='btw') cfg.bWrite=v;
  saveCfg();renderBars();btShow();
}

/* ---------- vào / ra tab ---------- */
function btShow(){
  $('#test').style.display='none';$('#res').classList.remove('show');
  $('#bt').style.display='';
  if(BW) BW.dead=true;
  if(BQ&&BQ.timer){clearTimeout(BQ.timer);BQ.timer=0;}
  const m=cfg.bMode;
  if(m==='table') btRenderTable(); else if(m==='quiz') btRenderQuiz(); else btRenderWrite();
}

/* =================== 1. BẢNG =================== */
function btRenderTable(){
  const L=btList(),st=btStat(),el=$('#bt');
  if(!L.length){el.innerHTML=btEmpty();return;}
  const per={};for(const r of L) per[r.n]=(per[r.n]||0)+1;
  let h='<div class="btt">',cur=-1;
  for(const r of L){
    if(r.n!==cur){
      if(cur!==-1) h+='</div></section>';
      cur=r.n;h+=`<section><h4>${r.n} nét <small>${per[r.n]} bộ</small></h4><div class="bgrid">`;
    }
    const k=(st[r.c]||{}).k;
    h+=`<div class="bcard${k?' k':''}" data-bi="${r.i}"><button class="bk" data-bk="${r.i}" title="đánh dấu đã thuộc">${k?'★':'☆'}</button>`
      +`<div class="bg bjp${cfg.bHide==='char'?' bhid':''}">${r.c}</div>`
      +`<div class="bv bjp">${r.v.join(' ')||'&nbsp;'}</div>`
      +`<div class="bn${cfg.bHide==='name'?' bhid':''}">${btEsc(r.hv)}</div>`
      +`<div class="bm${cfg.bHide==='mean'?' bhid':''}">${btEsc(r.m)}</div></div>`;
  }
  h+='</div></section></div><div class="bt-cr">Bấm vào một ô để xem cách viết. Nguồn danh sách: kohi.vn · nét viết: KanjiVG (CC BY-SA 3.0)</div>';
  el.innerHTML=h;
}

/* =================== 2. LUYỆN NHỚ =================== */
function btQStart(list){
  const base=list||btList();
  if(!base.length){BQ=null;return;}
  let items=btShuf(base.slice());
  const n=cfg.bCount?Math.min(cfg.bCount,items.length):items.length;
  items=items.slice(0,n);
  BQ={q:items.map(r=>({r,retry:false})),i:0,total:n,doneU:0,ok:0,err:0,wrong:new Map(),t0:Date.now(),done:false,cur:null,timer:0};
  btQMake();
}
function btChoices(r,type){
  let pool=BT.filter(x=>x.c!==r.c&&(type!=='mean'||x.m!==r.m));
  if(type==='char') pool=pool.map(x=>[Math.abs(x.n-r.n)+Math.random()*2.5,x]).sort((a,b)=>a[0]-b[0]).map(p=>p[1]);
  else btShuf(pool);
  const out=[r];
  for(const x of pool){if(out.length>=4) break;if(type==='mean'&&out.some(o=>o.m===x.m)) continue;out.push(x);}
  return btShuf(out);
}
function btQMake(){
  const it=BQ.q[BQ.i],r=it.r;
  let type=cfg.bQ;if(type==='mix') type=['type','mean','char'][Math.random()*3|0];
  const cur={r,type,retry:it.retry,answered:false,ok:false,pick:-1,given:''};
  if(type!=='type') cur.choices=btChoices(r,type);
  BQ.cur=cur;
}
function btRenderQuiz(){
  const el=$('#bt');
  if(!BQ) btQStart();
  if(!BQ){el.innerHTML=btEmpty();return;}
  if(BQ.done){btQResult();return;}
  const c=BQ.cur,r=c.r,pct=Math.round(BQ.doneU/BQ.total*100);
  let h=`<div class="bq"><div class="bq-head"><span>bộ <b>${Math.min(BQ.doneU+1,BQ.total)}</b>/${BQ.total}</span><span class="g">✓ ${BQ.ok}</span><span class="e">✗ ${BQ.err}</span>${c.retry?'<span class="rt">↻ hỏi lại</span>':''}<div class="bq-bar"><i style="width:${pct}%"></i></div></div><div class="bq-card">`;
  if(c.type==='type'){
    h+=`<div class="bq-g bjp">${r.c}</div><div class="bq-s">${cfg.bHint?btEsc(r.m):'gõ <b>tên Hán Việt</b> của bộ này (không dấu cũng được)'}</div>`
      +`<input id="bq-in" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="vd: nhan" ${c.answered?'readonly value="'+btEsc(c.given)+'"':''}>`
      +(c.answered?'':`<div class="bq-btns"><button class="btn pri" data-bq="check">kiểm tra ↵</button><button class="btn" data-bq="skip">không nhớ</button></div>`);
  }else if(c.type==='mean'){
    h+=`<div class="bq-g bjp">${r.c}</div><div class="bq-s">${cfg.bHint?'<b>'+btEsc(r.hv)+'</b> — chọn nghĩa đúng':'chọn <b>nghĩa</b> đúng của bộ này'}</div><div class="bq-ch">`
      +c.choices.map((x,k)=>`<button class="ch${c.answered?(x.c===r.c?' ok':c.pick===k?' bad':''):''}" data-bq="pick" data-k="${k}"><kbd>${k+1}</kbd> ${btEsc(x.m)}</button>`).join('')+'</div>';
  }else{
    h+=`<div class="bq-p"><b>${btEsc(r.hv)}</b> — ${btEsc(r.m)}</div><div class="bq-s">chọn <b>bộ thủ</b> đúng</div><div class="bq-ch glyph">`
      +c.choices.map((x,k)=>`<button class="ch${c.answered?(x.c===r.c?' ok':c.pick===k?' bad':''):''}" data-bq="pick" data-k="${k}"><kbd>${k+1}</kbd><span class="bjp">${x.c}</span></button>`).join('')+'</div>';
  }
  if(c.answered){
    const f=r.forms[0];
    h+=`<div class="bq-fb ${c.ok?'ok':'bad'}">${c.ok?'✓ Đúng':'✗ Chưa đúng'}</div>`
      +`<div class="bq-ans"><span class="g bjp">${r.c}</span><div><b>${btEsc(r.hv)}</b> · ${btEsc(r.m)}<br><small>${r.n} nét${r.v.length?' · dạng khác: <span class="bjp">'+r.v.join(' ')+'</span>':''}</small></div></div>`
      +`<div class="bq-btns"><button class="btn pri" data-bq="next">tiếp ↵</button><button class="btn" data-bq="write">✍ xem cách viết</button></div>`;
  }
  h+='</div><div class="bq-foot"><button class="mini" data-bq="restart">↺ bắt đầu lại</button></div></div>';
  el.innerHTML=h;
  const inp=$('#bq-in');if(inp) inp.focus({preventScroll:true});
}
function btQAnswer(ok,given,pick){
  const c=BQ.cur;if(c.answered) return;
  c.answered=true;c.ok=ok;c.given=given||'';c.pick=pick==null?-1:pick;
  const s=btS(c.r.c);
  if(!c.retry){if(ok){s.o++;BQ.ok++;}else{s.e++;BQ.err++;BQ.wrong.set(c.r.c,c.r);}}
  if(ok) BQ.doneU++;
  else BQ.q.splice(Math.min(BQ.q.length,BQ.i+5),0,{r:c.r,retry:true});
  btSave();
  btRenderQuiz();
  if(ok) BQ.timer=setTimeout(btQNext,c.type==='type'?750:650);
}
function btQNext(){
  if(!BQ||BQ.done) return;
  clearTimeout(BQ.timer);BQ.timer=0;
  BQ.i++;
  if(BQ.i>=BQ.q.length){BQ.done=true;BQ.t1=Date.now();}
  else btQMake();
  btRenderQuiz();
}
function btQEnter(){
  if(!BQ||BQ.done) return;
  if(BQ.cur.answered){btQNext();return;}
  if(BQ.cur.type==='type'){const i=$('#bq-in');if(i&&i.value.trim()) btQAnswer(BQ.cur.r.alts.some(a=>btNorm(a)===btNorm(i.value)),i.value);}
}
function btQPick(k){
  if(!BQ||BQ.done||BQ.cur.answered||BQ.cur.type==='type') return;
  const x=BQ.cur.choices[k];if(!x) return;
  btQAnswer(x.c===BQ.cur.r.c,'',k);
}
function btQResult(){
  const el=$('#bt'),secs=Math.round((BQ.t1-BQ.t0)/1000);
  const acc=BQ.total?Math.round((BQ.total-BQ.wrong.size)/BQ.total*100):0;
  const wr=[...BQ.wrong.values()];
  let h=`<div class="bq"><div class="bq-res"><div class="big"><div class="lbl">đúng ngay lần đầu</div><div class="val">${acc}%</div></div>`
    +`<div class="stats"><div class="stat"><div class="lbl">bộ đã ôn</div><div class="val">${BQ.total}</div></div><div class="stat"><div class="lbl">sai</div><div class="val"><span class="bad">${BQ.wrong.size}</span></div></div><div class="stat"><div class="lbl">thời gian</div><div class="val">${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}</div></div></div>`;
  if(wr.length){
    h+=`<div class="miss"><div class="sec-lbl">cần ôn lại</div><div class="chips">`+wr.map(r=>`<div class="mchip"><span class="k bjp">${r.c}</span><span class="r">${btEsc(r.hv)}</span><span class="bm2">${btEsc(r.m)}</span></div>`).join('')+'</div></div>';
  }else h+='<div class="pb">★ Không sai bộ nào!</div>';
  h+=`<div class="btns">${wr.length?'<button class="btn pri" data-bq="drill">🔁 luyện lại bộ sai</button><button class="btn" data-bq="writewrong">✍ viết lại bộ sai</button>':''}<button class="btn${wr.length?'':' pri'}" data-bq="restart">▶ lượt mới</button></div></div></div>`;
  el.innerHTML=h;
}

/* =================== 3. LUYỆN VIẾT =================== */
function btRenderWrite(){
  const L=btList(),el=$('#bt');
  if(!L.length){el.innerHTML=btEmpty();return;}
  let r=BT[cfg.bCur];
  if(!r||!L.includes(r)){r=L[0];cfg.bCur=r.i;saveCfg();}
  btWriteBuild(r,0);
}
function btWriteBuild(r,fi){
  if(BW) BW.dead=true;
  const el=$('#bt'),L=btList(),f=r.forms[fi]||r.forms[0],k=btS(r.c).k,mode=cfg.bWrite;
  const pos=L.findIndex(x=>x.i===r.i)+1;
  const rules=`<details class="bw-rules"><summary>Quy tắc viết &amp; 8 nét cơ bản</summary><p><b>8 nét cơ bản:</b> chấm <span class="bjp">丶</span> (từ trên xuống) · ngang <span class="bjp">一</span> (trái → phải) · sổ thẳng <span class="bjp">丨</span> (trên → dưới) · hất (cong lên, trái → phải) · phẩy <span class="bjp">丿</span> (kéo xuống từ phải sang trái) · mác <span class="bjp">乀</span> (kéo xuống từ trái sang phải) · gập (có một chỗ gập giữa nét) · móc <span class="bjp">亅</span> (móc lên ở cuối nét).</p>`
    +`<p><b>Thứ tự:</b> ngang trước sổ sau (<span class="bjp">十</span>) · phẩy trước mác sau (<span class="bjp">八</span>) · trên trước dưới sau (<span class="bjp">二</span>) · trái trước phải sau (<span class="bjp">你</span>) · ngoài trước trong sau (<span class="bjp">月</span>) · vào trước đóng sau (<span class="bjp">国</span>) · giữa trước hai bên sau (<span class="bjp">小</span>).</p></details>`;
  el.innerHTML=`<div class="bw"><div class="bw-left">`
    +`<svg id="bw-svg" class="m-${mode}" viewBox="0 0 109 109"><rect class="bw-bd" x=".5" y=".5" width="108" height="108"/><path class="bw-gr" d="M54.5 0V109M0 54.5H109M0 0L109 109M109 0L0 109"/>`
    +`<g id="bw-ghost">${f.s.map(d=>`<path d="${btEsc(d)}"/>`).join('')}</g><g id="bw-nums"></g><g id="bw-done"></g><g id="bw-hint"></g><g id="bw-anim"></g><g id="bw-user"><path id="bw-up" class="bw-user" d=""/></g></svg>`
    +`<div class="bw-msg" id="bw-msg"></div>`
    +`<div class="bw-tools"><button class="btn" data-bw="prev" title="←">◀</button><button class="btn" data-bw="replay">▶ xem lại</button>${mode==='watch'?'':'<button class="btn" data-bw="hint" title="h">💡 gợi ý</button><button class="btn" data-bw="reset" title="Backspace">↺ viết lại</button>'}<button class="btn" data-bw="rand">🎲</button><button class="btn" data-bw="next" title="→">▶</button></div></div>`
    +`<div class="bw-right"><div class="bw-glyph bjp">${r.c}</div><div class="bw-hv">${btEsc(r.hv)}</div><div class="bw-mean">${btEsc(r.m)}</div>`
    +`<div class="bw-meta">${f.s.length} nét · ${pos}/${L.length}${r.forms.length&&r.forms[0].ch!==r.c?' · tập dạng <span class="bjp">'+f.ch+'</span>':''}</div>`
    +(r.forms.length>1?`<div class="bw-forms">dạng viết: ${r.forms.map((x,j)=>`<button class="fm bjp${j===fi?' on':''}" data-bwf="${j}">${x.ch}</button>`).join('')}</div>`:'')
    +`<div class="bw-strokes" id="bw-strokes"></div>`
    +`<button class="btn bw-known${k?' pri':''}" data-bw="known">${k?'★ đã thuộc':'☆ đánh dấu đã thuộc'}</button>`
    +rules+`<div class="bt-cr">Nét viết: KanjiVG (CC BY-SA 3.0)</div></div></div>`;
  const svg=$('#bw-svg'),paths=[...svg.querySelectorAll('#bw-ghost path')];
  const N=24,ref=paths.map(p=>{const len=p.getTotalLength(),pts=[];for(let q=0;q<N;q++){const o=p.getPointAtLength(len*q/(N-1));pts.push({x:o.x,y:o.y});}return {len,p:pts};});
  const me=BW={r,fi,f,mode,si:0,miss:0,missTot:0,hints:0,finished:false,paths,ref,total:paths.length,pts:null,dead:false,svg};
  cfg.bCur=r.i;saveCfg();
  if(mode==='trace'){ // số thứ tự nét mờ
    const g=$('#bw-nums');g.innerHTML=paths.map((p,q)=>{const o=p.getPointAtLength(0);return btNum(o.x,o.y,q+1,'f');}).join('');
  }
  svg.addEventListener('pointerdown',e=>btDown(e,me));
  svg.addEventListener('pointermove',e=>btMove(e,me));
  svg.addEventListener('pointerup',e=>btUp(e,me));
  svg.addEventListener('pointercancel',e=>btUp(e,me,true));
  btChips();
  if(mode==='watch') btPlay();
  else{btMsg(mode==='trace'?'Viết theo thứ tự nét, bắt đầu từ chấm số 1.':'Viết từng nét theo trí nhớ (bấm 💡 nếu cần gợi ý).');btGuide();}
}
const btNum=(x,y,n,cls)=>`<g class="bw-num ${cls||''}"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.6"/><text x="${x.toFixed(1)}" y="${(y+1.7).toFixed(1)}">${n}</text></g>`;
function btMsg(h,cls){const m=$('#bw-msg');if(m){m.innerHTML=h;m.className='bw-msg '+(cls||'');}}
function btChips(){
  const me=BW;if(!me) return;
  const t=me.f.t;
  $('#bw-strokes').innerHTML=t.split('').map((s,k)=>{
    const done=k<me.si||me.finished,now=k===me.si&&!me.finished;
    const show=done||(now&&(me.mode!=='blind'))||me.mode==='watch'&&now;
    return `<span class="bs${done?' done':now?' now':''}">${k+1}${show?' · '+btStrokeName(s):''}</span>`;
  }).join('');
}
function btGuide(){ // chấm báo điểm bắt đầu nét kế tiếp (chỉ ở chế độ tập)
  const me=BW,g=$('#bw-hint');if(!me||!g) return;
  g.innerHTML='';
  if(me.mode!=='trace'||me.finished) return;
  const o=me.paths[me.si].getPointAtLength(0);
  g.innerHTML=`<circle class="bw-start" cx="${o.x.toFixed(1)}" cy="${o.y.toFixed(1)}" r="5"/>`;
}
const btSleep=ms=>new Promise(r=>setTimeout(r,ms));
function btDraw(me,p,ms){
  return new Promise(res=>{
    const L=p.getTotalLength();p.style.strokeDasharray=L;p.style.strokeDashoffset=L;
    const t0=performance.now();
    (function f(t){
      if(me.dead){res(false);return;}
      const k=Math.min(1,(t-t0)/ms),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
      p.style.strokeDashoffset=L*(1-e);
      if(k<1) requestAnimationFrame(f); else{p.style.strokeDasharray='';p.style.strokeDashoffset='';res(true);}
    })(t0);
  });
}
async function btPlay(){
  const me=BW;if(!me) return;
  me.si=0;me.finished=false;
  const A=$('#bw-anim'),N=$('#bw-nums');A.innerHTML='';N.innerHTML='';$('#bw-hint').innerHTML='';
  btChips();
  for(let k=0;k<me.total;k++){
    if(me.dead||BW!==me) return;
    me.si=k;btChips();
    const src=me.paths[k],o=src.getPointAtLength(0);
    btMsg(`Nét <b>${k+1}/${me.total}</b>: ${btStrokeName(me.f.t[k])}`);
    const p=document.createElementNS(BT_NS,'path');p.setAttribute('d',src.getAttribute('d'));p.setAttribute('class','bw-ink');A.appendChild(p);
    N.insertAdjacentHTML('beforeend',btNum(o.x,o.y,k+1));
    const ok=await btDraw(me,p,420+me.ref[k].len*9);
    if(!ok||me.dead||BW!==me) return;
    await btSleep(180);
  }
  if(me.dead||BW!==me) return;
  me.si=me.total;me.finished=true;btChips();
  btMsg(`Xong — <b>${me.total} nét</b>. Bấm ▶ xem lại, hoặc chọn <b>✍ tập</b> để tự viết.`);
}

/* --- vẽ tay & chấm nét --- */
const btPt=(svg,e)=>{const b=svg.getBoundingClientRect();return {x:(e.clientX-b.left)/b.width*109,y:(e.clientY-b.top)/b.height*109};};
const btPathStr=pts=>pts.length?'M'+pts.map(p=>p.x.toFixed(1)+' '+p.y.toFixed(1)).join('L'):'';
function btDown(e,me){
  if(me!==BW||me.dead) return;
  if(me.mode==='watch'){btMsg('Đang ở chế độ <b>xem</b> — chọn <b>✍ tập</b> hoặc <b>🧠 nhớ</b> để tự viết.');return;}
  if(me.finished) return;
  e.preventDefault();
  try{me.svg.setPointerCapture(e.pointerId);}catch(_){}
  me.pts=[btPt(me.svg,e)];
  const u=$('#bw-up');u.setAttribute('class','bw-user');u.setAttribute('d',btPathStr(me.pts)+'l0 0');
}
function btMove(e,me){
  if(!me.pts||me!==BW) return;
  const p=btPt(me.svg,e),l=me.pts[me.pts.length-1];
  if(Math.hypot(p.x-l.x,p.y-l.y)<.7) return;
  me.pts.push(p);$('#bw-up').setAttribute('d',btPathStr(me.pts));
}
function btUp(e,me,cancel){
  if(!me.pts||me!==BW) return;
  const pts=me.pts;me.pts=null;
  const u=$('#bw-up');
  if(cancel){u.setAttribute('d','');return;}
  const j=btJudge(pts,me);
  if(j.ok) btAccept(me);
  else btReject(me,j,u);
}
function btRes(pts,n){
  const d=[0];for(let i=1;i<pts.length;i++) d[i]=d[i-1]+Math.hypot(pts[i].x-pts[i-1].x,pts[i].y-pts[i-1].y);
  const tot=d[d.length-1],out=[];
  if(tot<1e-6){for(let k=0;k<n;k++) out.push({x:pts[0].x,y:pts[0].y});return out;}
  let j=1;
  for(let k=0;k<n;k++){
    const t=tot*k/(n-1);
    while(j<d.length-1&&d[j]<t) j++;
    const f=Math.max(0,Math.min(1,(t-d[j-1])/((d[j]-d[j-1])||1)));
    out.push({x:pts[j-1].x+(pts[j].x-pts[j-1].x)*f,y:pts[j-1].y+(pts[j].y-pts[j-1].y)*f});
  }
  return out;
}
function btScore(u,r){
  const N=u.length;let a=0;
  for(let j=0;j<N;j++) a+=Math.hypot(u[j].x-r[j].x,u[j].y-r[j].y);
  return {a:a/N,s:Math.hypot(u[0].x-r[0].x,u[0].y-r[0].y),e:Math.hypot(u[N-1].x-r[N-1].x,u[N-1].y-r[N-1].y)};
}
const btTol=len=>Math.min(16,Math.max(10,9+len*.08));
const btFit=(sc,len)=>{const t=btTol(len);return sc.a<=t&&sc.s<=t*1.6&&sc.e<=t*1.6;};
function btJudge(pts,me){
  const N=me.ref[0].p.length,u=btRes(pts,N),i=me.si;
  const ex=btScore(u,me.ref[i].p);
  let better=-1,bestA=ex.a-4;
  for(let k=i+1;k<me.total;k++){
    const s=btScore(u,me.ref[k].p);
    if(btFit(s,me.ref[k].len)&&s.a<bestA){better=k;bestA=s.a;}
  }
  if(btFit(ex,me.ref[i].len)&&better<0) return {ok:true};
  if(better>=0) return {ok:false,why:'order',k:better};
  const rev=btScore(u.slice().reverse(),me.ref[i].p);
  if(btFit(rev,me.ref[i].len)) return {ok:false,why:'rev'};
  return {ok:false,why:'bad'};
}
function btAccept(me){
  const i=me.si,done=$('#bw-done'),u=$('#bw-up');
  u.setAttribute('d','');
  const p=document.createElementNS(BT_NS,'path');p.setAttribute('d',me.paths[i].getAttribute('d'));p.setAttribute('class','bw-ok');done.appendChild(p);
  btDraw(me,p,260);
  $('#bw-hint').innerHTML='';
  me.si++;me.miss=0;
  if(me.mode==='blind'){const o=me.paths[i].getPointAtLength(0);$('#bw-nums').insertAdjacentHTML('beforeend',btNum(o.x,o.y,i+1,'f'));}
  if(me.si>=me.total){
    me.finished=true;btChips();
    const s=btS(me.r.c);s.w++;btSave();
    btMsg(`✓ Hoàn thành <b>${btEsc(me.r.hv)}</b> — ${me.total} nét, ${me.missTot} lần sai${me.hints?', '+me.hints+' gợi ý':''}. Nhấn <kbd>enter</kbd> / ▶ để sang bộ tiếp.`,'ok');
    return;
  }
  btChips();btGuide();
  btMsg(`✓ Đúng — nét tiếp theo: <b>${me.si+1}/${me.total}</b>${me.mode==='blind'?'':' ('+btStrokeName(me.f.t[me.si])+')'}`,'ok');
}
function btReject(me,j,u){
  me.miss++;me.missTot++;
  u.setAttribute('class','bw-user bad');
  setTimeout(()=>{if(BW===me){u.setAttribute('d','');u.setAttribute('class','bw-user');}},380);
  const need=me.si+1;
  if(j.why==='order') btMsg(`✗ Sai thứ tự — đây là nét ${j.k+1}; bây giờ cần <b>nét ${need}</b>${me.mode==='blind'?'':' ('+btStrokeName(me.f.t[me.si])+')'}.`,'bad');
  else if(j.why==='rev') btMsg(`✗ Đúng hình nhưng <b>ngược chiều</b> — nét ${need} viết theo chiều ngược lại.`,'bad');
  else btMsg(`✗ Chưa đúng nét ${need} — thử lại${me.miss>=2?' (hoặc bấm 💡)':''}.`,'bad');
  if(me.miss>=(me.mode==='blind'?4:3)) btHint();
}
function btHint(){
  const me=BW;if(!me||me.finished||me.mode==='watch') return;
  me.hints++;
  const g=$('#bw-hint'),src=me.paths[me.si],o=src.getPointAtLength(0);
  g.innerHTML='';
  const p=document.createElementNS(BT_NS,'path');p.setAttribute('d',src.getAttribute('d'));p.setAttribute('class','bw-hl');g.appendChild(p);
  g.insertAdjacentHTML('beforeend',`<circle class="bw-start" cx="${o.x.toFixed(1)}" cy="${o.y.toFixed(1)}" r="5"/>`);
  btDraw(me,p,650);
  btMsg(`💡 Nét <b>${me.si+1}</b>: ${btStrokeName(me.f.t[me.si])} — viết từ chấm tròn.`);
}
function btWNav(d,rand){
  const L=btList();if(!L.length) return;
  let idx=L.findIndex(x=>x.i===cfg.bCur);
  if(rand) idx=Math.random()*L.length|0; else idx=(idx+d+L.length)%L.length;
  cfg.bCur=L[idx].i;saveCfg();btShow();
}
function btGoWrite(i){
  cfg.bMode='write';cfg.bCur=i;
  if(btList().every(x=>x.i!==i)){cfg.bSel=[];cfg.bOnly='all';BDRILL=null;}
  saveCfg();renderBars();btShow();
}

/* ---------- sự kiện ---------- */
function btKeydown(e){
  const t=e.target;
  if(t&&t.id==='bq-in'){if(e.key==='Enter'){e.preventDefault();btQEnter();}return;}
  if(t&&(t.tagName==='INPUT'||t.tagName==='SELECT'||t.tagName==='TEXTAREA')) return;
  if(e.ctrlKey||e.metaKey||e.altKey) return;
  const m=cfg.bMode;
  if(m==='quiz'){
    if(e.key==='Enter'||e.key===' '){e.preventDefault();btQEnter();}
    else if(/^[1-4]$/.test(e.key)) btQPick(+e.key-1);
    else if(e.key==='Tab'){e.preventDefault();BQ=null;btShow();}
  }else if(m==='write'&&BW){
    if(e.key==='ArrowRight'||(e.key==='Tab'&&!e.shiftKey)){e.preventDefault();btWNav(1);}
    else if(e.key==='ArrowLeft'||(e.key==='Tab'&&e.shiftKey)){e.preventDefault();btWNav(-1);}
    else if(e.key==='Enter'&&BW.finished&&BW.mode!=='watch'){e.preventDefault();btWNav(1);}
    else if(e.key===' '){e.preventDefault();if(BW.mode==='watch') btPlay(); else if(BW.finished) btWNav(1); else btHint();}
    else if(e.key==='h'||e.key==='?'){btHint();}
    else if(e.key==='Backspace'){e.preventDefault();if(BW.mode!=='watch') btShow();}
  }else if(e.key==='Tab'){e.preventDefault();}
}
document.addEventListener('click',e=>{
  if(cfg.app!=='bothu') return;
  const root=e.target.closest('#bt');if(!root) return;
  const hid=e.target.closest('.bhid');
  if(hid){hid.classList.remove('bhid');e.stopPropagation();return;}
  const bk=e.target.closest('[data-bk]');
  if(bk){
    const r=BT[+bk.dataset.bk],s=btS(r.c);s.k=s.k?0:1;btSave();
    const card=bk.closest('.bcard');card.classList.toggle('k',!!s.k);bk.textContent=s.k?'★':'☆';
    renderBars();return;
  }
  const card=e.target.closest('.bcard');
  if(card){btGoWrite(+card.dataset.bi);return;}
  const q=e.target.closest('[data-bq]');
  if(q){
    const a=q.dataset.bq;
    if(a==='check'){const i=$('#bq-in');if(i&&i.value.trim()) btQEnter();else if(i) i.focus();}
    else if(a==='skip') btQAnswer(false,'');
    else if(a==='pick') btQPick(+q.dataset.k);
    else if(a==='next') btQNext();
    else if(a==='restart'){BQ=null;btShow();}
    else if(a==='write'&&BQ&&BQ.cur) btGoWrite(BQ.cur.r.i);
    else if(a==='drill'&&BQ){BDRILL=new Set(BQ.wrong.keys());const l=btList();BQ=null;btQStart(l);renderBars();btShow();}
    else if(a==='writewrong'&&BQ){BDRILL=new Set(BQ.wrong.keys());cfg.bMode='write';cfg.bCur=btList()[0].i;saveCfg();renderBars();btShow();}
    return;
  }
  const w=e.target.closest('[data-bw]');
  if(w&&BW){
    const a=w.dataset.bw;
    if(a==='prev') btWNav(-1);
    else if(a==='next') btWNav(1);
    else if(a==='rand') btWNav(0,true);
    else if(a==='replay'){if(BW.mode==='watch') btPlay(); else btShow();}
    else if(a==='reset') btShow();
    else if(a==='hint') btHint();
    else if(a==='known'){const s=btS(BW.r.c);s.k=s.k?0:1;btSave();w.textContent=s.k?'★ đã thuộc':'☆ đánh dấu đã thuộc';w.classList.toggle('pri',!!s.k);renderBars();}
    return;
  }
  const fm=e.target.closest('[data-bwf]');
  if(fm&&BW){btWriteBuild(BW.r,+fm.dataset.bwf);return;}
  if(e.target.closest('[data-bt="reset"]')){cfg.bSel=[];cfg.bOnly='all';BDRILL=null;BQ=null;saveCfg();renderBars();btShow();}
});
