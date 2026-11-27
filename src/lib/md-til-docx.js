import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType, Footer, PageNumber, ShadingType, BorderStyle } from 'docx';

/** Enkel md-tekst -> Word-dokument for prekenforberedelse-filene.
 *  Støtter overskrifter (#..###), punktliste (- ), nummerert liste (1. ),
 *  uthevet (**fet**), kursiv (*litt*) og hevede versnummer (^{N}) i løpende
 *  tekst, plus ekte Word-tabeller og frontmatter (--- blokk i starten).
 *  Farger og fonter følger liturgiappens profil: Georgia, liturgirøde
 *  overskrifter, creme frontmatter-kort og sidetall i bunnen. */

// liturgiprofilen (designplanen: rød #c0392b, Georgia, creme #f6f1e7)
const SERIF = 'Georgia';
const ROD = '8A2A20';              // dempet liturgirød for lesbarhet på hvitt
const TEKST = '2B2622';            // varm kull
const MUTET = '8C8478';            // opplysningstekst / sidetall
const CREME = 'F6F1E7';            // frontmatter-kortet

/** Inline-deling: **fet**, *kursiv* og hevede versnummer ^{N}. */
const RUNS_DELING = /(\*\*[^*]+\*\*|\*[^*]+\*|\^\{[^}]+\})/g;

function runsFor(tekst, ekstra = {}) {
	const out = [];
	// dele på ** ** først, så * * og hevede versnummer ^{N} innenfor
	const stykker = String(tekst).split(RUNS_DELING).filter(Boolean);
	for (const s of stykker) {
		if (s.startsWith('**') && s.endsWith('**') && s.length > 4) {
			out.push(new TextRun({ text: s.slice(2, -2), bold: true, ...ekstra }));
		} else if (s.startsWith('*') && s.endsWith('*') && s.length > 2) {
			out.push(new TextRun({ text: s.slice(1, -1), italics: true, ...ekstra }));
		} else if (s.startsWith('^{') && s.endsWith('}')) {
			// hevet versnummer (samme notasjon som pptx-eksporten og redigeringsmodulen)
			out.push(new TextRun({ text: s.slice(2, -1), superScript: true, ...ekstra }));
		} else {
			out.push(new TextRun({ text: s, ...ekstra }));
		}
	}
	return out.length ? out : [new TextRun({ text: '', ...ekstra })];
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
	const kremBak = { type: ShadingType.CLEAR, fill: CREME };
	const rows = body.filter((r) => !erSkille(tabellceller(r))).map((r, ri) => new TableRow({
		children: tabellceller(r).map((text, ix) => new TableCell({
			children: [new Paragraph({
				spacing: { after: 40, line: 280 },
				children: runsFor(text, { font: SERIF, size: 20, color: TEKST, ...(sep && ri === 0 ? { bold: true, color: ROD } : {}) })
			})],
			width: { size: 100 / (tabellceller(body[0]).length || 3), type: WidthType.PERCENTAGE },
			shading: sep && ri === 0 ? kremBak : undefined
		}))
	}));
	return new Table({
		// fyll hele sidebredden
		width: { size: 100, type: WidthType.PERCENTAGE },
		rows
	});
}

/** Overskrift: Georgia, liturgirød, hold omkring. */
function overskrift(niv, tekst) {
	const nivMap = { 1: HeadingLevel.HEADING_1, 2: HeadingLevel.HEADING_2, 3: HeadingLevel.HEADING_3, 4: HeadingLevel.HEADING_4 };
	const strrelse = { 1: 34, 2: 28, 3: 24, 4: 22 }[niv];
	return new Paragraph({
		heading: nivMap[niv],
		spacing: { before: niv === 1 ? 0 : 260, after: 140 },
		children: [new TextRun({ text: tekst, bold: niv <= 2, color: ROD, font: SERIF, size: strrelse })]
	});
}

/** Frontmatter (--- ... ---) som EKTE tabell i Word (docx har ikke
 *  frontmatter): to kolonner (nkkel/verdi), creme bakgrunn, sm rammer. */
