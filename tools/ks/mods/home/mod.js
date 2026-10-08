/* «Главная» — стартовый экран типографии: приветствие, показатели дня, быстрые действия,
   ближайшие сроки, последние проекты и шаблоны, поиск по всему, подсказки. */
KS.mod('home',{title:'Главная'});

const I=p=>KS.icon(p);
const IC={
  house:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9v11h14V9"/><path d="M10 20v-6h4v6"/>',
  order:'<rect x="5" y="4" width="14" height="17" rx="2.5"/><path d="M9 4V2.8h6V4"/><path d="M12 9.5v6M9 12.5h6"/>',
  card:'<rect x="2.5" y="5.5" width="19" height="13" rx="2.5"/><circle cx="8" cy="10.5" r="1.9"/><path d="M5.3 15.2c.6-1.3 1.6-1.9 2.7-1.9s2.1.6 2.7 1.9"/><path d="M14 10h4.5M14 13.5h3"/>',
  flyer:'<path d="M6.5 2.8h7.5l4.5 4.5v13.9h-12z"/><path d="M14 2.8v4.5h4.5"/><path d="M9.5 12.5h6M9.5 16h4"/>',
  sticker:'<path d="M12 3a9 9 0 1 0 9 9"/><path d="M12 3c0 5 4 9 9 9"/><path d="M12 3v3.5a5.5 5.5 0 0 0 5.5 5.5H21"/>',
  invite:'<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m3.5 7 8.5 6 8.5-6"/>',
  idph:'<rect x="4.5" y="2.8" width="15" height="18.4" rx="2.5"/><circle cx="12" cy="10" r="3"/><path d="M7.6 18c.8-2.1 2.4-3.2 4.4-3.2s3.6 1.1 4.4 3.2"/>',
  photo:'<rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="9" cy="9.5" r="1.8"/><path d="m21 15.5-4.8-4.8L6.5 20"/>',
  cash:'<rect x="2.5" y="6" width="19" height="12" rx="2.5"/><circle cx="12" cy="12" r="2.6"/><path d="M6.2 9.5v5M17.8 9.5v5"/>',
  findph:'<path d="M11 4H5.5A2.5 2.5 0 0 0 3 6.5v11A2.5 2.5 0 0 0 5.5 20h11a2.5 2.5 0 0 0 2.5-2.5V13"/><path d="m3.5 17 4.5-4.5 4 4"/><circle cx="17" cy="7" r="3"/><path d="m21.3 11.3-2.2-2.2"/>',
  tpl:'<rect x="3" y="3" width="7.5" height="9" rx="1.6"/><rect x="13.5" y="3" width="7.5" height="5.5" rx="1.6"/><rect x="13.5" y="11.5" width="7.5" height="9.5" rx="1.6"/><rect x="3" y="15" width="7.5" height="6" rx="1.6"/>',
  pen:'<path d="M4 20h4L19.2 8.8a2.8 2.8 0 0 0-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
  check:'<path d="M7 8.5V3h10v5.5"/><path d="M7 17H5a2 2 0 0 1-2-2v-4.5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2V15a2 2 0 0 1-2 2h-2"/><path d="m9 17.2 2.2 2.2L15.5 15"/>',
  search:'<circle cx="11" cy="11" r="6.8"/><path d="m20 20-4-4"/>',
  bulb:'<path d="M9.5 18h5M10.5 21h3"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.3 1.1 2.2h5c0-.9.4-1.6 1.1-2.2A6 6 0 0 0 12 3z"/>',
  clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  alert:'<path d="M12 3.5 2.8 19.5h18.4z"/><path d="M12 10v4M12 17h.01"/>',
  wallet:'<path d="M4 7.5h14.5A2.5 2.5 0 0 1 21 10v8a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 18V6a2.5 2.5 0 0 1 2.5-2.5H17v4"/><circle cx="16.5" cy="14" r="1.2"/>',
  box:'<path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
  cmd:'<path d="M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3z"/>',
  folder:'<path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2.5h6.5A2.5 2.5 0 0 1 21 10v7.5a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5z"/>',
  tag:'<path d="M3 12V4.5A1.5 1.5 0 0 1 4.5 3H12l9 9-9 9z"/><circle cx="8" cy="8" r="1.4"/>',
  left:'<path d="m15 18-6-6 6-6"/>', right:'<path d="m9 18 6-6-6-6"/>', arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  spark:'<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
  done:'<circle cx="12" cy="12" r="8.5"/><path d="m8.5 12 2.5 2.5 4.5-5"/>'
};
const DEF={boot:true,recent:[]};
const S=()=>KS.store('home',DEF);
const esc_=s=>KS.esc(s==null?'':String(s));
const nk=s=>String(s==null?'':s).toLowerCase().replace(/ё/g,'е').replace(/\s+/g,' ').trim();
const today=()=>KS.today();
const addDays=(iso,n)=>{ const [y,m,d]=iso.split('-').map(Number); const t=new Date(y,m-1,d+n); return t.getFullYear()+'-'+String(t.getMonth()+1).padStart(2,'0')+'-'+String(t.getDate()).padStart(2,'0'); };
const isoOf=ms=>{ const t=new Date(ms); return t.getFullYear()+'-'+String(t.getMonth()+1).padStart(2,'0')+'-'+String(t.getDate()).padStart(2,'0'); };
const dayDiff=(a,b)=>Math.round((new Date(a+'T12:00:00')-new Date(b+'T12:00:00'))/864e5);
const has=m=>!!(KS.mods&&KS.mods[m]);
const plural=(n,a,b,c)=>{ const m=Math.abs(n)%100, k=m%10; return m>10&&m<20?c:k===1?a:k>=2&&k<=4?b:c; };
const ST=(()=>{ const m={}; try{ ORD_ST.forEach(([k,n])=>m[k]=n); }catch(_){ } return m; })();
const STC={new:'new',work:'warn',ready:'ok',done:'',cancel:'bad'};

