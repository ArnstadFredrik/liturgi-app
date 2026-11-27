import Prism from 'prismjs';
import 'prismjs/components/prism-markup.js';
import 'prismjs/components/prism-markup-templating.js';
import 'prismjs/components/prism-ejs.js';
import 'prismjs/components/prism-markdown.js';
import 'prismjs/components/prism-javascript.js';
import 'prismjs/components/prism-json.js';
import 'prismjs/components/prism-css.js';
import 'prismjs/components/prism-bash.js';

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
	const grammatikk = Prism.languages[SPRAK[sprak] ?? sprak];
	if (!grammatikk) return escapeHtml(String(kode ?? ''));
	try {
		return Prism.highlight(String(kode ?? ''), grammatikk, SPRAK[sprak] ?? sprak);
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
