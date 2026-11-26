import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType } from 'docx';

/** Enkel md-tekst -> Word-dokument for prekenforberedelse-filene.
 *  Støtter overskrifter (#..###), punktliste (- ), nummerere liste (1. ),
 *  uthevet (**fet**) og kursiv (*litt*) i løpende tekst, plus ekte Word-tabeller.
 *  Enkelt og godt nok for notatfiler; den finriserte liturgieksporten bruker
 *  fortsatt exportWord. */

function runsFor(tekst) {
	const out = [];
	// dele p ** ** forst, s * * ** innenfor
	const stykker = String(tekst).split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);
	for (const s of stykker) {
		if (s.startsWith('**') && s.endsWith('**') && s.length > 4) {
			out.push(new TextRun({ text: s.slice(2, -2), bold: true }));
		} else if (s.startsWith('*') && s.endsWith('*') && s.length > 2) {
			out.push(new TextRun({ text: s.slice(1, -1), italics: true }));
		} else {
			out.push(new TextRun({ text: s }));
		}
	}
	return out.length ? out : [new TextRun({ text: '' })];
}

function tabelllinje(l) {
	const s = l.trim();
	return s.startsWith('|') && s.endsWith('|') && s.length > 2;
}

function tabellceller(l) {
	return l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
}

function tabellBlokk(linjer) {
	// første linje = hoderekk hvis neste er separator (---)
	const rader = linjer.map(tabellceller).filter((c) => c.some((x) => !/^-+$/.test(x)));
	const erSkille = (r) => r.every((c) => /^:?-+:?$/.test(c));
	const sep = /^\|/ .test(linjer[1] ?? '') && tabelllinje(linjer[1] ?? '') && erSkille(tabellceller(linjer[1]));
	const body = sep ? linjer.slice(2) : linjer;
	const rows = body.filter((r) => !erSkille(tabellceller(r))).map((r, ri) => new TableRow({
		children: tabellceller(r).map((text, ix) => new TableCell({
			children: [new Paragraph({ children: runsFor(text) })],
			width: { size: 100 / (tabellceller(body[0]).length || 3), type: WidthType.PERCENTAGE }
		}))
	}));
	return new Table({ rows });
}

function avsnitt(md) {
	const out = [];
	const alle = String(md).split('\n');
	let ix = 0;
	while (ix < alle.length) {
		const raw = alle[ix];
		if (tabelllinje(raw) && ix + 1 < alle.length && tabelllinje(alle[ix + 1])) {
			let j = ix;
			while (j < alle.length && tabelllinje(alle[j])) j++;
			out.push(tabellBlokk(alle.slice(ix, j)));
			ix = j;
			continue;
		}
		const linje = raw.replace(/\s+$/, '');
		if (!linje.trim()) { ix++; continue; } // tomme linjer gir ikke tomme avsnitt
		const h = /^(#{1,4})\s+(.*)$/.exec(linje);
		if (h) {
			const niv = { 1: HeadingLevel.HEADING_1, 2: HeadingLevel.HEADING_2, 3: HeadingLevel.HEADING_3, 4: HeadingLevel.HEADING_4 }[h[1].length];
			out.push(new Paragraph({ heading: niv, children: runsFor(h[2]) }));
			ix++; continue;
		}
		const pkt = /^[-*]\s+(.*)$/.exec(linje);
		if (pkt) {
			out.push(new Paragraph({ bullet: { level: 0 }, children: runsFor(pkt[1]) }));
			ix++; continue;
		}
		const num = /^\d+[.)]\s+(.*)$/.exec(linje);
		if (num) {
			out.push(new Paragraph({ numbering: { reference: 'forb-liste', level: 0 }, children: runsFor(num[1]) }));
			ix++; continue;
		}
		out.push(new Paragraph({ children: runsFor(linje) }));
		ix++;
	}
	return out;
}

/** Returnerer filinnholdet (base64) av md-teksten som .docx. */
export async function mdTilDocxBase64(md) {
	const doc = new Document({
		numbering: { config: [{ reference: 'forb-liste', levels: [{ level: 0, format: 'decimal', text: '%1.', alignment: 'left' }] }] },
		sections: [{ children: avsnitt(md) }]
	});
	if (typeof window === 'undefined') {
		// node (tester): toBuffer
		return Buffer.from(await Packer.toBuffer(doc)).toString('base64');
	}
	const blob = await Packer.toBlob(doc);
	const data = new Uint8Array(await blob.arrayBuffer());
	let bin = '';
	for (const b of data) bin += String.fromCharCode(b);
	return btoa(bin);
}
