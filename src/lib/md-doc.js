/**
 * Liten markdown-renderer for appens dokumentasjon (docs/*.md).
 * Ren funksjon uten import-sider, slik at den kan testes direkte med node --test.
 */

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Inline-markdown: fet, kursiv, kode, lenker. */
function inline(s) {
	let ut = esc(s);
	ut = ut.replace(/`([^`]+)`/g, '<code>$1</code>');
	ut = ut.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
	ut = ut.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
	ut = ut.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
	return ut;
}

/** Renderer markdown-tekst til HTML: overskrifter, avsnitt, lister, tabeller,
 *  kodeblokker og skillelinjer. TOC-lenker (anker) beholdes som ren tekst. */
export function mdTilHtml(md) {
	const linjer = (md ?? '').split('\n');
	const ut = [];
	let i = 0;
	let liste = null; // 'ul' | 'ol' | null
	const lukkListe = () => { if (liste) { ut.push('</' + liste + '>'); liste = null; } };
	while (i < linjer.length) {
		const l = linjer[i];
		// kodeblokk
		if (l.startsWith('```')) {
			lukkListe();
			i++;
			const kode = [];
			while (i < linjer.length && !linjer[i].startsWith('```')) { kode.push(linjer[i]); i++; }
			i++;
			ut.push('<pre><code>' + esc(kode.join('\n')) + '</code></pre>');
			continue;
		}
		// skillelinje
		if (/^---+$/.test(l.trim())) { lukkListe(); ut.push('<hr>'); i++; continue; }
		// overskrift
		const h = l.match(/^(#{1,4})\s+(.*)$/);
		if (h) {
			lukkListe();
			const niv = h[1].length;
			ut.push('<h' + niv + '>' + inline(h[2]) + '</h' + niv + '>');
			i++;
			continue;
		}
		// tabell: linje med | fulgt av |---|-skillelinje
		if (l.includes('|') && i + 1 < linjer.length && /^\s*\|?[\s:|-]+\|?\s*$/.test(linjer[i + 1]) && linjer[i + 1].includes('-')) {
			lukkListe();
			const celler = (rad) => rad.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map((c) => c.trim());
			const hode = celler(l);
			i += 2;
			const rader = [];
			while (i < linjer.length && linjer[i].includes('|') && linjer[i].trim()) { rader.push(celler(linjer[i])); i++; }
			ut.push('<table><thead><tr>' + hode.map((c) => '<th>' + inline(c) + '</th>').join('') + '</tr></thead><tbody>'
				+ rader.map((r) => '<tr>' + r.map((c) => '<td>' + inline(c) + '</td>').join('') + '</tr>').join('') + '</tbody></table>');
			continue;
		}
		// uordnede lister
		if (/^[-*]\s+/.test(l)) {
			if (liste !== 'ul') { lukkListe(); ut.push('<ul>'); liste = 'ul'; }
			ut.push('<li>' + inline(l.replace(/^[-*]\s+/, '')) + '</li>');
			i++;
			continue;
		}
		// ordnede lister
		if (/^\d+\.\s+/.test(l)) {
			if (liste !== 'ol') { lukkListe(); ut.push('<ol>'); liste = 'ol'; }
			ut.push('<li>' + inline(l.replace(/^\d+\.\s+/, '')) + '</li>');
			i++;
			continue;
		}
		// tom linje
		if (!l.trim()) { lukkListe(); i++; continue; }
		// avsnitt (sammenhengende linjer til tom linje)
		lukkListe();
		const avsnitt = [l];
		while (i + 1 < linjer.length && linjer[i + 1].trim() && !/^(#{1,4}\s|[-*]\s|\d+\.\s|```|---)/.test(linjer[i + 1]) && !linjer[i + 1].includes('|')) {
			avsnitt.push(linjer[i + 1]); i++;
		}
		ut.push('<p>' + inline(avsnitt.join(' ')) + '</p>');
		i++;
	}
	lukkListe();
	return ut.join('\n');
}
