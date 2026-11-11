import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import PptxGenJS from 'pptxgenjs';

const ROLE_RE = /^((?:L|ML|M|A|KA|K|L\/ML|ML\/L|L\/M|KA\/L))(\s*\|)(.*)$/;
const ROLE_COLOR = 'C0392B';
const FOTNOTE_RE = /^FOTNOTE \| ?(.*)$/;

/** Del tekst i segmenter [{text, red, small}] – rollemerke (f.eks. «L |») og
 *  {{r}}-markører røde; «FOTNOTE | »-linjer små/urskrift. */
function roleSegments(text) {
	const out = [];
	let red = false;
	let small = false;
	const push = (t, r, s) => {
		if (t === '') return;
		const last = out.at(-1);
		if (last && !!last.red === !!r && !!last.small === !!s) last.text += t;
		else out.push({ text: t, red: r, small: !!s });
	};
	const lines = (text ?? '').split('\n');
	lines.forEach((line, li) => {
		if (li > 0) push('\n', red, small);
		let rest = line;
		const fn = line.match(FOTNOTE_RE);
		if (fn) {
			small = true;
			rest = fn[1];
		} else {
			small = false;
		}
		const m = rest.match(ROLE_RE);
		if (m) {
			push(m[1] + ' |', true, small);
			rest = m[3] ?? '';
		}
		for (const part of rest.split(/(\{\{\/?r\}\})/)) {
			if (part === '{{r}}') { red = true; continue; }
			if (part === '{{/r}}') { red = false; continue; }
			push(part, red, small);
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

export async function exportWord(svc, showInstr) {
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
					color: p.muted ? '555555' : ROLE_COLOR,
					bold: true
				})]
			}));
			continue;
		}
		paras.push(new Paragraph({
			children: roleSegments(p.text).map((s) =>
				new TextRun({
					text: s.text, italics: !!p.muted || !!s.small,
					size: s.small ? 16 : undefined, // halvparten av 24 halvpunkter
					color: s.red ? ROLE_COLOR : p.muted ? '555555' : s.small ? '777777' : undefined,
					bold: !!s.red && !s.small
				})),
			spacing: { after: 120 }
		}));
	}
	const doc = new Document({ sections: [{ properties: {}, children: paras }] });
	const blob = await Packer.toBlob(doc);
	download(blob, safeName(svc.name) + '.docx');
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

export async function exportPptx(svc) {
	const pptx = new PptxGenJS();
	pptx.layout = 'LAYOUT_16x9';
	const addSlide = (segs, big = false) => {
		const s = pptx.addSlide();
		s.background = { color: '0D0D0F' };
		// segs: tekst eller array av {text, red}
		const parts = typeof segs === 'string'
			? [{ text: segs, options: { fontSize: big ? 40 : 28, bold: big, color: 'E8E8EC' } }]
			: segs.map((seg) => ({
				text: seg.text,
				options: {
					fontSize: big ? 40 : 28, bold: big || !!seg.red,
					color: seg.red ? 'FF6B5E' : 'E8E8EC', breakLine: true
				}
			}));
		s.addText(parts, {
			x: 0.6, y: 0.6, w: 8.8, h: 4.2, fontFace: 'Arial',
			align: 'left', valign: 'top', lineSpacingMultiple: 1.2
		});
	};
	addSlide(svc.name + (svc.date ? '\n' + nlDate(svc.date) : '') + (svc.kirkeaar ? '\n' + svc.kirkeaar.name : ''), true);

	for (const sec of svc.sections) {
		for (const it of sec.items) {
			if (!it.enabled) continue;
			let lines = [];
			if (it.type === 'salme') {
				if (it.salmeNr || it.salmeTittel) lines.push([it.salmeNr, it.salmeTittel].filter(Boolean).join(' '));
				if (it.text) lines.push(it.text);
			} else if (it.alts && it.alts.length) {
				if (it.selAlt != null) lines.push(it.alts[it.selAlt].text);
			} else if (it.text) {
				lines.push(it.text);
			}
			const joined = lines.join('\n').trim();
			if (!joined) continue;
			for (const chunk of splitChunks(joined, 350)) addSlide(roleSegments(chunk));
		}
	}
	const blob = await pptx.write({ outputType: 'blob' });
	download(blob, safeName(svc.name) + '.pptx');
}

export function exportPdf() {
	window.print();
}