/* ---------------- data ---------------- */
function kpis(){ const t=today(), tm=addDays(t,1), O=Array.isArray(st.orders)?st.orders:[], act=o=>o.status!=='done'&&o.status!=='cancel';
  const r={dueToday:0,readyToday:0,over:0,paidToday:0,paidOrders:0,paidPos:0,work:0,ready:0,tomorrow:0,debt:0,stockLow:null};
  O.forEach(o=>{ if(!o) return; if(act(o)){ if(o.due===t){ r.dueToday++; if(o.status==='ready') r.readyToday++; } if(o.due===tm) r.tomorrow++; if(o.due&&o.due<t) r.over++;
      if(o.status==='new'||o.status==='work') r.work++; if(o.status==='ready') r.ready++; }
    if(o.status!=='cancel') r.debt+=Math.max(0,(+o.price||0)-(+o.paid||0));
    if(o.date===t) r.paidOrders+=+o.paid||0; });
  const pos=(st.ks&&st.ks.pos)||null; if(pos&&Array.isArray(pos.sales)) pos.sales.forEach(s=>{ if(!s||s.ts==null) return; const v=typeof s.ts==='string'&&/^\d+$/.test(s.ts)?+s.ts:s.ts; const d=new Date(v); if(isNaN(d)||isoOf(d.getTime())!==t) return;
    const ty=s.type||'sale'; if(ty==='sale') r.paidPos+=(+s.total||0)-debtPart(s); else if(ty==='refund') r.paidPos-=Math.abs(+s.total||0); });
  r.paidToday=Math.round((r.paidOrders+r.paidPos)*100)/100; r.stockLow=stockLow(); return r; }
/* part of a POS sale taken «в долг» (not money received): pay may be 'debt' or a split object {cash:…, debt:…} */
function debtPart(s){ const p=s.pay, tot=+s.total||0; if(typeof p==='string') return /debt|долг|credit/i.test(p)?tot:0;
  if(p&&typeof p==='object'){ const m=p.method||p.type||p.m; if(m) return /debt|долг|credit/i.test(m)?tot:0; let d=0; for(const k in p) if(/debt|долг|credit/i.test(k)) d+=+p[k]||0; return d; } return 0; }
/* low-stock count from the `stock` module store, read defensively (structure may vary) */
function stockLow(){ const sk=st.ks&&st.ks.stock; if(!sk||typeof sk!=='object') return null;
  if(typeof sk.lowCount==='number') return sk.lowCount;
  const lists=[sk.items,sk.mats,sk.materials,sk.list,sk.inks].filter(Array.isArray); if(!lists.length) return 0; let n=0;
  lists.forEach(L=>L.forEach(it=>{ if(!it||it.off||it.hidden) return; const q=+(it.qty!=null?it.qty:it.q!=null?it.q:it.left!=null?it.left:it.level); const mn=+(it.min!=null?it.min:it.low!=null?it.low:it.minQty!=null?it.minQty:it.warn);
    if(isFinite(q)&&isFinite(mn)&&mn>0&&q<=mn) n++; })); return n; }
function dueList(){ const t=today(), tm=addDays(t,1); return (st.orders||[]).filter(o=>o&&o.due&&o.due<=tm&&o.status!=='done'&&o.status!=='cancel').sort((a,b)=>a.due<b.due?-1:a.due>b.due?1:(a.no||0)-(b.no||0)); }
function dueLabel(o){ const t=today(), d=dayDiff(o.due,t); if(d<0) return {c:'bad',t:'просрочен на '+(-d)+' '+plural(-d,'день','дня','дней')}; if(d===0) return {c:'warn',t:'сегодня'}; if(d===1) return {c:'',t:'завтра'}; return {c:'',t:fmtDue(o.due)}; }
function fmtDue(iso){ try{ const t=today(), d=dayDiff(iso,t); if(d===0) return 'сегодня'; if(d===1) return 'завтра'; if(d===-1) return 'вчера'; const [y,m,dd]=iso.split('-').map(Number); const x=new Date(y,m-1,dd); if(isNaN(x)) return iso; return x.toLocaleDateString('ru-RU',Object.assign({day:'numeric',month:'short'},y!==new Date().getFullYear()?{year:'numeric'}:{})); }catch(_){ return String(iso); } }
const findT=id=>(st.myTpl||[]).find(t=>t&&t.id===id)||(typeof DZT!=='undefined'?DZT.find(t=>t.id===id):null);
const kindName=k=>{ try{ return (DZ_KINDS[k]||{}).n||''; }catch(_){ return ''; } };

/* ---------------- thumbnails ---------------- */
function thumb(doc,bw,bh,brand){ try{ if(!doc||!doc.w||!doc.h) return ''; const k=Math.min(bw/(doc.w*PX),bh/(doc.h*PX)), w=Math.max(1,Math.round(doc.w*PX*k)), h=Math.max(1,Math.round(doc.h*PX*k));
    return `<div class="hm-th" style="width:${w}px;height:${h}px"><div class="hm-tin" style="transform:scale(${k})">${dzHTML(doc,'front',{brand:brand||doc.brand||{}})}</div></div>`; }catch(e){ return ''; } }
function tplThumb(T,bw,bh){ try{ return thumb(dzFromTpl(T,T.w,T.h,null),bw,bh,{}); }catch(e){ return ''; } }
const projThumbs={};
async function loadProjThumb(p){ const key=p.id+':'+p.updated; if(projThumbs[key]!==undefined) return projThumbs[key]; let h='';
  try{ let d=p.id===proj.cur?st:null; if(!d){ const raw=await idb.get('projects',p.id); d=raw?(typeof raw==='string'?JSON.parse(raw):raw):null; }
    const z=d&&d.dz; if(z&&z.on&&(z.front||[]).length) h=thumb(z,150,96,z.brand); }catch(e){ h=''; }
  projThumbs[key]=h; return h; }

