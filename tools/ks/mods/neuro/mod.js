KS.mod('neuro',{title:'Нейро-стиль (Gemini)'});
/* Gemini image styling. The API key lives only in this browser's localStorage, never in st/projects/backups. */
const NK='ks-gemini-key', NM='ks-gemini-model';
const NMODELS=[['gemini-2.5-flash-image','Быстрая и дешёвая (2.5 Flash Image)'],['gemini-3.1-flash-image-preview','Новая быстрая (3.1 Flash Image)'],['gemini-3-pro-image-preview','Самая качественная (3 Pro Image)']];
const NSTYLES=[
 ['pp_soft','Портрет: мягкая иллюстрация','an original modern flat editorial illustration of the people in the photo: simplified graceful figures with slightly elongated necks and soft rounded shapes, calm serene faces drawn with minimal features (gently closed or tiny dot eyes, a small single-line nose, a soft smile), round blush on the cheeks, hair as one solid flowing shape; NO outlines, only flat color shapes with subtle hand-made gouache grain; a harmonious muted palette of warm cream, sage, terracotta, dusty rose and deep brown; a plain warm background with one or two soft abstract organic shapes or small botanical sprigs; keep each person\'s hairstyle, clothing colors, pose and what they hold recognizable. Original style — do not imitate any specific artist'],
 ['pp_paper','Портрет: бумажная аппликация','an original layered cut-paper collage portrait of the people in the photo: every shape cut from matte colored paper with slightly irregular hand-cut edges and soft drop shadows between layers, simplified friendly faces with minimal features and rosy cheeks, a soft pastel palette with one warm accent color, a simple paper background with a few cut-out leaves or confetti; keep hairstyles, clothing colors and pose recognizable'],
 ['pp_line','Портрет: линия и цвет','an original minimalist illustration of the people in the photo: one elegant continuous thin ink line drawing of the figures and faces, with loose flat color blocks placed slightly offset from the line (like hand-printed misregistration), round blush accents, lots of airy cream background; muted earthy palette; keep likeness of hairstyle, clothing and pose'],
 ['pp_riso','Портрет: ризограф','an original risograph-print illustration of the people in the photo in two or three spot colors (for example coral pink, teal and warm yellow) with visible grain, halftone texture and slight misregistration, simplified flat figures with minimal serene faces and blush cheeks, playful abstract shapes in the background; keep hairstyles, clothing colors and pose recognizable'],
 ['wc','Акварель','a museum-quality traditional watercolor painting on 300gsm cold-press cotton paper: transparent layered washes, wet-in-wet blooms, soft bleeding edges, visible pigment granulation, delicate dry-brush details on the main subject, plenty of untouched white paper for light'],
 ['wcbot','Ботаническая акварель','a refined botanical watercolor illustration: precise fine-brush detail on the subject, soft graded washes, gentle shadows, elegant and airy like a vintage herbarium plate'],
 ['wcloose','Свободная акварель','a loose expressive watercolor sketch with bold confident brush strokes, splashes and drips, minimal detail, vibrant transparent color, like a travel-journal painting'],
 ['oil','Масло','a rich classical oil painting on linen canvas: expressive visible brush strokes and impasto, deep luminous colors, warm gallery lighting, old-master craftsmanship'],
 ['impr','Импрессионизм','an impressionist oil painting in the spirit of Claude Monet: broken dabs of pure color, shimmering light and atmosphere, soft edges, plein-air feeling'],
 ['gouache','Гуашь','a modern gouache illustration with flat opaque matte color shapes, subtle brush texture and a refined limited palette, editorial picture-book quality'],
 ['pencil','Карандаш','a highly detailed graphite pencil drawing on white paper: careful hatching, soft blended shading, crisp contours, realistic proportions, fine-art sketchbook quality'],
 ['colpencil','Цветные карандаши','a delicate colored-pencil drawing on textured paper with visible pencil strokes, layered soft colors and white paper showing through'],
 ['ink','Тушь и перо','an elegant pen-and-ink drawing with confident fine linework and cross-hatching, lightly tinted with transparent watercolor, like a vintage travel sketchbook'],
 ['sumi','Японская тушь','a Japanese sumi-e ink wash painting: expressive black ink brush strokes, graded grey washes, lots of empty space, a single small red seal accent'],
 ['pastel','Пастель','a soft pastel chalk drawing on warm toned paper, velvety blended texture, gentle muted colors, impressionist softness'],
 ['engr','Гравюра','a classic copperplate engraving with very fine parallel lines and cross-hatching in dark sepia ink on cream paper, 19th-century book-plate quality'],
 ['lino','Линогравюра','a bold linocut print with carved textures, two or three flat ink colors, slightly imperfect registration, handmade printmaking feel'],
 ['vintage','Винтажная открытка','a hand-tinted vintage chromolithograph postcard from around 1910: soft muted printed colors, fine halftone texture, aged warm paper, nostalgic charm'],
 ['poster','Ретро-постер','a mid-century travel poster illustration with simplified bold shapes, flat vivid colors, subtle grain and elegant composition'],
 ['anime','Аниме','a hand-painted anime film still with soft cel shading, lush painterly detailed background and warm cinematic light'],
 ['cartoon','Детская книга','a charming children\'s-book illustration with soft rounded shapes, friendly gentle colors, subtle textures and soft shadows'],
 ['glass','Витраж','a luminous stained-glass window design with bold dark lead lines and glowing jewel-toned glass pieces']];
