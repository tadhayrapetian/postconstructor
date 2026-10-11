/* «Производство» — бизнес-часть раздела «Блокноты»: сводка, прайс и калькулятор, заказы и производство (канбан),
   склад материалов, подбор пружины, витрина для клиента, статистика. Работает и без модулей notebook / nbcover / nbextra. */
KS.mod('nbshop',{title:'Производство блокнотов'});

/* ================= helpers ================= */
const I=p=>KS.icon(p);
const IC={
  nb:'<path d="M6 3h11a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6z"/><path d="M6 3v18"/><path d="M3.5 7h3M3.5 12h3M3.5 17h3"/><path d="M10 8h6M10 11.5h4"/>',
  dash:'<rect x="3" y="3" width="7.5" height="9" rx="1.6"/><rect x="13.5" y="3" width="7.5" height="5.5" rx="1.6"/><rect x="13.5" y="11.5" width="7.5" height="9.5" rx="1.6"/><rect x="3" y="15" width="7.5" height="6" rx="1.6"/>',
  calc:'<rect x="5" y="2.8" width="14" height="18.4" rx="2.4"/><rect x="8" y="5.8" width="8" height="3.6" rx=".8"/><path d="M8.5 13h.01M12 13h.01M15.5 13h.01M8.5 16.8h.01M12 16.8h.01M15.5 16.8h.01"/>',
  board:'<rect x="3" y="4" width="5" height="16" rx="1.4"/><rect x="9.5" y="4" width="5" height="11" rx="1.4"/><rect x="16" y="4" width="5" height="7" rx="1.4"/>',
  box:'<path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9"/>',
  coil:'<path d="M8 3v18"/><path d="M5 5.5c0-1 1.3-1.5 3-1.5s3 .5 3 1.5-1.3 1.5-3 1.5-3-.5-3-1.5zM5 10.5c0-1 1.3-1.5 3-1.5s3 .5 3 1.5-1.3 1.5-3 1.5-3-.5-3-1.5zM5 15.5c0-1 1.3-1.5 3-1.5s3 .5 3 1.5-1.3 1.5-3 1.5-3-.5-3-1.5z"/><path d="M11 4h8v16h-8"/>',
  shop:'<path d="M4 9.5 5.5 4h13L20 9.5"/><path d="M4 9.5c0 1.4 1.1 2.5 2.7 2.5s2.6-1.1 2.6-2.5c0 1.4 1.1 2.5 2.7 2.5s2.7-1.1 2.7-2.5c0 1.4 1 2.5 2.6 2.5S20 10.9 20 9.5"/><path d="M5.5 12v8h13v-8"/><path d="M10 20v-4.5h4V20"/>',
  chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  plus:'<path d="M12 5v14M5 12h14"/>', open:'<path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 19V7.5A1.5 1.5 0 0 1 5.5 6H10"/>',
  print:'<path d="M7 8.5V3h10v5.5"/><rect x="3" y="8.5" width="18" height="8.5" rx="2"/><path d="M7 14h10v7H7z"/>',
  left:'<path d="m15 18-6-6 6-6"/>', right:'<path d="m9 18 6-6-6-6"/>', alert:'<path d="M12 3.5 2.8 19.5h18.4z"/><path d="M12 10v4M12 17h.01"/>',
  check:'<path d="m5 12.5 4.5 4.5L19 7.5"/>', cart:'<circle cx="9" cy="20" r="1.4"/><circle cx="17.5" cy="20" r="1.4"/><path d="M2.5 3.5h3l2.4 11.5h11l2-8H6.7"/>',
  trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>', clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  coin:'<circle cx="12" cy="12" r="8.5"/><path d="M14.8 9.2c-.5-1-1.5-1.5-2.8-1.5-1.6 0-2.8.8-2.8 2.1 0 2.9 5.8 1.5 5.8 4.4 0 1.3-1.2 2.2-3 2.2-1.4 0-2.5-.6-3-1.6M12 6v1.7M12 16.4V18"/>',
  tag:'<path d="M3 12V4.5A1.5 1.5 0 0 1 4.5 3H12l9 9-9 9z"/><circle cx="8" cy="8" r="1.4"/>', full:'<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  x:'<path d="M6 6l12 12M18 6 6 18"/>', user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>', layers:'<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
  edit:'<path d="M4 20h4L19.2 8.8a2.8 2.8 0 0 0-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>', punch:'<circle cx="7" cy="7" r="2"/><circle cx="7" cy="17" r="2"/><circle cx="7" cy="12" r="2"/><path d="M12 4h8v16h-8"/>'
};
const E=s=>KS.esc(s==null?'':String(s));
const M=n=>KS.money(Math.round(+n||0));
const num=(v,d)=>{ const n=parseFloat(String(v==null?'':v).replace(',','.')); return isFinite(n)?n:(d===undefined?0:d); };
const r2=n=>Math.round((+n||0)*100)/100;
const fn=n=>String(r2(n)).replace('.',',');
const today=()=>KS.today();
const iso=t=>{ const d=new Date(t); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); };
const addDays=(s,n)=>{ const [y,m,d]=String(s).split('-').map(Number); return iso(new Date(y,m-1,d+n)); };
const dayDiff=(a,b)=>Math.round((new Date(a+'T12:00:00')-new Date(b+'T12:00:00'))/864e5);
const fmtDay=s=>{ if(!/^\d{4}-\d\d-\d\d/.test(String(s||''))) return ''; try{ return new Date(s+'T12:00:00').toLocaleDateString('ru-RU',{day:'numeric',month:'short'}).replace('.',''); }catch(_){ return s; } };
const plural=(n,a,b,c)=>{ const m=Math.abs(n)%100, k=m%10; return m>10&&m<20?c:k===1?a:k>=2&&k<=4?b:c; };
const NB=()=>(KS.nb&&typeof KS.nb.snapshot==='function')?KS.nb:null;
const ORDERS=()=>Array.isArray(st.orders)?st.orders:[];
const clone=o=>JSON.parse(JSON.stringify(o==null?null:o));
const cur=()=>(st.shop&&st.shop.cur)||'֏';

/* ================= reference data ================= */
const FORMATS=[{id:'A4',n:'A4',w:210,h:297},{id:'A5',n:'A5',w:148,h:210},{id:'A6',n:'A6',w:105,h:148},{id:'A7',n:'A7',w:74,h:105},
  {id:'B5',n:'B5',w:176,h:250},{id:'B6',n:'B6',w:125,h:176},{id:'sq',n:'Квадрат',w:150,h:150},{id:'tn',n:'Traveler’s',w:110,h:210},
  {id:'pass',n:'Паспорт',w:89,h:124},{id:'pocket',n:'Карманный',w:90,h:140}];
const BIND=[['spiral','Пружина'],['wireo','Wire-O'],['staple','Скоба'],['perfect','Клеевой'],['sewn','Шитьё нитками'],['rings','Кольца'],['disc','Диски'],['none','Без переплёта']];
const BINDN=Object.fromEntries(BIND);
const WRAP=b=>b==='perfect'||b==='sewn'||b==='staple';
const PAGEK=[['lined','Линейка','light'],['grid','Клетка','light'],['dots','Точки','light'],['blank','Чистые','none'],['planner','Ежедневник','medium'],['mixed','Смешанный','medium']];
const COV=[['none','Без печати'],['light','Светлая'],['medium','Средняя'],['heavy','Плотная']];
const COVN=Object.fromEntries(COV);
const LAM=[['none','Без ламинации'],['matte','Матовая'],['gloss','Глянцевая'],['soft','Soft-touch']];
const LAMN=Object.fromEntries(LAM);
const EXTRA=[['corners','Скругление углов'],['elastic','Резинка'],['ribbon','Ляссе (закладка)'],['pocket','Кармашек'],['pack','Упаковка']];
const STAGES=[['layout','Макет','new','#7c5cff'],['block','Печать блока','work','#0a84ff'],['cover','Печать обложки','work','#bf5af2'],['cut','Резка','work','#ff9f0a'],
  ['bind','Переплёт','work','#ff6b3d'],['pack','Упаковка','work','#a2845e'],['ready','Готов','ready','#30c158'],['out','Выдан','done','#8e8e93']];
const SIDX=Object.fromEntries(STAGES.map((s,i)=>[s[0],i]));
const SNAME=Object.fromEntries(STAGES.map(s=>[s[0],s[1]]));
const SCOL=Object.fromEntries(STAGES.map(s=>[s[0],s[3]]));
const SPIRAL_D=[6,8,10,12,14,16,19,22,25,28,32];
const WIRE_D=[[4.8,'3/16″',3],[6.4,'1/4″',3],[7.9,'5/16″',3],[9.5,'3/8″',3],[11.1,'7/16″',3],[12.7,'1/2″',3],[14.3,'9/16″',3],[15.9,'5/8″',2],[19,'3/4″',2],[22.2,'7/8″',2],[25.4,'1″',2],[28.6,'1 1/8″',2],[31.8,'1 1/4″',2]];
const RING_D=[15,20,25,30,40,50], DISC_D=[11,18,24,28,32,38,44];
const PITCH={'3:1':8.47,'2:1':12.7,'4:1':6.35};

const DEF_PRICES={
  paper:[{gsm:70,c:7},{gsm:80,c:8},{gsm:90,c:10},{gsm:100,c:13},{gsm:120,c:18},{gsm:160,c:30}],
  ink:{none:0,light:5,medium:12,heavy:30},
  card:[{gsm:250,c:60},{gsm:300,c:80},{gsm:350,c:110}],
  lam:{none:0,matte:70,gloss:60,soft:140},
  spiral:{6:40,8:50,10:60,12:70,14:80,16:95,19:120,22:140,25:170,28:200,32:240},
  wireo:{'4.8':60,'6.4':70,'7.9':80,'9.5':95,'11.1':110,'12.7':125,'14.3':140,'15.9':160,'19':190,'22.2':220,'25.4':260,'28.6':290,'31.8':330},
  bind:{spiral:{c:0,min:4},wireo:{c:0,min:4},staple:{c:5,min:1.5},perfect:{c:60,min:8},sewn:{c:40,min:25},rings:{c:60,min:2},disc:{c:35,min:3},none:{c:0,min:0}},
  extra:{corners:{c:0,min:1},elastic:{c:120,min:1.5},ribbon:{c:50,min:2},pocket:{c:90,min:3},pack:{c:100,min:1}},
  lab:{rate:35,setup:10,side:.05,cut:1.5,lam:1},
  markup:90, disc:[[1,0],[5,5],[10,10],[25,15],[50,20],[100,25]], round:'auto'
};
const DEF_CALC={src:'nb',fmt:'A5',w:148,h:210,pages:96,gsm:80,sides:2,cov:'light',binding:'spiral',card:300,coverSides:1,lam:'matte',edge:'long',
  extras:{corners:false,elastic:false,ribbon:false,pocket:false,pack:true},qty:1,page:'lined',title:''};
const MK=(cat,name,unit,qty,min,cost,key)=>({id:'m'+Math.random().toString(36).slice(2,9),cat,name,unit,qty,min,cost,key});
const DEF_MATS=()=>[
  MK('Бумага','Офисная 80 г, A4','лист',2500,500,8,'paper:80'),MK('Бумага','Бумага 100 г, A4','лист',500,200,13,'paper:100'),MK('Бумага','Бумага 120 г, A4','лист',250,100,18,'paper:120'),
  MK('Обложки','Картон 300 г белый, A4','лист',100,30,80,'card:300'),MK('Обложки','Картон 300 г крафт, A4','лист',60,20,90,'card:300'),MK('Обложки','Картон 250 г чёрный, A4','лист',40,20,75,'card:250'),
  MK('Обложки','Плёнка для ламинации, A4','шт',100,30,60,'lam'),
  MK('Пружины','Пружина пластик 8 мм','шт',40,15,50,'spiral:8'),MK('Пружины','Пружина пластик 10 мм','шт',40,15,60,'spiral:10'),MK('Пружины','Пружина пластик 12 мм','шт',25,10,70,'spiral:12'),MK('Пружины','Пружина пластик 16 мм','шт',12,10,95,'spiral:16'),
  MK('Пружины','Wire-O 6,4 мм (1/4″) 3:1','шт',40,15,70,'wireo:6.4'),MK('Пружины','Wire-O 7,9 мм (5/16″) 3:1','шт',30,15,80,'wireo:7.9'),MK('Пружины','Wire-O 9,5 мм (3/8″) 3:1','шт',30,15,95,'wireo:9.5'),MK('Пружины','Wire-O 12,7 мм (1/2″) 3:1','шт',20,10,125,'wireo:12.7'),
  MK('Кольца и диски','Кольца 25 мм','шт',60,20,60,'ring:25'),MK('Кольца и диски','Диски 24 мм','шт',90,36,35,'disc:24'),
  MK('Переплёт','Скобы 24/6','шт',2000,300,5,'staple'),MK('Переплёт','Клей для переплёта','г',800,200,2,'glue'),MK('Переплёт','Нитки переплётные','м',150,40,10,'thread'),
  MK('Фурнитура','Резинка с концевиками','шт',30,15,120,'elastic'),MK('Фурнитура','Лента-ляссе','м',12,5,150,'ribbon'),MK('Фурнитура','Кармашек','шт',20,10,90,'pocket'),MK('Фурнитура','Пакет с клапаном','шт',60,20,100,'pack')];
const MCATS=['Бумага','Обложки','Пружины','Кольца и диски','Переплёт','Фурнитура','Прочее'];
const MKEYS=[['paper','Бумага (г/м²)',1],['card','Картон обложки (г/м²)',1],['lam','Плёнка для ламинации',0],['spiral','Пружина пластик (мм)',1],['wireo','Wire-O (мм)',1],['ring','Кольца (мм)',1],['disc','Диски (мм)',1],
  ['staple','Скобы',0],['glue','Клей (г)',0],['thread','Нитки (м)',0],['elastic','Резинка',0],['ribbon','Ляссе (м)',0],['pocket','Кармашек',0],['pack','Упаковка',0],['other','Другое (не списывается)',0]];

const DEF={view:'dash',prices:DEF_PRICES,calc:DEF_CALC,jobs:[],mats:null,show:null,board:{q:'',filter:''},spine:{pages:96,gsm:80,sides:2,edge:210,card:300},stats:{per:12},land:true};
const S=()=>{ const s=KS.store('nbshop',DEF); if(!Array.isArray(s.mats)) s.mats=DEF_MATS(); if(!Array.isArray(s.jobs)) s.jobs=[];
  const P=s.prices; for(const k in DEF_PRICES) if(P[k]==null) P[k]=clone(DEF_PRICES[k]);
  ['ink','lam','bind','extra','lab','spiral','wireo'].forEach(k=>{ for(const j in DEF_PRICES[k]) if(P[k][j]==null) P[k][j]=clone(DEF_PRICES[k][j]); });
  for(const k in DEF_CALC) if(s.calc[k]==null) s.calc[k]=clone(DEF_CALC[k]);
  return s; };
const P=()=>S().prices;

/* ================= pricing engine ================= */
const fmtOf=c=>FORMATS.find(f=>f.id===c.fmt)||FORMATS.find(f=>f.w===+c.w&&f.h===+c.h)||null;
const fmtLabel=c=>{ const f=fmtOf(c); return f&&f.w===+c.w&&f.h===+c.h?f.n:(Math.round(+c.w)+'×'+Math.round(+c.h)+' мм'); };
/* how many pieces w×h fit on a sheet SW×SH (either orientation) */
const fit=(w,h,SW,SH)=>Math.max(Math.floor(SW/w)*Math.floor(SH/h),Math.floor(SW/h)*Math.floor(SH/w));
const nupOf=(w,h)=>Math.max(1,fit(w,h,210,297));
const thickOf=c=>{ const leaves=Math.ceil(Math.max(1,+c.pages||1)/(+c.sides===1?1:2)); return leaves*(+c.gsm||80)*0.00125+(c.card&&c.card!=='none'?2*(+c.card)*0.0012:0); };
const edgeOf=c=>(c.edge==='short'?Math.min(+c.w,+c.h):Math.max(+c.w,+c.h))||210;
const pickSpiral=T=>SPIRAL_D.find(d=>d>=T+3)||null;
const pickWire=T=>WIRE_D.find(x=>x[0]*0.75>=T)||null;
const pickRing=T=>RING_D.find(d=>d*0.8>=T)||null;
const pickDisc=T=>DISC_D.find(d=>d*0.85>=T)||null;
const holes=(edge,pitch)=>Math.max(2,Math.floor(edge/pitch)-1);
const ringCount=e=>e<=150?2:e<=220?3:4;
const discCount=e=>Math.max(5,Math.round(e/24));
function paperCost(Pr,gsm){ const L=(Pr.paper||[]).slice().sort((a,b)=>a.gsm-b.gsm); if(!L.length) return 0; return +((L.find(p=>p.gsm>=gsm)||L[L.length-1]).c)||0; }
function cardCost(Pr,gsm){ const L=(Pr.card||[]).slice().sort((a,b)=>a.gsm-b.gsm); if(!L.length) return 0; return +((L.find(p=>p.gsm>=gsm)||L[L.length-1]).c)||0; }
function discFor(Pr,qty){ let d=0; (Pr.disc||[]).forEach(([q,p])=>{ if(qty>=+q) d=Math.max(d,+p||0); }); return d; }
function nice(v,Pr){ if(!(v>0)) return 0; let s=Pr.round; s=s==='auto'||!(+s>0)?(v<500?10:v<2000?50:v<10000?100:500):+s; return Math.ceil(v/s-1e-9)*s; }
/* the binding element for a config: {kind,d,label,warn} */
function bindPart(c){ const T=thickOf(c), b=c.binding; let r={kind:b,d:null,label:BINDN[b]||b,warn:''};
  if(b==='spiral'){ const d=pickSpiral(T); r.d=d; r.label=d?`Пружина ${d} мм`:'Пружина — слишком толстый блок'; if(!d) r.warn='Блок толще 29 мм: выберите кольца, диски или клеевой переплёт.'; }
  else if(b==='wireo'){ const x=pickWire(T); r.d=x?x[0]:null; r.pitch=x?x[2]+':1':''; r.label=x?`Wire-O ${String(x[0]).replace('.',',')} мм (${x[1]}, шаг ${x[2]}:1)`:'Wire-O — слишком толстый блок'; if(!x) r.warn='Блок толще 24 мм: Wire-O не подойдёт.'; }
  else if(b==='rings'){ const d=pickRing(T); r.d=d; r.n=ringCount(edgeOf(c)); r.label=d?`Кольца ${d} мм × ${r.n}`:'Кольца — слишком толстый блок'; if(!d) r.warn='Блок толще 40 мм.'; }
  else if(b==='disc'){ const d=pickDisc(T); r.d=d; r.n=discCount(edgeOf(c)); r.label=d?`Диски ${d} мм × ${r.n}`:'Диски — слишком толстый блок'; if(!d) r.warn='Блок толще 37 мм.'; }
  else if(b==='staple'){ r.n=edgeOf(c)>220?3:2; r.label=`Скоба × ${r.n}`; if(+c.pages>96) r.warn='Скоба держит до ~96 страниц (24 листа). Больше — пружина или клеевой.'; if(+c.sides===1) r.warn=r.warn||'Для скобы блок печатают с двух сторон (брошюра).'; }
  else if(b==='perfect'){ if(T<2.5) r.warn='Клеевой переплёт надёжен от ~3 мм (≈ 50+ листов).'; }
  else if(b==='sewn'){ r.label='Шитьё нитками'; }
  return r; }
