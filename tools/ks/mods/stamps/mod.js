KS.mod('stamps',{title:'Штампы в Типографии'});
/* stamp element: {t:'stamp', st:{id,t1,t2,t3,color,grunge,seed,date,font}} rendered with the envelope stamp engine */
const _el=dzElHTML;
dzElHTML=function(e,doc,pal,opt){
  if(!e||e.t!=='stamp') return _el.apply(this,arguments);
  const h=_el.call(this,Object.assign({},e,{t:'icon',icon:'star',fill:'',color:'ink'}),doc,pal,opt); if(!h) return h;
  const x=Object.assign({},e.st||{}); let svg=''; try{ svg=rsSVG(x,true).replace('<svg ','<svg preserveAspectRatio="xMidYMid meet" style="position:absolute;inset:0;width:100%;height:100%;overflow:visible" ').replace(/style="display:block;overflow:visible;"/,''); }catch(err){ svg=''; }
  return h.replace(/<svg[\s\S]*<\/svg>/,svg).replace('data-t="icon"','data-t="stamp"');
};
const _lb=dzLabel; dzLabel=function(e){ if(e&&e.t==='stamp'){ const D=stampById(e.st&&e.st.id); return 'Штамп'+(D?' «'+D.n+'»':''); } return _lb.apply(this,arguments); };
function addDzStamp(id){ const D=STAMPS.find(s=>s.id===id); if(!D) return false; if(!dzOn()) return false;
  const d=st.dz, m=Math.min(d.w,d.h), w=Math.max(12,Math.min(m*.55,40)), h=w*D.r;
  const e={id:dzId(),t:'stamp',x:(d.w-w)/2,y:(d.h-h)/2,w,h,rot:-8,st:{id,t1:D.t1,t2:D.t2,t3:D.t3,color:D.col,grunge:.35,seed:Math.floor(Math.random()*90)+1,date:''}};
  dzEls().push(e); dzSelect(e.id); update(); toast('Штамп на макете. Тяните, растягивайте и поворачивайте его.'); return true; }
const _as=addStamp; addStamp=function(id){ if(dzOn()&&['front','back'].includes(st.view)){ addDzStamp(id); return; } if(dzOn()){ setView('front'); addDzStamp(id); return; } return _as.apply(this,arguments); };
/* the Штампы tab is available in Типография too */
const rb=$('.rbtn[data-tab="stamps"]'); if(rb){ rb.classList.remove('eOnly'); rb.classList.remove('adv'); }
KS.on('render',()=>{ const p=$('[data-panel="stamps"] > .hint'); if(p&&!p.dataset.ks){ p.dataset.ks=p.textContent; } if(p) p.textContent=st.ui.app==='print'?'Нажмите на штамп, и он встанет на макет. Цвет, надписи и потёртость меняются в панели «Макет».':p.dataset.ks; });
KS.insp({id:'stamp',title:'Штамп',when:e=>e.t==='stamp',html:e=>{ const x=e.st||{}; const f=(k,l)=>`<label class="f">${l}<input type="text" data-kstamp="${k}" value="${esc(x[k]||'')}"></label>`;
  return `<div class="row3">${f('t1','Верх')}${f('t2','Центр')}${f('t3','Низ')}</div><div class="row2"><label class="f">Чернила<input type="color" data-kstamp="color" value="${x.color||'#8b1e1e'}"></label><label class="f">Потёртость<input type="range" min="0" max="1" step="0.05" data-kstamp="grunge" value="${x.grunge??.35}"></label></div><label class="f">Дата (если есть в штампе)<input type="date" data-kstamp="date" value="${x.date||''}"></label>
  <div class="flexw">${['#8b1e1e','#1d3a8a','#1f6b3a','#5a2d82','#222222'].map(c=>`<button class="btn sm" data-kstampcol="${c}" style="min-width:34px;background:${c}" aria-label="${c}"></button>`).join('')}</div>`; },
  bind(div,e){ div.addEventListener('input',ev=>{ const k=ev.target.dataset.kstamp; if(!k) return; e.st=e.st||{}; e.st[k]=k==='grunge'?+ev.target.value:ev.target.value; KS.changed(); });
    div.addEventListener('click',ev=>{ const b=ev.target.closest('[data-kstampcol]'); if(!b) return; e.st.color=b.dataset.kstampcol; KS.changed(true); }); }});
