/* ---- «Открытки 10×15» section ---- */
const PC_TPL=/*PCTPL*/[];
PC_TPL.forEach(T=>{ if(!DZT.some(x=>x.id===T.id)) DZT.push(T); });
const PC_CATS=['День рождения','Любовь','Свадьба','Благодарность','Детские','Новый год','Праздники','Природа','Город','Акварель','Минимализм','Фото','Винтаж'];
const pcS=()=>KS.store('postcard',{ori:'all',cat:'',q:'',paper:'1015',copies:1,logo:{v:'monoword',sub:'handmade',color:'ink'},wcPreset:'classic'});
const pcList=()=>{ const s=pcS(), q=(s.q||'').toLowerCase().replace(/ё/g,'е'); return (st.myTpl||[]).filter(t=>PC_KINDS.includes(t.kind)).concat(DZT.filter(t=>PC_KINDS.includes(t.kind)))
  .filter(t=>s.ori==='all'||(s.ori==='h'?t.kind==='pcH':t.kind==='pcV')).filter(t=>!s.cat||(t.tags||[]).includes(s.cat))
  .filter(t=>!q||((t.name||'')+' '+(t.tags||[]).join(' ')).toLowerCase().replace(/ё/g,'е').includes(q)); };
function pcApply(T){ const pid=T.kind==='pcV'?'pc15v':'pc15h'; if(st.ui.app!=='print') dzSetMode('print'); applyProduct(pid,true); dzApplyTpl(T); st.dz.sides=2; st.shop.sides=2; st.shop.paper='ph1015'; update(); goTab('dz'); toast(`«${T.name}». Двойной щелчок по тексту — правка прямо на открытке.`); }
let pcWc=null; /* current item {src, out} */
let pcWcs=[]; /* all loaded photos (up to PCWC_MAX) */
const PCWC_MAX=10;
function pcScreen(scr){ const L=pcList(), s=pcS();
  const cnt=n=>n+' '+(n%10===1&&n%100!==11?'шаблон':n%10>=2&&n%10<=4&&(n%100<10||n%100>=20)?'шаблона':'шаблонов');
  scr.innerHTML=`<div class="pc-head"><div><h2>Открытки 10 × 15</h2><p class="hint">${cnt(L.length)} · белые поля под принтер · логотип TH на обороте</p></div>
    <div class="seg pc-ori">${[['all','Все'],['h','Горизонтальные'],['v','Вертикальные']].map(([k,n])=>`<button data-pcori="${k}"${s.ori===k?' class="on"':''}>${n}</button>`).join('')}</div></div>
    <div class="pc-cats"><button class="btn sm${!s.cat?' primary':''}" data-pccat="">Все темы</button>${PC_CATS.map(c=>`<button class="btn sm${s.cat===c?' primary':''}" data-pccat="${c}">${c}</button>`).join('')}</div>
    <div class="pc-grid">${L.length?L.map(T=>`<button class="pc-card ${T.kind}" data-pctpl="${esc(T.id)}" title="${esc(T.name)}"><span class="pc-th" data-pcth="${esc(T.id)}"></span><b>${esc(T.name)}</b><small>${esc((T.tags||[])[0]||'')} · ${T.kind==='pcV'?'10×15':'15×10'}</small></button>`).join(''):'<div class="ks-empty">Ничего не нашлось. Сбросьте тему или поиск.</div>'}</div>`;
  pcThumbs(scr); }
let pcObs=null;
function pcThumbs(scr){ if(pcObs) pcObs.disconnect(); pcObs=new IntersectionObserver(es=>es.forEach(en=>{ if(!en.isIntersecting) return; const el=en.target; pcObs.unobserve(el); const T=DZT.concat(st.myTpl||[]).find(t=>t.id===el.dataset.pcth); if(!T) return;
    try{ el.innerHTML=dzThumb(T,T.kind==='pcV'?150:228,null,st.dz&&st.dz.brand); }catch(e){ el.textContent=''; } }),{root:scr,rootMargin:'300px'});
  scr.querySelectorAll('[data-pcth]').forEach(el=>pcObs.observe(el)); }
