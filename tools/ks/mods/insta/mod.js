KS.mod('insta',{title:'Instagram — лента из 9 постов в одном стиле'});
/* ===== «Instagram»: brand style, AI grid of 9 posts from the owner's product photos, feed preview, captions, export.
   Big data → IndexedDB store 'files', keys 'ig:*'. Small settings → KS.store('insta'). AI only through KS.neuro. ===== */
const E=s=>KS.esc(s==null?'':String(s));
const q=(s,r)=>(r||document).querySelector(s), qa=(s,r)=>[...(r||document).querySelectorAll(s)];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const pad2=n=>String(n).padStart(2,'0');
const I=p=>KS.icon(p);
const IC={
  ig:'<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".9" fill="currentColor" stroke="none"/>',
  plus:'<path d="M12 5v14M5 12h14"/>', spark:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
  shuffle:'<path d="M16 4h4v4M4 20l16-16M20 16v4h-4M15 15l5 5M4 4l5 5"/>', lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
  unlock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 017.5-2"/>', redo:'<path d="M20 11a8 8 0 10-2.3 5.7"/><path d="M20 5v6h-6"/>',
  dl:'<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>', grid:'<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9.3 4v16M14.7 4v16M4 9.3h16M4 14.7h16"/>',
  phone:'<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>', palette:'<path d="M12 3a9 9 0 100 18c1.2 0 1.6-.8 1.6-1.6 0-1.2-1-1.4-1-2.4s.7-1.5 1.8-1.5H17a4 4 0 004-4c0-4.7-4-8.5-9-8.5z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="14.5" cy="7" r="1"/>',
  cam:'<path d="M4 8h3l1.5-2.5h7L17 8h3v11H4z"/><circle cx="12" cy="13.5" r="3.5"/>', img:'<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><circle cx="9" cy="10" r="1.7"/><path d="M20.5 16l-5-5-8 8.5"/>',
  trash:'<path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13"/>', check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>', warn:'<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17v.5"/>',
  left:'<path d="M15 5l-7 7 7 7"/>', right:'<path d="M9 5l7 7-7 7"/>', swap:'<path d="M7 4L3 8l4 4M3 8h13M17 12l4 4-4 4M21 16H8"/>',
  eye:'<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>', eyeoff:'<path d="M4 4l16 16M10 6c.6-.1 1.3-.2 2-.2C18 5.8 21.5 12 21.5 12a17 17 0 01-2.7 3.4M6.6 7.6C4 9.4 2.5 12 2.5 12S6 18.3 12 18.3c1.4 0 2.6-.3 3.7-.8"/>',
  copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5.5A1.5 1.5 0 0014.5 4h-9A1.5 1.5 0 004 5.5v9A1.5 1.5 0 005.5 16H8"/>', text:'<path d="M5 6h14M5 11h14M5 16h9"/>',
  cal:'<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>', key:'<circle cx="8" cy="15" r="4"/><path d="M11 12l8-8M16 7l2.5 2.5M14 9l2 2"/>',
  wand:'<path d="M5 19L16 8M14 6l4 4M18 3v3M16.5 4.5h3M20 9.5v2M19 10.5h2"/>', up:'<path d="M12 20V9M7 14l5-5 5 5M5 4h14"/>', zip:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M12 3v2M12 7v2M12 11v2M10.5 15h3v3h-3z"/>',
  hist:'<path d="M4 12a8 8 0 102.3-5.6L4 8.7"/><path d="M4 4v4.7h4.7M12 8v4.5l3 1.8"/>', stop:'<rect x="6" y="6" width="12" height="12" rx="2"/>', crop:'<path d="M6 2v16h16M2 6h16v16"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  heart:'<path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z"/>', msg:'<path d="M20 12a8 8 0 01-11.6 7.1L4 20l1-4.2A8 8 0 1120 12z"/>', send:'<path d="M21 3L10 14M21 3l-7 18-4-7-7-4z"/>', save:'<path d="M6 3h12v18l-6-4.5L6 21z"/>',
  menu:'<path d="M4 7h16M4 12h16M4 17h16"/>', reel:'<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M3.5 8.5h17M8 3.5l3 5M13.5 3.5l3 5M10.5 12v5l4-2.5z"/>', tag:'<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="12" cy="10" r="3"/><path d="M7 19c1-2.5 3-3.5 5-3.5s4 1 5 3.5"/>'};
const SHOT_IC={flat:'<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="8" y="9" width="8" height="6" rx="1"/>',angle:'<path d="M3 17l6-10h12l-6 10z"/>',
  macro:'<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/><circle cx="11" cy="11" r="2"/>',hands:'<path d="M8 13V6.5a1.5 1.5 0 013 0V12M11 11V5.5a1.5 1.5 0 013 0V12M14 11.5V7a1.5 1.5 0 013 0v6c0 4-2.5 7-6 7-2.5 0-4-1.2-5.3-3.2L4 14.6a1.5 1.5 0 012.4-1.8L8 15"/>',
  life:'<path d="M5 9h11v5a5 5 0 01-5 5h-1a5 5 0 01-5-5z"/><path d="M16 10h1.5a2.5 2.5 0 010 5H16M8 3c0 1.5 1 1.5 1 3M11 3c0 1.5 1 1.5 1 3"/>',gift:'<rect x="3.5" y="9" width="17" height="11" rx="1.5"/><path d="M3.5 13h17M12 9v11M12 9c-1.5-4-6-4-5.5-1.5S12 9 12 9zM12 9c1.5-4 6-4 5.5-1.5S12 9 12 9z"/>',
  process:'<path d="M9 3h6v4l2 3H7l2-3z"/><path d="M6 10h12v3H6z"/><circle cx="12" cy="18.5" r="2.5"/>',group:'<rect x="3" y="6" width="10" height="7" rx="1"/><rect x="8" y="10" width="10" height="7" rx="1"/><rect x="13" y="4" width="8" height="5" rx="1"/>',
  space:'<rect x="3.5" y="3.5" width="17" height="17" rx="2"/><rect x="6.5" y="13.5" width="5" height="4" rx=".6"/>',stack:'<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 12l9 5 9-5M3 16l9 5 9-5"/>',
  shadow:'<path d="M4 20h16"/><path d="M6 20V9a6 6 0 0112 0v11"/><path d="M12 3v17M6 12h12"/>',mail:'<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3.5 6.5l8.5 6.5 8.5-6.5"/><rect x="15.5" y="8" width="3" height="3.5" rx=".4"/>'};

/* ---- settings (small, in st.ks.insta) ---- */
const DEF={look:'linen',aspect:'4:5',mode:'ai',conc:3,harm:.75,cur:'',hist:[],my:[],view:'profile',phone:false,order:true,
  brand:{name:'tadhayrapetian',handle:'tadhayrapetian',cat:'Типография',bio:'Конверты с сургучом, открытки и печать ручной работы\nЕреван · доставка по Армении',link:'',followers:'1 248',following:'186',logo:'avatar'},
  cap:{lang:'ru',voice:'warm',emoji:true,cta:'',local:true,niche:true,extra:'',start:'',time:'19:00'}};
const S=()=>{ const s=KS.store('insta',DEF);
  ['brand','cap'].forEach(k=>{ if(!s[k]||typeof s[k]!=='object') s[k]=JSON.parse(JSON.stringify(DEF[k])); for(const x in DEF[k]) if(!(x in s[k])) s[k][x]=DEF[k][x]; });
  if(!Array.isArray(s.hist)) s.hist=[]; if(!Array.isArray(s.my)) s.my=[]; if(!['4:5','1:1'].includes(s.aspect)) s.aspect='4:5'; if(!['ai','free'].includes(s.mode)) s.mode='ai'; return s; };

/* ---- IndexedDB (store 'files', keys 'ig:') ---- */
const DB={get:k=>KS.idb.get(k,'files').catch(()=>null),set:(k,v)=>KS.idb.set(k,v,'files'),del:k=>KS.idb.del(k,'files').catch(()=>{}),
  keys:()=>KS.idb.keys('files').then(L=>(L||[]).filter(k=>typeof k==='string'&&k.startsWith('ig:'))).catch(()=>[])};

/* ---- images ---- */
function loadImg(src){ return new Promise((res,rej)=>{ const i=new Image(); i.onload=()=>res(i); i.onerror=()=>rej(new Error('Картинка не открылась')); i.src=src; }); }
function cnv(w,h){ const c=document.createElement('canvas'); c.width=Math.max(1,Math.round(w)); c.height=Math.max(1,Math.round(h)); return c; }
async function shrink(src,max,type,qual){ const im=await loadImg(src); const k=Math.min(1,max/Math.max(im.naturalWidth,im.naturalHeight)); const c=cnv(im.naturalWidth*k,im.naturalHeight*k), g=c.getContext('2d');
  if(type!=='image/png'){ g.fillStyle='#fff'; g.fillRect(0,0,c.width,c.height); } g.drawImage(im,0,0,c.width,c.height); return c.toDataURL(type||'image/jpeg',qual||.86); }
const DIM={'4:5':[1080,1350],'1:1':[1080,1080]};
/* cover-crop image into W×H; crop {x,y} ∈[0,1] = pan, z ≥1 = zoom */
function drawCover(g,im,W,H,cr){ const iw=im.naturalWidth||im.width, ih=im.naturalHeight||im.height, z=Math.max(1,(cr&&cr.z)||1), s=Math.max(W/iw,H/ih)*z, dw=iw*s, dh=ih*s;
  const x=(W-dw)*(cr&&cr.x!=null?cr.x:.5), y=(H-dh)*(cr&&cr.y!=null?cr.y:.5); g.drawImage(im,x,y,dw,dh); }
function dataBlob(d){ const m=String(d).match(/^data:([^;,]+)?(;base64)?,(.*)$/); if(!m) return new Blob([]); const raw=m[2]?atob(m[3]):decodeURIComponent(m[3]); const u=new Uint8Array(raw.length); for(let i=0;i<raw.length;i++) u[i]=raw.charCodeAt(i); return new Blob([u],{type:m[1]||'application/octet-stream'}); }
/* object URLs for display (keeps innerHTML small); cached per data URL */
const URLS=new Map();
function urlOf(d){ if(!d) return ''; if(!/^data:/.test(d)||d.length<160000) return d; let u=URLS.get(d); if(u){ URLS.delete(d); URLS.set(d,u); return u; } try{ u=URL.createObjectURL(dataBlob(d)); }catch(_){ return d; } URLS.set(d,u);
  if(URLS.size>60){ const [k,v]=URLS.entries().next().value; URLS.delete(k); setTimeout(()=>{ if(!document.querySelector(`img[src="${v}"]`)) try{ URL.revokeObjectURL(v); }catch(_){ } },4000); } return u; }
const hex2rgb=h=>{ h=String(h||'#888').replace('#',''); if(h.length===3) h=h.split('').map(c=>c+c).join(''); const n=parseInt(h.slice(0,6),16)||0; return [n>>16&255,n>>8&255,n&255]; };
const rgb2hex=(r,g,b)=>'#'+[r,g,b].map(v=>clamp(Math.round(v),0,255).toString(16).padStart(2,'0')).join('');
const lumHex=h=>{ const [r,g,b]=hex2rgb(h); return (.299*r+.587*g+.114*b)/255; };
function rng(a){ a=(a>>>0)||1; return ()=>{ a=(a+0x6D2B79F5)>>>0; let t=a; t=Math.imul(t^(t>>>15),t|1); t^=t+Math.imul(t^(t>>>7),t|61); return ((t^(t>>>14))>>>0)/4294967296; }; }

/* ---- looks: shared with instamock (same ids); this is the fallback copy when instamock is absent ---- */
const LOOKS0=[
 {id:'linen',name:'Тёплый лён',palette:['#f3ebdf','#dcc9ae','#b99c7b','#8a6e54','#fbf7f0'],surfaces:'natural washed linen tablecloth in oatmeal beige over light oak wood',props:'dried lavender and bunny-tail grass, a cotton ribbon, a brass fountain pen, a small handmade ceramic dish',light:'soft diffused daylight from a large window on the left, gentle long shadows',mood:'calm, warm, handmade, slow living',lens:'50mm f/2.8',angles:'top-down and 45°, eye-level details',
  grade:{temp:.25,tint:.02,contrast:-.1,lift:.12,fade:.08,sat:-.12,grain:.25,vignette:.15,curve:'soft'},ru:{desc:'Мягкий дневной свет, лён и сухоцветы',surf:'льняной скатерти',props:'сухоцветы, лента и перьевая ручка',light:'мягкий свет из окна'}},
 {id:'marble',name:'Белый мрамор',palette:['#f5f5f3','#e3e2de','#c8c4bd','#9a958e','#2e2d2b'],surfaces:'polished white Carrara marble with soft grey veins',props:'a single white tulip, a gold pen, a small glass of water, minimal and refined',light:'bright clean soft daylight, airy, soft short shadows',mood:'minimal, elegant, premium',lens:'85mm f/4',angles:'top-down and straight-on, symmetrical',
  grade:{temp:-.05,tint:0,contrast:.05,lift:.06,fade:.04,sat:-.2,grain:.12,vignette:.08,curve:'clean'},ru:{desc:'Белый мрамор, минимализм, много света',surf:'белом мраморе',props:'белый тюльпан и золотая ручка',light:'яркий чистый свет'}},
 {id:'kraft',name:'Крафт и сургуч',palette:['#c9a47c','#8b5e3c','#5a3a22','#ece0cb','#7a1f1f'],surfaces:'brown kraft paper on a rough dark wooden workbench',props:'jute twine, sticks of deep red sealing wax, a brass seal stamp, a wax spoon, a candle, dried eucalyptus',light:'warm directional side light, rich but soft contrast',mood:'rustic, crafted, cosy workshop',lens:'50mm f/2',angles:'45° and close details',
  grade:{temp:.35,tint:.03,contrast:.15,lift:.05,fade:.05,sat:-.05,grain:.3,vignette:.25,curve:'film'},ru:{desc:'Крафт, бечёвка, сургуч и тёплый свет',surf:'крафте и старом дереве',props:'бечёвка, сургуч и латунная печать',light:'тёплый боковой свет'}},
 {id:'moody',name:'Тёмный мудборд',palette:['#1f1d1b','#3a3330','#6b5446','#a88a6a','#d8c3a5'],surfaces:'dark charcoal plaster and deep brown walnut wood',props:'a lit candle, dried roses, an antique brass key, old books, a velvet ribbon',light:'low-key chiaroscuro light from a single window, deep soft shadows',mood:'romantic, mysterious, intimate',lens:'50mm f/1.8',angles:'45° and close-ups with deep shadows',
  grade:{temp:.2,tint:.04,contrast:.2,lift:.1,fade:.12,sat:-.18,grain:.35,vignette:.35,curve:'matte'},ru:{desc:'Тёмные тона, свеча и глубокие тени',surf:'тёмной штукатурке и орехе',props:'свеча, сухие розы и старый ключ',light:'свет из одного окна'}},
 {id:'apricot',name:'Ереванское утро',palette:['#f7d9bb','#efb68c','#d98c60','#faf0e4','#7d9a6c'],surfaces:'warm cream tablecloth, terracotta tiles and pink Armenian tuff stone',props:'fresh apricots, Armenian coffee in a small cup, a pomegranate, an apricot branch with leaves',light:'golden morning sun with soft warm shadows',mood:'sunny, joyful, Armenian warmth',lens:'35mm f/2.8',angles:'top-down and 45°',
  grade:{temp:.4,tint:-.02,contrast:.05,lift:.08,fade:.06,sat:.08,grain:.2,vignette:.12,curve:'warm'},ru:{desc:'Абрикосовые тона, туф и утреннее солнце',surf:'кремовой скатерти и туфе',props:'абрикосы, армянский кофе и гранат',light:'золотое утреннее солнце'}},
 {id:'nordic',name:'Скандинавский белый',palette:['#fafaf8','#e9e7e3','#d0d3d2','#9aa3a2','#3c4446'],surfaces:'white painted wood and light grey wool felt',props:'a eucalyptus sprig, a white ceramic mug, a linen napkin, a graphite pencil',light:'cool soft overcast daylight, very even, low shadows',mood:'clean, fresh, calm',lens:'50mm f/4',angles:'top-down, clean geometry',
  grade:{temp:-.15,tint:-.02,contrast:-.05,lift:.1,fade:.06,sat:-.25,grain:.1,vignette:.05,curve:'soft'},ru:{desc:'Белое дерево, эвкалипт, ровный свет',surf:'белом дереве и сером фетре',props:'эвкалипт и белая кружка',light:'ровный прохладный свет'}},
 {id:'vintage',name:'Винтажная почта',palette:['#e8dcc1','#c4a77e','#7d6a50','#4a5a6a','#9b3c2f'],surfaces:'aged ivory paper on an old wooden desk with patina',props:'old postage stamps, a vintage map, a fountain pen and inkwell, a pocket watch, letters tied with twine',light:'warm late-afternoon light, slightly hazy',mood:'nostalgic, romantic, timeless',lens:'40mm f/2.8, 35mm film look',angles:'45° and top-down',
  grade:{temp:.3,tint:.05,contrast:-.05,lift:.15,fade:.18,sat:-.3,grain:.45,vignette:.3,curve:'film'},ru:{desc:'Старые марки, карты, плёночный тон',surf:'старом письменном столе',props:'старые марки, карта и чернильница',light:'тёплый предвечерний свет'}},
 {id:'pastel',name:'Пастель',palette:['#f6e4e8','#e7dbf2','#d9ecf2','#fbf2db','#9d8ba6'],surfaces:'soft blush pink and lilac seamless paper backdrops',props:'ranunculus flowers, a silk ribbon, pearls, macarons',light:'bright soft diffused light, almost shadowless',mood:'tender, airy, festive',lens:'85mm f/2.8',angles:'top-down and straight-on',
  grade:{temp:.05,tint:.08,contrast:-.15,lift:.15,fade:.1,sat:-.08,grain:.1,vignette:.05,curve:'soft'},ru:{desc:'Пудровые тона, цветы и шёлк',surf:'пудровом фоне',props:'ранункулюсы и шёлковая лента',light:'мягкий рассеянный свет'}},
 {id:'botanic',name:'Ботаника',palette:['#e8eadd','#aab590','#6f7d58','#3f4a33','#dacaa9'],surfaces:'sage green linen and a light natural stone',props:'dried flowers, pressed ferns and leaves, olive branches, a small bud vase',light:'soft natural daylight with gentle leaf shadows',mood:'natural, botanical, serene',lens:'50mm f/2.8',angles:'top-down and 45°',
  grade:{temp:.1,tint:-.06,contrast:-.02,lift:.1,fade:.08,sat:-.15,grain:.22,vignette:.12,curve:'soft'},ru:{desc:'Сухоцветы, зелень и тени листьев',surf:'шалфейном льне и камне',props:'сухоцветы, папоротник и оливковые ветки',light:'мягкий свет и тени листьев'}}];
const L0=Object.fromEntries(LOOKS0.map(l=>[l.id,l]));
let BLOOKS=null;
function readBLooks(){ try{ const M=KS.instaMock; if(!M||typeof M.looks!=='function') return; const v=M.looks(); const take=L=>{ if(L&&!Array.isArray(L)&&typeof L==='object') L=Object.entries(L).map(([id,x])=>Object.assign({id},x)); if(Array.isArray(L)&&L.length) BLOOKS=L.filter(x=>x&&x.id); };
  if(v&&typeof v.then==='function') v.then(take).catch(()=>{}); else take(v); }catch(_){ } }
const txt=v=>Array.isArray(v)?v.join(', '):(v==null?'':String(v));
/* instamock looks keep scene data as objects (surfaces [{k,c}], props ids, light {ang…}) and grade in its own units
   (lift/fade/grain 0…0.15, curve = points); prompts use descriptive English text, the UI and my fallback grade use −1…1 / 0…1 */
const isB=l=>!!l&&(Array.isArray(l.surfaces)||(l.light&&typeof l.light==='object')||(l.grade&&Array.isArray(l.grade.curve)));
const CURVES={soft:[[0,0],[.25,.27],[.5,.52],[.75,.76],[1,.98]],warm:[[0,0],[.25,.27],[.5,.53],[.75,.78],[1,.99]],film:[[0,.03],[.25,.24],[.5,.51],[.75,.78],[1,.97]],matte:[[0,.06],[.25,.27],[.5,.5],[.75,.74],[1,.93]],clean:[[0,0],[1,1]],punch:[[0,0],[.25,.21],[.5,.5],[.75,.81],[1,1]]};
function gFromB(g){ g=g||{}; const c=Array.isArray(g.curve)?g.curve:null, c0=c&&c[0]?+c[0][1]||0:0, c1=c&&c[c.length-1]?+c[c.length-1][1]||1:1;
  return {temp:clamp((+g.temp||0)/.65,-1,1),tint:clamp(+g.tint||0,-1,1),contrast:clamp(+g.contrast||0,-1,1),lift:clamp((+g.lift||0)/.14,0,1),fade:clamp((+g.fade||0)/.12,0,1),sat:clamp((+g.sat||0)/.6,-1,1),grain:clamp((+g.grain||0)/.1,0,1),vignette:clamp((+g.vignette||0)/.45,0,1),curve:c?(c0>.045||c1<.94?'matte':c0>.012?'film':'soft'):(g.curve||'soft')}; }