const NPOW=[['soft','Мягко','Apply the style gently: stay close to the original photo, keep fine details and exact likeness.'],['mid','Средне','Apply the style clearly while keeping the composition, subjects and likeness recognizable.'],['strong','Сильно','Fully reinterpret the photo as an artwork in this style; keep the composition and main subjects recognizable.']];
const nOpt=()=>{ const o=KS.store('neuro',{pow:'mid',edges:true,variants:1,spend:{}}); if(!o.m1){ o.variants=1; o.m1=1; } if(!o.spend) o.spend={}; return o; };
/* the key is kept in two places of this browser: localStorage and IndexedDB, and the browser is asked not to evict them */
async function nPersist(){ try{ if(navigator.storage&&navigator.storage.persist&&!(await navigator.storage.persisted())) await navigator.storage.persist(); }catch(_){ } }
async function nBackup(){ try{ const g=k=>localStorage.getItem(k)||''; const v={k:g(NK),m:g(NM),fk:g('ks-fal-key'),fe:g('ks-fal-edit'),fg:g('ks-fal-gen'),p:g('ks-ai-provider')}; if(v.k||v.fk) await KS.idb.set('gemini',v); else await KS.idb.del('gemini'); }catch(_){ } }
(async()=>{ try{ const v=await KS.idb.get('gemini'); let ch=0; if(v){ [['ks-gemini-key','k'],['ks-gemini-model','m'],['ks-fal-key','fk'],['ks-fal-edit','fe'],['ks-fal-gen','fg'],['ks-ai-provider','p']].forEach(([a,b])=>{ if(!localStorage.getItem(a)&&v[b]){ localStorage.setItem(a,v[b]); ch=1; } }); } if(ch) KS.emit('neuroKey'); else nBackup(); }catch(_){ } })();
/* owner's choice: Gemini 2.5 Flash Image as the working model (switched once) */
try{ if(!localStorage.getItem('ks-ai-m2')){ localStorage.setItem('ks-gemini-model','gemini-2.5-flash-image'); localStorage.setItem('ks-ai-provider','gemini'); localStorage.setItem('ks-ai-m2','1'); } }catch(_){ }
const nKey=()=>{ try{ return localStorage.getItem(NK)||''; }catch(_){ return ''; } };
const nModel=()=>{ try{ return localStorage.getItem(NM)||NMODELS[0][0]; }catch(_){ return NMODELS[0][0]; } };
async function nSmall(src,max){ const im=await new Promise((r,j)=>{ const i=new Image(); i.onload=()=>r(i); i.onerror=j; i.src=src; }); const k=Math.min(1,max/Math.max(im.naturalWidth,im.naturalHeight)); const c=document.createElement('canvas'); c.width=Math.round(im.naturalWidth*k); c.height=Math.round(im.naturalHeight*k); const g=c.getContext('2d'); g.fillStyle='#fff'; g.fillRect(0,0,c.width,c.height); g.drawImage(im,0,0,c.width,c.height); return c.toDataURL('image/jpeg',.9); }
function nErr(status,body){ const m=(body&&body.error&&body.error.message)||''; if(status===400&&/API key/i.test(m)) return 'Ключ Gemini не подошёл. Проверьте его в настройках «Нейро-стиля».';
  if(status===403) return 'Google не разрешил запрос. Проверьте, что у проекта ключа включена оплата (Billing).'; if(status===404) return 'Модель «'+nModel()+'» не найдена. Выберите другую в настройках.';
  if(status===429) return 'Лимит Gemini исчерпан. Подождите минуту или включите оплату у проекта ключа.'; if(status>=500) return 'Сервер Gemini занят. Попробуйте ещё раз через минуту.'; return 'Gemini ответил ошибкой '+status+(m?': '+m.slice(0,140):''); }
