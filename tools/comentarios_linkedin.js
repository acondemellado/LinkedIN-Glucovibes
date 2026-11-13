// Pegar en javascript_tool sobre la página de un post (…/feed/update/urn:li:…). Devuelve JSON con los hilos de comentarios.
// Versión 13/11/2026: LinkedIn cambió el DOM (clases ofuscadas). Los comentarios son elementos [componentkey^="replaceableComment_"]
// en lista plana; las respuestas se distinguen por la sangría del avatar (img más a la derecha). Etiqueta «Author»/«Autor» = Alberto.
// Antes de ejecutar: haz scroll_to al botón «Comment» del post (los comentarios cargan al verse). Si la salida se trunca, pide solo los pendientes.
(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  await sleep(4000);
  for (let i = 0; i < 4; i++) { window.scrollBy(0, 3000); await sleep(600); }
  const re = /load more comments|more comments|más comentarios|see previous replies|previous replies|respuestas anteriores|ver más respuestas|view more replies|\b\d+ repl(y|ies)\b|\b\d+ respuestas?\b|ver respuestas/i;
  for (let i = 0; i < 10; i++) {
    const more = [...document.querySelectorAll('button, [role="button"]')].filter(b => re.test(((b.innerText || '') + ' ' + (b.getAttribute('aria-label') || '')).trim()) && !b.dataset.cx);
    if (!more.length) break;
    more.forEach(b => { b.dataset.cx = 1; b.click(); });
    await sleep(2000);
  }
  const els = [...document.querySelectorAll('[componentkey^="replaceableComment_"]')].filter((e, _, a) => !a.some(o => o !== e && o.contains(e)));
  const lefts = els.map(e => { const im = e.querySelector('img') || e.querySelector('a') || e; return Math.round(im.getBoundingClientRect().left); });
  const minL = Math.min(...lefts);
  const clean = s => s.replace(/https?:\S+/g, '[link]').replace(/[=&?%]/g, ' ');
  const parse = (e, i) => {
    const lines = e.innerText.split('\n').map(s => s.trim()).filter(Boolean);
    const esAutor = lines.slice(0, 4).some(l => l === 'Author' || l === 'Autor');
    const tIdx = lines.findIndex(l => /^\d+\s?(m|h|d|w|mo|y|min|sem|a)$/i.test(l) || /^(hace|edited|editado)/i.test(l));
    let end = lines.findIndex((l, j) => j > tIdx && /^(Show translation|Ver traducción|See translation|Like|Me gusta|\d+ reactions?|\d+ reacci|Reply|Responder)$/i.test(l));
    if (end < 0) end = lines.length;
    return { autor: lines[0], esAutor, hace: tIdx >= 0 ? lines[tIdx] : '', texto: clean(lines.slice(tIdx + 1, end).join(' ')).slice(0, 600), reply: lefts[i] > minL + 10 };
  };
  const items = els.map(parse);
  const hilos = [];
  for (const it of items) {
    if (!it.reply || !hilos.length) hilos.push({ ...it, respuestas: [] });
    else hilos[hilos.length - 1].respuestas.push(it);
  }
  for (const h of hilos) {
    const thread = [h, ...h.respuestas];
    const lastForeign = thread.map(x => !x.esAutor).lastIndexOf(true);
    h.pendiente = lastForeign >= 0 && !thread.slice(lastForeign + 1).some(x => x.esAutor) && !(h.esAutor && lastForeign < 0);
  }
  return JSON.stringify({ total: items.length, hilos: hilos.map(h => ({ autor: h.autor, esAutor: h.esAutor, pendiente: h.pendiente, n: h.respuestas.length, r: h.respuestas.map(r => r.autor + (r.esAutor ? '*' : '')).join(',') })), pendientes: hilos.filter(h => h.pendiente) });
})()
