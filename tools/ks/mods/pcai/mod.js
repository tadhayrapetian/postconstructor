KS.mod('pcai',{title:'ИИ для открыток: тексты, фон, качество фото'});
/* ================= 1. Greeting texts ================= */
const PA=()=>KS.store('pcai',{occ:'bday',own:'',to:'',name:'',tone:'warm',len:'mid',lang:'ru',extra:''});
const PA_OCC=[['bday','День рождения'],['anniv','Юбилей'],['wedding','Свадьба'],['family','Годовщина свадьбы'],['love','Любимому человеку'],['ny','Новый год и Рождество'],['mar8','8 Марта'],['feb23','23 Февраля'],['mom','Маме'],['baby','Рождение ребёнка'],['grad','Выпускной'],['teacher','Учителю'],['thanks','Благодарность'],['home','Новоселье'],['easter','Пасха'],['any','Просто так'],['own','Свой повод…']];
const PA_TONE=[['warm','Тёплый'],['official','Официальный'],['fun','Весёлый'],['touch','Трогательный'],['poem','В стихах']];
const PA_LEN=[['short','Коротко'],['mid','Средне'],['long','Подробно']];
const PA_LANG=[['ru','Русский'],['hy','Армянский'],['en','Английский']];
const PA_TO=['маме','папе','бабушке','дедушке','подруге','другу','сестре','брату','любимой','любимому','мужу','жене','коллеге','руководителю','учителю','ребёнку','семье','молодожёнам','клиентам'];
const PA_EN={bday:'birthday',anniv:'jubilee / milestone birthday',wedding:'wedding day',family:'wedding anniversary',love:'a love note for a beloved person',ny:'New Year and Christmas',mar8:'International Women\'s Day, March 8',feb23:'Defender of the Fatherland Day, February 23 (men\'s day)',mom:'a card for mom (Mother\'s Day / just for mom)',baby:'birth of a baby',grad:'graduation',teacher:'thanks to a teacher (Teacher\'s Day)',thanks:'thank-you note',home:'housewarming',easter:'Easter',any:'just because, no special occasion'};
/* offline library: [lang, occasions, tone, text] */
const PA_LIB=[
['ru','bday','warm','С днём рождения!\nПусть этот год будет щедрым на радость, добрых людей и тихие счастливые вечера. Пусть всё задуманное сбывается легко, а рядом всегда будут те, кто любит тебя по-настоящему.'],
['ru','bday','fun','С днём рождения!\nЖелаю, чтобы торт был большим, будильник — добрым, а зарплата — неприлично высокой. Возраст — это просто цифра, и сегодня она у тебя особенно красивая!'],
['ru','bday','touch','С днём рождения!\nСпасибо, что ты есть. Рядом с тобой мир становится теплее, а дни — светлее. Пусть жизнь отвечает тебе той же добротой, которую ты даришь другим.'],
['ru','bday','official','Примите искренние поздравления с днём рождения!\nЖелаем крепкого здоровья, неиссякаемой энергии, профессиональных успехов и благополучия Вам и Вашим близким.'],
['ru','bday','official','Поздравляем с днём рождения!\nСпасибо за Ваш профессионализм и надёжность. Желаем здоровья, вдохновения, успехов во всех начинаниях и ярких событий в новом году жизни.'],
['ru','bday','poem','С днём рождения! Желаю\nСолнца, счастья и тепла,\nЧтобы жизнь, как лето в мае,\nЯрко, радостно цвела.\nПусть удача будет рядом,\nПусть хранит тебя любовь,\nИ чудесных дней в награду\nЖизнь подарит вновь и вновь!'],
['ru','bday mom','poem','Мама, милая, родная,\nС днём рождения тебя!\nПусть душа твоя, сияя,\nБудет счастлива, любя.\nПусть здоровье будет крепким,\nВ доме — радость и уют,\nА тепло твоё и нежность\nНас по жизни берегут.'],
['ru','bday','fun','С днём рождения!\nПусть сегодня будет много шариков, торт со свечками, подарки до потолка и самые весёлые игры с друзьями!'],
['ru','bday','touch','Бабушка, с днём рождения!\nТвои руки — самые тёплые, а сказки — самые добрые. Будь здорова, живи долго и радуйся каждому дню вместе с нами.'],
['ru','anniv','official','Сердечно поздравляем с юбилеем!\nЖелаем крепкого здоровья, долгих и счастливых лет, уважения коллег и тепла родных. Пусть мудрость и опыт приносят радость, а впереди ждёт ещё много ярких событий.'],
['ru','anniv','warm','С юбилеем!\nЭта дата — повод вспомнить всё хорошее и мечтать о большем. Пусть каждый новый день дарит здоровье, любовь близких и маленькие радости, из которых и складывается счастье.'],
['ru','anniv','fun','С юбилеем!\nГоворят, лучшие годы впереди — так что пристегнитесь, будет интересно! Желаем энергии как в двадцать, мудрости как в сто и чувства юмора на все времена.'],
['ru','wedding','warm','Поздравляем с днём свадьбы!\nПусть ваш союз будет крепким, а дом — тёплым и светлым. Берегите друг друга, чаще смейтесь вместе и помните этот день как начало большого счастья.'],
['ru','wedding','official','Примите сердечные поздравления с бракосочетанием!\nЖелаем вам взаимопонимания, благополучия и любви, которая с годами становится только крепче.'],
['ru','wedding','touch','Сегодня две истории стали одной.\nПусть в ней будет много светлых глав, тёплых вечеров и тихого счастья вдвоём. Любите, берегите и слышьте друг друга — всегда.'],
['ru','wedding','fun','С днём свадьбы!\nТеперь у вас общая фамилия, общий холодильник и один на двоих спор о том, кто первым сказал «люблю». Пусть так весело будет всю жизнь!'],
['ru','wedding','poem','Пусть любовь ваша будет как море —\nБесконечной, глубокой, живой,\nПусть обходит вас стороной горе,\nА удача идёт за спиной!'],
['ru','family','warm','С годовщиной свадьбы!\nПусть ваша любовь остаётся такой же нежной, как в первый день, и такой же крепкой, как сейчас. Пусть каждый год вместе будет счастливее предыдущего.'],
['ru','family','touch','Столько лет вместе — и всё так же рядом.\nСпасибо вам за пример настоящей любви. Пусть ваш дом всегда будет полон тепла, а сердца — нежности.'],
['ru','love','warm','Ты делаешь мои дни светлее.\nСпасибо за каждую улыбку, за тепло и заботу. Я очень тебя люблю.'],
['ru','love','fun','С тобой даже обычный вторник похож на праздник.\nСпасибо, что ты рядом. Люблю тебя!'],
['ru','love','touch','Ты — мой дом, где бы мы ни были.\nМоё спокойствие, моя радость и самое большое счастье. Люблю тебя всем сердцем.'],
['ru','love','poem','С тобою рядом — всё светлее,\nС тобою проще жить и ждать.\nЛюблю тебя ещё сильнее,\nЧем в силах слово передать.'],
['ru','ny','warm','С Новым годом!\nПусть он принесёт в ваш дом тепло, здоровье и много поводов для радости. Пусть сбудется всё, что загадано под бой курантов.'],
['ru','ny','official','Поздравляем с Новым годом и Рождеством!\nБлагодарим за доверие и желаем вам успешного года, новых достижений, благополучия и праздничного настроения.'],
['ru','ny','fun','С Новым годом!\nПусть мандарины будут сладкими, подарки — желанными, а понедельники — лёгкими. И пусть всё получается с первого раза!'],
['ru','ny','poem','Пусть Новый год придёт с добром,\nНаполнит светом каждый дом,\nПодарит радость и уют,\nИ чудеса, что долго ждут.'],
['ru','mar8','warm','С 8 Марта!\nПусть весна подарит нежность, вдохновение и солнечное настроение. Будьте любимы, счастливы и окружены вниманием каждый день.'],
['ru','mar8','official','Дорогие женщины! Поздравляем с Международным женским днём!\nЖелаем весеннего настроения, здоровья, благополучия и исполнения всех желаний.'],
['ru','mar8','poem','Пусть весна подарит нежность,\nСолнце, радость и цветы,\nСчастье, лёгкость, безмятежность —\nИ исполнятся мечты!'],
['ru','feb23','warm','С Днём защитника Отечества!\nЖелаем силы духа, крепкого здоровья, надёжных друзей рядом и уверенности в каждом шаге.'],
['ru','feb23','fun','С 23 Февраля!\nПусть машина заводится с полоборота, любимая команда побеждает, а ужин всегда ждёт горячим. Ты наш герой!'],
['ru','feb23','poem','Пусть будет крепким дух и тело,\nУдача — верною в пути,\nПусть спорится любое дело\nИ сил хватает всё пройти!'],
['ru','mom','warm','Мамочка, с праздником!\nСпасибо за твою любовь, терпение и бесконечную заботу. Пусть каждый день будет тёплым и светлым — таким же, как ты.'],
['ru','mom','touch','Мама, ты — первое слово и самое родное сердце.\nВсё лучшее во мне — от тебя. Будь здорова и счастлива, я очень тебя люблю.'],
['ru','baby','warm','С рождением малыша!\nПусть он растёт здоровым, любознательным и счастливым, а ваш дом наполнится детским смехом и нежностью.'],
['ru','baby','official','Поздравляем с пополнением в семье!\nЖелаем малышу крепкого здоровья, а родителям — терпения, радости и спокойных ночей.'],
['ru','baby','poem','Родился маленький человек —\nПусть будет счастлив он весь век!\nРастёт здоровым, озорным,\nЛюбимым, светлым и родным.'],
['ru','grad','warm','С выпускным!\nВпереди целый мир возможностей. Смело выбирай свою дорогу и верь в себя — у тебя всё обязательно получится.'],
['ru','grad','fun','Поздравляю с выпуском!\nДомашние задания закончились, а настоящие приключения только начинаются. Пусть каждый новый старт будет удачным!'],
['ru','teacher','official','Уважаемый учитель!\nБлагодарим Вас за знания, терпение и мудрость. Желаем крепкого здоровья, вдохновения и благодарных учеников.'],
['ru','teacher','warm','Спасибо за уроки, которые не заканчиваются звонком.\nВы научили нас думать, верить в себя и не сдаваться. С праздником!'],
['ru','teacher','poem','Спасибо Вам за знанья и терпенье,\nЗа доброту, за мудрость и совет.\nПусть каждый день приносит вдохновенье,\nА в Вашем доме будет тёплый свет.'],
['ru','thanks','warm','Спасибо тебе!\nЗа помощь, поддержку и доброе сердце. Такие люди, как ты, делают мир лучше.'],
['ru','thanks','official','Выражаем искреннюю благодарность за плодотворное сотрудничество.\nЖелаем дальнейших успехов, процветания и новых совместных проектов.'],
['ru','home','warm','С новосельем!\nПусть новый дом будет уютным и светлым, стены — тёплыми, а двери — всегда открытыми для друзей.'],
['ru','home','fun','С новосельем!\nПусть соседи будут тихими, интернет — быстрым, а коробки разберутся сами. Счастья в новом доме!'],
['ru','easter','warm','Христос воскрес!\nПусть светлый праздник Пасхи принесёт в ваш дом мир, радость и надежду. Добра, любви и благополучия вам и вашим близким.'],
['ru','any','warm','Без всякого повода — просто чтобы напомнить: ты делаешь этот мир добрее.\nПусть сегодня будет хороший день.'],
['ru','any','fun','Это открытка-напоминание:\nпить воду, радоваться мелочам и не забывать, что ты — лучший человек на свете.'],
['ru','any','touch','Пусть у тебя всё будет хорошо.\nПусть тревоги уходят, мечты сбываются, а рядом всегда будут те, кто тебя любит.'],
['hy','bday','warm','Շնորհավոր ծնունդդ։\nԹող այս տարին լինի լի ջերմությամբ, սիրով և նոր հաջողություններով։ Թող բոլոր երազանքներդ իրականանան։'],
['hy','bday','official','Ընդունեք մեր սրտանց շնորհավորանքները Ձեր ծննդյան օրվա առթիվ։\nՄաղթում ենք քաջառողջություն, բարեկեցություն և նոր հաջողություններ։'],
['hy','bday','fun','Շնորհավոր ծնունդդ։\nՄնա միշտ նույնքան երիտասարդ, ուրախ ու անկրկնելի։ Թող տորթը լինի մեծ, իսկ նվերները՝ շատ։'],
['hy','mom bday','touch','Սիրելի՛ մայրիկ,\nշնորհակալ եմ քո սիրո և հոգատարության համար։ Թող ամեն օրդ լինի լուսավոր ու ջերմ, ինչպես դու ես։'],
['hy','ny','warm','Շնորհավոր Նոր տարի և Սուրբ Ծնունդ։\nԹող նոր տարին ձեր տուն բերի խաղաղություն, առողջություն և շատ ուրախ պահեր։'],
['hy','wedding','warm','Շնորհավորում ենք ձեր հարսանիքի օրվա առթիվ։\nԹող ձեր սերը տարեցտարի ավելի ամուր դառնա, իսկ ձեր օջախը միշտ լի լինի ջերմությամբ և ծիծաղով։'],
['hy','family','warm','Շնորհավոր ամուսնության տարեդարձը։\nԹող ձեր սերը մնա նույնքան ջերմ, որքան առաջին օրը։'],
['hy','thanks','warm','Շնորհակալություն ամեն ինչի համար։\nՔո բարությունը և աջակցությունը ինձ համար շատ թանկ են։'],
['hy','love','touch','Դու իմ ամենամեծ երջանկությունն ես։\nՍիրում եմ քեզ ամբողջ սրտով։'],
['hy','mar8','warm','Շնորհավոր մարտի 8-ը։\nԹող ձեր կյանքը լինի գեղեցիկ ու նուրբ, ինչպես գարնան առաջին ծաղիկները։'],
['hy','baby','warm','Շնորհավորում ենք փոքրիկի ծննդյան կապակցությամբ։\nԹող նա մեծանա առողջ, ուրախ և սիրված։'],
['hy','anniv','official','Շնորհավոր հոբելյանդ։\nՄաղթում եմ քաջառողջություն, երկար ու բարի տարիներ և շատ ուրախ պահեր հարազատների կողքին։'],
['hy','grad','warm','Շնորհավորում եմ ուսումդ ավարտելու կապակցությամբ։\nԹող առջևում սպասեն նոր հնարավորություններ և մեծ հաջողություններ։'],
['hy','easter','warm','Քրիստոս հարյավ ի մեռելոց։\nՕրհնյալ է Հարությունը Քրիստոսի։ Թող Սուրբ Զատիկը ձեր տուն բերի խաղաղություն և լույս։'],
['hy','home','warm','Շնորհավոր նոր տունը։\nԹող այն միշտ լի լինի լույսով, սիրով և սիրելի հյուրերով։'],
['hy','teacher','official','Սիրելի՛ ուսուցիչ,\nշնորհակալություն Ձեր համբերության, գիտելիքների և ջերմության համար։ Մաղթում ենք առողջություն և ոգեշնչում։'],
['hy','any','warm','Պարզապես ուզում էի ասել՝ դու հրաշալի մարդ ես։\nԹող այսօրը լինի լավ օր։'],
['en','bday','warm','Happy birthday!\nMay this year bring you sunny mornings, good people and quiet happy evenings. Wishing you everything you are hoping for — and a little more.'],
['en','bday','fun','Happy birthday!\nAge is just a number — and yours looks great today. May the cake be big, the candles few and the party unforgettable.'],
['en','bday','official','Warmest birthday wishes!\nWe wish you good health, success in all your endeavours and many bright moments in the year ahead.'],
['en','wedding','warm','Congratulations on your wedding!\nMay your home be full of laughter, your hearts full of patience, and your days together full of love.'],
['en','family','touch','Happy anniversary!\nAfter all these years you still look at each other the same way. Thank you for showing us what real love looks like.'],
['en','love','touch','You are my favourite place to be.\nThank you for every smile, every hug and every ordinary day that feels special with you. I love you.'],
['en','ny','warm','Happy New Year and Merry Christmas!\nMay the coming year bring peace to your home, health to your family and joy to every day.'],
['en','mar8','warm','Happy Women\'s Day!\nMay spring bring you tenderness, inspiration and a reason to smile every single day.'],
['en','mom','touch','Mom, thank you for your endless love and care.\nEverything good in me started with you. Stay healthy and happy — I love you.'],
['en','baby','warm','Welcome to the world, little one!\nWishing the new baby good health and the happy parents lots of joy, patience and peaceful nights.'],
['en','grad','warm','Congratulations, graduate!\nThe whole world is ahead of you. Be brave, stay curious and believe in yourself — you\'ve got this.'],
['en','thanks','warm','Thank you!\nFor your help, your support and your kind heart. People like you make the world a better place.'],
['en','teacher','official','Dear teacher,\nthank you for your knowledge, patience and wisdom. We wish you good health, inspiration and grateful students.'],
['en','home','fun','Happy housewarming!\nMay your neighbours be quiet, your Wi-Fi be fast and your boxes unpack themselves.'],
['en','anniv','official','Congratulations on your jubilee!\nWishing you good health, many happy years ahead and the warmth of your loved ones.'],
['en','any','warm','No reason at all —\njust a little reminder that you make the world kinder. Have a wonderful day.'],
['en','easter','warm','Happy Easter!\nMay this bright holiday fill your home with peace, hope and joy.']];
let paRes={list:[],src:'',busy:false,err:'',seen:[]}, paTarget=null, paLibOff=0;
const paOccName=k=>(PA_OCC.find(o=>o[0]===k)||PA_OCC[0])[1];
function paSettings(){ if(!KS.neuro){ toast('Нужен модуль «Нейро-стиль»'); return; } KS.neuro.settings(); const m=document.getElementById('ksm-neuro'); if(m&&m.nextElementSibling) document.body.appendChild(m); /* show above our dialog */ }
const paHasKey=()=>!!(KS.neuro&&KS.neuro.hasKey());
const paIsPC=()=>!!(st.dz&&['pcH','pcV'].includes(st.dz.kind));
function paName(text,lang,name){ name=(name||'').trim(); if(!name) return text; return (lang==='en'?'Dear '+name+',\n':lang==='hy'?'Սիրելի՛ '+name+',\n':name+'!\n')+text; }
function paLib(more){ const s=PA(), occ=s.occ==='own'?'any':s.occ; const L=PA_LIB.filter(x=>x[0]===s.lang).map((x,i)=>({x,i,sc:(x[1].split(' ').includes(occ)?4:x[1]==='any'?1:0)+(x[2]===s.tone?2:0)+(/мам|mom|մայր/i.test(s.to)&&x[1].includes('mom')?1:0)}));
  L.sort((a,b)=>b.sc-a.sc||a.i-b.i); const top=L.filter(x=>x.sc>=4).length>=2?L.filter(x=>x.sc>=1):L; if(more) paLibOff+=4; else paLibOff=0;
  const out=[]; for(let k=0;k<Math.min(4,top.length);k++){ const it=top[(paLibOff+k)%top.length]; if(!out.includes(it)) out.push(it); }
  return out.map(({x})=>({title:paOccName(x[1].split(' ')[0])+' · '+(PA_TONE.find(t=>t[0]===x[2])||['',''])[1].toLowerCase(),text:paName(x[3],x[0],s.name)})); }