function quote(c0,Pr){ Pr=Pr||P(); const c=Object.assign({},DEF_CALC,c0||{}); c.extras=Object.assign({},DEF_CALC.extras,(c0&&c0.extras)||{});
  const w=Math.max(20,num(c.w,148)), h=Math.max(20,num(c.h,210)), pages=Math.max(1,Math.round(num(c.pages,96))), sides=+c.sides===1?1:2, gsm=num(c.gsm,80), qty=Math.max(1,Math.round(num(c.qty,1)));
  const leaves=Math.ceil(pages/sides), nup=nupOf(w,h), sheets=Math.ceil(leaves/nup), L=[], rate=num(Pr.lab.rate);
  const add=(g,n,cost,min)=>L.push({g,n,cost:r2(cost),min:r2(min||0)});
  add('Блок',`Бумага ${gsm} г: ${sheets} ${plural(sheets,'лист','листа','листов')} A4 (${nup} ${plural(nup,'страница','страницы','страниц')} на листе)`,sheets*paperCost(Pr,gsm),0);
  const sidesA4=c.cov==='none'?0:sheets*sides;
  if(sidesA4) add('Блок',`Печать блока: ${sidesA4} ${plural(sidesA4,'сторона','стороны','сторон')} A4, заливка «${(COVN[c.cov]||'').toLowerCase()}»`,sidesA4*num(Pr.ink[c.cov]),sidesA4*num(Pr.lab.side));
  /* cover */
  let coverSheets=0, coverBig=false, cw=0, ch=h; const b=bindPart(Object.assign({},c,{w,h,pages,sides,gsm}));
  const spine=r2(thickOf(Object.assign({},c,{pages,sides,gsm})));
  if(c.card&&c.card!=='none'){ const wrap=WRAP(c.binding);
    cw=wrap?2*w+(c.binding==='staple'?0:spine):w; ch=h; const pieces=wrap?1:2;
    let n=fit(cw,ch,210,297); if(!n){ n=fit(cw,ch,297,420); coverBig=true; } n=Math.max(1,n); coverSheets=Math.ceil(pieces/n);
    const k=coverBig?2:1, cs=+c.coverSides===2?2:1;
    add('Обложка',`Картон ${c.card} г: ${coverSheets} ${coverBig?'A3':'A4'} (${wrap?'обложка на разворот':'лицо и оборот'})`,coverSheets*k*cardCost(Pr,+c.card),0);
    add('Обложка',`Печать обложки: ${cs===2?'две стороны':'одна сторона'}`,coverSheets*k*cs*num(Pr.ink.heavy),coverSheets*cs*num(Pr.lab.side));
    if(c.lam&&c.lam!=='none') add('Обложка',`Ламинация ${LAMN[c.lam].toLowerCase()}`,coverSheets*k*num(Pr.lam[c.lam]),coverSheets*num(Pr.lab.lam)); }
  /* binding */
  const bp=Pr.bind[c.binding]||{c:0,min:0}, e=edgeOf({w,h,edge:c.edge}); let bc=num(bp.c);
  if(c.binding==='spiral') bc+=(b.d?num(Pr.spiral[b.d]):0)*e/297;
  else if(c.binding==='wireo') bc+=(b.d?num(Pr.wireo[String(b.d)]):0)*e/297;
  else if(c.binding==='staple'||c.binding==='rings'||c.binding==='disc') bc=num(bp.c)*(b.n||1);
  else if(c.binding==='perfect') bc=num(bp.c)*e/210;
  if(c.binding!=='none') add('Переплёт',b.label,bc,num(bp.min));
  EXTRA.forEach(([k,n])=>{ if(c.extras[k]){ const x=Pr.extra[k]||{c:0,min:0}; add('Дополнения',n,num(x.c),num(x.min)); } });
  add('Работа','Резка блока и обложки',0,num(Pr.lab.cut));
  add('Работа',`Подготовка заказа ${num(Pr.lab.setup)} мин${qty>1?' / '+qty+' шт.':''}`,0,num(Pr.lab.setup)/qty);
  const mat=L.reduce((s,l)=>s+l.cost,0), min=L.reduce((s,l)=>s+l.min,0), labour=min*rate, unitCost=mat+labour;
  const base=unitCost*(1+num(Pr.markup)/100), disc=discFor(Pr,qty), unit=nice(base*(1-disc/100),Pr), total=unit*qty, totalCost=unitCost*qty;
  return {c,lines:L,mat:r2(mat),min:r2(min),labour:r2(labour),unitCost:r2(unitCost),base:r2(base),disc,unit,total,totalCost:r2(totalCost),profit:r2(total-totalCost),
    margin:total?Math.round((total-totalCost)/total*100):0,sheets,nup,leaves,coverSheets,coverBig,spine,bind:b,qty,w,h,pages,sides,gsm,cw,ch}; }
/* client price for one extra / option (material + labour) × markup */
const extraPrice=(k,Pr)=>{ Pr=Pr||P(); const x=Pr.extra[k]||{c:0,min:0}; return nice((num(x.c)+num(x.min)*num(Pr.lab.rate))*(1+num(Pr.markup)/100),Pr); };
const cfgName=c=>`Блокнот ${fmtLabel(c)} · ${c.pages} стр.`;
const cfgLine=c=>{ const b=bindPart(c), pk=PAGEK.find(p=>p[0]===c.page); return [fmtLabel(c),c.pages+' стр.',pk?pk[1].toLowerCase():String(c.pageName||'').toLowerCase(),b.d?b.label.toLowerCase():(BINDN[c.binding]||'').toLowerCase()].filter(Boolean).join(' · '); };
const finLine=c=>[c.card&&c.card!=='none'?`обложка ${c.card} г`:'без обложки',c.lam&&c.lam!=='none'?'ламинация '+LAMN[c.lam].toLowerCase():'',...EXTRA.filter(([k])=>c.extras&&c.extras[k]).map(x=>x[1].toLowerCase())].filter(Boolean).join(', ');

/* notebook snapshot (agent A) → calculator config */
function snapCfg(s){ if(!s||typeof s!=='object') return null; const c={};
  if(s.fmt) c.fmt=String(s.fmt); if(+s.w>0) c.w=+s.w; if(+s.h>0) c.h=+s.h; if(+s.pages>0) c.pages=Math.round(Math.max(+s.pages,+s.padded||0)); if(+s.paperGsm>0) c.gsm=+s.paperGsm;
  if(BINDN[s.binding]) c.binding=s.binding;
  if(s.sides===1||s.sides===2) c.sides=s.sides; else if(s.duplex===false||s.single===true) c.sides=1; else if(s.duplex===true) c.sides=2;
  const pg=String(s.ruling||s.pageType||s.page||s.kind||'').toLowerCase(); const pk=PAGEK.find(p=>pg.includes(p[0]))||(pg.includes('line')?PAGEK[0]:pg.includes('dot')?PAGEK[2]:null); if(pk){ c.page=pk[0]; c.cov=pk[2]; }
  if(s.title) c.title=String(s.title).slice(0,80);
  if(!c.w||!c.h){ const f=FORMATS.find(x=>x.id===c.fmt); if(f){ c.w=f.w; c.h=f.h; } }
  return c; }
function nbSnap(){ const nb=NB(); if(!nb) return null; try{ if(typeof nb.get==='function') nb.get(); return nb.snapshot(); }catch(e){ console.error('[nbshop] snapshot',e); return null; } }
/* page coverage and main page type from the notebook's own page list (KS.nb.pages / KS.nb.types, ink l|m|h) */
function nbInk(){ const nb=NB(); if(!nb||typeof nb.pages!=='function'||typeof nb.types!=='function') return null; try{ const T={}; nb.types().forEach(t=>T[t.id]=t); const P=nb.pages()||[]; if(!P.length) return null; let sum=0,n=0; const cnt={};
  P.forEach(pg=>{ const t=T[pg.type]; const k=t&&t.ink; const v=k==='h'?3:k==='m'?2:k==='l'?1:0; sum+=v; n++; cnt[pg.type]=(cnt[pg.type]||0)+1; });
  const avg=n?sum/n:1, top=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0]; return {cov:avg<0.5?'none':avg<1.5?'light':avg<2.5?'medium':'heavy',pageName:top&&T[top[0]]?T[top[0]].n:''}; }catch(e){ return null; } }
/* current calculator config (from the current notebook when src = nb) */
function calcCfg(){ const s=S(), c=clone(s.calc); if(c.src==='nb'){ const k=snapCfg(nbSnap()); if(k){ Object.assign(c,k); const ink=nbInk(); if(ink){ c.cov=ink.cov; if(ink.pageName){ c.pageName=ink.pageName; delete c.page; } } } } return c; }

/* ================= jobs ↔ app orders ================= */
const ordOf=j=>j&&j.orderId?ORDERS().find(o=>o&&o.id===j.orderId)||null:null;
/* live view of a job: the linked order is the source of truth for client / due / price / payments */
function live(j){ const o=ordOf(j); return {o,no:o?o.no:j.no,client:(o?o.client:j.client)||'',phone:(o?o.phone:j.phone)||'',due:(o?o.due:j.due)||'',price:o?num(o.price):num(j.price),
  cost:o&&num(o.cost)?num(o.cost):num(j.cost),paid:o?num(o.paid):0,qty:o&&+o.qty>0?+o.qty:(+j.qty||1),status:o?o.status:STAGES[SIDX[j.stage]||0][2],cancel:o?o.status==='cancel':!!j.cancel}; }
const jobsAll=()=>S().jobs.filter(j=>j&&j.id);
const jobsLive=()=>jobsAll().filter(j=>!live(j).cancel);
const MATKEY=k=>String(k||'').split(':');
function findMat(key){ const mats=S().mats; const [t,v]=MATKEY(key); if(!v) return mats.find(m=>m.key===t)||null;
  const same=mats.filter(m=>MATKEY(m.key)[0]===t);
  if(t==='paper'||t==='card'){ return same.filter(m=>num(MATKEY(m.key)[1])===num(v)).sort((a,b)=>b.qty-a.qty)[0]||null; }
  /* diameters: the exact one or the nearest larger */
  return same.filter(m=>num(MATKEY(m.key)[1])>=num(v)-0.05).sort((a,b)=>num(MATKEY(a.key)[1])-num(MATKEY(b.key)[1])||b.qty-a.qty)[0]||null; }
/* materials needed for qty notebooks of config c */
function usage(c,qty){ const q=quote(Object.assign({},c,{qty})), u=[], add=(key,n,label,unit)=>{ if(n>0) u.push({key,n:r2(n),label,unit}); }, e=edgeOf(q.c);
  add('paper:'+q.gsm,q.sheets*qty,`Бумага ${q.gsm} г`,'лист');
  if(q.coverSheets){ add('card:'+q.c.card,q.coverSheets*qty*(q.coverBig?2:1),`Картон ${q.c.card} г`,'лист'); if(q.c.lam&&q.c.lam!=='none') add('lam',q.coverSheets*qty*(q.coverBig?2:1),'Плёнка для ламинации','шт'); }
  const b=q.bind, cb=q.c.binding;
  if(cb==='spiral'&&b.d) add('spiral:'+b.d,qty,`Пружина ${b.d} мм`,'шт');
  if(cb==='wireo'&&b.d) add('wireo:'+b.d,qty,`Wire-O ${String(b.d).replace('.',',')} мм`,'шт');
  if(cb==='rings'&&b.d) add('ring:'+b.d,qty*b.n,`Кольца ${b.d} мм`,'шт');
  if(cb==='disc'&&b.d) add('disc:'+b.d,qty*b.n,`Диски ${b.d} мм`,'шт');
  if(cb==='staple') add('staple',qty*b.n,'Скобы','шт');
  if(cb==='perfect') add('glue',qty*Math.max(4,e*q.spine*0.012),'Клей','г');
  if(cb==='sewn') add('thread',qty*Math.max(1,q.sheets*e*2/1000),'Нитки','м');
  const x=q.c.extras||{}; if(x.elastic) add('elastic',qty,'Резинка','шт'); if(x.ribbon) add('ribbon',qty*(q.h*1.35+40)/1000,'Ляссе','м'); if(x.pocket) add('pocket',qty,'Кармашек','шт'); if(x.pack) add('pack',qty,'Упаковка','шт');
  return u; }
function deduct(j){ if(j.ded) return null; const L=live(j), used=[], miss=[]; usage(j.cfg,L.qty).forEach(u=>{ const m=findMat(u.key); if(!m){ miss.push(u.label); return; } const n=Math.min(u.n,Math.max(0,m.qty)); m.qty=r2(m.qty-u.n); used.push({id:m.id,n:u.n,name:m.name}); if(m.qty<0) m.qty=0, used[used.length-1].n=n; });
  j.ded={ts:Date.now(),items:used,miss}; return j.ded; }
function restore(j){ if(!j.ded) return; const mats=S().mats; (j.ded.items||[]).forEach(it=>{ const m=mats.find(x=>x.id===it.id); if(m) m.qty=r2(m.qty+it.n); }); j.ded=null; }
const lowMats=()=>S().mats.filter(m=>MATKEY(m.key)[0]!=='x'&&num(m.qty)<=num(m.min));
/* needs of jobs that have not been bound yet vs stock */
function pending(){ const need={}; jobsLive().forEach(j=>{ if(j.ded||SIDX[j.stage]>=SIDX.bind) return; usage(j.cfg,live(j).qty).forEach(u=>{ const m=findMat(u.key), id=m?m.id:'?'+u.key; (need[id]=need[id]||{m,label:u.label,unit:u.unit,n:0}).n+=u.n; }); }); return need; }
function shopList(){ const need=pending(), out=[], seen=new Set();
  S().mats.forEach(m=>{ const nd=need[m.id]?need[m.id].n:0, after=num(m.qty)-nd; if(after<=num(m.min)){ seen.add(m.id); const buy=Math.max(1,Math.ceil(num(m.min)*2-after)); out.push({m,name:m.name,unit:m.unit,have:num(m.qty),min:num(m.min),need:r2(nd),buy,cost:buy*num(m.cost)}); } });
  Object.entries(need).forEach(([id,x])=>{ if(!x.m) out.push({m:null,name:x.label+' — нет на складе',unit:x.unit,have:0,min:0,need:r2(x.n),buy:Math.ceil(x.n),cost:0}); });
  return out; }

/* stage changes: checklist, history, order status, materials */
function checklist(j){ const c=j.cfg||{}, b=bindPart(c), ex=c.extras||{}, pr=KS.printer?KS.printer():{};
  const manual=pr&&pr.id&&!/gx/i.test(pr.id);
  return {layout:['Проверить формат, поля и нумерацию','Обложка согласована с клиентом',c.title?`Надпись на обложке: «${c.title}»`:'Имя / год на обложке проверены'],
    block:['Пробный лист: поля и плотность',+c.sides===1?'Печать с одной стороны':manual?'Ручной дуплекс: сначала лицевые, затем перевернуть пачку':'Автодуплекс по длинному краю',`Посчитать листы: ${quote(c).sheets*live(j).qty}`],
    cover:[`Картон ${c.card||300} г в задний лоток`,c.lam&&c.lam!=='none'?`Ламинация ${LAMN[c.lam].toLowerCase()}`:'Без ламинации — проверить, что краска высохла','Совместить лицо и оборот'],
    cut:['Подрезать блок в размер','Обложку в размер',ex.corners?'Скруглить углы':'Проверить углы и прямоугольность'],
    bind:[c.binding==='spiral'||c.binding==='wireo'?`Перфорация, шаг ${c.binding==='wireo'?(b.pitch||'3:1'):'4:1'}`:c.binding==='staple'?'Фальцовка тетрадей':c.binding==='perfect'?'Торшон / прорезка корешка':c.binding==='sewn'?'Проколоть тетради':'Пробить отверстия',b.label?b.label:'Переплёт','Проверить, что страницы листаются'],
    pack:[ex.elastic?'Установить резинку':'Чистота обложки',ex.ribbon?'Вклеить ляссе':'Вложить визитку',ex.pack?'Упаковать в пакет':'Наклейка с номером заказа'],
    ready:['Сообщить клиенту, что готово'], out:['Оплата получена полностью']}[j.stage]||[]; }
function setStage(j,stage,opt){ opt=opt||{}; if(!(stage in SIDX)||j.stage===stage) return false; const from=j.stage, s=S(); j.stage=stage; j.upd=Date.now(); (j.hist=j.hist||[]).push([stage,Date.now()]); if(j.hist.length>40) j.hist.splice(0,j.hist.length-40);
  let msg='';
  if(SIDX[stage]>=SIDX.bind&&!j.ded){ const d=deduct(j); if(d){ msg=d.items.length?`Списано со склада: ${d.items.length} ${plural(d.items.length,'позиция','позиции','позиций')}`:''; if(d.miss.length) msg+=(msg?'. ':'')+'Нет на складе: '+d.miss.join(', ');
      const low=d.items.map(it=>s.mats.find(m=>m.id===it.id)).filter(m=>m&&num(m.qty)<=num(m.min)); if(low.length) msg+=(msg?'. ':'')+'Заканчивается: '+low.map(m=>m.name).join(', '); } }
  else if(SIDX[stage]<SIDX.bind&&j.ded){ restore(j); msg='Материалы возвращены на склад'; }
  if(!opt.fromOrder){ const o=ordOf(j), os=STAGES[SIDX[stage]][2]; if(o&&o.status!=='cancel'&&o.status!==os) o.status=os; }
  if(msg&&!opt.quiet) setTimeout(()=>KS.toast(msg),opt.fromOrder?0:350);
  return true; }
/* pull status changes made elsewhere (Заказы, Сводка…) into the jobs */
function sync(){ let ch=false; const s=KS.store('nbshop'); if(!s||!Array.isArray(s.jobs)) return false;
  s.jobs.forEach(j=>{ if(!j||!j.orderId) return; const o=ordOf(j); if(!o){ if(!j.gone){ j.gone=true; ch=true; } return; } if(j.gone){ j.gone=false; ch=true; }
    if(o.status==='cancel'||!SIDX.hasOwnProperty(j.stage)) return; const want=STAGES[SIDX[j.stage]][2]; if(o.status===want) return;
    const to=o.status==='done'?'out':o.status==='ready'?'ready':o.status==='new'?'layout':o.status==='work'?(SIDX[j.stage]<SIDX.block?'block':'pack'):null;
    if(to&&setStage(j,to,{fromOrder:true,quiet:true})) ch=true; });
  return ch; }