function pcPanel(box){ setTimeout(()=>{ const slot=box.querySelector('.pc-nref'); if(slot&&KS.neuro&&KS.neuro.hasKey()) KS.neuro.refRow('pcnref').then(h=>{ slot.innerHTML=h; }); },0); const s=pcS(), lg=s.logo;
  box.innerHTML=`<div class="card"><div class="hd">Поиск</div><input type="search" id="pcQ" placeholder="Роза, Ереван, свадьба…" value="${esc(s.q||'')}"></div>
  <div class="card pc-wc"><div class="hd">Акварель из фото</div><p class="hint">Загрузите фото — получится картина ровно 10 × 15 (по ориентации фото), видна целиком, с белыми краями под принтер.</p>
    <div class="ks-drop" id="pcWcDrop">${pcWc&&(pcWc.out||pcWc.src)?`<img src="${pcWc.out||pcWc.src}" alt="">`:'Перетащите фото сюда или нажмите — можно сразу несколько (до 10)'}</div>
    ${pcWcs.length?`<div class="pc-wcstrip">${pcWcs.map((it,i)=>`<button class="pc-wci${it===pcWc?' on':''}${it.busy?' busy':''}" data-pcwci="${i}" title="Фото ${i+1}"><img src="${it.out||it.src}" alt="">${it.out?'':'<i>фото</i>'}<span data-pcwcdel="${i}" title="Убрать">×</span></button>`).join('')}${pcWcs.length<PCWC_MAX?'<button class="pc-wci add" data-pcwcadd="1" title="Добавить фото">+</button>':''}</div>${pcWcs.length>1?`<p class="hint">Загружено фото: ${pcWcs.length}. Кнопки стилей обработают <b>все сразу</b>, каждое в одном варианте.</p>`:''}`:''}
    <div class="hd2">Быстрая акварель · бесплатно, без ИИ</div><div class="flexw">${Object.entries(WC_PRESETS).map(([k,p])=>`<button class="btn sm${s.wcPreset===k?' primary':''}" data-pcwcp="${k}">${p.n}</button>`).join('')}</div>
    ${KS.neuro?`<div class="hd2">Как на образце · ИИ (точнее всего)</div><div class="pc-nref"></div><div class="hd2">Нейро-стиль · ИИ, как настоящий художник</div>${KS.neuro.hasKey()?KS.neuro.ctl():''}<div class="flexw">${KS.neuro.hasKey()?KS.neuro.styles.map(([k,n])=>`<button class="btn sm${k.startsWith('pp_')?' pc-ppl':''}" data-pcneuro="${k}">${n.replace('Портрет: ','Люди: ')}</button>`).join('')+'<button class="btn sm" data-pcneuro="set" title="Настройки ИИ">⚙︎</button>':'<button class="btn sm" data-pcneuro="set">Подключить ИИ (Gemini или fal.ai)</button>'}</div>`:''}
    <div class="flexw"><button class="btn sm primary" id="pcWcCard"${pcWc&&pcWc.out?'':' disabled'}>Новая открытка</button><button class="btn sm" id="pcWcSlot"${pcWc&&pcWc.out?'':' disabled'}>В рамку макета</button><button class="btn sm" id="pcWcSave"${pcWc&&pcWc.out?'':' disabled'}>Скачать JPG</button>${pcWcs.length>1?`<button class="btn sm" id="pcWcSaveAll"${pcWcs.some(x=>x.out)?'':' disabled'}>Скачать все (${pcWcs.filter(x=>x.out).length})</button><button class="btn sm" id="pcWcClear">Очистить</button>`:''}</div></div>
  <div class="card"><div class="hd">Знак tadhayrapetian</div><div class="pc-logos">${['monoword','mono','sig','word','crest'].map(v=>`<button class="pc-logo${lg.v===v?' on':''}" data-pclogo="${v}">${thSVG({v,sub:lg.sub,color:'ink'},dzPal({ink:'#2b2b2b'}))}</button>`).join('')}</div>
    <label class="f">Подпись под знаком<input type="text" id="pcLogoSub" value="${esc(lg.sub||'')}" maxlength="22" placeholder="handmade"></label>
    <button class="btn sm primary" data-pclogogen="1" style="align-self:flex-start">Генератор логотипов — любая надпись</button>
    <div class="flexw"><button class="btn sm" data-pcaddlogo="front">На лицо</button><button class="btn sm" data-pcaddlogo="back">На оборот</button><button class="btn sm" id="pcLogoAll" title="Заменить стиль знака TH во всей открытке">Применить к макету</button></div></div>
  <div class="card"><div class="hd">Печать на GX4040</div><p class="hint">Принтер не печатает 5 мм по краям. В шаблонах края белые, поэтому поле принтера не видно. Если края цветные, нажмите «Белые поля».</p>
    <div class="flexw"><button class="btn sm" id="pcWhite">Белые поля 6 мм</button></div>
    <label class="f">Бумага<select id="pcPaper"><option value="1015"${s.paper==='1015'?' selected':''}>Фотобумага 10 × 15, по одной</option><option value="a4"${s.paper==='a4'?' selected':''}>A4, две открытки на листе</option></select></label>
    <label class="f">Копий<input type="number" id="pcCopies" min="1" max="200" value="${s.copies||1}"></label>
    <div class="flexw"><button class="btn sm primary" data-pcprint="front">Печать лицевых</button><button class="btn sm" data-pcprint="back">Печать оборотов</button><button class="btn sm" data-pcprint="both">Обе подряд</button></div>
    <p class="hint">Двусторонняя на 10 × 15: напечатайте лицевые, переверните стопку и напечатайте обороты. В окне печати: масштаб 100%, без полей выкл.</p></div>`; }