function paPrompt(avoid){ const s=PA(), occ=s.occ==='own'?(s.own||'any occasion'):PA_EN[s.occ]||s.occ;
  const tone={warm:'warm and sincere',official:'formal and respectful (use the polite form of address)',fun:'light, cheerful and witty but kind',touch:'touching and heartfelt',poem:'a rhymed poem with a steady meter and exact rhymes'}[s.tone];
  const len=s.tone==='poem'?{short:'4 lines',mid:'8 lines',long:'12 lines'}[s.len]:{short:'about 12–20 words',mid:'about 25–45 words',long:'about 55–80 words'}[s.len];
  const lang={ru:'Russian',hy:'Eastern Armenian in Armenian script (as spoken in Yerevan), grammatically perfect',en:'English'}[s.lang];
  return `You write greeting texts for printed postcards made in a small print shop in Yerevan, Armenia.\nWrite 4 clearly different variants of a greeting (different ideas and wording, not paraphrases).\nOccasion: ${occ}.\nRecipient: ${s.to||'not specified'}.\nRecipient's name: ${s.name?s.name:'not specified — do not invent a name, do not use placeholders'}.\n${s.extra?'Details to mention naturally: '+s.extra+'.\n':''}Tone: ${tone}.\nLength of each variant: ${len}.\nLanguage of the greeting text: ${lang}.\nRules: natural living language, no clichés pile-up, no emojis, no hashtags, no quotation marks around the text, no signature, no placeholders like [Name]. Put line breaks (\\n) where a postcard needs them (after the opening line${s.tone==='poem'?', after every line of the poem':''}).\n${avoid&&avoid.length?'Do not repeat or paraphrase these earlier variants:\n'+avoid.slice(-8).map(t=>'- '+t.replace(/\n/g,' ').slice(0,160)).join('\n')+'\n':''}Answer only with JSON: {"variants":[{"title":"2–4 word label in Russian naming the idea","text":"the greeting"}]}`; }
