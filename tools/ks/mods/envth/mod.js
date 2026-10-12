KS.mod('envth',{title:'Знак TH в Конвертах'});
/* The tadhayrapetian / TH brand mark in «Конверты». The mark is drawn by the postcard module (KS.thSVG); here it becomes an
   envelope drawing {data:SVG thumbnail, w, th:{settings}}; envHTML draws it inline with the real web fonts, so it moves, scales, rotates and
   prints like every other envelope element and stays vector. */
const ETV=[['monoword','Знак + имя'],['mono','Монограмма'],['sig','Подпись'],['word','Надпись'],['crest','Герб'],['badge','Плашка'],['stack','Два слова']];
const ETVB={sig:[200,120],badge:[200,120],stack:[200,120],word:[240,60],mono:[100,100],monoword:[100,100],crest:[100,100]};
const ETF=[['','Антиква'],['didone','Дидона'],['script','Каллиграфия'],['sans','Гротеск'],['hand','Рукописный'],['slab','Брусковый']];
const ETC=[['ink','Как текст'],['accent','Акцент'],['gold','Золото'],['black','Чёрный'],['white','Белый'],['own','Свой']];
const S=()=>KS.store('envth',{v:'monoword',txt:'',ini:'',sub:'',ff:'',col:'ink',c:'#2b2b2b',w:30});
const envOn=()=>!(st.ui&&st.ui.app==='print');
function envCols(){ try{ const e=effOf(tpl(),ovOf(st.tpl)); return {ink:e.ink||'#2b2b2b',accent:e.accent||'#b08d57'}; }catch(_){ return {ink:'#2b2b2b',accent:'#b08d57'}; } }
function colOf(o){ const c=envCols(); return ({ink:c.ink,accent:c.accent,gold:'#b08d57',black:'#1d1d1f',white:'#ffffff'})[o.col]||o.c||'#2b2b2b'; }
const thOf=(o,color)=>({v:o.v,txt:o.txt||'',ini:o.ini||'',sub:o.sub||'',ff:o.ff||'',color});
function markHTML(o,color){ return KS.thSVG(thOf(o,color),dzPal({ink:color})); }
const sizeOf=(v,w)=>{ const b=ETVB[v]||[100,100]; return {w,h:+(w*b[1]/b[0]).toFixed(2)}; };
/* data = small standalone SVG (thumbnail in the list); on the envelope, in print and in PDF the mark is drawn inline (see envHTML
   below) with the page's real web fonts, so it is always crisp vector and laid out exactly like in Типография */
