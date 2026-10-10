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
const TH_FONTS={serif:["'Cormorant Garamond','Playfair Display',Georgia,serif",.5,500],didone:["'Playfair Display','Prata',Georgia,serif",.56,400],script:["'Great Vibes','Marck Script',cursive",.42,400],sans:["'Montserrat','Manrope',Arial,sans-serif",.62,400],hand:["'Caveat','Bad Script',cursive",.42,500],slab:["'Forum','Tenor Sans',Georgia,serif",.55,400]};
function thInits(name){ const w=String(name||'').trim().split(/\s+/).filter(Boolean); if(w.length>1) return (w[0][0]+w[1][0]).toUpperCase(); const t=w[0]||'TH'; return (t.slice(0,2)).toUpperCase(); }
function thMono(c,x,y,s,ini,ff){ /* two-letter monogram; T+H get the merged-stem ligature */
  const k=s/100, F=TH_FONTS[ff]||TH_FONTS.serif, L=(ini||'TH').slice(0,2), lig=L==='TH'&&(!ff||ff==='serif'||ff==='didone'||ff==='slab');
  const xs=L.length<2?[50]:lig?[38,60.5]:[30,70], fs=L.length<2?78:lig?74:62;
  const letters=[...L].map((ch,i)=>`<text x="${xs[i]}" y="74" text-anchor="middle" font-family="${F[0]}" font-size="${fs}" font-weight="${F[2]}" fill="${c}">${esc(ch)}</text>`).join('');
  return `<g transform="translate(${x} ${y}) scale(${k})">${letters}<path d="M24 82.5 L78 82.5" stroke="${c}" stroke-width=".8"/><path d="M51 79.5 L53.5 82.5 L51 85.5 L48.5 82.5 Z" fill="${c}"/></g>`; }
