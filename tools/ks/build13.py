"""Build the app with the KS module host and modules.
usage: python3 ks/build13.py IN.html OUT.html [--mods a,b,c | --all | --none]
modules live in ks/mods/<name>/mod.js (+ optional mod.css). Run from the scratchpad dir."""
import sys, pathlib
HERE = pathlib.Path(__file__).resolve().parent
args = sys.argv[1:]
if len(args) < 2: raise SystemExit(__doc__)
src = pathlib.Path(args[0]).read_text(encoding='utf-8'); out = args[1]
MODS = HERE / 'mods'
names = []
if '--all' in args or len(args) == 2:
    order = (HERE / 'order.txt').read_text().split() if (HERE / 'order.txt').exists() else []
    found = sorted(p.name for p in MODS.iterdir() if (p / 'mod.js').exists()) if MODS.exists() else []
    names = [n for n in order if n in found] + [n for n in found if n not in order]
elif '--mods' in args:
    names = [n for n in args[args.index('--mods') + 1].split(',') if n]
def rep(old, new, count=1):
    global src
    n = src.count(old)
    if n != count: raise SystemExit(f'expected {count} got {n}: {old[:140]!r}')
    src = src.replace(old, new)
rep("const SHARED=['book','fonts','printers','ui','log','customStamps','orders','clients','shop','myTpl'];",
    "const SHARED=['book','fonts','printers','ui','log','customStamps','orders','clients','shop','myTpl','ks'];")
rep("orders:[],clients:[],myTpl:[],\n  dz:{", "orders:[],clients:[],myTpl:[],ks:{},\n  dz:{")
css = (HERE / 'host.css').read_text(encoding='utf-8')
js = (HERE / 'host.js').read_text(encoding='utf-8')
for n in names:
    d = MODS / n
    if not (d / 'mod.js').exists(): raise SystemExit('no module ' + n)
    if (d / 'mod.css').exists(): css += f'\n/* ks module: {n} */\n' + (d / 'mod.css').read_text(encoding='utf-8')
    body = (d / 'mod.js').read_text(encoding='utf-8')
    if '</script' in body.lower(): raise SystemExit(f'{n}: mod.js must not contain a closing script tag')
    js += f"\n/* ===== ks module: {n} ===== */\ntry{{ (function(){{ 'use strict';\n{body}\n}})(); }}catch(e){{ console.error('[KS] module {n} failed',e); }}\n"
rep('.work{position:relative}', '.work{position:relative}\n' + css)
rep('/* boot */', js + '\n/* boot */')
rep("true); dzApplyMode();\nif(document.fonts)", "true); dzApplyMode();\ntry{ KS._boot(); }catch(e){ console.error('[KS] boot',e); }\nif(document.fonts)")
pathlib.Path(out).write_text(src, encoding='utf-8')
print('ok', len(src), 'modules:', ','.join(names) or '-')
