// Uso: node componer.js <foto_cuadrada.png> <salida.png> <rotuloIzq> <rotuloDer> <pregunta> [palabraResaltada]
const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path');
const [foto, salida, izq, der, pregunta, resalta] = process.argv.slice(2);
const b64 = fs.readFileSync(foto).toString('base64');
const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
let q = esc(pregunta);
if (resalta) q = q.replace(esc(resalta), `<span class="hl">${esc(resalta)}</span>`);
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1350px;background:#FAF8F6;font-family:'Inter','Inter Display',sans-serif;color:#141414;position:relative}
.labels{position:absolute;top:44px;left:40px;width:1000px;display:flex}
.labels div{flex:1;text-align:center;font-family:'Inter Display','Inter';font-weight:700;font-size:46px;letter-spacing:1px}
.photo{position:absolute;top:130px;left:40px;width:1000px;height:1000px;border-radius:28px;overflow:hidden}
.photo img{width:100%;height:100%;display:block}
.q{position:absolute;top:1160px;left:70px;width:940px;text-align:center;font-family:'Inter Display','Inter';font-weight:700;font-size:50px;line-height:1.18;letter-spacing:-0.5px;text-wrap:balance}
.hl{color:#F2594B}
</style></head><body>
<div class="labels"><div>${esc(izq)}</div><div>${esc(der)}</div></div>
<div class="photo"><img src="data:image/png;base64,${b64}"></div>
<div class="q">${q}</div>
</body></html>`;
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1350}});
await p.setContent(html,{waitUntil:'load'});await p.screenshot({path:salida});await b.close();console.log('ok',salida)})();
