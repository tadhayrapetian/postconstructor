"""Envelope back side as a full workspace + print/export without HTML files.
usage: python3 patch14.py IN.html OUT.html"""
import sys, pathlib
src = pathlib.Path(sys.argv[1]).read_text(encoding='utf-8')
def rep(old, new, count=1):
    global src
    n = src.count(old)
    if n != count: raise SystemExit(f'expected {count} got {n}: {old[:120]!r}')
    src = src.replace(old, new)

# ---------- 1. free items carry a side; front skips back items, back renders them
lines = src.split('\n')
starts = ["  if(show('texts')) st.texts.forEach((x,i)=>{ ", "  if(show('stickers')) st.stickers.forEach((x,i)=>{ ",
          "  st.shapes.forEach((x,i)=>{ ", "  st.arcs.forEach((x,i)=>{ ", "  st.drawings.forEach((x,i)=>{ "]
idx = []
for s in starts:
    hits = [i for i, l in enumerate(lines) if l.startswith(s) and "h+=blk('" in l and (not idx or 0 < i-idx[0] < 8)]
    if len(hits) != 1: raise SystemExit('item line ' + s + str(hits))
    idx.append(hits[0])
back_lines = []
for i, s in zip(idx, starts):
    l = lines[i]
    rest = l[len(s):]
    lines[i] = s + "if(x.side==='back') return; " + rest
    head = s.replace("if(show('texts')) ", '').replace("if(show('stickers')) ", '')
    back_lines.append('  ' + head + "if(x.side!=='back') return; " + rest)
src = '\n'.join(lines)
rep("    if(st.ycal&&st.ycal.on&&st.ycal.side==='back') h+=blk('ycal',",
    "    /* free elements placed on the back side */\n" + '\n'.join('  ' + b for b in back_lines) +
    "\n    if(st.ycal&&st.ycal.on&&st.ycal.side==='back') h+=blk('ycal',")

# ---------- 2. new elements go to the side that is open now
rep("$('#addText').onclick=()=>{ st.texts.push({text:'С любовью, {отправитель}',font:'',size:12,color:'',align:'left',bold:false,italic:false}); ovOf(st.tpl).show.texts=true; sel='tx'+(st.texts.length-1); if(st.view!=='front') setView('front'); syncUI(); update(); };",
    "$('#addText').onclick=()=>{ st.texts.push(sideNew({text:st.view==='back'?'Ваш текст':'С любовью, {отправитель}',font:'',size:12,color:'',align:'left',bold:false,italic:false})); ovOf(st.tpl).show.texts=true; sel='tx'+(st.texts.length-1); syncUI(); update(); };")
rep("st.stickers.push({id:b.dataset.stk,size:12,color:''}); ovOf(st.tpl).show.stickers=true; sel='sk'+(st.stickers.length-1); if(st.view!=='front') setView('front'); syncUI(); update(); });",
    "st.stickers.push(sideNew({id:b.dataset.stk,size:12,color:''})); ovOf(st.tpl).show.stickers=true; sel='sk'+(st.stickers.length-1); syncUI(); update(); });")
rep("st.shapes.push({type:ty,w:ty==='circle'?20:40,h:ty==='circle'?20:14,sw:.5,color:'',fill:false,r:0}); sel='sh'+(st.shapes.length-1); setView('front'); syncUI(); update(); }));",
    "st.shapes.push(sideNew({type:ty,w:ty==='circle'?20:40,h:ty==='circle'?20:14,sw:.5,color:'',fill:false,r:0})); sel='sh'+(st.shapes.length-1); syncUI(); update(); }));")
rep("st.arcs.push({text:'С любовью · {отправитель} · ',r:18,size:9,mode:'arc',color:'',font:''}); sel='ar'+(st.arcs.length-1); setView('front'); syncUI(); update(); };",
    "st.arcs.push(sideNew({text:'С любовью · {отправитель} · ',r:18,size:9,mode:'arc',color:'',font:''})); sel='ar'+(st.arcs.length-1); syncUI(); update(); };")
rep("else { st.drawings.push({data:url,w:40}); sel='dr'+(st.drawings.length-1); setView('front'); toast('Рисунок добавлен на конверт'); }",
    "else { st.drawings.push(sideNew({data:url,w:40})); sel='dr'+(st.drawings.length-1); toast(st.view==='back'?'Рисунок добавлен на оборот':'Рисунок добавлен на конверт'); }")

# ---------- 3. side switch + photos card at the top of the Elements panel
CARD = '''<div class="card" id="sideCard"><div class="hd">Сторона конверта</div>
            <div class="seg" id="sideSeg" style="width:100%"><button data-side="front" style="flex:1">Лицевая сторона</button><button data-side="back" style="flex:1">Обратная сторона</button></div>
            <p class="hint" id="sideHint">Всё, что вы добавляете ниже, ложится на открытую сторону. Элементы каждой стороны хранятся отдельно.</p>
            <div class="flexw"><span class="btn sm primary file">+ Фото<input type="file" id="sidePhotos" accept="image/*" multiple aria-label="Добавить фото"></span><span class="hint" id="sideCount"></span></div></div>
            '''
