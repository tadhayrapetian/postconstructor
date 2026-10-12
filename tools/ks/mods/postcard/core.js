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
/* Browser-independent layout of the mark's spaced captions: every letter gets its own x (SVG x-list; each letter is centred
   on its own slot), so Safari, Chrome, print and the vector PDF place letters identically and the line is exactly centred.
   Advances are measured from the real web font (canvas) once it is loaded; until then they are estimated and the preview
   re-renders when the font arrives. */
const TH_ADV=new Map(), TH_WAIT=new Set(); let thCtx=null, thReT=0;
const thFam=f=>{ const m=String(f).match(/'([^']+)'/); return m?m[1]:String(f).split(',')[0].trim(); };
function thAdv(ch,F){ const spec=`${F[2]||400} 100px "${thFam(F[0])}"`, k=spec+'|'+ch; const hit=TH_ADV.get(k); if(hit!=null) return hit;
  let ok=false; try{ ok=document.fonts&&document.fonts.check(spec,ch); }catch(_){ }
  if(ok){ try{ thCtx=thCtx||document.createElement('canvas').getContext('2d'); thCtx.font=spec; const a=thCtx.measureText(ch).width/100; if(a>0||ch===' '){ TH_ADV.set(k,a); return a; } }catch(_){ } }
  else if(document.fonts&&!TH_WAIT.has(spec)){ TH_WAIT.add(spec); document.fonts.load(spec,'TADHYRPEIN tadhyrpein АБВ').then(()=>{ clearTimeout(thReT); thReT=setTimeout(()=>{ try{ renderAll(); }catch(_){ } try{ KS.emit('thFonts'); }catch(_){ } },60); }).catch(()=>{}); }
  return ch===' '?F[1]*.55:F[1]*(/[A-ZА-ЯԱ-Ֆ]/.test(ch)?1.25:1); }
const thClean=t=>String(t||'').replace(/\s+/g,' ').trim();
function thWidth(t,F,size){ return [...t].reduce((s,ch)=>s+thAdv(ch,F)*size,0); }
function thLine(t,cx,y,size,ls,F,avail,c,extra){ const ch=[...thClean(t)]; if(!ch.length) return '';
  let adv=ch.map(x=>thAdv(x,F)*size), tot=adv.reduce((a,b)=>a+b,0)+ls*(ch.length-1);
  if(avail&&tot>avail){ const k=avail/tot; size*=k; ls*=k; adv=adv.map(a=>a*k); tot=avail; }
  let x=cx-tot/2; const xs=adv.map(a=>{ const m=x+a/2; x+=a+ls; return m.toFixed(2); });
  return `<text x="${xs.join(' ')}" y="${y}" text-anchor="middle" font-family="${F[0]}" font-size="${size.toFixed(2)}" font-weight="${F[2]||400}" fill="${c}" stroke="none"${extra||''}>${ch.map(x=>esc(x)).join('')}</text>`; }
