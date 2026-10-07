/* «Сводка»: обзор бизнеса, доска заказов, сроки. Module `stats` for Конверт Студия (KS host). */
KS.mod('stats',{title:'Сводка'});

/* ---------------- helpers ---------------- */
const ICON=KS.icon('<path d="M3.5 20h17"/><rect x="5" y="11.5" width="3.2" height="5.5" rx="1"/><rect x="10.4" y="7" width="3.2" height="10" rx="1"/><rect x="15.8" y="4" width="3.2" height="13" rx="1"/>');
const IC={
  phone:KS.icon('<path d="M5 4h3.2l1.6 4-2 1.3a10.5 10.5 0 0 0 6.9 6.9l1.3-2 4 1.6V19a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>'),
  wa:KS.icon('<path d="M4 20l1.3-3.9A8 8 0 1 1 8 18.8L4 20z"/><path d="M9.2 9.3c.2 2.4 2.6 4.9 5.2 5.4l1.1-1.2-1.7-.9-.8.6c-.9-.4-1.8-1.3-2.2-2.2l.6-.8-.9-1.7z"/>'),
  tg:KS.icon('<path d="M21 4.5 3.5 11.3l5.6 2 2 5.9 3.2-3.6 4.4 3.3z"/><path d="m9.1 13.3 8.4-6"/>'),
  plus:KS.icon('<path d="M12 5v14M5 12h14"/>'),
  cal:KS.icon('<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'),
  dl:KS.icon('<path d="M12 4v11m-4.5-4.5L12 15l4.5-4.5M5 19.5h14"/>'),
  left:KS.icon('<path d="m14.5 6-6 6 6 6"/>'),
  right:KS.icon('<path d="m9.5 6 6 6-6 6"/>'),
  x:KS.icon('<path d="M6 6l12 12M18 6 6 18"/>'),
  info:KS.icon('<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.6v.1"/>'),
  board:KS.icon('<rect x="3.5" y="4" width="5" height="16" rx="1.6"/><rect x="9.5" y="4" width="5" height="11" rx="1.6"/><rect x="15.5" y="4" width="5" height="7" rx="1.6"/>'),
  clock:KS.icon('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
  ok:KS.icon('<path d="m5 12.5 4.2 4.2L19 7"/>'),
  alert:KS.icon('<path d="M12 4 2.8 19.5h18.4z"/><path d="M12 10v4.5M12 17.2v.1"/>'),
  coin:KS.icon('<ellipse cx="12" cy="7" rx="7" ry="3"/><path d="M5 7v5c0 1.7 3.1 3 7 3s7-1.3 7-3V7M5 12v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5"/>'),
  chat:KS.icon('<path d="M5 18.5V7a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H8.5z"/><path d="M9 9.5h6M9 12.5h4"/>'),
  sms:KS.icon('<rect x="3.5" y="5.5" width="17" height="13" rx="3"/><path d="m4.5 7.5 7.5 5.5 7.5-5.5"/>'),
  copy:KS.icon('<rect x="8.5" y="8.5" width="11" height="11" rx="2.5"/><path d="M15.5 8.5V6.5a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2"/>'),
  box:KS.icon('<path d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5z"/><path d="M4 8.5 12 13l8-4.5M12 13v7"/>')
};
const E=s=>KS.esc(s==null?'':String(s));
const $q=(s,r)=>(r||document).querySelector(s);
const num=v=>{ if(typeof v==='number') return isFinite(v)?v:0; const n=parseFloat(String(v==null?'':v).replace(/\s/g,'').replace(',','.')); return isFinite(n)?n:0; };
const nf=n=>Math.round(+n||0).toLocaleString('ru-RU');
const cur=()=>(st.shop&&st.shop.cur)||'֏';
const cm=n=>{ const a=Math.abs(n); if(a>=1e6) return (n/1e6).toLocaleString('ru-RU',{maximumFractionDigits:1})+'\u00a0млн'; if(a>=1e3) return (n/1e3).toLocaleString('ru-RU',{maximumFractionDigits:a>=1e4?0:1})+'\u00a0тыс'; return String(Math.round(n)); };
const cmm=n=>cm(n)+'\u00a0'+cur();
const MONEY=n=>KS.money(n).replace(/\s(?=\S+$)/,'\u00a0');
const nkey=s=>(typeof normKey==='function'?normKey(s):String(s||'').toLowerCase().trim());
const stName=s=>(typeof ordStName==='function'?ordStName(s):s);
const plural=(n,a,b,c)=>{ n=Math.abs(n)%100; const k=n%10; return (n>10&&n<20)?c:k===1?a:(k>=2&&k<=4)?b:c; };

/* dates (local ISO 'YYYY-MM-DD') */
const MS=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const MSH=['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'];
const MN=['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const MNS=['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];
const WDS=['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
const WDL=['понедельник','вторник','среда','четверг','пятница','суббота','воскресенье'];
const pad=n=>String(n).padStart(2,'0');
const iso=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const okD=s=>/^\d{4}-\d\d-\d\d$/.test(String(s||''));
const pd=s=>{ const m=/^(\d{4})-(\d\d)-(\d\d)/.exec(String(s||'')); return m?new Date(+m[1],+m[2]-1,+m[3]):new Date(NaN); };
const addD=(s,n)=>{ const d=pd(s); d.setDate(d.getDate()+n); return iso(d); };
const dDiff=(a,b)=>Math.round((pd(b)-pd(a))/864e5);
const dow=s=>(pd(s).getDay()+6)%7;
const eom=s=>{ const d=pd(s); return iso(new Date(d.getFullYear(),d.getMonth()+1,0)); };
const addM=(s,n)=>{ const d=pd(s), day=d.getDate(), x=new Date(d.getFullYear(),d.getMonth()+n,1), last=new Date(x.getFullYear(),x.getMonth()+1,0).getDate(); x.setDate(Math.min(day,last)); return iso(x); };
const minS=(a,b)=>a<b?a:b;
const today=()=>KS.today();
const fD=s=>{ const d=pd(s); return d.getDate()+' '+MSH[d.getMonth()]; };
const fDL=s=>{ const d=pd(s); return d.getDate()+' '+MS[d.getMonth()]; };
function fRange(a,b){ if(!a) return 'за всё время'; const A=pd(a), B=pd(b), ya=A.getFullYear(), yb=B.getFullYear(), cy=+today().slice(0,4), Y=y=>y!==cy?' '+y:'';
  if(a===b) return fDL(a)+Y(ya);
  if(ya===yb&&A.getMonth()===B.getMonth()) return A.getDate()+'–'+B.getDate()+' '+MS[B.getMonth()]+Y(yb);
  if(ya===yb) return fDL(a)+' – '+fDL(b)+Y(yb);
  return fDL(a)+' '+ya+' – '+fDL(b)+' '+yb; }
const saleDay=s=>{ const v=s.ts!=null?s.ts:s.date; if(v==null||v==='') return ''; if(typeof v==='string'&&okD(v.slice(0,10))&&!/^\d+$/.test(v)) return v.length===10?v:iso(new Date(v)); const d=new Date(typeof v==='string'&&/^\d+$/.test(v)?+v:v); return isNaN(d)?'':iso(d); };

/* ---------------- data ---------------- */
const DEF={per:'month',from:'',to:'',rv:'auto',pm:'sum',board:{client:'',over:false,unpaid:false,cancel:false,done:'30'},cal:{view:'month',ym:'',sel:'',done:false}};
function S(){ const s=KS.store('stats',DEF); ['board','cal'].forEach(k=>{ if(!s[k]||typeof s[k]!=='object'||Array.isArray(s[k])) s[k]={}; for(const x in DEF[k]) if(!(x in s[k])) s[k][x]=DEF[k][x]; }); return s; }
const ORD=()=>Array.isArray(st.orders)?st.orders.filter(o=>o&&typeof o==='object'):[];
const SALES=()=>{ const p=st.ks&&st.ks.pos; return p&&Array.isArray(p.sales)?p.sales.filter(s=>s&&typeof s==='object'):[]; };
const findO=id=>ORD().find(o=>o.id===id);
const debtOf=o=>Math.max(0,num(o.price)-num(o.paid));
const isOver=(o,t)=>typeof ordOver==='function'?ordOver(o,t||today()):!!(o.due&&String(o.due)<(t||today())&&!['done','cancel'].includes(o.status));
const fin=o=>o.status==='done'||o.status==='cancel';
const PAYN={cash:'Наличные',card:'Карта',transfer:'Перевод',debt:'В долг',other:'Другое'};
const PAYC={cash:'var(--sv-s1)',card:'var(--sv-s2)',transfer:'var(--sv-s3)',debt:'var(--sv-s4)',other:'var(--sv-s5)'};
function payKey(m){ m=String(m||'').toLowerCase().trim(); if(!m) return 'other'; if(/^(cash|нал)/.test(m)) return 'cash'; if(/^(card|карт|pos|terminal|терм)/.test(m)) return 'card'; if(/(debt|credit|долг)/.test(m)) return 'debt'; if(/(transfer|bank|qr|online|idram|sbp|перев|безнал|счёт|счет)/.test(m)) return 'transfer'; return 'other'; }
function payParts(s){ const p=s.pay, tot=num(s.total);
  if(p&&typeof p==='object'&&!Array.isArray(p)){ const m=p.method||p.type||p.m; if(m) return [[payKey(m),tot]];
    const parts=Object.entries(p).filter(([,v])=>num(v)).map(([k,v])=>[payKey(k),num(v)]); if(parts.length) return parts; }
  return [[payKey(p),tot]]; }
const debtPart=s=>payParts(s).reduce((a,[k,v])=>a+(k==='debt'?v:0),0);
/* money received from one pos operation (HOST.md "Money received"): sale +, refund −, order payments are already in order.paid */
function saleRev(s){ const t=s.type||'sale'; if(t==='sale') return num(s.total)-debtPart(s); if(t==='refund') return -Math.abs(num(s.total)); return 0; }

function agg(a,b){ const inR=d=>(!a&&!b)||(!!d&&(!a||d>=a)&&(!b||d<=b));
  const os=ORD().filter(o=>inR(String(o.date||'').slice(0,10))), act=os.filter(o=>o.status!=='cancel');
  let revO=0; os.forEach(o=>{ revO+=num(o.paid); });
  let posS=0, posR=0, checks=0, debtS=0; const pays={};
  SALES().forEach(s=>{ const d=saleDay(s); if(!inR(d)) return; const t=s.type||'sale';
    if(t==='sale'){ checks++; payParts(s).forEach(([k,v])=>{ pays[k]=(pays[k]||0)+v; if(k==='debt') debtS+=v; }); posS+=saleRev(s); }
    else if(t==='refund'){ posR+=Math.abs(num(s.total)); payParts(s).forEach(([k,v])=>{ pays[k]=(pays[k]||0)-Math.abs(v); }); }
    else if(t==='order'){ payParts(s).forEach(([k,v])=>{ pays[k]=(pays[k]||0)+v; }); } });
  const sumPrice=act.reduce((s,o)=>s+num(o.price),0), wc=act.filter(o=>num(o.cost)>0), cost=wc.reduce((s,o)=>s+num(o.cost),0), cp=wc.reduce((s,o)=>s+num(o.price),0);
  return {os,act,revO,posS,posR,rev:revO+posS-posR,count:act.length,avg:act.length?sumPrice/act.length:0,sumPrice,cost,profit:cp-cost,costN:wc.length,costPrice:cp,checks,debtS,pays}; }

/* revenue in buckets: keys = list of 'YYYY-MM-DD' (gran d) or 'YYYY-MM' (gran m) */
function revBuckets(keys,gran){ const idx=new Map(keys.map((k,i)=>[k,i])), z=()=>keys.map(()=>0), o=z(), p=z(), r=z(), n=z(), kf=gran==='m'?(d=>d.slice(0,7)):(d=>d.slice(0,10));
  ORD().forEach(x=>{ const i=idx.get(kf(String(x.date||''))); if(i==null) return; o[i]+=num(x.paid); if(x.status!=='cancel') n[i]++; });
  SALES().forEach(s=>{ const d=saleDay(s); if(!d) return; const i=idx.get(kf(d)); if(i==null) return; const t=s.type||'sale'; if(t==='sale') p[i]+=saleRev(s); else if(t==='refund') r[i]+=Math.abs(num(s.total)); });
  return {o,p,r,n}; }
function dataStart(){ let m=today(); ORD().forEach(o=>{ const d=String(o.date||'').slice(0,10); if(okD(d)&&d<m) m=d; }); SALES().forEach(s=>{ const d=saleDay(s); if(d&&d<m) m=d; }); return m; }

/* ---------------- period ---------------- */
const PERS=[['today','Сегодня'],['week','Неделя'],['month','Месяц'],['quarter','Квартал'],['year','Год'],['all','Всё время'],['custom','Свой период']];
function period(){ const s=S(), t=today(); let k=s.per, a, b=t, pa=null, pb=null;
  if(k==='today'){ a=t; pa=pb=addD(t,-1); }
  else if(k==='week'){ a=addD(t,-dow(t)); pa=addD(a,-7); pb=addD(b,-7); }
  else if(k==='month'){ a=t.slice(0,8)+'01'; pa=addM(a,-1); pb=minS(addM(b,-1),eom(pa)); }
  else if(k==='quarter'){ const m=+t.slice(5,7); a=t.slice(0,5)+pad(m-(m-1)%3)+'-01'; pa=addM(a,-3); pb=minS(addM(b,-3),eom(addM(pa,2))); }
  else if(k==='year'){ a=t.slice(0,4)+'-01-01'; pa=addM(a,-12); pb=addM(b,-12); }
  else if(k==='custom'){ a=okD(s.from)?s.from:addD(t,-29); b=okD(s.to)?s.to:t; if(a>b){ const x=a; a=b; b=x; } const len=dDiff(a,b)+1; pb=addD(a,-1); pa=addD(a,-len); }
  else { k='all'; a=null; b=null; }
  return {k,a,b,pa,pb,label:fRange(a,b),plabel:pa?fRange(pa,pb):''}; }
function autoRv(P){ if(P.k==='quarter') return '90'; if(P.k==='year'||P.k==='all') return '12m'; if(P.k==='custom'){ const n=dDiff(P.a,P.b)+1; return n<=31?'30':n<=92?'90':'12m'; } return '30'; }

/* ---------------- text measure, svg ---------------- */
const MC=document.createElement('canvas').getContext('2d');
const tw=(t,px,w)=>{ MC.font=(w||400)+' '+(px||11)+'px "Golos Text", system-ui, -apple-system, sans-serif'; return MC.measureText(String(t)).width; };
const fit=(t,max,px,w)=>{ t=String(t); if(tw(t,px,w)<=max) return t; while(t.length>1&&tw(t+'…',px,w)>max) t=t.slice(0,-1); return t.trim()+'…'; };
function ticks(mx,n,int){ if(!(mx>0)) return [0,1]; const raw=mx/(n||4), p=Math.pow(10,Math.floor(Math.log10(raw))), f=raw/p; let step=(f<=1?1:f<=2?2:f<=2.5?2.5:f<=5?5:10)*p; if(int) step=Math.max(1,Math.ceil(step)); const out=[]; for(let v=0;v<mx+step*.999;v+=step) out.push(+v.toPrecision(12)); if(out.length<2) out.push(step); return out; }
const rrTop=(x,y,w,h,r)=>{ r=Math.max(0,Math.min(r,w/2,h)); return `M${x.toFixed(2)},${(y+h).toFixed(2)}V${(y+r).toFixed(2)}A${r},${r} 0 0 1 ${(x+r).toFixed(2)},${y.toFixed(2)}H${(x+w-r).toFixed(2)}A${r},${r} 0 0 1 ${(x+w).toFixed(2)},${(y+r).toFixed(2)}V${(y+h).toFixed(2)}Z`; };
const rrRight=(x,y,w,h,r)=>{ r=Math.max(0,Math.min(r,h/2,w)); return `M${x.toFixed(2)},${y.toFixed(2)}H${(x+w-r).toFixed(2)}A${r},${r} 0 0 1 ${(x+w).toFixed(2)},${(y+r).toFixed(2)}V${(y+h-r).toFixed(2)}A${r},${r} 0 0 1 ${(x+w-r).toFixed(2)},${(y+h).toFixed(2)}H${x.toFixed(2)}Z`; };
const TIP={};
/* vertical (stacked) columns. o:{id,W,H,cats:[{x,v:[],dim,tip}],ser:[color],fmt,int,peak,aria} */
function colChart(o){ const W=Math.max(200,o.W), H=o.H||210, n=o.cats.length||1, tot=o.cats.map(c=>c.v.reduce((a,b)=>a+Math.max(0,b),0)), mx=Math.max(0,...tot);
  const tk=ticks(mx,4,o.int), top=tk[tk.length-1]||1, fmt=o.fmt||(v=>String(v));
  const L=Math.ceil(Math.max(...tk.map(t=>tw(fmt(t)))))+12, R=4, T=16, B=24, pw=Math.max(10,W-L-R), ph=H-T-B, band=pw/n, bw=Math.max(2,Math.min(24,band>14?band*.62:band-2));
  let g='', hits='', bars='', xl='', pk=''; TIP[o.id]=[];
  tk.forEach(t=>{ const y=Math.round(T+ph-t/top*ph)+.5; g+=`<line class="sv-gl" x1="${L}" x2="${W-R}" y1="${y}" y2="${y}"/><text class="sv-tk" x="${L-8}" y="${(y+3.5).toFixed(1)}" text-anchor="end">${E(fmt(t))}</text>`; });
  o.cats.forEach((c,i)=>{ const x0=L+band*i, x=x0+(band-bw)/2; TIP[o.id][i]=c.tip;
    hits+=`<rect class="sv-hit" data-svt="${o.id}:${i}" x="${x0.toFixed(2)}" y="${T-6}" width="${band.toFixed(2)}" height="${ph+6}"/>`;
    let y=T+ph; const segs=c.v.map((v,k)=>[k,Math.max(0,v)]).filter(s=>s[1]>0);
    segs.forEach(([k,v],j)=>{ const h=v/top*ph, gap=j>0?2:0; y-=h; const hh=h-gap; if(hh<=.3) return; const cls='sv-bar'+(c.dim?' sv-dim':'');
      bars+=j===segs.length-1?`<path class="${cls}" fill="${o.ser[k]}" d="${rrTop(x,y,bw,hh,4)}"/>`:`<rect class="${cls}" fill="${o.ser[k]}" x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${bw.toFixed(2)}" height="${hh.toFixed(2)}"/>`; });
    if(c.x) xl+=`<text class="sv-tk" x="${(x0+band/2).toFixed(1)}" y="${H-6}" text-anchor="middle">${E(c.x)}</text>`; });
  if(o.peak&&mx>0){ const i=tot.indexOf(mx), cx=L+band*i+band/2, lb=o.peak(mx), w=tw(lb,11,600)/2; const xx=Math.min(W-R-w,Math.max(L+w,cx)); pk=`<text class="sv-pk" x="${xx.toFixed(1)}" y="${(T+ph-mx/top*ph-5).toFixed(1)}" text-anchor="middle">${E(lb)}</text>`; }
  const by=T+ph+.5;
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${E(o.aria||'')}">${g}${hits}${bars}<line class="sv-bl" x1="${L}" x2="${W-R}" y1="${by}" y2="${by}"/>${xl}${pk}</svg>`; }
/* horizontal bars. o:{id,W,rows:[{l,v,lbl,tip,other}]} */
function hbar(o){ const W=Math.max(220,o.W), rh=30, rows=o.rows, H=rows.length*rh+2, mx=Math.max(0,...rows.map(r=>r.v));
  const vw=Math.max(...rows.map(r=>tw(r.lbl,11.5,600)))+12, lw=Math.min(Math.max(...rows.map(r=>tw(r.l,12.5)))+14,W*.42), x0=lw, x1=W-vw;
  let s=''; TIP[o.id]=[];
  rows.forEach((r,i)=>{ const y=i*rh, w=mx>0?Math.max(3,r.v/mx*(x1-x0)):3, bh=14, by=y+(rh-bh)/2; TIP[o.id][i]=r.tip;
    s+=`<rect class="sv-hit" data-svt="${o.id}:${i}" x="0" y="${y}" width="${W}" height="${rh}" rx="8"/>`
      +`<text class="sv-lb${r.other?' oth':''}" x="2" y="${y+rh/2+4.5}">${E(fit(r.l,lw-14,12.5))}</text>`
      +`<path class="sv-bar" fill="${r.other?'var(--sv-other)':'var(--sv-s1)'}" d="${rrRight(x0,by,w,bh,4)}"/>`
      +`<text class="sv-vl" x="${(x0+w+8).toFixed(1)}" y="${y+rh/2+4}">${E(r.lbl)}</text>`; });
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${E(o.aria||'')}">${s}</svg>`; }
/* donut + legend. o:{id,items:[{k,l,v,c}]} */
function donut(o){ const it=o.items.filter(x=>x.v>0), tot=it.reduce((a,x)=>a+x.v,0), R=58, SW=18, C=2*Math.PI*R, gap=it.length>1?2.5:0; let acc=0, segs=''; TIP[o.id]=[];
  it.forEach((x,i)=>{ const len=x.v/tot*C; TIP[o.id][i]={t:x.l,r:[[x.c,'сумма',MONEY(x.v),1],['','доля',Math.round(x.v/tot*100)+'%']]};
    segs+=`<circle class="sv-arc" data-svt="${o.id}:${i}" cx="74" cy="74" r="${R}" fill="none" stroke="${x.c}" stroke-width="${SW}" stroke-dasharray="${Math.max(.01,len-gap).toFixed(2)} ${C.toFixed(2)}" stroke-dashoffset="${(-acc).toFixed(2)}" transform="rotate(-90 74 74)"/>`; acc+=len; });
  const leg=it.map(x=>`<div class="sv-dl"><i style="background:${x.c}"></i><span>${E(x.l)}</span><b>${E(MONEY(x.v))}</b><small>${Math.round(x.v/tot*100)}%</small></div>`).join('');
  return `<div class="sv-donut"><svg width="148" height="148" viewBox="0 0 148 148" role="img" aria-label="${E(o.aria||'')}"><circle cx="74" cy="74" r="${R}" fill="none" stroke="var(--sv-grid)" stroke-width="${SW}"/>${segs}<text class="sv-dc" x="74" y="76" text-anchor="middle">${E(cm(tot))}</text><text class="sv-tk" x="74" y="94" text-anchor="middle">${E(cur())} · итого</text></svg><div class="sv-dleg">${leg}</div></div>`; }
function spark(vals){ const n=vals.length, mx=Math.max(0,...vals); if(n<3||!(mx>0)) return ''; const W=200, H=34, X=i=>i/(n-1)*W, Y=v=>H-2-(Math.max(0,v)/mx)*(H-6);
  const pts=vals.map((v,i)=>X(i).toFixed(1)+','+Y(v).toFixed(1)), line='M'+pts.join('L'), area=line+`L${W},${H}L0,${H}Z`;
  return `<svg class="sv-spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><path d="${area}" fill="var(--sv-s1)" opacity=".13"/><path d="${line}" fill="none" stroke="var(--sv-s1)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>`; }

/* ---------------- tooltip ---------------- */
let tipEl=null, tipCur=null, tipPin=false;
function tipNode(){ if(!tipEl||!tipEl.isConnected){ tipEl=document.createElement('div'); tipEl.id='sv-tip'; tipEl.className='sv-tip'; tipEl.hidden=true; tipEl.setAttribute('role','tooltip'); document.body.appendChild(tipEl); } return tipEl; }
function tipShow(hit,x,y){ const [c,i]=String(hit.dataset.svt).split(':'), d=TIP[c]&&TIP[c][+i]; if(!d){ tipHide(); return; } const el=tipNode();
  if(tipCur!==hit){ if(tipCur) tipCur.classList.remove('hov'); tipCur=hit; hit.classList.add('hov'); el.textContent='';
    const h=document.createElement('div'); h.className='sv-tth'; h.textContent=d.t; el.appendChild(h);
    (d.r||[]).forEach(r=>{ const row=document.createElement('div'); row.className='sv-ttr'+(r[3]?' tot':''); const k=document.createElement('i'); if(r[0]) k.style.background=r[0]; else k.className='nk'; const b=document.createElement('b'); b.textContent=r[2]; const sp=document.createElement('span'); sp.textContent=r[1]; row.append(k,b,sp); el.appendChild(row); });
    if(d.f){ const f=document.createElement('div'); f.className='sv-ttf'; f.textContent=d.f; el.appendChild(f); } }
  el.hidden=false; const w=el.offsetWidth, h=el.offsetHeight; let L=x+14, T=y-h-14; if(L+w>innerWidth-8) L=x-w-14; if(L<8) L=8; if(T<8) T=y+18; if(T+h>innerHeight-8) T=innerHeight-h-8; el.style.left=L+'px'; el.style.top=T+'px'; }
function tipHide(){ if(tipCur){ tipCur.classList.remove('hov'); tipCur=null; } if(tipEl) tipEl.hidden=true; tipPin=false; }
document.addEventListener('pointermove',e=>{ if(e.pointerType==='touch'||tipPin) return; const h=e.target&&e.target.closest&&e.target.closest('[data-svt]'); if(h) tipShow(h,e.clientX,e.clientY); else if(tipCur) tipHide(); },{passive:true});
document.addEventListener('pointerdown',e=>{ const h=e.target&&e.target.closest&&e.target.closest('[data-svt]'); if(h&&e.pointerType!=='mouse'){ tipHide(); tipShow(h,e.clientX,e.clientY); tipPin=true; return; } if(tipCur||tipPin) tipHide(); },true);
document.addEventListener('scroll',()=>{ if(tipCur) tipHide(); },true);
KS.on('screenHide',()=>tipHide());

/* ---------------- snackbar with action buttons ---------------- */
let snT=0;
function snack(msg,acts){ let el=$q('#sv-snack'); if(!el){ el=document.createElement('div'); el.id='sv-snack'; el.className='sv-snack glass'; el.setAttribute('role','status'); document.body.appendChild(el);
    el.addEventListener('click',e=>{ const b=e.target.closest('[data-sva]'); if(!b) return; const a=(el._acts||[])[+b.dataset.sva]; snHide(); if(a) try{ a.run(); }catch(err){ console.error(err); } }); }
  el._acts=acts||[]; el.innerHTML=`<span class="sv-snm">${E(msg)}</span>`+el._acts.map((a,i)=>`<button class="btn sm${i?'':' primary'}" data-sva="${i}">${E(a.label)}</button>`).join('');
  el.hidden=false; requestAnimationFrame(()=>el.classList.add('show')); clearTimeout(snT); snT=setTimeout(snHide,6500); }
function snHide(){ const el=$q('#sv-snack'); if(!el) return; el.classList.remove('show'); clearTimeout(snT); setTimeout(()=>{ if(!el.classList.contains('show')) el.hidden=true; },250); }

/* ---------------- app integration ---------------- */
function openOrder(id){ const o=findO(id); if(!o) return; const sh=st.shop||{}; const f=sh.filter||'active';
  const vis=f==='all'||(f==='active'?!fin(o):o.status===f); if(!vis) sh.filter='all';
  if(sh.q){ sh.q=''; const q=$q('#ordQ'); if(q) q.value=''; }
  ordOpen=id; tipHide(); goTab('orders');
  setTimeout(()=>{ const el=$q(`#ordList [data-oid="${CSS.escape(id)}"]`); if(el){ el.scrollIntoView({block:'center'}); el.classList.add('sv-flash'); setTimeout(()=>el.classList.remove('sv-flash'),1800); } },60); }
function createOrder(pre){ tipHide(); goTab('orders'); const o=newOrder(Object.assign({},pre||{})); const sh=st.shop; sh.filter='active'; if(sh.q){ sh.q=''; const q=$q('#ordQ'); if(q) q.value=''; } update();
  setTimeout(()=>{ const i=$q(`[data-ord="${CSS.escape(o.id)}"][data-f="client"]`); if(i){ i.scrollIntoView({block:'center'}); i.focus(); } },80); return o; }
/* phone → international digits for wa.me (Armenia 0XX… → 374…, Russia 8… → 7…) */
function waDigits(p){ const raw=String(p||'').trim(); let d=raw.replace(/\D/g,''); if(!d) return ''; if(raw.startsWith('+')||raw.startsWith('00')) return d.replace(/^00/,'');
  if(d.length===9&&d[0]==='0') return '374'+d.slice(1); if(d.length===8) return '374'+d; if(d.length===11&&d[0]==='8') return '7'+d.slice(1); return d; }
const telHref=p=>'tel:'+String(p||'').replace(/[^\d+]/g,'');
function msgText(o){ const sh=st.shop||{}, nm=String(sh.name||'').trim(), d=debtOf(o), pr=o.product?` (${o.product}${o.qty?' × '+o.qty:''})`:'';
  const sign=[nm,sh.phone].filter(Boolean).join(', ');
  if(o.status==='ready'||o.status==='done') return `Здравствуйте! Ваш заказ №${o.no}${pr} готов. ${d>0?`К оплате: ${MONEY(d)}. `:''}Можно забирать${sh.addr?` по адресу: ${sh.addr}`:''}.${sign?' '+sign:''}`;
  return `Здравствуйте! ${nm?`Это ${nm}. `:''}Пишем по вашему заказу №${o.no}${pr}.${o.due?` Срок готовности: ${fDL(o.due)}.`:''}${sh.phone?' Тел.: '+sh.phone:''}`; }
const waUrl=o=>'https://wa.me/'+waDigits(o.phone)+'?text='+encodeURIComponent(msgText(o));
function tgSend(o){ const t=msgText(o), d=waDigits(o.phone); const go=()=>{ try{ window.open(d?'https://t.me/+'+d:'https://t.me/share/url?url=%20&text='+encodeURIComponent(t),'_blank','noopener'); }catch(_){} };
  try{ if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(t).then(()=>{ KS.toast('Текст скопирован — вставьте его в чат Telegram'); go(); },()=>{ go(); }); return; } }catch(_){} go(); }

const smsHref=o=>'sms:+'+waDigits(o.phone)+'?&body='+encodeURIComponent(msgText(o));
let menuEl=null;
function closeMenu(){ if(menuEl){ menuEl.remove(); menuEl=null; } }
function msgMenu(btn,o){ closeMenu(); const txt=msgText(o), el=document.createElement('div'); el.className='sv-menu'; el.id='sv-menu'; el.setAttribute('role','menu');
  el.innerHTML=`<div class="sv-mh"><b>Сообщение · № ${E(o.no)}</b><span>${E(o.client||'')}${o.phone?' · '+E(o.phone):''}</span></div><div class="sv-mt">${E(txt)}</div>
    <a class="sv-mi wa" role="menuitem" href="${E(waUrl(o))}" target="_blank" rel="noopener" data-svm="wa">${IC.wa}<span>WhatsApp</span></a>
    <button class="sv-mi tg" role="menuitem" data-svm="tg">${IC.tg}<span>Telegram</span><small>текст скопируется</small></button>
    <a class="sv-mi" role="menuitem" href="${E(smsHref(o))}" data-svm="sms">${IC.sms}<span>SMS</span></a>
    <button class="sv-mi" role="menuitem" data-svm="copy">${IC.copy}<span>Скопировать текст</span></button>`;
  document.body.appendChild(el); menuEl=el; const r=btn.getBoundingClientRect(), w=el.offsetWidth, h=el.offsetHeight; let L=Math.min(r.left,innerWidth-w-10), T=r.bottom+6; if(T+h>innerHeight-10) T=Math.max(10,r.top-h-6); el.style.left=Math.max(10,L)+'px'; el.style.top=T+'px';
  el.addEventListener('click',e=>{ const b=e.target.closest('[data-svm]'); if(!b) return; const k=b.dataset.svm;
    if(k==='tg') tgSend(o); else if(k==='copy'){ try{ navigator.clipboard.writeText(txt).then(()=>KS.toast('Текст сообщения скопирован'),()=>KS.toast('Не удалось скопировать')); }catch(_){ KS.toast('Не удалось скопировать'); } }
    setTimeout(closeMenu,0); });
  const f=el.querySelector('.sv-mi'); if(f) try{ f.focus({preventScroll:true}); }catch(_){} }
document.addEventListener('pointerdown',e=>{ if(menuEl&&!menuEl.contains(e.target)&&!(e.target.closest&&e.target.closest('[data-svmsg]'))) closeMenu(); },true);
document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&menuEl){ e.preventDefault(); e.stopPropagation(); closeMenu(); } },true);
document.addEventListener('scroll',e=>{ if(menuEl&&!menuEl.contains(e.target)) closeMenu(); },true);
KS.on('screenHide',closeMenu);

