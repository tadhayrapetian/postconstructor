/* ---- watercolor painting from a photo (canvas, no network) ---- */
const WC_PRESETS={
  soft:{n:'Нежная',r:5,sat:1.05,light:.18,edge:.28,gran:.16,bleed:3,ink:0,deckle:1},
  classic:{n:'Классическая',r:6,sat:1.15,light:.1,edge:.42,gran:.26,bleed:4,ink:0,deckle:1},
  bright:{n:'Яркая',r:5,sat:1.4,light:.06,edge:.38,gran:.2,bleed:3,ink:0,deckle:1},
  sketch:{n:'Скетч с тушью',r:5,sat:1.1,light:.14,edge:.3,gran:.18,bleed:3,ink:.75,deckle:1},
  pastel:{n:'Пастель',r:7,sat:.85,light:.32,edge:.2,gran:.12,bleed:5,ink:0,deckle:1},
  loose:{n:'Свободная',r:9,sat:1.2,light:.12,edge:.5,gran:.3,bleed:7,ink:0,deckle:1}};
function wcNoise(w,h,seed,scale){ /* value noise, 3 octaves, 0..1 */ const out=new Float32Array(w*h); let s=seed||7; const rnd=()=>{ s=(Math.imul(s,1664525)+1013904223)>>>0; return s/4294967296; };
  let amp=1, tot=0; for(let o=0;o<3;o++){ const cs=Math.max(2,Math.round(scale/(1<<o))), gw=Math.ceil(w/cs)+2, gh=Math.ceil(h/cs)+2, g=new Float32Array(gw*gh); for(let i=0;i<g.length;i++) g[i]=rnd();
    for(let y=0;y<h;y++){ const gy=y/cs, y0=gy|0, fy=gy-y0, sy=fy*fy*(3-2*fy); for(let x=0;x<w;x++){ const gx=x/cs, x0=gx|0, fx=gx-x0, sx=fx*fx*(3-2*fx), i=y0*gw+x0;
      const a=g[i]+(g[i+1]-g[i])*sx, b=g[i+gw]+(g[i+gw+1]-g[i+gw])*sx; out[y*w+x]+=amp*(a+(b-a)*sy); } } tot+=amp; amp*=.5; }
  for(let i=0;i<out.length;i++) out[i]/=tot; return out; }
function wcKuwahara(src,w,h,r){ /* summed-area tables per channel → O(N) Kuwahara */
  const W1=w+1, n=W1*(h+1), S=[new Float64Array(n),new Float64Array(n),new Float64Array(n)], Q=new Float64Array(n);
  for(let y=0;y<h;y++){ let a0=0,a1=0,a2=0,aq=0; for(let x=0;x<w;x++){ const p=(y*w+x)*4, R=src[p],G=src[p+1],B=src[p+2], L=.299*R+.587*G+.114*B; a0+=R; a1+=G; a2+=B; aq+=L*L; const i=(y+1)*W1+x+1, u=y*W1+x+1; S[0][i]=S[0][u]+a0; S[1][i]=S[1][u]+a1; S[2][i]=S[2][u]+a2; Q[i]=Q[u]+aq; } }
  const LS=new Float64Array(n); for(let y=0;y<h;y++){ let a=0; for(let x=0;x<w;x++){ const p=(y*w+x)*4; a+=.299*src[p]+.587*src[p+1]+.114*src[p+2]; LS[(y+1)*W1+x+1]=LS[y*W1+x+1]+a; } }
  const box=(T,x0,y0,x1,y1)=>T[y1*W1+x1]-T[y0*W1+x1]-T[y1*W1+x0]+T[y0*W1+x0];
  const out=new Uint8ClampedArray(src.length);
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){ let best=1e18, br=0,bg=0,bb=0;
    for(let q=0;q<4;q++){ const x0=Math.max(0,q&1?x:x-r), x1=Math.min(w,(q&1?x+r:x)+1), y0=Math.max(0,q&2?y:y-r), y1=Math.min(h,(q&2?y+r:y)+1), c=(x1-x0)*(y1-y0);
      const m=box(LS,x0,y0,x1,y1)/c, v=box(Q,x0,y0,x1,y1)/c-m*m; if(v<best){ best=v; br=box(S[0],x0,y0,x1,y1)/c; bg=box(S[1],x0,y0,x1,y1)/c; bb=box(S[2],x0,y0,x1,y1)/c; } }
    const p=(y*w+x)*4; out[p]=br; out[p+1]=bg; out[p+2]=bb; out[p+3]=255; }
  return out; }
function wcBlur(a,w,h,r){ if(r<1) return a.slice(); const t=new Float32Array(a.length), o=new Float32Array(a.length), k=2*r+1;
  for(let y=0;y<h;y++){ let s=0; for(let x=-r;x<=r;x++) s+=a[y*w+Math.min(w-1,Math.max(0,x))]; for(let x=0;x<w;x++){ t[y*w+x]=s/k; s+=a[y*w+Math.min(w-1,x+r+1)]-a[y*w+Math.max(0,x-r)]; } }
  for(let x=0;x<w;x++){ let s=0; for(let y=-r;y<=r;y++) s+=t[Math.min(h-1,Math.max(0,y))*w+x]; for(let y=0;y<h;y++){ o[y*w+x]=s/k; s+=t[Math.min(h-1,y+r+1)*w+x]-t[Math.max(0,y-r)*w+x]; } } return o; }