function gToB(g){ g=gNorm(g); return {temp:g.temp*.65,tint:g.tint,contrast:g.contrast,lift:g.lift*.14,fade:g.fade*.12,sat:g.sat*.6,grain:g.grain*.1,vignette:g.vignette*.45,curve:CURVES[g.curve]||CURVES.soft,halation:0,bloom:0}; }
function lookText(k,l){ const v=l[k]; if(typeof v==='string') return v; if(Array.isArray(v)) return v.map(x=>typeof x==='string'?x:x&&x.k?x.k+(x.c&&/^#/.test(x.c)?'':' '+(x.c||'')):'').filter(Boolean).join(', ');
  if(k==='light'&&v&&typeof v==='object') return `${v.soft>.7?'soft diffused':v.soft>.45?'soft directional':'crisp directional'} natural light from the ${(+v.ang||0)<-20?'left':(+v.ang||0)>20?'right':'top'}${v.gobo&&v.gobo!=='none'?', gentle '+v.gobo+' shadows':''}`; return ''; }
function normLook(l){ const f=L0[l.id]||{}, b=isB(l), o=Object.assign({},f,{id:l.id,name:l.name||f.name||l.id,custom:!!l.custom,refs:l.refs});
  ['surfaces','props','light','mood','lens','angles'].forEach(k=>{ o[k]=(typeof l[k]==='string'&&l[k])?l[k]:(f[k]||lookText(k,l)||''); }); if(!o.mood) o.mood=String(l.desc||'');
  o.palette=(Array.isArray(l.palette)&&l.palette.length?l.palette:f.palette||['#eeeeee','#cccccc','#999999','#666666','#333333']).slice(0,6);
  o.grade=b?gFromB(l.grade):Object.assign({},f.grade||{},l.grade||{}); o.bLook=b; o.ru=Object.assign({desc:'',surf:'',props:'',light:''},f.ru||{},l.ru||{}); if(l.desc&&!(l.ru&&l.ru.desc)) o.ru.desc=String(l.desc).replace(/^./,c=>c.toUpperCase()); return o; }
function lookList(){ if(!BLOOKS) readBLooks(); return (BLOOKS||LOOKS0).map(normLook); }
function myLooks(){ return S().my.map(m=>Object.assign(normLook(Object.assign({},m)),{custom:true})); }
function lookById(id){ return myLooks().find(l=>l.id===id)||lookList().find(l=>l.id===id)||null; }
function curLook(){ return lookById(S().look)||lookList()[0]||normLook(LOOKS0[0]); }
/* grade numbers: −1…1 (temp, tint, contrast, sat) and 0…1 (lift, fade, grain, vignette); ±100 scales are accepted too */
function gNorm(g){ g=g||{}; const n=(v,lo,hi)=>{ v=+v||0; if(Math.abs(v)>1.5) v/=100; return clamp(v,lo,hi); };
  return {temp:n(g.temp,-1,1),tint:n(g.tint,-1,1),contrast:n(g.contrast,-1,1),lift:n(g.lift,0,1),fade:n(g.fade,0,1),sat:n(g.sat,-1,1),grain:n(g.grain,0,1),vignette:n(g.vignette,0,1),curve:typeof g.curve==='string'?g.curve:'soft'}; }

/* ---- product kinds ---- */
const KINDS=[['envelope','Конверт'],['postcard','Открытка'],['letter','Письмо'],['seal','Сургуч, печать'],['stamp','Штамп, марка'],['notebook','Блокнот'],['card','Визитка'],['invitation','Приглашение'],['sticker','Наклейки'],['photo','Фото'],['other','Другое']];
const KN=Object.fromEntries(KINDS);
const KRU={envelope:{n:'конверт',a:'конверт',p:'конверты',d:'сургуч и клапан конверта',pr:'запечатываем конверт сургучом',en:'envelope'},
 postcard:{n:'открытка',a:'открытку',p:'открытки',d:'край открытки и фактура бумаги',pr:'открытки после печати и резки',en:'postcard'},
 letter:{n:'письмо',a:'письмо',p:'письма',d:'почерк и волокна бумаги',pr:'пишем письмо перьевой ручкой',en:'letter'},
 seal:{n:'сургучная печать',a:'сургучную печать',p:'сургучные печати',d:'рельеф сургучного оттиска',pr:'плавим сургуч и ставим печать',en:'wax seal'},
 stamp:{n:'штамп',a:'штамп',p:'штампы и марки',d:'оттиск штампа и краска',pr:'ставим оттиски штампа на крафт',en:'rubber stamp / postage stamp'},
 notebook:{n:'блокнот',a:'блокнот',p:'блокноты',d:'обрез и переплёт блокнота',pr:'сшиваем блок блокнота',en:'notebook'},
 card:{n:'визитки',a:'визитки',p:'визитки',d:'толщина и фактура визитки',pr:'режем визитки после печати',en:'business card'},
 invitation:{n:'приглашение',a:'приглашение',p:'приглашения',d:'фактура и детали приглашения',pr:'вкладываем приглашения в конверты',en:'invitation'},
 sticker:{n:'наклейки',a:'наклейки',p:'наклейки',d:'край и глянец наклеек',pr:'вырезаем наклейки',en:'stickers'},
 photo:{n:'фото',a:'фото',p:'фотографии',d:'фактура фотобумаги',pr:'печатаем фотографии',en:'photo print'},
 other:{n:'изделие',a:'изделие',p:'изделия',d:'фактура бумаги',pr:'работа в мастерской',en:'printed paper product'}};
function guessKind(name,w,h,alpha){ const n=String(name||'').toLowerCase();
  const R=[[/конв|envel|\benv|c6|c5|dl\b/,'envelope'],[/сургуч|wax|seal/,'seal'],[/штамп|stamp|марк|postage/,'stamp'],[/печат(?!ь\s*фото)/,'seal'],[/блокн|тетр|notebook|скетч|ежедн|planner|journal/,'notebook'],[/визит|business|bcard|vizit/,'card'],[/пригл|invit|wedding|свад/,'invitation'],[/стик|накле|sticker/,'sticker'],[/письм|letter|лист/,'letter'],[/откр|postcard|card/,'postcard'],[/фото|photo/,'photo']];
  for(const [re,k] of R) if(re.test(n)) return k;
  if(alpha&&w&&h){ const r=Math.max(w,h)/Math.min(w,h); if(r>1.9) return 'envelope'; if(r>1.62) return 'card'; if(r>1.46) return 'postcard'; if(r>1.36) return h>w?'notebook':'envelope'; if(r<1.1) return 'seal'; }
  return 'envelope'; }

/* ---- shot types (a pro content designer's vocabulary) ---- */
const SHOTS={
 flat:{ru:'Флэтлей сверху',slug:'flatlay',busy:.62,lum:.6,en:'Top-down flat lay photographed from directly above (90°). The product lies flat, slightly off-centre on the rule of thirds; two or three props arranged around it with generous breathing room; tidy, editorial composition.'},
 angle:{ru:'Ракурс 45°',slug:'angle45',busy:.5,lum:.56,en:'Shot from a 45° angle at table level: the product rests on the surface or leans on a small object, shallow depth of field, the background melts into soft bokeh.'},
 macro:{ru:'Макро-деталь',slug:'macro',busy:.28,lum:.44,en:'Extreme close-up macro of the most tactile detail of the product: the relief of the wax seal, paper fibres, the deckled or cut edge, the ink of a stamp impression. Very shallow depth of field, crisp focus on the detail, everything else falls into soft blur.'},
 hands:{ru:'В руках',slug:'hands',busy:.58,lum:.56,en:'Natural hands (hands and wrists only, never a face) holding the product, opening it or writing next to it with a fountain pen; relaxed and candid, real skin texture, short neutral nails, the cuff of a linen shirt.'},
 life:{ru:'Лайфстайл',slug:'lifestyle',busy:.8,lum:.64,en:'Lifestyle still life on a table by a window: the product together with a cup of coffee, a small vase of flowers and a book; lived-in, cosy and authentic, morning window light with soft shadows.'},
 gift:{ru:'Упаковка, подарок',slug:'gift',busy:.74,lum:.58,en:'Gift-wrapping scene: the product placed into a box with tissue paper, tied with ribbon or twine, a small gift tag nearby; warm and inviting, no people.'},
 process:{ru:'Процесс',slug:'process',busy:.84,lum:.4,en:'Behind-the-scenes process shot in a small print studio: the product in the making — melted sealing wax pressed with a brass seal stamp, freshly printed sheets, cutting with a steel ruler on a cutting mat. Authentic workshop details, a hint of motion.'},
 group:{ru:'Коллекция',slug:'collection',busy:.9,lum:.6,en:'A curated group shot of all the given products together, elegantly overlapping, seen from above or at a slight angle; harmonious spacing so it reads as one collection.'},
 space:{ru:'Много воздуха',slug:'space',busy:.12,lum:.72,en:'Minimal composition with lots of negative space: the product is small, placed in the lower third or a corner; the rest of the frame is calm empty surface with a soft light gradient, leaving room for a text overlay.'},
 stack:{ru:'Стопка, веер',slug:'stack',busy:.55,lum:.58,en:'A neat stack or fan of several copies of the product at a slight angle, showing the paper thickness and the edges.'},
 shadow:{ru:'Свет и тени',slug:'light',busy:.36,lum:.46,en:'Quiet artistic shot with natural window light and soft leaf or window-frame shadows falling across the product; contemplative, calm.'},
 mail:{ru:'Готово к отправке',slug:'mail',busy:.6,lum:.56,en:'The product ready to be sent: with a postage stamp, next to a bundle of letters tied with twine and a vintage mail slot or postbox detail; romantic slow-mail mood.'}};
const BASE9=['flat','angle','macro','hands','life','gift','process','group','space'], EXTRA=['stack','shadow','mail'];
const AFF={macro:{seal:1,stamp:.9,envelope:.85,invitation:.65,letter:.6,postcard:.5,notebook:.5,card:.5,sticker:.4},
 hands:{envelope:1,letter:.95,postcard:.9,invitation:.9,card:.8,notebook:.7,sticker:.5,stamp:.5,seal:.4},
 process:{seal:1,stamp:.95,envelope:.9,postcard:.7,card:.65,sticker:.65,notebook:.6,invitation:.6},
 gift:{notebook:1,envelope:.9,postcard:.9,invitation:.85,sticker:.7,card:.6},
 space:{postcard:.9,card:.9,envelope:.85,invitation:.85,notebook:.75},
 life:{postcard:.95,notebook:.95,letter:.95,envelope:.85,invitation:.8},
 flat:{sticker:.95,postcard:.9,envelope:.9,invitation:.9,card:.85},
 mail:{envelope:1,letter:.95,postcard:.9,stamp:.75},
 stack:{card:1,postcard:.95,envelope:.9,sticker:.85,invitation:.8},
 angle:{notebook:1,invitation:.9,postcard:.9,card:.85,envelope:.8},
 shadow:{postcard:.9,letter:.9,envelope:.9,invitation:.9,notebook:.8}};
const aff=(shot,kind)=>((AFF[shot]||{})[kind]??(shot==='group'?1:.6));
function descRu(shot,kinds,look){ const K=KRU[kinds[0]]||KRU.other, R=(look&&look.ru)||{}, surf=R.surf||'столе', props=R.props||'немного реквизита', light=R.light||'мягкий свет';
  switch(shot){
   case 'flat': return `Сверху: ${K.n} на ${surf}, рядом ${props}`;
   case 'angle': return `Под углом 45°: ${K.n}, фон мягко размыт, ${light}`;
   case 'macro': return `Крупно: ${K.d}, видна фактура`;
   case 'hands': return `Руки держат ${K.a}; ${light}`;
   case 'life': return `Утро у окна: ${K.n}, кофе и цветы`;
   case 'gift': return `Подарочная упаковка: ${K.n}, лента и бумага тишью`;
   case 'process': return `Процесс: ${K.pr}`;
   case 'group': { const L=[...new Set(kinds.map(k=>(KRU[k]||KRU.other).p))]; return `Коллекция: ${L.length>1?L.join(', '):'несколько изделий вместе'} — красиво разложены`; }
   case 'space': return `Много воздуха: ${K.n} в углу кадра, место для текста`;
   case 'stack': return `Стопка и веер: ${K.p}, видна толщина бумаги`;
   case 'shadow': return `Свет из окна и тени листьев, в кадре ${K.n}`;
   case 'mail': return `Готово к отправке: ${K.n}, марка и бечёвка`; }
  return K.n; }

/* ===== runtime state, sources, sets, the 3×3 plan ===== */
const IG={fin:false,ready:false,loading:null,srcs:[],set:null,old:[],run:null,stats:{},view:null,swap:null,refs:[],draft:null,harm:null,harmKey:'',appSrc:null};
const ADJ=[[0,1],[1,2],[3,4],[4,5],[6,7],[7,8],[0,3],[3,6],[1,4],[4,7],[2,5],[5,8]];
const NB=p=>ADJ.filter(e=>e.includes(p)).map(e=>e[0]===p?e[1]:e[0]);
const dayOfPos=p=>9-p, posOfDay=d=>9-d;   /* posting order: bottom-right first, so the grid builds up correctly */

/* ---- product sources (owner's photos + app sources) ---- */
async function srcLoad(){ const L=await DB.get('ig:srcs'); IG.srcs=Array.isArray(L)?L.filter(x=>x&&x.id):[]; }
const srcSave=()=>DB.set('ig:srcs',IG.srcs).catch(e=>console.warn('[insta] srcs',e));
async function srcData(id){ const r=await DB.get('ig:src:'+id); return (r&&r.src)||null; }
const srcOn=()=>IG.srcs.filter(s=>!s.off);
const srcById=id=>IG.srcs.find(s=>s.id===id)||null;
async function hasAlpha(src){ try{ const im=await loadImg(src); const c=cnv(40,40), g=c.getContext('2d'); g.drawImage(im,0,0,40,40); const d=g.getImageData(0,0,40,40).data; let n=0; for(let i=3;i<d.length;i+=4) if(d[i]<200) n++; return n>30; }catch(_){ return false; } }
async function srcAdd(o){ const sz=await KS.imgSize(o.src); if(!sz.w) throw new Error('Картинка не открылась');
  const alpha=/^data:image\/(png|webp)/.test(o.src)&&await hasAlpha(o.src), thumb=await shrink(o.src,360,alpha?'image/png':'image/jpeg',.84), id=KS.uid('igs');
  const rec={id,kind:KN[o.kind]?o.kind:guessKind(o.name,sz.w,sz.h,alpha),name:String(o.name||'Фото').slice(0,60),thumb,w:sz.w,h:sz.h,from:o.from||'upload',alpha:!!alpha,added:Date.now()};
  await DB.set('ig:src:'+id,{src:o.src}); IG.srcs.push(rec); await srcSave(); return rec; }
async function srcFiles(files){ files=[...(files||[])].filter(f=>f&&/^image\//.test(f.type)); if(!files.length){ KS.toast('Выберите фото (JPG, PNG, HEIC→JPG)'); return 0; }
  let n=0; KS.toast('Добавляю фото: '+files.length+'…');
  for(const f of files){ try{ const src=await KS.readImage(f,2000); await srcAdd({src,name:(f.name||'Фото').replace(/\.[^.]+$/,''),from:'upload'}); n++; }catch(e){ console.warn('[insta] file',e); } }
  srcChanged(); KS.toast(n?'Добавлено фото изделий: '+n:'Не получилось открыть фото'); return n; }
async function srcDel(id){ IG.srcs=IG.srcs.filter(s=>s.id!==id); await DB.del('ig:src:'+id); await srcSave(); srcChanged(); }
/* after the source list changes: give plan tiles (not yet made) valid sources again */
function srcChanged(){ const set=IG.set; if(set&&set.tiles.length){ const on=srcOn(), ids=new Set(on.map(s=>s.id));
    const bad=set.tiles.some(t=>!t.img&&!t.locked&&(!t.src.length||t.src.some(id=>!ids.has(id))));
    const fresh=set.tiles.every(t=>!t.img&&!t.locked);
    if(on.length&&fresh&&!set.edited) planMake(set.seed||0,true);
    else if(on.length&&bad) planMake(set.seed||0,'valid'); }
  setSave(); paintAll(); }

/* ---- sets: a set = one grid of 9 posts; meta in 'ig:set:<id>', each image in 'ig:img:<set>:<tile>:raw|img' ---- */
function newSet(){ const s=S(), d=new Date(); return {id:KS.uid('igset'),name:'Лента '+d.toLocaleDateString('ru-RU',{day:'numeric',month:'short'}).replace('.',''),created:Date.now(),updated:Date.now(),aspect:s.aspect,mode:s.mode,look:s.look,seed:0,tiles:[],carousel:[],capsAt:0}; }
function newTile(shot,src,look){ return {id:KS.uid('igt'),shot,src:src||[],desc:descRu(shot,(src||[]).map(id=>(srcById(id)||{}).kind||'other'),look),auto:true,status:'plan',locked:false,crop:{x:.5,y:.5,z:1},adj:{exp:0,warm:0,str:1},cap:null,err:''}; }
function setMeta(set){ return JSON.parse(JSON.stringify(Object.assign({},set,{tiles:set.tiles.map(t=>{ const o=Object.assign({},t); delete o.raw; delete o.img; o.hasRaw=!!t.raw; o.hasImg=!!t.img; return o; })}))); }
let setT=0;
function setSave(now){ clearTimeout(setT); const go=async()=>{ const set=IG.set; if(!set) return; set.updated=Date.now(); try{ await DB.set('ig:set:'+set.id,setMeta(set)); }catch(e){ console.warn('[insta] save',e); } histUpd(set); };
  if(now) return go(); setT=setTimeout(go,350); return Promise.resolve(); }
async function putImg(set,t,kind){ const k='ig:img:'+set.id+':'+t.id+':'+kind; try{ if(t[kind]) await DB.set(k,t[kind]); else await DB.del(k); }catch(e){ console.warn('[insta] img',e); } }
async function setLoad(id){ const m=await DB.get('ig:set:'+id); if(!m||!Array.isArray(m.tiles)) return null;
  for(const t of m.tiles){ if(t.hasRaw) t.raw=await DB.get('ig:img:'+m.id+':'+t.id+':raw'); if(t.hasImg) t.img=await DB.get('ig:img:'+m.id+':'+t.id+':img');
    if(!t.adj) t.adj={exp:0,warm:0,str:1}; if(!t.crop) t.crop={x:.5,y:.5,z:1}; if(t.status==='run'||t.status==='wait') t.status=t.raw?'ok':'plan'; if(t.status==='ok'&&!t.raw) t.status='plan'; }
  if(!Array.isArray(m.carousel)) m.carousel=[]; return m; }
function histUpd(set){ const s=S(), n=set.tiles.filter(t=>t.img).length; let h=s.hist.find(x=>x.id===set.id); if(!h){ if(!n) return; h={id:set.id}; s.hist.unshift(h); }
  Object.assign(h,{name:set.name,created:set.created,updated:set.updated,look:(lookById(set.look)||{}).name||'',n}); KS.save(); }
async function setDelete(id){ const keys=await DB.keys(); await Promise.all(keys.filter(k=>k==='ig:set:'+id||k==='ig:thumb:'+id||k.startsWith('ig:img:'+id+':')).map(k=>DB.del(k))); const s=S(); s.hist=s.hist.filter(h=>h.id!==id); KS.save(); }
async function setOpen(id){ if(IG.run){ KS.toast('Дождитесь окончания генерации'); return; } const m=await setLoad(id); if(!m){ KS.toast('Набор не найден'); return; } await setSave(true); IG.set=m; S().cur=m.id; S().look=m.look||S().look; S().aspect=m.aspect||S().aspect; KS.save(); IG.stats={}; IG.view='profile'; paintAll(); KS.toast('Открыт набор «'+m.name+'»'); }
async function setNew(o){ o=o&&o.silent?o:{}; if(IG.run){ KS.toast('Дождитесь окончания генерации'); return; } await setSave(true); const set=newSet(); IG.set=set; S().cur=set.id; KS.save(); IG.stats={}; planMake(0); IG.view=o.silent?'profile':'plan'; setSave(); paintAll(); if(!o.silent) KS.toast('Новая лента: проверьте план из 9 кадров'); }
async function ensure(){ if(IG.ready) return; if(IG.loading) return IG.loading;
  IG.loading=(async()=>{ readBLooks(); await srcLoad(); const s=S(); let set=s.cur?await setLoad(s.cur):null; if(!set){ set=newSet(); s.cur=set.id; KS.save(); }
    IG.set=set; if(set.tiles.length!==9) planMake(set.seed||0); const old=await DB.get('ig:old'); IG.old=Array.isArray(old)?old:[]; IG.ready=true; })();
  try{ await IG.loading; }catch(e){ console.error('[insta] load',e); IG.set=IG.set||newSet(); if(IG.set.tiles.length!==9) planMake(0); IG.ready=true; } }

/* ---- planning the 3×3 grid: shot types in a checkerboard of busy/calm, light/dark; products spread evenly ---- */
function pickShots(seed,nSrc){ const L=BASE9.slice(); if(nSrc<2) L[L.indexOf('group')]='stack';
  if(seed){ const r=rng(seed*7+3), sw=['angle','hands','gift','process','life'].filter(x=>L.includes(x)), n=1+Math.floor(r()*2);
    for(let i=0;i<n&&sw.length;i++){ const ex=EXTRA.filter(x=>!L.includes(x)); if(!ex.length) break; const a=sw.splice(Math.floor(r()*sw.length),1)[0]; const tmp=L.slice(); tmp[tmp.indexOf(a)]=ex[Math.floor(r()*ex.length)];
      if(tmp.includes('life')||tmp.includes('hands')) L.splice(0,9,...tmp); } }
  return L; }
const BUSY_T=p=>((Math.floor(p/3)+p%3)%2===0);   /* corners + centre carry the busier frames, edges breathe */
function planScore(arr){ let s=0; arr.forEach((k,p)=>{ const d=SHOTS[k].busy-(BUSY_T(p)?.8:.3); s+=d*d*3; });
  ADJ.forEach(([a,b])=>{ const A=SHOTS[arr[a]],B=SHOTS[arr[b]]; if(arr[a]===arr[b]) s+=5; if(A.lum<.48&&B.lum<.48) s+=1.6; if(Math.abs(A.busy-B.busy)<.12) s+=.35; });
  if(!['group','flat','life'].includes(arr[4])) s+=.9; const sp=arr.indexOf('space'); if(sp===4) s+=2; else if(sp>=0&&![1,3,5,7].includes(sp)) s+=.5; return s; }
function arrange(pool,fixed,seed){ const r=rng(seed*31+11), free=[...Array(9).keys()].filter(p=>!fixed[p]); let best=null,bs=1e9;
  for(let it=0;it<1600;it++){ const a=pool.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
    const arr=Array(9); for(let p=0;p<9;p++) arr[p]=fixed[p]?fixed[p].shot:null; free.forEach((p,i)=>arr[p]=a[i]); const sc=planScore(arr)+r()*(seed?.7:.05); if(sc<bs){ bs=sc; best=arr; } }
  return best; }
const spreadOf=shot=>{ const v=Object.values(AFF[shot]||{}); return v.length?Math.max(...v)-Math.min(...v):0; };
function assignSources(arr,srcs,seed,fixed){ const out=arr.map((_,p)=>fixed[p]?fixed[p].src.slice():[]); if(!srcs.length) return out;
  const r=rng(seed*13+5), use={}; srcs.forEach(s=>use[s.id]=0); out.forEach(L=>L.forEach(id=>{ if(id in use) use[id]+=1; }));
  const cap=Math.ceil(9/srcs.length), order=[...Array(9).keys()].filter(p=>!fixed[p]).sort((a,b)=>spreadOf(arr[b])-spreadOf(arr[a])||(r()-.5));
  for(const p of order){ const shot=arr[p]; let best=srcs[0],bs=-1e9;
    for(const s of srcs){ let v=aff(shot,s.kind)*2-use[s.id]*1.1-(use[s.id]>=cap?3:0)+r()*.25; if(NB(p).some(x=>out[x][0]===s.id)) v-=1.4; if(v>bs){ bs=v; best=s; } }
    out[p]=[best.id]; use[best.id]++;
    if(shot==='group') srcs.filter(s=>s.id!==best.id).sort((a,b)=>(use[a.id]-use[b.id])||((a.kind===best.kind)-(b.kind===best.kind))).slice(0,2).forEach(s=>{ out[p].push(s.id); use[s.id]+=.5; }); }
  for(const s of srcs){ if(out.some(L=>L.includes(s.id))) continue; const c=order.filter(p=>arr[p]!=='group'&&use[out[p][0]]>1).sort((a,b)=>aff(arr[b],s.kind)-aff(arr[a],s.kind))[0];
    if(c!=null){ use[out[c][0]]--; out[c]=[s.id]; use[s.id]++; } }
  return out; }
/* keep: tiles that are locked or already made stay where they are */
function planMake(seed,keep){ const set=IG.set; if(!set) return; const look=lookById(set.look)||curLook(), srcs=srcOn(), fixed={};
  const okSrc=t=>t.src.length&&t.src.every(id=>srcs.some(s=>s.id===id));
  if(keep&&set.tiles.length===9) set.tiles.forEach((t,p)=>{ if(t.locked||t.img||t.status==='run'||(keep==='valid'&&okSrc(t))) fixed[p]=t; });
  const freeN=9-Object.keys(fixed).length; let pool=pickShots(seed,srcs.length);
  Object.values(fixed).forEach(t=>{ const i=pool.indexOf(t.shot); if(i>=0) pool.splice(i,1); });
  const spare=EXTRA.concat(BASE9).filter(x=>!pool.includes(x)&&!Object.values(fixed).some(t=>t.shot===x));
  while(pool.length>freeN){ const i=pool.findIndex(x=>!['flat','macro','space','group'].includes(x)); pool.splice(i>=0?i:pool.length-1,1); }
  while(pool.length<freeN) pool.push(spare.shift()||'flat');
  const arr=arrange(pool,fixed,seed), src=assignSources(arr,srcs,seed,fixed);
  set.tiles=arr.map((shot,p)=>fixed[p]||newTile(shot,src[p],look)); set.seed=seed; IG.harm=null; }
function tileDesc(t){ const set=IG.set, look=lookById(set&&set.look)||curLook(); if(t.auto) t.desc=descRu(t.shot,t.src.map(id=>(srcById(id)||{}).kind||'other'),look); }

/* ===== unified colour grade, harmony meter, free (no-AI) mockups ===== */
const hashStr=s=>{ let h=2166136261; for(const ch of String(s)){ h^=ch.charCodeAt(0); h=Math.imul(h,16777619); } return h>>>0; };
/* statistics in YCbCr (Cb/Cr centred on 0) */
function statsOf(c){ const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data; let n=0,sy=0,sy2=0,sb=0,sr=0;
  for(let i=0;i<d.length;i+=4){ const r=d[i],g=d[i+1],b=d[i+2], y=.299*r+.587*g+.114*b; sy+=y; sy2+=y*y; sb+=-.168736*r-.331264*g+.5*b; sr+=.5*r-.418688*g-.081312*b; n++; }
  const m=sy/n; return {y:m,sd:Math.sqrt(Math.max(4,sy2/n-m*m)),cb:sb/n,cr:sr/n}; }
/* targets that pull the 9 frames together: same white balance, similar contrast, softened brightness differences (some rhythm stays) */
function harmTargets(stats,look,h){ const L=Object.values(stats); if(!L.length) return {}; const av=k=>L.reduce((a,s)=>a+s[k],0)/L.length;
  const Y=av('y'), SD=av('sd'), CB=av('cb'), CR=av('cr'), pm=look.palette.map(hex2rgb).reduce((a,c)=>[a[0]+c[0],a[1]+c[1],a[2]+c[2]],[0,0,0]).map(v=>v/look.palette.length);
  const pcb=(-.168736*pm[0]-.331264*pm[1]+.5*pm[2])*.35, pcr=(.5*pm[0]-.418688*pm[1]-.081312*pm[2])*.35, tcb=CB*.7+pcb*.3, tcr=CR*.7+pcr*.3, out={};
  for(const [id,s] of Object.entries(stats)) out[id]={mY:s.y,tY:Y+(s.y-Y)*(1-h*.55),k:clamp((s.sd+(SD-s.sd)*h*.6)/s.sd,.78,1.3),dcb:(tcb-s.cb)*h,dcr:(tcr-s.cr)*h};
  return out; }
function curveFn(g){ const k=g.contrast*.6+(g.curve==='film'?.08:g.curve==='punch'?.15:g.curve==='soft'?-.04:0), lift=g.lift*.14+(g.curve==='matte'?.05:g.curve==='film'?.025:0), fade=g.fade*.1+(g.curve==='matte'?.03:0);
  return x=>{ x=clamp(x,0,1); const e=Math.max(.3,1+k); x=x<.5?.5*Math.pow(2*x,e):1-.5*Math.pow(2*(1-x),e); return lift+x*(1-lift-fade); }; }
function buildLUT(g){ const t=g.temp+(g.curve==='warm'?.06:0), ti=g.tint, cf=curveFn(g), mul=[1+t*.07+ti*.02,1+t*.015-ti*.05,1-t*.09+ti*.02];
  return [0,1,2].map(c=>{ const a=new Uint8ClampedArray(256); for(let v=0;v<256;v++) a[v]=Math.round(cf(v/255*mul[c])*255); return a; }); }
function preLUT(adj){ const ex=Math.pow(2,((adj&&adj.exp)||0)*.6), w=((adj&&adj.warm)||0)*.6, mul=[(1+w*.07)*ex,(1+w*.015)*ex,(1-w*.09)*ex];
  return [0,1,2].map(c=>{ const a=new Uint8ClampedArray(256); for(let v=0;v<256;v++){ let x=v/255*mul[c]; if(ex>1) x=x/(1+(x>.8?(x-.8)*.9:0)); a[v]=Math.round(clamp(x,0,1)*255); } return a; }); }
const smooth=(a,b,x)=>{ const t=clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };
/* one pass over the pixels: harmonise → owner's tweaks → look grade (curve, warmth, saturation, vignette, grain) → mix by strength */
function gradePixels(id,W,H,P){ const d=id.data, h=P.h, pre=P.pre, lut=P.lut, sat=1+(P.sat||0)*.6, vig=(P.vig||0)*.38, gr=(P.grain||0)*36, str=P.str==null?1:P.str; let s=(P.seed>>>0)||7;
  const cx=W/2, cy=H/2;
  for(let y=0;y<H;y++){ const ny=(y-cy)/cy, ny2=ny*ny;
    for(let x=0;x<W;x++){ const i=(y*W+x)*4; let r=d[i],g=d[i+1],b=d[i+2];
      if(h){ let Y=.299*r+.587*g+.114*b, cb=-.168736*r-.331264*g+.5*b, cr=.5*r-.418688*g-.081312*b; Y=(Y-h.mY)*h.k+h.tY; cb+=h.dcb; cr+=h.dcr;
        r=Y+1.402*cr; g=Y-.344136*cb-.714136*cr; b=Y+1.772*cb; r=r<0?0:r>255?255:r; g=g<0?0:g>255?255:g; b=b<0?0:b>255?255:b; }
      if(pre){ r=pre[0][r|0]; g=pre[1][g|0]; b=pre[2][b|0]; }
      if(lut){ let R=lut[0][r|0], G=lut[1][g|0], B=lut[2][b|0];
        if(sat!==1){ const yy=.299*R+.587*G+.114*B; R=yy+(R-yy)*sat; G=yy+(G-yy)*sat; B=yy+(B-yy)*sat; }
        if(vig){ const nx=(x-cx)/cx, dd=Math.sqrt((nx*nx+ny2)/2), v=1-vig*smooth(.42,1.02,dd); R*=v; G*=v; B*=v; }
        if(gr){ s^=s<<13; s^=s>>>17; s^=s<<5; const n=((s>>>0)/4294967296-.5)*gr; R+=n; G+=n; B+=n; }
        if(str<1){ R=r+(R-r)*str; G=g+(G-g)*str; B=b+(B-b)*str; } r=R; g=G; b=B; }
      d[i]=r; d[i+1]=g; d[i+2]=b; } } }
/* TH brand mark in the corner of each post (only when the owner chose «Знак на постах») */
const monoTxt=()=>{ const n=String(S().brand.name||'').trim(); if(!n||/^tad\s*hayrapetian$/i.test(n)) return 'TH'; const w=n.split(/\s+/).filter(Boolean); if(/^[A-ZА-ЯԱ-Ֆ]{2,3}$/.test(w[0])) return w[0]; return (w.length>1?w[0][0]+w[1][0]:n.slice(0,2)).toUpperCase(); };
async function markDraw(g,W,H){ if(S().brand.logo!=='corner') return; const s=W/1080, x=W-74*s, y=H-60*s;
  try{ await document.fonts.load(`500 ${Math.round(48*s)}px "Cormorant Garamond"`); }catch(_){ }
  let L=200; try{ const d=g.getImageData(Math.round(x-46*s),Math.round(y-46*s),Math.round(92*s),Math.round(66*s)).data; let a=0; for(let i=0;i<d.length;i+=4) a+=.299*d[i]+.587*d[i+1]+.114*d[i+2]; L=a/(d.length/4); }catch(_){ }
  const col=L>150?'rgba(34,28,24,.66)':'rgba(255,255,255,.86)'; g.save(); g.fillStyle=col; g.strokeStyle=col; g.textAlign='center';
  g.font=`500 ${Math.round(48*s)}px "Cormorant Garamond","Playfair Display",Georgia,serif`; g.fillText(monoTxt(),x,y); g.lineWidth=1.3*s; g.beginPath(); g.moveTo(x-28*s,y+11*s); g.lineTo(x+28*s,y+11*s); g.stroke(); g.restore(); }
const useB=()=>!!(KS.instaMock&&typeof KS.instaMock.grade==='function');
/* what instamock gets: its own look by id, or my/custom look with the grade converted to its units */
const lookForB=look=>look.bLook&&!look.custom?look.id:Object.assign({},look,{grade:gToB(look.grade)});
const bLookId=look=>{ if(look.bLook&&!look.custom) return look.id; const L=lookList().filter(l=>l.bLook); if(!L.length) return look.id; const lab=h=>rgb2lab(...hex2rgb(h)), A=look.palette.map(lab); let best=L[0],bv=1e9; for(const l of L){ const B=l.palette.map(lab); let v=0; A.forEach(a=>{ v+=Math.min(...B.map(x=>Math.hypot(a[0]-x[0],a[1]-x[1],a[2]-x[2]))); }); if(v<bv){ bv=v; best=l; } } return best.id; };
/* the finished post: crop → harmonise → tweaks → look grade (instamock's when present) → mark; JPEG 1080 px */
async function renderTile(t,look,target,o){ o=o||{}; const set=IG.set, ax=t.ax||set.aspect, [W,H]=DIM[ax]||DIM['4:5'], im=await loadImg(t.raw);
  const c=cnv(W,H), g=c.getContext('2d'); g.fillStyle='#fff'; g.fillRect(0,0,W,H); drawCover(g,im,W,H,t.crop); const G=gNorm(look.grade), adj=t.adj||{}, str=clamp(adj.str==null?1:adj.str,0,1);
  let done=false;
  if(useB()&&!o.quick){ const id=g.getImageData(0,0,W,H); gradePixels(id,W,H,{h:target,pre:preLUT(adj)}); g.putImageData(id,0,0);
    try{ const out=await KS.instaMock.grade(c.toDataURL('image/jpeg',.95),lookForB(look)); if(out){ const im2=await loadImg(out); g.globalAlpha=str; g.drawImage(im2,0,0,W,H); g.globalAlpha=1; done=true; } }
    catch(e){ console.warn('[insta] instaMock.grade',e); }
    if(!done){ const id2=g.getImageData(0,0,W,H); gradePixels(id2,W,H,{lut:buildLUT(G),sat:G.sat,vig:G.vignette,grain:G.grain,str,seed:hashStr(t.id)}); g.putImageData(id2,0,0); done=true; } }
  if(!done){ const id=g.getImageData(0,0,W,H); gradePixels(id,W,H,{h:target,pre:preLUT(adj),lut:buildLUT(G),sat:G.sat,vig:G.vignette,grain:G.grain,str,seed:hashStr(t.id)}); g.putImageData(id,0,0); }
  await markDraw(g,W,H); return c.toDataURL('image/jpeg',.92); }
async function tileStats(t){ const set=IG.set, ax=t.ax||set.aspect, [W,H]=DIM[ax]||DIM['4:5'], im=await loadImg(t.raw), c=cnv(W/10,H/10), g=c.getContext('2d'); drawCover(g,im,c.width,c.height,t.crop); return statsOf(c); }
/* grade every made frame of the set (one look, one set of targets) */
async function gradeAll(only){ const set=IG.set, look=lookById(set.look)||curLook(), made=set.tiles.filter(t=>t.raw);
  for(const t of made) if(!IG.stats[t.id]||!only||only.includes(t.id)) IG.stats[t.id]=await tileStats(t);
  Object.keys(IG.stats).forEach(id=>{ if(!made.some(t=>t.id===id)) delete IG.stats[id]; });
  const T=harmTargets(IG.stats,look,S().harm);
  for(const t of made){ if(only&&!only.includes(t.id)) continue; try{ t.img=await renderTile(t,look,T[t.id]); await putImg(set,t,'img'); paintTile(t); }catch(e){ console.warn('[insta] grade',e); } }
  IG.harm=null; setSave(); }
async function regradeTile(t){ const set=IG.set, look=lookById(set.look)||curLook(); IG.stats[t.id]=await tileStats(t); const T=harmTargets(IG.stats,look,S().harm); t.img=await renderTile(t,look,T[t.id]); await putImg(set,t,'img'); IG.harm=null; setSave(); }

/* ---- harmony meter ---- */
function rgb2lab(r,g,b){ const f=v=>{ v/=255; return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4); }, R=f(r),G=f(g),B=f(b), h=t=>t>.008856?Math.cbrt(t):7.787*t+16/116;
  const X=h((R*.4124+G*.3576+B*.1805)/.95047), Y=h(R*.2126+G*.7152+B*.0722), Z=h((R*.0193+G*.1192+B*.9505)/1.08883); return [116*Y-16,500*(X-Y),200*(Y-Z)]; }
const CELLC=new Map();
async function cellStats(src){ if(CELLC.has(src)) return CELLC.get(src); const im=await loadImg(src), w=36, hh=45, c=cnv(w,hh), g=c.getContext('2d'); g.drawImage(im,0,0,w,hh); const d=g.getImageData(0,0,w,hh).data;
  let L=0,A=0,B=0,R=0,G=0,Bb=0; const lum=new Float32Array(w*hh);
  for(let i=0,n=0;i<d.length;i+=4,n++){ const lab=rgb2lab(d[i],d[i+1],d[i+2]); L+=lab[0]; A+=lab[1]; B+=lab[2]; lum[n]=lab[0]; R+=d[i]; G+=d[i+1]; Bb+=d[i+2]; }
  const N=w*hh; let busy=0; for(let y=0;y<hh-1;y++) for(let x=0;x<w-1;x++){ const n=y*w+x; busy+=Math.abs(lum[n]-lum[n+1])+Math.abs(lum[n]-lum[n+w]); } busy/=(w-1)*(hh-1);
  const o={L:L/N,a:A/N,b:B/N,busy,hex:rgb2hex(R/N,G/N,Bb/N)}; CELLC.set(src,o); if(CELLC.size>80) CELLC.delete(CELLC.keys().next().value); return o; }
function harmScore(cells){ const ok=cells.filter(Boolean); if(ok.length<2) return null; const av=f=>ok.reduce((a,c)=>a+f(c),0)/ok.length, mA=av(c=>c.a), mB=av(c=>c.b), mL=av(c=>c.L), mBusy=av(c=>c.busy)||1;
  const dev=cells.map(c=>c?Math.hypot(c.a-mA,c.b-mB)+Math.abs(c.L-mL)*.15:0), col=clamp(100-av(c=>Math.hypot(c.a-mA,c.b-mB))*5,0,100);
  const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8]].map(ix=>{ const v=ix.map(i=>cells[i]).filter(Boolean); return v.length?v.reduce((a,c)=>a+c.L,0)/v.length:mL; });
  const sd=a=>{ const m=a.reduce((x,y)=>x+y,0)/a.length; return Math.sqrt(a.reduce((x,y)=>x+(y-m)*(y-m),0)/a.length); };
  const dark=ADJ.filter(([a,b])=>cells[a]&&cells[b]&&cells[a].L<mL-10&&cells[b].L<mL-10), lum=clamp(100-(sd(lines.slice(0,3))+sd(lines.slice(3)))*2.6-dark.length*9,0,100);
  const pairs=ADJ.filter(([a,b])=>cells[a]&&cells[b]), contrast=pairs.filter(([a,b])=>Math.abs(cells[a].L-cells[b].L)>6||Math.abs(cells[a].busy-cells[b].busy)>mBusy*.28).length, rhy=pairs.length?clamp(30+70*contrast/pairs.length,0,100):60;
  return {score:Math.round(col*.45+lum*.3+rhy*.25),col:Math.round(col),lum:Math.round(lum),rhy:Math.round(rhy),mA,mB,mL,dev,dark,lines}; }