/* ---------------- actions ---------------- */
function toPrint(){ if(st.ui.app!=='print'&&typeof dzSetMode==='function') dzSetMode('print'); }
function product(id){ toPrint(); applyProduct(id); goTab('shop'); }
function newOrderFlow(){ toPrint(); goTab('orders'); const b=$('#ordNew'); if(b) b.click(); }
function openOrder(id){ const o=(st.orders||[]).find(x=>x.id===id); if(!o) return; const sh=st.shop||{}; const f=sh.filter||'active';
  const vis=f==='all'||(f==='active'?(o.status!=='done'&&o.status!=='cancel'):o.status===f); if(!vis) sh.filter='all';
  if(sh.q){ sh.q=''; const q=$('#ordQ'); if(q) q.value=''; }
  ordOpen=id; toPrint(); goTab('orders'); if(activeTab!=='orders') return; try{ renderOrders(); }catch(_){}
  setTimeout(()=>{ const el=$(`#ordList [data-oid="${CSS.escape(id)}"]`); if(el){ el.scrollIntoView({block:'center'}); flash(el); } },60); }
function openClient(i){ toPrint(); goTab('orders'); cliOpen=String(i); try{ renderOrders(); }catch(_){}
  setTimeout(()=>{ const el=$('#cliList')&&$('#cliList').children[i]; if(el){ el.scrollIntoView({block:'center'}); flash(el); } },60); }
function flash(el){ el.classList.remove('hm-flash'); void el.offsetWidth; el.classList.add('hm-flash'); setTimeout(()=>el.classList.remove('hm-flash'),1700); }
function useTpl(T){ if(!T) return; toPrint(); const cur=prodById(st.prod);
  if(!(cur&&cur.kind===T.kind&&dzOn())){ const P=PRODUCTS.find(p=>p.kind===T.kind&&!p.doc); if(P) applyProduct(P.id,true); else KS.ensureDesign(); }
  dzApplyTpl(T); goTab('dz'); toast('«'+T.name+'» — макет готов, правьте текст двойным щелчком'); }
function continueDesign(){ KS.ensureDesign(); goTab('dz'); }
function checkPrint(){ KS.ensureDesign(); goTab('prep'); try{ runPreflight(true); }catch(_){} setTimeout(()=>{ const el=$('#shPre'); if(el){ el.scrollIntoView({block:'center',behavior:'smooth'}); flash(el); } },80); }
function showSeg(group,label,fallback){ KS.show(group); const b=[...document.querySelectorAll(`[data-kssub^="${group}:"]`)].find(x=>nk(x.textContent).includes(nk(label))); if(b) b.click(); else if(fallback) fallback(); }
function reveal(sel,panel){ const el=$(sel); const p=panel||(el&&el.closest('[data-panel]')&&el.closest('[data-panel]').dataset.panel); if(p) goTab(p);
  setTimeout(()=>{ const e2=$(sel); if(e2){ e2.scrollIntoView({block:'center',behavior:'smooth'}); flash(e2); } },90); }
function clickTool(label){ const b=[...document.querySelectorAll('.kstool')].find(x=>nk(x.textContent).includes(nk(label))); if(b){ b.click(); return true; } return false; }
async function openProj(id){ try{ if(id!==proj.cur) await switchProj(id); }catch(e){ console.error(e); } if(st.ui.app==='print'&&dzOn()) goTab('dz'); else KS.show('home'); }
function focusSearch(){ const i=$('#hm-q'); if(i){ i.focus(); i.select(); } }

/* quick action tiles: hue → gradient of the icon chip */
function tiles(){ const L=[
  {id:'order',t:'Новый заказ',d:'Клиент, тираж, срок',ic:'order',h:212,run:newOrderFlow},
  {id:'bc',t:'Визитки',d:'90 × 50, двусторонние',ic:'card',h:258,run:()=>product('bc90')},
  {id:'flyer',t:'Листовка',d:'A6 · A5 · A4',ic:'flyer',h:28,run:()=>product('fA5')},
  {id:'sticker',t:'Наклейки',d:'Круглые и этикетки',ic:'sticker',h:328,run:()=>product('stR40')},
  {id:'invite',t:'Приглашение',d:'Свадьба, праздник',ic:'invite',h:300,run:()=>product('inv210')},
  {id:'passport',t:'Фото на документы',d:has('passport')?'Обрезка по стандарту, лист 10 × 15':'3,5 × 4,5 и 3 × 4',ic:'idph',h:190,run:()=>has('passport')?KS.show('salon','passport'):product('phD35')},
  {id:'photo',t:'Печать фото',d:'10 × 15, 13 × 18, A4',ic:'photo',h:160,run:()=>has('photoprint')?showSeg('salon','Печать фото',()=>product('ph10')):product('ph10')},
  {id:'kassa',t:'Касса',d:'Продажа и смена',ic:'cash',h:142,when:()=>has('pos'),run:()=>KS.show('kassa','sale')},
  {id:'find',t:'Найти фото',d:'Бесплатные фото в макет',ic:'findph',h:44,when:()=>has('photos'),run:()=>KS.show('photo','phsearch')},
  {id:'all',t:'Все шаблоны',d:(typeof DZT!=='undefined'?DZT.length:150)+' готовых дизайнов',ic:'tpl',h:228,run:()=>{ toPrint(); KS.ensureDesign(); goTab('shop'); }},
  {id:'check',t:'Проверить и напечатать',d:'Вылеты, текст, лист A4',ic:'check',h:0,run:checkPrint}
]; return L.filter(x=>!x.when||x.when()); }
function runTile(id){ if(id==='cont'){ continueDesign(); return; } const t=tiles().find(x=>x.id===id); if(t) try{ t.run(); }catch(e){ console.error('[home] tile',e); toast('Не получилось открыть'); } }

