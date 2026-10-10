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
const nOpt=()=>KS.store('neuro',{pow:'mid',edges:true,variants:2});
/* the key is kept in two places of this browser: localStorage and IndexedDB, and the browser is asked not to evict them */
async function nPersist(){ try{ if(navigator.storage&&navigator.storage.persist&&!(await navigator.storage.persisted())) await navigator.storage.persist(); }catch(_){ } }
async function nBackup(){ try{ const k=localStorage.getItem(NK)||'', m=localStorage.getItem(NM)||''; if(k) await KS.idb.set('gemini',{k,m}); else await KS.idb.del('gemini'); }catch(_){ } }
(async()=>{ try{ if(!localStorage.getItem(NK)){ const v=await KS.idb.get('gemini'); if(v&&v.k){ localStorage.setItem(NK,v.k); if(v.m) localStorage.setItem(NM,v.m); KS.emit('neuroKey'); } } else nBackup(); }catch(_){ } })();
const nKey=()=>{ try{ return localStorage.getItem(NK)||''; }catch(_){ return ''; } };
const nModel=()=>{ try{ return localStorage.getItem(NM)||NMODELS[0][0]; }catch(_){ return NMODELS[0][0]; } };
async function nSmall(src,max){ const im=await new Promise((r,j)=>{ const i=new Image(); i.onload=()=>r(i); i.onerror=j; i.src=src; }); const k=Math.min(1,max/Math.max(im.naturalWidth,im.naturalHeight)); const c=document.createElement('canvas'); c.width=Math.round(im.naturalWidth*k); c.height=Math.round(im.naturalHeight*k); const g=c.getContext('2d'); g.fillStyle='#fff'; g.fillRect(0,0,c.width,c.height); g.drawImage(im,0,0,c.width,c.height); return c.toDataURL('image/jpeg',.9); }
function nErr(status,body){ const m=(body&&body.error&&body.error.message)||''; if(status===400&&/API key/i.test(m)) return 'Ключ Gemini не подошёл. Проверьте его в настройках «Нейро-стиля».';
  if(status===403) return 'Google не разрешил запрос. Проверьте, что у проекта ключа включена оплата (Billing).'; if(status===404) return 'Модель «'+nModel()+'» не найдена. Выберите другую в настройках.';
  if(status===429) return 'Лимит Gemini исчерпан. Подождите минуту или включите оплату у проекта ключа.'; if(status>=500) return 'Сервер Gemini занят. Попробуйте ещё раз через минуту.'; return 'Gemini ответил ошибкой '+status+(m?': '+m.slice(0,140):''); }
function nRatio(w,h){ const R=[['1:1',1],['3:2',1.5],['2:3',2/3],['4:3',4/3],['3:4',.75],['5:4',1.25],['4:5',.8],['16:9',16/9],['9:16',9/16]], r=w/h; return R.reduce((a,b)=>Math.abs(Math.log(b[1]/r))<Math.abs(Math.log(a[1]/r))?b:a)[0]; }
async function nCall(key,model,body){ let r; try{ r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,{method:'POST',headers:{'content-type':'application/json','x-goog-api-key':key},body:JSON.stringify(body)}); }
  catch(e){ throw new Error('Нет связи с Gemini. Проверьте интернет.'); } let j=null; try{ j=await r.json(); }catch(_){} return {r,j}; }