function thFit(txt,size,avail,ls,ratio){ const w=[...txt].length*(size*ratio+ls); return w>avail?size*avail/w:size; }
function thSVG(e,pal){ const c=dzCol(e.color||'ink',pal), v=TH_MAP[e.v]||e.v||'mono', sub=(e.sub||''), name=(e.txt||'tadhayrapetian').trim()||'tadhayrapetian', ini=(e.ini||'').trim()||(e.txt?thInits(name):'TH');
  const ff=e.ff||'', FS=TH_FONTS[ff]||TH_FONTS.serif, serif=TH_FONTS.serif[0], script=(TH_FONTS[ff==='hand'?'hand':'script'])[0];
  const F=`fill="${c}" stroke="none"`, svg=(vb,inner)=>`<svg viewBox="${vb}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="position:absolute;inset:0;overflow:visible">${inner}</svg>`;
  const capt=(x,y,size,avail)=>{ if(!sub) return ''; const t=sub.toUpperCase().slice(0,40), fs=thFit(t,size,avail||180,size*.32,.6); return `<text x="${x}" y="${y}" text-anchor="middle" font-family="${serif}" font-size="${fs.toFixed(2)}" letter-spacing="${(fs*.32).toFixed(2)}" ${F}>${esc(t)}</text>`; };
  const UP=name.toUpperCase();
  if(v==='sig'){ const f=ff&&ff!=='script'&&ff!=='hand'?FS:TH_FONTS[ff==='hand'?'hand':'script'], fs=thFit(name,40,180,0,f[1]); return svg('0 0 200 120',`<text x="100" y="66" text-anchor="middle" font-family="${f[0]}" font-size="${fs.toFixed(2)}" font-weight="${f[2]}" ${F}>${esc(name)}</text><path d="M44 80 C 80 72, 128 72, 160 78" fill="none" stroke="${c}" stroke-width=".9" stroke-linecap="round"/>${capt(100,102,9,170)}`); }
  if(v==='word'){ const fs=thFit(UP,21,226,5.2,FS[1]*1.15), ls=fs*.25; return svg('0 0 240 60',`<text x="120" y="31" text-anchor="middle" font-family="${FS[0]}" font-size="${fs.toFixed(2)}" font-weight="${FS[2]}" letter-spacing="${ls.toFixed(2)}" ${F}>${esc(UP)}</text><path d="M60 41 L111 41 M129 41 L180 41" stroke="${c}" stroke-width=".6"/><path d="M120 37.5 L123.5 41 L120 44.5 L116.5 41 Z" ${F}/>${capt(120,56,7.5,200)}`); }
  if(v==='monoword'){ const fs=thFit(UP,9.6,92,2.6,FS[1]*1.1); return svg('0 0 100 100',`<g>${thMono(c,16,2,68,ini,ff)}</g><text x="50" y="80" text-anchor="middle" font-family="${FS[0]}" font-size="${fs.toFixed(2)}" font-weight="${FS[2]}" letter-spacing="${(fs*.27).toFixed(2)}" ${F}>${esc(UP)}</text>${capt(50,94,6.2,88)}`); }
  if(v==='crest'){ const fs=thFit(UP,4.7,46,1.1,FS[1]*1.3); return svg('0 0 100 100',`<ellipse cx="50" cy="50" rx="34" ry="46" fill="none" stroke="${c}" stroke-width=".7"/><ellipse cx="50" cy="50" rx="31.5" ry="43.5" fill="none" stroke="${c}" stroke-width=".35"/><g>${thMono(c,21,10,58,ini,ff)}</g><text x="50" y="74" text-anchor="middle" font-family="${FS[0]}" font-size="${fs.toFixed(2)}" letter-spacing="${(fs*.24).toFixed(2)}" ${F}>${esc(UP)}</text>${sub?`<text x="50" y="83" text-anchor="middle" font-family="${serif}" font-size="4.6" font-style="italic" ${F}>${esc(sub.slice(0,22))}</text>`:''}`); }
  if(v==='badge'){ const fs=thFit(UP,13,150,3,FS[1]*1.1); return svg('0 0 200 120',`<rect x="6" y="14" width="188" height="92" rx="46" fill="none" stroke="${c}" stroke-width="1.2"/><rect x="11" y="19" width="178" height="82" rx="41" fill="none" stroke="${c}" stroke-width=".5"/><text x="100" y="${sub?62:67}" text-anchor="middle" font-family="${FS[0]}" font-size="${fs.toFixed(2)}" font-weight="${FS[2]}" letter-spacing="${(fs*.22).toFixed(2)}" ${F}>${esc(UP)}</text>${capt(100,82,7,130)}`); }
  if(v==='stack'){ const w=name.split(/\s+/), l1=w.slice(0,Math.ceil(w.length/2)).join(' '), l2=w.slice(Math.ceil(w.length/2)).join(' '); const f1=thFit(l1,34,180,0,TH_FONTS.script[1]), f2=thFit(l2.toUpperCase(),14,170,4,FS[1]*1.1);
    return svg('0 0 200 120',`<text x="100" y="${l2?56:66}" text-anchor="middle" font-family="${script}" font-size="${f1.toFixed(2)}" ${F}>${esc(l1)}</text>${l2?`<text x="100" y="84" text-anchor="middle" font-family="${FS[0]}" font-size="${f2.toFixed(2)}" letter-spacing="${(f2*.3).toFixed(2)}" font-weight="${FS[2]}" ${F}>${esc(l2.toUpperCase())}</text>`:''}${capt(100,106,7,150)}`); }
  return svg('0 0 100 100',`<g>${thMono(c,4,0,92,ini,ff)}</g>${capt(50,97,7,92)}`); }
{ const _el=dzElHTML; dzElHTML=function(e,doc,pal,opt){ if(!e||e.t!=='thlogo') return _el.apply(this,arguments);
    const h=_el.call(this,Object.assign({},e,{t:'icon',icon:'star',fill:'',color:'ink'}),doc,pal,opt); if(!h) return h;
    return h.replace(/<svg[\s\S]*<\/svg>/,thSVG(e,pal)).replace('data-t="icon"','data-t="thlogo"'); }; }
{ const _lb=dzLabel; dzLabel=function(e){ return e&&e.t==='thlogo'?(e.txt?'Логотип «'+e.txt+'»':'Знак tadhayrapetian'):_lb.apply(this,arguments); }; }
KS.thSVG=thSVG;
