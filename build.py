import base64, pathlib, json

FONTS = json.load(open('/home/claude/constructor/fonts.json'))
JSZIP_SRC = pathlib.Path('/home/claude/jszip/node_modules/jszip/dist/jszip.min.js').read_text(encoding='utf-8')
QR_SRC = pathlib.Path('/home/claude/repo/qrcode_bundle.js').read_text(encoding='utf-8')

FONT_FACES = f"""
@font-face{{font-family:'Atyan';src:url(data:font/woff2;base64,{FONTS['ATY']}) format('woff2');font-weight:400;font-display:block}}
@font-face{{font-family:'MA';src:url(data:font/woff2;base64,{FONTS['MA_REG']}) format('woff2');font-weight:400;font-display:block}}
@font-face{{font-family:'MA';src:url(data:font/woff2;base64,{FONTS['MA_MED']}) format('woff2');font-weight:500;font-display:block}}
@font-face{{font-family:'MA';src:url(data:font/woff2;base64,{FONTS['MA_SB']}) format('woff2');font-weight:600;font-display:block}}
@font-face{{font-family:'MA';src:url(data:font/woff2;base64,{FONTS['MA_BLD']}) format('woff2');font-weight:700;font-display:block}}
@font-face{{font-family:'MA';src:url(data:font/woff2;base64,{FONTS['MA_XB']}) format('woff2');font-weight:800;font-display:block}}
@font-face{{font-family:'MA';src:url(data:font/woff2;base64,{FONTS['MA_BLK']}) format('woff2');font-weight:900;font-display:block}}
@font-face{{font-family:'Disp';src:url(data:font/woff2;base64,{FONTS['DISPI']}) format('woff2');font-weight:400;font-style:italic;font-display:block}}
"""

AVA = FONTS['AVA']

# ============================================================================
# CSS for the constructor UI chrome (dark control panel)
# ============================================================================
UI_CSS = """
*{box-sizing:border-box}
body{margin:0;background:#15130F;color:#F0EAE0;font:15px/1.5 -apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;
  padding:0}
#appShell{display:flex;gap:20px;align-items:flex-start;padding:16px;max-width:1400px;margin:0 auto}
#toolCol{flex:1 1 520px;min-width:0;display:flex;flex-direction:column;gap:18px;
  max-height:calc(100vh - 32px);overflow-y:auto;padding-right:6px}
#toolCol::-webkit-scrollbar{width:8px}
#toolCol::-webkit-scrollbar-thumb{background:#3A362C;border-radius:4px}
#previewCol{flex:0 0 560px;position:sticky;top:16px;align-self:flex-start;
  max-height:calc(100vh - 32px);overflow-y:auto;display:flex;flex-direction:column;align-items:center;gap:14px}
#previewCol::-webkit-scrollbar{width:8px}
#previewCol::-webkit-scrollbar-thumb{background:#3A362C;border-radius:4px}
@media (max-width: 1080px){
  #appShell{flex-direction:column;padding:12px}
  #toolCol,#previewCol{flex:1 1 auto;width:100%;max-height:none;position:static;overflow:visible}
}
h2{font-size:14px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#E0A857;margin:0 0 10px}
.panel{width:100%;max-width:560px;background:#221F19;border-radius:16px;padding:20px;display:flex;flex-direction:column;gap:10px}
textarea{width:100%;min-height:170px;background:#171410;color:#F0EAE0;border:1px solid #3A362C;border-radius:10px;
  padding:12px;font:14px/1.5 ui-monospace,Menlo,monospace;resize:vertical}
input[type=text]{width:100%;background:#171410;color:#F0EAE0;border:1px solid #3A362C;border-radius:10px;padding:10px 12px;font-size:15px}
.tplgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
select{width:100%;background:#171410;color:#F0EAE0;border:1px solid #3A362C;border-radius:10px;
  padding:12px;font-size:15px;font-weight:600}
select optgroup{background:#221F19;color:#E0A857;font-size:13px}
select option{background:#171410;color:#F0EAE0;font-weight:400;padding:6px}
.tplbtn{background:#171410;border:2px solid #3A362C;border-radius:12px;padding:14px 8px;color:#D8CFC0;
  font-size:13px;font-weight:600;text-align:center;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:8px}
.tplbtn.active{border-color:#E0A857;color:#fff;background:#2E2A20}
.tplbtn svg{width:36px;height:44px}
.row{display:flex;align-items:center;gap:12px}
.row label{flex:0 0 120px;color:#B9AF9C;font-size:14px}
input[type=range]{flex:1}
.swatches{display:flex;gap:10px;flex-wrap:wrap}
.swatch{width:44px;height:44px;border-radius:10px;border:2px solid rgba(255,255,255,.15)}
.btn{background:#E0A857;color:#221A0C;border:0;border-radius:10px;padding:13px 18px;font-size:15px;font-weight:700;cursor:pointer}
.btn.ghost{background:#3A362C;color:#F0EAE0}
.btn.wide{width:100%}
.btns{display:flex;gap:10px;flex-wrap:wrap}
.stage{width:100%;display:flex;justify-content:center;overflow:hidden}
.wrap{transform-origin:top center}
.nav{display:flex;align-items:center;gap:16px}
.nav button{background:#3A362C;color:#F0EAE0;border:0;border-radius:12px;padding:12px 20px;font-size:16px;font-weight:600}
.count{font-size:16px;font-weight:600;min-width:70px;text-align:center}
.hint{font-size:13px;color:#B9AF9C;max-width:560px;text-align:center}
#outimg{max-width:100%;border-radius:8px;display:none}
.sl{display:none}
.sl.show{display:block}
.section{border-top:1px solid #34302688;padding-top:14px;margin-top:4px}
"""