let lastMoved='';
function setStatus(id,stt){ const o=findO(id); if(!o||o.status===stt) return; const prev=o.status; o.status=stt; lastMoved=id; KS.update(); badge();
  const acts=[{label:'Отменить',run:()=>{ const x=findO(id); if(x){ x.status=prev; lastMoved=id; KS.update(); badge(); KS.toast('Статус возвращён'); } }}];
  if(stt==='ready'&&waDigits(o.phone)) acts.push({label:'Написать клиенту',run:()=>{ try{ window.open(waUrl(o),'_blank','noopener'); }catch(_){} }});
  const d=debtOf(o); snack(`№ ${o.no} → ${stName(stt)}${stt==='done'&&d>0?` · долг ${MONEY(d)}`:''}`,acts); }

/* ---------------- rail badge ---------------- */
function badge(){ const b=$q('.rbtn[data-tab="ks-svodka"]'); if(!b) return; const t=today(), n=ORD().filter(o=>isOver(o,t)).length; let s=b.querySelector('.sv-rb');
  if(!s){ s=document.createElement('span'); s.className='sv-rb'; s.setAttribute('aria-hidden','true'); b.appendChild(s); }
  const txt=n>99?'99+':String(n); if(s.textContent!==txt) s.textContent=txt; s.hidden=!n; b.setAttribute('aria-label','Сводка'+(n?`, просрочено ${n}`:'')); b.title=n?`Просрочено заказов: ${n}`:''; }
