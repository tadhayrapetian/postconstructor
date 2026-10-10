/* ---- pcmock: «Мокап» and «Instagram» sub-tabs of «Открытки» ----
   The current design is rasterized with the app's pageCanvas (≈200 dpi) and composed on a big canvas
   into photo-like scenes drawn procedurally (wood, linen, marble, wall, frame, envelope, dried flowers). */
KS.mod('pcmock',{title:'Мокап и Instagram'});
const PM_CAP='Заказать: Instagram @tadhayrapetian';
const pmS=()=>KS.store('pcmock',{scene:'flat',surf:'oak',env:'kraft',frame:'oak',wall:'warm',back:true,leaves:true,fmt:'auto',ig:{bg:'soft',cap:PM_CAP,mark:true,back:true}});
const PM_SCENES=[['flat','На столе'],['frame','В рамке'],['stack','Стопка'],['duo','Лицо и оборот'],['tilt','3D в воздухе']];
const PM_SURF=[['oak','Дуб'],['walnut','Орех'],['linen','Лён'],['marble','Мрамор']];
const PM_ENV=[['kraft','Крафт'],['white','Белый'],['blush','Пудровый']];
const PM_FRAME=[['oak','Дуб'],['white','Белая'],['black','Чёрная']];
const PM_WALL=[['warm','Тёплая'],['sage','Шалфей'],['clay','Глина'],['ink','Графит']];
const PM_FMT=[['auto','Авто'],['43','4 : 3'],['11','1 : 1'],['45','4 : 5']];
const PM_IGBG=[['soft','Цвет открытки'],['blur','Размытие'],['white','Белый'],['dark','Тёмный']];
const PM={card:{},busy:0,tok:0,cv:null,thumbs:{},ig:{},igTok:0,err:''};

