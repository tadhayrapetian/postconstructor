KS.mod('igcover',{title:'Instagram: обложки'});
/* ===== igcover — «Instagram → Обложки»: covers for several Instagram pages, own fonts, Gemini backgrounds from a reference ===== */
const IGC={on:false, sel:null, slide:0, hist:[], fut:[], fonts:{}, img:new Map(), thumbs:new Map(), busy:'', gen:null, vars:[], ideas:null, ideasBusy:false, refSel:null, dirty:0, fontsTried:false};
const E=s=>KS.esc(String(s==null?'':s));
const q=(s,r)=>(r||document).querySelector(s), qa=(s,r)=>[...(r||document).querySelectorAll(s)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const I=p=>KS.icon(p);
const clone=o=>JSON.parse(JSON.stringify(o));
const uid=p=>KS.uid(p||'c');
const r1=v=>Math.round(v*10)/10;
const plural=(n,a,b,c)=>{ n=Math.abs(n)%100; const m=n%10; return n>10&&n<20?c:m>1&&m<5?b:m===1?a:c; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const usd=v=>{ v=+v||0; return '$'+(v>0&&v<.1?v.toFixed(3):v.toFixed(2)).replace('.',','); };

/* ---- icons for the UI (24×24 stroke) ---- */
const IC={
  ig:'<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".9" fill="currentColor" stroke="none"/>',
  plus:'<path d="M12 5v14M5 12h14"/>', up:'<path d="M12 19V5M6 11l6-6 6 6"/>', down:'<path d="M12 5v14M6 13l6 6 6-6"/>',
  dl:'<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>', trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  dup:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  undo:'<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>', redo:'<path d="M15 14l5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/>',
  spark:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
  font:'<path d="M4 20L10 4h1l6 16M6.5 14h8"/><path d="M17 20v-6.5a2.5 2.5 0 0 1 5 0V20M17 16.5h5"/>',
  img:'<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
  feed:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  save:'<path d="M5 3h11l3 3v15H5z"/><path d="M8 3v6h8M8 21v-7h8v7"/>', gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  left:'<path d="M15 6l-6 6 6 6"/>', right:'<path d="M9 6l6 6-6 6"/>', x:'<path d="M6 6l12 12M18 6L6 18"/>', check:'<path d="M5 12.5l4.5 4.5L19 7"/>',
  text:'<path d="M5 6V4h14v2M12 4v16M9 20h6"/>', shape:'<circle cx="8" cy="8" r="4.5"/><rect x="11" y="11" width="9" height="9" rx="2"/>',
  smile:'<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5c1 1.2 2.1 1.8 3.5 1.8s2.5-.6 3.5-1.8M9 9.5v.01M15 9.5v.01"/>',
  eyeoff:'<path d="M3 3l18 18"/><path d="M10.6 5.1A10.4 10.4 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3 3.9M6.6 6.6C3.6 8.4 2 12 2 12s3.6 7 10 7c1.6 0 3-.4 4.3-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  layers:'<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>', eye:'<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  wand:'<path d="M4 20L16 8M14 6l2-2 4 4-2 2z"/><path d="M8 4v2M7 5h2M19 14v2M18 15h2"/>', grid3:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 9h16M4 15h16"/>',
  hash:'<path d="M5 9h14M5 15h14M10 4L8 20M16 4l-2 16"/>', at:'<circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/>',
  lbl:'<rect x="3" y="8" width="18" height="8" rx="4"/>', sub:'<path d="M4 8h16M4 13h11M4 18h8"/>', title:'<path d="M4 5h16M12 5v15"/>',
  bulb:'<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>',
  book:'<path d="M3 5.5C3 4.7 3.7 4 4.5 4H10c1.1 0 2 .9 2 2v14c0-1.1-.9-2-2-2H3zM21 5.5c0-.8-.7-1.5-1.5-1.5H14c-1.1 0-2 .9-2 2v14c0-1.1.9-2 2-2h7z"/>',
  zones:'<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M6 7h12M6 17h12" stroke-dasharray="2 2"/>', open:'<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  edit:'<path d="M4 20l1-4L16 5a2.1 2.1 0 0 1 3 3L8 19z"/>'
};

/* ---- formats (all 1080 px wide) ---- */
const FMT={
  post:{n:'Пост 4:5',s:'Пост 4:5',W:1080,H:1350,ar:'4:5'},
  square:{n:'Квадрат 1:1',s:'Квадрат',W:1080,H:1080,ar:'1:1'},
  reel:{n:'Обложка Reels / Stories 9:16',s:'Reels 9:16',W:1080,H:1920,ar:'9:16'},
  carousel:{n:'Карусель',s:'Карусель',W:1080,H:1350,ar:'4:5'},
  hl:{n:'Обложки Highlights',s:'Highlights',W:1080,H:1920,ar:'9:16'}
};
const dimsOf=doc=>{ if(!doc) return [1080,1350]; if(doc.fmt==='carousel') return doc.car==='1:1'?[1080,1080]:[1080,1350]; const f=FMT[doc.fmt]||FMT.post; return [f.W,f.H]; };
const arOf=doc=>doc.fmt==='carousel'?(doc.car==='1:1'?'1:1':'4:5'):(FMT[doc.fmt]||FMT.post).ar;

/* ---- page kinds with sensible defaults ---- */
const COLKEYS=[['bg','Фон'],['ink','Текст'],['accent','Акцент'],['accent2','Маркер'],['soft','Мягкий']];
const KINDS={
  shop:{n:'Типография',handle:'th.studio.yvn',col:{bg:'#F4EDE2',ink:'#2D241D',accent:'#8F1F1C',accent2:'#E9CF9A',soft:'#E2D3BC'},fonts:{title:'Cormorant Garamond',text:'Montserrat'},bg:{k:'tpl',id:'paper'}},
  en:{n:'Английский',handle:'english.with.th',col:{bg:'#FFFDF6',ink:'#1D2B4F',accent:'#FF5A4E',accent2:'#FFE066',soft:'#DCE8F7'},fonts:{title:'Rubik',text:'Manrope'},bg:{k:'tpl',id:'grid'}},
  other:{n:'Новая страница',handle:'my.page',col:{bg:'#F6F3FF',ink:'#231B3B',accent:'#6C4CF5',accent2:'#B8F2D8',soft:'#E4DCFF'},fonts:{title:'Unbounded',text:'Golos Text'},bg:{k:'tpl',id:'mesh'}}
};
const SERIES=[['lesson','Lesson N'],['wotd','Word of the day'],['mistakes','Common mistakes'],['phrasal','Phrasal verbs'],['idioms','Idioms'],['grammar','Grammar']];

const DEF={v:1,page:'',pages:[],fonts:[],ui:{bgTab:'tpl',ai:'ref',nvar:2,zones:true,type:'jpg',topic:''}};
let seeding=false;
function S(){ const s=KS.store('igcover',DEF); if(!Array.isArray(s.pages)) s.pages=[]; if(!Array.isArray(s.fonts)) s.fonts=[]; if(!s.ui||typeof s.ui!=='object') s.ui=clone(DEF.ui);
  if(!s.pages.length&&!seeding){ seeding=true; try{ const ib=(st.ks&&st.ks.insta&&st.ks.insta.brand)||{}; const a=newPage('shop',{name:'Типография',handle:String(ib.handle||KINDS.shop.handle).replace(/^@/,'')}), b=newPage('en',{});
      s.pages.push(a,b); s.page=b.id; KS.save(); } finally{ seeding=false; } }
  if(s.pages.length&&!s.pages.some(p=>p.id===s.page)) s.page=s.pages[0].id; return s; }
const PG=()=>{ const s=S(); return s.pages.find(p=>p.id===s.page)||s.pages[0]; };
function newPage(kind,o){ const K=KINDS[kind]||KINDS.other; const p={id:uid('pg'),kind,name:o.name||K.n,handle:o.handle||K.handle,col:clone(K.col),fonts:clone(K.fonts),series:{},refs:[],bgs:[],tpls:[],fmt:'post',work:{}};
  p.work.main=newDoc(p,'post'); p.work.hl=newHL(p); return p; }
/* the working design of the page: main (post / square / reel / carousel) or the highlights set */
const isHL=()=>{ const p=PG(); return !!(p&&p.fmt==='hl'); };
function D(){ const p=PG(); if(!p) return null; if(!p.work||typeof p.work!=='object') p.work={}; if(!p.work.main) p.work.main=newDoc(p,'post'); if(!p.work.hl) p.work.hl=newHL(p);
  if(p.fmt==='hl') return p.work.hl; const d=p.work.main; if(d.fmt!==p.fmt&&FMT[p.fmt]) convertFmt(d,p.fmt); return d; }
const SL=()=>{ const d=D(); if(!d) return null; if(!Array.isArray(d.slides)||!d.slides.length) d.slides=[{id:uid('s'),els:[]}]; IGC.slide=clamp(IGC.slide,0,d.slides.length-1); if(d.fmt!=='carousel'&&d.fmt!=='hl') IGC.slide=0; return d.slides[IGC.slide]; };
const elById=id=>{ const s=SL(); return s&&s.els.find(e=>e.id===id)||null; };
const selEl=()=>IGC.sel?elById(IGC.sel):null;
const visibleSlides=d=>d.fmt==='carousel'||d.fmt==='hl'?d.slides:d.slides.slice(0,1);

/* ---- default content ---- */
function T(role,text,o){ return Object.assign({id:uid('e'),t:'text',role,text,x:90,y:100,w:900,h:120,font:'',size:60,weight:ROLEW[role]||500,color:'ink',acc:'accent',align:'center',case:'none',ls:0,lh:1.12,fit:false,fx:{},op:1,rot:0},o||{}); }
const ROLEW={title:800,subtitle:500,label:700,number:800,handle:500,custom:500};
const ROLE_N={title:'Заголовок',subtitle:'Подзаголовок',label:'Метка',number:'Номер',handle:'@ник',custom:'Текст'};
const TITLE_ROLES=new Set(['title','number']);
function defaultEls(p,fmt,H){ H=H||(FMT[fmt]||FMT.post).H; const k=H/1350, en=p.kind==='en';
  const cy=H*.43;
  return [
    T('label',en?'LESSON {num}':'НОВИНКА',{y:Math.round(H*.17),h:70,size:34,ls:.14,case:'upper',color:'bg',fx:{pill:'accent'}}),
    T('title',en?'Phrasal verbs\nwith **GET**':'Конверты\nс **сургучом**',{y:Math.round(cy-210*k),h:Math.round(420*k),size:en?128:136,lh:1.02,fit:true,fx:en?{hl:'accent2'}:{}}),
    T('subtitle',en?'5 фраз на каждый день':'ручная работа · Ереван',{y:Math.round(cy+250*k),h:80,size:46,color:'ink',op:.85}),
    T('handle','@{handle}',{y:Math.round(H-150),h:56,size:32,ls:.04,op:.75})]; }
function newDoc(p,fmt){ const H=(FMT[fmt]||FMT.post).H; return {id:uid('d'),fmt:fmt==='hl'?'post':fmt,car:'4:5',bg:clone((KINDS[p.kind]||KINDS.other).bg),dim:0,wash:0,num:1,series:'',slides:[{id:uid('s'),kind:'cover',els:defaultEls(p,fmt,H)}]}; }
const HLSETS={en:[['Уроки','book'],['Слова','txt:Aa'],['Грамматика','pencil'],['Тесты','check'],['Отзывы','chat']],shop:[['Конверты','mail'],['Открытки','heart'],['Печати','stamp'],['Цены','tag'],['Отзывы','chat']],other:[['Новое','star'],['Отзывы','chat'],['Цены','tag'],['Вопросы','question'],['Контакты','pin']]};
function hlSlide(name,icon){ return {id:uid('s'),name,els:[
  {id:uid('e'),t:'shape',k:'circle',x:230,y:650,w:620,h:620,color:'soft',op:1,rot:0},
  {id:uid('e'),t:'icon',k:icon,x:400,y:730,w:280,h:280,color:'accent',sw:1.7,op:1,rot:0},
  T('custom','{name}',{x:260,y:1050,w:560,h:80,size:58,weight:700,color:'ink',lh:1,fit:true})]}; }
function newHL(p){ return {id:uid('d'),fmt:'hl',bg:{k:'tpl',id:'solid'},dim:0,wash:0,num:1,slides:(HLSETS[p.kind]||HLSETS.other).map(([n,i])=>hlSlide(n,i))}; }
/* switching between post / square / reel / carousel keeps the design: vertical positions scale with the height */
function convertFmt(d,fmt){ const [,H0]=dimsOf(d); d.fmt=fmt; const [,H1]=dimsOf(d); if(H0===H1) return; const k=H1/H0;
  d.slides.forEach(s=>s.els.forEach(e=>{ const cy=e.y+e.h/2; e.y=Math.round(cy*k-e.h/2); if(e.y<0) e.y=0; if(e.y+e.h>H1) e.y=Math.max(0,H1-e.h); })); }

/* ---- colours ---- */
const col=(v,p)=>{ p=p||PG(); if(!v) return p.col.ink; if(p.col[v]) return p.col[v]; if(v==='white') return '#FFFFFF'; if(v==='black') return '#111111'; return v; };
const hex2rgb=h=>{ h=String(h||'').replace('#',''); if(h.length===3) h=h.split('').map(c=>c+c).join(''); const n=parseInt(h.slice(0,6),16); return isNaN(n)?[0,0,0]:[n>>16&255,n>>8&255,n&255]; };
const rgb2hex=(r,g,b)=>'#'+[r,g,b].map(v=>clamp(Math.round(v),0,255).toString(16).padStart(2,'0')).join('').toUpperCase();
const lum=h=>{ const [r,g,b]=hex2rgb(h); return (.299*r+.587*g+.114*b)/255; };
const mix=(a,b,t)=>{ const A=hex2rgb(a),B=hex2rgb(b); return rgb2hex(A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t,A[2]+(B[2]-A[2])*t); };
const rgba=(h,a)=>{ const [r,g,b]=hex2rgb(h); return `rgba(${r},${g},${b},${a})`; };
const isHex=v=>/^#[0-9a-f]{6}$/i.test(String(v||''));
function nearestKey(hex,p){ const lab=h=>{ const f=v=>{ v/=255; return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4); }, [r,g,b]=hex2rgb(h).map(f), x=(r*.4124+g*.3576+b*.1805)/.95047, y=r*.2126+g*.7152+b*.0722, z=(r*.0193+g*.1192+b*.9505)/1.08883, t=v=>v>.008856?Math.cbrt(v):7.787*v+16/116; return [116*t(y)-16,500*(t(x)-t(y)),200*(t(y)-t(z))]; };
  const a=lab(hex); let best='ink',bv=1e9; COLKEYS.forEach(([k])=>{ const b=lab(p.col[k]); const d=Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]); if(d<bv){ bv=d; best=k; } }); return best; }

/* ---- seeded random ---- */
const rng=seed=>{ let s=(typeof seed==='string'?[...seed].reduce((a,c)=>Math.imul(a^c.charCodeAt(0),16777619),2166136261):seed)>>>0||1; return ()=>{ s^=s<<13; s^=s>>>17; s^=s<<5; return (s>>>0)/4294967296; }; };

/* ---- images ---- */
const loadImg=src=>new Promise((res,rej)=>{ const im=new Image(); im.onload=()=>res(im); im.onerror=()=>rej(new Error('img')); im.src=src; });
const cnv=(w,h)=>{ const c=document.createElement('canvas'); c.width=Math.max(1,Math.round(w)); c.height=Math.max(1,Math.round(h)); return c; };
async function shrink(src,max,type,qq){ const im=await loadImg(src); const k=Math.min(1,max/Math.max(im.naturalWidth,im.naturalHeight)); const c=cnv(im.naturalWidth*k,im.naturalHeight*k), g=c.getContext('2d'); if(type!=='image/png'){ g.fillStyle='#fff'; g.fillRect(0,0,c.width,c.height); } g.drawImage(im,0,0,c.width,c.height); return c.toDataURL(type||'image/jpeg',qq||.9); }
function drawCover(g,im,W,H,o){ o=o||{}; const iw=im.naturalWidth||im.width, ih=im.naturalHeight||im.height; if(!iw||!ih) return; const z=Math.max(1,o.z||1), k=Math.max(W/iw,H/ih)*z, dw=iw*k, dh=ih*k;
  const ox=o.ox==null?.5:o.ox, oy=o.oy==null?.5:o.oy; g.drawImage(im,(W-dw)*ox,(H-dh)*oy,dw,dh); }
/* bitmaps from IndexedDB (backgrounds, references) cached as decoded images */
/* decoded bitmaps are big (a 2048 px picture ≈ 16 MB): keep only the last few (iPad memory) */
const imgKeep=(id,im)=>{ IGC.img.delete(id); IGC.img.set(id,im); while(IGC.img.size>6) IGC.img.delete(IGC.img.keys().next().value); return im; };
async function bgImage(id){ if(!id) return null; if(IGC.img.has(id)) return imgKeep(id,IGC.img.get(id)); const r=await KS.idb.get('igc:bg:'+id,'files').catch(()=>null); if(!r||!r.src) return null; const im=await loadImg(r.src).catch(()=>null); if(im) imgKeep(id,im); return im; }
const bgImageSync=id=>IGC.img.get(id)||null;
const fileToData=f=>new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(f); });

/* ---- transliteration for file names ---- */
const TR={а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'e',ж:'zh',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'c',ч:'ch',ш:'sh',щ:'sch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya'};
const slug=s=>String(s||'').toLowerCase().split('').map(c=>TR[c]!=null?TR[c]:c).join('').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,40)||'cover';
/* ===== own fonts: binary in IndexedDB ('files', igc:font:<id>), metadata in st.ks.igcover.fonts, registered with the FontFace API ===== */
const LAT='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const CYR='АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя';
const ARM=(()=>{ let s=''; for(let c=0x531;c<=0x556;c++) s+=String.fromCharCode(c); for(let c=0x561;c<=0x586;c++) s+=String.fromCharCode(c); return s; })();
const SCRIPTS=[['lat','Lat',LAT],['cyr','Кир',CYR],['arm','Հայ',ARM]];
const PREVIEW='Aa Bb The quick brown fox — Привет — Բարեւ';
const fontMeta=id=>S().fonts.find(f=>f.id===id)||null;
const famCss=f=>`"${f.family}"`;

/* --- tiny sfnt reader: name + cmap of TTF / OTF / WOFF (WOFF tables are inflated with DecompressionStream); WOFF2 → null --- */
async function sfnt(buf){ const dv=new DataView(buf); if(dv.byteLength<64) return null; const sig=dv.getUint32(0); const tag=o=>String.fromCharCode(dv.getUint8(o),dv.getUint8(o+1),dv.getUint8(o+2),dv.getUint8(o+3));
  if(sig===0x00010000||sig===0x4F54544F||sig===0x74727565){ const n=dv.getUint16(4), T={}; for(let i=0;i<n;i++){ const r=12+i*16; if(r+16>dv.byteLength) break; T[tag(r)]={off:dv.getUint32(r+8),len:dv.getUint32(r+12)}; }
    return {fmt:sig===0x4F54544F?'otf':'ttf',get:async t=>{ const x=T[t]; if(!x||x.off+x.len>buf.byteLength) return null; return new DataView(buf,x.off,x.len); }}; }
  if(sig===0x774F4646){ const n=dv.getUint16(12), T={}; for(let i=0;i<n;i++){ const r=44+i*20; if(r+20>dv.byteLength) break; T[tag(r)]={off:dv.getUint32(r+4),comp:dv.getUint32(r+8),orig:dv.getUint32(r+12)}; }
    return {fmt:'woff',get:async t=>{ const x=T[t]; if(!x||x.off+x.comp>buf.byteLength) return null; const raw=new Uint8Array(buf,x.off,x.comp);
      if(x.comp>=x.orig) return new DataView(raw.slice().buffer); if(typeof DecompressionStream!=='function') return null;
      const out=await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('deflate'))).arrayBuffer(); return new DataView(out); }}; }
  if(sig===0x774F4632) return {fmt:'woff2',get:null};
  return null; }
function nameOf(dv){ try{ const n=dv.getUint16(2), so=dv.getUint16(4), got={}; for(let i=0;i<n;i++){ const r=6+i*12, pid=dv.getUint16(r), lid=dv.getUint16(r+4), nid=dv.getUint16(r+6), len=dv.getUint16(r+8), off=dv.getUint16(r+10);
      if(![1,2,4,16,17].includes(nid)) continue; let s=''; if(pid===3||pid===0){ for(let k=0;k+1<len;k+=2) s+=String.fromCharCode(dv.getUint16(so+off+k)); } else if(pid===1){ for(let k=0;k<len;k++) s+=String.fromCharCode(dv.getUint8(so+off+k)); } else continue;
      const pri=(pid===3&&lid===0x409)||(pid===1&&lid===0)?2:1; if(!got[nid]||got[nid].p<pri) got[nid]={s:s.trim(),p:pri}; }
    const fam=(got[16]||got[1]||{}).s||'', sub=(got[17]||got[2]||{}).s||'', full=(got[4]||{}).s||''; return full||(fam+(sub&&!/^regular$/i.test(sub)?' '+sub:''))||''; }catch(_){ return ''; } }
function cmapOf(dv){ const n=dv.getUint16(2); let best=-1,bs=-1; for(let i=0;i<n;i++){ const pid=dv.getUint16(4+i*8), eid=dv.getUint16(6+i*8), off=dv.getUint32(8+i*8); if(off+4>dv.byteLength) continue; const f=dv.getUint16(off);
    const sc=f===12&&(pid===3||pid===0)?4:f===4&&pid===3&&eid===1?3:f===4&&pid===0?2:f===4?1:0; if(sc>bs){ bs=sc; best=off; } }
  if(best<0||bs<=0) return []; const f=dv.getUint16(best), cps=[], R=[];
  if(f===12){ const ng=dv.getUint32(best+12); for(let i=0;i<ng;i++){ const o=best+16+i*12; if(o+12>dv.byteLength) break; R.push([dv.getUint32(o),dv.getUint32(o+4)]); } }
  else { const segX2=dv.getUint16(best+6), seg=segX2/2, eO=best+14, sO=eO+segX2+2, dO=sO+segX2, rO=dO+segX2;
    for(let s=0;s<seg;s++){ const end=dv.getUint16(eO+s*2), start=dv.getUint16(sO+s*2), delta=dv.getInt16(dO+s*2), ro=dv.getUint16(rO+s*2); if(start===0xFFFF) continue;
      if(!ro){ for(let c=start;c<=end;c++) if(((c+delta)&0xFFFF)!==0) cps.push(c); }
      else for(let c=start;c<=end;c++){ const a=rO+s*2+ro+(c-start)*2; if(a+2>dv.byteLength) break; const gi=dv.getUint16(a); if(gi) cps.push(c); } } }
  cps.sort((a,b)=>a-b); for(const c of cps){ const l=R[R.length-1]; if(l&&c<=l[1]+1) l[1]=Math.max(l[1],c); else R.push([c,c]); }
  R.sort((a,b)=>a[0]-b[0]); return R; }
const inRanges=(R,c)=>{ let lo=0,hi=R.length-1; while(lo<=hi){ const m=(lo+hi)>>1; if(c<R[m][0]) hi=m-1; else if(c>R[m][1]) lo=m+1; else return true; } return false; };

/* --- measurement fallback (WOFF2 or unreadable cmap): the glyph exists when the text width does not depend on the fallback font --- */
let MC=null; const mctx=()=>MC||(MC=cnv(8,8).getContext('2d'));
function measureHas(family,ch){ const g=mctx(), t=ch+ch+ch, w=f=>{ g.font=f; return g.measureText(t).width; };
  const a=w(`72px "${family}", monospace`), b=w(`72px "${family}", serif`); if(Math.abs(a-b)>.05) return false;
  const ma=w('72px monospace'), mb=w('72px serif'); if(Math.abs(ma-mb)>.05) return true; return Math.abs(a-ma)>.05; }
function hasChar(fid,ch){ const F=IGC.fonts[fid]; const cp=ch.codePointAt(0); if(F&&F.ranges&&F.ranges.length) return inRanges(F.ranges,cp); const m=fontMeta(fid); if(!m) return true;
  F&&(F.mc=F.mc||{}); if(F&&F.mc[ch]!=null) return F.mc[ch]; const v=measureHas(m.family,ch); if(F) F.mc[ch]=v; return v; }
function coverage(fid){ const out={}; SCRIPTS.forEach(([k,,set])=>{ const ch=[...set]; const miss=ch.filter(c=>!hasChar(fid,c)); out[k]={n:ch.length-miss.length,of:ch.length,miss:miss.slice(0,10).join('')}; }); return out; }
const covState=c=>!c?'':c.n>=c.of*.97?'ok':c.n>0?'part':'none';
/* letters of a text that the own font does not have (shown in the inspector) */
function missingIn(fid,text){ if(!fid) return ''; const seen=new Set(), out=[]; for(const ch of String(text||'').replace(/\*|\{[a-zN]+\}/g,'')){ if(seen.has(ch)) continue; seen.add(ch); if(!/[A-Za-zА-Яа-яЁёԱ-Ֆա-ֆ]/.test(ch)) continue; if(!hasChar(fid,ch)) out.push(ch); } return out.join(''); }

/* --- register an own font (ArrayBuffer) under a unique family name --- */
async function registerOwn(meta,buf){ const ff=new FontFace(meta.family,buf,{weight:'1 1000',style:'normal',display:'block'}); await ff.load(); document.fonts.add(ff); IGC.fonts[meta.id]=Object.assign(IGC.fonts[meta.id]||{},{ff,ok:true}); return ff; }
async function loadOwnFonts(){ const L=S().fonts.slice(); for(const m of L){ if(IGC.fonts[m.id]&&IGC.fonts[m.id].ok) continue; try{ const r=await KS.idb.get('igc:font:'+m.id,'files'); if(!r||!r.data){ IGC.fonts[m.id]={ok:false,lost:true}; continue; }
      await registerOwn(m,r.data); if(r.ranges) IGC.fonts[m.id].ranges=r.ranges; }catch(e){ console.warn('[igcover] font',m.name,e); IGC.fonts[m.id]={ok:false,bad:true}; } } }
