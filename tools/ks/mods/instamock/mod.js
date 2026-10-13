/* ===== instamock — local photo-like mockups for Instagram (no AI, no network) =====
   p1 core: helpers, noise, blur, homography, shared LOOKS (also used by the «insta» module). */
if(typeof KS!=='undefined'&&KS.mod) KS.mod('instamock',{title:'Мокапы для Instagram'});

/* ---------- small helpers ---------- */
const imClamp=(v,a,b)=>v<a?a:v>b?b:v;
const imLerp=(a,b,t)=>a+(b-a)*t;
const imSmooth=(a,b,x)=>{ const t=imClamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };
const imC=(w,h)=>{ const c=document.createElement('canvas'); c.width=Math.max(1,Math.round(w)); c.height=Math.max(1,Math.round(h)); return c; };
const imCtx=c=>{ const g=c.getContext('2d'); g.imageSmoothingEnabled=true; g.imageSmoothingQuality='high'; return g; };
const imTick=()=>new Promise(r=>setTimeout(r,0));
const imRng=seed=>{ let a=(seed>>>0)||1; return ()=>{ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; };
const imHash=s=>{ s=String(s); let h=2166136261; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; };
const imPick=(r,a)=>a[Math.floor(r()*a.length)%a.length];
const imHex=c=>{ c=String(c||'#888').trim(); let m=c.match(/^#?([0-9a-f]{6})/i); if(m) return [0,2,4].map(i=>parseInt(m[1].slice(i,i+2),16)); m=c.match(/^#?([0-9a-f]{3})$/i); if(m) return [...m[1]].map(x=>parseInt(x+x,16)); m=c.match(/rgba?\(([^)]+)\)/); if(m) return m[1].split(/[ ,/]+/).filter(Boolean).slice(0,3).map(Number); return [136,136,136]; };
const imToHex=a=>'#'+a.map(v=>Math.round(imClamp(v,0,255)).toString(16).padStart(2,'0')).join('');
const imMix=(a,b,t)=>{ const A=imHex(a),B=imHex(b); return imToHex(A.map((v,i)=>v+(B[i]-v)*t)); };
const imRgba=(c,a)=>{ const [r,g,b]=imHex(c); return `rgba(${r},${g},${b},${a})`; };
const imLum=c=>{ const [r,g,b]=imHex(c); return (.2126*r+.7152*g+.0722*b)/255; };
const imShade=(c,k)=>k>=0?imMix(c,'#ffffff',k):imMix(c,'#000000',-k);
const imDeg=d=>d*Math.PI/180;

/* ---------- value noise + fbm ---------- */
function imVN(seed){ const r=imRng(seed), P=new Uint16Array(1024), V=new Float32Array(512);
  for(let i=0;i<512;i++){ P[i]=i; V[i]=r(); } for(let i=511;i>0;i--){ const j=Math.floor(r()*(i+1)), t=P[i]; P[i]=P[j]; P[j]=t; } for(let i=0;i<512;i++) P[i+512]=P[i];
  return (x,y)=>{ const xi=Math.floor(x), yi=Math.floor(y); let fx=x-xi, fy=y-yi; const X=xi&511, Y=yi&511; fx=fx*fx*(3-2*fx); fy=fy*fy*(3-2*fy);
    const a=V[P[P[X]+Y]], b=V[P[P[X+1]+Y]], c=V[P[P[X]+Y+1]], d=V[P[P[X+1]+Y+1]]; return a+(b-a)*fx+(c-a)*fy+(a-b-c+d)*fx*fy; }; }
function imFbm(n,x,y,o){ let s=0,a=.5,t=0; for(let i=0;i<o;i++){ s+=a*n(x,y); t+=a; x=x*2.03+17.17; y=y*2.03+31.7; a*=.5; } return s/t; }
/* paint a canvas pixel by pixel: fn(x,y,out) writes r,g,b(,a) into out */
function imPaint(w,h,fn){ const c=imC(w,h), g=c.getContext('2d'), d=g.createImageData(c.width,c.height), D=d.data, o=[0,0,0,255];
  let i=0; for(let y=0;y<c.height;y++) for(let x=0;x<c.width;x++){ o[3]=255; fn(x,y,o); D[i]=o[0]; D[i+1]=o[1]; D[i+2]=o[2]; D[i+3]=o[3]; i+=4; }
  g.putImageData(d,0,0); return c; }
/* fine grain tile (cached) */
const IMG_={};
function imGrainTile(seed,s){ const k='g'+seed+'_'+(s||256); if(IMG_[k]) return IMG_[k]; const r=imRng(seed); return IMG_[k]=imPaint(s||256,s||256,(x,y,o)=>{ const v=128+(r()+r()+r()-1.5)*70; o[0]=o[1]=o[2]=v; }); }
function imGrain(g,W,H,a,mode,seed,scale){ g.save(); g.globalAlpha=a; g.globalCompositeOperation=mode||'overlay'; const p=g.createPattern(imGrainTile(seed||7),'repeat');
  if(scale&&scale!==1&&p.setTransform&&typeof DOMMatrix!=='undefined') p.setTransform(new DOMMatrix().scale(scale)); g.fillStyle=p; g.fillRect(0,0,W,H); g.restore(); }

/* ---------- blur (box ×3 on a reduced copy, premultiplied; no ctx.filter so Safari is fine) ---------- */
function imBoxH(src,dst,w,h,r){ const k=1/(2*r+1); for(let y=0;y<h;y++){ const row=y*w*4; for(let c=0;c<4;c++){ let s=0; const first=src[row+c], last=src[row+(w-1)*4+c];
      for(let x=-r;x<=r;x++) s+=x<0?first:x>=w?last:src[row+x*4+c];
      for(let x=0;x<w;x++){ dst[row+x*4+c]=s*k; const a=x-r, b=x+r+1; s+=(b>=w?last:src[row+b*4+c])-(a<0?first:src[row+a*4+c]); } } } }
function imBoxV(src,dst,w,h,r){ const k=1/(2*r+1), st=w*4; for(let x=0;x<w;x++){ for(let c=0;c<4;c++){ const o=x*4+c; let s=0; const first=src[o], last=src[(h-1)*st+o];
      for(let y=-r;y<=r;y++) s+=y<0?first:y>=h?last:src[y*st+o];
      for(let y=0;y<h;y++){ dst[y*st+o]=s*k; const a=y-r, b=y+r+1; s+=(b>=h?last:src[b*st+o])-(a<0?first:src[a*st+o]); } } } }
function imBoxBlurRGBA(D,w,h,r){ r=Math.round(r); if(r<1) return; const T=new Float32Array(D.length); for(let p=0;p<3;p++){ imBoxH(D,T,w,h,r); imBoxV(T,D,w,h,r); } }
/* returns a blurred copy (same size unless keepSmall) of a canvas; radius in px of the source */
function imBlur(src,rad,keepSmall){ const w=src.width, h=src.height; if(rad<.6){ const c=imC(w,h); c.getContext('2d').drawImage(src,0,0); return c; }
  const f=Math.max(1,Math.min(rad/1.7,64)); let cur=src, cw=w, ch=h;
  while(cw/2>=w/f&&cw>8&&ch>8){ const n=imC(Math.max(1,cw/2),Math.max(1,ch/2)), x=imCtx(n); x.drawImage(cur,0,0,n.width,n.height); cur=n; cw=n.width; ch=n.height; }
  const sw=Math.max(2,Math.round(w/f)), sh=Math.max(2,Math.round(h/f)), s=imC(sw,sh), sg=imCtx(s); sg.drawImage(cur,0,0,sw,sh);
  const id=sg.getImageData(0,0,sw,sh), D=id.data, F=new Float32Array(D.length);
  for(let i=0;i<D.length;i+=4){ const a=D[i+3]/255; F[i]=D[i]*a; F[i+1]=D[i+1]*a; F[i+2]=D[i+2]*a; F[i+3]=D[i+3]; }
  imBoxBlurRGBA(F,sw,sh,Math.max(1,rad/f*.58));
  for(let i=0;i<D.length;i+=4){ const a=F[i+3]; D[i+3]=a; if(a>0){ const k=255/a; D[i]=F[i]*k; D[i+1]=F[i+1]*k; D[i+2]=F[i+2]*k; } } sg.putImageData(id,0,0);
  if(keepSmall) return s; const o=imC(w,h), og=imCtx(o); og.drawImage(s,0,0,w,h); return o; }

/* ---------- geometry ---------- */
const imQuad=(cx,cy,w,h,rot)=>{ const c=Math.cos(rot), s=Math.sin(rot); return [[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]].map(([x,y])=>[cx+x*c-y*s,cy+x*s+y*c]); };
const imFit=(bw,bh,a)=>{ let w=bw, h=w/a; if(h>bh){ h=bh; w=h*a; } return [w,h]; };
function imPoly(g,pts){ g.beginPath(); pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y)); g.closePath(); }
function imRR(g,x,y,w,h,r){ r=Math.min(r,w/2,h/2); g.beginPath(); g.moveTo(x+r,y); g.arcTo(x+w,y,x+w,y+h,r); g.arcTo(x+w,y+h,x,y+h,r); g.arcTo(x,y+h,x,y,r); g.arcTo(x,y,x+w,y,r); g.closePath(); }
/* Catmull-Rom spline through points → dense polyline */
function imSpline(P,step){ if(P.length<3) return P.slice(); const out=[]; const p=[P[0],...P,P[P.length-1]];
  for(let i=1;i<p.length-2;i++){ const [a,b,c,d]=[p[i-1],p[i],p[i+1],p[i+2]], L=Math.hypot(c[0]-b[0],c[1]-b[1]), n=Math.max(2,Math.ceil(L/(step||3)));
    for(let k=0;k<n;k++){ const t=k/n, t2=t*t, t3=t2*t; out.push([0,1].map(j=>.5*((2*b[j])+(-a[j]+c[j])*t+(2*a[j]-5*b[j]+4*c[j]-d[j])*t2+(-a[j]+3*b[j]-3*c[j]+d[j])*t3))); } }
  out.push(P[P.length-1]); return out; }
/* solve the 3x3 homography mapping 4 points s[i] -> d[i] */
function imHomog(s,d){ const A=[], b=[]; for(let i=0;i<4;i++){ const [x,y]=s[i], [u,v]=d[i]; A.push([x,y,1,0,0,0,-u*x,-u*y]); b.push(u); A.push([0,0,0,x,y,1,-v*x,-v*y]); b.push(v); }
  for(let c=0;c<8;c++){ let p=c; for(let r=c+1;r<8;r++) if(Math.abs(A[r][c])>Math.abs(A[p][c])) p=r; [A[c],A[p]]=[A[p],A[c]]; [b[c],b[p]]=[b[p],b[c]];
    for(let r=0;r<8;r++){ if(r===c) continue; const f=A[r][c]/A[c][c]; for(let k=c;k<8;k++) A[r][k]-=f*A[c][k]; b[r]-=f*b[c]; } }
  const h=b.map((v,i)=>v/A[i][i]); return [h[0],h[1],h[2],h[3],h[4],h[5],h[6],h[7],1]; }
const imApplyH=(H,x,y)=>{ const w=H[6]*x+H[7]*y+H[8]; return [(H[0]*x+H[1]*y+H[2])/w,(H[3]*x+H[4]*y+H[5])/w]; };

/* ---------- image loading (cached) ---------- */
const IM_IMG=new Map();
function imLoad(src){ if(!src) return Promise.resolve(null); if(typeof src!=='string') return Promise.resolve(src); if(IM_IMG.has(src)) return IM_IMG.get(src);
  const p=new Promise(res=>{ const im=new Image(); im.onload=()=>res(im); im.onerror=()=>res(null); im.src=src; }).then(im=>{ if(!im){ IM_IMG.delete(src); return null; } return im; });
  IM_IMG.set(src,p); if(IM_IMG.size>40){ const k=IM_IMG.keys().next().value; IM_IMG.delete(k); } return p; }
/* image/canvas -> canvas limited to max px on the long side */
function imToCanvas(im,max){ const w=im.naturalWidth||im.width, h=im.naturalHeight||im.height, k=Math.min(1,(max||2600)/Math.max(w,h)); const c=imC(w*k,h*k); imCtx(c).drawImage(im,0,0,c.width,c.height); return c; }
/* has transparency? -> bounding box of visible pixels */
function imAlphaBox(cv){ const s=Math.min(1,220/Math.max(cv.width,cv.height)), w=Math.max(1,Math.round(cv.width*s)), h=Math.max(1,Math.round(cv.height*s)), t=imC(w,h), g=t.getContext('2d'); g.drawImage(cv,0,0,w,h);
  let D; try{ D=g.getImageData(0,0,w,h).data; }catch(_){ return null; } let x0=w,y0=h,x1=-1,y1=-1,tr=0;
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){ const a=D[(y*w+x)*4+3]; if(a<200) tr++; if(a>24){ if(x<x0)x0=x; if(y<y0)y0=y; if(x>x1)x1=x; if(y>y1)y1=y; } }
  if(tr<w*h*.02||x1<0) return null; return {x:x0/s,y:y0/s,w:(x1-x0+1)/s,h:(y1-y0+1)/s}; }

/* ---------- LOOKS (shared with the «insta» module through KS.instaMock.looks()) ----------
   light.ang: where the light comes from (degrees, 0 = top, -90 = left); soft 0..1; str = shadow strength;
   grade: temp/tint −1..1, contrast −1..1, lift/fade 0..0.15, sat −1..1, grain 0..0.15, vignette 0..0.6, curve 5 points,
   split toning {sh,hi,amt}, halation/bloom 0..1 */
const IM_LOOKS={
  linen:{name:'Тёплый лён',desc:'мягкий дневной свет, натуральные ткани',bot:['gyps','lavender'],
    palette:['#f1ebe0','#e2d5c1','#c4ab8c','#8f7458','#3d3128'],
    surfaces:[{k:'linen',c:'#e6ddce'},{k:'linen',c:'#dcd0bd'},{k:'paper',c:'#ece5d9'}],
    env:['#f6f1e8','#ece2d2','#dccab0'],seal:['#8b2f2b','#7a4b3a','#a8865a'],ink:'#3d3128',twine:'#b8956a',ribbon:'#d9ccb6',
    props:['gyps','lavender','twine','seal','pen','ribbon'],pen:'black',cup:'white',
    light:{ang:-38,soft:.75,str:.55,warm:'#fff3df',shade:'#3b2a1d',glow:.5,gobo:'window',goboStr:.14},
    grade:{temp:.16,tint:.03,contrast:-.08,lift:.04,fade:.05,sat:-.10,grain:.045,vignette:.16,curve:[[0,0],[.25,.26],[.5,.52],[.75,.77],[1,.985]],split:{sh:'#6b5440',hi:'#fff1db',amt:.10},halation:0,bloom:.08}},
  marble:{name:'Белый мрамор',desc:'светлый минимализм, мягкая тень',bot:['eucalyptus','olive'],
    palette:['#f7f6f3','#e7e5e1','#c9c6c1','#a98d5e','#2f2f30'],
    surfaces:[{k:'marble',c:'#f2f1ee'},{k:'marble',c:'#eeedea'}],
    env:['#fbfaf8','#f0eee9','#e4dfd6'],seal:['#b8995f','#e6e0d4','#7b8a82'],ink:'#2f2f30',twine:'#ece6da',ribbon:'#efe9df',
    props:['eucalyptus','pen','ribbon','seal','cup'],pen:'gold',cup:'white',
    light:{ang:-18,soft:.9,str:.42,warm:'#ffffff',shade:'#2c3036',glow:.35,gobo:'none',goboStr:0},
    grade:{temp:-.04,tint:0,contrast:.03,lift:.02,fade:.03,sat:-.18,grain:.03,vignette:.08,curve:[[0,0],[.25,.24],[.5,.52],[.75,.79],[1,1]],split:{sh:'#4b5258',hi:'#fbfaf7',amt:.06},halation:0,bloom:.05}},
  kraft:{name:'Крафт и сургуч',desc:'крафт, бечёвка, красный сургуч',bot:['wheat','lavender','fernd'],
    palette:['#c79f74','#a97c52','#e8d8bf','#7a2b24','#2d241d'],
    surfaces:[{k:'kraft',c:'#b78d63'},{k:'wood',c:'oak'},{k:'kraft',c:'#a8805a'}],
    env:['#c9a378','#b88d60','#eadbc3'],seal:['#8f1f1c','#7a2b24','#2f3a2a'],ink:'#2d241d',twine:'#c29c6c',ribbon:'#7a2b24',
    props:['twine','waxstick','seal','postage','wheat','stampblock'],pen:'black',cup:'stone',
    light:{ang:-52,soft:.5,str:.7,warm:'#ffe8c6',shade:'#2a1b10',glow:.5,gobo:'blinds',goboStr:.08},
    grade:{temp:.24,tint:.02,contrast:.10,lift:.03,fade:.04,sat:-.06,grain:.06,vignette:.26,curve:[[0,0],[.25,.23],[.5,.51],[.75,.78],[1,.98]],split:{sh:'#3d2a1c',hi:'#ffe6c4',amt:.12},halation:0,bloom:0}},
  moody:{name:'Тёмный мудборд',desc:'тёмный фон, свеча, золото',bot:['fernd','bunny'],
    palette:['#22201f','#3a3431','#6b2a2a','#b08d57','#d8cfc2'],
    surfaces:[{k:'velvet',c:'#2a2624'},{k:'wood',c:'walnut'},{k:'concrete',c:'#3a3b3d'}],
    env:['#e9e1d4','#5a1f24','#2e2b29'],seal:['#b08d57','#7a1d22','#2f5a48'],ink:'#d8cfc2',twine:'#8a6b4a',ribbon:'#151413',
    props:['candle','seal','bunny','pen','waxstick','ribbon'],pen:'black',cup:'dark',
    light:{ang:-72,soft:.4,str:.9,warm:'#ffc98a',shade:'#070504',glow:.95,gobo:'candle',goboStr:.5},
    grade:{temp:.12,tint:.02,contrast:.16,lift:.05,fade:.02,sat:-.20,grain:.07,vignette:.42,curve:[[0,.02],[.25,.19],[.5,.46],[.75,.75],[1,.96]],split:{sh:'#1c2228',hi:'#ffd9a8',amt:.16},halation:.15,bloom:.05}},
  apricot:{name:'Ереванское утро',desc:'абрикосовые тона, солнце и тени листьев',bot:['gyps','olive'],
    palette:['#f6e3cf','#f0c49b','#e39a6b','#c06a45','#5b3a2c'],
    surfaces:[{k:'plaster',c:'#eed5bd'},{k:'linen',c:'#ebd3bb'},{k:'plaster',c:'#f1dccb'}],
    env:['#fbf2e8','#f4dbc4','#eabb94'],seal:['#b9573a','#9e3f2c','#d99a6c'],ink:'#5b3a2c',twine:'#c9a074',ribbon:'#e8b48e',
    props:['apricot','cup','gyps','ribbon','seal'],pen:'gold',cup:'coffee',
    light:{ang:-62,soft:.3,str:.75,warm:'#ffd7a3',shade:'#4a2817',glow:.6,gobo:'leaves',goboStr:.3},
    grade:{temp:.28,tint:.05,contrast:.03,lift:.035,fade:.05,sat:.04,grain:.045,vignette:.18,curve:[[0,0],[.25,.27],[.5,.55],[.75,.8],[1,.99]],split:{sh:'#7a4a36',hi:'#ffe2bf',amt:.14},halation:0,bloom:.12}},
  nordic:{name:'Скандинавский белый',desc:'белый, серый, светлое дерево',bot:['eucalyptus','olive'],
    palette:['#f4f4f2','#e4e3df','#c9c7c2','#8d8a85','#26272a'],
    surfaces:[{k:'paper',c:'#efefec'},{k:'wood',c:'birch'},{k:'concrete',c:'#d7d6d2'}],
    env:['#ffffff','#ecebe8','#d6d4d0'],seal:['#2a2b2e','#8d8a85','#d9d4cb'],ink:'#26272a',twine:'#e9e4da',ribbon:'#c9c7c2',
    props:['pencil','eucalyptus','cup','seal'],pen:'silver',cup:'stone',
    light:{ang:-12,soft:.95,str:.34,warm:'#f6fbff',shade:'#2f3740',glow:.3,gobo:'none',goboStr:0},
    grade:{temp:-.10,tint:-.01,contrast:-.02,lift:.03,fade:.03,sat:-.30,grain:.03,vignette:.06,curve:[[0,.02],[.25,.30],[.5,.58],[.75,.82],[1,1]],split:{sh:'#56606a',hi:'#f7fbff',amt:.06},halation:0,bloom:.04}},
  vintage:{name:'Винтажная почта',desc:'марки, плёнка, старое дерево',bot:['wheat','fernd','lavender'],
    palette:['#e9dcc0','#c9ae84','#8b5e3c','#3f5a59','#2a211b'],
    surfaces:[{k:'wood',c:'vintage'},{k:'paper',c:'#e3d2ad'},{k:'kraft',c:'#a98258'}],
    env:['#efe3c8','#e3cfa6','#cdb48a'],seal:['#7c1d1a','#3f5a59','#5a3a22'],ink:'#2a211b',twine:'#c8a679',ribbon:'#3f5a59',
    props:['postage','twine','pen','seal','letters','postmark'],pen:'black',cup:'stone',
    light:{ang:-45,soft:.55,str:.65,warm:'#ffe1b2',shade:'#2a1a10',glow:.6,gobo:'blinds',goboStr:.1},
    grade:{temp:.22,tint:-.02,contrast:.06,lift:.08,fade:.08,sat:-.26,grain:.11,vignette:.38,curve:[[0,.07],[.25,.28],[.5,.52],[.75,.74],[1,.92]],split:{sh:'#2e4a4a',hi:'#ffdcae',amt:.18},halation:.35,bloom:0}},
  pastel:{name:'Пастель',desc:'нежные цвета, шёлковая лента',bot:['gyps','bunny','lavender'],
    palette:['#f6e1df','#ead9f0','#d9ece3','#f5ecd2','#6e6170'],
    surfaces:[{k:'paper',c:'#f2dbd6'},{k:'paper',c:'#e7ddef'},{k:'paper',c:'#d9ebe2'}],
    env:['#fff8f5','#f6e3e1','#ece2f3'],seal:['#d49aa0','#b5a0c8','#efe9e1'],ink:'#6e6170',twine:'#f2e8e0',ribbon:'#efc9c9',
    props:['ribbon','gyps','bunny','seal','confetti'],pen:'gold',cup:'white',
    light:{ang:-28,soft:.95,str:.3,warm:'#fff6f2',shade:'#5a4650',glow:.3,gobo:'none',goboStr:0},
    grade:{temp:.04,tint:.07,contrast:-.16,lift:.06,fade:.06,sat:-.12,grain:.035,vignette:.06,curve:[[0,.05],[.25,.32],[.5,.59],[.75,.83],[1,.985]],split:{sh:'#8a7a95',hi:'#fff4f4',amt:.08},halation:0,bloom:.15}},
  botanic:{name:'Сухоцветы и зелень',desc:'эвкалипт, папоротник, мягкая тень',bot:['eucalyptus','fern','olive'],botScale:1.3,
    palette:['#e9e7dc','#cfd3c0','#9aa58a','#5f6e52','#2e3527'],
    surfaces:[{k:'linen',c:'#d3d6c4'},{k:'wood',c:'oaklight'},{k:'paper',c:'#e6e4d9'}],
    env:['#f5f3eb','#e2e5d7','#c8ceb7'],seal:['#5f6e52','#3c4a37','#a99a6b'],ink:'#2e3527',twine:'#b89a6e',ribbon:'#9aa58a',
    props:['eucalyptus','fern','olive','twine','seal'],pen:'black',cup:'stone',
    light:{ang:-50,soft:.6,str:.55,warm:'#fff4dc',shade:'#24301e',glow:.45,gobo:'leaves',goboStr:.22},
    grade:{temp:.06,tint:-.05,contrast:.04,lift:.04,fade:.04,sat:-.12,grain:.05,vignette:.2,curve:[[0,.01],[.25,.25],[.5,.51],[.75,.77],[1,.98]],split:{sh:'#33402f',hi:'#fbf3df',amt:.12},halation:0,bloom:.04}}};
const IM_LOOK_IDS=Object.keys(IM_LOOKS);
const imLook=l=>typeof l==='object'&&l&&l.grade?l:(IM_LOOKS[l]||IM_LOOKS.linen);
/* public copy (deep) with ids */
const imLooksPublic=()=>IM_LOOK_IDS.map(id=>Object.assign({id},JSON.parse(JSON.stringify(IM_LOOKS[id]))));
/* ---------- p2: procedural photographic surfaces, light and window shadows ---------- */
function imRamp(c0,c1,t){ return [c0[0]+(c1[0]-c0[0])*t,c0[1]+(c1[1]-c0[1])*t,c0[2]+(c1[2]-c0[2])*t]; }
function imUp(g,c,W,H){ g.save(); g.imageSmoothingEnabled=true; g.imageSmoothingQuality='high'; g.drawImage(c,0,0,W,H); g.restore(); }
/* soft mottling: overlay a low-res fbm field */
function imMottle(g,W,H,seed,amt,scale,oct){ const n=imVN(seed), q=Math.max(24,Math.round(W/10)), qh=Math.max(24,Math.round(H/10)), s=scale||3;
  const c=imPaint(q,qh,(x,y,o)=>{ const v=imFbm(n,x/q*s,y/q*s,oct||5); o[0]=o[1]=o[2]=128+(v-.5)*254; });
  g.save(); g.globalAlpha=amt; g.globalCompositeOperation='overlay'; imUp(g,c,W,H); g.restore(); }
/* relief from a low-res height canvas, lit from L (folds of cloth, cockled paper, trowel marks) */
function imEmboss(g,W,H,hc,L,amt,mode){ const w=hc.width, h=hc.height, d=hc.getContext('2d').getImageData(0,0,w,h).data, o=imC(w,h), og=o.getContext('2d'), od=og.createImageData(w,h), O=od.data, Hh=(x,y)=>d[(imClamp(y,0,h-1)*w+imClamp(x,0,w-1))*4];
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){ const gx=Hh(x+1,y)-Hh(x-1,y), gy=Hh(x,y+1)-Hh(x,y-1), v=imClamp(128-(gx*L[0]+gy*L[1])*amt,0,255), i=(y*w+x)*4; O[i]=O[i+1]=O[i+2]=v; O[i+3]=255; }
  og.putImageData(od,0,0); g.save(); g.globalCompositeOperation=mode||'overlay'; imUp(g,o,W,H); g.restore(); }
/* height field of soft ridges (cloth folds) */
function imRidges(W,H,seed,n,wd,u){ const r=imRng(seed), q=.18, c=imC(W*q,H*q), x=c.getContext('2d'); x.fillStyle='#808080'; x.fillRect(0,0,c.width,c.height); x.scale(q,q); x.lineCap='round';
  for(let i=0;i<n;i++){ const up=r()<.6, x0=r()*W, y0=-H*.15, x1=x0+(r()-.5)*W*1.1, y1=H*1.15, ww=(wd*(.5+r()))*u; x.strokeStyle=up?'rgba(255,255,255,.55)':'rgba(0,0,0,.45)'; x.lineWidth=ww;
    x.beginPath(); x.moveTo(x0,y0); x.bezierCurveTo(x0+(r()-.5)*W*.6,H*.35,x1+(r()-.5)*W*.6,H*.65,x1,y1); x.stroke(); }
  return imBlur(c,Math.max(1.5,wd*q*.32*u)); }

/* linen: per-pixel plain weave; every thread has its own slubs (thicker / lighter runs), soft creases */
function imLinen(g,W,H,col,seed,u,L){ const r=imRng(seed), n=imVN(seed), n2=imVN(seed+3); L=L||[-.6,-.8]; W=Math.round(W); H=Math.round(H);
  const base=imHex(col), p=2.9*u, sl=1/(30*u), id=g.createImageData(W,H), D=id.data, rot=(r()-.5)*.012, cr=Math.cos(rot), sr=Math.sin(rot), th=new Float32Array(4096); for(let k=0;k<4096;k++) th[k]=(r()-.5);
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const X=x*cr-y*sr, Y=x*sr+y*cr, ty=Y/p, tx=X/p, i=Math.floor(ty), j=Math.floor(tx), fy=ty-i, fx=tx-j;
    const top=((i+j)&1)===0, sh=n(X*sl,i*7.31)-.5, sv=n2(Y*sl,j*5.17+100)-.5, bh=th[i&4095]*.07+sh*.16+(sh>.22?.06:0), bv=th[(j+2048)&4095]*.07+sv*.16+(sv>.22?.06:0);
    const ph=Math.sin(Math.PI*fy), pv=Math.sin(Math.PI*fx); let v=top?bh*ph+(ph-1)*.16+(1-ph)*bv*.3:bv*pv+(pv-1)*.16+(1-pv)*bh*.3; v=v*.5+.03;
    const k=(y*W+x)*4; D[k]=base[0]*(1+v); D[k+1]=base[1]*(1+v); D[k+2]=base[2]*(1+v*1.05); D[k+3]=255; }
  g.putImageData(id,0,0);
  for(let i=0;i<W*H/30000;i++){ g.fillStyle=imRgba(r()<.7?imMix(col,'#3b2c1c',.55):'#ffffff',.16+r()*.22); g.beginPath(); g.ellipse(r()*W,r()*H,(1.2+r()*2.4)*u,(.7+r()*.5)*u,r()<.5?0:1.57,0,6.3); g.fill(); }
  imMottle(g,W,H,seed+11,.14,2.4,5); imEmboss(g,W,H,imRidges(W,H,seed+5,9,46,u),L,1.3); }

/* marble: turbulent domain-warped veins (soft cores + halos + fine hairlines), clouds, polish */
function imMarble(g,W,H,col,seed,u){ const r=imRng(seed), n=imVN(seed), n2=imVN(seed+7), n3=imVN(seed+13), n4=imVN(seed+19), q=Math.min(.42,.42/Math.max(1,u*.85)), mw=Math.round(W*q), mh=Math.round(H*q), S=1/(900*u*q);
  const base=imHex(col), vc=[118,121,128], a=imDeg(-40+r()*80), ca=Math.cos(a), sa=Math.sin(a), st=3+r()*1.6, wf=1+r()*.4, wa=2.2+r()*.9, dr=.55+r()*.35;
  const c=imPaint(mw,mh,(x,y,o)=>{ const X0=x*S, Y0=y*S, X=X0*ca+Y0*sa, Y=(-X0*sa+Y0*ca)*st;
    const wx=imFbm(n2,X*wf,Y*wf,4), wy=imFbm(n3,X*wf+3.1,Y*wf+1.7,4), f1=imFbm(n,X*1.1+wx*wa,Y*1.1+wy*wa,5), d1=Math.abs(f1-.5);
    const wv=.004+.022*imFbm(n4,X0*1.6,Y0*1.6,2), core=1-imSmooth(0,wv,d1), halo=1-imSmooth(0,wv*7,d1);
    const f2=imFbm(n4,X*3.4+wy*2.4,Y*3.4+wx*2.4,3), fine=1-imSmooth(0,.013,Math.abs(f2-.5));
    const fade=imSmooth(.32,.7,imFbm(n3,X0*1.3+9,Y0*1.3,2)), fade2=imSmooth(.35,.75,imFbm(n2,X0*2+5,Y0*2+5,2));
    const vein=((core*.62+halo*.16)*fade+fine*.18*fade2)*dr, cl=(imFbm(n,X0*.9+20,Y0*.9,3)-.5)*.07;
    for(let k=0;k<3;k++) o[k]=base[k]*(1+cl)-(base[k]-vc[k])*imClamp(vein,0,1); });
  imUp(g,c,W,H); imGrain(g,W,H,.05,'overlay',seed%9+3,u*.6);
  const lg=g.createLinearGradient(0,0,W,H); lg.addColorStop(0,'rgba(255,255,255,.12)'); lg.addColorStop(.45,'rgba(255,255,255,0)'); lg.addColorStop(1,'rgba(255,255,255,.04)'); g.fillStyle=lg; g.fillRect(0,0,W,H); }