/* tips («Знаете ли вы?») */
function tips(){ return [
  {ic:'cmd',t:'Любое действие по названию',d:'Нажмите ⌘K (Ctrl+K) и начните печатать: «печать», «визитка», «тёмная тема» — команда выполнится сразу.',go:()=>{ try{ openCmd(); }catch(_){ } }},
  {ic:'search',t:'Поиск по всему — клавиша «/»',d:'На Главной нажмите «/»: шаблоны, изделия, заказы, клиенты и команды в одном списке. Стрелки и Enter — без мыши.',go:focusSearch},
  {ic:'spark',t:'Магия: макет под любой размер',d:'Сделали визитку — получите листовку и наклейку в том же стиле за пару секунд.',when:()=>has('magic'),go:()=>{ KS.ensureDesign(); if(!clickTool('Магия')) goTab('dz'); }},
  {ic:'findph',t:'Фото для макета без поиска в интернете',d:'Вкладка «Фото»: бесплатные снимки по запросу и своя библиотека — одним нажатием прямо в рамку макета.',when:()=>has('photos'),go:()=>KS.show('photo','phsearch')},
  {ic:'idph',t:'Фото на документы за минуту',d:'Загрузите снимок — программа обрежет по стандарту и разложит на лист 10 × 15.',when:()=>has('passport'),go:()=>KS.show('salon','passport')},
  {ic:'cash',t:'Касса с чеками и сменой',d:'Продавайте услуги и принимайте оплату заказов — выручка дня считается сама.',when:()=>has('pos'),go:()=>KS.show('kassa','sale')},
  {ic:'box',t:'Склад следит за бумагой и краской',d:'После печати бумага списывается сама, а при нехватке появится предупреждение.',when:()=>has('stock'),go:()=>KS.show('sklad')},
  {ic:'clock',t:'Сводка: доска заказов и сроки',d:'Перетаскивайте заказы между статусами и смотрите выручку за любой период.',when:()=>has('stats'),go:()=>KS.show('svodka')},
  {ic:'check',t:'Проверка перед печатью',d:'Программа подскажет про вылеты, мелкий текст и фото низкого качества — до того как испорчена бумага.',go:checkPrint},
  {ic:'tpl',t:'Раскладка на лист автоматически',d:'Во вкладке «Печать» изделия сами раскладываются на A4 с метками реза и подсчётом листов.',go:()=>{ KS.ensureDesign(); goTab('prep'); }},
  {ic:'wallet',t:'Цена за пару секунд',d:'Вкладка «Цена» считает бумагу, печать и обработку и оформляет заказ одной кнопкой.',go:()=>{ toPrint(); goTab('calc'); }},
  {ic:'photo',t:'Мокап для клиента',d:'Покажите, как визитка или листовка будет выглядеть в руках — до печати.',go:()=>{ KS.ensureDesign(); goTab('dz'); const b=$('#tMock'); if(b) b.click(); }},
  {ic:'flyer',t:'Файл для клиента: PDF, PNG, JPG',d:'Кнопка «Экспорт» сохранит макет в нужном формате — удобно отправить на согласование в мессенджер.',go:()=>{ KS.ensureDesign(); try{ openExport(); }catch(_){ const b=$('#hExport'); if(b) b.click(); } }},
  {ic:'order',t:'Прайс-лист одной кнопкой',d:'Во вкладке «Заказы» соберите прайс-лист из ваших цен и распечатайте его для витрины.',go:()=>reveal('#ordPriceList')},
  {ic:'folder',t:'Проекты для разных клиентов',d:'Держите несколько макетов параллельно и переключайтесь между ними без потерь.',go:()=>{ const b=$('#hProj'); if(b) b.click(); }},
  {ic:'done',t:'Резервная копия всего',d:'Один файл со всеми проектами, заказами и настройками. Сделайте копию перед обновлением iPad.',go:()=>reveal('#backupBtn')},
  {ic:'house',t:'Программа как приложение',d:'Установите на Mac и iPad — откроется с экрана «Домой» и работает без интернета.',go:()=>reveal('#installCard','ui')}
].filter(x=>!x.when||x.when()).slice(0,15); }
let tipI=null;

/* ---------------- big screen ---------------- */
function greet(){ const h=new Date().getHours(); return h>=5&&h<12?'Доброе утро':h>=12&&h<18?'Добрый день':h>=18&&h<23?'Добрый вечер':'Доброй ночи'; }
function dateStr(){ const s=new Date().toLocaleDateString('ru-RU',{weekday:'long',day:'numeric',month:'long'}); return s.charAt(0).toUpperCase()+s.slice(1); }
function kpiHTML(k){ const it=(id,ic,label,val,sub,cls,num)=>`<button class="hm-kpi ${cls||''}" data-hmkpi="${id}" data-v="${num}"><span class="hm-kic">${I(IC[ic])}</span><span class="hm-kt"><small>${label}</small><b>${val}</b>${sub?`<i>${sub}</i>`:''}</span></button>`;
  let h=it('due','clock','К выдаче сегодня',k.dueToday,k.dueToday?('готово '+k.readyToday+' из '+k.dueToday):(k.tomorrow?'завтра '+k.tomorrow:'сроков нет'),k.dueToday?'acc':'',k.dueToday)
   +it('over','alert','Просрочено',k.over,k.over?'нужно связаться':'всё в срок',k.over?'bad':'ok',k.over)
   +it('paid','wallet','Оплачено сегодня',esc_(KS.money(k.paidToday)),k.paidPos?('касса '+esc_(KS.money(k.paidPos))):'по заказам дня','',k.paidToday);
  if(k.stockLow!=null) h+=it('stock','box','Мало на складе',k.stockLow,k.stockLow?'пора докупить':'всего хватает',k.stockLow?'warn':'ok',k.stockLow);
  return h; }