/* ---------- small helpers ---------- */
const pmOn=()=>{ try{ return typeof dzOn==='function'&&!!dzOn()&&!!st.dz; }catch(_){ return false; } };
const pmIsPC=()=>pmOn()&&['pcH','pcV'].includes(st.dz.kind);
const pmHasBack=()=>pmOn()&&(st.dz.sides||1)>1;
const pmRng=seed=>{ let a=seed>>>0||1; return ()=>{ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; };
const pmHash=s=>{ let h=2166136261; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return (h>>>0).toString(36)+s.length; };
const pmHex=c=>{ c=String(c||'#888').trim(); let m=c.match(/^#?([0-9a-f]{6})$/i); if(m) return [0,2,4].map(i=>parseInt(m[1].slice(i,i+2),16)); m=c.match(/^#?([0-9a-f]{3})$/i); if(m) return [...m[1]].map(x=>parseInt(x+x,16)); m=c.match(/rgba?\(([^)]+)\)/); if(m) return m[1].split(/[ ,/]+/).slice(0,3).map(Number); return [136,136,136]; };
const pmMix=(a,b,t)=>{ const A=pmHex(a),B=pmHex(b); return 'rgb('+A.map((v,i)=>Math.round(v+(B[i]-v)*t)).join(',')+')'; };
const pmRgba=(c,a)=>'rgba('+pmHex(c).join(',')+','+a+')';
const pmLum=c=>{ const [r,g,b]=pmHex(c); return (.2126*r+.7152*g+.0722*b)/255; };
const pmCanvas=(w,h)=>{ const c=document.createElement('canvas'); c.width=Math.max(1,Math.round(w)); c.height=Math.max(1,Math.round(h)); return c; };
const pmTick=()=>new Promise(r=>setTimeout(r,0));
function pmPal(){ try{ return dzPal(st.dz&&st.dz.pal); }catch(_){ return {bg:'#ffffff',ink:'#2b2b2b',acc:'#9a6b5a',acc2:'#7d9580',soft:'#f4ede6'}; } }
/* fine grain noise (cached) */
let pmNz=null;
function pmNoise(){ if(pmNz) return pmNz; const c=pmCanvas(256,256), g=c.getContext('2d'), d=g.createImageData(256,256), r=pmRng(7);
  for(let i=0;i<d.data.length;i+=4){ const v=128+(r()-.5)*110; d.data[i]=d.data[i+1]=d.data[i+2]=v; d.data[i+3]=255; } g.putImageData(d,0,0); return pmNz=c; }
function pmGrain(g,W,H,a,mode,clip){ g.save(); if(clip) clip(); g.globalAlpha=a; g.globalCompositeOperation=mode||'overlay'; g.fillStyle=g.createPattern(pmNoise(),'repeat'); g.fillRect(0,0,W,H); g.restore(); }
/* soft blotches: tiny random canvas scaled up */
function pmClouds(g,W,H,seed,a,dark,n){ const r=pmRng(seed), cw=n||12, ch=Math.max(2,Math.round(cw*H/W)), c=pmCanvas(cw,ch), x=c.getContext('2d'), d=x.createImageData(cw,ch);
  for(let i=0;i<d.data.length;i+=4){ const v=r(); d.data[i]=d.data[i+1]=d.data[i+2]=dark?0:255; d.data[i+3]=Math.round(v*255); } x.putImageData(d,0,0);
  g.save(); g.globalAlpha=a; g.imageSmoothingEnabled=true; g.imageSmoothingQuality='high'; g.drawImage(c,-W*.05,-H*.05,W*1.1,H*1.1); g.restore(); }
/* draw only the blurred shadow of a polygon or an image (shape itself stays off-canvas) */
function pmShadePoly(g,pts,blur,col,dx,dy){ const O=30000; g.save(); g.setTransform(1,0,0,1,0,0); g.shadowColor=col; g.shadowBlur=blur; g.shadowOffsetX=dx+O; g.shadowOffsetY=dy; g.fillStyle='#000';
  g.beginPath(); pts.forEach(([x,y],i)=>i?g.lineTo(x-O,y):g.moveTo(x-O,y)); g.closePath(); g.fill(); g.restore(); }
function pmShadeImg(g,img,x,y,w,h,blur,col,dx,dy){ const O=30000; g.save(); g.setTransform(1,0,0,1,0,0); g.shadowColor=col; g.shadowBlur=blur; g.shadowOffsetX=dx+O; g.shadowOffsetY=dy; g.drawImage(img,x-O,y,w,h); g.restore(); }
const pmQuad=(cx,cy,w,h,rot)=>{ const c=Math.cos(rot), s=Math.sin(rot); return [[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]].map(([x,y])=>[cx+x*c-y*s,cy+x*s+y*c]); };
const pmFit=(bw,bh,a)=>{ let w=bw, h=w/a; if(h>bh){ h=bh; w=h*a; } return [w,h]; };
function pmRR(g,x,y,w,h,r){ g.beginPath(); g.moveTo(x+r,y); g.lineTo(x+w-r,y); g.quadraticCurveTo(x+w,y,x+w,y+r); g.lineTo(x+w,y+h-r); g.quadraticCurveTo(x+w,y+h,x+w-r,y+h); g.lineTo(x+r,y+h); g.quadraticCurveTo(x,y+h,x,y+h-r); g.lineTo(x,y+r); g.quadraticCurveTo(x,y,x+r,y); g.closePath(); }

/* ---------- the card itself: shadows, paper texture, light ---------- */
function pmCard(g,img,cx,cy,w,h,rot,o={}){ const U=Math.max(w,h), lift=o.lift==null?1:o.lift, q=pmQuad(cx,cy,w,h,rot);
  pmShadePoly(g,q,U*.075*lift,'rgba(40,28,16,'+(.20*Math.min(1.4,lift+.2))+')',U*.012*lift,U*.035*lift);
  pmShadePoly(g,q,U*.018,'rgba(30,20,10,.26)',U*.002,U*.008*lift);
  pmShadePoly(g,q,Math.max(1.5,U*.003),'rgba(0,0,0,.35)',0,U*.0015);
  g.save(); g.translate(cx,cy); g.rotate(rot); pmRR(g,-w/2,-h/2,w,h,U*.0035); g.clip();
  g.fillStyle='#fff'; g.fillRect(-w/2,-h/2,w,h); g.imageSmoothingEnabled=true; g.imageSmoothingQuality='high'; g.drawImage(img,-w/2,-h/2,w,h);
  /* paper tooth + window light */
  g.globalAlpha=.10; g.globalCompositeOperation='overlay'; g.fillStyle=g.createPattern(pmNoise(),'repeat'); g.fillRect(-w/2,-h/2,w,h);
  g.globalAlpha=1; g.globalCompositeOperation='source-over';
  const lg=g.createLinearGradient(-w/2,-h/2,w/2,h/2); lg.addColorStop(0,'rgba(255,255,255,.12)'); lg.addColorStop(.45,'rgba(255,255,255,0)'); lg.addColorStop(1,'rgba(40,25,10,.07)'); g.fillStyle=lg; g.fillRect(-w/2,-h/2,w,h);
  g.lineWidth=Math.max(1,U*.0016); g.strokeStyle='rgba(0,0,0,.10)'; pmRR(g,-w/2,-h/2,w,h,U*.0035); g.stroke();
  g.strokeStyle='rgba(255,255,255,.55)'; g.lineWidth=Math.max(.6,U*.0009); g.beginPath(); g.moveTo(-w/2+1,h/2-2); g.lineTo(-w/2+1,-h/2+1); g.lineTo(w/2-2,-h/2+1); g.stroke();
  g.restore(); return q; }

/* ---------- surfaces ---------- */
function pmWood(g,W,H,dark,seed){ const r=pmRng(seed), k=W/2400, cols=dark?['#5d3d29','#533522','#674630','#4c3121']:['#cfab84','#c6a079','#d6b38c','#c19a71'];
  let x=-r()*W*.1; const pw=W/(4.2+r()*.6);
  while(x<W){ const x1=x+pw*(.85+r()*.3), base=cols[Math.floor(r()*cols.length)]; g.save(); g.beginPath(); g.rect(x,0,x1-x,H); g.clip();
    const lg=g.createLinearGradient(0,0,0,H); lg.addColorStop(0,pmMix(base,'#fff',.05)); lg.addColorStop(.5,base); lg.addColorStop(1,pmMix(base,'#000',.06)); g.fillStyle=lg; g.fillRect(x,0,x1-x,H);
    const n=Math.round((x1-x)/(3.2*k)); for(let i=0;i<n;i++){ const gx=x+r()*(x1-x), a1=(4+r()*16)*k, f1=(.6+r()*2)/H*6, p1=r()*7, a2=(1+r()*3)*k, f2=(4+r()*9)/H*6, p2=r()*7;
      g.beginPath(); for(let y=-10;y<=H+10;y+=H/70){ const xx=gx+a1*Math.sin(y*f1+p1)+a2*Math.sin(y*f2+p2); y<0?g.moveTo(xx,y):g.lineTo(xx,y); }
      const dk=r()<.72; g.strokeStyle=dk?'rgba('+(dark?'20,10,4':'95,60,30')+','+(.04+r()*.12)+')':'rgba(255,240,220,'+(.03+r()*.07)+')'; g.lineWidth=(.5+r()*r()*3.2)*k; g.stroke(); }
    if(r()<.35){ const kx=x+(x1-x)*(.25+r()*.5), ky=r()*H; for(let j=9;j>0;j--){ g.beginPath(); g.ellipse(kx,ky,j*2.4*k,j*7*k,0,0,Math.PI*2); g.strokeStyle='rgba('+(dark?'15,8,3':'90,55,25')+','+(.05+j*.008)+')'; g.lineWidth=1.3*k; g.stroke(); } }
    g.restore();
    g.fillStyle='rgba(20,10,4,'+(dark?.55:.30)+')'; g.fillRect(x1-1.6*k,0,2.4*k,H); g.fillStyle='rgba(255,245,230,'+(dark?.05:.12)+')'; g.fillRect(x1+.8*k,0,1.4*k,H); x=x1; }
  pmGrain(g,W,H,.10); }
function pmLinen(g,W,H,seed){ const r=pmRng(seed), k=W/2400; g.fillStyle='#ece4d6'; g.fillRect(0,0,W,H); pmClouds(g,W,H,seed+3,.06,true,8);
  const s=3.4*k; g.lineWidth=s*.55;
  for(let y=0;y<H;y+=s){ g.strokeStyle=r()<.5?'rgba(255,255,255,'+(r()*.16)+')':'rgba(130,105,70,'+(r()*.06)+')'; g.beginPath(); g.moveTo(0,y); g.lineTo(W,y+(r()-.5)*2*k); g.stroke(); }
  for(let x=0;x<W;x+=s){ g.strokeStyle=r()<.5?'rgba(255,255,255,'+(r()*.12)+')':'rgba(130,105,70,'+(r()*.05)+')'; g.beginPath(); g.moveTo(x,0); g.lineTo(x+(r()-.5)*2*k,H); g.stroke(); }
  for(let i=0;i<W*H/9000;i++){ const hz=r()<.5, x=r()*W, y=r()*H, L=(14+r()*60)*k; g.strokeStyle=r()<.5?'rgba(255,252,245,.20)':'rgba(120,98,66,.14)'; g.lineWidth=(1+r()*1.6)*k; g.beginPath(); g.moveTo(x,y); hz?g.lineTo(x+L,y):g.lineTo(x,y+L); g.stroke(); }
  for(let i=0;i<4;i++){ const lg=g.createLinearGradient(r()*W,0,r()*W,H); const a=.035+r()*.04; lg.addColorStop(0,'rgba(255,255,255,0)'); lg.addColorStop(.48,'rgba(255,255,255,'+a+')'); lg.addColorStop(.52,'rgba(80,60,40,'+a+')'); lg.addColorStop(1,'rgba(80,60,40,0)'); g.fillStyle=lg; g.fillRect(0,0,W,H); }
  pmGrain(g,W,H,.12); }
function pmMarble(g,W,H,seed){ const r=pmRng(seed), k=W/2400; const lg=g.createLinearGradient(0,0,W,H); lg.addColorStop(0,'#f6f4f1'); lg.addColorStop(1,'#e9e6e1'); g.fillStyle=lg; g.fillRect(0,0,W,H);
  pmClouds(g,W,H,seed+5,.10,true,10); pmClouds(g,W,H,seed+9,.35,false,18);
  const vein=(x,y,a,len,wd,al,depth)=>{ g.beginPath(); g.moveTo(x,y); const pts=[[x,y]]; for(let i=0;i<len;i++){ a+=(r()-.5)*.5; x+=Math.cos(a)*14*k; y+=Math.sin(a)*14*k; g.lineTo(x,y); pts.push([x,y]); }
    g.save(); g.lineJoin='round'; g.lineCap='round'; g.strokeStyle='rgba(150,146,150,'+(al*.35)+')'; g.lineWidth=wd*9*k; g.stroke(); g.strokeStyle='rgba(120,116,122,'+al+')'; g.lineWidth=wd*k; g.stroke(); g.restore();
    if(depth<2) for(let b=0;b<3;b++){ const p=pts[Math.floor(r()*pts.length)]; vein(p[0],p[1],a+(r()-.5)*1.6,len*.4|0,wd*.6,al*.8,depth+1); } };
  for(let i=0;i<5;i++) vein(r()*W*.3-W*.1,r()*H,-.3+r()*.6+(r()<.5?0:.5),Math.round(W/14/k*1.1),1+r()*1.4,.10+r()*.12,0);
  pmGrain(g,W,H,.06); }
function pmSurface(g,W,H,kind,seed){ if(kind==='walnut') pmWood(g,W,H,true,seed); else if(kind==='linen') pmLinen(g,W,H,seed); else if(kind==='marble') pmMarble(g,W,H,seed); else pmWood(g,W,H,false,seed); }
/* window light from the top left + vignette */
function pmLight(g,W,H,s){ s=s==null?1:s; const D=Math.hypot(W,H);
  let rg=g.createRadialGradient(W*.12,H*.02,0,W*.12,H*.02,D*.75); rg.addColorStop(0,'rgba(255,248,236,'+(.20*s)+')'); rg.addColorStop(1,'rgba(255,248,236,0)'); g.fillStyle=rg; g.fillRect(0,0,W,H);
  rg=g.createRadialGradient(W/2,H/2,D*.28,W/2,H/2,D*.62); rg.addColorStop(0,'rgba(0,0,0,0)'); rg.addColorStop(1,'rgba(20,12,4,'+(.30*s)+')'); g.fillStyle=rg; g.fillRect(0,0,W,H); }
/* soft shadow of leaves from a window */
function pmGobo(g,W,H,seed,a){ const r=pmRng(seed), L=pmCanvas(W,H), x=L.getContext('2d'), k=W/2400; x.fillStyle='#000'; x.strokeStyle='#000';
  for(let b=0;b<3;b++){ let px=W*(.62+r()*.45), py=-H*.05+r()*H*.25, an=Math.PI*(.62+r()*.25); x.lineWidth=7*k; x.beginPath(); x.moveTo(px,py);
    for(let i=0;i<9;i++){ an+=(r()-.5)*.25; const nx=px+Math.cos(an)*95*k, ny=py+Math.sin(an)*95*k; x.lineTo(nx,ny);
      for(const sd of [-1,1]){ const la=an+sd*(.75+r()*.3), lx=nx+Math.cos(la)*70*k, ly=ny+Math.sin(la)*70*k; x.save(); x.translate(lx,ly); x.rotate(la); x.beginPath(); x.ellipse(0,0,(78+r()*40)*k,(22+r()*9)*k,0,0,Math.PI*2); x.fill(); x.restore(); }
      px=nx; py=ny; } x.stroke(); }
  g.save(); g.globalAlpha=a; pmShadeImg(g,L,0,0,W,H,26*k,'rgba(30,22,12,1)',0,0); g.restore(); }

/* ---------- props ---------- */
function pmSeal(g,x,y,R,seed){ const r=pmRng(seed); g.save(); g.translate(x,y);
  g.beginPath(); for(let i=0;i<=48;i++){ const t=i/48*Math.PI*2, rr=R*(1+.055*Math.sin(5*t+1.3)+.035*Math.sin(11*t)+(r()-.5)*.03); i?g.lineTo(Math.cos(t)*rr,Math.sin(t)*rr):g.moveTo(Math.cos(t)*rr,Math.sin(t)*rr); } g.closePath();
  g.shadowColor='rgba(30,0,0,.45)'; g.shadowBlur=R*.35; g.shadowOffsetY=R*.14; const rg=g.createRadialGradient(-R*.35,-R*.4,R*.1,0,0,R*1.1); rg.addColorStop(0,'#b44a44'); rg.addColorStop(.6,'#8a2a29'); rg.addColorStop(1,'#5e1819'); g.fillStyle=rg; g.fill(); g.shadowColor='transparent';
  g.beginPath(); g.arc(0,0,R*.70,0,Math.PI*2); g.lineWidth=R*.07; g.strokeStyle='rgba(60,8,8,.55)'; g.stroke(); g.beginPath(); g.arc(-R*.02,-R*.03,R*.70,Math.PI*1.05,Math.PI*1.6); g.strokeStyle='rgba(255,190,180,.35)'; g.lineWidth=R*.04; g.stroke();
  g.font='600 '+(R*.62).toFixed(1)+'px "Cormorant Garamond", Georgia, serif'; g.textAlign='center'; g.textBaseline='middle';
  g.fillStyle='rgba(255,200,190,.28)'; g.fillText('TH',-R*.02,R*.02); g.fillStyle='rgba(55,6,6,.65)'; g.fillText('TH',R*.02,R*.06); g.restore(); }
function pmEnvelope(g,cx,cy,w,h,rot,kind,seed){ const col=kind==='white'?'#f3f0e9':kind==='blush'?'#e9d3c8':'#c8a57a', U=Math.max(w,h);
  const q=pmQuad(cx,cy,w,h,rot); pmShadePoly(g,q,U*.05,'rgba(40,25,10,.22)',U*.01,U*.025); pmShadePoly(g,q,U*.012,'rgba(30,20,10,.25)',0,U*.005);
  g.save(); g.translate(cx,cy); g.rotate(rot); pmRR(g,-w/2,-h/2,w,h,U*.006); g.clip(); g.fillStyle=col; g.fillRect(-w/2,-h/2,w,h);
  if(kind==='kraft'){ const r=pmRng(seed); for(let i=0;i<900;i++){ g.strokeStyle=r()<.5?'rgba(90,60,25,.12)':'rgba(255,240,215,.14)'; g.lineWidth=.8+r()*1.2; const x=-w/2+r()*w, y=-h/2+r()*h, a=r()*Math.PI; g.beginPath(); g.moveTo(x,y); g.lineTo(x+Math.cos(a)*U*.012,y+Math.sin(a)*U*.012); g.stroke(); } }
  const tri=(pts,fill,sh)=>{ g.save(); g.beginPath(); pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y)); g.closePath(); if(sh){ g.shadowColor='rgba(40,25,10,.22)'; g.shadowBlur=U*.012; g.shadowOffsetY=U*.004; } g.fillStyle=fill; g.fill(); g.restore(); };
  const lgL=g.createLinearGradient(-w/2,0,0,0); lgL.addColorStop(0,pmMix(col,'#000',.02)); lgL.addColorStop(1,pmMix(col,'#000',.07));
  tri([[-w/2,-h/2],[-w*.02,h*.06],[-w/2,h/2]],lgL,true); tri([[w/2,-h/2],[w*.02,h*.06],[w/2,h/2]],lgL,true);
  const lgB=g.createLinearGradient(0,h/2,0,-h*.05); lgB.addColorStop(0,pmMix(col,'#fff',.05)); lgB.addColorStop(1,pmMix(col,'#000',.04)); tri([[-w/2,h/2],[0,-h*.04],[w/2,h/2]],lgB,true);
  const lgT=g.createLinearGradient(0,-h/2,0,h*.12); lgT.addColorStop(0,pmMix(col,'#fff',.07)); lgT.addColorStop(1,pmMix(col,'#000',.03)); tri([[-w/2,-h/2],[0,h*.12],[w/2,-h/2]],lgT,true);
  g.globalAlpha=.10; g.globalCompositeOperation='overlay'; g.fillStyle=g.createPattern(pmNoise(),'repeat'); g.fillRect(-w/2,-h/2,w,h); g.globalAlpha=1; g.globalCompositeOperation='source-over';
  g.restore(); const sx=cx-Math.sin(rot)*h*.12, sy=cy+Math.cos(rot)*h*.12; pmSeal(g,sx,sy,U*.05,seed+1); }
/* bundle of dried flowers (gypsophila + lavender + eucalyptus-like leaves) tied with twine */
function pmSprig(g,x0,y0,len,ang,seed,W,H){ const r=pmRng(seed), L=pmCanvas(W,H), x=L.getContext('2d'), k=len/900; x.lineCap='round'; x.lineJoin='round';
  const stems=[]; for(let s=0;s<6;s++){ const a=ang+(s-2.5)*.11+(r()-.5)*.08, l=len*(.75+r()*.3), bend=(r()-.5)*.45; stems.push({a,l,bend,type:s%3}); }
  stems.forEach((S,si)=>{ const p0=[x0,y0], p2=[x0+Math.cos(S.a)*S.l,y0+Math.sin(S.a)*S.l], p1=[x0+Math.cos(S.a+S.bend)*S.l*.55,y0+Math.sin(S.a+S.bend)*S.l*.55];
    const P=t=>[(1-t)*(1-t)*p0[0]+2*(1-t)*t*p1[0]+t*t*p2[0],(1-t)*(1-t)*p0[1]+2*(1-t)*t*p1[1]+t*t*p2[1]];
    x.strokeStyle=S.type===1?'#7d8466':'#8b7a58'; for(let i=0;i<20;i++){ const a=P(i/20), b=P((i+1)/20); x.lineWidth=(5.2-i*.18)*k; x.beginPath(); x.moveTo(a[0],a[1]); x.lineTo(b[0],b[1]); x.stroke(); }
    if(S.type===0){ /* gypsophila: branching tiny florets */ for(let j=0;j<7;j++){ const t=.45+j*.08, b=P(Math.min(1,t)), ba=S.a+(r()-.5)*1.6, bl=S.l*(.08+r()*.12), e=[b[0]+Math.cos(ba)*bl,b[1]+Math.sin(ba)*bl];
        x.strokeStyle='#8f8160'; x.lineWidth=1.6*k; x.beginPath(); x.moveTo(b[0],b[1]); x.lineTo(e[0],e[1]); x.stroke();
        for(let f=0;f<9;f++){ const fx=e[0]+(r()-.5)*36*k, fy=e[1]+(r()-.5)*36*k, fr=(4+r()*4)*k; x.strokeStyle='#8f8160'; x.lineWidth=.9*k; x.beginPath(); x.moveTo(e[0],e[1]); x.lineTo(fx,fy); x.stroke();
          const rg=x.createRadialGradient(fx-fr*.3,fy-fr*.3,0,fx,fy,fr); rg.addColorStop(0,'#fffaf0'); rg.addColorStop(1,'#e1d4bf'); x.fillStyle=rg; x.beginPath(); x.arc(fx,fy,fr,0,Math.PI*2); x.fill(); } } }
    else if(S.type===1){ /* eucalyptus-like round leaves */ for(let j=0;j<9;j++){ const t=.25+j*.085, b=P(Math.min(1,t)), sd=j%2?1:-1, la=S.a+sd*(1.0+r()*.3), lr=(26+r()*12)*k*(1.1-t*.5);
        const c=[b[0]+Math.cos(la)*lr*.9,b[1]+Math.sin(la)*lr*.9]; x.save(); x.translate(c[0],c[1]); x.rotate(la); const lg=x.createLinearGradient(-lr,0,lr,0); lg.addColorStop(0,'#9aa48a'); lg.addColorStop(1,'#b7bea4'); x.fillStyle=lg; x.beginPath(); x.ellipse(0,0,lr,lr*.78,0,0,Math.PI*2); x.fill(); x.strokeStyle='rgba(80,90,60,.35)'; x.lineWidth=1.1*k; x.beginPath(); x.moveTo(-lr*.9,0); x.lineTo(lr*.8,0); x.stroke(); x.restore(); } }
    else { /* lavender: bud spike */ for(let j=0;j<26;j++){ const t=.62+j*.0145, b=P(Math.min(1,t)), sd=j%2?1:-1, bx=b[0]+Math.cos(S.a+sd*1.3)*5*k, by=b[1]+Math.sin(S.a+sd*1.3)*5*k;
        x.save(); x.translate(bx,by); x.rotate(S.a+sd*.5); x.fillStyle=j%3?'#8a7aa3':'#a596bb'; x.beginPath(); x.ellipse(0,0,8*k,4.6*k,0,0,Math.PI*2); x.fill(); x.restore(); } } });
  /* twine */ const tx=x0+Math.cos(ang)*len*.16, ty=y0+Math.sin(ang)*len*.16; x.strokeStyle='#b89466'; x.lineWidth=3.2*k;
  for(let i=0;i<4;i++){ x.beginPath(); x.ellipse(tx+Math.cos(ang)*i*5*k,ty+Math.sin(ang)*i*5*k,26*k,9*k,ang+Math.PI/2,0,Math.PI*2); x.stroke(); }
  x.beginPath(); x.moveTo(tx,ty); x.bezierCurveTo(tx+60*k,ty+20*k,tx+70*k,ty+90*k,tx+30*k,ty+130*k); x.moveTo(tx,ty); x.bezierCurveTo(tx-50*k,ty+40*k,tx-20*k,ty+100*k,tx-60*k,ty+140*k); x.stroke();
  pmShadeImg(g,L,0,0,W,H,len*.02,'rgba(35,22,10,.32)',len*.012,len*.02); g.drawImage(L,0,0); }

/* ---------- 3D: perspective warp by triangle mesh ---------- */
function pmTri(g,img,s,d){ const cx=(d[0][0]+d[1][0]+d[2][0])/3, cy=(d[0][1]+d[1][1]+d[2][1])/3, ex=p=>{ const dx=p[0]-cx, dy=p[1]-cy, l=Math.hypot(dx,dy)||1; return [p[0]+dx/l*.8,p[1]+dy/l*.8]; };
  const [x0,y0]=s[0],[x1,y1]=s[1],[x2,y2]=s[2], den=(x1-x0)*(y2-y0)-(x2-x0)*(y1-y0); if(!den) return;
  const a=((d[1][0]-d[0][0])*(y2-y0)-(d[2][0]-d[0][0])*(y1-y0))/den, c=((d[2][0]-d[0][0])*(x1-x0)-(d[1][0]-d[0][0])*(x2-x0))/den;
  const b=((d[1][1]-d[0][1])*(y2-y0)-(d[2][1]-d[0][1])*(y1-y0))/den, dd=((d[2][1]-d[0][1])*(x1-x0)-(d[1][1]-d[0][1])*(x2-x0))/den;
  g.save(); g.beginPath(); const e=d.map(ex); g.moveTo(e[0][0],e[0][1]); g.lineTo(e[1][0],e[1][1]); g.lineTo(e[2][0],e[2][1]); g.closePath(); g.clip();
  g.setTransform(a,b,c,dd,d[0][0]-a*x0-c*y0,d[0][1]-b*x0-dd*y0);
  const mx=Math.max(0,Math.min(x0,x1,x2)-2), my=Math.max(0,Math.min(y0,y1,y2)-2), Mx=Math.min(img.width,Math.max(x0,x1,x2)+2), My=Math.min(img.height,Math.max(y0,y1,y2)+2);
  g.drawImage(img,mx,my,Mx-mx,My-my,mx,my,Mx-mx,My-my); g.restore(); }
function pmWarp(g,img,P,N){ const iw=img.width, ih=img.height, pts=[]; for(let j=0;j<=N;j++){ pts[j]=[]; for(let i=0;i<=N;i++) pts[j][i]=P(i/N,j/N); }
  for(let j=0;j<N;j++) for(let i=0;i<N;i++){ const s=[[i/N*iw,j/N*ih],[(i+1)/N*iw,j/N*ih],[(i+1)/N*iw,(j+1)/N*ih],[i/N*iw,(j+1)/N*ih]], d=[pts[j][i],pts[j][i+1],pts[j+1][i+1],pts[j+1][i]];
    pmTri(g,img,[s[0],s[1],s[2]],[d[0],d[1],d[2]]); pmTri(g,img,[s[0],s[2],s[3]],[d[0],d[2],d[3]]); } }
function pmProj(cx,cy,w,h,rx,ry,rz,f,z0){ const C=Math.cos, S=Math.sin; return (u,v)=>{ let X=(u-.5)*w, Y=(v-.5)*h, Z=z0||0, t;
  t=X*C(rz)-Y*S(rz); Y=X*S(rz)+Y*C(rz); X=t; t=X*C(ry)+Z*S(ry); Z=-X*S(ry)+Z*C(ry); X=t; t=Y*C(rx)-Z*S(rx); Z=Y*S(rx)+Z*C(rx); Y=t; const kk=f/(f+Z); return [cx+X*kk,cy+Y*kk]; }; }
function pmCard3D(g,img,cx,cy,w,h,rx,ry,rz,W){ const f=w*2.4, P=pmProj(cx,cy,w,h,rx,ry,rz,f,0), B=pmProj(cx,cy,w,h,rx,ry,rz,f,Math.max(w,h)*.006);
  const q=[P(0,0),P(1,0),P(1,1),P(0,1)], qb=[B(0,0),B(1,0),B(1,1),B(0,1)], U=Math.max(w,h);
  pmShadePoly(g,q.map(([x,y])=>[x+U*.05,y+U*.09]),U*.09,'rgba(30,20,10,.30)',0,0);
  pmShadePoly(g,q.map(([x,y])=>[x+U*.02,y+U*.035]),U*.03,'rgba(30,20,10,.22)',0,0);
  g.save(); g.beginPath(); qb.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y)); g.closePath(); g.fillStyle='#d9d3c9'; g.fill(); g.restore();
  /* edge strips between back and front faces */
  for(let i=0;i<4;i++){ const a=q[i], b=q[(i+1)%4], c=qb[(i+1)%4], d=qb[i]; g.beginPath(); g.moveTo(a[0],a[1]); g.lineTo(b[0],b[1]); g.lineTo(c[0],c[1]); g.lineTo(d[0],d[1]); g.closePath(); g.fillStyle=i===1||i===2?'#cfc8bd':'#ece7df'; g.fill(); }
  pmWarp(g,img,P,12);
  g.save(); g.beginPath(); q.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y)); g.closePath(); g.clip();
  g.globalAlpha=.10; g.globalCompositeOperation='overlay'; g.fillStyle=g.createPattern(pmNoise(),'repeat'); g.fillRect(0,0,W,W*2); g.globalAlpha=1; g.globalCompositeOperation='source-over';
  const lg=g.createLinearGradient(q[0][0],q[0][1],q[2][0],q[2][1]); lg.addColorStop(0,'rgba(255,255,255,.16)'); lg.addColorStop(.35,'rgba(255,255,255,.02)'); lg.addColorStop(.7,'rgba(0,0,0,0)'); lg.addColorStop(1,'rgba(30,20,10,.10)'); g.fillStyle=lg; g.fillRect(0,0,W,W*2);
  g.restore(); }

