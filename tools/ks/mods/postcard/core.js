/* ---- postcard 10×15 kinds, products and the TH logo element ---- */
const PC_KINDS=['pcH','pcV'];
DZ_KINDS.pcH={n:'Открытка 15 × 10, горизонтальная',w:152,h:102};
DZ_KINDS.pcV={n:'Открытка 10 × 15, вертикальная',w:102,h:152};
DZ_NEAR.pcH=['post']; DZ_NEAR.pcV=['photo'];
if(!PRODUCTS.some(p=>p.id==='pc15h')) PRODUCTS.unshift(
  {id:'pc15h',cat:'post',kind:'pcH',n:'Открытка 15 × 10 горизонтальная',w:152,h:102,sides:2,paper:'ph1015',ptype:'photo'},
  {id:'pc15v',cat:'post',kind:'pcV',n:'Открытка 10 × 15 вертикальная',w:102,h:152,sides:2,paper:'ph1015',ptype:'photo'});
const isPC=()=>!!(st.dz&&PC_KINDS.includes(st.dz.kind));
/* Brand mark «tadhayrapetian» / TH. e.v: sig | word | mono | monoword | crest ; old values map onto the new marks */
const TH_MAP={script:'sig',line:'word',ring:'mono',serif:'mono',seal:'monoword'};
function thMono(c,x,y,s){ /* TH ligature: Cormorant T whose stem merges with the left stem of H, hairline underline */
  const k=s/100, serif="'Cormorant Garamond','Playfair Display',Georgia,serif";
  return `<g transform="translate(${x} ${y}) scale(${k})"><text x="38" y="74" text-anchor="middle" font-family="${serif}" font-size="74" font-weight="500" fill="${c}">T</text><text x="60.5" y="74" text-anchor="middle" font-family="${serif}" font-size="74" font-weight="500" fill="${c}">H</text><path d="M24 82.5 L78 82.5" stroke="${c}" stroke-width=".8"/><path d="M51 79.5 L53.5 82.5 L51 85.5 L48.5 82.5 Z" fill="${c}"/></g>`; }
function thSVG(e,pal){ const c=dzCol(e.color||'ink',pal), v=TH_MAP[e.v]||e.v||'mono', sub=(e.sub||'');
  const serif="'Cormorant Garamond','Playfair Display',Georgia,serif", script="'Great Vibes','Pinyon Script','Marck Script',cursive";
  const F=`fill="${c}" stroke="none"`, svg=(vb,inner)=>`<svg viewBox="${vb}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="position:absolute;inset:0;overflow:visible">${inner}</svg>`;
  const capt=(x,y,size)=>sub?`<text x="${x}" y="${y}" text-anchor="middle" font-family="${serif}" font-size="${size}" letter-spacing="${size*.32}" ${F}>${esc(sub.toUpperCase().slice(0,26))}</text>`:'';
  if(v==='sig') return svg('0 0 200 120',`<text x="100" y="66" text-anchor="middle" font-family="${script}" font-size="40" ${F}>tadhayrapetian</text><path d="M44 80 C 80 72, 128 72, 160 78" fill="none" stroke="${c}" stroke-width=".9" stroke-linecap="round"/>${capt(100,102,9)}`);
  if(v==='word') return svg('0 0 240 60',`<text x="120" y="31" text-anchor="middle" font-family="${serif}" font-size="21" font-weight="500" letter-spacing="5.2" ${F}>TADHAYRAPETIAN</text><path d="M60 41 L111 41 M129 41 L180 41" stroke="${c}" stroke-width=".6"/><path d="M120 37.5 L123.5 41 L120 44.5 L116.5 41 Z" ${F}/>${capt(120,56,7.5)}`);
  if(v==='monoword') return svg('0 0 100 100',`<g>${thMono(c,16,2,68)}</g><text x="50" y="80" text-anchor="middle" font-family="${serif}" font-size="9.6" font-weight="500" letter-spacing="2.6" ${F}>TADHAYRAPETIAN</text>${capt(50,94,6.2)}`);
  if(v==='crest') return svg('0 0 100 100',`<ellipse cx="50" cy="50" rx="34" ry="46" fill="none" stroke="${c}" stroke-width=".7"/><ellipse cx="50" cy="50" rx="31.5" ry="43.5" fill="none" stroke="${c}" stroke-width=".35"/><g>${thMono(c,21,10,58)}</g><text x="50" y="74" text-anchor="middle" font-family="${serif}" font-size="4.7" letter-spacing="1.1" ${F}>TADHAYRAPETIAN</text>${sub?`<text x="50" y="83" text-anchor="middle" font-family="${serif}" font-size="4.6" font-style="italic" ${F}>${esc(sub.slice(0,22))}</text>`:''}`);
  return svg('0 0 100 100',`<g>${thMono(c,4,0,92)}</g>${capt(50,97,7)}`); }
{ const _el=dzElHTML; dzElHTML=function(e,doc,pal,opt){ if(!e||e.t!=='thlogo') return _el.apply(this,arguments);
    const h=_el.call(this,Object.assign({},e,{t:'icon',icon:'star',fill:'',color:'ink'}),doc,pal,opt); if(!h) return h;
    return h.replace(/<svg[\s\S]*<\/svg>/,thSVG(e,pal)).replace('data-t="icon"','data-t="thlogo"'); }; }
{ const _lb=dzLabel; dzLabel=function(e){ return e&&e.t==='thlogo'?'Знак tadhayrapetian':_lb.apply(this,arguments); }; }
