KS.mod('ux',{title:'Плавность и жесты'});
/* ---- 1. speed: thumbnail cache, skip envelope-only work in print mode ---- */
{ const C=new Map(); const _t=dzThumb; dzThumb=function(T,boxW,pal,brand){ let k; try{ k=T.id+'|'+boxW+'|'+JSON.stringify(pal||null)+'|'+JSON.stringify(brand||null)+'|'+(T.front?JSON.stringify(T.front).length:0)+'|'+(T.back?JSON.stringify(T.back).length:0); }catch(_){ return _t.apply(this,arguments); }
    const h=C.get(k); if(h) return h; const r=_t.apply(this,arguments); C.set(k,r); if(C.size>500) C.delete(C.keys().next().value); return r; }; }
if(typeof renderPostage==='function'){ const _rp=renderPostage; renderPostage=function(){ if(st.ui&&st.ui.app==='print') return; return _rp.apply(this,arguments); }; }
if(typeof renderStamps==='function'){ const _rs=renderStamps; renderStamps=function(){ if(st.ui&&st.ui.app==='print'&&activeTab!=='stamps') return; return _rs.apply(this,arguments); }; }
/* ---- 2. gestures on the layout: pinch / ⌘+wheel zoom, 3-finger tap = undo, long-press menu ---- */
const area=$('#area'); let zRaf=0; const setZoom=z=>{ zoom=clamp(z,.3,5); if(!zRaf) zRaf=requestAnimationFrame(()=>{ zRaf=0; renderPreview(); }); };
area.addEventListener('wheel',e=>{ if(!(e.ctrlKey||e.metaKey)) return; e.preventDefault(); setZoom(zoom*Math.exp(-e.deltaY*.0025)); },{passive:false});
let gz=1; area.addEventListener('gesturestart',e=>{ e.preventDefault(); gz=zoom; }); area.addEventListener('gesturechange',e=>{ e.preventDefault(); setZoom(gz*e.scale); }); area.addEventListener('gestureend',e=>e.preventDefault());
const pts=new Map(); let pinch=null;
area.addEventListener('pointerdown',e=>{ if(e.pointerType!=='touch') return; pts.set(e.pointerId,{x:e.clientX,y:e.clientY}); if(pts.size===2){ const [a,b]=[...pts.values()]; pinch={d:Math.hypot(a.x-b.x,a.y-b.y),z:zoom}; lpCancel(); } },true);
area.addEventListener('pointermove',e=>{ if(!pts.has(e.pointerId)) return; pts.set(e.pointerId,{x:e.clientX,y:e.clientY}); if(pinch&&pts.size===2&&!('ongesturechange' in window)){ const [a,b]=[...pts.values()], d=Math.hypot(a.x-b.x,a.y-b.y); if(pinch.d>20) setZoom(pinch.z*d/pinch.d); } },true);
const pUp=e=>{ pts.delete(e.pointerId); if(pts.size<2) pinch=null; }; area.addEventListener('pointerup',pUp,true); area.addEventListener('pointercancel',pUp,true);
document.addEventListener('touchstart',e=>{ if(e.touches.length===3&&e.target.closest('#area')){ e.preventDefault(); try{ travel(-1); toast('Отменено'); }catch(_){ } } },{passive:false});
/* long-press (touch) or right click on a design element → quick menu */
const menu=document.createElement('div'); menu.className='uxmenu glass'; menu.hidden=true; document.body.appendChild(menu);
let lpT=0, lpAt=null; const lpCancel=()=>{ clearTimeout(lpT); lpT=0; };
function openMenu(id,x,y){ if(!dzOn()) return; const e=dzFind(id); if(!e) return; dzSelect(id);
  menu.innerHTML=`<b>${esc(dzLabel(e))}</b>${[['dup','Копия'],['up','Вперёд'],['down','Назад'],['lock',e.lock?'Открепить':'Закрепить'],['del','Удалить']].map(([k,n])=>`<button data-uxm="${k}"${k==='del'?' class="danger"':''}>${n}</button>`).join('')}`;
  menu.hidden=false; const r=menu.getBoundingClientRect(); menu.style.left=Math.min(innerWidth-r.width-8,Math.max(8,x-r.width/2))+'px'; menu.style.top=Math.min(innerHeight-r.height-8,Math.max(8,y+12))+'px'; }