KS.on('render',badge); KS.on('boot',badge); KS.on('mode',badge);
let bdT=0; const badgeSoon=()=>{ clearTimeout(bdT); bdT=setTimeout(badge,120); };
document.addEventListener('change',e=>{ if(e.target&&e.target.dataset&&e.target.dataset.ord) badgeSoon(); });
document.addEventListener('input',e=>{ if(e.target&&e.target.dataset&&e.target.dataset.ord&&/status|due/.test(e.target.dataset.f||'')) badgeSoon(); });
document.addEventListener('click',e=>{ if(e.target.closest&&e.target.closest('[data-opaid],[data-odel],#ordNew')) badgeSoon(); });
setInterval(badge,5*60*1000);
/* undo/redo: the app re-renders inside travel() while st.orders still holds the old snapshot; the host puts the live
   orders back only afterwards. Re-render once more so the board/badge never show reverted statuses. */
if(typeof travel==='function'){ const _tv=travel; travel=function(){ const r=_tv.apply(this,arguments); try{ badge(); if(KS.active()) KS.render('update'); }catch(e){ console.error('[stats] travel',e); } return r; }; }

/* ---------------- tabs ---------------- */
const V={};
function sig(){ const O=ORD(); let h=O.length+'|'; for(const o of O) h+=o.id+o.status+'.'+o.paid+'.'+o.price+'.'+o.cost+'.'+o.due+'.'+o.date+'.'+o.client+'.'+o.product+'.'+o.qty+'.'+o.phone+'.'+String(o.note||'').length+'|';
  const P=SALES(); h+='#'+P.length; if(P.length){ const l=P[P.length-1]; h+=':'+l.id+':'+l.total; } return h+'|'+today()+'|'+cur(); }
/* host.js creates screens with $('.work'), which can match an order card in #ordList (class "item order work") when
   the Orders list was rendered first — move our screen back into the real work area (section.work). */
function homeScreen(scr){ const w=document.querySelector('section.work'); if(w&&scr.parentElement!==w) w.appendChild(scr); }
function R(box,o,id){ const v=V[id]||(V[id]={}); const fresh=o.reason==='show'||v.box!==box||!box.querySelector('.svp'); v.box=box; v.scr=o.screen;
  if(fresh) PANEL[id](box); else if(UPD[id]) KS.keepFocus(box,()=>UPD[id](box));
  if(!o.screen) return; homeScreen(o.screen); wireScreen(o.screen,id);
  const s=sig(); if(fresh||s!==v.sig){ if(drag&&drag.on){ v.pend=1; return; } v.sig=s; SCR[id](o.screen); } }
const rerender=id=>{ const v=V[id], s=KS.screen(id); if(s&&!s.hidden){ if(v) v.sig=sig(); SCR[id](s); } };
KS.tab({id:'ov',group:'svodka',groupTitle:'Сводка',groupIcon:ICON,icon:ICON,title:'Обзор',seg:'Обзор',app:'print',before:'orders',screen:true,render:(b,o)=>R(b,o,'ov')});
KS.tab({id:'board',group:'svodka',title:'Доска',seg:'Доска',app:'print',screen:true,render:(b,o)=>R(b,o,'board')});
KS.tab({id:'due',group:'svodka',title:'Сроки',seg:'Сроки',app:'print',screen:true,render:(b,o)=>R(b,o,'due')});
const PANEL={}, UPD={}, SCR={};

/* ================= Обзор ================= */
let ovTable=false;
PANEL.ov=box=>{ const s=S(), P=period();
  box.innerHTML=`<div class="svp">
  <div class="card"><div class="hd">Период</div>
    <div class="sv-pers">${PERS.map(([k,n])=>`<button class="sv-chipb${s.per===k?' on':''}${k==='custom'?' wide':''}" data-svper="${k}">${n}</button>`).join('')}</div>
    <div class="row2 sv-cust"${s.per==='custom'?'':' hidden'}><label class="f">С<input type="date" class="sv-date" id="svFrom" value="${E(P.a||'')}"></label><label class="f">По<input type="date" class="sv-date" id="svTo" value="${E(P.b||'')}"></label></div>
    <p class="hint sv-perl" id="svPerL">${perLine(P)}</p></div>
  <div class="card"><div class="hd">Выгрузка за период</div>
    <div class="sv-exps"><button class="btn sm" data-svx="ocsv">${IC.dl}CSV заказов</button><button class="btn sm" data-svx="scsv">${IC.dl}CSV продаж</button><button class="btn sm primary" data-svx="xlsx">${IC.dl}Excel: всё</button></div>
    <p class="hint">Excel — одна книга: сводка, заказы, продажи кассы, по дням, изделия, клиенты.</p></div>
  <div class="card"><div class="hd">Быстрые действия</div>
    <div class="sv-exps"><button class="btn sm" data-svnew="1">${IC.plus}Новый заказ</button><button class="btn sm" data-svgo="board">${IC.board}Доска</button><button class="btn sm" data-svgo="due">${IC.cal}Сроки</button></div></div>
  </div>`;
  wirePanel(box); };
