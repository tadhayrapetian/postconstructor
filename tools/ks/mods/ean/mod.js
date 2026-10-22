KS.mod('ean',{title:'Штрихкод EAN-13 для маркетплейсов'});
/* Real EAN-13 retail barcodes. The app's barcode element always drew CODE128, which marketplace scanners reject for a
   13-digit product number. Element props: e.fmt 'auto' (default: EAN-13 when the data is 13 digits with a correct check digit) |
   'ean13' | 'code128'; e.plate (EAN: white plate incl. quiet zones, default on). Sizes follow GS1: 100 % = 37.29 × 25.93 mm,
   minimum 80 % = 29.83 × 20.74 mm. Everything stays vector (SVG). */
const EAN_SIZES=[[80,29.83,20.74],[85,31.70,22.04],[90,33.56,23.34],[100,37.29,25.93]];
const digits=s=>String(s||'').replace(/\D/g,'');
function eanCheck(d12){ let sum=0; for(let i=0;i<12;i++) sum+=(+d12[i])*(i%2?3:1); return String((10-sum%10)%10); }
function eanInfo(raw){ const d=digits(raw); if(d.length===12) return {ok:true,code:d+eanCheck(d),added:true};
  if(d.length===13){ const c=eanCheck(d.slice(0,12)); return c===d[12]?{ok:true,code:d}:{ok:false,code:d,want:c,why:`Последняя (контрольная) цифра должна быть ${c}, а не ${d[12]}. Проверьте номер у маркетплейса.`}; }
  return {ok:false,code:d,why:d.length?`В EAN-13 ровно 13 цифр (или 12 — тогда контрольную добавлю сам). Сейчас: ${d.length}.`:'Введите 13 цифр номера.'}; }