async function harmonyCalc(){ const set=IG.set; if(!set) return null; const key=set.tiles.map(t=>t.img?t.img.length+':'+t.img.slice(-24):'-').join('|');
  if(IG.harm&&IG.harmKey===key) return IG.harm; const cells=[]; for(const t of set.tiles){ try{ cells.push(t.img?await cellStats(t.img):null); }catch(_){ cells.push(null); } }
  const h=harmScore(cells); if(!h){ IG.harm={cells,score:null,tips:[]}; IG.harmKey=key; return IG.harm; } h.cells=cells; h.tips=harmTips(h,cells,set); IG.harm=h; IG.harmKey=key; return h; }
const posName=p=>'Кадр '+(p+1)+(p===4?' (центр)':'');
function harmTips(h,cells,set){ const T=[], miss=set.tiles.map((t,p)=>t.img?null:p+1).filter(Boolean);
  if(miss.length&&miss.length<9) T.push({k:'miss',t:'Ещё не готовы: кадр'+(miss.length>1?'ы ':' ')+miss.join(', ')+'.'});
  let wi=-1,wv=0; cells.forEach((c,i)=>{ if(!c) return; const v=Math.hypot(c.a-h.mA,c.b-h.mB); if(v>wv){ wv=v; wi=i; } });
  if(wi>=0&&wv>7){ const c=cells[wi], db=c.b-h.mB, da=c.a-h.mA, dir=Math.abs(db)>=Math.abs(da)?(db>0?'теплее (желтее)':'холоднее (синее)'):(da>0?'розовее':'зеленее');
    T.push({k:'col',p:wi,t:posName(wi)+' '+dir+', чем остальные. Нажмите «Выровнять цвет» или создайте его заново.'}); }
  let li=-1,lv=0; cells.forEach((c,i)=>{ if(!c) return; const v=Math.abs(c.L-h.mL); if(v>lv){ lv=v; li=i; } });
  if(li>=0&&lv>16) T.push({k:'lum',p:li,t:posName(li)+' заметно '+(cells[li].L<h.mL?'темнее':'светлее')+' остальных — подвиньте «Яркость» в окне кадра.'});
  if(h.dark.length) T.push({k:'dark',t:'Тёмные кадры стоят рядом ('+h.dark.map(([a,b])=>(a+1)+' и '+(b+1)).join(', ')+'). Нажмите «Расставить для баланса».'});
  if(Math.abs(h.lines[0]-h.lines[2])>12) T.push({k:'rows',t:(h.lines[0]<h.lines[2]?'Верхний ряд темнее нижнего':'Нижний ряд темнее верхнего')+' — лента кажется тяжёлой с одной стороны.'});
  if(!T.filter(x=>x.k!=='miss').length) T.push({k:'ok',t:h.score>=80?'Лента цельная: цвет, свет и ритм совпадают. Можно публиковать.':'Цвет и свет в порядке. Для живости поменяйте местами спокойные и насыщенные кадры.'});
  return T; }
/* reorder unlocked frames so light/dark and busy/calm alternate (hill-climbing over swaps) */
function arrangeBalance(){ const set=IG.set, h=IG.harm; if(!h||!h.cells) return 0; const cells=h.cells.slice(), idx=[...Array(9).keys()], lockd=set.tiles.map(t=>t.locked);
  const okc=cells.filter(Boolean), mBusy=okc.reduce((a,x)=>a+x.busy,0)/(okc.length||1);
  const cost=ix=>{ const sc=harmScore(ix.map(i=>cells[i])); if(!sc) return 0; let pen=0; ix.forEach((i,p)=>{ const c=cells[i]; if(c&&(BUSY_T(p)?c.busy<mBusy*.9:c.busy>mBusy*1.1)) pen+=1.5; }); return -(sc.lum*.6+sc.rhy*.4)+pen; };
  let cur=cost(idx), moved=0;
  for(let pass=0;pass<6;pass++){ let imp=false; for(let a=0;a<9;a++) for(let b=a+1;b<9;b++){ if(lockd[idx[a]]||lockd[idx[b]]) continue; const n=idx.slice(); [n[a],n[b]]=[n[b],n[a]]; const v=cost(n); if(v<cur-.01){ cur=v; idx.splice(0,9,...n); imp=true; moved++; } } if(!imp) break; }
  if(moved){ set.tiles=idx.map(i=>set.tiles[i]); IG.harm=null; setSave(); } return moved; }

/* ---- free mockups when instamock is absent: product on the look's surface, soft window light ---- */
async function ownMock(t,srcs,look,ax){ const [W,H]=DIM[ax]||DIM['4:5'], c=cnv(W,H), g=c.getContext('2d'), r=rng(hashStr(t.id));
  const pal=look.palette.slice().sort((a,b)=>lumHex(b)-lumHex(a)), dark=look.id==='moody'||lumHex(pal[0])<.5, base=dark?pal[pal.length-1]:pal[0], base2=dark?pal[pal.length-2]||base:pal[1]||base;
  const bg=g.createLinearGradient(0,0,W,H); bg.addColorStop(0,base); bg.addColorStop(1,base2); g.fillStyle=bg; g.fillRect(0,0,W,H);
  const lg=g.createRadialGradient(W*.12,H*.08,10,W*.12,H*.08,W*1.1); lg.addColorStop(0,'rgba(255,250,240,.38)'); lg.addColorStop(1,'rgba(255,250,240,0)'); g.fillStyle=lg; g.fillRect(0,0,W,H);
  g.globalAlpha=.05; for(let i=0;i<2600;i++){ g.fillStyle=r()<.5?'#000':'#fff'; g.fillRect(r()*W,r()*H,1+r()*3,1); } for(let y=0;y<H;y+=3){ g.fillStyle=r()<.5?'#000':'#fff'; g.fillRect(0,y,W,1); } g.globalAlpha=1;
  const ims=[]; for(const s of srcs){ try{ ims.push(await loadImg(s)); }catch(_){ } } if(!ims.length) return c.toDataURL('image/jpeg',.92);
  const put=(im,cx,cy,w,rot,sh)=>{ const h=w*(im.naturalHeight/im.naturalWidth); g.save(); g.translate(cx,cy); g.rotate(rot); g.shadowColor=dark?'rgba(0,0,0,.55)':'rgba(60,42,28,.30)'; g.shadowBlur=sh*1.7; g.shadowOffsetX=sh*.55; g.shadowOffsetY=sh*.75; g.drawImage(im,-w/2,-h/2,w,h); g.restore(); };
  const sprig=(x,y,a,len,col)=>{ g.save(); g.translate(x,y); g.rotate(a); g.strokeStyle=col; g.fillStyle=col; g.lineWidth=3; g.beginPath(); g.moveTo(0,0); g.quadraticCurveTo(len*.4,-len*.08,len,0); g.stroke(); for(let i=1;i<9;i++){ const px=len*i/9; g.beginPath(); g.ellipse(px,(i%2?-1:1)*14,16,6,(i%2?-.6:.6),0,Math.PI*2); g.fill(); } g.restore(); };
  const leaf=pal.find(x=>{ const [rr,gg,bb]=hex2rgb(x); return gg>rr&&gg>bb; })||'#7d8a62', acc=look.palette[2]||'#b89b7a', sh=dark?30:24, k=t.shot;
  const fits=(im,maxW,maxH)=>{ const ar=im.naturalHeight/im.naturalWidth; return Math.min(maxW,maxH/ar); };
  if(k==='macro'){ g.save(); g.filter='none'; drawCover(g,ims[0],W,H,{x:.55,y:.45,z:2.3}); g.restore(); }
  else if(k==='space'){ put(ims[0],W*.3,H*.74,fits(ims[0],W*.36,H*.3),-.05,sh*.7); }
  else if(k==='group'||k==='stack'){ const L=k==='stack'?[ims[0],ims[0],ims[0]]:ims.slice(0,3); const n=L.length, rots=[-.14,.02,.13], xs=n===1?[.5]:n===2?[.38,.62]:[.33,.5,.67];
    L.forEach((im,i)=>put(im,W*xs[i],H*(.47+i*.04),fits(im,W*(n>1?.5:.66),H*.42),rots[i]||0,sh)); }
  else if(k==='life'){ g.save(); g.shadowColor='rgba(0,0,0,.3)'; g.shadowBlur=40; g.shadowOffsetX=16; g.shadowOffsetY=20; g.fillStyle=acc; g.beginPath(); g.arc(W*.8,H*.16,W*.13,0,Math.PI*2); g.fill(); g.restore();
    g.fillStyle=dark?'#2a1c14':'#3b2416'; g.beginPath(); g.arc(W*.8,H*.16,W*.098,0,Math.PI*2); g.fill(); sprig(W*.04,H*.88,-.5,W*.36,leaf); put(ims[0],W*.45,H*.55,fits(ims[0],W*.6,H*.48),-.06,sh); }
  else if(k==='gift'){ g.fillStyle='#c9a47c'; g.save(); g.shadowColor='rgba(0,0,0,.25)'; g.shadowBlur=40; g.shadowOffsetY=18; g.fillRect(W*.12,H*.2,W*.76,H*.6); g.restore(); put(ims[0],W*.5,H*.5,fits(ims[0],W*.56,H*.46),.04,sh*.6);
    g.strokeStyle='#efe3cf'; g.lineWidth=7; g.beginPath(); g.moveTo(W*.5,H*.2); g.lineTo(W*.5,H*.8); g.moveTo(W*.12,H*.5); g.lineTo(W*.88,H*.5); g.stroke(); }
  else { const rot=k==='angle'?-.18:k==='hands'?.08:-.04+r()*.08; put(ims[0],W*.5,H*.5,fits(ims[0],W*.66,H*.56),rot,sh); sprig(W*.86,H*.1,2.2,W*.3,leaf); if(ims[1]&&k!=='macro') put(ims[1],W*.18,H*.84,fits(ims[1],W*.26,H*.2),.2,sh*.6); }
  if(k==='shadow'||look.id==='botanic'){ g.save(); g.globalAlpha=.16; g.fillStyle='#000'; for(let i=0;i<7;i++){ g.beginPath(); g.ellipse(W*(.1+r()*.8),H*(.05+r()*.5),W*.09,W*.03,r()*3,0,Math.PI*2); g.fill(); } g.restore(); }
  return c.toDataURL('image/jpeg',.92); }

/* ===== generation: 9 frames through KS.neuro.compose (AI) or mockups (free) ===== */
const aiOk=()=>!!(KS.neuro&&typeof KS.neuro.compose==='function'&&KS.neuro.hasKey());
const price=()=>{ try{ return +KS.neuro.price()||.04; }catch(_){ return .04; } };
const usd=v=>{ v=+v||0; return '$'+(v>0&&v<.1?v.toFixed(3):v.toFixed(2)).replace('.',','); };
const FATAL=/ключ|billing|оплат|лимит|связи|баланс|не найдена|сначала вставьте|не разрешил/i;
function buildPrompt(t,look,nProd,extra,ax){ const shot=SHOTS[t.shot]||SHOTS.flat, names=t.src.slice(0,nProd).map(id=>(KRU[(srcById(id)||{}).kind]||KRU.other).en), L=[];
  L.push('Create one photograph for the Instagram feed of a small handmade stationery and print studio in Yerevan, Armenia (envelopes with wax seals, postcards, letters, stamps, notebooks, invitations). It is one frame of a 9-post grid shot in a single session, so it must share exactly the same style as the other frames.');
  L.push(nProd>1?`IMAGES 1–${nProd} are photos of the owner's real products: ${names.map((n,i)=>`IMAGE ${i+1} — ${n}`).join(', ')}.`:`IMAGE 1 is a photo of the owner's real product: a ${names[0]||'printed paper product'}.`);
  L.push(`Show ${nProd>1?'these products':'this product'} EXACTLY as in the photo${nProd>1?'s':''}: the same design, artwork, printed text and lettering, colours, proportions, paper and finish, wax seal and stamp. Do not redraw, restyle, translate, add or remove any text or graphics on the product, and do not invent new designs, logos or labels. You may change only the camera angle, perspective, lighting and the surroundings. Keep real-world sizes (a postcard is 10×15 cm, an envelope about 11×16 cm, a wax seal about 3 cm across).`);
  if(extra==='anchor') L.push(`IMAGE ${nProd+1} is another frame from the same photo shoot — the style reference. Match its light direction, white balance, colour grade, contrast, film grain, surfaces and mood exactly, as if both photos were taken minutes apart with the same camera and lens. Do NOT copy its objects or its composition.`);
  if(extra==='ref') L.push(`IMAGE ${nProd+1} is a mood reference from the owner's feed: match its light, colour palette, surfaces and mood. Do NOT copy its objects, text or composition.`);
  L.push('SHOT: '+shot.en);
  L.push(`SCENE STYLE «${look.name}»: surfaces — ${look.surfaces}; props (only a few, never covering the product) — ${look.props}; light — ${look.light}; colour palette — ${look.palette.join(', ')}; mood — ${look.mood}.`);
  if(t.desc) L.push(`Owner's note for this frame (in Russian): «${t.desc}».`);
  L.push(`PHOTOGRAPHIC REALISM: a real photograph taken with a full-frame camera and a ${look.lens||'50mm'} lens in natural light. Realistic soft shadows and contact shadows where objects touch the surface, real paper fibres and edges, slight natural imperfections (tiny creases, specks of dust, an uneven wax edge), true-to-life depth of field, subtle film grain. It must look like an authentic photo by a professional photographer: not CGI, not a 3D render, not plastic, not over-smoothed, not over-saturated, no HDR, no AI look.`);
  L.push('Keep colours natural and true to life with a neutral, slightly warm white balance and soft contrast — no strong filters (one shared colour grade is applied to all 9 frames afterwards).'+(t.shot==='hands'?' Hands must be anatomically correct and relaxed, with natural skin.':''));
  L.push('Do NOT add any text, captions, letters, logos, watermarks, borders, frames, stickers or UI elements that are not printed on the product itself. No faces.');
  L.push(`Format: ${ax==='1:1'?'square 1:1':'vertical 4:5'} Instagram post; the product ${t.shot==='macro'?'detail fills the frame':'is fully in frame'} and in sharp focus. Keep the main subject inside the central 3:4 area — the profile grid trims the sides.`);
  return L.join('\n\n'); }
async function pool(items,n,fn){ let i=0; await Promise.all(Array.from({length:Math.max(1,Math.min(n,items.length))},async()=>{ while(i<items.length&&!(IG.run&&IG.run.stop)){ const it=items[i++]; await fn(it); } })); }
let tickT=0;
function runStart(n){ IG.run={stop:false,n,done:0,fail:0,t0:Date.now(),spent:0,fatal:''}; clearInterval(tickT); tickT=setInterval(()=>{ if(!IG.run){ clearInterval(tickT); return; } qa('.ig-cell[data-igst="run"] .ig-sec').forEach(el=>{ const t=IG.set.tiles.find(x=>x.id===el.closest('[data-igt]').dataset.igt); if(t&&t.t0) el.textContent=Math.round((Date.now()-t.t0)/1000)+' с'; }); },1000); }
async function runTile(t,anchor){ const set=IG.set, look=lookById(set.look)||curLook(); if(IG.run&&IG.run.stop) return false; t.status='run'; t.t0=Date.now(); t.err=''; paintTile(t);
  try{ const prods=[]; for(const id of t.src.slice(0,3)){ const d=await srcData(id); if(d) prods.push(d); } if(!prods.length) throw new Error('Для кадра не выбрано фото изделия — выберите его в плане');
    const fal=KS.neuro.provider&&KS.neuro.provider()==='fal'; if(fal) prods.splice(1);
    const imgs=prods.slice(); let extra=''; if(!fal&&anchor){ imgs.push(anchor); extra='anchor'; } else if(!fal&&look.custom&&look.refs&&look.refs[0]){ const rf=await DB.get(look.refs[0]); if(rf&&rf.src){ imgs.push(rf.src); extra='ref'; } }
    const ax=t.ax||set.aspect, out=await KS.neuro.compose(imgs,buildPrompt(t,look,prods.length,extra,ax),{aspect:ax});
    t.raw=await shrink(out,1600,'image/jpeg',.9); t.own=false; t.crop={x:.5,y:.5,z:1}; t.status='ok'; await putImg(set,t,'raw');
    t.img=await renderTile(t,look,null,{quick:true}); if(IG.run){ IG.run.done++; IG.run.spent+=price(); } paintTile(t); progress(); setSave(); return true; }
  catch(e){ console.warn('[insta] tile',e); t.status='err'; t.err=String((e&&e.message)||e||'Ошибка'); if(IG.run){ IG.run.fail++; if(FATAL.test(t.err)){ IG.run.stop=true; IG.run.fatal=t.err; } } paintTile(t); progress(); return false; } }