function paParse(t){ let s=String(t||'').trim().replace(/^```(?:json)?\s*/i,'').replace(/```\s*$/,''), j=null; try{ j=JSON.parse(s); }catch(_){ const m=s.match(/[\[{][\s\S]*[\]}]/); if(m) try{ j=JSON.parse(m[0]); }catch(__){} }
  const a=Array.isArray(j)?j:(j&&(j.variants||j.items||j.texts||j.greetings))||[];
  return a.map(v=>typeof v==='string'?{title:'',text:v}:{title:v&&v.title||'',text:v&&(v.text||v.greeting||v.body)||''}).map(v=>({title:String(v.title).trim().slice(0,40),text:String(v.text).replace(/\\n/g,'\n').replace(/\r/g,'').replace(/^["«»]+|["«»]+$/g,'').replace(/\n{3,}/g,'\n\n').trim()})).filter(v=>v.text).slice(0,4); }
async function paGenerate(more){ if(paRes.busy) return; if(!paHasKey()){ paRes={list:paLib(more),src:'lib',busy:false,err:'',seen:[]}; paRenderRes(); return; }
  const avoid=more?paRes.seen.slice():[]; paRes.busy=true; paRes.err=''; paRenderRes();
  try{ const t=await KS.neuro.text(paPrompt(avoid),{json:true}); const L=paParse(t); if(!L.length) throw new Error('Gemini ответил непонятно. Нажмите ещё раз.');
    paRes={list:L,src:'ai',busy:false,err:'',seen:avoid.concat(L.map(v=>v.text))}; }
  catch(e){ paRes={list:paLib(more),src:'lib',busy:false,err:(e&&e.message||'Не получилось')+' Пока — готовые тексты из библиотеки.',seen:avoid}; }
  paRenderRes(); }