/* kraft paper: even brown, dense short fibres, flecks, slight cockle */
function imKraft(g,W,H,col,seed,u,L){ const r=imRng(seed); L=L||[-.6,-.8]; g.fillStyle=col; g.fillRect(0,0,W,H); imMottle(g,W,H,seed+3,.10,5,5); imMottle(g,W,H,seed+9,.08,22,3);
  const lt=imMix(col,'#ffffff',.38), dk=imMix(col,'#2d1c0c',.42); g.save(); g.lineCap='round';
  const nf=Math.min(60000,W*H/(150*u*u)); for(let k=0;k<4;k++){ g.strokeStyle=imRgba(k%2?lt:dk,.07+k*.025); g.lineWidth=(.35+k*.15)*u; g.beginPath(); for(let i=0;i<nf/4;i++){ const x=r()*W, y=r()*H, a=r()*Math.PI, l=(2+r()*r()*14)*u; g.moveTo(x,y); g.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l); } g.stroke(); }
  for(let i=0;i<W*H/5000;i++){ g.fillStyle=imRgba(r()<.75?imMix(col,'#24160a',.65):lt,.2+r()*.35); g.beginPath(); g.arc(r()*W,r()*H,(.35+r()*1)*u,0,6.3); g.fill(); } g.restore();
  imGrain(g,W,H,.14,'overlay',seed%9+2,u*.7); imEmboss(g,W,H,imRidges(W,H,seed+2,5,160,u),L,1.1); }

/* wood: planks; long latewood lines with slow waves, pores, plank tone variation */
const IM_WOOD={oak:['#cba982','#9b7651'],walnut:['#6e4d37','#3a271b'],birch:['#e9ddca','#c9b394'],vintage:['#7d5639','#422a1b'],oaklight:['#ddc6a5','#b59471']};
function imWood(g,W,H,kind,seed,u){ const r=imRng(seed), n=imVN(seed), n2=imVN(seed+5), n3=imVN(seed+9), cs=IM_WOOD[kind]||IM_WOOD.oak, A=imHex(cs[0]), B=imHex(cs[1]), q=Math.min(.5,.55/Math.max(1,u*.85)), mw=Math.round(W*q), mh=Math.round(H*q);
  const bounds=[]; let y=-r()*120*u; while(y<H){ const h=(190+r()*120)*u; bounds.push([y,y+h,r()*1000,.75+r()*.5,(r()-.5)*.16,r()*W*2-W*.5]); y+=h; }
  const plank=yy=>{ for(const b of bounds) if(yy<b[1]) return b; return bounds[bounds.length-1]; };
  const c=imPaint(mw,mh,(x,y,o)=>{ const X=x/q, Y=y/q, b=plank(Y), ly=Y-b[0], wob=(imFbm(n,X/(1400*u)+b[2],ly/(300*u),3)-.5)*260*u+(n3(X/(380*u),ly/(90*u)+b[2])-.5)*26*u;
    const sp=(13+9*n2(X/(700*u)+b[2],ly/(160*u)))*u*b[3], gy=(ly+wob)/sp, f=gy-Math.floor(gy), late=Math.pow(imSmooth(.55,1,f),2.2), pore=n2(X/(26*u),Y/(1.3*u)+b[2]*7);
    const k=imClamp(.30+late*.38+(pore>.72?(pore-.72)*1.4:0)+(imFbm(n3,X/(600*u),Y/(220*u),2)-.5)*.42+b[4],0,1), cc=imRamp(A,B,k); o[0]=cc[0]; o[1]=cc[1]; o[2]=cc[2]; });
  imUp(g,c,W,H);
  g.save(); bounds.forEach(b=>{ g.fillStyle='rgba(25,12,4,.45)'; g.fillRect(0,b[1]-1.1*u,W,1.5*u); g.fillStyle='rgba(255,245,230,.10)'; g.fillRect(0,b[1]+.6*u,W,1.1*u);
    if(b[5]>0&&b[5]<W){ g.fillStyle='rgba(25,12,4,.35)'; g.fillRect(b[5],b[0],1.3*u,b[1]-b[0]); } }); g.restore();
  imGrain(g,W,H,.10,'overlay',seed%9+3,u); const lg=g.createLinearGradient(0,0,W,H*.6); lg.addColorStop(0,'rgba(255,248,235,.08)'); lg.addColorStop(1,'rgba(255,248,235,0)'); g.fillStyle=lg; g.fillRect(0,0,W,H); }

/* backdrop paper / card stock: fine fibres, gentle cockle */
function imPaper(g,W,H,col,seed,u,L){ const r=imRng(seed); L=L||[-.6,-.8]; g.fillStyle=col; g.fillRect(0,0,W,H); imMottle(g,W,H,seed+2,.07,3,5);
  g.save(); g.lineCap='round'; const lum=imLum(col); for(let i=0;i<W*H/900;i++){ const x=r()*W, y=r()*H, a=r()*6.3, l=(3+r()*12)*u; g.strokeStyle=r()<.6?'rgba(255,255,255,'+(.08+r()*.14)+')':imRgba(imMix(col,'#000',lum>.7?.22:.35),.04+r()*.07); g.lineWidth=(.3+r()*.5)*u;
    g.beginPath(); g.moveTo(x,y); g.quadraticCurveTo(x+Math.cos(a)*l*.5+(r()-.5)*3*u,y+Math.sin(a)*l*.5+(r()-.5)*3*u,x+Math.cos(a)*l,y+Math.sin(a)*l); g.stroke(); } g.restore();
  imGrain(g,W,H,.07,'overlay',seed%9+4,u*.7); imEmboss(g,W,H,imRidges(W,H,seed+8,4,220,u),L,.8); }

/* velvet: crushed pile, soft sheen, fine fuzz */
function imVelvet(g,W,H,col,seed,u){ const n=imVN(seed), n2=imVN(seed+3), q=.3, mw=Math.round(W*q), mh=Math.round(H*q), S=1/(560*u*q), base=imHex(col);
  const c=imPaint(mw,mh,(x,y,o)=>{ const X=x*S, Y=y*S, w=imFbm(n2,X*1.2,Y*1.2,4), v=imFbm(n,X*1.3+w*2.2,Y*1.3-w*1.6,5), rr=1-Math.abs(v*2-1), k=.78+Math.pow(rr,3)*.55+(w-.5)*.10; o[0]=base[0]*k; o[1]=base[1]*k; o[2]=base[2]*k; });
  imUp(g,c,W,H); imGrain(g,W,H,.30,'soft-light',seed%9+2,u*.6); imGrain(g,W,H,.12,'soft-light',seed%9+5,u*1.7); }

/* concrete: multi-scale stains, faint trowel arcs, pits, speckle */
function imConcrete(g,W,H,col,seed,u,L){ const r=imRng(seed), n=imVN(seed), n2=imVN(seed+4), q=.45, mw=Math.round(W*q), mh=Math.round(H*q), S=1/(520*u*q), base=imHex(col); L=L||[-.6,-.8];
  const c=imPaint(mw,mh,(x,y,o)=>{ const X=x*S, Y=y*S, a=imFbm(n,X*1.1,Y*1.1,6), st=imSmooth(.55,.8,imFbm(n2,X*.7,Y*.7,4)), b=imFbm(n,X*7+40,Y*7,3), k=1+(a-.5)*.20-st*.07+(b-.5)*.06; o[0]=base[0]*k; o[1]=base[1]*k; o[2]=base[2]*k; });
  imUp(g,c,W,H); const dark=imLum(col)<.4;
  g.save(); for(let i=0;i<W*H/5200;i++){ const x=r()*W, y=r()*H, rr=(.6+r()*r()*2.6)*u; g.fillStyle=dark?'rgba(0,0,0,.35)':'rgba(70,70,72,.28)'; g.beginPath(); g.ellipse(x,y,rr,rr*(.7+r()*.3),r()*3,0,6.3); g.fill();
    g.fillStyle=dark?'rgba(255,255,255,.05)':'rgba(255,255,255,.30)'; g.beginPath(); g.ellipse(x-L[0]*rr*.3,y-L[1]*rr*.3,rr*.75,rr*.5,0,0,6.3); g.fill(); } g.restore();
  imGrain(g,W,H,dark?.18:.24,'overlay',seed%9+4,u); imGrain(g,W,H,.10,'overlay',seed%9+6,u*2.2); }

/* plaster / tadelakt: trowel relief + mottling + sand */
function imPlaster(g,W,H,col,seed,u,L){ const r=imRng(seed); L=L||[-.6,-.8]; g.fillStyle=col; g.fillRect(0,0,W,H); imMottle(g,W,H,seed+4,.14,2.5,5); imMottle(g,W,H,seed+6,.08,9,4);
  const q=.2, hc=imC(W*q,H*q), x=hc.getContext('2d'); x.fillStyle='#808080'; x.fillRect(0,0,hc.width,hc.height); x.scale(q,q); x.lineCap='round';
  for(let i=0;i<70;i++){ const cx=r()*W, cy=r()*H, R=(140+r()*320)*u, a0=r()*6.3; x.strokeStyle=r()<.5?'rgba(255,255,255,.35)':'rgba(0,0,0,.25)'; x.lineWidth=(18+r()*46)*u; x.beginPath(); x.arc(cx,cy,R,a0,a0+.5+r()*1.2); x.stroke(); }
  imEmboss(g,W,H,imBlur(hc,3),L,1.6,'soft-light'); imGrain(g,W,H,.10,'overlay',seed%9+1,u); }

const IM_SURFC=[];
/* surfaces are cached (a few) so the next scene in the same look is fast */
function imSurface(g,W,H,spec,seed,u,L){ W=Math.round(W); H=Math.round(H); const key=[spec.k,spec.c,seed,W,H,u.toFixed(3),L?L.map(v=>v.toFixed(2)).join(','):''].join('|'), hit=IM_SURFC.find(e=>e.key===key);
  if(hit){ g.drawImage(hit.c,0,0); return; } const c=imC(W,H), cg=imCtx(c); imSurfaceRaw(cg,W,H,spec,seed,u,L); g.drawImage(c,0,0);
  IM_SURFC.unshift({key,c}); let tot=0; for(let i=0;i<IM_SURFC.length;i++){ tot+=IM_SURFC[i].c.width*IM_SURFC[i].c.height; if(i>0&&(tot>12e6||i>=3)){ IM_SURFC.length=i; break; } } }
function imSurfaceRaw(g,W,H,spec,seed,u,L){ const k=spec.k, c=spec.c;
  if(k==='marble') imMarble(g,W,H,c,seed,u); else if(k==='kraft') imKraft(g,W,H,c,seed,u,L); else if(k==='wood') imWood(g,W,H,c,seed,u);
  else if(k==='paper') imPaper(g,W,H,c,seed,u,L); else if(k==='velvet') imVelvet(g,W,H,c,seed,u); else if(k==='concrete') imConcrete(g,W,H,c,seed,u,L);
  else if(k==='plaster') imPlaster(g,W,H,c,seed,u,L); else imLinen(g,W,H,c,seed,u,L); }
const imSurfTone=spec=>spec.k==='wood'?(IM_WOOD[spec.c]||IM_WOOD.oak)[0]:spec.c;

/* ---------- light: directional falloff + warm glow (R = area to cover, cx/cy/fw/fh = the visible frame) ---------- */
function imLightVec(look,jit){ const a=imDeg((look.light.ang||0)+(jit||0)); return [Math.sin(a),-Math.cos(a)]; }  /* points TO the light */
function imLightPass(g,R,look,L,k){ const li=look.light, s=(li.glow||.4)*(k==null?1:k), cx=R.cx, cy=R.cy, D=Math.hypot(R.fw,R.fh)*.62;
  const x0=cx+L[0]*D, y0=cy+L[1]*D, x1=cx-L[0]*D, y1=cy-L[1]*D;
  let lg=g.createLinearGradient(x0,y0,x1,y1); lg.addColorStop(0,'#ffffff'); lg.addColorStop(.45,imMix('#ffffff',li.shade,.07*s)); lg.addColorStop(1,imMix('#ffffff',li.shade,.30*s));
  g.save(); g.globalCompositeOperation='multiply'; g.fillStyle=lg; g.fillRect(R.x,R.y,R.w,R.h);
  const gx=x0*.7+cx*.3, gy=y0*.7+cy*.3, rg=g.createRadialGradient(gx,gy,0,gx,gy,D*1.1); rg.addColorStop(0,imRgba(li.warm,.30*s)); rg.addColorStop(1,imRgba(li.warm,0));
  g.globalCompositeOperation='soft-light'; g.fillStyle=rg; g.fillRect(R.x,R.y,R.w,R.h); g.restore(); }

/* window light patches / leaf shadows / blinds / candle glow — multiplied over everything */
function imGobo(g,R,look,L,seed,u,kind,str){ kind=kind||look.light.gobo; str=str==null?look.light.goboStr:str; if(!kind||kind==='none'||!(str>0)) return;
  const r=imRng(seed), W=R.fw, H=R.fh, sh=imMix('#ffffff',look.light.shade,str), dir=Math.atan2(-L[1],-L[0]), fx=(R.fw-R.w)/2-R.x*0, cxF=W/2, cyF=H/2; void fx;
  if(kind==='candle'){ const cx=W*(L[0]<0?.04:.96), cy=H*(L[1]<0?.06:.94), rg=g.createRadialGradient(cx,cy,0,cx,cy,Math.hypot(W,H)*.95);
    rg.addColorStop(0,'#ffffff'); rg.addColorStop(.35,imMix('#ffffff',look.light.shade,str*.35)); rg.addColorStop(1,imMix('#ffffff',look.light.shade,str*1.1));
    g.save(); g.globalCompositeOperation='multiply'; g.fillStyle=rg; g.fillRect(R.x,R.y,R.w,R.h); const gl=g.createRadialGradient(cx,cy,0,cx,cy,Math.hypot(W,H)*.6); gl.addColorStop(0,imRgba(look.light.warm,.55)); gl.addColorStop(1,imRgba(look.light.warm,0));
    g.globalCompositeOperation='soft-light'; g.fillStyle=gl; g.fillRect(R.x,R.y,R.w,R.h); g.restore(); return; }
  const q=.25, lay=imC(R.w*q,R.h*q), x=lay.getContext('2d'); x.scale(q,q); x.translate(-R.x,-R.y);
  const mask=imC(R.w*q,R.h*q), mx=mask.getContext('2d'); mx.scale(q,q); mx.translate(-R.x,-R.y);
  if(kind==='window'||kind==='blinds'){ x.fillStyle=sh; x.fillRect(R.x,R.y,R.w,R.h); for(const c of [x,mx]){ c.save(); c.translate(cxF,cyF); c.rotate(dir+Math.PI/2); c.transform(1,0,-.35,1,0,0); c.fillStyle='#ffffff'; }
    const S=Math.max(W,H)*1.6, rr=imRng(seed+1);
    if(kind==='window'){ const pw=S*.20, gap=24*u, ox=-S*.05+(rr()-.5)*S*.1, oy=-S*.25+(rr()-.5)*S*.1; for(let i=0;i<2;i++) for(let j=0;j<3;j++){ x.fillRect(ox+i*(pw+gap),oy+j*(pw*.8+gap),pw,pw*.8); mx.fillRect(ox+i*(pw+gap),oy+j*(pw*.8+gap),pw,pw*.8); } }
    else { const sw=(34+rr()*16)*u; for(let yy=-S/2;yy<S/2;yy+=sw*1.9) x.fillRect(-S/2,yy,S,sw); }
    x.restore(); mx.restore(); }
  else { x.fillStyle='#ffffff'; x.fillRect(R.x,R.y,R.w,R.h); x.fillStyle=sh; x.strokeStyle=sh;
    const nb=3+Math.floor(r()*2); for(let b=0;b<nb;b++){ let px=W*(L[0]<0?-.1+r()*.5:.6+r()*.5), py=H*(L[1]<0?-.1+r()*.35:.75+r()*.35), an=Math.atan2(H/2-py,W/2-px)+(r()-.5)*.9; x.lineWidth=6*u; x.lineCap='round';
      for(let i=0;i<10;i++){ an+=(r()-.5)*.35; const nx=px+Math.cos(an)*70*u, ny=py+Math.sin(an)*70*u; x.beginPath(); x.moveTo(px,py); x.lineTo(nx,ny); x.stroke();
        for(const sd of [-1,1]){ if(r()<.25) continue; const la=an+sd*(.6+r()*.5), L2=(70+r()*55)*u, lx=nx+Math.cos(la)*L2*.55, ly=ny+Math.sin(la)*L2*.55; x.save(); x.translate(lx,ly); x.rotate(la); x.beginPath(); x.ellipse(0,0,L2*.55,L2*(.16+r()*.08),0,0,6.3); x.fill(); x.restore(); }
        px=nx; py=ny; } } }
  const soft=look.light.soft, b1=imBlur(lay,(kind==='leaves'?3:5)+soft*10), b2=imBlur(lay,(kind==='leaves'?10:14)+soft*16);
  g.save(); g.globalCompositeOperation='multiply'; g.globalAlpha=.55; g.drawImage(b1,R.x,R.y,R.w,R.h); g.globalAlpha=.6; g.drawImage(b2,R.x,R.y,R.w,R.h);
  if(kind==='window'){ const mb=imBlur(mask,10+soft*14); const t=mb.getContext('2d'); t.globalCompositeOperation='source-in'; t.fillStyle=look.light.warm; t.fillRect(0,0,mb.width,mb.height);
    g.globalCompositeOperation='soft-light'; g.globalAlpha=.45; g.drawImage(mb,R.x,R.y,R.w,R.h); }
  g.restore(); }
/* ---------- p3: paper objects — sheets, envelopes, wax seals, stacks, notebooks, stickers ---------- */
/* draw only the shadow of whatever draw() paints (the shape itself lands far off-canvas) */
function imShadowDo(g,blur,col,dx,dy,draw){ const m=g.getTransform(), O=30000; g.save(); g.setTransform(m.a,m.b,m.c,m.d,m.e-O,m.f); g.shadowColor=col; g.shadowBlur=Math.max(0,blur); g.shadowOffsetX=dx+O; g.shadowOffsetY=dy; draw(); g.restore(); }
/* ambient occlusion + contact + cast shadow; lift = height above the table in u */
function imShadow3(X,draw,lift,k){ const {g,u,look}=X, li=look.light, s=li.str*(k==null?1:k), soft=li.soft, dx=X.sd[0], dy=X.sd[1], c=li.shade, lf=lift==null?1:lift;
  imShadowDo(g,(1.2+lf*.12)*u,imRgba(c,.40*s),dx*.3*u,dy*.3*u,draw);
  imShadowDo(g,(3+lf*.7)*u*(.7+soft*.5),imRgba(c,.30*s),dx*(.8+lf*.5)*u,dy*(.8+lf*.5)*u,draw);
  imShadowDo(g,(8+lf*2.4)*u*(.5+soft*1.1),imRgba(c,.27*s*(1.2-soft*.4)),dx*(2.4+lf*1.6)*u,dy*(2.4+lf*1.6)*u,draw); }
const imFillPoly=pts=>g=>{ imPoly(g,pts); g.fillStyle='#000'; g.fill(); };
/* paper tooth tile */
let IM_TOOTH=null;
function imTooth(){ if(IM_TOOTH) return IM_TOOTH; const r=imRng(11), c=imPaint(256,256,(x,y,o)=>{ o[0]=o[1]=o[2]=128+(r()-.5)*40; }), g=c.getContext('2d'); g.lineCap='round';
  for(let i=0;i<260;i++){ const x=r()*256, y=r()*256, a=r()*6.3, L=3+r()*12; g.strokeStyle=r()<.5?'rgba(255,255,255,.35)':'rgba(0,0,0,.18)'; g.lineWidth=.5+r()*.6; g.beginPath(); g.moveTo(x,y); g.lineTo(x+Math.cos(a)*L,y+Math.sin(a)*L); g.stroke(); }
  return IM_TOOTH=c; }
function imToothFill(g,x,y,w,h,a,u){ g.save(); g.globalAlpha=a; g.globalCompositeOperation='overlay'; const p=g.createPattern(imTooth(),'repeat'); if(p.setTransform&&typeof DOMMatrix!=='undefined') p.setTransform(new DOMMatrix().scale(Math.max(.5,u*.8))); g.fillStyle=p; g.fillRect(x,y,w,h); g.restore(); }
/* edge highlights / thickness shading of a convex polygon (local coords, current transform) */
function imEdges(X,pts,k){ const {g,u}=X, m=g.getTransform(), L=X.L; k=k==null?1:k; const n=pts.length;
  for(let i=0;i<n;i++){ const a=pts[i], b=pts[(i+1)%n]; let ex=b[0]-a[0], ey=b[1]-a[1]; const l=Math.hypot(ex,ey)||1; let nx=ey/l, ny=-ex/l;
    const wx=m.a*nx+m.c*ny, wy=m.b*nx+m.d*ny, wl=Math.hypot(wx,wy)||1, f=(wx*L[0]+wy*L[1])/wl;
    g.beginPath(); g.moveTo(a[0]-nx*.5*u,a[1]-ny*.5*u); g.lineTo(b[0]-nx*.5*u,b[1]-ny*.5*u);
    if(f>0){ g.strokeStyle='rgba(255,255,255,'+(.55*f*k)+')'; g.lineWidth=1*u; } else { g.strokeStyle='rgba(0,0,0,'+(.16*-f*k+.04)+')'; g.lineWidth=.9*u; } g.stroke(); } }
/* subtle bend of a sheet: lighter towards the light, darker away */
function imBend(X,w,h,amt,rot){ const {g,L}=X, c=Math.cos(-rot), s=Math.sin(-rot), lx=L[0]*c-L[1]*s, ly=L[0]*s+L[1]*c, d=Math.hypot(w,h)/2;
  const lg=g.createLinearGradient(lx*d,ly*d,-lx*d,-ly*d); lg.addColorStop(0,'rgba(255,255,255,'+(.10*amt)+')'); lg.addColorStop(.5,'rgba(255,255,255,0)'); lg.addColorStop(1,'rgba(0,0,0,'+(.09*amt)+')'); g.fillStyle=lg; g.fillRect(-w/2,-h/2,w,h); }

/* a flat printed sheet (card, postcard, letter, business card). img may be null (blank paper) */
function imSheet(X,img,o){ const {g,u}=X, w=o.w, h=o.h, rot=o.rot||0, rad=(o.radius==null?.8:o.radius)*u;
  g.save(); g.translate(o.cx,o.cy); g.rotate(rot); const path=()=>imRR(g,-w/2,-h/2,w,h,rad);
  if(!o.noShadow) imShadow3(X,()=>{ path(); g.fillStyle='#000'; g.fill(); },o.lift==null?1:o.lift,o.shadow);
  g.save(); path(); g.clip(); g.fillStyle=o.paper||'#fbfaf7'; g.fillRect(-w/2,-h/2,w,h);
  if(img){ if(o.src) g.drawImage(img,o.src[0],o.src[1],o.src[2],o.src[3],-w/2,-h/2,w,h); else g.drawImage(img,-w/2,-h/2,w,h); }
  if(o.after) o.after(g,w,h);
  imToothFill(g,-w/2,-h/2,w,h,o.tooth==null?.10:o.tooth,u); imBend(X,w,h,o.bend==null?1:o.bend,rot); g.restore();
  imEdges(X,[[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]],o.edge); g.restore(); return imQuad(o.cx,o.cy,w,h,rot); }
/* fold creases of a letter (horizontal valley/mountain folds in local coords) */
function imFolds(g,w,h,ys,u){ ys.forEach((y,i)=>{ const d=6*u, lg=g.createLinearGradient(0,y-d,0,y+d), m=i%2; lg.addColorStop(0,'rgba(0,0,0,0)'); lg.addColorStop(.45,m?'rgba(255,255,255,.22)':'rgba(0,0,0,.07)'); lg.addColorStop(.5,m?'rgba(0,0,0,.10)':'rgba(255,255,255,.30)'); lg.addColorStop(.56,m?'rgba(0,0,0,.05)':'rgba(0,0,0,.08)'); lg.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=lg; g.fillRect(-w/2,y-d,w,2*d); }); }

/* ---------- envelope (procedural paper, optionally printed with the owner's design) ---------- */
function imEnvShape(w,h,flap){ const tipY=flap==='straight'?-h*.12:h*.10, r=Math.min(w,h)*.06;
  const top=g=>{ g.beginPath(); g.moveTo(-w/2,-h/2); if(flap==='round'){ g.bezierCurveTo(-w*.42,h*.02,-w*.18,h*.12,0,h*.12); g.bezierCurveTo(w*.18,h*.12,w*.42,h*.02,w/2,-h/2); }
    else if(flap==='straight'){ g.lineTo(-w/2+r,tipY); g.lineTo(w/2-r,tipY); g.lineTo(w/2,-h/2); } else { g.lineTo(-r*.9,tipY-r*.55); g.quadraticCurveTo(0,tipY+r*.15,r*.9,tipY-r*.55); g.lineTo(w/2,-h/2); } g.closePath(); };
  const bottom=g=>{ g.beginPath(); g.moveTo(-w/2,h/2); g.lineTo(-w*.07,-h*.04); g.quadraticCurveTo(0,-h*.075,w*.07,-h*.04); g.lineTo(w/2,h/2); g.closePath(); };
  const left=g=>{ g.beginPath(); g.moveTo(-w/2,-h/2); g.lineTo(-w*.06,h*.02); g.quadraticCurveTo(-w*.03,h*.06,-w*.07,h*.09); g.lineTo(-w/2,h/2); g.closePath(); };
  const right=g=>{ g.beginPath(); g.moveTo(w/2,-h/2); g.lineTo(w*.06,h*.02); g.quadraticCurveTo(w*.03,h*.06,w*.07,h*.09); g.lineTo(w/2,h/2); g.closePath(); };
  const open=g=>{ g.beginPath(); g.moveTo(-w/2,-h/2); if(flap==='round'){ g.bezierCurveTo(-w*.42,-h-h*.02,-w*.18,-h*1.12,0,-h*1.12); g.bezierCurveTo(w*.18,-h*1.12,w*.42,-h-h*.02,w/2,-h/2); }
    else if(flap==='straight'){ g.lineTo(-w/2+r,-h/2-h*.38); g.lineTo(w/2-r,-h/2-h*.38); g.lineTo(w/2,-h/2); } else { g.lineTo(-r*.9,-h/2-h*.6+r*.55); g.quadraticCurveTo(0,-h/2-h*.6-r*.15,r*.9,-h/2-h*.6+r*.55); g.lineTo(w/2,-h/2); } g.closePath(); };
  return {top,bottom,left,right,open,tipY:flap==='round'?h*.12:tipY}; }
/* o: cx,cy,w,h,rot, col, side 'back'|'front', img (printed side), flap, open (bool), insert {img,w,h,out}, liner colour, seal {col,mark}, lift */
function imEnvelope(X,o){ const {g,u}=X, w=o.w, h=o.h, rot=o.rot||0, col=o.col||'#f3eee5', E=imEnvShape(w,h,o.flap||'pointed'), tone=imLum(col);
  const paper=(path,img,shade)=>{ g.save(); path(g); g.clip(); g.fillStyle=col; g.fillRect(-w/2,-h*1.2,w,h*1.8); if(img) g.drawImage(img,-w/2,-h/2,w,h);
    if(shade){ g.fillStyle=shade; g.fillRect(-w/2,-h*1.2,w,h*1.8); } imToothFill(g,-w/2,-h*1.2,w,h*1.8,.12,u); g.restore(); };
  const flapShadow=path=>{ imShadowDo(g,2.2*u,'rgba(30,20,10,'+(.22+(1-tone)*.1)+')',X.sd[0]*.7*u,X.sd[1]*.7*u,()=>{ path(g); g.fillStyle='#000'; g.fill(); });
    imShadowDo(g,.8*u,'rgba(30,20,10,.20)',X.sd[0]*.25*u,X.sd[1]*.25*u,()=>{ path(g); g.fillStyle='#000'; g.fill(); }); };
  const lip=path=>{ g.save(); path(g); g.lineWidth=.9*u; g.strokeStyle='rgba(255,255,255,.35)'; g.stroke(); g.restore(); };
  g.save(); g.translate(o.cx,o.cy); g.rotate(rot); const body=g2=>imRR(g2,-w/2,-h/2,w,h,.8*u);
  imShadow3(X,()=>{ body(g); g.fill(); if(o.open) { E.open(g); g.fill(); } },o.lift==null?1.4:o.lift,o.shadow);
  if(o.side==='front'){ paper(body,o.img,null);
    /* flaps show through the front a little */
    g.save(); body(g); g.clip(); g.globalAlpha=.045; g.strokeStyle='#000'; g.lineWidth=2.5*u; [E.top,E.bottom].forEach(p=>{ p(g); g.stroke(); }); g.restore(); }
  else if(o.open){ /* open flap lies flat above, inside visible */
    const inside=imMix(col,'#000000',.10); g.save(); E.open(g); g.clip(); g.fillStyle=o.liner||imMix(col,'#000',.04); g.fillRect(-w/2,-h*1.3,w,h); if(o.liner&&o.linerFn) o.linerFn(g,-w/2,-h*1.3,w,h); imToothFill(g,-w/2,-h*1.3,w,h,.12,u); g.restore();
    g.save(); body(g); g.clip(); g.fillStyle=o.liner?imMix(o.liner,'#000',.12):inside; g.fillRect(-w/2,-h/2,w,h); if(o.liner&&o.linerFn) o.linerFn(g,-w/2,-h/2,w,h*.55);
    const sg=g.createLinearGradient(0,-h/2,0,h*.2); sg.addColorStop(0,'rgba(0,0,0,.18)'); sg.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=sg; g.fillRect(-w/2,-h/2,w,h); g.restore();
    if(o.insert&&o.insert.img){ const I=o.insert, iw=Math.min(w*.92,I.w||w*.9), ih=I.h||iw/(I.img.width/I.img.height), out=I.out==null?.42:I.out, iy=-h/2+ih/2-ih*out+h*.05;
      imSheet(X,I.img,{cx:0,cy:iy,w:iw,h:ih,rot:0,lift:.5,radius:.6}); }
    [E.left,E.right].forEach(p=>{ flapShadow(p); paper(p,null,'rgba(0,0,0,.025)'); });
    flapShadow(E.bottom); paper(E.bottom,null,null); lip(E.bottom); }
  else { /* closed back: printed design on all layers, flap edges visible */
    paper(body,o.img,null); [E.left,E.right].forEach(p=>{ paper(p,o.img,'rgba(0,0,0,.02)'); });
    flapShadow(E.bottom); paper(E.bottom,o.img,null); lip(E.bottom); flapShadow(E.top); paper(E.top,o.img,'rgba(255,255,255,.02)'); lip(E.top); }
  imBend(X,w,h,.6,rot); imEdges(X,[[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]],.8);
  g.restore();
  if(o.seal&&o.side!=='front'&&!o.open){ const c=Math.cos(rot), s=Math.sin(rot), ty=E.tipY-Math.min(w,h)*.02; imSeal(X,o.cx-s*ty,o.cy+c*ty,o.seal.R||Math.min(w,h)*.13,o.seal); }
  return imQuad(o.cx,o.cy,w,h,rot); }

/* ---------- wax seal ---------- */
const IM_MARKC={};
function imMarkCanvas(mark,S,font){ const k=mark+'|'+S+'|'+font; if(IM_MARKC[k]) return IM_MARKC[k]; const c=imC(S,S), g=c.getContext('2d'); g.fillStyle='#fff'; g.strokeStyle='#fff'; g.textAlign='center'; g.textBaseline='middle';
  if(mark&&typeof mark==='object'){ const iw=mark.width||mark.naturalWidth, ih=mark.height||mark.naturalHeight, [mw,mh]=imFit(S*.78,S*.78,iw/ih); g.drawImage(mark,(S-mw)/2,(S-mh)/2,mw,mh); g.globalCompositeOperation='source-in'; g.fillRect(0,0,S,S); return IM_MARKC[k]=c; }
  const t=String(mark||'TH').slice(0,3); g.lineWidth=S*.018; g.beginPath(); g.arc(S/2,S/2,S*.43,0,6.3); g.stroke(); g.lineWidth=S*.008; g.beginPath(); g.arc(S/2,S/2,S*.385,0,6.3); g.stroke();
  for(let i=0;i<24;i++){ const a=i/24*6.2832; g.beginPath(); g.arc(S/2+Math.cos(a)*S*.407,S/2+Math.sin(a)*S*.407,S*.007,0,6.3); g.fill(); }
  const fs=t.length>2?S*.30:t.length>1?S*.40:S*.52; g.font=`600 ${fs}px ${font||'"Cormorant Garamond", "Playfair Display", Georgia, serif'}`; let tw=g.measureText(t).width; if(tw>S*.62){ g.font=`600 ${fs*S*.62/tw}px ${font||'"Cormorant Garamond", Georgia, serif'}`; }
  g.fillText(t,S/2,S/2+fs*.04); return IM_MARKC[k]=c; }