async function generate(ids,o){ o=o||{}; const set=IG.set; if(!set) return; if(IG.run||IG.fin){ KS.toast('Уже создаю посты…'); return; }
  const s=S(); set.look=s.look; set.aspect=s.aspect; set.mode=s.mode;
  const tiles=(ids||set.tiles.map(t=>t.id)).map(id=>set.tiles.find(t=>t.id===id)).filter(t=>t&&!(t.locked&&t.img));
  if(!tiles.length){ KS.toast('Все кадры закреплены — снимите замок, чтобы создать заново'); return; }
  if(!srcOn().length){ KS.toast('Сначала добавьте фото изделий в «Исходники»'); flashSrc(); return; }
  const on=srcOn(); tiles.forEach(t=>{ t.src=t.src.filter(id=>srcById(id)); if(!t.src.length){ const used=new Set(set.tiles.map(x=>x.src[0])); t.src=[(on.find(s=>!used.has(s.id))||on[0]).id]; tileDesc(t); } });
  if(s.mode==='free') return genFree(tiles.map(t=>set.tiles.find(x=>x.id===t.id)||t));
  if(!aiOk()){ KS.toast('Нужен ключ ИИ (Gemini) — нажмите «Подключить»'); if(KS.neuro&&KS.neuro.settings) KS.neuro.settings(); return; }
  if(o.confirm!==false&&!(await askPlan(tiles))) return;
  const list=tiles.map(t=>set.tiles.find(x=>x.id===t.id)).filter(Boolean); runStart(list.length); list.forEach(t=>{ t.status='wait'; t.err=''; }); IG.view='profile'; paintAll();
  const others=set.tiles.filter(t=>t.raw&&!list.includes(t)); const hero=others.filter(t=>!t.own).sort((a,b)=>Math.abs(set.tiles.indexOf(a)-4)-Math.abs(set.tiles.indexOf(b)-4))[0]||others[0]; let anchor=hero?hero.raw:null;
  const pri=t=>{ const p=set.tiles.indexOf(t); return (p===4?0:1)+(['flat','life','group','angle'].includes(t.shot)?0:1); }, queue=list.slice().sort((a,b)=>pri(a)-pri(b));
  if(!anchor){ let tries=0; while(queue.length&&!anchor&&!IG.run.stop&&tries<2){ const t=queue.shift(); tries++; if(await runTile(t,null)) anchor=t.raw; } }
  await pool(queue,clamp(+s.conc||3,1,4),t=>runTile(t,anchor));
  const run=IG.run; list.forEach(t=>{ if(t.status==='wait') t.status=t.raw?'ok':'plan'; }); IG.fin=true; IG.run=null; clearInterval(tickT);
  try{ if(set.tiles.some(t=>t.raw)){ setBusy('Выравниваю цвет всех кадров…'); await gradeAll(); setBusy(''); }
    await thumbMake(); await setSave(true); }finally{ IG.fin=false; } paintAll(); if(POST.open) postRender();
  const bad=list.filter(t=>t.status==='err').length, left=list.filter(t=>t.status==='plan').length;
  KS.toast(run.fatal?run.fatal:bad?`Готово ${run.done} из ${list.length}. Кадров с ошибкой: ${bad} — нажмите «Повторить» на кадре`:left?`Остановлено. Готово ${run.done}, не сделано ${left}`:`Готово: ${run.done} ${plural(run.done,'пост','поста','постов')} в одном стиле`); }
async function genFree(tiles){ const set=IG.set, look=lookById(set.look)||curLook(), M=KS.instaMock&&typeof KS.instaMock.render==='function'?KS.instaMock:null; let scenes=[];
  try{ scenes=M&&typeof M.scenes==='function'?(await M.scenes())||[]:[]; }catch(_){ }
  runStart(tiles.length); tiles.forEach(t=>{ t.status='wait'; t.err=''; }); IG.view='profile'; paintAll();
  for(const t of tiles){ if(IG.run.stop) break; t.status='run'; t.t0=Date.now(); paintTile(t);
    try{ const srcs=[]; for(const id of t.src.slice(0,3)){ const d=await srcData(id); if(d) srcs.push(d); } if(!srcs.length) throw new Error('Для кадра не выбрано фото изделия');
      const ax=t.ax||set.aspect; let out=null;
      if(M){ const sc=pickScene(scenes,t,look,ax); if(sc){ try{ out=await M.render(t.src.slice(0,3).map((id,i)=>srcObj(id,srcs[i])).filter(x=>x.src),sc.id,{aspect:ax,look:bLookId(look),grade:false,seed:hashStr(t.id)%100000+1,shot:t.shot}); }catch(e){ console.warn('[insta] instaMock.render',e); } } }
      if(!out) out=await ownMock(t,srcs,look,ax);
      t.raw=await shrink(out,1600,'image/jpeg',.9); t.own=false; t.free=true; t.crop={x:.5,y:.5,z:1}; t.status='ok'; await putImg(set,t,'raw'); t.img=await renderTile(t,look,null,{quick:true}); IG.run.done++; }
    catch(e){ t.status='err'; t.err=String((e&&e.message)||e); IG.run.fail++; }
    paintTile(t); progress(); await sleep(10); }
  tiles.forEach(t=>{ if(t.status==='wait') t.status=t.raw?'ok':'plan'; }); const n=IG.run.done; IG.fin=true; IG.run=null; clearInterval(tickT);
  try{ setBusy('Выравниваю цвет всех кадров…'); await gradeAll(); setBusy(''); await thumbMake(); await setSave(true); }finally{ IG.fin=false; } paintAll(); if(POST.open) postRender(); KS.toast('Мокапы готовы: '+n+' без ИИ, бесплатно'); }
function srcObj(id,data){ const s=srcById(id)||{}; return {id,kind:s.kind||'other',name:s.name||'',src:data||'',w:0,h:0}; }
/* shot type → instamock scenes (product-specific scenes are filtered by what the photo shows) */
const SCN={flat:['env-seal','pc-flat','letter-flat','nb-flat','bc-grid','inv-ribbon','env-front','sticker-sheet'],angle:['env-angle','pc-angle','letter-angle','nb-angle','bc-angle'],macro:['seal-macro','detail-corner','detail-edge','stamp-imprint'],
  hands:['env-open','letter-flat','pc-lean','inv-ribbon'],life:['pc-lean','letter-flat','env-seal','nb-flat'],gift:['kit-box','inv-ribbon','inv-suite'],process:['stamp-imprint','seal-macro','postage','sticker-sheet'],group:['kit-all','kit-box','pc-fan','inv-suite'],
  space:['env-front','pc-duo','env-duo','nb-flat','bc-grid'],stack:['env-stack','nb-stack','bc-stack','pc-fan'],shadow:['pc-lean','env-seal','letter-flat','nb-angle'],mail:['postage','env-front','env-duo','env-stack']};
function pickScene(scenes,t,look,ax){ if(!Array.isArray(scenes)||!scenes.length) return null; const kind=(srcById(t.src[0])||{}).kind||'other', r=rng(hashStr(t.id));
  const pref=(SCN[t.shot]||[]).map(id=>scenes.find(s=>s&&s.id===id)).filter(Boolean), fit=pref.filter(s=>!Array.isArray(s.needs)||!s.needs.length||s.needs.includes(kind));
  if(fit.length) return fit[Math.floor(r()*Math.min(2,fit.length))];
  const syn={flat:/flat|top|сверху|флэт/i,angle:/angle|45|угол|tilt/i,macro:/macro|detail|close|макро|детал/i,hands:/hand|рук/i,life:/life|coffee|window|кофе|окн|лайф/i,gift:/gift|box|подар|упак/i,process:/process|work|процесс|мастер/i,group:/group|collection|set|коллекц|набор/i,space:/space|minimal|воздух|минимал/i,stack:/stack|fan|стоп|веер/i,shadow:/shadow|light|тен|свет/i,mail:/mail|post|почт/i};
  let best=null,bs=-1e9; for(const sc of scenes){ if(!sc||!sc.id) continue; let v=r()*.3; const hay=[sc.id,sc.cat,sc.name].join(' ');
    if(sc.cat===t.shot||sc.id===t.shot) v+=3; else if(syn[t.shot]&&syn[t.shot].test(hay)) v+=2;
    if(Array.isArray(sc.needs)&&sc.needs.length) v+=sc.needs.includes(kind)?1.2:-1.5; if(sc.look&&sc.look===look.id) v+=.8; if(Array.isArray(sc.aspect)&&sc.aspect.length&&!sc.aspect.includes(ax)) v-=.5;
    if(v>bs){ bs=v; best=sc; } } return best; }
const plural=(n,a,b,c)=>{ const m=n%10, h=n%100; return m===1&&h!==11?a:m>=2&&m<=4&&(h<12||h>14)?b:c; };

/* ===== captions, hashtags, alt text, carousel ideas, 9-day plan ===== */
const LANGS=[['ru','RU','Русский'],['hy','HY','Հայերեն'],['en','EN','English']], VOICES=[['warm','Тёплый'],['short','Лаконичный'],['fun','Игривый']];
const CTA0={ru:'Заказать — в директ или по ссылке в профиле',en:'To order: DM us or tap the link in bio',hy:'Պատվիրելու համար գրեք մեզ direct-ում'};
const TAG_LOCAL={ru:['#ереван','#армения','#yerevan','#armenia','#madeinarmenia'],en:['#yerevan','#armenia','#madeinarmenia','#yerevanshop'],hy:['#երևան','#հայաստան','#yerevan','#madeinarmenia']};
const TAG_KIND={envelope:['#конверты','#сургуч','#waxseal','#сургучнаяпечать','#envelopes','#snailmail'],postcard:['#открытки','#postcards','#открыткиручнойработы','#postcrossing'],letter:['#письма','#letterwriting','#snailmail','#каллиграфия'],seal:['#сургуч','#waxseal','#waxsealstamp','#сургучнаяпечать'],stamp:['#штампы','#rubberstamp','#марки','#stamps'],notebook:['#блокноты','#notebook','#скетчбук','#planner'],card:['#визитки','#businesscards','#полиграфия'],invitation:['#приглашения','#weddinginvitations','#свадебныеприглашения','#invitations'],sticker:['#наклейки','#stickers','#стикеры'],photo:['#печатьфото','#photoprint'],other:['#полиграфия','#типография']};
const TAG_GEN=['#stationerylove','#handmade','#ручнаяработа','#типография','#paperlove','#flatlay','#stationery','#papercraft'];
const KHY={envelope:'ծրար',postcard:'բացիկ',letter:'նամակ',seal:'մոմե կնիք',stamp:'դրոշմակնիք',notebook:'նոթատետր',card:'այցեքարտ',invitation:'հրավիրատոմս',sticker:'սթիքեր',photo:'լուսանկար',other:'արտադրանք'};
const tileKinds=t=>t.src.map(id=>(srcById(id)||{}).kind||'other');
function tagsFor(t,lang,seed){ const c=S().cap, k=tileKinds(t)[0]||'other', r=rng(seed), lat=s=>/^#[a-z0-9_]+$/i.test(s), arm=s=>/[Ա-և]/.test(s);
  let niche=(TAG_KIND[k]||TAG_KIND.other).concat(t.shot==='group'?tileKinds(t).slice(1).flatMap(x=>(TAG_KIND[x]||[]).slice(0,2)):[]), gen=TAG_GEN.slice();
  if(lang==='en'){ niche=niche.filter(lat); gen=gen.filter(lat); } if(lang==='hy'){ niche=niche.filter(x=>lat(x)||arm(x)); gen=gen.filter(x=>lat(x)||arm(x)); }
  const pick=(a,n)=>a.slice().sort(()=>r()-.5).slice(0,n), L=[].concat(c.local?pick(TAG_LOCAL[lang]||TAG_LOCAL.ru,4):[],c.niche?pick(niche,5).concat(pick(gen,3)):[],String(c.extra||'').split(/[\s,]+/).filter(x=>x).map(x=>x[0]==='#'?x:'#'+x));
  return [...new Set(L)].slice(0,16); }
const HOOK={ru:{flat:'Всё самое важное — на одном столе',angle:'Посмотрите под другим углом',macro:'Всё решают детали',hands:'Письмо, которое хочется держать в руках',life:'Медленное утро, кофе и письмо',gift:'Подарок начинается с упаковки',process:'Как это делается',group:'Собрали коллекцию',space:'Иногда достаточно одной детали',stack:'Тираж готов',shadow:'Свет, тени и бумага',mail:'Готово к отправке'},
 en:{flat:'Everything that matters, on one table',angle:'Take a closer look',macro:'It is all in the details',hands:'A letter you want to hold',life:'Slow morning, coffee and a letter',gift:'A gift starts with the wrapping',process:'How it is made',group:'Meet the collection',space:'Sometimes one detail is enough',stack:'Fresh from the press',shadow:'Light, shadows and paper',mail:'Ready to be sent'},
 hy:{flat:'Ամեն ինչ մեկ սեղանի վրա',angle:'Նայեք այլ անկյունից',macro:'Մանրուքներն են կարևոր',hands:'Նամակ, որը ուզում ես ձեռքում պահել',life:'Դանդաղ առավոտ, սուրճ և նամակ',gift:'Նվերը սկսվում է փաթեթավորումից',process:'Ինչպես ենք աշխատում',group:'Մեր հավաքածուն',space:'Երբեմն մեկ մանրուքը բավական է',stack:'Պատրաստ է',shadow:'Լույս, ստվեր և թուղթ',mail:'Պատրաստ է ուղարկելու'}};
const EMO={flat:'✉️',angle:'✨',macro:'🔍',hands:'🤍',life:'☕',gift:'🎁',process:'🕯️',group:'🗂️',space:'🤍',stack:'📦',shadow:'🌿',mail:'📮'};
const cap1=s=>s?s[0].toUpperCase()+s.slice(1):s;
function capLocal(t,lang,voice,emoji){ const k=tileKinds(t)[0]||'other', K=KRU[k]||KRU.other, e=emoji?' '+(EMO[t.shot]||'✨'):'', cta=S().cap.cta||CTA0[lang]||CTA0.ru, hook=((HOOK[lang]||HOOK.ru)[t.shot]||'')+e;
  let body;
  if(lang==='en'){ const n=(KRU[k]||KRU.other).en; body={flat:`A handmade ${n}: heavy paper, clean edges and details you want to look at. Every piece is made by hand in our small studio in Yerevan.`,angle:`The ${n} looks even better in real life: paper texture, deep colour, a crisp print. Small batches, made for your occasion.`,macro:'Paper fibres, wax relief, a crisp impression — the little things that turn an ordinary letter into an event.',hands:`A ${n} is a warm way to say something important. We add wax seals, ribbons or your own monogram stamp.`,life:`A little paper magic for an ordinary day — a ${n} for those who love beautiful small things.`,gift:`Wrapped with ribbon and tissue paper, with a card inside. We put together sets for birthdays, weddings and thank-yous.`,process:'No conveyor belt — just hands, time and attention to every detail.',group:'Envelopes, postcards, seals and everything you need for a beautiful letter. Choose a ready set or build your own.',space:'Minimalism, plenty of air and nothing extra. Save it for later.',stack:'We print from one piece to a hundred and check every one by hand.',shadow:`We love how the morning sun falls on paper. In the frame: our ${n}.`,mail:'With a stamp and twine — we deliver across Yerevan and all of Armenia.'}[t.shot]; }
  else if(lang==='hy'){ body=`Ձեռագործ ${KHY[k]||KHY.other}՝ մեր փոքրիկ արհեստանոցից Երևանում։ Յուրաքանչյուր մանրուք արված է սիրով և ուշադրությամբ։`; }
  else body={flat:`${cap1(K.n)} ручной работы: плотная бумага, аккуратные края и детали, которые хочется рассматривать. Каждый экземпляр делаем вручную в нашей мастерской в Ереване.`,angle:`Вживую ${K.n} ещё красивее: фактура бумаги, глубина цвета, чистый отпечаток. Делаем небольшими тиражами и под ваш повод.`,macro:`${cap1(K.d)} — именно такие мелочи превращают обычное письмо в событие.`,hands:`Тёплый способ сказать важное. Добавим сургуч, ленту или печать с вашими инициалами.`,life:`Немного бумажной магии в обычный день — для тех, кто любит красивые мелочи.`,gift:`Упакуем с лентой и бумагой тишью, вложим открытку. Соберём набор под ваш повод: день рождения, свадьба, благодарность.`,process:`${cap1(K.pr)}. Никакого конвейера — только руки, время и внимание к каждой детали.`,group:`Конверты, открытки, печати и всё, что нужно для красивого письма. Можно выбрать готовый набор или собрать свой.`,space:`Минимализм, много воздуха и ничего лишнего. Сохраните, чтобы не потерять.`,stack:`${cap1(K.p)} — печатаем от одного экземпляра до сотни и каждый проверяем вручную.`,shadow:`Любим, как утреннее солнце ложится на бумагу. В кадре — ${K.n}.`,mail:`С маркой и бечёвкой — доставим по Еревану и по всей Армении.`}[t.shot]||`${cap1(K.n)} ручной работы из Еревана.`;
  if(voice==='short'){ const m=String(body).match(/^[\s\S]*?[.!?։](\s|$)/); if(m) body=m[0].trim(); } if(voice==='fun'&&lang==='ru') body+=' Ну красиво же?';
  if(voice==='fun'&&lang==='en') body+=' Pretty, right?';
  const alt=lang==='en'?`Photo: ${(SHOTS[t.shot]||SHOTS.flat).slug.replace(/\d+/,'')} shot of a handmade ${(KRU[k]||KRU.other).en}.`:lang==='hy'?`Լուսանկար՝ ձեռագործ ${KHY[k]||KHY.other}։`:`Фото: ${(SHOTS[t.shot]||SHOTS.flat).ru.toLowerCase()} — ${t.desc}.`;
  return {text:`${hook}\n\n${body}\n\n${cta}`,tags:tagsFor(t,lang,hashStr(t.id+lang)),alt}; }
const CAROUSEL0=[{title:'Как рождается конверт с сургучом',slides:['Чистый лист плотной бумаги','Печать и резка','Складываем и клеим','Сургуч плавится над свечой','Оттиск печати','Готовый конверт в руках']},
  {title:'5 поводов отправить настоящее письмо',slides:['Обложка: «Когда вы последний раз получали письмо?»','День рождения','Свадьба и приглашения','Спасибо учителю или коллеге','Просто так','Как заказать']},
  {title:'Ваш макет → готовая открытка',slides:['Идея или фото клиента','Макет на экране','Пробный оттиск','Тираж','Упаковка','Отзыв клиента']}];
function capPrompt(order,lang,voice,emoji){ const b=S().brand, c=S().cap, LN={ru:'Russian',en:'English',hy:'Armenian (Eastern Armenian, Armenian script)'}[lang]||'Russian', V={warm:'warm, personal, caring, like a friend who loves paper',short:'concise, calm, premium, short sentences',fun:'playful, light, a little witty'}[voice]||'warm';
  return `You are the copywriter of a small handmade print studio in Yerevan, Armenia — «${b.name}», Instagram @${b.handle}. Products: envelopes with wax seals, postcards, letters, rubber and postage stamps, notebooks, invitations, business cards, stickers.
Write Instagram captions for a series of 9 posts in ${LN}. Brand voice: ${V}. ${emoji?'Use 1–3 fitting emojis per caption.':'Do not use emojis.'}
Each caption: a hook in the first line, then 1–3 short paragraphs (max 550 characters in total) with concrete sensory details (paper, wax, ink, light), then the call to action: «${c.cta||CTA0[lang]||CTA0.ru}». No hashtags inside the caption text. Captions must differ from each other and sound like a real person, not an ad.
Hashtags: 10–14 per post${c.local?', including local ones for Yerevan and Armenia (for example #yerevan #armenia #ереван #երևան)':''}${c.niche?', plus niche ones about the product (wax seal, envelopes, postcards, stationery)':''}${c.extra?', and always these: '+c.extra:''}.
Alt text: one plain sentence describing the photo for people who cannot see it, in ${LN}.
Also suggest 3 carousel post ideas for this brand (title and 4–6 slides each), in ${LN}.
The posts in publishing order:
${order.map((t,i)=>`${i+1}. shot: ${(SHOTS[t.shot]||SHOTS.flat).slug}; product: ${tileKinds(t).map(k=>(KRU[k]||KRU.other).en).join(' + ')}; scene: ${t.desc}`).join('\n')}
Answer ONLY with JSON: {"posts":[{"caption":"…","hashtags":["#…"],"alt":"…"}],"carousels":[{"title":"…","slides":["…"]}]} with exactly 9 posts in the same order.`; }
function parseJSON(t){ t=String(t||'').trim().replace(/^```(?:json)?\s*/i,'').replace(/```\s*$/,'').trim(); try{ return JSON.parse(t); }catch(_){ const a=t.indexOf('{'), b=t.lastIndexOf('}'); if(a>=0&&b>a){ try{ return JSON.parse(t.slice(a,b+1)); }catch(_){ } } } return null; }
const postOrder=()=>[...Array(9).keys()].map(d=>IG.set.tiles[posOfDay(d+1)]);
async function capsMake(ai){ const set=IG.set, c=S().cap, order=postOrder(), stamp=Date.now(); let n=0;
  if(ai){ if(!(KS.neuro&&KS.neuro.text&&KS.neuro.hasGemini&&KS.neuro.hasGemini())){ KS.toast('Подписи пишет Gemini: добавьте ключ Gemini. Пока сделал по шаблонам.'); ai=false; } }
  if(ai){ try{ const j=parseJSON(await KS.neuro.text(capPrompt(order,c.lang,c.voice,c.emoji),{json:true})); const P=j&&Array.isArray(j.posts)?j.posts:null; if(!P||!P.length) throw new Error('Gemini ответил не по формату');
      order.forEach((t,i)=>{ const p=P[i]; if(!p) return; const tags=(Array.isArray(p.hashtags)?p.hashtags:String(p.hashtags||'').split(/\s+/)).map(x=>String(x).trim()).filter(Boolean).map(x=>x[0]==='#'?x:'#'+x);
        t.cap={text:String(p.caption||'').trim(),tags:[...new Set(tags)].slice(0,20),alt:String(p.alt||'').trim(),lang:c.lang,ai:true,at:stamp}; n++; });
      if(Array.isArray(j.carousels)) set.carousel=j.carousels.filter(x=>x&&x.title).slice(0,4).map(x=>({title:String(x.title),slides:(Array.isArray(x.slides)?x.slides:[]).map(String).slice(0,8)})); }
    catch(e){ KS.toast((e&&e.message)||'Gemini не ответил'); console.warn('[insta] caps',e); ai=false; } }
  order.forEach(t=>{ if(!ai||!t.cap||t.cap.at!==stamp){ t.cap=Object.assign(capLocal(t,c.lang,c.voice,c.emoji),{lang:c.lang,ai:false,at:stamp}); n++; } });
  if(!set.carousel||!set.carousel.length) set.carousel=CAROUSEL0.map(x=>JSON.parse(JSON.stringify(x)));
  set.capsAt=Date.now(); set.capLang=c.lang; setSave(); return n; }
const isoD=d=>d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate());
function startISO(){ const s=S().cap.start; if(/^\d{4}-\d{2}-\d{2}$/.test(s||'')) return s; const d=new Date(); d.setDate(d.getDate()+1); return isoD(d); }
function dayDate(day){ const [y,m,dd]=startISO().split('-').map(Number); return new Date(y,m-1,dd+day-1); }
const dayLabel=day=>dayDate(day).toLocaleDateString('ru-RU',{weekday:'short',day:'numeric',month:'long'});
const capFull=t=>t&&t.cap?(t.cap.text+(t.cap.tags&&t.cap.tags.length?'\n\n'+t.cap.tags.join(' '):'')):'';
function captionsTxt(){ const set=IG.set, b=S().brand, time=S().cap.time||'19:00', L=[`${b.name} · @${b.handle} — «${set.name}»`,`Стиль: ${(lookById(set.look)||curLook()).name}. Публикуйте по одному посту в день в этом порядке — тогда сетка в профиле сложится как в превью.`,''];
  for(let d=1;d<=9;d++){ const p=posOfDay(d), t=set.tiles[p]; L.push('='.repeat(44),`День ${d} — ${dayLabel(d)}, ${time} — файл ${fileName(t,d)} (в сетке: ряд ${Math.floor(p/3)+1}, место ${p%3+1})`,'');
    L.push(t&&t.cap?t.cap.text:'(подпись ещё не написана)'); if(t&&t.cap&&t.cap.tags&&t.cap.tags.length) L.push('',t.cap.tags.join(' ')); if(t&&t.cap&&t.cap.alt) L.push('','Альтернативный текст: '+t.cap.alt); L.push(''); }
  if(set.carousel&&set.carousel.length){ L.push('='.repeat(44),'Идеи для каруселей',''); set.carousel.forEach((c,i)=>{ L.push(`${i+1}. ${c.title}`); c.slides.forEach((s,j)=>L.push(`   ${j+1}) ${s}`)); L.push(''); }); }
  return L.join('\n'); }
const fileName=(t,d)=>`${pad2(d)}_${isoD(dayDate(d))}_${(SHOTS[t&&t.shot]||SHOTS.flat).slug}.jpg`;

/* ===== export, preview composite, history thumbnails ===== */
async function gridImage(cell,q){ const set=IG.set, w=cell, h=Math.round(cell*4/3), gap=Math.max(2,Math.round(cell/90)), c=cnv(w*3+gap*2,h*3+gap*2), g=c.getContext('2d'); g.fillStyle='#fff'; g.fillRect(0,0,c.width,c.height);
  for(let p=0;p<9;p++){ const t=set.tiles[p], x=(p%3)*(w+gap), y=Math.floor(p/3)*(h+gap); if(t&&t.img){ try{ const im=await loadImg(t.img); g.save(); g.beginPath(); g.rect(x,y,w,h); g.clip(); g.translate(x,y); drawCover(g,im,w,h,null); g.restore(); }catch(_){ } }
    else { const look=lookById(set.look)||curLook(); g.fillStyle=look.palette[p%look.palette.length]; g.fillRect(x,y,w,h); } }
  return c.toDataURL('image/jpeg',q||.86); }
