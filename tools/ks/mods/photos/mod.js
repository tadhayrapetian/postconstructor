/* «Фото»: поиск в бесплатных фотобанках, картинки из Pinterest и интернета, библиотека «Мои фото».
   Библиотека: IndexedDB (KS.idb, store 'files', ключ 'ph:<id>'), лёгкий индекс с миниатюрами — 'ph:index' в store 'kv'. */
KS.mod('photos',{title:'Фото'});

const NS='photos', TID='ks-photo';
const ALB=['Клиенты','Фоны','Логотипы','Документы','Разное'];
const DEF={keys:{pexels:'',unsplash:'',pixabay:''},kst:{},src:'all',q:'',orient:'',color:'',comm:true,raw:false,recent:[],albums:[],album:'',sort:'new',saveAlb:'Разное'};
const S=()=>{ const s=KS.store(NS,DEF);
  if(!s.keys||typeof s.keys!=='object') s.keys={}; if(!s.kst||typeof s.kst!=='object') s.kst={};
  if(!Array.isArray(s.recent)) s.recent=[]; if(!Array.isArray(s.albums)) s.albums=[]; return s; };

/* ---------- small helpers ---------- */
const E=v=>KS.esc(v==null?'':String(v));
const q1=(r,s)=>r?r.querySelector(s):null, qa=(r,s)=>r?[...r.querySelectorAll(s)]:[];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const uniq=a=>[...new Set(a.filter(Boolean))];
const say=m=>KS.toast(m);
const mmT=v=>String(Math.round(v*10)/10).replace('.',',');
const short=(s,n)=>{ s=String(s||'').replace(/\s+/g,' ').trim(); return s.length>n?s.slice(0,n-1).trimEnd()+'…':s; };
const plural=(n,f)=>{ const m=n%10,h=n%100; return n+' '+(m===1&&h!==11?f[0]:m>=2&&m<=4&&(h<12||h>14)?f[1]:f[2]); };
const sizeT=b=>b>=1e9?(b/1e9).toFixed(1).replace('.',',')+' ГБ':b>=1e7?Math.round(b/1e6)+' МБ':(Math.max(b,0)/1e6).toFixed(1).replace('.',',')+' МБ';
const strip=s=>{ if(!s) return ''; try{ return (new DOMParser().parseFromString(String(s),'text/html').body.textContent||'').replace(/\s+/g,' ').trim(); }catch(_){ return String(s).replace(/<[^>]*>/g,'').trim(); } };
const hostOf=u=>{ try{ return new URL(u).hostname.replace(/^www\./,''); }catch(_){ return ''; } };
const typing=()=>{ const t=document.activeElement; return !!(t&&(/INPUT|TEXTAREA|SELECT/.test(t.tagName)||t.isContentEditable)); };
const anyModal=()=>!!document.querySelector('.modal:not([hidden])');
const ic=p=>KS.icon(p);
const IC={
  cam:'<path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.6l1.4-2h5l1.4 2h1.6A2.5 2.5 0 0 1 20 8.5v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5z"/><circle cx="12" cy="12.4" r="3.4"/>',
  search:'<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
  img:'<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><circle cx="9" cy="10" r="1.8"/><path d="m20.5 15.5-4.8-4.8L6 19.5"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  layers:'<path d="m12 3.8 8.5 4.4-8.5 4.4-8.5-4.4z"/><path d="m3.5 12.2 8.5 4.4 8.5-4.4"/><path d="m3.5 16.2 8.5 4.4 8.5-4.4"/>',
  pal:'<path d="M12 3.5a8.5 8.5 0 1 0 0 17c1 0 1.6-.7 1.6-1.5 0-.9-.7-1.2-.7-2.1 0-.9.7-1.5 1.6-1.5h1.9a4.1 4.1 0 0 0 4.1-4.1c0-4.4-3.8-7.8-8.5-7.8z"/><circle cx="7.6" cy="11.2" r="1.1"/><circle cx="10.2" cy="7.5" r="1.1"/><circle cx="14.6" cy="7.7" r="1.1"/>',
  book:'<path d="M7 3.5h10a1 1 0 0 1 1 1v16l-6-4-6 4v-16a1 1 0 0 1 1-1z"/><path d="M12 7.5v6M9 10.5h6"/>',
  swap:'<path d="M4 8h13.5L14 4.5M20 16H6.5l3.5 3.5"/>',
  ext:'<path d="M14 4.5h5.5V10M19.5 4.5 11 13M18 14v4.5a1 1 0 0 1-1 1H5.5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1H10"/>',
  trash:'<path d="M4.5 7h15M10 7V4.5h4V7M6.5 7l1 12.5h9l1-12.5"/>',
  check:'<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  lock:'<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
  key:'<circle cx="8" cy="15.5" r="4"/><path d="m11 12.5 8.5-8.5M16.5 7l2.5 2.5M14 9.5l2 2"/>',
  up:'<path d="M12 19.5v-11m-4.5 4.5L12 8.5l4.5 4.5"/><path d="M5 4.5h14"/>',
  dl:'<path d="M12 4.5v10m-4-4 4 4 4-4"/><path d="M5 19.5h14"/>',
  folder:'<path d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2h7a2 2 0 0 1 2 2v7.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/>',
  pin:'<circle cx="12" cy="12" r="8.6"/><path d="m10.6 20.4 1.9-8.2"/><path d="M9.3 15.6C7.9 15 7 13.7 7 12a5 5 0 0 1 10 0c0 2.6-1.5 4.4-3.4 4.4-1 0-1.7-.8-1.4-1.8l.8-3"/>',
  link:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.1 1.1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.1-1.1"/>',
  clip:'<rect x="6" y="4.5" width="12" height="16" rx="2.5"/><path d="M9.5 4.5v-1h5v1M9.5 11h5M9.5 14.5h5"/>',
  pen:'<path d="M4.5 19.5h4l10-10-4-4-10 10z"/><path d="m13 7 4 4"/>',
  x:'<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
  left:'<path d="m14.5 5.5-6.5 6.5 6.5 6.5"/>', right:'<path d="m9.5 5.5 6.5 6.5-6.5 6.5"/>',
  sel:'<rect x="4" y="4" width="16" height="16" rx="4.5"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  warn:'<path d="M12 4 2.8 19.5h18.4z"/><path d="M12 10v4.2M12 17v.2"/>',
  shield:'<path d="M12 3.5 5 6.5v5c0 4.2 3 7.6 7 9 4-1.4 7-4.8 7-9v-5z"/><path d="m9 12 2.2 2.2L15.5 10"/>'
};

