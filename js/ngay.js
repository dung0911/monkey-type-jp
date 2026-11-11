/* ============ 日 Ngày & số — bảng + luyện gõ romaji ngày / tháng / thứ / số đếm ============
   Dữ liệu: data/ngay.js (NGAY). Nạp TRƯỚC script chính nên chỉ khai báo hàm;
   cfg/store/$/opt/renderBars… chỉ dùng lúc gọi. Dùng lại btEsc, btShuf của js/bothu.js. */

/* ---------- kana → romaji (Hepburn) ---------- */
const DT_KANA=(()=>{
  const m={};
  const rows=[
    ['あいうえお','a i u e o'],['かきくけこ','ka ki ku ke ko'],['さしすせそ','sa shi su se so'],['たちつてと','ta chi tsu te to'],
    ['なにぬねの','na ni nu ne no'],['はひふへほ','ha hi fu he ho'],['まみむめも','ma mi mu me mo'],['やゆよ','ya yu yo'],
    ['らりるれろ','ra ri ru re ro'],['わを','wa wo'],['がぎぐげご','ga gi gu ge go'],['ざじずぜぞ','za ji zu ze zo'],
    ['だぢづでど','da ji zu de do'],['ばびぶべぼ','ba bi bu be bo'],['ぱぴぷぺぽ','pa pi pu pe po']
  ];
  rows.forEach(([k,r])=>{const rs=r.split(' ');[...k].forEach((c,i)=>{m[c]=rs[i];});});
  const sm={'ゃ':'a','ゅ':'u','ょ':'o'},base={'き':'ky','し':'sh','ち':'ch','に':'ny','ひ':'hy','み':'my','り':'ry','ぎ':'gy','じ':'j','び':'by','ぴ':'py'};
  const combo={};
  for(const b in base) for(const s in sm) combo[b+s]=base[b]+sm[s];
  return {m,combo};
})();
const dtSyl=(cs,i)=>cs[i]&&(DT_KANA.combo[cs[i]+(cs[i+1]||'')]||DT_KANA.m[cs[i]])||'';
// tách thành chuỗi + {n:loại} cho ん (loại: v = trước nguyên âm/y, n = trước hàng な, c = phụ âm khác, end = cuối từ)
function dtParts(kana){
  const out=[],cs=[...kana];
  for(let i=0;i<cs.length;i++){
    const c=cs[i];
    if(c==='っ'){const nx=dtSyl(cs,i+1);out.push(nx.startsWith('ch')?'t':nx[0]||'');continue;}
    if(c==='ー'){const p=out.length&&typeof out[out.length-1]==='string'?out[out.length-1]:'';out.push(p.slice(-1));continue;}
    if(c==='ん'){const nx=dtSyl(cs,i+1);out.push({n:!nx?'end':/^[aiueoy]/.test(nx)?'v':nx[0]==='n'?'n':'c'});continue;}
    const two=c+(cs[i+1]||'');
    if(DT_KANA.combo[two]){out.push(DT_KANA.combo[two]);i++;continue;}
    out.push(DT_KANA.m[c]||'');
  }
  return out;
}
// mọi cách gõ hợp lệ (n' = ~, nn…) — ん trước nguyên âm/y bắt buộc nn hoặc n'
function dtVariants(kana){
  let acc=[''];
  for(const p of dtParts(kana)){
    if(typeof p==='string') acc=acc.map(a=>a+p);
    else{
      const o=p.n==='v'?['nn','~']:['n','nn','~'];
      acc=acc.flatMap(a=>o.map(x=>a+x));
    }
  }
  return acc;
}
const dtDisp=kana=>dtParts(kana).map(p=>typeof p==='string'?p:p.n==='v'?"n'":'n').join('');
// chuẩn hoá chữ người gõ: chấp nhận si/shi, ti/chi, tu/tsu, hu/fu, zi/ji, jya/ja; n' → ~
function dtNorm(s){
  return String(s).toLowerCase().replace(/n['’]/g,'~').replace(/[^a-z~]/g,'')
    .replace(/[jz]y([aiueo])/g,'j$1').replace(/shi|si/g,'shi').replace(/chi|ti/g,'chi')
    .replace(/tsu|tu/g,'tsu').replace(/(^|[^sc])hu/g,'$1fu').replace(/zi/g,'ji');
}

/* ---------- dữ liệu → các mục luyện ---------- */
const DT_DAYS=NGAY.days.map(d=>({id:'d'+d.n,t:'day',n:d.n,k:d.n+'日',vi:d.n<=10?'mùng '+d.n:'ngày '+d.n,r:d.r,tip:d.tip||'',trap:!!d.trap,num:d.n}));
const DT_MONTHS=NGAY.months.map(d=>({id:'m'+d.n,t:'month',n:d.n,k:d.n+'月',vi:'tháng '+d.n,r:d.r,tip:d.tip||'',trap:!!d.trap}));
const DT_WEEKS=NGAY.weeks.map((d,i)=>({id:'w'+i,t:'week',k:d.k,vi:d.vi,r:d.r,tip:d.tip||''}));
const DT_ASKS=NGAY.asks.map((d,i)=>({id:'q'+i,t:'ask',k:d.k,vi:d.vi,r:d.r,tip:''}));
const DT_GROUPS=NGAY.groups.map(g=>({id:g.id,btn:g.btn,title:g.title,note:g.note,items:g.items.map((x,i)=>({id:'g'+g.id+i,t:g.id,k:x[0],vi:x[1],r:x[2],tip:x[3]||'',trap:!!x[4]}))}));
const DT_TYPES={day:'ngày',month:'tháng',week:'thứ',date:'tháng + ngày',ask:'câu hỏi'};
DT_GROUPS.forEach(g=>{DT_TYPES[g.id]=g.title;});
const DT_KINDS=[['mix','🔀 mix'],['mung','mùng 1–10'],['tricky','ngày hay nhầm'],['day','cả 31 ngày'],['month','tháng'],['week','thứ'],['date','tháng + ngày'],['ask','何～']].concat(DT_GROUPS.map(g=>[g.id,g.btn]));
function dtDate(){
  const m=DT_MONTHS[Math.random()*12|0],d=DT_DAYS[Math.random()*31|0];
  const r=[];m.r.forEach(a=>d.r.forEach(b=>r.push(a+b)));
  return {id:'x'+m.n+'.'+d.n,t:'date',k:m.n+'月'+d.n+'日',vi:'ngày '+d.n+' tháng '+m.n,r,tip:[m.tip,d.tip].filter(Boolean).join(' · '),trap:m.trap||d.trap};
}
function dtPool(kind){
  switch(kind){
    case 'mung': return DT_DAYS.filter(x=>x.n<=10);
    case 'tricky': return DT_DAYS.filter(x=>x.trap);
    case 'day': return DT_DAYS.slice();
    case 'month': return DT_MONTHS.slice();
    case 'week': return DT_WEEKS.slice();
    case 'ask': return DT_ASKS.slice();
    case 'date': return null;
    case 'mix': return DT_DAYS.concat(DT_MONTHS,DT_WEEKS,DT_ASKS,...DT_GROUPS.map(g=>g.items));
    default: {const g=DT_GROUPS.find(x=>x.id===kind);return g?g.items.slice():DT_DAYS.slice();}
  }
}
let DSTAT=null;
const dtStat=()=>DSTAT||(DSTAT=store.get('kanatype.dstat',{}));
function dtBuild(n){
  const kind=cfg.dKind,out=[];
  if(kind==='date'){while(out.length<n) out.push(dtDate());return out;}
  const pool=dtPool(kind);
  if(kind==='mix'){for(let i=0;i<Math.max(1,Math.round(n/8));i++) pool.push(dtDate());}
  const weak=cfg.dOrder==='weak';
  let left=[];
  while(out.length<n){
    if(!left.length) left=pool.slice();
    let pick;
    if(weak){
      const ws=left.map(it=>{const s=dtStat()[it.id];return s?1+6*s.e/(s.e+s.o+1):1.8;});
      let r=Math.random()*ws.reduce((a,b)=>a+b,0),i=0;
      for(;i<left.length-1;i++){r-=ws[i];if(r<=0) break;}
      pick=left.splice(i,1)[0];
    }else pick=left.splice(Math.random()*left.length|0,1)[0];
    out.push(pick);
  }
  if(!weak) btShuf(out);
  // tránh lặp liên tiếp cùng một mục
  for(let i=1;i<out.length;i++) if(out[i].id===out[i-1].id&&i+1<out.length){[out[i],out[i+1]]=[out[i+1],out[i]];}
  return out;
}

/* ---------- thanh chọn ---------- */
let DQ=null;
function renderDtBars(b1,b2){
  let h=[['table','📖 bảng'],['quiz','⌨ luyện gõ']].map(([k,l])=>opt(cfg.dMode===k,l,'dtm:'+k)).join('');
  h+='<span class="sep"></span>';
  if(cfg.dMode==='table'){
    h+=[['none','hiện hết'],['read','che cách đọc'],['vi','che nghĩa']].map(([k,l])=>opt(cfg.dHide===k,l,'dth:'+k)).join('');
    b2.innerHTML='<span class="count">ngày · tháng · thứ · số đếm — bấm vào ô bị che để xem</span>';
  }else{
    h+=DT_KINDS.map(([k,l])=>opt(cfg.dKind===k,l,'dtk:'+k)).join('');
    b2.innerHTML=[['both','kanji + nghĩa'],['kanji','chỉ kanji'],['vi','chỉ nghĩa']].map(([k,l])=>opt(cfg.dShow===k,l,'dts:'+k)).join('')
      +'<span class="sep"></span>'+[['random','ngẫu nhiên'],['weak','ưu tiên mục sai']].map(([k,l])=>opt(cfg.dOrder===k,l,'dto:'+k)).join('')
      +'<span class="sep"></span>'+[10,20,40].map(v=>opt(cfg.dCount===v,v,'dtc:'+v)).join('');
  }
  b1.innerHTML=h;b2.style.display='';
  $('#tagbox').innerHTML='';
}
function dtBarAct(a,v){
  if(a==='dtm') cfg.dMode=v;
  else if(a==='dth') cfg.dHide=v;
  else if(a==='dtk'){cfg.dKind=v;DQ=null;}
  else if(a==='dts'){cfg.dShow=v;}
  else if(a==='dto'){cfg.dOrder=v;DQ=null;}
  else if(a==='dtc'){cfg.dCount=+v;DQ=null;}
  saveCfg();renderBars();dtShow();
}
function dtShow(){
  $('#test').style.display='none';$('#res').classList.remove('show');
  $('#dt').style.display='';
  if(DQ&&DQ.timer){clearTimeout(DQ.timer);DQ.timer=0;}
  if(cfg.dMode==='table') dtRenderTable(); else dtRenderQuiz();
}

/* ---------- bảng ---------- */
function dtCell(it,hide,label){
  const rd=it.r[0];
  const alt=it.r.length>1?`<div class="dt-alt">hoặc ${it.r.slice(1).map(x=>btEsc(x)).join(' / ')}</div>`:'';
  return `<div class="dt-cell${it.trap?' trap':''}"><div class="dt-k bjp">${btEsc(it.k)}</div>`
    +`<div class="dt-r bjp${hide==='read'?' bhid':''}">${btEsc(rd)}</div>`
    +`<div class="dt-ro${hide==='read'?' bhid':''}">${btEsc(dtDisp(rd))}</div>${alt}`
    +`<div class="dt-v${hide==='vi'?' bhid':''}">${btEsc(label||it.vi)}</div></div>`;
}
function dtRenderTable(){
  const hide=cfg.dHide;
  let h=`<div class="dt"><div class="rk-intro">${btEsc(NGAY.intro)}</div>`;
  h+='<section class="dt-sec"><h4>Ngày trong tháng 日 <small>mùng 1–10 · 14 · 20 · 24 đọc riêng; ô viền vàng = chỗ hay nhầm</small></h4><div class="dt-grid">'
    +DT_DAYS.map(it=>dtCell(it,hide)).join('')+'</div></section>';
  h+='<section class="dt-sec"><h4>Tháng 月 <small>4月 し · 7月 しち · 9月 く</small></h4><div class="dt-grid">'
    +DT_MONTHS.map(it=>dtCell(it,hide)).join('')+'</div></section>';
  h+='<section class="dt-sec"><h4>Thứ 曜日</h4><div class="dt-grid">'+DT_WEEKS.map(it=>dtCell(it,hide)).join('')+'</div></section>';
  h+='<section class="dt-sec"><h4>Câu hỏi 何～</h4><div class="dt-grid">'+DT_ASKS.map(it=>dtCell(it,hide)).join('')+'</div></section>';
  for(const g of DT_GROUPS) h+=`<section class="dt-sec"><h4>${btEsc(g.title)} <small>${btEsc(g.note)}</small></h4><div class="dt-grid">${g.items.map(it=>dtCell(it,hide)).join('')}</div></section>`;
  h+='<section class="dt-sec"><h4>Ghép tháng + ngày <small>đọc tháng trước, ngày sau</small></h4><div class="dt-ex">'
    +[[7,4],[4,1],[9,20],[12,24],[3,14]].map(([m,d])=>{const M=DT_MONTHS[m-1],D=DT_DAYS[d-1];return `<div class="dt-e"><span class="bjp k">${m}月${d}日</span><span class="${hide==='read'?'bhid':''}"><span class="bjp">${M.r[0]+D.r[0]}</span> · ${dtDisp(M.r[0]+D.r[0])}</span><span class="v${hide==='vi'?' bhid':''}">ngày ${d} tháng ${m}</span></div>`;}).join('')
    +'</div></section></div>';
  $('#dt').innerHTML=h;
}

/* ---------- luyện gõ ---------- */
function dtStart(specs){
  if(!specs) specs=dtBuild(cfg.dCount||20).map(it=>({it,retry:false}));
  DQ={q:specs,i:0,total:specs.length,doneU:0,ok:0,err:0,wrong:new Map(),t0:Date.now(),done:false,cur:null,timer:0};
  dtMake();
}
function dtMake(){DQ.cur={it:DQ.q[DQ.i].it,retry:DQ.q[DQ.i].retry,answered:false,ok:false,given:''};}
function dtRenderQuiz(){
  const el=$('#dt');
  if(!DQ) dtStart();
  if(DQ.done){dtResult();return;}
  const c=DQ.cur,it=c.it,pct=Math.round(DQ.doneU/DQ.total*100),show=cfg.dShow;
  let h=`<div class="bq"><div class="bq-head"><span>câu <b>${Math.min(DQ.doneU+1,DQ.total)}</b>/${DQ.total}</span><span class="g">✓ ${DQ.ok}</span><span class="e">✗ ${DQ.err}</span>${c.retry?'<span class="rt">↻ hỏi lại</span>':''}<div class="bq-bar"><i style="width:${pct}%"></i></div></div><div class="bq-card">`;
  h+=`<div class="bq-s" style="margin:0 0 6px">${DT_TYPES[it.t]}</div>`;
  if(show!=='vi') h+=`<div class="bq-g bjp dt-big">${btEsc(it.k)}</div>`;
  if(show!=='kanji') h+=show==='vi'?`<div class="bq-g dt-vbig">${btEsc(it.vi)}</div>`:`<div class="bq-p"><b>${btEsc(it.vi)}</b></div>`;
  h+='<div class="bq-s">gõ cách đọc bằng romaji</div>'
    +`<input id="dq-in" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="vd: yokka" ${c.answered?'readonly value="'+btEsc(c.given)+'"':''}>`;
  if(c.answered){
    h+=`<div class="bq-fb ${c.ok?'ok':'bad'}">${c.ok?'✓ Đúng':'✗ Chưa đúng'}</div>`
      +`<div class="bq-ans"><div>Đáp án: <b class="bjp">${btEsc(it.r[0])}</b> · <b>${btEsc(dtDisp(it.r[0]))}</b>${it.r.length>1?'<br><small>cũng được: '+it.r.slice(1).map(x=>btEsc(x)+' ('+btEsc(dtDisp(x))+')').join(' · ')+'</small>':''}${it.tip?'<br><small>'+btEsc(it.tip)+'</small>':''}</div></div>`
      +'<div class="bq-btns"><button class="btn pri" data-dt="next">tiếp ↵</button></div>';
  }else h+='<div class="bq-btns"><button class="btn pri" data-dt="check">kiểm tra ↵</button><button class="btn" data-dt="skip">không biết</button></div>';
  h+='</div><div class="bq-foot"><button class="mini" data-dt="restart">↺ bắt đầu lại</button></div></div>';
  el.innerHTML=h;
  const inp=$('#dq-in');if(inp&&!c.answered) inp.focus({preventScroll:true});
}
function dtAnswer(ok,given){
  const c=DQ.cur;if(c.answered) return;
  c.answered=true;c.ok=ok;c.given=given||'';
  const st=dtStat(),s=st[c.it.id]||(st[c.it.id]={o:0,e:0});
  if(ok) s.o++;else s.e++;
  store.set('kanatype.dstat',DSTAT);
  if(!c.retry){if(ok) DQ.ok++;else{DQ.err++;DQ.wrong.set(c.it.id,c.it);}}
  if(ok) DQ.doneU++;
  else DQ.q.splice(Math.min(DQ.q.length,DQ.i+4),0,{it:c.it,retry:true});
  dtRenderQuiz();
  if(ok) DQ.timer=setTimeout(dtNext,650);
}
function dtNext(){
  if(!DQ||DQ.done) return;
  clearTimeout(DQ.timer);DQ.timer=0;
  DQ.i++;
  if(DQ.i>=DQ.q.length){DQ.done=true;DQ.t1=Date.now();}else dtMake();
  dtRenderQuiz();
}
const dtMatch=(it,s)=>{const t=dtNorm(s);return !!t&&it.r.some(r=>dtVariants(r).some(v=>dtNorm(v)===t));};
function dtEnter(){
  if(!DQ||DQ.done) return;
  if(DQ.cur.answered){dtNext();return;}
  const i=$('#dq-in'),v=i?i.value.trim():'';
  dtAnswer(!!v&&dtMatch(DQ.cur.it,v),v);
}
function dtResult(){
  const secs=Math.round((DQ.t1-DQ.t0)/1000),wr=[...DQ.wrong.values()];
  const acc=DQ.total?Math.round((DQ.total-wr.length)/DQ.total*100):0;
  let h=`<div class="bq"><div class="bq-res"><div class="big"><div class="lbl">đúng ngay lần đầu</div><div class="val">${acc}%</div></div>`
    +`<div class="stats"><div class="stat"><div class="lbl">câu hỏi</div><div class="val">${DQ.total}</div></div><div class="stat"><div class="lbl">sai</div><div class="val"><span class="bad">${wr.length}</span></div></div><div class="stat"><div class="lbl">thời gian</div><div class="val">${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}</div></div></div>`;
  if(wr.length){
    h+='<div class="miss"><div class="sec-lbl">cần ôn lại</div><div class="rk-wr">'+wr.map(it=>`<div class="rk-w"><span class="bjp k">${btEsc(it.k)}</span><div><b class="bjp">${btEsc(it.r[0])}</b> · ${btEsc(dtDisp(it.r[0]))} · ${btEsc(it.vi)}${it.tip?'<br><small>'+btEsc(it.tip)+'</small>':''}</div></div>`).join('')+'</div></div>';
  }else h+='<div class="pb">★ Không sai câu nào!</div>';
  h+=`<div class="btns">${wr.length?'<button class="btn pri" data-dt="drill">🔁 luyện lại câu sai</button>':''}<button class="btn${wr.length?'':' pri'}" data-dt="restart">▶ lượt mới</button></div></div></div>`;
  $('#dt').innerHTML=h;
}

/* ---------- sự kiện ---------- */
function dtKeydown(e){
  const t=e.target;
  if(t&&t.id==='dq-in'){
    if(e.key==='Enter'){e.preventDefault();dtEnter();}
    else if(e.key==='Tab'){e.preventDefault();DQ=null;dtShow();}
    return;
  }
  if(t&&(t.tagName==='INPUT'||t.tagName==='SELECT'||t.tagName==='TEXTAREA')) return;
  if(e.ctrlKey||e.metaKey||e.altKey) return;
  if(e.key==='Tab'){e.preventDefault();if(cfg.dMode==='quiz'){DQ=null;dtShow();}return;}
  if(cfg.dMode!=='quiz') return;
  if(e.key==='Enter'){e.preventDefault();dtEnter();}
  else if(e.key.length===1&&DQ&&!DQ.done&&!DQ.cur.answered){const i=$('#dq-in');if(i) i.focus();}
}
// gõ đúng là tự qua câu (không cần Enter)
document.addEventListener('input',e=>{
  if(cfg.app!=='date'||!e.target||e.target.id!=='dq-in'||!DQ||DQ.done||DQ.cur.answered) return;
  const v=e.target.value;
  if(dtMatch(DQ.cur.it,v)) dtAnswer(true,v);
});
document.addEventListener('click',e=>{
  if(cfg.app!=='date') return;
  const root=e.target.closest('#dt');if(!root) return;
  const hid=e.target.closest('.bhid');
  if(hid){hid.classList.remove('bhid');e.stopPropagation();return;}
  const a=e.target.closest('[data-dt]');if(!a) return;
  const k=a.dataset.dt;
  if(k==='check'){const i=$('#dq-in');if(i&&i.value.trim()) dtEnter();else if(i) i.focus();}
  else if(k==='skip') dtAnswer(false,'');
  else if(k==='next') dtNext();
  else if(k==='restart'){DQ=null;dtShow();}
  else if(k==='drill'&&DQ){
    dtStart(btShuf([...DQ.wrong.values()].map(it=>({it,retry:false}))));dtShow();
  }
});