function thFitM(t,F,size,avail){ const w=thWidth(thClean(t),F,size); return w>avail?size*avail/w:size; }
function thSVG(e,pal){ const c=dzCol(e.color||'ink',pal), v=TH_MAP[e.v]||e.v||'mono', sub=thClean(e.sub), name=thClean(e.txt)||'tadhayrapetian', ini=(e.ini||'').trim()||(e.txt?thInits(name):'TH');
  const ff=e.ff||'', FS=TH_FONTS[ff]||TH_FONTS.serif, SER=TH_FONTS.serif, SCR=TH_FONTS[ff==='hand'?'hand':'script'];
  const F=`fill="${c}" stroke="none"`, svg=(vb,inner)=>`<svg viewBox="${vb}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="position:absolute;inset:0;overflow:visible">${inner}</svg>`;
  const capt=(x,y,size,avail)=>sub?thLine(sub.toUpperCase().slice(0,40),x,y,size,size*.32,SER,avail||180,c):'';
  const UP=name.toUpperCase();
  if(v==='sig'){ const f=ff&&ff!=='script'&&ff!=='hand'?FS:SCR, fs=thFitM(name,f,40,180); return svg('0 0 200 120',`<text x="100" y="66" text-anchor="middle" font-family="${f[0]}" font-size="${fs.toFixed(2)}" font-weight="${f[2]}" ${F}>${esc(name)}</text><path d="M44 80 C 80 72, 128 72, 160 78" fill="none" stroke="${c}" stroke-width=".9" stroke-linecap="round"/>${capt(100,102,9,170)}`); }
  if(v==='word') return svg('0 0 240 60',`${thLine(UP,120,31,21,21*.25,FS,226,c)}<path d="M60 41 L111 41 M129 41 L180 41" stroke="${c}" stroke-width=".6"/><path d="M120 37.5 L123.5 41 L120 44.5 L116.5 41 Z" ${F}/>${capt(120,56,7.5,200)}`);
  if(v==='monoword') return svg('0 0 100 100',`<g>${thMono(c,16,2,68,ini,ff)}</g>${thLine(UP,50,80,9.6,9.6*.27,FS,92,c)}${capt(50,94,6.2,88)}`);
  if(v==='crest'){ const s2=sub.slice(0,22), f2=thFitM(s2,SER,4.6,50); return svg('0 0 100 100',`<ellipse cx="50" cy="50" rx="34" ry="46" fill="none" stroke="${c}" stroke-width=".7"/><ellipse cx="50" cy="50" rx="31.5" ry="43.5" fill="none" stroke="${c}" stroke-width=".35"/><g>${thMono(c,21,10,58,ini,ff)}</g>${thLine(UP,50,74,4.7,4.7*.24,FS,46,c)}${sub?`<text x="50" y="83" text-anchor="middle" font-family="${SER[0]}" font-size="${f2.toFixed(2)}" font-style="italic" ${F}>${esc(s2)}</text>`:''}`); }
  if(v==='badge') return svg('0 0 200 120',`<rect x="6" y="14" width="188" height="92" rx="46" fill="none" stroke="${c}" stroke-width="1.2"/><rect x="11" y="19" width="178" height="82" rx="41" fill="none" stroke="${c}" stroke-width=".5"/>${thLine(UP,100,sub?62:67,13,13*.22,FS,150,c)}${capt(100,82,7,130)}`);
  if(v==='stack'){ const w=name.split(' '), l1=w.slice(0,Math.ceil(w.length/2)).join(' '), l2=w.slice(Math.ceil(w.length/2)).join(' '), f1=thFitM(l1,SCR,34,180);
    return svg('0 0 200 120',`<text x="100" y="${l2?56:66}" text-anchor="middle" font-family="${SCR[0]}" font-size="${f1.toFixed(2)}" font-weight="${SCR[2]}" ${F}>${esc(l1)}</text>${l2?thLine(l2.toUpperCase(),100,84,14,14*.3,FS,170,c):''}${capt(100,106,7,150)}`); }
  return svg('0 0 100 100',`<g>${thMono(c,4,0,92,ini,ff)}</g>${capt(50,97,7,92)}`); }
{ const _el=dzElHTML; dzElHTML=function(e,doc,pal,opt){ if(!e||e.t!=='thlogo') return _el.apply(this,arguments);
    const h=_el.call(this,Object.assign({},e,{t:'icon',icon:'star',fill:'',color:'ink'}),doc,pal,opt); if(!h) return h;
    return h.replace(/<svg[\s\S]*<\/svg>/,thSVG(e,pal)).replace('data-t="icon"','data-t="thlogo"'); }; }
{ const _lb=dzLabel; dzLabel=function(e){ return e&&e.t==='thlogo'?(e.txt?'Логотип «'+e.txt+'»':'Знак tadhayrapetian'):_lb.apply(this,arguments); }; }
KS.thSVG=thSVG;