function contTile(){ const d=st.dz, P=prodById(st.prod); const ok=!!(d&&d.on&&(d.front||[]).length);
  const th=ok?thumb(d,144,80,d.brand):''; const T=ok&&d.tid?findT(d.tid):null;
  return `<button class="hm-tile hm-cont" data-hmtile="cont" style="--h:205"><span class="hm-cth">${th||`<span class="hm-tic">${I(IC.pen)}</span>`}</span><span class="hm-tt"><b>Продолжить макет</b><small>${esc_(ok?((P&&P.n)||'Текущий макет')+(T?' · '+T.name:''):'Начните с шаблона')}</small></span><span class="hm-go">${I(IC.arrow)}</span></button>`; }
function tilesHTML(){ return contTile()+tiles().map(t=>`<button class="hm-tile" data-hmtile="${t.id}" style="--h:${t.h}"><span class="hm-tic">${I(IC[t.ic])}</span><span class="hm-tt"><b>${esc_(t.t)}</b><small>${esc_(t.d)}</small></span></button>`).join(''); }
function dueHTML(){ const L=dueList(); if(!L.length) return `<div class="hm-empty">${I(IC.done)}<b>На сегодня и завтра сроков нет</b><span>Заказы со сроком появятся здесь. Срок ставится в карточке заказа.</span><button class="btn sm" data-hmtile="order">+ Новый заказ</button></div>`;
  return '<div class="hm-due">'+L.slice(0,8).map(o=>{ const dl=dueLabel(o), debt=Math.max(0,(+o.price||0)-(+o.paid||0));
    return `<button class="hm-ord${dl.c==='bad'?' over':''}" data-hmord="${esc_(o.id)}"><span class="hm-no">№ ${esc_(o.no)}</span><span class="hm-ot"><b>${esc_(o.client||'Без клиента')}</b><small>${esc_([o.product,o.qty>1?o.qty+' шт.':''].filter(Boolean).join(' · ')||'Изделие не указано')}</small></span><span class="hm-om"><span class="ks-badge hm-st ${STC[o.status]||''}">${esc_(ST[o.status]||o.status||'')}</span><span class="hm-dl ${dl.c}">${esc_(dl.t)}</span>${debt>0?`<span class="hm-debt">долг ${esc_(KS.money(debt))}</span>`:''}</span></button>`; }).join('')+'</div>'+(L.length>8?`<button class="btn sm hm-more" data-hmkpi="due">Ещё ${L.length-8} — все сроки</button>`:''); }
function projHTML(){ const L=(proj&&proj.list||[]).slice().sort((a,b)=>(b.updated||0)-(a.updated||0)).slice(0,6);
  return '<div class="hm-projs">'+L.map(p=>{ const key=p.id+':'+p.updated, th=projThumbs[key];
    return `<button class="hm-proj${p.id===proj.cur?' cur':''}" data-hmproj="${esc_(p.id)}"><span class="hm-pth" data-pth="${esc_(key)}">${th||`<span class="hm-ph0">${I(IC.folder)}</span>`}</span><b>${esc_(p.name||'Проект')}</b><small>${p.id===proj.cur?'открыт сейчас':esc_(new Date(p.updated||Date.now()).toLocaleString('ru-RU',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}))}</small></button>`; }).join('')+'</div>'; }
function recentHTML(){ const R=(S().recent||[]).map(r=>({r,T:findT(r.id)})).filter(x=>x.T).slice(0,8);
  if(!R.length) return `<div class="hm-empty sm">${I(IC.tpl)}<span>Здесь появятся шаблоны, которые вы применяли. Выберите любой во вкладке «Шаблоны».</span><button class="btn sm" data-hmtile="all">Открыть шаблоны</button></div>`;
  return '<div class="hm-tpls">'+R.map(({T})=>`<button class="hm-tpl" data-hmtpl="${esc_(T.id)}" title="${esc_(T.name)}"><span class="hm-tpth">${tplThumb(T,132,84)}</span><b>${esc_(T.name)}</b><small>${esc_(kindName(T.kind))}</small></button>`).join('')+'</div>'; }
function tipHTML(){ const L=tips(); if(!L.length) return ''; if(tipI==null) tipI=Math.floor(Date.now()/864e5)%L.length; tipI=((tipI%L.length)+L.length)%L.length; const t=L[tipI];
  return `<div class="hm-tip" data-tipi="${tipI}"><span class="hm-tipic">${I(IC[t.ic]||IC.bulb)}</span><div class="hm-tipb"><small>${I(IC.bulb)} Знаете ли вы?</small><b>${esc_(t.t)}</b><p>${esc_(t.d)}</p></div>
    <div class="hm-tipc"><button class="btn sm primary" data-hmtipgo="${tipI}">Показать</button><div class="hm-tipnav"><button class="btn sm icon" data-hmtip="-1" aria-label="Предыдущая">${I(IC.left)}</button><span class="hm-dots">${L.map((_,i)=>`<i class="${i===tipI?'on':''}" data-hmtipdot="${i}"></i>`).join('')}</span><button class="btn sm icon" data-hmtip="1" aria-label="Следующая">${I(IC.right)}</button></div></div></div>`; }