/* ---------- RU → EN dictionary for stock search ---------- */
const DICT_SRC=`цветы,цветок,цветочки,цветов:flowers|роза,розы:roses|тюльпан,тюльпаны:tulips|пион,пионы:peonies|ромашка,ромашки:daisies|лаванда:lavender|подсолнух,подсолнухи:sunflowers|орхидея,орхидеи:orchids|сирень:lilac|лилия,лилии:lilies|хризантемы:chrysanthemums|гортензия:hydrangea|букет,букеты:bouquet|флорист,флористика:florist|листья,листва:leaves|лист:leaf|деревья:trees|трава:grass|лес:forest|природа:nature|сад:garden|парк:park|поле:field|горы:mountains|гора:mountain|море:sea|океан:ocean|пляж:beach|озеро:lake|река:river|водопад:waterfall|небо:sky|облака,облако:clouds|закат:sunset|рассвет:sunrise|солнце:sun|ночь,ночью,ночной,ночная,ночные:night|утро,утром:morning|вечер,вечером,вечерний:evening|луна:moon|звезды,звезда:stars|снег:snow|снежинки:snowflakes|зима:winter|весна:spring|лето:summer|осень:autumn|дождь:rain|туман:fog|радуга:rainbow|пустыня:desert|остров:island|тропики:tropical|пальма,пальмы:palm trees|камни:stones|камень:stone|вода:water|огонь:fire|лед:ice|волны:waves|ракушки:seashells|песок:sand|
животные:animals|кошка,кот,котик,коты,кошки:cat|котенок,котята:kitten|собака,собаки,пес:dog|щенок,щенки:puppy|птица,птицы:birds|лошадь,лошади,конь:horse|бабочка,бабочки:butterfly|рыба,рыбы:fish|медведь:bear|мишка:teddy bear|лиса:fox|кролик,заяц,зайчик:rabbit|олень:deer|лев:lion|тигр:tiger|слон:elephant|панда:panda|сова:owl|попугай:parrot|единорог:unicorn|динозавр:dinosaur|пчела,пчелы:bee|лебедь,лебеди:swans|голубь:dove|жираф:giraffe|
еда:food|кофе:coffee|кофейня:coffee shop|чай:tea|торт,торты,тортик:cake|пирожное,пирожные:pastry|десерт,десерты:dessert|выпечка:baking|хлеб:bread|пицца:pizza|суши,роллы:sushi|бургер:burger|шаурма:shawarma|шашлык:barbecue|мясо:meat|стейк:steak|фрукты:fruits|овощи:vegetables|ягоды:berries|клубника:strawberry|яблоко,яблоки:apples|апельсин,апельсины:oranges|лимон,лимоны:lemons|виноград:grapes|гранат:pomegranate|абрикос,абрикосы:apricots|вино:wine|коньяк:cognac|пиво:beer|коктейль:cocktail|сок:juice|мороженое:ice cream|шоколад:chocolate|конфеты:candy|макарон,макаруны:macarons|кондитерская:pastry shop|пекарня:bakery|ресторан:restaurant|кафе:cafe|бар:bar|кухня:kitchen|повар,шеф:chef|завтрак:breakfast|обед:lunch|ужин:dinner|салат:salad|суп:soup|паста:pasta|сыр:cheese|мед:honey|капкейк,капкейки:cupcakes|круассан:croissant|лаваш:lavash|долма:dolma|хачапури:khachapuri|блины:pancakes|
праздник,праздники:celebration|день рождения:birthday|свадьба:wedding|свадебный,свадебная,свадебное,свадебные:wedding|невеста:bride|жених:groom|кольца,кольцо:rings|помолвка:engagement|юбилей:anniversary|новый год:new year|рождество:christmas|елка,ель:christmas tree|подарок,подарки:gift|шары,шарики:balloons|воздушные шары,воздушные шарики:balloons|конфетти:confetti|фейерверк,салют:fireworks|свечи,свеча:candles|вечеринка:party|выпускной:graduation|крестины:baptism|пасха:easter|день святого валентина,день влюбленных,валентинов день:valentines day|8 марта:womens day flowers|день матери:mothers day|хэллоуин:halloween|приглашение:invitation|открытка:greeting card|поздравление:congratulations|любовь:love|сердце,сердца,сердечки:hearts|романтика:romantic|семья:family|мама:mother|папа:father|бабушка:grandmother|дедушка:grandfather|малыш:baby|младенец,новорожденный:newborn|дети:children|ребенок:child|девочка:girl|мальчик:boy|школа:school|первое сентября:back to school|учитель:teacher|студент,студенты:students|книги:books|
бизнес:business|офис:office|компьютер:computer|ноутбук:laptop|команда:team|встреча:meeting|деньги:money|финансы:finance|банк:bank|недвижимость:real estate|дом:house|квартира:apartment|интерьер:interior|строительство:construction|ремонт:renovation|архитектура:architecture|город:city|улица:street|здание:building|магазин:shop|продажи:sales|скидка,скидки,распродажа:sale|реклама:advertising|маркетинг:marketing|технологии:technology|телефон:smartphone|интернет:internet|юрист:lawyer|бухгалтер:accountant|логистика,доставка:delivery|грузовик:truck|склад:warehouse|завод:factory|производство:manufacturing|сельское хозяйство:agriculture|ферма:farm|типография:printing house|печать:printing|принтер:printer|визитка,визитки:business card|логотип:logo|дизайн:design|фотограф:photographer|камера,фотоаппарат:camera|студия:studio|
красота:beauty|салон:salon|салон красоты:beauty salon|маникюр:manicure|ногти:nails|педикюр:pedicure|парикмахер,парикмахерская:hairdresser|прическа:hairstyle|волосы:hair|макияж:makeup|косметика:cosmetics|барбершоп:barbershop|борода:beard|спа:spa|массаж:massage|йога:yoga|фитнес:fitness|спорт:sport|спортзал:gym|бег:running|футбол:football|баскетбол:basketball|теннис:tennis|плавание:swimming|бокс:boxing|танцы,танец:dance|велосипед:bicycle|шахматы:chess|медицина:medicine|врач,доктор:doctor|больница:hospital|клиника:clinic|зубы:teeth|стоматология:dentistry|стоматолог:dentist|аптека:pharmacy|здоровье:health|витамины:vitamins|ветеринар:veterinarian|психолог:psychologist|
авто,машина,автомобиль,машины:car|автосервис:car service|шины:tires|такси:taxi|автобус:bus|самолет:airplane|поезд:train|корабль:ship|яхта:yacht|путешествие,путешествия:travel|туризм:tourism|отель,гостиница:hotel|чемодан:suitcase|карта:map|дорога:road|мотоцикл:motorcycle|
ереван:yerevan|армения:armenia|арарат:mount ararat|гюмри:gyumri|севан:lake sevan|дилижан:dilijan|гарни:garni temple|гегард:geghard|эчмиадзин:etchmiadzin|татев:tatev|москва:moscow|париж:paris|италия:italy|европа:europe|тбилиси:tbilisi|церковь:church|храм:temple|монастырь:monastery|замок:castle|мост:bridge|
фон,фоны,фоновый:background|текстура,текстуры:texture|мрамор,мраморный:marble|акварель,акварельный:watercolor|золото:gold|золотой,золотая,золотые:golden|серебро,серебряный:silver|дерево,деревянный:wood|бумага:paper|крафт:kraft paper|картон:cardboard|ткань:fabric|лен:linen|кожа:leather|бетон:concrete|кирпич:brick|стена:wall|металл:metal|стекло:glass|узор,узоры:pattern|орнамент:ornament|геометрия,геометрический:geometric|абстракция,абстрактный:abstract|градиент:gradient|блестки:glitter|боке:bokeh|минимализм:minimal|винтаж,винтажный:vintage|ретро:retro|гранж:grunge|неон:neon|пастель,пастельный:pastel|рамка:frame|линии:lines|точки:dots|полосы:stripes|клетка:checkered|цветочный:floral|тропический:tropical|космос:space|галактика:galaxy|свет:light|тень:shadow|дым:smoke|краски,краска:paint|чернила:ink|мазки:brush strokes|рисунок:drawing|иллюстрация:illustration|силуэт:silhouette|
красный:red|оранжевый:orange|желтый:yellow|зеленый:green|голубой:light blue|синий:blue|фиолетовый:purple|розовый:pink|белый:white|черный:black|серый:gray|коричневый:brown|бежевый:beige|бордовый:burgundy|бирюзовый:turquoise|мятный:mint|пудровый:dusty pink|персиковый:peach|
люди:people|человек:person|женщина:woman|мужчина:man|девушка:young woman|парень:young man|пара:couple|друзья:friends|улыбка:smile|руки:hands|портрет:portrait|рабочий:worker|учеба,образование:education|музыка:music|гитара:guitar|пианино:piano|концерт:concert|театр:theater|кино:cinema|искусство:art|художник:artist|фото:photo|книга:book|крест:cross|
красивый:beautiful|яркий:bright|темный:dark|светлый:light|нежный:delicate|элегантный:elegant|роскошный,люкс:luxury|современный:modern|классический:classic|простой:simple|детский:kids|летний:summer|зимний:winter|осенний:autumn|весенний:spring|новогодний:christmas|праздничный:festive|морской:sea|горный:mountain|вкусный:delicious|свежий:fresh|натуральный:natural|органический:organic|домашний:homemade|ручная работа:handmade|большой:big|маленький:small|старый:old|новый:new`;
const DICT=new Map(), STEM=new Map(), PSTEM=new Map();
const ENDS=['иями','ями','ами','ого','его','ому','ему','ыми','ими','ий','ый','ой','ая','яя','ое','ее','ые','ие','ых','их','ую','юю','ов','ев','ей','ам','ям','ах','ях','ом','ем','ы','и','а','я','у','ю','е','о','ь','й'];
const nrm=s=>String(s||'').toLowerCase().replace(/ё/g,'е');
const stem=w=>{ if(w.length<4) return w; for(const e of ENDS) if(w.endsWith(e)&&w.length-e.length>=3) return w.slice(0,-e.length); return w; };
DICT_SRC.split(/[|\n]/).forEach(p=>{ const i=p.lastIndexOf(':'); if(i<1) return; const en=p.slice(i+1).trim(); p.slice(0,i).split(',').forEach(k=>{ k=nrm(k).trim(); if(!k||!en) return; if(!DICT.has(k)) DICT.set(k,en); const st=k.split(' ').map(stem).join(' '); const M=k.includes(' ')?PSTEM:STEM; if(!M.has(st)) M.set(st,en); }); });
const STOP=new Set('и в во на с со для по из к ко у о об от до за под над а или же как'.split(' '));
function tr(q){ const raw=String(q||'').trim(), n=nrm(raw);
  if(!/[а-я]/.test(n)) return {en:raw,miss:[],ru:false};
  const T=n.split(/[\s,;.!?()«»"'\/+:]+/).filter(Boolean), out=[], miss=[];
  for(let i=0;i<T.length;){ let hit=false;
    for(let k=Math.min(4,T.length-i);k>=2&&!hit;k--){ const ph=T.slice(i,i+k), v=DICT.get(ph.join(' '))||PSTEM.get(ph.map(stem).join(' ')); if(v){ out.push(v); i+=k; hit=true; } }
    if(hit) continue; const w=T[i++]; if(STOP.has(w)) continue;
    if(!/[а-я]/.test(w)){ out.push(w); continue; }
    const v=DICT.get(w)||STEM.get(stem(w)); if(v) out.push(v); else { out.push(w); miss.push(w); } }
  const seen=new Set(), en=out.join(' ').split(' ').filter(x=>x&&!seen.has(x)&&seen.add(x)).join(' ');
  return {en:en||raw,miss,ru:true}; }

/* ---------- print quality for the current product ---------- */
function target(){ try{ const on=typeof dzOn==='function'&&dzOn(), P=st.prod&&typeof prodById==='function'?prodById(st.prod):null;
    const sel=on?KS.sel():null;
    if(sel&&sel.t==='img'&&sel.w>3&&sel.h>3) return {w:sel.w,h:sel.h,label:'рамка на макете '+mmT(sel.w)+' × '+mmT(sel.h)+' мм',frame:true};
    if(on&&st.dz.w&&st.dz.h){ const n=P&&P.n?P.n:'Макет'; return {w:st.dz.w,h:st.dz.h,label:/\d/.test(n)?n:n+' '+mmT(st.dz.w)+' × '+mmT(st.dz.h)+' мм'}; }
    if(P&&P.w&&P.h) return {w:P.w,h:P.h,label:P.n};
  }catch(_){} return {w:210,h:297,label:'лист A4'}; }
const dpiOf=(w,h,T)=>{ if(!w||!h) return 0; T=T||target(); return Math.round(Math.min(w*25.4/T.w,h*25.4/T.h)); };
const qcls=d=>!d?'':d>=300?'ok':d>=150?'warn':'bad';
const QTXT={ok:'отлично',warn:'нормально',bad:'только мелко'};
const qBadge=(w,h,T)=>{ const d=dpiOf(w,h,T), c=qcls(d); return d?`<span class="ph-qb ${c}" title="${E(d+' dpi — '+QTXT[c])}"><i></i>${d} dpi</span>`:''; };
const tSig=()=>{ const T=target(); return T.w+'x'+T.h; };

/* ---------- network ---------- */
const err=(code,st)=>{ const e=new Error(code); e.code=code; e.st=st; return e; };
async function getJSON(url,headers){
  if(navigator.onLine===false) throw err('offline');
  const ac=typeof AbortController==='function'?new AbortController():null, tm=setTimeout(()=>{ try{ ac&&ac.abort(); }catch(_){} },15000); let r;
  try{ r=await fetch(url,{headers:headers||{},mode:'cors',credentials:'omit',signal:ac?ac.signal:undefined}); }
  catch(e){ clearTimeout(tm); throw err(ac&&ac.signal.aborted?'timeout':navigator.onLine===false?'offline':'net'); }
  clearTimeout(tm); const txt=await r.text().catch(()=>'');
  if(r.status===401||r.status===403) throw err('auth',r.status);
  if(r.status===429) throw err('limit',429);
  if(r.status===400&&/key/i.test(txt)) throw err('auth',400);
  if(!r.ok) throw err('http',r.status);
  try{ return JSON.parse(txt); }catch(_){ throw err('bad'); } }
const ERRT={offline:'нет интернета — проверьте подключение',auth:'ключ не подошёл ({st}). Проверьте его в «Ключи фотобанков»',limit:'исчерпан лимит запросов (429). Попробуйте позже или другой источник',net:'не ответил: сервер недоступен или браузер заблокировал запрос (CORS)',timeout:'слишком долго не отвечает — попробуйте ещё раз',http:'ошибка сервера ({st})',bad:'прислал непонятный ответ'};
const errText=(e,k)=>(e&&e.code==='auth'&&k&&!SRC[k].key?'отказал в доступе ({st}). Попробуйте позже или другой источник':(ERRT[e&&e.code]||ERRT.net)).replace('{st}',(e&&e.st)||'');
const withTO=(p,ms)=>new Promise((res,rej)=>{ const t=setTimeout(()=>rej(new Error('timeout')),ms); p.then(v=>{ clearTimeout(t); res(v); },e=>{ clearTimeout(t); rej(e); }); });
function hasAlpha(g,w,h){ try{ const d=g.getImageData(0,0,w,h).data; for(let i=3;i<d.length;i+=16) if(d[i]<250) return true; }catch(_){} return false; }
/* picture via <img crossOrigin> → canvas (works when the server allows CORS for images but fetch() is refused, e.g. wrong content type) */
function viaCanvas(url,max){ max=max||3200; return new Promise((res,rej)=>{ const im=new Image(); im.crossOrigin='anonymous'; try{ im.referrerPolicy='no-referrer'; }catch(_){}
  const tm=setTimeout(()=>{ im.onload=im.onerror=null; rej(new Error('timeout')); },30000);
  im.onload=()=>{ clearTimeout(tm); try{ const k=Math.min(1,max/Math.max(im.naturalWidth||1,im.naturalHeight||1)), cv=document.createElement('canvas'); cv.width=Math.max(1,Math.round(im.naturalWidth*k)); cv.height=Math.max(1,Math.round(im.naturalHeight*k)); const g=cv.getContext('2d'); g.drawImage(im,0,0,cv.width,cv.height);
      const a=/\.(png|gif|webp)(\?|#|$)/i.test(url)&&hasAlpha(g,cv.width,cv.height); res(cv.toDataURL(a?'image/png':'image/jpeg',.9)); }catch(e){ rej(e); } };
  im.onerror=()=>{ clearTimeout(tm); rej(new Error('img')); }; im.src=url; }); }
async function capData(u,max){ const b=await (await fetch(u)).blob(); return KS.readImage(new File([b],'img',{type:b.type||'image/png'}),max||3200); }
async function loadImg(u,max){ if(/^data:image\//i.test(u)) return capData(u,max);
  try{ return await withTO(KS.fetchImage(u,max||3200),30000); }catch(_){ return await viaCanvas(u,max); } }
function makeThumb(src,M){ M=M||360; return new Promise(res=>{ const im=new Image();
  im.onload=()=>{ try{ const k=Math.min(1,M/Math.max(im.naturalWidth||1,im.naturalHeight||1)), cv=document.createElement('canvas'); cv.width=Math.max(1,Math.round((im.naturalWidth||M)*k)); cv.height=Math.max(1,Math.round((im.naturalHeight||M)*k)); const g=cv.getContext('2d'); g.drawImage(im,0,0,cv.width,cv.height);
      const a=/^data:image\/(png|gif|webp|svg)/i.test(src)&&hasAlpha(g,cv.width,cv.height); res(cv.toDataURL(a?'image/png':'image/jpeg',.82)); }catch(_){ res(String(src).length<300000?src:''); } };
  im.onerror=()=>res(''); im.src=src; }); }

/* ---------- photo stocks ---------- */
const OR={h:{ov:'wide',px:'landscape',us:'landscape',pb:'horizontal'},v:{ov:'tall',px:'portrait',us:'portrait',pb:'vertical'},s:{ov:'square',px:'square',us:'squarish',pb:''}};
const orientOk=(it,o)=>{ if(!o||!it.w||!it.h) return true; const r=it.w/it.h; return o==='h'?r>1.08:o==='v'?r<.93:r>=.85&&r<=1.18; };
const COLORS=[['','Любой цвет',''],['red','Красный','#e5383b'],['orange','Оранжевый','#fb8500'],['yellow','Жёлтый','#ffd60a'],['green','Зелёный','#38b000'],['turquoise','Бирюзовый','#00b4d8'],['blue','Синий','#2f6fed'],['violet','Фиолетовый','#8e44ec'],['pink','Розовый','#ff5fa2'],['brown','Коричневый','#8d5b3a'],['black','Чёрный','#141414'],['gray','Серый','#9aa0a6'],['white','Белый','#ffffff'],['bw','Чёрно-белые','linear-gradient(135deg,#111 0 50%,#fff 50% 100%)']];
const CMAP={px:{red:'red',orange:'orange',yellow:'yellow',green:'green',turquoise:'turquoise',blue:'blue',violet:'violet',pink:'pink',brown:'brown',black:'black',gray:'gray',white:'white'},
  us:{red:'red',orange:'orange',yellow:'yellow',green:'green',turquoise:'teal',blue:'blue',violet:'purple',pink:'magenta',black:'black',white:'white',bw:'black_and_white'},
  pb:{red:'red',orange:'orange',yellow:'yellow',green:'green',turquoise:'turquoise',blue:'blue',violet:'lilac',pink:'pink',brown:'brown',black:'black',gray:'gray',white:'white',bw:'grayscale'}};
const utm=u=>u?u+(u.includes('?')?'&':'?')+'utm_source=konvert_studio&utm_medium=referral':'';
const licName=(l,v)=>{ l=String(l||'').toLowerCase(); if(!l) return ''; if(l==='cc0') return 'CC0 (общественное достояние)'; if(l==='pdm') return 'Общественное достояние'; return 'CC '+l.toUpperCase()+(v?' '+v:''); };
const thumbW=(u,w)=>u?u.replace(/\/\d+px-/,'/'+w+'px-'):'';
const SRC={
  openverse:{n:'Openverse',full:'Openverse',home:'https://openverse.org',
    async search(q,pg,f,key,pp){ const n=Math.min(pp||20,20), u=new URLSearchParams({q,page:pg,page_size:n,mature:'false'}); if(f.comm) u.set('license_type','commercial'); const o=OR[f.orient]; if(o) u.set('aspect_ratio',o.ov);
      const j=await getJSON('https://api.openverse.org/v1/images/?'+u);
      const items=(j.results||[]).map(r=>({src:'openverse',id:r.id,title:r.title||'',thumb:r.thumbnail||r.url,large:r.url||r.thumbnail,full:[r.url,r.thumbnail],w:+r.width||0,h:+r.height||0,author:r.creator||'',authorUrl:r.creator_url||'',license:licName(r.license,r.license_version),licUrl:r.license_url||'',page:r.foreign_landing_url||'',via:r.source||r.provider||''})).filter(x=>x.thumb);
      return {items,more:pg<(+j.page_count||0)&&pg*n<240}; }},
  wikimedia:{n:'Wikimedia',full:'Wikimedia Commons',home:'https://commons.wikimedia.org',
    async search(q,pg,f,key,pp){ const n=pp||30, u=new URLSearchParams({action:'query',format:'json',origin:'*',generator:'search',gsrnamespace:6,gsrsearch:q+' filetype:bitmap',gsrlimit:n,gsroffset:(pg-1)*n,prop:'imageinfo',iiprop:'url|size|mime|extmetadata',iiurlwidth:480});
      const j=await getJSON('https://commons.wikimedia.org/w/api.php?'+u); if(j&&j.error) throw err('http',j.error.code||'API');
      const pages=Object.values((j.query&&j.query.pages)||{}).sort((a,b)=>(a.index||0)-(b.index||0));
      let items=pages.map(p=>{ const ii=(p.imageinfo||[])[0]; if(!ii||!/^image\/(jpeg|png|webp)$/i.test(ii.mime||'')) return null; const m=ii.extmetadata||{}, g=k=>m[k]&&m[k].value;
        const tt=strip(g('ObjectName'))||String(p.title||'').replace(/^File:/i,'').replace(/\.\w+$/,'');
        return {src:'wikimedia',id:p.pageid,title:tt,thumb:ii.thumburl||ii.url,large:ii.width>1280&&ii.thumburl?thumbW(ii.thumburl,1280):ii.url,full:[ii.width>3840&&ii.thumburl?thumbW(ii.thumburl,3840):ii.url,ii.width>3840?ii.url:'',ii.width>1920&&ii.thumburl?thumbW(ii.thumburl,1920):'',ii.thumburl],w:+ii.width||0,h:+ii.height||0,author:strip(g('Artist')),license:strip(g('LicenseShortName'))||'См. страницу файла',licUrl:g('LicenseUrl')||'',page:ii.descriptionurl||''}; }).filter(Boolean);
      if(f.orient) items=items.filter(x=>orientOk(x,f.orient));
      return {items,more:!!(j.continue&&j.continue.gsroffset)}; }},
  pexels:{n:'Pexels',full:'Pexels',key:'pexels',get:'https://www.pexels.com/api/',home:'https://www.pexels.com',color:1,
    async search(q,pg,f,key,pp){ const u=new URLSearchParams({query:q,per_page:pp||30,page:pg}); const o=OR[f.orient]; if(o) u.set('orientation',o.px); const c=CMAP.px[f.color]; if(c) u.set('color',c);
      const j=await getJSON('https://api.pexels.com/v1/search?'+u,{Authorization:key});
      const items=(j.photos||[]).map(p=>{ const s=p.src||{}, o0=s.original||''; const big=p.width>3200&&o0?o0+(o0.includes('?')?'&':'?')+'auto=compress&cs=tinysrgb&w=3200':o0;
        return {src:'pexels',id:p.id,title:p.alt||'',thumb:s.medium||s.large||s.small,large:s.large2x||s.large||o0,full:[big,s.large2x,s.large],w:+p.width||0,h:+p.height||0,author:p.photographer||'',authorUrl:p.photographer_url||'',license:'Лицензия Pexels (бесплатно, можно в коммерции)',licUrl:'https://www.pexels.com/license/',page:p.url||'',color:p.avg_color||''}; });
      return {items,more:!!j.next_page}; }},
  unsplash:{n:'Unsplash',full:'Unsplash',key:'unsplash',get:'https://unsplash.com/developers',home:'https://unsplash.com',color:1,
    async search(q,pg,f,key,pp){ const u=new URLSearchParams({query:q,per_page:pp||30,page:pg,client_id:key}); const o=OR[f.orient]; if(o) u.set('orientation',o.us); const c=CMAP.us[f.color]; if(c) u.set('color',c);
      const j=await getJSON('https://api.unsplash.com/search/photos?'+u);
      const items=(j.results||[]).map(p=>{ const U=p.urls||{}, L=p.links||{}, us=p.user||{}; const big=U.full?(p.width>3200?U.full+(U.full.includes('?')?'&':'?')+'w=3200':U.full):'';
        return {src:'unsplash',id:p.id,title:p.alt_description||p.description||'',thumb:U.small||U.regular,large:U.regular||U.full,full:[big,U.regular],w:+p.width||0,h:+p.height||0,author:us.name||'',authorUrl:utm((us.links||{}).html||''),license:'Лицензия Unsplash (бесплатно, можно в коммерции)',licUrl:'https://unsplash.com/license',page:utm(L.html||''),color:p.color||'',dl:L.download_location||''}; });
      return {items,more:pg<(+j.total_pages||0)}; }},
  pixabay:{n:'Pixabay',full:'Pixabay',key:'pixabay',get:'https://pixabay.com/api/docs/',home:'https://pixabay.com',color:1,
    async search(q,pg,f,key,pp){ const u=new URLSearchParams({key,q:q.slice(0,100),per_page:Math.max(3,pp||30),page:pg,image_type:'photo',safesearch:'true'}); const o=OR[f.orient]; if(o&&o.pb) u.set('orientation',o.pb); const c=CMAP.pb[f.color]; if(c) u.set('colors',c);
      const j=await getJSON('https://pixabay.com/api/?'+u);
      let items=(j.hits||[]).map(p=>({src:'pixabay',id:p.id,title:String(p.tags||'').split(',').slice(0,4).join(', '),thumb:p.webformatURL,large:p.largeImageURL||p.webformatURL,full:[p.largeImageURL,p.webformatURL],w:+p.imageWidth||0,h:+p.imageHeight||0,cap:1280,author:p.user||'',authorUrl:p.user&&p.user_id?`https://pixabay.com/users/${encodeURIComponent(p.user)}-${p.user_id}/`:'',license:'Лицензия Pixabay (бесплатно, можно в коммерции)',licUrl:'https://pixabay.com/service/license-summary/',page:p.pageURL||''})).filter(x=>x.thumb);
      if(f.orient==='s') items=items.filter(x=>orientOk(x,'s'));
      return {items,more:pg*(pp||30)<(+j.totalHits||0)}; }}
};
const SKEYS=Object.keys(SRC), KEYED=SKEYS.filter(k=>SRC[k].key);
const keyOf=k=>{ const d=SRC[k]; return d.key?String(S().keys[d.key]||'').trim():''; };
const avail=k=>!SRC[k].key||!!keyOf(k);
function activeSrcs(){ const s=S(), av=SKEYS.filter(avail); return s.src&&s.src!=='all'&&av.includes(s.src)?[s.src]:av; }
function normItem(it){ it.uid=it.src+':'+it.id; it.full=uniq(it.full||[]); const cap=it.cap||3200, m=Math.max(it.w||0,it.h||0), k=m>cap?cap/m:1; it.dw=Math.round((it.w||0)*k); it.dh=Math.round((it.h||0)*k); it.ar=it.w&&it.h?it.w/it.h:1.4; return it; }

/* ---------- search state ---------- */
let R=null, TOK=0;
const SCR={search:null,mine:null};
const BOX={search:null,mine:null};
async function searchFor(qText){ const s=S(); const q=String(qText==null?(s.q||''):qText).trim();
  if(!q){ say('Напишите, что искать — например «цветы»'); focusQ(); return; }
  s.q=q; s.recent=[q,...s.recent.filter(x=>nrm(x)!==nrm(q))].slice(0,8); KS.save();
  const inp=q1(BOX.search,'[data-r=q]'); if(inp&&inp.value!==q&&document.activeElement!==inp) inp.value=q; paintTr();
  const t=tr(q), en=s.raw?q:t.en, srcs=activeSrcs();
  const tok=++TOK; R={q,en,t,srcs,items:[],seen:new Set(),page:{},more:{},err:{},busy:true,f:{orient:s.orient,color:s.color,comm:!!s.comm}};
  paintSearch(); await fetchBatch(tok); }
async function fetchBatch(tok){ const r=R; if(!r) return; const list=r.srcs.filter(k=>r.page[k]===undefined||r.more[k]); if(!list.length) return;
  r.busy=true; if(r.items.length) paintFoot();
  const res=await Promise.all(list.map(k=>{ const pg=(r.page[k]||0)+1; let p; try{ p=SRC[k].search(r.en,pg,r.f,keyOf(k)); }catch(e){ p=Promise.reject(e); } return p.then(v=>({k,pg,v}),e=>({k,pg,e})); }));
  if(tok!==TOK||r!==R) return;
  const lists=[]; res.forEach(({k,pg,v,e})=>{ if(e&&pg>1){ r.more[k]=false; return; } if(e){ r.err[k]=e; r.more[k]=false; if(e.code==='auth'&&SRC[k].key){ S().kst[SRC[k].key]='auth'; KS.save(); } return; } delete r.err[k]; r.page[k]=pg; r.more[k]=!!(v.more&&v.items.length); lists.push(v.items.map(normItem)); });
  const add=[]; for(let i=0;lists.some(l=>i<l.length);i++) lists.forEach(l=>{ const it=l[i]; if(it&&!r.seen.has(it.uid)){ r.seen.add(it.uid); add.push(it); } });
  const start=r.items.length; r.items.push(...add); r.busy=false;
  if(start===0) paintSearch(); else appendSearch(start); }
function more(){ if(!R||R.busy) return; fetchBatch(TOK); }
function rerunIfAny(){ if(R&&R.q) searchFor(R.q); }

/* ---------- getting the big picture of a stock photo ---------- */
const DC=new Map();
const dcPut=(k,v)=>{ DC.delete(k); DC.set(k,v); while(DC.size>8) DC.delete(DC.keys().next().value); };
async function getData(it,small){
  if(DC.has(it.uid)) return DC.get(it.uid); if(small&&DC.has(it.uid+':s')) return DC.get(it.uid+':s');
  const c=small?uniq([it.large,it.thumb,...it.full]):it.full;
  for(let i=0;i<c.length;i++){ try{ const data=await loadImg(c[i],3200); const sz=await KS.imgSize(data); const r={data,w:sz.w,h:sz.h,low:!small&&i>0&&sz.w&&Math.max(sz.w,sz.h)<Math.max(it.dw,it.dh)*.8};
      dcPut(it.uid+(small?':s':''),r); return r; }catch(_){} }
  return null; }
const TRACKED=new Set();
function trackUse(it){ try{ if(!it||it.src!=='unsplash'||!it.dl||TRACKED.has(it.uid)) return; const key=keyOf('unsplash'); if(!key) return; TRACKED.add(it.uid);
  fetch(it.dl+(it.dl.includes('?')?'&':'?')+'client_id='+encodeURIComponent(key),{mode:'cors',credentials:'omit'}).catch(()=>{}); }catch(_){} }
const creditOf=it=>({author:it.author||'',authorUrl:it.authorUrl||'',source:(SRC[it.src]&&SRC[it.src].full)||it.src||'',via:it.via||'',url:it.page||'',license:it.license||'',licUrl:it.licUrl||''});
function creditText(c){ if(!c) return ''; const src=c.source||''; let t='Фото: '+(c.author||'автор не указан')+(src?' / '+src:''); if(c.license&&/^CC|общественн/i.test(c.license)) t+=' ('+c.license.replace(/ \(.*\)$/,'')+')'; return t; }

/* ---------- library «Мои фото» ---------- */
let LIB=null, LIBP=null, LQ='', LSM=false; const LSEL=new Set();
const metaOf=(id,r)=>({id,name:r.name||'Фото',type:r.type||'',thumb:r.thumb||'',w:+r.w||0,h:+r.h||0,album:r.album||'Разное',added:+r.added||Date.now(),credit:r.credit||null,suid:r.suid||'',size:r.data?r.data.length:0});
function libLoad(force){ if(LIBP&&!force) return LIBP;
  LIBP=(async()=>{ let idx=[]; try{ idx=await KS.idb.get('ph:index','kv'); }catch(_){} if(!Array.isArray(idx)) idx=[];
    let keys=[]; try{ keys=(await KS.idb.keys('files')).filter(k=>typeof k==='string'&&k.startsWith('ph:')); }catch(e){ console.warn('[photos] idb',e); }
    const have=new Set(keys.map(k=>k.slice(3))); let ch=false;
    idx=idx.filter(m=>m&&have.has(m.id)?true:(ch=true,false));
    const known=new Set(idx.map(m=>m.id));
    for(const k of keys){ const id=k.slice(3); if(known.has(id)) continue; try{ const r=await KS.idb.get(k,'files'); if(!r||!r.data) continue;
        if(!r.thumb){ r.thumb=await makeThumb(r.data,360); if(!r.w){ const z=await KS.imgSize(r.data); r.w=z.w; r.h=z.h; } await KS.idb.set(k,r,'files'); }
        idx.push(metaOf(id,r)); known.add(id); ch=true; }catch(_){} }
    LIB=idx; if(ch) await libSaveIdx(); return LIB; })();
  return LIBP; }
async function libSaveIdx(){ try{ await KS.idb.set('ph:index',LIB||[],'kv'); }catch(e){ console.warn('[photos] index',e); } }
let EMITTING=false;
function emitChanged(){ EMITTING=true; try{ KS.emit('photosChanged',{by:'photos'}); }finally{ EMITTING=false; } }
async function libAdd(o){ await libLoad(); const data=o.data; const sz=await KS.imgSize(data); const thumb=await makeThumb(data,360);
  const id=KS.uid('ph'), type=(String(data).match(/^data:([^;,]+)/)||[])[1]||o.type||'image/jpeg';
  const rec={id,name:short(o.name||'Фото',80),type,data,thumb,w:sz.w,h:sz.h,album:o.album||'Разное',added:Date.now()+(o.n||0)};
  if(o.credit) rec.credit=o.credit; if(o.suid) rec.suid=o.suid;
  await KS.idb.set('ph:'+id,rec,'files'); const m=metaOf(id,rec); LIB.push(m); if(!o.defer){ await libSaveIdx(); emitChanged(); } return m; }
async function libData(id){ try{ const r=await KS.idb.get('ph:'+id,'files'); return r&&r.data?r.data:null; }catch(_){ return null; } }
async function libPatch(ids,patch){ await libLoad(); for(const id of [].concat(ids)){ try{ const r=await KS.idb.get('ph:'+id,'files'); if(!r) continue; Object.assign(r,patch); await KS.idb.set('ph:'+id,r,'files'); const m=LIB.find(x=>x.id===id); if(m) Object.assign(m,patch); }catch(e){ console.warn('[photos] patch',e); } }
  await libSaveIdx(); emitChanged(); }
async function libDelete(ids){ await libLoad(); ids=[].concat(ids); const keep=[];
  for(const id of ids){ try{ const r=await KS.idb.get('ph:'+id,'files'); if(r) keep.push([id,r]); await KS.idb.del('ph:'+id,'files'); }catch(_){} }
  const metas=LIB.filter(m=>ids.includes(m.id)); LIB=LIB.filter(m=>!ids.includes(m.id)); ids.forEach(i=>LSEL.delete(i)); await libSaveIdx(); emitChanged(); paintLib(); paintMeter();
  /* several deletions in a row are undone together */
  const U=DELU&&undoOn()?DELU:(DELU={keep:[],metas:[]}); U.keep.push(...keep); U.metas.push(...metas); const n=U.metas.length;
  undoBar(n>1?'Удалено: '+plural(n,['фото','фото','фото']):'Фото удалено', async()=>{ DELU=null; for(const [id,r] of U.keep){ try{ await KS.idb.set('ph:'+id,r,'files'); }catch(_){} }
    const ex=new Set(LIB.map(m=>m.id)); U.metas.forEach(m=>{ if(!ex.has(m.id)) LIB.push(m); }); await libSaveIdx(); emitChanged(); paintLib(); paintMeter(); say(n>1?'Фото возвращены':'Фото возвращено'); }); }
let DELU=null; const undoOn=()=>{ const u=document.getElementById('phUndo'); return !!(u&&!u.hidden); };
const allAlbums=()=>uniq([...ALB,...S().albums,...(LIB||[]).map(m=>m.album)]);
const baseName=n=>String(n||'').replace(/\.[a-z0-9]{2,5}$/i,'').replace(/[_]+/g,' ').trim()||'Фото';
const isImgFile=f=>f&&(/^image\//.test(f.type)||/\.(jpe?g|png|webp|gif|heic|heif|bmp|svg)$/i.test(f.name||''));
async function importFiles(files,album,openOne){ const list=[...(files||[])].filter(isImgFile);
  if(!list.length){ note('Это не картинки. Подойдут JPG, PNG, WebP, HEIC.','bad'); return []; }
  const out=[]; let bad=0;
  for(let i=0;i<list.length;i++){ const f=list[i]; if(list.length>1) note(`Добавляем ${i+1} из ${list.length}…`,'busy');
    try{ const fx=f.type?f:new File([f],f.name,{type:'image/'+(/png$/i.test(f.name)?'png':'jpeg')}); const data=await KS.readImage(fx,3200); out.push(await libAdd({data,name:baseName(f.name),album:album||'Разное',n:i,defer:list.length>1})); }
    catch(e){ bad++; if(e&&/quota/i.test(String(e.name||e.message))){ note('Не хватает места в браузере для новых фото. Удалите ненужные в «Мои фото».','bad'); break; } } }
  if(out.length>1){ await libSaveIdx(); emitChanged(); }
  if(out.length) note((out.length>1?'Добавлено '+plural(out.length,['фото','фото','фото']):'Фото добавлено')+' в «Мои фото» → «'+(album||'Разное')+'»'+(bad?' · не открылось: '+bad:''),'ok');
  else if(bad) note('Не удалось открыть картинку. Попробуйте другой файл.','bad');
  paintLib(); paintMeter(); if(out.length===1&&openOne) openCard('l',[out[0]],0); return out; }
function pinCands(u){ const m=String(u).match(/^(https?:\/\/i\.pinimg\.com\/)([^/]+)\/(.+)$/i); if(!m||!/^(\d+x\d*(_RS)?|originals)$/i.test(m[2])) return [u]; return uniq([m[1]+'originals/'+m[3],m[1]+'736x/'+m[3],u]); }
const PIN_FAIL='Pinterest не отдал картинку. Нажмите на неё правой кнопкой → «Скопировать изображение», потом ⌘V здесь.';
const WEB_FAIL='Сайт не отдал картинку (защита от скачивания). Сохраните её на компьютер и перетащите файл сюда — или скопируйте изображение и нажмите ⌘V.';
function nameFromUrl(u,pin){ if(pin) return 'Pinterest '+new Date().toLocaleDateString('ru-RU'); try{ const p=decodeURIComponent(new URL(u).pathname.split('/').pop()||''); return baseName(p)||hostOf(u); }catch(_){ return 'Картинка'; } }
let IMPORTING=false;
async function importUrl(url,o){ o=o||{}; url=String(url||'').trim(); if(!url) { note('Вставьте ссылку на картинку','bad'); return null; }
  if(/^data:image\//i.test(url)){ try{ const data=await capData(url); const m=await libAdd({data,name:'Картинка '+new Date().toLocaleDateString('ru-RU'),album:o.album||'Разное'}); note('Картинка добавлена в «Мои фото»','ok'); paintLib(); paintMeter(); openCard('l',[m],0); return m; }catch(_){ note('Не удалось открыть картинку','bad'); return null; } }
  if(!/^https?:\/\//i.test(url)){ note('Это не похоже на ссылку на картинку. Ссылка начинается с https://','bad'); return null; }
  if(/pinterest\.[a-z.]+\/pin\//i.test(url)&&!o.page){ note('Это ссылка на страницу пина, а не на саму картинку. '+PIN_FAIL,'bad'); return null; }
  const pin=/pinimg\.com|pinterest\./i.test(url); if(IMPORTING){ note('Подождите, ещё загружаем прошлую картинку…','busy'); return null; }
  IMPORTING=true; note(pin?'Берём картинку из Pinterest в лучшем качестве…':'Загружаем картинку…','busy');
  try{ let data=null; for(const c of pinCands(url)){ try{ data=await loadImg(c,3200); break; }catch(_){} }
    if(!data){ note(pin?PIN_FAIL:WEB_FAIL,'bad'); return null; }
    const credit={author:'',source:pin?'Pinterest':hostOf(url),url:o.page||url,license:pin?'Права у автора — для идей и палитры':'Проверьте права у автора'};
    const m=await libAdd({data,name:nameFromUrl(url,pin),album:o.album||'Разное',credit});
    note('Картинка добавлена в «Мои фото» → «'+(o.album||'Разное')+'»','ok'); paintLib(); paintMeter(); openCard('l',[m],0); return m;
  }catch(e){ note(/quota/i.test(String(e&&(e.name||e.message)))?'Не хватает места в браузере для новых фото.':'Не удалось сохранить картинку.','bad'); return null; }
  finally{ IMPORTING=false; } }
function dtUrls(dt){ let urls=[]; const html=dt.getData&&dt.getData('text/html')||'';
  if(html){ try{ const d=new DOMParser().parseFromString(html,'text/html'); d.querySelectorAll('img').forEach(im=>{ const ss=im.getAttribute('srcset'); if(ss){ const best=ss.split(',').map(x=>x.trim().split(/\s+/)).map(([u,w])=>({u,w:parseFloat(w)||1})).sort((a,b)=>b.w-a.w)[0]; if(best) urls.push(best.u); } const s=im.getAttribute('src'); if(s) urls.push(s); }); }catch(_){} }
  const ul=(dt.getData&&dt.getData('text/uri-list')||'').split(/\r?\n/).map(s=>s.trim()).filter(s=>s&&!s.startsWith('#'));
  const tx=(dt.getData&&dt.getData('text/plain')||'').trim();
  urls.push(...ul); if(/^(https?:\/\/|data:image\/)\S+$/i.test(tx)) urls.push(tx);
  urls=uniq(urls.filter(u=>/^(https?:\/\/|data:image\/)/i.test(u)));
  const sc=u=>/i\.pinimg\.com/i.test(u)?4:/^data:image/i.test(u)?3:/\.(jpe?g|png|webp|gif|avif)(\?|#|$)/i.test(u)?2:/pinterest\.[a-z.]+\/pin\//i.test(u)?-1:0;
  urls.sort((a,b)=>sc(b)-sc(a)); return {urls,page:ul.find(u=>/pinterest\.[a-z.]+\/pin\//i.test(u))||''}; }
function dtFiles(dt){ let f=[...((dt&&dt.files)||[])].filter(isImgFile);
  if(!f.length&&dt&&dt.items) for(const it of dt.items){ if(it.kind==='file'&&/^image\//.test(it.type)){ const x=it.getAsFile(); if(x) f.push(x); } }
  return f; }
function dtHas(dt){ if(!dt) return false; if(dtFiles(dt).length) return true; return dtUrls(dt).urls.length>0; }
function importDT(dt,album){ const files=dtFiles(dt); if(files.length) return importFiles(files,album,true);
  const {urls,page}=dtUrls(dt); if(!urls.length){ note('Здесь нет картинки. Перетащите само изображение, файл или ссылку на картинку.','bad'); return null; }
  return importUrl(urls[0],{album,page}); }
async function clipImport(album){ try{
    if(navigator.clipboard&&navigator.clipboard.read){ const items=await navigator.clipboard.read();
      for(const it of items){ const t=it.types.find(x=>/^image\//.test(x)); if(t){ const b=await it.getType(t); return importFiles([new File([b],'Из буфера '+new Date().toLocaleDateString('ru-RU')+'.'+(t.split('/')[1]||'png'),{type:t})],album,true); }
        if(it.types.includes('text/html')){ const h=await (await it.getType('text/html')).text(); const m=h.match(/<img[^>]+src=["']([^"']+)/i); if(m) return importUrl(m[1].replace(/&amp;/g,'&'),{album}); } } }
    const tx=navigator.clipboard&&navigator.clipboard.readText?(await navigator.clipboard.readText()).trim():'';
    if(tx&&/^(https?:\/\/|data:image\/)/i.test(tx)) return importUrl(tx,{album});
    note('В буфере нет картинки. Скопируйте изображение («Скопировать изображение») и нажмите ещё раз.','bad');
  }catch(_){ note('Браузер не дал прочитать буфер. Нажмите ⌘V на клавиатуре или перетащите картинку сюда.','bad'); } }

/* ---------- notices (side panel status + screen banner) ---------- */
let NOTE_T=0;
function note(msg,kind){ const html=`<span class="ph-ni">${kind==='busy'?'<span class="ph-spin"></span>':kind==='ok'?ic(IC.check):kind==='bad'?ic(IC.warn):''}</span><span>${E(msg)}</span>`;
  const sc=activeScr(), nb=sc&&q1(sc,'[data-r=note]');
  /* one place per message: success → the screen banner (or a toast), problems/progress → also next to the drop zone */
  qa(document,'[data-r=dst]').forEach(el=>{ if(kind==='ok'&&nb){ el.hidden=true; return; } el.className='ph-dst '+(kind||''); el.innerHTML=html; el.hidden=false; });
  if(nb){ nb.className='ph-note '+(kind||''); nb.innerHTML=html+(kind==='busy'?'':`<button class="ph-nx" data-a="nx" aria-label="Скрыть">${ic(IC.x)}</button>`); nb.hidden=false; }
  clearTimeout(NOTE_T); if(kind==='ok') NOTE_T=setTimeout(()=>{ qa(document,'.ph-note.ok,.ph-dst.ok').forEach(el=>{ el.hidden=true; }); },6000);
  if(!nb&&(kind==='ok'||(kind==='bad'&&msg.length<70))) say(msg); }
function activeScr(){ if(activeTab!==TID) return null; const a=KS.active(); return a&&a.id==='phmine'?SCR.mine:SCR.search; }
function undoBar(msg,fn){ let u=document.getElementById('phUndo'); if(!u){ u=document.createElement('div'); u.id='phUndo'; u.className='ph-undo'; u.hidden=true; document.body.appendChild(u); }
  u.innerHTML=`<span>${E(msg)}</span><button class="btn sm" data-a="undo">Вернуть</button><button class="ph-ux" data-a="ux" aria-label="Закрыть">${ic(IC.x)}</button>`; u.hidden=false;
  clearTimeout(undoBar.t); const done=()=>{ u.hidden=true; }; u.onclick=e=>{ const b=e.target.closest('button'); if(!b) return; done(); if(b.dataset.a==='undo') fn(); }; undoBar.t=setTimeout(done,9000); }

/* ---------- actions on a photo (search result or library item) ---------- */
const selImg=()=>{ try{ if(!dzOn()) return null; const e=KS.sel(); return e&&e.t==='img'?e:null; }catch(_){ return null; } };
function goDesign(){ const b=document.querySelector('#rail .rbtn[data-tab="dz"]'); if(b) b.click(); }
function cardStatus(html,kind){ const el=CARD.root.hidden?null:q1(CARD.el,'[data-r=cst]'); if(el){ el.className='ph-cst '+(kind||''); el.innerHTML=html; el.hidden=!html; } }
const BUSY=new Set();
async function act(a,it,kind,tile){
  if(a==='src'){ const u=kind==='l'?(it.credit&&it.credit.url):(it.page||it.large); if(u) window.open(u,'_blank','noopener'); return; }
  const key=(kind==='l'?'l:'+it.id:it.uid)+':'+a; if(BUSY.has(key)) return; BUSY.add(key);
  if(tile) tile.classList.add('busy'); cardStatus('<span class="ph-spin"></span>'+(kind==='l'?'Открываем фото…':a==='pal'?'Берём цвета…':'Скачиваем фото в хорошем качестве…'),'busy');
  try{
    if(kind==='s'&&a==='save'){ await saveStock(it,tile); return; }
    let data=null, w=0, h=0, low=false, credit=null;
    if(kind==='l'){ data=await libData(it.id); w=it.w; h=it.h; credit=it.credit||null; if(!data){ cardStatus('Фото не найдено в хранилище','bad'); say('Фото не найдено'); return; } }
    else { const r=await getData(it,a==='pal'); if(!r){ failMsg(it); return; } data=r.data; w=r.w; h=r.h; low=r.low; credit=creditOf(it); }
    if(a==='dl'){ const b=await (await fetch(data)).blob(); KS.download(baseName(it.name||'foto')+'.'+((b.type.split('/')[1]||'jpg').replace('jpeg','jpg')),b); cardStatus(''); return; }
    if(a==='pal'){ const cols=await KS.palette(data,'Из фото'); if(kind==='s') trackUse(it);
      if(cols&&cols.length) cardStatus(`<span class="ph-sw">${cols.map(c=>`<i style="background:${E(c)}"></i>`).join('')}</span><span>Палитра применена к макету</span><button class="ph-link" data-a="godz">Открыть макет</button>`,'ok'); else cardStatus('Не получилось взять цвета','bad'); return; }
    const T0=target(), dp=dpiOf(w,h,a==='bg'?{w:st.dz&&st.dz.w||T0.w,h:st.dz&&st.dz.h||T0.h}:T0);
    if(a==='rep'){ const e=selImg(); if(!e){ cardStatus('Сначала выберите фото на макете','bad'); say('Сначала выберите фото на макете'); return; }
      if(e.k==='logo'){ st.dz.brand=Object.assign({},st.dz.brand,{logo:data}); update(); say('Логотип заменён'); }
      else { const el=await KS.addImage(data,{mode:'replace',credit}); fixCredit(el,credit); } }
    else if(a==='bg'){ await KS.addImage(data,{mode:'bg'}); }
    else { const el=await KS.addImage(data,{mode:'auto',credit}); fixCredit(el,credit); }
    if(kind==='s') trackUse(it);
    CARD.close(); goDesign();
    if(low) setTimeout(()=>say('Сайт не отдал большое фото — взяли копию поменьше. Для печати крупно не подойдёт'),400);
    else if(dp&&dp<150) setTimeout(()=>say('Внимание: всего '+dp+' dpi — для такого размера фото мелковато'),400);
  }catch(e){ console.error('[photos] act',e); cardStatus('Не получилось: '+E(e&&e.message||e),'bad'); }
  finally{ BUSY.delete(key); if(tile) tile.classList.remove('busy'); } }
function fixCredit(el,credit){ if(!el||typeof el!=='object') return; if(credit&&(credit.author||credit.source)) el.credit=credit; else delete el.credit; KS.save(); }
function failMsg(it){ const m=`Сайт автора не отдал картинку программе. Откройте источник и скачайте фото, потом перетащите файл сюда.`;
  cardStatus(`<span>${m}</span>${it.page?`<a class="ph-link" href="${E(it.page)}" target="_blank" rel="noopener">Открыть источник</a>`:''}`,'bad'); say('Сайт не отдал картинку — откройте источник'); }
async function saveStock(it,tile){ await libLoad(); const ex=LIB.find(m=>m.suid===it.uid); if(ex){ cardStatus('Уже есть в «Мои фото» → «'+E(ex.album)+'»','ok'); say('Это фото уже в «Мои фото»'); return; }
  const r=await getData(it,false); if(!r){ failMsg(it); return; }
  const sel=q1(CARD.el,'[data-r=salb]'); const album=CS&&CS.list[CS.i]===it&&sel&&!CARD.root.hidden?sel.value:(S().saveAlb||'Разное');
  try{ const m=await libAdd({data:r.data,name:it.title||(SRC[it.src].n+' '+it.id),album,credit:creditOf(it),suid:it.uid}); trackUse(it); paintMeter();
    if(tile) tile.classList.add('saved'); qa(SCR.search,'.ph-t').forEach(t=>{ if(R&&R.items[+t.dataset.i]===it) t.classList.add('saved'); });
    if(CS&&CS.list[CS.i]===it&&!CARD.root.hidden){ const row=q1(CARD.el,'.ph-saverow'); if(row) row.outerHTML=saveRow(it,''); }
    cardStatus('Сохранено в «Мои фото» → «'+E(m.album)+'»'+(r.low?' (копия поменьше — сайт не отдал оригинал)':''),'ok'); say('Сохранено в «Мои фото»'); }
  catch(e){ cardStatus('Не хватает места в браузере для фото','bad'); say('Не удалось сохранить фото'); } }

/* ---------- photo card (shared by search results and «Мои фото») ---------- */
function saveRow(it,albs){ const ex=LIB&&LIB.find(m=>m.suid===it.uid);
  return ex?`<div class="ph-saverow"><button class="btn ph-saved" data-a="mine" title="Открыть «Мои фото»">${ic(IC.check)}<span>Уже в «Мои фото» → «${E(ex.album)}»</span></button></div>`
    :`<div class="ph-saverow"><button class="btn" data-a="save">${ic(IC.book)}<span>В мои фото</span></button><select data-r="salb" aria-label="Альбом">${albs}</select></div>`; }
let CS=null;
const CARD=KS.modal({id:'ph-card',title:'Фото',wide:true,onClose(){ CS=null; }});
CARD.root.classList.add('ph-cardm');
function openCard(kind,list,i){ if(!list||!list[i]) return; CS={kind,list,i}; paintCard(); CARD.open(); }
function navCard(d){ if(!CS) return; const n=CS.i+d; if(n<0||n>=CS.list.length) return; CS.i=n; paintCard(); }
function paintCard(){ if(!CS) return; const it=CS.list[CS.i]; if(!it){ CARD.close(); return; } const lib=CS.kind==='l', T=target();
  const w=lib?it.w:it.dw, h=lib?it.h:it.dh, d=dpiOf(w,h,T), c=qcls(d), cr=lib?it.credit:creditOf(it), rep=selImg();
  CARD.title(lib?'Мои фото':'Фото · '+SRC[it.src].full);
  const A=(href,t)=>href?`<a href="${E(href)}" target="_blank" rel="noopener">${E(t)}</a>`:E(t);
  const meta=[];
  if(cr&&(cr.author||!lib)) meta.push(['Автор',cr.author?A(cr.authorUrl,cr.author):'не указан']);
  if(cr&&cr.license) meta.push(['Лицензия',A(cr.licUrl,cr.license)]);
  if(!lib) meta.push(['Источник',E(SRC[it.src].full)+(it.via&&it.via!==it.src?' · '+E(it.via):'')]);
  else if(cr&&cr.source) meta.push(['Источник',A(cr.url,cr.source)]);
  meta.push(['Размер',w&&h?`${w} × ${h} px`+(!lib&&it.w>w?` <small>(оригинал ${it.w} × ${it.h})</small>`:''):'неизвестен']);
  if(lib) meta.push(['Добавлено',E(new Date(it.added).toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'}))]);
  const albs=allAlbums().map(a=>`<option${a===(lib?it.album:(S().saveAlb||'Разное'))?' selected':''}>${E(a)}</option>`).join('');
  const n=CS.list.length;
  CARD.el.innerHTML=`<div class="ph-card">
   <div class="ph-cv${lib&&hasA(it)?' ph-chk':''}"><img class="ph-cimg" src="${E(lib?it.thumb:it.thumb)}" alt="${E(lib?it.name:it.title)}" draggable="false">
     ${n>1?`<button class="ph-nav prev" data-a="prev" aria-label="Предыдущее"${CS.i?'':' disabled'}>${ic(IC.left)}</button><button class="ph-nav next" data-a="next" aria-label="Следующее"${CS.i<n-1?'':' disabled'}>${ic(IC.right)}</button><span class="ph-cnum">${CS.i+1} / ${n}</span>`:''}</div>
   <div class="ph-ci">
     ${lib?`<label class="f">Название<input type="text" data-r="cname" value="${E(it.name)}" maxlength="80"></label><label class="f">Альбом<select data-r="calb">${albs}</select></label>`:`<div class="ph-ct">${E(short(it.title||'Без названия',140))}</div>`}
     <dl class="ph-meta">${meta.map(([k,v])=>`<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>
     ${d?`<div class="ph-cq ${c}"><b>${d} dpi — ${QTXT[c]}</b><small>${E(T.label)}, если фото на всю площадь</small></div>`:`<div class="ph-cq"><small>Размер фото неизвестен — качество проверим после загрузки</small></div>`}
     <div class="ph-cacts">
       <button class="btn primary" data-a="add">${ic(IC.plus)}<span>В макет</span></button>
       <button class="btn" data-a="rep"${rep?'':' disabled'} title="${rep?'Поставить вместо выбранного на макете фото':'Сначала выберите фото на макете'}">${ic(IC.swap)}<span>Заменить выбранное фото</span></button>
       <button class="btn" data-a="bg">${ic(IC.layers)}<span>Сделать фоном</span></button>
       <button class="btn" data-a="pal">${ic(IC.pal)}<span>Палитра из фото</span></button>
       ${lib?`<button class="btn" data-a="dl">${ic(IC.dl)}<span>Скачать файл</span></button>`:saveRow(it,albs)}
       <div class="ph-crow">${(lib?(cr&&cr.url):(it.page||it.large))?`<button class="btn sm" data-a="src">${ic(IC.ext)}<span>Открыть источник</span></button>`:''}${lib?`<button class="btn sm danger" data-a="del">${ic(IC.trash)}<span>Удалить</span></button>`:''}</div>
     </div>
     <p class="ph-cst" data-r="cst" hidden></p>
     ${lib&&cr&&cr.source==='Pinterest'?'<p class="hint">Картинка из Pinterest принадлежит автору: хороша для идей и палитры, для печати клиенту лучше фото со стоков.</p>':''}
     ${!lib&&rep?`<p class="hint">На макете выбрано фото — «В макет» тоже поставит снимок в эту рамку.</p>`:''}
   </div></div>`;
  const img=q1(CARD.el,'.ph-cimg'), still=()=>CS&&CS.list[CS.i]===it;
  if(lib){ libData(it.id).then(dd=>{ if(dd&&still()&&img) img.src=dd; }); }
  else if(it.large&&it.large!==it.thumb){ const big=new Image(); big.onload=()=>{ if(still()&&img) img.src=big.src; }; big.src=it.large; } }
CARD.el.addEventListener('click',e=>{ const b=e.target.closest('[data-a]'); if(!b||!CS) return; const a=b.dataset.a, it=CS.list[CS.i];
  if(a==='prev') return navCard(-1); if(a==='next') return navCard(1); if(a==='godz'){ CARD.close(); return goDesign(); }
  if(a==='del'){ CARD.close(); libDelete([it.id]); return; }
  if(a==='mine'){ CARD.close(); KS.show('photo','phmine'); return; }
  act(a,it,CS.kind,null); });
CARD.el.addEventListener('change',e=>{ if(!CS) return; const it=CS.list[CS.i], r=e.target.dataset.r;
  if(r==='cname'){ const v=short(e.target.value,80)||'Фото'; it.name=v; libPatch(it.id,{name:v}).then(()=>{ paintLib(); }); }
  if(r==='calb'){ libPatch(it.id,{album:e.target.value}).then(()=>{ paintLib(); paintAlbums(); say('Перенесено в «'+e.target.value+'»'); }); }
  if(r==='salb'){ S().saveAlb=e.target.value; KS.save(); } });
CARD.el.addEventListener('keydown',e=>{ if(e.key==='Enter'&&e.target.dataset.r==='cname') e.target.blur(); });
/* keyboard: ←/→ in the card; on the Фото tab protect the (hidden) design from Delete/arrows */
window.addEventListener('keydown',e=>{
  if(CS&&!CARD.root.hidden&&!typing()&&(e.key==='ArrowLeft'||e.key==='ArrowRight')){ e.preventDefault(); e.stopImmediatePropagation(); navCard(e.key==='ArrowLeft'?-1:1); return; }
  if(activeTab!==TID||typing()||anyModal()) return;
  if(e.key==='Delete'||e.key==='Backspace'){ e.preventDefault(); e.stopImmediatePropagation(); const a=KS.active(); if(a&&a.id==='phmine'&&LSEL.size) libDelete([...LSEL]); return; }
  if(/^Arrow/.test(e.key)) { e.stopImmediatePropagation(); return; }
  if((e.metaKey||e.ctrlKey)&&e.code==='KeyA'){ const a=KS.active(); if(a&&a.id==='phmine'){ e.preventDefault(); e.stopImmediatePropagation(); libView().forEach(m=>LSEL.add(m.id)); paintLib(); } } },true);
/* ⌘V / paste anywhere on the Фото tab (not in a text field) → «Мои фото» */
window.addEventListener('paste',e=>{ if(activeTab!==TID||typing()) return; const cd=e.clipboardData; if(!dtHas(cd)) return;
  e.preventDefault(); e.stopImmediatePropagation(); const a=KS.active(); importDT(cd,a&&a.id==='phmine'?(S().album||'Разное'):'Разное'); },true);

/* ---------- drag & drop on screens and drop zones ---------- */
let DROPOV=null;
function dropOverlay(on,text){ if(!DROPOV){ DROPOV=document.createElement('div'); DROPOV.className='ph-dropov'; DROPOV.hidden=true; const w=document.querySelector('.work'); (w||document.body).appendChild(DROPOV); }
  if(on){ DROPOV.innerHTML=`<div>${ic(IC.up)}<b>${E(text)}</b><span>Файлы, картинку из Pinterest или ссылку</span></div>`; } DROPOV.hidden=!on; }
const dragOk=e=>{ const t=e.dataTransfer&&e.dataTransfer.types; if(!t) return false; return [...t].some(x=>x==='Files'||x==='text/uri-list'||x==='text/html'||x==='text/plain'); };
function bindDrop(el,albumFn,label){ let n=0;
  el.addEventListener('dragenter',e=>{ if(!dragOk(e)||INTERNAL) return; e.preventDefault(); n++; if(label) dropOverlay(true,label); else el.classList.add('over'); });
  el.addEventListener('dragover',e=>{ if(!dragOk(e)||INTERNAL) return; e.preventDefault(); try{ e.dataTransfer.dropEffect='copy'; }catch(_){} });
  el.addEventListener('dragleave',()=>{ if(--n<=0){ n=0; if(label) dropOverlay(false); else el.classList.remove('over'); } });
  el.addEventListener('drop',e=>{ n=0; if(label) dropOverlay(false); else el.classList.remove('over'); if(INTERNAL||!e.dataTransfer) return; e.preventDefault(); e.stopPropagation(); importDT(e.dataTransfer,albumFn()); }); }
let INTERNAL=false; document.addEventListener('dragstart',e=>{ INTERNAL=!!(e.target&&e.target.closest&&e.target.closest('.ksscreen,.kspanel')); }); document.addEventListener('dragend',()=>{ INTERNAL=false; });

/* ---------- side panel: search ---------- */
const THEMES=['Цветы','Свадьба','Кофе','Торт','Дети','Осень','Море','Горы','Ереван','Арарат','Бизнес','Ресторан','Пицца','Маникюр','Авто','Спорт','Медицина','Праздник','Новый год','Шары','Фон','Текстура','Мрамор','Акварель'];
function focusQ(){ setTimeout(()=>{ const i=q1(BOX.search,'[data-r=q]'); if(i){ i.focus(); try{ i.select(); }catch(_){} } },60); }
function buildSearchPanel(box){ const s=S(); BOX.search=box; box.classList.add('ph-side');
  box.innerHTML=`
  <div class="card ph-sbox">
    <form class="ph-sform" data-r="form" autocomplete="off">
      <div class="ph-sin">${ic(IC.search)}<input type="text" data-r="q" enterkeyhint="search" placeholder="Например: цветы, свадьба" value="${E(s.q)}" aria-label="Поиск фото"><button type="button" class="ph-x" data-a="clr" aria-label="Очистить"${s.q?'':' hidden'}>${ic(IC.x)}</button></div>
      <button class="btn primary" type="submit">Найти</button>
    </form>
    <div class="ph-tr" data-r="tr"></div>
    <div class="ph-chips">${THEMES.map(t=>`<button class="ph-chip" data-q="${E(t)}">${E(t)}</button>`).join('')}</div>
  </div>
  <div class="card"><div class="hd2">Где искать</div><div class="ph-chips" data-r="srcs"></div><p class="hint" data-r="srch"></p></div>
  <div class="card ph-filt"><div class="hd2">Фильтры</div>
    <div class="seg ph-seg" data-r="or">${[['','Любая'],['h','Горизонт.'],['v','Вертик.'],['s','Квадрат']].map(([v,n])=>`<button data-or="${v}"${s.orient===v?' class="on"':''}>${n}</button>`).join('')}</div>
    <div class="ph-cols" data-r="cols">${COLORS.map(([v,n,c])=>`<button class="ph-col${s.color===v?' on':''}${v?'':' any'}" data-col="${v}" title="${E(n)}" aria-label="${E(n)}" style="${c?'--sw:'+c:''}">${v?'':ic(IC.x)}</button>`).join('')}</div>
    <p class="hint" data-r="colh"></p>
    <label class="chk"><input type="checkbox" data-r="comm"${s.comm?' checked':''}> Только для коммерческого использования</label>
  </div>
  <div class="card ph-pin">
    <div class="hd"><span>Pinterest и картинки из интернета</span></div>
    <button class="btn ph-pinbtn" data-a="pin">${ic(IC.pin)}<span>Найти в Pinterest</span><small data-r="pinq"></small></button>
    <p class="hint">Перетащите понравившуюся картинку из Pinterest сюда<br>или скопируйте её и нажмите ⌘V.</p>
    <div class="ks-drop ph-drop" data-a="pick" role="button" tabindex="0">${ic(IC.up)}<b>Перетащите картинку сюда</b><small>файл, картинку со страницы или ссылку</small></div>
    <div class="ph-url"><input type="text" data-r="url" placeholder="Вставить ссылку на картинку" autocomplete="off" autocapitalize="off" spellcheck="false"><button class="btn sm" data-a="url">Добавить</button></div>
    <button class="btn sm ph-clipb" data-a="clip">${ic(IC.clip)}<span>Вставить из буфера</span></button>
    <p class="ph-dst" data-r="dst" hidden></p>
    <p class="hint ph-rights">${ic(IC.shield)}<span>Картинки из Pinterest принадлежат авторам: годятся для идей и палитры, для печати клиенту берите фото со стоков.</span></p>
  </div>
  <details class="card ph-keys" data-r="keys">
    <summary>${ic(IC.key)}<span>Ключи фотобанков</span><span class="ks-badge" data-r="kcount"></span></summary>
    <p class="hint">Pexels, Unsplash и Pixabay дают бесплатный личный ключ — фото станет в разы больше. Ключ хранится только в этой программе.</p>
    ${KEYED.map(k=>`<div class="ph-key" data-k="${k}">
      <div class="ks-row"><b>${SRC[k].n}</b><span class="ks-sp"></span><span class="ks-badge" data-r="kst"></span></div>
      <input type="text" data-key="${k}" value="${E(s.keys[k]||'')}" placeholder="Вставьте ключ ${SRC[k].n}" autocomplete="off" autocapitalize="off" spellcheck="false">
      <div class="ks-row"><a class="ph-link" href="${SRC[k].get}" target="_blank" rel="noopener">Получить бесплатный ключ</a><span class="ks-sp"></span><button class="btn sm" data-a="test" data-k="${k}">Проверить</button></div>
    </div>`).join('')}
  </details>`;
  box.addEventListener('submit',e=>{ e.preventDefault(); const i=q1(box,'[data-r=q]'); searchFor(i.value); try{ if(matchMedia('(hover: none)').matches) i.blur(); }catch(_){} });
  box.addEventListener('input',e=>{ const r=e.target.dataset.r;
    if(r==='q'){ paintTr(); const x=q1(box,'[data-a=clr]'); if(x) x.hidden=!e.target.value; }
    if(e.target.dataset.key){ const k=e.target.dataset.key, s2=S(); s2.keys[k]=e.target.value.trim(); s2.kst[k]=''; KS.save(); paintSrcs(); paintKeys(); } });
  box.addEventListener('change',e=>{ if(e.target.dataset.r==='comm'){ S().comm=e.target.checked; KS.save(); rerunIfAny(); } });
  box.addEventListener('keydown',e=>{ if(e.key==='Enter'&&e.target.dataset.r==='url'){ e.preventDefault(); importUrl(e.target.value,{}).then(m=>{ if(m) e.target.value=''; }); }
    if((e.key==='Enter'||e.key===' ')&&e.target.dataset.a==='pick'){ e.preventDefault(); pickFiles('Разное'); } });
  box.addEventListener('click',e=>{ const b=e.target.closest('button,[data-a]'); if(!b||!box.contains(b)) return; const s2=S();
    if(b.dataset.q!=null){ const i=q1(box,'[data-r=q]'); i.value=b.dataset.q; const x=q1(box,'[data-a=clr]'); if(x) x.hidden=false; searchFor(b.dataset.q); return; }
    if(b.dataset.src!=null){ const k=b.dataset.src; if(k!=='all'&&!avail(k)){ openKeys(SRC[k].key); return; } s2.src=k; KS.save(); paintSrcs(); rerunIfAny(); return; }
    if(b.dataset.or!=null){ s2.orient=b.dataset.or; KS.save(); qa(box,'[data-or]').forEach(x=>x.classList.toggle('on',x===b)); rerunIfAny(); return; }
    if(b.dataset.col!=null){ s2.color=b.dataset.col; KS.save(); qa(box,'[data-col]').forEach(x=>x.classList.toggle('on',x===b)); paintColHint(); rerunIfAny(); return; }
    const a=b.dataset.a;
    if(a==='clr'){ const i=q1(box,'[data-r=q]'); i.value=''; b.hidden=true; paintTr(); i.focus(); return; }
    if(a==='raw'){ s2.raw=!s2.raw; KS.save(); paintTr(); rerunIfAny(); return; }
    if(a==='pin'){ const q=(q1(box,'[data-r=q]').value||s2.q||'').trim(); window.open(q?'https://www.pinterest.com/search/pins/?q='+encodeURIComponent(q):'https://www.pinterest.com/','_blank','noopener'); return; }
    if(a==='pick'){ pickFiles('Разное'); return; }
    if(a==='url'){ const i=q1(box,'[data-r=url]'); importUrl(i.value,{}).then(m=>{ if(m) i.value=''; }); return; }
    if(a==='clip'){ clipImport('Разное'); return; }
    if(a==='test'){ testKey(b.dataset.k); return; } });
  bindDrop(q1(box,'.ph-drop'),()=>'Разное');
  syncSearchPanel(box); }
function syncSearchPanel(box){ if(!box) return; paintTr(); paintSrcs(); paintColHint(); paintKeys(); }
function paintTr(){ const box=BOX.search, el=q1(box,'[data-r=tr]'); if(!el) return; const inp=q1(box,'[data-r=q]'), v=(inp&&inp.value||'').trim(), s=S();
  const pq=q1(box,'[data-r=pinq]'); if(pq) pq.textContent=v?'«'+short(v,22)+'»':'';
  if(!v){ el.innerHTML='<span>Пишите по-русски — переведём для фотобанков</span>'; return; }
  const t=tr(v); if(!t.ru){ el.innerHTML=`<span>Ищем: <b>${E(v)}</b></span>`; return; }
  el.innerHTML=s.raw?`<span>Ищем как написано: <b>${E(v)}</b></span><button class="ph-link" data-a="raw">перевести</button>`
    :`<span>Ищем: <b>${E(t.en)}</b></span>${t.miss.length?`<span class="ph-miss">без перевода: ${E(t.miss.join(', '))}</span>`:''}<button class="ph-link" data-a="raw">искать как написано</button>`; }
function paintSrcs(){ const box=BOX.search, el=q1(box,'[data-r=srcs]'); if(!el) return; const s=S(); let cur=s.src||'all'; if(cur!=='all'&&!avail(cur)) cur='all';
  el.innerHTML=`<button class="ph-chip${cur==='all'?' on':''}" data-src="all">Все</button>`+SKEYS.map(k=>{ const ok=avail(k); return `<button class="ph-chip${cur===k?' on':''}${ok?'':' off'}" data-src="${k}" title="${ok?E(SRC[k].full):'Нужен бесплатный ключ — нажмите, чтобы ввести'}">${ok?'':ic(IC.lock)}${SRC[k].n}</button>`; }).join('');
  const h=q1(box,'[data-r=srch]'), off=KEYED.filter(k=>!avail(k)).map(k=>SRC[k].n); if(h){ h.textContent=off.length?off.join(', ')+' — после ввода бесплатного ключа (ниже).':'«Все» ищет во всех источниках сразу.'; } }
function paintColHint(){ const el=q1(BOX.search,'[data-r=colh]'); if(!el) return; const s=S(); const c=COLORS.find(x=>x[0]===s.color);
  el.textContent=s.color?`Цвет «${c?c[1].toLowerCase():''}» понимают Pexels, Unsplash и Pixabay`+(activeSrcs().some(k=>SRC[k].color)?'.':' — подключите ключ, бесплатные Openverse и Wikimedia цвет не фильтруют.'):'Цвет понимают Pexels, Unsplash и Pixabay.'; }
function paintKeys(){ const box=BOX.search; if(!box) return; const s=S(); let n=0;
  KEYED.forEach(k=>{ const row=q1(box,`.ph-key[data-k="${k}"]`); if(!row) return; const has=!!(s.keys[k]||'').trim(); if(has) n++; const st0=s.kst[k]||'', b=q1(row,'[data-r=kst]');
    const M={ok:['ok','работает'],auth:['bad','неверный ключ'],limit:['warn','лимит исчерпан'],net:['warn','нет связи'],offline:['warn','нет интернета'],timeout:['warn','нет ответа'],http:['warn','ошибка сервера'],bad:['warn','странный ответ'],busy:['','проверяем…']}[st0]||(has?['','не проверен']:['','нет ключа']);
    b.className='ks-badge '+M[0]; b.textContent=M[1]; });
  const kc=q1(box,'[data-r=kcount]'); if(kc){ kc.textContent=n+' из '+KEYED.length; kc.className='ks-badge'+(n?' ok':''); } }
function openKeys(k){ const d=q1(BOX.search,'[data-r=keys]'); if(!d) return; d.open=true; const i=k?q1(d,`[data-key="${k}"]`):null; setTimeout(()=>{ d.scrollIntoView({block:'nearest',behavior:'smooth'}); if(i) i.focus(); },50); if(k) say('Вставьте бесплатный ключ '+SRC[k].n); }
async function testKey(k){ const s=S(), key=(s.keys[k]||'').trim(); if(!key){ say('Сначала вставьте ключ'); openKeys(k); return; }
  s.kst[k]='busy'; paintKeys(); try{ await SRC[k].search('flowers',1,{orient:'',color:'',comm:false},key,3); s.kst[k]='ok'; say(SRC[k].n+': ключ работает'); }catch(e){ s.kst[k]=e.code||'net'; say(SRC[k].n+': '+errText(e)); }
  KS.save(); paintKeys(); paintSrcs(); }
function pickFiles(album){ KS.pick('image/*',true).then(f=>{ if(f&&f.length) importFiles(f,album,true); }); }

/* ---------- search screen ---------- */
function buildSearchScreen(sc){ sc.classList.add('ph-screen');
  sc.innerHTML=`<div class="ph-scr">
    <div class="ph-head"><div class="ph-ht"><div class="ph-h1">${ic(IC.search)}<span>Поиск фото</span></div><div class="ph-sub" data-r="sub"></div></div><div class="ph-qual" data-r="qual"></div></div>
    <div class="ph-note" data-r="note" hidden></div>
    <div class="ph-errs" data-r="errs"></div>
    <div class="ph-res" data-r="res"></div>
    <div class="ph-foot" data-r="foot"></div></div>`;
  sc.addEventListener('load',e=>{ const t=e.target; if(t&&t.tagName==='IMG'){ const x=t.closest('.ph-t,.ph-lt'); if(x) x.classList.add('ld'); } },true);
  sc.addEventListener('error',e=>{ const t=e.target; if(t&&t.tagName==='IMG'){ const x=t.closest('.ph-t,.ph-lt'); if(x) x.classList.add('ld','err'); } },true);
  sc.addEventListener('click',e=>{ const b=e.target.closest('[data-a],[data-q]'), t=e.target.closest('.ph-t');
    if(b&&sc.contains(b)){ if(b.dataset.q!=null){ const i=q1(BOX.search,'[data-r=q]'); if(i) i.value=b.dataset.q; searchFor(b.dataset.q); return; }
      const a=b.dataset.a;
      if(t&&R&&/^(add|bg|pal|save)$/.test(a)){ e.stopPropagation(); act(a,R.items[+t.dataset.i],'s',t); return; }
      if(a==='more') return more(); if(a==='keys') return openKeys(); if(a==='nx'){ const n=q1(sc,'[data-r=note]'); if(n) n.hidden=true; return; }
      if(a==='all'){ S().src='all'; KS.save(); paintSrcs(); rerunIfAny(); return; } if(a==='retry'){ rerunIfAny(); return; }
      if(a==='mine'){ KS.show('photo','phmine'); return; } return; }
    if(t&&R&&!t.classList.contains('sk')) openCard('s',R.items,+t.dataset.i); });
  bindDrop(sc,()=>'Разное','Отпустите — картинка попадёт в «Мои фото»'); }
const srcList=k=>k.map(x=>SRC[x].n).join(', ');
function subHTML(){ if(!R) return 'Бесплатные фотобанки прямо в программе'; const n=R.items.length;
  return `«${E(short(R.q,40))}»${R.en&&nrm(R.en)!==nrm(R.q)?` → <b>${E(short(R.en,50))}</b>`:''} · ${R.busy&&!n?'ищем…':plural(n,['фото','фото','фото'])} · ${E(srcList(R.srcs))}`; }
function errsHTML(){ if(!R) return ''; const ks=Object.keys(R.err); if(!ks.length) return '';
  if(!R.items.length&&!R.busy&&ks.length===R.srcs.length) return '';
  return ks.map(k=>{ const e=R.err[k]; return `<div class="ph-err ${e.code==='auth'||e.code==='limit'?'warn':''}">${ic(IC.warn)}<span><b>${SRC[k].n}</b> ${E(errText(e,k))}</span>${e.code==='auth'&&SRC[k].key?'<button class="btn sm" data-a="keys">Ключи</button>':''}</div>`; }).join(''); }
function tileS(it,i){ const ar=clamp(it.ar||1.4,.62,2.2), sv=LIB&&LIB.some(m=>m.suid===it.uid);
  return `<div class="ph-t${sv?' saved':''}" data-i="${i}" style="flex-grow:${(ar*100).toFixed(1)};flex-basis:calc(${ar.toFixed(3)} * var(--ph-rh));aspect-ratio:${ar.toFixed(3)};${it.color&&/^#[0-9a-f]{3,8}$/i.test(it.color)?'--c:'+it.color:''}">
<img src="${E(it.thumb)}" alt="${E(short(it.title,90))}" loading="lazy" decoding="async" draggable="false" referrerpolicy="no-referrer">
<span class="ph-src">${E(SRC[it.src].n)}</span>${qBadge(it.dw,it.dh)}<span class="ph-sv" title="В «Мои фото»">${ic(IC.check)}</span>
<div class="ph-cap"><span class="ph-au">${E(it.author||short(it.title,40)||'Автор не указан')}</span><span class="ph-px">${it.dw&&it.dh?it.dw+' × '+it.dh:''}</span></div>
<div class="ph-acts"><button data-a="add" class="pri" title="В макет" aria-label="В макет">${ic(IC.plus)}</button><button data-a="bg" title="Сделать фоном" aria-label="Сделать фоном">${ic(IC.layers)}</button><button data-a="pal" title="Палитра из фото" aria-label="Палитра из фото">${ic(IC.pal)}</button><button data-a="save" title="В мои фото" aria-label="В мои фото">${ic(IC.book)}</button></div></div>`; }
function skel(n){ const A=[1.5,.75,1.33,1,1.78,.8,1.25,1.5,.67,1.4,1,1.6,.9,1.33,1.5]; let h=''; for(let i=0;i<n;i++){ const ar=A[i%A.length]; h+=`<div class="ph-t sk" style="flex-grow:${ar*100};flex-basis:calc(${ar} * var(--ph-rh));aspect-ratio:${ar}"></div>`; } return h; }
function heroHTML(){ const s=S(), rec=s.recent.slice(0,6), nk=KEYED.filter(avail).length;
  return `<div class="ph-hero"><div class="ph-hic">${ic(IC.cam)}</div><h3>Фото для любого макета</h3>
   <p>Бесплатные фотобанки прямо в программе. Пишите по-русски — переведём для поиска. Качество для печати видно сразу.</p>
   <div class="ph-hchips">${THEMES.slice(0,14).map(t=>`<button class="ph-chip" data-q="${E(t)}">${E(t)}</button>`).join('')}</div>
   ${rec.length?`<div class="ph-recent"><span>Недавно:</span>${rec.map(t=>`<button class="ph-link" data-q="${E(t)}">${E(short(t,28))}</button>`).join('')}</div>`:''}
   <div class="ph-hsrc"><span>${ic(IC.check)}Openverse и Wikimedia — без регистрации</span><span>${nk?ic(IC.check):ic(IC.key)}Pexels, Unsplash, Pixabay — ${nk?'подключено '+nk+' из 3':'по бесплатному ключу'}</span><span>${ic(IC.pin)}Pinterest — перетащите картинку сюда</span></div></div>`; }
function noneHTML(){ const ks=Object.keys(R.err); if(ks.length&&ks.length===R.srcs.length){ const e=R.err[ks[0]];
    return `<div class="ph-hero ph-fail"><div class="ph-hic bad">${ic(IC.warn)}</div><h3>${e.code==='offline'?'Нет интернета':'Поиск не удался'}</h3><p>${ks.map(k=>`<b>${SRC[k].n}</b> ${E(errText(R.err[k],k))}`).join('<br>')}</p><div class="flexw" style="justify-content:center"><button class="btn primary" data-a="retry">Повторить</button>${ks.some(k=>R.err[k].code==='auth'&&SRC[k].key)?'<button class="btn" data-a="keys">Ключи фотобанков</button>':''}<button class="btn" data-a="mine">Мои фото</button></div></div>`; }
  return `<div class="ph-hero ph-none"><div class="ph-hic soft">${ic(IC.search)}</div><h3>Ничего не нашлось</h3><p>По запросу «${E(R.q)}»${R.en!==R.q?` (${E(R.en)})`:''} фото нет. Попробуйте другое слово${S().src!=='all'?' или все источники':''}${S().orient||S().color?', уберите фильтры':''}.</p>
   <div class="ph-hchips">${S().src!=='all'?'<button class="btn" data-a="all">Искать везде</button>':''}${THEMES.slice(0,8).map(t=>`<button class="ph-chip" data-q="${E(t)}">${E(t)}</button>`).join('')}</div></div>`; }
function creditsHTML(){ return `<div class="ph-credits">Фото предоставлены: ${SKEYS.map(k=>`<a href="${SRC[k].home}" target="_blank" rel="noopener">${SRC[k].full}</a>`).join(' · ')}. Автор и лицензия — в карточке фото.</div>`; }
function paintFoot(){ const sc=SCR.search, foot=q1(sc,'[data-r=foot]'); if(!foot) return; const mr=R&&R.srcs.some(k=>R.more[k]);
  foot.innerHTML=(R&&R.items.length?(mr||R.busy?`<button class="btn ph-more" data-a="more"${R.busy?' disabled':''}>${R.busy?'<span class="ph-spin"></span>Загружаем…':'Показать ещё'}</button>`:`<div class="ph-end">Это всё, что нашлось</div>`):'')+creditsHTML(); }
function paintSearch(){ const sc=SCR.search; if(!sc||!sc.dataset.ph) return; const res=q1(sc,'[data-r=res]');
  q1(sc,'[data-r=sub]').innerHTML=subHTML(); q1(sc,'[data-r=errs]').innerHTML=errsHTML(); paintQual(true);
  if(!R){ res.innerHTML=heroHTML(); paintFoot(); return; }
  if(!R.items.length){ res.innerHTML=R.busy?`<div class="ph-jg">${skel(15)}</div>`:noneHTML(); paintFoot(); return; }
  res.innerHTML=`<div class="ph-jg" data-r="jg">${R.items.map(tileS).join('')}</div>`; paintFoot(); }
function appendSearch(start){ const sc=SCR.search, jg=q1(sc,'[data-r=jg]'); if(!jg) return paintSearch();
  jg.insertAdjacentHTML('beforeend',R.items.slice(start).map((it,k)=>tileS(it,start+k)).join(''));
  q1(sc,'[data-r=sub]').innerHTML=subHTML(); q1(sc,'[data-r=errs]').innerHTML=errsHTML(); paintFoot(); }
let QSIG='';
function paintQual(force){ const sig=tSig(); if(!force&&sig===QSIG) return; QSIG=sig; const T=target();
  const html=`<span>Качество печати: <b>${E(T.label)}</b></span><span class="ph-leg"><i class="ok"></i>300+ <i class="warn"></i>150–300 <i class="bad"></i>&lt;150 dpi</span>`;
  [SCR.search,SCR.mine].forEach(sc=>{ const q=q1(sc,'[data-r=qual]'); if(q) q.innerHTML=html; });
  if(SCR.search&&R) qa(SCR.search,'.ph-t[data-i]').forEach(t=>{ const it=R.items[+t.dataset.i]; if(!it) return; const old=q1(t,'.ph-qb'), nb=qBadge(it.dw,it.dh,T); if(old) old.outerHTML=nb||''; else if(nb) q1(t,'.ph-src').insertAdjacentHTML('afterend',nb); });
  if(SCR.mine&&LIB) qa(SCR.mine,'.ph-lt[data-id]').forEach(t=>{ const m=LIB.find(x=>x.id===t.dataset.id); if(!m) return; const old=q1(t,'.ph-qb'), nb=qBadge(m.w,m.h,T); if(old) old.outerHTML=nb||''; }); }

/* ---------- side panel + screen: «Мои фото» ---------- */
function buildMinePanel(box){ BOX.mine=box; box.classList.add('ph-side');
  box.innerHTML=`
  <div class="card">
    <div class="ph-addrow"><button class="btn primary" data-a="upl">${ic(IC.up)}<span>Добавить фото</span></button><button class="btn" data-a="clip" title="Вставить картинку из буфера">${ic(IC.clip)}<span>Вставить</span></button></div>
    <div class="ks-drop ph-drop" data-a="upl" role="button" tabindex="0">${ic(IC.img)}<b>Перетащите сюда фото</b><small>можно много сразу · ⌘V — вставить</small></div>
    <p class="ph-dst" data-r="dst" hidden></p>
  </div>
  <div class="card"><div class="hd"><span>Альбомы</span><button class="btn sm" data-a="newalb">+ Альбом</button></div>
    <form class="ph-newalb" data-r="newalb" hidden><input type="text" data-r="albname" placeholder="Название альбома" maxlength="40"><button class="btn sm primary" type="submit">Создать</button></form>
    <div class="ph-albs" data-r="albs"></div></div>
  <div class="card"><div class="hd2">Найти и упорядочить</div>
    <div class="ph-sin">${ic(IC.search)}<input type="text" data-r="lq" placeholder="Поиск по названию" value="${E(LQ)}" autocomplete="off"></div>
    <div class="seg ph-seg" data-r="sort">${[['new','Сначала новые'],['old','Старые'],['name','А–Я']].map(([v,n])=>`<button data-sort="${v}"${(S().sort||'new')===v?' class="on"':''}>${n}</button>`).join('')}</div></div>
  <div class="card"><div class="hd2">Хранилище</div>
    <div class="ph-meter"><i data-r="mbar"></i></div><p class="hint" data-r="meter">Считаем…</p>
    <label class="chk"><input type="checkbox" data-r="persist"> Не удалять мои фото</label>
    <p class="hint" data-r="persh">Браузер не сотрёт фото, даже если на диске станет мало места.</p></div>`;
  box.addEventListener('click',e=>{ const b=e.target.closest('[data-a],[data-alb],[data-sort]'); if(!b||!box.contains(b)) return; const s=S();
    if(b.dataset.sort){ s.sort=b.dataset.sort; KS.save(); qa(box,'[data-sort]').forEach(x=>x.classList.toggle('on',x===b)); paintLib(); return; }
    const a=b.dataset.a;
    if(a==='albren'||a==='albdel'){ e.stopPropagation(); return albEdit(a,b.dataset.n); }
    if(b.dataset.alb!=null){ s.album=b.dataset.alb; KS.save(); LSEL.clear(); paintAlbums(); paintLib(); return; }
    if(a==='upl') return pickFiles(s.album||'Разное');
    if(a==='clip') return clipImport(s.album||'Разное');
    if(a==='newalb'){ const f=q1(box,'[data-r=newalb]'); f.hidden=!f.hidden; if(!f.hidden) q1(f,'input').focus(); return; } });
  box.addEventListener('keydown',e=>{ if((e.key==='Enter'||e.key===' ')&&e.target.classList.contains('ph-drop')){ e.preventDefault(); pickFiles(S().album||'Разное'); } });
  box.addEventListener('submit',e=>{ e.preventDefault(); const f=e.target; if(f.dataset.r==='newalb'){ const i=q1(f,'input'), v=short(i.value,40); if(!v) return; const s=S();
      if(!allAlbums().some(a=>nrm(a)===nrm(v))) s.albums.push(v); s.album=allAlbums().find(a=>nrm(a)===nrm(v))||v; KS.save(); i.value=''; f.hidden=true; paintAlbums(); paintLib(); say('Альбом «'+v+'» создан'); }
    if(f.dataset.r==='albrename'){ const i=q1(f,'input'), v=short(i.value,40), old=f.dataset.n; if(v&&v!==old) renameAlbum(old,v); else paintAlbums(); } });
  box.addEventListener('input',e=>{ if(e.target.dataset.r==='lq'){ LQ=e.target.value; paintLib(); } });
  box.addEventListener('change',e=>{ if(e.target.dataset.r==='persist') persist(e.target); });
  bindDrop(q1(box,'.ph-drop'),()=>S().album||'Разное');
  paintAlbums(); paintMeter(); }
function paintAlbums(){ const box=BOX.mine, el=q1(box,'[data-r=albs]'); if(!el) return; const s=S(), L=LIB||[], cnt=a=>L.filter(m=>m.album===a).length;
  const row=(v,n,c,edit)=>`<div class="ph-alb${(s.album||'')===v?' on':''}" data-alb="${E(v)}" role="button" tabindex="0">${ic(IC.folder)}<span class="grow">${E(n)}</span>${edit?`<button class="ph-ai" data-a="albren" data-n="${E(v)}" title="Переименовать" aria-label="Переименовать">${ic(IC.pen)}</button><button class="ph-ai" data-a="albdel" data-n="${E(v)}" title="Удалить альбом" aria-label="Удалить альбом">${ic(IC.trash)}</button>`:''}<em>${c}</em></div>`;
  el.innerHTML=row('','Все фото',L.length,false)+allAlbums().map(a=>row(a,a,cnt(a),!ALB.includes(a))).join(''); }
function albEdit(a,name){ const s=S();
  if(a==='albdel'){ const ids=(LIB||[]).filter(m=>m.album===name).map(m=>m.id); s.albums=s.albums.filter(x=>x!==name); if(s.album===name) s.album=''; KS.save();
    (ids.length?libPatch(ids,{album:'Разное'}):Promise.resolve()).then(()=>{ paintAlbums(); paintLib(); say(ids.length?'Альбом удалён, фото перенесены в «Разное»':'Альбом удалён'); }); return; }
  const row=q1(BOX.mine,`.ph-alb[data-alb="${CSS.escape(name)}"]`); if(!row) return;
  row.outerHTML=`<form class="ph-newalb" data-r="albrename" data-n="${E(name)}"><input type="text" value="${E(name)}" maxlength="40"><button class="btn sm primary" type="submit">OK</button></form>`;
  const i=q1(BOX.mine,'[data-r=albrename] input'); if(i){ i.focus(); i.select(); } }
async function renameAlbum(old,v){ const s=S(); if(ALB.includes(old)) return; const ids=(LIB||[]).filter(m=>m.album===old).map(m=>m.id);
  s.albums=uniq(s.albums.map(x=>x===old?v:x).concat(s.albums.includes(old)?[]:[v])); if(s.album===old) s.album=v; KS.save();
  if(ids.length) await libPatch(ids,{album:v}); paintAlbums(); paintLib(); say('Альбом переименован'); }
let METER_T=0; const meterSoon=()=>{ clearTimeout(METER_T); METER_T=setTimeout(paintMeter,250); };
async function paintMeter(){ const box=BOX.mine; if(!box) return; const el=q1(box,'[data-r=meter]'), bar=q1(box,'[data-r=mbar]'), cb=q1(box,'[data-r=persist]'), ph=q1(box,'[data-r=persh]'); if(!el) return;
  await libLoad(); const mine=(LIB||[]).reduce((a,m)=>a+(m.size||0)*.75+(m.thumb?m.thumb.length*.75:0),0);
  let txt='Мои фото: '+plural((LIB||[]).length,['фото','фото','фото'])+', около '+sizeT(mine), pct=0;
  try{ if(navigator.storage&&navigator.storage.estimate){ const {usage=0,quota=0}=await navigator.storage.estimate(); if(quota){ pct=clamp(usage/quota*100,0,100); txt=`Занято ${sizeT(usage)} из ${sizeT(quota)} · `+txt; } } }catch(_){}
  el.textContent=txt; if(bar){ bar.style.width=Math.max(pct,pct?2:0)+'%'; bar.className=pct>85?'bad':pct>60?'warn':''; }
  try{ if(navigator.storage&&navigator.storage.persisted){ const p=await navigator.storage.persisted(); if(cb){ cb.checked=p; cb.disabled=p; } if(ph) ph.textContent=p?'Включено: браузер не удалит ваши фото сам.':'Браузер не сотрёт фото, даже если на диске станет мало места.'; }
    else if(cb){ cb.disabled=true; if(ph) ph.textContent='Этот браузер не умеет закреплять хранилище.'; } }catch(_){} }
async function persist(cb){ if(!cb.checked) return; if(!navigator.storage||!navigator.storage.persist){ cb.checked=false; note('Этот браузер не умеет закреплять хранилище.','bad'); return; }
  let ok=false; try{ ok=await navigator.storage.persist(); }catch(_){} cb.checked=ok; S().persist=ok; KS.save();
  if(ok) note('Готово: браузер не удалит ваши фото сам.','ok'); else note('Браузер пока не разрешил. На iPad добавьте программу на экран «Домой», на Mac — в закладки, и попробуйте снова.','bad'); paintMeter(); }
function libView(){ const s=S(); let a=(LIB||[]).slice(); if(s.album) a=a.filter(m=>m.album===s.album); const q=nrm(LQ.trim()); if(q) a=a.filter(m=>nrm(m.name).includes(q));
  a.sort(s.sort==='old'?(x,y)=>x.added-y.added:s.sort==='name'?(x,y)=>String(x.name).localeCompare(String(y.name),'ru',{numeric:true}):(x,y)=>y.added-x.added); return a; }
function buildMineScreen(sc){ sc.classList.add('ph-screen');
  sc.innerHTML=`<div class="ph-scr">
    <div class="ph-head"><div class="ph-ht"><div class="ph-h1">${ic(IC.img)}<span>Мои фото</span></div><div class="ph-sub" data-r="lsub"></div></div>
      <div class="ph-hbtns"><button class="btn sm" data-a="selmode">${ic(IC.sel)}<span>Выбрать</span></button><button class="btn sm primary" data-a="upl">${ic(IC.up)}<span>Добавить</span></button></div></div>
    <div class="ph-qual" data-r="qual"></div>
    <div class="ph-note" data-r="note" hidden></div>
    <div class="ph-selbar" data-r="selbar" hidden></div>
    <div class="ph-mix" data-r="mix" hidden></div>
    <div class="ph-res" data-r="lres"></div></div>`;
  sc.addEventListener('load',e=>{ const t=e.target; if(t&&t.tagName==='IMG'){ const x=t.closest('.ph-lt'); if(x) x.classList.add('ld'); } },true);
  sc.addEventListener('error',e=>{ const t=e.target; if(t&&t.tagName==='IMG'){ const x=t.closest('.ph-lt'); if(x) x.classList.add('ld','err'); } },true);
  sc.addEventListener('click',e=>{ const b=e.target.closest('[data-a]'), t=e.target.closest('.ph-lt'), s=S();
    const a=b&&sc.contains(b)?b.dataset.a:'';
    if(t&&(a==='ck'||LSEL.size||LSM||e.metaKey||e.ctrlKey||e.shiftKey)&&!/^(add|bg|pal)$/.test(a)){ e.stopPropagation(); const id=t.dataset.id; LSEL.has(id)?LSEL.delete(id):LSEL.add(id); paintSel(); t.classList.toggle('on',LSEL.has(id)); return; }
    if(t&&/^(add|bg|pal)$/.test(a)){ e.stopPropagation(); const m=LIB.find(x=>x.id===t.dataset.id); if(m) act(a,m,'l',t); return; }
    if(a==='upl') return pickFiles(s.album||'Разное');
    if(a==='gosearch') return KS.show('photo','phsearch');
    if(a==='selmode'){ LSM=!LSM; if(!LSM) LSEL.clear(); paintLib(); return; }
    if(a==='selall'){ libView().forEach(m=>LSEL.add(m.id)); paintLib(); return; }
    if(a==='selnone'){ LSEL.clear(); LSM=false; paintLib(); return; }
    if(a==='mixpal') return mixPalette([...LSEL]);
    if(a==='seldel'){ const ids=[...LSEL]; LSEL.clear(); LSM=false; return libDelete(ids); }
    if(a==='godz') return goDesign();
    if(a==='mixx'){ const m=q1(sc,'[data-r=mix]'); if(m) m.hidden=true; return; }
    if(a==='nx'){ const n=q1(sc,'[data-r=note]'); if(n) n.hidden=true; return; }
    if(a==='clrq'){ LQ=''; const i=q1(BOX.mine,'[data-r=lq]'); if(i) i.value=''; paintLib(); return; }
    if(a==='allalb'){ s.album=''; KS.save(); paintAlbums(); paintLib(); return; }
    if(t){ const V=libView(), i=V.findIndex(m=>m.id===t.dataset.id); if(i>=0) openCard('l',V,i); } });
  sc.addEventListener('change',e=>{ if(e.target.dataset.r==='move'&&e.target.value){ const v=e.target.value, ids=[...LSEL]; LSEL.clear(); LSM=false; libPatch(ids,{album:v}).then(()=>{ say('Перенесено в «'+v+'»: '+plural(ids.length,['фото','фото','фото'])); paintAlbums(); paintLib(); }); } });
  bindDrop(sc,()=>S().album||'Разное','Отпустите — фото добавятся в «Мои фото»'); }
const hasA=m=>/^data:image\/png/.test(m.thumb||'')&&/png|gif|webp|svg/.test(m.type||'');
function tileL(m){ const T=target(), alpha=hasA(m);
  return `<div class="ph-lt${LSEL.has(m.id)?' on':''}" data-id="${E(m.id)}">
   <div class="ph-lim${alpha?' ph-chk':''}">${m.thumb?`<img src="${m.thumb}" alt="${E(m.name)}" draggable="false" decoding="async">`:ic(IC.img)}</div>
   <button class="ph-ck" data-a="ck" aria-label="Выбрать">${ic(IC.check)}</button>${qBadge(m.w,m.h,T)}
   <div class="ph-acts"><button data-a="add" class="pri" title="В макет" aria-label="В макет">${ic(IC.plus)}</button><button data-a="bg" title="Сделать фоном" aria-label="Сделать фоном">${ic(IC.layers)}</button><button data-a="pal" title="Палитра из фото" aria-label="Палитра из фото">${ic(IC.pal)}</button></div>
   <div class="ph-lcap"><b title="${E(m.name)}">${E(m.name)}</b><small>${m.w&&m.h?m.w+' × '+m.h:''}${S().album?'':' · '+E(m.album)}${m.credit&&m.credit.source?' · '+E(m.credit.source):''}</small></div></div>`; }
function paintSel(){ const sc=SCR.mine, bar=q1(sc,'[data-r=selbar]'); if(!bar) return; const n=LSEL.size; sc.classList.toggle('ph-selecting',!!(n||LSM));
  const bm=q1(sc,'[data-a=selmode]'); if(bm) bm.classList.toggle('primary',LSM);
  if(!n&&!LSM){ bar.hidden=true; return; } bar.hidden=false;
  bar.innerHTML=`<b>${n?'Выбрано: '+n:'Нажимайте на фото, чтобы выбрать'}</b><span class="ks-sp"></span>
   ${n?`<button class="btn sm primary" data-a="mixpal" title="До 6 фото → одна палитра для макета">${ic(IC.pal)}<span>Общая палитра</span></button>
   <select data-r="move" aria-label="Перенести в альбом"><option value="">В альбом…</option>${allAlbums().map(a=>`<option>${E(a)}</option>`).join('')}</select>
   <button class="btn sm danger" data-a="seldel">${ic(IC.trash)}<span>Удалить</span></button>`:`<button class="btn sm" data-a="selall">Выбрать все</button>`}
   <button class="btn sm" data-a="selnone">Готово</button>`; }
function paintLib(){ const sc=SCR.mine; if(!sc||!sc.dataset.ph) return; const res=q1(sc,'[data-r=lres]'), sub=q1(sc,'[data-r=lsub]');
  if(!LIB){ res.innerHTML=`<div class="ph-lg">${'<div class="ph-lt sk"><div class="ph-lim"></div><div class="ph-lcap"><b>&nbsp;</b><small>&nbsp;</small></div></div>'.repeat(8)}</div>`; libLoad().then(()=>{ paintLib(); paintAlbums(); paintMeter(); }); return; }
  const s=S(), V=libView(); [...LSEL].forEach(id=>{ if(!LIB.some(m=>m.id===id)) LSEL.delete(id); });
  sub.textContent=(s.album?'Альбом «'+s.album+'» · ':'Все альбомы · ')+plural(V.length,['фото','фото','фото'])+(LQ.trim()?' по запросу «'+LQ.trim()+'»':'');
  paintQual(true); paintSel(); paintAlbums();
  if(!LIB.length){ res.innerHTML=`<div class="ph-hero"><div class="ph-hic">${ic(IC.img)}</div><h3>Здесь будут ваши фото</h3><p>Логотипы клиентов, фоны, снимки для макетов — всё под рукой и работает без интернета.</p>
      <div class="flexw" style="justify-content:center"><button class="btn primary" data-a="upl">${ic(IC.up)}<span>Добавить фото</span></button><button class="btn" data-a="gosearch">${ic(IC.search)}<span>Найти в фотобанках</span></button></div><p class="hint">Можно перетащить сюда много файлов сразу или нажать ⌘V.</p></div>`; return; }
  if(!V.length){ res.innerHTML=`<div class="ph-hero ph-none"><div class="ph-hic soft">${ic(IC.folder)}</div><h3>${LQ.trim()?'Ничего не нашлось':'В альбоме пока пусто'}</h3><p>${LQ.trim()?'Нет фото с названием «'+E(LQ.trim())+'»'+(s.album?' в альбоме «'+E(s.album)+'»':'')+'.':'Перетащите сюда фото — они попадут в альбом «'+E(s.album)+'».'}</p>
      <div class="flexw" style="justify-content:center">${LQ.trim()?'<button class="btn" data-a="clrq">Сбросить поиск</button>':`<button class="btn primary" data-a="upl">${ic(IC.up)}<span>Добавить фото</span></button>`}${s.album?'<button class="btn" data-a="allalb">Все фото</button>':''}</div></div>`; return; }
  res.innerHTML=`<div class="ph-lg">${V.map(tileL).join('')}</div>`; }
async function mixPalette(ids){ const metas=ids.map(id=>LIB.find(m=>m.id===id)).filter(Boolean).slice(0,6); if(!metas.length){ say('Выберите фото'); return; }
  const box=q1(SCR.mine,'[data-r=mix]'); if(box){ box.hidden=false; box.innerHTML='<span class="ph-spin"></span><span>Смешиваем цвета…</span>'; }
  const lists=await Promise.all(metas.map(m=>dzExtract(m.thumb).catch(()=>[])));
  const hex=c=>{ const h=String(c).replace('#',''); return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16)||0); }, far=(a,b)=>{ const A=hex(a),B=hex(b); return Math.hypot(A[0]-B[0],A[1]-B[1],A[2]-B[2])>=38; };
  const out=[]; for(let r=0;r<6&&out.length<6;r++) lists.forEach(l=>{ const c=l[r]; if(c&&out.length<6&&out.every(o=>far(o,c))) out.push(c); });
  if(!out.length){ if(box) box.hidden=true; say('Не получилось взять цвета'); return; }
  KS.ensureDesign(); dzSetPalette(out,'Общая палитра');
  if(box) box.innerHTML=`<span class="ph-sw big">${out.map(c=>`<i style="background:${E(c)}" title="${E(c)}"></i>`).join('')}</span><span><b>Общая палитра</b> из ${plural(metas.length,['фото','фото','фото'])} применена к макету${ids.length>6?' (взяли первые 6)':''}</span><span class="ks-sp"></span><button class="btn sm" data-a="godz">Открыть макет</button><button class="ph-nx" data-a="mixx" aria-label="Скрыть">${ic(IC.x)}</button>`;
  say('Общая палитра применена'); }

/* ---------- design inspector: photo credit ---------- */
KS.insp({id:'phcredit',title:'Автор фото',order:60,when:e=>e&&e.t==='img'&&e.credit&&typeof e.credit==='object'&&!!(e.credit.author||e.credit.source),
  html:e=>{ const c=e.credit, A=(h,t)=>h?`<a href="${E(h)}" target="_blank" rel="noopener">${E(t)}</a>`:E(t);
    return `<div class="ph-insp"><div class="ph-irow">${ic(IC.cam)}<span>Автор фото: <b>${c.author?A(c.authorUrl,c.author):'не указан'}</b></span></div>
      ${c.license?`<div class="ph-irow">${ic(IC.shield)}<span>Лицензия: ${A(c.licUrl,c.license)}</span></div>`:''}
      ${c.source?`<div class="ph-irow">${ic(IC.link)}<span>Источник: ${A(c.url,c.source)}</span></div>`:''}
      <div class="flexw"><button class="btn sm" data-ph="cap">Подпись на макет</button><button class="btn sm" data-ph="copy">Скопировать подпись</button></div></div>`; },
  bind(div,e){ div.addEventListener('click',ev=>{ const b=ev.target.closest('[data-ph]'); if(!b) return; const t=creditText(e.credit);
    if(b.dataset.ph==='copy'){ try{ navigator.clipboard.writeText(t).then(()=>say('Подпись скопирована'),()=>say(t)); }catch(_){ say(t); } return; }
    if(b.dataset.ph==='cap'){ const d=st.dz, sz=Math.max(5,Math.min(8,Math.min(d.w,d.h)/14)), hh=sz*.5; const y=Math.min(e.y+e.h+.8,d.h-hh-1.5), x=Math.max(1.5,Math.min(e.x,d.w-40));
      dzAdd('text',{text:t,x,y,w:Math.max(Math.min(e.w,d.w-x-1.5),Math.min(40,d.w-x-1.5)),h:hh+1,size:sz,align:'left',color:'ink',font:'b'}); say('Подпись добавлена — её можно двигать'); } }); }});

/* ---------- tabs, toolbar, commands ---------- */
const TAB_ICON=ic(IC.cam);
KS.tab({id:'phsearch',group:'photo',groupTitle:'Фото',groupIcon:TAB_ICON,title:'Поиск фото',seg:'Поиск фото',before:'prep',app:'print',screen:true,
  render(box,o){ SCR.search=o.screen; if(BOX.search!==box||!box.dataset.ph){ box.dataset.ph='1'; buildSearchPanel(box); } else if(o.reason==='show') syncSearchPanel(box);
    if(o.screen&&!o.screen.dataset.ph){ o.screen.dataset.ph='1'; buildSearchScreen(o.screen); paintSearch(); }
    if(o.reason==='show'){ paintQual(true); if(!LIB) libLoad().then(()=>{}); } else paintQual(false); }});
KS.tab({id:'phmine',group:'photo',title:'Мои фото',seg:'Мои фото',screen:true,
  render(box,o){ SCR.mine=o.screen; let fresh=false; if(BOX.mine!==box||!box.dataset.ph){ box.dataset.ph='1'; buildMinePanel(box); fresh=true; }
    if(o.screen&&!o.screen.dataset.ph){ o.screen.dataset.ph='1'; buildMineScreen(o.screen); fresh=true; }
    if(o.reason==='show'||fresh){ paintLib(); paintAlbums(); paintMeter(); } else paintQual(false); }});
KS.tool({id:'photos',label:'Фото',app:'print',title:'Найти фото для макета: фотобанки, Pinterest, «Мои фото»',run(){ KS.show('photo','phsearch'); focusQ(); }});
KS.cmd('Найти фото','фото',()=>{ KS.show('photo','phsearch'); focusQ(); });
KS.cmd('Мои фото','фото',()=>KS.show('photo','phmine'));
KS.cmd('Палитра из фото','фото',async()=>{ const e=selImg(); if(e&&e.src&&e.k!=='logo'){ await KS.palette(e.src,'Из фото'); return; }
  const f=await KS.pick('image/*',false); if(!f||!f[0]) return; try{ const d=await KS.readImage(f[0],1600); await KS.palette(d,'Из фото'); }catch(_){ say('Не удалось открыть картинку'); } });
KS.on('select',()=>{ if(activeTab===TID) paintQual(false); });
KS.on('photosChanged',d=>{ if(EMITTING||(d&&d.by==='photos')) return; const ids=d&&(d.ids||(d.id?[d.id]:null));
  const p=ids&&LIB?Promise.all(ids.map(async id=>{ try{ const r=await KS.idb.get('ph:'+id,'files'); const i=LIB.findIndex(m=>m.id===id); if(r){ const m=metaOf(id,r); if(!m.thumb) return libLoad(true); if(i>=0) LIB[i]=m; else LIB.push(m); } else if(i>=0) LIB.splice(i,1); }catch(_){} })).then(libSaveIdx):libLoad(true);
  Promise.resolve(p).then(()=>{ paintLib(); paintAlbums(); paintMeter(); }); });
/* public helpers for other modules */
KS.photos={list:()=>libLoad().then(()=>LIB.slice()),get:id=>KS.idb.get('ph:'+id,'files'),add:o=>libAdd(Object.assign({},o,{defer:false})).then(m=>{ paintLib(); paintAlbums(); meterSoon(); return m; }),translate:q=>tr(q).en,dictSize:()=>DICT.size,open:(sub)=>KS.show('photo',sub==='mine'?'phmine':'phsearch')};
