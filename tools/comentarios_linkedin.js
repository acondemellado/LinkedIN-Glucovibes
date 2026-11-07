// Pegar en javascript_tool sobre la página de un post (…/feed/update/urn:li:…). Devuelve JSON con los hilos de comentarios.
// Antes: espera 4-5 s a que cargue. Expande «más comentarios» y «respuestas anteriores» y devuelve, por hilo:
// autor, cargo, hace, texto, respuestas [{autor, esAutor, texto}], pendiente (true si nadie del post ha contestado después del último mensaje ajeno).
(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  for (let i = 0; i < 8; i++) {
    const more = [...document.querySelectorAll('button')].filter(b => /\d+ comments?|\d+ comentarios?|load more comments|más comentarios|see previous replies|respuestas anteriores|load previous replies|ver más respuestas|\d+ repl(y|ies)|\d+ respuestas?/i.test((b.innerText || '') + ' ' + (b.getAttribute('aria-label') || '')));
    if (!more.length) break;
    more.forEach(b => b.click());
    await sleep(1800);
  }
  const all = [...document.querySelectorAll('article[class*="comments-comment-entity"]')];
  const parse = e => {
    const lines = e.innerText.split('\n').map(s => s.trim()).filter(Boolean);
    const esAutor = lines.slice(0, 6).includes('Author') || lines.slice(0, 6).includes('Autor');
    const tIdx = lines.findIndex(l => /^\d+\s?(m|h|d|w|mo|y|min|sem|a)$/i.test(l) || /^(hace|edited|editado)/i.test(l));
    const txt = e.querySelector('.comments-comment-item__main-content, [class*="comment-item__main-content"], .update-components-text');
    return { id: e.getAttribute('data-id'), autor: lines[0], esAutor, hace: tIdx >= 0 ? lines[tIdx] : '', texto: txt ? txt.innerText.trim() : lines.slice(tIdx + 1, tIdx + 4).join(' ') };
  };
  const hilos = [];
  for (const e of all) {
    if (/--reply/.test(e.className)) continue;
    const c = parse(e);
    const reps = [...e.querySelectorAll('article[class*="comments-comment-entity--reply"]')].map(parse);
    const thread = [c, ...reps];
    const lastForeign = thread.map(x => !x.esAutor).lastIndexOf(true);
    const pendiente = !c.esAutor && !thread.slice(lastForeign + 1).some(x => x.esAutor);
    hilos.push({ ...c, respuestas: reps, pendiente });
  }
  return JSON.stringify(hilos);
})()
