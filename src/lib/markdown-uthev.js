/**
 * Markdown-syntaxutheving for kildemodus og hybrid-linjer.
 * Returnerer HTML med span-klasser — innholdet escapes alltid.
 * Klasser: hl-h (overskrift) hl-q (sitat) hl-tbl (tabell) hl-mkt (listemerke)
 *          hl-b (fet) hl-i (kursiv) hl-kode (kode) hl-chip (BIBELREF/FOTNOTE/@NOTAT)
 *          hl-rol ({{r}}-markører)
 */

function esc(s) {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const INLINE = /(\*\*[^*]+\*\*)|(\*[^*]+\*)|(`[^`]+`)|(\{\{r\}\}|\{\{\/r\}\})|((?:BIBELREF|FOTNOTE)\s*\|[^|\n]*\|)|(@NOTAT)/g;

/** Uthev én linje (uten linjenivå-reglene). */
function uthevLinje(linje) {
	let ut = '';
	let sist = 0;
	let m;
	INLINE.lastIndex = 0;
	while ((m = INLINE.exec(linje))) {
		ut += esc(linje.slice(sist, m.index));
		const t = m[0];
		let cls = 'hl-b';
		if (m[3]) cls = 'hl-kode';
		else if (m[4]) cls = 'hl-rol';
		else if (m[5] || m[6]) cls = 'hl-chip';
		else if (/^\*[^*]+\*$/.test(t)) cls = 'hl-i';
		ut += `<span class="${cls}">${esc(t)}</span>`;
		sist = m.index + t.length;
	}
	ut += esc(linje.slice(sist));
	return ut;
}

/** Uthev hele teksten — én rad per kilde-linje, joinet med \n. */
export function uthev(tekst) {
	return (tekst ?? '')
		.split('\n')
		.map((linje) => {
			if (/^#{1,6}\s/.test(linje)) return `<span class="hl-h">${esc(linje)}</span>`;
			if (/^\s*&gt;/.test(linje) || /^>\s?/.test(linje)) return `<span class="hl-q">${esc(linje)}</span>`;
			if (/^\s*\|/.test(linje)) return `<span class="hl-tbl">${esc(linje)}</span>`;
			const bm = linje.match(/^(\s*)(?:[-*+]\s|\d+\.\s)/);
			if (bm) return `<span class="hl-mkt">${esc(bm[0])}</span>` + uthevLinje(linje.slice(bm[0].length));
			return uthevLinje(linje);
		})
		.join('\n');
}
