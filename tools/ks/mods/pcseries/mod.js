/* ===== pcseries: «Серия» открыток, конверт к открытке, PDF-каталог ===== */
KS.mod('pcseries',{title:'Серия открыток, конверт и каталог'});
const PCK=['pcH','pcV'];
const CATS=['День рождения','Любовь','Свадьба','Благодарность','Детские','Новый год','Праздники','Природа','Город','Акварель','Минимализм','Фото','Винтаж'];
const PRESETS=['С днём рождения!','С любовью','Спасибо!','С Новым годом!','Поздравляем!','Для тебя'];
const DEF={ori:'all',cat:'',n:9,text:'',seed:0,fav:[],
  c:{src:'all',cat:'',ori:'all',per:9,price:500,title:'Каталог открыток',sub:'Открытки ручной работы · 10 × 15',extra:'',prices:{},names:{},off:{}},
  env:{to:'',addr:'',city:'',from:'',from2:'',note:'Для тебя',deco:true,w:162,h:114}};
const S=()=>{ const s=KS.store('pcseries',DEF); for(const k in DEF){ if(!(k in s)||s[k]==null) s[k]=JSON.parse(JSON.stringify(DEF[k]));
    else if(DEF[k]&&typeof DEF[k]==='object'&&!Array.isArray(DEF[k])) for(const j in DEF[k]) if(!(j in s[k])) s[k][j]=JSON.parse(JSON.stringify(DEF[k][j])); }
  if(!Array.isArray(s.fav)) s.fav=[]; return s; };
const E=s=>KS.esc(s==null?'':String(s));
const isPCk=k=>PCK.includes(k);
const allPC=()=>(st.myTpl||[]).filter(t=>t&&isPCk(t.kind)).concat(DZT.filter(t=>isPCk(t.kind)));
const findT=id=>allPC().find(t=>t.id===id);
const slots=T=>(T.front||[]).filter(e=>e.t==='img'&&e.k!=='logo');
const hasSlot=T=>slots(T).length>0;
const emptySlot=T=>slots(T).some(e=>!e.src);
const plural=(n,a,b,c)=>n+' '+(n%10===1&&n%100!==11?a:n%10>=2&&n%10<=4&&(n%100<10||n%100>=20)?b:c);
const logoCfg=()=>{ const p=(st.ks&&st.ks.postcard&&st.ks.postcard.logo)||{}; return {v:p.v||'monoword',sub:p.sub==null?'handmade':p.sub}; };
const mark=(o,pal)=>{ try{ return KS.thSVG?KS.thSVG(Object.assign({sub:logoCfg().sub},o),pal):''; }catch(e){ return ''; } };
const markBox=v=>v==='word'?[40,10]:v==='sig'||v==='badge'||v==='stack'?[26,15.6]:[18,18];
const shopName=()=>(st.shop&&st.shop.name||'').trim();
const r2=v=>Math.round(v*100)/100;
const HF="'Cormorant Garamond','Playfair Display',Georgia,serif", BF="'Manrope','Montserrat',Arial,sans-serif", SF="'Caveat','Bad Script',cursive";

/* ---------- photo (memory + IndexedDB) ---------- */
let PH=null; /* {full, prev, name} */
async function shrink(src,max,q){ const im=new Image(); im.src=src; try{ await im.decode(); }catch(e){ return src; }
  const s=Math.min(1,max/Math.max(im.naturalWidth,im.naturalHeight)); if(s>=1&&src.length<max*max*.6) return src;
  const c=document.createElement('canvas'); c.width=Math.max(1,Math.round(im.naturalWidth*s)); c.height=Math.max(1,Math.round(im.naturalHeight*s)); const g=c.getContext('2d'); g.fillStyle='#fff'; g.fillRect(0,0,c.width,c.height); g.drawImage(im,0,0,c.width,c.height); return c.toDataURL('image/jpeg',q||.86); }
