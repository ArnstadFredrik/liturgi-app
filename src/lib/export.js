import { Document, Packer, Paragraph, TextRun, HeadingLevel, Footer, PageNumber, AlignmentType, BorderStyle } from 'docx';
import PptxGenJS from 'pptxgenjs';
import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import { leddTekst, salmeTekst, erPlassholderTekst } from './lit.js';

const ROLE_RE = /^((?:L|ML|M|A|KA|K|L\/ML|ML\/L|L\/M|KA\/L))(\s*\|)(.*)$/;
const ROLE_COLOR = 'C0392B';
const FOTNOTE_RE = /^FOTNOTE \| ?(.*)$/;  // generell liten tekstnotis (kun formatering)
const BIBELREF_RE = /^BIBELREF \| ?(.*)$/;  // bibelreferanse (brukes i bibelref-oppslag)
const NOTAT_RE = /^@(?:NOTAT|n) ?\|? ?(.+)$/;  // hele avsnitt som notat: rød kursiv, mindre

/** fjerner hele-linje @NOTAT/@n-linjer — @NOTAT regnes som instruksjon overalt:
 *  når «vis instruksjoner» er av skjules de i alle tekstfelter (ikke bare
 *  leddets instr-felt), så alternative-spesifikke instruksjoner (som ligger
 *  som @NOTAT først i alternativet) følger samme bryter. */
