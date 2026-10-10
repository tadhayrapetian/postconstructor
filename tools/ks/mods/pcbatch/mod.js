KS.mod('pcbatch',{title:'Пакетная печать и склад открыток'});
/* ================= data ================= */
const PCK=['pcH','pcV'];
const isPC=()=>!!(st.dz&&PCK.includes(st.dz.kind));
const B=()=>KS.store('pcbatch',{items:[],paper:'1015',a4p:'photo',dx:0,dy:0,rev:false,done:{}});
const SK=()=>KS.store('pcstock',{rows:{},log:[],filter:'all',q:'',defMin:5,defPrice:0});
const num=(v,d)=>{ const n=parseFloat(String(v==null?'':v).replace(',','.')); return isFinite(n)?n:(d||0); };
const int=(v,a,b)=>Math.max(a,Math.min(b,Math.round(num(v,a))));
const fmtK=k=>k==='pcV'?'10 × 15':'15 × 10';
const pcCopies=()=>Math.max(1,Math.min(200,+((st.ks&&st.ks.postcard&&st.ks.postcard.copies)||1)));
let rev=1; const bump=()=>{ rev++; };
const PXm=()=>typeof PX==='number'&&PX>0?PX:96/25.4;

/* ---- snapshots: deep copies of designs, kept in IndexedDB (photos can be megabytes) + memory cache ---- */
const SNAP={};
function hashStr(s){ let a=0x811c9dc5, b=0x9747b28c; for(let i=0;i<s.length;i++){ const c=s.charCodeAt(i); a=Math.imul(a^c,16777619); b=Math.imul(b^c,0x5bd1e995); b^=b>>>15; } return (a>>>0).toString(36)+(b>>>0).toString(36); }
function sig(d){ const c=x=>(x||[]).filter(e=>!e.hide).map(e=>{ const o=Object.assign({},e); delete o.id; return o; });
  return JSON.stringify([d.kind,Math.round(d.w),Math.round(d.h),d.pal,d.fonts,d.bg,d.bgBack,d.bgImg||'',d.bgImgBack||'',d.bgImgOp,c(d.front),c(d.back),d.brand||{}]); }
function snapOf(d){ const c=JSON.parse(JSON.stringify(d)); c.on=true; delete c.job; delete c.galPal; if(!c.brand||typeof c.brand!=='object') c.brand={}; ['front','back'].forEach(k=>{ if(!Array.isArray(c[k])) c[k]=[]; }); return c; }
function putSnap(doc){ const id='d'+hashStr(sig(doc)); if(!SNAP[id]){ SNAP[id]=doc; KS.idb.set('pcb:'+id,doc).catch(e=>console.warn('[pcbatch] idb',e)); } return id; }
let loading=null;
function ensureSnaps(){ const ids=new Set(); B().items.forEach(i=>ids.add(i.snap)); Object.values(SK().rows).forEach(r=>r.snap&&ids.add(r.snap));
  const miss=[...ids].filter(id=>id&&!SNAP[id]); if(!miss.length) return Promise.resolve(false); if(loading) return loading;
  loading=Promise.all(miss.map(id=>KS.idb.get('pcb:'+id).then(d=>{ if(d) SNAP[id]=d; else SNAP[id]=null; }).catch(()=>{ SNAP[id]=null; })))
    .then(()=>{ /* lost snapshot of a gallery template: rebuild it from the template */
      B().items.concat(Object.values(SK().rows)).forEach(x=>{ if(x.snap&&!SNAP[x.snap]&&x.tid){ const T=findTpl(x.tid); if(T){ SNAP[x.snap]=docFromTpl(T); KS.idb.set('pcb:'+x.snap,SNAP[x.snap]).catch(()=>{}); } } });
      loading=null; return true; });
  return loading; }
