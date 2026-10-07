/* ---------- KS: module host ---------- */
const KS=(()=>{
  const H={}, G={}, ORDER=[], INSP=[], CMDS=[], TOOLS=[], seen=new WeakMap();
  const K={v:1,mods:{}};
  K.icon=p=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  K.on=(ev,fn)=>{ (H[ev]=H[ev]||[]).push(fn); };
  K.emit=(ev,...a)=>{ let r; (H[ev]||[]).forEach(f=>{ try{ const v=f(...a); if(v!==undefined) r=v; }catch(e){ console.error('[KS] '+ev,e); } }); return r; };
  K.mod=(name,info)=>{ K.mods[name]=Object.assign({name},info||{}); };
  /* persistent module data: st.ks[name]; shared by all projects; kept on undo. Call each time, never cache. */
  K.store=(name,def)=>{ if(!st.ks||typeof st.ks!=='object'||Array.isArray(st.ks)) st.ks={}; let s=st.ks[name]; let m=seen.get(st); if(!m){ m={}; seen.set(st,m); }
    if(!s||typeof s!=='object'){ s=st.ks[name]=JSON.parse(JSON.stringify(def||{})); m[name]=1; return s; }
    if(def&&!m[name]){ for(const k in def) if(!(k in s)) s[k]=JSON.parse(JSON.stringify(def[k])); m[name]=1; }
    return s; };
  K.save=()=>save(); K.saveNow=()=>saveNow(); K.update=()=>update(); K.toast=m=>toast(m); K.esc=s=>esc(s);
  K.money=n=>{ const v=Math.round((+n||0)*100)/100; return v.toLocaleString('ru-RU',{maximumFractionDigits:2})+' '+((st.shop&&st.shop.cur)||'֏'); };
  K.uid=p=>(p||'k')+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
  K.today=()=>{ const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); };
  K.keepFocus=(box,fn)=>{ if(typeof dzKeepFocus==='function') return dzKeepFocus(box,fn); fn(); };

  /* ---- rail tabs (optionally grouped into one rail button with sub-tabs) ---- */
  K.tab=o=>{ const gid=o.group||o.id, tid='ks-'+gid; let g=G[gid];
    if(!g){ g=G[gid]={id:gid,tid,title:o.groupTitle||o.title,icon:o.groupIcon||o.icon,items:[],app:o.app||'print'}; ORDER.push(g);
      const b=document.createElement('button'); b.className='rbtn kstab'+(g.app==='print'?' pOnly':g.app==='env'?' eOnly':''); b.dataset.tab=tid; b.innerHTML=(g.icon||K.icon('<circle cx="12" cy="12" r="8"/>'))+esc(g.title);
      const ref=o.before&&$(`#rail .rbtn[data-tab="${o.before}"]`)||$('#rail .rbtn[data-tab="orders"]'); if(ref) ref.before(b); else $('#rail').appendChild(b);
      b.addEventListener('click',()=>K.show(gid));
      const p=document.createElement('section'); p.className='panel kspanel'; p.dataset.panel=tid; p.hidden=true; $('.panels').appendChild(p);
      TITLES[tid]=g.title; }
    const it=Object.assign({seg:o.seg||o.title},o); g.items.push(it); return it; };
  const subOf=g=>{ const u=st.ui.ksSub||{}; return g.items.find(i=>i.id===u[g.id])||g.items[0]; };
  K.show=(gid,sub)=>{ const g=G[gid]||Object.values(G).find(x=>x.items.some(i=>i.id===gid)); if(!g) return; if(!G[gid]) sub=gid;
    if(sub){ st.ui.ksSub=Object.assign({},st.ui.ksSub,{[g.id]:sub}); }
    if(st.ui.app!==(g.app==='env'?'env':'print')&&g.app!=='both'&&typeof dzSetMode==='function') dzSetMode(g.app==='env'?'env':'print');
    activeTab=g.tid; $$('.rbtn').forEach(x=>x.classList.toggle('on',x.dataset.tab===g.tid)); $$('[data-panel]').forEach(p=>p.hidden=p.dataset.panel!==activeTab);
    $('#sideTitle').textContent=TITLES[activeTab]; try{ moveLens(); }catch(_){} const ps=$('.panels'); if(ps) ps.scrollTop=0; K.render('show'); try{ queueTranslate(); }catch(_){} };
  K.active=()=>{ const g=ORDER.find(x=>x.tid===activeTab); return g?subOf(g):null; };
  K.render=reason=>{ const g=ORDER.find(x=>x.tid===activeTab); screens(g); if(!g) return; const p=$(`.kspanel[data-panel="${g.tid}"]`); if(!p) return; const it=subOf(g);
    if(p.dataset.sub!==it.id){ p.dataset.sub=it.id; p.innerHTML=(g.items.length>1?`<div class="seg ksseg">${g.items.map(i=>`<button data-kssub="${g.id}:${i.id}"${i===it?' class="on"':''}>${esc(i.seg)}</button>`).join('')}</div>`:'')+'<div class="kssub"></div>'; reason='show'; }
    const box=p.querySelector('.kssub'), scr=it.screen?screenEl(g,it):null;
    try{ it.render&&it.render(box,{reason:reason||'update',screen:scr,item:it}); }catch(e){ console.error('[KS] render '+it.id,e); box.innerHTML='<p class="hint">Ошибка модуля: '+esc(e.message)+'</p>'; } };
  const SCR={};
  function screenEl(g,it){ const key=g.id+':'+it.id; let s=SCR[key]; if(!s){ s=document.createElement('div'); s.className='ksscreen glass'; s.dataset.ksscreen=key; s.hidden=true; $('section.work').appendChild(s); SCR[key]=s; } s.hidden=false; return s; }
  function screens(g){ const it=g&&subOf(g); Object.entries(SCR).forEach(([k,s])=>{ const on=!!(g&&it&&it.screen&&k===g.id+':'+it.id); if(s.hidden===on){ s.hidden=!on; if(!on) K.emit('screenHide',k); } }); document.documentElement.classList.toggle('ks-screen-on',!!(g&&it&&it.screen)); }
  K.screen=id=>SCR[Object.keys(SCR).find(k=>k.endsWith(':'+id))]||null;

  /* ---- modal dialogs ---- */
  K.modal=o=>{ let m=$('#ksm-'+o.id); if(!m){ m=document.createElement('div'); m.className='modal ksmodal'; m.id='ksm-'+o.id; m.hidden=true;
      m.innerHTML=`<div class="cmdbox glass ksmbox${o.wide?' wide':''}${o.full?' full':''}"><div class="exphd"><b>${esc(o.title||'')}</b><button class="btn sm icon" data-ksclose="1" aria-label="Закрыть">✕</button></div><div class="ksmbody"></div></div>`;
      document.body.appendChild(m); m.addEventListener('click',e=>{ if(e.target===m||e.target.closest('[data-ksclose]')) api.close(); }); }
    const api={el:m.querySelector('.ksmbody'),root:m,open(){ m.hidden=false; K.emit('modalOpen',o.id); return api; },close(){ if(m.hidden) return; m.hidden=true; if(o.onClose) try{ o.onClose(); }catch(e){ console.error(e); } K.emit('modalClose',o.id); },get open_(){ return !m.hidden; },title(t){ m.querySelector('.exphd b').textContent=t; }};
    return api; };
  document.addEventListener('keydown',e=>{ if(e.key!=='Escape') return; const m=[...document.querySelectorAll('.ksmodal:not([hidden])')].pop(); if(!m) return; e.preventDefault(); e.stopPropagation(); m.querySelector('[data-ksclose]').click(); },true);

  /* ---- toolbar buttons over the layout, commands for the ⌘K palette ---- */
  K.tool=o=>{ TOOLS.push(o); const b=document.createElement('button'); b.className='btn sm kstool'+(o.app==='print'?' pOnlyI':''); b.id='kst-'+o.id; b.title=o.title||''; b.innerHTML=o.label; b.addEventListener('click',()=>{ try{ o.run(); }catch(e){ console.error(e); } }); const ref=$('#tMock'); if(ref) ref.before(b); return b; };
  K.cmd=(n,k,f)=>CMDS.push({n,k,f});
  if(typeof allCmds==='function'){ const _ac=allCmds; allCmds=function(){ const C=_ac.apply(this,arguments); CMDS.forEach(c=>C.push(c)); return C; }; }

  /* ---- design-element inspector sections ---- */
  K.insp=o=>INSP.push(o);
  if(typeof renderDzInsp==='function'){ const _ri=renderDzInsp; renderDzInsp=function(){ _ri.apply(this,arguments); const box=$('#dzInsp'); const e=dzSel&&dzFind(dzSel); if(!box||!e) return;
    INSP.slice().sort((a,b)=>(a.order||50)-(b.order||50)).forEach(s=>{ try{ if(s.when&&!s.when(e)) return; const d=document.createElement('div'); d.className='ksinsp'; d.dataset.ksinsp=s.id; d.innerHTML=(s.title?`<div class="hd2">${esc(s.title)}</div>`:'')+s.html(e); box.appendChild(d); s.bind&&s.bind(d,e); }catch(err){ console.error('[KS] insp '+s.id,err); } }); K.emit('insp',box,e); }; }

  /* ---- design helpers ---- */
  K.doc=()=>st.dz; K.side=()=>dzSideOf(); K.sel=()=>dzSel?dzFind(dzSel):null; K.els=side=>dzEls(side);
  K.changed=rebuild=>{ if(rebuild){ update(); return; } save(); renderPreview(); };
  K.ensureDesign=()=>{ if(st.ui.app!=='print') dzSetMode('print'); if(!dzOn()) dzRestorePrint()||applyProduct('bc90',true); if(!['front','back'].includes(st.view)){ setView('front'); } return dzOn(); };
  K.readImage=(file,max)=>dzReadImage(file,max);
  K.pick=(accept,multiple)=>new Promise(res=>{ const i=document.createElement('input'); i.type='file'; i.accept=accept||'image/*'; i.multiple=!!multiple; i.onchange=()=>res([...(i.files||[])]); i.click(); });
  K.imgSize=src=>new Promise(res=>{ const im=new Image(); im.onload=()=>res({w:im.naturalWidth,h:im.naturalHeight}); im.onerror=()=>res({w:0,h:0}); im.src=src; });
  /* put a picture into the current design: mode auto|add|replace|bg */
  K.addImage=async(src,o={})=>{ K.ensureDesign(); const d=st.dz, mode=o.mode||'auto', sel=K.sel();
    if(mode==='bg'){ d[dzSideOf()==='back'?'bgImgBack':'bgImg']=src; update(); toast('Фото стало фоном'); return null; }
    if((mode==='auto'||mode==='replace')&&sel&&sel.t==='img'&&sel.k!=='logo'){ sel.src=src; if(o.credit) sel.credit=o.credit; update(); toast('Фото заменено'); return sel; }
    if(mode==='auto'){ const slot=dzEls().find(x=>x.t==='img'&&!x.src&&x.k!=='logo'); if(slot){ slot.src=src; if(o.credit) slot.credit=o.credit; dzSelect(slot.id); update(); toast('Фото в рамке макета'); return slot; } }
    const {w:iw,h:ih}=await K.imgSize(src), W=d.w, Hh=d.h, r=iw&&ih?iw/ih:1.5; let w=W*.7, h=w/r; if(h>Hh*.7){ h=Hh*.7; w=h*r; }
    const props=Object.assign({src,x:(W-w)/2,y:(Hh-h)/2,w,h},o.credit?{credit:o.credit}:{}); const before=new Set(dzEls().map(x=>x.id)); dzAdd('img',props); const n=dzEls().find(x=>!before.has(x.id)); toast('Фото добавлено на макет'); return n||null; };
  K.palette=async(src,name)=>{ const cols=await dzExtract(src); if(!cols||!cols.length){ toast('Не получилось взять цвета'); return []; } K.ensureDesign(); dzSetPalette(cols,name||'Из фото'); toast('Палитра из фото применена'); return cols; };
  /* fetch a remote picture as a data URL (needs CORS on the server) */
  K.fetchImage=async(url,max)=>{ const r=await fetch(url,{mode:'cors',credentials:'omit'}); if(!r.ok) throw new Error('HTTP '+r.status); const b=await r.blob(); if(!/^image\//.test(b.type)) throw new Error('not image'); const f=new File([b],'img',{type:b.type}); return dzReadImage(f,max||3200); };

  /* ---- printing and files ---- */
  K.page=(w,h,inner,name)=>({pw:w,ph:h,name:name||'list',html:`<div class="page" style="width:${w}mm;height:${h}mm;position:relative;overflow:hidden;background:#fff">${inner}</div>`});
  K.print=(pages,opt)=>printPages(pages,Object.assign({bg:true},opt||{}));
  K.download=(name,blob)=>saveFile(name,blob);
  K.printer=()=>{ const id=(st.shop&&st.shop.printer)||'gx4040'; return Object.assign({id},PRINTERS[id]||PRINTERS.gx4040); };

  /* ---- IndexedDB key-value store for big data (photos, fonts) ---- */
  let dbp=null; const db=()=>dbp||(dbp=new Promise((res,rej)=>{ const r=indexedDB.open('ks-store',1); r.onupgradeneeded=()=>{ const d=r.result; ['files','kv'].forEach(n=>{ if(!d.objectStoreNames.contains(n)) d.createObjectStore(n); }); }; r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error); }));
  const tx=(store,mode,fn)=>db().then(d=>new Promise((res,rej)=>{ const t=d.transaction(store,mode), s=t.objectStore(store); const q=fn(s); t.oncomplete=()=>res(q&&q.result); t.onerror=()=>rej(t.error); }));
  K.idb={get:(k,s)=>tx(s||'kv','readonly',o=>o.get(k)),set:(k,v,s)=>tx(s||'kv','readwrite',o=>o.put(v,k)),del:(k,s)=>tx(s||'kv','readwrite',o=>o.delete(k)),keys:s=>tx(s||'kv','readonly',o=>o.getAllKeys()),all:s=>tx(s||'kv','readonly',o=>o.getAll())};

  /* ---- host wiring ---- */
  document.addEventListener('click',e=>{ const b=e.target.closest('[data-kssub]'); if(!b) return; const [g,i]=b.dataset.kssub.split(':'); K.show(g,i); });
  $('#rail').addEventListener('click',e=>{ if(e.target.closest('.rbtn')&&!e.target.closest('.kstab')) screens(null); });
  if(typeof renderAll==='function'){ const _ra=renderAll; renderAll=function(){ _ra.apply(this,arguments); if(ORDER.some(g=>g.tid===activeTab)) K.render('update'); K.emit('render'); }; }
  if(typeof dzAfterRender==='function'){ const _ar=dzAfterRender; dzAfterRender=function(){ const r=_ar.apply(this,arguments); K.emit('preview'); return r; }; }
  if(typeof dzSelect==='function'){ const _ds=dzSelect; dzSelect=function(id){ const r=_ds.apply(this,arguments); K.emit('select',id); return r; }; }
  if(typeof dzApplyMode==='function'){ const _am=dzApplyMode; dzApplyMode=function(){ const r=_am.apply(this,arguments); const cur=ORDER.find(g=>g.tid===activeTab); if(cur&&cur.app!=='both'&&cur.app!==st.ui.app){ screens(null); const f=$(st.ui.app==='print'?'.rbtn[data-tab="shop"]':'.rbtn[data-tab="tpl"]'); if(f) f.click(); } K.emit('mode',st.ui.app); return r; }; }
  if(typeof travel==='function'){ const _tr=travel; travel=function(){ const keep={ks:st.ks,orders:st.orders,clients:st.clients}; const r=_tr.apply(this,arguments); if(keep.ks) st.ks=keep.ks; if(keep.orders) st.orders=keep.orders; if(keep.clients) st.clients=keep.clients; try{ renderAll(); }catch(_){} return r; }; }
  if(typeof printNow==='function'){ const _pn=printNow; printNow=async function(test){ K.emit('beforePrint',{test:!!test}); const r=await _pn.apply(this,arguments); K.emit('print',{test:!!test}); return r; }; }
  K._boot=()=>{ K.emit('boot'); const g=ORDER.find(x=>x.tid===activeTab); if(g) K.render('show'); };
  return K;
})();