/* ---------- scenes ---------- */
function pmSize(fmt,a,big){ const f=fmt==='auto'?(a>=1?'43':'45'):fmt, L=big?2400:480; return f==='11'?[L*5/6,L*5/6]:f==='45'?[L*.75,L*.9375]:[L,L*.75]; }
function pmCompose(scene,cards,o,W,H){ const cv=pmCanvas(W,H), g=cv.getContext('2d'), F=cards.front, Bk=o.back&&cards.back?cards.back:null, a=F.width/F.height, u=Math.min(W,H), seed=17;
  g.imageSmoothingEnabled=true; g.imageSmoothingQuality='high';
  if(scene==='frame'){ const wc={warm:['#efe9df','#e4dccf'],sage:['#c9cfbf','#b8bfac'],clay:['#d7b9a3','#c8a58c'],ink:['#3b3d40','#2e3033']}[o.wall]||['#efe9df','#e4dccf'];
    const lg=g.createLinearGradient(0,0,W*.3,H); lg.addColorStop(0,wc[0]); lg.addColorStop(1,wc[1]); g.fillStyle=lg; g.fillRect(0,0,W,H); pmClouds(g,W,H,seed+11,.07,true,14); pmClouds(g,W,H,seed+12,.10,false,30); pmGrain(g,W,H,.14);
    if(o.leaves) pmGobo(g,W,H,seed+2,o.wall==='ink'?.22:.16);
    const [cw,ch]=pmFit(W*.44,H*.50,a), mat=Math.min(cw,ch)*.19, fr=u*.034, ow=cw+2*mat+2*fr, oh=ch+2*mat+2*fr, x=(W-ow)/2, y=(H-oh)/2-H*.02;
    pmShadePoly(g,[[x,y],[x+ow,y],[x+ow,y+oh],[x,y+oh]],u*.06,'rgba(25,15,5,.32)',u*.018,u*.03); pmShadePoly(g,[[x,y],[x+ow,y],[x+ow,y+oh],[x,y+oh]],u*.012,'rgba(20,10,0,.35)',u*.003,u*.006);
    const fc={oak:'#b98d5e',white:'#f1eee8',black:'#232220'}[o.frame]||'#b98d5e';
    const side=(pts,t)=>{ g.beginPath(); pts.forEach(([px,py],i)=>i?g.lineTo(px,py):g.moveTo(px,py)); g.closePath(); g.fillStyle=t>0?pmMix(fc,'#fff',t):pmMix(fc,'#000',-t); g.fill(); };
    side([[x,y],[x+ow,y],[x+ow-fr,y+fr],[x+fr,y+fr]],.16); side([[x+ow,y],[x+ow,y+oh],[x+ow-fr,y+oh-fr],[x+ow-fr,y+fr]],-.08); side([[x,y+oh],[x+ow,y+oh],[x+ow-fr,y+oh-fr],[x+fr,y+oh-fr]],-.18); side([[x,y],[x+fr,y+fr],[x+fr,y+oh-fr],[x,y+oh]],.06);
    if(o.frame==='oak'){ const r=pmRng(5); [[[x,y],[x+ow,y],[x+ow-fr,y+fr],[x+fr,y+fr],0],[[x,y+oh],[x+ow,y+oh],[x+ow-fr,y+oh-fr],[x+fr,y+oh-fr],0],[[x,y],[x+fr,y+fr],[x+fr,y+oh-fr],[x,y+oh],1],[[x+ow,y],[x+ow,y+oh],[x+ow-fr,y+oh-fr],[x+ow-fr,y+fr],1]].forEach(sd=>{ const vert=sd[4]; g.save(); g.beginPath(); sd.slice(0,4).forEach(([px,py],i)=>i?g.lineTo(px,py):g.moveTo(px,py)); g.closePath(); g.clip();
      for(let i=0;i<70;i++){ g.strokeStyle='rgba(80,50,20,'+(.05+r()*.12)+')'; g.lineWidth=.6+r()*1.6; g.beginPath(); if(vert){ const xx=x+r()*ow; g.moveTo(xx,y); g.bezierCurveTo(xx+(r()-.5)*6,y+oh*.3,xx+(r()-.5)*6,y+oh*.7,xx+(r()-.5)*4,y+oh); } else { const yy=y+r()*oh; g.moveTo(x,yy); g.bezierCurveTo(x+ow*.3,yy+(r()-.5)*6,x+ow*.7,yy+(r()-.5)*6,x+ow,yy+(r()-.5)*4); } g.stroke(); } g.restore(); }); }
    g.strokeStyle='rgba(0,0,0,.18)'; g.lineWidth=1; g.strokeRect(x+.5,y+.5,ow-1,oh-1);
    const ix=x+fr, iy=y+fr, iw=ow-2*fr, ih=oh-2*fr; g.fillStyle='#fbfaf6'; g.fillRect(ix,iy,iw,ih); pmGrain(g,W,H,.06,'overlay',()=>{ g.beginPath(); g.rect(ix,iy,iw,ih); g.clip(); });
    let ig=g.createLinearGradient(0,iy,0,iy+u*.03); ig.addColorStop(0,'rgba(0,0,0,.22)'); ig.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=ig; g.fillRect(ix,iy,iw,u*.03);
    ig=g.createLinearGradient(ix,0,ix+u*.02,0); ig.addColorStop(0,'rgba(0,0,0,.12)'); ig.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=ig; g.fillRect(ix,iy,u*.02,ih);
    const bx=ix+mat, by=iy+mat, bv=Math.max(2,u*.004); g.fillStyle='#ffffff'; g.beginPath(); g.moveTo(bx-bv,by-bv); g.lineTo(bx+cw+bv,by-bv); g.lineTo(bx+cw,by); g.lineTo(bx,by+ch); g.lineTo(bx-bv,by+ch+bv); g.closePath(); g.fill();
    g.fillStyle='#e6e1d8'; g.beginPath(); g.moveTo(bx+cw+bv,by-bv); g.lineTo(bx+cw+bv,by+ch+bv); g.lineTo(bx-bv,by+ch+bv); g.lineTo(bx,by+ch); g.lineTo(bx+cw,by+ch); g.lineTo(bx+cw,by); g.closePath(); g.fill();
    pmCard(g,F,bx+cw/2,by+ch/2,cw,ch,0,{lift:.12});
    const gl=g.createLinearGradient(x,y,x+ow,y+oh); gl.addColorStop(0,'rgba(255,255,255,.10)'); gl.addColorStop(.38,'rgba(255,255,255,.04)'); gl.addColorStop(.40,'rgba(255,255,255,0)'); gl.addColorStop(.62,'rgba(255,255,255,0)'); gl.addColorStop(.64,'rgba(255,255,255,.05)'); gl.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=gl; g.fillRect(ix,iy,iw,ih);
    pmLight(g,W,H,.8); pmGrain(g,W,H,.04); return cv; }
  if(scene==='tilt'){ const p=pmPal(), base=pmLum(p.bg)>.35?p.bg:p.soft, c1=pmMix(pmMix(base,p.acc,.10),'#ffffff',.55), c2=pmMix(pmMix(base,p.acc,.18),'#d8d2c8',.35);
    const lg=g.createLinearGradient(0,0,0,H); lg.addColorStop(0,c1); lg.addColorStop(1,c2); g.fillStyle=lg; g.fillRect(0,0,W,H);
    const rg=g.createRadialGradient(W*.5,H*.42,0,W*.5,H*.42,u*.7); rg.addColorStop(0,'rgba(255,255,255,.55)'); rg.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=rg; g.fillRect(0,0,W,H); pmGrain(g,W,H,.10);
    if(o.leaves) pmGobo(g,W,H,seed+4,.10);
    const [cw,ch]=pmFit(W*.56,H*.60,a);
    if(Bk) pmCard3D(g,Bk,W*.5+cw*.16,H*.47-ch*.05,cw*.94,ch*.94,.10,.30,.09,W);
    pmCard3D(g,F,W*.5-(Bk?cw*.06:0),H*.48,cw,ch,.16,-.38,-.07,W); pmLight(g,W,H,.55); pmGrain(g,W,H,.04); return cv; }
  pmSurface(g,W,H,o.surf,seed);
  if(o.leaves&&scene==='flat') pmGobo(g,W,H,seed+1,.16);
  if(scene==='flat'){ const [cw,ch]=pmFit(W*.49,H*.55,a), cx=W*.40, cy=H*.54, V=a<1;
    const ew=(V?ch:cw)*1.06, eh=(V?cw:ch)*1.06; pmEnvelope(g,cx+(V?u*.30:cw*.56),cy-u*.13,ew,eh,V?Math.PI/2+.12:.10,o.env,seed);
    if(Bk) pmCard(g,Bk,cx-u*.10,cy+u*.09,cw*.98,ch*.98,.13,{lift:.5});
    pmCard(g,F,cx,cy,cw,ch,-.045,{lift:.7});
    pmSprig(g,W*.9,H*.97,u*.62,-Math.PI*.80,seed+3,W,H); }
  else if(scene==='stack'){ const [cw,ch]=pmFit(W*.48,H*.54,a), cx=W*.5, cy=H*.52;
    pmCard(g,Bk||F,cx-u*.07,cy-u*.05,cw,ch,-.16,{lift:.45}); pmCard(g,F,cx+u*.06,cy-u*.01,cw,ch,.09,{lift:.55}); pmCard(g,F,cx-u*.005,cy+u*.035,cw,ch,-.025,{lift:.75});
    if(o.leaves) pmGobo(g,W,H,seed+6,.09); }
  else if(scene==='duo'){ const B2=cards.back||F, row=W/H>=1.05; const [cw,ch]=row?pmFit(W*.42,H*.66,a):pmFit(W*.66,H*.42,a);
    if(row){ pmCard(g,F,W*.5-cw*.56,H*.52,cw,ch,-.025,{lift:.6}); pmCard(g,B2,W*.5+cw*.56,H*.5,cw,ch,.02,{lift:.6}); }
    else { pmCard(g,F,W*.5,H*.5-ch*.56,cw,ch,-.02,{lift:.6}); pmCard(g,B2,W*.5,H*.5+ch*.56,cw,ch,.02,{lift:.6}); }
    if(o.leaves) pmGobo(g,W,H,seed+7,.09); }
  pmLight(g,W,H); pmGrain(g,W,H,.04); return cv; }

