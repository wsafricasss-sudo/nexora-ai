const CACHE_NAME = "nexora-ai-v1";

const APP_FILES = [
	"/",
	"/index.html",
	"/chat.js",
	"/manifest.json"
];

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(APP_FILES);
		})
	);

	self.skipWaiting();
});

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

	self.clients.claim();
});

self.addEventListener("fetch", (event) => {
	const request = event.request;

	if (request.method !== "GET") {
		return;
	}

	// A API do chat deve continuar indo para a internet.
	if (new URL(request.url).pathname.startsWith("/api/")) {
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
					const responseClone = response.clone();

					caches.open(CACHE_NAME).then((cache) => {
						cache.put(request, responseClone);
					});
				}

				return response;
			})
			.catch(() => {
				return caches.match(request);
			})
	);
});