function nRatio(w,h){ const R=[['1:1',1],['3:2',1.5],['2:3',2/3],['4:3',4/3],['3:4',.75],['5:4',1.25],['4:5',.8],['16:9',16/9],['9:16',9/16]], r=w/h; return R.reduce((a,b)=>Math.abs(Math.log(b[1]/r))<Math.abs(Math.log(a[1]/r))?b:a)[0]; }
async function nCall(key,model,body){ let r; try{ r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,{method:'POST',headers:{'content-type':'application/json','x-goog-api-key':key},body:JSON.stringify(body)}); }
  catch(e){ throw new Error('Нет связи с Gemini. Проверьте интернет.'); } let j=null; try{ j=await r.json(); }catch(_){} return {r,j}; }
function nPrompt(styleId,custom,o){
  const S=NSTYLES.find(s=>s[0]===styleId), what=custom&&custom.trim()?custom.trim():(S||NSTYLES[0])[2], pow=(NPOW.find(p=>p[0]===o.pow)||NPOW[1])[2];
  const prompt=`Transform this photo into ${what}. ${pow} Preserve faces, expressions and the people's likeness; keep the same framing and aspect ratio. ${o.edges?'Leave a soft natural margin of clean white paper on all four sides so the artwork fades or ends inside the sheet — nothing touches the edges. ':''}Do not add any text, letters, signatures, logos, frames or watermarks. High detail, print quality.`;
  return prompt; }
async function gOne(src,styleId,custom,o){ const key=nKey(); if(!key){ nSettings(); throw new Error('Сначала вставьте ключ Gemini'); }
  const prompt=nPrompt(styleId,custom,o);
  const img=await nSmall(src,1536), b64=img.split(',')[1], dims=await KS.imgSize(img), model=nModel();
  const base={contents:[{role:'user',parts:[{text:prompt},{inline_data:{mime_type:'image/jpeg',data:b64}}]}],generationConfig:{responseModalities:['TEXT','IMAGE']}};
  const ic={aspectRatio:nRatio(dims.w||3,dims.h||2)}; if(/pro/i.test(model)) ic.imageSize='2K';
  let {r,j}=await nCall(key,model,Object.assign({},base,{generationConfig:Object.assign({},base.generationConfig,{imageConfig:ic})}));
  if(r.status===400&&!/API key/i.test(((j&&j.error&&j.error.message)||''))) ({r,j}=await nCall(key,model,base)); /* older models: no imageConfig */
  if(!r.ok) throw new Error(nErr(r.status,j));
  const parts=((j&&j.candidates&&j.candidates[0]&&j.candidates[0].content)||{}).parts||[]; const p=parts.find(x=>x.inlineData||x.inline_data);
  if(!p){ const why=(j&&j.candidates&&j.candidates[0]&&j.candidates[0].finishReason)||''; throw new Error(/SAFETY|PROHIBITED/.test(why)?'Gemini отказался обрабатывать это фото по своим правилам. Попробуйте другое фото или стиль.':'Gemini не вернул картинку. Попробуйте ещё раз или другой стиль.'); }
  const d=p.inlineData||p.inline_data; return `data:${d.mimeType||d.mime_type||'image/png'};base64,${d.data}`; }
/* several variants in parallel, then the owner picks one */
async function nStylize(src,styleId,custom,o){ o=Object.assign({},nOpt(),o||{}); const n=Math.max(1,Math.min(4,+o.variants||1));
  const res=await Promise.allSettled(Array.from({length:n},()=>nOne(src,styleId,custom,o))); const ok=res.filter(x=>x.status==='fulfilled').map(x=>x.value);
  if(!ok.length) throw res[0].reason; if(ok.length===1||o.noPick) return ok[0]; return nPick(src,ok); }