/* o: col, mark (text or canvas), seed, rot, lift */
function imSeal(X,x,y,R,o){ const {g,u}=X, L=X.L, r=imRng(o.seed||X.seed+77), col=o.col||'#8b2f2b', n=imVN((o.seed||5)+3), N=120, pts=[];
  const spills=[]; for(let i=0;i<3+Math.floor(r()*3);i++) spills.push([r()*6.2832,.05+r()*.12,.25+r()*.45]);
  for(let i=0;i<N;i++){ const t=i/N*6.2832; let k=1+(n(Math.cos(t)*1.6+3,Math.sin(t)*1.6+3)-.5)*.10+(n(Math.cos(t)*5+9,Math.sin(t)*5+9)-.5)*.035;
    spills.forEach(([a,amp,wd])=>{ let d=Math.abs(t-a); d=Math.min(d,6.2832-d); k+=amp*Math.exp(-(d*d)/(wd*wd*.5)); }); pts.push([x+Math.cos(t)*R*k,y+Math.sin(t)*R*k]); }
  const blob=()=>{ g.beginPath(); imSpline(pts.concat([pts[0],pts[1]]),2).forEach(([px,py],i)=>i?g.lineTo(px,py):g.moveTo(px,py)); g.closePath(); };
  imShadow3(X,()=>{ blob(); g.fillStyle='#000'; g.fill(); },2.2,1.1);
  if(X.tilt){ blob(); g.fillStyle=imMix(col,'#000',.38); g.fill(); const t=R*.085*X.tilt; pts.forEach(p=>{ p[1]-=t; }); y-=t; }
  g.save(); blob(); g.clip();
  const hx=x+L[0]*R*.5, hy=y+L[1]*R*.5, rg=g.createRadialGradient(hx,hy,R*.05,x,y,R*1.25); rg.addColorStop(0,imMix(col,'#ffffff',.16)); rg.addColorStop(.55,col); rg.addColorStop(1,imMix(col,'#000000',.42)); g.fillStyle=rg; g.fillRect(x-R*1.6,y-R*1.6,R*3.2,R*3.2);
  /* thick wax rim: inner shade away from light, glow towards it */
  const ring=(w,c,ox,oy,b)=>{ imShadowDo(g,b,c,ox,oy,()=>{ g.beginPath(); g.rect(x-R*3,y-R*3,R*6,R*6); imSpline(pts.concat([pts[0],pts[1]]),2).reverse().forEach(([px,py],i)=>i?g.lineTo(px,py):g.moveTo(px,py)); g.closePath(); g.fillStyle='#000'; g.fill(); }); };
  ring(0,imRgba(imMix(col,'#000',.6),.75),-L[0]*R*.10,-L[1]*R*.10,R*.16); ring(0,'rgba(255,240,230,.30)',L[0]*R*.07,L[1]*R*.07,R*.12);
  /* pressed disc */
  const dr=R*.70, dx=x+(r()-.5)*R*.06, dy=y+(r()-.5)*R*.06;
  g.save(); g.beginPath(); g.arc(dx,dy,dr*1.13,0,6.3); g.lineWidth=dr*.16; const lr=g.createLinearGradient(dx+L[0]*dr,dy+L[1]*dr,dx-L[0]*dr,dy-L[1]*dr); lr.addColorStop(0,imMix(col,'#ffffff',.22)); lr.addColorStop(.5,imMix(col,'#ffffff',.04)); lr.addColorStop(1,imMix(col,'#000000',.25)); g.strokeStyle=lr; g.globalAlpha=.85; g.stroke(); g.restore();
  g.save(); g.beginPath(); g.arc(dx,dy,dr,0,6.3); g.clip(); const dg=g.createRadialGradient(dx-L[0]*dr*.3,dy-L[1]*dr*.3,0,dx,dy,dr*1.1); dg.addColorStop(0,imMix(col,'#000',.04)); dg.addColorStop(1,imMix(col,'#000',.16)); g.fillStyle=dg; g.fillRect(dx-dr,dy-dr,dr*2,dr*2);
  imShadowDo(g,dr*.10,imRgba(imMix(col,'#000',.7),.8),L[0]*dr*.06,L[1]*dr*.06,()=>{ g.beginPath(); g.rect(dx-dr*3,dy-dr*3,dr*6,dr*6); g.arc(dx,dy,dr,0,6.3,true); g.fill(); });
  /* embossed mark: raised relief */
  const S=Math.max(64,Math.round(dr*2)), mk=imMarkCanvas(o.mark==null?'TH':o.mark,S,o.font), tint=(c,a)=>{ const t=imC(S,S), tg=t.getContext('2d'); tg.drawImage(mk,0,0); tg.globalCompositeOperation='source-in'; tg.fillStyle=imRgba(c,a); tg.fillRect(0,0,S,S); return t; };
  g.translate(dx,dy); g.rotate(o.rot==null?(r()-.5)*.5:o.rot); const e=Math.max(1,dr*.035);
  g.drawImage(tint(imMix(col,'#000',.65),.85),-dr+X.sd[0]*e,-dr+X.sd[1]*e,dr*2,dr*2);
  g.drawImage(tint(imMix(col,'#ffffff',.35),.7),-dr+L[0]*e,-dr+L[1]*e,dr*2,dr*2); g.drawImage(tint(imMix(col,'#ffffff',.06),1),-dr,-dr,dr*2,dr*2); g.restore();
  /* glossy highlights */
  g.globalCompositeOperation='screen'; for(let i=0;i<3;i++){ const a=Math.atan2(L[1],L[0])+(r()-.5)*1.1, rr=R*(.82+r()*.12), sx=x+Math.cos(a)*rr, sy=y+Math.sin(a)*rr; const sg=g.createRadialGradient(sx,sy,0,sx,sy,R*(.10+r()*.08)); sg.addColorStop(0,'rgba(255,245,235,'+(.30+r()*.2)+')'); sg.addColorStop(1,'rgba(255,245,235,0)'); g.fillStyle=sg; g.fillRect(sx-R*.3,sy-R*.3,R*.6,R*.6); }
  g.globalCompositeOperation='source-over'; imGrain(g,x+R*2,y+R*2,.12,'overlay',5,Math.max(.4,u*.5)); g.restore(); }

/* ---------- notebook (cover image, page block, binding) ---------- */
function imNotebook(X,img,o){ const {g,u}=X, w=o.w, h=o.h, rot=o.rot||0, bind=o.binding||'spiral', pg=o.pages||'#f6f3ec';
  g.save(); g.translate(o.cx,o.cy); g.rotate(rot); const t=(o.thick||7)*u;
  imShadow3(X,()=>{ imRR(g,-w/2,-h/2,w+t*.4,h+t*.4,3*u); g.fill(); },(o.lift||2.2),1.1);
  /* page block peeking out on the right and bottom */
  for(let i=4;i>=1;i--){ const d=t*.12*i; g.fillStyle=i%2?imMix(pg,'#000',.06):pg; imRR(g,-w/2+d,-h/2+d,w-d*.2,h-d*.2,2.5*u); g.fill(); }
  const cover=()=>imRR(g,-w/2,-h/2,w,h,3*u);
  g.save(); cover(); g.clip(); g.fillStyle='#e9e4da'; g.fillRect(-w/2,-h/2,w,h); if(img) g.drawImage(img,-w/2,-h/2,w,h); imToothFill(g,-w/2,-h/2,w,h,.12,u); imBend(X,w,h,.7,rot); g.restore();
  imEdges(X,[[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]],1);
  if(bind==='spiral'){ const n=Math.round(h/(13*u)), sp=h/n, hx=-w/2+9*u;
    for(let i=0;i<n;i++){ const yy=-h/2+sp*(i+.5); g.fillStyle='rgba(20,16,12,.85)'; g.beginPath(); g.ellipse(hx,yy,2.4*u,2.1*u,0,0,6.3); g.fill();
      imShadowDo(g,2*u,'rgba(0,0,0,.35)',X.sd[0]*2*u,X.sd[1]*2*u,()=>{ g.beginPath(); g.moveTo(hx,yy); g.bezierCurveTo(hx-8*u,yy-4*u,hx-16*u,yy-3*u,hx-17*u,yy+2*u); g.lineWidth=2.6*u; g.stroke(); });
      const lg=g.createLinearGradient(0,yy-3*u,0,yy+3*u); lg.addColorStop(0,'#3a3a3c'); lg.addColorStop(.45,'#d9d9dc'); lg.addColorStop(1,'#2a2a2c'); g.strokeStyle=lg; g.lineCap='round'; g.lineWidth=2.4*u;
      g.beginPath(); g.moveTo(hx,yy); g.bezierCurveTo(hx-8*u,yy-4*u,hx-16*u,yy-3*u,hx-17*u,yy+2*u); g.stroke(); } }
  else if(bind==='elastic'){ const ex=w/2-w*.09; imShadowDo(g,2*u,'rgba(0,0,0,.35)',X.sd[0]*1.5*u,X.sd[1]*1.5*u,()=>{ g.fillRect(ex-4*u,-h/2-2*u,8*u,h+4*u); });
    const lg=g.createLinearGradient(ex-4*u,0,ex+4*u,0); lg.addColorStop(0,'#141414'); lg.addColorStop(.5,'#3a3836'); lg.addColorStop(1,'#141414'); g.fillStyle=lg; g.fillRect(ex-4*u,-h/2-2*u,8*u,h+4*u); }
  g.restore(); return imQuad(o.cx,o.cy,w,h,rot); }

/* ---------- die-cut sticker from a cut-out (transparent) image ---------- */
function imStickerCanvas(img,size,border){ const iw=img.width||img.naturalWidth, ih=img.height||img.naturalHeight, [w,h]=imFit(size,size,iw/ih), b=border, c=imC(w+b*2+4,h+b*2+4), g=imCtx(c);
  for(let i=0;i<24;i++){ const a=i/24*6.2832; g.drawImage(img,b+2+Math.cos(a)*b,b+2+Math.sin(a)*b,w,h); } for(let i=0;i<12;i++){ const a=i/12*6.2832; g.drawImage(img,b+2+Math.cos(a)*b*.5,b+2+Math.sin(a)*b*.5,w,h); }
  g.globalCompositeOperation='source-in'; g.fillStyle='#fdfcf9'; g.fillRect(0,0,c.width,c.height); g.globalCompositeOperation='source-over'; g.drawImage(img,b+2,b+2,w,h); return c; }
function imSticker(X,st,o){ const {g,u}=X, w=o.w, h=w*st.height/st.width;
  g.save(); g.translate(o.cx,o.cy); g.rotate(o.rot||0); imShadow3(X,()=>g.drawImage(st,-w/2,-h/2,w,h),.5,.9); g.drawImage(st,-w/2,-h/2,w,h);
  g.globalCompositeOperation='source-atop'; const lg=g.createLinearGradient(-w/2,-h/2,w/2,h/2); lg.addColorStop(0,'rgba(255,255,255,.0)'); lg.addColorStop(.42,'rgba(255,255,255,.20)'); lg.addColorStop(.5,'rgba(255,255,255,.04)'); lg.addColorStop(1,'rgba(0,0,0,.05)'); g.fillStyle=lg; g.fillRect(-w/2,-h/2,w,h); g.restore(); }

/* ---------- vellum band: frosted translucent paper over what is already drawn ---------- */
function imVellum(X,o){ const {g,u}=X, c=g.canvas, m=g.getTransform(); const blur=imBlur(c,3*u);
  g.save(); g.translate(o.cx,o.cy); g.rotate(o.rot||0); imPoly(g,[[-o.w/2,-o.h/2],[o.w/2,-o.h/2],[o.w/2,o.h/2],[-o.w/2,o.h/2]]);
  imShadow3(X,()=>{ g.fillStyle='rgba(0,0,0,.35)'; g.fill(); },.3,.35); g.clip(); g.save(); g.setTransform(1,0,0,1,0,0); g.drawImage(blur,0,0); g.restore();
  g.fillStyle='rgba(250,249,246,.52)'; g.fillRect(-o.w/2,-o.h/2,o.w,o.h); imToothFill(g,-o.w/2,-o.h/2,o.w,o.h,.08,u); if(o.after) o.after(g,o.w,o.h); g.restore();
  g.save(); g.translate(o.cx,o.cy); g.rotate(o.rot||0); g.strokeStyle='rgba(255,255,255,.55)'; g.lineWidth=.8*u; g.strokeRect(-o.w/2,-o.h/2,o.w,o.h); g.restore(); }

/* ---------- postage stamp (image or procedural) and postmark ---------- */
function imPostageArt(seed,col){ const r=imRng(seed), W=300, H=360, c=imC(W,H), g=c.getContext('2d'), base=col||imPick(r,['#8b2f2b','#3f5a59','#2f4a7a','#a0682f','#5f6e52']);
  g.fillStyle='#f6efe0'; g.fillRect(0,0,W,H); g.fillStyle=base; g.fillRect(22,22,W-44,H-44); g.fillStyle='#f6efe0'; g.fillRect(30,30,W-60,H-60);
  const sky=g.createLinearGradient(0,40,0,250); sky.addColorStop(0,imMix(base,'#ffffff',.75)); sky.addColorStop(1,imMix('#f2d9b8','#ffffff',.2)); g.fillStyle=sky; g.fillRect(40,40,W-80,220);
  g.fillStyle=imMix(base,'#ffffff',.25); g.beginPath(); g.moveTo(40,230); g.lineTo(120,120); g.lineTo(150,140); g.lineTo(175,125); g.lineTo(260,230); g.closePath(); g.fill();
  g.fillStyle='#ffffff'; g.beginPath(); g.moveTo(104,143); g.lineTo(120,120); g.lineTo(140,135); g.lineTo(128,140); g.lineTo(118,134); g.closePath(); g.fill();
  g.fillStyle=imMix(base,'#000',.2); g.beginPath(); g.moveTo(40,260); g.quadraticCurveTo(150,215,260,250); g.lineTo(260,260); g.closePath(); g.fill();
  g.fillStyle=base; g.font='700 34px "Playfair Display", Georgia, serif'; g.textAlign='left'; g.fillText(String(50*(1+Math.floor(r()*8))),46,310); g.font='600 17px "Montserrat", Arial, sans-serif'; g.textAlign='right'; g.fillText('ՀԱՅԱՍՏԱՆ',W-46,304);
  /* perforation */ g.globalCompositeOperation='destination-out'; const R=7, st=18; for(let x=0;x<=W;x+=st){ g.beginPath(); g.arc(x,0,R,0,6.3); g.arc(x,H,R,0,6.3); g.fill(); } for(let y=st;y<H;y+=st){ g.beginPath(); g.arc(0,y,R,0,6.3); g.arc(W,y,R,0,6.3); g.fill(); }
  return c; }
function imPostage(X,img,o){ const {g,u}=X, w=o.w, h=w*(img.height||img.naturalHeight)/(img.width||img.naturalWidth);
  g.save(); g.translate(o.cx,o.cy); g.rotate(o.rot||0); imShadow3(X,()=>g.drawImage(img,-w/2,-h/2,w,h),o.lift==null?.35:o.lift,.85); g.drawImage(img,-w/2,-h/2,w,h);
  g.globalCompositeOperation='source-atop'; imToothFill(g,-w/2,-h/2,w,h,.14,u); imBend(X,w,h,.8,o.rot||0); g.restore(); return [w,h]; }
function imPostmark(X,x,y,R,o){ const {g,u}=X, r=imRng(o.seed||3), ink=o.ink||'#2b2a33', S=Math.round(R*4.2), c=imC(S,S*.8), m=c.getContext('2d'), cx=R*1.05, cy=c.height/2;
  m.strokeStyle=ink; m.fillStyle=ink; m.lineWidth=R*.05; m.beginPath(); m.arc(cx,cy,R,0,6.3); m.stroke(); m.lineWidth=R*.03; m.beginPath(); m.arc(cx,cy,R*.66,0,6.3); m.stroke();
  const txt=(o.text||'ЕРЕВАН · YEREVAN · ').toUpperCase(); m.font=`600 ${R*.2}px "Montserrat", Arial, sans-serif`; m.textAlign='center'; m.textBaseline='middle'; const chars=[...txt];
  chars.forEach((ch,i)=>{ const a=-Math.PI/2+i/chars.length*6.2832; m.save(); m.translate(cx+Math.cos(a)*R*.83,cy+Math.sin(a)*R*.83); m.rotate(a+Math.PI/2); m.fillText(ch,0,0); m.restore(); });
  m.font=`700 ${R*.24}px "PT Mono", "Courier New", monospace`; m.fillText(o.date||'12.10.26',cx,cy);
  m.lineWidth=R*.05; for(let k=0;k<4;k++){ const yy=cy-R*.45+k*R*.3; m.beginPath(); for(let xx=cx+R*1.15;xx<S;xx+=2){ const v=yy+Math.sin((xx-cx)/R*3.2)*R*.09; xx===cx+R*1.15?m.moveTo(xx,v):m.lineTo(xx,v); } m.stroke(); }
  m.globalCompositeOperation='destination-out'; for(let i=0;i<S*S/40;i++){ m.fillStyle='rgba(0,0,0,'+(.2+r()*.8)+')'; m.fillRect(r()*S,r()*c.height,1+r()*R*.06,1+r()*R*.04); }
  g.save(); g.globalAlpha=o.alpha||.62; g.globalCompositeOperation='multiply'; g.translate(x,y); g.rotate(o.rot||-.18); g.drawImage(c,-cx,-cy); g.restore(); }
/* rubber-stamp imprint (transparent image) printed onto whatever is below */
function imImprint(X,img,o){ const {g}=X, w=o.w, h=w*(img.height||img.naturalHeight)/(img.width||img.naturalWidth), r=imRng(o.seed||9), c=imC(w,h), m=c.getContext('2d');
  m.drawImage(img,0,0,w,h); m.globalCompositeOperation='destination-out'; for(let i=0;i<w*h/30;i++){ m.fillStyle='rgba(0,0,0,'+(r()*.5)+')'; m.fillRect(r()*w,r()*h,1+r()*2,1+r()*2); }
  const lg=m.createLinearGradient(0,0,w,h); lg.addColorStop(0,'rgba(0,0,0,0)'); lg.addColorStop(.7,'rgba(0,0,0,.05)'); lg.addColorStop(1,'rgba(0,0,0,.35)'); m.fillStyle=lg; m.fillRect(0,0,w,h);
  g.save(); g.globalCompositeOperation='multiply'; g.globalAlpha=o.alpha||.9; g.translate(o.cx,o.cy); g.rotate(o.rot||0); g.drawImage(c,-w/2,-h/2); g.restore(); return [w,h]; }
/* ---------- p3b: props — twine, ribbon, botanicals, pen, pencil, cup, candle, apricot, wax stick, stamp block, box ---------- */
/* offscreen layer around a point; draw(m) in scene coords; then cast its shadow and composite */
function imLayer(X,cx,cy,R,lift,draw,k){ const {g}=X, m0=g.getTransform(), sc=Math.hypot(m0.a,m0.b)||1, S=Math.ceil(R*2*sc), c=imC(S,S), m=imCtx(c);
  m.setTransform(sc,0,0,sc,-(cx-R)*sc,-(cy-R)*sc); draw(m); g.save(); g.translate(cx-R,cy-R); g.scale(1/sc,1/sc); imShadow3(X,()=>g.drawImage(c,0,0),lift,k); g.drawImage(c,0,0); g.restore(); return c; }
const imBez=(p0,p1,p2)=>t=>[(1-t)*(1-t)*p0[0]+2*(1-t)*t*p1[0]+t*t*p2[0],(1-t)*(1-t)*p0[1]+2*(1-t)*t*p1[1]+t*t*p2[1]];
function imStem(m,P,w0,w1,col,n){ n=n||24; m.lineCap='round'; m.strokeStyle=col; for(let i=0;i<n;i++){ const a=P(i/n), b=P((i+1)/n); m.lineWidth=w0+(w1-w0)*i/n; m.beginPath(); m.moveTo(a[0],a[1]); m.lineTo(b[0],b[1]); m.stroke(); } }
const imDir=(P,t)=>{ const a=P(Math.max(0,t-.01)), b=P(Math.min(1,t+.01)); return Math.atan2(b[1]-a[1],b[0]-a[0]); };

/* ---------- twine (two-ply jute / cotton / baker's twine) ---------- */
function imTwine(X,pts,o){ const {g,u}=X, r=imRng(o.seed||X.seed+5), P=imSpline(pts,1.2*u), w=(o.w||5.4)*u, col=o.col||'#b8956a', dk=imMix(col,'#2a1a0a',.45), lt=imMix(col,'#fff8ec',.45), L=X.L;
  const path=()=>{ g.beginPath(); P.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y)); };
  imShadow3(X,()=>{ path(); g.lineWidth=w; g.lineCap='round'; g.lineJoin='round'; g.strokeStyle='#000'; g.stroke(); },o.lift==null?1.4:o.lift,1);
  path(); g.lineCap='round'; g.lineJoin='round'; g.strokeStyle=dk; g.lineWidth=w; g.stroke(); g.strokeStyle=imMix(col,'#000',.1); g.lineWidth=w*.8; g.stroke();
  let acc=0; const step=w*.52, red=o.baker;
  for(let i=1;i<P.length;i++){ const [x0,y0]=P[i-1], [x1,y1]=P[i]; acc+=Math.hypot(x1-x0,y1-y0); if(acc<step) continue; acc=0;
    const a=Math.atan2(y1-y0,x1-x0), nx=-Math.sin(a), ny=Math.cos(a), f=nx*L[0]+ny*L[1], k=Math.floor(i/5)%2; g.save(); g.translate(x1,y1); g.rotate(a+.75);
    const pc=red?(k?'#b8322f':'#f1ece2'):imMix(col,r()<.5?'#fff':'#000',r()*.08); const lg=g.createLinearGradient(-w*.2,-w*.36,w*.2,w*.36); lg.addColorStop(0,imMix(pc,'#fff',f>0?.42:.18)); lg.addColorStop(.45,pc); lg.addColorStop(1,imMix(pc,'#000',.35));
    g.fillStyle=lg; g.beginPath(); g.ellipse(0,0,w*.66,w*.27,0,0,6.3); g.fill(); g.restore(); }
  g.save(); g.lineWidth=.5*u; g.lineCap='round'; for(let i=0;i<P.length;i+=2){ if(r()<.5) continue; const [x,y]=P[i], a=r()*6.3, l=(2+r()*6)*u; g.strokeStyle=imRgba(r()<.65?lt:col,.35+r()*.3);
    g.beginPath(); g.moveTo(x+Math.cos(a)*w*.3,y+Math.sin(a)*w*.3); g.quadraticCurveTo(x+Math.cos(a)*(w*.3+l*.6)+(r()-.5)*2*u,y+Math.sin(a)*(w*.3+l*.6)+(r()-.5)*2*u,x+Math.cos(a+(r()-.5)*.8)*(w*.3+l),y+Math.sin(a+(r()-.5)*.8)*(w*.3+l)); g.stroke(); } g.restore(); }
/* twine bow / knot at a point (two loops + two tails) */
function imTwineBow(X,x,y,s,ang,o){ const {u}=X, c=Math.cos(ang), sn=Math.sin(ang), T=(px,py)=>[x+px*c-py*sn,y+px*sn+py*c];
  [[-1],[1]].forEach(([d])=>imTwine(X,[T(0,0),T(d*s*.45,-s*.30),T(d*s*.95,-s*.18),T(d*s*.9,s*.12),T(d*s*.4,s*.06),T(0,0)],o));
  imTwine(X,[T(0,0),T(-s*.2,s*.4),T(-s*.35,s*.95),T(-s*.3,s*1.35)],o); imTwine(X,[T(0,0),T(s*.25,s*.45),T(s*.5,s*.9),T(s*.62,s*1.25)],o);
  const g=X.g; g.save(); g.fillStyle=imMix(o.col||'#b8956a','#000',.2); g.beginPath(); g.ellipse(x,y,(o.w||3.4)*u*1.3,(o.w||3.4)*u*1.05,ang,0,6.3); g.fill(); g.restore(); }

/* ---------- ribbon (satin / linen / velvet) ---------- */
function imRibbon(X,pts,o){ const {g,u}=X, P=imSpline(pts,1.5*u), w=(o.w||22)*u, col=o.col||'#e9dfd0', kind=o.kind||'satin', n=imVN(o.seed||X.seed+9), L=X.L;
  const lefts=[], rights=[], ang=[]; for(let i=0;i<P.length;i++){ const a=P[Math.max(0,i-1)], b=P[Math.min(P.length-1,i+1)], an=Math.atan2(b[1]-a[1],b[0]-a[0]), nx=-Math.sin(an), ny=Math.cos(an); ang.push(an); lefts.push([P[i][0]+nx*w/2,P[i][1]+ny*w/2]); rights.push([P[i][0]-nx*w/2,P[i][1]-ny*w/2]); }
  const outline=()=>{ g.beginPath(); lefts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y)); for(let i=rights.length-1;i>=0;i--) g.lineTo(rights[i][0],rights[i][1]); g.closePath(); };
  imShadow3(X,()=>{ outline(); g.fill(); },o.lift==null?1:o.lift,.95);
  const sheen=kind==='satin'?.85:kind==='velvet'?.35:.25; let s=0;
  for(let i=0;i<P.length-1;i++){ s+=Math.hypot(P[i+1][0]-P[i][0],P[i+1][1]-P[i][1]); const t=n(s/(90*u),1.3), t2=n(s/(26*u),7.7), facing=Math.cos(ang[i]-Math.atan2(L[1],L[0]))*.5+.5;
    let v=(t-.5)*.55*sheen+(t2-.5)*.12*sheen+(facing-.5)*.25*sheen; if(kind==='satin'&&t>.68) v+=(t-.68)*2.6*sheen; g.fillStyle=v>=0?imMix(col,'#ffffff',Math.min(.75,v)):imMix(col,'#000000',Math.min(.55,-v));
    g.beginPath(); g.moveTo(lefts[i][0],lefts[i][1]); g.lineTo(lefts[i+1][0],lefts[i+1][1]); g.lineTo(rights[i+1][0],rights[i+1][1]); g.lineTo(rights[i][0],rights[i][1]); g.closePath(); g.fill(); g.strokeStyle=g.fillStyle; g.lineWidth=.8; g.stroke(); }
  g.save(); outline(); g.clip(); g.lineCap='round';
  const lines=kind==='linen'?[[.15,'rgba(0,0,0,.06)',1],[.5,'rgba(255,255,255,.10)',1.4],[.85,'rgba(0,0,0,.06)',1]]:[[.08,'rgba(0,0,0,.14)',1.6],[.3,'rgba(255,255,255,'+(sheen*.22)+')',2.2],[.62,'rgba(255,255,255,'+(sheen*.10)+')',4],[.92,'rgba(0,0,0,.14)',1.6]];
  lines.forEach(([t,c,lw])=>{ g.strokeStyle=c; g.lineWidth=lw*u; g.beginPath(); P.forEach((p,i)=>{ const px=lefts[i][0]+(rights[i][0]-lefts[i][0])*t, py=lefts[i][1]+(rights[i][1]-lefts[i][1])*t; i?g.lineTo(px,py):g.moveTo(px,py); }); g.stroke(); });
  if(kind==='linen'||kind==='velvet') imGrain(g,g.canvas.width*4,g.canvas.height*4,kind==='linen'?.35:.25,'overlay',5,u*.6); g.restore(); }
function imBow(X,x,y,s,ang,o){ const c=Math.cos(ang), sn=Math.sin(ang), T=(px,py)=>[x+px*c-py*sn,y+px*sn+py*c], w=o.w||18, O=(k)=>Object.assign({},o,{w,seed:(o.seed||1)+k});
  imRibbon(X,[T(0,0),T(-s*.18,s*.45),T(-s*.36,s*1.0),T(-s*.30,s*1.45)],O(1)); imRibbon(X,[T(0,0),T(s*.22,s*.45),T(s*.48,s*.95),T(s*.58,s*1.4)],O(2));
  [-1,1].forEach(d=>imRibbon(X,[T(0,s*.02),T(d*s*.28,-s*.26),T(d*s*.66,-s*.36),T(d*s*.92,-s*.12),T(d*s*.76,s*.14),T(d*s*.34,s*.10),T(0,s*.02)],O(d+7)));
  const g=X.g, k=w*X.u; g.save(); g.translate(x,y); g.rotate(ang); imShadow3(X,()=>{ imRR(g,-k*.55,-k*.6,k*1.1,k*1.2,k*.35); g.fill(); },1.2,.9);
  const lg=g.createLinearGradient(-k*.55,0,k*.55,0); lg.addColorStop(0,imMix(o.col,'#000',.25)); lg.addColorStop(.4,imMix(o.col,'#fff',.30)); lg.addColorStop(1,imMix(o.col,'#000',.28)); g.fillStyle=lg; imRR(g,-k*.55,-k*.6,k*1.1,k*1.2,k*.35); g.fill(); g.restore(); }

/* ---------- botanicals (drawn in a layer, cast one soft shadow) ---------- */
function imLeaf(m,x,y,rx,ry,a,c1,c2,u,vein,round){ m.save(); m.translate(x,y); m.rotate(a); const lg=m.createLinearGradient(0,-ry,0,ry); lg.addColorStop(0,c1); lg.addColorStop(1,c2); m.fillStyle=lg; m.beginPath();
  if(round){ m.moveTo(-rx,0); m.bezierCurveTo(-rx,-ry*1.25,rx*.95,-ry*1.2,rx,0); m.bezierCurveTo(rx*.95,ry*1.2,-rx,ry*1.25,-rx,0); }
  else { m.moveTo(-rx,0); m.bezierCurveTo(-rx*.5,-ry*1.15,rx*.55,-ry*1.05,rx,0); m.bezierCurveTo(rx*.55,ry*1.05,-rx*.5,ry*1.15,-rx,0); } m.fill();
  m.strokeStyle='rgba(40,50,35,.20)'; m.lineWidth=.6*u; m.stroke(); if(vein!==false){ m.strokeStyle='rgba(255,255,255,.16)'; m.lineWidth=.7*u; m.beginPath(); m.moveTo(-rx*.92,0); m.quadraticCurveTo(0,-ry*.08,rx*.8,0); m.stroke(); } m.restore(); }
const imLeafShadow=(m,u,sd)=>{ m.shadowColor='rgba(25,32,22,.30)'; m.shadowBlur=3.2*u; m.shadowOffsetX=sd[0]*1.8*u; m.shadowOffsetY=sd[1]*1.8*u; };
/* silver-dollar eucalyptus: round grey-blue leaves in pairs, waxy bloom */
function imEucalyptus(X,x0,y0,len,ang,seed){ const {u}=X, r=imRng(seed);
  imLayer(X,x0+Math.cos(ang)*len*.5,y0+Math.sin(ang)*len*.5,len*.74,4,m=>{ const stems=1+Math.floor(r()*2);
    for(let s=0;s<stems;s++){ const a=ang+(s?(r()<.5?-1:1)*(.25+r()*.25):0), l=len*(s?.66:1), x1=x0+(s?Math.cos(ang)*len*.18:0), y1=y0+(s?Math.sin(ang)*len*.18:0), b=(r()-.5)*.45, P=imBez([x1,y1],[x1+Math.cos(a+b)*l*.5,y1+Math.sin(a+b)*l*.5],[x1+Math.cos(a)*l,y1+Math.sin(a)*l]);
      imStem(m,P,3*u,1.2*u,'#7d6b5d'); const nl=7+Math.floor(r()*3);
      for(let i=0;i<nl;i++){ const t=.12+i/nl*.88, p=P(Math.min(1,t)), d=imDir(P,Math.min(.99,t)), sz=(28-15*t)*u*(.85+r()*.3);
        for(const sd of [-1,1]){ if(i===nl-1&&sd>0) continue; const la=d+sd*(1.15+r()*.4), off=sz*(.92+r()*.1), cx=p[0]+Math.cos(la)*off, cy=p[1]+Math.sin(la)*off, tone=r();
          m.save(); imLeafShadow(m,u,X.sd); imLeaf(m,cx,cy,sz,sz*(.86+r()*.12),la+(r()-.5)*.4,imMix('#adbcb3','#b9c4b6',tone),imMix('#7f938a','#8d9a8c',tone),u,true,true); m.restore();
          m.save(); m.globalAlpha=.13; m.fillStyle='#f4f6f2'; m.beginPath(); m.ellipse(cx+X.L[0]*sz*.2,cy+X.L[1]*sz*.2,sz*.6,sz*.48,la,0,6.3); m.fill(); m.restore(); } } } },.95); }