KS.on('render',()=>{ try{ if(sync()) KS.save(); }catch(e){ console.error('[nbshop] sync',e); } });

/* create an order + production job */
async function createJob(f){ const s=S(), c=Object.assign({},DEF_CALC,clone(f.cfg)); c.extras=Object.assign({},DEF_CALC.extras,c.extras||{}); delete c.src; const qty=Math.max(1,Math.round(num(f.qty,1))); c.qty=qty;
  const q=quote(c), price=f.price!=null&&f.price!==''?num(f.price):q.total, b=q.bind;
  const o=newOrder({client:String(f.client||'').trim(),phone:String(f.phone||'').trim(),product:cfgName(c),qty,paper:`${q.gsm} г, ${q.sides===2?'двусторонняя':'односторонняя'}`,sides:q.sides,
    fin:[b.d?b.label:BINDN[c.binding],finLine(c)].filter(Boolean).join(', '),price,cost:Math.round(q.totalCost),paid:Math.max(0,num(f.paid)),status:'new',due:f.due||'',note:[cfgLine(c),f.note].filter(Boolean).join('\n')});
  if(typeof syncClient==='function') try{ syncClient(o); }catch(_){}
  const j={id:KS.uid('nj'),orderId:o.id,no:o.no,date:today(),client:o.client,phone:o.phone,qty,due:o.due,price,cost:Math.round(q.totalCost),unit:q.unit,cfg:c,src:f.src||'calc',stage:'layout',checks:{},hist:[['layout',Date.now()]],ded:null,note:f.note||'',upd:Date.now(),snap:false,cover:false};
  s.jobs.unshift(j);
  if(f.snap){ try{ await KS.idb.set('nbs:snap:'+j.id,f.snap,'kv'); j.snap=true; }catch(e){ console.error('[nbshop] snap',e); } }
  if(f.withCover!==false&&KS.nbCover&&typeof KS.nbCover.snapshot==='function'){ try{ const cs=KS.nbCover.snapshot(); if(cs){ await KS.idb.set('nbs:csnap:'+j.id,clone(cs),'kv'); j.csnap=true; } }catch(e){ console.error('[nbshop] cover snapshot',e); } }
  if(f.withCover!==false){ try{ const cv=await KS.idb.get('nb:cover','files'); if(cv&&(cv.front||cv.wrap)){ await KS.idb.set('nbs:cov:'+j.id,cv,'files'); j.cover=true; const t=await thumbOf(cv.front||cv.wrap,cv.wrap&&!cv.front); if(t){ await KS.idb.set('nbs:covt:'+j.id,t,'files'); THUMBS[j.id]=t; } } }catch(e){ console.error('[nbshop] cover',e); } }
  if(typeof update==='function') update(); else KS.save();
  return {o,j}; }
const THUMBS={};
function thumbOf(src,wrap){ return new Promise(res=>{ if(!src) return res(null); const im=new Image(); im.onload=()=>{ try{ let sx=0,sw=im.naturalWidth; if(wrap){ sx=sw/2; sw=sw/2; } const k=Math.min(1,160/Math.max(sw,im.naturalHeight)); const cv=document.createElement('canvas'); cv.width=Math.max(1,Math.round(sw*k)); cv.height=Math.max(1,Math.round(im.naturalHeight*k)); cv.getContext('2d').drawImage(im,sx,0,sw,im.naturalHeight,0,0,cv.width,cv.height); res(cv.toDataURL('image/jpeg',.8)); }catch(_){ res(null); } }; im.onerror=()=>res(null); im.src=src; }); }
let thumbsLoaded=false;
async function loadThumbs(){ if(thumbsLoaded) return; thumbsLoaded=true; for(const j of jobsAll()){ if(j.cover&&!THUMBS[j.id]){ try{ const t=await KS.idb.get('nbs:covt:'+j.id,'files'); if(t) THUMBS[j.id]=t; }catch(_){} } } if(Object.keys(THUMBS).length) redraw(); }

/* reopen a job's notebook in the builder (agent A's KS.nb.load) */
async function openJob(j,tab){ const nb=NB(); if(!nb||typeof nb.load!=='function'){ KS.toast('Модуль «Блокнот» не подключён — открыть макет нельзя'); return false; }
  let snap=null; if(j.snap){ try{ snap=await KS.idb.get('nbs:snap:'+j.id,'kv'); }catch(_){} }
  if(!snap){ const base=nbSnap()||{}, c=j.cfg||{}; snap=Object.assign(base,{fmt:c.fmt,w:c.w,h:c.h,pages:c.pages,paperGsm:c.gsm,binding:c.binding,sides:+c.sides===1?1:2}); if(c.title) snap.title=c.title; }
  try{ nb.load(clone(snap)); }catch(e){ console.error('[nbshop] load',e); KS.toast('Не удалось открыть блокнот'); return false; }
  let coverDone=false; if(j.csnap&&KS.nbCover&&typeof KS.nbCover.load==='function'){ try{ const cs=await KS.idb.get('nbs:csnap:'+j.id,'kv'); if(cs){ await KS.nbCover.load(cs); coverDone=true; } }catch(e){ console.error('[nbshop] cover load',e); } }
  if(j.cover&&!coverDone){ try{ const cv=await KS.idb.get('nbs:cov:'+j.id,'files'); if(cv){ await KS.idb.set('nb:cover',cv,'files'); KS.emit('nbCoverChanged',cv); } }catch(_){} }
  S().last=j.id; KS.save(); openNbTab(tab||'block'); return true; }
function nbTabs(){ return [...document.querySelectorAll('[data-kssub^="notebook:"]')].map(b=>({id:b.dataset.kssub.split(':')[1],t:b.textContent.trim()})).filter(x=>x.id!=='nbshop'); }
function openNbTab(kind){ const T=nbTabs(), re=kind==='print'?/печат/i:kind==='cover'?/облож/i:/блок/i; const t=T.find(x=>re.test(x.t))||(kind==='block'?T[0]:null);
  if(t){ KS.show('notebook',t.id); return true; } KS.toast(kind==='print'?'Вкладка «Печать» блокнота не найдена':'Конструктор блокнота не подключён'); return false; }

/* ================= UI shell ================= */
const VIEWS=[['dash','Сводка',IC.dash],['board','Заказы и производство',IC.board],['calc','Прайс и расчёт',IC.calc],['mats','Материалы',IC.box],['spine','Пружина и переплёт',IC.coil],['show','Витрина для клиента',IC.shop],['stats','Статистика',IC.chart]];
let boxEl=null, scrEl=null, lastSig='', drag=null;
const view=()=>{ const v=S().view; return VIEWS.some(x=>x[0]===v)?v:'dash'; };
function go(v,opt){ const s=S(); s.view=v; if(opt&&opt.filter!=null) s.board.filter=opt.filter; KS.save(); if(KS.active()&&KS.active().id==='nbshop'){ drawPanel(); drawScreen(); if(scrEl) scrEl.scrollTop=0; } else KS.show('notebook','nbshop'); }
const hd=(t,sub,acts)=>`<header class="nbs-hd"><div class="nbs-hdt"><h2>${t}</h2>${sub?`<p>${sub}</p>`:''}</div>${acts?`<div class="nbs-hda">${acts}</div>`:''}</header>`;
const btn=(a,label,ic,cls,attrs)=>`<button class="btn${cls?' '+cls:''}" data-nba="${a}"${attrs||''}>${ic?I(ic):''}<span>${label}</span></button>`;
function dueChip(due,stage){ if(!due) return ''; const d=dayDiff(due,today()); if(stage==='out') return `<span class="nbs-due">до ${E(fmtDay(due))}</span>`;
  const cls=d<0?'bad':d===0?'warn':d<=2?'soon':''; const t=d<0?`${fmtDay(due)} · −${-d} дн`:d===0?'сегодня':d===1?'завтра':`до ${fmtDay(due)}`; return `<span class="nbs-due ${cls}" title="Срок: ${E(due)}">${cls?I(IC.clock):''}${E(t)}</span>`; }
const stBadge=st_=>`<span class="nbs-st" style="--c:${SCOL[st_]||'#888'}">${E(SNAME[st_]||st_)}</span>`;

/* ---------- side panel ---------- */
function drawPanel(){ if(!boxEl) return; const v=view();
  boxEl.innerHTML=`<div class="nbsp nbs-root"><nav class="nbs-nav">${VIEWS.map(([id,t,ic])=>`<button class="nbs-navb${id===v?' on':''}" data-nba="go:${id}">${I(ic)}<span>${t}</span>${id==='mats'&&lowMats().length?`<i class="nbs-dot">${lowMats().length}</i>`:''}${id==='board'?boardCount():''}</button>`).join('')}</nav><div class="nbs-pv">${(PANEL[v]||(()=>''))()}</div></div>`; }
function boardCount(){ const n=jobsLive().filter(j=>SIDX[j.stage]<SIDX.ready).length; return n?`<i class="nbs-cnt">${n}</i>`:''; }
const PANEL={}, SCREEN={};
function drawScreen(){ if(!scrEl) return; const v=view(); lastSig=sig();
  let h=''; try{ h=SCREEN[v](); }catch(e){ console.error('[nbshop] view '+v,e); h=`<div class="ks-empty">Ошибка: ${E(e.message)}</div>`; }
  const sl=scrEl.querySelector('.nbs-board'), keep=sl?sl.scrollLeft:0;
  scrEl.innerHTML=`<div class="nbs nbs-root" data-nbv="${v}">${h}</div>`; const nb=scrEl.querySelector('.nbs-board'); if(nb&&keep) nb.scrollLeft=keep;
  if(v==='calc') renderQuote(); loadThumbs(); }
function redraw(){ if(scrEl&&!scrEl.hidden&&KS.active()&&KS.active().id==='nbshop') drawScreen(); }
function sig(){ const s=S(); let h=view()+'|'+today()+'|'+s.jobs.length+'|'+s.mats.length+'|'+(s.board.filter||'');
  s.jobs.forEach(j=>{ const L=live(j); h+=j.id+j.stage+L.status+L.price+L.client+L.due+L.qty+(j.ded?1:0)+JSON.stringify(j.checks||{}).length+'|'; }); s.mats.forEach(m=>h+=m.qty+','+m.min+';'); return h; }
const busy=()=>{ const a=document.activeElement; return !!(drag&&drag.on)||!!(a&&scrEl&&scrEl.contains(a)&&/INPUT|SELECT|TEXTAREA/.test(a.tagName)); };

KS.tab({id:'nbshop',group:'notebook',groupTitle:'Блокноты',groupIcon:I(IC.nb),icon:I(IC.nb),title:'Производство',seg:'Производство',app:'print',before:'prep',screen:true,
  render(box,o){ boxEl=box; scrEl=o.screen; const w=document.querySelector('section.work'); if(w&&scrEl&&scrEl.parentElement!==w) w.appendChild(scrEl);
    if(sync()) KS.save();
    if(o.reason==='show'||!box.querySelector('.nbsp')){ drawPanel(); drawScreen(); return; }
    if(sig()!==lastSig&&!busy()){ drawScreen(); const a=document.activeElement; if(!(a&&box.contains(a)&&/INPUT|SELECT|TEXTAREA/.test(a.tagName))) drawPanel(); } }});
/* «Производство» is the landing sub-tab of «Блокноты»: first in the segmented control, opened by default */
(function pinFirst(){ const p=document.querySelector('.kspanel[data-panel="ks-notebook"]'); if(!p) return;
  const fix=()=>{ const seg=p.querySelector(':scope>.ksseg'), b=seg&&seg.querySelector('[data-kssub="notebook:nbshop"]'); if(b&&seg.firstElementChild!==b) seg.insertBefore(b,seg.firstElementChild); };
  new MutationObserver(fix).observe(p,{childList:true}); fix(); })();
KS.on('boot',()=>{ try{ const s=S(); if(s.land!==false&&st.ui){ st.ui.ksSub=Object.assign({},st.ui.ksSub,{notebook:'nbshop'}); } }catch(e){ console.error(e); } });
KS.on('nbChanged',()=>{ if(view()==='calc'&&S().calc.src==='nb'&&KS.active()&&KS.active().id==='nbshop'){ renderQuote(); const p=boxEl&&boxEl.querySelector('.nbs-nbsum'); if(p) p.outerHTML=nbSummary(); } });

/* ================= Сводка (dashboard) ================= */
function kpis(){ const J=jobsLive(), m=today().slice(0,7); const r={work:0,workQ:0,ready:0,readyQ:0,over:0,rev:0,paid:0,cnt:0,sumP:0,sumQ:0,low:lowMats().length};
  J.forEach(j=>{ const L=live(j), i=SIDX[j.stage]; if(i<SIDX.ready){ r.work++; r.workQ+=L.qty; if(L.due&&L.due<today()) r.over++; } else if(j.stage==='ready'){ r.ready++; r.readyQ+=L.qty; }
    if(String(j.date).startsWith(m)){ r.rev+=L.price; r.paid+=L.paid; r.cnt++; } r.sumP+=L.price; r.sumQ+=L.qty; });
  r.avg=r.sumQ?Math.round(r.sumP/r.sumQ):0; return r; }
SCREEN.dash=()=>{ const k=kpis(), s=S(), J=jobsLive(), last=jobsAll().find(j=>j.id===s.last)||jobsAll()[0], nb=NB();
  const kp=(id,label,val,sub,ic,cls,a)=>`<button class="nbs-kpi${cls?' '+cls:''}" data-kpi="${id}" data-nba="${a}"><span class="nbs-kic">${I(ic)}</span><small>${label}</small><b data-nbv="${typeof val==='number'?val:''}">${typeof val==='number'&&/rev|avg/.test(id)?M(val):E(val)}</b><i>${sub}</i></button>`;
  const qa=(a,ic,t,sub,dis)=>`<button class="nbs-qa" data-nba="${a}"${dis?' disabled':''}><span class="nbs-qic">${I(ic)}</span><b>${t}</b><small>${sub}</small></button>`;
  const pipe=STAGES.slice(0,7).map(([id,n,,c])=>{ const L=J.filter(j=>j.stage===id), q=L.reduce((a,j)=>a+live(j).qty,0); return `<button class="nbs-pipe-i" data-nba="stage:${id}" style="--c:${c}"><b>${L.length}</b><span>${n}</span><small>${q?q+' шт.':'—'}</small></button>`; }).join('');
  const low=lowMats().slice(0,5);
  const rec=jobsAll().slice(0,7);
  return hd('Производство блокнотов',`${new Date().toLocaleDateString('ru-RU',{weekday:'long',day:'numeric',month:'long'})} · типография внутри типографии`,btn('neworder','Новый заказ',IC.plus,'primary'))+
   `<div class="nbs-kpis">${kp('work','В работе',k.work,`${k.workQ} шт.${k.over?` · <em class="bad">просрочено ${k.over}</em>`:''}`,IC.layers,k.over?'warn':'','stage:')}${kp('ready','Готовы к выдаче',k.ready,k.readyQ?k.readyQ+' шт. ждут клиентов':'пока нет',IC.check,k.ready?'ok':'','stage:ready')}${kp('rev','Выручка за месяц',k.rev,`${k.cnt} ${plural(k.cnt,'заказ','заказа','заказов')} · оплачено ${M(k.paid)}`,IC.coin,'','go:stats')}${kp('avg','Средняя цена блокнота',k.avg,k.sumQ?`по ${k.sumQ} шт.`:'нет продаж',IC.tag,'','go:calc')}${kp('low','Материалы на исходе',k.low,k.low?'нужно докупить':'всё в наличии',IC.box,k.low?'bad':'ok','go:mats')}</div>
   <div class="nbs-qas">${qa('nbnew',IC.nb,'Новый блокнот',nb?'конструктор страниц':'модуль не подключён',!nb&&!nbTabs().length)}${qa('nblast',IC.open,'Открыть последний',last?`№ ${live(last).no} · ${E(live(last).client||'без клиента')}`:'заказов пока нет',!last)}${qa('queue',IC.print,'Очередь печати',`${J.filter(j=>j.stage==='block'||j.stage==='cover').length} в печати`)}${qa('go:calc',IC.calc,'Расчёт цены','прайс и калькулятор')}${qa('showfull',IC.shop,'Витрина','показать клиенту')}${qa('go:spine',IC.coil,'Подбор пружины','по числу листов')}</div>
   <section class="nbs-sec"><div class="nbs-sech"><h3>Этапы производства</h3><button class="btn sm" data-nba="go:board">Доска ${I(IC.right)}</button></div><div class="nbs-pipe">${pipe}</div></section>
   <div class="nbs-g2"><section class="nbs-sec"><div class="nbs-sech"><h3>Последние заказы</h3>${rec.length?`<button class="btn sm" data-nba="go:board">Все ${I(IC.right)}</button>`:''}</div>${rec.length?`<div class="nbs-rec">${rec.map(j=>{ const L=live(j); return `<button class="nbs-reci${L.cancel?' nbs-cancel':''}" data-nba="job:${j.id}" style="--c:${SCOL[j.stage]}"><span class="nbs-recn">№ ${E(L.no)}</span><span class="nbs-recm"><b>${E(L.client||'Без клиента')}</b><small>${E(cfgLine(j.cfg))} · ${L.qty} шт.</small></span><span class="nbs-recs">${L.cancel?'<span class="ks-badge bad">отменён</span>':stBadge(j.stage)}${dueChip(L.due,j.stage)}</span><b class="nbs-recp">${M(L.price)}</b></button>`; }).join('')}</div>`:`<div class="ks-empty">Заказов блокнотов пока нет.<br>Соберите блокнот в конструкторе или посчитайте цену — затем «Новый заказ».<div style="margin-top:10px">${btn('neworder','Новый заказ',IC.plus,'primary sm')}</div></div>`}</section>
   <section class="nbs-sec"><div class="nbs-sech"><h3>Материалы на исходе</h3><button class="btn sm" data-nba="go:mats">Склад ${I(IC.right)}</button></div>${low.length?`<ul class="nbs-low">${low.map(m=>`<li><span>${E(m.name)}</span><b class="${num(m.qty)<=0?'bad':''}">${r2(m.qty)} ${E(m.unit)}</b><small>мин. ${r2(m.min)}</small></li>`).join('')}</ul><button class="btn sm" data-nba="printshop">${I(IC.cart)}<span>Список покупок</span></button>`:`<div class="nbs-okline">${I(IC.check)} Всё в наличии — запасов выше минимума.</div>`}</section></div>`; };
PANEL.dash=()=>`<div class="card"><div class="hd2">Быстро</div><button class="btn primary nbs-wide" data-nba="neworder">${I(IC.plus)}<span>Новый заказ блокнота</span></button><button class="btn nbs-wide" data-nba="showfull">${I(IC.full)}<span>Витрина на весь экран</span></button><p class="hint">Здесь — бизнес-часть раздела: цены, заказы, этапы, склад. Сам блокнот собирается во вкладках ${nbTabs().map(t=>'«'+E(t.t)+'»').join(', ')||'конструктора'}.</p></div>`;