/* ---- modal ---- */
const pam=KS.modal({id:'pcaiText',title:'Текст-поздравление',wide:true,onClose(){ paTarget=null; }});
function paOpen(targetId){ const s0=KS.sel(); paTarget=targetId||(s0&&s0.t==='text'?s0.id:null); paRender(); pam.open();
  if(!paRes.list.length&&!paRes.busy&&!paHasKey()) paGenerate(false); }
const paChips=(key,list,cur)=>`<div class="pa-chips" role="group" data-pachips="${key}">${list.map(([k,n])=>`<button type="button" class="pa-chip${cur===k?' on':''}" data-pachip="${k}">${n}</button>`).join('')}</div>`;
function paTargetText(){ const t=paTarget&&dzFind(paTarget); if(t&&t.t==='text') return 'в выделенный текст «'+esc((t.text||'').split('\n')[0].slice(0,26))+'»';
  if(dzOn()&&paIsPC()){ const m=paMain(); return m?'на оборот открытки, вместо текста письма':'на оборот открытки, новым текстом'; } return 'новым текстом на макет'; }
function paRender(){ const s=PA(), key=paHasKey();
  pam.el.innerHTML=`<div class="pa-wrap"><form class="pa-form" onsubmit="return false">
    ${key?'':`<div class="pa-key"><b>ИИ-тексты под ваш повод</b><span>Подключите ключ Gemini — тексты будут писаться заново под имя, тон и детали.</span><button type="button" class="btn sm" data-paset="1">Подключить Gemini</button></div>`}
    <label class="f">Повод<select data-pa="occ">${PA_OCC.map(([k,n])=>`<option value="${k}"${s.occ===k?' selected':''}>${n}</option>`).join('')}</select></label>
    <label class="f" data-paown${s.occ==='own'?'':' hidden'}>Свой повод<input type="text" data-pa="own" value="${esc(s.own||'')}" placeholder="Открытие кафе, первый зуб…" maxlength="80"></label>
    <div class="row2"><label class="f">Кому<input type="text" data-pa="to" list="paToList" value="${esc(s.to||'')}" placeholder="маме…" maxlength="40"></label><label class="f">Имя<input type="text" data-pa="name" value="${esc(s.name||'')}" placeholder="Анна" maxlength="40"></label></div>
    <datalist id="paToList">${PA_TO.map(t=>`<option value="${t}">`).join('')}</datalist>
    <div class="hd2">Тон</div>${paChips('tone',PA_TONE,s.tone)}
    <div class="hd2">Длина</div>${paChips('len',PA_LEN,s.len)}
    <div class="hd2">Язык</div>${paChips('lang',PA_LANG,s.lang)}
    <label class="f"><span>Что упомянуть <span class="pa-opt">· необязательно</span></span><input type="text" data-pa="extra" value="${esc(s.extra||'')}" placeholder="любит горы, 30 лет вместе…" maxlength="120"></label>
    <button type="button" class="btn primary pa-go" data-pago="1">${KS.icon('<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>')}${key?'Написать 4 варианта':'Подобрать из библиотеки'}</button>
    <div class="pa-where">${KS.icon('<path d="M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>')}<span>Вставка: <b data-pawhere>${paTargetText()}</b></span></div>
  </form><section class="pa-res" aria-live="polite"></section></div>`;
  paRenderRes(); }