async function wcPaint(src,presetId,opt){ opt=opt||{}; const P=Object.assign({},WC_PRESETS[presetId]||WC_PRESETS.classic,opt);
  const im=await new Promise((res,rej)=>{ const i=new Image(); i.onload=()=>res(i); i.onerror=rej; i.src=src; });
  const M=opt.max||1600, k=Math.min(1,M/Math.max(im.naturalWidth,im.naturalHeight)), w=Math.max(8,Math.round(im.naturalWidth*k)), h=Math.max(8,Math.round(im.naturalHeight*k));
  const cv=document.createElement('canvas'); cv.width=w; cv.height=h; const g=cv.getContext('2d'); g.fillStyle='#fff'; g.fillRect(0,0,w,h); g.drawImage(im,0,0,w,h);
  const id=g.getImageData(0,0,w,h), px=id.data, N=w*h, sc=Math.max(1,Math.min(w,h)/700);
  /* 1. pigment bleed: displace sampling with low-frequency noise */
  const nx=wcNoise(w,h,11,60*sc), ny=wcNoise(w,h,23,60*sc), bl=P.bleed*sc, dis=new Uint8ClampedArray(px.length);
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){ const i=y*w+x, sx=Math.min(w-1,Math.max(0,Math.round(x+(nx[i]-.5)*2*bl))), sy=Math.min(h-1,Math.max(0,Math.round(y+(ny[i]-.5)*2*bl))), s=(sy*w+sx)*4, d=i*4; dis[d]=px[s]; dis[d+1]=px[s+1]; dis[d+2]=px[s+2]; dis[d+3]=255; }
  await new Promise(r=>setTimeout(r,0));
  /* 2. flat washes: Kuwahara twice */
  let ku=wcKuwahara(dis,w,h,Math.round(P.r*sc)); ku=wcKuwahara(ku,w,h,Math.max(2,Math.round(P.r*sc*.5)));
  await new Promise(r=>setTimeout(r,0));
  /* 3. luminance, edges (pigment pooling), granulation, paper */
  const L=new Float32Array(N); for(let i=0;i<N;i++){ const p=i*4; L[i]=(.299*ku[p]+.587*ku[p+1]+.114*ku[p+2])/255; }
  const Lb=wcBlur(L,w,h,Math.round(2*sc)), E=new Float32Array(N); let emax=1e-6;
  for(let y=1;y<h-1;y++) for(let x=1;x<w-1;x++){ const i=y*w+x, gx=Lb[i+1]-Lb[i-1], gy=Lb[i+w]-Lb[i-w], e=Math.sqrt(gx*gx+gy*gy); E[i]=e; if(e>emax) emax=e; }
  const Eb=wcBlur(E,w,h,Math.max(2,Math.round(3*sc))), gran=wcNoise(w,h,37,2.5*sc), paper=wcNoise(w,h,53,1.4*sc), flow=wcNoise(w,h,71,110*sc), fine=wcNoise(w,h,73,22*sc), wet=wcNoise(w,h,79,70*sc);
  /* wet-in-wet: blurred copy blended in soft patches */
  const R0=new Float32Array(N),G0=new Float32Array(N),B0=new Float32Array(N); for(let i=0;i<N;i++){ R0[i]=ku[i*4]; G0[i]=ku[i*4+1]; B0[i]=ku[i*4+2]; }
  const wr=Math.round(7*sc), RB=wcBlur(R0,w,h,wr), GB=wcBlur(G0,w,h,wr), BB=wcBlur(B0,w,h,wr);
  const inkE=P.ink?wcBlur(L,w,h,1):null, inkE2=P.ink?wcBlur(L,w,h,Math.round(3*sc)):null;
  const out=g.createImageData(w,h), o=out.data, edge=P.edge/(emax*.5), wetA=P.wet??.65;
  const dk=P.deckle?Math.min(w,h)*.07:0, dnoise=wcNoise(w,h,91,18*sc);
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){ const i=y*w+x, p=i*4;
    let m=Math.max(0,Math.min(1,(wet[i]-.42)/.3)); m=m*m*(3-2*m)*wetA; let r=R0[i]*(1-m)+RB[i]*m, gg=G0[i]*(1-m)+GB[i]*m, b=B0[i]*(1-m)+BB[i]*m;
    const mu=(r+gg+b)/3; r=mu+(r-mu)*P.sat; gg=mu+(gg-mu)*P.sat; b=mu+(b-mu)*P.sat;
    /* pigment density: paper shows through unevenly; pooling deepens colour at wash borders */
    const pw=247+8*paper[i], pool=Math.min(.7,Eb[i]*edge);
    let dens=(1-P.light)*(.68+.5*flow[i]+.22*(fine[i]-.5))*(1+pool); dens*=1-P.gran*(gran[i]-.5)*(1.2-L[i]);
    dens=Math.max(.05,Math.min(1.25,dens));
    r=pw-(pw-r)*dens; gg=pw-(pw-gg)*dens; b=pw-3-(pw-3-b)*dens;
    if(inkE){ const dog=inkE2[i]-inkE[i]; if(dog>.025){ const a=Math.min(1,(dog-.025)*12)*P.ink; r*=1-a*.75; gg*=1-a*.75; b*=1-a*.7; } }
    let f=1; if(dk){ const d=Math.min(x,y,w-1-x,h-1-y)+(dnoise[i]-.5)*dk*.9; f=Math.max(0,Math.min(1,(d-dk*.25)/(dk*.75))); f=f*f*(3-2*f); }
    r=pw+(r-pw)*f; gg=pw+(gg-pw)*f; b=pw-3+(b-pw+3)*f;
    o[p]=r; o[p+1]=gg; o[p+2]=b; o[p+3]=255; }
  g.putImageData(out,0,0);
  return cv.toDataURL('image/jpeg',.92); }