menu.addEventListener('click',e=>{ const b=e.target.closest('[data-uxm]'); if(!b) return; const k=b.dataset.uxm; menu.hidden=true; const el=dzSel&&dzFind(dzSel); if(!el) return;
  if(k==='dup') dzDup(); else if(k==='del') dzDelete(); else if(k==='up') dzOrder(1); else if(k==='down') dzOrder(-1); else if(k==='lock'){ el.lock=!el.lock; update(); toast(el.lock?'Закреплено':'Откреплено'); } });
document.addEventListener('pointerdown',e=>{ if(!menu.hidden&&!e.target.closest('.uxmenu')) menu.hidden=true; },true);
area.addEventListener('pointerdown',e=>{ if(e.pointerType!=='touch') return; const n=e.target.closest('.dz.live .dzel'); if(!n||pts.size>1) return; lpAt={x:e.clientX,y:e.clientY,id:n.dataset.id}; lpCancel(); lpT=setTimeout(()=>{ lpT=0; if(lpAt) openMenu(lpAt.id,lpAt.x,lpAt.y); },560); },true);
area.addEventListener('pointermove',e=>{ if(lpAt&&Math.hypot(e.clientX-lpAt.x,e.clientY-lpAt.y)>8){ lpCancel(); lpAt=null; } },true);
area.addEventListener('pointerup',()=>{ lpCancel(); lpAt=null; },true);
area.addEventListener('contextmenu',e=>{ const n=e.target.closest('.dz.live .dzel'); if(!n) return; e.preventDefault(); openMenu(n.dataset.id,e.clientX,e.clientY); });
/* ---- 3. version history of the design (IndexedDB), restore after a crash or a bad change ---- */
const VK=()=>'ver:'+(typeof proj!=='undefined'?proj.cur:'p1');
let lastSnap='', snapT=0;
async function snap(force){ if(!st.dz||!dzHasDesign(st.dz)) return; let s; try{ s=JSON.stringify(st.dz); }catch(_){ return; } if(!force&&s===lastSnap) return; lastSnap=s;
  try{ const L=(await KS.idb.get(VK()))||[]; L.unshift({ts:Date.now(),prod:st.prod,dz:s}); while(L.length>40) L.pop(); await KS.idb.set(VK(),L); }catch(_){ } }
KS.on('render',()=>{ clearTimeout(snapT); snapT=setTimeout(snap,20000); }); setInterval(()=>snap(),180000); addEventListener('pagehide',()=>snap()); document.addEventListener('visibilitychange',()=>{ if(document.hidden) snap(); });
const vm=KS.modal({id:'versions',title:'История версий',wide:true});
async function openVersions(){ const L=(await KS.idb.get(VK()))||[]; const fmt=t=>new Date(t).toLocaleString('ru-RU',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
  vm.el.innerHTML=L.length?`<p class="hint">Программа сама сохраняет версии макета каждые несколько минут и при закрытии. Нажмите «Вернуть» — текущий макет тоже останется в истории.</p><div class="uxver">${L.map((v,i)=>{ let th=''; try{ const d=JSON.parse(v.dz); th=dzThumb(Object.assign({id:'ver'+v.ts,name:''},d,{w:d.w,h:d.h}),180,null,d.brand); }catch(_){ } return `<div class="uxv"><span class="uxth">${th}</span><b>${fmt(v.ts)}</b><small>${esc((prodById(v.prod)||{}).n||'')}</small><button class="btn sm primary" data-uxver="${i}">Вернуть</button></div>`; }).join('')}</div>`:'<div class="ks-empty">Пока нет сохранённых версий. Они появятся через несколько минут работы.</div>';
  vm.open(); }
vm.el.addEventListener('click',async e=>{ const b=e.target.closest('[data-uxver]'); if(!b) return; const L=(await KS.idb.get(VK()))||[]; const v=L[+b.dataset.uxver]; if(!v) return; await snap(true); try{ const d=JSON.parse(v.dz); if(v.prod&&v.prod!==st.prod) st.prod=v.prod; st.dz=d; st.dz.on=true; if(st.ui.app!=='print') dzSetMode('print'); update(); vm.close(); toast('Версия возвращена'); }catch(_){ toast('Не удалось открыть версию'); } });
KS.tool({id:'ver',label:'История',title:'История версий макета',app:'print',run:openVersions}); KS.cmd('История версий макета','файл',openVersions);
KS.ux={snap,openVersions,openMenu};
