/* «Фото на документы» — passport / visa photo studio: cropper with official guides, two-tap fit,
   corrections, background whitening, sheet layout, print, export, order. */
KS.mod('passport',{title:'Фото на документы'});

/* ---------------- constants ---------------- */
const I=p=>KS.icon(p);
const IC={
  cam:'<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
  up:'<path d="M12 15V4M7.5 8.5 12 4l4.5 4.5"/><path d="M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/>',
  lib:'<rect x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="8.5" cy="10" r="1.6"/><path d="m21 15.5-4.5-4.5L8 19.5"/>',
  target:'<circle cx="12" cy="12" r="7.5"/><path d="M12 2.5v4M12 17.5v4M2.5 12h4M17.5 12h4"/><circle cx="12" cy="12" r="1.3"/>',
  fit:'<path d="M4 9V5a1 1 0 0 1 1-1h4M15 4h4a1 1 0 0 1 1 1v4M20 15v4a1 1 0 0 1-1 1h-4M9 20H5a1 1 0 0 1-1-1v-4"/>',
  plus:'<path d="M12 5v14M5 12h14"/>', minus:'<path d="M5 12h14"/>',
  print:'<path d="M6.5 9V3.5h11V9"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6.5 14h11v6.5h-11z"/>',
  dl:'<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5"/><path d="M4.5 19.5h15"/>',
  order:'<rect x="5" y="4" width="14" height="17" rx="2.2"/><path d="M9 4h6v3H9zM9 12h6M9 16h4"/>',
  wand:'<path d="m4 20 10.5-10.5M15 3.5v2.5M15 11v2.5M10.5 8H13M17 8h2.5"/><path d="m18.5 15 .8 1.7 1.7.8-1.7.8-.8 1.7-.8-1.7-1.7-.8 1.7-.8z"/>',
  cmp:'<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M12 3v18"/><path d="M12 5h6.5a2.5 2.5 0 0 1 2.5 2.5v9a2.5 2.5 0 0 1-2.5 2.5H12z" fill="currentColor" stroke="none" opacity=".35"/>',
  eye:'<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  x:'<path d="M6 6l12 12M18 6 6 18"/>',
  crop:'<path d="M6 2.5V16a2 2 0 0 0 2 2h13.5"/><path d="M18 21.5V8a2 2 0 0 0-2-2H2.5"/>',
  sheet:'<rect x="5" y="2.5" width="14" height="19" rx="1.8"/><path d="M8 6h3.3v4.2H8zM12.7 6H16v4.2h-3.3zM8 12.6h3.3v4.2H8zM12.7 12.6H16v4.2h-3.3z"/>',
  cash:'<rect x="2.5" y="6" width="19" height="12" rx="2.2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5v5M18 9.5v5"/>',
  reset:'<path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1L3.5 8.5"/><path d="M3.5 3.5v5h5"/>',
  ok:'<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  save:'<path d="M5 4h11l3 3v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z"/><path d="M8 4v5h7V4M8 20v-6h8v6"/>'
};
const PRESETS=[
  {id:'am',g:'Армения',n:'Паспорт РА / ID-карта РА',w:35,h:45,head:[32,36],top:[3,5],bg:'white',note:'Цветное фото, лицо анфас, белый однотонный фон, без теней.'},
  {id:'ru',g:'Россия',n:'Паспорт РФ',w:35,h:45,head:[32,36],top:[3,5],bg:'white',note:'Белый фон, можно цветное или Ч/Б, без головного убора.'},
  {id:'ruz',g:'Россия',n:'Загранпаспорт РФ',w:35,h:45,head:[32,36],top:[3,5],bg:'white',note:'Лицо 70–80% высоты кадра, светлый однотонный фон, без уголка.'},
  {id:'eu',g:'Визы',n:'Шенгенская виза',w:35,h:45,head:[32,36],top:[3,5],bg:'grey',note:'Стандарт ICAO: светлый однотонный фон (светло-серый или белый).'},
  {id:'us',g:'Визы',n:'Виза США / Грин-карта (DV)',w:50.8,h:50.8,head:[25,35],top:[3,8],fitHead:31,fitTop:5,eyes:[28,35],bg:'white',note:'2×2″. Голова 1–1⅜″, глаза 28–35 мм от нижнего края, белый фон, без очков.'},
  {id:'uk',g:'Визы',n:'Великобритания',w:35,h:45,head:[29,34],top:[3,7],fitTop:5,bg:'grey',note:'Светло-серый или кремовый однотонный фон, без теней.'},
  {id:'ca',g:'Визы',n:'Канада',w:50,h:70,head:[31,36],top:[6,14],fitTop:10,bg:'white',note:'Голова от подбородка до макушки 31–36 мм, белый или светлый фон.'},
  {id:'cn',g:'Визы',n:'Китай (виза)',w:33,h:48,head:[28,33],top:[3,5],chin:7,hw:[15,22],bg:'white',note:'Ширина головы 15–22 мм, от подбородка до низа не меньше 7 мм, белый фон.'},
  {id:'in',g:'Визы',n:'Индия',w:50.8,h:50.8,head:[25,35],top:[3,8],fitHead:31,fitTop:5,eyes:[28,35],bg:'white',note:'2×2″, голова 25–35 мм, белый фон.'},
  {id:'3x4',g:'Общие',n:'3×4 (справки, пропуска, студбилет)',w:30,h:40,head:[24,30],top:[3,6],bg:'white',note:'Без строгих норм: светлый фон, голова ~70% высоты.'},
  {id:'3x4c',g:'Общие',n:'3×4 с уголком',w:30,h:40,head:[23,28],top:[3,6],bg:'white',corner:'br',note:'Белый уголок под печать; положение уголка можно сменить.'},
  {id:'4x6',g:'Общие',n:'4×6 (личное дело, удостоверения)',w:40,h:60,head:[30,36],top:[5,10],bg:'white',note:'Портрет с плечами, светлый фон.'},
  {id:'9x12',g:'Общие',n:'9×12 (личное дело)',w:90,h:120,head:[55,70],top:[10,20],bg:'white',note:'Крупный портрет для личного дела.'},
  {id:'10x15',g:'Общие',n:'10×15 (портрет)',w:100,h:150,head:[60,80],top:[12,25],bg:'white',note:'Портрет на фотобумаге 10×15.'},
  {id:'custom',g:'Свой',n:'Свой размер',w:35,h:45,head:[32,36],top:[3,5],bg:'white',note:'Задайте размер и нормы сами.'}
];
const BGS={white:{n:'Белый',c:'#ffffff',rgb:[255,255,255]},grey:{n:'Светло-серый',c:'#e6e8eb',rgb:[230,232,235]},blue:{n:'Светло-голубой',c:'#d9e9f7',rgb:[217,233,247]}};
const SH={'10x15':{w:102,h:152,n:'10×15'},'13x18':{w:127,h:178,n:'13×18'},'A4':{w:210,h:297,n:'A4'}};
const CORNERS={off:'Без уголка',br:'Справа внизу',bl:'Слева внизу',tr:'Справа вверху',tl:'Слева вверху'};
const DEF={preset:'am',custom:{w:35,h:45,h0:32,h1:36,t0:3,t1:5},bgMode:'off',tol:22,feather:3,bw:false,sheet:'10x15',count:0,gap:2,cut:true,bl:true,corner:'off',price:1500,sets:1,guides:true};
const store=()=>KS.store('passport',DEF);
const JOBKEY='passport:job';

/* ---------------- small utils ---------------- */
const rad=d=>d*Math.PI/180;
const cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const fmm=v=>{ const r=Math.round((+v||0)*10)/10; return r.toLocaleString('ru-RU',{maximumFractionDigits:1}); };
const E=s=>KS.esc(String(s==null?'':s));
const cnv=(w,h)=>{ const c=document.createElement('canvas'); c.width=Math.max(1,Math.round(w)); c.height=Math.max(1,Math.round(h)); return c; };
const ctx2=c=>c.getContext('2d',{willReadFrequently:true});
const loadImg=src=>new Promise((res,rej)=>{ const im=new Image(); im.onload=()=>res(im); im.onerror=()=>rej(new Error('img')); im.src=src; });
const hasPos=()=>!!(KS.mods&&KS.mods.pos);

/* ---------------- presets ---------------- */
function preset(){ const S=store(); let P=PRESETS.find(p=>p.id===S.preset)||PRESETS[0];
  if(P.id==='custom'){ const c=S.custom||{}; const w=cl(+c.w||35,10,200), h=cl(+c.h||45,10,250); let h0=cl(+c.h0||h*.7,1,h), h1=cl(+c.h1||h*.8,1,h); if(h1<h0) [h0,h1]=[h1,h0]; let t0=cl(+c.t0||0,0,h), t1=cl(+c.t1||0,0,h); if(t1<t0) [t0,t1]=[t1,t0];
    P=Object.assign({},P,{w,h,head:[h0,h1],top:[t0,t1]}); }
  return P; }
const fitOf=P=>({head:P.fitHead||(P.head[0]+P.head[1])/2, top:P.fitTop!=null?P.fitTop:(P.top[0]+P.top[1])/2});
const specLine=P=>`${fmm(P.w)}×${fmm(P.h)} мм · голова ${fmm(P.head[0])}–${fmm(P.head[1])} мм · макушка ${fmm(P.top[0])}–${fmm(P.top[1])} мм от края`+(P.eyes?` · глаза ${P.eyes[0]}–${P.eyes[1]} мм от низа`:'')+(P.chin?` · под подбородком ≥ ${P.chin} мм`:'');
const bgKey=()=>{ const S=store(); return S.bgMode!=='off'&&BGS[S.bgMode]?S.bgMode:(preset().bg||'white'); };
const bgRGB=()=>BGS[bgKey()].rgb;

/* ---------------- job state (memory + IndexedDB, not in undo) ---------------- */
let J=null;            // {src,name,img,iw,ih,cx,cy,s,r,marks:{crown,chin}|null,adj:{b,c,t,auto}}
let base=null;         // display-scale raw pixels {cv,data,w,h}
let procCv=null, maskCv=null, maskDisp=null, jobTried=false;
let scr=null, PB=null, D={};
let kpx=10, FX=0, FY=0, view='crop', mk=null, mkFirst=null, cmp=false, raf=0;

const i2f=(p,t)=>{ t=t||J; const a=rad(t.r), c=Math.cos(a), s=Math.sin(a), x=(p[0]-t.iw/2)*t.s, y=(p[1]-t.ih/2)*t.s; return [t.cx+x*c-y*s, t.cy+x*s+y*c]; };
const f2i=(q,t)=>{ t=t||J; const a=-rad(t.r), c=Math.cos(a), s=Math.sin(a), x=q[0]-t.cx, y=q[1]-t.cy; return [(x*c-y*s)/t.s+t.iw/2, (x*s+y*c)/t.s+t.ih/2]; };
function coverS(P,r){ const a=Math.abs(Math.cos(rad(r||0))), b=Math.abs(Math.sin(rad(r||0))); return Math.max((P.w*a+P.h*b)/J.iw,(P.w*b+P.h*a)/J.ih); }
function coverFit(){ const P=preset(); J.s=coverS(P,J.r); J.cx=P.w/2; J.cy=P.h/2; }
function covered(){ if(!J) return false; const P=preset(); return [[0,0],[P.w,0],[0,P.h],[P.w,P.h]].every(q=>{ const p=f2i(q); return p[0]>=-.6&&p[1]>=-.6&&p[0]<=J.iw+.6&&p[1]<=J.ih+.6; }); }
function measure(){ if(!J||!J.marks) return null; const P=preset(); let a=i2f(J.marks.crown), b=i2f(J.marks.chin); if(b[1]<a[1]) [a,b]=[b,a];
  return {head:b[1]-a[1], top:a[1], below:P.h-b[1], off:(a[0]+b[0])/2-P.w/2}; }