async function nOne(src,styleId,custom,o){ const key=nKey(); if(!key){ nSettings(); throw new Error('Сначала вставьте ключ Gemini'); }
  const S=NSTYLES.find(s=>s[0]===styleId), what=custom&&custom.trim()?custom.trim():(S||NSTYLES[0])[2], pow=(NPOW.find(p=>p[0]===o.pow)||NPOW[1])[2];
  const prompt=`Transform this photo into ${what}. ${pow} Preserve faces, expressions and the people's likeness; keep the same framing and aspect ratio. ${o.edges?'Leave a soft natural margin of clean white paper on all four sides so the artwork fades or ends inside the sheet — nothing touches the edges. ':''}Do not add any text, letters, signatures, logos, frames or watermarks. High detail, print quality.`;
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
async function nGen(prompt,o){ o=o||{}; const key=nKey(); if(!key){ nSettings(); throw new Error('Сначала вставьте ключ Gemini'); } const model=nModel(), n=Math.max(1,Math.min(4,+o.n||1));
  const one=async()=>{ const base={contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:{responseModalities:['TEXT','IMAGE']}}; const ic={aspectRatio:o.aspect||'1:1'}; if(/pro/i.test(model)) ic.imageSize='2K';
    let {r,j}=await nCall(key,model,Object.assign({},base,{generationConfig:Object.assign({},base.generationConfig,{imageConfig:ic})})); if(r.status===400&&!/API key/i.test(((j&&j.error&&j.error.message)||''))) ({r,j}=await nCall(key,model,base));
    if(!r.ok) throw new Error(nErr(r.status,j)); const parts=((j&&j.candidates&&j.candidates[0]&&j.candidates[0].content)||{}).parts||[]; const p=parts.find(x=>x.inlineData||x.inline_data); if(!p) throw new Error('Gemini не вернул картинку. Попробуйте ещё раз.');
    const d=p.inlineData||p.inline_data; return `data:${d.mimeType||d.mime_type||'image/png'};base64,${d.data}`; };
  const res=await Promise.allSettled(Array.from({length:n},one)); const ok=res.filter(x=>x.status==='fulfilled').map(x=>x.value); if(!ok.length) throw res[0].reason; return ok; }

/* generic image edit with an instruction (bg removal, upscale…) and text-only generation helpers */
async function nEdit(src,instruction,o){ o=o||{}; const key=nKey(); if(!key){ nSettings(); throw new Error('Сначала вставьте ключ Gemini'); } const model=nModel();
  const img=await nSmall(src,o.max||1536), b64=img.split(',')[1], dims=await KS.imgSize(img);
  const base={contents:[{role:'user',parts:[{text:instruction},{inline_data:{mime_type:'image/jpeg',data:b64}}]}],generationConfig:{responseModalities:['TEXT','IMAGE']}};
  const ic={aspectRatio:nRatio(dims.w||3,dims.h||2)}; if(/pro/i.test(model)||o.big) ic.imageSize=o.big?'2K':'2K';
  let {r,j}=await nCall(key,model,Object.assign({},base,{generationConfig:Object.assign({},base.generationConfig,{imageConfig:ic})})); if(r.status===400&&!/API key/i.test(((j&&j.error&&j.error.message)||''))) ({r,j}=await nCall(key,model,base));
  if(!r.ok) throw new Error(nErr(r.status,j)); const parts=((j&&j.candidates&&j.candidates[0]&&j.candidates[0].content)||{}).parts||[]; const p=parts.find(x=>x.inlineData||x.inline_data); if(!p) throw new Error('Gemini не вернул картинку. Попробуйте ещё раз.');
  const d=p.inlineData||p.inline_data; return `data:${d.mimeType||d.mime_type||'image/png'};base64,${d.data}`; }
async function nText(prompt,o){ o=o||{}; const key=nKey(); if(!key){ nSettings(); throw new Error('Сначала вставьте ключ Gemini'); } const model=o.model||'gemini-2.5-flash';
  const {r,j}=await nCall(key,model,{contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:Object.assign({temperature:.9},o.json?{responseMimeType:'application/json'}:{})});
  if(!r.ok) throw new Error(nErr(r.status,j)); const t=(((j&&j.candidates&&j.candidates[0]&&j.candidates[0].content)||{}).parts||[]).map(x=>x.text||'').join(''); if(!t) throw new Error('Gemini ничего не ответил'); return t; }
const npk=KS.modal({id:'neuroPick',title:'Выберите вариант',wide:true});
function nPick(src,list){ return new Promise(res=>{ let done=false; const fin=v=>{ if(done) return; done=true; npk.close(); res(v); };
  npk.el.innerHTML=`<p class="hint">Нажмите на понравившийся вариант. Оригинал — для сравнения.</p><div class="npick"><figure><img src="${src}" alt=""><figcaption>Оригинал</figcaption></figure>${list.map((u,i)=>`<button class="npick-v" data-npick="${i}"><img src="${u}" alt=""><span>Вариант ${i+1}</span></button>`).join('')}</div>`;
  npk.el.onclick=e=>{ const b=e.target.closest('[data-npick]'); if(b) fin(list[+b.dataset.npick]); };
  npk.open(); const _c=npk.close; npk.root.addEventListener('click',e=>{ if(e.target===npk.root||e.target.closest('[data-ksclose]')) fin(null); },{once:true}); }); }
const nm=KS.modal({id:'neuro',title:'Нейро-стиль: настройки Gemini'});
function nSettings(){ const k=nKey(), m=nModel(), known=NMODELS.some(x=>x[0]===m);
  nm.el.innerHTML=`<p class="hint">Ключ вводится один раз и остаётся после закрытия программы и перезагрузки. Хранится только на этом устройстве. Он не попадает в проекты, файлы и резервные копии. Ключ даёт доступ к вашему платному аккаунту Google — не пересылайте его никому.</p>
  <label class="f">Ключ Gemini API (из aistudio.google.com/apikey)<input type="password" id="nKey" value="${esc(k)}" placeholder="AIza…" autocomplete="off"></label>
  <label class="f">Модель<select id="nModel">${NMODELS.map(([v,n])=>`<option value="${v}"${v===m?' selected':''}>${n}</option>`).join('')}<option value="__own"${known?'':' selected'}>Другая модель…</option></select></label>
  <label class="f" id="nOwnBox"${known?' hidden':''}>Название модели<input type="text" id="nOwn" value="${known?'':esc(m)}" placeholder="gemini-…-image"></label>
  <div class="flexw"><button class="btn primary" id="nSave">Сохранить</button><button class="btn" id="nCheck">Проверить ключ</button>${k?'<button class="btn danger" id="nDel">Удалить ключ</button>':''}<span class="hint" id="nStat"></span></div>
  <p class="hint">Обработка одной картинки стоит около $0,04–0,13 в зависимости от модели. Нужна включённая оплата (Billing) у проекта ключа.</p>`;
  nm.open(); setTimeout(()=>{ const i=$('#nKey'); if(i&&!k) i.focus(); },50); }
nm.el.addEventListener('change',e=>{ if(e.target.id==='nModel') $('#nOwnBox').hidden=e.target.value!=='__own'; });
nm.el.addEventListener('click',async e=>{ const t=e.target;
  const store=()=>{ try{ localStorage.setItem(NK,$('#nKey').value.trim()); const v=$('#nModel').value; localStorage.setItem(NM,v==='__own'?($('#nOwn').value.trim()||NMODELS[0][0]):v); }catch(_){ toast('Браузер не дал сохранить ключ'); } };
  if(t.id==='nSave'){ store(); await nBackup(); nPersist(); nm.close(); toast(nKey()?'Ключ Gemini сохранён на этом устройстве — вводить его снова не нужно':'Ключ пустой'); KS.emit('neuroKey'); renderDzInsp&&dzSel&&renderDzInsp(); }
  if(t.id==='nDel'){ try{ localStorage.removeItem(NK); }catch(_){} await nBackup(); nSettings(); toast('Ключ удалён с этого устройства'); }
  if(t.id==='nCheck'){ store(); const s=$('#nStat'); s.textContent='Проверяю…'; try{ const r=await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=200',{headers:{'x-goog-api-key':nKey()}}); const b=await r.json().catch(()=>null);
      if(!r.ok){ s.textContent=nErr(r.status,b); return; } const ids=((b&&b.models)||[]).map(x=>String(x.name).replace('models/','')); const img=ids.filter(x=>/image/.test(x));
      s.textContent=ids.includes(nModel())?'✓ Ключ работает, модель доступна':'Ключ работает, но модели «'+nModel()+'» нет'+(img.length?'. Есть: '+img.slice(0,4).join(', '):''); }catch(_){ s.textContent='Нет связи с Google'; } } });
/* inspector section for photos */
KS.insp({id:'neuro',title:'Нейро-стиль (Gemini)',order:31,when:e=>e.t==='img'&&!!e.src&&e.k!=='logo',
  html:e=>nKey()?`${nCtl()}<div class="hd2">Люди</div><div class="flexw">${NSTYLES.filter(x=>x[0].startsWith('pp_')).map(([k,n])=>`<button class="btn sm" data-nst="${k}">${n.replace('Портрет: ','')}</button>`).join('')}</div><div class="hd2">Живопись и графика</div><div class="flexw">${NSTYLES.filter(x=>!x[0].startsWith('pp_')).map(([k,n])=>`<button class="btn sm" data-nst="${k}">${n}</button>`).join('')}</div><div class="ks-row"><input class="grow" type="text" data-nown="1" placeholder="Свой стиль: акварель в бежевых тонах…"><button class="btn sm" data-nst="own">Сделать</button></div>${e.wcOrig?'<button class="btn sm" data-nst="undo">Вернуть фото</button>':''}<button class="btn sm" data-nst="set" style="align-self:flex-start">Настройки Gemini</button>`
    :`<p class="hint">Превращает фото в акварель, масло, карандаш и другие стили с помощью Gemini.</p><button class="btn sm primary" data-nst="set" style="align-self:flex-start">Подключить ключ Gemini</button>`,
  bind(div,e){ div.addEventListener('click',async ev=>{ const b=ev.target.closest('[data-nst]'); if(!b) return; const k=b.dataset.nst;
    if(k==='set'){ nSettings(); return; }
    if(k==='undo'){ const o=await KS.idb.get('wc:'+e.wcOrig,'files'); if(o){ e.src=o; delete e.wcOrig; update(); } return; }
    const custom=k==='own'?(div.querySelector('[data-nown]').value||''):''; if(k==='own'&&!custom.trim()){ toast('Опишите стиль словами'); return; }
    div.querySelectorAll('[data-nst]').forEach(x=>x.disabled=true); b.textContent='Gemini рисует…';
    try{ let orig=e.src; if(!e.wcOrig){ const key=KS.uid('w'); await KS.idb.set('wc:'+key,e.src,'files'); e.wcOrig=key; } else { orig=(await KS.idb.get('wc:'+e.wcOrig,'files'))||e.src; }
      const out=await nStylize(orig,k==='own'?'':k,custom); if(out){ e.src=out; update(); toast('Готово'); } else renderDzInsp(); }
    catch(err){ toast(err.message||'Не получилось'); renderDzInsp(); } }); }});
function nCtl(){ const o=nOpt(); return `<div class="ks-row"><div class="seg">${NPOW.map(([k,n])=>`<button data-npow="${k}"${o.pow===k?' class="on"':''}>${n}</button>`).join('')}</div></div><div class="flexw"><label class="chk"><input type="checkbox" data-nedge="1"${o.edges?' checked':''}>Белые края бумаги</label><label class="chk">Вариантов<select data-nvar="1">${[1,2,3,4].map(n=>`<option${o.variants==n?' selected':''}>${n}</option>`).join('')}</select></label></div>`; }
document.addEventListener('click',e=>{ const b=e.target.closest('[data-npow]'); if(!b) return; nOpt().pow=b.dataset.npow; save(); b.parentElement.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b)); });
document.addEventListener('change',e=>{ if(e.target.dataset.nedge){ nOpt().edges=e.target.checked; save(); } if(e.target.dataset.nvar){ nOpt().variants=+e.target.value; save(); } });
KS.cmd('Нейро-стиль: настройки Gemini','настройки',nSettings);
KS.neuro={edit:nEdit,text:nText,gen:nGen,ctl:nCtl,stylize:nStylize,styles:NSTYLES,settings:nSettings,hasKey:()=>!!nKey()};
