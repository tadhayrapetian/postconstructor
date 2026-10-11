/* ===== nbextra: «Блокноты» → «Аксессуары» — dividers, planner stickers, bookmarks, pockets, labels, refills,
   personalization by a list of names, gift set packaging. Everything is drawn as one SVG per A4 sheet (vector, mm units). ===== */
KS.mod('nbextra',{title:'Аксессуары для блокнотов'});
const X=s=>KS.esc(String(s==null?'':s));
const NBX_DEF={kind:'div',theme:'sage',lang:'ru',qk:{},size:'nb',bind:'rings',spine:10,holes:'',discPitch:21.6,logo:true,
  div:{src:'months',n:12,custom:'Идеи\nПроекты\nФинансы\nЗдоровье\nПутешествия',pos:'side',tint:true,one:false},
  stk:{groups:['check','flag','date','weather','habit','imp','bday','num','arrow','washi'],kiss:true,fill:true},
  bm:{type:'ribbon',text:'',sub:''},
  pk:{type:'pocket',loop:12},
  lb:{type:'school',subj:'математике',cls:'5 «А»',school:'№ 12',name:'',girl:false,phone:'',reward:true},
  rf:{fmt:'a5r',page:'lined',sheets:10,step:6,duplex:true,rev:false},
  ps:{text:'',title:true,label:true,lkind:'owner',cover:true},
  gf:{type:'band',brand:'',text:'',msg:'',bandH:60}};
const S=()=>{ const s=KS.store('nbextra',NBX_DEF); for(const k in NBX_DEF){ const d=NBX_DEF[k]; if(d&&typeof d==='object'&&!Array.isArray(d)){ if(!s[k]||typeof s[k]!=='object') s[k]={}; for(const j in d) if(!(j in s[k])) s[k][j]=JSON.parse(JSON.stringify(d[j])); } } return s; };
const f2=n=>{ const v=Math.round((+n||0)*100)/100; return String(v); };
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const Q=()=>{ const s=S(); if(!s.qk||typeof s.qk!=='object') s.qk={}; return +s.qk[s.kind]||1; };
let UID=0; const uid=p=>'nbx'+(p||'')+(++UID).toString(36);

/* ---------- colour themes, fonts, languages ---------- */
const THEMES={
  sage:{n:'Шалфей',ink:'#2e3b33',acc:'#5f8a6c',soft:'#eaf1ea',tabs:['#8fb39a','#d6bf8a','#d29b8c','#9bb6cc','#b9a6d1','#e0a96d']},
  blush:{n:'Пудра',ink:'#4a2f35',acc:'#c0717e',soft:'#f8ebec',tabs:['#e3a1aa','#f0c39c','#c4afd9','#a6c8d6','#ecd488','#b2d0ad']},
  ocean:{n:'Море',ink:'#1f3347',acc:'#2f7fb0',soft:'#e7f1f8',tabs:['#4f9fd0','#4fb0a3','#8aa7e0','#eeb055','#e07a6a','#9b8fd6']},
  sun:{n:'Лимон',ink:'#3b3320',acc:'#c98d0e',soft:'#fbf4dc',tabs:['#f2c14e','#f78154','#4d9078','#5fad56','#b4436c','#5b8ed6']},
  berry:{n:'Ягоды',ink:'#3a1f3d',acc:'#9c3d7a',soft:'#f6e9f2',tabs:['#9c3d7a','#d65a7e','#f29e4c','#6c4f9c','#3f88a5','#e0bd3a']},
  kraft:{n:'Крафт',ink:'#3d2f22',acc:'#9a6b3f',soft:'#f3ebdf',tabs:['#b98b5e','#8c9a6b','#c47d5a','#7f8fa6','#cfab72','#a37b8f']},
  rainbow:{n:'Радуга',ink:'#262626',acc:'#e4572e',soft:'#fff4ec',tabs:['#e4572e','#f3a712','#3bb273','#00a5cf','#7e52a0','#ff70a6']},
  mono:{n:'Графит',ink:'#222222',acc:'#4a4a4a',soft:'#efefef',tabs:['#333333','#5e5e5e','#808080','#a3a3a3','#474747','#6e6e6e']}};