/* ---------- card raster (cached by the side's HTML) ---------- */
function pmSideHTML(side){ try{ return dzHTML(st.dz,side,{}); }catch(e){ return ''; } }
async function pmRaster(side){ const d=st.dz, html=pmSideHTML(side), key=d.w+'x'+d.h+':'+pmHash(html), c=PM.card[side];
  if(c&&c.key===key) return c.cv; const cv=await pageCanvas(KS.page(d.w,d.h,html,'mokap'),200); PM.card[side]={key,cv}; return cv; }
function pmCardsKey(){ if(!pmOn()) return ''; const d=st.dz; return d.w+'x'+d.h+':'+pmHash(pmSideHTML('front'))+(pmHasBack()?':'+pmHash(pmSideHTML('back')):''); }
async function pmCards(){ const out={front:await pmRaster('front')}; if(pmHasBack()) out.back=await pmRaster('back'); return out; }

/* ---------- Instagram ---------- */
const pmMarkC={};
async function pmMarkCSS(){ if('css' in pmMarkC) return pmMarkC.css; let css='';
  try{ if(typeof canFetchFonts!=='function'||await canFetchFonts()){ const r=await fetch('https://fonts.googleapis.com/css2?family=Great+Vibes&display=block'); if(r.ok){ const t=await r.text();
      const blocks=(t.match(/@font-face\s*{[^}]*}/g)||[]).filter(b=>/Great Vibes/.test(b)&&(!/unicode-range/.test(b)||/U\+0000-00FF/i.test(b)));
      for(let b of blocks){ const m=b.match(/url\((['"]?)(https:[^)'"]+)\1\)/); if(m){ try{ b=b.split(m[2]).join(await toDataURL(m[2])); }catch(_){ continue; } } css+=b; } } } }catch(_){ css=''; }
  pmMarkC.css=/data:/.test(css)?css:''; return pmMarkC.css; }
async function pmMark(color){ const k='m'+color; if(pmMarkC[k]) return pmMarkC[k]; let img=null;
  try{ const css=await pmMarkCSS(); if(css){ let s=KS.thSVG({v:'sig',color:'ink'},dzPal({ink:color}));
      s=s.replace(/<svg[^>]*>/,`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120" width="1000" height="600"><style>${css}</style>`);
      const im=new Image(); im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s); await im.decode(); img=im; } }catch(_){ img=null; }
  if(!img){ /* fonts cannot be embedded here — draw the same signature with the page's own fonts */
    const c=pmCanvas(1000,600), g=c.getContext('2d'); try{ await document.fonts.load('200px "Great Vibes"'); }catch(_){}
    g.fillStyle=color; g.strokeStyle=color; g.textAlign='center'; let fs=200; g.font=fs+'px "Great Vibes", cursive'; const w=g.measureText('tadhayrapetian').width; if(w>900){ fs*=900/w; g.font=fs.toFixed(1)+'px "Great Vibes", cursive'; }
    g.fillText('tadhayrapetian',500,330); g.lineWidth=4.5; g.lineCap='round'; g.beginPath(); g.moveTo(220,400); g.bezierCurveTo(400,360,640,360,800,390); g.stroke(); img=c; }
  return pmMarkC[k]=img; }
function pmSpaced(g,t,x,y,ls){ const ch=[...t], ws=ch.map(c=>g.measureText(c).width), tot=ws.reduce((a,b)=>a+b,0)+ls*(ch.length-1); let cx=x-tot/2; g.textAlign='left'; ch.forEach((c,i)=>{ g.fillText(c,cx,y); cx+=ws[i]+ls; }); return tot; }
async function pmIG(kind,cards,o){ const W=1080, H=kind==='story'?1920:1350, cv=pmCanvas(W,H), g=cv.getContext('2d'), F=cards.front, Bk=o.back&&cards.back?cards.back:null, a=F.width/F.height, p=pmPal();
  g.imageSmoothingEnabled=true; g.imageSmoothingQuality='high'; let dark=false;
  if(o.bg==='blur'){ const t1=pmCanvas(48,48*H/W), x1=t1.getContext('2d'); x1.drawImage(F,F.width*.1,F.height*.1,F.width*.8,F.height*.8,0,0,t1.width,t1.height); const t2=pmCanvas(7,Math.round(7*H/W)); t2.getContext('2d').drawImage(t1,0,0,t2.width,t2.height);
    const t3=pmCanvas(108,108*H/W), x3=t3.getContext('2d'); x3.imageSmoothingQuality='high'; x3.drawImage(t2,0,0,t3.width,t3.height); g.drawImage(t3,0,0,W,H); g.fillStyle='rgba(255,252,247,.42)'; g.fillRect(0,0,W,H); }
  else if(o.bg==='white'){ g.fillStyle='#f8f6f2'; g.fillRect(0,0,W,H); const rg=g.createRadialGradient(W/2,H*.42,0,W/2,H*.42,H*.7); rg.addColorStop(0,'rgba(255,255,255,.9)'); rg.addColorStop(1,'rgba(232,226,216,.6)'); g.fillStyle=rg; g.fillRect(0,0,W,H); }
  else if(o.bg==='dark'){ dark=true; const lg=g.createLinearGradient(0,0,0,H); lg.addColorStop(0,'#2a2724'); lg.addColorStop(1,'#171513'); g.fillStyle=lg; g.fillRect(0,0,W,H); const rg=g.createRadialGradient(W/2,H*.44,0,W/2,H*.44,H*.6); rg.addColorStop(0,pmRgba(pmMix(p.acc,'#ffffff',.4),.20)); rg.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=rg; g.fillRect(0,0,W,H); }
  else { const base=pmMix(pmMix(pmLum(p.bg)>.35?p.bg:p.soft,p.acc,.16),'#ffffff',.45), lg=g.createLinearGradient(0,0,W*.4,H); lg.addColorStop(0,pmMix(base,'#ffffff',.25)); lg.addColorStop(1,pmMix(base,p.acc,.10)); g.fillStyle=lg; g.fillRect(0,0,W,H);
    const rg=g.createRadialGradient(W/2,H*.42,0,W/2,H*.42,H*.62); rg.addColorStop(0,'rgba(255,255,255,.5)'); rg.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=rg; g.fillRect(0,0,W,H); }
  pmGrain(g,W,H,dark?.08:.10);
  const story=kind==='story', box=story?[W*.80,H*.56]:[W*.80,H*.56], [cw,ch]=pmFit(box[0],box[1],a), cy=story?H*.49:H*.41;
  if(Bk) pmCard(g,Bk,W/2+cw*.07,cy-ch*.05,cw*.97,ch*.97,.07,{lift:.6});
  pmCard(g,F,W/2,cy,cw,ch,Bk?-.02:0,{lift:.85});
  const ink=dark?'#f3ede4':pmLum(p.ink)<.45?p.ink:'#2b2723', top=cy-ch/2, bot=cy+ch/2;
  if(o.mark){ const m=await pmMark(ink), mw=story?620:520, mh=mw*.6; if(story) g.drawImage(m,W/2-mw/2,top/2-mh*.5,mw,mh); else g.drawImage(m,W/2-mw/2,bot+(H-bot)*.40-mh*.5,mw,mh); }
  const cap=String(o.cap==null?PM_CAP:o.cap).trim().slice(0,90);
  if(cap){ try{ await document.fonts.load('500 30px "Montserrat"'); }catch(_){}
    let fs=story?32:28; g.fillStyle=ink; g.textBaseline='alphabetic'; g.font=`500 ${fs}px "Montserrat", "Manrope", Arial, sans-serif`;
    const yy=story?bot+(H-bot)*.40:(o.mark?H-(H-bot)*.17:bot+(H-bot)*.5+fs*.35); let tw=0; const fit=()=>{ const ws=[...cap].reduce((s,c)=>s+g.measureText(c).width,0)+fs*.12*(cap.length-1); return ws; };
    while(fit()>W*.84&&fs>16){ fs-=1; g.font=`500 ${fs}px "Montserrat", "Manrope", Arial, sans-serif`; } tw=fit();
    g.globalAlpha=.92; pmSpaced(g,cap,W/2,yy,fs*.12); g.globalAlpha=.45; g.fillRect(W/2-tw/2-46,yy-fs*.36,28,1.5); g.fillRect(W/2+tw/2+18,yy-fs*.36,28,1.5); g.globalAlpha=1; }
  pmGrain(g,W,H,.03); return cv; }

/* ---------- saving ---------- */
const pmBlob=(cv,type,q)=>new Promise((res,rej)=>{ try{ cv.toBlob(b=>b?res(b):rej(new Error('blob')),type,q); }catch(e){ rej(e); } });
async function pmSave(cv,name,fmt){ try{ const b=await pmBlob(cv,fmt==='jpg'?'image/jpeg':'image/png',.93); const fn=name+'.'+fmt; if(await KS.download(fn,b)!==false) toast('Сохранено: '+fn); }catch(e){ toast(e&&e.name==='SecurityError'?'Этот браузер не даёт сохранить картинку. Попробуйте Chrome.':'Не удалось сохранить картинку'); } }
async function pmToLib(cv,name){ try{ const data=cv.toDataURL('image/jpeg',.92);
    if(KS.photos&&KS.photos.add) await KS.photos.add({data,name,album:'Разное'});
    else { const t=pmCanvas(360*Math.min(1,cv.width/cv.height),360*Math.min(1,cv.height/cv.width)); t.getContext('2d').drawImage(cv,0,0,t.width,t.height); const id=KS.uid('ph');
      await KS.idb.set('ph:'+id,{id,name,type:'image/jpeg',data,thumb:t.toDataURL('image/jpeg',.85),w:cv.width,h:cv.height,album:'Разное',added:Date.now()},'files'); KS.emit('photosChanged'); }
    toast('В «Мои фото» → «Разное»: '+name); }catch(e){ console.warn('[pcmock] lib',e); toast('Не удалось сохранить в «Мои фото»'); } }
const pmScName=k=>(PM_SCENES.find(x=>x[0]===k)||PM_SCENES[0])[1];

/* ---------- Мокап tab ---------- */
const pmChips=(key,list,cur)=>`<div class="pm-chips">${list.map(([k,n])=>`<button class="pm-chip${cur===k?' on':''}" data-pmset="${key}:${k}">${n}</button>`).join('')}</div>`;
function pmEmpty(scr,what){ scr.innerHTML=`<div class="pm-head"><div><h2>${what}</h2><p class="hint">Здесь будет ваша открытка в красивой сцене.</p></div></div>
  <div class="ks-empty pm-empty"><div class="pm-ghost"></div><b>Сначала откройте открытку</b><span>Выберите шаблон в «Открытках» или откройте свой макет — мокап соберётся сам.</span><button class="btn primary" data-pmgo="1">Выбрать открытку</button></div>`; }
function pmPanel(box){ const s=pmS(), sc=s.scene, back=pmHasBack(), on=pmOn();
  const opt=[]; if(['flat','stack','duo'].includes(sc)) opt.push(`<div class="hd2">Поверхность</div>${pmChips('surf',PM_SURF,s.surf)}`);
  if(sc==='flat') opt.push(`<div class="hd2">Конверт</div>${pmChips('env',PM_ENV,s.env)}`);
  if(sc==='frame') opt.push(`<div class="hd2">Рамка</div>${pmChips('frame',PM_FRAME,s.frame)}<div class="hd2">Стена</div>${pmChips('wall',PM_WALL,s.wall)}`);
  box.innerHTML=`<div class="card"><div class="hd">Сцена</div><div class="pm-scl">${PM_SCENES.map(([k,n])=>`<button class="pm-chip${sc===k?' on':''}" data-pmset="scene:${k}">${n}</button>`).join('')}</div>
      ${opt.join('')}
      <div class="hd2">Формат</div>${pmChips('fmt',PM_FMT,s.fmt)}
      <label class="chk"><input type="checkbox" data-pmchk="back"${s.back?' checked':''}${back?'':' disabled'}> Показать оборот${back?'':' <small class="hint">(у макета одна сторона)</small>'}</label>
      <label class="chk"><input type="checkbox" data-pmchk="leaves"${s.leaves?' checked':''}> Тени листьев от окна</label></div>
    <div class="card"><div class="hd">Сохранить</div><p class="hint" id="pmInfo">${on?'Картинка 2400 px — для сайта, Instagram и каталога.':'Откройте открытку, чтобы сделать мокап.'}</p>
      <div class="pm-acts"><button class="btn primary" data-pmdl="png"${on?'':' disabled'}>Скачать PNG</button><button class="btn" data-pmdl="jpg"${on?'':' disabled'}>Скачать JPG</button><button class="btn" data-pmlib="1"${on?'':' disabled'}>В мои фото</button></div></div>`; }
function pmScreen(scr){ if(!pmOn()){ pmEmpty(scr,'Мокап открытки'); return; } const s=pmS(), d=st.dz;
  scr.innerHTML=`<div class="pm-head"><div><h2>Мокап открытки</h2><p class="hint">${esc(pmIsPC()?(d.kind==='pcV'?'Вертикальная 10 × 15':'Горизонтальная 15 × 10'):'Макет '+Math.round(d.w)+' × '+Math.round(d.h)+' мм')} · сцена «${esc(pmScName(s.scene))}» · всё нарисовано программой, без чужих фото</p></div></div>
    <div class="pm-stage" id="pmStage"><div class="pm-busy"><i></i>Рисую сцену…</div></div>
    <div class="pm-strip">${PM_SCENES.map(([k,n])=>`<button class="pm-tile${s.scene===k?' on':''}" data-pmset="scene:${k}"><span class="pm-th" data-pmth="${k}"></span><b>${n}</b></button>`).join('')}</div>`;
  PM.cv=null; pmRun(); }
async function pmRun(){ const tok=++PM.tok, s=pmS(), scr=KS.screen('pcmock'); if(!scr||scr.hidden||!pmOn()) return; const stage=scr.querySelector('#pmStage'); if(!stage) return;
  stage.classList.add('busy'); PM.busy++;
  try{ const cards=await pmCards(); if(tok!==PM.tok) return; await pmTick();
    const a=cards.front.width/cards.front.height, o={surf:s.surf,env:s.env,frame:s.frame,wall:s.wall,back:s.back&&!!cards.back,leaves:s.leaves};
    const [W,H]=pmSize(s.fmt,a,true); const cv=pmCompose(s.scene,cards,o,W,H); if(tok!==PM.tok) return;
    cv.className='pm-view'; cv.dataset.w=cv.width; cv.dataset.h=cv.height; stage.querySelectorAll('canvas').forEach(c=>c.remove()); stage.appendChild(cv); PM.cv=cv; PM.cvScene=s.scene;
    const info=document.getElementById('pmInfo'); if(info) info.textContent=`Картинка ${cv.width} × ${cv.height} px — для сайта, Instagram и каталога.`;
    for(const [k] of PM_SCENES){ await pmTick(); if(tok!==PM.tok) return; const el=scr.querySelector(`[data-pmth="${k}"]`); if(!el) continue;
      const tk=k+'|'+pmCardsKey()+'|'+JSON.stringify(o)+'|'+s.fmt; if(el.dataset.k===tk) continue; const [tw,th]=pmSize(s.fmt,a,false); const t=pmCompose(k,cards,o,tw,th); el.innerHTML=''; el.appendChild(t); el.dataset.k=tk; }
  }catch(e){ console.warn('[pcmock]',e); if(tok===PM.tok){ stage.insertAdjacentHTML('beforeend','<p class="hint pm-err">Не получилось нарисовать открытку в этом браузере. Попробуйте Chrome.</p>'); } }
  finally{ PM.busy--; if(tok===PM.tok) stage.classList.remove('busy'); } }

/* ---------- Instagram tab ---------- */
function pmIgPanel(box){ const s=pmS(), o=s.ig, on=pmOn(), back=pmHasBack();
  box.innerHTML=`<div class="card"><div class="hd">Фон</div>${pmChips('ig.bg',PM_IGBG,o.bg)}
      <label class="f">Подпись<input type="text" id="pmCap" maxlength="90" value="${esc(o.cap==null?PM_CAP:o.cap)}" placeholder="${esc(PM_CAP)}"></label>
      <div class="flexw"><button class="btn sm" data-pmcapreset="1">Подпись по умолчанию</button></div>
      <label class="chk"><input type="checkbox" data-pmchk="ig.mark"${o.mark?' checked':''}> Знак tadhayrapetian</label>
      <label class="chk"><input type="checkbox" data-pmchk="ig.back"${o.back?' checked':''}${back?'':' disabled'}> Оборот за открыткой</label></div>
    <div class="card"><div class="hd">Скачать PNG</div><div class="pm-acts"><button class="btn primary" data-pmig="post"${on?'':' disabled'}>Пост 1080 × 1350</button><button class="btn primary" data-pmig="story"${on?'':' disabled'}>Сторис 1080 × 1920</button></div>
      <div class="pm-acts"><button class="btn" data-pmiglib="1"${on?'':' disabled'}>Оба в мои фото</button></div></div>`; }
function pmIgScreen(scr){ if(!pmOn()){ pmEmpty(scr,'Instagram'); return; }
  scr.innerHTML=`<div class="pm-head"><div><h2>Instagram</h2><p class="hint">Пост и сторис из текущей открытки · PNG в полном размере</p></div></div>
    <div class="pm-igs">${[['post','Пост','1080 × 1350'],['story','Сторис','1080 × 1920']].map(([k,n,sz])=>`<figure class="pm-ig ${k}"><div class="pm-igbox" data-pmigbox="${k}"><div class="pm-busy"><i></i>Собираю…</div></div><figcaption><b>${n}</b><span>${sz}</span><button class="btn sm" data-pmig="${k}">Скачать PNG</button></figcaption></figure>`).join('')}</div>`;
  pmIgRun(); }
async function pmIgRun(){ const tok=++PM.igTok, scr=KS.screen('pcig'); if(!scr||scr.hidden||!pmOn()) return; const s=pmS();
  scr.querySelectorAll('[data-pmigbox]').forEach(b=>b.classList.add('busy'));
  try{ const cards=await pmCards(); if(tok!==PM.igTok) return; const o=Object.assign({},s.ig,{back:s.ig.back&&!!cards.back});
    for(const k of ['post','story']){ const cv=await pmIG(k,cards,o); if(tok!==PM.igTok) return; PM.ig[k]=cv; const b=scr.querySelector(`[data-pmigbox="${k}"]`); if(!b) continue; cv.className='pm-igcv'; b.querySelectorAll('canvas').forEach(c=>c.remove()); b.appendChild(cv); b.classList.remove('busy'); } }
  catch(e){ console.warn('[pcmock] ig',e); scr.querySelectorAll('[data-pmigbox]').forEach(b=>{ b.classList.remove('busy'); }); } }

/* ---------- tabs ---------- */
let pmLastKey='', pmUpdT=0;
function pmWatch(fn){ clearTimeout(pmUpdT); pmUpdT=setTimeout(()=>{ const k=pmCardsKey(); if(k!==pmLastKey){ pmLastKey=k; fn(); } },450); }
KS.tab({id:'pcmock',group:'postcard',seg:'Мокап',title:'Мокап',screen:true,render(box,o){
  if(o.reason==='show'||!box.firstChild){ pmPanel(box); if(o.screen){ pmLastKey=pmCardsKey(); pmScreen(o.screen); } return; }
  pmWatch(()=>{ pmPanel(box); if(o.screen) pmScreen(o.screen); }); }});
KS.tab({id:'pcig',group:'postcard',seg:'Instagram',title:'Instagram',screen:true,render(box,o){
  if(o.reason==='show'||!box.firstChild){ KS.keepFocus(box,()=>pmIgPanel(box)); if(o.screen){ pmLastKey=pmCardsKey(); pmIgScreen(o.screen); } return; }
  pmWatch(()=>{ KS.keepFocus(box,()=>pmIgPanel(box)); if(o.screen) pmIgScreen(o.screen); }); }});
KS.cmd('Мокап открытки','открытки',()=>KS.show('postcard','pcmock'));
KS.cmd('Открытка для Instagram','открытки',()=>KS.show('postcard','pcig'));
const pmPanelBox=()=>document.querySelector('[data-panel="ks-postcard"] .kssub');

document.addEventListener('click',e=>{ let b; const t=e.target;
  if(!t.closest||!(t.closest('[data-panel="ks-postcard"]')||t.closest('.ksscreen'))) return;
  if((b=t.closest('[data-pmgo]'))){ KS.show('postcard','pc'); return; }
  if((b=t.closest('[data-pmset]'))){ const [k,v]=b.dataset.pmset.split(':'), s=pmS(); if(k.startsWith('ig.')){ s.ig[k.slice(3)]=v; save(); const bx=pmPanelBox(); if(bx) pmIgPanel(bx); pmIgRun(); return; }
    if(s[k]===v&&k==='scene'&&PM.cv) return; s[k]=v; save(); const bx=pmPanelBox(); if(bx) pmPanel(bx); const scr=KS.screen('pcmock'); if(scr){ if(k==='scene'){ scr.querySelectorAll('.pm-tile').forEach(x=>x.classList.toggle('on',x.dataset.pmset==='scene:'+v)); const h=scr.querySelector('.pm-head .hint'); if(h) h.innerHTML=h.innerHTML.replace(/сцена «[^»]*»/,'сцена «'+esc(pmScName(v))+'»'); } pmRun(); } return; }
  if((b=t.closest('[data-pmdl]'))){ if(!PM.cv){ toast('Мокап ещё рисуется…'); return; } pmSave(PM.cv,'otkrytka-mokap-'+(PM.cvScene||'scene'),b.dataset.pmdl); return; }
  if((b=t.closest('[data-pmlib]'))){ if(!PM.cv){ toast('Мокап ещё рисуется…'); return; } pmToLib(PM.cv,'Мокап открытки — '+pmScName(PM.cvScene)); return; }
  if((b=t.closest('[data-pmig]'))){ const k=b.dataset.pmig, cv=PM.ig[k]; if(!cv){ toast('Картинка ещё собирается…'); return; } pmSave(cv,'otkrytka-instagram-'+(k==='story'?'storis':'post'),'png'); return; }
  if((b=t.closest('[data-pmiglib]'))){ if(!PM.ig.post||!PM.ig.story){ toast('Картинки ещё собираются…'); return; } (async()=>{ await pmToLib(PM.ig.post,'Instagram пост — открытка'); await pmToLib(PM.ig.story,'Instagram сторис — открытка'); })(); return; }
  if((b=t.closest('[data-pmcapreset]'))){ pmS().ig.cap=PM_CAP; save(); const i=document.getElementById('pmCap'); if(i) i.value=PM_CAP; pmIgRun(); return; } });
document.addEventListener('change',e=>{ const t=e.target; if(!t.dataset||!t.dataset.pmchk) return; const k=t.dataset.pmchk, s=pmS();
  if(k.startsWith('ig.')){ s.ig[k.slice(3)]=t.checked; save(); pmIgRun(); } else { s[k]=t.checked; save(); pmRun(); } });
let pmCapT=0;
document.addEventListener('input',e=>{ if(e.target.id!=='pmCap') return; pmS().ig.cap=e.target.value; clearTimeout(pmCapT); pmCapT=setTimeout(()=>{ save(); pmIgRun(); },220); });
KS.pcmock={compose:pmCompose,ig:pmIG,cards:pmCards,state:PM,run:pmRun,igRun:pmIgRun};