/* gypsophila: branching stems, dense clusters of tiny cream florets */
function imGyps(X,x0,y0,len,ang,seed){ const {u}=X, r=imRng(seed);
  imLayer(X,x0+Math.cos(ang)*len*.5,y0+Math.sin(ang)*len*.5,len*.78,5,m=>{ const br=(px,py,a,l,d)=>{ const ex=px+Math.cos(a)*l, ey=py+Math.sin(a)*l; m.strokeStyle=d<2?'#8f9478':'#a3a68b'; m.lineWidth=Math.max(.5,(1.7-d*.38))*u; m.lineCap='round'; m.beginPath(); m.moveTo(px,py); m.quadraticCurveTo(px+Math.cos(a+.15)*l*.5,py+Math.sin(a+.15)*l*.5,ex,ey); m.stroke();
      if(d<3) for(let k=0;k<2+Math.floor(r()*2);k++) br(ex,ey,a+(r()-.5)*1.3,l*(.42+r()*.25),d+1);
      else for(let f=0;f<6+Math.floor(r()*7);f++){ const fa=r()*6.3, fd=r()*9*u, fx=ex+Math.cos(fa)*fd, fy=ey+Math.sin(fa)*fd, fr=(1.8+r()*1.6)*u; m.strokeStyle='rgba(150,150,120,.5)'; m.lineWidth=.4*u; m.beginPath(); m.moveTo(ex,ey); m.lineTo(fx,fy); m.stroke();
        m.save(); m.shadowColor='rgba(60,50,40,.28)'; m.shadowBlur=1.4*u; m.shadowOffsetX=X.sd[0]*.9*u; m.shadowOffsetY=X.sd[1]*.9*u; const rg=m.createRadialGradient(fx+X.L[0]*fr*.4,fy+X.L[1]*fr*.4,0,fx,fy,fr); rg.addColorStop(0,'#fffdf7'); rg.addColorStop(1,'#e2dccb'); m.fillStyle=rg;
        m.beginPath(); for(let q=0;q<5;q++){ const qa=q/5*6.283+fa; m.ellipse(fx+Math.cos(qa)*fr*.35,fy+Math.sin(qa)*fr*.35,fr*.62,fr*.5,qa,0,6.3); } m.fill(); m.restore(); } };
    for(let s=0;s<4;s++) br(x0,y0,ang+(s-1.5)*.14+(r()-.5)*.1,len*(.36+r()*.12),0); },.9); }
/* dried lavender: slim grey-violet spikes of tiny buds */
function imLavender(X,x0,y0,len,ang,seed){ const {u}=X, r=imRng(seed);
  imLayer(X,x0+Math.cos(ang)*len*.5,y0+Math.sin(ang)*len*.5,len*.66,3.5,m=>{ for(let s=0;s<6;s++){ const a=ang+(s-2.5)*.055+(r()-.5)*.05, l=len*(.80+r()*.22), b=(r()-.5)*.1, P=imBez([x0,y0],[x0+Math.cos(a+b)*l*.5,y0+Math.sin(a+b)*l*.5],[x0+Math.cos(a)*l,y0+Math.sin(a)*l]);
      imStem(m,P,1.8*u,1.1*u,'#8c9179'); for(let j=0;j<34;j++){ const t=.64+j*.0108, p=P(Math.min(1,t)), d=imDir(P,Math.min(.99,t)), gap=(j%6===5)?1:0; if(gap) continue;
        const sd=(j%2?1:-1), off=(2+r()*1.8)*u*(1-(t-.64)*1.1), bx=p[0]+Math.cos(d+sd*1.57)*off, by=p[1]+Math.sin(d+sd*1.57)*off; m.save(); m.translate(bx,by); m.rotate(d+sd*.45);
        m.shadowColor='rgba(40,30,50,.3)'; m.shadowBlur=1.2*u; m.fillStyle=imPick(r,['#7f7399','#8e83a6','#6f6587','#9a90b0','#857a9c']); m.beginPath(); m.ellipse(0,0,3.6*u,2.2*u,0,0,6.3); m.fill(); m.restore(); } } },.85); }
/* fern frond (green or dried) */
function imFern(X,x0,y0,len,ang,seed,dry){ const {u}=X, r=imRng(seed), c1=dry?'#b49a70':'#97a37c', c2=dry?'#8a6f4b':'#6f7c58';
  imLayer(X,x0+Math.cos(ang)*len*.5,y0+Math.sin(ang)*len*.5,len*.74,4,m=>{ const b=(r()-.5)*.35, P=imBez([x0,y0],[x0+Math.cos(ang+b)*len*.5,y0+Math.sin(ang+b)*len*.5],[x0+Math.cos(ang)*len,y0+Math.sin(ang)*len]);
    imStem(m,P,2.2*u,.8*u,dry?'#8a6d45':'#6e7b52'); for(let i=0;i<30;i++){ const t=.06+i*.031; if(t>1) break; const p=P(t), d=imDir(P,t), l=(46*Math.sin(Math.PI*Math.min(1,t*1.04))+7)*u*(1-t*.3)*(.9+r()*.2);
      for(const sd of [-1,1]){ const la=d+sd*(1.0-t*.25)+(r()-.5)*.08; m.save(); imLeafShadow(m,u,X.sd); imLeaf(m,p[0]+Math.cos(la)*l*.5,p[1]+Math.sin(la)*l*.5,l*.5,Math.max(1.8*u,l*.105),la,imMix(c1,'#fff',r()*.1),c2,u,false); m.restore(); } } },.9); }
/* olive branch: narrow silvery leaves */
function imOlive(X,x0,y0,len,ang,seed){ const {u}=X, r=imRng(seed);
  imLayer(X,x0+Math.cos(ang)*len*.5,y0+Math.sin(ang)*len*.5,len*.74,4,m=>{ const b=(r()-.5)*.4, P=imBez([x0,y0],[x0+Math.cos(ang+b)*len*.5,y0+Math.sin(ang+b)*len*.5],[x0+Math.cos(ang)*len,y0+Math.sin(ang)*len]);
    imStem(m,P,2.6*u,1*u,'#7b7062'); for(let i=0;i<22;i++){ const t=.06+i*.043, p=P(Math.min(1,t)), d=imDir(P,Math.min(.99,t)), sd=i%2?1:-1, l=(50+r()*16)*u*(1-t*.35), la=d+sd*(.5+r()*.3), top=r()<.6;
      m.save(); imLeafShadow(m,u,X.sd); imLeaf(m,p[0]+Math.cos(la)*l*.48,p[1]+Math.sin(la)*l*.48,l*.5,l*.12,la,top?'#8f9a7f':'#bcc3ae',top?'#6b775d':'#9ca48d',u,true); m.restore(); } },.9); }
/* wheat ears */
function imWheat(X,x0,y0,len,ang,seed){ const {u}=X, r=imRng(seed);
  imLayer(X,x0+Math.cos(ang)*len*.5,y0+Math.sin(ang)*len*.5,len*.7,4,m=>{ for(let s=0;s<4;s++){ const a=ang+(s-1.5)*.08+(r()-.5)*.05, l=len*(.85+r()*.15), P=imBez([x0,y0],[x0+Math.cos(a+.06)*l*.5,y0+Math.sin(a+.06)*l*.5],[x0+Math.cos(a)*l,y0+Math.sin(a)*l]);
      imStem(m,P,2.6*u,1.8*u,'#d2b985'); for(let j=0;j<14;j++){ const t=.70+j*.021, p=P(Math.min(1,t)), d=imDir(P,Math.min(.99,t)), sd=j%2?1:-1, gx=p[0]+Math.cos(d+sd*1.2)*3.2*u, gy=p[1]+Math.sin(d+sd*1.2)*3.2*u;
        m.save(); m.translate(gx,gy); m.rotate(d+sd*.32); m.shadowColor='rgba(80,60,30,.3)'; m.shadowBlur=1.5*u; const lg=m.createLinearGradient(0,-3*u,0,3*u); lg.addColorStop(0,'#ead6a6'); lg.addColorStop(1,'#bf9f64'); m.fillStyle=lg; m.beginPath(); m.ellipse(0,0,6*u,3.1*u,0,0,6.3); m.fill(); m.shadowColor='transparent';
        m.strokeStyle='rgba(210,185,130,.75)'; m.lineWidth=.55*u; m.beginPath(); m.moveTo(5*u,0); m.quadraticCurveTo(18*u,-sd*1*u,(30+r()*14)*u,-sd*2.5*u); m.stroke(); m.restore(); } } },.9); }
/* lagurus (bunny tails): soft fluffy heads on thin stems */
function imBunny(X,x0,y0,len,ang,seed,col){ const {u}=X, r=imRng(seed), c=col||(X.look===IM_LOOKS.moody?'#cdbf9f':'#ece3d0');
  imLayer(X,x0+Math.cos(ang)*len*.5,y0+Math.sin(ang)*len*.5,len*.72,3.5,m=>{ const n=3+Math.floor(r()*2); for(let s=0;s<n;s++){ const a=ang+(s-(n-1)/2)*.14+(r()-.5)*.06, l=len*(.72+r()*.28), b=(r()-.5)*.3, P=imBez([x0,y0],[x0+Math.cos(a+b)*l*.5,y0+Math.sin(a+b)*l*.5],[x0+Math.cos(a)*l,y0+Math.sin(a)*l]);
      imStem(m,P,1.5*u,.9*u,imMix(c,'#7a6a4e',.35)); const h=P(1), d=imDir(P,.99), hl=(36+r()*10)*u, hw=(13+r()*3)*u, hx=h[0]+Math.cos(d)*hl*.4, hy=h[1]+Math.sin(d)*hl*.4;
      m.save(); m.translate(hx,hy); m.rotate(d); m.shadowColor='rgba(50,40,25,.22)'; m.shadowBlur=5*u; m.shadowOffsetX=X.sd[0]*2.5*u; m.shadowOffsetY=X.sd[1]*2.5*u;
      const rg=m.createRadialGradient(0,0,0,0,0,hl*.55); rg.addColorStop(0,imRgba(imMix(c,'#9c8a68',.18),.95)); rg.addColorStop(.6,imRgba(c,.55)); rg.addColorStop(1,imRgba(c,0)); m.fillStyle=rg; m.beginPath(); m.ellipse(0,0,hl*.55,hw*.95,0,0,6.3); m.fill(); m.shadowColor='transparent';
      m.lineCap='round'; for(let k=0;k<320;k++){ const t=r()*2-1, ex=Math.sqrt(Math.max(0,1-t*t)), sx=t*hl*.42, sy=(r()-.5)*hw*.9*ex, ta=Math.atan2(sy,sx*.35)+(r()-.5)*.6, hl2=(3+r()*7)*u*(.6+ex*.6);
        m.strokeStyle=imRgba(imMix(c,r()<.6?'#ffffff':'#9c8a68',.25+r()*.2),.18+r()*.3); m.lineWidth=(.3+r()*.35)*u; m.beginPath(); m.moveTo(sx,sy); m.lineTo(sx+Math.cos(ta)*hl2,sy+Math.sin(ta)*hl2); m.stroke(); } m.restore(); } },.8); }
function imRose(X,x,y,R,seed,col){ imBunny(X,x-R*2,y+R,R*7,-.6,seed,col?'#d9c7a8':'#efe6d4'); }
function imSprig(X,kind,x,y,len,ang,seed){ if(kind==='fernd'){ imFern(X,x,y,len,ang,seed,true); return; } const F={eucalyptus:imEucalyptus,gyps:imGyps,lavender:imLavender,wheat:imWheat,fern:imFern,olive:imOlive,bunny:imBunny}[kind]||imEucalyptus; F(X,x,y,len,ang,seed); }

/* ---------- writing tools ---------- */
function imCyl(g,y0,y1,x0,x1,col,L,spec){ const lg=g.createLinearGradient(0,y0,0,y1), f=L[1]<0?1:0; lg.addColorStop(0,imMix(col,'#000',.35)); lg.addColorStop(f?.24:.6,imMix(col,'#fff',spec||.35)); lg.addColorStop(f?.32:.68,imMix(col,'#fff',(spec||.35)*.35)); lg.addColorStop(f?.62:.3,col); lg.addColorStop(1,imMix(col,'#000',.45)); g.fillStyle=lg; g.fillRect(x0,y0,x1-x0,y1-y0); }
function imPen(X,x,y,len,ang,kind){ const {g,u}=X, d=len*.078, body={black:'#151414',gold:'#171615',silver:'#1f2124',navy:'#1b2742',ivory:'#e6dfcf',burgundy:'#4a1a22'}[kind]||'#151414', metal=kind==='silver'?'#c9ccd2':'#caa45a';
  g.save(); g.translate(x,y); g.rotate(ang); const ca=Math.cos(-ang), sa=Math.sin(-ang), ly=X.L[0]*sa+X.L[1]*ca, sp=ly<0?.24:.76;
  const capL=len*.47, x0=-len/2, x1=len/2, xc=x0+capL;
  const shape=()=>{ g.beginPath(); g.moveTo(x0+d*.5,-d/2); g.lineTo(xc,-d/2); g.lineTo(x1-d*.45,-d*.43); g.quadraticCurveTo(x1,-d*.40,x1,0); g.quadraticCurveTo(x1,d*.40,x1-d*.45,d*.43); g.lineTo(xc,d/2); g.lineTo(x0+d*.5,d/2); g.quadraticCurveTo(x0,d/2,x0,0); g.quadraticCurveTo(x0,-d/2,x0+d*.5,-d/2); g.closePath(); };
  imShadow3(X,()=>{ shape(); g.fill(); },d/u*.55,1.05);
  const cyl=(xa,xb,c,shine)=>{ const lg=g.createLinearGradient(0,-d/2,0,d/2), hi=imMix(c,'#ffffff',shine), lo=imMix(c,'#000000',.55);
    lg.addColorStop(0,lo); lg.addColorStop(Math.max(.02,sp-.13),c); lg.addColorStop(sp-.035,imMix(c,'#ffffff',shine*.45)); lg.addColorStop(sp,hi); lg.addColorStop(sp+.035,imMix(c,'#ffffff',shine*.4)); lg.addColorStop(Math.min(.98,sp+.15),c); lg.addColorStop(1-sp<.5?.88:.12,imMix(c,'#ffffff',shine*.18)); lg.addColorStop(1,lo);
    g.fillStyle=lg; g.fillRect(xa,-d,xb-xa,2*d); };
  g.save(); shape(); g.clip(); const dark=imLum(body)<.3; cyl(x0,x1,body,dark?.55:.35);
  cyl(xc-len*.026,xc,metal,.75); cyl(x0,x0+len*.012,metal,.7); cyl(x1-len*.03,x1-len*.018,metal,.7);
  g.fillStyle='rgba(0,0,0,.35)'; g.fillRect(xc,-d/2,.8*u,d); g.restore();
  /* clip on the cap */ const cw=d*.17, cx0=x0+len*.05, cx1=x0+capL*.80;
  imShadowDo(g,1.6*u,'rgba(0,0,0,.5)',X.sd[0]*1.4*u,X.sd[1]*1.4*u,()=>{ g.fillRect(cx0,-cw/2,cx1-cx0,cw); });
  const lc=g.createLinearGradient(0,-cw/2,0,cw/2); lc.addColorStop(0,imMix(metal,'#000',.35)); lc.addColorStop(sp,imMix(metal,'#fff',.55)); lc.addColorStop(1,imMix(metal,'#000',.4)); g.fillStyle=lc; imRR(g,cx0,-cw/2,cx1-cx0,cw,cw*.45); g.fill();
  const rb=g.createRadialGradient(cx1-cw*.2,-cw*.2,0,cx1,0,cw*.75); rb.addColorStop(0,imMix(metal,'#fff',.7)); rb.addColorStop(1,imMix(metal,'#000',.3)); g.fillStyle=rb; g.beginPath(); g.ellipse(cx1,0,cw*.8,cw*.68,0,0,6.3); g.fill();
  g.restore(); }
function imPencil(X,x,y,len,ang,col){ const {g,u}=X, d=len*.06, paint=col||'#2c2c2e', wood='#e3c69c';
  g.save(); g.translate(x,y); g.rotate(ang); const ca=Math.cos(-ang), sa=Math.sin(-ang), ly=X.L[0]*sa+X.L[1]*ca, x0=-len/2, xt=x0+len*.12;
  const shape=()=>{ g.beginPath(); g.moveTo(x0,0); g.lineTo(xt,-d/2); g.lineTo(len/2,-d/2); g.lineTo(len/2,d/2); g.lineTo(xt,d/2); g.closePath(); };
  imShadow3(X,()=>{ shape(); g.fill(); },d/u*.5,1); g.save(); shape(); g.clip();
  const f=ly<0?[.20,0,-.20]:[-.20,0,.18]; [[-d/2,-d/6],[-d/6,d/6],[d/6,d/2]].forEach(([a,b],k)=>{ g.fillStyle=imShade(paint,f[k]); g.fillRect(xt,a,len,b-a); });
  g.fillStyle='rgba(255,255,255,.18)'; g.fillRect(xt,ly<0?-d/6-.5*u:d/6-.5*u,len,1*u);
  const cone=g.createLinearGradient(0,-d/2,0,d/2); cone.addColorStop(0,imShade(wood,ly<0?.18:-.1)); cone.addColorStop(.5,wood); cone.addColorStop(1,imShade(wood,ly<0?-.2:.12)); g.fillStyle=cone;
  g.beginPath(); g.moveTo(x0,0); g.lineTo(xt,-d/2); g.quadraticCurveTo(xt-d*.25,-d/6,xt,0); g.quadraticCurveTo(xt-d*.25,d/6,xt,d/2); g.closePath(); g.fill();
  g.fillStyle='#38383b'; g.beginPath(); g.moveTo(x0,0); g.lineTo(x0+len*.032,-d*.15); g.lineTo(x0+len*.032,d*.15); g.closePath(); g.fill(); g.restore(); g.restore(); }

/* ---------- cup from above ---------- */
function imCup(X,x,y,R,kind,ang){ const {g,u,L}=X, cer={white:'#f4f2ee',coffee:'#f3efe8',stone:'#d9d4cb',dark:'#2b2927'}[kind]||'#f4f2ee', Rs=R, Rc=R*.62, Rl=Rc*.84, liquid=kind==='white'?['#c8a27c','#a77b54']:['#3b2416','#1c100a'];
  /* saucer */ imShadow3(X,()=>{ g.beginPath(); g.arc(x,y,Rs,0,6.3); g.fill(); },6,1);
  let rg=g.createRadialGradient(x+L[0]*Rs*.3,y+L[1]*Rs*.3,Rs*.2,x,y,Rs); rg.addColorStop(0,imShade(cer,.04)); rg.addColorStop(.85,cer); rg.addColorStop(1,imShade(cer,-.14)); g.fillStyle=rg; g.beginPath(); g.arc(x,y,Rs,0,6.3); g.fill();
  g.strokeStyle='rgba(255,255,255,.55)'; g.lineWidth=1.4*u; g.beginPath(); g.arc(x,y,Rs*.93,Math.atan2(L[1],L[0])-1.2,Math.atan2(L[1],L[0])+1.2); g.stroke();
  g.strokeStyle='rgba(0,0,0,.08)'; g.lineWidth=2*u; g.beginPath(); g.arc(x,y,Rs*.70,0,6.3); g.stroke();
  if(kind==='stone'){ const r=imRng(4); for(let i=0;i<160;i++){ const a=r()*6.3, rr=Math.sqrt(r())*Rs; g.fillStyle='rgba(70,60,50,'+(.2+r()*.4)+')'; g.beginPath(); g.arc(x+Math.cos(a)*rr,y+Math.sin(a)*rr,(.4+r()*.8)*u,0,6.3); g.fill(); } }
  /* handle */ const ha=ang==null?.6:ang; g.save(); g.translate(x,y); g.rotate(ha); imShadow3(X,()=>{ imRR(g,Rc*.85,-Rc*.16,Rc*.62,Rc*.32,Rc*.16); g.fill(); },18,.7); const hg=g.createLinearGradient(0,-Rc*.16,0,Rc*.16); hg.addColorStop(0,imShade(cer,.06)); hg.addColorStop(1,imShade(cer,-.16)); g.fillStyle=hg; imRR(g,Rc*.85,-Rc*.16,Rc*.62,Rc*.32,Rc*.16); g.fill(); g.restore();
  /* cup */ imShadow3(X,()=>{ g.beginPath(); g.arc(x,y,Rc,0,6.3); g.fill(); },22,1.1);
  rg=g.createRadialGradient(x-L[0]*Rc*.3,y-L[1]*Rc*.3,Rc*.5,x,y,Rc); rg.addColorStop(0,cer); rg.addColorStop(1,imShade(cer,-.18)); g.fillStyle=rg; g.beginPath(); g.arc(x,y,Rc,0,6.3); g.fill();
  rg=g.createRadialGradient(x+L[0]*Rc*.2,y+L[1]*Rc*.2,Rl*.6,x,y,Rc*.92); rg.addColorStop(0,imShade(cer,-.25)); rg.addColorStop(1,imShade(cer,-.05)); g.fillStyle=rg; g.beginPath(); g.arc(x,y,Rc*.9,0,6.3); g.fill();
  rg=g.createRadialGradient(x,y,0,x,y,Rl); rg.addColorStop(0,liquid[1]); rg.addColorStop(.82,liquid[0]); rg.addColorStop(1,imMix(liquid[0],'#c89a6a',.6)); g.fillStyle=rg; g.beginPath(); g.arc(x+L[0]*Rc*.04,y+L[1]*Rc*.04,Rl,0,6.3); g.fill();
  if(kind!=='white'){ g.strokeStyle='rgba(190,140,90,.55)'; g.lineWidth=1.6*u; g.beginPath(); g.arc(x+L[0]*Rc*.04,y+L[1]*Rc*.04,Rl*.96,0,6.3); g.stroke(); }
  else { /* latte heart */ const hx=x+L[0]*Rc*.04, hy=y+L[1]*Rc*.04, k=Rl*.5, a=(ang||0)+1.2; g.save(); g.translate(hx,hy); g.rotate(a); g.shadowColor='rgba(250,240,225,.9)'; g.shadowBlur=k*.25; g.fillStyle='rgba(248,240,226,.92)';
    g.beginPath(); g.moveTo(0,k*.75); g.bezierCurveTo(-k*1.1,k*.05,-k*.85,-k*.9,-k*.1,-k*.55); g.quadraticCurveTo(0,-k*.45,k*.1,-k*.55); g.bezierCurveTo(k*.85,-k*.9,k*1.1,k*.05,0,k*.75); g.fill(); g.restore();
    const rg=g.createRadialGradient(hx,hy,Rl*.7,hx,hy,Rl); rg.addColorStop(0,'rgba(240,225,200,0)'); rg.addColorStop(1,'rgba(240,225,200,.55)'); g.fillStyle=rg; g.beginPath(); g.arc(hx,hy,Rl,0,6.3); g.fill(); }
  g.save(); g.globalCompositeOperation='screen'; g.translate(x+L[0]*Rl*.35,y+L[1]*Rl*.35); g.rotate(Math.atan2(L[1],L[0])); const sg=g.createRadialGradient(0,0,0,0,0,Rl*.35); sg.addColorStop(0,'rgba(255,250,240,.38)'); sg.addColorStop(1,'rgba(255,250,240,0)'); g.fillStyle=sg; g.scale(.55,1); g.beginPath(); g.arc(0,0,Rl*.35,0,6.3); g.fill(); g.restore();
  g.strokeStyle='rgba(255,255,255,.7)'; g.lineWidth=1.3*u; g.beginPath(); g.arc(x,y,Rc*.985,Math.atan2(L[1],L[0])-1,Math.atan2(L[1],L[0])+1); g.stroke(); }
/* tealight in glass, burning */
function imCandle(X,x,y,R){ const {g,u}=X; imShadow3(X,()=>{ g.beginPath(); g.arc(x,y,R,0,6.3); g.fill(); },10,.8);
  let rg=g.createRadialGradient(x,y,R*.6,x,y,R); rg.addColorStop(0,'rgba(255,240,220,.15)'); rg.addColorStop(.8,'rgba(255,255,255,.28)'); rg.addColorStop(1,'rgba(120,110,100,.45)'); g.fillStyle=rg; g.beginPath(); g.arc(x,y,R,0,6.3); g.fill();
  const r2=R*.72; rg=g.createLinearGradient(x-r2,y-r2,x+r2,y+r2); rg.addColorStop(0,'#e9e9ec'); rg.addColorStop(.5,'#8d8e93'); rg.addColorStop(1,'#d5d6da'); g.fillStyle=rg; g.beginPath(); g.arc(x,y,r2,0,6.3); g.fill();
  rg=g.createRadialGradient(x,y,0,x,y,r2*.92); rg.addColorStop(0,'#fff6de'); rg.addColorStop(.6,'#f1e2c2'); rg.addColorStop(1,'#d9c6a2'); g.fillStyle=rg; g.beginPath(); g.arc(x,y,r2*.9,0,6.3); g.fill();
  g.fillStyle='#2a2522'; g.beginPath(); g.arc(x,y,R*.035,0,6.3); g.fill();
  g.save(); g.globalCompositeOperation='screen'; rg=g.createRadialGradient(x,y,0,x,y,R*3.2); rg.addColorStop(0,'rgba(255,214,150,.75)'); rg.addColorStop(.18,'rgba(255,190,110,.35)'); rg.addColorStop(1,'rgba(255,160,80,0)'); g.fillStyle=rg; g.fillRect(x-R*3.2,y-R*3.2,R*6.4,R*6.4);
  rg=g.createRadialGradient(x,y-R*.05,0,x,y-R*.05,R*.22); rg.addColorStop(0,'rgba(255,255,245,1)'); rg.addColorStop(.5,'rgba(255,230,170,.9)'); rg.addColorStop(1,'rgba(255,170,80,0)'); g.fillStyle=rg; g.beginPath(); g.ellipse(x,y-R*.05,R*.14,R*.22,0,0,6.3); g.fill(); g.restore();
  g.strokeStyle='rgba(255,255,255,.65)'; g.lineWidth=1.2*u; g.beginPath(); g.arc(x,y,R*.97,-2.6,-1.4); g.stroke(); }
/* apricot: velvety skin, sun blush, suture groove */
function imApricot(X,x,y,R,seed,leaf){ const {g,u,L}=X, r=imRng(seed), rot=r()*6.3;
  imShadow3(X,()=>{ g.beginPath(); g.ellipse(x,y,R,R*.93,rot,0,6.3); g.fill(); },R/u*.6,1.15);
  g.save(); g.beginPath(); g.ellipse(x,y,R,R*.93,rot,0,6.3); g.clip();
  let rg=g.createRadialGradient(x+L[0]*R*.3,y+L[1]*R*.3,R*.1,x,y,R*1.05); rg.addColorStop(0,'#f6c98a'); rg.addColorStop(.6,'#eea862'); rg.addColorStop(1,'#c9773c'); g.fillStyle=rg; g.fillRect(x-R,y-R,R*2,R*2);
  const ba=Math.atan2(L[1],L[0])+(r()-.5)*1.5; rg=g.createRadialGradient(x+Math.cos(ba)*R*.4,y+Math.sin(ba)*R*.4,0,x+Math.cos(ba)*R*.4,y+Math.sin(ba)*R*.4,R*.95); rg.addColorStop(0,'rgba(214,92,52,.55)'); rg.addColorStop(.6,'rgba(214,92,52,.18)'); rg.addColorStop(1,'rgba(214,92,52,0)'); g.fillStyle=rg; g.fillRect(x-R,y-R,R*2,R*2);
  for(let i=0;i<110;i++){ const a=r()*6.3, rr=Math.sqrt(r())*R; g.fillStyle='rgba(160,70,35,'+(.15+r()*.25)+')'; g.beginPath(); g.arc(x+Math.cos(a)*rr,y+Math.sin(a)*rr,(.35+r()*.6)*u,0,6.3); g.fill(); }
  g.save(); g.translate(x,y); g.rotate(rot); g.strokeStyle='rgba(140,62,28,.28)'; g.lineWidth=3*u; g.beginPath(); g.moveTo(-R*.15,-R); g.bezierCurveTo(R*.3,-R*.35,R*.28,R*.35,-R*.05,R); g.stroke(); g.strokeStyle='rgba(255,230,190,.18)'; g.lineWidth=1.5*u; g.beginPath(); g.moveTo(-R*.12+1.5*u,-R); g.bezierCurveTo(R*.33,-R*.35,R*.31,R*.35,-R*.02,R); g.stroke(); g.restore();
  imGrain(g,x+R*2,y+R*2,.18,'soft-light',7,u*.5); rg=g.createRadialGradient(x+L[0]*R*.5,y+L[1]*R*.5,0,x+L[0]*R*.5,y+L[1]*R*.5,R*.55); rg.addColorStop(0,'rgba(255,236,210,.22)'); rg.addColorStop(1,'rgba(255,236,210,0)'); g.fillStyle=rg; g.fillRect(x-R,y-R,R*2,R*2);
  const sh=g.createRadialGradient(x-L[0]*R*.2,y-L[1]*R*.2,R*.55,x,y,R*1.02); sh.addColorStop(0,'rgba(0,0,0,0)'); sh.addColorStop(1,'rgba(90,35,10,.30)'); g.fillStyle=sh; g.fillRect(x-R,y-R,R*2,R*2); g.restore();
  const sx=x+Math.cos(rot-1.57)*R*.85, sy=y+Math.sin(rot-1.57)*R*.85; g.fillStyle='rgba(80,45,20,.75)'; g.beginPath(); g.ellipse(sx,sy,R*.08,R*.06,rot,0,6.3); g.fill();
  if(leaf) imLayer(X,sx,sy,R*1.4,5,m=>{ imLeaf(m,sx+Math.cos(rot-2)*R*.55,sy+Math.sin(rot-2)*R*.55,R*.55,R*.22,rot-2,'#8d9a6a','#66734a',u,true); },.8); }
/* ---------- sealing wax stick, wooden stamp, confetti ---------- */
function imWaxStick(X,x,y,len,ang,col){ const {g,u}=X, d=len*.11; g.save(); g.translate(x,y); g.rotate(ang); const c=Math.cos(-ang), s=Math.sin(-ang), Lr=[X.L[0]*c-X.L[1]*s,X.L[0]*s+X.L[1]*c];
  imShadow3(X,()=>{ imRR(g,-len/2,-d/2,len,d,d*.18); g.fill(); },5,1); g.save(); imRR(g,-len/2,-d/2,len,d,d*.18); g.clip(); imCyl(g,-d/2,d/2,-len/2,len/2,col,Lr,.32);
  g.fillStyle=imMix(col,'#000',.35); g.fillRect(-len/2,-d/2,len*.03,d); imGrain(g,len,d,.18,'overlay',3,.5); g.restore();
  g.strokeStyle='#e8e0d0'; g.lineWidth=1.4*u; g.beginPath(); g.moveTo(len/2,0); g.quadraticCurveTo(len/2+6*u,-2*u,len/2+10*u,1*u); g.stroke(); g.restore(); }