function screenHTML(){ const k=kpis(), name=(st.shop&&st.shop.name)||'Типография';
  return `<div class="hm-wrap">
  <section class="hm-hero"><div class="hm-hl"><div class="hm-date">${esc_(dateStr())}</div><h1>${esc_(greet())}<span>, ${esc_(name)}</span></h1>
    <button class="hm-sbtn" data-hmsearch="1">${I(IC.search)}<span>Найти шаблон, заказ, клиента или команду</span><kbd>/</kbd></button></div>
    <div class="hm-kpis">${kpiHTML(k)}</div></section>
  <section class="hm-sec"><div class="hm-sh"><h2>Быстрые действия</h2></div><div class="hm-tiles">${tilesHTML()}</div></section>
  <div class="hm-cols">
    <section class="hm-sec hm-card"><div class="hm-sh"><h2>Сегодня и ближайшие сроки</h2><button class="btn sm" data-hmkpi="due">Все заказы</button></div>${dueHTML()}</section>
    <section class="hm-sec hm-card"><div class="hm-sh"><h2>Последние проекты</h2><button class="btn sm" data-hmprojs="1">Все проекты</button></div>${projHTML()}
      <div class="hm-sh hm-sh2"><h2>Последние шаблоны</h2></div>${recentHTML()}</section>
  </div>
  <section class="hm-sec">${tipHTML()}</section>
</div>`; }
const did=new WeakMap(); let didN=0; const objId=o=>{ if(!o||typeof o!=='object') return 0; if(!did.has(o)) did.set(o,++didN); return did.get(o); };
function sig(){ const O=st.orders||[]; let h=O.length+'|'; for(let i=0;i<O.length;i++){ const o=O[i]; if(o) h+=o.id+o.status+o.due+o.paid+o.price+o.client+o.product+o.qty+o.date+';'; }
  const pos=st.ks&&st.ks.pos, sk=st.ks&&st.ks.stock; const R=S().recent||[];
  return h+'|'+(pos&&pos.sales?pos.sales.length:0)+'|'+(sk?JSON.stringify(sk).length:'-')+'|'+R.map(r=>r.id).join(',')+'|'+(proj.list||[]).map(p=>p.id+p.updated+p.name).join(',')+'|'+objId(st.dz)+'|'+st.prod+'|'+(st.shop&&st.shop.name)+'|'+today()+'|'+greet()+'|'+Object.keys(KS.mods).join(','); }
let lastSig='';
function renderScreen(scr,force){ if(!scr) return; const s=sig(); if(!force&&s===lastSig&&scr.querySelector('.hm-wrap')) return; lastSig=s; const top=scr.scrollTop;
  scr.classList.add('hm-screen'); scr.innerHTML=screenHTML(); scr.scrollTop=top; bindScreen(scr); fillProjThumbs(scr); fitTiles(scr); }
/* stretch the last quick tile so the grid never ends with a hole (columns depend on the screen width) */
function fitTiles(scr){ const g=scr.querySelector('.hm-tiles'); if(!g) return; const T=[...g.children]; T.forEach(t=>{ if(!t.classList.contains('hm-cont')){ t.style.gridColumn=''; t.classList.remove('hm-wide'); } });
  const cols=getComputedStyle(g).gridTemplateColumns.split(' ').filter(Boolean).length; if(cols<2) return;
  const used=T.reduce((a,t)=>a+(t.classList.contains('hm-cont')?Math.min(2,cols):1),0), rem=used%cols; if(!rem) return; const last=T[T.length-1];
  if(last&&!last.classList.contains('hm-cont')){ last.style.gridColumn='span '+(cols-rem+1); if(cols-rem+1>1) last.classList.add('hm-wide'); } }
let fitRO=null;
function fillProjThumbs(scr){ const L=(proj.list||[]); scr.querySelectorAll('[data-pth]').forEach(el=>{ const key=el.dataset.pth; if(projThumbs[key]!==undefined) return; const p=L.find(x=>key===x.id+':'+x.updated); if(!p) return;
  loadProjThumb(p).then(h=>{ if(h&&el.isConnected) el.innerHTML=h; }); }); }
function bindScreen(scr){ if(scr.dataset.hmb) return; scr.dataset.hmb='1';
  try{ fitRO=new ResizeObserver(()=>{ if(!scr.hidden) fitTiles(scr); }); fitRO.observe(scr); }catch(_){ window.addEventListener('resize',()=>fitTiles(scr)); }
  scr.addEventListener('click',e=>{ const t=e.target; let b;
    if((b=t.closest('[data-hmtile]'))){ runTile(b.dataset.hmtile); return; }
    if((b=t.closest('[data-hmord]'))){ openOrder(b.dataset.hmord); return; }
    if((b=t.closest('[data-hmproj]'))){ openProj(b.dataset.hmproj); return; }
    if((b=t.closest('[data-hmprojs]'))){ const h=$('#hProj'); if(h) h.click(); return; }
    if((b=t.closest('[data-hmtpl]'))){ useTpl(findT(b.dataset.hmtpl)); return; }
    if((b=t.closest('[data-hmsearch]'))){ focusSearch(); return; }
    if((b=t.closest('[data-hmkpi]'))){ kpiGo(b.dataset.hmkpi); return; }
    if((b=t.closest('[data-hmtip]'))){ tipI=(tipI||0)+(+b.dataset.hmtip); redrawTip(scr); return; }
    if((b=t.closest('[data-hmtipdot]'))){ tipI=+b.dataset.hmtipdot; redrawTip(scr); return; }
    if((b=t.closest('[data-hmtipgo]'))){ const tp=tips()[+b.dataset.hmtipgo]; if(tp&&tp.go) try{ tp.go(); }catch(err){ console.error(err); } return; } });
  /* swipe tips on touch */
  let sx=null; scr.addEventListener('touchstart',e=>{ const tp=e.target.closest('.hm-tip'); sx=tp&&e.touches.length===1?e.touches[0].clientX:null; },{passive:true});
  scr.addEventListener('touchend',e=>{ if(sx==null) return; const dx=e.changedTouches[0].clientX-sx; sx=null; if(Math.abs(dx)>50){ tipI=(tipI||0)+(dx<0?1:-1); redrawTip(scr); } },{passive:true}); }
function redrawTip(scr){ const el=scr.querySelector('.hm-tip'); if(!el) return; const w=document.createElement('div'); w.innerHTML=tipHTML(); const n=w.firstElementChild; if(n){ n.classList.add('hm-in'); el.replaceWith(n); } }
function kpiGo(id){ if(id==='due'||id==='over'){ if(has('stats')) KS.show('svodka','due'); else { toPrint(); const sh=st.shop; if(sh) sh.filter='active'; goTab('orders'); } return; }
  if(id==='paid'){ if(has('pos')) KS.show('kassa','shift'); else { toPrint(); goTab('orders'); } return; }
  if(id==='stock'){ if(has('stock')) KS.show('sklad'); return; } }

