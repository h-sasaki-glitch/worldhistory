/**
 * Web 書き出し（dist/）を、JS をインライン化した単一 HTML にまとめる。
 * 配信先のパス構成に依存しないデモ用ページを作るためのもの。
 * 使い方: npm run export:web && node scripts/build-demo.js
 */
const fs = require('fs');
const path = require('path');

const dist = path.join(__dirname, '..', 'dist');
const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const src = html.match(/<script src="([^"]+)"/)[1];
const js = fs.readFileSync(path.join(dist, src), 'utf8').replace(/<\/script/gi, '<\\/script');

const page = `<title>EPOCH Mesopotamia</title>
<style>
  :root { color-scheme: dark; background: #050406; }
  html, body { height: 100%; }
  body { overflow: hidden; background: #050406; color: #e9dcc0; }
  #root { display: flex; height: 100%; flex: 1; }
</style>
<div id="root"></div>
<script>
try { if (!location.pathname.startsWith('/history')) history.replaceState(null, '', '/history'); } catch (e) {}
</script>
<script>${js}</script>
`;
const out = path.join(dist, 'demo.html');
fs.writeFileSync(out, page);
console.log('wrote', out, (page.length / 1024 / 1024).toFixed(2) + 'MB');