function frontmatterBlokker(yaml) {
	const rader = [];
	for (const linje of String(yaml).split('\n')) {
		const l = linje.trim();
		if (!l || l.startsWith('#')) continue;
		const m = /^([\w][\w -]*?):\s*(.*)$/.exec(l);
		rader.push([m ? m[1] : '', m ? m[2] : l]);
	}
	if (!rader.length) return [];
	const ramme = { style: BorderStyle.SINGLE, size: 6, color: 'E4DCCB' };
	const rows = rader.map(([nokkel, verdi]) => new TableRow({
		children: [
			new TableCell({
				width: { size: 30, type: WidthType.PERCENTAGE },
				shading: { type: ShadingType.CLEAR, fill: CREME },
				children: [new Paragraph({ children: [new TextRun({ text: nokkel, bold: true, color: ROD, font: SERIF, size: 19 })], spacing: { after: 40, line: 280 } })]
			}),
			new TableCell({
				width: { size: 70, type: WidthType.PERCENTAGE },
				shading: { type: ShadingType.CLEAR, fill: CREME },
				children: [new Paragraph({ children: [new TextRun({ text: verdi, color: TEKST, font: SERIF, size: 19 })], spacing: { after: 40, line: 280 } })]
			})
		]
	}));
	return [
		new Table({
			width: { size: 100, type: WidthType.PERCENTAGE },
			borders: { top: ramme, bottom: ramme, left: ramme, right: ramme, insideHorizontal: ramme, insideVertical: ramme },
			rows
		}),
		// luft under tabellen
		new Paragraph({ children: [new TextRun({ text: '', size: 2 })], spacing: { after: 200 } })
	];
}

function avsnitt(md) {
	const out = [];
	let rest = String(md ?? '');
	// frontmatter: skilles ut og tegnes som creme kort
	const fmMatch = /^---\n([\s\S]*?)\n---(?:\n|$)/.exec(rest);
	if (fmMatch) {
		out.push(...frontmatterBlokker(fmMatch[1]));
		rest = rest.slice(fmMatch[0].length);
	}
	const alle = rest.split('\n');
	let ix = 0;
	while (ix < alle.length) {
		const raw = alle[ix];
		if (tabelllinje(raw) && ix + 1 < alle.length && tabelllinje(alle[ix + 1])) {
			let j = ix;
			while (j < alle.length && tabelllinje(alle[j])) j++;
			out.push(tabellBlokk(alle.slice(ix, j)));
			out.push(new Paragraph({ children: [new TextRun({ text: '', size: 2 })], spacing: { after: 160 } }));
			ix = j;
			continue;
		}
		const linje = raw.replace(/\s+$/, '');
		if (!linje.trim()) { ix++; continue; } // tomme linjer gir ikke tomme avsnitt
		const h = /^(#{1,4})\s+(.*)$/.exec(linje);
		if (h) {
			out.push(overskrift(h[1].length, h[2]));
			ix++; continue;
		}
		const pkt = /^[-*]\s+(.*)$/.exec(linje);
		if (pkt) {
			out.push(new Paragraph({ bullet: { level: 0 }, spacing: { after: 80, line: 300 }, children: runsFor(pkt[1], { font: SERIF, size: 21, color: TEKST }) }));
			ix++; continue;
		}
		const num = /^\d+[.)]\s+(.*)$/.exec(linje);
		if (num) {
			out.push(new Paragraph({ numbering: { reference: 'forb-liste', level: 0 }, spacing: { after: 80, line: 300 }, children: runsFor(num[1], { font: SERIF, size: 21, color: TEKST }) }));
			ix++; continue;
		}
		out.push(new Paragraph({ children: runsFor(linje, { font: SERIF, size: 21, color: TEKST }), spacing: { after: 180, line: 320 } }));
		ix++;
	}
	return out;
}

/** Returnerer filinnholdet (base64) av md-teksten som .docx. */
export async function mdTilDocxBase64(md) {
	const doc = new Document({
		numbering: { config: [{ reference: 'forb-liste', levels: [{ level: 0, format: 'decimal', text: '%1.', alignment: 'left' }] }] },
		styles: {
			default: {
				document: {
					run: { font: SERIF, size: 21, color: TEKST },
					paragraph: { spacing: { line: 320, after: 180 } }
				}
			}
		},
		sections: [{
			properties: {
				page: { margin: { top: 1134, bottom: 1134, left: 1247, right: 1247 } } // 2 cm topp/bunn, 2,2 cm sider
			},
			footers: {
				default: new Footer({
					children: [new Paragraph({
						alignment: AlignmentType.CENTER,
						children: [new TextRun({ children: [PageNumber.CURRENT], font: SERIF, size: 18, color: MUTET })]
					})]
				})
			},
			children: avsnitt(md)
		}]
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
