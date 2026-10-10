KS.mod('nav',{title:'Навигация по разделам'});
/* 1. «Шаблоны» opens as a full page: the template gallery moves onto the big work area */
const gal=$('#dzGal'); let galHome=null, page=null;
if(gal){ galHome=document.createComment('dzGal home'); gal.before(galHome);
  page=document.createElement('div'); page.className='ksscreen glass navpage'; page.hidden=true;
  page.innerHTML='<div class="navpage-hd"><div><h2>Шаблоны</h2><p class="hint" id="navPageSub"></p></div><span class="hint">Нажмите на шаблон — он откроется в «Макете»</span></div>';
  $('section.work').appendChild(page); }
function syncPage(){ if(!page) return; const on=activeTab==='shop'&&st.ui.app==='print';
  if(on&&gal.parentElement!==page){ page.appendChild(gal); } if(!on&&gal.parentElement===page){ galHome.after(gal); }
  if(page.hidden===on){ page.hidden=!on; if(on) try{ renderDzGallery(); }catch(_){} }
  if(on){ const P=prodById(st.prod), s=$('#navPageSub'); if(s) s.textContent=(P?P.n+' · ':'')+gal.querySelectorAll('[data-dztpl]').length+' шаблонов'; }
  document.documentElement.classList.toggle('nav-page-on',on); }
KS.on('render',syncPage); KS.on('mode',syncPage); KS.on('boot',syncPage);
$('#rail').addEventListener('click',()=>setTimeout(syncPage,0));
document.addEventListener('click',e=>{ const b=e.target.closest('.navpage [data-dztpl]'); if(b&&!e.target.closest('[data-dzdeltpl]')) setTimeout(()=>{ if(activeTab==='shop'){ root.dataset.navskip='1'; goTab('dz'); } close(); },0); });
/* 2. narrow screens (iPad portrait, small windows): the side panel opens as its own page over the work area */
const mq=matchMedia('(max-width:1100px)'); const root=document.documentElement;
const close=()=>root.classList.remove('side-open');
function onTab(){ if(!mq.matches) return; if(root.dataset.navskip){ delete root.dataset.navskip; close(); return; } const big=['shop'].includes(activeTab)||!!(KS.active()&&KS.active().screen); root.classList.toggle('side-open',!big||root.classList.contains('side-keep')); }
$('#rail').addEventListener('click',e=>{ const b=e.target.closest('.rbtn'); if(!b||!mq.matches) return; if(b.classList.contains('on')&&root.classList.contains('side-open')&&b.dataset.navlast===activeTab){ close(); b.dataset.navlast=''; return; } setTimeout(()=>{ onTab(); b.dataset.navlast=activeTab; },0); });
const hd=$('#sideTitle'); if(hd){ const x=document.createElement('button'); x.className='btn sm navclose'; x.type='button'; x.innerHTML='← К макету'; x.addEventListener('click',close); hd.after(x);
  const t=document.createElement('button'); t.className='btn sm navpanel'; t.type='button'; t.textContent='Настройки раздела'; t.addEventListener('click',()=>root.classList.add('side-open')); $('section.work').appendChild(t); }
mq.addEventListener('change',()=>{ if(!mq.matches) close(); });
KS.on('select',()=>{ /* tapping an element on the layout keeps the page closed */ });

function navTop(){ const h=$('header.top'); if(h) root.style.setProperty('--nav-top',Math.round(h.getBoundingClientRect().bottom+10)+'px'); }
addEventListener('resize',navTop); KS.on('boot',navTop); setTimeout(navTop,300);
{ const _rg=renderDzGallery; renderDzGallery=function(){ const box=$('#dzGal'); if(!box||!page||box.parentElement!==page) return _rg.apply(this,arguments);
    const full=page.clientWidth-40, cols=full>1100?4:full>760?3:2, bw=Math.floor(full/cols)-22; box.style.width=(2*(bw+22))+'px'; const r=_rg.apply(this,arguments); box.style.width=''; box.style.setProperty('--navbw',(bw+10)+'px'); return r; }; }
