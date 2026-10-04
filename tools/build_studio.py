"""Build the installable app (studio/index.html) from konvert-studio.html.

The artifact version (konvert-studio.html) stays a plain single file. The app version adds the
web-app manifest, home-screen icons, safe-area padding for iPad and the offline service worker.
Run after every change:  python3 tools/build_studio.py
"""
import pathlib, re, sys

root = pathlib.Path(__file__).resolve().parent.parent
src = (root / 'konvert-studio.html').read_text(encoding='utf-8')

HEAD = '''<link rel="manifest" href="manifest.webmanifest">
<meta name="theme-color" content="#2d8cff">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Конверт Студия">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="application-name" content="Конверт Студия">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="icons/favicon-32.png">
<link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">
<style id="appShell">
.app{padding:max(12px,env(safe-area-inset-top)) max(12px,env(safe-area-inset-right)) max(12px,env(safe-area-inset-bottom)) max(12px,env(safe-area-inset-left))}
@media (display-mode: standalone){ html,body{overscroll-behavior:none} }
</style>
'''

SW = '''<script>
/* installable app: offline cache and update notice */
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then(reg => {
      reg.addEventListener('updatefound', () => {
        const w = reg.installing; if (!w) return;
        w.addEventListener('statechange', () => {
          if (w.state === 'activated' && navigator.serviceWorker.controller && typeof toast === 'function') toast('Приложение обновлено. Новая версия откроется при следующем запуске.');
        });
      });
    }).catch(() => {});
  });
}
</script>
'''

out, n = re.subn(r'<meta name="viewport" content="[^"]*">', '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">', src, count=1)
if n != 1: sys.exit('viewport meta not found')
i = out.index('<title>')
out = out[:i] + HEAD + out[i:]
j = out.rindex('</body>')
out = out[:j] + SW + out[j:]
(root / 'studio' / 'index.html').write_text(out, encoding='utf-8')
print('studio/index.html', len(out.encode('utf-8')), 'bytes')
