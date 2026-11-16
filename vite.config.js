import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

/** Proxy for bibel.no (kirkeårets tekster) – unngår CORS i nettleseren. */
function bibelProxy() {
	const handler = async (req, res, next) => {
		if (!req.url?.startsWith('/api/bibel/')) return next();
		try {
			const target = 'https://bibel.no' + req.url.replace('/api/bibel', '/nettbibelen');
			const r = await fetch(target, { headers: { 'user-agent': 'Mozilla/5.0 (liturgi-app)' } });
			res.setHeader('content-type', r.headers.get('content-type') || 'text/html');
			res.end(await r.text());
		} catch {
			res.statusCode = 502;
			res.end('Klarte ikke hente fra bibel.no');
		}
	};
	return {
		name: 'bibel-proxy',
		configureServer(server) { server.middlewares.use(handler); },
		configurePreviewServer(server) { server.middlewares.use(handler); }
	};
}

export default defineConfig({
	plugins: [sveltekit(), bibelProxy()],
	// DEV-modul-flagg: __DEV_MODE__ = true KUN i «npm run build:dev» / «npm run electron:dev»
	// (VITE_DEV_MODE=1). Publiserte bygg (npm run build / app:mac / CI) har den aldri,
	// så dev-verktøyene (f.eks. malverktøyet) tree-shakes ut av produksjonsbyggget.
	define: {
		__DEV_MODE__: JSON.stringify(process.env.VITE_DEV_MODE === '1')
	}
});