rep('data-panel="items" hidden>', 'data-panel="items" hidden>\n            ' + CARD)

JS = r'''
/* ---------- envelope sides: every free element lives on its own side ---------- */
function sideNew(o){ if(st.view==='back'){ o.side='back'; if(!st.print.back){ st.print.back=true; toast('Оборот тоже будет напечатан'); } } else if(st.view!=='front') setView('front'); return o; }
function sideItems(sd){ const f=x=>sd==='back'?x.side==='back':x.side!=='back'; return st.texts.filter(f).length+st.stickers.filter(f).length+st.shapes.filter(f).length+st.arcs.filter(f).length+st.drawings.filter(f).length; }
function markSide(){ const seg=$('#sideSeg'); if(!seg) return; const v=st.view==='back'?'back':st.view==='front'?'front':''; seg.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.side===v));
  const c=$('#sideCount'); if(c) c.textContent=`Лицо: ${sideItems('front')} · Оборот: ${sideItems('back')}`; }
{ const _sv=setView; setView=function(v){ _sv(v); markSide(); }; }
{ const _ri=renderItems; renderItems=function(){ _ri.apply(this,arguments); markSide(); }; }
$('#sideSeg').addEventListener('click',e=>{ const b=e.target.closest('[data-side]'); if(!b) return; sel=null; setView(b.dataset.side); update(); });
$('#sidePhotos').addEventListener('change',async e=>{ const fs=[...(e.target.files||[])].filter(f=>/^image\//.test(f.type)); e.target.value=''; if(!fs.length) return;
  if(!['front','back'].includes(st.view)) setView('front'); const {W}=dims(); let n=0;
  for(const f of fs){ try{ const data=await dzReadImage(f,2400); st.drawings.push(sideNew({data,w:Math.round(Math.min(60,W*.4))})); n++; }catch(_){ } }
  if(!n){ toast('Не удалось открыть картинки'); return; } sel='dr'+(st.drawings.length-1); ovOf(st.tpl).show=ovOf(st.tpl).show||{}; syncUI(); update(); toast((n===1?'Фото добавлено':'Добавлено фото: '+n)+(st.view==='back'?' на оборот':' на лицевую сторону')+'. Тяните, растягивайте и поворачивайте прямо на макете.'); });
markSide();
document.head.insertAdjacentHTML('beforeend','<style>#afSVG{display:none!important}</style>');
'''
rep("/* boot */", JS + "\n/* boot */")

# ---------- 4. no HTML files: when the print window is blocked, save an exact-size PDF instead
old_start = "async function printFileFallback(){"
a = src.find(old_start); b = src.find("\n}\n", a)
if a < 0 or b < 0 or src.count(old_start) != 1: raise SystemExit('printFileFallback')
src = src[:a] + r'''async function printFileFallback(){
  const root=$('#printRoot'); const pgs=[...root.querySelectorAll(':scope > .page, .page')].filter((p,i,a)=>a.indexOf(p)===i&&!p.parentElement.closest('.page')); if(!pgs.length) return;
  const pages=pgs.map((p,i)=>({pw:parseFloat(p.style.width)||210,ph:parseFloat(p.style.height)||297,name:'pechat-'+(i+1),html:p.outerHTML.replace(/page:ps\d+;/,'')}));
  toast('Окно печати здесь недоступно. Сохраняю PDF точного размера — откройте его и печатайте с масштабом 100%.');
  try{ await exportPDF(pages,300,()=>{}); }catch(e){ toast('Не удалось сохранить PDF. Откройте программу в Safari или Chrome.'); }
}''' + src[b + 2:]

# ---------- 5. export formats: PDF, PNG, JPEG only
rep('<select id="expFmt"><option value="vpdf" selected>PDF вектор, для печати и типографии</option><option value="pdf">PDF картинкой, для мессенджеров</option><option value="png">PNG, картинка</option><option value="jpg">JPG, картинка поменьше</option><option value="svg">SVG для браузера</option></select>',
    '<select id="expFmt"><option value="pdf" selected>PDF для печати, точный размер</option><option value="png">PNG, картинка</option><option value="jpg">JPEG, картинка поменьше</option><option value="vpdf">PDF вектор через окно печати</option></select>')
rep("openExport(fmt==='pdf'||fmt==='vpdf'?'vpdf':(fmt==='jpg'||fmt==='svg')?fmt:'png'); }", "openExport(fmt==='vpdf'?'vpdf':(fmt==='pdf'||fmt==='jpg')?fmt:'png'); }")
pathlib.Path(sys.argv[2]).write_text(src, encoding='utf-8'); print('ok', len(src))
