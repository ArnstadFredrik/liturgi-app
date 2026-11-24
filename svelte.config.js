import adapter from '@sveltejs/adapter-static';

/** GitHub Pages bygger med repo-understien (/liturgi-app/) — styres av
 *  GH_PAGES=1 i web-deploy-workflowen; mac/win/linux-byggene forblir på roten. */
const ghPages = process.env.GH_PAGES === '1';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({ fallback: 'index.html' }),
		prerender: {
			// ikoner/favicon ligger på roten i static/ og er allerede riktig
			// når Pages serverer /liturgi-app/ (static/ kopieres til roten av
			// utgaven) — henvisninger uten base er da gyldige
			handleHttpError: 'warn'
		},
		paths: ghPages ? { base: '/liturgi-app' } : {},
	}
};

export default config;