const perLine=P=>P.a?`<b>${E(P.label)}</b>${P.pa?`<br>сравнение с ${E(P.plabel)}`:''}`:'<b>Все данные</b><br>без сравнения';
UPD.ov=box=>{ const l=$q('#svPerL',box), P=period(); if(l){ const h=perLine(P); if(l.innerHTML!==h) l.innerHTML=h; } };

function kpi(o){ const tag=o.go?'button':'div';
  return `<${tag} class="sv-kpi${o.hero?' hero':''}${o.cls?' '+o.cls:''}"${o.go?` data-svgo="${o.go}" title="${E(o.goT||'Открыть')}"`:''} data-kpi="${o.id}">
    <small>${o.ic||''}${E(o.l)}</small><b data-v="${E(o.raw!=null?o.raw:'')}">${E(o.v)}</b>${o.d||''}${o.sub?`<i>${o.sub}</i>`:''}${o.spark||''}</${tag}>`; }
function dlt(c,p,P,money){ if(!P.pa||p==null) return ''; const pv=money?MONEY(p):nf(p); let cls='eq', t;
  if(!p&&!c) t='как в прошлом периоде'; else if(!p){ cls=c>0?'up':'down'; t=c>0?'▲ рост':'▼'; } else { const x=Math.round((c-p)/Math.abs(p)*100); cls=x>0?'up':x<0?'down':'eq'; t=(x>0?'▲ ':x<0?'▼ ':'')+Math.abs(x)+'%'; }
  return `<span class="sv-d ${cls}" title="${E(P.plabel)}: ${E(pv)}">${E(t)}<em> · было ${E(money?cmm(p):nf(p))}</em></span>`; }

SCR.ov=scr=>{ const keep=scr.scrollTop, P=period(), t=today(), O=ORD(), SL=SALES();
  const head=`<div class="sv-top"><div><h2>Обзор бизнеса</h2><p>${P.a?E(P.label)+(P.pa?` <span class="sv-vs">· сравнение с ${E(P.plabel)}</span>`:''):'Все данные'}</p></div><span class="ks-sp"></span><button class="btn sm" data-svnew="1">${IC.plus}Новый заказ</button></div>`;
  if(!O.length&&!SL.length){ scr.innerHTML=`<div class="sv sv-ov">${head}${emptyHero('Здесь будет сводка вашей типографии','Выручка, заказы, долги клиентов и самые ходовые изделия — на одном экране. Создайте первый заказ, и цифры оживут.')}</div>`; return; }
  const c=agg(P.a,P.b), p=P.pa?agg(P.pa,P.pb):null;
  const act=O.filter(o=>o.status==='new'||o.status==='work'), rdy=O.filter(o=>o.status==='ready'), ovr=O.filter(o=>isOver(o,t)), dl=O.filter(o=>o.status!=='cancel'&&debtOf(o)>0);
  const debt=dl.reduce((s,o)=>s+debtOf(o),0), debtDone=dl.filter(o=>o.status==='done').reduce((s,o)=>s+debtOf(o),0), rdyDebt=rdy.reduce((s,o)=>s+debtOf(o),0);
  const oldest=ovr.reduce((m,o)=>!m||o.due<m?o.due:m,'');
  /* sparkline over the period */
  const sa=P.a||dataStart(), sb=P.b||t, span=dDiff(sa,sb)+1; let sp='';
  if(span>=3){ let keys=[]; if(span<=92){ for(let d=sa;d<=sb;d=addD(d,1)) keys.push(d); const B=revBuckets(keys,'d'); sp=spark(keys.map((_,i)=>B.o[i]+B.p[i]-B.r[i])); }
    else { let m=sa.slice(0,7)+'-01'; while(m.slice(0,7)<=sb.slice(0,7)&&keys.length<240){ keys.push(m.slice(0,7)); m=addM(m,1); } const B=revBuckets(keys,'m'); sp=spark(keys.map((_,i)=>B.o[i]+B.p[i]-B.r[i])); } }
  const k1=[
    kpi({id:'rev',l:'Выручка',v:MONEY(c.rev),raw:Math.round(c.rev*100)/100,hero:1,d:dlt(c.rev,p&&p.rev,P,1),sub:(c.posS||c.posR)?`заказы ${E(cmm(c.revO))} · касса ${E(cmm(c.posS-c.posR))}`:'',spark:sp}),
    kpi({id:'cnt',l:'Заказов',v:nf(c.count),raw:c.count,d:dlt(c.count,p&&p.count,P),sub:c.checks?`и ${nf(c.checks)} ${plural(c.checks,'чек','чека','чеков')} кассы`:''}),
    kpi({id:'avg',l:'Средний чек',v:MONEY(Math.round(c.avg)),raw:Math.round(c.avg*100)/100,d:dlt(c.avg,p&&p.avg,P,1),sub:'по заказам периода'}),
    kpi({id:'pr',l:'Прибыль',v:c.costN?MONEY(c.profit):'—',raw:c.costN?Math.round(c.profit*100)/100:'',d:c.costN?dlt(c.profit,p&&p.costN?p.profit:null,P,1):'',
      sub:c.costN?`себестоимость ${E(cmm(c.cost))} · маржа ${c.costPrice?Math.round(c.profit/c.costPrice*100):0}%${c.costN<c.count?` · ${c.costN} из ${c.count}`:''}`:'впишите себестоимость в заказах'})
  ].join('');
  const k2=[
    kpi({id:'work',l:'В работе',ic:'<i class="sv-sd st-work"></i>',v:nf(act.length),raw:act.length,sub:`новых ${act.filter(o=>o.status==='new').length} · в работе ${act.filter(o=>o.status==='work').length}`,go:'board',goT:'Открыть доску'}),
    kpi({id:'ready',l:'Готово к выдаче',ic:'<i class="sv-sd st-ready"></i>',v:nf(rdy.length),raw:rdy.length,sub:rdyDebt?`получить ${E(MONEY(rdyDebt))}`:'всё оплачено',go:'board',goT:'Открыть доску'}),
    kpi({id:'over',l:'Просрочено',ic:'<i class="sv-sd st-bad"></i>',v:nf(ovr.length),raw:ovr.length,cls:ovr.length?'bad':'good',sub:ovr.length?`самый давний срок — ${E(fD(oldest))}`:'всё в срок',go:'over',goT:'Показать просроченные'}),
    kpi({id:'debt',l:'Долги клиентов',ic:'<i class="sv-sd st-warn"></i>',v:MONEY(debt),raw:Math.round(debt*100)/100,sub:debt?`${dl.length} ${plural(dl.length,'заказ','заказа','заказов')}${debtDone?` · у выданных ${E(cmm(debtDone))}`:''}`:'долгов нет',go:'unpaid',goT:'Показать неоплаченные'})
  ].join('');
  const hasPos=SL.length>0, payItems=['cash','card','transfer','debt','other'].map(k=>({k,l:PAYN[k],v:Math.max(0,c.pays[k]||0),c:PAYC[k]})).filter(x=>x.v>0);
  const rv=S().rv==='auto'?autoRv(P):S().rv;
  scr.innerHTML=`<div class="sv sv-ov">${head}
    <section class="sv-sec"><div class="sv-sech"><b>За период</b><span>${E(P.label)}</span></div><div class="sv-kpis">${k1}</div></section>
    <section class="sv-sec"><div class="sv-sech"><b>Сейчас</b><span>на ${E(fDL(t))}</span></div><div class="sv-kpis">${k2}</div></section>
    <p class="sv-rule">${IC.info}<span>Выручка — деньги, полученные за период: оплаты заказов (по дате заказа) + продажи кассы − возвраты. Оплаты заказов через кассу уже внутри заказов и не считаются дважды; продажи «в долг» не входят.</span></p>
    <div class="sv-r1${hasPos?' pos':''}">
      <section class="sv-box"><header><div><h3>Выручка ${rv==='12m'?'по месяцам':'по дням'}</h3><p>${P.a?'яркие столбцы — выбранный период':'все данные'}</p></div><span class="ks-sp"></span>
        <div class="seg sv-seg">${[['30','30 дн'],['90','90 дн'],['12m','12 мес']].map(([k,n])=>`<button data-svrv="${k}"${rv===k?' class="on"':''}>${n}</button>`).join('')}</div>
        <button class="btn sm sv-tbtn${ovTable?' on':''}" data-svtbl="1" aria-pressed="${ovTable}">Таблица</button></header>
        ${hasPos?`<div class="sv-legend"><span><i style="background:var(--sv-s1)"></i>Заказы</span><span><i style="background:var(--sv-s2)"></i>Касса</span></div>`:''}
        <div class="sv-ch" data-ch="rev"></div></section>
      ${hasPos?`<section class="sv-box"><header><div><h3>Способы оплаты</h3><p>через кассу, за период</p></div></header><div class="sv-ch" data-ch="pay">${payItems.length?'':'<div class="sv-none">Продаж за период нет</div>'}</div></section>`:''}
    </div>
    <div class="sv-g2">
      <section class="sv-box"><header><div><h3>Изделия</h3><p>${S().pm==='cnt'?'по числу заказов':'по сумме заказов'} · топ 8</p></div><span class="ks-sp"></span><div class="seg sv-seg"><button data-svpm="sum"${S().pm!=='cnt'?' class="on"':''}>Сумма</button><button data-svpm="cnt"${S().pm==='cnt'?' class="on"':''}>Заказы</button></div></header><div class="sv-ch" data-ch="prod"></div></section>
      <section class="sv-box"><header><div><h3>Загрузка по дням недели</h3><p>${c.checks?'заказы и чеки кассы':'заказы по дате приёма'}</p></div></header>${c.checks?`<div class="sv-legend"><span><i style="background:var(--sv-s1)"></i>Заказы</span><span><i style="background:var(--sv-s2)"></i>Чеки</span></div>`:''}<div class="sv-ch" data-ch="wd"></div></section>
    </div>
    <div class="sv-g2">
      <section class="sv-box"><header><div><h3>Топ клиентов</h3><p>по сумме заказов за период</p></div></header>${topClients(c)}</section>
      <section class="sv-box"><header><div><h3>Топ изделий</h3><p>за период</p></div></header>${topProducts(c)}</section>
    </div></div>`;
  drawOv(scr,P,c,payItems,rv); scr.scrollTop=keep; (V.ov||(V.ov={})).w=scr.clientWidth; };