/* ---------------- side panel: search + summary + setting ---------------- */
let q='', res=[], resI=0, cmdCache=null, cmdT=0;
function cmds(){ if(!cmdCache||Date.now()-cmdT>8000){ try{ cmdCache=allCmds().filter(c=>c&&c.n&&!/^Изделие: /.test(c.n)&&!/Главная/.test(c.n)); }catch(e){ cmdCache=[]; } cmdT=Date.now(); } return cmdCache; }
function score(hay,toks,qq){ const h=nk(hay); for(const t of toks) if(!h.includes(t)) return 0; return h.startsWith(qq)?3:(' '+h).includes(' '+toks[0])?2:1; }
function search(qs){ const qq=nk(qs); if(!qq) return []; const toks=qq.split(' ').filter(Boolean), digits=qq.replace(/\D/g,''); const G=[];
  const grp=(id,title,items,max)=>{ items.sort((a,b)=>b.s-a.s); if(items.length) G.push({id,title,items:items.slice(0,max),more:Math.max(0,items.length-max)}); };
  // orders
  const oo=[]; (st.orders||[]).forEach(o=>{ if(!o) return; let s=score(['№'+o.no,o.no,o.client,o.product,o.note].join(' '),toks,qq); if(String(o.no)===qq||('№'+o.no)===qq.replace(/\s/g,'')) s=5; if(!s&&digits.length>=3&&String(o.phone||'').replace(/\D/g,'').includes(digits)) s=2;
    if(s) oo.push({s,ic:'order',t:'№ '+o.no+' · '+(o.client||'Без клиента'),d:[o.product,ST[o.status],o.due?'срок '+fmtDue(o.due):''].filter(Boolean).join(' · '),run:()=>openOrder(o.id)}); });
  grp('orders','Заказы',oo,6);
  const cc=[]; (st.clients||[]).forEach((c,i)=>{ if(!c) return; let s=score([c.name,c.contact,c.note].join(' '),toks,qq); if(!s&&digits.length>=3&&String(c.phone||'').replace(/\D/g,'').includes(digits)) s=2;
    if(s) cc.push({s,ic:'user',t:c.name||'Клиент',d:[c.phone,c.contact].filter(Boolean).join(' · ')||'Клиент',run:()=>openClient(i)}); });
  grp('clients','Клиенты',cc,4);
  const tt=[], seen=new Set(); (st.myTpl||[]).concat(typeof DZT!=='undefined'?DZT:[]).forEach(T=>{ if(!T||!T.id||seen.has(T.id)) return; seen.add(T.id); const s=score([T.name,(T.tags||[]).join(' '),kindName(T.kind)].join(' '),toks,qq)+(nk(T.name).includes(qq)?2:0);
    if(s) tt.push({s,tpl:T,t:T.name,d:kindName(T.kind)+((T.tags||[]).length?' · '+T.tags.slice(0,3).join(', '):''),run:()=>useTpl(T)}); });
  grp('tpl','Шаблоны',tt,6);
  const pp=[]; PRODUCTS.forEach(P=>{ const s=score(P.n+' '+(P.cat||''),toks,qq); if(s) pp.push({s,ic:'tag',t:P.n,d:P.w?P.w+' × '+P.h+' мм':'Изделие',run:()=>product(P.id)}); });
  grp('prod','Изделия',pp,5);
  const pr=[]; (proj.list||[]).forEach(p=>{ const s=score(p.name,toks,qq); if(s) pr.push({s,ic:'folder',t:p.name,d:p.id===proj.cur?'открыт сейчас':'проект',run:()=>openProj(p.id)}); });
  grp('proj','Проекты',pr,3);
  const cm=[]; cmds().forEach(c=>{ const s=score(c.n+' '+(c.k||''),toks,qq); if(s) cm.push({s,ic:'cmd',t:c.n,d:c.k||'команда',run:()=>c.f()}); });
  grp('cmd','Команды',cm,6);
  return G; }
function resHTML(){ if(!q) return ''; if(!res.length) return `<div class="hm-noq">Ничего не нашлось по «${esc_(q)}». Попробуйте другое слово: имя клиента, номер заказа, «визитка», «печать».</div>`;
  let n=0; return res.map(g=>`<div class="hm-rg"><div class="hd2">${esc_(g.title)}${g.more?` <span>+${g.more}</span>`:''}</div>${g.items.map(it=>{ const i=n++; return `<button class="hm-r${i===resI?' on':''}" data-hmr="${i}"><span class="hm-ri">${it.tpl?tplThumb(it.tpl,34,34):I(IC[it.ic])}</span><span class="hm-rt"><b>${hl(it.t)}</b><small>${esc_(it.d||'')}</small></span></button>`; }).join('')}</div>`).join(''); }