const pcTpls=()=>DZT.filter(t=>PCK.includes(t.kind));
const myTpls=()=>(st.myTpl||[]).filter(t=>PCK.includes(t.kind));
const findTpl=id=>(st.myTpl||[]).concat(DZT).find(t=>t.id===id);
function docFromTpl(T){ const d=dzFromTpl(T,T.w,T.h,null); d.brand=JSON.parse(JSON.stringify((st.dz&&st.dz.brand)||{})); return snapOf(d); }
function designName(d){ const T=d&&d.tid&&findTpl(d.tid); if(T&&T.name) return T.name; const t=((d&&d.front)||[]).find(e=>e.t==='text'&&(e.text||'').trim()); return t?t.text.split('\n')[0].trim().slice(0,30):'Открытка'; }
const hasBack=d=>!!(d&&(d.back||[]).some(e=>!e.hide));
function risks(d){ const r={edge:false,empty:0}; if(!d) return r; const W=d.w,H=d.h, white=v=>v==null||v==='white'||(v==='bg'&&String(dzPal(d.pal).bg).toLowerCase()==='#ffffff')||(typeof v==='string'&&/^#?f{3}(f{3})?$/i.test(v));
  ['front','back'].forEach(sd=>(d[sd]||[]).forEach(e=>{ if(e.hide) return; if(e.t==='img'&&!e.src&&e.k!=='logo') r.empty++; if(e.x<5||e.y<5||e.x+e.w>W-5||e.y+e.h>H-5) r.edge=true; }));
  if(!white(d.bg)||d.bgImg) r.edge=true; return r; }

/* ================= print list ================= */
function addDoc(doc,name,tid){ const s=B(), id=putSnap(doc); let it=s.items.find(i=>i.snap===id);
  if(it){ it.qty=Math.min(999,it.qty+1); KS.save(); bump(); refresh(); KS.toast(`«${it.name}» уже в пакете — теперь ${it.qty} шт`); return it; }
  it={id:KS.uid('b'),snap:id,name:name||designName(doc),kind:doc.kind||(doc.h>doc.w?'pcV':'pcH'),w:doc.w,h:doc.h,qty:1,sides:hasBack(doc)&&(doc.sides||1)>1?2:1,two:hasBack(doc),tid:tid||'',added:Date.now()};
  s.items.push(it); s.done={}; KS.save(); bump(); refresh(); KS.toast(`В пакете: «${it.name}»`); return it; }
function addCurrent(){ if(!isPC()){ KS.toast('Откройте открытку 10 × 15 в «Макете» — её можно добавить в пакет'); return null; } const doc=snapOf(st.dz); return addDoc(doc,designName(st.dz),''); }
function addTpl(T){ if(!T) return null; return addDoc(docFromTpl(T),T.name,T.id); }

function slots(){ const L=[], it=B().items.filter(i=>SNAP[i.snap]&&i.qty>0); it.filter(i=>i.sides>1).concat(it.filter(i=>i.sides<2)).forEach(i=>{ for(let k=0;k<i.qty;k++) L.push(i); }); return L; }
function plan(){ const s=B(), L=slots(), a4=s.paper==='a4'; const sheets=[]; const per=a4?2:1; for(let i=0;i<L.length;i+=per) sheets.push(L.slice(i,i+per));
  const backs=sheets.filter(sh=>sh.some(i=>i.sides>1)); return {a4,cards:L.length,sheets,backs,front:sheets.length,back:backs.length,two:L.filter(i=>i.sides>1).length}; }
/* A4 portrait, 2 per sheet, vertical cards turned 90°. Long-edge flip mirrors x; y stays. */
const A4W=210, A4H=297, GAP=10;
function geo(it,j){ const rot=it.h>it.w, cw=rot?it.h:it.w, ch=rot?it.w:it.h; return {rot,cw,ch,x:(A4W-cw)/2,y:j===0?(A4H/2-GAP/2-ch):(A4H/2+GAP/2)}; }
const r2=v=>Math.round(v*100)/100;
function marks(x,y,cw,ch){ let h=''; const L='border-top:.15mm solid #8a8a8a', V='border-left:.15mm solid #8a8a8a';
  [[x,y,-1,-1],[x+cw,y,1,-1],[x,y+ch,-1,1],[x+cw,y+ch,1,1]].forEach(([mx,my,sx,sy])=>{ h+=`<div class="pcb-mk" style="position:absolute;left:${r2(sx<0?mx-4:mx+1)}mm;top:${r2(my)}mm;width:3mm;${L}"></div><div class="pcb-mk" style="position:absolute;left:${r2(mx)}mm;top:${r2(sy<0?my-4:my+1)}mm;height:3mm;${V}"></div>`; }); return h; }
function sideHTML(it,sd){ const d=SNAP[it.snap]; return d?dzHTML(d,sd,{brand:d.brand||{}}):''; }
function slotHTML(it,j,back){ const s=B(), g=geo(it,j), W=it.w, H=it.h; let x=g.x, y=g.y, tf='';
  if(back){ x=A4W-g.x-g.cw+num(s.dx); y=g.y+num(s.dy); if(g.rot) tf=`transform:translateY(${g.ch}mm) rotate(-90deg)`; }
  else if(g.rot) tf=`transform:translateX(${g.cw}mm) rotate(90deg)`;
  const inner=sideHTML(it,back?'back':'front');
  return `<div class="pcb-slot" data-pcbslot="${back?'b':'f'}${j}" data-rot="${g.rot?(back?-90:90):0}" style="position:absolute;left:${r2(x)}mm;top:${r2(y)}mm;width:${r2(g.cw)}mm;height:${r2(g.ch)}mm;overflow:hidden">${tf?`<div style="position:absolute;left:0;top:0;width:${W}mm;height:${H}mm;transform-origin:0 0;${tf}">${inner}</div>`:inner}</div>`+(back?'':marks(x,y,g.cw,g.ch)); }
function frontPages(P){ return P.sheets.map((sh,n)=>P.a4?KS.page(A4W,A4H,sh.map((it,j)=>slotHTML(it,j,false)).join(''),'paket-lico-'+(n+1)):KS.page(sh[0].w,sh[0].h,sideHTML(sh[0],'front'),'otkrytka-lico-'+(n+1))); }
function backPages(P){ const s=B(); let L=P.a4?P.backs.map((sh,n)=>KS.page(A4W,A4H,sh.map((it,j)=>it.sides>1?slotHTML(it,j,true):'').join(''),'paket-oborot-'+(n+1)))
    :P.backs.map((sh,n)=>{ const it=sh[0], dx=num(s.dx), dy=num(s.dy); return KS.page(it.w,it.h,dx||dy?`<div style="position:absolute;left:${dx}mm;top:${dy}mm;width:${it.w}mm;height:${it.h}mm">${sideHTML(it,'back')}</div>`:sideHTML(it,'back'),'otkrytka-oborot-'+(n+1)); });
  if(s.rev) L=L.reverse(); return L; }
async function doPrint(which){ await ensureSnaps(); const P=plan(); if(!P.cards){ KS.toast('Пакет пуст — добавьте открытки'); return; }
  const miss=B().items.filter(i=>i.qty>0&&!SNAP[i.snap]); if(miss.length) KS.toast('Не найден макет: '+miss.map(i=>'«'+i.name+'»').join(', ')+' — пропускаю');
  if(which==='back'&&!P.back){ KS.toast('В пакете нет двусторонних открыток'); return; }
  const pages=which==='back'?backPages(P):frontPages(P); const s=B(); s.done=Object.assign({},s.done,{[which]:Date.now()}); KS.save();
  if(which==='front'){ let n=0; s.items.forEach(i=>{ if(i.qty>0&&SNAP[i.snap]){ stockAdd(i.snap,i.name,i,i.qty,'print'); n+=i.qty; } }); setTimeout(()=>KS.toast(`Склад: +${n} шт напечатано`),2600); }
  bump(); refresh(); await KS.print(pages); }

/* ================= inventory ================= */
const left=r=>(r.auto||0)+(r.man||0)-(r.sold||0);
const isLow=r=>(+r.min||0)>0&&left(r)<=(+r.min||0);
function stockRow(snap,name,src){ const S=SK(); let r=S.rows[snap]; if(!r){ const d=SNAP[snap]||src||{}; r=S.rows[snap]={key:snap,snap,name:name||'Открытка',kind:d.kind||'pcH',w:d.w||152,h:d.h||102,tid:d.tid||src&&src.tid||'',auto:0,man:0,sold:0,min:+S.defMin||0,price:+S.defPrice||0,ts:Date.now()}; } return r; }
function logIt(r,t,n,extra){ const S=SK(); S.log.unshift(Object.assign({ts:Date.now(),key:r.key,name:r.name,t,n},extra||{})); if(S.log.length>400) S.log.length=400; }
function stockAdd(snap,name,src,n,how){ n=Math.round(+n||0); if(!n) return null; const r=stockRow(snap,name,src); if(how==='man') r.man=(r.man||0)+n; else r.auto=(r.auto||0)+n; r.ts=Date.now(); logIt(r,how==='man'?'man':'print',n); KS.save(); bump(); railBadge(); return r; }
function recordCurrent(n,how){ if(!isPC()) return null; const doc=snapOf(st.dz), id=putSnap(doc), r=stockAdd(id,designName(st.dz),doc,n,how||'print'); if(r) setTimeout(()=>KS.toast(`Склад: +${n} «${r.name}»`),2600); refresh(); return r; }
function sell(key,q,price){ const S=SK(), r=S.rows[key]; if(!r) return false; q=Math.round(+q||0); if(q<1) return false; r.price=Math.max(0,num(price)); r.sold=(r.sold||0)+q; r.ts=Date.now(); logIt(r,'sale',q,{price:r.price}); KS.save(); bump(); railBadge();
  if(KS.mods.pos) KS.emit('posAdd',{name:'Открытка «'+r.name+'»',price:r.price,qty:q,cat:'Открытки',unit:'шт'}); else KS.toast(`Продано: «${r.name}» × ${q}`); refresh(); return true; }
function csv(){ const S=SK(), q=v=>{ const s=String(v==null?'':v); return /[;"\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s; };
  const rows=[['Открытка','Формат','Напечатано авто','Напечатано вручную','Продано','Остаток','Мин. остаток','Цена','Сумма остатка','Статус']];
  Object.values(S.rows).sort((a,b)=>a.name.localeCompare(b.name,'ru')).forEach(r=>rows.push([r.name,fmtK(r.kind),r.auto||0,r.man||0,r.sold||0,left(r),r.min||0,r.price||0,left(r)*(r.price||0),isLow(r)?'мало':'']));
  KS.download('sklad-otkrytok-'+KS.today()+'.csv',new Blob(['﻿'+rows.map(r=>r.map(q).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'})); }
function railBadge(){ const b=$('#rail .rbtn[data-tab="ks-postcard"]'); if(!b) return; const n=Object.values(SK().rows).filter(isLow).length; let x=b.querySelector('.pcs-railb');
  if(!n){ if(x) x.remove(); } else { if(!x){ x=document.createElement('span'); x.className='pcs-railb'; b.appendChild(x); } x.textContent=n; x.title='Мало на складе: '+n; }
  const sb=document.querySelector('[data-kssub="postcard:pcstock"]'); if(sb){ let y=sb.querySelector('.pcs-segb'); if(!n){ if(y) y.remove(); } else { if(!y){ y=document.createElement('span'); y.className='pcs-segb'; sb.appendChild(y); } y.textContent=n; } } }

/* ================= rendering helpers ================= */
function thumb(d,maxW,maxH){ if(!d) return `<span class="pcb-th pcb-miss" style="width:${maxW}px;height:${maxH}px">нет макета</span>`; const px=PXm(), k=Math.min(maxW/(d.w*px),maxH/(d.h*px));
  return `<span class="pcb-th" style="width:${Math.round(d.w*px*k)}px;height:${Math.round(d.h*px*k)}px"><span class="pcb-tin" style="transform:scale(${k.toFixed(5)})">${dzHTML(d,'front',{brand:d.brand||{}})}</span></span>`; }
function pageThumb(pg,w){ const px=PXm(), k=w/(pg.pw*px); return `<span class="pcb-sheet" style="width:${Math.round(pg.pw*px*k)}px;height:${Math.round(pg.ph*px*k)}px"><span class="pcb-tin" style="transform:scale(${k.toFixed(5)})">${pg.html}</span></span>`; }
const cards=n=>n+' '+(n%10===1&&n%100!==11?'открытка':n%10>=2&&n%10<=4&&(n%100<10||n%100>=20)?'открытки':'открыток');
const sheetsW=n=>n+' '+(n%10===1&&n%100!==11?'лист':n%10>=2&&n%10<=4&&(n%100<10||n%100>=20)?'листа':'листов');
const papers=()=>((st.shop&&st.shop.prices&&st.shop.prices.papers)||[]);
function cost(P){ const s=B(), ps=papers(), pp=P.a4?(ps.find(p=>p.id===s.a4p)||ps.find(p=>p.sheet==='A4')||{c:0}):(ps.find(p=>p.id==='ph1015')||{c:40}); const pr=((st.shop.prices||{}).print||[]).find(p=>p.id==='fill')||{c:25};
  let ink=0; P.sheets.forEach(sh=>sh.forEach(i=>{ ink+=(+pr.c||0)*(i.w*i.h)/(A4W*A4H)*(i.sides>1?2:1); })); const paper=P.front*(+pp.c||0); return {paper,ink:Math.round(ink),total:paper+Math.round(ink),pp}; }
function prn(){ const p=KS.printer(); const m=p.m||[5,5,5,5]; const bl=!!(p.bl&&(p.blS||[]).includes('10x15')); return {p,m,bl,name:(typeof DZ_PRN_INFO!=='undefined'&&DZ_PRN_INFO[p.id]&&DZ_PRN_INFO[p.id].n)||p.n}; }
function keepF(scr,fn){ const a=document.activeElement; let sel=null, c0=0, c1=0; if(a&&scr.contains(a)&&a.dataset){ const k=Object.keys(a.dataset).find(k=>/^pc/.test(k)); if(k){ sel=`[data-${k.replace(/[A-Z]/g,m=>'-'+m.toLowerCase())}="${CSS.escape(a.dataset[k])}"]`; try{ c0=a.selectionStart; c1=a.selectionEnd; }catch(_){} } }
  const top=scr.scrollTop; fn(); scr.scrollTop=top; if(sel){ const n=scr.querySelector(sel); if(n){ n.focus({preventScroll:true}); try{ if(c0!=null) n.setSelectionRange(c0,c1); }catch(_){} } } }
const scrB=()=>KS.screen('pcbatch'), scrS=()=>KS.screen('pcstock');
function refresh(){ const a=KS.active(); if(!a) { railBadge(); return; } const p=$('[data-panel="ks-postcard"] .kssub');
  if(a.id==='pcbatch'){ const s=scrB(); if(s&&!s.hidden) renderBatch(s); if(p) panelBatch(p); }
  if(a.id==='pcstock'){ const s=scrS(); if(s&&!s.hidden) renderStock(s); if(p) panelStock(p); }
  const m=pick&&pick.root&&!pick.root.hidden; if(m) renderPick(); railBadge(); }

/* ---------- «Пакет» screen ---------- */
function renderBatch(scr){ keepF(scr,()=>renderBatch0(scr)); }
function renderBatch0(scr){ const s=B(), P=plan(), C=cost(P), R=prn(); scr.dataset.rev=rev;
  const tot=s.items.reduce((a,i)=>a+(+i.qty||0),0);
  const items=s.items.map(i=>{ const d=SNAP[i.snap], rk=risks(d); const badges=[`<span class="ks-badge">${fmtK(i.kind)}</span>`];
      if(rk.empty) badges.push(`<span class="ks-badge warn" title="Пустая рамка печатается белой">пустая рамка фото</span>`);
      if(rk.edge&&!P.a4&&!R.bl) badges.push(`<span class="ks-badge warn" title="${esc(R.name)} не печатает 5 мм у края листа. На A4 такой проблемы нет.">заходит в поле 5 мм</span>`);
      if(!d&&SNAP[i.snap]===null) badges.push(`<span class="ks-badge bad">макет потерян</span>`);
      return `<div class="pcb-item" data-pcbitem="${i.id}"><div class="pcb-ith">${d?thumb(d,i.kind==='pcV'?62:96,92):'<span class="pcb-th pcb-miss" style="width:80px;height:60px">…</span>'}</div>
      <div class="pcb-imain"><input class="pcb-iname" data-pcbname="${i.id}" value="${esc(i.name)}" maxlength="60" aria-label="Название"><div class="pcb-imeta">${badges.join('')}</div></div>
      <div class="pcb-ictl"><div class="pcb-qty"><button type="button" data-pcbq="${i.id}:-1" aria-label="Меньше">−</button><input type="number" inputmode="numeric" min="0" max="999" data-pcbqty="${i.id}" value="${i.qty}" aria-label="Количество"><button type="button" data-pcbq="${i.id}:1" aria-label="Больше">+</button></div>
      <div class="seg pcb-sides"><button type="button" data-pcbsides="${i.id}:1"${i.sides<2?' class="on"':''}>1 стор.</button><button type="button" data-pcbsides="${i.id}:2"${i.sides>1?' class="on"':''}${i.two?'':' disabled title="У этой открытки нет оборота"'}>2 стор.</button></div>
      <button type="button" class="pcb-del" data-pcbdel="${i.id}" title="Убрать из пакета" aria-label="Убрать">${KS.icon('<path d="M6 6l12 12M18 6L6 18"/>')}</button></div></div>`; }).join('');
  const prev=P.cards?previewHTML(P):'';
  scr.innerHTML=`<div class="pcb-head"><div><h2>Пакетная печать</h2><p class="hint">Разные открытки за один раз: сначала все лицевые, потом все обороты</p></div>
    <div class="seg pcb-paper"><button type="button" data-pcbpaper="1015"${!P.a4?' class="on"':''}>Фото 10 × 15 · по одной</button><button type="button" data-pcbpaper="a4"${P.a4?' class="on"':''}>A4 · две на листе</button></div></div>
  <div class="ks-kpis pcb-kpis"><div class="ks-kpi"><small>Открыток</small><b>${tot}</b><i>${s.items.length} ${s.items.length===1?'дизайн':s.items.length>=2&&s.items.length<=4?'дизайна':'дизайнов'}</i></div>
    <div class="ks-kpi"><small>Листов</small><b data-pcbk="sheets">${P.front}</b><i>${P.a4?'A4':'10 × 15'}, оборотов: ${P.back}</i></div>
    <div class="ks-kpi"><small>Бумага ≈</small><b>${KS.money(C.paper)}</b><i>${esc(C.pp.n||'')}</i></div>
    <div class="ks-kpi"><small>Себестоимость ≈</small><b>${KS.money(C.total)}</b><i>с чернилами ${KS.money(C.ink)}</i></div></div>
  <div class="pcb-cols"><div class="pcb-list">${s.items.length?items:`<div class="ks-empty pcb-empty"><b>Пакет пуст</b><span>Соберите сюда разные открытки и напечатайте их одним заходом.</span><span class="flexw" style="justify-content:center"><button type="button" class="btn sm primary" data-pcbadd="cur"${isPC()?'':' disabled'}>+ Текущая открытка</button><button type="button" class="btn sm" data-pcbpick="tpl">Из шаблонов</button><button type="button" class="btn sm" data-pcbpick="mine">Мои дизайны</button></span>${isPC()?'':'<span class="hint">Текущий макет — не открытка 10 × 15. Откройте открытку или берите из шаблонов.</span>'}</div>`}
    ${s.items.length?`<div class="pcb-addrow"><button type="button" class="btn sm" data-pcbadd="cur"${isPC()?'':' disabled title="Текущий макет — не открытка 10 × 15"'}>+ Текущая открытка</button><button type="button" class="btn sm" data-pcbpick="tpl">+ Из шаблонов</button><button type="button" class="btn sm" data-pcbpick="mine">+ Мои дизайны</button></div>`:''}</div>
    <div class="pcb-run">${stepsHTML(P,R)}${prev}</div></div>`;
  ensureSnaps().then(ch=>{ if(ch) refresh(); }); }
function stepsHTML(P,R){ const s=B(), dis=P.cards?'':' disabled', pn=P.a4?'листов A4':'листов 10 × 15', d=s.done||{};
  return `<div class="pcb-steps"><div class="pcb-step${d.front?' done':''}"><span class="pcb-n">1</span><div><b>Лицевые</b><p>Положите <b>${P.front}</b> ${pn} в задний лоток, стороной для печати вверх.</p><button type="button" class="btn sm primary" data-pcbprint="front"${dis}>Печать лицевых · ${sheetsW(P.front)}</button></div></div>
    <div class="pcb-step"><span class="pcb-n">2</span><div><b>Переверните</b><p>${P.back?`Дайте высохнуть 1–2 минуты. Переверните стопку <b>по длинному краю</b>, как страницу книги: верх листа остаётся сверху. Вложите ${P.back<P.front?`только <b>первые ${P.back}</b> из ${P.front} — на остальных оборота нет`:`все <b>${P.back}</b>`} чистой стороной вверх.`:'В пакете только односторонние открытки — переворачивать не нужно.'}</p></div></div>
    <div class="pcb-step${d.back?' done':''}"><span class="pcb-n">3</span><div><b>Обороты</b><p>${P.a4&&P.back?'Обороты стоят зеркально к лицевым — после переворота совпадут.':P.back?'Обороты в том же порядке, что и лицевые.':'—'}</p><button type="button" class="btn sm" data-pcbprint="back"${P.back?'':' disabled'}>Печать оборотов · ${sheetsW(P.back)}</button></div></div>
    <p class="hint pcb-tip">${esc(R.name)}: поля ${R.m[0]} мм${P.a4?' — открытки на A4 стоят внутри поля, края режьте по меткам.':R.bl?', можно без полей на 10 × 15.':', без полей не печатает: у края открытки останется белая рамка 5 мм.'} В окне печати: масштаб 100 %.</p></div>`; }
function previewHTML(P){ const F=frontPages({a4:P.a4,sheets:P.sheets.slice(0,3)}), Bk=P.back?backPages({a4:P.a4,backs:P.backs.slice(0,3)}):[]; const w=P.a4?118:96;
  let h=`<div class="pcb-prev"><div class="hd2">Раскладка${P.front>3?` · первые 3 из ${P.front}`:''}</div><div class="pcb-sheets">`;
  F.forEach((pg,i)=>{ const bk=!B().rev&&P.backs.includes(P.sheets[i])?Bk[P.backs.indexOf(P.sheets[i])]:null; h+=`<div class="pcb-pair"><figure>${pageThumb(pg,w)}<figcaption>Лист ${i+1} · лицо</figcaption></figure>${bk?`<figure>${pageThumb(bk,w)}<figcaption>оборот</figcaption></figure>`:''}</div>`; });
  return h+'</div></div>'; }
function panelBatch(box){ const s=B(), R=prn(), P=plan(); const a4s=papers().filter(p=>p.sheet==='A4'); box.dataset.pcbrev=rev;
  KS.keepFocus(box,()=>{ box.innerHTML=`<div class="card"><div class="hd">Добавить в пакет</div>
    <button type="button" class="btn primary pcb-big" data-pcbadd="cur"${isPC()?'':' disabled'}>+ В пакет: текущая открытка</button>${isPC()?`<p class="hint">«${esc(designName(st.dz))}» — копия макета: дальнейшие правки не изменят пакет.</p>`:'<p class="hint">Сейчас в «Макете» не открытка 10 × 15.</p>'}
    <div class="flexw"><button type="button" class="btn sm" data-pcbpick="tpl">Из шаблонов</button><button type="button" class="btn sm" data-pcbpick="mine">Мои дизайны</button></div></div>
  <div class="card"><div class="hd">Бумага и принтер</div>
    ${P.a4?`<label class="f">Бумага A4<select data-pcbset="a4p">${a4s.map(p=>`<option value="${esc(p.id)}"${p.id===s.a4p?' selected':''}>${esc(p.n)} · ${KS.money(p.c)}/лист</option>`).join('')}</select></label>`:`<p class="hint">Фотобумага 10 × 15: одна открытка — один лист.</p>`}
    <label class="f">Принтер<select data-pcbset="printer">${Object.entries(PRINTERS).map(([id,p])=>`<option value="${id}"${id===R.p.id?' selected':''}>${esc((typeof DZ_PRN_INFO!=='undefined'&&DZ_PRN_INFO[id]&&DZ_PRN_INFO[id].n)||p.n)}</option>`).join('')}</select></label>
    <p class="hint">Поля: ${R.m.join(' / ')} мм. ${P.a4?'A4 портрет, открытки по центру, метки реза 3 мм.':R.bl?'Без полей на 10 × 15 — можно.':'Без полей не печатает.'}</p></div>
  <div class="card"><div class="hd">Совмещение оборотов</div><p class="hint">Если оборот сдвинулся, введите на сколько мм подвинуть оборот (вправо и вниз — плюс).</p>
    <div class="row2"><label class="f">Сдвиг →, мм<input type="number" step="0.5" data-pcbset="dx" value="${num(s.dx)}"></label><label class="f">Сдвиг ↓, мм<input type="number" step="0.5" data-pcbset="dy" value="${num(s.dy)}"></label></div>
    <label class="chk"><input type="checkbox" data-pcbset="rev"${s.rev?' checked':''}> Обороты в обратном порядке</label><p class="hint">Включите, если принтер выдаёт стопку лицом вверх и первый лист оказывается внизу.</p></div>
  ${s.items.length?`<button type="button" class="btn sm danger" data-pcbclear="1">Очистить пакет</button>`:''}`; }); }

/* ---------- picker (templates / my designs) ---------- */
let pick=null, pickObs=null; const PK={tab:'tpl',ori:'all',q:''};
function openPick(tab){ PK.tab=tab||'tpl'; PK.q=''; PK.ori='all'; if(!pick) pick=KS.modal({id:'pcbpick',title:'Добавить в пакет',wide:true}); pick.open(); renderPick(); }
function pickList(){ const q=PK.q.toLowerCase().replace(/ё/g,'е'); let L;
  if(PK.tab==='mine'){ L=myTpls().map(T=>({id:'t:'+T.id,name:T.name,kind:T.kind,T})).concat(Object.values(SK().rows).filter(r=>SNAP[r.snap]).map(r=>({id:'s:'+r.key,name:r.name,kind:r.kind,stock:r}))); }
  else L=pcTpls().map(T=>({id:'t:'+T.id,name:T.name,kind:T.kind,T,tag:(T.tags||[])[0]||''}));
  return L.filter(x=>PK.ori==='all'||(PK.ori==='h'?x.kind==='pcH':x.kind==='pcV')).filter(x=>!q||((x.name||'')+' '+((x.T&&x.T.tags)||[]).join(' ')).toLowerCase().replace(/ё/g,'е').includes(q)); }
function inBatch(x){ const s=B(); if(x.stock) return (s.items.find(i=>i.snap===x.stock.snap)||{}).qty||0; return s.items.filter(i=>i.tid===x.T.id).reduce((a,i)=>a+i.qty,0); }
function renderPick(){ if(!pick) return; const L=pickList(), el=pick.el, q=el.querySelector('[data-pcbpq]'), hadFocus=q&&document.activeElement===q, caret=q&&q.selectionStart;
  el.innerHTML=`<div class="pcbp-top"><div class="seg"><button type="button" data-pcbptab="tpl"${PK.tab==='tpl'?' class="on"':''}>Шаблоны · ${pcTpls().length}</button><button type="button" data-pcbptab="mine"${PK.tab==='mine'?' class="on"':''}>Мои дизайны · ${myTpls().length+Object.values(SK().rows).filter(r=>SNAP[r.snap]).length}</button></div>
    <div class="seg">${[['all','Все'],['h','15 × 10'],['v','10 × 15']].map(([k,n])=>`<button type="button" data-pcbpori="${k}"${PK.ori===k?' class="on"':''}>${n}</button>`).join('')}</div>
    <input type="search" data-pcbpq="1" placeholder="Поиск: роза, свадьба…" value="${esc(PK.q)}"><span class="ks-sp"></span><b class="pcbp-cnt">В пакете: ${B().items.reduce((a,i)=>a+i.qty,0)}</b></div>
  <div class="pcbp-grid">${L.length?L.map(x=>{ const n=inBatch(x); return `<button type="button" class="pcbp-t ${x.kind}" data-pcbpadd="${esc(x.id)}" title="Добавить «${esc(x.name)}»"><span class="pcbp-th" data-pcbpth="${esc(x.id)}"></span><b>${esc(x.name)}</b><small>${x.stock?'со склада · '+left(x.stock)+' шт':x.T&&x.T.mine?'мой шаблон':esc(x.tag||'')} · ${fmtK(x.kind)}</small>${n?`<i class="pcbp-in">в пакете ${n}</i>`:''}<span class="pcbp-plus">+</span></button>`; }).join('')
    :`<div class="ks-empty">${PK.tab==='mine'?'Здесь появятся ваши открытки: сохраните макет кнопкой «Сохранить как шаблон» в «Макете» или напечатайте открытку — она попадёт на склад.':'Ничего не нашлось — сбросьте поиск.'}</div>`}</div><div class="pcbp-foot"><span class="hint">Нажмите на открытку — она добавится в пакет. Повторное нажатие прибавит ещё одну.</span><button type="button" class="btn sm primary" data-ksclose="1">Готово</button></div>`;
  if(hadFocus){ const n=el.querySelector('[data-pcbpq]'); n.focus(); try{ n.setSelectionRange(caret,caret); }catch(_){} }
  if(pickObs) pickObs.disconnect(); pickObs=new IntersectionObserver(es=>es.forEach(en=>{ if(!en.isIntersecting) return; const t=en.target; pickObs.unobserve(t); const x=L.find(y=>y.id===t.dataset.pcbpth); if(!x) return;
    try{ const d=x.stock?SNAP[x.stock.snap]:dzFromTpl(x.T,x.T.w,x.T.h,null); t.innerHTML=thumb(d,x.kind==='pcV'?118:176,118); }catch(e){ t.textContent=''; } }),{root:el.closest('.ksmbox'),rootMargin:'300px'});
  el.querySelectorAll('[data-pcbpth]').forEach(t=>pickObs.observe(t)); }
function pickAdd(id){ const x=pickList().find(y=>y.id===id)||null; if(!x) return; if(x.stock){ const d=SNAP[x.stock.snap]; if(d) addDoc(d,x.stock.name,x.stock.tid); } else addTpl(x.T); }

/* ---------- «Склад» screen ---------- */
function renderStock(scr){ keepF(scr,()=>renderStock0(scr)); }
function renderStock0(scr){ const S=SK(); scr.dataset.rev=rev; const all=Object.values(S.rows), q=(S.q||'').toLowerCase().replace(/ё/g,'е');
  const L=all.filter(r=>S.filter==='low'?isLow(r):S.filter==='have'?left(r)>0:true).filter(r=>!q||r.name.toLowerCase().replace(/ё/g,'е').includes(q)).sort((a,b)=>(isLow(b)-isLow(a))||a.name.localeCompare(b.name,'ru'));
  const k={n:all.length,left:all.reduce((a,r)=>a+Math.max(0,left(r)),0),sold:all.reduce((a,r)=>a+(r.sold||0),0),val:all.reduce((a,r)=>a+Math.max(0,left(r))*(+r.price||0),0),low:all.filter(isLow).length};
  scr.innerHTML=`<div class="pcb-head"><div><h2>Склад открыток</h2><p class="hint">Сколько напечатано, продано и осталось — по каждому дизайну</p></div>
    <div class="pcs-tools"><input type="search" data-pcsq="1" placeholder="Найти открытку" value="${esc(S.q||'')}"><div class="seg">${[['all','Все'],['have','В наличии'],['low','Мало'+(k.low?' · '+k.low:'')]].map(([f,n])=>`<button type="button" data-pcsf="${f}"${S.filter===f?' class="on"':''}>${n}</button>`).join('')}</div><button type="button" class="btn sm" data-pcscsv="1">CSV</button></div></div>
  <div class="ks-kpis"><div class="ks-kpi"><small>Дизайнов</small><b>${k.n}</b></div><div class="ks-kpi"><small>На складе</small><b>${k.left} шт</b></div><div class="ks-kpi"><small>Продано</small><b>${k.sold} шт</b></div><div class="ks-kpi"><small>Остаток на сумму</small><b>${KS.money(k.val)}</b></div>
    <div class="ks-kpi${k.low?' pcs-lowk':''}"><small>Заканчиваются</small><b>${k.low}</b><i>${k.low?'пора допечатать':'всё в порядке'}</i></div></div>
  ${L.length?`<div class="pcs-grid">${L.map(r=>{ const l=left(r), low=isLow(r), d=SNAP[r.snap]; return `<div class="pcs-card${low?' low':''}" data-pcsrow="${esc(r.key)}"><div class="pcs-th">${d?thumb(d,r.kind==='pcV'?78:118,112):`<span class="pcb-th pcb-miss" style="width:96px;height:70px">${SNAP[r.snap]===null?'нет макета':'…'}</span>`}</div>
      <div class="pcs-body"><input class="pcs-name" data-pcsname="${esc(r.key)}" value="${esc(r.name)}" maxlength="60" aria-label="Название"><div class="pcs-meta"><span class="ks-badge">${fmtK(r.kind)}</span>${low?`<span class="ks-badge bad">${l<=0?'Нет в наличии':'Мало'}</span>`:l>0?'<span class="ks-badge ok">В наличии</span>':''}</div>
      <div class="pcs-nums"><div title="Авто: ${r.auto||0}, вручную: ${r.man||0}"><small>Напечатано</small><b>${(r.auto||0)+(r.man||0)}</b></div><div><small>Продано</small><b>${r.sold||0}</b></div><div class="pcs-left"><small>Остаток</small><b>${l}</b></div></div>
      <div class="pcs-set"><label>Мин.<input type="number" inputmode="numeric" min="0" data-pcsmin="${esc(r.key)}" value="${+r.min||0}"></label><label>Цена<input type="number" inputmode="decimal" min="0" data-pcsprice="${esc(r.key)}" value="${+r.price||0}"></label></div>
      <div class="pcs-act"><button type="button" class="btn sm" data-pcsprint="${esc(r.key)}">+ Напечатал</button><button type="button" class="btn sm primary" data-pcssell="${esc(r.key)}"${l>0?'':' disabled'}>Продать</button><button type="button" class="btn sm" data-pcsbatch="${esc(r.key)}" title="Допечатать: добавить в пакет"${d?'':' disabled'}>В пакет</button><button type="button" class="btn sm pcs-del" data-pcsdel="${esc(r.key)}" title="Убрать со склада">${KS.icon('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>')}</button></div></div></div>`; }).join('')}</div>`
  :`<div class="ks-empty pcb-empty"><b>${all.length?'Ничего не нашлось':'Склад пуст'}</b><span>${all.length?'Сбросьте фильтр или поиск.':'Напечатайте открытки из «Пакета» или кнопкой печати открытки — они появятся здесь сами. Или добавьте вручную.'}</span>${all.length?'':`<span class="flexw" style="justify-content:center"><button type="button" class="btn sm primary" data-pcsaddcur="1"${isPC()?'':' disabled'}>+ Текущая открытка</button><button type="button" class="btn sm" data-kssub="postcard:pcbatch">Открыть «Пакет»</button></span>`}</div>`}`;
  ensureSnaps().then(ch=>{ if(ch) refresh(); }); }
function panelStock(box){ const S=SK(); box.dataset.pcbrev=rev; const lg=S.log.slice(0,8), T={print:'печать',man:'вручную',sale:'продажа'};
  KS.keepFocus(box,()=>{ box.innerHTML=`<div class="card"><div class="hd">Как считается</div><p class="hint">Печать из «Пакета» и кнопками печати открытки прибавляет «Напечатано» сама. «Продать» отправляет открытку в Кассу и списывает со склада.</p>
    <div class="flexw"><button type="button" class="btn sm primary" data-pcsaddcur="1"${isPC()?'':' disabled title="В «Макете» не открытка"'}>+ Текущая открытка</button><button type="button" class="btn sm" data-pcscsv="1">Скачать CSV</button></div></div>
  <div class="card"><div class="hd">Для новых дизайнов</div><div class="row2"><label class="f">Мин. остаток<input type="number" min="0" data-pcsdef="defMin" value="${+S.defMin||0}"></label><label class="f">Цена, ${esc((st.shop&&st.shop.cur)||'֏')}<input type="number" min="0" data-pcsdef="defPrice" value="${+S.defPrice||0}"></label></div></div>
  <div class="card"><div class="hd">Последние движения</div>${lg.length?`<div class="pcs-log">${lg.map(x=>`<div><span>${new Date(x.ts).toLocaleString('ru-RU',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</span><b>${esc(x.name)}</b><i class="${x.t==='sale'?'out':'in'}">${x.t==='sale'?'−':'+'}${x.n} · ${T[x.t]||''}</i></div>`).join('')}</div>`:'<p class="hint">Пока пусто.</p>'}</div>`; }); }

/* ---------- quantity dialog: «+ Напечатал» / «Продать» ---------- */
let qd=null;
function qty(mode,key){ const r=SK().rows[key]; if(!r) return; if(!qd) qd=KS.modal({id:'pcbqty',title:''}); const sale=mode==='sell', l=left(r), d=SNAP[r.snap];
  qd.title(sale?'Продать открытку':'Напечатал вручную'); qd.root.querySelector('.ksmbox').classList.add('pcq-box');
  qd.el.innerHTML=`<div class="pcq"><div class="pcq-th">${d?thumb(d,r.kind==='pcV'?90:136,120):''}</div><div class="pcq-f"><b>${esc(r.name)}</b><span class="hint">${sale?`На складе ${l} шт`:`Сейчас на складе ${l} шт`}</span>
    <div class="pcb-qty pcq-n"><button type="button" data-pcqd="-1">−</button><input type="number" inputmode="numeric" min="1" ${sale?`max="${Math.max(1,l)}"`:'max="9999"'} id="pcqN" value="1"><button type="button" data-pcqd="1">+</button></div>
    ${sale?`<label class="f">Цена за штуку<input type="number" inputmode="decimal" min="0" id="pcqP" value="${+r.price||0}"></label><p class="pcq-sum">Итого: <b id="pcqT">${KS.money(+r.price||0)}</b></p>`:''}</div></div>
  <div class="flexw pcq-act"><button type="button" class="btn sm" data-ksclose="1">Отмена</button><button type="button" class="btn sm primary" id="pcqOk">${sale?(KS.mods.pos?'В кассу':'Продано'):'Добавить на склад'}</button></div>`;
  const N=qd.el.querySelector('#pcqN'), Pp=qd.el.querySelector('#pcqP'), Tt=qd.el.querySelector('#pcqT'), mx=sale?Math.max(1,l):9999;
  const upd=()=>{ if(Tt) Tt.textContent=KS.money(int(N.value,1,mx)*num(Pp.value)); };
  qd.el.onclick=e=>{ const b=e.target.closest('[data-pcqd]'); if(b){ N.value=int(+N.value+ +b.dataset.pcqd,1,mx); upd(); return; }
    if(e.target.closest('#pcqOk')){ const n=int(N.value,1,mx); if(sale){ if(n>l){ KS.toast('На складе только '+l+' шт'); return; } qd.close(); sell(key,n,Pp.value); } else { qd.close(); stockAdd(r.snap,r.name,null,n,'man'); KS.toast(`На склад: +${n} «${r.name}»`); refresh(); } } };
  qd.el.oninput=upd; qd.open(); setTimeout(()=>{ N.focus(); N.select(); },30); }

/* ================= tabs, tools, events ================= */
KS.tab({id:'pcbatch',group:'postcard',seg:'Пакет',title:'Пакетная печать',screen:true,render(box,o){
  if(o.reason==='show'||!box.firstChild||box.dataset.pcbrev!=String(rev)) panelBatch(box); else { box.querySelectorAll('[data-pcbadd="cur"]').forEach(b=>b.disabled=!isPC()); }
  if(o.screen&&(o.reason==='show'||!o.screen.firstChild||o.screen.dataset.rev!=String(rev))&&!o.screen.contains(document.activeElement)) renderBatch(o.screen); railBadge(); }});
KS.tab({id:'pcstock',group:'postcard',seg:'Склад',title:'Склад открыток',screen:true,render(box,o){
  if(o.reason==='show'||!box.firstChild||box.dataset.pcbrev!=String(rev)) panelStock(box);
  if(o.screen&&(o.reason==='show'||!o.screen.firstChild||o.screen.dataset.rev!=String(rev))&&!o.screen.contains(document.activeElement)) renderStock(o.screen); railBadge(); }});
const tool=KS.tool({id:'pcbadd',label:'+ В пакет',title:'Добавить эту открытку в пакетную печать',app:'print',run(){ addCurrent(); }});
const syncTool=()=>{ if(tool) tool.hidden=!(isPC()&&typeof dzOn==='function'&&dzOn()); };
KS.on('render',()=>{ syncTool(); railBadge(); }); KS.on('boot',()=>{ syncTool(); railBadge(); ensureSnaps(); }); KS.on('mode',syncTool);
KS.cmd('Пакетная печать открыток','открытки',()=>KS.show('postcard','pcbatch'));
KS.cmd('Склад открыток','открытки',()=>KS.show('postcard','pcstock'));
KS.cmd('Добавить открытку в пакет','открытки',()=>addCurrent());

/* auto «+ Напечатал»: printing the current postcard (print button / postcard panel / KS.postcard.print) */
let recBusy=false;
KS.on('print',o=>{ if(o&&o.test) return; if(recBusy) return; if(isPC()) recordCurrent(pcCopies()); });
document.addEventListener('click',e=>{ const b=e.target.closest&&e.target.closest('[data-pcprint]'); if(!b||!isPC()) return; const w=b.dataset.pcprint; if(w==='back') return; if((st.dz.sides||1)<2&&w!=='front'&&!(st.dz.back||[]).length) return; recordCurrent(pcCopies()); },true);
if(KS.postcard&&typeof KS.postcard.print==='function'){ const _pp=KS.postcard.print; KS.postcard.print=function(w){ const ok=isPC(); recBusy=true; let r; try{ r=_pp.apply(this,arguments); } finally{ recBusy=false; } if(ok&&w!=='back') recordCurrent(pcCopies()); return r; }; }

document.addEventListener('click',e=>{ const t=e.target; if(!t.closest) return; let b;
  if((b=t.closest('[data-pcbadd]'))){ addCurrent(); return; }
  if((b=t.closest('[data-pcbpick]'))){ openPick(b.dataset.pcbpick); return; }
  if((b=t.closest('[data-pcbptab]'))){ PK.tab=b.dataset.pcbptab; renderPick(); return; }
  if((b=t.closest('[data-pcbpori]'))){ PK.ori=b.dataset.pcbpori; renderPick(); return; }
  if((b=t.closest('[data-pcbpadd]'))){ pickAdd(b.dataset.pcbpadd); return; }
  if((b=t.closest('[data-pcbpaper]'))){ B().paper=b.dataset.pcbpaper; B().done={}; KS.save(); bump(); refresh(); return; }
  if((b=t.closest('[data-pcbq]'))){ const [id,d]=b.dataset.pcbq.split(':'); const it=B().items.find(i=>i.id===id); if(it){ it.qty=int(it.qty+ +d,0,999); B().done={}; KS.save(); bump(); refresh(); } return; }
  if((b=t.closest('[data-pcbsides]'))){ const [id,n]=b.dataset.pcbsides.split(':'); const it=B().items.find(i=>i.id===id); if(it&&!(n==='2'&&!it.two)){ it.sides=+n; B().done={}; KS.save(); bump(); refresh(); } return; }
  if((b=t.closest('[data-pcbdel]'))){ const s=B(); s.items=s.items.filter(i=>i.id!==b.dataset.pcbdel); s.done={}; KS.save(); bump(); refresh(); return; }
  if((b=t.closest('[data-pcbclear]'))){ if(b.dataset.sure){ B().items=[]; B().done={}; KS.save(); bump(); refresh(); KS.toast('Пакет очищен'); } else { b.dataset.sure='1'; b.textContent='Точно очистить? Нажмите ещё раз'; setTimeout(()=>{ if(b.isConnected){ delete b.dataset.sure; b.textContent='Очистить пакет'; } },3500); } return; }
  if((b=t.closest('[data-pcbprint]'))){ doPrint(b.dataset.pcbprint); return; }
  if((b=t.closest('[data-pcsf]'))){ SK().filter=b.dataset.pcsf; KS.save(); bump(); refresh(); return; }
  if((b=t.closest('[data-pcscsv]'))){ csv(); return; }
  if((b=t.closest('[data-pcsaddcur]'))){ if(!isPC()){ KS.toast('Откройте открытку 10 × 15'); return; } const doc=snapOf(st.dz), id=putSnap(doc), r=stockRow(id,designName(st.dz),doc); KS.save(); bump(); refresh(); KS.toast(`На складе: «${r.name}»`); return; }
  if((b=t.closest('[data-pcsprint]'))){ qty('print',b.dataset.pcsprint); return; }
  if((b=t.closest('[data-pcssell]'))){ qty('sell',b.dataset.pcssell); return; }
  if((b=t.closest('[data-pcsbatch]'))){ const r=SK().rows[b.dataset.pcsbatch]; const d=r&&SNAP[r.snap]; if(d){ addDoc(d,r.name,r.tid); } return; }
  if((b=t.closest('[data-pcsdel]'))){ if(b.dataset.sure){ const S=SK(); delete S.rows[b.dataset.pcsdel]; KS.save(); bump(); refresh(); KS.toast('Убрано со склада'); } else { b.dataset.sure='1'; b.classList.add('danger'); b.title='Нажмите ещё раз, чтобы удалить'; b.innerHTML='Удалить?'; setTimeout(()=>{ if(b.isConnected&&b.dataset.sure){ delete b.dataset.sure; b.classList.remove('danger'); b.innerHTML=KS.icon('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'); } },3500); } return; }
});
document.addEventListener('input',e=>{ const t=e.target, ds=t.dataset||{}; let it;
  if(ds.pcbpq){ PK.q=t.value; clearTimeout(renderPick.t); renderPick.t=setTimeout(renderPick,180); return; }
  if(ds.pcbname&&(it=B().items.find(i=>i.id===ds.pcbname))){ it.name=t.value.slice(0,60); KS.save(); return; }
  if(ds.pcbqty&&(it=B().items.find(i=>i.id===ds.pcbqty))){ it.qty=int(t.value,0,999); B().done={}; KS.save(); bump(); const P=plan(), k=document.querySelector('[data-pcbk="sheets"]'); if(k) k.textContent=P.front; return; }
  if(ds.pcsq){ SK().q=t.value; KS.save(); clearTimeout(renderStock.t); renderStock.t=setTimeout(()=>{ const s=scrS(); if(s&&!s.hidden){ bump(); renderStock(s); } },200); return; }
  if(ds.pcsname){ const r=SK().rows[ds.pcsname]; if(r){ r.name=t.value.slice(0,60)||'Открытка'; KS.save(); } return; }
  if(ds.pcsmin){ const r=SK().rows[ds.pcsmin]; if(r){ r.min=int(t.value,0,99999); KS.save(); railBadge(); } return; }
  if(ds.pcsprice){ const r=SK().rows[ds.pcsprice]; if(r){ r.price=Math.max(0,num(t.value)); KS.save(); } return; }
  if(ds.pcsdef){ SK()[ds.pcsdef]=Math.max(0,num(t.value)); KS.save(); return; }
  if(ds.pcbset==='dx'||ds.pcbset==='dy'){ B()[ds.pcbset]=Math.max(-20,Math.min(20,num(t.value))); KS.save(); bump(); return; } });
document.addEventListener('change',e=>{ const t=e.target, ds=t.dataset||{};
  if(ds.pcbqty||ds.pcsmin||ds.pcsprice||ds.pcsname||ds.pcbname||ds.pcbset==='dx'||ds.pcbset==='dy'){ bump(); setTimeout(()=>{ const a=KS.active(); const s=a&&a.id==='pcbatch'?scrB():a&&a.id==='pcstock'?scrS():null; if(s&&!s.hidden) (a.id==='pcbatch'?renderBatch:renderStock)(s); },0); return; }
  if(ds.pcbset==='a4p'){ B().a4p=t.value; KS.save(); bump(); refresh(); return; }
  if(ds.pcbset==='printer'){ st.shop.printer=t.value; bump(); update(); refresh(); return; }
  if(ds.pcbset==='rev'){ B().rev=t.checked; KS.save(); bump(); refresh(); return; } });

KS.pcbatch={add:addCurrent,addTpl,plan,frontPages,backPages,print:doPrint,stock:()=>SK(),sell,record:recordCurrent,csv,snaps:SNAP,ensure:ensureSnaps};