/* text → image (logo generation) */
async function gGen(prompt,o){ o=o||{}; const key=nKey(); if(!key){ nSettings(); throw new Error('Сначала вставьте ключ Gemini'); } const model=nModel(), n=Math.max(1,Math.min(4,+o.n||1));
  const one=async()=>{ const base={contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:{responseModalities:['TEXT','IMAGE']}}; const ic={aspectRatio:o.aspect||'1:1'}; if(/pro/i.test(model)) ic.imageSize='2K';
    let {r,j}=await nCall(key,model,Object.assign({},base,{generationConfig:Object.assign({},base.generationConfig,{imageConfig:ic})})); if(r.status===400&&!/API key/i.test(((j&&j.error&&j.error.message)||''))) ({r,j}=await nCall(key,model,base));
    if(!r.ok) throw new Error(nErr(r.status,j)); const parts=((j&&j.candidates&&j.candidates[0]&&j.candidates[0].content)||{}).parts||[]; const p=parts.find(x=>x.inlineData||x.inline_data); if(!p) throw new Error('Gemini не вернул картинку. Попробуйте ещё раз.');
    const d=p.inlineData||p.inline_data; return `data:${d.mimeType||d.mime_type||'image/png'};base64,${d.data}`; };
  const res=await Promise.allSettled(Array.from({length:n},one)); const ok=res.filter(x=>x.status==='fulfilled').map(x=>x.value); if(!ok.length) throw res[0].reason; return ok; }

/* generic image edit with an instruction (bg removal, upscale…) and text-only generation helpers */
async function gEdit(src,instruction,o){ o=o||{}; const key=nKey(); if(!key){ nSettings(); throw new Error('Сначала вставьте ключ Gemini'); } const model=nModel();
  const img=await nSmall(src,o.max||1536), b64=img.split(',')[1], dims=await KS.imgSize(img);
  const base={contents:[{role:'user',parts:[{text:instruction},{inline_data:{mime_type:'image/jpeg',data:b64}}]}],generationConfig:{responseModalities:['TEXT','IMAGE']}};
  const ic={aspectRatio:nRatio(dims.w||3,dims.h||2)}; if(/pro/i.test(model)||o.big) ic.imageSize=o.big?'2K':'2K';
  let {r,j}=await nCall(key,model,Object.assign({},base,{generationConfig:Object.assign({},base.generationConfig,{imageConfig:ic})})); if(r.status===400&&!/API key/i.test(((j&&j.error&&j.error.message)||''))) ({r,j}=await nCall(key,model,base));
  if(!r.ok) throw new Error(nErr(r.status,j)); const parts=((j&&j.candidates&&j.candidates[0]&&j.candidates[0].content)||{}).parts||[]; const p=parts.find(x=>x.inlineData||x.inline_data); if(!p) throw new Error('Gemini не вернул картинку. Попробуйте ещё раз.');
  const d=p.inlineData||p.inline_data; return `data:${d.mimeType||d.mime_type||'image/png'};base64,${d.data}`; }
async function nText(prompt,o){ o=o||{}; const key=nKey(); if(!key){ if(prov()!=='fal') nSettings(); throw new Error('Тексты пишет Gemini: добавьте ключ Gemini в настройках ИИ или выберите текст из библиотеки'); } const model=o.model||'gemini-2.5-flash';
  const {r,j}=await nCall(key,model,{contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:Object.assign({temperature:.9},o.json?{responseMimeType:'application/json'}:{})});
  if(!r.ok) throw new Error(nErr(r.status,j)); const t=(((j&&j.candidates&&j.candidates[0]&&j.candidates[0].content)||{}).parts||[]).map(x=>x.text||'').join(''); if(!t) throw new Error('Gemini ничего не ответил'); return t; }

