/* ================= «Блокноты» · notebook module: core (formats, store, i18n, drawing list, SVG) ================= */
KS.mod('notebook',{title:'Блокноты'});
const NB_Y=new Date().getFullYear()+(new Date().getMonth()>=8?1:0);
/* formats: id, name, w, h, hint */
const NB_FMTS=[['A4','A4',210,297],['A5','A5',148,210],['A6','A6',105,148],['A7','A7',74,105],['B5','B5',176,250],['B6','B6',125,176],
  ['tetrad','Тетрадь',170,205],['letter','Letter',216,279],['halfletter','Half Letter',140,216],['mole','Moleskine L',130,210],['pocket','Pocket',90,140],
  ['tn','Traveler’s',110,210],['pass','Паспорт',89,124],['sq140','Квадрат',140,140],['sq210','Квадрат',210,210],['10x15','10 × 15',100,150],['custom','Свой',0,0]];
const NB_BIND=[['spiral','Пружина','Пластиковая или металлическая спираль'],['wireo','Wire-O','Двойная проволочная пружина'],['staple','Скоба','Брошюра на скрепке, лист сгибается пополам'],
  ['perfect','Клей (КБС)','Блок на клею, мягкая обложка'],['sewn','Шитьё','Тетради прошиваются нитью'],['rings','Кольца','Дырокол на 2 или 4 отверстия'],['disc','Диски','Грибовидная перфорация'],['none','Без переплёта','Просто стопка листов']];
const NB_SET_KEYS=['fmt','land','cw','ch','w','h','pages','padded','paperId','paperGsm','binding','sides','title','owner','year','start','lang','font','st','secs','hov','pr','name'];
const nbSecDef=(type,n,p,x)=>Object.assign({id:'s'+Math.random().toString(36).slice(2,9),type,n:n||1,p:p||{},ht:'',alt:'',ap:{}},x||{});
const NB_DEF={fmt:'A5',land:false,cw:150,ch:200,w:148,h:210,pages:0,padded:0,paperId:'p80',paperGsm:80,binding:'staple',sides:2,
  title:'Мой блокнот',owner:'',year:NB_Y,start:NB_Y+'-01',lang:'ru',font:'golos',name:'',
  st:{c:'#8da2bb',lw:.2,op:90,margin:false,mc:'#e08a8a',mside:'outer',mdist:20,hdr:false,hdrDate:true,hdrText:'',pn:'outer',pnStart:1,pnTitle:false,
      mirror:true,gutter:12,mt:10,mb:12,mo:8,logo:false,perf:'none',holes:true,holes4:false},
  secs:[nbSecDef('title',1),nbSecDef('dots',47)], hov:{},
  pr:{imp:'auto',sheet:'A4',order:'stack',marks:true,creep:'auto',creepMM:0,sig:4,range:'',rev:false,flip:'long',nums:true,gap:0,nup:0,qty:1,what:'sheets'},
  cost:{bind:{spiral:{c:150,p:600},wireo:{c:200,p:800},staple:{c:10,p:150},perfect:{c:150,p:900},sewn:{c:250,p:1500},rings:{c:300,p:900},disc:{c:400,p:1200},none:{c:0,p:0}},
    cover:{c:120,p:400},ink:{l:{c:1,p:15},m:{c:3,p:35},h:{c:8,p:80}},labor:0},
  my:[],projs:[],cur:'',ui:{sel:'',zoom:0,view:'spread',psheet:0,cat:''}};
const nbS=()=>{ const s=KS.store('notebook',NB_DEF); if(!s.st||typeof s.st!=='object') s.st={}; for(const k in NB_DEF.st) if(!(k in s.st)) s.st[k]=NB_DEF.st[k];
  if(!s.pr||typeof s.pr!=='object') s.pr={}; for(const k in NB_DEF.pr) if(!(k in s.pr)) s.pr[k]=NB_DEF.pr[k];
  if(!s.ui||typeof s.ui!=='object') s.ui={}; for(const k in NB_DEF.ui) if(!(k in s.ui)) s.ui[k]=NB_DEF.ui[k];
  if(!s.cost||typeof s.cost!=='object') s.cost=JSON.parse(JSON.stringify(NB_DEF.cost)); ['bind','cover','ink'].forEach(k=>{ if(!s.cost[k]) s.cost[k]=JSON.parse(JSON.stringify(NB_DEF.cost[k])); });
  for(const b in NB_DEF.cost.bind) if(!s.cost.bind[b]) s.cost.bind[b]=Object.assign({},NB_DEF.cost.bind[b]);
  if(!Array.isArray(s.secs)) s.secs=[]; if(!s.hov||typeof s.hov!=='object') s.hov={}; if(!Array.isArray(s.my)) s.my=[]; if(!Array.isArray(s.projs)) s.projs=[];
  return s; };
const nbClone=o=>JSON.parse(JSON.stringify(o));
/* page size from format + orientation */
function nbSize(S){ const f=NB_FMTS.find(x=>x[0]===S.fmt)||NB_FMTS[1]; let w=f[0]==='custom'?+S.cw||150:f[2], h=f[0]==='custom'?+S.ch||200:f[3];
  w=Math.max(40,Math.min(420,w)); h=Math.max(40,Math.min(420,h)); if(S.land!==(w>h)&&w!==h) [w,h]=[h,w]; return {w,h}; }
const nbFmtName=S=>{ const f=NB_FMTS.find(x=>x[0]===S.fmt)||NB_FMTS[1]; const {w,h}=nbSize(S); return (f[0]==='custom'?'Свой формат':f[1])+' · '+nbMM(w)+' × '+nbMM(h)+' мм'; };
const nbMM=v=>String(Math.round(v*10)/10).replace('.',',');

