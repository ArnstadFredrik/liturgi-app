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
		if (m[3] || m[4]) cls = 'hl-b'; // __ / _
		else if (m[5]) cls = 'hl-kode';
		else if (m[6]) cls = 'hl-strike';
		else if (m[7]) cls = 'hl-mark';
		else if (m[8]) cls = 'hl-sub';
		else if (m[9]) cls = 'hl-rol';
		else if (m[10] || m[11]) cls = 'hl-chip';
		else if (m[12] || m[13]) cls = 'hl-lenke';
		else if (m[14]) cls = 'hl-lenke';
		else if (m[15]) cls = 'hl-fnref';
		else if (/^\*[^*]+\*$/.test(t)) cls = 'hl-i';
		ut += `<span class="${cls}">${esc(t)}</span>`;
		sist = m.index + t.length;
	}
	ut += esc(linje.slice(sist));
	return ut;
}

/** Uthev hele teksten — grunnleggende + utvidet markdown. */
export function uthev(tekst) {
	const linjer = (tekst ?? '').split('\n');
	const ut = [];
	let i = 0;
	while (i < linjer.length) {
		const linje = linjer[i];
		// gjerdet kodeblokk
		const gjerd = linje.match(/^\s{0,3}(```+|~~~+)\s*(\w*)\s*$/);
		if (gjerd) {
			const slutt = gjerd[1][0] === '`' ? '```' : '~~~';
			ut.push(`<span class="hl-mkt">${esc(linje)}</span>`);
			let j = i + 1;
			while (j < linjer.length && !new RegExp('^\\s{0,3}' + slutt).test(linjer[j])) {
				ut.push(`<span class="hl-kodelinje">${esc(linjer[j])}</span>`);
				j++;
			}
			if (j < linjer.length) { ut.push(`<span class="hl-mkt">${esc(linjer[j])}</span>`); j++; }
			i = j;
			continue;
		}
		// tabellrader
		if (/^\s*\|/.test(linje)) { ut.push(`<span class="hl-tabell">${esc(linje)}</span>`); i++; continue; }
		// hr
		if (/^\s{0,3}(?:-\s*){3,}$|^\s{0,3}(?:\*\s*){3,}$|^\s{0,3}(?:_\s*){3,}$/.test(linje)) {
			ut.push(`<span class="hl-hr">${esc(linje)}</span>`); i++; continue;
		}
		// setext (tekst + ===/---)
		const neste = linjer[i + 1] ?? '';
		if (linje.trim() && /^\s{0,3}=+\s*$/.test(neste)) { ut.push(`<span class="hl-h">${esc(linje)}</span><span class="hl-mkt">${esc(neste)}</span>`); i += 2; continue; }
		if (linje.trim() && /^\s{0,3}-+\s*$/.test(neste) && !LISTE.test(linje)) { ut.push(`<span class="hl-h hl-h2t">${esc(linje)}</span><span class="hl-mkt">${esc(neste)}</span>`); i += 2; continue; }
		// ATX-overskrift
		if (/^#{1,6}\s/.test(linje)) { ut.push(`<span class="hl-h">${esc(linje)}</span>`); i++; continue; }
		// sitat
		if (/^\s*>/.test(linje)) { ut.push(`<span class="hl-q">${esc(linje)}</span>`); i++; continue; }
		// fotnotedefinisjon
		if (/^\[\^[^\]]+\]:/.test(linje)) { ut.push(`<span class="hl-fn">${esc(linje)}</span>`); i++; continue; }
		// liste (inkl. oppgavebokser)
		const bl = linje.match(/^(\s*)(?:[-*+]|\d+[.)])\s+(.*)$/);
		if (bl) {
			const oppg = bl[2].match(/^\[([ xX])\]\s*(.*)$/);
			const indre = oppg
				? `<span class="hl-chip">[${oppg[1] === ' ' ? ' ' : 'x'}]</span> ${uthevLinje(oppg[2])}`
				: uthevLinje(bl[2]);
			ut.push(`<span class="hl-mkt">${esc(bl[1] + bl[0].slice(bl[1].length).split(' ')[0])}</span>${indre}`);
			i++;
			continue;
		}
		ut.push(uthevLinje(linje));
		i++;
	}
	return ut.join('\n');
}