function imStampBlock(X,x,y,w,ink,art,rot){ const {g,u}=X, h=w*.82, wood='#c49a68', r=imRng(8); rot=rot||0;
  g.save(); g.translate(x,y); g.rotate(rot); imShadow3(X,()=>{ imRR(g,-w/2,-h/2,w,h,w*.06); g.fill(); },w/u*.5,1.1);
  const lg=g.createLinearGradient(-w/2,0,w/2,0); lg.addColorStop(0,imShade(wood,-.06)); lg.addColorStop(.5,wood); lg.addColorStop(1,imShade(wood,-.1)); g.fillStyle=lg; imRR(g,-w/2,-h/2,w,h,w*.06); g.fill();
  g.save(); imRR(g,-w/2,-h/2,w,h,w*.06); g.clip(); for(let i=0;i<34;i++){ const yy=-h/2+r()*h; g.strokeStyle='rgba(110,70,35,'+(.06+r()*.12)+')'; g.lineWidth=(.5+r()*1.2)*u; g.beginPath(); g.moveTo(-w/2,yy); g.bezierCurveTo(-w*.2,yy+(r()-.5)*6*u,w*.2,yy+(r()-.5)*6*u,w/2,yy+(r()-.5)*4*u); g.stroke(); } imGrain(g,w,h,.15,'overlay',4,u*.6); g.restore();
  const bv=w*.07; g.fillStyle='rgba(255,240,215,.28)'; g.beginPath(); g.moveTo(-w/2+bv*.4,-h/2+bv*.4); g.lineTo(w/2-bv*.4,-h/2+bv*.4); g.lineTo(w/2-bv,-h/2+bv); g.lineTo(-w/2+bv,-h/2+bv); g.closePath(); g.fill();
  g.fillStyle='rgba(60,35,15,.22)'; g.beginPath(); g.moveTo(-w/2+bv*.4,h/2-bv*.4); g.lineTo(w/2-bv*.4,h/2-bv*.4); g.lineTo(w/2-bv,h/2-bv); g.lineTo(-w/2+bv,h/2-bv); g.closePath(); g.fill();
  if(art){ const aw=art.width||art.naturalWidth, ah=art.height||art.naturalHeight, [iw,ih]=imFit(w*.62,h*.62,aw/ah), t=imC(iw,ih), tg=t.getContext('2d'); tg.drawImage(art,0,0,iw,ih); tg.globalCompositeOperation='source-in'; tg.fillStyle='rgba(30,22,16,.82)'; tg.fillRect(0,0,iw,ih);
    g.globalCompositeOperation='multiply'; g.drawImage(t,-iw/2,-ih/2); g.globalCompositeOperation='source-over'; }
  g.restore(); }
function imInkPad(X,x,y,w,ink,rot){ const {g,u}=X, h=w*.68; g.save(); g.translate(x,y); g.rotate(rot||0); imShadow3(X,()=>{ imRR(g,-w/2,-h/2,w,h,w*.08); g.fill(); },6,1);
  const mg=g.createLinearGradient(-w/2,-h/2,w/2,h/2); mg.addColorStop(0,'#d9dadc'); mg.addColorStop(.5,'#9a9ca0'); mg.addColorStop(1,'#c9cacd'); g.fillStyle=mg; imRR(g,-w/2,-h/2,w,h,w*.08); g.fill();
  const p=w*.07, fg=g.createRadialGradient(-w*.15,-h*.15,0,0,0,w*.6); fg.addColorStop(0,imMix(ink,'#fff',.12)); fg.addColorStop(1,imMix(ink,'#000',.35)); g.fillStyle=fg; imRR(g,-w/2+p,-h/2+p,w-2*p,h-2*p,w*.04); g.fill(); imGrain(g,w,h,.25,'overlay',6,u*.6);
  g.strokeStyle='rgba(255,255,255,.55)'; g.lineWidth=1*u; imRR(g,-w/2+.5*u,-h/2+.5*u,w-u,h-u,w*.08); g.stroke(); g.restore(); }
function imConfetti(X,n,cols,box){ const {g,u}=X, r=imRng(X.seed+31); for(let i=0;i<n;i++){ const x=box[0]+r()*box[2], y=box[1]+r()*box[3], rr=(3+r()*4)*u, c=imPick(r,cols);
    imShadow3(X,()=>{ g.beginPath(); g.arc(x,y,rr,0,6.3); g.fill(); },.4,.6); g.fillStyle=c; g.beginPath(); g.arc(x,y,rr,0,6.3); g.fill(); g.fillStyle='rgba(255,255,255,.25)'; g.beginPath(); g.arc(x-rr*.25,y-rr*.25,rr*.5,0,6.3); g.fill(); } }
/* open gift box seen from above: rim, inner walls in slight perspective, shaded floor; returns floor rect for contents */
function imBox(X,cx,cy,w,h,o){ const {g,u,L}=X, col=o.col||'#b98f63', wall=o.wall||10*u, dep=o.depth||48*u, rot=o.rot||0;
  g.save(); g.translate(cx,cy); g.rotate(rot); imShadow3(X,()=>{ g.fillRect(-w/2,-h/2,w,h); },o.lift||18,1.15);
  const rim=[[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]], inn=[[-w/2+wall,-h/2+wall],[w/2-wall,-h/2+wall],[w/2-wall,h/2-wall],[-w/2+wall,h/2-wall]];
  g.fillStyle=imShade(col,.05); imPoly(g,rim); g.fill(); imKraftClip(g,rim,col,u);
  const k=dep*.42, fl=[[inn[0][0]+k,inn[0][1]+k],[inn[1][0]-k,inn[1][1]+k],[inn[2][0]-k,inn[2][1]-k],[inn[3][0]+k,inn[3][1]-k]];
  const walls=[[inn[0],inn[1],fl[1],fl[0],[0,1]],[inn[1],inn[2],fl[2],fl[1],[-1,0]],[inn[2],inn[3],fl[3],fl[2],[0,-1]],[inn[3],inn[0],fl[0],fl[3],[1,0]]];
  const c=Math.cos(-rot), s=Math.sin(-rot), Lr=[L[0]*c-L[1]*s,L[0]*s+L[1]*c];
  walls.forEach(([a,b,c2,d,n])=>{ const f=-(n[0]*Lr[0]+n[1]*Lr[1]); g.fillStyle=imShade(col,f>0?.04+f*.14:-.10+f*.22); imPoly(g,[a,b,c2,d]); g.fill(); });
  g.fillStyle=imShade(col,-.10); imPoly(g,fl); g.fill(); imKraftClip(g,fl,imShade(col,-.1),u);
  g.save(); imPoly(g,fl); g.clip(); imShadowDo(g,dep*.5,'rgba(30,18,8,.55)',X.sd[0]*dep*.35,X.sd[1]*dep*.35,()=>{ g.beginPath(); g.rect(-w,-h,w*2,h*2); imPoly(g,inn.slice().reverse()); g.fill('evenodd'); }); g.restore();
  g.strokeStyle='rgba(255,245,230,.45)'; g.lineWidth=1*u; imPoly(g,inn); g.stroke(); imEdges(X,rim,1.2); g.restore();
  const T=imRotPt(cx,cy,rot), m=T(0,0); return {x:m[0],y:m[1],w:fl[1][0]-fl[0][0],h:fl[3][1]-fl[0][1]}; }
function imBoxLid(X,cx,cy,w,h,rot,col){ const {u}=X; imSheet(X,null,{cx,cy,w,h,rot,paper:imShade(col,.06),lift:16,radius:1.5,shadow:1.1,after:(g,w2,h2)=>{ imKraftClip(g,[[-w2/2,-h2/2],[w2/2,-h2/2],[w2/2,h2/2],[-w2/2,h2/2]],imShade(col,.06),u); g.strokeStyle='rgba(0,0,0,.08)'; g.lineWidth=1.2*u; g.strokeRect(-w2/2+7*u,-h2/2+7*u,w2-14*u,h2-14*u); }}); }
function imKraftClip(g,pts,col,u){ const r=imRng(5); g.save(); imPoly(g,pts); g.clip(); const xs=pts.map(p=>p[0]), ys=pts.map(p=>p[1]), x0=Math.min(...xs), y0=Math.min(...ys), w=Math.max(...xs)-x0, h=Math.max(...ys)-y0;
  for(let i=0;i<w*h/300;i++){ g.strokeStyle=imRgba(r()<.5?imMix(col,'#fff',.3):imMix(col,'#000',.3),.12); g.lineWidth=(.4+r()*.6)*u; const x=x0+r()*w, y=y0+r()*h, a=r()*6.3, l=(3+r()*10)*u; g.beginPath(); g.moveTo(x,y); g.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l); g.stroke(); } g.restore(); }
/* ---------- p4: render pipeline — camera warp + depth of field, film grade, generated paper goods ---------- */
let IM_FONTS=null;
function imFontsReady(){ if(IM_FONTS) return IM_FONTS; const L=['600 40px "Cormorant Garamond"','italic 500 40px "Cormorant Garamond"','400 40px "Cormorant Garamond"','italic 400 40px "Playfair Display"','400 40px "Playfair Display"','500 40px "Montserrat"','600 40px "Montserrat"','700 40px "PT Mono"','400 40px "Caveat"','400 40px "Marck Script"','400 40px "Great Vibes"'];
  IM_FONTS=Promise.race([Promise.all(L.map(f=>document.fonts&&document.fonts.load?document.fonts.load(f,'АБВ abc TH').catch(()=>{}):0)),new Promise(r=>setTimeout(r,2500))]); return IM_FONTS; }

/* ---------- projective warp of an image into a quad (triangle mesh; Safari-safe) ---------- */
function imTri(g,img,s,d){ const cx=(d[0][0]+d[1][0]+d[2][0])/3, cy=(d[0][1]+d[1][1]+d[2][1])/3, ex=p=>{ const dx=p[0]-cx, dy=p[1]-cy, l=Math.hypot(dx,dy)||1; return [p[0]+dx/l*.7,p[1]+dy/l*.7]; };
  const [x0,y0]=s[0],[x1,y1]=s[1],[x2,y2]=s[2], den=(x1-x0)*(y2-y0)-(x2-x0)*(y1-y0); if(!den) return;
  const a=((d[1][0]-d[0][0])*(y2-y0)-(d[2][0]-d[0][0])*(y1-y0))/den, c=((d[2][0]-d[0][0])*(x1-x0)-(d[1][0]-d[0][0])*(x2-x0))/den;
  const b=((d[1][1]-d[0][1])*(y2-y0)-(d[2][1]-d[0][1])*(y1-y0))/den, dd=((d[2][1]-d[0][1])*(x1-x0)-(d[1][1]-d[0][1])*(x2-x0))/den;
  const m=g.getTransform(); g.save(); g.beginPath(); const e=d.map(ex); g.moveTo(e[0][0],e[0][1]); g.lineTo(e[1][0],e[1][1]); g.lineTo(e[2][0],e[2][1]); g.closePath(); g.clip();
  g.transform(a,b,c,dd,d[0][0]-a*x0-c*y0,d[0][1]-b*x0-dd*y0); g.drawImage(img,0,0); g.restore(); void m; }
function imWarpQuad(g,img,Q,N){ N=N||10; const iw=img.width||img.naturalWidth, ih=img.height||img.naturalHeight, H=imHomog([[0,0],[1,0],[1,1],[0,1]],Q), P=(u,v)=>imApplyH(H,u,v);
  for(let j=0;j<N;j++) for(let i=0;i<N;i++){ const u0=i/N, u1=(i+1)/N, v0=j/N, v1=(j+1)/N, s=[[u0*iw,v0*ih],[u1*iw,v0*ih],[u1*iw,v1*ih],[u0*iw,v1*ih]], d=[P(u0,v0),P(u1,v0),P(u1,v1),P(u0,v1)];
    imTri(g,img,[s[0],s[1],s[2]],[d[0],d[1],d[2]]); imTri(g,img,[s[0],s[2],s[3]],[d[0],d[2],d[3]]); } }

/* ---------- camera: tilted pinhole looking at the table plane ---------- */
function imCam(W,H,cam){ const th=imDeg(cam.tilt||0), f=(cam.fov||1.35)*Math.max(W,H), D=f, ox=W/2, oy=H/2, yaw=imDeg(cam.yaw||0), cY=Math.cos(yaw), sY=Math.sin(yaw), z=cam.zoom||1, fx=cam.fx==null?.5:cam.fx, fy=cam.fy==null?.5:cam.fy, ct=Math.cos(th), st_=Math.sin(th);
  const inv=(x,y)=>{ const dy=y-oy, Yp=dy*D/(f*ct+dy*st_), w=D-st_*Yp, Xp=(x-ox)*w/f; return [W*fx+(Xp*cY+Yp*sY)/z,H*fy+(-Xp*sY+Yp*cY)/z,w]; };
  return {inv,f,D,z,th}; }
/* render the scene on a big plane, then look at it through the camera with depth of field (row-wise, allocation-free) */
async function imShoot(W,H,cam,draw){ const C=imCam(W,H,cam), cs=[[0,0],[W,0],[W,H],[0,H],[W/2,0],[W/2,H],[0,H/2],[W,H/2]].map(([x,y])=>C.inv(x,y));
  const xs=cs.map(p=>p[0]), ys=cs.map(p=>p[1]), m=40*W/1080, bx0=Math.min(...xs)-m, by0=Math.min(...ys)-m, bw=Math.max(...xs)+m-bx0, bh=Math.max(...ys)+m-by0;
  const nearW=Math.min(...cs.map(p=>p[2])); let ps=Math.min(1.2,C.f/nearW)*C.z; const budget=W>1500?10e6:4.2e6; if(bw*bh*ps*ps>budget) ps=Math.sqrt(budget/(bw*bh));
  const pc=imC(bw*ps,bh*ps), pg=imCtx(pc); await draw(pg,{bx0,by0,bw,bh,ps}); await imTick();
  const pw=pc.width, ph=pc.height, PD=pg.getImageData(0,0,pw,ph).data, A=(cam.dof==null?16:cam.dof)*W/1080;
  const r1=Math.max(2,3.2*ps*W/1080), r2=Math.max(5,10*ps*W/1080), b1=imBlur(pc,r1,true), b2=imBlur(pc,r2,true);
  const L1={d:b1.getContext('2d').getImageData(0,0,b1.width,b1.height).data,w:b1.width,h:b1.height,k:b1.width/pw}, L2={d:b2.getContext('2d').getImageData(0,0,b2.width,b2.height).data,w:b2.width,h:b2.height,k:b2.width/pw}, L0={d:PD,w:pw,h:ph,k:1};
  const out=imC(W,H), og=out.getContext('2d'), od=og.createImageData(W,H), O=od.data, ff=cam.focus==null?0:cam.focus*H, wF=C.inv(W/2,H/2+ff)[2];
  const th=C.th, ct=Math.cos(th), st_=Math.sin(th), f=C.f, D=C.D, yaw=imDeg(cam.yaw||0), cY=Math.cos(yaw), sY=Math.sin(yaw), z=C.z, FX=W*(cam.fx==null?.5:cam.fx), FY=H*(cam.fy==null?.5:cam.fy);
  for(let y=0;y<H;y++){ const dy=y+.5-H/2, Yp=dy*D/(f*ct+dy*st_), w=D-st_*Yp, kx=w/f, coc=A*Math.abs(w-wF)/w, rp=coc*w/f*ps/z;
    let La,Lb,t; if(rp<r1){ La=L0; Lb=L1; t=rp/r1; } else { La=L1; Lb=L2; t=imClamp((rp-r1)/(r2-r1),0,1); }
    const wa=1-t, ax=FX+(Yp*sY)/z, ay=FY+(Yp*cY)/z, bxx=cY*kx/z, byy=-sY*kx/z, useA=wa>.002, useB=t>.002;
    const Ad=La.d, Aw=La.w, Ah=La.h, Ak=La.k*ps, Bd=Lb.d, Bw=Lb.w, Bh=Lb.h, Bk=Lb.k*ps, Amx=Aw-1.001, Amy=Ah-1.001, Bmx=Bw-1.001, Bmy=Bh-1.001;
    let o=y*W*4;
    for(let x=0;x<W;x++,o+=4){ const Xp=x+.5-W/2, sx=ax+Xp*bxx-bx0, sy=ay+Xp*byy-by0; let r=0,g=0,b=0;
      if(useA){ let X=sx*Ak-.5, Y=sy*Ak-.5; if(X<0) X=0; else if(X>Amx) X=Amx; if(Y<0) Y=0; else if(Y>Amy) Y=Amy; const x0=X|0, y0=Y|0, fx=X-x0, fy=Y-y0, i=(y0*Aw+x0)*4, j=i+Aw*4;
        const w01=fy*wa, w00=wa-w01, w11=fx*w01, w10=fx*w00; const a00=w00-w10, a01=w01-w11; r+=Ad[i]*a00+Ad[i+4]*w10+Ad[j]*a01+Ad[j+4]*w11; g+=Ad[i+1]*a00+Ad[i+5]*w10+Ad[j+1]*a01+Ad[j+5]*w11; b+=Ad[i+2]*a00+Ad[i+6]*w10+Ad[j+2]*a01+Ad[j+6]*w11; }
      if(useB){ let X=sx*Bk-.5, Y=sy*Bk-.5; if(X<0) X=0; else if(X>Bmx) X=Bmx; if(Y<0) Y=0; else if(Y>Bmy) Y=Bmy; const x0=X|0, y0=Y|0, fx=X-x0, fy=Y-y0, i=(y0*Bw+x0)*4, j=i+Bw*4;
        const w01=fy*t, w00=t-w01, w11=fx*w01, w10=fx*w00; const a00=w00-w10, a01=w01-w11; r+=Bd[i]*a00+Bd[i+4]*w10+Bd[j]*a01+Bd[j+4]*w11; g+=Bd[i+1]*a00+Bd[i+5]*w10+Bd[j+1]*a01+Bd[j+5]*w11; b+=Bd[i+2]*a00+Bd[i+6]*w10+Bd[j+2]*a01+Bd[j+6]*w11; }
      O[o]=r; O[o+1]=g; O[o+2]=b; O[o+3]=255; }
    if((y&255)===255) await imTick(); }
  og.putImageData(od,0,0); return out; }

/* ---------- film grade ---------- */
function imCurveFn(pts){ const P=(pts&&pts.length>1?pts:[[0,0],[1,1]]).slice().sort((a,b)=>a[0]-b[0]), n=P.length, dx=[], dy=[], m=[];
  for(let i=0;i<n-1;i++){ dx.push(P[i+1][0]-P[i][0]); dy.push((P[i+1][1]-P[i][1])/(dx[i]||1e-6)); }
  m[0]=dy[0]; m[n-1]=dy[n-2]; for(let i=1;i<n-1;i++) m[i]=dy[i-1]*dy[i]<=0?0:(dy[i-1]+dy[i])/2;
  return x=>{ if(x<=P[0][0]) return P[0][1]; if(x>=P[n-1][0]) return P[n-1][1]; let i=0; while(x>P[i+1][0]) i++; const h=dx[i], t=(x-P[i][0])/h, t2=t*t, t3=t2*t;
    return (2*t3-3*t2+1)*P[i][1]+(t3-2*t2+t)*h*m[i]+(-2*t3+3*t2)*P[i+1][1]+(t3-t2)*h*m[i+1]; }; }
function imGradeCanvas(cv,look,o){ o=o||{}; const G=Object.assign({temp:0,tint:0,contrast:0,lift:0,fade:0,sat:0,grain:0,vignette:0,halation:0,bloom:0},imLook(look).grade,o.override||{}), W=cv.width, H=cv.height, g=cv.getContext('2d'), str=o.strength==null?1:o.strength;
  if((G.halation>0||G.bloom>0)&&str>0){ const sm=imBlur(cv,Math.max(W,H)*.014,true), hl=imC(sm.width,sm.height), hg=hl.getContext('2d'); hg.drawImage(sm,0,0);
    const d=hg.getImageData(0,0,hl.width,hl.height), D=d.data; for(let i=0;i<D.length;i+=4){ const l=(.2126*D[i]+.7152*D[i+1]+.0722*D[i+2])/255, k=imSmooth(.62,.95,l); D[i]*=k; D[i+1]*=k; D[i+2]*=k; } hg.putImageData(d,0,0);
    g.save(); g.globalCompositeOperation='screen'; if(G.bloom>0){ g.globalAlpha=G.bloom*str; g.drawImage(hl,0,0,W,H); }
    if(G.halation>0){ hg.globalCompositeOperation='multiply'; hg.fillStyle='#ff5a2a'; hg.fillRect(0,0,hl.width,hl.height); const h2=imBlur(hl,Math.max(1.5,hl.width*.006)); g.globalAlpha=G.halation*.7*str; g.drawImage(h2,0,0,W,H); } g.restore(); }
  const cf=imCurveFn(G.curve), t=G.temp*str, ti=G.tint*str; let gr=1+.11*t+.03*ti, gg=1-.06*ti+.012*t, gb=1-.14*t+.03*ti; const nrm=.2126*gr+.7152*gg+.0722*gb; gr/=nrm; gg/=nrm; gb/=nrm;
  const con=G.contrast*str, lift=G.lift*str, fade=G.fade*str, LUT=[new Uint8ClampedArray(256),new Uint8ClampedArray(256),new Uint8ClampedArray(256)];
  [gr,gg,gb].forEach((k,c)=>{ for(let i=0;i<256;i++){ let y=imClamp(i/255*k,0,1); y=str>=1?cf(y):y+(cf(y)-y)*str; if(con>0) y=y+(y*y*(3-2*y)-y)*con*1.3; else y=.5+(y-.5)*(1+con*.7); y=lift+y*(1-lift); y=y+(.52-y)*fade*.5; LUT[c][i]=Math.round(imClamp(y,0,1)*255); } });
  const sat=1+G.sat*str, sp=G.split||{amt:0}, sa=(sp.amt||0)*str, sh=imHex(sp.sh||'#808080'), hi=imHex(sp.hi||'#808080'), shL=.2126*sh[0]+.7152*sh[1]+.0722*sh[2], hiL=.2126*hi[0]+.7152*hi[1]+.0722*hi[2];
  const sR=sh[0]-shL, sG=sh[1]-shL, sB=sh[2]-shL, hR=hi[0]-hiL, hG=hi[1]-hiL, hB=hi[2]-hiL;
  const grain=G.grain*str*255, gt=imGrainTile((o.seed||1)%13+2,256).getContext('2d').getImageData(0,0,256,256).data, gs=Math.max(1,Math.round(W/1080)), vig=G.vignette*str, cx=W/2, cy=H/2, R2=cx*cx+cy*cy;
  const id=g.getImageData(0,0,W,H), D=id.data;
  for(let y=0;y<H;y++){ const dy=(y-cy)*(y-cy); for(let x=0;x<W;x++){ const i=(y*W+x)*4; let r=LUT[0][D[i]], gg_=LUT[1][D[i+1]], b=LUT[2][D[i+2]];
      const L=.2126*r+.7152*gg_+.0722*b; if(sat!==1){ r=L+(r-L)*sat; gg_=L+(gg_-L)*sat; b=L+(b-L)*sat; }
      if(sa){ const l=L/255, a=(1-l)*(1-l)*sa, c=l*l*sa; r+=sR*a+hR*c; gg_+=sG*a+hG*c; b+=sB*a+hB*c; }
      if(grain){ const n=(gt[(((y/gs)|0)&255)*1024+(((x/gs)|0)&255)*4]-128)/128, l=L/255, k=n*grain*(.35+2.2*l*(1-l)); r+=k; gg_+=k; b+=k; }
      if(vig){ const d=((x-cx)*(x-cx)+dy)/R2, v=1-vig*imSmooth(.28,1.05,d); r*=v; gg_*=v; b*=v; }
      D[i]=r; D[i+1]=gg_; D[i+2]=b; } }
  g.putImageData(id,0,0); return cv; }