/* ================= Заказы и производство (board) ================= */
const FILTERS=[['','Все'],['print','В печати'],['over','Просроченные'],['soon','Срок ≤ 2 дн']];
function boardJobs(){ const s=S(), q=String(s.board.q||'').toLowerCase().trim(), f=s.board.filter||'', t=today();
  return jobsLive().filter(j=>{ const L=live(j); if(q&&!(`${L.no} ${L.client} ${L.phone} ${cfgLine(j.cfg)} ${j.note||''}`.toLowerCase().includes(q))) return false;
    if(f==='print') return j.stage==='block'||j.stage==='cover'; if(f==='over') return L.due&&L.due<t&&SIDX[j.stage]<SIDX.out; if(f==='soon') return L.due&&dayDiff(L.due,t)<=2&&SIDX[j.stage]<SIDX.ready; return true; }); }
function card(j){ const L=live(j), i=SIDX[j.stage], items=checklist(j), ck=(j.checks||{})[j.stage]||[], done=items.filter((_,k)=>ck[k]).length, nx=STAGES[i+1], pv=STAGES[i-1], d=L.due?dayDiff(L.due,today()):99;
  return `<article class="nbs-card${d<0&&i<SIDX.out?' over':d<=1&&i<SIDX.ready?' soon':''}" data-nbjob="${j.id}" style="--c:${SCOL[j.stage]}" tabindex="0">
   <div class="nbs-ct"><b>№ ${E(L.no)}</b>${dueChip(L.due,j.stage)}</div>
   <div class="nbs-cbody"><div class="nbs-cmain"><div class="nbs-cc">${E(L.client||'Без клиента')}</div><div class="nbs-cp">${E(cfgLine(j.cfg))}</div></div>${THUMBS[j.id]?`<img class="nbs-cth" src="${THUMBS[j.id]}" alt="">`:`<span class="nbs-cth nbs-cth0" style="--r:${(+j.cfg.w||148)/(+j.cfg.h||210)}"></span>`}</div>
   <div class="nbs-cm"><span>× ${L.qty} шт.</span>${L.price-L.paid>0&&i>=SIDX.ready?`<span class="ks-badge warn">долг ${M(L.price-L.paid)}</span>`:''}<b>${M(L.price)}</b></div>
   ${j.gone?'<div class="nbs-cwarn">Заказ удалён в «Заказах»</div>':''}
   ${items.length&&i<SIDX.out?`<div class="nbs-chk">${items.map((t,k)=>`<label class="nbs-ci${ck[k]?' on':''}"><input type="checkbox" data-nba="chk:${j.id}:${k}"${ck[k]?' checked':''}><span>${E(t)}</span></label>`).join('')}<div class="nbs-prog"><i style="width:${items.length?Math.round(done/items.length*100):0}%"></i></div></div>`:''}
   <div class="nbs-cb"><button class="btn sm" data-nba="open:${j.id}" title="Открыть блокнот в конструкторе">${I(IC.open)}<span>Открыть блокнот</span></button><button class="btn sm" data-nba="print:${j.id}" title="Открыть печать блокнота">${I(IC.print)}<span>Печать</span></button></div>
   <div class="nbs-cn">${pv?`<button class="btn sm nbs-prev" data-nba="mv:${j.id}:${pv[0]}" title="Назад: ${pv[1]}" aria-label="Назад: ${pv[1]}">${I(IC.left)}</button>`:''}${nx?`<button class="btn sm nbs-next${done===items.length&&items.length?' primary':''}" data-nba="mv:${j.id}:${nx[0]}"><span>${nx[1]}</span>${I(IC.right)}</button>`:`<span class="nbs-fin">${I(IC.check)} Выдан</span>`}</div></article>`; }
SCREEN.board=()=>{ const s=S(), J=boardJobs(), all=jobsLive(), over=all.filter(j=>{ const L=live(j); return L.due&&L.due<today()&&SIDX[j.stage]<SIDX.out; }).length, showAll=!!s.board.allOut, t30=addDays(today(),-30);
  const cols=STAGES.map(([id,n,,c])=>{ let L=J.filter(j=>j.stage===id); let more=0; if(id==='out'&&!showAll){ const k=L.filter(j=>{ const h=(j.hist||[]).filter(x=>x[0]==='out').pop(); return !h||iso(h[1])>=t30; }); more=L.length-k.length; L=k; }
    const sum=L.reduce((a,j)=>a+live(j).price,0);
    return `<section class="nbs-col" data-nbst="${id}" style="--c:${c}"><div class="nbs-colh"><i></i><b>${n}</b><span class="nbs-n">${L.length}</span><small>${sum?M(sum):''}</small></div><div class="nbs-list">${L.map(card).join('')||`<div class="nbs-colempty">${id==='layout'?'Новые заказы появятся здесь':'Пусто'}</div>`}${more?`<button class="btn sm nbs-wide" data-nba="allout">Показать ещё ${more}</button>`:''}</div></section>`; }).join('');
  return hd('Заказы и производство',`${all.filter(j=>SIDX[j.stage]<SIDX.ready).length} в работе · ${all.filter(j=>j.stage==='ready').length} готово${over?` · <em class="bad">просрочено ${over}</em>`:''}`,btn('neworder','Новый заказ',IC.plus,'primary'))+
   `<div class="nbs-fl">${FILTERS.map(([id,n])=>`<button class="nbs-chip${(s.board.filter||'')===id?' on':''}" data-nba="filter:${id}">${n}</button>`).join('')}<span class="ks-sp"></span><span class="hint nbs-dnd">Перетащите карточку или нажмите кнопку этапа</span></div>
   ${all.length?`<div class="nbs-board">${cols}</div>`:`<div class="ks-empty nbs-bigempty">${I(IC.board)}<b>Доска пуста</b><span>Создайте заказ: «Новый заказ» возьмёт текущий блокнот или расчёт из калькулятора.</span>${btn('neworder','Новый заказ',IC.plus,'primary')}</div>`}`; };
PANEL.board=()=>{ const s=S(); return `<div class="card"><div class="hd2">Поиск</div><input type="text" class="nbs-in" data-nbk="board|q" value="${E(s.board.q||'')}" placeholder="№, клиент, телефон, формат"><button class="btn primary nbs-wide" data-nba="neworder">${I(IC.plus)}<span>Новый заказ</span></button></div>
  <div class="card"><div class="hd2">Как работать</div><p class="hint">Каждая карточка — заказ из «Заказов». Этап меняет статус заказа: Макет → «Новый», печать … упаковка → «В работе», Готов → «Готов», Выдан → «Выдан». На этапе «Переплёт» материалы списываются со склада автоматически.</p><p class="hint">На iPad используйте кнопки этапов; на Mac можно перетаскивать карточки мышью.</p></div>`; };

/* ================= Прайс и расчёт ================= */
const opt=(L,v)=>L.map(([k,n])=>`<option value="${E(k)}"${String(k)===String(v)?' selected':''}>${E(n)}</option>`).join('');
const fld=(label,inner,cls)=>`<label class="f${cls?' '+cls:''}">${label}${inner}</label>`;
const inp=(k,v,attrs)=>`<input class="nbs-in" data-nbk="${k}" value="${E(v)}" ${attrs||'type="number" min="0"'}>`;
function nbSummary(){ const nb=NB(), s=nb?nbSnap():null, c=s?snapCfg(s):null;
  if(!nb) return `<div class="nbs-nbsum nbs-warnbox">${I(IC.alert)}<span>Конструктор блокнота не подключён. Переключитесь на «Вручную».</span></div>`;
  if(!c) return `<div class="nbs-nbsum nbs-warnbox">${I(IC.alert)}<span>Не удалось прочитать текущий блокнот.</span></div>`;
  const full=Object.assign({},S().calc,c); return `<div class="nbs-nbsum"><b>${E(s.title||'Текущий блокнот')}</b><span>${E(cfgLine(full))}</span><span>${E(full.gsm)} г · ${+full.sides===1?'односторонняя':'двусторонняя'} печать</span></div>`; }
PANEL.calc=()=>{ const c=S().calc, man=c.src!=='nb'||!NB();
  return `<div class="card"><div class="hd2">Что считаем</div><div class="seg nbs-seg"><button data-nba="src:nb"${c.src==='nb'?' class="on"':''}>Текущий блокнот</button><button data-nba="src:manual"${c.src!=='nb'?' class="on"':''}>Вручную</button></div>
   ${c.src==='nb'?nbSummary():''}
   ${man?`${fld('Формат',`<select class="nbs-in" data-nbk="calc|fmt">${opt([...FORMATS.map(f=>[f.id,`${f.n} — ${f.w}×${f.h}`]),['custom','Свой размер']],FORMATS.some(f=>f.id===c.fmt)?c.fmt:'custom')}</select>`)}
   <div class="row2">${fld('Ширина, мм',inp('calc|w',c.w))}${fld('Высота, мм',inp('calc|h',c.h))}</div>
   <div class="row2">${fld('Страниц',inp('calc|pages',c.pages,'type="number" min="1" step="2"'))}${fld('Бумага, г',`<select class="nbs-in" data-nbk="calc|gsm">${opt(P().paper.map(p=>[p.gsm,p.gsm+' г']),c.gsm)}</select>`)}</div>
   <div class="row2">${fld('Печать',`<select class="nbs-in" data-nbk="calc|sides">${opt([[2,'Двусторонняя'],[1,'Односторонняя']],c.sides)}</select>`)}${fld('Переплёт',`<select class="nbs-in" data-nbk="calc|binding">${opt(BIND,c.binding)}</select>`)}</div>`:''}
   ${fld('Заливка страниц',`<select class="nbs-in" data-nbk="calc|cov">${opt(COV.map(([k,n])=>[k,n+(k==='light'?' (линейка, клетка)':k==='medium'?' (ежедневник)':k==='heavy'?' (фото, фон)':'')]),c.cov)}</select>`)}</div>
   <div class="card"><div class="hd2">Обложка и отделка</div><div class="row2">${fld('Картон',`<select class="nbs-in" data-nbk="calc|card">${opt([['none','Без обложки'],...P().card.map(p=>[p.gsm,p.gsm+' г'])],c.card)}</select>`)}${fld('Печать обложки',`<select class="nbs-in" data-nbk="calc|coverSides">${opt([[1,'Снаружи'],[2,'С двух сторон']],c.coverSides)}</select>`)}</div>
   ${fld('Ламинация',`<select class="nbs-in" data-nbk="calc|lam">${opt(LAM,c.lam)}</select>`)}
   <div class="nbs-chks">${EXTRA.map(([k,n])=>`<label class="chk nbs-chkl"><input type="checkbox" data-nbk="calc|extras|${k}"${c.extras[k]?' checked':''}><span>${n}</span><small>+${M(extraPrice(k))}</small></label>`).join('')}</div></div>
   <div class="card"><div class="hd2">Тираж</div><div class="nbs-qty"><button class="btn" data-nba="qty:-1" aria-label="Меньше">−</button>${inp('calc|qty',c.qty,'type="number" min="1" inputmode="numeric"')}<button class="btn" data-nba="qty:1" aria-label="Больше">+</button></div>
   <div class="nbs-qchips">${[1,5,10,25,50,100].map(n=>`<button class="nbs-chip${+c.qty===n?' on':''}" data-nba="qtyset:${n}">${n}</button>`).join('')}</div>
   <button class="btn primary nbs-wide" data-nba="neworder">${I(IC.plus)}<span>Оформить заказ</span></button><button class="btn nbs-wide" data-nba="printprice">${I(IC.print)}<span>Прайс для клиентов (A4)</span></button></div>`; };
function quoteHTML(q){ const groups=[...new Set(q.lines.map(l=>l.g))], Pr=P();
  const rows=groups.map(g=>`<tr class="nbs-qg"><th colspan="3">${E(g)}</th></tr>`+q.lines.filter(l=>l.g===g).map(l=>`<tr><td>${E(l.n)}</td><td class="num">${l.min?fn(l.min)+' мин':''}</td><td class="num">${l.cost?M(l.cost):'—'}</td></tr>`).join('')).join('');
  return `<div class="nbs-qhero"><div><small>Цена за 1 шт.</small><b data-nbq="unit">${M(q.unit)}</b>${q.disc?`<span class="ks-badge ok">скидка ${q.disc}% за тираж</span>`:''}</div><div><small>Итого × ${q.qty}</small><b data-nbq="total">${M(q.total)}</b></div><div><small>Прибыль</small><b class="${q.profit>=0?'ok':'bad'}" data-nbq="profit">${M(q.profit)}</b><span class="nbs-mut">маржа ${q.margin}%</span></div></div>
   <div class="nbs-qfacts"><span>${I(IC.layers)} ${q.sheets} ${plural(q.sheets,'лист','листа','листов')} A4 на блок</span><span>${I(IC.coil)} блок ${String(q.spine).replace('.',',')} мм · ${E(q.bind.label)}</span><span>${I(IC.clock)} ${fn(q.min)} мин работы</span></div>
   ${q.bind.warn?`<div class="nbs-warnbox">${I(IC.alert)}<span>${E(q.bind.warn)}</span></div>`:''}
   <table class="ks-table nbs-qt"><thead><tr><th>На 1 блокнот</th><th class="num">Время</th><th class="num">Себест.</th></tr></thead><tbody>${rows}
   <tr class="nbs-qs"><td>Материалы</td><td></td><td class="num">${M(q.mat)}</td></tr><tr class="nbs-qs"><td>Работа: ${fn(q.min)} мин × ${M(Pr.lab.rate)}</td><td></td><td class="num">${M(q.labour)}</td></tr>
   <tr class="nbs-qs b"><td>Себестоимость 1 шт.</td><td></td><td class="num" data-nbq="cost">${M(q.unitCost)}</td></tr><tr class="nbs-qs"><td>Наценка ${num(Pr.markup)}%${q.disc?`, скидка ${q.disc}%`:''}, округление</td><td></td><td class="num">${M(q.unit)}</td></tr></tbody></table>
   <div class="nbs-vol"><div class="hd2">Цена за штуку по тиражу</div><div class="nbs-volg">${(Pr.disc||[]).map(([n])=>{ const x=quote(Object.assign({},q.c,{qty:+n}),Pr); return `<div${+n===discStep(q.qty)?' class="on"':''}><small>от ${n} шт.</small><b>${M(x.unit)}</b></div>`; }).join('')}</div></div>`; }
const discStep=qty=>{ let s=1; (P().disc||[]).forEach(([n])=>{ if(qty>=+n) s=+n; }); return s; };
function renderQuote(){ const el=scrEl&&scrEl.querySelector('#nbsQuote'); if(!el) return; try{ el.innerHTML=quoteHTML(quote(calcCfg())); }catch(e){ console.error('[nbshop] quote',e); el.innerHTML=`<div class="ks-empty">Ошибка расчёта: ${E(e.message)}</div>`; } }
const pin=(path,v,attrs)=>`<input class="nbs-in nbs-pin" data-nbp="${path}" value="${E(v)}" ${attrs||'type="number" min="0" step="any"'}>`;
function priceEditor(){ const Pr=P();
  const sec=(t,body,note)=>`<details class="nbs-pe" open><summary>${t}</summary>${note?`<p class="hint">${note}</p>`:''}${body}</details>`;
  const kv=(L)=>`<div class="nbs-kv">${L.map(([l,path,v,suf])=>`<label><span>${l}</span>${pin(path,v)}${suf?`<i>${suf}</i>`:''}</label>`).join('')}</div>`;
  return `<div class="nbs-pes">
   ${sec('Бумага блока — за лист A4',`<div class="nbs-kv">${Pr.paper.map((p,i)=>`<label><span>${pin('paper|'+i+'|gsm',p.gsm,'type="number" min="40" step="1" aria-label="Плотность"')}<em>г</em></span>${pin('paper|'+i+'|c',p.c)}<button class="btn sm icon" data-nba="pdel:paper:${i}" aria-label="Удалить">${I(IC.x)}</button></label>`).join('')}</div><button class="btn sm" data-nba="padd:paper">${I(IC.plus)}<span>Плотность</span></button>`)}
   ${sec('Печать — чернила за сторону A4',kv(COV.filter(c=>c[0]!=='none').map(([k,n])=>[n+' заливка','ink|'+k,Pr.ink[k]])),'Светлая — линейка, клетка, точки; средняя — ежедневник; плотная — фото и фоны (так же считается обложка).')}
   ${sec('Обложка — картон за лист A4 и ламинация',`<div class="nbs-kv">${Pr.card.map((p,i)=>`<label><span>Картон ${pin('card|'+i+'|gsm',p.gsm,'type="number" min="100" step="1" aria-label="Плотность"')}<em>г</em></span>${pin('card|'+i+'|c',p.c)}</label>`).join('')}</div>`+kv(LAM.filter(l=>l[0]!=='none').map(([k,n])=>['Ламинация: '+n.toLowerCase(),'lam|'+k,Pr.lam[k]])),'Обложка больше A4 считается на A3 (×2).')}
   ${sec('Пружина пластик — за кусок длиной 297 мм',`<div class="nbs-kv nbs-kv3">${SPIRAL_D.map(d=>`<label><span>${d} мм</span>${pin('spiral|'+d,Pr.spiral[d])}</label>`).join('')}</div>`,'Короче край — пропорционально дешевле.')}
   ${sec('Wire-O — за кусок длиной 297 мм',`<div class="nbs-kv nbs-kv3">${WIRE_D.map(([d,inch])=>`<label><span>${String(d).replace('.',',')} мм <em>${inch}</em></span>${pin('wireo|'+d,Pr.wireo[String(d)])}</label>`).join('')}</div>`)}
   ${sec('Переплёт — материал и минуты',`<div class="nbs-kv nbs-kvm">${BIND.map(([k,n])=>`<label><span>${n}<em>${k==='staple'?'за скобу':k==='rings'?'за кольцо':k==='disc'?'за диск':k==='perfect'?'клей на A5':k==='spiral'||k==='wireo'?'+ пружина':''}</em></span>${pin('bind|'+k+'|c',Pr.bind[k].c)}${pin('bind|'+k+'|min',Pr.bind[k].min,'type="number" min="0" step="0.5" aria-label="Минут"')}<i>мин</i></label>`).join('')}</div>`)}
   ${sec('Дополнения — материал и минуты',`<div class="nbs-kv nbs-kvm">${EXTRA.map(([k,n])=>`<label><span>${n}</span>${pin('extra|'+k+'|c',Pr.extra[k].c)}${pin('extra|'+k+'|min',Pr.extra[k].min,'type="number" min="0" step="0.5" aria-label="Минут"')}<i>мин</i></label>`).join('')}</div>`)}
   ${sec('Работа и наценка','<div class="nbs-kv1">'+kv([['Минута работы','lab|rate',Pr.lab.rate,cur()],['Подготовка заказа','lab|setup',Pr.lab.setup,'мин'],['Печать стороны A4','lab|side',Pr.lab.side,'мин'],['Резка блокнота','lab|cut',Pr.lab.cut,'мин'],['Ламинация листа','lab|lam',Pr.lab.lam,'мин'],['Наценка','markup',Pr.markup,'%']])+'</div>'+`<label class="f">Округление цены<select class="nbs-in" data-nbp="round">${opt([['auto','Авто (10 / 50 / 100 / 500)'],['10','до 10 '+cur()],['50','до 50 '+cur()],['100','до 100 '+cur()],['500','до 500 '+cur()]],Pr.round)}</select></label>`)}
   ${sec('Скидки за тираж',`<div class="nbs-kv nbs-kv3">${Pr.disc.map(([q,p],i)=>`<label><span>от ${q} шт.</span>${pin('disc|'+i+'|1',p,'type="number" min="0" max="90" step="1"')}<i>%</i></label>`).join('')}</div>`)}
   <button class="btn sm" data-nba="presetprice">Вернуть цены по умолчанию</button></div>`; }