# ============================================================================
# Template CSS definitions - each template is a full slide-styling ruleset
# keyed by a body class (e.g. tpl-card). They all rely on the same CSS
# variables (--bg --ink --a0..--a3) so the color generator can drive any of them.
# ============================================================================
TEMPLATE_CSS = """
:root{--fs:1;--covfs:1}
.sl{width:1080px;height:1350px;overflow:hidden;position:relative;font-family:'MA',sans-serif;box-sizing:border-box;
  background:var(--bg);color:var(--ink)}
.sl *{box-sizing:border-box;outline:none}
.movable{position:absolute !important;left:0;right:0;cursor:grab;border:3px dashed rgba(224,168,87,.9);border-radius:10px}
.movable.dragging{cursor:grabbing;border-color:#E85D75}
.movable *{pointer-events:none}

/* ---------- shared cover / cta / follow scaffolding ---------- */
.cov .in,.cta .in,.fw .in{position:relative;z-index:1;height:100%;padding:90px;display:flex;flex-direction:column;
  align-items:center;justify-content:center;text-align:center}
.eyebrow{font-family:'MA';font-weight:700;font-size:calc(25px*var(--fs));letter-spacing:.22em;text-transform:uppercase;color:var(--a0)}
.covttl{font-family:'Atyan';text-transform:uppercase;font-size:calc(60px*var(--fs));line-height:1.28;margin-top:28px}
.cov .eyebrow{font-size:calc(25px*var(--covfs))}
.cov .covttl{font-size:calc(60px*var(--covfs))}
.cov .sub{font-size:calc(32px*var(--covfs))}
.plate{padding:0 14px;background:var(--a0);color:var(--bg);display:inline-block;line-height:1.15}
.dots{display:flex;gap:16px;margin-top:40px;justify-content:center}
.dots i{width:18px;height:18px;border-radius:50%;display:block}
.sub{font-family:'Disp';font-style:italic;font-size:calc(32px*var(--fs));margin-top:30px;opacity:.75;max-width:760px}
.plainsub{font-family:'MA';font-weight:500;font-size:calc(32px*var(--fs));line-height:1.5;opacity:.75;margin-top:30px;max-width:760px}
.fw .ava{width:400px;height:400px;border-radius:50%;margin-top:50px;border:8px solid var(--a0);background-color:var(--bg);
  background-size:cover;background-position:center}
.fw .chips{display:flex;gap:18px;width:100%;margin-top:auto;margin-bottom:40px}
.fw .chip{flex:1;border:2px solid currentColor;opacity:.9;border-radius:16px;padding:20px 0 16px;
  display:flex;flex-direction:column;align-items:center;gap:10px}
.fw .chip span{font-family:'MA';font-weight:600;font-size:calc(25px*var(--fs))}
.fw .chip svg{width:36px;height:36px}
.tag2{font-family:'MA';font-weight:700;font-size:calc(25px*var(--fs));letter-spacing:.16em;text-transform:uppercase;color:var(--a0)}

/* =========================================================
   TEMPLATE: CARD  -- white card, colored left/top border
   ========================================================= */
.tpl-card .ph .in{position:relative;z-index:1;height:100%;padding:70px 74px;display:flex;flex-direction:column}
.tpl-card .tag{font-family:'MA';font-weight:700;font-size:calc(22px*var(--fs));letter-spacing:.16em;text-transform:uppercase;opacity:.5}
.tpl-card .stage2{flex:1;display:flex;align-items:center;justify-content:center}
.tpl-card .card{width:100%;background:#FFFDF8;border-radius:32px;padding:56px 50px;
  box-shadow:0 24px 50px rgba(0,0,0,.12);border-left:9px solid var(--acc)}
.tpl-card .num{font-family:'Atyan';font-size:30px;color:var(--acc)}
.tpl-card .en{font-family:'MA';font-weight:800;font-size:calc(40px*var(--fs));line-height:1.25;margin-top:12px;color:var(--ink)}
.tpl-card .rule{height:2px;background:rgba(0,0,0,.14);margin:28px 0}
.tpl-card .lbl{font-family:'MA';font-weight:700;font-size:19px;letter-spacing:.12em;text-transform:uppercase;color:var(--acc)}
.tpl-card .am{font-family:'Disp';font-style:italic;font-size:calc(30px*var(--fs));line-height:1.4;margin-top:10px;color:var(--ink)}
.tpl-card .foot{display:flex;justify-content:space-between;align-items:baseline;padding-top:20px}
.tpl-card .handle{font-family:'MA';font-weight:700;font-size:24px}
.tpl-card .pg{font-family:'MA';font-weight:600;font-size:24px;opacity:.5}

/* =========================================================
   TEMPLATE: EDITORIAL -- full color bg per slide, no card
   ========================================================= */
.tpl-editorial .ph .in{position:relative;z-index:1;height:100%;padding:76px 74px;display:flex;flex-direction:column}
.tpl-editorial .tag{font-family:'MA';font-weight:700;font-size:calc(22px*var(--fs));letter-spacing:.16em;text-transform:uppercase;opacity:.55}
.tpl-editorial .items{flex:1;display:flex;flex-direction:column;justify-content:center;gap:0}
.tpl-editorial .item{padding:34px 0}
.tpl-editorial .item + .item{border-top:2px solid currentColor}
.tpl-editorial .inum{font-family:'Atyan';font-size:30px;opacity:.55}
.tpl-editorial .en{font-family:'MA';font-weight:900;font-size:calc(42px*var(--fs));line-height:1.28;margin-top:10px}
.tpl-editorial .am{font-family:'Disp';font-style:italic;font-size:calc(28px*var(--fs));line-height:1.4;margin-top:10px;opacity:.85}
.tpl-editorial .foot{display:flex;justify-content:space-between;align-items:baseline;padding-top:20px;border-top:1px solid currentColor}
.tpl-editorial .handle{font-family:'MA';font-weight:700;font-size:24px}
.tpl-editorial .pg{font-family:'MA';font-weight:600;font-size:24px;opacity:.6}

/* =========================================================
   TEMPLATE: LEDGER -- alternating stripe rows
   ========================================================= */
.tpl-ledger .ph .in{position:relative;z-index:1;height:100%;padding:64px 0 54px;display:flex;flex-direction:column}
.tpl-ledger .tag{font-family:'MA';font-weight:700;font-size:calc(22px*var(--fs));letter-spacing:.16em;text-transform:uppercase;opacity:.5;padding:0 64px}
.tpl-ledger .rows{flex:1;display:flex;flex-direction:column;justify-content:center;margin-top:20px}
.tpl-ledger .row2{display:flex;align-items:flex-start;gap:26px;padding:32px 64px}
.tpl-ledger .row2:nth-child(odd){background:var(--a2)}
.tpl-ledger .row2:nth-child(even){background:var(--a3)}
.tpl-ledger .rnum{flex:0 0 auto;font-family:'Atyan';font-size:36px;color:var(--a0);opacity:.9}
.tpl-ledger .rbody{flex:1}
.tpl-ledger .ren{font-family:'MA';font-weight:800;font-size:calc(32px*var(--fs));line-height:1.3;color:var(--ink)}
.tpl-ledger .ram{font-family:'Disp';font-style:italic;font-size:calc(25px*var(--fs));line-height:1.4;margin-top:8px;color:var(--a0)}
.tpl-ledger .foot{display:flex;justify-content:space-between;align-items:baseline;padding:22px 64px 0}
.tpl-ledger .handle{font-family:'MA';font-weight:700;font-size:24px}
.tpl-ledger .pg{font-family:'MA';font-weight:600;font-size:24px;opacity:.6}

/* =========================================================
   TEMPLATE: GRID -- 2-column tiles
   ========================================================= */
.tpl-grid .ph .in{position:relative;z-index:1;height:100%;padding:64px 60px 54px;display:flex;flex-direction:column}
.tpl-grid .tag{font-family:'MA';font-weight:700;font-size:calc(22px*var(--fs));letter-spacing:.16em;text-transform:uppercase;opacity:.5}
.tpl-grid .tgrid{flex:1;display:grid;grid-template-columns:1fr 1fr;gap:20px;align-content:center;margin-top:20px}
.tpl-grid .tile{background:#FFFDF8;border-radius:24px;padding:28px 24px;box-shadow:0 10px 24px rgba(0,0,0,.08)}
.tpl-grid .tnum{width:38px;height:38px;border-radius:50%;background:var(--acc);color:var(--bg);
  display:flex;align-items:center;justify-content:center;font-family:'MA';font-weight:700;font-size:15px;margin-bottom:14px}
.tpl-grid .en{font-family:'MA';font-weight:800;font-size:calc(24px*var(--fs));line-height:1.3;color:var(--ink)}
.tpl-grid .am{font-family:'MA';font-weight:500;font-size:calc(19px*var(--fs));margin-top:6px;color:var(--ink);opacity:.65}
.tpl-grid .foot{display:flex;justify-content:space-between;align-items:baseline;padding-top:20px;margin-top:20px;
  border-top:1px solid rgba(0,0,0,.14)}
.tpl-grid .handle{font-family:'MA';font-weight:700;font-size:24px}
.tpl-grid .pg{font-family:'MA';font-weight:600;font-size:24px;opacity:.5}

/* =========================================================
   TEMPLATE: PILLS -- rounded colored chips, centered
   ========================================================= */
.tpl-pills .ph .in{position:relative;z-index:1;height:100%;padding:80px 70px;display:flex;flex-direction:column;
  align-items:center;text-align:center}
.tpl-pills .tag{font-family:'MA';font-weight:700;font-size:calc(22px*var(--fs));letter-spacing:.16em;text-transform:uppercase;opacity:.5}
.tpl-pills .pbody{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center}
.tpl-pills .en{font-family:'MA';font-weight:900;font-size:calc(48px*var(--fs));line-height:1.25;color:var(--ink)}
.tpl-pills .pillrow{margin-top:34px}
.tpl-pills .pill{display:inline-block;background:var(--acc);color:var(--bg);border-radius:999px;
  padding:16px 34px;font-family:'MA';font-weight:700;font-size:calc(30px*var(--fs))}
.tpl-pills .foot{display:flex;justify-content:space-between;align-items:baseline;width:100%;padding-top:20px}
.tpl-pills .handle{font-family:'MA';font-weight:700;font-size:24px}
.tpl-pills .pg{font-family:'MA';font-weight:600;font-size:24px;opacity:.5}

/* =========================================================
   TEMPLATE: LIST -- minimal numbered rows, no boxes
   ========================================================= */
.tpl-list .ph .in{position:relative;z-index:1;height:100%;padding:90px 76px;display:flex;flex-direction:column}
.tpl-list .covttl-small{font-family:'Atyan';text-transform:uppercase;font-size:calc(52px*var(--fs));line-height:1.1;color:var(--a0)}
.tpl-list .lrows{flex:1;display:flex;flex-direction:column;justify-content:center;margin-top:30px}
.tpl-list .lrow{display:flex;align-items:baseline;gap:20px;padding:20px 0;border-bottom:1px solid rgba(0,0,0,.14)}
.tpl-list .lnum{font-family:'MA';font-weight:700;font-size:22px;color:var(--acc);width:34px;flex:0 0 auto}
.tpl-list .len{font-family:'MA';font-weight:700;font-size:calc(27px*var(--fs));color:var(--ink);flex:1}
.tpl-list .lam{font-family:'MA';font-weight:400;font-size:calc(21px*var(--fs));color:var(--ink);opacity:.6;text-align:right}
.tpl-list .foot{display:flex;justify-content:space-between;align-items:baseline;padding-top:20px}
.tpl-list .handle{font-family:'MA';font-weight:700;font-size:24px}
.tpl-list .pg{font-family:'MA';font-weight:600;font-size:24px;opacity:.5}

/* =========================================================
   TEMPLATE: STACK -- one big quote-like phrase, huge type
   ========================================================= */
.tpl-stack .ph .in{position:relative;z-index:1;height:100%;padding:90px;display:flex;flex-direction:column;
  align-items:center;justify-content:center;text-align:center}
.tpl-stack .tag{font-family:'MA';font-weight:700;font-size:calc(22px*var(--fs));letter-spacing:.16em;text-transform:uppercase;opacity:.5}
.tpl-stack .num{font-family:'Atyan';font-size:40px;color:var(--acc);margin-top:20px}
.tpl-stack .en{font-family:'MA';font-weight:900;font-size:calc(58px*var(--fs));line-height:1.22;margin-top:16px;color:var(--ink)}
.tpl-stack .stackrule{width:80px;height:5px;background:var(--acc);border-radius:5px;margin:34px auto}
.tpl-stack .am{font-family:'Disp';font-style:italic;font-size:calc(32px*var(--fs));line-height:1.4;color:var(--ink);opacity:.8}
.tpl-stack .foot{position:absolute;left:90px;right:90px;bottom:70px;display:flex;justify-content:space-between;align-items:baseline}
.tpl-stack .handle{font-family:'MA';font-weight:700;font-size:24px;color:var(--ink)}
.tpl-stack .pg{font-family:'MA';font-weight:600;font-size:24px;color:var(--ink);opacity:.5}

/* =========================================================
   TEMPLATE: LADDER -- connected steps, growing dots
   ========================================================= */
.tpl-ladder .ph .in{position:relative;z-index:1;height:100%;padding:70px 74px;display:flex;flex-direction:column}
.tpl-ladder .tag{font-family:'MA';font-weight:700;font-size:calc(22px*var(--fs));letter-spacing:.16em;text-transform:uppercase;opacity:.5}
.tpl-ladder .ldwrap{position:relative;flex:1;display:flex;flex-direction:column;justify-content:center;
  gap:0;margin-top:20px;padding-left:50px}
.tpl-ladder .ldwrap::before{content:'';position:absolute;left:15px;top:20px;bottom:20px;width:3px;
  background:linear-gradient(180deg,var(--a2),var(--a0));border-radius:3px}
.tpl-ladder .lditem{position:relative;padding:22px 0}
.tpl-ladder .lddot{position:absolute;left:-50px;top:28px;border-radius:50%;background:var(--a0)}
.tpl-ladder .ldbody{background:#FFFDF8;border-radius:18px;padding:20px 26px;box-shadow:0 8px 20px rgba(0,0,0,.07)}
.tpl-ladder .len2{font-family:'MA';font-weight:800;font-size:calc(28px*var(--fs));color:var(--ink)}
.tpl-ladder .lam2{font-family:'MA';font-weight:500;font-size:calc(20px*var(--fs));color:var(--ink);opacity:.6;margin-top:4px}
.tpl-ladder .foot{display:flex;justify-content:space-between;align-items:baseline;padding-top:20px}
.tpl-ladder .handle{font-family:'MA';font-weight:700;font-size:24px}
.tpl-ladder .pg{font-family:'MA';font-weight:600;font-size:24px;opacity:.5}

/* =========================================================
   TEMPLATE: UNDERLINE -- big text, colored bar beneath
   ========================================================= */
.tpl-underline .ph .in{position:relative;z-index:1;height:100%;padding:90px;display:flex;flex-direction:column;
  align-items:center;justify-content:center;text-align:center}
.tpl-underline .tag{font-family:'MA';font-weight:700;font-size:calc(22px*var(--fs));letter-spacing:.16em;text-transform:uppercase;opacity:.5}
.tpl-underline .unum{font-family:'Atyan';font-size:36px;color:var(--acc);margin-top:22px}
.tpl-underline .uwrap{margin-top:20px;display:inline-block;position:relative}
.tpl-underline .en{font-family:'MA';font-weight:900;font-size:calc(52px*var(--fs));line-height:1.25;color:var(--ink);position:relative;z-index:1}
.tpl-underline .ubar{height:16px;background:var(--acc);border-radius:8px;margin-top:-14px;opacity:.55}
.tpl-underline .am{font-family:'Disp';font-style:italic;font-size:calc(30px*var(--fs));margin-top:36px;color:var(--ink);opacity:.8}
.tpl-underline .foot{position:absolute;left:90px;right:90px;bottom:70px;display:flex;justify-content:space-between;align-items:baseline}
.tpl-underline .handle{font-family:'MA';font-weight:700;font-size:24px;color:var(--ink)}
.tpl-underline .pg{font-family:'MA';font-weight:600;font-size:24px;color:var(--ink);opacity:.5}

/* =========================================================
   TEMPLATE: SPLIT -- two columns divided by a vertical rule
   ========================================================= */
.tpl-split .ph .in{position:relative;z-index:1;height:100%;padding:70px 0;display:flex;flex-direction:column}
.tpl-split .tag{font-family:'MA';font-weight:700;font-size:calc(22px*var(--fs));letter-spacing:.16em;text-transform:uppercase;opacity:.5;padding:0 74px}
.tpl-split .scols{flex:1;display:flex;align-items:center;margin-top:20px;position:relative}
.tpl-split .scols::before{content:'';position:absolute;left:50%;top:10%;bottom:10%;width:2px;background:var(--acc);opacity:.4}
.tpl-split .scol{flex:1;padding:0 60px;text-align:center}
.tpl-split .slbl{font-family:'MA';font-weight:700;font-size:19px;letter-spacing:.14em;text-transform:uppercase;color:var(--acc)}
.tpl-split .en{font-family:'MA';font-weight:800;font-size:calc(34px*var(--fs));line-height:1.3;color:var(--ink);margin-top:14px}
.tpl-split .am{font-family:'Disp';font-style:italic;font-size:calc(30px*var(--fs));line-height:1.4;color:var(--ink);margin-top:14px}
.tpl-split .foot{display:flex;justify-content:space-between;align-items:baseline;padding:20px 74px 0}
.tpl-split .handle{font-family:'MA';font-weight:700;font-size:24px}
.tpl-split .pg{font-family:'MA';font-weight:600;font-size:24px;opacity:.5}

/* =========================================================
   TEMPLATE: BADGE -- rounded sticker shape, slight rotation
   ========================================================= */
.tpl-badge .ph .in{position:relative;z-index:1;height:100%;padding:80px;display:flex;flex-direction:column;
  align-items:center;justify-content:center;text-align:center}
.tpl-badge .tag{font-family:'MA';font-weight:700;font-size:calc(22px*var(--fs));letter-spacing:.16em;text-transform:uppercase;opacity:.5}
.tpl-badge .sticker{margin-top:34px;background:#FFFDF8;border:6px solid var(--acc);border-radius:36px;
  padding:50px 44px;transform:rotate(-2deg);box-shadow:0 20px 40px rgba(0,0,0,.10);position:relative}
.tpl-badge .bnum{position:absolute;top:-28px;left:-28px;width:64px;height:64px;border-radius:50%;background:var(--acc);
  color:var(--bg);display:flex;align-items:center;justify-content:center;font-family:'Atyan';font-size:26px;transform:rotate(2deg)}
.tpl-badge .en{font-family:'MA';font-weight:800;font-size:calc(36px*var(--fs));line-height:1.28;color:var(--ink)}
.tpl-badge .am{font-family:'MA';font-weight:500;font-size:calc(24px*var(--fs));margin-top:14px;color:var(--ink);opacity:.65}
.tpl-badge .foot{position:absolute;left:80px;right:80px;bottom:60px;display:flex;justify-content:space-between;align-items:baseline}
.tpl-badge .handle{font-family:'MA';font-weight:700;font-size:24px;color:var(--ink)}
.tpl-badge .pg{font-family:'MA';font-weight:600;font-size:24px;color:var(--ink);opacity:.5}

/* =========================================================
   TEMPLATE: TIMELINE -- vertical connected numbered steps
   ========================================================= */
.tpl-timeline .ph .in{position:relative;z-index:1;height:100%;padding:70px 74px;display:flex;flex-direction:column}
.tpl-timeline .tag{font-family:'MA';font-weight:700;font-size:calc(22px*var(--fs));letter-spacing:.16em;text-transform:uppercase;opacity:.5}
.tpl-timeline .twrap{position:relative;flex:1;display:flex;flex-direction:column;justify-content:center;margin-top:20px;padding-left:60px}
.tpl-timeline .twrap::before{content:'';position:absolute;left:23px;top:24px;bottom:24px;width:3px;background:var(--a0);opacity:.35}
.tpl-timeline .titem{position:relative;padding:26px 0}
.tpl-timeline .tdot{position:absolute;left:-60px;top:26px;width:48px;height:48px;border-radius:50%;background:var(--a0);
  color:var(--bg);display:flex;align-items:center;justify-content:center;font-family:'MA';font-weight:800;font-size:19px}
.tpl-timeline .ten{font-family:'MA';font-weight:800;font-size:calc(29px*var(--fs));color:var(--ink)}
.tpl-timeline .tam{font-family:'MA';font-weight:500;font-size:calc(21px*var(--fs));color:var(--ink);opacity:.6;margin-top:4px}
.tpl-timeline .foot{display:flex;justify-content:space-between;align-items:baseline;padding-top:20px}
.tpl-timeline .handle{font-family:'MA';font-weight:700;font-size:24px}
.tpl-timeline .pg{font-family:'MA';font-weight:600;font-size:24px;opacity:.5}

/* =========================================================
   TEMPLATE: NEWSPAPER -- justified column, rules, byline
   ========================================================= */
.tpl-newspaper .ph .in{position:relative;z-index:1;height:100%;padding:90px 84px;display:flex;flex-direction:column;
  justify-content:center}
.tpl-newspaper .nprule{height:3px;background:var(--ink);opacity:.7}
.tpl-newspaper .npbyline{display:flex;justify-content:space-between;align-items:baseline;padding:14px 0;
  font-family:'MA';font-weight:700;font-size:19px;letter-spacing:.12em;text-transform:uppercase;opacity:.55}
.tpl-newspaper .en{font-family:'Disp';font-style:italic;font-size:calc(44px*var(--fs));line-height:1.35;color:var(--ink);
  text-align:center;margin:30px 0}
.tpl-newspaper .am{font-family:'MA';font-weight:500;font-size:calc(25px*var(--fs));line-height:1.5;color:var(--ink);
  opacity:.75;text-align:center}
.tpl-newspaper .foot{display:flex;justify-content:space-between;align-items:baseline;padding-top:24px;margin-top:auto}
.tpl-newspaper .handle{font-family:'MA';font-weight:700;font-size:24px}
.tpl-newspaper .pg{font-family:'MA';font-weight:600;font-size:24px;opacity:.5}

/* =========================================================
   TEMPLATE: BUBBLE -- speech-bubble shaped container
   ========================================================= */
.tpl-bubble .ph .in{position:relative;z-index:1;height:100%;padding:90px 76px;display:flex;flex-direction:column;
  align-items:center;justify-content:center}
.tpl-bubble .tag{font-family:'MA';font-weight:700;font-size:calc(22px*var(--fs));letter-spacing:.16em;text-transform:uppercase;opacity:.5}
.tpl-bubble .bwrap{position:relative;margin-top:34px;width:100%}
.tpl-bubble .bbox{background:var(--acc);border-radius:36px;padding:46px 42px;position:relative}
.tpl-bubble .bbox::after{content:'';position:absolute;left:64px;bottom:-28px;width:0;height:0;
  border-left:18px solid transparent;border-right:36px solid transparent;border-top:32px solid var(--acc)}
.tpl-bubble .en{font-family:'MA';font-weight:800;font-size:calc(34px*var(--fs));line-height:1.3;color:var(--bg)}
.tpl-bubble .am{font-family:'Disp';font-style:italic;font-size:calc(50px*var(--fs));margin-top:60px;color:var(--ink);text-align:center}
.tpl-bubble .foot{display:flex;justify-content:space-between;align-items:baseline;width:100%;margin-top:auto;padding-top:20px}
.tpl-bubble .handle{font-family:'MA';font-weight:700;font-size:24px}
.tpl-bubble .pg{font-family:'MA';font-weight:600;font-size:24px;opacity:.5}

/* =========================================================
   TEMPLATE: FRAME -- bordered frame with corner ticks
   ========================================================= */
.tpl-frame .ph .in{position:relative;z-index:1;height:100%;padding:70px;display:flex;flex-direction:column}
.tpl-frame .tag{font-family:'MA';font-weight:700;font-size:calc(22px*var(--fs));letter-spacing:.16em;text-transform:uppercase;opacity:.5}
.tpl-frame .fbox{flex:1;margin-top:20px;border:3px solid var(--acc);border-radius:8px;position:relative;
  display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:50px}
.tpl-frame .fbox::before,.tpl-frame .fbox::after{content:'';position:absolute;width:24px;height:24px;border:5px solid var(--acc)}
.tpl-frame .fbox::before{top:-8px;left:-8px;border-right:0;border-bottom:0}
.tpl-frame .fbox::after{bottom:-8px;right:-8px;border-left:0;border-top:0}
.tpl-frame .fnum{font-family:'Atyan';font-size:34px;color:var(--acc)}
.tpl-frame .en{font-family:'MA';font-weight:800;font-size:calc(36px*var(--fs));line-height:1.3;color:var(--ink);margin-top:18px}
.tpl-frame .am{font-family:'Disp';font-style:italic;font-size:calc(28px*var(--fs));margin-top:20px;color:var(--ink);opacity:.75}
.tpl-frame .foot{display:flex;justify-content:space-between;align-items:baseline;padding-top:20px}
.tpl-frame .handle{font-family:'MA';font-weight:700;font-size:24px}
.tpl-frame .pg{font-family:'MA';font-weight:600;font-size:24px;opacity:.5}

/* =========================================================
   TEMPLATE: DUOTONE -- split half/half background
   ========================================================= */
.tpl-duotone .ph{background:linear-gradient(180deg, var(--a2) 0%, var(--a2) 48%, var(--bg) 48%, var(--bg) 100%)}
.tpl-duotone .ph .in{position:relative;z-index:1;height:100%;padding:70px 74px;display:flex;flex-direction:column}
.tpl-duotone .tag{font-family:'MA';font-weight:700;font-size:calc(22px*var(--fs));letter-spacing:.16em;text-transform:uppercase;color:var(--ink);opacity:.55}
.tpl-duotone .dnum{font-family:'Atyan';font-size:56px;color:var(--acc);margin-top:auto}
.tpl-duotone .en{font-family:'MA';font-weight:900;font-size:calc(42px*var(--fs));line-height:1.28;color:var(--ink);margin-top:14px}
.tpl-duotone .am{font-family:'Disp';font-style:italic;font-size:calc(30px*var(--fs));margin-top:26px;color:var(--ink);opacity:.85}
.tpl-duotone .foot{display:flex;justify-content:space-between;align-items:baseline;padding-top:20px;margin-top:auto}
.tpl-duotone .handle{font-family:'MA';font-weight:700;font-size:24px;color:var(--ink)}
.tpl-duotone .pg{font-family:'MA';font-weight:600;font-size:24px;color:var(--ink);opacity:.5}

/* =========================================================
   TEMPLATE: BIGNUM -- huge faded number behind the phrase
   ========================================================= */
.tpl-bignum .ph .in{position:relative;z-index:1;height:100%;padding:80px;display:flex;flex-direction:column;
  align-items:center;justify-content:center;text-align:center;overflow:hidden}
.tpl-bignum .tag{position:relative;z-index:2;font-family:'MA';font-weight:700;font-size:calc(22px*var(--fs));letter-spacing:.16em;text-transform:uppercase;opacity:.5}
.tpl-bignum .bgnum{position:absolute;top:50%;left:50%;transform:translate(-50%,-58%);font-family:'Atyan';
  font-size:520px;color:var(--acc);opacity:.12;line-height:1;z-index:1;white-space:nowrap}
.tpl-bignum .en{position:relative;z-index:2;font-family:'MA';font-weight:900;font-size:calc(44px*var(--fs));line-height:1.25;color:var(--ink);margin-top:20px}
.tpl-bignum .am{position:relative;z-index:2;font-family:'Disp';font-style:italic;font-size:calc(29px*var(--fs));margin-top:26px;color:var(--ink);opacity:.8}
.tpl-bignum .foot{position:relative;z-index:2;position:absolute;left:80px;right:80px;bottom:60px;display:flex;justify-content:space-between;align-items:baseline}
.tpl-bignum .handle{font-family:'MA';font-weight:700;font-size:24px;color:var(--ink)}
.tpl-bignum .pg{font-family:'MA';font-weight:600;font-size:24px;color:var(--ink);opacity:.5}

/* =========================================================
   TEMPLATE: TAB -- bookmark tab at top of a card
   ========================================================= */
.tpl-tab .ph .in{position:relative;z-index:1;height:100%;padding:70px 74px;display:flex;flex-direction:column}
.tpl-tab .tag{font-family:'MA';font-weight:700;font-size:calc(22px*var(--fs));letter-spacing:.16em;text-transform:uppercase;opacity:.5}
.tpl-tab .tabwrap{flex:1;display:flex;align-items:center}
.tpl-tab .tabcard{width:100%;background:#FFFDF8;border-radius:0 24px 24px 24px;padding:52px 46px;
  box-shadow:0 20px 44px rgba(0,0,0,.10);position:relative}
.tpl-tab .tablabel{position:absolute;top:-46px;left:0;background:var(--acc);color:var(--bg);
  border-radius:14px 14px 0 0;padding:12px 28px;font-family:'MA';font-weight:800;font-size:22px}
.tpl-tab .en{font-family:'MA';font-weight:800;font-size:calc(36px*var(--fs));line-height:1.28;color:var(--ink)}
.tpl-tab .am{font-family:'Disp';font-style:italic;font-size:calc(28px*var(--fs));margin-top:18px;color:var(--ink);opacity:.75}
.tpl-tab .foot{display:flex;justify-content:space-between;align-items:baseline;padding-top:20px}
.tpl-tab .handle{font-family:'MA';font-weight:700;font-size:24px}
.tpl-tab .pg{font-family:'MA';font-weight:600;font-size:24px;opacity:.5}

/* =========================================================
   TEMPLATE: TICKET -- perforated ticket stub
   ========================================================= */
.tpl-ticket .ph .in{position:relative;z-index:1;height:100%;padding:70px;display:flex;flex-direction:column}
.tpl-ticket .tag{font-family:'MA';font-weight:700;font-size:calc(22px*var(--fs));letter-spacing:.16em;text-transform:uppercase;opacity:.5}
.tpl-ticket .tkwrap{flex:1;display:flex;align-items:center}
.tpl-ticket .tkcard{width:100%;background:#FFFDF8;border-radius:24px;padding:0;overflow:hidden;
  box-shadow:0 18px 40px rgba(0,0,0,.10);display:flex}
.tpl-ticket .tkstub{background:var(--acc);color:var(--bg);width:120px;display:flex;align-items:center;justify-content:center;
  font-family:'Atyan';font-size:44px;flex:0 0 auto}
.tpl-ticket .tkbody{flex:1;padding:44px 40px;border-left:4px dashed rgba(0,0,0,.18)}
.tpl-ticket .en{font-family:'MA';font-weight:800;font-size:calc(33px*var(--fs));line-height:1.28;color:var(--ink)}
.tpl-ticket .am{font-family:'MA';font-weight:500;font-size:calc(24px*var(--fs));margin-top:14px;color:var(--ink);opacity:.65}
.tpl-ticket .foot{display:flex;justify-content:space-between;align-items:baseline;padding-top:20px}
.tpl-ticket .handle{font-family:'MA';font-weight:700;font-size:24px}
.tpl-ticket .pg{font-family:'MA';font-weight:600;font-size:24px;opacity:.5}

/* =========================================================
   TEMPLATE: CHECKLIST -- checkmark bullets
   ========================================================= */
.tpl-checklist .ph .in{position:relative;z-index:1;height:100%;padding:80px 74px;display:flex;flex-direction:column}
.tpl-checklist .tag{font-family:'MA';font-weight:700;font-size:calc(22px*var(--fs));letter-spacing:.16em;text-transform:uppercase;opacity:.5}
.tpl-checklist .ckrows{flex:1;display:flex;flex-direction:column;justify-content:center;gap:26px;margin-top:24px}
.tpl-checklist .ckrow{display:flex;align-items:flex-start;gap:22px}
.tpl-checklist .ckbox{flex:0 0 auto;width:46px;height:46px;border-radius:12px;background:var(--a0);
  display:flex;align-items:center;justify-content:center}
.tpl-checklist .ckbox svg{width:26px;height:26px;fill:none;stroke:var(--bg);stroke-width:4;stroke-linecap:round;stroke-linejoin:round}
.tpl-checklist .cken{font-family:'MA';font-weight:800;font-size:calc(29px*var(--fs));color:var(--ink)}
.tpl-checklist .ckam{font-family:'MA';font-weight:500;font-size:calc(21px*var(--fs));color:var(--ink);opacity:.6;margin-top:4px}
.tpl-checklist .foot{display:flex;justify-content:space-between;align-items:baseline;padding-top:20px}
.tpl-checklist .handle{font-family:'MA';font-weight:700;font-size:24px}
.tpl-checklist .pg{font-family:'MA';font-weight:600;font-size:24px;opacity:.5}

/* =========================================================
   TEMPLATE: NUMBERED -- oversized left number column
   ========================================================= */
.tpl-numbered .ph .in{position:relative;z-index:1;height:100%;padding:80px 74px;display:flex;flex-direction:column}
.tpl-numbered .tag{font-family:'MA';font-weight:700;font-size:calc(22px*var(--fs));letter-spacing:.16em;text-transform:uppercase;opacity:.5}
.tpl-numbered .nrows{flex:1;display:flex;flex-direction:column;justify-content:center;gap:34px;margin-top:20px}
.tpl-numbered .nrow{display:flex;align-items:baseline;gap:26px}
.tpl-numbered .nbig{font-family:'Atyan';font-size:calc(72px*var(--fs));color:var(--a0);opacity:.5;line-height:1;flex:0 0 auto;min-width:100px}
.tpl-numbered .nen{font-family:'MA';font-weight:800;font-size:calc(30px*var(--fs));color:var(--ink)}
.tpl-numbered .nam{font-family:'Disp';font-style:italic;font-size:calc(24px*var(--fs));color:var(--ink);opacity:.7;margin-top:6px}
.tpl-numbered .foot{display:flex;justify-content:space-between;align-items:baseline;padding-top:20px}
.tpl-numbered .handle{font-family:'MA';font-weight:700;font-size:24px}
.tpl-numbered .pg{font-family:'MA';font-weight:600;font-size:24px;opacity:.5}

/* =========================================================
   TEMPLATE: HERO -- full-bleed accent background
   ========================================================= */
.tpl-hero .ph{background:var(--acc)}
.tpl-hero .ph .in{position:relative;z-index:1;height:100%;padding:90px;display:flex;flex-direction:column;
  align-items:center;justify-content:center;text-align:center}
.tpl-hero .tag{font-family:'MA';font-weight:700;font-size:calc(22px*var(--fs));letter-spacing:.16em;text-transform:uppercase;color:var(--bg);opacity:.8}
.tpl-hero .hnum{font-family:'Atyan';font-size:44px;color:var(--bg);opacity:.7;margin-top:20px}
.tpl-hero .en{font-family:'MA';font-weight:900;font-size:calc(54px*var(--fs));line-height:1.22;color:var(--bg);margin-top:16px}
.tpl-hero .am{font-family:'Disp';font-style:italic;font-size:calc(32px*var(--fs));margin-top:32px;color:var(--bg);opacity:.9}
.tpl-hero .foot{position:absolute;left:90px;right:90px;bottom:70px;display:flex;justify-content:space-between;align-items:baseline}
.tpl-hero .handle{font-family:'MA';font-weight:700;font-size:24px;color:var(--bg)}
.tpl-hero .pg{font-family:'MA';font-weight:600;font-size:24px;color:var(--bg);opacity:.7}

/* =========================================================
   TEMPLATE: MARKER -- highlighter swipe behind text
   ========================================================= */
.tpl-marker .ph .in{position:relative;z-index:1;height:100%;padding:90px;display:flex;flex-direction:column;
  align-items:center;justify-content:center;text-align:center}
.tpl-marker .tag{font-family:'MA';font-weight:700;font-size:calc(22px*var(--fs));letter-spacing:.16em;text-transform:uppercase;opacity:.5}
.tpl-marker .mnum{font-family:'Atyan';font-size:36px;color:var(--acc);margin-top:22px}
.tpl-marker .mline{display:inline;background:var(--acc);opacity:.9;color:var(--bg);
  font-family:'MA';font-weight:900;font-size:calc(46px*var(--fs));line-height:1.55;
  padding:6px 16px;box-decoration-break:clone;-webkit-box-decoration-break:clone;border-radius:6px}
.tpl-marker .mwrap{margin-top:26px}
.tpl-marker .am{font-family:'Disp';font-style:italic;font-size:calc(30px*var(--fs));margin-top:36px;color:var(--ink);opacity:.8}
.tpl-marker .foot{position:absolute;left:90px;right:90px;bottom:70px;display:flex;justify-content:space-between;align-items:baseline}
.tpl-marker .handle{font-family:'MA';font-weight:700;font-size:24px;color:var(--ink)}
.tpl-marker .pg{font-family:'MA';font-weight:600;font-size:24px;color:var(--ink);opacity:.5}

/* =========================================================
   TEMPLATE: CORNER -- large corner colour block
   ========================================================= */
.tpl-corner .ph .in{position:relative;z-index:1;height:100%;padding:80px 74px;display:flex;flex-direction:column;overflow:hidden}
.tpl-corner .cnrblock{position:absolute;top:0;right:0;width:420px;height:420px;background:var(--acc);
  border-bottom-left-radius:100%;opacity:.9}
.tpl-corner .tag{position:relative;z-index:2;font-family:'MA';font-weight:700;font-size:calc(22px*var(--fs));letter-spacing:.16em;text-transform:uppercase;opacity:.55}
.tpl-corner .cbody{position:relative;z-index:2;flex:1;display:flex;flex-direction:column;justify-content:center}
.tpl-corner .cnum{font-family:'Atyan';font-size:46px;color:var(--acc)}
.tpl-corner .en{font-family:'MA';font-weight:900;font-size:calc(42px*var(--fs));line-height:1.26;color:var(--ink);margin-top:14px;max-width:80%}
.tpl-corner .am{font-family:'Disp';font-style:italic;font-size:calc(29px*var(--fs));margin-top:24px;color:var(--ink);opacity:.8;max-width:80%}
.tpl-corner .foot{position:relative;z-index:2;display:flex;justify-content:space-between;align-items:baseline;padding-top:20px}
.tpl-corner .handle{font-family:'MA';font-weight:700;font-size:24px}
.tpl-corner .pg{font-family:'MA';font-weight:600;font-size:24px;opacity:.5}

/* =========================================================
   TEMPLATE: DIAGONAL -- angled ribbon band
   ========================================================= */
.tpl-diagonal .ph .in{position:relative;z-index:1;height:100%;padding:80px 74px;display:flex;flex-direction:column;overflow:hidden}
.tpl-diagonal .ribbon{position:absolute;left:-10%;right:-10%;top:36%;height:250px;background:var(--acc);
  transform:rotate(-7deg);opacity:.95;display:flex;align-items:center;justify-content:center;z-index:2}
.tpl-diagonal .tag{position:relative;z-index:3;font-family:'MA';font-weight:700;font-size:calc(22px*var(--fs));letter-spacing:.16em;text-transform:uppercase;opacity:.55}
.tpl-diagonal .dbody{position:relative;z-index:3;flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;text-align:center;padding-bottom:60px}
.tpl-diagonal .ribbon .en{font-family:'MA';font-weight:900;font-size:calc(38px*var(--fs));line-height:1.3;color:var(--bg);max-width:74%;text-align:center}
.tpl-diagonal .am{font-family:'Disp';font-style:italic;font-size:calc(29px*var(--fs));color:var(--ink);opacity:.85}
.tpl-diagonal .foot{position:relative;z-index:2;display:flex;justify-content:space-between;align-items:baseline;padding-top:20px}
.tpl-diagonal .handle{font-family:'MA';font-weight:700;font-size:24px}
.tpl-diagonal .pg{font-family:'MA';font-weight:600;font-size:24px;opacity:.5}

/* =========================================================
   TEMPLATE: SIDEBAR -- vertical colour strip on the left
   ========================================================= */
.tpl-sidebar .ph{position:relative}
.tpl-sidebar .ph::before{content:'';position:absolute;left:0;top:0;bottom:0;width:120px;background:var(--acc)}
.tpl-sidebar .ph .in{position:relative;z-index:1;height:100%;padding:80px 74px 80px 190px;display:flex;flex-direction:column}
.tpl-sidebar .tag{font-family:'MA';font-weight:700;font-size:calc(22px*var(--fs));letter-spacing:.16em;text-transform:uppercase;opacity:.5}
.tpl-sidebar .sbnum{position:absolute;left:-150px;top:50%;transform:translateY(-50%) rotate(-90deg);
  font-family:'Atyan';font-size:52px;color:var(--bg);white-space:nowrap}
.tpl-sidebar .sbody{flex:1;display:flex;flex-direction:column;justify-content:center;position:relative}
.tpl-sidebar .en{font-family:'MA';font-weight:900;font-size:calc(40px*var(--fs));line-height:1.26;color:var(--ink)}
.tpl-sidebar .am{font-family:'Disp';font-style:italic;font-size:calc(29px*var(--fs));margin-top:24px;color:var(--ink);opacity:.8}
.tpl-sidebar .foot{display:flex;justify-content:space-between;align-items:baseline;padding-top:20px}
.tpl-sidebar .handle{font-family:'MA';font-weight:700;font-size:24px}
.tpl-sidebar .pg{font-family:'MA';font-weight:600;font-size:24px;opacity:.5}

/* =========================================================
   TEMPLATE: STAMP -- circular stamp/seal motif
   ========================================================= */
.tpl-stamp .ph .in{position:relative;z-index:1;height:100%;padding:80px;display:flex;flex-direction:column;
  align-items:center;justify-content:center;text-align:center}
.tpl-stamp .tag{font-family:'MA';font-weight:700;font-size:calc(22px*var(--fs));letter-spacing:.16em;text-transform:uppercase;opacity:.5}
.tpl-stamp .seal{width:150px;height:150px;border-radius:50%;border:6px double var(--acc);color:var(--acc);
  display:flex;align-items:center;justify-content:center;font-family:'Atyan';font-size:52px;margin-top:30px;
  transform:rotate(-8deg)}
.tpl-stamp .en{font-family:'MA';font-weight:800;font-size:calc(40px*var(--fs));line-height:1.26;color:var(--ink);margin-top:40px}
.tpl-stamp .stamprule{width:120px;height:3px;background:var(--acc);opacity:.5;margin:28px auto}
.tpl-stamp .am{font-family:'Disp';font-style:italic;font-size:calc(29px*var(--fs));color:var(--ink);opacity:.8}
.tpl-stamp .foot{position:absolute;left:80px;right:80px;bottom:60px;display:flex;justify-content:space-between;align-items:baseline}
.tpl-stamp .handle{font-family:'MA';font-weight:700;font-size:24px;color:var(--ink)}
.tpl-stamp .pg{font-family:'MA';font-weight:600;font-size:24px;color:var(--ink);opacity:.5}
"""