KS.tab({id:'pc',group:'postcard',title:'Открытки',icon:KS.icon('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M13 9h5M13 12h5M13 15h3M8 9v6"/>'),before:'shop',screen:true,
  render(box,o){ if(o.reason==='show'||!box.firstChild) pcPanel(box); if(o.screen&&(o.reason==='show'||!o.screen.firstChild)) pcScreen(o.screen); }});
const pcScr=()=>KS.screen('pc');
/* ---- page builders for printing ---- */
function pcPages(which){ const d=st.dz, s=pcS(), n=Math.max(1,Math.min(200,+s.copies||1)), W=d.w, H=d.h, sides=which==='both'?['front','back']:[which], P=[];
  const one=sd=>dzHTML(d,sd,{});
  if(s.paper==='a4'){ const per=2; for(let c=0;c<Math.ceil(n/per);c++) sides.forEach(sd=>{ let inner=''; const k=Math.min(per,n-c*per); for(let j=0;j<k;j++){
        const rot=W<H, cw=rot?H:W, ch=rot?W:H, x=(210-cw)/2, y=j===0?(148.5-ch-4):(148.5+4);
        inner+=`<div style="position:absolute;left:${x}mm;top:${y}mm;width:${cw}mm;height:${ch}mm;overflow:hidden">${rot?`<div style="position:absolute;left:0;top:0;width:${W}mm;height:${H}mm;transform-origin:0 0;transform:translateX(${cw}mm) rotate(90deg)">${one(sd)}</div>`:one(sd)}</div>`;
        [[x,y],[x+cw,y],[x,y+ch],[x+cw,y+ch]].forEach(([mx,my])=>{ inner+=`<div style="position:absolute;left:${mx-4}mm;top:${my}mm;width:3mm;border-top:.15mm solid #999"></div><div style="position:absolute;left:${mx+1}mm;top:${my}mm;width:3mm;border-top:.15mm solid #999"></div><div style="position:absolute;left:${mx}mm;top:${my-4}mm;height:3mm;border-left:.15mm solid #999"></div><div style="position:absolute;left:${mx}mm;top:${my+1}mm;height:3mm;border-left:.15mm solid #999"></div>`; }); }
      P.push(KS.page(210,297,inner,'otkrytki-a4')); }); }
  else for(let c=0;c<n;c++) sides.forEach(sd=>P.push(KS.page(W,H,one(sd),'otkrytka-'+(sd==='back'?'oborot':'lico'))));
  return P; }