function checks(){ const m=measure(); if(!m) return null; const P=preset(), e=.05, L=[];
  L.push({k:'head',l:'Голова',v:fmm(m.head)+' мм',ok:m.head>=P.head[0]-e&&m.head<=P.head[1]+e,n:fmm(P.head[0])+'–'+fmm(P.head[1])});
  L.push({k:'top',l:'Сверху',v:fmm(m.top)+' мм',ok:m.top>=P.top[0]-e&&m.top<=P.top[1]+e,n:fmm(P.top[0])+'–'+fmm(P.top[1])});
  if(P.chin) L.push({k:'chin',l:'Снизу',v:fmm(m.below)+' мм',ok:m.below>=P.chin-e,n:'≥ '+P.chin});
  L.push({k:'ctr',l:'Центр',v:(Math.abs(m.off)<.05?'0':(m.off>0?'+':'−')+fmm(Math.abs(m.off)))+' мм',ok:Math.abs(m.off)<=1.5,n:'±1,5'});
  return L; }
/* two-tap fit: scale + move so the marked head gets the preset's ideal height, top margin and centre */
function fitHead(){ if(!J||!J.marks) return false; const P=preset(), F=fitOf(P); let a=i2f(J.marks.crown), b=i2f(J.marks.chin);
  if(b[1]<a[1]){ const t=J.marks.crown; J.marks.crown=J.marks.chin; J.marks.chin=t; [a,b]=[b,a]; }
  const cur=b[1]-a[1]; if(cur<.2) return false; J.s*=F.head/cur;
  const m=[(J.marks.crown[0]+J.marks.chin[0])/2,(J.marks.crown[1]+J.marks.chin[1])/2], p0=i2f(m,Object.assign({},J,{cx:0,cy:0}));
  J.cx=P.w/2-p0[0]; J.cy=F.top+F.head/2-p0[1]; return true; }
function rotateTo(deg){ const P=preset(), F=fitOf(P), o=J.marks?(()=>{ const a=i2f(J.marks.crown), b=i2f(J.marks.chin); return [(a[0]+b[0])/2,(a[1]+b[1])/2]; })():[P.w/2,F.top+F.head/2];
  const d=rad(deg-J.r), c=Math.cos(d), s=Math.sin(d), x=J.cx-o[0], y=J.cy-o[1]; J.cx=o[0]+x*c-y*s; J.cy=o[1]+x*s+y*c; J.r=deg; }
function zoomAt(clientX,clientY,f){ const P=preset(), r=D.stage.getBoundingClientRect(), m=[(clientX-r.left-FX)/kpx,(clientY-r.top-FY)/kpx], c0=coverS(P,J.r), ns=cl(J.s*f,c0*.15,c0*30); f=ns/J.s;
  J.cx=m[0]+(J.cx-m[0])*f; J.cy=m[1]+(J.cy-m[1])*f; J.s=ns; }

let jobT=0;
function saveJobSoon(){ clearTimeout(jobT); jobT=setTimeout(saveJob,700); }
function saveJob(){ clearTimeout(jobT); if(!J){ return KS.idb.del(JOBKEY).catch(()=>{}); }
  const v={src:J.src,name:J.name,iw:J.iw,ih:J.ih,cx:J.cx,cy:J.cy,s:J.s,r:J.r,marks:J.marks,adj:J.adj,pre:store().preset,ts:Date.now()};
  return KS.idb.set(JOBKEY,v).catch(e=>console.warn('[passport] job save',e)); }

/* ---------------- image pipeline ---------------- */
function makeLut(a){ const L=[new Uint8ClampedArray(256),new Uint8ClampedArray(256),new Uint8ClampedArray(256)], au=a&&a.auto, b=+(a&&a.b)||0, c=(+(a&&a.c)||0)*2.2, t=+(a&&a.t)||0;
  const cf=(259*(c+255))/(255*(259-c)), gam=Math.pow(2,-b/55);
  for(let ch=0;ch<3;ch++) for(let v=0;v<256;v++){ let x=v;
    if(au){ x=(x-au.lo)*255/Math.max(60,au.hi-au.lo); x*=au.g[ch]; }
    x=255*Math.pow(cl(x,0,255)/255,gam); x=(x-128)*cf+128;
    if(ch===0) x+=t*.55; else if(ch===2) x-=t*.6; else x+=t*.1;
    L[ch][v]=x; }
  return L; }
function buildBase(){ const sc=Math.min(1,2000/Math.max(J.iw,J.ih)), c=cnv(J.iw*sc,J.ih*sc), g=ctx2(c); g.imageSmoothingQuality='high'; g.drawImage(J.img,0,0,c.width,c.height);
  base={cv:c,w:c.width,h:c.height,data:g.getImageData(0,0,c.width,c.height).data}; procCv=cnv(base.w,base.h); }
function renderProc(){ if(!J||!base||!procCv) return; const S=store(), g=ctx2(procCv), out=g.createImageData(base.w,base.h), o=out.data, s=base.data, L=makeLut(J.adj), bw=!!S.bw, M=S.bgMode!=='off'?maskDisp:null, bg=bgRGB(), L0=L[0], L1=L[1], L2=L[2];
  for(let i=0,j=0,n=s.length;i<n;i+=4,j++){ let r=L0[s[i]], gg=L1[s[i+1]], b=L2[s[i+2]];
    if(M){ const m=M[j]; if(m){ const a=m/255, ia=1-a; r=r*ia+bg[0]*a; gg=gg*ia+bg[1]*a; b=b*ia+bg[2]*a; } }
    if(bw){ const y=(r*77+gg*150+b*29)>>8; r=gg=b=y; }
    o[i]=r; o[i+1]=gg; o[i+2]=b; o[i+3]=s[i+3]; }
  g.putImageData(out,0,0); }
let procQ=0; function queueProc(){ if(procQ) return; procQ=requestAnimationFrame(()=>{ procQ=0; renderProc(); queueSheet(); }); }
let maskT=0; function queueMask(){ clearTimeout(maskT); maskT=setTimeout(()=>{ buildMask(); renderProc(); queueSheet(); },90); }

/* auto levels + white balance from a neutral background */
function autoAdj(){ if(!base) return null; const s=base.data, w=base.w, h=base.h, step=Math.max(1,Math.floor(Math.sqrt(w*h/250000))), hist=new Uint32Array(256); let n=0;
  for(let y=0;y<h;y+=step) for(let x=0;x<w;x+=step){ const i=(y*w+x)*4; hist[(s[i]*77+s[i+1]*150+s[i+2]*29)>>8]++; n++; }
  const pct=q=>{ let acc=0; for(let v=0;v<256;v++){ acc+=hist[v]; if(acc>=n*q) return v; } return 255; };
  let lo=pct(.004), hi=pct(.996); if(hi-lo<60){ const m=(hi+lo)/2; lo=m-30; hi=m+30; } lo=Math.min(lo,60); hi=Math.max(hi,190);
  const rs=[],gs=[],bs=[]; for(let x=0;x<w;x+=Math.max(1,step)) for(let y=0;y<Math.min(h,Math.ceil(h*.04));y+=step){ const i=(y*w+x)*4; rs.push(s[i]); gs.push(s[i+1]); bs.push(s[i+2]); }
  const med=a=>{ a.sort((p,q)=>p-q); return a[a.length>>1]||128; }; const R=med(rs), G=med(gs), B=med(bs), avg=(R+G+B)/3, sat=Math.max(R,G,B)-Math.min(R,G,B);
  let g=[1,1,1]; if(avg>110&&sat<48) g=[cl(avg/R,.85,1.2),cl(avg/G,.85,1.2),cl(avg/B,.85,1.2)];
  return {lo,hi,g}; }