/* ---------- generated paper goods (when the owner has no matching design) ---------- */
function imTHCanvas(ink,S,mark){ const m=imMarkCanvas(mark||'TH',S), c=imC(S,S), g=c.getContext('2d'); g.drawImage(m,0,0); g.globalCompositeOperation='source-in'; g.fillStyle=ink; g.fillRect(0,0,S,S); return c; }
function imWrap(g,text,maxW){ const raw=String(text).split(/\s+/).filter(Boolean), words=[]; for(let i=0;i<raw.length;i++){ if(raw[i].replace(/[«»"']/g,'').length<=2&&i<raw.length-1){ raw[i+1]=raw[i]+'\u00a0'+raw[i+1]; continue; } words.push(raw[i]); } const lines=[]; let cur=''; words.forEach(w=>{ const t=cur?cur+' '+w:w; if(g.measureText(t).width>maxW&&cur){ lines.push(cur); cur=w; } else cur=t; }); if(cur) lines.push(cur); return lines; }
function imOnCard(img,a,paper,fill){ const W=1600, H=Math.round(W/a), c=imC(W,H), g=imCtx(c); g.fillStyle=paper||'#fbf9f4'; g.fillRect(0,0,W,H);
  const iw=img.width||img.naturalWidth, ih=img.height||img.naturalHeight, [w,h]=imFit(W*(fill||.62),H*(fill||.62),iw/ih); g.drawImage(img,(W-w)/2,(H-h)/2,w,h); return c; }
function imPostcardBack(a,look,brand){ const W=1600, H=Math.round(W/a), c=imC(W,H), g=imCtx(c), ink=imMix(look.ink,'#ffffff',.25); g.fillStyle='#fbf9f4'; g.fillRect(0,0,W,H);
  g.strokeStyle=imRgba(ink,.55); g.lineWidth=3; g.beginPath(); g.moveTo(W*.55,H*.12); g.lineTo(W*.55,H*.88); g.stroke();
  for(let i=0;i<4;i++){ g.beginPath(); g.moveTo(W*.60,H*(.48+i*.11)); g.lineTo(W*.93,H*(.48+i*.11)); g.stroke(); }
  g.setLineDash([8,7]); g.strokeRect(W*.80,H*.10,W*.13,W*.15); g.setLineDash([]);
  const m=imTHCanvas(ink,300); g.drawImage(m,W*.08,H*.70,H*.17,H*.17); g.fillStyle=ink; g.font=`500 ${H*.034}px "Montserrat", Arial, sans-serif`; g.textAlign='left'; g.fillText(String(brand||'tadhayrapetian').toUpperCase().split('').join(' '),W*.08+H*.2,H*.795); return c; }
function imHandText(g,lines,x,y,lh,ink,font,r){ g.fillStyle=ink; lines.forEach((t,i)=>{ g.save(); g.translate(x+(r()-.5)*6,y+i*lh); g.rotate((r()-.5)*.012); g.fillText(t,0,0); g.restore(); }); }
function imEnvFront(a,col,look,seed,addr){ const W=1800, H=Math.round(W/a), c=imC(W,H), g=imCtx(c), r=imRng(seed), ink=look.ink&&imLum(look.ink)<.5?look.ink:'#2f2a26'; g.fillStyle=col; g.fillRect(0,0,W,H);
  g.font=`400 ${H*.085}px "Caveat", "Marck Script", cursive`; imHandText(g,addr||['Анне Мартиросян','ул. Абовяна, 12, кв. 5','Ереван 0001','Армения'],W*.44,H*.52,H*.105,imRgba(ink,.88),'',r);
  g.font=`400 ${H*.05}px "Caveat", cursive`; imHandText(g,['от: T. H.','Ереван'],W*.06,H*.12,H*.065,imRgba(ink,.7),'',r); return c; }
function imLetterCanvas(look,seed,text){ const W=1400, H=Math.round(W*1.414), c=imC(W,H), g=imCtx(c), r=imRng(seed), ink=look.ink&&imLum(look.ink)<.5?look.ink:'#2f2a26'; g.fillStyle='#fbf8f1'; g.fillRect(0,0,W,H);
  const m=imTHCanvas(imRgba(ink,.8),300); g.drawImage(m,W/2-W*.06,H*.05,W*.12,W*.12);
  g.font=`400 ${W*.046}px "Caveat", "Marck Script", cursive`; const body=text||'Дорогая Анна! Пишу тебе из Еревана, где абрикосы уже спеют, а по утрам пахнет кофе и тёплым камнем. Хочу, чтобы это письмо стало маленьким праздником: открой его не спеша, с чашкой чая. Спасибо, что ты рядом даже на расстоянии. Обнимаю крепко-крепко и жду ответа!';
  const lines=imWrap(g,body,W*.78); imHandText(g,['Дорогая Анна!'].concat(lines.slice(1)),W*.11,H*.22,W*.068,imRgba(ink,.9),'',r);
  g.textAlign='right'; imHandText(g,['С любовью, Т.'],W*.88,H*.22+(lines.length+1.2)*W*.068,0,imRgba(ink,.9),'',r); return c; }
const IM_QUOTES=['Письма, которые хочется хранить','Сделано вручную в Ереване','Каждый конверт — маленький праздник','Слова на бумаге живут дольше','Напишите тому, кто ждёт','Тепло, которое можно потрогать','Бумага, сургуч и немного магии','Красиво — значит с любовью','Медленная почта для быстрых сердец'];
function imQuoteCanvas(look,o){ const a=o.a||.8, W=1600, H=Math.round(W/a), c=imC(W,H), g=imCtx(c), bg=o.bg||look.palette[0], dark=imLum(o.tone||bg)<.45, ink=o.ink||(dark?'#f3ece2':(imLum(look.ink)<.5?look.ink:'#2f2a26')), acc=o.acc||look.palette[3];
  if(!o.clear){ g.fillStyle=bg; g.fillRect(0,0,W,H); } if(o.frame!==false){ g.strokeStyle=imRgba(ink,.35); g.lineWidth=3; g.strokeRect(W*.05,W*.05,W*.9,H-W*.1); }
  const mk=imTHCanvas(imRgba(dark?ink:acc,.9),400,o.mark); g.drawImage(mk,W/2-W*.075,H*.12,W*.15,W*.15);
  const text=o.text||IM_QUOTES[(o.seed||0)%IM_QUOTES.length]; let fs=W*.095; const fam='"Cormorant Garamond", "Playfair Display", Georgia, serif'; let lines;
  for(;;){ g.font=`italic 500 ${fs}px ${fam}`; lines=imWrap(g,'«'+text+'»',W*.74); if(lines.length*fs*1.18<H*.48||fs<W*.04) break; fs*=.93; }
  g.fillStyle=ink; g.textAlign='center'; g.textBaseline='middle'; const y0=H*.54-(lines.length-1)*fs*1.18/2; lines.forEach((l,i)=>g.fillText(l,W/2,y0+i*fs*1.18));
  g.fillStyle=imRgba(ink,.75); g.font=`500 ${W*.026}px "Montserrat", Arial, sans-serif`; const br=String(o.brand||'tadhayrapetian').toUpperCase(); const sp=[...br].join(String.fromCharCode(8202)); g.fillText(sp,W/2,H*.88);
  g.strokeStyle=imRgba(ink,.4); g.lineWidth=2; const tw=g.measureText(sp).width; g.beginPath(); g.moveTo(W/2-tw/2-W*.08,H*.88); g.lineTo(W/2-tw/2-W*.03,H*.88); g.moveTo(W/2+tw/2+W*.03,H*.88); g.lineTo(W/2+tw/2+W*.08,H*.88); g.stroke(); return c; }
function imPlainCover(col,ink,seed,title){ const W=1200, H=1700, c=imC(W,H), g=imCtx(c); g.fillStyle=col; g.fillRect(0,0,W,H); imToothFill(g,0,0,W,H,.25,1.2);
  const m=imTHCanvas(imRgba(ink,.75),300); g.drawImage(m,W/2-W*.09,H*.38,W*.18,W*.18); if(title){ g.fillStyle=imRgba(ink,.75); g.font='500 46px "Montserrat", Arial'; g.textAlign='center'; g.fillText(title,W/2,H*.56); } return c; }
/* ---------- p5: scenes (flat lays, angled shots, macro details, text tiles) + render API ---------- */
const IM_BOT=['gyps','lavender','eucalyptus','fern','fernd','olive','wheat','bunny'];
const IM_PROPS=[['seal','Сургуч'],['twine','Бечёвка'],['flowers','Цветы и зелень'],['pen','Ручка'],['cup','Чашка и фрукты'],['ribbon','Лента'],['stamps','Марки'],['gobo','Тени от окна']];
const IM_KIND_N={envelope:'Конверт',postcard:'Открытка',letter:'Письмо',stamp:'Штамп',seal:'Печать',notebook:'Блокнот',card:'Визитка',invitation:'Приглашение',sticker:'Наклейка',photo:'Фото',other:'Файл'};
const IM_CATS=[['env','Конверты'],['pc','Открытки'],['letter','Письма'],['stamp','Штампы и печати'],['nb','Блокноты'],['bc','Визитки'],['inv','Приглашения'],['kit','Наборы'],['detail','Детали'],['text','Текст'],['sticker','Наклейки']];
const IM_FLAT=['postcard','card','invitation','letter','photo','other','sticker','notebook','envelope'];

/* ---------- prepared sources ---------- */
const IM_PREP=new Map();
async function imPrepOne(s){ if(!s) return null; if(typeof s==='string') s={id:'u'+imHash(s.slice(0,200)+s.length),kind:'other',src:s};
  const key=(s.id||'')+'|'+(s.src||'').length+'|'+String(s.src||'').slice(-40)+'|'+((s.sides&&s.sides.back)||'').length; if(IM_PREP.has(key)) return IM_PREP.get(key);
  const im=await imLoad(s.src); if(!im) return null; let img=imToCanvas(im,2400), cut=false; const box=imAlphaBox(img);
  if(box){ cut=true; const c=imC(box.w,box.h); c.getContext('2d').drawImage(img,box.x,box.y,box.w,box.h,0,0,box.w,box.h); img=c; }
  let back=null; if(s.sides&&s.sides.back&&s.sides.back!==s.src){ const b=await imLoad(s.sides.back); if(b) back=imToCanvas(b,2400); }
  const p={id:s.id,kind:s.kind||'other',name:s.name||'',img,back,a:img.width/img.height,cut,w:s.w,h:s.h,postage:!!s.postage,mark:!!s.mark};
  IM_PREP.set(key,p); if(IM_PREP.size>30) IM_PREP.delete(IM_PREP.keys().next().value); return p; }
async function imPrep(srcs){ const a=Array.isArray(srcs)?srcs:srcs?[srcs]:[]; const out=[]; for(const s of a){ const p=await imPrepOne(s); if(p) out.push(p); } return out; }

/* ---------- scene context ---------- */
function imMakeX(g,W,H,look,L,seed,P,o,props,surf){ const r=imRng(seed*31+7), u=W/1080;
  const X={g,W,H,u,look,L,sd:[-L[0],-L[1]],seed,r,P,main:P[0]||null,o,props,surf,tone:imSurfTone(surf),cache:{}};
  X.j=a=>(r()-.5)*2*a;
  X.src=(kinds)=>{ for(const k of kinds){ const f=P.find(p=>p.kind===k&&!p.postage); if(f) return f; } return X.main&&!X.main.postage?X.main:(P.find(p=>!p.postage)||null); };
  X.face=(s,a)=>{ if(!s) return null; if(!s.cut) return s.img; const k='face'+s.id+a; return X.cache[k]||(X.cache[k]=imOnCard(s.img,a||(s.a>=1?1.42:.704),'#fbf9f4',s.kind==='stamp'||s.kind==='seal'?.58:.7)); };
  X.backOf=(s,a)=>s&&s.back?s.back:(X.cache['pb'+a]||(X.cache['pb'+a]=imPostcardBack(a||1.42,look,o.brand)));
  X.sealCol=()=>look.seal[Math.floor(r()*look.seal.length)%look.seal.length];
  X.markOf=()=>o.mark||'TH';
  X.stampArt=()=>{ const s=P.find(p=>p.cut&&p.kind==='stamp'&&!p.postage)||P.find(p=>p.cut&&p.kind==='seal')||P.find(p=>p.cut&&!p.postage); return s?s.img:null; };
  X.seal=(x,y,R,ex)=>{ if(props.seal) imSeal(X,x,y,R,Object.assign({col:X.sealCol(),mark:X.markOf(),seed:seed+(ex||0)},ex&&typeof ex==='object'?ex:{})); };
  X.flower=(x,y,len,ang,kind)=>{ if(!props.flowers) return; const ks=look.bot||look.props.filter(k=>IM_BOT.includes(k)); const k=kind||(ks.length?ks[Math.floor(r()*ks.length)%ks.length]:'eucalyptus'); len*=look.botScale||1;
    imSprig(X,k,x,y,len,ang,seed+Math.floor(r()*100)); };
  X.pen=(x,y,len,ang)=>{ if(!props.pen) return; if(look.props.includes('pencil')) imPencil(X,x,y,len,ang,'#2c2c2e'); else imPen(X,x,y,len,ang,look.pen); };
  X.cup=(x,y,R)=>{ if(!props.cup) return; if(look.props.includes('apricot')&&r()<.5){ imApricot(X,x,y,R*.48,seed+5,true); imApricot(X,x+R*.62,y+R*.55,R*.42,seed+8,false); return; } if(look.props.includes('candle')){ imCandle(X,x,y,R*.55); return; } imCup(X,x,y,R,look.cup,.5+r()); };
  X.twine=(pts,ex)=>{ if(props.twine) imTwine(X,pts,Object.assign({col:look.twine,baker:look===IM_LOOKS.vintage&&r()<.4},ex||{})); };
  X.ribbon=(pts,ex)=>{ if(props.ribbon) imRibbon(X,pts,Object.assign({col:look.ribbon,kind:look===IM_LOOKS.linen||look===IM_LOOKS.botanic?'linen':look===IM_LOOKS.moody?'velvet':'satin',seed:seed+2},ex||{})); };
  X.postages=()=>{ const ps=P.filter(p=>p.postage); return ps.length?ps.map(p=>p.img):[imPostageArt(seed,look.palette[3]),imPostageArt(seed+1,look.seal[0])]; };
  X.envCol=i=>look.env[(i||0)%look.env.length];
  return X; }

/* ---------- scene helpers ---------- */
const imIsEnv=s=>s&&s.kind==='envelope';
/* an envelope object: printed (owner's envelope) or plain paper */
function imEnvObj(X,cx,cy,w,rot,o){ const e=o.src&&imIsEnv(o.src)?o.src:null, a=e?e.a:(o.a||1.42), h=w/a, side=o.side||'back';
  const img=e?(side==='front'?e.img:(e.back||null)):(side==='front'&&o.hand?(X.cache['ef'+a]||(X.cache['ef'+a]=imEnvFront(a,o.col||X.envCol(0),X.look,X.seed))):null);
  return imEnvelope(X,{cx,cy,w,h,rot,col:o.col||X.envCol(o.ci||0),side,img,flap:o.flap||(a>1.8?'straight':X.look===IM_LOOKS.marble||X.look===IM_LOOKS.pastel?'round':'pointed'),open:o.open,insert:o.insert,liner:o.liner,linerFn:o.linerFn,
    seal:o.seal&&X.props.seal?{col:X.sealCol(),mark:X.markOf(),seed:X.seed+11,R:Math.min(w,h)*.12}:null,lift:o.lift}); }
function imLinerFn(X){ const c=X.look.palette; return (g,x,y,w,h)=>{ const r=imRng(X.seed+4), u=X.u; g.save(); g.globalAlpha=.55; for(let i=0;i<w*h/2600;i++){ g.fillStyle=imRgba(imPick(r,[c[2],c[3],c[1]]),.35+r()*.4); g.beginPath(); g.ellipse(x+r()*w,y+r()*h,(6+r()*12)*u,(3+r()*5)*u,r()*3,0,6.3); g.fill(); } g.restore(); }; }
/* main printed card (front) with optional back underneath */
function imCardSet(X,s,cx,cy,w,rot,o){ o=o||{}; const a=s?(s.cut?(o.a||1.42):s.a):(o.a||1.42), h=w/a, f=s?X.face(s,a):(X.cache.q||(X.cache.q=imQuoteCanvas(X.look,{a,seed:X.seed,brand:X.o.brand,text:X.o.text})));
  if(o.back){ const b=X.backOf(s,a); imSheet(X,b,{cx:cx+o.back[0],cy:cy+o.back[1],w,h,rot:rot+o.back[2],lift:.5}); }
  imSheet(X,f,{cx,cy,w,h,rot,lift:o.lift==null?.9:o.lift,radius:s&&s.kind==='card'?1.6:.8}); return [w,h]; }

/* ---------- the scenes ---------- */
/* card (non-envelope) source for a scene */
const imCardSrc=(X,kinds)=>{ const c=X.src(kinds||['postcard','invitation','card','letter','photo','other']); return c&&!imIsEnv(c)?c:null; };
const imRotPt=(cx,cy,rot)=>(px,py)=>[cx+px*Math.cos(rot)-py*Math.sin(rot),cy+px*Math.sin(rot)+py*Math.cos(rot)];
function imLooseStamps(X,list,x,y,w,n){ const {r}=X; for(let i=0;i<n;i++){ const a=r()*6.3, d=w*(.25+r()*.7); imPostage(X,list[i%list.length],{cx:x+Math.cos(a)*d*(i?1:0),cy:y+Math.sin(a)*d*.6*(i?1:0),w:w*(.8+r()*.25),rot:(r()-.5)*.9,lift:.3}); } }
const IM_SCENES=[
 /* Конверты */
 {id:'env-seal',name:'Конверт с сургучом',cat:'env',needs:['envelope','postcard','invitation'],draw(X){ const {W,H}=X, e=X.src(['envelope']), c=imCardSrc(X), ok=imIsEnv(e), a=ok?e.a:1.42, ew=a>1.8?W*.86:W*.76, eh=ew/a;
   if(c) imCardSet(X,c,W*.60,H*.42+eh*.62,W*.58,.11+X.j(.04));
   imEnvObj(X,W*.47,H*.40,ew,-.05+X.j(.04),{src:ok?e:null,side:'back',seal:true,a});
   X.flower(W*1.03,H*.03,W*.46,2.35+X.j(.12)); X.pen(W*.13,H*.86,W*.56,-1.2+X.j(.08)); }},
 {id:'env-front',name:'Лицо конверта',cat:'env',needs:['envelope'],draw(X){ const {W,H}=X, e=X.src(['envelope']), ok=imIsEnv(e), ps=X.postages(), a=ok?e.a:1.6, ew=a>1.8?W*.86:W*.80, eh=ew/a, rot=.04+X.j(.03), cx=W*.5, cy=H*.42;
   imEnvObj(X,cx,cy,ew,rot,{src:ok?e:null,side:'front',hand:!ok,a,ci:0});
   if(!ok&&X.props.stamps){ const T=imRotPt(cx,cy,rot); imPostage(X,ps[0],{cx:T(ew*.37,-eh*.26)[0],cy:T(ew*.37,-eh*.26)[1],w:ew*.13,rot:rot+X.j(.03)}); const pm=T(ew*.24,-eh*.20); imPostmark(X,pm[0],pm[1],ew*.075,{seed:X.seed,rot:rot-.2}); }
   if(X.props.stamps) imLooseStamps(X,ps,W*.24,H*.80,W*.14,3); X.pen(W*.80,H*.86,W*.56,-.42+X.j(.06)); X.flower(W*-.03,H*.06,W*.40,.62+X.j(.1)); }},
 {id:'env-duo',name:'Лицо и оборот',cat:'env',needs:['envelope'],draw(X){ const {W,H}=X, e=X.src(['envelope']), ok=imIsEnv(e), a=ok?e.a:1.6, ew=a>1.8?W*.80:W*.72;
   imEnvObj(X,W*.44,H*.31,ew,-.08+X.j(.03),{src:ok?e:null,side:'front',hand:!ok,a,ci:1});
   imEnvObj(X,W*.56,H*.66,ew,.07+X.j(.03),{src:ok?e:null,side:'back',seal:true,a,ci:1});
   X.flower(W*1.03,H*.97,W*.42,-2.4+X.j(.15)); }},
 {id:'env-stack',name:'Стопка писем',cat:'env',needs:['envelope'],draw(X){ const {W,H,u}=X, e=X.src(['envelope']), ok=imIsEnv(e), a=ok?e.a:1.5, w=a>1.8?W*.86:W*.78, h=w/a, cx=W*.5, cy=H*.48, rot=-.06+X.j(.03);
   imEnvObj(X,cx+W*.04,cy+h*.12,w,rot+.12,{side:'front',ci:2,a,hand:true}); imEnvObj(X,cx-W*.03,cy+h*.05,w,rot-.06,{side:'front',ci:1,a,hand:true});
   imEnvObj(X,cx,cy,w,rot,{src:ok?e:null,side:'back',seal:true,a,ci:0});
   const T=imRotPt(cx,cy,rot), tx=-w*.30, ty=h*.27; X.twine([T(tx-w*.01,-h/2-2*u),T(tx,0),T(tx+w*.005,h/2+2*u)]); X.twine([T(-w/2-2*u,ty),T(0,ty+h*.01),T(w/2+2*u,ty-h*.005)]);
   if(X.props.twine) imTwineBow(X,...T(tx,ty),W*.075,rot+.3,{col:X.look.twine});
   X.flower(W*.02,H*.06,W*.40,.7+X.j(.1)); X.pen(W*.66,H*.92,W*.56,.1+X.j(.05)); }},
 {id:'env-open',name:'Открытый конверт',cat:'env',needs:['postcard','invitation','card'],draw(X){ const {W,H}=X, c=imCardSrc(X), ew=W*.76, rot=X.j(.03);
   const f=c?X.face(c,c.cut?1.42:c.a):(X.cache.q||(X.cache.q=imQuoteCanvas(X.look,{a:1.42,seed:X.seed,brand:X.o.brand,text:X.o.text}))), fa=f.width/f.height, cw=ew*.88, chh=cw/fa;
   imEnvObj(X,W*.5,H*.66,ew,rot,{side:'back',open:true,a:1.42,ci:0,liner:X.look.palette[1],linerFn:imLinerFn(X),insert:{img:f,w:cw,h:chh,out:fa<1?.55:.45}});
   X.seal(W*.5+X.j(W*.02),H*.66-ew/1.42*1.08,W*.055); X.flower(W*.92,H*1.0,W*.42,-2.3+X.j(.1)); X.twine([[W*-.04,H*.30],[W*.10,H*.22],[W*.16,H*.08],[W*.30,H*-.03]]); }},
 {id:'env-angle',name:'Конверт под углом',cat:'env',needs:['envelope','postcard'],cam:r=>({tilt:36+r()*8,yaw:-10+r()*20,dof:18,fov:1.3,zoom:1.22,fy:.44}),draw(X){ const {W,H}=X, e=X.src(['envelope']), c=imCardSrc(X), ok=imIsEnv(e), a=ok?e.a:1.42, ew=a>1.8?W*.80:W*.70;
   if(c) imCardSet(X,c,W*.60,H*.54,W*.56,.12);
   imEnvObj(X,W*.45,H*.38,ew,-.05,{src:ok?e:null,side:'back',seal:true,a}); X.flower(W*.10,H*.76,W*.42,-.9); X.cup(W*.86,H*.04,W*.15); X.twine([[W*.66,H*.86],[W*.84,H*.72],[W*1.1,H*.68]]); }},
 /* Открытки */
 {id:'pc-flat',name:'Открытка и конверт',cat:'pc',needs:['postcard','invitation'],draw(X){ const {W,H}=X, c=imCardSrc(X,['postcard','invitation','card','photo','other']);
   imEnvObj(X,W*.62,H*.34,W*.66,.11+X.j(.03),{side:'back',seal:true,a:1.42,ci:1});
   imCardSet(X,c,W*.44,H*.58,W*.64,-.05+X.j(.03)); X.flower(W*1.02,H*.94,W*.48,-2.5+X.j(.1)); X.twine([[W*-.05,H*.16],[W*.12,H*.08],[W*.25,H*-.04]]); }},
 {id:'pc-duo',name:'Лицо и оборот',cat:'pc',needs:['postcard'],draw(X){ const {W,H}=X, c=imCardSrc(X,['postcard','invitation','card','other']), a=c?(c.cut?1.42:c.a):1.42, port=a<1, w=port?W*.52:W*.68, h=w/a;
   const b=X.backOf(c,a); imSheet(X,b,{cx:W*.56,cy:H*.5+h*.34,w,h,rot:.06+X.j(.02),lift:.6}); imSheet(X,X.face(c,a)||imQuoteCanvas(X.look,{a,seed:X.seed,brand:X.o.brand}),{cx:W*.44,cy:H*.5-h*.34,w,h,rot:-.04+X.j(.02),lift:.9});
   X.seal(W*.86,H*.12,W*.05); X.flower(W*-.02,H*1.0,W*.42,-.8); }},
 {id:'pc-fan',name:'Веер открыток',cat:'pc',needs:['postcard'],draw(X){ const {W,H}=X, m=imCardSrc(X,['postcard','invitation','card','photo','other']), same=X.P.filter(p=>m&&p.kind===m.kind&&!p.postage), cs=same.length>1?same:[m,m,m];
   const a=m?(m.cut?1.42:m.a):1.42, w=a>=1?W*.62:W*.50, h=w/a, px=W*.5, py=H*.52+h*.72;
   [-.32,0,.32].forEach((ang,i)=>{ const s=cs[i%cs.length]||null, img=same.length>1?(s?X.face(s,a):null):(i===0?X.backOf(m,a):null)||(s?X.face(s,a):imQuoteCanvas(X.look,{a,seed:X.seed+i,brand:X.o.brand})), d=h*.6;
     imSheet(X,img,{cx:px+Math.sin(ang)*d,cy:py-Math.cos(ang)*d,w,h,rot:ang+X.j(.02),lift:.6+i*.25}); });
   X.flower(W*.03,H*.06,W*.40,.75); X.seal(W*.86,H*.90,W*.05); }},
 {id:'pc-angle',name:'Открытка под углом',cat:'pc',needs:['postcard','invitation'],cam:r=>({tilt:32+r()*10,yaw:-14+r()*28,dof:20,fov:1.25,zoom:1.15,fy:.46}),draw(X){ const {W,H}=X, c=imCardSrc(X,['postcard','invitation','card','photo','other']);
   imEnvObj(X,W*.66,H*.26,W*.6,.14,{side:'back',seal:true,a:1.42,ci:1}); imCardSet(X,c,W*.46,H*.52,W*.62,-.06); X.flower(W*.96,H*.84,W*.46,-2.4); X.pen(W*.12,H*.16,W*.52,1.2); X.cup(W*.12,H*-.06,W*.16); }},
 {id:'pc-lean',name:'У стены',cat:'pc',needs:['postcard','invitation','card'],noSurface:true,noLight:true,draw(X){ return imLeanScene(X); }},
 /* Письма */
 {id:'letter-flat',name:'Письмо',cat:'letter',needs:['letter','postcard'],draw(X){ const {W,H,u}=X, l=X.src(['letter']), isL=l&&l.kind==='letter', img=isL?X.face(l,.707):(X.cache.lt||(X.cache.lt=imLetterCanvas(X.look,X.seed))), a=img.width/img.height, w=W*.62, h=w/a;
   imEnvObj(X,W*.70,H*.17,W*.66,.18+X.j(.03),{side:'back',seal:true,a:2,ci:1});
   imSheet(X,img,{cx:W*.42,cy:H*.56,w,h,rot:-.06+X.j(.03),lift:1.4,after:(g,w2,h2)=>imFolds(g,w2,h2,[-h2/6,h2/6],u)});
   const c=imCardSrc(X,['postcard','invitation','card','photo']); if(!isL&&c) imCardSet(X,c,W*.74,H*.80,W*.38,.16);
   X.pen(W*.93,H*.52,W*.56,1.62+X.j(.06)); X.cup(W*.07,H*.08,W*.17); }},
 {id:'letter-angle',name:'Письмо под углом',cat:'letter',needs:['letter'],cam:r=>({tilt:40+r()*8,yaw:-10+r()*20,dof:20,zoom:1.12,fy:.46}),draw(X){ const {W,H,u}=X, l=X.src(['letter']), isL=l&&l.kind==='letter', img=isL?X.face(l,.707):(X.cache.lt||(X.cache.lt=imLetterCanvas(X.look,X.seed))), a=img.width/img.height, w=W*.68, h=w/a;
   imEnvObj(X,W*.62,H*.10,W*.7,.12,{side:'back',seal:true,a:2,ci:1}); imSheet(X,img,{cx:W*.46,cy:H*.53,w,h,rot:-.03,lift:1.2,after:(g,w2,h2)=>imFolds(g,w2,h2,[-h2/6,h2/6],u)}); X.pen(W*.90,H*.68,W*.6,1.9); X.flower(W*-.02,H*.98,W*.4,-.9); }},
 /* Штампы и печати */
 {id:'stamp-imprint',name:'Оттиск штампа',cat:'stamp',needs:['stamp','seal'],draw(X){ const {W,H,u}=X, art=X.stampArt(), mk=art||imTHCanvas(X.look.seal[0],600), tag=X.look===IM_LOOKS.kraft||X.look===IM_LOOKS.vintage, paper=tag?'#c9a57c':'#f7f2e8';
   const cw=W*.64, chh=cw*1.2, cx=W*.42, cy=H*.54, rot=-.05+X.j(.03);
   imSheet(X,null,{cx,cy,w:cw,h:chh,rot,paper,lift:.8,after:(g,w2,h2)=>{ if(tag) imKraftClip(g,[[-w2/2,-h2/2],[w2/2,-h2/2],[w2/2,h2/2],[-w2/2,h2/2]],paper,u); }});
   const iw=cw*.74; imImprint(X,mk,{cx,cy:cy+X.j(H*.01),w:iw*Math.min(1,1.25/(mk.width/mk.height)),rot:rot+X.j(.08),seed:X.seed});
   const s2=W*.30; imSheet(X,null,{cx:W*.82,cy:H*.88,w:s2,h:s2*1.3,rot:.2,paper:'#efe7d8',lift:.6}); imImprint(X,mk,{cx:W*.82,cy:H*.88,w:s2*.72,rot:.25,seed:X.seed+1,alpha:.75});
   imStampBlock(X,W*.84,H*.20,W*.26,X.look.seal[0],mk,.18+X.j(.05)); imInkPad(X,W*.86,H*.47,W*.22,X.look.seal[0],-.1); X.twine([[W*-.05,H*.86],[W*.12,H*.93],[W*.2,H*1.05]]); }},
 {id:'seal-macro',name:'Печать крупно',cat:'stamp',needs:['seal','envelope'],cam:r=>({tilt:34+r()*6,yaw:-10+r()*20,dof:30,zoom:2.4,fx:.5,fy:.47}),draw(X){ const {W,H}=X, e=X.src(['envelope']), ok=imIsEnv(e), eh=W*.95/1.5;
   imEnvObj(X,W*.5,H*.47-eh*.09,W*.95,-.02,{src:ok?e:null,side:'back',a:1.5,ci:0,flap:'pointed'});
   if(X.props.flowers) X.flower(W*.40,H*.50,W*.26,-.45+X.j(.2)); imSeal(X,W*.5,H*.47,W*.11,{col:X.sealCol(),mark:X.markOf(),seed:X.seed+11}); if(X.props.flowers) imGyps(X,W*.56,H*.52,W*.16,-.2,X.seed+3); }},
 {id:'postage',name:'Почтовые марки',cat:'stamp',needs:['stamp','envelope'],draw(X){ const {W,H}=X, e=X.src(['envelope']), ps=X.postages(), ok=imIsEnv(e), a=ok?e.a:1.6, ew=a>1.8?W*.84:W*.78, eh=ew/a, rot=-.06+X.j(.03), cx=W*.48, cy=H*.38;
   imEnvObj(X,cx,cy,ew,rot,{src:ok?e:null,side:'front',hand:!ok,a,ci:0}); const T=imRotPt(cx,cy,rot);
   if(!ok){ [[.36,-.27],[.22,-.29]].forEach(([fx,fy],i)=>{ const p=T(ew*fx,eh*fy); imPostage(X,ps[i%ps.length],{cx:p[0],cy:p[1],w:ew*.12,rot:rot+X.j(.04)}); }); const pm=T(ew*.18,-eh*.24); imPostmark(X,pm[0],pm[1],ew*.08,{seed:X.seed,rot:rot-.15}); }
   if(X.props.stamps){ imLooseStamps(X,ps,W*.30,H*.80,W*.16,4); imLooseStamps(X,ps.slice().reverse(),W*.74,H*.86,W*.15,2); } X.pen(W*.92,H*.62,W*.5,1.9); }},
 /* Блокноты */
 {id:'nb-flat',name:'Блокнот на столе',cat:'nb',needs:['notebook'],draw(X){ const {W,H}=X, n=X.src(['notebook']), img=n?X.face(n,.707):imPlainCover(X.look.palette[2],X.look.ink,X.seed), a=img.width/img.height, w=Math.min(W*.6,H*.66*a), h=w/a;
   imNotebook(X,img,{cx:W*.46,cy:H*.53,w,h,rot:-.05+X.j(.03),binding:n&&n.kind==='notebook'?'spiral':'elastic'}); X.pen(W*.86,H*.55,W*.62,1.62+X.j(.05)); X.cup(W*.9,H*.08,W*.17); X.flower(W*-.02,H*.98,W*.4,-.8); }},
 {id:'nb-angle',name:'Блокнот под углом',cat:'nb',needs:['notebook'],cam:r=>({tilt:38+r()*8,yaw:-16+r()*32,dof:22,zoom:1.12,fy:.46}),draw(X){ const {W,H}=X, n=X.src(['notebook']), img=n?X.face(n,.707):imPlainCover(X.look.palette[2],X.look.ink,X.seed), a=img.width/img.height, w=Math.min(W*.6,H*.64*a), h=w/a;
   imNotebook(X,img,{cx:W*.5,cy:H*.5,w,h,rot:-.08,binding:'spiral'}); X.pen(W*.88,H*.6,W*.6,1.5); X.flower(W*.02,H*.9,W*.4,-.9); }},
 {id:'nb-stack',name:'Стопка блокнотов',cat:'nb',needs:['notebook'],draw(X){ const {W,H}=X, n=X.src(['notebook']), img=n?X.face(n,.707):imPlainCover(X.look.palette[2],X.look.ink,X.seed), a=img.width/img.height, w=Math.min(W*.56,H*.6*a), h=w/a, pal=X.look.palette;
   imNotebook(X,imPlainCover(pal[3],imLum(pal[3])<.5?'#f2ece2':pal[4],X.seed+1),{cx:W*.56,cy:H*.55,w,h,rot:.16,binding:'elastic',lift:1.6});
   imNotebook(X,imPlainCover(pal[1],pal[4],X.seed+2),{cx:W*.50,cy:H*.51,w,h,rot:-.10,binding:'elastic',lift:2.4});
   imNotebook(X,img,{cx:W*.46,cy:H*.47,w,h,rot:.02+X.j(.03),binding:'spiral',lift:3.2}); X.pen(W*.5,H*.92,W*.6,.12); X.flower(W*1.03,H*.05,W*.38,2.4); }},
 /* Визитки */
 {id:'bc-stack',name:'Стопка визиток',cat:'bc',needs:['card'],draw(X){ const {W,H,u}=X, c=X.src(['card']), a=c?(c.cut?1.75:c.a):1.75, w=W*.48, h=w/a, rot=-.12+X.j(.04), f=X.face(c,a)||imQuoteCanvas(X.look,{a,seed:X.seed,brand:X.o.brand});
   for(let i=7;i>=1;i--) imSheet(X,f,{cx:W*.36+i*.35*u,cy:H*.40+i*1.3*u,w,h,rot:rot+X.j(.004),lift:.25,shadow:i===7?1:.25,bend:.3});
   imSheet(X,f,{cx:W*.36,cy:H*.40,w,h,rot,lift:.6,radius:1.6});
   imSheet(X,X.backOf(c,a),{cx:W*.66,cy:H*.66,w,h,rot:.16+X.j(.04),lift:.5,radius:1.6}); imSheet(X,f,{cx:W*.32,cy:H*.80,w,h,rot:.28+X.j(.04),lift:.5,radius:1.6});
   X.pen(W*.88,H*.20,W*.56,2.0); X.flower(W*1.02,H*.99,W*.4,-2.4); }},
 {id:'bc-grid',name:'Раскладка визиток',cat:'bc',needs:['card'],draw(X){ const {W,H}=X, c=X.src(['card']), a=c?(c.cut?1.75:c.a):1.75, sq=H/W<1.1, cols=2, rows=sq?2:3, w=W*.38, h=w/a, gx=W*.05, gy=sq?H*.07:H*.045;
   const f=X.face(c,a)||imQuoteCanvas(X.look,{a,seed:X.seed,brand:X.o.brand}), b=X.backOf(c,a), tw=cols*w+(cols-1)*gx, th=rows*h+(rows-1)*gy;
   for(let j=0;j<rows;j++) for(let i=0;i<cols;i++) imSheet(X,(i+j)%2?b:f,{cx:(W-tw)/2+w/2+i*(w+gx),cy:(H-th)/2+h/2+j*(h+gy),w,h,rot:X.j(.006),lift:.5,radius:1.6}); }},
 {id:'bc-angle',name:'Визитки под углом',cat:'bc',needs:['card'],cam:r=>({tilt:40+r()*10,yaw:-20+r()*40,dof:24,zoom:1.15,fy:.46}),draw(X){ const {W,H,u}=X, c=X.src(['card']), a=c?(c.cut?1.75:c.a):1.75, w=W*.54, h=w/a, f=X.face(c,a)||imQuoteCanvas(X.look,{a,seed:X.seed,brand:X.o.brand});
   for(let i=6;i>=1;i--) imSheet(X,f,{cx:W*.42+i*.3*u,cy:H*.42+i*1.4*u,w,h,rot:-.08,lift:.25,shadow:i===6?1:.25,bend:.3}); imSheet(X,f,{cx:W*.42,cy:H*.42,w,h,rot:-.08,lift:.6,radius:1.6});
   imSheet(X,X.backOf(c,a),{cx:W*.62,cy:H*.68,w,h,rot:.14,lift:.5,radius:1.6}); X.flower(W*.95,H*.12,W*.4,2.3); }},
 /* Приглашения */
 {id:'inv-ribbon',name:'С лентой и калькой',cat:'inv',needs:['invitation','postcard'],draw(X){ const {W,H,u}=X, c=imCardSrc(X,['invitation','postcard','card','other']), a=c?(c.cut?.72:c.a):.72, port=a<1, w=port?W*.56:W*.72, h=w/a, cx=W*.46, cy=H*.52, rot=-.03+X.j(.02);
   imEnvObj(X,W*.72,H*.20,W*.62,.16,{side:'back',open:true,a:1.42,ci:0,liner:X.look.palette[1],linerFn:imLinerFn(X)});
   imCardSet(X,c,cx,cy,w,rot,{a}); const T=imRotPt(cx,cy,rot), bw=port?h*.18:w*.17, off=port?h*.30:w*.30, bc=port?T(0,off):T(off,0); imVellum(X,{cx:bc[0],cy:bc[1],w:port?w+6*u:bw,h:port?bw:h+6*u,rot});
   if(X.props.ribbon){ if(port){ X.ribbon([T(-w/2-30*u,off),T(0,off),T(w/2+30*u,off+2*u)],{w:22}); imBow(X,...T(0,off),W*.10,rot-.1,{col:X.look.ribbon,kind:'satin',w:22,seed:X.seed}); }
     else { X.ribbon([T(off,-h/2-30*u),T(off,0),T(off+2*u,h/2+30*u)],{w:22}); imBow(X,...T(off,0),W*.10,rot+.2,{col:X.look.ribbon,kind:'satin',w:22,seed:X.seed}); } }
   X.flower(W*.02,H*.99,W*.42,-.85); X.seal(W*.88,H*.88,W*.05); }},
 {id:'inv-suite',name:'Свадебный комплект',cat:'inv',needs:['invitation'],draw(X){ const {W,H,u}=X, c=imCardSrc(X,['invitation','postcard','card','other']), a=c?(c.cut?.72:c.a):.72, w=a<1?W*.54:W*.66, h=w/a;
   imEnvObj(X,W*.30,H*.18,W*.56,-.12,{side:'back',open:true,a:1.42,ci:0,liner:X.look.palette[1],linerFn:imLinerFn(X)});
   imCardSet(X,c,W*.56,H*.55,w,.05+X.j(.02),{a}); const b=X.backOf(c,1.42); imSheet(X,b,{cx:W*.24,cy:H*.82,w:W*.36,h:W*.36/1.42,rot:-.14,lift:.6});
   X.seal(W*.88,H*.10,W*.055); X.flower(W*1.02,H*.98,W*.45,-2.3); X.ribbon([[W*-.10,H*.50],[W*.05,H*.55],[W*.06,H*.62],[W*-.08,H*.68]],{w:20}); }},
 /* Наборы */
 {id:'kit-box',name:'Подарочная коробка',cat:'kit',needs:['postcard','card','envelope'],draw(X){ const {W,H,u}=X, cs=imFlatList(X), bw=W*.70, bh=Math.min(H*.62,bw*1.15), dark=X.look===IM_LOOKS.moody, light=X.look===IM_LOOKS.nordic||X.look===IM_LOOKS.marble||X.look===IM_LOOKS.pastel;
   const col=dark?'#3a3431':light?'#ece9e3':'#bf9466'; imBoxLid(X,W*.80,H*.16,bw*.86,bh*.62,.32,col);
   const fl=imBox(X,W*.47,H*.52,bw,bh,{col,rot:X.j(.02),lift:18,depth:52*u,wall:11*u});
   const s=cs[0]||null, a=s?(s.cut?1.42:s.a):1.42, w=Math.min(fl.w*.84,fl.h*.84*a), h=w/a;
   imEnvObj(X,fl.x+fl.w*.05,fl.y-fl.h*.14,Math.min(fl.w*.78,w*1.05),.07,{side:'back',a:1.42,ci:1,seal:true});
   imCardSet(X,s,fl.x-fl.w*.02,fl.y+fl.h*.12,w*.9,-.06,{a}); if(cs[1]) imCardSet(X,cs[1],fl.x+fl.w*.20,fl.y+fl.h*.26,w*.48,.12,{});
   X.flower(fl.x-fl.w*.45,fl.y+fl.h*.48,W*.34,-.6); X.twine([[W*-.04,H*.93],[W*.2,H*.95],[W*.45,H*1.04]]); }},
 {id:'kit-all',name:'Всё вместе',cat:'kit',needs:['postcard','envelope','notebook','stamp'],draw(X){ const {W,H}=X, nb=X.P.find(p=>p.kind==='notebook'), en=X.P.find(p=>p.kind==='envelope'), st=X.stampArt(), cards=X.P.filter(p=>['postcard','card','invitation','photo','other','letter'].includes(p.kind)&&!p.postage&&!p.cut);
   const nimg=nb?X.face(nb,.707):imPlainCover(X.look.palette[2],X.look.ink,X.seed); imNotebook(X,nimg,{cx:W*.80,cy:H*.62,w:W*.42,h:W*.42/(nimg.width/nimg.height),rot:.08,binding:nb?'spiral':'elastic'});
   imEnvObj(X,W*.36,H*.22,W*.64,-.08,{src:en||null,side:'back',hand:!en,seal:true,a:en?en.a:1.5,ci:1});
   const c0=cards[0]||null; imCardSet(X,c0,W*.38,H*.58,W*.50,.06,{}); if(cards[1]) imCardSet(X,cards[1],W*.26,H*.86,W*.36,-.18,{});
   if(st){ const s2=W*.24; imSheet(X,null,{cx:W*.74,cy:H*.13,w:s2,h:s2*1.25,rot:.12,paper:'#efe6d4',lift:.6}); imImprint(X,st,{cx:W*.74,cy:H*.13,w:s2*.7,rot:.1,seed:X.seed}); }
   else if(X.props.stamps) imPostage(X,X.postages()[0],{cx:W*.74,cy:H*.12,w:W*.13,rot:.12});
   X.flower(W*.02,H*.99,W*.36,-.8); }},
 /* Детали */
 {id:'detail-corner',name:'Уголок крупно',cat:'detail',needs:['postcard','card','invitation','envelope'],cam:r=>({tilt:44+r()*8,yaw:-24+r()*14,dof:34,zoom:2.3,fx:.40,fy:.40}),draw(X){ const {W,H}=X, c=X.src(['postcard','invitation','card','envelope','other']);
   const a=c?(c.cut?1.42:c.a):1.42, w=W*.74, h=w/a, rot=-.04, cx=W*.40+w/2*Math.cos(rot)-h/2*Math.sin(rot)-W*.06, cy=H*.40+w/2*Math.sin(rot)+h/2*Math.cos(rot)-H*.04;
   if(imIsEnv(c)) imEnvObj(X,cx,cy,w,rot,{src:c,side:'back',seal:true,a}); else imCardSet(X,c,cx,cy,w,rot,{a,back:[W*.04,H*.03,.06]});
   X.flower(W*.20,H*.26,W*.30,.4); }},
 {id:'detail-edge',name:'Фактура и срез',cat:'detail',needs:['card','postcard'],cam:r=>({tilt:52+r()*6,yaw:-30+r()*20,dof:36,zoom:1.9,fx:.42,fy:.58}),draw(X){ const {W,H,u}=X, c=imCardSrc(X,['card','postcard','invitation','other']), a=c?(c.cut?1.6:c.a):1.6, w=W*.6, h=w/a, f=X.face(c,a)||imQuoteCanvas(X.look,{a,seed:X.seed,brand:X.o.brand});
   for(let i=14;i>=1;i--) imSheet(X,f,{cx:W*.5+i*.2*u,cy:H*.5+i*1.1*u,w,h,rot:-.06+X.j(.003),lift:.2,shadow:i===14?1.2:.2,bend:.25,edge:1.4});
   imSheet(X,f,{cx:W*.5,cy:H*.5,w,h,rot:-.06,lift:.5,radius:1.2}); X.flower(W*.86,H*.18,W*.3,2.4); }},
 /* Текст */
 {id:'quote-tile',name:'Цитата',cat:'text',needs:[],noSurface:true,draw(X){ const {g,W,H,u}=X, pal=X.look.palette, bg=X.look===IM_LOOKS.moody?pal[0]:pal[(X.seed%2)?1:0];
   imPaper(g,W,H,bg,X.seed,u,X.L); const q=imQuoteCanvas(X.look,{a:W/H,seed:X.seed,brand:X.o.brand,text:X.o.text,bg,clear:true,frame:true,mark:X.markOf()}); g.drawImage(q,0,0,W,H); }},
 {id:'quote-card',name:'Цитата на карточке',cat:'text',needs:[],draw(X){ const {W,H}=X, a=.72, q=X.cache.qc||(X.cache.qc=imQuoteCanvas(X.look,{a,seed:X.seed,brand:X.o.brand,text:X.o.text,bg:'#fbf8f2',frame:true,mark:X.markOf()})), w=W*.62, h=w/a;
   imSheet(X,q,{cx:W*.48,cy:H*.5,w,h,rot:-.04+X.j(.03),lift:1}); X.seal(W*.80,H*.16,W*.05); X.flower(W*1.02,H*.99,W*.42,-2.3); X.twine([[W*-.05,H*.08],[W*.15,H*.14],[W*.2,H*-.05]]); }},
 /* Наклейки */
 {id:'sticker-sheet',name:'Наклейки',cat:'sticker',needs:['sticker','stamp','seal'],draw(X){ const {W,H,u}=X, cuts=X.P.filter(p=>p.cut&&!p.postage).map(p=>p.img), m=X.main;
   const arts=cuts.length?cuts:[m&&!m.cut?imRoundCut(m.img):imTHCanvas(X.look.seal[0],500),imTHCanvas(X.look.palette[3],500,'T')];
   const sw=W*.68, sh=sw*1.32, cx=W*.5, cy=H*.5, rot=X.j(.03); imSheet(X,null,{cx,cy,w:sw,h:sh,rot,paper:X.look===IM_LOOKS.kraft?'#c9a57c':'#f6f4f0',lift:.6,radius:3});
   const T=imRotPt(cx,cy,rot), pos=[[-.22,-.30,.42],[.22,-.26,.34],[-.18,.06,.32],[.2,.12,.40],[-.2,.36,.30],[.18,.38,.26]];
   pos.forEach(([fx,fy,fs],i)=>{ const art=arts[i%arts.length], st=X.cache['st'+i%arts.length]||(X.cache['st'+i%arts.length]=imStickerCanvas(art,700,26)); const [px,py]=T(fx*sw,fy*sh); imSticker(X,st,{cx:px,cy:py,w:sw*fs,rot:rot+X.j(.15)}); });
   const st=X.cache.st0||imStickerCanvas(arts[0],700,26); imSticker(X,st,{cx:W*.86,cy:H*.88,w:W*.22,rot:.4}); X.flower(W*-.02,H*.12,W*.36,.6); }}];
/* helpers used by scenes */
function P0(X,kinds){ return X.src(kinds); }
function imFlatList(X){ const a=X.P.filter(p=>IM_FLAT.includes(p.kind)&&!p.postage&&p.kind!=='envelope'&&p.kind!=='notebook'); return a.length?a:X.P.filter(p=>!p.postage); }
function imRoundCut(img){ const S=900, c=imC(S,S), g=imCtx(c), iw=img.width, ih=img.height, k=Math.max(S/iw,S/ih); g.beginPath(); g.arc(S/2,S/2,S/2,0,6.3); g.clip(); g.drawImage(img,(S-iw*k)/2,(S-ih*k)/2,iw*k,ih*k); return c; }
/* card leaning against a wall, standing on the table (two planes: wall + table seen at a low angle) */
function imLeanScene(X){ const {g,W,H,u,look}=X, hz=H*.64, wallC=imMix(look.palette[0],'#ffffff',.22), dark=look===IM_LOOKS.moody;
  imPlaster(g,W,hz+6,dark?'#3a3633':wallC,X.seed,u,X.L); const vg=g.createLinearGradient(0,0,0,hz); vg.addColorStop(0,'rgba(0,0,0,.14)'); vg.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=vg; g.fillRect(0,0,W,hz);
  if(X.props.gobo){ g.save(); g.beginPath(); g.rect(0,0,W,hz+6); g.clip(); imGobo(g,{x:0,y:0,w:W,h:H,fw:W,fh:H},look,X.L,X.seed,u,look.light.gobo==='candle'?'candle':look.light.gobo==='blinds'?'blinds':'leaves',Math.max(.2,look.light.goboStr)); g.restore(); }
  /* table plane with props, warped under the horizon; far part sharp, near part a little soft */
  const TW=Math.round(W*1.5), TH=Math.round(W*.8), tp=imC(TW,TH), tg=imCtx(tp); imSurface(tg,TW,TH,X.surf,X.seed%3+1,u*1.2,X.L);
  const TX=imMakeX(tg,TW,TH,look,X.L,X.seed,X.P,X.o,X.props,X.surf); if(X.props.flowers) TX.flower(TW*.80,TH*.95,TW*.30,-2.2); if(X.props.seal) TX.seal(TW*.26,TH*.62,TW*.035); if(X.props.cup&&look.props.includes('apricot')) imApricot(TX,TW*.12,TH*.35,TW*.04,X.seed,false);
  const Q=[[-W*.25,hz],[W*1.25,hz],[W*1.05,H*1.02],[-W*.05,H*1.02]], tc=imC(W,H-hz+8), tcg=imCtx(tc); tcg.translate(0,-hz+4); imWarpQuad(tcg,tp,Q,14);
  g.drawImage(tc,0,hz-4); const tb=imBlur(tc,5*u), mk=imC(tc.width,tc.height), mg=mk.getContext('2d'); mg.drawImage(tb,0,0); mg.globalCompositeOperation='destination-in'; const gm=mg.createLinearGradient(0,0,0,tc.height); gm.addColorStop(0,'rgba(0,0,0,0)'); gm.addColorStop(.55,'rgba(0,0,0,0)'); gm.addColorStop(1,'rgba(0,0,0,1)'); mg.fillStyle=gm; mg.fillRect(0,0,tc.width,tc.height); g.drawImage(mk,0,hz-4);
  const sh=g.createLinearGradient(0,hz,0,hz+H*.06); sh.addColorStop(0,'rgba(0,0,0,.22)'); sh.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=sh; g.fillRect(0,hz,W,H*.06); g.fillStyle='rgba(255,255,255,.16)'; g.fillRect(0,hz-1*u,W,1.2*u);
  /* the card */
  const c=imCardSrc(X,['postcard','invitation','card','photo','other']), a=c?(c.cut?.72:c.a):.72, f=c?X.face(c,a):imQuoteCanvas(look,{a,seed:X.seed,brand:X.o.brand,text:X.o.text}), ch=Math.min(H*.56,W*.66/a), cw=ch*a, base=hz+H*.045, cx=W*.48;
  const Q2=[[cx-cw/2+cw*.018,base-ch*.975],[cx+cw/2-cw*.018,base-ch*.975],[cx+cw/2,base],[cx-cw/2,base]], sdx=X.sd[0]>=0?1:-1;
  g.save(); g.beginPath(); g.rect(0,0,W,hz+2); g.clip(); imShadowDo(g,20*u,imRgba(look.light.shade,.42*look.light.str+.14),sdx*W*.06,-8*u,()=>{ imPoly(g,[[Q2[0][0],Q2[0][1]+ch*.05],[Q2[1][0],Q2[1][1]+ch*.05],[Q2[2][0],Q2[2][1]],[Q2[3][0],Q2[3][1]]]); g.fill(); }); g.restore();
  imShadowDo(g,10*u,imRgba(look.light.shade,.30),sdx*W*.05,4*u,()=>{ imPoly(g,[[Q2[3][0],base-6*u],[Q2[2][0],base-6*u],[Q2[2][0]+sdx*W*.10,base+H*.03],[Q2[3][0]+sdx*W*.10,base+H*.03]]); g.fill(); });
  imShadowDo(g,4*u,'rgba(0,0,0,.5)',0,2*u,()=>{ g.fillRect(Q2[3][0],base-3*u,cw,4*u); });
  imWarpQuad(g,f,Q2,10); g.save(); imPoly(g,Q2); g.clip(); imToothFill(g,cx-cw/2,base-ch,cw,ch,.1,u);
  const lg=g.createLinearGradient(cx-cw/2,0,cx+cw/2,0); lg.addColorStop(0,X.L[0]<0?'rgba(255,255,255,.07)':'rgba(0,0,0,.06)'); lg.addColorStop(1,X.L[0]<0?'rgba(0,0,0,.07)':'rgba(255,255,255,.06)'); g.fillStyle=lg; g.fillRect(cx-cw/2,base-ch,cw,ch);
  const vg2=g.createLinearGradient(0,base-ch,0,base); vg2.addColorStop(0,'rgba(255,255,255,.05)'); vg2.addColorStop(1,'rgba(0,0,0,.05)'); g.fillStyle=vg2; g.fillRect(cx-cw/2,base-ch,cw,ch); g.restore();
  g.strokeStyle='rgba(255,255,255,.6)'; g.lineWidth=1.1*u; g.beginPath(); g.moveTo(Q2[0][0],Q2[0][1]); g.lineTo(Q2[1][0],Q2[1][1]); g.stroke(); g.strokeStyle='rgba(0,0,0,.18)'; g.beginPath(); g.moveTo(Q2[3][0],Q2[3][1]); g.lineTo(Q2[2][0],Q2[2][1]); g.stroke();
  imLightPass(g,{x:0,y:0,w:W,h:H,cx:W/2,cy:H/2,fw:W,fh:H},look,X.L,.9); }

const imScene=id=>IM_SCENES.find(s=>s.id===id)||IM_SCENES[0];
const IM_PROPS_DEF={seal:true,twine:true,flowers:true,pen:true,cup:true,ribbon:true,stamps:true,gobo:true};
/* ---------- render ---------- */
async function imRenderCanvas(srcs,sceneId,o){ o=o||{}; const TT=o.timing?[]:null; let t0=performance.now(); const lap=(n,g)=>{ if(!TT) return; try{ g&&g.getImageData(0,0,1,1); }catch(_){ } const t=performance.now(); TT.push(n+':'+Math.round(t-t0)); t0=t; };
  await imFontsReady(); const look=imLook(o.look), W=Math.round(o.size||1080), H=o.aspect==='1:1'?W:Math.round(W*1.25), seed=(o.seed>>>0)||1;
  const S=imScene(sceneId), P=await imPrep(srcs), r=imRng(seed*9973+imHash(S.id)), L=imLightVec(look,(r()-.5)*16), props=Object.assign({},IM_PROPS_DEF,o.props||{});
  const surf=o.surface||look.surfaces[(seed+imHash(S.id))%look.surfaces.length], u=W/1080; lap('prep');
  const drawAll=async(g,R,ps,zoom)=>{ g.save(); g.setTransform(1,0,0,1,0,0); if(!S.noSurface){ const sq=ps>1?1/ps:1; if(sq<1){ const sc=imC(g.canvas.width*sq,g.canvas.height*sq); imSurface(imCtx(sc),sc.width,sc.height,surf,seed%3+1,u*ps*sq*(zoom||1),imLightVec(look,0)); g.drawImage(sc,0,0,g.canvas.width,g.canvas.height); } else imSurface(g,g.canvas.width,g.canvas.height,surf,seed%3+1,u*ps*(zoom||1),imLightVec(look,0)); } g.restore(); lap('surface',g);
    g.setTransform(ps,0,0,ps,-R.x*ps,-R.y*ps); const X=imMakeX(g,W,H,look,L,seed,P,o,props,surf); X.tilt=S.cam?1:0; await S.draw(X); lap('draw',g);
    if(!S.noLight){ imLightPass(g,{x:R.x,y:R.y,w:R.w,h:R.h,cx:W/2,cy:H/2,fw:W,fh:H},look,L); if(props.gobo) imGobo(g,{x:R.x,y:R.y,w:R.w,h:R.h,fw:W,fh:H},look,L,seed,u); } lap('light',g); };
  let cv; if(S.cam){ const cam=S.cam(r,o); cv=await imShoot(W,H,cam,(g,b)=>drawAll(g,{x:b.bx0,y:b.by0,w:b.bw,h:b.bh},b.ps,1)); lap('shoot',cv.getContext('2d')); }
  else { cv=imC(W,H); await drawAll(imCtx(cv),{x:0,y:0,w:W,h:H},1); }
  if(o.grade!==false) imGradeCanvas(cv,look,{seed,strength:o.gradeStrength}); lap('grade',cv.getContext('2d')); if(TT) cv.timing=TT.join(' '); return cv; }
/* ---------- p6: sources — the owner's real designs collected from the app ---------- */
const IMS={cache:new Map(),busy:null,list:[],at:0};
const imHasApp=()=>typeof st!=='undefined'&&typeof pageCanvas==='function';
function imCacheGet(k){ return IMS.cache.get(k); }
function imCacheSet(k,v){ IMS.cache.set(k,v); if(IMS.cache.size>60) IMS.cache.delete(IMS.cache.keys().next().value); return v; }
/* raster of a mm-sized HTML page via the app engine (fonts embedded), cached by content */
async function imRaster(html,wmm,hmm,minPx){ const key='r'+imHash(html)+':'+wmm+'x'+hmm+':'+minPx; const hit=imCacheGet(key); if(hit) return hit;
  const dpi=imClamp((minPx||1700)/(Math.max(wmm,hmm)/25.4),96,900); const cv=await pageCanvas(KS.page(wmm,hmm,html,'igm'),dpi); return imCacheSet(key,cv); }
/* white paper -> transparent ink (un-multiply with white) */
function imKeyWhite(cv,crop){ const w=cv.width, h=cv.height, c=imC(w,h), g=c.getContext('2d'); g.drawImage(cv,0,0); const d=g.getImageData(0,0,w,h), D=d.data;
  for(let i=0;i<D.length;i+=4){ const mn=Math.min(D[i],D[i+1],D[i+2]), a=(255-mn)/255; if(a<.025){ D[i+3]=0; continue; } for(let k=0;k<3;k++) D[i+k]=imClamp(Math.round((D[i+k]-255*(1-a))/a),0,255); D[i+3]=Math.round(a*255); }
  g.putImageData(d,0,0); if(crop===false) return c; const b=imAlphaBox(c); if(!b) return c; const pad=Math.round(Math.max(b.w,b.h)*.03), o=imC(b.w+pad*2,b.h+pad*2); o.getContext('2d').drawImage(c,b.x,b.y,b.w,b.h,pad,pad,b.w,b.h); return o; }
const imURL=(cv,type)=>cv.toDataURL(type||'image/png',.92);
function imDzKind(d){ let P={}; try{ P=prodById(d.prod)||{}; }catch(_){ } const k=d.kind||P.kind||'', cat=P.cat||'';
  if(['pcH','pcV','post','square'].includes(k)||cat==='post') return 'postcard'; if(['card','cardsq','badge'].includes(k)||cat==='card'||cat==='tag') return 'card';
  if(k==='invite'||cat==='invite') return 'invitation'; if(['round','label'].includes(k)||cat==='sticker') return 'sticker';
  if(['letterhead','diploma','diplomaH'].includes(k)||cat==='diploma') return 'letter'; return 'other'; }
function imDzName(d){ try{ const P=prodById(d.prod); if(P&&P.n) return P.n; }catch(_){ } try{ const K=DZ_KINDS[d.kind]; if(K) return K.n; }catch(_){ } return 'Макет'; }
async function imSrcDesign(){ const d=st.dz; if(!d||!(typeof dzHasDesign==='function'?dzHasDesign(d):(d.front||[]).length)) return null;
  const kind=imDzKind(d), side=s=>{ try{ return dzHTML(d,s,{}); }catch(_){ return ''; } }, fh=side('front'); if(!fh) return null;
  let f=await imRaster(fh,d.w,d.h,1800); const round=(()=>{ try{ const P=prodById(d.prod); return !!(P&&P.round)||d.kind==='round'; }catch(_){ return false; } })();
  const cutRound=cv=>{ const c=imC(cv.width,cv.height), g=imCtx(c); g.beginPath(); g.ellipse(c.width/2,c.height/2,c.width/2,c.height/2,0,0,6.3); g.clip(); g.drawImage(cv,0,0); return c; };
  if(round) f=cutRound(f); const hasBack=(d.sides||1)>1||((d.back||[]).length>0);
  let b=null; if(hasBack){ const bh=side('back'); if(bh){ b=await imRaster(bh,d.w,d.h,1800); if(round) b=cutRound(b); } }
  const front=imURL(f,round?'image/png':'image/jpeg'), back=b?imURL(b,round?'image/png':'image/jpeg'):null;
  return {id:'dz:'+imHash(fh+(b?'b':'')),kind,name:imDzName(d)+' · текущий макет',src:front,w:d.w,h:d.h,sides:back?{front,back}:undefined,origin:'design'}; }
async function imSrcEnvelope(){ if(typeof envHTML!=='function'||typeof tpl!=='function') return null; const keep={size:st.size,custom:st.custom};
  let W,H,fh,bh; try{ if(st.ui&&st.ui.app==='print'){ const E=st.envMem||{}; st.size=E.size||'DL'; if(E.custom) st.custom=Object.assign({},E.custom); }
    ({W,H}=dims()); const t=tpl(), rec=currentRec(), clean=h=>String(h).replace(/<svg class="guide"[\s\S]*?<\/svg>/g,'');
    /* a real envelope goes out with a postage stamp: when the design has none on the front, put one into the stamp box for the photo */
    const pst=st.postage; if(typeof POSTAGE_STAMPS!=='undefined'&&!(pst||[]).some(p=>(p.side||'front')==='front')&&!st.stampImg&&!(st.stampD&&st.stampD.on)) st.postage=(pst||[]).concat([{id:'igm_tmp',stamp:(POSTAGE_STAMPS.find(d=>d.cat==='armenia')||POSTAGE_STAMPS[0]).id,x:null,y:null,w:22,rot:-2,opacity:1,side:'front'}]);
    try{ fh=clean(envHTML(t,rec,{side:'front'})); } finally{ st.postage=pst; } bh=clean(envHTML(t,rec,{side:'back'})); }
  catch(e){ console.warn('[instamock] env',e); return null; } finally{ st.size=keep.size; st.custom=keep.custom; }
  const pg=h=>`<div class="page" style="width:${W}mm;height:${H}mm">${h}</div>`; const f=await imRaster(pg(fh),W,H,2000), b=await imRaster(pg(bh),W,H,2000);
  let nm='Конверт'; try{ const s=SIZES.find(x=>x.id===(st.envMem&&st.ui.app==='print'?st.envMem.size:st.size)); if(s&&s.n) nm='Конверт '+s.n; }catch(_){ }
  return {id:'env:'+imHash(fh+bh),kind:'envelope',name:nm+' · «Конверты»',src:imURL(f,'image/jpeg'),w:W,h:H,sides:{front:imURL(f,'image/jpeg'),back:imURL(b,'image/jpeg')},origin:'envelope'}; }
async function imSrcStamps(){ const out=[]; if(typeof rsSVG!=='function') return out; const list=[];
  try{ (st.rst||[]).forEach(x=>list.push(Object.assign({},x))); }catch(_){ }
  try{ const d=st.dz; ['front','back'].forEach(s=>((d&&d[s])||[]).forEach(e=>{ if(e&&e.t==='stamp'&&e.st) list.push(Object.assign({},e.st)); })); }catch(_){ }
  if(!list.length){ const nm=((st.shop&&st.shop.name)||'tadhayrapetian').toUpperCase().slice(0,22); list.push({id:'round',t1:nm,t2:'ЕРЕВАН',t3:'★ 2026 ★',color:'#8b1e1e',grunge:.25,seed:3}); list.push({id:'handmade',t1:'HANDMADE',t2:'с любовью',t3:'',color:'#5a2d82',grunge:.2,seed:5}); }
  const seen=new Set(); for(const x of list.slice(0,4)){ const D=(typeof stampById==='function'&&stampById(x.id))||{r:1,n:'Штамп'}; const k=JSON.stringify([x.id,x.t1,x.t2,x.t3,x.color]); if(seen.has(k)) continue; seen.add(k);
    try{ const wmm=40, hmm=40*D.r, svg=rsSVG(Object.assign({},x,{grunge:Math.min(.25,+x.grunge||0),rot:0}),true), html=`<div style="position:relative;width:${wmm}mm;height:${hmm}mm;background:#fff">${svg}</div>`;
      const cv=await imRaster(html,wmm,hmm,1600), cut=imKeyWhite(cv); out.push({id:'rs:'+imHash(k),kind:'stamp',name:'Штамп «'+(D.n||x.id)+'»'+(x.t1?' · '+x.t1:''),src:imURL(cut),w:wmm,h:hmm,origin:'stamp'}); }catch(e){ console.warn('[instamock] stamp',e); } }
  return out; }
let IM_PFONT=null;
async function imPostageFonts(){ if(IM_PFONT!==null) return IM_PFONT; try{ IM_PFONT=typeof fontCSSFor==='function'?await Promise.race([fontCSSFor(['Playfair Display','Oswald']),new Promise(r=>setTimeout(()=>r(''),6000))]):''; }catch(_){ IM_PFONT=''; } if(!/data:/.test(IM_PFONT||'')) IM_PFONT=''; return IM_PFONT; }
async function imSvgCanvas(svg,px){ const m=svg.match(/viewBox="([\d.\s-]+)"/), vb=m?m[1].trim().split(/\s+/).map(Number):[0,0,100,100], k=px/Math.max(vb[2],vb[3]), css=await imPostageFonts();
  const s=svg.replace(/<svg\b/,`<svg width="${Math.round(vb[2]*k)}" height="${Math.round(vb[3]*k)}"`).replace(/(<svg[^>]*>)/,`$1${css?'<style>'+css+'</style>':''}`);
  const im=await imLoad('data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s)); if(!im) return null; const c=imC(Math.round(vb[2]*k),Math.round(vb[3]*k)); c.getContext('2d').drawImage(im,0,0,c.width,c.height); return c; }
async function imSrcPostage(){ const out=[]; if(typeof postageSvg!=='function'||typeof POSTAGE_STAMPS==='undefined') return out; let ids=[];
  try{ ids=(st.postage||[]).map(p=>p.stamp); }catch(_){ } if(!ids.length) ids=POSTAGE_STAMPS.filter(d=>d.cat==='armenia').slice(0,3).map(d=>d.id); ids=[...new Set(ids)].slice(0,4);
  for(const id of ids){ const d=POSTAGE_STAMPS.find(x=>x.id===id); if(!d) continue; const key='ps:'+id, hit=imCacheGet(key); if(hit){ out.push(hit); continue; }
    try{ const cv=await imSvgCanvas(postageSvg(d),900); if(!cv) continue; let nm=d.name; try{ nm=postageName(d); }catch(_){ } out.push(imCacheSet(key,{id:key,kind:'stamp',postage:true,name:'Марка «'+nm+'»',src:imURL(cv),origin:'postage'})); }catch(e){ console.warn('[instamock] postage',e); } }
  return out; }
async function imSrcMark(){ if(!KS.thSVG) return null; const key='th:'+((st.shop&&st.shop.name)||''), hit=imCacheGet(key); if(hit) return hit;
  try{ const svg=KS.thSVG({v:'monoword',color:'ink'},dzPal({ink:'#2b2622'})), html=`<div style="position:relative;width:40mm;height:40mm;background:#fff">${svg}</div>`, cv=await imRaster(html,40,40,1600), cut=imKeyWhite(cv);
    return imCacheSet(key,{id:'th:mark',kind:'seal',mark:true,name:'Знак TH · tadhayrapetian',src:imURL(cut),w:40,h:40,origin:'mark'}); }catch(e){ console.warn('[instamock] mark',e); return null; } }
async function imSrcNotebook(){ try{ const r=await KS.idb.get('nb:cover','files'); if(r&&r.front) return {id:'nb:'+imHash(String(r.updated||'')+r.front.length),kind:'notebook',name:'Блокнот · обложка',src:r.front,w:r.w,h:r.h,sides:r.back?{front:r.front,back:r.back}:undefined,origin:'notebook'}; }catch(_){ }
  if(KS.nbCover&&KS.nbCover.thumb){ try{ const t=await Promise.race([KS.nbCover.thumb(200),new Promise(r=>setTimeout(()=>r(null),15000))]); if(t){ const g=KS.nbCover.geo?KS.nbCover.geo():{}; return {id:'nb:t'+imHash(t.slice(-200)),kind:'notebook',name:'Блокнот · обложка',src:t,w:g.w,h:g.h,origin:'notebook'}; } }catch(_){ } }
  return null; }
async function imSrcPhotos(n){ const out=[]; try{ const keys=(await KS.idb.keys('files')).filter(k=>typeof k==='string'&&k.startsWith('ph:')); const recs=[];
    for(const k of keys){ try{ const r=await KS.idb.get(k,'files'); if(r&&r.data) recs.push(r); }catch(_){ } }
    recs.sort((a,b)=>(b.added||0)-(a.added||0)).slice(0,n||24).forEach(r=>out.push({id:'ph:'+r.id,kind:r.album==='Логотипы'?'other':'photo',name:r.name||'Фото',src:r.data,thumb:r.thumb,w:r.w,h:r.h,origin:'photo'})); }catch(_){ }
  return out; }
async function imSrcUploads(){ const out=[]; try{ const keys=(await KS.idb.keys('files')).filter(k=>typeof k==='string'&&k.startsWith('igm:up:'));
    for(const k of keys){ try{ const r=await KS.idb.get(k,'files'); if(r&&r.src) out.push({id:r.id,kind:r.kind||'other',name:r.name||'Файл',src:r.src,thumb:r.thumb,w:r.w,h:r.h,sides:r.back?{front:r.src,back:r.back}:undefined,origin:'upload',added:r.added}); }catch(_){ } } }catch(_){ }
  return out.sort((a,b)=>(b.added||0)-(a.added||0)); }
/* all sources; heavy rasters are cached by content, so repeated calls are quick */
async function imSources(o){ o=o||{}; if(IMS.busy&&!o.force) return IMS.busy;
  IMS.busy=(async()=>{ const out=[], add=s=>{ if(s) [].concat(s).forEach(x=>{ if(x&&x.src) out.push(x); }); };
    if(imHasApp()){ for(const f of [imSrcDesign,imSrcEnvelope,imSrcMark,imSrcStamps,imSrcPostage,imSrcNotebook]){ try{ add(await f()); }catch(e){ console.warn('[instamock] source',e); } if(o.onProgress) try{ o.onProgress(out.slice()); }catch(_){ } } }
    add(await imSrcUploads()); if(o.photos!==false) add(await imSrcPhotos(o.photoMax||24));
    IMS.list=out; IMS.at=Date.now(); return out; })();
  try{ return await IMS.busy; } finally{ IMS.busy=null; } }
/* ---------- p7: public API for the «insta» module and others ---------- */
async function imGradeAny(img,look,o){ o=o||{}; const im=typeof img==='string'?await imLoad(img):img; if(!im) throw new Error('image'); const cv=imToCanvas(im,o.max||3000); imGradeCanvas(cv,look,o); return o.canvas?cv:cv.toDataURL(o.type||'image/jpeg',o.quality||.92); }
const imSceneInfo=s=>({id:s.id,name:s.name,cat:s.cat,catName:(IM_CATS.find(c=>c[0]===s.cat)||[,''])[1],look:s.look||null,aspect:['1:1','4:5'],needs:s.needs.slice(),angled:!!s.cam});
KS.instaMock={ver:1,
  looks:()=>{ const o={}; imLooksPublic().forEach(l=>{ o[l.id]=l; }); return o; },
  look:id=>Object.assign({id:IM_LOOKS[id]?id:'linen'},JSON.parse(JSON.stringify(imLook(id)))),
  scenes:()=>IM_SCENES.map(imSceneInfo), cats:()=>IM_CATS.map(([id,name])=>({id,name})), props:()=>IM_PROPS.map(([id,name])=>({id,name})), kinds:()=>Object.assign({},IM_KIND_N),
  sources:o=>imSources(o),
  render:async(src,sceneId,o)=>{ o=o||{}; const cv=await imRenderCanvas(src,sceneId,o); return o.canvas?cv:cv.toDataURL(o.type||'image/jpeg',o.quality||.92); },
  grade:(img,look,o)=>imGradeAny(img,look,o),
  set9:(srcs,look,o)=>imSet9(srcs,look,o) };
/* ---------- p8: «Мокапы» sub-tab of the «Instagram» section ---------- */
const IGM_ICON='<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".7" fill="currentColor" stroke="none"/>';
const igmS=()=>KS.store('instamock',{look:'',scene:'env-seal',aspect:'4:5',props:Object.assign({},IM_PROPS_DEF),sel:[],seed:1,text:'',brand:'',cat:'all',kinds:{}});
const IGM={src:[],thumbs:{},tok:0,cv:null,busy:0,loading:false,loaded:false,stTok:0,set:null,setTok:0,setN:0,box:null,scr:null,lastKey:''};
const igmLook=()=>{ const s=igmS(); if(s.look&&IM_LOOKS[s.look]) return s.look; let a=''; try{ const I=st.ks&&st.ks.insta; a=(I&&(I.look||(I.style&&I.style.look)))||''; }catch(_){ } return IM_LOOKS[a]?a:'linen'; };
const igmBrand=()=>{ const s=igmS(); return s.brand||(st.shop&&st.shop.name)||'tadhayrapetian'; };
const igmEsc=s=>KS.esc(String(s==null?'':s));
function igmThumb(src,max){ return imLoad(src).then(im=>{ if(!im) return ''; const w=im.naturalWidth||im.width, h=im.naturalHeight||im.height, k=Math.min(1,(max||240)/Math.max(w,h)), c=imC(w*k,h*k); imCtx(c).drawImage(im,0,0,c.width,c.height); return c.toDataURL('image/png'); }).catch(()=>''); }
/* selected sources (fallback: the first one); postage stamps and the TH mark always come along as props */
function igmSelected(){ const s=igmS(), by=new Map(IGM.src.map(x=>[x.id,x])); let a=(s.sel||[]).map(id=>by.get(id)).filter(Boolean); if(!a.length){ const d=IGM.src.find(x=>!x.postage); if(d) a=[d]; }
  const extras=IGM.src.filter(x=>x.postage&&!a.includes(x)); return a.map(x=>Object.assign({},x,{kind:(s.kinds&&s.kinds[x.id])||x.kind})).concat(extras); }
const igmOpts=o=>{ const s=igmS(); return Object.assign({look:igmLook(),aspect:s.aspect,size:1080,seed:s.seed,props:Object.assign({},IM_PROPS_DEF,s.props),text:s.text||'',brand:igmBrand()},o||{}); };
const igmName=(sc,look,size)=>'mokap-'+sc+'-'+look+'-'+size+'.jpg';

/* ---------- loading sources ---------- */
async function igmLoadSources(force){ if(IGM.loading) return; IGM.loading=true; igmPaintSources();
  try{ const keep=()=>IGM.src.filter(x=>x.origin==='upload'||x.origin==='photo');
    const list=await KS.instaMock.sources({force:!!force,onProgress:part=>{ const k=keep().filter(x=>!part.some(p=>p.id===x.id)); IGM.src=part.concat(k); igmPaintSources(); igmThumbAll(); }});
    IGM.src=list; IGM.loaded=true; }
  catch(e){ console.warn('[instamock] sources',e); KS.toast('Не удалось собрать макеты из приложения'); }
  finally{ IGM.loading=false; }
  await igmThumbAll(); const s=igmS(); s.sel=(s.sel||[]).filter(id=>IGM.src.some(x=>x.id===id)); if(!s.sel.length){ const d=IGM.src.find(x=>!x.postage&&!x.mark&&x.origin!=='photo'); if(d) s.sel=[d.id]; } KS.save();
  igmPaintSources(); igmPaintScenes(); igmRun(); }
let igmThumbP=null;
function igmThumbAll(){ if(igmThumbP) return igmThumbP; igmThumbP=(async()=>{ let ch=false; for(const x of IGM.src.slice()) if(!IGM.thumbs[x.id]){ IGM.thumbs[x.id]=x.thumb||await igmThumb(x.src,260); ch=true; } if(ch) igmPaintSources(); })().finally(()=>{ igmThumbP=null; }); return igmThumbP; }

/* ---------- uploads (IDB 'files', keys igm:up:<id>) ---------- */
function igmGuessKind(w,h,cut){ const a=w/h; if(cut) return 'stamp'; if(a>1.85) return 'envelope'; if(a>1.6) return 'card'; if(a>1.25) return 'postcard'; if(a>.95) return 'photo'; if(a>.76) return 'invitation'; return 'letter'; }
async function igmUpload(files){ files=[...(files||[])].filter(f=>/^image\//.test(f.type)); if(!files.length) return; let n=0;
  for(const f of files){ try{ const data=await KS.readImage(f,2600), im=await imLoad(data); if(!im) continue; const cv=imToCanvas(im,600), cut=/png|webp|gif/.test(f.type)&&!!imAlphaBox(cv), id='igm:up:'+KS.uid('u');
      const rec={id,name:(f.name||'Файл').replace(/\.[a-z0-9]+$/i,'').slice(0,60),kind:igmGuessKind(im.naturalWidth,im.naturalHeight,cut),src:data,thumb:await igmThumb(data,260),w:im.naturalWidth,h:im.naturalHeight,added:Date.now()+n};
      await KS.idb.set(id,rec,'files'); IGM.src.unshift(Object.assign({origin:'upload'},rec)); IGM.thumbs[id]=rec.thumb; const s=igmS(); s.sel=[id].concat((s.sel||[]).filter(x=>x!==id)).slice(0,6); n++; }
    catch(e){ console.warn('[instamock] upload',e); } }
  KS.save(); KS.toast(n===1?'Файл добавлен и выбран':n?'Добавлено файлов: '+n:'Не получилось открыть файл'); igmPaintSources(); igmPaintScenes(); igmRun(); }
async function igmDelUpload(id){ try{ await KS.idb.del(id,'files'); }catch(_){ } IGM.src=IGM.src.filter(x=>x.id!==id); const s=igmS(); s.sel=(s.sel||[]).filter(x=>x!==id); KS.save(); igmPaintSources(); igmPaintScenes(); igmRun(); }

/* ---------- side panel ---------- */
function igmPanel(box){ const s=igmS(), look=igmLook(), P=Object.assign({},IM_PROPS_DEF,s.props), feed=KS.insta&&KS.insta.addPosts;
  box.innerHTML=`<div class="card igm-card"><div class="hd">Стиль ленты <span class="igm-sub">один на все фото</span></div>
      <div class="igm-looks">${IM_LOOK_IDS.map(id=>{ const L=IM_LOOKS[id]; return `<button class="igm-look${id===look?' on':''}" data-igmlook="${id}" title="${igmEsc(L.desc)}"><span class="igm-pal">${L.palette.map(c=>`<i style="background:${c}"></i>`).join('')}</span><b>${igmEsc(L.name)}</b></button>`; }).join('')}</div>
      <p class="hint igm-ldesc">${igmEsc(IM_LOOKS[look].desc)}</p></div>
    <div class="card igm-card"><div class="hd">Детали в кадре</div><div class="igm-props">${IM_PROPS.map(([k,n])=>`<button class="igm-chip${P[k]!==false?' on':''}" data-igmprop="${k}" aria-pressed="${P[k]!==false}">${n}</button>`).join('')}</div></div>
    <div class="card igm-card"><div class="hd">Текст для фото-цитаты</div><label class="f">Цитата<input type="text" id="igmText" maxlength="90" value="${igmEsc(s.text)}" placeholder="${igmEsc(IM_QUOTES[0])}"></label>
      <label class="f">Подпись<input type="text" id="igmBrand" maxlength="40" value="${igmEsc(s.brand)}" placeholder="${igmEsc(igmBrand())}"></label></div>
    <div class="card igm-card"><div class="hd">Готовое фото</div><div class="igm-acts">
      <button class="btn primary" data-igmdl="1080">JPG ${s.aspect==='1:1'?'1080 × 1080':'1080 × 1350'}</button><button class="btn" data-igmdl="2160">JPG ${s.aspect==='1:1'?'2160 × 2160':'2160 × 2700'}</button>
      <button class="btn" data-igmlib="1">В мои фото</button><button class="btn" data-igmfeed="1" title="${feed?'Отправить в «Ленту»':'Сохранить, чтобы добавить в «Ленту»'}">В ленту</button></div></div>
    <div class="card igm-card"><div class="hd">9 фото в одном стиле</div><p class="hint">Готовая сетка для профиля: разные сцены, один свет и цвет.</p><button class="btn primary igm-wide" data-igm9="1">Сделать 9 мокапов в одном стиле</button></div>`; }

/* ---------- screen ---------- */
function igmScreen(scr){ const s=igmS();
  scr.innerHTML=`<div class="igm-head"><div><h2>Мокапы</h2><p class="hint">Ваши макеты в фото-сценах · рисуется на устройстве, без ИИ и бесплатно</p></div>
      <div class="seg igm-aspect">${[['4:5','4 : 5'],['1:1','1 : 1']].map(([k,n])=>`<button data-igmaspect="${k}"${s.aspect===k?' class="on"':''}>${n}</button>`).join('')}</div></div>
    <div class="igm-main" id="igmMain"><div class="igm-stagecol"><div class="igm-stage${s.aspect==='1:1'?' sq':''}" id="igmStage"><div class="igm-busy"><i></i><span>Рисую сцену…</span></div></div>
        <p class="hint igm-info" id="igmInfo">&nbsp;</p><div class="igm-bar"><button class="btn" data-igmseed="1">↻ Ещё вариант</button><button class="btn primary" data-igmdl="1080">Скачать JPG</button></div></div>
      <div class="igm-right"><div class="igm-srcwrap"><div class="igm-srchd"><b>Что фотографируем</b><span class="ks-sp"></span><button class="btn sm" data-igmrefresh="1" title="Собрать заново из «Типографии» и «Конвертов»">Обновить</button></div><span class="hint igm-srchint" id="igmSrcHint"></span>
          <div class="igm-srcs" id="igmSrcs"></div></div>
        <div class="igm-scenecol"><div class="igm-cats">${[['all','Все']].concat(IM_CATS).map(([k,n])=>`<button class="igm-chip${s.cat===k?' on':''}" data-igmcat="${k}">${n}</button>`).join('')}</div><div class="igm-sgrid" id="igmScenes"></div></div></div></div>
    <div class="igm-setwrap" id="igmSet" hidden></div>`;
  igmPaintSources(); igmPaintScenes(); if(IGM.loaded||IGM.src.length) igmRun(); }
function igmPaintSources(){ const box=document.getElementById('igmSrcs'); if(!box) return; const s=igmS(), sel=s.sel||[];
  const tiles=IGM.src.filter(x=>!x.postage).map(x=>{ const i=sel.indexOf(x.id), k=(s.kinds&&s.kinds[x.id])||x.kind, th=IGM.thumbs[x.id];
    return `<div class="igm-src${i>=0?' on':''}" data-igmsrc="${igmEsc(x.id)}" role="button" tabindex="0" aria-pressed="${i>=0}" title="${igmEsc(x.name)}"><span class="igm-th">${th?`<img src="${th}" alt="">`:'<i class="igm-sk"></i>'}</span>
      ${i>=0?`<em>${i+1}</em>`:''}<small>${igmEsc(x.name)}</small>${x.origin==='upload'?`<select class="igm-kind" data-igmkind="${igmEsc(x.id)}" aria-label="Что это">${Object.entries(IM_KIND_N).map(([v,n])=>`<option value="${v}"${v===k?' selected':''}>${n}</option>`).join('')}</select><button class="igm-x" data-igmdel="${igmEsc(x.id)}" aria-label="Удалить" title="Удалить файл">✕</button>`:`<span class="igm-kb">${igmEsc(IM_KIND_N[k]||'')}</span>`}</div>`; }).join('');
  box.innerHTML=`<div class="igm-src igm-up" data-igmup="1" role="button" tabindex="0"><span class="igm-th"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V5M7 10l5-5 5 5M5 19h14"/></svg></span><small>Загрузить файл</small><span class="igm-kb">или перетащите</span></div>`+tiles+(IGM.loading?`<div class="igm-src igm-load"><span class="igm-th"><i class="igm-sk"></i></span><small>Собираю макеты…</small></div>`:'');
  const h=document.getElementById('igmSrcHint'); if(h) h.textContent=IGM.loading?'собираю из «Типографии», «Конвертов», штампов и блокнота…':!IGM.src.length?'загрузите фото или макет':'нажмите, чтобы выбрать; можно несколько'; }
function igmSceneOk(sc,kinds){ return !sc.needs.length||sc.needs.some(k=>kinds.has(k)); }
function igmPaintScenes(){ const box=document.getElementById('igmScenes'); if(!box) return; const s=igmS(), kinds=new Set(igmSelected().filter(x=>!x.postage).map(x=>x.kind));
  const list=IM_SCENES.filter(sc=>s.cat==='all'||sc.cat===s.cat).sort((a,b)=>(igmSceneOk(b,kinds)?1:0)-(igmSceneOk(a,kinds)?1:0));
  box.innerHTML=list.map(sc=>`<button class="igm-scene${sc.id===s.scene?' on':''}${igmSceneOk(sc,kinds)?'':' dim'}" data-igmscene="${sc.id}"><span class="igm-sth${s.aspect==='1:1'?' sq':''}" data-igmsth="${sc.id}"><i class="igm-sk"></i></span><b>${igmEsc(sc.name)}</b><small>${igmEsc((IM_CATS.find(c=>c[0]===sc.cat)||[,''])[1])}${sc.cam?' · под углом':''}</small></button>`).join('');
  igmThumbs(); }
/* live scene thumbnails, rendered one by one (cached) */
async function igmThumbs(){ if(!IGM.loaded&&!IGM.src.length) return; const tok=++IGM.stTok, s=igmS(), srcs=igmSelected(), look=igmLook(), key0=[look,s.aspect,s.seed,JSON.stringify(s.props),srcs.map(x=>x.id+':'+x.kind).join(','),s.text,igmBrand()].join('|');
  await new Promise(r=>setTimeout(r,30)); for(const el of [...document.querySelectorAll('[data-igmsth]')]){ if(tok!==IGM.stTok) return; const id=el.dataset.igmsth, key=id+'|'+key0; if(el.dataset.k===key) continue;
    const hit=IGM.thumbs['sc:'+key]; if(hit){ el.innerHTML=`<img src="${hit}" alt="">`; el.dataset.k=key; continue; }
    while(IGM.busy&&tok===IGM.stTok) await new Promise(r=>setTimeout(r,60)); if(tok!==IGM.stTok||!el.isConnected) return;
    try{ const cv=await imRenderCanvas(srcs,id,igmOpts({size:240})), d=cv.toDataURL('image/jpeg',.82); IGM.thumbs['sc:'+key]=d; if(tok!==IGM.stTok) return; el.innerHTML=`<img src="${d}" alt="">`; el.dataset.k=key; }catch(e){ console.warn('[instamock] thumb',id,e); } await imTick(); } }
/* the big preview */
async function igmRun(){ const sg=document.getElementById('igmStage'); if(!sg) return; const tok=++IGM.tok, s=igmS(), look=igmLook(); sg.classList.add('busy'); sg.classList.toggle('sq',s.aspect==='1:1'); IGM.busy++;
  try{ const t0=performance.now(), cv=await imRenderCanvas(igmSelected(),s.scene,igmOpts({size:1080})); if(tok!==IGM.tok) return; cv.className='igm-view'; sg.querySelectorAll('canvas').forEach(c=>c.remove()); sg.appendChild(cv); IGM.cv=cv; IGM.cvScene=s.scene; IGM.cvLook=look;
    const info=document.getElementById('igmInfo'); if(info) info.textContent=`${imScene(s.scene).name} · ${IM_LOOKS[look].name} · ${Math.max(.1,(performance.now()-t0)/1000).toFixed(1)} с`; }
  catch(e){ console.warn('[instamock] render',e); if(tok===IGM.tok) KS.toast('Не получилось нарисовать сцену'); }
  finally{ IGM.busy--; if(tok===IGM.tok) sg.classList.remove('busy'); } }

/* ---------- saving ---------- */
const igmBlob=(cv,q)=>new Promise((res,rej)=>{ try{ cv.toBlob(b=>b?res(b):rej(new Error('blob')),'image/jpeg',q||.92); }catch(e){ rej(e); } });
async function igmDownload(size){ const s=igmS(), look=igmLook(); let cv=IGM.cv; KS.toast(size>1080?'Готовлю большое фото…':'Сохраняю…');
  try{ if(size>1080||!cv||IGM.cvScene!==s.scene||IGM.cvLook!==look) cv=await imRenderCanvas(igmSelected(),s.scene,igmOpts({size})); const b=await igmBlob(cv,.93), fn=igmName(s.scene,look,cv.width); if(await KS.download(fn,b)!==false) KS.toast('Сохранено: '+fn); }
  catch(e){ console.warn('[instamock] dl',e); KS.toast('Не удалось сохранить фото'); } }
async function igmToLib(cv,name){ try{ const data=cv.toDataURL('image/jpeg',.92); if(KS.photos&&KS.photos.add) await KS.photos.add({data,name,album:'Разное'});
    else { const id=KS.uid('ph'), t=imC(360,360*cv.height/cv.width); imCtx(t).drawImage(cv,0,0,t.width,t.height); await KS.idb.set('ph:'+id,{id,name,type:'image/jpeg',data,thumb:t.toDataURL('image/jpeg',.85),w:cv.width,h:cv.height,album:'Разное',added:Date.now()},'files'); KS.emit('photosChanged'); }
    return true; }catch(e){ console.warn('[instamock] lib',e); return false; } }
/* finished photos go to the «Лента» (insta module) — or wait in IDB (igm:feed:<id>) until it picks them up */
async function igmToFeed(items){ const posts=items.map(x=>({id:KS.uid('igm'),src:x.src,name:x.name,look:x.look,scene:x.scene,w:x.w,h:x.h,from:'instamock',added:Date.now()}));
  try{ if(KS.insta&&typeof KS.insta.addPosts==='function'){ await KS.insta.addPosts(posts); KS.toast(posts.length>1?'Отправлено в ленту: '+posts.length:'Отправлено в ленту'); KS.emit('igmPosts',posts); return true; }
    for(const p of posts) await KS.idb.set('igm:feed:'+p.id,p,'files'); KS.emit('igmPosts',posts); KS.toast(posts.length>1?'Сохранено для ленты: '+posts.length+' фото':'Сохранено для ленты'); return true; }
  catch(e){ console.warn('[instamock] feed',e); KS.toast('Не удалось передать в ленту'); return false; } }
async function igmPending(){ const out=[]; try{ for(const k of await KS.idb.keys('files')) if(typeof k==='string'&&k.startsWith('igm:feed:')){ const r=await KS.idb.get(k,'files'); if(r) out.push(r); } }catch(_){ } return out.sort((a,b)=>a.added-b.added); }

/* ---------- 9 photos in one style ---------- */
function imPlan9(srcs,look,seed){ const kinds=new Set(srcs.filter(x=>!x.postage).map(x=>x.kind)), r=imRng((seed||1)*131+imHash(look)), used=new Set(), cats=new Map();
  const type=sc=>sc.cat==='text'?'text':sc.cat==='detail'?'detail':sc.cam?'angle':'flat', score=sc=>(igmSceneOk(sc,kinds)?(sc.needs.length?3:1):-12)+r()*1.5-(cats.get(sc.cat)||0)*1.3;
  const slots=['flat','angle','flat','detail','text','flat','flat','angle','detail'], plan=[];
  for(const t of slots){ const c=IM_SCENES.filter(sc=>!used.has(sc.id)&&type(sc)===t&&sc.id!=='quote-card').sort((a,b)=>score(b)-score(a)), pick=c[0]||IM_SCENES.filter(sc=>!used.has(sc.id)).sort((a,b)=>score(b)-score(a))[0];
    if(!pick) break; used.add(pick.id); cats.set(pick.cat,(cats.get(pick.cat)||0)+1); plan.push(pick.id); }
  return plan; }
async function imSet9(srcs,look,o){ o=o||{}; srcs=srcs||[]; const plan=imPlan9(srcs,look,o.seed), main=srcs.filter(x=>!x.postage), extra=srcs.filter(x=>x.postage), out=[];
  for(let i=0;i<plan.length;i++){ if(o.cancel&&o.cancel()) break; const k=main.length?i%main.length:0, list=main.slice(k).concat(main.slice(0,k)).concat(extra);
    const cv=await imRenderCanvas(list,plan[i],Object.assign({},o,{look,seed:(o.seed||1)*10+i+1,size:o.size||1080})), item={scene:plan[i],look,src:cv.toDataURL('image/jpeg',.9),w:cv.width,h:cv.height,name:imScene(plan[i]).name};
    out.push(item); if(o.onItem) try{ o.onItem(item,i); }catch(_){ } await imTick(); }
  return out; }
async function igmMake9(){ const box=document.getElementById('igmSet'), main=document.getElementById('igmMain'); if(!box) return; const tok=++IGM.setTok, look=igmLook(), s=igmS(), feed=KS.insta&&KS.insta.addPosts;
  box.hidden=false; if(main) main.hidden=true; IGM.set={items:[],look}; IGM.setN++;
  box.innerHTML=`<div class="igm-sethd"><div><b>9 фото · ${igmEsc(IM_LOOKS[look].name)}</b><span class="hint" id="igmSetInfo">Рисую 1 из 9…</span></div><span class="ks-sp"></span><button class="btn" data-igm9back="1">← К сцене</button><button class="btn" data-igm9again="1">↻ Другие 9</button><button class="btn" data-igm9feed="1" disabled>${feed?'Все в ленту':'Сохранить для ленты'}</button><button class="btn primary" data-igm9zip="1" disabled>Скачать ZIP</button></div>
    <div class="igm-grid9${s.aspect==='1:1'?' sq':''}">${Array.from({length:9},(_,i)=>`<div class="igm-g9" data-igm9i="${i}"><i class="igm-sk"></i></div>`).join('')}</div>`;
  try{ await imSet9(igmSelected(),look,igmOpts({seed:(s.seed||1)+IGM.setN*97,cancel:()=>tok!==IGM.setTok,onItem:(it,i)=>{ if(tok!==IGM.setTok) return; IGM.set.items[i]=it; const el=box.querySelector(`[data-igm9i="${i}"]`); if(el) el.innerHTML=`<img src="${it.src}" alt=""><small>${igmEsc(it.name)}</small>`;
      const inf=document.getElementById('igmSetInfo'); if(inf) inf.textContent=i<8?`Рисую ${i+2} из 9…`:`Готово: 9 фото ${it.w} × ${it.h}, один стиль`; }})); }
  catch(e){ console.warn('[instamock] set9',e); KS.toast('Не получилось собрать 9 фото'); }
  if(tok!==IGM.setTok) return; box.querySelectorAll('[data-igm9zip],[data-igm9feed]').forEach(b=>b.disabled=!IGM.set.items.length); }
async function igmZip(){ const S=IGM.set; if(!S||!S.items.length) return; KS.toast('Собираю ZIP…');
  try{ const JSZip=await loadLib('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',()=>window.JSZip), z=new JSZip();
    S.items.forEach((it,i)=>{ if(it) z.file(String(i+1).padStart(2,'0')+'-'+it.scene+'.jpg',it.src.split(',')[1],{base64:true}); });
    const b=await z.generateAsync({type:'blob'}), fn='instagram-9-'+S.look+'.zip'; if(await KS.download(fn,b)!==false) KS.toast('Сохранено: '+fn); }
  catch(e){ console.warn('[instamock] zip',e); KS.toast('Не удалось собрать ZIP'); } }

/* ---------- tab registration: at boot, after the «insta» module, so its «Лента» stays the first sub-tab ---------- */
let igmReg=false;
function igmRegister(){ if(igmReg) return; igmReg=true;
  KS.tab({id:'igmock',group:'insta',groupTitle:'Instagram',groupIcon:KS.icon(IGM_ICON),icon:KS.icon(IGM_ICON),seg:'Мокапы',title:'Мокапы',app:'print',before:'prep',screen:true,render(box,o){
    if(o.reason==='show'||IGM.box!==box||!box.querySelector('.igm-card')){ IGM.box=box; KS.keepFocus(box,()=>igmPanel(box)); if(o.screen){ IGM.scr=o.screen; igmScreen(o.screen); } if(!IGM.loaded&&!IGM.loading) igmLoadSources(); } }});
  KS.cmd('Мокапы для Instagram','instagram',()=>KS.show('insta','igmock'));
  KS.cmd('9 мокапов в одном стиле','instagram',()=>{ KS.show('insta','igmock'); setTimeout(igmMake9,80); }); }
KS.on('boot',igmRegister);
const igmOn=()=>{ const a=KS.active&&KS.active(); return !!(a&&a.id==='igmock'); };
function igmRefreshAll(){ const box=IGM.box; if(box&&box.isConnected) KS.keepFocus(box,()=>igmPanel(box)); igmPaintScenes(); igmRun(); }
function igmBackToScene(){ IGM.setTok++; const set=document.getElementById('igmSet'), mn=document.getElementById('igmMain'); if(set) set.hidden=true; if(mn) mn.hidden=false; }

document.addEventListener('click',e=>{ const t=e.target; if(!t.closest||!(t.closest('[data-panel="ks-insta"]')||t.closest('.ksscreen'))) return; let b;
  if((b=t.closest('[data-igmlook]'))){ igmS().look=b.dataset.igmlook; KS.save(); igmRefreshAll(); return; }
  if((b=t.closest('[data-igmprop]'))){ const s=igmS(), k=b.dataset.igmprop; s.props=Object.assign({},IM_PROPS_DEF,s.props); s.props[k]=!(s.props[k]!==false); KS.save(); b.classList.toggle('on',s.props[k]); b.setAttribute('aria-pressed',String(s.props[k])); igmPaintScenes(); igmRun(); return; }
  if((b=t.closest('[data-igmaspect]'))){ const s=igmS(); if(s.aspect===b.dataset.igmaspect) return; s.aspect=b.dataset.igmaspect; KS.save(); document.querySelectorAll('[data-igmaspect]').forEach(x=>x.classList.toggle('on',x===b)); igmBackToScene(); igmRefreshAll(); return; }
  if((b=t.closest('[data-igmcat]'))){ igmS().cat=b.dataset.igmcat; KS.save(); document.querySelectorAll('[data-igmcat]').forEach(x=>x.classList.toggle('on',x===b)); igmPaintScenes(); return; }
  if((b=t.closest('[data-igmscene]'))){ const s=igmS(); s.scene=b.dataset.igmscene; KS.save(); document.querySelectorAll('[data-igmscene]').forEach(x=>x.classList.toggle('on',x===b)); igmBackToScene(); igmRun(); return; }
  if((b=t.closest('[data-igmseed]'))){ const s=igmS(); s.seed=((s.seed||1)%9999)+1; KS.save(); igmRun(); igmThumbs(); return; }
  if((b=t.closest('[data-igmdel]'))){ e.stopPropagation(); igmDelUpload(b.dataset.igmdel); return; }
  if(t.closest('[data-igmkind]')) return;
  if((b=t.closest('[data-igmup]'))){ KS.pick('image/*',true).then(igmUpload); return; }
  if((b=t.closest('[data-igmsrc]'))){ const s=igmS(), id=b.dataset.igmsrc; s.sel=(s.sel||[]).slice(); const i=s.sel.indexOf(id); if(i>=0){ if(s.sel.length>1) s.sel.splice(i,1); } else s.sel.push(id); if(s.sel.length>6) s.sel.shift(); KS.save(); igmPaintSources(); igmPaintScenes(); igmRun(); return; }
  if((b=t.closest('[data-igmrefresh]'))){ IGM.loaded=false; igmLoadSources(true); return; }
  if((b=t.closest('[data-igmdl]'))){ igmDownload(+b.dataset.igmdl||1080); return; }
  if((b=t.closest('[data-igmlib]'))){ if(!IGM.cv){ KS.toast('Фото ещё рисуется…'); return; } igmToLib(IGM.cv,'Instagram · '+imScene(IGM.cvScene).name).then(ok=>KS.toast(ok?'В «Мои фото» → «Разное»':'Не удалось сохранить в «Мои фото»')); return; }
  if((b=t.closest('[data-igmfeed]'))){ if(!IGM.cv){ KS.toast('Фото ещё рисуется…'); return; } igmToFeed([{src:IGM.cv.toDataURL('image/jpeg',.92),name:imScene(IGM.cvScene).name,look:IGM.cvLook,scene:IGM.cvScene,w:IGM.cv.width,h:IGM.cv.height}]); return; }
  if((b=t.closest('[data-igm9]'))||(b=t.closest('[data-igm9again]'))){ igmMake9(); return; }
  if((b=t.closest('[data-igm9back]'))){ igmBackToScene(); return; }
  if((b=t.closest('[data-igm9zip]'))){ igmZip(); return; }
  if((b=t.closest('[data-igm9feed]'))){ if(IGM.set&&IGM.set.items.length) igmToFeed(IGM.set.items.filter(Boolean)); return; } });
document.addEventListener('keydown',e=>{ const d=e.target&&e.target.dataset; if((e.key==='Enter'||e.key===' ')&&d&&(d.igmsrc||d.igmup)){ e.preventDefault(); e.target.click(); } });
document.addEventListener('change',e=>{ const t=e.target; if(!t.dataset||!t.dataset.igmkind) return; const id=t.dataset.igmkind, s=igmS(); s.kinds=Object.assign({},s.kinds,{[id]:t.value}); KS.save();
  KS.idb.get(id,'files').then(r=>{ if(r){ r.kind=t.value; return KS.idb.set(id,r,'files'); } }).catch(()=>{}); const x=IGM.src.find(y=>y.id===id); if(x) x.kind=t.value; igmPaintScenes(); igmRun(); });
let igmTxtT=0;
document.addEventListener('input',e=>{ const id=e.target&&e.target.id; if(id!=='igmText'&&id!=='igmBrand') return; const s=igmS(); if(id==='igmText') s.text=e.target.value.trim(); else s.brand=e.target.value.trim(); clearTimeout(igmTxtT);
  igmTxtT=setTimeout(()=>{ KS.save(); const sc=imScene(igmS().scene); if(['text'].includes(sc.cat)||['env-open','pc-duo','bc-grid','bc-stack'].includes(sc.id)) igmRun(); igmThumbs(); },350); });
/* drag & drop files onto the sources strip */
document.addEventListener('dragover',e=>{ const z=e.target.closest&&e.target.closest('.igm-srcwrap'); if(!z) return; e.preventDefault(); z.classList.add('over'); });
document.addEventListener('dragleave',e=>{ const z=e.target.closest&&e.target.closest('.igm-srcwrap'); if(z&&!z.contains(e.relatedTarget)) z.classList.remove('over'); });
document.addEventListener('drop',e=>{ const z=e.target.closest&&e.target.closest('.igm-srcwrap'); if(!z) return; e.preventDefault(); z.classList.remove('over'); igmUpload(e.dataTransfer&&e.dataTransfer.files); });
/* the design changed → sources are stale; refresh when the tab is visible */
KS.on('render',()=>{ let k=''; try{ k=st.dz?(st.dz.w+'x'+st.dz.h+':'+JSON.stringify(st.dz.front||[]).length+':'+JSON.stringify(st.dz.back||[]).length+':'+JSON.stringify(st.dz.pal||{})):''; }catch(_){ }
  if(IGM.lastKey&&k!==IGM.lastKey&&IGM.loaded){ IGM.loaded=false; if(igmOn()) setTimeout(()=>{ if(!IGM.loading&&igmOn()) igmLoadSources(); },700); } IGM.lastKey=k; });
KS.on('photosChanged',()=>{ if(IGM.loaded&&!IGM.loading){ IGM.loaded=false; if(igmOn()) igmLoadSources(); } });
Object.assign(KS.instaMock,{pending:igmPending,open:()=>KS.show('insta','igmock')});
