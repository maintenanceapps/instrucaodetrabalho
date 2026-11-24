// Instrucao de Trabalho - funciona sem internet depois da primeira abertura
const CACHE = "instrucao-trabalho-v3";
const ARQUIVOS = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./bib/catalogo.json"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  // fotos da biblioteca nao mudam: usa a guardada no aparelho e so baixa na primeira vez
  if (/\/bib\/[^/]+\.jpg$/.test(new URL(e.request.url).pathname)) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(n => {
      if (n && n.ok) { const copia = n.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); }
      return n;
    })));
    return;
  }
  // o resto: com internet pega a versao nova e guarda; sem internet usa a guardada
  e.respondWith(fetch(e.request, {cache: "no-cache"}).then(r => {
    if (r && r.ok) { const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); }
    return r;
  }).catch(() => caches.match(e.request, {ignoreSearch: true}).then(r => r || caches.match("./index.html"))));
});
