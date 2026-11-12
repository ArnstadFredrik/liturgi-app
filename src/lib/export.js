import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import PptxGenJS from 'pptxgenjs';
import { jsPDF } from 'jspdf';

const ROLE_RE = /^((?:L|ML|M|A|KA|K|L\/ML|ML\/L|L\/M|KA\/L))(\s*\|)(.*)$/;
const ROLE_COLOR = 'C0392B';
const FOTNOTE_RE = /^FOTNOTE \| ?(.*)$/;

/** Del tekst i segmenter [{text, red, small, bold, italics}] – rollemerke (f.eks. «L |»),
 *  {{r}}-markører røde, «FOTNOTE | »-linjer små/urskrift, og enkel markdown
 *  (**fet**, *urskrift*, «# overskrift», «- punkt»). */
function roleSegments(text) {
	const out = [];
	let red = false;
	let small = false;
	const push = (t, r, s, bo, it) => {
		if (t === '') return;
		const last = out.at(-1);
		if (last && !!last.red === !!r && !!last.small === !!s && !!last.bold === !!bo && !!last.italics === !!it) last.text += t;
		else out.push({ text: t, red: r, small: !!s, bold: !!bo, italics: !!it });
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
			// inline markdown: **fet** og *urskrift*
			for (const md of part.split(/(\*\*[^*]+\*\*|\*[^*\n]+\*)/)) {
				if (!md) continue;
				const b = md.startsWith('**') && md.endsWith('**');
				const it = !b && md.startsWith('*') && md.endsWith('*');
				push(b ? md.slice(2, -2) : it ? md.slice(1, -1) : md, red, small, b || extraBold, it);
			}
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
					const a = it.alts[it.selAlt];
					if (a.label) out.push({ text: a.label, muted: true });
					out.push({ text: a.text });
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
	const level = { h1: HeadingLevel.HEADING_1, h2: HeadingLevel.HEADING_2, h3: HeadingLevel.HEADING_3 };
	const paras = [];
	for (const p of outline) {
		if (p.empty) { paras.push(new Paragraph({ text: '', spacing: { after: 60 } })); continue; }
		if (p.heading) {
			paras.push(new Paragraph({
				heading: level[p.heading],
				children: [new TextRun({
					text: p.text ?? '', italics: !!p.muted,
					color: ROLE_COLOR,
					bold: true
				})]
			}));
			continue;
		}
		paras.push(new Paragraph({
			children: roleSegments(p.text).map((s) =>
				new TextRun({
					text: s.text, italics: !!p.muted || !!s.small || !!s.italics,
					size: s.small ? 16 : undefined, // halvparten av 24 halvpunkter
					color: s.red || p.muted ? ROLE_COLOR : s.small ? '777777' : undefined,
					bold: !!s.bold || (!!s.red && !s.small)
				})),
			spacing: { after: 120 }
		}));
	}
	// sidestørrelse og kolonner (A4: 11906×16838, A5: 8391×11907 twips)
	const storrelse = valg.storrelse === 'A5' ? { width: 8391, height: 11907 } : { width: 11906, height: 16838 };
	const kolonner = valg.kolonner === 2 ? { count: 2, space: 708 } : undefined;
	const doc = new Document({
		sections: [{
			properties: {
				page: { size: { ...storrelse, orientation: 'portrait' }, margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } },
				column: kolonner
			},
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
			if (it.alts && it.alts.length) {
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

/** Bygg PDF (base64) med jsPDF — sidestørrelse og kolonner som Word. */
export function buildPdfBase64(svc, showInstr, valg = {}) {
	const a5 = valg.storrelse === 'A5';
	const mm = { w: a5 ? 148 : 210, h: a5 ? 210 : 297 };
	const doc = new jsPDF({ unit: 'mm', format: [mm.w, mm.h] });
	const margin = 15;
	const kolonner = valg.kolonner === 2 ? 2 : 1;
	const colGap = 6;
	const colW = (mm.w - margin * 2 - colGap * (kolonner - 1)) / kolonner;

	const ROLE = [31, 112, 77];   // ikke brukt direkte; rød = #C0392B
	const RED = [192, 57, 43];
	const GRAY = [119, 119, 119];

	let col = 0;
	let y = margin;

	const nySideHvisNodvendig = (h) => {
		if (y + h > mm.h - margin) { doc.addPage(); y = margin; col = 0; return true; }
		return false;
	};
	const x0 = () => margin + col * (colW + colGap);

	const skrivLinjer = (text, opts = {}) => {
		const { red = false, gray = false, bold = false, italics = false, size = 10.5, indent = 0 } = opts;
		doc.setFont('times', bold && italics ? 'bolditalic' : bold ? 'bold' : italics ? 'italic' : 'normal');
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
				const wrapped = doc.splitTextToSize(part, Math.max(w - (cx - x0() - indent), 20));
				wrapped.forEach((l, wi) => {
					if (wi > 0) nylinje();
					doc.text(l, cx, y + 4);
					cx += doc.getTextWidth(l);
				});
			});
		}
	};

	// tittelside-informasjon
	skrivLinjer(svc.name, { bold: true, size: 16, red: true });
	if (svc.date || svc.kirkeaar?.name) {
		skrivLinjer([svc.date ? nlDate(svc.date) : '', svc.kirkeaar?.name ?? ''].filter(Boolean).join(' · '), { gray: true, italics: true, size: 10 });
	}
	y += 4;

	for (const sec of svc.sections) {
		nySideHvisNodvendig(8);
		skrivLinjer(sec.title, { bold: true, size: 13, red: true });
		y += 1;
		for (const it of sec.items) {
			if (!it.enabled) continue;
			let head = it.heading || '';
			if (it.type === 'salme' && (it.salmeNr || it.salmeTittel)) head += (head ? ': ' : '') + [it.salmeNr, it.salmeTittel].filter(Boolean).join(' ');
			if (head) { nySideHvisNodvendig(6); skrivLinjer(head.replace(/\{\{\/?r\}\}/g, ''), { bold: true, size: 11, red: true }); }
			if ((showInstr ?? true) && it.instr) skrivLinjer(it.instr.replace(/\{\{\/?r\}\}/g, ''), { red: true, italics: true, size: 9.5 });
			// @r — hele linjen som rolle
			let tekst = '';
			if (it.type === 'salme') tekst = it.text ?? '';
			else if (it.alts?.length) tekst = it.selAlt != null ? it.alts[it.selAlt].text : '[Velg alternativ]';
			else tekst = it.text ?? '';
			tekst = (tekst || '').replace(/^@r ?\|? ?(.+)$/gm, (m, t) => '@r ' + t);
			// roleSegments håndterer @r-linjer (hele linjen rød), inline {{r}}…{{/r}} inline,
			// rollemerker som «L |», FOTNOTE og markdown — alt flytende på linjen
			skrivSegmenter(roleSegments(tekst));
			y += 3;
		}
	}
	const uri = doc.output('datauristring');
	return { base64: String(uri).split(',')[1] ?? '', doc };
}