const isEanAuto=raw=>{ const s=String(raw||'').trim(); return /^\d{13}$/.test(s)&&eanCheck(s.slice(0,12))===s[12]; };
/* geometry in JsBarcode units (module = 2): 11-module left / 7-module right quiet zones, height tuned to the GS1 ratio */
const ECACHE={};
function eanParts(code){ if(ECACHE[code]) return ECACHE[code]; if(typeof JsBarcode!=='function') throw new Error('no JsBarcode');
  const make=bh=>{ const s=document.createElementNS('http://www.w3.org/2000/svg','svg'); JsBarcode(s,code,{format:'EAN13',width:2,height:bh,displayValue:true,fontSize:18,textMargin:2,margin:0,marginLeft:0,marginRight:14,marginTop:4,marginBottom:2,background:'transparent',lineColor:'#000000',font:'monospace',flat:false}); return s; };
  const W=228, H=157.2; let s=make(130); const h1=parseFloat(s.getAttribute('height'))||150; s=make(Math.max(60,130+(H-h1)));
  const bh=Math.max(60,130+(H-h1)); const r={w:parseFloat(s.getAttribute('width'))||W,h:parseFloat(s.getAttribute('height'))||H,bh,inner:s.innerHTML.replace(/#000000/g,'currentColor')}; ECACHE[code]=r; return r; }
/* ISBN: an ISBN-13 (978/979…) is printed as EAN-13 with «ISBN …» above and an optional 5-digit EAN-5 add-on (price code, 90000 = no price) */
function isbn10ok(t){ let s=0; for(let i=0;i<10;i++){ const c=t[i]==='X'?10:+t[i]; s+=c*(10-i); } return s%11===0; }
function isbnInfo(raw){ const typed=String(raw||'').toUpperCase().replace(/^\s*ISBN[-\s:]*/,'').trim(), t=typed.replace(/[^0-9X]/g,'');
  if(t.length===10){ if(!/^\d{9}[\dX]$/.test(t)) return {ok:false,why:'В ISBN-10 буква X может быть только последней.'}; if(!isbn10ok(t)) return {ok:false,why:'Номер ISBN-10 с ошибкой: не сходится контрольная цифра. Проверьте номер.'};
    const c13='978'+t.slice(0,9), code=c13+eanCheck(c13); let label=code; if(/-/.test(typed)){ const k=typed.lastIndexOf('-'); label='978-'+typed.slice(0,k+1)+code[12]; } return {ok:true,code,label:'ISBN '+label,from10:true}; }
  if(t.length===13||t.length===12){ if(!/^97[89]/.test(t)) return {ok:false,why:'ISBN-13 начинается с 978 или 979.'}; const inf=eanInfo(t); if(!inf.ok) return {ok:false,why:inf.why.replace('Проверьте номер у маркетплейса.','Проверьте номер ISBN.'),want:inf.want};
    return {ok:true,code:inf.code,label:'ISBN '+(/-/.test(typed)&&t.length===13?typed.replace(/[^0-9X-]/g,''):inf.code)}; }
  return {ok:false,why:'Введите ISBN: 13 цифр (978…/979…) или старый 10-значный.'}; }
const ICACHE={};
function isbnParts(code,label,addon){ const key=code+'|'+label+'|'+(addon||''); if(ICACHE[key]) return ICACHE[key]; const e=eanParts(code), T=28; let w=e.w, inner=`<g transform="translate(0 ${T})">${e.inner}</g><text x="${(e.w+8)/2}" y="${T-8}" text-anchor="middle" font-family="monospace" font-size="17" fill="currentColor">${esc(label)}</text>`;
  if(/^\d{5}$/.test(addon||'')){ const a=document.createElementNS('http://www.w3.org/2000/svg','svg'); JsBarcode(a,addon,{format:'EAN5',width:2,height:Math.max(40,e.bh-22),displayValue:true,textPosition:'top',fontSize:18,textMargin:4,margin:0,background:'transparent',lineColor:'#000000',font:'monospace'});
    const ax=e.w-14+18; inner+=`<g transform="translate(${ax} ${T+4})">${a.innerHTML.replace(/#000000/g,'currentColor')}</g>`; w=ax+(parseFloat(a.getAttribute('width'))||94)+10; }
  const r={w,h:T+e.h,inner}; ICACHE[key]=r; return r; }
function isbnSVG(e,plate){ const inf=isbnInfo(e.data); if(!inf.ok) throw new Error(inf.why); const b=isbnParts(inf.code,inf.label,e.addon); return `<svg viewBox="0 0 ${b.w} ${b.h}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="display:block">${plate!==false?`<rect x="0" y="0" width="${b.w}" height="${b.h}" fill="#ffffff"/>`:''}<g shape-rendering="crispEdges">${b.inner}</g></svg>`; }
const boxOf=e=>{ try{ if(e.fmt==='isbn'){ const inf=isbnInfo(e.data); if(inf.ok) return isbnParts(inf.code,inf.label,e.addon); } const inf=eanInfo(e.data); return eanParts(inf.ok?inf.code:'4600000000008'); }catch(_){ return {w:226,h:157.2}; } };
function eanSVG(code,plate,style){ const b=eanParts(code); return `<svg viewBox="0 0 ${b.w} ${b.h}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="display:block;${style||''}">${plate!==false?`<rect x="0" y="0" width="${b.w}" height="${b.h}" fill="#ffffff"/>`:''}<g shape-rendering="crispEdges">${b.inner}</g></svg>`; }
const wantsEan=e=>e&&e.t==='bar'&&(e.fmt==='ean13'||((!e.fmt||e.fmt==='auto')&&isEanAuto(e.data)));
/* design element: keep the app's frame (position, rotation, colour) and swap the CODE128 drawing for EAN-13 */
{ const _el=dzElHTML; dzElHTML=function(e,doc,pal,opt){ const h=_el.apply(this,arguments); if(h&&e&&e.t==='bar'&&e.fmt==='isbn'){ try{ return h.replace(/<svg[\s\S]*<\/svg>/,isbnSVG(e,e.plate)); }catch(_){ return h; } } if(!h||!wantsEan(e)) return h;
    const inf=eanInfo(e.data); if(!inf.ok&&inf.code.length!==13) return h; let svg; try{ svg=eanSVG(inf.ok?inf.code:inf.code,e.plate); }catch(_){ return h; }
    return h.replace(/<svg[\s\S]*<\/svg>/,svg); }; }
/* envelope / documents: a plain 13-digit valid EAN typed there is drawn as EAN-13 too */
{ const _b=barSVG; barSVG=function(text,hmm){ if(isEanAuto(text)){ try{ const b=eanParts(String(text).trim()), w=+(hmm*b.w/b.h).toFixed(2); return `<svg width="${w}mm" height="${hmm}mm" viewBox="0 0 ${b.w} ${b.h}" style="display:block"><rect width="${b.w}" height="${b.h}" fill="#ffffff"/><g shape-rendering="crispEdges">${b.inner}</g></svg>`; }catch(_){ } } return _b.apply(this,arguments); }; }
/* inspector */
const sizePct=e=>{ const b=boxOf(e); return Math.round(Math.min(e.w/(b.w*.165),e.h/(b.h*.165))*100); };
KS.insp({id:'ean',title:'Штрихкод',order:5,when:e=>e.t==='bar',
  html:e=>{ if(e.fmt==='isbn'){ const ii=isbnInfo(e.data), pct=sizePct(e);
      return `<div class="seg ean-seg">${[['auto','Авто'],['ean13','EAN-13'],['isbn','ISBN'],['code128','CODE128']].map(([k,n])=>`<button data-eanf="${k}"${e.fmt===k?' class="on"':''}>${n}</button>`).join('')}</div>
      <div class="ean-st ${ii.ok?'ok':'bad'}">${ii.ok?`✓ ${esc(ii.label)}${ii.from10?' — переведён из ISBN-10':''}`:'⚠︎ '+esc(ii.why)}</div>${!ii.ok&&ii.want?`<button class="btn sm" data-eanfix="1">Исправить на …${ii.want}</button>`:''}
      <label class="f">Код цены справа (5 цифр, необязательно)<input type="text" data-eanaddon="1" maxlength="5" inputmode="numeric" value="${esc(e.addon||'')}" placeholder="90000 — без цены"></label>
      <div class="hd2">Размер</div><div class="flexw">${[80,85,90,100].map(p=>`<button class="btn sm${Math.abs(pct-p)<=2?' primary':''}" data-eansz="${p}">${p}%</button>`).join('')}</div>
      <p class="hint">Сейчас ≈ ${pct}%${pct<80?' — <b class="ean-warn">меньше 80%, сканер может не прочитать</b>':''}. ISBN печатают на задней обложке внизу справа или слева.</p>
      <label class="chk"><input type="checkbox" data-eanplate="1"${e.plate!==false?' checked':''}>Белая подложка с полями</label>
      <div class="flexw"><button class="btn sm" data-eanblack="1">Чёрные штрихи</button><button class="btn sm" data-eanbottom="1">Вниз оборота</button></div>`; }
    const ean=wantsEan(e)||e.fmt==='ean13', inf=eanInfo(e.data), f=e.fmt||'auto', pct=sizePct(e), lightCol=(()=>{ try{ const c=dzCol(e.color||'ink',dzPal(st.dz.pal)); const m=String(c).match(/^#?([0-9a-f]{6})$/i); if(!m) return false; const n=parseInt(m[1],16), L=(.299*(n>>16)+.587*(n>>8&255)+.114*(n&255))/255; return L>.45; }catch(_){ return false; } })();
    return `<div class="seg ean-seg">${[['auto','Авто'],['ean13','EAN-13'],['isbn','ISBN'],['code128','CODE128']].map(([k,n])=>`<button data-eanf="${k}"${f===k?' class="on"':''}>${n}</button>`).join('')}</div>
    ${ean?`<div class="ean-st ${inf.ok?'ok':'bad'}">${inf.ok?`✓ EAN-13 ${inf.code}${inf.added?' — контрольная цифра добавлена':''}`:'⚠︎ '+esc(inf.why)}</div>
    ${inf.ok&&inf.added?`<button class="btn sm" data-eanfix="1">Записать 13 цифр</button>`:''}${!inf.ok&&inf.want?`<button class="btn sm" data-eanfix="1">Исправить на …${inf.want}</button>`:''}
    <div class="hd2">Размер для сканера</div><div class="flexw">${EAN_SIZES.map(([p,w,h])=>`<button class="btn sm${Math.abs(pct-p)<=2?' primary':''}" data-eansz="${p}">${p}% · ${String(w).replace('.',',')} × ${String(h).replace('.',',')}</button>`).join('')}</div>
    <p class="hint">Сейчас ≈ ${pct}%. ${pct<80?'<b class="ean-warn">Меньше 80% — сканер может не прочитать.</b> ':''}Не сжимайте пропорции: ширину и высоту меняйте кнопками.</p>
    <label class="chk"><input type="checkbox" data-eanplate="1"${e.plate!==false?' checked':''}>Белая подложка с полями по краям (нужна сканеру)</label>
    ${lightCol?'<p class="hint ean-warn">Цвет штрихов светлый — выберите чёрный или тёмный.</p>':''}
    <div class="flexw"><button class="btn sm" data-eanblack="1">Чёрные штрихи</button><button class="btn sm" data-eanbottom="1">Вниз оборота</button></div>`
    :`<p class="hint">${f==='auto'?'13 цифр с верной контрольной цифрой автоматически станут EAN-13. ':''}Для маркетплейса выберите «EAN-13 (товар)».</p>`}`; },
  bind(div,e){ div.addEventListener('input',ev=>{ const t=ev.target; if(t.dataset&&t.dataset.eanaddon){ e.addon=t.value.replace(/\D/g,'').slice(0,5); if(!e.addon||e.addon.length===5){ const p=sizePct(Object.assign({},e,{addon:''})); eanSize(e,Math.max(80,Math.min(100,p||85))); KS.changed(); } } });
    div.addEventListener('click',ev=>{ const b=ev.target.closest('button,input'); if(!b) return;
      if(b.dataset.eanf){ e.fmt=b.dataset.eanf; if(e.fmt==='isbn'){ e.plate=e.plate!==false; if(!isbnInfo(e.data).ok) e.data='978-5-00000-000-'+eanCheck('978500000000'); eanSize(e,85); KS.changed(true); return; } if(e.fmt==='ean13'){ e.plate=e.plate!==false; const d=digits(e.data); if(d.length<12) e.data='4850000000000'.slice(0,12)+eanCheck('485000000000'); const r=e.w/e.h; if(r<1.2||r>1.7) eanSize(e,85); } KS.changed(true); return; }
      if(b.dataset.eanfix){ if(e.fmt==='isbn'){ const t=String(e.data).replace(/\D/g,''); const ii=isbnInfo(e.data); if(ii.want) e.data=t.slice(0,12)+ii.want; KS.changed(true); return; } const inf=eanInfo(e.data); e.data=inf.ok?inf.code:inf.code.slice(0,12)+inf.want; KS.changed(true); return; }
      if(b.dataset.eansz){ eanSize(e,+b.dataset.eansz); KS.changed(true); return; }
      if(b.dataset.eanplate){ e.plate=b.checked; KS.changed(); return; }
      if(b.dataset.eanblack){ e.color='black'; KS.changed(true); return; }
      if(b.dataset.eanbottom){ eanBottom(e); KS.changed(true); return; } }); } });
function eanSize(e,p){ const b=boxOf(e), k=.165*p/100; const cx=e.x+e.w/2, cy=e.y+e.h/2; e.w=+(b.w*k).toFixed(2); e.h=+(b.h*k).toFixed(2); e.x=+(cx-e.w/2).toFixed(2); e.y=+(cy-e.h/2).toFixed(2);  try{ const d=st.dz, m=6; e.x=+Math.max(m,Math.min(d.w-m-e.w,e.x)).toFixed(2); e.y=+Math.max(m,Math.min(d.h-m-e.h,e.y)).toFixed(2); }catch(_){ } }
function eanBottom(e){ const d=st.dz, m=6; e.x=m; e.y=+(d.h-m-e.h).toFixed(2); e.rot=0; }
/* one click: EAN-13 at the bottom of the back side (postcards, cards, labels) */
function addToBack(code){ if(!dzOn||!dzOn()){ toast('Откройте макет в «Типографии»'); return false; }
  const raw=code!=null?code:prompt('Номер штрихкода: EAN-13 (13 цифр) или ISBN (978…):',''); if(raw==null) return false;
  const rd=String(raw).replace(/[^0-9Xx]/g,''); if(/isbn/i.test(raw)||rd.length===10||/^97[89]\d{10}$/.test(rd)){ const ii=isbnInfo(raw); if(!ii.ok){ toast(ii.why); return false; }
    if((st.dz.sides||1)<2) st.dz.sides=2; if(st.view!=='back') setView('back'); const e={id:dzId(),t:'bar',fmt:'isbn',plate:true,data:String(raw).replace(/^\s*ISBN[-\s:]*/i,'').trim(),addon:'',color:'black',x:0,y:0,w:30,h:25}; eanSize(e,85); e.x=+(st.dz.w-6-e.w).toFixed(2); e.y=+(st.dz.h-6-e.h).toFixed(2);
    dzEls('back').push(e); dzSelect(e.id); update(); toast(ii.label+' внизу справа на обороте · 85%'); return true; }
  const inf=eanInfo(raw); if(!inf.ok&&!(inf.want&&confirm(inf.why+'\n\nИсправить контрольную цифру на '+inf.want+'?'))){ if(!inf.want) toast(inf.why); return false; }
  const data=inf.ok?inf.code:inf.code.slice(0,12)+inf.want;
  if((st.dz.sides||1)<2) st.dz.sides=2; if(st.view!=='back') setView('back');
  const e={id:dzId(),t:'bar',fmt:'ean13',plate:true,data,color:'black',w:31.7,h:22,x:0,y:0}; eanSize(e,85); eanBottom(e);
  dzEls('back').push(e); dzSelect(e.id); update(); toast(`EAN-13 ${data} внизу оборота · 85% (${String(e.w).replace('.',',')} × ${String(e.h).replace('.',',')} мм)`); return true; }
KS.cmd('Штрихкод EAN-13 на оборот','макет',()=>addToBack());
KS.cmd('Штрихкод ISBN (книга, блокнот) на оборот','макет',()=>{ const v=prompt('Номер ISBN (13 цифр 978… или старый 10-значный):','978-'); if(v!=null) addToBack(v); });
/* preflight */
{ const _pc=dzPrinterChecks; dzPrinterChecks=function(add){ const r=_pc.apply(this,arguments); try{ if(dzOn()) ['front','back'].forEach(sd=>dzEls(sd).forEach(e=>{ if(e.hide) return; if(e.t==='bar'&&e.fmt==='isbn'){ const ii=isbnInfo(e.data), p=sizePct(e); if(!ii.ok) add('warn','Штрихкод ISBN: '+ii.why); else if(p<80) add('warn',`Штрихкод ISBN меньше 80% (${p}%).`); else add('ok',`✓${ii.label}, ${p}%`); return; } if(!wantsEan(e)) return; const inf=eanInfo(e.data), p=sizePct(e);
      if(!inf.ok) add('warn','Штрихкод EAN-13: '+inf.why); else if(p<80) add('warn',`Штрихкод EAN-13 меньше 80% (${p}%) — сканер маркетплейса может не прочитать. Выделите его → «85%».`); else if(e.plate===false) add('warn','Штрихкод EAN-13 без белой подложки — на цветном фоне сканер может не прочитать.'); else add('ok',`✓Штрихкод EAN-13 ${inf.code}, ${p}%`); })); }catch(_){ } return r; }; }
KS.ean={check:eanInfo,isbn:isbnInfo,addToBack,svg:eanSVG};