/* background mask: region-grow from the frame borders, stops at strong edges and colour jumps */
function buildMask(){ maskCv=null; maskDisp=null; const S=store(); if(!J||S.bgMode==='off') return;
  const sc=Math.min(1,900/Math.max(J.iw,J.ih)), mw=Math.max(8,Math.round(J.iw*sc)), mh=Math.max(8,Math.round(J.ih*sc)), N=mw*mh;
  const c0=cnv(mw,mh), g0=ctx2(c0); g0.drawImage(J.img,0,0,mw,mh); const d=g0.getImageData(0,0,mw,mh).data;
  const Y=new Float32Array(N); for(let i=0;i<N;i++) Y[i]=d[i*4]*.299+d[i*4+1]*.587+d[i*4+2]*.114;
  const G=new Float32Array(N); for(let y=1;y<mh-1;y++) for(let x=1;x<mw-1;x++){ const i=y*mw+x;
    const gx=(Y[i-mw+1]+2*Y[i+1]+Y[i+mw+1])-(Y[i-mw-1]+2*Y[i-1]+Y[i+mw-1]), gy=(Y[i+mw-1]+2*Y[i+mw]+Y[i+mw+1])-(Y[i-mw-1]+2*Y[i-mw]+Y[i-mw+1]); G[i]=(Math.abs(gx)+Math.abs(gy))/8; }
  const tol=cl(+S.tol||22,3,80), T2=tol*tol*9, st=tol*.5+3, S2=st*st*9, gT=7+tol*.8;
  const dc=(i,c)=>{ const k=i*4, r=d[k]-c[0], g=d[k+1]-c[1], b=d[k+2]-c[2]; return 2*r*r+4*g*g+3*b*b; };
  const dp=(i,j)=>{ const a=i*4, b=j*4, r=d[a]-d[b], g=d[a+1]-d[b+1], bl=d[a+2]-d[b+2]; return 2*r*r+4*g*g+3*bl*bl; };
  /* border segments (top, left, right — the bottom edge is usually clothes) */
  const seg=Math.max(6,Math.round(Math.max(mw,mh)/14)), segs=[];
  const addLine=idx=>{ for(let k=0;k<idx.length;k+=seg){ const px=idx.slice(k,k+seg); if(px.length<3) continue; const ch=[0,1,2].map(q=>px.map(i=>d[i*4+q]).sort((a,b)=>a-b)[px.length>>1]); segs.push({px,med:ch}); } };
  const top=[],lft=[],rgt=[]; for(let x=0;x<mw;x++) top.push(x); for(let y=0;y<mh;y++){ lft.push(y*mw); rgt.push(y*mw+mw-1); } addLine(top); addLine(lft); addLine(rgt);
  const dm=(a,b)=>{ const r=a[0]-b[0], g=a[1]-b[1], bl=a[2]-b[2]; return 2*r*r+4*g*g+3*bl*bl; };
  let best=-1, bi=0; segs.forEach((s,i)=>{ let sc2=0; segs.forEach(t=>{ if(dm(s.med,t.med)<T2*2.6) sc2+=t.px.length; }); if(sc2>best){ best=sc2; bi=i; } });
  const near=segs.filter(t=>dm(segs[bi].med,t.med)<T2*2.6), ref=[0,1,2].map(q=>near.reduce((a,t)=>a+t.med[q],0)/near.length);
  const vis=new Uint8Array(N), rid=new Uint8Array(N), q=new Int32Array(N); let qh=0, qt=0; const refs=[];
  segs.forEach(s=>{ if(dm(s.med,ref)>T2*4) return; const id=refs.length; if(id>254) return; refs.push(s.med); s.px.forEach(i=>{ if(!vis[i]&&dc(i,s.med)<T2&&G[i]<gT*1.5){ vis[i]=1; rid[i]=id; q[qt++]=i; } }); });
  while(qh<qt){ const p=q[qh++], x=p%mw, rf=refs[rid[p]];
    const tryN=n=>{ if(vis[n]||G[n]>=gT||dc(n,rf)>=T2||dp(n,p)>=S2) return; vis[n]=1; rid[n]=rid[p]; q[qt++]=n; };
    if(x>0) tryN(p-1); if(x<mw-1) tryN(p+1); if(p>=mw) tryN(p-mw); if(p<N-mw) tryN(p+mw); }
  /* never touch the face: protect an ellipse around the marked head */
  let prot=null; if(J.marks){ const a=J.marks.crown, b=J.marks.chin, cx=(a[0]+b[0])/2*sc, cy=(a[1]+b[1])/2*sc, len=Math.hypot(b[0]-a[0],b[1]-a[1])*sc, ang=Math.atan2(b[0]-a[0],b[1]-a[1]);
    prot={cx,cy,ry:len*.5,rx:len*.36,c:Math.cos(ang),s:Math.sin(ang)}; }
  const inProt=(x,y,k)=>{ if(!prot) return false; const dx=x-prot.cx, dy=y-prot.cy, u=dx*prot.c-dy*prot.s, v=dx*prot.s+dy*prot.c; return (u*u)/(prot.rx*prot.rx*k*k)+(v*v)/(prot.ry*prot.ry*k*k)<=1; };
  /* grow 1 px into the anti-aliased edge, then feather */
  let A=new Float32Array(N); for(let i=0;i<N;i++) if(vis[i]) A[i]=255;
  const B2=new Float32Array(N); for(let y=0;y<mh;y++) for(let x=0;x<mw;x++){ const i=y*mw+x; B2[i]=A[i]||((x>0&&A[i-1])||(x<mw-1&&A[i+1])||(y>0&&A[i-mw])||(y<mh-1&&A[i+mw])?255:0); } A=B2;
  const fr=Math.round(cl(+S.feather||0,0,15)); if(fr>0){ const tmp=new Float32Array(N); for(let it=0;it<2;it++){ boxBlur(A,tmp,mw,mh,fr); } }
  const img=g0.createImageData(mw,mh), o=img.data; for(let y=0;y<mh;y++) for(let x=0;x<mw;x++){ const i=y*mw+x; let a=A[i]; if(a>0&&prot&&inProt(x,y,1)){ a=inProt(x,y,.9)?0:a*.35; } o[i*4]=o[i*4+1]=o[i*4+2]=255; o[i*4+3]=a; }
  g0.putImageData(img,0,0); maskCv=c0;
  if(base){ const md=cnv(base.w,base.h), mg=ctx2(md); mg.imageSmoothingQuality='high'; mg.drawImage(maskCv,0,0,base.w,base.h); const a=mg.getImageData(0,0,base.w,base.h).data, M=new Uint8Array(base.w*base.h); for(let i=0;i<M.length;i++) M[i]=a[i*4+3]; maskDisp=M; } }
function boxBlur(A,T,w,h,r){ const k=1/(2*r+1);
  for(let y=0;y<h;y++){ let acc=0; const o=y*w; for(let x=-r;x<=r;x++) acc+=A[o+cl(x,0,w-1)]; for(let x=0;x<w;x++){ T[o+x]=acc*k; acc+=A[o+Math.min(w-1,x+r+1)]-A[o+Math.max(0,x-r)]; } }
  for(let x=0;x<w;x++){ let acc=0; for(let y=-r;y<=r;y++) acc+=T[cl(y,0,h-1)*w+x]; for(let y=0;y<h;y++){ A[y*w+x]=acc*k; acc+=T[Math.min(h-1,y+r+1)*w+x]-T[Math.max(0,y-r)*w+x]; } } }

/* final crop at any dpi (pixel ops after resampling → fast and identical to the preview) */
function renderCrop(dpi){ const P=preset(), S=store(), kk=dpi/25.4, W=Math.round(P.w*kk), H=Math.round(P.h*kk), c=cnv(W,H), g=ctx2(c);
  const setT=gg=>{ gg.setTransform(W/P.w,0,0,H/P.h,0,0); gg.translate(J.cx,J.cy); gg.rotate(rad(J.r)); gg.scale(J.s,J.s); gg.imageSmoothingEnabled=true; gg.imageSmoothingQuality='high'; };
  setT(g); g.drawImage(J.img,-J.iw/2,-J.ih/2,J.iw,J.ih); const id=g.getImageData(0,0,W,H), d=id.data; let M=null;
  if(S.bgMode!=='off'&&maskCv){ const mc=cnv(W,H), mg=ctx2(mc); setT(mg); mg.drawImage(maskCv,-J.iw/2,-J.ih/2,J.iw,J.ih); M=mg.getImageData(0,0,W,H).data; }
  const L=makeLut(J.adj), bg=bgRGB(), bw=!!S.bw;
  for(let i=0,n=d.length;i<n;i+=4){ const a=d[i+3]/255, w=M?a*(1-M[i+3]/255):a; let r=bg[0], gg=bg[1], b=bg[2];
    if(w>0){ r=bg[0]+(L[0][d[i]]-bg[0])*w; gg=bg[1]+(L[1][d[i+1]]-bg[1])*w; b=bg[2]+(L[2][d[i+2]]-bg[2])*w; }
    if(bw){ const y=(r*77+gg*150+b*29)>>8; r=gg=b=y; } d[i]=r; d[i+1]=gg; d[i+2]=b; d[i+3]=255; }
  g.setTransform(1,0,0,1,0,0); g.putImageData(id,0,0);
  if(S.corner&&S.corner!=='off'){ const R=Math.min(W,H)*.3, x=S.corner[1]==='r'?W:0, y=S.corner[0]==='b'?H:0; g.fillStyle='#fff'; g.beginPath(); g.arc(x,y,R,0,Math.PI*2); g.fill(); }
  return c; }
function rot90(c){ const o=cnv(c.height,c.width), g=o.getContext('2d'); g.translate(o.width,0); g.rotate(Math.PI/2); g.drawImage(c,0,0); return o; }

/* ---------------- sheet layout (mm) ---------------- */
function layout(){ const S=store(), P=preset();
  if(S.sheet==='single') return {single:true,pw:P.w,ph:P.h,cells:[{x:0,y:0,w:P.w,h:P.h}],n:1,max:1,rot:false,cols:1,rows:1,A:{x:0,y:0,w:P.w,h:P.h},m:[0,0,0,0],bl:false,blOK:false,g:0,name:'Один снимок'};
  const sh=SH[S.sheet]||SH['10x15'], pr=KS.printer(), blOK=!!(pr.bl&&(pr.blS||[]).includes(S.sheet)), bl=blOK&&S.bl!==false;
  const m=bl?[0,0,0,0]:(sh.w<=130&&pr.mp?pr.mp:pr.m)||[5,5,5,5], A={x:m[3],y:m[0],w:sh.w-m[1]-m[3],h:sh.h-m[0]-m[2]}, g=cl(+S.gap||0,0,20);
  let best=null; for(const rot of [false,true]){ const iw=rot?P.h:P.w, ih=rot?P.w:P.h, cols=Math.floor((A.w+g+1e-6)/(iw+g)), rows=Math.floor((A.h+g+1e-6)/(ih+g)), n=cols*rows; if(n>0&&(!best||n>best.n)) best={rot,cols,rows,n,iw,ih}; }
  const base0={pw:sh.w,ph:sh.h,A,m,bl,blOK,g,name:sh.n,sheet:sh,pr};
  if(!best) return Object.assign(base0,{err:`Снимок ${fmm(P.w)}×${fmm(P.h)} мм не помещается на лист ${sh.n}`,cells:[],n:0,max:0});
  const n=S.count>0?Math.min(S.count,best.n):best.n, cols=Math.min(best.cols,n), rows=Math.ceil(n/cols), iw=best.iw, ih=best.ih, gw=cols*iw+(cols-1)*g, gh=rows*ih+(rows-1)*g;
  const ox=cl((sh.w-gw)/2,A.x,A.x+A.w-gw), oy=cl((sh.h-gh)/2,A.y,A.y+A.h-gh), cells=[];
  for(let i=0;i<n;i++){ const r=Math.floor(i/cols), c=i%cols, inRow=r===rows-1?n-r*cols:cols, sx=(cols-inRow)*(iw+g)/2; cells.push({x:ox+sx+c*(iw+g),y:oy+r*(ih+g),w:iw,h:ih}); }
  return Object.assign(base0,{rot:best.rot,cols,rows,n,max:best.n,cells,ox,oy,gw,gh}); }
function cutSegs(L){ if(!store().cut||L.single||!L.cells.length) return []; const out=[], o=.8, len=6, A=L.A;
  const xs=[...new Set(L.cells.flatMap(c=>[+c.x.toFixed(3),+(c.x+c.w).toFixed(3)]))], ys=[...new Set(L.cells.flatMap(c=>[+c.y.toFixed(3),+(c.y+c.h).toFixed(3)]))];
  const top=Math.min(...L.cells.map(c=>c.y)), bot=Math.max(...L.cells.map(c=>c.y+c.h)), lef=Math.min(...L.cells.map(c=>c.x)), rig=Math.max(...L.cells.map(c=>c.x+c.w));
  const seg=(x1,y1,x2,y2)=>{ if(Math.hypot(x2-x1,y2-y1)>=1) out.push([x1,y1,x2,y2]); };
  xs.forEach(x=>{ seg(x,Math.max(A.y,top-o-len),x,top-o); seg(x,bot+o,x,Math.min(A.y+A.h,bot+o+len)); });
  ys.forEach(y=>{ seg(Math.max(A.x,lef-o-len),y,lef-o,y); seg(rig+o,y,Math.min(A.x+A.w,rig+o+len),y); });
  if(L.g>=1.4){ const rowsY=[...new Set(L.cells.map(c=>+c.y.toFixed(3)))].sort((a,b)=>a-b), colsX=[...new Set(L.cells.map(c=>+c.x.toFixed(3)))].sort((a,b)=>a-b), ih=L.cells[0].h, iw=L.cells[0].w;
    for(let i=0;i<rowsY.length-1;i++){ const y1=rowsY[i]+ih+.3, y2=rowsY[i+1]-.3; if(y2-y1>=.8) xs.forEach(x=>seg(x,y1,x,y2)); }
    for(let i=0;i<colsX.length-1;i++){ const x1=colsX[i]+iw+.3, x2=colsX[i+1]-.3; if(x2-x1>=.8) ys.forEach(y=>seg(x1,y,x2,y)); } }
  return out; }