function drawOv(scr,P,c,payItems,rv){ const t=today();
  scr.querySelectorAll('[data-ch]').forEach(el=>{ const W=Math.floor(el.clientWidth)||600, k=el.dataset.ch; try{
    if(k==='rev'){ const end=P.b||t, inP=d=>(!P.a||d>=P.a)&&(!P.b||d<=P.b); let keys=[], cats=[], gran='d';
      if(rv==='12m'){ gran='m'; let m=addM(end.slice(0,8)+'01',-11); for(let i=0;i<12;i++){ keys.push(m.slice(0,7)); m=addM(m,1); } }
      else { const n=rv==='90'?90:30; for(let i=n-1;i>=0;i--) keys.push(addD(end,-i)); }
      const B=revBuckets(keys,gran), n=keys.length, plotW=W-60, band=plotW/n, every=gran==='m'?1:[1,2,3,5,7,10,14,15,30].find(s=>s*band>=58)||30;
      cats=keys.map((k,i)=>{ const tot=B.o[i]+B.p[i]-B.r[i], dim=gran==='m'?(P.a?!(k>=P.a.slice(0,7)&&k<=P.b.slice(0,7)):false):!inP(k);
        const lbl=gran==='m'?(MNS[+k.slice(5,7)-1]+(k.slice(5,7)==='01'||i===0?' '+k.slice(2,4):'')):((n-1-i)%every===0?fD(k):'');
        const r=[[ '', 'итого', MONEY(tot),1],['var(--sv-s1)','оплаты заказов',MONEY(B.o[i])]]; if(B.p[i]||B.r[i]) r.push(['var(--sv-s2)','касса',MONEY(B.p[i])]); if(B.r[i]) r.push(['','возвраты','−'+MONEY(B.r[i])]);
        return {x:lbl,v:[B.o[i],Math.max(0,B.p[i]-B.r[i])],dim,tip:{t:gran==='m'?MN[+k.slice(5,7)-1]+' '+k.slice(0,4):fDL(k)+', '+WDL[dow(k)],r,f:B.n[i]?`новых заказов: ${B.n[i]}`:''}}; });
      const total=cats.reduce((s,c)=>s+c.v[0]+c.v[1],0);
      if(ovTable){ el.innerHTML=`<div class="sv-tblw"><table class="ks-table"><thead><tr><th>${gran==='m'?'Месяц':'Дата'}</th><th class="num">Заказы</th><th class="num">Касса</th><th class="num">Возвраты</th><th class="num">Итого</th></tr></thead><tbody>${keys.map((k,i)=>[k,i]).reverse().filter(([,i])=>B.o[i]||B.p[i]||B.r[i]).map(([k,i])=>`<tr><td>${gran==='m'?MN[+k.slice(5,7)-1]+' '+k.slice(0,4):fD(k)+' '+k.slice(0,4)}</td><td class="num">${E(MONEY(B.o[i]))}</td><td class="num">${E(MONEY(B.p[i]))}</td><td class="num">${B.r[i]?'−'+E(MONEY(B.r[i])):'—'}</td><td class="num"><b>${E(MONEY(B.o[i]+B.p[i]-B.r[i]))}</b></td></tr>`).join('')||'<tr><td colspan="5" class="sv-none">Нет поступлений</td></tr>'}</tbody></table></div>`; return; }
      el.innerHTML=(total>0?'':'<div class="sv-none sv-abs">Поступлений за эти дни нет</div>')+colChart({id:'rev',W,H:220,cats,ser:['var(--sv-s1)','var(--sv-s2)'],fmt:cm,peak:total>0?(v=>cm(v)):null,aria:'Выручка'}); }
    else if(k==='pay'){ if(payItems.length) el.innerHTML=donut({id:'pay',items:payItems,aria:'Способы оплаты'}); }
    else if(k==='prod'){ const cnt=S().pm==='cnt', m=new Map(); c.act.forEach(o=>{ const key=nkey(String(o.product||'').split(',')[0])||'—'; let x=m.get(key); if(!x){ x={l:String(o.product||'').split(',')[0].trim()||'Без названия',v:0,n:0,q:0}; m.set(key,x); } x.v+=num(o.price); x.n++; x.q+=num(o.qty); });
      const all=[...m.values()].sort((a,b)=>cnt?(b.n-a.n||b.v-a.v):(b.v-a.v||b.n-a.n)); if(!all.length){ el.innerHTML='<div class="sv-none">Заказов за период нет</div>'; return; }
      const top=all.slice(0,8), rest=all.slice(8), tot=all.reduce((s,x)=>s+(cnt?x.n:x.v),0);
      const rows=top.map(x=>({l:x.l,v:cnt?x.n:x.v,lbl:cnt?nf(x.n):cmm(x.v),tip:{t:x.l,r:[['var(--sv-s1)','сумма',MONEY(x.v),!cnt],['','заказов',nf(x.n),cnt],['','тираж',nf(x.q)+' шт'],['','доля',(tot?Math.round((cnt?x.n:x.v)/tot*100):0)+'%']]}}));
      if(rest.length){ const v=rest.reduce((s,x)=>s+(cnt?x.n:x.v),0), rs=rest.reduce((s,x)=>s+x.v,0), rn=rest.reduce((s,x)=>s+x.n,0); rows.push({l:`Прочее (${rest.length})`,v,other:1,lbl:cnt?nf(v):cmm(v),tip:{t:`Прочее: ${rest.length} ${plural(rest.length,'изделие','изделия','изделий')}`,r:[['var(--sv-other)','сумма',MONEY(rs),!cnt],['','заказов',nf(rn),cnt]]}}); }
      el.innerHTML=hbar({id:'prod',W,rows,aria:'Изделия'}); }
    else if(k==='wd'){ const o=[0,0,0,0,0,0,0], ch=[0,0,0,0,0,0,0], sum=[0,0,0,0,0,0,0]; c.act.forEach(x=>{ const d=String(x.date||'').slice(0,10); if(okD(d)){ o[dow(d)]++; sum[dow(d)]+=num(x.price); } });
      const inR=d=>!!d&&(!P.a||d>=P.a)&&(!P.b||d<=P.b); SALES().forEach(s=>{ if((s.type||'sale')!=='sale') return; const d=saleDay(s); if(inR(d)) ch[dow(d)]++; });
      if(!o.some(Boolean)&&!ch.some(Boolean)){ el.innerHTML='<div class="sv-none">Нет данных за период</div>'; return; }
      el.innerHTML=colChart({id:'wd',W,H:190,int:1,cats:WDS.map((d,i)=>{ const r=[['var(--sv-s1)','заказов',nf(o[i]),1]]; if(c.checks) r.push(['var(--sv-s2)','чеков кассы',nf(ch[i])]); r.push(['','на сумму',MONEY(sum[i])]); return {x:d,v:c.checks?[o[i],ch[i]]:[o[i]],tip:{t:WDL[i][0].toUpperCase()+WDL[i].slice(1),r}}; }),ser:['var(--sv-s1)','var(--sv-s2)'],fmt:v=>nf(v),aria:'Загрузка по дням недели'}); }
  }catch(err){ console.error('[stats] chart '+k,err); el.innerHTML='<div class="sv-none">Не удалось построить график</div>'; } }); }

function topClients(c){ const m=new Map(); c.act.forEach(o=>{ const nm=String(o.client||'').trim(), k=nkey(nm); let x=m.get(k); if(!x){ x={n:nm,c:0,s:0,d:0}; m.set(k,x); } x.c++; x.s+=num(o.price); x.d+=debtOf(o); });
  const L=[...m.values()].sort((a,b)=>b.s-a.s||b.c-a.c).slice(0,8); if(!L.length) return '<div class="sv-none">Заказов за период нет</div>';
  return `<div class="sv-tblw"><table class="ks-table sv-tbl"><thead><tr><th>Клиент</th><th class="num">Заказов</th><th class="num">Сумма</th><th class="num">Долг</th></tr></thead><tbody>${L.map(x=>`<tr${x.n?` class="sv-clk" data-svcli="${E(x.n)}" title="Показать заказы клиента на доске"`:''}><td><span class="sv-ell">${E(x.n||'Без клиента')}</span></td><td class="num">${x.c}</td><td class="num">${E(MONEY(x.s))}</td><td class="num">${x.d>0?`<span class="sv-debt">${E(MONEY(x.d))}</span>`:'—'}</td></tr>`).join('')}</tbody></table></div>`; }
function topProducts(c){ const m=new Map(); c.act.forEach(o=>{ const k=nkey(String(o.product||'').split(',')[0])||'—'; let x=m.get(k); if(!x){ x={n:String(o.product||'').split(',')[0].trim()||'Без названия',c:0,q:0,s:0}; m.set(k,x); } x.c++; x.q+=num(o.qty); x.s+=num(o.price); });
  const L=[...m.values()].sort((a,b)=>b.s-a.s||b.c-a.c).slice(0,8); if(!L.length) return '<div class="sv-none">Заказов за период нет</div>';
  return `<div class="sv-tblw"><table class="ks-table sv-tbl"><thead><tr><th>Изделие</th><th class="num">Заказов</th><th class="num">Тираж</th><th class="num">Сумма</th></tr></thead><tbody>${L.map(x=>`<tr><td><span class="sv-ell">${E(x.n)}</span></td><td class="num">${x.c}</td><td class="num">${nf(x.q)}</td><td class="num">${E(MONEY(x.s))}</td></tr>`).join('')}</tbody></table></div>`; }
function emptyHero(t,d){ return `<div class="sv-hero"><div class="sv-heroi">${ICON}</div><h3>${E(t)}</h3><p>${E(d)}</p><div class="flexw" style="justify-content:center"><button class="btn primary" data-svnew="1">${IC.plus}Создать заказ</button></div></div>`; }

/* ---------- exports ---------- */
const csvQ=v=>{ if(typeof v==='number') v=String(Math.round(v*100)/100).replace('.',','); return '"'+String(v==null?'':v).replace(/"/g,'""')+'"'; };
const csv=rows=>'\ufeff'+rows.map(r=>r.map(csvQ).join(';')).join('\r\n');
const OH=['№','Дата','Клиент','Телефон','Изделие','Тираж','Бумага','Обработка','Цена','Себестоимость','Оплачено','Долг','Статус','Срок','Заметка'];
const oRow=o=>[num(o.no),String(o.date||''),o.client||'',o.phone||'',o.product||'',num(o.qty),o.paper||'',o.fin||'',num(o.price),num(o.cost),num(o.paid),o.status==='cancel'?0:debtOf(o),stName(o.status),o.due||'',o.note||''];
const SH=['Дата','Время','Операция','Сумма','Оплата','Клиент','Заказ №','Позиции','Смена'];
const STY={sale:'Продажа',order:'Оплата заказа',refund:'Возврат',in:'Внесение',out:'Изъятие'};
function sRow(s){ const t=s.type||'sale', v=s.ts!=null?s.ts:s.date, d=new Date(typeof v==='string'&&/^\d+$/.test(v)?+v:v), o=s.orderId?findO(s.orderId):null;
  const items=Array.isArray(s.items)?s.items.map(i=>i&&typeof i==='object'?`${i.name||i.n||'позиция'}${num(i.qty||i.q)>1?' ×'+num(i.qty||i.q):''}`:String(i)).join('; '):'';
  const sum=(t==='refund'||t==='out')?-Math.abs(num(s.total)):num(s.total); const pm=payParts(s).map(([k])=>PAYN[k]||k);
  return [saleDay(s),isNaN(d)?'':pad(d.getHours())+':'+pad(d.getMinutes()),STY[t]||t,sum,[...new Set(pm)].join(' + '),s.client||'',o?num(o.no):(s.orderId||''),items,s.shift==null?'':String(s.shift)]; }
function perData(){ const P=period(), inR=d=>(!P.a&&!P.b)||(!!d&&(!P.a||d>=P.a)&&(!P.b||d<=P.b));
  const os=ORD().filter(o=>inR(String(o.date||'').slice(0,10))).sort((a,b)=>String(a.date).localeCompare(String(b.date))||num(a.no)-num(b.no));
  const ss=SALES().filter(s=>inR(saleDay(s))).sort((a,b)=>saleDay(a).localeCompare(saleDay(b))||num(a.ts)-num(b.ts));
  return {P,os,ss,tag:P.a?P.a+'_'+P.b:'vse'}; }
async function exportCSV(kind){ const {os,ss,tag}=perData();
  if(kind==='o'){ if(!os.length){ KS.toast('Заказов за период нет'); return; } if(await KS.download(`svodka-zakazy-${tag}.csv`,new Blob([csv([OH,...os.map(oRow)])],{type:'text/csv;charset=utf-8'}))) KS.toast(`CSV: ${os.length} ${plural(os.length,'заказ','заказа','заказов')}`); }
  else { if(!ss.length){ KS.toast('Продаж кассы за период нет'); return; } if(await KS.download(`svodka-prodazhi-${tag}.csv`,new Blob([csv([SH,...ss.map(sRow)])],{type:'text/csv;charset=utf-8'}))) KS.toast(`CSV: ${ss.length} ${plural(ss.length,'операция','операции','операций')} кассы`); } }
async function exportXLSX(){ const {P,os,ss,tag}=perData(); if(!os.length&&!ss.length){ KS.toast('За период нет ни заказов, ни продаж'); return; }
  let X; try{ X=typeof loadXLSX==='function'?await loadXLSX():await loadLib('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',()=>window.XLSX); }catch(e){ X=null; }
  if(!X||!X.utils){ KS.toast('Не удалось загрузить модуль Excel (нужен интернет). Скачайте CSV.'); return; }
  const c=agg(P.a,P.b), p=P.pa?agg(P.pa,P.pb):null, pct=(a,b)=>b?Math.round((a-b)/Math.abs(b)*1000)/10:'';
  const sum=[['Сводка',(st.shop&&st.shop.name)||'Типография'],['Период',P.label],['Сравнение',P.pa?P.plabel:'—'],[],['Показатель','Значение','Прошлый период','Изменение, %'],
    ['Выручка',c.rev,p?p.rev:'',p?pct(c.rev,p.rev):''],['— оплаты заказов',c.revO,p?p.revO:'',''],['— продажи кассы',c.posS,p?p.posS:'',''],['— возвраты',-c.posR,p?-p.posR:'',''],
    ['Заказов',c.count,p?p.count:'',p?pct(c.count,p.count):''],['Средний чек',Math.round(c.avg*100)/100,p?Math.round(p.avg*100)/100:'',p?pct(c.avg,p.avg):''],['Сумма заказов',c.sumPrice,p?p.sumPrice:'',''],
    ['Себестоимость (где указана)',c.cost,p?p.cost:'',''],['Прибыль (где указана себестоимость)',c.profit,p?p.profit:'',''],['Чеков кассы',c.checks,p?p.checks:'',''],[],['Выручка = оплаты заказов (по дате заказа) + продажи кассы − возвраты; оплаты заказов через кассу не считаются дважды.']];
  const wb=X.utils.book_new(), add=(name,aoa,cols)=>{ const ws=X.utils.aoa_to_sheet(aoa); ws['!cols']=cols.map(w=>({wch:w})); X.utils.book_append_sheet(wb,ws,name); };
  add('Сводка',sum,[34,18,16,14]);
  add('Заказы',[OH,...os.map(oRow)],[6,11,24,16,30,8,16,16,10,12,10,10,10,11,30]);
  if(ss.length) add('Продажи',[SH,...ss.map(sRow)],[11,7,14,10,14,20,9,40,8]);
  const a=P.a||dataStart(), b=P.b||today(), days=[]; if(dDiff(a,b)<=1500) for(let d=a;d<=b;d=addD(d,1)) days.push(d); const B=revBuckets(days,'d');
  add('По дням',[['Дата','Оплаты заказов','Касса','Возвраты','Итого','Новых заказов'],...days.map((d,i)=>[d,B.o[i],B.p[i],-B.r[i],B.o[i]+B.p[i]-B.r[i],B.n[i]]).filter(r=>r[1]||r[2]||r[3]||r[5])],[11,15,12,11,12,14]);
  const pm=new Map(), cmap=new Map(); c.act.forEach(o=>{ const pk=nkey(String(o.product||'').split(',')[0])||'—'; let x=pm.get(pk); if(!x){ x=[String(o.product||'').split(',')[0].trim()||'Без названия',0,0,0]; pm.set(pk,x); } x[1]++; x[2]+=num(o.qty); x[3]+=num(o.price);
    const ck=nkey(o.client); let y=cmap.get(ck); if(!y){ y=[String(o.client||'').trim()||'Без клиента',o.phone||'',0,0,0,0]; cmap.set(ck,y); } y[2]++; y[3]+=num(o.price); y[4]+=num(o.paid); y[5]+=debtOf(o); });
  add('Изделия',[['Изделие','Заказов','Тираж','Сумма'],...[...pm.values()].sort((x,y)=>y[3]-x[3])],[34,9,9,12]);
  add('Клиенты',[['Клиент','Телефон','Заказов','Сумма','Оплачено','Долг'],...[...cmap.values()].sort((x,y)=>y[3]-x[3])],[28,16,9,12,12,12]);
  const out=X.write(wb,{bookType:'xlsx',type:'array'});
  if(await KS.download(`svodka-${tag}.xlsx`,new Blob([out],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}))) KS.toast('Excel-файл со сводкой готов'); }

/* ================= Доска ================= */
const COLS=[['new','Новый'],['work','В работе'],['ready','Готов'],['done','Выдан'],['cancel','Отменён']];
let bq='', more={};
PANEL.board=box=>{ const B=S().board, t=today(), O=ORD(), nOver=O.filter(o=>isOver(o,t)).length, nUn=O.filter(o=>o.status!=='cancel'&&debtOf(o)>0).length;
  box.innerHTML=`<div class="svp">
  <div class="card"><div class="hd">Фильтры<button class="btn sm" data-svreset="1"${hasFilter()?'':' hidden'}>Сбросить</button></div>
    <input type="text" id="svQ" placeholder="Поиск: №, клиент, телефон, изделие" aria-label="Поиск по заказам" value="${E(bq)}" autocomplete="off" enterkeyhint="search">
    <label class="f">Клиент<select id="svCli">${cliOpts(B.client)}</select></label>
    <label class="chk sv-chk"><input type="checkbox" id="svOver"${B.over?' checked':''}> Только просроченные <span class="ks-badge bad" id="svNOver"${nOver?'':' hidden'}>${nOver}</span></label>
    <label class="chk sv-chk"><input type="checkbox" id="svUnpaid"${B.unpaid?' checked':''}> Только неоплаченные <span class="ks-badge warn" id="svNUn"${nUn?'':' hidden'}>${nUn}</span></label>
    <label class="chk sv-chk"><input type="checkbox" id="svCancel"${B.cancel?' checked':''}> Показать колонку «Отменён»</label>
    <div class="f sv-fl"><span>Колонка «Выдан»</span><div class="seg sv-seg">${[['30','30 дней'],['90','90 дней'],['all','Все']].map(([k,n])=>`<button data-svdone="${k}"${B.done===k?' class="on"':''}>${n}</button>`).join('')}</div></div>
  </div>
  <div class="card"><div class="hd">Как пользоваться</div>
    <p class="hint">Перетащите карточку в другую колонку — статус сменится. На iPad: нажмите и чуть подержите карточку, затем ведите. Короткое нажатие открывает заказ.</p></div>
  <button class="btn primary sv-wide" data-svnew="1">${IC.plus}Новый заказ</button></div>`;
  wirePanel(box); };
function cliOpts(sel){ const m=new Map(); ORD().forEach(o=>{ const n=String(o.client||'').trim(); if(n) m.set(n,(m.get(n)||0)+(fin(o)?0:1)); }); const L=[...m.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],'ru'));
  if(sel&&!m.has(sel)) L.unshift([sel,0]); return `<option value="">Все клиенты</option>`+L.map(([n,c])=>`<option value="${E(n)}"${n===sel?' selected':''}>${E(n)}${c?` · ${c}`:''}</option>`).join(''); }