SCREEN.calc=()=>hd('Прайс и калькулятор','Себестоимость из прайса → наценка → скидка за тираж → красивая цена',btn('printprice','Прайс для клиентов',IC.print)+btn('neworder','Оформить заказ',IC.plus,'primary'))+
  `<div class="nbs-calc"><section class="nbs-sec nbs-quote" id="nbsQuote"></section><section class="nbs-sec"><div class="nbs-sech"><h3>Прайс: компоненты себестоимости</h3><span class="nbs-mut">в ${E(cur())}</span></div>${priceEditor()}</section></div>`;

/* ================= Материалы ================= */
SCREEN.mats=()=>{ const s=S(), low=lowMats(), sl=shopList(), val=s.mats.reduce((a,m)=>a+num(m.qty)*num(m.cost),0), cats=[...new Set([...MCATS,...s.mats.map(m=>m.cat)])].filter(c=>s.mats.some(m=>m.cat===c));
  const need=pending();
  return hd('Склад материалов',`${s.mats.length} ${plural(s.mats.length,'позиция','позиции','позиций')} на ${M(val)}${low.length?` · <em class="bad">на исходе ${low.length}</em>`:''}`,btn('printshop','Список покупок',IC.cart)+btn('matadd','Материал',IC.plus,'primary'))+
   (sl.length?`<section class="nbs-sec nbs-buy"><div class="nbs-sech"><h3>${I(IC.cart)} Нужно купить</h3><span class="ks-sp"></span><button class="btn sm" data-nba="bought">Отметить купленным</button><button class="btn sm" data-nba="printshop">${I(IC.print)}<span>Печать</span></button></div><table class="ks-table"><thead><tr><th>Материал</th><th class="num">Есть</th><th class="num">Для заказов</th><th class="num">Мин.</th><th class="num">Купить</th><th class="num">≈ Сумма</th></tr></thead><tbody>${sl.map(x=>`<tr><td>${E(x.name)}</td><td class="num">${r2(x.have)}</td><td class="num">${x.need?r2(x.need):'—'}</td><td class="num">${r2(x.min)}</td><td class="num"><b>${x.buy} ${E(x.unit)}</b></td><td class="num">${x.cost?M(x.cost):'—'}</td></tr>`).join('')}</tbody></table></section>`:`<div class="nbs-okline">${I(IC.check)} Запасов хватает и на текущие заказы.</div>`)+
   cats.map(c=>`<section class="nbs-sec"><div class="nbs-sech"><h3>${E(c)}</h3></div><div class="nbs-mats">${s.mats.filter(m=>m.cat===c).map(m=>{ const lo=num(m.qty)<=num(m.min), nd=need[m.id]?need[m.id].n:0;
     return `<div class="nbs-mat${lo?' low':''}" data-mat="${m.id}"><div class="nbs-matn"><input class="nbs-in nbs-matname" type="text" data-nbm="${m.id}|name" value="${E(m.name)}" aria-label="Название"><small>${lo?`<span class="ks-badge ${num(m.qty)<=0?'bad':'warn'}">${num(m.qty)<=0?'нет':'мало'}</span> `:''}${nd?`для заказов ${r2(nd)} ${E(m.unit)} · `:''}${E(keyLabel(m.key))}</small></div>
      <div class="nbs-step"><button class="btn sm" data-nba="mq:${m.id}:-1" aria-label="Минус">−</button><input class="nbs-in" type="number" step="any" data-nbm="${m.id}|qty" value="${r2(m.qty)}" aria-label="Остаток"><button class="btn sm" data-nba="mq:${m.id}:1" aria-label="Плюс">+</button><i>${E(m.unit)}</i></div>
      <label class="nbs-mf"><small>мин.</small><input class="nbs-in" type="number" min="0" step="any" data-nbm="${m.id}|min" value="${r2(m.min)}"></label><label class="nbs-mf"><small>цена</small><input class="nbs-in" type="number" min="0" step="any" data-nbm="${m.id}|cost" value="${r2(m.cost)}"></label>
      <button class="btn sm icon nbs-del" data-nba="mdel:${m.id}" aria-label="Удалить" title="Удалить">${I(IC.trash)}</button></div>`; }).join('')}</div></section>`).join('');
};
const keyLabel=k=>{ const [t,v]=MATKEY(k), x=MKEYS.find(m=>m[0]===t); return x?(x[2]&&v?x[1].replace(/\s*\(.*\)/,'')+' '+v+(t==='paper'||t==='card'?' г':' мм'):x[1].replace(/\s*\(.*\)/,'')):'не списывается'; };
PANEL.mats=()=>`<div class="card"><div class="hd2">Новый материал</div>${fld('Название','<input class="nbs-in" type="text" id="nbsMn" placeholder="Например, Пружина 14 мм">')}
  <div class="row2">${fld('Раздел',`<select class="nbs-in" id="nbsMc">${opt(MCATS.map(c=>[c,c]),'Пружины')}</select>`)}${fld('Ед.',`<input class="nbs-in" type="text" id="nbsMu" value="шт">`)}</div>
  <div class="row2">${fld('Списывать как',`<select class="nbs-in" id="nbsMk">${opt(MKEYS.map(([k,n])=>[k,n]),'spiral')}</select>`)}${fld('Размер / г',`<input class="nbs-in" id="nbsMv" type="number" min="0" step="any" placeholder="14">`)}</div>
  <div class="row3">${fld('Остаток','<input class="nbs-in" id="nbsMq" type="number" min="0" value="0">')}${fld('Минимум','<input class="nbs-in" id="nbsMm" type="number" min="0" value="10">')}${fld('Цена','<input class="nbs-in" id="nbsMp" type="number" min="0" value="0">')}</div>
  <button class="btn primary nbs-wide" data-nba="matadd2">${I(IC.plus)}<span>Добавить</span></button></div>
  <div class="card"><div class="hd2">Списание</div><p class="hint">Когда заказ доходит до этапа «Переплёт», бумага, картон, плёнка, пружина (ближайший подходящий диаметр), скобы, клей и фурнитура списываются сами. Вернули заказ назад — материалы возвращаются.</p></div>`;

/* ================= Пружина и переплёт ================= */
const spCfg=()=>{ const s=S().spine; return {pages:Math.max(1,num(s.pages,96)),gsm:num(s.gsm,80),sides:+s.sides===1?1:2,edge:Math.max(40,num(s.edge,210)),card:num(s.card,300)}; };
SCREEN.spine=()=>{ const c=spCfg(), cc={pages:c.pages,gsm:c.gsm,sides:c.sides,card:c.card||'none',w:c.edge,h:c.edge}, T=thickOf(cc), leaves=Math.ceil(c.pages/c.sides);
  const sp=pickSpiral(T), wr=pickWire(T), rg=pickRing(T), dc=pickDisc(T);
  const tile=(t,v,sub,cls)=>`<div class="nbs-rt${cls?' '+cls:''}"><small>${t}</small><b>${v}</b><span>${sub}</span></div>`;
  const PG=[24,32,48,64,80,96,120,144,160,192,240,300,400], GS=[70,80,100,120,160];
  const near=(L,v)=>L.reduce((a,b)=>Math.abs(b-v)<Math.abs(a-v)?b:a,L[0]);
  const rp=near(PG,c.pages), rg2=near(GS,c.gsm);
  const cell=(p,g)=>{ const t=thickOf({pages:p,gsm:g,sides:c.sides,card:c.card||'none'}), w=pickWire(t), s=pickSpiral(t); return `<td class="${p===rp&&g===rg2?'on':''}"><b>${w?String(w[0]).replace('.',',')+' <em>'+w[2]+':1</em>':'—'}</b><small>${s?'пружина '+s:'—'}</small></td>`; };
  return hd('Пружина и переплёт','Диаметр по числу листов и плотности бумаги, шаг перфорации, напоминания')+
   `<div class="nbs-rts">${tile('Толщина блока',String(r2(T)).replace('.',',')+' мм',`${leaves} ${plural(leaves,'лист','листа','листов')} × ${c.gsm} г${c.card?' + обложка':''}`)}
    ${tile('Пружина пластик',sp?sp+' мм':'не подходит',sp?`шаг 4:1 · ${holes(c.edge,PITCH['4:1'])} отв.`:'толще 29 мм',sp?'':'bad')}
    ${tile('Wire-O',wr?String(wr[0]).replace('.',',')+' мм '+wr[1]:'не подходит',wr?`шаг ${wr[2]}:1 · ${holes(c.edge,PITCH[wr[2]+':1'])} отв.`:'толще 24 мм',wr?'':'bad')}
    ${tile('Кольца',rg?rg+' мм':'—',rg?`${ringCount(c.edge)} шт. на край ${c.edge} мм`:'слишком толсто',rg?'':'bad')}
    ${tile('Диски',dc?dc+' мм':'—',dc?`${discCount(c.edge)} шт. на край`:'слишком толсто',dc?'':'bad')}
    ${tile('Скоба / клеевой',c.pages<=96&&c.sides===2?'скоба подходит':'скоба — нет',T>=2.5?'клеевой — да':'клеевой — тонковато',c.pages<=96&&c.sides===2?'':'mut')}</div>
   <section class="nbs-sec"><div class="nbs-sech"><h3>Таблица Wire-O / пружины</h3><span class="nbs-mut">${c.sides===2?'двусторонняя печать':'односторонняя'}${c.card?', с обложкой '+c.card+' г':''}</span></div>
   <div class="nbs-scroll"><table class="nbs-sptbl"><thead><tr><th>Страниц</th>${GS.map(g=>`<th class="${g===rg2?'on':''}">${g} г</th>`).join('')}</tr></thead><tbody>${PG.map(p=>`<tr class="${p===rp?'on':''}"><th>${p}<small>${Math.ceil(p/c.sides)} л.</small></th>${GS.map(g=>cell(p,g)).join('')}</tr>`).join('')}</tbody></table></div>
   <p class="hint">В ячейке: Wire-O в мм (шаг) и пластиковая пружина. Ёмкость Wire-O ≈ 75% диаметра, пружине нужно на 3 мм больше толщины блока.</p></section>
   <section class="nbs-sec"><div class="nbs-sech"><h3>${I(IC.punch)} Перфорация — напоминания</h3></div><ul class="nbs-tips">
    <li><b>Шаг 3:1</b> (8,47 мм, квадратные отв. 4×4) — Wire-O до 14,3 мм. На край ${c.edge} мм ≈ ${holes(c.edge,PITCH['3:1'])} отверстий.</li>
    <li><b>Шаг 2:1</b> (12,7 мм, отв. 6×6) — Wire-O от 15,9 мм. На край ${c.edge} мм ≈ ${holes(c.edge,PITCH['2:1'])} отверстий.</li>
    <li><b>Шаг 4:1</b> (6,35 мм, круглые 5 мм) — пластиковая пружина. ≈ ${holes(c.edge,PITCH['4:1'])} отверстий.</li>
    <li>Отступ отверстий от края: 3–4 мм для тонких блоков, 5–6 мм для пружин от 12 мм. Проверьте упор перфоратора по первому листу.</li>
    <li>Пробивайте пачками по 10–15 листов (картон — по 1–2), выравнивая по одному углу; обложку пробивайте отдельно.</li>
    <li>Wire-O: блок кладут лицом вниз, обложку — последней; после обжима замок прячут между последними листами.</li>
    <li>Кольца и диски — без обжима: проверьте, что страницы листаются и не рвутся (плотность от 90 г лучше).</li></ul></section>`; };
PANEL.spine=()=>{ const s=S().spine; return `<div class="card"><div class="hd2">Блок</div><div class="row2">${fld('Страниц',inp('spine|pages',s.pages,'type="number" min="1" step="2"'))}${fld('Бумага, г',inp('spine|gsm',s.gsm,'type="number" min="40" step="5"'))}</div>
  <div class="row2">${fld('Печать',`<select class="nbs-in" data-nbk="spine|sides">${opt([[2,'Двусторонняя'],[1,'Односторонняя']],s.sides)}</select>`)}${fld('Край переплёта, мм',inp('spine|edge',s.edge))}</div>
  ${fld('Обложка',`<select class="nbs-in" data-nbk="spine|card">${opt([[0,'Без обложки'],[250,'250 г'],[300,'300 г'],[350,'350 г']],s.card)}</select>`)}
  <div class="nbs-qchips">${FORMATS.slice(0,6).map(f=>`<button class="nbs-chip${+s.edge===f.h?' on':''}" data-nba="edge:${f.h}">${f.n} · ${f.h}</button>`).join('')}</div>
  ${NB()?`<button class="btn nbs-wide" data-nba="spinenb">${I(IC.nb)}<span>Взять из текущего блокнота</span></button>`:''}</div>`; };