const FONT_RE=/\.(ttf|otf|woff2?)$/i;
async function uploadFonts(files){ files=[...(files||[])].filter(Boolean); if(!files.length) return []; const s=S(), added=[]; let bad=0;
  for(const f of files){ if(!FONT_RE.test(f.name)&&!/font|sfnt|opentype|truetype/.test(f.type||'')){ bad++; continue; } if(f.size>25e6){ KS.toast('Шрифт «'+f.name+'» слишком большой'); bad++; continue; }
    try{ const buf=await f.arrayBuffer(); const P=await sfnt(buf); if(!P){ bad++; continue; } let name='', ranges=null;
      if(P.get){ try{ const nm=await P.get('name'); if(nm) name=nameOf(nm); const cm=await P.get('cmap'); if(cm) ranges=cmapOf(cm); }catch(e){ console.warn('[igcover] sfnt',e); } }
      name=(name||f.name.replace(FONT_RE,'').replace(/[_-]+/g,' ')).replace(/[^\p{L}\p{N} .&'-]/gu,'').trim().slice(0,48)||'Мой шрифт';
      const dupe=s.fonts.find(x=>x.name===name&&x.size===f.size); if(dupe){ added.push(dupe); continue; }
      const id=uid('f'), meta={id,name,family:'igc-'+id,file:f.name,fmt:P.fmt,size:f.size,added:Date.now(),cov:null};
      await registerOwn(meta,buf); if(ranges&&ranges.length) IGC.fonts[id].ranges=ranges;
      await KS.idb.set('igc:font:'+id,{id,name,file:f.name,type:f.type||'',data:buf,ranges:ranges&&ranges.length?ranges:null},'files');
      s.fonts.push(meta); meta.cov=coverage(id); meta.src=ranges&&ranges.length?'cmap':'measure'; added.push(meta); }
    catch(e){ console.warn('[igcover] upload font',e); bad++; } }
  KS.save(); if(added.length){ const w=added.filter(m=>m.cov&&(covState(m.cov.cyr)!=='ok'||covState(m.cov.lat)!=='ok')); KS.toast((added.length===1?'Шрифт «'+added[0].name+'» добавлен':'Добавлено шрифтов: '+added.length)+(w.length?' · проверьте буквы':'')); }
  if(bad) KS.toast('Не подошло файлов: '+bad+' (нужны TTF, OTF, WOFF или WOFF2)'); return added; }
async function deleteFont(id){ const s=S(), i=s.fonts.findIndex(f=>f.id===id); if(i<0) return; const m=s.fonts[i]; s.fonts.splice(i,1); try{ await KS.idb.del('igc:font:'+id,'files'); }catch(_){ }
  const F=IGC.fonts[id]; if(F&&F.ff) try{ document.fonts.delete(F.ff); }catch(_){ } delete IGC.fonts[id]; const key='own:'+id;
  s.pages.forEach(p=>{ ['title','text'].forEach(r=>{ if(p.fonts[r]===key) p.fonts[r]=(KINDS[p.kind]||KINDS.other).fonts[r]; }); [p.work.main,p.work.hl].concat(p.tpls.map(t=>t.doc)).forEach(d=>d&&d.slides.forEach(sl=>sl.els.forEach(e=>{ if(e.font===key) e.font=''; }))); });
  KS.save(); KS.toast('Шрифт «'+m.name+'» удалён'); }

/* --- the app's fonts (Google Fonts of the page + fonts uploaded into the app itself) --- */
let GW=null; function gWeights(){ if(GW) return GW; GW={}; try{ qa('link[href*="fonts.googleapis.com/css2"]').forEach(l=>{ const u=new URL(l.href); u.searchParams.getAll('family').forEach(f=>{ const [n,w]=f.split(':'); const ws=w&&/wght@/.test(w)?w.split('@')[1].split(';').map(Number).filter(Boolean):[400]; GW[n.replace(/\+/g,' ')]=ws; }); }); }catch(_){ } return GW; }
const appFonts=()=>{ try{ return Object.keys(FONTS).filter(n=>n!=='Montserrat Armenian'); }catch(_){ return ['PT Sans','PT Serif','Montserrat','Rubik','Playfair Display','Caveat']; } };
const appStack=n=>{ try{ if(FONTS[n]) return FONTS[n]; }catch(_){ } return `'${n}',sans-serif`; };
const isOwn=f=>typeof f==='string'&&f.startsWith('own:');
const fontName=f=>{ if(!f) return '—'; if(isOwn(f)){ const m=fontMeta(f.slice(4)); return m?m.name:'(шрифт удалён)'; } return f; };
const fontOk=f=>!isOwn(f)||!!fontMeta(f.slice(4));
/* nearest available weight of a Google font (avoids fake bold); own fonts: the face as is */
function wOf(f,w){ if(isOwn(f)) return 400; const L=gWeights()[f]; if(!L||!L.length) return w>=600?700:400; return L.reduce((a,b)=>Math.abs(b-w)<Math.abs(a-w)?b:a,L[0]); }
function stackOf(f){ if(isOwn(f)){ const m=fontMeta(f.slice(4)); return m?`"${m.family}","Noto Sans Armenian",sans-serif`:'sans-serif'; } return appStack(f); }
const elFont=(e,p)=>{ const f=e.font||(TITLE_ROLES.has(e.role)?p.fonts.title:p.fonts.text); return fontOk(f)?f:(TITLE_ROLES.has(e.role)?KINDS.en.fonts.title:KINDS.en.fonts.text); };
const fontStr=(e,p,px)=>{ const f=elFont(e,p); return `${e.it?'italic ':''}${wOf(f,e.weight||400)} ${Math.max(1,px).toFixed(2)}px ${stackOf(f)}`; };
/* wait for every font a design uses (Google Fonts are split by unicode-range: load with the real text) */
async function fontsReady(d,p){ p=p||PG(); if(!d||!document.fonts) return; const jobs=[], seen=new Set();
  visibleSlides(d).forEach((sl,i)=>sl.els.forEach(e=>{ if(e.t!=='text'&&!(e.t==='icon'&&/^(txt|emo):/.test(e.k||''))) return; const f=e.t==='text'?fontStr(e,p,40):`700 40px ${stackOf(p.fonts.title)}`, txt=(e.t==='text'?resolveText(e,d,i,p):String(e.k).slice(4))||'A';
    const key=f+'|'+txt; if(seen.has(key)) return; seen.add(key); jobs.push(Promise.race([document.fonts.load(f,txt.replace(/\s+/g,' ').slice(0,400)).catch(()=>null),sleep(5000)])); }));
  await Promise.all(jobs); try{ await Promise.race([document.fonts.ready,sleep(5000)]); }catch(_){ } }
/* ===== rendering: text layout with **accent** markup, effects, shapes, icons, background templates; one renderer for screen and export ===== */
function rr(g,x,y,w,h,r){ r=Math.max(0,Math.min(r,w/2,h/2)); g.beginPath(); g.moveTo(x+r,y); g.arcTo(x+w,y,x+w,y+h,r); g.arcTo(x+w,y+h,x,y+h,r); g.arcTo(x,y+h,x,y,r); g.arcTo(x,y,x+w,y,r); g.closePath(); }
const SEG=typeof Intl!=='undefined'&&Intl.Segmenter?new Intl.Segmenter(undefined,{granularity:'grapheme'}):null;
const graphemes=t=>SEG?[...SEG.segment(t)].map(x=>x.segment):Array.from(t);
function resolveText(e,d,i,p){ const N=visibleSlides(d).length, sl=d.slides[i]||{};
  return String(e.text||'').replace(/\{num\}/g,String(d.num||1)).replace(/\{n\}/g,String(i+1)).replace(/\{N\}/g,String(N)).replace(/\{handle\}/g,String(p.handle||'').replace(/^@/,'')).replace(/\{name\}/g,sl.name||''); }
function caseOf(s,c){ if(c==='upper') return s.toLocaleUpperCase(); if(c==='lower') return s.toLocaleLowerCase(); if(c==='title') return s.replace(/(^|[\s(«"'\-\/])(\p{L})/gu,(m,a,b)=>a+b.toLocaleUpperCase()); return s; }
/* «**word**» or «*word*» → accent; returns atoms {t,a} / {sp,a} / {br} */
function atomsOf(text,c){ const segs=[], re=/\*\*([^*]+?)\*\*|\*([^*\n]+?)\*/g; let i=0,m; while((m=re.exec(text))){ if(m.index>i) segs.push([text.slice(i,m.index),0]); segs.push([m[1]||m[2],1]); i=re.lastIndex; } if(i<text.length) segs.push([text.slice(i),0]);
  const A=[]; for(const [s,a] of segs){ for(const t of caseOf(s,c).split(/(\n|[ \t ]+)/)){ if(!t) continue; if(t==='\n') A.push({br:1}); else if(/^[ \t ]+$/.test(t)) A.push({sp:1,a}); else A.push({t,a}); } } return A; }
const hasAcc=text=>/\*\*[^*]+?\*\*|\*[^*\n]+?\*/.test(String(text||''));
function wrap(g,A,px,ls,maxW){ const M=t=>g.measureText(t).width+(ls?ls*px*graphemes(t).length:0), sp=M(' '); const words=[]; let w=null, spA=0;
  for(const a of A){ if(a.br){ words.push({br:1}); w=null; continue; } if(a.sp){ w=null; spA=a.a; continue; } if(!w){ w={parts:[],w:0,spA}; words.push(w); spA=0; } const pw=M(a.t); w.parts.push({t:a.t,a:a.a,w:pw}); w.w+=pw; }
  const lines=[]; let cur={items:[],w:0}, maxWord=0; const push=()=>{ lines.push(cur); cur={items:[],w:0}; };
  for(const x of words){ if(x.br){ push(); continue; } maxWord=Math.max(maxWord,x.w); if(cur.items.length&&cur.w+sp+x.w>maxW+.01) push(); if(cur.items.length){ cur.items.push({t:' ',a:x.spA,w:sp,sp:1}); cur.w+=sp; } x.parts.forEach(pt=>cur.items.push(pt)); cur.w+=x.w; }
  push(); if(lines.length>1&&!lines[lines.length-1].items.length&&words.length&&!words[words.length-1].br) lines.pop(); if(ls) lines.forEach(l=>{ if(l.w) l.w-=ls*px; });
  lines.forEach(l=>{ const runs=[]; let x=0; l.items.forEach(it=>{ const r=runs[runs.length-1]; if(r&&r.a===it.a){ r.t+=it.t; r.w+=it.w; } else runs.push({t:it.t,a:it.a,x,w:it.w}); x+=it.w; }); l.runs=runs; });
  return {lines,maxWord}; }
const FITC=new Map();
function layoutEl(g,e,d,i,p){ const text=resolveText(e,d,i,p), A=atomsOf(text,e.case), ls=+e.ls||0, lh=+e.lh||1.15;
  const at=px=>{ g.font=fontStr(e,p,px); const L=wrap(g,A,px,ls,Math.max(10,e.w)); L.px=px; L.lineH=px*lh; L.h=L.lines.length*L.lineH; return L; };
  let px=Math.max(6,+e.size||40), L=at(px);
  if(e.fit){ const ok=X=>X.maxWord<=e.w+.5&&X.h<=Math.max(e.h,X.lineH)+.5; if(!ok(L)){ const key=[text,e.case,ls,lh,e.w,e.h,e.size,fontStr(e,p,10)].join('|'); let best=FITC.get(key);
      if(best==null){ let lo=px*.18, hi=px; best=lo; for(let k=0;k<14;k++){ const mid=(lo+hi)/2; if(ok(at(mid))){ best=mid; lo=mid; } else hi=mid; } if(FITC.size>400) FITC.clear(); FITC.set(key,best); }
      L=at(best); } }
  g.font=fontStr(e,p,L.px); g.textBaseline='middle'; const mh=g.measureText('H'); L.capA=mh.actualBoundingBoxAscent||L.px*.36; L.capD=mh.actualBoundingBoxDescent||L.px*.36;
  L.top=e.fit?e.y+(e.h-L.h)/2:e.y; L.boxH=e.fit?e.h:L.h; L.acc=hasAcc(text); L.ls=ls; return L; }
function drawRun(g,t,x,y,ls,px,stroke){ if(!ls){ stroke?g.strokeText(t,x,y):g.fillText(t,x,y); return; } let cx=x; for(const ch of graphemes(t)){ stroke?g.strokeText(ch,cx,y):g.fillText(ch,cx,y); cx+=g.measureText(ch).width+ls*px; } }
function markerPath(g,x0,x1,y0,y1,seed){ const R=rng(seed), j=(y1-y0)*.12; g.beginPath(); g.moveTo(x0+R()*j,y0+R()*j); g.lineTo(x1-R()*j,y0+(R()-.5)*j); g.quadraticCurveTo(x1+j*.6,(y0+y1)/2,x1-R()*j,y1-(R())*j*.5); g.lineTo(x0+R()*j,y1+(R()-.5)*j); g.quadraticCurveTo(x0-j*.6,(y0+y1)/2,x0+R()*j,y0+R()*j); g.closePath(); }
function squiggle(g,x0,x1,y,amp,wl){ g.beginPath(); g.moveTo(x0,y); let x=x0, up=1; while(x<x1){ const nx=Math.min(x1,x+wl/2); g.quadraticCurveTo((x+nx)/2,y-amp*up*2,nx,y); x=nx; up=-up; } g.stroke(); }
function drawText(g,e,d,i,p){ const L=layoutEl(g,e,d,i,p), px=L.px, fx=e.fx||{}, al=e.align||'center';
  g.save(); g.globalAlpha=clamp(e.op==null?1:+e.op,0,1); if(e.rot){ const cx=e.x+e.w/2, cy=L.top+L.h/2; g.translate(cx,cy); g.rotate(e.rot*Math.PI/180); g.translate(-cx,-cy); }
  g.font=fontStr(e,p,px); g.textBaseline='middle'; g.textAlign='left';
  const lines=L.lines.map((l,k)=>{ const lx=al==='left'?e.x:al==='right'?e.x+e.w-l.w:e.x+(e.w-l.w)/2; const yc=L.top+(k+.5)*L.lineH; return {l,lx,yc,top:yc-L.capA,base:yc+L.capD}; });
  if(fx.pill){ g.fillStyle=col(fx.pill,p); const padX=px*.55, padY=px*.36; lines.forEach(({l,lx,top,base})=>{ if(!l.w) return; const h=base-top+padY*2; rr(g,lx-padX,top-padY,l.w+padX*2,h,Math.min(h/2,px*(fx.pr==null?.9:fx.pr))); g.fill(); }); }
  const spans=fn=>lines.forEach(({l,lx,top,base},k)=>{ if(L.acc) l.runs.forEach((r,ri)=>{ if(r.a&&r.t.trim()) fn(lx+r.x,lx+r.x+r.w-(L.ls*px),top,base,k*10+ri); }); else if(l.w) fn(lx,lx+l.w-(L.ls*px),top,base,k); });
  if(fx.hl){ g.fillStyle=col(fx.hl,p); g.globalAlpha*=.92; spans((x0,x1,top,base,k)=>{ const ch=base-top; markerPath(g,x0-px*.07,x1+px*.07,base-ch*.55,base+px*.1,(e.id||'')+k); g.fill(); }); g.globalAlpha/=.92; }
  if(fx.sh){ g.shadowColor='rgba(0,0,0,'+(fx.sha||.32)+')'; g.shadowBlur=px*.14; g.shadowOffsetY=px*.05; }
  if(fx.ol){ g.lineJoin='round'; g.miterLimit=2; g.lineWidth=Math.max(1,(fx.olw||.09)*px); g.strokeStyle=col(fx.ol,p); lines.forEach(({l,lx,yc})=>l.runs.forEach(r=>drawRun(g,r.t,lx+r.x,yc,L.ls,px,true))); if(!fx.hollow){ g.shadowColor='transparent'; } }
  if(!fx.hollow) lines.forEach(({l,lx,yc})=>l.runs.forEach(r=>{ g.fillStyle=col(r.a?e.acc||'accent':e.color,p); drawRun(g,r.t,lx+r.x,yc,L.ls,px,false); }));
  g.shadowColor='transparent'; g.shadowBlur=0; g.shadowOffsetY=0;
  if(fx.sq){ g.strokeStyle=col(fx.sqc||e.acc||'accent',p); g.lineWidth=Math.max(1.5,px*.055); g.lineCap='round'; spans((x0,x1,top,base)=>squiggle(g,x0,x1,base+px*.2,px*.045,px*.26)); }
  g.restore(); return L; }

/* ---- shapes (decor) ---- */
const SHAPES=[['rect','Плашка'],['circle','Круг'],['ring','Кольцо'],['line','Линия'],['underline','Мазок'],['arrow','Стрелка'],['star','Звезда'],['sparkle','Искра'],['heart','Сердце'],['frame','Рамка'],['tape','Скотч'],['burst','Бейдж'],['blob','Клякса'],['check','Галочка'],['cross','Крестик'],['bubble','Облачко'],['wave','Волна']];
function starPath(g,n,R,r){ g.beginPath(); for(let k=0;k<n*2;k++){ const a=-Math.PI/2+k*Math.PI/n, rad=k%2?r:R; g.lineTo(Math.cos(a)*rad,Math.sin(a)*rad); } g.closePath(); }
function drawShape(g,e,p){ const w=Math.max(2,e.w), h=Math.max(2,e.h), c=col(e.color,p), m=Math.min(w,h); g.save(); g.globalAlpha=clamp(e.op==null?1:+e.op,0,1); g.translate(e.x+w/2,e.y+h/2); if(e.rot) g.rotate(e.rot*Math.PI/180);
  g.fillStyle=c; g.strokeStyle=c; g.lineCap='round'; g.lineJoin='round'; const lw=Math.max(2,(e.sw||.07)*m);
  switch(e.k){
    case 'rect': rr(g,-w/2,-h/2,w,h,m*(e.r==null?.16:e.r)); g.fill(); break;
    case 'circle': g.beginPath(); g.ellipse(0,0,w/2,h/2,0,0,Math.PI*2); g.fill(); break;
    case 'ring': g.lineWidth=lw; g.beginPath(); g.ellipse(0,0,w/2-lw/2,h/2-lw/2,0,0,Math.PI*2); g.stroke(); break;
    case 'line': g.lineWidth=Math.max(2,h*.5); g.beginPath(); g.moveTo(-w/2+h/4,0); g.lineTo(w/2-h/4,0); g.stroke(); break;
    case 'underline': g.beginPath(); g.moveTo(-w/2,h*.1); g.quadraticCurveTo(-w*.1,-h*.55,w/2,-h*.2); g.quadraticCurveTo(w*.05,-h*.05,-w/2+w*.04,h*.42); g.closePath(); g.fill(); break;
    case 'arrow': { g.lineWidth=Math.max(3,m*.075); g.beginPath(); g.moveTo(-w/2+lw,h/2-lw); g.bezierCurveTo(-w*.25,-h*.1,w*.05,-h*.35,w/2-lw,-h/2+lw*1.2); g.stroke(); const ex=w/2-lw, ey=-h/2+lw*1.2, a=Math.atan2(ey-(-h*.35),ex-w*.05), L=m*.32;
      g.beginPath(); g.moveTo(ex-L*Math.cos(a-.5),ey-L*Math.sin(a-.5)); g.lineTo(ex,ey); g.lineTo(ex-L*Math.cos(a+.5),ey-L*Math.sin(a+.5)); g.stroke(); break; }
    case 'star': g.scale(w/m,h/m); starPath(g,5,m/2,m*.21); g.fill(); break;
    case 'sparkle': g.scale(w/m,h/m); g.beginPath(); for(let k=0;k<4;k++){ const a=k*Math.PI/2-Math.PI/2, b=a+Math.PI/4; g.lineTo(Math.cos(a)*m/2,Math.sin(a)*m/2); g.quadraticCurveTo(0,0,Math.cos(a+Math.PI/2)*m/2,Math.sin(a+Math.PI/2)*m/2); void b; } g.closePath(); g.fill(); break;
    case 'heart': g.scale(w/24,h/24); g.translate(-12,-12); g.fill(new Path2D('M12 21.5S2.5 15.6 2.5 8.9C2.5 5.6 5 3.5 7.6 3.5c1.9 0 3.4 1 4.4 2.6 1-1.6 2.5-2.6 4.4-2.6 2.6 0 5.1 2.1 5.1 5.4 0 6.7-9.5 12.6-9.5 12.6z')); break;
    case 'frame': g.lineWidth=Math.max(2,(e.sw||.025)*m); rr(g,-w/2+g.lineWidth/2,-h/2+g.lineWidth/2,w-g.lineWidth,h-g.lineWidth,m*(e.r==null?.04:e.r)); g.stroke(); break;
    case 'tape': { const R=rng(e.id||'t'), z=h*.18; g.beginPath(); g.moveTo(-w/2,-h/2); for(let x=-w/2;x<w/2;x+=w/10) g.lineTo(x,-h/2+(R()-.5)*2); g.lineTo(w/2,-h/2); for(let y=-h/2;y<h/2;y+=z) g.lineTo(w/2-(R()*z*.6),y+z/2); g.lineTo(w/2,h/2); g.lineTo(-w/2,h/2); for(let y=h/2;y>-h/2;y-=z) g.lineTo(-w/2+(R()*z*.6),y-z/2); g.closePath(); g.globalAlpha*=.82; g.fill(); break; }
    case 'burst': g.scale(w/m,h/m); starPath(g,14,m/2,m*.42); g.fill(); break;
    case 'blob': { const R=rng(e.id||'b'), n=7, pts=[]; for(let k=0;k<n;k++){ const a=k/n*Math.PI*2, rad=.38+R()*.12; pts.push([Math.cos(a)*rad*w,Math.sin(a)*rad*h]); } g.beginPath(); for(let k=0;k<n;k++){ const a=pts[k], b=pts[(k+1)%n], mx=(a[0]+b[0])/2, my=(a[1]+b[1])/2; if(!k) g.moveTo(mx,my); else g.quadraticCurveTo(a[0],a[1],mx,my); } const a=pts[0], b=pts[1]; g.quadraticCurveTo(a[0],a[1],(a[0]+b[0])/2,(a[1]+b[1])/2); g.closePath(); g.fill(); break; }
    case 'check': g.lineWidth=Math.max(3,m*.14); g.beginPath(); g.moveTo(-w*.38,h*.02); g.lineTo(-w*.1,h*.32); g.lineTo(w*.4,-h*.34); g.stroke(); break;
    case 'cross': g.lineWidth=Math.max(3,m*.14); g.beginPath(); g.moveTo(-w*.34,-h*.34); g.lineTo(w*.34,h*.34); g.moveTo(w*.34,-h*.34); g.lineTo(-w*.34,h*.34); g.stroke(); break;
    case 'bubble': rr(g,-w/2,-h/2,w,h*.8,m*.22); g.fill(); g.beginPath(); g.moveTo(-w*.22,h*.28); g.lineTo(-w*.3,h/2); g.lineTo(-w*.02,h*.28); g.closePath(); g.fill(); break;
    case 'wave': g.lineWidth=Math.max(2,(e.sw||.12)*h); squiggle(g,-w/2+g.lineWidth,w/2-g.lineWidth,0,h*.22,Math.max(h*.9,w/8)); break;
  }
  g.restore(); }

/* ---- icons (24×24 stroke paths; circles as arcs), text icons «txt:Aa», emoji «emo:📚» ---- */
const C_=(cx,cy,r)=>`M${cx-r} ${cy}a${r} ${r} 0 1 0 ${2*r} 0a${r} ${r} 0 1 0 ${-2*r} 0`;
const ICONS={
  book:'M3 5.5C3 4.7 3.7 4 4.5 4H10c1.1 0 2 .9 2 2v14c0-1.1-.9-2-2-2H3zM21 5.5c0-.8-.7-1.5-1.5-1.5H14c-1.1 0-2 .9-2 2v14c0-1.1.9-2 2-2h7z',
  star:'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z',
  heart:'M12 20s-7-4.3-8.8-8.4C2 8.4 4 5 7.2 5c2 0 3.4 1.1 4.8 2.8C13.4 6.1 14.8 5 16.8 5 20 5 22 8.4 20.8 11.6 19 15.7 12 20 12 20z',
  chat:'M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5 4v-4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM8 10h.01M12 10h.01M16 10h.01',
  bulb:'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z',
  pencil:'M4 20l1-4L16 5a2.1 2.1 0 0 1 3 3L8 19zM14 7l3 3',
  play:'M7 4.5v15l12-7.5z',
  question:C_(12,12,9)+'M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17.2v.01',
  check:C_(12,12,9)+'M8 12.5l2.7 2.7L16.5 9',
  calendar:'M4 6h16v14H4zM4 10h16M8 3v5M16 3v5',
  gift:'M3 9h18v4H3zM5 13h14v8H5zM12 9v12M12 9C10 5 7 5 7 7s3 2 5 2c2 0 5 0 5-2s-3-2-5 2',
  camera:'M3 8h4l2-3h6l2 3h4v12H3z'+C_(12,13.5,3.5),
  headphones:'M4 15v-3a8 8 0 0 1 16 0v3M4 15h3v5H5a1 1 0 0 1-1-1zM20 15h-3v5h2a1 1 0 0 0 1-1z',
  globe:C_(12,12,9)+'M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z',
  cap:'M2 9l10-5 10 5-10 5zM6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5M22 9v6',
  music:'M9 18V5l11-2v13'+C_(6,18,3)+C_(17,16,3),
  coffee:'M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 10h1.5a2.5 2.5 0 0 1 0 5H17M8 2.5V5M12 2.5V5',
  trophy:'M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M12 14v4M8 21h8M9 18h6',
  sparkle:'M12 3c.6 4.8 2.2 6.4 7 7-4.8.6-6.4 2.2-7 7-.6-4.8-2.2-6.4-7-7 4.8-.6 6.4-2.2 7-7zM19 15c.3 2 .9 2.7 3 3-2.1.3-2.7.9-3 3-.3-2.1-.9-2.7-3-3 2.1-.3 2.7-1 3-3z',
  mic:'M9 5a3 3 0 0 1 6 0v6a3 3 0 0 1-6 0zM5 11a7 7 0 0 0 14 0M12 18v3',
  mail:'M3 6h18v12H3zM3 7l9 6 9-6',
  pin:'M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z'+C_(12,9.5,2.5),
  smile:C_(12,12,9)+'M8.5 14.5c1 1.2 2.1 1.8 3.5 1.8s2.5-.6 3.5-1.8M9 9.5v.01M15 9.5v.01',
  tag:'M3 12V4h8l10 10-8 8z'+C_(7.5,8.5,1.2),
  bookmark:'M6 3h12v18l-6-4-6 4z',
  list:'M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01',
  video:'M3 6h12v12H3zM15 10l6-3v10l-6-3z',
  stamp:'M9 4h6v4l-1 4h-4L9 8zM4 15h16v3H4zM6 21h12',
  printer:'M7 9V3h10v6M5 9h14a2 2 0 0 1 2 2v6h-4v4H7v-4H3v-6a2 2 0 0 1 2-2zM7 15h10',
  flag:'M5 21V4M5 4h12l-2 4 2 4H5',
  home:'M3 11l9-7 9 7M5 10v10h14V10',
  fire:'M12 21c-4 0-7-2.6-7-6.5 0-3.6 3-5.5 3.5-9 2 1.3 3 3 3 5 1-1 1.6-2.2 1.8-3.8C16 8.6 19 11.7 19 15c0 3.6-3 6-7 6z'
};
const ICON_N={book:'Книга',star:'Звезда',heart:'Сердце',chat:'Отзывы',bulb:'Идея',pencil:'Карандаш',play:'Видео',question:'Вопрос',check:'Тест',calendar:'Календарь',gift:'Подарок',camera:'Фото',headphones:'Аудио',globe:'Мир',cap:'Учёба',music:'Музыка',coffee:'Кофе',trophy:'Успех',sparkle:'Новое',mic:'Speaking',mail:'Письма',pin:'Место',smile:'Улыбка',tag:'Цены',bookmark:'Закладка',list:'Список',video:'Reels',stamp:'Печать',printer:'Печать',flag:'Цель',home:'Дом',fire:'Хит'};
const TXT_ICONS=['Aa','A–Z','ABC','?!','1·2·3','EN'];
const P2D={}; const pathOf=k=>P2D[k]||(P2D[k]=new Path2D(ICONS[k]||ICONS.star));
function drawIcon(g,e,p){ const w=Math.max(4,e.w), h=Math.max(4,e.h), m=Math.min(w,h), c=col(e.color,p), k=String(e.k||'star'); g.save(); g.globalAlpha=clamp(e.op==null?1:+e.op,0,1); g.translate(e.x+w/2,e.y+h/2); if(e.rot) g.rotate(e.rot*Math.PI/180);
  if(k.startsWith('emo:')){ g.font=`${m*.82}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`; g.textAlign='center'; g.textBaseline='middle'; g.fillStyle=c; g.fillText(k.slice(4),0,m*.04); }
  else if(k.startsWith('txt:')){ const t=k.slice(4), f=p.fonts.title; let px=m*.62; g.font=`${wOf(f,800)} ${px}px ${stackOf(f)}`; const tw=g.measureText(t).width; if(tw>w*.92){ px*=w*.92/tw; g.font=`${wOf(f,800)} ${px}px ${stackOf(f)}`; } g.textAlign='center'; g.textBaseline='middle'; g.fillStyle=c; g.fillText(t,0,0); }
  else { const s=m/24; g.scale(s,s); g.translate(-12,-12); g.lineWidth=e.sw||1.7; g.lineCap='round'; g.lineJoin='round'; g.strokeStyle=c; if(e.fill){ g.fillStyle=c; g.globalAlpha*=.22; g.fill(pathOf(k)); g.globalAlpha/=.22; } g.stroke(pathOf(k)); }
  g.restore(); }

/* ---- background templates (≥16), drawn in design units with the page colours ---- */
const NT={}; function noiseTile(kind,seed){ const key=kind+seed; if(NT[key]) return NT[key]; const c=cnv(256,256), g=c.getContext('2d'), id=g.createImageData(256,256), R=rng(key);
  for(let i=0;i<id.data.length;i+=4){ const v=R(); const dark=v<.5; id.data[i]=id.data[i+1]=id.data[i+2]=dark?40:255; id.data[i+3]=Math.round((kind==='kraft'?28:kind==='chalk'?14:16)*Math.abs(v-.5)*2*(R()<.85?1:2.4)); }
  g.putImageData(id,0,0); g.lineCap='round'; const nf=kind==='kraft'?60:kind==='chalk'?0:26; for(let k=0;k<nf;k++){ g.strokeStyle=R()<.5?'rgba(60,40,20,.07)':'rgba(255,255,255,.18)'; g.lineWidth=.6+R(); g.beginPath(); const x=R()*256, y=R()*256, a=R()*Math.PI*2, L=6+R()*18; g.moveTo(x,y); g.quadraticCurveTo(x+Math.cos(a+.6)*L*.5,y+Math.sin(a+.6)*L*.5,x+Math.cos(a)*L,y+Math.sin(a)*L); g.stroke(); }
  return NT[key]=c; }
function texture(g,W,H,kind,a){ const pat=g.createPattern(noiseTile(kind,1),'repeat'); g.save(); g.globalAlpha=a==null?1:a; g.fillStyle=pat; g.scale(1.6,1.6); g.fillRect(0,0,W/1.6+2,H/1.6+2); g.restore(); }
function vignette(g,W,H,a,c){ const r=g.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.hypot(W,H)*.62); r.addColorStop(0,'rgba(0,0,0,0)'); r.addColorStop(1,c||('rgba(0,0,0,'+a+')')); g.fillStyle=r; g.fillRect(0,0,W,H); }
const fill=(g,W,H,c)=>{ g.fillStyle=c; g.fillRect(0,0,W,H); };
function shadowed(g,fn,blur,oy,a){ g.save(); g.shadowColor='rgba(0,0,0,'+(a||.22)+')'; g.shadowBlur=blur; g.shadowOffsetY=oy; fn(); g.restore(); }
function photoOr(g,o,x,y,w,h,C){ const im=o.photo&&bgImageSync(o.photo); if(im){ g.save(); g.beginPath(); g.rect(x,y,w,h); g.clip(); g.translate(x,y); drawCover(g,im,w,h,o); g.restore(); return true; }
  /* no photo yet: a pale placeholder picture, text stays readable on it */
  const gr=g.createLinearGradient(x,y,x+w,y+h); gr.addColorStop(0,mix(C.accent2,'#FFFFFF',.45)); gr.addColorStop(1,mix(C.soft,'#FFFFFF',.25)); g.fillStyle=gr; g.fillRect(x,y,w,h); g.fillStyle=rgba(C.accent2,.55); g.beginPath(); g.arc(x+w*.72,y+h*.3,Math.min(w,h)*.12,0,Math.PI*2); g.fill();
  g.fillStyle=rgba(C.ink,.07); g.beginPath(); g.moveTo(x,y+h); g.lineTo(x+w*.3,y+h*.7); g.lineTo(x+w*.55,y+h*.86); g.lineTo(x+w*.8,y+h*.66); g.lineTo(x+w,y+h*.82); g.lineTo(x+w,y+h); g.fill(); return false; }
const TPL=[
  {id:'solid',n:'Однотон',draw(g,W,H,C){ fill(g,W,H,C.bg); }},
  {id:'grad',n:'Градиент',draw(g,W,H,C,o){ const gr=g.createLinearGradient(0,0,W,H); gr.addColorStop(0,o.c1||C.soft); gr.addColorStop(1,o.c2||C.bg); fill(g,W,H,gr); const r=g.createRadialGradient(W*.85,H*.12,0,W*.85,H*.12,W*.8); r.addColorStop(0,rgba(C.accent2,.45)); r.addColorStop(1,rgba(C.accent2,0)); fill(g,W,H,r); }},
  {id:'mesh',n:'Мягкие пятна',draw(g,W,H,C){ fill(g,W,H,C.bg); [[C.accent2,.15,.18,.75,.75],[C.soft,.92,.4,.7,.9],[C.accent,.7,1.02,.75,.22],[C.soft,.05,.85,.5,.7]].forEach(([c,x,y,r,a])=>{ const gr=g.createRadialGradient(W*x,H*y,0,W*x,H*y,W*r); gr.addColorStop(0,rgba(c,a)); gr.addColorStop(1,rgba(c,0)); fill(g,W,H,gr); }); texture(g,W,H,'paper',.5); }},
  {id:'paper',n:'Бумага',draw(g,W,H,C){ fill(g,W,H,C.bg); texture(g,W,H,'paper',1); vignette(g,W,H,.07); }},
  {id:'kraft',n:'Крафт',draw(g,W,H,C){ fill(g,W,H,mix('#B88A5A',C.soft,.18)); texture(g,W,H,'kraft',1); vignette(g,W,H,.16); }},
  {id:'grid',n:'Тетрадь в клетку',draw(g,W,H,C){ fill(g,W,H,mix(C.bg,'#FFFFFF',.35)); texture(g,W,H,'paper',.6); const s=54, c=mix(C.soft,'#5A8DD6',.45); g.strokeStyle=rgba(c,.5); g.lineWidth=1.6; g.beginPath(); for(let x=(W%s)/2;x<=W;x+=s){ g.moveTo(x,0); g.lineTo(x,H); } for(let y=(H%s)/2;y<=H;y+=s){ g.moveTo(0,y); g.lineTo(W,y); } g.stroke(); vignette(g,W,H,.05); }},
  {id:'lined',n:'Тетрадь в линейку',draw(g,W,H,C){ fill(g,W,H,mix(C.bg,'#FFFFFF',.4)); texture(g,W,H,'paper',.6); g.strokeStyle=rgba(mix(C.soft,'#5A8DD6',.5),.55); g.lineWidth=2; g.beginPath(); for(let y=200;y<H;y+=64){ g.moveTo(0,y); g.lineTo(W,y); } g.stroke();
    g.strokeStyle=rgba('#E2574C',.6); g.lineWidth=2.4; g.beginPath(); g.moveTo(150,0); g.lineTo(150,H); g.moveTo(158,0); g.lineTo(158,H); g.stroke(); [.2,.5,.8].forEach(k=>{ g.fillStyle='rgba(0,0,0,.10)'; g.beginPath(); g.arc(70,H*k+3,22,0,Math.PI*2); g.fill(); g.fillStyle=mix(C.soft,'#FFFFFF',.2); g.beginPath(); g.arc(70,H*k,20,0,Math.PI*2); g.fill(); }); }},
  {id:'dots',n:'Точки',draw(g,W,H,C){ fill(g,W,H,mix(C.bg,'#FFFFFF',.3)); texture(g,W,H,'paper',.6); g.fillStyle=rgba(C.ink,.2); const s=54; for(let y=(H%s)/2;y<=H;y+=s) for(let x=(W%s)/2;x<=W;x+=s){ g.beginPath(); g.arc(x,y,3.2,0,Math.PI*2); g.fill(); } }},
  {id:'index',n:'Карточка',draw(g,W,H,C){ fill(g,W,H,C.soft); texture(g,W,H,'paper',.8); g.save(); g.translate(W/2,H/2); g.rotate(-.02); const w=W-150, h=H-230; shadowed(g,()=>{ g.fillStyle=mix(C.bg,'#FFFFFF',.6); rr(g,-w/2,-h/2,w,h,14); g.fill(); },40,16,.25);
    g.strokeStyle=rgba('#E2574C',.7); g.lineWidth=3; g.beginPath(); g.moveTo(-w/2,-h/2+170); g.lineTo(w/2,-h/2+170); g.stroke(); g.strokeStyle=rgba('#5A8DD6',.35); g.lineWidth=2; g.beginPath(); for(let y=-h/2+240;y<h/2-20;y+=70){ g.moveTo(-w/2,y); g.lineTo(w/2,y); } g.stroke(); g.restore(); }},
  {id:'sticky',n:'Стикер',draw(g,W,H,C){ fill(g,W,H,mix(C.soft,'#FFFFFF',.15)); texture(g,W,H,'paper',.8); const s=Math.min(W*.86,H*.74); g.save(); g.translate(W/2,H/2+H*.02); g.rotate(.025);
    shadowed(g,()=>{ g.fillStyle=C.accent2; g.beginPath(); g.moveTo(-s/2,-s/2); g.lineTo(s/2,-s/2); g.lineTo(s/2,s/2-s*.06); g.quadraticCurveTo(s/2-s*.02,s/2,s/2-s*.1,s/2); g.lineTo(-s/2,s/2); g.closePath(); g.fill(); },34,18,.2);
    const gr=g.createLinearGradient(0,-s/2,0,s/2); gr.addColorStop(0,'rgba(255,255,255,.22)'); gr.addColorStop(.5,'rgba(255,255,255,0)'); gr.addColorStop(1,'rgba(0,0,0,.06)'); g.fillStyle=gr; g.fillRect(-s/2,-s/2,s,s);
    g.rotate(-.07); g.fillStyle='rgba(255,255,255,.55)'; g.fillRect(-120,-s/2-34,240,74); g.restore(); }},
  {id:'polaroid',n:'Полароид',draw(g,W,H,C,o){ fill(g,W,H,C.soft); texture(g,W,H,'paper',.8); const w=W*.74, h=w*1.2; g.save(); g.translate(W/2,H*.47); g.rotate(-.035); shadowed(g,()=>{ g.fillStyle='#FCFBF8'; g.fillRect(-w/2,-h/2,w,h); },40,18,.28);
    photoOr(g,o,-w/2+40,-h/2+40,w-80,w-80,C); g.restore(); }},
  {id:'chalk',n:'Доска',dark:true,draw(g,W,H,C){ fill(g,W,H,'#2E3D36'); const R=rng('chalk'); for(let k=0;k<40;k++){ const x=R()*W, y=R()*H, r=80+R()*260, gr=g.createRadialGradient(x,y,0,x,y,r); gr.addColorStop(0,'rgba(255,255,255,'+(.02+R()*.04)+')'); gr.addColorStop(1,'rgba(255,255,255,0)'); fill(g,W,H,gr); }
    g.strokeStyle='rgba(255,255,255,.035)'; g.lineWidth=30; for(let k=0;k<6;k++){ g.beginPath(); g.arc(R()*W,R()*H,120+R()*200,R()*6,R()*6+2); g.stroke(); } texture(g,W,H,'chalk',1); g.strokeStyle='#7A5233'; g.lineWidth=34; g.strokeRect(17,17,W-34,H-34); g.strokeStyle='rgba(0,0,0,.25)'; g.lineWidth=4; g.strokeRect(36,36,W-72,H-72); }},
  {id:'hl',n:'Маркер',draw(g,W,H,C){ fill(g,W,H,mix(C.bg,'#FFFFFF',.3)); texture(g,W,H,'paper',.5); [[.1,.12,.62,.11,C.accent2],[.45,.84,.6,.1,C.soft],[.62,.2,.3,.06,C.accent2]].forEach(([x,y,w,h,c],k)=>{ g.save(); g.translate(W*x,H*y); g.rotate(-.06+k*.03); g.fillStyle=rgba(c,.75); markerPath(g,0,W*w,0,H*h,'hl'+k); g.fill(); g.restore(); }); }},
  {id:'duo',n:'Дуотон фото',draw(g,W,H,C,o){ const im=o.photo&&bgImageSync(o.photo); if(!im){ const gr=g.createLinearGradient(0,0,W,H); gr.addColorStop(0,C.ink); gr.addColorStop(1,mix(C.ink,C.accent,.35)); fill(g,W,H,gr);
      [[.92,.08,.42,.22],[.06,.95,.5,.16]].forEach(([x,y,r,a])=>{ const rg=g.createRadialGradient(W*x,H*y,0,W*x,H*y,W*r); rg.addColorStop(0,rgba(C.accent2,a)); rg.addColorStop(1,rgba(C.accent2,0)); fill(g,W,H,rg); }); texture(g,W,H,'chalk',1); return; }
    const c=cnv(W/2,H/2), x=c.getContext('2d'); drawCover(x,im,c.width,c.height,o); const id=x.getImageData(0,0,c.width,c.height), d=id.data, A=hex2rgb(C.ink), B=hex2rgb(C.accent2); for(let i=0;i<d.length;i+=4){ const l=(.299*d[i]+.587*d[i+1]+.114*d[i+2])/255, t=Math.pow(l,.9); d[i]=A[0]+(B[0]-A[0])*t; d[i+1]=A[1]+(B[1]-A[1])*t; d[i+2]=A[2]+(B[2]-A[2])*t; }
    x.putImageData(id,0,0); g.drawImage(c,0,0,W,H); }},
  {id:'split',n:'Две половины',draw(g,W,H,C){ fill(g,W,H,C.bg); g.fillStyle=C.accent2; g.beginPath(); g.moveTo(0,0); g.lineTo(W,0); g.lineTo(W,H*.5); for(let x=W;x>=0;x-=W/12) g.lineTo(x,H*.52+Math.sin(x/W*Math.PI*4)*18); g.closePath(); g.fill(); texture(g,W,H,'paper',.6); }},
  {id:'frame',n:'Рамка',draw(g,W,H,C){ fill(g,W,H,C.bg); texture(g,W,H,'paper',.7); g.strokeStyle=C.ink; g.lineWidth=3; g.strokeRect(48,48,W-96,H-96); g.lineWidth=1.2; g.strokeRect(64,64,W-128,H-128); g.fillStyle=C.accent; [[48,48],[W-48,48],[48,H-48],[W-48,H-48]].forEach(([x,y])=>{ g.beginPath(); g.arc(x,y,9,0,Math.PI*2); g.fill(); }); }},
  {id:'stripes',n:'Полосы',draw(g,W,H,C){ fill(g,W,H,C.bg); g.save(); g.fillStyle=rgba(C.soft,.75); g.rotate(-Math.PI/4); for(let x=-H*2;x<W*2;x+=150) g.fillRect(x,-H*2,70,H*4); g.restore(); texture(g,W,H,'paper',.5); }},
  {id:'arch',n:'Арка',draw(g,W,H,C){ fill(g,W,H,C.soft); texture(g,W,H,'paper',.6); const w=W*.76, x=(W-w)/2, top=H*.12, bot=H*.9; shadowed(g,()=>{ g.fillStyle=C.bg; g.beginPath(); g.moveTo(x,bot); g.lineTo(x,top+w/2); g.arc(W/2,top+w/2,w/2,Math.PI,0); g.lineTo(x+w,bot); g.closePath(); g.fill(); },30,10,.12);
    g.fillStyle=C.accent2; g.beginPath(); g.arc(W/2,top+w*.36,w*.12,0,Math.PI*2); g.fill(); }},
  {id:'torn',n:'Рваная бумага',draw(g,W,H,C){ fill(g,W,H,C.accent); texture(g,W,H,'paper',.7); const R=rng('torn'), y0=H*.27, y1=H*.73; shadowed(g,()=>{ g.fillStyle=mix(C.bg,'#FFFFFF',.45); g.beginPath(); g.moveTo(0,y0); for(let x=0;x<=W;x+=18) g.lineTo(x,y0+(R()-.5)*22-x*.03); g.lineTo(W,y1); for(let x=W;x>=0;x-=18) g.lineTo(x,y1+(R()-.5)*22+x*.02); g.closePath(); g.fill(); },26,10,.3); }},
  {id:'blob',n:'Кляксы',draw(g,W,H,C){ fill(g,W,H,C.bg); [[C.accent2,.12,.12,.55],[C.soft,.9,.86,.62],[C.accent,.9,.1,.2]].forEach(([c,x,y,r],k)=>{ g.save(); g.fillStyle=c; drawShape(g,{id:'bl'+k,k:'blob',x:W*x-W*r/2,y:H*y-W*r/2,w:W*r,h:W*r,color:c},{col:{}}); g.restore(); }); texture(g,W,H,'paper',.5); }},
  {id:'dict',n:'Словарь',draw(g,W,H,C){ fill(g,W,H,mix('#F3EAD7',C.bg,.35)); texture(g,W,H,'paper',1); const R=rng('dict'); g.fillStyle=rgba(C.ink,.09); for(let col=0;col<2;col++){ const x0=70+col*(W-140)/2+(col?20:0), cw=(W-140)/2-40; for(let y=90;y<H-70;y+=34){ let x=x0; while(x<x0+cw-30){ const w=Math.min(x0+cw-x,30+R()*110); g.fillRect(x,y,w-12,12); x+=w; } if(R()<.12) y+=20; } }
    g.strokeStyle=rgba(C.ink,.12); g.lineWidth=2; g.beginPath(); g.moveTo(W/2,80); g.lineTo(W/2,H-60); g.stroke(); vignette(g,W,H,.18,'rgba(110,80,40,.22)'); }},
  {id:'sun',n:'Солнце',draw(g,W,H,C){ const gr=g.createLinearGradient(0,0,0,H); gr.addColorStop(0,C.soft); gr.addColorStop(1,C.bg); fill(g,W,H,gr); g.fillStyle=rgba(C.accent2,.9); g.beginPath(); g.arc(W/2,H*.86,W*.42,0,Math.PI*2); g.fill(); g.fillStyle=rgba(C.accent,.18); for(let k=0;k<4;k++) g.fillRect(0,H*.8+k*40,W,10+k*4); texture(g,W,H,'paper',.5); }}
];
const tplById=id=>TPL.find(t=>t.id===id)||TPL[0];
const isDarkBg=(bg,p)=>{ if(!bg) return false; if(bg.k==='tpl'){ const t=tplById(bg.id); if(t.dark) return true; if(t.id==='duo') return true; if(t.id==='solid') return lum(bg.c1||p.col.bg)<.45; if(t.id==='torn') return false; return false; } return !!bg.dark; };
/* the background as one canvas in design units (cached) */
const BGC=new Map();
function bgCanvas(d,sl,p,W,H){ const bg=(sl&&sl.bg)||d.bg||{k:'tpl',id:'solid'}, dim=+d.dim||0, wash=+d.wash||0; const imgId=bg.k==='img'?bg.id:bg.photo; const ready=!imgId||!!bgImageSync(imgId);
  const key=JSON.stringify([bg,p.col,W,H,dim,wash,ready]); if(BGC.has(key)){ const c=BGC.get(key); BGC.delete(key); BGC.set(key,c); return c; }
  const c=cnv(W,H), g=c.getContext('2d'); try{ if(bg.k==='img'){ const im=bgImageSync(bg.id); fill(g,W,H,p.col.bg); if(im) drawCover(g,im,W,H,bg); }
    else tplById(bg.id).draw(g,W,H,Object.assign({},p.col,bg.c1&&bg.id==='solid'?{bg:bg.c1}:{}),bg); }catch(e){ console.warn('[igcover] bg',e); fill(g,W,H,p.col.bg); }
  if(wash>0){ g.fillStyle=rgba(p.col.bg,wash); g.fillRect(0,0,W,H); } if(dim>0){ g.fillStyle='rgba(0,0,0,'+dim+')'; g.fillRect(0,0,W,H); }
  if(imgId&&!ready) bgImage(imgId).then(im=>{ if(im) paintSoon(); });
  BGC.set(key,c); while(BGC.size>5) BGC.delete(BGC.keys().next().value); return c; }
/* ---- text never collides: visual bounds of a block, then a non-destructive flow (blocks the owner moved by hand stay put) ---- */
function textVis(e,L){ const fx=e.fx||{}, px=L.px, al=e.align||'center'; let x0=1e9,x1=-1e9; L.lines.forEach(l=>{ if(!l.w) return; const lx=al==='left'?e.x:al==='right'?e.x+e.w-l.w:e.x+(e.w-l.w)/2; x0=Math.min(x0,lx); x1=Math.max(x1,lx+l.w); }); if(x0>x1){ x0=e.x; x1=e.x+e.w; }
  const pad=fx.pill?px*.55:0, padY=fx.pill?px*.36:0, n=Math.max(1,L.lines.length); return {x0:x0-pad,x1:x1+pad,y0:L.top+L.lineH/2-L.capA-px*.1-padY,y1:L.top+(n-.5)*L.lineH+L.capD+px*(fx.sq?.34:.2)+padY}; }
function flowText(g,d,i,p,els,H){ const T=els.filter(e=>e.t==='text'&&!e.hide).map(e=>{ const L=layoutEl(g,e,d,i,p); return {e,L,b:textVis(e,L),dy:0,fixed:!!e.man||!!e.rot}; });
  if(d.flow===false||T.length<2) return T;
  const ord=T.slice().sort((a,b)=>a.b.y0-b.b.y0), ox=(a,b)=>Math.min(a.b.x1,b.b.x1)-Math.max(a.b.x0,b.b.x0)>Math.min(a.b.x1-a.b.x0,b.b.x1-b.b.x0)*.12, gap=(a,b)=>clamp(Math.min(a.L.px,b.L.px)*.6+Math.max(a.L.px,b.L.px)*.08,18,64);
  /* down: a block that is not placed by hand goes below the blocks above it */
  ord.forEach((it,k)=>{ if(it.fixed) return; let need=0; for(let j=0;j<k;j++){ const a=ord[j]; if(!ox(a,it)) continue; need=Math.max(need,a.b.y1+a.dy+gap(a,it)-(it.b.y0+it.dy)); } if(need>.5) it.dy+=need; });
  /* up: nothing leaves the bottom of the cover; a block squeezed from below moves up instead */
  for(let k=ord.length-1;k>=0;k--){ const it=ord[k]; if(it.fixed) continue; let maxB=H-16; for(let j=k+1;j<ord.length;j++){ const b=ord[j]; if(!ox(it,b)) continue; maxB=Math.min(maxB,b.b.y0+b.dy-gap(it,b)); } const over=it.b.y1+it.dy-maxB; if(over>.5) it.dy-=over; if(it.b.y0+it.dy<8) it.dy=8-it.b.y0; }
  return T; }
/* ---- readability: a soft scrim behind a text block when the picture under it is too close in brightness ---- */
const SMALL=new WeakMap(), LIN=new Float32Array(256).map((_,v)=>{ v/=255; return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4); });
function smallOf(c){ let s=SMALL.get(c); if(s) return s; const k=1/8, w=Math.max(1,Math.round(c.width*k)), h=Math.max(1,Math.round(c.height*k)), x=cnv(w,h).getContext('2d'); x.drawImage(c,0,0,w,h); s={w,h,k,d:x.getImageData(0,0,w,h).data}; SMALL.set(c,s); return s; }
const relL=hex=>{ const [r,g,b]=hex2rgb(hex); return .2126*LIN[r]+.7152*LIN[g]+.0722*LIN[b]; };
function scrimFor(e,v,p,bgc){ const fx=e.fx||{}; if(fx.pill||fx.ol||fx.hollow||e.rot) return null; const s=smallOf(bgc), lt=relL(col(e.color,p)), D=s.d;
  const x0=clamp(Math.floor(v.x0*s.k),0,s.w-1), x1=clamp(Math.ceil(v.x1*s.k),x0+1,s.w), y0=clamp(Math.floor(v.y0*s.k),0,s.h-1), y1=clamp(Math.ceil(v.y1*s.k),y0+1,s.h); let n=0,bad=0;
  for(let y=y0;y<y1;y++) for(let x=x0;x<x1;x++){ const q=(y*s.w+x)*4, lb=.2126*LIN[D[q]]+.7152*LIN[D[q+1]]+.0722*LIN[D[q+2]]; n++; if((Math.max(lt,lb)+.05)/(Math.min(lt,lb)+.05)<2.6) bad++; }
  return n&&bad/n>.16?(lt>.35?'dark':'light'):null; }
function drawScrim(g,v,kind,p,px,op){ const pad=px*.5, x=v.x0-pad, y=v.y0-pad*.7, w=v.x1-v.x0+pad*2, h=v.y1-v.y0+pad*1.4, c=kind==='dark'?'0,0,0':hex2rgb(p.col.bg).join(','), a=(kind==='dark'?.5:.7)*op;
  g.save(); for(let k=5;k>=0;k--){ const e=k*pad*.3; g.fillStyle=`rgba(${c},${a/5})`; rr(g,x-e,y-e,w+2*e,h+2*e,Math.min(h/2,px*.7)+e); g.fill(); } g.restore(); }
/* one slide → canvas context (scale = canvas px per design px). Decor and pictures first, text always on top. */
function drawSlide(g,d,i,p,scale,o){ o=o||{}; const [W,H]=dimsOf(d), sl=d.slides[i]; if(!sl) return; g.save(); g.scale(scale,scale); g.imageSmoothingQuality='high';
  const bgc=bgCanvas(d,sl,p,W,H); g.drawImage(bgc,0,0,W,H); const L={};
  for(const e of sl.els){ if(e.hide||e.t==='text') continue; try{ if(e.t==='shape') drawShape(g,e,p); else if(e.t==='icon') drawIcon(g,e,p); }catch(err){ console.warn('[igcover] draw',err); } }
  let F=[]; try{ F=flowText(g,d,i,p,sl.els,H); }catch(err){ console.warn('[igcover] flow',err); }
  for(const it of F){ const e=it.e; try{ const v={x0:it.b.x0,x1:it.b.x1,y0:it.b.y0+it.dy,y1:it.b.y1+it.dy}; const sc=d.scrim===false?null:scrimFor(e,v,p,bgc); if(sc) drawScrim(g,v,sc,p,it.L.px,clamp(e.op==null?1:+e.op,0,1));
      const Lx=drawText(g,it.dy?Object.assign({},e,{y:e.y+it.dy}):e,d,i,p); Lx.dy=it.dy; Lx.scrim=sc; Lx.vis=v; L[e.id]=Lx; }catch(err){ console.warn('[igcover] draw',err); } }
  g.restore(); return L; }
/* exact-size export of one slide (fonts awaited) */
async function renderSlide(d,i,p,o){ o=o||{}; p=p||PG(); await fontsReady(d,p); const imgs=[d.bg,(d.slides[i]||{}).bg].filter(Boolean).map(b=>b.k==='img'?b.id:b.photo).filter(Boolean); for(const id of imgs) await bgImage(id);
  const [W,H]=dimsOf(d), k=o.scale||1, c=cnv(W*k,H*k); drawSlide(c.getContext('2d'),d,i,p,k,o); return c; }
const canvasBlob=(c,type,qq)=>new Promise(res=>c.toBlob(b=>res(b),type||'image/jpeg',qq||.93));
/* ===== backgrounds: references, Gemini (vision → editable layout, compose → background art without text), history, own photos ===== */
const N=()=>KS.neuro||null;
const hasAI=()=>!!(N()&&N().hasKey&&N().hasKey());
const hasGem=()=>!!(N()&&N().hasGemini&&N().hasGemini());
const price=()=>{ try{ return +N().price()||.04; }catch(_){ return .04; } };
const spend=()=>{ try{ return N().spendLine(); }catch(_){ return ''; } };

/* references (IDB igc:ref:<id> {id,src,thumb,name,added}); page.refs keeps the ids */
async function addRefs(files){ const p=PG(); let n=0; const added=[]; for(const f of [...files].filter(f=>/^image\//.test(f.type||'')).slice(0,8)){ try{ const raw=await KS.readImage(f,2000); const src=await shrink(raw,1600,'image/jpeg',.9), thumb=await shrink(raw,240,'image/jpeg',.82); const id=uid('r');
    await KS.idb.set('igc:ref:'+id,{id,src,thumb,name:f.name||'',added:Date.now()},'files'); IGC.thumbs.set('r:'+id,thumb); p.refs.unshift(id); added.unshift(id); n++; }catch(e){ console.warn('[igcover] ref',e); } }
  if(p.refs.length>12){ const drop=p.refs.splice(12); for(const id of drop) try{ await KS.idb.del('igc:ref:'+id,'files'); }catch(_){ } }
  if(added.length) IGC.refSel=added.slice(0,4); KS.save(); if(n) KS.toast(n===1?'Образец добавлен':'Образцов добавлено: '+n); return n; }
async function delRef(id){ const p=PG(); p.refs=p.refs.filter(x=>x!==id); if(IGC.refSel) IGC.refSel=IGC.refSel.filter(x=>x!==id); try{ await KS.idb.del('igc:ref:'+id,'files'); }catch(_){ } KS.save(); }
const refSel=()=>{ const p=PG(); if(!IGC.refSel||IGC.refSel.some(id=>!p.refs.includes(id))) IGC.refSel=(IGC.refSel||[]).filter(id=>p.refs.includes(id)); if(!IGC.refSel.length&&p.refs.length) IGC.refSel=[p.refs[0]]; return IGC.refSel; };
async function thumbOf(kind,id){ const k=kind+':'+id; if(IGC.thumbs.has(k)) return IGC.thumbs.get(k); const r=await KS.idb.get((kind==='r'?'igc:ref:':'igc:bg:')+id,'files').catch(()=>null); const t=r&&(r.thumb||r.src)||''; IGC.thumbs.set(k,t); return t; }

/* history of backgrounds (generated, own photos): IDB igc:bg:<id> {id,src,thumb,mode,ar,created,ref}; page.bgs = [{id,mode,ar,created}] */
async function addBg(src,o,page){ const p=page||PG(), id=uid('b'); const big=await shrink(src,2048,'image/jpeg',.92), thumb=await shrink(src,260,'image/jpeg',.8);
  await KS.idb.set('igc:bg:'+id,{id,src:big,thumb,mode:o.mode||'ai',ar:o.ar||'',created:Date.now(),ref:o.ref||'',prompt:o.prompt||''},'files'); IGC.thumbs.set('b:'+id,thumb); IGC.img.delete(id);
  p.bgs.unshift({id,mode:o.mode||'ai',ar:o.ar||'',created:Date.now()}); if(p.bgs.length>80){ const drop=p.bgs.splice(80); for(const b of drop) try{ await KS.idb.del('igc:bg:'+b.id,'files'); }catch(_){ } } KS.save(); return id; }
async function delBg(id){ const p=PG(); p.bgs=p.bgs.filter(b=>b.id!==id); IGC.vars=IGC.vars.filter(x=>x!==id); const used=S().pages.some(pg=>[pg.work.main,pg.work.hl].some(d=>d&&(d.bg&&(d.bg.id===id||d.bg.photo===id)))||pg.tpls.some(t=>t.doc&&t.doc.bg&&(t.doc.bg.id===id||t.doc.bg.photo===id)));
  if(!used) try{ await KS.idb.del('igc:bg:'+id,'files'); }catch(_){ } KS.save(); }
async function useBg(id){ const d=D(); if(!d) return; histPush(); const im=await bgImage(id); const wasDark=isDarkBg(d.bg,PG());
  d.bg={k:'img',id,ox:.5,oy:.5,z:1,dark:false}; if(im){ d.bg.dark=await imgDark(im); } contrastFix(d,wasDark,d.bg.dark); KS.save(); paintAll(); }
async function imgDark(im){ const c=cnv(24,24), g=c.getContext('2d'); g.drawImage(im,0,0,24,24); const x=g.getImageData(0,0,24,24).data; let a=0; for(let i=0;i<x.length;i+=4) a+=.299*x[i]+.587*x[i+1]+.114*x[i+2]; return a/(x.length/4)<105; }
/* dark background ↔ light background: page text colours swap so the title stays readable */
function contrastFix(d,was,now,pg){ if(!!was===!!now) return; const p=pg||PG(), accDark=lum(p.col.accent)<.5; d.slides.forEach(sl=>sl.els.forEach(e=>{ if(e.t!=='text'&&e.t!=='icon') return; const fx=e.fx||{};
  if(now&&e.color==='ink'&&!fx.pill) e.color='bg'; else if(!now&&e.color==='bg'&&!fx.pill) e.color='ink';
  if(e.t==='text'){ if(now&&accDark&&(e.acc||'accent')==='accent'){ e.acc='accent2'; e.accD=1; } else if(!now&&e.accD){ e.acc='accent'; delete e.accD; } } })); }
async function photoBg(files,o){ const f=[...(files||[])].find(x=>/^image\//.test(x.type||'')); if(!f) return; return photoBgSrc(await KS.readImage(f,2400),o); }
async function photoBgSrc(raw,o){ o=o||{}; const id=await addBg(raw,{mode:'photo'}); IGC.img.delete(id);
  const d=D(); histPush(); const was=isDarkBg(d.bg,PG()); const im=await bgImage(id); if(o.duo){ d.bg={k:'tpl',id:'duo',photo:id}; } else if(o.polaroid){ d.bg={k:'tpl',id:'polaroid',photo:id}; } else { d.bg={k:'img',id,ox:.5,oy:.5,z:1,dark:im?await imgDark(im):false}; }
  contrastFix(d,was,isDarkBg(d.bg,PG())); KS.save(); paintAll(); KS.toast('Фото стало фоном'); }
function useTpl(id){ const d=D(), p=PG(); histPush(); const was=isDarkBg(d.bg,p), photo=d.bg&&(d.bg.k==='img'?d.bg.id:d.bg.photo); d.bg={k:'tpl',id}; if(photo&&(id==='duo'||id==='polaroid')) d.bg.photo=photo; contrastFix(d,was,isDarkBg(d.bg,p)); KS.save(); paintAll(); }

/* ---- Gemini: layout of the reference ---- */
const ROLES=['title','subtitle','label','number','handle','custom'];
function layoutPrompt(d){ const ar=arOf(d); return `You are a senior Instagram cover designer. IMAGE 1 is a cover the owner likes (further images, if any, are more examples of the same style). Analyse the FIRST image and describe its layout precisely so it can be rebuilt as an EDITABLE design (vector text + shapes over a background picture). The new cover format is ${ar}.
Return ONLY JSON, no markdown:
{"background":{"type":"solid|gradient|paper|texture|grid|lined|photo|illustration","colors":["#RRGGBB",...up to 4, most important first],"gradient":{"angle":0-360,"from":"#RRGGBB","to":"#RRGGBB"} or null,"texture":"short English description of surface texture or null","illustration":"short English description of the picture / illustration / objects and where they sit, or null","dark":true|false},
"palette":["#RRGGBB" x5],
"mood":"3-6 English words",
"text":[{"role":"title|subtitle|label|number|handle|custom","text":"exact text as written","box":{"x":0-1,"y":0-1,"w":0-1,"h":0-1},"align":"left|center|right","case":"upper|lower|title|none","weight":100-900,"style":"serif|sans|script|display|handwritten|mono","color":"#RRGGBB","size":font size as a fraction of the image HEIGHT (e.g. 0.07),"letter_spacing":em (e.g. 0.1),"line_height":1.0-1.6,"accent_words":["words drawn in another colour"],"accent_color":"#RRGGBB or null","highlight":"#RRGGBB marker behind words or null","pill":"#RRGGBB rounded label behind the text or null","outline":"#RRGGBB or null","underline":true|false,"shadow":true|false,"rotation":degrees}],
"shapes":[{"kind":"rect|circle|ring|line|underline|arrow|star|sparkle|heart|frame|tape|burst|blob|check|cross|bubble|wave","box":{"x":0-1,"y":0-1,"w":0-1,"h":0-1},"color":"#RRGGBB","rotation":degrees}],
"empty_areas":"English description of where the text sits (these areas must stay calm in the background)"}
Boxes are relative to the image (x,y = top-left corner, w,h = size). List text blocks from top to bottom; the biggest, most important line is the "title". Do not invent text that is not in the image.`; }
function parseJSON(t){ t=String(t||'').trim().replace(/^```(?:json)?/i,'').replace(/```\s*$/,''); try{ return JSON.parse(t); }catch(_){ } const a=t.indexOf('{'), b=t.lastIndexOf('}'); if(a>=0&&b>a){ try{ return JSON.parse(t.slice(a,b+1)); }catch(_){ } } return null; }
const hexOr=(v,d)=>{ v=String(v||'').trim(); if(/^#?[0-9a-f]{6}$/i.test(v)) return (v[0]==='#'?v:'#'+v).toUpperCase(); if(/^#?[0-9a-f]{3}$/i.test(v)){ const h=v.replace('#',''); return ('#'+h.split('').map(c=>c+c).join('')).toUpperCase(); } return d; };
const box01=b=>{ b=b||{}; let x=clamp(+b.x||0,0,1), y=clamp(+b.y||0,0,1), w=clamp(+b.w||.8,.02,1), h=clamp(+b.h||.1,.01,1); if(x+w>1) w=1-x; if(y+h>1) h=1-y; return {x,y,w,h}; };
/* text of the reference → the owner's current text of the same role (if any) */
function textFor(role,t,old){ const o=old.find(e=>e.role===role&&String(e.text||'').trim()); if(o&&role!=='custom'){ old.splice(old.indexOf(o),1); return o.text; }
  let s=String(t.text||'').trim()||({title:'Your title',subtitle:'subtitle',label:'LABEL',number:'01',handle:'@{handle}'}[role]||'text'); if(role==='handle'&&/^@/.test(s)) s='@{handle}';
  (Array.isArray(t.accent_words)?t.accent_words:[]).filter(w=>w&&String(w).length>1).slice(0,4).forEach(w=>{ const esc=String(w).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); s=s.replace(new RegExp('(^|[^*])('+esc+')(?![*])','i'),'$1**$2**'); }); return s; }
function applyLayout(L,d,p){ const [W,H]=dimsOf(d), sl=d.slides[IGC.slide]||d.slides[0], old=sl.els.filter(e=>e.t==='text').map(e=>({role:e.role,text:e.text})); const els=[];
  const TX=(Array.isArray(L.text)?L.text:[]).slice(0,8);
  TX.forEach(t=>{ const role=ROLES.includes(t.role)?t.role:'custom', b=box01(t.box), st=String(t.style||''); const size=clamp((+t.size||.05)*H,16,320);
    const e=T(role,textFor(role,t,old),{x:Math.round(b.x*W),y:Math.round(b.y*H),w:Math.max(Math.round(b.w*W),180),h:Math.max(Math.round(b.h*H),Math.round(size*1.1)),size:Math.round(size),
      weight:clamp(Math.round((+t.weight||ROLEW[role]||500)/100)*100,100,900),align:['left','center','right'].includes(t.align)?t.align:'center',case:['upper','lower','title','none'].includes(t.case)?t.case:'none',
      color:hexOr(t.color,'ink'),acc:hexOr(t.accent_color,'accent'),ls:clamp(+t.letter_spacing||0,-.05,.6),lh:clamp(+t.line_height||1.1,.85,1.7),fit:true,rot:clamp(+t.rotation||0,-30,30),fx:{},hint:st});
    if(e.x+e.w>W) e.w=W-e.x; if(t.highlight) e.fx.hl=hexOr(t.highlight,'accent2'); if(t.pill) e.fx.pill=hexOr(t.pill,'accent'); if(t.outline){ e.fx.ol=hexOr(t.outline,'ink'); } if(t.underline) e.fx.sq=1; if(t.shadow) e.fx.sh=1;
    if(/script|handwritten/.test(st)&&role!=='title') e.font=p.kind==='en'?'Caveat':'Marck Script'; els.push(e); });
  const SH=SHAPES.map(s=>s[0]); (Array.isArray(L.shapes)?L.shapes:[]).slice(0,10).forEach(s=>{ const b=box01(s.box), k=SH.includes(s.kind)?s.kind:(s.kind==='sticker'?'burst':s.kind==='square'?'rect':null); if(!k) return;
    els.unshift({id:uid('e'),t:'shape',k,x:Math.round(b.x*W),y:Math.round(b.y*H),w:Math.max(12,Math.round(b.w*W)),h:Math.max(8,Math.round(b.h*H)),color:hexOr(s.color,'accent'),rot:clamp(+s.rotation||0,-90,90),op:1}); });
  if(!els.some(e=>e.t==='text')) return false;
  /* the owner's handle stays if the reference had none */
  const h0=old.find(o=>o.role==='handle'); if(h0&&!els.some(e=>e.role==='handle')) els.push(T('handle',h0.text,{y:H-140,h:56,size:32,color:hexOr((TX[0]||{}).color,'ink'),op:.8}));
  sl.els=els; const bg=L.background||{}, cols=(Array.isArray(bg.colors)?bg.colors:[]).map(c=>hexOr(c,null)).filter(Boolean); const dark=!!bg.dark||(cols[0]&&lum(cols[0])<.4);
  { if(bg.gradient&&bg.gradient.from) d.bg={k:'tpl',id:'grad',c1:hexOr(bg.gradient.from,p.col.soft),c2:hexOr(bg.gradient.to,p.col.bg)}; else if(cols[0]) d.bg={k:'tpl',id:'solid',c1:cols[0]}; if(dark) d.bg.dark=true; }
  d.layout={mood:String(L.mood||'').slice(0,80),bg:{type:bg.type||'',texture:String(bg.texture||'').slice(0,240),illustration:String(bg.illustration||'').slice(0,300),colors:cols.slice(0,4)},palette:(L.palette||[]).map(c=>hexOr(c,null)).filter(Boolean).slice(0,6),empty:String(L.empty_areas||'').slice(0,300)};
  IGC.sel=null; return true; }
/* where the text sits, in words, for the background prompt */
function areasOf(d,sl){ const [W,H]=dimsOf(d); const pos=(v,a,b,c)=>v<.34?a:v<.66?b:c; const T2=sl.els.filter(e=>e.t==='text'&&!e.hide); if(!T2.length) return 'the upper half';
  const parts=T2.map(e=>{ const y0=Math.round(e.y/H*100), y1=Math.round((e.y+(e.fit?e.h:e.size*1.3))/H*100), cx=(e.x+e.w/2)/W; return `${pos(cx,'left','centre','right')} ${clamp(y0,0,100)}–${clamp(y1,0,100)}% from the top`; }); return [...new Set(parts)].join('; '); }
function bgPrompt(d,mode,p){ const sl=d.slides[IGC.slide]||d.slides[0], ar=arOf(d), lay=d.layout||{}, b=lay.bg||{}, nref=refSel().length;
  const refs=nref>1?`IMAGES 1–${nref} are style references (covers the owner likes)`:'IMAGE 1 is a style reference (a cover the owner likes)';
  const common=`${refs}. Create a NEW background picture for an Instagram ${d.fmt==='reel'?'Reels / Stories cover':d.fmt==='hl'?'Story Highlight cover':d.fmt==='carousel'?'carousel post':'post'} in ${ar} format: the same visual style, colour palette, textures, lighting, illustration technique and mood as the reference${lay.mood?' ('+lay.mood+')':''}. Do not copy the reference picture one-to-one — make a fresh image in that style.
ABSOLUTELY NO text, letters, words, numbers, digits, logos, handles, watermarks, signatures, captions, UI elements or icons with letters anywhere in the image — not even blurred, tiny or decorative ones. Remove any text you see in the reference.
No frames, borders or margins around the picture: fill the whole ${ar} frame edge to edge.`;
  if(mode==='ref') return common+`
Background type of the reference: ${b.type||'as in the reference'}${b.texture?'; texture: '+b.texture:''}${b.illustration?'; picture content: '+b.illustration:''}${b.colors&&b.colors.length?'; main colours: '+b.colors.join(', '):''}.
Text will be placed later in these areas, so keep them calm, plain and EMPTY (even colour, low detail, no objects): ${areasOf(d,sl)}. Decorative elements and illustration details only outside those areas. ${lay.empty?'(Reference text areas: '+lay.empty+')':''}`;
  return common+`
Keep a large calm, empty area (even colour, low detail) in the ${d.fmt==='hl'?'centre (a circle in the middle)':'upper-middle part'} for a title that will be added later; decoration only near the edges. Palette hint from the owner's page: ${COLKEYS.map(([k])=>p.col[k]).join(', ')}.`; }
/* the whole flow: (vision → layout) + n backgrounds; cost is shown on the button before */
async function aiRun(){ if(IGC.gen) return; const p=PG(), d=D(), ui=S().ui, mode=ui.ai==='bg'?'bg':'ref', n=clamp(+ui.nvar||1,1,4); const ids=refSel();
  if(!hasAI()){ KS.toast('Подключите ИИ: ключ Gemini в настройках'); try{ N().settings(); }catch(_){ } return; }
  if(!ids.length){ KS.toast('Сначала добавьте образец — обложку, которая нравится'); return; }
  if(mode==='ref'&&!hasGem()){ KS.toast('Разбирать образец умеет только Gemini. Выберите «Только фон» или добавьте ключ Gemini'); return; }
  IGC.gen={n,done:0,err:'',stage:mode==='ref'?'layout':'bg',t0:Date.now(),ids:[]}; IGC.vars=[]; IGC.lastErr=''; paintAll();
  try{ const refs=[]; for(const id of ids.slice(0,4)){ const r=await KS.idb.get('igc:ref:'+id,'files').catch(()=>null); if(r&&r.src) refs.push(r.src); } if(!refs.length) throw new Error('Образцы не найдены — добавьте их заново');
    if(mode==='ref'){ const L=parseJSON(await N().vision(refs,layoutPrompt(d),{json:true,max:1280})); const snap=JSON.stringify(d);
      if(!L||!applyLayout(L,d,p)){ throw new Error('Gemini не смог разобрать образец. Попробуйте другую картинку или режим «Только фон»'); }
      histPush(snap); KS.save(); IGC.gen.stage='bg'; paintAll(); }
    const prompt=bgPrompt(d,mode,p); IGC.lastPrompt=prompt; let next=0, stop=false; const errs=[];
    /* the page / design the owner asked for, even if he switches pages while Gemini draws */
    let first=true, got=0; const worker=async()=>{ while(!stop&&next<n){ next++; try{ const out=await N().compose(refs,prompt,{aspect:arOf(d)}); const id=await addBg(out,{mode:mode,ar:arOf(d),ref:ids[0],prompt},p); const here=PG()===p&&D()===d; if(here) IGC.vars.push(id); got++; IGC.gen.done++;
          if(first){ first=false; if(here) await useBg(id); else { const im=await bgImage(id); const was=isDarkBg(d.bg,p); d.bg={k:'img',id,ox:.5,oy:.5,z:1,dark:im?await imgDark(im):false}; contrastFix(d,was,d.bg.dark); KS.save(); } } else paintPanel(); }
        catch(e){ errs.push(e.message||String(e)); if(/ключ|Key|лимит|оплат|Billing|связи|баланс/i.test(e.message||'')) stop=true; IGC.gen.done++; paintPanel(); } } };
    await Promise.all([worker(),n>1?worker():null]);
    if(errs.length&&!got) throw new Error(errs[0]);
    if(errs.length) KS.toast('Готово вариантов: '+got+' из '+n+' · '+errs[0]); else KS.toast(mode==='ref'?'Обложка по образцу готова — текст можно править':'Фон готов'+(n>1?' · выберите вариант':''));
  }catch(e){ IGC.gen.err=e.message||String(e); KS.toast(IGC.gen.err); console.warn('[igcover] ai',e); }
  finally{ const err=IGC.gen&&IGC.gen.err; IGC.gen=null; IGC.lastErr=err||''; paintAll(); } }

/* ---- English page helpers: hooks via Gemini text (local fallback) ---- */
function localHooks(topic){ const t=String(topic||'phrasal verbs with GET').trim(), T1=t.replace(/^./,c=>c.toUpperCase()); const key=(t.match(/\b([A-Z]{2,}|[a-z]+)$/)||[])[1]||'it';
  return [{title:`5 ways to use **${key}**`,sub:'Сохрани, чтобы не забыть'},{title:`Stop saying it wrong: **${T1}**`,sub:'Частые ошибки'},{title:`${T1}: **cheat sheet**`,sub:'Шпаргалка за 1 минуту'},{title:`Do you **really** know ${t}?`,sub:'Проверь себя — ответы в карусели'},{title:`${T1} in **real life**`,sub:'Фразы, которые говорят носители'}]; }
async function ideas(topic){ topic=String(topic||'').trim(); if(!topic){ KS.toast('Напишите тему, например «phrasal verbs with GET»'); return null; }
  if(!hasGem()){ IGC.ideas={topic,list:localHooks(topic),local:true}; return IGC.ideas; }
  const p=PG(); const prompt=`You write hooks for Instagram covers of an English-learning page for Russian-speaking learners${p.handle?' (@'+String(p.handle).replace(/^@/,'')+')':''}. Topic: "${topic}".
Give 5 different short, catchy cover titles IN ENGLISH (max 7 words each) — mix formats: a number list, a question, a common mistake, a challenge, a cheat sheet. Mark the 1–2 key words of each title with **double asterisks**. For each title add a short Russian subtitle (max 6 words).
Return ONLY JSON: {"hooks":[{"title":"...","sub":"..."}]}`;
  try{ const j=parseJSON(await N().text(prompt,{json:true})); const L=(j&&Array.isArray(j.hooks)?j.hooks:[]).map(h=>typeof h==='string'?{title:h,sub:''}:{title:String(h.title||'').slice(0,90),sub:String(h.sub||'').slice(0,60)}).filter(h=>h.title).slice(0,5);
    if(!L.length) throw new Error('empty'); IGC.ideas={topic,list:L}; }
  catch(e){ IGC.ideas={topic,list:localHooks(topic),local:true,err:e.message}; KS.toast('Gemini не ответил — показываю шаблонные идеи'); }
  return IGC.ideas; }
/* ===== actions: undo, formats, elements, presets & series, carousel slides, highlights, templates, export, «В ленту» ===== */
const docKey=()=>{ const p=PG(); return p?p.id+':'+(p.fmt==='hl'?'hl':'main'):''; };
function histPush(snap){ const k=docKey(); if(IGC.hk!==k){ IGC.hist=[]; IGC.fut=[]; IGC.hk=k; } const s=snap||JSON.stringify(D()); if(IGC.hist[IGC.hist.length-1]===s) return; IGC.hist.push(s); if(IGC.hist.length>80) IGC.hist.shift(); IGC.fut=[]; IGC.dirty++; }
function histMove(dir){ const k=docKey(); if(IGC.hk!==k) return false; const from=dir<0?IGC.hist:IGC.fut, to=dir<0?IGC.fut:IGC.hist; if(!from.length) return false; const p=PG(), w=p.fmt==='hl'?'hl':'main';
  to.push(JSON.stringify(p.work[w])); p.work[w]=JSON.parse(from.pop()); if(w==='main') p.fmt=p.work.main.fmt; if(IGC.sel&&!elById(IGC.sel)) IGC.sel=null; KS.save(); paintAll(); return true; }
const undo=()=>histMove(-1), redo=()=>histMove(1);
let saveT=0; const saveSoon=()=>{ clearTimeout(saveT); saveT=setTimeout(()=>KS.save(),500); };

/* ---- formats ---- */
function setFmt(f){ const p=PG(); if(!FMT[f]||p.fmt===f) return; histPush(); IGC.sel=null; IGC.slide=0;
  if(f==='hl'){ p.fmt='hl'; } else { p.fmt=f; const d=p.work.main; convertFmt(d,f); if(f==='carousel'&&d.slides.length===1){ const L=p.kind==='en'?['word','word','end']:['text','end']; L.forEach(k=>d.slides.push(slideOf(k,d,p))); } }
  IGC.hk=docKey(); IGC.hist=[]; IGC.fut=[]; KS.save(); paintAll(); }
function setCarAspect(a){ const d=D(); if(d.fmt!=='carousel'||d.car===a) return; histPush(); const [,H0]=dimsOf(d); d.car=a; const [,H1]=dimsOf(d); d.fmt='post'; d.fmt='carousel'; const k=H1/H0; d.slides.forEach(s=>s.els.forEach(e=>{ const cy=e.y+e.h/2; e.y=Math.max(0,Math.round(cy*k-e.h/2)); })); KS.save(); paintAll(); }

/* ---- elements ---- */
const NEWTXT={title:['Новый заголовок','Your **title**'],subtitle:['подзаголовок','подзаголовок'],label:['МЕТКА','NEW'],number:['01','01'],handle:['@{handle}','@{handle}'],custom:['Текст','Text']};
function addText(role){ const d=D(), p=PG(), sl=SL(), [W,H]=dimsOf(d); histPush(); const en=p.kind==='en'?1:0;
  const o={title:{size:110,h:260,fit:true,y:H*.36},subtitle:{size:46,h:70,y:H*.62},label:{size:34,h:64,ls:.14,case:'upper',color:'bg',fx:{pill:'accent'},y:H*.16},number:{size:220,h:240,color:'accent',fit:true,y:H*.12},handle:{size:32,h:56,ls:.04,op:.8,y:H-150},custom:{size:44,h:70,y:H*.72}}[role]||{};
  const e=T(role,NEWTXT[role][en],Object.assign({},o,{y:Math.round(o.y||H/2)})); if(isDarkBg(d.bg,p)&&e.color==='ink') e.color='bg'; sl.els.push(e); IGC.sel=e.id; KS.save(); paintAll(); focusText(); return e; }
function addShape(k){ const d=D(), sl=SL(), [W,H]=dimsOf(d); histPush(); const wide=['line','underline','tape','wave','arrow'].includes(k); const w=k==='frame'?W-120:wide?(k==='arrow'?240:360):200, h=k==='frame'?H-120:k==='line'?14:k==='underline'?60:k==='tape'?70:k==='wave'?44:k==='arrow'?180:200;
  const free=freeSpot(w,h); const e={id:uid('e'),t:'shape',k,x:k==='frame'?60:free.x,y:k==='frame'?60:free.y,w,h,color:k==='tape'?'accent2':k==='frame'?'ink':'accent',op:1,rot:k==='tape'?-6:0}; if(k==='frame') sl.els.unshift(e); else sl.els.push(e); IGC.sel=e.id; KS.save(); paintAll(); return e; }
function addIcon(k){ const d=D(), sl=SL(), [W,H]=dimsOf(d); histPush(); const s=d.fmt==='hl'?280:180, f=d.fmt==='hl'?{x:Math.round((W-s)/2),y:Math.round((H-s)/2)}:freeSpot(s,s); const e={id:uid('e'),t:'icon',k,x:f.x,y:f.y,w:s,h:s,color:'accent',sw:1.7,op:1,rot:0}; sl.els.push(e); IGC.sel=e.id; KS.save(); paintAll(); return e; }
/* a place for a new decoration that covers as little text as possible (corners and edges first) */
function freeSpot(w,h){ const d=D(), sl=SL(), [W,H]=dimsOf(d), m=70; const C=[[W-w-m,m+40],[m,m+40],[W-w-m,H-h-m-60],[m,H-h-m-60],[W-w-m,(H-h)/2],[m,(H-h)/2],[(W-w)/2,m]];
  const boxes=sl.els.filter(e=>!e.hide).map(e=>{ const L=VIEW.L[e.id]; if(e.t!=='text'||!L) return {x:e.x,y:e.y,w:e.w,h:e.h}; const lw=Math.max(1,...L.lines.map(l=>l.w)), al=e.align||'center'; return {x:al==='left'?e.x:al==='right'?e.x+e.w-lw:e.x+(e.w-lw)/2,y:L.top,w:lw,h:L.h}; });
  const cost=([x,y])=>boxes.reduce((a,b)=>a+Math.max(0,Math.min(x+w,b.x+b.w)-Math.max(x,b.x))*Math.max(0,Math.min(y+h,b.y+b.h)-Math.max(y,b.y)),0);
  let best=C[0],bv=1e18; C.forEach(c=>{ const v=cost(c); if(v<bv-1){ bv=v; best=c; } }); return {x:Math.round(clamp(best[0],0,W-w)),y:Math.round(clamp(best[1],0,H-h))}; }
function delEl(id){ const sl=SL(); const i=sl.els.findIndex(e=>e.id===id); if(i<0) return; histPush(); sl.els.splice(i,1); if(IGC.sel===id) IGC.sel=null; KS.save(); paintAll(); }
function dupEl(id){ const sl=SL(), e=sl.els.find(x=>x.id===id); if(!e) return; histPush(); const n=clone(e); n.id=uid('e'); n.x+=30; n.y+=30; sl.els.splice(sl.els.indexOf(e)+1,0,n); IGC.sel=n.id; KS.save(); paintAll(); }
function orderEl(id,dir){ const sl=SL(), i=sl.els.findIndex(e=>e.id===id), j=i+dir; if(i<0||j<0||j>=sl.els.length) return; histPush(); const [e]=sl.els.splice(i,1); sl.els.splice(j,0,e); KS.save(); paintAll(); }
/* recolour literal colours (from a reference) into the page colours */
function toPageColours(){ const d=D(), p=PG(); histPush(); d.slides.forEach(sl=>sl.els.forEach(e=>{ ['color','acc'].forEach(k=>{ if(isHex(e[k])) e[k]=nearestKey(e[k],p); }); const fx=e.fx||{}; ['hl','pill','ol','sqc'].forEach(k=>{ if(isHex(fx[k])) fx[k]=nearestKey(fx[k],p); }); })); KS.save(); paintAll(); KS.toast('Цвета страницы применены'); }
function pageFontsAll(){ const d=D(); histPush(); d.slides.forEach(sl=>sl.els.forEach(e=>{ if(e.t==='text'&&!isOwn(e.font)) e.font=''; })); KS.save(); paintAll(); KS.toast('Шрифты страницы на всех блоках'); }

/* ---- presets (English page and generic ones) with series numbering ---- */
const PRESETS={
  lesson:{n:'Lesson N',ic:'book',bg:'grid',els:(p,H)=>[T('label','LESSON {num}',{y:H*.16,h:68,size:34,ls:.14,case:'upper',color:'bg',fx:{pill:'accent'}}),T('title','Phrasal verbs\nwith **GET**',{y:H*.29,h:H*.32,size:130,lh:1.02,fit:true,fx:{hl:'accent2'}}),T('subtitle','5 фраз на каждый день',{y:H*.66,h:70,size:46,op:.85}),T('handle','@{handle}',{y:H-150,h:56,size:32,ls:.04,op:.75})]},
  wotd:{n:'Word of the day',ic:'sparkle',bg:'index',els:(p,H)=>[T('label','WORD OF THE DAY · #{num}',{y:H*.2,h:56,size:30,ls:.16,case:'upper',color:'accent'}),T('title','**serendipity**',{y:H*.31,h:H*.17,size:120,fit:true,fx:{sq:1}}),T('subtitle','/ˌser.ənˈdɪp.ə.ti/',{y:H*.51,h:60,size:40,color:'accent',op:.9}),T('custom','счастливая случайность',{y:H*.59,h:64,size:44,weight:600}),T('custom','It was pure **serendipity**\nthat we met.',{y:H*.7,h:130,size:40,it:1,op:.85,fit:true}),T('handle','@{handle}',{y:H-150,h:56,size:30,op:.7})]},
  mistakes:{n:'Common mistakes',ic:'question',bg:'lined',els:(p,H)=>[T('label','COMMON MISTAKES',{y:H*.15,h:64,size:32,ls:.14,case:'upper',color:'bg',fx:{pill:'ink'}}),{id:uid('e'),t:'shape',k:'cross',x:780,y:Math.round(H*.27),w:120,h:120,color:'accent',op:1,rot:0},T('title','Stop saying\n«**I am agree**»',{y:H*.33,h:H*.3,size:118,fit:true,acc:'accent',fx:{}}),T('subtitle','Say: I agree ✓',{y:H*.68,h:70,size:48,weight:700,color:'ink',fx:{hl:'accent2'}}),T('handle','@{handle}',{y:H-150,h:56,size:32,op:.75})]},
  phrasal:{n:'Phrasal verbs',ic:'list',bg:'sticky',els:(p,H)=>[T('label','PHRASAL VERBS #{num}',{y:H*.2,h:60,size:32,ls:.12,case:'upper',color:'ink',op:.8}),T('title','**GET** up\n**GET** over\n**GET** by',{y:H*.3,h:H*.38,size:120,lh:1.05,fit:true,acc:'accent'}),T('subtitle','что они значат? →',{y:H*.71,h:64,size:42,font:p.kind==='en'?'Caveat':'',weight:700}),T('handle','@{handle}',{y:H-120,h:50,size:30,op:.7})]},
  idioms:{n:'Idioms',ic:'bulb',bg:'chalk',dark:true,els:(p,H)=>[T('label','IDIOMS #{num}',{y:H*.17,h:60,size:32,ls:.16,case:'upper',color:'accent2'}),T('title','Break\nthe **ice**',{y:H*.29,h:H*.34,size:150,lh:1,fit:true,color:'bg',acc:'accent2'}),T('subtitle','= начать разговор',{y:H*.68,h:70,size:48,color:'bg',font:p.kind==='en'?'Caveat':'',weight:700}),T('handle','@{handle}',{y:H-150,h:56,size:30,color:'bg',op:.7})]},
  grammar:{n:'Grammar',ic:'pencil',bg:'hl',els:(p,H)=>[T('label','GRAMMAR #{num}',{y:H*.15,h:64,size:32,ls:.14,case:'upper',color:'bg',fx:{pill:'accent'}}),T('title','Present Perfect\nvs **Past Simple**',{y:H*.28,h:H*.34,size:116,fit:true,fx:{hl:'accent2'}}),T('subtitle','разница за 1 минуту',{y:H*.67,h:70,size:46,op:.85}),T('handle','@{handle}',{y:H-150,h:56,size:32,op:.75})]},
  new:{n:'Новинка',ic:'sparkle',bg:'paper',els:(p,H)=>[T('label','НОВИНКА',{y:H*.16,h:68,size:34,ls:.16,case:'upper',color:'bg',fx:{pill:'accent'}}),T('title','Конверты\nс **сургучом**',{y:H*.3,h:H*.32,size:136,lh:1.02,fit:true}),T('subtitle','ручная работа · Ереван',{y:H*.66,h:70,size:44,op:.85}),T('handle','@{handle}',{y:H-150,h:56,size:32,op:.75})]},
  sale:{n:'Акция',ic:'tag',bg:'split',els:(p,H)=>[{id:uid('e'),t:'shape',k:'burst',x:700,y:Math.round(H*.08),w:280,h:280,color:'accent',op:1,rot:-8},T('number','−20%',{x:715,y:H*.08+80,w:250,h:120,size:96,color:'bg',fit:true,rot:-8}),T('title','Открытки\nк **праздникам**',{y:H*.36,h:H*.3,size:120,fit:true}),T('subtitle','до конца месяца',{y:H*.7,h:66,size:44,op:.85}),T('handle','@{handle}',{y:H-150,h:56,size:32,op:.75})]},
  process:{n:'Как мы делаем',ic:'printer',bg:'kraft',els:(p,H)=>[T('label','ПРОЦЕСС #{num}',{y:H*.16,h:60,size:32,ls:.16,case:'upper',color:'bg',fx:{pill:'ink'}}),T('title','Как рождается\n**открытка**',{y:H*.3,h:H*.32,size:120,fit:true,color:'ink'}),T('subtitle','от эскиза до сургуча',{y:H*.66,h:70,size:44}),T('handle','@{handle}',{y:H-150,h:56,size:32,op:.8})]},
  review:{n:'Отзыв',ic:'chat',bg:'frame',els:(p,H)=>[{id:uid('e'),t:'shape',k:'bubble',x:140,y:Math.round(H*.2),w:800,h:Math.round(H*.48),color:'soft',op:1,rot:0},T('title','«Самые красивые\nприглашения!»',{x:200,y:H*.25,w:680,h:H*.3,size:84,fit:true,it:1}),T('subtitle','— Анна, свадьба',{y:H*.72,h:60,size:40,op:.85}),T('handle','@{handle}',{y:H-150,h:56,size:32,op:.75})]}
};
const PRESET_SETS={en:['lesson','wotd','mistakes','phrasal','idioms','grammar'],shop:['new','sale','process','review'],other:['new','sale','process','review','lesson','wotd']};
function applyPreset(id){ const P=PRESETS[id]; if(!P) return; const p=PG(); if(p.fmt==='hl') p.fmt='post'; const d=D(), [W,H]=dimsOf(d); void W; histPush(); const was=isDarkBg(d.bg,p);
  const num=(+p.series[id]||0)+1; p.series[id]=num; d.num=num; d.series=id; d.bg={k:'tpl',id:P.bg}; d.dim=0; d.wash=0; delete d.layout;
  const els=P.els(p,H).map(e=>{ e.y=Math.round(e.y); e.h=Math.round(e.h); return e; }); d.slides[0].els=els; d.slides[0].kind='cover'; IGC.slide=0; IGC.sel=null;
  if(!P.dark&&was) contrastFix(d,true,false); KS.save(); paintAll(); KS.toast(P.n+' · выпуск №'+num); }
function setNum(n){ const d=D(), p=PG(); n=clamp(Math.round(+n||1),1,9999); if(d.num===n) return; histPush(); d.num=n; if(d.series) p.series[d.series]=Math.max(n,0); KS.save(); paintAll(); }
/* the next cover of the series: same design, number + 1 */
function nextIssue(){ const d=D(), p=PG(); histPush(); const n=(d.series?Math.max(+p.series[d.series]||0,d.num||0):(d.num||0))+1; d.num=n; if(d.series) p.series[d.series]=n; KS.save(); paintAll(); KS.toast('Выпуск №'+n+' — поменяйте текст'); }

/* ---- carousel slides ---- */
const SLIDES={word:'Слово + перевод',list:'Список',mistake:'Ошибка → правильно',text:'Текст',end:'Финал «подпишись»',copy:'Копия слайда'};
function slideOf(kind,d,p){ const [W,H]=dimsOf(d); const pg=T('custom','{n}/{N}',{x:W-230,y:60,w:170,h:50,size:30,align:'right',op:.55,weight:600}); let els=[];
  if(kind==='word') els=[pg,T('label','WORD',{x:90,y:H*.14,w:400,h:50,size:28,ls:.18,case:'upper',align:'left',color:'accent'}),T('title','get up',{x:90,y:H*.19,w:900,h:H*.15,size:120,align:'left',fit:true}),
    T('subtitle','/ɡet ʌp/',{x:90,y:H*.36,w:900,h:56,size:40,align:'left',color:'accent'}),T('custom','вставать, подниматься',{x:90,y:H*.43,w:900,h:64,size:46,align:'left',weight:600}),
    {id:uid('e'),t:'shape',k:'line',x:90,y:Math.round(H*.53),w:240,h:10,color:'accent2',op:1,rot:0},T('label','EXAMPLE',{x:90,y:H*.57,w:400,h:46,size:26,ls:.18,case:'upper',align:'left',op:.6}),
    T('custom','I **get up** at 7 a.m.\nevery day.',{x:90,y:H*.62,w:900,h:H*.2,size:56,align:'left',lh:1.2,fit:true,fx:{hl:'accent2'}}),T('handle','@{handle}',{y:H-120,h:50,size:28,op:.6})];
  else if(kind==='list') els=[pg,T('title','Remember:',{y:H*.12,h:H*.14,size:96,fit:true}),T('custom','1. get up — вставать\n2. get over — пережить\n3. get by — справляться',{x:110,y:H*.32,w:860,h:H*.44,size:54,align:'left',lh:1.6,fit:true}),T('handle','@{handle}',{y:H-120,h:50,size:28,op:.6})];
  else if(kind==='mistake') els=[pg,{id:uid('e'),t:'shape',k:'cross',x:100,y:Math.round(H*.2),w:110,h:110,color:'accent',op:1,rot:0},T('custom','I am agree',{x:240,y:H*.2,w:760,h:110,size:72,align:'left',fit:true,color:'accent',op:.8}),
    {id:uid('e'),t:'shape',k:'check',x:100,y:Math.round(H*.45),w:110,h:110,color:'#2FA463',op:1,rot:0},T('custom','I **agree**',{x:240,y:H*.45,w:760,h:110,size:80,align:'left',fit:true,weight:800,fx:{hl:'accent2'}}),
    T('subtitle','agree — глагол, «am» не нужен',{y:H*.7,h:110,size:42,fit:true,op:.85}),T('handle','@{handle}',{y:H-120,h:50,size:28,op:.6})];
  else if(kind==='end'){ const en=p.kind==='en'; els=[T('title',en?'Сохрани,\nчтобы **не забыть**':'Сохрани,\nчтобы **не потерять**',{y:H*.24,h:H*.3,size:110,fit:true,fx:{hl:'accent2'}}),{id:uid('e'),t:'shape',k:'arrow',x:420,y:Math.round(H*.58),w:240,h:170,color:'accent',op:1,rot:20},T('subtitle',en?'Подпишись — новый урок каждый день':'Заказ — в директ · доставка по Еревану',{y:H*.74,h:110,size:44,fit:true}),T('handle','@{handle}',{y:H*.84,h:60,size:40,weight:700,color:'accent'})]; }
  else if(kind==='copy') return Object.assign(clone(d.slides[IGC.slide]||d.slides[0]),{id:uid('s'),kind:'copy'});
  else els=[pg,T('title','Заголовок слайда',{y:H*.14,h:H*.16,size:88,fit:true}),T('custom','Короткий текст: 2–3 строки, крупно и по делу. Выделяйте **главное** звёздочками.',{x:110,y:H*.36,w:860,h:H*.36,size:50,align:'left',lh:1.35,fit:true}),T('handle','@{handle}',{y:H-120,h:50,size:28,op:.6})];
  if(isDarkBg(d.bg,p)) els.forEach(e=>{ if(e.color==='ink') e.color='bg'; });
  els.forEach(e=>{ e.y=Math.round(e.y); e.h=Math.round(e.h); }); return {id:uid('s'),kind,els}; }
function addSlide(kind){ const d=D(), p=PG(); if(d.fmt!=='carousel'&&d.fmt!=='hl') return; histPush(); const s=d.fmt==='hl'?(kind==='copy'?Object.assign(clone(SL()),{id:uid('s')}):hlSlide('Новый','star')):slideOf(kind,d,p); if(d.fmt==='hl'&&kind==='copy') s.name=(SL().name||'')+' 2';
  if(d.slides.length>=20){ KS.toast('Не больше 20 слайдов'); return; } d.slides.splice(IGC.slide+1,0,s); IGC.slide++; IGC.sel=null; KS.save(); paintAll(); }
function delSlide(i){ const d=D(); if(d.slides.length<=1){ KS.toast('Нужен хотя бы один слайд'); return; } histPush(); d.slides.splice(i,1); IGC.slide=clamp(IGC.slide>=i?IGC.slide-1:IGC.slide,0,d.slides.length-1); IGC.sel=null; KS.save(); paintAll(); }
function moveSlide(i,dir){ const d=D(), j=i+dir; if(j<0||j>=d.slides.length) return; histPush(); const [s]=d.slides.splice(i,1); d.slides.splice(j,0,s); IGC.slide=j; KS.save(); paintAll(); }
function goSlide(i){ const d=D(); IGC.slide=clamp(i,0,d.slides.length-1); IGC.sel=null; paintAll(); }

/* ---- «Мои шаблоны» (per page): the doc JSON in st, the thumbnail in IDB igc:tth:<id> ---- */
const docTitle=d=>{ const t=(d.slides[0]||{els:[]}).els.find(e=>e.t==='text'&&e.role==='title')||(d.slides[0]||{els:[]}).els.find(e=>e.t==='text'); return t?String(t.text).replace(/\*|\{[a-zN]+\}/g,'').replace(/\s+/g,' ').trim().slice(0,40):''; };
async function tplThumb(id,d,p){ try{ const c=await renderSlide(d,0,p,{scale:.24}); const u=c.toDataURL('image/jpeg',.8); IGC.thumbs.set('t:'+id,u); await KS.idb.set('igc:tth:'+id,u,'files'); }catch(e){ console.warn('[igcover] thumb',e); } }
async function tplSave(name){ const p=PG(), d=D(), id=uid('t'); const t={id,name:String(name||docTitle(d)||FMT[d.fmt].s).slice(0,50),created:Date.now(),fmt:d.fmt,doc:clone(d)}; p.tpls.unshift(t); KS.save(); await tplThumb(id,d,p); paintPanel(); KS.toast('Шаблон «'+t.name+'» сохранён'); return t; }
function tplOpen(id){ const p=PG(), t=p.tpls.find(x=>x.id===id); if(!t) return; histPush(); const d=clone(t.doc); d.id=uid('d'); d.slides.forEach(s=>{ s.id=uid('s'); s.els.forEach(e=>e.id=uid('e')); });
  if(d.fmt==='hl'){ p.work.hl=d; p.fmt='hl'; } else { p.work.main=d; p.fmt=d.fmt; } IGC.slide=0; IGC.sel=null; KS.save(); paintAll(); KS.toast('Открыт шаблон «'+t.name+'»'); }
async function tplDup(id){ const p=PG(), t=p.tpls.find(x=>x.id===id); if(!t) return; const n=Object.assign(clone(t),{id:uid('t'),name:(t.name+' (копия)').slice(0,50),created:Date.now()}); p.tpls.splice(p.tpls.indexOf(t)+1,0,n); KS.save(); const th=IGC.thumbs.get('t:'+id)||await KS.idb.get('igc:tth:'+id,'files').catch(()=>null); if(th){ IGC.thumbs.set('t:'+n.id,th); await KS.idb.set('igc:tth:'+n.id,th,'files'); } paintPanel(); }
async function tplDel(id){ const p=PG(); p.tpls=p.tpls.filter(x=>x.id!==id); KS.save(); try{ await KS.idb.del('igc:tth:'+id,'files'); }catch(_){ } IGC.thumbs.delete('t:'+id); paintPanel(); }

/* ---- export ---- */
const fileBase=()=>{ const p=PG(), d=D(); return slug(p.handle||p.name)+'_'+({post:'post',square:'square',reel:'reels',carousel:'karusel',hl:'highlights'}[d.fmt]||'cover')+'_'+KS.today(); };
async function exportFiles(only){ const d=D(), p=PG(), png=S().ui.type==='png', type=png?'image/png':'image/jpeg', ext=png?'png':'jpg'; const multi=(d.fmt==='carousel'||d.fmt==='hl')&&!only;
  const idx=multi?visibleSlides(d).map((_,i)=>i):[d.fmt==='carousel'||d.fmt==='hl'?IGC.slide:0]; setBusy('Готовлю '+(multi?idx.length+' '+plural(idx.length,'файл','файла','файлов'):'файл')+'…'); const files=[];
  try{ for(const i of idx){ const c=await renderSlide(d,i,p); const b=await canvasBlob(c,type,.93); const nm=d.fmt==='hl'?String(i+1).padStart(2,'0')+'_'+slug(d.slides[i].name||'highlight'):d.fmt==='carousel'?String(i+1).padStart(2,'0')+(i===0?'_cover':''):fileBase(); files.push({name:nm+'.'+ext,blob:b,w:c.width,h:c.height}); }
    if(files.length===1){ const nm=multi?files[0].name:(d.fmt==='carousel'||d.fmt==='hl'?fileBase()+'_'+files[0].name:files[0].name); await KS.download(nm,files[0].blob); KS.toast('Сохранено: '+nm+' · '+files[0].w+'×'+files[0].h); return files; }
    let Z=null; try{ Z=await loadLib('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',()=>window.JSZip); }catch(_){ }
    if(Z){ const z=new Z(); files.forEach(f=>z.file(f.name,f.blob)); const zb=await z.generateAsync({type:'blob'}); await KS.download(fileBase()+'.zip',zb); KS.toast('Архив: '+files.length+' '+plural(files.length,'файл','файла','файлов')+' · '+files[0].w+'×'+files[0].h); }
    else { for(const f of files){ await KS.download(fileBase()+'_'+f.name,f.blob); await sleep(300); } KS.toast('Сохранено файлов: '+files.length); }
    return files; }
  catch(e){ console.warn('[igcover] export',e); KS.toast('Не получилось сохранить: '+(e.message||e)); return []; } finally{ setBusy(''); } }
async function toFeed(){ const A=KS.insta; if(!A||typeof A.addPosts!=='function'){ KS.toast('Раздел «Лента» Instagram не подключён — скачайте обложку файлом'); return null; } const d=D(), p=PG();
  if(d.fmt==='hl'){ KS.toast('Highlights не ставятся в ленту — скачайте их и загрузите в Instagram'); return null; }
  setBusy('Ставлю обложку в ленту…'); try{ const c=await renderSlide(d,0,p); const src=c.toDataURL('image/jpeg',.92); let look=''; try{ look=(A.state&&A.state.set&&A.state.set.look)||(st.ks&&st.ks.insta&&st.ks.insta.look)||''; }catch(_){ }
    const r=await A.addPosts([{id:uid('igc'),src,name:'Обложка «'+(docTitle(d)||p.name)+'»',look,scene:'',from:'igcover',page:p.id,w:c.width,h:c.height,added:Date.now()}]);
    if(r&&r.added){ IGC.fed={t:Date.now(),set:r.set}; paintScreenHead(); } return r; }
  catch(e){ KS.toast('Не получилось: '+(e.message||e)); return null; } finally{ setBusy(''); } }
/* ===== side panel: pages, «Обложка по образцу» (Gemini), background, own fonts, quick start (English page), «Мои шаблоны» ===== */
const PANEL_SEL='.kspanel[data-panel="ks-insta"]';
const panelBox=()=>{ const p=q(PANEL_SEL); return p&&p.dataset.sub==='igcover'?p.querySelector('.kssub'):null; };
const initials=n=>{ const w=String(n||'?').trim().split(/\s+/); return ((w[0]||'?')[0]+((w[1]||'')[0]||'')).toUpperCase(); };
const ago=t=>{ const d=new Date(t); return d.toLocaleDateString('ru-RU',{day:'numeric',month:'short'}); };
const kb=n=>n>1048576?(n/1048576).toFixed(1).replace('.',',')+' МБ':Math.max(1,Math.round(n/1024))+' КБ';
function pagesCard(){ const s=S(), p=PG(); return `<section class="card igc-card igc-pagecard"><div class="igc-hd"><span class="igc-ht">${I(IC.ig)}<b>Страница</b></span><span class="ks-sp"></span><button class="btn sm igc-b" data-igc="pageedit" title="Название, ник, цвета и шрифты страницы">${I(IC.gear)}Настроить</button></div>
  <div class="igc-pgs" role="tablist">${s.pages.map(x=>`<button class="igc-pg${x.id===p.id?' on':''}" data-igc="page" data-igcv="${x.id}" role="tab" aria-selected="${x.id===p.id}"><i style="background:${x.col.accent};color:${x.col.bg}">${E(initials(x.name))}</i><span>${E(x.name)}</span></button>`).join('')}<button class="igc-pg add" data-igc="pageadd" title="Новая страница" aria-label="Новая страница">${I(IC.plus)}</button></div>
  <div class="igc-pgmeta"><span class="igc-dots">${COLKEYS.map(([k,n])=>`<i style="background:${p.col[k]}" title="${n}"></i>`).join('')}</span><span class="igc-hdl">@${E(String(p.handle||'').replace(/^@/,''))}</span><span class="igc-pgf" title="Шрифты страницы: заголовки / текст">${I(IC.font)}${E(fontName(p.fonts.title))} · ${E(fontName(p.fonts.text))}</span></div></section>`; }
function aiCard(){ const p=PG(), ui=S().ui, sel=refSel(), n=clamp(+ui.nvar||1,1,4), ai=hasAI(), gem=hasGem(), mode=ui.ai==='bg'?'bg':'ref', g=IGC.gen; const cost=n*price();
  const refs=p.refs.map(id=>`<span class="igc-ref${sel.includes(id)?' on':''}"><button class="igc-refb" data-igc="refsel" data-igcv="${id}" aria-pressed="${sel.includes(id)}" title="Использовать этот образец"><img data-igcth="r:${id}" alt="">${sel.includes(id)?`<i class="igc-refn">${sel.indexOf(id)+1}</i>`:''}</button><button class="igc-x" data-igc="refdel" data-igcv="${id}" title="Удалить образец" aria-label="Удалить образец">${I(IC.x)}</button></span>`).join('');
  const busy=g?`<div class="igc-genline"><i class="igc-spin"></i><span>${g.stage==='layout'?'Gemini разбирает образец…':'Рисую фон '+Math.min(g.done+1,g.n)+' из '+g.n+'…'}</span></div>`:'';
  return `<section class="card igc-card igc-ai" data-igcdrop="ref"><div class="igc-hd"><span class="igc-ht">${I(IC.spark)}<b>Обложка по образцу</b></span><span class="ks-sp"></span><span class="ks-badge ${gem?'ok':ai?'warn':''}">${gem?'Gemini':ai?'fal.ai':'нет ключа'}</span></div>
  <p class="hint">Загрузите 1–4 обложки, которые нравятся. Gemini повторит стиль, а текст будет вашим шрифтом и останется редактируемым.</p>
  <div class="igc-refs">${refs}<button class="igc-refadd" data-igc="refadd" title="Добавить образцы">${I(IC.plus)}<span>${p.refs.length?'Ещё':'Образец'}</span></button></div>
  <div class="seg igc-wide" role="tablist"><button data-igc="aimode" data-igcv="ref" class="${mode==='ref'?'on':''}">Как на образце</button><button data-igc="aimode" data-igcv="bg" class="${mode==='bg'?'on':''}">Только фон</button></div>
  <p class="hint igc-mhint">${mode==='ref'?'Разберёт образец (текст, цвета, расположение, плашки) → соберёт такую же раскладку из ваших блоков и нарисует фон <b>без букв</b> с пустыми местами под текст.':'Нарисует только фон в стиле образца, с пустым местом под заголовок. Ваш текст останется как есть.'}${mode==='ref'&&ai&&!gem?'<br><b>Разбирать образец умеет только Gemini</b> — для fal.ai выберите «Только фон».':''}</p>
  <div class="igc-row2"><span class="hint">Вариантов</span><div class="seg">${[1,2,3,4].map(k=>`<button data-igc="nvar" data-igcv="${k}" class="${k===n?'on':''}">${k}</button>`).join('')}</div></div>
  ${ai?`<button class="btn primary igc-big igc-go" data-igc="aigo"${g||!p.refs.length?' disabled':''}>${I(IC.spark)}<span><b>${g?'Работаю…':mode==='ref'?'Сделать по образцу':'Нарисовать фон'}</b><small>${n} ${plural(n,'вариант','варианта','вариантов')} × ${usd(price())} ≈ ${usd(cost)}${mode==='ref'?' + разбор ≈ $0,001':''}</small></span></button>
  <p class="hint igc-cost">${p.refs.length?'Потрачено: '+E(String(spend()).split(' · ').slice(1).join(' · ')||'—'):'Сначала добавьте образец'}</p>`:`<div class="igc-note">${I(IC.spark)}<span>Для ИИ нужен ключ Gemini (Google AI Studio). Без ключа всё остальное работает: шаблоны фонов, свои фото, шрифты и экспорт.</span></div><button class="btn igc-b" data-igc="aikey">${I(IC.gear)}Подключить ИИ</button>`}
  ${busy}${IGC.lastErr&&!g?`<div class="igc-note warn">${I(IC.x)}<span>${E(IGC.lastErr)}</span></div>`:''}
  ${IGC.vars.length?`<div class="hd2">Варианты — нажмите, чтобы выбрать</div><div class="igc-vars">${IGC.vars.map((id,i)=>`<button class="igc-var${(D().bg||{}).id===id?' on':''}" data-igc="usebg" data-igcv="${id}" title="Вариант ${i+1}"><img data-igcth="b:${id}" alt=""><b>${i+1}</b></button>`).join('')}</div>`:''}
  ${D().layout?`<div class="flexw"><button class="btn sm igc-b" data-igc="pagecols">${I(IC.wand)}Цвета страницы</button><button class="btn sm igc-b" data-igc="pagefonts">${I(IC.font)}Шрифты страницы</button></div>`:''}</section>`; }
let tplThumbKey='', tplThumbs={};
function tplThumbsFor(p,ar){ const key=JSON.stringify(p.col)+ar; if(key===tplThumbKey) return tplThumbs; tplThumbKey=key; tplThumbs={}; const H=ar==='9:16'?1920:ar==='1:1'?1080:1350, tw=84, k=tw/1080;
  TPL.forEach(t=>{ try{ const c=cnv(tw,H*k), g=c.getContext('2d'); g.scale(k,k); t.draw(g,1080,H,p.col,{}); tplThumbs[t.id]=c.toDataURL('image/jpeg',.82); }catch(e){ tplThumbs[t.id]=''; } }); return tplThumbs; }
function bgCard(){ const p=PG(), d=D(), ui=S().ui, tab=['tpl','hist','photo'].includes(ui.bgTab)?ui.bgTab:'tpl', bg=d.bg||{}; let body='';
  if(tab==='tpl'){ const th=tplThumbsFor(p,arOf(d)); body=`<div class="igc-tpls${arOf(d)==='9:16'?' tall':arOf(d)==='1:1'?' sq':''}">${TPL.map(t=>`<button class="igc-tpl${bg.k==='tpl'&&bg.id===t.id?' on':''}" data-igc="tpl" data-igcv="${t.id}" title="${E(t.n)}"><img src="${th[t.id]||''}" alt=""><span>${E(t.n)}</span></button>`).join('')}</div>`; }
  else if(tab==='hist') body=p.bgs.length?`<p class="hint">Готовые фоны этой страницы — бесплатно, сколько угодно раз.</p><div class="igc-hist">${p.bgs.map(b=>`<span class="igc-hb${bg.id===b.id||bg.photo===b.id?' on':''}"><button data-igc="usebg" data-igcv="${b.id}" title="${b.mode==='photo'?'Своё фото':'Gemini'} · ${ago(b.created)}"><img data-igcth="b:${b.id}" alt=""><small>${b.mode==='photo'?'фото':b.ar||'ИИ'}</small></button><button class="igc-x" data-igc="bgdel" data-igcv="${b.id}" aria-label="Удалить фон">${I(IC.x)}</button></span>`).join('')}</div>`:`<div class="ks-empty">Здесь появятся фоны, нарисованные Gemini, и ваши фото. Их можно брать снова бесплатно.</div>`;
  else body=`<div class="ks-drop igc-drop" data-igc="photoup" data-igcdrop="photo">${I(IC.img)}<b>Своё фото фоном</b><span>нажмите или перетащите сюда</span></div>
    ${KS.photos?`<button class="btn sm igc-b" data-igc="photolib">${I(IC.img)}Из «Мои фото»</button>`:''}
    ${(bg.k==='img'&&p.bgs.some(b=>b.id===bg.id&&b.mode==='photo'))||bg.photo?`<div class="hd2">Как показать фото</div><div class="seg igc-wide"><button data-igc="photoas" data-igcv="img" class="${bg.k==='img'?'on':''}">Как есть</button><button data-igc="photoas" data-igcv="duo" class="${bg.id==='duo'?'on':''}">Дуотон</button><button data-igc="photoas" data-igcv="polaroid" class="${bg.id==='polaroid'?'on':''}">Полароид</button></div>`:''}`;
  const adj=`<div class="igc-adj"><label class="chk igc-scrimchk"><input type="checkbox" data-igc="scrim"${d.scrim===false?'':' checked'}>Подложка под текстом, если фон мешает читать</label><label class="igc-sl"><span>Осветлить</span><input type="range" min="0" max=".85" step=".01" value="${+d.wash||0}" data-igcf="d.wash"></label><label class="igc-sl"><span>Затемнить</span><input type="range" min="0" max=".7" step=".01" value="${+d.dim||0}" data-igcf="d.dim"></label>
    ${bg.k==='img'||bg.photo?`<label class="igc-sl"><span>Масштаб</span><input type="range" min="1" max="2.5" step=".01" value="${+bg.z||1}" data-igcf="bg.z"></label><label class="igc-sl"><span>Сдвиг ↔</span><input type="range" min="0" max="1" step=".01" value="${bg.ox==null?.5:bg.ox}" data-igcf="bg.ox"></label><label class="igc-sl"><span>Сдвиг ↕</span><input type="range" min="0" max="1" step=".01" value="${bg.oy==null?.5:bg.oy}" data-igcf="bg.oy"></label>`:''}</div>`;
  return `<section class="card igc-card igc-bg"><div class="igc-hd"><span class="igc-ht">${I(IC.img)}<b>Фон</b></span><span class="ks-sp"></span><span class="hint">${bg.k==='img'?'картинка':E(tplById(bg.id).n)}</span></div>
  <div class="seg igc-wide"><button data-igc="bgtab" data-igcv="tpl" class="${tab==='tpl'?'on':''}">Шаблоны</button><button data-igc="bgtab" data-igcv="hist" class="${tab==='hist'?'on':''}">История${p.bgs.length?' '+p.bgs.length:''}</button><button data-igc="bgtab" data-igcv="photo" class="${tab==='photo'?'on':''}">Фото</button></div>${body}${adj}</section>`; }
const covBadges=m=>{ const c=m.cov||{}; return SCRIPTS.map(([k,n])=>{ const s=covState(c[k]); return `<span class="igc-cv ${s==='ok'?'ok':s==='part'?'part':'none'}" title="${s==='ok'?'есть все буквы':s==='part'?'не все буквы: '+E((c[k]||{}).miss||''):'букв нет'}">${n}${s==='ok'?'✓':s==='part'?'~':'✗'}</span>`; }).join(''); };
function covWarn(m){ const c=m.cov||{}, w=[]; if(covState(c.lat)!=='ok') w.push('латиницы'); if(covState(c.cyr)!=='ok') w.push('кириллицы'); return w.length?'Нет '+w.join(' и ')+(covState(c.cyr)==='part'||covState(c.lat)==='part'?' (частично)':'')+' — эти буквы будут запасным шрифтом':''; }
function fontsCard(){ const s=S(), p=PG(), F=s.fonts; return `<section class="card igc-card igc-fonts" data-igcdrop="font"><div class="igc-hd"><span class="igc-ht">${I(IC.font)}<b>Мои шрифты</b>${F.length?`<span class="ks-badge">${F.length}</span>`:''}</span><span class="ks-sp"></span><button class="btn sm igc-b" data-igc="fontup">${I(IC.plus)}Загрузить</button></div>
  ${F.length?`<div class="igc-flist">${F.map(m=>{ const lost=IGC.fonts[m.id]&&(IGC.fonts[m.id].lost||IGC.fonts[m.id].bad); const k='own:'+m.id, wt=covWarn(m); return `<div class="igc-frow${lost?' lost':''}"><span class="igc-fa" style="font-family:'${m.family}',sans-serif">Aa</span><span class="igc-fn"><b>${E(m.name)}</b><small>${E((m.fmt||'').toUpperCase())} · ${kb(m.size||0)}${p.fonts.title===k?' · <em>заголовки</em>':''}${p.fonts.text===k?' · <em>текст</em>':''}</small><span class="igc-cvs">${covBadges(m)}</span>${lost?'<small class="igc-warn">файл не найден — загрузите снова</small>':wt?`<small class="igc-warn">${E(wt)}</small>`:''}</span>
    <span class="igc-fbtn"><button class="btn sm${p.fonts.title===k?' on':''}" data-igc="fontset" data-igcv="title:${m.id}" title="Шрифт заголовков этой страницы">Загол.</button><button class="btn sm${p.fonts.text===k?' on':''}" data-igc="fontset" data-igcv="text:${m.id}" title="Шрифт текста этой страницы">Текст</button><button class="igc-x igc-xs" data-igc="fontdel" data-igcv="${m.id}" title="Удалить шрифт" aria-label="Удалить шрифт">${I(IC.trash)}</button></span></div>`; }).join('')}</div>`
  :`<button class="ks-drop igc-drop" data-igc="fontup">${I(IC.font)}<b>Свой шрифт</b><span>TTF, OTF, WOFF или WOFF2 — можно несколько файлов сразу, или перетащите сюда</span></button>`}
  <div class="igc-pfonts"><button class="igc-pfb" data-igc="fontpick" data-igcv="page:title"><small>Заголовки</small><b style="font-family:${E(stackOf(p.fonts.title))}">${E(fontName(p.fonts.title))}</b></button><button class="igc-pfb" data-igc="fontpick" data-igcv="page:text"><small>Текст</small><b style="font-family:${E(stackOf(p.fonts.text))}">${E(fontName(p.fonts.text))}</b></button></div>
  <button class="btn sm igc-b" data-igc="fontpick" data-igcv="browse">${I(IC.eye)}Все шрифты и предпросмотр</button></section>`; }
function quickCard(){ const p=PG(), d=D(), en=p.kind==='en', ids=PRESET_SETS[p.kind]||PRESET_SETS.other, top=S().ui.topic||'', I2=IGC.ideas;
  return `<section class="card igc-card igc-quick"><div class="igc-hd"><span class="igc-ht">${I(IC.bulb)}<b>${en?'Для английской страницы':'Быстрый старт'}</b></span></div>
  <div class="igc-presets">${ids.map(id=>{ const P=PRESETS[id]; return `<button class="igc-pre${d.series===id?' on':''}" data-igc="preset" data-igcv="${id}"><i>${I(ICONS[P.ic]?`<path d="${ICONS[P.ic]}"/>`:IC.spark)}</i><span><b>${E(P.n)}</b><small>№ ${(+p.series[id]||0)+1}</small></span></button>`; }).join('')}</div>
  ${p.fmt!=='hl'?`<div class="igc-row2"><span class="hint">Номер выпуска <b>{num}</b></span><div class="igc-num"><button class="igc-ic" data-igc="num" data-igcv="-1" aria-label="Меньше">−</button><input type="number" min="1" max="9999" value="${d.num||1}" data-igcf="d.num" aria-label="Номер выпуска"><button class="igc-ic" data-igc="num" data-igcv="1" aria-label="Больше">+</button></div></div>
  <button class="btn sm igc-b" data-igc="nextissue">${I(IC.dup)}Следующий выпуск (№ ${(d.series?Math.max(+p.series[d.series]||0,d.num||0):(d.num||0))+1})</button>`:''}
  <div class="hd2">Идеи заголовков${hasGem()?' · Gemini':''}</div>
  <div class="ks-row"><input class="grow" type="text" value="${E(top)}" data-igcf="ui.topic" placeholder="${en?'Тема: phrasal verbs with GET':'Тема: свадебные приглашения'}" aria-label="Тема"><button class="btn sm igc-b" data-igc="ideas"${IGC.ideasBusy?' disabled':''}>${IGC.ideasBusy?'<i class="igc-spin dark"></i>':I(IC.spark)}Идеи</button></div>
  ${I2&&I2.list?`<div class="igc-ideas">${I2.list.map((h,i)=>`<button class="igc-idea" data-igc="idea" data-igcv="${i}"><b>${mdHTML(h.title)}</b>${h.sub?`<small>${E(h.sub)}</small>`:''}</button>`).join('')}${I2.local?'<p class="hint">Шаблонные идеи (без Gemini).</p>':''}</div>`:''}</section>`; }
const mdHTML=t=>E(t).replace(/\*\*([^*]+?)\*\*|\*([^*]+?)\*/g,(m,a,b)=>'<mark>'+(a||b)+'</mark>');
function tplsCard(){ const p=PG(); return `<section class="card igc-card igc-mytpl"><div class="igc-hd"><span class="igc-ht">${I(IC.save)}<b>Мои шаблоны</b>${p.tpls.length?`<span class="ks-badge">${p.tpls.length}</span>`:''}</span><span class="ks-sp"></span><button class="btn sm igc-b" data-igc="tplsave">${I(IC.plus)}Сохранить</button></div>
  ${p.tpls.length?`<div class="igc-tlist">${p.tpls.map(t=>`<div class="igc-trow"><button class="igc-topen" data-igc="tplopen" data-igcv="${t.id}" title="Открыть"><img data-igcth="t:${t.id}" alt="" class="${t.fmt==='reel'||t.fmt==='hl'?'tall':t.fmt==='square'?'sq':''}"><span><b>${E(t.name)}</b><small>${E(FMT[t.fmt]?FMT[t.fmt].s:t.fmt)} · ${ago(t.created)}</small></span></button><button class="igc-x igc-xs" data-igc="tpldup" data-igcv="${t.id}" title="Дублировать" aria-label="Дублировать">${I(IC.dup)}</button><button class="igc-x igc-xs" data-igc="tpldel" data-igcv="${t.id}" title="Удалить" aria-label="Удалить шаблон">${I(IC.trash)}</button></div>`).join('')}</div>`
  :`<div class="ks-empty">Сохраните удачную обложку — потом откроете её в один клик и поменяете только текст.</div>`}</section>`; }
function paintPanel(){ const box=panelBox(); if(!box) return; setHTML(box,`<div class="igc-pan igc-root">${pagesCard()}${aiCard()}${bgCard()}${fontsCard()}${quickCard()}${tplsCard()}</div>`); fillThumbs(box); }
async function fillThumbs(root){ for(const im of qa('img[data-igcth]',root)){ const [k,id]=im.dataset.igcth.split(':'); let t=IGC.thumbs.get(k+':'+id);
    if(t==null){ t=k==='t'?await KS.idb.get('igc:tth:'+id,'files').catch(()=>null)||'':await thumbOf(k,id); IGC.thumbs.set(k+':'+id,t||''); }
    if(t) im.src=t; else im.classList.add('none'); } }
/* ===== work area: header, format bar, canvas editor (select / drag / snap, mouse + touch), inspector, slides strip ===== */
/* replace the HTML of a box that may hold the focused field: blur first (its «change» commits), then restore focus by data-igcf */
function setHTML(box,html){ const a=document.activeElement; if(!(a&&a!==document.body&&box.contains(a))){ box.innerHTML=html; return; }
  const f=a.dataset&&a.dataset.igcf, pos=f&&a.selectionStart!=null?[a.selectionStart,a.selectionEnd]:null; IGC.painting=(IGC.painting||0)+1; try{ a.blur(); }finally{ IGC.painting--; } box.innerHTML=html;
  if(f){ const n=box.querySelector(`[data-igcf="${CSS.escape(f)}"]`); if(n){ n.focus({preventScroll:true}); if(pos) try{ n.setSelectionRange(pos[0],pos[1]); }catch(_){ } } } }
const scrEl=()=>{ const s=KS.screen&&KS.screen('igcover'); return s&&!s.hidden?s:null; };
const setBusy=msg=>{ IGC.busy=msg||''; const b=q('.igc-busy'); if(b){ b.hidden=!IGC.busy; b.querySelector('span').textContent=IGC.busy; } qa('[data-igc="export"],[data-igc="feed"],[data-igc="exportone"]').forEach(x=>x.disabled=!!IGC.busy); };
function headHTML(){ const p=PG(), d=D(), [W,H]=dimsOf(d), ui=S().ui, multi=d.fmt==='carousel'||d.fmt==='hl', n=visibleSlides(d).length, feed=!!(KS.insta&&KS.insta.addPosts);
  return `<div class="igc-head"><div class="igc-ti"><h2>Обложки</h2><p class="hint"><b>${E(p.name)}</b> · @${E(String(p.handle||'').replace(/^@/,''))} · ${E(FMT[d.fmt].n)}${multi?' · '+n+' '+plural(n,'слайд','слайда','слайдов'):''} · ${W}×${H}</p></div>
  <div class="igc-acts"><span class="igc-busy"${IGC.busy?'':' hidden'}><i class="igc-spin dark"></i><span>${E(IGC.busy)}</span></span>
    <div class="seg igc-type"><button data-igc="type" data-igcv="jpg" class="${ui.type!=='png'?'on':''}">JPG</button><button data-igc="type" data-igcv="png" class="${ui.type==='png'?'on':''}">PNG</button></div>
    <button class="btn primary igc-b" data-igc="export">${I(IC.dl)}${multi?'Скачать ZIP':'Скачать'}</button>${multi?`<button class="btn igc-b" data-igc="exportone" title="Только текущий слайд">${I(IC.dl)}Слайд</button>`:''}
    ${feed&&d.fmt!=='hl'?`<button class="btn igc-b" data-igc="feed" title="Поставить обложку в «Ленту» раздела Instagram">${I(IC.feed)}В ленту</button>`:''}
    ${IGC.fed&&Date.now()-IGC.fed.t<120000?`<button class="btn sm igc-b igc-fedok" data-igc="openfeed">${I(IC.check)}В ленте · открыть</button>`:''}</div></div>`; }
function barHTML(){ const p=PG(), d=D(), ui=S().ui, can=IGC.hk===docKey();
  return `<div class="igc-bar"><div class="seg igc-fmts" role="tablist">${Object.entries(FMT).map(([k,f])=>`<button data-igc="fmt" data-igcv="${k}" class="${p.fmt===k?'on':''}" role="tab" aria-selected="${p.fmt===k}">${E(f.s)}</button>`).join('')}</div>
    ${d.fmt==='carousel'?`<div class="seg"><button data-igc="car" data-igcv="4:5" class="${d.car!=='1:1'?'on':''}">4:5</button><button data-igc="car" data-igcv="1:1" class="${d.car==='1:1'?'on':''}">1:1</button></div>`:''}
    <span class="ks-sp"></span>${d.fmt==='reel'||d.fmt==='hl'?`<button class="btn sm igc-b${ui.zones?' on':''}" data-igc="zones" aria-pressed="${!!ui.zones}" title="Показать зоны обрезки">${I(IC.zones)}Зоны</button>`:''}
    <button class="igc-ic" data-igc="undo" title="Отменить (⌘Z)" aria-label="Отменить"${can&&IGC.hist.length?'':' disabled'}>${I(IC.undo)}</button><button class="igc-ic" data-igc="redo" title="Вернуть (⇧⌘Z)" aria-label="Вернуть"${can&&IGC.fut.length?'':' disabled'}>${I(IC.redo)}</button></div>`; }
function addHTML(){ const d=D(), hl=d.fmt==='hl'; const B=(a,v,ic,t,tt)=>`<button class="igc-addb" data-igc="${a}" data-igcv="${v}" title="${tt||t}">${I(ic)}<span>${t}</span></button>`;
  return `<div class="igc-add"><div class="hd2">Добавить</div><div class="igc-addg">${hl?B('addicon','star',IC.smile,'Иконка')+B('addtext','custom',IC.text,'Подпись')+B('addicon','emo:📚',IC.smile,'Эмодзи'):B('addtext','title',IC.title,'Заголовок')+B('addtext','subtitle',IC.sub,'Подзагол.','Подзаголовок')+B('addtext','label',IC.lbl,'Метка')+B('addtext','number',IC.hash,'Номер')+B('addtext','handle',IC.at,'@ник')+B('addtext','custom',IC.text,'Текст')+B('addicon','emo:✨',IC.smile,'Эмодзи','Эмодзи или иконка')}
    <span class="igc-pop"><button class="igc-addb" data-igc="popshape" aria-expanded="false" title="Фигура">${I(IC.shape)}<span>Фигура</span></button><span class="igc-popb right" hidden>${SHAPES.map(([k,n])=>`<button data-igc="addshape" data-igcv="${k}" title="${n}">${shapeIcon(k)}<small>${n}</small></button>`).join('')}</span></span></div></div>`; }
const SHI=new Map(); function shapeIcon(k){ if(SHI.has(k)) return SHI.get(k); const c=cnv(40,40), g=c.getContext('2d'); try{ drawShape(g,{id:'si'+k,k,x:k==='line'||k==='underline'||k==='tape'||k==='wave'?2:6,y:k==='line'?17:k==='underline'||k==='tape'||k==='wave'?12:6,w:k==='line'||k==='underline'||k==='tape'||k==='wave'?36:28,h:k==='line'?6:k==='underline'||k==='tape'||k==='wave'?16:28,color:'#7c7c86',op:1,rot:0},{col:{}}); }catch(_){ } const h=`<img src="${c.toDataURL()}" alt="">`; SHI.set(k,h); return h; }
function paintScreen(){ const s=scrEl(); if(!s) return; const st0=s.querySelector('.igc-insp'), sc=st0?st0.scrollTop:0;
  setHTML(s,`<div class="igc-scr igc-root">${headHTML()}${barHTML()}<div class="igc-body"><div class="igc-left"><div class="igc-stagewrap"><div class="igc-cv"><canvas class="igc-canvas" aria-label="Обложка"></canvas><div class="igc-ov" tabindex="-1"></div></div><div class="igc-genchip" hidden></div></div><div class="igc-strip"></div></div><div class="igc-side">${addHTML()}<div class="igc-insp"></div></div></div></div>`);
  observe(s); paintStage(); paintInsp(); paintStrip(); const ni=s.querySelector('.igc-insp'); if(ni) ni.scrollTop=sc; }
const paintScreenHead=()=>{ const h=q('.igc-scr .igc-head'); if(h){ const w=document.createElement('div'); w.innerHTML=headHTML(); h.replaceWith(w.firstChild); } const b=q('.igc-scr .igc-bar'); if(b){ const w=document.createElement('div'); w.innerHTML=barHTML(); b.replaceWith(w.firstChild); } };
function paintAll(){ if(!IGC.on) return; paintPanel(); paintScreen(); }
let RO=null, roT=0; function observe(s){ if(!window.ResizeObserver) return; if(!RO) RO=new ResizeObserver(()=>{ cancelAnimationFrame(roT); roT=requestAnimationFrame(()=>paintStage()); }); RO.disconnect(); const w=s.querySelector('.igc-stagewrap'); if(w) RO.observe(w); }

/* ---- the canvas ---- */
const VIEW={k:1,cw:0,ch:0,L:{}};
let raf=0; function paintSoon(){ if(raf) return; raf=requestAnimationFrame(()=>{ raf=0; paintStage(true); }); }
function paintStage(quick){ const s=scrEl(); if(!s) return; const wrap=s.querySelector('.igc-stagewrap'), cv=s.querySelector('.igc-cv'), canvas=s.querySelector('.igc-canvas'); if(!wrap||!canvas) return; const d=D(), p=PG(), [W,H]=dimsOf(d);
  wrap.style.minHeight=''; let aw=wrap.clientWidth-8, ah=wrap.clientHeight-8; if(ah<240){ ah=Math.min(aw*H/W,window.innerHeight*.72); wrap.style.minHeight=Math.round(ah+8)+'px'; }
  let cw=Math.max(120,Math.min(aw,ah*W/H)), ch=cw*H/W; cw=Math.floor(cw); ch=Math.floor(ch); cv.style.width=cw+'px'; cv.style.height=ch+'px';
  const dpr=Math.min(2.5,window.devicePixelRatio||1), bw=Math.min(Math.round(cw*dpr),W), bh=Math.round(bw*H/W); if(canvas.width!==bw||canvas.height!==bh){ canvas.width=bw; canvas.height=bh; }
  VIEW.k=W/cw; VIEW.cw=cw; VIEW.ch=ch; const g=canvas.getContext('2d'); g.setTransform(1,0,0,1,0,0); g.clearRect(0,0,bw,bh); VIEW.L=drawSlide(g,d,IGC.slide,p,bw/W)||{};
  paintOverlay(); genChip(); if(!quick&&!IGC.fontsWait){ IGC.fontsWait=1; fontsReady(d,p).then(()=>{ IGC.fontsWait=0; FITC.clear(); paintSoon(); }); } }
function elBox(e){ if(e.t==='text'){ const L=VIEW.L[e.id], dy=(L&&L.dy)||0; if(e.fit||!L) return {x:e.x,y:e.y+dy,w:e.w,h:Math.max(e.h,20)}; return {x:e.x,y:e.y+dy,w:e.w,h:Math.max(L.h,20)}; } return {x:e.x,y:e.y,w:e.w,h:e.h}; }
const flowDy=e=>{ const L=e&&e.t==='text'&&VIEW.L[e.id]; return (L&&L.dy)||0; };
function paintOverlay(){ const s=scrEl(); if(!s) return; const ov=s.querySelector('.igc-ov'); if(!ov) return; const d=D(), sl=SL(), k=VIEW.k, [W,H]=dimsOf(d), ui=S().ui; let h='';
  if(ui.zones&&(d.fmt==='reel'||d.fmt==='hl')){ const z=(y0,y1,cls,t)=>`<div class="igc-zone ${cls}" style="top:${y0/k}px;height:${(y1-y0)/k}px"><span>${t}</span></div>`;
    if(d.fmt==='reel') h+=z((H-1440)/2,(H+1440)/2,'z34','В сетке профиля 3:4')+z((H-1080)/2,(H+1080)/2,'z11','1:1')+`<div class="igc-ui top" style="height:${220/k}px"></div><div class="igc-ui bot" style="height:${420/k}px"><span>здесь подпись и кнопки Reels</span></div>`;
    else h+=`<div class="igc-circ" style="left:${(W/2-540)/k}px;top:${(H/2-540)/k}px;width:${1080/k}px;height:${1080/k}px"></div><div class="igc-circ safe" style="left:${(W/2-310)/k}px;top:${(H/2-310)/k}px;width:${620/k}px;height:${620/k}px"><span>видно в кружке</span></div>`; }
  /* css box of an element: at least 28 px tall / wide so small labels stay easy to grab (handles do not collide) */
  const cb=e=>{ const b=elBox(e); let x=b.x/k, y=b.y/k, w=b.w/k, hh=b.h/k; if(hh<28){ y-=(28-hh)/2; hh=28; } if(w<28){ x-=(28-w)/2; w=28; } return {x,y,w,h:hh}; };
  if(DR&&ov.querySelector('.igc-box')){ sl.els.forEach(e=>{ const n=ov.querySelector(`.igc-box[data-igce="${e.id}"]`); if(!n) return; const b=cb(e); Object.assign(n.style,{left:b.x+'px',top:b.y+'px',width:b.w+'px',height:b.h+'px'}); }); return; }
  sl.els.forEach((e,i)=>{ if(e.hide) return; const b=cb(e), on=IGC.sel===e.id; h+=`<div class="igc-box${on?' on':''}${e.t==='text'?' tx':''}" data-igce="${e.id}" style="left:${b.x}px;top:${b.y}px;width:${b.w}px;height:${b.h}px;z-index:${on?900:(e.t==='text'?400:0)+i+2};${e.rot?`transform:rotate(${e.rot}deg)`:''}">${on?`<i class="igc-h w" data-igch="w" title="Ширина"></i><i class="igc-h s" data-igch="s" title="Размер"></i>${e.t==='text'&&e.fit?'<i class="igc-h b" data-igch="b" title="Высота рамки"></i>':''}`:''}</div>`; });
  h+='<div class="igc-guide v" hidden></div><div class="igc-guide h" hidden></div><div class="igc-guide v2" hidden></div><div class="igc-guide h2" hidden></div>'; ov.innerHTML=h; }
function genChip(){ const c=q('.igc-genchip'); if(!c) return; const g=IGC.gen; c.hidden=!g; if(g) c.innerHTML=`<i class="igc-spin"></i><span>${g.stage==='layout'?'Gemini разбирает образец…':'Gemini рисует фон '+Math.min(g.done+1,g.n)+' из '+g.n+' · без букв'}</span>`; }

/* ---- drag on the canvas: pointer events = mouse, pen and touch (iPad) ---- */
let DR=null; const M=64;
function snapMove(e,b,nx,ny,o){ const d=D(), [W,H]=dimsOf(d), T=9*VIEW.k, gs={v:null,h:null,v2:null,h2:null}; if(o.alt) return {x:nx,y:ny,gs};
  const cx=nx+b.w/2, cy=ny+b.h/2; if(Math.abs(cx-W/2)<T){ nx=W/2-b.w/2; gs.v=W/2; } else if(Math.abs(nx-M)<T){ nx=M; gs.v2=M; } else if(Math.abs(nx+b.w-(W-M))<T){ nx=W-M-b.w; gs.v2=W-M; }
  if(Math.abs(cy-H/2)<T){ ny=H/2-b.h/2; gs.h=H/2; } else if(Math.abs(ny-M)<T){ ny=M; gs.h2=M; } else if(Math.abs(ny+b.h-(H-M))<T){ ny=H-M-b.h; gs.h2=H-M; } return {x:nx,y:ny,gs}; }
function showGuides(gs){ const ov=q('.igc-ov'); if(!ov) return; const k=VIEW.k; [['v','left'],['v2','left'],['h','top'],['h2','top']].forEach(([n,prop])=>{ const g=ov.querySelector('.igc-guide.'+n); if(!g) return; const v=gs&&gs[n]; g.hidden=v==null; if(v!=null) g.style[prop]=(v/k)+'px'; }); }
function onDown(ev){ const ov=ev.target.closest('.igc-ov'); if(!ov) return; const box=ev.target.closest('.igc-box'), hd=ev.target.closest('.igc-h');
  if(!box){ if(IGC.sel){ IGC.sel=null; paintOverlay(); paintInsp(); } return; } const id=box.dataset.igce, e=elById(id); if(!e) return; ev.preventDefault();
  const was=IGC.sel===id; if(!was){ IGC.sel=id; paintOverlay(); paintInsp(); } try{ ov.setPointerCapture(ev.pointerId); }catch(_){ }
  const b=elBox(e); DR={id,mode:hd?hd.dataset.igch:'move',x0:ev.clientX,y0:ev.clientY,ex:e.x,ey:e.y+flowDy(e),ew:e.w,eh:e.h,es:e.size,by:b.y,bh:b.h,moved:false,was,snap:JSON.stringify(D()),pid:ev.pointerId,type:ev.pointerType}; }
function onMove(ev){ if(!DR||ev.pointerId!==DR.pid) return; const e=elById(DR.id); if(!e){ DR=null; return; } const k=VIEW.k, dx=(ev.clientX-DR.x0)*k, dy=(ev.clientY-DR.y0)*k;
  if(!DR.moved&&Math.hypot(ev.clientX-DR.x0,ev.clientY-DR.y0)<3) return; DR.moved=true; ev.preventDefault(); const [W,H]=dimsOf(D());
  if(DR.mode==='move'){ const off=DR.by-DR.ey; const r=snapMove(e,{w:DR.ew,h:DR.bh},DR.ex+dx,DR.by+dy,{alt:ev.altKey}); e.x=Math.round(clamp(r.x,-DR.ew+40,W-40)); e.y=Math.round(clamp(r.y-off,-DR.bh+40,H-40)); if(e.t==='text') e.man=1; showGuides(r.gs); }
  else if(DR.mode==='w'){ e.w=Math.round(clamp(DR.ew+dx,60,W*1.2)); }
  else if(DR.mode==='b'){ e.h=Math.round(clamp(DR.eh+dy,30,H)); }
  else { const f=clamp((DR.ew+dx)/DR.ew,.15,6); if(e.t==='text'){ e.w=Math.round(DR.ew*f); e.h=Math.round(DR.eh*f); e.size=Math.round(clamp(DR.es*f,6,600)); } else if(e.t==='shape'&&!ev.shiftKey){ e.w=Math.round(clamp(DR.ew+dx,8,W*1.5)); e.h=Math.round(clamp(DR.eh+dy,4,H*1.5)); } else { e.w=Math.round(DR.ew*f); e.h=Math.round(DR.eh*f); } }
  paintSoon(); }
function onUp(ev){ if(!DR||ev.pointerId!==DR.pid) return; const D0=DR; DR=null; showGuides(null);
  if(D0.moved){ histPush(D0.snap); saveSoon(); paintInsp(); paintStrip(); }
  else if(D0.was){ const e=elById(D0.id); if(e&&e.t==='text') focusText(false); } }
function focusText(all){ setTimeout(()=>{ const t=q('.igc-insp [data-igcf="text"]'); if(t){ t.focus({preventScroll:false}); if(all!==false) t.select(); } },30); }

/* ---- inspector ---- */
const swatches=(field,cur,p,extra)=>`<div class="igc-sws">${COLKEYS.concat([['white','Белый'],['black','Чёрный']]).map(([k,n])=>`<button class="igc-sw${cur===k?' on':''}" data-igc="col" data-igcv="${field}|${k}" title="${n}" aria-label="${n}" style="background:${col(k,p)}"></button>`).join('')}<label class="igc-sw cust${isHex(cur)?' on':''}" title="Свой цвет"${isHex(cur)?` style="background:${cur}"`:''}><input type="color" value="${isHex(cur)?cur:col(cur,p)}" data-igcf="hex:${field}" aria-label="Свой цвет"></label>${extra||''}</div>`;
const sl=(lab,f,min,max,step,v,fmt)=>`<label class="igc-sl"><span>${lab}</span><input type="range" min="${min}" max="${max}" step="${step}" value="${v}" data-igcf="${f}"><output>${fmt?fmt(v):v}</output></label>`;
const segB=(f,cur,opts)=>`<div class="seg igc-wide">${opts.map(([v,n,t])=>`<button data-igc="set" data-igcv="${f}|${v}" class="${String(cur)===String(v)?'on':''}"${t?` title="${t}"`:''}>${n}</button>`).join('')}</div>`;
function textInsp(e,p){ const fx=e.fx||{}, f=elFont(e,p), own=isOwn(f), miss=own?missingIn(f.slice(4),e.text):'', fxs=[['hl','Маркер'],['ol','Контур'],['sh','Тень'],['pill','Плашка'],['sq','Волна'],['hollow','Только контур']];
  return `<div class="igc-ih"><select data-igcf="role" aria-label="Роль блока">${Object.entries(ROLE_N).map(([k,n])=>`<option value="${k}"${e.role===k?' selected':''}>${n}</option>`).join('')}</select>${elActs(e)}</div>
  <textarea data-igcf="text" rows="3" spellcheck="true" aria-label="Текст">${E(e.text)}</textarea><p class="hint igc-mk"><b>**слово**</b> — акцентный цвет · <b>{num}</b> номер выпуска · <b>{handle}</b> ник${D().fmt==='carousel'?' · <b>{n}/{N}</b> слайд':''}</p>
  <button class="igc-fontbtn" data-igc="fontpick" data-igcv="el"><small>Шрифт${e.font?'':' страницы'}</small><b style="font-family:${E(stackOf(f))}">${E(fontName(f))}</b>${I(IC.right)}</button>${e.font?`<button class="btn sm igc-linkb" data-igc="set" data-igcv="font|">Вернуть шрифт страницы</button>`:''}
  ${miss?`<div class="igc-note warn">${I(IC.font)}<span>В шрифте нет букв: <b>${E(miss.slice(0,16))}</b> — они будут запасным шрифтом.</span></div>`:''}
  ${sl('Размер','size',8,360,1,Math.round(e.size),v=>v+' px')}
  ${own?'':segB('weight',wOf(f,e.weight),[...new Set([400,500,700,800].map(w=>wOf(f,w)))].map(w=>[w,{100:'100',200:'200',300:'Светлый',400:'Обычный',500:'Средний',600:'Полужирн.',700:'Жирный',800:'Чёрный',900:'Чёрный'}[w]||w]))}
  <div class="igc-row2"><div class="seg">${[['left','⇤','Влево'],['center','↔','По центру'],['right','⇥','Вправо']].map(([v,n,t])=>`<button data-igc="set" data-igcv="align|${v}" class="${e.align===v?'on':''}" title="${t}" aria-label="${t}">${n}</button>`).join('')}</div>
  <div class="seg">${[['none','Аа','Как есть'],['upper','АА','ПРОПИСНЫЕ'],['lower','аа','строчные'],['title','Аб','Каждое Слово']].map(([v,n,t])=>`<button data-igc="set" data-igcv="case|${v}" class="${(e.case||'none')===v?'on':''}" title="${t}">${n}</button>`).join('')}</div>
  <button class="igc-ic${e.it?' on':''}" data-igc="set" data-igcv="it|${e.it?0:1}" title="Курсив" aria-label="Курсив" style="font-style:italic;font-weight:700">I</button></div>
  <div class="hd2">Цвет</div>${swatches('color',e.color,p)}
  <div class="hd2">Акцент для **слов**</div>${swatches('acc',e.acc||'accent',p)}
  ${sl('Интервал','ls',-.05,.5,.01,+e.ls||0,v=>(+v).toFixed(2))}${sl('Строки','lh',.8,1.8,.02,+e.lh||1.15,v=>(+v).toFixed(2))}${sl('Ширина','w',80,1080,1,Math.round(e.w),v=>v+' px')}
  <label class="chk"><input type="checkbox" data-igcf="fit"${e.fit?' checked':''}>Вписать в рамку (уменьшать длинный текст)</label>
  ${e.man?`<div class="igc-row2"><span class="hint">Блок стоит там, куда вы его поставили.</span><button class="btn sm igc-linkb" data-igc="unman" title="Блок снова сам отодвигается от соседних блоков">Авто-место</button></div>`:''}
  <div class="hd2">Эффекты</div><div class="igc-fx">${fxs.map(([k,n])=>`<button class="igc-chip${fx[k]?' on':''}" data-igc="fx" data-igcv="${k}" aria-pressed="${!!fx[k]}">${n}</button>`).join('')}</div>
  ${fx.hl?`<div class="hd2">Маркер${hasAcc(e.text)?' под **словами**':''}</div>${swatches('fx.hl',fx.hl,p)}`:''}${fx.pill?`<div class="hd2">Плашка</div>${swatches('fx.pill',fx.pill,p)}`:''}
  ${fx.ol?`<div class="hd2">Контур</div>${swatches('fx.ol',fx.ol,p)}${sl('Толщина','fx.olw',.02,.25,.01,fx.olw||.09,v=>(+v).toFixed(2))}`:''}${fx.sq?`<div class="hd2">Волна</div>${swatches('fx.sqc',fx.sqc||e.acc||'accent',p)}`:''}
  ${sl('Прозрачность','op',.1,1,.01,e.op==null?1:e.op,v=>Math.round(v*100)+'%')}${sl('Поворот','rot',-30,30,.5,e.rot||0,v=>v+'°')}`; }
function elActs(e){ return `<span class="igc-acts2"><button class="igc-ic" data-igc="eldup" title="Дублировать (⌘D)" aria-label="Дублировать">${I(IC.dup)}</button><button class="igc-ic" data-igc="elup" title="Выше" aria-label="Выше">${I(IC.up)}</button><button class="igc-ic" data-igc="eldown" title="Ниже" aria-label="Ниже">${I(IC.down)}</button><button class="igc-ic danger" data-igc="eldel" title="Удалить (Delete)" aria-label="Удалить">${I(IC.trash)}</button></span>`; }
function shapeInsp(e,p){ return `<div class="igc-ih"><b>Фигура</b>${elActs(e)}</div><div class="igc-shapes">${SHAPES.map(([k,n])=>`<button class="${e.k===k?'on':''}" data-igc="set" data-igcv="k|${k}" title="${n}">${shapeIcon(k)}</button>`).join('')}</div>
  <div class="hd2">Цвет</div>${swatches('color',e.color,p)}${sl('Ширина','w',8,1600,1,Math.round(e.w),v=>v+' px')}${sl('Высота','h',4,1920,1,Math.round(e.h),v=>v+' px')}
  ${['ring','frame','wave'].includes(e.k)?sl('Толщина','sw',.01,.3,.005,e.sw||(e.k==='frame'?.025:.07),v=>(+v).toFixed(3)):''}${e.k==='rect'||e.k==='frame'?sl('Скругление','r',0,.5,.01,e.r==null?(e.k==='rect'?.16:.04):e.r,v=>(+v).toFixed(2)):''}
  ${sl('Прозрачность','op',.05,1,.01,e.op==null?1:e.op,v=>Math.round(v*100)+'%')}${sl('Поворот','rot',-180,180,1,e.rot||0,v=>v+'°')}`; }
const EMO=['✨','📚','💡','✅','❌','🔥','⭐','❤️','💬','🎧','🎬','📝','🇬🇧','🇺🇸','☕','🎓','🧠','👀','📌','✉️','🎁','🖨️','💌','🌿'];
function iconInsp(e,p){ return `<div class="igc-ih"><b>Иконка</b>${elActs(e)}</div><div class="igc-icons">${Object.keys(ICONS).map(k=>`<button class="${e.k===k?'on':''}" data-igc="set" data-igcv="k|${k}" title="${E(ICON_N[k]||k)}">${I(`<path d="${ICONS[k]}"/>`)}</button>`).join('')}${TXT_ICONS.map(t=>`<button class="txt${e.k==='txt:'+t?' on':''}" data-igc="set" data-igcv="k|txt:${t}">${E(t)}</button>`).join('')}</div>
  <div class="hd2">Эмодзи</div><div class="igc-icons emo">${EMO.map(t=>`<button class="${e.k==='emo:'+t?' on':''}" data-igc="set" data-igcv="k|emo:${t}">${t}</button>`).join('')}</div><div class="ks-row"><input class="grow" type="text" maxlength="8" placeholder="Свой эмодзи" value="${/^emo:/.test(e.k)?E(e.k.slice(4)):''}" data-igcf="emoji" aria-label="Свой эмодзи"></div>
  <div class="hd2">Цвет</div>${swatches('color',e.color,p)}${sl('Размер','w',30,1000,1,Math.round(e.w),v=>v+' px')}${/^(emo|txt):/.test(e.k)?'':sl('Линия','sw',.8,3.2,.1,e.sw||1.7,v=>(+v).toFixed(1))+`<label class="chk"><input type="checkbox" data-igcf="fill"${e.fill?' checked':''}>Заливка</label>`}
  ${sl('Прозрачность','op',.05,1,.01,e.op==null?1:e.op,v=>Math.round(v*100)+'%')}${sl('Поворот','rot',-180,180,1,e.rot||0,v=>v+'°')}`; }
function slideInsp(){ const d=D(), p=PG(), s=SL(); const lab=e=>e.t==='text'?String(resolveText(e,d,IGC.slide,p)).replace(/\*/g,'').replace(/\s+/g,' ').slice(0,26)||'(пусто)':e.t==='shape'?(SHAPES.find(x=>x[0]===e.k)||['',e.k])[1]:/^(emo|txt):/.test(e.k)?e.k.slice(4):(ICON_N[e.k]||e.k);
  const ty=e=>e.t==='text'?ROLE_N[e.role]||'Текст':e.t==='shape'?'Фигура':'Иконка';
  return `${d.fmt==='hl'?`<div class="hd2">Кружок ${IGC.slide+1}</div><label class="f">Название (под кружком в профиле)<input type="text" value="${E(s.name||'')}" data-igcf="s.name" maxlength="20"></label>`:''}
  ${d.fmt==='carousel'&&IGC.slide>0?`<div class="hd2">Фон слайда ${IGC.slide+1}</div><div class="seg igc-wide"><button data-igc="slbg" data-igcv="same" class="${!s.bg?'on':''}">Как у обложки</button><button data-igc="slbg" data-igcv="calm" class="${s.bg?'on':''}">Спокойный</button></div>`:''}
  <div class="igc-tip">${I(IC.edit)}<span>Нажмите на текст на обложке, чтобы изменить. Перетаскивайте мышью или пальцем — блоки прилипают к центру и полям. Двойное нажатие — сразу к тексту.</span></div>
  <div class="hd2">Слои (сверху — ближе)</div><div class="igc-layers">${s.els.filter(e=>e.t==='text').reverse().concat(s.els.filter(e=>e.t!=='text').reverse()).map(e=>({e})).map(({e})=>`<div class="igc-layer"><button class="igc-lsel" data-igc="sel" data-igcv="${e.id}"><small>${ty(e)}</small><span>${E(lab(e))}</span></button><button class="igc-ic igc-eye${e.hide?' off':''}" data-igc="hide" data-igcv="${e.id}" title="${e.hide?'Показать':'Скрыть'}" aria-label="${e.hide?'Показать':'Скрыть'}" aria-pressed="${!e.hide}">${I(e.hide?IC.eyeoff:IC.eye)}</button></div>`).join('')||'<p class="hint">На слайде пока пусто — добавьте заголовок кнопкой выше.</p>'}</div>`; }
function paintInsp(){ const box=q('.igc-insp'); if(!box) return; const e=selEl(), p=PG(); if(IGC.sel&&!e) IGC.sel=null;
  setHTML(box,`<div class="igc-ib">${e?(e.t==='text'?textInsp(e,p):e.t==='shape'?shapeInsp(e,p):iconInsp(e,p)):slideInsp()}</div>`); }

/* ---- slides strip (carousel / highlights) ---- */
function paintStrip(){ const box=q('.igc-strip'); if(!box) return; const d=D(), p=PG(); if(d.fmt!=='carousel'&&d.fmt!=='hl'){ box.hidden=true; box.innerHTML=''; return; } box.hidden=false; const hl=d.fmt==='hl', [W,H]=dimsOf(d);
  box.innerHTML=`<div class="igc-slides${hl?' hl':''}">${d.slides.map((s,i)=>`<button class="igc-sth${i===IGC.slide?' on':''}" data-igc="slide" data-igcv="${i}" aria-label="Слайд ${i+1}"><canvas width="${hl?120:96}" height="${hl?120:Math.round(96*H/W)}"></canvas><small>${hl?E(s.name||'—'):i===0?'обложка':i+1}</small></button>`).join('')}</div>
    <span class="igc-pop"><button class="igc-sadd" data-igc="popslide" aria-label="Добавить слайд">${I(IC.plus)}<small>${hl?'Кружок':'Слайд'}</small></button><span class="igc-popb up" hidden>${hl?`<button data-igc="addslide" data-igcv="new">Новый кружок</button><button data-igc="addslide" data-igcv="copy">Копия текущего</button>`:Object.entries(SLIDES).map(([k,n])=>`<button data-igc="addslide" data-igcv="${k}">${n}</button>`).join('')}</span></span>
  <div class="igc-sacts"><button class="igc-ic" data-igc="slmove" data-igcv="-1" title="Левее" aria-label="Левее"${IGC.slide>0?'':' disabled'}>${I(IC.left)}</button><button class="igc-ic" data-igc="slmove" data-igcv="1" title="Правее" aria-label="Правее"${IGC.slide<d.slides.length-1?'':' disabled'}>${I(IC.right)}</button><button class="igc-ic" data-igc="addslide" data-igcv="copy" title="Дублировать слайд" aria-label="Дублировать слайд">${I(IC.dup)}</button><button class="igc-ic danger" data-igc="sldel" title="Удалить слайд" aria-label="Удалить слайд"${d.slides.length>1?'':' disabled'}>${I(IC.trash)}</button></div>`;
  clearTimeout(paintStrip.t); paintStrip.t=setTimeout(()=>{ qa('.igc-sth canvas',box).forEach((c,i)=>{ const g=c.getContext('2d'); if(hl){ const k=c.width/1080; g.save(); g.beginPath(); g.arc(c.width/2,c.height/2,c.width/2,0,Math.PI*2); g.clip(); g.translate(0,-(H/2-540)*k); drawSlide(g,d,i,p,k); g.restore(); g.setTransform(1,0,0,1,0,0); } else drawSlide(g,d,i,p,c.width/W); }); },60); }

/* ---- modals: font picker / browser, page settings, photo library ---- */
let FM=null; IGC.fp=null;
function fontModal(target){ IGC.fp=target||null; FM=FM||KS.modal({id:'igcfont',title:'Шрифты',wide:true}); FM.title(target&&target.k==='el'?'Шрифт блока':target&&target.k==='page'?(target.r==='title'?'Шрифт заголовков страницы':'Шрифт текста страницы'):'Шрифты'); paintFontModal(); FM.open(); setTimeout(()=>{ const i=FM.el.querySelector('[data-igcf="fsearch"]'); if(i&&!('ontouchstart' in window)) i.focus(); },60); }
function paintFontModal(){ if(!FM) return; const s=S(), p=PG(), t=IGC.fp, qq=(IGC.fq||'').toLowerCase(), cur=t&&t.k==='el'?(selEl()||{}).font||'':t&&t.k==='page'?p.fonts[t.r]:null;
  const own=s.fonts.filter(m=>!qq||m.name.toLowerCase().includes(qq)), app=appFonts().filter(n=>!qq||n.toLowerCase().includes(qq)); const pick=!!t;
  FM.el.innerHTML=`<div class="igc-fm igc-root"><div class="ks-row"><input class="grow" type="search" placeholder="Найти шрифт…" value="${E(IGC.fq||'')}" data-igcf="fsearch" aria-label="Найти шрифт"><button class="btn igc-b" data-igc="fontup">${I(IC.plus)}Загрузить свои</button></div>
  ${t&&t.k==='el'?`<button class="igc-fmrow${!cur?' on':''}" data-igc="fmpick" data-igcv=""><span class="igc-fmn"><b>Шрифт страницы</b><small>${E(fontName(TITLE_ROLES.has((selEl()||{}).role)?p.fonts.title:p.fonts.text))} — меняется вместе со страницей</small></span></button>`:''}
  <div class="hd2">Мои шрифты${own.length?' · '+own.length:''}</div>${own.length?own.map(m=>{ const k='own:'+m.id, w=covWarn(m); return `<${pick?'button':'div'} class="igc-fmrow own${cur===k?' on':''}"${pick?` data-igc="fmpick" data-igcv="${k}"`:''}><span class="igc-fmn"><b>${E(m.name)}</b><span class="igc-cvs">${covBadges(m)}</span></span><span class="igc-fmp" style="font-family:'${m.family}',sans-serif">${E(PREVIEW)}</span>${w?`<small class="igc-warn">${E(w)}${m.cov&&m.cov.cyr&&m.cov.cyr.miss&&covState(m.cov.cyr)==='part'?': '+E(m.cov.cyr.miss):''}</small>`:''}</${pick?'button':'div'}>`; }).join(''):`<div class="ks-empty">Своих шрифтов пока нет. Загрузите файлы TTF, OTF, WOFF или WOFF2 — они сохранятся на этом устройстве.</div>`}
  <div class="hd2">Шрифты программы · ${app.length}</div><div class="igc-fmgrid">${app.map(n=>`<${pick?'button':'div'} class="igc-fmrow${cur===n?' on':''}"${pick?` data-igc="fmpick" data-igcv="${E(n)}"`:''}><span class="igc-fmn"><b>${E(n)}</b></span><span class="igc-fmp" style="font-family:${E(appStack(n))}">${E(PREVIEW)}</span></${pick?'button':'div'}>`).join('')}</div></div>`; }
function applyFont(v){ const t=IGC.fp, p=PG(); if(!t) return; if(t.k==='el'){ const e=selEl(); if(!e) return; histPush(); e.font=v; if(e.t==='text'&&!isOwn(v)) e.weight=wOf(v,e.weight||400); }
  else if(t.k==='page'){ histPush(); p.fonts[t.r]=v||p.fonts[t.r]; } FITC.clear(); KS.save(); FM.close(); paintAll(); fontsReady(D(),p).then(()=>{ FITC.clear(); paintSoon(); }); }
let PM=null;
function pageModal(){ PM=PM||KS.modal({id:'igcpage',title:'Страница',onClose:()=>paintAll()}); const p=PG(), s=S();
  PM.el.innerHTML=`<div class="igc-pm igc-root"><div class="row2"><label class="f">Название<input type="text" value="${E(p.name)}" data-igcf="p.name" maxlength="30"></label><label class="f">Ник в Instagram<input type="text" value="${E(String(p.handle||'').replace(/^@/,''))}" data-igcf="p.handle" maxlength="40" placeholder="english.with.me" autocapitalize="off"></label></div>
  <div class="hd2">Тема страницы</div><div class="seg igc-wide">${[['shop','Типография'],['en','Английский'],['other','Другая']].map(([k,n])=>`<button data-igc="pkind" data-igcv="${k}" class="${p.kind===k?'on':''}">${n}</button>`).join('')}</div>
  <div class="hd2">Цвета бренда</div><div class="igc-pcols">${COLKEYS.map(([k,n])=>`<label class="igc-pcol"><input type="color" value="${p.col[k]}" data-igcf="pc.${k}"><span>${n}</span><small>${p.col[k]}</small></label>`).join('')}</div>
  <div class="flexw"><button class="btn sm igc-b" data-igc="pcolreset">Цвета темы по умолчанию</button></div>
  <div class="hd2">Шрифты страницы</div><div class="igc-pfonts"><button class="igc-pfb" data-igc="fontpick" data-igcv="page:title"><small>Заголовки</small><b style="font-family:${E(stackOf(p.fonts.title))}">${E(fontName(p.fonts.title))}</b></button><button class="igc-pfb" data-igc="fontpick" data-igcv="page:text"><small>Текст</small><b style="font-family:${E(stackOf(p.fonts.text))}">${E(fontName(p.fonts.text))}</b></button></div>
  <p class="hint">Образцы, фоны, шаблоны и нумерация выпусков у каждой страницы свои.</p>
  <div class="flexw"><button class="btn primary" data-igc="pmclose">Готово</button>${s.pages.length>1?`<button class="btn danger igc-b" data-igc="pagedel">${I(IC.trash)}Удалить страницу</button>`:''}</div></div>`; PM.open(); }
let LM=null;
async function photoLib(){ if(!KS.photos) return; LM=LM||KS.modal({id:'igclib',title:'Мои фото → фон',wide:true}); LM.el.innerHTML='<div class="ks-empty">Загружаю…</div>'; LM.open(); let L=[]; try{ L=await KS.photos.list(); }catch(_){ }
  LM.el.innerHTML=L.length?`<div class="igc-lib igc-root">${L.slice(0,120).map(x=>`<button data-igc="libpick" data-igcv="${E(x.id)}"><img src="${E(x.thumb||'')}" alt="" loading="lazy"></button>`).join('')}</div>`:'<div class="ks-empty">В «Мои фото» пока пусто.</div>'; }
/* ===== wiring: tab, events (click / input / drop / keys / pointer), ⌘K, public API ===== */
const isOn=()=>{ try{ const a=KS.active&&KS.active(); return !!(a&&a.id==='igcover'); }catch(_){ return false; } };
Object.defineProperty(IGC,'on',{get:isOn});
/* iPad Safari greys out font files it has no type for (WOFF2) — there any file is allowed and filtered after */
const IOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const FONT_ACCEPT=IOS?'*/*':'.ttf,.otf,.woff,.woff2,font/ttf,font/otf,font/woff,font/woff2,application/font-woff,application/x-font-ttf';
function keepF(root,fn){ const a=document.activeElement, f=a&&root&&root.contains(a)&&a.dataset&&a.dataset.igcf; const pos=f&&a.selectionStart!=null?[a.selectionStart,a.selectionEnd]:null; fn(); if(!f) return; const n=root.querySelector(`[data-igcf="${CSS.escape(f)}"]`); if(n&&n!==a){ n.focus(); if(pos) try{ n.setSelectionRange(pos[0],pos[1]); }catch(_){ } } }
function confirmTap(b,fn){ if(b.dataset.igcok==='1'){ b.dataset.igcok=''; fn(); return; } b.dataset.igcok='1'; const old=b.innerHTML; b.classList.add('igc-sure'); b.innerHTML='Точно?'; setTimeout(()=>{ if(b.isConnected&&b.dataset.igcok==='1'){ b.dataset.igcok=''; b.classList.remove('igc-sure'); b.innerHTML=old; } },2600); }
function switchPage(id){ const s=S(); if(!s.pages.some(p=>p.id===id)||s.page===id) return; s.page=id; IGC.slide=0; IGC.sel=null; IGC.vars=[]; IGC.ideas=null; IGC.refSel=null; IGC.lastErr=''; IGC.hk=''; KS.save(); paintAll(); }
function cyclePage(){ const s=S(), i=s.pages.findIndex(p=>p.id===s.page); switchPage(s.pages[(i+1)%s.pages.length].id); KS.toast('Страница «'+PG().name+'»'); }
async function delPage(){ const s=S(); if(s.pages.length<2) return; const p=PG(); s.pages=s.pages.filter(x=>x.id!==p.id); s.page=s.pages[0].id;
  for(const id of p.refs) try{ await KS.idb.del('igc:ref:'+id,'files'); }catch(_){ } for(const t of p.tpls) try{ await KS.idb.del('igc:tth:'+t.id,'files'); }catch(_){ } for(const b of p.bgs) try{ await KS.idb.del('igc:bg:'+b.id,'files'); }catch(_){ }
  KS.save(); if(PM) PM.close(); IGC.hk=''; paintAll(); KS.toast('Страница «'+p.name+'» удалена'); }
/* set a property of the selected element: 'align', 'fx.hl', 'color'… */
function setProp(path,val){ const e=selEl(); if(!e) return; histPush(); const num=['it','weight','size','ls','lh','w','h','op','rot','sw','r'].includes(path)||path==='fx.olw'; const v=num?+val:val;
  if(path.startsWith('fx.')){ e.fx=e.fx||{}; e.fx[path.slice(3)]=v; } else if(path==='font'){ e.font=v; } else e[path]=v; if(path==='k'&&e.t==='icon'&&/^(txt|emo):/.test(v)) e.fill=false; FITC.clear(); saveSoon(); paintStage(true); paintInsp(); paintStrip(); }
function toggleFx(k){ const e=selEl(); if(!e||e.t!=='text') return; histPush(); const fx=e.fx=e.fx||{}, p=PG();
  if(fx[k]){ delete fx[k]; if(k==='pill'&&e.color==='bg'&&!isDarkBg(D().bg,p)) e.color='ink'; if(k==='hollow'&&fx.ol===e.color) delete fx.ol; }
  else { const light=lum(col(e.color,p))>.6; fx[k]={hl:'accent2',ol:light?'ink':'bg',sh:1,pill:'accent',sq:1,hollow:1}[k];
    if(k==='pill'&&(e.color==='ink'||e.color==='accent')) e.color='bg'; if(k==='hollow'&&!fx.ol) fx.ol=e.color; if(k==='ol'&&!fx.olw) fx.olw=.09; }
  saveSoon(); paintStage(true); paintInsp(); }
function applyIdea(i){ const h=IGC.ideas&&IGC.ideas.list[i]; if(!h) return; const d=D(), p=PG(); if(p.fmt==='hl'){ setFmt('post'); } histPush(); const sl=D().slides[0]; IGC.slide=0;
  let t=sl.els.find(e=>e.t==='text'&&e.role==='title'); if(!t){ const [,H]=dimsOf(D()); t=T('title','',{y:Math.round(H*.32),h:Math.round(H*.3),size:120,fit:true}); sl.els.push(t); } t.text=h.title; if(!t.fit){ t.fit=true; t.h=Math.max(t.h,240); }
  if(h.sub){ let s=sl.els.find(e=>e.t==='text'&&e.role==='subtitle'); if(!s){ const [,H]=dimsOf(D()); s=T('subtitle','',{y:Math.round(H*.66),h:70,size:46}); sl.els.push(s); } s.text=h.sub; }
  IGC.sel=t.id; FITC.clear(); KS.save(); paintAll(); KS.toast('Заголовок на обложке'); }
const ACT={
  page:v=>switchPage(v), pageedit:()=>pageModal(), pmclose:()=>PM&&PM.close(),
  pageadd:()=>{ const s=S(); if(s.pages.length>=8){ KS.toast('Не больше 8 страниц'); return; } const p=newPage('other',{name:'Страница '+(s.pages.length+1)}); s.pages.push(p); s.page=p.id; IGC.slide=0; IGC.sel=null; IGC.hk=''; KS.save(); paintAll(); pageModal(); },
  pagedel:(v,b)=>confirmTap(b,delPage), pkind:v=>{ const p=PG(); p.kind=v; KS.save(); pageModal(); paintAll(); },
  pcolreset:()=>{ const p=PG(); p.col=clone((KINDS[p.kind]||KINDS.other).col); KS.save(); pageModal(); paintAll(); },
  refadd:async()=>{ const f=await KS.pick('image/*',true); if(f.length){ await addRefs(f); paintPanel(); } },
  refsel:v=>{ const L=refSel().slice(), i=L.indexOf(v); if(i>=0){ if(L.length>1) L.splice(i,1); } else { L.push(v); if(L.length>4) L.shift(); } IGC.refSel=L; paintPanel(); },
  refdel:async(v,b)=>confirmTap(b,async()=>{ await delRef(v); paintPanel(); }),
  aimode:v=>{ S().ui.ai=v; KS.save(); paintPanel(); }, nvar:v=>{ S().ui.nvar=+v; KS.save(); paintPanel(); }, aigo:()=>aiRun(), aikey:()=>{ try{ N().settings(); }catch(_){ KS.toast('Модуль ИИ не подключён'); } },
  usebg:v=>useBg(v), bgdel:(v,b)=>confirmTap(b,async()=>{ await delBg(v); paintPanel(); }), bgtab:v=>{ S().ui.bgTab=v; KS.save(); paintPanel(); }, tpl:v=>useTpl(v),
  photoup:async()=>{ const f=await KS.pick('image/*'); if(f.length) await photoBg(f); }, photolib:()=>photoLib(),
  libpick:async v=>{ const r=await KS.photos.get(v).catch(()=>null); if(LM) LM.close(); if(r&&r.data) await photoBgSrc(r.data); },
  photoas:v=>{ const d=D(), bg=d.bg||{}, ph=bg.k==='img'?bg.id:bg.photo; if(!ph) return; histPush(); const was=isDarkBg(bg,PG()); d.bg=v==='img'?{k:'img',id:ph,ox:.5,oy:.5,z:1,dark:!!bg.dark}:{k:'tpl',id:v,photo:ph}; contrastFix(d,was,isDarkBg(d.bg,PG())); KS.save(); paintAll(); },
  pagecols:()=>toPageColours(), pagefonts:()=>pageFontsAll(),
  fontup:async()=>{ const f=await KS.pick(FONT_ACCEPT,true); if(!f.length) return; await uploadFonts(f); paintAll(); if(FM&&!FM.root.hidden) paintFontModal(); },
  fontset:v=>{ const [r,id]=v.split(':'), p=PG(), k='own:'+id; histPush(); p.fonts[r]=p.fonts[r]===k?(KINDS[p.kind]||KINDS.other).fonts[r]:k; FITC.clear(); KS.save(); paintAll(); },
  fontdel:(v,b)=>confirmTap(b,async()=>{ await deleteFont(v); FITC.clear(); paintAll(); }),
  fontpick:v=>{ if(v==='el'){ if(selEl()) fontModal({k:'el'}); } else if(v&&v.startsWith('page:')) fontModal({k:'page',r:v.slice(5)}); else fontModal(null); },
  fmpick:v=>applyFont(v),
  preset:v=>applyPreset(v), num:v=>setNum((D().num||1)+(+v)), nextissue:()=>nextIssue(),
  ideas:async()=>{ const inp=q('.igc-pan [data-igcf="ui.topic"]'); if(inp) S().ui.topic=inp.value; IGC.ideasBusy=true; paintPanel(); try{ await ideas(S().ui.topic); } finally{ IGC.ideasBusy=false; KS.save(); paintPanel(); } },
  idea:v=>applyIdea(+v),
  tplsave:()=>tplSave(), tplopen:v=>tplOpen(v), tpldup:v=>tplDup(v), tpldel:(v,b)=>confirmTap(b,()=>tplDel(v)),
  type:v=>{ S().ui.type=v; KS.save(); paintScreenHead(); }, export:()=>exportFiles(false), exportone:()=>exportFiles(true), feed:()=>toFeed(), openfeed:()=>{ IGC.fed=null; KS.show('insta','igfeed'); },
  fmt:v=>setFmt(v), car:v=>setCarAspect(v), zones:()=>{ const u=S().ui; u.zones=!u.zones; KS.save(); paintScreenHead(); paintOverlay(); }, undo:()=>undo(), redo:()=>redo(),
  addtext:v=>addText(v), addshape:v=>{ closePops(); addShape(v); }, addicon:v=>addIcon(v),
  popshape:(v,b)=>togglePop(b), popslide:(v,b)=>togglePop(b),
  eldup:()=>IGC.sel&&dupEl(IGC.sel), elup:()=>IGC.sel&&orderEl(IGC.sel,1), eldown:()=>IGC.sel&&orderEl(IGC.sel,-1), eldel:()=>IGC.sel&&delEl(IGC.sel),
  set:v=>{ const i=v.indexOf('|'); setProp(v.slice(0,i),v.slice(i+1)); }, col:v=>{ const i=v.indexOf('|'); setProp(v.slice(0,i),v.slice(i+1)); }, fx:v=>toggleFx(v),
  sel:v=>{ IGC.sel=v; paintOverlay(); paintInsp(); },
  unman:()=>{ const e=selEl(); if(!e) return; histPush(); delete e.man; saveSoon(); paintStage(true); paintInsp(); },
  scrim:(v,b)=>{ const d=D(); histPush(); d.scrim=d.scrim===false?true:false; KS.save(); paintStage(true); paintPanel(); }, hide:v=>{ const e=elById(v); if(!e) return; histPush(); e.hide=!e.hide; if(e.hide&&IGC.sel===v) IGC.sel=null; saveSoon(); paintStage(true); paintInsp(); },
  slide:v=>goSlide(+v), addslide:v=>{ closePops(); addSlide(v==='new'?'':v); }, slmove:v=>moveSlide(IGC.slide,+v), sldel:(v,b)=>confirmTap(b,()=>delSlide(IGC.slide)),
  slbg:v=>{ const s=SL(), p=PG(); histPush(); if(v==='calm'){ const dark=isDarkBg(D().bg,p); s.bg=dark?{k:'tpl',id:'solid',c1:mix(p.col.ink,'#000000',.2),dark:true}:{k:'tpl',id:'paper'}; } else delete s.bg; KS.save(); paintAll(); }
};
function togglePop(b){ const box=b.parentElement.querySelector('.igc-popb'); const open=box.hidden; closePops(); box.hidden=!open; b.setAttribute('aria-expanded',String(open)); }
function closePops(){ qa('.igc-popb').forEach(x=>{ x.hidden=true; }); qa('[data-igc="popshape"],[data-igc="popslide"]').forEach(b=>b.setAttribute('aria-expanded','false')); }
document.addEventListener('click',ev=>{ const t=ev.target; if(!t.closest) return; if(!t.closest('.igc-pop')) closePops(); const b=t.closest('[data-igc]'); if(!b||!b.closest('.igc-root')||b.disabled) return;
  const fn=ACT[b.dataset.igc]; if(!fn) return; ev.preventDefault(); try{ const r=fn(b.dataset.igcv,b); if(r&&r.catch) r.catch(e=>{ console.warn('[igcover]',e); KS.toast(e.message||'Не получилось'); }); }catch(e){ console.error('[igcover]',e); KS.toast('Ошибка: '+e.message); } });
/* inputs: live preview on input, one undo step per edit (snapshot on focus, pushed on change) */
const DOCF=f=>!/^(ui\.|p\.|pc\.|fsearch)/.test(f);
document.addEventListener('focusin',ev=>{ const f=ev.target.dataset&&ev.target.dataset.igcf; if(f&&ev.target.closest('.igc-root')&&DOCF(f)) IGC.pre=JSON.stringify(D()); });
document.addEventListener('pointerdown',ev=>{ const t=ev.target; const f=t.dataset&&t.dataset.igcf; if(f&&t.closest&&t.closest('.igc-root')&&DOCF(f)&&t.type==='range') IGC.pre=JSON.stringify(D()); },true);
function commitPre(){ if(IGC.pre){ const now=JSON.stringify(D()); if(now!==IGC.pre) histPush(IGC.pre); IGC.pre=null; } saveSoon(); }
document.addEventListener('input',ev=>{ const t=ev.target, f=t.dataset&&t.dataset.igcf; if(!f||!t.closest('.igc-root')) return; const v=t.type==='checkbox'?t.checked:t.value, d=D(), p=PG(), e=selEl();
  const out=t.parentElement&&t.parentElement.querySelector('output'); if(out&&t.type==='range'){ const lab=t.closest('.igc-sl'); void lab; }
  if(f==='fsearch'){ IGC.fq=v; keepF(FM.el,paintFontModal); return; }
  if(f==='ui.topic'){ S().ui.topic=v; return; }
  if(f==='p.name'){ p.name=String(v).slice(0,30)||'Страница'; saveSoon(); return; } if(f==='p.handle'){ p.handle=String(v).replace(/^@+/,'').replace(/\s+/g,'').slice(0,40); saveSoon(); paintSoon(); return; }
  if(f.startsWith('pc.')){ p.col[f.slice(3)]=String(v).toUpperCase(); const sm=t.parentElement.querySelector('small'); if(sm) sm.textContent=p.col[f.slice(3)]; saveSoon(); paintSoon(); return; }
  if(f==='d.wash'||f==='d.dim'){ d[f.slice(2)]=+v; paintSoon(); return; } if(f.startsWith('bg.')){ d.bg[f.slice(3)]=+v; paintSoon(); return; }
  if(f==='d.num') return; if(f==='s.name'){ SL().name=String(v).slice(0,20); paintSoon(); clearTimeout(ACT.stT); ACT.stT=setTimeout(paintStrip,250); return; }
  if(!e) return;
  if(f==='text'){ e.text=v; paintSoon(); saveSoon(); return; } if(f==='emoji'){ if(String(v).trim()){ e.k='emo:'+String(v).trim(); paintSoon(); } return; }
  if(f.startsWith('hex:')){ const k=f.slice(4); if(k.startsWith('fx.')){ e.fx=e.fx||{}; e.fx[k.slice(3)]=String(v).toUpperCase(); } else e[k]=String(v).toUpperCase(); paintSoon(); return; }
  if(f==='fit'||f==='fill'){ return; } if(f==='role') return;
  const n=+v; if(f.startsWith('fx.')){ e.fx=e.fx||{}; e.fx[f.slice(3)]=n; } else e[f]=n; if(e.t==='icon'&&f==='w') e.h=n;
  if(out){ out.textContent=f==='size'||f==='w'||f==='h'?Math.round(n)+' px':f==='op'?Math.round(n*100)+'%':f==='rot'?n+'°':f==='sw'&&e.t==='icon'?n.toFixed(1):n.toFixed(f==='sw'?3:2); }
  paintSoon(); });
document.addEventListener('change',ev=>{ const t=ev.target, f=t.dataset&&t.dataset.igcf; if(!f||!t.closest('.igc-root')) return; const e=selEl();
  if(IGC.painting){ if(f==='ui.topic'||f==='p.name'||f==='p.handle'||f.startsWith('pc.')) KS.save(); else if(f==='d.num') { const d=D(), n=clamp(Math.round(+t.value||1),1,9999); if(d.num!==n){ histPush(); d.num=n; } } else commitPre(); return; }
  if(f==='ui.topic'||f==='p.name'||f==='p.handle'||f.startsWith('pc.')){ KS.save(); if(f!=='ui.topic') paintPanel(); return; }
  if(f==='d.num'){ IGC.pre=null; setNum(t.value); return; }
  if(f==='fit'&&e){ if(!IGC.pre) IGC.pre=JSON.stringify(D()); if(t.checked){ const L=VIEW.L[e.id]; if(L) e.h=Math.round(Math.max(L.h,e.size*1.2)); } e.fit=t.checked; FITC.clear(); paintStage(true); paintInsp(); }
  if(f==='fill'&&e){ if(!IGC.pre) IGC.pre=JSON.stringify(D()); e.fill=t.checked; paintSoon(); }
  if(f==='role'&&e){ if(!IGC.pre) IGC.pre=JSON.stringify(D()); e.role=t.value; FITC.clear(); paintStage(true); }
  if(f.startsWith('bg.')||f.startsWith('d.')){ commitPre(); return; }
  commitPre(); if(f==='text'||f.startsWith('hex:')){ paintInsp(); paintStrip(); } else if(f==='s.name') paintStrip(); else paintStrip(); });
/* the canvas */
document.addEventListener('pointerdown',ev=>{ if(ev.target.closest&&ev.target.closest('.igc-ov')) onDown(ev); });
document.addEventListener('pointermove',ev=>{ if(DR) onMove(ev); },{passive:false});
document.addEventListener('pointerup',ev=>{ if(DR) onUp(ev); }); document.addEventListener('pointercancel',ev=>{ if(DR) onUp(ev); });
document.addEventListener('dblclick',ev=>{ const b=ev.target.closest&&ev.target.closest('.igc-ov .igc-box'); if(!b) return; const e=elById(b.dataset.igce); if(e&&e.t==='text'){ IGC.sel=e.id; paintOverlay(); paintInsp(); focusText(true); } });
/* drag & drop: fonts anywhere in the section, pictures → references (AI card) or background */
const myZone=t=>t&&t.closest&&(t.closest('.igc-root')||t.closest('[data-ksscreen="insta:igcover"]'));
document.addEventListener('dragover',ev=>{ if(!isOn()||!myZone(ev.target)) return; if(![...(ev.dataTransfer&&ev.dataTransfer.types||[])].includes('Files')) return; ev.preventDefault(); const z=ev.target.closest('[data-igcdrop]')||ev.target.closest('.igc-stagewrap'); qa('.igc-over').forEach(x=>{ if(x!==z) x.classList.remove('igc-over'); }); if(z) z.classList.add('igc-over'); });
document.addEventListener('dragleave',ev=>{ if(ev.target.classList&&ev.target.classList.contains('igc-over')) ev.target.classList.remove('igc-over'); });
document.addEventListener('drop',async ev=>{ if(!isOn()||!myZone(ev.target)) return; const files=[...((ev.dataTransfer&&ev.dataTransfer.files)||[])]; if(!files.length) return; ev.preventDefault(); ev.stopPropagation(); qa('.igc-over').forEach(x=>x.classList.remove('igc-over'));
  const fonts=files.filter(f=>FONT_RE.test(f.name)), imgs=files.filter(f=>/^image\//.test(f.type||'')); const z=ev.target.closest('[data-igcdrop]');
  if(fonts.length){ await uploadFonts(fonts); paintAll(); }
  if(imgs.length){ if(z&&z.dataset.igcdrop==='ref'){ await addRefs(imgs); paintPanel(); } else await photoBg(imgs); } },true);
document.addEventListener('keydown',ev=>{ const t=ev.target; if(ev.key==='Enter'&&t&&t.dataset&&t.dataset.igcf==='ui.topic'){ ev.preventDefault(); ACT.ideas(); } });
/* keys (only while «Обложки» is on screen; stops the hidden Макет from getting arrows / Delete) */
let nudgeT=0;
window.addEventListener('keydown',ev=>{ if(!isOn()||!scrEl()) return; if(document.querySelector('.modal:not([hidden])')) return; const a=document.activeElement, typing=a&&(/INPUT|TEXTAREA|SELECT/.test(a.tagName)||a.isContentEditable), mod=ev.metaKey||ev.ctrlKey, k=ev.key;
  if(mod&&!ev.altKey&&(k==='z'||k==='Z'||k==='я'||k==='Я')&&!typing){ ev.preventDefault(); ev.stopPropagation(); if(ev.shiftKey) redo(); else undo(); return; }
  if(mod&&(k==='y'||k==='Y')&&!typing){ ev.preventDefault(); ev.stopPropagation(); redo(); return; }
  if(typing) return; const e=selEl(); const ours=['Delete','Backspace','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Enter','Escape'].includes(k)||(mod&&ev.code==='KeyD');
  if(!ours) return; ev.stopPropagation(); if(!e){ if(k!=='Escape') ev.preventDefault(); return; } ev.preventDefault();
  if(mod&&ev.code==='KeyD'){ dupEl(e.id); return; } if(k==='Delete'||k==='Backspace'){ delEl(e.id); return; } if(k==='Escape'){ IGC.sel=null; paintOverlay(); paintInsp(); return; } if(k==='Enter'){ if(e.t==='text') focusText(true); return; }
  const st2=ev.shiftKey?10:2, mv={ArrowLeft:[-st2,0],ArrowRight:[st2,0],ArrowUp:[0,-st2],ArrowDown:[0,st2]}[k]; if(mv){ if(!nudgeT) histPush(); clearTimeout(nudgeT); if(e.t==='text'&&!e.man){ e.y+=flowDy(e); e.man=1; } nudgeT=setTimeout(()=>{ nudgeT=0; KS.save(); paintInsp(); },600); e.x+=mv[0]; e.y+=mv[1]; paintSoon(); } },true);

/* ---- tab («Instagram» → «Обложки»), registered at boot after «Лента», «Стиль», «Подписи», «Мокапы» ---- */
let lastAI=null;
function render(box,o){ if(o.reason==='update'){ const a=hasAI()+':'+hasGem(); if(a!==lastAI&&panelBox()){ lastAI=a; paintPanel(); } return; }
  lastAI=hasAI()+':'+hasGem(); S(); paintPanel(); if(o.screen) paintScreen();
  if(!IGC.fontsTried){ IGC.fontsTried=true; loadOwnFonts().then(()=>{ if(isOn()){ FITC.clear(); paintAll(); } }); } }
let REG=false;
function register(){ if(REG) return; REG=true; const ic=I(IC.ig);
  KS.tab({id:'igcover',group:'insta',groupTitle:'Instagram',groupIcon:ic,icon:ic,title:'Обложки',seg:'Обложки',app:'print',before:'prep',screen:true,render});
  const go=fn=>{ KS.show('insta','igcover'); if(fn) setTimeout(()=>{ try{ const r=fn(); if(r&&r.catch) r.catch(e=>KS.toast(e.message)); }catch(e){ KS.toast(e.message); } },80); };
  KS.cmd('Обложки Instagram: редактор обложек','instagram',()=>go());
  KS.cmd('Обложки: обложка для Reels / Stories 9:16','instagram',()=>go(()=>setFmt('reel')));
  KS.cmd('Обложки: пост 4:5','instagram',()=>go(()=>setFmt('post')));
  KS.cmd('Обложки: карусель (обложка + слайды)','instagram',()=>go(()=>setFmt('carousel')));
  KS.cmd('Обложки: кружки Highlights','instagram',()=>go(()=>setFmt('hl')));
  KS.cmd('Обложки: загрузить свой шрифт','instagram',()=>go(async()=>{ const f=await KS.pick(FONT_ACCEPT,true); if(f.length){ await uploadFonts(f); paintAll(); } }));
  KS.cmd('Обложки: обложка по образцу (Gemini)','instagram',()=>go(async()=>{ if(!PG().refs.length){ const f=await KS.pick('image/*',true); if(f.length){ await addRefs(f); paintPanel(); } } else aiRun(); }));
  KS.cmd('Обложки: идеи заголовков (английский)','instagram',()=>go(()=>{ const i=q('.igc-pan [data-igcf="ui.topic"]'); if(i){ i.scrollIntoView({block:'center'}); i.focus(); } }));
  KS.cmd('Обложки: скачать обложку (JPG / PNG / ZIP)','instagram',()=>go(()=>exportFiles(false)));
  KS.cmd('Обложки: поставить в ленту Instagram','instagram',()=>go(()=>toFeed()));
  KS.cmd('Обложки: сохранить как шаблон','instagram',()=>go(()=>tplSave()));
  KS.cmd('Обложки: другая страница (Типография / Английский)','instagram',()=>go(()=>cyclePage())); }
KS.on('boot',()=>{ register(); setTimeout(()=>{ try{ S(); loadOwnFonts(); IGC.fontsTried=true; }catch(e){ console.warn('[igcover] boot',e); } },400); });
KS.on('neuroKey',()=>{ if(isOn()) paintPanel(); });
KS.on('screenHide',k=>{ if(k==='insta:igcover'){ DR=null; closePops(); } });
if(document.fonts&&document.fonts.addEventListener) document.fonts.addEventListener('loadingdone',()=>{ if(isOn()){ FITC.clear(); paintSoon(); } });
/* effective text bounds of a slide (after the anti-collision flow) — for tests and other modules */
function textBounds(i,d,p){ d=d||D(); p=p||PG(); const [W,H]=dimsOf(d); const L=drawSlide(cnv(W/8,H/8).getContext('2d'),d,i==null?IGC.slide:i,p,1/8)||{};
  return Object.entries(L).map(([id,x])=>{ const e=(d.slides[i==null?IGC.slide:i]||{els:[]}).els.find(z=>z.id===id)||{}; return {id,role:e.role,man:!!e.man,dy:x.dy,scrim:x.scrim,x0:x.vis.x0,x1:x.vis.x1,y0:x.vis.y0,y1:x.vis.y1}; }); }
/* a copy of a design with a background template applied the way the panel does it (text colours follow dark / light) */
function withTpl(doc,id,p){ const d=clone(doc); p=p||PG(); const was=isDarkBg(d.bg,p); d.bg={k:'tpl',id}; contrastFix(d,was,isDarkBg(d.bg,p),p); return d; }
KS.igcover={textBounds,withTpl,open:()=>KS.show('insta','igcover'),S,page:PG,doc:D,slide:SL,state:IGC,render:renderSlide,exportFiles,toFeed,uploadFonts,deleteFont,coverage,hasChar,missingIn,setFmt,applyPreset,applyLayout,addText,addShape,addIcon,addSlide,tplSave,tplOpen,useTpl,useBg,aiRun,ideas,switchPage,undo,redo,layoutEl,atomsOf,fontStr,TPL,PRESETS,paintAll};
