/* «Касса» — POS for the print shop: sale, order payments, shift (X/Z), services price list, documents. */
KS.mod('pos',{title:'Касса'});

/* ---------- icons ---------- */
const ICO={
  reg:KS.icon('<rect x="3.5" y="11" width="17" height="9" rx="2"/><rect x="6.5" y="3.5" width="11" height="5" rx="1.2"/><path d="M12 8.5V11M7.5 14.5h1.5M11.25 14.5h1.5M15 14.5h1.5M7.5 17.3h9"/>'),
  cash:KS.icon('<rect x="2.5" y="6.5" width="19" height="11" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 10v4M18 10v4"/>'),
  card:KS.icon('<rect x="2.5" y="5.5" width="19" height="13" rx="2.2"/><path d="M2.5 10h19M6.5 15h3.5"/>'),
  transfer:KS.icon('<path d="M4 8.5h14.5L15 5M20 15.5H5.5L9 19"/>'),
  debt:KS.icon('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
  plus:KS.icon('<path d="M12 5v14M5 12h14"/>'),
  minus:KS.icon('<path d="M5 12h14"/>'),
  x:KS.icon('<path d="M6 6l12 12M18 6L6 18"/>'),
  star:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3.2l2.6 5.5 6 .7-4.4 4.1 1.2 5.9L12 16.5l-5.4 2.9 1.2-5.9-4.4-4.1 6-.7z"/></svg>',
  staro:KS.icon('<path d="M12 3.2l2.6 5.5 6 .7-4.4 4.1 1.2 5.9L12 16.5l-5.4 2.9 1.2-5.9-4.4-4.1 6-.7z"/>'),
  search:KS.icon('<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>'),
  print:KS.icon('<path d="M7 9V3.5h10V9"/><rect x="3.5" y="9" width="17" height="8" rx="2"/><path d="M7 14h10v6.5H7z"/>'),
  doc:KS.icon('<path d="M14 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5z"/><path d="M14 3.5v5h5M8.5 13h7M8.5 16.5h5"/>'),
  back:KS.icon('<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>'),
  ok:KS.icon('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  grip:KS.icon('<circle cx="9" cy="6" r=".9"/><circle cx="15" cy="6" r=".9"/><circle cx="9" cy="12" r=".9"/><circle cx="15" cy="12" r=".9"/><circle cx="9" cy="18" r=".9"/><circle cx="15" cy="18" r=".9"/>'),
  up:KS.icon('<path d="M6 15l6-6 6 6"/>'),
  down:KS.icon('<path d="M6 9l6 6 6-6"/>'),
  user:KS.icon('<circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20c.8-3.8 3.9-5.8 7.5-5.8s6.7 2 7.5 5.8"/>'),
  inn:KS.icon('<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19.5h14"/>'),
  outt:KS.icon('<path d="M12 15V4M7.5 8.5L12 4l4.5 4.5M5 19.5h14"/>'),
  lock:KS.icon('<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>'),
  unlock:KS.icon('<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 7.6-1.7"/>'),
  order:KS.icon('<rect x="5" y="3.5" width="14" height="17" rx="2"/><path d="M9 3.5v2h6v-2M8.5 11h7M8.5 14.5h7M8.5 18h4"/>'),
  edit:KS.icon('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>'),
  tag:KS.icon('<path d="M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7l8.3 8.3a1 1 0 0 1 0 1.4l-7.3 7.3a1 1 0 0 1-1.4 0z"/><circle cx="8" cy="8" r="1.4"/>'),
  free:KS.icon('<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8.5v7M8.5 12h7"/>')
};

/* ---------- defaults ---------- */
const CATS0=[['Печать и копии','#3b82f6'],['Скан и цифровое','#14b8a6'],['Фото','#ec4899'],['Постпечать','#f59e0b'],['Полиграфия','#8b5cf6'],['Дизайн','#22c55e'],['Товары','#ef6c3a']].map(([name,color])=>({name,color}));
const I0=(id,cat,name,price,unit,fav,x)=>Object.assign({id,cat,name,price,unit,fav:!!fav},x||{});
const C1='Печать и копии',C2='Скан и цифровое',C3='Фото',C4='Постпечать',C5='Полиграфия',C6='Дизайн',C7='Товары';
const ITEMS0=[
  I0('bw1',C1,'Печать ч/б A4, 1 сторона',50,'стр.',1),
  I0('bw2',C1,'Печать ч/б A4, 2 стороны',80,'лист',1),
  I0('cl1',C1,'Печать цветная A4 — текст',150,'стр.',1),
  I0('cl2',C1,'Печать цветная A4 — с фото',300,'стр.'),
  I0('cl3',C1,'Печать цветная A4 — на всю страницу',500,'стр.'),
  I0('a3',C1,'Печать A3',300,'стр.',0,{hide:true}),
  I0('cp1',C1,'Ксерокопия ч/б A4',50,'стр.',1),
  I0('cp2',C1,'Ксерокопия цветная A4',200,'стр.'),
  I0('usb',C1,'Распечатка с телефона / флешки',100,'стр.'),
  I0('sc1',C2,'Скан в файл',100,'стр.',1),
  I0('sc2',C2,'Скан на почту',150,'стр.'),
  I0('mail',C2,'Отправка e-mail',100,'шт'),
  I0('type',C2,'Набор текста',1000,'стр.'),
  I0('ph1',C3,'Фото 10×15',150,'шт',1),
  I0('ph2',C3,'Фото 13×18',300,'шт'),
  I0('ph3',C3,'Фото A4',1000,'шт'),
  I0('ph4',C3,'Фото на документы',1500,'компл.',1),
  I0('lm1',C4,'Ламинирование A4',400,'шт'),
  I0('lm2',C4,'Ламинирование A5',300,'шт'),
  I0('lm3',C4,'Ламинирование 10×15',200,'шт'),
  I0('lm4',C4,'Ламинирование визитки',150,'шт'),
  I0('bd1',C4,'Брошюровка пружиной до 50 л.',800,'шт'),
  I0('bd2',C4,'Брошюровка пружиной до 100 л.',1200,'шт'),
  I0('cut',C4,'Резка',100,'рез'),
  I0('vz1',C5,'Визитки 100 шт, 1 сторона',5000,'тираж'),
  I0('vz2',C5,'Визитки 100 шт, 2 стороны',7000,'тираж'),
  I0('f51',C5,'Листовки A5 — 10 шт',2000,'тираж'),
  I0('f52',C5,'Листовки A5 — 50 шт',7000,'тираж'),
  I0('f53',C5,'Листовки A5 — 100 шт',12000,'тираж'),
  I0('f61',C5,'Листовки A6 — 10 шт',1200,'тираж'),
  I0('f62',C5,'Листовки A6 — 50 шт',4500,'тираж'),
  I0('f63',C5,'Листовки A6 — 100 шт',8000,'тираж'),
  I0('stk',C5,'Наклейки, лист A4',800,'лист'),
  I0('dz1',C6,'Дизайн',5000,'час'),
  I0('env',C7,'Конверт',100,'шт'),
  I0('fld',C7,'Папка',300,'шт'),
  I0('fil',C7,'Файл-вкладыш',30,'шт')
];
const UNITS=['шт','стр.','лист','компл.','тираж','час','рез','файл','м²','услуга'];
const DEF={v:1,cats:CATS0,items:ITEMS0,sales:[],shifts:[],cur:'',seq:{check:1,invoice:1,act:1,rcpt:1,shift:1},docs:[],
  req:{legal:'',tax:'',bank:'',acc:'',boss:'',terms:'Оплата в течение 3 банковских дней. Счёт действителен 5 дней.'},
  set:{printAfter:false,printKind:'check',checkSize:'A4',sound:true},
  cart:{lines:[],dk:'%',dv:'',client:'',phone:'',pay:'cash',got:''},arch:[]};
const PAYN={cash:'Наличные',card:'Карта',transfer:'Перевод',debt:'В долг'};
const DOCN={check:'Товарный чек',rcpt:'Квитанция',invoice:'Счёт на оплату',act:'Акт выполненных работ'};
const KEEP_DAYS=60, DOCS_MAX=400;

/* store: call every time (st is replaced on undo / project switch) */
function P(){ const p=KS.store('pos',DEF);
  ['cats','items','sales','shifts','docs','arch'].forEach(k=>{ if(!Array.isArray(p[k])) p[k]=[]; });
  ['seq','req','set','cart'].forEach(k=>{ if(!p[k]||typeof p[k]!=='object'||Array.isArray(p[k])) p[k]=JSON.parse(JSON.stringify(DEF[k])); });
  for(const k in DEF.seq) if(!(+p.seq[k]>0)) p.seq[k]=1;
  for(const k in DEF.set) if(!(k in p.set)) p.set[k]=DEF.set[k];
  for(const k in DEF.req) if(!(k in p.req)) p.req[k]=DEF.req[k];
  const c=p.cart; if(!Array.isArray(c.lines)) c.lines=[]; if(!PAYN[c.pay]) c.pay='cash'; if(c.dk!=='%'&&c.dk!=='sum') c.dk='%';
  return p; }

/* ---------- helpers ---------- */
const r2=v=>Math.round((+v||0)*100)/100;
const num=v=>{ if(typeof v==='number') return isFinite(v)?v:0; const n=parseFloat(String(v==null?'':v).replace(/[\s  ]/g,'').replace(',','.').replace(/[^\d.\-]/g,'')); return isFinite(n)?n:0; };
const curSym=()=>(st.shop&&st.shop.cur)||'֏';
const rm=v=>curSym()==='֏'?Math.round(+v||0):r2(v);
const M=n=>KS.money(n), E=s=>KS.esc(s==null?'':String(s));
const pad2=n=>String(n).padStart(2,'0');
const fD=ts=>{ const d=new Date(ts); return pad2(d.getDate())+'.'+pad2(d.getMonth()+1)+'.'+d.getFullYear(); };
const fT=ts=>{ const d=new Date(ts); return pad2(d.getHours())+':'+pad2(d.getMinutes()); };
const fDT=ts=>fD(ts)+' '+fT(ts);
const MON=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const fLong=ts=>{ const d=new Date(ts); return d.getDate()+' '+MON[d.getMonth()]+' '+d.getFullYear()+' г.'; };
const dayKey=ts=>{ const d=new Date(ts); return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate()); };
const qtyS=q=>{ const v=r2(q); return String(v).replace('.',','); };
const catOf=name=>P().cats.find(c=>c.name===name);
const colOf=it=>(it&&it.color)||((catOf(it&&it.cat)||{}).color)||'#8e8e93';
const plural=(n,f)=>{ n=Math.abs(n)%100; const n1=n%10; if(n>10&&n<20) return f[2]; if(n1>1&&n1<5) return f[1]; if(n1===1) return f[0]; return f[2]; };
const U={cat:'',q:'',mode:'items',oq:'',done:'',opsView:'shift',svcCat:'',svcQ:'',svcOpen:'',docKind:'',dirty:0,lastAdd:''};
const isTouch=()=>matchMedia('(hover: none)').matches;

/* sum in words (Russian) */
function words(n){ n=Math.floor(Math.abs(n)); if(n===0) return 'ноль';
  const o=['','один','два','три','четыре','пять','шесть','семь','восемь','девять'], oF=['','одна','две','три','четыре','пять','шесть','семь','восемь','девять'],
    t1=['десять','одиннадцать','двенадцать','тринадцать','четырнадцать','пятнадцать','шестнадцать','семнадцать','восемнадцать','девятнадцать'],
    t=['','','двадцать','тридцать','сорок','пятьдесят','шестьдесят','семьдесят','восемьдесят','девяносто'],
    h=['','сто','двести','триста','четыреста','пятьсот','шестьсот','семьсот','восемьсот','девятьсот'];
  const G=[[null,0],[['тысяча','тысячи','тысяч'],1],[['миллион','миллиона','миллионов'],0],[['миллиард','миллиарда','миллиардов'],0]];
  const out=[]; let g=0;
  while(n>0&&g<G.length){ const tri=n%1000; n=Math.floor(n/1000);
    if(tri){ const w=[]; w.push(h[Math.floor(tri/100)]); const d=tri%100; if(d>=10&&d<20) w.push(t1[d-10]); else { w.push(t[Math.floor(d/10)]); w.push((G[g][1]?oF:o)[d%10]); } if(G[g][0]) w.push(plural(tri,G[g][0])); out.unshift(w.filter(Boolean).join(' ')); }
    g++; }
  return out.join(' '); }
function sumWords(v){ v=r2(Math.abs(v)); const c=curSym(), ip=Math.floor(v), fr=Math.round((v-ip)*100);
  const F={'֏':['драм','драма','драмов'],'₽':['рубль','рубля','рублей'],'руб':['рубль','рубля','рублей'],'$':['доллар','доллара','долларов'],'€':['евро','евро','евро'],'₸':['тенге','тенге','тенге'],'AMD':['драм','драма','драмов']}[c];
  const sub={'₽':['копейка','копейки','копеек'],'руб':['копейка','копейки','копеек'],'$':['цент','цента','центов'],'€':['цент','цента','центов']}[c];
  let s=words(ip)+' '+(F?plural(ip,F):c);
  if(fr) s+=' '+pad2(fr)+' '+(sub?plural(fr,sub):'');
  s=s.trim(); return s.charAt(0).toUpperCase()+s.slice(1); }

/* ---------- cart ---------- */
function cartCalc(c){ c=c||P().cart; const sub=r2(c.lines.reduce((s,l)=>s+r2(num(l.price)*num(l.qty)),0)); const dv=num(c.dv); let disc=0;
  if(dv>0&&sub>0){ const raw=c.dk==='%'?sub*Math.min(100,dv)/100:Math.min(sub,dv); disc=r2(sub-Math.max(0,rm(sub-raw))); }
  const total=r2(sub-disc), got=num(c.got); return {sub,disc,total,got,change:c.pay==='cash'&&got>0?r2(got-total):0,n:c.lines.reduce((s,l)=>s+num(l.qty),0)}; }
function addLine(o,silent){ const p=P(), c=p.cart; if(U.done){ U.done=''; }
  const name=String(o.name||'Позиция').trim().slice(0,160)||'Позиция', price=r2(num(o.price)), qty=num(o.qty)||1;
  let l=c.lines.find(x=>(o.iid?x.iid===o.iid:!x.iid&&x.name===name)&&r2(num(x.price))===price);
  if(l) l.qty=r2(num(l.qty)+qty); else { l={id:KS.uid('l'),iid:o.iid||'',name,price,qty,cat:o.cat||'',unit:o.unit||''}; c.lines.push(l); }
  U.lastAdd=l.id; KS.save(); if(!silent) KS.emit('posChanged',{cart:true}); return l; }
function itemLines(c){ return c.lines.filter(l=>num(l.qty)>0).map(l=>{ const x={name:l.name,price:r2(num(l.price)),qty:r2(num(l.qty)),cat:l.cat||''}; if(l.unit) x.unit=l.unit; if(l.iid) x.iid=l.iid; return x; }); }
function resetCart(){ const c=P().cart; c.lines=[]; c.dv=''; c.dk='%'; c.client=''; c.phone=''; c.got=''; c.pay='cash'; }
function ensureClient(name,phone){ name=String(name||'').trim(); phone=String(phone||'').trim(); if(!name) return {name:'',phone,added:false};
  if(!Array.isArray(st.clients)) st.clients=[]; let c=st.clients.find(x=>x&&x.name===name), added=false;
  if(!c){ c={name,phone,contact:'',note:''}; st.clients.push(c); added=true; } else if(phone&&!c.phone){ c.phone=phone; added=true; }
  return {name,phone:phone||c.phone||'',added}; }

/* ---------- shifts & records ---------- */
function curShift(){ const p=P(); return (p.cur&&p.shifts.find(s=>s.id===p.cur&&!s.close))||null; }
function openShift(cash0){ const p=P(); const o=curShift(); if(o) return o; const sh={id:KS.uid('sh'),no:p.seq.shift++,open:Date.now(),close:0,cash0:r2(num(cash0))}; p.shifts.unshift(sh); p.cur=sh.id; KS.save(); KS.emit('posChanged',{shift:sh.id}); return sh; }
function needShift(){ let s=curShift(); if(!s){ s=openShift(0); KS.toast('Смена № '+s.no+' открыта автоматически. Наличные на начало можно указать во вкладке «Смена».'); } return s; }
function addRec(o){ const p=P(), sh=needShift(); const r=Object.assign({id:KS.uid('s'),ts:Date.now(),shift:sh.id},o); if(r.type!=='in'&&r.type!=='out') r.no=p.seq.check++; p.sales.push(r); KS.save(); KS.emit('posChanged',r); return r; }
const isMoney=s=>s&&s.type!=='in'&&s.type!=='out'&&s.pay!=='debt';
let RFC=null; /* refund sums by record id while the operations table is drawn */
function refunded(rec){ if(RFC) return RFC[rec.id]||0; return r2(P().sales.filter(s=>s.refOf===rec.id).reduce((a,s)=>a+Math.abs(num(s.total)),0)); }
function refundedQty(rec,i){ return P().sales.filter(s=>s.refOf===rec.id).reduce((a,s)=>a+((s.items||[]).filter(x=>x.li===i).reduce((b,x)=>b+num(x.qty),0)),0); }

/* spread an amount over a record's lines by category (keeps cents exact) */
function spread(s,amount,add){ const L=(s.items||[]).filter(x=>num(x.price)*num(x.qty)); const base=L.reduce((a,x)=>a+num(x.price)*num(x.qty),0); if(!L.length||!base){ add('Без категории',amount); return; }
  let left=r2(amount); L.forEach((x,i)=>{ const v=i===L.length-1?left:r2(amount*num(x.price)*num(x.qty)/base); left=r2(left-v); add(x.cat||'Без категории',v); }); }
function calcRep(sh){ const p=P(), ops=p.sales.filter(s=>s.shift===sh.id);
  const R={no:sh.no,open:sh.open,close:sh.close||0,cash0:r2(sh.cash0),sales:0,salesN:0,ord:0,ordN:0,ref:0,refN:0,debt:0,debtN:0,disc:0,cin:0,cout:0,inN:0,outN:0,pay:{cash:0,card:0,transfer:0},cat:{},checks:0,avg:0,net:0,cashExp:0,ops:ops.length};
  const add=(n,v)=>{ R.cat[n]=r2((R.cat[n]||0)+v); };
  for(const s of ops){ const t=r2(s.total);
    if(s.type==='in'){ R.cin=r2(R.cin+Math.abs(t)); R.inN++; continue; }
    if(s.type==='out'){ R.cout=r2(R.cout+Math.abs(t)); R.outN++; continue; }
    if(s.pay==='debt'){ R.debt=r2(R.debt+num(s.debt)); R.debtN++; continue; }
    const pk=s.pay in R.pay?s.pay:'cash'; R.pay[pk]=r2(R.pay[pk]+t);
    if(s.type==='sale'){ R.sales=r2(R.sales+t); R.salesN++; R.disc=r2(R.disc+num(s.disc)); spread(s,t,add); }
    else if(s.type==='refund'){ R.ref=r2(R.ref-t); R.refN++; spread(s,t,add); }
    else if(s.type==='order'&&t<0){ R.ref=r2(R.ref-t); R.refN++; add('Заказы',t); }
    else if(s.type==='order'){ R.ord=r2(R.ord+t); R.ordN++; add('Заказы',t); } }
  R.checks=R.salesN+R.ordN; R.avg=R.checks?rm((R.sales+R.ord)/R.checks):0; R.net=r2(R.pay.cash+R.pay.card+R.pay.transfer); R.cashExp=r2(R.cash0+R.pay.cash+R.cin-R.cout);
  return R; }

/* ---------- payments ---------- */
function chime(){ if(!P().set.sound) return; try{ const A=window.AudioContext||window.webkitAudioContext; if(!A) return; const a=chime.a||(chime.a=new A()); const t=a.currentTime;
  [[880,0],[1318.5,.09]].forEach(([f,d])=>{ const o=a.createOscillator(), g=a.createGain(); o.type='sine'; o.frequency.value=f; g.gain.setValueAtTime(0,t+d); g.gain.linearRampToValueAtTime(.12,t+d+.015); g.gain.exponentialRampToValueAtTime(.0008,t+d+.45); o.connect(g).connect(a.destination); o.start(t+d); o.stop(t+d+.5); }); }catch(_){} }
function finish(rec,opt){ opt=opt||{}; U.done=rec.id; chime(); flashOk(rec);
  const s=P().set; if(s.printAfter&&!opt.noPrint){ const k=opt.kind||(rec.type==='order'?'rcpt':s.printKind); setTimeout(()=>printRec(rec,k),30); }
  if(opt.app) update(); else { KS.save(); refresh(); } }
function pay(){ const p=P(), c=p.cart; if(!c.lines.length){ KS.toast('Чек пуст — нажмите на услугу'); return null; }
  const k=cartCalc(c); if(c.pay==='debt') return payDebt();
  if(k.total<=0&&k.sub<=0){ KS.toast('Сумма чека 0'); return null; }
  if(c.pay==='cash'&&k.got>0&&k.got<k.total){ KS.toast('Получено меньше суммы чека'); shake('.pos-got'); return null; }
  const cl=ensureClient(c.client,c.phone);
  const r={type:'sale',items:itemLines(c),sub:k.sub,disc:k.disc,total:k.total,pay:c.pay}; if(k.disc) { r.dk=c.dk; r.dv=num(c.dv); }
  if(c.pay==='cash'){ r.got=k.got>0?k.got:k.total; r.change=r2(r.got-k.total); }
  if(cl.name){ r.client=cl.name; if(cl.phone) r.phone=cl.phone; }
  const rec=addRec(r); resetCart(); finish(rec,{app:cl.added}); return rec; }
function orderProduct(lines){ if(!lines.length) return 'Заказ из кассы'; return lines.length===1?lines[0].name:lines[0].name+' и ещё '+(lines.length-1); }
function orderNote(lines,k){ return lines.map(l=>'• '+l.name+' × '+qtyS(l.qty)+' = '+M(l.price*l.qty)).join('\n')+(k&&k.disc?'\nСкидка: −'+M(k.disc):''); }
function mkOrder(o){ const ord=newOrder(o); try{ if(typeof syncClient==='function') syncClient(ord); }catch(_){} return ord; }
function payDebt(){ const p=P(), c=p.cart, k=cartCalc(c); const cl=ensureClient(c.client,c.phone);
  if(!cl.name){ KS.toast('Для продажи в долг укажите клиента'); const i=document.getElementById('posCli'); if(i) i.focus(); shake('.pos-cli'); return null; }
  const lines=itemLines(c); const ord=mkOrder({client:cl.name,phone:cl.phone,product:orderProduct(lines),qty:lines.length===1?lines[0].qty:1,price:k.total,paid:0,status:'done',note:'В долг из кассы\n'+orderNote(lines,k),posItems:lines});
  const rec=addRec({type:'order',pay:'debt',total:0,debt:k.total,sub:k.sub,disc:k.disc,items:lines,orderId:ord.id,orderNo:ord.no,oPrice:k.total,oPaid:0,client:cl.name,phone:cl.phone||undefined});
  resetCart(); KS.toast('Записано в долг: заказ № '+ord.no+' — '+cl.name); finish(rec,{app:true,kind:'check'}); return rec; }
/* order from cart (optionally with prepayment) */
function cartToOrder(f){ const p=P(), c=p.cart, k=cartCalc(c); const lines=itemLines(c); if(!lines.length){ KS.toast('Чек пуст'); return null; }
  const cl=ensureClient(f.client,f.phone); if(!cl.name){ KS.toast('Укажите клиента'); return null; }
  const pre=Math.min(k.total,r2(num(f.prepay)));
  const ord=mkOrder({client:cl.name,phone:cl.phone,product:String(f.product||orderProduct(lines)).trim(),qty:lines.length===1?lines[0].qty:1,price:k.total,paid:0,status:'new',due:f.due||'',note:orderNote(lines,k)+(f.note?'\n'+f.note:''),posItems:lines});
  let rec=null;
  if(pre>0){ const got=f.pay==='cash'&&num(f.got)>=pre?r2(num(f.got)):undefined; ord.paid=pre;
    rec=addRec({type:'order',orderId:ord.id,orderNo:ord.no,items:[{name:'Предоплата по заказу № '+ord.no,price:pre,qty:1,cat:'Заказы'}],sub:pre,disc:0,total:pre,pay:f.pay||'cash',got:f.pay==='cash'?(got||pre):undefined,change:f.pay==='cash'?r2((got||pre)-pre):undefined,client:cl.name,phone:cl.phone||undefined,oPrice:k.total,oPaid:pre,prepay:1}); }
  resetCart(); KS.toast('Заказ № '+ord.no+' создан'+(pre>0?', предоплата '+M(pre):''));
  if(rec) finish(rec,{app:true,kind:'rcpt'}); else { U.done=''; if(P().set.printAfter) setTimeout(()=>printOrderDoc(ord,'rcpt'),30); update(); }
  return {ord,rec}; }
function unpaid(){ return (st.orders||[]).filter(o=>o&&o.status!=='cancel'&&r2(num(o.price)-num(o.paid))>0); }
function payOrder(o,amt,pay,got,done){ o=(st.orders||[]).find(x=>x&&x.id===o.id)||o; amt=r2(num(amt)); const rest=r2(num(o.price)-num(o.paid)); if(!(rest>0)){ KS.toast('Заказ № '+o.no+' уже оплачен'); refresh(); return null; } if(!(amt>0)){ KS.toast('Введите сумму'); return null; } if(amt>rest) amt=rest;
  o.paid=r2(num(o.paid)+amt); if(done&&o.paid>=num(o.price)&&o.status!=='cancel') o.status='done';
  const g=pay==='cash'?(num(got)>=amt?r2(num(got)):amt):undefined;
  const rec=addRec({type:'order',orderId:o.id,orderNo:o.no,items:[{name:'Оплата заказа № '+o.no+(o.product?' — '+o.product:''),price:amt,qty:1,cat:'Заказы'}],sub:amt,disc:0,total:amt,pay,got:g,change:pay==='cash'?r2(g-amt):undefined,client:o.client||undefined,phone:o.phone||undefined,oPrice:r2(num(o.price)),oPaid:o.paid});
  KS.toast('Оплата заказа № '+o.no+' принята: '+M(amt)); finish(rec,{app:true,kind:'rcpt'}); return rec; }
function doRefund(orig,f){ const amt=r2(num(f.amount)); const left=r2(Math.abs(num(orig.total))-refunded(orig)); if(!(amt>0)){ KS.toast('Сумма возврата 0'); return null; } if(amt>left+0.001){ KS.toast('Можно вернуть не больше '+M(left)); return null; }
  const reason=String(f.reason||'').trim()||'Без причины'; let rec;
  if(orig.type==='order'){ const o=(st.orders||[]).find(x=>x.id===orig.orderId); if(o) o.paid=Math.max(0,r2(num(o.paid)-amt));
    rec=addRec({type:'order',refund:1,refOf:orig.id,orderId:orig.orderId,orderNo:orig.orderNo,items:[{name:'Возврат оплаты заказа № '+orig.orderNo,price:amt,qty:1,cat:'Заказы'}],sub:-amt,disc:0,total:-amt,pay:f.pay||orig.pay,reason,client:orig.client,refNo:orig.no}); }
  else { rec=addRec({type:'refund',refOf:orig.id,items:f.items&&f.items.length?f.items:[{name:'Возврат по чеку № '+orig.no,price:amt,qty:1,cat:''}],sub:-amt,disc:0,total:-amt,pay:f.pay||orig.pay,reason,client:orig.client,refNo:orig.no}); }
  KS.toast('Возврат '+M(amt)+' оформлен'); KS.save(); if(orig.type==='order') update(); else refresh(); return rec; }

/* ---------- archive: old records of closed shifts → IndexedDB (localStorage stays small) ---------- */
async function archive(){ try{ const p=P(), lim=Date.now()-KEEP_DAYS*864e5, open=p.cur; const old=p.sales.filter(s=>s.ts<lim&&s.shift!==open); if(!old.length) return 0;
    const by={}; old.forEach(s=>{ const k=dayKey(s.ts).slice(0,7); (by[k]=by[k]||[]).push(s); });
    for(const k of Object.keys(by)){ const prev=(await KS.idb.get('pos:arch:'+k))||[]; const ids=new Set(prev.map(x=>x.id)); await KS.idb.set('pos:arch:'+k,prev.concat(by[k].filter(x=>!ids.has(x.id)))); if(!p.arch.includes(k)) p.arch.push(k); }
    const gone=new Set(old.map(s=>s.id)); const q=P(); q.sales=q.sales.filter(s=>!gone.has(s.id)); q.arch.sort(); KS.save(); return old.length; }catch(e){ console.warn('[pos] archive',e); return 0; } }
async function allSales(){ const p=P(); let out=[]; for(const k of p.arch){ try{ out=out.concat((await KS.idb.get('pos:arch:'+k))||[]); }catch(_){} } const ids=new Set(out.map(s=>s.id)); return out.concat(p.sales.filter(s=>!ids.has(s.id))).sort((a,b)=>a.ts-b.ts); }

/* ---------- documents ---------- */
function reqs(){ const S=st.shop||{}, q=P().req; return {name:S.name||'Типография',addr:S.addr||'',phone:S.phone||'',legal:q.legal||'',tax:q.tax||'',bank:q.bank||'',acc:q.acc||'',boss:q.boss||'',terms:q.terms||''}; }
function dataFromRec(r){ const d={ts:r.ts,items:(r.items||[]).map(x=>({name:x.name,price:x.price,qty:x.qty,unit:x.unit||''})),sub:r2(Math.abs(num(r.sub))),disc:r2(num(r.disc)),total:r2(r.pay==='debt'?num(r.debt):Math.abs(num(r.total))),pay:r.pay,client:r.client||'',phone:r.phone||'',checkNo:r.no};
  if(r.got!=null){ d.got=r.got; d.change=r.change; } if(r.total<0||r.type==='refund'){ d.refund=1; d.reason=r.reason||''; d.refNo=r.refNo; }
  if(r.orderId){ const o=(st.orders||[]).find(x=>x.id===r.orderId); d.orderNo=r.orderNo; d.oPrice=r.oPrice!=null?r.oPrice:(o?num(o.price):d.total); d.oPaid=r.oPaid!=null?r.oPaid:(o?num(o.paid):d.total); d.paidNow=r.pay==='debt'?0:d.total; if(o){ d.due=o.due||''; d.product=o.product||''; if(o.posItems&&r.pay!=='debt'&&!d.refund) d.oItems=o.posItems; } }
  return d; }
function dataFromCart(){ const c=P().cart, k=cartCalc(c); return {ts:Date.now(),items:itemLines(c).map(x=>({name:x.name,price:x.price,qty:x.qty,unit:x.unit||''})),sub:k.sub,disc:k.disc,total:k.total,client:String(c.client||'').trim(),phone:String(c.phone||'').trim()}; }
function dataFromOrder(o){ const items=Array.isArray(o.posItems)&&o.posItems.length?o.posItems.map(x=>({name:x.name,price:x.price,qty:x.qty,unit:x.unit||''})):[{name:(o.product||'Заказ')+(num(o.qty)>1?', тираж '+qtyS(o.qty)+' шт':'')+(o.paper?', '+o.paper:''),price:r2(num(o.price)),qty:1,unit:'заказ'}];
  const sub=r2(items.reduce((a,x)=>a+num(x.price)*num(x.qty),0)); return {ts:Date.now(),items,sub,disc:r2(Math.max(0,sub-num(o.price))),total:r2(num(o.price)),client:o.client||'',phone:o.phone||'',orderNo:o.no,oPrice:r2(num(o.price)),oPaid:r2(num(o.paid)),paidNow:0,due:o.due||'',product:o.product||''}; }
/* register a document in the journal; the same source keeps its number on reprint */
function issue(kind,d,src){ const p=P(); let e=src?p.docs.find(x=>x.kind===kind&&x.src===src):null;
  if(!e){ const no=kind==='check'&&d.checkNo?d.checkNo:(p.seq[kind]++); e={id:KS.uid('d'),kind,no,ts:Date.now(),src:src||'',total:d.total,client:d.client||'',d}; p.docs.unshift(e); if(p.docs.length>DOCS_MAX) p.docs.length=DOCS_MAX; KS.save(); }
  return e; }
function printEntry(e){ const pages=docPages(e.kind,e.no,e.d); KS.print(pages); KS.emit('posDoc',e); return pages; }
function printRec(r,kind){ if(!r) return; if(kind==='check'&&r.pay==='debt'){ /* still a товарный чек: goods handed out on credit */ }
  const e=issue(kind,dataFromRec(r),'sale:'+r.id); printEntry(e); return e; }
function printOrderDoc(o,kind){ const e=issue(kind,dataFromOrder(o),'order:'+o.id+(kind==='rcpt'?':'+num(o.paid):'')); printEntry(e); return e; }
function printCartDoc(kind){ const d=dataFromCart(); if(!d.items.length){ KS.toast('Чек пуст — добавьте услуги'); return null; } const e=issue(kind,d,''); printEntry(e); KS.toast(DOCN[kind]+' № '+e.no); refresh(); return e; }

const tdn=v=>`<td class="n">${v}</td>`;
function itemsTable(d,opt){ opt=opt||{}; const from=opt.from||0, list=opt.items||d.items; const rows=list.map((x,i)=>`<tr><td class="c">${from+i+1}</td><td>${E(x.name)}</td>${opt.unit===false?'':`<td class="c">${E(x.unit||'шт')}</td>`}${tdn(qtyS(x.qty))}${tdn(M(x.price))}${tdn(M(r2(num(x.price)*num(x.qty))))}</tr>`).join('');
  return `<table class="pd-t"><thead><tr><th class="c">№</th><th>Наименование</th>${opt.unit===false?'':'<th class="c">Ед.</th>'}<th class="n">Кол-во</th><th class="n">Цена</th><th class="n">Сумма</th></tr></thead><tbody>${rows}</tbody></table>`; }
function totalsBlock(d,label){ return `<div class="pd-sum">${d.disc?`<div><span>Сумма</span><b>${M(d.sub)}</b></div><div><span>Скидка</span><b>−${M(d.disc)}</b></div>`:''}<div class="pd-grand"><span>${label||'Итого'}</span><b>${M(d.total)}</b></div></div>`; }
function seller(R,full){ return `<div class="pd-party"><span>${full?'Поставщик':'Продавец'}</span><div><b>${E(R.legal||R.name)}</b>${R.legal&&R.name&&R.legal!==R.name?' («'+E(R.name)+'»)':''}${R.tax?', ИНН / ՀՎՀՀ '+E(R.tax):''}${R.addr?', '+E(R.addr):''}${R.phone?', тел. '+E(R.phone):''}${full&&R.bank?'<br>Банк: '+E(R.bank):''}${full&&R.acc?', счёт '+E(R.acc):''}</div></div>`; }
function head(R,title,no,ts){ return `<div class="pd-top"><div class="pd-shop"><b>${E(R.name)}</b>${R.legal&&R.legal!==R.name?`<span>${E(R.legal)}</span>`:''}${R.tax?`<span>ИНН / ՀՎՀՀ ${E(R.tax)}</span>`:''}${R.addr?`<span>${E(R.addr)}</span>`:''}${R.phone?`<span>${E(R.phone)}</span>`:''}</div><div class="pd-no"><small>${E(title)}</small><b>№ ${E(no)}</b><span>${fD(ts)}</span></div></div>`; }
/* long documents continue on further pages: rows are measured in "units" (a long name wraps) */
const rowU=x=>Math.max(1,Math.ceil(String(x.name||'').length/58));
function paginate(items,cap){ /* cap: {only,first,next,last} = rows that fit: single page with totals, first page without totals, middle page, last page with totals */
  const out=[]; let i=0, first=true;
  const fit=(from,lim)=>{ let u=0,j=from; while(j<items.length&&u+rowU(items[j])<=lim){ u+=rowU(items[j]); j++; } return j; };
  while(i<items.length||!out.length){ let j=fit(i,first?cap.only:cap.last); if(j>=items.length){ out.push([i,items.length]); break; }
    j=fit(i,first?cap.first:cap.next); if(j>=items.length) j=items.length-1; if(j<=i) j=i+1; out.push([i,j]); i=j; first=false; }
  return out; }
const CAPS={check:{only:21,first:31,next:40,last:30},a5:{only:10,first:19,next:25,last:16},invoice:{only:17,first:27,next:40,last:28},act:{only:17,first:29,next:40,last:27}};
/* lay a document out off-screen (fonts and mm are real) to know how many rows fit on each page */
function probe(html,wmm,fn){ const box=document.createElement('div'); box.style.cssText=`position:fixed;left:-4000px;top:0;width:${wmm}mm;visibility:hidden;pointer-events:none;contain:layout`; box.innerHTML=html; document.body.appendChild(box);
  try{ return fn(box,box.getBoundingClientRect().width/wmm); }finally{ box.remove(); } }
function measureParts(cls,wmm,hmm,top,d,label,bottom){ if(!document.body||!d.items.length) return null;
  return probe(`<div class="${cls}" style="position:relative;inset:auto;height:auto">${top}${itemsTable(d)}${totalsBlock(d,label)}${bottom}</div><div class="${cls}" style="position:relative;inset:auto;height:auto"><div class="pd-cont"><b>Документ</b><span>продолжение</span></div>${itemsTable(d,{items:[]})}<p class="pd-next">Продолжение</p></div>`,wmm,(box,px)=>{
    const [doc,doc2]=box.children, cs=getComputedStyle(doc), pt=parseFloat(cs.paddingTop), pb=parseFloat(cs.paddingBottom), gap=parseFloat(cs.rowGap)||0;
    const t=doc.querySelector('.pd-t'), tr=t.getBoundingClientRect(), dr=doc.getBoundingClientRect(); if(!px||!tr.height) return null;
    const avail=hmm*px-pt-pb, topH=tr.top-dr.top-pt, headH=t.tHead.getBoundingClientRect().height, rows=[...t.tBodies[0].rows].map(r=>r.getBoundingClientRect().height);
    const last=doc.lastElementChild.getBoundingClientRect().bottom, botH=last-tr.bottom;
    const t2=doc2.querySelector('.pd-t').getBoundingClientRect(), d2=doc2.getBoundingClientRect(), contH=t2.top-d2.top-parseFloat(getComputedStyle(doc2).paddingTop), nextH=doc2.querySelector('.pd-next').getBoundingClientRect().bottom-t2.bottom;
    const safe=3*px, n=rows.length, parts=[]; let i=0, first=true;
    while(true){ const room=(first?avail-topH:avail-contH)-headH-safe; let s=0,j=i;
      while(j<n&&s+rows[j]+botH<=room){ s+=rows[j]; j++; } if(j>=n){ parts.push([i,n]); break; }
      s=0; j=i; while(j<n&&s+rows[j]+nextH<=room){ s+=rows[j]; j++; } if(j>=n) j=n-1; if(j<=i) j=i+1; parts.push([i,j]); i=j; first=false; if(parts.length>200) break; }
    return parts; }); }
function paged(kind,no,d,cap,title,top,bottom,label,size){ const A5=size==='a5', wmm=A5?148:210, hmm=A5?210:297, cls='posdoc'+(A5?' a5':'');
  let parts=null; try{ parts=measureParts(cls,wmm,hmm,top,d,label,bottom); }catch(e){ console.warn('[pos] measure',e); }
  if(!parts) parts=paginate(d.items,cap); const n=parts.length;
  return parts.map(([a,b],k)=>{ const first=k===0, last=k===n-1;
    const html=`<div class="${cls}${n>1?' multi':''}" data-doc="${kind}" data-no="${E(no)}" data-page="${k+1}">${first?top:`<div class="pd-cont"><b>${E(title)} № ${E(no)}</b><span>от ${fD(d.ts)} · продолжение</span></div>`}${itemsTable(d,{from:a,items:d.items.slice(a,b)})}${last?totalsBlock(d,label)+bottom:'<p class="pd-next">Продолжение на следующей странице</p>'}${n>1?`<div class="pd-pg">Страница ${k+1} из ${n}</div>`:''}</div>`;
    return KS.page(wmm,hmm,html,kind+'-'+no+(n>1?'-'+(k+1):'')); }); }
/* narrow roll receipt (80 / 58 mm) for a receipt printer driven by macOS / iPadOS print — not a fiscal check */
function rollCheck(no,d,R,ttl,payL){ const w=P().set.checkSize==='58'?58:80, cpl=w===58?26:38;
  const lines=t=>Math.max(1,Math.ceil(String(t||'').length/cpl));
  let h=10+lines(R.name)*5.2+(R.legal&&R.legal!==R.name?lines(R.legal)*3.6:0)+(R.tax?3.6:0)+(R.addr?lines(R.addr)*3.6:0)+(R.phone?3.6:0)+16+(d.client?lines('Покупатель: '+d.client)*3.6:0)+(d.refund?lines('Возврат по чеку № '+(d.refNo||'')+' '+(d.reason||''))*3.6:0)+(d.orderNo?3.6:0);
  d.items.forEach(x=>{ h+=lines(x.name)*3.7+4.2; }); h+=(d.disc?8:0)+10+lines(payL)*3.6+14;
  const html=`<div class="pd-roll w${w}" data-doc="check" data-no="${E(no)}"><div class="rl-shop"><b>${E(R.name)}</b>${R.legal&&R.legal!==R.name?`<span>${E(R.legal)}</span>`:''}${R.tax?`<span>ИНН / ՀՎՀՀ ${E(R.tax)}</span>`:''}${R.addr?`<span>${E(R.addr)}</span>`:''}${R.phone?`<span>тел. ${E(R.phone)}</span>`:''}</div>
    <div class="rl-ttl">${E(ttl)} № ${E(no)}</div><div class="rl-dt">${fDT(d.ts)}</div>${d.client?`<div class="rl-l">Покупатель: ${E(d.client)}</div>`:''}${d.refund?`<div class="rl-l">Возврат по чеку № ${E(d.refNo||'')}${d.reason?' — '+E(d.reason):''}</div>`:''}${d.orderNo?`<div class="rl-l">Заказ № ${E(d.orderNo)}</div>`:''}
    <div class="rl-items">${d.items.map(x=>`<div class="rl-it"><span>${E(x.name)}</span><div><em>${qtyS(x.qty)} × ${M(x.price)}</em><b>${M(r2(num(x.price)*num(x.qty)))}</b></div></div>`).join('')}</div>
    <div class="rl-sum">${d.disc?`<div><span>Сумма</span><b>${M(d.sub)}</b></div><div><span>Скидка</span><b>−${M(d.disc)}</b></div>`:''}<div class="rl-grand"><span>${d.refund?'ВОЗВРАТ':'ИТОГО'}</span><b>${M(d.total)}</b></div></div>
    <div class="rl-pay">${E(payL)}</div><div class="rl-foot">${d.refund?'':'Спасибо за заказ!'}<small>Не является фискальным чеком</small></div></div>`;
  try{ const mh=probe(`<div style="position:relative;height:auto">${html.replace('class="pd-roll','style="position:relative;inset:auto;height:auto" class="pd-roll')}</div>`,w,(box,px)=>px?box.getBoundingClientRect().height/px:0); if(mh>20) h=mh+3; }catch(e){ console.warn('[pos] roll',e); }
  return [KS.page(w,Math.ceil(h),html,'check-'+no)]; }
function docPages(kind,no,d){ const R=reqs(), cnt=d.items.length;
  const wordsP=`<p class="pd-words">Всего наименований ${cnt}, на сумму ${M(d.total)}<br><b>${E(sumWords(d.total))}</b></p>`;
  if(kind==='check'){ const size=P().set.checkSize, A5=size==='A5'; const ttl=d.refund?'Чек возврата':'Товарный чек';
    const payL=d.pay==='debt'?'В долг (оплата позже)':(PAYN[d.pay]||'')+(d.pay==='cash'&&d.got!=null&&!d.refund?` · получено ${M(d.got)} · сдача ${M(d.change||0)}`:'');
    if(size==='80'||size==='58') return rollCheck(no,d,R,ttl,payL);
    const top=`${head(R,ttl,no,d.ts)}<h1>${ttl} № ${E(no)} от ${fLong(d.ts)}</h1>${seller(R)}${d.client?`<div class="pd-party"><span>Покупатель</span><div><b>${E(d.client)}</b>${d.phone?', '+E(d.phone):''}</div></div>`:''}${d.refund?`<div class="pd-party"><span>Основание</span><div>Возврат по чеку № ${E(d.refNo||'')}${d.reason?' — '+E(d.reason):''}</div></div>`:''}${d.orderNo?`<div class="pd-party"><span>Заказ</span><div>№ ${E(d.orderNo)}</div></div>`:''}`;
    const bottom=`${wordsP}<p class="pd-pay">Оплата: <b>${E(payL)}</b> · ${fDT(d.ts)}</p><div class="pd-sign"><div>Продавец <i></i> <em>${E(R.boss)}</em></div><div class="pd-mp">М.П.</div></div>`;
    return paged('check',no,d,A5?CAPS.a5:CAPS.check,ttl,top,bottom,d.refund?'Возвращено':'Итого',A5?'a5':''); }
  if(kind==='rcpt'){ const half=copy=>{ const paidNow=d.paidNow!=null?d.paidNow:d.total, oPrice=d.oPrice!=null?d.oPrice:d.total, oPaid=d.oPaid!=null?d.oPaid:paidNow, rest=r2(oPrice-oPaid);
      const list=(d.oItems||d.items).slice(0,8).map(x=>`<li>${E(x.name)} × ${qtyS(x.qty)} — ${M(num(x.price)*num(x.qty))}</li>`).join('')+((d.oItems||d.items).length>8?`<li>… ещё ${(d.oItems||d.items).length-8}</li>`:'');
      return `<div class="pd-half"><div class="pd-copy">${copy}</div>${head(R,'Квитанция',no,d.ts)}<h2>Квитанция № ${E(no)}${d.orderNo?' к заказу № '+E(d.orderNo):''} от ${fLong(d.ts)}</h2>
      <div class="pd-grid"><div><span>Клиент</span><b>${E(d.client||'—')}</b>${d.phone?`<small>${E(d.phone)}</small>`:''}</div><div><span>Срок готовности</span><b>${d.due?fD(d.due+'T12:00'):'—'}</b></div></div>
      <ul class="pd-list">${list}</ul>
      <div class="pd-grid pd-money"><div><span>Сумма заказа</span><b>${M(oPrice)}</b></div><div><span>Внесено сейчас</span><b>${M(paidNow)}</b>${d.pay&&paidNow?`<small>${E(PAYN[d.pay]||'')}</small>`:''}</div><div><span>Оплачено всего</span><b>${M(oPaid)}</b></div><div class="${rest>0?'pd-due':''}"><span>Остаток к оплате</span><b>${M(Math.max(0,rest))}</b></div></div>
      <div class="pd-sign"><div>Принял <i></i></div><div>${copy==='Экземпляр клиента'?'Клиент':'С условиями согласен'} <i></i></div></div></div>`; };
    const html=`<div class="posdoc pd-rcpt" data-doc="rcpt" data-no="${E(no)}">${half('Экземпляр клиента')}<div class="pd-cut"><span>✂ линия отреза</span></div>${half('Экземпляр типографии')}</div>`;
    return [KS.page(210,297,html,'rcpt-'+no)]; }
  if(kind==='invoice'){ const top=`<table class="pd-bank"><tr><td rowspan="2" style="width:58%"><small>Банк получателя</small><b>${E(R.bank||'—')}</b></td><td><small>Счёт №</small><b>${E(R.acc||'—')}</b></td></tr><tr><td><small>ИНН / ՀՎՀՀ</small><b>${E(R.tax||'—')}</b></td></tr><tr><td colspan="2"><small>Получатель</small><b>${E(R.legal||R.name)}</b></td></tr></table>
    <h1>Счёт на оплату № ${E(no)} от ${fLong(d.ts)}</h1>${seller(R,true)}<div class="pd-party"><span>Покупатель</span><div><b>${E(d.client||'—')}</b>${d.phone?', '+E(d.phone):''}</div></div>${d.orderNo?`<div class="pd-party"><span>Основание</span><div>Заказ № ${E(d.orderNo)}</div></div>`:''}`;
    const bottom=`${wordsP}${R.terms?`<p class="pd-terms">${E(R.terms)}</p>`:''}<div class="pd-sign"><div>Руководитель <i></i> <em>${E(R.boss)}</em></div><div class="pd-mp">М.П.</div></div>`;
    return paged('invoice',no,d,CAPS.invoice,'Счёт на оплату',top,bottom,'Итого к оплате'); }
  if(kind==='act'){ const top=`${head(R,'Акт',no,d.ts)}<h1>Акт № ${E(no)} выполненных работ (оказанных услуг) от ${fLong(d.ts)}</h1><div class="pd-party"><span>Исполнитель</span><div><b>${E(R.legal||R.name)}</b>${R.tax?', ИНН / ՀՎՀՀ '+E(R.tax):''}${R.addr?', '+E(R.addr):''}</div></div><div class="pd-party"><span>Заказчик</span><div><b>${E(d.client||'—')}</b>${d.phone?', '+E(d.phone):''}</div></div>${d.orderNo?`<div class="pd-party"><span>Основание</span><div>Заказ № ${E(d.orderNo)}</div></div>`:''}`;
    const bottom=`${wordsP}<p class="pd-terms">Вышеперечисленные работы (услуги) выполнены полностью и в срок. Заказчик претензий по объёму, качеству и срокам оказания услуг не имеет.</p><div class="pd-sign two"><div><span>Исполнитель</span><i></i><em>${E(R.boss||R.legal||R.name)}</em><small>М.П.</small></div><div><span>Заказчик</span><i></i><em>${E(d.client||'')}</em><small>М.П.</small></div></div>`;
    return paged('act',no,d,CAPS.act,'Акт',top,bottom,'Итого'); }
  return []; }

/* X / Z report */
function repHTML(R,z,print){ const row=(a,b,cls)=>`<div class="pr-row${cls?' '+cls:''}"><span>${a}</span><b>${b}</b></div>`;
  const cats=Object.entries(R.cat).filter(([,v])=>Math.abs(v)>0.004).sort((a,b)=>b[1]-a[1]); const mx=Math.max(1,...cats.map(([,v])=>Math.abs(v)));
  const cnt=z&&z.counted!=null&&z.counted!==''?r2(num(z.counted)):null, diff=cnt==null?null:r2(cnt-R.cashExp);
  return `<div class="pos-rep${print?' prn':''}">
  <div class="pr-hd"><div><b>${z&&z.final?'Z-отчёт':'X-отчёт'} · смена № ${R.no}</b><span>${E(reqs().name)}</span></div><div class="pr-dt"><span>Открыта ${fDT(R.open)}</span><span>${R.close?'Закрыта '+fDT(R.close):'Сформирован '+fDT(Date.now())}</span></div></div>
  <div class="pr-kpis"><div><small>Выручка</small><b data-r="net">${M(R.net)}</b></div><div><small>Чеков</small><b data-r="checks">${R.checks}</b></div><div><small>Средний чек</small><b data-r="avg">${M(R.avg)}</b></div><div><small>Возвраты</small><b data-r="ref">${M(R.ref)}</b></div></div>
  <div class="pr-cols"><div class="pr-blk"><h4>Способы оплаты</h4>${row('Наличные',M(R.pay.cash))}${row('Карта',M(R.pay.card))}${row('Перевод',M(R.pay.transfer))}${row('Итого получено',M(R.net),'tot')}</div>
  <div class="pr-blk"><h4>Операции</h4>${row('Продажи · '+R.salesN,M(R.sales))}${row('Оплаты заказов · '+R.ordN,M(R.ord))}${row('Возвраты · '+R.refN,(R.ref?'−':'')+M(R.ref))}${row('Скидки',M(R.disc))}${row('В долг · '+R.debtN,M(R.debt),'mut')}</div></div>
  <div class="pr-blk"><h4>По категориям</h4>${cats.length?cats.map(([n,v])=>{ const c=n==='Заказы'?'#64748b':((catOf(n)||{}).color||'#8e8e93'); return `<div class="pr-cat" style="--c:${c}"><span><i></i>${E(n)}</span><em><u style="width:${Math.round(Math.abs(v)/mx*100)}%"></u></em><b>${M(v)}</b></div>`; }).join(''):'<p class="pr-none">Продаж пока нет</p>'}</div>
  <div class="pr-blk pr-cash"><h4>Наличные в кассе</h4>${row('На начало смены',M(R.cash0))}${row('+ Наличные продажи и оплаты',M(R.pay.cash))}${row('+ Внесения · '+R.inN,M(R.cin))}${row('− Изъятия · '+R.outN,M(R.cout))}${row('Должно быть в кассе',M(R.cashExp),'tot')}${cnt!=null?row('Пересчитано',M(cnt))+row('Разница',(diff>0?'+':diff<0?'−':'')+M(Math.abs(diff)),diff===0?'ok':'bad'):''}</div>
  ${print?`<div class="pd-sign"><div>Кассир <i></i></div></div>`:''}</div>`; }
function printRep(R,z){ const html=`<div class="posdoc" data-doc="${z&&z.final?'z':'x'}">${repHTML(R,z,true)}</div>`; KS.print([KS.page(210,297,html,(z&&z.final?'z':'x')+'-'+R.no)]); }

/* price list (A4) */
function pricePages(){ const p=P(), R=reqs(); const groups=p.cats.map(c=>[c,p.items.filter(i=>i.cat===c.name&&!i.hide)]).filter(([,l])=>l.length); const orphan=p.items.filter(i=>!i.hide&&!catOf(i.cat)); if(orphan.length) groups.push([{name:'Разное',color:'#8e8e93'},orphan]);
  /* explicit two-column layout, continued on further pages (a section may continue in the next column) */
  const iu=x=>Math.max(1,Math.ceil(String(x.name||'').length/34)), HU=2.3, GAP=.9;
  const pages=[]; let page=null, col=null, left=0;
  const newCol=()=>{ if(!page||page.cols.length===2){ page={cols:[]}; pages.push(page); } col=[]; page.cols.push(col); left=pages.length===1?38:45; };
  newCol(); groups.forEach(([c,l])=>{ let open=false; l.forEach((it,k)=>{ const need=iu(it)+(open?0:HU); if(need>left&&(open||col.length)){ newCol(); open=false; } if(!open){ col.push({h:c,cont:k>0}); left-=HU; open=true; } col.push({it}); left-=iu(it); }); left-=GAP; });
  const colH=entries=>{ let h='', inSec=false; entries.forEach(e=>{ if(e.h){ if(inSec) h+='</section>'; h+=`<section style="--c:${e.h.color}"><h3>${E(e.h.name)}${e.cont?' <small>продолжение</small>':''}</h3>`; inSec=true; } else { const i=e.it; h+=`<div class="pd-pi"><span>${E(i.name)}</span><i></i><b>${M(i.price)}</b><small>/ ${E(i.unit||'шт')}</small></div>`; } }); return h+(inSec?'</section>':''); };
  const n=pages.length;
  return pages.map((pg,k)=>{ const html=`<div class="posdoc pd-price" data-doc="price" data-page="${k+1}">${k===0?`<div class="pd-top"><div class="pd-shop"><b>${E(R.name)}</b>${R.addr?`<span>${E(R.addr)}</span>`:''}${R.phone?`<span>${E(R.phone)}</span>`:''}</div><div class="pd-no"><small>Прайс-лист</small><b>${fD(Date.now())}</b></div></div><h1>Цены на услуги</h1>`:`<div class="pd-cont"><b>Прайс-лист · ${E(R.name)}</b><span>продолжение</span></div>`}
    ${groups.length?`<div class="pd-pcols2">${pg.cols.map(c=>`<div>${colH(c)}</div>`).join('')}</div>`:'<p>Прайс пуст.</p>'}${n>1?`<div class="pd-pg">Страница ${k+1} из ${n}</div>`:''}</div>`; return KS.page(210,297,html,'price'+(n>1?'-'+(k+1):'')); }); }
function printPrice(){ KS.print(pricePages()); }

/* ---------- small UI helpers ---------- */
function flashOk(rec){ const s=KS.screen('sale'); if(!s||s.hidden||!s.parentElement) return; document.querySelectorAll('.pos-flash').forEach(x=>x.remove()); const f=document.createElement('div'); f.className='pos-flash';
  f.innerHTML=`<div><i>${ICO.ok}</i><b>${rec.pay==='debt'?'Записано в долг':'Оплачено'}</b><span>${M(rec.pay==='debt'?rec.debt:rec.total)}${rec.change>0?' · сдача '+M(rec.change):''}</span></div>`; s.parentElement.appendChild(f); setTimeout(()=>{ f.classList.add('out'); setTimeout(()=>f.remove(),400); },1300); }
function shake(sel){ const n=document.querySelector(sel); if(!n) return; n.classList.remove('pos-shake'); void n.offsetWidth; n.classList.add('pos-shake'); }
function segH(attr,opts,val){ return `<div class="seg pos-seg">${opts.map(([v,n])=>`<button type="button" ${attr}="${E(v)}"${v===val?' class="on"':''}>${n}</button>`).join('')}</div>`; }
const kpi=(l,v,i,cls)=>`<div class="ks-kpi pos-kpi${cls?' '+cls:''}"><small>${l}</small><b>${v}</b>${i?`<i>${i}</i>`:''}</div>`;
function payBtns(attr,val,withDebt){ return `<div class="pos-pays${withDebt?'':' three'}">${['cash','card','transfer'].concat(withDebt?['debt']:[]).map(k=>`<button type="button" class="pos-pay${k===val?' on':''}" ${attr}="${k}" data-k="${k}">${ICO[k]}<span>${PAYN[k]}</span></button>`).join('')}</div>`; }
function quickCash(total){ const notes=[100,500,1000,2000,5000,10000,20000,50000]; const out=[]; if(total>0){ for(const n of notes){ const v=Math.ceil(total/n)*n; if(v>total&&!out.includes(v)) out.push(v); if(out.length>=3) break; } } return out; }
function isOpenTab(id){ const a=KS.active(); return activeTab==='ks-kassa'&&a&&a.id===id; }
function panelBox(){ return document.querySelector('.kspanel[data-panel="ks-kassa"] .kssub'); }
function refresh(){ if(activeTab!=='ks-kassa') return; U.dirty=1; KS.render('update'); }

/* ---------- Продажа: panel (cart) ---------- */
function drawCart(box){ box=box||panelBox(); if(!box) return; const p=P(), c=p.cart, k=cartCalc(c), sh=curShift();
  const done=U.done&&!c.lines.length?p.sales.find(s=>s.id===U.done):null;
  if(done){ const d=done, isDebt=d.pay==='debt', amt=isDebt?d.debt:d.total;
    box.innerHTML=`<div class="pos-done"><div class="pos-okic">${ICO.ok}</div><b class="pos-dtt">${isDebt?'Записано в долг':d.type==='order'?'Оплата принята':'Оплачено'}</b><span class="pos-dsub">Чек № ${d.no} · ${E(PAYN[d.pay])}${d.client?' · '+E(d.client):''}${d.orderNo?' · заказ № '+d.orderNo:''}</span>
      ${d.pay==='cash'&&d.change>0?`<div class="pos-chg"><small>Сдача</small><b data-r="change">${M(d.change)}</b></div>`:`<div class="pos-chg calm"><small>${isDebt?'Долг клиента':'Сумма'}</small><b>${M(amt)}</b></div>`}
      <div class="pos-trow"><span>Итого</span><b>${M(amt)}</b></div>${d.pay==='cash'?`<div class="pos-trow"><span>Получено</span><b>${M(d.got)}</b></div>`:''}
      <div class="hd2">Документы</div><div class="pos-docbtns">${['check','rcpt','invoice','act'].map(kd=>`<button class="btn sm" data-pa="recdoc" data-id="${d.id}" data-kind="${kd}">${ICO.print}${E(DOCN[kd].replace(' выполненных работ','').replace(' на оплату',''))}</button>`).join('')}</div>
      <button class="btn primary pos-newbtn" data-pa="newsale">Новая продажа <kbd>Enter</kbd></button></div>`; return; }
  const lines=c.lines.map(l=>{ const sum=r2(num(l.price)*num(l.qty)), col=l.iid?colOf(p.items.find(i=>i.id===l.iid)||{cat:l.cat}):colOf({cat:l.cat});
    return `<div class="pos-line${l.id===U.lastAdd?' new':''}" data-lid="${l.id}" style="--c:${col}"><div class="pos-lt"><b>${E(l.name)}</b><button class="pos-x" data-pa="del" data-lid="${l.id}" aria-label="Убрать">${ICO.x}</button></div>
      <div class="pos-lb"><label class="pos-price"><input type="text" inputmode="decimal" data-pf="lprice" data-lid="${l.id}" data-dzf="lp-${l.id}" value="${E(l.price)}" aria-label="Цена"><span title="${l.unit?'Цена за '+E(l.unit):'Цена'}">${E(curSym())}${l.unit?'<small>/'+E(l.unit)+'</small>':''}</span></label>
      <div class="pos-step"><button data-pa="qty" data-d="-1" data-lid="${l.id}" aria-label="Меньше">${ICO.minus}</button><input type="text" inputmode="decimal" data-pf="lqty" data-lid="${l.id}" data-dzf="lq-${l.id}" value="${E(qtyS(l.qty))}" aria-label="Количество"><button data-pa="qty" data-d="1" data-lid="${l.id}" aria-label="Больше">${ICO.plus}</button></div>
      <b class="pos-lsum" data-lsum="${l.id}">${M(sum)}</b></div></div>`; }).join('');
  const cl=st.clients||[], known=cl.some(x=>x&&x.name===String(c.client||'').trim());
  const qc=quickCash(k.total);
  box.innerHTML=`<div class="pos-cart${c.lines.length?'':' empty'}">
    <div class="pos-chd"><div><b>Чек № ${p.seq.check}</b><span>${sh?'Смена № '+sh.no+' · с '+fT(sh.open):'Смена откроется с первой продажей'}</span></div>${c.lines.length?`<button class="btn sm" data-pa="clear">Очистить</button>`:''}</div>
    <div class="pos-cli"><span class="pos-ci">${ICO.user}</span><input type="text" id="posCli" data-pf="client" list="posCliDL" autocomplete="off" placeholder="Клиент — необязательно" value="${E(c.client)}"><datalist id="posCliDL">${cl.filter(x=>x&&x.name).slice(0,400).map(x=>`<option value="${E(x.name)}">${E(x.phone||'')}</option>`).join('')}</datalist>
      ${c.client&&!known?`<input type="text" id="posPh" data-pf="phone" inputmode="tel" placeholder="Телефон нового клиента" value="${E(c.phone)}">`:''}</div>
    <div class="pos-lines">${lines||`<div class="pos-empty">${ICO.tag}<b>Чек пуст</b><span>Нажмите на услугу справа — она появится здесь. Повторное нажатие добавляет количество.</span></div>`}</div>
    ${c.lines.length?`<div class="pos-disc"><span>Скидка</span><input type="text" inputmode="decimal" id="posDv" data-pf="dv" placeholder="0" value="${E(c.dv)}">${segH('data-pdk',[['%','%'],['sum',E(curSym())]],c.dk)}<div class="pos-dq">${[5,10,15].map(v=>`<button class="btn sm" data-pa="dq" data-v="${v}">${v}%</button>`).join('')}</div></div>`:''}
    <div class="pos-tot"><div class="pos-trow${k.disc?'':' hid'}" data-r="subrow"><span>Сумма</span><b data-r="sub">${M(k.sub)}</b></div><div class="pos-trow disc${k.disc?'':' hid'}" data-r="discrow"><span>Скидка</span><b data-r="disc">−${M(k.disc)}</b></div>
      <div class="pos-grand"><span>Итого</span><b data-r="total">${M(k.total)}</b></div></div>
    ${payBtns('data-ppay',c.pay,true)}
    ${c.pay==='cash'?`<div class="pos-got"><label><span>Получено</span><input type="text" inputmode="decimal" id="posGot" data-pf="got" data-dzf="posGot" placeholder="без сдачи" value="${E(c.got)}"></label><div class="pos-chgv"><span>Сдача</span><b data-r="change" class="${k.change<0?'neg':''}">${k.got>0?M(k.change):'—'}</b></div></div>
      ${qc.length&&c.lines.length?`<div class="pos-qc"><button class="btn sm" data-pa="got" data-v="">Без сдачи</button>${qc.map(v=>`<button class="btn sm" data-pa="got" data-v="${v}">${M(v)}</button>`).join('')}</div>`:''}`:c.pay==='debt'?`<p class="hint pos-dh">Будет создан заказ на клиента со статусом «Выдан» и долгом. Оплата потом — «Оплата заказов».</p>`:''}
    <div class="pos-paybar"><button class="pos-paybtn${c.pay==='debt'?' debt':''}" data-pa="pay" ${c.lines.length?'':'disabled'}><span>${c.pay==='debt'?'Записать в долг':'Оплатить'}</span><b data-r="paysum">${M(k.total)}</b></button></div>
    <div class="pos-more"><button class="btn sm" data-pa="asorder" ${c.lines.length?'':'disabled'}>${ICO.order}Как заказ</button><button class="btn sm" data-pa="prepay" ${c.lines.length?'':'disabled'}>Предоплата</button><button class="btn sm" data-pa="cartdoc" data-kind="invoice" ${c.lines.length?'':'disabled'}>Счёт</button></div>
    <label class="chk pos-pchk"><input type="checkbox" data-pf="printAfter"${p.set.printAfter?' checked':''}> Печатать ${p.set.printKind==='rcpt'?'квитанцию':'товарный чек'} после оплаты</label>
  </div>`;
  const nl=box.querySelector('.pos-line.new'); if(nl){ const L=box.querySelector('.pos-lines'); if(L&&L.scrollHeight>L.clientHeight){ L.scrollTop=nl.offsetTop-L.offsetTop-40; } setTimeout(()=>nl.classList.remove('new'),700); U.lastAdd=''; } }
/* live totals without rebuilding inputs */
function liveTotals(){ const box=panelBox(); if(!box) return; const c=P().cart, k=cartCalc(c); const set=(r,v)=>{ const n=box.querySelector(`[data-r="${r}"]`); if(n) n.textContent=v; };
  set('sub',M(k.sub)); set('disc','−'+M(k.disc)); set('total',M(k.total)); set('paysum',M(k.total));
  const ch=box.querySelector('[data-r="change"]'); if(ch){ ch.textContent=k.got>0?M(k.change):'—'; ch.classList.toggle('neg',k.change<0); }
  ['subrow','discrow'].forEach(r=>{ const n=box.querySelector(`[data-r="${r}"]`); if(n) n.classList.toggle('hid',!k.disc); });
  c.lines.forEach(l=>{ const n=box.querySelector(`[data-lsum="${l.id}"]`); if(n) n.textContent=M(r2(num(l.price)*num(l.qty))); });
  const qc=box.querySelector('.pos-qc'); if(qc){ const v=quickCash(k.total), bs=[...qc.querySelectorAll('[data-pa="got"]')].slice(1); bs.forEach((b,i)=>{ if(v[i]!=null){ b.dataset.v=v[i]; b.textContent=M(v[i]); b.hidden=false; } else b.hidden=true; }); }
  badges(); }
function syncPhone(){ const box=panelBox(); if(!box) return; const c=P().cart, wrap=box.querySelector('.pos-cli'); if(!wrap) return; const nm=String(c.client||'').trim(), need=!!nm&&!(st.clients||[]).some(x=>x&&x.name===nm); let ph=document.getElementById('posPh');
  if(need&&!ph){ ph=document.createElement('input'); ph.type='text'; ph.id='posPh'; ph.dataset.pf='phone'; ph.setAttribute('inputmode','tel'); ph.placeholder='Телефон нового клиента'; ph.value=c.phone||''; wrap.appendChild(ph); }
  else if(!need&&ph) ph.remove(); }

/* ---------- Продажа: screen (tiles / order payments) ---------- */
function tileH(it,inCart){ const q=inCart[it.id]||0; return `<button class="pos-tile${q?' in':''}" data-pa="add" data-id="${E(it.id)}" style="--c:${colOf(it)}"><span class="pos-tcat">${E(it.cat||'')}</span><b class="pos-tname">${E(it.name)}</b><span class="pos-tprice">${M(it.price)}<small>/ ${E(it.unit||'шт')}</small></span>${it.fav?`<span class="pos-tfav">${ICO.star}</span>`:''}<i class="pos-tq" data-tq="${E(it.id)}">${q?qtyS(q):''}</i></button>`; }
function drawTiles(scr){ scr=scr||KS.screen('sale'); if(!scr) return; const g=scr.querySelector('.pos-body'); if(!g) return; const p=P(), inCart={}; p.cart.lines.forEach(l=>{ if(l.iid) inCart[l.iid]=(inCart[l.iid]||0)+num(l.qty); });
  const q=U.q.trim().toLowerCase(), vis=p.items.filter(i=>!i.hide); const free=`<button class="pos-tile free" data-pa="free"><span class="pos-fi">${ICO.free}</span><b class="pos-tname">Своя позиция</b><span class="pos-tprice sm">любая цена</span></button>`;
  let html='';
  if(q){ const L=vis.filter(i=>(i.name+' '+i.cat).toLowerCase().includes(q)); html=L.length?`<div class="pos-tiles">${L.map(i=>tileH(i,inCart)).join('')}</div>`:`<div class="ks-empty">Ничего не найдено по «${E(U.q)}». <button class="btn sm" data-pa="free">Добавить как свою позицию</button></div>`; }
  else if(U.cat==='*'){ const L=vis.filter(i=>i.fav); html=`<div class="pos-tiles">${free}${L.map(i=>tileH(i,inCart)).join('')}</div>`+(L.length?'':`<p class="hint">Отметьте звёздочкой частые услуги во вкладке «Услуги» — они будут здесь.</p>`); }
  else if(U.cat){ const L=vis.filter(i=>i.cat===U.cat).sort((a,b)=>(b.fav?1:0)-(a.fav?1:0)); html=`<div class="pos-tiles">${free}${L.map(i=>tileH(i,inCart)).join('')}</div>`; }
  else { const fav=vis.filter(i=>i.fav); html=`<div class="pos-sec"><h3>${ICO.star}Избранное</h3><div class="pos-tiles">${free}${fav.map(i=>tileH(i,inCart)).join('')}</div></div>`;
    const known=new Set(p.cats.map(c=>c.name)); p.cats.concat(vis.some(i=>!known.has(i.cat))?[{name:'',color:'#8e8e93'}]:[]).forEach(c=>{ const L=vis.filter(i=>!i.fav&&(c.name?i.cat===c.name:!known.has(i.cat))); if(L.length) html+=`<div class="pos-sec"><h3 style="--c:${c.color}"><i></i>${E(c.name||'Разное')}</h3><div class="pos-tiles">${L.map(i=>tileH(i,inCart)).join('')}</div></div>`; });
    if(!vis.length) html=`<div class="ks-empty">В прайсе нет услуг. Откройте вкладку «Услуги», чтобы добавить.</div>`; }
  g.innerHTML=html; }
function badges(){ const scr=KS.screen('sale'); if(!scr) return; const inCart={}; P().cart.lines.forEach(l=>{ if(l.iid) inCart[l.iid]=(inCart[l.iid]||0)+num(l.qty); });
  scr.querySelectorAll('[data-tq]').forEach(n=>{ const q=inCart[n.dataset.tq]||0; n.textContent=q?qtyS(q):''; n.parentElement.classList.toggle('in',!!q); }); }
function ordCard(o){ const price=num(o.price), paid=num(o.paid), rest=r2(price-paid), pct=price?Math.min(100,Math.round(paid/price*100)):0, st_=(ORD_ST.find(x=>x[0]===o.status)||['','—'])[1];
  const over=o.due&&o.due<KS.today()&&o.status!=='done';
  return `<div class="pos-oc" data-oid="${E(o.id)}"><div class="pos-och"><b>№ ${E(o.no)}</b><span class="pill ${E(o.status)}">${E(st_)}</span>${o.due?`<span class="ks-badge ${over?'bad':o.due===KS.today()?'warn':''}">срок ${fD(o.due+'T12:00')}</span>`:''}</div>
    <div class="pos-ocl">${E(o.client||'Без клиента')}${o.phone?` · <span>${E(o.phone)}</span>`:''}</div><div class="pos-ocp">${E(o.product||'—')}</div>
    <div class="pos-bar"><u style="width:${pct}%"></u></div><div class="pos-ocm"><span>Цена <b>${M(price)}</b></span><span>Оплачено <b>${M(paid)}</b></span><span class="rest">Осталось <b>${M(rest)}</b></span></div>
    <div class="pos-oca"><button class="btn sm primary" data-pa="payord" data-oid="${E(o.id)}">Принять оплату</button><button class="btn sm" data-pa="orddoc" data-kind="invoice" data-oid="${E(o.id)}">Счёт</button><button class="btn sm" data-pa="orddoc" data-kind="act" data-oid="${E(o.id)}">Акт</button></div></div>`; }
function drawOrders(scr){ scr=scr||KS.screen('sale'); if(!scr) return; const g=scr.querySelector('.pos-body'); if(!g) return; const q=U.oq.trim().toLowerCase();
  const all=unpaid(), L=all.filter(o=>!q||[o.no,o.client,o.phone,o.product].join(' ').toLowerCase().includes(q)), debt=r2(all.reduce((a,o)=>a+num(o.price)-num(o.paid),0));
  g.innerHTML=`<div class="pos-osum"><span>Неоплачено: <b>${all.length}</b> ${plural(all.length,['заказ','заказа','заказов'])} на <b>${M(debt)}</b></span></div>`+(L.length?`<div class="pos-ogrid">${L.map(ordCard).join('')}</div>`:`<div class="ks-empty">${all.length?'Ничего не найдено.':'Все заказы оплачены. Здесь появятся заказы, где цена больше оплаченного.'}</div>`); }
function drawSaleScreen(scr){ const p=P(), sh=curShift(), n=unpaid().length; const cats=p.cats.filter(c=>p.items.some(i=>i.cat===c.name&&!i.hide));
  scr.innerHTML=`<div class="pos-head"><div class="pos-ttl"><h2>${U.mode==='orders'?'Оплата заказов':'Продажа'}</h2><span>${sh?'Смена № '+sh.no+' открыта в '+fT(sh.open):'Смена не открыта'}</span></div>
    ${segH('data-pmode',[['items','Услуги и товары'],['orders','Оплата заказов'+(n?` <i class="pos-cnt">${n}</i>`:'')]],U.mode)}
    <label class="pos-search">${ICO.search}<input type="search" id="posQ" data-pf="${U.mode==='orders'?'oq':'q'}" data-dzf="posQ" placeholder="${U.mode==='orders'?'Клиент, телефон или №':'Найти услугу…'}" value="${E(U.mode==='orders'?U.oq:U.q)}" autocomplete="off"></label></div>
    ${U.mode==='orders'?'':`<div class="pos-chips"><button class="pos-chip${!U.cat?' on':''}" data-pa="cat" data-v="">Все</button><button class="pos-chip${U.cat==='*'?' on':''}" data-pa="cat" data-v="*">${ICO.star}Избранное</button>${cats.map(c=>`<button class="pos-chip${U.cat===c.name?' on':''}" data-pa="cat" data-v="${E(c.name)}" style="--c:${c.color}"><i></i>${E(c.name)}</button>`).join('')}</div>`}
    <div class="pos-body"></div>
    <div class="pos-kbd">${U.mode==='orders'?'':'<span><kbd>0–9</kbd> сумма «Получено»</span><span><kbd>Enter</kbd> оплатить</span><span><kbd>+</kbd><kbd>−</kbd> количество</span><span><kbd>/</kbd> поиск</span><span><kbd>Esc</kbd> сброс</span>'}</div>`;
  if(U.mode==='orders') drawOrders(scr); else drawTiles(scr); }

/* ---------- Смена ---------- */
function opRow(s){ const p=P(); const t=s.type, ref=s.refOf?p.sales.find(x=>x.id===s.refOf):null; const neg=num(s.total)<0||t==='out';
  const lab=t==='sale'?'Продажа':t==='refund'||(t==='order'&&s.refund)?'Возврат':t==='order'?(s.pay==='debt'?'В долг':s.prepay?'Предоплата':'Оплата заказа'):t==='in'?'Внесение':'Изъятие';
  const cls=t==='sale'?'ok':neg?'bad':t==='in'?'':s.pay==='debt'?'warn':'';
  const what=t==='in'||t==='out'?E(s.note||''):(s.items||[]).map(x=>E(x.name)+(num(x.qty)!==1?' × '+qtyS(x.qty):'')).join(', ');
  const rf=isMoney(s)&&num(s.total)>0?refunded(s):0, canRef=isMoney(s)&&num(s.total)>0&&rf<num(s.total)-0.001;
  const amt=s.pay==='debt'?num(s.debt):num(s.total);
  return `<tr data-sid="${s.id}"><td class="pos-tm">${fT(s.ts)}${dayKey(s.ts)!==KS.today()?`<small>${fD(s.ts)}</small>`:''}</td><td>${s.no?'№ '+s.no:''}</td><td><span class="ks-badge ${cls}">${lab}</span>${rf?` <span class="ks-badge bad">возврат ${M(rf)}</span>`:''}</td><td class="pos-what">${what}${s.client?`<small>${E(s.client)}</small>`:''}${s.reason?`<small>Причина: ${E(s.reason)}${ref?' · чек № '+ref.no:''}</small>`:''}</td><td>${t==='in'||t==='out'?'Наличные':E(PAYN[s.pay]||'')}</td><td class="num ${neg?'neg':''}"><b>${amt<0||t==='out'?'−':''}${M(Math.abs(amt))}</b></td><td class="pos-act">${s.no?`<button class="btn sm" data-pa="recdocs" data-id="${s.id}" title="Документы">${ICO.print}</button>`:''}${canRef?`<button class="btn sm" data-pa="refund" data-id="${s.id}">Возврат</button>`:''}</td></tr>`; }
function drawShiftPanel(box){ const p=P(), sh=curShift();
  if(!sh){ const last=p.shifts.find(s=>s.close); box.innerHTML=`<div class="card pos-shc"><div class="hd">Смена закрыта</div><p class="hint">Откройте смену утром: укажите, сколько наличных в кассе. Если забыть — смена откроется сама с первой продажей.</p>
      <label class="f">Наличные в кассе на начало<input type="text" inputmode="decimal" id="posCash0" data-dzf="posCash0" placeholder="0" value="${last&&last.counted!=null?E(last.counted):''}"></label>
      <button class="btn primary pos-big" data-pa="openshift">${ICO.unlock}Открыть смену № ${p.seq.shift}</button>${last?`<p class="hint">Прошлая смена № ${last.no} закрыта ${fDT(last.close)}${last.counted!=null?', в кассе осталось '+M(last.counted):''}.</p><button class="btn sm" data-pa="reopen" data-id="${last.id}">Переоткрыть смену № ${last.no}</button>`:''}</div>`; return; }
  const R=calcRep(sh), long=Date.now()-sh.open>20*3600e3;
  box.innerHTML=`<div class="card pos-shc"><div class="hd">Смена № ${sh.no} <span class="ks-badge ok">открыта</span></div><div class="pos-shi"><span>Открыта</span><b>${fDT(sh.open)}</b></div>
    <div class="pos-shi"><span>На начало</span><b><input type="text" inputmode="decimal" id="posC0" data-pf="cash0" data-dzf="posC0" value="${E(sh.cash0)}"> ${E(curSym())}</b></div>
    <div class="pos-drawer"><small>Наличные в кассе сейчас</small><b data-r="cashExp">${M(R.cashExp)}</b></div>
    ${long?`<p class="hint pos-warn">Смена открыта больше 20 часов. Закройте её Z-отчётом, а утром откройте новую.</p>`:''}
    <div class="row2"><button class="btn" data-pa="cashop" data-t="in">${ICO.inn}Внесение</button><button class="btn" data-pa="cashop" data-t="out">${ICO.outt}Изъятие</button></div></div>
  <div class="card"><div class="hd">Отчёты</div><button class="btn" data-pa="xrep">X-отчёт — без закрытия</button><button class="btn primary pos-big" data-pa="zrep">${ICO.lock}Закрыть смену · Z-отчёт</button><p class="hint">Z-отчёт подводит итог: выручка по способам оплаты и категориям, возвраты, сколько наличных должно быть в кассе и сколько пересчитали.</p></div>`; }
const OPS_MAX=300;
function rows(ops){ const m={}; P().sales.forEach(s=>{ if(s.refOf) m[s.refOf]=r2((m[s.refOf]||0)+Math.abs(num(s.total))); }); RFC=m; try{ return ops.slice(0,OPS_MAX).map(opRow).join(''); }finally{ RFC=null; } }
function drawShiftScreen(scr){ const p=P(), sh=curShift(); const R=sh?calcRep(sh):null; const today=KS.today();
  const view=sh?U.opsView:'today'; const ops=(view==='today'?p.sales.filter(s=>dayKey(s.ts)===today):sh?p.sales.filter(s=>s.shift===sh.id):[]).slice().reverse();
  const hist=p.shifts.filter(s=>s.close).slice(0,30);
  scr.innerHTML=`<div class="pos-head"><div class="pos-ttl"><h2>${sh?'Смена № '+sh.no:'Смена закрыта'}</h2><span>${sh?'открыта '+fDT(sh.open):'откройте смену в панели слева'}</span></div><span class="ks-sp"></span>${sh?`<button class="btn sm" data-pa="xrep">X-отчёт</button>`:''}</div>
  ${R?`<div class="ks-kpis pos-kpis">${kpi('Выручка смены',M(R.net),R.ref?'возвраты −'+M(R.ref):'чистыми','acc')}${kpi('Чеков',R.checks,'средний '+M(R.avg))}${kpi('Наличные',M(R.pay.cash),'в кассе '+M(R.cashExp))}${kpi('Карта',M(R.pay.card))}${kpi('Перевод',M(R.pay.transfer))}${kpi('В долг',M(R.debt),R.debtN+' '+plural(R.debtN,['продажа','продажи','продаж']))}</div>`:''}
  <div class="pos-blk"><div class="ks-row"><h3>Операции</h3><span class="ks-sp"></span>${sh?segH('data-pops',[['shift','Эта смена'],['today','Сегодня']],U.opsView):'<span class="pos-sm">за сегодня</span>'}</div>
   ${ops.length?`<div class="pos-tw"><table class="ks-table pos-ops"><thead><tr><th>Время</th><th>Чек</th><th>Операция</th><th>Состав</th><th>Оплата</th><th class="num">Сумма</th><th></th></tr></thead><tbody>${rows(ops)}</tbody></table></div>${ops.length>OPS_MAX?`<p class="hint">Показаны последние ${OPS_MAX} операций из ${ops.length}. Итоги смены считаются по всем.</p>`:''}`:`<div class="ks-empty">${sh?'Операций пока нет. Продажи, оплаты заказов, внесения и возвраты появятся здесь.':'Сегодня операций не было. Откройте смену в панели слева — или просто начните продавать, смена откроется сама.'}</div>`}</div>
  <div class="pos-blk"><h3>История смен</h3>${hist.length?`<div class="pos-tw"><table class="ks-table"><thead><tr><th>Смена</th><th>Открыта</th><th>Закрыта</th><th class="num">Выручка</th><th class="num">Чеков</th><th class="num">Расхождение</th><th></th></tr></thead><tbody>${hist.map(s=>{ const z=s.z||{}; const d=z.diff; return `<tr><td>№ ${s.no}</td><td>${fDT(s.open)}</td><td>${fDT(s.close)}</td><td class="num">${M(z.net||0)}</td><td class="num">${z.checks||0}</td><td class="num">${d==null?'—':`<span class="ks-badge ${d===0?'ok':'bad'}">${d>0?'+':d<0?'−':''}${M(Math.abs(d))}</span>`}</td><td class="pos-act"><button class="btn sm" data-pa="zshow" data-id="${s.id}">Z-отчёт</button></td></tr>`; }).join('')}</tbody></table></div>`:`<div class="ks-empty">Закрытых смен пока нет. После Z-отчёта смена попадёт сюда, отчёт можно будет открыть и напечатать снова.</div>`}</div>`; }

/* ---------- Услуги ---------- */
function svcRow(it,i){ const open=U.svcOpen===it.id, p=P();
  return `<div class="pos-svc${open?' open':''}${it.hide?' off':''}" data-iid="${E(it.id)}" style="--c:${colOf(it)}"><div class="pos-svh"><span class="pos-grip" data-grip="${E(it.id)}" title="Перетащить">${ICO.grip}</span><i class="pos-dot"></i><div class="grow" data-pa="svcopen" data-id="${E(it.id)}"><b>${E(it.name)}</b><span>${M(it.price)} / ${E(it.unit||'шт')}${it.hide?' · скрыта':''}${it.cost?' · себест. '+M(it.cost):''}</span></div><button class="pos-fav${it.fav?' on':''}" data-pa="fav" data-id="${E(it.id)}" title="Избранное">${it.fav?ICO.star:ICO.staro}</button></div>
  ${open?`<div class="pos-svf"><label class="f">Название<input type="text" data-sf="name" data-id="${E(it.id)}" value="${E(it.name)}"></label>
    <div class="row2"><label class="f">Цена, ${E(curSym())}<input type="text" inputmode="decimal" data-sf="price" data-id="${E(it.id)}" value="${E(it.price)}"></label><label class="f">Единица<input type="text" list="posUnits" data-sf="unit" data-id="${E(it.id)}" value="${E(it.unit||'')}"></label></div>
    <div class="row2"><label class="f">Категория<select data-sf="cat" data-id="${E(it.id)}">${p.cats.map(c=>`<option${c.name===it.cat?' selected':''}>${E(c.name)}</option>`).join('')}${catOf(it.cat)?'':`<option selected>${E(it.cat||'')}</option>`}</select></label><label class="f">Себестоимость<input type="text" inputmode="decimal" data-sf="cost" data-id="${E(it.id)}" value="${E(it.cost==null?'':it.cost)}" placeholder="—"></label></div>
    <div class="pos-svo"><label class="chk"><input type="checkbox" data-sf="fav" data-id="${E(it.id)}"${it.fav?' checked':''}> Избранное</label><label class="chk"><input type="checkbox" data-sf="hide" data-id="${E(it.id)}"${it.hide?' checked':''}> Скрыть из кассы</label><label class="pos-col" title="Свой цвет плитки"><input type="color" data-sf="color" data-id="${E(it.id)}" value="${E(colOf(it))}"></label></div>
    <div class="flexw"><button class="btn sm" data-pa="mv" data-d="-1" data-id="${E(it.id)}">${ICO.up}Выше</button><button class="btn sm" data-pa="mv" data-d="1" data-id="${E(it.id)}">${ICO.down}Ниже</button><button class="btn sm" data-pa="svcdup" data-id="${E(it.id)}">Копия</button><button class="btn sm danger" data-pa="svcdel" data-id="${E(it.id)}">Удалить</button><span class="ks-sp"></span><button class="btn sm primary" data-pa="svcopen" data-id="">Готово</button></div></div>`:''}</div>`; }
function svcList(){ const p=P(), q=U.svcQ.trim().toLowerCase(); return p.items.filter(i=>(!U.svcCat||i.cat===U.svcCat)&&(!q||(i.name+' '+i.cat).toLowerCase().includes(q))); }
function drawSvcPanel(box){ const p=P(), L=svcList();
  box.innerHTML=`<div class="card"><div class="hd">Прайс услуг <span class="ks-badge warn">примерные цены</span></div><p class="hint">Цены по умолчанию — примерные для копицентра. Поставьте свои: изменения сразу видны в кассе. ★ — плитка в «Избранном».</p>
    <div class="flexw"><button class="btn sm primary" data-pa="svcadd">${ICO.plus}Услуга</button><button class="btn sm" data-pa="cats">Категории</button><button class="btn sm" data-pa="csvexp">Экспорт CSV</button><button class="btn sm" data-pa="csvimp">Импорт CSV</button></div></div>
  <div class="pos-svtools"><select id="posSvcCat" data-pf="svcCat"><option value="">Все категории · ${p.items.length}</option>${p.cats.map(c=>`<option value="${E(c.name)}"${U.svcCat===c.name?' selected':''}>${E(c.name)} · ${p.items.filter(i=>i.cat===c.name).length}</option>`).join('')}</select><input type="search" id="posSvcQ" data-pf="svcQ" data-dzf="posSvcQ" placeholder="Поиск" value="${E(U.svcQ)}"></div>
  <div class="pos-svl">${L.length?L.map(svcRow).join(''):'<div class="ks-empty">Нет услуг в этом фильтре. Нажмите «+ Услуга».</div>'}</div><datalist id="posUnits">${UNITS.map(u=>`<option value="${u}">`).join('')}</datalist>
  <div class="flexw"><button class="btn sm danger" data-pa="svcreset">Вернуть примерный прайс</button></div>`; }
function drawSvcScreen(scr){ const p=P(), R=reqs(); const groups=p.cats.map(c=>[c,p.items.filter(i=>i.cat===c.name&&!i.hide)]).filter(([,l])=>l.length); const orphan=p.items.filter(i=>!i.hide&&!catOf(i.cat)); if(orphan.length) groups.push([{name:'Разное',color:'#8e8e93'},orphan]);
  scr.innerHTML=`<div class="pos-head"><div class="pos-ttl"><h2>Прайс-лист</h2><span>${E(R.name)} · ${p.items.filter(i=>!i.hide).length} позиций в кассе</span></div><span class="ks-sp"></span><button class="btn sm" data-pa="toSale">${ICO.reg}Открыть кассу</button><button class="btn sm primary" data-pa="printprice">${ICO.print}Печать прайса A4</button></div>
  ${groups.length?`<div class="pos-pl">${groups.map(([c,l])=>`<section style="--c:${c.color}"><h3><i></i>${E(c.name)}<small>${l.length}</small></h3>${l.map(i=>`<div class="pos-pli${U.svcOpen===i.id?' on':''}" data-pa="svcopen" data-id="${E(i.id)}"><span>${i.fav?ICO.star:''}${E(i.name)}</span><i></i><b>${M(i.price)}</b><small>/ ${E(i.unit||'шт')}</small></div>`).join('')}</section>`).join('')}</div>`:`<div class="ks-empty">Прайс пуст. Добавьте услугу в панели слева.</div>`}`; }

/* ---------- Документы ---------- */
function drawDocsPanel(box){ const p=P(), S=st.shop||{}, q=p.req;
  const f=(k,l,v,ph,attr)=>`<label class="f">${l}<input type="text" ${attr||'data-rq'}="${k}" data-dzf="rq-${k}" value="${E(v||'')}" placeholder="${E(ph||'')}"></label>`;
  box.innerHTML=`<div class="card"><div class="hd">Реквизиты на документах</div>
    <div class="row2">${f('name','Название',S.name,'Типография','data-rqs')}${f('phone','Телефон',S.phone,'','data-rqs')}</div>${f('addr','Адрес',S.addr,'','data-rqs')}
    ${f('legal','Юр. лицо / ИП',q.legal,'ИП Петросян А. А.')}<div class="row2">${f('tax','ИНН / ՀՎՀՀ',q.tax,'00000000')}${f('boss','Руководитель',q.boss,'Фамилия И. О.')}</div>
    ${f('bank','Банк',q.bank,'Ameriabank')}${f('acc','Счёт / IBAN',q.acc,'1570000000000000')}
    <label class="f">Условия в счёте<textarea data-rq="terms" data-dzf="rq-terms" rows="2">${E(q.terms||'')}</textarea></label></div>
  <div class="card"><div class="hd">После оплаты</div><label class="chk"><input type="checkbox" data-pf="printAfter"${p.set.printAfter?' checked':''}> Сразу печатать документ</label>
    ${segH('data-ppk',[['check','Товарный чек'],['rcpt','Квитанция']],p.set.printKind)}<p class="hint">Для заказов и предоплат всегда печатается квитанция (2 экземпляра на листе A4).</p>
    <div class="hd2">Формат товарного чека</div>${segH('data-pcs',[['A4','A4'],['A5','A5'],['80','Лента 80'],['58','Лента 58']],p.set.checkSize)}${p.set.checkSize==='80'||p.set.checkSize==='58'?`<p class="hint">Ленточный чек ${E(p.set.checkSize)} мм — для чекового принтера, подключённого к Mac или iPad как обычный принтер (AirPrint / драйвер). В диалоге печати выберите этот принтер. Это не фискальный чек.</p>`:''}
    <label class="chk"><input type="checkbox" data-pf="sound"${p.set.sound?' checked':''}> Звук при оплате</label></div>
  <div class="card"><div class="hd">Нумерация</div><p class="hint">Следующие номера. Повторная печать того же документа сохраняет его номер.</p>
    <div class="row2">${[['check','Чек'],['rcpt','Квитанция'],['invoice','Счёт'],['act','Акт']].map(([k,l])=>`<label class="f">${l}<input type="number" min="1" step="1" data-seq="${k}" data-dzf="seq-${k}" value="${E(p.seq[k])}"></label>`).join('')}</div></div>`; }
function drawDocsScreen(scr){ const p=P(), L=p.docs.filter(d=>!U.docKind||d.kind===U.docKind);
  scr.innerHTML=`<div class="pos-head"><div class="pos-ttl"><h2>Документы</h2><span>Журнал выданных документов · ${p.docs.length}</span></div><span class="ks-sp"></span><button class="btn sm" data-pa="cartdoc" data-kind="invoice"${p.cart.lines.length?'':' disabled'}>Счёт из текущего чека</button><button class="btn sm" data-pa="cartdoc" data-kind="act"${p.cart.lines.length?'':' disabled'}>Акт из текущего чека</button></div>
  <div class="pos-chips">${[['','Все'],['check','Чеки'],['rcpt','Квитанции'],['invoice','Счета'],['act','Акты']].map(([k,n])=>`<button class="pos-chip${U.docKind===k?' on':''}" data-pa="dkind" data-v="${k}">${n}</button>`).join('')}</div>
  <div class="pos-doctypes">${[['check','Товарный чек','после оплаты, A4 или A5'],['rcpt','Квитанция','к заказу, 2 экземпляра на A4'],['invoice','Счёт на оплату','для организаций, с банком'],['act','Акт выполненных работ','подписи обеих сторон']].map(([k,n,h])=>`<div class="pos-dt" data-k="${k}">${ICO.doc}<b>${n}</b><span>${h}</span></div>`).join('')}</div>
  ${L.length?`<div class="pos-tw"><table class="ks-table"><thead><tr><th>Дата</th><th>Документ</th><th>Клиент</th><th class="num">Сумма</th><th></th></tr></thead><tbody>${L.slice(0,150).map(d=>`<tr><td>${fDT(d.ts)}</td><td><b>${E(DOCN[d.kind]||d.kind)} № ${E(d.no)}</b>${d.d&&d.d.orderNo?`<small class="pos-sm">заказ № ${E(d.d.orderNo)}</small>`:''}</td><td>${E(d.client||'—')}</td><td class="num">${M(d.total)}</td><td class="pos-act"><button class="btn sm" data-pa="reprint" data-id="${d.id}">${ICO.print}Печать</button></td></tr>`).join('')}</tbody></table></div>`:`<div class="ks-empty">Документов пока нет. Печатайте чек, квитанцию, счёт или акт после оплаты, из «Оплаты заказов» или из операций смены.</div>`}`; }

/* ---------- tab registration ---------- */
const DRAW={sale:[drawCart,drawSaleScreen],shift:[drawShiftPanel,drawShiftScreen],services:[drawSvcPanel,drawSvcScreen],kdocs:[drawDocsPanel,drawDocsScreen]};
const LAST={};
function sigOf(w){ const p=P(); const o=(st.orders||[]); let os=o.length; for(const x of o) os+=num(x.paid)*7+num(x.price)+(x.status==='cancel'?3:0); return [w,p.sales.length,p.sales.length?p.sales[p.sales.length-1].id:'',JSON.stringify(p.cart),os,p.cur,p.items.length,p.docs.length,p.shifts.length,(st.clients||[]).length,curSym(),(st.shop||{}).name].join('|'); }
function R_(w,box,o){ const s=sigOf(w); if(o.reason==='show'||U.dirty||LAST[w]!==s||!box.firstChild){ U.dirty=0; LAST[w]=s; const [pf,sf]=DRAW[w];
    KS.keepFocus(box,()=>pf(box)); if(o.screen){ const sc=o.screen, top=sc.scrollTop, ob=sc.querySelector('.pos-body'), bt=ob?ob.scrollTop:0; KS.keepFocus(sc,()=>sf(sc)); if(o.reason!=='show'){ sc.scrollTop=top; const nb=sc.querySelector('.pos-body'); if(nb&&!U.top) nb.scrollTop=bt; } U.top=0; } } }
KS.tab({id:'sale',group:'kassa',groupTitle:'Касса',groupIcon:ICO.reg,icon:ICO.reg,title:'Продажа',seg:'Продажа',before:'orders',screen:true,render:(b,o)=>R_('sale',b,o)});
KS.tab({id:'shift',group:'kassa',title:'Смена',seg:'Смена',screen:true,render:(b,o)=>R_('shift',b,o)});
KS.tab({id:'services',group:'kassa',title:'Услуги',seg:'Услуги',screen:true,render:(b,o)=>R_('services',b,o)});
KS.tab({id:'kdocs',group:'kassa',title:'Документы',seg:'Документы',screen:true,render:(b,o)=>R_('kdocs',b,o)});

/* ---------- modals ---------- */
const MD={};
function md(id,title,wide){ return MD[id]||(MD[id]=KS.modal({id:'pos-'+id,title,wide})); }
function ask(title,text,ok,danger){ return new Promise(res=>{ const m=md('ask','Подтвердите'); m.title(title); let done=false; const fin=v=>{ if(done) return; done=true; res(v); };
  m.el.innerHTML=`<p class="pos-askt">${text}</p><div class="pos-mact"><button class="btn" data-ksclose="1">Отмена</button><button class="btn primary${danger?' pos-danger':''}" data-ok="1">${E(ok||'OK')}</button></div>`;
  m.el.querySelector('[data-ok]').onclick=()=>{ fin(true); m.close(); }; const r=m.root; const once=()=>{ fin(false); r.removeEventListener('pos-closed',once); }; r.addEventListener('pos-closed',once); m.open(); setTimeout(()=>{ const b=m.el.querySelector('[data-ok]'); if(b) b.focus(); },30); }); }
KS.on('modalClose',id=>{ const r=document.getElementById('ksm-'+id); if(r) r.dispatchEvent(new Event('pos-closed')); });
function moneyField(id,label,val,ph){ return `<label class="f pos-mf">${label}<input type="text" inputmode="decimal" id="${id}" value="${E(val)}" placeholder="${E(ph||'0')}" autocomplete="off"></label>`; }
function bindEnter(m,fn){ m.el.onkeydown=e=>{ if(e.key==='Enter'&&!e.isComposing&&e.target.tagName!=='TEXTAREA'){ e.preventDefault(); fn(); } }; }
function focusFirst(m,sel){ setTimeout(()=>{ const i=m.el.querySelector(sel||'input'); if(i){ i.focus(); try{ i.select(); }catch(_){} } },40); }

/* free line */
function freeModal(){ const m=md('free','Своя позиция'); const p=P(); const name=U.q.trim();
  m.el.innerHTML=`<label class="f">Название<input type="text" id="pmFn" value="${E(name)}" placeholder="Например: печать бланков" autocomplete="off"></label><div class="row3">${moneyField('pmFp','Цена, '+E(curSym()),'')}<label class="f">Кол-во<input type="text" inputmode="decimal" id="pmFq" value="1"></label><label class="f">Категория<select id="pmFc"><option value="">—</option>${p.cats.map(c=>`<option>${E(c.name)}</option>`).join('')}</select></label></div>
  <label class="chk"><input type="checkbox" id="pmFs"> Сохранить в прайс услуг</label><div class="pos-mact"><button class="btn" data-ksclose="1">Отмена</button><button class="btn primary" id="pmFok">Добавить в чек</button></div>`;
  const go=()=>{ const n=m.el.querySelector('#pmFn').value.trim()||'Услуга', pr=num(m.el.querySelector('#pmFp').value), q=num(m.el.querySelector('#pmFq').value)||1, c=m.el.querySelector('#pmFc').value;
    if(!(pr>=0)||m.el.querySelector('#pmFp').value.trim()===''){ KS.toast('Введите цену'); m.el.querySelector('#pmFp').focus(); return; }
    let iid=''; if(m.el.querySelector('#pmFs').checked){ const it={id:KS.uid('i'),cat:c||(P().cats[0]||{}).name||'',name:n,price:r2(pr),unit:'шт',fav:false}; P().items.push(it); iid=it.id; }
    addLine({name:n,price:pr,qty:q,cat:c,iid}); U.q=''; m.close(); refresh(); };
  m.el.querySelector('#pmFok').onclick=go; bindEnter(m,go); m.open(); focusFirst(m,name?'#pmFp':'#pmFn'); }
/* order / prepayment */
function orderModal(pre){ const p=P(), c=p.cart, k=cartCalc(c); if(!c.lines.length){ KS.toast('Чек пуст'); return; } const lines=itemLines(c); const m=md('order','Заказ из чека'); m.title(pre?'Предоплата и заказ':'Оформить как заказ');
  const due=new Date(Date.now()+864e5); const dueS=dayKey(due.getTime()); let pay='cash';
  m.el.innerHTML=`<p class="hint">Для работ, которые будут готовы позже. Заказ появится во вкладке «Заказы»${pre?', предоплата — в кассе':''}.</p>
  <div class="row2"><label class="f">Клиент *<input type="text" id="pmOc" list="posCliDL2" value="${E(c.client)}" placeholder="Имя или компания" autocomplete="off"></label><label class="f">Телефон<input type="text" id="pmOp" inputmode="tel" value="${E(c.phone||((st.clients||[]).find(x=>x&&x.name===c.client)||{}).phone||'')}"></label></div><datalist id="posCliDL2">${(st.clients||[]).filter(x=>x&&x.name).slice(0,400).map(x=>`<option value="${E(x.name)}">`).join('')}</datalist>
  <div class="row2"><label class="f">Изделие<input type="text" id="pmOn" value="${E(orderProduct(lines))}"></label><label class="f">Срок готовности<input type="date" id="pmOd" value="${dueS}"></label></div>
  <div class="pos-osumm"><span>Сумма заказа</span><b>${M(k.total)}</b></div>
  <div class="pos-prepay${pre?'':' hid'}">${moneyField('pmOa','Предоплата',pre?rm(k.total/2):'')}<div class="pos-qc">${[['0','Без предоплаты'],[rm(k.total/2),'50%'],[k.total,'100%']].map(([v,n])=>`<button class="btn sm" data-pv="${v}">${n}</button>`).join('')}</div>
   ${payBtns('data-mpay','cash',false)}<div class="pos-ocash">${moneyField('pmOg','Получено наличными','','без сдачи')}<div class="pos-chgv"><span>Сдача</span><b id="pmOch">—</b></div></div></div>
  ${pre?'':`<button class="btn sm" id="pmOpre">+ Внести предоплату</button>`}
  <div class="pos-mact"><button class="btn" data-ksclose="1">Отмена</button><button class="btn primary" id="pmOok">${ICO.order}Создать заказ</button></div>`;
  const $m=s=>m.el.querySelector(s), upd=()=>{ const a=num($m('#pmOa').value), g=num($m('#pmOg').value); $m('#pmOch').textContent=g>0&&a>0?M(g-a):'—'; $m('.pos-ocash').hidden=pay!=='cash'; };
  m.el.querySelectorAll('[data-pv]').forEach(b=>b.onclick=()=>{ $m('#pmOa').value=b.dataset.pv==='0'?'':b.dataset.pv; upd(); });
  m.el.querySelectorAll('[data-mpay]').forEach(b=>b.onclick=()=>{ pay=b.dataset.mpay; m.el.querySelectorAll('[data-mpay]').forEach(x=>x.classList.toggle('on',x===b)); upd(); });
  if($m('#pmOpre')) $m('#pmOpre').onclick=()=>{ $m('.pos-prepay').classList.remove('hid'); $m('#pmOpre').remove(); $m('#pmOa').value=rm(k.total/2); upd(); $m('#pmOa').focus(); };
  m.el.oninput=upd;
  const go=()=>{ const cl=$m('#pmOc').value.trim(); if(!cl){ KS.toast('Укажите клиента'); $m('#pmOc').focus(); return; } const a=$m('.pos-prepay').classList.contains('hid')?0:num($m('#pmOa').value), g=num($m('#pmOg').value);
    if(pay==='cash'&&g>0&&g<a){ KS.toast('Получено меньше предоплаты'); return; }
    m.close(); cartToOrder({client:cl,phone:$m('#pmOp').value,product:$m('#pmOn').value,due:$m('#pmOd').value,prepay:a,pay,got:g}); };
  $m('#pmOok').onclick=go; bindEnter(m,go); m.open(); upd(); focusFirst(m,c.client?(pre?'#pmOa':'#pmOn'):'#pmOc'); }
/* accept payment for an order */
function payOrdModal(o){ if(!o) return; const rest=r2(num(o.price)-num(o.paid)); const m=md('payord','Оплата заказа'); m.title('Оплата заказа № '+o.no); let pay='cash';
  m.el.innerHTML=`<div class="pos-ohd"><div><b>${E(o.client||'Без клиента')}</b><span>${E(o.product||'')}</span></div><div class="pos-ohm"><span>Цена ${M(o.price)}</span><span>Оплачено ${M(o.paid)}</span><b>Осталось ${M(rest)}</b></div></div>
  ${moneyField('pmPa','Сумма оплаты',rest)}<div class="pos-qc"><button class="btn sm" data-pv="${rest}">Весь остаток</button>${rest>1?`<button class="btn sm" data-pv="${rm(rest/2)}">Половина</button>`:''}</div>
  ${payBtns('data-mpay','cash',false)}<div class="pos-ocash">${moneyField('pmPg','Получено наличными','','без сдачи')}<div class="pos-chgv"><span>Сдача</span><b id="pmPch">—</b></div></div>
  ${o.status!=='done'?`<label class="chk"><input type="checkbox" id="pmPdone"${o.status==='ready'?' checked':''}> Отметить заказ выданным при полной оплате</label>`:''}
  <div class="pos-mact"><button class="btn" data-ksclose="1">Отмена</button><button class="btn primary" id="pmPok">Принять оплату</button></div>`;
  const $m=s=>m.el.querySelector(s), upd=()=>{ const a=num($m('#pmPa').value), g=num($m('#pmPg').value); $m('#pmPch').textContent=g>0?M(g-a):'—'; $m('.pos-ocash').hidden=pay!=='cash'; $m('#pmPok').textContent='Принять '+M(Math.min(a,rest)); };
  m.el.querySelectorAll('[data-pv]').forEach(b=>b.onclick=()=>{ $m('#pmPa').value=b.dataset.pv; upd(); });
  m.el.querySelectorAll('[data-mpay]').forEach(b=>b.onclick=()=>{ pay=b.dataset.mpay; m.el.querySelectorAll('[data-mpay]').forEach(x=>x.classList.toggle('on',x===b)); upd(); });
  m.el.oninput=upd;
  const go=()=>{ const a=num($m('#pmPa').value), g=num($m('#pmPg').value); if(!(a>0)){ KS.toast('Введите сумму'); return; } if(pay==='cash'&&g>0&&g<Math.min(a,rest)){ KS.toast('Получено меньше суммы'); return; }
    m.close(); payOrder(o,a,pay,g,$m('#pmPdone')&&$m('#pmPdone').checked); };
  $m('#pmPok').onclick=go; bindEnter(m,go); m.open(); upd(); focusFirst(m,'#pmPa'); }
/* refund */
function refundModal(orig){ if(!orig) return; const left=r2(Math.abs(num(orig.total))-refunded(orig)); const m=md('refund','Возврат'); m.title('Возврат по чеку № '+orig.no); let pay=orig.pay==='debt'?'cash':orig.pay;
  const isSale=orig.type==='sale', f=isSale&&num(orig.sub)>0?num(orig.total)/num(orig.sub):1;
  const rows=isSale?(orig.items||[]).map((x,i)=>{ const can=r2(num(x.qty)-refundedQty(orig,i)); return `<div class="pos-rfl"><span>${E(x.name)}<small>${M(x.price)} × ${qtyS(x.qty)}${can<num(x.qty)?' · уже возвращено '+qtyS(num(x.qty)-can):''}</small></span><div class="pos-step"><button type="button" data-rd="-1" data-i="${i}">${ICO.minus}</button><input type="text" inputmode="decimal" data-ri="${i}" data-max="${can}" value="${can>0?qtyS(can):0}"><button type="button" data-rd="1" data-i="${i}">${ICO.plus}</button></div></div>`; }).join(''):'';
  m.el.innerHTML=`<div class="pos-ohd"><div><b>${E(opRowLabel(orig))} · ${fDT(orig.ts)}</b><span>${E(orig.client||'')}</span></div><div class="pos-ohm"><span>Сумма ${M(orig.total)}</span><b>Можно вернуть ${M(left)}</b></div></div>
  ${rows?`<div class="hd2">Что возвращаем</div><div class="pos-rfls">${rows}</div>`:''}
  ${moneyField('pmRa','Сумма возврата',left)}${f!==1&&isSale?`<p class="hint">Сумма считается с учётом скидки чека.</p>`:''}
  <label class="f">Причина<select id="pmRs"><option>Брак / ошибка печати</option><option>Клиент передумал</option><option>Ошибка кассира</option><option>Не тот товар</option><option value="">Другое…</option></select></label><input type="text" id="pmRt" placeholder="Комментарий к причине" autocomplete="off">
  <div class="hd2">Вернуть</div>${payBtns('data-mpay',pay,false)}
  <div class="pos-mact"><button class="btn" data-ksclose="1">Отмена</button><button class="btn primary pos-danger" id="pmRok">Оформить возврат</button></div>`;
  const $m=s=>m.el.querySelector(s);
  const recalc=()=>{ if(!isSale) return; let s=0; m.el.querySelectorAll('[data-ri]').forEach(i=>{ const x=orig.items[+i.dataset.ri]; s+=num(i.value)*num(x.price); }); $m('#pmRa').value=Math.min(left,rm(s*f)); };
  m.el.querySelectorAll('[data-rd]').forEach(b=>b.onclick=()=>{ const i=m.el.querySelector(`[data-ri="${b.dataset.i}"]`); i.value=qtyS(Math.max(0,Math.min(num(i.dataset.max),num(i.value)+ +b.dataset.rd))); recalc(); });
  m.el.querySelectorAll('[data-ri]').forEach(i=>i.oninput=recalc);
  m.el.querySelectorAll('[data-mpay]').forEach(b=>b.onclick=()=>{ pay=b.dataset.mpay; m.el.querySelectorAll('[data-mpay]').forEach(x=>x.classList.toggle('on',x===b)); });
  const go=()=>{ const sel=$m('#pmRs').value, txt=$m('#pmRt').value.trim(); const reason=[sel,txt].filter(Boolean).join(': '); if(!reason){ KS.toast('Укажите причину возврата'); $m('#pmRt').focus(); return; }
    let items=null; if(isSale){ items=[]; m.el.querySelectorAll('[data-ri]').forEach(i=>{ const q=Math.min(num(i.dataset.max),num(i.value)); if(q>0){ const x=orig.items[+i.dataset.ri]; items.push({name:x.name,price:x.price,qty:q,cat:x.cat||'',li:+i.dataset.ri}); } }); }
    const r=doRefund(orig,{amount:$m('#pmRa').value,reason,pay,items}); if(r){ m.close(); if(P().set.printAfter) printRec(r,'check'); } };
  $m('#pmRok').onclick=go; bindEnter(m,go); m.open(); focusFirst(m,'#pmRa'); }
function opRowLabel(s){ return s.type==='sale'?'Продажа':s.type==='order'?'Оплата заказа № '+s.orderNo:'Операция'; }
/* cash in / out */
function cashModal(t){ const m=md('cash','Касса'); m.title(t==='in'?'Внесение наличных':'Изъятие наличных'); const sh=curShift(); const R=sh?calcRep(sh):null;
  const reasons=t==='in'?['Размен','Возврат подотчёта','Другое']:['Инкассация','Покупка бумаги и расходников','Зарплата','Другое'];
  m.el.innerHTML=`${R?`<p class="hint">Сейчас в кассе ${M(R.cashExp)}.</p>`:''}${moneyField('pmCa','Сумма','')}<label class="f">Комментарий<input type="text" id="pmCn" placeholder="${E(reasons[0])}" autocomplete="off"></label><div class="pos-qc">${reasons.map(r=>`<button class="btn sm" data-cr="${E(r)}">${E(r)}</button>`).join('')}</div>
  <div class="pos-mact"><button class="btn" data-ksclose="1">Отмена</button><button class="btn primary" id="pmCok">${t==='in'?'Внести':'Изъять'}</button></div>`;
  m.el.querySelectorAll('[data-cr]').forEach(b=>b.onclick=()=>{ m.el.querySelector('#pmCn').value=b.dataset.cr; });
  const go=()=>{ const a=r2(num(m.el.querySelector('#pmCa').value)); if(!(a>0)){ KS.toast('Введите сумму'); return; } const note=m.el.querySelector('#pmCn').value.trim()||reasons[0];
    if(t==='out'&&R&&a>R.cashExp+0.001){ KS.toast('В кассе только '+M(R.cashExp)); return; }
    addRec({type:t,total:t==='in'?a:-a,pay:'cash',note,items:[]}); m.close(); KS.toast((t==='in'?'Внесено ':'Изъято ')+M(a)); refresh(); };
  m.el.querySelector('#pmCok').onclick=go; bindEnter(m,go); m.open(); focusFirst(m,'#pmCa'); }
/* X / Z reports */
function repModal(kind,shId){ const p=P(); const m=md('rep','Отчёт',true);
  if(kind==='hist'){ const sh=p.shifts.find(s=>s.id===shId); if(!sh) return; const z=sh.z||Object.assign(calcRep(sh),{final:true}); m.title('Z-отчёт · смена № '+sh.no);
    m.el.innerHTML=repHTML(z,Object.assign({},z,{final:true}))+`<div class="pos-mact"><button class="btn" data-ksclose="1">Закрыть</button><button class="btn primary" id="pmZp">${ICO.print}Печать</button></div>`;
    m.el.querySelector('#pmZp').onclick=()=>printRep(z,Object.assign({},z,{final:true})); m.open(); return; }
  const sh=curShift(); if(!sh){ KS.toast('Смена не открыта'); return; } const R=calcRep(sh);
  if(kind==='x'){ m.title('X-отчёт · смена № '+sh.no); m.el.innerHTML=repHTML(R,null)+`<div class="pos-mact"><button class="btn" data-ksclose="1">Закрыть</button><button class="btn primary" id="pmXp">${ICO.print}Печать X-отчёта</button></div>`; m.el.querySelector('#pmXp').onclick=()=>printRep(R,null); m.open(); return; }
  m.title('Закрытие смены № '+sh.no);
  const draw=cnt=>{ const box=m.el.querySelector('.pos-repwrap'); if(box) box.innerHTML=repHTML(R,{counted:cnt,final:true}); };
  m.el.innerHTML=`<div class="pos-zin"><label class="f pos-mf">Пересчитайте наличные в кассе<input type="text" inputmode="decimal" id="pmZc" placeholder="${E(R.cashExp)}" autocomplete="off"></label><div class="pos-qc"><button class="btn sm" id="pmZe">Совпадает: ${M(R.cashExp)}</button></div></div><div class="pos-repwrap"></div>
  <div class="pos-mact"><button class="btn" data-ksclose="1">Отмена</button><button class="btn" id="pmZk">${ICO.lock}Закрыть смену</button><button class="btn primary" id="pmZkp">${ICO.print}Закрыть и напечатать</button></div>`;
  const ci=m.el.querySelector('#pmZc'); ci.oninput=()=>draw(ci.value.trim()===''?null:ci.value); m.el.querySelector('#pmZe').onclick=()=>{ ci.value=R.cashExp; draw(R.cashExp); };
  const go=prn=>{ const z=closeShift(ci.value.trim()===''?R.cashExp:ci.value); m.close(); if(prn&&z) printRep(z,z); };
  m.el.querySelector('#pmZk').onclick=()=>go(false); m.el.querySelector('#pmZkp').onclick=()=>go(true); draw(null); m.open(); focusFirst(m,'#pmZc'); }
function closeShift(counted){ const p=P(), sh=curShift(); if(!sh) return null; sh.close=Date.now(); const R=calcRep(sh); const c=r2(num(counted)); sh.counted=c; sh.z=Object.assign(R,{counted:c,diff:r2(c-R.cashExp),final:true}); p.cur='';
  KS.save(); KS.toast('Смена № '+sh.no+' закрыта. Выручка '+M(R.net)); KS.emit('posChanged',{close:sh.id}); setTimeout(archive,50); refresh(); return sh.z; }
/* documents for a record */
function recDocsModal(rec){ const m=md('recdocs','Документы'); m.title('Документы · чек № '+rec.no);
  m.el.innerHTML=`<p class="hint">${E(opRowLabel(rec))} от ${fDT(rec.ts)} на ${M(rec.pay==='debt'?rec.debt:rec.total)}${rec.client?' · '+E(rec.client):''}</p><div class="pos-docgrid">${['check','rcpt','invoice','act'].map(k=>`<button class="pos-dbtn" data-k="${k}">${ICO.doc}<b>${DOCN[k]}</b><span>${P().docs.some(d=>d.kind===k&&d.src==='sale:'+rec.id)?'уже выдан — тот же номер':'новый номер'}</span></button>`).join('')}</div>`;
  m.el.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{ m.close(); printRec(rec,b.dataset.k); refresh(); }); m.open(); }