/* ================= Статистика ================= */
function statData(n){ const J=jobsLive(), months=[]; const d=new Date(); for(let i=n-1;i>=0;i--){ const x=new Date(d.getFullYear(),d.getMonth()-i,1); months.push(x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')); }
  const by={}; months.forEach(m=>by[m]={rev:0,cost:0,qty:0,cnt:0}); const fm={}, bd={}; let rev=0,cost=0,qty=0,cnt=0;
  J.forEach(j=>{ const m=String(j.date).slice(0,7); if(!by[m]) return; const L=live(j); by[m].rev+=L.price; by[m].cost+=L.cost; by[m].qty+=L.qty; by[m].cnt++; rev+=L.price; cost+=L.cost; qty+=L.qty; cnt++;
    const f=fmtLabel(j.cfg); fm[f]=(fm[f]||0)+L.qty; const b=BINDN[j.cfg.binding]||'—'; bd[b]=(bd[b]||0)+L.qty; });
  return {months,by,fm,bd,rev,cost,qty,cnt}; }
const MON=['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];
function barChart(D){ const W=640,H=230,pl=48,pb=26,pt=14, n=D.months.length, mx=Math.max(1000,...D.months.map(m=>D.by[m].rev)), step=niceStep(mx), top=Math.ceil(mx/step)*step||1, bw=(W-pl-8)/n;
  const y=v=>pt+(H-pt-pb)*(1-v/top); let g='';
  for(let v=0;v<=top+1e-9;v+=step) g+=`<line x1="${pl}" x2="${W-4}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}" class="gl"/><text x="${pl-6}" y="${(y(v)+3.5).toFixed(1)}" text-anchor="end" class="tk">${short(v)}</text>`;
  const bars=D.months.map((m,i)=>{ const b=D.by[m], x=pl+i*bw+bw*.16, w=bw*.68, pr=b.rev-b.cost; return `<g><title>${MON[+m.slice(5)-1]} ${m.slice(0,4)}: выручка ${M(b.rev)}, прибыль ${M(pr)}, ${b.qty} шт.</title><rect x="${x.toFixed(1)}" y="${y(b.rev).toFixed(1)}" width="${w.toFixed(1)}" height="${(y(0)-y(b.rev)).toFixed(1)}" rx="3" class="b1"/>${pr>0?`<rect x="${(x+w*.22).toFixed(1)}" y="${y(pr).toFixed(1)}" width="${(w*.56).toFixed(1)}" height="${(y(0)-y(pr)).toFixed(1)}" rx="2" class="b2"/>`:''}<text x="${(x+w/2).toFixed(1)}" y="${H-8}" text-anchor="middle" class="tk">${MON[+m.slice(5)-1]}</text></g>`; }).join('');
  return (D.rev?'':'<div class="nbs-chempty">Продаж блокнотов за период пока нет — график появится после первых заказов.</div>')+`<svg class="nbs-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Выручка и прибыль по месяцам">${g}${bars}<line x1="${pl}" x2="${W-4}" y1="${y(0)}" y2="${y(0)}" class="bl"/></svg>`; }
function niceStep(mx){ const r=mx/4, p=Math.pow(10,Math.floor(Math.log10(r||1))), k=r/p; return (k<=1?1:k<=2?2:k<=5?5:10)*p; }
const short=v=>v>=1e6?(r2(v/1e6)+' млн').replace('.',','):v>=1e3?Math.round(v/1e3)+' тыс':String(Math.round(v));
function hbars(obj,unit){ const L=Object.entries(obj).sort((a,b)=>b[1]-a[1]), mx=Math.max(1,...L.map(x=>x[1])); if(!L.length) return '<div class="ks-empty">Нет данных за период</div>';
  return `<div class="nbs-hb">${L.map(([k,v],i)=>`<div><span>${E(k)}</span><i style="--w:${Math.max(2,v/mx*100)}%;--k:${i%5}"></i><b>${v} ${unit}</b></div>`).join('')}</div>`; }
SCREEN.stats=()=>{ const n=+S().stats.per||12, D=statData(n), pr=D.rev-D.cost;
  return hd('Статистика блокнотов',`последние ${n} ${plural(n,'месяц','месяца','месяцев')} · по дате заказа, без отменённых`)+
   `<div class="nbs-kpis s4"><div class="nbs-kpi" data-kpi="qty"><small>Продано блокнотов</small><b data-nbv="${D.qty}">${D.qty} шт.</b><i>${D.cnt} ${plural(D.cnt,'заказ','заказа','заказов')}</i></div><div class="nbs-kpi" data-kpi="srev"><small>Выручка</small><b data-nbv="${D.rev}">${M(D.rev)}</b><i>сумма заказов</i></div><div class="nbs-kpi" data-kpi="sprofit"><small>Прибыль</small><b data-nbv="${pr}" class="${pr>=0?'':'bad'}">${M(pr)}</b><i>${D.rev?'маржа '+Math.round(pr/D.rev*100)+'%':'—'}</i></div><div class="nbs-kpi"><small>Средняя цена</small><b>${M(D.qty?Math.round(D.rev/D.qty):0)}</b><i>за блокнот</i></div></div>
   <section class="nbs-sec"><div class="nbs-sech"><h3>Выручка и прибыль по месяцам</h3><span class="nbs-leg"><i class="l1"></i>выручка <i class="l2"></i>прибыль</span></div>${barChart(D)}</section>
   <div class="nbs-g2"><section class="nbs-sec"><div class="nbs-sech"><h3>По форматам</h3></div>${hbars(D.fm,'шт.')}</section><section class="nbs-sec"><div class="nbs-sech"><h3>По переплёту</h3></div>${hbars(D.bd,'шт.')}</section></div>
   <section class="nbs-sec"><div class="nbs-sech"><h3>По месяцам</h3></div><table class="ks-table"><thead><tr><th>Месяц</th><th class="num">Заказов</th><th class="num">Блокнотов</th><th class="num">Выручка</th><th class="num">Себест.</th><th class="num">Прибыль</th></tr></thead><tbody>${D.months.slice().reverse().filter(m=>D.by[m].cnt).map(m=>{ const b=D.by[m]; return `<tr><td>${MON[+m.slice(5)-1]} ${m.slice(0,4)}</td><td class="num">${b.cnt}</td><td class="num">${b.qty}</td><td class="num">${M(b.rev)}</td><td class="num">${M(b.cost)}</td><td class="num">${M(b.rev-b.cost)}</td></tr>`; }).join('')||'<tr><td colspan="6" class="nbs-mut">Продаж за период нет</td></tr>'}</tbody></table></section>`; };
PANEL.stats=()=>`<div class="card"><div class="hd2">Период</div><div class="seg nbs-seg">${[3,6,12,24].map(n=>`<button data-nba="per:${n}"${+S().stats.per===n?' class="on"':''}>${n} мес</button>`).join('')}</div><p class="hint">Выручка — сумма заказов блокнотов (цена в «Заказах»), прибыль — цена минус себестоимость по прайсу на момент заказа.</p></div>`;

/* ================= covers & previews (own designs; nbcover thumbnails when available) ================= */
const DESIGNS=[['sage','Шалфей'],['kraft','Крафт'],['navy','Ночь и золото'],['terra','Терракота'],['geo','Геометрия'],['wave','Волны'],['noir','Чёрный'],['blush','Ботаника']];
let uidN=0;
function coverArt(id,w,h,title){ const u='nbsg'+(++uidN), m=Math.min(w,h), t=E(title||''), fs=(m*0.085).toFixed(1);
  const T=(col,y,font,extra)=>t?`<text x="${w/2}" y="${(h*y).toFixed(1)}" text-anchor="middle" font-family="${font||"'Prata',Georgia,serif"}" font-size="${fs}" fill="${col}"${extra||''}>${t}</text>`:'';
  switch(id){
  case 'kraft': return `<defs><pattern id="${u}" width="${m/14}" height="${m/14}" patternUnits="userSpaceOnUse"><circle cx="${m/40}" cy="${m/40}" r="${m/300}" fill="#7b5a36" opacity=".35"/><circle cx="${m/20}" cy="${m/18}" r="${m/420}" fill="#5c4026" opacity=".3"/></pattern></defs><rect width="${w}" height="${h}" fill="#c49a6c"/><rect width="${w}" height="${h}" fill="url(#${u})"/><rect x="${w*.18}" y="${h*.36}" width="${w*.64}" height="${h*.16}" rx="${m*.02}" fill="#f4e9d8" opacity=".92"/>${T('#5c4026',.455)}<line x1="${w*.12}" y1="0" x2="${w*.12}" y2="${h}" stroke="#7b5a36" stroke-width="${m*.006}" opacity=".5"/>`;
  case 'navy': return `<rect width="${w}" height="${h}" fill="#1d2742"/><rect x="${m*.07}" y="${m*.07}" width="${w-m*.14}" height="${h-m*.14}" fill="none" stroke="#c9a45c" stroke-width="${m*.008}"/><rect x="${m*.095}" y="${m*.095}" width="${w-m*.19}" height="${h-m*.19}" fill="none" stroke="#c9a45c" stroke-width="${m*.003}"/><path d="M${w/2-m*.08} ${h*.34}l${m*.08} ${-m*.08}l${m*.08} ${m*.08}l${-m*.08} ${m*.08}z" fill="none" stroke="#c9a45c" stroke-width="${m*.006}"/>${T('#e3c17e',.56,"'Prata',Georgia,serif",' letter-spacing="1"')}`;
  case 'terra': return `<rect width="${w}" height="${h}" fill="#d9734e"/>${[0,1,2].map(i=>`<path d="M${w*(.1+i*.3)} ${h} v${-h*.18} a${w*.13} ${w*.13} 0 0 1 ${w*.26} 0 v${h*.18}z" fill="${['#f2c6a0','#a8462a','#f6dcc0'][i]}"/>`).join('')}<circle cx="${w*.72}" cy="${h*.24}" r="${m*.12}" fill="#f2c6a0"/>${T('#fff4ea',.5)}`;
  case 'geo': { const c=['#2a9d8f','#e9c46a','#e76f51','#264653']; let s=`<rect width="${w}" height="${h}" fill="#f4efe6"/>`; const n=4, cw=w/n; let k=0; for(let y=h*.55;y<h;y+=cw){ for(let x=0;x<w;x+=cw){ const col=c[(k++)%4]; s+=k%3?`<path d="M${x} ${y+cw}L${x+cw} ${y+cw}L${x+cw} ${y}z" fill="${col}"/>`:`<circle cx="${x+cw/2}" cy="${y+cw/2}" r="${cw*.38}" fill="${col}"/>`; } } return s+T('#264653',.3,"'Manrope','Inter',sans-serif",' font-weight="700"'); }
  case 'wave': return `<defs><linearGradient id="${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6a8dff"/><stop offset="1" stop-color="#b06ab3"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#${u})"/>${[.55,.68,.81].map((y,i)=>`<path d="M0 ${h*y} C ${w*.25} ${h*(y-.07)}, ${w*.5} ${h*(y+.07)}, ${w} ${h*(y-.02)} V ${h} H 0 z" fill="#fff" opacity="${.12+i*.08}"/>`).join('')}${T('#ffffff',.3,"'Manrope','Inter',sans-serif",' font-weight="700"')}`;
  case 'noir': return `<rect width="${w}" height="${h}" fill="#151515"/><circle cx="${w/2}" cy="${h*.42}" r="${m*.26}" fill="none" stroke="#3a3a3a" stroke-width="${m*.012}"/><circle cx="${w/2}" cy="${h*.42}" r="${m*.18}" fill="none" stroke="#2a2a2a" stroke-width="${m*.006}"/>${T('#f2f2f2',.82,"'Manrope','Inter',sans-serif",' font-weight="600" letter-spacing="2"')}`;
  case 'blush': { let s=`<rect width="${w}" height="${h}" fill="#f6d8d2"/>`; for(let i=0;i<7;i++){ const x=w*.5+Math.sin(i*1.7)*w*.08, y=h*.28+i*h*.05, r=(i%2?-1:1); s+=`<ellipse cx="${(x+r*m*.07).toFixed(1)}" cy="${y.toFixed(1)}" rx="${(m*.07).toFixed(1)}" ry="${(m*.028).toFixed(1)}" transform="rotate(${r*28} ${(x+r*m*.07).toFixed(1)} ${y.toFixed(1)})" fill="${i%3?'#7a9a7e':'#9db89f'}"/>`; } return s+`<path d="M${w/2} ${h*.24} Q ${w*.53} ${h*.45} ${w/2} ${h*.64}" stroke="#5e7d62" stroke-width="${m*.006}" fill="none"/>`+T('#8a4f4a',.78); }
  default: return `<rect width="${w}" height="${h}" fill="#9cb59a"/><rect x="${m*.08}" y="${m*.08}" width="${w-m*.16}" height="${h-m*.16}" rx="${m*.02}" fill="none" stroke="#fff" stroke-width="${m*.006}" opacity=".8"/>${T('#ffffff',.5)}`; } }
function pageArt(kind,w,h){ const m=Math.min(w,h), st_='stroke="#9aa3b5" stroke-width="'+(m*.004).toFixed(2)+'"'; let s=`<rect width="${w}" height="${h}" fill="#fff"/>`; const g=m/14;
  if(kind==='lined') for(let y=g*2;y<h-g;y+=g) s+=`<line x1="${g}" x2="${w-g}" y1="${y}" y2="${y}" ${st_}/>`;
  else if(kind==='grid'){ for(let y=g;y<h;y+=g/1.6) s+=`<line x1="0" x2="${w}" y1="${y}" y2="${y}" ${st_} opacity=".6"/>`; for(let x=g;x<w;x+=g/1.6) s+=`<line y1="0" y2="${h}" x1="${x}" x2="${x}" ${st_} opacity=".6"/>`; }
  else if(kind==='dots'){ for(let y=g;y<h-g/2;y+=g/1.4) for(let x=g;x<w-g/2;x+=g/1.4) s+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(m*.008).toFixed(2)}" fill="#8f98ab"/>`; }
  else if(kind==='planner'){ s+=`<rect x="${g}" y="${g}" width="${w-2*g}" height="${g*1.4}" rx="${g*.3}" fill="#e8ecf6"/>`; for(let i=0;i<6;i++){ const y=g*3+i*(h-g*4)/6; s+=`<line x1="${g}" x2="${w-g}" y1="${y}" y2="${y}" ${st_}/><rect x="${g}" y="${y+g*.3}" width="${g*.6}" height="${g*.6}" rx="${g*.1}" fill="none" ${st_}/>`; } }
  else if(kind==='mixed'){ for(let y=g*2;y<h/2;y+=g) s+=`<line x1="${g}" x2="${w-g}" y1="${y}" y2="${y}" ${st_}/>`; for(let y=h/2+g;y<h-g/2;y+=g/1.4) for(let x=g;x<w-g/2;x+=g/1.4) s+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(m*.008).toFixed(2)}" fill="#8f98ab"/>`; }
  return s; }
/* a notebook mock-up: cover + binding + extras */
function nbPreview(c,cover,big){ const w=+c.w||148, h=+c.h||210, pad=Math.max(w,h)*.08, b=c.binding, x0=pad+(['spiral','wireo','rings','disc'].includes(b)?w*.06:0), ex=c.extras||{}, rx=ex.corners?Math.min(w,h)*.05:Math.min(w,h)*.008, VW=x0+w+pad, VH=h+pad*2+(ex.ribbon?h*.08:0), u='nbsp'+(++uidN);
  const art=cover&&cover.src?`<image href="${cover.src}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"/>`:coverArt(cover&&cover.id||'sage',w,h,c.title);
  let bind=''; const n=Math.max(6,Math.round(h/(b==='wireo'?8.47:b==='spiral'?6.35*1.6:20)));
  if(b==='spiral'){ for(let i=0;i<n;i++){ const y=pad+h*(i+.5)/n; bind+=`<path d="M${x0+w*.035} ${y-1.8} C ${x0-w*.07} ${y-4}, ${x0-w*.07} ${y+4}, ${x0+w*.035} ${y+1.8}" fill="none" stroke="#3c4250" stroke-width="${Math.max(w*.012,1.3).toFixed(2)}" stroke-linecap="round"/>`; } }
  else if(b==='wireo'){ for(let i=0;i<n;i++){ const y=pad+h*(i+.5)/n; bind+=`<path d="M${x0+w*.03} ${y-1.4} L ${x0-w*.05} ${y-1.4} M${x0+w*.03} ${y+1.4} L ${x0-w*.05} ${y+1.4}" stroke="#8d939f" stroke-width="${Math.max(w*.008,1).toFixed(2)}" stroke-linecap="round"/>`; } }
  else if(b==='rings'){ const k=ringCount(h); for(let i=0;i<k;i++){ const y=pad+h*(i+.5)/k; bind+=`<ellipse cx="${x0}" cy="${y}" rx="${w*.07}" ry="${w*.05}" fill="none" stroke="#a9afba" stroke-width="${Math.max(w*.016,1.4).toFixed(2)}"/>`; } }
  else if(b==='disc'){ const k=discCount(h); for(let i=0;i<k;i++){ const y=pad+h*(i+.5)/k; bind+=`<rect x="${x0-w*.06}" y="${y-h*.018}" width="${w*.1}" height="${h*.036}" rx="${h*.018}" fill="#e2b04a" stroke="#b98a2c" stroke-width=".6"/>`; } }
  else if(b==='perfect'||b==='sewn') bind=`<rect x="${x0}" y="${pad}" width="${w*.05}" height="${h}" fill="#000" opacity=".16"/>`;
  else if(b==='staple') bind=[.28,.72].map(f=>`<rect x="${x0+w*.012}" y="${pad+h*f-h*.025}" width="${w*.012}" height="${h*.05}" fill="#bbb"/>`).join('');
  const elastic=ex.elastic?`<rect x="${x0+w*.86}" y="${pad-1}" width="${w*.045}" height="${h+2}" fill="#20232b" opacity=".92"/>`:'';
  const ribbon=ex.ribbon?`<path d="M${x0+w*.62} ${pad+h-2} v${h*.1} l${w*.025} ${-h*.02} l${w*.025} ${h*.02} v${-h*.1}z" fill="#c0392b"/>`:'';
  return `<svg class="nbs-mock${big?' big':''}" viewBox="0 0 ${VW.toFixed(1)} ${VH.toFixed(1)}" role="img" aria-label="Блокнот"><defs><clipPath id="${u}"><rect width="${w}" height="${h}" rx="${rx}"/></clipPath><filter id="${u}s" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="${h*.015}" stdDeviation="${h*.02}" flood-opacity=".28"/></filter></defs>
   <g transform="translate(${x0+w*.012},${pad+h*.012})"><rect width="${w}" height="${h}" rx="${rx}" fill="#f2f0ea"/></g>${ribbon}<g transform="translate(${x0},${pad})" filter="url(#${u}s)"><g clip-path="url(#${u})">${art}</g></g>${bind}${elastic}</svg>`; }

/* ================= Витрина для клиента ================= */
const DEF_SHOW={fmt:'A5',page:'lined',pages:96,binding:'spiral',cover:'d:sage',extras:{corners:true,elastic:false,ribbon:false,pocket:false,pack:true},qty:1,title:''};
const SW=()=>{ const s=S(); if(!s.show||typeof s.show!=='object') s.show=clone(DEF_SHOW); for(const k in DEF_SHOW) if(s.show[k]==null) s.show[k]=clone(DEF_SHOW[k]); return s.show; };
const SHOWF=['A4','A5','B6','A6','sq','tn'];
const PAGESN=[48,64,96,128,160,200];
function showCfg(){ const v=SW(), f=FORMATS.find(x=>x.id===v.fmt)||FORMATS[1], pk=PAGEK.find(p=>p[0]===v.page)||PAGEK[0], c=Object.assign({},DEF_CALC,clone(S().calc));
  Object.assign(c,{src:'manual',fmt:f.id,w:f.w,h:f.h,pages:+v.pages,gsm:80,sides:2,cov:pk[2],binding:v.binding,page:pk[0],extras:clone(v.extras),qty:Math.max(1,+v.qty||1),title:v.title||'',coverDesign:v.cover});
  if(!c.card||c.card==='none') c.card=300; if(!c.lam||c.lam==='none') c.lam='matte'; return c; }
let extCovers=null, curCover=null;
async function loadCovers(){ const out=[]; try{ const nc=KS.nbCover; const fn=nc&&(nc.thumbs||nc.templates||nc.gallery); if(typeof fn==='function'){ let r=fn.call(nc); if(r&&r.then) r=await r; (Array.isArray(r)?r:[]).slice(0,12).forEach((x,i)=>{ const src=x&&(x.thumb||x.src||x.url||x.dataURL); if(src) out.push({id:'t:'+(x.id||i),name:x.name||x.title||'Шаблон',src}); }); } }catch(e){ console.error('[nbshop] covers',e); }
  try{ const cv=await KS.idb.get('nb:cover','files'); curCover=cv&&(cv.front||cv.wrap)?{id:'cur',name:'Текущая обложка',src:await thumbOf(cv.front||cv.wrap,!cv.front&&!!cv.wrap)}:null; }catch(_){ curCover=null; }
  if(!curCover&&KS.nbCover&&typeof KS.nbCover.thumb==='function'){ try{ const t=await KS.nbCover.thumb(30); if(t) curCover={id:'cur',name:'Обложка из конструктора',src:t}; }catch(e){ console.warn('[nbshop] cover thumb',e); } }
  const had=JSON.stringify(extCovers); extCovers=out; if(had!==JSON.stringify(out)||curCover) refreshShow(); }
function coverObj(id){ if(!id||id.startsWith('d:')) return {id:(id||'d:sage').slice(2)}; if(id==='cur') return curCover||{id:'sage'}; return (extCovers||[]).find(x=>x.id===id)||{id:'sage'}; }
function showHTML(full){ const v=SW(), c=showCfg(), q=quote(c), cov=coverObj(v.cover), pk=PAGEK.find(p=>p[0]===v.page)||PAGEK[0], S_=st.shop||{};
  const step=(n,t,body)=>`<section class="nbs-swst"><h4><i>${n}</i>${t}</h4>${body}</section>`;
  const fmts0=SHOWF.map(id=>FORMATS.find(f=>f.id===id)).map(f=>{ const k=46/Math.max(f.w,f.h); return `<button class="nbs-swt${v.fmt===f.id?' on':''}" data-nba="sw:fmt:${f.id}"><span class="nbs-swfr"><i style="width:${(f.w*k).toFixed(0)}px;height:${(f.h*k).toFixed(0)}px"></i></span><b>${E(f.n)}</b><small>${f.w}×${f.h}</small></button>`; }).join('');
  const pages=PAGEK.map(([id,n])=>`<button class="nbs-swt${v.page===id?' on':''}" data-nba="sw:page:${id}"><svg class="nbs-swpg" viewBox="0 0 60 80">${pageArt(id,60,80)}</svg><b>${n}</b></button>`).join('');
  const vol=PAGESN.map(n=>`<button class="nbs-chip big${+v.pages===n?' on':''}" data-nba="sw:pages:${n}">${n}<small> стр.</small></button>`).join('');
  const binds=['spiral','wireo','rings','disc','perfect','sewn','staple'].map(id=>{ const cc=Object.assign({},c,{binding:id}), x=quote(cc), ok=!bindPart(cc).warn; return `<button class="nbs-swt${v.binding===id?' on':''}${ok?'':' dim'}" data-nba="sw:binding:${id}"><span class="nbs-swbi">${nbPreview(Object.assign({},cc,{w:60,h:80,extras:{},title:''}),cov)}</span><b>${BINDN[id]}</b><small>${M(x.unit)}</small></button>`; }).join('');
  const covs=[...DESIGNS.map(([id,n])=>({id:'d:'+id,name:n,d:id})),...(curCover?[{id:'cur',name:curCover.name,src:curCover.src}]:[]),...(extCovers||[])].map(o=>`<button class="nbs-swt nbs-swc${v.cover===o.id?' on':''}" data-nba="sw:cover:${E(o.id)}"><span class="nbs-swcv">${o.src?`<img src="${o.src}" alt="">`:`<svg viewBox="0 0 70 100">${coverArt(o.d,70,100,'')}</svg>`}</span><b>${E(o.name)}</b></button>`).join('');
  const extras=EXTRA.filter(([k])=>k!=='pack').map(([k,n])=>`<button class="nbs-swx${v.extras[k]?' on':''}" data-nba="sw:x:${k}"><span class="nbs-swck">${I(IC.check)}</span><b>${n}</b><small>+${M(extraPrice(k))}</small></button>`).join('');
  return `<div class="nbs-sw${full?' full':''} nbs-root">
   <header class="nbs-swh"><div><small>${E(S_.name||'Типография')}</small><h1>Соберите свой блокнот</h1></div><span class="ks-sp"></span>${full?`<button class="btn nbs-swclose" data-nba="showclose" aria-label="Закрыть витрину">${I(IC.x)}<span>Закрыть</span></button>`:`<button class="btn" data-nba="showfull">${I(IC.full)}<span>На весь экран</span></button>`}</header>
   <div class="nbs-swb"><div class="nbs-swprev"><div class="nbs-swstage">${nbPreview(c,cov,true)}<svg class="nbs-swpage" viewBox="0 0 ${c.w} ${c.h}">${pageArt(v.page,c.w,c.h)}</svg></div>
     <div class="nbs-swsum"><b>${E(cfgLine(c))}</b><span>${E(finLine(c))}</span></div>
     <label class="nbs-swtitle"><span>Надпись на обложке</span><input class="nbs-in" type="text" data-nbsh="title" maxlength="40" value="${E(v.title)}" placeholder="Например, имя или «Мой 2027»"></label></div>
    <div class="nbs-swsteps">${step(1,'Формат',`<div class="nbs-swg six">${fmts0}</div>`)}${step(2,'Страницы',`<div class="nbs-swg six">${pages}</div>`)}${step(3,'Объём',`<div class="nbs-swchips">${vol}</div>`)}${step(4,'Переплёт',`<div class="nbs-swg seven">${binds}</div>`)}${step(5,'Обложка',`<div class="nbs-swg nbs-swgc">${covs}</div>`)}${step(6,'Дополнения',`<div class="nbs-swxs">${extras}</div>`)}</div></div>
   <footer class="nbs-swf"><div class="nbs-swq"><button class="btn" data-nba="sw:qty:-1" aria-label="Меньше">−</button><b data-nbsw="qty">${q.qty}</b><button class="btn" data-nba="sw:qty:1" aria-label="Больше">+</button><small>шт.</small></div>
    <div class="nbs-swp"><small>${q.disc?`скидка ${q.disc}% · `:''}за штуку</small><b data-nbsw="unit">${M(q.unit)}</b></div><div class="nbs-swp tot"><small>Итого</small><b data-nbsw="total">${M(q.total)}</b></div>
    <button class="btn primary nbs-swgo" data-nba="showorder">${I(IC.check)}<span>Оформить заказ</span></button></footer></div>`; }
SCREEN.show=()=>showHTML(false);
PANEL.show=()=>`<div class="card"><div class="hd2">Витрина</div><p class="hint">Красивая страница для клиента: он сам выбирает формат, страницы, переплёт, обложку и дополнения, цена считается по вашему прайсу.</p><button class="btn primary nbs-wide" data-nba="showfull">${I(IC.full)}<span>Открыть на весь экран</span></button><button class="btn nbs-wide" data-nba="showreset">Начать заново</button>${KS.nbCover?'':'<p class="hint">Обложки — встроенные дизайны. Подключите модуль обложек, чтобы показывать свои шаблоны.</p>'}</div>`;
let showOv=null;
function openShow(){ if(!showOv){ showOv=document.createElement('div'); showOv.className='nbs-ov'; document.body.appendChild(showOv); }
  showOv.innerHTML=showHTML(true); showOv.hidden=false; document.documentElement.classList.add('nbs-ov-on'); loadCovers(); }
function closeShow(){ if(showOv){ showOv.hidden=true; showOv.innerHTML=''; } document.documentElement.classList.remove('nbs-ov-on'); }
function refreshShow(){ const keepS=el=>{ const x=el&&el.querySelector('.nbs-swsteps'); return x?x.scrollTop:0; };
  if(showOv&&!showOv.hidden){ const t=keepS(showOv); showOv.innerHTML=showHTML(true); const x=showOv.querySelector('.nbs-swsteps'); if(x) x.scrollTop=t; }
  if(scrEl&&!scrEl.hidden&&view()==='show'){ const t=keepS(scrEl), st0=scrEl.scrollTop; drawScreen(); const x=scrEl.querySelector('.nbs-swsteps'); if(x) x.scrollTop=t; scrEl.scrollTop=st0; } }
document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&showOv&&!showOv.hidden&&!document.querySelector('.ksmodal:not([hidden])')){ e.preventDefault(); closeShow(); } });