/* ---- providers: Gemini or fal.ai (FLUX Kontext etc.), with a running cost estimate ---- */
const NP='ks-ai-provider', FK='ks-fal-key', FME='ks-fal-edit', FMG='ks-fal-gen';
const FEDIT=[['fal-ai/flux-kontext/dev','FLUX Kontext dev — дешевле всего (≈ $0,025)'],['fal-ai/flux-pro/kontext','FLUX Kontext Pro — лучше качество (≈ $0,04)']];
const FGEN=[['fal-ai/flux/schnell','FLUX schnell — копейки (≈ $0,003), без точного текста'],['fal-ai/flux/dev','FLUX dev (≈ $0,025)'],['fal-ai/flux-pro/kontext/text-to-image','FLUX Kontext Pro (≈ $0,04), текст точнее']];
const ls=(k,d)=>{ try{ return localStorage.getItem(k)||d; }catch(_){ return d; } };
const fKey=()=>ls(FK,''), fEditM=()=>ls(FME,FEDIT[0][0]), fGenM=()=>ls(FMG,FGEN[2][0]);
const prov=()=>ls(NP,'gemini')==='fal'&&fKey()?'fal':'gemini';
const nHas=()=>prov()==='fal'?!!fKey():!!nKey();
const PRICE={'gemini-2.5-flash-image':.039,'gemini-3.1-flash-image-preview':.045,'gemini-3-pro-image-preview':.134,'fal-ai/flux-kontext/dev':.025,'fal-ai/flux-pro/kontext':.04,'fal-ai/flux/schnell':.003,'fal-ai/flux/dev':.025,'fal-ai/flux-pro/kontext/text-to-image':.04};
const nPrice=kind=>{ const m=prov()==='fal'?(kind==='gen'?fGenM():fEditM()):nModel(); return PRICE[m]??.04; };
function nSpend(n,kind){ const o=nOpt(), sp=o.spend, d=KS.today(), mo=d.slice(0,7), c=n*nPrice(kind); if(sp.d!==d){ sp.d=d; sp.day=0; } if(sp.m!==mo){ sp.m=mo; sp.month=0; } sp.day=(sp.day||0)+c; sp.month=(sp.month||0)+c; sp.total=(sp.total||0)+c; save(); }
const usd=v=>{ v=+v||0; return '$'+(v>0&&v<.1?v.toFixed(3):v.toFixed(2)); };
function nSpendLine(){ const sp=nOpt().spend||{}, d=KS.today(); return `≈ ${usd(nPrice('edit'))} за картинку · сегодня ${usd(sp.d===d?sp.day:0)} · за месяц ${usd(sp.m===d.slice(0,7)?sp.month:0)}`; }
function fErr(status,j){ const m=(j&&(j.detail&&(typeof j.detail==='string'?j.detail:JSON.stringify(j.detail))||j.message))||''; if(status===401) return 'Ключ fal.ai не подошёл. Проверьте его в настройках.'; if(status===402||status===403||/balance|credit|exhausted|locked/i.test(m)) return 'На балансе fal.ai закончились деньги — пополните на fal.ai → Billing.';
  if(status===404) return 'Модель fal.ai не найдена. Выберите другую в настройках.'; if(status===422) return 'fal.ai не принял запрос: '+String(m).slice(0,140); if(status===429) return 'fal.ai просит подождать: слишком много запросов.'; if(status>=500) return 'Сервер fal.ai занят. Попробуйте ещё раз.'; return 'fal.ai ответил ошибкой '+status; }
async function fCall(model,body){ const key=fKey(); if(!key){ nSettings(); throw new Error('Сначала вставьте ключ fal.ai'); } let r; try{ r=await fetch('https://fal.run/'+model,{method:'POST',headers:{'Authorization':'Key '+key,'content-type':'application/json'},body:JSON.stringify(body)}); }catch(e){ throw new Error('Нет связи с fal.ai. Проверьте интернет.'); }
  let j=null; try{ j=await r.json(); }catch(_){} if(!r.ok) throw new Error(fErr(r.status,j)); return j||{}; }
