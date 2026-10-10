/* ---- postcard 10×15 kinds, products and the TH logo element ---- */
const PC_KINDS=['pcH','pcV'];
DZ_KINDS.pcH={n:'Открытка 15 × 10, горизонтальная',w:152,h:102};
DZ_KINDS.pcV={n:'Открытка 10 × 15, вертикальная',w:102,h:152};
DZ_NEAR.pcH=['post']; DZ_NEAR.pcV=['photo'];
if(!PRODUCTS.some(p=>p.id==='pc15h')) PRODUCTS.unshift(
  {id:'pc15h',cat:'post',kind:'pcH',n:'Открытка 15 × 10 горизонтальная',w:152,h:102,sides:2,paper:'ph1015',ptype:'photo'},
  {id:'pc15v',cat:'post',kind:'pcV',n:'Открытка 10 × 15 вертикальная',w:102,h:152,sides:2,paper:'ph1015',ptype:'photo'});
const isPC=()=>!!(st.dz&&PC_KINDS.includes(st.dz.kind));
/* TH monogram — the shop's own mark. e.v: ring | serif | script | seal | line ; e.color role ; e.sub small caption */
function thSVG(e,pal){ const c=dzCol(e.color||'ink',pal), v=e.v||'ring', sub=(e.sub||'').toUpperCase().slice(0,22);
  const serif="'Cormorant Garamond','Playfair Display',Georgia,serif", script="'Great Vibes','Marck Script',cursive";
  const st0=`fill="${c}" stroke="none"`;
  if(v==='script') return `<svg viewBox="0 0 100 60" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="position:absolute;inset:0;overflow:visible"><text x="50" y="40" text-anchor="middle" font-family="${script}" font-size="44" ${st0}>Th</text>${sub?`<text x="50" y="56" text-anchor="middle" font-family="${serif}" font-size="7.5" letter-spacing="2.4" ${st0}>${esc(sub)}</text>`:''}</svg>`;
  if(v==='line') return `<svg viewBox="0 0 160 40" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="position:absolute;inset:0;overflow:visible"><line x1="4" y1="20" x2="52" y2="20" stroke="${c}" stroke-width=".8"/><line x1="108" y1="20" x2="156" y2="20" stroke="${c}" stroke-width=".8"/><text x="80" y="29" text-anchor="middle" font-family="${serif}" font-size="27" font-weight="600" letter-spacing="3" ${st0}>T<tspan font-style="italic" font-weight="400" dx="1">H</tspan></text>${sub?`<text x="80" y="39.5" text-anchor="middle" font-family="${serif}" font-size="5.6" letter-spacing="2" ${st0}>${esc(sub)}</text>`:''}</svg>`;
  const ring=v==='seal'?`<circle cx="50" cy="50" r="47" fill="none" stroke="${c}" stroke-width="1.6"/><circle cx="50" cy="50" r="42.5" fill="none" stroke="${c}" stroke-width=".6"/>`:v==='ring'?`<circle cx="50" cy="50" r="46" fill="none" stroke="${c}" stroke-width="1.1"/>`:'';
  const arc=v==='seal'&&sub?`<defs><path id="thArc${e.id||''}" d="M 20 50 A 30 30 0 0 1 80 50"/></defs><text font-family="${serif}" font-size="8.5" letter-spacing="2.2" ${st0}><textPath href="#thArc${e.id||''}" startOffset="50%" text-anchor="middle">${esc(sub)}</textPath></text>`:'';
  const mono=`<text x="39" y="${v==='seal'?66:65}" text-anchor="middle" font-family="${serif}" font-size="46" font-weight="600" ${st0}>T</text><text x="63" y="${v==='seal'?69:68}" text-anchor="middle" font-family="${serif}" font-size="42" font-style="italic" font-weight="400" ${st0}>H</text><line x1="31" y1="${v==='seal'?78:77}" x2="69" y2="${v==='seal'?78:77}" stroke="${c}" stroke-width=".7"/>`;
  const cap=v!=='seal'&&sub?`<text x="50" y="${v==='serif'?96:88}" text-anchor="middle" font-family="${serif}" font-size="6.6" letter-spacing="1.8" ${st0}>${esc(sub)}</text>`:'';
  return `<svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="position:absolute;inset:0;overflow:visible">${arc}${ring}${mono}${cap}</svg>`; }
{ const _el=dzElHTML; dzElHTML=function(e,doc,pal,opt){ if(!e||e.t!=='thlogo') return _el.apply(this,arguments);
    const h=_el.call(this,Object.assign({},e,{t:'icon',icon:'star',fill:'',color:'ink'}),doc,pal,opt); if(!h) return h;
    return h.replace(/<svg[\s\S]*<\/svg>/,thSVG(e,pal)).replace('data-t="icon"','data-t="thlogo"'); }; }
{ const _lb=dzLabel; dzLabel=function(e){ return e&&e.t==='thlogo'?'Логотип TH':_lb.apply(this,arguments); }; }