/* categories */
function catsModal(){ const m=md('cats','Категории'); const draw=()=>{ const p=P(); m.el.innerHTML=`<p class="hint">Цвет категории — цвет плиток в кассе.</p><div class="pos-cats">${p.cats.map((c,i)=>`<div class="pos-catr"><input type="color" data-cc="${i}" value="${E(c.color)}"><input type="text" data-cn="${i}" value="${E(c.name)}"><span class="pos-cnum">${p.items.filter(x=>x.cat===c.name).length}</span><button class="btn sm icon" data-cu="${i}" title="Выше">${ICO.up}</button><button class="btn sm icon danger" data-cdx="${i}" title="Удалить">${ICO.x}</button></div>`).join('')}</div>
  <div class="ks-row"><input type="text" id="pmCatN" placeholder="Новая категория" autocomplete="off"><button class="btn primary" id="pmCatA">Добавить</button></div><div class="pos-mact"><button class="btn primary" data-ksclose="1">Готово</button></div>`;
    m.el.querySelectorAll('[data-cc]').forEach(i=>i.oninput=()=>{ P().cats[+i.dataset.cc].color=i.value; KS.save(); refresh(); });
    m.el.querySelectorAll('[data-cn]').forEach(i=>i.onchange=()=>{ const p=P(), c=p.cats[+i.dataset.cn], v=i.value.trim(); if(!v||p.cats.some((x,j)=>x.name===v&&j!==+i.dataset.cn)){ KS.toast('Имя пустое или уже есть'); i.value=c.name; return; } p.items.forEach(x=>{ if(x.cat===c.name) x.cat=v; }); if(U.cat===c.name) U.cat=v; if(U.svcCat===c.name) U.svcCat=v; c.name=v; KS.save(); refresh(); });
    m.el.querySelectorAll('[data-cu]').forEach(b=>b.onclick=()=>{ const p=P(), i=+b.dataset.cu; if(i>0){ const [c]=p.cats.splice(i,1); p.cats.splice(i-1,0,c); KS.save(); draw(); refresh(); } });
    m.el.querySelectorAll('[data-cdx]').forEach(b=>b.onclick=async()=>{ const p=P(), c=p.cats[+b.dataset.cdx], n=p.items.filter(x=>x.cat===c.name).length; m.close(); const ok=await ask('Удалить категорию?',`«${E(c.name)}»${n?` — ${n} ${plural(n,['услуга перейдёт','услуги перейдут','услуг перейдут'])} в «Разное»`:''}.`,'Удалить',true); if(ok){ const q=P(); q.cats=q.cats.filter(x=>x.name!==c.name); if(n){ if(!q.cats.some(x=>x.name==='Разное')) q.cats.push({name:'Разное',color:'#8e8e93'}); q.items.forEach(x=>{ if(x.cat===c.name) x.cat='Разное'; }); } KS.save(); refresh(); } catsModal(); });
    const add=()=>{ const i=m.el.querySelector('#pmCatN'), v=i.value.trim(); if(!v) return; const p=P(); if(p.cats.some(x=>x.name===v)){ KS.toast('Такая категория уже есть'); return; } const pal=['#3b82f6','#14b8a6','#ec4899','#f59e0b','#8b5cf6','#22c55e','#ef6c3a','#0ea5e9','#e11d48','#84cc16']; p.cats.push({name:v,color:pal[p.cats.length%pal.length]}); KS.save(); draw(); refresh(); };
    m.el.querySelector('#pmCatA').onclick=add; m.el.querySelector('#pmCatN').onkeydown=e=>{ if(e.key==='Enter') add(); }; };
  draw(); m.open(); }

