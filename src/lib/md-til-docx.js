import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

/** Enkel md-tekst -> Word-dokument for prekenforberedelse-filene.
 *  Støtter overskrifter (#..###), punktliste (- ), nummerere liste (1. ),
 *  uthevet (** fete**) og kursiv (*litt*) i løpende tekst, plus tabeller som
 *  vanlige avsnitt. Nødvendige for enkle notatf Mønster; den finriserte
 *  liturgieksporten bruker fortsatt exportWord. */

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

function avsnitt(md) {
	const out = [];
	for (const raw of String(md).split('\n')) {
		const linje = raw.replace(/\s+$/, '');
		if (!linje.trim()) continue; // tomme linjer gir ikke tomme avsnitt
		const h = /^(#{1,4})\s+(.*)$/.exec(linje);
		if (h) {
			const niv = { 1: HeadingLevel.HEADING_1, 2: HeadingLevel.HEADING_2, 3: HeadingLevel.HEADING_3, 4: HeadingLevel.HEADING_4 }[h[1].length];
			out.push(new Paragraph({ heading: niv, children: runsFor(h[2]) }));
			continue;
		}
		const pkt = /^[-*]\s+(.*)$/.exec(linje);
		if (pkt) {
			out.push(new Paragraph({ bullet: { level: 0 }, children: runsFor(pkt[1]) }));
			continue;
		}
		const num = /^\d+[.)]\s+(.*)$/.exec(linje);
		if (num) {
			out.push(new Paragraph({ numbering: { reference: 'forb-liste', level: 0 }, children: runsFor(num[1]) }));
			continue;
		}
		out.push(new Paragraph({ children: runsFor(linje) }));
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