async function fImg(u){ if(!u) throw new Error('fal.ai не вернул картинку'); if(/^data:/.test(u)) return u; const r=await fetch(u); if(!r.ok) throw new Error('Не удалось скачать картинку fal.ai'); const b=await r.blob(); return await new Promise((res,rej)=>{ const f=new FileReader(); f.onload=()=>res(f.result); f.onerror=rej; f.readAsDataURL(b); }); }
async function fEdit(src,prompt){ const img=await nSmall(src,1536); const j=await fCall(fEditM(),{prompt,image_url:img,num_images:1,output_format:'jpeg',safety_tolerance:'5'}); return fImg(j.images&&j.images[0]&&j.images[0].url); }
async function fGen(prompt,o){ const n=Math.max(1,Math.min(4,+o.n||1)); const j=await fCall(fGenM(),{prompt,num_images:n,aspect_ratio:o.aspect||'1:1',output_format:'png',image_size:'square_hd'}); const L=(j.images||[]).map(x=>x.url); if(!L.length) throw new Error('fal.ai не вернул картинку'); return Promise.all(L.map(fImg)); }
async function nOne(src,styleId,custom,o){ const r=prov()==='fal'?await fEdit(src,nPrompt(styleId,custom,o)):await gOne(src,styleId,custom,o); nSpend(1,'edit'); return r; }
async function nEdit(src,instruction,o){ const r=prov()==='fal'?await fEdit(src,instruction):await gEdit(src,instruction,o); nSpend(1,'edit'); return r; }
async function nGen(prompt,o){ o=o||{}; const r=prov()==='fal'?await fGen(prompt,o):await gGen(prompt,o); nSpend(r.length,'gen'); return r; }
const npk=KS.modal({id:'neuroPick',title:'Выберите вариант',wide:true});
function nPick(src,list){ return new Promise(res=>{ let done=false; const fin=v=>{ if(done) return; done=true; npk.close(); res(v); };
  npk.el.innerHTML=`<p class="hint">Нажмите на понравившийся вариант. Оригинал — для сравнения.</p><div class="npick"><figure><img src="${src}" alt=""><figcaption>Оригинал</figcaption></figure>${list.map((u,i)=>`<button class="npick-v" data-npick="${i}"><img src="${u}" alt=""><span>Вариант ${i+1}</span></button>`).join('')}</div>`;
  npk.el.onclick=e=>{ const b=e.target.closest('[data-npick]'); if(b) fin(list[+b.dataset.npick]); };
  npk.open(); const _c=npk.close; npk.root.addEventListener('click',e=>{ if(e.target===npk.root||e.target.closest('[data-ksclose]')) fin(null); },{once:true}); }); }
const nm=KS.modal({id:'neuro',title:'Нейро-стиль: настройки ИИ'});
function nSettings(){ const k=nKey(), m=nModel(), known=NMODELS.some(x=>x[0]===m), P=ls(NP,'gemini'), fk=fKey(), sp=nOpt().spend||{};
  nm.el.innerHTML=`<div class="seg"><button data-nprov="gemini"${P!=='fal'?' class="on"':''}>Gemini (Google)</button><button data-nprov="fal"${P==='fal'?' class="on"':''}>fal.ai (FLUX) — дешевле</button></div>
  <p class="hint">Ключи вводятся один раз и остаются после закрытия программы. Хранятся только на этом устройстве, не попадают в проекты и резервные копии. Не пересылайте их никому.</p>
  <div id="nGem"${P==='fal'?' hidden':''}><label class="f">Ключ Gemini API (aistudio.google.com/apikey)<input type="password" id="nKey" value="${esc(k)}" placeholder="AIza…" autocomplete="off"></label>
  <label class="f">Модель<select id="nModel">${NMODELS.map(([v,n])=>`<option value="${v}"${v===m?' selected':''}>${n} — ≈ ${usd(PRICE[v]??.04)}</option>`).join('')}<option value="__own"${known?'':' selected'}>Другая модель…</option></select></label>
  <label class="f" id="nOwnBox"${known?' hidden':''}>Название модели<input type="text" id="nOwn" value="${known?'':esc(m)}" placeholder="gemini-…-image"></label>
  <p class="hint" id="nProWarn"${/pro/.test(m)?'':' hidden'}>⚠︎ Pro-модель стоит ≈ $0,13 за картинку — в 3,5 раза дороже Flash. Берите её только для самых важных работ.</p></div>
  <div id="nFal"${P==='fal'?'':' hidden'}><label class="f">Ключ fal.ai (fal.ai → Dashboard → API Keys; баланс пополняется в Billing)<input type="password" id="nFKey" value="${esc(fk)}" placeholder="xxxxxxxx-…:…" autocomplete="off"></label>
  <label class="f">Модель для стилей и правок фото<select id="nFEdit">${FEDIT.map(([v,n])=>`<option value="${v}"${v===fEditM()?' selected':''}>${n}</option>`).join('')}</select></label>
  <label class="f">Модель для логотипов и картинок с нуля<select id="nFGen">${FGEN.map(([v,n])=>`<option value="${v}"${v===fGenM()?' selected':''}>${n}</option>`).join('')}</select></label>
  <p class="hint">Тексты-поздравления по-прежнему пишет Gemini (если ключ есть) или встроенная библиотека.</p></div>
  <div class="card" style="padding:10px"><b>Расходы (примерно)</b><span class="hint">Сегодня ${usd(sp.d===KS.today()?sp.day:0)} · за месяц ${usd(sp.m===KS.today().slice(0,7)?sp.month:0)} · всего ${usd(sp.total)}</span><span class="hint">Точную сумму смотрите в кабинете Google / fal.ai. По умолчанию — 1 вариант на нажатие.</span></div>
  <div class="flexw"><button class="btn primary" id="nSave">Сохранить</button><button class="btn" id="nCheck">Проверить ключ</button>${(P==='fal'?fk:k)?'<button class="btn danger" id="nDel">Удалить ключ</button>':''}<span class="hint" id="nStat"></span></div>`;
  nm.open(); }