/* ---------- CSV ---------- */
function csvCell(v){ v=String(v==null?'':v); return /[;"\n\r]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v; }
function csvExport(){ const p=P(); const rows=[['Категория','Название','Цена','Ед.','Себестоимость','Избранное','Скрыта']].concat(p.items.map(i=>[i.cat,i.name,i.price,i.unit||'',i.cost==null?'':i.cost,i.fav?'1':'',i.hide?'1':'']));
  const csv='﻿'+rows.map(r=>r.map(csvCell).join(';')).join('\r\n'); KS.download('uslugi-'+KS.today()+'.csv',new Blob([csv],{type:'text/csv;charset=utf-8'})); KS.toast('Прайс сохранён в CSV'); return csv; }
function csvParse(text){ text=String(text||'').replace(/^﻿/,''); const first=text.split(/\r?\n/)[0]||''; const dl=[';','\t',','].map(d=>[d,first.split(d).length]).sort((a,b)=>b[1]-a[1])[0][0];
  const rows=[]; let row=[], cell='', q=false; for(let i=0;i<text.length;i++){ const ch=text[i]; if(q){ if(ch==='"'){ if(text[i+1]==='"'){ cell+='"'; i++; } else q=false; } else cell+=ch; continue; }
    if(ch==='"') q=true; else if(ch===dl){ row.push(cell); cell=''; } else if(ch==='\n'||ch==='\r'){ if(ch==='\r'&&text[i+1]==='\n') i++; row.push(cell); rows.push(row); row=[]; cell=''; } else cell+=ch; }
  if(cell!==''||row.length){ row.push(cell); rows.push(row); } return rows.filter(r=>r.some(c=>String(c).trim()!=='')); }
function csvItems(text){ const rows=csvParse(text); if(!rows.length) return []; const h=rows[0].map(x=>String(x).trim().toLowerCase()); const find=re=>h.findIndex(x=>re.test(x));
  let ix={cat:find(/^(категор|раздел|группа|category)/),name:find(/^(назван|наимен|услуга|товар|name|позиц)/),price:find(/^(цена|стоим|price|сумма)/),unit:find(/^(ед|unit)/),cost:find(/^(себест|cost)/),fav:find(/^(избран|fav|★)/),hide:find(/^(скры|hidden)/)};
  let data=rows.slice(1); if(ix.name<0||ix.price<0){ ix={cat:0,name:1,price:2,unit:3,cost:4,fav:5,hide:6}; data=rows; if(rows[0].length===2) ix={cat:-1,name:0,price:1,unit:-1,cost:-1,fav:-1,hide:-1}; }
  const g=(r,k)=>ix[k]>=0&&r[ix[k]]!=null?String(r[ix[k]]).trim():'';
  return data.map(r=>{ const name=g(r,'name'), ps=g(r,'price'); if(!name||ps===''||!isFinite(num(ps))) return null; const o={id:KS.uid('i'),cat:g(r,'cat')||'Разное',name,price:r2(num(ps)),unit:g(r,'unit')||'шт',fav:/^(1|да|yes|true|\+|★)$/i.test(g(r,'fav'))}; const c=g(r,'cost'); if(c!=='') o.cost=r2(num(c)); if(/^(1|да|yes|true|\+)$/i.test(g(r,'hide'))) o.hide=true; return o; }).filter(Boolean); }
function applyImport(list,mode){ const p=P(); const pal=['#3b82f6','#14b8a6','#ec4899','#f59e0b','#8b5cf6','#22c55e','#ef6c3a','#0ea5e9','#e11d48','#84cc16'];
  list.forEach(i=>{ if(!p.cats.some(c=>c.name===i.cat)) p.cats.push({name:i.cat,color:pal[p.cats.length%pal.length]}); });
  if(mode==='replace'){ p.items=list; } else { list.forEach(i=>{ const ex=p.items.find(x=>x.name.toLowerCase()===i.name.toLowerCase()); if(ex){ ex.price=i.price; ex.cat=i.cat; if(i.unit) ex.unit=i.unit; if(i.cost!=null) ex.cost=i.cost; ex.fav=i.fav||ex.fav; } else p.items.push(i); }); }
  KS.save(); refresh(); KS.toast('Импортировано: '+list.length); }
async function csvImport(file){ if(!file){ const fs=await KS.pick('.csv,text/csv,text/plain,.txt'); file=fs[0]; } if(!file) return; const text=await file.text(); const list=csvItems(text);
  const m=md('imp','Импорт прайса'); if(!list.length){ m.el.innerHTML=`<p>В файле не нашлось строк с названием и ценой.</p><p class="hint">Формат: Категория;Название;Цена;Ед.;Себестоимость;Избранное — как в «Экспорт CSV».</p><div class="pos-mact"><button class="btn primary" data-ksclose="1">Понятно</button></div>`; m.open(); return; }
  m.el.innerHTML=`<p>Найдено позиций: <b>${list.length}</b>.</p><div class="pos-tw pos-impv"><table class="ks-table"><tbody>${list.slice(0,8).map(i=>`<tr><td>${E(i.cat)}</td><td>${E(i.name)}</td><td class="num">${M(i.price)}</td></tr>`).join('')}${list.length>8?`<tr><td colspan="3" class="hint">… и ещё ${list.length-8}</td></tr>`:''}</tbody></table></div>
  <div class="pos-mact"><button class="btn" data-ksclose="1">Отмена</button><button class="btn" id="pmImR">Заменить весь прайс</button><button class="btn primary" id="pmImM">Обновить и добавить</button></div>`;
  m.el.querySelector('#pmImM').onclick=()=>{ m.close(); applyImport(list,'merge'); }; m.el.querySelector('#pmImR').onclick=()=>{ m.close(); applyImport(list,'replace'); }; m.open(); }

/* ---------- drag to reorder (mouse + touch) ---------- */
let DRG=null;
document.addEventListener('pointerdown',e=>{ const h=e.target.closest('[data-grip]'); if(!h||e.button>0) return; const row=h.closest('.pos-svc'), list=row&&row.parentElement; if(!row) return; e.preventDefault();
  DRG={row,list,id:h.dataset.grip,y0:e.clientY,pid:e.pointerId}; row.classList.add('drag'); try{ h.setPointerCapture(e.pointerId); }catch(_){} });
document.addEventListener('pointermove',e=>{ if(!DRG||e.pointerId!==DRG.pid) return; e.preventDefault(); const {row,list}=DRG; const sibs=[...list.querySelectorAll('.pos-svc')].filter(x=>x!==row);
  let before=null; for(const s of sibs){ const b=s.getBoundingClientRect(); if(e.clientY<b.top+b.height/2){ before=s; break; } } if(before) { if(row.nextElementSibling!==before) list.insertBefore(row,before); } else if(list.lastElementChild!==row||sibs.length&&sibs[sibs.length-1].nextElementSibling) { const last=sibs[sibs.length-1]; if(last&&last.nextElementSibling!==row) last.after(row); }
  const pb=list.closest('.panels'); if(pb){ const r=pb.getBoundingClientRect(); if(e.clientY<r.top+40) pb.scrollTop-=12; else if(e.clientY>r.bottom-40) pb.scrollTop+=12; } },{passive:false});
const endDrag=e=>{ if(!DRG||(e&&e.pointerId!==DRG.pid)) return; const {row,list}=DRG; DRG=null; row.classList.remove('drag'); const ids=[...list.querySelectorAll('.pos-svc')].map(x=>x.dataset.iid); reorder(ids); };
document.addEventListener('pointerup',endDrag); document.addEventListener('pointercancel',endDrag);
function reorder(ids){ const p=P(); const set=new Set(ids); const slots=[]; p.items.forEach((it,i)=>{ if(set.has(it.id)) slots.push(i); }); const byId=Object.fromEntries(p.items.map(i=>[i.id,i])); const nw=p.items.slice(); ids.forEach((id,k)=>{ if(byId[id]&&slots[k]!=null) nw[slots[k]]=byId[id]; });
  if(nw.map(i=>i.id).join()!==p.items.map(i=>i.id).join()){ p.items=nw; KS.save(); refresh(); } }

/* ---------- events ---------- */
document.addEventListener('click',e=>{ const b=e.target.closest('[data-pa],[data-ppay],[data-pdk],[data-pmode],[data-pops],[data-ppk],[data-pcs]'); if(!b||!b.closest('.kspanel[data-panel="ks-kassa"],.ksscreen[data-ksscreen^="kassa:"],.pos-ordbtn,.pos-calcbtn')) return;
  const p=P(), c=p.cart;
  if(b.dataset.ppay){ c.pay=b.dataset.ppay; if(c.pay!=='cash') c.got=''; KS.save(); drawCart(); return; }
  if(b.dataset.pdk){ c.dk=b.dataset.pdk; KS.save(); drawCart(); return; }
  if(b.dataset.pmode){ U.mode=b.dataset.pmode; U.top=1; refresh(); return; }
  if(b.dataset.pops){ U.opsView=b.dataset.pops; refresh(); return; }
  if(b.dataset.ppk){ p.set.printKind=b.dataset.ppk; KS.save(); refresh(); return; }
  if(b.dataset.pcs){ p.set.checkSize=b.dataset.pcs; KS.save(); refresh(); return; }
  const a=b.dataset.pa, id=b.dataset.id, L=b.dataset.lid&&c.lines.find(l=>l.id===b.dataset.lid);
  switch(a){
    case 'add':{ const it=p.items.find(i=>i.id===id); if(!it) return; addLine({iid:it.id,name:it.name,price:it.price,qty:1,cat:it.cat,unit:it.unit}); b.classList.remove('hit'); void b.offsetWidth; b.classList.add('hit'); drawCart(); badges(); return; }
    case 'free': freeModal(); return;
    case 'cat': U.cat=b.dataset.v; U.top=1; refresh(); return;
    case 'del': if(L){ c.lines=c.lines.filter(x=>x!==L); KS.save(); drawCart(); badges(); } return;
    case 'qty': if(L){ const q=r2(num(L.qty)+ +b.dataset.d); if(q<=0) c.lines=c.lines.filter(x=>x!==L); else L.qty=q; KS.save(); drawCart(); badges(); } return;
    case 'clear': c.lines=[]; c.dv=''; c.got=''; KS.save(); drawCart(); badges(); return;
    case 'dq': c.dk='%'; c.dv=String(b.dataset.v); KS.save(); drawCart(); return;
    case 'got': c.got=String(b.dataset.v); KS.save(); drawCart(); return;
    case 'pay': pay(); return;
    case 'newsale': U.done=''; drawCart(); return;
    case 'asorder': orderModal(false); return;
    case 'prepay': orderModal(true); return;
    case 'cartdoc': printCartDoc(b.dataset.kind); return;
    case 'recdoc':{ const r=p.sales.find(s=>s.id===id); if(r){ printRec(r,b.dataset.kind); } return; }
    case 'recdocs':{ const r=p.sales.find(s=>s.id===id); if(r) recDocsModal(r); return; }
    case 'payord': payOrdModal((st.orders||[]).find(o=>o.id===b.dataset.oid)); return;
    case 'orddoc':{ const o=(st.orders||[]).find(x=>x.id===b.dataset.oid); if(o){ printOrderDoc(o,b.dataset.kind); refresh(); } return; }
    case 'refund': refundModal(p.sales.find(s=>s.id===id)); return;
    case 'openshift':{ const i=document.getElementById('posCash0'); const sh=openShift(i?i.value:0); KS.toast('Смена № '+sh.no+' открыта'); refresh(); return; }
    case 'reopen':{ const sh=p.shifts.find(s=>s.id===id); if(!sh||curShift()) return; ask('Переоткрыть смену № '+sh.no+'?','Z-отчёт этой смены будет снят, продажи снова пойдут в неё.','Переоткрыть').then(ok=>{ if(!ok) return; sh.close=0; delete sh.z; delete sh.counted; P().cur=sh.id; KS.save(); refresh(); }); return; }
    case 'cashop': cashModal(b.dataset.t); return;
    case 'xrep': repModal('x'); return;
    case 'zrep': repModal('z'); return;
    case 'zshow': repModal('hist',id); return;
    case 'svcopen': U.svcOpen=U.svcOpen===id?'':id; if(!isOpenTab('services')) KS.show('kassa','services'); refresh(); if(U.svcOpen) setTimeout(()=>{ const n=document.querySelector(`.pos-svc[data-iid="${U.svcOpen}"]`); if(n) n.scrollIntoView({block:'nearest',behavior:'smooth'}); },60); return;
    case 'fav':{ const it=p.items.find(i=>i.id===id); if(it){ it.fav=!it.fav; KS.save(); refresh(); } return; }
    case 'mv':{ const i=p.items.findIndex(x=>x.id===id), L2=svcList(), k=L2.findIndex(x=>x.id===id), t=L2[k+ +b.dataset.d]; if(i<0||!t) return; const j=p.items.indexOf(t); [p.items[i],p.items[j]]=[p.items[j],p.items[i]]; KS.save(); refresh(); return; }
    case 'svcdup':{ const i=p.items.findIndex(x=>x.id===id); if(i<0) return; const n=Object.assign({},p.items[i],{id:KS.uid('i'),name:p.items[i].name+' (копия)'}); p.items.splice(i+1,0,n); U.svcOpen=n.id; KS.save(); refresh(); return; }
    case 'svcdel':{ const it=p.items.find(x=>x.id===id); if(!it) return; ask('Удалить услугу?','«'+E(it.name)+'» исчезнет из прайса и кассы. Прошлые продажи останутся.','Удалить',true).then(ok=>{ if(!ok) return; const q=P(); q.items=q.items.filter(x=>x.id!==id); U.svcOpen=''; KS.save(); refresh(); }); return; }
    case 'svcadd':{ const cat=U.svcCat||(p.cats[0]||{}).name||'Разное'; const it={id:KS.uid('i'),cat,name:'Новая услуга',price:0,unit:'шт',fav:false}; p.items.push(it); U.svcOpen=it.id; U.svcQ=''; KS.save(); refresh(); setTimeout(()=>{ const i=document.querySelector(`[data-sf="name"][data-id="${it.id}"]`); if(i){ i.scrollIntoView({block:'center'}); i.focus(); i.select(); } },60); return; }
    case 'svcreset': ask('Вернуть примерный прайс?','Ваш список услуг и категории заменятся примерными ценами. Продажи и смены не изменятся.','Вернуть',true).then(ok=>{ if(!ok) return; const q=P(); q.items=JSON.parse(JSON.stringify(ITEMS0)); q.cats=JSON.parse(JSON.stringify(CATS0)); U.svcOpen=''; KS.save(); refresh(); }); return;
    case 'cats': catsModal(); return;
    case 'csvexp': csvExport(); return;
    case 'csvimp': csvImport(); return;
    case 'printprice': printPrice(); return;
    case 'toSale': KS.show('kassa','sale'); return;
    case 'dkind': U.docKind=b.dataset.v; refresh(); return;
    case 'reprint':{ const d=p.docs.find(x=>x.id===id); if(d) printEntry(d); return; }
  } });
document.addEventListener('input',e=>{ const t=e.target; if(!t.closest||!t.closest('.kspanel[data-panel="ks-kassa"],.ksscreen[data-ksscreen^="kassa:"]')) return; const p=P(), c=p.cart;
  const f=t.dataset.pf;
  if(f==='q'){ U.q=t.value; drawTiles(); return; }
  if(f==='oq'){ U.oq=t.value; drawOrders(); return; }
  if(f==='svcQ'){ U.svcQ=t.value; const box=panelBox(); const l=box&&box.querySelector('.pos-svl'); if(l){ const L=svcList(); l.innerHTML=L.length?L.map(svcRow).join(''):'<div class="ks-empty">Ничего не найдено.</div>'; } return; }
  if(f==='client'){ c.client=t.value; KS.save(); clearTimeout(U.ct); U.ct=setTimeout(syncPhone,350); return; }
  if(f==='phone'){ c.phone=t.value; KS.save(); return; }
  if(f==='dv'){ c.dv=t.value; KS.save(); liveTotals(); return; }
  if(f==='got'){ c.got=t.value; KS.save(); liveTotals(); return; }
  if(f==='lprice'||f==='lqty'){ const L=c.lines.find(l=>l.id===t.dataset.lid); if(!L) return; if(f==='lprice') L.price=t.value; else L.qty=t.value; KS.save(); liveTotals(); return; }
  if(f==='cash0'){ const sh=curShift(); if(sh){ sh.cash0=r2(num(t.value)); KS.save(); const n=document.querySelector('[data-r="cashExp"]'); if(n) n.textContent=M(calcRep(sh).cashExp); } return; }
  const sf=t.dataset.sf; if(sf&&t.type!=='checkbox'&&t.tagName!=='SELECT'){ const it=p.items.find(i=>i.id===t.dataset.id); if(!it) return; if(sf==='price') it.price=Math.max(0,r2(num(t.value))); else if(sf==='cost'){ if(t.value.trim()==='') delete it.cost; else it.cost=r2(num(t.value)); } else if(sf==='color') it.color=t.value; else it[sf]=t.value; KS.save();
    const row=t.closest('.pos-svc'); if(row){ const s=row.querySelector('.pos-svh .grow'); if(s) s.innerHTML=`<b>${E(it.name)}</b><span>${M(it.price)} / ${E(it.unit||'шт')}${it.hide?' · скрыта':''}${it.cost?' · себест. '+M(it.cost):''}</span>`; if(sf==='color') row.style.setProperty('--c',it.color); }
    const scr=KS.screen('services'); if(scr&&!scr.hidden) drawSvcScreen(scr); return; }
  if(t.dataset.rq!=null){ p.req[t.dataset.rq]=t.value; KS.save(); return; }
  if(t.dataset.rqs!=null){ st.shop[t.dataset.rqs]=t.value; KS.save(); return; }
  if(t.dataset.seq!=null){ const v=Math.floor(num(t.value)); if(v>=1){ p.seq[t.dataset.seq]=v; KS.save(); } return; } });
document.addEventListener('change',e=>{ const t=e.target; if(!t.closest||!t.closest('.kspanel[data-panel="ks-kassa"],.ksscreen[data-ksscreen^="kassa:"]')) return; const p=P(), c=p.cart, f=t.dataset.pf;
  if(f==='printAfter'){ p.set.printAfter=t.checked; KS.save(); document.querySelectorAll('[data-pf="printAfter"]').forEach(x=>{ x.checked=t.checked; }); return; }
  if(f==='sound'){ p.set.sound=t.checked; KS.save(); if(t.checked) chime(); return; }
  if(f==='svcCat'){ U.svcCat=t.value; refresh(); return; }
  /* no full redraw here: a redraw between mousedown and click would swallow the click on «Оплатить» */
  if(f==='client'){ c.client=t.value.trim(); KS.save(); syncPhone(); return; }
  if(f==='lprice'||f==='lqty'){ const L=c.lines.find(l=>l.id===t.dataset.lid); if(!L) return; L.price=Math.max(0,r2(num(L.price))); L.qty=r2(num(L.qty)); t.value=f==='lqty'?qtyS(L.qty):L.price;
    if(L.qty<=0){ c.lines=c.lines.filter(x=>x!==L); const row=t.closest('.pos-line'); if(row) row.remove(); if(!c.lines.length) drawCart(); } KS.save(); liveTotals(); return; }
  if(f==='dv'){ if(c.dk==='%'&&num(c.dv)>100){ c.dv='100'; t.value='100'; } KS.save(); liveTotals(); return; }
  if(f==='got'){ KS.save(); liveTotals(); return; }
  const sf=t.dataset.sf; if(sf){ const it=p.items.find(i=>i.id===t.dataset.id); if(!it) return; if(t.type==='checkbox'){ it[sf]=t.checked; if(!t.checked&&sf==='hide') delete it.hide; } else if(sf==='cat') it.cat=t.value; else if(sf==='name'&&!t.value.trim()){ it.name='Услуга'; } KS.save(); if(t.type==='checkbox'||sf==='cat') refresh(); else { const scr=KS.screen('services'); if(scr&&!scr.hidden) drawSvcScreen(scr); } return; }
  if(t.dataset.rqs!=null){ update(); return; } });

/* keyboard: Mac — digits fill «Получено», Enter pays, +/- quantity, / search; never let keys reach the hidden layout */
window.addEventListener('keydown',e=>{ if(activeTab!=='ks-kassa') return; if(document.querySelector('.modal:not([hidden])')) return; if(e.metaKey||e.ctrlKey||e.altKey) return;
  const a=document.activeElement, typing=a&&(/INPUT|TEXTAREA|SELECT/.test(a.tagName)||a.isContentEditable); const it=KS.active(); const onSale=it&&it.id==='sale';
  if(typing){ if(onSale&&e.key==='Enter'&&a.matches('#posGot,#posDv,[data-pf="lqty"],[data-pf="lprice"]')){ e.preventDefault(); a.dispatchEvent(new Event('change',{bubbles:true})); if(a.id==='posGot') pay(); else a.blur(); } else if(onSale&&e.key==='Escape'&&a.id==='posQ'){ a.value=''; U.q=''; drawTiles(); a.blur(); } return; }
  const nav=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Delete','Backspace','Enter','Escape','[',']'];
  if(!onSale){ if(nav.includes(e.key)) e.stopPropagation(); return; }
  if(U.mode==='orders'){ if(nav.includes(e.key)) e.stopPropagation(); return; }
  const p=P(), c=p.cart; let h=true;
  if(/^[0-9]$/.test(e.key)){ if(U.done){ U.done=''; } if(c.pay!=='cash'){ c.pay='cash'; } c.got=String(c.got||'')+e.key; KS.save(); drawCart(); }
  else if(e.key==='Backspace'){ c.got=String(c.got||'').slice(0,-1); KS.save(); drawCart(); }
  else if(e.key==='Enter'){ if(U.done&&!c.lines.length){ U.done=''; drawCart(); } else pay(); }
  else if(e.key==='Escape'){ if(U.done){ U.done=''; } else if(c.got) c.got=''; else if(U.q){ U.q=''; drawTiles(); } KS.save(); drawCart(); refresh(); }
  else if(e.key==='+'||e.key==='='||e.key==='-'||e.key==='_'){ const L=c.lines[c.lines.length-1]; if(L){ const q=r2(num(L.qty)+(e.key==='-'||e.key==='_'?-1:1)); if(q<=0) c.lines.pop(); else L.qty=q; KS.save(); drawCart(); badges(); } }
  else if(e.key==='/'){ const q=document.getElementById('posQ'); if(q){ q.focus(); } }
  else if(e.key.length===1&&/[a-zа-яё]/i.test(e.key)){ const q=document.getElementById('posQ'); if(q){ q.focus(); q.value+=e.key; U.q=q.value; drawTiles(); } }
  else if(nav.includes(e.key)){ }
  else h=false;
  if(h){ e.preventDefault(); e.stopPropagation(); } },true);

/* ---------- integration ---------- */
KS.on('posAdd',o=>{ try{ o=o||{}; const price=num(o.price); if(!o.name&&!price) return; addLine({name:o.name||'Позиция',price,qty:num(o.qty)||1,cat:o.cat||'',unit:o.unit||'',iid:''}); U.mode='items'; KS.show('kassa','sale'); KS.toast('В кассе: '+(o.name||'позиция')+(num(o.qty)>1?' × '+qtyS(o.qty):'')); }catch(e){ console.error('[pos] posAdd',e); } });
/* undo must not revert sales; keep the order counter monotonic; redraw after the host restored st.ks */
if(typeof travel==='function'){ const _tr=travel; travel=function(){ const seq=st.shop&&+st.shop.orderSeq; const r=_tr.apply(this,arguments); try{ if(st.shop&&seq>(+st.shop.orderSeq||0)) st.shop.orderSeq=seq; refresh(); }catch(_){} return r; }; }
/* «Заказы»: «Принять оплату» in an open unpaid order */
if(typeof renderOrdList==='function'){ const _rol=renderOrdList; renderOrdList=function(){ const r=_rol.apply(this,arguments); try{ document.querySelectorAll('#ordList .item.order[data-oid]').forEach(n=>{ const o=(st.orders||[]).find(x=>x.id===n.dataset.oid); if(!o) return; const fx=n.querySelector('.flexw'); if(!fx||fx.querySelector('.pos-ordbtn')) return; if(o.status==='cancel'||!(num(o.price)-num(o.paid)>0)) return; const b=document.createElement('button'); b.className='btn sm pos-ordbtn'; b.innerHTML='Принять оплату'; b.onclick=ev=>{ ev.stopPropagation(); payOrdModal(o); }; fx.prepend(b); }); }catch(e){ console.error('[pos] orders',e); } return r; }; }
/* «Цена»: «В кассу» next to «Оформить заказ» */
function calcBtn(){ const ref=document.getElementById('shOrder'); if(!ref||document.getElementById('posCalcBtn')) return; const b=document.createElement('button'); b.className='btn sm pos-calcbtn'; b.id='posCalcBtn'; b.textContent='В кассу';
  b.onclick=()=>{ try{ const q=quote(), Pp=prodById(st.prod), sz=curSize(); const name=(Pp?Pp.n:`Изделие ${r1(sz.W)} × ${r1(sz.H)} мм`)+(q.sides===2?', 2 стороны':'')+', '+q.qty+' шт'; KS.emit('posAdd',{name,price:q.total,qty:1,cat:'Полиграфия',unit:'тираж'}); }catch(e){ console.error(e); KS.toast('Не удалось взять расчёт'); } };
  ref.after(b); }
KS.cmd('Касса: новая продажа','касса',()=>KS.show('kassa','sale'));
KS.cmd('Касса: оплата заказов','касса',()=>{ U.mode='orders'; KS.show('kassa','sale'); });
KS.cmd('Касса: X-отчёт','касса',()=>{ KS.show('kassa','shift'); repModal('x'); });
KS.cmd('Касса: закрыть смену (Z-отчёт)','касса',()=>{ KS.show('kassa','shift'); repModal('z'); });
KS.cmd('Касса: прайс услуг','касса',()=>KS.show('kassa','services'));
KS.cmd('Касса: документы и реквизиты','касса',()=>KS.show('kassa','kdocs'));
KS.on('boot',()=>{ try{ P(); calcBtn(); setTimeout(archive,1500); }catch(e){ console.error('[pos] boot',e); } });
KS.on('screenHide',k=>{ if(k==='kassa:sale'){ const f=document.querySelector('.pos-flash'); if(f) f.remove(); } });
/* public API for other modules and tests */
KS.pos={store:P,addLine:o=>{ const l=addLine(o); refresh(); return l; },pay,calcRep,curShift,openShift,closeShift,allSales,archive,unpaid,payOrder,sumWords,cartCalc,docPages,csvItems,printRec};