UPD.board=box=>{ const t=today(), O=ORD(), a=O.filter(o=>isOver(o,t)).length, u=O.filter(o=>o.status!=='cancel'&&debtOf(o)>0).length; const x=$q('#svNOver',box), y=$q('#svNUn',box); if(x){ x.textContent=a; x.hidden=!a; } if(y){ y.textContent=u; y.hidden=!u; }
  const r=$q('[data-svreset]',box); if(r) r.hidden=!hasFilter(); const sel=$q('#svCli',box); if(sel&&document.activeElement!==sel){ const h=cliOpts(S().board.client); if(sel._h!==h){ sel.innerHTML=h; sel._h=h; } } };
const hasFilter=()=>{ const B=S().board; return !!(bq||B.client||B.over||B.unpaid); };
function boardList(){ const B=S().board, t=today(), q=nkey(bq);
  return ORD().filter(o=>(!B.client||String(o.client||'').trim()===B.client)&&(!B.over||isOver(o,t))&&(!B.unpaid||(o.status!=='cancel'&&debtOf(o)>0))&&(!q||nkey([o.no,'№'+o.no,o.client,o.phone,o.product,o.note].join(' ')).includes(q))); }
const PRI={new:0,work:1,ready:2,done:3,cancel:4};
function sortCol(st_,L,t){ if(st_==='done'||st_==='cancel') return L.sort((a,b)=>String(b.due||b.date).localeCompare(String(a.due||a.date))||num(b.no)-num(a.no));
  return L.sort((a,b)=>(isOver(b,t)-isOver(a,t))||((a.due||'9999')<(b.due||'9999')?-1:(a.due||'9999')>(b.due||'9999')?1:0)||num(a.no)-num(b.no)); }
function cardHTML(o,t){ const d=debtOf(o), pr=num(o.price), over=isOver(o,t), ph=String(o.phone||'').trim(), wd=waDigits(ph); let due='';
  if(okD(o.due)){ const dd=dDiff(t,o.due); if(!fin(o)&&dd<0) due=`<span class="sv-dchip bad" title="Просрочен: срок был ${E(fDL(o.due))}">${E(fD(o.due))} · −${-dd}\u00a0дн</span>`; else if(!fin(o)&&dd===0) due='<span class="sv-dchip warn">сегодня</span>'; else if(!fin(o)&&dd===1) due='<span class="sv-dchip warn">завтра</span>'; else due=`<span class="sv-dchip">до ${E(fD(o.due))}</span>`; }
  const money=o.status==='cancel'||pr<=0?'':(d>0?`<span class="ks-badge bad">долг ${E(MONEY(d))}</span>`:'<span class="ks-badge ok">оплачен</span>');
  const nx={new:['work','В работу'],work:['ready','Готов'],ready:['done','Выдан']}[PRI.hasOwnProperty(o.status)?o.status:'new'];
  return `<div class="sv-card st-${E(o.status)}${over?' over':''}${o.id===lastMoved?' moved':''}" data-id="${E(o.id)}" tabindex="0" role="button" aria-label="Заказ № ${E(o.no)}, ${E(o.client||'без клиента')}">
    <div class="sv-c1"><b class="sv-no">№ ${E(o.no)}</b><span class="ks-sp"></span>${due}</div>
    <div class="sv-cli">${E(o.client||'Без клиента')}</div>
    <div class="sv-prod">${E(o.product||'Изделие')}${num(o.qty)?' × '+E(o.qty):''}</div>
    ${o.note?`<div class="sv-note">${E(String(o.note).slice(0,160))}</div>`:''}
    ${money||pr?`<div class="sv-c2">${money}<span class="ks-sp"></span>${pr?`<b class="sv-sum">${E(MONEY(pr))}</b>`:''}</div>`:''}
    ${ph||nx?`<div class="sv-acts">${ph?`<a class="sv-ib" href="${E(telHref(ph))}" title="Позвонить ${E(ph)}" aria-label="Позвонить">${IC.phone}</a>`:''}${wd?`<button class="sv-ib" data-svmsg="${E(o.id)}" title="Написать клиенту: WhatsApp, Telegram, SMS" aria-label="Написать клиенту" aria-haspopup="menu">${IC.chat}</button>`:''}<span class="ks-sp"></span>${nx?`<button class="sv-nx" data-svnext="${E(o.id)}" data-to="${nx[0]}">${nx[1]} ›</button>`:''}</div>`:''}
  </div>`; }
SCR.board=scr=>{ const B=S().board, t=today(), all=ORD(), L=boardList(), ob=scr.querySelector('.sv-board'), sl=ob?ob.scrollLeft:0, tops={};
  if(ob) ob.querySelectorAll('.sv-colb').forEach(c=>{ tops[c.dataset.st]=c.scrollTop; });
  const cut=B.done==='all'?'':addD(t,-(+B.done||30)), act=all.filter(o=>!fin(o)), over=all.filter(o=>isOver(o,t)).length, debt=all.filter(o=>o.status!=='cancel').reduce((s,o)=>s+debtOf(o),0);
  const chips=[]; if(bq) chips.push(['q',`«${bq}»`]); if(B.client) chips.push(['client',B.client]); if(B.over) chips.push(['over','просроченные']); if(B.unpaid) chips.push(['unpaid','неоплаченные']);
  const cols=COLS.map(([k,n])=>{ let list=L.filter(o=>o.status===k||(k==='new'&&!PRI.hasOwnProperty(o.status))); let hidden=0;
    if(k==='done'&&cut){ const x=list.filter(o=>String(o.due&&o.due>o.date?o.due:o.date)>=cut); hidden=list.length-x.length; list=x; }
    sortCol(k,list,t); const lim=more[k]||40, shown=list.slice(0,lim), sum=list.reduce((s,o)=>s+num(o.price),0);
    if(k==='cancel'&&!B.cancel) return `<div class="sv-col sv-colx st-cancel" data-st="cancel" role="button" tabindex="0" data-svxcol="1" title="Показать отменённые"><i class="sv-sd st-cancel"></i><span>Отменён · ${list.length}</span></div>`;
    return `<div class="sv-col st-${k}" data-st="${k}"><div class="sv-colh"><i class="sv-sd st-${k}"></i><b>${n}</b><span class="sv-cnt">${list.length}</span><span class="ks-sp"></span><small${sum?` title="${E(MONEY(sum))}"`:''}>${sum?E(cm(sum)):''}</small>${k==='cancel'?`<button class="sv-ib sm" data-svxcol="0" title="Свернуть" aria-label="Свернуть">${IC.x}</button>`:''}</div>
      <div class="sv-colb" data-st="${k}">${shown.map(o=>cardHTML(o,t)).join('')}${list.length>lim?`<button class="btn sm sv-more" data-svmore="${k}">Показать ещё ${Math.min(40,list.length-lim)} из ${list.length-lim}</button>`:''}${!list.length?`<div class="sv-ph">${hidden?`Выданные старше ${B.done} дней скрыты`:k==='new'&&!all.length?'Заказов пока нет':'Перетащите сюда'}</div>`:''}${hidden&&list.length?`<div class="sv-ph sm">ещё ${hidden} — старше ${B.done} дней</div>`:''}</div></div>`; }).join('');
  scr.innerHTML=`<div class="sv sv-bd"><div class="sv-top"><div><h2>Доска заказов</h2><p>${act.length} ${plural(act.length,'активный','активных','активных')}${over?` · <span class="sv-red">просрочено ${over}</span>`:''}${debt?` · долги ${E(MONEY(debt))}`:''}</p></div><span class="ks-sp"></span>
      ${chips.length?`<div class="sv-fchips">${chips.map(([k,n])=>`<button class="sv-fchip" data-svclr="${k}" title="Убрать фильтр">${E(n)}${IC.x}</button>`).join('')}</div>`:''}
      <button class="btn sm primary" data-svnew="1">${IC.plus}Новый заказ</button></div>
    ${!all.length?`<div class="sv-banner">${ICON}<div><b>Заказов пока нет</b><span>Создайте первый заказ — он появится в колонке «Новый». Дальше просто перетаскивайте карточки по мере работы.</span></div><button class="btn sm primary" data-svnew="1">Создать заказ</button></div>`:(!L.length?`<div class="sv-banner">${IC.info}<div><b>Ничего не найдено</b><span>По выбранным фильтрам заказов нет.</span></div><button class="btn sm" data-svreset="1">Сбросить фильтры</button></div>`:'')}
    <div class="sv-board">${cols}</div></div>`;
  const nb=scr.querySelector('.sv-board'); nb.scrollLeft=sl; nb.querySelectorAll('.sv-colb').forEach(c=>{ if(tops[c.dataset.st]) c.scrollTop=tops[c.dataset.st]; });
  if(lastMoved){ const m=nb.querySelector(`.sv-card[data-id="${CSS.escape(lastMoved)}"]`); if(m){ const cb=m.closest('.sv-colb'), r=m.getBoundingClientRect(), rb=cb.getBoundingClientRect(); if(r.top<rb.top||r.bottom>rb.bottom) cb.scrollTop+=r.top-rb.top-40; } setTimeout(()=>{ lastMoved=''; },1200); } };

