/**
 * Full markdown-motor (markdownguide.org basic + extended syntax).
 * Brukes av prekenforberedelse-editoren (hybrid-blokker og uthev-highlight).
 *
 * mdParse(tekst) → { blokker: [{ html, fra, til, type }], fotnoter: html }
 *   — blokkene dekker linjeområdene [fra, til]; linjer utenfor blokker er
 *     vanlige avsnitt/tekstlinjer.
 * mdInline(t) — inline-markdown (fet/kursiv/kode/lenker/bilder/strike/highlight/
 *   sub/fotnoter/autolink/escaping) for én tekststreng.
 */

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Beskyttet kode (placeholder) slik at innholdet ikke parses videre. */
function mdInlineFull(t) {
	let s = esc(t);
	// backslash-escaped tegn (\* → literal *) beskyttes mot parsingen
	const escTegn = [];
	s = s.replace(/\\([\\`*_{}[\]()#+\-.!|~])/g, (m, c) => {
		escTegn.push(c);
		return '\u0001E' + (escTegn.length - 1) + '\u0001';
	});
	const koder = [];
	s = s.replace(/`([^`]+)`/g, (m, k) => {
		koder.push('<span class="md-kode">' + k + '</span>');
		return '\u0001K' + (koder.length - 1) + '\u0001';
	});
	// bilder før lenker
	s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;[^"]*&quot;)?\)/g, (m, alt, src) => `<img class="md-bilde" src="${src}" alt="${alt}">`);
	// lenker [tekst](url)
	s = s.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+&quot;[^"]*&quot;)?\)/g, (m, txt, url) => `<a class="md-lenke" href="${url}" target="_blank" rel="noopener">${txt}</a>`);
	// autolink <http://…> og bare URL-er
	s = s.replace(/&lt;(https?:\/\/[^&\s]+)&gt;/g, '<a class="md-lenke" href="$1">$1</a>');
	s = s.replace(/(^|[\s(])(https?:\/\/[^\s<&)]+)/g, '$1<a class="md-lenke" href="$2">$2</a>');
	// fet + kursiv (*** / ___), deretter fet (** / __), kursiv (* / _)
	s = s.replace(/\*\*\*([^*\n]+)\*\*\*/g, '<strong><em>$1</em></strong>');
	s = s.replace(/___([^_\n]+)___/g, '<strong><em>$1</em></strong>');
	s = s.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
	s = s.replace(/__([^_\n]+)__/g, '<strong>$1</strong>');
	s = s.replace(/(^|[^*\w])\*([^*\n]+)\*/g, '$1<em>$2</em>');
	s = s.replace(/(^|[^_\w])_([^_\n]+)_/g, '$1<em>$2</em>');
	// utvidet: strike, highlight, subscript
	s = s.replace(/~~([^~\n]+)~~/g, '<del>$1</del>');
	s = s.replace(/==([^=\n]+)==/g, '<mark>$1</mark>');
	s = s.replace(/(^|[^~\w])~([^~\n]+)~/g, '$1<sub>$2</sub>');
	// fotnotereferanser [^id]
	s = s.replace(/\[\^([^\]\s]+)\]/g, '<sup class="md-fotnote-ref">$1</sup>');
	// gjenopprett beskyttet kode og escapede tegn
	s = s.replace(/\u0001E(\d+)\u0001/g, (m, i) => escTegn[+i]);
	s = s.replace(/\u0001K(\d+)\u0001/g, (m, i) => koder[+i]);
	return s;
}

const HR_RE = /^\s{0,3}(?:-\s*){3,}$|^\s{0,3}(?:\*\s*){3,}$|^\s{0,3}(?:_\s*){3,}$/;
const SETEXT1_RE = /^\s{0,3}=+\s*$/;
const SETEXT2_RE = /^\s{0,3}-+\s*$/;
const LISTE_RE = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
const OPPGAVE_RE = /^\[([ xX])\]\s+(.*)$/;

/** Blokkparser: returnerer blokker med linjeområder + fotnoter. */
export function mdParse(tekst) {
	const linjer = (tekst ?? '').split('\n');
	const blokker = [];
	const fotnoter = [];
	let i = 0;

	const paragraf = (fra, til) => {
		const html = linjer.slice(fra, til + 1).map((l) => mdInlineFull(l.replace(/\s+$/, ''))).join('<br>');
		return `<p class="md-p">${html}</p>`;
	};

	while (i < linjer.length) {
		const linje = linjer[i];

		// tomt
		if (!linje.trim()) { i++; continue; }

		// gjerded kodeblokk ``` / ~~~
		const gjerd = linje.match(/^\s{0,3}(```+|~~~+)\s*(\w*)\s*$/);
		if (gjerd) {
			const slutt = gjerd[1][0] === '`' ? '```' : '~~~';
			let j = i + 1;
			while (j < linjer.length && !new RegExp('^\\s{0,3}' + slutt).test(linjer[j])) j++;
			const kode = linjer.slice(i + 1, Math.min(j, linjer.length)).join('\n');
			const sprak = gjerd[2] ? ` class="language-${gjerd[2]}"` : '';
			blokker.push({ type: 'kode', fra: i, til: Math.min(j, linjer.length - 1), html: `<pre class="md-pre"><code${sprak}>${esc(kode)}</code></pre>` });
			i = Math.min(j, linjer.length - 1) + 1;
			continue;
		}

		// tabell: | … | + skillelinje --- | --- |
		if (linje.includes('|') && i + 1 < linjer.length && /^\s*\|?[\s:|-]+$/.test(linjer[i + 1]) && /-{3,}/.test(linjer[i + 1])) {
			const celler = (l) => l.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map((c) => c.trim());
			const hode = celler(linje);
			const just = celler(linjer[i + 1]).map((c) => /^:.*:$/.test(c) ? 'center' : /:$/.test(c) ? 'right' : 'left');
			let j = i + 2;
			const rader = [];
			while (j < linjer.length && linjer[j].includes('|') && linjer[j].trim()) { rader.push(celler(linjer[j])); j++; }
			const th = hode.map((c, k) => `<th${just[k] ? ` style="text-align:${just[k]}"` : ''}>${mdInlineFull(c)}</th>`).join('');
			const tb = rader.map((r) => '<tr>' + hode.map((_, k) => `<td${just[k] ? ` style="text-align:${just[k]}"` : ''}>${mdInlineFull(r[k] ?? '')}</td>`).join('') + '</tr>').join('');
			blokker.push({ type: 'tabell', fra: i, til: j - 1, html: `<table class="md-tabell"><thead><tr>${th}</tr></thead><tbody>${tb}</tbody></table>` });
			i = j;
			continue;
		}

		// hr (kun etter tomt/oppstart — ellers setext h2)
		if (HR_RE.test(linje) && (i === 0 || !linjer[i - 1].trim())) {
			blokker.push({ type: 'hr', fra: i, til: i, html: '<hr class="md-hr">' });
			i++;
			continue;
		}

		// setext-overskrifter (tekst + === / ---)
		if (i + 1 < linjer.length && linjer[i].trim() && SETEXT1_RE.test(linjer[i + 1])) {
			blokker.push({ type: 'h1', fra: i, til: i + 1, html: `<h1 class="md-h md-h1">${mdInlineFull(linje.trim())}</h1>` });
			i += 2;
			continue;
		}
		if (i + 1 < linjer.length && linjer[i].trim() && SETEXT2_RE.test(linjer[i + 1]) && !HR_RE.test(linjer[i + 1]) && !LISTE_RE.test(linje)) {
			blokker.push({ type: 'h2', fra: i, til: i + 1, html: `<h2 class="md-h md-h2">${mdInlineFull(linje.trim())}</h2>` });
			i += 2;
			continue;
		}

		// ATX-overskrifter # … ###### (med valgfri {#id})
		const ov = linje.match(/^(#{1,6})\s+(.*?)(?:\s+\{#([^}]+)\})?\s*$/);
		if (ov) {
			const id = ov[3] ? ` id="${esc(ov[3])}"` : '';
			blokker.push({ type: 'h' + ov[1].length, fra: i, til: i, html: `<h${ov[1].length} class="md-h md-h${ov[1].length}"${id}>${mdInlineFull(ov[2])}</h${ov[1].length}>` });
			i++;
			continue;
		}

		// blokksitat (nøstet: > / >>) — rekursiv parse av innholdet
		if (/^\s*>/.test(linje)) {
			let j = i;
			while (j < linjer.length && /^\s*>/.test(linjer[j])) j++;
			const indre = linjer.slice(i, j).map((l) => l.replace(/^\s*>\s?/, '')).join('\n');
			const indreHtml = mdParse(indre).blokker.map((b) => b.html).join('');
			blokker.push({ type: 'sitat', fra: i, til: j - 1, html: `<blockquote class="md-sitat">${indreHtml}</blockquote>` });
			i = j;
			continue;
		}

		// fotnotedefinisjon [^id]: tekst
		const fn = linje.match(/^\[\^([^\]]+)\]:\s*(.*)$/);
		if (fn) {
			let j = i + 1;
			while (j < linjer.length && /^\s{2,}\S/.test(linjer[j])) { fotnoter.push(linjer[j].trim()); j++; }
			fotnoter.push(fn[2]);
			blokker.push({ type: 'fotnote', fra: i, til: j - 1, html: '' }); // samles på slutten
			i = j;
			continue;
		}

		// lister (nøstet etter innrykk)
		if (LISTE_RE.test(linje)) {
			let j = i;
			while (j < linjer.length && (LISTE_RE.test(linjer[j]) || (linjer[j].trim() && /^\s{2,}\S/.test(linjer[j]) && LISTE_RE.test(linjer[j - 1] ?? '')))) j++;
			blokker.push({ type: 'liste', fra: i, til: j - 1, html: listerHtml(linjer.slice(i, j)) });
			i = j;
			continue;
		}

		// avsnitt: til tomt eller ny blokkstart
		let j = i + 1;
		while (j < linjer.length && linjer[j].trim() && !LISTE_RE.test(linjer[j]) && !/^\s*>/.test(linjer[j]) && !/^\s{0,3}(```|~~~)/.test(linjer[j]) && !(linjer[j].includes('|') && /^\s*\|?\s*:?-{3,}/.test(linjer[j + 1] ?? '')) && !linjer[j].match(/^(#{1,6})\s/) && !/^\[\^[^\]]+\]:/.test(linjer[j])) j++;
		blokker.push({ type: 'p', fra: i, til: j - 1, html: paragraf(i, j - 1) });
		i = j;
	}

	return { blokker, fotnoter };
}

/** Liste-HTML med nøsting (innrykk ≥ 2 mellomrom) og oppgavelistebokser. */
function listerHtml(linjer) {
	const punkter = linjer.map((l) => {
		const m = l.match(LISTE_RE);
		return { innrykk: Math.floor((m[1].length || 0) / 2), ordnet: /^\d/.test(m[2]), merke: m[2], tekst: m[3] };
	});
	const bygg = (fra, nivaa) => {
		let ut = '';
		let k = fra;
		while (k < punkter.length && punkter[k].innrykk >= nivaa) {
			const p = punkter[k];
			const oppgave = p.tekst.match(OPPGAVE_RE);
			let innhold = oppgave
				? `<span class="md-oppgave"><input type="checkbox" disabled${oppgave[1] !== ' ' ? ' checked' : ''}> ${mdInlineFull(oppgave[2])}</span>`
				: mdInlineFull(p.tekst);
			if (k + 1 < punkter.length && punkter[k + 1].innrykk > nivaa) {
				const [indre, neste] = bygg(k + 1, punkter[k + 1].innrykk);
				innhold += indre;
				k = neste - 1;
			}
			ut += `<li>${innhold}</li>`;
			k++;
		}
		const ordnet = punkter[fra]?.ordnet;
		return [`<${ordnet ? 'ol' : 'ul'} class="md-liste">${ut}</${ordnet ? 'ol' : 'ul'}>`, k];
	};
	return bygg(0, 0)[0];
}

/** Full render: blokkene + fotnoter på slutten. */
export function mdHtml(tekst) {
	const { blokker, fotnoter } = mdParse(tekst);
	let html = blokker.map((b) => b.html).join('');
	if (fotnoter.length) {
		html += `<hr class="md-hr"><div class="md-fotnoter">${fotnoter.map((f, i) => `<div class="md-fotnote"><span class="md-fotnote-nr">${i + 1}.</span> ${mdInlineFull(f)}</div>`).join('')}</div>`;
	}
	return html;
}
