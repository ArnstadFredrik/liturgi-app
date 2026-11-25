/**
 * Brukerhåndbok: dokumentasjonen (docs/*.md) konvertert til HTML med pandoc.
 * HTML-en genereres ved build (scripts/handbok-html.mjs, se prebuild i
 * package.json) og er commit-et, slik at appen fungerer offline uten pandoc.
 */
import { brukerhandbokHtml, apiHtml, limal_formatHtml } from './generated/handbok-html.js';

/** Skjermbilder i docs/bilder/: vite pakker dem inn, s src-ene peker riktig i appen. */
const bilder = import.meta.glob('../assets/bilder/*', { eager: true, query: '?url', import: 'default' });
function byttBildeSrcer(html) {
	// pandoc-htmlen har relative src-er (bilder/xxx.png) - map dem til vite-asset-URL-er
	return html.replace(/(<img[^>]+src=")bilder\/([^"]+)(")/g, (m, a, fil, b) => {
		const nk = Object.keys(bilder).find((k) => k.endsWith('/' + fil));
		return nk ? a + bilder[nk] + b : m;
	});
}

/** Innholdsfortegnelsen: alle dokumenter med tittel og ferdig HTML. */
export const handbokDokumenter = [
	{ id: 'brukerhandbok', tittel: 'Brukerhåndbok', html: byttBildeSrcer(brukerhandbokHtml) },
	{ id: 'api', tittel: 'Utviklerdokumentasjon', html: byttBildeSrcer(apiHtml) },
	{ id: 'limal-format', tittel: 'Limal-format', html: byttBildeSrcer(limal_formatHtml) },
];