const TH=()=>THEMES[S().theme]||THEMES.sage;
const FS="Manrope, 'Noto Sans Armenian', sans-serif", FH="'Cormorant Garamond', 'Noto Serif Armenian', serif", FW="'Marck Script', 'Noto Serif Armenian', cursive", FC="Caveat, 'Noto Sans Armenian', cursive", FM="'PT Mono', monospace";
const LG={
  ru:{n:'Русский',imp:'Важно',urgent:'Срочно',call:'Позвонить',pay:'Оплатить',meet:'Встреча',done:'Сделано',dl:'Дедлайн',idea:'Идея',goal:'Цель',note:'Заметка',bday:'День рождения',happy:'С днём рождения!',
    week:['Пн','Вт','Ср','Чт','Пт','Сб','Вс'],weekFull:['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье'],
    months:['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
    weather:['Солнце','Облачно','Дождь','Снег','Гроза','Ветер'],habits:['Вода','Чтение','Спорт','Сон','Фрукты','Прогулка'],
    subj:['Русский язык','Литература','Математика','Алгебра','Геометрия','Физика','Химия','Биология','История','География','Английский язык','Информатика'],
    owner:'Этот блокнот принадлежит',found:'Если найдёте, пожалуйста, верните',reward:'Вознаграждение гарантировано',tel:'Тел.',
    thanks:'Спасибо!',thanksMsg:'Спасибо, что выбрали блокнот ручной работы. Пусть в нём живут самые смелые идеи!',forYou:'Для тебя',from:'от',
    care:'Уход за блокнотом',tips:['Храните вдали от влаги и прямого солнца','Пишите гелевой или шариковой ручкой','Не перегибайте обложку и кольца','Обложку протирайте сухой мягкой тканью','Храните блокнот лёжа или на полке'],
    date:'Дата',week1:'Неделя'},
  hy:{n:'Հայերեն',imp:'Կարևոր',urgent:'Շտապ',call:'Զանգել',pay:'Վճարել',meet:'Հանդիպում',done:'Արված է',dl:'Վերջնաժամկետ',idea:'Գաղափար',goal:'Նպատակ',note:'Նշում',bday:'Ծննդյան օր',happy:'Շնորհավոր ծնունդդ',
    week:['Երկ','Երք','Չրք','Հնգ','Ուրբ','Շբթ','Կիր'],weekFull:['Երկուշաբթի','Երեքշաբթի','Չորեքշաբթի','Հինգշաբթի','Ուրբաթ','Շաբաթ','Կիրակի'],
    months:['Հունվար','Փետրվար','Մարտ','Ապրիլ','Մայիս','Հունիս','Հուլիս','Օգոստոս','Սեպտեմբեր','Հոկտեմբեր','Նոյեմբեր','Դեկտեմբեր'],
    weather:['Արև','Ամպամած','Անձրև','Ձյուն','Ամպրոպ','Քամի'],habits:['Ջուր','Ընթերցանություն','Սպորտ','Քուն','Մրգեր','Զբոսանք'],
    subj:['Հայոց լեզու','Գրականություն','Մաթեմատիկա','Հանրահաշիվ','Երկրաչափություն','Ֆիզիկա','Քիմիա','Կենսաբանություն','Պատմություն','Աշխարհագրություն','Անգլերեն','Ինֆորմատիկա'],
    owner:'Այս տետրը պատկանում է',found:'Եթե գտնեք, խնդրում ենք վերադարձնել',reward:'Վարձատրությունը երաշխավորված է',tel:'Հեռ.',
    thanks:'Շնորհակալություն',thanksMsg:'Շնորհակալություն, որ ընտրեցիք ձեռքի աշխատանքի տետրը։ Թող այն լցվի լավագույն մտքերով։',forYou:'Քեզ համար',from:'ումից',
    care:'Ինչպես խնամել',tips:['Պահեք խոնավությունից և արևից հեռու','Գրեք գելային կամ գնդիկավոր գրիչով','Մի ծալեք կազմը և օղակները','Կազմը մաքրեք չոր փափուկ կտորով','Պահեք պառկած կամ դարակում'],
    date:'Ամսաթիվ',week1:'Շաբաթ'},
  en:{n:'English',imp:'Important',urgent:'Urgent',call:'Call',pay:'Pay',meet:'Meeting',done:'Done',dl:'Deadline',idea:'Idea',goal:'Goal',note:'Note',bday:'Birthday',happy:'Happy birthday!',
    week:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],weekFull:['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
    months:['January','February','March','April','May','June','July','August','September','October','November','December'],
    weather:['Sunny','Cloudy','Rain','Snow','Storm','Windy'],habits:['Water','Reading','Workout','Sleep','Fruit','Walk'],
    subj:['English','Literature','Mathematics','Algebra','Geometry','Physics','Chemistry','Biology','History','Geography','Languages','Computer science'],
    owner:'This notebook belongs to',found:'If found, please return to',reward:'Reward guaranteed',tel:'Tel.',
    thanks:'Thank you!',thanksMsg:'Thank you for choosing a handmade notebook. May it hold your boldest ideas!',forYou:'For you',from:'from',
    care:'Notebook care',tips:['Keep away from moisture and direct sun','Write with gel or ballpoint pens','Do not overbend the cover or rings','Wipe the cover with a dry soft cloth','Store flat or upright on a shelf'],
    date:'Date',week1:'Week'}};
const LL=()=>LG[S().lang]||LG.ru;

/* ---------- small SVG helpers (units = mm) ---------- */
const est=(s,size,k)=>[...String(s)].length*size*(k||.6);
function tx(x,y,s,size,o){ o=o||{}; s=String(s==null?'':s); if(!s) return ''; let fs=size; if(o.max){ const e=est(s,size,o.k)+(o.ls||0)*[...s].length; if(e>o.max) fs=Math.max(o.min||1.4,size*o.max/e); }
  return `<text x="${f2(x)}" y="${f2(y)}" font-family="${o.f||FS}" font-size="${f2(fs)}" font-weight="${o.w||400}" fill="${o.c||'#222'}" text-anchor="${o.a||'start'}"${o.mid?' dominant-baseline="central"':''}${o.ls?` letter-spacing="${f2(o.ls)}"`:''}${o.it?' font-style="italic"':''}${o.op?` opacity="${o.op}"`:''}${o.tr?` transform="${o.tr}"`:''}>${X(s)}</text>`; }
const ln=(x1,y1,x2,y2,c,w,dash)=>`<line x1="${f2(x1)}" y1="${f2(y1)}" x2="${f2(x2)}" y2="${f2(y2)}" stroke="${c||'#999'}" stroke-width="${w||.2}"${dash?` stroke-dasharray="${dash}"`:''} stroke-linecap="round"/>`;
const rc=(x,y,w,h,o)=>{ o=o||{}; return `<rect x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}"${o.rx?` rx="${f2(o.rx)}"`:''} fill="${o.fill||'none'}"${o.st?` stroke="${o.st}" stroke-width="${o.sw||.2}"`:''}${o.dash?` stroke-dasharray="${o.dash}"`:''}${o.op?` opacity="${o.op}"`:''}/>`; };
const ci=(x,y,r,o)=>{ o=o||{}; return `<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(r)}" fill="${o.fill||'none'}"${o.st?` stroke="${o.st}" stroke-width="${o.sw||.2}"`:''}${o.op?` opacity="${o.op}"`:''}/>`; };
const CUT='#9a9a9a', CUTW=.22;
const cutPath=d=>`<path d="${d}" fill="none" stroke="${CUT}" stroke-width="${CUTW}"/>`;
const foldLine=(x1,y1,x2,y2)=>ln(x1,y1,x2,y2,'#8a8a8a',.22,'1.6 1.1');
function lum(h){ const m=String(h).replace('#',''); if(m.length<6) return 1; const r=parseInt(m.slice(0,2),16)/255,g=parseInt(m.slice(2,4),16)/255,b=parseInt(m.slice(4,6),16)/255; return .2126*r+.7152*g+.0722*b; }
const on=c=>lum(c)>.62?'#2a2a2a':'#ffffff';
function wrap(s,max){ const out=[]; let cur=''; String(s||'').split(/\s+/).forEach(w=>{ if(!w) return; if((cur+' '+w).trim().length>max&&cur){ out.push(cur); cur=w; } else cur=(cur+' '+w).trim(); }); if(cur) out.push(cur); return out; }
function hatch(id,c){ return `<defs><pattern id="${id}" width="2.2" height="2.2" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="2.2" stroke="${c||'#b9b9b9'}" stroke-width=".35"/></pattern></defs>`; }
/* 24×24 stroke icons */
const IC={sun:'M12 8a4 4 0 1 0 0 8a4 4 0 1 0 0-8M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  cloud:'M7 18h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6.2 9.1A4.5 4.5 0 0 0 7 18z',
  rain:'M7 14h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6.2 5.1A4.5 4.5 0 0 0 7 14zM8.5 17.5l-1 3M12.5 17.5l-1 3M16.5 17.5l-1 3',
  snow:'M7 14h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6.2 5.1A4.5 4.5 0 0 0 7 14zM8 18v.01M12 19.5v.01M16 18v.01M10 22v.01M14 22v.01',
  storm:'M7 14h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6.2 5.1A4.5 4.5 0 0 0 7 14zM13 15l-3 4h4l-3 4',
  wind:'M3 8h10a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7',
  drop:'M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z',
  book:'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 21V5M19 19v2H6',
  gym:'M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12',
  moon:'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z',
  apple:'M12 7c-2-2-7-1.5-7 4c0 4 3 9 5 9c1 0 1.5-.5 2-.5s1 .5 2 .5c2 0 5-5 5-9c0-5.5-5-6-7-4zM12 7c0-2 1-4 3-4',
  walk:'M8 4c1.7 0 2.5 2 2.5 4.5S9.5 13 8 13S5.5 11 5.5 8.5S6.3 4 8 4zM6 15.5h4V17a2 2 0 0 1-4 0zM16 8c1.7 0 2.5 2 2.5 4.5s-1 4.5-2.5 4.5s-2.5-2-2.5-4.5S14.3 8 16 8zM14 19.5h4V21a2 2 0 0 1-4 0z',
  cake:'M4 21h16M5 21v-7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7M5 16c2 1.5 4 1.5 7 0s5-1.5 7 0M12 12V8M12 4.5c.8.8.8 2 0 2.8c-.8-.8-.8-2 0-2.8z',
  star:'M12 3l2.7 5.6l6.1.9l-4.4 4.3l1 6.1L12 17l-5.4 2.9l1-6.1L3.2 9.5l6.1-.9z',
  excl:'M12 6v8M12 18v.01',check:'M5 12.5l4.5 4.5L19 7',
  heart:'M12 20s-7-4.4-9-8.6C1.6 8.1 3.6 4.6 7 4.6c2 0 3.4 1.1 5 2.9c1.6-1.8 3-2.9 5-2.9c3.4 0 5.4 3.5 4 6.8C19 15.6 12 20 12 20z',
  phone:'M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2',
  bulb:'M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z',
  coin:'M12 4a8 8 0 1 0 0 16a8 8 0 1 0 0-16M12 7v10M14.5 9.5c-.5-1-1.4-1.5-2.5-1.5c-1.5 0-2.5.8-2.5 2s1 1.7 2.5 2s2.5.8 2.5 2s-1 2-2.5 2c-1.2 0-2.1-.5-2.6-1.5',
  clock:'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18M12 7v5l3 2',
  people:'M9 11a3.5 3.5 0 1 0 0-7a3.5 3.5 0 1 0 0 7M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 4.5a3.3 3.3 0 0 1 0 6.4M18 14c2 .8 3 2.8 3 6'};
const icon=(k,x,y,s,c,sw)=>`<g transform="translate(${f2(x)} ${f2(y)}) scale(${f2(s/24)})"><path d="${IC[k]||IC.star}" fill="none" stroke="${c}" stroke-width="${f2((sw||.45)*24/s)}" stroke-linecap="round" stroke-linejoin="round"/></g>`;
/* TH brand mark: uses the postcard module's mark when present, otherwise a simple monogram */
function thMark(x,y,w,h,c){ try{ if(KS.thSVG&&typeof dzPal==='function'){ const s=KS.thSVG({v:w/h>1.6?'word':'monoword',sub:'',color:c},dzPal({ink:c}));
      if(s&&s.startsWith('<svg')) return s.replace(/^<svg([^>]*?)width="100%" height="100%"/,`<svg$1x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}"`).replace(/style="position:absolute;inset:0;overflow:visible"/,'overflow="visible"'); } }catch(_){ }
  const s=Math.min(w,h); return `<g>${ci(x+w/2,y+h/2,s/2-.3,{st:c,sw:.25})}${tx(x+w/2,y+h/2+s*.14,'TH',s*.42,{f:FH,a:'middle',c,w:600})}</g>`; }

/* ---------- notebook (from the «notebook» module when present) ---------- */
const FMTS={a5:['A5',148,210],a6:['A6',105,148],b5:['B5',176,250],a4:['A4',210,297],tn:["Traveler's",110,210],pers:['Personal',95,171],pocket:['Pocket',81,120],hl:['Half Letter',140,216]};
const BINDS={rings:'кольца',disc:'диски',spiral:'спираль',wireo:'пружина Wire-O',staple:'скрепка',perfect:'клеевой корешок',sewn:'шитый',none:'без переплёта'};
function nbGet(){ try{ const n=KS.nb&&typeof KS.nb.get==='function'?KS.nb.get():null; return n&&+n.w>20&&+n.h>20?n:null; }catch(_){ return null; } }
function nb(){ const s=S(), n=nbGet(); let sp=0;
  if(n&&s.size==='nb'){ try{ sp=KS.nb.spineMM?+KS.nb.spineMM()||0:0; }catch(_){ }
    return {src:'nb',w:+n.w,h:+n.h,bind:n.binding||'none',title:n.title||'',owner:n.owner||'',year:n.year||'',spine:sp||+s.spine||10,has:true,name:fmtName(+n.w,+n.h)}; }
  const f=FMTS[s.size]||FMTS.a5; return {src:'own',w:f[1],h:f[2],bind:s.bind||'rings',title:'',owner:'',year:'',spine:+s.spine||10,has:!!n,name:f[0]}; }
function fmtName(w,h){ const k=Object.values(FMTS).find(f=>Math.abs(f[1]-w)<1.5&&Math.abs(f[2]-h)<1.5); return k?k[0]:''; }
/* punch positions along the binding edge (from the top of the leaf), standard where one exists */
const FILO={210:[19,19,70,19,19],171:[19,19,26,19,19],148:[19,19,32,19,19],120:[19,19,19,19,19]};
function holeSet(bind,h){ const s=S(), cus=String(s.holes||'').trim(); const kind=bind==='disc'?'disc':bind==='spiral'?'spiral':bind==='wireo'?'wireo':bind==='rings'?'ring':'';
  if(!kind) return null;
  if(cus){ const a=cus.split(/[\s,;]+/).map(v=>+String(v).replace(',','.')).filter(v=>v>0&&v<h); if(a.length) return {t:kind,ys:a}; }
  const even=p=>{ const n=Math.max(2,Math.floor((h-14)/p)+1), y0=(h-(n-1)*p)/2; return Array.from({length:n},(_,i)=>y0+i*p); };
  if(kind==='ring'){ const key=Object.keys(FILO).find(k=>Math.abs(k-h)<2); const g=key?FILO[key]:h>=250?[80,80,80]:[80]; const tot=g.reduce((a,b)=>a+b,0); let y=(h-tot)/2; const ys=[y]; g.forEach(d=>{ y+=d; ys.push(y); }); return {t:'ring',ys}; }
  if(kind==='disc') return {t:'disc',ys:even(clamp(+s.discPitch||21.6,10,40))};
  if(kind==='spiral') return {t:'spiral',ys:even(6.35)};
  return {t:'wireo',ys:even(8.467)}; }
function holesSVG(hs,w,right){ if(!hs) return ''; const c='#a3a3a3'; let o='';
  hs.ys.forEach(y=>{ if(hs.t==='ring') o+=ci(7,y,2.75,{st:c,sw:.2})+ln(5.8,y,8.2,y,c,.15)+ln(7,y-1.2,7,y+1.2,c,.15);
    else if(hs.t==='disc') o+=`<path d="M0 ${f2(y-1.3)}H3.4A2.2 2.2 0 1 1 3.4 ${f2(y+1.3)}H0" fill="none" stroke="${c}" stroke-width=".2"/>`;
    else if(hs.t==='spiral') o+=ci(4.5,y,2,{st:c,sw:.2});
    else o+=rc(2.5,y-2,4,4,{st:c,sw:.2}); });
  return right?`<g transform="translate(${f2(w)} 0) scale(-1 1)">${o}</g>`:o; }
const holesNeed=hs=>!hs?0:hs.t==='ring'?12:hs.t==='disc'?9:8;

/* ---------- imposition onto A4 ---------- */
const SW=210, SH=297;
function pack(iw,ih,o){ o=o||{}; const g=o.gap||0, A=o.full?[0,0,SW,SH]:[9,9,SW-9,SH-9];
  const fit=(a,b)=>{ const c=Math.floor((A[2]-A[0]+g+.01)/(a+g)), r=Math.floor((A[3]-A[1]+g+.01)/(b+g)); return {c,r,n:c*r,a,b}; };
  const p=fit(iw,ih), q=o.norot?{n:0}:fit(ih,iw), rot=q.n>p.n, F=rot?q:p; if(!F.n) return null;
  const gw=F.c*F.a+(F.c-1)*g, gh=F.r*F.b+(F.r-1)*g, x0=(SW-gw)/2, y0=(SH-gh)/2, cells=[];
  for(let r=0;r<F.r;r++) for(let c=0;c<F.c;c++) cells.push({x:x0+c*(F.a+g),y:y0+r*(F.b+g),w:F.a,h:F.b,rot:rot?90:0});
  return {cells,per:F.n,rot}; }
function place(it,c,back){ const W=c.w, H=c.h, need={l:Math.max(0,5.5-c.x),t:Math.max(0,5.5-c.y),r:Math.max(0,c.x+W-(SW-5.5)),b:Math.max(0,c.y+H-(SH-5.5))};
  let safe, tr; if(!c.rot){ safe=need; tr=`translate(${f2(c.x)} ${f2(c.y)})`; }
  else if(c.rot===90){ safe={t:need.r,l:need.t,r:need.b,b:need.l}; tr=`translate(${f2(c.x+W)} ${f2(c.y)}) rotate(90)`; }
  else { safe={t:need.l,l:need.b,r:need.t,b:need.r}; tr=`translate(${f2(c.x)} ${f2(c.y+H)}) rotate(-90)`; }
  return `<g transform="${tr}">${(back?it.b:it.f)(safe)}</g>`; }
function marks(cells){ if(!cells.length) return ''; const xs=new Set(), ys=new Set(); let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  cells.forEach(c=>{ xs.add(f2(c.x)); xs.add(f2(c.x+c.w)); ys.add(f2(c.y)); ys.add(f2(c.y+c.h)); x0=Math.min(x0,c.x); y0=Math.min(y0,c.y); x1=Math.max(x1,c.x+c.w); y1=Math.max(y1,c.y+c.h); });
  const k='#555', w=.15; let o='';
  /* ticks outside the grid when there is printable room, otherwise short ticks right on the cut line at the printable edge */
  xs.forEach(v=>{ v=+v; if(v<5.5||v>SW-5.5) return; o+=y0>=6.6?ln(v,Math.max(5.3,y0-4.6),v,y0-1.3,k,w):ln(v,5.6,v,8.6,k,w); o+=SH-y1>=6.6?ln(v,y1+1.3,v,Math.min(SH-5.3,y1+4.6),k,w):ln(v,SH-8.6,v,SH-5.6,k,w); });
  ys.forEach(v=>{ v=+v; if(v<5.5||v>SH-5.5) return; o+=x0>=6.6?ln(Math.max(5.3,x0-4.6),v,x0-1.3,v,k,w):ln(5.6,v,8.6,v,k,w); o+=SW-x1>=6.6?ln(x1+1.3,v,Math.min(SW-5.3,x1+4.6),v,k,w):ln(SW-8.6,v,SW-5.6,v,k,w); });
  return o; }
const sheet=(inner,name)=>KS.page(SW,SH,`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SW} ${SH}" width="${SW}mm" height="${SH}mm" style="position:absolute;left:0;top:0;display:block">${inner}</svg>`,name);
/* items: [{w,h,f(safe)->svg, b?(safe)->svg}] all of the same size. o: {gap, full, marks, duplex, name, norot} */
function impose(items,o){ o=o||{}; if(!items.length) return {pages:[],per:0,sheets:0};
  const a=items[0], P=pack(a.w,a.h,o); if(!P) return {pages:[],per:0,sheets:0,err:'big'}; const pages=[]; let sheets=0;
  for(let i=0;i<items.length;i+=P.per){ const ch=items.slice(i,i+P.per), cells=P.cells.slice(0,ch.length); sheets++;
    pages.push(sheet(ch.map((it,j)=>place(it,cells[j],false)).join('')+(o.marks===false?'':marks(cells)),o.name||'nbx'));
    if(o.duplex&&ch.some(it=>it.b)) pages.push(sheet(ch.map((it,j)=>{ const c=cells[j]; return it.b?place(it,{x:SW-c.x-c.w,y:c.y,w:c.w,h:c.h,rot:c.rot?-c.rot:0},true):''; }).join(''),(o.name||'nbx')+'-oborot')); }
  return {pages,per:P.per,sheets}; }
/* shrink an item that does not fit on A4 even when rotated */
function fitItem(it,o){ if(pack(it.w,it.h,o)) return {it,k:1}; const A=o&&o.full?[SW,SH]:[SW-18,SH-18]; const k=Math.min(A[0]/it.w,A[1]/it.h,A[0]/it.h,A[1]/it.w)*.999, k2=Math.max(Math.min(A[0]/it.w,A[1]/it.h),Math.min(A[0]/it.h,A[1]/it.w))*.999, kk=Math.max(k,k2);
  const sc=fn=>fn&&(sf=>`<g transform="scale(${kk.toFixed(4)})">${fn(sf)}</g>`); return {it:{w:it.w*kk,h:it.h*kk,f:sc(it.f),b:sc(it.b)},k:kk}; }

/* =================== 1. DIVIDERS WITH TABS =================== */
function divLabels(){ const d=S().div, L=LL(); let a;
  if(d.src==='months') a=L.months; else if(d.src==='subj') a=L.subj; else if(d.src==='week') a=L.weekFull;
  else if(d.src==='num') a=Array.from({length:clamp(+d.n||6,1,16)},(_,i)=>String(i+1));
  else a=String(d.custom||'').split('\n').map(x=>x.trim()).filter(Boolean);
  if(d.src!=='custom'&&d.src!=='num') a=a.slice(0,clamp(+d.n||a.length,1,a.length));
  return a.slice(0,16); }
function divItem(i,labels,N){ const d=S().div, T=TH(), n=nb(), w=n.w, h=n.h, tw=9, top=d.pos==='top', hs=holeSet(n.bind,h), bm=holesNeed(hs);
  const col=d.one?T.acc:T.tabs[i%T.tabs.length], lab=labels[i]||'', W=top?w:w+tw, H=top?h+tw:h, r=2.4, body=d.tint?T.soft:'#ffffff';
  return {w:W,h:H,f(){ const id=uid('d'); let o='', outline;
    if(!top){ const m=10, av=h-2*m, th=Math.min(av/N,42), ty=m+(av-th*N)/2+i*th;
      outline=`M0 0H${f2(w)}V${f2(ty)}H${f2(w+tw-r)}Q${f2(w+tw)} ${f2(ty)} ${f2(w+tw)} ${f2(ty+r)}V${f2(ty+th-r)}Q${f2(w+tw)} ${f2(ty+th)} ${f2(w+tw-r)} ${f2(ty+th)}H${f2(w)}V${f2(h)}H0Z`;
      o+=`<path d="${outline}" fill="${body}"/>`+rc(w-2.2,0,2.2,h,{fill:col,op:.9})+`<path d="M${f2(w-.01)} ${f2(ty)}H${f2(w+tw-r)}Q${f2(w+tw)} ${f2(ty)} ${f2(w+tw)} ${f2(ty+r)}V${f2(ty+th-r)}Q${f2(w+tw)} ${f2(ty+th)} ${f2(w+tw-r)} ${f2(ty+th)}H${f2(w-.01)}Z" fill="${col}"/>`;
      const cx=w+tw/2-.3, cy=ty+th/2; o+=tx(0,0,tabLab(lab,th-4,i),3.3,{a:'middle',mid:true,c:on(col),w:700,max:th-4,tr:`translate(${f2(cx)} ${f2(cy)}) rotate(90)`}); }
    else { const m=bm+8, av=w-m-8, tl=Math.min(av/N,40), tx0=m+(av-tl*N)/2+i*tl;
      outline=`M0 ${tw}H${f2(tx0)}V${f2(r)}Q${f2(tx0)} 0 ${f2(tx0+r)} 0H${f2(tx0+tl-r)}Q${f2(tx0+tl)} 0 ${f2(tx0+tl)} ${f2(r)}V${tw}H${f2(w)}V${f2(H)}H0Z`;
      o+=`<path d="${outline}" fill="${body}"/>`+rc(0,tw,w,2.2,{fill:col,op:.9})+`<path d="M${f2(tx0)} ${f2(tw+.01)}V${f2(r)}Q${f2(tx0)} 0 ${f2(tx0+r)} 0H${f2(tx0+tl-r)}Q${f2(tx0+tl)} 0 ${f2(tx0+tl)} ${f2(r)}V${f2(tw+.01)}Z" fill="${col}"/>`;
      o+=tx(tx0+tl/2,tw/2+.3,tabLab(lab,tl-3,i),3.3,{a:'middle',mid:true,c:on(col),w:700,max:tl-3}); }
    const oy=top?tw:0, x0=bm+9, numC=lum(col)>.8?T.acc:col;
    o+=`<g transform="translate(0 ${oy})">`+tx(x0,28,String(i+1).padStart(2,'0'),15,{f:FH,c:numC,w:500})+tx(x0,44,lab,9.5,{f:FH,c:T.ink,w:600,max:w-x0-14})+ln(x0,50,x0+26,50,numC,.6)+(d.src==='months'?monthCal(x0,60,w-x0-12,i,numC):'')
      +(S().logo?thMark(w/2-7,h-22,14,14,T.acc):'')+holesSVG(hs,w,false)+`</g>`;
    return `<g id="${id}">${o}${cutPath(outline)}</g>`; }}; }
function tabLab(lab,avail,i){ if(est(lab,3.3,.56)*2.6/3.3<=avail) return lab; const d=S().div; if(d.src==='months') return LL().months[i].slice(0,3); const n=Math.max(2,Math.floor(avail/(2.6*.56))); return lab.length>n?lab.slice(0,n-1)+'.':lab; }
function monthCal(x,y,w,m,col){ const L=LL(), T=TH(), Y=+String(nb().year||'').slice(0,4)||new Date().getFullYear(), cw=Math.min(8,w/7), first=(new Date(Y,m,1).getDay()+6)%7, days=new Date(Y,m+1,0).getDate(); let o=tx(x,y,Y,3,{c:col,w:700,ls:.4});
  L.week.forEach((d,k)=>{ o+=tx(x+k*cw+cw/2,y+7,d.slice(0,2),2.2,{a:'middle',c:k>4?col:'#8a8a8a',w:700}); });
  for(let dd=1;dd<=days;dd++){ const p=first+dd-1, r=Math.floor(p/7), c=p%7; o+=tx(x+c*cw+cw/2,y+12.5+r*cw*.78,dd,2.6,{a:'middle',c:c>4?col:T.ink}); } return o; }
function divBuild(){ const s=S(), labels=divLabels(), N=Math.max(1,labels.length), q=clamp(Q(),1,50), items=[];
  for(let k=0;k<q;k++) for(let i=0;i<N;i++) items.push(divItem(i,labels,N));
  const fi=items.length?fitItem(items[0],{gap:4}):{k:1}; const all=fi.k<1?items.map(it=>fitItem(it,{gap:4}).it):items;
  const R=impose(all,{gap:4,marks:false,name:'razdeliteli'}); const n=nb(), warn=[];
  if(!labels.length) warn.push('Нет названий разделов: впишите их построчно.');
  if(fi.k<1) warn.push(`Разделитель больше листа A4 — уменьшен до ${Math.round(fi.k*100)} %.`);
  if(!holeSet(n.bind,n.h)) warn.push(`Переплёт «${BINDS[n.bind]||n.bind}» — разделители без отверстий, их вклеивают или вкладывают.`);
  return {pages:R.pages,focus:items[0]&&items[Math.min(1,items.length-1)],items:N*q,unit:'разделит.',per:R.per,sheets:R.sheets,
    paper:'Картон 200–300 г/м², задний лоток, по одному листу',warn}; }

/* =================== 2. PLANNER STICKERS =================== */
const STK_GROUPS={check:'Чекбоксы',flag:'Флажки',date:'Даты и месяцы',weather:'Погода',habit:'Привычки',imp:'«Важно»',bday:'Дни рождения',num:'Номера',arrow:'Стрелки',washi:'Васи-ленты'};
function stkGroup(g){ const T=TH(), L=LL(), out=[], P=(w,h,cut,body)=>out.push({grp:g,w,h,cut,body});
  const rr=(w,h,r)=>`M${r} 0H${f2(w-r)}Q${f2(w)} 0 ${f2(w)} ${r}V${f2(h-r)}Q${f2(w)} ${f2(h)} ${f2(w-r)} ${f2(h)}H${r}Q0 ${f2(h)} 0 ${f2(h-r)}V${r}Q0 0 ${r} 0Z`;
  const circ=d=>`M0 ${d/2}A${d/2} ${d/2} 0 1 0 ${d} ${d/2}A${d/2} ${d/2} 0 1 0 0 ${d/2}Z`;
  if(g==='check'){ for(let i=0;i<4;i++) P(58,10,rr(58,10,2),rc(1,1,56,8,{rx:1.4,fill:T.soft})+rc(3.4,2.6,4.8,4.8,{rx:.8,st:T.acc,sw:.35,fill:'#fff'})+ln(11,7.3,54,7.3,T.tabs[i%6],.3));
    for(let i=0;i<6;i++) P(11,11,circ(11),ci(5.5,5.5,4.5,{fill:T.tabs[i]})+icon('check',2.3,2.3,6.4,on(T.tabs[i]),.75)); }
  if(g==='flag'){ [L.urgent,L.call,L.pay,L.meet,L.dl,L.idea].forEach((t,i)=>{ const c=T.tabs[i%6]; P(38,10,'M0 0H38L34 5L38 10H0Z',`<path d="M1 1H35.6L32.4 5L35.6 9H1Z" fill="${c}"/>`+rc(1,1,2.4,8,{fill:'#000',op:.12})+tx(5.2,5,t,3.3,{mid:true,c:on(c),w:700,max:26})); }); }
  if(g==='date'){ for(let d=1;d<=31;d++){ const c=T.tabs[(d-1)%6]; P(12,12,rr(12,12,2),rc(1,1,10,10,{rx:1.5,fill:'#fff',st:c,sw:.45})+rc(1,1,10,2.8,{rx:1.2,fill:c})+tx(6,7.9,d,4.6,{a:'middle',mid:true,c:T.ink,w:700})); }
    L.months.forEach((m,i)=>{ const c=T.tabs[i%6]; P(29,9,rr(29,9,4.5),rc(1,1,27,7,{rx:3.5,fill:c})+tx(14.5,4.6,m,3.1,{a:'middle',mid:true,c:on(c),w:700,max:23})); }); }
  if(g==='weather'){ ['sun','cloud','rain','snow','storm','wind'].forEach((k,i)=>P(16,16,circ(16),ci(8,8,7,{fill:T.soft,st:T.acc,sw:.3})+icon(k,4.6,2.6,6.8,T.acc,.5)+tx(8,12,L.weather[i],1.9,{a:'middle',mid:true,c:T.ink,w:600,max:11}))); }
  if(g==='habit'){ ['drop','book','gym','moon','apple','walk'].forEach((k,i)=>{ const c=T.tabs[i%6]; P(16,16,circ(16),ci(8,8,7,{fill:c})+icon(k,4.6,2.6,6.8,on(c),.55)+tx(8,12,L.habits[i],1.9,{a:'middle',mid:true,c:on(c),w:700,max:11.5})); }); }
  if(g==='imp'){ for(let i=0;i<3;i++) P(28,10,rr(28,10,5),rc(1,1,26,8,{rx:4,fill:T.acc})+icon('star',3,2.2,5.6,'#fff',.55)+tx(17,5,L.imp,3.4,{a:'middle',mid:true,c:'#fff',w:800,max:17}));
    [[L.goal,'excl'],[L.note,'bulb'],[L.done,'check']].forEach(([t,k],i)=>{ const c=T.tabs[(i+1)%6]; P(28,10,rr(28,10,5),rc(1,1,26,8,{rx:4,fill:c})+icon(k,3,2.2,5.6,on(c),.6)+tx(17,5,t,3.3,{a:'middle',mid:true,c:on(c),w:700,max:17})); }); }
  if(g==='bday'){ for(let i=0;i<2;i++) P(42,20,rr(42,20,3),rc(1,1,40,18,{rx:2.4,fill:T.soft,st:T.tabs[i*2],sw:.4})+icon('cake',3,4,11,T.acc,.55)+tx(16,8,L.bday,3.4,{mid:true,c:T.ink,w:700,max:18.5})+ln(16,14,38,14,T.tabs[i*2],.3)+icon('heart',35.5,2.8,3.6,T.tabs[i*2+1],.4));
    P(42,20,rr(42,20,3),rc(1,1,40,18,{rx:2.4,fill:T.acc})+tx(21,10.2,L.happy,4.6,{a:'middle',mid:true,f:FW,c:'#fff',max:36})); }
  if(g==='num'){ for(let k=1;k<=20;k++){ const c=T.tabs[(k-1)%6]; P(9,9,circ(9),ci(4.5,4.5,3.7,{fill:'#fff',st:c,sw:.5})+tx(4.5,4.7,k,3.4,{a:'middle',mid:true,c:T.ink,w:700})); } }
  if(g==='arrow'){ const A=[`M3 5H22M18 2L22 5L18 8`,`M5 5H24M8 2L4 5L8 8M20 2L24 5L20 8`,`M3 7.5C9 1 16 1 22 6M18.5 3.4L22.3 6.2L18 7.6`,`M3 2.5L22 7.5M17.8 8.6L22 7.5L19.4 3.9`];
    for(let i=0;i<6;i++){ const c=T.tabs[i%6]; P(28,10,rr(28,10,2),`<path d="${A[i%4]}" fill="none" stroke="${c}" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 0)"/>`); } }
  if(g==='washi'){ ['stripe','dots','grid','zig'].forEach((k,i)=>{ const id=uid('w'+k), c=T.tabs[i%6], c2=T.tabs[(i+2)%6], W=92, H=11; let zz='M0 0'; for(let x=0;x<=H;x+=1.375) zz+=`L${x%2.75?1.2:0} ${f2(x)}`;
      const edge=y=>{ let p=''; for(let k2=0;k2<=8;k2++) p+=`L${f2(W-(k2%2?1.2:0))} ${f2(k2*H/8)}`; return p; };
      let L2=''; for(let k2=8;k2>=0;k2--) L2+=`L${f2(k2%2?1.2:0)} ${f2(k2*H/8)}`; const path=`M0 0H${W}`+edge()+`H0`+L2+'Z';
      const pat=k==='stripe'?`<rect width="4" height="4" fill="${c}"/><rect width="2" height="4" fill="${c2}" opacity=".55"/>`:k==='dots'?`<rect width="4" height="4" fill="${c}"/><circle cx="2" cy="2" r=".7" fill="#fff"/>`:k==='grid'?`<rect width="4" height="4" fill="#fff"/><path d="M0 0H4M0 0V4" stroke="${c}" stroke-width=".6"/>`:`<rect width="4" height="4" fill="${T.soft}"/><path d="M0 3L1 1L2 3L3 1L4 3" fill="none" stroke="${c}" stroke-width=".45"/>`;
      P(W,H,path,`<defs><pattern id="${id}" width="4" height="4" patternUnits="userSpaceOnUse"${k==='stripe'?' patternTransform="rotate(45)"':''}>${pat}</pattern></defs><path d="${path}" fill="url(#${id})"/>`); }); }
  return out; }
function stkSet(){ const s=S().stk; return (s.groups||[]).filter(g=>STK_GROUPS[g]).flatMap(stkGroup); }
function shelfPages(list,fill){ const A=[10,10,SW-10,SH-10], gap=3.2, pages=[]; let cur=[], row=[], x=A[0], y=A[1], rh=0, lastG=null;
  const flushRow=()=>{ if(!row.length) return; const rw=row[row.length-1].x+row[row.length-1].it.w-A[0], dx=(A[2]-A[0]-rw)/2; row.forEach(p=>p.x+=dx); row=[]; };
  const put=(it,soft)=>{ if((lastG&&it.grp!==lastG&&x>A[0])||x+it.w>A[2]+.01){ flushRow(); x=A[0]; y+=rh+gap; rh=0; }
    if(y+it.h>A[3]+.01){ if(soft) return false; flushRow(); pages.push(cur); cur=[]; x=A[0]; y=A[1]; rh=0; }
    const p={it,x,y}; cur.push(p); row.push(p); x+=it.w+gap; rh=Math.max(rh,it.h); lastG=it.grp; return true; };
  list.forEach(it=>put(it));
  if(fill&&list.length){ let i=0, guard=0; while(guard++<600){ if(!put(list[i%list.length],true)){ /* try the next smaller one */ let ok=false; for(let k=1;k<list.length&&!ok;k++){ if(list[(i+k)%list.length].h<=list[i%list.length].h-1) { ok=put(list[(i+k)%list.length],true); if(ok) i+=k; } } if(!ok) break; } i++; } }
  flushRow(); if(cur.length) pages.push(cur); return pages; }
function stkBuild(){ const s=S(), list=stkSet(), q=clamp(Q(),1,50), kiss=s.stk.kiss!==false;
  const set=shelfPages(list,s.stk.fill!==false), pages=[];
  for(let k=0;k<q;k++) set.forEach(pg=>pages.push(sheet(pg.map(p=>`<g transform="translate(${f2(p.x)} ${f2(p.y)})">${p.it.body}${kiss?`<path d="${p.it.cut}" fill="none" stroke="#e05fa8" stroke-width=".18"/>`:''}</g>`).join(''),'naklejki')));
  const per=set.reduce((a,pg)=>a+pg.length,0);
  return {pages,focusSheet:true,items:per*q,unit:'наклеек',per:set[0]?set[0].length:0,sheets:pages.length,paper:'Самоклеящаяся бумага A4, матовая или глянцевая',
    warn:list.length?[]:['Отметьте хотя бы один набор наклеек.'],note:kiss?'Розовый контур — линия надсечки для плоттера или ножниц. Чтобы контур не печатался, снимите галочку.':''}; }

/* =================== 3. BOOKMARKS =================== */
const BM_TYPES={ribbon:'Лента',magnet:'Магнитная (сгиб)',corner:'Уголок',ruler:'Линейка'};
function bmText(){ const s=S(), n=nb(); return {t:(s.bm.text||n.title||(st.shop&&st.shop.name)||'Мой блокнот').trim(),sub:(s.bm.sub||n.owner||n.year||'').toString().trim()}; }
function bmItem(i){ const s=S(), T=TH(), n=nb(), type=s.bm.type, {t,sub}=bmText(), logo=s.logo, col=T.tabs[i%T.tabs.length];
  if(type==='ribbon'){ const W=38, L=clamp(Math.floor((n.h-14)/5)*5,110,200), out=`M0 0H${W}V${L}L${W/2} ${L-9}L0 ${L}Z`;
    return {w:W,h:L,f:()=>`<path d="${out}" fill="${T.soft}"/>`+rc(13,0,12,L,{fill:col,op:.85})+`<path d="M${W/2-6} ${L}V${L-6}L${W/2} ${L-9}L${W/2+6} ${L-6}V${L}" fill="${T.soft}"/>`
      +rc(2.6,2.6,W-5.2,L-16,{st:T.acc,sw:.25,rx:1.2})+ci(W/2,9,2.3,{fill:'#fff',st:CUT,sw:CUTW})
      +tx(0,0,t,7.2,{f:FH,w:600,c:on(col),a:'middle',mid:true,max:L-58,tr:`translate(${W/2} ${f2(L/2-8)}) rotate(-90)`})
      +(sub?tx(0,0,sub,2.8,{w:600,c:T.ink,a:'middle',mid:true,ls:.25,max:L-60,tr:`translate(${W/2-11} ${f2(L/2-8)}) rotate(-90)`}):'')
      +(logo?`<rect x="${W/2-8}" y="${L-36}" width="16" height="16" rx="8" fill="#fff"/>`+thMark(W/2-6.5,L-34.5,13,13,T.acc):'')+cutPath(out)}; }
  if(type==='magnet'){ const W=32, Hh=46, H=Hh*2;
    const face=(flip)=>{ const g=`${rc(0,0,W,Hh,{fill:T.soft})}${rc(0,Hh-9,W,9,{fill:col})}${tx(W/2,Hh-4.4,t,3.4,{a:'middle',mid:true,w:700,c:on(col),max:W-5})}${logo?thMark(W/2-8,7,16,16,T.acc):icon('heart',W/2-6,9,12,T.acc,.6)}${sub?tx(W/2,30,sub,2.6,{a:'middle',c:T.ink,w:600,max:W-6}):''}`;
      return flip?`<g transform="rotate(180 ${W/2} ${Hh/2})">${g}</g>`:g; };
    return {w:W,h:H,f:()=>face(true)+`<g transform="translate(0 ${Hh})">${face(false)}</g>`+foldLine(0,Hh,W,Hh)}; }
  if(type==='corner'){ const s2=50, g=10, W=2*s2, H=s2+g, out=`M0 ${g}H${s2}L${s2+g} 0H${W-2*g}L${W-g} ${g}H${W}L${s2} ${H}Z`, hid=uid('h');
    const front=`<path d="M${s2} ${g}H${W}L${s2} ${H}Z" fill="${col}"/>`+icon('heart',s2+5,g+5,9,on(col),.7)+tx(0,0,t,3.4,{w:700,c:on(col),a:'middle',mid:true,max:40,tr:`translate(${s2+19} ${g+24}) rotate(-45)`});
    return {w:W,h:H,f:()=>hatch(hid)+`<path d="M0 ${g}H${s2}L${s2} ${H}Z" fill="${T.soft}"/>`+front+`<path d="M${s2} ${g}L${s2+g} 0H${W-2*g}L${W-g} ${g}Z" fill="url(#${hid})"/>`
      +tx(s2+g+12,g-3.2,'клей',2.4,{c:'#888'})+tx(s2/2-4,g+14,'оборот',2.4,{c:'#999',a:'middle'})+foldLine(s2,g,s2,H)+foldLine(s2,g,W-g,g)+cutPath(out)}; }
  /* ruler: exact millimetre scale, print at 100 % */
  const W=30, L=clamp(Math.floor((n.h-12)/10)*10,100,200), len=L-10;
  return {w:W,h:L,f:()=>{ let o=rc(0,0,W,L,{fill:'#fff'})+rc(W-9,0,9,L,{fill:col,op:.9});
    for(let mm=0;mm<=len;mm++){ const y=5+mm, k=mm%10===0?5.5:mm%5===0?3.6:2.2; o+=ln(0,y,k,y,T.ink,mm%10===0?.22:.14); if(mm%10===0) o+=tx(7.2,y,mm/10,2.6,{mid:true,c:T.ink,w:600,f:FM}); }
    o+=tx(7.2,L-2.2,'см',2,{c:T.acc,w:700});
    o+=tx(0,0,t,3.6,{w:700,c:on(col),a:'middle',mid:true,max:len-30,tr:`translate(${W-4.5} ${f2(L/2+8)}) rotate(-90)`});
    if(logo) o+=thMark(W-8.3,4,7.6,7.6,on(col));
    return o; }}; }
function bmBuild(){ const s=S(), q=clamp(Q(),1,200), type=s.bm.type, items=Array.from({length:q},(_,i)=>bmItem(i));
  const rect=type==='magnet'||type==='ruler', R=impose(items,{gap:rect?3:4,marks:rect,name:'zakladki'}), warn=[];
  if(type==='ruler') warn.push('Линейка точная только при печати в масштабе 100 % — без «Вписать в страницу». Проверьте первую закладку настоящей линейкой.');
  return {pages:R.pages,focus:items[0],items:q,unit:'закладок',per:R.per,sheets:R.sheets,paper:type==='magnet'?'Бумага 160–200 г/м², магнитная лента на оборот':'Картон 250–300 г/м²',warn,
    note:type==='magnet'?'Согните по пунктиру, внутрь наклейте две полоски магнитной ленты.':type==='corner'?'Вырежьте по контуру, согните по пунктиру: серый треугольник уходит назад, клапан приклейте к нему.':''}; }

/* =================== 4. POCKETS & ENVELOPES (die-lines) =================== */
const PK_TYPES={pocket:'Кармашек на форзац',env:'Конверт',card:'Для визитки',penloop:'Петля для ручки'};
function pocketItem(pw,ph,label){ const T=TH(), fl=12, fb=14, W=pw+2*fl, H=ph+fb, cx=fl+pw/2, nr=Math.min(12,pw/6), hid=uid('h');
  const out=`M${fl} 0H${f2(cx-nr)}A${f2(nr)} ${f2(nr)} 0 0 0 ${f2(cx+nr)} 0H${f2(fl+pw)}L${f2(W)} 6V${f2(ph-8)}L${f2(fl+pw)} ${f2(ph)}L${f2(fl+pw-8)} ${f2(H)}H${f2(fl+8)}L${fl} ${f2(ph)}L0 ${f2(ph-8)}V6Z`;
  return {w:W,h:H,f:()=>hatch(hid)+`<path d="M${fl} 0H${f2(cx-nr)}A${f2(nr)} ${f2(nr)} 0 0 0 ${f2(cx+nr)} 0H${f2(fl+pw)}V${f2(ph)}H${fl}Z" fill="${T.soft}"/>`
    +`<path d="M${fl} 0L0 6V${f2(ph-8)}L${fl} ${f2(ph)}Z M${f2(fl+pw)} 0L${f2(W)} 6V${f2(ph-8)}L${f2(fl+pw)} ${f2(ph)}Z M${fl} ${f2(ph)}L${f2(fl+8)} ${f2(H)}H${f2(fl+pw-8)}L${f2(fl+pw)} ${f2(ph)}Z" fill="url(#${hid})"/>`
    +tx(fl/2,ph/2,'клей',2.4,{a:'middle',mid:true,c:'#888',tr:`rotate(-90 ${fl/2} ${f2(ph/2)})`})+tx(fl+pw+fl/2,ph/2,'клей',2.4,{a:'middle',mid:true,c:'#888',tr:`rotate(90 ${f2(fl+pw+fl/2)} ${f2(ph/2)})`})+tx(cx,ph+fb/2+.8,'клей',2.4,{a:'middle',c:'#888'})
    +rc(fl+3.5,nr+3,pw-7,ph-nr-6.5,{st:T.acc,sw:.25,rx:1.5,dash:'.01 1.1'})+(label?tx(cx,ph-8,label,3.6,{f:FH,w:600,a:'middle',c:T.ink,max:pw-14}):'')+(S().logo?thMark(cx-6,ph/2-8,12,12,T.acc):'')
    +foldLine(fl,0,fl,ph)+foldLine(fl+pw,0,fl+pw,ph)+foldLine(fl,ph,fl+pw,ph)+cutPath(out)}; }
function pkItem(){ const s=S(), T=TH(), n=nb(), type=s.pk.type;
  if(type==='pocket') return pocketItem(Math.round(Math.min(n.w-14,168)),Math.round(Math.min(n.h*.42,150)),'');
  if(type==='card') return pocketItem(96,60,'');
  if(type==='env'){ const ew=Math.round(clamp(n.w*.62,60,150)), eh=Math.round(clamp(n.h*.36,40,110)), fs=Math.round(ew*.22), ft=Math.round(eh*.55), fb=Math.round(eh*.66), W=ew+2*fs, H=ft+eh+fb, hid=uid('h');
    const out=`M${fs} ${ft}L${f2(fs+ew*.42)} 2.2Q${f2(fs+ew/2)} 0 ${f2(fs+ew*.58)} 2.2L${f2(fs+ew)} ${ft}L${f2(W-2)} ${f2(ft+eh*.25)}Q${f2(W)} ${f2(ft+eh/2)} ${f2(W-2)} ${f2(ft+eh*.75)}L${f2(fs+ew)} ${f2(ft+eh)}L${f2(fs+ew*.86)} ${f2(H-2.5)}Q${f2(fs+ew/2)} ${f2(H)} ${f2(fs+ew*.14)} ${f2(H-2.5)}L${fs} ${f2(ft+eh)}L2 ${f2(ft+eh*.75)}Q0 ${f2(ft+eh/2)} 2 ${f2(ft+eh*.25)}Z`;
    return {w:W,h:H,f:()=>hatch(hid)+`<path d="${out}" fill="#fff"/>`+rc(fs,ft,ew,eh,{fill:T.soft})+`<path d="M${fs} ${ft}L${f2(fs+ew*.42)} 2.2Q${f2(fs+ew/2)} 0 ${f2(fs+ew*.58)} 2.2L${f2(fs+ew)} ${ft}Z" fill="${T.tabs[0]}" opacity=".55"/>`
      +(S().logo?thMark(fs+ew/2-6,ft*.35,12,12,T.ink):'')+`<path d="M${f2(fs+ew*.14)} ${f2(H-2.5)}L${fs} ${f2(ft+eh)}L${f2(fs+6)} ${f2(ft+eh)}L${f2(fs+ew*.14+5)} ${f2(H-4)}Z M${f2(fs+ew*.86)} ${f2(H-2.5)}L${f2(fs+ew)} ${f2(ft+eh)}L${f2(fs+ew-6)} ${f2(ft+eh)}L${f2(fs+ew*.86-5)} ${f2(H-4)}Z" fill="url(#${hid})"/>`
      +tx(fs+ew/2,ft+eh+fb*.45,'клей по краям',2.4,{a:'middle',c:'#888'})+tx(fs+ew/2,ft+eh/2,nb().title||'',4,{f:FH,a:'middle',mid:true,c:T.ink,max:ew-12})
      +foldLine(fs,ft,fs+ew,ft)+foldLine(fs,ft+eh,fs+ew,ft+eh)+foldLine(fs,ft,fs,ft+eh)+foldLine(fs+ew,ft,fs+ew,ft+eh)+cutPath(out)}; }
  /* pen loop: a card strip rolled around the pen; both ends glued to the cover */
  const d=clamp(+s.pk.loop||12,8,20), ll=Math.round(Math.PI*d+3), g=22, W=ll+2*g, H=25, hid=uid('h');
  return {w:W,h:H,f:()=>hatch(hid)+rc(0,0,W,H,{fill:'#fff'})+rc(g,0,ll,H,{fill:T.soft})+rc(0,0,g,H,{fill:`url(#${hid})`})+rc(W-g,0,g,H,{fill:`url(#${hid})`})
    +tx(g/2,H/2,'клей',2.6,{a:'middle',mid:true,c:'#777'})+tx(W-g/2,H/2,'клей',2.6,{a:'middle',mid:true,c:'#777'})+tx(g+ll/2,H/2-2.5,`петля Ø ${d} мм`,3,{a:'middle',mid:true,c:T.ink,w:700})+tx(g+ll/2,H/2+3,'оберните вокруг ручки',2.2,{a:'middle',mid:true,c:T.acc})
    +foldLine(g,0,g,H)+foldLine(W-g,0,W-g,H)+cutPath(`M0 0H${W}V${H}H0Z`)}; }
function pkBuild(){ const s=S(), q=clamp(Q(),1,100), items=Array.from({length:q},()=>pkItem()), fi=fitItem(items[0],{gap:6}), all=fi.k<1?items.map(it=>fitItem(it,{gap:6}).it):items;
  const R=impose(all,{gap:6,marks:false,name:'karmashki'}), type=s.pk.type;
  return {pages:R.pages,focus:items[0],items:q,unit:'шт.',per:R.per,sheets:R.sheets,paper:type==='penloop'?'Плотная бумага 200–250 г/м²':'Бумага 120–160 г/м² или крафт',warn:fi.k<1?[`Развёртка больше A4 — уменьшена до ${Math.round(fi.k*100)} %.`]:[],
    note:'Сплошная линия — резать, пунктир — сгибать, штриховка — клей. Клапаны загибайте на непечатную сторону.'}; }

/* =================== 5. LABELS =================== */
const LB_TYPES={school:'Школьная тетрадь',owner:'Владелец',found:'«Если найдёте»',spine:'Корешок'};
function underl(x,y,label,val,w,c,ink){ const lw=label?est(label,3.1)+1.6:0; return (label?tx(x,y,label,3.1,{c:ink}):'')+ln(x+lw,y+.9,x+w,y+.9,'#9a9a9a',.2)+(val?tx(x+lw+(w-lw)/2,y-.2,val,4.6,{f:FC,a:'middle',c,w:700,max:w-lw-2}):''); }
function lbItem(type,p){ p=p||{}; const s=S(), T=TH(), L=LL(), lb=s.lb, n=nb(), name=p.name!=null?p.name:lb.name, logo=s.logo;
  if(type==='spine'){ const w=clamp(+n.spine||10,4,60), h=Math.max(60,n.h-20), t=p.title||n.title||lb.name||'Блокнот', y=n.year||String(new Date().getFullYear());
    return {w,h,f:()=>rc(0,0,w,h,{fill:T.acc})+rc(0,0,w,6,{fill:T.tabs[1]})+rc(0,h-6,w,6,{fill:T.tabs[1]})+tx(0,0,t,Math.min(w*.5,6),{f:FH,w:600,c:on(T.acc),a:'middle',mid:true,max:h-40,tr:`translate(${f2(w/2)} ${f2(h/2)}) rotate(90)`})
      +tx(0,0,y,Math.min(w*.32,3),{c:on(T.acc),a:'middle',mid:true,w:600,tr:`translate(${f2(w/2)} ${f2(h-14)}) rotate(90)`})}; }
  if(type==='school'){ const W=80, H=52, girl=p.girl!=null?p.girl:lb.girl;
    return {w:W,h:H,f:()=>rc(.6,.6,W-1.2,H-1.2,{rx:3,fill:'#fff',st:T.acc,sw:.5})+rc(2.2,2.2,W-4.4,H-4.4,{rx:2,st:T.acc,sw:.2})+tx(W/2,10.5,'Тетрадь',6.4,{f:FH,w:600,it:true,a:'middle',c:T.ink})
      +underl(6,19,'для работ по',p.subj!=null?p.subj:lb.subj,W-12,T.acc,T.ink)+underl(6,26.5,girl?'ученицы':'ученика',p.cls!=null?p.cls:lb.cls,W-26,T.acc,T.ink)+tx(W-6,26.5,'класса',3.1,{a:'end',c:T.ink})
      +underl(6,34,'школы',p.school!=null?p.school:lb.school,W-12,T.acc,T.ink)+underl(6,44,'',name,W-12,T.acc,T.ink)+tx(W/2,48.2,'фамилия, имя',1.9,{a:'middle',c:'#999'})}; }
  if(type==='owner'){ const W=80, H=42;
    return {w:W,h:H,f:()=>rc(.6,.6,W-1.2,H-1.2,{rx:3,fill:T.soft})+rc(.6,.6,5,H-1.2,{fill:T.acc})+tx(W/2+2.5,9,L.owner.toUpperCase(),2.4,{a:'middle',c:T.acc,w:700,ls:.35,max:W-14})
      +(name?tx(W/2+2.5,22,name,7.4,{f:FH,w:600,it:true,a:'middle',c:T.ink,max:W-14}):ln(12,23,W-6,23,'#999',.25))+ln(18,27,W-12,27,T.acc,.3)
      +tx(W/2+2.5,34,(p.phone||lb.phone)?L.tel+' '+(p.phone||lb.phone):(p.cls?p.cls:''),3,{a:'middle',c:T.ink,max:W-14})+(logo?thMark(W-13,H-11,8,8,T.acc):'')}; }
  const W=80, H=48; /* found */
  return {w:W,h:H,f:()=>rc(.6,.6,W-1.2,H-1.2,{rx:3,fill:'#fff',st:T.acc,sw:.45})+icon('heart',5,4.5,7,T.acc,.6)+tx(14,8.6,L.found,3,{c:T.ink,w:700,max:W-19})
    +(name?tx(W/2,21,name,6.4,{f:FH,w:600,it:true,a:'middle',c:T.ink,max:W-10}):ln(8,21,W-8,21,'#999',.25))+icon('phone',8,25.5,5,T.acc,.6)+((p.phone||lb.phone)?tx(15,29,p.phone||lb.phone,4,{w:700,c:T.ink,max:W-22}):ln(15,30,W-8,30,'#999',.25))
    +(lb.reward?rc(5,35,W-10,8,{rx:4,fill:T.tabs[0]})+tx(W/2,39.2,L.reward,2.8,{a:'middle',mid:true,c:on(T.tabs[0]),w:700,max:W-16}):'')}; }
function lbBuild(){ const s=S(), q=clamp(Q(),1,300), type=s.lb.type, items=Array.from({length:q},()=>lbItem(type));
  const R=impose(items,{gap:type==='spine'?2:3,name:'etiketki'});
  return {pages:R.pages,focus:items[0],items:q,unit:'этикеток',per:R.per,sheets:R.sheets,paper:type==='spine'?'Самоклеящаяся бумага или бумага 120 г/м² на клей':'Самоклеящаяся бумага A4',
    warn:type==='spine'&&nb().src!=='nb'?['Толщина корешка взята из настройки ниже — проверьте по блокноту.']:[]}; }

/* =================== 6. REFILLS =================== */
const RF_FMTS={a5r:['A5 · кольца, 6 отверстий',148,210,'rings'],a6r:['A6 · кольца, 6 отверстий',105,148,'rings'],pers:['Personal · кольца 95 × 171',95,171,'rings'],pocket:['Pocket · кольца 81 × 120',81,120,'rings'],
  a5d:['A5 · диски',148,210,'disc'],hld:['Half Letter · диски 140 × 216',140,216,'disc'],tn:["Traveler's · тетрадка 110 × 210",110,210,'book'],tnp:["Traveler's паспорт · 89 × 124",89,124,'book'],
  hobo:['Hobonichi A6 · клетка 3,7 мм',105,148,'none'],cousin:['Hobonichi Cousin A5',148,210,'none'],nb:['Как текущий блокнот',0,0,'nb']};
const PAGE_TYPES={lined:'Линейка',grid:'Клетка',dots:'Точки',blank:'Чистый',todo:'Список дел',week:'Неделя'};
/* page types of the «notebook» module, when it offers them */
function nbPageTypes(){ try{ if(KS.nb&&typeof KS.nb.types==='function'&&typeof KS.nb.typeSVG==='function') return (KS.nb.types()||[]).filter(t=>t&&t.id).map(t=>[t.id,t.n||t.name||t.id]); }catch(_){ } return []; }
function rfFmt(){ const r=S().rf, f=RF_FMTS[r.fmt]||RF_FMTS.a5r; if(f[3]==='nb'){ const n=nb(); return {n:'Как текущий блокнот',w:n.w,h:n.h,bind:n.bind}; } return {n:f[0],w:f[1],h:f[2],bind:f[3]}; }
function pageBody(type,w,h,m,step,idx){ const T=TH(), L=LL(), x0=m.l, x1=w-m.r, y0=m.t, y1=h-m.b, g='#cfcfcf'; let o=rc(0,0,w,h,{fill:'#fff'});
  if(type.startsWith('nb:')){ try{ const id=type.slice(3), r=KS.nb&&KS.nb.typeSVG?KS.nb.typeSVG(id,{},`x="0" y="0" width="${f2(w)}" height="${f2(h)}" preserveAspectRatio="xMidYMid meet"`):''; if(r) return o+r; }catch(e){ console.warn('[nbextra] page type',e); } type='lined'; }
  o+=ln(x0,y0,x0+8,y0,T.acc,.5);
  if(type==='lined'){ o+=tx(x1,y0+1.2,L.date+' ____________',2.2,{a:'end',c:'#a0a0a0'}); for(let y=y0+8;y<=y1+.01;y+=step) o+=ln(x0,y,x1,y,g,.18); }
  else if(type==='grid'||type==='dots'){ const gx0=x0, gy0=y0+4, nx=Math.floor((x1-gx0)/step), ny=Math.floor((y1-gy0)/step), ex=gx0+nx*step, ey=gy0+ny*step;
    if(type==='grid'){ for(let i=0;i<=nx;i++) o+=ln(gx0+i*step,gy0,gx0+i*step,ey,'#d6d6d6',.12); for(let j=0;j<=ny;j++) o+=ln(gx0,gy0+j*step,ex,gy0+j*step,'#d6d6d6',.12); }
    else { let d=''; for(let i=0;i<=nx;i++) for(let j=0;j<=ny;j++){ const x=gx0+i*step, y=gy0+j*step; d+=`M${f2(x)} ${f2(y)}h.01`; } o+=`<path d="${d}" stroke="#a8a8a8" stroke-width=".55" stroke-linecap="round"/>`; } }
  else if(type==='todo'){ for(let y=y0+8;y<=y1-1;y+=8){ o+=rc(x0,y-3.6,3.4,3.4,{rx:.6,st:T.acc,sw:.25})+ln(x0+5.5,y,x1,y,g,.18); } }
  else if(type==='week'){ const rh=(y1-y0-6)/7; o+=tx(x0+10,y0+1.2,L.week1+' ______',2.4,{c:'#a0a0a0'}); for(let i=0;i<7;i++){ const y=y0+6+i*rh; o+=ln(x0,y,x1,y,'#bdbdbd',.25)+tx(x0,y+3.6,L.weekFull[i],2.6,{c:T.acc,w:700})+ln(x0,y+rh*.55,x1,y+rh*.55,'#e2e2e2',.15); } o+=ln(x0,y1,x1,y1,'#bdbdbd',.25); }
  return o; }
function rfMargins(w,h,safe,bindSide,need){ const s={l:safe.l||0,t:safe.t||0,r:safe.r||0,b:safe.b||0}, inner=Math.max(8,need?need+5:0);
  return {l:Math.max(bindSide==='l'?inner:7,s.l+4),r:Math.max(bindSide==='r'?inner:7,s.r+4),t:Math.max(9,s.t+4),b:Math.max(8,s.b+4)}; }
function rfBuild(){ const s=S(), r=s.rf, F=rfFmt(), sheets=clamp(+r.sheets||1,1,200), step=clamp(+r.step||(r.fmt==='hobo'||r.fmt==='cousin'?3.7:6),3,12), type=r.page||'lined', q=clamp(Q(),1,50);
  const book=F.bind==='book', hs=book?null:holeSet(F.bind==='rings'||F.bind==='disc'||F.bind==='spiral'||F.bind==='wireo'?F.bind:'none',F.h), need=holesNeed(hs), items=[]; let pg=0;
  if(book){ /* saddle-stitched booklet: one spread per folded sheet, pages in reading order after folding */
    const P=sheets*4;
    for(let c=0;c<q;c++) for(let i=0;i<sheets;i++){ const fr=[P-2*i,2*i+1], bk=[2*i+2,P-2*i-1];
      const spread=(pair)=>safe=>{ const sl={l:safe.l,t:safe.t,r:0,b:safe.b}, sr={l:0,t:safe.t,r:safe.r,b:safe.b};
        return pageBody(type,F.w,F.h,rfMargins(F.w,F.h,sl,'r',0),step,pair[0])+`<g transform="translate(${F.w} 0)">${pageBody(type,F.w,F.h,rfMargins(F.w,F.h,sr,'l',0),step,pair[1])}</g>`+ln(F.w,0,F.w,2.5,'#bbb',.15)+ln(F.w,F.h-2.5,F.w,F.h,'#bbb',.15); };
      items.push({w:F.w*2,h:F.h,f:spread(fr),b:r.duplex?spread(bk):null}); }
    pg=P*q; }
  else for(let c=0;c<q;c++) for(let i=0;i<sheets;i++) items.push({w:F.w,h:F.h,f:safe=>pageBody(type,F.w,F.h,rfMargins(F.w,F.h,safe,'l',need),step,i*2)+holesSVG(hs,F.w,false),b:r.duplex?safe=>pageBody(type,F.w,F.h,rfMargins(F.w,F.h,safe,'r',need),step,i*2+1)+holesSVG(hs,F.w,true):null});
  const R=impose(items,{full:true,duplex:!!r.duplex,name:'smennyj-blok'}), pr=KS.printer(), warn=[];
  if(R.err) warn.push('Формат больше A4 — выберите другой.');
  if(r.duplex&&pr.duplex!=='auto') warn.push(`${pr.n}: двусторонняя только вручную — нажмите «Лицевые», переверните стопку по длинному краю, затем «Обороты».`);
  const leaves=book?sheets*q:sheets*q; if(!pg) pg=leaves*(r.duplex?2:1);
  return {pages:R.pages,focus:items[0],items:leaves,unit:book?'тетрадок · листов':'листов',per:R.per,sheets:R.sheets,duplex:!!r.duplex,paper:'Офисная 80–100 г/м²'+(hs?', отверстия по меткам дыроколом':''),warn,
    note:(book?`Тетрадка: ${sheets} лист., ${sheets*4} стр. Сложите листы стопкой пополам и прошейте по сгибу. `:'')+(r.duplex?'Двусторонняя: переворот по длинному краю. ':'')+'Режьте по меткам у краёв листа.'}; }

/* =================== 7. PERSONALIZATION BY A LIST =================== */
const PS_HDR={name:/^(имя|фио|ф\.?и\.?о\.?|name|full ?name|first ?name|անուն|ученик|ученица|клиент|гость|student|client)/i,sur:/^(фамилия|surname|last ?name|ազգանուն)/i,cls:/^(класс|class|grade|դասարան)/i,subj:/^(предмет|subject|առարկա)/i,school:/^(школа|school|դպրոց)/i,phone:/^(тел|телефон|phone|mobile|հեռ)/i};
function psParse(text){ const lines=String(text||'').split(/\r?\n/).map(l=>l.trim()).filter(Boolean); if(!lines.length) return [];
  const split=l=>(l.includes('\t')?l.split('\t'):l.includes(';')?l.split(';'):l.includes(',')?l.split(','):[l]).map(c=>c.trim().replace(/^"(.*)"$/,'$1').trim());
  let rows=lines.map(split), map=null; const h=rows[0].map(c=>{ for(const k in PS_HDR) if(PS_HDR[k].test(c)) return k; return ''; });
  if(h.includes('name')||h.includes('sur')){ map=h; rows=rows.slice(1); }
  return rows.map(r=>{ const o={name:'',cls:'',subj:'',school:'',phone:''};
    if(map){ let sur=''; map.forEach((k,i)=>{ if(k==='sur') sur=r[i]||''; else if(k) o[k]=r[i]||''; }); if(sur) o.name=(sur+' '+o.name).trim(); }
    else { o.name=r[0]||''; o.cls=r[1]||''; o.subj=r[2]||''; o.school=r[3]||''; o.phone=r[4]||''; }
    return o; }).filter(o=>o.name).slice(0,500); }
function titleItem(p){ const s=S(), T=TH(), L=LL(), n=nb(), w=n.w, h=n.h, hs=holeSet(n.bind,h), need=holesNeed(hs);
  return {w,h,f:safe=>{ const m={l:Math.max(need+6,(safe.l||0)+8,12),r:Math.max(12,(safe.r||0)+8),t:Math.max(12,(safe.t||0)+8),b:Math.max(12,(safe.b||0)+8)}, cx=(m.l+w-m.r)/2, cw=w-m.l-m.r, ny=h*.46, nameS=clamp(cw*.1,7,15);
    return rc(0,0,w,h,{fill:'#fff'})+rc(m.l,m.t,w-m.l-m.r,h-m.t-m.b,{st:T.acc,sw:.35,rx:2})+rc(m.l+1.6,m.t+1.6,w-m.l-m.r-3.2,h-m.t-m.b-3.2,{st:T.acc,sw:.15,rx:1.4})
      +(s.logo?thMark(cx-9,m.t+14,18,18,T.acc):icon('star',cx-6,m.t+16,12,T.acc,.5))
      +tx(cx,ny-nameS*1.25,L.owner.toUpperCase(),clamp(cw*.032,2.4,4),{a:'middle',c:T.acc,w:700,ls:.5,max:cw-10})
      +tx(cx,ny+nameS*.35,p.name,nameS,{f:FH,w:600,it:true,a:'middle',c:T.ink,max:cw-8})+ln(cx-cw*.3,ny+nameS*.75,cx+cw*.3,ny+nameS*.75,T.tabs[0],.4)
      +tx(cx,ny+nameS*.75+7,[p.cls&&(/кл/i.test(p.cls)?p.cls:p.cls+' класс'),p.subj,p.school].filter(Boolean).join(' · '),clamp(cw*.034,2.6,4.2),{a:'middle',c:T.ink,max:cw-10})
      +tx(cx,h-m.b-8,nb().year||String(new Date().getFullYear()),3,{a:'middle',c:T.acc,w:600,ls:.6})+holesSVG(hs,w,false); }}; }
const psState={busy:false,done:0,total:0,job:null,key:''};
function psPeople(){ return psParse(S().ps.text); }
function psKey(){ const s=S(); return JSON.stringify([s.ps,s.theme,s.lang,s.logo,s.lb,nb(),!!(KS.nbCover&&KS.nbCover.forName)]); }
function psCounts(people){ const s=S(), ps=s.ps, n=nb(), N=people.length; const r={title:0,label:0,cover:0};
  if(ps.title&&N){ const P=pack(n.w,n.h,{full:true}); r.title=P?Math.ceil(N/P.per):0; }
  if(ps.label&&N){ const it=lbItem(ps.lkind||'owner',{name:'x'}); const P=pack(it.w,it.h,{gap:3}); r.label=P?Math.ceil(N/P.per):0; }
  return r; }
async function psBuild(onProg){ const s=S(), ps=s.ps, people=psPeople(), out={pages:[],title:0,label:0,cover:0,people:people.length};
  if(!people.length) return out; psState.busy=true; psState.done=0; psState.total=people.length; const tick=async i=>{ psState.done=i; if(onProg) onProg(i,people.length); await new Promise(r=>setTimeout(r,0)); };
  try{
    if(ps.title){ const R=impose(people.map(titleItem),{full:true,name:'titul'}); out.pages.push(...R.pages); out.title=R.pages.length; }
    if(ps.label){ const R=impose(people.map(p=>lbItem(ps.lkind||'owner',p)),{gap:3,name:'etiketki'}); out.pages.push(...R.pages); out.label=R.pages.length; }
    const canCover=ps.cover&&KS.nbCover&&typeof KS.nbCover.forName==='function';
    for(let i=0;i<people.length;i++){ if(canCover){ try{ let r=await KS.nbCover.forName(people[i].name,people[i]); if(r&&!Array.isArray(r)) r=[r]; (r||[]).filter(pg=>pg&&pg.html).forEach(pg=>{ out.pages.push(pg); out.cover++; }); }catch(e){ console.warn('[nbextra] cover',e); } } await tick(i+1); }
  } finally { psState.busy=false; }
  psState.job=out; psState.key=psKey(); return out; }

/* =================== 8. GIFT SET =================== */
const GF_TYPES={band:'Бандероль',tag:'Бирка',thanks:'Спасибо-карточка 10 × 15',care:'Карточка ухода'};
const brand=()=>(S().gf.brand||(st.shop&&st.shop.name)||'tadhayrapetian').trim();
function bandParts(o){ const s=S(), T=TH(), n=nb(), H=clamp(+s.gf.bandH||60,30,90), G=15, w=n.w, sp=clamp(+n.spine||10,2,60), L=G+w+sp+w, B=brand(), sub=(s.gf.text||'handmade notebook').trim();
  const full=()=>{ const hid=uid('h'), fc=G+w+sp+w/2, bc=G+w/2; let o=hatch(hid,'#ffffff')+rc(0,0,L,H,{fill:T.acc})+ln(0,3.2,L,3.2,'#fff',.25)+ln(0,H-3.2,L,H-3.2,'#fff',.25)+rc(0,0,G,H,{fill:`url(#${hid})`})+tx(G/2,H/2,'клей',2.4,{a:'middle',mid:true,c:'#fff',tr:`rotate(-90 ${G/2} ${f2(H/2)})`});
    o+=(s.logo?thMark(fc-9,H/2-21,18,18,'#ffffff'):'')+tx(fc,H/2+5,B.toUpperCase(),7,{f:FH,w:600,a:'middle',c:'#fff',ls:1.2,max:w-20})+ln(fc-14,H/2+9.5,fc+14,H/2+9.5,'#fff',.3)+tx(fc,H/2+15,sub,3.2,{a:'middle',c:'#fff',max:w-24,op:.92});
    o+=tx(0,0,B,Math.min(sp*.45,3.4),{a:'middle',mid:true,c:'#fff',w:700,max:H-12,tr:`translate(${f2(G+w+sp/2)} ${f2(H/2)}) rotate(90)`});
    o+=tx(bc,H/2-3,'ручная работа',3,{a:'middle',c:'#fff',ls:.4,op:.9})+tx(bc,H/2+3,[(st.shop&&st.shop.phone)||'',(st.shop&&st.shop.addr)||''].filter(Boolean).join(' · '),2.6,{a:'middle',c:'#fff',max:w-16,op:.85});
    [G,G+w,G+w+sp].forEach(u=>{ o+=ln(u,0,u,4,'#fff',.25,'1 .8')+ln(u,H-4,u,H,'#fff',.25,'1 .8'); }); return o; };
  if(L<=272) return [{w:L,h:H,f:full}];
  if(o&&o.whole) return [{w:L,h:H,f:full}];
  const c=L/2, ov=12, u=[[0,c+ov/2],[c-ov/2,L]];
  return u.map(([a,b],i)=>({w:b-a,h:H,f:()=>{ const hid=uid('h'); return `<svg x="0" y="0" width="${f2(b-a)}" height="${f2(H)}" viewBox="${f2(a)} 0 ${f2(b-a)} ${f2(H)}" overflow="hidden">${full()}</svg>`+(i===1?hatch(hid,'#ffffff')+rc(0,0,ov,H,{fill:`url(#${hid})`})+ln(ov,0,ov,H,'#fff',.25,'1 .8'):''); }})); }
function gfItem(i){ const s=S(), T=TH(), L=LL(), type=s.gf.type, B=brand(), col=T.tabs[i%T.tabs.length];
  if(type==='tag'){ const W=50, H=90, out=`M10 0H40L50 10V${H}H0V10Z`;
    return {w:W,h:H,f:()=>`<path d="${out}" fill="#fff"/>`+`<path d="M10 0H40L50 10V22H0V10Z" fill="${col}"/>`+ci(25,10,2.6,{fill:'#fff',st:CUT,sw:CUTW})+tx(W/2,40,s.gf.text||L.forYou,8.5,{f:FW,a:'middle',c:T.ink,max:W-8})
      +icon('heart',W/2-3,45,6,col,.6)+tx(6,62,L.from,3,{c:T.ink})+ln(6+est(L.from,3)+1.5,62.6,W-6,62.6,'#999',.22)+(s.logo?thMark(W/2-7,68,14,14,T.acc):'')+tx(W/2,86,B,2.4,{a:'middle',c:T.acc,w:700,ls:.3,max:W-8})+cutPath(out)}; }
  if(type==='thanks'){ const W=152, H=102, msg=wrap(s.gf.msg||L.thanksMsg,58);
    return {w:W,h:H,f:()=>rc(0,0,W,H,{fill:'#fff'})+rc(7,7,W-14,H-14,{st:T.acc,sw:.35,rx:2})+icon('heart',W/2-4,15,8,col,.6)+tx(W/2,38,L.thanks,15,{f:FW,a:'middle',c:T.acc,max:W-30})
      +msg.slice(0,4).map((l,k)=>tx(W/2,50+k*5.6,l,3.5,{a:'middle',c:T.ink,max:W-26})).join('')+(s.logo?thMark(W/2-6,H-30,12,12,T.acc):'')+tx(W/2,H-12,B,2.8,{a:'middle',c:T.acc,w:700,ls:.5,max:W-30})}; }
  if(type==='care'){ const W=102, H=152;
    return {w:W,h:H,f:()=>{ let o=rc(0,0,W,H,{fill:'#fff'})+rc(7,7,W-14,H-14,{st:T.acc,sw:.3,rx:2})+rc(7,7,W-14,24,{fill:T.soft,rx:2})+tx(W/2,22,L.care,7.5,{f:FH,w:600,a:'middle',c:T.ink,max:W-24}); let y=42;
      L.tips.forEach((t,k)=>{ const c=T.tabs[k%6]; o+=ci(15,y-1.2,3,{fill:c})+icon('check',12.6,y-3.6,4.8,on(c),.6); wrap(t,30).slice(0,3).forEach((l,j)=>{ o+=tx(22,y+j*4.6,l,3.3,{c:T.ink,max:W-30}); }); y+=Math.max(1,Math.min(3,wrap(t,30).length))*4.6+6; });
      return o+(s.logo?thMark(W/2-6,H-34,12,12,T.acc):'')+tx(W/2,H-14,B,2.8,{a:'middle',c:T.acc,w:700,ls:.5,max:W-24}); }}; }
  return null; }
function gfBuild(){ const s=S(), q=clamp(Q(),1,200), type=s.gf.type; let items=[], warn=[], note='';
  if(type==='band'){ const parts=bandParts(); for(let k=0;k<q;k++) items.push(...parts); if(parts.length>1) note='Лента длиннее листа A4: две части, вторую приклейте на заштрихованный край первой. '; note+='Пунктиры — сгибы по краям обложки и корешка.'; }
  else items=Array.from({length:q},(_,i)=>gfItem(i));
  const R=type==='band'&&items.length>1&&items[0].w!==items[1].w?bandImpose(items):impose(items,{gap:type==='tag'?4:3,marks:type!=='tag',name:'podarok'});
  return {pages:R.pages,focus:type==='band'?bandParts({whole:1})[0]:items[0],items:q,unit:type==='band'?'бандеролей':'шт.',per:R.per,sheets:R.sheets,paper:type==='thanks'?'Фотобумага или картон 10 × 15 / A4':type==='band'?'Дизайнерская бумага или крафт 120–160 г/м²':'Картон 250–300 г/м²',warn,note}; }
/* belly band in two parts of different length: stack strips one under another */
function bandImpose(items){ const H=items[0].h, gap=3, vert=items.some(it=>it.w>SW-18), per=Math.floor(((vert?SW:SH)-18+gap)/(H+gap)), pages=[]; let sheets=0;
  for(let i=0;i<items.length;i+=per){ const ch=items.slice(i,i+per), cells=ch.map((it,j)=>vert?{x:9+j*(H+gap),y:(SH-it.w)/2,w:H,h:it.w,rot:90}:{x:(SW-it.w)/2,y:9+j*(H+gap),w:it.w,h:H,rot:0});
    pages.push(sheet(ch.map((it,j)=>place(it,cells[j],false)).join('')+marks(cells),'banderol')); sheets++; }
  return {pages,per,sheets}; }

/* =================== UI =================== */
const KINDS=[
  ['div','Разделители','Табы','Разделители с табами','<path d="M5 3h10v18H5z"/><path d="M15 5h4v4h-4M15 11h4v4h-4"/>'],
  ['stk','Наклейки','Наклейки','Наклейки для планера','<path d="M4 4h12l4 4v12H4z"/><path d="M16 4v4h4"/><path d="M8 13l2.5 2.5L16 10"/>'],
  ['bm','Закладки','Закладки','Закладки и линейка','<path d="M7 3h10v18l-5-4-5 4z"/>'],
  ['pk','Кармашки','Кармашки','Кармашки и конверты','<path d="M3 8l9 6 9-6"/><rect x="3" y="5" width="18" height="14" rx="2"/>'],
  ['lb','Этикетки','Этикетки','Этикетки и подписи','<path d="M3 12l9-9h8v8l-9 9z"/><circle cx="16" cy="8" r="1.4"/>'],
  ['rf','Сменные блоки','Блоки','Сменные блоки','<rect x="6" y="3" width="13" height="18" rx="1"/><path d="M3 7h5M3 12h5M3 17h5M10 8h6M10 12h6M10 16h4"/>'],
  ['ps','По списку','По списку','Именные блокноты по списку','<circle cx="9" cy="8" r="3.4"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M15 6h6M15 10h6M17 14h4"/>'],
  ['gf','Подарочный набор','Подарок','Подарочная упаковка','<rect x="3" y="8" width="18" height="13" rx="1.5"/><path d="M12 8v13M3 12h18M12 8c-2-4-6-4-6-1.5S10 8 12 8c2 0 6 1 6-1.5S14 4 12 8z"/>']];
const KIND=k=>KINDS.find(x=>x[0]===k)||KINDS[0];
const NB_ICON=KS.icon('<path d="M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6z"/><path d="M6 3v18M3.5 7H6M3.5 12H6M3.5 17H6M10 8h6M10 11.5h6"/>');
const BUILD={div:divBuild,stk:stkBuild,bm:bmBuild,pk:pkBuild,lb:lbBuild,rf:rfBuild,gf:gfBuild};
function build(){ const k=S().kind; try{ return (BUILD[k]||divBuild)(); }catch(e){ console.error('[nbextra] build',e); return {pages:[],items:0,unit:'',per:0,sheets:0,paper:'',warn:['Не получилось собрать листы: '+e.message]}; } }
const seg=(path,cur,opts,re)=>`<div class="seg nbx-seg">${opts.map(([v,n])=>`<button data-nbxv="${path}=${X(v)}"${String(cur)===String(v)?' class="on"':''}>${X(n)}</button>`).join('')}</div>`;
const inp=(path,val,label,o)=>{ o=o||{}; return `<label class="f">${X(label)}${o.area?`<textarea data-nbx="${path}" rows="${o.rows||4}" placeholder="${X(o.ph||'')}">${X(val)}</textarea>`:`<input type="${o.type||'text'}" data-nbx="${path}" value="${X(val)}"${o.min!=null?` min="${o.min}"`:''}${o.max!=null?` max="${o.max}"`:''}${o.step?` step="${o.step}"`:''} placeholder="${X(o.ph||'')}"${o.ml?` maxlength="${o.ml}"`:''}></label>`}`; };
const sel=(path,val,label,opts,re)=>`<label class="f">${X(label)}<select data-nbx="${path}"${re?' data-nbxre="1"':''}>${opts.map(([v,n])=>`<option value="${X(v)}"${String(v)===String(val)?' selected':''}>${X(n)}</option>`).join('')}</select></label>`;
const chk=(path,val,label)=>`<label class="chk"><input type="checkbox" data-nbx="${path}"${val?' checked':''}> ${X(label)}</label>`;
function sizeCard(){ const s=S(), n=nb(), k=s.kind; if(k==='stk'||(k==='lb'&&s.lb.type!=='spine')||(k==='rf'&&s.rf.fmt!=='nb')||(k==='gf'&&s.gf.type!=='band')) return '';
  const fromNb=n.src==='nb', other=s.size==='nb'?'a5':s.size;
  return `<div class="card nbx-size"><div class="hd">Под какой блокнот</div>
    ${n.has?seg('size',fromNb?'nb':other,[['nb','Как в блокноте'],[other,'Другой размер']]):''}
    ${fromNb?`<div class="nbx-nbinfo">${NB_ICON}<div><b>${X(n.name||'Блокнот')} · ${f2(n.w)} × ${f2(n.h)} мм</b><small>${X(BINDS[n.bind]||n.bind)}${n.title?' · «'+X(n.title)+'»':''}</small></div></div>`
      :`<div class="row2">${sel('size',s.size==='nb'?'a5':s.size,'Формат',Object.entries(FMTS).map(([k2,f])=>[k2,`${f[0]} · ${f[1]}×${f[2]}`]),1)}${sel('bind',s.bind,'Переплёт',Object.entries(BINDS),1)}</div>${n.has?'':'<p class="hint">Когда в разделе «Блок» настроен блокнот, размер подставится сам.</p>'}`}
    <details class="nbx-more"><summary>Отверстия и корешок</summary>
      <div class="row2">${inp('spine',s.spine,'Корешок, мм',{type:'number',min:2,max:60,step:.5})}${inp('discPitch',s.discPitch,'Шаг дисков, мм',{type:'number',min:10,max:40,step:.1})}</div>
      ${inp('holes',s.holes,'Свои отверстия: мм от верха через запятую',{ph:'пусто — стандарт'})}
      <p class="hint">Кольца: 6 отверстий Filofax (A5, Personal, Pocket, A6). Диски — грибовидные метки. Метки печатаются тонко, по ним пробивают дырокол.</p></details></div>`; }
function kindCard(){ const s=S(), k=s.kind, L=LL();
  if(k==='div'){ const d=s.div; return `<div class="card"><div class="hd">Разделы</div>${seg('div.src',d.src,[['months','Месяцы'],['subj','Предметы'],['week','Дни'],['num','Номера'],['custom','Свои']])}
    ${d.src==='custom'?inp('div.custom',d.custom,'Названия, по одному в строке',{area:1,rows:5}):inp('div.n',d.n,'Сколько разделов',{type:'number',min:1,max:16})}
    ${seg('div.pos',d.pos,[['side','Табы сбоку'],['top','Табы сверху']])}${chk('div.tint',d.tint,'Тонированный лист')}${chk('div.one',d.one,'Все табы одного цвета')}
    <p class="hint">Табы идут лесенкой — каждый следующий ниже, поэтому видны все сразу. Ширина таба 9 мм.</p></div>`; }
  if(k==='stk'){ const g=s.stk.groups||[]; return `<div class="card"><div class="hd">Наборы наклеек</div><div class="nbx-chips">${Object.entries(STK_GROUPS).map(([id,n])=>`<button class="btn sm${g.includes(id)?' primary':''}" data-nbxgrp="${id}">${n}</button>`).join('')}</div>
    ${chk('stk.kiss',s.stk.kiss,'Контур надсечки (розовый)')}${chk('stk.fill',s.stk.fill,'Заполнить лист до конца')}</div>`; }
  if(k==='bm'){ const b=s.bm, t=bmText(); return `<div class="card"><div class="hd">Закладка</div>${seg('bm.type',b.type,Object.entries(BM_TYPES))}
    ${inp('bm.text',b.text,'Надпись',{ph:t.t,ml:40})}${b.type==='ribbon'||b.type==='magnet'?inp('bm.sub',b.sub,'Подпись',{ph:'имя, год, сайт',ml:40}):''}
    ${b.type==='ruler'?'<p class="hint">Шкала в миллиметрах — точная при масштабе 100 %.</p>':''}</div>`; }
  if(k==='pk'){ const p=s.pk; return `<div class="card"><div class="hd">Развёртка</div>${seg('pk.type',p.type,Object.entries(PK_TYPES))}
    ${p.type==='penloop'?sel('pk.loop',p.loop,'Диаметр ручки',[[10,'10 мм — тонкая'],[12,'12 мм — обычная'],[14,'14 мм — толстая'],[16,'16 мм — маркер']]):''}
    <p class="hint">${p.type==='pocket'?'Кармашек на задний форзац: ширина по блокноту, вырез под палец.':p.type==='card'?'Кармашек под визитку 90 × 55 мм.':p.type==='env'?'Маленький конверт — для чеков, записок и наклеек.':'Петля из картона: оберните ручку, концы приклейте к обложке.'}</p></div>`; }
  if(k==='lb'){ const b=s.lb; return `<div class="card"><div class="hd">Этикетка</div>${seg('lb.type',b.type,Object.entries(LB_TYPES))}
    ${b.type==='school'?`<div class="row2">${inp('lb.subj',b.subj,'Для работ по',{ph:'математике'})}${inp('lb.cls',b.cls,'Класс',{ph:'5 «А»'})}</div>${inp('lb.school',b.school,'Школа',{ph:'№ 12'})}${inp('lb.name',b.name,'Фамилия, имя',{ph:'пусто — строка для руки'})}${chk('lb.girl',b.girl,'Ученица')}`
      :b.type==='spine'?`<p class="hint">Ширина = толщина корешка (${f2(nb().spine)} мм), надпись — название блокнота.</p>`
      :`${inp('lb.name',b.name,'Имя',{ph:'пусто — строка для руки'})}${inp('lb.phone',b.phone,'Телефон',{ph:'+374 …'})}${b.type==='found'?chk('lb.reward',b.reward,L.reward):''}`}</div>`; }
  if(k==='rf'){ const r=s.rf, nbT=nbPageTypes(); return `<div class="card"><div class="hd">Сменный блок</div>${sel('rf.fmt',r.fmt,'Формат',Object.entries(RF_FMTS).filter(([k2])=>k2!=='nb'||nbGet()).map(([k2,f])=>[k2,f[0]]),1)}
    ${sel('rf.page',r.page,'Страница',Object.entries(PAGE_TYPES).concat(nbT.map(([id,n])=>['nb:'+id,'Из блокнота: '+n])))}
    <div class="row2">${inp('rf.step',r.step,'Шаг, мм',{type:'number',min:3,max:12,step:.1})}${inp('rf.sheets',r.sheets,RF_FMTS[r.fmt]&&RF_FMTS[r.fmt][3]==='book'?'Листов в тетрадке':'Листов',{type:'number',min:1,max:200})}</div>
    ${chk('rf.duplex',r.duplex,'С двух сторон')}${KS.printer().duplex!=='auto'&&r.duplex?chk('rf.rev',r.rev,'Обороты в обратном порядке'):''}</div>`; }
  if(k==='ps'){ const p=s.ps, N=psPeople().length, cov=!!(KS.nbCover&&typeof KS.nbCover.forName==='function'); return `<div class="card"><div class="hd">Список имён <span class="ks-badge${N?' ok':''}" id="nbxPsN">${N}</span></div>
    <textarea class="nbx-list" data-nbx="ps.text" rows="7" placeholder="Вставьте из Excel или по строке:&#10;Иванова Анна; 5 «А»; математика&#10;Петров Артём; 5 «А»">${X(p.text)}</textarea>
    <div class="flexw"><span class="btn sm file">CSV или Excel<input type="file" id="nbxFile" accept=".csv,.txt,.tsv,.xlsx,.xls,text/csv" aria-label="Загрузить CSV или Excel"></span><button class="btn sm" data-nbxdo="sample">Пример</button>${p.text?'<button class="btn sm" data-nbxdo="clear">Очистить</button>':''}</div>
    <p class="hint">Столбцы: имя, класс, предмет, школа, телефон. Заголовок «Имя / Класс…» распознаётся сам.</p>
    <div class="hd2">На каждое имя</div>${chk('ps.title',p.title,'Титул «Этот блокнот принадлежит»')}${chk('ps.label',p.label,'Этикетка')}${p.label?seg('ps.lkind',p.lkind,[['owner','Владелец'],['school','Тетрадь'],['found','Если найдёте']]):''}
    <label class="chk${cov?'':' nbx-off'}"><input type="checkbox" data-nbx="ps.cover"${p.cover&&cov?' checked':''}${cov?'':' disabled'}> Обложка с именем${cov?'':' — нужен раздел «Обложка»'}</label></div>`; }
  const g=s.gf; return `<div class="card"><div class="hd">Подарочная упаковка</div>${seg('gf.type',g.type,Object.entries(GF_TYPES))}
    ${inp('gf.brand',g.brand,'Бренд',{ph:brand(),ml:40})}
    ${g.type==='band'?inp('gf.text',g.text,'Подпись под брендом',{ph:'handmade notebook',ml:50})+sel('gf.bandH',g.bandH,'Ширина ленты',[[40,'40 мм'],[50,'50 мм'],[60,'60 мм'],[70,'70 мм']]):''}
    ${g.type==='tag'?inp('gf.text',g.text,'Надпись на бирке',{ph:L.forYou,ml:24}):''}${g.type==='thanks'?inp('gf.msg',g.msg,'Текст',{area:1,rows:3,ph:L.thanksMsg}):''}</div>`; }
function themeCard(){ const s=S(); return `<div class="card"><div class="hd">Цвета и язык</div><div class="nbx-themes">${Object.entries(THEMES).map(([k,t])=>`<button class="nbx-theme${s.theme===k?' on':''}" data-nbxv="theme=${k}" title="${t.n}"><i style="background:${t.acc}"></i><i style="background:${t.tabs[0]}"></i><i style="background:${t.tabs[1]}"></i><i style="background:${t.tabs[3]}"></i><span>${t.n}</span></button>`).join('')}</div>
  ${seg('lang',s.lang,Object.entries(LG).map(([k,v])=>[k,v.n]))}${chk('logo',s.logo,'Знак TH')}</div>`; }
const QTY_L={div:'Комплектов',stk:'Листов',bm:'Закладок',pk:'Штук',lb:'Этикеток',rf:'Комплектов',gf:'Штук'};
function printCard(){ const s=S(), k=s.kind, man=k==='rf'&&s.rf.duplex&&KS.printer().duplex!=='auto', shop=nbShop();
  return `<div class="card nbx-print"><div class="hd">Печать</div>${k==='ps'?'':`<div class="nbx-qty"><span>${QTY_L[k]}</span><button class="btn sm icon" data-nbxq="-1" aria-label="Меньше">−</button><input type="number" data-nbx="qk.${k}" min="1" max="300" value="${Q()}" aria-label="Количество"><button class="btn sm icon" data-nbxq="1" aria-label="Больше">+</button></div>`}
    <p class="hint" id="nbxSum"></p>
    <div class="flexw">${man?'<button class="btn primary" data-nbxdo="front">Лицевые</button><button class="btn" data-nbxdo="back">Обороты</button>':'<button class="btn primary" data-nbxdo="print">Печать</button>'}<button class="btn" data-nbxdo="pdf">Скачать PDF</button>${shop?'<button class="btn" data-nbxdo="order">В заказ блокнота</button>':''}</div>
    <p class="hint">${X(KS.printer().n)}: поле 5 мм по краям не печатается — всё на листах стоит внутри него. В окне печати: масштаб 100 %.</p></div>`; }
function panel(box){ const s=S(); box.innerHTML=`<div class="card nbx-kc"><div class="hd">Что печатаем</div><div class="nbx-kinds">${KINDS.map(([id,,short,title,ic])=>`<button class="nbx-kind${s.kind===id?' on':''}" data-nbxkind="${id}" title="${X(title)}">${KS.icon(ic)}<span>${X(short)}</span></button>`).join('')}</div></div>`
  +kindCard()+sizeCard()+themeCard()+printCard(); sumLine(); }
const panelBox=()=>document.querySelector('[data-panel="ks-notebook"] .kssub');
const isOpen=()=>{ const a=KS.active&&KS.active(); return !!(a&&a.id==='nbextra'); };
function rePanel(){ const b=panelBox(); if(b&&isOpen()) KS.keepFocus(b,()=>panel(b)); }

/* ---------- big screen: live preview ---------- */
const PXMM=96/25.4;
function sheetThumb(p,i,tw,lab){ const k=tw/(p.pw*PXMM); return `<figure class="nbx-sh"><div class="nbx-paper" style="width:${tw}px;height:${Math.round(p.ph*PXMM*k)}px"><div class="nbx-pin" style="transform:scale(${k.toFixed(5)})">${p.html}</div><i class="nbx-bord" title="Поле принтера 5 мм"></i></div><figcaption>${X(lab||('Лист '+(i+1)))}</figcaption></figure>`; }
function focusSVG(it,maxW,maxH){ if(!it) return ''; const k=Math.min(maxW/it.w,maxH/it.h); let inner=''; try{ inner=it.f({l:0,t:0,r:0,b:0}); }catch(e){ console.error(e); }
  return `<svg class="nbx-fsvg" viewBox="-1 -1 ${f2(it.w+2)} ${f2(it.h+2)}" width="${Math.round((it.w+2)*k)}" height="${Math.round((it.h+2)*k)}">${inner}</svg>`; }
function headHTML(sub){ const s=S(), K=KIND(s.kind), n=nb(); return `<div class="nbx-head"><div><h2>${X(K[3])}</h2><p class="hint">${sub||''}</p></div>
  <div class="nbx-pill">${NB_ICON}<span>${n.src==='nb'?'Блокнот':'Размер'}: <b>${X(n.name||'')} ${f2(n.w)} × ${f2(n.h)}</b> · ${X(BINDS[n.bind]||n.bind)}</span></div></div>`; }
const kpi=(l,v,i)=>`<div class="ks-kpi"><small>${X(l)}</small><b>${v}</b>${i?`<i>${i}</i>`:''}</div>`;
let lastR=null;
function scrRender(scr){ if(!scr) return; const s=S(); if(s.kind==='ps') return psScreen(scr); const R=lastR=build(), P=R.pages, pr=KS.printer();
  const dup=!!R.duplex, sheets=dup?Math.ceil(P.length/2):P.length;
  const thumbs=P.slice(0,12).map((p,i)=>sheetThumb(p,i,196,dup?`Лист ${Math.floor(i/2)+1} · ${i%2?'оборот':'лицо'}`:'Лист '+(i+1))).join('');
  const focusW=1, big=R.focusSheet&&P[0];
  scr.innerHTML=headHTML(X(R.paper||''))
    +`<div class="ks-kpis nbx-kpis">${kpi('Изделий',R.items||0,R.unit)}${kpi('Листов A4',sheets,dup?'с двух сторон':'')}${kpi('На листе',R.per||0,'шт.')}${kpi('Принтер',X(pr.id==='g3410'?'G3410':pr.id==='gx4040'?'GX4040':'Другой'),'поле 5 мм учтено')}</div>`
    +((R.warn||[]).length?`<div class="nbx-warn">${R.warn.map(w=>`<p>${X(w)}</p>`).join('')}</div>`:'')
    +`<div class="nbx-stage${focusW?'':' nofocus'}">${focusW?`<div class="nbx-focus"><div class="hd2">Крупно</div><div class="nbx-fbox">${big?sheetThumb(P[0],0,300,'Лист 1'):focusSVG(R.focus,330,430)}</div>${R.note?`<p class="hint">${X(R.note)}</p>`:''}</div>`:''}
      <div class="nbx-sheets"><div class="hd2">Листы A4${P.length>12?` · первые 12 из ${P.length}`:''}</div>${P.length?`<div class="nbx-grid" style="--tw:196px">${thumbs}</div>`:'<div class="ks-empty">Нечего печатать — проверьте настройки слева.</div>'}${!focusW&&R.note?`<p class="hint">${X(R.note)}</p>`:''}</div></div>`;
  sumLine(); }
function sumLine(){ const el=document.getElementById('nbxSum'); if(!el) return; const s=S();
  if(s.kind==='ps'){ const N=psPeople().length, c=psCounts(psPeople()); el.textContent=N?`${N} имён → ${c.title+c.label} лист. A4${s.ps.cover&&KS.nbCover&&KS.nbCover.forName?' + обложки':''}`:'Добавьте имена в список'; return; }
  const R=lastR||build(); el.textContent=R.pages.length?`${R.items} ${R.unit} · ${R.duplex?Math.ceil(R.pages.length/2)+' лист. A4 с двух сторон':R.pages.length+' лист. A4'} · ${R.paper}`:'Нечего печатать'; }
function psScreen(scr){ const s=S(), people=psPeople(), c=psCounts(people), n=nb(), cov=!!(KS.nbCover&&typeof KS.nbCover.forName==='function')&&s.ps.cover;
  const job=psState.job&&psState.key===psKey()?psState.job:null;
  const card=(p,i)=>{ const it=titleItem(p), lb=lbItem(s.ps.lkind||'owner',p); return `<div class="nbx-pc"><div class="nbx-pct">${s.ps.title?focusSVG(it,120,150):''}${s.ps.label?`<div class="nbx-pcl">${focusSVG(lb,110,64)}</div>`:''}</div><b>${X(p.name)}</b><small>${X([p.cls,p.subj].filter(Boolean).join(' · ')||'—')}</small><span class="nbx-num">${i+1}</span></div>`; };
  scr.innerHTML=headHTML('Каждому имени — свой титул, этикетка и обложка. Всё уходит одним заданием на печать.')
    +`<div class="ks-kpis nbx-kpis">${kpi('Имён',people.length)}${kpi('Титулы',c.title,'лист. A4')}${kpi('Этикетки',c.label,'лист. A4')}${kpi('Обложки',cov?people.length:'—',cov?'из раздела «Обложка»':'выключено')}</div>`
    +`<div class="nbx-prog"${psState.busy?'':' hidden'}><div class="nbx-bar"><i style="width:${psState.total?Math.round(psState.done/psState.total*100):0}%"></i></div><span>${psState.done} из ${psState.total}</span></div>`
    +(people.length?`<div class="nbx-people">${people.slice(0,60).map(card).join('')}</div>${people.length>60?`<p class="hint">И ещё ${people.length-60} — все попадут в печать.</p>`:''}`
      :`<div class="ks-empty nbx-psempty"><b>Список пуст</b><p>Вставьте список класса или клиентов слева: по имени в строке, можно с классом и предметом через «;». Или загрузите CSV / Excel.</p><button class="btn sm primary" data-nbxdo="sample">Вставить пример на 5 имён</button></div>`)
    +(job?`<div class="hd2">Собранное задание · ${job.pages.length} лист.</div><div class="nbx-grid" style="--tw:170px">${job.pages.slice(0,12).map((p,i)=>sheetThumb(p,i,170)).join('')}</div>`:'');
  sumLine(); }
let rT=0; function refresh(now){ clearTimeout(rT); const go=()=>{ const sc=KS.screen('nbextra'); if(sc&&!sc.hidden&&isOpen()) scrRender(sc); else lastR=null; }; if(now) go(); else rT=setTimeout(go,110); }
function psProgress(i,n){ const sc=KS.screen('nbextra'); if(!sc) return; const pg=sc.querySelector('.nbx-prog'); if(!pg) return; pg.hidden=false; pg.querySelector('i').style.width=Math.round(i/n*100)+'%'; pg.querySelector('span').textContent=`${i} из ${n}`; }

/* ---------- printing, PDF, order ---------- */
const FILE={div:'razdeliteli',stk:'naklejki',bm:'zakladki',pk:'karmashki',lb:'etiketki',rf:'smennyj-blok',ps:'imennye-bloknoty',gf:'podarochnyj-nabor'};
async function getPages(){ const s=S(); if(s.kind==='ps'){ refresh(true); const job=await psBuild(psProgress); refresh(true); return job.pages; } lastR=build(); return lastR.pages; }
async function doPrint(which){ const s=S(); let P=await getPages(); if(!P.length){ KS.toast(s.kind==='ps'?'Сначала добавьте имена в список':'Нечего печатать'); return; }
  if(which==='front') P=P.filter((_,i)=>i%2===0); else if(which==='back'){ P=P.filter((_,i)=>i%2===1); if(s.rf.rev) P.reverse(); }
  KS.print(P); KS.toast(`На печать: ${P.length} ${P.length===1?'лист':'лист.'} A4${which==='front'?' — лицевые':which==='back'?' — обороты':''}`); }
async function doPdf(btn){ const s=S(), P=await getPages(); if(!P.length){ KS.toast('Нечего сохранять'); return; }
  if(typeof exportPDF!=='function'){ KS.print(P); return; } const name=FILE[s.kind]||'aksessuary', lbl=btn?btn.textContent:'', _sf=window.saveFile;
  if(btn) btn.disabled=true; window.saveFile=function(n,b,t){ return _sf.call(this,name+'.pdf',b,t); };
  try{ await exportPDF(P,300,i=>{ if(btn) btn.textContent=`PDF ${i+1} из ${P.length}…`; }); }
  catch(e){ KS.toast('Не удалось сохранить PDF — нажмите «Печать» и выберите «Сохранить как PDF»'); }
  finally{ window.saveFile=_sf; if(btn){ btn.disabled=false; btn.textContent=lbl; } } }
const shopApi=()=>(KS.nbShop&&typeof KS.nbShop==='object')?KS.nbShop:null;
function nbShop(){ const a=shopApi(); return !!(a&&(typeof a.addExtra==='function'||typeof a.jobs==='function')); }
function orderItem(){ const s=S(), K=KIND(s.kind), ps=s.kind==='ps', R=ps?null:(lastR||build()), N=ps?psPeople().length:R.items, c=ps?psCounts(psPeople()):null;
  return {id:KS.uid('nbx'),kind:s.kind,name:K[1]+(ps?` — ${N} имён`:''),qty:N,unit:ps?'имён':R.unit,sheets:ps?c.title+c.label:R.sheets,paper:R?R.paper:'',theme:s.theme,settings:JSON.parse(JSON.stringify(s[s.kind]||{})),added:Date.now()}; }
function doOrder(){ const api=shopApi(), item=orderItem(); if(!api) return;
  if(!item.qty){ KS.toast('Нечего добавлять'); return; }
  if(typeof api.addExtra==='function'){ let ok=false; try{ ok=api.addExtra(item)!==false; }catch(e){ console.error(e); } KS.toast(ok?'Добавлено в заказ блокнота: '+item.name:'Не получилось добавить'); return; }
  let jobs=[]; try{ jobs=(api.jobs()||[]).filter(j=>{ try{ return !(api.live&&api.live(j).cancel); }catch(_){ return true; } }).slice(0,12); }catch(_){ }
  const m=KS.modal({id:'nbxorder',title:'Добавить в заказ блокнота'});
  if(!m.root.dataset.nbx){ m.root.dataset.nbx='1'; m.el.addEventListener('click',e=>{ const b=e.target.closest('[data-nbxjob]'); if(!b||!m.item) return; const j=(api.jobs()||[]).find(x=>x.id===b.dataset.nbxjob); if(!j) return; attachToJob(j,m.item); m.close(); }); }
  m.item=item;
  m.el.innerHTML=`<p class="hint">${X(item.name)}: ${item.qty} ${X(item.unit)}, ${item.sheets} лист. A4. Строка добавится в примечание заказа, а в производстве появится у задания.</p>`
    +(jobs.length?`<div class="nbx-jobs">${jobs.map(j=>{ let L={}; try{ L=api.live?api.live(j):{}; }catch(_){ } const c=j.cfg||{}; return `<button class="nbx-job" data-nbxjob="${X(j.id)}"><b>№ ${X(L.no||j.no||'')}</b><span>${X(L.client||j.client||'Без имени')}</span><small>${X([c.title,c.fmt,(j.qty||1)+' шт.'].filter(Boolean).join(' · '))}${(j.nbx||[]).length?' · аксессуаров: '+j.nbx.length:''}</small></button>`; }).join('')}</div>`
      :'<div class="ks-empty">Заказов блокнотов пока нет. Создайте заказ в разделе «Производство», затем добавьте к нему аксессуары.</div>');
  m.open(); }
function attachToJob(j,item){ (j.nbx=Array.isArray(j.nbx)?j.nbx:[]).push(item); j.upd=Date.now();
  const o=(st.orders||[]).find(x=>x.id===j.orderId); if(o) o.note=[o.note,`+ ${item.name}: ${item.qty} ${item.unit}, ${item.sheets} л. A4`].filter(Boolean).join('\n');
  KS.emit('nbExtraAdd',{jobId:j.id,item}); KS.save(); KS.toast(`Добавлено в заказ № ${j.no||''}: ${item.name}`); }

/* ---------- events ---------- */
function setPath(path,v){ const s=S(), a=path.split('.'); let o=s; for(let i=0;i<a.length-1;i++){ if(!o[a[i]]||typeof o[a[i]]!=='object') o[a[i]]={}; o=o[a[i]]; } o[a[a.length-1]]=v; }
function getPath(path){ return path.split('.').reduce((o,k)=>o==null?o:o[k],S()); }
const SAMPLE='Имя; Класс; Предмет\nАрмен Саргсян; 5 «А»; математика\nАнна Петросян; 5 «А»; математика\nДавид Акопян; 5 «А»; математика\nМария Иванова; 5 «А»; математика\nЛилит Карапетян; 5 «А»; математика';
const inMod=e=>!!(e.target.closest&&e.target.closest('[data-panel="ks-notebook"], [data-ksscreen="notebook:nbextra"]'));
document.addEventListener('click',e=>{ if(!inMod(e)) return; let b;
  if((b=e.target.closest('[data-nbxkind]'))){ S().kind=b.dataset.nbxkind; KS.save(); rePanel(); refresh(true); return; }
  if((b=e.target.closest('[data-nbxv]'))){ const [path,...v]=b.dataset.nbxv.split('='); let val=v.join('='); if(path==='div.src'){ const L=LL(); S().div.n=val==='months'?12:val==='week'?7:val==='subj'?L.subj.length:val==='num'?6:S().div.n; }
    setPath(path,val); KS.save(); rePanel(); refresh(true); return; }
  if((b=e.target.closest('[data-nbxgrp]'))){ const g=S().stk.groups=(S().stk.groups||[]).slice(), id=b.dataset.nbxgrp, i=g.indexOf(id); if(i>=0) g.splice(i,1); else { g.push(id); const ord=Object.keys(STK_GROUPS); g.sort((a,c)=>ord.indexOf(a)-ord.indexOf(c)); } S().stk.groups=g; KS.save(); rePanel(); refresh(true); return; }
  if((b=e.target.closest('[data-nbxq]'))){ const s=S(), v=clamp(Q()+(+b.dataset.nbxq),1,300); s.qk[s.kind]=v; KS.save(); const i=document.querySelector('[data-nbx^="qk."]'); if(i) i.value=v; refresh(true); return; }
  if((b=e.target.closest('[data-nbxdo]'))){ const d=b.dataset.nbxdo;
    if(d==='print'||d==='front'||d==='back'){ doPrint(d); return; }
    if(d==='pdf'){ doPdf(b); return; }
    if(d==='order'){ doOrder(); return; }
    if(d==='sample'){ S().ps.text=SAMPLE; KS.save(); rePanel(); refresh(true); return; }
    if(d==='clear'){ S().ps.text=''; psState.job=null; KS.save(); rePanel(); refresh(true); return; } } });
function onField(e){ const t=e.target; if(!t.dataset||!t.dataset.nbx||!inMod(e)) return; const path=t.dataset.nbx; let v;
  if(t.type==='checkbox') v=t.checked; else if(t.type==='number'){ if(t.value==='') return; v=+t.value; if(!isFinite(v)) return; } else v=t.value;
  if(path==='size'&&v!=='nb') S().lastSize=v;
  setPath(path,v); KS.save();
  if(t.dataset.nbxre||(e.type==='change'&&t.type==='checkbox'&&/^(ps\.label|rf\.duplex)$/.test(path))) rePanel();
  if(path==='ps.text'){ const n=document.getElementById('nbxPsN'); if(n){ const N=psPeople().length; n.textContent=N; n.classList.toggle('ok',!!N); } }
  refresh(); }
document.addEventListener('input',e=>{ const t=e.target; if(t.tagName==='SELECT'||t.type==='checkbox') return; onField(e); });
document.addEventListener('change',e=>{ const t=e.target; if(t.id==='nbxFile'&&t.files&&t.files[0]){ importList(t.files[0]); t.value=''; return; } if(t.tagName==='SELECT'||t.type==='checkbox') onField(e); });
async function importList(f){ try{ let rows;
    if(/\.xlsx?$/i.test(f.name)){ KS.toast('Читаю Excel…'); const XL=typeof loadXLSX==='function'?await loadXLSX():await loadLib('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',()=>window.XLSX);
      const wb=XL.read(await f.arrayBuffer(),{type:'array'}); rows=XL.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{header:1,defval:'',raw:false}); }
    else { const buf=await f.arrayBuffer(); let text; try{ text=new TextDecoder('utf-8',{fatal:true}).decode(buf); }catch(_){ text=new TextDecoder('windows-1251').decode(buf); } text=text.replace(/^﻿/,'');
      rows=text.split(/\r?\n/).map(l=>l.includes('\t')?l.split('\t'):l.includes(';')?l.split(';'):l.split(',')); }
    const txt=rows.map(r=>(r||[]).map(c=>String(c==null?'':c).replace(/[\t\n;]/g,' ').trim()).join('; ')).filter(l=>l.replace(/[;\s]/g,'')).join('\n');
    const N=psParse(txt).length; if(!N){ KS.toast('В файле не нашёл имён'); return; }
    S().ps.text=txt; KS.save(); rePanel(); refresh(true); KS.toast('Загружено имён: '+N);
  }catch(e){ console.error(e); KS.toast('Не удалось открыть файл. Для Excel нужен интернет — или сохраните как CSV.'); } }

