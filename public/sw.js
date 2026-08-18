const CACHE_NAME = "nexora-ai-v2";

const APP_FILES = [
	"/",
	"/index.html",
	"/chat.js",
	"/manifest.json"
];

// ============================================================
// INSTALAÇÃO
// ============================================================

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(APP_FILES);
		})
	);

	// Ativa a nova versão imediatamente
	self.skipWaiting();
});

// ============================================================
// ATIVAÇÃO
// ============================================================

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

	// Faz a nova versão assumir as páginas abertas
	self.clients.claim();
});

// ============================================================
// FETCH
// ============================================================

self.addEventListener("fetch", (event) => {
	const request = event.request;

	// Só tratamos pedidos GET
	if (request.method !== "GET") {
		return;
	}

	const url = new URL(request.url);

	// A API da Nexora continua usando a internet.
	if (url.pathname.startsWith("/api/")) {
		return;
	}

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