function hl(t){ const s=esc_(t); const toks=nk(q).split(' ').filter(x=>x.length>1).map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')); if(!toks.length) return s; try{ return s.replace(new RegExp('('+toks.join('|')+')','gi'),'<mark>$1</mark>'); }catch(_){ return s; } }
const flat=()=>res.flatMap(g=>g.items);
function runRes(i){ const it=flat()[i]; if(!it) return; const inp=$('#hm-q'); if(inp) inp.blur(); try{ it.run(); }catch(e){ console.error('[home] search',e); toast('Не получилось открыть'); } }
function drawRes(box){ const el=box.querySelector('.hm-res'); if(el){ el.innerHTML=resHTML(); el.hidden=!q; } const clr=box.querySelector('.hm-qx'); if(clr) clr.hidden=!q; }
function summaryHTML(){ const k=kpis(); const row=(ic,l,v,cls,act)=>`<button class="hm-srow ${cls||''}" data-hmkpi="${act||''}"><span class="hm-sic">${I(IC[ic])}</span><span>${l}</span><b>${v}</b></button>`;
  return row('clock','Срок сегодня',k.dueToday,k.dueToday?'acc':'','due')+row('alert','Просрочено',k.over,k.over?'bad':'','over')+row('order','В работе',k.work,'','due')+row('done','Готовы к выдаче',k.ready,k.ready?'ok':'','due')
   +row('wallet','Оплачено сегодня',esc_(KS.money(k.paidToday)),'','paid')+row('cash','Долг клиентов',esc_(KS.money(k.debt)),k.debt?'warn':'','due')+(k.stockLow!=null?row('box','Мало на складе',k.stockLow,k.stockLow?'warn':'','stock'):''); }
function renderPanel(box,o){ const s=S();
  if(o.reason==='show'||!box.querySelector('.hm-side')){
    box.innerHTML=`<div class="hm-side"><div class="hm-q"><span class="hm-qi">${I(IC.search)}</span><input type="search" id="hm-q" placeholder="Поиск по всему" autocomplete="off" spellcheck="false" aria-label="Поиск по всему" value="${esc_(q)}"><kbd class="hm-qk">/</kbd><button class="hm-qx" aria-label="Очистить" hidden>✕</button></div>
      <div class="hm-res" hidden></div>
      <div class="card hm-today"><div class="hd">Сегодня<span class="hm-sd">${esc_(new Date().toLocaleDateString('ru-RU',{day:'numeric',month:'long'}))}</span></div><div class="hm-sum">${summaryHTML()}</div></div>
      <div class="card hm-set"><label class="chk"><input type="checkbox" id="hm-boot"${s.boot!==false?' checked':''}> Открывать Главную при запуске</label><p class="hint">Главная — первый экран после открытия программы в режиме «Типография».</p></div></div>`;
    bindPanel(box); if(q){ res=search(q); drawRes(box); } return; }
  KS.keepFocus(box,()=>{ const sm=box.querySelector('.hm-sum'); if(sm) sm.innerHTML=summaryHTML(); const cb=box.querySelector('#hm-boot'); if(cb&&document.activeElement!==cb) cb.checked=S().boot!==false; }); }
function bindPanel(box){ const inp=box.querySelector('#hm-q');
  inp.addEventListener('input',()=>{ q=inp.value; resI=0; res=search(q); drawRes(box); });
  inp.addEventListener('focus',()=>{ cmdCache=null; });
  inp.addEventListener('keydown',e=>{ const n=flat().length;
    if(e.key==='ArrowDown'){ e.preventDefault(); if(n){ resI=(resI+1)%n; markRes(box); } }
    else if(e.key==='ArrowUp'){ e.preventDefault(); if(n){ resI=(resI-1+n)%n; markRes(box); } }
    else if(e.key==='Enter'){ e.preventDefault(); if(n) runRes(resI); }
    else if(e.key==='Escape'){ if(q){ e.preventDefault(); e.stopPropagation(); q=''; inp.value=''; res=[]; drawRes(box); } else inp.blur(); } });
  box.querySelector('.hm-qx').addEventListener('click',()=>{ q=''; inp.value=''; res=[]; drawRes(box); inp.focus(); });
  box.querySelector('.hm-res').addEventListener('click',e=>{ const b=e.target.closest('[data-hmr]'); if(b) runRes(+b.dataset.hmr); });
  box.querySelector('.hm-sum').addEventListener('click',e=>{ const b=e.target.closest('[data-hmkpi]'); if(b&&b.dataset.hmkpi) kpiGo(b.dataset.hmkpi); });
  box.querySelector('#hm-boot').addEventListener('change',e=>{ S().boot=!!e.target.checked; KS.save(); toast(e.target.checked?'Главная будет открываться при запуске':'При запуске откроется последняя вкладка'); }); }
function markRes(box){ box.querySelectorAll('.hm-r').forEach(b=>{ const on=+b.dataset.hmr===resI; b.classList.toggle('on',on); if(on) b.scrollIntoView({block:'nearest'}); }); }

/* ---------------- registration ---------------- */
KS.tab({id:'home',group:'home',title:'Главная',icon:I(IC.house),groupIcon:I(IC.house),app:'print',before:'shop',screen:true,
  render(box,o){ renderPanel(box,o); renderScreen(o.screen,o.reason==='show'); }});

/* remember applied templates (most recent first) */
if(typeof dzApplyTpl==='function'){ const _apply=dzApplyTpl; dzApplyTpl=function(T){ const r=_apply.apply(this,arguments);
  try{ if(T&&T.id){ const s=S(); s.recent=[{id:T.id,kind:T.kind||'',ts:Date.now()}].concat((s.recent||[]).filter(x=>x&&x.id!==T.id)).slice(0,16); KS.save(); } }catch(e){ console.error('[home] recent',e); } return r; }; }

/* «/» focuses the search while Главная is open */
document.addEventListener('keydown',e=>{ if(e.key!=='/'||e.metaKey||e.ctrlKey||e.altKey||activeTab!=='ks-home') return; const a=document.activeElement;
  if(a&&(a.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))) return; if(document.querySelector('.modal:not([hidden]),#cmd:not([hidden])')) return;
  e.preventDefault(); focusSearch(); });

KS.cmd('Поиск по всему (Главная)','поиск',()=>{ KS.show('home'); setTimeout(focusSearch,30); });

/* open Главная at start (only at boot, only in «Типография», never steals focus) */
KS.on('boot',()=>{ try{ if(st.ui&&st.ui.app==='print'&&S().boot!==false&&activeTab!=='ks-home') KS.show('home'); }catch(e){ console.error('[home] boot',e); } });
KS.on('photosChanged',()=>{ lastSig=''; });