/* ---------- colours ---------- */
const nbRGB=h=>{ h=String(h||'').trim(); if(/^#[0-9a-f]{3}$/i.test(h)) h='#'+h[1]+h[1]+h[2]+h[2]+h[3]+h[3]; if(!/^#[0-9a-f]{6}$/i.test(h)) h='#888888'; return [1,3,5].map(i=>parseInt(h.substr(i,2),16)); };
const nbMix=(a,b,t)=>{ const A=nbRGB(a),B=nbRGB(b); return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join(''); };
const NB_COLS=[['#8da2bb','Серо-голубой'],['#9aa0a6','Серый'],['#6d7480','Графит'],['#7fa7d9','Голубой'],['#86b49a','Мятный'],['#d3a07a','Песочный'],['#d79aa8','Пудровый'],['#a99ad6','Лавандовый'],['#2f3640','Чёрный']];
const NB_FONTS={golos:["'Golos Text','Noto Sans Armenian',sans-serif",'Golos'],serif:["'PT Serif','Noto Serif Armenian',serif",'PT Serif'],mont:["'Montserrat','Noto Sans Armenian',sans-serif",'Montserrat'],hand:["'Caveat','Noto Sans Armenian',cursive",'Caveat']};

/* ---------- languages for printed pages ---------- */
const NB_L={
 ru:{m:['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],mg:['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'],
   wd:['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье'],ws:['Пн','Вт','Ср','Чт','Пт','Сб','Вс'],w1:['П','В','С','Ч','П','С','В'],m1:['Я','Ф','М','А','М','И','И','А','С','О','Н','Д']},
 hy:{m:['Հունվար','Փետրվար','Մարտ','Ապրիլ','Մայիս','Հունիս','Հուլիս','Օգոստոս','Սեպտեմբեր','Հոկտեմբեր','Նոյեմբեր','Դեկտեմբեր'],mg:['հունվարի','փետրվարի','մարտի','ապրիլի','մայիսի','հունիսի','հուլիսի','օգոստոսի','սեպտեմբերի','հոկտեմբերի','նոյեմբերի','դեկտեմբերի'],
   wd:['Երկուշաբթի','Երեքշաբթի','Չորեքշաբթի','Հինգշաբթի','Ուրբաթ','Շաբաթ','Կիրակի'],ws:['Երկ','Երք','Չրք','Հնգ','Ուրբ','Շբթ','Կիր'],w1:['Եկ','Եք','Չ','Հ','Ու','Շ','Կ'],m1:['Հն','Փտ','Մր','Ապ','Մյ','Հն','Հլ','Օգ','Սպ','Հկ','Նյ','Դկ']},
 en:{m:['January','February','March','April','May','June','July','August','September','October','November','December'],mg:null,
   wd:['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],ws:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],w1:['M','T','W','T','F','S','S'],m1:['J','F','M','A','M','J','J','A','S','O','N','D']}};
const NB_W={date:['Дата','Ամսաթիվ','Date'],notes:['Заметки','Նշումներ','Notes'],tasks:['Задачи','Առաջադրանքներ','Tasks'],prio:['Главное','Գլխավորը','Top priorities'],sched:['Расписание','Ժամանակացույց','Schedule'],
 week:['Неделя','Շաբաթ','Week'],goals:['Цели','Նպատակներ','Goals'],habits:['Трекер привычек','Սովորությունների հետքեր','Habit tracker'],habit:['Привычка','Սովորություն','Habit'],water:['Вода','Ջուր','Water'],mood:['Настроение','Տրամադրություն','Mood'],
 breakfast:['Завтрак','Նախաճաշ','Breakfast'],lunch:['Обед','Ճաշ','Lunch'],dinner:['Ужин','Ընթրիք','Dinner'],snack:['Перекус','Խորտիկ','Snack'],shop:['Покупки','Գնումներ','Shopping list'],meal:['Меню на неделю','Շաբաթվա ճաշացանկ','Meal plan'],
 income:['Доходы','Եկամուտներ','Income'],expenses:['Расходы','Ծախսեր','Expenses'],budget:['Бюджет','Բյուջե','Budget'],source:['Источник','Աղբյուր','Source'],sum:['Сумма','Գումար','Amount'],cat:['Категория','Կատեգորիա','Category'],
 desc:['Описание','Նկարագրություն','Description'],total:['Итого','Ընդամենը','Total'],balance:['Остаток','Մնացորդ','Balance'],savings:['Накопления','Խնայողություններ','Savings'],ledger:['Кассовая книга','Դրամարկղային գիրք','Cash book'],
 in:['Приход','Մուտք','In'],out:['Расход','Ելք','Out'],op:['Содержание операции','Գործառնության բովանդակություն','Description'],reading:['Прочитанные книги','Ընթերցված գրքեր','Reading log'],book:['Название','Անվանում','Title'],
 author:['Автор','Հեղինակ','Author'],start:['Начало','Սկիզբ','Started'],end:['Конец','Ավարտ','Finished'],rating:['Оценка','Գնահատական','Rating'],recipe:['Рецепт','Բաղադրատոմս','Recipe'],serv:['Порции','Բաժին','Servings'],
 time:['Время','Ժամանակ','Time'],level:['Сложность','Բարդություն','Difficulty'],ingr:['Ингредиенты','Բաղադրիչներ','Ingredients'],steps:['Приготовление','Պատրաստում','Method'],contacts:['Контакты','Կոնտակտներ','Contacts'],
 name:['Имя','Անուն','Name'],phone:['Телефон','Հեռախոս','Phone'],email:['Email','Էլ. փոստ','Email'],addr:['Адрес','Հասցե','Address'],bday:['День рождения','Ծննդյան օր','Birthday'],passwords:['Пароли','Գաղտնաբառեր','Passwords'],
 site:['Сайт','Կայք','Website'],login:['Логин','Մուտքանուն','Login'],pass:['Пароль','Գաղտնաբառ','Password'],hint:['Подсказка','Հուշում','Hint'],belongs:['Этот блокнот принадлежит','Այս տետրը պատկանում է','This notebook belongs to'],
 ifound:['Если нашли, пожалуйста, верните:','Եթե գտել եք, խնդրում ենք վերադարձնել՝','If found, please return to:'],started:['Начат','Սկսված է','Started'],finished:['Окончен','Ավարտված է','Finished'],contents:['Содержание','Բովանդակություն','Contents'],
 topic:['Тема','Թեմա','Topic'],page:['Стр.','Էջ','Page'],todo:['Список дел','Անելիքներ','To-do list'],storyboard:['Раскадровка','Սցենարային տախտակ','Storyboard'],project:['Проект','Նախագիծ','Project'],scene:['Сцена','Տեսարան','Scene'],
 cue:['Вопросы и ключевые слова','Հարցեր, բանալի բառեր','Cues'],summary:['Итоги','Ամփոփում','Summary'],links:['Связи','Կապեր','Links'],tags:['Теги','Պիտակներ','Tags'],mindmap:['Карта мыслей','Մտքերի քարտեզ','Mind map'],
 gantt:['План проекта','Նախագծի պլան','Project plan'],task:['Задача','Առաջադրանք','Task'],who:['Кто','Ով','Who'],status:['Статус','Կարգավիճակ','Status'],goal:['Цель','Նպատակ','Goal'],why:['Почему это важно','Ինչու է դա կարևոր','Why it matters'],
 deadline:['Срок','Ժամկետ','Deadline'],obst:['Препятствия','Խոչընդոտներ','Obstacles'],reward:['Награда','Պարգև','Reward'],progress:['Прогресс','Առաջընթաց','Progress'],grat:['Я благодарен(а) за','Շնորհակալ եմ','I am grateful for'],
 best:['Лучший момент дня','Օրվա լավագույն պահը','Best moment of the day'],affirm:['Аффирмация','Հաստատում','Affirmation'],pixels:['Год в пикселях','Տարին պիքսելներով','Year in pixels'],workout:['Тренировка','Մարզում','Workout'],
 exercise:['Упражнение','Վարժություն','Exercise'],sets:['Подходы','Մոտեցում','Sets'],reps:['Повторы','Կրկնություն','Reps'],weight:['Вес','Քաշ','Weight'],cardio:['Кардио','Կարդիո','Cardio'],dur:['Длительность','Տևողություն','Duration'],
 measure:['Замеры','Չափումներ','Measurements'],param:['Параметр','Պարամետր','Measurement'],chest:['Грудь','Կրծքավանդակ','Chest'],waist:['Талия','Գոտկատեղ','Waist'],hips:['Бёдра','Ազդրեր','Hips'],thigh:['Бедро','Ազդր','Thigh'],
 arm:['Рука','Ձեռք','Arm'],neck:['Шея','Պարանոց','Neck'],fat:['% жира','Ճարպ, %','Body fat, %'],pulse:['Пульс','Զարկերակ','Resting pulse'],trip:['Поездка','Ուղևորություն','Trip'],transport:['Транспорт','Տրանսպորտ','Transport'],
 stay:['Жильё','Կացարան','Stay'],day:['День','Օր','Day'],place:['Место','Վայր','Place'],plan:['План','Պլան','Plan'],packing:['Что взять с собой','Ինչ վերցնել','Packing list'],clothes:['Одежда','Հագուստ','Clothes'],
 docs:['Документы','Փաստաթղթեր','Documents'],hyg:['Гигиена','Հիգիենա','Toiletries'],tech:['Техника','Տեխնիկա','Electronics'],med:['Аптечка','Դեղատուփ','First aid'],misc:['Разное','Այլ','Other'],wedding:['Свадьба','Հարսանիք','Wedding'],
 vendor:['Подрядчик','Կապալառու','Vendor'],item:['Статья','Հոդված','Item'],planned:['План','Պլան','Planned'],actual:['Факт','Փաստ','Actual'],paid:['Оплачено','Վճարված','Paid'],guests:['Гости','Հյուրեր','Guests'],qty:['Кол-во','Քանակ','Qty'],
 table:['Стол','Սեղան','Table'],rsvp:['Ответ','Պատասխան','RSVP'],m12:['За 12 месяцев','12 ամիս առաջ','12 months before'],m6:['За 6 месяцев','6 ամիս առաջ','6 months before'],m3:['За 3 месяца','3 ամիս առաջ','3 months before'],
 m1:['За месяц','1 ամիս առաջ','1 month before'],w1:['За неделю','1 շաբաթ առաջ','1 week before'],wday:['День свадьбы','Հարսանիքի օրը','Wedding day'],wbudget:['Бюджет свадьбы','Հարսանիքի բյուջե','Wedding budget'],wplan:['Подготовка к свадьбе','Հարսանիքի նախապատրաստում','Wedding checklist'],
 baby:['Дневник малыша','Մանկան օրագիր','Baby log'],feed:['Кормление','Կերակրում','Feeding'],sleep:['Сон','Քուն','Sleep'],diaper:['Подгузник','Տակդիր','Diaper'],garden:['Огород','Այգի','Garden'],gplan:['План участка','Հողամասի հատակագիծ','Garden plan'],
 crop:['Культура','Մշակաբույս','Crop'],variety:['Сорт','Սորտ','Variety'],sow:['Посев','Ցանք','Sown'],transplant:['Высадка','Տնկում','Planted'],harvest:['Урожай','Բերք','Harvest'],attend:['Журнал посещаемости','Հաճախումների մատյան','Attendance register'],
 group:['Группа','Խումբ','Group'],month:['Месяц','Ամիս','Month'],fio:['Фамилия, имя','Ազգանուն, անուն','Name'],timetable:['Расписание уроков','Դասացուցակ','Timetable'],lesson:['Урок','Դաս','Lesson'],
 hw:['Домашнее задание','Տնային աշխատանք','Homework'],grade:['Оценка','Գնահատական','Grade'],sign:['Подпись','Ստորագրություն','Signature'],parents:['Подпись родителей','Ծնողի ստորագրություն','Parent’s signature'],remarks:['Замечания','Դիտողություններ','Remarks'],
 lab:['Лабораторный журнал','Լաբորատոր մատյան','Lab notebook'],exp:['Эксперимент','Փորձ','Experiment'],aim:['Цель','Նպատակ','Aim'],by:['Выполнил','Կատարեց','Recorded by'],witness:['Проверил','Ստուգեց','Witnessed by'],
 monthplan:['Планы на месяц','Ամսվա պլաններ','Monthly log'],legend:['Обозначения','Նշաններ','Legend'],great:['Отлично','Գերազանց','Great'],good:['Хорошо','Լավ','Good'],okay:['Нормально','Նորմալ','Okay'],bad:['Плохо','Վատ','Bad'],awful:['Ужасно','Սարսափելի','Awful'],
 gratj:['Дневник благодарности','Երախտագիտության օրագիր','Gratitude journal'],ideas:['Идеи','Գաղափարներ','Ideas'],subject:['Предмет','Առարկա','Subject'],hours:['Часы','Ժամեր','Hours'],kids:['Прописи','Գրագրություն','Handwriting'],
 fitness:['Фитнес-замеры','Ֆիթնես չափումներ','Fitness tracker'],flight:['Рейс','Չվերթ','Flight'],dates:['Даты','Ամսաթվեր','Dates'],sumw:['Итог недели','Շաբաթվա արդյունքը','Week review'],free:['Свободно','Ազատ','Free'],
 owner:['Владелец','Սեփականատեր','Owner'],no:['№','№','No.'],call:['Позвонить','Զանգել','Calls'],todoW:['Дела на неделю','Շաբաթվա գործերը','This week'],cups:['стаканов','բաժակ','glasses'],kcal:['ккал','կկալ','kcal']};
const nbLi=lang=>lang==='hy'?1:lang==='en'?2:0;
/* dates (local) */
const nbYM=s=>{ const m=String(s||'').match(/^(\d{4})-(\d{1,2})/); return m?{y:+m[1],m:Math.max(0,Math.min(11,+m[2]-1))}:{y:NB_Y,m:0}; };
const nbDIM=(y,m)=>new Date(y,m+1,0).getDate();
const nbDow=d=>(d.getDay()+6)%7; /* Monday = 0 */
const nbAdd=(d,n)=>new Date(d.getFullYear(),d.getMonth(),d.getDate()+n);
const nbMon=d=>nbAdd(d,-nbDow(d));
const nbWeekNo=d=>{ const t=new Date(d.getFullYear(),d.getMonth(),d.getDate()+3-nbDow(d)); const y1=new Date(t.getFullYear(),0,4); return 1+Math.round(((t-y1)/864e5-3+nbDow(y1))/7); };

/* ---------- drawing list: everything in mm on a page ---------- */
/* item types: l line, r rect, c circle, t text, p polyline, pat (dots/grid), i nested svg, g group */
function nbDraw(X){ const L=[]; const C=X||{};
  const D={L,
    l(x1,y1,x2,y2,o){ o=o||{}; L.push({t:'l',x1,y1,x2,y2,w:o.w!=null?o.w:C.lw,c:o.c||C.c,d:o.d,cap:o.cap}); },
    r(x,y,w,h,o){ o=o||{}; L.push({t:'r',x,y,w,h,s:o.s===false?null:(o.s||(o.f?null:C.c)),f:o.f||null,sw:o.w!=null?o.w:C.lw,rr:o.rr||0,d:o.d}); },
    c(x,y,r,o){ o=o||{}; L.push({t:'c',x,y,r,s:o.s===false?null:(o.s||(o.f?null:C.c)),f:o.f||null,w:o.w!=null?o.w:C.lw,d:o.d}); },
    t(x,y,s,o){ o=o||{}; if(s==null||s==='') return; L.push({t:'t',x,y,s:String(s),z:o.z||3,c:o.c||C.ink||'#333',a:o.a||'s',b:o.b?1:0,i:o.i?1:0,f:o.f||C.ff||NB_FONTS.golos[0],ls:o.ls||0}); },
    p(pts,o){ o=o||{}; L.push({t:'p',pts,s:o.s===false?null:(o.s||C.c),f:o.f||null,w:o.w!=null?o.w:C.lw,z:o.close?1:0,d:o.d}); },
    pat(kind,o){ L.push(Object.assign({t:'pat',k:kind,c:C.c,w:C.lw},o)); },
    img(x,y,w,h,svg){ L.push({t:'i',x,y,w,h,svg}); } };
  return D; }
const nbN=v=>Math.round(v*1000)/1000;
const nbE=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
let nbPid=0;
const nbDash=d=>d?` stroke-dasharray="${d.map(nbN).join(' ')}"`:'';
/* list -> svg markup; defs collected into D.defs (array) */
function nbSVGBody(L,defs){ let o='';
  for(const e of L){ switch(e.t){
    case 'l': o+=`<line x1="${nbN(e.x1)}" y1="${nbN(e.y1)}" x2="${nbN(e.x2)}" y2="${nbN(e.y2)}" stroke="${e.c}" stroke-width="${nbN(e.w)}"${nbDash(e.d)}${e.cap?` stroke-linecap="${e.cap}"`:''}/>`; break;
    case 'r': o+=`<rect x="${nbN(e.x)}" y="${nbN(e.y)}" width="${nbN(Math.max(0,e.w))}" height="${nbN(Math.max(0,e.h))}"${e.rr?` rx="${nbN(e.rr)}"`:''} fill="${e.f||'none'}"${e.s?` stroke="${e.s}" stroke-width="${nbN(e.sw)}"`:''}${nbDash(e.d)}/>`; break;
    case 'c': o+=`<circle cx="${nbN(e.x)}" cy="${nbN(e.y)}" r="${nbN(e.r)}" fill="${e.f||'none'}"${e.s?` stroke="${e.s}" stroke-width="${nbN(e.w)}"`:''}${nbDash(e.d)}/>`; break;
    case 't': o+=`<text x="${nbN(e.x)}" y="${nbN(e.y)}" font-family="${e.f.replace(/"/g,"'")}" font-size="${nbN(e.z)}"${e.b?' font-weight="700"':''}${e.i?' font-style="italic"':''}${e.ls?` letter-spacing="${nbN(e.ls)}"`:''} fill="${e.c}"${e.a!=='s'?` text-anchor="${e.a==='m'?'middle':'end'}"`:''}>${nbE(e.s)}</text>`; break;
    case 'p': o+=`<${e.z?'polygon':'polyline'} points="${e.pts.map(nbN).join(' ')}" fill="${e.f||'none'}"${e.s?` stroke="${e.s}" stroke-width="${nbN(e.w)}" stroke-linejoin="round"`:''}${nbDash(e.d)}/>`; break;
    case 'pat': { const id='nbp'+(++nbPid), sx=e.sx, sy=e.sy||e.sx;
      if(e.k==='dots'){ defs.push(`<pattern id="${id}" patternUnits="userSpaceOnUse" x="${nbN(e.x-sx/2)}" y="${nbN(e.y-sy/2)}" width="${nbN(sx)}" height="${nbN(sy)}"><circle cx="${nbN(sx/2)}" cy="${nbN(sy/2)}" r="${nbN(e.r)}" fill="${e.c}"/></pattern>`);
        o+=`<rect x="${nbN(e.x-sx/2)}" y="${nbN(e.y-sy/2)}" width="${nbN(e.nx*sx)}" height="${nbN(e.ny*sy)}" fill="url(#${id})"/>`; }
      else { const hw=e.w/2; defs.push(`<pattern id="${id}" patternUnits="userSpaceOnUse" x="${nbN(e.x-sx/2)}" y="${nbN(e.y-sy/2)}" width="${nbN(sx)}" height="${nbN(sy)}">${e.nov?'':`<line x1="${nbN(sx/2)}" y1="0" x2="${nbN(sx/2)}" y2="${nbN(sy)}" stroke="${e.c}" stroke-width="${nbN(e.w)}"${nbDash(e.d)}/>`}${e.noh?'':`<line x1="0" y1="${nbN(sy/2)}" x2="${nbN(sx)}" y2="${nbN(sy/2)}" stroke="${e.c}" stroke-width="${nbN(e.w)}"${nbDash(e.d)}/>`}</pattern>`);
        o+=`<rect x="${nbN(e.x-hw)}" y="${nbN(e.y-hw)}" width="${nbN(e.nx*sx+e.w)}" height="${nbN(e.ny*sy+e.w)}" fill="url(#${id})"/>`; } break; }
    case 'i': o+=String(e.svg).replace(/<svg\b([^>]*)>/,(m,a)=>`<svg x="${nbN(e.x)}" y="${nbN(e.y)}" width="${nbN(e.w)}" height="${nbN(e.h)}"${(a.match(/\sviewBox="[^"]*"/)||[''])[0]} preserveAspectRatio="xMidYMid meet" overflow="visible">`); break;
    case 'g': { let inner=nbSVGBody(e.L,defs); if(e.dx) inner=`<g transform="translate(${nbN(e.dx)} 0)">${inner}</g>`;
      if(e.clip){ const id='nbc'+(++nbPid); defs.push(`<clipPath id="${id}"><rect x="0" y="0" width="${nbN(e.clip.w)}" height="${nbN(e.clip.h)}"/></clipPath>`); inner=`<g clip-path="url(#${id})">${inner}</g>`; }
      o+=`<g transform="matrix(${e.m.map(nbN).join(' ')})">${inner}</g>`; break; }
  } }
  return o; }
function nbSVG(L,W,H,attrs){ const defs=[]; const b=nbSVGBody(L,defs); return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${nbN(W)} ${nbN(H)}" ${attrs||`width="${nbN(W)}mm" height="${nbN(H)}mm"`}><rect width="${nbN(W)}" height="${nbN(H)}" fill="#fff"/>${defs.length?'<defs>'+defs.join('')+'</defs>':''}${b}</svg>`; }
/* text width estimate in mm (canvas measure, cached) */
const nbTWc={}; let nbCv=null;
function nbTW(s,z,b,ff){ const k=(b?1:0)+'|'+(ff||'')+'|'+s; let w=nbTWc[k]; if(w==null){ try{ nbCv=nbCv||document.createElement('canvas').getContext('2d'); nbCv.font=`${b?700:400} 100px ${ff||NB_FONTS.golos[0]}`; w=nbCv.measureText(s).width/100; }catch(_){ w=String(s).length*.55; } nbTWc[k]=w; } return w*z; }
/* line clipping (Liang–Barsky) to a box */
function nbClipLine(x1,y1,x2,y2,b){ let t0=0,t1=1; const dx=x2-x1, dy=y2-y1; const P=[-dx,dx,-dy,dy], Q=[x1-b.x,b.x+b.w-x1,y1-b.y,b.y+b.h-y1];
  for(let i=0;i<4;i++){ if(P[i]===0){ if(Q[i]<0) return null; } else { const r=Q[i]/P[i]; if(P[i]<0){ if(r>t1) return null; if(r>t0) t0=r; } else { if(r<t0) return null; if(r<t1) t1=r; } } }
  return [x1+t0*dx,y1+t0*dy,x1+t1*dx,y1+t1*dy]; }
/* affine matrices [a,b,c,d,e,f]: x'=a x+c y+e, y'=b x+d y+f */
const nbMul=(A,B)=>[A[0]*B[0]+A[2]*B[1],A[1]*B[0]+A[3]*B[1],A[0]*B[2]+A[2]*B[3],A[1]*B[2]+A[3]*B[3],A[0]*B[4]+A[2]*B[5]+A[4],A[1]*B[4]+A[3]*B[5]+A[5]];
const nbTr=(x,y)=>[1,0,0,1,x,y];
const nbAp=(M,x,y)=>[M[0]*x+M[2]*y+M[4],M[1]*x+M[3]*y+M[5]];

/* ================= page types: each one is a vector generator in mm ================= */
const NB_T={}; const NB_CATS=[['base','Основа'],['study','Учёба и письмо'],['plan','Планеры и календари'],['life','Жизнь и учёт'],['work','Работа и проекты'],['svc','Служебные']];
const nbT=(id,o)=>{ NB_T[id]=Object.assign({id,ink:'m',par:[]},o); };
const NP={n:(k,n,d,min,max,step,u)=>({k,n,t:'n',d,min,max,step:step||1,u:u||''}),s:(k,n,d,o)=>({k,n,t:'s',d,o}),c:(k,n,d)=>({k,n,t:'c',d:!!d}),x:(k,n,d)=>({k,n,t:'x',d:d||''}),
  q:(o)=>({t:'q',o}),m:(k,n)=>({k:k||'from',n:n||'С месяца',t:'m',d:''}),col:(k,n,d)=>({k,n,t:'col',d:d||''})};
const NP_FULL=NP.c('full','Во всю страницу (до 5 мм от края)',false);
function nbParams(T,p){ const o={}; (T.par||[]).forEach(d=>{ if(!d.k) return; let v=p&&p[d.k]; if(v===undefined||v===null||(d.t==='n'&&!isFinite(+v))) v=d.d; if(d.t==='n') v=Math.max(d.min,Math.min(d.max,+v)); if(d.t==='c') v=!!v; o[d.k]=v; }); return o; }
const nbW=(X,k)=>{ const r=NB_W[k]; return r?(r[X.li]||r[0]):k; };
const nbWS=(lang,k)=>{ const r=NB_W[k]; return r?(r[nbLi(lang)]||r[0]):k; };
/* ---- helpers ---- */
function nbTitle(D,X,txt,sub,y){ y=y==null?X.y:y; const z=X.z(4.4); D.t(X.x,y+z*.92,txt,{z,b:1}); if(sub) D.t(X.x+X.w,y+z*.92,sub,{z:X.z(2.6),a:'e',c:X.mut}); const ly=y+z*1.45; D.l(X.x,ly,X.x+X.w,ly,{c:X.cs,w:X.lw*1.5}); return ly+X.z(3.2); }
function nbLab(D,X,x,y,s,o){ D.t(x,y,String(s).toUpperCase(),Object.assign({z:X.z(2.1),c:X.mut,b:1,ls:X.z(.18)},o||{})); }
function nbField(D,X,x,y,w,label,o){ o=o||{}; const z=o.z||X.z(2.5); D.t(x,y,label,{z,c:X.mut}); const tw=nbTW(label,z,0,X.ff)+X.z(1.5); D.l(x+tw,y+X.z(.6),x+w,y+X.z(.6),{c:X.c}); }
function nbLines(D,X,x,y,w,y1,s,o){ o=o||{}; let n=0; for(let yy=y+s;yy<=y1+.01;yy+=s){ D.l(x,yy,x+w,yy,o); n++; } return n; }
function nbCB(D,X,x,y,s){ D.r(x,y,s,s,{s:X.cs,rr:s*.2,w:X.lw*1.2}); }
function nbStar(D,X,cx,cy,r){ const pts=[]; for(let i=0;i<10;i++){ const a=-Math.PI/2+i*Math.PI/5, rr=i%2?r*.45:r; pts.push(cx+rr*Math.cos(a),cy+rr*Math.sin(a)); } D.p(pts,{close:1,s:X.cs,w:X.lw}); }
function nbEll(D,X,cx,cy,rx,ry,o){ const pts=[]; for(let i=0;i<48;i++){ const a=i/48*Math.PI*2; pts.push(cx+rx*Math.cos(a),cy+ry*Math.sin(a)); } D.p(pts,Object.assign({close:1},o||{})); }
function nbBoxT(D,X,x,y,w,h,label,o){ o=o||{}; D.r(x,y,w,h,{s:X.cs,rr:X.z(1.6),w:X.lw*1.2}); if(label) nbLab(D,X,x+X.z(2.2),y+X.z(4.2),label); return y+X.z(6.5); }
/* table: cols [[label, weight]] → {xs, y0, rh, rows} */
function nbTable(D,X,x,y,w,h,cols,o){ o=o||{}; const hh=o.hh!=null?o.hh:X.z(7); const tw=cols.reduce((s,c)=>s+c[1],0); const xs=[x]; cols.forEach(c=>xs.push(xs[xs.length-1]+w*c[1]/tw));
  let rows=o.rows, rh=o.rh; if(!rows){ rh=rh||X.z(7.5); rows=Math.max(1,Math.floor((h-hh)/rh+1e-6)); } else rh=(h-hh)/rows;
  const yb=y+hh+rows*rh;
  if(hh>0){ D.r(x,y,w,hh,{f:X.fill,s:false}); cols.forEach((c,i)=>{ if(!c[0]) return; const cw=xs[i+1]-xs[i]; let z=X.z(2.2); const tw2=nbTW(String(c[0]).toUpperCase(),z,1,X.ff)+z*.18*String(c[0]).length; if(tw2>cw*.9) z*=cw*.9/tw2;
      D.t((xs[i]+xs[i+1])/2,y+hh/2+z*.36,String(c[0]).toUpperCase(),{z,a:'m',c:X.mut,b:1,ls:z*.08}); }); D.l(x,y,x+w,y,{c:X.cs,w:X.lw*1.3}); }
  if(o.zebra) for(let r=1;r<rows;r+=2) D.r(x,y+hh+r*rh,w,rh,{f:X.zeb,s:false});
  for(let r=0;r<=rows;r++){ const yy=y+hh+r*rh; D.l(x,yy,x+w,yy,{c:r===0||r===rows?X.cs:X.c,w:r===0||r===rows?X.lw*1.3:X.lw}); }
  xs.forEach((xx,i)=>D.l(xx,y,xx,yb,{c:i===0||i===xs.length-1?X.cs:X.c,w:i===0||i===xs.length-1?X.lw*1.3:X.lw}));
  return {xs,y0:y+hh,rh,rows,yb}; }
/* fit a grid with step s into a box: whole cells, centred */
function nbFit(b,sx,sy){ sy=sy||sx; const nx=Math.max(1,Math.floor(b.w/sx+1e-6)), ny=Math.max(1,Math.floor(b.h/sy+1e-6)); return {nx,ny,x:b.x+(b.w-nx*sx)/2,y:b.y+(b.h-ny*sy)/2,w:nx*sx,h:ny*sy}; }
const nbArea=(X,p)=>p&&p.full?X.sb:X;
function nbGrid(D,X,g,s,o){ o=o||{}; D.pat('grid',{x:g.x,y:g.y,sx:s,sy:o.sy||s,nx:g.nx,ny:g.ny,c:o.c||X.c,w:o.w||X.lw,d:o.d}); X.grid={ox:g.x,s,y0:g.y,y1:g.y+g.h}; }
function nbDots(D,X,b,s,r,o){ o=o||{}; const nx=Math.floor(b.w/s+1e-6)+1, ny=Math.floor(b.h/s+1e-6)+1; const x=b.x+(b.w-(nx-1)*s)/2, y=b.y+(b.h-(ny-1)*s)/2;
  D.pat('dots',{x,y,sx:s,sy:s,nx,ny,r,c:o.c||X.dot}); X.grid={ox:x,s,y0:y,y1:y+(ny-1)*s}; return {x,y,nx,ny}; }
/* dates */
const nbMonthAt=(X,i)=>{ const b=nbYM(X.p.from||X.S.start); const t=b.m+i; return {y:b.y+Math.floor(t/12),m:((t%12)+12)%12}; };
const nbDayAt=(X,i)=>{ const b=nbYM(X.p.from||X.S.start); return new Date(b.y,b.m,1+i); };
const nbWeekAt=(X,i)=>{ const b=nbYM(X.p.from||X.S.start); return nbAdd(nbMon(new Date(b.y,b.m,1)),7*i); };
const nbDTxt=(X,d,y)=>{ const L=X.lang; return X.li===2?`${L.m[d.getMonth()]} ${d.getDate()}${y?', '+d.getFullYear():''}`:`${d.getDate()} ${(L.mg||L.m)[d.getMonth()]}${y?' '+d.getFullYear():''}`; };
const nbRange=(X,a,b)=>{ const L=X.lang, M=L.mg||L.m; if(a.getFullYear()!==b.getFullYear()) return X.li===2?`${L.m[a.getMonth()].slice(0,3)} ${a.getDate()}, ${a.getFullYear()} – ${L.m[b.getMonth()].slice(0,3)} ${b.getDate()}, ${b.getFullYear()}`:`${a.getDate()} ${M[a.getMonth()]} ${a.getFullYear()} – ${b.getDate()} ${M[b.getMonth()]} ${b.getFullYear()}`; if(X.li===2) return a.getMonth()===b.getMonth()?`${L.m[a.getMonth()]} ${a.getDate()}–${b.getDate()}, ${b.getFullYear()}`:`${L.m[a.getMonth()].slice(0,3)} ${a.getDate()} – ${L.m[b.getMonth()].slice(0,3)} ${b.getDate()}, ${b.getFullYear()}`;
  return a.getMonth()===b.getMonth()?`${a.getDate()}–${b.getDate()} ${M[b.getMonth()]} ${b.getFullYear()}`:`${a.getDate()} ${M[a.getMonth()]} – ${b.getDate()} ${M[b.getMonth()]} ${b.getFullYear()}`; };
const NP_LINEQ=NP.q([['Узкая 6 мм',{s:6}],['College 7,1',{s:7.1}],['Широкая 8 мм',{s:8}],['Школьная 8 + поля',{s:8,m:true}]]);

/* ---------------- ОСНОВА ---------------- */
nbT('blank',{n:'Чистый лист',cat:'base',ink:'l',hint:'Без линовки — для скетчей и рисунков',draw(){}});
nbT('lined',{n:'Линейка',cat:'base',ink:'l',ml:1,hint:'Узкая, широкая, школьная — шаг от 4 до 14 мм',par:[NP_LINEQ,NP.n('s','Шаг линий',7,4,14,.1,'мм'),NP.c('m','Линия полей',false),NP.c('hd','Строка заголовка',false),NP_FULL],
  draw(D,X){ const p=X.p, b=nbArea(X,p); let y=b.y; if(p.hd){ y+=p.s*1.4; D.l(b.x,y,b.x+b.w,y,{c:X.cs,w:X.lw*1.4}); } nbLines(D,X,b.x,y,b.w,b.y+b.h,p.s); X.ay0=b.y; }});
nbT('grid',{n:'Клетка',cat:'base',ink:'m',ml:1,hint:'4, 5, 7 мм или своя, жирные линии через N клеток',par:[NP.q([['4 мм',{s:4}],['5 мм',{s:5}],['7 мм',{s:7}],['1/4 дюйма',{s:6.35}]]),NP.n('s','Размер клетки',5,2,15,.05,'мм'),NP.n('k','Жирная каждая N-я линия',0,0,10,1),NP.c('d','Пунктир',false),NP.c('m','Линия полей',false),NP_FULL],
  draw(D,X){ const p=X.p, g=nbFit(nbArea(X,p),p.s); nbGrid(D,X,g,p.s,{d:p.d?[p.s/10,p.s/10]:null});
    if(p.k>1){ for(let i=0;i<=g.nx;i+=p.k) D.l(g.x+i*p.s,g.y,g.x+i*p.s,g.y+g.h,{c:X.cs,w:X.lw*1.6}); for(let j=0;j<=g.ny;j+=p.k) D.l(g.x,g.y+j*p.s,g.x+g.w,g.y+j*p.s,{c:X.cs,w:X.lw*1.6}); } }});
nbT('school',{n:'Школьная клетка 5 мм',cat:'base',ink:'m',hint:'Как в тетради: клетка во весь лист и красные поля снаружи',par:[NP.n('s','Клетка',5,4,6,.5,'мм'),NP.c('m','Поля',true),NP.n('mc','Поля, клеток от края',4,2,8,1)],
  draw(D,X){ const p=X.p, g=nbFit(X.sb,p.s); nbGrid(D,X,g,p.s); if(p.m){ const x=X.v?g.x+p.mc*p.s:g.x+g.w-p.mc*p.s; D.l(x,g.y,x,g.y+g.h,{c:X.mc,w:Math.max(.25,X.lw*1.3)}); } }});
nbT('dots',{n:'Точки',cat:'base',ink:'l',ml:1,hint:'Dot grid — для буллет-джорнала',par:[NP.q([['5 мм',{s:5}],['4 мм',{s:4}],['7 мм',{s:7}]]),NP.n('s','Шаг',5,3,12,.5,'мм'),NP.n('r','Размер точки',.45,.15,1,.05,'мм'),NP_FULL],
  draw(D,X){ nbDots(D,X,nbArea(X,X.p),X.p.s,X.p.r/2); }});
nbT('dotlines',{n:'Точки + линейка',cat:'base',ink:'l',ml:1,hint:'Точечная сетка, каждая N-я строка — линия',par:[NP.n('s','Шаг',5,3,10,.5,'мм'),NP.n('k','Линия каждые N строк',2,1,6,1),NP.n('r','Размер точки',.4,.15,.8,.05,'мм'),NP_FULL],
  draw(D,X){ const p=X.p, d=nbDots(D,X,nbArea(X,p),p.s,p.r/2); for(let j=p.k;j<d.ny;j+=p.k){ const y=d.y+j*p.s; D.l(d.x,y,d.x+(d.nx-1)*p.s,y,{c:X.c}); } }});
nbT('mixed',{n:'Линейка + точки',cat:'base',ink:'l',hint:'Половина страницы в линию, половина в точку',par:[NP.n('r','Доля линейки',50,20,80,5,'%'),NP.s('top','Сверху',"lines",[['lines','Линейка'],['dots','Точки']]),NP.s('dir','Деление',"h",[['h','Поперёк'],['v','Вдоль']]),NP.n('s','Шаг линий',7,5,10,.5,'мм'),NP.n('d','Шаг точек',5,3,8,.5,'мм')],
  draw(D,X){ const p=X.p, r=p.r/100, g=X.z(4); let A,B; if(p.dir==='v'){ const w1=(X.w-g)*r; A={x:X.x,y:X.y,w:w1,h:X.h}; B={x:X.x+w1+g,y:X.y,w:X.w-w1-g,h:X.h}; } else { const h1=(X.h-g)*r; A={x:X.x,y:X.y,w:X.w,h:h1}; B={x:X.x,y:X.y+h1+g,w:X.w,h:X.h-h1-g}; }
    if(p.top==='dots'){ const t=A; A=B; B=t; } nbLines(D,X,A.x,A.y,A.w,A.y+A.h,p.s); nbDots(D,X,{x:B.x,y:B.y+X.z(1),w:B.w,h:B.h-X.z(1)},p.d,.2); }});
nbT('iso',{n:'Изометрия',cat:'base',ink:'m',hint:'Треугольная сетка для 3D-эскизов',par:[NP.n('s','Сторона треугольника',5,3,12,.5,'мм'),NP.s('v','Вид','lines',[['lines','Линии'],['dots','Точки']])],
  draw(D,X){ const a=X.p.s, d=a*Math.sqrt(3)/2, b=X, cx=b.x+b.w/2, cy=b.y+b.h/2, R=Math.hypot(b.w,b.h);
    if(X.p.v==='dots'){ for(let i=-Math.ceil(b.w/2/d);i<=Math.ceil(b.w/2/d);i++){ const x=cx+i*d; if(x<b.x-1e-6||x>b.x+b.w+1e-6) continue; for(let j=-Math.ceil(b.h/a)-1;j<=Math.ceil(b.h/a)+1;j++){ const y=cy+j*a+(i%2?a/2:0); if(y>=b.y-1e-6&&y<=b.y+b.h+1e-6) D.c(x,y,.25,{f:X.dot}); } } return; }
    const fam=(ux,uy,px,py,sp)=>{ const n=Math.ceil(R/sp)+1; for(let k=-n;k<=n;k++){ const ox=cx+px*k*sp, oy=cy+py*k*sp; const L=nbClipLine(ox-ux*R,oy-uy*R,ox+ux*R,oy+uy*R,b); if(L) D.l(L[0],L[1],L[2],L[3]); } };
    fam(0,1,1,0,d); fam(Math.cos(Math.PI/6),Math.sin(Math.PI/6),-Math.sin(Math.PI/6),Math.cos(Math.PI/6),d); fam(Math.cos(Math.PI/6),-Math.sin(Math.PI/6),Math.sin(Math.PI/6),Math.cos(Math.PI/6),d); }});
nbT('hex',{n:'Соты',cat:'base',ink:'m',hint:'Шестиугольная сетка — химия, игры, дизайн',par:[NP.n('s','Сторона',6,3,15,.5,'мм'),NP.s('o','Ориентация','p',[['p','Остриём вверх'],['f','Плоской стороной']])],
  draw(D,X){ const r=X.p.s, b=X, pointy=X.p.o==='p'; const hw=Math.sqrt(3)*r; const dx=pointy?hw:1.5*r, dy=pointy?1.5*r:hw;
    const nx=Math.ceil(b.w/dx)+2, ny=Math.ceil(b.h/dy)+2; const corner=(cx,cy,i)=>{ const a=(pointy?30:0)+60*i; return [cx+r*Math.cos(a*Math.PI/180),cy+r*Math.sin(a*Math.PI/180)]; };
    for(let j=-1;j<ny;j++) for(let i=-1;i<nx;i++){ const cx=b.x+i*dx+(pointy&&(j&1)?hw/2:0), cy=b.y+j*dy+(!pointy&&(i&1)?hw/2:0);
      for(const e of [0,1,2]){ const A=corner(cx,cy,e+ (pointy?3:3)), B=corner(cx,cy,e+(pointy?4:4)); const L=nbClipLine(A[0],A[1],B[0],B[1],b); if(L) D.l(L[0],L[1],L[2],L[3]); } } }});
nbT('graph',{n:'Миллиметровка',cat:'base',ink:'h',hint:'1 / 5 / 10 мм: тонкие, средние и жирные линии',par:[NP.col('col','Цвет сетки','#e0915a'),NP.c('full','Во всю страницу (до 5 мм от края)',false)],
  draw(D,X){ const col=X.p.col||X.c0, b=nbArea(X,X.p); const g=nbFit(b,10); const c1=nbMix('#ffffff',col,.38*X.op), c2=nbMix('#ffffff',col,.7*X.op), c3=nbMix('#ffffff',col,X.op);
    const G=n=>({x:g.x,y:g.y,nx:g.nx*10/n,ny:g.ny*10/n,w:g.w,h:g.h});
    nbGrid(D,X,G(1),1,{c:c1,w:.08}); nbGrid(D,X,G(5),5,{c:c2,w:.15}); nbGrid(D,X,G(10),10,{c:c3,w:.3}); D.r(g.x,g.y,g.w,g.h,{s:c3,w:.35}); }});
nbT('music',{n:'Нотный стан',cat:'base',ink:'l',hint:'Нотные станы или гитарная табулатура',par:[NP.s('k','Вид','5',[['5','Ноты, 5 линеек'],['6','Табулатура, 6 струн']]),NP.n('g','Между линейками',2,1.4,3.5,.1,'мм'),NP.n('sg','Между станами',11,5,25,.5,'мм')],
  draw(D,X){ const n=+X.p.k, g=X.p.g, sh=(n-1)*g, step=sh+X.p.sg; const cnt=Math.max(1,Math.floor((X.h+X.p.sg)/step)); let y=X.y+(X.h-(cnt*step-X.p.sg))/2;
    for(let s=0;s<cnt;s++){ for(let i=0;i<n;i++) D.l(X.x,y+i*g,X.x+X.w,y+i*g,{c:X.cs,w:X.lw*1.1}); D.l(X.x,y,X.x,y+sh,{c:X.cs,w:X.lw*1.6}); D.l(X.x+X.w,y,X.x+X.w,y+sh,{c:X.cs,w:X.lw*1.6});
      if(n===6) ['T','A','B'].forEach((ch,i)=>D.t(X.x+X.z(2.2),y+sh/2+(i-1)*g*1.5+g*.5,ch,{z:g*1.25,b:1,a:'m',c:X.mut})); y+=step; } }});
/* ---------------- УЧЁБА ---------------- */
nbT('cornell',{n:'Конспект Корнелл',cat:'study',ink:'l',hint:'Поле вопросов, конспект и итоги внизу',par:[NP.n('cw','Ширина поля вопросов',30,20,40,1,'%'),NP.n('sh','Высота итогов',20,10,35,1,'%'),NP.n('s','Шаг линий',7,5,10,.5,'мм')],
  draw(D,X){ const p=X.p; let y=X.y; nbField(D,X,X.x,y+X.z(3.4),X.w*.62,nbW(X,'topic')); nbField(D,X,X.x+X.w*.66,y+X.z(3.4),X.w*.34,nbW(X,'date')); y+=X.z(7);
    const sh=X.h*p.sh/100, ys=X.y+X.h-sh, cx=X.x+X.w*p.cw/100; D.l(X.x,y,X.x+X.w,y,{c:X.cs,w:X.lw*1.6}); D.l(cx,y,cx,ys,{c:X.cs,w:X.lw*1.6}); D.l(X.x,ys,X.x+X.w,ys,{c:X.cs,w:X.lw*1.6});
    nbLab(D,X,X.x,y+X.z(4.2),nbW(X,'cue')); nbLines(D,X,cx+X.z(2),y+X.z(2),X.x+X.w-cx-X.z(2),ys-X.z(1),p.s); nbLab(D,X,X.x,ys+X.z(4.4),nbW(X,'summary')); nbLines(D,X,X.x,ys+X.z(5.5),X.w,X.y+X.h,p.s); }});
nbT('calli',{n:'Каллиграфия',cat:'study',ink:'m',hint:'Строки по высоте строчной буквы и наклонные линии',par:[NP.q([['Курсив 55°',{ang:55,xh:5}],['Копперплейт 55°',{ang:55,xh:4,a:3,d:3}],['Готика 90°',{ang:90,xh:7,a:1,d:1}],['Brush 60°',{ang:60,xh:8,a:1.2,d:1.2}]]),NP.n('xh','Высота строчной (x)',5,2,15,.5,'мм'),NP.n('a','Выносные вверх, × x',1.5,.5,4,.1),NP.n('d','Выносные вниз, × x',1.5,.5,4,.1),NP.n('gap','Между строками',4,0,15,.5,'мм'),NP.n('ang','Угол наклона',55,40,90,1,'°'),NP.n('sl','Шаг наклонных',8,0,30,1,'мм')],
  draw(D,X){ const p=X.p, bh=p.xh*(1+p.a+p.d), cl=nbMix('#ffffff',X.c0,.5*X.op); let y=X.y; const t=Math.tan(p.ang*Math.PI/180);
    while(y+bh<=X.y+X.h+.01){ const ya=y, yx=y+p.xh*p.a, yb=yx+p.xh, yd=y+bh; D.l(X.x,ya,X.x+X.w,ya,{c:X.c}); D.l(X.x,yx,X.x+X.w,yx,{c:X.c,d:[1,.8]}); D.l(X.x,yb,X.x+X.w,yb,{c:X.cs,w:X.lw*1.6}); D.l(X.x,yd,X.x+X.w,yd,{c:X.c});
      if(p.sl>0&&p.ang<89.5){ const off=bh/t, bx={x:X.x,y:ya,w:X.w,h:bh}; for(let x=X.x-off;x<=X.x+X.w;x+=p.sl){ const L=nbClipLine(x,yd,x+off,ya,bx); if(L) D.l(L[0],L[1],L[2],L[3],{c:cl,w:X.lw*.8}); } }
      else if(p.sl>0){ for(let x=X.x;x<=X.x+X.w+.01;x+=p.sl) D.l(x,ya,x,yd,{c:cl,w:X.lw*.8}); }
      y+=bh+p.gap; } }});
nbT('propisi',{n:'Прописи (3 линии)',cat:'study',ink:'m',hint:'Для детей: верхняя, средняя пунктирная и нижняя линии, образец для обводки',par:[NP.n('h','Высота строки',12,6,24,.5,'мм'),NP.n('gap','Между строками',8,3,20,.5,'мм'),NP.x('tx','Образец','Аа Бб Вв'),NP.c('tr','Повторить образец бледно для обводки',true),NP.c('sl','Наклонные линии',false)],
  draw(D,X){ const p=X.p; let y=X.y+X.z(1), r=0; const fz=p.h/0.72, light=nbMix('#ffffff',X.ink,.22), mid=nbMix('#ffffff',X.ink,.6), t=Math.tan(65*Math.PI/180);
    while(y+p.h<=X.y+X.h+.01){ const ym=y+p.h*.5, yb=y+p.h; D.l(X.x,y,X.x+X.w,y,{c:X.c}); D.l(X.x,ym,X.x+X.w,ym,{c:X.c,d:[1.2,1]}); D.l(X.x,yb,X.x+X.w,yb,{c:X.cs,w:X.lw*1.5});
      if(p.sl){ const bx={x:X.x,y,w:X.w,h:p.h}, off=p.h/t; for(let x=X.x-off;x<=X.x+X.w;x+=p.h*.8){ const L=nbClipLine(x,yb,x+off,y,bx); if(L) D.l(L[0],L[1],L[2],L[3],{c:nbMix('#ffffff',X.c0,.4*X.op),w:X.lw*.7}); } }
      if(p.tx){ const font="'Marck Script','Caveat',cursive"; const tw=nbTW(p.tx+'   ',fz,0,font); if(r===0) D.t(X.x+X.z(1),yb-p.h*.04,p.tx,{z:fz,c:mid,f:font});
        if(p.tr&&tw>0){ for(let x=X.x+X.z(1)+(r===0?tw:0);x+nbTW(p.tx,fz,0,font)<=X.x+X.w;x+=tw) D.t(x,yb-p.h*.04,p.tx,{z:fz,c:light,f:font}); } }
      y+=p.h+p.gap; r++; } }});
nbT('kosaya',{n:'Косая линейка (1 класс)',cat:'study',ink:'m',hint:'Рабочая строка 4 мм, дополнительная линия и наклонные под 65°',par:[NP.n('wh','Рабочая строка',4,3,6,.5,'мм'),NP.n('gap','Межстрочный интервал',11,6,16,.5,'мм'),NP.c('hl','Дополнительная линия',true),NP.n('ang','Наклон',65,55,75,1,'°'),NP.n('st','Шаг наклонных',20,8,30,1,'мм'),NP.c('m','Поля',true)],
  draw(D,X){ const p=X.p, b=X.sb, t=Math.tan(p.ang*Math.PI/180); const step=p.wh+p.gap; let y=b.y+p.wh+X.z(2); const y0=y-p.wh; let yl=y;
    while(y+p.wh<=b.y+b.h-.5){ if(p.hl) D.l(b.x,y-p.wh,b.x+b.w,y-p.wh,{c:X.c,w:X.lw*.8}); D.l(b.x,y,b.x+b.w,y,{c:X.cs,w:X.lw*1.3}); D.l(b.x,y+p.wh,b.x+b.w,y+p.wh,{c:X.cs,w:X.lw*1.3}); yl=y+p.wh; y+=step; }
    const bx={x:b.x,y:y0,w:b.w,h:yl-y0}, off=bx.h/t, cl=nbMix('#ffffff',X.c0,.55*X.op); for(let x=b.x-off;x<=b.x+b.w;x+=p.st){ const L=nbClipLine(x,yl,x+off,y0,bx); if(L) D.l(L[0],L[1],L[2],L[3],{c:cl,w:X.lw*.8}); }
    if(p.m){ const x=X.v?b.x+20:b.x+b.w-20; D.l(x,b.y,x,b.y+b.h,{c:X.mc,w:Math.max(.25,X.lw*1.3)}); } }});
nbT('mizige',{n:'Иероглифы 米字格',cat:'study',ink:'m',hint:'Клетки с крестом и диагоналями, по желанию — полоса для пиньиня',par:[NP.n('s','Клетка',16,8,30,1,'мм'),NP.s('k','Разметка','mi',[['mi','米 крест + диагонали'],['tian','田 крест'],['jiu','九宫格 3×3'],['none','Без разметки']]),NP.c('py','Полоса для пиньиня',false)],
  draw(D,X){ const p=X.p, s=p.s, ph=p.py?s*.5:0, gap=p.py?X.z(1.5):0, rowH=s+ph+gap; const nx=Math.floor(X.w/s), ny=Math.max(1,Math.floor((X.h+gap)/rowH)); const x0=X.x+(X.w-nx*s)/2; let y=X.y+(X.h-(ny*rowH-gap))/2; const lt=nbMix('#ffffff',X.c0,.55*X.op);
    for(let r=0;r<ny;r++){ if(ph){ for(let i=0;i<4;i++) D.l(x0,y+i*ph/3,x0+nx*s,y+i*ph/3,{c:i===0||i===3?X.c:lt,w:X.lw*(i===0||i===3?1:.8),d:i===0||i===3?null:[.8,.8]}); y+=ph; }
      for(let i=0;i<nx;i++){ const x=x0+i*s; if(p.k==='mi'||p.k==='tian'){ D.l(x+s/2,y,x+s/2,y+s,{c:lt,d:[.8,.8]}); D.l(x,y+s/2,x+s,y+s/2,{c:lt,d:[.8,.8]}); } if(p.k==='mi'){ D.l(x,y,x+s,y+s,{c:lt,d:[.8,.8]}); D.l(x+s,y,x,y+s,{c:lt,d:[.8,.8]}); }
        if(p.k==='jiu'){ [1,2].forEach(k=>{ D.l(x+k*s/3,y,x+k*s/3,y+s,{c:lt,d:[.8,.8]}); D.l(x,y+k*s/3,x+s,y+k*s/3,{c:lt,d:[.8,.8]}); }); } }
      for(let i=0;i<=nx;i++) D.l(x0+i*s,y,x0+i*s,y+s,{c:X.cs}); D.l(x0,y,x0+nx*s,y,{c:X.cs}); D.l(x0,y+s,x0+nx*s,y+s,{c:X.cs}); y+=s+gap; } }});
nbT('genko',{n:'Гэнко ёси 原稿用紙',cat:'study',ink:'m',hint:'Японская рукописная бумага: 20 × 20 клеток, вертикальное письмо',par:[NP.n('rows','Клеток в столбце',20,10,25,1),NP.n('cols','Столбцов',20,10,24,2)],
  draw(D,X){ const R=X.p.rows, C=X.p.cols, g=.32, half=C/2; const s=Math.min(X.h/R,X.w/(C+(C-2)*g+1.6)); const cg=s*1.6, colW=s*(1+g); const tw=C*s+(C-2)*g*s+cg; let x=X.x+(X.w-tw)/2; const y=X.y+(X.h-R*s)/2;
    for(let h=0;h<2;h++){ const hx=x; for(let c=0;c<half;c++){ const cx=x+c*colW; for(let r=0;r<=R;r++) D.l(cx,y+r*s,cx+s,y+r*s,{c:X.c}); D.l(cx,y,cx,y+R*s,{c:X.c}); D.l(cx+s,y,cx+s,y+R*s,{c:X.c}); }
      const hw=half*s+(half-1)*g*s; D.r(hx-g*s*.3,y-g*s*.3,hw+g*s*.6,R*s+g*s*.6,{s:X.cs,w:X.lw*1.6}); x+=hw+cg; if(h===0){ const mx=hx+hw+cg/2, tri=(yy,dir)=>D.p([mx-cg*.28,yy,mx+cg*.28,yy,mx,yy+dir*cg*.3],{close:1,f:X.cs,s:false}); tri(y+R*s*.22,1); tri(y+R*s*.78,-1); } } }});
/* ---------------- ПЛАНЕРЫ ---------------- */
nbT('daily',{n:'Ежедневник (день)',cat:'plan',ink:'m',date:'d',hdr:false,hint:'Страница на каждый день с реальными датами',par:[NP.m(),NP.n('h0','Расписание с',8,0,12,1,'ч'),NP.n('h1','до',21,13,24,1,'ч'),NP.c('half','Получасовые линии',true),NP.c('water','Вода и настроение',true)],
  draw(D,X){ const p=X.p, d=nbDayAt(X,X.i), L=X.lang; const big=X.z(11); D.t(X.x,X.y+big*.8,String(d.getDate()),{z:big,b:1}); const tx=X.x+nbTW(String(d.getDate()),big,1,X.ff)+X.z(3);
    D.t(tx,X.y+X.z(4),L.wd[nbDow(d)],{z:X.z(3.6),b:1}); D.t(tx,X.y+X.z(8.2),`${L.m[d.getMonth()]} ${d.getFullYear()}`,{z:X.z(2.8),c:X.mut}); D.t(X.x+X.w,X.y+X.z(8.2),nbW(X,'week')+' '+nbWeekNo(d),{z:X.z(2.4),a:'e',c:X.mut});
    let y=X.y+big+X.z(1.5); D.l(X.x,y,X.x+X.w,y,{c:X.cs,w:X.lw*1.5}); y+=X.z(2.5); const bot=X.y+X.h-(p.water?X.z(9):0), lw=X.w*.44, rx=X.x+lw+X.z(4), rw=X.w-lw-X.z(4);
    nbLab(D,X,X.x,y+X.z(2.6),nbW(X,'sched')); const hy=y+X.z(4.5), n=p.h1-p.h0+1, rh=(bot-hy)/n; for(let i=0;i<n;i++){ const yy=hy+i*rh; D.t(X.x,yy+Math.min(rh*.62,X.z(3.2)),String(p.h0+i).padStart(2,'0'),{z:Math.min(X.z(2.6),rh*.6),c:X.mut,b:1}); D.l(X.x+X.z(6),yy+rh,X.x+lw,yy+rh,{c:X.c}); if(p.half&&rh>4) D.l(X.x+X.z(6),yy+rh/2,X.x+lw,yy+rh/2,{c:X.c,d:[.6,.8],w:X.lw*.8}); }
    D.l(X.x+X.z(6),hy,X.x+lw,hy,{c:X.c});
    let ry=y; nbLab(D,X,rx,ry+X.z(2.6),nbW(X,'prio')); ry+=X.z(4.5); const r3=X.z(7.5); for(let i=0;i<3;i++){ D.c(rx+X.z(2.2),ry+r3*i+r3*.55,X.z(2.1),{s:X.cs}); D.t(rx+X.z(2.2),ry+r3*i+r3*.55+X.z(.9),String(i+1),{z:X.z(2.4),a:'m',b:1,c:X.mut}); D.l(rx+X.z(5.5),ry+r3*(i+1),rx+rw,ry+r3*(i+1),{c:X.c}); }
    ry+=r3*3+X.z(3.5); nbLab(D,X,rx,ry+X.z(2.6),nbW(X,'tasks')); ry+=X.z(4); const tr=X.z(7), nt=Math.max(3,Math.min(9,Math.floor((bot-ry)*.55/tr))); for(let i=0;i<nt;i++){ nbCB(D,X,rx,ry+i*tr+tr-X.z(4.6),X.z(3.4)); D.l(rx+X.z(5.5),ry+(i+1)*tr,rx+rw,ry+(i+1)*tr,{c:X.c}); }
    ry+=nt*tr+X.z(3.5); nbLab(D,X,rx,ry+X.z(2.6),nbW(X,'notes')); nbDots(D,X,{x:rx,y:ry+X.z(5),w:rw,h:bot-ry-X.z(5)},X.z(5),.15);
    if(p.water){ const wy=X.y+X.h-X.z(3.2); nbLab(D,X,X.x,wy+X.z(.8),nbW(X,'water')); const wx=X.x+nbTW(nbW(X,'water').toUpperCase(),X.z(2.1),1,X.ff)+X.z(3); for(let i=0;i<8;i++) D.p(nbDrop(wx+i*X.z(5),wy-X.z(2.6),X.z(1.9)),{close:1,s:X.cs});
      const mx=X.x+X.w-5*X.z(6); nbLab(D,X,mx-X.z(2),wy+X.z(.8),nbW(X,'mood'),{a:'e'}); for(let i=0;i<5;i++) nbFace(D,X,mx+i*X.z(6)+X.z(2.2),wy-X.z(.6),X.z(2.1),1-i*.5); } }});
function nbDrop(x,y,r){ const pts=[x,y-r*1.2]; for(let i=0;i<=12;i++){ const a=Math.PI*(-.15+1.3*i/12); pts.push(x+r*.75*Math.cos(a),y+r*.45+r*.75*Math.sin(a)); } return pts; }
function nbFace(D,X,cx,cy,r,smile){ D.c(cx,cy,r,{s:X.cs,w:X.lw}); D.c(cx-r*.35,cy-r*.25,r*.08,{f:X.cs}); D.c(cx+r*.35,cy-r*.25,r*.08,{f:X.cs}); const pts=[]; for(let i=0;i<=8;i++){ const t=i/8, x=cx-r*.45+r*.9*t; pts.push(x,cy+r*.35+smile*r*.28*(1-Math.pow(2*t-1,2))-smile*r*.1); } D.p(pts,{s:X.cs,w:X.lw}); }
function nbDayCol(D,X,x,y,w,h,d,o){ o=o||{}; const L=X.lang, wk=nbDow(d)>=5; D.t(x+X.z(.3),y+X.z(5),String(d.getDate()),{z:X.z(5.2),b:1,c:wk?X.wk:X.ink}); D.t(x+X.z(.5)+nbTW(String(d.getDate()),X.z(5.2),1,X.ff)+X.z(1.6),y+X.z(4.8),(o.short?L.ws:L.wd)[nbDow(d)],{z:X.z(2.5),b:1,c:X.mut});
  D.l(x,y+X.z(7),x+w,y+X.z(7),{c:X.cs,w:X.lw*1.4}); nbLines(D,X,x,y+X.z(7),w,y+h,X.z(6.5)); }
nbT('weekly',{n:'Неделя',cat:'plan',ink:'m',date:'w',hdr:false,hint:'Вертикально или горизонтально, на странице или на развороте',par:[NP.m(),NP.s('lay','Раскладка','h',[['h','Горизонтальная'],['v','Вертикальная']]),NP.c('sp','На развороте (2 стр. на неделю)',false)],
  spread:p=>p.sp,
  draw(D,X){ const p=X.p, wi=p.sp?Math.floor(X.i/2):X.i, half=p.sp?(X.i%2):-1, mon=nbWeekAt(X,wi), sun=nbAdd(mon,6); let y=X.y;
    if(half!==1){ y=nbTitle(D,X,nbW(X,'week')+' '+nbWeekNo(mon),nbRange(X,mon,sun)); } else { D.t(X.x+X.w,y+X.z(3.5),nbRange(X,mon,sun),{z:X.z(2.6),a:'e',c:X.mut}); y+=X.z(6.5); }
    const bot=X.y+X.h, H=bot-y; const days=half===-1?[0,1,2,3,4,5,6,'n']:half===0?[0,1,2,'t']:[3,4,5,6];
    const cell=(k,x,yy,w,h)=>{ if(k==='n'||k==='t'){ const t=k==='n'?nbW(X,'notes'):nbW(X,'todoW'); nbLab(D,X,x,yy+X.z(4.6),t); D.l(x,yy+X.z(7),x+w,yy+X.z(7),{c:X.cs,w:X.lw*1.4}); if(k==='t'){ const rr=X.z(6.5); for(let yy2=yy+X.z(7);yy2+rr<=yy+h+.01;yy2+=rr){ nbCB(D,X,x,yy2+rr-X.z(4.3),X.z(3.2)); D.l(x+X.z(5),yy2+rr,x+w,yy2+rr,{c:X.c}); } } else nbDots(D,X,{x,y:yy+X.z(10),w,h:h-X.z(11)},X.z(5),.15); return; }
      nbDayCol(D,X,x,yy,w,h,nbAdd(mon,k),{short:w<X.z(40)}); };
    if(p.lay==='h'){ const n=days.length, g=X.z(3), rh=(H-g*(n-1))/n; days.forEach((k,i)=>cell(k,X.x,y+i*(rh+g),X.w,rh)); }
    else { const rowsN=half===-1?2:1, perRow=half===-1?4:4, g=X.z(3), rh=(H-g*(rowsN-1))/rowsN, cw=(X.w-g*(perRow-1))/perRow; days.forEach((k,i)=>{ const r=Math.floor(i/perRow), c=i%perRow; cell(k,X.x+c*(cw+g),y+r*(rh+g),cw,rh); }); } }});
function nbMonthGrid(D,X,x,y,w,h,ym,o){ o=o||{}; const L=X.lang, first=new Date(ym.y,ym.m,1), off=nbDow(first), dim=nbDIM(ym.y,ym.m), rows=Math.ceil((off+dim)/7), hh=o.hh!=null?o.hh:X.z(6), cw=w/7, rh=(h-hh)/rows;
  for(let i=0;i<7;i++){ D.t(x+cw*i+cw/2,y+hh*.65,(cw<X.z(14)?L.ws:L.ws)[i].toUpperCase(),{z:Math.min(X.z(2.2),cw*.26),a:'m',b:1,c:i>=5?X.wk:X.mut}); if(i>=5&&o.tint) D.r(x+cw*i,y+hh,cw,rh*rows,{f:X.fill,s:false}); }
  for(let r=0;r<=rows;r++) D.l(x,y+hh+r*rh,x+w,y+hh+r*rh,{c:r===0?X.cs:X.c,w:r===0?X.lw*1.4:X.lw}); for(let i=0;i<=7;i++) D.l(x+i*cw,y+hh,x+i*cw,y+hh+rows*rh,{c:X.c});
  for(let k=0;k<rows*7;k++){ const dd=new Date(ym.y,ym.m,1+k-off), inM=dd.getMonth()===ym.m; if(!inM&&!o.other) continue; const c=k%7, r=Math.floor(k/7);
    D.t(x+c*cw+X.z(1.4),y+hh+r*rh+X.z(3.6),String(dd.getDate()),{z:X.z(2.8),b:inM?1:0,c:inM?(c>=5?X.wk:X.ink):X.faint}); } }
nbT('monthly',{n:'Календарь на месяц',cat:'plan',ink:'m',date:'m',hdr:false,hint:'Сетка месяца с настоящими датами, неделя с понедельника',par:[NP.m(),NP.c('sp','Разворот: календарь + список дней',false),NP.c('tint','Выделить выходные',true),NP.c('other','Дни соседних месяцев',true),NP.c('notes','Колонка заметок',false)],
  spread:p=>p.sp,
  draw(D,X){ const p=X.p, mi=p.sp?Math.floor(X.i/2):X.i, half=p.sp?X.i%2:-1, ym=nbMonthAt(X,mi), L=X.lang;
    if(half===1){ let y=nbTitle(D,X,nbW(X,'monthplan'),`${L.m[ym.m]} ${ym.y}`); const dim=nbDIM(ym.y,ym.m), rh=(X.y+X.h-y)/dim; for(let d=1;d<=dim;d++){ const dd=new Date(ym.y,ym.m,d), wd=nbDow(dd), yy=y+(d-1)*rh;
        if(wd>=5) D.r(X.x,yy,X.w,rh,{f:X.fill,s:false}); const z=Math.min(X.z(2.6),rh*.62); D.t(X.x+X.z(4.5),yy+rh*.5+z*.36,String(d),{z,a:'e',b:1,c:wd>=5?X.wk:X.ink}); D.t(X.x+X.z(6),yy+rh*.5+z*.36,L.w1[wd],{z,c:X.mut}); D.l(X.x,yy+rh,X.x+X.w,yy+rh,{c:X.c}); } return; }
    const big=X.z(9); D.t(X.x,X.y+big*.8,L.m[ym.m],{z:big,b:1}); D.t(X.x+X.w,X.y+big*.8,String(ym.y),{z:X.z(5),a:'e',c:X.mut}); let y=X.y+big*1.15;
    const nw=p.notes?X.w*.26:0; nbMonthGrid(D,X,X.x,y,X.w-nw-(nw?X.z(3):0),X.y+X.h-y,ym,{tint:p.tint,other:p.other});
    if(nw){ const nx=X.x+X.w-nw; nbLab(D,X,nx,y+X.z(4),nbW(X,'notes')); nbLines(D,X,nx,y+X.z(6),nw,X.y+X.h,X.z(6.5)); } }});
nbT('year',{n:'Год на странице',cat:'plan',ink:'m',hdr:false,hint:'12 мини-календарей на одной странице',par:[NP.n('y','Год (0 — как у блокнота)',0,0,2100,1)],
  draw(D,X){ const yr=X.p.y||nbYM(X.S.start).y, L=X.lang; let y=nbTitle(D,X,String(yr),'');
    const land=X.w>X.h*1.1, cols=land?4:3, rows=12/cols, g=X.z(4), cw=(X.w-g*(cols-1))/cols, ch=(X.y+X.h-y-g*(rows-1))/rows;
    for(let m=0;m<12;m++){ const c=m%cols, r=Math.floor(m/cols), x=X.x+c*(cw+g), yy=y+r*(ch+g); D.t(x,yy+X.z(3.4),L.m[m],{z:X.z(3),b:1}); const first=new Date(yr,m,1), off=nbDow(first), dim=nbDIM(yr,m), cs=cw/7, rh=Math.min((ch-X.z(9))/6,cs*1.1);
      for(let i=0;i<7;i++) D.t(x+cs*i+cs/2,yy+X.z(7.2),L.w1[i],{z:Math.min(X.z(1.9),cs*.5),a:'m',c:i>=5?X.wk:X.mut,b:1});
      for(let d=1;d<=dim;d++){ const k=off+d-1; D.t(x+(k%7)*cs+cs/2,yy+X.z(8.5)+(Math.floor(k/7)+1)*rh,String(d),{z:Math.min(X.z(2.1),cs*.52),a:'m',c:k%7>=5?X.wk:X.ink}); } } }});
nbT('habit',{n:'Трекер привычек',cat:'plan',ink:'m',date:'m',hdr:false,hint:'Строки — привычки, столбцы — дни месяца',par:[NP.m(),NP.n('n','Привычек',12,3,30,1)],
  draw(D,X){ const ym=nbMonthAt(X,X.i), L=X.lang, dim=nbDIM(ym.y,ym.m); let y=nbTitle(D,X,nbW(X,'habits'),`${L.m[ym.m]} ${ym.y}`); const nw=X.w*.28, cw=(X.w-nw)/dim, hh=X.z(8), rh=Math.min(cw*1.5,(X.y+X.h-y-hh)/X.p.n), x0=X.x+nw;
    for(let d=0;d<dim;d++){ const dd=new Date(ym.y,ym.m,d+1), wk=nbDow(dd)>=5; if(wk) D.r(x0+d*cw,y,cw,hh+rh*X.p.n,{f:X.fill,s:false}); D.t(x0+d*cw+cw/2,y+X.z(3.4),String(d+1),{z:Math.min(X.z(2.1),cw*.55),a:'m',b:1,c:wk?X.wk:X.ink}); D.t(x0+d*cw+cw/2,y+X.z(6.6),L.w1[nbDow(dd)],{z:Math.min(X.z(1.8),cw*.5),a:'m',c:X.mut}); }
    nbLab(D,X,X.x,y+X.z(6.4),nbW(X,'habit')); const yb=y+hh+rh*X.p.n; for(let r=0;r<=X.p.n;r++) D.l(X.x,y+hh+r*rh,X.x+X.w,y+hh+r*rh,{c:r===0?X.cs:X.c,w:r===0?X.lw*1.4:X.lw}); for(let d=0;d<=dim;d++) D.l(x0+d*cw,y,x0+d*cw,yb,{c:d===0?X.cs:X.c}); }});
nbT('pixels',{n:'Год в пикселях',cat:'plan',ink:'m',hdr:false,hint:'Трекер настроения: клетка на каждый день года',par:[NP.n('y','Год (0 — как у блокнота)',0,0,2100,1)],
  draw(D,X){ const yr=X.p.y||nbYM(X.S.start).y, L=X.lang; let y=nbTitle(D,X,nbW(X,'pixels'),String(yr)); const lg=X.z(16), nw=X.z(6), cw=(X.w-nw)/12, rh=Math.min(cw,(X.y+X.h-y-lg-X.z(6))/31), x0=X.x+nw;
    for(let m=0;m<12;m++) D.t(x0+m*cw+cw/2,y+X.z(3.2),L.m1[m],{z:X.z(2.4),a:'m',b:1,c:X.mut}); y+=X.z(5);
    for(let d=1;d<=31;d++){ D.t(X.x+nw-X.z(1.2),y+(d-.5)*rh+X.z(.8),String(d),{z:Math.min(X.z(2),rh*.6),a:'e',c:X.mut}); for(let m=0;m<12;m++){ const ok=d<=nbDIM(yr,m); D.r(x0+m*cw,y+(d-1)*rh,cw,rh,ok?{s:X.c}:{f:X.fill,s:X.c}); } }
    let ly=y+31*rh+X.z(6); nbLab(D,X,X.x,ly,nbW(X,'legend')); ly+=X.z(3); const names=['great','good','okay','bad','awful'], lw=X.w/5; names.forEach((k,i)=>{ D.r(X.x+i*lw,ly,X.z(4),X.z(4),{s:X.cs,rr:X.z(.6)}); D.t(X.x+i*lw+X.z(5.5),ly+X.z(3.1),nbW(X,k),{z:X.z(2.3),c:X.mut}); D.l(X.x+i*lw,ly+X.z(9),X.x+i*lw+lw-X.z(3),ly+X.z(9),{c:X.c}); }); }});
nbT('gratitude',{n:'Дневник благодарности',cat:'plan',ink:'l',hdr:false,hint:'Три благодарности, лучший момент и настроение',par:[NP.s('k','Записей на странице','2',[['1','Одна'],['2','Две']])],
  draw(D,X){ const k=+X.p.k, g=X.z(5), eh=(X.h-g*(k-1))/k; for(let e=0;e<k;e++){ let y=X.y+e*(eh+g); const yb=y+eh; if(e) D.l(X.x,y-g/2,X.x+X.w,y-g/2,{c:X.c,d:[1,1.2]});
      nbField(D,X,X.x,y+X.z(4),X.w*.45,nbW(X,'date')); for(let i=0;i<5;i++) nbFace(D,X,X.x+X.w-X.z(2.4)-i*X.z(6.2),y+X.z(2.8),X.z(2.3),-1+i*.5); y+=X.z(9);
      const sec=(lab,n,num)=>{ nbLab(D,X,X.x,y+X.z(2.5),lab); const rh=Math.max(X.z(6),Math.min(X.z(8),(yb-y)/(n+3))); for(let i=0;i<n;i++){ if(num) D.t(X.x,y+X.z(3)+(i+1)*rh-X.z(1),(i+1)+'.',{z:X.z(2.6),c:X.mut,b:1}); D.l(X.x+(num?X.z(4.5):0),y+X.z(3)+(i+1)*rh,X.x+X.w,y+X.z(3)+(i+1)*rh,{c:X.c}); } y+=X.z(3)+n*rh+X.z(4.5); };
      sec(nbW(X,'grat'),3,1); sec(nbW(X,'best'),k===1?4:2); sec(nbW(X,'affirm'),k===1?3:1); } }});
nbT('goals',{n:'Цели',cat:'plan',ink:'m',hdr:false,hint:'Цель, шаги с датами, препятствия, награда и прогресс',par:[NP.n('n','Шагов',8,3,14,1)],
  draw(D,X){ let y=nbTitle(D,X,nbW(X,'goal'),''); D.l(X.x,y+X.z(5),X.x+X.w,y+X.z(5),{c:X.cs}); y+=X.z(10); nbField(D,X,X.x,y,X.w*.6,nbW(X,'deadline')); nbField(D,X,X.x+X.w*.64,y,X.w*.36,nbW(X,'start')); y+=X.z(6);
    nbLab(D,X,X.x,y,nbW(X,'why')); y+=X.z(1); for(let i=0;i<2;i++){ y+=X.z(7); D.l(X.x,y,X.x+X.w,y,{c:X.c}); } y+=X.z(7); nbLab(D,X,X.x,y,nbW(X,'steps')); y+=X.z(1); const rh=X.z(7);
    for(let i=0;i<X.p.n;i++){ nbCB(D,X,X.x,y+rh-X.z(4.4),X.z(3.2)); D.l(X.x+X.z(5),y+rh,X.x+X.w*.78,y+rh,{c:X.c}); D.l(X.x+X.w*.8,y+rh,X.x+X.w,y+rh,{c:X.c}); y+=rh; } y+=X.z(5);
    const bot=X.y+X.h-X.z(14), bw=(X.w-X.z(4))/2; if(bot-y>X.z(14)){ nbBoxT(D,X,X.x,y,bw,bot-y,nbW(X,'obst')); nbBoxT(D,X,X.x+bw+X.z(4),y,bw,bot-y,nbW(X,'reward')); }
    const py=X.y+X.h-X.z(8); nbLab(D,X,X.x,py-X.z(1.5),nbW(X,'progress')); const sw=X.w/10; for(let i=0;i<10;i++){ D.r(X.x+i*sw+X.z(.4),py,sw-X.z(.8),X.z(5),{s:X.cs,rr:X.z(.8)}); D.t(X.x+i*sw+sw/2,py+X.z(3.6),((i+1)*10)+'%',{z:X.z(1.8),a:'m',c:X.faint}); } }});
nbT('checklist',{n:'Список дел',cat:'plan',ink:'l',hdr:false,hint:'Чекбоксы, номера и приоритеты',par:[NP.s('cols','Колонки','1',[['1','Одна'],['2','Две']]),NP.n('rh','Высота строки',8,5,14,.5,'мм'),NP.c('num','Нумерация',false),NP.c('pr','Колонка приоритета',true),NP.x('tt','Заголовок','')],
  draw(D,X){ const p=X.p; let y=nbTitle(D,X,p.tt||nbW(X,'todo'),''); y-=X.z(1); nbField(D,X,X.x+X.w*.55,y-X.z(5.6)-X.z(3.2),X.w*.45,nbW(X,'date'),{z:X.z(2.2)});
    const c=+p.cols, g=X.z(6), cw=(X.w-g*(c-1))/c, n=Math.floor((X.y+X.h-y)/p.rh); for(let k=0;k<c;k++){ const x=X.x+k*(cw+g); for(let i=0;i<n;i++){ const yy=y+(i+1)*p.rh; let lx=x; if(p.num){ D.t(x+X.z(3.4),yy-X.z(1.4),String(k*n+i+1),{z:X.z(2.2),a:'e',c:X.mut}); lx+=X.z(4.6); } nbCB(D,X,lx,yy-X.z(1.2)-X.z(3.2),X.z(3.2)); D.l(lx+X.z(5),yy,x+cw-(p.pr?X.z(6):0),yy,{c:X.c}); if(p.pr) D.c(x+cw-X.z(2),yy-X.z(2.6),X.z(1.6),{s:X.c}); } } }});
nbT('meal',{n:'Меню на неделю',cat:'life',ink:'m',hdr:false,hint:'Завтрак, обед, ужин и список покупок',par:[NP.c('dt','С датами недели',false),NP.m()],
  draw(D,X){ const L=X.lang, mon=X.p.dt?nbWeekAt(X,X.i):null; let y=nbTitle(D,X,nbW(X,'meal'),mon?nbRange(X,mon,nbAdd(mon,6)):''); const th=(X.y+X.h-y)*.64;
    const t=nbTable(D,X,X.x,y,X.w,th,[['',.75],[nbW(X,'breakfast'),1],[nbW(X,'lunch'),1],[nbW(X,'dinner'),1],[nbW(X,'snack'),.8]],{rows:7});
    for(let i=0;i<7;i++){ const yy=t.y0+i*t.rh; D.t(t.xs[0]+X.z(1.5),yy+X.z(4),L.ws[i],{z:X.z(2.6),b:1,c:i>=5?X.wk:X.ink}); if(mon) D.t(t.xs[0]+X.z(1.5),yy+X.z(7.6),String(nbAdd(mon,i).getDate()),{z:X.z(2.4),c:X.mut}); }
    y=t.yb+X.z(6); nbLab(D,X,X.x,y,nbW(X,'shop')); y+=X.z(1); const rh=X.z(6.5), n=Math.floor((X.y+X.h-y)/rh), cw=(X.w-X.z(6))/2; for(let k=0;k<2;k++) for(let i=0;i<n;i++){ const x=X.x+k*(cw+X.z(6)), yy=y+(i+1)*rh; nbCB(D,X,x,yy-X.z(4.2),X.z(3)); D.l(x+X.z(4.6),yy,x+cw,yy,{c:X.c}); } }});
nbT('budget',{n:'Бюджет на месяц',cat:'life',ink:'m',date:'m',hdr:false,hint:'Доходы, расходы, остаток и накопления',par:[NP.c('dt','С названием месяца',true),NP.m()],
  draw(D,X){ const L=X.lang, ym=nbMonthAt(X,X.i); let y=nbTitle(D,X,nbW(X,'budget'),X.p.dt?`${L.m[ym.m]} ${ym.y}`:''); const lw=X.w*.58, g=X.z(4);
    const t1=nbTable(D,X,X.x,y,lw,X.z(7)+5*X.z(7),[[nbW(X,'source'),2],[nbW(X,'sum'),1]],{rows:5}); const bw=X.w-lw-g, bh=(t1.yb-y-X.z(3)*1)/2;
    [['income',0],['expenses',1]].forEach(([k,i])=>{ nbBoxT(D,X,X.x+lw+g,y+i*(bh+X.z(3)),bw,bh,nbW(X,k)); });
    y=t1.yb+X.z(5); const bh2=X.z(12), bw2=(X.w-g)/2; nbBoxT(D,X,X.x,y,bw2,bh2,nbW(X,'balance')); nbBoxT(D,X,X.x+bw2+g,y,bw2,bh2,nbW(X,'savings')); y+=bh2+X.z(5);
    nbTable(D,X,X.x,y,X.w,X.y+X.h-y,[[nbW(X,'date'),.8],[nbW(X,'cat'),1.4],[nbW(X,'desc'),2.4],[nbW(X,'sum'),1]],{rh:X.z(7)}); }});
nbT('ledger',{n:'Кассовая книга',cat:'life',ink:'m',hdr:false,hint:'Приход, расход и остаток — для бухгалтерии и кассы',par:[NP.n('rh','Высота строки',7,5,10,.5,'мм')],
  draw(D,X){ let y=nbTitle(D,X,nbW(X,'ledger'),''); nbField(D,X,X.x+X.w*.55,y-X.z(8.6),X.w*.45,nbW(X,'month'),{z:X.z(2.3)});
    const t=nbTable(D,X,X.x,y,X.w,X.y+X.h-y,[[nbW(X,'no'),.45],[nbW(X,'date'),.9],[nbW(X,'op'),3],[nbW(X,'in'),1],[nbW(X,'out'),1],[nbW(X,'balance'),1]],{rh:X.p.rh});
    const ly=t.y0+(t.rows-1)*t.rh; D.r(X.x,ly,X.w,t.rh,{f:X.fill,s:false}); D.l(X.x,ly,X.x+X.w,ly,{c:X.cs,w:X.lw*1.4}); D.t(t.xs[3]-X.z(1.5),ly+t.rh/2+X.z(.9),nbW(X,'total'),{z:X.z(2.5),a:'e',b:1}); }});
nbT('reading',{n:'Список книг',cat:'life',ink:'m',hdr:false,hint:'Название, автор, даты и оценка звёздами',par:[NP.n('rh','Высота строки',9,6,14,.5,'мм')],
  draw(D,X){ let y=nbTitle(D,X,nbW(X,'reading'),''); const t=nbTable(D,X,X.x,y,X.w,X.y+X.h-y,[[nbW(X,'no'),.4],[nbW(X,'book'),2.6],[nbW(X,'author'),1.8],[nbW(X,'start'),.9],[nbW(X,'end'),.9],[nbW(X,'rating'),1.3]],{rh:X.p.rh});
    const cw=t.xs[6]-t.xs[5], r=Math.min(cw/12,t.rh*.28); for(let i=0;i<t.rows;i++){ D.t(t.xs[0]+(t.xs[1]-t.xs[0])/2,t.y0+(i+.5)*t.rh+X.z(.9),String(i+1),{z:X.z(2.3),a:'m',c:X.faint}); for(let s=0;s<5;s++) nbStar(D,X,t.xs[5]+cw*(s+.5)/5,t.y0+(i+.5)*t.rh,r); } }});
nbT('recipe',{n:'Рецепт',cat:'life',ink:'m',hdr:false,hint:'Ингредиенты, шаги, время, порции и место для фото',par:[NP.c('ph','Рамка для фото',true)],
  draw(D,X){ const L=X.lang; let y=X.y; nbLab(D,X,X.x,y+X.z(3),nbW(X,'recipe')); D.l(X.x,y+X.z(11),X.x+X.w,y+X.z(11),{c:X.cs,w:X.lw*1.5}); y+=X.z(15);
    const lw=X.w*.38, g=X.z(5), rx=X.x+lw+g, rw=X.w-lw-g; const ib=[['serv',''],['time',''],['level','']]; const iw=(rw-X.z(4))/3;
    ib.forEach(([k],i)=>{ const x=rx+i*(iw+X.z(2)); nbBoxT(D,X,x,y,iw,X.z(13),nbW(X,k)); if(k==='level') for(let j=0;j<3;j++) D.c(x+X.z(4)+j*X.z(5),y+X.z(9.5),X.z(1.6),{s:X.cs}); });
    let ry=y+X.z(17); if(X.p.ph){ const ph=Math.min(X.h*.3,rw*.62); D.r(rx,ry,rw,ph,{s:X.c,rr:X.z(2),d:[1.5,1.2]}); D.t(rx+rw/2,ry+ph/2+X.z(1),'фото',{z:X.z(2.6),a:'m',c:X.faint}); ry+=ph+X.z(5); }
    nbLab(D,X,rx,ry,nbW(X,'steps')); const rh=X.z(7); let n=1; for(let yy=ry+X.z(1)+rh;yy<=X.y+X.h-X.z(16);yy+=rh){ if((n-1)%3===0) D.t(rx,yy-X.z(1.3),String((n-1)/3+1)+'.',{z:X.z(2.6),b:1,c:X.mut}); D.l(rx+X.z(4.5),yy,rx+rw,yy,{c:X.c}); n++; }
    nbLab(D,X,X.x,y+X.z(3),nbW(X,'ingr')); for(let yy=y+X.z(4)+rh;yy<=X.y+X.h-X.z(16);yy+=rh){ nbCB(D,X,X.x,yy-X.z(4.2),X.z(3)); D.l(X.x+X.z(4.6),yy,X.x+lw,yy,{c:X.c}); }
    const ny=X.y+X.h-X.z(13); nbLab(D,X,X.x,ny,nbW(X,'notes')); D.l(X.x,ny+X.z(6),X.x+X.w,ny+X.z(6),{c:X.c}); D.l(X.x,ny+X.z(12.5),X.x+X.w,ny+X.z(12.5),{c:X.c}); }});
nbT('contacts',{n:'Контакты',cat:'life',ink:'l',hdr:false,hint:'Имя, телефон, email, адрес, день рождения',par:[NP.n('k','Контактов на странице',5,2,10,1)],
  draw(D,X){ let y=nbTitle(D,X,nbW(X,'contacts'),''); const k=X.p.k, bh=(X.y+X.h-y)/k, z=X.z(2.2);
    for(let i=0;i<k;i++){ const by=y+i*bh, rows=bh>X.z(30)?4:3, rh=(bh-X.z(3))/rows; if(i) D.l(X.x,by,X.x+X.w,by,{c:X.cs,w:X.lw*1.2});
      nbField(D,X,X.x,by+rh,X.w,nbW(X,'name'),{z}); nbField(D,X,X.x,by+2*rh,X.w*.48,nbW(X,'phone'),{z}); nbField(D,X,X.x+X.w*.52,by+2*rh,X.w*.48,nbW(X,'email'),{z}); nbField(D,X,X.x,by+3*rh,rows>3?X.w:X.w*.62,nbW(X,'addr'),{z}); if(rows>3) nbField(D,X,X.x,by+4*rh,X.w*.5,nbW(X,'bday'),{z}); else nbField(D,X,X.x+X.w*.66,by+3*rh,X.w*.34,nbW(X,'bday'),{z}); } }});
nbT('passwords',{n:'Пароли',cat:'life',ink:'l',hdr:false,hint:'Сайт, логин, пароль, подсказка',par:[NP.n('k','Записей на странице',6,3,10,1)],
  draw(D,X){ let y=nbTitle(D,X,nbW(X,'passwords'),''); const k=X.p.k, bh=(X.y+X.h-y)/k, z=X.z(2.2); for(let i=0;i<k;i++){ const by=y+i*bh, rh=(bh-X.z(2))/3;
    D.r(X.x,by+X.z(1),X.z(1.2),bh-X.z(3),{f:X.c,s:false}); const x=X.x+X.z(3.5), w=X.w-X.z(3.5); nbField(D,X,x,by+rh,w,nbW(X,'site'),{z}); nbField(D,X,x,by+2*rh,w*.48,nbW(X,'login'),{z}); nbField(D,X,x+w*.52,by+2*rh,w*.48,nbW(X,'pass'),{z}); nbField(D,X,x,by+3*rh,w,nbW(X,'hint'),{z}); } }});
nbT('workout',{n:'Тренировка',cat:'life',ink:'m',hdr:false,hint:'Упражнения, подходы, вес, кардио и вода',par:[NP.n('n','Строк упражнений',10,5,18,1)],
  draw(D,X){ let y=nbTitle(D,X,nbW(X,'workout'),''); nbField(D,X,X.x,y+X.z(1),X.w*.48,nbW(X,'date')); nbField(D,X,X.x+X.w*.52,y+X.z(1),X.w*.48,nbW(X,'dur')); y+=X.z(6);
    const t=nbTable(D,X,X.x,y,X.w,X.z(7)+X.p.n*X.z(8),[[nbW(X,'exercise'),2.6],[nbW(X,'sets'),.9],[nbW(X,'reps'),.9],[nbW(X,'weight'),.9],[nbW(X,'notes'),1.6]],{rows:X.p.n}); y=t.yb+X.z(5);
    const ch=Math.min(X.z(7)+3*X.z(7.5),X.y+X.h-y-X.z(12)); if(ch>X.z(14)) { const t2=nbTable(D,X,X.x,y,X.w,ch,[[nbW(X,'cardio'),2.6],[nbW(X,'dur'),1.2],[nbW(X,'notes'),2.2]],{rows:Math.max(1,Math.round((ch-X.z(7))/X.z(7.5)))}); y=t2.yb+X.z(6); }
    if(X.y+X.h-X.z(9)-y>X.z(12)){ nbLab(D,X,X.x,y+X.z(1),nbW(X,'notes')); nbLines(D,X,X.x,y+X.z(1),X.w,X.y+X.h-X.z(8),X.z(7)); }
    const wy=X.y+X.h-X.z(2.5); nbLab(D,X,X.x,wy,nbW(X,'water')); const wx=X.x+nbTW(nbW(X,'water').toUpperCase(),X.z(2.1),1,X.ff)+X.z(3); for(let i=0;i<8;i++) D.p(nbDrop(wx+i*X.z(5),wy-X.z(2.6),X.z(1.9)),{close:1,s:X.cs});
    for(let s=0;s<5;s++) nbStar(D,X,X.x+X.w-X.z(2.2)-s*X.z(5),wy-X.z(1.4),X.z(2)); }});
nbT('measure',{n:'Фитнес-замеры',cat:'life',ink:'m',hdr:false,hint:'Вес и объёмы: 8 замеров на странице',par:[NP.n('n','Столбцов-дат',8,4,12,1)],
  draw(D,X){ let y=nbTitle(D,X,nbW(X,'fitness'),''); const keys=['weight','chest','waist','hips','thigh','arm','neck','fat','pulse','','',''], n=X.p.n;
    const t=nbTable(D,X,X.x,y,X.w,X.y+X.h-y,[[nbW(X,'param'),2.4],...Array.from({length:n},()=>['',1])],{rows:keys.length+1,hh:X.z(7)}); D.t(t.xs[1]+X.z(1.5),y+X.z(4.6),nbW(X,'date')+' →',{z:X.z(2.2),c:X.mut});
    keys.forEach((k,i)=>{ if(k) D.t(X.x+X.z(1.6),t.y0+(i+1.5)*t.rh+X.z(.9),nbW(X,k),{z:X.z(2.5)}); }); D.r(X.x,t.y0,X.w,t.rh,{f:X.fill,s:false}); D.t(X.x+X.z(1.6),t.y0+t.rh/2+X.z(.9),nbW(X,'goal'),{z:X.z(2.5),b:1}); }});
nbT('travel',{n:'План поездки',cat:'life',ink:'m',hdr:false,hint:'Билеты, жильё и план по дням',par:[NP.n('rh','Высота строки',9,6,14,.5,'мм')],
  draw(D,X){ let y=nbTitle(D,X,nbW(X,'trip'),''); nbField(D,X,X.x,y,X.w*.62,nbW(X,'trip')); nbField(D,X,X.x+X.w*.66,y,X.w*.34,nbW(X,'dates')); y+=X.z(5); const g=X.z(4), bw=(X.w-g)/2, bh=X.z(30);
    [['transport','flight'],['stay','addr']].forEach(([k,f],i)=>{ const x=X.x+i*(bw+g); let yy=nbBoxT(D,X,x,y,bw,bh,nbW(X,k)); for(let j=0;j<3;j++){ yy+=X.z(6.5); D.l(x+X.z(2.2),yy,x+bw-X.z(2.2),yy,{c:X.c}); } }); y+=bh+X.z(5);
    nbTable(D,X,X.x,y,X.w,X.y+X.h-y,[[nbW(X,'day'),.6],[nbW(X,'date'),.9],[nbW(X,'place'),1.6],[nbW(X,'plan'),3]],{rh:X.p.rh}); }});
nbT('packing',{n:'Что взять с собой',cat:'life',ink:'l',hdr:false,hint:'Чек-лист вещей по категориям',par:[],
  draw(D,X){ let y=nbTitle(D,X,nbW(X,'packing'),''); const cats=['clothes','docs','hyg','tech','med','misc'], g=X.z(4), cw=(X.w-g)/2, ch=(X.y+X.h-y-g*2)/3, rh=X.z(6.5);
    cats.forEach((k,i)=>{ const x=X.x+(i%2)*(cw+g), yy=y+Math.floor(i/2)*(ch+g); let ry=nbBoxT(D,X,x,yy,cw,ch,nbW(X,k)); for(;ry+rh<=yy+ch-X.z(1);ry+=rh){ nbCB(D,X,x+X.z(2.2),ry+rh-X.z(4),X.z(2.8)); D.l(x+X.z(6.4),ry+rh,x+cw-X.z(2.2),ry+rh,{c:X.c}); } }); }});
nbT('wedding',{n:'Свадебный планер',cat:'life',ink:'m',hdr:false,hint:'Бюджет, гости и подготовка по месяцам',par:[NP.s('v','Страница','plan',[['plan','Подготовка'],['budget','Бюджет'],['guests','Гости']])],
  draw(D,X){ const v=X.p.v; const orn=(y)=>{ const cx=X.x+X.w/2; D.l(cx-X.z(14),y,cx-X.z(3),y,{c:X.c}); D.l(cx+X.z(3),y,cx+X.z(14),y,{c:X.c}); D.p([cx,y-X.z(1.6),cx+X.z(1.6),y,cx,y+X.z(1.6),cx-X.z(1.6),y],{close:1,f:X.cs,s:false}); };
    const T=nbW(X,v==='plan'?'wplan':v==='budget'?'wbudget':'guests'); D.t(X.x+X.w/2,X.y+X.z(6),T,{z:X.z(5),a:'m',f:NB_FONTS.serif[0],i:1}); orn(X.y+X.z(10)); let y=X.y+X.z(15);
    if(v==='budget'){ const t=nbTable(D,X,X.x,y,X.w,X.y+X.h-y,[[nbW(X,'item'),1.6],[nbW(X,'vendor'),1.6],[nbW(X,'planned'),1],[nbW(X,'actual'),1],[nbW(X,'paid'),.8]],{rh:X.z(8)}); for(let i=0;i<t.rows;i++) nbCB(D,X,(t.xs[4]+t.xs[5])/2-X.z(1.6),t.y0+i*t.rh+t.rh/2-X.z(1.6),X.z(3.2)); return; }
    if(v==='guests'){ const t=nbTable(D,X,X.x,y,X.w,X.y+X.h-y,[[nbW(X,'no'),.45],[nbW(X,'name'),3],[nbW(X,'qty'),.8],[nbW(X,'table'),.8],[nbW(X,'rsvp'),.8]],{rh:X.z(7.5)}); for(let i=0;i<t.rows;i++){ D.t((t.xs[0]+t.xs[1])/2,t.y0+(i+.5)*t.rh+X.z(.8),String(i+1),{z:X.z(2.2),a:'m',c:X.faint}); nbCB(D,X,(t.xs[4]+t.xs[5])/2-X.z(1.6),t.y0+i*t.rh+t.rh/2-X.z(1.6),X.z(3.2)); } return; }
    const ks=['m12','m6','m3','m1','w1','wday'], g=X.z(4), cw=(X.w-g)/2, ch=(X.y+X.h-y-g*2)/3, rh=X.z(6.5); ks.forEach((k,i)=>{ const x=X.x+(i%2)*(cw+g), yy=y+Math.floor(i/2)*(ch+g); let ry=nbBoxT(D,X,x,yy,cw,ch,nbW(X,k)); for(;ry+rh<=yy+ch-X.z(1);ry+=rh){ nbCB(D,X,x+X.z(2.2),ry+rh-X.z(4),X.z(2.8)); D.l(x+X.z(6.4),ry+rh,x+cw-X.z(2.2),ry+rh,{c:X.c}); } }); }});
nbT('baby',{n:'Дневник малыша',cat:'life',ink:'m',date:'d',hdr:false,hint:'Кормление, сон и подгузники по времени',par:[NP.c('dt','С датами',true),NP.m(),NP.n('n','Строк',14,8,24,1)],
  draw(D,X){ const d=X.p.dt?nbDayAt(X,X.i):null; let y=nbTitle(D,X,nbW(X,'baby'),d?`${X.lang.wd[nbDow(d)]}, ${nbDTxt(X,d,1)}`:''); if(!d){ nbField(D,X,X.x+X.w*.55,y-X.z(8.6),X.w*.45,nbW(X,'date'),{z:X.z(2.3)}); }
    const t=nbTable(D,X,X.x,y,X.w,X.y+X.h-y-X.z(10),[[nbW(X,'time'),.8],[nbW(X,'feed'),1.6],[nbW(X,'sleep'),1.3],[nbW(X,'diaper'),1],[nbW(X,'notes'),2]],{rows:X.p.n});
    const cx=(t.xs[3]+t.xs[4])/2; for(let i=0;i<t.rows;i++){ const yy=t.y0+(i+.5)*t.rh; D.c(cx-X.z(2.5),yy,X.z(1.4),{s:X.c}); D.c(cx+X.z(2.5),yy,X.z(1.4),{s:X.c}); }
    const fy=X.y+X.h-X.z(2); nbField(D,X,X.x,fy,X.w*.3,nbW(X,'feed')); nbField(D,X,X.x+X.w*.35,fy,X.w*.3,nbW(X,'sleep')); nbField(D,X,X.x+X.w*.7,fy,X.w*.3,nbW(X,'diaper')); }});
nbT('garden',{n:'Огород и сад',cat:'life',ink:'m',hdr:false,hint:'План участка в клетку и таблица посадок',par:[NP.n('r','Доля плана',45,25,70,5,'%')],
  draw(D,X){ let y=nbTitle(D,X,nbW(X,'gplan'),''); const ph=(X.y+X.h-y)*X.p.r/100; D.r(X.x,y,X.w,ph,{s:X.cs,rr:X.z(1.5)}); nbDots(D,X,{x:X.x+X.z(2.5),y:y+X.z(2.5),w:X.w-X.z(5),h:ph-X.z(5)},5,.18); y+=ph+X.z(5);
    nbTable(D,X,X.x,y,X.w,X.y+X.h-y,[[nbW(X,'crop'),1.5],[nbW(X,'variety'),1.3],[nbW(X,'sow'),.9],[nbW(X,'transplant'),.9],[nbW(X,'harvest'),.9]],{rh:X.z(7.5)}); }});
/* ---------------- РАБОТА ---------------- */
nbT('storyboard',{n:'Раскадровка',cat:'work',ink:'m',hdr:false,hint:'Кадры 16:9 / 4:3 и строки для описания',par:[NP.s('asp','Кадр','16:9',[['16:9','16:9'],['4:3','4:3'],['1:1','1:1'],['2.39:1','2,39:1'],['9:16','9:16 (вертикально)']]),NP.n('cols','Столбцов',2,1,4,1),NP.n('rows','Рядов',3,1,6,1),NP.n('ln','Строк под кадром',2,0,5,1)],
  draw(D,X){ const p=X.p; let y=X.y; nbField(D,X,X.x,y+X.z(3.5),X.w*.5,nbW(X,'project')); nbField(D,X,X.x+X.w*.54,y+X.z(3.5),X.w*.24,nbW(X,'scene')); nbField(D,X,X.x+X.w*.82,y+X.z(3.5),X.w*.18,nbW(X,'page')); y+=X.z(8);
    const [a,b]=p.asp.split(':').map(Number), g=X.z(5), cw=(X.w-g*(p.cols-1))/p.cols, lh=X.z(6), rowH=(X.y+X.h-y-g*(p.rows-1))/p.rows; let fw=cw, fh=fw*b/a; const maxH=rowH-p.ln*lh-X.z(4); if(fh>maxH){ fh=maxH; fw=fh*a/b; }
    for(let r=0;r<p.rows;r++) for(let c=0;c<p.cols;c++){ const x=X.x+c*(cw+g)+(cw-fw)/2, yy=y+r*(rowH+g); D.r(x,yy+X.z(4),fw,fh,{s:X.cs,w:X.lw*1.5}); D.t(x,yy+X.z(3),String(r*p.cols+c+1),{z:X.z(2.6),b:1,c:X.mut}); for(let l=1;l<=p.ln;l++) D.l(x,yy+X.z(4)+fh+l*lh,x+fw,yy+X.z(4)+fh+l*lh,{c:X.c}); } }});
nbT('gantt',{n:'План проекта (Гант)',cat:'work',ink:'m',hdr:false,hint:'Задачи, ответственные и шкала недель',par:[NP.n('n','Недель на шкале',12,4,26,1),NP.n('rh','Высота строки',7,5,10,.5,'мм')],
  draw(D,X){ let y=nbTitle(D,X,nbW(X,'gantt'),''); nbField(D,X,X.x,y,X.w*.5,nbW(X,'project')); nbField(D,X,X.x+X.w*.54,y,X.w*.22,nbW(X,'start')); nbField(D,X,X.x+X.w*.8,y,X.w*.2,nbW(X,'end')); y+=X.z(5);
    const n=X.p.n, cols=[[nbW(X,'task'),n*.32/(1-.32-.1)],[nbW(X,'who'),n*.1/(1-.32-.1)],...Array.from({length:n},(_, i)=>[String(i+1),1])]; const t=nbTable(D,X,X.x,y,X.w,X.y+X.h-y,cols,{rh:X.p.rh,zebra:1}); }});
nbT('mindmap',{n:'Карта мыслей',cat:'work',ink:'l',hdr:false,hint:'Центр, ветви и точечный фон',par:[NP.n('b','Ветвей',6,3,8,1),NP.c('dots','Точечный фон',true)],
  draw(D,X){ nbField(D,X,X.x,X.y+X.z(3.5),X.w*.6,nbW(X,'topic')); nbField(D,X,X.x+X.w*.64,X.y+X.z(3.5),X.w*.36,nbW(X,'date')); const y0=X.y+X.z(8), H=X.y+X.h-y0;
    if(X.p.dots) nbDots(D,X,{x:X.x,y:y0+X.z(2),w:X.w,h:H-X.z(2)},5,.13); const cx=X.x+X.w/2, cy=y0+H/2, rx=X.w*.17, ry=Math.min(H*.09,rx*.6);
    nbEll(D,X,cx,cy,rx,ry,{s:X.cs,w:X.lw*2,f:'#ffffff'}); const n=X.p.b, Rx=X.w*.36, Ry=H*.36, bx=X.w*.12, by=Math.min(H*.05,bx*.55);
    for(let i=0;i<n;i++){ const a=-Math.PI/2+i*2*Math.PI/n+(n%2?0:Math.PI/n), px=cx+Rx*Math.cos(a), py=cy+Ry*Math.sin(a); D.l(cx+rx*Math.cos(a),cy+ry*Math.sin(a),px-bx*Math.cos(a),py-by*Math.sin(a),{c:X.c,d:[1.2,1]}); nbEll(D,X,px,py,bx,by,{s:X.cs,w:X.lw*1.3,f:'#ffffff'}); } }});
nbT('zettel',{n:'Карточка Zettelkasten',cat:'work',ink:'l',hdr:false,hint:'Номер карточки, заголовок, текст, связи и теги',par:[NP.n('s','Шаг линий',6,4,9,.5,'мм')],
  draw(D,X){ const bw=X.z(22), bh=X.z(8); D.r(X.x+X.w-bw,X.y,bw,bh,{s:X.cs,rr:X.z(1)}); D.t(X.x+X.w-bw+X.z(1.5),X.y+X.z(3),nbW(X,'no'),{z:X.z(2),c:X.mut}); nbField(D,X,X.x,X.y+X.z(5),X.w-bw-X.z(4),nbW(X,'date'));
    const ty=X.y+bh+X.z(7); D.l(X.x,ty,X.x+X.w,ty,{c:X.cs,w:X.lw*1.8}); const fy=X.y+X.h-X.z(13); nbLines(D,X,X.x,ty,X.w,fy-X.z(2),X.p.s);
    D.l(X.x,fy,X.x+X.w,fy,{c:X.cs}); nbLab(D,X,X.x,fy+X.z(5),nbW(X,'links')+' →'); const lx=X.x+X.z(22); for(let i=0;i<3;i++) D.r(lx+i*X.z(15),fy+X.z(1.5),X.z(13),X.z(5),{s:X.c,rr:X.z(1)}); nbField(D,X,X.x,X.y+X.h-X.z(1),X.w,'#',{z:X.z(2.4)}); }});
nbT('attend',{n:'Журнал посещаемости',cat:'work',ink:'m',hdr:false,hint:'Ученики или сотрудники × дни месяца',par:[NP.n('days','Дней',31,8,31,1),NP.n('rows','Строк',25,8,40,1)],
  draw(D,X){ let y=nbTitle(D,X,nbW(X,'attend'),''); nbField(D,X,X.x,y,X.w*.48,nbW(X,'group')); nbField(D,X,X.x+X.w*.52,y,X.w*.48,nbW(X,'month')); y+=X.z(4); const n=X.p.days;
    const t=nbTable(D,X,X.x,y,X.w,X.y+X.h-y,[[nbW(X,'no'),.9],[nbW(X,'fio'),7],...Array.from({length:n},(_, i)=>[String(i+1),1]),[nbW(X,'total'),1.8]],{rows:X.p.rows,zebra:1});
    for(let i=0;i<t.rows;i++) D.t((t.xs[0]+t.xs[1])/2,t.y0+(i+.5)*t.rh+Math.min(X.z(.8),t.rh*.25),String(i+1),{z:Math.min(X.z(2.2),t.rh*.6),a:'m',c:X.faint}); }});
nbT('timetable',{n:'Расписание уроков',cat:'study',ink:'m',hdr:false,hint:'Дни недели × уроки со временем',par:[NP.s('d','Дней','6',[['5','Пн–Пт'],['6','Пн–Сб']]),NP.n('n','Уроков',7,4,10,1)],
  draw(D,X){ const L=X.lang, nd=+X.p.d; let y=nbTitle(D,X,nbW(X,'timetable'),''); const land=X.w>X.h; const cols=land?nd:Math.ceil(nd/2), rowsB=land?1:2, g=X.z(4), bw=(X.w-g*(cols-1))/cols, bh=(X.y+X.h-y-g*(rowsB-1))/rowsB;
    for(let i=0;i<nd;i++){ const c=i%cols, r=Math.floor(i/cols), x=X.x+c*(bw+g), yy=y+r*(bh+g); D.r(x,yy,bw,X.z(7),{f:X.fill,s:false}); D.t(x+bw/2,yy+X.z(4.8),L.wd[i],{z:Math.min(X.z(2.8),bw/nbTW(L.wd[i],1,1,X.ff)*.9),a:'m',b:1});
      const rh=(bh-X.z(7))/X.p.n; for(let k=0;k<X.p.n;k++){ const ly=yy+X.z(7)+k*rh; D.t(x+X.z(1.2),ly+rh/2+X.z(.9),String(k+1),{z:X.z(2.4),b:1,c:X.mut}); D.l(x,ly+rh,x+bw,ly+rh,{c:X.c}); } D.l(x+X.z(5),yy+X.z(7),x+X.z(5),yy+bh,{c:X.c}); D.r(x,yy,bw,bh,{s:X.cs,rr:X.z(1.2)}); } }});
nbT('diary',{n:'Дневник школьника',cat:'study',ink:'m',date:'w',hdr:false,hint:'Разворот на неделю Пн–Сб с настоящими датами',par:[NP.m('from','С месяца (обычно сентябрь)'),NP.n('n','Уроков в день',7,5,8,1)],
  spread:()=>true,
  draw(D,X){ const L=X.lang, wi=Math.floor(X.i/2), half=X.i%2, mon=nbWeekAt(X,wi); let y=X.y; if(half===0){ D.t(X.x,y+X.z(3.5),nbW(X,'week')+' '+nbWeekNo(mon),{z:X.z(2.8),b:1}); } D.t(X.x+X.w,y+X.z(3.5),nbRange(X,mon,nbAdd(mon,5)),{z:X.z(2.5),a:'e',c:X.mut}); y+=X.z(6);
    const foot=half===1?X.z(9):0, g=X.z(3.5), bh=(X.y+X.h-foot-y-g*2)/3;
    for(let k=0;k<3;k++){ const d=nbAdd(mon,half*3+k), yy=y+k*(bh+g); D.r(X.x,yy,X.w,X.z(6.5),{f:X.fill,s:false}); D.t(X.x+X.z(1.5),yy+X.z(4.6),`${L.wd[nbDow(d)]}, ${nbDTxt(X,d,0)}`,{z:X.z(2.8),b:1});
      const t=nbTable(D,X,X.x,yy+X.z(6.5),X.w,bh-X.z(6.5),[['',.35],[nbW(X,'subject'),1.6],[nbW(X,'hw'),3],[nbW(X,'grade'),.65],[nbW(X,'sign'),.8]],{rows:X.p.n,hh:X.z(4.5)}); for(let i=0;i<t.rows;i++) D.t((t.xs[0]+t.xs[1])/2,t.y0+(i+.5)*t.rh+X.z(.8),String(i+1),{z:Math.min(X.z(2.2),t.rh*.6),a:'m',c:X.mut}); }
    if(foot){ nbField(D,X,X.x,X.y+X.h-X.z(1.5),X.w*.55,nbW(X,'parents')); nbField(D,X,X.x+X.w*.6,X.y+X.h-X.z(1.5),X.w*.4,nbW(X,'remarks')); } }});
nbT('lab',{n:'Лабораторный журнал',cat:'work',ink:'m',hdr:false,hint:'Шапка эксперимента, клетка 5 мм и подписи',par:[NP.n('s','Клетка',5,4,7,.5,'мм')],
  draw(D,X){ const hh=X.z(16); D.r(X.x,X.y,X.w,hh,{s:X.cs,rr:X.z(1.2)}); D.l(X.x,X.y+hh/2,X.x+X.w,X.y+hh/2,{c:X.c}); const z=X.z(2.3);
    nbField(D,X,X.x+X.z(1.5),X.y+hh/2-X.z(2),X.w*.55,nbW(X,'exp'),{z}); nbField(D,X,X.x+X.w*.6,X.y+hh/2-X.z(2),X.w*.22,nbW(X,'date'),{z}); D.t(X.x+X.w-X.z(1.5),X.y+hh/2-X.z(2),nbW(X,'page')+' '+X.num,{z,a:'e',b:1});
    nbField(D,X,X.x+X.z(1.5),X.y+hh-X.z(2),X.w-X.z(3),nbW(X,'aim'),{z}); const fy=X.y+X.h-X.z(9); const g=nbFit({x:X.x,y:X.y+hh+X.z(2.5),w:X.w,h:fy-X.y-hh-X.z(5)},X.p.s); nbGrid(D,X,g,X.p.s);
    D.l(X.x,fy,X.x+X.w,fy,{c:X.cs}); const fw=X.w/3; [['by'],['witness'],['date']].forEach(([k],i)=>nbField(D,X,X.x+i*fw,X.y+X.h-X.z(1.5),fw-X.z(3),nbW(X,k),{z})); }});
/* ---------------- СЛУЖЕБНЫЕ ---------------- */
nbT('title',{n:'Титульный лист',cat:'svc',ink:'l',hdr:false,nopn:1,hint:'«Этот блокнот принадлежит…», имя владельца, контакты',par:[NP.c('fr','Рамка',true),NP.c('ret','«Если нашли, верните»',true),NP.c('dates','Даты начала и конца',true)],
  draw(D,X){ const S=X.S, cx=X.x+X.w/2; if(X.p.fr){ D.r(X.x,X.y,X.w,X.h,{s:X.cs,w:X.lw*1.4,rr:X.z(2)}); D.r(X.x+X.z(1.6),X.y+X.z(1.6),X.w-X.z(3.2),X.h-X.z(3.2),{s:X.c,w:X.lw*.8,rr:X.z(1.2)}); }
    let y=X.y+X.h*.2; const tt=S.title||''; if(tt){ let z=X.z(8); const tw=nbTW(tt,z,1,X.ff); if(tw>X.w*.8) z*=X.w*.8/tw; D.t(cx,y,tt,{z,a:'m',b:1}); } y+=X.z(7); if(S.year) D.t(cx,y,String(S.year),{z:X.z(3.4),a:'m',c:X.mut,ls:X.z(.8)});
    y=X.y+X.h*.45; D.t(cx,y,nbW(X,'belongs').toUpperCase(),{z:X.z(2.5),a:'m',c:X.mut,b:1,ls:X.z(.35)}); y+=X.z(12); const ow=S.owner||''; if(ow){ let z=X.z(7.5); const f=NB_FONTS.hand[0]; const tw=nbTW(ow,z,0,f); if(tw>X.w*.75) z*=X.w*.75/tw; D.t(cx,y-X.z(1.5),ow,{z,a:'m',f}); }
    D.l(X.x+X.w*.15,y+X.z(1),X.x+X.w*.85,y+X.z(1),{c:X.cs}); y+=X.z(14);
    if(X.p.ret){ D.t(cx,y,nbW(X,'ifound'),{z:X.z(2.6),a:'m',c:X.mut}); for(let i=1;i<=2;i++) D.l(X.x+X.w*.15,y+i*X.z(8),X.x+X.w*.85,y+i*X.z(8),{c:X.c}); y+=X.z(24); }
    if(X.p.dates&&y+X.z(8)<X.y+X.h){ const yy=Math.max(y,X.y+X.h-X.z(14)); nbField(D,X,X.x+X.w*.12,yy,X.w*.35,nbW(X,'started')); nbField(D,X,X.x+X.w*.53,yy,X.w*.35,nbW(X,'finished')); } }});
nbT('contents',{n:'Содержание',cat:'svc',ink:'l',hdr:false,hint:'Тема и номер страницы; может заполниться само по разделам',par:[NP.c('auto','Заполнить по разделам блокнота',true),NP.n('rh','Высота строки',8,6,12,.5,'мм')],
  draw(D,X){ let y=nbTitle(D,X,nbW(X,'contents'),''); const rh=X.p.rh, n=Math.floor((X.y+X.h-y)/rh), pw=X.z(12); nbLab(D,X,X.x+X.w,y-X.z(.6),nbW(X,'page'),{a:'e'});
    const entries=X.p.auto?(X.toc||[]):[], off=X.i*n; for(let i=0;i<n;i++){ const yy=y+(i+1)*rh, e=entries[off+i];
      if(e){ const z=X.z(2.9); D.t(X.x,yy-X.z(1.4),e.n,{z}); D.t(X.x+X.w,yy-X.z(1.4),String(e.p),{z,a:'e',b:1}); const x0=X.x+nbTW(e.n,z,0,X.ff)+X.z(2), x1=X.x+X.w-nbTW(String(e.p),z,1,X.ff)-X.z(2); if(x1>x0) D.l(x0,yy-X.z(1.6),x1,yy-X.z(1.6),{c:X.c,d:[.15,.9],cap:'round',w:X.lw*1.6}); }
      else { D.l(X.x,yy,X.x+X.w-pw-X.z(2),yy,{c:X.c}); D.l(X.x+X.w-pw,yy,X.x+X.w,yy,{c:X.c}); } } }});
nbT('notes',{n:'Заметки (линейка)',cat:'svc',ink:'l',hint:'Простая страница в линейку — вставляется для выравнивания разворотов',par:[NP.n('s','Шаг линий',7,5,10,.5,'мм')],
  draw(D,X){ nbLines(D,X,X.x,X.y,X.w,X.y+X.h,X.p.s,{c:X.c}); }});
const NB_DATED=t=>!!(NB_T[t]&&NB_T[t].date);

/* ---------------- notebook → pages ---------------- */
function nbExpand(S){ const out=[]; const dup=S.sides!=1, F={};
  for(const sec of (S.secs||[])){ const T=NB_T[sec.type]; if(!T) continue; const n=Math.max(0,Math.min(999,Math.round(+sec.n||0))); if(!n) continue; const p=nbParams(T,sec.p);
    if(dup&&T.spread&&T.spread(p)&&out.length%2===0) out.push({type:'notes',p:nbParams(NB_T.notes,{}),sec,si:-1,fill:1});
    F[sec.id]=out.length; const at=sec.alt&&NB_T[sec.alt]?sec.alt:'', ap=at?nbParams(NB_T[at],sec.ap):null;
    for(let i=0;i<n;i++){ const v=dup&&out.length%2===1; out.push(at&&v?{type:at,p:ap,sec,si:i,alt:1}:{type:sec.type,p,sec,si:i}); }
    if(out.length>=2000) break; }
  const st=S.st||{}; out.forEach((pg,k)=>{ pg.k=k; pg.v=dup&&k%2===1; pg.num=k+(+st.pnStart||1); }); out.first=F; const toc=nbTOC(S,out); out.forEach(pg=>{ pg.toc=toc; }); return out; }
function nbTOC(S,P){ const t=[]; (S.secs||[]).forEach(sec=>{ const f=P.first[sec.id]; if(['title','contents','notes'].includes(sec.type)||!(sec.n>0)||f==null||!P[f]) return; t.push({n:sec.name||(NB_T[sec.type]||{}).n||'',p:P[f].num}); }); return t; }
function nbHoles(S,H){ const b=S.binding, pr=S.pr||{}; if(!['spiral','wireo','rings','disc'].includes(b)) return [];
  if(b==='rings'){ const four=S.st.holes4&&H>=255; const ys=four?[-120,-40,40,120]:[-40,40]; return ys.map(d=>({y:H/2+d,r:3,x:12})); }
  const pitch=b==='spiral'?6.35:b==='wireo'?8.47:19, r=b==='disc'?2.4:b==='wireo'?2:2.2, x=b==='disc'?6:5; const n=Math.floor((H-12)/pitch)+1, y0=(H-(n-1)*pitch)/2; return Array.from({length:n},(_, i)=>({y:y0+i*pitch,r,x,sq:b==='wireo'})); }
const NB_HOLE_MIN={spiral:11,wireo:11,disc:12,rings:20};
/* page layout context */
function nbCtx(S,pg){ const st=S.st, {w:W,h:H}=nbSize(S), k=Math.max(.62,Math.min(1.25,Math.min(W,H)/148)); const v=!!pg.v;
  const g=Math.max(5,+st.gutter||0), o=Math.max(5,+st.mo||0), t=Math.max(5,+st.mt||0), b=Math.max(5,+st.mb||0);
  const left=st.mirror&&v?o:g, right=st.mirror&&v?g:o; const op=Math.max(.15,Math.min(1,(+st.op||100)/100)), c0=st.c||'#8da2bb';
  const c=nbMix('#ffffff',c0,op), cs=nbMix('#ffffff',nbMix(c0,'#1d2733',.22),Math.min(1,op*1.12)), ink=nbMix(c0,'#20262e',.78), lang=NB_L[S.lang]||NB_L.ru;
  const X={S,pg,p:pg.p,i:pg.si,num:pg.num,v,W,H,k,z:q=>q*k,x:left,y:t,w:W-left-right,h:H-t-b,sb:{x:5,y:5,w:W-10,h:H-10},
    c0,op,c,cs,dot:nbMix('#ffffff',nbMix(c0,'#1d2733',.15),Math.min(1,op*1.1)),ink,mut:nbMix(ink,'#ffffff',.38),faint:nbMix(ink,'#ffffff',.62),fill:nbMix('#ffffff',c0,.1),zeb:nbMix('#ffffff',c0,.05),wk:nbMix(ink,'#c0504d',.45),
    mc:st.mc||'#e08a8a',lw:Math.max(.05,+st.lw||.2),ff:(NB_FONTS[S.font]||NB_FONTS.golos)[0],lang,li:nbLi(S.lang)};
  return X; }
function nbHeaderText(S,pg){ const st=S.st; let t=S.hov&&S.hov[pg.num]!=null?S.hov[pg.num]:(pg.sec&&pg.sec.ht)||st.hdrText||''; if(!t) return '';
  return String(t).replace(/\{n\}/g,pg.num).replace(/\{i\}/g,pg.si+1).replace(/\{title\}/g,S.title||'').replace(/\{sec\}/g,(pg.sec&&(pg.sec.name||(NB_T[pg.sec.type]||{}).n))||''); }
function nbPageList(S,pg){ const T=NB_T[pg.type]||NB_T.blank; const X=nbCtx(S,pg); const D=nbDraw({c:X.c,lw:X.lw,ink:X.ink,ff:X.ff}); const st=S.st;
  if(pg.blank) return D.L; const ht=nbHeaderText(S,pg); X.toc=pg.toc;
  if((st.hdr&&T.hdr!==false)||ht&&T.hdr!==false){ const hH=X.z(9); if(ht) D.t(X.x,X.y+X.z(5),ht,{z:X.z(3.2),b:1}); if(st.hdrDate) nbField(D,X,X.x+X.w*.6,X.y+X.z(5),X.w*.4,nbW(X,'date'),{z:X.z(2.4)}); D.l(X.x,X.y+hH-X.z(1.5),X.x+X.w,X.y+hH-X.z(1.5),{c:X.cs,w:X.lw*1.4}); X.y+=hH; X.h-=hH; X.sb={x:5,y:Math.max(5,X.y),w:X.sb.w,h:X.H-5-Math.max(5,X.y)}; }
  else if(ht&&T.hdr===false){ D.t(X.x+X.w,Math.max(4.5,X.y-X.z(2.5)),ht,{z:X.z(2.4),a:'e',c:X.mut}); }
  try{ T.draw(D,X); }catch(e){ console.error('[notebook] '+pg.type,e); }
  /* margin line */
  if(T.ml&&(st.margin||X.p.m)){ const b=X.p.full?X.sb:X, side=st.mside==='inner'?!X.v:st.mside==='left'?false:st.mside==='right'?true:!X.v; let x=side?b.x+b.w-(+st.mdist||20):b.x+(+st.mdist||20); if(X.grid) x=X.grid.ox+Math.round((x-X.grid.ox)/X.grid.s)*X.grid.s;
    D.l(x,X.grid?X.grid.y0:b.y,x,X.grid?X.grid.y1:b.y+b.h,{c:X.mc,w:Math.max(.25,X.lw*1.3)}); }
  /* perforation / tear-off guide */
  if(st.perf==='inner'){ const x=X.v?X.W-14:14; D.l(x,5,x,X.H-5,{c:'#b9bec6',w:.2,d:[1.2,1]}); D.t(x,8.5,'✂',{z:3,a:'m',c:'#9aa0a8',f:'sans-serif'}); }
  else if(st.perf==='top'||st.perf==='bottom'){ const y=st.perf==='top'?16:X.H-16; D.l(5,y,X.W-5,y,{c:'#b9bec6',w:.2,d:[1.2,1]}); D.t(8,y+1,'✂',{z:3,a:'m',c:'#9aa0a8',f:'sans-serif'}); }
  /* binding holes */
  if(st.holes){ const hs=nbHoles(S,X.H); hs.forEach(hh=>{ const x=X.v?X.W-hh.x:hh.x; if(hh.sq) D.r(x-hh.r*.6,hh.y-hh.r,hh.r*1.2,hh.r*2,{s:'#c8ccd2',w:.15,rr:.3}); else D.c(x,hh.y,hh.r,{s:'#c8ccd2',w:.15}); D.l(x-.8,hh.y,x+.8,hh.y,{c:'#c8ccd2',w:.1}); D.l(x,hh.y-.8,x,hh.y+.8,{c:'#c8ccd2',w:.1}); }); }
  /* page number + logo */
  const pn=st.pn||'outer', showN=pn!=='none'&&!pg.fill&&!(T.nopn&&!st.pnTitle); const by=Math.min(X.H-5.6,X.H-Math.max(5,+st.mb||0)/2+1.2), z=X.z(2.5);
  if(showN){ const s=String(pg.num); let x,a; if(pn==='center'){ x=X.W/2; a='m'; } else { const outer=pn==='outer'; const right=outer?!X.v:X.v; x=right?X.W-Math.max(6,Math.max(5,+st.mo||0)):Math.max(6,Math.max(5,+st.mo||0)); a=right?'e':'s'; if(!st.mirror){ x=X.W-Math.max(6,+st.mo||0); a='e'; } }
    const tw=nbTW(s,z,0,X.ff); const rx=a==='m'?x-tw/2:a==='e'?x-tw:x; D.r(rx-1,by-z*.85,tw+2,z*1.15,{f:'#ffffff',s:false}); D.t(x,by,s,{z,a,c:X.mut}); }
  if(st.logo&&KS.thSVG){ try{ const svg=KS.thSVG({v:'mono'},dzPal({ink:'#888'})); const s=X.z(7); const lx=pn==='center'?(X.v?Math.max(6,+st.mo||0):X.W-Math.max(6,+st.mo||0)-s):X.W/2-s/2; D.r(lx-.5,by-s+1.2,s+1,s+1,{f:'#ffffff',s:false}); D.img(lx,by-s+1.6,s,s,svg); }catch(_){ } }
  return D.L; }

/* ================= imposition, sheets, print, PDF ================= */
const NB_SHEETS={A4:{w:210,h:297,n:'A4'},letter:{w:216,h:279,n:'Letter'},A3:{w:297,h:420,n:'A3'}};
const NB_IMP=[['auto','Авто'],['1up','1 на листе'],['nup','Несколько на листе'],['booklet','Брошюра'],['sig','Тетради (шитьё)']];
function nbMode(S){ const m=S.pr.imp; if(m&&m!=='auto') return m; if(S.binding==='staple') return 'booklet'; if(S.binding==='sewn') return 'sig'; return 'nup'; }
const nbThick=S=>Math.max(.04,(+S.paperGsm||80)*.00125);
/* page-list cache for the current notebook (invalidated on every change) */
const NBC={ver:1,map:new Map(),key:''};
function nbPageL(S,pg,nocache){ if(nocache) return nbPageList(S,pg); const k=pg.k; let L=NBC.map.get(k); if(!L){ L=nbPageList(S,pg); NBC.map.set(k,L); } return L; }
function nbSlots(uw,uh,SW,SH,gap,want){ let best=null;
  for(const rot of [false,true]){ const w=rot?uh:uw, h=rot?uw:uh; let cols=Math.floor((SW+gap+1e-6)/(w+gap)), rows=Math.floor((SH+gap+1e-6)/(h+gap)); if(cols<1||rows<1) continue;
    let n=cols*rows; if(want>0&&want<n){ n=want; if(cols>=n){ cols=n; rows=1; } else { rows=Math.ceil(n/cols); } }
    if(!best||n>best.n||(n===best.n&&!rot&&best.rot)) best={n,cols,rows,rot,w,h,sc:1}; }
  if(!best){ let sc=0, rot=false; for(const r of [false,true]){ const w=r?uh:uw, h=r?uw:uh, s=Math.min(SW/w,SH/h); if(s>sc+1e-6){ sc=s; rot=r; } } const w=(rot?uh:uw)*sc, h=(rot?uw:uh)*sc; best={n:1,cols:1,rows:1,rot,w,h,sc}; }
  const tw=best.cols*best.w+(best.cols-1)*gap, th=best.rows*best.h+(best.rows-1)*gap, x0=(SW-tw)/2, y0=(SH-th)/2; best.pos=[];
  for(let i=0;i<best.n;i++){ const c=i%best.cols, r=Math.floor(i/best.cols); best.pos.push({x:x0+c*(best.w+gap),y:y0+r*(best.h+gap)}); }
  best.slotM=j=>{ const p=best.pos[j], s=best.sc; return best.rot?[0,s,-s,0,p.x+best.w,p.y]:[s,0,0,s,p.x,p.y]; }; return best; }
function nbUnits(S,N,mode){ const {w:pw,h:ph}=nbSize(S), dup=S.sides!=1||mode==='booklet'||mode==='sig'; const U=[]; let padTo=N;
  const bi=i=>i<N?i:-1;
  if(mode==='booklet'||mode==='sig'){ padTo=Math.ceil(N/4)*4||4; const per=mode==='sig'?4*Math.max(1,Math.round(+S.pr.sig||4)):padTo; let sg=0;
    for(let base=0;base<padTo;base+=per){ const q=Math.min(per,padTo-base), ns=q/4; const tot=S.pr.creep==='auto'?(ns-1)*nbThick(S):S.pr.creep==='off'?0:+S.pr.creepMM||0;
      for(let s=0;s<ns;s++){ const sh=ns>1?tot*s/(ns-1):0; U.push({sig:sg,s,ns,cells:[{x:0,pf:bi(base+q-2*s-1),pb:bi(base+q-2*s-2),dx:sh},{x:pw,pf:bi(base+2*s),pb:bi(base+2*s+1),dx:-sh}]}); } sg++; }
    return {uw:2*pw,uh:ph,pw,ph,U,padTo,dup:true,fold:true}; }
  if(dup){ padTo=Math.ceil(N/2)*2; for(let l=0;l<padTo/2;l++) U.push({cells:[{x:0,pf:bi(2*l),pb:bi(2*l+1),dx:0}]}); }
  else for(let l=0;l<N;l++) U.push({cells:[{x:0,pf:l,pb:-2,dx:0}]});
  return {uw:pw,uh:ph,pw,ph,U,padTo,dup,fold:false}; }
/* full imposition plan */
function nbImpose(S,P){ const pr=S.pr, sh=NB_SHEETS[pr.sheet]||NB_SHEETS.A4, SW=sh.w, SH=sh.h, mode=nbMode(S), N=P.length;
  const u=nbUnits(S,N,mode), gap=Math.max(0,+pr.gap||0); const want=mode==='1up'?1:(+pr.nup||0); const sl=nbSlots(u.uw,u.uh,SW,SH,gap,want); const k=sl.n;
  const order=k>1?(pr.order||'stack'):'seq'; const nU=u.U.length; const nS=order==='copies'?nU:Math.ceil(nU/k); const sheets=[];
  const F=[-1,0,0,1,u.pw,0], M=pr.flip==='short'?[1,0,0,-1,0,SH]:[-1,0,0,1,SW,0];
  for(let s=0;s<nS;s++){ const front=[], back=u.dup?[]:null, rects=[], folds=[];
    for(let j=0;j<k;j++){ const ui=order==='copies'?s:order==='stack'?j*nS+s:s*k+j; const U=u.U[ui]; if(!U) continue; const Ts=sl.slotM(j);
      const a=nbAp(Ts,0,0), b=nbAp(Ts,u.uw,u.uh); rects.push({x0:Math.min(a[0],b[0]),y0:Math.min(a[1],b[1]),x1:Math.max(a[0],b[0]),y1:Math.max(a[1],b[1])});
      if(u.fold){ const f0=nbAp(Ts,u.pw,0), f1=nbAp(Ts,u.pw,u.uh); folds.push([f0,f1]); }
      U.cells.forEach(c=>{ const Tc=nbMul(Ts,nbTr(c.x,0)); front.push({pg:c.pf,m:Tc,dx:c.dx,cell:1});
        if(back) back.push({pg:c.pb,m:nbMul(M,nbMul(Tc,F)),dx:-c.dx}); });
      if(u.fold&&U.s===0&&pr.nums&&mode==='sig'){ const p0=nbAp(Ts,u.pw-1,8+(U.sig%12)*7), p1=nbAp(Ts,u.pw+1,14+(U.sig%12)*7); front.push({mark:{x0:Math.min(p0[0],p1[0]),y0:Math.min(p0[1],p1[1]),x1:Math.max(p0[0],p1[0]),y1:Math.max(p0[1],p1[1])}}); } }
    sheets.push({front,back,rects,folds}); }
  const warn=[]; if(sl.sc<.999) warn.push(`Страница больше листа ${sh.n}: печать с масштабом ${Math.round(sl.sc*100)}%.`);
  return {mode,SW,SH,sheet:sh,k,rot:sl.rot,sc:sl.sc,order,u,sheets,N,padTo:u.padTo,blanks:u.padTo-N,warn,dup:u.dup}; }
/* cut & fold marks in sheet coordinates */
function nbMarks(imp,sheet,side,S,idx){ const L=[]; const D=nbDraw({c:'#4a4f57',lw:.15,ink:'#6b7079'}); if(!sheet.rects.length) return L; const SW=imp.SW, SH=imp.SH, pm=5;
  if(side==='front'&&S.pr.marks){ const X=new Map(), Y=new Map(); sheet.rects.forEach(r=>{ [r.x0,r.x1].forEach(x=>X.set(Math.round(x*100)/100,1)); [r.y0,r.y1].forEach(y=>Y.set(Math.round(y*100)/100,1)); });
    const bx0=Math.min(...sheet.rects.map(r=>r.x0)), by0=Math.min(...sheet.rects.map(r=>r.y0)), bx1=Math.max(...sheet.rects.map(r=>r.x1)), by1=Math.max(...sheet.rects.map(r=>r.y1));
    const tick=(x0,y0,x1,y1)=>D.l(x0,y0,x1,y1);
    [...X.keys()].forEach(x=>{ if(x<pm+.3||x>SW-pm-.3) return; if(by0-1.5-pm>=2.5) tick(x,Math.max(pm,by0-9),x,by0-1.5); else tick(x,pm+.4,x,pm+4); if(SH-by1-1.5-pm>=2.5) tick(x,by1+1.5,x,Math.min(SH-pm,by1+9)); else tick(x,SH-pm-4,x,SH-pm-.4); });
    [...Y.keys()].forEach(y=>{ if(y<pm+.3||y>SH-pm-.3) return; if(bx0-1.5-pm>=2.5) tick(Math.max(pm,bx0-9),y,bx0-1.5,y); else tick(pm+.4,y,pm+4,y); if(SW-bx1-1.5-pm>=2.5) tick(bx1+1.5,y,Math.min(SW-pm,bx1+9),y); else tick(SW-pm-4,y,SW-pm-.4,y); });
  }
  if(side==='front'&&S.pr.marks) sheet.folds.forEach(([a,b])=>{ const vert=Math.abs(a[0]-b[0])<.01; if(vert){ D.l(a[0],pm+.4,a[0],pm+6,{d:[1,.7]}); D.l(a[0],SH-pm-6,a[0],SH-pm-.4,{d:[1,.7]}); } else { D.l(pm+.4,a[1],pm+6,a[1],{d:[1,.7]}); D.l(SW-pm-6,a[1],SW-pm-.4,a[1],{d:[1,.7]}); } });
  (side==='front'?sheet.front:[]).forEach(pl=>{ if(pl.mark){ const r=pl.mark; D.r(r.x0,r.y0,r.x1-r.x0,r.y1-r.y0,{f:'#222',s:false}); } });
  if(S.pr.nums){ const by1=Math.max(...sheet.rects.map(r=>r.y1)), by0=Math.min(...sheet.rects.map(r=>r.y0)); const t=`${(S.title||'Блокнот').slice(0,40)} · лист ${idx+1} из ${imp.sheets.length} · ${side==='front'?'лицо':'оборот'}`;
    if(SH-by1>=8.6) D.t(SW/2,SH-5.6,t,{z:2,a:'m',c:'#8a9099'}); else if(by0>=8.6) D.t(SW/2,7.6,t,{z:2,a:'m',c:'#8a9099'}); }
  return D.L; }
/* imposed sheet side → drawable page {w,h,parts,marks} */
function nbSide(S,P,imp,i,side,nocache){ const sh=imp.sheets[i]; const pl=side==='front'?sh.front:sh.back; const parts=[];
  (pl||[]).forEach(x=>{ if(x.mark||x.pg==null||x.pg<0||!P[x.pg]) return; parts.push({t:'g',m:x.m,dx:x.dx||0,clip:{w:imp.u.pw,h:imp.u.ph},L:nbPageL(S,P[x.pg],nocache)}); });
  return {w:imp.SW,h:imp.SH,L:parts.concat(nbMarks(imp,sh,side,S,i)),name:`list-${i+1}-${side==='front'?'lico':'oborot'}`}; }
const nbPageOut=(S,pg,nocache)=>{ const {w,h}=nbSize(S); return {w,h,L:nbPageL(S,pg,nocache),name:'str-'+pg.num}; };
const nbPrintPage=o=>KS.page(o.w,o.h,nbSVG(o.L,o.w,o.h,'width="100%" height="100%" style="position:absolute;left:0;top:0;display:block"'),o.name);
function nbRangeParse(str,max){ str=String(str||'').trim(); if(!str) return null; const set=new Set(); str.split(/[,;\s]+/).forEach(t=>{ const m=t.match(/^(\d+)(?:\s*[-–]\s*(\d+))?$/); if(!m) return; let a=+m[1], b=m[2]?+m[2]:a; if(a>b) [a,b]=[b,a]; for(let i=Math.max(1,a);i<=Math.min(max,b);i++) set.add(i-1); }); return [...set].sort((a,b)=>a-b); }
/* sheet side lists for a job: 'all' (duplex interleaved), 'fronts', 'backs' */
function nbJob(S,P,imp,kind,o){ o=o||{}; let idx=o.idx||nbRangeParse(S.pr.range,imp.sheets.length)||imp.sheets.map((_, i)=>i); const out=[];
  if(kind==='backs'&&o.rev) idx=idx.slice().reverse();
  idx.forEach(i=>{ if(kind!=='backs') out.push(nbSide(S,P,imp,i,'front',o.nocache)); if(kind!=='fronts'&&imp.sheets[i].back) out.push(nbSide(S,P,imp,i,'back',o.nocache)); }); return out; }

/* ---------- vector PDF file (jsPDF): lines stay vector, text is embedded as crisp images ---------- */
async function nbPDF(pages,name,prog){ let J=null; try{ await loadLib('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',()=>window.jspdf&&window.jspdf.jsPDF); J=window.jspdf.jsPDF; }catch(e){}
  if(!J){ KS.toast('PDF-библиотека не загрузилась. Открываю печать: выберите «Сохранить как PDF».'); KS.print(pages.map(nbPrintPage)); return null; }
  const fams=new Set(); const walk=L=>L.forEach(e=>{ if(e.t==='t') fams.add(e.f+'|'+(e.b?700:400)+'|'+(e.i?'italic':'normal')); else if(e.t==='g') walk(e.L); }); pages.forEach(p=>walk(p.L));
  await Promise.all([...fams].map(f=>{ const [fam,w,st]=f.split('|'); return document.fonts&&document.fonts.load(`${st} ${w} 40px ${fam}`,'АаԱաAa').catch(()=>{}); })); try{ await document.fonts.ready; }catch(_){}
  const imgs=new Map(); const coll=L=>L.forEach(e=>{ if(e.t==='i') imgs.set(e.svg,null); else if(e.t==='g') coll(e.L); }); pages.forEach(p=>coll(p.L));
  for(const svg of imgs.keys()){ try{ imgs.set(svg,await nbRaster(svg,240)); }catch(_){ } }
  const P0=pages[0]; const doc=new J({orientation:P0.w>P0.h?'l':'p',unit:'mm',format:[P0.w,P0.h],compress:true}); const TX=new Map(); let tid=0;
  const txt=(e,M,s)=>{ const rot=((Math.round(Math.atan2(M[1],M[0])/(Math.PI/2))%4)+4)%4; const key=[e.s,e.f,e.z,e.b,e.i,e.c,e.ls,rot].join('|'); let T=TX.get(key);
    if(!T){ const k=16, cv=document.createElement('canvas'), g=cv.getContext('2d'); const font=`${e.i?'italic ':''}${e.b?700:400} ${e.z*k}px ${e.f}`; g.font=font; try{ if(e.ls) g.letterSpacing=(e.ls*k)+'px'; }catch(_){ }
      const tw=g.measureText(e.s).width+(e.ls?e.ls*k*e.s.length:0), pad=e.z*k*.12, W=Math.ceil(tw+pad*2), H=Math.ceil(e.z*k*1.4); const rw=rot%2?H:W, rh=rot%2?W:H; cv.width=Math.max(1,rw); cv.height=Math.max(1,rh);
      g.translate(rw/2,rh/2); g.rotate(rot*Math.PI/2); g.translate(-W/2,-H/2); g.font=font; try{ if(e.ls) g.letterSpacing=(e.ls*k)+'px'; }catch(_){ } g.fillStyle=e.c; g.textBaseline='alphabetic'; g.fillText(e.s,pad,e.z*k*1.02);
      T={url:cv.toDataURL('image/png'),W:W/k,H:H/k,pad:pad/k,alias:'t'+(++tid)}; TX.set(key,T); }
    const ax=e.a==='m'?-(T.W-2*T.pad)/2:e.a==='e'?-(T.W-2*T.pad):0; const x0=e.x+ax-T.pad, y0=e.y-e.z*1.02; const c1=nbAp(M,x0,y0), c2=nbAp(M,x0+T.W,y0+T.H);
    doc.addImage(T.url,'PNG',Math.min(c1[0],c2[0]),Math.min(c1[1],c2[1]),Math.abs(c2[0]-c1[0]),Math.abs(c2[1]-c1[1]),T.alias,'FAST'); };
  let curDash=null; const dash=(d,s)=>{ const k=d?d.map(v=>v*s).join(','):''; if(k!==curDash){ doc.setLineDashPattern(d?d.map(v=>v*s):[],0); curDash=k; } };
  const sty=e=>e.f&&e.s?'FD':e.f?'F':'S'; const col=e=>{ if(e.s) doc.setDrawColor(e.s); if(e.f) doc.setFillColor(e.f); };
  const draw=(L,M)=>{ const s=Math.sqrt(Math.abs(M[0]*M[3]-M[1]*M[2])); for(const e of L){ switch(e.t){
    case 'l': { const a=nbAp(M,e.x1,e.y1), b=nbAp(M,e.x2,e.y2); doc.setDrawColor(e.c); doc.setLineWidth(e.w*s); dash(e.d,s); doc.setLineCap(e.cap==='round'?'round':'butt'); doc.line(a[0],a[1],b[0],b[1]); break; }
    case 'r': { const a=nbAp(M,e.x,e.y), b=nbAp(M,e.x+e.w,e.y+e.h); col(e); if(e.s){ doc.setLineWidth(e.sw*s); dash(e.d,s); } const x=Math.min(a[0],b[0]), y=Math.min(a[1],b[1]), w=Math.abs(b[0]-a[0]), h=Math.abs(b[1]-a[1]);
      if(e.rr) doc.roundedRect(x,y,w,h,e.rr*s,e.rr*s,sty(e)); else doc.rect(x,y,w,h,sty(e)); break; }
    case 'c': { const a=nbAp(M,e.x,e.y); col(e); if(e.s){ doc.setLineWidth(e.w*s); dash(e.d,s); } doc.circle(a[0],a[1],e.r*s,sty(e)); break; }
    case 'p': { const pts=[]; for(let i=0;i<e.pts.length;i+=2) pts.push(nbAp(M,e.pts[i],e.pts[i+1])); if(pts.length<2) break; col(e); if(e.s){ doc.setLineWidth(e.w*s); dash(e.d,s); } doc.setLineJoin('round');
      const d=[]; for(let i=1;i<pts.length;i++) d.push([pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]]); doc.lines(d,pts[0][0],pts[0][1],[1,1],sty(e),!!e.z); break; }
    case 't': txt(e,M,s); break;
    case 'pat': { const sx=e.sx, sy=e.sy||e.sx; dash(e.d,s);
      if(e.k==='dots'){ doc.setDrawColor(e.c); doc.setLineWidth(e.r*2*s); doc.setLineCap('round'); dash(null,s); for(let j=0;j<e.ny;j++) for(let i=0;i<e.nx;i++){ const a=nbAp(M,e.x+i*sx,e.y+j*sy); doc.line(a[0],a[1],a[0]+.001,a[1]); } }
      else { doc.setDrawColor(e.c); doc.setLineWidth(e.w*s); doc.setLineCap('butt'); const W=e.nx*sx, H=e.ny*sy; if(!e.nov) for(let i=0;i<=e.nx;i++){ const a=nbAp(M,e.x+i*sx,e.y), b=nbAp(M,e.x+i*sx,e.y+H); doc.line(a[0],a[1],b[0],b[1]); } if(!e.noh) for(let j=0;j<=e.ny;j++){ const a=nbAp(M,e.x,e.y+j*sy), b=nbAp(M,e.x+W,e.y+j*sy); doc.line(a[0],a[1],b[0],b[1]); } } break; }
    case 'i': { const u=imgs.get(e.svg); if(u){ const a=nbAp(M,e.x,e.y), b=nbAp(M,e.x+e.w,e.y+e.h); doc.addImage(u,'PNG',Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.abs(b[0]-a[0]),Math.abs(b[1]-a[1]),'i'+e.svg.length+'_'+(e.svg.charCodeAt(40)||0),'FAST'); } break; }
    case 'g': draw(e.L,nbMul(M,nbMul(e.m,nbTr(e.dx||0,0)))); break; } } };
  for(let i=0;i<pages.length;i++){ const p=pages[i]; if(i) doc.addPage([p.w,p.h],p.w>p.h?'l':'p'); curDash=null; draw(p.L,[1,0,0,1,0,0]); if(prog){ prog(i,pages.length); if(i%8===7) await new Promise(r=>setTimeout(r,0)); } }
  const blob=doc.output('blob'); return {blob,name}; }
function nbRaster(svg,px){ return new Promise((res,rej)=>{ const s=svg.replace(/<svg\b[^>]*?>/,m=>{ let a=m.replace(/\swidth="[^"]*"/,'').replace(/\sheight="[^"]*"/,'').replace(/\sstyle="[^"]*"/,''); if(!/xmlns=/.test(a)) a=a.replace('<svg','<svg xmlns="http://www.w3.org/2000/svg"'); return a.replace('<svg',`<svg width="${px}" height="${px}"`); });
  const im=new Image(); im.onload=()=>{ try{ const cv=document.createElement('canvas'); cv.width=px; cv.height=px; cv.getContext('2d').drawImage(im,0,0,px,px); res(cv.toDataURL('image/png')); }catch(e){ rej(e); } }; im.onerror=rej; im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s); }); }

/* ---------- costs ---------- */
function nbPaper(S){ const L=(st.shop&&st.shop.prices&&st.shop.prices.papers)||[]; return L.find(p=>p.id===S.paperId)||L.find(p=>p.id==='p80')||L[0]||{id:'p80',n:'Офисная 80 г/м²',g:80,c:10,p:20,sheet:'A4'}; }
function nbCalc(S,P,imp){ const C=S.cost, paper=nbPaper(S), qty=Math.max(1,Math.round(+S.pr.qty||1)); const per=imp.order==='copies'&&imp.k>1?imp.k:1;
  const sheets=imp.sheets.length/per, {w,h}=nbSize(S), frac=Math.min(2,(w*h)/(210*297)); const sf=(NB_SHEETS[S.pr.sheet]||NB_SHEETS.A4); const sheetFrac=(sf.w*sf.h)/(210*297);
  let inkC=0, inkP=0; const cls={l:0,m:0,h:0}; P.forEach(pg=>{ const T=NB_T[pg.type]||NB_T.blank, k=T.ink||'m'; cls[k]++; const r=C.ink[k]||{c:0,p:0}; inkC+=(+r.c||0)*frac; inkP+=(+r.p||0)*frac; });
  const bind=C.bind[S.binding]||{c:0,p:0}, cover=S.binding==='none'?{c:0,p:0}:C.cover||{c:0,p:0};
  const paperC=sheets*(+paper.c||0)*sheetFrac, paperP=sheets*(+paper.p||0)*sheetFrac;
  const one={paperC,paperP,inkC,inkP,bindC:+bind.c||0,bindP:+bind.p||0,coverC:+cover.c||0,coverP:+cover.p||0,labor:+C.labor||0};
  one.cost=one.paperC+one.inkC+one.bindC+one.coverC; one.price=one.paperP+one.inkP+one.bindP+one.coverP+one.labor;
  return {qty,paper,sheets,sheetsAll:Math.ceil(sheets*qty),cls,one,cost:one.cost*qty,price:Math.round(one.price*qty)}; }

/* ================= UI: tabs «Блок», «Готовые», «Печать» ================= */
const NB_IC={nb:'<rect x="6.5" y="3" width="13" height="18" rx="2"/><path d="M4 7h4M4 12h4M4 17h4M10.5 8h5.5M10.5 11.5h5.5"/>',up:'<path d="M12 19V5M6 11l6-6 6 6"/>',down:'<path d="M12 5v14M6 13l6 6 6-6"/>',dup:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  del:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',grip:'<circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',print:'<path d="M7 9V3h10v6M7 17H4v-7h16v7h-3"/><rect x="7" y="14" width="10" height="7"/>',pdf:'<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4M9 13h6M9 17h4"/>',zin:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5M8 11h6M11 8v6"/>',zout:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5M8 11h6"/>',
  ok:'<path d="M5 12l5 5 9-10"/>',cover:'<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 3v18M12 8h4"/>',order:'<path d="M9 5h10M9 12h10M9 19h10M4 5h1M4 12h1M4 19h1"/>',open:'<path d="M4 6h6l2 2h8v11H4z"/>',save:'<path d="M5 3h11l3 3v15H5z"/><path d="M8 3v6h8M8 21v-7h8v7"/>',flip:'<path d="M12 3v18"/><path d="M8 7l-4 5 4 5M16 7l4 5-4 5"/>',star:'<path d="M12 3l2.8 5.9 6.2.8-4.6 4.3 1.2 6.2L12 17.2 6.4 20.2l1.2-6.2L3 9.7l6.2-.8z"/>'};
const nbI=k=>KS.icon(NB_IC[k]||'');
const nbEsc=s=>KS.esc(s==null?'':String(s));
let nbPCache=null;
function nbSync(S){ const {w,h}=nbSize(S); S.w=w; S.h=h; const P=nbExpand(S); S.pages=P.length; const m=nbMode(S); S.padded=(m==='booklet'||m==='sig')?Math.ceil(P.length/4)*4:P.length; const pp=nbPaper(S); S.paperGsm=+pp.g||gsmOf(pp)||80; if(['staple','sewn'].includes(S.binding)) S.sides=2; return P; }
function nbPages(){ if(!nbPCache) nbPCache=nbSync(nbS()); return nbPCache; }
function nbLeaves(S,P){ P=P||nbPages(); const n=S.padded||P.length; return S.sides==1?n:Math.ceil(n/2); }
function nbSpine(S){ return nbLeaves(S)*nbThick(S); }
/* ---------- change pipeline ---------- */
let nbT1=0, nbT2=0, nbLoading=false;
function nbChg(o){ o=o||{}; const S=nbS(); nbPCache=null; NBC.map.clear(); NBC.ver++; nbPages(); KS.save(); try{ KS.emit('nbChanged'); }catch(e){}
  if(o.panel) nbPanelRefresh(); else nbKpiRefresh(); clearTimeout(nbT1); nbT1=setTimeout(()=>nbScreenRefresh(),o.now?0:140); if(!nbLoading){ clearTimeout(nbT2); nbT2=setTimeout(nbAutosave,800); } }
/* ---------- projects («Мои блокноты») ---------- */
function nbSnap(){ const S=nbS(), o={}; NB_SET_KEYS.forEach(k=>{ if(k in S) o[k]=nbClone(S[k]); }); return o; }
function nbLoad(obj,o){ if(!obj||typeof obj!=='object') return false; const S=nbS(); nbLoading=!!(o&&o.quiet); NB_SET_KEYS.forEach(k=>{ if(k in obj) S[k]=nbClone(obj[k]); });
  (S.secs||[]).forEach(s=>{ if(!s.id) s.id='s'+Math.random().toString(36).slice(2,9); if(!s.p) s.p={}; if(!s.ap) s.ap={}; }); S.ui.sel=''; S.ui.pg=0; nbS(); nbChg({panel:1,now:1}); nbLoading=false; return true; }
async function nbAutosave(){ const S=nbS(); try{ if(!S.cur){ S.cur=KS.uid('nb'); S.projs.unshift({id:S.cur,name:S.name||S.title||'Блокнот',upd:Date.now()}); }
    const m=S.projs.find(x=>x.id===S.cur)||(S.projs.unshift({id:S.cur,name:S.name||S.title||'Блокнот'}),S.projs[0]); m.upd=Date.now(); m.pages=S.pages; m.fmt=nbFmtName(S); m.name=S.name||m.name||S.title||'Блокнот';
    KS.save(); await KS.idb.set('nb:p:'+S.cur,nbSnap()); }catch(e){ console.error('[notebook] autosave',e); } }
async function nbOpenProj(id){ const S=nbS(); if(S.cur===id) return; await nbAutosave(); const d=await KS.idb.get('nb:p:'+id).catch(()=>null); if(!d){ KS.toast('Проект не найден'); return; } S.cur=id; nbLoad(d,{quiet:1}); KS.toast('Открыт блокнот «'+(S.name||S.title||'')+'»'); }
async function nbNewProj(snap,name){ await nbAutosave(); const S=nbS(); S.cur=KS.uid('nb'); S.projs.unshift({id:S.cur,name:name||'Блокнот',upd:Date.now()}); nbLoad(Object.assign(snap||{},{name:name||'Блокнот'}),{quiet:1}); await nbAutosave(); }
async function nbDupProj(id){ const S=nbS(); if(id===S.cur) await nbAutosave(); const d=await KS.idb.get('nb:p:'+id).catch(()=>null); if(!d) return; const m=S.projs.find(x=>x.id===id); const nid=KS.uid('nb'), name=((m&&m.name)||'Блокнот')+' (копия)'; d.name=name;
  await KS.idb.set('nb:p:'+nid,d); S.projs.unshift({id:nid,name,upd:Date.now(),pages:m&&m.pages,fmt:m&&m.fmt}); KS.save(); nbReadyRefresh(); KS.toast('Копия создана'); }
async function nbDelProj(id){ const S=nbS(); const m=S.projs.find(x=>x.id===id); if(!m) return; if(!confirm('Удалить блокнот «'+m.name+'»? Это нельзя отменить.')) return; S.projs=S.projs.filter(x=>x.id!==id); try{ await KS.idb.del('nb:p:'+id); }catch(_){ } if(S.cur===id) S.cur=''; KS.save(); nbReadyRefresh(); KS.toast('Блокнот удалён'); }
/* ---------- KS.nb API (shared contract) ---------- */
KS.nb={ get:()=>{ nbPages(); return nbS(); }, spineMM:()=>Math.round(nbSpine(nbS())*100)/100,
  coverSize:()=>{ const S=nbS(); nbPages(); const sp=Math.round(nbSpine(S)*100)/100, {w,h}=nbSize(S); if(S.binding==='perfect'||S.binding==='sewn') return {w:2*w+sp,h,spine:sp,wrap:true,over:0};
    const ov=['spiral','wireo','rings','disc'].includes(S.binding)?3:0; return {w:w+ov,h:h+2*ov,spine:sp,wrap:false,over:ov}; },
  onChange:fn=>KS.on('nbChanged',fn), load:(o)=>{ const ok=nbLoad(o); if(ok) nbAutosave(); return ok; }, snapshot:()=>nbSnap(),
  pages:()=>nbPages().map(pg=>({num:pg.num,type:pg.type,sec:pg.sec&&pg.sec.id,verso:pg.v})), pageSVG:(i,attrs)=>{ const S=nbS(), P=nbPages(), pg=P[i]; if(!pg) return ''; return nbSVG(nbPageL(S,pg),S.w,S.h,attrs); },
  typeSVG:(type,params,attrs)=>nbTypeSVG(nbS(),type,params,attrs), types:()=>Object.values(NB_T).map(t=>({id:t.id,n:t.n,cat:t.cat,ink:t.ink})),
  plan:()=>{ const S=nbS(), P=nbPages(), imp=nbImpose(S,P); return {mode:imp.mode,perSheet:imp.k,rot:imp.rot,sheets:imp.sheets.map(s=>({front:nbOrd(imp,P,s.front,0),back:s.back?nbOrd(imp,P,s.back,1):null}))}; },
  printPages:(kind)=>{ const S=nbS(), P=nbPages(); return nbJob(S,P,nbImpose(S,P),kind||'all').map(nbPrintPage); }, show:(sub)=>KS.show('notebook',sub||'nbblock') };
/* page numbers of one sheet side in reading order (as the person sees that side) */
function nbOrd(imp,P,pl,back){ return pl.filter(x=>!x.mark).map(x=>{ const c=nbAp(x.m,imp.u.pw/2,imp.u.ph/2), X=Math.round(c[0]), Y=Math.round(c[1]); return {k:imp.rot?(back?[X,-Y]:[-X,Y]):[Y,X],n:x.pg>=0&&P[x.pg]?P[x.pg].num:0}; }).sort((a,b)=>a.k[0]-b.k[0]||a.k[1]-b.k[1]).map(o=>o.n); }
function nbTypeSVG(S,type,params,attrs){ const T=NB_T[type]; if(!T) return ''; const S2=Object.assign({},S,{secs:[]}); const pg={type,p:nbParams(T,params||{}),sec:{id:'x',type,n:1},si:0,k:2,v:false,num:3,toc:[{n:'Календарь',p:4},{n:'Точки',p:16},{n:'Списки',p:96}]}; const {w,h}=nbSize(S); return nbSVG(nbPageList(S2,pg),w,h,attrs||'width="100%" height="100%"'); }

/* ---------- presets ---------- */
const NB_SY=(()=>{ const d=new Date(); return d.getMonth()>=7?d.getFullYear():d.getFullYear()-1; })();
const NB_PRESETS=[
 {id:'t48',n:'Тетрадь 48 листов, клетка',d:'A5 · скоба · клетка 5 мм с полями',show:0,set:{fmt:'A5',binding:'staple',paperId:'p80',st:{c:'#7d9cc4',pn:'none',mt:5,mb:5,mo:5,gutter:5},secs:[['school',96]]}},
 {id:'t18',n:'Тетрадь 18 листов, линейка',d:'A5 · скоба · широкая линейка с полями',show:0,set:{fmt:'A5',binding:'staple',st:{c:'#7d9cc4',pn:'none',margin:true,mdist:20,mt:8,mb:6,mo:6,gutter:8},secs:[['lined',36,{s:8,m:true}]]}},
 {id:'bujo',n:'Bullet journal A5, точки',d:'A5 · шитьё · содержание, год, 12 месяцев, точки',show:3,set:{fmt:'A5',binding:'sewn',st:{c:'#8b9099'},secs:[['title',1],['contents',2],['year',1],['monthly',24,{sp:true}],['dots',150]]}},
 {id:'diary',n:'Ежедневник '+NB_Y,d:'A5 · клей · день на странице, 365 дней',show:3,set:{fmt:'A5',binding:'perfect',start:NB_Y+'-01',st:{c:'#a79a8a'},secs:[['title',1],['year',1],['monthly',12],['daily',365],['notes',12]]}},
 {id:'week',n:'Планер на неделю',d:'A5 · пружина · неделя на развороте',show:3,set:{fmt:'A5',binding:'spiral',start:NB_Y+'-01',st:{c:'#7fa7d9',gutter:14},secs:[['title',1],['year',1],['monthly',12],['weekly',106,{sp:true,lay:'v'}],['notes',8]]}},
 {id:'sketch',n:'Скетчбук',d:'A4 · пружина · плотная бумага, одна сторона',show:0,set:{fmt:'A4',binding:'spiral',sides:1,paperId:'p160',st:{pn:'none'},secs:[['blank',40]]}},
 {id:'recipe',n:'Книга рецептов',d:'A5 · кольца · содержание и 60 рецептов',show:2,set:{fmt:'A5',binding:'rings',st:{c:'#c49a6c',gutter:20},secs:[['title',1],['contents',2,{auto:false}],['recipe',60]]}},
 {id:'kids',n:'Прописи для детей',d:'A5 · скоба · 3 линии и косая линейка',show:0,set:{fmt:'A5',binding:'staple',st:{c:'#7d9cc4',mt:8,mb:8},secs:[['propisi',8,{tx:'Аа Бб Вв'}],['kosaya',8]]}},
 {id:'music',n:'Нотная тетрадь',d:'A4 · пружина · 10 станов на странице',show:0,set:{fmt:'A4',binding:'spiral',st:{c:'#6d7480'},secs:[['music',40]]}},
 {id:'cornell',n:'Конспект Корнелл',d:'B5 · пружина · поле вопросов и итоги',show:0,set:{fmt:'B5',binding:'spiral',st:{c:'#8da2bb',gutter:14},secs:[['cornell',80]]}},
 {id:'travel',n:'Трэвел-бук',d:'Traveler’s 110 × 210 · скоба · план, вещи, точки',show:1,set:{fmt:'tn',binding:'staple',st:{c:'#a0927f'},secs:[['title',1],['travel',4],['packing',2],['dots',41]]}},
 {id:'school',n:'Дневник школьника',d:'A5 · шитьё · расписание и недели с датами',show:2,set:{fmt:'A5',binding:'sewn',start:NB_SY+'-09',st:{c:'#7d9cc4'},secs:[['title',1],['timetable',2],['diary',72],['notes',5]]}},
 {id:'lab',n:'Лабораторный журнал',d:'A4 · пружина · шапка эксперимента и клетка',show:1,set:{fmt:'A4',binding:'spiral',st:{c:'#7a8fa8'},secs:[['title',1],['contents',2],['lab',100]]}},
 {id:'ledger',n:'Кассовая книга',d:'A4 · клей · приход, расход, остаток',show:0,set:{fmt:'A4',binding:'perfect',st:{c:'#6f8a73'},secs:[['ledger',96]]}},
 {id:'attend',n:'Журнал посещаемости',d:'A4 альбомный · пружина · 25 строк × 31 день',show:0,set:{fmt:'A4',land:true,binding:'spiral',st:{c:'#7a8fa8',gutter:14},secs:[['attend',24]]}},
 {id:'wed',n:'Свадебный планер',d:'A5 · кольца · подготовка, бюджет, гости',show:1,set:{fmt:'A5',binding:'rings',font:'serif',st:{c:'#c9a3a8',gutter:20},secs:[['title',1],['wedding',2,{v:'plan'}],['wedding',2,{v:'budget'}],['wedding',4,{v:'guests'}],['checklist',4],['dots',18]]}},
 {id:'baby',n:'Дневник малыша',d:'A5 · пружина · кормление, сон, подгузники',show:1,set:{fmt:'A5',binding:'spiral',st:{c:'#9bb7c9'},secs:[['title',1],['baby',90,{dt:false}]]}},
 {id:'fit',n:'Фитнес-дневник',d:'A5 · пружина · тренировки, замеры, привычки',show:0,set:{fmt:'A5',binding:'spiral',st:{c:'#7f9f8a'},secs:[['measure',4],['habit',12],['workout',80]]}},
 {id:'grat',n:'Дневник благодарности',d:'A6 · скоба · 2 записи на странице',show:0,set:{fmt:'A6',binding:'staple',st:{c:'#c4a484'},secs:[['gratitude',48]]}},
 {id:'zettel',n:'Карточки Zettelkasten',d:'A6 · без переплёта · 4 карточки на A4',show:0,set:{fmt:'A6',binding:'none',sides:1,paperId:'p160',st:{c:'#8da2bb',mt:7,mb:7,mo:6,gutter:6,pn:'none'},secs:[['zettel',100]]}},
 {id:'graph',n:'Миллиметровка A4',d:'A4 · пружина · сетка 1/5/10 мм',show:0,set:{fmt:'A4',binding:'spiral',st:{pn:'outer'},secs:[['graph',50]]}},
 {id:'calli',n:'Тетрадь для каллиграфии',d:'A4 · пружина · строки и наклон 55°',show:0,set:{fmt:'A4',binding:'spiral',st:{c:'#9a8f86'},secs:[['calli',40]]}},
 {id:'hanzi',n:'Китайские прописи 米字格',d:'A5 · скоба · клетки с диагоналями',show:0,set:{fmt:'A5',binding:'staple',st:{c:'#c98a8a'},secs:[['mizige',32,{py:true}]]}},
 {id:'pocket',n:'Карманный блокнот',d:'Pocket 90 × 140 · скоба · линейка',show:0,set:{fmt:'pocket',binding:'staple',st:{c:'#8b9099',mt:7,mb:8,mo:6,gutter:7},secs:[['lined',32,{s:6}]]}},
 {id:'project',n:'Проектный блокнот',d:'A5 · wire-o · цели, Гант, карта мыслей',show:2,set:{fmt:'A5',land:false,binding:'wireo',st:{c:'#7fa7d9',gutter:14},secs:[['title',1],['goals',4],['gantt',4],['mindmap',6],['cornell',40]]}},
 {id:'mixed',n:'Блокнот «два в одном»',d:'A5 · пружина · слева линейка, справа точки',show:0,set:{fmt:'A5',binding:'spiral',st:{c:'#8da2bb',gutter:14},secs:[['dots',80,{},{alt:'lined'}]]}}];
function nbPresetSnap(pr){ const s=pr.set, S0=nbS(); const out={fmt:s.fmt||'A5',land:!!s.land,cw:S0.cw,ch:S0.ch,binding:s.binding||'staple',sides:s.sides||2,paperId:s.paperId||'p80',font:s.font||'golos',lang:S0.lang,start:s.start||S0.start,year:S0.year,title:pr.n,owner:S0.owner,name:pr.n,
    st:Object.assign(nbClone(NB_DEF.st),s.st||{}),hov:{},pr:Object.assign(nbClone(S0.pr),{imp:'auto',range:''},s.pr||{}),
    secs:(s.secs||[]).map(a=>nbSecDef(a[0],a[1],nbClone(a[2]||{}),a[3]||{}))}; return out; }
async function nbApplyPreset(id){ const pr=NB_PRESETS.find(x=>x.id===id)||nbS().my.find(x=>x.id===id); if(!pr) return; const snap=pr.set?nbPresetSnap(pr):nbClone(pr.data); await nbNewProj(snap,pr.n); KS.show('notebook','nbblock'); KS.toast('Готово: «'+pr.n+'». Измените разделы и печатайте.'); }
function nbSaveMyPreset(){ const S=nbS(); const n=prompt('Название шаблона',S.name||S.title||'Мой шаблон'); if(!n) return; S.my.unshift({id:KS.uid('my'),n:n.slice(0,60),d:nbFmtName(S)+' · '+S.pages+' стр.',data:nbSnap()}); KS.save(); nbReadyRefresh(); KS.toast('Шаблон сохранён в «Мои шаблоны»'); }

/* ================= panel «Блок» ================= */
let nbBox=null, nbScr=null, nbView=null;
const nbSec=id=>nbS().secs.find(s=>s.id===id);
function nbParamHTML(T,p,pre){ return (T.par||[]).map(d=>{ const v=p[d.k]; const k=pre+d.k;
  if(d.t==='q') return `<div class="flexw nb-q">${d.o.map(([n,o],i)=>`<button class="btn sm" data-nbq="${pre}" data-q="${nbEsc(JSON.stringify(o))}">${nbEsc(n)}</button>`).join('')}</div>`;
  if(d.t==='n') return `<label class="f nb-num">${nbEsc(d.n)}${d.u?` <i>${nbEsc(d.u)}</i>`:''}<span class="nb-step"><button class="btn sm" data-nbstep="${k}" data-d="-${d.step}" aria-label="Меньше">−</button><input type="number" data-k="${k}" value="${nbEsc(v)}" min="${d.min}" max="${d.max}" step="${d.step}" inputmode="decimal"><button class="btn sm" data-nbstep="${k}" data-d="${d.step}" aria-label="Больше">+</button></span></label>`;
  if(d.t==='s') return `<label class="f">${nbEsc(d.n)}<select data-k="${k}">${d.o.map(([a,b])=>`<option value="${nbEsc(a)}"${String(v)===String(a)?' selected':''}>${nbEsc(b)}</option>`).join('')}</select></label>`;
  if(d.t==='c') return `<label class="chk"><input type="checkbox" data-k="${k}"${v?' checked':''}> ${nbEsc(d.n)}</label>`;
  if(d.t==='x') return `<label class="f">${nbEsc(d.n)}<input type="text" data-k="${k}" value="${nbEsc(v)}"></label>`;
  if(d.t==='m'){ const S=nbS(), b=nbYM(S.start), L=NB_L.ru.m, opts=[]; for(let i=-12;i<=24;i++){ const t=b.m+i, y=b.y+Math.floor(t/12), m=((t%12)+12)%12; opts.push([`${y}-${String(m+1).padStart(2,'0')}`,`${L[m]} ${y}`]); }
    if(v&&!opts.some(o=>o[0]===v)) opts.unshift([v,v]); return `<label class="f">${nbEsc(d.n)}<select data-k="${k}"><option value="">Как у блокнота (${nbEsc(L[b.m]+' '+b.y)})</option>${opts.map(([a,c])=>`<option value="${a}"${a===v?' selected':''}>${c}</option>`).join('')}</select></label>`; }
  if(d.t==='col') return `<label class="f">${nbEsc(d.n)}<span class="ks-row"><input type="color" data-k="${k}" value="${nbEsc(v||'#8da2bb')}"><button class="btn sm" data-nbset="${k}" data-v="">Как у блокнота</button></span></label>`;
  return ''; }).join(''); }
function nbTypeOpts(sel,empty){ return (empty?`<option value="">${nbEsc(empty)}</option>`:'')+NB_CATS.map(([c,cn])=>`<optgroup label="${nbEsc(cn)}">${Object.values(NB_T).filter(t=>t.cat===c).map(t=>`<option value="${t.id}"${t.id===sel?' selected':''}>${nbEsc(t.n)}</option>`).join('')}</optgroup>`).join(''); }
function nbSecHTML(sec,i,S,P){ const T=NB_T[sec.type]||NB_T.blank, on=S.ui.sel===sec.id, f=P.first&&P.first[sec.id];
  const range=f!=null&&sec.n>0?`стр. ${P[f].num}${sec.n>1?'–'+P[Math.min(P.length-1,f+sec.n-1)].num:''}`:'';
  return `<div class="nb-sec${on?' on':''}" data-sec="${sec.id}" draggable="${matchMedia('(pointer:fine)').matches?'true':'false'}">
   <div class="nb-sech"><span class="nb-grip" title="Перетащите, чтобы изменить порядок">${nbI('grip')}</span><button class="nb-secn" data-nbsel="${sec.id}"><span class="nb-secth" data-nbth="${sec.type}"></span><span><b>${nbEsc(sec.name||T.n)}</b><small>${sec.alt?'чередуется с «'+nbEsc((NB_T[sec.alt]||{}).n||'')+'» · ':''}${range}</small></span></button>
   <span class="nb-step nb-cnt"><button class="btn sm" data-nbstep="sec:${sec.id}:n" data-d="-1" aria-label="Меньше страниц">−</button><input type="number" data-k="sec:${sec.id}:n" value="${sec.n}" min="0" max="999" inputmode="numeric" aria-label="Страниц"><button class="btn sm" data-nbstep="sec:${sec.id}:n" data-d="1" aria-label="Больше страниц">+</button></span></div>
   ${on?`<div class="nb-secb"><div class="nb-secbar"><button class="btn sm" data-nbmv="${sec.id}" data-d="-1" title="Выше" aria-label="Выше"${i===0?' disabled':''}>${nbI('up')}</button><button class="btn sm" data-nbmv="${sec.id}" data-d="1" title="Ниже" aria-label="Ниже"${i===S.secs.length-1?' disabled':''}>${nbI('down')}</button><button class="btn sm" data-nbdup="${sec.id}" title="Дублировать">${nbI('dup')} Копия</button><span class="ks-sp"></span><button class="btn sm danger" data-nbdel="${sec.id}" title="Удалить раздел">${nbI('del')}</button></div>
     <label class="f">Тип страницы<select data-k="sec:${sec.id}:type">${nbTypeOpts(sec.type)}</select></label>${T.hint?`<p class="hint">${nbEsc(T.hint)}</p>`:''}
     <div class="nb-params">${nbParamHTML(T,nbParams(T,sec.p),'sec:'+sec.id+':p:')}</div>
     <details class="nb-more"${sec.alt||sec.ht||sec.name?' open':''}><summary>Заголовок, чередование, название</summary>
       <label class="f">Текст в шапке страниц<input type="text" data-k="sec:${sec.id}:ht" value="${nbEsc(sec.ht)}" placeholder="например: Конспекты · стр. {n}"></label>
       <label class="f">Левые страницы (чередование)<select data-k="sec:${sec.id}:alt">${nbTypeOpts(sec.alt,'Такие же, как правые')}</select></label>
       ${sec.alt&&NB_T[sec.alt]?`<div class="nb-params">${nbParamHTML(NB_T[sec.alt],nbParams(NB_T[sec.alt],sec.ap),'sec:'+sec.id+':ap:')}</div>`:''}
       <label class="f">Название для содержания<input type="text" data-k="sec:${sec.id}:name" value="${nbEsc(sec.name||'')}" placeholder="${nbEsc(T.n)}"></label></details></div>`:''}</div>`; }
function nbKpis(S,P){ const imp=nbImpose(S,P), leaves=nbLeaves(S,P), per=imp.order==='copies'&&imp.k>1?imp.k:1;
  return {imp,leaves,sheets:imp.sheets.length,per,spine:nbSpine(S)}; }
function nbKpiHTML(S,P){ const K=nbKpis(S,P); return `<div class="nb-kpi"><b>${P.length}</b><small>страниц${S.padded>P.length?` · +${S.padded-P.length} пуст.`:''}</small></div><div class="nb-kpi"><b>${K.leaves}</b><small>листов в блоке</small></div><div class="nb-kpi"><b>${K.sheets}</b><small>листов ${nbEsc(K.imp.sheet.n)}${K.per>1?' на '+K.per+' шт.':''}</small></div><div class="nb-kpi"><b>${nbMM(K.spine)}</b><small>мм корешок</small></div>`; }
function nbFmtTiles(S){ return NB_FMTS.map(f=>{ const on=S.fmt===f[0]; let w=f[2]||150, h=f[3]||200; const k=22/Math.max(w,h);
  return `<button class="nb-fmt${on?' on':''}" data-nbfmt="${f[0]}" title="${nbEsc(f[1])}${f[2]?' · '+f[2]+' × '+f[3]+' мм':''}"><i style="width:${(w*k).toFixed(1)}px;height:${(h*k).toFixed(1)}px">${f[0]==='custom'?'?':''}</i><b>${nbEsc(f[0]==='sq140'?'14×14':f[0]==='sq210'?'21×21':f[0]==='mole'?'Moleskine':f[0]==='halfletter'?'½ Letter':f[1])}</b></button>`; }).join(''); }
function nbPanelBlock(box){ const S=nbS(), P=nbPages(), st=S.st; const sec=nbSec(S.ui.sel), selPg=S.ui.pg&&P.find(p=>p.num===S.ui.pg);
  box.innerHTML=`<div class="card nb-kpis" data-nbkpi>${nbKpiHTML(S,P)}</div>
  <div class="card"><div class="hd">Формат <span class="hint" style="margin-left:auto">${nbEsc(nbFmtName(S))}</span></div>
    <div class="nb-fmts">${nbFmtTiles(S)}</div>
    <div class="ks-row"><div class="seg"><button data-nbland="0"${!S.land?' class="on"':''}>Книжная</button><button data-nbland="1"${S.land?' class="on"':''}>Альбомная</button></div></div>
    ${S.fmt==='custom'?`<div class="row2"><label class="f">Ширина, мм<input type="number" data-k="cw" value="${S.cw}" min="40" max="420"></label><label class="f">Высота, мм<input type="number" data-k="ch" value="${S.ch}" min="40" max="420"></label></div>`:''}</div>
  <div class="card nb-secs"><div class="hd">Разделы <span class="hint" style="margin-left:auto">${S.secs.length} · ${P.length} стр.</span></div>
    ${S.secs.length?`<div class="nb-seclist">${S.secs.map((s,i)=>nbSecHTML(s,i,S,P)).join('')}</div>`:'<div class="ks-empty">Добавьте первый раздел: титул, календарь, клетку или что угодно из 50 видов страниц.</div>'}
    <button class="btn primary nb-add" data-nba="add">${nbI('plus')} Добавить раздел</button>
    ${selPg?`<div class="nb-pgsel"><div class="hd2">Страница ${selPg.num}</div><label class="f">Свой текст в шапке только этой страницы<input type="text" data-k="hov:${selPg.num}" value="${nbEsc(S.hov[selPg.num]||'')}" placeholder="пусто — как у раздела"></label></div>`:''}</div>
  <div class="card"><div class="hd">Блокнот</div>
    <div class="row2"><label class="f">Название<input type="text" data-k="title" value="${nbEsc(S.title)}"></label><label class="f">Владелец<input type="text" data-k="owner" value="${nbEsc(S.owner)}" placeholder="Имя на титуле"></label></div>
    <div class="ks-row nb-proj"><span class="grow hint">Проект: <b>${nbEsc(S.name||S.title||'Блокнот')}</b> · сохраняется сам</span><button class="btn sm" data-nba="ready">${nbI('open')} Мои блокноты</button></div></div>
  <details class="card nb-det" data-nbdet="style"${nbOpenD('style')?' open':''}><summary class="hd">Оформление линий</summary>
    <div class="nb-cols">${NB_COLS.map(([c,n])=>`<button class="nb-col${st.c===c?' on':''}" data-nbset="st.c" data-v="${c}" title="${nbEsc(n)}" style="--c:${c}"></button>`).join('')}<label class="nb-col nb-colc" title="Свой цвет"><input type="color" data-k="st.c" value="${nbEsc(st.c)}"></label></div>
    <div class="hd2">Толщина</div><div class="seg">${[[.1,'0,1'],[.15,'0,15'],[.2,'0,2'],[.3,'0,3'],[.45,'0,45']].map(([v,n])=>`<button data-nbset="st.lw" data-v="${v}"${+st.lw===v?' class="on"':''}>${n}</button>`).join('')}</div>
    <label class="f">Насыщенность: ${st.op}%<input type="range" min="20" max="100" step="5" data-k="st.op" value="${st.op}"></label>
    <div class="hd2">Шрифт надписей</div><div class="seg">${Object.entries(NB_FONTS).map(([k,f])=>`<button data-nbset="font" data-v="${k}"${S.font===k?' class="on"':''}>${f[1]}</button>`).join('')}</div>
    <label class="chk"><input type="checkbox" data-k="st.margin"${st.margin?' checked':''}> Линия полей на всех линованных страницах</label>
    ${st.margin?`<div class="row3"><label class="f">Цвет<input type="color" data-k="st.mc" value="${nbEsc(st.mc)}"></label><label class="f">Сторона<select data-k="st.mside">${[['outer','Снаружи'],['inner','У корешка'],['left','Слева'],['right','Справа']].map(([a,b])=>`<option value="${a}"${st.mside===a?' selected':''}>${b}</option>`).join('')}</select></label><label class="f">Отступ, мм<input type="number" data-k="st.mdist" value="${st.mdist}" min="5" max="60"></label></div>`:''}
    <label class="chk"><input type="checkbox" data-k="st.hdr"${st.hdr?' checked':''}> Шапка с полем даты</label>
    ${st.hdr?`<div class="row2"><label class="f">Текст шапки<input type="text" data-k="st.hdrText" value="${nbEsc(st.hdrText)}" placeholder="{title} · {n}"></label><label class="chk" style="align-self:end"><input type="checkbox" data-k="st.hdrDate"${st.hdrDate?' checked':''}> Поле «Дата»</label></div>`:''}
  </details>
  <details class="card nb-det" data-nbdet="page"${nbOpenD('page')?' open':''}><summary class="hd">Поля, номера, переплёт</summary>
    <div class="row2"><label class="f">Сверху, мм<input type="number" data-k="st.mt" value="${st.mt}" min="5" max="40"></label><label class="f">Снизу, мм<input type="number" data-k="st.mb" value="${st.mb}" min="5" max="40"></label><label class="f">Снаружи, мм<input type="number" data-k="st.mo" value="${st.mo}" min="5" max="40"></label><label class="f">У корешка, мм<input type="number" data-k="st.gutter" value="${st.gutter}" min="5" max="45"></label></div>
    <label class="chk"><input type="checkbox" data-k="st.mirror"${st.mirror?' checked':''}> Зеркальные поля (корешок слева у правых страниц и справа у левых)</label>
    ${nbGutterWarn(S)}
    <p class="hint">Рамка 5 мм по краю листа не печатается на GX4040 — поля меньше 5 мм программа не даст.</p>
    <div class="row2"><label class="f">Номер страницы<select data-k="st.pn">${[['outer','Снаружи внизу'],['center','По центру'],['inner','У корешка'],['none','Без номеров']].map(([a,b])=>`<option value="${a}"${st.pn===a?' selected':''}>${b}</option>`).join('')}</select></label><label class="f">Начать с<input type="number" data-k="st.pnStart" value="${st.pnStart}" min="0" max="999"></label></div>
    <label class="chk"><input type="checkbox" data-k="st.pnTitle"${st.pnTitle?' checked':''}> Номер и на титуле</label>
    <label class="chk"><input type="checkbox" data-k="st.logo"${st.logo?' checked':''}${KS.thSVG?'':' disabled'}> Маленький знак TH внизу страницы${KS.thSVG?'':' (нужен модуль открыток)'}</label>
    <label class="f">Линия отрыва<select data-k="st.perf">${[['none','Нет'],['inner','У корешка (вертикальная)'],['top','Сверху'],['bottom','Снизу']].map(([a,b])=>`<option value="${a}"${st.perf===a?' selected':''}>${b}</option>`).join('')}</select></label>
    <label class="chk"><input type="checkbox" data-k="st.holes"${st.holes?' checked':''}> Метки отверстий для пружины, колец и дисков</label>
    ${S.binding==='rings'?`<label class="chk"><input type="checkbox" data-k="st.holes4"${st.holes4?' checked':''}> 4 отверстия (для A4 и B5; меньше — 2)</label>`:''}
  </details>
  <details class="card nb-det" data-nbdet="cal"${nbOpenD('cal')?' open':''}><summary class="hd">Календарь и язык</summary>
    <div class="seg nb-lang">${[['ru','Русский'],['hy','Հայերեն'],['en','English']].map(([k,n])=>`<button data-nbset="lang" data-v="${k}"${S.lang===k?' class="on"':''}>${n}</button>`).join('')}</div>
    <div class="row2"><label class="f">Первый месяц<input type="month" data-k="start" value="${nbEsc(S.start)}"></label><label class="f">Год на титуле<input type="number" data-k="year" value="${nbEsc(S.year)}" min="1900" max="2100"></label></div>
    <p class="hint">Месяцы, дни недели и надписи на страницах — на выбранном языке. Неделя начинается с понедельника.</p></details>`;
  nbThumbs(box); }
function nbOpenD(k){ const o=nbS().ui.opens; return !!(o&&o[k]); }
function nbGutterWarn(S){ const need=NB_HOLE_MIN[S.binding]; if(!need||(+S.st.gutter||0)>=need) return ''; return `<div class="nb-warn">${nbEsc(NB_BIND.find(b=>b[0]===S.binding)[1])}: поле у корешка лучше ≥ ${need} мм, сейчас ${S.st.gutter}. <button class="btn sm" data-nbset="st.gutter" data-v="${need}">Сделать ${need} мм</button></div>`; }
function nbThumbs(box){ const S=nbS(); box.querySelectorAll('[data-nbth]').forEach(el=>{ if(el.firstChild) return; el.innerHTML=nbTypeSVG(S,el.dataset.nbth,{}); }); }
function nbPanelRefresh(){ if(!nbBox||!nbBox.isConnected) return; const a=KS.active(); if(!a) return; const y=(document.querySelector('.panels')||{}).scrollTop||0;
  nbKeep(nbBox,()=>{ if(a.id==='nbblock') nbPanelBlock(nbBox); else if(a.id==='nbprint') nbPanelPrint(nbBox); else if(a.id==='nbready') nbPanelReady(nbBox); }); const ps=document.querySelector('.panels'); if(ps) ps.scrollTop=y; }
function nbKeep(box,fn){ const a=document.activeElement, key=a&&box.contains(a)&&a.dataset&&a.dataset.k; let pos=null; try{ pos=key&&a.selectionStart!=null?[a.selectionStart,a.selectionEnd]:null; }catch(_){ } fn(); if(!key) return; const n=box.querySelector(`[data-k="${CSS.escape(key)}"]`); if(n&&n!==a){ n.focus({preventScroll:true}); if(pos) try{ n.setSelectionRange(pos[0],pos[1]); }catch(_){ } } }
function nbKpiRefresh(){ if(!nbBox||!nbBox.isConnected) return; const S=nbS(), P=nbPages(); const k=nbBox.querySelector('[data-nbkpi]'); if(k) k.innerHTML=nbKpiHTML(S,P); const c=nbBox.querySelector('[data-nbcost]'); if(c) c.innerHTML=nbCostHTML(S,P); }
/* set value by path */
function nbSet(path,val,el){ const S=nbS(); let structural=false;
  if(path.startsWith('sec:')){ const [,id,k,pk]=path.split(':'); const sec=nbSec(id); if(!sec) return;
    if(k==='n'){ sec.n=Math.max(0,Math.min(999,Math.round(+val||0))); }
    else if(k==='type'){ sec.type=val; sec.p={}; structural=true; } else if(k==='alt'){ sec.alt=val; sec.ap={}; structural=true; }
    else if(k==='p'||k==='ap'){ const T=NB_T[k==='p'?sec.type:sec.alt]; const d=T&&T.par.find(x=>x.k===pk); if(!d) return; sec[k]=sec[k]||{}; sec[k][pk]=d.t==='n'?Math.max(d.min,Math.min(d.max,+val)):val; if(d.t==='c'||d.t==='s') structural=d.t==='s'&&false; }
    else sec[k]=val; nbChg({panel:structural}); if(!structural&&k==='n') nbSecRangeRefresh(); return; }
  if(path.startsWith('hov:')){ const n=+path.slice(4); if(val) S.hov[n]=val; else delete S.hov[n]; nbChg(); return; }
  const ks=path.split('.'); let o=S; for(let i=0;i<ks.length-1;i++) o=o[ks[i]]; const last=ks[ks.length-1];
  if(['cw','ch','year','st.mt','st.mb','st.mo','st.gutter','st.mdist','st.pnStart','st.op','st.lw','pr.qty','pr.sig','pr.creepMM','pr.gap','pr.nup','cost.labor'].includes(path)||/^cost\./.test(path)) val=+val||0;
  o[last]=val; const rebuild=['st.margin','st.hdr','binding','sides','pr.imp','font','lang','st.c','st.lw','pr.creep','pr.order','pr.sheet','st.holes'].includes(path)||/^st\.(mirror|gutter)$/.test(path)&&el&&el.type==='checkbox';
  nbChg({panel:rebuild||(el&&(el.type==='checkbox'||el.tagName==='SELECT'))}); }
function nbSecRangeRefresh(){ if(!nbBox) return; const S=nbS(), P=nbPages(); nbBox.querySelectorAll('.nb-sec').forEach(el=>{ const sec=nbSec(el.dataset.sec); if(!sec) return; const f=P.first[sec.id]; const sm=el.querySelector('.nb-secn small'); if(sm) sm.textContent=(sec.alt?'чередуется с «'+((NB_T[sec.alt]||{}).n||'')+'» · ':'')+(f!=null&&sec.n>0?`стр. ${P[f].num}${sec.n>1?'–'+P[Math.min(P.length-1,f+sec.n-1)].num:''}`:''); });
  const h=nbBox.querySelector('.nb-secs .hd .hint'); if(h) h.textContent=`${S.secs.length} · ${P.length} стр.`; }
function nbAddSec(type){ const S=nbS(); const T=NB_T[type]; if(!T) return; const n=T.date==='m'?12:T.date==='d'?31:T.date==='w'?(T.spread?8:4):['title'].includes(type)?1:type==='contents'?2:type==='year'||type==='pixels'?1:16;
  const sec=nbSecDef(type,n); const i=S.secs.findIndex(s=>s.id===S.ui.sel); S.secs.splice(i<0?S.secs.length:i+1,0,sec); S.ui.sel=sec.id; nbChg({panel:1}); KS.toast('Раздел «'+T.n+'» добавлен'); return sec; }
function nbMove(id,d){ const S=nbS(), i=S.secs.findIndex(s=>s.id===id), j=i+d; if(i<0||j<0||j>=S.secs.length) return; const [x]=S.secs.splice(i,1); S.secs.splice(j,0,x); nbChg({panel:1}); }
function nbDupSec(id){ const S=nbS(), i=S.secs.findIndex(s=>s.id===id); if(i<0) return; const c=nbClone(S.secs[i]); c.id='s'+Math.random().toString(36).slice(2,9); S.secs.splice(i+1,0,c); S.ui.sel=c.id; nbChg({panel:1}); }
function nbDelSec(id){ const S=nbS(); const sec=nbSec(id); if(!sec) return; const keep=nbClone(sec), i=S.secs.indexOf(sec); S.secs.splice(i,1); if(S.ui.sel===id) S.ui.sel=''; nbChg({panel:1});
  nbUndoToast('Раздел удалён',()=>{ S.secs.splice(Math.min(i,S.secs.length),0,keep); S.ui.sel=keep.id; nbChg({panel:1}); }); }
function nbUndoToast(msg,fn){ KS.toast(msg); let t=document.getElementById('nbUndo'); if(!t){ t=document.createElement('div'); t.id='nbUndo'; t.className='nb-undo glass'; document.body.appendChild(t); } t.innerHTML=`<span>${nbEsc(msg)}</span><button class="btn sm primary">Вернуть</button>`; t.hidden=false; t.querySelector('button').onclick=()=>{ t.hidden=true; fn(); }; clearTimeout(t._t); t._t=setTimeout(()=>{ t.hidden=true; },6000); }
/* type picker */
let nbPick=null;
function nbPicker(){ const S=nbS(); nbPick=nbPick||KS.modal({id:'nbtypes',title:'Добавить раздел',wide:true}); const cat=S.ui.cat||'';
  nbPick.el.innerHTML=`<div class="seg nb-pcats"><button data-nbcat=""${!cat?' class="on"':''}>Все</button>${NB_CATS.map(([c,n])=>`<button data-nbcat="${c}"${cat===c?' class="on"':''}>${n}</button>`).join('')}</div>
   <div class="nb-pgrid">${Object.values(NB_T).filter(t=>!cat||t.cat===cat).map(t=>`<button class="nb-ptile" data-nbpick="${t.id}"><span class="nb-pth" data-nbpth="${t.id}" style="aspect-ratio:${S.w}/${S.h}"></span><b>${nbEsc(t.n)}</b><small>${nbEsc(t.hint||'')}</small></button>`).join('')}</div>`;
  nbPick.open(); const io=new IntersectionObserver(es=>es.forEach(en=>{ if(!en.isIntersecting) return; io.unobserve(en.target); en.target.innerHTML=nbTypeSVG(nbS(),en.target.dataset.nbpth,{}); }),{root:nbPick.root.querySelector('.ksmbox'),rootMargin:'300px'});
  nbPick.el.querySelectorAll('[data-nbpth]').forEach(e=>io.observe(e));
  if(!nbPick.el.dataset.b){ nbPick.el.dataset.b=1; nbPick.el.addEventListener('click',e=>{ const c=e.target.closest('[data-nbcat]'); if(c){ nbS().ui.cat=c.dataset.nbcat; nbPicker(); return; } const p=e.target.closest('[data-nbpick]'); if(p){ nbPick.close(); KS.show('notebook','nbblock'); nbAddSec(p.dataset.nbpick); } }); } }

/* ================= screen «Блок»: spreads preview ================= */
let nbIO=null, nbIO2=null;
function nbSpreads(S,P){ const sp=[]; if(S.sides==1){ P.forEach((_,k)=>sp.push([k])); return sp; } if(!P.length) return sp; sp.push([-1,0]); for(let k=1;k<P.length;k+=2) sp.push([k,k+1<P.length?k+1:-1]); return sp; }
function nbScale(S,el){ const r=el?el.getBoundingClientRect():{width:900,height:600}; const two=S.sides!=1; const fit=Math.max(.6,Math.min((r.height-70)/S.h,(r.width-70)/((two?2:1)*S.w))); return fit*Math.max(.4,Math.min(3,+S.ui.zoom||1)); }
function nbBlockScreen(scr){ const S=nbS(), P=nbPages(); nbScr=scr; const keep=scr.querySelector('.nb-view'), st0=keep?keep.scrollTop:0, sl0=keep?keep.scrollLeft:0;
  scr.innerHTML=`<div class="nb-scr"><div class="nb-top"><div><h2>${nbEsc(S.title||'Блокнот')}</h2><p class="hint">${nbEsc(nbFmtName(S))} · ${P.length} стр. · ${nbEsc((NB_BIND.find(b=>b[0]===S.binding)||[])[1]||'')} · ${S.sides==1?'одна сторона':'две стороны'}</p></div>
    <div class="nb-tools"><button class="btn sm" data-nbz="-1" title="Мельче" aria-label="Мельче">${nbI('zout')}</button><button class="btn sm" data-nbz="0" title="По размеру экрана">${Math.round((+S.ui.zoom||1)*100)}%</button><button class="btn sm" data-nbz="1" title="Крупнее" aria-label="Крупнее">${nbI('zin')}</button><button class="btn sm primary" data-nba="toprint">${nbI('print')} К печати</button></div></div>
    <div class="nb-view" tabindex="0">${P.length?'':'<div class="ks-empty nb-empty">Пока нет страниц. Добавьте раздел слева или выберите готовый блокнот во вкладке «Готовые».</div>'}</div><div class="nb-strip"></div></div>`;
  const view=scr.querySelector('.nb-view'), strip=scr.querySelector('.nb-strip'); nbView=view; if(!P.length) return; const sc=nbScale(S,view), pw=S.w*sc, ph=S.h*sc; const sel=S.ui.sel;
  const pgHTML=k=>{ if(k<0) return `<div class="nb-pg empty" style="width:${pw}px;height:${ph}px"></div>`; const pg=P[k]; return `<div class="nb-pgw"><div class="nb-pg ${pg.v?'l':'r'}${pg.sec&&pg.sec.id===sel?' sel':''}${S.ui.pg===pg.num?' cur':''}" data-k="${k}" style="width:${pw}px;height:${ph}px"></div><div class="nb-pgl">${pg.num}${pg.fill?' · для разворота':pg.sec?' · '+nbEsc(pg.sec.name||(NB_T[pg.type]||{}).n||''):''}</div></div>`; };
  view.innerHTML=nbSpreads(S,P).map((sp,i)=>`<div class="nb-spread${S.sides==1?' one':''}" data-sp="${i}">${sp.map(pgHTML).join('')}</div>`).join('');
  strip.innerHTML=P.map((pg,k)=>`<button class="nb-th${pg.sec&&pg.sec.id===sel?' sel':''}" data-th="${k}" style="aspect-ratio:${S.w}/${S.h}" title="Страница ${pg.num}"><span></span><i>${pg.num}</i></button>`).join('');
  if(nbIO) nbIO.disconnect(); nbIO=new IntersectionObserver(es=>es.forEach(en=>{ if(!en.isIntersecting) return; const el=en.target; nbIO.unobserve(el); const pg=nbPages()[+el.dataset.k]; if(pg) el.innerHTML=nbSVG(nbPageL(nbS(),pg),S.w,S.h,'width="100%" height="100%"'); }),{root:view,rootMargin:'500px'});
  view.querySelectorAll('.nb-pg[data-k]').forEach(e=>nbIO.observe(e));
  if(nbIO2) nbIO2.disconnect(); nbIO2=new IntersectionObserver(es=>es.forEach(en=>{ if(!en.isIntersecting) return; const el=en.target; nbIO2.unobserve(el); const pg=nbPages()[+el.dataset.th]; if(pg) el.firstChild.innerHTML=nbSVG(nbPageL(nbS(),pg),S.w,S.h,'width="100%" height="100%"'); }),{root:strip,rootMargin:'400px'});
  strip.querySelectorAll('[data-th]').forEach(e=>nbIO2.observe(e)); view.scrollTop=st0; view.scrollLeft=sl0; }
function nbGoPage(k){ if(!nbView) return; const el=nbView.querySelector(`.nb-pg[data-k="${k}"]`); if(el) el.closest('.nb-spread').scrollIntoView({block:'center',behavior:'smooth'}); }
function nbScreenRefresh(){ const a=KS.active(); if(!a) return; const scr=KS.screen(a.id); if(!scr||scr.hidden) return; if(a.id==='nbblock') nbBlockScreen(scr); else if(a.id==='nbprint') nbPrintScreen(scr); }

/* ================= «Готовые» ================= */
let nbReadyScr=null;
function nbPresetThumb(pr){ const snap=pr.set?nbPresetSnap(pr):pr.data; if(!snap) return ''; const S2=Object.assign({},nbClone(NB_DEF),snap); S2.ui=nbClone(NB_DEF.ui); const {w,h}=nbSize(S2); S2.w=w; S2.h=h;
  const P=nbExpand(S2); if(!P.length) return ''; let k=0; if(pr.set&&pr.show!=null){ const sec=S2.secs[Math.min(pr.show,S2.secs.length-1)]; k=P.first[sec.id]||0; } else { const big=S2.secs.slice().sort((a,b)=>b.n-a.n)[0]; k=big?P.first[big.id]||0:0; }
  if(S2.sides!=1&&k%2===0&&k>0) k--; const ks=S2.sides==1?[k]:[k,k+1].filter(i=>i<P.length); return `<span class="nb-prev${ks.length>1?' two':''}">${ks.map(i=>`<span style="aspect-ratio:${w}/${h}">${nbSVG(nbPageList(S2,P[i]),w,h,'width="100%" height="100%"')}</span>`).join('')}</span>`; }
async function nbReadyScreen(scr){ nbReadyScr=scr; const S=nbS(); if(!S.cur&&S.secs.length){ await nbAutosave(); if(!scr.isConnected) return; }
  scr.innerHTML=`<div class="nb-rhead"><div><h2>Готовые блокноты</h2><p class="hint">${NB_PRESETS.length} шаблонов. Нажмите — получится новый блокнот, текущий сохранится в «Мои блокноты».</p></div></div>
   <section class="nb-rsec"><div class="hd2">Мои блокноты</div><div class="nb-pgrid2" data-nbprojs>${S.projs.length?S.projs.map(p=>`<div class="nb-card${p.id===S.cur?' cur':''}" data-proj="${p.id}"><button class="nb-cardth" data-nbopen="${p.id}" aria-label="Открыть"><span class="nb-prev" data-nbpth="${p.id}"></span></button><div class="nb-cardb"><b>${nbEsc(p.name)}</b><small>${nbEsc(p.fmt||'')}${p.pages?' · '+p.pages+' стр.':''}${p.id===S.cur?' · открыт':''}</small><span class="nb-cardbar"><button class="btn sm" data-nbopen="${p.id}">Открыть</button><button class="btn sm" data-nbren="${p.id}" title="Переименовать">Имя</button><button class="btn sm" data-nbdupp="${p.id}" title="Дублировать">${nbI('dup')}</button><button class="btn sm danger" data-nbdelp="${p.id}" title="Удалить">${nbI('del')}</button></span></div></div>`).join(''):'<div class="ks-empty">Здесь появятся ваши блокноты. Каждый изменённый блокнот сохраняется сам.</div>'}</div></section>
   ${S.my.length?`<section class="nb-rsec"><div class="hd2">Мои шаблоны</div><div class="nb-pgrid2">${S.my.map(p=>`<div class="nb-card"><button class="nb-cardth" data-nbpreset="${p.id}">${nbPresetThumb(p)}</button><div class="nb-cardb"><b>${nbEsc(p.n)}</b><small>${nbEsc(p.d||'')}</small><span class="nb-cardbar"><button class="btn sm primary" data-nbpreset="${p.id}">Создать</button><button class="btn sm danger" data-nbdelmy="${p.id}" title="Удалить шаблон">${nbI('del')}</button></span></div></div>`).join('')}</div></section>`:''}
   <section class="nb-rsec"><div class="hd2">Шаблоны типографии</div><div class="nb-pgrid2">${NB_PRESETS.map(p=>`<div class="nb-card"><button class="nb-cardth" data-nbpreset="${p.id}" data-nbpv="${p.id}" aria-label="${nbEsc(p.n)}"></button><div class="nb-cardb"><b>${nbEsc(p.n)}</b><small>${nbEsc(p.d)}</small></div></div>`).join('')}</div></section>`;
  const io=new IntersectionObserver(es=>es.forEach(en=>{ if(!en.isIntersecting) return; io.unobserve(en.target); const p=NB_PRESETS.find(x=>x.id===en.target.dataset.nbpv); if(p) en.target.innerHTML=nbPresetThumb(p); }),{root:scr,rootMargin:'400px'});
  scr.querySelectorAll('[data-nbpv]').forEach(e=>io.observe(e));
  for(const p of S.projs){ const el=scr.querySelector(`[data-nbpth="${p.id}"]`); if(!el) continue; try{ const d=p.id===S.cur?nbSnap():await KS.idb.get('nb:p:'+p.id); if(d&&el.isConnected) el.outerHTML=nbPresetThumb({data:d}); }catch(_){ } } }
function nbReadyRefresh(){ if(nbReadyScr&&!nbReadyScr.hidden) nbReadyScreen(nbReadyScr); }
function nbPanelReady(box){ const S=nbS(); box.innerHTML=`<div class="card"><div class="hd">Текущий блокнот</div><p class="hint"><b>${nbEsc(S.name||S.title||'Блокнот')}</b><br>${nbEsc(nbFmtName(S))} · ${S.pages} стр.</p>
  <div class="flexw"><button class="btn sm primary" data-nba="savemy">${nbI('save')} Сохранить как шаблон</button><button class="btn sm" data-nba="newblank">${nbI('plus')} Новый пустой</button><button class="btn sm" data-nba="dupcur">${nbI('dup')} Копия текущего</button></div></div>
  <div class="card"><div class="hd">Как это работает</div><p class="hint">Шаблон — набор разделов, формат и переплёт. После выбора всё можно поменять во вкладке «Блок». Каждый блокнот сохраняется автоматически, отмена в программе его не стирает.</p></div>`; }

/* ================= «Печать» ================= */
function nbPrinterLine(){ const p=KS.printer(); return {p,auto:p.duplex==='auto'}; }
function nbPanelPrint(box){ const S=nbS(), P=nbPages(), imp=nbImpose(S,P), {p,auto}=nbPrinterLine(), pr=S.pr; const papers=((st.shop&&st.shop.prices&&st.shop.prices.papers)||[]).filter(x=>!x.sheet||x.sheet==='A4'||x.sheet==='letter'); const mode=imp.mode;
  const modeTxt={booklet:`Брошюра: ${imp.sheets.length} лист. ${imp.sheet.n}, сложить пополам и вложить друг в друга`,sig:`Тетради по ${pr.sig} листа: ${Math.ceil(imp.sheets.length/Math.max(1,+pr.sig))} тетр. для сшивки`,nup:`${imp.k} стр. на листе, ${imp.dup?'двусторонняя печать':'одна сторона'}`,'1up':'1 страница на листе'}[mode];
  box.innerHTML=`<div class="card nb-kpis" data-nbkpi>${nbKpiHTML(S,P)}</div>
  <div class="card"><div class="hd">Переплёт</div><div class="nb-binds">${NB_BIND.map(([k,n,d])=>`<button class="nb-bind${S.binding===k?' on':''}" data-nbset="binding" data-v="${k}" title="${nbEsc(d)}">${nbBindIcon(k)}<b>${nbEsc(n)}</b></button>`).join('')}</div>
    <p class="hint">${nbEsc((NB_BIND.find(b=>b[0]===S.binding)||[])[2]||'')}</p>
    <div class="seg"><button data-nbset="sides" data-v="2"${S.sides!=1?' class="on"':''}>Две стороны</button><button data-nbset="sides" data-v="1"${S.sides==1?' class="on"':''}${['staple','sewn'].includes(S.binding)?' disabled title="Для скобы и шитья — только две стороны"':''}>Одна сторона</button></div>
    ${S.binding==='sewn'?`<label class="f">Листов A4 в одной тетради<input type="number" data-k="pr.sig" value="${pr.sig}" min="1" max="12"></label>`:''}${nbGutterWarn(S)}</div>
  <div class="card"><div class="hd">Раскладка на листе</div>
    <div class="seg nb-imps">${NB_IMP.map(([k,n])=>`<button data-nbset="pr.imp" data-v="${k}"${(pr.imp||'auto')===k?' class="on"':''}>${n}</button>`).join('')}</div>
    <p class="hint"><b>${nbEsc(modeTxt||'')}</b>${imp.blanks>0?` · добавлено пустых страниц: ${imp.blanks}`:''}</p>${imp.warn.map(w=>`<div class="nb-warn">${nbEsc(w)}</div>`).join('')}
    <div class="row2"><label class="f">Лист<select data-k="pr.sheet">${Object.entries(NB_SHEETS).map(([k,v])=>`<option value="${k}"${pr.sheet===k?' selected':''}>${v.n} ${v.w}×${v.h}</option>`).join('')}</select></label>
      <label class="f">Бумага<select data-k="paperId">${papers.map(x=>`<option value="${nbEsc(x.id)}"${S.paperId===x.id?' selected':''}>${nbEsc(x.n)}</option>`).join('')}</select></label></div>
    ${imp.k>1||mode==='nup'?`<div class="row2"><label class="f">Порядок на листе<select data-k="pr.order">${[['stack','Стопками (разрезать и сложить)'],['seq','Подряд'],['copies','Одинаковые копии']].map(([a,b])=>`<option value="${a}"${pr.order===a?' selected':''}>${b}</option>`).join('')}</select></label><label class="f">Страниц на листе<select data-k="pr.nup">${[[0,'Сколько влезет'],[1,'1'],[2,'2'],[4,'4'],[8,'8']].map(([a,b])=>`<option value="${a}"${+pr.nup===a?' selected':''}>${b}</option>`).join('')}</select></label></div>`:''}
    ${mode==='booklet'||mode==='sig'?`<div class="row2"><label class="f">Сдвиг страниц (крип)<select data-k="pr.creep">${[['auto','Авто по толщине'],['off','Нет'],['manual','Вручную']].map(([a,b])=>`<option value="${a}"${pr.creep===a?' selected':''}>${b}</option>`).join('')}</select></label>${pr.creep==='manual'?`<label class="f">Всего, мм<input type="number" data-k="pr.creepMM" value="${pr.creepMM}" min="0" max="5" step=".1"></label>`:'<span></span>'}</div>`:''}
    <label class="chk"><input type="checkbox" data-k="pr.marks"${pr.marks?' checked':''}> Метки реза и сгиба</label><label class="chk"><input type="checkbox" data-k="pr.nums"${pr.nums?' checked':''}> Номер листа на поле (и метки тетрадей на корешке)</label>
    <label class="f">Переворот при двусторонней печати<select data-k="pr.flip">${[['long','По длинному краю (обычно)'],['short','По короткому краю']].map(([a,b])=>`<option value="${a}"${pr.flip===a?' selected':''}>${b}</option>`).join('')}</select></label></div>
  <div class="card nb-prn"><div class="hd">${nbI('print')} ${nbEsc(p.n)}</div>
    <p class="hint">${auto?'Принтер сам печатает с двух сторон: всё уйдёт одним заданием. В окне печати включите «Двусторонняя печать», переворот по длинному краю, масштаб 100%.':'Этот принтер не переворачивает лист сам — поможет пошаговый мастер: сначала лица, потом переворачиваете стопку и печатаете обороты.'}</p>
    <label class="f">Листы для печати<input type="text" data-k="pr.range" value="${nbEsc(pr.range)}" placeholder="все ${imp.sheets.length}; например 1-3, 5"></label>
    <div class="nb-pbtns">${imp.dup&&!auto?`<button class="btn primary" data-nba="wizard">${nbI('flip')} Мастер двусторонней печати</button>`:`<button class="btn primary" data-nba="print">${nbI('print')} Печать ${imp.dup?'(двусторонняя)':''}</button>`}
      <button class="btn sm" data-nba="test">Пробный лист</button>${imp.dup&&!auto?`<button class="btn sm" data-nba="print">Всё одним заданием</button>`:''}</div></div>
  <div class="card"><div class="hd">${nbI('pdf')} PDF</div><div class="seg"><button data-nbset="pr.what" data-v="sheets"${pr.what!=='pages'?' class="on"':''}>Листы для печати</button><button data-nbset="pr.what" data-v="pages"${pr.what==='pages'?' class="on"':''}>Страницы по формату</button></div>
    <div class="flexw"><button class="btn sm primary" data-nba="pdf">${nbI('pdf')} Скачать PDF</button><button class="btn sm" data-nba="vpdf">PDF через окно печати</button></div><p class="hint">Линии и сетки остаются векторными — чёткие при любом увеличении.</p></div>
  <div class="card"><div class="hd">${nbI('cover')} Обложка</div>${KS.nbCover&&KS.nbCover.pages?`<p class="hint">Размер: ${nbCoverTxt()}</p><button class="btn sm" data-nba="cover">${nbI('print')} Печать обложки</button>`:`<p class="hint">Размер обложки: ${nbCoverTxt()}. Дизайн обложки делается во вкладке «Обложка».</p><button class="btn sm" data-nba="cover">Печать обложки</button>`}</div>
  <div class="card"><div class="hd">Листы-вкладыши</div><p class="hint">Отдельная пачка одного вида страниц — например, 20 листов планера для колец.</p>
    <div class="row2"><label class="f">Страницы<select data-nbrefill="type">${S.secs.map(s=>`<option value="sec:${s.id}">${nbEsc(s.name||(NB_T[s.type]||{}).n)} (раздел)</option>`).join('')}${nbTypeOpts('','')}</select></label><label class="f">Листов<input type="number" data-nbrefill="n" value="20" min="1" max="500"></label></div>
    <div class="row2"><label class="f">Формат<select data-nbrefill="fmt"><option value="same">Как у блокнота</option><option value="A4">A4 целиком</option><option value="A5">A5</option></select></label><label class="f">Стороны<select data-nbrefill="sides"><option value="2">Две</option><option value="1">Одна</option></select></label></div>
    <div class="flexw"><button class="btn sm" data-nba="refill">${nbI('print')} Печать вкладышей</button><button class="btn sm" data-nba="refillpdf">${nbI('pdf')} PDF</button></div></div>
  <div class="card" data-nbcost>${nbCostHTML(S,P)}</div>
  <details class="card nb-det" data-nbdet="cost"${nbOpenD('cost')?' open':''}><summary class="hd">Цены для расчёта</summary>${nbCostSettings(S)}</details>`; }
function nbCoverTxt(){ const c=KS.nb.coverSize(); return c.wrap?`${nbMM(c.w)} × ${nbMM(c.h)} мм разворотом, корешок ${nbMM(c.spine)} мм`:`${nbMM(c.w)} × ${nbMM(c.h)} мм, лицо и оборот отдельно`; }
function nbBindIcon(k){ const P={spiral:'<rect x="7" y="4" width="12" height="16" rx="1"/><path d="M5 6h4M5 9h4M5 12h4M5 15h4M5 18h4"/>',wireo:'<rect x="7" y="4" width="12" height="16" rx="1"/><path d="M4 6c2 0 3 1 3 1M4 9c2 0 3 1 3 1M4 12c2 0 3 1 3 1M4 15c2 0 3 1 3 1M4 18c2 0 3 1 3 1"/>',staple:'<path d="M4 6l8 2 8-2v13l-8 2-8-2z"/><path d="M12 8v13M11 11h2M11 17h2"/>',perfect:'<rect x="6" y="4" width="13" height="16" rx="1"/><path d="M6 4v16" stroke-width="3"/>',sewn:'<rect x="6" y="4" width="13" height="16" rx="1"/><path d="M9 6v2M9 10v2M9 14v2M9 18v1"/>',rings:'<rect x="7" y="4" width="12" height="16" rx="1"/><circle cx="7" cy="8" r="2"/><circle cx="7" cy="16" r="2"/>',disc:'<rect x="7" y="4" width="12" height="16" rx="1"/><path d="M5 6h4v2H5zM5 11h4v2H5zM5 16h4v2H5z"/>',none:'<rect x="5" y="6" width="12" height="14" rx="1"/><path d="M8 3h11v14"/>'}; return KS.icon(P[k]||P.none); }
function nbCostHTML(S,P){ const C=nbCalc(S,P,nbImpose(S,P)), o=C.one; return `<div class="hd">Расчёт <span class="hint" style="margin-left:auto">${nbEsc(C.paper.n)}</span></div>
  <div class="row2"><label class="f">Тираж, шт.<input type="number" data-k="pr.qty" value="${C.qty}" min="1" max="9999"></label><div class="nb-big"><small>Цена для клиента</small><b>${KS.money(C.price)}</b><i>${C.qty>1?KS.money(C.price/C.qty)+' за шт.':''}</i></div></div>
  <table class="ks-table nb-ct"><tr><td>Бумага: ${nbMM(C.sheets)} л. × ${C.qty}</td><td class="num">${KS.money(o.paperP*C.qty)}</td></tr><tr><td>Печать (заливка: светлых ${C.cls.l}, средних ${C.cls.m}, плотных ${C.cls.h} стр.)</td><td class="num">${KS.money(o.inkP*C.qty)}</td></tr>
   <tr><td>Переплёт: ${nbEsc((NB_BIND.find(b=>b[0]===S.binding)||[])[1]||'')}</td><td class="num">${KS.money(o.bindP*C.qty)}</td></tr>${o.coverP?`<tr><td>Обложка</td><td class="num">${KS.money(o.coverP*C.qty)}</td></tr>`:''}${o.labor?`<tr><td>Работа</td><td class="num">${KS.money(o.labor*C.qty)}</td></tr>`:''}
   <tr class="nb-ctc"><td>Себестоимость</td><td class="num">${KS.money(C.cost)}</td></tr><tr class="nb-ctc"><td>Прибыль</td><td class="num">${KS.money(C.price-C.cost)}</td></tr></table>
  <div class="row2"><label class="f">Клиент<input type="text" data-nbord="client" placeholder="Имя"></label><label class="f">Телефон<input type="tel" data-nbord="phone"></label></div>
  <button class="btn primary" data-nba="order">${nbI('order')} Создать заказ</button><div class="nb-orderok" hidden></div>`; }
function nbCostSettings(S){ const C=S.cost, row=(lab,k)=>`<tr><td>${nbEsc(lab)}</td><td><input type="number" data-k="${k}.c" value="${nbEsc(k.split('.').reduce((o,x)=>o[x],S).c)}" min="0"></td><td><input type="number" data-k="${k}.p" value="${nbEsc(k.split('.').reduce((o,x)=>o[x],S).p)}" min="0"></td></tr>`;
  return `<p class="hint">Себестоимость и цена для клиента за один блокнот, в ${nbEsc((st.shop&&st.shop.cur)||'֏')}. Бумага берётся из цен типографии.</p><table class="ks-table nb-cset"><tr><th>Переплёт</th><th>Себест.</th><th>Цена</th></tr>${NB_BIND.map(([k,n])=>row(n,'cost.bind.'+k)).join('')}${row('Обложка','cost.cover')}
   <tr><th>Печать стр. A4</th><th></th><th></th></tr>${row('Светлая (линейка, точки)','cost.ink.l')}${row('Средняя (клетка, планеры)','cost.ink.m')}${row('Плотная (миллиметровка)','cost.ink.h')}</table><label class="f">Работа за блокнот<input type="number" data-k="cost.labor" value="${C.labor}" min="0"></label>`; }
/* print screen: imposed sheets */
function nbPrintScreen(scr){ const S=nbS(), P=nbPages(), imp=nbImpose(S,P); nbScr=scr; const keep=scr.querySelector('.nb-view'), st0=keep?keep.scrollTop:0;
  const nm=x=>x&&x.pg>=0&&P[x.pg]?P[x.pg].num:'—';
  scr.innerHTML=`<div class="nb-scr"><div class="nb-top"><div><h2>Листы для печати</h2><p class="hint">${imp.sheets.length} лист. ${nbEsc(imp.sheet.n)} · ${imp.k} ${imp.mode==='booklet'||imp.mode==='sig'?'разворот':'стр.'} на листе · ${imp.dup?'лицо и оборот':'одна сторона'}${imp.dup?' · переворот по '+(S.pr.flip==='short'?'короткому':'длинному')+' краю':''}</p></div>
   <div class="nb-tools"><button class="btn sm" data-nba="toblock">← К страницам</button></div></div>
   <div class="nb-view nb-sheets">${imp.sheets.map((sh,i)=>`<div class="nb-sheet"><div class="nb-shl"><b>Лист ${i+1}</b><small>лицо: ${nbOrd(imp,P,sh.front,0).map(n=>n||'—').join(' · ')}${sh.back?' — оборот: '+nbOrd(imp,P,sh.back,1).map(n=>n||'—').join(' · '):''}</small></div>
     <div class="nb-shs"><div class="nb-shp" data-sh="${i}" data-side="front" style="aspect-ratio:${imp.SW}/${imp.SH}"></div>${sh.back?`<div class="nb-shp" data-sh="${i}" data-side="back" style="aspect-ratio:${imp.SW}/${imp.SH}"></div>`:''}</div></div>`).join('')||'<div class="ks-empty">Нет страниц для печати.</div>'}</div></div>`;
  const view=scr.querySelector('.nb-view'); nbView=null; const rend=el=>{ const o=nbSide(nbS(),nbPages(),imp,+el.dataset.sh,el.dataset.side); el.innerHTML=nbSVG(o.L,o.w,o.h,'width="100%" height="100%"')+`<i>${el.dataset.side==='front'?'лицо':'оборот'}</i>`; };
  const io=new IntersectionObserver(es=>es.forEach(en=>{ if(!en.isIntersecting) return; io.unobserve(en.target); if(!en.target.firstChild) rend(en.target); }),{root:view,rootMargin:'500px'});
  view.querySelectorAll('[data-sh]').forEach((e,i)=>{ if(i<4&&!st0) rend(e); else io.observe(e); }); view.scrollTop=st0; }
/* jobs */
function nbPrintJob(kind,o){ const S=nbS(), P=nbPages(); if(!P.length){ KS.toast('Нет страниц для печати'); return 0; } const imp=nbImpose(S,P); const out=nbJob(S,P,imp,kind,o); if(!out.length){ KS.toast('Нечего печатать в этом диапазоне'); return 0; } KS.print(out.map(nbPrintPage)); return out.length; }
function nbOutAll(S,P,imp){ return S.pr.what==='pages'?P.map(pg=>nbPageOut(S,pg)):nbJob(S,P,imp,'all'); }
async function nbDownloadPDF(btn,outs,name){ const S=nbS(), P=nbPages(); if(!P.length&&!outs){ KS.toast('Нет страниц'); return; } outs=outs||nbOutAll(S,P,nbImpose(S,P)); const lbl=btn&&btn.innerHTML;
  const fname=name||((S.title||'blocknot').replace(/[^\wа-яё\- ]+/gi,'').trim().replace(/\s+/g,'-')||'blocknot')+'.pdf', prog=(i,n)=>{ if(btn) btn.textContent=`${i+1} из ${n}…`; };
  /* true vector PDF (text as glyph outlines) through the vpdf engine when it is built in; the jsPDF path stays as fallback */
  if(KS.vpdf&&typeof KS.vpdf.pdf==='function'){ try{ const blob=await KS.vpdf.pdf(outs.map(nbPrintPage),{name:fname,prog:(i,n)=>prog(i,n||outs.length)}); await KS.download(fname,blob); KS.toast('PDF сохранён: '+fname); if(btn) btn.innerHTML=lbl; return; }
    catch(e){ console.warn('[notebook] vector pdf failed, fallback',e); KS.toast('Векторный PDF не получился — сохраняю упрощённый'); } }
  try{ const r=await nbPDF(outs,fname,prog); if(r){ await KS.download(r.name,r.blob); KS.toast('PDF сохранён: '+r.name); } }
  catch(e){ console.error('[notebook] pdf',e); KS.toast('Не получилось сделать PDF. Попробуйте «PDF через окно печати».'); } finally{ if(btn) btn.innerHTML=lbl; } }
function nbVectorPDF(){ const S=nbS(), P=nbPages(); const pages=nbOutAll(S,P,nbImpose(S,P)).map(nbPrintPage); if(typeof vectorPDF==='function') vectorPDF(pages); else KS.print(pages); }
function nbRefillS(box){ const S=nbS(), g=k=>box.querySelector(`[data-nbrefill="${k}"]`); const v=g('type').value, n=Math.max(1,Math.min(500,+g('n').value||20)), fmt=g('fmt').value, sides=+g('sides').value;
  let sec; if(v.startsWith('sec:')){ const s=nbSec(v.slice(4)); sec=nbClone(s); } else sec=nbSecDef(v,1); sec.n=n*(sides===2?2:1); sec.alt=sec.alt||''; const S2=nbClone(nbSnap()); Object.assign(S2,{secs:[sec],sides,fmt:fmt==='same'?S.fmt:fmt,land:fmt==='same'?S.land:false,title:(S.title||'')+' · вкладыши',ui:nbClone(NB_DEF.ui),cost:S.cost});
  S2.binding=['staple','sewn','perfect'].includes(S.binding)?'none':S.binding; S2.pr=Object.assign({},S2.pr,{imp:'auto',range:'',order:'stack'}); const {w,h}=nbSize(S2); S2.w=w; S2.h=h; return S2; }
function nbRefill(box,pdf,btn){ const S2=nbRefillS(box), P=nbExpand(S2), imp=nbImpose(S2,P); const outs=nbJob(S2,P,imp,'all',{nocache:1}); if(pdf) return nbDownloadPDF(btn,outs,'vkladyshi.pdf'); KS.print(outs.map(nbPrintPage)); KS.toast(`Вкладыши: ${imp.sheets.length} лист. ${imp.sheet.n}`); }
async function nbCoverPrint(){ if(KS.nbCover&&typeof KS.nbCover.pages==='function'){ try{ const pg=await KS.nbCover.pages(); if(pg&&pg.length){ KS.print(pg); return; } KS.toast('Обложка пока пустая — сделайте её во вкладке «Обложка»'); }catch(e){ console.error(e); KS.toast('Не получилось подготовить обложку'); } }
  else KS.toast('Обложку делает вкладка «Обложка» — её модуль сейчас не подключён'); const b=document.querySelector('[data-kssub^="notebook:"]:not([data-kssub$=":nbblock"]):not([data-kssub$=":nbprint"]):not([data-kssub$=":nbready"])'); if(b&&/Обложк/.test(b.textContent)) b.click(); }
function nbOrder(box){ const S=nbS(), P=nbPages(), C=nbCalc(S,P,nbImpose(S,P)); const g=k=>{ const e=box.querySelector(`[data-nbord="${k}"]`); return e?e.value.trim():''; }; const bn=(NB_BIND.find(b=>b[0]===S.binding)||[])[1]||'';
  if(typeof newOrder!=='function'){ KS.toast('Заказы недоступны'); return; }
  const ord=newOrder({client:g('client'),phone:g('phone'),product:`Блокнот «${S.title||'Блокнот'}» ${nbFmtName(S).split(' · ')[0]}, ${P.length} стр.`,qty:C.qty,paper:C.paper.n,sides:S.sides==1?1:2,fin:bn,price:C.price,cost:Math.round(C.cost),
    note:`${nbFmtName(S)} · ${bn} · ${P.length} стр. (${nbLeaves(S,P)} л.) · листов ${nbImpose(S,P).sheet.n}: ${Math.ceil(C.sheets*C.qty)} · корешок ${nbMM(nbSpine(S))} мм`,nb:nbSnap()});
  try{ if(st.shop) st.shop.filter='active'; }catch(_){ } KS.update(); KS.emit('nbOrder',ord); KS.toast(`Заказ №${ord.no} создан: ${KS.money(C.price)}`);
  const n=box.querySelector('.nb-orderok'); if(n){ n.hidden=false; n.innerHTML=`${nbI('ok')}<span>Заказ <b>№${nbEsc(ord.no)}</b> — ${nbEsc(KS.money(C.price))}</span><button class="btn sm" data-nba="orders">Открыть</button>`; } return ord; }
/* manual duplex wizard */
let nbWiz=null;
function nbWizard(test){ const S=nbS(), P=nbPages(), imp=nbImpose(S,P); if(!imp.sheets.length) return; nbWiz=nbWiz||KS.modal({id:'nbwiz',title:'Двусторонняя печать вручную',wide:true}); let step=0; const idx=test?[0]:(nbRangeParse(S.pr.range,imp.sheets.length)||imp.sheets.map((_, i)=>i)); const n=idx.length;
  const draw=()=>{ const r=S.pr.rev; nbWiz.el.innerHTML=`<div class="nb-wsteps">${['Лицевые стороны','Переверните стопку','Обороты'].map((t,i)=>`<span class="${i===step?'on':i<step?'done':''}"><b>${i<step?'✓':i+1}</b>${t}</span>`).join('')}</div>
    ${step===0?`<div class="nb-wbody"><div class="nb-wpic">${nbWizPic(0)}</div><div><h3>Шаг 1. Печать лицевых сторон</h3><p>Положите в задний лоток <b>${n}</b> ${n===1?'лист':'листов'} ${nbEsc(imp.sheet.n)} и напечатайте лица. Обороты пока не трогайте.</p>${test?'<p class="hint">Пробный лист: проверим ориентацию на одном листе.</p>':''}<div class="flexw"><button class="btn primary" data-nbw="fronts">${nbI('print')} Печать лиц (${n})</button><button class="btn sm" data-nbw="next">Уже напечатано →</button></div></div></div>`:
     step===1?`<div class="nb-wbody"><div class="nb-wpic">${nbWizPic(1)}</div><div><h3>Шаг 2. Переверните стопку</h3><p>Возьмите напечатанную стопку, <b>не меняя порядок листов</b>. Переверните её как страницу книги — <b>через длинный край</b>, чистой стороной вверх. Верх листа остаётся сверху и снова идёт в принтер первым.</p><p class="hint">Если на пробном листе оборот получился вверх ногами — в окне печати выберите переворот по короткому краю или поменяйте настройку ниже.</p><div class="flexw"><button class="btn sm" data-nbw="back">← Назад</button><button class="btn primary" data-nbw="next">Стопка в лотке →</button></div></div></div>`:
     `<div class="nb-wbody"><div class="nb-wpic">${nbWizPic(2)}</div><div><h3>Шаг 3. Печать оборотов</h3><p>Принтер напечатает обороты листов ${r?'с последнего до первого':'с первого до последнего'}.</p><label class="chk"><input type="checkbox" data-nbwrev${r?' checked':''}> Обратный порядок (если принтер берёт нижний лист первым)</label><div class="flexw"><button class="btn sm" data-nbw="back">← Назад</button><button class="btn primary" data-nbw="backs">${nbI('print')} Печать оборотов (${n})</button></div></div></div>`}`; };
  draw(); nbWiz.open(); nbWiz.el.onclick=e=>{ const b=e.target.closest('[data-nbw]'); if(!b) return; const a=b.dataset.nbw; if(a==='next'){ step=Math.min(2,step+1); draw(); } else if(a==='back'){ step=Math.max(0,step-1); draw(); } else if(a==='fronts'){ nbPrintJob('fronts',{idx}); step=1; draw(); } else if(a==='backs'){ nbPrintJob('backs',{idx,rev:S.pr.rev}); KS.toast('Обороты отправлены. Проверьте первый лист.'); nbWiz.close(); } };
  nbWiz.el.onchange=e=>{ if(e.target.matches('[data-nbwrev]')){ S.pr.rev=e.target.checked; KS.save(); draw(); } }; }
function nbWizPic(s){ const sheet=(x,y,lab,blank,rot)=>`<g transform="translate(${x} ${y}) rotate(${rot||0})"><rect x="-26" y="-36" width="52" height="72" rx="3" fill="${blank?'#fff':'#f4f7fb'}" stroke="#6b7f99" stroke-width="1.4"/>${blank?'':`<path d="M-16 -22h32M-16 -14h32M-16 -6h32M-16 2h24" stroke="#9fb2c8" stroke-width="1.6"/><text x="0" y="24" text-anchor="middle" font-size="12" font-weight="700" fill="#3b5576">${lab}</text>`}<path d="M-8 -42l8-7 8 7" fill="none" stroke="#e0603f" stroke-width="2"/></g>`;
  const prn=`<g transform="translate(150 118)"><rect x="-58" y="-18" width="116" height="40" rx="8" fill="#e9eef5" stroke="#6b7f99" stroke-width="1.4"/><rect x="-34" y="-34" width="68" height="18" rx="2" fill="#fff" stroke="#6b7f99" stroke-width="1.2"/><circle cx="44" cy="2" r="3" fill="#34c759"/></g>`;
  if(s===0) return `<svg viewBox="0 0 300 160">${prn}${sheet(150,52,'1')}<text x="150" y="152" text-anchor="middle" font-size="11" fill="#6b7f99">задний лоток · печать вверх</text></svg>`;
  if(s===1) return `<svg viewBox="0 0 300 160">${sheet(70,70,'1')}<path d="M110 60 C 140 25, 170 25, 196 60" fill="none" stroke="#0a84ff" stroke-width="2.4" marker-end="url(#nbar)"/><defs><marker id="nbar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="#0a84ff"/></marker></defs>${sheet(232,70,'',true)}<text x="150" y="140" text-anchor="middle" font-size="11" fill="#6b7f99">через длинный край · верх остаётся сверху</text></svg>`;
  return `<svg viewBox="0 0 300 160">${prn}${sheet(150,52,'',true)}<text x="150" y="152" text-anchor="middle" font-size="11" fill="#6b7f99">чистой стороной вверх · верх листа вниз в лоток</text></svg>`; }

/* ================= tabs & events ================= */
const NB_GI=KS.icon(NB_IC.nb);
KS.tab({id:'nbblock',group:'notebook',groupTitle:'Блокноты',groupIcon:NB_GI,icon:NB_GI,title:'Блок',seg:'Блок',app:'print',before:'prep',screen:true,render:(box,o)=>nbRenderTab('nbblock',box,o)});
KS.tab({id:'nbready',group:'notebook',title:'Готовые',seg:'Готовые',app:'print',screen:true,render:(box,o)=>nbRenderTab('nbready',box,o)});
KS.tab({id:'nbprint',group:'notebook',title:'Печать',seg:'Печать',app:'print',screen:true,render:(box,o)=>nbRenderTab('nbprint',box,o)});
function nbRenderTab(id,box,o){ nbBox=box; nbBind(box); if(o.reason!=='show'&&box.dataset.nbt===id&&box.childElementCount) return; box.dataset.nbt=id;
  if(id==='nbblock'){ nbPanelBlock(box); requestAnimationFrame(()=>nbBlockScreen(o.screen)); } else if(id==='nbready'){ nbPanelReady(box); nbReadyScreen(o.screen); } else { nbPanelPrint(box); requestAnimationFrame(()=>nbPrintScreen(o.screen)); } nbBindScreen(o.screen); }
function nbBind(box){ if(box.dataset.nbb) return; box.dataset.nbb=1;
  box.addEventListener('input',e=>{ const el=e.target, k=el.dataset&&el.dataset.k; if(!k||el.type==='checkbox'||el.tagName==='SELECT'||el.type==='color') return; if(el.type==='number'&&el.value==='') return; nbSet(k,el.type==='range'?+el.value:el.value,el);
    if(el.type==='range'){ const l=el.closest('label'); if(l&&l.firstChild) l.firstChild.textContent='Насыщенность: '+el.value+'%'; } });
  box.addEventListener('change',e=>{ const el=e.target, k=el.dataset&&el.dataset.k; if(!k) return; if(el.type==='checkbox') nbSet(k,el.checked,el); else if(el.tagName==='SELECT'||el.type==='color') nbSet(k,el.value,el); else if(el.type==='number'){ const mn=+el.min, mx=+el.max; let v=+el.value; if(el.min!==''&&v<mn) v=mn; if(el.max!==''&&v>mx) v=mx; el.value=v; nbSet(k,v,el); } });
  box.addEventListener('toggle',e=>{ const d=e.target; if(d.dataset&&d.dataset.nbdet){ const S=nbS(); if(!S.ui.opens||typeof S.ui.opens!=='object') S.ui.opens={}; S.ui.opens[d.dataset.nbdet]=d.open; KS.save(); } },true);
  box.addEventListener('click',e=>{ const t=e.target.closest('button,[data-nbsel]'); if(!t) return; const d=t.dataset, S=nbS();
    if(d.nbstep){ const inp=t.parentNode.querySelector('input'); let v=(+inp.value||0)+(+d.d); if(inp.min!=='') v=Math.max(+inp.min,v); if(inp.max!=='') v=Math.min(+inp.max,v); v=Math.round(v*1000)/1000; inp.value=v; nbSet(d.nbstep,v,inp); return; }
    if(d.nbsel){ S.ui.sel=S.ui.sel===d.nbsel?'':d.nbsel; S.ui.pg=0; nbPanelRefresh(); nbScreenRefresh(); return; }
    if(d.nbfmt){ S.fmt=d.nbfmt; if(d.nbfmt!=='custom'){ const f=NB_FMTS.find(x=>x[0]===d.nbfmt); if(f&&f[2]===f[3]) S.land=false; } nbChg({panel:1}); return; }
    if(d.nbland!=null){ S.land=d.nbland==='1'; nbChg({panel:1}); return; }
    if(d.nbset){ nbSet(d.nbset,/^(st\.lw|sides)$/.test(d.nbset)?+d.v:d.v,null); nbPanelRefresh(); return; }
    if(d.nbq){ const sec=nbSec(d.nbq.split(':')[1]); if(sec){ Object.assign(sec.p,JSON.parse(d.q)); if(JSON.parse(d.q).m) S.st.mside='outer'; nbChg({panel:1}); } return; }
    if(d.nbmv){ nbMove(d.nbmv,+d.d); return; } if(d.nbdup){ nbDupSec(d.nbdup); return; } if(d.nbdel){ nbDelSec(d.nbdel); return; }
    const a=d.nba; if(!a) return;
    if(a==='add') nbPicker(); else if(a==='ready') KS.show('notebook','nbready'); else if(a==='print') nbPrintJob('all'); else if(a==='wizard') nbWizard(false);
    else if(a==='test'){ if(nbPrinterLine().auto||!nbImpose(S,nbPages()).dup) nbPrintJob('all',{idx:[0]}); else nbWizard(true); }
    else if(a==='pdf') nbDownloadPDF(t); else if(a==='vpdf') nbVectorPDF(); else if(a==='cover') nbCoverPrint(); else if(a==='order') nbOrder(box); else if(a==='orders') goTab('orders');
    else if(a==='refill') nbRefill(box,false); else if(a==='refillpdf') nbRefill(box,true,t); else if(a==='savemy') nbSaveMyPreset(); else if(a==='newblank') nbNewProj({secs:[nbSecDef('title',1),nbSecDef('dots',47)],title:'Новый блокнот'},'Новый блокнот');
    else if(a==='dupcur'){ nbAutosave().then(()=>nbDupProj(S.cur)); } });
  /* drag & drop reorder (mouse) */
  let dragId=null; box.addEventListener('dragstart',e=>{ const r=e.target.closest&&e.target.closest('.nb-sec'); if(!r) return; dragId=r.dataset.sec; r.classList.add('drag'); try{ e.dataTransfer.effectAllowed='move'; e.dataTransfer.setData('text/plain',dragId); }catch(_){ } });
  box.addEventListener('dragover',e=>{ const r=e.target.closest&&e.target.closest('.nb-sec'); if(!r||!dragId) return; e.preventDefault(); const b=r.getBoundingClientRect(); box.querySelectorAll('.nb-sec').forEach(x=>x.classList.remove('dropA','dropB')); r.classList.add(e.clientY<b.top+b.height/2?'dropA':'dropB'); });
  box.addEventListener('drop',e=>{ const r=e.target.closest&&e.target.closest('.nb-sec'); if(!r||!dragId) return; e.preventDefault(); const S=nbS(); const after=r.classList.contains('dropB'); const from=S.secs.findIndex(s=>s.id===dragId); if(from<0) return; const [x]=S.secs.splice(from,1); let to=S.secs.findIndex(s=>s.id===r.dataset.sec); if(to<0) to=S.secs.length; S.secs.splice(after?to+1:to,0,x); dragId=null; nbChg({panel:1}); });
  box.addEventListener('dragend',()=>{ dragId=null; box.querySelectorAll('.nb-sec').forEach(x=>x.classList.remove('drag','dropA','dropB')); }); }
function nbBindScreen(scr){ if(!scr||scr.dataset.nbb) return; scr.dataset.nbb=1;
  scr.addEventListener('click',e=>{ const t=e.target.closest('[data-k],[data-th],[data-nbz],[data-nba],[data-nbpreset],[data-nbopen],[data-nbdupp],[data-nbdelp],[data-nbren],[data-nbdelmy]'); if(!t) return; const S=nbS(), d=t.dataset;
    if(d.nbz!=null){ S.ui.zoom=d.nbz==='0'?1:Math.max(.4,Math.min(3,(+S.ui.zoom||1)*(d.nbz==='1'?1.25:.8))); KS.save(); nbScreenRefresh(); return; }
    if(d.th!=null){ nbGoPage(+d.th); return; }
    if(d.k!=null&&t.classList.contains('nb-pg')){ const pg=nbPages()[+d.k]; if(!pg) return; S.ui.sel=pg.sec?pg.sec.id:''; S.ui.pg=pg.num; KS.save(); nbPanelRefresh(); scr.querySelectorAll('.nb-pg').forEach(x=>{ const p2=nbPages()[+x.dataset.k]; x.classList.toggle('sel',!!(p2&&p2.sec&&p2.sec.id===S.ui.sel)); x.classList.toggle('cur',x===t); });
      const row=nbBox&&nbBox.querySelector(`.nb-sec[data-sec="${S.ui.sel}"]`); if(row) row.scrollIntoView({block:'nearest',behavior:'smooth'}); return; }
    if(d.nba==='toprint'){ KS.show('notebook','nbprint'); return; } if(d.nba==='toblock'){ KS.show('notebook','nbblock'); return; }
    if(d.nbpreset){ nbApplyPreset(d.nbpreset); return; } if(d.nbopen){ nbOpenProj(d.nbopen).then(()=>KS.show('notebook','nbblock')); return; } if(d.nbdupp){ nbDupProj(d.nbdupp); return; } if(d.nbdelp){ nbDelProj(d.nbdelp); return; }
    if(d.nbdelmy){ S.my=S.my.filter(x=>x.id!==d.nbdelmy); KS.save(); nbReadyRefresh(); return; }
    if(d.nbren){ const m=S.projs.find(x=>x.id===d.nbren); if(!m) return; const n=prompt('Название блокнота',m.name); if(!n) return; m.name=n.slice(0,60); if(m.id===S.cur) S.name=m.name; else KS.idb.get('nb:p:'+m.id).then(x=>{ if(x){ x.name=m.name; KS.idb.set('nb:p:'+m.id,x); } }); KS.save(); nbReadyRefresh(); } });
  scr.addEventListener('keydown',e=>{ if(!e.target.classList.contains('nb-view')) return; if(e.key==='+'||e.key==='='){ e.preventDefault(); scr.querySelector('[data-nbz="1"]').click(); } else if(e.key==='-'){ e.preventDefault(); scr.querySelector('[data-nbz="-1"]').click(); } }); }
let nbRZ=0; window.addEventListener('resize',()=>{ clearTimeout(nbRZ); nbRZ=setTimeout(()=>{ const a=KS.active(); if(a&&a.id==='nbblock') nbScreenRefresh(); },250); });
/* ⌘K commands */
KS.cmd('Блокноты: открыть конструктор','Блокноты',()=>KS.show('notebook','nbblock'));
KS.cmd('Блокноты: готовые шаблоны','Блокноты',()=>KS.show('notebook','nbready'));
KS.cmd('Блокноты: печать блока','Блокноты',()=>{ KS.show('notebook','nbprint'); const S=nbS(); if(nbPrinterLine().auto||!nbImpose(S,nbPages()).dup) nbPrintJob('all'); else nbWizard(false); });
KS.cmd('Блокноты: мастер двусторонней печати','Блокноты',()=>{ KS.show('notebook','nbprint'); nbWizard(false); });
KS.cmd('Блокноты: скачать PDF','Блокноты',()=>{ KS.show('notebook','nbprint'); nbDownloadPDF(null); });
KS.cmd('Блокноты: добавить раздел','Блокноты',()=>{ KS.show('notebook','nbblock'); nbPicker(); });
KS.cmd('Блокноты: создать заказ','Блокноты',()=>{ KS.show('notebook','nbprint'); setTimeout(()=>{ if(nbBox) nbOrder(nbBox); },50); });
KS.cmd('Блокноты: печать обложки','Блокноты',()=>nbCoverPrint());
/* «Блокноты» tile on Главная (home module has no tile API: add one button next to its tiles) */
function nbHomeTile(){ const g=document.querySelector('.hm-tiles'); if(!g||g.querySelector('[data-nbtile]')) return; const b=document.createElement('button'); b.className='hm-tile'; b.dataset.nbtile='1'; b.style.setProperty('--h','24');
  b.innerHTML=`<span class="hm-tic">${KS.icon(NB_IC.nb)}</span><span class="hm-tt"><b>Блокноты</b><small>Тетради, планеры, ежедневники</small></span>`; b.addEventListener('click',()=>KS.show('notebook','nbblock')); const ref=g.querySelector('[data-hmtile="all"]'); if(ref) ref.before(b); else g.appendChild(b); }
KS.on('render',()=>{ try{ nbHomeTile(); }catch(_){ } }); KS.on('boot',()=>{ try{ nbS(); nbPages(); nbHomeTile(); setTimeout(()=>{ try{ nbHomeTile(); }catch(_){ } },400); }catch(e){ console.error(e); } });
new MutationObserver(()=>{ try{ nbHomeTile(); }catch(_){ } }).observe(document.querySelector('section.work')||document.body,{childList:true,subtree:true});
