KS.mod('nbcover',{title:'Обложка блокнота'});
/* ================= core: settings, geometry, helpers ================= */
const NBC_ICON='<path d="M7 3h10.5A1.5 1.5 0 0 1 19 4.5v15a1.5 1.5 0 0 1-1.5 1.5H7z"/><path d="M7 3v18"/><path d="M4 6.5h4.5M4 10.5h4.5M4 14.5h4.5M4 18.5h4.5"/><path d="M11 8h5M11 11h3.5"/>';
const BLEED=3, SAFE=5;
const NBC_FMTS=[['A4','A4 · 210 × 297',210,297],['B5','B5 · 176 × 250',176,250],['A5','A5 · 148 × 210',148,210],['A6','A6 · 105 × 148',105,148],['pocket','Карманный · 90 × 140',90,140],['sq20','Квадрат · 200 × 200',200,200],['sq15','Квадрат · 150 × 150',150,150]];
const NBC_BINDS=[['spiral','Спираль'],['wireo','Wire-O'],['rings','Кольца'],['disc','Диски'],['staple','Скоба'],['perfect','Клеевой (КБС)'],['sewn','Шитый'],['none','Без переплёта']];
const NBC_BN=Object.fromEntries(NBC_BINDS);
const COILB=['spiral','wireo','rings','disc'];
const nbcDef={v:1,tpl:'swiss',pal:0,cbg:'',cacc:'',src:'tpl',art:null,fit:'cover',px:50,py:50,zoom:100,ov:0,area:'front',backArt:'tpl',
  t:{title:'',sub:'',owner:'',year:'',font:'',size:100,color:'',pos:'',plate:'',spine:true,dir:'down',foil:'',emboss:false},
  back:{logo:true,lv:'monoword',code:'none',codeText:'',info:true},
  inside:'none',mat:'matte',sheet:'auto',big:'a3',marks:true,guides:true,view:'flat',
  ai:{styles:['watercolor'],subject:'',mood:'',n:2,wrap:'front',free:'',prompt:'',multi:false},
  series:{n:6,on:false},pers:{names:'',field:'owner'},
  own:{fmt:'A5',binding:'spiral',pages:96,gsm:80},rx:-12,ry:-30,panel:'base',gtab:'tpl',gcat:''};
