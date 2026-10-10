KS.mod('neuro',{title:'Нейро-стиль (Gemini)'});
/* Gemini image styling. The API key lives only in this browser's localStorage, never in st/projects/backups. */
const NK='ks-gemini-key', NM='ks-gemini-model';
const NMODELS=[['gemini-2.5-flash-image','Быстрая и дешёвая (2.5 Flash Image)'],['gemini-3.1-flash-image-preview','Новая быстрая (3.1 Flash Image)'],['gemini-3-pro-image-preview','Самая качественная (3 Pro Image)']];
const NSTYLES=[
 ['wc','Акварель','a delicate, high-quality traditional watercolor painting on textured cold-press paper: soft washes, natural pigment blooms and granulation, gentle bleeding edges, light and airy; the painting fades into clean white paper at the edges'],
 ['oil','Масло','a rich oil painting on canvas with visible expressive brush strokes and impasto, warm gallery lighting, classical fine-art quality'],
 ['pencil','Карандаш','a detailed graphite pencil drawing on white paper, fine hatching and soft shading, realistic proportions, artist sketchbook quality'],
 ['ink','Тушь и перо','an elegant pen-and-ink illustration with fine linework and light watercolor tint, like a vintage travel sketch, on white paper'],
 ['pastel','Пастель','a soft pastel chalk drawing on toned paper, velvety texture, gentle colors, impressionist feel'],
 ['engr','Гравюра','a classic engraving / etching illustration with fine cross-hatching in dark ink on cream paper, 19th-century book plate style'],
 ['anime','Аниме','a hand-drawn anime film still with soft cel shading, painterly detailed background and warm cinematic light'],
 ['vintage','Винтажная открытка','a vintage chromolithograph postcard from the 1900s: muted printed colors, slight halftone texture, aged paper, nostalgic mood'],
 ['cartoon','Мультфильм','a cheerful modern cartoon illustration with clean shapes, bold friendly colors and soft shadows, like a children\'s book'],
 ['gouache','Гуашь','an opaque gouache painting with flat matte color shapes and visible brush texture, modern editorial illustration style']];
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
async function nStylize(src,styleId,custom){ const key=nKey(); if(!key){ nSettings(); throw new Error('Сначала вставьте ключ Gemini'); }
  const S=NSTYLES.find(s=>s[0]===styleId), what=custom&&custom.trim()?custom.trim():S?S[2]:NSTYLES[0][2];
  const prompt=`Transform this photo into ${what}. Keep the same composition, subjects, faces and their likeness recognizable. Do not add any text, letters, logos, signatures, frames or watermarks. Output one image with the same aspect ratio.${custom&&custom.trim()?'':''}`;
  const img=await nSmall(src,1536), b64=img.split(',')[1];
  let r; try{ r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(nModel())}:generateContent`,{method:'POST',headers:{'content-type':'application/json','x-goog-api-key':key},
    body:JSON.stringify({contents:[{role:'user',parts:[{text:prompt},{inline_data:{mime_type:'image/jpeg',data:b64}}]}],generationConfig:{responseModalities:['TEXT','IMAGE']}})}); }
  catch(e){ throw new Error('Нет связи с Gemini. Проверьте интернет.'); }
  let body=null; try{ body=await r.json(); }catch(_){}
  if(!r.ok) throw new Error(nErr(r.status,body));
  const parts=((body&&body.candidates&&body.candidates[0]&&body.candidates[0].content)||{}).parts||[]; const p=parts.find(x=>x.inlineData||x.inline_data);
  if(!p){ const why=(body&&body.candidates&&body.candidates[0]&&body.candidates[0].finishReason)||''; throw new Error(why==='SAFETY'||why==='IMAGE_SAFETY'?'Gemini отказался обрабатывать это фото по своим правилам. Попробуйте другое фото или стиль.':'Gemini не вернул картинку. Попробуйте ещё раз или другой стиль.'); }
  const d=p.inlineData||p.inline_data; return `data:${d.mimeType||d.mime_type||'image/png'};base64,${d.data}`; }
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
  html:e=>nKey()?`<div class="flexw">${NSTYLES.map(([k,n])=>`<button class="btn sm" data-nst="${k}">${n}</button>`).join('')}</div><div class="ks-row"><input class="grow" type="text" data-nown="1" placeholder="Свой стиль: акварель в бежевых тонах…"><button class="btn sm" data-nst="own">Сделать</button></div>${e.wcOrig?'<button class="btn sm" data-nst="undo">Вернуть фото</button>':''}<button class="btn sm" data-nst="set" style="align-self:flex-start">Настройки Gemini</button>`
    :`<p class="hint">Превращает фото в акварель, масло, карандаш и другие стили с помощью Gemini.</p><button class="btn sm primary" data-nst="set" style="align-self:flex-start">Подключить ключ Gemini</button>`,
  bind(div,e){ div.addEventListener('click',async ev=>{ const b=ev.target.closest('[data-nst]'); if(!b) return; const k=b.dataset.nst;
    if(k==='set'){ nSettings(); return; }
    if(k==='undo'){ const o=await KS.idb.get('wc:'+e.wcOrig,'files'); if(o){ e.src=o; delete e.wcOrig; update(); } return; }
    const custom=k==='own'?(div.querySelector('[data-nown]').value||''):''; if(k==='own'&&!custom.trim()){ toast('Опишите стиль словами'); return; }
    div.querySelectorAll('[data-nst]').forEach(x=>x.disabled=true); b.textContent='Gemini рисует…';
    try{ let orig=e.src; if(!e.wcOrig){ const key=KS.uid('w'); await KS.idb.set('wc:'+key,e.src,'files'); e.wcOrig=key; } else { orig=(await KS.idb.get('wc:'+e.wcOrig,'files'))||e.src; }
      e.src=await nStylize(orig,k==='own'?'':k,custom); update(); toast('Готово'); }
    catch(err){ toast(err.message||'Не получилось'); renderDzInsp(); } }); }});
KS.cmd('Нейро-стиль: настройки Gemini','настройки',nSettings);
KS.neuro={stylize:nStylize,styles:NSTYLES,settings:nSettings,hasKey:()=>!!nKey()};