def make_html():
    template = """<!DOCTYPE html><html lang="hy"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<title>Конструктор постов</title>
<script>__JSZIP__</script>
<script>__QRLIB__</script>
<style id="fontfaces">__FONTFACES__</style>
<style id="tplcss">__TPLCSS__</style>
<style>__UICSS__</style>
</head>
<body>
<div id="appShell">
<div id="toolCol">
<div id="draftBanner" class="panel" style="display:none;background:#3A2F1A;border:1px solid #E0A857">
  <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
    <span>Нашла несохранённый черновик — восстановить?</span>
    <div class="btns">
      <button class="btn" id="restoreDraftBtn">Восстановить</button>
      <button class="btn ghost" id="dismissDraftBtn">Не надо</button>
    </div>
  </div>
</div>

<div class="panel">
  <h2>1. Контент</h2>
  <div class="row"><label>Название</label><input type="text" id="inTitle" value="ԱՆԳԼԵՐԵՆ **ԱՐՏԱՀԱՅՏՈՒԹՅՈՒՆՆԵՐ**"></div>
  <div class="hint" style="text-align:left;margin:-4px 0 6px 132px">Обозначь слово для подсветки звёздочками: **слово**</div>
  <div class="row"><label>Цвет подсветки</label><input type="color" id="inHighlightColor" value="#2E2A20"></div>
  <div class="row"><label>Размер на обложке</label><input type="range" id="covTextSize" min="60" max="150" value="100"></div>
  <div class="row"><label>Метка сверху</label><input type="text" id="inEyebrow" value="10 արտահայտություն"></div>
  <div class="row"><label>Подпись</label><input type="text" id="inSub" value="Օգտակար ու կենդանի արտահայտություններ"></div>
  <div class="section"></div>
  <div style="font-size:13px;color:#B9AF9C;margin-bottom:6px">Фразы — по одной в строке, английский և հայերեն թարգմանությունը՝ բաժանված <b>|</b> նշանով</div>
  <textarea id="inPhrases">It's driving me up the wall. | Ուղղակի հունից հանում է ինձ։
That's such a pet peeve of mine. | Դրանից ալերգիա ունեմ։
It gets under my skin. | Աչքիս փուշն է։
That's the last straw. | Սա արդեն վերջին կաթիլն է։
I'm at my wit's end with this. | Համբերությանս բաժակը լցվել է։
It rubs me the wrong way. | Սրտովս չի։
I bit my tongue and let it go. | Լեզուս կծեցի ու ձայն չհանեցի։
I'm not gonna lie, that bugs me. | Անկեղծ ասած՝ դա ինձ նյարդայնացնում է։</textarea>
  <div class="row"><label>Хендл</label><input type="text" id="inHandle" value="@tadhayrapetian"></div>
</div>

<div class="panel">
  <h2>2. Макет</h2>
  <select id="tplSelect">
    <optgroup label="Карточки и блоки">
      <option value="card">Карточка с тенью</option>
      <option value="badge">Стикер (наклонённый)</option>
      <option value="frame">Рамка с уголками</option>
      <option value="bubble">Облачко реплики</option>
      <option value="tab">Вкладка-закладка</option>
      <option value="ticket">Билет с перфорацией</option>
    </optgroup>
    <optgroup label="Списки и сетки">
      <option value="grid">Сетка плиток</option>
      <option value="ledger">Гроссбух (полосы)</option>
      <option value="list">Минимальный список</option>
      <option value="timeline">Хронология</option>
      <option value="ladder">Лестница</option>
      <option value="checklist">Чеклист с галочками</option>
      <option value="numbered">Крупная нумерация</option>
    </optgroup>
    <optgroup label="Крупная типографика">
      <option value="editorial">Плакат</option>
      <option value="stack">Цитата</option>
      <option value="underline">Подчёркивание</option>
      <option value="bignum">Большая цифра фоном</option>
      <option value="hero">Герой во весь экран</option>
      <option value="marker">Маркерная заливка</option>
    </optgroup>
    <optgroup label="Композиции">
      <option value="split">Две колонки</option>
      <option value="duotone">Дуотон (половины)</option>
      <option value="pills">Пилюли</option>
      <option value="newspaper">Газета</option>
      <option value="corner">Угловой акцент</option>
      <option value="diagonal">Диагональная лента</option>
      <option value="sidebar">Боковая полоса</option>
      <option value="stamp">Печать / штамп</option>
    </optgroup>
  </select>
  <div class="hint" style="margin-top:8px;text-align:left">27 макетов. Выбери — превью обновится сразу.</div>
</div>

<div class="panel">
  <h2>3. Оформление</h2>
  <div class="row"><label>Шрифт заголовка</label><select id="fontHead">
    <option value="Atyan">Atyan (декоративный)</option>
    <option value="MA900">Montserrat Black</option>
    <option value="MA700">Montserrat Bold</option>
    <option value="Disp">DM Serif (курсив)</option>
  </select></div>
  <div class="row"><label>Шрифт перевода</label><select id="fontTrans">
    <option value="Disp">DM Serif (курсив)</option>
    <option value="MA400">Montserrat Regular</option>
    <option value="MA500">Montserrat Medium</option>
    <option value="MA700">Montserrat Bold</option>
  </select></div>
  <div class="row"><label>Свой шрифт</label>
    <button class="btn ghost" id="uploadFontBtn" style="flex:1">📁 Загрузить .ttf / .otf / .woff</button>
  </div>
  <div class="hint" id="customFontHint" style="text-align:left;margin:-2px 0 0 132px">Появится в списках выше как «Свой шрифт»</div>
  <input type="file" id="fontFileInput" accept=".ttf,.otf,.woff,.woff2" style="display:none">
  <div class="row"><label>Скругление углов</label><input type="range" id="radiusCtl" min="0" max="60" value="24"></div>
  <div class="row"><label>Обводка текста</label><input type="range" id="strokeCtl" min="0" max="6" value="0"></div>
  <div class="row"><label>Тень текста</label><input type="range" id="textShadowCtl" min="0" max="100" value="0"></div>
  <div class="row"><label>Градиент на тексте</label><input type="checkbox" id="textGradientOn" style="width:auto;flex:0"></div>
  <div class="row"><label>Неоновое свечение</label><input type="checkbox" id="neonOn" style="width:auto;flex:0"></div>
  <div class="row"><label>Тень блоков</label><input type="range" id="shadowCtl" min="0" max="100" value="100"></div>
  <div class="row"><label>Межстрочный</label><input type="range" id="lineHeightCtl" min="90" max="180" value="100"></div>
  <div class="row"><label>Отступы полей</label><input type="range" id="paddingCtl" min="60" max="160" value="100"></div>
  <div class="row"><label>Зернистость</label><input type="range" id="grainCtl" min="0" max="100" value="0"></div>
  <div class="row"><label>Формат</label><select id="ratioSel">
    <option value="1080x1350">4:5 вертикальный (1080×1350)</option>
    <option value="1080x1080">1:1 квадрат (1080×1080)</option>
    <option value="1080x1920">9:16 сторис (1080×1920)</option>
  </select></div>
  <div class="row"><label>Показывать № слайда</label><input type="checkbox" id="showPg" checked style="width:auto;flex:0"></div>
  <div class="row"><label>Показывать хендл</label><input type="checkbox" id="showHandle" checked style="width:auto;flex:0"></div>
  <div class="row"><label>Показывать метку</label><input type="checkbox" id="showTag" checked style="width:auto;flex:0"></div>
  <div class="row"><label>Обложка</label><input type="checkbox" id="showCover" checked style="width:auto;flex:0"></div>
  <div class="row"><label>Слайд подписки</label><input type="checkbox" id="showFollow" checked style="width:auto;flex:0"></div>
  <div class="row"><label>Слайд-призыв (CTA)</label><input type="checkbox" id="showCta" style="width:auto;flex:0"></div>
  <div class="row"><label>Нумерация</label><select id="numStyle">
    <option value="pad">01, 02, 03</option>
    <option value="plain">1, 2, 3</option>
    <option value="slash">1/10</option>
    <option value="none">Без номеров</option>
  </select></div>
  <div class="row"><label>Порядок фраз</label><select id="orderSel">
    <option value="asis">Как введено</option>
    <option value="shuffle">Перемешать</option>
    <option value="reverse">Обратный</option>
  </select></div>
</div>

<div class="panel">
  <h2>4. Цвета</h2>
  <div class="swatches" id="swatches"></div>
  <div class="btns" style="margin-top:14px">
    <button class="btn wide" id="shufflePalette">🎲 Сгенерировать новую палитру</button>
  </div>
  <div class="hint" style="margin-top:6px">Цвета подбираются автоматически по цветовому кругу — гарантированно гармоничные, каждый раз новые.</div>
  <div class="section"></div>
  <div class="btns">
    <button class="btn ghost wide" id="uploadPaletteBtn">🖼️ Загрузить свою палитру (фото)</button>
  </div>
  <div class="hint" id="paletteUploadHint" style="margin-top:6px">Пришли скриншот с цветовыми плашками — я сама распознаю основные цвета с картинки.</div>
  <input type="file" id="paletteFileInput" accept="image/*" style="display:none">
  <div class="section"></div>
  <div class="row"><label>Настроение</label><select id="moodSel">
    <option value="any">Любое (случайно)</option>
    <option value="warm">Тёплое (земля, охра)</option>
    <option value="cool">Холодное (море, лёд)</option>
    <option value="pastel">Пастель (нежное)</option>
    <option value="vivid">Яркое (сочное)</option>
    <option value="mono">Монохром (один тон)</option>
    <option value="dark">Тёмная тема</option>
    <option value="earthy">Природа (мох, глина)</option>
  </select></div>
  <div class="row"><label>Фон</label><select id="bgStyle">
    <option value="flat">Сплошной</option>
    <option value="gradient">Мягкий градиент</option>
    <option value="radial">Радиальное свечение</option>
    <option value="dots">Точки</option>
    <option value="lines">Тонкие линии</option>
    <option value="grid">Клетка</option>
    <option value="multigrad">Мультиградиент (4 цвета)</option>
    <option value="sunset">Закат (3 цвета вертикально)</option>
    <option value="paper">Бумажная текстура</option>
    <option value="noise">Шум/зерно</option>
  </select></div>
  <div class="row"><label>Ручная правка</label><div class="swatches" id="manualSwatches" style="flex:1"></div></div>
  <div class="row"><label>Прозрачность блоков</label><input type="range" id="opacityCtl" min="40" max="100" value="100"></div>
  <div class="row"><label>Размытие фона</label><input type="range" id="blurCtl" min="0" max="20" value="0"></div>
  <div class="btns">
    <button class="btn ghost" id="lockPalette">🔒 Закрепить палитру</button>
    <button class="btn ghost" id="invertPalette">🌗 Инвертировать</button>
  </div>
</div>

<div class="panel">
  <h2>5. Брендинг</h2>
  <div class="row"><label>QR-код</label><input type="text" id="qrText" placeholder="ссылка или текст"></div>
  <div class="row"><label></label><button class="btn ghost" id="addQrBtn" style="flex:1">➕ Добавить QR на текущий слайд</button></div>
  <div class="hint" id="qrHint" style="text-align:left;margin:-2px 0 6px 132px"></div>
  <div class="row"><label>Фото слайда</label><button class="btn ghost" id="slidePhotoBtn" style="flex:1">🖼️ Добавить фото на текущий слайд</button></div>
  <div class="hint" id="slidePhotoHint" style="text-align:left;margin:-2px 0 6px 132px">Ставится полупрозрачным фоном именно этого слайда</div>
  <input type="file" id="slidePhotoInput" accept="image/*" style="display:none">
  <div class="row"><label>Рамка слайда</label><select id="borderSel">
    <option value="none">Без рамки</option>
    <option value="thin">Тонкая</option>
    <option value="thick">Толстая</option>
    <option value="inset">Внутренняя (отступ)</option>
  </select></div>
  <div class="row"><label>Прогресс-полоса</label><select id="progressSel">
    <option value="none">Нет</option>
    <option value="bar">Полоса сверху</option>
    <option value="dots">Точки снизу</option>
  </select></div>
  <div class="row"><label>Водяной знак</label><input type="text" id="watermark" placeholder="напр. учись со мной"></div>
  <div class="row"><label>Стрелка «листай»</label><input type="checkbox" id="swipeHint" style="width:auto;flex:0"></div>
  <div class="row"><label>Эмодзи на обложке</label><input type="text" id="coverEmoji" placeholder="напр. 🔥" maxlength="4"></div>
  <div class="row"><label>Выравнивание</label><select id="alignSel">
    <option value="default">По макету</option>
    <option value="left">Влево</option>
    <option value="center">По центру</option>
  </select></div>
  <div class="row"><label>РЕГИСТР фраз</label><select id="caseSel">
    <option value="none">Как есть</option>
    <option value="upper">ВЕРХНИЙ</option>
    <option value="lower">нижний</option>
  </select></div>
  <div class="row"><label>Фраз на слайд</label><select id="perSlideSel">
    <option value="auto">По макету</option>
    <option value="1">1</option>
    <option value="2">2</option>
    <option value="3">3</option>
    <option value="4">4</option>
    <option value="6">6</option>
  </select></div>
</div>

<div class="panel">
  <h2>6. Готово</h2>
  <div class="btns"><button class="btn wide" id="buildBtn">Собрать пост</button></div>
</div>

</div>
<div id="previewCol">
<div id="previewPlaceholder" class="panel" style="text-align:center;color:#B9AF9C">
  Нажми «Собрать пост» — превью появится здесь и останется на виду, пока ты крутишь настройки слева.
</div>
<div id="previewArea" style="display:none;width:100%;max-width:560px;flex-direction:column;align-items:center;gap:18px">
  <div class="nav">
    <button id="prev">←</button>
    <span class="count" id="count"></span>
    <button id="next">→</button>
  </div>
  <div class="btns" style="justify-content:center">
    <button class="btn ghost" id="undoBtn" title="Отменить (Ctrl+Z)">↩ Отменить</button>
    <button class="btn ghost" id="redoBtn" title="Повторить (Ctrl+Y)">↪ Повторить</button>
    <button class="btn ghost" id="dupSlide" title="Дублировать текущий слайд">⧉ Дублировать</button>
    <button class="btn ghost" id="delSlide" title="Удалить текущий слайд">🗑 Удалить</button>
    <button class="btn ghost" id="moveSlideLeft" title="Передвинуть влево">⇤</button>
    <button class="btn ghost" id="moveSlideRight" title="Передвинуть вправо">⇥</button>
  </div>
  <div class="stage" id="stage"><div class="wrap" id="wrap"></div></div>
  <div class="panel">
    <div class="row"><label>Размер текста</label><input type="range" id="tsize" min="70" max="140" value="100"></div>
    <div class="btns">
      <button class="btn ghost" id="moveMode">Двигать блоки</button>
      <button class="btn ghost" id="shuffleAccents">Поменять акценты местами</button>
      <button class="btn ghost" id="copyStyleToAll">Копировать позиции блоков на все слайды</button>
    </div>
    <div class="section"></div>
    <div class="btns">
      <button class="btn" id="png">PNG этого слайда</button>
      <a id="dl" style="display:none"><button class="btn ghost">Скачать</button></a>
      <button class="btn" id="zipAll">Скачать всё (zip)</button>
    </div>
    <div class="btns">
      <button class="btn ghost" id="saveProject">💾 Сохранить проект</button>
      <button class="btn ghost" id="loadProject">📂 Загрузить проект</button>
      <button class="btn ghost" id="copyCaption">📋 Скопировать подпись</button>
    </div>
    <div class="hint" id="autosaveHint" style="opacity:.7"></div>
    <div id="status" class="hint"></div>
  </div>
</div>


<input type="file" id="projectFileInput" accept=".json" style="display:none">

<input type="file" id="fileInput" accept="image/*" style="display:none">
<img id="outimg" alt="">
</div>
</div>

<script>
const AVA_B64 = "__AVA__";

/* ---------------- color generation ---------------- */
function hslToHex(h,s,l){
  h=((h%360)+360)%360;
  s/=100; l/=100;
  const k = n => (n + h/30) % 12;
  const a = s * Math.min(l, 1-l);
  const f = n => l - a*Math.max(-1, Math.min(k(n)-3, Math.min(9-k(n), 1)));
  const toHex = x => Math.round(255*x).toString(16).padStart(2,'0');
  return '#'+toHex(f(0))+toHex(f(8))+toHex(f(4));
}
function generatePalette(){
  if(paletteLocked) return palette;
  const mood = document.getElementById('moodSel') ? document.getElementById('moodSel').value : 'any';
  let baseHue = Math.floor(Math.random()*360);
  if(mood==='warm')  baseHue = 15 + Math.random()*55;
  if(mood==='cool')  baseHue = 175 + Math.random()*85;
  if(mood==='earthy')baseHue = 60 + Math.random()*60;
  const scheme = Math.random();
  let hues;
  if(mood==='mono') hues=[baseHue,baseHue+8,baseHue-8,baseHue+14];
  else if (scheme < 0.34) { hues = [baseHue, baseHue+35, baseHue-35, baseHue+180]; }
  else if (scheme < 0.67) { hues = [baseHue, baseHue+120, baseHue-120, baseHue+60]; }
  else { hues = [baseHue, baseHue+30, baseHue+180, baseHue+210]; }

  let bgSat=22+Math.random()*14, bgLight=93+Math.random()*4;
  let inkSat=28+Math.random()*14, inkLight=14+Math.random()*8;
  let accSat=55+Math.random()*15, accLight=42+Math.random()*10;
  if(mood==='pastel'){ bgSat=30; bgLight=96; accSat=38; accLight=68; inkLight=28; }
  if(mood==='vivid'){ accSat=88; accLight=48; bgSat=18; bgLight=95; }
  if(mood==='earthy'){ accSat=34; accLight=40; bgSat=24; bgLight=93; }
  if(mood==='dark'){ bgSat=18; bgLight=12; inkSat=12; inkLight=94; accSat=62; accLight=58; }

  const p = {
    bg: hslToHex(hues[0], bgSat, bgLight),
    ink: hslToHex(hues[0], inkSat, inkLight),
    a0: hslToHex(hues[0], accSat, accLight),
    a1: hslToHex(hues[1], accSat, accLight+3),
    a2: hslToHex(hues[2], mood==='dark'?26:30, mood==='dark'?24:88),
    a3: hslToHex(hues[3], mood==='dark'?24:30, mood==='dark'?20:82),
  };
  return p;
}
let paletteLocked = false;
let palette = generatePalette();

function renderSwatches(){
  const el = document.getElementById('swatches');
  el.innerHTML = '';
  [['bg','Фон'],['ink','Текст'],['a0','Акцент 1'],['a1','Акцент 2'],['a2','Акцент 3'],['a3','Акцент 4']].forEach(([k,label])=>{
    const sw = document.createElement('div');
    sw.className='swatch'; sw.style.background=palette[k]; sw.title=label+' '+palette[k];
    el.appendChild(sw);
  });
}
renderSwatches();
function renderManualSwatches(){
  const el=document.getElementById('manualSwatches');
  if(!el) return;
  el.innerHTML='';
  ['bg','ink','a0','a1','a2','a3'].forEach(k=>{
    const inp=document.createElement('input');
    inp.type='color'; inp.value=palette[k]; inp.title=k;
    inp.style.cssText='width:44px;height:44px;border:0;border-radius:10px;background:none;padding:0';
    inp.oninput=e=>{ palette[k]=e.target.value; _origRenderSwatches(); if(built) applyPalette(); };
    el.appendChild(inp);
  });
}
const _origRenderSwatches = renderSwatches;
renderSwatches = function(){ _origRenderSwatches(); renderManualSwatches(); };
renderManualSwatches();

document.getElementById('moodSel').onchange=()=>{
  paletteLocked=false;
  const lb=document.getElementById('lockPalette');
  lb.classList.remove('active'); lb.textContent='🔒 Закрепить палитру';
  palette=generatePalette(); renderSwatches(); if(built) applyPalette();
};
document.getElementById('lockPalette').onclick=function(){
  paletteLocked=!paletteLocked;
  this.classList.toggle('active',paletteLocked);
  this.textContent = paletteLocked ? '🔓 Открепить палитру' : '🔒 Закрепить палитру';
};
document.getElementById('invertPalette').onclick=()=>{
  const t=palette.bg; palette.bg=palette.ink; palette.ink=t;
  const t2=palette.a2; palette.a2=palette.a0; palette.a0=t2;
  renderSwatches(); if(built) applyPalette();
};
['bgStyle','borderSel','progressSel','watermark','swipeHint','coverEmoji','alignSel','caseSel','perSlideSel'].forEach(id=>{
  const el=document.getElementById(id);
  const ev=(el.type==='text')?'input':'change';
  el.addEventListener(ev, ()=>{ if(built) rebuildPreview(); });
});
document.getElementById('shufflePalette').onclick=()=>{ palette=generatePalette(); renderSwatches(); if(built) applyPalette(); };

/* ---------------- palette extraction from uploaded image ---------------- */
function rgbToHex(r,g,b){ return '#'+[r,g,b].map(x=>Math.round(x).toString(16).padStart(2,'0')).join(''); }
function relLuma(c){ return 0.299*c.r + 0.587*c.g + 0.114*c.b; }

function extractColorsFromImage(img){
  const maxDim = 220;
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

  const buckets = {};
  const step = 20;
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i+3];
    if (a < 200) continue;
    const r = data[i], g = data[i+1], b = data[i+2];
    const qr = Math.round(r/step)*step, qg = Math.round(g/step)*step, qb = Math.round(b/step)*step;
    const key = qr+','+qg+','+qb;
    if (!buckets[key]) buckets[key] = {count:0, r:0, g:0, b:0};
    buckets[key].count++; buckets[key].r+=r; buckets[key].g+=g; buckets[key].b+=b;
  }
  let clusters = Object.values(buckets).map(c=>({count:c.count, r:c.r/c.count, g:c.g/c.count, b:c.b/c.count}));
  clusters.sort((a,b)=>b.count-a.count);

  const picked = [];
  const minDist = 38;
  for (const c of clusters){
    if (picked.length >= 6) break;
    const tooClose = picked.some(p=>{
      const dr=p.r-c.r, dg=p.g-c.g, db=p.b-c.b;
      return Math.sqrt(dr*dr+dg*dg+db*db) < minDist;
    });
    if (!tooClose) picked.push(c);
  }
  picked.sort((a,b)=>relLuma(b)-relLuma(a));
  return picked.map(c=>rgbToHex(c.r,c.g,c.b));
}

function paletteFromHexList(hexList){
  if (hexList.length < 2) return generatePalette();
  function luma(hex){
    const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
    return 0.299*r+0.587*g+0.114*b;
  }
  const sorted = [...hexList].sort((a,b)=>luma(b)-luma(a));
  const bg = sorted[0];
  const ink = sorted[sorted.length-1];
  let mids = sorted.slice(1, sorted.length-1);
  if (mids.length === 0) mids = [ink];
  mids.sort((a,b)=>luma(a)-luma(b)); // darkest first, for contrast when used as text
  const pick = (i) => mids[i % mids.length];
  // a0/a1 need contrast against a light bg (used for text/accents) -> darker mids first
  // a2/a3 are used as decorative fills (dots, stripe backgrounds) -> lighter mids ok
  return { bg, ink, a0: pick(0), a1: pick(1), a2: mids[mids.length-1], a3: pick(mids.length>=2?mids.length-2:0) };
}

document.getElementById('uploadPaletteBtn').onclick=()=>document.getElementById('paletteFileInput').click();
document.getElementById('paletteFileInput').onchange=(e)=>{
  const f=e.target.files[0]; if(!f) return;
  const hint=document.getElementById('paletteUploadHint');
  hint.textContent='Распознаю цвета…';
  const reader=new FileReader();
  reader.onload=()=>{
    const img=new Image();
    img.onload=()=>{
      const hexList = extractColorsFromImage(img);
      if (hexList.length < 2){
        hint.textContent='Не смогла найти достаточно цветов — попробуй другое фото.';
        return;
      }
      palette = paletteFromHexList(hexList);
      renderSwatches();
      if(built) applyPalette();
      hint.textContent='Готово! Распознано цветов: '+hexList.length+'. Можешь собрать пост или сгенерировать заново.';
    };
    img.src=reader.result;
  };
  reader.readAsDataURL(f);
};

/* ---------------- appearance settings ---------------- */
const FONTMAP = {
  'Atyan': "font-family:'Atyan';text-transform:uppercase",
  'MA900': "font-family:'MA';font-weight:900",
  'MA700': "font-family:'MA';font-weight:700",
  'MA500': "font-family:'MA';font-weight:500",
  'MA400': "font-family:'MA';font-weight:400",
  'Disp':  "font-family:'Disp';font-style:italic"
};

/* ---- feature 1/23: custom font upload ---- */
let customFontDataURL = null;
let customFontFormat = 'woff2';
document.getElementById('uploadFontBtn').onclick=()=>document.getElementById('fontFileInput').click();
document.getElementById('fontFileInput').onchange=async (e)=>{
  const f=e.target.files[0]; if(!f) return;
  const hint=document.getElementById('customFontHint');
  hint.textContent='Загружаю...';
  try{
    const buf=await f.arrayBuffer();
    const face=new FontFace('CustomUserFont', buf);
    await face.load();
    document.fonts.add(face);
    const b64=btoa(new Uint8Array(buf).reduce((s,b)=>s+String.fromCharCode(b),''));
    const ext=(f.name.split('.').pop()||'woff2').toLowerCase();
    const fmt=ext==='ttf'?'truetype':ext==='otf'?'opentype':ext;
    customFontDataURL='data:font/'+ext+';base64,'+b64;
    customFontFormat=fmt;
    FONTMAP['Custom']="font-family:'CustomUserFont'";
    ['fontHead','fontTrans'].forEach(id=>{
      const sel=document.getElementById(id);
      if(![...sel.options].some(o=>o.value==='Custom')){
        const opt=document.createElement('option'); opt.value='Custom'; opt.textContent='Свой шрифт ('+f.name+')';
        sel.appendChild(opt);
      }
    });
    hint.textContent='Готово: "'+f.name+'" добавлен в списки шрифтов выше.';
    if(built) applyAppearance();
  }catch(err){ hint.textContent='Не смогла прочитать файл шрифта.'; }
};

function applyAppearance(){
  let st = document.getElementById('appearanceVars');
  if(!st){ st=document.createElement('style'); st.id='appearanceVars'; document.head.appendChild(st); }
  const radius = document.getElementById('radiusCtl').value;
  const shadow = document.getElementById('shadowCtl').value/100;
  const lh = document.getElementById('lineHeightCtl').value/100;
  const pad = document.getElementById('paddingCtl').value/100;
  const grain = document.getElementById('grainCtl').value/100;
  const headFont = FONTMAP[document.getElementById('fontHead').value];
  const transFont = FONTMAP[document.getElementById('fontTrans').value];
  const [w,h] = document.getElementById('ratioSel').value.split('x').map(Number);
  SLIDE_W = w; SLIDE_H = h;

  let css = '.sl{width:'+w+'px;height:'+h+'px}';
  css += '.card,.tile,.ldbody,.tabcard,.tkcard,.sticker,.bbox{border-radius:'+radius+'px !important}';
  css += '.card,.tile,.ldbody,.tabcard,.tkcard,.sticker{box-shadow:0 '+(20*shadow)+'px '+(44*shadow)+'px rgba(0,0,0,'+(0.12*shadow)+') !important}';
  css += '.en,.ren,.len,.len2,.cken,.nen,.ten,.mline{line-height:'+(1.28*lh)+' !important}';
  css += '.sl .in{padding:'+(80*pad)+'px '+(74*pad)+'px !important}';
  css += '.covttl,.en,.ren,.len,.len2,.cken,.nen,.ten{'+headFont+'}';
  css += '.am,.ram,.lam,.lam2,.ckam,.nam,.tam{'+transFont+'}';
  if(grain>0){
    css += '.sl::after{content:"";position:absolute;inset:0;pointer-events:none;z-index:5;opacity:'+(grain*0.28)+';'+
      'background-image:url("data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'200\\' height=\\'200\\'%3E%3Cfilter id=\\'n\\'%3E%3CfeTurbulence type=\\'fractalNoise\\' baseFrequency=\\'0.85\\' numOctaves=\\'3\\'/%3E%3C/filter%3E%3Crect width=\\'200\\' height=\\'200\\' filter=\\'url(%23n)\\'/%3E%3C/svg%3E");mix-blend-mode:multiply}';
  }
  if(!document.getElementById('showPg').checked) css += '.pg{display:none !important}';
  if(!document.getElementById('showHandle').checked) css += '.handle{display:none !important}';
  if(!document.getElementById('showTag').checked) css += '.tag,.tag2{display:none !important}';

  const bgs = document.getElementById('bgStyle').value;
  if(bgs==='gradient') css += '.sl{background:linear-gradient(160deg,var(--bg) 0%,var(--a2) 100%) !important}';
  else if(bgs==='radial') css += '.sl{background:radial-gradient(120% 80% at 50% 15%,var(--a2) 0%,var(--bg) 62%) !important}';
  else if(bgs==='multigrad') css += '.sl{background:linear-gradient(135deg,var(--bg) 0%,var(--a2) 33%,var(--a3) 66%,var(--a0) 100%) !important}';
  else if(bgs==='sunset') css += '.sl{background:linear-gradient(180deg,var(--a0) 0%,var(--a1) 45%,var(--bg) 100%) !important}';
  else if(bgs==='dots') css += '.sl{background-color:var(--bg) !important;background-image:radial-gradient(var(--a2) 2.5px,transparent 2.5px) !important;background-size:34px 34px !important}';
  else if(bgs==='lines') css += '.sl{background-color:var(--bg) !important;background-image:repeating-linear-gradient(0deg,var(--a2) 0 1px,transparent 1px 40px) !important}';
  else if(bgs==='grid') css += '.sl{background-color:var(--bg) !important;background-image:repeating-linear-gradient(0deg,var(--a2) 0 1px,transparent 1px 46px),repeating-linear-gradient(90deg,var(--a2) 0 1px,transparent 1px 46px) !important}';
  else if(bgs==='paper' || bgs==='noise'){
    const freq = bgs==='paper' ? '0.75' : '0.9';
    const op = bgs==='paper' ? '0.05' : '0.10';
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">'+
      '<filter id="n"><feTurbulence type="fractalNoise" baseFrequency="'+freq+'" numOctaves="3"/></filter>'+
      '<rect width="300" height="300" filter="url(%23n)" opacity="'+op+'"/></svg>';
    css += '.sl{background-color:var(--bg) !important}';
    css += '.sl::before{content:"";position:absolute;inset:0;z-index:4;pointer-events:none;'+
      'background-image:url(\\'data:image/svg+xml,'+encodeURIComponent(svg)+'\\');mix-blend-mode:multiply}';
  }

  const bd = document.getElementById('borderSel').value;
  if(bd==='thin') css += '.sl{border:6px solid var(--a0)}';
  else if(bd==='thick') css += '.sl{border:20px solid var(--a0)}';
  else if(bd==='inset') css += '.sl .in::before{content:"";position:absolute;inset:26px;border:3px solid var(--a0);opacity:.45;pointer-events:none;border-radius:6px}';

  const al = document.getElementById('alignSel').value;
  if(al==='left') css += '.sl .in{align-items:flex-start !important;text-align:left !important}';
  else if(al==='center') css += '.sl .in{align-items:center !important;text-align:center !important}';

  const cs = document.getElementById('caseSel').value;
  if(cs==='upper') css += '.en,.ren,.len,.len2,.cken,.nen,.ten,.mline{text-transform:uppercase !important}';
  else if(cs==='lower') css += '.en,.ren,.len,.len2,.cken,.nen,.ten,.mline{text-transform:lowercase !important}';

  /* feature 2/23: text stroke */
  const strokeW = document.getElementById('strokeCtl').value;
  if(strokeW>0) css += '.covttl,.en,.ren,.len,.len2,.cken,.nen,.ten{-webkit-text-stroke:'+strokeW+'px var(--a0);paint-order:stroke fill}';

  /* feature 3/23: text drop shadow */
  const tsh = document.getElementById('textShadowCtl').value/100;
  if(tsh>0) css += '.covttl,.en,.ren,.len,.len2,.cken,.nen,.ten{text-shadow:'+(6*tsh)+'px '+(8*tsh)+'px '+(14*tsh)+'px rgba(0,0,0,'+(0.45*tsh)+')}';

  /* feature 4/23: text gradient fill */
  if(document.getElementById('textGradientOn').checked){
    css += '.covttl,.en,.ren,.len,.len2,.cken,.nen,.ten{'+
      'background:linear-gradient(120deg,var(--a0),var(--a1));-webkit-background-clip:text;background-clip:text;'+
      '-webkit-text-fill-color:transparent;color:transparent}';
    css += '.plate{-webkit-text-fill-color:var(--bg) !important;color:var(--bg) !important;background:var(--a0) !important;'+
      '-webkit-background-clip:border-box !important;background-clip:border-box !important}';
  }

  /* feature 5/23: neon glow */
  if(document.getElementById('neonOn').checked){
    css += '.covttl,.en,.ren,.len,.len2,.cken,.nen,.ten{'+
      'text-shadow:0 0 6px var(--a0),0 0 16px var(--a0),0 0 34px var(--a0),0 0 60px var(--a1) !important;'+
      'color:#fff !important}';
    css += '.sl{background:#0a0a12 !important;color:#cfd3e0 !important}';
    css += '.card,.tile,.ldbody,.tabcard,.tkcard,.sticker{background:#14141e !important}';
  }

  /* feature 6/23: block opacity + background blur */
  const opac = document.getElementById('opacityCtl').value/100;
  if(opac<1) css += '.card,.tile,.ldbody,.tabcard,.tkcard,.sticker,.bbox,.seal{opacity:'+opac+'}';
  const blurPx = document.getElementById('blurCtl').value;
  if(blurPx>0) css += '.cnrblock,.ribbon,.ph::before{filter:blur('+blurPx+'px)}';


  // ensure text inside light card surfaces stays readable regardless of --ink
  const inkHex = palette.ink.replace('#','');
  const inkLum = (0.299*parseInt(inkHex.slice(0,2),16) + 0.587*parseInt(inkHex.slice(2,4),16) + 0.114*parseInt(inkHex.slice(4,6),16));
  if(inkLum > 140){
    const cardInk = '#241f1a';
    css += '.card .en,.card .am,.card .num,.tile .en,.tile .am,.ldbody .len2,.ldbody .lam2,'+
      '.tabcard .en,.tabcard .am,.tkbody .en,.tkbody .am,.sticker .en,.sticker .am{color:'+cardInk+' !important}';
    css += '.card .rule{background:rgba(0,0,0,.16) !important}';
  }
  st.textContent = css;
}
let SLIDE_W = 1080, SLIDE_H = 1350;
['radiusCtl','shadowCtl','lineHeightCtl','paddingCtl','grainCtl','fontHead','fontTrans','ratioSel',
 'showPg','showHandle','showTag','numStyle','bgStyle','borderSel','alignSel','caseSel',
 'strokeCtl','textShadowCtl','textGradientOn','neonOn','opacityCtl','blurCtl'].forEach(id=>{
  const el=document.getElementById(id);
  const ev = (el.type==='range')?'input':'change';
  el.addEventListener(ev, ()=>{ applyAppearance(); if(built && (id==='ratioSel'||id==='numStyle')) rebuildPreview(); });
});
['showCover','showFollow','showCta','orderSel'].forEach(id=>{
  document.getElementById(id).addEventListener('change', ()=>{ if(built) rebuildPreview(); });
});

/* ---------------- template selection ---------------- */
let currentTpl = 'card';
document.getElementById('tplSelect').onchange=(e)=>{
  currentTpl = e.target.value;
  if(built) rebuildPreview();
};

/* ---------------- content parsing ---------------- */
function processHighlight(text, color){
  return text.replace(/\*\*(.+?)\*\*/g, '<span class="plate" style="background:'+color+'">$1</span>');
}
function parseContent(){
  const title = document.getElementById('inTitle').value.trim();
  const highlightColor = document.getElementById('inHighlightColor').value;
  const eyebrow = document.getElementById('inEyebrow').value.trim();
  const sub = document.getElementById('inSub').value.trim();
  const handle = document.getElementById('inHandle').value.trim();
  const lines = document.getElementById('inPhrases').value.split('\\n').map(l=>l.trim()).filter(Boolean);
  const phrases = lines.map(l=>{
    const parts = l.split('|');
    return { en: (parts[0]||'').trim(), am: (parts[1]||'').trim() };
  }).filter(p=>p.en);
  const order = document.getElementById('orderSel').value;
  if(order==='reverse') phrases.reverse();
  else if(order==='shuffle'){
    for(let i=phrases.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [phrases[i],phrases[j]]=[phrases[j],phrases[i]]; }
  }
  return {title, highlightColor, eyebrow, sub, handle, phrases};
}

/* ---------------- slide builders per template ---------------- */
const ICONS = {
 'Like':'<path d="M23 42s-17-10.4-17-22a9 9 0 0 1 17-4 9 9 0 0 1 17 4c0 11.6-17 22-17 22z"/>',
 'Comment':'<path d="M6 8h34a3 3 0 0 1 3 3v20a3 3 0 0 1-3 3H20L10 44V34H6a3 3 0 0 1-3-3V11a3 3 0 0 1 3-3z"/>',
 'Share':'<path d="M44 5 4 22l16 6 4 15 6-14 14-24z"/>',
 'Save':'<path d="M12 4h24v40L24 33 12 44z"/>',
};

function buildCoverHTML(data){
  const titleHtml = processHighlight(data.title, data.highlightColor);
  const em = document.getElementById('coverEmoji').value.trim();
  const emHtml = em ? '<div style="font-size:76px;line-height:1;margin-bottom:10px">'+em+'</div>' : '';
  return '<div class="sl cov"><div class="in">'+
    emHtml+
    '<div class="eyebrow" contenteditable="true">'+data.eyebrow+'</div>'+
    '<div class="covttl" contenteditable="true">'+titleHtml+'</div>'+
    '<div class="sub" contenteditable="true">'+data.sub+'</div>'+
    '<div class="dots"><i style="background:var(--a0)"></i><i style="background:var(--a1)"></i><i style="background:var(--a2)"></i></div>'+
    '</div></div>';
}
function buildFollowHTML(data){
  const chips = Object.entries(ICONS).map(([k,d])=>
    '<div class="chip"><svg viewBox="0 0 48 48" style="fill:var(--a0)">'+d+'</svg><span>'+k+'</span></div>').join('');
  return '<div class="sl fw"><div class="in">'+
    '<div class="eyebrow" contenteditable="true">'+data.handle+'</div>'+
    '<div class="covttl" contenteditable="true">Հավանեցի՞ր<br><span class="plate">փոստը</span></div>'+
    '<div class="plainsub" contenteditable="true">Հետևիր, որպեսզի բաց չթողնես նոր և օգտակար գրառումները</div>'+
    '<div class="ava" id="avaImg" style="background-image:url(data:image/png;base64,'+AVA_B64+')"></div>'+
    '<div class="chips">'+chips+'</div>'+
    '</div></div>';
}

function fmtNum(i, total){
  const style = document.getElementById('numStyle').value;
  if(style==='none') return '';
  if(style==='plain') return String(i);
  if(style==='slash') return i+'/'+total;
  return String(i).padStart(2,'0');
}
function buildCtaHTML(data){
  return '<div class="sl cta"><div class="in">'+
    '<div class="tag2" contenteditable="true">Դեռ մի քանիսը կա առջևում</div>'+
    '<div class="covttl" contenteditable="true">Սեյվ արա,<br><span class="plate">կիրառի՛ր</span></div>'+
    '<div class="plainsub" contenteditable="true">Ընտրիր մեկը և այսօր օգտագործիր մեկ նախադասության մեջ</div>'+
    '</div></div>';
}
function decorateSlides(slidesArr){
  const prog = document.getElementById('progressSel').value;
  const wm = document.getElementById('watermark').value.trim();
  const swipe = document.getElementById('swipeHint').checked;
  const total = slidesArr.length;
  return slidesArr.map((html,i)=>{
    let deco='';
    if(prog==='bar'){
      const pct = Math.round(((i+1)/total)*100);
      deco += '<div style="position:absolute;top:0;left:0;height:8px;width:'+pct+'%;background:var(--a0);z-index:6"></div>';
    } else if(prog==='dots'){
      let dots='';
      for(let k=0;k<total;k++){
        dots += '<i style="width:10px;height:10px;border-radius:50%;display:block;background:var(--a0);opacity:'+(k===i?'1':'0.28')+'"></i>';
      }
      deco += '<div style="position:absolute;bottom:26px;left:0;right:0;display:flex;gap:8px;justify-content:center;z-index:6">'+dots+'</div>';
    }
    if(wm){
      deco += '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-24deg);'+
        'font-family:\\'MA\\';font-weight:800;font-size:64px;color:var(--ink);opacity:.07;z-index:0;white-space:nowrap;pointer-events:none">'+wm+'</div>';
    }
    if(swipe && i<total-1){
      deco += '<div style="position:absolute;right:34px;top:50%;transform:translateY(-50%);z-index:6;opacity:.65">'+
        '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--a0)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">'+
        '<polyline points="9 18 15 12 9 6"/></svg></div>';
    }
    if(!deco) return html;
    return html.replace('>', '>'+deco);
  });
}

function chunkSize(def){
  const v=document.getElementById('perSlideSel').value;
  return v==='auto' ? def : parseInt(v,10);
}
function buildSlides(data, tpl){
  const slides = [];
  if(document.getElementById('showCover').checked) slides.push(buildCoverHTML(data));
  const accents = ['a0','a1','a0','a1'];
  if (tpl === 'card'){
    const total = data.phrases.length;
    data.phrases.forEach((p,i)=>{
      const acc = 'var(--'+accents[i%2]+')';
      slides.push('<div class="sl ph"><div class="in">'+
        '<div class="tag" contenteditable="true">'+data.eyebrow+'</div>'+
        '<div class="stage2"><div class="card" style="--acc:'+acc+'">'+
          '<div class="num">'+String(i+1).padStart(2,'0')+'</div>'+
          '<div class="en" contenteditable="true">'+p.en+'</div>'+
          '<div class="rule"></div>'+
          '<div class="lbl">Հայերեն</div>'+
          '<div class="am" contenteditable="true">'+p.am+'</div>'+
        '</div></div>'+
        '<div class="foot"><span class="handle" contenteditable="true">'+data.handle+'</span><span class="pg">'+(i+1)+'/'+total+'</span></div>'+
        '</div></div>');
    });
  } else if (tpl === 'editorial'){
    const chunk=chunkSize(2); const groups=[];
    for(let i=0;i<data.phrases.length;i+=chunk) groups.push(data.phrases.slice(i,i+chunk));
    groups.forEach((g,gi)=>{
      let items = g.map((p,j)=>{
        const num = gi*chunk+j+1;
        return '<div class="item"><div class="inum">'+String(num).padStart(2,'0')+'</div>'+
          '<div class="en" contenteditable="true">'+p.en+'</div><div class="am" contenteditable="true">'+p.am+'</div></div>';
      }).join('');
      slides.push('<div class="sl ph"><div class="in">'+
        '<div class="tag" contenteditable="true">'+data.eyebrow+'</div>'+
        '<div class="items">'+items+'</div>'+
        '<div class="foot"><span class="handle" contenteditable="true">'+data.handle+'</span><span class="pg">'+(gi+1)+'/'+groups.length+'</span></div>'+
        '</div></div>');
    });
  } else if (tpl === 'ledger'){
    const chunk=chunkSize(3); const groups=[];
    for(let i=0;i<data.phrases.length;i+=chunk) groups.push(data.phrases.slice(i,i+chunk));
    groups.forEach((g,gi)=>{
      let rows = g.map((p,j)=>{
        const num = gi*chunk+j+1;
        return '<div class="row2"><div class="rnum">'+String(num).padStart(2,'0')+'</div>'+
          '<div class="rbody"><div class="ren" contenteditable="true">'+p.en+'</div><div class="ram" contenteditable="true">'+p.am+'</div></div></div>';
      }).join('');
      slides.push('<div class="sl ph"><div class="in">'+
        '<div class="tag" contenteditable="true">'+data.eyebrow+'</div>'+
        '<div class="rows">'+rows+'</div>'+
        '<div class="foot"><span class="handle" contenteditable="true">'+data.handle+'</span><span class="pg">'+(gi+1)+'/'+groups.length+'</span></div>'+
        '</div></div>');
    });
  } else if (tpl === 'grid'){
    const chunk=chunkSize(6); const groups=[];
    for(let i=0;i<data.phrases.length;i+=chunk) groups.push(data.phrases.slice(i,i+chunk));
    groups.forEach((g,gi)=>{
      let tiles = g.map((p,j)=>{
        const num = gi*chunk+j+1;
        const acc = 'var(--'+accents[j%2]+')';
        return '<div class="tile" style="--acc:'+acc+'"><div class="tnum">'+String(num).padStart(2,'0')+'</div>'+
          '<div class="en" contenteditable="true">'+p.en+'</div><div class="am" contenteditable="true">'+p.am+'</div></div>';
      }).join('');
      slides.push('<div class="sl ph"><div class="in">'+
        '<div class="tag" contenteditable="true">'+data.eyebrow+'</div>'+
        '<div class="tgrid">'+tiles+'</div>'+
        '<div class="foot"><span class="handle" contenteditable="true">'+data.handle+'</span><span class="pg">'+(gi+1)+'/'+groups.length+'</span></div>'+
        '</div></div>');
    });
  } else if (tpl === 'pills'){
    const total = data.phrases.length;
    data.phrases.forEach((p,i)=>{
      const acc = 'var(--'+accents[i%2]+')';
      slides.push('<div class="sl ph"><div class="in">'+
        '<div class="tag" contenteditable="true">'+data.eyebrow+'</div>'+
        '<div class="pbody">'+
          '<div class="en" contenteditable="true">'+p.en+'</div>'+
          '<div class="pillrow"><span class="pill" style="--acc:'+acc+'" contenteditable="true">'+p.am+'</span></div>'+
        '</div>'+
        '<div class="foot"><span class="handle" contenteditable="true">'+data.handle+'</span><span class="pg">'+(i+1)+'/'+total+'</span></div>'+
        '</div></div>');
    });
  } else if (tpl === 'list'){
    const chunk=chunkSize(5); const groups=[];
    for(let i=0;i<data.phrases.length;i+=chunk) groups.push(data.phrases.slice(i,i+chunk));
    groups.forEach((g,gi)=>{
      let rows = g.map((p,j)=>{
        const num = gi*chunk+j+1;
        const acc = 'var(--'+accents[j%2]+')';
        return '<div class="lrow"><div class="lnum" style="--acc:'+acc+'">'+String(num).padStart(2,'0')+'</div>'+
          '<div class="len" contenteditable="true">'+p.en+'</div><div class="lam" contenteditable="true">'+p.am+'</div></div>';
      }).join('');
      slides.push('<div class="sl ph"><div class="in">'+
        (gi===0 ? '<div class="covttl-small" contenteditable="true">'+data.eyebrow+'</div>' : '<div class="tag" contenteditable="true">'+data.eyebrow+'</div>') +
        '<div class="lrows">'+rows+'</div>'+
        '<div class="foot"><span class="handle" contenteditable="true">'+data.handle+'</span><span class="pg">'+(gi+1)+'/'+groups.length+'</span></div>'+
        '</div></div>');
    });
  } else if (tpl === 'stack'){
    const total = data.phrases.length;
    data.phrases.forEach((p,i)=>{
      const acc = 'var(--'+accents[i%2]+')';
      slides.push('<div class="sl ph" style="--acc:'+acc+'"><div class="in">'+
        '<div class="tag" contenteditable="true">'+data.eyebrow+'</div>'+
        '<div class="num">'+String(i+1).padStart(2,'0')+'</div>'+
        '<div class="en" contenteditable="true">'+p.en+'</div>'+
        '<div class="stackrule"></div>'+
        '<div class="am" contenteditable="true">'+p.am+'</div>'+
        '<div class="foot"><span class="handle" contenteditable="true">'+data.handle+'</span><span class="pg">'+(i+1)+'/'+total+'</span></div>'+
        '</div></div>');
    });
  } else if (tpl === 'ladder'){
    const chunk=chunkSize(3); const groups=[];
    for(let i=0;i<data.phrases.length;i+=chunk) groups.push(data.phrases.slice(i,i+chunk));
    groups.forEach((g,gi)=>{
      let items = g.map((p,j)=>{
        const size = 16 + j*8;
        return '<div class="lditem"><div class="lddot" style="width:'+size+'px;height:'+size+'px"></div>'+
          '<div class="ldbody"><div class="len2" contenteditable="true">'+p.en+'</div><div class="lam2" contenteditable="true">'+p.am+'</div></div></div>';
      }).join('');
      slides.push('<div class="sl ph"><div class="in">'+
        '<div class="tag" contenteditable="true">'+data.eyebrow+'</div>'+
        '<div class="ldwrap">'+items+'</div>'+
        '<div class="foot"><span class="handle" contenteditable="true">'+data.handle+'</span><span class="pg">'+(gi+1)+'/'+groups.length+'</span></div>'+
        '</div></div>');
    });
  } else if (tpl === 'underline'){
    const total = data.phrases.length;
    data.phrases.forEach((p,i)=>{
      const acc = 'var(--'+accents[i%2]+')';
      slides.push('<div class="sl ph" style="--acc:'+acc+'"><div class="in">'+
        '<div class="tag" contenteditable="true">'+data.eyebrow+'</div>'+
        '<div class="unum">'+String(i+1).padStart(2,'0')+'</div>'+
        '<div class="uwrap"><div class="en" contenteditable="true">'+p.en+'</div><div class="ubar"></div></div>'+
        '<div class="am" contenteditable="true">'+p.am+'</div>'+
        '<div class="foot"><span class="handle" contenteditable="true">'+data.handle+'</span><span class="pg">'+(i+1)+'/'+total+'</span></div>'+
        '</div></div>');
    });
  } else if (tpl === 'split'){
    const total = data.phrases.length;
    data.phrases.forEach((p,i)=>{
      const acc = 'var(--'+accents[i%2]+')';
      slides.push('<div class="sl ph" style="--acc:'+acc+'"><div class="in">'+
        '<div class="tag" contenteditable="true">'+data.eyebrow+'</div>'+
        '<div class="scols">'+
          '<div class="scol"><div class="slbl">English</div><div class="en" contenteditable="true">'+p.en+'</div></div>'+
          '<div class="scol"><div class="slbl">Հայերեն</div><div class="am" contenteditable="true">'+p.am+'</div></div>'+
        '</div>'+
        '<div class="foot"><span class="handle" contenteditable="true">'+data.handle+'</span><span class="pg">'+(i+1)+'/'+total+'</span></div>'+
        '</div></div>');
    });
  } else if (tpl === 'badge'){
    const total = data.phrases.length;
    data.phrases.forEach((p,i)=>{
      const acc = 'var(--'+accents[i%2]+')';
      slides.push('<div class="sl ph" style="--acc:'+acc+'"><div class="in">'+
        '<div class="tag" contenteditable="true">'+data.eyebrow+'</div>'+
        '<div class="sticker"><div class="bnum">'+String(i+1).padStart(2,'0')+'</div>'+
          '<div class="en" contenteditable="true">'+p.en+'</div>'+
          '<div class="am" contenteditable="true">'+p.am+'</div></div>'+
        '<div class="foot"><span class="handle" contenteditable="true">'+data.handle+'</span><span class="pg">'+(i+1)+'/'+total+'</span></div>'+
        '</div></div>');
    });
  } else if (tpl === 'timeline'){
    const chunk=chunkSize(3); const groups=[];
    for(let i=0;i<data.phrases.length;i+=chunk) groups.push(data.phrases.slice(i,i+chunk));
    groups.forEach((g,gi)=>{
      let items = g.map((p,j)=>{
        const num = gi*chunk+j+1;
        return '<div class="titem"><div class="tdot">'+num+'</div>'+
          '<div class="ten" contenteditable="true">'+p.en+'</div><div class="tam" contenteditable="true">'+p.am+'</div></div>';
      }).join('');
      slides.push('<div class="sl ph"><div class="in">'+
        '<div class="tag" contenteditable="true">'+data.eyebrow+'</div>'+
        '<div class="twrap">'+items+'</div>'+
        '<div class="foot"><span class="handle" contenteditable="true">'+data.handle+'</span><span class="pg">'+(gi+1)+'/'+groups.length+'</span></div>'+
        '</div></div>');
    });
  } else if (tpl === 'newspaper'){
    const total = data.phrases.length;
    data.phrases.forEach((p,i)=>{
      slides.push('<div class="sl ph"><div class="in">'+
        '<div class="nprule"></div>'+
        '<div class="npbyline"><span>'+data.eyebrow+'</span><span>№'+String(i+1).padStart(2,'0')+'</span></div>'+
        '<div class="nprule"></div>'+
        '<div class="en" contenteditable="true">"'+p.en+'"</div>'+
        '<div class="am" contenteditable="true">'+p.am+'</div>'+
        '<div class="foot"><span class="handle" contenteditable="true">'+data.handle+'</span><span class="pg">'+(i+1)+'/'+total+'</span></div>'+
        '</div></div>');
    });
  } else if (tpl === 'bubble'){
    const total = data.phrases.length;
    data.phrases.forEach((p,i)=>{
      const acc = 'var(--'+accents[i%2]+')';
      slides.push('<div class="sl ph" style="--acc:'+acc+'"><div class="in">'+
        '<div class="tag" contenteditable="true">'+data.eyebrow+'</div>'+
        '<div class="bwrap"><div class="bbox"><div class="en" contenteditable="true">'+p.en+'</div></div></div>'+
        '<div class="am" contenteditable="true">'+p.am+'</div>'+
        '<div class="foot"><span class="handle" contenteditable="true">'+data.handle+'</span><span class="pg">'+(i+1)+'/'+total+'</span></div>'+
        '</div></div>');
    });
  } else if (tpl === 'frame'){
    const total = data.phrases.length;
    data.phrases.forEach((p,i)=>{
      const acc = 'var(--'+accents[i%2]+')';
      slides.push('<div class="sl ph" style="--acc:'+acc+'"><div class="in">'+
        '<div class="tag" contenteditable="true">'+data.eyebrow+'</div>'+
        '<div class="fbox"><div class="fnum">'+String(i+1).padStart(2,'0')+'</div>'+
          '<div class="en" contenteditable="true">'+p.en+'</div>'+
          '<div class="am" contenteditable="true">'+p.am+'</div></div>'+
        '<div class="foot"><span class="handle" contenteditable="true">'+data.handle+'</span><span class="pg">'+(i+1)+'/'+total+'</span></div>'+
        '</div></div>');
    });
  } else if (tpl === 'duotone'){
    const total = data.phrases.length;
    data.phrases.forEach((p,i)=>{
      const acc = 'var(--'+accents[i%2]+')';
      slides.push('<div class="sl ph" style="--acc:'+acc+'"><div class="in">'+
        '<div class="tag" contenteditable="true">'+data.eyebrow+'</div>'+
        '<div class="dnum">'+String(i+1).padStart(2,'0')+'</div>'+
        '<div class="en" contenteditable="true">'+p.en+'</div>'+
        '<div class="am" contenteditable="true">'+p.am+'</div>'+
        '<div class="foot"><span class="handle" contenteditable="true">'+data.handle+'</span><span class="pg">'+(i+1)+'/'+total+'</span></div>'+
        '</div></div>');
    });
  } else if (tpl === 'bignum'){
    const total = data.phrases.length;
    data.phrases.forEach((p,i)=>{
      const acc = 'var(--'+accents[i%2]+')';
      slides.push('<div class="sl ph" style="--acc:'+acc+'"><div class="in">'+
        '<div class="tag" contenteditable="true">'+data.eyebrow+'</div>'+
        '<div class="bgnum">'+(i+1)+'</div>'+
        '<div class="en" contenteditable="true">'+p.en+'</div>'+
        '<div class="am" contenteditable="true">'+p.am+'</div>'+
        '<div class="foot"><span class="handle" contenteditable="true">'+data.handle+'</span><span class="pg">'+(i+1)+'/'+total+'</span></div>'+
        '</div></div>');
    });
  } else if (tpl === 'tab'){
    const total = data.phrases.length;
    data.phrases.forEach((p,i)=>{
      const acc = 'var(--'+accents[i%2]+')';
      slides.push('<div class="sl ph" style="--acc:'+acc+'"><div class="in">'+
        '<div class="tag" contenteditable="true">'+data.eyebrow+'</div>'+
        '<div class="tabwrap"><div class="tabcard"><div class="tablabel">'+String(i+1).padStart(2,'0')+'</div>'+
          '<div class="en" contenteditable="true">'+p.en+'</div>'+
          '<div class="am" contenteditable="true">'+p.am+'</div></div></div>'+
        '<div class="foot"><span class="handle" contenteditable="true">'+data.handle+'</span><span class="pg">'+(i+1)+'/'+total+'</span></div>'+
        '</div></div>');
    });
  } else if (tpl === 'ticket'){
    const total = data.phrases.length;
    data.phrases.forEach((p,i)=>{
      const acc = 'var(--'+accents[i%2]+')';
      slides.push('<div class="sl ph" style="--acc:'+acc+'"><div class="in">'+
        '<div class="tag" contenteditable="true">'+data.eyebrow+'</div>'+
        '<div class="tkwrap"><div class="tkcard">'+
          '<div class="tkstub">'+String(i+1).padStart(2,'0')+'</div>'+
          '<div class="tkbody"><div class="en" contenteditable="true">'+p.en+'</div>'+
          '<div class="am" contenteditable="true">'+p.am+'</div></div></div></div>'+
        '<div class="foot"><span class="handle" contenteditable="true">'+data.handle+'</span><span class="pg">'+(i+1)+'/'+total+'</span></div>'+
        '</div></div>');
    });
  } else if (tpl === 'checklist'){
    const chunk=chunkSize(4); const groups=[];
    for(let i=0;i<data.phrases.length;i+=chunk) groups.push(data.phrases.slice(i,i+chunk));
    groups.forEach((g,gi)=>{
      let rows = g.map(p=>
        '<div class="ckrow"><div class="ckbox"><svg viewBox="0 0 24 24"><polyline points="4,13 9,18 20,6"/></svg></div>'+
        '<div><div class="cken" contenteditable="true">'+p.en+'</div><div class="ckam" contenteditable="true">'+p.am+'</div></div></div>'
      ).join('');
      slides.push('<div class="sl ph"><div class="in">'+
        '<div class="tag" contenteditable="true">'+data.eyebrow+'</div>'+
        '<div class="ckrows">'+rows+'</div>'+
        '<div class="foot"><span class="handle" contenteditable="true">'+data.handle+'</span><span class="pg">'+(gi+1)+'/'+groups.length+'</span></div>'+
        '</div></div>');
    });
  } else if (tpl === 'numbered'){
    const chunk=chunkSize(3); const groups=[];
    for(let i=0;i<data.phrases.length;i+=chunk) groups.push(data.phrases.slice(i,i+chunk));
    groups.forEach((g,gi)=>{
      let rows = g.map((p,j)=>{
        const num = gi*chunk+j+1;
        return '<div class="nrow"><div class="nbig">'+String(num).padStart(2,'0')+'</div>'+
          '<div><div class="nen" contenteditable="true">'+p.en+'</div><div class="nam" contenteditable="true">'+p.am+'</div></div></div>';
      }).join('');
      slides.push('<div class="sl ph"><div class="in">'+
        '<div class="tag" contenteditable="true">'+data.eyebrow+'</div>'+
        '<div class="nrows">'+rows+'</div>'+
        '<div class="foot"><span class="handle" contenteditable="true">'+data.handle+'</span><span class="pg">'+(gi+1)+'/'+groups.length+'</span></div>'+
        '</div></div>');
    });
  } else if (tpl === 'hero'){
    const total = data.phrases.length;
    data.phrases.forEach((p,i)=>{
      const acc = 'var(--'+accents[i%2]+')';
      slides.push('<div class="sl ph" style="--acc:'+acc+'"><div class="in">'+
        '<div class="tag" contenteditable="true">'+data.eyebrow+'</div>'+
        '<div class="hnum">'+String(i+1).padStart(2,'0')+'</div>'+
        '<div class="en" contenteditable="true">'+p.en+'</div>'+
        '<div class="am" contenteditable="true">'+p.am+'</div>'+
        '<div class="foot"><span class="handle" contenteditable="true">'+data.handle+'</span><span class="pg">'+(i+1)+'/'+total+'</span></div>'+
        '</div></div>');
    });
  } else if (tpl === 'marker'){
    const total = data.phrases.length;
    data.phrases.forEach((p,i)=>{
      const acc = 'var(--'+accents[i%2]+')';
      slides.push('<div class="sl ph" style="--acc:'+acc+'"><div class="in">'+
        '<div class="tag" contenteditable="true">'+data.eyebrow+'</div>'+
        '<div class="mnum">'+String(i+1).padStart(2,'0')+'</div>'+
        '<div class="mwrap"><span class="mline" contenteditable="true">'+p.en+'</span></div>'+
        '<div class="am" contenteditable="true">'+p.am+'</div>'+
        '<div class="foot"><span class="handle" contenteditable="true">'+data.handle+'</span><span class="pg">'+(i+1)+'/'+total+'</span></div>'+
        '</div></div>');
    });
  } else if (tpl === 'corner'){
    const total = data.phrases.length;
    data.phrases.forEach((p,i)=>{
      const acc = 'var(--'+accents[i%2]+')';
      slides.push('<div class="sl ph" style="--acc:'+acc+'"><div class="cnrblock"></div><div class="in">'+
        '<div class="tag" contenteditable="true">'+data.eyebrow+'</div>'+
        '<div class="cbody"><div class="cnum">'+String(i+1).padStart(2,'0')+'</div>'+
          '<div class="en" contenteditable="true">'+p.en+'</div>'+
          '<div class="am" contenteditable="true">'+p.am+'</div></div>'+
        '<div class="foot"><span class="handle" contenteditable="true">'+data.handle+'</span><span class="pg">'+(i+1)+'/'+total+'</span></div>'+
        '</div></div>');
    });
  } else if (tpl === 'diagonal'){
    const total = data.phrases.length;
    data.phrases.forEach((p,i)=>{
      const acc = 'var(--'+accents[i%2]+')';
      slides.push('<div class="sl ph" style="--acc:'+acc+'">'+
        '<div class="ribbon"><div class="en" contenteditable="true">'+p.en+'</div></div>'+
        '<div class="in">'+
        '<div class="tag" contenteditable="true">'+data.eyebrow+'</div>'+
        '<div class="dbody"><div class="am" contenteditable="true">'+p.am+'</div></div>'+
        '<div class="foot"><span class="handle" contenteditable="true">'+data.handle+'</span><span class="pg">'+(i+1)+'/'+total+'</span></div>'+
        '</div></div>');
    });
  } else if (tpl === 'sidebar'){
    const total = data.phrases.length;
    data.phrases.forEach((p,i)=>{
      const acc = 'var(--'+accents[i%2]+')';
      slides.push('<div class="sl ph" style="--acc:'+acc+'"><div class="in">'+
        '<div class="tag" contenteditable="true">'+data.eyebrow+'</div>'+
        '<div class="sbody"><div class="sbnum">'+String(i+1).padStart(2,'0')+'</div>'+
          '<div class="en" contenteditable="true">'+p.en+'</div>'+
          '<div class="am" contenteditable="true">'+p.am+'</div></div>'+
        '<div class="foot"><span class="handle" contenteditable="true">'+data.handle+'</span><span class="pg">'+(i+1)+'/'+total+'</span></div>'+
        '</div></div>');
    });
  } else if (tpl === 'stamp'){
    const total = data.phrases.length;
    data.phrases.forEach((p,i)=>{
      const acc = 'var(--'+accents[i%2]+')';
      slides.push('<div class="sl ph" style="--acc:'+acc+'"><div class="in">'+
        '<div class="tag" contenteditable="true">'+data.eyebrow+'</div>'+
        '<div class="seal">'+String(i+1).padStart(2,'0')+'</div>'+
        '<div class="en" contenteditable="true">'+p.en+'</div>'+
        '<div class="stamprule"></div>'+
        '<div class="am" contenteditable="true">'+p.am+'</div>'+
        '<div class="foot"><span class="handle" contenteditable="true">'+data.handle+'</span><span class="pg">'+(i+1)+'/'+total+'</span></div>'+
        '</div></div>');
    });
  }
  if(document.getElementById('showCta').checked){
    const mid = Math.max(1, Math.floor(slides.length/2));
    slides.splice(mid, 0, buildCtaHTML(data));
  }
  if(document.getElementById('showFollow').checked) slides.push(buildFollowHTML(data));
  return decorateSlides(slides);
}

/* ---------------- preview / player ---------------- */
let slides=[], cur=0, built=false;

function applyPalette(){
  const styleTag = document.getElementById('paletteVars') || (function(){ const s=document.createElement('style'); s.id='paletteVars'; document.head.appendChild(s); return s; })();
  styleTag.textContent = ':root{--bg:'+palette.bg+';--ink:'+palette.ink+';--a0:'+palette.a0+';--a1:'+palette.a1+';--a2:'+palette.a2+';--a3:'+palette.a3+'}';
}

function renderPlayer(){
  const wrap = document.getElementById('wrap');
  wrap.innerHTML = slides.join('');
  wrap.className = 'wrap tpl-'+currentTpl;
  show(0);
  fit();
}
function show(i){
  const els=[...document.querySelectorAll('.sl')];
  cur=(i+els.length)%els.length;
  els.forEach((s,k)=>s.classList.toggle('show',k===cur));
  document.getElementById('count').textContent=(cur+1)+' / '+els.length;
  document.getElementById('status').textContent='';
  document.getElementById('outimg').style.display='none';
}
document.getElementById('prev').onclick=()=>show(cur-1);
document.getElementById('next').onclick=()=>show(cur+1);
function fit(){
  const wrap=document.getElementById('wrap');
  const col=document.getElementById('previewCol');
  const avail=(col&&col.clientWidth)?col.clientWidth-12:(window.innerWidth-28);
  const w=Math.min(avail,520);const s=w/SLIDE_W;
  wrap.style.transform='scale('+s+')';
  document.getElementById('stage').style.height=(SLIDE_H*s)+'px';
}
window.addEventListener('resize',fit);

document.getElementById('tsize').oninput=e=>{
  document.documentElement.style.setProperty('--fs',(e.target.value/100).toFixed(2));
};
document.getElementById('covTextSize').oninput=e=>{
  document.documentElement.style.setProperty('--covfs',(e.target.value/100).toFixed(2));
};

/* ---------------- extra tools ---------------- */
let moveMode=false;
document.getElementById('moveMode').onclick=function(){
  moveMode=!moveMode;
  this.classList.toggle('active',moveMode);
  this.textContent = moveMode ? 'Готово (выкл. перемещение)' : 'Двигать блоки';
  document.querySelectorAll('.sl .in > *').forEach(b=>{
    if(moveMode){
      const r=b.getBoundingClientRect(), pr=b.parentElement.getBoundingClientRect();
      const sc=(pr.width/SLIDE_W)||1;
      if(!b.style.top) b.style.top=((r.top-pr.top)/sc)+'px';
      b.classList.add('movable');
    } else b.classList.remove('movable');
  });
};
document.addEventListener('pointerdown', e=>{
  if(!moveMode) return;
  const blk=e.target.closest('.movable'); if(!blk) return;
  const wrapEl=document.getElementById('wrap');
  const wr=wrapEl.getBoundingClientRect(); const sc=(wr.width/SLIDE_W)||1;
  const r=blk.getBoundingClientRect();
  const sx=e.clientX, sy=e.clientY;
  const sl=(r.left-wr.left)/sc, stp=(r.top-wr.top)/sc;
  blk.classList.add('dragging');
  function mv(ev){
    blk.style.left=(sl+(ev.clientX-sx)/sc)+'px';
    blk.style.top=(stp+(ev.clientY-sy)/sc)+'px';
    blk.style.right='auto';
  }
  function up(){ blk.classList.remove('dragging'); document.removeEventListener('pointermove',mv); document.removeEventListener('pointerup',up); }
  document.addEventListener('pointermove',mv); document.addEventListener('pointerup',up);
});

/* feature 9/23: QR code generator (pure client-side, no external service) */
function makeQrSvg(text, dark, light){
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  const n = qr.getModuleCount();
  const cell = 4;
  const size = n*cell;
  let rects='';
  for(let r=0;r<n;r++){
    for(let c=0;c<n;c++){
      if(qr.isDark(r,c)) rects += '<rect x="'+(c*cell)+'" y="'+(r*cell)+'" width="'+cell+'" height="'+cell+'"/>';
    }
  }
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+size+' '+size+'" width="100%" height="100%">'+
    '<rect width="'+size+'" height="'+size+'" fill="'+light+'"/><g fill="'+dark+'">'+rects+'</g></svg>';
}
document.getElementById('addQrBtn').onclick=()=>{
  const hint=document.getElementById('qrHint');
  if(!built){ hint.textContent='Сначала собери пост.'; return; }
  const txt=document.getElementById('qrText').value.trim();
  if(!txt){ hint.textContent='Впиши ссылку или текст для QR.'; return; }
  const activeSlide=document.querySelector('.sl.show');
  if(!activeSlide) return;
  let holder=activeSlide.querySelector('.userQrCode');
  if(!holder){
    holder=document.createElement('div');
    holder.className='userQrCode';
    holder.style.cssText='position:absolute;right:40px;bottom:110px;width:130px;height:130px;background:#fff;padding:10px;border-radius:12px;box-shadow:0 8px 20px rgba(0,0,0,.18);z-index:7';
    activeSlide.querySelector('.in').appendChild(holder);
  }
  try{
    holder.innerHTML = makeQrSvg(txt, '#000000', '#ffffff');
    hint.textContent='QR добавлен на слайд '+(cur+1)+'.';
  }catch(err){ hint.textContent='Не удалось собрать QR (слишком длинный текст?).'; }
};

/* feature 8/23: custom photo per slide */
document.getElementById('slidePhotoBtn').onclick=()=>{
  if(!built){ document.getElementById('slidePhotoHint').textContent='Сначала собери пост.'; return; }
  document.getElementById('slidePhotoInput').click();
};
document.getElementById('slidePhotoInput').onchange=(e)=>{
  const f=e.target.files[0]; if(!f) return;
  const r=new FileReader();
  r.onload=()=>{
    const activeSlide=document.querySelector('.sl.show');
    if(!activeSlide) return;
    activeSlide.style.backgroundImage='linear-gradient(rgba(0,0,0,.28),rgba(0,0,0,.28)), url('+r.result+')';
    activeSlide.style.backgroundSize='cover';
    activeSlide.style.backgroundPosition='center';
    document.getElementById('slidePhotoHint').textContent='Фото добавлено на слайд '+(cur+1)+'.';
  };
  r.readAsDataURL(f);
};

/* feature 13/23: reorder slide position */
document.getElementById('moveSlideLeft').onclick=()=>{
  if(!built) return;
  const active=document.querySelector('.sl.show');
  const prevEl=active && active.previousElementSibling;
  if(!active || !prevEl) return;
  active.parentNode.insertBefore(active, prevEl);
  slides=[...document.querySelectorAll('.sl')];
  show(cur-1);
  document.getElementById('status').textContent='Слайд передвинут влево.';
  pushHistory();
};
document.getElementById('moveSlideRight').onclick=()=>{
  if(!built) return;
  const active=document.querySelector('.sl.show');
  const nextEl=active && active.nextElementSibling;
  if(!active || !nextEl) return;
  active.parentNode.insertBefore(nextEl, active);
  slides=[...document.querySelectorAll('.sl')];
  show(cur+1);
  document.getElementById('status').textContent='Слайд передвинут вправо.';
  pushHistory();
};

/* feature 12/23: delete slide */
document.getElementById('delSlide').onclick=()=>{
  if(!built) return;
  const all=[...document.querySelectorAll('.sl')];
  if(all.length<=1){ document.getElementById('status').textContent='Нельзя удалить последний слайд.'; return; }
  const active=document.querySelector('.sl.show');
  if(!active) return;
  const idx=all.indexOf(active);
  active.remove();
  slides=[...document.querySelectorAll('.sl')];
  show(Math.min(idx,slides.length-1));
  document.getElementById('status').textContent='Слайд удалён.';
  pushHistory();
};

/* feature 11/23: duplicate slide */
document.getElementById('dupSlide').onclick=()=>{
  if(!built) return;
  const active=document.querySelector('.sl.show');
  if(!active) return;
  const clone=active.cloneNode(true);
  active.insertAdjacentElement('afterend', clone);
  slides=[...document.querySelectorAll('.sl')];
  show(cur+1);
  document.getElementById('status').textContent='Слайд продублирован.';
  pushHistory();
};

/* feature 15/23: undo / redo */
let historyStack=[], historyIndex=-1, restoringHistory=false;
function pushHistory(){
  if(!built || restoringHistory) return;
  const snap=document.getElementById('wrap').innerHTML;
  if(historyStack[historyIndex]===snap) return;
  historyStack=historyStack.slice(0,historyIndex+1);
  historyStack.push(snap);
  if(historyStack.length>30) historyStack.shift();
  historyIndex=historyStack.length-1;
  updateUndoRedoBtns();
  scheduleAutosave();
}
function updateUndoRedoBtns(){
  document.getElementById('undoBtn').disabled = historyIndex<=0;
  document.getElementById('redoBtn').disabled = historyIndex>=historyStack.length-1;
}
function restoreHistory(idx){
  if(idx<0 || idx>=historyStack.length) return;
  restoringHistory=true;
  document.getElementById('wrap').innerHTML=historyStack[idx];
  historyIndex=idx;
  slides=[...document.querySelectorAll('.sl')];
  show(Math.min(cur, slides.length-1));
  updateUndoRedoBtns();
  restoringHistory=false;
}
/* feature 16/23: autosave draft to localStorage */
const AUTOSAVE_KEY='postConstructorAutosaveDraft';
function serializeProject(){
  const proj={
    title:document.getElementById('inTitle').value,
    highlightColor:document.getElementById('inHighlightColor').value,
    eyebrow:document.getElementById('inEyebrow').value,
    sub:document.getElementById('inSub').value,
    handle:document.getElementById('inHandle').value,
    phrases:document.getElementById('inPhrases').value,
    tpl:currentTpl, palette:palette,
    settings:{}
  };
  ['radiusCtl','shadowCtl','lineHeightCtl','paddingCtl','grainCtl','fontHead','fontTrans','ratioSel',
   'numStyle','orderSel','covTextSize','tsize'].forEach(id=>{ const el=document.getElementById(id); if(el) proj.settings[id]=el.value; });
  ['showPg','showHandle','showTag','showCover','showFollow','showCta'].forEach(id=>{ const el=document.getElementById(id); if(el) proj.settings[id]=el.checked; });
  return proj;
}
function applyProject(proj){
  document.getElementById('inTitle').value=proj.title||'';
  document.getElementById('inHighlightColor').value=proj.highlightColor||'#2E2A20';
  document.getElementById('inEyebrow').value=proj.eyebrow||'';
  document.getElementById('inSub').value=proj.sub||'';
  document.getElementById('inHandle').value=proj.handle||'';
  document.getElementById('inPhrases').value=proj.phrases||'';
  if(proj.palette){ palette=proj.palette; renderSwatches(); }
  if(proj.tpl){ currentTpl=proj.tpl; document.getElementById('tplSelect').value=proj.tpl; }
  if(proj.settings){
    Object.entries(proj.settings).forEach(([k,v])=>{
      const el=document.getElementById(k); if(!el) return;
      if(el.type==='checkbox') el.checked=v; else el.value=v;
    });
  }
}
let autosaveTimer=null;
function scheduleAutosave(){
  if(!built) return;
  clearTimeout(autosaveTimer);
  autosaveTimer=setTimeout(()=>{
    try{
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(serializeProject()));
      const h=document.getElementById('autosaveHint');
      if(h) h.textContent='Черновик автосохранён '+new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'});
    }catch(e){}
  }, 1200);
}
document.getElementById('inTitle').addEventListener('input', scheduleAutosave);
document.getElementById('inEyebrow').addEventListener('input', scheduleAutosave);
document.getElementById('inSub').addEventListener('input', scheduleAutosave);
document.getElementById('inHandle').addEventListener('input', scheduleAutosave);
document.getElementById('inPhrases').addEventListener('input', scheduleAutosave);
document.getElementById('tplSelect').addEventListener('change', scheduleAutosave);

(function checkDraftOnLoad(){
  try{
    const raw=localStorage.getItem(AUTOSAVE_KEY);
    if(!raw) return;
    document.getElementById('draftBanner').style.display='block';
    document.getElementById('restoreDraftBtn').onclick=()=>{
      try{
        applyProject(JSON.parse(raw));
        applyAppearance();
        document.getElementById('draftBanner').style.display='none';
      }catch(e){}
    };
    document.getElementById('dismissDraftBtn').onclick=()=>{
      localStorage.removeItem(AUTOSAVE_KEY);
      document.getElementById('draftBanner').style.display='none';
    };
  }catch(e){}
})();

document.getElementById('undoBtn').onclick=()=>restoreHistory(historyIndex-1);
document.getElementById('redoBtn').onclick=()=>restoreHistory(historyIndex+1);
document.addEventListener('keydown', e=>{
  if((e.ctrlKey||e.metaKey) && !e.shiftKey && e.key.toLowerCase()==='z'){ e.preventDefault(); restoreHistory(historyIndex-1); }
  else if((e.ctrlKey||e.metaKey) && (e.key.toLowerCase()==='y' || (e.shiftKey && e.key.toLowerCase()==='z'))){ e.preventDefault(); restoreHistory(historyIndex+1); }
});
document.addEventListener('blur', (e)=>{
  if(e.target && e.target.hasAttribute && e.target.hasAttribute('contenteditable')) pushHistory();
}, true);
document.addEventListener('pointerup', ()=>{ if(moveMode) setTimeout(pushHistory, 30); });

/* feature 14/23: copy block positions from current slide to all slides */
document.getElementById('copyStyleToAll').onclick=()=>{
  if(!built) return;
  const active=document.querySelector('.sl.show');
  if(!active) return;
  const srcBlocks=[...active.querySelectorAll('.in > *')];
  if(srcBlocks.length===0 || !srcBlocks.some(b=>b.style.top)){ document.getElementById('status').textContent='На этом слайде нет перемещённых блоков (включи "Двигать блоки" и подвинь что-нибудь).'; return; }
  let applied=0;
  document.querySelectorAll('.sl').forEach(sl=>{
    if(sl===active) return;
    const tgtBlocks=[...sl.querySelectorAll('.in > *')];
    srcBlocks.forEach((sb,i)=>{
      const tb=tgtBlocks[i]; if(!tb) return;
      if(sb.style.top) tb.style.top=sb.style.top;
      if(sb.style.left) tb.style.left=sb.style.left;
      if(sb.style.right) tb.style.right=sb.style.right;
      if(sb.classList.contains('movable')) tb.classList.add('movable');
    });
    applied++;
  });
  document.getElementById('status').textContent='Позиции блоков скопированы на '+applied+' слайдов.';
};

document.getElementById('shuffleAccents').onclick=()=>{
  const t=palette.a0; palette.a0=palette.a1; palette.a1=t;
  const t2=palette.a2; palette.a2=palette.a3; palette.a3=t2;
  renderSwatches(); applyPalette();
};

document.getElementById('saveProject').onclick=()=>{
  const proj={
    title:document.getElementById('inTitle').value,
    highlightColor:document.getElementById('inHighlightColor').value,
    eyebrow:document.getElementById('inEyebrow').value,
    sub:document.getElementById('inSub').value,
    handle:document.getElementById('inHandle').value,
    phrases:document.getElementById('inPhrases').value,
    tpl:currentTpl, palette:palette,
    settings:{}
  };
  ['radiusCtl','shadowCtl','lineHeightCtl','paddingCtl','grainCtl','fontHead','fontTrans','ratioSel',
   'numStyle','orderSel','covTextSize','tsize'].forEach(id=>{ proj.settings[id]=document.getElementById(id).value; });
  ['showPg','showHandle','showTag','showCover','showFollow','showCta'].forEach(id=>{ proj.settings[id]=document.getElementById(id).checked; });
  const blob=new Blob([JSON.stringify(proj,null,2)],{type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='post-project.json';
  document.body.appendChild(a); a.click(); a.remove();
  document.getElementById('status').textContent='Проект сохранён.';
};
document.getElementById('loadProject').onclick=()=>document.getElementById('projectFileInput').click();
document.getElementById('projectFileInput').onchange=(e)=>{
  const f=e.target.files[0]; if(!f) return;
  const r=new FileReader();
  r.onload=()=>{
    try{
      const proj=JSON.parse(r.result);
      document.getElementById('inTitle').value=proj.title||'';
      document.getElementById('inHighlightColor').value=proj.highlightColor||'#2E2A20';
      document.getElementById('inEyebrow').value=proj.eyebrow||'';
      document.getElementById('inSub').value=proj.sub||'';
      document.getElementById('inHandle').value=proj.handle||'';
      document.getElementById('inPhrases').value=proj.phrases||'';
      if(proj.palette){ palette=proj.palette; renderSwatches(); }
      if(proj.tpl){ currentTpl=proj.tpl; document.getElementById('tplSelect').value=proj.tpl; }
      if(proj.settings){
        Object.entries(proj.settings).forEach(([k,v])=>{
          const el=document.getElementById(k); if(!el) return;
          if(el.type==='checkbox') el.checked=v; else el.value=v;
        });
      }
      applyAppearance(); rebuildPreview();
      document.getElementById('status').textContent='Проект загружен.';
    }catch(err){ document.getElementById('status').textContent='Не удалось прочитать файл.'; }
  };
  r.readAsText(f);
};

document.getElementById('copyCaption').onclick=()=>{
  const d=parseContent();
  let cap=d.title.replace(/\*\*/g,'')+'\\n\\n';
  d.phrases.forEach((p,i)=>{ cap+=(i+1)+'. '+p.en+' — '+p.am+'\\n'; });
  cap+='\\n'+d.handle;
  navigator.clipboard.writeText(cap).then(
    ()=>{document.getElementById('status').textContent='Подпись скопирована.';},
    ()=>{document.getElementById('status').textContent='Не удалось скопировать.';}
  );
};

document.getElementById('buildBtn').onclick=()=>{
  applyPalette();
  applyAppearance();
  const data = parseContent();
  slides = buildSlides(data, currentTpl);
  built = true;
  document.getElementById('previewArea').style.display='flex';
  const ph=document.getElementById('previewPlaceholder'); if(ph) ph.style.display='none';
  renderPlayer();
  historyStack=[]; historyIndex=-1; pushHistory();
};
function rebuildPreview(){
  applyPalette();
  applyAppearance();
  const data = parseContent();
  slides = buildSlides(data, currentTpl);
  renderPlayer();
}

const fileInput=document.getElementById('fileInput');
document.addEventListener('click',(e)=>{
  if(e.target && e.target.id==='avaImg'){ fileInput.click(); }
});
fileInput.onchange=()=>{
  const f=fileInput.files[0]; if(!f) return;
  const reader=new FileReader();
  reader.onload=()=>{
    const av=document.getElementById('avaImg');
    if(av) av.style.backgroundImage='url('+reader.result+')';
  };
  reader.readAsDataURL(f);
};

/* ---------------- export ---------------- */
function svgURL(el){
  const clone=el.cloneNode(true);
  clone.classList.add('show');
  clone.querySelectorAll('[contenteditable]').forEach(n=>n.removeAttribute('contenteditable'));
  clone.querySelectorAll('.movable').forEach(n=>n.classList.remove('movable','dragging'));
  const NS='http://www.w3.org/1999/xhtml';
  const holder=document.createElementNS(NS,'div');
  const st=document.createElementNS(NS,'style');
  const customFace = customFontDataURL ? "@font-face{font-family:'CustomUserFont';src:url("+customFontDataURL+") format('"+customFontFormat+"')}" : '';
  st.textContent=document.getElementById('fontfaces').textContent+customFace+
    document.getElementById('tplcss').textContent+
    (document.getElementById('paletteVars')?document.getElementById('paletteVars').textContent:'')+
    (document.getElementById('appearanceVars')?document.getElementById('appearanceVars').textContent:'')+
    ':root{--fs:'+(document.getElementById('tsize').value/100).toFixed(2)+';--covfs:'+(document.getElementById('covTextSize').value/100).toFixed(2)+'}';
  holder.className='tpl-'+currentTpl;
  holder.appendChild(st);holder.appendChild(clone);
  const body=new XMLSerializer().serializeToString(holder);
  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="'+SLIDE_W+'" height="'+SLIDE_H+'">'+
    '<foreignObject x="0" y="0" width="'+SLIDE_W+'" height="'+SLIDE_H+'">'+body+'</foreignObject></svg>');
}
function renderToCanvas(el){
  return new Promise((resolve,reject)=>{
    const img=new Image();
    img.onload=()=>{
      const c=document.createElement('canvas');c.width=SLIDE_W;c.height=SLIDE_H;
      const x=c.getContext('2d');
      x.fillStyle=palette.bg;x.fillRect(0,0,SLIDE_W,SLIDE_H);x.drawImage(img,0,0);
      resolve(c);
    };
    img.onerror=reject;
    img.src=svgURL(el);
  });
}
document.getElementById('png').onclick=async()=>{
  const st=document.getElementById('status');st.textContent='Готовлю PNG…';
  try{
    const els=[...document.querySelectorAll('.sl')];
    const c=await renderToCanvas(els[cur]);
    const u=c.toDataURL('image/png');
    const o=document.getElementById('outimg');o.src=u;o.style.display='block';
    const a=document.getElementById('dl');a.href=u;a.download='slide-'+(cur+1)+'.png';a.style.display='inline-block';
    st.textContent='Готово. Скачай кнопкой или зажми картинку.';
  }catch(e){ st.textContent='Не вышло. Сделай скриншот слайда.'; }
};
document.getElementById('zipAll').onclick=async()=>{
  const st=document.getElementById('status');
  if(typeof JSZip==='undefined'){ st.textContent='Архиватор не загрузился.'; return; }
  const els=[...document.querySelectorAll('.sl')];
  st.textContent='Собираю все слайды… 0/'+els.length;
  const zip=new JSZip();
  for(let i=0;i<els.length;i++){
    try{
      const c=await renderToCanvas(els[i]);
      const blob=await new Promise(res=>c.toBlob(res,'image/png'));
      zip.file(String(i+1).padStart(2,'0')+'-slide.png', blob);
      st.textContent='Собираю все слайды… '+(i+1)+'/'+els.length;
    }catch(e){}
  }
  const content=await zip.generateAsync({type:'blob'});
  const url=URL.createObjectURL(content);
  const a=document.createElement('a');a.href=url;a.download='post.zip';document.body.appendChild(a);a.click();a.remove();
  st.textContent='Готово. Архив скачан.';
};
</script>
</body></html>"""
    template = template.replace('__JSZIP__', JSZIP_SRC)
    template = template.replace('__QRLIB__', QR_SRC)
    template = template.replace('__FONTFACES__', FONT_FACES)
    template = template.replace('__TPLCSS__', TEMPLATE_CSS)
    template = template.replace('__UICSS__', UI_CSS)
    template = template.replace('__AVA__', AVA)
    return template

html = make_html()
pathlib.Path('/home/claude/repo/index.html').write_text(html, encoding='utf-8')
pathlib.Path('/mnt/user-data/outputs/post-constructor.html').write_text(html, encoding='utf-8')
print('bytes', len(html))