const nbcS=()=>KS.store('nbcover',nbcDef);
const save_=()=>{ try{ KS.save(); }catch(_){ } };
const E=s=>KS.esc(s==null?'':String(s));
const n2=v=>Math.round(v*100)/100;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function rng(seed){ let a=(seed|0)||1; return ()=>{ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function hashStr(s){ let h=2166136261; for(const c of String(s)){ h^=c.charCodeAt(0); h=Math.imul(h,16777619); } return h>>>0; }
/* colours */
function hex2rgb(h){ h=String(h||'#000').replace('#',''); if(h.length===3) h=h.split('').map(c=>c+c).join(''); const n=parseInt(h.slice(0,6),16)||0; return [n>>16&255,n>>8&255,n&255]; }
const rgb2hex=(r,g,b)=>'#'+[r,g,b].map(v=>clamp(Math.round(v),0,255).toString(16).padStart(2,'0')).join('');
function mix(a,b,t){ const A=hex2rgb(a),B=hex2rgb(b); return rgb2hex(A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t,A[2]+(B[2]-A[2])*t); }
function lum(h){ const [r,g,b]=hex2rgb(h).map(v=>{ v/=255; return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4); }); return .2126*r+.7152*g+.0722*b; }
function hue(h,deg){ let [r,g,b]=hex2rgb(h).map(v=>v/255); const mx=Math.max(r,g,b),mn=Math.min(r,g,b); let H=0,S=0,L=(mx+mn)/2; if(mx!==mn){ const d=mx-mn; S=L>.5?d/(2-mx-mn):d/(mx+mn); H=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4; H/=6; }
  H=(H+deg/360+1)%1; const f=(p,q,t)=>{ if(t<0)t+=1; if(t>1)t-=1; return t<1/6?p+(q-p)*6*t:t<1/2?q:t<2/3?p+(q-p)*(2/3-t)*6:p; }; if(!S) return rgb2hex(L*255,L*255,L*255); const q=L<.5?L*(1+S):L+S-L*S,p=2*L-q; return rgb2hex(f(p,q,H+1/3)*255,f(p,q,H)*255,f(p,q,H-1/3)*255); }
const isDark=h=>lum(h)<.28;

/* ---- notebook settings: from KS.nb (agent A), its store, or our own fallback picker ---- */
function nbInfo(){ let s=null; try{ if(KS.nb&&typeof KS.nb.get==='function') s=KS.nb.get(); }catch(_){ s=null; }
  if(!s||!(+s.w>0)){ const k=st.ks&&st.ks.notebook; if(k&&+k.w>0&&+k.h>0) s=k; else s=null; }
  const o=nbcS().own||nbcDef.own, ext=!!s;
  if(!s){ const f=NBC_FMTS.find(x=>x[0]===o.fmt)||NBC_FMTS[2]; s={fmt:f[0],w:f[2],h:f[3],pages:o.pages,paperGsm:o.gsm,binding:o.binding}; }
  return {ext,fmt:s.fmt||'',w:+s.w||148,h:+s.h||210,pages:+s.pages||96,gsm:+s.paperGsm||80,binding:NBC_BN[s.binding]?s.binding:'spiral',title:s.title||'',owner:s.owner||'',year:s.year||'',ruling:s.ruling||s.grid||s.kind||''}; }
function spineOf(i){ try{ if(KS.nb&&typeof KS.nb.spineMM==='function'){ const v=+KS.nb.spineMM(); if(isFinite(v)&&v>=0) return Math.round(v*10)/10; } }catch(_){ }
  return Math.round((Math.ceil(i.pages/2)*i.gsm*.00125+(i.binding==='perfect'||i.binding==='sewn'?.6:0))*10)/10; }
function fmtName(i){ const f=NBC_FMTS.find(x=>x[0]===i.fmt||(x[2]===Math.round(i.w)&&x[3]===Math.round(i.h))); return f?f[1].split(' · ')[0]:Math.round(i.w)+' × '+Math.round(i.h); }
function geo(){ const i=nbInfo(), b=i.binding; let cs=null; try{ if(KS.nb&&typeof KS.nb.coverSize==='function') cs=KS.nb.coverSize(); }catch(_){ cs=null; }
  if(!cs||!(+cs.w>0&&+cs.h>0)){ const wrap=b==='perfect'||b==='sewn', sp=wrap?spineOf(i):0; cs=wrap?{w:2*i.w+sp,h:i.h,spine:sp,wrap:true}:{w:i.w,h:i.h,spine:0,wrap:false}; }
  let wrap=!!cs.wrap, spine=wrap?Math.max(0,+cs.spine||0):0, pw=wrap?(+cs.w-spine)/2:+cs.w, ph=+cs.h; if(!(pw>0)) pw=i.w;
  const fold=b==='staple'; if(fold&&!wrap){ wrap=true; spine=0; }
  const B=BLEED, TH=ph+2*B, TW=wrap?2*pw+spine+2*B:2*pw+4*B;
  const back={x:B,y:B,w:pw,h:ph}, front={x:wrap?B+pw+spine:3*B+pw,y:B,w:pw,h:ph};
  return {i,b,pw,ph,spine,wrap,fold,B,TW,TH,back,front,sp:wrap?{x:B+pw,y:B,w:spine,h:ph}:null,coil:COILB.includes(b),spineText:wrap&&spine>=5,thick:Math.max(spine,Math.ceil(i.pages/2)*i.gsm*.00125)}; }
/* panel rectangles incl. bleed (in spread coords) */
function panelBox(g,part){ const B=g.B;
  if(part==='wrap') return {x:0,y:0,w:g.TW,h:g.TH};
  const r=part==='back'?g.back:g.front; if(!g.wrap) return {x:r.x-B,y:0,w:r.w+2*B,h:g.TH};
  return part==='back'?{x:0,y:0,w:r.w+B,h:g.TH}:{x:r.x,y:0,w:r.w+B,h:g.TH}; }
/* trimmed panel (no bleed) */
function trimBox(g,part){ if(part==='wrap') return {x:g.B,y:g.B,w:g.TW-2*g.B,h:g.ph}; return part==='back'?g.back:g.front; }
const bindLine=g=>`${fmtName(g.i)} · ${NBC_BN[g.b]||g.b} · ${g.i.pages} стр.`;
const sizeLine=g=>g.wrap?(g.fold?`развёртка ${r1n(g.TW-2*g.B)} × ${r1n(g.ph)} мм, сгиб посередине`:`развёртка ${r1n(g.TW-2*g.B)} × ${r1n(g.ph)} мм, корешок ${r1n(g.spine)} мм`):`лицо и оборот по ${r1n(g.pw)} × ${r1n(g.ph)} мм`;
const r1n=v=>String(Math.round(v*10)/10).replace('.',',');

/* ---- seeded canvas textures (baked bitmaps: reliable in print and export) ---- */
const TEX=new Map();
function noiseField(w,h,r,cells,oct){ const c=document.createElement('canvas'); c.width=w; c.height=h; const g=c.getContext('2d'); g.fillStyle='#808080'; g.fillRect(0,0,w,h); let amp=.62, sc=cells;
  for(let o=0;o<oct;o++){ const sw=Math.max(2,Math.round(w/sc)), sh=Math.max(2,Math.round(h/sc)), s=document.createElement('canvas'); s.width=sw; s.height=sh; const sg=s.getContext('2d'), id=sg.createImageData(sw,sh);
    for(let k=0;k<id.data.length;k+=4){ const v=r()*255; id.data[k]=id.data[k+1]=id.data[k+2]=v; id.data[k+3]=255; } sg.putImageData(id,0,0); g.globalAlpha=amp; g.imageSmoothingEnabled=true; g.imageSmoothingQuality='high'; g.drawImage(s,0,0,w,h); amp*=.55; sc/=2.2; }
  const d=g.getImageData(0,0,w,h).data, f=new Float32Array(w*h); for(let k=0;k<f.length;k++) f[k]=d[k*4]/255; return f; }
function tex(kind,cols,wmm,hmm,seed,ppm){ ppm=ppm||4; const key=[kind,cols.join(','),Math.round(wmm),Math.round(hmm),seed,ppm].join('|'); if(TEX.has(key)) return TEX.get(key);
  const w=Math.max(8,Math.round(wmm*ppm)), h=Math.max(8,Math.round(hmm*ppm)), r=rng(seed), c=document.createElement('canvas'); c.width=w; c.height=h; const g=c.getContext('2d');
  const [b0,b1,b2]=cols.map(hex2rgb); let url='';
  try{
    if(kind==='marble'){ const n1=noiseField(w,h,r,26*ppm,5), n2=noiseField(w,h,r,9*ppm,3), id=g.createImageData(w,h), D=id.data;
      for(let y=0;y<h;y++) for(let x=0;x<w;x++){ const k=y*w+x, xm=x/ppm, ym=y/ppm; const t=(xm*.028+ym*.017)+n1[k]*5.5, v=Math.abs(Math.sin(t*Math.PI)), vein=Math.pow(1-v,9)*.9+Math.pow(1-Math.abs(Math.sin((xm*.06-ym*.04+n2[k]*4)*Math.PI)),22)*.55, sh=(n2[k]-.5)*.12;
        const m=Math.min(1,vein); for(let q=0;q<3;q++){ D[k*4+q]=b0[q]*(1+sh)+(b1[q]-b0[q])*m+(b2[q]-b0[q])*Math.max(0,m-.6)*.8; } D[k*4+3]=255; }
      g.putImageData(id,0,0); }
    else if(kind==='kraft'||kind==='leather'||kind==='paper'){ const big=noiseField(w,h,r,(kind==='leather'?6:14)*ppm,4), fine=noiseField(w,h,r,Math.max(2,ppm*.6),1), id=g.createImageData(w,h), D=id.data, a=kind==='kraft'?.16:kind==='leather'?.22:.06, fa=kind==='paper'?.05:kind==='leather'?.14:.1;
      for(let k=0;k<w*h;k++){ const v=1+(big[k]-.5)*a+(fine[k]-.5)*fa; for(let q=0;q<3;q++) D[k*4+q]=b0[q]*v; D[k*4+3]=255; } g.putImageData(id,0,0);
      if(kind==='kraft'){ g.lineCap='round'; for(let k=0;k<w*h/(90*ppm);k++){ const x=r()*w,y=r()*h,l=(1+r()*3)*ppm,an=r()*Math.PI; g.strokeStyle=r()<.5?'rgba(70,40,10,.13)':'rgba(255,240,210,.16)'; g.lineWidth=.12*ppm+r()*.1*ppm; g.beginPath(); g.moveTo(x,y); g.lineTo(x+Math.cos(an)*l,y+Math.sin(an)*l); g.stroke(); } }
      if(kind==='leather'){ for(let k=0;k<w*h/(40*ppm);k++){ const x=r()*w,y=r()*h; g.fillStyle=r()<.5?'rgba(0,0,0,.09)':'rgba(255,255,255,.05)'; g.beginPath(); g.arc(x,y,(.15+r()*.3)*ppm,0,7); g.fill(); } } }
    else if(kind==='wash'){ g.fillStyle=cols[0]; g.fillRect(0,0,w,h); const n=noiseField(w,h,r,30*ppm,4);
      for(let k=0;k<18;k++){ const x=r()*w,y=r()*h,rad=(.12+r()*.3)*Math.max(w,h), col=k%2?b1:b2, gr=g.createRadialGradient(x,y,0,x,y,rad); gr.addColorStop(0,`rgba(${col},${.22+r()*.2})`); gr.addColorStop(.7,`rgba(${col},.08)`); gr.addColorStop(1,`rgba(${col},0)`); g.fillStyle=gr; g.fillRect(0,0,w,h); }
      const id=g.getImageData(0,0,w,h), D=id.data; for(let k=0;k<w*h;k++){ const v=1+(n[k]-.5)*.1; for(let q=0;q<3;q++) D[k*4+q]=D[k*4+q]*v; } g.putImageData(id,0,0); }
    url=c.toDataURL('image/jpeg',.9);
  }catch(e){ url=''; }
  TEX.set(key,url); if(TEX.size>60) TEX.delete(TEX.keys().next().value); return url; }

/* ---- QR / barcode as SVG markup (mm) ---- */
function qrSVG(text,x,y,size,col){ try{ if(typeof qrcode!=='function') return ''; if(qrcode.stringToBytesFuncs) qrcode.stringToBytes=qrcode.stringToBytesFuncs['UTF-8']; const q=qrcode(0,'M'); q.addData(String(text)); q.make(); const n=q.getModuleCount(), m=size/(n+2); let d='';
  for(let r=0;r<n;r++) for(let c=0;c<n;c++) if(q.isDark(r,c)) d+=`M${n2(x+(c+1)*m)} ${n2(y+(r+1)*m)}h${n2(m)}v${n2(m)}h${-n2(m)}z`;
  return `<rect x="${n2(x)}" y="${n2(y)}" width="${n2(size)}" height="${n2(size)}" rx="1.2" fill="#fff"/><path d="${d}" fill="${col||'#111'}"/>`; }catch(_){ return ''; } }
function barSVG(text,x,y,w,h){ try{ if(typeof JsBarcode!=='function') return ''; const s=document.createElementNS('http://www.w3.org/2000/svg','svg'); const t=String(text).trim(); const fmt=/^\d{12,13}$/.test(t)?'EAN13':'CODE128';
  try{ JsBarcode(s,t,{format:fmt,width:2,height:60,margin:4,displayValue:true,fontSize:15,font:'monospace',background:'#ffffff',lineColor:'#111111'}); }catch(_){ JsBarcode(s,t,{format:'CODE128',width:2,height:60,margin:4,displayValue:true,fontSize:15,font:'monospace',background:'#ffffff',lineColor:'#111111'}); }
  const vw=+s.getAttribute('width')||200, vh=+s.getAttribute('height')||80; return `<svg x="${n2(x)}" y="${n2(y)}" width="${n2(w)}" height="${n2(h)}" viewBox="0 0 ${vw} ${vh}" preserveAspectRatio="xMidYMid meet">${s.innerHTML}</svg>`; }catch(_){ return ''; } }

/* ---- fonts available in the app ---- */
const nbcFonts=()=>{ try{ return Object.keys(FONTS); }catch(_){ return ['PT Sans','PT Serif','Montserrat','Playfair Display']; } };
const ffOf=n=>{ try{ return (FONTS[n]||`'${n}',sans-serif`).replace(/"/g,"'"); }catch(_){ return `'${n}',sans-serif`; } };
/* rough average glyph width as a fraction of the font size */
const FW={'Oswald':.42,'Amatic SC':.36,'Great Vibes':.4,'Marck Script':.45,'Bad Script':.5,'Caveat':.42,'Lobster':.5,'Unbounded':.72,'Russo One':.66,'Montserrat':.63,'Playfair Display':.55,'Cormorant Garamond':.47,'Prata':.6,'Comfortaa':.6,'PT Mono':.6};
const fwOf=f=>FW[f]||.56;
function fitSize(txt,fs,avail,font,ls){ const w=[...String(txt)].length*(fs*fwOf(font)+(ls||0)); return w>avail?fs*avail/w:fs; }
/* ================= vector cover templates ================= */
const R=(x,y,w,h,f,ex)=>`<rect x="${n2(x)}" y="${n2(y)}" width="${n2(Math.max(0,w))}" height="${n2(Math.max(0,h))}" fill="${f}"${ex?' '+ex:''}/>`;
const C=(x,y,r,f,ex)=>`<circle cx="${n2(x)}" cy="${n2(y)}" r="${n2(r)}" fill="${f}"${ex?' '+ex:''}/>`;
const PT=(d,f,ex)=>`<path d="${d}" fill="${f||'none'}"${ex?' '+ex:''}/>`;
const IM=(src,x,y,w,h,ex)=>src?`<image href="${src}" x="${n2(x)}" y="${n2(y)}" width="${n2(w)}" height="${n2(h)}" preserveAspectRatio="none"${ex?' '+ex:''}/>`:'';
const PAT=(id,w,h,inner,tr)=>`<pattern id="${id}" width="${n2(w)}" height="${n2(h)}" patternUnits="userSpaceOnUse"${tr?` patternTransform="${tr}"`:''}>${inner}</pattern>`;
const ALL=c=>`<rect x="0" y="0" width="${n2(c.TW)}" height="${n2(c.TH)}"`;
const fillAll=(c,f)=>R(0,0,c.TW,c.TH,f);
const patAll=(c,id,inner,w,h,tr)=>`<defs>${PAT(c.u+id,w,h,inner,tr)}</defs>${ALL(c)} fill="url(#${c.u+id})"/>`;
/* leaf/stem botanical helpers */
function leaf(x,y,len,ang,wd){ const a=ang*Math.PI/180, ca=Math.cos(a), sa=Math.sin(a), px=-sa, py=ca, tx=x+ca*len, ty=y+sa*len, m=len*.5, w=len*(wd||.28);
  return `M${n2(x)} ${n2(y)} Q${n2(x+ca*m+px*w)} ${n2(y+sa*m+py*w)} ${n2(tx)} ${n2(ty)} Q${n2(x+ca*m-px*w)} ${n2(y+sa*m-py*w)} ${n2(x)} ${n2(y)}Z`; }
function stem(c,x,y,len,ang,col,sw,leafy){ const r=c.r; let d='', lv=''; const pts=[]; let cx=x, cy=y, a=ang; const n=10;
  for(let i=0;i<=n;i++){ pts.push([cx,cy,a]); const st_=len/n; a+= (r()-.5)*7; cx+=Math.cos(a*Math.PI/180)*st_; cy+=Math.sin(a*Math.PI/180)*st_; }
  d='M'+pts.map(p=>n2(p[0])+' '+n2(p[1])).join(' L');
  pts.slice(1,-1).forEach((p,i)=>{ const L=len*(.2-.012*i)*(leafy||1); lv+=PT(leaf(p[0],p[1],L,p[2]-55,.3),'none',`stroke="${col}" stroke-width="${sw}"`)+PT(leaf(p[0],p[1],L,p[2]+55,.3),'none',`stroke="${col}" stroke-width="${sw}"`); });
  const tip=pts[n]; lv+=PT(leaf(tip[0],tip[1],len*.12,tip[2],.3),'none',`stroke="${col}" stroke-width="${sw}"`);
  return PT(d,'none',`stroke="${col}" stroke-width="${sw*1.2}" stroke-linecap="round"`)+lv; }
function sunRays(cx,cy,r1,r2,n,col,sw){ let d=''; for(let i=0;i<n;i++){ const a=i/n*Math.PI*2; d+=`M${n2(cx+Math.cos(a)*r1)} ${n2(cy+Math.sin(a)*r1)}L${n2(cx+Math.cos(a)*r2)} ${n2(cy+Math.sin(a)*r2)}`; } return PT(d,'none',`stroke="${col}" stroke-width="${sw}" stroke-linecap="round"`); }
const MONTHS=['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const TPL_CATS=['Минимализм','Текстуры','Узоры','Природа','Арт','Армения','Школа и планер','Бренд'];
const NBC_TPL=[
 {id:'swiss',n:'Швейцарский',cat:'Минимализм',lay:{pos:'left',font:'Montserrat',plate:''},pals:[['#f3efe6','#1d1d1f','#e4572e','#1d1d1f'],['#1d1d1f','#f3efe6','#f2c14e','#f3efe6'],['#dfe7e2','#16302b','#2f7a5f','#16302b'],['#e9e4f5','#2a2140','#7b5cd6','#2a2140'],['#fbe3d6','#3a1f14','#d1495b','#3a1f14']],
  draw(c){ const {F,K,P}=c; return fillAll(c,P.bg)+R(F.x+F.w*.12,F.y+F.h*.1,F.w*.76,.5,P.ink)+R(F.x+F.w*.88-9,F.y+F.h*.1+4,9,9,P.a)+R(K.x+K.w*.12,K.y+K.h*.1,K.w*.3,.5,P.ink); }},
 {id:'classic',n:'Классика с рамкой',cat:'Минимализм',lay:{pos:'center',font:'Cormorant Garamond',plate:''},pals:[['#f6f1e7','#2b2620','#a8875b','#2b2620'],['#17324d','#f1e6cf','#c9a24a','#f1e6cf'],['#3b1f2b','#f4e3d7','#d8a26f','#f4e3d7'],['#e8efe9','#20352b','#6f8f72','#20352b'],['#ffffff','#111111','#111111','#111111']],
  draw(c){ const {F,K,P}=c, fr=(b,i)=>R(b.x+i,b.y+i,b.w-2*i,b.h-2*i,'none',`stroke="${P.a}" stroke-width="${i>9?.25:.6}"`); return fillAll(c,P.bg)+fr(F,8)+fr(F,10)+fr(K,8)+PT(`M${n2(F.x+F.w/2-4)} ${n2(F.y+F.h*.66)}l4 -2.5 4 2.5 -4 2.5z`,P.a); }},
 {id:'dot',n:'Солнце',cat:'Минимализм',lay:{pos:'bottom',font:'Manrope',plate:''},pals:[['#f4ede1','#2d2a26','#e07a3f','#2d2a26'],['#10223a','#f4ede1','#f2b33d','#f4ede1'],['#e7eef3','#1f2d3a','#3c7fb8','#1f2d3a'],['#f6e1e1','#3d1f24','#c4495b','#3d1f24']],
  draw(c){ const {F,P}=c, r=Math.min(F.w,F.h)*.27; return fillAll(c,P.bg)+C(F.x+F.w*.5,F.y+F.h*.36,r,P.a)+C(F.x+F.w*.5,F.y+F.h*.36,r+4,'none',`stroke="${P.a}" stroke-width=".35" opacity=".6"`); }},
 {id:'bands',n:'Цветной блок',cat:'Минимализм',lay:{pos:'top',font:'Unbounded',plate:''},pals:[['#f2efe9','#1b1b1b','#2f6f5e','#e9b44c'],['#fdf6ec','#20263a','#e76f51','#264653'],['#eef1f6','#1a2238','#4361ee','#f72585'],['#f7f3ea','#2a2a2a','#b5838d','#6d6875']],
  draw(c){ const {P,TW,TH}=c, y=TH*.62; return fillAll(c,P.bg)+R(0,y,TW,TH-y,P.a)+R(0,y-3,TW,1.2,P.b); }},
 {id:'kraft',n:'Крафт',cat:'Текстуры',lay:{pos:'label',font:'Oswald',plate:'line'},pals:[['#c8a27a','#2e2015','#ffffff','#7a4f2a'],['#a98263','#1e140c','#f5ead8','#4a2f1a'],['#d9c3a5','#3a2a1a','#ffffff','#9a3b2f']],
  draw(c){ const {P,TW,TH,F}=c, t=tex('kraft',[P.bg],TW,TH,7,c.ppm); const x=F.x+F.w*.8; return (t?IM(t,0,0,TW,TH):fillAll(c,P.bg))+PT(`M${n2(x)} 0 V${n2(TH)} M${n2(x+1.4)} 0 V${n2(TH)}`,'none',`stroke="${P.b}" stroke-width=".5" opacity=".75"`); }},
 {id:'marble',n:'Мрамор',cat:'Текстуры',lay:{pos:'center',font:'Playfair Display',plate:'white'},pals:[['#f3f1ec','#2b2b2b','#8d8d8d','#c9a24a'],['#1b1b1d','#f0e6d2','#d6d3cc','#c9a24a'],['#1f3d36','#f3eee2','#dfe9e3','#c9a24a'],['#f2dfd8','#3b2a26','#b48b80','#c9a24a']],
  draw(c){ const {P,TW,TH}=c, t=tex('marble',[P.bg,P.a,P.b],TW,TH,11,c.ppm); return t?IM(t,0,0,TW,TH):fillAll(c,P.bg); }},
 {id:'leather',n:'Кожа со строчкой',cat:'Текстуры',bp:10,lay:{pos:'center',font:'Prata',plate:''},emb:true,pals:[['#4a2e20','#e9d3b4','#e0c08a','#2b1a12'],['#1f2a36','#d9dee5','#c7d0da','#111a22'],['#2c2c2c','#e6e1d8','#bdb6a9','#111111'],['#5b1f26','#f0d9c4','#e3b98f','#2c0e12']],
  draw(c){ const {P,TW,TH,F,K}=c, t=tex('leather',[P.bg],TW,TH,5,c.ppm), st_=b=>R(b.x+6,b.y+6,b.w-12,b.h-12,'none',`rx="3" stroke="${P.a}" stroke-width=".45" stroke-dasharray="2 1.4" opacity=".85"`); return (t?IM(t,0,0,TW,TH):fillAll(c,P.bg))+st_(F)+st_(K); }},
 {id:'linen',n:'Лён',cat:'Текстуры',lay:{pos:'label',font:'Lora',plate:'white'},pals:[['#d9cdb8','#2f2a22','#bfb29b','#8c7b61'],['#9fb3c2','#16222c','#8aa0b0','#4f6677'],['#c9b8c8','#2e2230','#b3a0b2','#6e5a6f'],['#a7b59a','#1f2a18','#93a386','#56664a']],
  draw(c){ const {P}=c, inner=R(0,0,.8,.8,P.bg)+R(0,0,.8,.28,P.a,'opacity=".55"')+R(0,0,.28,.8,P.b,'opacity=".25"'); return fillAll(c,P.bg)+patAll(c,'ln',inner,.8,.8); }},
 {id:'terrazzo',n:'Терраццо',cat:'Текстуры',lay:{pos:'center',font:'Manrope',plate:'round'},pals:[['#f1ece4','#2b2b2b','#e08e6d','#5a8f7b'],['#2a2d34','#f1ece4','#e9c46a','#8ab17d'],['#f6e7e1','#3a2b2b','#c97b84','#7aa6c2'],['#e9efe9','#253028','#d98f5c','#47697a']],
  draw(c){ const {P,TW,TH,r}=c; let s=fillAll(c,P.bg); const cols=[P.a,P.b,mix(P.a,P.bg,.5),mix(P.ink,P.bg,.6)], N=Math.round(TW*TH/(c.thumb?60:22));
   for(let i=0;i<N;i++){ const x=r()*TW,y=r()*TH,sz=.6+Math.pow(r(),3)*5.5,k=3+Math.floor(r()*3),a0=r()*6; let d=''; for(let j=0;j<k;j++){ const a=a0+j/k*Math.PI*2+(r()-.5)*.8, rr=sz*(.6+r()*.5); d+=(j?'L':'M')+n2(x+Math.cos(a)*rr)+' '+n2(y+Math.sin(a)*rr); } s+=PT(d+'Z',cols[Math.floor(r()*4)]); } return s; }},
 {id:'wash',n:'Акварельная заливка',cat:'Арт',lay:{pos:'center',font:'Marck Script',plate:''},pals:[['#f7f2ea','#3a3530','#e7a8a1','#a9c5d3'],['#f5f1e8','#253238','#9cc5b4','#e9c9a3'],['#f8f1f4','#3d2c3a','#c7a1d6','#f1b6a6'],['#eef3f6','#20323e','#86b1cf','#cfe0c4']],
  draw(c){ const {P,TW,TH}=c, t=tex('wash',[P.bg,P.a,P.b],TW,TH,3,Math.min(c.ppm,3)); return t?IM(t,0,0,TW,TH):fillAll(c,P.bg); }},
 {id:'tri',n:'Треугольники',cat:'Узоры',lay:{pos:'label',font:'Montserrat',plate:'white'},pals:[['#264653','#ffffff','#2a9d8f','#e9c46a'],['#f4f1de','#222222','#e07a5f','#3d405b'],['#1d3557','#ffffff','#457b9d','#a8dadc'],['#ffe5ec','#3a1d2b','#ffb3c6','#fb6f92']],
  draw(c){ const {P,TW,TH,r}=c, s0=c.thumb?14:12, h=s0*.866, cols=[P.bg,P.a,P.b,mix(P.a,P.b,.5)]; let s=fillAll(c,P.bg);
   for(let row=0;row*h<TH;row++) for(let i=-1;i*s0/2<TW+s0;i++){ const x=i*s0/2, y=row*h, up=(i+row)%2===0; const d=up?`M${n2(x)} ${n2(y+h)}L${n2(x+s0/2)} ${n2(y)}L${n2(x+s0)} ${n2(y+h)}Z`:`M${n2(x)} ${n2(y)}L${n2(x+s0)} ${n2(y)}L${n2(x+s0/2)} ${n2(y+h)}Z`; s+=PT(d,cols[Math.floor(r()*4)]); } return s; }},
 {id:'hex',n:'Соты',cat:'Узоры',lay:{pos:'center',font:'Rubik',plate:'round'},pals:[['#fff6dc','#3b2a05','#e9a514','#3b2a05'],['#14213d','#ffffff','#fca311','#e5e5e5'],['#eaf4f4','#1d3b3b','#6b9080','#1d3b3b']],
  draw(c){ const {P}=c, R_=5, w=R_*Math.sqrt(3), h=R_*3, hx=(cx,cy)=>{ let d=''; for(let i=0;i<6;i++){ const a=Math.PI/180*(60*i-30); d+=(i?'L':'M')+n2(cx+R_*Math.cos(a))+' '+n2(cy+R_*Math.sin(a)); } return d+'Z'; };
   const inner=PT(hx(w/2,R_)+hx(0,R_*2.5)+hx(w,R_*2.5),'none',`stroke="${P.a}" stroke-width=".45"`); return fillAll(c,P.bg)+patAll(c,'hx',inner,w,h); }},
 {id:'diag',n:'Диагональ',cat:'Узоры',lay:{pos:'label',font:'Oswald',plate:'white'},pals:[['#f4f1ea','#1d1d1f','#e63946','#1d3557'],['#1d1d1f','#ffffff','#f2c14e','#1d1d1f'],['#e8f1ee','#173f35','#2a9d8f','#173f35'],['#fde2e4','#3a1d22','#e5989b','#3a1d22']],
  draw(c){ const {P}=c, inner=R(0,0,6,12,P.bg)+R(0,0,3,12,P.a); return patAll(c,'dg',inner,6,12,'rotate(35)'); }},
 {id:'breton',n:'Тельняшка',cat:'Узоры',lay:{pos:'label',font:'Playfair Display',plate:'white'},pals:[['#ffffff','#14213d','#1d3557','#e63946'],['#fbf7f0','#2b2b2b','#c1121f','#2b2b2b'],['#ffffff','#10302a','#2d6a4f','#10302a']],
  draw(c){ const {P}=c, inner=R(0,0,10,7,P.bg)+R(0,4.6,10,2.4,P.a); return patAll(c,'bt',inner,10,7); }},
 {id:'polka',n:'Горошек',cat:'Узоры',lay:{pos:'label',font:'Comfortaa',plate:'round'},pals:[['#fbe9e7','#3d1f1a','#e57373','#3d1f1a'],['#1d3557','#ffffff','#f1faee','#1d3557'],['#fff8e1','#3b2f0b','#f4a261','#3b2f0b'],['#e8f5e9','#1b3a1f','#81c784','#1b3a1f']],
  draw(c){ const {P}=c, inner=C(3,3,1.5,P.a)+C(9,9,1.5,P.a); return fillAll(c,P.bg)+patAll(c,'pk',inner,12,12); }},
 {id:'graph',n:'Миллиметровка',cat:'Узоры',lay:{pos:'label',font:'PT Mono',plate:'white'},pals:[['#f4f8fb','#1b3a57','#9cc3e0','#4a86b8'],['#fbf7ee','#4a3b20','#e3c78f','#c08b3d'],['#f3f6f1','#22402a','#a9cfa9','#4f8a5b'],['#1e2833','#e8f0f8','#33475b','#5a7a99']],
  draw(c){ const {P}=c, inner=PT('M0 0H10M0 0V10','none',`stroke="${P.b}" stroke-width=".3"`)+PT('M0 2H10M0 4H10M0 6H10M0 8H10M2 0V10M4 0V10M6 0V10M8 0V10','none',`stroke="${P.a}" stroke-width=".12"`); return fillAll(c,P.bg)+patAll(c,'gr',inner,10,10); }},
 {id:'gingham',n:'Клетка виши',cat:'Узоры',lay:{pos:'label',font:'Lora',plate:'white'},pals:[['#ffffff','#2b1d1d','#d62828','#d62828'],['#ffffff','#14213d','#3a6ea5','#3a6ea5'],['#ffffff','#1b3a1f','#40916c','#40916c'],['#fffaf0','#3b2a12','#e09f3e','#e09f3e']],
  draw(c){ const {P}=c, inner=R(0,0,8,8,P.bg)+R(0,0,4,8,P.a,'opacity=".45"')+R(0,0,8,4,P.a,'opacity=".45"'); return patAll(c,'gh',inner,8,8); }},
 {id:'chevron',n:'Шеврон',cat:'Узоры',lay:{pos:'label',font:'Montserrat',plate:'white'},pals:[['#f6f4ef','#222222','#2a9d8f','#222222'],['#22223b','#f2e9e4','#c9ada7','#f2e9e4'],['#fff1e6','#3d2618','#e76f51','#3d2618']],
  draw(c){ const {P}=c, inner=PT('M0 6L5 1L10 6','none',`stroke="${P.a}" stroke-width="1.6" stroke-linejoin="miter"`); return fillAll(c,P.bg)+patAll(c,'cv',inner,10,7); }},
 {id:'seigaiha',n:'Волны сэйгайха',cat:'Узоры',lay:{pos:'label',font:'Cormorant Garamond',plate:'white'},pals:[['#1d3557','#f1faee','#a8dadc','#f1faee'],['#f4ede4','#2b2b2b','#b5523b','#2b2b2b'],['#0b3c49','#f4e9d8','#d9a441','#f4e9d8'],['#f1f4f2','#203a43','#7aa5a6','#203a43']],
  draw(c){ const {P}=c, w=12, h=6, arcs=(cx,cy)=>[5.6,4.2,2.8,1.4].map((rr,i)=>C(cx,cy,rr,i%2?P.bg:P.a)).join(''), inner=R(0,0,w,h,P.bg)+arcs(0,0)+arcs(12,0)+arcs(6,3)+arcs(0,6)+arcs(12,6)+arcs(6,9);
   return patAll(c,'sg',inner,w,h); }},
 {id:'fern',n:'Ботаника',cat:'Природа',lay:{pos:'top',font:'Cormorant Garamond',plate:''},pals:[['#f4f0e6','#2f3b2c','#5d7a55','#2f3b2c'],['#1f2e27','#efe7d6','#c9b98f','#efe7d6'],['#fbf3ee','#4a2c25','#c47a63','#4a2c25'],['#eef2f5','#1f3344','#5b7d99','#1f3344']],
  draw(c){ const {F,K,P}=c, sw=c.thumb?.5:.32; return fillAll(c,P.bg)+stem(c,F.x+F.w*.62,F.y+F.h+2,F.h*.62,-100,P.a,sw)+stem(c,F.x+F.w*.82,F.y+F.h+2,F.h*.44,-80,P.a,sw)+stem(c,F.x+F.w*.42,F.y+F.h+2,F.h*.36,-120,P.a,sw)+stem(c,K.x+K.w*.2,K.y+K.h+2,K.h*.3,-75,P.a,sw); }},
 {id:'wreath',n:'Венок',cat:'Природа',lay:{pos:'center',font:'Marck Script',plate:''},pals:[['#fbf7f0','#3a3a2e','#7c9070','#d9a5a0'],['#203a33','#f3ead7','#c5d1b5','#e6b99d'],['#f5eff5','#3c2a3c','#9b7fa6','#e8b7c8']],
  draw(c){ const {F,P}=c, cx=F.x+F.w/2, cy=F.y+F.h*.47, rr=Math.min(F.w,F.h)*.3; let s=fillAll(c,P.bg); const n=28;
   for(let i=0;i<n;i++){ const a=i/n*Math.PI*2, x=cx+Math.cos(a)*rr, y=cy+Math.sin(a)*rr, d=a*180/Math.PI+90; s+=PT(leaf(x,y,rr*.2,d+35,.34),i%2?P.a:mix(P.a,P.bg,.3))+PT(leaf(x,y,rr*.17,d-30,.34),P.a); if(i%5===0) s+=C(x+Math.cos(a)*3,y+Math.sin(a)*3,1.6,P.b); }
   return s+C(cx,cy,rr,'none',`stroke="${P.a}" stroke-width=".35"`); }},
 {id:'topo',n:'Топография',cat:'Природа',lay:{pos:'label',font:'Manrope',plate:'white'},pals:[['#f2efe8','#2c2c2c','#9c8f7a','#2c2c2c'],['#0f2027','#e8f1f2','#3f6d7a','#e8f1f2'],['#e9f0e6','#24361f','#87a37b','#24361f'],['#fbeee4','#40261b','#d08c60','#40261b']],
  draw(c){ const {P,TW,TH,r}=c; let s=fillAll(c,P.bg); const cs=[[TW*.72,TH*.38],[TW*.25,TH*.7],[TW*.5,TH*1.05]];
   cs.forEach(([cx,cy],k)=>{ const ph=[r()*6,r()*6,r()*6]; for(let j=1;j<16;j++){ const base=j*6.2; let d=''; for(let i=0;i<=48;i++){ const a=i/48*Math.PI*2, rr=base*(1+.16*Math.sin(3*a+ph[0])+.09*Math.sin(5*a+ph[1]+j*.2)+.05*Math.sin(7*a+ph[2])); d+=(i?'L':'M')+n2(cx+Math.cos(a)*rr*1.25)+' '+n2(cy+Math.sin(a)*rr); } s+=PT(d+'Z','none',`stroke="${P.a}" stroke-width="${j%5===0?.5:.25}"`); } }); return s; }},
 {id:'mount',n:'Горы',cat:'Природа',lay:{pos:'top',font:'Montserrat',plate:''},pals:[['#f6e7d7','#2d2a32','#e8a87c','#41436a'],['#0f1c2e','#f4efe6','#f2c57c','#3a506b'],['#eaf2ef','#1c2b2d','#9cc5a1','#1f6f78'],['#fde8e2','#3d2a35','#f4978e','#5c4d7d']],
  draw(c){ const {P,TW,TH,F}=c; let s=fillAll(c,P.bg)+C(F.x+F.w*.66,F.y+F.h*.42,Math.min(F.w,F.h)*.12,P.a);
   for(let L=0;L<4;L++){ const col=mix(P.b,P.bg,.62-L*.2), base=TH*(.58+L*.1); let d=`M0 ${n2(TH)} L0 ${n2(base)}`; let x=0; const rr=rng(31+L*7); while(x<TW){ const w=14+rr()*30; d+=` L${n2(x+w/2)} ${n2(base-(8+rr()*26)*(1-L*.18))} L${n2(x+w)} ${n2(base-rr()*4)}`; x+=w; } s+=PT(d+` L${n2(TW)} ${n2(TH)}Z`,col); } return s; }},
 {id:'space',n:'Космос',cat:'Природа',lay:{pos:'bottom',font:'Unbounded',plate:''},pals:[['#0b1026','#eef0ff','#f7d26a','#8fa3ff'],['#1a0b2e','#f6eaff','#ffb3c1','#c4b5fd'],['#06141b','#e6f4f1','#7ee0c3','#9bd1ff']],
  draw(c){ const {P,TW,TH,r,F}=c; let s=`<defs><radialGradient id="${c.u}sp" cx="70%" cy="30%" r="80%"><stop offset="0" stop-color="${mix(P.bg,P.b,.28)}"/><stop offset="1" stop-color="${P.bg}"/></radialGradient></defs>`+R(0,0,TW,TH,`url(#${c.u}sp)`);
   const N=Math.round(TW*TH/(c.thumb?90:28)); for(let i=0;i<N;i++){ s+=C(r()*TW,r()*TH,.12+Math.pow(r(),4)*.7,r()<.15?P.a:'#ffffff',`opacity="${n2(.4+r()*.6)}"`); }
   const mx=F.x+F.w*.72, my=F.y+F.h*.24, mr=Math.min(F.w,F.h)*.1; s+=C(mx,my,mr,P.a)+C(mx+mr*.42,my-mr*.2,mr*.9,P.bg);
   const pts=[[.18,.36],[.3,.3],[.42,.4],[.38,.55],[.52,.6]].map(([a,b])=>[F.x+F.w*a,F.y+F.h*b]); s+=PT('M'+pts.map(p=>n2(p[0])+' '+n2(p[1])).join(' L'),'none',`stroke="${P.ink}" stroke-width=".25" opacity=".6"`)+pts.map(p=>C(p[0],p[1],.8,'#fff')).join(''); return s; }},
 {id:'mesh',n:'Градиент-меш',cat:'Арт',lay:{pos:'center',font:'Unbounded',plate:''},pals:[['#ffd6e0','#2a1033','#7b2cbf','#ff8fab'],['#d8f3dc','#08281c','#2d6a4f','#74c69d'],['#ffe8d6','#3a1b0b','#ff7b54','#ffb26b'],['#cfe8ff','#0c1d3a','#3f37c9','#4cc9f0']],
  draw(c){ const {P,TW,TH}=c, blobs=[[.15,.2,P.a],[.8,.15,P.b],[.6,.8,P.a],[.25,.85,P.b],[.95,.6,mix(P.a,P.b,.5)]]; let d='<defs>', s='';
   blobs.forEach(([x,y,col],i)=>{ d+=`<radialGradient id="${c.u}m${i}" cx="${x*100}%" cy="${y*100}%" r="55%"><stop offset="0" stop-color="${col}" stop-opacity=".95"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient>`; s+=R(0,0,TW,TH,`url(#${c.u}m${i})`); });
   return d+'</defs>'+fillAll(c,P.bg)+s; }},
 {id:'aurora',n:'Аврора',cat:'Арт',lay:{pos:'bottom',font:'Manrope',plate:''},pals:[['#0d1b2a','#e0fbfc','#4cc9f0','#b5179e'],['#fdf0e8','#2d1e2f','#f28482','#84a59d'],['#10002b','#f8f0ff','#7b2cbf','#ff9e00']],
  draw(c){ const {P,TW,TH}=c; let s=`<defs><linearGradient id="${c.u}au" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${P.a}"/><stop offset="1" stop-color="${P.b}"/></linearGradient></defs>`+fillAll(c,P.bg);
   for(let k=0;k<7;k++){ const y0=TH*(.18+k*.075); let d=`M0 ${n2(y0)}`; for(let x=0;x<=TW;x+=TW/24) d+=` L${n2(x)} ${n2(y0+Math.sin(x/TW*Math.PI*2.2+k*.7)*TH*.07)}`; d+=` L${n2(TW)} ${n2(y0+TH*.16)} L0 ${n2(y0+TH*.16)}Z`; s+=PT(d,`url(#${c.u}au)`,`opacity="${n2(.12+k*.03)}"`); } return s; }},
 {id:'bauhaus',n:'Баухаус',cat:'Арт',lay:{pos:'bottom',font:'Montserrat',plate:''},pals:[['#f1e9da','#1d1d1d','#e63946','#1d3557','#f4a261'],['#1d1d1d','#f1e9da','#f4a261','#e9c46a','#2a9d8f'],['#efe8df','#232323','#1e6091','#d1495b','#edae49']],
  draw(c){ const {P,F,K,r}=c, col=[P.a,P.b,P.c||P.a,P.ink]; let s=fillAll(c,P.bg); const cell=(b,rows,cols,h0)=>{ const cw=b.w/cols, ch=b.h*h0/rows;
   for(let i=0;i<rows;i++) for(let j=0;j<cols;j++){ const x=b.x+j*cw, y=b.y+i*ch, k=Math.floor(r()*6), f=col[Math.floor(r()*4)], m=Math.min(cw,ch);
    if(k===0) s+=C(x+cw/2,y+ch/2,m*.42,f); else if(k===1) s+=PT(`M${n2(x)} ${n2(y+ch)}A${n2(cw)} ${n2(ch)} 0 0 1 ${n2(x+cw)} ${n2(y+ch)}Z`,f); else if(k===2) s+=PT(`M${n2(x)} ${n2(y)}L${n2(x+cw)} ${n2(y)}A${n2(cw)} ${n2(ch)} 0 0 1 ${n2(x)} ${n2(y+ch)}Z`,f); else if(k===3) s+=R(x+cw*.15,y+ch*.15,cw*.7,ch*.7,f); else if(k===4) s+=PT(`M${n2(x)} ${n2(y+ch)}L${n2(x+cw/2)} ${n2(y)}L${n2(x+cw)} ${n2(y+ch)}Z`,f); } };
   cell(F,3,3,.68); cell({x:K.x,y:K.y+K.h*.76,w:K.w,h:K.h},1,4,.24); return s; }},
 {id:'memphis',n:'Мемфис',cat:'Арт',lay:{pos:'label',font:'Rubik',plate:'round'},pals:[['#fff5e1','#1d1d1d','#ff6b9d','#3ec1d3','#ffd23f'],['#1d1d1d','#ffffff','#ff6b9d','#3ec1d3','#ffd23f'],['#e8f7f5','#1d1d1d','#ff8c42','#6c5ce7','#00b894']],
  draw(c){ const {P,TW,TH,r}=c, col=[P.a,P.b,P.c||P.a,P.ink]; let s=fillAll(c,P.bg); const N=Math.round(TW*TH/(c.thumb?500:260));
   for(let i=0;i<N;i++){ const x=r()*TW,y=r()*TH,k=Math.floor(r()*5),f=col[Math.floor(r()*4)],z=3+r()*4,a=r()*360;
    if(k===0) s+=PT(`M${n2(x)} ${n2(y)} q${n2(z/2)} ${n2(-z/2)} ${n2(z)} 0 t${n2(z)} 0 t${n2(z)} 0`,'none',`stroke="${f}" stroke-width=".9" stroke-linecap="round" transform="rotate(${n2(a)} ${n2(x)} ${n2(y)})"`);
    else if(k===1) s+=PT(`M${n2(x)} ${n2(y)}l${n2(z)} 0 l${n2(-z/2)} ${n2(-z*.87)}z`,'none',`stroke="${f}" stroke-width=".8" transform="rotate(${n2(a)} ${n2(x)} ${n2(y)})"`);
    else if(k===2) s+=C(x,y,z*.3,f); else if(k===3) s+=R(x,y,z*.9,z*.9,'none',`stroke="${f}" stroke-width=".8" transform="rotate(${n2(a)} ${n2(x)} ${n2(y)})"`); else s+=PT(`M${n2(x)} ${n2(y)}l${n2(z)} 0`,'none',`stroke="${f}" stroke-width="1.4" stroke-linecap="round" transform="rotate(${n2(a)} ${n2(x)} ${n2(y)})"`); } return s; }},
 {id:'deco',n:'Ар-деко',cat:'Арт',lay:{pos:'center',font:'Prata',plate:''},pals:[['#14213d','#f3e5c0','#c9a24a','#14213d'],['#0b3d2e','#f1e3c2','#d4af37','#0b3d2e'],['#2b0f1d','#f6dfc5','#d9a35b','#2b0f1d'],['#f4efe6','#1d1d1d','#b08d57','#f4efe6']],
  draw(c){ const {P,F}=c, inner=R(0,0,12,8,P.bg)+[6,4.6,3.2,1.8].map(rr=>PT(`M${n2(6-rr)} 8A${rr} ${rr} 0 0 1 ${n2(6+rr)} 8`,'none',`stroke="${P.a}" stroke-width=".35"`)).join('')+[6,4.6,3.2,1.8].map(rr=>PT(`M${n2(-rr)} 4A${rr} ${rr} 0 0 1 ${n2(rr)} 4M${n2(12-rr)} 4A${rr} ${rr} 0 0 1 ${n2(12+rr)} 4`,'none',`stroke="${P.a}" stroke-width=".35"`)).join('');
   return patAll(c,'dc',inner,12,8)+R(F.x+F.w*.14,F.y+F.h*.3,F.w*.72,F.h*.36,P.bg,`stroke="${P.a}" stroke-width=".7"`)+R(F.x+F.w*.14+1.6,F.y+F.h*.3+1.6,F.w*.72-3.2,F.h*.36-3.2,'none',`stroke="${P.a}" stroke-width=".3"`); }},
 {id:'kids',n:'Конфетти',cat:'Школа и планер',lay:{pos:'label',font:'Comfortaa',plate:'round'},pals:[['#fffdf5','#2b2b2b','#ff6b6b','#4ecdc4','#ffd93d'],['#eaf6ff','#1d3557','#ff8fab','#7bdff2','#ffd166'],['#f3fff0','#1f3b2c','#ff9f1c','#2ec4b6','#cbf3f0']],
  draw(c){ const {P,TW,TH,r}=c, col=[P.a,P.b,P.c||P.a]; let s=fillAll(c,P.bg); const N=Math.round(TW*TH/(c.thumb?220:110));
   for(let i=0;i<N;i++){ const x=r()*TW,y=r()*TH,f=col[i%3],z=1.4+r()*2.6; if(i%4===0){ let d=''; for(let j=0;j<10;j++){ const a=j/10*Math.PI*2-Math.PI/2, rr=j%2?z*.45:z; d+=(j?'L':'M')+n2(x+Math.cos(a)*rr)+' '+n2(y+Math.sin(a)*rr); } s+=PT(d+'Z',f); } else s+=C(x,y,z*.55,f,`opacity=".9"`); } return s; }},
 {id:'school',n:'Тетрадь школьная',cat:'Школа и планер',bp:11,own:true,lay:{pos:'',font:'PT Serif',plate:''},pals:[['#cfe6d3','#1f3a26','#2f6b3e','#ffffff'],['#cfe0f2','#14304f','#2a5d93','#ffffff'],['#f4d3dc','#4a1f2c','#a8445f','#ffffff'],['#f6e7b9','#4a3a10','#b08a1c','#ffffff'],['#e2dcf2','#2a2148','#5a4a9a','#ffffff']],
  draw(c){ const {P,F,K,T}=c, u=c.u; const brd=b=>{ const inner=PT('M0 2 L2 0 L4 2 L2 4Z','none',`stroke="${P.a}" stroke-width=".25"`); return `<defs>${PAT(u+'sc'+(b.x|0),4,4,inner)}</defs>`+R(b.x+5,b.y+5,b.w-10,b.h-10,'none',`stroke="url(#${u}sc${b.x|0})" stroke-width="3"`); };
   let s=fillAll(c,P.bg)+brd(F)+brd(K); if(!c.own) return s;
   const lw=F.w*.68, lh=Math.min(F.h*.34,lw*.78), lx=F.x+(F.w-lw)/2, ly=F.y+F.h*.12, f=ffOf(c.font||'PT Serif'), tc='#1d1d1f', ttl=(T.title||'ТЕТРАДЬ').toUpperCase(), fs=fitSize(ttl,lw*.11,lw*.86,c.font,lw*.02);
   s+=R(lx,ly,lw,lh,'#ffffff',`stroke="${P.a}" stroke-width=".5" rx="1.5"`)+R(lx+1.4,ly+1.4,lw-2.8,lh-2.8,'none',`stroke="${P.a}" stroke-width=".25" rx="1"`);
   s+=`<text x="${n2(lx+lw/2)}" y="${n2(ly+lh*.24)}" text-anchor="middle" font-family="${f}" font-size="${n2(fs)}" font-weight="700" letter-spacing="${n2(lw*.02)}" fill="${tc}">${E(ttl)}</text>`;
   const lines=[['для работ',T.sub||''],['ученика(цы)',''],['класса',''],['',T.owner||'']], fs2=lw*.052; lines.forEach(([lab,val],i)=>{ const y=ly+lh*(.44+i*.15);
    s+=`<text x="${n2(lx+lw*.08)}" y="${n2(y)}" font-family="${f}" font-size="${n2(fs2)}" fill="${tc}">${E(lab)}</text>`+PT(`M${n2(lx+lw*(lab?.08+lab.length*.03:.08))} ${n2(y+.8)}H${n2(lx+lw*.92)}`,'none',`stroke="${tc}" stroke-width=".2"`);
    if(val) s+=`<text x="${n2(lx+lw*(lab?.1+lab.length*.03:.5))}" y="${n2(y-.4)}" ${lab?'':'text-anchor="middle" '}font-family="${ffOf('Caveat')}" font-size="${n2(fs2*1.35)}" fill="#1b3f8f">${E(val)}</text>`; });
   if(T.year) s+=`<text x="${n2(F.x+F.w/2)}" y="${n2(F.y+F.h*.9)}" text-anchor="middle" font-family="${f}" font-size="${n2(fs2)}" fill="${P.ink}">${E(T.year)}</text>`; return s; }},
 {id:'planner',n:'Планер на год',cat:'Школа и планер',own:true,lay:{pos:'',font:'Montserrat',plate:''},pals:[['#f5f1ea','#1f1f1f','#c8553d','#8d99ae'],['#1b263b','#f1f1f1','#f4a259','#778da9'],['#eef4ed','#13315c','#4f772d','#90a955'],['#fdf0f4','#3a1f2b','#d1497b','#b7a7b9']],
  draw(c){ const {P,F,T}=c; let s=fillAll(c,P.bg); if(!c.own) return s; const y=parseInt(T.year)||new Date().getFullYear()+1, f=ffOf(c.font||'Montserrat'), mx=F.x+F.w*.1, mw=F.w*.8;
   const fsY=fitSize(String(y),F.w*.3,mw,c.font,0); s+=`<text x="${n2(mx)}" y="${n2(F.y+F.h*.12+fsY*.2)}" font-family="${f}" font-size="${n2(F.w*.045)}" letter-spacing="${n2(F.w*.012)}" font-weight="600" fill="${P.a}">${E((T.title||'ПЛАНЕР').toUpperCase())}</text>`;
   s+=`<text x="${n2(mx-1)}" y="${n2(F.y+F.h*.12+fsY*1.02)}" font-family="${f}" font-size="${n2(fsY)}" font-weight="800" fill="${P.ink}">${y}</text>`;
   const gy=F.y+F.h*.12+fsY*1.22, gh=F.y+F.h*.9-gy, cw=mw/3, ch=gh/4, ds=Math.min(cw/8,ch/8.5);
   for(let m=0;m<12;m++){ const ox=mx+(m%3)*cw, oy=gy+Math.floor(m/3)*ch; s+=`<text x="${n2(ox)}" y="${n2(oy+ds*1.1)}" font-family="${f}" font-size="${n2(ds*.95)}" font-weight="700" fill="${P.a}">${MONTHS[m]}</text>`;
    const first=(new Date(y,m,1).getDay()+6)%7, days=new Date(y,m+1,0).getDate(); let t='';
    for(let d=1;d<=days;d++){ const k=first+d-1, col=k%7, row=Math.floor(k/7); t+=`<text x="${n2(ox+col*ds*1.02+ds*.45)}" y="${n2(oy+ds*2.4+row*ds*.98)}" text-anchor="middle" font-size="${n2(ds*.6)}" fill="${col>4?P.a:P.ink}">${d}</text>`; }
    s+=`<g font-family="${f}">${t}</g>`; }
   if(T.owner) s+=`<text x="${n2(mx)}" y="${n2(F.y+F.h*.95)}" font-family="${f}" font-size="${n2(F.w*.032)}" fill="${P.ink}" opacity=".75">${E(T.owner)}</text>`; return s; }},
 {id:'lined',n:'Тетрадный лист',cat:'Школа и планер',lay:{pos:'label',font:'Caveat',plate:''},pals:[['#fdfdf8','#1b3f8f','#9ec5e8','#e85d75'],['#fff9ec','#2b2b2b','#d8c7a8','#c0392b'],['#f4fbf6','#1b4332','#a7d7b8','#e76f51']],
  draw(c){ const {P,F,K}=c, inner=R(0,0,10,8,P.bg)+R(0,7.7,10,.3,P.a); return patAll(c,'ld',inner,10,8)+R(F.x+F.w*.13,0,.45,c.TH,P.b)+R(K.x+K.w*.87,0,.45,c.TH,P.b); }},
 {id:'monogram',n:'Монограмма TH',cat:'Бренд',bp:11,own:true,lay:{pos:'',font:'Cormorant Garamond',plate:''},pals:[['#1e2a24','#e6d3a3','#c9a24a','#e6d3a3'],['#f5f0e6','#2b2620','#a8875b','#2b2620'],['#2a1b2e','#ead7c3','#d4a373','#ead7c3'],['#0f1f33','#e8ecf2','#b9c4d4','#e8ecf2']],
  draw(c){ const {P,F,K,T}=c; let s=fillAll(c,P.bg)+R(F.x+7,F.y+7,F.w-14,F.h-14,'none',`stroke="${P.a}" stroke-width=".4"`)+R(K.x+7,K.y+7,K.w-14,K.h-14,'none',`stroke="${P.a}" stroke-width=".4"`); if(!c.own) return s;
   const w=F.w*.56, x=F.x+(F.w-w)/2, y=F.y+F.h*.2, name=(T.owner||T.title||'tadhayrapetian').trim(); let lg='';
   try{ if(KS.thSVG) lg=KS.thSVG({v:'crest',txt:name,sub:T.year||T.sub||'',ff:'serif',color:P.a},{}); }catch(_){ lg=''; }
   if(!lg) lg=`<svg viewBox="0 0 100 100" width="100%" height="100%"><text x="50" y="62" text-anchor="middle" font-family="${ffOf('Cormorant Garamond')}" font-size="44" fill="${P.a}">TH</text></svg>`;
   s+=`<svg x="${n2(x)}" y="${n2(y)}" width="${n2(w)}" height="${n2(w)}" viewBox="0 0 100 100" overflow="visible">${lg.replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'')}</svg>`;
   if(T.title&&T.owner) s+=`<text x="${n2(F.x+F.w/2)}" y="${n2(F.y+F.h*.86)}" text-anchor="middle" font-family="${ffOf(c.font||'Cormorant Garamond')}" font-size="${n2(fitSize(T.title,F.w*.07,F.w*.7,c.font,0))}" letter-spacing="${n2(F.w*.008)}" fill="${P.ink}">${E(T.title.toUpperCase())}</text>`; return s; }},
 {id:'thbrand',n:'Студия TH',cat:'Бренд',lay:{pos:'center',font:'Playfair Display',plate:''},pals:[['#f4efe7','#1d1d1f','#b08d57','#1d1d1f'],['#101820','#f2ede4','#c9a24a','#f2ede4'],['#e9e1d6','#3b2f2a','#8a6a50','#3b2f2a']],
  draw(c){ const {P,TW,TH}=c, inner=`<text x="7" y="10" text-anchor="middle" font-family="${ffOf('Cormorant Garamond')}" font-size="6" fill="${P.a}" opacity=".16">TH</text>`; return fillAll(c,P.bg)+`<defs>${PAT(c.u+'th',14,14,inner,'rotate(-12)')}</defs>`+R(0,0,TW,TH,`url(#${c.u}th)`); }},
 {id:'arm',n:'Армянский орнамент',cat:'Армения',bp:18,lay:{pos:'bottom',font:'Noto Serif Armenian',plate:''},pals:[['#f3e6d3','#5a1e1b','#a4362c','#c98c3a'],['#7a2420','#f6e7d2','#e8b66b','#f6e7d2'],['#1d2b4a','#f2e6cf','#d8a650','#f2e6cf'],['#efe4d0','#2d3b2a','#6c7b3a','#b5542c']],
  draw(c){ const {P,F,K}=c, cx=F.x+F.w/2, cy=F.y+F.h*.38, R0=Math.min(F.w,F.h)*.26; let s=fillAll(c,P.bg); let arms='';
   for(let i=0;i<8;i++){ const a=i*45; arms+=`<path transform="rotate(${a} ${n2(cx)} ${n2(cy)})" d="M${n2(cx)} ${n2(cy)} C${n2(cx+R0*.15)} ${n2(cy-R0*.45)} ${n2(cx+R0*.7)} ${n2(cy-R0*.55)} ${n2(cx+R0*.62)} ${n2(cy-R0*.92)} C${n2(cx+R0*.42)} ${n2(cy-R0*.7)} ${n2(cx+R0*.12)} ${n2(cy-R0*.62)} ${n2(cx)} ${n2(cy)}Z" fill="${i%2?P.b:P.a}"/>`; }
   s+=C(cx,cy,R0*1.12,'none',`stroke="${P.a}" stroke-width=".6"`)+C(cx,cy,R0*1.2,'none',`stroke="${P.b}" stroke-width=".3"`)+arms+C(cx,cy,R0*.1,P.bg)+C(cx,cy,R0*.05,P.a);
   const band=(x,y,w)=>{ const st_=5; let d=''; for(let k=0;k*st_<w-st_;k++){ const X=x+k*st_; d+=`M${n2(X)} ${n2(y+3)}h${n2(st_*.5)}v-2h${n2(st_*.5)}`; } return PT(d,'none',`stroke="${P.a}" stroke-width=".6"`)+R(x,y-1,w,.3,P.b)+R(x,y+4.2,w,.3,P.b); };
   s+=band(F.x+8,F.y+10,F.w-16)+band(F.x+8,F.y+F.h-14,F.w-16)+band(K.x+8,K.y+K.h-14,K.w-16); return s; }},
 {id:'pomegr',n:'Гранаты',cat:'Армения',lay:{pos:'label',font:'Cormorant Garamond',plate:'white'},pals:[['#f6ead9','#4a1414','#b3262e','#5b7a3a'],['#3a0f14','#f6e2cf','#e0485a','#9fb173'],['#eef1e6','#2a2a1f','#c0392b','#6b8f47']],
  draw(c){ const {P}=c, g=(x,y)=>C(x,y+1,3.6,P.a)+PT(`M${n2(x-1.6)} ${n2(y-2.2)}l.6 -1.8 1 1.1 1 -1.1 .6 1.8z`,P.a)+PT(leaf(x+3,y-3,4,-35,.35),P.b)+C(x-1.1,y+.4,.5,mix(P.a,'#ffffff',.45))+C(x+.8,y+1.8,.5,mix(P.a,'#ffffff',.45));
   const inner=g(7,7)+g(21,21); return fillAll(c,P.bg)+patAll(c,'pg',inner,28,28); }},
 {id:'ararat',n:'Арарат',cat:'Армения',lay:{pos:'top',font:'Montserrat Armenian',plate:''},pals:[['#f9e3c9','#3c2a21','#e3925a','#7d4e3a'],['#183a4a','#f4ebdd','#f2b880','#f4ebdd'],['#f3efe9','#2f2a26','#c2765d','#5f6f7a']],
  draw(c){ const {P,F,TW,TH}=c, bx=F.x, by=F.y+F.h*.7, w=F.w; let s=fillAll(c,P.bg)+C(bx+w*.68,F.y+F.h*.42,w*.1,P.a,'opacity=".9"');
   s+=PT(`M0 ${n2(TH)} L0 ${n2(by+8)} L${n2(bx+w*.1)} ${n2(by+4)} L${n2(bx+w*.42)} ${n2(by-w*.32)} L${n2(bx+w*.5)} ${n2(by-w*.28)} L${n2(bx+w*.62)} ${n2(by-w*.1)} L${n2(bx+w*.72)} ${n2(by-w*.17)} L${n2(bx+w*.86)} ${n2(by-w*.02)} L${n2(TW)} ${n2(by+6)} L${n2(TW)} ${n2(TH)}Z`,P.b,'opacity=".9"');
   s+=PT(`M${n2(bx+w*.36)} ${n2(by-w*.25)} L${n2(bx+w*.42)} ${n2(by-w*.32)} L${n2(bx+w*.5)} ${n2(by-w*.28)} L${n2(bx+w*.47)} ${n2(by-w*.24)} L${n2(bx+w*.43)} ${n2(by-w*.26)} L${n2(bx+w*.39)} ${n2(by-w*.23)}Z`,P.bg); return s; }},
];
const tplById=id=>NBC_TPL.find(t=>t.id===id)||NBC_TPL[0];
/* effective palette: template palette + custom colours */
function palOf(T,i,s){ const p=T.pals[clamp(i|0,0,T.pals.length-1)]||T.pals[0]; const P={bg:p[0],ink:p[1],a:p[2],b:p[3]||p[1],c:p[4]||p[2]}; s=s||{};
  if(s.cbg){ P.bg=s.cbg; if(isDark(P.bg)!==isDark(p[0])) P.ink=isDark(P.bg)?'#f5f2ec':'#1d1d1f'; } if(s.cacc) P.a=s.cacc; return P; }
/* ================= composition: spread → SVG ================= */
let UID=0;
let ARTC=null; /* {id,src} current art bitmap, loaded from IDB */
const SCRIPTF=new Set(['Marck Script','Bad Script','Caveat','Great Vibes','Lobster','Amatic SC','Unbounded','Russo One','Oswald','Comfortaa']);
const FOILS={gold:['#7d5c18','#d9b24f','#9c7424','#ecd27e','#7a5716'],silver:['#7b8088','#f4f6f8','#a7adb5','#ffffff','#80868e'],rose:['#9a5b4f','#f7cfc0','#c1806f','#ffe3d8','#94584c'],copper:['#7a3f1d','#f0a36b','#a8552a','#ffd0a8','#7a3f1d']};
const FOILN={'':'Обычный',gold:'Золото',silver:'Серебро',rose:'Розовое золото',copper:'Медь'};
function txtVals(s,g){ const t=s.t||{}, i=g.i; return {title:(t.title||'').trim()?t.title:(i.title||'Блокнот'),sub:t.sub||'',owner:t.owner||i.owner||'',year:t.year||i.year||''}; }
const artReady=s=>s.src!=='tpl'&&s.art&&ARTC&&ARTC.id===s.art.id&&!!ARTC.src;
function imgArea(g,s){ if(s.area==='all') return {x:0,y:0,w:g.TW,h:g.TH}; return g.wrap?{x:g.front.x,y:0,w:g.pw+g.B,h:g.TH}:panelBox(g,'front'); }
function imageLayer(c,s,g,src){ const a=s.art||{}, A=imgArea(g,s), iw=a.w||1000, ih=a.h||1000, z=(s.zoom||100)/100;
  const k=(s.fit==='contain'?Math.min(A.w/iw,A.h/ih):Math.max(A.w/iw,A.h/ih))*z, dw=iw*k, dh=ih*k, x=A.x+(A.w-dw)*(s.px??50)/100, y=A.y+(A.h-dh)*(s.py??50)/100;
  const im=IM(src,x,y,dw,dh), ov=+s.ov||0, ovr=r=>ov?R(r.x,r.y,r.w,r.h,ov<0?'#000':'#fff',`opacity="${n2(Math.abs(ov)/100)}"`):'';
  let o=`<defs><clipPath id="${c.u}ia"><rect x="${n2(A.x)}" y="${n2(A.y)}" width="${n2(A.w)}" height="${n2(A.h)}"/></clipPath></defs><g clip-path="url(#${c.u}ia)">${s.fit==='contain'?R(A.x,A.y,A.w,A.h,c.P.bg):''}${im}${ovr(A)}</g>`;
  if(s.area!=='all'&&s.backArt==='mirror'){ const xm=g.wrap?g.front.x:(g.back.x+g.pw+g.front.x)/2, M=g.wrap?{x:0,y:0,w:g.front.x,h:g.TH}:panelBox(g,'back');
    o+=`<defs><clipPath id="${c.u}ib"><rect x="${n2(M.x)}" y="${n2(M.y)}" width="${n2(M.w)}" height="${n2(M.h)}"/></clipPath></defs><g clip-path="url(#${c.u}ib)"><g transform="translate(${n2(2*xm)} 0) scale(-1 1)">${s.fit==='contain'?R(A.x,A.y,A.w,A.h,c.P.bg):''}${im}</g>${ovr(M)}</g>`; }
  return o; }
function foilDef(c,kind){ const f=FOILS[kind]; if(!f) return ''; return `<defs><linearGradient id="${c.u}foil" x1="0" y1="0" x2="1" y2="1">${f.map((col,i)=>`<stop offset="${n2(i/(f.length-1))}" stop-color="${col}"/>`).join('')}</linearGradient></defs>`; }
/* generic text layer on the front */
function textLayer(c,s,TV,T,img){ const t=s.t||{}, F=c.F, g=c.g, pos=t.pos||T.lay.pos||'center'; if(pos==='none') return '';
  let plate=t.plate||T.lay.plate||'none'; if(pos==='label'&&plate==='none'&&!t.plate) plate='white';
  const font=t.font||T.lay.font||'PT Serif', font2=SCRIPTF.has(font)?'Montserrat':font, sc=(t.size||100)/100, hole=c.g.coil?6:0;
  const fx=F.x+hole, fw=F.w-hole, filled=plate==='white'||plate==='round'||plate==='band';
  const tc=t.color||(filled?'#1d1d1f':img?((s.ov||0)>15?'#1d1d1f':(s.ov||0)<-15||((s.art&&s.art.lum)??.5)<.56?'#ffffff':'#1d1d1f'):c.P.ink);
  const left=pos==='left', maxW=(pos==='label'?fw*.62:fw*.78);
  let base=fw*(left?.14:.11)*sc; let lines=String(TV.title||'').split(/\n| \/ /).map(x=>x.trim()).filter(Boolean);
  if(lines.length===1&&lines[0].includes(' ')&&fitSize(lines[0],base,maxW,font,0)<base*.62){ const w=lines[0].split(' '); let best=1,bd=1e9; for(let i=1;i<w.length;i++){ const d=Math.abs(w.slice(0,i).join(' ').length-w.slice(i).join(' ').length); if(d<bd){ bd=d; best=i; } } lines=[w.slice(0,best).join(' '),w.slice(best).join(' ')]; }
  const fsT=Math.min(base,...lines.map(l=>fitSize(l,base,maxW,font,0)));
  const items=lines.map(l=>({t:l,fs:fsT,ff:font,w:700,title:1,ls:0}));
  const sub=String(TV.sub||'').trim(); if(sub) items.push({t:sub.toUpperCase(),fs:fitSize(sub.toUpperCase(),Math.max(fsT*.26,fw*.028),maxW,font2,fsT*.06),ff:font2,w:500,ls:fsT*.06,gap:fsT*.18});
  const own=String(TV.owner||'').trim(); if(own) items.push({t:own,fs:fitSize(own,fw*.042*Math.min(1.2,sc),maxW,font2,0),ff:font2,w:400,gap:fsT*.3});
  const yr=String(TV.year||'').trim(); if(yr&&!left) items.push({t:yr,fs:fw*.032,ff:font2,w:500,ls:fw*.006,gap:fsT*.12,op:.8});
  let H=0; items.forEach(it=>{ H+=(it.gap||0)+it.fs*1.18; });
  let y0=pos==='top'?F.y+F.h*.13:pos==='bottom'?F.y+F.h*.87-H:pos==='label'?F.y+F.h*.33-H/2:left?F.y+F.h*.84-H:F.y+(F.h-H)/2;
  const cx=left?fx+fw*.12:fx+fw/2, anchor=left?'start':'middle';
  const wOf=it=>[...it.t].length*(it.fs*fwOf(it.ff)+(it.ls||0)); const bw=Math.max(...items.map(wOf));
  let o='';
  if(plate!=='none'){ const px=Math.max(fw*.06,fsT*.45), py=Math.max(fsT*.35,4), w=clamp(bw+2*px,fw*.5,fw*.86), x=left?cx-px:cx-w/2, y=y0-py, h=H+2*py;
    if(plate==='band'){ const bx=c.g.wrap?F.x:F.x-c.g.B; o+=R(bx,y,F.w+c.g.B+(c.g.wrap?0:c.g.B),h,'#ffffff','opacity=".9"'); }
    else if(plate==='line') o+=R(x,y,w,h,'none',`stroke="${tc}" stroke-width=".5"`)+R(x+1.2,y+1.2,w-2.4,h-2.4,'none',`stroke="${tc}" stroke-width=".25"`);
    else o+=R(x,y,w,h,'#ffffff',`rx="${plate==='round'?n2(Math.min(h/2,9)):'1.2'}" opacity=".94"`); }
  const foil=t.foil&&FOILS[t.foil], emb=t.emboss||(T.emb&&t.emboss!==false&&!img);
  if(foil) o+=foilDef(c,t.foil);
  let y=y0; items.forEach(it=>{ y+=(it.gap||0); const by=y+it.fs*.9, attrs=`text-anchor="${anchor}" font-family="${ffOf(it.ff)}" font-size="${n2(it.fs)}" font-weight="${it.w}"${it.ls?` letter-spacing="${n2(it.ls)}"`:''}`;
    if(it.title&&emb) o+=`<text x="${n2(cx-.22)}" y="${n2(by-.22)}" ${attrs} fill="#ffffff" opacity=".35">${E(it.t)}</text><text x="${n2(cx+.28)}" y="${n2(by+.28)}" ${attrs} fill="#000000" opacity=".45">${E(it.t)}</text>`;
    o+=`<text x="${n2(cx)}" y="${n2(by)}" ${attrs} fill="${it.title&&foil?`url(#${c.u}foil)`:tc}"${it.op?` opacity="${it.op}"`:''}>${E(it.t)}</text>`; y+=it.fs*1.18; });
  if(left&&yr) o+=`<text x="${n2(cx)}" y="${n2(F.y+F.h*.1-2.5)}" font-family="${ffOf(font2)}" font-size="${n2(fw*.034)}" font-weight="600" fill="${tc}">${E(yr)}</text>`;
  return o; }
function logoMarkup(col,v){ const L=(st.ks&&st.ks.logo)||{}, pc=(st.ks&&st.ks.postcard&&st.ks.postcard.logo)||{};
  try{ if(KS.thSVG) return KS.thSVG({v:v||pc.v||'monoword',txt:L.txt||'tadhayrapetian',sub:pc.sub!=null?pc.sub:'handmade',ini:L.ini||(L.txt&&L.txt!=='tadhayrapetian'?'':'TH'),ff:L.ff||'serif',color:col},{}); }catch(_){ }
  return `<svg viewBox="0 0 100 100" width="100%" height="100%"><text x="50" y="60" text-anchor="middle" font-family="${ffOf('Cormorant Garamond')}" font-size="40" fill="${col}">TH</text></svg>`; }
const LOGO_R={monoword:1,mono:1,crest:1,sig:.6,word:.25,badge:.6,stack:.6};
function nestSVG(markup,x,y,w,h){ const vb=(markup.match(/viewBox="([^"]+)"/)||[])[1]||'0 0 100 100'; return `<svg x="${n2(x)}" y="${n2(y)}" width="${n2(w)}" height="${n2(h)}" viewBox="${vb}" overflow="visible">${markup.replace(/^<svg[^>]*>/,'').replace(/<\/svg>\s*$/,'')}</svg>`; }
function backLayer(c,s,TV,img,T){ const K=c.K, b=s.back||{}, g=c.g, P=c.P; let o='';
  const onImg=img&&s.backArt==='mirror'||img&&s.area==='all', col=onImg?(((s.art&&s.art.lum)??.5)<.56&&(s.ov||0)<=15?'#ffffff':'#1d1d1f'):P.ink;
  const inL=K.x+SAFE+3, inR=K.x+K.w-SAFE-3-(g.coil?6:0), bot=K.y+K.h-Math.max(SAFE+3,(T&&T.bp)||0), w=inR-inL;
  let infoH=0;
  if(b.info){ const i=g.i, line=[fmtName(i),Math.round(i.pages/2)+' л.',i.gsm?i.gsm+' г/м²':''].filter(Boolean).join(' · '), shop=[st.shop&&st.shop.name,st.shop&&st.shop.phone].filter(Boolean).join(' · ');
    o+=`<text x="${n2(inL+w/2)}" y="${n2(bot)}" text-anchor="middle" font-family="${ffOf('Montserrat')}" font-size="${n2(Math.min(2.6,K.w*.019))}" letter-spacing=".25" fill="${col}" opacity=".7">${E(line)}</text>`; infoH=4.5;
    if(shop){ o+=`<text x="${n2(inL+w/2)}" y="${n2(bot-3.6)}" text-anchor="middle" font-family="${ffOf('Montserrat')}" font-size="${n2(Math.min(2.6,K.w*.019))}" fill="${col}" opacity=".7">${E(shop)}</text>`; infoH=8.5; } }
  if(b.logo){ const r=LOGO_R[b.lv||'monoword']||1, lw=Math.min(K.w*(r>=1?.2:.36),r>=1?30:60), lh=lw*r; o+=nestSVG(logoMarkup(col,b.lv),inL+w/2-lw/2,bot-infoH-lh-1,lw,lh); }
  const code=(b.codeText||'').trim();
  if(b.code==='qr'&&code){ const q=Math.min(K.w*.16,24); o+=qrSVG(code,inR-q,bot-q,q,'#111'); }
  if(b.code==='bar'&&code){ const bw=Math.min(K.w*.3,42), bh=bw*.4; o+=R(inL,bot-bh,bw,bh,'#ffffff','rx="1"')+barSVG(code,inL,bot-bh,bw,bh); }
  return o; }
function spineLayer(c,s,TV,T){ const g=c.g; if(!g.spineText||!(s.t&&s.t.spine)) return ''; const S=g.sp, txt=[TV.title,TV.year].filter(x=>String(x||'').trim()).join('   ·   ');
  const font=s.t.font||T.lay.font||'PT Serif', fs=Math.min(S.w*.48,5.5), size=fitSize(txt,fs,S.h*.82,font,fs*.08), up=s.t.dir==='up', cx=S.x+S.w/2, cy=S.y+S.h/2;
  return `<text x="${n2(cx)}" y="${n2(cy)}" transform="rotate(${up?-90:90} ${n2(cx)} ${n2(cy)})" text-anchor="middle" dominant-baseline="central" font-family="${ffOf(font)}" font-size="${n2(size)}" letter-spacing="${n2(size*.08)}" fill="${s.t.color||c.P.ink}">${E(txt)}</text>`; }
function ctxFor(s,g,o){ o=o||{}; const T=tplById(o.tpl||s.tpl), P=palOf(T,o.pal!=null?o.pal:s.pal,o.custom||s), u='nb'+(++UID)+'_';
  const TV=Object.assign(txtVals(s,g),o.T||{}); const img=!o.noImg&&artReady(s);
  return {T,P,u,TV,img,c:{g,P,r:rng(hashStr(T.id)+7),F:g.front,K:g.back,S:g.sp,TW:g.TW,TH:g.TH,thumb:!!o.thumb,ppm:o.thumb?1.2:(o.ppm||4),T:TV,own:T.own&&!(s.t&&s.t.pos)&&!img,font:(s.t&&s.t.font)||T.lay.font,u}}; }
/* outer side of the whole cover (spread coords, mm) */
function compose(s,g,o){ o=o||{}; const X=ctxFor(s,g,o), {T,P,TV,img,c}=X; let out='';
  try{
    if(img){ out+=s.backArt==='tpl'||s.fit==='contain'&&s.area==='all'?T.draw(Object.assign({},c,{own:false})):fillAll(c,P.bg); out+=imageLayer(c,s,g,ARTC.src); }
    else out+=T.draw(c);
    if(!c.own) out+=textLayer(c,s,TV,T,img);
    if(!o.noBack) out+=backLayer(c,s,TV,img,T);
    out+=spineLayer(c,s,TV,T);
  }catch(e){ console.error('[nbcover] compose',e); out+=fillAll(c,P.bg); }
  return out; }
/* inside of the cover (endpapers). Inside-front goes into the back box and vice versa, so a mirrored sheet placement lines up on duplex. */
const INSIDE=[['none','Не печатать'],['tint','Тон цвета'],['pattern','Узор шаблона'],['owner','«Этот блокнот принадлежит»'],['contact','Контакты студии'],['brand','Фирменный TH']];
function composeInside(s,g,o){ o=o||{}; const mode=o.inside||s.inside; const X=ctxFor(s,g,Object.assign({},o,{noImg:true})), {T,P,c}=X, IF=g.back, IB=g.front;
  const light=isDark(P.bg)?mix(P.a,'#ffffff',.86):mix(P.bg,'#ffffff',.55), ink=isDark(P.bg)?mix(P.bg,'#000000',.1):P.ink, f2=ffOf('Montserrat'), f1=ffOf((s.t&&s.t.font)||T.lay.font||'PT Serif');
  let out='';
  try{
    if(mode==='pattern') out+=T.draw(Object.assign({},c,{own:false}));
    else out+=fillAll(c,mode==='tint'||mode==='brand'?light:'#ffffff');
    if(mode==='owner'){ const x=IF.x+IF.w*.14, w=IF.w*.72, y=IF.y+IF.h*.3; out+=`<text x="${n2(IF.x+IF.w/2)}" y="${n2(y)}" text-anchor="middle" font-family="${f1}" font-size="${n2(IF.w*.055)}" fill="${ink}">Этот блокнот принадлежит</text>`;
      ['Имя','Телефон','E-mail'].forEach((l,i)=>{ const yy=y+IF.h*(.1+i*.09); out+=`<text x="${n2(x)}" y="${n2(yy)}" font-family="${f2}" font-size="${n2(IF.w*.024)}" fill="${ink}" opacity=".7">${l}</text>`+PT(`M${n2(x)} ${n2(yy+IF.h*.03)}H${n2(x+w)}`,'none',`stroke="${ink}" stroke-width=".25" opacity=".6"`); });
      out+=`<text x="${n2(IF.x+IF.w/2)}" y="${n2(y+IF.h*.42)}" text-anchor="middle" font-family="${f2}" font-size="${n2(IF.w*.022)}" fill="${ink}" opacity=".65">Если вы нашли его — пожалуйста, верните владельцу</text>`; }
    if(mode==='contact'){ const sh=st.shop||{}, L=[sh.name,sh.phone,sh.addr].filter(Boolean); const cx=IB.x+IB.w/2; out+=`<text x="${n2(cx)}" y="${n2(IB.y+IB.h*.62)}" text-anchor="middle" font-family="${f1}" font-size="${n2(IB.w*.045)}" fill="${ink}">Сделано с любовью</text>`;
      (L.length?L:['Напишите контакты в настройках студии']).forEach((l,i)=>{ out+=`<text x="${n2(cx)}" y="${n2(IB.y+IB.h*(.68+i*.045))}" text-anchor="middle" font-family="${f2}" font-size="${n2(IB.w*.026)}" fill="${ink}" opacity=".75">${E(l)}</text>`; });
      if(sh.phone){ const q=Math.min(IB.w*.18,24); out+=qrSVG('tel:'+String(sh.phone).replace(/[^\d+]/g,''),cx-q/2,IB.y+IB.h*.8,q,'#111'); } }
    if(mode==='brand'||mode==='contact'||mode==='owner'){ const lw=Math.min(IB.w*.2,28); out+=nestSVG(logoMarkup(ink,mode==='brand'?'crest':'monoword'),IB.x+IB.w/2-lw/2,mode==='brand'?IB.y+IB.h/2-lw/2:IB.y+IB.h*.3,lw,lw); }
  }catch(e){ console.error('[nbcover] inside',e); }
  return out; }
function svgWrap(inner,vb,style,extra){ return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${n2(vb.x)} ${n2(vb.y)} ${n2(vb.w)} ${n2(vb.h)}" preserveAspectRatio="none"${style?` style="${style}"`:''}${extra||''}>${inner}</svg>`; }
/* screen-only guides: bleed shading, trim, spine/fold, safe area, punching zone */
function guidesSVG(g){ const B=g.B, trims=g.wrap?[{x:B,y:B,w:g.TW-2*B,h:g.ph}]:[g.back,g.front]; let o='';
  const outer=`M0 0H${n2(g.TW)}V${n2(g.TH)}H0Z`, holes=trims.map(t=>`M${n2(t.x)} ${n2(t.y)}V${n2(t.y+t.h)}H${n2(t.x+t.w)}V${n2(t.y)}Z`).join('');
  o+=PT(outer+holes,'rgba(255,255,255,.55)','fill-rule="evenodd"');
  trims.forEach(t=>{ o+=R(t.x,t.y,t.w,t.h,'none','stroke="#e5484d" stroke-width=".35"'); });
  [g.back,g.front].forEach(t=>{ o+=R(t.x+SAFE,t.y+SAFE,t.w-2*SAFE,t.h-2*SAFE,'none','stroke="#3b82f6" stroke-width=".25" stroke-dasharray="1.4 1.2" opacity=".75"'); });
  if(g.wrap){ const xs=g.spine>0?[g.sp.x,g.sp.x+g.sp.w]:[g.sp.x]; xs.forEach(x=>{ o+=PT(`M${n2(x)} 0V${n2(g.TH)}`,'none','stroke="#7c3aed" stroke-width=".35" stroke-dasharray="2 1.2"'); }); }
  if(g.coil){ const zone=(x,w)=>R(x,g.B,w,g.ph,'rgba(124,58,237,.12)'), hz=6; o+=zone(g.front.x,hz)+zone(g.back.x+g.pw-hz,hz);
    const pitch=g.b==='rings'?Math.min(80,g.ph/3):g.b==='disc'?21:8.47, n=Math.max(2,Math.floor((g.ph-8)/pitch)), y0=g.B+(g.ph-(n-1)*pitch)/2;
    for(let k=0;k<n;k++){ const y=y0+k*pitch, r=g.b==='rings'?2.5:g.b==='disc'?1.8:1.4; o+=C(g.front.x+3.5,y,r,'none','stroke="#7c3aed" stroke-width=".3"')+C(g.back.x+g.pw-3.5,y,r,'none','stroke="#7c3aed" stroke-width=".3"'); } }
  return o; }
function guideLabels(g){ const L=[]; const pct=(x,w)=>({l:x/g.TW*100,w:w/g.TW*100});
  L.push(Object.assign({t:'Оборот'},pct(g.back.x,g.back.w))); if(g.wrap&&g.spine>0) L.push(Object.assign({t:g.spine>=5?'Корешок '+r1n(g.spine)+' мм':r1n(g.spine)+' мм',sp:1},pct(g.sp.x,g.sp.w))); if(g.fold) L.push(Object.assign({t:'Сгиб',sp:1},pct(g.sp.x-6,12))); L.push(Object.assign({t:'Лицо'},pct(g.front.x,g.front.w))); return L; }

/* ================= print sheets ================= */
const SHEETS_={A4:[210,297],A3:[297,420]};
function prMargin(){ try{ const p=KS.printer(); return Math.max(...(p.m||[5,5,5,5])); }catch(_){ return 5; } }
function fitIn(w,h,sw,sh,m){ const u=[sw-2*m,sh-2*m]; if(w<=u[0]&&h<=u[1]) return [sw,sh]; if(w<=u[1]&&h<=u[0]) return [sh,sw]; return null; }
/* plan the outer-side sheets: [{sw,sh,items:[{part,vb,x,y,k}],note}] */
function planSheets(g,s){ const m=prMargin(), A4=SHEETS_.A4, warn=[]; let mode='a4';
  const blocks=g.wrap?[{part:'wrap',vb:panelBox(g,'wrap')}]:[{part:'back',vb:panelBox(g,'back')},{part:'front',vb:panelBox(g,'front')}];
  const mk=(sheet,list,k)=>{ k=k||1; const [sw,sh]=sheet, gap=10, tw=list.reduce((a,b)=>a+b.vb.w*k,0)+gap*(list.length-1), mh=Math.max(...list.map(b=>b.vb.h*k)); let x=(sw-tw)/2; return {sw,sh,items:list.map(b=>{ const it=Object.assign({},b,{x,y:(sh-mh)/2+(mh-b.vb.h*k)/2,k}); x+=b.vb.w*k+gap; return it; })}; };
  if(!g.wrap){ const both=fitIn(blocks[0].vb.w*2+10,blocks[0].vb.h,...A4,m); if(both) return {mode,warn,sheets:[mk(both,blocks)]}; }
  const one=fitIn(blocks[0].vb.w,blocks[0].vb.h,...A4,m);
  if(one) return {mode,warn,sheets:blocks.map(b=>mk(one,[b]))};
  /* does not fit A4 */
  let big=s.big||'a3'; if(big==='tile'&&!g.wrap) big='a3';
  if(big==='a3'){ const s3=fitIn(blocks[0].vb.w*(g.wrap?1:2)+(g.wrap?0:10),blocks[0].vb.h,...SHEETS_.A3,m)||fitIn(blocks[0].vb.w,blocks[0].vb.h,...SHEETS_.A3,m);
    if(s3){ mode='a3'; warn.push('Обложка больше A4 — нужен лист A3 (GX4040 и G3410 печатают только до A4: отдайте файл в типографию или выберите «Плитка»/«Уменьшить»).');
      return {mode,warn,sheets:(fitIn(blocks[0].vb.w*(g.wrap?1:2)+(g.wrap?0:10),blocks[0].vb.h,...SHEETS_.A3,m)?[mk(s3,blocks)]:blocks.map(b=>mk(s3,[b])))}; } big='scale'; }
  if(big==='tile'){ mode='tile'; const ov=8, cut=g.sp.x+g.sp.w/2, L={part:'wrap',vb:{x:0,y:0,w:cut+ov,h:g.TH},glue:cut+ov}, Rr={part:'wrap',vb:{x:cut-ov,y:0,w:g.TW-cut+ov,h:g.TH},glue:cut-ov};
    const sh=fitIn(L.vb.w,L.vb.h,...A4,m)||[A4[1],A4[0]]; warn.push('Плитка: обложка печатается на двух листах A4 с нахлёстом 16 мм — совместите по линии склейки.'); return {mode,warn,sheets:[mk(sh,[Rr]),mk(sh,[L])]}; }
  mode='scale'; const ori=[[A4[1],A4[0]],A4].map(([sw,sh])=>({sw,sh,k:Math.min((sw-2*m)/blocks[0].vb.w,(sh-2*m)/blocks[0].vb.h)})).sort((a,b)=>b.k-a.k)[0];
  warn.push(`Уменьшено до ${Math.round(ori.k*100)}% чтобы влезть в A4 — обложка станет меньше блока. Лучше A3 или плитка.`); return {mode,warn,sheets:blocks.map(b=>mk([ori.sw,ori.sh],[b],ori.k))}; }
function marksSVG(sw,sh,items,g,s,m){ let o=''; const L=(x1,y1,x2,y2,ex)=>{ const cl=(v,a,b)=>Math.max(a,Math.min(b,v)); x1=cl(x1,m,sw-m); x2=cl(x2,m,sw-m); y1=cl(y1,m,sh-m); y2=cl(y2,m,sh-m); if(Math.hypot(x2-x1,y2-y1)<1) return ''; return `<path d="M${n2(x1)} ${n2(y1)}L${n2(x2)} ${n2(y2)}" stroke="#000" stroke-width=".12" fill="none"${ex||''}/>`; };
  items.forEach(it=>{ const k=it.k, vb=it.vb, tx=v=>it.x+(v-vb.x)*k, ty=v=>it.y+(v-vb.y)*k, B=g.B;
    const trims=(it.part==='wrap'?[{x:B,y:B,w:g.TW-2*B,h:g.ph}]:[trimBox(g,it.part)]);
    if(s.marks!==false) trims.forEach(t=>{ const x1=tx(Math.max(t.x,vb.x)), x2=tx(Math.min(t.x+t.w,vb.x+vb.w)), y1=ty(t.y), y2=ty(t.y+t.h), ox=it.x, oy=it.y, ex=it.x+vb.w*k, ey=it.y+vb.h*k;
      if(t.x>=vb.x) o+=L(x1,oy-1.5,x1,oy-6.5)+L(x1,ey+1.5,x1,ey+6.5)+L(ox-1.5,y1,ox-6.5,y1)+L(ox-1.5,y2,ox-6.5,y2);
      if(t.x+t.w<=vb.x+vb.w) o+=L(x2,oy-1.5,x2,oy-6.5)+L(x2,ey+1.5,x2,ey+6.5)+L(ex+1.5,y1,ex+6.5,y1)+L(ex+1.5,y2,ex+6.5,y2); });
    if(it.part==='wrap'&&g.wrap&&s.marks!==false){ (g.spine>0?[g.sp.x,g.sp.x+g.sp.w]:[g.sp.x]).forEach(x=>{ if(x<vb.x||x>vb.x+vb.w) return; const X=tx(x); o+=L(X,it.y-1.5,X,it.y-6.5,' stroke-dasharray="1 .8"')+L(X,it.y+vb.h*k+1.5,X,it.y+vb.h*k+6.5,' stroke-dasharray="1 .8"'); }); }
    if(it.glue!=null){ const X=tx(it.glue); o+=`<path d="M${n2(X)} ${n2(it.y)}V${n2(it.y+vb.h*k)}" stroke="#e5484d" stroke-width=".25" stroke-dasharray="2 1.5" fill="none"/><text x="${n2(X+1)}" y="${n2(it.y+vb.h*k+4)}" font-family="${ffOf('PT Sans')}" font-size="2.4" fill="#e5484d">линия склейки</text>`; } });
  return o; }
const MATS=[['matte','Матовый картон','Матовый картон 250–300 г/м². GX4040: задний лоток, «Плотная бумага».'],['gloss','Глянец','Глянцевый картон или фотобумага 250+ г/м²; можно закатать в глянцевую плёнку.'],['softtouch','Софт-тач','Матовый картон 300 г/м² + ламинация плёнкой софт-тач — бархатистая на ощупь.'],['kraft','Крафт','Крафт-картон: белого нет, светлые цвета пропадут — выбирайте тёмные шаблоны и текст.'],['linen','Дизайнерский (лён)','Дизайнерский картон с тиснением «лён» 250–300 г/м².']];
const matHint=s=>(MATS.find(m=>m[0]===s.mat)||MATS[0])[2];
function pageNote(g,s,what){ return `Обложка · ${bindLine(g)} · ${what} · ${(MATS.find(m=>m[0]===s.mat)||MATS[0])[1].toLowerCase()} 250–300 г/м², задний лоток`; }
/* all print pages for a settings object (outer + optional inside, interleaved for duplex) */
function buildPages(s,o){ o=o||{}; const g=geo(), plan=planSheets(g,s), outer=compose(s,g,o), inner=s.inside&&s.inside!=='none'?composeInside(s,g,o):'', m=prMargin(), P=[];
  const pageOf=(sh,content,mirror,what,idx)=>{ const items=sh.items.map(it=>mirror?Object.assign({},it,{x:sh.sw-it.x-it.vb.w*it.k,vb:Object.assign({},it.vb,{x:g.TW-it.vb.x-it.vb.w}),glue:null}):it);
    let h=items.map(it=>svgWrap(content,it.vb,`position:absolute;left:${n2(it.x)}mm;top:${n2(it.y)}mm;width:${n2(it.vb.w*it.k)}mm;height:${n2(it.vb.h*it.k)}mm;overflow:hidden`)).join('');
    h+=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sh.sw} ${sh.sh}" style="position:absolute;left:0;top:0;width:${sh.sw}mm;height:${sh.sh}mm">${mirror?'':marksSVG(sh.sw,sh.sh,items,g,s,m)}${(()=>{ const yb=Math.max(...items.map(it=>it.y+it.vb.h*it.k)); return yb+9<sh.sh-m?`<text x="${sh.sw/2}" y="${n2(sh.sh-m-1)}" text-anchor="middle" font-family="${ffOf('PT Sans')}" font-size="2.3" fill="#9a9a9a">${E(pageNote(g,s,what))}</text>`:''; })()}</svg>`;
    return KS.page(sh.sw,sh.sh,h,(o.name||'oblozhka')+'-'+idx); };
  plan.sheets.forEach((sh,i)=>{ const what=plan.mode==='tile'?(i?'левая часть':'правая часть'):sh.items.map(it=>({wrap:'развёртка',front:'лицо',back:'оборот'})[it.part]).join(' + ');
    P.push(pageOf(sh,outer,false,what,(i+1)+'')); if(inner) P.push(pageOf(sh,inner,true,'внутренняя сторона',(i+1)+'-vnutri')); });
  P.plan=plan; return P; }
/* ================= pictures, AI, history, my covers, raster, public API ================= */
const loadImg=src=>new Promise((res,rej)=>{ const im=new Image(); im.onload=()=>res(im); im.onerror=()=>rej(new Error('img')); im.src=src; });
async function imgMeta(src){ try{ const im=await loadImg(src), c=document.createElement('canvas'); c.width=24; c.height=24; const g=c.getContext('2d'); g.drawImage(im,0,0,24,24); const d=g.getImageData(0,0,24,24).data; let L=0; for(let k=0;k<d.length;k+=4) L+=(.2126*d[k]+.7152*d[k+1]+.0722*d[k+2])/255; return {w:im.naturalWidth,h:im.naturalHeight,lum:L/(d.length/4)}; }catch(_){ return {w:1000,h:1000,lum:.5}; } }
async function thumbOf(src,max){ try{ const im=await loadImg(src), k=Math.min(1,(max||260)/Math.max(im.naturalWidth,im.naturalHeight)), c=document.createElement('canvas'); c.width=Math.round(im.naturalWidth*k); c.height=Math.round(im.naturalHeight*k); c.getContext('2d').drawImage(im,0,0,c.width,c.height); return c.toDataURL('image/jpeg',.82); }catch(_){ return src; } }
async function artLoad(){ const s=nbcS(); if(!s.art){ return false; } if(ARTC&&ARTC.id===s.art.id) return true; try{ const v=await KS.idb.get('nbc:art','files'); if(v&&v.id===s.art.id&&v.src){ ARTC={id:v.id,src:v.src}; return true; } }catch(_){ } return false; }
async function setArt(src,kind,name,o){ o=o||{}; const m=await imgMeta(src), id=KS.uid('a'); try{ await KS.idb.set('nbc:art',{id,src},'files'); }catch(e){ KS.toast('Не удалось сохранить картинку'); }
  ARTC={id,src}; const s=nbcS(); s.art={id,w:m.w,h:m.h,lum:m.lum,kind,name:name||''}; s.src=kind==='ai'?'ai':'photo'; s.px=50; s.py=50; s.zoom=100; s.fit='cover'; s.area=o.area||'front'; if(o.area==='all') s.backArt='tpl'; save_(); changed(true); }
async function photoFromFile(f){ if(!f) return; if(!/^image\//.test(f.type||'image/')){ KS.toast('Это не картинка'); return; } try{ const src=await KS.readImage(f,3600); await setArt(src,'photo',(f.name||'').replace(/\.[a-z0-9]+$/i,'')); KS.toast('Фото на обложке. Двигайте его ползунками или пальцем на превью.'); }catch(_){ KS.toast('Не удалось открыть фото'); } }

/* ---- AI ---- */
const AI_STYLES=[['watercolor','Акварель','a delicate watercolor painting with soft transparent washes, pigment granulation and visible cold-press paper texture'],['minimal','Минимализм','a refined minimalist design with a few simple shapes, calm negative space and a restrained palette'],['botanic','Ботаника','a vintage botanical illustration of leaves, ferns and flowers with fine detailed linework and soft colour'],['marble','Мрамор','a luxurious polished marble stone surface with elegant flowing veins'],['geo','Геометрия','a bold modern geometric pattern of overlapping circles, triangles and bands, perfectly balanced'],['vintage','Винтаж','a vintage engraved illustration on aged paper with muted retro colours and subtle print grain'],['space','Космос','a dreamy cosmic night sky with soft nebula clouds, stars and a glowing planet'],['japan','Японский стиль','a Japanese woodblock print (ukiyo-e inspired) with stylised waves, clouds and flat colour areas'],['kids','Детский','a cute cheerful children\'s book illustration with rounded friendly characters and soft shapes'],['kraft','Крафт','hand-drawn white and black ink doodles on brown kraft cardboard texture'],['armenia','Ереван / Армения','Armenian motifs: the silhouette of Mount Ararat, pomegranates and apricot blossoms, warm pink tuff-stone colours of Yerevan architecture, with an original ornamental border'],['abstract','Абстракция','an abstract painting with expressive brush strokes, layered colour fields and rich texture'],['photo','Фотореализм','a photorealistic high-end photograph, natural soft light, shallow depth of field'],['line','Линейная графика','elegant continuous single-line art drawing in thin ink on a plain background'],['gouache','Гуашь','a flat matte gouache illustration with simple shapes and visible brush texture'],['pattern','Узор','a seamless decorative repeating pattern, wallpaper style'],['flowers','Цветы','an abundant composition of spring flowers and petals'],['sea','Море','a calm seascape with soft waves, horizon and light reflections'],['mountains','Горы','layered misty mountain ranges at sunrise'],['cats','Котики','charming stylised cats in a cosy setting']];
const AI_MOODS=[['','Авто',''],['pal','Цвета шаблона',''],['pastel','Пастель','soft pastel colours'],['warm','Тёплые','warm terracotta, peach, mustard and cream colours'],['cool','Холодные','cool blues, teal and silver-grey colours'],['mono','Монохром','a monochrome palette, black and white with grey tones'],['bright','Яркие','bright saturated cheerful colours'],['earth','Земляные','earthy olive, sand, rust and brown colours'],['dark','Тёмные с золотом','a deep dark background with elegant gold accents'],['pink','Нежно-розовые','blush pink, rose and ivory colours']];
const MULTI_DEF=['watercolor','minimal','botanic','geo','vintage','japan'];
const NOTEXT='Absolutely NO text of any kind: no letters, no words, no numbers, no titles, no captions, no signatures, no logos, no watermarks — the title will be added later as vector text.';
function aiRatio(r,list){ return list.reduce((a,b)=>Math.abs(Math.log(b[1]/r))<Math.abs(Math.log(a[1]/r))?b:a)[0]; }
function aiAspect(g,s){ const pano=g.wrap&&s.ai.wrap==='pano'; return pano?aiRatio(g.TW/g.TH,[['16:9',16/9],['3:2',1.5],['4:3',4/3],['21:9',21/9]]):aiRatio((g.pw+2*g.B)/g.TH,[['1:1',1],['2:3',2/3],['3:4',.75],['4:5',.8],['9:16',9/16],['3:2',1.5],['4:3',4/3]]); }
function aiPrompt(s,g,styleKeys){ const a=s.ai, st_=(styleKeys||a.styles||[]).map(k=>(AI_STYLES.find(x=>x[0]===k)||[])[2]).filter(Boolean), T=tplById(s.tpl), P=palOf(T,s.pal,s), pano=g.wrap&&a.wrap==='pano';
  const mood=a.mood==='pal'?`a colour palette built from ${P.bg}, ${P.a} and ${P.b}`:(AI_MOODS.find(x=>x[0]===a.mood)||[])[2]||'';
  const body=(a.prompt||'').trim()?a.prompt.trim():[`Artwork for a printed notebook cover: ${st_.length?st_.join('; '):'a beautiful tasteful illustration'}.`,(a.subject||'').trim()?`Subject: ${a.subject.trim()}.`:'',(a.free||'').trim()?`Customer wish (may be in Russian): ${a.free.trim()}.`:''].filter(Boolean).join(' ');
  return [body,mood?`Colours: ${mood}.`:'',pano?'Wide panoramic composition for a wrap-around cover: the RIGHT half is the front cover with the main motif, the LEFT half is the back cover with a quieter continuation, seamless in the middle.':'Composition: keep the upper-middle area calmer and less busy so a title can be placed there later.','Full-bleed artwork that fills the entire frame edge to edge, no borders, no frames, no mockup, no notebook or book object, no hands, flat artwork only, print quality.',NOTEXT].filter(Boolean).join(' '); }
async function aiImprove(){ const s=nbcS(), a=s.ai; if(!(a.free||'').trim()){ KS.toast('Опишите обложку своими словами'); return; } if(!KS.neuro||typeof KS.neuro.text!=='function'){ KS.toast('Улучшение текста недоступно — описание пойдёт как есть'); return; }
  try{ const t=await KS.neuro.text(`You write prompts for an image generation model. Turn this customer wish (it may be in Russian or Armenian) for a printed notebook cover illustration into ONE strong, vivid English image prompt of 40–70 words: describe subject, art style, medium, colours, mood and composition. Do not mention text, titles or lettering. Answer with the prompt only.\n\nWish: ${a.free.trim()}${(a.styles||[]).length?'\nPreferred styles: '+a.styles.join(', '):''}`);
    a.prompt=String(t||'').replace(/^["'\s]+|["'\s]+$/g,'').slice(0,900); save_(); KS.toast('Готово: запрос на английском — можно поправить'); rePanel(); }catch(e){ KS.toast(e.message||'Не получилось'); } }
let AIBUSY=false;
async function aiRun(){ if(AIBUSY) return; if(!KS.neuro){ return; } if(!KS.neuro.hasKey()){ KS.neuro.settings(); return; }
  const s=nbcS(), g=geo(), a=s.ai, aspect=aiAspect(g,s), area=g.wrap&&a.wrap==='pano'?'all':'front';
  AIBUSY=true; rePanel(); paintBusy(true); let res=[];
  try{
    if(a.multi){ const keys=[...new Set([...(a.styles||[]),...MULTI_DEF])].slice(0,4); const R_=await Promise.allSettled(keys.map(k=>KS.neuro.gen(aiPrompt(s,g,[k]),{aspect,n:1}).then(L=>({src:L[0],label:(AI_STYLES.find(x=>x[0]===k)||[])[1]||k}))));
      res=R_.filter(x=>x.status==='fulfilled'&&x.value.src).map(x=>x.value); if(!res.length) throw (R_[0].reason||new Error('ИИ не вернул картинки')); }
    else{ const L=await KS.neuro.gen(aiPrompt(s,g),{aspect,n:clamp(+a.n||1,1,4)}); const lab=(a.styles||[]).map(k=>(AI_STYLES.find(x=>x[0]===k)||[])[1]).filter(Boolean).join(', ')||'ИИ'; res=L.map((src,i)=>({src,label:lab+(L.length>1?' · '+(i+1):'')})); }
    for(const r of res) r.id=await histAdd(r.src,{label:r.label,aspect,area,prompt:aiPrompt(s,g)});
  }catch(e){ KS.toast(e&&e.message||'ИИ не ответил'); }
  AIBUSY=false; paintBusy(false); rePanel(); paintGallery();
  if(!res.length) return; if(res.length===1){ await setArt(res[0].src,'ai',res[0].label,{area}); KS.toast('Обложка от ИИ готова и сохранена в истории'); return; }
  const pick=await aiPick(res); if(pick) await setArt(pick.src,'ai',pick.label,{area}); }
const pickM=KS.modal({id:'nbcPick',title:'Выберите обложку',wide:true});
function aiPick(list){ return new Promise(res=>{ let done=false; const fin=v=>{ if(done) return; done=true; pickM.close(); res(v); };
  pickM.el.innerHTML=`<p class="hint">Все варианты уже сохранены в «ИИ-истории» — их можно взять позже без новой оплаты. Нажмите на понравившийся.</p><div class="nbc-pick">${list.map((r,i)=>`<button class="nbc-pickv" data-nbcpick="${i}"><img src="${r.src}" alt=""><span>${E(r.label)}</span></button>`).join('')}</div>`;
  pickM.el.onclick=e=>{ const b=e.target.closest('[data-nbcpick]'); if(b) fin(list[+b.dataset.nbcpick]); };
  pickM.open(); pickM.root.addEventListener('click',e=>{ if(e.target===pickM.root||e.target.closest('[data-ksclose]')) fin(null); }); }); }
/* history of generated covers (IDB 'files') */
let HIST=null, MY=null;
async function histList(){ if(HIST) return HIST; try{ HIST=(await KS.idb.get('nbc:hist','files'))||[]; }catch(_){ HIST=[]; } return HIST; }
async function histAdd(src,meta){ const L=await histList(), id=KS.uid('h'), thumb=await thumbOf(src,280); try{ await KS.idb.set('nbc:h:'+id,{id,src},'files'); L.unshift(Object.assign({id,thumb,ts:Date.now()},meta)); await KS.idb.set('nbc:hist',L.slice(0,120),'files'); }catch(_){ } return id; }
async function histUse(id){ const L=await histList(), m=L.find(x=>x.id===id); let v=null; try{ v=await KS.idb.get('nbc:h:'+id,'files'); }catch(_){ } if(!v||!v.src){ KS.toast('Картинка не найдена'); return; } const g=geo(); await setArt(v.src,'ai',m&&m.label,{area:m&&m.area==='all'&&g.wrap?'all':'front'}); KS.toast('Взята из истории — бесплатно'); }
async function histDel(id){ const L=await histList(), i=L.findIndex(x=>x.id===id); if(i<0) return; L.splice(i,1); try{ await KS.idb.del('nbc:h:'+id,'files'); await KS.idb.set('nbc:hist',L,'files'); }catch(_){ } paintGallery(); KS.toast('Удалено из истории'); }
/* «Мои обложки»: saved designs */
const SNAPK=['tpl','pal','cbg','cacc','src','art','fit','px','py','zoom','ov','area','backArt','t','back','inside','mat'];
const snapOf=s=>JSON.parse(JSON.stringify(Object.fromEntries(SNAPK.map(k=>[k,s[k]]))));
async function myList(){ if(MY) return MY; try{ MY=(await KS.idb.get('nbc:my','files'))||[]; }catch(_){ MY=[]; } return MY; }
async function mySave(name){ const s=nbcS(), L=await myList(), id=KS.uid('m'), snap=snapOf(s); let thumb='';
  try{ const g=geo(); thumb=(await rasterVB(compose(s,g),trimBox(g,'front'),34)).toDataURL('image/jpeg',.82); }catch(_){ }
  if(artReady(s)) try{ await KS.idb.set('nbc:myart:'+id,{id:s.art.id,src:ARTC.src},'files'); }catch(_){ }
  L.unshift({id,name:(name||'').trim()||('Обложка '+(L.length+1)),thumb,ts:Date.now(),snap}); try{ await KS.idb.set('nbc:my',L.slice(0,80),'files'); }catch(_){ } paintGallery(); KS.toast('Сохранено в «Мои обложки»'); return id; }
async function myLoad(id){ const L=await myList(), m=L.find(x=>x.id===id); if(!m) return; await applySnap(m.snap,'nbc:myart:'+id); KS.toast('Открыта обложка «'+m.name+'»'); }
async function applySnap(snap,artKey){ const s=nbcS(); Object.assign(s,JSON.parse(JSON.stringify(snap||{})));
  if(s.art&&s.src!=='tpl'){ let v=null; try{ v=artKey?await KS.idb.get(artKey,'files'):null; }catch(_){ } if(v&&v.src){ await KS.idb.set('nbc:art',{id:s.art.id,src:v.src},'files'); ARTC={id:s.art.id,src:v.src}; } else if(!(await artLoad())) s.src='tpl'; }
  save_(); changed(true); }
async function myDel(id){ const L=await myList(), i=L.findIndex(x=>x.id===id); if(i<0) return; L.splice(i,1); try{ await KS.idb.del('nbc:myart:'+id,'files'); await KS.idb.set('nbc:my',L,'files'); }catch(_){ } paintGallery(); }

/* ---- raster helpers (app export engine: fonts embedded) ---- */
async function rasterVB(content,vb,dpi){ const p=KS.page(vb.w,vb.h,svgWrap(content,vb,`position:absolute;left:0;top:0;width:${n2(vb.w)}mm;height:${n2(vb.h)}mm`),'cover');
  if(typeof pageCanvas==='function') return await pageCanvas(p,dpi);
  const im=await loadImg('data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svgWrap(content,vb,'',` width="${Math.round(vb.w*dpi/25.4)}" height="${Math.round(vb.h*dpi/25.4)}"`))), c=document.createElement('canvas'); c.width=im.width; c.height=im.height; const g=c.getContext('2d'); g.fillStyle='#fff'; g.fillRect(0,0,c.width,c.height); g.drawImage(im,0,0); return c; }
const cvBlob_=(cv,type,q)=>new Promise((res,rej)=>{ try{ cv.toBlob(b=>b?res(b):rej(new Error('blob')),type||'image/png',q); }catch(e){ rej(e); } });
let SAVED=0, saveT=null, dirty=false;
async function saveCover(quiet){ await artLoad(); const s=nbcS(), g=geo(), content=compose(s,g), dpi=150, j=async part=>(await rasterVB(content,trimBox(g,part),dpi)).toDataURL('image/jpeg',.88);
  try{ const rec={front:await j('front'),back:await j('back'),wrap:g.wrap?await j('wrap'):null,w:n2(g.pw),h:n2(g.ph),spine:n2(g.spine),binding:g.b,tpl:s.tpl,updated:Date.now()};
    await KS.idb.set('nb:cover',rec,'files'); SAVED=rec.updated; dirty=false; KS.emit('nbCoverChanged',rec); if(!quiet) KS.toast('Обложка сохранена для блокнота'); paintSaved(); return rec; }
  catch(e){ if(!quiet) KS.toast('Не удалось сохранить обложку'); return null; } }
function queueSave(){ dirty=true; clearTimeout(saveT); saveT=setTimeout(()=>{ if(dirty) saveCover(true); },3500); }
/* ---- series and personalization ---- */
function seriesVariants(s,n){ const T=tplById(s.tpl), out=[], np=T.pals.length; for(let i=0;i<n;i++){ if(i===0) out.push({pal:s.pal,cbg:s.cbg,cacc:s.cacc}); else if(i<np) out.push({pal:(s.pal+i)%np,cbg:'',cacc:''}); else { const P=palOf(T,s.pal,{}), d=360*(i-np+1)/(n-np+1); out.push({pal:s.pal,cbg:hue(P.bg,d),cacc:hue(P.a,d)}); } } return out; }
const cloneS=()=>JSON.parse(JSON.stringify(nbcS()));
async function seriesPages(n){ await artLoad(); const s=nbcS(), V=seriesVariants(s,clamp(+n||s.series.n||6,2,12)); let P=[]; V.forEach((v,i)=>{ const x=Object.assign(cloneS(),v,{src:'tpl'}); P=P.concat(buildPages(x,{name:'oblozhka-seriya-'+(i+1)})); }); return P; }
const namesOf=t=>String(t||'').split(/\n|;/).map(x=>x.trim()).filter(Boolean).slice(0,300);
async function forName(name,field){ await artLoad(); const x=cloneS(), f=field||x.pers.field||'owner'; x.t[f==='title'?'title':'owner']=String(name||''); return buildPages(x,{name:'oblozhka-'+String(name||'').replace(/[^\wа-яё-]+/gi,'-').slice(0,24)}); }
async function namesPages(){ const s=nbcS(), L=namesOf(s.pers.names); let P=[]; for(const n of L) P=P.concat(await forName(n)); return P; }
/* ================= UI: side panel + work screen ================= */
let BOX=null, SCR=null, lastKey=null, PEND=null;
const getP=(o,p)=>p.split('.').reduce((a,k)=>a==null?a:a[k],o);
const setP=(o,p,v)=>{ const k=p.split('.'), last=k.pop(); const t=k.reduce((a,x)=>(a[x]=a[x]&&typeof a[x]==='object'?a[x]:{}),o); t[last]=v; };
const isOn=()=>!!(BOX&&BOX.isConnected);
function changed(full){ save_(); queueSave(); if(!isOn()) return; if(full) rePanel(); paintStage(); if(full) paintThumbs(); }
const segH=(path,opts,cur,t)=>`<div class="seg nbc-seg">${opts.map(([v,n])=>`<button data-nbs="${path}" data-nbval="${v}"${t?` data-nbty="${t}"`:''}${String(cur)===String(v)?' class="on"':''}>${n}</button>`).join('')}</div>`;
const rngH=(path,label,min,max,val,unit,step)=>`<label class="f nbc-rng"><span>${label}<b data-nbo="${path}">${val}${unit||''}</b></span><input type="range" data-nbk="${path}" data-nbty="n" data-nbu="${unit||''}" min="${min}" max="${max}" step="${step||1}" value="${val}"></label>`;
const chk=(path,label,v)=>`<label class="chk"><input type="checkbox" data-nbk="${path}" data-nbty="b"${v?' checked':''}>${label}</label>`;
const provName=()=>{ try{ return KS.neuro.provider()==='fal'?'fal.ai (FLUX)':'Gemini (Google)'; }catch(_){ return 'ИИ'; } };
const usd=v=>'$'+(v<.1?v.toFixed(3):v.toFixed(2)).replace(/0+$/,'').replace(/\.$/,'');
function keyCard(){ if(!KS.neuro) return ''; const on=!!KS.neuro.hasKey(); lastKey=on;
  return `<div class="card nbc-key${on?' on':''}"><div class="nbc-keyrow"><span class="nbc-keyic">${KS.icon('<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M15 8l2 2"/>')}</span><div class="nbc-keytx"><b>Ключ API · ИИ-обложки</b><small>${on?`<span class="ks-badge ok">Подключено</span> ${E(provName())}`:'<span class="ks-badge warn">Не подключён</span> вставьте ключ Gemini или fal.ai'}</small></div><button class="btn sm${on?'':' primary'}" data-nba="key">${on?'Настроить':'Вставить ключ'}</button></div>${on?`<p class="hint nbc-spend">${KS.neuro.spendLine()}</p>`:'<p class="hint">Ключ хранится только на этом устройстве и не попадает в проекты и резервные копии.</p>'}</div>`; }
function fmtCard(g){ const i=g.i, o=nbcS().own;
  if(i.ext) return `<div class="card nbc-fmt"><div class="hd">Блокнот</div><div class="nbc-fmtl"><b>${E(bindLine(g))}</b><small>${E(sizeLine(g))} · вылеты ${BLEED} мм</small></div><button class="btn sm" data-nba="toBlock">Изменить формат в «Блоке»</button></div>`;
  return `<div class="card nbc-fmt"><div class="hd">Формат блокнота</div><div class="row2"><label class="f">Формат<select data-nbk="own.fmt" data-nbre="1">${NBC_FMTS.map(f=>`<option value="${f[0]}"${o.fmt===f[0]?' selected':''}>${f[1]}</option>`).join('')}</select></label><label class="f">Переплёт<select data-nbk="own.binding" data-nbre="1">${NBC_BINDS.map(b=>`<option value="${b[0]}"${o.binding===b[0]?' selected':''}>${b[1]}</option>`).join('')}</select></label></div>
   <div class="row2"><label class="f">Страниц в блоке<input type="number" min="8" max="800" step="4" data-nbk="own.pages" data-nbty="n" data-nbre="1" value="${o.pages}"></label><label class="f">Бумага блока, г/м²<input type="number" min="60" max="200" step="5" data-nbk="own.gsm" data-nbty="n" data-nbre="1" value="${o.gsm}"></label></div>
   <p class="hint">${E(sizeLine(g))}. Когда открыта вкладка «Блок», формат берётся оттуда.</p></div>`; }
function imgCtl(s,g){ return `<div class="nbc-imgctl">${segH('fit',[['cover','Заполнить'],['contain','Целиком']],s.fit)}
  ${rngH('px','Сдвиг ← →',0,100,s.px,'%')}${rngH('py','Сдвиг ↑ ↓',0,100,s.py,'%')}${rngH('zoom','Масштаб',100,300,s.zoom,'%',5)}${rngH('ov','Затемнить ↔ Осветлить',-70,70,s.ov,'')}
  <div class="hd2">Картинка на</div>${segH('area',[['front','Только лицо'],['all','Всю обложку']],s.area)}
  ${s.area!=='all'?`<div class="hd2">Оборот</div>${segH('backArt',[['tpl','Узор шаблона'],['color','Цвет фона'],['mirror','Продолжить картинку']],s.backArt)}`:''}
  <div class="flexw"><span class="hint">Картинку можно двигать пальцем прямо на превью.</span><button class="btn sm" data-nba="noart">Убрать картинку</button></div></div>`; }
function aiCtl(s,g){ if(!KS.neuro) return '<p class="hint">Модуль ИИ не подключён к этой сборке.</p>'; const a=s.ai, on=KS.neuro.hasKey(), aspect=aiAspect(g,s), n=a.multi?4:clamp(+a.n||1,1,4), price=+KS.neuro.price()||.04;
  return `${on?'':`<div class="ks-empty">Для ИИ-обложек нужен ключ. <button class="btn sm primary" data-nba="key">Вставить ключ</button></div>`}
  <div class="hd2">Стиль <small>можно несколько</small></div><div class="nbc-chips">${AI_STYLES.map(([k,nm])=>`<button class="nbc-chip${(a.styles||[]).includes(k)?' on':''}" data-aistyle="${k}">${nm}</button>`).join('')}</div>
  <label class="f">Что изобразить<input type="text" data-nbk="ai.subject" value="${E(a.subject)}" placeholder="лисичка в лесу, гранатовое дерево, кофе и книги…"></label>
  <div class="hd2">Цвета</div><div class="nbc-chips">${AI_MOODS.map(([k,nm])=>`<button class="nbc-chip${a.mood===k?' on':''}" data-nbs="ai.mood" data-nbval="${k}">${nm}</button>`).join('')}</div>
  <details class="nbc-free"${(a.free||a.prompt)?' open':''}><summary>Своими словами</summary><textarea rows="3" data-nbk="ai.free" placeholder="Например: нежная обложка для мамы — пионы, утренний свет, много воздуха">${E(a.free)}</textarea>
   <div class="flexw"><button class="btn sm" data-nba="aiImprove"${on&&KS.neuro.text?'':' disabled'}>Сделать сильный запрос (ИИ)</button>${a.prompt?'<button class="btn sm" data-nba="aiClear">Сбросить</button>':''}</div>${a.prompt?`<label class="f">Запрос для картинки (можно править)<textarea rows="4" data-nbk="ai.prompt">${E(a.prompt)}</textarea></label>`:''}</details>
  ${g.wrap?`<div class="hd2">Для развёртки</div>${segH('ai.wrap',[['front','Рисовать лицо'],['pano','Панорама на всю обложку']],a.wrap)}`:''}
  <div class="nbc-airow">${segH('ai.multi',[['false','Варианты одного стиля'],['true','4 стиля сразу']],!!a.multi,'b')}${a.multi?'':`<label class="f nbc-n">Вариантов<select data-nbk="ai.n" data-nbty="n" data-nbre="1">${[1,2,3,4].map(v=>`<option${+a.n===v?' selected':''}>${v}</option>`).join('')}</select></label>`}</div>
  <div class="nbc-cost"><span>Пропорции ${aspect} · без текста — надпись добавится векторно</span><b>≈ ${usd(price*n)} за ${n} ${n===1?'картинку':'картинки'}</b></div>
  <button class="btn primary nbc-go" data-nba="aiGo"${on&&!AIBUSY?'':' disabled'}>${AIBUSY?'ИИ рисует…':'Создать обложку'}</button>
  <details class="nbc-pv"><summary>Посмотреть запрос</summary><p class="hint">${E(aiPrompt(s,g,a.multi?[(a.styles||[])[0]||'watercolor']:null))}</p></details>`; }
function paneBase(s,g){ const T=tplById(s.tpl), hasAI=!!KS.neuro, src=s.src==='ai'&&!hasAI?'photo':s.src;
  let h=`<div class="card"><div class="hd">Основа обложки</div>${segH('src',[['tpl','Шаблон'],['photo','Своё фото']].concat(hasAI?[['ai','ИИ-обложка']]:[]),src)}`;
  if(src==='tpl'){ h+=`<div class="nbc-cur"><b>${E(T.n)}</b><small>${E(T.cat)} · все ${NBC_TPL.length} шаблонов — внизу экрана</small></div><div class="hd2">Палитра</div><div class="nbc-pals">${T.pals.map((p,i)=>`<button class="nbc-pal${s.pal===i&&!s.cbg&&!s.cacc?' on':''}" data-nbp="${i}" title="Палитра ${i+1}"><i style="background:${p[0]}"></i><i style="background:${p[2]}"></i><i style="background:${p[3]||p[1]}"></i></button>`).join('')}</div>
    <div class="nbc-cust"><label>Свой фон<input type="color" data-nbk="cbg" value="${palOf(T,s.pal,s).bg}"></label><label>Свой акцент<input type="color" data-nbk="cacc" value="${palOf(T,s.pal,s).a}"></label>${s.cbg||s.cacc?'<button class="btn sm" data-nba="resetCol">Сбросить</button>':''}</div>`; }
  if(src==='photo'){ h+=`<div class="ks-drop nbc-drop" data-nba="pick">${s.art&&s.art.kind==='photo'&&ARTC?`<img src="${ARTC.src}" alt="">`:'<b>Перетащите фото сюда</b><span>или нажмите, чтобы выбрать</span>'}</div><div class="flexw"><button class="btn sm" data-nba="pick">Выбрать файл</button>${KS.photos?'<button class="btn sm" data-nba="lib">Из фотобиблиотеки</button>':''}</div>`; if(s.art&&artReady(s)) h+=imgCtl(s,g); }
  if(src==='ai'){ h+=aiCtl(s,g); if(s.art&&s.art.kind==='ai'&&artReady(s)) h+=`<div class="hd2">Настройка картинки</div>`+imgCtl(s,g); }
  h+=`</div><div class="card"><div class="hd">Материал обложки</div>${segH('mat',MATS.map(m=>[m[0],m[1]]),s.mat)}<p class="hint">${E(matHint(s))}</p></div>`; return h; }
function paneText(s,g){ const t=s.t, T=tplById(s.tpl), font=t.font||T.lay.font, TV=txtVals(s,g);
  const pos=[['','Как в шаблоне'],['top','Сверху'],['center','Центр'],['bottom','Снизу'],['label','Плашка'],['left','Слева'],['none','Без текста']], pl=[['','Как в шаблоне'],['none','Нет'],['white','Белая'],['round','Овальная'],['line','Рамка'],['band','Лента']];
  const cols=['#ffffff','#1d1d1f','#b08d57',palOf(T,s.pal,s).a,'#8a1c2b','#1f3a5f'];
  return `<div class="card"><div class="hd">Надписи</div>
   <label class="f">Заголовок <small>перенос строки — через « / »</small><input type="text" data-nbk="t.title" value="${E(t.title)}" placeholder="${E(TV.title)}" maxlength="60"></label>
   <label class="f">Подзаголовок<input type="text" data-nbk="t.sub" value="${E(t.sub)}" placeholder="заметки, рецепты, путешествия…" maxlength="60"></label>
   <div class="row2"><label class="f">Владелец<input type="text" data-nbk="t.owner" value="${E(t.owner)}" placeholder="${E(g.i.owner||'Анна')}" maxlength="40"></label><label class="f">Год<input type="text" data-nbk="t.year" value="${E(t.year)}" placeholder="${E(g.i.year||String(new Date().getFullYear()))}" maxlength="12"></label></div>
   ${T.own&&!t.pos?'<p class="hint">У этого шаблона свой макет надписей. Выберите положение ниже, чтобы поставить свой текст.</p>':''}</div>
  <div class="card"><div class="hd">Шрифт и цвет</div><label class="f">Шрифт<select data-nbk="t.font" data-nbre="1"><option value="">Как в шаблоне (${E(T.lay.font)})</option>${nbcFonts().map(f=>`<option value="${E(f)}"${t.font===f?' selected':''} style="font-family:${E(ffOf(f))}">${E(f)}</option>`).join('')}</select></label>
   ${rngH('t.size','Размер',50,170,t.size||100,'%',5)}
   <div class="hd2">Цвет текста</div><div class="nbc-cols"><button class="nbc-col auto${!t.color?' on':''}" data-nbs="t.color" data-nbval="">Авто</button>${cols.map(c=>`<button class="nbc-col${t.color===c?' on':''}" data-nbs="t.color" data-nbval="${c}" style="background:${c}" title="${c}"></button>`).join('')}<input type="color" data-nbk="t.color" value="${t.color||'#1d1d1f'}" title="Свой цвет"></div>
   <div class="hd2">Фольга для заголовка</div>${segH('t.foil',Object.entries(FOILN),t.foil||'')}
   ${chk('t.emboss','Тиснение (объём букв)',!!t.emboss)}</div>
  <div class="card"><div class="hd">Положение</div>${segH('t.pos',pos,t.pos||'')}<div class="hd2">Подложка под текст</div>${segH('t.plate',pl,t.plate||'')}</div>
  <div class="card"><div class="hd">Корешок</div>${g.spineText?`${chk('t.spine','Надпись на корешке',t.spine!==false)}${segH('t.dir',[['down','Сверху вниз'],['up','Снизу вверх']],t.dir||'down')}<p class="hint">Корешок ${r1n(g.spine)} мм — название и год встанут вдоль.</p>`:`<p class="hint">${g.wrap&&!g.fold?`Корешок ${r1n(g.spine)} мм — для надписи нужно от 5 мм (больше страниц или плотнее бумага).`:'У этого переплёта нет корешка для надписи.'}</p>`}</div>`; }
function paneBack(s,g){ const b=s.back; return `<div class="card"><div class="hd">Задняя обложка</div>${chk('back.logo','Логотип студии TH',b.logo)}
   ${b.logo?`<label class="f">Вид логотипа<select data-nbk="back.lv">${[['monoword','Монограмма и имя'],['mono','Монограмма'],['crest','Медальон'],['word','Надпись'],['sig','Подпись'],['badge','Плашка']].map(([k,n])=>`<option value="${k}"${b.lv===k?' selected':''}>${n}</option>`).join('')}</select></label>`:''}
   ${chk('back.info','Строка «формат · листов · плотность» и контакты',b.info)}
   <div class="hd2">Код на обороте</div>${segH('back.code',[['none','Нет'],['qr','QR-код'],['bar','Штрихкод']],b.code)}
   ${b.code!=='none'?`<label class="f">${b.code==='qr'?'Ссылка или текст':'Цифры (EAN-13 или любой код)'}<input type="text" data-nbk="back.codeText" value="${E(b.codeText)}" placeholder="${b.code==='qr'?'https://instagram.com/…':'4601234567893'}"></label>`:''}</div>
  <div class="card"><div class="hd">Внутренняя сторона обложки (форзац)</div><select data-nbk="inside" data-nbre="1">${INSIDE.map(([k,n])=>`<option value="${k}"${s.inside===k?' selected':''}>${n}</option>`).join('')}</select>
   <p class="hint">${s.inside==='none'?'Обложка печатается с одной стороны.':KS.printer().duplex==='auto'?'Печать с двух сторон: включите двустороннюю печать, переплёт по длинному краю (для альбомного листа — по короткому).':'G3410 печатает оборот вручную — программа подскажет, как перевернуть лист.'}</p>
   <div class="nbc-inside">${insideThumb(s,g)}</div></div>`; }
function insideThumb(s,g){ if(s.inside==='none') return ''; const c=composeInside(s,g); const vb=g.wrap?panelBox(g,'wrap'):panelBox(g,'back'); return svgWrap(c,{x:vb.x,y:vb.y,w:g.wrap?vb.w:panelBox(g,'back').w+panelBox(g,'front').w,h:vb.h},'display:block;width:100%;height:auto;aspect-ratio:'+n2((g.wrap?vb.w:vb.w*2)/vb.h)); }
function panePrint(s,g){ let P=null; try{ P=buildPages(s); }catch(e){ P=[]; P.plan={warn:['Ошибка раскладки: '+e.message],sheets:[]}; } const plan=P.plan, fitsA4=plan.mode==='a4';
  const names=namesOf(s.pers.names);
  return `<div class="card nbc-hintc"><div class="hd">Как печатать</div><p class="hint"><b>${E((MATS.find(m=>m[0]===s.mat)||MATS[0])[1])}.</b> ${E(matHint(s))}</p><p class="hint">Принтер: ${E(KS.printer().n||'')} · поля ${prMargin()} мм — вылеты и метки реза входят в лист.</p></div>
  <div class="card"><div class="hd">Лист печати</div><p class="hint">${P.length} ${P.length===1?'страница':P.length<5?'страницы':'страниц'} · ${plan.mode==='a4'?'A4':plan.mode==='a3'?'A3':plan.mode==='tile'?'A4, плиткой':'A4, уменьшено'}${s.inside!=='none'?' · с внутренней стороной':''}</p>
   ${plan.warn.map(w=>`<div class="nbc-warn">${E(w)}</div>`).join('')}
   ${!fitsA4||s.big!=='a3'&&!fitsA4?`<div class="hd2">Если не влезает в A4</div>${segH('big',[['a3','Лист A3'],['tile','Плитка (2 × A4)'],['scale','Уменьшить']],s.big)}`:''}
   ${chk('marks','Метки реза и корешка',s.marks!==false)}
   <div class="nbc-btns"><button class="btn primary" data-nba="print">${KS.icon('<path d="M6 9V3h12v6"/><rect x="4" y="9" width="16" height="8" rx="2"/><path d="M7 14h10v7H7z"/>')}Печать обложки</button><button class="btn" data-nba="pdf">Скачать PDF</button><button class="btn" data-nba="png">Скачать PNG</button><button class="btn" data-nba="mock">Мокап PNG</button></div>
   ${PEND?`<div class="nbc-step"><b>Шаг 2 из 2.</b> Достаньте отпечатанные листы, переверните стопку лицом вниз, верхним краем к принтеру и положите обратно в задний лоток. <button class="btn sm primary" data-nba="printInner">Печать внутренней стороны</button></div>`:''}
   <div class="nbc-saverow"><button class="btn sm" data-nba="saveNb">Сохранить для блокнота</button><span class="hint" data-saved>${SAVED?'Сохранено '+new Date(SAVED).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'}):'Сохраняется автоматически'}</span></div></div>
  <div class="card"><div class="hd">Серия обложек</div><p class="hint">Один дизайн — набор цветов: например, 6 блокнотов разных цветов для витрины или подарка.</p>
   <div class="ks-row"><label class="f grow">Цветов в серии<select data-nbk="series.n" data-nbty="n" data-nbre="1">${[2,3,4,5,6,8,10,12].map(v=>`<option${+s.series.n===v?' selected':''}>${v}</option>`).join('')}</select></label>${chk('series.on','Показать',!!s.series.on)}</div>
   <div class="flexw"><button class="btn sm" data-nba="serPrint">Печать серии</button><button class="btn sm" data-nba="serPdf">PDF серии</button></div>${s.src!=='tpl'?'<p class="hint">Серия делается из шаблона и его палитр (без фото).</p>':''}</div>
  <div class="card"><div class="hd">Именные обложки по списку</div><textarea rows="4" data-nbk="pers.names" data-nbre="0" placeholder="Анна&#10;Давид&#10;Мария">${E(s.pers.names)}</textarea>
   <div class="hd2">Имя вписать в</div>${segH('pers.field',[['owner','Строку «владелец»'],['title','Заголовок']],s.pers.field)}
   <div class="flexw"><button class="btn sm" data-nba="namesPrint"${names.length?'':' disabled'}>Печать на всех${names.length?' ('+names.length+')':''}</button><button class="btn sm" data-nba="namesPdf"${names.length?'':' disabled'}>PDF на всех</button></div></div>
  <div class="card"><div class="hd">Мои обложки</div><div class="ks-row"><input type="text" class="grow" id="nbcMyName" placeholder="Название, например «Пионы для Ани»" maxlength="40"><button class="btn sm" data-nba="mySave">Сохранить</button></div><p class="hint">Сохранённые дизайны — во вкладке «Мои обложки» внизу экрана.</p></div>`; }
function rePanel(){ if(!isOn()) return; const s=nbcS(), g=geo(), tab=s.panel||'base';
  KS.keepFocus(BOX,()=>{ BOX.innerHTML=`<div class="nbc-panel">${keyCard()}${fmtCard(g)}${segH('panel',[['base','Основа'],['text','Текст'],['back','Оборот'],['print','Печать']],tab)}<div class="nbc-pane">${tab==='text'?paneText(s,g):tab==='back'?paneBack(s,g):tab==='print'?panePrint(s,g):paneBase(s,g)}</div></div>`; }); }
const paintSaved=()=>{ const el=BOX&&BOX.querySelector('[data-saved]'); if(el&&SAVED) el.textContent='Сохранено '+new Date(SAVED).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'}); };

/* ---- screen ---- */
function paintScreen(){ if(!SCR) return; const s=nbcS(), g=geo();
  SCR.innerHTML=`<div class="nbc-head"><div><h2>Обложка блокнота</h2><p class="hint" data-nbchead>${E(bindLine(g))} · ${E(sizeLine(g))}</p></div><div class="nbc-headr"><div class="seg nbc-views">${[['flat','Развёртка'],['3d','3D-макет'],['sheet','Лист печати']].map(([k,n])=>`<button data-nbv="${k}"${s.view===k?' class="on"':''}>${n}</button>`).join('')}</div></div></div>
  <div class="nbc-stage" data-stage></div><div class="nbc-gal" data-gal></div>`; paintStage(); paintGallery(); }
let paintQ=0;
function paintStage(){ if(!SCR||SCR.hidden) return; cancelAnimationFrame(paintQ); paintQ=requestAnimationFrame(()=>{ try{ paintStageNow(); }catch(e){ console.error('[nbcover] paint',e); } }); }
function paintStageNow(){ const el=SCR&&SCR.querySelector('[data-stage]'); if(!el) return; const s=nbcS(), g=geo(); const hd=SCR.querySelector('[data-nbchead]'); if(hd) hd.textContent=bindLine(g)+' · '+sizeLine(g);
  if(s.art&&s.src!=='tpl'&&!artReady(s)){ artLoad().then(ok=>{ if(ok) paintStage(); }); }
  el.dataset.sv=s.view; el.innerHTML=s.view==='3d'?stage3D(g,s):s.view==='sheet'?stageSheets(s):stageFlat(g,s); }
function stageFlat(g,s){ const vb={x:0,y:0,w:g.TW,h:g.TH}, r=g.TW/g.TH, content=compose(s,g);
  let h=`<div class="nbc-flat"><div class="nbc-flatin" style="--r:${n2(r)}"><div class="nbc-lbls">${guideLabels(g).map(l=>`<span class="${l.sp?'sp':''}" style="left:${n2(l.l)}%;width:${n2(l.w)}%">${E(l.t)}</span>`).join('')}</div>
   <div class="nbc-paper${artReady(s)?' img':''}" data-paper>${svgWrap(content,vb,'display:block;width:100%;height:100%')}${s.guides?svgWrap(guidesSVG(g),vb,'position:absolute;inset:0;width:100%;height:100%;pointer-events:none'):''}${AIBUSY?'<div class="nbc-busy"><span>ИИ рисует обложку…</span></div>':''}</div></div>
   <div class="nbc-legend"><label class="chk"><input type="checkbox" data-nbk="guides" data-nbty="b"${s.guides?' checked':''}>Направляющие</label>${s.guides?`<span><i class="lg-trim"></i>обрез</span><span><i class="lg-bleed"></i>вылет ${BLEED} мм</span><span><i class="lg-safe"></i>без важного текста</span>${g.wrap?'<span><i class="lg-sp"></i>'+(g.fold?'сгиб':'корешок')+'</span>':''}${g.coil?'<span><i class="lg-hole"></i>перфорация</span>':''}`:''}</div></div>`;
  if(s.series&&s.series.on){ const V=seriesVariants(s,clamp(+s.series.n||6,2,12)), fb=trimBox(g,'front'); h+=`<div class="nbc-series">${V.map((v,i)=>{ const x=Object.assign(cloneS(),v,{src:'tpl'}); return `<figure>${svgWrap(compose(x,g,{noBack:true}),fb,`display:block;width:100%;aspect-ratio:${n2(fb.w/fb.h)}`)}<figcaption>${i+1}</figcaption></figure>`; }).join('')}</div>`; }
  return h; }
function stage3D(g,s){ const content=compose(s,g), k=Math.min(250/g.pw,320/g.ph), W=g.pw*k, H=g.ph*k, T=Math.max(7,(g.thick+.8)*k);
  const face=(vb,cls,st_)=>`<div class="nbc-face ${cls}" style="${st_}">${vb?svgWrap(content,vb,'display:block;width:100%;height:100%'):''}<i class="nbc-sheen"></i></div>`;
  let f=face(trimBox(g,'front'),'fr',`width:${W}px;height:${H}px;transform:translateZ(${n2(T/2)}px)`)+face(trimBox(g,'back'),'bk',`width:${W}px;height:${H}px;transform:rotateY(180deg) translateZ(${n2(T/2)}px)`);
  const spineVb=g.wrap&&g.spine>0?{x:g.sp.x,y:g.B,w:g.spine,h:g.ph}:null;
  f+=spineVb?face(spineVb,'sp',`width:${n2(T)}px;height:${H}px;left:${n2((W-T)/2)}px;transform:rotateY(-90deg) translateZ(${n2(W/2)}px)`):`<div class="nbc-face pg pgv${g.fold?' fold':''}" style="width:${n2(T)}px;height:${H}px;left:${n2((W-T)/2)}px;transform:rotateY(-90deg) translateZ(${n2(W/2)}px)${g.fold?';background:'+palOf(tplById(s.tpl),s.pal,s).bg:''}"></div>`;
  f+=`<div class="nbc-face pg pgv" style="width:${n2(T)}px;height:${H}px;left:${n2((W-T)/2)}px;transform:rotateY(90deg) translateZ(${n2(W/2-1)}px)"></div><div class="nbc-face pg pgh" style="width:${W}px;height:${n2(T)}px;top:${n2((H-T)/2)}px;transform:rotateX(90deg) translateZ(${n2(H/2-1)}px)"></div><div class="nbc-face pg pgh" style="width:${W}px;height:${n2(T)}px;top:${n2((H-T)/2)}px;transform:rotateX(-90deg) translateZ(${n2(H/2-1)}px)"></div>`;
  if(g.coil){ const pitch=g.b==='rings'?Math.min(80,g.ph/3):g.b==='disc'?21:8.47, n=Math.max(2,Math.floor((g.ph-8)/pitch)), y0=(g.ph-(n-1)*pitch)/2, D=Math.sqrt(Math.pow(3.5*k,2)+Math.pow(T/2,2))*2+(g.b==='rings'?16:g.b==='disc'?10:7);
    for(let i=0;i<n;i++){ const y=(y0+i*pitch)*k; const one=dy=>`<i class="nbc-coil c-${g.b}" style="width:${n2(D)}px;height:${n2(D)}px;left:${n2(-D/2+1.2*k)}px;top:${n2(y-D/2+dy)}px"></i>`; f+=g.b==='wireo'?one(-1.6)+one(1.6):one(0); } }
  if(g.b==='staple'){ [.28,.72].forEach(p=>{ f+=`<i class="nbc-staple" style="top:${n2(H*p-6)}px;left:${n2(-1)}px;transform:rotateY(-90deg) translateZ(1px)"></i>`; }); }
  return `<div class="nbc-3dwrap"><div class="nbc-3d" data-drag3d><div class="nbc-shadow" style="width:${n2(W*1.05)}px"></div><div class="nbc-book mat-${s.mat}" data-book style="width:${n2(W)}px;height:${n2(H)}px;transform:rotateX(${s.rx}deg) rotateY(${s.ry}deg)">${f}</div></div>
   <div class="nbc-3dbar"><div class="seg">${[['Лицо',-6,-8],['¾',-12,-30],['Корешок',-8,-78],['Оборот',-6,172]].map(([n,x,y])=>`<button data-nban="${x},${y}">${n}</button>`).join('')}</div><span class="hint">Крутите макет мышкой или пальцем · материал: ${E((MATS.find(m=>m[0]===s.mat)||MATS[0])[1].toLowerCase())}</span><button class="btn sm" data-nba="mock">Скачать мокап PNG</button></div></div>`; }
function stageSheets(s){ let P=[]; try{ P=buildPages(s); }catch(e){ return `<div class="ks-empty">Не получилось разложить: ${E(e.message)}</div>`; } const px=3.7795, Hh=300;
  return `${P.plan.warn.map(w=>`<div class="nbc-warn">${E(w)}</div>`).join('')}<div class="nbc-sheets">${P.map((p,i)=>{ const sc=Hh/(p.ph*px); return `<figure class="nbc-sheet"><div class="nbc-sheetbox" style="width:${n2(p.pw*px*sc)}px;height:${Hh}px"><div style="width:${p.pw}mm;height:${p.ph}mm;transform:scale(${sc.toFixed(4)});transform-origin:0 0">${p.html}</div></div><figcaption>${i+1}. ${/vnutri/.test(p.name)?'внутренняя сторона':'лицевая сторона'} · ${p.pw===297&&p.ph===420||p.pw===420?'A3':'A4'}</figcaption></figure>`; }).join('')}</div>`; }
function paintBusy(){ if(isOn()) paintStage(); }
/* gallery */
let thObs=null;
async function paintGallery(){ const el=SCR&&SCR.querySelector('[data-gal]'); if(!el) return; const s=nbcS(), g=geo(), tab=s.gtab||'tpl', H=await histList(), M=await myList(), r=n2(g.pw/g.ph);
  const tabs=`<div class="nbc-galhd"><div class="seg">${[['tpl','Шаблоны · '+NBC_TPL.length],['hist','ИИ-история · '+H.length],['my','Мои обложки · '+M.length]].map(([k,n])=>`<button data-nbgt="${k}"${tab===k?' class="on"':''}>${n}</button>`).join('')}</div>${tab==='tpl'?`<div class="nbc-cats"><button class="nbc-chip${!s.gcat?' on':''}" data-nbgc="">Все</button>${TPL_CATS.map(c=>`<button class="nbc-chip${s.gcat===c?' on':''}" data-nbgc="${c}">${c}</button>`).join('')}</div>`:''}</div>`;
  let body='';
  if(tab==='tpl') body=`<div class="nbc-grid">${NBC_TPL.filter(t=>!s.gcat||t.cat===s.gcat).map(t=>`<button class="nbc-tc${t.id===s.tpl&&s.src==='tpl'?' on':''}" data-nbt="${t.id}"><span class="nbc-tth" data-tth="${t.id}" style="aspect-ratio:${r}"></span><b>${E(t.n)}</b><small>${E(t.cat)}</small></button>`).join('')}</div>`;
  if(tab==='hist') body=H.length?`<div class="nbc-grid hist">${H.map(h=>`<div class="nbc-hc"><button class="nbc-hcimg" data-nbh="${h.id}" title="Взять на обложку"><img src="${h.thumb}" alt=""></button><div class="nbc-hcb"><small>${E(h.label||'ИИ')} · ${new Date(h.ts).toLocaleDateString('ru-RU')}</small><button class="btn sm" data-nbh="${h.id}">Взять</button><button class="btn sm icon" data-nbhd="${h.id}" title="Удалить">✕</button></div></div>`).join('')}</div>`:`<div class="ks-empty">Здесь появятся все обложки, нарисованные ИИ. Их можно взять снова бесплатно.${KS.neuro?' Откройте «Основа → ИИ-обложка».':''}</div>`;
  if(tab==='my') body=M.length?`<div class="nbc-grid hist">${M.map(m=>`<div class="nbc-hc"><button class="nbc-hcimg" data-nbm="${m.id}"><img src="${m.thumb||''}" alt=""></button><div class="nbc-hcb"><small>${E(m.name)}</small><button class="btn sm" data-nbm="${m.id}">Открыть</button><button class="btn sm icon" data-nbmd="${m.id}" title="Удалить">✕</button></div></div>`).join('')}</div>`:'<div class="ks-empty">Сохраняйте удачные дизайны: «Печать → Мои обложки → Сохранить». Потом их можно открыть одним нажатием.</div>';
  el.innerHTML=tabs+body; paintThumbs(); }
function paintThumbs(){ if(!SCR) return; if(thObs) thObs.disconnect(); const s=nbcS(), g=geo(), fb=trimBox(g,'front');
  thObs=new IntersectionObserver(es=>es.forEach(en=>{ if(!en.isIntersecting) return; const el=en.target; thObs.unobserve(el); const id=el.dataset.tth;
    try{ const x=Object.assign(cloneS(),{tpl:id,pal:id===s.tpl?s.pal:0,cbg:id===s.tpl?s.cbg:'',cacc:id===s.tpl?s.cacc:'',src:'tpl'}); el.innerHTML=svgWrap(compose(x,g,{thumb:true,noBack:true}),fb,'display:block;width:100%;height:100%'); }catch(e){ el.textContent=''; } }),{root:SCR,rootMargin:'400px'});
  SCR.querySelectorAll('[data-tth]').forEach(el=>{ el.innerHTML=''; thObs.observe(el); }); }

/* ---- actions ---- */
async function doPrint(P,label){ if(!P||!P.length) return; const inner=P.filter(p=>/vnutri/.test(p.name)), outer=P.filter(p=>!/vnutri/.test(p.name)), manual=KS.printer().duplex!=='auto';
  if(inner.length&&manual){ PEND=inner; KS.print(outer); KS.toast('Шаг 1: печатаются лицевые стороны. Потом нажмите «Печать внутренней стороны».'); rePanel(); return; }
  KS.print(P); KS.toast((label||'Обложка')+': '+P.length+' стр. · '+matHint(nbcS()).split('.')[0]+(inner.length?' · включите двустороннюю печать':'')); }
async function doPDF(P,name){ if(!P||!P.length) return; if(typeof exportPDF!=='function'){ KS.print(P); return; } KS.toast('Готовлю PDF…'); try{ await exportPDF(P.map((p,i)=>Object.assign({},p,{name:i?p.name:(name||p.name)})),300,()=>{}); }catch(e){ KS.toast('Не удалось сохранить PDF'); } }
async function doPNG(){ await artLoad(); const s=nbcS(), g=geo(), c=compose(s,g), files=g.wrap?[['oblozhka-razvertka.png',panelBox(g,'wrap')]]:[['oblozhka-lico.png',panelBox(g,'front')],['oblozhka-oborot.png',panelBox(g,'back')]];
  KS.toast('Готовлю PNG 300 dpi…'); try{ for(const [n,vb] of files){ const b=await cvBlob_(await rasterVB(c,vb,300),'image/png'); await KS.download(n,b); } KS.toast('PNG с вылетами 3 мм сохранён'); }catch(e){ KS.toast('Не удалось сделать PNG'); } }
async function mockupCanvas(){ await artLoad(); const s=nbcS(), g=geo(), c=compose(s,g), fr=await rasterVB(c,trimBox(g,'front'),110), W=1800, H=1350, cv=document.createElement('canvas'); cv.width=W; cv.height=H; const x=cv.getContext('2d');
  const bg=x.createLinearGradient(0,0,0,H); bg.addColorStop(0,'#f1efeb'); bg.addColorStop(1,'#dcd8d1'); x.fillStyle=bg; x.fillRect(0,0,W,H);
  const bh=1000, bw=bh*g.pw/g.ph, th=Math.max(14,(g.thick+.8)*bh/g.ph); x.save(); x.translate(W/2,H/2+20); x.rotate(-.11);
  for(let i=0;i<14;i++){ const e=i*5; x.fillStyle='rgba(40,30,20,.028)'; x.beginPath(); x.roundRect?x.roundRect(-bw/2+26-e,-bh/2+46-e,bw+2*e,bh+2*e,10+e):x.rect(-bw/2+26-e,-bh/2+46-e,bw+2*e,bh+2*e); x.fill(); }
  for(let i=4;i>=1;i--){ x.fillStyle=i%2?'#f7f5f0':'#ece8e0'; x.fillRect(-bw/2+i*th/4,-bh/2+i*th/4,bw-6,bh-6); }
  x.fillStyle='rgba(0,0,0,.12)'; x.fillRect(-bw/2+bw-6,-bh/2+th,th,bh-th);
  x.drawImage(fr,-bw/2,-bh/2,bw,bh);
  const sh=x.createLinearGradient(-bw/2,-bh/2,bw/2,bh/2), m=s.mat; if(m==='gloss'){ sh.addColorStop(0,'rgba(255,255,255,0)'); sh.addColorStop(.42,'rgba(255,255,255,.04)'); sh.addColorStop(.5,'rgba(255,255,255,.38)'); sh.addColorStop(.58,'rgba(255,255,255,.04)'); sh.addColorStop(1,'rgba(255,255,255,0)'); } else { sh.addColorStop(0,'rgba(255,255,255,'+(m==='softtouch'?.1:.06)+')'); sh.addColorStop(1,'rgba(0,0,0,'+(m==='softtouch'?.1:.06)+')'); }
  x.fillStyle=sh; x.fillRect(-bw/2,-bh/2,bw,bh); if(m==='kraft'){ x.globalCompositeOperation='multiply'; x.fillStyle='rgba(200,162,122,.35)'; x.fillRect(-bw/2,-bh/2,bw,bh); x.globalCompositeOperation='source-over'; }
  if(g.wrap&&!g.fold){ const sg=x.createLinearGradient(-bw/2,0,-bw/2+28,0); sg.addColorStop(0,'rgba(0,0,0,.35)'); sg.addColorStop(1,'rgba(0,0,0,0)'); x.fillStyle=sg; x.fillRect(-bw/2,-bh/2,28,bh); }
  if(g.coil){ const k=bh/g.ph, pitch=(g.b==='rings'?Math.min(80,g.ph/3):g.b==='disc'?21:8.47)*k, n=Math.max(2,Math.floor((bh-8*k)/pitch)), y0=-bh/2+(bh-(n-1)*pitch)/2;
    for(let i=0;i<n;i++){ const y=y0+i*pitch; x.fillStyle='rgba(0,0,0,.55)'; x.beginPath(); x.arc(-bw/2+3.5*k,y,g.b==='rings'?2.6*k:1.5*k,0,7); x.fill();
      const mg=x.createLinearGradient(-bw/2-20,0,-bw/2+20,0); mg.addColorStop(0,'#6b6f76'); mg.addColorStop(.5,'#f3f4f6'); mg.addColorStop(1,'#8a8f97'); x.strokeStyle=g.b==='disc'?'#2b2b2b':mg; x.lineWidth=g.b==='rings'?9:g.b==='disc'?10:5; x.lineCap='round';
      const ls=g.b==='wireo'?[-3,3]:[0]; ls.forEach(d=>{ x.beginPath(); x.ellipse(-bw/2+1*k,y+d,(g.b==='rings'?7:4.5)*k,(g.b==='rings'?4:2.4)*k,-.25,Math.PI*.5,Math.PI*1.75); x.stroke(); }); } }
  x.restore(); return cv; }
async function doMock(){ KS.toast('Готовлю мокап…'); try{ const b=await cvBlob_(await mockupCanvas(),'image/png'); await KS.download('bloknot-mokap.png',b); KS.toast('Мокап сохранён'); }catch(e){ console.warn('[nbcover] mockup',e); KS.toast('Не удалось сделать мокап'); } }
const libM=KS.modal({id:'nbcLib',title:'Фото из библиотеки',wide:true});
async function openLib(){ let L=[]; try{ L=await KS.photos.list(); }catch(_){ } libM.el.innerHTML=L.length?`<div class="nbc-grid hist">${L.slice(0,200).map(p=>`<button class="nbc-hcimg" data-libph="${E(p.id)}"><img src="${p.thumb||p.data}" alt=""></button>`).join('')}</div>`:'<div class="ks-empty">В фотобиблиотеке пока пусто. Добавьте фото в разделе «Фото».</div>'; libM.open(); }
libM.el.addEventListener('click',async e=>{ const b=e.target.closest('[data-libph]'); if(!b) return; try{ const p=await KS.photos.get(b.dataset.libph); if(p&&p.data){ libM.close(); await setArt(p.data,'photo',p.name); } }catch(_){ KS.toast('Не удалось взять фото'); } });

async function act(a,el){ const s=nbcS();
  if(a==='key'){ KS.neuro&&KS.neuro.settings(); return; }
  if(a==='toBlock'){ const b=document.querySelector('[data-kssub^="notebook:"]:not([data-kssub="notebook:nbcover"])'); if(b) b.click(); else KS.toast('Формат задаётся во вкладке «Блок»'); return; }
  if(a==='pick'){ const f=await KS.pick('image/*'); await photoFromFile(f[0]); return; }
  if(a==='lib'){ openLib(); return; }
  if(a==='noart'){ s.src='tpl'; save_(); changed(true); return; }
  if(a==='resetCol'){ s.cbg=''; s.cacc=''; changed(true); return; }
  if(a==='aiGo'){ aiRun(); return; }
  if(a==='aiImprove'){ el.disabled=true; el.textContent='Пишу запрос…'; await aiImprove(); return; }
  if(a==='aiClear'){ s.ai.prompt=''; changed(true); return; }
  if(a==='print'){ await artLoad(); doPrint(buildPages(s)); saveCover(true); return; }
  if(a==='printInner'){ const P=PEND; PEND=null; rePanel(); if(P) KS.print(P); return; }
  if(a==='pdf'){ await artLoad(); doPDF(buildPages(s),'oblozhka-bloknota'); return; }
  if(a==='png'){ doPNG(); return; }
  if(a==='mock'){ doMock(); return; }
  if(a==='saveNb'){ saveCover(false); return; }
  if(a==='serPrint'){ doPrint(await seriesPages(s.series.n),'Серия'); return; }
  if(a==='serPdf'){ doPDF(await seriesPages(s.series.n),'oblozhki-seriya'); return; }
  if(a==='namesPrint'){ doPrint(await namesPages(),'Именные обложки'); return; }
  if(a==='namesPdf'){ doPDF(await namesPages(),'oblozhki-imennye'); return; }
  if(a==='mySave'){ const i=BOX.querySelector('#nbcMyName'); await mySave(i&&i.value); if(i) i.value=''; s.gtab='my'; save_(); paintGallery(); return; } }
function onInput(e,commit){ const el=e.target, k=el.dataset&&el.dataset.nbk; if(!k) return; const s=nbcS(); let v=el.type==='checkbox'?el.checked:el.value; if(el.dataset.nbty==='n') v=+v;
  setP(s,k,v); const o=BOX&&BOX.querySelector(`[data-nbo="${k}"]`); if(o) o.textContent=v+(el.dataset.nbu||'');
  if((k==='t.color'||k==='cbg'||k==='cacc')&&el.type==='color'&&commit){ changed(true); return; }
  if(el.dataset.nbre==='1'||(el.type==='checkbox'&&k!=='guides')) { if(commit||el.type==='checkbox'||el.tagName==='SELECT') changed(true); return; }
  if(k==='guides'){ save_(); paintStage(); return; }
  if(k==='pers.names'){ save_(); if(commit) rePanel(); return; }
  if(k==='ai.free'||k==='ai.prompt'||k==='ai.subject'){ save_(); return; }
  if(k.startsWith('t.')&&commit===false) paintThumbsSoon();
  changed(false); }
let thT=0; const paintThumbsSoon=()=>{ clearTimeout(thT); thT=setTimeout(paintThumbs,700); };
function bindPanel(box){ if(box.dataset.nbc) return; box.dataset.nbc='1';
  box.addEventListener('click',e=>{ const t=e.target; let b;
    if((b=t.closest('[data-nbs]'))){ const s=nbcS(); let v=b.dataset.nbval; if(b.dataset.nbty==='b') v=v==='true'; if(b.dataset.nbty==='n') v=+v; setP(s,b.dataset.nbs,v); if(b.dataset.nbs==='panel'){ save_(); rePanel(); return; } if(b.dataset.nbs==='src'&&v!=='tpl'&&s.art&&((v==='ai')===(s.art.kind==='ai'))){ artLoad().then(()=>changed(true)); return; } changed(true); return; }
    if((b=t.closest('[data-nbp]'))){ const s=nbcS(); s.pal=+b.dataset.nbp; s.cbg=''; s.cacc=''; changed(true); return; }
    if((b=t.closest('[data-aistyle]'))){ const s=nbcS(), k=b.dataset.aistyle, L=s.ai.styles||(s.ai.styles=[]), i=L.indexOf(k); if(i>=0) L.splice(i,1); else L.push(k); if(L.length>4) L.shift(); save_(); rePanel(); return; }
    if((b=t.closest('[data-nba]'))){ e.preventDefault(); act(b.dataset.nba,b); } });
  box.addEventListener('input',e=>onInput(e,false)); box.addEventListener('change',e=>onInput(e,true));
  box.addEventListener('dragover',e=>{ const d=e.target.closest('.nbc-drop'); if(d){ e.preventDefault(); d.classList.add('over'); } });
  box.addEventListener('dragleave',e=>{ const d=e.target.closest('.nbc-drop'); if(d) d.classList.remove('over'); });
  box.addEventListener('drop',e=>{ const d=e.target.closest('.nbc-drop'); if(!d) return; e.preventDefault(); d.classList.remove('over'); const f=e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files[0]; photoFromFile(f); }); }
function bindScreen(scr){ if(scr.dataset.nbc) return; scr.dataset.nbc='1';
  scr.addEventListener('click',async e=>{ const t=e.target, s=nbcS(); let b;
    if((b=t.closest('[data-nbv]'))){ s.view=b.dataset.nbv; save_(); scr.querySelectorAll('[data-nbv]').forEach(x=>x.classList.toggle('on',x===b)); paintStage(); return; }
    if((b=t.closest('[data-nbgt]'))){ s.gtab=b.dataset.nbgt; save_(); paintGallery(); return; }
    if((b=t.closest('[data-nbgc]'))){ s.gcat=b.dataset.nbgc; save_(); paintGallery(); return; }
    if((b=t.closest('[data-nbt]'))){ s.tpl=b.dataset.nbt; s.pal=0; s.cbg=''; s.cacc=''; s.src='tpl'; save_(); changed(true); scr.querySelectorAll('[data-nbt]').forEach(x=>x.classList.toggle('on',x===b)); return; }
    if((b=t.closest('[data-nbhd]'))){ histDel(b.dataset.nbhd); return; }
    if((b=t.closest('[data-nbh]'))){ histUse(b.dataset.nbh); return; }
    if((b=t.closest('[data-nbmd]'))){ myDel(b.dataset.nbmd); return; }
    if((b=t.closest('[data-nbm]'))){ myLoad(b.dataset.nbm); return; }
    if((b=t.closest('[data-nban]'))){ const [x,y]=b.dataset.nban.split(',').map(Number); s.rx=x; s.ry=y; save_(); const bk=scr.querySelector('[data-book]'); if(bk){ bk.style.transition='transform .6s cubic-bezier(.2,.8,.2,1)'; bk.style.transform=`rotateX(${x}deg) rotateY(${y}deg)`; setTimeout(()=>{ bk.style.transition=''; },650); } return; }
    if((b=t.closest('[data-nba]'))){ act(b.dataset.nba,b); } });
  scr.addEventListener('change',e=>{ if(e.target.dataset.nbk) onInput(e,true); });
  /* drag: rotate the 3D book, or move the picture on the flat preview */
  let D=null;
  scr.addEventListener('pointerdown',e=>{ const s=nbcS(), r3=e.target.closest('[data-drag3d]'), pp=e.target.closest('[data-paper]');
    if(r3){ D={k:'3d',x:e.clientX,y:e.clientY,rx:s.rx,ry:s.ry,el:r3.querySelector('[data-book]')}; }
    else if(pp&&artReady(s)&&s.fit==='cover'){ const r=pp.getBoundingClientRect(); D={k:'img',x:e.clientX,y:e.clientY,px:s.px,py:s.py,w:r.width,h:r.height}; }
    else return; e.preventDefault(); try{ e.target.setPointerCapture(e.pointerId); }catch(_){ } });
  scr.addEventListener('pointermove',e=>{ if(!D) return; const s=nbcS(), dx=e.clientX-D.x, dy=e.clientY-D.y;
    if(D.k==='3d'){ s.ry=Math.round(D.ry+dx*.5); s.rx=clamp(Math.round(D.rx-dy*.35),-70,70); if(D.el) D.el.style.transform=`rotateX(${s.rx}deg) rotateY(${s.ry}deg)`; }
    else { s.px=clamp(Math.round(D.px-dx/D.w*160),0,100); s.py=clamp(Math.round(D.py-dy/D.h*160),0,100); paintStage(); } });
  const up=()=>{ if(!D) return; const k=D.k; D=null; save_(); if(k==='img'){ queueSave(); rePanel(); } };
  scr.addEventListener('pointerup',up); scr.addEventListener('pointercancel',up); }

/* ---- registration ---- */
KS.tab({id:'nbcover',title:'Обложка',seg:'Обложка',group:'notebook',groupTitle:'Блокноты',groupIcon:KS.icon(NBC_ICON),icon:KS.icon(NBC_ICON),app:'print',before:'prep',screen:true,
  render(box,o){ if(o.reason==='show'||!isOn()||BOX!==box||!box.querySelector('.nbc-panel')){ BOX=box; bindPanel(box); if(o.screen){ SCR=o.screen; bindScreen(SCR); }
      rePanel(); paintScreen(); artLoad().then(ok=>{ if(ok&&isOn()){ rePanel(); paintStage(); } }); return; }
    if(KS.neuro&&KS.neuro.hasKey()!==lastKey) rePanel(); }});
KS.on('nbChanged',()=>{ queueSave(); if(isOn()&&KS.active()&&KS.active().id==='nbcover'){ rePanel(); paintStage(); paintThumbs(); } });
KS.on('neuroKey',()=>{ if(isOn()) rePanel(); });
KS.on('photosChanged',()=>{});
const openCover=()=>KS.show('notebook','nbcover');
KS.cmd('Обложка для блокнота','обложка',openCover);
KS.cmd('Обложка блокнота: ИИ-генератор','обложка',()=>{ const s=nbcS(); s.panel='base'; s.src=KS.neuro?'ai':'tpl'; save_(); openCover(); });
KS.nbCover={
  pages:async()=>{ await artLoad(); return buildPages(nbcS()); },
  forName:(name,field)=>forName(name,field),
  series:n=>seriesPages(n),
  snapshot:()=>snapOf(nbcS()),
  load:snap=>applySnap(snap,null),
  save:()=>saveCover(true),
  thumb:async(dpi)=>{ await artLoad(); const g=geo(); return (await rasterVB(compose(nbcS(),g),trimBox(g,'front'),dpi||40)).toDataURL('image/jpeg',.85); },
  mockup:async()=>(await mockupCanvas()).toDataURL('image/png'),
  geo:()=>{ const g=geo(); return {w:g.pw,h:g.ph,spine:g.spine,wrap:g.wrap,binding:g.b,bleed:g.B}; },
  open:openCover, templates:()=>NBC_TPL.map(t=>({id:t.id,name:t.n,cat:t.cat})) };
