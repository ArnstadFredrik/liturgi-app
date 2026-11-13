import { Document, Packer, Paragraph, TextRun, HeadingLevel, Footer, PageNumber, AlignmentType } from 'docx';
import PptxGenJS from 'pptxgenjs';
import { jsPDF } from 'jspdf';
import { leddTekst } from './lit.js';

const ROLE_RE = /^((?:L|ML|M|A|KA|K|L\/ML|ML\/L|L\/M|KA\/L))(\s*\|)(.*)$/;
const ROLE_COLOR = 'C0392B';
const FOTNOTE_RE = /^FOTNOTE \| ?(.*)$/;

/** Flett sammen harde linjeskift som bare er linjebryting (limt inn fra Word/e-post)
 *  til flytende tekst, slik at PDF-eksporten ikke skriver 50-tegns-linjer bokstavelig.
 *  Ekte avsnittskift (tom linje) beholdes. Linjer som ender med setningsslutt punktum,
 *  utropstegn, spørsmålstegn eller kolon blir også avsnittskift. */
function flytAvsnitt(text) {
	if (!text) return text;
	const linjer = text.split('\n');
	const out = [];
	let buf = '';
	const sluttTegn = /[.:!?»"]\s*$/;
	const flush = () => { if (buf.trim()) out.push(buf.trim()); buf = ''; };
	linjer.forEach((linje, i) => {
		const t = linje.trim();
		if (!t) { flush(); out.push(''); return; }   // tom linje = avsnittskift
		if (!buf) buf = t;
		else if (/^[-–—•*]/.test(t)) { flush(); out.push(''); buf = t; }  // punktoppstillinger starter ny linje
		else buf += ' ' + t;
		const neste = (linjer[i + 1] ?? '').trim();
		// avslutt avsnittet på setningsslutt eller før neste linje ser ut som ny setning/rolle/overskrift
		if (sluttTegn.test(t) || /^[-–—•]/.test(neste) || /^\{\{r\}\}|^(L|ML|M|A|KA|K)\s*\|/.test(neste)) flush();
	});
	flush();
	return out.join('\n');
}

/** Del tekst i segmenter [{text, red, small, bold, italics}] – rollemerke (f.eks. «L |»),
 *  {{r}}-markører røde, «FOTNOTE | »-linjer små/urskrift, og enkel markdown
 *  (**fet**, *urskrift*, «# overskrift», «- punkt»). */
function roleSegments(text) {
	const out = [];
	let red = false;
	let small = false;
	const push = (t, r, s, bo, it, sp) => {
		if (t === '') return;
		const last = out.at(-1);
		if (last && !!last.red === !!r && !!last.small === !!s && !!last.bold === !!bo && !!last.italics === !!it && !!last.sup === !!sp) last.text += t;
		else out.push({ text: t, red: r, small: !!s, bold: !!bo, italics: !!it, sup: !!sp });
	};
	/** Del tekst på ^{N}-versnummer og inline-markdown; sup-fragmenter merkes med sup. */
	const pushInline = (part, r, s, bo) => {
		for (const sp of part.split(/(\^\{[^}]+\})/)) {
			if (!sp) continue;
			const erSup = sp.startsWith('^{') && sp.endsWith('}');
			const inner = erSup ? sp.slice(2, -1) : sp;
			for (const md of inner.split(/(\*\*[^*]+\*\*|\*[^*\n]+\*)/)) {
				if (!md) continue;
				const b = md.startsWith('**') && md.endsWith('**');
				const it = !b && md.startsWith('*') && md.endsWith('*');
				push(b ? md.slice(2, -2) : it ? md.slice(1, -1) : md, r, s, b || bo, it, erSup);
			}
		}
	};
	const lines = (text ?? '').split('\n');
	lines.forEach((line, li) => {
		if (li > 0) push('\n', red, small, false, false);
		let rest = line;
		let extraBold = false;
		const fn = line.match(FOTNOTE_RE);
		if (fn) {
			small = true;
			rest = fn[1];
		} else {
			small = false;
			// @r — hele linjen som rolle (rød, uten merket)
			const rl = rest.match(/^@r ?\|? ?(.+)$/);
			if (rl) {
				for (const md of rl[1].split(/(\*\*[^*]+\*\*|\*[^*\n]+\*)/)) {
					if (!md) continue;
					const b = md.startsWith('**') && md.endsWith('**');
					const it = !b && md.startsWith('*') && md.endsWith('*');
					push(b ? md.slice(2, -2) : it ? md.slice(1, -1) : md, true, false, b, it);
				}
				small = false;
				return;
			}
			// markdown blokk-nivå
			const hd = rest.match(/^#{1,2} ?(.+)$/);
			if (hd) {
				extraBold = true;
				push(hd[1].replace(/\*\*([^*]+)\*\*/g, '$1').replace(/(^|[^*])\*([^*]+)\*/g, '$1$2'), red, false, true, false);
				small = false;
				return;
			}
			const li2 = rest.match(/^- (.+)$/);
			if (li2) {
				push('• ', red, false, false, false);
				rest = li2[1];
			}
		}
		const m = rest.match(ROLE_RE);
		if (m) {
			push(m[1] + ' |', true, small, false, false);
			rest = m[3] ?? '';
		}
		for (const part of rest.split(/(\{\{\/?r\}\})/)) {
			if (part === '{{r}}') { red = true; continue; }
			if (part === '{{/r}}') { red = false; continue; }
			// inline markdown: **fet** og *urskrift* + hevede versnummer ^{N}
			pushInline(part, red, small, extraBold);
		}
		small = false;
	});
	if (out.length) out[out.length - 1].text = out[out.length - 1].text.replace(/\n$/, '');
	return out.filter((s) => s.text !== '');
}

function download(blob, filename) {
	const a = document.createElement('a');
	a.href = URL.createObjectURL(blob);
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	a.remove();
	setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

export function safeName(s) {
	return (s || 'gudstjeneste').replace(/[^\wæøåÆØÅ \-]+/g, '').trim() || 'gudstjeneste';
}

export function nlDate(d) {
	if (!d) return '';
	return new Date(d).toLocaleDateString('nb-NO', {
		weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
	});
}

/** Flat oversikt for eksport: [{heading, text, instr, empty}] */
export function buildOutline(svc, showInstr) {
	const out = [];
	out.push({ heading: 'h1', text: svc.name });
	if (svc.date) out.push({ heading: 'h3', text: nlDate(svc.date), muted: true });
	if (svc.kirkeaar?.name) out.push({ heading: 'h3', text: svc.kirkeaar.name, muted: true });

	for (const sec of svc.sections) {
		out.push({ heading: 'h2', text: sec.title });
		for (const it of sec.items) {
			if (!it.enabled) continue;
			let head = it.heading || '';
			if (it.type === 'salme' && (it.salmeNr || it.salmeTittel)) {
				head += (head ? ': ' : '') + [it.salmeNr, it.salmeTittel].filter(Boolean).join(' ');
			}
			if (head) out.push({ heading: 'h3', text: head });
			if (showInstr && it.instr) out.push({ text: it.instr, muted: true });
			if (it.type === 'salme') {
				if (!it.salmeNr && !it.salmeTittel && !it.text) out.push({ text: '[Salme: settes inn]', muted: true });
				if (it.text) out.push({ text: it.text });
			} else if (it.alts && it.alts.length) {
				if (it.selAlt == null) out.push({ text: '[Velg alternativ]', muted: true });
				else {
					if (it.introAlts?.length) out.push({ text: it.introAlts[it.selIntro ?? 0]?.text ?? '' });
					// fast innledning (it.text) er kun et mal-felt og vises ikke i gudtjenesteredigeringen —
					// kun innledning + valgt alternativ + avslutning følger med i eksporten
					const a = it.alts[it.selAlt];
					if (a.label) out.push({ text: a.label, muted: true });
					out.push({ text: a.text });
					if (it.avslutningAlts?.length) out.push({ text: it.avslutningAlts[it.selAvsl ?? 0]?.text ?? '' });
				}
			} else if (it.text) {
				out.push({ text: it.text });
			}
			out.push({ empty: true });
		}
	}
	return out;
}

const blobTilBase64 = (blob) => new Promise((res) => {
	const r = new FileReader();
	r.onload = () => res(String(r.result).split(',')[1]);
	r.readAsDataURL(blob);
});

export async function exportWord(svc, showInstr, filnavn, valg = {}, tilDisk = false) {
	const outline = buildOutline(svc, showInstr);
	// layouten skal samsvare med PDF-eksporten (se buildPdfBase64):
	// sorte fete sans-overskrifter (Arial = PDFs Helvetica), Times-brødtekst,
	// røde rollemerker, grå små fotnoter, samme mellomrom (mm → twips: 1 mm ≈ 56,7)
	const MM = 56.7;
	const SANS = 'Arial';
	const SERIF = 'Times New Roman';
	const BLACK = '141414';
	const GRAY = '777777';
	const paras = [];
	for (const p of outline) {
		if (p.empty) { paras.push(new Paragraph({ children: [], spacing: { after: Math.round(2.2 * MM) } })); continue; }
		if (p.heading) {
			// h1 tittel (sort Arial 16), h2 avsnitt (13, +5 mm før, +3,5 etter),
			// h3 leddoverskrift (11, +3 mm før, +1,8 etter) — som i PDF-en
			if (p.muted) {
				// dato/kirkeår-linje: grå kursiv 10 pt
				paras.push(new Paragraph({
					children: [new TextRun({ text: p.text ?? '', italics: true, color: GRAY, size: 20, font: SANS })],
					spacing: { after: Math.round(4 * MM) }
				}));
				continue;
			}
			const spec = p.heading === 'h1'
				? { size: 32, before: 0, after: Math.round(4 * MM) }
				: p.heading === 'h2'
					? { size: 26, before: Math.round(5 * MM), after: Math.round(3.5 * MM) }
					: { size: 22, before: Math.round(3 * MM), after: Math.round(1.8 * MM) };
			paras.push(new Paragraph({
				heading: p.heading === 'h1' ? HeadingLevel.HEADING_1 : p.heading === 'h2' ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
				children: [new TextRun({ text: p.text ?? '', bold: true, color: BLACK, size: spec.size, font: SANS })],
				spacing: { before: spec.before, after: spec.after }
			}));
			continue;
		}
		if (p.muted) {
			// instruksjoner: røde kursiv 9,5 pt — som i PDF-en
			paras.push(new Paragraph({
				children: [new TextRun({ text: p.text ?? '', italics: true, color: ROLE_COLOR, size: 19, font: SERIF })],
				spacing: { after: Math.round(1.5 * MM), line: 300 }
			}));
			continue;
		}
		// brødtekst: Times 10,5 pt, linjeavstand som PDF-en (size*0.48+1,1 mm ≈ 17,4 pt)
		paras.push(new Paragraph({
			children: roleSegments(p.text).map((s) =>
				new TextRun({
					text: s.text, italics: !!s.italics,
					size: s.small ? 18 : 21,
					font: SERIF,
					superScript: !!s.sup,
					color: s.red ? ROLE_COLOR : s.small ? GRAY : BLACK,
					bold: !!s.bold || (!!s.red && !s.small)
				})),
			spacing: { after: Math.round(3 * MM), line: 348 }
		}));
	}
	// sidestørrelse og kolonner (A4: 11906×16838, A5: 8391×11907 twips)
	const storrelse = valg.storrelse === 'A5' ? { width: 8391, height: 11907 } : { width: 11906, height: 16838 };
	const kolonner = valg.kolonner === 2 ? { count: 2, space: 708 } : undefined;
	// sidetall «N/M» nederst i midten — som i PDF-en
	const doc = new Document({
		sections: [{
			properties: {
				page: { size: { ...storrelse, orientation: 'portrait' }, margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } },
				column: kolonner
			},
			footers: { default: new Footer({ children: [new Paragraph({ children: [new TextRun({ children: [PageNumber.CURRENT, '/', PageNumber.TOTAL_PAGES], size: 18, color: '888888', font: SERIF })], alignment: AlignmentType.CENTER })] }) },
			children: paras
		}]
	});
	const blob = await Packer.toBlob(doc);
	if (tilDisk) return { base64: await blobTilBase64(blob), filnavn: filnavn ?? safeName(svc.name) + '.docx' };
	download(blob, filnavn ?? safeName(svc.name) + '.docx');
}

function splitChunks(t, n) {
	if (t.length <= n) return [t];
	const parts = [];
	let buf = '';
	for (const para of t.split('\n')) {
		if ((buf + '\n' + para).length > n && buf) { parts.push(buf); buf = para; }
		else buf = buf ? buf + '\n' + para : para;
	}
	if (buf) parts.push(buf);
	return parts;
}

export async function exportPptx(svc, valg = {}, tilDisk = false) {
	const pptx = new PptxGenJS();
	pptx.layout = 'LAYOUT_16x9';
	const tomSlide = !!valg.tomSlide;
	const addSlide = (segs, big = false) => {
		const s = pptx.addSlide();
		s.background = { color: '0D0D0F' };
		// segs: tekst eller array av {text, red}
		const parts = typeof segs === 'string'
			? [{ text: segs, options: { fontSize: big ? 40 : 24, bold: big, color: 'E8E8EC' } }]
			: segs.map((seg) => ({
					text: seg.text,
					options: {
						fontSize: big ? 40 : 24,
						bold: big || !!seg.red || !!seg.bold,
						italics: !!seg.italics || !!seg.small,
						superscript: !!seg.sup,
						color: seg.red ? 'FF6B5E' : seg.small ? 'A0A0A8' : 'E8E8EC', breakLine: true
					}
				}));
		s.addText(parts, {
			x: 0.6, y: 0.6, w: 8.8, h: 4.2, fontFace: 'Arial',
			align: 'left', valign: 'top', lineSpacingMultiple: 1.15,
			autoFit: true, shrinkText: true
		});
	};
	addSlide(svc.name + (svc.date ? '\n' + nlDate(svc.date) : '') + (svc.kirkeaar ? '\n' + svc.kirkeaar.name : ''), true);

	let forrigeTom = true;
	const leggTom = () => {
		// blank side mellom leddene (unngå dobbeltom)
		if (!tomSlide || forrigeTom) return;
		const s = pptx.addSlide();
		s.background = { color: '0D0D0F' };
		forrigeTom = true;
	};

	for (const sec of svc.sections) {
		for (const it of sec.items) {
			if (!it.enabled) continue;
			leggTom();
			forrigeTom = false;
			const heading = (it.heading || '') + (it.type === 'salme' && (it.salmeNr || it.salmeTittel)
				? (it.heading ? ': ' : '') + [it.salmeNr, it.salmeTittel].filter(Boolean).join(' ') : '');
			if (it.type === 'salme' && it.text) {
				// salmer: hver vers (tomlinjeseparert) på hver sin slide, overskrift med på første
				const vers = it.text.split(/\n\s*\n/).map((v) => v.trim()).filter(Boolean);
				vers.forEach((v, vi) => {
					const overskrift = vi === 0 && heading ? heading + '\n' : '';
					const chunked = splitChunks(overskrift + v, 280);
					chunked.forEach((chunk, ci) => addSlide(roleSegments(chunk)));
				});
				continue;
			}
			let lines = [];
			if (it.type !== 'salme') {
				// innledning + valgt alternativ + avslutning (som i Word/PDF)
				const t = leddTekst(it);
				if (t) lines.push(t);
			} else if (it.alts && it.alts.length) {
				if (it.selAlt != null) lines.push(it.alts[it.selAlt].text);
			} else if (it.text) {
				lines.push(it.text);
			}
			const joined = ((heading ? heading + '\n' : '') + lines.join('\n')).trim();
			if (!joined) continue;
			for (const chunk of splitChunks(joined, 260)) addSlide(roleSegments(chunk));
		}
	}
	const blob = await pptx.write({ outputType: 'blob' });
	if (tilDisk) return { base64: await blobTilBase64(blob), filnavn: safeName(svc.name) + '.pptx' };
	download(blob, safeName(svc.name) + '.pptx');
}

/** Bygg PDF (base64) med jsPDF — sidestørrelse og kolonner som Word.
 *  valg.hefte: kompakt 4-siders modus (menighetsprogram som brettes) — mindre skrift,
 *  strammere mellomrom og smalere marg. */
export function buildPdfBase64(svc, showInstr, valg = {}) {
	const a5 = valg.storrelse === 'A5';
	const hefte = !!valg.hefte;
	const mm = { w: a5 ? 148 : 210, h: a5 ? 210 : 297 };
	const doc = new jsPDF({ unit: 'mm', format: [mm.w, mm.h] });
	const margin = hefte ? 10 : 15;
	const kolonner = valg.kolonner === 2 ? 2 : 1;
	const colGap = hefte ? 4 : 6;
	const colW = (mm.w - margin * 2 - colGap * (kolonner - 1)) / kolonner;
	// skriftskala: hefte 0,85× — brødtekst ~9 pt, overskrifter proporsjonalt mindre
	const skala = hefte ? 0.85 : 1;
	const S = (n) => Math.round(n * skala * 10) / 10;

	const ROLE = [31, 112, 77];   // ikke brukt direkte; rød = #C0392B
	const RED = [192, 57, 43];
	const GRAY = [119, 119, 119];

	let col = 0;
	let y = margin;

	const nySideHvisNodvendig = (h) => {
		if (y + h > mm.h - margin) {
			// to kolonner: fyll venstre kolonne først, deretter høyre, før ny side
			if (kolonner === 2 && col === 0) { col = 1; y = margin; return true; }
			doc.addPage(); y = margin; col = 0; return true;
		}
		return false;
	};
	const x0 = () => margin + col * (colW + colGap);

	const skrivLinjer = (text, opts = {}) => {
		const { red = false, gray = false, bold = false, italics = false, size = 10.5, indent = 0, sans = false } = opts;
		doc.setFont(sans ? 'helvetica' : 'times', bold && italics ? 'bolditalic' : bold ? 'bold' : italics ? 'italic' : 'normal');
		doc.setFontSize(size);
		doc.setTextColor(...(red ? RED : gray ? GRAY : [20, 20, 20]));
		const w = colW - indent;
		for (const line of text.split('\n')) {
			if (!line.trim()) { y += 2.2; continue; }
			const wrapped = doc.splitTextToSize(line, w);
			for (const l of wrapped) {
				nySideHvisNodvendig(5);
				doc.text(l, x0() + indent, y + 4);
				y += size * 0.48 + 1.1;
			}
		}
	};

	/** Skriv segmenter fra roleSegments() flytende på linjen: røde rollemerker og
	 *  {{r}}-segmenter inline, ikke på egne linjer. */
	const skrivSegmenter = (segs, opts = {}) => {
		const { size: baseSize = 10.5, indent = 0 } = opts;
		const w = colW - indent;
		let cx = x0() + indent;
		const nylinje = () => {
			nySideHvisNodvendig(5);
			cx = x0() + indent;
			y += baseSize * 0.48 + 1.1;
		};
		for (const seg of segs) {
			const size = seg.small ? baseSize - 1.5 : baseSize;
			doc.setFont('times', seg.bold && seg.italics ? 'bolditalic' : seg.bold ? 'bold' : seg.italics ? 'italic' : 'normal');
			doc.setFontSize(size);
			doc.setTextColor(...(seg.red ? RED : seg.small ? GRAY : [20, 20, 20]));
			const parts = seg.text.split('\n');
			parts.forEach((part, pi) => {
				if (pi > 0) nylinje();
				if (!part) return;
				// del på hevede versnummer ^{N} (tegnes mindre og hevet på samme linje)
				for (const sp of part.split(/(\^\{[^}]+\})/)) {
					if (!sp) continue;
					const erSup = sp.startsWith('^{') && sp.endsWith('}');
					const supSize = erSup ? Math.max(size - 2.5, 5) : size;
					doc.setFontSize(supSize);
					// wrap ÉN linje om gangen: hvis linja bryter, om-wrapp resten ved full
					// kolonnebredde på neste linje (ellers forblir alle linjene korte)
					let rest = erSup ? sp.slice(2, -1) : sp;
					while (rest) {
						const restBredde = w - (cx - x0() - indent);
						if (restBredde < doc.getTextWidth('XX')) nylinje();
						const wrapped = erSup ? [rest] : doc.splitTextToSize(rest, w - (cx - x0() - indent));
						const l = wrapped[0];
						if (!l) { nylinje(); continue; }
						doc.text(l, cx, y + (erSup ? 2.2 : 4));
						cx += doc.getTextWidth(l);
						rest = rest.slice(l.length).replace(/^ +/, '');
						if (rest) nylinje();
					}
					doc.setFontSize(size);
				}
			});
		}
	};

	// tittelside-informasjon
	skrivLinjer(svc.name, { bold: true, size: S(16), sans: true });
	if (svc.date || svc.kirkeaar?.name) {
		skrivLinjer([svc.date ? nlDate(svc.date) : '', svc.kirkeaar?.name ?? ''].filter(Boolean).join(' · '), { gray: true, italics: true, size: S(10) });
	}
	y += hefte ? 2.5 : 4;

	for (const sec of svc.sections) {
		y += hefte ? 3 : 5; // god margin før overskriften
		nySideHvisNodvendig(12);
		skrivLinjer(sec.title, { bold: true, size: S(13), sans: true });
		y += hefte ? 2 : 3.5;
		for (const it of sec.items) {
			if (!it.enabled) continue;
			let head = it.heading || '';
			if (it.type === 'salme' && (it.salmeNr || it.salmeTittel)) head += (head ? ': ' : '') + [it.salmeNr, it.salmeTittel].filter(Boolean).join(' ');
			if (head) { y += hefte ? 1.5 : 3; nySideHvisNodvendig(10); skrivLinjer(head.replace(/\{\{\/?r\}\}/g, ''), { bold: true, size: S(11), sans: true }); y += 1.8; }
			if ((showInstr ?? true) && it.instr) { skrivLinjer(it.instr.replace(/\{\{\/?r\}\}/g, ''), { red: true, italics: true, size: S(9.5) }); y += 1.5; }
			// @r — hele linjen som rolle
			let tekst = '';
			if (it.type === 'salme') tekst = it.text ?? '';
			else if (it.selAlt == null && it.alts?.length) tekst = '[Velg alternativ]';
			else tekst = leddTekst(it);
			tekst = (tekst || '').replace(/^@r ?\|? ?(.+)$/gm, (m, t) => '@r ' + t);
			// roleSegments håndterer @r-linjer (hele linjen rød), inline {{r}}…{{/r}} inline,
			// rollemerker som «L |», FOTNOTE og markdown — alt flytende på linjen
			// flyt harde linjeskift midt i avsnitt (limt inn tekst) — behold ekte avsnittskift
			skrivSegmenter(roleSegments(flytAvsnitt(tekst)));
			y += hefte ? 1.8 : 3;
		}
	}
	// sidetall «side/total» i bunnen av hver side (etter at alt innhold er tegnet)
	const totalt = doc.getNumberOfPages();
	for (let i = 1; i <= totalt; i++) {
		doc.setPage(i);
		doc.setFont('times', 'normal');
		doc.setFontSize(9);
		doc.setTextColor(136, 136, 136);
		doc.text(`${i}/${totalt}`, mm.w / 2, mm.h - 6, { align: 'center' });
	}
	const uri = doc.output('datauristring');
	return { base64: String(uri).split(',')[1] ?? '', doc };
}