function paRenderRes(){ const box=pam.el.querySelector('.pa-res'); if(!box) return; const s=PA();
  const hd=`<div class="pa-reshd"><b>Варианты</b>${paRes.src==='ai'?'<span class="ks-badge ok">Gemini</span>':paRes.src==='lib'?'<span class="ks-badge">Библиотека</span>':''}<span class="ks-sp"></span>${paRes.list.length||paRes.busy?`<button type="button" class="btn sm" data-pamore="1"${paRes.busy?' disabled':''}>${KS.icon('<path d="M21 12a9 9 0 11-3-6.7L21 8"/><path d="M21 3v5h-5"/>')}Ещё варианты</button>`:''}</div>`;
  const err=paRes.err?`<div class="pa-err">${esc(paRes.err)}</div>`:'';
  if(paRes.busy){ box.innerHTML=hd+`<div class="pa-cards">${[0,1,2,3].map(()=>'<article class="pa-card pa-skel"><i></i><i></i><i></i><i class="s"></i></article>').join('')}</div><p class="hint pa-wait">Gemini пишет тексты… обычно 3–8 секунд</p>`; return; }
  if(!paRes.list.length){ box.innerHTML=hd+err+`<div class="ks-empty pa-empty">${KS.icon('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/>')}<b>Выберите повод, тон и язык</b><span>и нажмите «Написать 4 варианта». Тексты можно вставить в открытку одним нажатием.</span>${paHasKey()?'<button type="button" class="btn sm" data-palib="1">Показать готовые из библиотеки</button>':''}</div>`; return; }
  box.innerHTML=hd+err+`<div class="pa-cards">${paRes.list.map((v,i)=>{ const words=v.text.split(/\s+/).filter(Boolean).length;
    return `<article class="pa-card"><div class="pa-cardhd"><span class="pa-num">${i+1}</span><b>${esc(v.title||'Вариант '+(i+1))}</b></div><div class="pa-txt" lang="${s.lang}">${esc(v.text)}</div><div class="pa-cardft"><button type="button" class="btn sm primary" data-pains="${i}">Вставить</button><button type="button" class="btn sm" data-pacopy="${i}">Копировать</button><span class="pa-len">${words} ${words%10===1&&words%100!==11?'слово':words%10>=2&&words%10<=4&&(words%100<10||words%100>=20)?'слова':'слов'}</span></div></article>`; }).join('')}</div>`; }
pam.el.addEventListener('click',e=>{ const t=e.target; let b;
  if((b=t.closest('[data-pachip]'))){ const k=b.closest('[data-pachips]').dataset.pachips; PA()[k]=b.dataset.pachip; KS.save(); b.parentElement.querySelectorAll('.pa-chip').forEach(x=>x.classList.toggle('on',x===b)); if(paRes.src==='lib'&&!paRes.busy){ paRes.list=paLib(false); paRenderRes(); } return; }
  if(t.closest('[data-pago]')){ paGenerate(false); return; }
  if(t.closest('[data-pamore]')){ paGenerate(true); return; }
  if(t.closest('[data-palib]')){ paRes={list:paLib(false),src:'lib',busy:false,err:'',seen:[]}; paRenderRes(); return; }
  if(t.closest('[data-paset]')){ paSettings(); return; }
  if((b=t.closest('[data-pains]'))){ const v=paRes.list[+b.dataset.pains]; if(v) paInsert(v.text); return; }
  if((b=t.closest('[data-pacopy]'))){ const v=paRes.list[+b.dataset.pacopy]; if(v) paCopy(v.text,b); return; } });
pam.el.addEventListener('input',e=>{ const k=e.target.dataset&&e.target.dataset.pa; if(!k) return; PA()[k]=e.target.value; KS.save(); });
pam.el.addEventListener('change',e=>{ const k=e.target.dataset&&e.target.dataset.pa; if(!k) return; PA()[k]=e.target.value; KS.save(); if(k==='occ'){ const o=pam.el.querySelector('[data-paown]'); if(o) o.hidden=e.target.value!=='own'; if(paRes.src==='lib'&&!paRes.busy){ paRes.list=paLib(false); paRenderRes(); } } });
KS.on('neuroKey',()=>{ if(pam.open_) paRender(); });
function paCopy(text,b){ const ok=()=>{ toast('Текст скопирован'); if(b){ const o=b.textContent; b.textContent='Скопировано ✓'; setTimeout(()=>{ b.textContent=o; },1400); } };
  const fb=()=>{ try{ const ta=document.createElement('textarea'); ta.value=text; ta.setAttribute('readonly',''); ta.style.cssText='position:fixed;left:-9999px;top:0'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); ok(); }catch(_){ toast('Не удалось скопировать'); } };
  try{ if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok,fb); else fb(); }catch(_){ fb(); } }
/* ---- inserting into the design ---- */
function paMain(){ return dzEls('back').find(x=>x.t==='text'&&x.pcMsg&&!x.hide)||dzEls('back').filter(x=>x.t==='text'&&!x.hide&&!x.k&&(+x.w)*(+x.h)>=1200).sort((a,b)=>b.w*b.h-a.w*a.h)[0]||null; }
function paArea(){ const d=st.dz, W=d.w, H=d.h, v=H>W; const a=v?{x:12,y:26,w:W-24,h:30}:{x:12,y:26,w:Math.min(62,W/2-14),h:H-26-28};
  dzEls('back').forEach(o=>{ if(o.hide||o.t==='line'||o.pcMsg) return; const ox=+o.x, oy=+o.y, ow=+o.w, oh=+o.h; if(ox>=a.x+a.w||ox+ow<=a.x||oy>=a.y+a.h||oy+oh<=a.y) return;
    if(oy+oh/2<a.y+a.h/2){ const ny=oy+oh+2; a.h-=ny-a.y; a.y=ny; } else a.h=oy-2-a.y; });
  if(a.h<14) return v?{x:12,y:26,w:W-24,h:30}:{x:12,y:26,w:Math.min(62,W/2-14),h:H-26-28}; return a; }