/* ================= order dialog ================= */
let OD=null;
function stockWarn(cfg,qty){ const L=[]; usage(cfg,qty).forEach(u=>{ const m=findMat(u.key); if(!m) L.push(`${u.label}: нет на складе`); else if(num(m.qty)<u.n) L.push(`${m.name}: есть ${r2(m.qty)}, нужно ${r2(u.n)} ${m.unit}`); }); return L; }
function orderDialog(src){ const show=src==='show', cfg=show?showCfg():calcCfg(), fromNb=!show&&S().calc.src==='nb'&&!!NB(); const q=quote(cfg);
  OD={src,cfg,fromNb,touched:false}; const m=KS.modal({id:'nbs-order',title:'Новый заказ блокнота',onClose:()=>{ OD=null; }}); m.title('Новый заказ блокнота');
  const cl=(Array.isArray(st.clients)?st.clients:[]).map(c=>`<option value="${E(c.name)}">${E(c.phone||'')}</option>`).join('');
  m.el.innerHTML=`<div class="nbs-od nbs-root"><div class="nbs-odh"><div class="nbs-odm">${nbPreview(cfg,show?coverObj(SW().cover):{id:'sage'})}</div><div><b>${E(cfgName(cfg))}</b><span>${E(cfgLine(cfg))}</span><span>${E(finLine(cfg))}</span>${fromNb?'<span class="ks-badge ok">из текущего блокнота</span>':show?'<span class="ks-badge">из витрины</span>':''}</div></div>
   <div class="row2"><label class="f">Клиент<input class="nbs-in" type="text" id="nbsOc" list="nbsCli" autocomplete="off" placeholder="Имя или компания"></label><label class="f">Телефон<input class="nbs-in" id="nbsOp" type="tel" placeholder="0XX XX XX XX"></label></div>
   <div class="row3"><label class="f">Тираж, шт.<input class="nbs-in" id="nbsOq" type="number" min="1" value="${q.qty}"></label><label class="f">Срок<input class="nbs-in" id="nbsOd" type="date" value="${addDays(today(),3)}"></label><label class="f">Сумма заказа<input class="nbs-in" id="nbsOs" type="number" min="0" value="${q.total}"></label></div>
   <div class="row2"><label class="f">Предоплата<input class="nbs-in" id="nbsOpd" type="number" min="0" value="0"></label><label class="f">Заметка<input class="nbs-in" type="text" id="nbsOn" placeholder="Пожелания клиента"></label></div>
   <div class="nbs-odq" id="nbsOqq"></div>
   <div class="nbs-odb"><button class="btn primary" data-nba="ordcreate">${I(IC.check)}<span>Создать заказ</span></button><button class="btn" data-ksclose="1">Отмена</button></div><datalist id="nbsCli">${cl}</datalist></div>`;
  m.open(); odRefresh(); setTimeout(()=>{ const i=document.getElementById('nbsOc'); if(i) i.focus(); },30); }
function odRefresh(){ if(!OD) return; const qty=Math.max(1,Math.round(num((document.getElementById('nbsOq')||{}).value,1))), q=quote(Object.assign({},OD.cfg,{qty})), s=document.getElementById('nbsOs');
  if(s&&!OD.touched) s.value=q.total; const price=s?num(s.value):q.total, w=stockWarn(OD.cfg,qty), el=document.getElementById('nbsOqq');
  if(el) el.innerHTML=`<span>${M(q.unit)} за шт.${q.disc?` (скидка ${q.disc}%)`:''}</span><span>себестоимость ${M(q.totalCost)}</span><span class="${price-q.totalCost>=0?'ok':'bad'}">прибыль ${M(price-q.totalCost)}</span>${w.length?`<div class="nbs-warnbox">${I(IC.alert)}<span>Не хватит материалов: ${E(w.join('; '))}</span></div>`:''}`; }
async function odCreate(){ if(!OD) return; const g=id=>(document.getElementById(id)||{}).value||''; const D=OD;
  const qty=Math.max(1,Math.round(num(g('nbsOq'),1)));
  const r=await createJob({cfg:D.cfg,qty,client:g('nbsOc'),phone:g('nbsOp'),due:g('nbsOd'),price:g('nbsOs'),paid:g('nbsOpd'),note:g('nbsOn'),src:D.src,snap:D.fromNb?nbSnap():null,withCover:D.src!=='show'||SW().cover==='cur'});
  KS.modal({id:'nbs-order'}).close(); if(D.src==='show'){ closeShow(); } KS.toast(`Заказ № ${r.o.no} создан — он в «Производстве» и «Заказах»`); go('board',{filter:''}); return r; }

/* ================= job dialog ================= */
let JD=null;
function jobModal(id){ const j=jobsAll().find(x=>x.id===id); if(!j) return; JD=id; const L=live(j), c=j.cfg, m=KS.modal({id:'nbs-job',wide:true,onClose:()=>{ JD=null; }}); m.title(`Заказ № ${L.no} · ${L.client||'без клиента'}`);
  const CL=checklist, all=STAGES.map(([sid,n])=>{ const jj=Object.assign({},j,{stage:sid}), items=CL(jj), ck=(j.checks||{})[sid]||[]; return items.length?`<div class="nbs-jcl${sid===j.stage?' on':''}"><b style="--c:${SCOL[sid]}">${n}</b>${items.map((t,k)=>`<label class="nbs-ci${ck[k]?' on':''}"><input type="checkbox" data-nba="chk:${j.id}:${k}:${sid}"${ck[k]?' checked':''}><span>${E(t)}</span></label>`).join('')}</div>`:''; }).join('');
  const hist=(j.hist||[]).slice().reverse().map(([s,t])=>`<li><i style="--c:${SCOL[s]}"></i>${E(SNAME[s]||s)}<small>${new Date(t).toLocaleString('ru-RU',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</small></li>`).join('');
  const f=(k,l,v,t)=>`<label class="f">${l}<input class="nbs-in" data-nbj="${k}" type="${t||'text'}" value="${E(v)}"></label>`;
  m.el.innerHTML=`<div class="nbs-jd nbs-root"><div class="nbs-jdl"><div class="nbs-jdm">${THUMBS[j.id]?`<img src="${THUMBS[j.id]}" alt="Обложка">`:nbPreview(c,coverObj(c.coverDesign||'d:sage'))}</div><div class="nbs-jdc"><b>${E(cfgName(c))}</b><span>${E(cfgLine(c))}</span><span>${E(finLine(c))}</span><span>${c.gsm} г · ${+c.sides===1?'односторонняя':'двусторонняя'} · ${M(j.unit||0)} за шт.</span></div>
     <div class="nbs-jdb">${btn('jopen:'+j.id,'Открыть блокнот',IC.open)}${btn('jprint:'+j.id,'Печать',IC.print)}${L.o?btn('jorders:'+j.id,'В «Заказах»',IC.board):''}</div>
     ${j.ded?`<div class="nbs-jded"><b>Списано со склада</b>${(j.ded.items||[]).map(it=>`<span>${E(it.name)} — ${r2(it.n)}</span>`).join('')}${(j.ded.miss||[]).length?`<span class="bad">Не найдено: ${E(j.ded.miss.join(', '))}</span>`:''}</div>`:''}
     <div class="nbs-jdh"><b>История</b><ul>${hist}</ul></div></div>
   <div class="nbs-jdr"><div class="row2">${f('client','Клиент',L.client)}${f('phone','Телефон',L.phone,'tel')}</div><div class="row3">${f('qty','Тираж',L.qty,'number')}${f('due','Срок',L.due,'date')}${f('price','Сумма',L.price,'number')}</div>
     <label class="f">Этап<select class="nbs-in" data-nbj="stage">${opt(STAGES.map(s=>[s[0],s[1]]),j.stage)}</select></label>${f('note','Заметка',j.note||'')}
     <div class="nbs-jcls">${all}</div>
     <div class="nbs-jdb">${L.cancel?'<span class="ks-badge bad">Заказ отменён</span>':btn('jcancel:'+j.id,'Отменить заказ',IC.x,'danger')}${btn('jremove:'+j.id,'Убрать с доски',IC.trash)}</div></div></div>`;
  m.open(); }
function jobSet(j,k,v){ const o=ordOf(j); if(k==='stage'){ setStage(j,v); }
  else if(k==='qty'){ const n=Math.max(1,Math.round(num(v,1))); j.qty=n; if(o) o.qty=n; }
  else if(k==='price'){ j.price=num(v); if(o) o.price=num(v); }
  else if(k==='note'){ j.note=String(v); }
  else { j[k]=String(v); if(o) o[k]=String(v); }
  j.upd=Date.now(); if(typeof update==='function') update(); else KS.save(); }

/* ================= printable pages ================= */
const PF="'Manrope','Inter',system-ui,sans-serif", HF="'Prata','Playfair Display',Georgia,serif", ACC='#2f5d50';
function pricePages(){ const Pr=P(), S_=st.shop||{}, base=Object.assign({},DEF_CALC,{src:'manual',card:300,lam:'matte',cov:'light',sides:2,gsm:80,coverSides:1,qty:1,extras:{corners:false,elastic:false,ribbon:false,pocket:false,pack:false}});
  const F=['A6','A5','B5','A4'].map(id=>FORMATS.find(f=>f.id===id)), PG=[48,96,144,200];
  const td='padding:2.4mm 3mm;border-bottom:.25mm solid #e3e0d8', th='padding:2mm 3mm;font-size:8.5pt;letter-spacing:.06em;text-transform:uppercase;color:#7a7465;text-align:right;border-bottom:.4mm solid '+ACC;
  const main=`<table style="width:100%;border-collapse:collapse;font-size:11pt"><thead><tr><th style="${th};text-align:left">Страниц</th>${F.map(f=>`<th style="${th}">${f.n}<div style="font-size:7.5pt;letter-spacing:0;text-transform:none;font-weight:400">${f.w}×${f.h} мм</div></th>`).join('')}</tr></thead><tbody>${PG.map(p=>`<tr><td style="${td};font-weight:700">${p}</td>${F.map(f=>{ const q=quote(Object.assign({},base,{fmt:f.id,w:f.w,h:f.h,pages:p,binding:'spiral'}),Pr); return `<td style="${td};text-align:right;font-variant-numeric:tabular-nums;font-weight:600">${q.bind.warn&&!q.bind.d?'—':M(q.unit)}</td>`; }).join('')}</tr>`).join('')}</tbody></table>`;
  const a5=Object.assign({},base,{fmt:'A5',w:148,h:210,pages:96});
  const bt=['spiral','wireo','staple','perfect','sewn','rings','disc'].map(b=>{ const q=quote(Object.assign({},a5,{binding:b}),Pr); return `<tr><td style="${td}">${BINDN[b]}</td><td style="${td};text-align:right;font-weight:600">${M(q.unit)}</td></tr>`; }).join('');
  const soft=quote(Object.assign({},a5,{lam:'soft'}),Pr).unit-quote(a5,Pr).unit;
  const xt=EXTRA.map(([k,n])=>`<tr><td style="${td}">${n}</td><td style="${td};text-align:right;font-weight:600">+ ${M(extraPrice(k,Pr))}</td></tr>`).join('')+`<tr><td style="${td}">Обложка soft-touch</td><td style="${td};text-align:right;font-weight:600">+ ${M(Math.max(0,soft))}</td></tr>`;
  const dc=(Pr.disc||[]).filter(d=>+d[1]>0).map(([q,p])=>`<div style="flex:1;border:.3mm solid #d9d3c4;border-radius:3mm;padding:2.5mm;text-align:center"><div style="font-size:8.5pt;color:#7a7465">от ${q} шт.</div><div style="font:700 15pt ${HF};color:${ACC}">−${p}%</div></div>`).join('');
  const deco=`<svg width="46mm" height="40mm" viewBox="0 0 120 104" style="position:absolute;right:14mm;top:13mm"><rect x="40" y="6" width="62" height="88" rx="4" fill="#e9c46a"/><rect x="28" y="12" width="62" height="88" rx="4" fill="#fff" stroke="#d8d2c2"/><rect x="18" y="4" width="62" height="88" rx="4" fill="${ACC}"/>${[0,1,2,3,4,5,6,7,8].map(i=>`<circle cx="18" cy="${12+i*9.5}" r="3.2" fill="none" stroke="#fff" stroke-width="1.4"/>`).join('')}<rect x="66" y="4" width="5" height="88" fill="#1b3a31" opacity=".6"/><text x="47" y="52" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="#fff">Notes</text></svg>`;
  const html=`<div style="position:absolute;inset:0;font-family:${PF};color:#24221d;background:#fbfaf6">
   <div style="position:absolute;left:0;top:0;right:0;height:62mm;background:${ACC};color:#fff"></div>${deco}
   <div style="position:absolute;left:16mm;top:15mm;right:70mm;color:#fff"><div style="font-size:9pt;letter-spacing:.18em;text-transform:uppercase;opacity:.8">${E(S_.name||'Типография')}</div><div style="font:400 30pt/1.05 ${HF};margin-top:3mm">Блокноты на заказ</div><div style="font-size:10.5pt;margin-top:3mm;opacity:.92;line-height:1.45">Любой формат и разлиновка: линейка, клетка, точки, ежедневники. Пружина, Wire-O, кольца, диски, клеевой и шитый переплёт.</div></div>
   <div style="position:absolute;left:16mm;right:16mm;top:72mm">
    <div style="font:400 15pt ${HF};color:${ACC};margin-bottom:1mm">Цена за 1 блокнот</div><div style="font-size:9pt;color:#7a7465;margin-bottom:2.5mm">Пружина, бумага 80 г, печать с двух сторон, обложка 300 г с матовой ламинацией</div>${main}
    <div style="display:flex;gap:10mm;margin-top:8mm"><div style="flex:1"><div style="font:400 13pt ${HF};color:${ACC};margin-bottom:2mm">Переплёт · A5, 96 стр.</div><table style="width:100%;border-collapse:collapse;font-size:10.5pt">${bt}</table></div>
     <div style="flex:1"><div style="font:400 13pt ${HF};color:${ACC};margin-bottom:2mm">Дополнения, за штуку</div><table style="width:100%;border-collapse:collapse;font-size:10.5pt">${xt}</table></div></div>
    ${dc?`<div style="font:400 13pt ${HF};color:${ACC};margin:8mm 0 2.5mm">Скидки за тираж</div><div style="display:flex;gap:3mm">${dc}</div>`:''}</div>
   <div style="position:absolute;left:16mm;right:16mm;bottom:12mm;display:flex;justify-content:space-between;align-items:flex-end;border-top:.3mm solid #d9d3c4;padding-top:3mm;font-size:9pt;color:#5d584c"><div>${E([S_.phone,S_.addr].filter(Boolean).join(' · ')||'Цены в '+cur())}<br>Срок изготовления — от 1 дня. Обложка по вашему дизайну или из каталога.</div><div style="text-align:right">Цены действительны на ${E(new Date().toLocaleDateString('ru-RU'))}</div></div></div>`;
  return [KS.page(210,297,html,'nb-price')]; }