function pcPrint(which){ if(!isPC()){ toast('Сначала выберите открытку 10 × 15'); return; } if(which!=='front'&&(st.dz.sides||1)<2&&!(st.dz.back||[]).length){ toast('У этой открытки нет оборота'); return; } KS.print(pcPages(which)); }
{ const _pn=printNow; printNow=async function(test){ if(!test&&dzOn()&&isPC()&&['front','back','sheet'].includes(st.view)){ KS.emit('beforePrint',{test:false}); pcPrint((st.dz.sides||1)>1?'both':'front'); KS.emit('print',{test:false}); return; } return _pn.apply(this,arguments); }; }
/* ---- white margins ---- */
function pcWhite(){ if(!isPC()) return; const d=st.dz, W=d.w, H=d.h, m=6, white=v=>!v||v==='white'||(typeof v==='string'&&/^#?f{3,6}$/i.test(v.replace('#','')));
  ['front','back'].forEach(sd=>{ const key=sd==='back'?'bgBack':'bg', bgv=sd==='back'?(d.bgBack||d.bg):d.bg; const els=dzEls(sd);
    if(!white(bgv)&&bgv!=='bg'||(bgv==='bg'&&dzPal(d.pal).bg.toLowerCase()!=='#ffffff')) els.unshift({id:dzId(),t:'rect',x:m,y:m,w:W-2*m,h:H-2*m,fill:bgv==='bg'?'bg':bgv});
    d[key]='white';
    els.forEach(e=>{ if(e.t==='rect'&&e.x===m&&e.y===m) return; const x2=Math.min(W-m,e.x+e.w), y2=Math.min(H-m,e.y+e.h); e.x=Math.max(m,e.x); e.y=Math.max(m,e.y); e.w=Math.max(2,x2-e.x); e.h=Math.max(2,y2-e.y); }); });
  update(); toast('Края открытки белые: 6 мм с каждой стороны'); }
{ const _pc=dzPrinterChecks; dzPrinterChecks=function(add){ const r=_pc.apply(this,arguments); try{ if(dzOn()&&isPC()){ const d=st.dz, W=d.w, H=d.h; let n=0;
    ['front','back'].forEach(sd=>dzEls(sd).forEach(e=>{ if(e.hide||e.pcFull) return; /* full-sheet painting already carries its white paper margin */ if(e.x<5||e.y<5||e.x+e.w>W-5||e.y+e.h>H-5) n++; }));
    const bg=dzPal(d.pal).bg; const colored=d.bg!=='white'&&String(d.bg==='bg'?bg:d.bg).toLowerCase()!=='#ffffff';
    if(n||colored) add('warn',`Открытка заходит в край 5 мм${n?` (элементов: ${n})`:''}${colored?', фон цветной до края':''}. GX4040 эти 5 мм не печатает — край выйдет белым неровно. Откройте «Открытки» → «Белые поля 6 мм».`);
    else add('ok','✓Края открытки белые — поле принтера не будет видно'); } }catch(_){ } return r; }; }
KS.on('neuroRefs',()=>{ const b=$('[data-panel="ks-postcard"] .kssub'); if(b&&b.querySelector('.pc-nref')) pcPanel(b); });
KS.on('neuroKey',()=>{ const b=$('[data-panel="ks-postcard"] .kssub'); if(b) pcPanel(b); });
KS.on('preview',()=>{ if(!dzOn()||!isPC()) return; const root=$('#inner .dz.live .dzc')||$('#inner .dz.live'); if(!root||root.querySelector('.pc-margin')) return; const m=document.createElement('div'); m.className='pc-margin'; m.innerHTML='<span>поле принтера 5 мм</span>'; root.appendChild(m); });
/* ---- watercolor ---- */
const pcWcRedraw=()=>{ const b=$('[data-panel="ks-postcard"] .kssub'); if(b) pcPanel(b); };
async function pcWcLoad(files,add){ files=[].concat(files||[]).filter(f=>f&&/^image\//.test(f.type||'image/')); if(!files.length) return;
  if(!add) pcWcs=[]; const room=PCWC_MAX-pcWcs.length; if(files.length>room) toast(`Можно до ${PCWC_MAX} фото — взял первые ${Math.max(0,room)}`); files=files.slice(0,Math.max(0,room)); if(!files.length) return;
  const fresh=[]; for(const f of files){ try{ { const src=await dzReadImage(f,2400), d=await KS.imgSize(src); fresh.push({src,out:null,v:d.h>d.w}); } }catch(e){ toast('Не удалось открыть одно из фото'); } }
  if(!fresh.length) return; pcWcs=pcWcs.concat(fresh); pcWc=fresh[0]; await pcWcRun(fresh); }
async function pcWcRun(list){ list=list||pcWcs; if(!list.length) return; const s=pcS(); let i=0;
  for(const it of list){ i++; toast(list.length>1?`Рисую акварель ${i} из ${list.length}…`:'Рисую акварель…'); await new Promise(r=>setTimeout(r,30)); try{ it.out=await pcFit(await wcPaint(it.src,s.wcPreset),it.v,true); }catch(_){ } pcWcRedraw(); }
  toast(list.length>1?`Готово: ${list.length} акварелей`:'Акварель готова'); }
/* every result becomes an exact 10×15 sheet (1800×1200 px = 300 dpi), the picture is never cropped:
   it is fitted whole; without painted paper edges it keeps 6 mm white so the GX4040 border cuts nothing */
const pcAsp=it=>({aspect:it&&it.v?'2:3':'3:2'});
async function pcFit(src,v,paper){ const W=v?1200:1800, H=v?1800:1200; const im=await new Promise((r,j)=>{ const i=new Image(); i.onload=()=>r(i); i.onerror=j; i.src=src; });
  const edges=paper||!!(st.ks&&st.ks.neuro&&st.ks.neuro.edges!==false), m=edges?0:Math.round(6*W/(v?102:152));
  const k=Math.min((W-2*m)/im.naturalWidth,(H-2*m)/im.naturalHeight), dw=im.naturalWidth*k, dh=im.naturalHeight*k;
  const c=document.createElement('canvas'); c.width=W; c.height=H; const g=c.getContext('2d'); g.fillStyle='#fff'; g.fillRect(0,0,W,H); g.imageSmoothingQuality='high'; g.drawImage(im,(W-dw)/2,(H-dh)/2,dw,dh); return c.toDataURL('image/jpeg',.93); }
/* AI over every loaded photo: one variant each, two requests at a time */
async function pcWcAI(fn,label){ const list=pcWcs.length?pcWcs:[pcWc]; if(list.length===1){ const it=list[0]; it.busy=1; pcWcRedraw(); try{ const out=await fn(it.src,pcAsp(it)); if(out){ it.out=await pcFit(out,it.v); toast('Готово'); } }catch(err){ toast(err.message||'Не получилось'); } it.busy=0; pcWcRedraw(); return; }
  const price=KS.neuro.price?KS.neuro.price():.04, sum=(price*list.length).toFixed(2).replace('.',',');
  if(!confirm(`${label} для всех ${list.length} фото?\nЭто ${list.length} запросов к ИИ, примерно $${sum}.`)) return;
  let done=0, fail=0, next=0; list.forEach(it=>it.busy=1); pcWcRedraw(); toast(`Рисую ${list.length} картин…`);
  const worker=async()=>{ while(next<list.length){ const it=list[next++]; try{ const out=await fn(it.src,Object.assign(pcAsp(it),{variants:1,noPick:true})); if(out) it.out=await pcFit(out,it.v); done++; }catch(err){ fail++; if(fail===1) toast(err.message||'Одно фото не получилось'); } it.busy=0; pcWcRedraw(); } };
  await Promise.all([worker(),worker()]); toast(fail?`Готово ${done} из ${list.length}, не получилось: ${fail}`:`Готово: все ${done} картин`); }
function pcWcCard(){ if(!pcWc||!pcWc.out) return; const v=!!pcWc.v; const W=v?102:152, H=v?152:102;
  const T={id:'pc-wc-'+Date.now().toString(36),kind:v?'pcV':'pcH',name:'Моя акварель',tags:['Акварель'],w:W,h:H,dark:false,pal:{bg:'#ffffff',ink:'#3b332e',acc:'#9a6b5a',acc2:'#7d9580',soft:'#f4ede6'},fonts:{h:'Cormorant Garamond',b:'Lora'},bg:'white',bgBack:'white',
    front:[{t:'img',x:0,y:0,w:W,h:H,src:pcWc.out,fit:'contain',pcFull:1}],
    back:pcBack(v)};
  pcApply(T); }
function pcBack(v){ const L=pcS().logo; return v?[{t:'text',x:10,y:12,w:82,h:10,text:'Открытка',font:'h',size:16,color:'ink',italic:true},{t:'line',x:10,y:76,w:82,h:1,stroke:'ink/30',sw:.3},{t:'rect',x:72,y:84,w:20,h:24,fill:'none',stroke:'ink/40',sw:.3,dash:true},
      ...[100,110,120,130].map(y=>({t:'line',x:10,y,w:56,h:1,stroke:'ink/35',sw:.25})),{t:'thlogo',x:43,y:134,w:16,h:12,v:L.v,sub:L.sub,color:'acc'}]
    :[{t:'text',x:10,y:12,w:60,h:10,text:'Открытка',font:'h',size:16,color:'ink',italic:true},{t:'line',x:76,y:16,w:1,h:70,stroke:'ink/25',sw:.3,rot:0},{t:'rect',x:120,y:12,w:20,h:24,fill:'none',stroke:'ink/40',sw:.3,dash:true},
      ...[52,62,72,82].map(y=>({t:'line',x:84,y,w:56,h:1,stroke:'ink/35',sw:.25})),{t:'thlogo',x:10,y:76,w:16,h:14,v:L.v,sub:L.sub,color:'acc'}]; }
/* inspector: watercolor for any photo, TH logo settings */
KS.insp({id:'pcwc',title:'Акварель',order:30,when:e=>e.t==='img'&&!!e.src&&e.k!=='logo',html:e=>`<div class="flexw">${Object.entries(WC_PRESETS).map(([k,p])=>`<button class="btn sm" data-pcinswc="${k}">${p.n}</button>`).join('')}</div>${e.wcOrig?'<button class="btn sm" data-pcinswc="undo">Вернуть фото</button>':''}`,
  bind(div,e){ div.addEventListener('click',async ev=>{ const b=ev.target.closest('[data-pcinswc]'); if(!b) return; const k=b.dataset.pcinswc;
    if(k==='undo'){ const o=await KS.idb.get('wc:'+e.wcOrig,'files'); if(o){ e.src=o; delete e.wcOrig; update(); } return; }
    b.disabled=true; b.textContent='Рисую…'; try{ if(!e.wcOrig){ const key=KS.uid('w'); await KS.idb.set('wc:'+key,e.src,'files'); e.wcOrig=key; const orig=e.src; e.src=await wcPaint(orig,k); } else { const o=await KS.idb.get('wc:'+e.wcOrig,'files'); e.src=await wcPaint(o||e.src,k); } update(); toast('Готово: акварель «'+WC_PRESETS[k].n+'»'); }catch(err){ toast('Не получилось обработать фото'); } }); }});
KS.insp({id:'pclogo',title:'Знак TH',order:10,when:e=>e.t==='thlogo',html:e=>`<div class="seg" style="flex-wrap:wrap">${[['monoword','Монограмма и имя'],['mono','Монограмма'],['sig','Подпись'],['word','Надпись'],['crest','Медальон']].map(([v,n])=>`<button data-pcinsv="${v}"${(TH_MAP[e.v]||e.v||'mono')===v?' class="on"':''}>${n}</button>`).join('')}</div><label class="f">Подпись<input type="text" data-pcinssub="1" value="${esc(e.sub||'')}" maxlength="22"></label>${dzColorRow('pcthcol',e.color||'ink')}`,
  bind(div,e){ div.addEventListener('click',ev=>{ const b=ev.target.closest('[data-pcinsv]'); if(b){ e.v=b.dataset.pcinsv; const cx=e.x+e.w/2, cy=e.y+e.h/2, A=e.w*e.h; let r=e.v==='sig'?.6:e.v==='word'?.25:1; let w=Math.sqrt(A/r); if(e.v==='word') w=Math.max(w,e.w); e.w=Math.round(w*10)/10; e.h=Math.round(w*r*10)/10; e.x=Math.round((cx-e.w/2)*10)/10; e.y=Math.round((cy-e.h/2)*10)/10; update(); return; } const c=ev.target.closest('[data-pcthcol]'); if(c){ e.color=c.dataset.pcthcol; KS.changed(true); } });
    div.addEventListener('input',ev=>{ if(ev.target.dataset.pcinssub){ e.sub=ev.target.value; KS.changed(); } }); }});
function pcAddLogo(sd){ if(!dzOn()){ toast('Откройте открытку или другой макет'); return; } const d=st.dz, L=pcS().logo, w=L.v==='word'?40:L.v==='sig'?26:16, h=L.v==='word'?10:L.v==='sig'?15.6:16;
  if(sd!==dzSideOf()){ setView(sd); }
  const e={id:dzId(),t:'thlogo',x:d.w-w-9,y:d.h-h-9,w,h,v:L.v,sub:L.sub,color:L.color||'acc'}; dzEls(sd).push(e); dzSelect(e.id); update(); toast('Знак tadhayrapetian добавлен'); }
KS.tool({id:'th',label:'TH',title:'Поставить знак tadhayrapetian на макет',app:'print',run(){ pcAddLogo(dzSideOf()); }});
KS.cmd('Открытки 10 × 15','раздел',()=>KS.show('postcard'));
KS.cmd('Акварель из фото','открытки',()=>{ KS.show('postcard'); setTimeout(()=>{ const d=$('#pcWcDrop'); if(d) d.click(); },100); });
/* ---- events ---- */
document.addEventListener('click',e=>{ let b;
  if((b=e.target.closest('[data-pctpl]'))){ const T=DZT.concat(st.myTpl||[]).find(t=>t.id===b.dataset.pctpl); if(T) pcApply(T); return; }
  if((b=e.target.closest('[data-pcori]'))){ pcS().ori=b.dataset.pcori; save(); pcScreen(pcScr()); return; }
  if((b=e.target.closest('[data-pccat]'))){ pcS().cat=b.dataset.pccat; save(); pcScreen(pcScr()); return; }
  if((b=e.target.closest('[data-pcwcp]'))){ pcS().wcPreset=b.dataset.pcwcp; save(); if(pcWcs.length) pcWcRun(); else pcPanel(b.closest('.kssub')); return; }
  if((b=e.target.closest('[data-pcwcdel]'))){ const i=+b.dataset.pcwcdel, it=pcWcs[i]; pcWcs.splice(i,1); if(pcWc===it) pcWc=pcWcs[Math.min(i,pcWcs.length-1)]||null; pcWcRedraw(); return; }
  if((b=e.target.closest('[data-pcwci]'))){ pcWc=pcWcs[+b.dataset.pcwci]||pcWc; pcWcRedraw(); return; }
  if(e.target.closest('[data-pcwcadd]')){ KS.pick('image/*',true).then(f=>pcWcLoad(f,true)); return; }
  if(e.target.closest('#pcWcClear')){ pcWcs=[]; pcWc=null; pcWcRedraw(); return; }
  if(e.target.closest('#pcWcSaveAll')){ (async()=>{ let n=0; for(const it of pcWcs){ if(!it.out) continue; n++; const bl=await (await fetch(it.out)).blob(); KS.download(`akvarel-${n}.jpg`,bl); await new Promise(r=>setTimeout(r,400)); } })(); return; }
  if((b=e.target.closest('#pcWcDrop'))){ KS.pick('image/*',true).then(f=>pcWcLoad(f)); return; }
  if((b=e.target.closest('[data-pcnref]'))&&!e.target.closest('[data-nrefdel]')){ if(!pcWc||!pcWc.src){ toast('Сначала загрузите фото'); return; } const ref=b.dataset.pcnref; b.classList.add('busy'); toast('Рисую в стиле образца…');
    pcWcAI((src,o)=>KS.neuro.stylizeRef(src,ref,o),'Нарисовать как на образце'); return; }
  if((b=e.target.closest('[data-pcneuro]'))){ const k=b.dataset.pcneuro; if(k==='set'){ KS.neuro.settings(); return; } if(!pcWc||!pcWc.src){ toast('Сначала загрузите фото'); return; } const nm=b.textContent; b.disabled=true; b.textContent='Рисую…';
    pcWcAI((src,o)=>KS.neuro.stylize(src,k,'',o),'Нейро-стиль «'+nm+'»').finally(()=>pcWcRedraw()); return; }
  if(e.target.closest('#pcWcCard')){ pcWcCard(); return; }
  if(e.target.closest('#pcWcSlot')){ if(pcWc&&pcWc.out) KS.addImage(pcWc.out,{mode:'auto'}); return; }
  if(e.target.closest('#pcWcSave')){ if(pcWc&&pcWc.out) fetch(pcWc.out).then(r=>r.blob()).then(bl=>KS.download('akvarel.jpg',bl)); return; }
  if((b=e.target.closest('[data-pclogo]'))){ pcS().logo.v=b.dataset.pclogo; save(); pcPanel(b.closest('.kssub')); return; }
  if((b=e.target.closest('[data-pcaddlogo]'))){ pcAddLogo(b.dataset.pcaddlogo); return; }
  if(e.target.closest('#pcLogoAll')){ if(!dzOn()) return; const L=pcS().logo; let n=0; ['front','back'].forEach(sd=>dzEls(sd).forEach(x=>{ if(x.t==='thlogo'){ x.v=L.v; x.sub=L.sub; n++; } })); update(); toast(n?'Знак TH обновлён: '+n:'В макете нет знака TH — добавьте его кнопкой'); return; }
  if(e.target.closest('[data-pclogogen]')){ if(KS.logo) KS.logo.open(); return; }
  if(e.target.closest('#pcWhite')){ pcWhite(); return; }
  if((b=e.target.closest('[data-pcprint]'))){ pcPrint(b.dataset.pcprint); return; }
});
document.addEventListener('input',e=>{ const t=e.target;
  if(t.id==='pcQ'){ pcS().q=t.value; clearTimeout(pcQ.t); pcQ.t=setTimeout(()=>{ save(); pcScreen(pcScr()); },200); }
  if(t.id==='pcLogoSub'){ pcS().logo.sub=t.value; save(); }
  if(t.id==='pcCopies'){ pcS().copies=Math.max(1,+t.value||1); save(); } });
function pcQ(){}
document.addEventListener('change',e=>{ if(e.target.id==='pcPaper'){ pcS().paper=e.target.value; save(); } });
['dragover','drop'].forEach(t=>document.addEventListener(t,e=>{ const d=e.target.closest&&e.target.closest('#pcWcDrop'); if(!d) return; e.preventDefault(); e.stopPropagation(); if(t==='drop'){ pcWcLoad([...(e.dataTransfer.files||[])]); } },true));
KS.postcard={print:pcPrint,white:pcWhite,paint:wcPaint,pages:pcPages,apply:pcApply};