/* ---------- registration ---------- */
KS.tab({id:'nbextra',group:'notebook',groupTitle:'Блокноты',groupIcon:NB_ICON,icon:NB_ICON,title:'Аксессуары',seg:'Аксессуары',before:'prep',app:'print',screen:true,
  render(box,o){ const sig=JSON.stringify(nb());
    if(o.reason==='show'||!box.firstChild||!box.querySelector('.nbx-kinds')){ panel(box); lastSig=sig; if(o.screen) scrRender(o.screen); return; }
    if(sig!==lastSig){ lastSig=sig; KS.keepFocus(box,()=>panel(box)); refresh(); } }});
let lastSig='';
KS.on('nbChanged',()=>{ if(isOpen()){ rePanel(); refresh(); } });
KS.on('nbCoverChanged',()=>{ if(isOpen()&&S().kind==='ps'){ rePanel(); refresh(); } });
const go=k=>()=>{ S().kind=k; KS.save(); KS.show('notebook','nbextra'); };
KS.cmd('Аксессуары для блокнотов','блокноты',()=>KS.show('notebook','nbextra'));
KINDS.forEach(([k,n,,t])=>KS.cmd(t,'блокноты',go(k)));
KS.nbExtra={build:()=>build(),pages:async kind=>{ const s=S(), old=s.kind; if(kind) s.kind=kind; try{ return await getPages(); } finally{ s.kind=old; } },print:doPrint,parse:psParse,kinds:KINDS.map(k=>k[0]),themes:THEMES,
  holes:holeSet,pack,_ps:psState};