function shopPages(){ const L=shopList(), S_=st.shop||{}, td='padding:2.2mm 3mm;border-bottom:.25mm solid #ddd';
  const rows=L.map(x=>`<tr><td style="${td};width:8mm"><span style="display:inline-block;width:4mm;height:4mm;border:.35mm solid #555;border-radius:1mm"></span></td><td style="${td}">${E(x.name)}</td><td style="${td};text-align:right">${r2(x.have)}</td><td style="${td};text-align:right">${x.need?r2(x.need):'—'}</td><td style="${td};text-align:right;font-weight:700">${x.buy} ${E(x.unit)}</td><td style="${td};text-align:right">${x.cost?M(x.cost):'—'}</td></tr>`).join('');
  const sum=L.reduce((a,x)=>a+x.cost,0);
  const html=`<div style="position:absolute;inset:16mm;font-family:${PF};color:#222"><div style="display:flex;justify-content:space-between;align-items:flex-end;border-bottom:.6mm solid ${ACC};padding-bottom:3mm;margin-bottom:6mm"><div><div style="font:400 24pt ${HF};color:${ACC}">Список покупок</div><div style="font-size:10pt">Материалы для блокнотов · ${E(S_.name||'')}</div></div><div style="font-size:10pt">${E(new Date().toLocaleDateString('ru-RU'))}</div></div>
   ${L.length?`<table style="width:100%;border-collapse:collapse;font-size:10.5pt"><thead><tr style="color:#777;font-size:8.5pt;text-transform:uppercase"><th></th><th style="text-align:left;padding:1.5mm 3mm">Материал</th><th style="text-align:right;padding:1.5mm 3mm">Есть</th><th style="text-align:right;padding:1.5mm 3mm">Для заказов</th><th style="text-align:right;padding:1.5mm 3mm">Купить</th><th style="text-align:right;padding:1.5mm 3mm">≈ Сумма</th></tr></thead><tbody>${rows}</tbody></table><div style="text-align:right;margin-top:4mm;font-size:12pt">Итого ≈ <b>${M(sum)}</b></div>`:'<p style="font-size:12pt">Всё в наличии — покупать ничего не нужно.</p>'}</div>`;
  return [KS.page(210,297,html,'nb-shopping')]; }

/* ================= events ================= */
const jobBy=id=>jobsAll().find(j=>j.id===id);
const commit=()=>{ if(typeof update==='function') update(); else KS.save(); };
function scrollToStage(id){ setTimeout(()=>{ const col=scrEl&&scrEl.querySelector(`.nbs-col[data-nbst="${id}"]`), b=scrEl&&scrEl.querySelector('.nbs-board'); if(col&&b){ b.scrollLeft=Math.max(0,col.offsetLeft-b.offsetLeft-8); col.classList.add('flash'); setTimeout(()=>col.classList.remove('flash'),1200); } },30); }
let justDragged=0;
function act(a,el){ const [k,x,y,z]=a.split(':'), s=S();
  switch(k){
  case 'go': return go(x);
  case 'stage': go('board',{filter:''}); if(x) scrollToStage(x); return;
  case 'neworder': return orderDialog(view()==='show'?'show':'calc');
  case 'nbnew': return openNbTab('block');
  case 'nblast': { const j=jobBy(s.last)||jobsAll()[0]; if(j) openJob(j,'block'); return; }
  case 'queue': return go('board',{filter:'print'});
  case 'showfull': return openShow();
  case 'showclose': return closeShow();
  case 'showorder': return orderDialog('show');
  case 'showreset': s.show=clone(DEF_SHOW); KS.save(); refreshShow(); return;
  case 'sw': { const v=SW(); if(x==='x') v.extras[y]=!v.extras[y]; else if(x==='qty') v.qty=Math.max(1,(+v.qty||1)+(+y)); else if(x==='pages') v.pages=+y; else if(x==='cover') v.cover=a.slice('sw:cover:'.length); else v[x]=y; KS.save(); refreshShow(); return; }
  case 'printshop': return KS.print(shopPages());
  case 'printprice': return KS.print(pricePages());
  case 'filter': s.board.filter=x||''; KS.save(); return drawScreen();
  case 'allout': s.board.allOut=true; return drawScreen();
  case 'open': { const j=jobBy(x); if(j) openJob(j,'block'); return; }
  case 'print': { const j=jobBy(x); if(j) openJob(j,'print'); return; }
  case 'mv': { const j=jobBy(x); if(j&&setStage(j,y)){ commit(); drawScreen(); } return; }
  case 'job': return jobModal(x);
  case 'src': s.calc.src=x; KS.save(); drawPanel(); renderQuote(); return;
  case 'qty': case 'qtyset': { s.calc.qty=Math.max(1,k==='qty'?(+s.calc.qty||1)+(+x):+x); KS.save(); drawPanel(); renderQuote(); return; }
  case 'pdel': { const L=s.prices[x]; if(Array.isArray(L)&&L.length>1){ L.splice(+y,1); KS.save(); drawScreen(); } else KS.toast('Нужна хотя бы одна строка'); return; }
  case 'padd': { const L=s.prices[x]; const last=L[L.length-1]||{gsm:80,c:8}; L.push({gsm:last.gsm+20,c:last.c+5}); KS.save(); drawScreen(); return; }
  case 'presetprice': if(confirm('Вернуть все цены прайса к значениям по умолчанию?')){ s.prices=clone(DEF_PRICES); KS.save(); drawScreen(); drawPanel(); KS.toast('Прайс сброшен'); } return;
  case 'matadd': { const i=boxEl&&boxEl.querySelector('#nbsMn'); if(i){ i.focus(); i.scrollIntoView({block:'center'}); } return; }
  case 'matadd2': { const g=id=>(boxEl.querySelector('#'+id)||{}).value||''; const name=g('nbsMn').trim(); if(!name){ KS.toast('Введите название материала'); return; }
    const t=g('nbsMk'), need=(MKEYS.find(m=>m[0]===t)||[])[2], v=num(g('nbsMv'),0); if(need&&!v){ KS.toast('Укажите размер или плотность — по нему материал списывается'); return; }
    s.mats.push(MK(g('nbsMc')||'Прочее',name,g('nbsMu')||'шт',num(g('nbsMq')),num(g('nbsMm')),num(g('nbsMp')),t==='other'?'x':need?t+':'+v:t)); KS.save(); drawScreen(); drawPanel(); KS.toast('Материал добавлен'); return; }
  case 'mq': { const m=s.mats.find(q=>q.id===x); if(m){ m.qty=Math.max(0,r2(num(m.qty)+(+y))); KS.save(); drawScreen(); } return; }
  case 'mdel': { const m=s.mats.find(q=>q.id===x); if(m&&confirm(`Удалить «${m.name}» со склада?`)){ s.mats=s.mats.filter(q=>q!==m); KS.save(); drawScreen(); drawPanel(); } return; }
  case 'bought': { const L=shopList().filter(i=>i.m); L.forEach(i=>i.m.qty=r2(num(i.m.qty)+i.buy)); KS.save(); drawScreen(); drawPanel(); KS.toast(L.length?`Пополнено позиций: ${L.length}`:'Нечего пополнять'); return; }
  case 'edge': s.spine.edge=+x; KS.save(); drawPanel(); drawScreen(); return;
  case 'spinenb': { const c=snapCfg(nbSnap()); if(c){ Object.assign(s.spine,{pages:c.pages||s.spine.pages,gsm:c.gsm||s.spine.gsm,sides:c.sides||s.spine.sides,edge:Math.max(+c.w||0,+c.h||0)||s.spine.edge}); KS.save(); drawPanel(); drawScreen(); } return; }
  case 'per': s.stats.per=+x; KS.save(); drawPanel(); drawScreen(); return;
  case 'ordcreate': return odCreate();
  case 'jopen': case 'jprint': { const j=jobBy(x); if(j){ KS.modal({id:'nbs-job'}).close(); openJob(j,k==='jprint'?'print':'block'); } return; }
  case 'jorders': { const j=jobBy(x); KS.modal({id:'nbs-job'}).close(); if(j&&j.orderId){ try{ ordOpen=j.orderId; if(st.shop) st.shop.filter='all'; }catch(_){} if(typeof goTab==='function') goTab('orders'); } return; }
  case 'jcancel': { const j=jobBy(x), o=j&&ordOf(j); if(j&&confirm('Отменить заказ? Статус в «Заказах» станет «Отменён».')){ if(o) o.status='cancel'; else j.cancel=true; KS.modal({id:'nbs-job'}).close(); commit(); drawScreen(); KS.toast('Заказ отменён'); } return; }
  case 'jremove': { const j=jobBy(x); if(j&&confirm('Убрать карточку с доски производства? Заказ в «Заказах» останется.')){ s.jobs=s.jobs.filter(q=>q!==j); ['nbs:snap:'+j.id,'nbs:csnap:'+j.id].forEach(key=>KS.idb.del(key,'kv').catch(()=>{})); ['nbs:cov:'+j.id,'nbs:covt:'+j.id].forEach(key=>KS.idb.del(key,'files').catch(()=>{})); KS.modal({id:'nbs-job'}).close(); commit(); drawScreen(); } return; }
  } }
document.addEventListener('click',e=>{ const root=e.target.closest&&e.target.closest('.nbs-root, .nbs-ov'); if(!root) return; const el=e.target.closest('[data-nba]');
  if(el&&el.tagName!=='INPUT'&&!el.disabled){ try{ act(el.dataset.nba,el); }catch(err){ console.error('[nbshop] '+el.dataset.nba,err); } return; }
  const c=e.target.closest('.nbs-card'); if(c&&!e.target.closest('label,input,button')&&Date.now()-justDragged>300) jobModal(c.dataset.nbjob); });
document.addEventListener('keydown',e=>{ if(e.key==='Enter'&&e.target&&e.target.classList&&e.target.classList.contains('nbs-card')) jobModal(e.target.dataset.nbjob); });
/* DOM rebuilds triggered by a 'change' event wait until the pointer is released, so the click that caused the blur is not lost */
let ptrDown=false; const ptrQ=[];
document.addEventListener('pointerdown',()=>{ ptrDown=true; },true);
const ptrUp=()=>{ ptrDown=false; if(ptrQ.length){ const q=ptrQ.splice(0); setTimeout(()=>q.forEach(f=>{ try{ f(); }catch(e){ console.error('[nbshop]',e); } }),0); } };
document.addEventListener('pointerup',ptrUp,true); document.addEventListener('pointercancel',ptrUp,true);
const later=f=>{ if(ptrDown) ptrQ.push(f); else f(); };
const NUMK=new Set(['w','h','pages','gsm','sides','coverSides','qty','edge']);
function onField(e){ const el=e.target; if(!el||!el.closest||!el.closest('.nbs-root')) return; const s=S(), fin=e.type==='change';
  try{
  if(el.dataset.nba&&el.dataset.nba.startsWith('chk:')&&fin){ const [,id,k,sid]=el.dataset.nba.split(':'), j=jobBy(id); if(!j) return; const st_=sid||j.stage; j.checks=j.checks||{}; const L=j.checks[st_]=j.checks[st_]||[]; L[+k]=el.checked; j.upd=Date.now(); KS.save();
    const lab=el.closest('.nbs-ci'); if(lab) lab.classList.toggle('on',el.checked); if(!sid||sid===j.stage) setTimeout(()=>{ if(view()==='board') drawScreen(); },0); return; }
  if(el.dataset.nbk){ const [g,f,f2]=el.dataset.nbk.split('|'), tgt=g==='calc'?s.calc:g==='board'?s.board:g==='spine'?s.spine:null; if(!tgt) return;
    let v=el.type==='checkbox'?el.checked:el.value;
    if(f==='extras'){ if(!fin) return; tgt.extras[f2]=!!v; KS.save(); renderQuote(); return; }
    if(f==='card'&&v!=='none') v=num(v); else if(NUMK.has(f)) { if(String(v).trim()===''&&!fin) return; v=num(v,tgt[f]); }
    if(f==='fmt'){ if(!fin) return; tgt.fmt=v; const F=FORMATS.find(q=>q.id===v); if(F){ tgt.w=F.w; tgt.h=F.h; } KS.save(); drawPanel(); renderQuote(); return; }
    tgt[f]=v; if(g==='calc'&&(f==='w'||f==='h')){ const F=FORMATS.find(q=>q.w===+tgt.w&&q.h===+tgt.h); tgt.fmt=F?F.id:'custom'; }
    KS.save(); if(g==='calc'){ renderQuote(); if(fin&&(f==='w'||f==='h'||f==='qty')) later(()=>KS.keepFocus(boxEl,drawPanel)); } else if(g==='board'){ drawScreen(); } else if(g==='spine'){ drawScreen(); } return; }
  if(el.dataset.nbp){ const path=el.dataset.nbp.split('|'); let o=s.prices; for(let i=0;i<path.length-1;i++) o=o[path[i]]; if(!o) return; const last=path[path.length-1];
    if(path[0]==='round') o[last]=el.value; else { if(String(el.value).trim()===''&&!fin) return; o[last]=num(el.value,o[last]); }
    KS.save(); renderQuote(); if(fin&&boxEl&&view()==='calc') later(()=>KS.keepFocus(boxEl,drawPanel)); return; }
  if(el.dataset.nbm){ const [id,f]=el.dataset.nbm.split('|'), m=s.mats.find(q=>q.id===id); if(!m) return; m[f]=f==='name'?el.value:Math.max(0,num(el.value,m[f])); KS.save(); if(fin&&f!=='name') later(()=>{ drawScreen(); drawPanel(); }); return; }
  if(el.dataset.nbsh==='title'){ const v=SW(); v.title=el.value.slice(0,40); KS.save(); [showOv,scrEl].forEach(r=>{ const stg=r&&r.querySelector('.nbs-swstage'); if(stg){ const c=showCfg(); stg.innerHTML=nbPreview(c,coverObj(v.cover),true)+`<svg class="nbs-swpage" viewBox="0 0 ${c.w} ${c.h}">${pageArt(v.page,c.w,c.h)}</svg>`; } }); return; }
  if(el.dataset.nbj&&JD){ const j=jobBy(JD); if(!j) return; if(!fin) return; const k_=el.dataset.nbj, v_=el.value; later(()=>{ jobSet(j,k_,v_); if(k_==='stage') jobModal(j.id); }); return; }
  if(OD&&/^nbsO/.test(el.id)){ if(el.id==='nbsOs') OD.touched=true; odRefresh(); }
  }catch(err){ console.error('[nbshop] field',err); } }
document.addEventListener('input',onField); document.addEventListener('change',onField);

/* drag & drop on the board (mouse / pen); on touch the stage buttons are used */
document.addEventListener('pointerdown',e=>{ if(e.pointerType==='touch'||e.button>0) return; const c=e.target.closest&&e.target.closest('.nbs-card'); if(!c||!scrEl||!scrEl.contains(c)||e.target.closest('button,input,label,a,select')) return;
  drag={card:c,id:c.dataset.nbjob,x0:e.clientX,y0:e.clientY,on:false,over:null}; });
document.addEventListener('pointermove',e=>{ const d=drag; if(!d) return; if(!d.on){ if(Math.hypot(e.clientX-d.x0,e.clientY-d.y0)<6) return; d.on=true; const r=d.card.getBoundingClientRect(); d.dx=d.x0-r.left; d.dy=d.y0-r.top;
    d.ghost=d.card.cloneNode(true); d.ghost.classList.add('nbs-ghost'); d.ghost.style.width=r.width+'px'; document.body.appendChild(d.ghost); d.card.classList.add('dragging'); document.documentElement.classList.add('nbs-dragging'); }
  e.preventDefault(); d.ghost.style.transform=`translate(${e.clientX-d.dx}px,${e.clientY-d.dy}px) rotate(1.5deg)`;
  const col=document.elementFromPoint(e.clientX,e.clientY), cc=col&&col.closest&&col.closest('.nbs-col'); if(d.over!==cc){ if(d.over) d.over.classList.remove('over'); d.over=cc; if(cc) cc.classList.add('over'); }
  const b=scrEl&&scrEl.querySelector('.nbs-board'); if(b){ const br=b.getBoundingClientRect(); if(e.clientX>br.right-50) b.scrollLeft+=14; else if(e.clientX<br.left+50) b.scrollLeft-=14; } });
function dragEnd(drop){ const d=drag; drag=null; if(!d||!d.on) return; d.ghost&&d.ghost.remove(); d.card.classList.remove('dragging'); document.documentElement.classList.remove('nbs-dragging'); if(d.over) d.over.classList.remove('over'); justDragged=Date.now();
  if(!drop||!d.over) return; const j=jobBy(d.id), to=d.over.dataset.nbst; if(j&&to&&to!==j.stage&&setStage(j,to)){ commit(); drawScreen(); KS.toast(`№ ${live(j).no} → ${SNAME[to]}`); } }
document.addEventListener('pointerup',()=>dragEnd(true)); document.addEventListener('pointercancel',()=>dragEnd(false));
document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&drag&&drag.on){ dragEnd(false); } });

/* ⌘K */
KS.cmd('Блокноты: производство и сводка','раздел',()=>go('dash'));
KS.cmd('Блокноты: доска производства','раздел',()=>go('board'));
KS.cmd('Блокноты: прайс и калькулятор','раздел',()=>go('calc'));
KS.cmd('Блокноты: склад материалов','раздел',()=>go('mats'));
KS.cmd('Блокноты: витрина для клиента','раздел',()=>{ go('show'); openShow(); });
KS.cmd('Блокноты: прайс для клиентов (печать)','печать',()=>KS.print(pricePages()));
/* API for other modules / tests */
KS.nbShop={store:S,quote,calcCfg,showCfg,usage,findMat,setStage,createJob,sync,pricePages,shopPages,shopList,thickOf,pickSpiral,pickWire,openShow,closeShow,go,jobs:jobsAll,live,
  addOrder:(cfg,o)=>createJob(Object.assign({cfg,src:'api'},o||{}))};