function sheetInner(L,url){ const segs=cutSegs(L);
  return L.cells.map(c=>`<img src="${url}" alt="" style="position:absolute;left:${c.x.toFixed(3)}mm;top:${c.y.toFixed(3)}mm;width:${c.w.toFixed(3)}mm;height:${c.h.toFixed(3)}mm;display:block;max-width:none">`).join('')
    +(segs.length?`<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;left:0;top:0;width:${L.pw}mm;height:${L.ph}mm;overflow:visible" viewBox="0 0 ${L.pw} ${L.ph}"><path d="${segs.map(s=>`M${s[0].toFixed(2)} ${s[1].toFixed(2)}L${s[2].toFixed(2)} ${s[3].toFixed(2)}`).join('')}" stroke="#7d838c" stroke-width=".15" fill="none"/></svg>`:''); }
function renderSheet(dpi){ const L=layout(), kk=dpi/25.4, c=cnv(L.pw*kk,L.ph*kk), g=c.getContext('2d'); g.fillStyle='#fff'; g.fillRect(0,0,c.width,c.height); if(!L.cells.length) return c;
  const ph=renderCrop(dpi), im=L.rot?rot90(ph):ph; L.cells.forEach(cc=>g.drawImage(im,Math.round(cc.x*kk),Math.round(cc.y*kk),Math.round(cc.w*kk),Math.round(cc.h*kk)));
  const segs=cutSegs(L); if(segs.length){ g.strokeStyle='#7d838c'; g.lineWidth=Math.max(1,.15*kk); g.beginPath(); segs.forEach(s=>{ g.moveTo(s[0]*kk,s[1]*kk); g.lineTo(s[2]*kk,s[3]*kk); }); g.stroke(); }
  return c; }
function mTxt(m){ m=m||[5,5,5,5]; const a=Math.min(...m), b=Math.max(...m); return 'поля '+(a===b?fmm(a):fmm(a)+'–'+fmm(b))+' мм'; }
function sheetLabel(L){ return L.single?'Один снимок':`${L.name} · ${L.n} шт`; }

/* ---------------- files ---------------- */
async function jpegBlob(c,dpi,q){ const b=await new Promise(r=>c.toBlob(r,'image/jpeg',q||.95)); return setJpegDpi(b,dpi); }
async function setJpegDpi(blob,dpi){ try{ const u=new Uint8Array(await blob.arrayBuffer()); if(u[0]!==0xFF||u[1]!==0xD8) return blob;
    if(u[2]===0xFF&&u[3]===0xE0&&u[6]===0x4A&&u[7]===0x46&&u[8]===0x49&&u[9]===0x46){ u[13]=1; u[14]=dpi>>8; u[15]=dpi&255; u[16]=dpi>>8; u[17]=dpi&255; return new Blob([u],{type:'image/jpeg'}); }
    const app0=new Uint8Array([0xFF,0xE0,0,16,0x4A,0x46,0x49,0x46,0,1,1,1,dpi>>8,dpi&255,dpi>>8,dpi&255,0,0]); return new Blob([u.slice(0,2),app0,u.slice(2)],{type:'image/jpeg'}); }catch(e){ return blob; } }
const fileBase=()=>{ const P=preset(); return `${fmm(P.w).replace(',','.')}x${fmm(P.h).replace(',','.')}`; };
async function exportPhoto(){ if(!J) return; const c=renderCrop(600), b=await jpegBlob(c,600); await KS.download(`Фото_${fileBase()}мм_600dpi.jpg`,b); KS.toast(`JPEG ${c.width}×${c.height} px · 600 dpi`); return {w:c.width,h:c.height}; }
async function exportSheet(){ if(!J) return; const L=layout(); if(L.err){ KS.toast(L.err); return; } const c=renderSheet(300), b=await jpegBlob(c,300,.93);
  await KS.download(L.single?`Фото_${fileBase()}мм_300dpi.jpg`:`Лист_${L.name.replace('×','x')}_${L.n}шт_300dpi.jpg`,b); KS.toast(`Лист ${c.width}×${c.height} px · 300 dpi`); return {w:c.width,h:c.height}; }
async function toLibrary(){ if(!J) return; const P=preset(), c=renderCrop(600), data=c.toDataURL('image/jpeg',.94), ts=cnv(...(()=>{ const s=Math.min(1,360/Math.max(c.width,c.height)); return [c.width*s,c.height*s]; })()); ts.getContext('2d').drawImage(c,0,0,ts.width,ts.height);
  const id=KS.uid('pp'), rec={id,name:`${P.n} ${fmm(P.w)}×${fmm(P.h)} — ${J.name||'фото'}`,type:'image/jpeg',data,thumb:ts.toDataURL('image/jpeg',.85),w:c.width,h:c.height,album:'Документы',added:Date.now()};
  await KS.idb.set('ph:'+id,rec,'files'); KS.emit('photosChanged'); KS.toast('Сохранено в «Мои фото» → Документы'); return id; }
async function printSheet(){ if(!J){ KS.toast('Сначала загрузите фото клиента'); return false; } const L=layout(); if(L.err){ KS.toast(L.err); return false; }
  const c=renderCrop(600), url=(L.rot?rot90(c):c).toDataURL('image/jpeg',.95); await KS.print([KS.page(L.pw,L.ph,sheetInner(L,url),'passport')]);
  KS.toast(`${sheetLabel(L)} — фотобумага, масштаб 100%`); return true; }

/* ---------------- loading photos ---------------- */
function pickFiles(capture){ return new Promise(res=>{ const i=document.createElement('input'); i.type='file'; i.accept='image/*'; if(capture) i.setAttribute('capture',capture); i.style.cssText='position:fixed;left:-9999px;top:0;opacity:0';
  document.body.appendChild(i); i.onchange=()=>{ const f=[...(i.files||[])]; i.remove(); res(f); }; i.click(); setTimeout(()=>{ if(i.isConnected&&!i.files.length) i.remove(); },120000); }); }