/* ---- drag & drop (pointer events: mouse = 5px threshold, touch/pen = long press) ---- */
let drag=null;
function dragStart(){ const d=drag; if(!d||d.on) return; d.on=true; tipHide(); const r=d.card.getBoundingClientRect(); d.dx=d.x-r.left; d.dy=d.y-r.top;
  const g=d.card.cloneNode(true); g.classList.add('sv-ghost'); g.classList.remove('moved'); g.style.width=r.width+'px'; g.removeAttribute('tabindex'); document.body.appendChild(g); d.ghost=g;
  d.card.classList.add('dragging'); d.card.classList.remove('sv-press'); document.documentElement.classList.add('sv-dragging'); try{ navigator.vibrate&&navigator.vibrate(12); }catch(_){}
  dragMove(); d.raf=requestAnimationFrame(autoScroll); }
function dragMove(){ const d=drag; if(!d||!d.ghost) return; d.ghost.style.transform=`translate(${(d.x-d.dx).toFixed(1)}px,${(d.y-d.dy).toFixed(1)}px) rotate(1.5deg)`;
  const el=document.elementFromPoint(d.x,d.y), col=el&&el.closest&&el.closest('.sv-col'); if(col!==d.over){ if(d.over) d.over.classList.remove('drop'); d.over=col&&d.scr.contains(col)?col:null; if(d.over&&d.over.dataset.st!==d.from) d.over.classList.add('drop'); } }
function autoScroll(){ const d=drag; if(!d||!d.on) return; const bd=d.scr.querySelector('.sv-board'), Z=56;
  if(bd){ const r=bd.getBoundingClientRect(); if(d.x<r.left+Z) bd.scrollLeft-=Math.ceil((r.left+Z-d.x)/3); else if(d.x>r.right-Z) bd.scrollLeft+=Math.ceil((d.x-(r.right-Z))/3); }
  const cb=d.over&&d.over.querySelector('.sv-colb'); if(cb){ const r=cb.getBoundingClientRect(); if(d.y<r.top+Z&&d.y>r.top-30) cb.scrollTop-=Math.ceil((r.top+Z-d.y)/3); else if(d.y>r.bottom-Z) cb.scrollTop+=Math.ceil((d.y-(r.bottom-Z))/3); }
  dragMove(); d.raf=requestAnimationFrame(autoScroll); }
function dragEnd(drop){ const d=drag; if(!d) return; drag=null; clearTimeout(d.t); cancelAnimationFrame(d.raf); d.card.classList.remove('sv-press','dragging'); document.documentElement.classList.remove('sv-dragging');
  if(d.ghost) d.ghost.remove(); if(d.over) d.over.classList.remove('drop');
  if(d.on){ d.scr._noclick=Date.now(); const to=drop&&d.over&&d.over.dataset.st; if(to&&to!==d.from) setStatus(d.id,to); else if(V.board&&V.board.pend){ V.board.pend=0; rerender('board'); } } }
document.addEventListener('pointermove',e=>{ const d=drag; if(!d||e.pointerId!==d.pid) return; d.x=e.clientX; d.y=e.clientY;
  if(!d.on){ const m=Math.hypot(d.x-d.x0,d.y-d.y0); if(d.touch){ if(m>9){ clearTimeout(d.t); d.card.classList.remove('sv-press'); drag=null; } return; } if(m>5) dragStart(); return; }
  dragMove(); },{passive:true});
document.addEventListener('pointerup',e=>{ if(drag&&e.pointerId===drag.pid) dragEnd(true); });
document.addEventListener('pointercancel',e=>{ if(drag&&e.pointerId===drag.pid) dragEnd(false); });
document.addEventListener('touchmove',e=>{ if(drag&&drag.on&&e.cancelable) e.preventDefault(); },{passive:false});
document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&drag&&drag.on){ e.preventDefault(); dragEnd(false); } });

/* ================= Сроки ================= */
PANEL.due=box=>{ const C=S().cal, n=icsList().length;
  box.innerHTML=`<div class="svp">
  <div class="card"><div class="hd">Показывать</div>
    <div class="seg sv-seg sv-full">${[['month','Месяц'],['week','Неделя']].map(([k,t])=>`<button data-svview="${k}"${C.view===k?' class="on"':''}>${t}</button>`).join('')}</div>
    <label class="chk sv-chk"><input type="checkbox" id="svShowDone"${C.done?' checked':''}> Показывать выданные</label>
    <div class="sv-leg2">${COLS.slice(0,4).map(([k,t])=>`<span><i class="sv-sd st-${k}"></i>${t}</span>`).join('')}<span><i class="sv-sd st-bad"></i>Просрочен</span></div></div>
  <div class="card"><div class="hd">Календарь на Mac и iPad</div>
    <p class="hint">Файл .ics со сроками незавершённых заказов — <b id="svIcsN">${n}</b>. Откройте его: Календарь добавит события с напоминанием накануне в 9:00.</p>
    <button class="btn primary sv-wide" data-svics="1">${IC.cal}Скачать .ics</button></div>
  <button class="btn sv-wide" data-svnew="1">${IC.plus}Новый заказ</button></div>`;
  wirePanel(box); };
UPD.due=box=>{ const x=$q('#svIcsN',box); if(x) x.textContent=icsList().length; };
const icsList=()=>ORD().filter(o=>okD(o.due)&&['new','work','ready'].includes(o.status)).sort((a,b)=>a.due.localeCompare(b.due));
function dueItem(o,t){ const d=debtOf(o), over=isOver(o,t);
  return `<button class="sv-li st-${E(o.status)}${over?' over':''}" data-svopen="${E(o.id)}"><i class="sv-sd st-${over?'bad':E(o.status)}"></i><span class="sv-lit"><b>№ ${E(o.no)} · ${E(o.client||'Без клиента')}</b><span>${E(o.product||'Изделие')}${num(o.qty)?' × '+E(o.qty):''}</span></span><span class="sv-lir"><span class="pill ${E(o.status)}">${E(stName(o.status))}</span>${o.status!=='cancel'&&d>0?`<small class="sv-debt">долг ${E(MONEY(d))}</small>`:over?`<small class="sv-red">просрочен</small>`:''}</span></button>`; }
SCR.due=scr=>{ const keep=scr.scrollTop, C=S().cal, t=today(), sel=okD(C.sel)?C.sel:t, ym=/^\d{4}-\d\d$/.test(C.ym||'')?C.ym:sel.slice(0,7), O=ORD();
  const L=O.filter(o=>okD(o.due)&&o.status!=='cancel'&&(C.done||o.status!=='done')), by={}; L.forEach(o=>{ (by[o.due]=by[o.due]||[]).push(o); });
  Object.values(by).forEach(a=>a.sort((x,y)=>(isOver(y,t)-isOver(x,t))||PRI[x.status]-PRI[y.status]||num(x.no)-num(y.no)));
  const over=O.filter(o=>isOver(o,t)).sort((a,b)=>a.due.localeCompare(b.due));
  const week=C.view==='week', ws=addD(sel,-dow(sel)), we=addD(ws,6);
  const title=week?fRange(ws,we):MN[+ym.slice(5,7)-1]+' '+ym.slice(0,4);
  const mL=L.filter(o=>o.due.slice(0,7)===ym), mOver=mL.filter(o=>isOver(o,t)).length, mDone=O.filter(o=>okD(o.due)&&o.due.slice(0,7)===ym&&o.status==='done').length;
  const head=`<div class="sv-top"><div><h2>Сроки заказов</h2><p>${week?`${L.filter(o=>o.due>=ws&&o.due<=we).length} ${plural(L.filter(o=>o.due>=ws&&o.due<=we).length,'срок','срока','сроков')} на неделе`:`${MN[+ym.slice(5,7)-1]}: ${mL.length} ${plural(mL.length,'срок','срока','сроков')}${mOver?` · <span class="sv-red">просрочено ${mOver}</span>`:''}${mDone?` · выдано ${mDone}`:''}`}</p></div><span class="ks-sp"></span>
    <div class="seg sv-seg">${[['month','Месяц'],['week','Неделя']].map(([k,n])=>`<button data-svview="${k}"${C.view===k?' class="on"':''}>${n}</button>`).join('')}</div>
    <button class="btn sm" data-svics="1">${IC.cal}В Календарь</button></div>
    <div class="sv-nav"><button class="sv-ib" data-svnav="-1" aria-label="Назад" title="Назад">${IC.left}</button><b class="sv-navt">${E(title)}</b><button class="sv-ib" data-svnav="1" aria-label="Вперёд" title="Вперёд">${IC.right}</button><button class="btn sm" data-svnav="0">Сегодня</button></div>`;
  const empty=!O.some(o=>okD(o.due))?`<div class="sv-banner">${IC.cal}<div><b>Сроков пока нет</b><span>Укажите «Срок» в заказе — он появится в календаре, а просроченные будут видны сразу.</span></div><button class="btn sm primary" data-svnew="1">Создать заказ</button></div>`:'';
  let body='';
  if(!week){ const first=ym+'-01', start=addD(first,-dow(first)), last=eom(first), nW=Math.ceil((dow(first)+dDiff(first,last)+1)/7); let cells='';
    for(let i=0;i<nW*7;i++){ const d=addD(start,i), list=by[d]||[], oth=d.slice(0,7)!==ym, ov=list.filter(o=>isOver(o,t)).length;
      cells+=`<div class="sv-day${oth?' oth':''}${d===t?' today':''}${d===sel?' sel':''}${dow(d)>4?' we':''}" data-svday="${d}" role="button" tabindex="0" aria-label="${E(fDL(d))}: ${list.length} ${plural(list.length,'срок','срока','сроков')}">
        <div class="sv-dh"><span class="sv-dn">${+d.slice(8)}</span>${list.length?`<span class="sv-dc2${ov?' bad':''}">${list.length}</span>`:''}</div>
        <div class="sv-chips">${list.slice(0,3).map(o=>`<span class="sv-chip st-${E(o.status)}${isOver(o,t)?' over':''}" title="№${E(o.no)} · ${E(o.client||'без клиента')}${o.product?' — '+E(o.product):''}"><i></i><b>№${E(o.no)}</b><span class="cn">${E(o.client||'')}</span></span>`).join('')}${list.length>3?`<span class="sv-more2">+${list.length-3}</span>`:''}</div>
        <div class="sv-dots">${list.slice(0,5).map(o=>`<i class="sv-sd st-${isOver(o,t)?'bad':E(o.status)}"></i>`).join('')}${list.length>5?'<em>+</em>':''}</div></div>`; }
    const dl=by[sel]||[];
    body=`<div class="sv-calw"><div class="sv-cal"><div class="sv-wh">${WDS.map((w,i)=>`<span${i>4?' class="we"':''}>${w}</span>`).join('')}</div><div class="sv-grid">${cells}</div></div>
      <aside class="sv-side"><div class="sv-sideh"><div><b>${E(WDL[dow(sel)][0].toUpperCase()+WDL[dow(sel)].slice(1))}, ${E(fDL(sel))}</b><span>${sel===t?'сегодня':sel===addD(t,1)?'завтра':''}</span></div><button class="sv-ib" data-svnewdue="${sel}" title="Новый заказ с этим сроком" aria-label="Новый заказ с этим сроком">${IC.plus}</button></div>
        <div class="sv-list">${dl.length?dl.map(o=>dueItem(o,t)).join(''):'<div class="sv-none">На этот день сроков нет</div>'}</div>
        ${over.length?`<div class="sv-sideh sv-oh"><b class="sv-red">Просрочено · ${over.length}</b></div><div class="sv-list">${over.slice(0,30).map(o=>dueItem(o,t)).join('')}${over.length>30?`<div class="sv-none">и ещё ${over.length-30}</div>`:''}</div>`:''}</aside></div>`; }
  else { let rows=''; if(t>=ws&&t<=we&&over.length) rows+=`<div class="sv-wd over"><div class="sv-wdh"><b class="sv-red">Просрочено</b><span>${over.length}</span></div><div class="sv-wdl">${over.slice(0,30).map(o=>dueItem(o,t)).join('')}</div></div>`;
    for(let i=0;i<7;i++){ const d=addD(ws,i), list=by[d]||[]; rows+=`<div class="sv-wd${d===t?' today':''}${i>4?' we':''}"><div class="sv-wdh"><b>${WDS[i]}</b><span>${E(fDL(d))}${d===t?' · сегодня':''}</span><span class="ks-sp"></span>${list.length?`<small>${list.length} ${plural(list.length,'заказ','заказа','заказов')}</small>`:''}<button class="sv-ib sm" data-svnewdue="${d}" title="Новый заказ на этот день" aria-label="Новый заказ на этот день">${IC.plus}</button></div><div class="sv-wdl">${list.length?list.map(o=>dueItem(o,t)).join(''):'<div class="sv-none sm">Нет сроков</div>'}</div></div>`; }
    body=`<div class="sv-week">${rows}</div>`; }
  scr.innerHTML=`<div class="sv sv-due">${head}${empty}${body}</div>`; scr.scrollTop=keep; };