async function setPhoto(file){ if(!file||!/^image\//.test(file.type||'')){ KS.toast('Нужна картинка: JPG, PNG или HEIC'); return; }
  try{ const full=await KS.readImage(file,2000); const prev=await shrink(full,720,.84); PH={full,prev,name:file.name||'фото'}; try{ await KS.idb.set('pcseries:photo',PH); }catch(_){}
    KS.toast('Фото в серии: '+plural(serList().filter(x=>hasSlot(x.T)).length,'открытка','открытки','открыток')+' с рамкой'); refreshAll(); }
  catch(e){ KS.toast('Не удалось открыть фото'); } }
function dropPhoto(){ PH=null; KS.idb.del('pcseries:photo').catch(()=>{}); refreshAll(); }
KS.on('boot',()=>{ KS.idb.get('pcseries:photo').then(v=>{ if(v&&v.full&&!PH){ PH=v; refreshAll(); } }).catch(()=>{}); });

/* ---------- fit a heading into its box (real DOM measure, fonts as on the card) ---------- */
let MB=null; const FIT=new Map();
function fitSize(e,fonts){ const key=[e.text,e.font,e.w,e.h,e.size,e.weight,e.italic,e.lh,e.ls,e.upper,fonts.h,fonts.b].join('|'); if(FIT.has(key)) return FIT.get(key);
  if(!MB){ MB=document.createElement('div'); MB.style.cssText='position:fixed;left:-20000px;top:0;visibility:hidden;pointer-events:none;contain:layout'; document.body.appendChild(MB); }
  const d=document.createElement('div'); d.style.cssText=`width:${e.w}mm;font-family:${dzFont(e.font,{fonts})};font-weight:${e.weight||400};${e.italic?'font-style:italic;':''}line-height:${e.lh||1.2};letter-spacing:${e.ls||0}em;${e.upper?'text-transform:uppercase;':''}white-space:pre-wrap;overflow-wrap:normal;word-break:normal`;
  d.textContent=e.text; MB.appendChild(d); const maxH=e.h*PX*1.04; let sz=+e.size||10; const min=Math.max(6,sz*.28);
  for(let i=0;i<40&&sz>min;i++){ d.style.fontSize=sz+'pt'; if(d.offsetHeight<=maxH&&d.scrollWidth<=d.clientWidth+1) break; sz*=.93; }
  d.remove(); sz=Math.max(min,Math.round(sz*10)/10); FIT.set(key,sz); return sz; }

/* ---------- series: modified copies of matching templates ---------- */
const SEL=new Set();
function serBase(){ const s=S(); return allPC().filter(T=>!(T.tags||[]).includes('Серия'))
  .filter(T=>s.ori==='all'||(s.ori==='h'?T.kind==='pcH':T.kind==='pcV')).filter(T=>!s.cat||(T.tags||[]).includes(s.cat)); }
const rot=(a,k)=>a.length?a.slice(k%a.length).concat(a.slice(0,k%a.length)):a;
function makeVar(T,src,text){ const V=JSON.parse(JSON.stringify(T)); V.base=T.id; V.fonts=Object.assign({h:'Montserrat',b:'PT Sans'},V.fonts);
  if(src) V.front.forEach(e=>{ if(e.t==='img'&&e.k!=='logo'){ e.src=src; e.px=50; e.py=50; e.z=1; } });
  const t=(text||'').trim();
  if(t){ const tx=V.front.filter(e=>e.t==='text'&&!e.hide&&!e.k); if(tx.length){ const m=tx.reduce((a,b)=>(+b.size||10)>(+a.size||10)?b:a);
      tx.forEach(e=>{ if(e!==m&&(+e.size||10)>=(+m.size||10)*.95&&e.font===m.font) e.hide=true; });
      m.text=t; m.size=fitSize(m,V.fonts); } }
  return V; }
function serList(){ const s=S(), L=serBase(), N=+s.n||9, off=(+s.seed||0)*N;
  const ph=PH?L.filter(hasSlot):[], rest=PH?L.filter(t=>!hasSlot(t)):L;
  const pick=rot(ph,off).concat(rot(rest,Math.max(0,off-ph.length))).slice(0,N);
  return pick.map(T=>({T,V:makeVar(T,PH&&PH.prev,s.text)})); }
const fullVar=id=>{ const T=findT(id); return T?makeVar(T,PH&&PH.full,S().text):null; };
function thumb(T,boxW){ const d=dzFromTpl(T,T.w,T.h), k=boxW/(T.w*PX);
  return `<div class="thumb psr-thumb" style="width:${boxW}px;height:${Math.round(T.h*PX*k)}px"><div class="tin" style="transform:scale(${k})">${dzHTML(d,'front',{brand:(st.dz&&st.dz.brand)||{}})}</div></div>`; }

/* ---------- side panel and screen of «Серия» ---------- */
const scrSer=()=>KS.screen('pcser'), scrCat=()=>KS.screen('pccat');
function serPanel(box){ const s=S();
  box.innerHTML=`<div class="card psr-pn psr-photo"><div class="hd">Фото <span class="ks-badge">по желанию</span></div>
    <div class="ks-drop psr-drop" id="psrDrop" role="button" tabindex="0">${PH?`<img src="${PH.prev}" alt=""><span class="psr-dropname">${E(PH.name)}</span>`:`${KS.icon('<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="m21 17-5-5-9 7"/>')}<span>Перетащите фото сюда или нажмите</span>`}</div>
    ${PH?'<div class="flexw"><button class="btn sm" data-psr="photo">Другое фото</button><button class="btn sm" data-psr="nophoto">Убрать фото</button></div>':'<p class="hint">Фото встанет в рамки шаблонов. Шаблоны с рамкой — первыми.</p>'}</div>
  <div class="card psr-pn"><div class="hd">Текст поздравления <span class="ks-badge">по желанию</span></div>
    <textarea id="psrText" rows="3" placeholder="С днём рождения, Анна!">${E(s.text)}</textarea>
    <div class="flexw psr-chips">${PRESETS.map(p=>`<button class="btn sm" data-psrtxt="${E(p)}">${E(p)}</button>`).join('')}</div>
    <p class="hint">Заменит главный заголовок и сам уменьшится, чтобы влезть. Пусто — текст шаблона.</p></div>
  <div class="card psr-pn"><div class="hd">Подбор</div>
    <div class="seg psr-seg">${[['all','Все'],['h','Горизонт.'],['v','Вертик.']].map(([k,n])=>`<button data-psrori="${k}"${s.ori===k?' class="on"':''}>${n}</button>`).join('')}</div>
    <label class="f">Тема<select id="psrCat"><option value="">Все темы</option>${CATS.map(c=>`<option${s.cat===c?' selected':''}>${c}</option>`).join('')}</select></label>
    <div class="ks-row"><span class="hint grow">Вариантов</span><div class="seg">${[6,9,12].map(n=>`<button data-psrn="${n}"${+s.n===n?' class="on"':''}>${n}</button>`).join('')}</div></div>
    <button class="btn" data-psr="more">${KS.icon('<path d="M3 12a9 9 0 0 1 15.5-6.2L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.5 6.2L3 16M3 21v-5h5"/>')}Другие варианты</button></div>
  <div class="card psr-pn"><div class="hd">Ещё к открытке</div>
    <button class="btn primary" data-psr="env">${KS.icon('<rect x="3" y="6" width="18" height="13" rx="2"/><path d="m3 7 9 6 9-6"/>')}Конверт к открытке</button>
    <p class="hint">Конверт 162 × 114 мм в цветах открытки: дизайн на A4 и развёртка для вырезания.</p>
    <button class="btn" data-kssub="postcard:pccat">${KS.icon('<path d="M4 4h7v16H4zM13 4h7v7h-7zM13 13h7v7h-7z"/>')}Каталог открыток в PDF</button></div>`; }
function serScreen(scr){ if(!scr) return; const s=S(), L=serList(), base=serBase(), G=gridFor(scr);
  const nSlot=L.filter(x=>hasSlot(x.T)).length; [...SEL].forEach(id=>{ if(!L.some(x=>x.T.id===id)) SEL.delete(id); });
  const parts=[plural(L.length,'вариант','варианта','вариантов')]; if(PH) parts.push(nSlot?`с вашим фото: ${nSlot}`:'в этой теме нет шаблонов с рамкой для фото'); if((s.text||'').trim()) parts.push('свой текст'); if(s.cat) parts.push(s.cat);
  scr.innerHTML=`<div class="psr-head"><div><h2>Серия открыток</h2><p class="hint">${E(parts.join(' · '))}</p></div>
    <div class="flexw"><button class="btn sm" data-psr="all">${SEL.size&&SEL.size===L.length?'Снять выбор':'Выбрать все'}</button><button class="btn sm" data-psr="more">Другие варианты</button></div></div>
    <div class="psr-bar" id="psrBar"></div>
    ${L.length?`<div class="psr-grid" style="grid-template-columns:repeat(${G.cols},minmax(0,1fr))">${L.map(({T,V})=>{ const cat=(T.tags||[]).find(t=>CATS.includes(t))||(T.mine?'Мои':(T.tags||[])[0]||''); return `<div class="psr-card ${T.kind}${SEL.has(T.id)?' on':''}" data-psrcard="${E(T.id)}">
      <div class="psr-th" data-psrpick="${E(T.id)}">${thumb(V,T.kind==='pcV'?Math.round(G.tw*.68):G.tw)}<button class="psr-pick" data-psrpick="${E(T.id)}" aria-pressed="${SEL.has(T.id)}" title="Отметить">${KS.icon('<path d="m5 12 5 5 9-10"/>')}</button></div>
      <div class="psr-cap" style="max-width:${G.tw}px"><div class="grow"><b>${E(T.name)}</b><small>${E(cat)} · ${T.kind==='pcV'?'10 × 15':'15 × 10'}${hasSlot(T)&&cat!=='Фото'?' · с фото':''}</small></div>
      <button class="btn sm" data-psropen="${E(T.id)}">Открыть</button></div></div>`; }).join('')}</div>`
    :`<div class="ks-empty psr-empty"><b>Нет шаблонов под этот фильтр</b><br>${base.length?'':'Выберите другую тему или ориентацию — '}<button class="btn sm" data-psr="reset">Сбросить фильтр</button></div>`}`;
  serBar(); scheduleRefit(L); }
function serBar(){ const b=$('#psrBar'); if(!b) return; const n=SEL.size;
  b.innerHTML=`<span class="psr-n">${n?`Выбрано: <b>${n}</b>`:'Отметьте понравившиеся открытки'}</span><span class="ks-sp"></span>
    <button class="btn sm" data-psr="open"${n===1?'':' disabled'} title="Открыть одну выбранную в «Макете»">В макет</button>
    <button class="btn sm" data-psr="save"${n?'':' disabled'} title="Сохранить выбранные как мои шаблоны">В мои шаблоны</button>
    <button class="btn sm" data-psr="envsel"${n?'':' disabled'}>Конверт</button>
    <button class="btn sm primary" data-psr="print"${n?'':' disabled'}>${KS.icon('<path d="M6 9V3h12v6M6 18H4v-7h16v7h-2M7 14h10v7H7z"/>')}Печать${n?' ('+n+')':''}</button>`;
  $$('.psr-card').forEach(c=>{ const on=SEL.has(c.dataset.psrcard); c.classList.toggle('on',on); const p=c.querySelector('.psr-pick'); if(p) p.setAttribute('aria-pressed',on); });
  const a=$('[data-psr="all"]'); if(a){ const L=$$('.psr-card').length; a.textContent=n&&n===L?'Снять выбор':'Выбрать все'; } }
function gridFor(scr){ const av=Math.max(300,(scr.clientWidth||900)-40), cols=Math.max(1,Math.min(4,Math.floor((av+18)/(272+18)))), cw=(av-18*(cols-1))/cols; return {cols,tw:Math.round(Math.min(340,cw-28))}; }
let RZ=0; addEventListener('resize',()=>{ clearTimeout(RZ); RZ=setTimeout(()=>{ const a=KS.active&&KS.active(); if(a&&a.id==='pcser') serScreen(scrSer()); },250); });
/* fonts may still be loading on first build: measure again when they are ready */
let refitT=0; const FONT_OK=new Set();
function scheduleRefit(L){ clearTimeout(refitT); if(!document.fonts||!L.length) return; const t=(S().text||'').trim(); if(!t) return; const fams=new Set();
  L.forEach(({V})=>['h','b'].forEach(k=>{ const f=dzFont(k,V); if(!FONT_OK.has(f)) fams.add(f); })); if(!fams.size) return;
  refitT=setTimeout(()=>{ Promise.all([...fams].map(f=>document.fonts.load('16px '+f,t).catch(()=>{}))).then(()=>{ fams.forEach(f=>FONT_OK.add(f)); FIT.clear(); const scr=scrSer(); if(scr&&!scr.hidden) serScreen(scr); }); },60); }
let SER_T=0; const serSoon=()=>{ clearTimeout(SER_T); SER_T=setTimeout(()=>serScreen(scrSer()),220); };
function refreshAll(){ const a=KS.active&&KS.active(); if(!a) return; if(a.id==='pcser'){ const b=$('[data-panel="ks-postcard"] .kssub'); if(b) serPanel(b); serScreen(scrSer()); } if(a.id==='pccat'){ catScreen(scrCat()); } }

function selIds(){ const order=$$('.psr-card').map(c=>c.dataset.psrcard); return order.filter(id=>SEL.has(id)).concat([...SEL].filter(id=>!order.includes(id))); }
function applyOne(V){ V.id='ser'+Date.now().toString(36); delete V.base; if(KS.postcard&&KS.postcard.apply) return KS.postcard.apply(V);
  if(st.ui.app!=='print') dzSetMode('print'); applyProduct(V.kind==='pcV'?'pc15v':'pc15h',true); dzApplyTpl(V); st.dz.sides=2; update(); goTab('dz'); }
async function saveMine(ids){ if(!ids.length) return; const src=PH?await shrink(PH.full,1200,.85):null; st.myTpl=st.myTpl||[]; const t=(S().text||'').trim().split('\n')[0];
  ids.slice().reverse().forEach(id=>{ const T=findT(id); if(!T) return; const V=makeVar(T,src,S().text); delete V.base; delete V.mine;
    Object.assign(V,{id:'my'+KS.uid('s'),mine:true,name:(t?t.slice(0,22):T.name)+(t?' · '+T.name:'').slice(0,24),tags:[...new Set([...(T.tags||[]).filter(x=>x!=='мои'),'мои','Серия'])]}); st.myTpl.unshift(V); });
  update(); KS.toast(`В «Мои шаблоны»: ${plural(ids.length,'открытка','открытки','открыток')}. Они первые в галерее «Открытки».`); }
function printSel(ids){ if(!ids.length) return; let empty=0; const P=ids.map((id,i)=>{ const V=fullVar(id); if(!V) return null; if(emptySlot(V)) empty++; const d=dzFromTpl(V,V.w,V.h);
    return KS.page(V.w,V.h,dzHTML(d,'front',{}),'otkrytka-'+String(i+1).padStart(2,'0')); }).filter(Boolean);
  if(empty) KS.toast(`В ${plural(empty,'открытке','открытках','открытках')} пустая рамка для фото — добавьте фото слева`);
  KS.print(P); }

/* ---------- envelope ---------- */
let ENV_SRC=null; /* {name, pal, fonts} */
function envSource(prefSel){ const ids=prefSel?selIds():[];
  if(ids.length){ const V=fullVar(ids[0]); if(V) return {name:V.name,pal:dzPal(V.pal),fonts:V.fonts}; }
  if(st.dz&&st.dz.on!==false&&isPCk(st.dz.kind)) return {name:(st.dz.front||[]).filter(e=>e.t==='text').sort((a,b)=>(b.size||0)-(a.size||0)).map(e=>e.text)[0]||'текущая открытка',pal:dzPal(st.dz.pal),fonts:Object.assign({h:'Montserrat',b:'PT Sans'},st.dz.fonts),cur:1};
  const L=$('.psr-card')?serList():[]; const T=(L[0]&&L[0].V)||allPC()[0]; return T?{name:T.name,pal:dzPal(T.pal),fonts:Object.assign({h:'Montserrat',b:'PT Sans'},T.fonts)}:{name:'',pal:dzPal({ink:'#2d2a26',acc:'#b08d57'}),fonts:{h:'Cormorant Garamond',b:'Manrope'}}; }
const envDims=()=>{ const e=S().env; return {W:clamp(+e.w||162,120,174),H:clamp(+e.h||114,90,140)}; };
function svgT(x,y,txt,o){ o=o||{}; return `<text x="${r2(x)}" y="${r2(y)}"${o.a?` text-anchor="${o.a}"`:''} font-family="${E(o.f||BF)}" font-size="${o.s||3}"${o.w?` font-weight="${o.w}"`:''}${o.i?' font-style="italic"':''}${o.ls?` letter-spacing="${o.ls}"`:''} fill="${o.c||'#333'}"${o.op?` opacity="${o.op}"`:''}${o.tr?` transform="${o.tr}"`:''}>${E(txt)}</text>`; }
function envFront(x,y,W,H,src,uid){ const e=S().env, p=src.pal, hf=dzFont('h',src), L=logoCfg(), [mw,mh]=markBox(L.v), col=k=>dzCol(k,p);
  const from=(e.from||shopName()||'tadhayrapetian'), from2=e.from2||(st.shop&&st.shop.phone)||'', x0=W*.42, ly=[H-41,H-32.5,H-24,H-15.5], lines=[e.to,e.addr,e.city];
  let s=`<svg width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}" style="position:absolute;inset:0"><defs><clipPath id="ec${uid}"><rect x="6" y="6" width="${W-12}" height="${H-12}" rx="2.5"/></clipPath></defs>
    <g clip-path="url(#ec${uid})"><circle cx="6" cy="${H-6}" r="30" fill="${col('soft')}"/><circle cx="6" cy="${H-6}" r="22" fill="none" stroke="${col('acc')}" stroke-width=".45" opacity=".75"/><circle cx="6" cy="${H-6}" r="15" fill="${col('acc2')}" opacity=".32"/><circle cx="6" cy="${H-6}" r="38" fill="none" stroke="${col('acc')}" stroke-width=".25" opacity=".45"/></g>
    <rect x="6" y="6" width="${W-12}" height="${H-12}" rx="2.5" fill="none" stroke="${col('acc')}" stroke-width=".35"/><rect x="7.6" y="7.6" width="${W-15.2}" height="${H-15.2}" rx="1.6" fill="none" stroke="${col('acc')}" stroke-width=".15" opacity=".55"/>
    ${svgT(14+mw,14.5,'ОТ КОГО',{s:2,ls:.5,c:col('mute')})}${svgT(14+mw,20.3,from.slice(0,34),{f:hf,s:4.4,c:col('ink')})}${from2?svgT(14+mw,25,from2.slice(0,44),{s:2.5,c:col('mute')}):''}
    <rect x="${W-34}" y="11" width="22" height="26" rx="1" fill="none" stroke="${col('ink')}" stroke-opacity=".4" stroke-width=".3" stroke-dasharray="1.4 1"/>${svgT(W-23,25.2,'МАРКА',{a:'middle',s:2,ls:.45,c:col('mute')})}
    <circle cx="${W-37}" cy="31" r="8.5" fill="none" stroke="${col('acc')}" stroke-width=".3" opacity=".5"/><circle cx="${W-37}" cy="31" r="7" fill="none" stroke="${col('acc')}" stroke-width=".18" opacity=".5"/>
    ${[0,1,2].map(i=>`<path d="M${W-60} ${27+i*2.6} q3 -1.2 6 0 t6 0 t6 0 t6 0" fill="none" stroke="${col('acc')}" stroke-width=".22" opacity=".45"/>`).join('')}
    ${e.note?svgT(14,H-48,e.note.slice(0,26),{f:hf,s:7.2,i:1,c:col('acc')}):''}
    ${svgT(x0,ly[0]-9.5,'КОМУ',{s:2,ls:.5,c:col('mute')})}
    ${ly.map(yy=>`<line x1="${r2(x0)}" y1="${yy}" x2="${W-14}" y2="${yy}" stroke="${col('ink')}" stroke-opacity=".35" stroke-width=".25"/>`).join('')}
    ${lines.map((t,i)=>t?svgT(x0+1,ly[i]-1.4,String(t).slice(0,40),{f:SF,s:5.4,c:col('ink')}):'').join('')}
    ${[0,1,2,3].map(i=>`<rect x="${r2(W-14-4*5.2+i*5.2+.4)}" y="${ly[3]+2.2}" width="4.4" height="5.4" rx=".4" fill="none" stroke="${col('ink')}" stroke-opacity=".35" stroke-width=".2"/>`).join('')}${svgT(W-14-4*5.2-1.5,ly[3]+6.4,'индекс',{a:'end',s:1.9,c:col('mute')})}
  </svg><div style="position:absolute;left:12mm;top:${r2(11+(18-mh)/2)}mm;width:${mw}mm;height:${mh}mm">${mark({v:L.v,color:'ink'},p)}</div>`;
  return `<div style="position:absolute;left:${r2(x)}mm;top:${r2(y)}mm;width:${W}mm;height:${H}mm;overflow:hidden;background:#fff">${s}</div>`; }
function envBack(x,y,W,H,src){ const p=src.pal, col=k=>dzCol(k,p), cy=H*.56;
  const s=`<svg width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}" style="position:absolute;inset:0">
    <path d="M6 6 L${W/2-14} ${cy-6} Q${W/2} ${cy+4} ${W/2+14} ${cy-6} L${W-6} 6 Z" fill="${col('soft')}"/>
    <path d="M6 6 L${W/2-14} ${cy-6} Q${W/2} ${cy+4} ${W/2+14} ${cy-6} L${W-6} 6" fill="none" stroke="${col('ink')}" stroke-opacity=".28" stroke-width=".3"/>
    <path d="M6 ${H-6} L${W*.36} ${H*.5} M${W-6} ${H-6} L${W*.64} ${H*.5}" stroke="${col('ink')}" stroke-opacity=".18" stroke-width=".3"/>
    <rect x="6" y="6" width="${W-12}" height="${H-12}" rx="2.5" fill="none" stroke="${col('acc')}" stroke-width=".35"/>
    <circle cx="${W/2}" cy="${cy}" r="11" fill="${col('acc')}"/><circle cx="${W/2}" cy="${cy}" r="9.7" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width=".3" stroke-dasharray=".8 .6"/>
    ${svgT(W/2,H-12,(shopName()||'tadhayrapetian').toUpperCase().slice(0,34),{a:'middle',s:2.3,ls:.7,c:col('mute')})}</svg>
    <div style="position:absolute;left:${r2(W/2-7)}mm;top:${r2(cy-7)}mm;width:14mm;height:14mm">${mark({v:'mono',color:'white',sub:''},p)}</div>`;
  return `<div style="position:absolute;left:${r2(x)}mm;top:${r2(y)}mm;width:${W}mm;height:${H}mm;overflow:hidden;background:#fff">${s}</div>`; }
function crops(x,y,w,h){ let s=''; [[x,y],[x+w,y],[x,y+h],[x+w,y+h]].forEach(([mx,my])=>{ const dx=mx===x?-1:1, dy=my===y?-1:1;
    s+=`<line x1="${r2(mx+dx*2)}" y1="${r2(my)}" x2="${r2(mx+dx*7)}" y2="${r2(my)}"/><line x1="${r2(mx)}" y1="${r2(my+dy*2)}" x2="${r2(mx)}" y2="${r2(my+dy*7)}"/>`; });
  return `<svg width="210mm" height="297mm" viewBox="0 0 210 297" style="position:absolute;inset:0;overflow:visible"><g stroke="#888" stroke-width=".15">${s}</g></svg>`; }
function envFlatPage(src){ const {W,H}=envDims(), x=(210-W)/2, g=18, y1=(297-2*H-g)/2, y2=y1+H+g, uid=KS.uid('');
  const lab=(yy,t)=>`<div style="position:absolute;left:${r2(x+10)}mm;top:${r2(yy-6.2)}mm;font:600 2.3mm/1 ${BF};letter-spacing:.12em;color:#777">${E(t)}</div>`;
  return KS.page(210,297,envFront(x,y1,W,H,src,uid)+envBack(x,y2,W,H,src)+crops(x,y1,W,H)+crops(x,y2,W,H)+lab(y1,`ЛИЦЕВАЯ СТОРОНА · ${W} × ${H} ММ`)+lab(y2,'ОБРАТНАЯ СТОРОНА · КЛАПАН')
    +`<div style="position:absolute;left:${r2(x)}mm;top:${r2(y2+H+5)}mm;width:${W}mm;font:2.4mm/1.4 ${BF};color:#777">Вырежьте по меткам и наклейте на готовый конверт C6 — или печатайте прямо на конверт кнопкой «На конверт».</div>`,'konvert-dizain-a4'); }
function envNetPage(src){ const e=S().env, {W,H}=envDims(), p=src.pal, col=k=>dzCol(k,p), sw=Math.min(18,(198-W)/2), t=Math.round(H*.5), b=Math.round(H*.68);
  const x0=(210-W)/2, y0=Math.max(10,(281-t-H-b)/2)+t, X1=x0+W, Y1=y0+H, cx=x0+W/2, uid=KS.uid('n'), deco=e.deco!==false;
  const top=`L${r2(cx-16)} ${r2(y0-t+7)} Q${r2(cx)} ${r2(y0-t-1.5)} ${r2(cx+16)} ${r2(y0-t+7)} L${r2(X1)} ${r2(y0)}`;
  const right=`L${r2(X1)} ${r2(y0+1)} L${r2(X1+sw-2)} ${r2(y0+9)} Q${r2(X1+sw)} ${r2(y0+10)} ${r2(X1+sw)} ${r2(y0+13)} L${r2(X1+sw)} ${r2(Y1-13)} Q${r2(X1+sw)} ${r2(Y1-10)} ${r2(X1+sw-2)} ${r2(Y1-9)} L${r2(X1)} ${r2(Y1-1)} L${r2(X1)} ${r2(Y1)}`;
  const bottom=`L${r2(X1-14)} ${r2(Y1+b-9)} Q${r2(X1-15)} ${r2(Y1+b)} ${r2(X1-24)} ${r2(Y1+b)} L${r2(x0+24)} ${r2(Y1+b)} Q${r2(x0+15)} ${r2(Y1+b)} ${r2(x0+14)} ${r2(Y1+b-9)} L${r2(x0)} ${r2(Y1)}`;
  const left=`L${r2(x0)} ${r2(Y1-1)} L${r2(x0-sw+2)} ${r2(Y1-9)} Q${r2(x0-sw)} ${r2(Y1-10)} ${r2(x0-sw)} ${r2(Y1-13)} L${r2(x0-sw)} ${r2(y0+13)} Q${r2(x0-sw)} ${r2(y0+10)} ${r2(x0-sw+2)} ${r2(y0+9)} L${r2(x0)} ${r2(y0+1)} Z`;
  const outline=`M${r2(x0)} ${r2(y0)} ${top} ${right} ${bottom} ${left}`;
  const gy1=y0+H*.4, gy2=Y1-16, glue=[[x0-sw+2.5,gy1],[X1+sw-9.5,gy1]];
  let s=`<svg width="210mm" height="297mm" viewBox="0 0 210 297" style="position:absolute;inset:0">
    <defs><pattern id="pf${uid}" width="3.2" height="3.2" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="3.2" stroke="${col('acc')}" stroke-width=".55" opacity=".32"/></pattern>

      <clipPath id="pc${uid}"><path d="${outline}"/></clipPath></defs>`;
  if(deco) s+=`<g clip-path="url(#pc${uid})"><rect x="0" y="0" width="210" height="297" fill="${col('soft')}"/><rect x="0" y="0" width="210" height="297" fill="url(#pf${uid})"/></g>`;
  s+=`</svg>`;
  let html=s;
  if(deco){ html+=envFront(x0,y0,W,H,src,uid); const L=logoCfg();
    html+=`<div style="position:absolute;left:${r2(cx-11)}mm;top:${r2(y0-t+5)}mm;width:22mm;height:22mm;transform:rotate(180deg)"><svg viewBox="0 0 22 22" width="22mm" height="22mm" style="position:absolute;inset:0"><circle cx="11" cy="11" r="10.6" fill="${col('acc')}"/><circle cx="11" cy="11" r="9.3" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width=".3" stroke-dasharray=".8 .6"/></svg><div style="position:absolute;left:4mm;top:4mm;width:14mm;height:14mm">${mark({v:'mono',color:'white',sub:''},p)}</div></div>`;
    html+=`<div style="position:absolute;left:${r2(x0+24)}mm;top:${r2(Y1+b-16)}mm;width:${r2(W-48)}mm;text-align:center;transform:rotate(180deg);font:600 2.3mm/1 ${BF};letter-spacing:.2em;color:${col('mute')}">${E((shopName()||'tadhayrapetian').toUpperCase().slice(0,34))}${L.sub?' · '+E(L.sub.toUpperCase()):''}</div>`; }
  else html+=`<div style="position:absolute;left:${r2(x0)}mm;top:${r2(y0+H/2-4)}mm;width:${W}mm;text-align:center;font:600 3mm/1.3 ${BF};color:#999">ЛИЦЕВАЯ СТОРОНА<br><span style="font-weight:400;font-size:2.4mm">${W} × ${H} мм</span></div>`;
  /* lines over everything */
  const pg=id=>`<defs><pattern id="${id}" width="1.6" height="1.6" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><line x1="0" y1="0" x2="0" y2="1.6" stroke="#555" stroke-width=".25"/></pattern></defs>`;
  html+=`<svg width="210mm" height="297mm" viewBox="0 0 210 297" style="position:absolute;inset:0;overflow:visible">${pg('pg'+uid)}
    ${glue.map(([gx,gy])=>`<rect x="${r2(gx)}" y="${r2(gy)}" width="7" height="${r2(gy2-gy)}" fill="url(#pg${uid})" opacity=".55" stroke="#666" stroke-width=".15"/>${svgT(gx+4.6,(gy+gy2)/2,'КЛЕЙ',{a:'middle',s:2.1,w:700,ls:.5,c:'#444',tr:`rotate(-90 ${r2(gx+4.6)} ${r2((gy+gy2)/2)})`})}`).join('')}
    <rect x="${r2(x0)}" y="${r2(y0)}" width="${W}" height="${H}" fill="none" stroke="${deco?col('ink'):'#666'}" stroke-opacity=".55" stroke-width=".22" stroke-dasharray="2 1.5"/>
    <path d="${outline}" fill="none" stroke="#1d1d1f" stroke-width=".3"/>
    ${svgT(cx,y0-2,'сгиб',{a:'middle',s:1.9,c:'#888'})}${svgT(cx,Y1+3.6,'сгиб',{a:'middle',s:1.9,c:'#888'})}
    ${[[x0-sw-2,y0+12],[X1+sw+2,y0+12]].map(([sx,sy],i)=>`<g transform="translate(${r2(sx)} ${r2(sy)}) rotate(${i?90:-90}) scale(.9)" fill="none" stroke="#555" stroke-width=".35"><circle cx="-1.6" cy="-1.4" r="1.1"/><circle cx="-1.6" cy="1.4" r="1.1"/><path d="M-.6 -.9 L3.4 1.6 M-.6 .9 L3.4 -1.6"/></g>`).join('')}</svg>`;
  const ly=Math.min(285,Y1+b+7);
  html+=`<div style="position:absolute;left:14mm;right:14mm;top:${r2(ly)}mm;display:flex;gap:5mm;align-items:center;flex-wrap:wrap;font:2.35mm/1.35 ${BF};color:#555">
    <span><svg width="8mm" height="2mm" viewBox="0 0 8 2" style="vertical-align:middle"><line x1="0" y1="1" x2="8" y2="1" stroke="#1d1d1f" stroke-width=".3"/></svg> резать</span>
    <span><svg width="8mm" height="2mm" viewBox="0 0 8 2" style="vertical-align:middle"><line x1="0" y1="1" x2="8" y2="1" stroke="#666" stroke-width=".25" stroke-dasharray="2 1.5"/></svg> сгибать</span>
    <span><svg width="4mm" height="3mm" viewBox="0 0 4 3" style="vertical-align:middle">${pg('pl'+uid)}<rect x="0" y="0" width="4" height="3" fill="url(#pl${uid})" stroke="#666" stroke-width=".15"/></svg> клей</span>
    <span style="flex:1 1 100%">1 Вырежьте по сплошной · 2 Согните по пунктиру · 3 Боковые клапаны внутрь · 4 Клей на отмеченные зоны, нижний клапан вверх · 5 Вложите открытку, закройте верхний клапан наклейкой. Конверт ${W} × ${H} мм для открытки 15 × 10.</span></div>`;
  return KS.page(210,297,html,'konvert-razvertka-a4'); }
function envDirectPage(src){ const {W,H}=envDims(); return KS.page(W,H,envFront(0,0,W,H,src,KS.uid('d')),'konvert-'+W+'x'+H); }
function envPages(kind,src){ src=src||ENV_SRC||envSource(false); return kind==='flat'?[envFlatPage(src)]:kind==='net'?[envNetPage(src)]:kind==='direct'?[envDirectPage(src)]:[envFlatPage(src),envNetPage(src)]; }
function pv(page,wpx){ const k=wpx/(page.pw*PX); return `<div class="psr-pv" style="width:${wpx}px;height:${Math.round(page.ph*PX*k)}px"><div style="transform:scale(${k});transform-origin:0 0;width:${page.pw}mm;height:${page.ph}mm">${page.html}</div></div>`; }
let ENV_M=null;
function envOpen(prefSel){ ENV_SRC=envSource(prefSel); const e=S().env; if(!e.from) e.from=shopName(); if(!e.from2) e.from2=(st.shop&&st.shop.phone)||'';
  ENV_M=ENV_M||KS.modal({id:'pcsenv',title:'Конверт к открытке',wide:true}); ENV_M.open(); envRender(); }
function envRender(){ if(!ENV_M) return; const e=S().env, {W,H}=envDims(), src=ENV_SRC, P=src.pal;
  const sw=['bg','ink','acc','acc2','soft'].map(k=>`<i style="background:${dzCol(k,P)}"></i>`).join('');
  ENV_M.el.innerHTML=`<div class="psr-env"><div class="psr-envpv" id="psrEnvPv"></div>
    <div class="psr-envf"><div class="psr-src"><span class="psr-sw">${sw}</span><span class="grow"><small>По открытке</small><b>${E(String(src.name||'').split('\n')[0].slice(0,40))}</b></span></div>
      <div class="row2"><label class="f">Ширина, мм<input type="number" data-pse="w" min="120" max="174" value="${W}"></label><label class="f">Высота, мм<input type="number" data-pse="h" min="90" max="140" value="${H}"></label></div>
      <p class="hint">Открытка 152 × 102 входит с запасом ${r2((W-152)/2)} мм по бокам и ${r2((H-102)/2)} мм сверху и снизу.${W<156||H<106?' <b style="color:var(--danger)">Мало места для открытки.</b>':''}</p>
      <label class="f">Надпись на лицевой<input type="text" data-pse="note" maxlength="26" value="${E(e.note)}" placeholder="Для тебя"></label>
      <div class="row2"><label class="f">От кого<input type="text" data-pse="from" maxlength="34" value="${E(e.from)}" placeholder="tadhayrapetian"></label><label class="f">Вторая строка<input type="text" data-pse="from2" maxlength="44" value="${E(e.from2)}" placeholder="телефон"></label></div>
      <label class="f">Кому<input type="text" data-pse="to" maxlength="40" value="${E(e.to)}" placeholder="пусто — линии для руки"></label>
      <div class="row2"><label class="f">Адрес<input type="text" data-pse="addr" maxlength="40" value="${E(e.addr)}"></label><label class="f">Город, индекс<input type="text" data-pse="city" maxlength="40" value="${E(e.city)}"></label></div>
      <label class="chk"><input type="checkbox" data-pse="deco"${e.deco!==false?' checked':''}> Рисунок на развёртке (цвет на клапанах)</label>
      <div class="psr-envbtns"><button class="btn primary" data-pseprint="all">${KS.icon('<path d="M6 9V3h12v6M6 18H4v-7h16v7h-2M7 14h10v7H7z"/>')}Печать: дизайн + развёртка</button>
      <div class="flexw"><button class="btn sm" data-pseprint="flat">Дизайн A4</button><button class="btn sm" data-pseprint="net">Развёртка A4</button><button class="btn sm" data-pseprint="direct" title="Печать прямо на готовый конверт через задний лоток">На конверт ${W} × ${H}</button><button class="btn sm" data-pseprint="pdf">Скачать PDF</button></div></div>
      <p class="hint">Развёртку печатайте на плотной бумаге A4 (120–200 г/м²), масштаб 100%. На готовый конверт — задний лоток GX4040, лицом вверх.</p></div></div>`;
  envPreview(); }
function envPreview(){ const box=$('#psrEnvPv'); if(!box) return; const [a,b]=envPages('all',ENV_SRC);
  box.innerHTML=`<figure>${pv(a,250)}<figcaption>Дизайн на A4</figcaption></figure><figure>${pv(b,250)}<figcaption>Развёртка для вырезания</figcaption></figure>`; }
let ENV_T=0;
document.addEventListener('input',ev=>{ const t=ev.target; if(!t.dataset||!t.dataset.pse) return; const e=S().env, k=t.dataset.pse;
  if(k==='deco') e.deco=t.checked; else if(k==='w'||k==='h') e[k]=+t.value||(k==='w'?162:114); else e[k]=t.value; KS.save();
  clearTimeout(ENV_T); ENV_T=setTimeout(()=>{ if(k==='w'||k==='h'){ const f=document.activeElement===t; envRender(); if(f){ const n=$(`[data-pse="${k}"]`); if(n){ n.focus(); try{ n.setSelectionRange(99,99); }catch(_){ } } } } else envPreview(); },180); });
document.addEventListener('change',ev=>{ const t=ev.target; if(t.dataset&&t.dataset.pse==='deco'){ S().env.deco=t.checked; KS.save(); envPreview(); } });
async function envAct(k){ const P=envPages(k==='pdf'?'all':k,ENV_SRC); if(k==='pdf'){ await pdfDownload(P,'konvert',$('[data-pseprint="pdf"]')); return; } KS.print(P); }

/* ---------- catalog ---------- */
const CS=()=>S().c;
function catAll(){ const c=CS(), s=S(); let L=allPC();
  if(c.src==='mine') L=L.filter(t=>t.mine); else if(c.src==='fav') L=L.filter(t=>(s.fav||[]).includes(t.id)); else if(c.src==='cat') L=L.filter(t=>!c.cat||(t.tags||[]).includes(c.cat));
  L=L.filter(T=>c.ori==='all'||(c.ori==='h'?T.kind==='pcH':T.kind==='pcV')); return L.filter(T=>T.kind==='pcH').concat(L.filter(T=>T.kind!=='pcH')); }
function catItems(){ const c=CS(); let n=0; return catAll().filter(T=>!c.off[T.id]).map(T=>({T,no:++n,name:c.names[T.id]||T.name,price:c.prices[T.id]!=null&&c.prices[T.id]!==''?+c.prices[T.id]:+c.price||0})); }
const catPages=n=>Math.ceil(n/(+CS().per||9));
const nn=n=>String(n).padStart(2,'0');
function catTpl(T){ const V=JSON.parse(JSON.stringify(T)); V.front=(V.front||[]).flatMap(e=>{ if(e.t!=='img'||e.k==='logo'||e.src) return [e]; const m=Math.min(e.w,e.h);
    return [Object.assign({},e,{t:'rect',fill:{g:'linear',a:135,s:[['soft',0],['acc/40',100]]},src:undefined}),{t:'icon',icon:'camera',x:e.x+e.w/2-m*.13,y:e.y+e.h/2-m*.13,w:m*.26,h:m*.26,color:'ink/45',sw:1.6,rot:e.rot||0}]; }); return V; }
function mini(T,bw,bh,extra){ const k=Math.min(bw/T.w,bh/T.h), w=r2(T.w*k), h=r2(T.h*k), V=catTpl(T), d=dzFromTpl(V,V.w,V.h);
  return {w,h,html:`<div style="position:relative;width:${w}mm;height:${h}mm;overflow:hidden;background:#fff;border:.18mm solid rgba(60,45,30,.22);box-sizing:content-box;box-shadow:0 .6mm 1.8mm rgba(40,30,20,.2);${extra||''}"><div style="position:absolute;left:0;top:0;width:${T.w}mm;height:${T.h}mm;transform:scale(${k});transform-origin:0 0">${dzHTML(d,'front',{})}</div></div>`}; }
const GOLD='#a8804a', INK='#2a2622', MUTE='#8a8178', CREAM='#f6f1e9';
function contacts(){ const sh=st.shop||{}; return [sh.phone,sh.addr,CS().extra].map(x=>(x||'').trim()).filter(Boolean); }
function catCover(items){ const c=CS(), L=logoCfg(), [mw,mh]=markBox(L.v), k=44/Math.max(mw,mh), cw=r2(mw*k), ch=r2(mh*k), pal=dzPal({ink:INK,acc:GOLD});
  const pick=items.slice(0,3), min=items.length?Math.min(...items.map(i=>i.price)):0; let fan='';
  const pos=[[-9,-30,6],[8,30,6],[0,0,0]]; const order=pick.length===3?[0,1,2]:pick.length===2?[0,1]:[2];
  order.forEach((pi,j)=>{ const it=pick[j]; if(!it) return; const [rt,dx,dy]=pos[pi]; const m=mini(it.T,it.T.kind==='pcV'?54:80,it.T.kind==='pcV'?80:80); fan+=`<div style="position:absolute;left:${r2(105+dx-m.w/2)}mm;top:${r2(160+dy-m.h/2)}mm;transform:rotate(${rt}deg)">${m.html}</div>`; });
  const ct=contacts();
  return KS.page(210,297,`<div style="position:absolute;left:8mm;top:8mm;right:8mm;bottom:8mm;background:${CREAM}"></div>
    <div style="position:absolute;left:13mm;top:13mm;right:13mm;bottom:13mm;border:.35mm solid ${GOLD};opacity:.7"></div><div style="position:absolute;left:14.6mm;top:14.6mm;right:14.6mm;bottom:14.6mm;border:.15mm solid ${GOLD};opacity:.6"></div>
    <div style="position:absolute;left:${r2(105-cw/2)}mm;top:${r2(26+(44-ch)/2)}mm;width:${cw}mm;height:${ch}mm">${mark({v:L.v,color:'ink'},pal)}</div>
    <div style="position:absolute;left:20mm;right:20mm;top:78mm;text-align:center;font:500 13mm/1.05 ${HF};color:${INK}">${E(c.title||'Каталог открыток')}</div>
    <div style="position:absolute;left:24mm;right:24mm;top:95mm;text-align:center;font:600 2.7mm/1.4 ${BF};letter-spacing:.24em;text-transform:uppercase;color:${GOLD}">${E(c.sub||'')}</div>
    <div style="position:absolute;left:92mm;width:26mm;top:104mm;border-top:.25mm solid ${GOLD}"></div>
    ${fan}
    <div style="position:absolute;left:20mm;right:20mm;top:212mm;text-align:center;font:400 4.6mm/1.3 ${HF};font-style:italic;color:${INK}">${plural(items.length,'открытка','открытки','открыток')}${items.length?' · от '+E(KS.money(min)):''}</div>
    ${shopName()?`<div style="position:absolute;left:20mm;right:20mm;top:236mm;text-align:center;font:600 6.4mm/1.2 ${HF};color:${INK}">${E(shopName())}</div>`:''}
    <div style="position:absolute;left:20mm;right:20mm;top:247mm;text-align:center;font:2.9mm/1.6 ${BF};color:${MUTE}">${ct.map(E).join('<br>')}</div>
    <div style="position:absolute;left:20mm;right:20mm;top:274mm;text-align:center;font:600 2.2mm/1 ${BF};letter-spacing:.3em;color:${GOLD}">${new Date().getFullYear()}</div>`,'katalog-otkrytok'); }
function catPage(items,pi,total){ const c=CS(), per=+c.per||9, cols=per===6?2:3, M=14, gx=8, gy=6, top=33, bot=277, avail=bot-top, cw=(210-2*M-gx*(cols-1))/cols, cap=per===6?14:13.5, maxBh=(avail-2*gy)/3-cap, pal=dzPal({ink:INK,acc:GOLD});
  let h=`<div style="position:absolute;left:${M}mm;top:11mm;width:12mm;height:12mm">${mark({v:'mono',color:'ink',sub:''},pal)}</div>
    <div style="position:absolute;left:${M+15}mm;top:12.2mm;font:600 5mm/1 ${HF};color:${INK}">${E(shopName()||'tadhayrapetian')}</div>
    <div style="position:absolute;left:${M+15}mm;top:18.6mm;font:600 2.1mm/1 ${BF};letter-spacing:.22em;text-transform:uppercase;color:${GOLD}">${E(c.title||'Каталог открыток')}</div>
    <div style="position:absolute;right:${M}mm;top:15mm;font:2.4mm/1 ${BF};color:${MUTE};text-align:right">№ ${nn(items[0].no)}–${nn(items[items.length-1].no)}</div>
    <div style="position:absolute;left:${M}mm;right:${M}mm;top:26.5mm;border-top:.3mm solid ${GOLD}"></div>`;
  const rows=[]; for(let i=0;i<items.length;i+=cols) rows.push(items.slice(i,i+cols));
  const cardK=T=>Math.min((cw-2)/T.w,(maxBh-2)/T.h), rowH=rows.map(r=>Math.max(...r.map(it=>it.T.h*cardK(it.T)))+3), used=rowH.reduce((a,b)=>a+b+cap,0);
  const g=rows.length>1?Math.min(16,(avail-used)/(rows.length-1)):0; let y=top+Math.max(0,(avail-used-g*(rows.length-1))/2);
  rows.forEach((r,ri)=>{ const bh=rowH[ri]; r.forEach((it,ci)=>{ const x=M+ci*(cw+gx), m=mini(it.T,cw-2,bh-3);
    h+=`<div style="position:absolute;left:${r2(x+(cw-m.w)/2)}mm;top:${r2(y+bh-m.h-1.5)}mm">${m.html}</div>
      <div style="position:absolute;left:${r2(x)}mm;top:${r2(y+bh+1.2)}mm;width:${r2(cw)}mm;border-top:.15mm solid rgba(168,128,74,.45);padding-top:1.6mm">
        <div style="font:700 2.1mm/1 ${BF};letter-spacing:.16em;color:${GOLD}">№ ${nn(it.no)}</div>
        <div style="display:flex;align-items:baseline;gap:2mm;margin-top:.9mm"><div style="flex:1;min-width:0;font:600 ${per===6?4.2:3.6}mm/1.15 ${HF};color:${INK};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${E(it.name)}</div><div style="font:700 ${per===6?3.6:3.2}mm/1 ${BF};color:${INK};white-space:nowrap">${E(KS.money(it.price))}</div></div>
        ${emptySlot(it.T)?`<div style="font:2mm/1.2 ${BF};color:${MUTE};margin-top:.5mm">с вашим фото</div>`:''}</div>`; }); y+=bh+cap+g; });
  const ct=contacts();
  h+=`<div style="position:absolute;left:${M}mm;right:${M}mm;top:281mm;border-top:.15mm solid rgba(0,0,0,.15)"></div>
    <div style="position:absolute;left:${M}mm;right:40mm;top:283.4mm;font:2.3mm/1.2 ${BF};color:${MUTE};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${E([shopName(),...ct].filter(Boolean).join('  ·  '))}</div>
    <div style="position:absolute;right:${M}mm;top:283.4mm;font:600 2.3mm/1.2 ${BF};color:${MUTE}">${pi} / ${total}</div>`;
  return KS.page(210,297,h,'katalog-otkrytok'); }
function catBuild(){ const items=catItems(), per=+CS().per||9, n=catPages(items.length), P=[catCover(items)];
  for(let i=0;i<n;i++) P.push(catPage(items.slice(i*per,i*per+per),i+2,n+1)); return P; }
async function pdfDownload(P,name,btn){ if(!P.length) return; const lbl=btn&&btn.innerHTML; if(btn) btn.disabled=true; const prog=i=>{ if(btn) btn.textContent=`PDF: ${i+1} из ${P.length}…`; };
  try{ let J=null; try{ await loadLib('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',()=>window.jspdf&&window.jspdf.jsPDF); J=window.jspdf.jsPDF; }catch(e){}
    if(!J){ KS.toast('PDF-библиотека не загрузилась. Открываю печать: выберите «Сохранить как PDF».'); KS.print(P); return; }
    let doc=null; for(let i=0;i<P.length;i++){ prog(i); const p=P[i], o=p.pw>p.ph?'l':'p'; let cv; try{ cv=await pageCanvasH2C(p,200); }catch(e){ cv=await pageCanvas(p,200); }
      const url=cv.toDataURL('image/jpeg',.92); if(!doc) doc=new J({orientation:o,unit:'mm',format:[p.pw,p.ph],compress:true}); else doc.addPage([p.pw,p.ph],o); doc.addImage(url,'JPEG',0,0,p.pw,p.ph,undefined,'FAST'); await new Promise(r=>setTimeout(r,0)); }
    if(await KS.download(name+'.pdf',doc.output('blob'))) KS.toast('PDF сохранён: '+name+'.pdf'); }
  catch(e){ console.warn('[pcseries] pdf',e); KS.toast('Не удалось сделать PDF. Нажмите «Печать» и выберите «Сохранить как PDF».'); }
  finally{ if(btn){ btn.disabled=false; btn.innerHTML=lbl; } } }
function catPanel(box){ const c=CS(), sh=st.shop||{};
  box.innerHTML=`<div class="card psr-pn"><div class="hd">Что войдёт</div>
    <div class="seg psr-seg">${[['all','Все'],['cat','Тема'],['fav','Избранные'],['mine','Мои']].map(([k,n])=>`<button data-pscsrc="${k}"${c.src===k?' class="on"':''}>${n}</button>`).join('')}</div>
    ${c.src==='cat'?`<label class="f">Тема<select id="pscCat"><option value="">Все темы</option>${CATS.map(x=>`<option${c.cat===x?' selected':''}>${x}</option>`).join('')}</select></label>`:''}
    ${c.src==='fav'?'<p class="hint">Звёздочка на карточке справа — в избранное.</p>':''}
    <div class="seg psr-seg">${[['all','Все'],['h','Горизонт.'],['v','Вертик.']].map(([k,n])=>`<button data-pscori="${k}"${c.ori===k?' class="on"':''}>${n}</button>`).join('')}</div></div>
  <div class="card psr-pn"><div class="hd">Оформление</div>
    <label class="f">Заголовок<input type="text" data-psc="title" maxlength="40" value="${E(c.title)}"></label>
    <label class="f">Подзаголовок<input type="text" data-psc="sub" maxlength="60" value="${E(c.sub)}"></label>
    <div class="ks-row"><span class="hint grow">Открыток на странице</span><div class="seg">${[6,9].map(n=>`<button data-pscper="${n}"${+c.per===n?' class="on"':''}>${n}</button>`).join('')}</div></div>
    <div class="ks-row"><label class="f grow">Цена за открытку, ${E((st.shop&&st.shop.cur)||'֏')}<input type="number" min="0" step="50" data-psc="price" value="${+c.price||0}"></label><button class="btn sm" data-psc-act="allprice" title="Убрать свои цены у карточек">Всем</button></div></div>
  <div class="card psr-pn"><div class="hd">Магазин и контакты</div>
    <label class="f">Название<input type="text" data-pscshop="name" value="${E(sh.name||'')}" placeholder="tadhayrapetian"></label>
    <div class="row2"><label class="f">Телефон<input type="text" inputmode="tel" data-pscshop="phone" value="${E(sh.phone||'')}"></label><label class="f">Instagram, сайт<input type="text" data-psc="extra" value="${E(c.extra||'')}" placeholder="@tadhayrapetian"></label></div>
    <label class="f">Адрес<input type="text" data-pscshop="addr" value="${E(sh.addr||'')}"></label></div>
  <div class="card psr-pn"><div class="hd">Готово</div><p class="hint" id="pscSum"></p>
    <button class="btn primary" data-psc-act="print">${KS.icon('<path d="M6 9V3h12v6M6 18H4v-7h16v7h-2M7 14h10v7H7z"/>')}Печать каталога</button>
    <div class="flexw"><button class="btn sm" data-psc-act="pdf">Скачать PDF</button><button class="btn sm" data-psc-act="pv">Предпросмотр</button></div>
    <p class="hint">«Печать» — векторный PDF: в окне печати выберите «Сохранить как PDF», поля «Нет», масштаб 100%.</p></div>`; catSum(); }
function catSum(){ const n=catItems().length, p=catPages(n); const t=n?`${plural(n,'открытка','открытки','открыток')} · обложка + ${plural(p,'страница','страницы','страниц')} A4`:'Нет открыток — выберите другой источник';
  const a=$('#pscSum'); if(a) a.textContent=t; const b=$('#pscHead'); if(b) b.textContent=t; $$('[data-psc-act="print"],[data-psc-act="pdf"],[data-psc-act="pv"]').forEach(x=>x.disabled=!n); }
let catObs=null;
function catScreen(scr){ if(!scr) return; const c=CS(), L=catAll(), s=S(); let no=0;
  scr.innerHTML=`<div class="psr-head"><div><h2>${E(c.title||'Каталог открыток')}</h2><p class="hint" id="pscHead"></p></div>
    <div class="flexw"><button class="btn sm" data-psc-act="on">Включить все</button><button class="btn sm" data-psc-act="offall">Снять все</button></div></div>
    ${L.length?`<div class="psc-grid">${L.map(T=>{ const off=!!c.off[T.id]; if(!off) no++; return `<div class="psc-card${off?' off':''}" data-psccard="${E(T.id)}">
      <div class="psc-top"><label class="chk"><input type="checkbox" data-psconoff="${E(T.id)}"${off?'':' checked'}><span class="psc-no">${off?'—':'№ '+nn(no)}</span></label>
      <button class="psc-star${(s.fav||[]).includes(T.id)?' on':''}" data-pscfav="${E(T.id)}" title="Избранное">${KS.icon('<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>')}</button></div>
      <div class="psc-th" data-pscth="${E(T.id)}" style="height:${T.kind==='pcV'?150:150}px"></div>
      <input type="text" class="psc-name" data-pscname="${E(T.id)}" value="${E(c.names[T.id]||T.name)}" maxlength="40" aria-label="Название">
      <label class="psc-price"><span>Цена</span><input type="number" min="0" step="50" data-pscprice="${E(T.id)}" value="${c.prices[T.id]!=null&&c.prices[T.id]!==''?+c.prices[T.id]:''}" placeholder="${+c.price||0}"><span>${E((st.shop&&st.shop.cur)||'֏')}</span></label></div>`; }).join('')}</div>`
    :`<div class="ks-empty"><b>${c.src==='fav'?'Избранных пока нет':c.src==='mine'?'Своих открыток пока нет':'Нет открыток'}</b><br>${c.src==='fav'?'Выберите «Все» и отметьте звёздочкой нужные открытки.':c.src==='mine'?'Сохраните понравившиеся во вкладке «Серия» — они появятся здесь.':'Смените тему или ориентацию.'}</div>`}`;
  if(catObs) catObs.disconnect(); catObs=new IntersectionObserver(es=>es.forEach(en=>{ if(!en.isIntersecting) return; const el=en.target; catObs.unobserve(el); const T=findT(el.dataset.pscth); if(!T) return;
    try{ el.innerHTML=thumb(catTpl(T),T.kind==='pcV'?100:200); }catch(e){ el.textContent=''; } }),{root:scr,rootMargin:'400px'});
  scr.querySelectorAll('[data-pscth]').forEach(el=>catObs.observe(el)); catSum(); }
function catRenumber(){ const c=CS(); let no=0; $$('.psc-card').forEach(card=>{ const off=!!c.off[card.dataset.psccard]; card.classList.toggle('off',off); const b=card.querySelector('.psc-no'); if(b) b.textContent=off?'—':'№ '+nn(++no); const i=card.querySelector('[data-psconoff]'); if(i) i.checked=!off; }); catSum(); }
let CPV=null;
function catPreview(){ const P=catBuild(); CPV=CPV||KS.modal({id:'pcscat',title:'Каталог: предпросмотр',wide:true}); CPV.title(`Каталог: ${plural(P.length,'страница','страницы','страниц')}`);
  CPV.el.innerHTML=`<div class="psc-pvgrid">${P.map((p,i)=>`<figure>${pv(p,210)}<figcaption>${i?'Стр. '+(i+1):'Обложка'}</figcaption></figure>`).join('')}</div><div class="flexw"><button class="btn primary" data-psc-act="print">Печать каталога</button><button class="btn" data-psc-act="pdf">Скачать PDF</button></div>`; CPV.open(); }

/* ---------- tabs ---------- */
KS.tab({id:'pcser',group:'postcard',seg:'Серия',title:'Серия',screen:true,
  render(box,o){ if(o.reason==='show'||!box.firstChild) serPanel(box); if(o.screen&&(o.reason==='show'||!o.screen.firstChild)) serScreen(o.screen); }});
KS.tab({id:'pccat',group:'postcard',seg:'Каталог',title:'Каталог',screen:true,
  render(box,o){ if(o.reason==='show'||!box.firstChild) catPanel(box); if(o.screen&&(o.reason==='show'||!o.screen.firstChild)) catScreen(o.screen); }});
KS.cmd('Конверт к открытке','открытки',()=>envOpen(KS.active&&KS.active()&&KS.active().id==='pcser'));
KS.cmd('Серия открыток из фото и текста','открытки',()=>KS.show('postcard','pcser'));
KS.cmd('Каталог открыток в PDF','открытки',()=>KS.show('postcard','pccat'));

/* ---------- events ---------- */
document.addEventListener('click',ev=>{ const t=ev.target; let b;
  if((b=t.closest('#psrDrop'))||(b=t.closest('[data-psr="photo"]'))){ KS.pick('image/*').then(f=>{ if(f[0]) setPhoto(f[0]); }); return; }
  if((b=t.closest('[data-psrpick]'))){ const id=b.dataset.psrpick; SEL.has(id)?SEL.delete(id):SEL.add(id); serBar(); return; }
  if((b=t.closest('[data-psropen]'))){ const V=fullVar(b.dataset.psropen); if(V) applyOne(V); return; }
  if((b=t.closest('[data-psrtxt]'))){ S().text=b.dataset.psrtxt; KS.save(); const a=$('#psrText'); if(a) a.value=S().text; serScreen(scrSer()); return; }
  if((b=t.closest('[data-psrori]'))){ S().ori=b.dataset.psrori; S().seed=0; KS.save(); b.parentNode.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b)); serScreen(scrSer()); return; }
  if((b=t.closest('[data-psrn]'))){ S().n=+b.dataset.psrn; S().seed=0; KS.save(); b.parentNode.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b)); serScreen(scrSer()); return; }
  if((b=t.closest('[data-psr]'))){ const k=b.dataset.psr, s=S();
    if(k==='nophoto') dropPhoto();
    else if(k==='more'){ const tot=serBase().length; s.seed=tot>(+s.n||9)?((+s.seed||0)+1)%Math.ceil(tot/(+s.n||9)):0; KS.save(); serScreen(scrSer()); if(tot<=(+s.n||9)) KS.toast('Это все шаблоны под фильтр — смените тему'); }
    else if(k==='reset'){ s.cat=''; s.ori='all'; s.seed=0; KS.save(); refreshAll(); }
    else if(k==='all'){ const ids=$$('.psr-card').map(c=>c.dataset.psrcard); if(SEL.size===ids.length) SEL.clear(); else ids.forEach(id=>SEL.add(id)); serBar(); }
    else if(k==='open'){ const ids=selIds(); if(ids.length!==1){ KS.toast('Отметьте одну открытку'); return; } const V=fullVar(ids[0]); if(V) applyOne(V); }
    else if(k==='save') saveMine(selIds());
    else if(k==='print') printSel(selIds());
    else if(k==='env') envOpen(true);
    else if(k==='envsel') envOpen(true);
    return; }
  if((b=t.closest('[data-pseprint]'))){ envAct(b.dataset.pseprint); return; }
  if((b=t.closest('[data-pscsrc]'))){ CS().src=b.dataset.pscsrc; KS.save(); const p=b.closest('.kssub'); if(p) catPanel(p); catScreen(scrCat()); return; }
  if((b=t.closest('[data-pscori]'))){ CS().ori=b.dataset.pscori; KS.save(); b.parentNode.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b)); catScreen(scrCat()); return; }
  if((b=t.closest('[data-pscper]'))){ CS().per=+b.dataset.pscper; KS.save(); b.parentNode.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b)); catSum(); return; }
  if((b=t.closest('[data-pscfav]'))){ const s=S(), id=b.dataset.pscfav; s.fav=s.fav||[]; const i=s.fav.indexOf(id); if(i<0) s.fav.push(id); else s.fav.splice(i,1); KS.save(); b.classList.toggle('on',i<0); if(CS().src==='fav') catScreen(scrCat()); return; }
  if((b=t.closest('[data-psc-act]'))){ const k=b.dataset.pscAct, c=CS();
    if(k==='allprice'){ c.prices={}; KS.save(); $$('[data-pscprice]').forEach(i=>{ i.value=''; i.placeholder=+c.price||0; }); KS.toast('У всех открыток цена '+KS.money(c.price)); }
    else if(k==='on'){ catAll().forEach(T=>delete c.off[T.id]); KS.save(); catRenumber(); }
    else if(k==='offall'){ catAll().forEach(T=>c.off[T.id]=true); KS.save(); catRenumber(); }
    else if(k==='print'){ if(!catItems().length) return; KS.print(catBuild()); }
    else if(k==='pdf'){ if(!catItems().length) return; pdfDownload(catBuild(),'katalog-otkrytok',b); }
    else if(k==='pv'){ if(catItems().length) catPreview(); }
    return; }
});
document.addEventListener('input',ev=>{ const t=ev.target; if(!t.dataset) return; const c=CS();
  if(t.id==='psrText'){ S().text=t.value; KS.save(); serSoon(); return; }
  if(t.dataset.psc){ const k=t.dataset.psc; c[k]=k==='price'?Math.max(0,+t.value||0):t.value; KS.save(); if(k==='price') $$('[data-pscprice]').forEach(i=>i.placeholder=c.price); if(k==='title'){ const sc=scrCat(), h=sc&&sc.querySelector('.psr-head h2'); if(h) h.textContent=t.value||'Каталог открыток'; } return; }
  if(t.dataset.pscshop){ st.shop[t.dataset.pscshop]=t.value; KS.save(); return; }
  if(t.dataset.pscname){ const v=t.value.trim(); if(v) c.names[t.dataset.pscname]=v; else delete c.names[t.dataset.pscname]; KS.save(); return; }
  if(t.dataset.pscprice){ if(t.value==='') delete c.prices[t.dataset.pscprice]; else c.prices[t.dataset.pscprice]=Math.max(0,+t.value||0); KS.save(); return; }
});
document.addEventListener('change',ev=>{ const t=ev.target;
  if(t.id==='psrCat'){ S().cat=t.value; S().seed=0; KS.save(); serScreen(scrSer()); return; }
  if(t.id==='pscCat'){ CS().cat=t.value; KS.save(); catScreen(scrCat()); return; }
  if(t.dataset&&t.dataset.psconoff){ const c=CS(); if(t.checked) delete c.off[t.dataset.psconoff]; else c.off[t.dataset.psconoff]=true; KS.save(); catRenumber(); return; }
});
document.addEventListener('keydown',ev=>{ if((ev.key==='Enter'||ev.key===' ')&&ev.target&&ev.target.id==='psrDrop'){ ev.preventDefault(); ev.target.click(); } });
['dragover','dragleave','drop'].forEach(n=>document.addEventListener(n,ev=>{ const scr=scrSer(); const d=ev.target.closest&&(ev.target.closest('#psrDrop')||(scr&&!scr.hidden&&ev.target.closest('[data-ksscreen$=":pcser"]'))); if(!d) return;
  ev.preventDefault(); ev.stopPropagation(); const z=$('#psrDrop'); if(z) z.classList.toggle('over',n==='dragover');
  if(n==='drop'){ const f=[...(ev.dataTransfer&&ev.dataTransfer.files||[])].find(f=>/^image\//.test(f.type)); if(f) setPhoto(f); } },true));
KS.pcseries={list:serList,makeVar,envPages,envOpen,catBuild,catItems,sel:SEL,photo:()=>PH};
