const CACHE_NAME = "nexora-ai-v2";

const APP_FILES = [
	"/",
	"/index.html",
	"/chat.js",
	"/manifest.json"
];

/* ============================================================
   INSTALAÇÃO
============================================================ */

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(APP_FILES);
		})
	);

	// Ativa imediatamente a nova versão
	self.skipWaiting();
});


/* ============================================================
   ATIVAÇÃO
============================================================ */

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames
					.filter((name) => name !== CACHE_NAME)
					.map((name) => caches.delete(name))
			);
		})
	);

	// Assume o controle imediatamente
	self.clients.claim();
});


/* ============================================================
   FETCH
============================================================ */

self.addEventListener("fetch", (event) => {
	const request = event.request;

	// Só tratar GET
	if (request.method !== "GET") {
		return;
	}

	const url = new URL(request.url);

	// A API continua sempre pela internet
	if (url.pathname.startsWith("/api/")) {
		return;
	}


	/* ========================================================
	   HTML E JAVASCRIPT
	   
	   Sempre tenta buscar a versão nova primeiro.
	   Isso evita ficar preso numa versão antiga.
	======================================================== */

	if (
		request.destination === "document" ||
		request.destination === "script"
	) {
		event.respondWith(
			fetch(request)
				.then((response) => {

					if (
						response &&
						response.status === 200
					) {
						const copy = response.clone();

						caches.open(CACHE_NAME).then((cache) => {
							cache.put(request, copy);
						});
					}

					return response;
				})
				.catch(() => {
					return caches.match(request);
				})
		);

		return;
	}


	/* ========================================================
	   OUTROS ARQUIVOS
	   
	   Primeiro tenta a internet.
	   Se não houver internet, usa o cache.
	======================================================== */

	event.respondWith(
		fetch(request)
			.then((response) => {

				if (
					response &&
					response.status === 200 &&
					response.type === "basic"
				) {
					const copy = response.clone();

					caches.open(CACHE_NAME).then((cache) => {
						cache.put(request, copy);
					});
				}

				return response;
			})
			.catch(() => {
				return caches.match(request);
			})
	);
});