function paFamily(e){ const f=dzFont(e.font,st.dz)||''; const m=f.match(/'([^']+)'/); return m?m[1]:''; }
async function paFit(e,maxPt,minPt){ const fam=paFamily(e); try{ if(document.fonts&&fam) await Promise.race([document.fonts.load(`20px "${fam}"`,e.text||'А'),new Promise(r=>setTimeout(r,1500))]); }catch(_){}
  const doc=st.dz, pal=dzPal(doc.pal), box=document.createElement('div'); box.style.cssText='position:fixed;left:-20000px;top:0;visibility:hidden;pointer-events:none'; document.body.appendChild(box);
  const fits=s=>{ box.innerHTML=dzElHTML(Object.assign({},e,{size:s,rot:0,hide:false}),doc,pal,{}); const o=box.querySelector('.dzt'), t=box.querySelector('.dztx'); if(!o||!t) return true; const cs=getComputedStyle(o), ph=parseFloat(cs.paddingTop)+parseFloat(cs.paddingBottom), pw=parseFloat(cs.paddingLeft)+parseFloat(cs.paddingRight); return t.scrollHeight<=o.clientHeight-ph+1&&t.scrollWidth<=o.clientWidth-pw+1; };
  try{ let lo=minPt||6, hi=maxPt||14; if(fits(hi)){ e.size=hi; return; } if(!fits(lo)){ e.size=lo; return; } for(let i=0;i<12&&hi-lo>.2;i++){ const m=(lo+hi)/2; if(fits(m)) lo=m; else hi=m; } e.size=Math.floor(lo*4)/4; }
  finally{ box.remove(); } }
async function paInsert(text){ try{ KS.ensureDesign(); let e=paTarget&&dzFind(paTarget); if(e&&e.t!=='text') e=null; let side=null, how='';
    if(e){ const max=Math.max(+e.size||10,6); e.text=text; if(e.k) delete e.k; await paFit(e,max,Math.min(6,max)); how='Текст заменён'; }
    else if(paIsPC()){ side='back'; const d=st.dz; if((d.sides||1)<2){ d.sides=2; if(st.shop) st.shop.sides=2; } e=paMain();
      if(e){ const max=e.pcMsg?Math.max(+e.pcMax||+e.size||12,6):Math.max(+e.size||12,6); e.text=text; await paFit(e,max,6); how='Текст на обороте открытки заменён'; }
      else { const a=paArea(), lang=PA().lang; e={id:dzId(),t:'text',x:Math.round(a.x*10)/10,y:Math.round(a.y*10)/10,w:Math.round(a.w*10)/10,h:Math.round(a.h*10)/10,text,font:lang==='en'&&text.length<140?'Great Vibes':'Marck Script',size:16,color:'ink',align:'center',va:'m',lh:1.28,pcMsg:1,pcMax:16};
        dzEls('back').forEach(o=>{ if(o.t==='line'&&!o.hide&&!(+o.rot)&&o.y+o.h/2>=e.y-1&&o.y+o.h/2<=e.y+e.h+1&&o.x<e.x+e.w&&o.x+o.w>e.x){ o.hide=true; o.pcaiHid=1; } });
        dzEls('back').push(e); await paFit(e,16,6); how='Текст добавлен на оборот открытки'; } }
    else { const d=st.dz, W=d.w, H=d.h, lang=PA().lang; side=dzSideOf(); e={id:dzId(),t:'text',x:Math.round(W*.12*10)/10,y:Math.round(H*.25*10)/10,w:Math.round(W*.76*10)/10,h:Math.round(H*.5*10)/10,text,font:lang==='en'&&text.length<140?'Great Vibes':'Marck Script',size:18,color:'ink',align:'center',va:'m',lh:1.28,pcMsg:1,pcMax:18};
      dzEls(side).push(e); await paFit(e,18,6); how='Текст добавлен на макет'; }
    if(side&&side!==dzSideOf()) setView(side); if(activeTab!=='dz'&&typeof goTab==='function') goTab('dz'); pam.close(); dzSelect(e.id); update(); toast(how+(e.size<7.5?'. Шрифт мелкий — увеличьте рамку текста или выберите вариант короче':'')); }
  catch(err){ console.error(err); toast('Не получилось вставить текст'); } }
/* entry points */
KS.tool({id:'pcai',label:'Текст ИИ',title:'Придумать текст-поздравление (Gemini или готовая библиотека)',app:'print',run(){ paOpen(); }});
KS.cmd('Текст-поздравление (ИИ)','открытки',()=>paOpen());
KS.insp({id:'pcai-t',title:'Текст-поздравление',order:12,when:e=>e.t==='text',html:()=>`<div class="ks-row"><button class="btn sm primary" data-patext="1">${KS.icon('<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/>')}Придумать текст</button><span class="hint">Gemini или готовые тексты</span></div>`,
  bind(div,e){ div.querySelector('[data-patext]').addEventListener('click',()=>paOpen(e.id)); }});
/* card in the «Открытки» panel (the panel is rebuilt by the postcard module, so the card is re-attached) */
function paCardHTML(){ return `<div class="card pa-pc"><div class="hd">Тексты и фото с ИИ</div>
  <button class="pa-pcbig" data-paopen="1"><span class="pa-pcic">${KS.icon('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/>')}</span><span><b>Текст-поздравление</b><small>4 варианта под повод, тон и язык</small></span></button>
  <p class="hint">Убрать фон и улучшить фото для печати: выделите фото на макете — кнопки появятся в его свойствах.</p></div>`; }
function paAttach(){ const sub=document.querySelector('[data-panel="ks-postcard"] .kssub'); if(!sub||sub.querySelector('.pa-pc')) return; const first=sub.querySelector(':scope > .card'); if(!first) return; first.insertAdjacentHTML('afterend',paCardHTML()); }
{ const sec=document.querySelector('[data-panel="ks-postcard"]'); if(sec) new MutationObserver(()=>paAttach()).observe(sec,{childList:true,subtree:true}); }
document.addEventListener('click',e=>{ if(e.target.closest('[data-paopen]')) paOpen(); });

/* ================= 2–3. Photos: background removal and print quality ================= */
const PA_BG='Remove the background completely. Keep the people / main subject exactly as they are (same pose, faces, clothes, colors, size and position in the frame) with clean, precise edges including hair. Output the subject on a pure white background (#FFFFFF), no shadows, no gradient, no frame, no text.';
const PA_UP='Upscale and restore this photo: sharper details, less noise and JPEG artefacts, natural skin, same content and colors. Do not change the composition, faces, expressions or framing. No text, no watermark.';
const paSz=new Map(), paBusy={};
const paKey=s=>s.length+':'+s.slice(-40);
async function paSize(src){ const k=paKey(src); if(paSz.has(k)) return paSz.get(k); const r=await KS.imgSize(src); paSz.set(k,r); return r; }
function paDpi(e,sz){ if(!sz||!sz.w||!sz.h||!(+e.w)||!(+e.h)) return 0; const z=Math.max(1,+e.z||1), fx=sz.w*25.4/e.w, fy=sz.h*25.4/e.h;
  if(e.fit==='fill') return Math.round(Math.min(fx,fy)); return Math.round((e.fit==='contain'?Math.max(fx,fy):Math.min(fx,fy))/z); }
