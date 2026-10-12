/* ===== vpdf — true vector PDF engine =====
   Every page object {pw,ph,name,html,cls} is mounted offscreen in the live document (the browser does the layout with
   the real web fonts), then walked and re-emitted as ONE SVG per page in CSS px (viewBox) that svg2pdf.js turns into
   PDF operators in a jsPDF document with the exact page size. Text becomes glyph outlines taken from the very same
   font files (fontkit reads WOFF2), so no fonts are embedded and the look is exact in every viewer and RIP.
   Raster stays raster only where it is a picture: photos / <img> / CSS url() backgrounds (original data, full
   resolution), soft shadows and the rare effect svg2pdf cannot draw (CSS filters except grayscale, masks). */
KS.mod('vpdf',{title:'Векторный PDF'});
const VP={stats:null,log:[],dbg:false,inEngine:0,mine:new WeakSet()};
const PXMM=96/25.4;
const URLS={jspdf:'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  svg2pdf:['https://cdn.jsdelivr.net/npm/svg2pdf.js@2.8.1/dist/svg2pdf.umd.min.js','https://unpkg.com/svg2pdf.js@2.8.1/dist/svg2pdf.umd.min.js'],
  fontkit:['https://cdn.jsdelivr.net/npm/fontkit@2.0.4/+esm']};
const note=(...a)=>{ VP.log.push(a.join(' ')); if(VP.log.length>400) VP.log.shift(); if(VP.dbg) console.log('[vpdf]',...a); };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

/* ---------- numbers, matrices ---------- */
const fx=(v,p)=>{ const k=p||100; const r=Math.round(v*k)/k; return (r===0?0:r)+''; };
const MI=[1,0,0,1,0,0];
const mmul=(A,B)=>[A[0]*B[0]+A[2]*B[1],A[1]*B[0]+A[3]*B[1],A[0]*B[2]+A[2]*B[3],A[1]*B[2]+A[3]*B[3],A[0]*B[4]+A[2]*B[5]+A[4],A[1]*B[4]+A[3]*B[5]+A[5]];
const mtr=(x,y)=>[1,0,0,1,x,y], msc=(a,b)=>[a,0,0,b==null?a:b,0,0];
const minv=A=>{ const d=A[0]*A[3]-A[1]*A[2]; if(Math.abs(d)<1e-12) return null; return [A[3]/d,-A[1]/d,-A[2]/d,A[0]/d,(A[2]*A[5]-A[3]*A[4])/d,(A[1]*A[4]-A[0]*A[5])/d]; };
const misI=A=>Math.abs(A[0]-1)<1e-9&&Math.abs(A[1])<1e-9&&Math.abs(A[2])<1e-9&&Math.abs(A[3]-1)<1e-9&&Math.abs(A[4])<1e-6&&Math.abs(A[5])<1e-6;
const mstr=A=>`matrix(${A.slice(0,4).map(v=>fx(v,1e6)).join(' ')} ${fx(A[4],1e4)} ${fx(A[5],1e4)})`;
const num=s=>{ const v=parseFloat(s); return isFinite(v)?v:0; };
/* CSS length (computed gradients keep authored units) → px; % against base */
const UNIT={px:1,mm:96/25.4,cm:96/2.54,in:96,pt:96/72,pc:16,q:96/101.6,em:16,rem:16};
const len=(s,base)=>{ s=String(s||'').trim(); const m=s.match(/^(-?[\d.]+(?:e-?\d+)?)([a-z%]*)$/i); if(!m) return num(s); const v=+m[1], u=m[2].toLowerCase(); if(u==='%') return v/100*(base||0); return v*(UNIT[u]||1); };