nm.el.addEventListener('change',e=>{ if(e.target.id==='nModel'){ $('#nOwnBox').hidden=e.target.value!=='__own'; $('#nProWarn').hidden=!/pro/.test(e.target.value); } });
nm.el.addEventListener('click',async e=>{ const t=e.target; const pb=t.closest('[data-nprov]');
  if(pb){ try{ localStorage.setItem(NP,pb.dataset.nprov); }catch(_){} nm.el.querySelectorAll('[data-nprov]').forEach(x=>x.classList.toggle('on',x===pb)); $('#nGem').hidden=pb.dataset.nprov==='fal'; $('#nFal').hidden=pb.dataset.nprov!=='fal'; return; }
  const store=()=>{ try{ localStorage.setItem(NK,$('#nKey').value.trim()); const v=$('#nModel').value; localStorage.setItem(NM,v==='__own'?($('#nOwn').value.trim()||NMODELS[0][0]):v); localStorage.setItem(FK,$('#nFKey').value.trim()); localStorage.setItem(FME,$('#nFEdit').value); localStorage.setItem(FMG,$('#nFGen').value); }catch(_){ toast('Браузер не дал сохранить ключ'); } };
  if(t.id==='nSave'){ store(); await nBackup(); nPersist(); nm.close(); toast(nHas()?(prov()==='fal'?'fal.ai подключён — ':'Gemini подключён — ')+nSpendLine():'Ключ пустой'); KS.emit('neuroKey'); if(dzSel) renderDzInsp(); }
  if(t.id==='nDel'){ try{ localStorage.removeItem(ls(NP,'gemini')==='fal'?FK:NK); }catch(_){} await nBackup(); nSettings(); toast('Ключ удалён с этого устройства'); }
  if(t.id==='nCheck'){ store(); const s=$('#nStat'); s.textContent='Проверяю…';
    if(ls(NP,'gemini')==='fal'){ try{ const r=await fetch('https://fal.run/fal-ai/flux/schnell',{method:'POST',headers:{'Authorization':'Key '+fKey(),'content-type':'application/json'},body:JSON.stringify({prompt:'a small dot',num_images:1,image_size:'square'})}); const j=await r.json().catch(()=>null); s.textContent=r.ok?'✓ Ключ fal.ai работает (пробная картинка ≈ $0,003)':fErr(r.status,j); }catch(_){ s.textContent='Нет связи с fal.ai'; } return; }
    try{ const r=await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=200',{headers:{'x-goog-api-key':nKey()}}); const b=await r.json().catch(()=>null);
      if(!r.ok){ s.textContent=nErr(r.status,b); return; } const ids=((b&&b.models)||[]).map(x=>String(x.name).replace('models/','')); const img=ids.filter(x=>/image/.test(x));
      s.textContent=ids.includes(nModel())?'✓ Ключ работает, модель доступна':'Ключ работает, но модели «'+nModel()+'» нет'+(img.length?'. Есть: '+img.slice(0,4).join(', '):''); }catch(_){ s.textContent='Нет связи с Google'; } } });