async function markData(o){ const color=colOf(o), {w,h}=sizeOf(o.v,o.w||30), inner=markHTML(o,color);
  const raw=inner.replace(/<svg\b([^>]*)>/,(m,a)=>'<svg xmlns="http://www.w3.org/2000/svg"'+a.replace(/\sstyle="[^"]*"/,'').replace(/\s(width|height)="[^"]*"/g,'')+` width="${w}mm" height="${h}mm">`);
  return {data:'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(raw),vec:true}; }
const inlineOf=d=>{ const t=d.th, {w,h}=sizeOf(t.v,d.w||t.w||30); return `<div class="eth-mark" style="position:relative;width:${w}mm;height:${h}mm">${markHTML(t,colOf(t))}</div>`; };
{ const _eh=envHTML; envHTML=function(){ let h=_eh.apply(this,arguments); try{ if(h&&(st.drawings||[]).some(d=>d&&d.th)) st.drawings.forEach(d=>{ if(!d||!d.th) return; const img=`<img src="${d.data}" style="width:${d.w}mm;height:auto">`; if(h.includes(img)) h=h.split(img).join(inlineOf(d)); }); }catch(_){ } return h; }; }
const selIdx=()=>{ const m=/^dr(\d+)$/.exec(typeof sel==='string'?sel:''); if(!m) return -1; const i=+m[1]; return st.drawings[i]&&st.drawings[i].th?i:-1; };
let busy=false;
async function addMark(side){ if(busy) return; if(!KS.thSVG){ toast('Знак TH недоступен'); return; } busy=true; const o=S();
  try{ if(side==='back'&&st.view!=='back') setView('back'); else if(side==='front'&&st.view!=='front') setView('front');
    const r=await markData(o); st.drawings.push(sideNew({data:r.data,w:o.w||30,th:Object.assign({},o)})); sel='dr'+(st.drawings.length-1);
    syncUI(); update(); toast('Знак TH на конверте. Тяните его мышью, ширина — в списке ниже.'); }
  catch(e){ console.error(e); toast('Не получилось поставить знак'); } finally{ busy=false; renderCard(); } }
async function updateSel(){ const i=selIdx(); if(i<0||busy) return; busy=true; const o=S(), d=st.drawings[i];
  try{ const r=await markData(Object.assign({},o,{w:d.w})); d.data=r.data; d.th=Object.assign({},o,{w:d.w}); syncUI(); update(); toast('Знак обновлён'); }
  catch(e){ toast('Не получилось обновить знак'); } finally{ busy=false; renderCard(); } }
function loadSel(){ const i=selIdx(); if(i<0) return; const t=st.drawings[i].th, o=S(); ['v','txt','ini','sub','ff','col','c'].forEach(k=>{ if(t[k]!=null) o[k]=t[k]; }); o.w=st.drawings[i].w||o.w; KS.save(); renderCard(); }
function cardHTML(){ const o=S(), color=colOf(o), si=selIdx(), dark=['white'].includes(o.col);
  return `<div class="hd">Знак TH <span class="eth-sub">tadhayrapetian</span></div>
  <div class="eth-grid">${ETV.map(([v,n])=>`<button class="eth-v${o.v===v?' on':''}${dark?' dark':''}" data-ethv="${v}" title="${n}"><span>${markHTML(Object.assign({},o,{v}),color)}</span><small>${n}</small></button>`).join('')}</div>
  <div class="row2"><label class="f">Имя или надпись<input type="text" data-eth="txt" maxlength="40" value="${esc(o.txt||'')}" placeholder="tadhayrapetian"></label><label class="f">Буквы знака<input type="text" data-eth="ini" maxlength="2" value="${esc(o.ini||'')}" placeholder="TH"></label></div>
  <label class="f">Подпись под знаком<input type="text" data-eth="sub" maxlength="22" value="${esc(o.sub||'')}" placeholder="handmade · Yerevan"></label>
  <label class="f">Шрифт<select data-eth="ff">${ETF.map(([k,n])=>`<option value="${k}"${(o.ff||'')===k?' selected':''}>${n}</option>`).join('')}</select></label>
  <div class="hd2">Цвет</div><div class="flexw eth-cols">${ETC.map(([k,n])=>`<button class="btn sm${o.col===k?' primary':''}" data-ethc="${k}">${k==='own'?'':`<i style="background:${colOf({col:k,c:o.c})}"></i>`}${n}</button>`).join('')}${o.col==='own'?`<input type="color" data-eth="c" value="${esc(o.c||'#2b2b2b')}" aria-label="Свой цвет">`:''}</div>
  <label class="f">Ширина знака, мм<input type="number" data-eth="w" min="8" max="200" step="1" value="${o.w||30}"></label>
  <div class="flexw"><button class="btn sm primary" data-ethadd="front">На лицевую сторону</button><button class="btn sm" data-ethadd="back">На оборот</button></div>
  ${si>=0?`<div class="flexw"><button class="btn sm primary" data-ethupd="1">Применить к выбранному знаку</button><button class="btn sm" data-ethload="1">Взять настройки выбранного</button></div>`:'<p class="hint">Знак ложится векторно: при печати и в PDF он остаётся чётким. Выберите знак на конверте, чтобы изменить его.</p>'}`; }
function renderCard(){ const panel=$('[data-panel="items"]'); if(!panel) return; let c=$('#ethCard');
  if(!c){ c=document.createElement('div'); c.className='card eth-card'; c.id='ethCard'; const ref=$('#sideCard'); if(ref) ref.after(c); else panel.prepend(c); }
  if(c.contains(document.activeElement)&&document.activeElement.matches('input[type=text],input[type=number]')) return;
  c.innerHTML=cardHTML(); }
function labelList(){ $$('#drwList .item').forEach((it,i)=>{ const d=st.drawings[i]; if(!d||!d.th) return; const b=it.querySelector('.t b'); if(b&&b.textContent!=='Знак TH') b.textContent='Знак TH'; const im=it.querySelector('img'); if(im) im.style.background=d.th.col==='white'?'#333':'#fff'; }); }
KS.on('render',()=>{ if(!envOn()) return; if(activeTab==='items') renderCard(); labelList(); });
KS.on('select',()=>{ if(envOn()&&activeTab==='items') renderCard(); });
{ const _gt=goTab; goTab=function(id){ const r=_gt.apply(this,arguments); try{ if(id==='items'&&envOn()) renderCard(); }catch(_){ } return r; }; }
document.addEventListener('pointerup',e=>{ if(envOn()&&activeTab==='items'&&e.target.closest&&e.target.closest('#inner .blk')) setTimeout(renderCard,30); });
document.addEventListener('click',e=>{ const b=e.target.closest('#ethCard button'); if(!b) return; const o=S();
  if(b.dataset.ethv){ o.v=b.dataset.ethv; KS.save(); renderCard(); return; }
  if(b.dataset.ethc){ o.col=b.dataset.ethc; KS.save(); renderCard(); return; }
  if(b.dataset.ethadd){ addMark(b.dataset.ethadd); return; }
  if(b.dataset.ethupd){ updateSel(); return; }
  if(b.dataset.ethload){ loadSel(); return; } });
document.addEventListener('input',e=>{ const t=e.target.closest('#ethCard [data-eth]'); if(!t) return; const o=S(), k=t.dataset.eth;
  o[k]=k==='w'?Math.max(8,Math.min(200,+t.value||30)):t.value; KS.save();
  if(k==='c'||k==='ff'){ renderCard(); return; }
  const g=$('#ethCard .eth-grid'); if(g){ const color=colOf(o); g.querySelectorAll('[data-ethv]').forEach(b=>{ b.querySelector('span').innerHTML=markHTML(Object.assign({},o,{v:b.dataset.ethv}),color); }); } });
/* the «TH» toolbar button works in «Конверты» too */
function hookTool(){ const b=$('#kst-th'); if(!b||b.dataset.env) return; b.dataset.env='1'; b.classList.remove('pOnlyI');
  b.addEventListener('click',e=>{ if(!envOn()) return; e.stopImmediatePropagation(); addMark(st.view==='back'?'back':'front'); },true); }
hookTool(); KS.on('boot',hookTool);
KS.cmd('Знак TH на конверт','конверты',()=>{ if(!envOn()){ toast('Откройте режим «Конверты»'); return; } goTab('items'); setTimeout(()=>{ renderCard(); const c=$('#ethCard'); if(c) c.scrollIntoView({block:'start',behavior:'smooth'}); },60); });
KS.envth={add:addMark,data:markData};