async function thumbMake(){ const set=IG.set; if(!set||!set.tiles.some(t=>t.img)) return; try{ await DB.set('ig:thumb:'+set.id,await gridImage(96,.8)); }catch(e){ console.warn('[insta] thumb',e); } }
async function exportZip(){ const set=IG.set; if(!set) return; const made=set.tiles.filter(t=>t.img); if(!made.length){ KS.toast('Сначала создайте посты'); return false; }
  setBusy('Собираю архив…'); let Z=null; try{ Z=await loadLib('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',()=>window.JSZip); }catch(_){ }
  try{ if(!set.tiles.some(t=>t.cap)) await capsMake(false);
    if(!Z){ KS.toast('Архиватор не загрузился — сохраняю файлы по одному'); for(let d=1;d<=9;d++){ const t=set.tiles[posOfDay(d)]; if(t&&t.img){ await KS.download(fileName(t,d),dataBlob(t.img)); await sleep(400); } } await KS.download('captions.txt',new Blob([captionsTxt()],{type:'text/plain;charset=utf-8'})); return true; }
    const z=new Z(); for(let d=1;d<=9;d++){ const t=set.tiles[posOfDay(d)]; if(t&&t.img) z.file(fileName(t,d),dataBlob(t.img)); }
    z.file('captions.txt','﻿'+captionsTxt()); z.file('00_setka-prevyu.jpg',dataBlob(await gridImage(360,.88)));
    const blob=await z.generateAsync({type:'blob'}), name='instagram-'+isoD(new Date())+'-'+made.length+'-postov.zip'; const ok=await KS.download(name,blob); if(ok!==false) KS.toast('Архив: '+made.length+' '+plural(made.length,'пост','поста','постов')+' по порядку публикации + captions.txt'); return true; }
  catch(e){ console.error('[insta] zip',e); KS.toast('Не удалось собрать архив'); return false; } finally{ setBusy(''); } }
async function dlOne(t){ if(!t||!t.img) return; const p=IG.set.tiles.indexOf(t), d=dayOfPos(p); await KS.download(fileName(t,d),dataBlob(t.img)); }

/* ===== UI: «Лента» (panel + screen: Instagram profile preview, plan, harmony) ===== */
const MY=['igfeed','igstyle','igcap'];
const activeId=()=>{ const a=KS.active&&KS.active(); return a&&MY.includes(a.id)?a.id:null; };
const panelBox=()=>q('[data-panel="ks-insta"] .kssub');
const scrOf=id=>{ const s=KS.screen&&KS.screen(id); return s&&!s.hidden?s:null; };
function igKeep(box,fn){ const a=document.activeElement, key=a&&box&&box.contains(a)&&a.dataset?a.dataset.igin:'', pos=key&&a.selectionStart!=null?[a.selectionStart,a.selectionEnd]:null; fn(); if(!key) return; const n=box.querySelector(`[data-igin="${key}"]`); if(n&&n!==a){ try{ n.focus({preventScroll:true}); if(pos) n.setSelectionRange(pos[0],pos[1]); }catch(_){ } } }
function paintAll(){ const id=activeId(); if(!id||!IG.ready) return; const box=panelBox(), scr=scrOf(id); try{ if(box) igKeep(box,()=>PANEL[id](box)); if(scr) igKeep(scr,()=>SCREEN[id](scr)); }catch(e){ console.error('[insta] paint',e); } }
function paintPanel(){ const id=activeId(), box=panelBox(); if(id&&box&&IG.ready) igKeep(box,()=>PANEL[id](box)); }
let busyMsg='';
function setBusy(m){ busyMsg=m||''; const el=q('.ig-busy'); if(el){ el.hidden=!busyMsg; const s=el.querySelector('span'); if(s) s.textContent=busyMsg; } }
function flashSrc(){ const c=q('.ig-srccard'); if(!c) return; c.scrollIntoView({block:'nearest',behavior:'smooth'}); c.classList.remove('ig-flash'); void c.offsetWidth; c.classList.add('ig-flash'); }
const swatches=(pal,cls)=>`<span class="ig-sw ${cls||''}">${(pal||[]).slice(0,5).map(c=>`<i style="background:${E(c)}"></i>`).join('')}</span>`;
const lookBg=(look,p)=>{ const P=look.palette, a=P[p%P.length], b=P[(p+2)%P.length]; return `linear-gradient(${135+p*20}deg,${a},${b})`; };
const phInk=(look,p)=>{ const P=look.palette, l=(lumHex(P[p%P.length])+lumHex(P[(p+2)%P.length]))/2; return l>.62?' light':''; };

/* ---- key card ---- */
function keyCard(){ const N=KS.neuro; if(!N) return `<div class="card ig-key"><div class="hd"><span class="ig-ht">${I(IC.key)}Ключ API</span><span class="ks-badge bad">нет модуля ИИ</span></div><p class="hint">Модуль «Нейро-стиль» не подключён — доступен только режим «Без ИИ».</p></div>`;
  const has=N.hasKey(), prov=N.provider?N.provider():'gemini', gem=N.hasGemini?N.hasGemini():has&&prov==='gemini', model=N.modelName?N.modelName():'';
  return `<div class="card ig-key"><div class="hd"><span class="ig-ht">${I(IC.key)}Ключ API</span><span class="ks-badge ${has?'ok':'warn'}">${has?(prov==='fal'?'fal.ai подключён':'Gemini подключён'):'нет ключа'}</span></div>
    ${has?`<div class="ig-kline"><b>${prov==='fal'?'fal.ai':'Google Gemini'}</b>${model?' · '+E(model):''}</div><p class="hint ig-spend">${E(N.spendLine?N.spendLine():'')}</p>`:`<p class="hint">Ключ хранится только на этом устройстве. Без ключа работает режим «Без ИИ» — мокапы бесплатно.</p>`}
    <p class="ig-note${has&&prov==='fal'?' warn':''}">${I(IC.spark)}<span>${has&&prov==='fal'?'Для лучшего результата нужен Gemini: fal.ai видит только одно фото и не разбирает стиль. Переключите провайдера в настройках.':'Для лучшего результата нужен <b>Gemini</b>: он сохраняет ваше изделие точь-в-точь, держит один стиль на всех 9 кадрах и разбирает стиль по фото.'}${gem||prov==='fal'?'':''}</span></p>
    <button class="btn sm${has?'':' primary'} ig-b" data-igx="key">${I(IC.key)}${has?'Настройки ключа':'Подключить ключ'}</button></div>`; }
/* ---- sources card ---- */
function srcCard(){ const L=IG.srcs, on=srcOn().length;
  return `<div class="card ig-srccard"><div class="hd"><span class="ig-ht">${I(IC.img)}Исходники</span><span class="hint">${L.length?on+' из '+L.length+' в работе':'фото ваших изделий'}</span></div>
    <div class="ks-drop ig-drop" data-igx="pick" role="button" tabindex="0">${I(IC.up)}<b>Добавьте фото изделий</b><span>перетащите сюда или нажмите — можно сразу несколько: конверты, открытки, печати, блокноты…</span></div>
    ${L.length?`<div class="ig-srcs">${L.map(s=>`<div class="ig-src${s.off?' off':''}${s.alpha?' cut':''}" data-igsrc="${s.id}"><img src="${E(urlOf(s.thumb))}" alt=""><select data-igin="kind:${s.id}" aria-label="Что это">${KINDS.map(([k,n])=>`<option value="${k}"${k===s.kind?' selected':''}>${n}</option>`).join('')}</select>
      <button class="ig-ic ig-eye" data-igx="srcoff:${s.id}" title="${s.off?'Вернуть в работу':'Не использовать'}">${I(s.off?IC.eyeoff:IC.eye)}</button><button class="ig-ic ig-del" data-igx="srcdel:${s.id}" title="Удалить">${I(IC.trash)}</button></div>`).join('')}</div>`:''}
    <div class="flexw"><button class="btn sm ig-b" data-igx="lib">${I(IC.img)}Из «Мои фото»</button><button class="btn sm ig-b" data-igx="app">${I(IC.grid)}Из программы</button>${L.length&&KS.neuro&&KS.neuro.hasGemini&&KS.neuro.hasGemini()?`<button class="btn sm ig-b" data-igx="kindai" title="Gemini посмотрит на фото и подпишет, что на них">${I(IC.spark)}Узнать изделия</button>`:''}</div></div>`; }
function goCard(){ const s=S(), set=IG.set, look=curLook(), todo=set.tiles.filter(t=>!(t.locked&&t.img)).length, err=set.tiles.filter(t=>t.status==='err').length, left=set.tiles.filter(t=>!t.img&&!t.locked).length, made=set.tiles.filter(t=>t.img).length, ai=s.mode==='ai';
  const label=IG.run?'Создаю…':made&&left?(err===left?`Повторить ошибки (${left})`:`Создать оставшиеся (${left})`):made?'Создать 9 постов заново':'Создать 9 постов', n=made&&left?left:todo;
  return `<div class="card ig-go"><div class="hd"><span class="ig-ht">${I(IC.spark)}Создать ленту</span></div>
    <div class="seg ig-wide"><button data-igx="mode:ai"${ai?' class="on"':''}>С ИИ</button><button data-igx="mode:free"${ai?'':' class="on"'}>Без ИИ · бесплатно</button></div>
    <div class="ig-row2"><span class="hint">Формат поста</span><div class="seg"><button data-igx="ax:4:5"${s.aspect==='4:5'?' class="on"':''}>4:5 · 1080×1350</button><button data-igx="ax:1:1"${s.aspect==='1:1'?' class="on"':''}>1:1</button></div></div>
    <button class="ig-lookline" data-igx="tostyle">${swatches(look.palette)}<span><small>Стиль ленты</small><b>${E(look.name)}</b></span>${I(IC.right)}</button>
    <button class="btn primary ig-big" data-igx="go"${IG.run?' disabled':''}>${I(IC.spark)}${label}</button>
    <p class="hint ig-cost">${ai?`${n} × ${usd(price())} ≈ <b>${usd(n*price())}</b> · ${made&&left&&err===left?'только кадры с ошибкой':'сначала покажу план'}`:`Мокапы из ваших фото — без ИИ и бесплатно${KS.instaMock?'':' (простые сцены)'}`}</p>
    ${IG.run?`<button class="btn sm danger ig-b" data-igx="stop">${I(IC.stop)}Остановить</button>`:''}${!IG.run&&err&&err!==left?`<button class="btn sm ig-b" data-igx="retryall">${I(IC.redo)}Повторить ошибки (${err})</button>`:''}</div>`; }
function setCard(){ const s=S(), set=IG.set, made=set.tiles.filter(t=>t.img).length;
  return `<div class="card ig-setc"><div class="hd"><span class="ig-ht">${I(IC.zip)}Набор</span><span class="hint">${made} из 9 готово</span></div>
    <label class="f">Название набора<input type="text" data-igin="setname" value="${E(set.name)}" maxlength="60"></label>
    <div class="flexw"><button class="btn sm${made?' primary':''} ig-b" data-igx="zip"${made?'':' disabled'}>${I(IC.dl)}Скачать все (ZIP)</button><button class="btn sm ig-b" data-igx="new">${I(IC.plus)}Новая лента</button></div>
    ${s.hist.filter(h=>h.id!==set.id).length?`<div class="hd2">История</div><div class="ig-hist">${s.hist.filter(h=>h.id!==set.id).slice(0,12).map(h=>`<div class="ig-hrow"><button class="ig-hopen" data-igx="hopen:${h.id}"><img data-ighthumb="${h.id}" alt=""><span><b>${E(h.name)}</b><small>${new Date(h.updated||h.created).toLocaleDateString('ru-RU',{day:'numeric',month:'short'})} · ${E(h.look)} · ${h.n} ${plural(h.n,'пост','поста','постов')}</small></span></button><button class="ig-ic" data-igx="hdel:${h.id}" title="Удалить набор">${I(IC.trash)}</button></div>`).join('')}</div>`:''}</div>`; }
function panFeed(box){ box.innerHTML=keyCard()+srcCard()+goCard()+setCard(); qa('[data-ighthumb]',box).forEach(async im=>{ const d=await DB.get('ig:thumb:'+im.dataset.ighthumb); if(d) im.src=urlOf(d); else im.classList.add('none'); }); }

/* ---- Instagram profile preview ---- */
function avatarHTML(){ const b=S().brand, set=IG.set; if(b.logo==='none'){ const t=set.tiles[4]&&set.tiles[4].img?set.tiles[4]:set.tiles.find(x=>x.img); if(t) return `<img src="${E(urlOf(t.img))}" alt="">`; }
  let svg=''; try{ if(KS.thSVG&&typeof dzPal==='function') svg=KS.thSVG({v:'mono',color:'ink',ini:monoTxt(),txt:b.name},dzPal({ink:'#1d1b19'})); }catch(_){ }
  return `<span class="ig-mono">${svg||`<b>${E(monoTxt())}</b>`}</span>`; }
const errShort=m=>{ m=String(m||''); return /отказал|правил|safety/i.test(m)?'ИИ отказался рисовать этот кадр':/лимит|429/i.test(m)?'Лимит Gemini — подождите минуту':/ключ|key/i.test(m)?'Проблема с ключом ИИ':/связи|интернет/i.test(m)?'Нет связи с ИИ':/не вернул/i.test(m)?'ИИ не вернул картинку':/фото изделия/i.test(m)?'Нет фото изделия':'Не получилось'; };
function cellHTML(t,p){ const set=IG.set, look=lookById(set.look)||curLook(), day=dayOfPos(p), sh=SHOTS[t.shot]||SHOTS.flat, st=t.status||'plan';
  const media=t.img?`<img src="${E(urlOf(t.img))}" alt="${E(sh.ru)}" draggable="false">`:`<div class="ig-ph${phInk(look,p)}" style="background:${lookBg(look,p)}">${I(SHOT_IC[t.shot]||SHOT_IC.flat)}<b>${E(sh.ru)}</b></div>`;
  const ov=st==='wait'?`<div class="ig-ov"><i class="ig-spin slow"></i><span>В очереди</span></div>`:st==='run'?`<div class="ig-ov run"><i class="ig-spin"></i><span>${S().mode==='free'?'Собираю мокап':'Рисую кадр'}</span><span class="ig-sec">${t.t0?Math.round((Date.now()-t.t0)/1000)+' с':''}</span></div>`
    :st==='err'?`<div class="ig-ov err" title="${E(t.err||'')}">${I(IC.warn)}<span class="ig-errt">${E(errShort(t.err))}</span><button class="btn sm" data-igx="retry:${t.id}">${I(IC.redo)}Повторить</button></div>`:'';
  return `<div class="ig-cell${IG.swap&&IG.swap.first===t.id?' sel':''}${t.locked?' lockd':''}" data-igt="${t.id}" data-igst="${st}" data-igpos="${p}" tabindex="0">${media}${S().order?`<span class="ig-num" title="День публикации">${day}</span>`:''}${t.locked?`<span class="ig-lk">${I(IC.lock)}</span>`:''}${ov}</div>`; }
function profileHTML(){ const b=S().brand, set=IG.set, made=set.tiles.filter(t=>t.img).length, posts=made+IG.old.length, look=lookById(set.look)||curLook();
  const hl=[['Конверты','envelope'],['Открытки','postcard'],['Печати','seal'],['Отзывы',''],['Цены','']].map(([n,k],i)=>{ const t=set.tiles.find(x=>x.img&&k&&tileKinds(x)[0]===k)||set.tiles.filter(x=>x.img)[i];
    return `<span class="ig-hl"><i style="background:${t?`url('${E(urlOf(t.img))}') center/cover`:lookBg(look,i)}"></i><small>${n}</small></span>`; }).join('');
  const bio=String(b.bio||'').split('\n').map(x=>E(x)).join('<br>');
  return `<div class="ig-prof"><div class="ig-bar"><b class="ig-handle">${E(b.handle||'handle')} <small>▾</small></b><span class="ig-bic">${I(IC.plus)}${I(IC.menu)}</span></div>
    <div class="ig-top"><div class="ig-ava"><div class="ig-ava-in">${avatarHTML()}</div></div><div class="ig-stats"><div><b>${posts}</b><span>${plural(posts,'публикация','публикации','публикаций')}</span></div><div><b>${E(b.followers)}</b><span>подписчиков</span></div><div><b>${E(b.following)}</b><span>подписок</span></div></div></div>
    <div class="ig-bio"><b>${E(b.name)}</b>${b.cat?`<span class="ig-cat">${E(b.cat)}</span>`:''}<p>${bio}</p>${b.link?`<a class="ig-link">${E(b.link)}</a>`:''}</div>
    <div class="ig-btns"><span class="ig-fol">Подписаться</span><span>Сообщение</span><span class="ig-sq">${I(IC.plus)}</span></div>
    <div class="ig-hls">${hl}</div>
    <div class="ig-tabs"><span class="on">${I(IC.grid)}</span><span>${I(IC.reel)}</span><span>${I(IC.tag)}</span></div>
    <div class="ig-grid">${set.tiles.map((t,p)=>cellHTML(t,p)).join('')}${IG.old.map(o=>`<div class="ig-cell old" data-igold="${o.id}"><img src="${E(urlOf(o.src))}" alt="" draggable="false"></div>`).join('')}
      <button class="ig-cell ig-addold" data-igx="oldadd">${I(IC.plus)}<span>Старые посты — чтобы увидеть, как новая сетка продолжит ленту</span></button></div></div>`; }
function harmCard(){ const h=IG.harm, made=IG.set.tiles.filter(t=>t.img).length;
  if(made<2) return `<div class="card ig-harm"><div class="hd"><span class="ig-ht">${I(IC.palette)}Гармония ленты</span></div><p class="hint">Когда будут готовы хотя бы 2 кадра, здесь появится оценка: совпадают ли цвет и свет, чередуются ли спокойные и насыщенные кадры.</p></div>`;
  if(!h||h.score==null) return `<div class="card ig-harm"><div class="hd"><span class="ig-ht">${I(IC.palette)}Гармония ленты</span><span class="hint">считаю…</span></div></div>`;
  const tone=h.score>=80?'ok':h.score>=62?'mid':'low', word=h.score>=80?'Цельная лента':h.score>=62?'Почти цельная':'Есть что поправить', bar=(n,v)=>`<div class="ig-sb"><span>${n}</span><i><b style="width:${v}%"></b></i><em>${v}</em></div>`;
  return `<div class="card ig-harm"><div class="hd"><span class="ig-ht">${I(IC.palette)}Гармония ленты</span></div>
    <div class="ig-hrow2"><div class="ig-ring ${tone}" style="--v:${h.score}"><b>${h.score}</b></div><div class="ig-hw"><b>${word}</b>${bar('Цвет',h.col)}${bar('Свет',h.lum)}${bar('Ритм',h.rhy)}</div></div>
    <div class="ig-cmap" title="Средний цвет каждого кадра">${h.cells.map((c,i)=>`<i style="background:${c?c.hex:'transparent'}"${c?'':' class="none"'}>${i+1}</i>`).join('')}</div>
    <ul class="ig-tips">${h.tips.map(t=>`<li class="${t.k}">${E(t.t)}</li>`).join('')}</ul>
    <div class="flexw"><button class="btn sm ig-b" data-igx="harmfix">${I(IC.wand)}Выровнять цвет</button><button class="btn sm ig-b" data-igx="balance">${I(IC.swap)}Расставить для баланса</button></div></div>`; }
function asideHTML(){ const s=S();
  return `${harmCard()}<div class="card ig-ord"><div class="hd"><span class="ig-ht">${I(IC.cal)}Порядок публикации</span></div><p class="hint">Публикуйте по одному посту в день, начиная с <b>нижнего правого</b> — тогда сетка сложится как здесь. Номер на кадре = день.</p>
    <label class="chk"><input type="checkbox" data-igin="order"${s.order?' checked':''}>Показывать номера дней</label><button class="btn sm ig-b" data-igx="tocap">${I(IC.text)}Подписи и даты</button></div>
    <div class="card ig-oldc"><div class="hd"><span class="ig-ht">${I(IC.hist)}Старые посты</span><span class="hint">${IG.old.length}</span></div>${IG.old.length?`<div class="ig-olds">${IG.old.map(o=>`<span><img src="${E(urlOf(o.src))}" alt=""><button class="ig-ic" data-igx="olddel:${o.id}" title="Убрать">${I(IC.trash)}</button></span>`).join('')}</div>`:'<p class="hint">Добавьте скриншоты или фото уже опубликованных постов — они встанут под новой сеткой.</p>'}
    <div class="flexw"><button class="btn sm ig-b" data-igx="oldadd">${I(IC.plus)}Добавить</button>${IG.old.length?`<button class="btn sm ig-b" data-igx="oldclear">Очистить</button>`:''}</div></div>`; }
function planHTML(){ const set=IG.set, look=lookById(set.look)||curLook(), left=set.tiles.filter(t=>!t.img&&!t.locked).length, todo=left||set.tiles.filter(t=>!t.locked).length, ai=S().mode==='ai';
  return `<div class="ig-plan"><div class="ig-ptools"><p class="hint">Сетка 3×3 как в профиле: насыщенные кадры — в углах и в центре, спокойные — между ними. Один свет, одна палитра «${E(look.name)}», один объектив на всех кадрах.</p>
    <div class="flexw"><button class="btn sm ig-b" data-igx="shuffle">${I(IC.shuffle)}Перемешать</button><button class="btn sm primary ig-b" data-igx="go"${IG.run?' disabled':''}>${I(IC.spark)}${ai?`${left?'Создать '+todo:'Заново все '+todo} · ≈ ${usd(todo*price())}`:'Сделать мокапы'}</button></div></div>
    <div class="ig-pgrid">${set.tiles.map((t,p)=>{ const sh=SHOTS[t.shot]||SHOTS.flat, srcs=t.src.map(srcById).filter(Boolean);
      return `<div class="ig-pc${t.locked?' lockd':''}" data-igt="${t.id}"><div class="ig-pch"><span class="ig-pn">${p+1}</span><select data-igin="shot:${t.id}" aria-label="Тип кадра"${t.img?' disabled':''}>${Object.entries(SHOTS).map(([k,v])=>`<option value="${k}"${k===t.shot?' selected':''}>${v.ru}</option>`).join('')}</select><button class="ig-ic${t.locked?' on':''}" data-igx="lock:${t.id}" title="${t.locked?'Снять замок':'Закрепить: не менять при перемешивании и пересоздании'}">${I(t.locked?IC.lock:IC.unlock)}</button></div>
        <div class="ig-pcv" data-igx="open:${t.id}">${t.img?`<img src="${E(urlOf(t.img))}" alt="">`:`<div class="ig-ph${phInk(look,p)}" style="background:${lookBg(look,p)}"><span class="ig-pcic">${I(SHOT_IC[t.shot]||SHOT_IC.flat)}</span>${srcs.slice(0,3).map((s,i)=>`<img class="ig-pcp n${srcs.length>1?i+1:0}" src="${E(urlOf(s.thumb))}" alt="">`).join('')}</div>`}<span class="ig-tg">${sh.busy>.5?'насыщенный':'спокойный'} · ${sh.lum<.5?'тёмный':'светлый'}</span></div>
        <button class="ig-pcs" data-igx="srcpick:${t.id}"${t.img?' disabled':''}>${srcs.length?srcs.map(s=>`<img src="${E(urlOf(s.thumb))}" alt="">`).join(''):`<em>${I(IC.img)}</em>`}<span>${srcs.length?E(srcs.map(s=>KN[s.kind]||'Изделие').join(' + ')):'Выберите изделие'}</span></button>
        <textarea data-igin="desc:${t.id}" rows="3" aria-label="Описание кадра"${t.img?' disabled':''}>${E(t.desc)}</textarea></div>`; }).join('')}</div></div>`; }
function feedScreen(scr){ const s=S(), set=IG.set, look=lookById(set.look)||curLook(), made=set.tiles.filter(t=>t.img).length, plan=IG.view==='plan';
  scr.innerHTML=`<div class="ig-scr"><div class="ig-head"><div class="ig-ti"><h2>${plan?'План ленты':'Лента'}</h2><p class="hint">«${E(set.name)}» · стиль «${E(look.name)}» · ${set.aspect||s.aspect} · готово ${made} из 9</p></div>
    <div class="ig-tools"><div class="seg"><button data-igx="view:profile"${plan?'':' class="on"'}>${I(IC.grid)}Профиль</button><button data-igx="view:plan"${plan?' class="on"':''}>${I(IC.spark)}План</button></div>
      ${plan?'':`<button class="btn sm ig-b${s.phone?' on':''}" data-igx="phone" title="Показать в рамке телефона">${I(IC.phone)}Телефон</button><button class="btn sm ig-b${IG.swap?' on':''}" data-igx="swap" title="Нажмите два кадра, чтобы поменять их местами">${I(IC.swap)}${IG.swap?'Готово':'Поменять местами'}</button>`}
      <button class="btn sm primary ig-b" data-igx="zip"${made?'':' disabled'}>${I(IC.dl)}Скачать все</button></div></div>
    <div class="ig-prog"${IG.run?'':' hidden'}>${progHTML()}</div><div class="ig-busy"${busyMsg?'':' hidden'}><i class="ig-spin"></i><span>${E(busyMsg)}</span></div>
    ${!made&&!IG.run?stepsHTML():''}${IG.swap?`<div class="ig-swaphint">${I(IC.swap)}Нажмите первый кадр, потом второй — они поменяются местами.</div>`:''}
    ${plan?planHTML():`<div class="ig-body"><div class="ig-left">${s.phone?`<div class="ig-phone"><div class="ig-notch"></div><div class="ig-status"><b>9:41</b><span>●●● ᯤ ▮</span></div><div class="ig-pscroll">${profileHTML()}</div></div>`:profileHTML()}
      <p class="hint ig-gridnote">Профиль Instagram показывает кадры обрезанными до 3:4 — края поста ${set.aspect==='1:1'?'1:1':'4:5'} немного срезаются. Нажмите кадр, чтобы открыть его${matchMedia('(pointer:fine)').matches?'; перетаскивайте мышью, чтобы поменять порядок':''}.</p></div><div class="ig-aside">${asideHTML()}</div></div>`}</div>`;
  if(!plan) harmRefresh(); }
function stepsHTML(){ const look=curLook(), n=IG.srcs.length, ai=S().mode==='ai';
  const st=[[true,'Стиль ленты',`«${E(look.name)}» — сменить или сделать свой по образцу во вкладке «Стиль»`,'tostyle'],[n>0,'Фото изделий',n?`Добавлено: ${n}. Можно ещё — конверты, открытки, печати, блокноты`:'Сфотографируйте свои изделия как есть и добавьте слева или перетащите сюда','pick'],[false,'9 постов',ai?`Проверьте план и цену (≈ ${usd(9*price())}) — ИИ снимет изделия в одном стиле`:'Мокапы без ИИ — сразу и бесплатно','go']];
  return `<div class="ig-steps">${st.map(([done,h,tx,act],i)=>`<button class="ig-step${done?' done':''}${!done&&(i===0||st[i-1][0])?' next':''}" data-igx="${act}"><b>${done?I(IC.check):i+1}</b><span><strong>${h}</strong><small>${tx}</small></span></button>`).join('')}</div>`; }