const paLoad=src=>new Promise((res,rej)=>{ const im=new Image(); im.onload=()=>res(im); im.onerror=()=>rej(new Error('Не удалось открыть фото')); im.src=src; });
async function paKeepOrig(e){ if(!e.wcOrig){ const key=KS.uid('w'); await KS.idb.set('wc:'+key,e.src,'files'); e.wcOrig=key; } }
function paHasAlpha(d){ for(let i=3;i<d.length;i+=16) if(d[i]<250) return true; return false; }
/* white background → transparency: flood fill from the border, soft ramp, edge despill */
async function paCutout(src){ const im=await paLoad(src); const k=Math.min(1,2400/Math.max(im.naturalWidth,im.naturalHeight)), W=Math.max(1,Math.round(im.naturalWidth*k)), H=Math.max(1,Math.round(im.naturalHeight*k));
  const c=document.createElement('canvas'); c.width=W; c.height=H; const g=c.getContext('2d',{willReadFrequently:true}); g.drawImage(im,0,0,W,H); const id=g.getImageData(0,0,W,H), d=id.data, N=W*H;
  const bs=[[],[],[]]; const smp=(x,y)=>{ const i=(y*W+x)*4; bs[0].push(d[i]); bs[1].push(d[i+1]); bs[2].push(d[i+2]); }; for(let x=0;x<W;x+=Math.max(1,W>>7)){ smp(x,0); smp(x,H-1); } for(let y=0;y<H;y+=Math.max(1,H>>7)){ smp(0,y); smp(W-1,y); }
  const med=a=>{ a.sort((p,q)=>p-q); return a[a.length>>1]; }; let bg=bs.map(med); if(Math.min(...bg)<200) bg=[255,255,255];
  const LO=12, HI=52, dist=new Uint8Array(N); for(let i=0,p=0;i<N;i++,p+=4) dist[i]=Math.min(255,Math.max(Math.abs(d[p]-bg[0]),Math.abs(d[p+1]-bg[1]),Math.abs(d[p+2]-bg[2])));
  const reach=new Uint8Array(N), stack=new Int32Array(N); let sp=0; const seed=i=>{ if(!reach[i]&&dist[i]<HI){ reach[i]=1; stack[sp++]=i; } };
  for(let x=0;x<W;x++){ seed(x); seed((H-1)*W+x); } for(let y=0;y<H;y++){ seed(y*W); seed(y*W+W-1); }
  while(sp){ const i=stack[--sp], x=i%W; if(dist[i]>=LO*2.2) continue; /* do not spread through soft edge pixels */
    if(x>0) seed(i-1); if(x<W-1) seed(i+1); if(i>=W) seed(i-W); if(i<N-W) seed(i+W); }
  const A=new Uint8Array(N); for(let i=0;i<N;i++){ if(!reach[i]){ A[i]=255; continue; } const t=Math.max(0,Math.min(1,(dist[i]-LO)/(HI-LO))); A[i]=Math.round(255*t*t*(3-2*t)); }
  const A2=A.slice(); for(let y=1;y<H-1;y++) for(let x=1;x<W-1;x++){ const i=y*W+x; const a=A[i]; if(a===0||a===255){ const n=A[i-1]+A[i+1]+A[i-W]+A[i+W]; if(a===255&&n===1020) continue; if(a===0&&n===0) continue; }
    A2[i]=Math.round((A[i]*4+A[i-1]+A[i+1]+A[i-W]+A[i+W])/8); }
  for(let i=0,p=0;i<N;i++,p+=4){ const a=A2[i]; d[p+3]=a; if(a===0){ d[p]=d[p+1]=d[p+2]=0; continue; } if(a<255){ const f=a/255; for(let ch=0;ch<3;ch++){ const v=(d[p+ch]-bg[ch]*(1-f))/f; d[p+ch]=v<0?0:v>255?255:v; } } }
  g.putImageData(id,0,0); return c.toDataURL('image/png'); }
/* local 2× upscale with unsharp mask */
async function paUpLocal(src){ const im=await paLoad(src), w0=im.naturalWidth, h0=im.naturalHeight, k=Math.min(2,3600/Math.max(w0,h0)); if(k<1.15) throw new Error('Фото уже большое — увеличивать дальше нет смысла');
  const W=Math.round(w0*k), H=Math.round(h0*k), c=document.createElement('canvas'); c.width=W; c.height=H; const g=c.getContext('2d',{willReadFrequently:true}); g.imageSmoothingEnabled=true; g.imageSmoothingQuality='high';
  /* two-step resample looks smoother than one big jump */ if(k>1.5){ const m=document.createElement('canvas'); m.width=Math.round(w0*1.41); m.height=Math.round(h0*1.41); const mg=m.getContext('2d'); mg.imageSmoothingQuality='high'; mg.drawImage(im,0,0,m.width,m.height); g.drawImage(m,0,0,W,H); } else g.drawImage(im,0,0,W,H);
  const id=g.getImageData(0,0,W,H), d=id.data, alpha=paHasAlpha(d), N=W*H, b=new Float32Array(N*3), t=new Float32Array(N*3);
  for(let i=0,p=0;i<N;i++,p+=4){ b[i*3]=d[p]; b[i*3+1]=d[p+1]; b[i*3+2]=d[p+2]; }
  const pass=(src2,dst,horiz)=>{ for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const i=(y*W+x)*3; for(let ch=0;ch<3;ch++){ let s=src2[i+ch]*2, n=2; if(horiz){ if(x>0){ s+=src2[i-3+ch]; n++; } if(x<W-1){ s+=src2[i+3+ch]; n++; } } else { if(y>0){ s+=src2[i-W*3+ch]; n++; } if(y<H-1){ s+=src2[i+W*3+ch]; n++; } } dst[i+ch]=s/n; } } };
  pass(b,t,true); pass(t,b,false); pass(b,t,true); pass(t,b,false);
  const AM=.85, TH=2; for(let i=0,p=0;i<N;i++,p+=4) for(let ch=0;ch<3;ch++){ const o=d[p+ch], diff=o-b[i*3+ch]; if(Math.abs(diff)>TH){ const v=o+AM*diff; d[p+ch]=v<0?0:v>255?255:v; } }
  g.putImageData(id,0,0); return alpha?c.toDataURL('image/png'):c.toDataURL('image/jpeg',.92); }