/* inspector section for photos */
KS.insp({id:'neuro',title:'Нейро-стиль (ИИ)',order:31,when:e=>e.t==='img'&&!!e.src&&e.k!=='logo',
  html:e=>nHas()?`<p class="hint">${nSpendLine()}</p>${nCtl()}<div class="hd2">Люди</div><div class="flexw">${NSTYLES.filter(x=>x[0].startsWith('pp_')).map(([k,n])=>`<button class="btn sm" data-nst="${k}">${n.replace('Портрет: ','')}</button>`).join('')}</div><div class="hd2">Живопись и графика</div><div class="flexw">${NSTYLES.filter(x=>!x[0].startsWith('pp_')).map(([k,n])=>`<button class="btn sm" data-nst="${k}">${n}</button>`).join('')}</div><div class="ks-row"><input class="grow" type="text" data-nown="1" placeholder="Свой стиль: акварель в бежевых тонах…"><button class="btn sm" data-nst="own">Сделать</button></div>${e.wcOrig?'<button class="btn sm" data-nst="undo">Вернуть фото</button>':''}<button class="btn sm" data-nst="set" style="align-self:flex-start">Настройки ИИ</button>`
    :`<p class="hint">Превращает фото в акварель, масло, карандаш и другие стили с помощью Gemini.</p><button class="btn sm primary" data-nst="set" style="align-self:flex-start">Подключить ИИ (Gemini или fal.ai)</button>`,
  bind(div,e){ div.addEventListener('click',async ev=>{ const b=ev.target.closest('[data-nst]'); if(!b) return; const k=b.dataset.nst;
    if(k==='set'){ nSettings(); return; }
    if(k==='undo'){ const o=await KS.idb.get('wc:'+e.wcOrig,'files'); if(o){ e.src=o; delete e.wcOrig; update(); } return; }
    const custom=k==='own'?(div.querySelector('[data-nown]').value||''):''; if(k==='own'&&!custom.trim()){ toast('Опишите стиль словами'); return; }
    div.querySelectorAll('[data-nst]').forEach(x=>x.disabled=true); b.textContent=(prov()==='fal'?'fal.ai':'Gemini')+' рисует…';
    try{ let orig=e.src; if(!e.wcOrig){ const key=KS.uid('w'); await KS.idb.set('wc:'+key,e.src,'files'); e.wcOrig=key; } else { orig=(await KS.idb.get('wc:'+e.wcOrig,'files'))||e.src; }
      const out=await nStylize(orig,k==='own'?'':k,custom); if(out){ e.src=out; update(); toast('Готово'); } else renderDzInsp(); }
    catch(err){ toast(err.message||'Не получилось'); renderDzInsp(); } }); }});
function nCtl(){ const o=nOpt(); return `<div class="ks-row"><div class="seg">${NPOW.map(([k,n])=>`<button data-npow="${k}"${o.pow===k?' class="on"':''}>${n}</button>`).join('')}</div></div><div class="flexw"><label class="chk"><input type="checkbox" data-nedge="1"${o.edges?' checked':''}>Белые края бумаги</label><label class="chk">Вариантов<select data-nvar="1">${[1,2,3,4].map(n=>`<option${o.variants==n?' selected':''}>${n}</option>`).join('')}</select></label></div>`; }
document.addEventListener('click',e=>{ const b=e.target.closest('[data-npow]'); if(!b) return; nOpt().pow=b.dataset.npow; save(); b.parentElement.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b)); });
document.addEventListener('change',e=>{ if(e.target.dataset.nedge){ nOpt().edges=e.target.checked; save(); } if(e.target.dataset.nvar){ nOpt().variants=+e.target.value; save(); } });
KS.cmd('Нейро-стиль: настройки ИИ (Gemini / fal.ai)','настройки',nSettings);
KS.neuro={edit:nEdit,text:nText,gen:nGen,ctl:nCtl,stylize:nStylize,styles:NSTYLES,settings:nSettings,spendLine:nSpendLine,provider:prov,hasKey:()=>nHas()};