function progHTML(){ const r=IG.run; if(!r) return ''; const n=r.n||1, d=r.done+r.fail, pct=Math.round(d/n*100);
  return `<div class="ig-pt"><b>${S().mode==='free'?'Собираю мокапы':'Создаю посты'}: ${r.done} из ${n}</b><span>${r.fail?'ошибок: '+r.fail+' · ':''}${S().mode==='free'?'бесплатно':'потрачено ≈ '+usd(r.spent)}</span><button class="btn sm danger ig-b" data-igx="stop">${I(IC.stop)}Стоп</button></div><div class="ig-pbar"><i style="width:${Math.max(4,pct)}%"></i></div>`; }
function progress(){ const el=q('.ig-prog'); if(el){ el.hidden=!IG.run; if(IG.run) el.innerHTML=progHTML(); } const gc=q('[data-panel="ks-insta"] .ig-go'); if(gc&&activeId()==='igfeed'){ const w=document.createElement('div'); w.innerHTML=goCard(); gc.replaceWith(w.firstChild); }
  const ti=q('.ig-head .ig-ti .hint'); if(ti&&IG.set) ti.textContent=ti.textContent.replace(/готово \d+ из 9/,'готово '+IG.set.tiles.filter(t=>t.img).length+' из 9'); }
function paintTile(t){ const set=IG.set, p=set.tiles.indexOf(t); if(p<0) return; const el=q(`.ig-grid .ig-cell[data-igt="${t.id}"]`); if(el){ const w=document.createElement('div'); w.innerHTML=cellHTML(t,p); el.replaceWith(w.firstChild); }
  const pc=q(`.ig-pc[data-igt="${t.id}"] .ig-pcv`); if(pc&&t.img) pc.innerHTML=`<img src="${E(urlOf(t.img))}" alt=""><span class="ig-tg">готов</span>`;
  if(POST.open&&POST.id===t.id) postSoft(t); }
let harmT=0;
function harmRefresh(){ clearTimeout(harmT); harmT=setTimeout(async()=>{ const box=q('.ig-harm'); if(!box) return; const before=IG.harm; await harmonyCalc(); const now=q('.ig-harm'); if(now&&(IG.harm!==before||/считаю/.test(now.textContent))){ const w=document.createElement('div'); w.innerHTML=harmCard(); now.replaceWith(w.firstChild); } },120); }

/* ---- confirmation with the plan and the cost ---- */
let askM=null;
function askPlan(tiles){ return new Promise(res=>{ askM=askM||KS.modal({id:'igask',title:'Создать посты?',wide:true}); const set=IG.set, look=lookById(set.look)||curLook(), ids=new Set(tiles.map(t=>t.id)), n=tiles.length, pr=price(), N=KS.neuro;
  askM.title(`Создать ${n} ${plural(n,'пост','поста','постов')} в стиле «${look.name}»?`);
  askM.el.innerHTML=`<div class="ig-ask"><div class="ig-askg">${set.tiles.map((t,p)=>{ const sh=SHOTS[t.shot]||SHOTS.flat, on=ids.has(t.id), s=t.src.map(srcById).filter(Boolean)[0];
      return `<div class="ig-aq${on?' on':''}"><span class="ig-aqi" style="background:${lookBg(look,p)}">${t.img&&!on?`<img src="${E(urlOf(t.img))}" alt="">`:I(SHOT_IC[t.shot]||SHOT_IC.flat)}${s&&on?`<img class="ig-aqs" src="${E(urlOf(s.thumb))}" alt="">`:''}</span><b>${p+1}. ${E(sh.ru)}</b><small>${on?E(t.desc):t.locked?'закреплён':'уже готов'}</small></div>`; }).join('')}</div>
    <div class="ig-asks"><div class="ig-cost2"><small>Примерная стоимость</small><b>≈ ${usd(n*pr)}</b><span>${n} × ${usd(pr)} · ${E(N&&N.modelName?N.modelName():'')}</span></div>
      <p class="hint">Все кадры — с вашими изделиями без изменений, в одном свете и цвете. Первый готовый кадр станет образцом стиля для остальных. Деньги списывает Google с вашего ключа; ${E(N&&N.spendLine?N.spendLine().split(' · ').slice(1).join(' · '):'')}.</p>
      <p class="hint">Если кадр не получится, повторите только его — остальные останутся.</p>
      <div class="flexw"><button class="btn primary ig-b" data-igask="1">${I(IC.spark)}Создать за ≈ ${usd(n*pr)}</button><button class="btn ig-b" data-igask="plan">Изменить план</button><button class="btn ig-b" data-igask="0">Отмена</button></div></div></div>`;
  let done=false; const fin=v=>{ if(done) return; done=true; askM.root.removeEventListener('click',onc,true); askM.close(); res(v); };
  const onc=e=>{ const b=e.target.closest('[data-igask]'); if(b){ e.preventDefault(); const v=b.dataset.igask; if(v==='plan'){ fin(false); IG.view='plan'; if(activeId()!=='igfeed') KS.show('insta','igfeed'); else paintAll(); return; } fin(v==='1'); return; }
    if(e.target===askM.root||e.target.closest('[data-ksclose]')) fin(false); };
  askM.root.addEventListener('click',onc,true); askM.open(); setTimeout(()=>{ const b=askM.root.querySelector('[data-igask="1"]'); if(b) b.focus(); },30); }); }

/* ---- picker modal: library photos, app sources, product for a plan frame ---- */
let pickM=null;
function pickOpen(title,html,onClick){ pickM=pickM||KS.modal({id:'igpick',title:'',wide:true}); pickM.title(title); pickM.el.innerHTML=html; pickM.el.onclick=e=>onClick(e); pickM.open(); return pickM; }
async function libPick(){ if(!KS.photos||!KS.photos.list){ KS.toast('Раздел «Мои фото» не подключён'); return; } let L=[]; try{ L=await KS.photos.list(); }catch(_){ }
  if(!L.length){ KS.toast('В «Мои фото» пока пусто'); return; } const sel=new Set();
  const draw=()=>`<p class="hint">Выберите фото изделий из библиотеки «Мои фото» (${L.length}).</p><div class="ig-pk">${L.slice().reverse().map(m=>`<button class="ig-pki${sel.has(m.id)?' on':''}" data-igpk="${m.id}"><img src="${E(urlOf(m.thumb))}" alt="" loading="lazy"><span>${E(m.name)}</span></button>`).join('')}</div><div class="flexw ig-pkbar"><button class="btn primary ig-b" data-igpkgo="1"${sel.size?'':' disabled'}>Добавить${sel.size?' ('+sel.size+')':''}</button><button class="btn ig-b" data-ksclose="1">Отмена</button></div>`;
  const m=pickOpen('Фото из «Мои фото»',draw(),async e=>{ const b=e.target.closest('[data-igpk]'); if(b){ const id=b.dataset.igpk; sel.has(id)?sel.delete(id):sel.add(id); m.el.innerHTML=draw(); return; }
    if(e.target.closest('[data-igpkgo]')){ m.close(); let n=0; for(const id of sel){ try{ const r=await KS.photos.get(id); if(r&&r.data){ await srcAdd({src:r.data,name:r.name,from:'lib'}); n++; } }catch(_){ } } srcChanged(); KS.toast('Добавлено из «Мои фото»: '+n); } }); }
async function appPick(){ const M=KS.instaMock; if(!M||typeof M.sources!=='function'){ KS.toast('Модуль мокапов не подключён — добавьте фото изделий вручную'); return; }
  KS.toast('Собираю изделия из программы…'); let L=[]; try{ L=(await M.sources())||[]; }catch(e){ console.warn('[insta] sources',e); } L=L.filter(x=>x&&x.src);
  if(!L.length){ KS.toast('В программе пока нет готовых изделий'); return; } const sel=new Set(); IG.appSrc=L;
  const draw=()=>`<p class="hint">Текущие макеты и изделия из программы: конверт, открытка, марки, штампы, обложка блокнота… Выберите, что показать в постах.</p><div class="ig-pk">${L.map((s,i)=>`<button class="ig-pki cut${sel.has(i)?' on':''}" data-igpk="${i}"><img src="${E(s.thumb||s.src)}" alt="" loading="lazy"><span>${E(s.name||KN[s.kind]||'Изделие')}</span><small>${E(KN[s.kind]||'')}</small></button>`).join('')}</div><div class="flexw ig-pkbar"><button class="btn primary ig-b" data-igpkgo="1"${sel.size?'':' disabled'}>Добавить${sel.size?' ('+sel.size+')':''}</button><button class="btn ig-b" data-ksclose="1">Отмена</button></div>`;
  const m=pickOpen('Изделия из программы',draw(),async e=>{ const b=e.target.closest('[data-igpk]'); if(b){ const i=+b.dataset.igpk; sel.has(i)?sel.delete(i):sel.add(i); m.el.innerHTML=draw(); return; }
    if(e.target.closest('[data-igpkgo]')){ m.close(); let n=0; for(const i of sel){ const s=L[i]; try{ await srcAdd({src:s.src,name:s.name||KN[s.kind]||'Изделие',kind:s.kind,from:'app'}); n++; }catch(_){ } } srcChanged(); KS.toast('Добавлено изделий: '+n); } }); }
function srcPick(tid){ const set=IG.set, t=set.tiles.find(x=>x.id===tid); if(!t) return; if(!IG.srcs.length){ KS.toast('Сначала добавьте фото изделий'); flashSrc(); return; }
  const multi=t.shot==='group', sel=new Set(t.src);
  const draw=()=>`<p class="hint">${multi?'Коллекция: выберите до 3 изделий.':'Какое изделие будет в этом кадре?'}</p><div class="ig-pk">${IG.srcs.map(s=>`<button class="ig-pki${s.alpha?' cut':''}${sel.has(s.id)?' on':''}" data-igpk="${s.id}"><img src="${E(urlOf(s.thumb))}" alt=""><span>${E(KN[s.kind]||'')}</span><small>${E(s.name)}</small></button>`).join('')}</div>${multi?`<div class="flexw ig-pkbar"><button class="btn primary ig-b" data-igpkgo="1"${sel.size?'':' disabled'}>Готово</button></div>`:''}`;
  const apply=()=>{ t.src=[...sel].slice(0,multi?3:1); t.auto=true; set.edited=true; tileDesc(t); setSave(); paintAll(); };
  const m=pickOpen(`Кадр ${set.tiles.indexOf(t)+1}: ${(SHOTS[t.shot]||SHOTS.flat).ru}`,draw(),e=>{ const b=e.target.closest('[data-igpk]'); if(b){ const id=b.dataset.igpk; if(multi){ sel.has(id)?sel.delete(id):(sel.size<3&&sel.add(id)); m.el.innerHTML=draw(); } else { sel.clear(); sel.add(id); m.close(); apply(); } return; }
    if(e.target.closest('[data-igpkgo]')){ m.close(); apply(); } }); }
async function kindAI(){ const L=IG.srcs.slice(0,12); if(!L.length) return; setBusy('Gemini смотрит на фото…'); KS.toast('Gemini смотрит на фото…');
  try{ const t=await KS.neuro.vision(L.map(s=>s.thumb),`These are ${L.length} photos of products of a small print shop, in order. For each photo say what the main product is. Use only these words: ${KINDS.map(k=>k[0]).join(', ')}. Answer ONLY JSON: {"kinds":["…"]} with exactly ${L.length} items in the same order.`,{json:true,max:512});
    const j=parseJSON(t), K=j&&Array.isArray(j.kinds)?j.kinds:[]; let n=0; L.forEach((s,i)=>{ const k=String(K[i]||'').toLowerCase().trim(); if(KN[k]&&k!==s.kind){ s.kind=k; n++; } }); await srcSave(); srcChanged(); KS.toast(n?'Подписал изделия: изменено '+n:'Все изделия уже подписаны верно'); }
  catch(e){ KS.toast((e&&e.message)||'Не получилось'); } finally{ setBusy(''); } }