/* ---- ICS ---- */
function icsEsc(s){ return String(s==null?'':s).replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\r?\n/g,'\\n'); }
function icsFold(line){ const enc=new TextEncoder(); if(enc.encode(line).length<=75) return line; const out=[]; let cur_='', n=0, lim=75;
  for(const ch of line){ const b=enc.encode(ch).length; if(n+b>lim){ out.push(cur_); cur_=''; n=0; lim=74; } cur_+=ch; n+=b; } out.push(cur_); return out.join('\r\n '); }
function icsText(list){ const sh=st.shop||{}, now=new Date(), z=x=>String(x).padStart(2,'0'), stamp=now.getUTCFullYear()+z(now.getUTCMonth()+1)+z(now.getUTCDate())+'T'+z(now.getUTCHours())+z(now.getUTCMinutes())+z(now.getUTCSeconds())+'Z';
  const L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Konvert Studio//Svodka//RU','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:'+icsEsc('Сроки заказов'+(sh.name?' — '+sh.name:''))];
  list.forEach(o=>{ const d=debtOf(o), desc=[`Заказ №${o.no} · ${stName(o.status)}`,o.client?'Клиент: '+o.client:'',o.phone?'Телефон: '+o.phone:'',o.product?'Изделие: '+o.product+(o.qty?' × '+o.qty:''):'',num(o.price)?'Цена: '+MONEY(o.price)+(d>0?', долг '+MONEY(d):', оплачен'):'',o.note?'Заметка: '+o.note:''].filter(Boolean).join('\n');
    L.push('BEGIN:VEVENT','UID:'+String(o.id).replace(/[^\w.-]/g,'')+'@konvert-studio','DTSTAMP:'+stamp,'DTSTART;VALUE=DATE:'+o.due.replace(/-/g,''),'DTEND;VALUE=DATE:'+addD(o.due,1).replace(/-/g,''),
      'SUMMARY:'+icsEsc(`№${o.no} · ${o.client||'Без клиента'}${o.product?' — '+o.product:''}`),'DESCRIPTION:'+icsEsc(desc),'CATEGORIES:'+icsEsc('Заказы'),'TRANSP:TRANSPARENT','STATUS:CONFIRMED',
      'BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+icsEsc(`Завтра срок: заказ №${o.no}${o.client?' · '+o.client:''}`),'TRIGGER:-PT15H','END:VALARM','END:VEVENT'); });
  L.push('END:VCALENDAR'); return L.map(icsFold).join('\r\n')+'\r\n'; }
async function exportICS(){ const list=icsList(); if(!list.length){ KS.toast('Нет незавершённых заказов со сроком'); return; }
  if(await KS.download(`sroki-zakazov-${today()}.ics`,new Blob([icsText(list)],{type:'text/calendar;charset=utf-8'}))) KS.toast(`Календарь: ${list.length} ${plural(list.length,'срок','срока','сроков')} с напоминанием накануне`); }

/* ================= wiring ================= */
function goBoard(f){ const B=S().board; bq=''; B.client=''; B.over=false; B.unpaid=false; Object.assign(B,f||{}); KS.save(); KS.show('svodka','board'); }
function wirePanel(box){ if(box._sv) return; box._sv=1;
  box.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b) return; const s=S(), B=s.board, C=s.cal;
    if(b.dataset.svper){ s.per=b.dataset.svper; s.rv='auto'; if(s.per==='custom'&&!(okD(s.from)&&okD(s.to))){ s.to=today(); s.from=addD(s.to,-29); } KS.save(); PANEL.ov(box); rerender('ov'); return; }
    if(b.dataset.svx){ const x=b.dataset.svx; if(x==='xlsx') exportXLSX(); else exportCSV(x==='ocsv'?'o':'s'); return; }
    if(b.dataset.svnew){ createOrder(); return; }
    if(b.dataset.svgo){ KS.show('svodka',b.dataset.svgo); return; }
    if(b.dataset.svreset){ bq=''; B.client=''; B.over=false; B.unpaid=false; KS.save(); PANEL.board(box); rerender('board'); return; }
    if(b.dataset.svdone){ B.done=b.dataset.svdone; more={}; KS.save(); box.querySelectorAll('[data-svdone]').forEach(x=>x.classList.toggle('on',x===b)); rerender('board'); return; }
    if(b.dataset.svview){ C.view=b.dataset.svview; KS.save(); box.querySelectorAll('[data-svview]').forEach(x=>x.classList.toggle('on',x===b)); rerender('due'); return; }
    if(b.dataset.svics){ exportICS(); return; } });
  box.addEventListener('input',e=>{ const el=e.target; if(el.id==='svQ'){ bq=el.value; more={}; const r=$q('[data-svreset]',box); if(r) r.hidden=!hasFilter(); rerender('board'); } });
  box.addEventListener('change',e=>{ const el=e.target, s=S(), B=s.board;
    if(el.id==='svFrom'||el.id==='svTo'){ if(okD(el.value)){ s[el.id==='svFrom'?'from':'to']=el.value; s.per='custom'; KS.save(); UPD.ov(box); rerender('ov'); } return; }
    if(el.id==='svCli'){ B.client=el.value; KS.save(); UPD.board(box); rerender('board'); return; }
    if(el.id==='svOver'){ B.over=el.checked; KS.save(); UPD.board(box); rerender('board'); return; }
    if(el.id==='svUnpaid'){ B.unpaid=el.checked; KS.save(); UPD.board(box); rerender('board'); return; }
    if(el.id==='svCancel'){ B.cancel=el.checked; KS.save(); rerender('board'); return; }
    if(el.id==='svShowDone'){ s.cal.done=el.checked; KS.save(); rerender('due'); return; } }); }
function syncBoardPanel(){ const v=V.board; if(v&&v.box&&v.box.isConnected&&v.box.querySelector('#svQ')) PANEL.board(v.box); }
function wireScreen(scr,id){ if(scr._sv) return; scr._sv=id;
  scr.addEventListener('click',e=>{ const t=e.target; if(scr._noclick&&Date.now()-scr._noclick<350) { e.preventDefault(); return; }
    let b=t.closest('a.sv-ib'); if(b) return;
    b=t.closest('[data-svnew]'); if(b){ createOrder(); return; }
    b=t.closest('[data-svnewdue]'); if(b){ createOrder({due:b.dataset.svnewdue}); return; }
    b=t.closest('[data-svgo]'); if(b){ const g=b.dataset.svgo; if(g==='over') goBoard({over:true}); else if(g==='unpaid') goBoard({unpaid:true}); else goBoard(); return; }
    b=t.closest('[data-svcli]'); if(b){ goBoard({client:b.dataset.svcli}); return; }
    b=t.closest('[data-svrv]'); if(b){ S().rv=b.dataset.svrv; KS.save(); rerender('ov'); return; }
    b=t.closest('[data-svpm]'); if(b){ S().pm=b.dataset.svpm; KS.save(); rerender('ov'); return; }
    b=t.closest('[data-svtbl]'); if(b){ ovTable=!ovTable; rerender('ov'); return; }
    b=t.closest('[data-svmsg]'); if(b){ const o=findO(b.dataset.svmsg); if(o){ if(menuEl&&menuEl._for===o.id){ closeMenu(); return; } msgMenu(b,o); menuEl._for=o.id; } return; }
    b=t.closest('[data-svnext]'); if(b){ setStatus(b.dataset.svnext,b.dataset.to); return; }
    b=t.closest('[data-svmore]'); if(b){ const k=b.dataset.svmore; more[k]=(more[k]||40)+40; rerender('board'); return; }
    b=t.closest('[data-svxcol]'); if(b){ S().board.cancel=b.dataset.svxcol==='1'; KS.save(); const v=V.board; if(v&&v.box){ const c=$q('#svCancel',v.box); if(c) c.checked=S().board.cancel; } rerender('board'); return; }
    b=t.closest('[data-svclr]'); if(b){ const k=b.dataset.svclr, B=S().board; if(k==='q') bq=''; else if(k==='client') B.client=''; else B[k]=false; KS.save(); syncBoardPanel(); rerender('board'); return; }
    b=t.closest('[data-svreset]'); if(b){ bq=''; const B=S().board; B.client=''; B.over=false; B.unpaid=false; KS.save(); syncBoardPanel(); rerender('board'); return; }
    b=t.closest('[data-svics]'); if(b){ exportICS(); return; }
    b=t.closest('[data-svview]'); if(b){ S().cal.view=b.dataset.svview; KS.save(); const v=V.due; if(v&&v.box) v.box.querySelectorAll('[data-svview]').forEach(x=>x.classList.toggle('on',x.dataset.svview===b.dataset.svview)); rerender('due'); return; }
    b=t.closest('[data-svnav]'); if(b){ navCal(+b.dataset.svnav); return; }
    b=t.closest('[data-svopen]'); if(b){ openOrder(b.dataset.svopen); return; }
    b=t.closest('[data-svday]'); if(b){ const C=S().cal; C.sel=b.dataset.svday; if(C.sel.slice(0,7)!==(C.ym||C.sel.slice(0,7))) C.ym=C.sel.slice(0,7); KS.save(); rerender('due'); return; }
    b=t.closest('.sv-card'); if(b&&!t.closest('button,a')){ openOrder(b.dataset.id); return; } });
  scr.addEventListener('keydown',e=>{ if(e.key!=='Enter'&&e.key!==' ') return; const c=e.target.closest&&e.target.closest('.sv-card,[data-svday],[data-svxcol]'); if(!c||e.target!==c) return; e.preventDefault(); c.click(); });
  scr.addEventListener('contextmenu',e=>{ if(e.target.closest&&e.target.closest('.sv-card')&&(drag||e.pointerType==='touch')) e.preventDefault(); });
  scr.addEventListener('pointerdown',e=>{ if(drag||e.button>0) return; const card=e.target.closest('.sv-card'); if(!card||card.classList.contains('sv-ghost')||e.target.closest('a,button,input,select')) return;
    const touch=e.pointerType!=='mouse'; drag={id:card.dataset.id,from:(findO(card.dataset.id)||{}).status,card,scr,pid:e.pointerId,touch,x0:e.clientX,y0:e.clientY,x:e.clientX,y:e.clientY,on:false,over:null};
    if(touch){ card.classList.add('sv-press'); drag.t=setTimeout(()=>{ if(drag&&!drag.on&&drag.card===card) dragStart(); },300); } });
  let rT=0; if(window.ResizeObserver) new ResizeObserver(()=>{ clearTimeout(rT); rT=setTimeout(()=>{ if(scr.hidden||scr._sv!=='ov'||!V.ov) return; const w=scr.clientWidth; if(w&&Math.abs((V.ov.w||0)-w)>4) rerender('ov'); },140); }).observe(scr); }
function navCal(dir){ const C=S().cal, t=today(); let sel=okD(C.sel)?C.sel:t;
  if(dir===0){ C.sel=t; C.ym=t.slice(0,7); }
  else if(C.view==='week'){ sel=addD(sel,7*dir); C.sel=sel; C.ym=sel.slice(0,7); }
  else { const ym=/^\d{4}-\d\d$/.test(C.ym||'')?C.ym:sel.slice(0,7), nm=addM(ym+'-01',dir).slice(0,7); C.ym=nm; C.sel=nm===t.slice(0,7)?t:nm+'-01'; }
  KS.save(); rerender('due'); }

/* ---------------- commands ---------------- */
KS.cmd('Сводка: обзор бизнеса','раздел',()=>KS.show('svodka','ov'));
KS.cmd('Доска заказов (канбан)','раздел',()=>KS.show('svodka','board'));
KS.cmd('Сроки заказов: календарь','раздел',()=>KS.show('svodka','due'));
KS.cmd('Сроки заказов → Календарь (.ics)','действие',exportICS);
KS.cmd('Сводка → Excel за период','действие',exportXLSX);

/* test/debug hooks (read-only helpers) */
window.__svStats={agg:(a,b)=>agg(a,b),period,icsText,waDigits,msgText,sRow,oRow};