const paBadge=dpi=>dpi>=250?`<span class="ks-badge ok">${dpi} dpi</span>`:dpi>=150?`<span class="ks-badge warn">${dpi} dpi</span>`:`<span class="ks-badge bad">${dpi} dpi</span>`;
const paSpin='<span class="pa-spin" aria-hidden="true"></span>';
async function paRun(e,kind){ const id=e.id; if(paBusy[id]) return; if((kind==='ai'||kind==='bg')&&!paHasKey()){ paSettings(); return; }
  paBusy[id]=kind; if(typeof renderDzInsp==='function') renderDzInsp();
  try{ const src=e.src, sz=await paSize(src), d0=paDpi(e,sz); let out;
    if(kind==='bg'){ const raw=await KS.neuro.edit(src,PA_BG); out=await paCutout(raw); }
    else if(kind==='ai') out=await KS.neuro.edit(src,PA_UP,{big:true});
    else { await new Promise(r=>setTimeout(r,30)); out=await paUpLocal(src); }
    const t=dzFind(id)||e; if(t.src!==src){ toast('Фото поменялось, пока шла обработка — результат не применён'); return; }
    await paKeepOrig(t); t.src=out;
    if(kind==='bg'){ t.aiCut=out.length; toast('Фон убран — фото можно положить поверх любого фона'); }
    else { const s2=await paSize(out), d1=paDpi(t,s2), prev=t.aiUp&&t.aiUp.n===src.length?t.aiUp.d0:d0; t.aiUp={d0:prev,n:out.length}; toast('Готово: было '+prev+' dpi, стало '+d1+' dpi'); } }
  catch(err){ toast((err&&err.message)||'Не получилось обработать фото'); }
  finally{ delete paBusy[id]; update(); } }
async function paRestore(e){ if(!e.wcOrig) return; const o=await KS.idb.get('wc:'+e.wcOrig,'files'); if(!o){ toast('Оригинал не найден'); return; } e.src=o; delete e.wcOrig; delete e.aiUp; delete e.aiCut; update(); toast('Исходное фото возвращено'); }
const paIsPhoto=e=>e.t==='img'&&!!e.src&&e.k!=='logo';
KS.insp({id:'pcai-q',title:'Качество для печати',order:28,when:paIsPhoto,
  html:e=>`<div class="pa-q"><div class="pa-qrow" data-paqrow>${paSpin}<span class="hint">Считаю разрешение…</span></div><div class="pa-qbtns" data-paqbtns></div></div>`,
  bind(div,e){ const fill=async()=>{ const sz=await paSize(e.src), dpi=paDpi(e,sz), row=div.querySelector('[data-paqrow]'), bt=div.querySelector('[data-paqbtns]'); if(!row||!bt) return;
      const up=e.aiUp&&e.aiUp.n===e.src.length, busy=paBusy[e.id], key=paHasKey();
      const msg=dpi>=300?'Отлично для печати':dpi>=250?'Хорошо для печати':dpi>=150?'Может выйти мягковато':'Будет размыто — улучшите фото';
      row.innerHTML=`${paBadge(dpi)}<span class="pa-qtx"><b>${msg}</b><small>${sz.w}×${sz.h} px на ${Math.round(e.w)}×${Math.round(e.h)} мм</small></span>`;
      let h=''; if(up) h+=`<div class="pa-ba"><span>Было</span>${paBadge(e.aiUp.d0)}<span class="pa-arr">→</span><span>стало</span>${paBadge(dpi)}</div>`;
      if(busy==='ai'||busy==='up') h+=`<div class="pa-busy">${paSpin}${busy==='ai'?'Gemini улучшает фото… 10–30 секунд':'Улучшаю фото…'}</div>`;
      else if(dpi<250) h+=`<div class="flexw">${key?'<button class="btn sm primary" data-paq="ai">Улучшить (Gemini)</button>':'<button class="btn sm primary" data-paq="set">Подключить Gemini</button>'}<button class="btn sm" data-paq="up">Улучшить без ИИ</button></div>`+(dpi<150?'<p class="hint">Для печати нужно от 250 dpi. Gemini дорисует детали, «без ИИ» — увеличит фото в 2 раза с повышением резкости.</p>':'');
      if(up&&e.wcOrig&&!busy) h+='<button class="btn sm" data-paq="undo" style="align-self:flex-start">Вернуть фото</button>';
      bt.innerHTML=h; bt.hidden=!h; };
    fill().catch(()=>{ const row=div.querySelector('[data-paqrow]'); if(row) row.innerHTML='<span class="hint">Не удалось прочитать фото</span>'; });
    div.addEventListener('click',ev=>{ const b=ev.target.closest('[data-paq]'); if(!b) return; const k=b.dataset.paq; if(k==='set'){ paSettings(); return; } if(k==='undo'){ paRestore(e); return; } paRun(e,k); }); }});
KS.insp({id:'pcai-bg',title:'Фон фото',order:29,when:paIsPhoto,
  html:e=>{ const busy=paBusy[e.id]==='bg', cut=e.aiCut&&e.aiCut===e.src.length;
    if(busy) return `<div class="pa-busy">${paSpin}Gemini убирает фон… 10–30 секунд</div>`;
    return `${cut?'<div class="pa-cut"><span class="pa-chk"></span><span><b>Фон убран</b><small>Фото прозрачное — положите его поверх любого фона или цвета</small></span></div>':'<p class="hint">Gemini вырежет людей или предмет, фон станет прозрачным.</p>'}
    <div class="flexw">${paHasKey()?`<button class="btn sm${cut?'':' primary'}" data-pabg="go">${cut?'Убрать фон ещё раз':'Убрать фон'}</button>`:'<button class="btn sm primary" data-pabg="set">Подключить Gemini</button>'}${e.wcOrig?'<button class="btn sm" data-pabg="undo">Вернуть фото</button>':''}</div>`; },
  bind(div,e){ div.addEventListener('click',ev=>{ const b=ev.target.closest('[data-pabg]'); if(!b) return; const k=b.dataset.pabg; if(k==='set'){ paSettings(); return; } if(k==='undo'){ paRestore(e); return; } paRun(e,'bg'); }); }});
KS.cmd('Убрать фон у фото (Gemini)','фото',()=>{ const e=KS.sel(); if(!e||!paIsPhoto(e)){ toast('Выделите фото на макете'); return; } paRun(e,'bg'); });
KS.cmd('Улучшить фото для печати','фото',()=>{ const e=KS.sel(); if(!e||!paIsPhoto(e)){ toast('Выделите фото на макете'); return; } paRun(e,paHasKey()?'ai':'up'); });
KS.pcai={open:paOpen,lib:PA_LIB,parse:paParse,cutout:paCutout,upscale:paUpLocal,dpi:paDpi,insert:paInsert};