async function oldAdd(files){ files=[...(files||[])].filter(f=>/^image\//.test(f.type)); if(!files.length) return; for(const f of files){ try{ const src=await shrink(await KS.readImage(f,1400),720,'image/jpeg',.84); IG.old.push({id:KS.uid('igo'),src}); }catch(_){ } }
  IG.old=IG.old.slice(-24); await DB.set('ig:old',IG.old); paintAll(); KS.toast('Старые посты: '+IG.old.length); }

/* ---- drag to reorder (mouse) and swap mode (touch) ---- */
let DRG=null, dragJust=0;
function swapTiles(a,b){ const set=IG.set, i=set.tiles.findIndex(t=>t.id===a), j=set.tiles.findIndex(t=>t.id===b); if(i<0||j<0||i===j) return false; [set.tiles[i],set.tiles[j]]=[set.tiles[j],set.tiles[i]]; IG.harm=null; setSave(); thumbMake(); return true; }
document.addEventListener('pointerdown',e=>{ if(e.pointerType!=='mouse'||e.button!==0) return; const c=e.target.closest('.ig-grid .ig-cell[data-igt]'); if(!c||e.target.closest('button')||IG.run) return; DRG={id:c.dataset.igt,x:e.clientX,y:e.clientY,el:c,ghost:null,over:null}; });
document.addEventListener('pointermove',e=>{ if(!DRG) return; if(!DRG.ghost){ if(Math.hypot(e.clientX-DRG.x,e.clientY-DRG.y)<7) return; const r=DRG.el.getBoundingClientRect(), g=DRG.el.cloneNode(true); g.className='ig-cell ig-ghost'; g.style.width=r.width+'px'; g.style.height=r.height+'px'; document.body.appendChild(g); DRG.ghost=g; DRG.el.classList.add('dragging'); DRG.dx=e.clientX-r.left; DRG.dy=e.clientY-r.top; }
  DRG.ghost.style.transform=`translate(${e.clientX-DRG.dx}px,${e.clientY-DRG.dy}px) rotate(2deg)`; DRG.ghost.hidden=true; const u=document.elementFromPoint(e.clientX,e.clientY); DRG.ghost.hidden=false; const t=u&&u.closest('.ig-grid .ig-cell[data-igt]');
  qa('.ig-cell.dropto').forEach(x=>x!==t&&x.classList.remove('dropto')); if(t&&t!==DRG.el){ t.classList.add('dropto'); DRG.over=t.dataset.igt; } else DRG.over=null; });
document.addEventListener('pointerup',()=>{ if(!DRG) return; const d=DRG; DRG=null; if(!d.ghost) return; d.ghost.remove(); qa('.ig-cell.dropto,.ig-cell.dragging').forEach(x=>x.classList.remove('dropto','dragging')); dragJust=Date.now();
  if(d.over&&swapTiles(d.id,d.over)){ paintAll(); KS.toast('Кадры поменялись местами'); } });

/* ===== post window: big view, crop, grade tweaks, caption, regenerate, own photo ===== */
const POST={open:false,id:null,m:null,im:null};
function postOpen(id){ POST.m=POST.m||KS.modal({id:'igpost',title:'',wide:true,onClose:()=>{ POST.open=false; }}); POST.id=id; POST.open=true; POST.im=null; postRender(); POST.m.open(); }
function postSoft(t){ const f=POST.m&&POST.m.el.querySelector(`[data-igframe="${t.id}"]`); if(!f||POST.st!==t.status+':'+!!t.img+':'+(t.ax||'')+':'+!!t.locked+':'+!!IG.run){ postRender(); return; } const im=f.querySelector('.ig-fimg'); if(im&&t.img){ im.src=urlOf(t.img); f.classList.remove('cropping'); const r=f.querySelector('.ig-craw'); if(r) r.remove(); } else postRender(); }
function postRender(){ const set=IG.set, t=set&&set.tiles.find(x=>x.id===POST.id); if(!t||!POST.m){ if(POST.m) POST.m.close(); return; } POST.st=t.status+':'+!!t.img+':'+(t.ax||'')+':'+!!t.locked+':'+!!IG.run;
  const p=set.tiles.indexOf(t), day=dayOfPos(p), sh=SHOTS[t.shot]||SHOTS.flat, ax=t.ax||set.aspect, look=lookById(set.look)||curLook(), ai=S().mode==='ai', a=t.adj||{exp:0,warm:0,str:1}, c=t.cap||{text:'',tags:[],alt:''};
  POST.m.title(`Кадр ${p+1} из 9 · ${sh.ru}`);
  igKeep(POST.m.el,()=>{ POST.m.el.innerHTML=`<div class="ig-post"><div class="ig-pl"><div class="ig-frame" data-igframe="${t.id}" style="aspect-ratio:${ax==='1:1'?'1/1':'4/5'};width:min(100%,${ax==='1:1'?'64vh':'51vh'})">${t.img?`<img class="ig-fimg" src="${E(urlOf(t.img))}" alt="" draggable="false">`:`<div class="ig-ph" style="background:${lookBg(look,p)}">${I(SHOT_IC[t.shot]||SHOT_IC.flat)}<b>${E(sh.ru)}</b></div>`}
      ${t.status==='run'||t.status==='wait'?`<div class="ig-ov run"><i class="ig-spin"></i><span>${t.status==='wait'?'В очереди':'Рисую кадр…'}</span></div>`:''}${t.status==='err'?`<div class="ig-ov err">${I(IC.warn)}<span class="ig-errt">${E(t.err)}</span></div>`:''}</div>
      <div class="ig-pnav"><button class="btn sm icon ig-b" data-igx="nav:-1" aria-label="Предыдущий"${p>0?'':' disabled'}>${I(IC.left)}</button><span>${t.img?'Двигайте фото, чтобы выбрать кадр':'Кадр ещё не создан'}</span><button class="btn sm icon ig-b" data-igx="nav:1" aria-label="Следующий"${p<8?'':' disabled'}>${I(IC.right)}</button></div></div>
    <div class="ig-pr"><p class="ig-pmeta"><span class="ks-badge${t.img?' ok':''}">${t.img?(t.own?'своё фото':t.free?'мокап':'ИИ'):t.status==='err'?'ошибка':'план'}</span> День публикации ${day} — ${E(dayLabel(day))} · ${E(S().cap.time||'19:00')}</p>
      <p class="hint">${E(t.desc)}</p>
      <div class="flexw">${t.locked?`<span class="hint">${I(IC.lock)} Закреплён — снимите замок, чтобы пересоздать</span>`:`<button class="btn sm primary ig-b" data-igx="regen:${t.id}"${IG.run?' disabled':''}>${I(IC.redo)}${t.img?'Ещё раз':'Создать'}${ai?' · ≈ '+usd(price()):' · мокап'}</button>`}
        <button class="btn sm ig-b" data-igx="own:${t.id}">${I(IC.img)}Своё фото</button><button class="btn sm ig-b" data-igx="lock:${t.id}">${I(t.locked?IC.unlock:IC.lock)}${t.locked?'Снять замок':'Закрепить'}</button>${t.img?`<button class="btn sm ig-b" data-igx="dl:${t.id}">${I(IC.dl)}JPG</button>`:''}</div>
      ${t.img?`<div class="hd2">Кадрирование</div><div class="ig-row2"><div class="seg"><button data-igx="tax:4:5"${ax==='4:5'?' class="on"':''}>4:5</button><button data-igx="tax:1:1"${ax==='1:1'?' class="on"':''}>1:1</button></div><label class="ig-sl"><span>Масштаб</span><input type="range" min="1" max="2" step=".02" value="${(t.crop&&t.crop.z)||1}" data-igin="zoom:${t.id}"></label></div>
      <div class="hd2">Обработка</div><label class="ig-sl"><span>Яркость</span><input type="range" min="-1" max="1" step=".05" value="${a.exp||0}" data-igin="adj:exp:${t.id}"></label><label class="ig-sl"><span>Тепло</span><input type="range" min="-1" max="1" step=".05" value="${a.warm||0}" data-igin="adj:warm:${t.id}"></label><label class="ig-sl"><span>Сила стиля</span><input type="range" min="0" max="1" step=".05" value="${a.str==null?1:a.str}" data-igin="adj:str:${t.id}"></label>`:''}
      <div class="hd2">Подпись</div><textarea rows="5" data-igin="pcap:${t.id}" placeholder="Подпись появится после «Подписи → Написать», или напишите свою">${E(c.text)}</textarea>
      <input type="text" data-igin="ptags:${t.id}" value="${E((c.tags||[]).join(' '))}" placeholder="#хэштеги через пробел"><input type="text" data-igin="palt:${t.id}" value="${E(c.alt||'')}" placeholder="Альтернативный текст (описание фото)">
      <div class="flexw"><button class="btn sm ig-b" data-igx="copy:${t.id}">${I(IC.copy)}Копировать подпись</button><button class="btn sm ig-b" data-igx="mv:-1"${p>0?'':' disabled'}>${I(IC.left)}Раньше в сетке</button><button class="btn sm ig-b" data-igx="mv:1"${p<8?'':' disabled'}>Позже в сетке${I(IC.right)}</button></div></div></div>`; }); }
/* crop by dragging the picture inside the frame */
let CR=null;
document.addEventListener('pointerdown',async e=>{ const f=e.target.closest('[data-igframe]'); if(!f||e.button>0) return; const t=IG.set&&IG.set.tiles.find(x=>x.id===f.dataset.igframe); if(!t||!t.raw||IG.run&&t.status==='run') return; e.preventDefault();
  const r=f.getBoundingClientRect(); CR={t,f,x0:e.clientX,y0:e.clientY,cx:(t.crop&&t.crop.x!=null)?t.crop.x:.5,cy:(t.crop&&t.crop.y!=null)?t.crop.y:.5,fw:r.width,fh:r.height,moved:false};
  try{ await rawFor(t); }catch(_){ CR=null; return; } if(CR) cropShow(); });
function cropGeom(t,fw,fh){ const im=POST.im, iw=im.naturalWidth, ih=im.naturalHeight, z=(t.crop&&t.crop.z)||1, s=Math.max(fw/iw,fh/ih)*z; return {dw:iw*s,dh:ih*s}; }
function cropPlace(t,f,fw,fh){ if(!POST.im) return; let el=f.querySelector('.ig-craw'); if(!el){ el=document.createElement('img'); el.className='ig-craw'; el.src=urlOf(t.raw); el.draggable=false; f.appendChild(el); } const g=cropGeom(t,fw,fh), c=t.crop||{x:.5,y:.5};
  Object.assign(el.style,{width:g.dw+'px',height:g.dh+'px',left:((fw-g.dw)*(c.x!=null?c.x:.5))+'px',top:((fh-g.dh)*(c.y!=null?c.y:.5))+'px'}); f.classList.add('cropping'); }
const cropShow=()=>{ if(CR) cropPlace(CR.t,CR.f,CR.fw,CR.fh); };
async function rawFor(t){ if(!POST.im||POST.im.dataset.src!==t.id+':'+t.raw.length){ POST.im=await loadImg(t.raw); POST.im.dataset.src=t.id+':'+t.raw.length; } return POST.im; }
document.addEventListener('pointermove',e=>{ if(!CR||!POST.im) return; const g=cropGeom(CR.t,CR.fw,CR.fh), dx=e.clientX-CR.x0, dy=e.clientY-CR.y0; if(Math.abs(dx)+Math.abs(dy)>2) CR.moved=true;
  const t=CR.t; t.crop=t.crop||{x:.5,y:.5,z:1}; if(g.dw-CR.fw>1) t.crop.x=clamp(CR.cx+dx/(CR.fw-g.dw),0,1); if(g.dh-CR.fh>1) t.crop.y=clamp(CR.cy+dy/(CR.fh-g.dh),0,1); cropShow(); });
document.addEventListener('pointerup',async()=>{ if(!CR) return; const c=CR; CR=null; if(!c.moved){ c.f.classList.remove('cropping'); const r=c.f.querySelector('.ig-craw'); if(r) r.remove(); return; } await regradeTile(c.t); paintTile(c.t); });
let adjT=0;
function adjLive(t){ clearTimeout(adjT); adjT=setTimeout(async()=>{ await regradeTile(t); paintTile(t); harmRefresh(); },180); }

/* ===== «Стиль»: looks, «my style from examples», brand ===== */
const VPROMPT=n=>`You are a senior product photo stylist and colourist. These ${n} photos are existing Instagram posts or inspiration of a small handmade stationery and print studio (envelopes with wax seals, postcards, letters, stamps, notebooks). Describe ONE consistent visual style that unites them, so new product photos can be shot in exactly this style.
Answer ONLY JSON:
{"name":"short Russian name of the style, 2–3 words","ru":"one short Russian sentence about the look",
"palette":["#rrggbb", "...6 real dominant colours, lightest to darkest"],
"surfaces":"English: backgrounds and surfaces","props":"English: typical props","light":"English: light direction, softness, time of day","angles":"English: typical camera angles and framing","mood":"English: mood words","lens":"English: lens and film look, e.g. 50mm f/2.8, soft film grain",
"ru_surf":"Russian, prepositional case after «на», e.g. «льняной скатерти»","ru_props":"Russian: 2–3 props","ru_light":"Russian: the light, 3–5 words",
"grade":{"temp":0,"tint":0,"contrast":0,"lift":0,"fade":0,"sat":0,"grain":0,"vignette":0,"curve":"soft"}}
grade ranges: temp, tint, contrast, sat from -1 to 1 (warm/magenta/contrast/saturation up = positive); lift, fade, grain, vignette from 0 to 1; curve one of soft, film, matte, clean, warm, punch.`;
const GR=[['temp','Тепло',-1,1],['tint','Оттенок',-1,1],['contrast','Контраст',-1,1],['sat','Насыщенность',-1,1],['lift','Подъём теней',0,1],['fade','Выцветание',0,1],['grain','Зерно плёнки',0,1],['vignette','Виньетка',0,1]];
const FACTS=[['surfaces','Поверхности'],['props','Реквизит'],['light','Свет'],['angles','Ракурсы'],['mood','Настроение'],['lens','Объектив и плёнка']];
function lookRow(l,on){ return `<button class="ig-look${on?' on':''}" data-igx="look:${l.id}"><span class="ig-lsw">${l.palette.slice(0,5).map(c=>`<i style="background:${E(c)}"></i>`).join('')}</span><span class="ig-lt"><b>${E(l.name)}</b><small>${E(l.ru.desc||l.mood)}</small></span>${on?`<span class="ig-lok">${I(IC.check)}</span>`:''}</button>`; }
function panStyle(box){ const s=S(), cur=curLook(), my=myLooks(), b=s.brand, gem=!!(KS.neuro&&KS.neuro.hasGemini&&KS.neuro.hasGemini());
  box.innerHTML=`<div class="card"><div class="hd"><span class="ig-ht">${I(IC.palette)}Стиль ленты</span></div><p class="hint">Один стиль на все 9 кадров: палитра, поверхности, свет, объектив и одна обработка.</p><div class="ig-looks">${lookList().map(l=>lookRow(l,l.id===cur.id)).join('')}</div></div>
   <div class="card ig-refc"><div class="hd"><span class="ig-ht">${I(IC.wand)}Мой стиль по образцу</span></div><p class="hint">Загрузите 1–6 фото своих постов или вдохновения — Gemini разберёт их в карточку стиля: палитра, поверхности, реквизит, свет, ракурсы, настроение, цифры обработки. Всё можно поправить.</p>
    <div class="ks-drop ig-drop sm" data-igx="refpick" role="button" tabindex="0">${I(IC.up)}<b>Фото-образцы</b><span>перетащите или нажмите · до 6 штук</span></div>
    ${IG.refs.length?`<div class="ig-refs">${IG.refs.map((r,i)=>`<span><img src="${E(urlOf(r))}" alt=""><button class="ig-ic" data-igx="refdel:${i}" title="Убрать">${I(IC.trash)}</button></span>`).join('')}</div>`:''}
    <div class="flexw"><button class="btn sm primary ig-b" data-igx="analyze"${IG.refs.length?'':' disabled'}>${I(IC.spark)}Разобрать стиль${gem?'':' (нужен Gemini)'}</button><button class="btn sm ig-b" data-igx="analyzelocal"${IG.refs.length?'':' disabled'}>Только цвета, без ИИ</button></div></div>
   ${my.length?`<div class="card"><div class="hd"><span class="ig-ht">${I(IC.save)}Мои стили</span></div><div class="ig-looks">${my.map(l=>lookRow(l,l.id===cur.id)).join('')}</div></div>`:''}
   <div class="card ig-brand"><div class="hd"><span class="ig-ht">${I(IC.ig)}Бренд и профиль</span></div>
    <div class="row2"><label class="f">Имя<input type="text" data-igin="b:name" value="${E(b.name)}"></label><label class="f">Ник без @<input type="text" data-igin="b:handle" value="${E(b.handle)}"></label></div>
    <label class="f">Категория<input type="text" data-igin="b:cat" value="${E(b.cat)}"></label><label class="f">Описание профиля<textarea rows="3" data-igin="b:bio">${E(b.bio)}</textarea></label><label class="f">Ссылка<input type="text" data-igin="b:link" value="${E(b.link)}" placeholder="например, wa.me/374…"></label>
    <div class="row2"><label class="f">Подписчики<input type="text" data-igin="b:followers" value="${E(b.followers)}"></label><label class="f">Подписки<input type="text" data-igin="b:following" value="${E(b.following)}"></label></div>
    <div class="hd2">Логотип TH</div><div class="seg ig-wide">${[['avatar','На аватаре'],['corner','И знак на постах'],['none','Без логотипа']].map(([k,n])=>`<button data-igx="logo:${k}"${b.logo===k?' class="on"':''}>${n}</button>`).join('')}</div>
    <div class="hd2">Язык подписей</div><div class="seg ig-wide">${LANGS.map(([k,s2,n])=>`<button data-igx="lang:${k}"${s.cap.lang===k?' class="on"':''}>${n}</button>`).join('')}</div></div>`; }
function styleScreen(scr){ const d=IG.draft, l=d||curLook(), edit=!!(d||l.custom);
  scr.innerHTML=`<div class="ig-scr"><div class="ig-head"><div class="ig-ti"><h2>${d?(d.id?'Правка стиля':'Новый стиль по образцу'):'Стиль ленты'}</h2><p class="hint">${d?'Поправьте карточку стиля — она уйдёт в каждый запрос к ИИ и в обработку цвета.':l.custom?'Ваш стиль по образцу. Нажмите «Править», чтобы поменять палитру, описание или цифры обработки.':'Так будут выглядеть все 9 кадров. Цифры обработки применяются одинаково ко всей сетке.'}</p></div>
    <div class="ig-tools">${d?`<button class="btn sm primary ig-b" data-igx="mysave">${I(IC.check)}Сохранить стиль</button><button class="btn sm ig-b" data-igx="draftclose">Отмена</button>`:l.custom?`<button class="btn sm ig-b" data-igx="myedit:${l.id}">${I(IC.wand)}Править</button><button class="btn sm danger ig-b" data-igx="mydel:${l.id}">${I(IC.trash)}Удалить</button>`:''}<button class="btn sm ig-b" data-igx="tofeed">${I(IC.grid)}К ленте</button></div></div>
    <div class="ig-busy"${busyMsg?'':' hidden'}><i class="ig-spin"></i><span>${E(busyMsg)}</span></div>
    <div class="ig-mood"><div class="ig-mtop">${d?`<label class="f ig-nm">Название<input type="text" data-igin="dr:name" value="${E(d.name)}"></label>`:`<div class="ig-lname"><b>${E(l.name)}</b><span>${E(l.ru.desc||l.mood)}</span></div>`}
      <div class="ig-palbig">${l.palette.map((c,i)=>d?`<label style="background:${E(c)}"><input type="color" value="${E(c)}" data-igin="drpal:${i}" aria-label="Цвет ${i+1}"><span>${E(c)}</span></label>`:`<span style="background:${E(c)}"><em style="color:${lumHex(c)>.55?'#2a2622':'#fff'}">${E(c)}</em></span>`).join('')}</div></div>
      <div class="ig-mgrid"><div class="ig-samp">${Array.from({length:9},(_,i)=>`<canvas width="180" height="${S().aspect==='1:1'?180:225}" data-igsamp="${i}"></canvas>`).join('')}</div>
       <div class="ig-facts">${FACTS.map(([k,n])=>`<div class="ig-fact"><small>${n}</small>${d?`<textarea rows="2" data-igin="dr:${k}">${E(d[k])}</textarea>`:`<p>${E(l[k]||'—')}</p>`}</div>`).join('')}</div></div>
      <div class="ig-gr"><div class="hd2">Обработка — одинаковая для всех кадров</div><div class="ig-grs">${GR.map(([k,n,lo,hi])=>{ const v=gNorm(l.grade)[k]; return d?`<label class="ig-sl"><span>${n}</span><input type="range" min="${lo}" max="${hi}" step=".05" value="${v}" data-igin="drg:${k}"><em>${v.toFixed(2)}</em></label>`
        :`<div class="ig-gb"><span>${n}</span><i class="${lo<0?'bi':''}"><b style="${lo<0?(v>=0?`left:50%;width:${v*50}%`:`left:${50+v*50}%;width:${-v*50}%`):`width:${v*100}%`}"></b></i><em>${v>0&&lo<0?'+':''}${v.toFixed(2)}</em></div>`; }).join('')}</div></div></div></div>`;
  sampPaint(scr,l); }
let sampN=0;
async function sampPaint(scr,look){ const my=++sampN, set=IG.set, made=set?set.tiles.filter(t=>t.raw):[], G=gNorm(look.grade), cs=qa('[data-igsamp]',scr);
  for(const t of made) if(!IG.stats[t.id]) try{ IG.stats[t.id]=await tileStats(t); }catch(_){ }
  const T=made.length?harmTargets(Object.fromEntries(made.filter(t=>IG.stats[t.id]).map(t=>[t.id,IG.stats[t.id]])),look,S().harm):{};
  for(const c of cs){ if(my!==sampN) return; const i=+c.dataset.igsamp, W=c.width, H=c.height, g=c.getContext('2d'); const t=made.length?set.tiles.filter(x=>x.raw)[i%made.length]:null;
    try{ if(t) drawCover(g,await loadImg(t.raw),W,H,t.crop); else sampleScene(g,W,H,look,i); const id=g.getImageData(0,0,W,H); gradePixels(id,W,H,{h:t?T[t.id]:null,pre:t?preLUT(t.adj):null,lut:buildLUT(G),sat:G.sat,vig:G.vignette,grain:G.grain*.5,seed:i+3}); g.putImageData(id,0,0); }catch(_){ } await sleep(0); } }
function sampleScene(g,W,H,look,i){ const P=look.palette.slice().sort((a,b)=>lumHex(b)-lumHex(a)), dark=look.id==='moody'||lumHex(P[2]||P[0])<.3, r=rng(i*97+5), A=look.palette[4]||look.palette[2]||'#a33';
  const bg=g.createLinearGradient(0,0,W,H); bg.addColorStop(0,dark?P[P.length-2]||P[0]:P[0]); bg.addColorStop(1,dark?P[P.length-1]:P[1]||P[0]); g.fillStyle=bg; g.fillRect(0,0,W,H);
  const sh=(f)=>{ g.save(); g.shadowColor=dark?'rgba(0,0,0,.6)':'rgba(60,40,25,.32)'; g.shadowBlur=W*.06; g.shadowOffsetX=W*.02; g.shadowOffsetY=W*.03; f(); g.restore(); };
  const k=i%3, w=W*(k===1?.5:.68), h=w*.68, cx=W*(.5+(r()-.5)*.2), cy=H*(.5+(r()-.5)*.18), rot=(r()-.5)*.3;
  g.save(); g.translate(cx,cy); g.rotate(rot); sh(()=>{ g.fillStyle=dark?'#efe6d6':'#fbf8f2'; g.fillRect(-w/2,-h/2,w,h); }); g.strokeStyle='rgba(0,0,0,.12)'; g.lineWidth=1; g.beginPath(); g.moveTo(-w/2,-h/2); g.lineTo(0,h*.08); g.lineTo(w/2,-h/2); g.stroke();
  sh(()=>{ g.fillStyle=A; g.beginPath(); g.arc(0,h*.08,w*.09,0,Math.PI*2); g.fill(); }); g.restore();
  g.strokeStyle=look.palette[3]||'#776'; g.lineWidth=2; g.beginPath(); g.moveTo(W*.05,H*(.85+r()*.1)); g.quadraticCurveTo(W*.25,H*.8,W*.42,H*.95); g.stroke(); }
async function refFiles(files){ files=[...(files||[])].filter(f=>/^image\//.test(f.type)); for(const f of files){ if(IG.refs.length>=6) break; try{ IG.refs.push(await shrink(await KS.readImage(f,1600),1024,'image/jpeg',.86)); }catch(_){ } } paintAll(); if(files.length) KS.toast('Образцов: '+IG.refs.length+' из 6'); }
function nearestLook(pal){ const lab=h=>rgb2lab(...hex2rgb(h)), A=pal.map(lab); let best=LOOKS0[0],bv=1e9; for(const l of lookList()){ const B=l.palette.map(lab); let v=0; A.forEach(a=>{ v+=Math.min(...B.map(b=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]))); }); if(v<bv){ bv=v; best=l; } } return best; }
async function refsLocal(){ const cells=[]; for(const r of IG.refs) cells.push(await cellStats(r)); let cols=[]; for(const r of IG.refs){ try{ cols=cols.concat(await dzExtract(r)); }catch(_){ } }
  cols=[...new Set(cols.map(c=>String(c).toLowerCase()))].filter(c=>/^#[0-9a-f]{6}$/.test(c)); const pick=[]; cols.sort((a,b)=>lumHex(b)-lumHex(a)).forEach(c=>{ const l=rgb2lab(...hex2rgb(c)); if(pick.every(p=>{ const m=rgb2lab(...hex2rgb(p)); return Math.hypot(l[0]-m[0],l[1]-m[1],l[2]-m[2])>14; })) pick.push(c); });
  const pal=(pick.length>=3?pick:cells.map(c=>c.hex)).slice(0,6), av=f=>cells.reduce((a,c)=>a+f(c),0)/cells.length, L=av(c=>c.L), ch=av(c=>Math.hypot(c.a,c.b)), bb=av(c=>c.b);
  const near=nearestLook(pal); return {name:'Мой стиль',palette:pal.length?pal:near.palette.slice(),surfaces:near.surfaces,props:near.props,light:near.light,angles:near.angles,mood:near.mood,lens:near.lens,ru:Object.assign({},near.ru,{desc:'По образцу · основа «'+near.name+'»'}),
    grade:{temp:clamp(bb/30,-.6,.6),tint:0,contrast:clamp((av(c=>c.busy)-6)/20,-.3,.3),lift:clamp((L-45)/120,0,.3),fade:L>70?.1:.05,sat:clamp((ch-18)/40,-.5,.3),grain:.2,vignette:L<45?.3:.12,curve:L<45?'matte':'soft'}}; }
async function analyze(ai){ if(!IG.refs.length){ KS.toast('Добавьте 1–6 фото-образцов'); return; } let d=null;
  if(ai){ if(!(KS.neuro&&KS.neuro.vision&&KS.neuro.hasGemini&&KS.neuro.hasGemini())){ KS.toast('Разбор стиля делает Gemini — добавьте ключ Gemini. Пока взял цвета без ИИ.'); if(KS.neuro&&KS.neuro.settings&&!KS.neuro.hasKey()) KS.neuro.settings(); ai=false; } }
  setBusy(ai?'Gemini разбирает стиль…':'Беру цвета из фото…'); paintAll();
  try{ const base=await refsLocal(); d=base;
    if(ai){ const j=parseJSON(await KS.neuro.vision(IG.refs,VPROMPT(IG.refs.length),{json:true})); if(!j) throw new Error('Gemini ответил не по формату — взял цвета без ИИ');
      const pal=(Array.isArray(j.palette)?j.palette:[]).map(String).filter(c=>/^#?[0-9a-f]{6}$/i.test(c)).map(c=>c[0]==='#'?c:'#'+c);
      d={name:String(j.name||'Мой стиль').slice(0,40),palette:pal.length>=3?pal.slice(0,6):base.palette,surfaces:txt(j.surfaces)||base.surfaces,props:txt(j.props)||base.props,light:txt(j.light)||base.light,angles:txt(j.angles)||base.angles,mood:txt(j.mood)||base.mood,lens:txt(j.lens)||base.lens,
        ru:{desc:String(j.ru||'').slice(0,90)||'Стиль по образцу',surf:txt(j.ru_surf)||base.ru.surf,props:txt(j.ru_props)||base.ru.props,light:txt(j.ru_light)||base.ru.light},grade:Object.assign({},base.grade,gNorm(Object.assign({},base.grade,j.grade||{})))}; } }
  catch(e){ KS.toast((e&&e.message)||'Не получилось разобрать'); } finally{ setBusy(''); }
  if(d){ IG.draft=Object.assign(d,{refs:IG.refs.slice()}); KS.show('insta','igstyle'); paintAll(); KS.toast(ai?'Карточка стиля готова — проверьте и сохраните':'Цвета взяты из фото — допишите детали и сохраните'); } }
async function mySave(){ const d=IG.draft; if(!d) return; const s=S(), id=d.id||'my'+Date.now().toString(36), refs=[];
  for(let i=0;i<(d.refs||[]).length;i++){ const k='ig:ref:'+id+':'+i; if(/^ig:/.test(d.refs[i])){ refs.push(d.refs[i]); continue; } try{ await DB.set(k,{src:d.refs[i]}); refs.push(k); }catch(_){ } }
  const rec={id,name:d.name||'Мой стиль',palette:d.palette,surfaces:d.surfaces,props:d.props,light:d.light,angles:d.angles,mood:d.mood,lens:d.lens,ru:d.ru,grade:gNorm(d.grade),refs};
  const i=s.my.findIndex(x=>x.id===id); if(i>=0) s.my[i]=rec; else s.my.unshift(rec); s.look=id; IG.draft=null; IG.refs=[]; KS.save(); restyle(); paintAll(); KS.toast('Стиль «'+rec.name+'» сохранён и выбран'); }
async function myDel(id){ const s=S(), l=s.my.find(x=>x.id===id); if(!l) return; if(!confirm('Удалить стиль «'+l.name+'»?')) return; (l.refs||[]).forEach(k=>DB.del(k)); s.my=s.my.filter(x=>x.id!==id); if(s.look===id) s.look=lookList()[0].id; KS.save(); restyle(); paintAll(); }
/* new look for the set: re-plan descriptions, regrade made frames */
async function restyle(){ const set=IG.set; if(!set) return; set.look=S().look; set.tiles.forEach(t=>{ if(!t.img) tileDesc(t); }); setSave(); if(set.tiles.some(t=>t.raw)&&!IG.run){ setBusy('Применяю обработку стиля ко всем кадрам…'); await gradeAll(); setBusy(''); thumbMake(); } paintAll(); }

/* ===== «Подписи»: captions, hashtags, alt text, carousel ideas, 9-day plan ===== */
function panCap(box){ const c=S().cap, gem=!!(KS.neuro&&KS.neuro.hasGemini&&KS.neuro.hasGemini()), set=IG.set, has=set.tiles.some(t=>t.cap);
  box.innerHTML=`<div class="card"><div class="hd"><span class="ig-ht">${I(IC.text)}Подписи</span></div>
    <div class="ig-row2"><span class="hint">Язык</span><div class="seg">${LANGS.map(([k,s2,n])=>`<button data-igx="lang:${k}"${c.lang===k?' class="on"':''} title="${n}">${s2}</button>`).join('')}</div></div>
    <div class="ig-row2"><span class="hint">Голос бренда</span><div class="seg">${VOICES.map(([k,n])=>`<button data-igx="voice:${k}"${c.voice===k?' class="on"':''}>${n}</button>`).join('')}</div></div>
    <label class="chk"><input type="checkbox" data-igin="cap:emoji"${c.emoji?' checked':''}>Эмодзи в подписях</label>
    <label class="f">Призыв к действию<input type="text" data-igin="captxt:cta" value="${E(c.cta)}" placeholder="${E(CTA0[c.lang]||CTA0.ru)}"></label>
    <label class="chk"><input type="checkbox" data-igin="cap:local"${c.local?' checked':''}>Местные хэштеги: Ереван, Армения</label><label class="chk"><input type="checkbox" data-igin="cap:niche"${c.niche?' checked':''}>Нишевые: сургуч, конверты, открытки</label>
    <label class="f">Свои хэштеги — в каждый пост<input type="text" data-igin="captxt:extra" value="${E(c.extra)}" placeholder="#${E(S().brand.handle||'вашбренд')}"></label>
    <button class="btn primary ig-big" data-igx="capai">${I(IC.spark)}${has?'Переписать':'Написать'} подписи${gem?' (Gemini)':''}</button>
    <p class="hint">${gem?'Текст почти бесплатный (меньше $0,01 за все 9). ':'Без ключа Gemini подписи собираются из шаблонов. '}Подписи, хэштеги и альтернативный текст — для каждого поста, плюс идеи для каруселей.</p>
    ${gem?`<button class="btn sm ig-b" data-igx="caplocal">По шаблонам, без ИИ</button>`:''}</div>
   <div class="card"><div class="hd"><span class="ig-ht">${I(IC.cal)}План публикаций</span></div><div class="row2"><label class="f">Первый пост<input type="date" data-igin="captxt:start" value="${E(startISO())}"></label><label class="f">Время<input type="time" data-igin="captxt:time" value="${E(c.time||'19:00')}"></label></div>
    <p class="hint">По одному посту в день, начиная с нижнего правого кадра — так сетка в профиле сложится как в превью.</p></div>
   <div class="card"><div class="hd"><span class="ig-ht">${I(IC.dl)}Экспорт</span></div><div class="flexw"><button class="btn sm primary ig-b" data-igx="zip"${set.tiles.some(t=>t.img)?'':' disabled'}>${I(IC.zip)}Скачать все (ZIP)</button><button class="btn sm ig-b" data-igx="txt">captions.txt</button><button class="btn sm ig-b" data-igx="copyall">${I(IC.copy)}Скопировать всё</button></div>
    <p class="hint">В архиве 9 JPG 1080 px, названных по порядку публикации, превью сетки и captions.txt с датами.</p></div>`; }
function capScreen(scr){ const set=IG.set, c=S().cap, has=set.tiles.some(t=>t.cap), time=c.time||'19:00';
  scr.innerHTML=`<div class="ig-scr"><div class="ig-head"><div class="ig-ti"><h2>Подписи и план</h2><p class="hint">9 постов по дням публикации · ${E((LANGS.find(l=>l[0]===c.lang)||LANGS[0])[2])} · с ${E(dayLabel(1))}, ${E(time)}</p></div>
    <div class="ig-tools"><button class="btn sm ig-b" data-igx="tofeed">${I(IC.grid)}К ленте</button><button class="btn sm primary ig-b" data-igx="capai">${I(IC.spark)}${has?'Переписать':'Написать'} подписи</button></div></div>
    <div class="ig-busy"${busyMsg?'':' hidden'}><i class="ig-spin"></i><span>${E(busyMsg)}</span></div>
    ${has?'':`<div class="ks-empty ig-empty">${I(IC.text)}<b>Подписей пока нет</b><span>Нажмите «Написать подписи» — получите текст, хэштеги и описание фото для каждого из 9 постов в одном голосе бренда.</span></div>`}
    <div class="ig-caps">${[...Array(9).keys()].map(i=>{ const d=i+1, p=posOfDay(d), t=set.tiles[p]; if(!t) return ''; const cp=t.cap||{text:'',tags:[],alt:''}, len=capFull(t).length, look=lookById(set.look)||curLook();
      return `<div class="ig-capr" data-igt="${t.id}"><div class="ig-capl"><button class="ig-capimg" data-igx="open:${t.id}" style="background:${lookBg(look,p)}">${t.img?`<img src="${E(urlOf(t.img))}" alt="">`:I(SHOT_IC[t.shot]||SHOT_IC.flat)}</button><b>День ${d}</b><small>${E(dayLabel(d))}, ${E(time)}</small><small>кадр ${p+1} · ${E((SHOTS[t.shot]||SHOTS.flat).ru)}</small></div>
        <div class="ig-capm"><textarea rows="6" data-igin="pcap:${t.id}" placeholder="Подпись к посту">${E(cp.text)}</textarea><input type="text" data-igin="ptags:${t.id}" value="${E((cp.tags||[]).join(' '))}" placeholder="#хэштеги"><input type="text" data-igin="palt:${t.id}" value="${E(cp.alt||'')}" placeholder="Альтернативный текст"></div>
        <div class="ig-capa"><button class="btn sm ig-b" data-igx="copy:${t.id}">${I(IC.copy)}Копировать</button><span class="hint${len>2200?' bad':''}" data-igcnt="${t.id}">${len} / 2200 · ${(cp.tags||[]).length} / 30 #</span></div></div>`; }).join('')}</div>
    ${set.carousel&&set.carousel.length?`<div class="card ig-car"><div class="hd"><span class="ig-ht">${I(IC.grid)}Идеи для каруселей</span></div><div class="ig-cars">${set.carousel.map(x=>`<div class="ig-cari"><b>${E(x.title)}</b><ol>${x.slides.map(s=>`<li>${E(s)}</li>`).join('')}</ol></div>`).join('')}</div></div>`:''}</div>`; }
async function copyText(s){ try{ await navigator.clipboard.writeText(s); return true; }catch(_){ const a=document.createElement('textarea'); a.value=s; a.style.cssText='position:fixed;opacity:0;left:-9999px'; document.body.appendChild(a); a.select(); let ok=false; try{ ok=document.execCommand('copy'); }catch(__){ } a.remove(); return ok; } }

/* ===== wiring: actions, inputs, drag & drop of files, tabs, commands ===== */
const tileOf=id=>IG.set&&IG.set.tiles.find(t=>t.id===id);
const ACT={
  key:()=>{ if(KS.neuro&&KS.neuro.settings) KS.neuro.settings(); else KS.toast('Модуль ИИ не подключён'); },
  pick:async()=>srcFiles(await KS.pick('image/*',true)), lib:libPick, app:appPick, kindai:kindAI,
  srcoff:id=>{ const s=srcById(id); if(!s) return; s.off=!s.off; srcSave(); srcChanged(); },
  srcdel:async id=>{ const s=srcById(id); if(!s) return; if(!confirm('Удалить фото «'+s.name+'» из исходников?')) return; await srcDel(id); },
  mode:v=>{ S().mode=v==='free'?'free':'ai'; KS.save(); paintAll(); },
  ax:v=>{ S().aspect=v==='1:1'?'1:1':'4:5'; KS.save(); if(IG.set){ IG.set.aspect=S().aspect; if(IG.set.tiles.some(t=>t.raw)&&!IG.run){ setBusy('Перекадрирую под '+S().aspect+'…'); paintAll(); gradeAll().then(()=>{ setBusy(''); thumbMake(); paintAll(); }); return; } } paintAll(); },
  tostyle:()=>KS.show('insta','igstyle'), tofeed:()=>KS.show('insta','igfeed'), tocap:()=>KS.show('insta','igcap'),
  go:()=>{ const set=IG.set, made=set.tiles.filter(t=>t.img).length, left=set.tiles.filter(t=>!t.img&&!t.locked).map(t=>t.id); if(made&&left.length) return generate(left,{confirm:!set.tiles.filter(t=>!t.img&&!t.locked).every(t=>t.status==='err')}); if(made&&!confirm('Создать все 9 постов заново? Закреплённые кадры останутся.')) return; return generate(null); },
  stop:()=>{ if(IG.run){ IG.run.stop=true; KS.toast('Останавливаю: дорисую начатые кадры'); } },
  retryall:()=>generate(IG.set.tiles.filter(t=>t.status==='err').map(t=>t.id),{confirm:false}),
  retry:id=>generate([id],{confirm:false}), regen:id=>{ const t=tileOf(id); if(t&&t.locked){ KS.toast('Кадр закреплён'); return; } return generate([id],{confirm:false}); },
  zip:exportZip, hopen:setOpen,
  new:()=>setNew(),
  hdel:async id=>{ const h=S().hist.find(x=>x.id===id); if(!h||!confirm('Удалить набор «'+h.name+'» из истории?')) return; await setDelete(id); paintAll(); },
  view:v=>{ IG.view=v==='plan'?'plan':'profile'; IG.swap=null; paintAll(); },
  phone:()=>{ S().phone=!S().phone; KS.save(); paintAll(); },
  swap:()=>{ IG.swap=IG.swap?null:{first:null}; paintAll(); },
  harmfix:async()=>{ const s=S(); s.harm=clamp((+s.harm||.75)+.12,.3,1); KS.save(); setBusy('Выравниваю цвет…'); await gradeAll(); setBusy(''); await harmonyCalc(); thumbMake(); paintAll(); KS.toast('Цвет выровнен (сила '+Math.round(s.harm*100)+'%)'); },
  balance:async()=>{ await harmonyCalc(); const n=arrangeBalance(); if(n){ thumbMake(); paintAll(); KS.toast('Кадры переставлены: свет и ритм чередуются'); } else KS.toast('Порядок уже сбалансирован'); },
  oldadd:async()=>oldAdd(await KS.pick('image/*',true)), olddel:async id=>{ IG.old=IG.old.filter(o=>o.id!==id); await DB.set('ig:old',IG.old); paintAll(); },
  oldclear:async()=>{ if(!confirm('Убрать все старые посты из превью?')) return; IG.old=[]; await DB.set('ig:old',[]); paintAll(); },
  shuffle:()=>{ const set=IG.set; if(set.tiles.every(t=>t.img||t.locked)){ KS.toast('Все кадры готовы или закреплены'); return; } planMake((set.seed||0)+1+Math.floor(Math.random()*997),true); setSave(); paintAll(); KS.toast('Новый вариант плана'); },
  lock:id=>{ const t=tileOf(id); if(!t) return; t.locked=!t.locked; setSave(); paintAll(); if(POST.open&&POST.id===id) postRender(); },
  open:id=>{ if(tileOf(id)) postOpen(id); }, srcpick:srcPick,
  own:async id=>{ const t=tileOf(id); if(!t) return; const [f]=await KS.pick('image/*',false); if(!f) return; try{ const d=await KS.readImage(f,2400); t.raw=await shrink(d,1600,'image/jpeg',.9); t.own=true; t.free=false; t.status='ok'; t.err=''; t.crop={x:.5,y:.5,z:1}; await putImg(IG.set,t,'raw'); await regradeTile(t); thumbMake(); paintAll(); KS.toast('Своё фото поставлено и обработано в стиле ленты'); }catch(e){ KS.toast('Не получилось открыть фото'); } },
  dl:id=>dlOne(tileOf(id)),
  tax:async v=>{ const t=tileOf(POST.id); if(!t||!t.raw) return; t.ax=v==='1:1'?'1:1':'4:5'; if(t.ax===IG.set.aspect) delete t.ax; t.crop={x:.5,y:.5,z:1}; await regradeTile(t); paintTile(t); },
  mv:v=>{ const set=IG.set, t=tileOf(POST.id); if(!t) return; const p=set.tiles.indexOf(t), j=p+(+v); if(j<0||j>8) return; swapTiles(t.id,set.tiles[j].id); paintAll(); postRender(); },
  nav:v=>{ const set=IG.set, t=tileOf(POST.id); if(!t) return; const j=set.tiles.indexOf(t)+(+v); if(j<0||j>8) return; POST.id=set.tiles[j].id; POST.im=null; postRender(); },
  copy:async id=>{ const t=tileOf(id); if(!t||!t.cap){ KS.toast('Подписи ещё нет'); return; } KS.toast(await copyText(capFull(t))?'Подпись скопирована — вставьте в Instagram':'Не получилось скопировать'); },
  look:id=>{ if(!lookById(id)) return; S().look=id; KS.save(); IG.draft=null; restyle(); KS.toast('Стиль «'+lookById(id).name+'»'); },
  refpick:async()=>refFiles(await KS.pick('image/*',true)), refdel:i=>{ IG.refs.splice(+i,1); paintAll(); },
  analyze:()=>analyze(true), analyzelocal:()=>analyze(false), mysave:mySave, mydel:myDel,
  myedit:id=>{ const l=myLooks().find(x=>x.id===id); if(!l) return; IG.draft=JSON.parse(JSON.stringify(Object.assign({},l,{grade:gNorm(l.grade)}))); paintAll(); },
  draftclose:()=>{ IG.draft=null; paintAll(); },
  logo:v=>{ S().brand.logo=['avatar','corner','none'].includes(v)?v:'avatar'; KS.save(); if(IG.set.tiles.some(t=>t.raw)&&!IG.run){ setBusy('Обновляю знак на постах…'); paintAll(); gradeAll().then(()=>{ setBusy(''); paintAll(); }); } else paintAll(); },
  lang:v=>{ S().cap.lang=LANGS.some(l=>l[0]===v)?v:'ru'; KS.save(); paintAll(); }, voice:v=>{ S().cap.voice=v; KS.save(); paintAll(); },
  capai:async()=>{ setBusy('Пишу подписи…'); paintAll(); const ai=!!(KS.neuro&&KS.neuro.hasGemini&&KS.neuro.hasGemini()); try{ await capsMake(ai); KS.toast(ai?'Подписи готовы — проверьте и поправьте':'Подписи собраны по шаблонам'); }finally{ setBusy(''); paintAll(); } },
  caplocal:async()=>{ await capsMake(false); paintAll(); KS.toast('Подписи по шаблонам готовы'); },
  txt:async()=>{ if(!IG.set.tiles.some(t=>t.cap)) await capsMake(false); await KS.download('captions.txt',new Blob(['﻿'+captionsTxt()],{type:'text/plain;charset=utf-8'})); },
  copyall:async()=>{ if(!IG.set.tiles.some(t=>t.cap)) await capsMake(false); KS.toast(await copyText(captionsTxt())?'Все подписи и план скопированы':'Не получилось скопировать'); }};
const IN={
  setname:el=>{ IG.set.name=el.value.slice(0,60)||'Лента'; setSave(); },
  desc:(el,id)=>{ const t=tileOf(id); if(!t) return; t.desc=el.value; t.auto=false; IG.set.edited=true; setSave(); },
  b:(el,k)=>{ const b=S().brand; if(!(k in b)) return; b[k]=k==='handle'?el.value.replace(/^@+/,'').replace(/\s+/g,''):el.value; KS.save(); profSoon(); },
  captxt:(el,k)=>{ S().cap[k]=el.value; KS.save(); if(k==='start'||k==='time') capSoon(); },
  pcap:(el,id)=>{ const t=tileOf(id); if(!t) return; t.cap=t.cap||{text:'',tags:[],alt:''}; t.cap.text=el.value; setSave(); capCount(t); },
  ptags:(el,id)=>{ const t=tileOf(id); if(!t) return; t.cap=t.cap||{text:'',tags:[],alt:''}; t.cap.tags=el.value.split(/[\s,]+/).filter(Boolean).map(x=>x[0]==='#'?x:'#'+x); setSave(); capCount(t); },
  palt:(el,id)=>{ const t=tileOf(id); if(!t) return; t.cap=t.cap||{text:'',tags:[],alt:''}; t.cap.alt=el.value; setSave(); },
  dr:(el,k)=>{ if(!IG.draft) return; IG.draft[k]=el.value; if(k==='name') IG.draft.name=el.value.slice(0,40); },
  drpal:(el,i)=>{ if(!IG.draft) return; IG.draft.palette[+i]=el.value; const lb=el.closest('label'); if(lb){ lb.style.background=el.value; const sp=lb.querySelector('span'); if(sp) sp.textContent=el.value; } sampSoon(); },
  drg:(el,k)=>{ if(!IG.draft) return; IG.draft.grade=Object.assign({},IG.draft.grade,{[k]:+el.value}); const em=el.parentElement.querySelector('em'); if(em) em.textContent=(+el.value).toFixed(2); sampSoon(); },
  zoom:async(el,id)=>{ const t=tileOf(id); if(!t||!t.raw) return; t.crop=Object.assign({x:.5,y:.5,z:1},t.crop,{z:+el.value}); const f=q(`[data-igframe="${id}"]`); if(f){ try{ await rawFor(t); const r=f.getBoundingClientRect(); cropPlace(t,f,r.width,r.height); }catch(_){ } } adjLive(t); },
  adj:(el,v)=>{ const [k,id]=v.split(':'), t=tileOf(id); if(!t) return; t.adj=Object.assign({exp:0,warm:0,str:1},t.adj,{[k]:+el.value}); adjLive(t); }};
const CH={
  kind:(el,id)=>{ const s=srcById(id); if(!s) return; s.kind=el.value; srcSave(); IG.set.tiles.forEach(t=>{ if(t.src.includes(id)&&!t.img) tileDesc(t); }); setSave(); if(activeId()==='igfeed'&&IG.view==='plan') paintAll(); },
  shot:(el,id)=>{ const t=tileOf(id); if(!t||!SHOTS[el.value]) return; t.shot=el.value; t.auto=true; IG.set.edited=true; if(t.shot==='group'&&t.src.length<2){ const more=srcOn().filter(s=>!t.src.includes(s.id)).slice(0,2).map(s=>s.id); t.src=t.src.concat(more); } if(t.shot!=='group') t.src=t.src.slice(0,1); tileDesc(t); setSave(); paintAll(); },
  order:el=>{ S().order=el.checked; KS.save(); paintAll(); },
  cap:(el,k)=>{ S().cap[k]=el.checked; KS.save(); }};
let profT=0, capT=0, sampT=0;
const profSoon=()=>{ clearTimeout(profT); profT=setTimeout(()=>{ const p=q('.ig-prof'); if(p&&activeId()==='igfeed'){ const w=document.createElement('div'); w.innerHTML=profileHTML(); p.replaceWith(w.firstChild); } },250); };
const capSoon=()=>{ clearTimeout(capT); capT=setTimeout(()=>{ const scr=scrOf('igcap'); if(scr) igKeep(scr,()=>capScreen(scr)); },400); };
const sampSoon=()=>{ clearTimeout(sampT); sampT=setTimeout(()=>{ const scr=scrOf('igstyle'); if(scr&&IG.draft) sampPaint(scr,normLook(Object.assign({},IG.draft))); },160); };
function capCount(t){ const el=q(`[data-igcnt="${t.id}"]`); if(el){ const n=capFull(t).length; el.textContent=`${n} / 2200 · ${(t.cap.tags||[]).length} / 30 #`; el.classList.toggle('bad',n>2200); } }
const MYZ='[data-ksscreen="insta:igfeed"],[data-ksscreen="insta:igstyle"],[data-ksscreen="insta:igcap"]';
const mine=el=>!!(el&&el.closest&&(el.closest(MYZ+',#ksm-igpost,#ksm-igpick')||(activeId()&&el.closest('[data-panel="ks-insta"]'))));
document.addEventListener('click',e=>{ const b=e.target.closest&&e.target.closest('[data-igx]'); if(b&&mine(b)){ if(b.disabled) return; const i=b.dataset.igx.indexOf(':'), k=i<0?b.dataset.igx:b.dataset.igx.slice(0,i), v=i<0?'':b.dataset.igx.slice(i+1), f=ACT[k]; if(!f) return; e.preventDefault();
    try{ const r=f(v,b,e); if(r&&r.catch) r.catch(err=>{ console.error('[insta]',err); KS.toast((err&&err.message)||'Ошибка'); }); }catch(err){ console.error('[insta]',err); KS.toast((err&&err.message)||'Ошибка'); } return; }
  const c=e.target.closest&&e.target.closest('.ig-grid .ig-cell[data-igt]'); if(!c||e.target.closest('button')) return; if(Date.now()-dragJust<350) return; const id=c.dataset.igt;
  if(IG.swap){ if(!IG.swap.first){ IG.swap.first=id; qa('.ig-cell.sel').forEach(x=>x.classList.remove('sel')); c.classList.add('sel'); return; } if(IG.swap.first===id){ IG.swap.first=null; c.classList.remove('sel'); return; } swapTiles(IG.swap.first,id); IG.swap.first=null; paintAll(); KS.toast('Кадры поменялись местами'); return; }
  postOpen(id); });
document.addEventListener('keydown',e=>{ if(!POST.open||!POST.m||POST.m.root.hidden) return; if(/INPUT|TEXTAREA|SELECT/.test((e.target&&e.target.tagName)||'')) return; if(e.key==='ArrowLeft'){ e.preventDefault(); ACT.nav('-1'); } if(e.key==='ArrowRight'){ e.preventDefault(); ACT.nav('1'); } });
document.addEventListener('keydown',e=>{ if(e.key!=='Enter'&&e.key!==' ') return; const c=e.target.closest&&e.target.closest('.ig-grid .ig-cell[data-igt],.ig-drop[data-igx]'); if(!c||!mine(c)) return; e.preventDefault(); c.click(); });
document.addEventListener('input',e=>{ const el=e.target, k=el&&el.dataset&&el.dataset.igin; if(!k||el.tagName==='SELECT'||el.type==='checkbox') return; const i=k.indexOf(':'), a=i<0?k:k.slice(0,i), v=i<0?'':k.slice(i+1); if(IN[a]) try{ IN[a](el,v,e); }catch(err){ console.error('[insta]',err); } });
document.addEventListener('change',e=>{ const el=e.target, k=el&&el.dataset&&el.dataset.igin; if(!k) return; const i=k.indexOf(':'), a=i<0?k:k.slice(0,i), v=i<0?'':k.slice(i+1); if(CH[a]) try{ CH[a](el,v,e); }catch(err){ console.error('[insta]',err); } });
/* files dropped on the section: product photos (or style examples on «Стиль», old posts on their card) */
['dragenter','dragover','dragleave','drop'].forEach(type=>document.addEventListener(type,e=>{ if(!activeId()) return; const zone=e.target.closest&&e.target.closest('[data-panel="ks-insta"],'+MYZ); if(!zone) return; const dt=e.dataTransfer; if(!dt||![...(dt.types||[])].includes('Files')) return;
  e.preventDefault(); e.stopPropagation(); if(type==='dragenter'||type==='dragover'){ qa('.ig-drop').forEach(x=>x.classList.toggle('over',zone.contains(x))); return; } if(type==='dragleave'){ if(!zone.contains(e.relatedTarget)) qa('.ig-drop.over').forEach(x=>x.classList.remove('over')); return; }
  qa('.ig-drop.over').forEach(x=>x.classList.remove('over')); const files=[...(dt.files||[])]; if(!files.length) return; const id=activeId();
  if(e.target.closest('.ig-oldc,.ig-addold')) oldAdd(files); else if(id==='igstyle') refFiles(files); else srcFiles(files); },true));

/* ---- tabs (group «Instagram»; instamock adds «Мокапы» to the same group) ---- */
const PANEL={igfeed:panFeed,igstyle:panStyle,igcap:panCap}, SCREEN={igfeed:feedScreen,igstyle:styleScreen,igcap:capScreen};
function keyRefresh(){ const k=q('[data-panel="ks-insta"] .ig-key'); if(k&&!k.contains(document.activeElement)){ const w=document.createElement('div'); w.innerHTML=keyCard(); const n=w.firstChild; if(n.innerHTML!==k.innerHTML) k.replaceWith(n); } }
const mk=id=>(box,o)=>{ if(o.reason!=='show'&&box.firstChild&&box.dataset.igv===id) return; box.dataset.igv=id;
  if(!IG.ready){ box.innerHTML='<div class="ks-empty">Загружаю Instagram…</div>'; if(o.screen) o.screen.innerHTML='<div class="ig-scr"><div class="ig-busy"><i class="ig-spin"></i><span>Загружаю…</span></div></div>'; ensure().then(()=>{ if(activeId()===id){ paintAll(); if(id==='igfeed') pickPending(); } }); return; }
  PANEL[id](box); if(o.screen) SCREEN[id](o.screen); if(id==='igfeed') setTimeout(pickPending,200); };
const ICON=I(IC.ig);
KS.tab({id:'igfeed',group:'insta',groupTitle:'Instagram',groupIcon:ICON,icon:ICON,title:'Instagram',seg:'Лента',app:'print',before:'prep',screen:true,render:mk('igfeed')});
KS.tab({id:'igstyle',group:'insta',groupTitle:'Instagram',groupIcon:ICON,icon:ICON,title:'Стиль ленты',seg:'Стиль',app:'print',before:'prep',screen:true,render:mk('igstyle')});
KS.tab({id:'igcap',group:'insta',groupTitle:'Instagram',groupIcon:ICON,icon:ICON,title:'Подписи',seg:'Подписи',app:'print',before:'prep',screen:true,render:mk('igcap')});
/* our sub-tabs first («Лента» is the default), whoever registered the group first */
function segFix(){ const seg=q('[data-panel="ks-insta"] .ksseg'); if(!seg) return; const btns=[...seg.children], key=b=>{ const i=MY.indexOf(String(b.dataset.kssub||'').split(':')[1]); return i<0?9:i; }, s=btns.slice().sort((a,b)=>key(a)-key(b)); if(s.some((b,i)=>b!==btns[i])) s.forEach(b=>seg.appendChild(b)); }
{ const pe=q('[data-panel="ks-insta"]'); if(pe&&window.MutationObserver) new MutationObserver(segFix).observe(pe,{childList:true}); }
KS.on('boot',()=>{ try{ const u=st.ui.ksSub||{}; if(!u.insta) st.ui.ksSub=Object.assign({},u,{insta:'igfeed'}); }catch(_){ } segFix(); });
KS.on('neuroKey',()=>{ if(activeId()==='igfeed') keyRefresh(); else if(activeId()) paintPanel(); });
KS.on('render',()=>{ if(activeId()==='igfeed') keyRefresh(); });
KS.on('screenHide',k=>{ if(k==='insta:igstyle'&&IG.draft){ /* keep the draft until saved or cancelled */ } });

/* ---- ⌘K ---- */
const go=async(sub,fn)=>{ KS.show('insta',sub); await ensure(); if(fn) await fn(); };
KS.cmd('Instagram: лента и превью профиля','instagram',()=>go('igfeed'));
KS.cmd('Instagram: создать 9 постов в одном стиле','instagram',()=>go('igfeed',()=>generate(null)));
KS.cmd('Instagram: план ленты 3×3','instagram',()=>{ IG.view='plan'; go('igfeed',()=>paintAll()); });
KS.cmd('Instagram: добавить фото изделий','instagram',()=>go('igfeed',async()=>srcFiles(await KS.pick('image/*',true))));
KS.cmd('Instagram: стиль ленты','instagram',()=>go('igstyle'));
KS.cmd('Instagram: мой стиль по образцу','instagram',()=>go('igstyle',async()=>refFiles(await KS.pick('image/*',true))));
KS.cmd('Instagram: подписи, хэштеги и план публикаций','instagram',()=>go('igcap'));
KS.cmd('Instagram: скачать все посты (ZIP)','instagram',()=>go('igfeed',exportZip));
KS.cmd('Instagram: новая лента','instagram',()=>go('igfeed',setNew));
KS.insta={open:sub=>KS.show('insta',sub||'igfeed'),ensure,generate,exportZip,looks:lookList,state:IG,plan:planMake,harmony:harmonyCalc,captions:capsMake,prompt:buildPrompt};

/* ===== mockups from instamock («Мокапы» → «В ленту»): KS.insta.addPosts(items) and pick-up of items saved while «Лента» was closed =====
   item = {id, src: JPEG dataURL, name, look, scene, w, h, from:'instamock', added} */
const shotOfScene=sc=>{ for(const [k,L] of Object.entries(SCN)) if(L.includes(sc)) return k; return null; };
let placeM=null;
/* not enough empty frames: choose which frames to replace, or start a new set */
function askPlace(items){ return new Promise(res=>{ placeM=placeM||KS.modal({id:'igplace',title:'',wide:true}); const set=IG.set, N=items.length, look=lookById(set.look)||curLook(), sel=new Set();
  set.tiles.forEach(t=>{ if(sel.size<N&&!t.img&&!t.locked&&t.status!=='run') sel.add(t.id); }); set.tiles.forEach(t=>{ if(sel.size<N&&t.img&&!t.locked&&t.status!=='run') sel.add(t.id); });
  placeM.title(`Куда поставить ${N} ${plural(N,'мокап','мокапа','мокапов')}?`);
  const draw=()=>{ placeM.el.innerHTML=`<div class="ig-ask"><div><p class="hint">Пустых кадров не хватает. Отметьте, какие кадры заменить (${sel.size} из ${N}), или сделайте из этих фото новую ленту — текущая сохранится в истории.</p>
    <div class="ig-askg">${set.tiles.map((t,p)=>{ const can=!t.locked&&t.status!=='run'; return `<button class="ig-aq ig-pl${sel.has(t.id)?' on':''}" data-igpl="${t.id}"${can?'':' disabled'}><span class="ig-aqi" style="background:${lookBg(look,p)}">${t.img?`<img src="${E(urlOf(t.img))}" alt="">`:I(SHOT_IC[t.shot]||SHOT_IC.flat)}${sel.has(t.id)?`<i class="ig-plk">${I(IC.check)}</i>`:''}</span><b>${p+1}. ${t.locked?'закреплён':t.img?'заменить':'пустой'}</b></button>`; }).join('')}</div></div>
    <div class="ig-asks"><div class="ig-pk ig-plin">${items.map(x=>`<span class="ig-pki"><img src="${E(urlOf(x.src))}" alt=""><span>${E(x.name||'Мокап')}</span></span>`).join('')}</div>
      <div class="flexw"><button class="btn primary ig-b" data-igplgo="rep"${sel.size?'':' disabled'}>${I(IC.swap)}Заменить выбранные (${sel.size})</button><button class="btn ig-b" data-igplgo="new">${I(IC.plus)}Новая лента из этих фото</button><button class="btn ig-b" data-igplgo="0">Отмена</button></div></div></div>`; };
  let done=false; const fin=v=>{ if(done) return; done=true; placeM.root.removeEventListener('click',onc,true); placeM.close(); res(v); };
  const onc=e=>{ const g=e.target.closest('[data-igplgo]'); if(g){ e.preventDefault(); const v=g.dataset.igplgo; fin(v==='rep'?{mode:'rep',ids:[...sel]}:v==='new'?{mode:'new'}:null); return; }
    const b=e.target.closest('[data-igpl]'); if(b&&!b.disabled){ e.preventDefault(); const id=b.dataset.igpl; if(sel.has(id)) sel.delete(id); else if(sel.size<N) sel.add(id); else { const first=[...sel][0]; sel.delete(first); sel.add(id); } draw(); return; }
    if(e.target===placeM.root||e.target.closest('[data-ksclose]')) fin(null); };
  draw(); placeM.root.addEventListener('click',onc,true); placeM.open(); }); }
async function placeItems(items,targets){ const set=IG.set, cur=lookById(set.look)||curLook(), curB=bLookId(cur);
  for(let i=0;i<targets.length&&i<items.length;i++){ const t=targets[i], x=items[i];
    t.raw=await shrink(x.src,1600,'image/jpeg',.92); t.status='ok'; t.err=''; t.own=false; t.free=true; t.from='instamock'; t.crop={x:.5,y:.5,z:1};
    t.adj={exp:0,warm:0,str:x.look&&x.look===curB?0:.6}; const sh=shotOfScene(x.scene); if(sh&&!set.tiles.some(o=>o!==t&&o.shot===sh)) t.shot=sh;
    t.desc='Мокап «'+String(x.name||'без названия')+'»'; t.auto=false; delete IG.stats[t.id]; await putImg(set,t,'raw'); }
  await gradeAll(); IG.harm=null; await thumbMake(); await setSave(true); paintAll(); }
async function addPosts(items,o){ o=o||{}; await ensure(); items=[].concat(items||[]).filter(x=>x&&typeof x.src==='string'&&/^data:image\//.test(x.src));
  if(!items.length) return {added:0};
  if(IG.run||IG.fin){ for(const x of items){ const id=x.id||KS.uid('igm'); try{ await KS.idb.set('igm:feed:'+id,Object.assign({},x,{id,added:x.added||Date.now()}),'files'); }catch(_){ } } KS.toast('Лента сейчас создаётся — мокапы добавлю, когда она освободится'); return {added:0,queued:items.length}; }
  let extra=0; if(items.length>9){ extra=items.length-9; items=items.slice(0,9); }
  let set=IG.set; const setId0=set.id, empty=set.tiles.filter(t=>!t.img&&!t.locked&&t.status!=='run'); let targets;
  if(items.length<=empty.length) targets=empty.slice(0,items.length);
  else { /* a complete set of 9 (or an explicit request) becomes a new set — nothing is overwritten; otherwise ask */
    const ch=o.mode==='new'||items.length>=9?{mode:'new',auto:true}:o.mode==='replace'&&Array.isArray(o.ids)?{mode:'rep',ids:o.ids.slice(0,items.length)}:await askPlace(items); if(!ch) return {added:0,cancelled:true};
    if(ch.mode==='new'){ await setNew({silent:true}); set=IG.set; targets=set.tiles.slice(0,items.length); }
    else { targets=ch.ids.map(id=>set.tiles.find(t=>t.id===id)).filter(Boolean); items=items.slice(0,targets.length); } }
  if(!set.tiles.some(t=>t.img&&!targets.includes(t))){ const L=[...new Set(items.map(x=>x.look).filter(Boolean))]; if(L.length===1&&lookById(L[0])&&S().look!==L[0]){ S().look=L[0]; set.look=L[0]; KS.save(); } }
  setBusy('Ставлю мокапы в ленту…'); try{ await placeItems(items,targets); } finally{ setBusy(''); }
  const isNew=set.id!==setId0; if(o.toast!==false||isNew) KS.toast((isNew?'Новая лента из мокапов: ':'В ленте: ')+targets.length+' '+plural(targets.length,'мокап','мокапа','мокапов')+(isNew?' (прежняя — в истории)':'')+(extra?' · лишние '+extra+' не поместились':''));
  return {added:targets.length,set:set.id,tiles:targets.map(t=>t.id),newSet:isNew}; }
/* items saved by instamock while this module could not take them (or while a batch was running) */
let pendBusy=false;
async function pickPending(){ const M=KS.instaMock; if(pendBusy||!M||typeof M.pending!=='function'||IG.run||IG.fin) return 0; pendBusy=true;
  try{ const L=((await M.pending())||[]).filter(x=>x&&x.src); if(!L.length) return 0; const r=await addPosts(L,{toast:false});
    if(r&&(r.added||r.cancelled)) for(const x of L) try{ await KS.idb.del('igm:feed:'+x.id,'files'); }catch(_){ }
    if(r&&r.added) KS.toast('Из «Мокапов» в ленту: '+r.added); return (r&&r.added)||0; }
  catch(e){ console.warn('[insta] pending',e); return 0; } finally{ pendBusy=false; } }
KS.on('igmPosts',()=>{ if(activeId()==='igfeed') setTimeout(pickPending,300); });
Object.assign(KS.insta,{addPosts,pickPending});