/* ---------- colours ---------- */
const CCACHE=new Map(); let ccv=null;
function color(s){ if(!s) return null; s=String(s).trim(); if(s==='none') return null; let c=CCACHE.get(s); if(c!==undefined) return c;
  let m=s.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+)(%?))?\s*\)$/i);
  if(m) c={r:+m[1],g:+m[2],b:+m[3],a:m[4]==null?1:(m[5]?+m[4]/100:+m[4])};
  else if(s==='transparent') c={r:0,g:0,b:0,a:0};
  else if((m=s.match(/^#([0-9a-f]{3,8})$/i))){ let h=m[1]; if(h.length<6) h=h.split('').map(x=>x+x).join(''); c={r:parseInt(h.slice(0,2),16),g:parseInt(h.slice(2,4),16),b:parseInt(h.slice(4,6),16),a:h.length>6?parseInt(h.slice(6,8),16)/255:1}; }
  else { try{ if(!ccv){ const cv=document.createElement('canvas'); cv.width=cv.height=1; ccv=cv.getContext('2d',{willReadFrequently:true}); } ccv.clearRect(0,0,1,1); ccv.fillStyle='#000'; ccv.fillStyle=s; ccv.fillRect(0,0,1,1); const d=ccv.getImageData(0,0,1,1).data; c=d[3]?{r:Math.round(d[0]*255/d[3]),g:Math.round(d[1]*255/d[3]),b:Math.round(d[2]*255/d[3]),a:d[3]/255}:{r:0,g:0,b:0,a:0}; }catch(_){ c={r:0,g:0,b:0,a:1}; } }
  CCACHE.set(s,c); return c; }
const gray=c=>{ const y=Math.round(.2126*c.r+.7152*c.g+.0722*c.b); return {r:y,g:y,b:y,a:c.a}; };
const hex2=v=>(v<16?'0':'')+Math.max(0,Math.min(255,Math.round(v))).toString(16);
const cstr=c=>'#'+hex2(c.r)+hex2(c.g)+hex2(c.b);
/* paint attribute pair for a CSS colour string under a context (gray filter, inherited opacity) */
function paint(s,ctx,kind){ let c=typeof s==='object'?s:color(s); if(!c||c.a<=0) return ''; if(ctx&&ctx.gray) c=gray(c); const op=c.a*((ctx&&ctx.op!=null)?ctx.op:1); kind=kind||'fill';
  return ` ${kind}="${cstr(c)}"${op<.999?` ${kind}-opacity="${fx(op,1000)}"`:''}`; }

/* ---------- SVG path utilities (parse → absolute lines/cubics → transform) ---------- */
function pathParse(d){ const out=[]; const t=String(d||'').match(/[a-df-z]|[-+]?(?:\d*\.\d+|\d+\.?)(?:e[-+]?\d+)?/gi)||[]; let i=0, cmd='', x=0,y=0, sx=0,sy=0, lc=null, lq=null;
  const n=()=>+t[i++]; const isN=()=>i<t.length&&!/^[a-z]$/i.test(t[i]);
  while(i<t.length){ if(/^[a-z]$/i.test(t[i])) cmd=t[i++]; else if(!cmd) break; const rel=cmd===cmd.toLowerCase(), C=cmd.toUpperCase();
    if(C==='Z'){ out.push(['Z']); x=sx; y=sy; lc=lq=null; if(!isN()) continue; }
    do{ let a,b,c1,c2,c3,c4;
      switch(C){
        case 'M': a=n(); b=n(); if(rel){ a+=x; b+=y; } out.push(['M',a,b]); x=sx=a; y=sy=b; cmd=rel?'l':'L'; lc=lq=null; break;
        case 'L': a=n(); b=n(); if(rel){ a+=x; b+=y; } out.push(['L',a,b]); x=a; y=b; lc=lq=null; break;
        case 'H': a=n(); if(rel) a+=x; out.push(['L',a,y]); x=a; lc=lq=null; break;
        case 'V': b=n(); if(rel) b+=y; out.push(['L',x,b]); y=b; lc=lq=null; break;
        case 'C': c1=n(); c2=n(); c3=n(); c4=n(); a=n(); b=n(); if(rel){ c1+=x; c2+=y; c3+=x; c4+=y; a+=x; b+=y; } out.push(['C',c1,c2,c3,c4,a,b]); lc=[c3,c4]; lq=null; x=a; y=b; break;
        case 'S': { c3=n(); c4=n(); a=n(); b=n(); if(rel){ c3+=x; c4+=y; a+=x; b+=y; } const p1=lc?[2*x-lc[0],2*y-lc[1]]:[x,y]; out.push(['C',p1[0],p1[1],c3,c4,a,b]); lc=[c3,c4]; lq=null; x=a; y=b; break; }
        case 'Q': { c1=n(); c2=n(); a=n(); b=n(); if(rel){ c1+=x; c2+=y; a+=x; b+=y; } out.push(['C',x+2/3*(c1-x),y+2/3*(c2-y),a+2/3*(c1-a),b+2/3*(c2-b),a,b]); lq=[c1,c2]; lc=null; x=a; y=b; break; }
        case 'T': { a=n(); b=n(); if(rel){ a+=x; b+=y; } const q=lq?[2*x-lq[0],2*y-lq[1]]:[x,y]; out.push(['C',x+2/3*(q[0]-x),y+2/3*(q[1]-y),a+2/3*(q[0]-a),b+2/3*(q[1]-b),a,b]); lq=q; lc=null; x=a; y=b; break; }
        case 'A': { const rx=n(), ry=n(), rot=n(), la=n(), sw=n(); a=n(); b=n(); if(rel){ a+=x; b+=y; } arcCubic(x,y,rx,ry,rot,la,sw,a,b).forEach(s=>out.push(s)); x=a; y=b; lc=lq=null; break; }
        default: i++; }
    } while(isN()&&C!=='Z'); }
  return out; }
function arcCubic(x1,y1,rx,ry,phi,fa,fs,x2,y2){ if(rx===0||ry===0||(x1===x2&&y1===y2)) return [['L',x2,y2]]; rx=Math.abs(rx); ry=Math.abs(ry);
  const p=phi*Math.PI/180, cp=Math.cos(p), sp=Math.sin(p), dx=(x1-x2)/2, dy=(y1-y2)/2, x1p=cp*dx+sp*dy, y1p=-sp*dx+cp*dy;
  let lam=x1p*x1p/(rx*rx)+y1p*y1p/(ry*ry); if(lam>1){ const s=Math.sqrt(lam); rx*=s; ry*=s; }
  let sq=(rx*rx*ry*ry-rx*rx*y1p*y1p-ry*ry*x1p*x1p)/(rx*rx*y1p*y1p+ry*ry*x1p*x1p); sq=sq<0?0:Math.sqrt(sq); if(fa===fs) sq=-sq;
  const cxp=sq*rx*y1p/ry, cyp=-sq*ry*x1p/rx, cx=cp*cxp-sp*cyp+(x1+x2)/2, cy=sp*cxp+cp*cyp+(y1+y2)/2;
  const ang=(ux,uy,vx,vy)=>{ const a=Math.atan2(ux*vy-uy*vx,ux*vx+uy*vy); return a; };
  const t1=ang(1,0,(x1p-cxp)/rx,(y1p-cyp)/ry); let dt=ang((x1p-cxp)/rx,(y1p-cyp)/ry,(-x1p-cxp)/rx,(-y1p-cyp)/ry);
  if(!fs&&dt>0) dt-=2*Math.PI; else if(fs&&dt<0) dt+=2*Math.PI;
  const segs=Math.ceil(Math.abs(dt)/(Math.PI/2)-1e-9)||1, d=dt/segs, k=4/3*Math.tan(d/4), out=[];
  for(let s=0;s<segs;s++){ const a1=t1+s*d, a2=a1+d, c1=Math.cos(a1), s1=Math.sin(a1), c2=Math.cos(a2), s2=Math.sin(a2);
    const P=(px,py)=>[cp*rx*px-sp*ry*py+cx, sp*rx*px+cp*ry*py+cy]; const q1=P(c1-k*s1,s1+k*c1), q2=P(c2+k*s2,s2-k*c2), q3=P(c2,s2);
    out.push(['C',q1[0],q1[1],q2[0],q2[1],q3[0],q3[1]]); }
  return out; }
function pathStr(cmds,M,p){ let o=''; const P=(x,y)=>M?fx(M[0]*x+M[2]*y+M[4],p)+' '+fx(M[1]*x+M[3]*y+M[5],p):fx(x,p)+' '+fx(y,p);
  for(const c of cmds){ if(c[0]==='Z') o+='Z'; else if(c[0]==='C') o+='C'+P(c[1],c[2])+' '+P(c[3],c[4])+' '+P(c[5],c[6]); else o+=c[0]+P(c[1],c[2]); } return o; }
/* rounded rectangle, R=[[rx,ry]×4] tl,tr,br,bl */
const KAP=.5522847498;
function rrect(x,y,w,h,R,p){ if(w<=0||h<=0) return ''; if(!R||R.every(r=>r[0]<=0||r[1]<=0)) return `M${fx(x,p)} ${fx(y,p)}H${fx(x+w,p)}V${fx(y+h,p)}H${fx(x,p)}Z`;
  const [tl,tr,br,bl]=R.map(r=>r[0]>0&&r[1]>0?r:[0,0]); const P=(a,b)=>fx(a,p)+' '+fx(b,p); const k=KAP;
  return `M${P(x+tl[0],y)}H${fx(x+w-tr[0],p)}`+(tr[0]?`C${P(x+w-tr[0]+tr[0]*k,y)} ${P(x+w,y+tr[1]-tr[1]*k)} ${P(x+w,y+tr[1])}`:'')
    +`V${fx(y+h-br[1],p)}`+(br[0]?`C${P(x+w,y+h-br[1]+br[1]*k)} ${P(x+w-br[0]+br[0]*k,y+h)} ${P(x+w-br[0],y+h)}`:'')
    +`H${fx(x+bl[0],p)}`+(bl[0]?`C${P(x+bl[0]-bl[0]*k,y+h)} ${P(x,y+h-bl[1]+bl[1]*k)} ${P(x,y+h-bl[1])}`:'')
    +`V${fx(y+tl[1],p)}`+(tl[0]?`C${P(x,y+tl[1]-tl[1]*k)} ${P(x+tl[0]-tl[0]*k,y)} ${P(x+tl[0],y)}`:'')+'Z'; }

/* ---------- libraries ---------- */
let libP=null, fkP=null;
async function chain(urls,test){ let err; for(const u of urls){ try{ return await loadLib(u,test); }catch(e){ err=e; note('lib failed',u); } } throw err||new Error('lib'); }
function libs(){ return libP||(libP=(async()=>{ await loadLib(URLS.jspdf,()=>window.jspdf&&window.jspdf.jsPDF);
    await chain(URLS.svg2pdf,()=>window.jspdf&&window.jspdf.jsPDF&&window.jspdf.jsPDF.API&&typeof window.jspdf.jsPDF.API.svg==='function'&&window.jspdf.jsPDF.API.svg);
    return window.jspdf.jsPDF; })().catch(e=>{ libP=null; throw e; })); }
function fontkit(){ return fkP||(fkP=(async()=>{ for(const u of URLS.fontkit){ try{ const m=await import(u); const fk=m&&(m.create?m:(m.default&&m.default.create?m.default:null)); if(fk) return fk; }catch(e){ note('fontkit failed',u,e&&e.message); } } setTimeout(()=>{ fkP=null; },0); return null; })()); }

/* ---------- web font registry: @font-face rules of the document (+ cross-origin sheets fetched as text) ---------- */
let FACES=null, FACEKEY='', cssMiss=false;
const CSSTXT=new Map();
function uniRanges(s){ if(!s) return null; const R=[]; String(s).split(',').forEach(p=>{ p=p.trim().replace(/^u\+/i,''); if(!p) return; if(p.includes('?')){ R.push([parseInt(p.replace(/\?/g,'0'),16),parseInt(p.replace(/\?/g,'F'),16)]); return; } const [a,b]=p.split('-'); const A=parseInt(a,16), B=b?parseInt(b,16):A; if(isFinite(A)) R.push([A,isFinite(B)?B:A]); }); return R.length?R:null; }
const famNorm=s=>String(s||'').trim().replace(/^['"]|['"]$/g,'').trim().toLowerCase();
function srcUrl(src,base){ const all=[...String(src||'').matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)\s*(?:format\(\s*['"]?([\w-]+)['"]?\s*\))?/g)]; if(!all.length) return null;
  const pick=all.find(m=>/woff2|woff|truetype|opentype|ttf|otf/i.test(m[3]||'')||!m[3])||all[0]; try{ return new URL(pick[2],base||document.baseURI).href; }catch(_){ return pick[2]; } }
function weightRange(w){ w=String(w||'400').trim(); if(w==='normal') return [400,400]; if(w==='bold') return [700,700]; const p=w.split(/\s+/).map(Number).filter(isFinite); return p.length?[p[0],p[1]||p[0]]:[400,400]; }
function addFace(out,fam,src,weight,style,range,base){ const url=srcUrl(src,base); if(!fam||!url) return; out.push({fam:famNorm(fam),url,w:weightRange(weight),it:/italic|oblique/i.test(style||''),ur:uniRanges(range)}); }
function parseCSS(txt,base,out){ for(const m of String(txt).matchAll(/@font-face\s*\{([^}]*)\}/g)){ const d={}; m[1].split(';').forEach(l=>{ const i=l.indexOf(':'); if(i>0) d[l.slice(0,i).trim().toLowerCase()]=l.slice(i+1).trim(); }); addFace(out,d['font-family'],d.src,d['font-weight'],d['font-style'],d['unicode-range'],base); } }
async function collectRules(rules,base,out){ for(const r of rules){ try{
  if(r.type===5){ const s=r.style; addFace(out,s.getPropertyValue('font-family'),s.getPropertyValue('src'),s.getPropertyValue('font-weight'),s.getPropertyValue('font-style'),s.getPropertyValue('unicode-range'),base); }
  else if(r.type===3&&r.styleSheet){ await sheetFaces(r.styleSheet,out); }
  else if(r.cssRules) await collectRules(r.cssRules,base,out); }catch(_){ } } }
async function sheetFaces(sh,out){ let rules=null; try{ rules=sh.cssRules; }catch(_){ }
  if(rules){ await collectRules(rules,sh.href||document.baseURI,out); return; }
  if(!sh.href) return; let t=CSSTXT.get(sh.href); if(t==null){ try{ const r=await fetch(sh.href); t=r.ok?await r.text():''; }catch(e){ t=''; note('css fetch failed',sh.href); } if(t) CSSTXT.set(sh.href,t); else cssMiss=true; } parseCSS(t,sh.href,out); }
async function faces(){ const sheets=[...document.styleSheets]; const uf=(typeof st!=='undefined'&&st&&Array.isArray(st.fonts))?st.fonts:[]; const key=sheets.length+'|'+uf.map(f=>f&&f.name).join(',');
  if(FACES&&FACEKEY===key) return FACES; const out=[]; cssMiss=false; for(const sh of sheets) await sheetFaces(sh,out);
  uf.forEach(f=>{ if(f&&f.name&&f.data&&!out.some(x=>x.fam===famNorm(f.name))) out.push({fam:famNorm(f.name),url:f.data,w:[1,1000],it:false,ur:null,user:1}); });
  FACES=out; FACEKEY=cssMiss?'':key; BSC.clear(); return out; }
const GENERIC={'monospace':'pt mono','courier new':'pt mono','courier':'pt mono','ui-monospace':'pt mono','sans-serif':'pt sans','arial':'pt sans','helvetica':'pt sans','system-ui':'pt sans','-apple-system':'pt sans','ui-sans-serif':'pt sans','arial narrow':'oswald','serif':'pt serif','georgia':'pt serif','times new roman':'pt serif','times':'pt serif','ui-serif':'pt serif','cursive':'caveat','fantasy':'lobster'};
function famList(ff){ const out=[]; let cur='', q=''; for(const ch of String(ff||'')){ if(q){ if(ch===q) q=''; else cur+=ch; } else if(ch==='"'||ch==="'") q=ch; else if(ch===','){ out.push(cur); cur=''; } else cur+=ch; } out.push(cur); return out.map(famNorm).filter(Boolean); }
const inR=(R,cp)=>{ if(!R) return true; for(const r of R) if(cp>=r[0]&&cp<=r[1]) return true; return false; };
/* CSS Fonts 4 matching: style first, then weight; result = all faces of the family sharing the best descriptors */
function bestSet(list,w,it){ let L=list.filter(f=>f.it===it); if(!L.length) L=list; const has=f=>w>=f.w[0]&&w<=f.w[1]; let pick=L.filter(has);
  if(!pick.length){ const ws=[...new Set(L.map(f=>f.w[0]))].sort((a,b)=>a-b); let t=null;
    if(w>=400&&w<=500){ t=ws.find(v=>v>=w&&v<=500); if(t==null) t=[...ws].reverse().find(v=>v<w); if(t==null) t=ws.find(v=>v>500); }
    else if(w<400){ t=[...ws].reverse().find(v=>v<w); if(t==null) t=ws.find(v=>v>w); }
    else { t=ws.find(v=>v>w); if(t==null) t=[...ws].reverse().find(v=>v<w); }
    pick=L.filter(f=>f.w[0]===t); }
  return pick; }
const BSC=new Map();
function famFaces(F,fam,w,it){ const k=fam+'|'+w+'|'+it; let r=BSC.get(k); if(r) return r; const list=F.filter(f=>f.fam===fam); r=list.length?bestSet(list,w,it):[]; BSC.set(k,r); return r; }
/* face for one code point: walks the family list, then generic substitutes */
function pickFace(F,spec,cp,fonts){ const tryFam=fam=>{ const set=famFaces(F,fam,spec.w,spec.it); for(const f of set){ if(!inR(f.ur,cp)) continue; const ft=fonts&&fonts.get(f.url); if(fonts&&ft===null) continue; if(ft&&!ft.hasGlyphForCodePoint(cp)) continue; return {f,sb:spec.w>=600&&f.w[1]<600,si:spec.it&&!f.it}; } return null; };
  for(const fam of spec.fams){ const r=tryFam(fam); if(r) return r; }
  for(const fam of spec.fams){ const g=GENERIC[fam]; if(g){ const r=tryFam(g); if(r) return r; } }
  for(const g of ['noto sans armenian','pt sans','golos text']){ const r=tryFam(g); if(r) return r; }
  return null; }
const FONTS=new Map(), FONTP=new Map(), FONTFAIL=new Set();
async function loadFont(url){ if(FONTS.has(url)) return FONTS.get(url); if(FONTP.has(url)) return FONTP.get(url);
  const p=(async()=>{ const fk=await fontkit(); if(!fk) return null; try{ const r=await fetch(url); if(!r.ok) throw new Error('HTTP '+r.status); const buf=new Uint8Array(await r.arrayBuffer()); let f=fk.create(buf); if(f&&f.fonts) f=f.fonts[0]; return f||null; }catch(e){ note('font load failed',url.slice(0,90),e&&e.message); return null; } })();
  FONTP.set(url,p); const f=await p; FONTS.set(url,f); if(!f) FONTFAIL.add(url); return f; }
function specOf(cs){ const fs=cs.fontStyle||'normal'; return {fams:famList(cs.fontFamily),w:parseInt(cs.fontWeight)||400,it:/italic|oblique/.test(fs),size:num(cs.fontSize)}; }
/* glyph outline cache: per font object → Map(glyphId → path commands in font units) */
const GC=new WeakMap();
function glyphCmds(font,g){ let m=GC.get(font); if(!m){ m=new Map(); GC.set(font,m); } let c=m.get(g.id); if(c) return c; c=[]; try{ for(const k of g.path.commands){ const a=k.args; switch(k.command){ case 'moveTo': c.push(0,a[0],a[1]); break; case 'lineTo': c.push(1,a[0],a[1]); break; case 'quadraticCurveTo': c.push(2,a[0],a[1],a[2],a[3]); break; case 'bezierCurveTo': c.push(3,a[0],a[1],a[2],a[3],a[4],a[5]); break; case 'closePath': c.push(4); break; } } }catch(_){ c=[]; } m.set(g.id,c); return c; }
/* append glyph outline with matrix M (font units → output) to string parts */
function glyphD(font,g,M,p){ const c=glyphCmds(font,g); let o='', i=0, lx=0, ly=0; const X=(x,y)=>M[0]*x+M[2]*y+M[4], Y=(x,y)=>M[1]*x+M[3]*y+M[5];
  while(i<c.length){ const t=c[i++]; if(t===0){ o+='M'+fx(X(c[i],c[i+1]),p)+' '+fx(Y(c[i],c[i+1]),p); lx=c[i]; ly=c[i+1]; i+=2; }
    else if(t===1){ o+='L'+fx(X(c[i],c[i+1]),p)+' '+fx(Y(c[i],c[i+1]),p); lx=c[i]; ly=c[i+1]; i+=2; }
    else if(t===2){ const qx=c[i],qy=c[i+1],x=c[i+2],y=c[i+3]; const a=lx+2/3*(qx-lx), b=ly+2/3*(qy-ly), cc=x+2/3*(qx-x), d=y+2/3*(qy-y); o+='C'+fx(X(a,b),p)+' '+fx(Y(a,b),p)+' '+fx(X(cc,d),p)+' '+fx(Y(cc,d),p)+' '+fx(X(x,y),p)+' '+fx(Y(x,y),p); lx=x; ly=y; i+=4; }
    else if(t===3){ o+='C'+fx(X(c[i],c[i+1]),p)+' '+fx(Y(c[i],c[i+1]),p)+' '+fx(X(c[i+2],c[i+3]),p)+' '+fx(Y(c[i+2],c[i+3]),p)+' '+fx(X(c[i+4],c[i+5]),p)+' '+fx(Y(c[i+4],c[i+5]),p); lx=c[i+4]; ly=c[i+5]; i+=6; }
    else if(t===4) o+='Z'; }
  return o; }
const FEAT0={frac:false,numr:false,dnom:false,sups:false,subs:false,smcp:false,c2sc:false,zero:false,ordn:false,salt:false,ss01:false,swsh:false,dlig:false,hlig:false};
const FEATLS=Object.assign({},FEAT0,{liga:false,clig:false,calt:false});
const LAYC=new WeakMap();
function layout(font,str,ls){ let m=LAYC.get(font); if(!m){ m=new Map(); LAYC.set(font,m); } const k=(ls?'1':'0')+str; let r=m.get(k); if(r) return r;
  try{ const run=font.layout(str,ls?FEATLS:FEAT0); r={g:run.glyphs,p:run.positions}; }catch(e){ r={g:[],p:[]}; [...str].forEach(ch=>{ try{ const g=font.glyphForCodePoint(ch.codePointAt(0)); r.g.push(g); r.p.push({xAdvance:g.advanceWidth,yAdvance:0,xOffset:0,yOffset:0}); }catch(_){ } }); }
  if(m.size>4000) m.clear(); m.set(k,r); return r; }
const fakeBold=sz=>sz*(sz<=9?1/24:sz>=36?1/32:1/24+(sz-9)/27*(1/32-1/24));
/* metrics used by Chrome for baselines */
function fmet(font){ const os=font['OS/2']||{}; const typo=os.fsSelection&&os.fsSelection.useTypoMetrics; const u=font.unitsPerEm||1000;
  const asc=(typo?os.typoAscender:font.ascent)||font.ascent||u*.8, desc=(typo?os.typoDescender:font.descent)||font.descent||-u*.2;
  let xh=os.xHeight; if(!xh){ try{ const g=font.glyphForCodePoint(120); xh=g&&g.bbox?g.bbox.maxY:u*.5; }catch(_){ xh=u*.5; } }
  return {u,asc,desc,xh,ulp:font.underlinePosition||-u*.1,ult:font.underlineThickness||u*.05,sp:os.yStrikeoutPosition||u*.3,ss:os.yStrikeoutSize||u*.05}; }


/* ---------- built-in vector symbols for characters no web font carries (system-font dingbats) ---------- */
const SYMD=(()=>{ const P=pts=>'M'+pts.map(p=>fx(p[0])+' '+fx(p[1])).join('L')+'Z';
  const star=(cx,cy,R,r,n)=>{ const a=[]; for(let i=0;i<2*n;i++){ const t=Math.PI/2+i*Math.PI/n, q=i%2?r:R; a.push([cx+q*Math.cos(t),cy+q*Math.sin(t)]); } return a; };
  const thick=(pts,t)=>{ const L=[], R=[]; for(let i=0;i<pts.length;i++){ const a=pts[Math.max(0,i-1)], b=pts[i], c=pts[Math.min(pts.length-1,i+1)]; const n1=nrm(a===b?b:a,a===b?c:b), n2=nrm(b===c?a:b,b===c?b:c); let nx=n1[0]+n2[0], ny=n1[1]+n2[1]; const l=Math.hypot(nx,ny)||1; nx/=l; ny/=l; const cosv=nx*n1[0]+ny*n1[1]||1; const m=t/2/Math.max(.3,cosv); L.push([b[0]+nx*m,b[1]+ny*m]); R.push([b[0]-nx*m,b[1]-ny*m]); } return P(L.concat(R.reverse())); };
  function nrm(a,b){ const dx=b[0]-a[0], dy=b[1]-a[1], l=Math.hypot(dx,dy)||1; return [-dy/l,dx/l]; }
  const circ=(cx,cy,r)=>rrect(cx-r,cy-r,2*r,2*r,[[r,r],[r,r],[r,r],[r,r]]);
  const box=(x,y,w,h)=>`M${x} ${y}H${x+w}V${y+h}H${x}Z`;
  const S={};
  S[0x2605]=P(star(500,340,400,155,5)); S[0x2606]=P(star(500,340,400,155,5))+P(star(500,340,300,116,5).reverse());
  S[0x2726]=P(star(500,330,420,110,4)); S[0x2727]=P(star(500,330,420,110,4))+P(star(500,330,320,84,4).reverse());
  S[0x2713]=thick([[110,330],[370,80],[900,640]],105); S[0x2714]=thick([[100,340],[370,60],[910,650]],170);
  const X=t=>thick([[180,20],[820,660]],t)+thick([[180,660],[820,20]],t); S[0x2715]=X(100); S[0x2716]=X(160); S[0x2717]=thick([[200,0],[800,680]],110)+thick([[220,640],[780,40]],110); S[0x2718]=S[0x2716];
  S[0x2702]=circ(250,150,150)+circ(250,150,85)+circ(250,530,150)+circ(250,530,85)+thick([[360,240],[960,560]],80)+thick([[360,440],[960,120]],80);
  S[0x2709]=box(80,60,840,580)+box(140,120,720,460)+thick([[110,610],[500,300],[890,610]],60);
  S[0x2665]='M500 40C360 190 70 320 70 520C70 660 170 750 300 750C390 750 460 700 500 630C540 700 610 750 700 750C830 750 930 660 930 520C930 320 640 190 500 40Z'; S[0x2764]=S[0x2665]; S[0x2661]=S[0x2665];
  S[0x25CF]=circ(500,330,330); S[0x25CB]=circ(500,330,330)+circ(500,330,265); S[0x2B24]=S[0x25CF];
  S[0x25A0]=box(170,0,660,660); S[0x25A1]=box(170,0,660,660)+box(230,60,540,540); S[0x25AA]=box(300,130,400,400); S[0x25FC]=S[0x25A0];
  S[0x25B2]=P([[130,20],[870,20],[500,700]]); S[0x25BC]=P([[130,680],[870,680],[500,0]]); S[0x25BA]=P([[170,0],[170,680],[860,340]]); S[0x25B6]=S[0x25BA]; S[0x25C4]=P([[830,0],[830,680],[140,340]]); S[0x25C0]=S[0x25C4];
  S[0x25C6]=P([[500,-30],[860,330],[500,690],[140,330]]); S[0x2666]=S[0x25C6]; S[0x25C7]=S[0x25C6]+P([[500,50],[220,330],[500,610],[780,330]]);
  const arr=(r)=>{ const a=[[80,300],[640,300],[640,110],[930,340],[640,570],[640,380],[80,380]]; return P(r?a.map(p=>[1000-p[0],p[1]]):a); }; S[0x2192]=arr(0); S[0x2190]=arr(1); S[0x279C]=arr(0); S[0x2794]=arr(0);
  S[0x2610]=box(120,-20,680,680)+box(180,40,560,560); S[0x2611]=S[0x2610]+thick([[260,330],[420,170],[700,520]],80); S[0x2612]=S[0x2610]+thick([[270,80],[650,560]],70)+thick([[270,560],[650,80]],70);
  return S; })();
const SYMC=new Map(); function symCmds(cp){ let c=SYMC.get(cp); if(c) return c; const d=SYMD[cp]; if(!d) return null; c=pathParse(d); SYMC.set(cp,c); return c; }

/* ---------- images: original data, converted only when jsPDF cannot take the format ---------- */
const IMC=new Map();
const blobURL=b=>new Promise((res,rej)=>{ const fr=new FileReader(); fr.onload=()=>res(fr.result); fr.onerror=rej; fr.readAsDataURL(b); });
const loadIm=src=>new Promise((res,rej)=>{ const im=new Image(); im.onload=()=>res(im); im.onerror=()=>rej(new Error('img')); if(!/^data:|^blob:/.test(src)) im.crossOrigin='anonymous'; im.src=src; });
function svgTextOf(url){ const m=url.match(/^data:image\/svg\+xml(;[^,]*)?,(.*)$/s); if(!m) return null; try{ return /;base64/.test(m[1]||'')?decodeURIComponent(escape(atob(m[2]))):decodeURIComponent(m[2]); }catch(_){ try{ return atob(m[2]); }catch(__){ return null; } } }
/* CSS filter functions as pixel operations (works in every browser, Safari has no ctx.filter) */
function filterPixels(d,flt){ const fns=[...String(flt).matchAll(/([a-z-]+)\(([^)]*)\)/g)].map(m=>[m[1],m[2].trim()]); const amt=(v,def)=>{ if(v==='') return def; const n=parseFloat(v); return /%$/.test(v)?n/100:n; };
  const ops=[]; for(const [f,a] of fns){ const v=amt(a,1);
    if(f==='grayscale'){ const s=1-Math.min(1,v); ops.push(m3([.2126+.7874*s,.7152-.7152*s,.0722-.0722*s,.2126-.2126*s,.7152+.2848*s,.0722-.0722*s,.2126-.2126*s,.7152-.7152*s,.0722+.9278*s])); }
    else if(f==='sepia'){ const s=1-Math.min(1,v); ops.push(m3([.393+.607*s,.769-.769*s,.189-.189*s,.349-.349*s,.686+.314*s,.168-.168*s,.272-.272*s,.534-.534*s,.131+.869*s])); }
    else if(f==='saturate'){ const s=v; ops.push(m3([.213+.787*s,.715-.715*s,.072-.072*s,.213-.213*s,.715+.285*s,.072-.072*s,.213-.213*s,.715-.715*s,.072+.928*s])); }
    else if(f==='hue-rotate'){ const a=parseFloat(a)*(/rad/.test(a)?1:/turn/.test(a)?2*Math.PI:Math.PI/180)||0, c=Math.cos(a), s=Math.sin(a); ops.push(m3([.213+c*.787-s*.213,.715-c*.715-s*.715,.072-c*.072+s*.928,.213-c*.213+s*.143,.715+c*.285+s*.140,.072-c*.072-s*.283,.213-c*.213-s*.787,.715-c*.715+s*.715,.072+c*.928+s*.072])); }
    else if(f==='brightness') ops.push(px=>{ px[0]*=v; px[1]*=v; px[2]*=v; });
    else if(f==='contrast') ops.push(px=>{ for(let k=0;k<3;k++) px[k]=(px[k]-127.5)*v+127.5; });
    else if(f==='invert'){ const s=Math.min(1,v); ops.push(px=>{ for(let k=0;k<3;k++) px[k]=px[k]*(1-s)+(255-px[k])*s; }); }
    else if(f==='opacity') ops.push(px=>{ px[3]*=Math.min(1,v); }); }
  function m3(M){ return px=>{ const r=px[0],g=px[1],b=px[2]; px[0]=M[0]*r+M[1]*g+M[2]*b; px[1]=M[3]*r+M[4]*g+M[5]*b; px[2]=M[6]*r+M[7]*g+M[8]*b; }; }
  if(!ops.length) return false; const px=[0,0,0,0]; for(let i=0;i<d.length;i+=4){ px[0]=d[i]; px[1]=d[i+1]; px[2]=d[i+2]; px[3]=d[i+3]; for(const o of ops) o(px); d[i]=px[0]; d[i+1]=px[1]; d[i+2]=px[2]; d[i+3]=px[3]; } return true; }
/* → {url,w,h,svg?:text} or null */
function prepImage(src,flt,gr){ const key=src+'|'+(flt||'')+'|'+(gr?1:0); if(IMC.has(key)) return IMC.get(key);
  const p=(async()=>{ let url=src;
    if(!/^data:/.test(url)){ try{ const r=await fetch(url); const b=await r.blob(); if(/svg/.test(b.type)) return {svg:await b.text()}; url=await blobURL(b); }catch(e){ try{ const im=await loadIm(src); const cv=document.createElement('canvas'); cv.width=im.naturalWidth; cv.height=im.naturalHeight; cv.getContext('2d').drawImage(im,0,0); url=cv.toDataURL('image/png'); }catch(_){ note('image unreadable',String(src).slice(0,80)); return null; } } }
    if(/^data:image\/svg\+xml/i.test(url)){ const t=svgTextOf(url); if(t) return {svg:t}; }
    let im; try{ im=await loadIm(url); }catch(_){ note('image decode failed',url.slice(0,60)); return null; }
    const w=im.naturalWidth, h=im.naturalHeight; if(!w||!h) return null; const jpg=/^data:image\/jpe?g/i.test(url), png=/^data:image\/png/i.test(url);
    const fl=(flt&&flt!=='none')?flt:''; if(!fl&&!gr&&(jpg||png)) return {url,w,h};
    const cv=document.createElement('canvas'); cv.width=w; cv.height=h; const g=cv.getContext('2d'); g.drawImage(im,0,0);
    if(fl||gr){ try{ const id=g.getImageData(0,0,w,h); let ch=false; if(fl) ch=filterPixels(id.data,fl.replace(/drop-shadow\([^)]*\)|blur\([^)]*\)/g,'')); if(gr) ch=filterPixels(id.data,'grayscale(1)')||ch; if(ch) g.putImageData(id,0,0); }catch(e){ note('filter bake failed',e&&e.message); } }
    let alpha=!jpg; if(alpha){ try{ const d=g.getImageData(0,0,w,h).data; alpha=false; for(let i=3;i<d.length;i+=4*Math.max(1,Math.floor(d.length/4/40000))) if(d[i]<250){ alpha=true; break; } }catch(_){ alpha=true; } }
    return {url:alpha?cv.toDataURL('image/png'):cv.toDataURL('image/jpeg',.95),w,h}; })();
  IMC.set(key,p); return p; }

/* ---------- CSS gradients ---------- */
function splitTop(s,sep){ const out=[]; let d=0, cur='', q=''; for(const ch of String(s)){ if(q){ cur+=ch; if(ch===q) q=''; continue; } if(ch==='"'||ch==="'"){ q=ch; cur+=ch; continue; } if(ch==='(') d++; else if(ch===')') d--; if(d===0&&(sep?ch===sep:/\s/.test(ch))){ if(cur.trim()) out.push(cur.trim()); cur=''; continue; } cur+=ch; } if(cur.trim()) out.push(cur.trim()); return out; }
function angleOf(s){ const v=parseFloat(s); if(/turn/.test(s)) return v*360; if(/grad/.test(s)) return v*.9; if(/rad/.test(s)) return v*180/Math.PI; return v; }
/* stops: [{c,pos(px|null)}] → normalised [{c:{r,g,b,a},t}] over length L */
function stopsOf(args,L,rep){ const S=[]; for(const a of args){ const p=splitTop(a); const ci=p.findIndex(x=>!/^[-\d.]/.test(x)); if(ci<0){ continue; } const c=color(p[ci]); const ps=p.filter((x,i)=>i!==ci).map(x=>len(x,L)); if(!ps.length) S.push({c,pos:null}); else ps.forEach(v=>S.push({c,pos:v})); }
  if(!S.length) return []; if(S[0].pos==null) S[0].pos=0; if(S[S.length-1].pos==null) S[S.length-1].pos=rep?S[S.length-1].pos:L;
  for(let i=1;i<S.length;i++) if(S[i].pos!=null&&S[i].pos<S[i-1].pos) S[i].pos=S[i-1].pos;
  for(let i=1;i<S.length;i++) if(S[i].pos==null){ let j=i; while(S[j].pos==null) j++; const a=S[i-1].pos, b=S[j].pos; for(let k=i;k<j;k++) S[k].pos=a+(b-a)*(k-i+1)/(j-i+1); i=j; }
  if(rep){ const a=S[0].pos, b=S[S.length-1].pos, per=b-a; if(per>.01){ const out=[]; let n0=Math.floor((0-a)/per)-1; for(let n=n0;a+n*per<=L+per;n++) S.forEach(s=>out.push({c:s.c,pos:s.pos+n*per})); return clampStops(out,L); } }
  return clampStops(S,L); }
function lerpC(a,b,t){ return {r:a.r+(b.r-a.r)*t,g:a.g+(b.g-a.g)*t,b:a.b+(b.b-a.b)*t,a:a.a+(b.a-a.a)*t}; }
function clampStops(S,L){ if(L<=0) L=1; const T=S.map(s=>({c:s.c,t:s.pos/L})); const at=t=>{ if(t<=T[0].t) return T[0].c; for(let i=1;i<T.length;i++) if(t<=T[i].t){ const a=T[i-1], b=T[i]; return b.t-a.t<1e-9?b.c:lerpC(a.c,b.c,(t-a.t)/(b.t-a.t)); } return T[T.length-1].c; };
  const out=[{c:at(0),t:0}]; T.forEach(s=>{ if(s.t>0&&s.t<1) out.push(s); }); out.push({c:at(1),t:1});
  /* transparent stops: take the neighbour colour (premultiplied look) */
  out.forEach((s,i)=>{ if(s.c&&s.c.a===0){ const n=out[i-1]&&out[i-1].c.a>0?out[i-1]:out[i+1]; if(n&&n.c) s.c={r:n.c.r,g:n.c.g,b:n.c.b,a:0}; } }); return out; }
/* parse one CSS gradient layer for a box {x,y,w,h}; returns {kind,stops,coords} or null */
function gradOf(img,B){ const m=String(img).match(/^(repeating-)?(linear|radial|conic)-gradient\((.*)\)$/s); if(!m) return null; const rep=!!m[1], kind=m[2]; const args=splitTop(m[3],',');
  if(kind==='linear'){ let ang=180, first=args[0]; if(/^-?[\d.]+(deg|rad|turn|grad)$/.test(first)){ ang=angleOf(first); args.shift(); } else if(/^to\s/.test(first)){ args.shift(); const t=first.replace(/^to\s+/,'');
      const sx=/left/.test(t)?-1:/right/.test(t)?1:0, sy=/top/.test(t)?-1:/bottom/.test(t)?1:0; if(sx&&sy){ ang=Math.atan2(sx*B.h,-sy*B.w)*180/Math.PI; } else ang=sx>0?90:sx<0?270:sy<0?0:180; }
    const a=ang*Math.PI/180, sn=Math.sin(a), cs=-Math.cos(a), L=Math.abs(B.w*Math.sin(a))+Math.abs(B.h*Math.cos(a)); const cx=B.x+B.w/2, cy=B.y+B.h/2;
    return {kind,stops:stopsOf(args,L,rep),x1:cx-sn*L/2,y1:cy-cs*L/2,x2:cx+sn*L/2,y2:cy+cs*L/2}; }
  if(kind==='radial'){ let shape='ellipse', size='farthest-corner', px=B.x+B.w/2, py=B.y+B.h/2, rx=null, ry=null; const f=args[0];
    if(!color(splitTop(f)[0])||/\b(circle|ellipse|closest|farthest|at)\b/.test(f)){ if(!/^(rgb|#|hsl|transparent)/.test(f)){ args.shift(); const [pre,at]=f.split(/\bat\b/); const toks=splitTop(pre||'');
      toks.forEach(t=>{ if(t==='circle'||t==='ellipse') shape=t; else if(/closest|farthest/.test(t)) size=t; }); const lens=toks.filter(t=>/^[-\d.]/.test(t)); if(lens.length){ rx=len(lens[0],B.w); ry=lens[1]!=null?len(lens[1],B.h):rx; if(lens.length===1) shape='circle'; }
      if(at){ const pp=splitTop(at.trim()); const kw={left:0,center:.5,right:1,top:0,bottom:1}; let X=pp[0], Y=pp[1]||'center'; if(/top|bottom/.test(X)&&pp.length>1&&/left|right|center/.test(pp[1])){ const t=X; X=Y; Y=t; } if(/^(top|bottom)$/.test(X)&&pp.length===1){ Y=X; X='center'; }
        const pos=(v,L)=>v in kw?kw[v]*L:len(v,L); px=B.x+pos(X,B.w); py=B.y+pos(Y,B.h); } } }
    if(rx==null){ const dx=[px-B.x,B.x+B.w-px], dy=[py-B.y,B.y+B.h-py]; const fx_=size.startsWith('closest')?Math.min:Math.max;
      if(shape==='circle'){ if(/side/.test(size)) rx=ry=fx_(...dx,...dy); else { const ds=[[dx[0],dy[0]],[dx[1],dy[0]],[dx[0],dy[1]],[dx[1],dy[1]]].map(([a,b])=>Math.hypot(a,b)); rx=ry=fx_(...ds); } }
      else { const sx=fx_(...dx), sy=fx_(...dy); if(/side/.test(size)){ rx=sx; ry=sy; } else { rx=sx*Math.SQRT2; ry=sy*Math.SQRT2; } } }
    rx=Math.max(rx,.01); ry=Math.max(ry,.01); return {kind,stops:stopsOf(args,rx,rep),cx:px,cy:py,rx,ry}; }
  return {kind,args,rep}; }

/* ---------- one page ---------- */
let UID=0;
function Page(p,run){ this.p=p; this.run=run; this.n=++UID; this.ids=0; this.defs=[]; this.idmap=new Map(); this.rset=new Map(); this.jobs=[]; this.svgImg=new Map(); this.alphaGrad=new Set(); this.base=new Map(); }
Page.prototype.id=function(k){ return 'q'+this.n+(k||'')+'_'+(++this.ids); };
Page.prototype.mount=async function(){ const p=this.p, host=document.createElement('div'); host.className='printing vpdf-host '+(p.cls||''); host.setAttribute('aria-hidden','true');
  host.style.cssText='position:fixed;left:0;top:0;z-index:-50;opacity:0;pointer-events:none;width:max-content;contain:style';
  host.innerHTML=p.html; document.body.appendChild(host); this.host=host; this.root=host.querySelector('.page')||host.firstElementChild||host; };
Page.prototype.unmount=function(){ if(this.host) this.host.remove(); this.host=null; };
/* pass 1: fonts (browser layout + fontkit files), images, svg pictures, elements that need raster */
Page.prototype.prepare=async function(){ const root=this.root, F=await faces(), need=new Map(), loads=new Map(), run=this.run;
  const addTxt=(el,txt)=>{ if(!/\S/.test(txt)) return; const cs=getComputedStyle(el); const sp=specOf(cs); const fk=cs.fontStyle+' '+cs.fontWeight+' 32px '+cs.fontFamily; loads.set(fk,(loads.get(fk)||'')+txt.slice(0,400));
    let tt=cs.textTransform==='uppercase'?txt.toUpperCase():cs.textTransform==='lowercase'?txt.toLowerCase():txt; if(cs.textTransform==='capitalize') tt+=txt.toUpperCase(); if(/ellipsis/.test(cs.textOverflow)||(el.parentElement&&/ellipsis/.test(getComputedStyle(el.parentElement).textOverflow))) tt+='…'; const key=JSON.stringify([sp.fams,sp.w,sp.it]); let e=need.get(key); if(!e) need.set(key,e={sp,set:new Set()}); for(const ch of tt) e.set.add(ch.codePointAt(0)); };
  const tw=document.createTreeWalker(root,NodeFilter.SHOW_TEXT); let tn; while((tn=tw.nextNode())){ const el=tn.parentElement; if(!el||el.closest('style,script,title,desc,metadata')) continue; addTxt(el,tn.data); }
  /* browser font loading for layout */
  try{ await Promise.all([...loads].map(([f,t])=>document.fonts.load(f,t).catch(()=>{}))); await document.fonts.ready; }catch(_){ }
  /* svg pictures (img / svg <image>) mounted live so their text can be measured and outlined */
  const imgs=[...root.querySelectorAll('img')], simgs=[...root.querySelectorAll('image')];
  await Promise.all(imgs.map(im=>im.complete?0:new Promise(r=>{ im.onload=im.onerror=r; setTimeout(r,4000); })));
  const jobs=[];
  const mountSvg=async(el,src)=>{ const r=await prepImage(src,'',false); if(!r||!r.svg) return r; const box=document.createElement('div'); box.style.cssText='position:absolute;left:0;top:0;width:400px;height:400px;overflow:hidden';
      const doc=new DOMParser().parseFromString(r.svg,'image/svg+xml'); const sv=doc.documentElement; if(!sv||sv.localName!=='svg'||doc.querySelector('parsererror')) return null;
      sv.querySelectorAll('script,foreignObject').forEach(x=>x.remove()); box.appendChild(document.importNode(sv,true)); this.host.appendChild(box); const live=box.firstElementChild; this.svgImg.set(el,live);
      const w2=document.createTreeWalker(live,NodeFilter.SHOW_TEXT); let t2; while((t2=w2.nextNode())){ if(t2.parentElement&&!t2.parentElement.closest('style,title,desc')) addTxt(t2.parentElement,t2.data); } return r; };
  imgs.forEach(im=>{ const src=im.currentSrc||im.getAttribute('src')||''; if(!src) return; const cs=getComputedStyle(im); if(cs.display==='none') return;
    jobs.push((async()=>{ if(/^data:image\/svg|\.svg(\?|#|$)/i.test(src)){ const r=await mountSvg(im,src); if(r&&r.svg) return; }
      const gr=!!this.grayOf(im); const r=await prepImage(src,cs.filter!=='none'?cs.filter:'',gr); im.__vp=r; })()); });
  simgs.forEach(el=>{ const src=el.href&&el.href.baseVal||el.getAttribute('href')||el.getAttribute('xlink:href')||''; if(!src) return;
    jobs.push((async()=>{ if(/^data:image\/svg|\.svg(\?|#|$)/i.test(src)){ const r=await mountSvg(el,src); if(r&&r.svg) return; } el.__vp=await prepImage(src,'',!!this.grayOf(el)); })()); });
  /* css url() backgrounds */
  [root,...root.querySelectorAll('*')].forEach(el=>{ if(el.namespaceURI!=='http://www.w3.org/1999/xhtml') return; const bi=getComputedStyle(el).backgroundImage; if(!bi||bi==='none'||!/url\(/.test(bi)) return;
    for(const m of bi.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/g)){ const u=m[2]; jobs.push((async()=>{ let r=await prepImage(u,'',!!this.grayOf(el)); if(r&&r.svg){ const key={}; const live=await mountSvg(key,u); const sv=this.svgImg.get(key); if(sv){ const vb=sv.viewBox.baseVal; const aw=sv.width.baseVal, ah=sv.height.baseVal; let w=aw&&aw.unitType!==2&&aw.value||(vb&&vb.width)||300, h=ah&&ah.unitType!==2&&ah.value||(vb&&vb.height)||150; r={live:sv,w,h}; } else r=null; } (el.__vpbg=el.__vpbg||{})[u]=r; })()); } });
  const n0=loads.size; await Promise.all(jobs);
  if(loads.size>n0){ try{ await Promise.all([...loads].map(([f,t])=>document.fonts.load(f,t).catch(()=>{}))); }catch(_){ } }
  /* fontkit faces for every code point */
  const urls=new Set(); need.forEach(({sp,set})=>set.forEach(cp=>{ if(cp<=32||cp===160) { const f=pickFace(F,sp,32,null); if(f) urls.add(f.f.url); return; } const f=pickFace(F,sp,cp,null); if(f) urls.add(f.f.url); }));
  await Promise.all([...urls].map(u=>loadFont(u)));
  /* second round: faces that turned out to lack glyphs → next family */
  const more=new Set(); need.forEach(({sp,set})=>set.forEach(cp=>{ const f=pickFace(F,sp,cp,FONTS); if(f&&!FONTS.has(f.f.url)) more.add(f.f.url); })); if(more.size) await Promise.all([...more].map(u=>loadFont(u)));
  this.F=F;
  /* svg gradients whose stops have different opacity: svg2pdf would flatten them → raster those shapes */
  root.querySelectorAll('linearGradient,radialGradient').forEach(g=>{ const ops=[...g.querySelectorAll('stop')].map(s=>num(getComputedStyle(s).stopOpacity)*((color(getComputedStyle(s).stopColor)||{a:1}).a)); if(ops.length>1&&Math.max(...ops)-Math.min(...ops)>.02&&g.id) this.alphaGrad.add(g.id); });
  /* elements that need raster: CSS filters (except grayscale / drop-shadow), masks, svg filter/mask, alpha gradients.
     They are serialised by this engine (text already outlined) and rasterised as standalone SVG after emit — no fonts, no foreignObject. */
  [...root.querySelectorAll('*')].forEach(el=>{ if(el.closest('defs,clipPath,pattern,marker,symbol,mask,filter')&&el.localName!=='svg') return; const cs=getComputedStyle(el); if(cs.display==='none') return; let why='';
    const html=el.namespaceURI===HTMLNS;
    if(cs.filter&&cs.filter!=='none'&&!(html&&el.localName==='img')){ const rest=cs.filter.replace(/grayscale\([^)]*\)|drop-shadow\((?:[^()]|\([^)]*\))*\)/g,'').trim(); if(rest) why='filter'; }
    if(!why&&((cs.maskImage&&cs.maskImage!=='none')||(cs.webkitMaskImage&&cs.webkitMaskImage!=='none'))) why='mask';
    if(!why&&!html&&this.alphaGrad.size){ const u=s=>{ const m=String(s||'').match(/url\(["']?[^#]*#([^"')]+)/); return m&&this.alphaGrad.has(m[1]); }; if(u(cs.fill)||u(cs.stroke)) why='alpha gradient'; }
    if(why){ for(const a of this.rset.keys()) if(a.contains(el)) return; this.rset.set(el,why); } }); };
Page.prototype.grayOf=function(el){ for(let n=el;n&&n!==this.host;n=n.parentElement){ const f=getComputedStyle(n).filter; if(f&&/grayscale\(\s*(1|100%)?\s*\)/.test(f)&&n.localName!=='img') return true; } return false; };
/* raster jobs: inner SVG (this engine's own output, text already outlined) + effect → PNG after emit */
Page.prototype.job=function(o){ const k=this.jobs.length; this.jobs.push(o); return `<!--R${k}-->`; };
Page.prototype.finishJobs=async function(svg){ if(!this.jobs.length) return svg; const out=await Promise.all(this.jobs.map(j=>this.rasterJob(j).catch(e=>{ note('raster job failed',e&&e.message); return ''; })));
  return svg.replace(/<!--R(\d+)-->/g,(m,k)=>out[+k]||''); };
Page.prototype.rasterJob=async function(j){ const B=j.box; if(!(B.w>0&&B.h>0)) return ''; let s=j.dpi/96*(j.scale||1); const mx=4200; if(B.w*s>mx||B.h*s>mx) s=mx/Math.max(B.w,B.h);
  const W=Math.max(1,Math.round(B.w*s)), H=Math.max(1,Math.round(B.h*s));
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="${fx(B.x,1e4)} ${fx(B.y,1e4)} ${fx(B.w,1e4)} ${fx(B.h,1e4)}" preserveAspectRatio="none"><defs>${this.defs.join('')}${j.defs||''}</defs>${j.body}</svg>`;
  const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'})); let im; try{ im=await loadIm(url); }finally{ setTimeout(()=>URL.revokeObjectURL(url),1000); }
  const cv=document.createElement('canvas'); cv.width=W; cv.height=H; const g=cv.getContext('2d'); g.drawImage(im,0,0,W,H); const png=cv.toDataURL('image/png');
  this.run.stats[j.kind==='shadow'?'rasterTex':'rasterEls']++; return `<image x="${fx(B.x,1e4)}" y="${fx(B.y,1e4)}" width="${fx(B.w,1e4)}" height="${fx(B.h,1e4)}" preserveAspectRatio="none" href="${png}" xlink:href="${png}"${j.op<.999?` opacity="${fx(j.op,1000)}"`:''}/>`; };
Page.prototype.jobDefs=function(inner,st){ let out=''; const seen=new Set(); const rev=new Map(); this.idmap.forEach((v,k)=>rev.set(v,k)); const pre='s'+this.n+'_';
  const scan=str=>{ for(const m of str.matchAll(/url\(#([^)"']+)\)/g)){ const id=m[1]; if(seen.has(id)||!id.startsWith(pre)) continue; seen.add(id); const orig=rev.get(id); const el=orig&&this.root.querySelector('#'+CSS.escape(orig)); if(!el) continue; const d=this.svgEl(el,Object.assign({prec:100,gray:false,op:1,M:MI,root:el.ownerSVGElement||this.root},st||{})); out+=d; scan(d); } };
  scan(inner); return out; };
/* soft shadow under vector content: shadow-only SVG filter, rasterised */
Page.prototype.shadowJob=function(inner,shadows,box,ctx,div){ if(!shadows.length) return ''; let body='', defs='', pad=0; shadows.forEach((h,i)=>{ const id='sh'+(++UID); let c=color(h.c)||{r:0,g:0,b:0,a:.5}; if(ctx.gray) c=gray(c); const sd=Math.max(0,h.b/(div||2)); pad=Math.max(pad,sd*3+Math.abs(h.x)+Math.abs(h.y)+2);
    defs+=`<filter id="${id}" filterUnits="userSpaceOnUse" x="-100000" y="-100000" width="200000" height="200000" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="${fx(sd,1000)}"/><feOffset dx="${fx(h.x,1000)}" dy="${fx(h.y,1000)}" result="o"/><feFlood flood-color="${cstr(c)}" flood-opacity="${fx(c.a,1000)}"/><feComposite in2="o" operator="in"/></filter>`;
    body=`<g filter="url(#${id})">${inner}</g>`+body; });
  const B={x:box.x-pad,y:box.y-pad,w:box.w+2*pad,h:box.h+2*pad}; return this.job({kind:'shadow',box:B,body,defs,dpi:150,op:ctx.op,scale:ctx.sc||1}); };
function parseShadows(v){ if(!v||v==='none') return []; return splitTop(v,',').map(sh=>{ const p=splitTop(sh); const ci=p.findIndex(x=>!/^-?[\d.]/.test(x)&&x!=='inset'); const L=p.filter((x,i)=>i!==ci&&x!=='inset').map(x=>len(x)); return {c:ci>=0?p[ci]:'rgba(0,0,0,.5)',x:L[0]||0,y:L[1]||0,b:L[2]||0,s:L[3]||0,inset:/inset/.test(sh)}; }).filter(h=>!h.inset); }

/* ---------- pass 2: walk the DOM and emit SVG (page px) ---------- */
const HTMLNS='http://www.w3.org/1999/xhtml';
Page.prototype.emit=function(){ const root=this.root; this.o=[]; this.origin={x:0,y:0};
  const saved=this.strip(root); const r=root.getBoundingClientRect(); this.origin={x:r.left,y:r.top}; this.restoreAll=[]; if(saved) this.restoreAll.push(saved);
  const W=this.p.pw*PXMM, H=this.p.ph*PXMM;
  try{ this.walk(root,{op:1,gray:false,M:MI,tf:saved}); } finally { this.restoreAll.forEach(s=>s()); }
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${fx(W)}" height="${fx(H)}" viewBox="0 0 ${fx(W,1000)} ${fx(H,1000)}"><defs>${this.defs.join('')}</defs>${this.o.join('')}</svg>`; };
/* remove CSS transforms while measuring a subtree (layout is unaffected); returns restore() with the matrix */
Page.prototype.strip=function(el){ if(!el.style) return null; const cs=getComputedStyle(el); const t=cs.transform, tr=cs.translate, ro=cs.rotate, sc=cs.scale;
  const has=(t&&t!=='none')||(tr&&tr!=='none')||(ro&&ro!=='none')||(sc&&sc!=='none'); if(!has) return null;
  const r0=el.getBoundingClientRect(); const props=['transform','translate','rotate','scale']; const keep=props.map(k=>[k,el.style.getPropertyValue(k),el.style.getPropertyPriority(k)]);
  const org=cs.transformOrigin.split(/\s+/).map(num); props.forEach(k=>el.style.setProperty(k,'none','important')); const restore=()=>keep.forEach(([k,v,pr])=>{ if(v) el.style.setProperty(k,v,pr); else el.style.removeProperty(k); });
  let M=MI; if(tr&&tr!=='none'){ const v=tr.split(/\s+/).map(num); M=mmul(M,mtr(v[0]||0,v[1]||0)); }
  if(ro&&ro!=='none'){ const a=angleOf(ro.split(/\s+/).pop())*Math.PI/180; M=mmul(M,[Math.cos(a),Math.sin(a),-Math.sin(a),Math.cos(a),0,0]); }
  if(sc&&sc!=='none'){ const v=sc.split(/\s+/).map(Number); M=mmul(M,msc(v[0],v[1]==null?v[0]:v[1])); }
  if(t&&t!=='none'){ const v=(t.match(/\(([^)]*)\)/)||[0,''])[1].split(',').map(Number); M=mmul(M,/matrix3d/.test(t)?[v[0],v[1],v[4],v[5],v[12],v[13]]:v); }
  restore.M=M; restore.org=org; restore.r0=r0; return restore; };
Page.prototype.rect=function(el){ const r=el.getBoundingClientRect(); return {x:r.left-this.origin.x,y:r.top-this.origin.y,w:r.width,h:r.height}; };
/* CSS paint order inside one element (simplified stacking: negative z, flow, positioned, positive z) */
function order(el){ const items=[]; let i=0; for(const c of el.childNodes){ if(c.nodeType===3){ items.push({n:c,l:0,z:0,i:i++}); continue; } if(c.nodeType!==1) continue; let l=0, z=0;
  { const cs=getComputedStyle(c); if(cs.display==='none') continue; z=parseInt(cs.zIndex); const pos=cs.position!=='static'; if(pos&&isFinite(z)&&z!==0){ l=z<0?-1:2; } else if(pos||+cs.opacity<1||cs.transform!=='none'){ l=1; z=0; } else z=0; if(!isFinite(z)) z=0; }
  items.push({n:c,l,z,i:i++}); } return items.sort((a,b)=>a.l-b.l||(a.l!==0&&a.l!==1?a.z-b.z:0)||a.i-b.i).map(x=>x.n); }
const radii=(cs,w,h)=>{ const R=['TopLeft','TopRight','BottomRight','BottomLeft'].map(k=>{ const v=cs['border'+k+'Radius'].split(/\s+/); const a=/%$/.test(v[0])?parseFloat(v[0])/100*w:num(v[0]); const b=v[1]!=null?(/%$/.test(v[1])?parseFloat(v[1])/100*h:num(v[1])):(/%$/.test(v[0])?parseFloat(v[0])/100*h:a); return [a,b]; });
  const f=Math.min(1,w/(R[0][0]+R[1][0]||1e9),w/(R[3][0]+R[2][0]||1e9),h/(R[0][1]+R[3][1]||1e9),h/(R[1][1]+R[2][1]||1e9)); return f<1?R.map(r=>[r[0]*f,r[1]*f]):R; };
const shrinkR=(R,l,t,r,b)=>[[R[0][0]-l,R[0][1]-t],[R[1][0]-r,R[1][1]-t],[R[2][0]-r,R[2][1]-b],[R[3][0]-l,R[3][1]-b]].map(v=>[Math.max(0,v[0]),Math.max(0,v[1])]);
Page.prototype.clip=function(d,rule){ const id=this.id('c'); this.defs.push(`<clipPath id="${id}" clipPathUnits="userSpaceOnUse"><path d="${d}"${rule?` clip-rule="${rule}"`:''}/></clipPath>`); return id; };
Page.prototype.walk=function(el,ctx){ const o=this.o; const cs=getComputedStyle(el); if(cs.display==='none') return; const tag=el.localName;
  if(el!==this.root&&el.namespaceURI!==HTMLNS){ if(tag==='svg') return this.svgRoot(el,ctx,cs); return; }
  const op=num(cs.opacity); if(op<=0.001) return;
  if(this.rset.has(el)){ /* effect svg2pdf cannot draw: this element (vector-serialised here) → raster with the CSS effect applied */ this.rset.delete(el); const keep=this.o; this.o=[]; this.walk(el,Object.assign({},ctx,{op:1})); const inner=this.o.join(''); this.o=keep;
    const r=this.rect(el), ext=Math.max(r.w,r.h)*.1+12; const mi=cs.maskImage&&cs.maskImage!=='none'?cs.maskImage:cs.webkitMaskImage; const q=v=>String(v||'').replace(/"/g,"'");
    const sty=`filter:${q(cs.filter)};`+(mi&&mi!=='none'?`mask-image:${q(mi)};-webkit-mask-image:${q(mi)};mask-size:${q(cs.maskSize||cs.webkitMaskSize)};mask-position:${q(cs.maskPosition||cs.webkitMaskPosition)};mask-repeat:${q(cs.maskRepeat||cs.webkitMaskRepeat)};`:'');
    o.push(this.job({kind:'el',box:{x:r.x-ext,y:r.y-ext,w:r.w+2*ext,h:r.h+2*ext},body:`<g style="${KS.esc(sty)}">${inner}</g>`,defs:this.jobDefs(inner),dpi:300,op:ctx.op,scale:Math.sqrt(Math.abs(ctx.M[0]*ctx.M[3]-ctx.M[1]*ctx.M[2]))||1})); note('raster element',tag,cs.filter); return; }
  let tf=el===this.root?ctx.tf:this.strip(el); if(tf&&el!==this.root) this.restoreAll.push(tf);
  const r=this.rect(el); const c2=Object.assign({},ctx,{op:ctx.op*op}); let close='';
  if(tf){ const ox=r.x+tf.org[0], oy=r.y+tf.org[1]; const M=mmul(mmul(mtr(ox,oy),tf.M),mtr(-ox,-oy)); if(!misI(M)){ o.push(`<g transform="${mstr(M)}">`); close='</g>'+close; c2.M=mmul(ctx.M,M); } }
  if(cs.filter&&/grayscale\(\s*(1|100%)?\s*\)/.test(cs.filter)&&tag!=='img') c2.gray=true;
  if(cs.clipPath&&cs.clipPath!=='none'){ const d=this.clipShape(cs.clipPath,r); if(d){ o.push(`<g clip-path="url(#${this.clip(d)})">`); close='</g>'+close; } }
  const mark=o.length; const vis=cs.visibility!=='hidden'&&cs.visibility!=='collapse';
  this.walkBody(el,cs,r,c2,tag,vis);
  const dsh=cs.filter&&/drop-shadow/.test(cs.filter)?[...cs.filter.matchAll(/drop-shadow\(((?:[^()]|\([^)]*\))*)\)/g)].map(m=>parseShadows(m[1])[0]).filter(Boolean):null;
  if(dsh&&dsh.length&&o.length>mark){ const inner=o.splice(mark).join(''); const ext=Math.max(r.w,r.h)*.3+20; o.push(this.shadowJob(inner,dsh,{x:r.x-ext,y:r.y-ext,w:r.w+2*ext,h:r.h+2*ext},Object.assign({},c2,{sc:Math.sqrt(Math.abs(c2.M[0]*c2.M[3]-c2.M[1]*c2.M[2]))||1}),1),inner); }
  o.push(close); };
Page.prototype.walkBody=function(el,cs,r,c2,tag,vis){ const o=this.o;
  if(vis) this.box(el,cs,r,c2);
  if(tag==='img'){ if(vis) this.img(el,cs,r,c2); return; }
  if(tag==='canvas'){ if(vis){ try{ const u=el.toDataURL('image/png'); const cb=this.contentBox(cs,r); o.push(`<image x="${fx(cb.x)}" y="${fx(cb.y)}" width="${fx(cb.w)}" height="${fx(cb.h)}" preserveAspectRatio="none" href="${u}" xlink:href="${u}"${c2.op<.999?` opacity="${fx(c2.op,1000)}"`:''}/>`); }catch(_){ note('canvas tainted'); } } return; }
  if(/^(script|style|template|iframe|object|embed|video|audio|input|textarea|select|noscript)$/.test(tag)) return;
  let cclose=''; if(cs.overflowX!=='visible'||cs.overflowY!=='visible'){ const bl=num(cs.borderLeftWidth), bt=num(cs.borderTopWidth), br=num(cs.borderRightWidth), bb=num(cs.borderBottomWidth); const R=shrinkR(radii(cs,r.w,r.h),bl,bt,br,bb);
    const d=rrect(r.x+bl,r.y+bt,r.w-bl-br,r.h-bt-bb,R); if(d){ o.push(`<g clip-path="url(#${this.clip(d)})">`); cclose='</g>'; } else return; }
  if(cs.backgroundClip==='text'||cs.webkitBackgroundClip==='text') c2.textPaint=this.bgPaint(cs,r,c2);
  for(const n of order(el)){ if(n.nodeType===3) this.text(n,c2); else this.walk(n,c2); }
  o.push(cclose); };
Page.prototype.contentBox=function(cs,r){ const l=num(cs.borderLeftWidth)+num(cs.paddingLeft), t=num(cs.borderTopWidth)+num(cs.paddingTop), rr=num(cs.borderRightWidth)+num(cs.paddingRight), b=num(cs.borderBottomWidth)+num(cs.paddingBottom); return {x:r.x+l,y:r.y+t,w:Math.max(0,r.w-l-rr),h:Math.max(0,r.h-t-b)}; };
Page.prototype.clipShape=function(v,r){ const m=String(v).match(/^(inset|circle|ellipse|polygon|path)\((.*)\)/); if(!m) return ''; const a=m[2]; const L=(s,b)=>len(s,b);
  if(m[1]==='inset'){ const p=a.split(/\s+round\s+/)[0].trim().split(/\s+/); const t=L(p[0],r.h), ri=L(p[1]||p[0],r.w), b=L(p[2]||p[0],r.h), le=L(p[3]||p[1]||p[0],r.w); return rrect(r.x+le,r.y+t,r.w-le-ri,r.h-t-b,null); }
  if(m[1]==='circle'||m[1]==='ellipse'){ const [sz,at]=a.split(/\s*at\s*/); const pp=(at||'50% 50%').trim().split(/\s+/); const kw={left:'0%',center:'50%',right:'100%',top:'0%',bottom:'100%'}; const cx=r.x+L(kw[pp[0]]||pp[0],r.w), cy=r.y+L(kw[pp[1]||'center']||pp[1],r.h);
    const s=(sz||'').trim().split(/\s+/).filter(Boolean); let rx, ry; if(m[1]==='circle'){ rx=ry=s[0]&&/^[\d.]/.test(s[0])?L(s[0],Math.hypot(r.w,r.h)/Math.SQRT2):Math.min(cx-r.x,r.x+r.w-cx,cy-r.y,r.y+r.h-cy); } else { rx=s[0]&&/^[\d.]/.test(s[0])?L(s[0],r.w):Math.min(cx-r.x,r.x+r.w-cx); ry=s[1]&&/^[\d.]/.test(s[1])?L(s[1],r.h):Math.min(cy-r.y,r.y+r.h-cy); }
    return rrect(cx-rx,cy-ry,2*rx,2*ry,[[rx,ry],[rx,ry],[rx,ry],[rx,ry]]); }
  if(m[1]==='polygon'){ const pts=a.replace(/^(nonzero|evenodd)\s*,/,'').split(',').map(s=>s.trim().split(/\s+/)); return 'M'+pts.map(([x,y])=>fx(r.x+L(x,r.w))+' '+fx(r.y+L(y,r.h))).join('L')+'Z'; }
  if(m[1]==='path'){ const d=(a.match(/["'](.*)["']/)||[])[1]; if(d) return pathStr(pathParse(d),mtr(r.x,r.y)); }
  return ''; };
/* background + border + shadow of an HTML box */
Page.prototype.box=function(el,cs,r,ctx){ const o=this.o; if(r.w<=0&&r.h<=0) return; const inline=cs.display==='inline';
  const bw=[num(cs.borderTopWidth),num(cs.borderRightWidth),num(cs.borderBottomWidth),num(cs.borderLeftWidth)];
  const bs=[cs.borderTopStyle,cs.borderRightStyle,cs.borderBottomStyle,cs.borderLeftStyle], bc=[cs.borderTopColor,cs.borderRightColor,cs.borderBottomColor,cs.borderLeftColor].map(color);
  const bgc=color(cs.backgroundColor), bi=cs.backgroundImage&&cs.backgroundImage!=='none'?cs.backgroundImage:'';
  const hasB=bw.some((w,i)=>w>0&&bs[i]!=='none'&&bs[i]!=='hidden'&&bc[i]&&bc[i].a>0); const clipText=cs.backgroundClip==='text'||cs.webkitBackgroundClip==='text';
  const ow=cs.outlineStyle&&cs.outlineStyle!=='none'?num(cs.outlineWidth):0, oc=ow>0?color(cs.outlineColor):null;
  if(ow>0&&oc&&oc.a>0&&!inline){ const off=num(cs.outlineOffset)+ow, R=radii(cs,r.w,r.h).map(q=>q[0]>0?[q[0]+off,q[1]+off]:q); const st=cs.outlineStyle==='auto'?'solid':cs.outlineStyle; this.border({x:r.x-off,y:r.y-off,w:r.w+2*off,h:r.h+2*off},R,[ow,ow,ow,ow],[st,st,st,st],[oc,oc,oc,oc],ctx); }
  if(!hasB&&(!bgc||bgc.a<=0)&&!bi&&cs.boxShadow==='none') return;
  const rects=inline?[...el.getClientRects()].map(q=>({x:q.left-this.origin.x,y:q.top-this.origin.y,w:q.width,h:q.height})):[r];
  for(const R0 of rects){ const R=inline?[[0,0],[0,0],[0,0],[0,0]]:radii(cs,R0.w,R0.h); const outer=rrect(R0.x,R0.y,R0.w,R0.h,R);
    if(cs.boxShadow&&cs.boxShadow!=='none'&&!inline) this.shadow(cs.boxShadow,R0,R,ctx);
    if(!clipText){ const bcl=cs.backgroundClip; let area=outer, ar=R0, aR=R; if(bcl==='padding-box'||bcl==='content-box'){ const p=bcl==='content-box'?[num(cs.paddingTop),num(cs.paddingRight),num(cs.paddingBottom),num(cs.paddingLeft)]:[0,0,0,0];
        ar={x:R0.x+bw[3]+p[3],y:R0.y+bw[0]+p[0],w:R0.w-bw[1]-bw[3]-p[1]-p[3],h:R0.h-bw[0]-bw[2]-p[0]-p[2]}; aR=shrinkR(R,bw[3]+p[3],bw[0]+p[0],bw[1]+p[1],bw[2]+p[2]); area=rrect(ar.x,ar.y,ar.w,ar.h,aR); }
      if(bgc&&bgc.a>0&&area) o.push(`<path d="${area}"${paint(bgc,ctx)}/>`);
      if(bi&&area) this.bgLayers(el,cs,R0,area,bw,ctx); }
    if(hasB){ if(cs.display==='table-cell'&&el.closest('table')&&getComputedStyle(el.closest('table')).borderCollapse==='collapse'){ const h=bw.map(v=>v/2); this.border({x:R0.x-h[3],y:R0.y-h[0],w:R0.w+h[1]+h[3],h:R0.h+h[0]+h[2]},R,bw,bs,bc,ctx); }
      else if(!(el.localName==='table'&&cs.borderCollapse==='collapse')) this.border(R0,R,bw,bs,bc,ctx); } } };
Page.prototype.bgPaint=function(cs,r,ctx){ const bi=cs.backgroundImage; if(!bi||bi==='none'){ const c=color(cs.backgroundColor); return c&&c.a>0?paint(c,ctx):null; }
  const L=splitTop(bi,','); const g=gradOf(L[0],r); if(g&&g.stops&&g.stops.length){ const a=g.stops.reduce((m,s)=>Math.max(m,s.c.a),0)*ctx.op; return ` fill="url(#${this.gradDef(g,ctx)})"`+(a<.999?` fill-opacity="${fx(a,1000)}"`:''); } const c=color(cs.backgroundColor); return c&&c.a>0?paint(c,ctx):null; };
Page.prototype.gradDef=function(g,ctx){ const id=this.id('g'); const st=g.stops.map(s=>{ const c=ctx.gray?gray(s.c):s.c; return `<stop offset="${fx(s.t,10000)}" stop-color="${cstr(c)}"/>`; }).join('');
  if(g.kind==='linear') this.defs.push(`<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${fx(g.x1)}" y1="${fx(g.y1)}" x2="${fx(g.x2)}" y2="${fx(g.y2)}">${st}</linearGradient>`);
  else this.defs.push(`<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${fx(g.cx)}" cy="${fx(g.cy)}" r="${fx(g.rx,1000)}" fx="${fx(g.cx)}" fy="${fx(g.cy)}"${Math.abs(g.ry-g.rx)>.01?` gradientTransform="matrix(1 0 0 ${fx(g.ry/g.rx,1e5)} 0 ${fx(g.cy-g.cy*g.ry/g.rx,1000)})"`:''}>${st}</radialGradient>`);
  return id; };
/* multi-stop / hard-stop linear gradient → exact bands (jsPDF samples a shading at only 21 points): solid or 2-stop strips */
Page.prototype.bands=function(g,B,ctx,fo){ const dx=g.x2-g.x1, dy=g.y2-g.y1, L=Math.hypot(dx,dy)||1, ux=dx/L, uy=dy/L, vx=-uy, vy=ux, BIG=(B.w+B.h)*2+10; const P=t=>[g.x1+ux*t*L,g.y1+uy*t*L];
  const poly=(a,b)=>{ const A=P(a), Bp=P(b); return 'M'+[[A[0]+vx*BIG,A[1]+vy*BIG],[Bp[0]+vx*BIG,Bp[1]+vy*BIG],[Bp[0]-vx*BIG,Bp[1]-vy*BIG],[A[0]-vx*BIG,A[1]-vy*BIG]].map(p=>fx(p[0])+' '+fx(p[1])).join('L')+'Z'; };
  const col=c=>{ const k=ctx.gray?gray(c):c; return cstr(k); }; const S=g.stops; const ext=.4/L; let out=`<path d="${poly(-BIG/L,0+ext)}" fill="${col(S[0].c)}"${fo}/><path d="${poly(1-ext,1+BIG/L)}" fill="${col(S[S.length-1].c)}"${fo}/>`;
  for(let i=0;i+1<S.length;i++){ const a=S[i], b=S[i+1]; if(b.t-a.t<1e-6) continue; const d=poly(a.t-(i?ext:0),b.t+ext);
    if(col(a.c)===col(b.c)) out+=`<path d="${d}" fill="${col(a.c)}"${fo}/>`; else { const id=this.id('g'); const A=P(a.t), Bp=P(b.t); this.defs.push(`<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${fx(A[0],1000)}" y1="${fx(A[1],1000)}" x2="${fx(Bp[0],1000)}" y2="${fx(Bp[1],1000)}"><stop offset="0" stop-color="${col(a.c)}"/><stop offset="1" stop-color="${col(b.c)}"/></linearGradient>`); out+=`<path d="${d}" fill="url(#${id})"${fo}/>`; } }
  return out; };
/* raster gradient (alpha varying / conic): procedural texture as PNG */
const GRC=new Map();
Page.prototype.gradRaster=function(g,B,str,ctx){ const key=str+'|'+fx(B.w)+'|'+fx(B.h)+'|'+(ctx.gray?1:0); const hit=GRC.get(key); if(hit){ this.run.stats.rasterTex++; return hit; } const u=this.gradRaster0(g,B,str,ctx); if(u){ if(GRC.size>200) GRC.clear(); GRC.set(key,u); } return u; };
Page.prototype.gradRaster0=function(g,B,str,ctx){ const s=Math.min(2,900/Math.max(1,B.w,B.h)); const cv=document.createElement('canvas'); cv.width=Math.max(1,Math.ceil(B.w*s)); cv.height=Math.max(1,Math.ceil(B.h*s)); const x=cv.getContext('2d'); x.scale(s,s); x.translate(-B.x,-B.y);
  const cs=c=>{ const k=ctx.gray?gray(c):c; return `rgba(${Math.round(k.r)},${Math.round(k.g)},${Math.round(k.b)},${k.a})`; }; let G=null;
  if(g.kind==='linear'){ G=x.createLinearGradient(g.x1,g.y1,g.x2,g.y2); g.stops.forEach(t=>G.addColorStop(Math.max(0,Math.min(1,t.t)),cs(t.c))); x.fillStyle=G; x.fillRect(B.x,B.y,B.w,B.h); }
  else if(g.kind==='radial'){ x.save(); x.translate(g.cx,g.cy); x.scale(1,g.ry/g.rx); G=x.createRadialGradient(0,0,0,0,0,g.rx); g.stops.forEach(t=>G.addColorStop(Math.max(0,Math.min(1,t.t)),cs(t.c))); x.fillStyle=G; x.fillRect(-1e4,-1e4,2e4,2e4); x.restore(); }
  else { try{ const m=String(str).match(/conic-gradient\((.*)\)$/s); const args=splitTop(m[1],','); let from=0, cx=B.x+B.w/2, cy=B.y+B.h/2; if(/^from|^at/.test(args[0])){ const a0=args.shift(); const f=a0.match(/from\s+(\S+)/); if(f) from=angleOf(f[1]); }
      G=x.createConicGradient((from-90)*Math.PI/180,cx,cy); stopsOf(args.map(a=>a.replace(/(-?[\d.]+)deg/g,(q,v)=>(+v/3.6)+'%')),100,false).forEach(t=>G.addColorStop(Math.max(0,Math.min(1,t.t)),cs(t.c))); x.fillStyle=G; x.fillRect(B.x,B.y,B.w,B.h); }catch(_){ return null; } }
  this.run.stats.rasterTex++; return cv.toDataURL('image/png'); };
Page.prototype.bgLayers=function(el,cs,R0,area,bw,ctx){ const o=this.o; const layers=splitTop(cs.backgroundImage,',').reverse(); const sizes=splitTop(cs.backgroundSize,','), pxs=splitTop(cs.backgroundPositionX,','), pys=splitTop(cs.backgroundPositionY,','), reps=splitTop(cs.backgroundRepeat,','), orgs=splitTop(cs.backgroundOrigin,',');
  const n=layers.length; let cid=null; const clipOpen=()=>{ if(!cid) cid=this.clip(area); return `<g clip-path="url(#${cid})">`; };
  layers.forEach((L,ri)=>{ const i=n-1-ri, pick=(a)=>a[i%a.length]||a[0]||'';
    const org=pick(orgs)||'padding-box'; const pb={x:R0.x+bw[3],y:R0.y+bw[0],w:R0.w-bw[1]-bw[3],h:R0.h-bw[0]-bw[2]}; const ob=org==='border-box'?R0:org==='content-box'?this.contentBox(cs,R0):pb;
    if(/gradient\(/.test(L)){ const sz=pick(sizes); const tile=(sz==='auto'||sz==='auto auto'||!sz)?ob:this.bgSize(sz,ob,ob.w,ob.h); const B={x:ob.x,y:ob.y,w:tile.w,h:tile.h};
      if(B.w<.01||B.h<.01) return; const px=this.bgPos(pick(pxs),ob.w,B.w), py=this.bgPos(pick(pys),ob.h,B.h); B.x=ob.x+px; B.y=ob.y+py; const rep=pick(reps)||'repeat';
      const g=gradOf(L,B); if(!g) return; const varA=g.stops&&g.stops.some(s=>Math.abs(s.c.a-g.stops[0].c.a)>.02); const tiles=this.tiles(B,R0,rep);
      tiles.forEach(T=>{ const BB={x:T.x,y:T.y,w:B.w,h:B.h}; const gg=gradOf(L,BB);
        if(g.kind==='conic'||varA){ const u=this.gradRaster(gg,BB,L,ctx); if(u) o.push(clipOpen()+`<image x="${fx(BB.x)}" y="${fx(BB.y)}" width="${fx(BB.w)}" height="${fx(BB.h)}" preserveAspectRatio="none" href="${u}" xlink:href="${u}"${ctx.op<.999?` opacity="${fx(ctx.op,1000)}"`:''}/></g>`); return; }
        const a0=gg.stops[0].c.a; const op=a0*ctx.op; const fo=op<.999?` fill-opacity="${fx(op,1000)}"`:'';
        if(gg.kind==='linear'&&gg.stops.length>2){ o.push(clipOpen()+`<g clip-path="url(#${this.clip(rrect(BB.x,BB.y,BB.w,BB.h,null))})">`+this.bands(gg,BB,ctx,fo)+'</g></g>'); return; }
        const id=this.gradDef(gg,Object.assign({},ctx));
        o.push(clipOpen()+`<rect x="${fx(BB.x)}" y="${fx(BB.y)}" width="${fx(BB.w)}" height="${fx(BB.h)}" fill="url(#${id})"${fo}/></g>`); }); return; }
    const um=L.match(/url\(\s*(['"]?)(.*?)\1\s*\)/); if(!um) return; const im=el.__vpbg&&el.__vpbg[um[2]]; if(!im||(!im.url&&!im.live)) return;
    if(im.live){ const sz=pick(sizes); const t=this.bgSize(sz,ob,im.w,im.h); const px=this.bgPos(pick(pxs),ob.w,t.w), py=this.bgPos(pick(pys),ob.h,t.h); const B={x:ob.x+px,y:ob.y+py,w:t.w,h:t.h};
      const tiles=this.tiles(B,R0,pick(reps)||'repeat'); if(!tiles.length) return; const keep=this.o; this.o=[]; this.svgViewport(im.live,{x:0,y:0,w:B.w,h:B.h},ctx,true); const cell=this.o.join(''); this.o=keep;
      if(tiles.length>600){ note('svg bg tiles capped',tiles.length); tiles.length=600; }
      o.push(clipOpen()+tiles.map(T=>`<g transform="translate(${fx(T.x,1000)} ${fx(T.y,1000)})">${cell}</g>`).join('')+'</g>'); this.run.stats.svgBg=(this.run.stats.svgBg||0)+tiles.length; return; }
    const sz=pick(sizes); const t=this.bgSize(sz,ob,im.w,im.h); const px=this.bgPos(pick(pxs),ob.w,t.w), py=this.bgPos(pick(pys),ob.h,t.h); const B={x:ob.x+px,y:ob.y+py,w:t.w,h:t.h};
    const tiles=this.tiles(B,R0,pick(reps)||'repeat'); if(tiles.length>300){ note('bg tiles capped'); tiles.length=300; }
    o.push(clipOpen()+tiles.map(T=>`<image x="${fx(T.x)}" y="${fx(T.y)}" width="${fx(B.w)}" height="${fx(B.h)}" preserveAspectRatio="none" href="${im.url}" xlink:href="${im.url}"${ctx.op<.999?` opacity="${fx(ctx.op,1000)}"`:''}/>`).join('')+'</g>'); this.run.stats.images++; }); };
Page.prototype.bgSize=function(sz,ob,iw,ih){ sz=String(sz||'auto').trim(); if(sz==='cover'||sz==='contain'){ const k=(sz==='cover'?Math.max:Math.min)(ob.w/iw,ob.h/ih); return {w:iw*k,h:ih*k}; }
  const p=sz.split(/\s+/); const L=(s,len)=>/%$/.test(s)?parseFloat(s)/100*len:num(s); let w=p[0]==='auto'?null:L(p[0],ob.w), h=(p[1]||'auto')==='auto'?null:L(p[1],ob.h);
  if(w==null&&h==null){ w=iw; h=ih; } else if(w==null) w=h*iw/ih; else if(h==null) h=w*ih/iw; return {w,h}; };
Page.prototype.bgPos=function(v,box,t){ v=String(v||'0%').trim(); const kw={left:'0%',top:'0%',center:'50%',right:'100%',bottom:'100%'}; v=kw[v]||v; const m=v.match(/^(left|right|top|bottom)\s+(.*)$/); if(m){ const off=/%$/.test(m[2])?parseFloat(m[2])/100*(box-t):num(m[2]); return /right|bottom/.test(m[1])?box-t-off:off; }
  if(/calc/.test(v)) return (box-t)/2; return /%$/.test(v)?parseFloat(v)/100*(box-t):num(v); };
Page.prototype.tiles=function(B,R0,rep){ const p=String(rep).split(/\s+/); const rx=p[0], ry=p[1]||(p[0]==='repeat-x'?'no-repeat':p[0]==='repeat-y'?'repeat':p[0]); const X=rx==='repeat-y'?'no-repeat':rx, Y=p[0]==='repeat-x'?'no-repeat':ry;
  const xs=[B.x], ys=[B.y]; if(/repeat|round|space/.test(X)&&X!=='no-repeat'&&B.w>.5){ let x=B.x; while(x>R0.x) { x-=B.w; xs.unshift(x); } x=B.x+B.w; while(x<R0.x+R0.w){ xs.push(x); x+=B.w; } }
  if(/repeat|round|space/.test(Y)&&Y!=='no-repeat'&&B.h>.5){ let y=B.y; while(y>R0.y){ y-=B.h; ys.unshift(y); } y=B.y+B.h; while(y<R0.y+R0.h){ ys.push(y); y+=B.h; } }
  const out=[]; ys.forEach(y=>xs.forEach(x=>{ if(x+B.w>R0.x&&x<R0.x+R0.w&&y+B.h>R0.y&&y<R0.y+R0.h) out.push({x,y}); })); return out; };
Page.prototype.border=function(r,R,bw,bs,bc,ctx){ const o=this.o; const vis=i=>bw[i]>0&&bs[i]!=='none'&&bs[i]!=='hidden'&&bc[i]&&bc[i].a>0;
  const same=[1,2,3].every(i=>Math.abs(bw[i]-bw[0])<.01&&bs[i]===bs[0]&&bc[i]&&bc[0]&&cstr(bc[i])===cstr(bc[0])&&Math.abs(bc[i].a-bc[0].a)<.01)&&vis(0);
  const ring=(i0,k0,k1)=>{ const a=[bw[0]*k0,bw[1]*k0,bw[2]*k0,bw[3]*k0], b=[bw[0]*k1,bw[1]*k1,bw[2]*k1,bw[3]*k1];
    const out=rrect(r.x+a[3],r.y+a[0],r.w-a[1]-a[3],r.h-a[0]-a[2],shrinkR(R,a[3],a[0],a[1],a[2])), inn=rrect(r.x+b[3],r.y+b[0],r.w-b[1]-b[3],r.h-b[0]-b[2],shrinkR(R,b[3],b[0],b[1],b[2])); return out+inn; };
  const dashOf=(st,w)=>st==='dashed'?` stroke-dasharray="${fx(w*2.2)} ${fx(w*1.2)}"`:st==='dotted'?` stroke-dasharray="0 ${fx(w*2)}" stroke-linecap="round"`:'';
  if(same){ const st=bs[0], w=bw[0];
    if(st==='dashed'||st==='dotted'){ o.push(`<path d="${rrect(r.x+w/2,r.y+w/2,r.w-w,r.h-w,shrinkR(R,w/2,w/2,w/2,w/2))}" fill="none"${paint(bc[0],ctx,'stroke')} stroke-width="${fx(w,1000)}"${dashOf(st,w)}/>`); return; }
    if(st==='double'&&w>=3){ o.push(`<path d="${ring(0,0,1/3)}" fill-rule="evenodd"${paint(bc[0],ctx)}/><path d="${ring(0,2/3,1)}" fill-rule="evenodd"${paint(bc[0],ctx)}/>`); return; }
    o.push(`<path d="${ring(0,0,1)}" fill-rule="evenodd"${paint(bc[0],ctx)}/>`); return; }
  const cx=r.x+r.w/2, cy=r.y+r.h/2; const full=ring(0,0,1);
  /* wedge through the corner points (outer corner → inner corner direction) */
  const ic=[[r.x+bw[3],r.y+bw[0]],[r.x+r.w-bw[1],r.y+bw[0]],[r.x+r.w-bw[1],r.y+r.h-bw[2]],[r.x+bw[3],r.y+r.h-bw[2]]], oc=[[r.x,r.y],[r.x+r.w,r.y],[r.x+r.w,r.y+r.h],[r.x,r.y+r.h]];
  /* corner split lines (outer corner → inner corner) continued to half the smaller box side: the four wedges tile the box */
  const half=Math.min(r.w,r.h)/2; const Q=oc.map((p,c)=>{ let dx=ic[c][0]-p[0], dy=ic[c][1]-p[1]; if(Math.abs(dx)<1e-9&&Math.abs(dy)<1e-9){ dx=cx-p[0]; dy=cy-p[1]; } const m=Math.max(Math.abs(dx),Math.abs(dy))||1; const t=half/m; return [p[0]+dx*t,p[1]+dy*t]; });
  for(let i=0;i<4;i++){ if(!vis(i)) continue; const a=i, b=(i+1)%4; const W=[oc[a],oc[b],Q[b],Q[a]]; const d='M'+W.map(p=>fx(p[0])+' '+fx(p[1])).join('L')+'Z';
    const id=this.clip(d); if(bs[i]==='dashed'||bs[i]==='dotted'){ const w=bw[i]; o.push(`<g clip-path="url(#${id})"><path d="${rrect(r.x+bw[3]/2,r.y+bw[0]/2,r.w-bw[1]/2-bw[3]/2,r.h-bw[0]/2-bw[2]/2,shrinkR(R,bw[3]/2,bw[0]/2,bw[1]/2,bw[2]/2))}" fill="none"${paint(bc[i],ctx,'stroke')} stroke-width="${fx(w,1000)}"${dashOf(bs[i],w)}/></g>`); }
    else o.push(`<g clip-path="url(#${id})"><path d="${full}" fill-rule="evenodd"${paint(bc[i],ctx)}/></g>`); } };
/* soft box-shadow as a small raster underlay (blurred by nature) */
Page.prototype.shadow=function(v,r,R,ctx){ const list=splitTop(v,','); for(const sh of list.reverse()){ if(/inset/.test(sh)) continue; const p=splitTop(sh); const ci=p.findIndex(x=>!/^-?[\d.]/.test(x)); const c=color(ci>=0?p[ci]:'rgba(0,0,0,.5)'); const L=p.filter((x,i)=>i!==ci).map(num); const [ox,oy,bl,sp]=[L[0]||0,L[1]||0,L[2]||0,L[3]||0];
    if(!c||c.a<=0) continue; const pad=bl+Math.abs(sp)+2; const B={x:r.x+ox-sp-pad,y:r.y+oy-sp-pad,w:r.w+2*sp+2*pad,h:r.h+2*sp+2*pad}; const s=Math.min(1.6,900/Math.max(B.w,B.h)); const cv=document.createElement('canvas'); cv.width=Math.max(1,Math.ceil(B.w*s)); cv.height=Math.max(1,Math.ceil(B.h*s)); const g=cv.getContext('2d');
    const k=ctx.gray?gray(c):c; const far=1e4; g.shadowColor=`rgba(${k.r},${k.g},${k.b},${k.a})`; g.shadowBlur=bl*s; g.shadowOffsetX=far*s; g.shadowOffsetY=0; g.fillStyle='#000'; g.setTransform(s,0,0,s,0,0);
    const path=new Path2D(rrect(r.x+ox-sp-B.x-far,r.y+oy-sp-B.y,r.w+2*sp,r.h+2*sp,R.map(q=>[q[0]+sp,q[1]+sp]))); g.fill(path); g.shadowColor='transparent'; g.globalCompositeOperation='destination-out'; g.fill(new Path2D(rrect(r.x-B.x,r.y-B.y,r.w,r.h,R)));
    const u=cv.toDataURL('image/png'); this.run.stats.rasterTex++; this.o.push(`<image x="${fx(B.x)}" y="${fx(B.y)}" width="${fx(B.w)}" height="${fx(B.h)}" preserveAspectRatio="none" href="${u}" xlink:href="${u}"${ctx.op<.999?` opacity="${fx(ctx.op,1000)}"`:''}/>`); } };
/* <img> → <image> with object-fit / object-position, clipped to the content box (svg pictures stay vector) */
Page.prototype.img=function(el,cs,r,ctx){ const cb=this.contentBox(cs,r); if(cb.w<=0||cb.h<=0) return; const live=this.svgImg.get(el); const d=el.__vp;
  let iw=el.naturalWidth||(d&&d.w)||cb.w, ih=el.naturalHeight||(d&&d.h)||cb.h; if(live){ const vb=live.viewBox&&live.viewBox.baseVal; const aw=live.width&&live.width.baseVal, ah=live.height&&live.height.baseVal; if(vb&&vb.width){ iw=vb.width; ih=vb.height; } if(aw&&aw.unitType!==2&&aw.value) iw=aw.value; if(ah&&ah.unitType!==2&&ah.value) ih=ah.value; }
  const fit=cs.objectFit||'fill'; let w=cb.w, h=cb.h; if(fit==='contain'||fit==='cover'||fit==='scale-down'||fit==='none'){ let k=fit==='none'?1:(fit==='cover'?Math.max:Math.min)(cb.w/iw,cb.h/ih); if(fit==='scale-down') k=Math.min(1,k); w=iw*k; h=ih*k; }
  const op=(cs.objectPosition||'50% 50%').split(/\s+/); const x=cb.x+this.bgPos(op[0],cb.w,w), y=cb.y+this.bgPos(op[1]||'50%',cb.h,h);
  const R=shrinkR(radii(cs,r.w,r.h),num(cs.borderLeftWidth)+num(cs.paddingLeft),num(cs.borderTopWidth)+num(cs.paddingTop),num(cs.borderRightWidth)+num(cs.paddingRight),num(cs.borderBottomWidth)+num(cs.paddingBottom));
  const needClip=x<cb.x-.01||y<cb.y-.01||x+w>cb.x+cb.w+.01||y+h>cb.y+cb.h+.01||R.some(q=>q[0]>0); let pre='', post='';
  if(needClip){ pre=`<g clip-path="url(#${this.clip(rrect(cb.x,cb.y,cb.w,cb.h,R))})">`; post='</g>'; }
  if(live){ this.o.push(pre); this.svgViewport(live,{x,y,w,h},ctx,true); this.o.push(post); return; }
  if(!d||!d.url){ note('img skipped',(el.currentSrc||'').slice(0,60)); return; }
  this.o.push(pre+`<image x="${fx(x)}" y="${fx(y)}" width="${fx(w)}" height="${fx(h)}" preserveAspectRatio="none" href="${d.url}" xlink:href="${d.url}"${ctx.op<.999?` opacity="${fx(ctx.op,1000)}"`:''}/>`+post); this.run.stats.images++; };

/* ---------- HTML text → glyph outlines ---------- */
Page.prototype.baseOff=function(cs){ const key=cs.fontStyle+'|'+cs.fontWeight+'|'+cs.fontSize+'|'+cs.fontFamily+'|'+cs.fontStretch+'|'+cs.lineHeight; let v=this.run.base.get(key); if(v!=null) return v;
  const p=document.createElement('div'); p.style.cssText='position:absolute;left:0;top:0;white-space:nowrap;visibility:hidden'; p.style.lineHeight=cs.lineHeight; const s=document.createElement('span'); s.style.font=`${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`; s.style.fontStretch=cs.fontStretch;
  s.textContent='H'; const ib=document.createElement('span'); ib.style.cssText='display:inline-block;width:0;height:0;vertical-align:baseline'; s.appendChild(ib); p.appendChild(s); this.host.appendChild(p);
  const rg=document.createRange(); rg.setStart(s.firstChild,0); rg.setEnd(s.firstChild,1); const tr=rg.getBoundingClientRect(), br=ib.getBoundingClientRect(); v=br.bottom-tr.top; p.remove(); this.run.base.set(key,v); return v; };
const WS=/[\s\u00a0\u200b\u2028\u2029]/;
Page.prototype.text=function(node,ctx){ const s=node.data; if(!s||!/\S/.test(s)) return; const el=node.parentElement; if(!el) return; const cs=getComputedStyle(el); if(cs.visibility==='hidden'||cs.visibility==='collapse') return;
  let fill=color(cs.webkitTextFillColor||cs.color), tp=null; if((!fill||fill.a===0)&&ctx.textPaint) tp=ctx.textPaint; const stw=num(cs.webkitTextStrokeWidth), stc=stw>0?color(cs.webkitTextStrokeColor):null;
  if((!fill||fill.a===0)&&!tp&&!(stc&&stc.a>0)) return;
  const sp=specOf(cs), size=sp.size; if(size<=0) return; const ls=cs.letterSpacing==='normal'?0:num(cs.letterSpacing); const tt=cs.textTransform; const base=this.baseOff(cs);
  /* words: runs of non-space characters on one line; the browser gives each word's start, the font gives the rest */
  const rg=document.createRange(); const box=i=>{ rg.setStart(node,i); rg.setEnd(node,i+(s.codePointAt(i)>0xffff?2:1)); const L=rg.getClientRects(); for(const q of L) if(q.width>0||q.height>0) return q; return L[0]||null; };
  /* every character's pen position comes from the browser layout (identical to the screen on every platform), glyphs from the font file */
  const words=[]; let i=0; const N=s.length;
  while(i<N){ while(i<N&&WS.test(s[i])) i++; if(i>=N) break; let j=i; const q0=box(i); if(!q0){ i++; continue; } let w={a:i,b:i,x:q0.left,top:q0.top,h:q0.height,right:q0.right,xs:[q0.left]};
    j+=s.codePointAt(j)>0xffff?2:1; if(j-i===2) w.xs.push(q0.left);
    while(j<N&&!WS.test(s[j])){ const step=s.codePointAt(j)>0xffff?2:1; const q=box(j);
      if(q&&(Math.abs(q.top-w.top)>w.h*.5||q.left<w.right-w.h)){ w.b=j; words.push(w); w={a:j,b:j,x:q.left,top:q.top,h:q.height,right:q.right,xs:[]}; }
      const xl=q?q.left:w.right; w.xs.push(xl); if(step===2) w.xs.push(xl); if(q) w.right=q.right; j+=step; }
    w.b=j; words.push(w); i=j; }
  if(!words.length) return;
  let ell=null; for(let n=el;n&&n!==this.root.parentNode;n=n.parentElement){ const c=getComputedStyle(n); if(c.display!=='inline'){ if(/ellipsis/.test(c.textOverflow)&&c.overflowX!=='visible'&&n.scrollWidth>n.clientWidth+1){ const rr=n.getBoundingClientRect(); ell={limit:rr.right-num(c.borderRightWidth)-num(c.paddingRight)-this.origin.x}; } break; } }
  const capOf=k=>{ const prev=k>0?s[k-1]:' '; return k===0||WS.test(prev)||/[(\["'«„-]/.test(prev); };
  let d='', bd='', bw=0; const fb=[], under=[]; const deco=this.decoOf(el); let lastTop=null;
  for(const w of words){ let str=s.slice(w.a,w.b); if(tt==='uppercase') str=str.toUpperCase(); else if(tt==='lowercase') str=str.toLowerCase(); else if(tt==='capitalize'&&capOf(w.a)) str=str.charAt(0).toUpperCase()+str.slice(1);
    const x0=w.x-this.origin.x, by=w.top-this.origin.y+base; const xs=str.length===w.b-w.a&&w.xs.length===str.length?w.xs.map(v=>v-this.origin.x):null; const res=this.glyphRun(str,sp,ls,x0,by,{ell,xs});
    d+=res.d; bd+=res.bd; if(res.bw) bw=res.bw; res.fb.forEach(f=>fb.push(Object.assign(f,{top:w.top-this.origin.y,h:w.h})));
    if(deco.length){ const ln=lastTop!=null&&Math.abs(lastTop-w.top)<1?under[under.length-1]:null; const x2=res.cut?res.cutX:x0+res.adv; if(ln) ln.x2=x2; else under.push({x1:x0,x2,by,font:res.font}); lastTop=w.top; }
    if(res.cut){ const r2=this.glyphRun('…',sp,ls,res.cutX,by,{}); d+=r2.d; bd+=r2.bd; break; } }
  const fp=tp?tp:(fill&&fill.a>0?paint(fill,ctx):' fill="none"'); const sk=stc&&stc.a>0?paint(stc,ctx,'stroke')+` stroke-width="${fx(stw,1000)}" stroke-linejoin="round"`:'';
  if(cs.textShadow&&cs.textShadow!=='none'&&(d||bd)){ const sh=parseShadows(cs.textShadow); if(sh.length){ let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9; words.forEach(w=>{ x0=Math.min(x0,w.x); y0=Math.min(y0,w.top); x1=Math.max(x1,w.right); y1=Math.max(y1,w.top+w.h); });
      this.o.push(this.shadowJob(`<path d="${d}${bd}" fill="#000"${bd?` stroke="#000" stroke-width="${fx(bw,1000)}"`:''}/>`,sh,{x:x0-this.origin.x-size,y:y0-this.origin.y,w:x1-x0+2*size,h:y1-y0},Object.assign({},ctx,{sc:Math.sqrt(Math.abs(ctx.M[0]*ctx.M[3]-ctx.M[1]*ctx.M[2]))||1}),2)); } }
  if(d) this.o.push(`<path d="${d}"${fp}${sk}/>`);
  if(bd){ const sc=stc&&stc.a>0?sk:(fill&&fill.a>0?paint(fill,ctx,'stroke')+` stroke-width="${fx(bw,1000)}" stroke-linejoin="round"`:''); this.o.push(`<path d="${bd}"${fp}${sc}/>`); }
  if(deco.length&&under.length){ for(const u of under){ const fm=u.font?fmet(u.font):{u:1000,asc:900,ulp:-100,ult:50,sp:300,ss:50}; const k=size/fm.u; for(const dl of deco){ const c=color(dl.c)||fill; let y, t;
      if(dl.k==='underline'){ t=Math.max(fm.ult*k,size/20); y=u.by-fm.ulp*k-t/2; } else if(dl.k==='line-through'){ t=Math.max(fm.ss*k,size/20); y=u.by-fm.sp*k-t/2; } else { t=Math.max(fm.ult*k,size/20); y=u.by-fm.asc*k; }
      this.o.push(`<rect x="${fx(u.x1)}" y="${fx(y)}" width="${fx(Math.max(0,u.x2-u.x1))}" height="${fx(t,1000)}"${c&&c.a>0?paint(c,ctx):fp}/>`); } } }
  if(fb.length) this.fallback(fb,cs,fill,ctx); };
Page.prototype.decoOf=function(el){ const out=[]; for(let n=el;n&&n!==this.root.parentNode;n=n.parentElement){ const c=getComputedStyle(n); const l=c.textDecorationLine||''; if(l&&l!=='none') l.split(/\s+/).forEach(k=>{ if(/underline|line-through|overline/.test(k)&&!out.some(x=>x.k===k)) out.push({k,c:c.textDecorationColor,self:n===el}); }); if(c.display!=='inline') break; } return out; };
/* lays out str from pen (x,y) with exact font advances; o:{sx,ell,P,M0,measure}; returns {d,bd,bw,adv,fb[],font,cut,cutX} */
Page.prototype.glyphRun=function(str,sp,ls,x,y,o){ o=o||{}; const sxk=o.sx||1, ell=o.ell, P=o.P, M0=o.M0, F=this.F, size=sp.size; let pen=0, d='', bd='', bw=0, fb=[], font0=null, cut=false, cutX=0; const segs=[]; let cur=null;
  for(const ch of str){ const cp=ch.codePointAt(0); const pk=pickFace(F,sp,cp,FONTS); const ft=pk&&FONTS.get(pk.f.url); const key=ft?pk.f.url+(pk.sb?'b':'')+(pk.si?'i':''):'#';
    if(cur&&cur.key===key) cur.s+=ch; else segs.push(cur={key,s:ch,font:ft||null,pk}); }
  const ellW=ell?(()=>{ const pk=pickFace(F,sp,0x2026,FONTS); const ft=pk&&FONTS.get(pk.f.url); return ft?ft.glyphForCodePoint(0x2026).advanceWidth*size/ft.unitsPerEm+ls:size*.8; })():0;
  const xs=o.xs; let off=0;
  for(const sg of segs){ if(cut) break; const nch=[...sg.s].length;
    if(!sg.font){ let u=0, cf=null; for(const ch of sg.s){ const cp=ch.codePointAt(0); if(xs&&xs[off+u]!=null) pen=xs[off+u]-x; const sc=symCmds(cp), k=size/1000; let adv=(1000*k+ls)*sxk;
        if(xs&&xs[off+u+ch.length]!=null&&xs[off+u+ch.length]>x+pen) adv=xs[off+u+ch.length]-(x+pen);
        if(sc){ cf=null; if(!o.measure){ const sh=Math.max(0,(adv-(1000*k+ls)*sxk)/2); const Mg=[k*sxk,0,0,-k,x+pen+sh,y]; d+=pathStr(sc,M0?mmul(M0,Mg):Mg,P); this.run.stats.symbols=(this.run.stats.symbols||0)+1; } }
        else { adv=xs&&xs[off+u+ch.length]!=null?adv:(size*.6+ls)*sxk; if(!o.measure){ if(cf) cf.s+=ch; else fb.push(cf={s:ch,x:x+pen}); this.run.stats.fbChars++; } }
        pen+=adv; u+=ch.length; } off+=sg.s.length; continue; }
    const f=sg.font, k=size/f.unitsPerEm; font0=font0||f; const L=layout(f,sg.s,ls); const sk=sg.pk.si?.2:0; const bold=sg.pk.sb;
    const cpo=[]; { let u=0; for(const ch of sg.s){ cpo.push(u); u+=ch.length; } cpo.push(u); } let ci=0;
    for(let g=0;g<L.g.length;g++){ const gl=L.g[g], ps=L.p[g]; const adv=(ps.xAdvance*k+ls)*sxk;
      if(xs){ const bx=xs[off+(cpo[Math.min(ci,cpo.length-1)]||0)]; if(bx!=null&&(g===0||(gl.codePoints&&gl.codePoints.length))) pen=bx-x; }
      if(ell&&x+pen+adv>ell.limit-ellW+.01){ cut=true; cutX=x+pen; break; }
      if(!o.measure){ const gx=x+pen+ps.xOffset*k*sxk, gy=y-ps.yOffset*k; const Mg=[k*sxk,0,k*sk,-k,gx,gy]; const gd=glyphD(f,gl,M0?mmul(M0,Mg):Mg,P); if(bold){ bd+=gd; bw=fakeBold(size); } else d+=gd; this.run.stats.glyphs++; }
      pen+=adv; ci+=Math.max(0,(gl.codePoints&&gl.codePoints.length)||1); }
    off+=sg.s.length; }
  return {d,bd,bw,adv:pen,fb,font:font0,cut,cutX}; };
/* glyphs no web font covers: Latin-1 → standard PDF font text; anything else → a small hi-res raster of exactly that run */
Page.prototype.fallback=function(list,cs,fill,ctx){ for(const f of list){ const s=f.s, size=num(cs.fontSize); if(!s.trim()) continue; const c=fill&&fill.a>0?fill:{r:0,g:0,b:0,a:1};
    if(/^[\x20-\x7e\xa0-\xff]+$/.test(s)){ const fam=/mono|courier/i.test(cs.fontFamily)?'courier':/serif|georgia|times|garamond|prata|lora|spectral|merriweather/i.test(cs.fontFamily)&&!/sans/i.test(cs.fontFamily)?'times':'helvetica';
      this.o.push(`<text x="${fx(f.x)}" y="${fx(f.top+this.baseOff(cs))}" font-family="${fam}" font-size="${fx(size,1000)}"${num(cs.fontWeight)>=600?' font-weight="bold"':''}${/italic|oblique/.test(cs.fontStyle)?' font-style="italic"':''}${paint(c,ctx)}>${KS.esc(s)}</text>`); this.run.stats.stdText++; note('std font text',s.slice(0,20)); continue; }
    const k=6, H=f.h||size*1.3, font=`${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`; const cv=document.createElement('canvas'); let g=cv.getContext('2d'); g.font=font; const ls=cs.letterSpacing==='normal'?0:num(cs.letterSpacing);
    const W=Math.max(1,g.measureText(s).width+ls*[...s].length+size*.3); cv.width=Math.ceil(W*k); cv.height=Math.ceil(H*k); g=cv.getContext('2d'); g.scale(k,k); g.font=font; try{ if(ls) g.letterSpacing=ls+'px'; }catch(_){ }
    const kc=ctx.gray?gray(c):c; g.fillStyle=`rgba(${kc.r},${kc.g},${kc.b},${kc.a})`; g.textBaseline='alphabetic'; g.fillText(s,0,this.baseOff(cs));
    const u=cv.toDataURL('image/png'); this.run.stats.rasterText++; note('raster text',s.slice(0,20)); this.o.push(`<image x="${fx(f.x)}" y="${fx(f.top)}" width="${fx(W)}" height="${fx(H)}" preserveAspectRatio="none" href="${u}" xlink:href="${u}"${ctx.op<.999?` opacity="${fx(ctx.op,1000)}"`:''}/>`); } };

/* ---------- inline SVG ---------- */
Page.prototype.svgRoot=function(sv,ctx,cs){ if(cs.visibility==='hidden'&&!sv.querySelector('[visibility=visible]')) return; const tf=this.strip(sv); if(tf) this.restoreAll.push(tf);
  const r=this.rect(sv); let close=''; if(tf){ const ox=r.x+tf.org[0], oy=r.y+tf.org[1]; const M=mmul(mmul(mtr(ox,oy),tf.M),mtr(-ox,-oy)); if(!misI(M)){ this.o.push(`<g transform="${mstr(M)}">`); close='</g>'; ctx=Object.assign({},ctx,{M:mmul(ctx.M,M)}); } }
  const op=num(cs.opacity); const c2=Object.assign({},ctx,{op:ctx.op*op}); if(cs.filter&&/grayscale/.test(cs.filter)) c2.gray=true;
  this.box(sv,cs,r,c2); const cb=this.contentBox(cs,r); this.svgViewport(sv,cb,c2,cs.overflowX!=='visible'&&cs.overflow!=='visible'); this.o.push(close); };
/* place an svg element's content into box (page px) honouring viewBox / preserveAspectRatio */
Page.prototype.svgViewport=function(sv,box,ctx,clip){ const vb=sv.viewBox&&sv.viewBox.baseVal; let T=mtr(box.x,box.y);
  if(vb&&vb.width>0&&vb.height>0){ T=mmul(T,vbMatrix(vb,box.w,box.h,sv.preserveAspectRatio&&sv.preserveAspectRatio.baseVal)); }
  let s=''; if(clip){ s+=`<g clip-path="url(#${this.clip(rrect(box.x,box.y,box.w,box.h,null))})">`; }
  const st={M:T,op:ctx.op,gray:ctx.gray,prec:precOf(T),root:sv};
  s+=`<g transform="${mstr(T)}"${ctx.op<.999?` opacity="${fx(ctx.op,1000)}"`:''}>`+this.svgKids(sv,st)+'</g>'+(clip?'</g>':''); this.o.push(s); };
function vbMatrix(vb,w,h,par){ const sx=w/vb.width, sy=h/vb.height; const al=par?par.align:6, sl=par&&par.meetOrSlice===2; if(al===1) return [sx,0,0,sy,-vb.x*sx,-vb.y*sy];
  const s=sl?Math.max(sx,sy):Math.min(sx,sy); const ax=[0,0,0,.5,1,0,.5,1,0,.5,1][al]||.5, ay=[0,0,0,0,0,.5,.5,.5,1,1,1][al]||.5; const tx=(w-vb.width*s)*ax-vb.x*s, ty=(h-vb.height*s)*ay-vb.y*s; return [s,0,0,s,tx,ty]; }
function precOf(M){ const s=Math.sqrt(Math.abs(M[0]*M[3]-M[1]*M[2]))||1; return Math.pow(10,Math.max(2,Math.min(5,Math.ceil(Math.log10(s*100))))); }
const GEOM={rect:['x','y','width','height','rx','ry'],circle:['cx','cy','r'],ellipse:['cx','cy','rx','ry'],line:['x1','y1','x2','y2']};
Page.prototype.ref=function(v,root){ const m=String(v||'').match(/url\(\s*["']?[^#"')]*#([^"')]+)["']?\s*\)/); if(!m) return null; return this.mapId(m[1],root); };
Page.prototype.mapId=function(id,root){ let e=this.idmap.get(id); if(e) return e; const el=(root&&root.querySelector('#'+CSS.escape(id)))||this.root.querySelector('#'+CSS.escape(id)); if(!el) return null; e='s'+this.n+'_'+id.replace(/[^\w-]/g,'_'); this.idmap.set(id,e); return e; };
Page.prototype.paintAttrs=function(el,cs,st,split){ const P=st.prec;
  const pv=(k,v,opk)=>{ if(!v||v==='none') return ` ${k}="none"`; if(/^url\(/.test(v)){ const id=this.ref(v,st.root); if(id) return ` ${k}="url(#${id})"`+(num(cs[opk])<.999?` ${k}-opacity="${fx(num(cs[opk]),1000)}"`:''); v=v.replace(/url\([^)]*\)\s*/,'').trim()||'none'; if(v==='none') return ` ${k}="none"`; }
    let c=color(v); if(!c||c.a<=0) return ` ${k}="none"`; if(st.gray) c=gray(c); const o=c.a*(cs[opk]==null?1:num(cs[opk])); return ` ${k}="${cstr(c)}"${o<.999?` ${k}-opacity="${fx(o,1000)}"`:''}`; };
  let f=pv('fill',cs.fill,'fillOpacity'); if(cs.fillRule==='evenodd') f+=' fill-rule="evenodd"';
  let k=''; const sv=cs.stroke; if(sv&&sv!=='none'){ const sw=cs.strokeWidth; k=pv('stroke',sv,'strokeOpacity'); if(k!==' stroke="none"'){ k+=` stroke-width="${fx(/%$/.test(sw)?parseFloat(sw)/100*Math.hypot(400,400)/Math.SQRT2:num(sw),P)}"`;
    if(cs.strokeLinecap&&cs.strokeLinecap!=='butt') k+=` stroke-linecap="${cs.strokeLinecap}"`; if(cs.strokeLinejoin&&cs.strokeLinejoin!=='miter') k+=` stroke-linejoin="${cs.strokeLinejoin}"`; if(cs.strokeMiterlimit&&cs.strokeMiterlimit!=='4') k+=` stroke-miterlimit="${cs.strokeMiterlimit}"`;
    if(cs.strokeDasharray&&cs.strokeDasharray!=='none'){ const ds=cs.strokeDasharray.split(/[\s,]+/).map(num); if(ds.some(v=>v>0)) k+=` stroke-dasharray="${ds.map(v=>fx(v,P)).join(' ')}"`+(num(cs.strokeDashoffset)?` stroke-dashoffset="${fx(num(cs.strokeDashoffset),P)}"`:''); } } }
  else k=' stroke="none"';
  return split?{f,k}:f+k; };
Page.prototype.ownOp=function(cs,st){ const op=num(cs.opacity); if(op>=.999) return {a:'',op:st.op}; const t=st.op*op; return {a:` opacity="${fx(t,1000)}"`,op:t}; };
Page.prototype.svgKids=function(el,st){ let s=''; for(const c of el.children) s+=this.svgEl(c,st); return s; };
Page.prototype.svgEl=function(c,st){ const tag=c.localName; if(/^(title|desc|metadata|script|style|mask|filter|symbol|foreignObject)$/.test(tag)){ if(tag==='foreignObject') note('foreignObject skipped'); return ''; }
  const cs=getComputedStyle(c); if(cs.display==='none') return '';
  if(this.rset.has(c)){ this.rset.delete(c); const inner=this.svgEl(c,Object.assign({},st,{op:1})); let bb=null; try{ const b=c.getBBox(); let M=MI; const t=c.transform&&c.transform.baseVal.consolidate(); if(t) M=[t.matrix.a,t.matrix.b,t.matrix.c,t.matrix.d,t.matrix.e,t.matrix.f];
      const pts=[[b.x,b.y],[b.x+b.width,b.y],[b.x,b.y+b.height],[b.x+b.width,b.y+b.height]].map(p=>[M[0]*p[0]+M[2]*p[1]+M[4],M[1]*p[0]+M[3]*p[1]+M[5]]); const xs=pts.map(p=>p[0]), ys=pts.map(p=>p[1]); bb={x:Math.min(...xs),y:Math.min(...ys),w:Math.max(...xs)-Math.min(...xs),h:Math.max(...ys)-Math.min(...ys)}; }catch(_){ }
    if(!bb||!(bb.w>0)) return inner; const ext=Math.max(bb.w,bb.h)*.12+num(cs.strokeWidth)*2; bb={x:bb.x-ext,y:bb.y-ext,w:bb.w+2*ext,h:bb.h+2*ext};
    let defs='', att=''; const fr=this.ref(cs.filter,st.root)&&String(cs.filter).match(/#([^"')]+)/), mr=String(cs.mask||'').match(/url\(["']?[^#]*#([^"')]+)/);
    if(fr){ const f=(st.root.querySelector('#'+CSS.escape(fr[1]))||this.root.querySelector('#'+CSS.escape(fr[1]))); if(f){ defs+=f.outerHTML; att+=` filter="url(#${KS.esc(fr[1])})"`; } } else if(cs.filter&&cs.filter!=='none') att+=` style="filter:${KS.esc(cs.filter.replace(/"/g,"'"))}"`;
    if(mr){ const m=(st.root.querySelector('#'+CSS.escape(mr[1]))||this.root.querySelector('#'+CSS.escape(mr[1]))); if(m){ defs+=m.outerHTML; att+=` mask="url(#${KS.esc(mr[1])})"`; } }
    defs+=this.jobDefs(inner,st); const sc=Math.sqrt(Math.abs(st.M[0]*st.M[3]-st.M[1]*st.M[2]))||1; note('raster svg element',tag,cs.filter); return this.job({kind:'el',box:bb,body:`<g${att}>${inner}</g>`,defs,dpi:/feTurbulence/.test(defs)?600:300,op:st.op,scale:sc}); }
  const idA=c.id?` id="${this.mapId(c.id,st.root)}"`:''; const tfA=c.getAttribute('transform')&&c.transform?(()=>{ const m=c.transform.baseVal.consolidate(); return m?` transform="${mstr([m.matrix.a,m.matrix.b,m.matrix.c,m.matrix.d,m.matrix.e,m.matrix.f])}"`:''; })():'';
  const Mc=tfA?(()=>{ const m=c.transform.baseVal.consolidate().matrix; return mmul(st.M,[m.a,m.b,m.c,m.d,m.e,m.f]); })():st.M;
  const cp=cs.clipPath&&cs.clipPath!=='none'?this.ref(cs.clipPath,st.root):null; const cpA=cp?` clip-path="url(#${cp})"`:'';
  const P=st.prec; const vis=cs.visibility!=='hidden'&&cs.visibility!=='collapse';
  switch(tag){
    case 'defs': return `<defs>${this.svgKids(c,Object.assign({},st,{M:MI,op:1}))}</defs>`;
    case 'g': case 'a': case 'switch': { const o=this.ownOp(cs,st); return `<g${idA}${tfA}${cpA}${o.a}>${this.svgKids(c,Object.assign({},st,{M:Mc,op:o.op}))}</g>`; }
    case 'svg': { const x=c.x.baseVal.value, y=c.y.baseVal.value; let w=c.width.baseVal.value, h=c.height.baseVal.value; if(!w||!h){ try{ const bb=c.getBBox(); w=w||bb.width; h=h||bb.height; }catch(_){ } }
      const vb=c.viewBox.baseVal; let T=mtr(x,y); if(vb&&vb.width>0&&vb.height>0) T=mmul(T,vbMatrix(vb,w,h,c.preserveAspectRatio.baseVal)); const clip=cs.overflow!=='visible'&&cs.overflowX!=='visible'; const o=this.ownOp(cs,st);
      let pre=''; if(clip){ const id=this.id('c'); this.defs.push(`<clipPath id="${id}" clipPathUnits="userSpaceOnUse"><path d="${rrect(x,y,w,h,null,P)}"/></clipPath>`); pre=` clip-path="url(#${id})"`; }
      return `<g${idA}${pre}${o.a}><g transform="${mstr(T)}">${this.svgKids(c,Object.assign({},st,{M:mmul(st.M,T),op:o.op,prec:precOf(mmul(st.M,T))}))}</g></g>`; }
    case 'linearGradient': case 'radialGradient': { let stops=[...c.children].filter(x=>x.localName==='stop'); let src=c; let guard=0;
      while(!stops.length&&guard++<5){ const h=src.getAttribute('href')||src.getAttribute('xlink:href'); if(!h||h[0]!=='#') break; src=this.root.querySelector(h)||document.getElementById(h.slice(1)); if(!src) break; stops=[...src.children].filter(x=>x.localName==='stop'); }
      const gu=c.getAttribute('gradientUnits')||(src!==c&&src.getAttribute('gradientUnits'))||'objectBoundingBox';
      const at=['x1','y1','x2','y2','cx','cy','r','fx','fy','gradientUnits','gradientTransform','spreadMethod'].map(k=>{ let el=c, v=c.getAttribute(k); if(v==null&&src!==c){ el=src; v=src.getAttribute(k); } if(v==null) return '';
        if(el[k]&&el[k].baseVal&&'unitType' in el[k].baseVal){ const L=el[k].baseVal; v=fx(gu==='userSpaceOnUse'?L.value:(L.unitType===2?L.valueInSpecifiedUnits/100:L.value),1e5); } return ` ${k}="${KS.esc(v)}"`; }).join('');
      const so=stops.map(sx=>{ const sc=getComputedStyle(sx); let col=color(sc.stopColor)||{r:0,g:0,b:0,a:1}; if(st.gray) col=gray(col); const o=col.a*num(sc.stopOpacity); return `<stop offset="${KS.esc(sx.getAttribute('offset')||'0')}" stop-color="${cstr(col)}"${o<.999?` stop-opacity="${fx(o,1000)}"`:''}/>`; }).join('');
      return `<${tag}${idA}${at}>${so}</${tag}>`; }
    case 'pattern': { let at; if(c.getAttribute('patternUnits')==='userSpaceOnUse'){ /* svg2pdf ignores the tile offset: move x/y into patternTransform */
        let PT=MI; try{ const m=c.patternTransform.baseVal.consolidate(); if(m) PT=[m.matrix.a,m.matrix.b,m.matrix.c,m.matrix.d,m.matrix.e,m.matrix.f]; }catch(_){ }
        PT=mmul(PT,mtr(c.x.baseVal.value,c.y.baseVal.value)); at=` x="0" y="0" width="${fx(c.width.baseVal.value,1e5)}" height="${fx(c.height.baseVal.value,1e5)}" patternUnits="userSpaceOnUse" patternTransform="${mstr(PT)}"`+['patternContentUnits','viewBox','preserveAspectRatio'].map(k=>{ const v=c.getAttribute(k); return v!=null?` ${k}="${KS.esc(v)}"`:''; }).join(''); }
      else at=['x','y','width','height','patternUnits','patternContentUnits','patternTransform','viewBox','preserveAspectRatio'].map(k=>{ const v=c.getAttribute(k); return v!=null?` ${k}="${KS.esc(v)}"`:''; }).join('');
      return `<pattern${idA}${at}>${this.svgKids(c,Object.assign({},st,{M:MI,op:1}))}</pattern>`; }
    case 'clipPath': return `<clipPath${idA}${c.getAttribute('clipPathUnits')?` clipPathUnits="${c.getAttribute('clipPathUnits')}"`:''}${tfA}>${this.svgKids(c,Object.assign({},st,{M:MI,op:1}))}</clipPath>`;
    case 'marker': { const at=['refX','refY','markerWidth','markerHeight','markerUnits','orient','viewBox','preserveAspectRatio'].map(k=>{ const v=c.getAttribute(k); return v!=null?` ${k}="${KS.esc(v)}"`:''; }).join(''); return `<marker${idA}${at}>${this.svgKids(c,Object.assign({},st,{M:MI,op:1}))}</marker>`; }
    case 'use': { const h=c.href&&c.href.baseVal||c.getAttribute('href')||c.getAttribute('xlink:href'); const ref=h&&h[0]==='#'?(st.root.querySelector(h)||this.root.querySelector(h)):null; if(!ref) return ''; const x=c.x.baseVal.value, y=c.y.baseVal.value; const o=this.ownOp(cs,st); const M2=mmul(Mc,mtr(x,y));
      if(ref.localName==='symbol'){ const w=c.width.baseVal.value||ref.viewBox.baseVal.width, hh=c.height.baseVal.value||ref.viewBox.baseVal.height; const vb=ref.viewBox.baseVal; const T=vb&&vb.width?vbMatrix(vb,w,hh,ref.preserveAspectRatio.baseVal):MI;
        return `<g${tfA}${o.a}><g transform="translate(${fx(x,P)} ${fx(y,P)})"><g transform="${mstr(T)}">${this.svgKids(ref,Object.assign({},st,{M:mmul(M2,T),op:o.op}))}</g></g></g>`; }
      return `<g${tfA}${o.a}><g transform="translate(${fx(x,P)} ${fx(y,P)})">${this.svgEl(ref,Object.assign({},st,{M:M2,op:o.op}))}</g></g>`; }
    case 'text': return vis||c.querySelector('[visibility]')?this.svgText(c,cs,st,idA,tfA,cpA):'';
    case 'image': return vis?this.svgImage(c,cs,st,idA,tfA,cpA):'';
    case 'path': case 'rect': case 'circle': case 'ellipse': case 'line': case 'polyline': case 'polygon': { if(!vis) return ''; const o=this.ownOp(cs,st); let g='';
      if(tag==='path') g=` d="${KS.esc(c.getAttribute('d')||'')}"`; else if(tag==='polyline'||tag==='polygon') g=` points="${KS.esc(c.getAttribute('points')||'')}"`;
      else g=GEOM[tag].map(k=>{ const a=c[k]&&c[k].baseVal; if(!a) return ''; if(!c.hasAttribute(k)&&(k==='rx'||k==='ry')) return ''; return ` ${k}="${fx(a.value,P)}"`; }).join('');
      if(tag==='path'&&!c.getAttribute('d')) return '';
      if(tag==='rect'&&/^url\(/.test(cs.fill||'')){ const ex=this.expandPattern(c,cs,st,o,idA,tfA,cpA); if(ex!=null) return ex; }
      const pa=this.paintAttrs(c,cs,st,true); const nss=cs.vectorEffect==='non-scaling-stroke'&&pa.k!==' stroke="none"';
      if(nss){ /* stroke width in viewport px: geometry pre-transformed into page space under an inverse group */ const d0=tag==='path'?c.getAttribute('d'):shapeD(c,tag); const Mi=minv(st.M);
        if(d0&&Mi){ const sk=pa.k.replace(/ stroke-width="[^"]*"/,` stroke-width="${fx(num(cs.strokeWidth),1000)}"`); return `<g${idA}${tfA}${cpA}${o.a}><${tag}${g}${pa.f} stroke="none"/></g><g transform="${mstr(Mi)}"${o.a}><path d="${pathStr(pathParse(d0),Mc,100)}" fill="none"${sk}/></g>`; } }
      return `<${tag}${idA}${g}${tfA}${cpA}${pa.f}${pa.k}${o.a}/>`; }
  } return ''; };
/* grid / ruled patterns (only full-length straight lines in the tile) → long explicit lines: no tile seams in any viewer or RIP */
Page.prototype.expandPattern=function(c,cs,st,o,idA,tfA,cpA){ try{ const m=String(cs.fill).match(/url\(\s*["']?[^#"')]*#([^"')]+)/); if(!m) return null; const pat=(st.root.querySelector('#'+CSS.escape(m[1]))||this.root.querySelector('#'+CSS.escape(m[1]))); if(!pat||pat.localName!=='pattern'||pat.getAttribute('patternUnits')!=='userSpaceOnUse'||pat.getAttribute('viewBox')) return null;
  let PT=MI; const t=pat.patternTransform.baseVal.consolidate(); if(t){ const q=t.matrix; if(Math.abs(q.a-1)>1e-9||Math.abs(q.d-1)>1e-9||q.b||q.c) return null; PT=[1,0,0,1,q.e,q.f]; }
  const px=pat.x.baseVal.value+PT[4], py=pat.y.baseVal.value+PT[5], pw=pat.width.baseVal.value, ph=pat.height.baseVal.value; if(pw<=0||ph<=0) return null;
  const rx=c.x.baseVal.value, ry=c.y.baseVal.value, rw=c.width.baseVal.value, rh=c.height.baseVal.value; if(rw<=0||rh<=0) return null; if(c.rx.baseVal.value||c.ry.baseVal.value) return null;
  const kids=[...pat.children]; if(!kids.length||kids.some(k=>k.localName!=='line')) return null; if((rw/pw)*(rh/ph)>40000) return null;
  const groups=new Map(); const P=st.prec;
  for(const L of kids){ const lc=getComputedStyle(L); if(lc.display==='none'||lc.visibility==='hidden'||lc.stroke==='none') continue; if(L.getAttribute('transform')) return null;
    const x1=L.x1.baseVal.value, y1=L.y1.baseVal.value, x2=L.x2.baseVal.value, y2=L.y2.baseVal.value; const da=lc.strokeDasharray&&lc.strokeDasharray!=='none'?lc.strokeDasharray.split(/[\s,]+/).map(num):null; const per=da?da.reduce((a,b)=>a+b,0)*(da.length%2?2:1):0;
    let d='';
    if(Math.abs(x1-x2)<1e-9&&Math.min(y1,y2)<=1e-6&&Math.max(y1,y2)>=ph-1e-6){ if(da&&per>0&&Math.abs(ph/per-Math.round(ph/per))>1e-3) return null; const i0=Math.floor((rx-px-x1)/pw)-1, i1=Math.ceil((rx+rw-px-x1)/pw)+1; for(let i=i0;i<=i1;i++){ const X=px+x1+i*pw; if(X<rx-pw||X>rx+rw+pw) continue; const yA=py+Math.floor((ry-py)/ph)*ph+Math.min(y1,y2); d+=`M${fx(X,P)} ${fx(Math.min(yA,ry),P)}V${fx(ry+rh,P)}`; } }
    else if(Math.abs(y1-y2)<1e-9&&Math.min(x1,x2)<=1e-6&&Math.max(x1,x2)>=pw-1e-6){ if(da&&per>0&&Math.abs(pw/per-Math.round(pw/per))>1e-3) return null; const j0=Math.floor((ry-py-y1)/ph)-1, j1=Math.ceil((ry+rh-py-y1)/ph)+1; for(let j=j0;j<=j1;j++){ const Y=py+y1+j*ph; if(Y<ry-ph||Y>ry+rh+ph) continue; const xA=px+Math.floor((rx-px)/pw)*pw+Math.min(x1,x2); d+=`M${fx(Math.min(xA,rx),P)} ${fx(Y,P)}H${fx(rx+rw,P)}`; } }
    else return null;
    const pa=this.paintAttrs(L,lc,Object.assign({},st,{root:st.root})).replace(/ fill(-opacity|-rule)?="[^"]*"/g,''); const key=pa; groups.set(key,(groups.get(key)||'')+d); }
  const id=this.id('c'); this.defs.push(`<clipPath id="${id}" clipPathUnits="userSpaceOnUse"><path d="${rrect(rx,ry,rw,rh,null,P)}"/></clipPath>`);
  const fo=num(cs.fillOpacity); const op=o.op*fo; const opA=op<.999?` opacity="${fx(op,1000)}"`:'';
  let s=''; groups.forEach((d,pa)=>{ if(d) s+=`<path d="${d}" fill="none"${pa}/>`; }); this.run.stats.patExpanded=(this.run.stats.patExpanded||0)+1;
  return `<g${idA}${tfA}${cpA}${opA}><g clip-path="url(#${id})">${s}</g></g>`; }catch(e){ note('pattern expand failed',e&&e.message); return null; } };
function shapeD(c,tag){ const v=k=>c[k]&&c[k].baseVal?c[k].baseVal.value:num(c.getAttribute(k));
  if(tag==='rect'){ const x=v('x'),y=v('y'),w=v('width'),h=v('height'); let rx=c.hasAttribute('rx')?v('rx'):null, ry=c.hasAttribute('ry')?v('ry'):null; if(rx==null) rx=ry||0; if(ry==null) ry=rx; rx=Math.min(rx,w/2); ry=Math.min(ry,h/2); return rrect(x,y,w,h,rx?[[rx,ry],[rx,ry],[rx,ry],[rx,ry]]:null,1e4); }
  if(tag==='circle'||tag==='ellipse'){ const cx=v('cx'),cy=v('cy'),rx=tag==='circle'?v('r'):v('rx'),ry=tag==='circle'?v('r'):v('ry'); return rrect(cx-rx,cy-ry,2*rx,2*ry,[[rx,ry],[rx,ry],[rx,ry],[rx,ry]],1e4); }
  if(tag==='line') return `M${v('x1')} ${v('y1')}L${v('x2')} ${v('y2')}`;
  if(tag==='polyline'||tag==='polygon'){ const p=(c.getAttribute('points')||'').trim().split(/[\s,]+/).map(Number); let d=''; for(let i=0;i+1<p.length;i+=2) d+=(i?'L':'M')+p[i]+' '+p[i+1]; return d+(tag==='polygon'?'Z':''); }
  return ''; }
Page.prototype.svgImage=function(c,cs,st,idA,tfA,cpA){ const P=st.prec; const x=c.x.baseVal.value, y=c.y.baseVal.value, w=c.width.baseVal.value, h=c.height.baseVal.value; if(w<=0||h<=0) return ''; const o=this.ownOp(cs,st); const live=this.svgImg.get(c);
  const par=c.preserveAspectRatio.baseVal; const d=c.__vp; let iw=d&&d.w, ih=d&&d.h; if(live){ const vb=live.viewBox.baseVal; if(vb&&vb.width){ iw=vb.width; ih=vb.height; } else { iw=live.width.baseVal.value||w; ih=live.height.baseVal.value||h; } }
  if(!live&&(!d||!d.url)) return ''; let ix=x, iy=y, W=w, H=h, clip=false;
  if(iw&&ih&&par.align!==1){ const T=vbMatrix({x:0,y:0,width:iw,height:ih},w,h,par); W=iw*T[0]; H=ih*T[3]; ix=x+T[4]; iy=y+T[5]; clip=par.meetOrSlice===2; }
  let pre=`<g${idA}${tfA}${cpA}${o.a}>`, post='</g>'; if(clip){ const id=this.id('c'); this.defs.push(`<clipPath id="${id}" clipPathUnits="userSpaceOnUse"><path d="${rrect(x,y,w,h,null,P)}"/></clipPath>`); pre+=`<g clip-path="url(#${id})">`; post='</g>'+post; }
  if(live){ const vb=live.viewBox.baseVal; let T=mtr(ix,iy); if(vb&&vb.width) T=mmul(T,vbMatrix(vb,W,H,live.preserveAspectRatio.baseVal)); else T=mmul(T,msc(W/(iw||W),H/(ih||H)));
    const id=this.id('c'); this.defs.push(`<clipPath id="${id}" clipPathUnits="userSpaceOnUse"><path d="${rrect(ix,iy,W,H,null,P)}"/></clipPath>`);
    return pre+`<g clip-path="url(#${id})"><g transform="${mstr(T)}">${this.svgKids(live,Object.assign({},st,{M:mmul(st.M,T),op:o.op,root:live,prec:precOf(mmul(st.M,T))}))}</g></g>`+post; }
  this.run.stats.images++; return pre+`<image x="${fx(ix,P)}" y="${fx(iy,P)}" width="${fx(W,P)}" height="${fx(H,P)}" preserveAspectRatio="none" href="${d.url}" xlink:href="${d.url}"/>`+post; };

/* SVG <text>: exact layout from the font for simple text, browser glyph positions for textPath / per-glyph x,y lists */
function baseShift(f,size,db){ if(!f||!db||db==='auto'||db==='alphabetic'||db==='normal') return 0; const fm=fmet(f), s=size/fm.u;
  return db==='middle'?fm.xh/2*s:db==='central'?(fm.asc+fm.desc)/2*s:/hanging/.test(db)?fm.asc*.8*s:/text-before-edge|text-top/.test(db)?fm.asc*s:/text-after-edge|text-bottom|ideographic/.test(db)?fm.desc*s:/mathematical/.test(db)?fm.asc*.5*s:0; }
Page.prototype.fontFor=function(sp,str){ for(const ch of str){ const pk=pickFace(this.F,sp,ch.codePointAt(0),FONTS); const f=pk&&FONTS.get(pk.f.url); if(f) return f; } return null; };
Page.prototype.svgText=function(t,cs,st,idA,tfA,cpA){ const P=st.prec; const items=[]; const pre=/pre/.test(cs.whiteSpace)||t.getAttribute('xml:space')==='preserve';
  const walk=n=>{ for(const k of n.childNodes){ if(k.nodeType===3){ const el=k.parentElement; for(const ch of k.data) items.push({ch,el}); } else if(k.nodeType===1&&/^(tspan|textPath|a)$/.test(k.localName)) walk(k); } }; walk(t);
  let chars=[]; if(pre) chars=items.map(x=>({ch:/[\n\t\r]/.test(x.ch)?' ':x.ch,el:x.el})); else { for(const x of items){ const ch=/[\n\t\r]/.test(x.ch)?' ':x.ch; if(ch===' '&&(!chars.length||chars[chars.length-1].ch===' ')) continue; chars.push({ch,el:x.el}); } while(chars.length&&chars[chars.length-1].ch===' ') chars.pop(); }
  if(!chars.length) return ''; const listN=a=>{ try{ return a&&a.baseVal?a.baseVal.numberOfItems:0; }catch(_){ return 0; } };
  let simple=!t.querySelector('textPath')&&listN(t.x)<=1&&listN(t.y)<=1&&listN(t.dx)<=1&&listN(t.dy)<=1&&!t.getAttribute('rotate');
  if(simple) for(const s of t.querySelectorAll('tspan')) if(['x','y','dx','dy','rotate'].some(k=>s.hasAttribute(k))){ simple=false; break; }
  const o=this.ownOp(cs,st); const st2=Object.assign({},st,{op:o.op}); const db=cs.dominantBaseline;
  const CS=new Map(); const csOf=el=>{ let v=CS.get(el); if(!v){ const c=getComputedStyle(el); const vis=c.visibility!=='hidden'&&c.visibility!=='collapse'; v={c,vis,sp:specOf(c),ls:c.letterSpacing==='normal'?0:num(c.letterSpacing),ws:num(c.wordSpacing),pa:this.paintAttrs(el,c,st2,true)}; CS.set(el,v); } return v; };
  let out=''; const D=new Map(); const add=(el,r)=>{ if(!r.d&&!r.bd) return; let e=D.get(el); if(!e){ e={d:'',bd:'',bw:0}; D.set(el,e); } e.d+=r.d; e.bd+=r.bd; if(r.bw) e.bw=r.bw; };
  const flush=()=>{ D.forEach((e,el)=>{ const v=csOf(el); if(!v.vis) return; if(e.d) out+=`<path d="${e.d}"${v.pa.f}${v.pa.k}/>`; if(e.bd){ const fc=v.pa.f.match(/ fill="(#[0-9a-f]{6})"/); out+=`<path d="${e.bd}"${v.pa.f}${v.pa.k!==' stroke="none"'?v.pa.k:(fc?` stroke="${fc[1]}" stroke-width="${fx(e.bw,P)}" stroke-linejoin="round"`:'')}/>`; } }); D.clear(); };
  if(simple){ const x0=(listN(t.x)?t.x.baseVal.getItem(0).value:0)+(listN(t.dx)?t.dx.baseVal.getItem(0).value:0), y0=(listN(t.y)?t.y.baseVal.getItem(0).value:0)+(listN(t.dy)?t.dy.baseVal.getItem(0).value:0);
    const segs=[]; let cur=null; for(const c of chars){ if(cur&&cur.el===c.el) cur.s+=c.ch; else segs.push(cur={el:c.el,s:c.ch}); }
    let W=0, n=0; const meas=segs.map(sg=>{ const v=csOf(sg.el); const r=this.glyphRun(sg.s,v.sp,v.ls,0,0,{measure:1}); const nsp=(sg.s.match(/ /g)||[]).length; const adv=r.adv+nsp*v.ws; W+=adv; n+=[...sg.s].length; return {sg,v,adv}; });
    const tl=t.getAttribute('textLength')?t.textLength.baseVal.value:null, la=t.getAttribute('lengthAdjust')==='spacingAndGlyphs'; let sx=1, extra=0, Wt=W;
    if(tl!=null&&tl>0&&W>0){ if(la) sx=tl/W; else if(n>1) extra=(tl-W)/(n-1); Wt=tl; }
    const anc=cs.textAnchor==='middle'?.5:cs.textAnchor==='end'?1:0; let x=x0-anc*Wt;
    for(const m of meas){ const v=m.v; const y=y0+baseShift(this.fontFor(v.sp,m.sg.s),v.sp.size,db);
      if(!extra&&!v.ws){ const r=this.glyphRun(m.sg.s,v.sp,v.ls,x,y,{sx,P}); add(m.sg.el,r); if(r.fb.length) out+=this.svgFallback(r.fb,v,y); x+=r.adv; }
      else for(const ch of m.sg.s){ const r=this.glyphRun(ch,v.sp,v.ls,x,y,{sx,P}); add(m.sg.el,r); if(r.fb.length) out+=this.svgFallback(r.fb,v,y); x+=r.adv+(ch===' '?v.ws*sx:0)+extra; } }
    flush(); return out?`<g${idA}${tfA}${cpA}${o.a}>${out}</g>`:''; }
  /* complex: browser positions per addressable character (UTF-16 units) */
  let nb=0; try{ nb=t.getNumberOfChars(); }catch(_){ } const units=[]; chars.forEach(c=>{ units.push(c); if(c.ch.length>1) units.push(null); });
  if(nb!==units.length){ note('svg text char mismatch',nb,units.length,(t.textContent||'').slice(0,20)); if(!nb) return ''; }
  const tlA=t.getAttribute('lengthAdjust')==='spacingAndGlyphs'&&t.getAttribute('textLength');
  for(let i=0;i<Math.min(nb,units.length);i++){ const u=units[i]; if(!u||u.ch===' ') continue; let p, rot=0; try{ p=t.getStartPositionOfChar(i); rot=t.getRotationOfChar(i)||0; }catch(_){ continue; }
    const v=csOf(u.el); const f=this.fontFor(v.sp,u.ch); let sxk=1; if(tlA&&f){ try{ const e=t.getExtentOfChar(i); const a=f.glyphForCodePoint(u.ch.codePointAt(0)).advanceWidth*v.sp.size/f.unitsPerEm+v.ls; if(a>0) sxk=e.width/a; }catch(_){ } }
    const sh=baseShift(f,v.sp.size,db), a=rot*Math.PI/180, ca=Math.cos(a), sa=Math.sin(a); const M0=[ca,sa,-sa,ca,p.x-sa*sh,p.y+ca*sh];
    const r=this.glyphRun(u.ch,v.sp,v.ls,0,0,{sx:sxk,P,M0}); add(u.el,r); if(r.fb.length) out+=this.svgFallback(r.fb.map(q=>Object.assign(q,{x:p.x})),v,p.y); }
  flush(); return out?`<g${idA}${tfA}${cpA}${o.a}>${out}</g>`:''; };
Page.prototype.svgFallback=function(fb,v,y){ let s=''; for(const f of fb){ if(!f.s.trim()) continue; const fam=/mono/i.test(v.c.fontFamily)?'courier':/serif/i.test(v.c.fontFamily)&&!/sans/i.test(v.c.fontFamily)?'times':'helvetica';
  if(/^[\x20-\x7e\xa0-\xff]+$/.test(f.s)){ this.run.stats.stdText++; s+=`<text x="${fx(f.x,1000)}" y="${fx(y,1000)}" font-family="${fam}" font-size="${fx(v.sp.size,1000)}"${num(v.c.fontWeight)>=600?' font-weight="bold"':''}${v.pa.f}>${KS.esc(f.s)}</text>`; } else { this.run.stats.dropped=(this.run.stats.dropped||0)+1; note('svg glyphs dropped',f.s.slice(0,10)); } } return s; };

/* ---------- document ---------- */
async function pageSvgString(p,run){ const pg=new Page(p,run); const t0=performance.now(); await pg.mount(); try{ await pg.prepare(); const t1=performance.now(); const s=await pg.finishJobs(pg.emit()); const t2=performance.now(); (run.stats.tp=run.stats.tp||[]).push([Math.round(t1-t0),Math.round(t2-t1)]); return s; } finally { pg.unmount(); } }
function newRun(){ return {base:new Map(),stats:{pages:0,glyphs:0,images:0,rasterEls:0,rasterTex:0,rasterText:0,stdText:0,fbChars:0,ms:0}}; }
async function makePDF(pages,opt){ opt=opt||{}; if(!pages||!pages.length) throw new Error('no pages'); const t0=performance.now(); const J=await libs(); const fk=await fontkit(); if(!fk) note('fontkit unavailable — text falls back');
  const run=newRun(); VP.stats=run.stats; BSC.clear(); FONTFAIL.forEach(u=>{ FONTS.delete(u); FONTP.delete(u); }); FONTFAIL.clear(); let doc=null; const prog=opt.prog||(()=>{});
  /* unit pt: svg2pdf writes tiling-pattern matrices in user units, which PDF reads in default (pt) space */
  const PT=72/25.4;
  for(let i=0;i<pages.length;i++){ const p=pages[i]; try{ prog(i,pages.length); }catch(_){ } const pw=+p.pw*PT, ph=+p.ph*PT, o=pw>ph?'l':'p';
    const svg=await pageSvgString(p,run); if(!doc) doc=new J({orientation:o,unit:'pt',format:[pw,ph],compress:true,putOnlyUsedFonts:true}); else doc.addPage([pw,ph],o);
    const el=new DOMParser().parseFromString(svg,'image/svg+xml').documentElement; if(el.querySelector&&el.querySelector('parsererror')) throw new Error('svg parse');
    const holder=document.createElement('div'); holder.style.cssText='position:fixed;left:-99999px;top:0;width:10px;height:10px;overflow:hidden;opacity:0;pointer-events:none'; holder.appendChild(document.importNode(el,true)); document.body.appendChild(holder);
    const t3=performance.now(); try{ await doc.svg(holder.firstElementChild,{x:0,y:0,width:pw,height:ph}); }
    catch(e){ /* this page only: keep the document, put the page in as a 300 dpi picture */ console.warn('[vpdf] page',i+1,e); note('page raster fallback',i+1,e&&e.message); run.stats.rasterPages=(run.stats.rasterPages||0)+1;
      const n=doc.getNumberOfPages(); doc.deletePage(n); doc.addPage([pw,ph],o); VP.inEngine++; let cv; try{ cv=await pageCanvas(p,300); } finally { VP.inEngine--; } doc.addImage(cv.toDataURL('image/jpeg',.92),'JPEG',0,0,pw,ph,undefined,'FAST'); }
    finally { holder.remove(); } const tp=run.stats.tp[run.stats.tp.length-1]; if(tp) tp.push(Math.round(performance.now()-t3),svg.length);
    run.stats.pages++; if(i%4===3) await sleep(0); }
  doc.setProperties({title:opt.name||pages[0].name||'konvert',creator:'Конверт Студия · vector'}); const blob=doc.output('blob'); VP.mine.add(blob); run.stats.ms=Math.round(performance.now()-t0); note('pdf done',JSON.stringify(run.stats)); return blob; }

/* ---------- public API + wiring ---------- */
const _exportPDF=typeof exportPDF==='function'?exportPDF:null;
let busy=false;
KS.vpdf={ pdf:(pages,o)=>makePDF(pages,o||{}),
  save:async(pages,name)=>{ const nm=(name||(pages.length===1?pages[0].name:'konvert-eksport')).replace(/\.pdf$/i,'')+'.pdf'; const b=await makePDF(pages,{name:nm}); if(await saveFile(nm,b)) toast('PDF сохранён: '+nm); return b; },
  svg:async(p)=>pageSvgString(p,newRun()), stats:()=>VP.stats, log:()=>VP.log.slice(), debug:v=>{ VP.dbg=!!v; }, libs, fontkit };
if(_exportPDF){ exportPDF=async function(pages,dpi,prog){ if(busy) return _exportPDF.call(this,pages,dpi,prog); busy=true;
    try{ const name=(pages.length===1?pages[0].name:'konvert-eksport')+'.pdf'; const blob=await makePDF(pages,{name,prog:i=>{ try{ prog&&prog(i); }catch(_){ } }}); busy=false; if(await saveFile(name,blob)) toast('PDF сохранён: '+name); }
    catch(e){ busy=false; console.warn('[vpdf] vector export failed, raster fallback',e); note('fallback',e&&e.message); const r=await _exportPDF.call(this,pages,dpi,prog); toast('PDF сохранён картинкой: векторный режим здесь не сработал'); return r; }
    finally{ busy=false; } }; }
/* Guard for modules that build a PDF themselves from page rasters (pageCanvas / pageCanvasH2C → jsPDF → KS.download):
   the pages they rasterised are remembered; when a .pdf with exactly those page sizes is downloaded, it is rebuilt as vector. */
const REC=[]; let recDepth=0;
['pageCanvasH2C','pageCanvas'].forEach(fn=>{ const orig=window[fn]; if(typeof orig!=='function') return; window[fn]=async function(p){ recDepth++; try{ const r=await orig.apply(this,arguments); if(recDepth===1&&!VP.inEngine&&p&&p.html&&p.pw&&p.ph){ REC.push({p,t:Date.now()}); if(REC.length>400) REC.shift(); } return r; } finally{ recDepth--; } };
  try{ if(fn==='pageCanvasH2C') pageCanvasH2C=window[fn]; else pageCanvas=window[fn]; }catch(_){ } });
async function pdfPageSizes(blob){ try{ const t=await blob.slice(0,Math.min(blob.size,30e6)).text(); const imgs=(t.match(/\/Subtype\s*\/Image/g)||[]).length; const r=[...t.matchAll(/\/Type\s*\/Page\b[^s][\s\S]*?\/MediaBox\s*\[\s*([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s*\]/g)].map(m=>[+m[3]-+m[1],+m[4]-+m[2]]); r.imgs=imgs; return r; }catch(_){ return null; } }
if(KS&&typeof KS.download==='function'){ const _dl=KS.download; KS.download=async function(name,blob){ try{ if(/\.pdf$/i.test(name||'')&&blob&&blob.size&&REC.length&&!VP.inEngine&&!VP.mine.has(blob)){ const sizes=await pdfPageSizes(blob); const n=sizes&&sizes.length;
      if(n&&REC.length>=n&&sizes.imgs>=n){ const L=REC.slice(-n), PT=72/25.4, fresh=Date.now()-L[0].t<15*60e3; const ok=fresh&&L.every((r,i)=>{ const a=[r.p.pw*PT,r.p.ph*PT].sort((x,y)=>x-y), b=sizes[i].slice().sort((x,y)=>x-y); return Math.abs(a[0]-b[0])<1.5&&Math.abs(a[1]-b[1])<1.5; });
        if(ok){ REC.length=0; try{ const vb=await makePDF(L.map(r=>r.p),{name}); note('raster pdf replaced by vector',name,n); return _dl.call(this,name,vb); }catch(e){ note('vector rebuild failed',e&&e.message); } } } } }catch(e){ note('pdf guard',e&&e.message); } return _dl.apply(this,arguments); }; }
/* export dialog: plain «PDF» is vector now */
function relabel(){ const o=document.querySelector('#expFmt option[value="pdf"]'); if(o) o.textContent='PDF вектор — файл, точный размер'; const v=document.querySelector('#expFmt option[value="vpdf"]'); if(v) v.textContent='PDF через окно печати'; }
if(typeof expInfo==='function'){ const _ei=expInfo; expInfo=function(){ const r=_ei.apply(this,arguments); try{ const f=$('#expFmt').value; if(f==='pdf'){ const n=$$('#expWhat input:checked').length?expPages($$('#expWhat input:checked').map(x=>x.value),expRecs()).length:0;
      if(n) $('#expInfo').textContent=`Вектор: ${n} стр. в одном PDF. Текст — кривыми в точном шрифте, линии, рамки, QR и штрихкоды гладкие при любом увеличении. Картинкой остаются только фото.`; $('#expDpiBox').hidden=true; } }catch(_){ } return r; }; }
relabel(); KS.on('boot',relabel);