export function stripNotat(t) {
	if (!t || !/@(?:NOTAT|n)\b/.test(t)) return t;
	return t.split('\n').filter((l) => !NOTAT_RE.test(l.trim())).join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
const COPYRIGHT_RE = /^@(?:COPYRIGHT|copyright|c)\b ?\|? ?(.*)$/;  // salmeinfo: T/M/O-hode og ©-linjer — liten (som fotnote)
const REFRENG_START_RE = /^\{\{refreng\}\} ?(.*)$/;  // blokkstart: alt til {{/refreng}} i kursiv
const REFRENG_SLUTT_RE = /^\{\{\/refreng\}\} ?(.*)$/;

/** Flett sammen harde linjeskift som bare er linjebryting (limt inn fra Word/e-post)
 *  til flytende tekst, slik at PDF-eksporten ikke skriver 50-tegns-linjer bokstavelig.
 *  Ekte avsnittskift (tom linje) beholdes. Linjer som ender med setningsslutt punktum,
 *  utropstegn, spørsmålstegn eller kolon blir også avsnittskift. */
export function flytAvsnitt(text, opts = {}) {
	if (!text) return text;
	const linjer = text.split('\n');
	const out = [];
	let buf = '';
	const sluttTegn = /[.:!?»"]\s*$/;
	const beholdLinjer = !!opts.beholdLinjer; // salmer: linjeskiftene er forfatterens
	const sluttTegnEff = beholdLinjer ? /\s*$/ : sluttTegn;
	const flush = () => { if (buf.trim()) out.push(buf.trim()); buf = ''; };
	linjer.forEach((linje, i) => {
		const t = linje.trim();
		if (!t) { flush(); out.push(''); return; }   // tom linje = avsnittskift
		if (!buf) buf = t;
		// linjemerker (FOTNOTE/BIBELREF/@COPYRIGHT/@NOTAT), refrengmarkører og punktoppstillinger
		// starter alltid egne avsnitt — merket gjelder kun sin egen linje, så påfølgende linjer
		// skal ikke limes inn
		else if (/^(FOTNOTE|BIBELREF) \||^@r ?\||^@(?:NOTAT|n|COPYRIGHT|copyright|c)\b|^\{\{\/?refreng\}\}|^[-–—•] /.test(t)) { flush(); out.push(''); buf = t; }
		else buf += ' ' + t;
		const neste = (linjer[i + 1] ?? '').trim();
		// avslutt avsnittet på setningsslutt, etter fullførte fet-blokker (**), etter
		// linjemerke-linjer (gjelder kun egen linje), eller før neste linje ser ut som
		// ny setning/rolle/vers/fotnote/bibelref/notat/copyright/refreng-markør
		if (sluttTegnEff.test(t) || /\*\*$/.test(t) || /^(FOTNOTE|BIBELREF) \||^@/.test(t) || /^\{\{\/?refreng\}\}/.test(t) ||
			/^[-–—•] /.test(neste) || /^\^\{/.test(neste) ||
			/^\{\{r\}\}|^(L|ML|M|A|KA|K)\s*\|/.test(neste) || /^(FOTNOTE|BIBELREF) \||^@(?:NOTAT|n|COPYRIGHT|copyright|c)\b/.test(neste) || /^\{\{\/?refreng\}\}/.test(neste)) flush();
	});
	flush();
	// markdown-blokker (*kursiv*) som spenner over linjeskift (odde antall * på linjen)
	// flytes sammen med neste linje, så kursivmarkeringen ikke blir liggende rå
	const linjer2 = out.join('\n').split('\n');
	for (let i = 0; i < linjer2.length - 1; i++) {
		if (((linjer2[i].match(/\*/g) || []).length % 2) === 1) {
			linjer2[i] += ' ' + linjer2[i + 1];
			linjer2.splice(i + 1, 1);
			i--;
		}
	}
	return linjer2.join('\n');
}

/** Del tekst i segmenter [{text, red, small, bold, italics}] – rollemerke (f.eks. «L |»),
 *  {{r}}-markører røde, «FOTNOTE | »-linjer små/urskrift, og enkel markdown
 *  (**fet**, *urskrift*, «# overskrift», «- punkt»). */
export function roleSegments(text) {
	const out = [];
	let red = false;
	let small = false;
	const push = (t, r, s, bo, it, sp, mdH) => {
		if (t === '') return;
		const last = out.at(-1);
		if (last && !!last.red === !!r && !!last.small === !!s && !!last.bold === !!bo && !!last.italics === !!it && !!last.sup === !!sp && !!last.mdH === !!mdH) last.text += t;
		else out.push({ text: t, red: r, small: !!s, bold: !!bo, italics: !!it, sup: !!sp, mdH: !!mdH });
	};
	/** Del tekst på ^{N}-versnummer og inline-markdown; sup-fragmenter merkes med sup. */
	const pushInline = (part, r, s, bo, itBase) => {
		for (const sp of part.split(/(\^\{[^}]+\})/)) {
			if (!sp) continue;
			const erSup = sp.startsWith('^{') && sp.endsWith('}');
			const inner = erSup ? sp.slice(2, -1) : sp;
			for (const md of inner.split(/(\*\*[^*]+\*\*|\*[^*\n]+\*)/)) {
				if (!md) continue;
				const b = md.startsWith('**') && md.endsWith('**');
				const it = !b && md.startsWith('*') && md.endsWith('*');
				push(b ? md.slice(2, -2) : it ? md.slice(1, -1) : md, r, s, b || bo, it || itBase, erSup);
			}
		}
	};
	const lines = (text ?? '').split('\n');
	let iRefreng = false;      // inne i en {{refreng}}-blokk → kursiv
	let hoppLinjeskift = false; // markørlinjer gir ingen egen utskrift — hopper over neste \n
	lines.forEach((line, li) => {
		if (li > 0) {
			if (hoppLinjeskift) hoppLinjeskift = false;
			else push('\n', red, small, false, false);
		}
		// {{refreng}} / {{/refreng}} — blokkmarkører: ingen egen utskrift, linjene
		// inni blokken settes i kursiv
		const refS = line.match(REFRENG_START_RE);
		if (refS) {
			iRefreng = true;
			if (refS[1]) pushInline(refS[1], red, small, false, true);
			hoppLinjeskift = true;
			return;
		}
		const refS2 = line.match(REFRENG_SLUTT_RE);
		if (refS2) {
			iRefreng = false;
			if (refS2[1]) pushInline(refS2[1], red, small, false, true);
			hoppLinjeskift = true;
			return;
		}
		let rest = line;
		let extraBold = false;
		const fn = line.match(BIBELREF_RE) ?? line.match(FOTNOTE_RE) ?? line.match(COPYRIGHT_RE);
		if (fn) {
			small = true;
			rest = fn[1];
		} else {
			small = false;
			// @NOTAT / @n — hele avsnittet som notat: rød, kursiv, litt mindre
			const nt = line.match(NOTAT_RE);
			if (nt) {
				pushInline(nt[1], true, true, false, true);
				small = false;
				return;
			}
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
				// mdH: visningens .md-h (sans, fet) — Word/PDF bruker sans for disse
				push(hd[1].replace(/\*\*([^*]+)\*\*/g, '$1').replace(/(^|[^*])\*([^*]+)\*/g, '$1$2'), red, false, true, false, false, true);
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
			// inline markdown: **fet** og *urskrift* + hevede versnummer ^{N} (+ refreng-kursiv)
			pushInline(part, red, small, extraBold, iRefreng);
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

/** Ordnet matching av manus-avsnitt mot plan-slidene (lysblidemanus): pekeren
 *  gr bare FREMOVER siden manus og plan flger samme rekkeflge gjennom
 *  leddet. Slides kan vre gruppert annerledes enn manus-avsnittene (planen
 *  slr sammen/flytter grenser nr innledning/avslutning skjules for Skjerm),
 *  s treffet godtas bde Coupe og -innehold. Avsnitt som ikke finnes i planen
 *  (f.eks. innledning/avslutning som Skjerm-visningen ikke tar med) fr intet
 *  tall - i stedeet for neste slides nummer (feilplasseringen).
 *  Returnerer { nr, tomPlan }: nr = slide-nummer eller null; tomPlan =
 *  planTekst-mangler (ekstern produsent) - da skal kallet beholde sin
 *  sekvensielle fallback. */
function lagGruppeMapper() {
	const peker = new Map();
	return (nokkel, gt, planDel) => {
		if (!gt || !planDel?.length) return { nr: null, tomPlan: !planDel?.length };
		const st = peker.get(nokkel) ?? { idx: 0 };
		peker.set(nokkel, st);
		const lik = (pt, g) => {
			if (!pt) return false;
			return pt.startsWith(g.slice(0, 30)) || g.startsWith(pt.slice(0, 24))
				|| (g.length > 12 && pt.includes(g.slice(0, 24)))
				|| (pt.length > 12 && g.includes(pt.slice(0, 24)));
		};
		// skann fra pekeren og FREMOVER: manus-avsnitt som ikke er i skjermen
		// (etiketter, innledning/avslutning skjult for Skjerm) gr ut uten  spise
		// noen plan-slide - pekeren stryr bare fremover med vellykkede treff
		for (let i = st.idx; i < planDel.length; i++) {
			if (lik(planDel[i].tekst, gt)) { st.idx = i + 1; return { nr: planDel[i].nr, tomPlan: false }; }
		}
		return { nr: null, tomPlan: false };
	};
}

/** Flat oversikt for eksport: [{heading, text, instr, empty}]
 *  valg.visAvsnittstitler === false → hoveddel-overskriftene (h2) utelates. */
export function buildOutline(svc, showInstr, valg = {}) {
	const out = [];
	// planens slide-tekster per ledd (Eksport legger dem p lysPpt.planTekst):
	// nummermatching p innhold i stedet for gruppe-indeks, slik at
	// innledning/avslutning-valgene i visningen ikke forskjutter tallene
	const planTekstMap = valg.lysbildeTall?.lysPpt?.planTekst ?? null;
	const norm = (s) => String(s ?? '').replace(/\s+/g, ' ').trim().toLowerCase().slice(0, 60);
	// ordnet matcher: manuses tekstdeling presenteres sekvensielt, og skal matche
	// planens slides i samme rekkeflge (pekeren hindrer feilplasserte tall nr
	// innledning/avslutning skiller seg mellom manuset og Skjerm-visningen)
	const matchGruppe = lagGruppeMapper();
	const finnSlideNr = (nokkel, gruppe) => {
		if (!planTekstMap || !planTekstMap[nokkel]) return null;
		const g = norm(gruppe);
		if (!g) return null;
		const planDel = planTekstMap[nokkel].map((p) => ({ nr: p.n, tekst: p.tekst }));
		const m = matchGruppe(nokkel, g, planDel);
		return m.nr ?? null; // intet tall for manuselement som ikke er p skjermen
	};
	if (svc.__visTittel !== false) {
		out.push({ heading: 'h1', text: svc.name });
		if (svc.date) out.push({ heading: 'h3', text: nlDate(svc.date), muted: true });
		if (svc.kirkeaar?.name) out.push({ heading: 'h3', text: svc.kirkeaar.name, muted: true });
	}

	for (let si = 0; si < svc.sections.length; si++) {
		const sec = svc.sections[si];
		let forrige = null; // for h3-luft-logikken
		if (valg.visAvsnittstitler === false) continue;
		out.push({ heading: 'h2', text: sec.title });
		for (let ii = 0; ii < sec.items.length; ii++) {
			const it = sec.items[ii];
			if (!it.enabled) continue;
			if (it.sideskift && !(si === 0 && ii === 0)) out.push({ heading: 'sideskift' });
			const nokkel = si + ':' + ii;
			const lys = valg.lysbildeTall ? valg.lysbildeTall[si + ':' + ii] ?? null : null;
			const ppt = valg.lysbildeTall?.lysPpt ?? valg.lysbildePpt ?? null;
			const gruppeFlyt = it.type !== 'salme' && lys && lys.length && ppt && !!it.text;
			const altFlyt = it.type !== 'salme' && lys && lys.length && ppt && !!it.alts?.length && it.selAlt != null;
			let head = it.heading || '';
			if (it.type === 'salme' && (it.salmeNr || it.salmeTittel)) {
				head += (head ? ': ' : '') + [it.salmeNr, it.salmeTittel].filter(Boolean).join(' ');
			}
			if (head && it.__visOverskrift !== false) {
				// avsnittstitler AV: første overskrift i avsnittet får redusert topp-luft
				const forste = !forrige || forrige.heading === 'h2';
				// salmer med vers-tall: overskriften får ingen tall (versene får sine).
				// Tekstledd med gruppeflyt: overskriften får bare første tall (resten
				// kommer på sine gruppe-avsnitt, som i PDF-en).
				const lysEgne = (lys ?? []).filter((x) => !x.tom); // blanke sliders tall tas separat
				const lysLedende = (lys ?? []).filter((x) => x.tom && x.del !== -1).map((x) => x.n);
				const hodeLys = it.type === 'salme' && lysEgne.length && ppt ? null
					: (gruppeFlyt || altFlyt)
						? (lysLedende.length ? [...lysLedende, lysEgne[0].n] : [lysEgne[0]?.n])
						: (lysEgne.length ? lysEgne.map((x) => x.n) : null);
				out.push({ heading: 'h3', text: head, __forsteEtterH2: forste, __lys: hodeLys });
			}
			forrige = out[out.length - 1];
			if (it.__visInnhold === false) continue;
			if (showInstr && it.instr) out.push({ text: it.instr, muted: true });
			const visTekst = (t) => (showInstr ? t : stripNotat(t));
			const harOverskriftNaa = head && it.__visOverskrift !== false;
			const lysUtenHode = !harOverskriftNaa && lys ? lys.map((x) => x.n) : null;
			if (it.type === 'salme') {
				const st = salmeTekst(it);
					if (st) { // tom salmeplass rendres ikke (forhåndsvisningen/PDF viser ikke plassholderen)
					// et avsnitt per slidegruppe (gruppene per vers, samme deling som pptx):
					// gruppens lysbildetall på sitt avsnitt — også når versene ikke er
					// skilt med tomme linjer
					if (lys && lys.length && ppt) {
						const vers = st.split(/\n\s*\n/).map((v) => v.trim()).filter(Boolean);
						let li = 0;
						vers.forEach((v, vi) => {
							const overskrift = vi === 0 && ppt.visLeddtitler && head ? head + '\n' : '';
							const grupper = delPptSegs(roleSegments(flytAvsnitt(overskrift + v, { beholdLinjer: true })), ppt.storrelse, { beholdBrudd: true });
							grupper.forEach((grp, gi) => {
								let t = grp.map((s) => s.text).join('');
								if (vi === 0 && gi === 0 && overskrift) t = t.split('\n').slice(1).join('\n'); // overskriften er eget avsnitt
								t = t.replace(/^\n\n+/, '\n').replace(/^\n/, ''); // som over
								if (!t.trim()) return;
								const n = finnSlideNr(nokkel, t) ?? (planTekstMap ? null : lys[li] ?? null); // plan finnes: vers uten treff = ikke p skjermen
								li++;
								out.push({ text: t, __lys: n ? [n.n] : null, __siste: gi === grupper.length - 1 }); // hvert vers' siste gruppe får etter-avstand (vers-skillet)
							});
						});
					} else out.push({ text: st, __lys: lysUtenHode });
				}
			} else if (it.alts && it.alts.length) {
				if (it.selAlt == null) continue; // tomt ledd — ingenting i eksporten
				else {
					// stale selAlt etter sletting av alternativer: klem til gyldig område
					it.selAlt = Math.min(it.selAlt, it.alts.length - 1);
					if (it.introAlts?.length && !erPlassholderTekst(it.introAlts[it.selIntro ?? 0]?.text ?? '')) {
					const introT = visTekst(it.introAlts[it.selIntro ?? 0]?.text ?? '');
					// innledningen fr lysbildetall bare hvis den er med i skjermplanen
					out.push({ text: introT, __lys: (lys && lys.length && ppt) ? finnSlideNr(nokkel, introT) : null });
				}
					// fast innledning (it.text) er kun et mal-felt og vises ikke i gudstjenesteredigeringen —
					// kun innledning + valgt alternativ + avslutning følger med i eksporten
					const a = it.alts[it.selAlt];
											// alternativetiketten (formulert fra instruksjonen) følger vis instruksjoner
						if (a.label && showInstr) out.push({ text: a.label, muted: true });
					// plassholder-tekst ([Skriv tekst her] osv.) = tomt ledd — ikke med i eksporten
					const plassholder = /^\[(Skriv tekst her|Velg alternativ|Salme: settes inn)\]$/.test((a.text ?? '').trim());
					if (!plassholder) {
						const at = visTekst(a.text);
						if (altFlyt) {
							// et avsnitt per slidegruppe — gruppens lysbildetall på sitt avsnitt
							const lysLinjer = [];
							if (showInstr && it.instr) lysLinjer.push(it.instr.replace(/\{\{\/?r\}\}/g, ''));
							lysLinjer.push(at);
							const overskrift = ppt.visLeddtitler && head ? head + '\n' : '';
							const grupper = delPptSegs(roleSegments(flytAvsnitt((overskrift + lysLinjer.join('\n')).trim())), ppt.storrelse, { beholdBrudd: true });
							const hopp = (ppt.visLeddtitler && head ? 1 : 0) + (showInstr && it.instr ? it.instr.split('\n').length : 0);
							grupper.forEach((grp, gi) => {
								let t = grp.map((s) => s.text).join('');
								if (gi === 0) t = t.split('\n').slice(hopp).join('\n'); // overskrift + instr er allerede egne avsnitt
								t = t.replace(/^\n+/, '');
								if (!t.trim()) return;
								out.push({ text: t, __lys: (() => { const m = finnSlideNr(nokkel, t); if (m != null && !(gi === 0 && harOverskriftNaa && m === (lys ?? []).filter((x) => !x.tom)[0]?.n)) return [m]; if (planTekstMap) return (gi === 0 ? (lys ?? []).filter((x) => x.tom && x.del !== -1).map((x) => x.n) : null); return (gi > 0 || !harOverskriftNaa) && lys[gi] ? [lys[gi].n] : null; })(), __siste: gi === grupper.length - 1 });
							});
						} else out.push({ text: at });
					}
					if (it.avslutningAlts?.length) {
					const avslT = visTekst(it.avslutningAlts[it.selAvsl ?? 0]?.text ?? '');
					out.push({ text: avslT, __lys: (lys && lys.length && ppt) ? finnSlideNr(nokkel, avslT) : null });
				}
				}
			} else if (it.text) {
				const bt = visTekst(it.text);
				if (gruppeFlyt) {
					// et avsnitt per slidegruppe — gruppens lysbildetall på sitt avsnitt
					// (samme deling som pptx/PDF)
					const lysLinjer = [];
					if (showInstr && it.instr) lysLinjer.push(it.instr.replace(/\{\{\/?r\}\}/g, ''));
					if (bt) lysLinjer.push(bt);
					const overskrift = ppt.visLeddtitler && head ? head + '\n' : '';
					const grupper = delPptSegs(roleSegments(flytAvsnitt((overskrift + lysLinjer.join('\n')).trim())), ppt.storrelse, { beholdBrudd: true });
					const hopp = (ppt.visLeddtitler && head ? 1 : 0) + (showInstr && it.instr ? it.instr.split('\n').length : 0);
					grupper.forEach((grp, gi) => {
						let t = grp.map((s) => s.text).join('');
						if (gi === 0) t = t.split('\n').slice(hopp).join('\n'); // overskrift + instr er allerede egne avsnitt
						t = t.replace(/^\n\n+/, '\n').replace(/^\n/, ''); // avsnittskift ved grensen = nytt avsnitt; blanklinjen beholdes som første tomme linje
						if (!t.trim()) return;
						out.push({ text: t, __lys: (() => { const m = finnSlideNr(nokkel, t); if (m != null && !(gi === 0 && harOverskriftNaa && m === (lys ?? []).filter((x) => !x.tom)[0]?.n)) return [m]; if (planTekstMap) return (gi === 0 ? (lys ?? []).filter((x) => x.tom && x.del !== -1).map((x) => x.n) : null); return (gi > 0 || !harOverskriftNaa) && lys[gi] ? [lys[gi].n] : null; })(), __siste: gi === grupper.length - 1 });
					});
				} else out.push({ text: bt });
			}
			// avstand: spacing før/etter dekker allerede luften — INGEN tom avsnittlinje
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
	// skriftskala (samme modell som PDF-en): hoveddel/ledd/tekst multipliserer pt-størrelsene
	const skriftSkala = { hoveddel: 1, ledd: 1, tekst: 1, ...(valg.skriftSkala ?? {}) };
	const WF = (omr) => (omr ? (skriftSkala[omr] ?? 1) : 1); // word: size er halvpunkter
	const outline = buildOutline(svc, showInstr, valg);
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
		// samme faktor for før og etter — forholdet mellom forrige/kommende tekst skal
		// være uavhengig av avstandsvalget
		const afFor = valg.avstand === 'tett' ? 0.75 : valg.avstand === 'luft' ? 1.5 : 1;
		const afEtter = afFor;
		if (p.heading === 'sideskift') { paras.push(new Paragraph({ children: [], pageBreakBefore: true })); continue; }
		if (p.empty) { paras.push(new Paragraph({ children: [], spacing: { after: Math.round((p.tynn ? 0.8 : 2.2) * afEtter * MM) } })); continue; }
		if (p.heading) {
			// h1 tittel (sort Arial 16), h2 avsnitt (13, +5 mm før, +3,5 etter),
			// h3 leddoverskrift (11, +3 mm før, +1,8 etter) — som i PDF-en
			if (p.muted) {
				// dato/kirkeår-linje: grå kursiv 10 pt
				paras.push(new Paragraph({
					children: [new TextRun({ text: p.text ?? '', italics: true, color: GRAY, size: Math.round(20 * WF('hoveddel')), font: SANS })],
					spacing: { after: Math.round(4 * MM) }
				}));
				continue;
			}
			const spec = p.heading === 'h1'
				? { size: Math.round(32 * WF('hoveddel')), before: 0, after: Math.round(4 * MM) }
				: p.heading === 'h2'
					? { size: Math.round(22 * WF('hoveddel')), before: Math.round(5 * afFor * MM), after: Math.round(3.5 * afEtter * MM), linjeUnder: true }
					: { size: Math.round(22 * WF('ledd')), before: ((valg.visAvsnittstitler === false && p.__forsteEtterH2) ? 0 : Math.round(3 * afFor * MM)), after: Math.round(1.8 * afEtter * MM) };
			const lysKant = { style: BorderStyle.SINGLE, size: 6, color: '2563EB', space: 3 };
			const lysListe = p.__lys == null ? null : (Array.isArray(p.__lys) ? p.__lys : [p.__lys]);
			const lysRuns = lysListe != null
				? [
					...lysListe.flatMap((n, i) => [
						// flere tall: mindre font og mellomrom mellom – de skal stå PÅ en linje
						// i margen, aldri over/under hverandre
						...(i > 0 ? [new TextRun({ text: ' ', size: Math.round(14 * WF('ledd')) })] : []),
						new TextRun({ text: String(n), bold: true, color: '2563EB', size: Math.round((lysListe.length > 1 ? 18 : 22) * WF('ledd')), font: SANS, border: { top: lysKant, bottom: lysKant, left: lysKant, right: lysKant } })
					]),
					new TextRun({ text: '\t' })
				]
				: [];
			paras.push(new Paragraph({
				...(p.__lys != null ? { indent: { left: lysListe != null && lysListe.length > 1 ? 700 : 520, hanging: lysListe != null && lysListe.length > 1 ? 700 : 520 } } : {}),
				heading: p.heading === 'h1' ? HeadingLevel.HEADING_1 : p.heading === 'h2' ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
				// seksjonstitler får horisontal linje under (som i PDF-en/forhåndsvisningen)
				...(spec.linjeUnder ? { border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'B4B4B4', space: 2 } } } : {}),
				children: [...lysRuns, new TextRun({ text: p.text ?? '', bold: true, color: BLACK, size: spec.size, font: SANS })],
				spacing: { before: spec.before, after: spec.after }
			}));
			continue;
		}
		if (p.muted) {
			// instruksjoner: røde kursiv 9,5 pt — som i PDF-en
			paras.push(new Paragraph({
				children: [new TextRun({ text: p.text ?? '', italics: true, color: ROLE_COLOR, size: Math.round(19 * WF('tekst')), font: SERIF })],
				spacing: { after: Math.round(1.5 * MM), line: 300 }
			}));
			continue;
		}
		const lysKant = { style: BorderStyle.SINGLE, size: 6, color: '2563EB', space: 3 }; // sirkeltall-rammen
		// brødtekst: Times 10,5 pt, linjeavstand som PDF-en (size*0.48+1,1 mm ≈ 17,4 pt)
		const lysListe = p.__lys == null ? null : (Array.isArray(p.__lys) ? p.__lys : [p.__lys]);
		// avsnittsgrenser (tomme linjer i kildeteksten) deles til EGNE avsnitt:
		// ingen tomme linjer i docx - avstanden følger avstand-valget (får/etter)
		const avsnittDeler = (p.text ?? '').split(/\n[ \t]*\n+/);
		const runsFor = (kilde) => {
			const runs = [];
			for (const s of roleSegments(kilde)) {
				const deler = s.text.split('\n');
				deler.forEach((d, i) => {
					if (i > 0) runs.push(new TextRun({ text: '', break: 1 }));
					if (!d) return;
					runs.push(new TextRun({
						text: d, italics: !!s.italics,
						size: s.small ? Math.round(18 * WF('tekst')) : Math.round(21 * WF('tekst')),
						font: s.mdH ? SANS : SERIF,
						superScript: !!s.sup,
						color: s.red ? ROLE_COLOR : s.small ? GRAY : BLACK,
						bold: !!s.bold || (!!s.red && !s.small)
					}));
				});
			}
			return runs;
		};
		// hvert avsnitt (delt p tomme linjer i kildeteksten - markdown-standard)
		// fr sitt eget Paragraph; avstanden følger avstand-valget (får/etter)
		// i stedet for å gjengi tomme linjer i eksporten
		avsnittDeler.forEach((del, di) => {
			paras.push(new Paragraph({
				...(di === 0 && p.__lys != null ? { indent: { left: 520, hanging: 520 } } : {}),
				children: di === 0 && lysListe != null
					? [
						...lysListe.flatMap((n, i) => [
							...(i > 0 ? [new TextRun({ text: '', break: 1 })] : []),
							new TextRun({ text: String(n), bold: true, color: '2563EB', size: Math.round(21 * WF('tekst')), font: SANS, border: { top: lysKant, bottom: lysKant, left: lysKant, right: lysKant } })
						]),
						new TextRun({ text: '\t' }), ...runsFor(del)]
					: runsFor(del),
				spacing: { after: Math.round(3 * afEtter * MM), line: 348 }
			}));
		});
	}
	// sidestørrelse og kolonner (A4: 11906×16838, A5: 8391×11907 twips)
	const storrelse = valg.storrelse === 'A5' ? { width: 8391, height: 11907 } : { width: 11906, height: 16838 };
	const kolonner = valg.kolonner === 2 ? { count: 2, space: 708 } : undefined;
	// sidetall «N/M» nederst i midten — som i PDF-en
	// marger som PDF-en: smal 10 mm, normal 15 mm, bred 20 mm (MM twips per mm)
	const marg = (valg.marger === 'smal' ? 10 : valg.marger === 'bred' ? 20 : 15) * MM;
	// lysbildemanus: venstre marg utvides slik at tallene får plass i margsonen
	const lysMarg = valg.lysbildeTall && Object.keys(valg.lysbildeTall).length ? 7 * MM : 0;
	const doc = new Document({
		sections: [{
			properties: {
				page: { size: { ...storrelse, orientation: 'portrait' }, margin: { top: marg, bottom: marg, left: marg + lysMarg, right: marg } },
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

export function splitChunks(t, n) {
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

/** Del tekst i PPT-slides som IKKE flyter utenfor kanten: linjebryting mot
 *  bredden på en 10-tommers slide (tekstboks 8,8in ≈ 634 pt) og pakking mot
 *  maks antall linjer (tekstboks 4,2in ≈ 302 pt, linjeavstand 1,15). Siste side
 *  balanseres mot nest siste slik at ikke bare et par ord står alene.
 *  Brukes av BÅDE forhåndsvisningen (Eksport.svelte) og selve eksporten. */
export function delPptSider(tekst, fs) {
	const cpl = Math.max(20, Math.floor(634 / (fs * 0.5))); // tegn per linje
	const maxLinjer = Math.max(4, Math.floor(302 / (fs * 1.15))); // linjer per side
	// bryt avsnitt til visuelle linjer med naturlige mellomrom
	const linjer = [];
	for (const p of tekst.split('\n')) {
		if (!p.trim()) { linjer.push(''); continue; }
		if (p.length <= cpl) { linjer.push(p); continue; }
		let rest = p;
		while (rest.length > cpl) {
			let kutt = rest.lastIndexOf(' ', cpl);
			if (kutt < cpl * 0.5) kutt = cpl; // ingen naturlig break — hard klipp
			linjer.push(rest.slice(0, kutt).trimEnd());
			rest = rest.slice(kutt).trimStart();
		}
		if (rest) linjer.push(rest);
	}
	// pakk linjer i sider
	const grupper = [];
	let grp = [];
	for (const l of linjer) {
		if (grp.length >= maxLinjer) { grupper.push(grp); grp = []; }
		grp.push(l);
	}
	if (grp.length) grupper.push(grp);
	// orphan-utjevning: en siste side med under 3 fulle linjer balanseres mot nest sist
	if (grupper.length > 1) {
		const fulle = (g) => g.filter((l) => l.trim()).length;
		if (fulle(grupper.at(-1)) < 3) {
			const siste = grupper.pop();
			const nestSist = grupper.pop();
			const alle = [...nestSist, ...siste];
			const halv = Math.ceil(alle.length / 2);
			// helst del ved et avsnittsskift nærmest halvparten
			let best = halv;
			let bestD = Infinity;
			for (let i = 1; i < alle.length; i++) {
				if (!alle[i].trim() || !alle[i - 1].trim()) {
					const d = Math.abs(i - halv);
					if (d < bestD) { bestD = d; best = i; }
				}
			}
			grupper.push(alle.slice(0, best), alle.slice(best));
		}
	}
	return grupper.map((g) => g.join('\n').trim().replace(/\n{3,}/g, '\n\n')).filter(Boolean);
}

/** Delepunkt for lysbildetekst: helst setningsslutt, ellers komma/semikolon/
 *  kolon, ellers bindeord (og/at/men/for/så/eller/enten/når/som/fordi …), sist
 *  ett mellomrom — aldri hardt midt i et ord når et bedre brudd finnes. Med
 *  restvokt (standard): kuttet bakes tilbake hvis RESTEN (det som kommer på
 *  neste slide) ville blitt ett enslig ord — siste ordet skal aldri stå alene.
 *  Returnerer kuttindex (slice(0, kutt) = første del). */
export function finnDelPunkt(t, maksl, opts = {}) {
	const maks = Math.min(maksl, t.length);
	if (maks <= 0) return 0;
	// siste kandidatposisjon ≤ maks (kutt ETER treffet, evt. foran bindeordet)
	const sist = (re, foran = false) => {
		let best = -1, m;
		re.lastIndex = 0;
		while ((m = re.exec(t)) && m.index < maks) {
			const k = foran ? m.index : m.index + m[0].length;
			if (k > 0) best = k;
		}
		return best;
	};
	const setning = sist(/[.!?…][»”’")\]]* /g);                 // etter setningsslutt
	const komma = sist(/[,;:][»”’")\]]* /g);                    // etter komma/semikolon/kolon
	const bindeord = sist(/\b(og|at|men|for|så|eller|enten|anten|når|som|fordi|derfor)\s/gi, true); // foran bindeordet
	const mellomrom = sist(/ /g);
	// terskler: et brudd må sitte så nært pakkegrensen — et setnings-/kommakutt
	// langt bak gir en nesten tom slide (verre enn å dele midt i et langt ledd)
	const minTegn = Math.max(6, Math.floor(maks * 0.3));
	const minBind = Math.max(8, Math.floor(maks * 0.45));
	let kutt = -1;
	for (const [k, min] of [[setning, minTegn], [komma, minTegn], [bindeord, minBind], [mellomrom, 1]]) {
		if (k >= min) { kutt = k; break; }
	}
	if (kutt < 0) kutt = maks; // ingen naturlig brudd — hardt klipp
	if (opts.taMedRest !== false && kutt > 0) {
		// restvakt: resten må ikke bli ett enslig (kort) ord på neste slide
		const r = t.slice(kutt).trim().replace(/^[»”’")\]]+/, '');
		if (r && !/\s/.test(r) && r.length < 24) {
			const tidligere = [setning, komma, bindeord, mellomrom].filter((k) => k > 0 && k < kutt);
			if (tidligere.length) kutt = Math.max(...tidligere);
		}
	}
	return kutt;
}

/** Del roleSegments-output i slides UTEN å miste formatering: segmentene
 *  (fet/kursiv/rød) følger teksten, så markdown-par kan aldri bli delt midt i.
 *  Kapasitet per slide = cpl × maxLinjer (samme mål som delPptSider). Siste side
 *  balanseres mot nest siste hvis den blir spinkel. Kuttene følger setninger/ 
 *  kommaer/bindeord (finnDelPunkt) — siste ordet står aldri alene på en slide. */
export function delPptSegs(segs, fs, opts = {}) {
	const beholdBrudd = !!opts.beholdBrudd; // manuset: behold avsnittskift ved gruppegrenser
	const cpl = Math.max(20, Math.floor(634 / (fs * 0.5)));
	const maxLinjer = Math.max(4, Math.floor(302 / (fs * 1.15)));
	// antall rendrete linjer en tekst blokker til (korte verslinjer teller som
	// hele linjer — tegnbudsjett alene ga tekstoverflyt på slidene)
	const linjerITekst = (t) => t.split('\n').reduce((sum, l) => sum + Math.max(1, Math.ceil(l.length / cpl)), 0);
	// tegnposisjon som holder seg innenfor maksl rendrete linjer
	const delVedLinjer = (t, maksl) => {
		let brukt = 0, pos = 0;
		for (const linje of t.split('\n')) {
			const wl = Math.max(1, Math.ceil(linje.length / cpl));
			if (brukt + wl > maksl) {
				const igjen = maksl - brukt;
				if (igjen <= 0) return pos > 0 ? pos : Math.min(t.length, cpl);
				const tegn = Math.min(linje.length, igjen * cpl);
				// kutt i linjen: setning/komma/bindeord fremfor vilkårlig mellomrom
				// (restvakten skjøtes på i hovedløkken, der hele resten er synlig)
				return pos + finnDelPunkt(linje, tegn, { taMedRest: false });
			}
			brukt += wl; pos += linje.length + 1;
		}
		return t.length;
	};
	// pakk segmentene i slides — budsjettet er antall rendrete LINJER per slide
	const sider = [];
	let grp = [], linjer = 0;
	const pushGrp = () => { if (grp.length) { sider.push(grp); grp = []; linjer = 0; } };
	for (const s of segs) {
		let rest = s.text;
		if (!rest) continue;
		while (rest.length) {
			const ledig = maxLinjer - linjer;
			if (linjerITekst(rest) <= ledig) {
				grp.push({ ...s, text: rest });
				linjer += linjerITekst(rest);
				rest = '';
			} else {
				let kutt = delVedLinjer(rest, ledig);
				if (kutt <= 0) { pushGrp(); continue; }
				// unngå å kutte midt i hevet versnummer ^{N}
				const supStart = rest.lastIndexOf('^{', kutt);
				const supSlutt = rest.indexOf('}', supStart);
				if (supStart > 0 && supSlutt !== -1 && supSlutt >= kutt) kutt = supStart;
				// restvakt: det som havner på neste slide må ikke bli ett enslig
				// ord (siste ordet i en setning skal aldri stå alene på en side)
				const resten = rest.slice(kutt).replace(/^\n+/, '').trim().replace(/^[»”’)\]]+/, '');
				if (kutt > 0 && resten && !/\s/.test(resten) && resten.length < 24) {
						// bak kuttet til forrige delepunkt så minst to ord følger med over
						const tidligere = finnDelPunkt(rest.slice(0, kutt).trimEnd(), kutt - 1, { taMedRest: false });
						if (tidligere > 0) kutt = tidligere;
				}
				grp.push({ ...s, text: rest.slice(0, kutt) });
				linjer += linjerITekst(rest.slice(0, kutt));
				rest = beholdBrudd ? rest.slice(kutt) : rest.slice(kutt).replace(/^\n+/, '');
				pushGrp();
			}
		}
	}
	pushGrp();
	// orphan-utjevning: spinkel siste side balanseres mot nest siste —
	// store segmenter DELS underveis, ellers kan ett ord stå alene på en side
	if (sider.length > 1) {
		const fyll = (g) => g.reduce((a, s) => a + s.text.length, 0);
		const kap = cpl * maxLinjer;
		if (fyll(sider.at(-1)) < kap * 0.25) {
			const alle = [...sider.at(-2), ...sider.at(-1)];
			const halv = Math.ceil(alle.reduce((a, s) => a + s.text.length, 0) / 2);
			const g1 = [], g2 = [];
			let l1 = 0;
			for (const s of alle) {
				if (l1 >= halv) { g2.push(s); continue; }
				if (l1 + s.text.length <= halv) { g1.push(s); l1 += s.text.length; continue; }
				// segmentet spenner over delepunktet — del ved setning/komma/bindeord,
				// aldri så en enslig ordbit blir alene på en av sidene
				let k = finnDelPunkt(s.text, Math.max(1, halv - l1));
				if (k <= 0) k = Math.max(1, halv - l1);
				g1.push({ ...s, text: s.text.slice(0, k) });
				g2.push({ ...s, text: s.text.slice(k).replace(/^\s+/, '') });
				l1 += s.text.length;
			}
			if (g1.length && g2.length) sider.splice(sider.length - 2, 2, g1, g2);
		}
	}
	return sider;
}

/** Lysbildeplan: samme gårur som exportPptx — returnerer hver slide med
 *  innhold, notat og anker til leddet den kommer fra ('si:ii' + del-indeks).
 *  exportPptx renderer planen; lysbildemanuset bruker ankene til margtallene. */
export function byggSlidePlan(svc, valg = {}) {
	const tomModus = valg.tomSlideModus ?? (valg.tomSlide ? 'alle' : 'av'); // 'av' | 'alle' | 'smart'
	const showInstr = valg.showInstr !== undefined ? !!valg.showInstr : false;
	const visLeddtitler = !!valg.visLeddtitler;
	const tekstStorrelse = Math.round((valg.tekstSkala ?? 1) * 38);
	const plan = [];
	const legg = (s) => plan.push(s);
	/** Slidenes ren-tekst (for matching mot manuset ved margtall). */
	const gruppeTekst = (grp) => (typeof grp === 'string' ? grp : grp.map((g) => g.text).join('')).replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
	const emitEkstra = (ekstra) => {
		const joined = flytAvsnitt(((ekstra?.tittel ? ekstra.tittel + '\n' : '') + (ekstra?.innhold ?? '')).trim());
		const grupper = delPptSegs(roleSegments(joined), tekstStorrelse);
		if (grupper.length) grupper.forEach((grp) => legg({ segs: grp, big: false, notat: '' }));
		else legg({ segs: '', big: false, notat: '' });
	};
	legg({ big: true, segs: svc.name + (svc.date ? '\n' + nlDate(svc.date) : '') + (svc.kirkeaar ? '\n' + svc.kirkeaar.name : ''), notat: '' });
	for (const ekstra of (valg.ekstra ?? [])) {
		if ((ekstra?.etter ?? '') === '') emitEkstra(ekstra);
	}
	let forrigeTom = false; // blank etter tittelslidet er lov (som i forhåndsvisningen)
	let forrigeSkjultAvsl = false; // forrige viste ledd hadde skjult avslutning (Smart)
	let sistNokkel = null; // siste emiterte ledd (blanken får dette som anker)
	const leggTom = (smart, grunn) => {
		if (tomModus === 'av' || (tomModus === 'smart' && !smart) || forrigeTom) return;
		legg({ blank: true, etterNokkel: sistNokkel, grunn: grunn ?? 'skjulte' });
		forrigeTom = true;
	};
	const seksjoner = svc.sections ?? [];
	let skjulte = false; // ledd mellom viste ledd som ikke er med i presentasjonen
	for (let si = 0; si < seksjoner.length; si++) {
		const sec = seksjoner[si];
		const items = sec.items ?? [];
		skjulte = false;
		for (let ii = 0; ii < items.length; ii++) {
			const it = items[ii];
			const nokkel = si + ':' + ii;
			if (!it.enabled) {
				for (const ekstra of (valg.ekstra ?? [])) {
					if ((ekstra?.etter ?? '') === nokkel) emitEkstra(ekstra);
				}
				skjulte = true;
				continue;
			}
			leggTom(tomModus === 'smart' && (skjulte || it.__skjultIntro || forrigeSkjultAvsl),
				it.__skjultIntro ? 'intro' : forrigeSkjultAvsl ? 'avsl' : 'skjulte');
			skjulte = false;
			forrigeTom = false;
			forrigeSkjultAvsl = !!it.__skjultAvsl;
			sistNokkel = nokkel;
			const heading = (it.heading || '') + (it.type === 'salme' && (it.salmeNr || it.salmeTittel)
				? (it.heading ? ': ' : '') + [it.salmeNr, it.salmeTittel].filter(Boolean).join(' ') : '');
			const notat = it.pptNotat ?? heading;
			if (it.type === 'salme' && salmeTekst(it)) {
				if (it.__visInnhold === false) {
					legg({ segs: '', big: false, notat, nokkel, del: 0, tekst: '' });
					for (const ekstra of (valg.ekstra ?? [])) {
						if ((ekstra?.etter ?? '') === nokkel) emitEkstra(ekstra);
					}
					continue;
				}
				const vers = salmeTekst(it).split(/\n\s*\n/).map((v) => v.trim()).filter(Boolean);
				let del = 0;
				vers.forEach((v, vi) => {
					const overskrift = vi === 0 && visLeddtitler && heading ? heading + '\n' : '';
					const grupper = delPptSegs(roleSegments(flytAvsnitt(overskrift + v)), tekstStorrelse);
					grupper.forEach((grp, gi) => { legg({ segs: grp, big: false, notat: vi === 0 && gi === 0 ? notat : '', nokkel, del: del++ }); });
				});
				for (const ekstra of (valg.ekstra ?? [])) {
					if ((ekstra?.etter ?? '') === nokkel) emitEkstra(ekstra);
				}
				continue;
			}
			let lines = [];
			if (it.__visInnhold === false) lines = null;
			if (lines && showInstr && it.instr) lines.push(it.instr.replace(/\{\{\/?r\}\}/g, ''));
			if (it.type !== 'salme') {
				const t = showInstr ? leddTekst(it) : stripNotat(leddTekst(it));
				if (lines && t) lines.push(t);
			} else if (lines && it.alts && it.alts.length) {
				if (it.selAlt != null && it.alts[it.selAlt]) lines.push(it.alts[it.selAlt].text);
			} else if (lines && it.text) {
				lines.push(it.text);
			}
			// beholdLinjer: linjeskiftene fra redigeringen er førende (WYSIWYG — forhåndsvisningen,
			// PDF og docx viser tekstens egne linjeskift, f.eks. evangelietekstens korte linjer)
			const joined = lines ? flytAvsnitt(((visLeddtitler && heading ? heading + '\n' : '') + lines.join('\n')).trim(), { beholdLinjer: true }) : (visLeddtitler && heading ? heading.trim() : '');
			if (!joined) { legg({ segs: '', big: false, notat, nokkel, del: 0 }); }
			else for (const [gi, grp] of delPptSegs(roleSegments(joined), tekstStorrelse).entries()) legg({ segs: grp, big: false, notat: gi === 0 ? notat : '', nokkel, del: gi, tekst: gruppeTekst(grp) });
			for (const ekstra of (valg.ekstra ?? [])) {
				if ((ekstra?.etter ?? '') === nokkel) emitEkstra(ekstra);
			}
		}
	}
	// nummerer slidene (1-basert) og registrer posisjonene til alle ledd
	plan.forEach((s, i) => { s.nr = i + 1; });
	plan.posisjoner = {};
	let sist = null;
	for (let i = 0; i < plan.length; i++) {
		const s = plan[i];
		if (s.nokkel != null) {
			const p = (plan.posisjoner[s.nokkel] ??= { forste: null, deler: [] });
			if (p.forste == null) p.forste = s.nr;
			p.deler.push({ n: s.nr, del: s.del ?? 0 });
		}
		// posisjon for ALLE ledd (også de som ikke har egne slides): sist viste
		// slide før neste emission + blank-logikken håndteres i lysbildeTallFor
		sist = s.nr;
	}
		// Smart: blank side til slutt hvis siste viste ledd har skjult avslutning
	// eller det ligger skjulte ledd etter det (fremdeles aldri dobbelt-blank)
	if (tomModus === 'smart' && (skjulte || forrigeSkjultAvsl) && plan.length && !plan[plan.length - 1].blank) legg({ blank: true });
return plan;
}

/** Margtall for lysbildemanuset: map 'si:ii' → [{ n, del }] — tallet = sliden
 *  som vises når leddet begynner. Ledd med egne slides: første slide (med del
 *  per vers/del). Ledd uten slides (ikke i skjermutvalget): sliden som vises
 *  under det = neste emitterte slide − 1 (blanken foran neste innhold, eller
 *  forrige innholdsslide når tomSlide er av). Ingen slide etter → intet tall. */
export function lysbildeTallFor(plan, manuscript, ppt = null) {
	const tall = {};
	if (!manuscript?.sections || !plan?.posisjoner) return tall;
	// planens gruppe-tekster per ledd (tekstmatch for manustall):
	const planTekst = {};
	for (const s of (plan ?? [])) {
		if (s.nokkel == null || s.blank) continue;
		const txt = (typeof s.segs === 'string' ? s.segs : (s.segs ?? []).map((x) => x.text).join('')).replace(/\s+/g, ' ').trim().toLowerCase().slice(0, 60);
		if (!txt) continue;
		(planTekst[s.nokkel] ??= []).push({ n: s.nr, tekst: txt, del: s.del ?? 0 });
	}
	Object.defineProperty(tall, 'planTekst', { value: planTekst, enumerable: false });
	// pptx-delingsparametere følger med kartet (non-enumerable: påvirker ikke
	// nøkkeltellingen eller JSON-persistering)
	if (ppt) Object.defineProperty(tall, 'lysPpt', { value: ppt, enumerable: false });
	const pos = plan.posisjoner;
	const sects = manuscript.sections ?? [];
	// tjenesterekkefølgen av leddnøkler (samme posisjoner i begge kopiene)
	const rekkefolge = [];
	for (let si = 0; si < sects.length; si++) {
		const items = sects[si]?.items ?? [];
		for (let ii = 0; ii < items.length; ii++) rekkefolge.push(si + ':' + ii);
	}
	const idxAv = new Map(rekkefolge.map((k, i) => [k, i]));
	for (const nokkel of rekkefolge) {
		const p = pos[nokkel];
		if (p && p.forste != null) { tall[nokkel] = p.deler; continue; }
		// finn første førsteslide tilhørende et ledd ETTER dette punktet
		let funnet = null;
		for (const s of plan) {
			if (s.nokkel == null) continue;
			const p2 = pos[s.nokkel];
			if (!p2 || p2.forste !== s.nr) continue;
			const pIdx = idxAv.get(s.nokkel);
			if (pIdx != null && pIdx > idxAv.get(nokkel)) { funnet = s.nr; break; }
		}
		if (funnet == null || funnet <= 1) continue;
		tall[nokkel] = [{ n: funnet - 1, del: 0 }];
	}
	// blanke slides får også tall i manuset: 'intro' = foran neste ledds første
	// gruppe, 'avsl'/avsluttende = etter forrige ledds siste gruppe. 'skjulte'
	// dekkes av F-1-tallet på de skjulte leddene (samme nummer, ingen dobbelt).
	for (let i = 0; i < plan.length; i++) {
		const s = plan[i];
		if (!s.blank) continue;
		let neste = null;
		for (let q = i + 1; q < plan.length; q++) { if (!plan[q].blank) { neste = plan[q]; break; } }
		if ((!s.grunn || s.grunn === 'intro') && neste?.nokkel && tall[neste.nokkel]?.length) {
			tall[neste.nokkel].unshift({ n: neste.nr - 1, del: 0, tom: true });
		} else if ((s.grunn === 'avsl' || !neste) && s.etterNokkel && tall[s.etterNokkel]?.length) {
			tall[s.etterNokkel].push({ n: s.nr, del: -1, tom: true });
		}
	}
	return tall;
}

export async function exportPptx(svc, valg = {}, tilDisk = false) {
	const pptx = new PptxGenJS();
	pptx.layout = 'LAYOUT_16x9';
	const tomModus = valg.tomSlideModus ?? (valg.tomSlide ? 'alle' : 'av'); // 'av' | 'alle' | 'smart'
	const lys = !!valg.lysBakgrunn; // lys bakgrunn: hvite slides med mørk tekst (teksten forblir lesbar)
	// farger: mørk standard, lys variant med tilpasset rød/grå
	const fBakgrunn = lys ? 'FFFFFF' : '0D0D0F';
	const fTekst = lys ? '1A1A1E' : 'E8E8EC';
	const fRod = lys ? 'D93A2B' : 'FF6B5E'; // lys app-modus men mørke slides: sterkere rød (kontrast mot svart)
	const fGraa = lys ? '666666' : 'A0A0A8';
	const showInstr = valg.showInstr !== undefined ? !!valg.showInstr : false;
	const visLeddtitler = !!valg.visLeddtitler; // leddtitler på slidene (standard av)
	const justering = valg.justering ?? 'center'; // tekstjustering: left | center | right (standard senter)
	// skriftskala (valg.tekstSkala/valg.tittelSkala = multiplikator; grunn 24/40 pt)
	const tekstStorrelse = Math.round((valg.tekstSkala ?? 1) * 38); // grunn 38 pt
	const tittelStorrelse = Math.round((valg.tittelSkala ?? 1) * 40);
	const addSlide = (segs, big = false, notat = '', blank = false) => {
		const s = pptx.addSlide();
		s.background = { color: fBakgrunn };
		if (notat) s.addNotes(notat);
		if (blank) return; // tom mellomside — ingen tekst
		// segs: tekst eller array av {text, red}. NB: forhåndsvisningen rendrer segmentene
		// INLINE — linjeskift kommer KUN fra '\n'-segmentene. breakLine på hvert run ga
		// rolle-prefikser på egne linjer og doble linjeskift i eksporten (likte ikke visningen).
		const parts = typeof segs === 'string'
			? [{ text: segs, options: { fontSize: big ? tittelStorrelse : tekstStorrelse, bold: big, color: fTekst } }]
			: (() => {
				const ut = [];
				for (const seg of segs) {
					if (seg.text === '\n') { if (ut.length) ut[ut.length - 1].options.breakLine = true; continue; }
					ut.push({
						text: seg.text,
						options: {
							// versnummer i hevet skrift: redusert strrelse (som i PDF-manuset)
							fontSize: Math.round((big ? tittelStorrelse : tekstStorrelse) * (seg.sup ? 0.72 : 1)),
							bold: big || !!seg.red || !!seg.bold,
							italics: !!seg.italics || !!seg.small,
							superscript: !!seg.sup,
							color: seg.red ? fRod : seg.small ? fGraa : fTekst, breakLine: false
						}
					});
				}
				return ut;
			})();
		s.addText(parts, {
			x: 0.6, y: 0.6, w: 8.8, h: 4.2, fontFace: 'Arial',
			align: justering, valign: 'top', lineSpacingMultiple: 1.15,
			// NB: kun shrinkText (normAutofit) — autoFit + shrinkText sammen skriver BÅDE
			// <a:normAutofit/> og <a:spAutoFit/> i bodyPr, som bryter OOXML-skjemaet
			// (kun én autofit-variant er tillatt) og får PowerPoint til å «reparere» filen.
			shrinkText: true
		});
	};
	// lysbildeplanen: samme gåur som før, men som data — slidenes rekkefølge og
	// anker til leddene brukes også av lysbildemanusets margtall
	const plan = byggSlidePlan(svc, valg);
	for (const s of plan) {
		if (s.blank) {
			const bl = pptx.addSlide();
			bl.background = { color: fBakgrunn };
			continue;
		}
		addSlide(s.segs, s.big, s.notat ?? '');
	}
	// pptxgenjs 4.0.1 skriver <Override> for slideMaster2..N (én per slide), men bare
	// slideMaster1.xml eksisterer — PowerPoint krever samsvar og tilbyr «reparer filen».
	// (LibreOffice/python-pptx er tolerante, derfor så filen grei ut i testene.)
	// Fiks: fjern de overskytende Override-ene fra [Content_Types].xml i zip'en.
	const zipBuf = await pptx.write({ outputType: 'arraybuffer' });
	const zip = await JSZip.loadAsync(zipBuf);
	let ct = await zip.file('[Content_Types].xml').async('string');
	ct = ct.replace(/<Override PartName="\/ppt\/slideMasters\/slideMaster([2-9]\d*)\.xml"[^>]*\/>/g, '');
	zip.file('[Content_Types].xml', ct);
	const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
	if (tilDisk) return { base64: await blobTilBase64(blob), filnavn: valg.filnavn ?? safeName(svc.name) + '.pptx', plan };
	download(blob, safeName(svc.name) + '.pptx');
}

/** Bygg PDF (base64) med jsPDF — sidestørrelse og kolonner som Word.
 *  valg.hefte: kompakt 4-siders modus (menighetsprogram som brettes) — mindre skrift,
 *  strammere mellomrom og smalere marg. */
export function buildPdfBase64(svc, showInstr, valg = {}) {
	const skriftSkala = { hoveddel: 1, ledd: 1, tekst: 1, ...(valg.skriftSkala ?? {}) }; // manuell fontjustering (forhåndsvisning + eksport)
	const a5 = valg.storrelse === 'A5';
	const hefte = !!valg.hefte;
	const marger = valg.marger ?? (hefte ? 'smal' : 'normal');
	const mm = { w: a5 ? 148 : 210, h: a5 ? 210 : 297 };
	const doc = new jsPDF({ unit: 'mm', format: [mm.w, mm.h] });
	// spor: valgfri tegne-sporing for HTML-forhåndsvisningen — hvert doc.text/line
	// registreres med posisjon (mm) og stil, så forhåndsvisningen kan rendres som
	// SVG side for side IDENTISK med PDF-en (samme linjebrudd og paginering).
	const spor = Array.isArray(valg.__spor) ? valg.__spor : null;
	if (spor) {
		const st = { size: 10.5, font: 'times', style: 'normal', color: 'rgb(20,20,20)', draw: 'rgb(180,180,180)', lw: 1 };

		const haak = (fn, rec) => { const o = doc[fn].bind(doc); doc[fn] = (...a) => { rec(...a); return o(...a); }; };
		haak('setFont', (a, b) => { st.font = a; st.style = b; });
		haak('setFontSize', (n) => { st.size = n; });
		haak('setTextColor', (...a) => { st.color = 'rgb(' + a.slice(0, 3).join(',') + ')'; });
		haak('setDrawColor', (...a) => { st.draw = 'rgb(' + a.slice(0, 3).join(',') + ')'; });
		haak('setLineWidth', (n) => { st.lw = n; });
		haak('text', (t, x, y) => { spor.push({ type: 'text', text: String(t), x, y, size: st.size, font: st.font, style: st.style, color: st.color }); });
		haak('line', (x1, y1, x2, y2) => { spor.push({ type: 'line', x1, y1, x2, y2, color: st.draw, width: st.lw }); });
		haak('addPage', () => { spor.push({ type: 'side' }); });
		haak('setPage', (i) => { spor.push({ type: 'setPage', page: i }); });
	}
	if (spor) spor.push({ type: 'fase', navn: 'p0' });
	const margin = marger === 'smal' ? 10 : marger === 'bred' ? 20 : 15;
	// lysbildemanus: tall i venstre marg — utvid venstre marg og tegn tallene der
	const lysTall = valg.lysbildeTall ?? null;
	const lysMargin = 0; // prøveutgave: ikke utvid venstre marg — tallene tegnes i den opprinnelige
	const margV = margin + lysMargin;
	const kolonner = valg.kolonner === 2 ? 2 : 1;
	const colGap = hefte ? 4 : 6;
	const colW = (mm.w - margV - margin - colGap * (kolonner - 1)) / kolonner;
	// skriftskala: hefte 0,85× — brødtekst ~9 pt, overskrifter proporsjonalt mindre
	const skala = hefte ? 0.85 : 1;
	// avstand mellom ledd (valget «Avstand»): separate for/etter-faktorer —
	// «tett» skal ha mer luft FØR ledd og mindre ETTER
	// samme faktor for før og etter — forholdet mellom forrige/kommende tekst skal
	// være uavhengig av avstandsvalget
	const afFor = valg.avstand === 'tett' ? 0.75 : valg.avstand === 'luft' ? 1.5 : 1;
	const afEtter = afFor;
	const S = (n, omr) => {
		const f = omr ? (skriftSkala[omr] ?? 1) : 1;
		return Math.round(n * skala * f * 10) / 10;
	};

	const ROLE = [31, 112, 77];   // ikke brukt direkte; rød = #C0392B
	const RED = [192, 57, 43];
	const GRAY = [119, 119, 119];

	let col = 0;
	let y = margin;
	let flytCx = null; // nåværende x i den flytende teksten (slidegrenser midt i linje)
	let linjeTegnet = false; // har nåværende linje i den flytende teksten innhold?
	let bruddSidenTekst = 0; // linjeskift siden siste tegnede tekst (avsnittskift = to brudd)

	const nySideHvisNodvendig = (h) => {
		if (y + h > mm.h - margin) {
			// to kolonner: fyll venstre kolonne først, deretter høyre, før ny side
			if (kolonner === 2 && col === 0) { col = 1; y = margin; return true; }
			doc.addPage(); y = margin; col = 0; return true;
		}
		return false;
	};
	const x0 = () => margV + col * (colW + colGap);
	/** Fjern de første 'ant' tekstlinjene fra en segmentgruppe (allerede tegnet
 *  som overskrift/instruksjon i manuset). */
	const stripForan = (segs, ant) => {
		if (!ant) return segs;
		const ut = [];
		let igjen = ant;
		for (const s of segs) {
			if (igjen <= 0) { ut.push(s); continue; }
			if (s.text === '\n') continue; // linjeskift mellom hoppede linjer
			const deler = s.text.split('\n');
			const behold = deler.slice(igjen);
			igjen = Math.max(0, igjen - deler.length);
			if (behold.length) ut.push({ ...s, text: behold.join('\n') });
		}
		return ut;
	};
	/** Tegn lysbildenummer i venstre marg på nåværende linje (høyrestilt). */
	let sistLysPos = null; // [x, y, side] — anti-kollisjon for margtall
	const tegnLysTall = (n, yPaa, xPaa) => {
		if (!lysTall || n == null) return;
		// blå sirkel med blått tall i — i den opprinnelige venstre margen
		const baseX = Math.max(3.5, margin - 6);
		let cx = xPaa ?? baseX;
		let cy = (yPaa ?? y) + 2.1;
		// ett nummer per visuell linje: et nummer som lander p en linje som alt
		// har nummer DROPES (brukerens regel - skjermoperatren frer teksten likevel)
		const side = (typeof doc.getCurrentPageInfo === 'function') ? doc.getCurrentPageInfo().pageNumber : 1;
		if (sistLysPos && side === sistLysPos[2] && Math.abs(cy - sistLysPos[1]) < 3) return;
		doc.setDrawColor(37, 99, 235);
		doc.setLineWidth(0.5);
		doc.circle(cx, cy, 2.2, 'S');
		doc.setFont('helvetica', 'bold');
		doc.setFontSize(8.5);
		doc.setTextColor(37, 99, 235);
		doc.text(String(n), cx, cy + 1.15, { align: 'center' });
		sistLysPos = [cx, cy, side];
	};
	/** Tegn en stakk av lysbildenumre i margen (5 mm mellomrom) — teksten påvirkes ikke. */
	const tegnLysStakk = (nrs, yBasis) => {
		if (!nrs?.length) return; // NB: tegnes også i trang marg (lysMargin = 0)
		// SIDELANGS, 2 per rad (5 mm radavstand) — aldri tall over/under hverandre
		const x0Lys = Math.max(3.5, margin - 6);
		nrs.forEach((n, k) => {
			const kol = k % 2;
			const rad = Math.floor(k / 2);
			tegnLysTall(n, (yBasis ?? y) + rad * 5, x0Lys + kol * 4.7);
		});
	};

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
				nySideHvisNodvendig((opts.size ?? 10.5) * 0.48 + 1.2);
				doc.text(l, x0() + indent, y + 4);
				y += size * 0.48 + 1.1;
			}
		}
		flytCx = null; // skrivLinjer avslutter alltid på en fersk linje
		linjeTegnet = false;
		bruddSidenTekst = 0;
	};

	/** Skriv segmenter fra roleSegments() flytende på linjen: røde rollemerker og
	 *  {{r}}-segmenter inline, ikke på egne linjer. */
	const skrivSegmenter = (segs, opts = {}) => {
		const { size: baseSize = 10.5, indent = 0, vidare = false, vedForsteTekst = null, maalPos = null } = opts;
		const w = colW - indent;
		let cx = vidare && flytCx != null ? flytCx : x0() + indent;
		// første linje kan ellers tegnes under sidebunnen hvis y ble skjøvet forbi den
		if (y + baseSize * 0.9 > mm.h - margin) nySideHvisNodvendig(baseSize * 0.9);
		const nylinje = () => {
			nySideHvisNodvendig(baseSize * 0.48 + 1.2); // reserve = linjehoyden (5 var for lite — linjen landet 1-2 mm i bunnmargen)
			cx = x0() + indent;
			flytCx = null;
			linjeTegnet = false;
			y += baseSize * 0.48 + 1.1;
		};
		let forsteTekst = !vedForsteTekst;
		// tomme linjer i kildeteksten = avsnittsgrense: neste linje får ekstra
		// avsnittsavstand i stedet for en tom linje (følger avstand-valget)
		let avsnittNeste = false;
		const avsnittLuft = 2.2 * (valg.avstand === 'tett' ? 0.75 : valg.avstand === 'luftig' ? 1.5 : 1);
		// lysbildetall «flytende»: sporer tegn-offset og fyrr maalPos.ved(gruppe, y)
		// naar en slidetekst begynner på en linje
		let maalNeste = maalPos ? (maalPos.fra ?? 0) : 0;
		let segStart = 0; // offset for naavaerende segment i den komponerte teksten
		for (const seg of segs) {
			const size = seg.small ? baseSize - 1.5 : baseSize;
			doc.setFont(seg.mdH ? 'helvetica' : 'times', seg.bold && seg.italics ? 'bolditalic' : seg.bold ? 'bold' : seg.italics ? 'italic' : 'normal');
			doc.setFontSize(size);
			doc.setTextColor(...(seg.red ? RED : seg.small ? GRAY : [20, 20, 20]));
			let del = 0; // tegn-offset innenfor segmentet (kildeteksten, markører inkludert)
			const parts = seg.text.split('\n');
			parts.forEach((part, pi) => {
				if (pi > 0) {
					del++; // \n tegnes med i flat-offsetten (margtall-å-ben)
					// TOM LINJE = avsnittsgrense: ingen tom linje i eksporten, kun
					// avsnittsavstand (følger avstand-valget tett/normal/luftig)
					if (!part.trim()) {
						if (linjeTegnet) nylinje();
						avsnittNeste = true;
						return;
					}
					if (linjeTegnet) nylinje();
					if (avsnittNeste) { y += avsnittLuft; nySideHvisNodvendig(14); avsnittNeste = false; }
				}
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
					const restStart = del;
					while (rest) {
						const restBredde = w - (cx - x0() - indent);
						if (restBredde < doc.getTextWidth('XX')) nylinje();
						const wrapped = erSup ? [rest] : doc.splitTextToSize(rest, w - (cx - x0() - indent));
						const l = wrapped[0];
						if (!l) { nylinje(); continue; }
					if (maalPos) {
						const linjeSlutt = segStart + del + l.length;
						let fyrt = false;
						while (maalPos.starts && maalNeste < maalPos.starts.length && maalPos.starts[maalNeste] < linjeSlutt) {
							maalPos.ved(maalNeste, y);
							maalNeste++;
							fyrt = true;
						}
						if (fyrt) {
							doc.setFont(seg.mdH ? 'helvetica' : 'times', seg.bold && seg.italics ? 'bolditalic' : seg.bold ? 'bold' : seg.italics ? 'italic' : 'normal');
							doc.setFontSize(supSize);
							doc.setTextColor(...(seg.red ? RED : seg.small ? GRAY : [20, 20, 20]));
					}
					}
						if (!forsteTekst) {
							forsteTekst = true;
							vedForsteTekst?.();
							// tallet-endringen endrer farge/skrift — gjenopprett segmentets stil
							doc.setFont(seg.mdH ? 'helvetica' : 'times', seg.bold && seg.italics ? 'bolditalic' : seg.bold ? 'bold' : seg.italics ? 'italic' : 'normal');
							doc.setFontSize(supSize);
							doc.setTextColor(...(seg.red ? RED : seg.small ? GRAY : [20, 20, 20]));
						}
						// linje-hook: offset for den visuelle linjens frste tegn (margtall-k)
						if (!linjeTegnet && maalPos?.linje) {
							maalPos.linje(y);
							doc.setFont(seg.mdH ? 'helvetica' : 'times', seg.bold && seg.italics ? 'bolditalic' : seg.bold ? 'bold' : seg.italics ? 'italic' : 'normal');
							doc.setFontSize(supSize);
							doc.setTextColor(...(seg.red ? RED : seg.small ? GRAY : [20, 20, 20]));
						}
						linjeTegnet = true;
						bruddSidenTekst = 0;
						doc.text(l, cx, y + (erSup ? 2.2 : 4));
						maalPos?.tekst?.(l);
						cx += doc.getTextWidth(l);
						del += l.length + (rest.length - rest.slice(l.length).replace(/^ +/, '').length);
						rest = rest.slice(l.length).replace(/^ +/, '');
						if (rest) nylinje();
					}
					doc.setFontSize(size);
				}
			});
			segStart += seg.text.length;
		}
		flytCx = cx;
	};

	// tittelside-informasjon (kan slås av — «Navn og dato»-raden i eksportmodulen)
	if (svc.__visTittel !== false && valg.tittel !== false) {
		skrivLinjer(svc.name, { bold: true, size: S(16), sans: true });
		if (svc.date || svc.kirkeaar?.name) {
			skrivLinjer([svc.date ? nlDate(svc.date) : '', svc.kirkeaar?.name ?? ''].filter(Boolean).join(' · '), { gray: true, italics: true, size: S(10) });
		}
		y += hefte ? 2.5 : 4; // kun når tittelen faktisk er tegnet (ellers ekstra luft over første ledd)
	}
	if (spor) spor.push({ type: 'fase', navn: 'p1-tittel' });

	// hoveddel-overskriftene («Forberedelse», «Hoveddel» …) kan utelates fra siden
	const visAvsnittstitler = valg.visAvsnittstitler !== false;
	for (let si = 0; si < svc.sections.length; si++) {
		const sec = svc.sections[si];
		y += hefte ? 4 : (visAvsnittstitler ? 8 : 4); // luft før seksjonen (mindre når overskriften utelates)
		nySideHvisNodvendig(12);
		if (visAvsnittstitler) {
			skrivLinjer(sec.title, { bold: true, size: S(11, 'hoveddel'), sans: true });
			// horisontal linje under hoveddel-overskriften (skiller den fra leddoverskriftene)
			const linjeY = y + 1;
			doc.setDrawColor(180, 180, 180);
			doc.setLineWidth(0.3);
			doc.line(x0(), linjeY, x0() + colW, linjeY);
			y = linjeY + (hefte ? 1 : 1.5);
		}
		let forsteLedd = true;
		// ordnet manus-til-plan-gruppe-matching: pekeren gr bare fremover s feilplasserte
		// tall unngs nr manuset og Skjerm-planen grupperer teksten ulikt
		const matchGruppe = lagGruppeMapper();
		for (let ii = 0; ii < sec.items.length; ii++) {
			const it = sec.items[ii];
			if (!it.enabled) continue;
			// sideskift: ny side før leddet (Word-fanget i buildOutline-renderen)
			if (it.sideskift && !(si === 0 && ii === 0)) { doc.addPage(); y = margin; col = 0; }
			const nokkel = si + ':' + ii;
			const lys = lysTall ? lysTall[nokkel] ?? null : null;
			// pptx-delingsparametere: uten dem kan ikke manuset speile slidenes
			// tekstdeling og tallene havner bare på leddets første slide
			const lysPpt = lys && (valg.lysbildeTall?.lysPpt ?? valg.lysbildePpt) ? (valg.lysbildeTall?.lysPpt ?? valg.lysbildePpt) : null;
			let head = it.heading || '';
			if (it.type === 'salme' && (it.salmeNr || it.salmeTittel)) head += (head ? ': ' : '') + [it.salmeNr, it.salmeTittel].filter(Boolean).join(' ');
			// avsnittstitler AV: første ledd behøver ikke ekstra topp-luft (avsnittslinjen
			// ga den — uten den blir luften dobbelt opplevert)
			const toppLuft = ((!visAvsnittstitler && forsteLedd) ? (hefte ? 1.5 : 2.5) : (hefte ? 3.2 : 5.5)) * afFor;
			forsteLedd = false;
			let lysTegnet = false;
			// hvert ledd starter på fersk linje i den flytende teksten
			flytCx = null; linjeTegnet = false; bruddSidenTekst = 0;
			let hodeY = null, instrY = null;
			if (head && it.__visOverskrift !== false) {
				y += toppLuft; nySideHvisNodvendig(10);
				hodeY = y;
				skrivLinjer(head.replace(/\{\{\/?r\}\}/g, ''), { bold: true, size: S(11, 'ledd'), sans: true }); y += 0.6;
			}
			if (it.__visInnhold === false) continue;
			if ((showInstr ?? true) && it.instr) { instrY = y; skrivLinjer(it.instr.replace(/\{\{\/?r\}\}/g, ''), { red: true, italics: true, size: S(9.5) }); y += 1.5; }
			// @r — hele linjen som rolle
			let tekst = '';
			const erPlassholder = (t) => /^\[(Skriv tekst her|Velg alternativ|Salme: settes inn)\]$/.test((t ?? '').trim());
			if (it.type === 'salme') tekst = erPlassholder(salmeTekst(it)) ? '' : salmeTekst(it);
			else if (it.selAlt == null && it.alts?.length) tekst = '';
			else {
				tekst = (showInstr ?? true) ? leddTekst(it) : stripNotat(leddTekst(it));
				// alternativ med plassholder ([Skriv tekst her]) = tomt ledd
				if (it.alts?.length && erPlassholder(it.alts[it.selAlt ?? 0]?.text)) tekst = '';
			}
			tekst = (tekst || '').replace(/^@r ?\|? ?(.+)$/gm, (m, t) => '@r ' + t);
			// roleSegments håndterer @r-linjer (hele linjen rød), inline {{r}}…{{/r}} inline,
			// rollemerker som «L |», FOTNOTE og markdown — alt flytende på linjen
			// Linjeskiftene fra redigeringen er førende (beholdLinjer) — WYSIWYG mot
			// forhåndsvisningen og docx-eksporten.
			const brukGrupper = lys && lys.length && lysPpt;
			if (brukGrupper && it.type === 'salme') {
				// Salmer: ett tall per vers, plassert ved versets første linje («ca. hvor
				// lysbildet begynner» — planen deler som regel én slide per vers).
				const vers = (tekst || '').split(/\n\s*\n/).map((v) => v.trim()).filter(Boolean);
				vers.forEach((v, vi) => {
					const t = (lys ?? [])[vi];
					if (t && !t.tom) tegnLysTall(t.n);
					skrivSegmenter(roleSegments(flytAvsnitt(v, { beholdLinjer: true })), { size: S(10.5, 'tekst') });
					if (vi < vers.length - 1) { y += 2 * (S(10.5, 'tekst') * 0.48 + 1.1); nySideHvisNodvendig(14); } // vers-skille
				});
				// avsluttende blank-side-tall etter siste vers (Smart)
				const avsluttende = (lys ?? []).filter((e) => e.tom && e.del === -1).map((e) => e.n);
				if (avsluttende.length) tegnLysStakk(avsluttende, y);
			} else if (brukGrupper) {
				// Margtall pr linje: nummeret for en slide tegnes p det VISUELLE LINJEN
				// der slideteksten BEGYNNER (tekstmatch mot den renderte teksten). Deles
				// - p samme linje - utsettes tallet til NESTE linje, eller droppes hvis
				// ogs den er opptatt (brukerens regel: skjerm-operatron frer teksten).
				const flatSegs = roleSegments(flytAvsnitt(tekst, { beholdLinjer: true }));
				const planDel = (valg.lysbildeTall?.planTekst?.[nokkel] ?? [])
					.map((e) => ({ nr: e.n, tekst: String(e.tekst ?? '').replace(/\s+/g, ' ').trim().toLowerCase() }))
					.filter((e) => e.tekst.length > 8);
				const ledende = (lys ?? []).filter((e) => e.tom && e.del !== -1).map((e) => e.n);
				const avsluttende = (lys ?? []).filter((e) => e.tom && e.del === -1).map((e) => e.n);
				let linjeY = null, linjeTekst = '', tallPaaLinje = false, sistNummer = null, nesteKue = 0, venteNr = null, ledTegnet = false;
				const linjeAv = S(10.5, 'tekst') * 0.48 + 1.1;
				const norm = (s) => s.toLowerCase().replace(/\s+/g, ' ');
				skrivSegmenter(flatSegs, {
					size: S(10.5, 'tekst'),
					maalPos: {
						linje: (y) => {
							// ny visuell linje: utsatt nummer frst, s ledetall-reserve
							linjeY = y; linjeTekst = ''; tallPaaLinje = false;
							if (venteNr != null) { tegnLysTall(venteNr, y); sistNummer = venteNr; venteNr = null; tallPaaLinje = true; }
							if (!tallPaaLinje && !ledTegnet && ledende.length) { tegnLysTall(ledende[0], y); tallPaaLinje = true; }
							ledTegnet = true;
						},
						tekst: (t) => {
							linjeTekst += t;
							let p = planDel[nesteKue];
							while (p && norm(linjeTekst).includes(p.tekst.slice(0, 16))) {
								// slideteksten begynner i denne linjen: tegn her hvis linjen er
								// ledig, ellers UTSETT til neste linje (kollisjon = droppes)
								if (!tallPaaLinje) { tegnLysTall(p.nr, linjeY); tallPaaLinje = true; }
								else if (venteNr == null) venteNr = p.nr;
								nesteKue++;
								p = planDel[nesteKue];
							}
						}					}
				});
				// avsluttende blanker (etter leddet) p leddets siste linje
				if (avsluttende.length) tegnLysStakk(avsluttende, y - linjeAv);
			} else if (!brukGrupper && it.type === 'salme' && lys && lys.length) {
				// salme med lysbildetall uten pptx-parametere: vers-for-vers, sekvensielt
				const vers = (tekst || '').split(/\n\s*\n/).map((v) => v.trim()).filter(Boolean);
				vers.forEach((v, vi) => {
					const t = lys.find((x) => x.del === vi) ?? lys[vi] ?? null;
					if (t) tegnLysTall(t.n);
					skrivSegmenter(roleSegments(flytAvsnitt(v, { beholdLinjer: true })), { size: S(10.5, 'tekst') });
					if (vi < vers.length - 1) { y += 2 * (S(10.5, 'tekst') * 0.48 + 1.1); nySideHvisNodvendig(14); } // vers-skille = linje + blank linje
				});
			} else {
				if (lys && lys.length && !lysTegnet) tegnLysTall(lys[0].n);
				skrivSegmenter(roleSegments(flytAvsnitt(tekst, { beholdLinjer: true })), { size: S(10.5, 'tekst') });
			}
			y += (hefte ? 1.8 : 3) * afEtter;
		}
		if (spor) spor.push({ type: 'fase', navn: 'p2-seksjon' });
	}
	if (spor) spor.push({ type: 'fase', navn: 'p3-etter-seksjoner' });
	// sidetall «side/total» i bunnen av hver side (etter at alt innhold er tegnet)
	const totalt = doc.getNumberOfPages();
	const sidetallY = mm.h - (marger === 'smal' ? 3.5 : 6); // smal marg → sidetallet litt lenger ned
	for (let i = 1; i <= totalt; i++) {
		doc.setPage(i);
		doc.setFont('times', 'normal');
		doc.setFontSize(9);
		doc.setTextColor(136, 136, 136);
		doc.text(`${i}/${totalt}`, mm.w / 2, sidetallY, { align: 'center' });
	}
	if (spor) spor.push({ type: 'fase', navn: 'p4-etter-sidetall' });
	const uri = doc.output('datauristring');
	return { base64: String(uri).split(',')[1] ?? '', doc };
}

/** Bygg PDF-layouten (samme motor som buildPdfBase64) og returner sidene som
 *  tegneoperasjoner i mm — forhåndsvisningen renderer dem som SVG side for side,
 *  identisk med den eksporterte PDF-en (samme linjebrudd og paginering), uten
 *  pdf.js-rasterisering. */
export function byggPdfSider(svc, showInstr, valg = {}) {
	const spor = [];
	buildPdfBase64(svc, showInstr, { ...valg, __spor: spor });
	const a4 = valg.storrelse === 'A4';
	const mm = { w: a4 ? 210 : 148, h: a4 ? 297 : 210 };
	// spill av op-ene med sideindeks-sporing: 'side' (addPage) → neste side,
	// 'setPage' → hopp til side (sidetallsopsene mot slutten)
	const perSide = [];
	let cur = 0;
	for (const op of spor) {
		if (op.type === 'side') { cur++; continue; }
		if (op.type === 'setPage') { cur = op.page - 1; continue; }
		if (op.type === 'fase') { continue; }
		(perSide[cur] ??= []).push(op);
	}
	return { sider: perSide.map((ops) => ({ ops: ops ?? [], w: mm.w, h: mm.h })), w: mm.w, h: mm.h };
}
