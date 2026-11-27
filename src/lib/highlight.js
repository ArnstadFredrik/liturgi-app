import Prism from 'prismjs';
import 'prismjs/components/prism-markup.js';
import 'prismjs/components/prism-markup-templating.js';
import 'prismjs/components/prism-ejs.js';
import 'prismjs/components/prism-markdown.js';
import 'prismjs/components/prism-javascript.js';
import 'prismjs/components/prism-json.js';
import 'prismjs/components/prism-css.js';
import 'prismjs/components/prism-bash.js';
import 'prismjs/components/prism-yaml.js';

/** Kodeutheving for appen (PrismJS — én pakke for alle kodespråkene:
 *  EJS-maler, markdown, javascript, json, css og bash-skal-kommandoer).
 *  Returnerer HTML-streng med <span class="token ..."> — fargene settes i
 *  app.css (.token-* / Prism-token-klassene), temaet følger appens palett.
 *  Brukes av mal-redigeringen (EJS-overlaget), og kan brukes til kode-
 *  eksemplene i h\u00e5ndboken og andre fremtidige tekstfelt. */

const SPRAK = {
	ejs: 'ejs',
	markdown: 'markdown',
	md: 'markdown',
	javascript: 'javascript',
	js: 'javascript',
	json: 'json',
	css: 'css',
	bash: 'bash'
};

/** Uthev `kode` i sprket `sprak` (f.eks. 'ejs'). Feiler aldri: ved ukjent
 *  sprk eller Prism-feil returneres escaped tekst uten farger. */
export function uthev(kode, sprak) {
	const sprakNavn = SPRAK[sprak] ?? sprak;
	const grammatikk = Prism.languages[sprakNavn];
	if (!grammatikk) return escapeHtml(String(kode ?? ''));
	try {
		// markdown med frontmatter: vildedelen utheves som yaml
		if (sprakNavn === 'markdown') {
			const fm = /^---\n([\s\S]*?)\n---(?:\n|$)/.exec(String(kode ?? ''));
			if (fm && Prism.languages.yaml) {
				return (
					'<span class="token frontmatter"><span class="token punctuation">---</span>\n'
					+ Prism.highlight(fm[1], Prism.languages.yaml, 'yaml')
					+ '\n<span class="token punctuation">---</span>\n</span>'
					+ Prism.highlight(String(kode).slice(fm[0].length), grammatikk, 'markdown')
				);
			}
		}
		return Prism.highlight(String(kode ?? ''), grammatikk, sprakNavn);
	} catch {
		return escapeHtml(String(kode ?? ''));
	}
}

/** Sprkene Prism er kvifor med  her (for dokumentasjon og fremtidige UI). */
export function uthevSprak() {
	return Object.keys(SPRAK);
}

function escapeHtml(s) {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