async function loadFile(f){ if(!f) return; if(!/^image\//.test(f.type)&&!/\.(jpe?g|png|webp|heic|heif|gif|bmp)$/i.test(f.name||'')){ KS.toast('Это не фото: выберите JPEG или PNG'); return; }
  busy(true,'Открываю фото…'); try{ const src=await KS.readImage(f.type?f:new File([f],f.name,{type:'image/jpeg'}),3600); await setPhoto(src,(f.name||'Фото').replace(/\.[^.]+$/,'')); }
  catch(e){ console.warn('[passport] load',e); KS.toast(/heic|heif/i.test(f.type+f.name)?'Формат HEIC этот браузер не открывает — сохраните фото как JPEG':'Не удалось открыть фото'); }
  finally{ busy(false); } }
async function setPhoto(src,name,saved){ const im=await loadImg(src); if(!im.naturalWidth) throw new Error('empty');
  J={src,name:name||'Фото',img:im,iw:im.naturalWidth,ih:im.naturalHeight,cx:0,cy:0,s:1,r:0,marks:null,adj:{b:0,c:0,t:0,auto:null}};
  if(saved&&saved.iw===J.iw&&saved.ih===J.ih&&saved.s>0){ ['cx','cy','s','r'].forEach(k=>{ if(isFinite(saved[k])) J[k]=+saved[k]; }); J.marks=saved.marks||null; J.adj=Object.assign(J.adj,saved.adj||{}); } else coverFit();
  mk=null; mkFirst=null; buildBase(); { const s=Math.min(1,160/Math.max(J.iw,J.ih)), t=cnv(J.iw*s,J.ih*s); t.getContext('2d').drawImage(base.cv,0,0,t.width,t.height); J.thumb=t.toDataURL('image/jpeg',.8); } buildMask(); renderProc(); mountLayer(); if(view!=='crop') setView('crop'); renderPanel(); layoutStage(); if(!saved) saveJob(); KS.emit('passportPhoto',J.name); }
function clearPhoto(){ J=null; base=null; procCv=null; maskCv=null; maskDisp=null; mk=null; mkFirst=null; if(D.layer) D.layer.innerHTML=''; saveJob(); renderPanel(); layoutStage(); }
async function ensureJob(){ if(jobTried||J) return; jobTried=true; try{ const v=await KS.idb.get(JOBKEY); if(v&&v.src&&!J){ if(v.pre&&PRESETS.some(p=>p.id===v.pre)&&v.pre!==store().preset){ store().preset=v.pre; KS.save(); } await setPhoto(v.src,v.name,v); } }catch(e){ console.warn('[passport] restore',e); } }
function busy(on,msg){ if(!D.busy) return; D.busy.hidden=!on; if(msg) D.busy.querySelector('span').textContent=msg; }

/* library (photos module convention: IndexedDB 'files' store, keys 'ph:<id>') */
const libModal=KS.modal({id:'pp-lib',title:'Мои фото',wide:true});
let libFilter='';
async function openLibrary(){ libModal.open(); libModal.el.innerHTML='<div class="ks-empty">Загружаю…</div>'; let items=[];
  try{ const [keys,vals]=await Promise.all([KS.idb.keys('files'),KS.idb.all('files')]); items=keys.map((k,i)=>[String(k),vals[i]]).filter(([k,v])=>k.startsWith('ph:')&&v&&v.data).map(([k,v])=>Object.assign({key:k},v)).sort((a,b)=>(b.added||0)-(a.added||0)); }catch(e){ console.warn(e); }
  const draw=()=>{ const albums=[...new Set(items.map(x=>x.album||'Разное'))], list=items.filter(x=>!libFilter||(x.album||'Разное')===libFilter);
    libModal.el.innerHTML=!items.length?`<div class="ks-empty pp-libempty">${I(IC.lib)}<b>В «Моих фото» пока пусто</b><span>Фото появляются здесь из раздела «Фото» и кнопкой «В мои фото». Сейчас можно выбрать файл с устройства.</span><button class="btn primary" data-pl="pick">${I(IC.up)}Выбрать файл</button></div>`
      :`<div class="pp-libbar"><div class="seg">${['',...albums].map(a=>`<button data-alb="${E(a)}"${a===libFilter?' class="on"':''}>${a?E(a):'Все'}</button>`).join('')}</div><span class="hint">${list.length} фото</span></div>
        <div class="ks-grid pp-libgrid" style="--ks-min:120px">${list.map(x=>`<button class="ks-tile pp-libtile" data-key="${E(x.key)}" title="${E(x.name||'')}"><img src="${x.thumb||x.data}" alt="" loading="lazy"><span>${E(x.album||'')}</span></button>`).join('')}</div>`; };
  draw();
  libModal.el.onclick=async e=>{ const a=e.target.closest('[data-alb]'); if(a){ libFilter=a.dataset.alb; draw(); return; }
    if(e.target.closest('[data-pl="pick"]')){ libModal.close(); const f=await pickFiles(); if(f[0]) loadFile(f[0]); return; }
    const t=e.target.closest('[data-key]'); if(!t) return; const it=items.find(x=>x.key===t.dataset.key); if(!it) return; libModal.close(); busy(true,'Открываю фото…');
    try{ await setPhoto(it.data,it.name||'Фото'); }catch(err){ KS.toast('Не удалось открыть фото'); } finally{ busy(false); } }; }

/* ---------------- screen (cropper / sheet) ---------------- */
function mountScreen(s){ if(s.querySelector('.pp-root')) return; scr=s;
  s.innerHTML=`<div class="pp-root">
    <div class="pp-top">
      <div class="pp-ttl"><b>Фото на документы</b><span class="pp-spec"></span></div><div class="ks-sp"></div>
      <button class="btn pp-mkbtn" data-a="mark">${I(IC.target)}<span>Макушка и подбородок</span></button>
      <div class="seg pp-view"><button data-v="crop">${I(IC.crop)}Кадр</button><button data-v="sheet">${I(IC.sheet)}Лист</button></div>
    </div>
    <div class="pp-stage" tabindex="0" aria-label="Кадрирование фото">
      <div class="pp-fbg"></div><div class="pp-layer"></div>
      <div class="pp-frame"><svg class="pp-guides" preserveAspectRatio="none"></svg><svg class="pp-marks" preserveAspectRatio="none"></svg></div>
      <div class="pp-sheet" hidden></div>
      <div class="pp-empty" hidden><div class="pp-emptyc">
        <div class="pp-emptyi">${I(IC.cam)}</div><b>Загрузите фото клиента</b><span>Перетащите файл сюда, вставьте ⌘V или выберите на устройстве. Лучше снимать на однотонном светлом фоне, лицо анфас.</span>
        <div class="pp-emptyb"><button class="btn primary" data-a="pick">${I(IC.up)}Выбрать фото</button><button class="btn pp-touch" data-a="cam">${I(IC.cam)}Снять</button><button class="btn" data-a="lib">${I(IC.lib)}Мои фото</button></div>
        <ol class="pp-steps"><li><i>1</i>Фото</li><li><i>2</i>Макушка и подбородок</li><li><i>3</i>Печать</li></ol></div></div>
      <div class="pp-tip" hidden></div>
      <div class="pp-tools">
        <button data-a="zout" title="Уменьшить">${I(IC.minus)}</button><span class="pp-zoom">100%</span><button data-a="zin" title="Увеличить">${I(IC.plus)}</button><i></i>
        <button data-a="fit" title="Заполнить кадр">${I(IC.fit)}</button><button data-a="guides" title="Разметка">${I(IC.eye)}</button><button data-a="cmp" title="Удерживайте: до / после">${I(IC.cmp)}</button>
      </div>
      <div class="pp-busy" hidden><i></i><span>Обработка…</span></div>
      <div class="pp-drop" hidden><div>${I(IC.up)}<b>Отпустите, чтобы загрузить фото</b></div></div>
    </div>
    <div class="pp-bot"><div class="pp-chips"></div><div class="ks-sp"></div>
      <label class="pp-rot" title="Выпрямить наклон"><span>Наклон</span><input type="range" min="-15" max="15" step="0.1" value="0" data-a="rot"><output>0°</output><button class="pp-rot0" data-a="rot0" title="Сбросить">${I(IC.reset)}</button></label></div>
  </div>`;
  D={root:s.querySelector('.pp-root'),stage:s.querySelector('.pp-stage'),layer:s.querySelector('.pp-layer'),fbg:s.querySelector('.pp-fbg'),frame:s.querySelector('.pp-frame'),guides:s.querySelector('.pp-guides'),marks:s.querySelector('.pp-marks'),
    sheet:s.querySelector('.pp-sheet'),empty:s.querySelector('.pp-empty'),tip:s.querySelector('.pp-tip'),tools:s.querySelector('.pp-tools'),zoom:s.querySelector('.pp-zoom'),busy:s.querySelector('.pp-busy'),drop:s.querySelector('.pp-drop'),
    chips:s.querySelector('.pp-chips'),rot:s.querySelector('.pp-rot input'),rotOut:s.querySelector('.pp-rot output'),spec:s.querySelector('.pp-spec'),mkbtn:s.querySelector('.pp-mkbtn'),bot:s.querySelector('.pp-bot')};
  bindScreen(); if(window.ResizeObserver) new ResizeObserver(()=>layoutStage()).observe(D.stage); }
function mountLayer(){ if(!D.layer) return; D.layer.innerHTML=''; if(!J||!base) return; D.layer.style.width=J.iw+'px'; D.layer.style.height=J.ih+'px';
  const raw=base.cv; raw.className='pp-raw'; procCv.className='pp-proc'; D.layer.append(raw,procCv); }
function setView(v){ view=v; if(D.root){ D.root.dataset.view=v; D.root.querySelectorAll('.pp-view button').forEach(b=>b.classList.toggle('on',b.dataset.v===v)); } if(v==='sheet') queueSheet(true); layoutStage(); }

function layoutStage(){ if(!D.stage||!scr||scr.hidden) return; const r=D.stage.getBoundingClientRect(); if(r.width<20||r.height<20) return; const P=preset(), S=store();
  D.root.dataset.view=view; D.root.classList.toggle('pp-has',!!J); D.root.classList.toggle('pp-mk',!!mk); D.empty.hidden=!!J; D.sheet.hidden=view!=='sheet'; D.spec.textContent=P.n+' · '+specLine(P);
  D.mkbtn.classList.toggle('primary',!!J&&!J.marks&&!mk); D.mkbtn.querySelector('span').textContent=mk?'Отмена':J&&J.marks?'Отметить заново':'Макушка и подбородок'; D.mkbtn.disabled=!J;
  D.root.querySelectorAll('.pp-view button').forEach(b=>b.classList.toggle('on',b.dataset.v===view));
  const padX=cl(r.width*.14,64,150), padY=cl(r.height*.07,26,56); kpx=Math.max(.5,Math.min((r.width-2*padX)/P.w,(r.height-2*padY)/P.h)); const fw=P.w*kpx, fh=P.h*kpx; FX=Math.round((r.width-fw)/2); FY=Math.round((r.height-fh)/2);
  [D.frame,D.fbg].forEach(n=>{ n.style.left=FX+'px'; n.style.top=FY+'px'; n.style.width=fw+'px'; n.style.height=fh+'px'; }); D.fbg.style.background=BGS[bgKey()].c;
  D.root.classList.toggle('pp-noguides',S.guides===false);
  buildGuides(); apply(); if(view==='sheet') queueSheet(); }
function buildGuides(){ const P=preset(), F=fitOf(P), S=store(), w=P.w, h=P.h, u=1/kpx, out=FX>=104, fs=11*u, lx=out?w+10*u:3*u, anchor='start';
  const band=(y0,y1,cls,label)=>`<rect class="pp-gb ${cls}" x="0" y="${y0}" width="${w}" height="${Math.max(0,y1-y0)}"/><line class="pp-gl ${cls}" x1="0" x2="${w}" y1="${y0}" y2="${y0}"/><line class="pp-gl ${cls}" x1="0" x2="${w}" y1="${y1}" y2="${y1}"/>`
    +(label?`<text class="pp-gt ${cls}${out?' out':''}" x="${lx}" y="${(y0+y1)/2+fs*.36}" font-size="${fs}" text-anchor="${anchor}">${label}</text>`:'');
  const eyes=P.eyes?[h-P.eyes[1],h-P.eyes[0]]:[F.top+F.head*.42,F.top+F.head*.52], chin=[F.top+P.head[0],F.top+P.head[1]], rx=P.hw?(P.hw[0]+P.hw[1])/4:F.head*.36;
  let s=`<line class="pp-gc" x1="${w/2}" x2="${w/2}" y1="0" y2="${h}"/>`
    +band(P.top[0],P.top[1],'cr','Макушка')+band(eyes[0],eyes[1],'ey',P.eyes?'Глаза':'Глаза ≈')+band(chin[0],chin[1],'ch','Подбородок')
    +`<ellipse class="pp-go" cx="${w/2}" cy="${F.top+F.head/2}" rx="${rx}" ry="${F.head/2}"/>`;
  if(P.hw) s+=`<line class="pp-gw" x1="${w/2-P.hw[1]/2}" x2="${w/2-P.hw[1]/2}" y1="${F.top+F.head*.3}" y2="${F.top+F.head*.7}"/><line class="pp-gw" x1="${w/2+P.hw[1]/2}" x2="${w/2+P.hw[1]/2}" y1="${F.top+F.head*.3}" y2="${F.top+F.head*.7}"/>`;
  if(S.corner&&S.corner!=='off'){ const R=Math.min(w,h)*.3, x=S.corner[1]==='r'?w:0, y=S.corner[0]==='b'?h:0; s+=`<circle class="pp-gk" cx="${x}" cy="${y}" r="${R}"/>`; }
  const vb=`0 0 ${w} ${h}`; D.guides.setAttribute('viewBox',vb); D.marks.setAttribute('viewBox',vb); D.guides.innerHTML=s; }
function drawMarks(){ const P=preset(), u=1/kpx; let s='';
  const pts=[]; if(J&&J.marks&&!mk){ pts.push(['crown',i2f(J.marks.crown)],['chin',i2f(J.marks.chin)]); } else if(J&&mkFirst){ pts.push(['crown',i2f(mkFirst)]); }
  if(pts.length===2){ const a=pts[0][1], b=pts[1][1], m=measure(), C=checks(), ok=C&&C[0].ok, dx=-(FX>=70?14:-6)*u, x=FX>=70?dx:P.w+6*u;
    s+=`<line class="pp-mline" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"/>`;
    s+=`<g class="pp-dim${ok?' ok':' bad'}"><line x1="${x}" x2="${x}" y1="${a[1]}" y2="${b[1]}"/><line x1="${x-4*u}" x2="${x+4*u}" y1="${a[1]}" y2="${a[1]}"/><line x1="${x-4*u}" x2="${x+4*u}" y1="${b[1]}" y2="${b[1]}"/>`
      +`<text x="${x-6*u}" y="${(a[1]+b[1])/2}" font-size="${12*u}" text-anchor="middle" transform="rotate(-90 ${x-6*u} ${(a[1]+b[1])/2})">${fmm(m.head)} мм</text></g>`; }
  pts.forEach(([k,p])=>{ s+=`<g class="pp-h ${k}" data-h="${k}"><line x1="${p[0]-9*u}" x2="${p[0]+9*u}" y1="${p[1]}" y2="${p[1]}"/><circle cx="${p[0]}" cy="${p[1]}" r="${16*u}" class="hit"/><circle cx="${p[0]}" cy="${p[1]}" r="${5*u}" class="dot"/></g>`; });
  if(s!==D.marks._s){ D.marks._s=s; D.marks.innerHTML=s; } }
function apply(){ raf=0; if(!D.layer) return; if(J){ D.layer.style.transform=`translate(${FX+J.cx*kpx}px,${FY+J.cy*kpx}px) rotate(${J.r}deg) scale(${J.s*kpx}) translate(-50%,-50%)`;
    D.layer.classList.toggle('cmp',cmp); const z=Math.round(J.s/coverS(preset(),J.r)*100)+'%'; if(D.zoom.textContent!==z) D.zoom.textContent=z;
    if(document.activeElement!==D.rot) D.rot.value=J.r; const ro=fmm(J.r)+'°'; if(D.rotOut.textContent!==ro) D.rotOut.textContent=ro; }
  drawMarks(); updChips(); }
const schedule=()=>{ if(!raf) raf=requestAnimationFrame(apply); };
function updChips(){ let h=''; const S=store();
  if(view==='sheet'){ const L=layout(); h=L.err?`<span class="pp-chip bad"><i></i>${E(L.err)}</span>`:`<span class="pp-chip info"><i></i><b>${E(sheetLabel(L))}</b>${L.single?'':` · ${L.cols}×${L.rows}${L.rot?' (повёрнуты)':''}`}</span>`
      +(L.single?`<span class="pp-chip info"><i></i>страница ${fmm(L.pw)}×${fmm(L.ph)} мм</span>`:`<span class="pp-chip info"><i></i>${L.bl?'без полей':mTxt(L.m)} · ${E((L.pr&&L.pr.n)||'')}</span>`); }
  else if(J){ const C=checks(); h=C?C.map(c=>`<span class="pp-chip ${c.ok?'ok':'bad'}" title="Норма ${E(c.n)} мм"><i></i>${c.l} <b>${c.v}</b><small>${E(c.n)}</small></span>`).join('')
      :`<button class="pp-chip act" data-a="mark">${I(IC.target)}Отметьте макушку и подбородок — размер подгоню сам</button>`;
    const cov=covered(), bgOn=S.bgMode!=='off'; h+=`<span class="pp-chip ${cov||bgOn?'ok':'warn'}"><i></i>${cov?'Кадр заполнен':bgOn?'Края залиты фоном':'Пустые края'}</span>`; }
  if(D.chips&&h!==D.chips._h){ D.chips._h=h; D.chips.innerHTML=h; } }
let sheetT=0, sheetUrlKey='';
function queueSheet(now){ if(view!=='sheet'||!D.sheet) return; clearTimeout(sheetT); sheetT=setTimeout(renderSheetView,now?0:140); }
function renderSheetView(){ if(view!=='sheet'||!D.sheet||!scr||scr.hidden) return; const L=layout(), r=D.stage.getBoundingClientRect(); updChips();
  if(!J){ D.sheet.innerHTML=''; return; } if(L.err){ D.sheet.innerHTML=`<div class="ks-empty pp-sheeterr">${E(L.err)}. Выберите лист крупнее.</div>`; return; }
  const pxmm=96/25.4, sc=Math.max(.05,Math.min((r.width-48)/(L.pw*pxmm),(r.height-64)/(L.ph*pxmm))), c=renderCrop(cl(pxmm*sc*(window.devicePixelRatio||1)*25.4*1.15,72,300)), url=(L.rot?rot90(c):c).toDataURL('image/jpeg',.88);
  const A=L.A, area=!L.single&&!L.bl?`<div class="pp-parea" style="left:${A.x}mm;top:${A.y}mm;width:${A.w}mm;height:${A.h}mm"></div>`:'';
  D.sheet.innerHTML=`<div class="pp-paperw" style="width:${L.pw*pxmm*sc}px;height:${L.ph*pxmm*sc}px"><div class="pp-paper" style="width:${L.pw}mm;height:${L.ph}mm;transform:scale(${sc})">${area}${sheetInner(L,url)}</div></div>
    <div class="pp-sheetcap">${E(L.single?'Один снимок '+fmm(L.pw)+'×'+fmm(L.ph)+' мм':'Лист '+L.name+' ('+fmm(L.pw)+'×'+fmm(L.ph)+' мм) · '+L.n+' шт')}${!L.single&&!L.bl?' · <span>пунктир — поля принтера</span>':''}</div>`; }

/* pointer / touch / wheel / keyboard */
function bindScreen(){ const st0=D.stage, P0=new Map(); let drag=null, pin=null, pinched=false, downT=0;
  const toFrame=(x,y)=>{ const r=st0.getBoundingClientRect(); return [(x-r.left-FX)/kpx,(y-r.top-FY)/kpx]; };
  st0.addEventListener('pointerdown',e=>{ if(!J||view!=='crop'||e.target.closest('.pp-tools,.pp-tip,.pp-empty,.pp-busy')) return; if(e.button>0) return;
    try{ st0.setPointerCapture(e.pointerId); }catch(_){} P0.set(e.pointerId,{x:e.clientX,y:e.clientY,x0:e.clientX,y0:e.clientY}); if(P0.size===1){ pinched=false; downT=performance.now(); }
    const h=e.target.closest('[data-h]'); if(P0.size===1&&h&&J.marks&&!mk) drag={t:'mark',k:h.dataset.h}; else if(P0.size===1) drag={t:'pan'}; else { drag={t:'pinch'}; pinched=true; pin=null; }
    st0.classList.add('pan'); e.preventDefault(); st0.focus({preventScroll:true}); });
  st0.addEventListener('pointermove',e=>{ const p=P0.get(e.pointerId); if(!p||!J) return; const dx=e.clientX-p.x, dy=e.clientY-p.y; p.x=e.clientX; p.y=e.clientY;
    if(drag&&drag.t==='mark'){ J.marks[drag.k]=f2i(toFrame(e.clientX,e.clientY)); }
    else if(P0.size>=2){ const [a,b]=[...P0.values()], mid=[(a.x+b.x)/2,(a.y+b.y)/2], d=Math.hypot(a.x-b.x,a.y-b.y); if(pin&&pin.d>4){ zoomAt(mid[0],mid[1],d/pin.d); J.cx+=(mid[0]-pin.m[0])/kpx; J.cy+=(mid[1]-pin.m[1])/kpx; } pin={d,m:mid}; }
    else if(drag&&drag.t==='pan'){ J.cx+=dx/kpx; J.cy+=dy/kpx; }
    schedule(); });
  const up=e=>{ const p=P0.get(e.pointerId); if(!p) return; P0.delete(e.pointerId); try{ st0.releasePointerCapture(e.pointerId); }catch(_){}
    if(drag&&drag.t==='mark'&&P0.size===0){ fitHead(); if(store().bgMode!=='off') queueMask(); schedule(); }
    else if(mk&&!pinched&&P0.size===0&&e.type==='pointerup'&&Math.hypot(e.clientX-p.x0,e.clientY-p.y0)<8&&performance.now()-downT<900){ J.cx-=(e.clientX-p.x0)/kpx; J.cy-=(e.clientY-p.y0)/kpx; markTap(f2i(toFrame(p.x0,p.y0))); }
    if(P0.size===1){ drag={t:'pan'}; pin=null; } else if(P0.size===0){ drag=null; pin=null; st0.classList.remove('pan'); saveJobSoon(); queueSheet(); } };
  st0.addEventListener('pointerup',up); st0.addEventListener('pointercancel',up);
  st0.addEventListener('wheel',e=>{ if(!J||view!=='crop') return; e.preventDefault(); const dy=e.deltaMode===1?e.deltaY*16:e.deltaY; zoomAt(e.clientX,e.clientY,Math.exp(-dy*(e.ctrlKey?.01:.0016))); schedule(); saveJobSoon(); },{passive:false});
  let gs=1; st0.addEventListener('gesturestart',e=>{ e.preventDefault(); gs=1; }); st0.addEventListener('gesturechange',e=>{ e.preventDefault(); if(!J||P0.size||view!=='crop') return; zoomAt(e.clientX,e.clientY,e.scale/gs); gs=e.scale; schedule(); }); st0.addEventListener('gestureend',e=>{ e.preventDefault(); saveJobSoon(); });
  /* drag & drop a file */
  let dd=0; st0.addEventListener('dragenter',e=>{ if(![...(e.dataTransfer&&e.dataTransfer.types||[])].includes('Files')) return; e.preventDefault(); dd++; D.drop.hidden=false; });
  st0.addEventListener('dragover',e=>{ if(![...(e.dataTransfer&&e.dataTransfer.types||[])].includes('Files')) return; e.preventDefault(); e.dataTransfer.dropEffect='copy'; });
  st0.addEventListener('dragleave',()=>{ dd=Math.max(0,dd-1); if(!dd) D.drop.hidden=true; });
  st0.addEventListener('drop',e=>{ e.preventDefault(); e.stopPropagation(); dd=0; D.drop.hidden=true; const f=[...(e.dataTransfer&&e.dataTransfer.files||[])].find(x=>/^image\//.test(x.type)||/\.(heic|heif)$/i.test(x.name)); if(f) loadFile(f); else KS.toast('Перетащите файл с фото'); });
  /* buttons on the screen */
  scr.addEventListener('click',e=>{ const v=e.target.closest('[data-v]'); if(v){ setView(v.dataset.v); return; } const b=e.target.closest('[data-a]'); if(b&&b.tagName!=='INPUT') act(b.dataset.a,b); });
  const cmpOff=()=>{ if(cmp){ cmp=false; schedule(); } };
  D.tools.querySelector('[data-a="cmp"]').addEventListener('pointerdown',e=>{ e.preventDefault(); cmp=true; schedule(); }); ['pointerup','pointerleave','pointercancel'].forEach(t=>D.tools.querySelector('[data-a="cmp"]').addEventListener(t,cmpOff));
  D.rot.addEventListener('input',()=>{ if(!J) return; rotateTo(+D.rot.value); schedule(); }); D.rot.addEventListener('change',()=>{ saveJobSoon(); queueSheet(); }); }
function markTap(p){ if(!J) return; if(mk==='crown'){ mkFirst=p; mk='chin'; tip(); schedule(); return; }
  if(mk==='chin'){ J.marks={crown:mkFirst,chin:p}; mk=null; mkFirst=null; const ok=fitHead(); tip(); layoutStage(); if(store().bgMode!=='off') queueMask(); saveJobSoon();
    const m=measure(); if(ok&&m) KS.toast(`Готово: голова ${fmm(m.head)} мм, макушка ${fmm(m.top)} мм от края`); else KS.toast('Точки слишком близко — отметьте ещё раз'); KS.emit('passportFit',m); } }
function startMark(){ if(!J){ KS.toast('Сначала загрузите фото'); return; } if(view!=='crop') setView('crop'); if(mk){ mk=null; mkFirst=null; } else { mk='crown'; mkFirst=null; } tip(); layoutStage(); }
function tip(){ if(!D.tip) return; D.root.classList.toggle('pp-mk',!!mk); if(!mk){ D.tip.hidden=true; return; } D.tip.hidden=false;
  D.tip.innerHTML=mk==='crown'?`<b>1/2</b><span>Коснитесь <u>макушки</u> — самой верхней точки головы (вместе с волосами)</span><button class="btn sm" data-a="mark">Отмена</button>`
    :`<b>2/2</b><span>Теперь коснитесь <u>подбородка</u> — нижней точки лица</span><button class="btn sm" data-a="mark">Отмена</button>`; }
function nudge(dx,dy){ if(!J) return; J.cx+=dx; J.cy+=dy; schedule(); saveJobSoon(); queueSheet(); }
function zoomBtn(f){ if(!J) return; const r=D.stage.getBoundingClientRect(); zoomAt(r.left+FX+preset().w*kpx/2,r.top+FY+fitOf(preset()).top*kpx+fitOf(preset()).head*kpx/2,f); schedule(); saveJobSoon(); queueSheet(); }
function act(a,el){ const S=store();
  switch(a){
    case 'pick': pickFiles().then(f=>f[0]&&loadFile(f[0])); break;
    case 'cam': pickFiles('environment').then(f=>f[0]&&loadFile(f[0])); break;
    case 'lib': openLibrary(); break;
    case 'clear': clearPhoto(); break;
    case 'mark': startMark(); break;
    case 'zin': zoomBtn(1.08); break; case 'zout': zoomBtn(1/1.08); break;
    case 'fit': if(J){ if(J.marks) fitHead(); else coverFit(); schedule(); saveJobSoon(); queueSheet(); } break;
    case 'guides': S.guides=S.guides===false; KS.save(); layoutStage(); break;
    case 'rot0': if(J){ rotateTo(0); schedule(); saveJobSoon(); queueSheet(); } break;
    case 'auto': if(J){ J.adj.auto=J.adj.auto?null:autoAdj(); queueProc(); saveJobSoon(); renderPanel(); } break;
    case 'adjreset': if(J){ J.adj={b:0,c:0,t:0,auto:null}; queueProc(); saveJobSoon(); renderPanel(); } break;
    case 'print': printSheet(); break;
    case 'jpg': exportPhoto(); break; case 'sheetjpg': exportSheet(); break; case 'tolib': toLibrary(); break;
    case 'all': S.count=0; KS.save(); panelLayout(); break;
    case 'cnt-': case 'cnt+': { const L=layout(), cur=L.n||1; S.count=cl(cur+(a==='cnt+'?1:-1),1,Math.max(1,L.max)); if(S.count>=L.max) S.count=0; KS.save(); panelLayout(); break; }
    case 'sets-': case 'sets+': S.sets=cl((+S.sets||1)+(a==='sets+'?1:-1),1,999); KS.save(); panelOrder(); break;
    case 'order': addOrder(); break; case 'pos': toPos(); break;
    case 'openOrders': goTab('orders'); break;
  } }

/* ---------------- orders / pos ---------------- */
function orderInfo(){ const S=store(), P=preset(), L=layout(), sets=Math.max(1,Math.round(+S.sets||1)), price=Math.max(0,+S.price||0);
  return {S,P,L,sets,price,total:price*sets,name:`Фото на документы · ${P.n}${L.single?'':' · '+L.n+' шт'}`}; }
function clientList(){ try{ return (Array.isArray(st.clients)?st.clients:[]).filter(c=>c&&c.name).slice(0,300); }catch(_){ return []; } }
function addOrder(){ const o=orderInfo(), cli=PB&&PB.querySelector('[data-k="client"]'), ph=PB&&PB.querySelector('[data-k="phone"]');
  const ord=newOrder({client:cli?cli.value.trim():'',phone:ph?ph.value.trim():'',product:o.name,qty:o.sets,paper:o.L.single?'':'Фотобумага '+o.L.name,sides:1,price:Math.round(o.total*100)/100,cost:0,note:`${fmm(o.P.w)}×${fmm(o.P.h)} мм, ${o.L.n} шт в комплекте`});
  try{ if(st.shop) st.shop.filter='active'; }catch(_){} update(); KS.toast(`Заказ №${ord.no} добавлен: ${KS.money(o.total)}`);
  const n=PB&&PB.querySelector('.pp-orderok'); if(n){ n.hidden=false; n.innerHTML=`${I(IC.ok)}<span>Заказ <b>№${E(ord.no)}</b> создан — ${E(KS.money(o.total))}</span><button class="btn sm" data-a="openOrders">Открыть</button>`; }
  KS.emit('passportOrder',ord); return ord; }
function toPos(){ const o=orderInfo(); KS.emit('posAdd',{name:o.name,price:o.price,qty:o.sets}); KS.toast(`В кассе: ${o.name} × ${o.sets}`); }

/* ---------------- side panel ---------------- */
const sl=(k,label,min,max,step,val,unit,off)=>`<label class="pp-sl${off?' off':''}"><span>${label}</span><output data-o="${k}">${fmtV(val,unit)}</output><input type="range" data-k="${k}" min="${min}" max="${max}" step="${step}" value="${val}"${off?' disabled':''}></label>`;
const fmtV=(v,unit)=>(unit==='±'?(v>0?'+':v<0?'−':'')+fmm(Math.abs(v)):fmm(v))+(unit&&unit!=='±'?' '+unit:'');
function renderPanel(box){ if(box) PB=box; if(!PB) return; const S=store(), P=preset(), has=!!J, dis=has?'':' disabled', groups=[...new Set(PRESETS.map(p=>p.g))];
  const thumb=has?J.thumb:'';
  PB.innerHTML=`<div class="pp-side">
  <div class="card pp-card"><div class="hd">Фото клиента${has?`<button class="btn sm icon" data-a="clear" title="Убрать фото" aria-label="Убрать фото">${I(IC.x)}</button>`:''}</div>
    ${has?`<div class="pp-cur"><img src="${thumb}" alt=""><div><b>${E(J.name)}</b><small>${J.iw}×${J.ih} px · ${fmm(J.iw*J.ih/1e6)} Мп</small></div></div>`:''}
    <div class="pp-btns"><button class="btn${has?'':' primary'}" data-a="pick">${I(IC.up)}${has?'Другое фото':'Выбрать фото'}</button><button class="btn pp-touch" data-a="cam">${I(IC.cam)}Снять</button><button class="btn" data-a="lib">${I(IC.lib)}Мои фото</button></div>
    ${has?'':'<p class="hint">Или перетащите файл на экран справа, ⌘V — вставить из буфера.</p>'}</div>
  <div class="card pp-card"><div class="hd">Документ</div>
    <select data-k="preset" class="pp-sel">${groups.map(g=>`<optgroup label="${E(g)}">${PRESETS.filter(p=>p.g===g).map(p=>`<option value="${p.id}"${p.id===S.preset?' selected':''}>${E(p.n)}</option>`).join('')}</optgroup>`).join('')}</select>
    <div class="pp-specbox"><div class="pp-specsz">${fmm(P.w)}<i>×</i>${fmm(P.h)}<small>мм</small></div><div class="pp-specl"><span>Голова <b>${fmm(P.head[0])}–${fmm(P.head[1])} мм</b></span><span>Макушка <b>${fmm(P.top[0])}–${fmm(P.top[1])} мм</b> от края</span>${P.eyes?`<span>Глаза <b>${P.eyes[0]}–${P.eyes[1]} мм</b> от низа</span>`:''}${P.chin?`<span>Под подбородком <b>≥ ${P.chin} мм</b></span>`:''}<span>Фон <b>${BGS[P.bg].n.toLowerCase()}</b></span></div></div>
    <p class="hint">${E(P.note||'')}</p>
    ${P.id==='custom'?`<div class="row3 pp-cust"><label class="f">Ширина, мм<input type="number" step="0.5" min="10" max="200" data-k="cw" value="${S.custom.w}"></label><label class="f">Высота, мм<input type="number" step="0.5" min="10" max="250" data-k="ch" value="${S.custom.h}"></label><span></span>
      <label class="f">Голова от<input type="number" step="0.5" data-k="ch0" value="${S.custom.h0}"></label><label class="f">до, мм<input type="number" step="0.5" data-k="ch1" value="${S.custom.h1}"></label><span></span>
      <label class="f">Сверху от<input type="number" step="0.5" data-k="ct0" value="${S.custom.t0}"></label><label class="f">до, мм<input type="number" step="0.5" data-k="ct1" value="${S.custom.t1}"></label></div>`:''}
    <label class="pp-line"><span>Уголок под печать</span><select data-k="corner">${Object.entries(CORNERS).map(([k,n])=>`<option value="${k}"${(S.corner||'off')===k?' selected':''}>${n}</option>`).join('')}</select></label></div>
  <div class="card pp-card"><div class="hd">Коррекция<span class="pp-hdb"><button class="btn sm${has&&J.adj.auto?' on':''}" data-a="auto"${dis} title="Авто-уровни и баланс белого">${I(IC.wand)}Авто</button><button class="btn sm icon" data-a="adjreset"${dis} title="Сбросить коррекцию" aria-label="Сбросить">${I(IC.reset)}</button></span></div>
    ${sl('b','Яркость',-50,50,1,has?J.adj.b:0,'±',!has)}${sl('c','Контраст',-50,50,1,has?J.adj.c:0,'±',!has)}${sl('t','Холодный ↔ тёплый',-50,50,1,has?J.adj.t:0,'±',!has)}
    <label class="chk"><input type="checkbox" data-k="bw"${S.bw?' checked':''}> Чёрно-белое</label></div>
  <div class="card pp-card"><div class="hd">Осветлить фон</div>
    <div class="seg pp-bgseg">${[['off','Нет'],['white','Белый'],['grey','Серый'],['blue','Голубой']].map(([k,n])=>`<button data-bg="${k}"${S.bgMode===k?' class="on"':''}>${k!=='off'?`<i style="background:${BGS[k].c}"></i>`:''}${n}</button>`).join('')}</div>
    <div class="pp-bgopts"${S.bgMode==='off'?' hidden':''}>${sl('tol','Допуск',4,60,1,S.tol,'')}${sl('feather','Мягкость края',0,12,1,S.feather,'')}
      <p class="hint">Фон заливается от краёв кадра и останавливается на чётких границах. Лицо внутри отметок не трогается.${has&&!J.marks?' Отметьте макушку и подбородок — защита лица станет точнее.':''}</p></div></div>
  <div class="card pp-card pp-lay"></div>
  <div class="card pp-card"><div class="hd">Файлы</div>
    <div class="pp-btns col"><button class="btn" data-a="jpg"${dis}>${I(IC.dl)}JPEG снимка · 600 dpi</button><button class="btn" data-a="sheetjpg"${dis}>${I(IC.dl)}JPEG листа · 300 dpi</button><button class="btn" data-a="tolib"${dis}>${I(IC.save)}В мои фото · «Документы»</button></div></div>
  <div class="card pp-card pp-ord"></div></div>`;
  panelLayout(); panelOrder(); bindPanel(); if(D.root) layoutStage(); }
let lastPrn='';
function panelLayout(){ const n=PB&&PB.querySelector('.pp-lay'); if(!n) return; lastPrn=KS.printer().id+'|'+(st.shop&&st.shop.paper||''); const S=store(), L=layout(), pr=KS.printer(), has=!!J;
  const blTxt=L.single?'':L.blOK?(L.bl?'Печать без полей ('+E(pr.n.replace('Canon ',''))+')':'С полями принтера: '+mTxt(L.m)):`${E(pr.n.replace('Canon ',''))}: без полей не умеет — ${mTxt(L.m)}`;
  n.innerHTML=`<div class="hd">Лист и печать</div>
    <div class="seg pp-shseg">${[['10x15','10×15'],['13x18','13×18'],['A4','A4'],['single','Один']].map(([k,t])=>`<button data-sh="${k}"${S.sheet===k?' class="on"':''}>${t}</button>`).join('')}</div>
    ${L.single?`<p class="hint">Страница ровно ${fmm(L.pw)}×${fmm(L.ph)} мм — для фотолаба, PDF или печати на наклейке.</p>`:`
    <div class="pp-cnt"><span>Снимков</span><div class="pp-step"><button class="btn sm icon" data-a="cnt-" aria-label="Меньше">${I(IC.minus)}</button><b>${L.n}</b><button class="btn sm icon" data-a="cnt+" aria-label="Больше"${L.n>=L.max?' disabled':''}>${I(IC.plus)}</button></div><button class="btn sm${S.count>0?'':' on'}" data-a="all">Весь лист · ${L.max}</button></div>
    ${sl('gap','Зазор между фото',0,6,.5,S.gap,'мм')}
    <div class="pp-chks"><label class="chk"><input type="checkbox" data-k="cut"${S.cut?' checked':''}> Метки реза</label>${L.blOK?`<label class="chk"><input type="checkbox" data-k="bl"${S.bl!==false?' checked':''}> Без полей</label>`:''}</div>
    <p class="hint pp-prn">${blTxt}${L.err?' · <b class="pp-err">'+E(L.err)+'</b>':''}</p>`}
    <button class="btn primary pp-print" data-a="print"${has&&!L.err?'':' disabled'}>${I(IC.print)}Печать · ${E(sheetLabel(L))}</button>
    <p class="hint pp-tipline">${I(IC.ok)}Печатайте на фотобумаге, масштаб 100%, без «вписать в страницу».</p>`; }
function panelOrder(){ const n=PB&&PB.querySelector('.pp-ord'); if(!n) return; const o=orderInfo(), keep=n.querySelector('.pp-orderok'), cli=n.querySelector('[data-k="client"]'), ph=n.querySelector('[data-k="phone"]');
  n.innerHTML=`<div class="hd">Заказ</div>
    <div class="row2"><label class="f">Цена комплекта<input type="number" min="0" step="50" data-k="price" value="${o.price}"></label><label class="f">Комплектов<div class="pp-step"><button class="btn sm icon" data-a="sets-" aria-label="Меньше">${I(IC.minus)}</button><b>${o.sets}</b><button class="btn sm icon" data-a="sets+" aria-label="Больше">${I(IC.plus)}</button></div></label></div>
    <div class="row2"><label class="f">Клиент<input type="text" data-k="client" placeholder="Имя" list="pp-clients" autocomplete="off" value="${E(cli?cli.value:'')}"></label><label class="f">Телефон<input type="tel" data-k="phone" placeholder="+374…" value="${E(ph?ph.value:'')}"></label></div><datalist id="pp-clients">${clientList().map(c=>`<option value="${E(c.name)}">${E(c.phone||'')}</option>`).join('')}</datalist>
    <div class="pp-total"><span>Итого</span><b>${E(KS.money(o.total))}</b></div>
    <div class="pp-btns"><button class="btn primary" data-a="order">${I(IC.order)}Добавить в заказ</button>${hasPos()?`<button class="btn" data-a="pos">${I(IC.cash)}В кассу</button>`:''}</div>
    <div class="pp-orderok"${keep&&!keep.hidden?'':' hidden'}>${keep?keep.innerHTML:''}</div>`; }
function bindPanel(){ if(!PB||PB._ppBound===PB.firstElementChild) return; PB._ppBound=PB.firstElementChild; const root=PB.firstElementChild;
  root.addEventListener('click',e=>{ const bg=e.target.closest('[data-bg]'); if(bg){ setBg(bg.dataset.bg); return; } const sh=e.target.closest('[data-sh]'); if(sh){ const S=store(); S.sheet=sh.dataset.sh; S.count=0; KS.save(); panelLayout(); panelOrder(); setView('sheet'); return; }
    const b=e.target.closest('[data-a]'); if(b&&!b.disabled) act(b.dataset.a,b); });
  root.addEventListener('input',e=>{ const t=e.target, k=t.dataset.k; if(!k) return; const S=store(), v=t.type==='checkbox'?t.checked:t.value, o=root.querySelector(`[data-o="${k}"]`);
    if(['b','c','t'].includes(k)){ if(!J) return; J.adj[k]=+v; if(o) o.textContent=fmtV(+v,'±'); queueProc(); saveJobSoon(); return; }
    if(k==='tol'||k==='feather'){ S[k]=+v; if(o) o.textContent=fmtV(+v,''); KS.save(); queueMask(); return; }
    if(k==='gap'){ S.gap=+v; if(o) o.textContent=fmtV(+v,'мм'); KS.save(); clearTimeout(bindPanel.t); bindPanel.t=setTimeout(()=>{ refreshLayoutBits(); },60); if(view!=='sheet') setView('sheet'); else queueSheet(); return; }
    if(k==='client'){ const c=clientList().find(x=>x.name===t.value), ph=root.querySelector('[data-k="phone"]'); if(c&&c.phone&&ph&&!ph.value) ph.value=c.phone; return; }
    if(k==='price'){ S.price=Math.max(0,+v||0); KS.save(); const tt=root.querySelector('.pp-total b'); if(tt) tt.textContent=KS.money(orderInfo().total); return; }
    if(['cw','ch','ch0','ch1','ct0','ct1'].includes(k)){ const m={cw:'w',ch:'h',ch0:'h0',ch1:'h1',ct0:'t0',ct1:'t1'}[k]; S.custom=Object.assign({},S.custom,{[m]:+v}); KS.save(); clearTimeout(bindPanel.c); bindPanel.c=setTimeout(()=>{ if(J&&J.marks) fitHead(); else if(J) coverFit(); layoutStage(); refreshLayoutBits(); saveJobSoon(); },250); return; } });
  root.addEventListener('change',e=>{ const t=e.target, k=t.dataset.k; if(!k) return; const S=store();
    if(k==='preset'){ setPreset(t.value); return; }
    if(k==='corner'){ S.corner=t.value; KS.save(); layoutStage(); queueSheet(); return; }
    if(k==='bw'){ S.bw=t.checked; KS.save(); queueProc(); return; }
    if(k==='cut'||k==='bl'){ S[k]=t.checked; KS.save(); panelLayout(); if(view!=='sheet') setView('sheet'); else queueSheet(); return; }
    if(['b','c','t','tol','feather'].includes(k)) saveJobSoon(); }); }
function refreshLayoutBits(){ const n=PB&&PB.querySelector('.pp-lay'); if(!n) return; const L=layout(), b=n.querySelector('.pp-step b'), p=n.querySelector('.pp-print'), a=n.querySelector('[data-a="all"]'); if(b) b.textContent=L.n; if(a) a.textContent='Весь лист · '+L.max; if(p) p.lastChild.textContent='Печать · '+sheetLabel(L); queueSheet(); updChips(); }
function setPreset(id){ const S=store(), P0=preset(); S.preset=id; const P=preset(); if(P.corner) S.corner=P.corner; else if(P0.corner&&S.corner===P0.corner) S.corner='off'; if(S.bgMode!=='off') S.bgMode=P.bg; KS.save();
  if(J){ if(J.marks) fitHead(); else coverFit(); saveJobSoon(); } renderPanel(); queueMask(); KS.emit('passportPreset',id); }
function setBg(k){ const S=store(); S.bgMode=k; KS.save(); PB&&PB.querySelectorAll('[data-bg]').forEach(b=>b.classList.toggle('on',b.dataset.bg===k)); const o=PB&&PB.querySelector('.pp-bgopts'); if(o) o.hidden=k==='off';
  if(D.fbg) D.fbg.style.background=BGS[bgKey()].c; if(k==='off'){ maskCv=null; maskDisp=null; queueProc(); } else { busy(true,'Осветляю фон…'); setTimeout(()=>{ try{ buildMask(); renderProc(); queueSheet(); } finally{ busy(false); updChips(); } },16); } updChips(); }

/* ---------------- registration ---------------- */
const mine=()=>{ const it=KS.active(); return !!(it&&it.id==='passport'&&scr&&!scr.hidden); };
KS.tab({id:'passport',group:'salon',groupTitle:'Фотосалон',groupIcon:I(IC.cam),title:'Фото на документы',seg:'Документы',icon:I(IC.cam),before:'prep',screen:true,
  render(box,o){ document.documentElement.classList.add('pp-on'); if(o.reason==='show'||!box.querySelector('.pp-side')){ mountScreen(o.screen); scr=o.screen; renderPanel(box); ensureJob(); requestAnimationFrame(()=>layoutStage()); }
    else { const p=box.querySelector('[data-a="pos"]'); if(!!p!==hasPos()) panelOrder();
      const pk=KS.printer().id+'|'+(st.shop&&st.shop.paper||''); if(pk!==lastPrn){ lastPrn=pk; KS.keepFocus(box,()=>panelLayout()); updChips(); queueSheet(); } } }});
KS.cmd('Фото на документы','фотосалон паспорт виза 3×4',()=>KS.show('salon','passport'));
KS.on('screenHide',k=>{ if(k==='salon:passport'){ document.documentElement.classList.remove('pp-on'); mk=null; mkFirst=null; cmp=false; } });
/* the big «Печать» button / ⌘P prints the photo sheet while this tab is open */
if(typeof printNow==='function'){ const _pn=printNow; printNow=async function(test){ if(!test&&mine()){ if(J) return printSheet(); KS.toast('Сначала загрузите фото клиента'); return; } return _pn.apply(this,arguments); }; }
window.addEventListener('keydown',e=>{ if(!mine()||e.defaultPrevented) return; const t=document.activeElement; if(t&&(/INPUT|TEXTAREA|SELECT/.test(t.tagName)||t.isContentEditable)) return;
  if(document.querySelector('.modal:not([hidden])')) return; const mod=e.metaKey||e.ctrlKey;
  if(e.key==='Escape'&&mk){ e.preventDefault(); e.stopPropagation(); startMark(); return; }
  if(mod||view!=='crop'||!J) return; const st=e.shiftKey?1:.1, mv={ArrowLeft:[-st,0],ArrowRight:[st,0],ArrowUp:[0,-st],ArrowDown:[0,st]}[e.key];
  if(mv){ e.preventDefault(); e.stopPropagation(); nudge(mv[0],mv[1]); return; }
  if(e.key==='+'||e.key==='='){ e.preventDefault(); e.stopPropagation(); zoomBtn(e.shiftKey?1.02:1.05); return; } if(e.key==='-'||e.key==='_'){ e.preventDefault(); e.stopPropagation(); zoomBtn(1/(e.shiftKey?1.02:1.05)); return; }
  if(e.key==='0'){ e.preventDefault(); e.stopPropagation(); act('fit'); } },true);
window.addEventListener('paste',e=>{ if(!mine()) return; const t=document.activeElement; if(t&&(/INPUT|TEXTAREA/.test(t.tagName)||t.isContentEditable)) return;
  const it=[...((e.clipboardData&&e.clipboardData.items)||[])].find(x=>/^image\//.test(x.type)); if(!it) return; e.preventDefault(); e.stopPropagation(); const f=it.getAsFile(); if(f) loadFile(new File([f],'Из буфера',{type:f.type})); },true);
/* test / integration hooks */
KS.mods.passport.api={get job(){ return J; },preset,layout,measure,checks,i2f,f2i,renderCrop,renderSheet,cutSegs,setPhoto,fitHead,printSheet,exportPhoto,exportSheet,toLibrary,addOrder,setPreset,setBg,
  stage:()=>({kpx,FX,FY,view,mk,raf}),maskAt:(x,y)=>{ if(!maskDisp||!base) return 0; const sx=Math.round(x*base.w/J.iw), sy=Math.round(y*base.h/J.ih); return maskDisp[sy*base.w+sx]||0; }};
