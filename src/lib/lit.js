/** Komponert tekst for et ledd: innledning (introAlts) + fast innledning (it.text ved ledd
 *  med alts) + valgt alternativ + avslutning. De faste leddene er gyldig liturgi som arves
 *  fra malen og skal vises i redigeringen og følge med i eksporten. */
export function leddTekst(it) {
	const deler = [];
	if (it.introAlts?.length) deler.push(it.introAlts[it.selIntro ?? 0]?.text ?? '');
	if (it.alts?.length) {
		if (it.text && it.text.trim()) deler.push(it.text);   // fast innledning
		deler.push(it.alts[it.selAlt ?? 0]?.text ?? '');
	} else {
		deler.push(it.text ?? '');
	}
	if (it.avslutningAlts?.length) deler.push(it.avslutningAlts[it.selAvsl ?? 0]?.text ?? '');
	return deler.filter((s) => s && s.trim()).join('\n\n');
}

/** Render liturgitext til HTML: rollemerker ({{r}}…{{/r}}) i rødt, «@r |»- eller «@r»-linjer
 *  (hele linjen som rolle), «BIBELREF | » (bibelreferanse) og «FOTNOTE | » (liten tekstnotis) formateres begge som små fotnoter, og enkel markdown
 *  (**fet**, *urskrift*, «# overskrift», «- punktliste»). */
export function litHtml(text) {
	let out = (text ?? '')
		.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
		// {{refreng}}…{{/refreng}} — hele refrenget i kursiv (spennet beskyttes mot videre md).
		// Ledende/avluttende linjeskift trimmes — ellers blir det ekstra tomme linjer
		// før og etter refrenget i visningen (markøren er på egen linje i kilden).
		.replace(/\{\{refreng\}\}([\s\S]*?)\{\{\/refreng\}\}/g, (m, t) => '<span class="refreng">' + t.replace(/^\n+/, '').replace(/\n+$/, '') + '</span>')
		.replace(/^(?:BIBELREF|FOTNOTE) \| ?(.*)$/gm, (m, t) => '<span class="fotnote">' + mdInline(t) + '</span>')
		// hele-linje notis: @NOTAT eller @n — rød kursiv, litt mindre enn brødteksten
		.replace(/^@(?:NOTAT|n) ?\|? ?(.+)$/gm, (m, t) => '<span class="notat">' + mdInline(t) + '</span>')
		// hele-linje salmeinfo (T/M/O-hode og ©-linjer): @COPYRIGHT eller @c — samme stil som fotnote
		.replace(/^@(?:COPYRIGHT|copyright|c)\b ?\|? ?(.+)$/gm, (m, t) => '<span class="copyright">' + mdInline(t) + '</span><br class="br-info">')
		// rene rolleprefiks-linjer: «L |», «ML |», «L/ML |», «KA/L |» osv. → rolle merket rødt, resten inline
		.replace(/^(L\/ML|ML\/L|L\/M|KA\/L|L|ML|M|A|KA|K)(\s*\| ?)/gm, '<span class="role">$1 |</span> ')
		.replace(/^@r ?\|? ?(.+)$/gm, (m, t) => '<span class="role">' + mdInline(t) + '</span>')
		.replace(/\{\{r\}\}([\s\S]*?)\{\{\/r\}\}/g, (m, t) => '<span class="role">' + mdInline(t) + '</span>');
	// blokk-nivå: overskrifter og punktliste (linjenivå, unngå å røre eksisterende spans) — før <br>
	out = out
		.replace(/^## ?(.+)$/gm, (m, t) => '<span class="md-h md-h2">' + mdInline(t) + '</span>')
		.replace(/^# ?(.+)$/gm, (m, t) => '<span class="md-h">' + mdInline(t) + '</span>')
		.replace(/^- (.+)$/gm, (m, t) => '<span class="md-li"><span class="md-bullet">–</span>' + mdInline(t) + '</span>')
		.replace(/\n/g, '<br>');
	// tomme linjer etter skjult salmeinfo: <br> rett etter br-info kollapses — br-info
	// og dens <br> skjules av CSS når salmeinfo er av, kjeden må bort i HTML-en
	out = out.replace(/(<br class="br-info">)(<br>)+/g, '$1');
	// punktliste: md-li er block; <br> MELLOM to md-li gir dobbelt linjeskift
	// (avstanden ble større i visningen enn i redigeringen). Behold <br> etter
	// den siste md-li-en i en rekke (skiller lista fra neste linje).
	out = out.replace(/(<\/span>)<br>(?=<span class="md-li">)/g, '$1');
	return mdInlineOutsideTags(out);
}

/** Inline-markdown i ren tekst: fet, urskrift og hevet versnummer ^{N}. */
function mdInline(t) {
	return t
		.replace(/\^\{([^}]+)\}/g, '<sup class="vers">$1</sup>')
		.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
		.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
		// inline bibelreferanse: {{bibelref}}…{{/bibelref}} — samme stil som
		// BIBELREF-linjen, men inline (liten dempet tekst)
		.replace(/\{\{bibelref\}\}([\s\S]*?)\{\{\/bibelref\}\}/g, (m, x) => '<span class="bibelref-inline">' + x + '</span>');
}

/** mdInline på tekst utenfor eksisterende tags (rolle/fotnote/copyright/refreng/overskrift-spans). */
function mdInlineOutsideTags(html) {
	return html.split(/(<span class="(?:role|fotnote|copyright|refreng|md-h|md-h2|md-li)">[\s\S]*?<\/span>)/g)
		.map((seg) => seg.startsWith('<span') ? seg : mdInline(seg))
		.join('');
}

/* ---------- riktekst-redigering (contenteditable) ---------- */

function escapeHtml(s) {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const ROLLE_PREFIKS_RE = /^(L\/ML|ML\/L|L\/M|KA\/L|L|ML|M|A|KA|K)(\s*\| ?)/;

/** Render én markdown-linje til redigerings-HTML: div.et-linje med data-prefiks slik at
 *  serialiseringen kan gjenopprette markørene. Linjeprefikser vises som chips, ikke som rå tekst. */
export function litLinjeHtml(linje, tagPos = 'slutt') {
	let m;
	if ((m = /^\{\{refreng\}\} ?(.*)$/.exec(linje))) return linjeEditHtml('refreng-start', '{{refreng}}', 'Refreng ↓', m[1]);
	if ((m = /^\{\{\/refreng\}\} ?(.*)$/.exec(linje))) return linjeEditHtml('refreng-slutt', '{{/refreng}}', 'Refreng slutt ↑', m[1]);
	if ((m = /^(BIBELREF) \| ?(.*)$/.exec(linje))) return linjeEditHtml('bibelref', 'BIBELREF | ', 'Bibelref', m[2], tagPos);
	if ((m = /^(FOTNOTE) \| ?(.*)$/.exec(linje))) return linjeEditHtml('fotnote', 'FOTNOTE | ', 'Notis', m[2], tagPos);
	if ((m = /^@(?:NOTAT|n) ?\|? ?(.*)$/.exec(linje))) return linjeEditHtml('notat', '@NOTAT ', 'Instruks', m[1], tagPos);
	if ((m = /^@(?:COPYRIGHT|copyright|c)\b ?\|? ?(.*)$/.exec(linje))) return linjeEditHtml('copyright', '@COPYRIGHT ', '©', m[1], tagPos);
	if ((m = /^@r ?\|? ?(.*)$/.exec(linje))) return linjeEditHtml('@r', (m[0].slice(0, m[0].length - m[1].length)), '@r', m[1]);
	if ((m = new RegExp(ROLLE_PREFIKS_RE.source + '(.*)$').exec(linje))) return linjeEditHtml('rolle', '', m[1], m[3]);
	if ((m = /^(## ?)(.*)$/.exec(linje))) return linjeEditHtml('h2', m[1], '', m[2]);
	if ((m = /^(# ?)(.*)$/.exec(linje))) return linjeEditHtml('h1', m[1], '', m[2]);
	if ((m = /^(- ?)(.*)$/.exec(linje))) return linjeEditHtml('liste', m[1], '–', m[2]);
	return linjeEditHtml('tekst', '', '', linje);
}

function linjeEditHtml(type, prefiks, chip, innhold, tagPos = 'slutt') {
	const klasse = { bibelref: 'fotnote', fotnote: 'fotnote', notat: 'notat', copyright: 'copyright', 'refreng-inn': 'refreng', '@r': 'rline', h1: 'md-h', h2: 'md-h md-h2', liste: 'md-li', rolle: '', tekst: '', 'refreng-start': '', 'refreng-slutt': '' }[type];
	// rolleprefiks-linjer: rollen («L |») vises som vanlig rød rolle-span (redigerbar tekst),
	// serialiseres tilbake som {{r}}L |{{/r}} — ingen chips for roller
	let chipHtml = '';
	if (type === 'rolle') {
		chipHtml = `<span class="role">${escapeHtml(chip)} |</span> `;
	} else if (type === 'refreng-start' || type === 'refreng-slutt') {
		// blokkmarkøren er hele linjen — vises bare som chip (tomt innhold)
		chipHtml = `<span class="chip">${escapeHtml(chip)}</span>`;
	} else if (chip) {
		// punktlisten («–»), @r osv.: prefikset vises som chip foran teksten.
		// NB: ingen tekst-mellomrom etter chipen — det ble serialisert inn i
		// verdien (dobbel mellomrom som vokste per redigering); avstand = CSS.
		chipHtml = `<span class="chip">${escapeHtml(chip)}</span>`;
	}
	const erLinjemerke = type === 'bibelref' || type === 'fotnote' || type === 'notat' || type === 'copyright';
	// linjemerker: ÉN liten badge («dev»-stil) — på slutten av en enkeltlinje,
	// ved starten av første linje i et flerlinjes-avsnitt («over»), ingen på resten
	if (erLinjemerke) chipHtml = '';
	if (type === 'refreng-start') { // badge over refrenget + innholdet på første linje
		return `<div class="et-linje" data-type="${type}" data-prefiks="${escapeHtml(prefiks)}"><span class="chip linje-tag">Refreng</span>${inlineEditHtml(innhold)}</div>`;
	}
	if (type === 'refreng-slutt') { // avslutningsmarkør: usynlig i redigeringen
		return `<div class="et-linje" data-type="${type}" data-prefiks="${escapeHtml(prefiks)}"></div>`;
	}
	const indreBase = klasse ? `<span class="${klasse}">${inlineEditHtml(innhold)}</span>` : inlineEditHtml(innhold);
	let indre = indreBase;
	if (erLinjemerke && chip) {
		// NB: ingen tekst-mellomrom rundt badge-en (CSS-marg i stedet) — mellomrom
		// serialiseres inn i verdien og vokser per redigeringssyklus
		const badge = `<span class="chip linje-tag">${escapeHtml(chip)}</span>`;
		if (tagPos === 'slutt') indre = klasse ? indreBase.replace(/<\/span>$/, badge + '</span>') : indreBase + badge;
		else if (tagPos === 'start') indre = badge + indreBase.replace(/^\s+/, '');
	}
	return `<div class="et-linje" data-type="${type}" data-prefiks="${escapeHtml(prefiks)}">${chipHtml}${indre}</div>`;
}

/** Inline-markdown for riktekst-visning (fluktet): {{r}}-spans + fet/urskrift/hevet. */
function inlineEditHtml(t) {
	let s = escapeHtml(t);
	s = s.replace(/\{\{r\}\}([\s\S]*?)\{\{\/r\}\}/g, (m, x) => '<span class="role">' + mdInline(x) + '</span>');
	// inline bibelref: chip (serialiseres aldri) + spanet bærer teksten
	s = s.replace(/\{\{bibelref\}\}([\s\S]*?)\{\{\/bibelref\}\}/g,
		(m, x) => '<span class="bibelref-inline"><span class="chip">Bibelref</span>' + x + '</span>');
	return mdInline(s);
}

/** Inline-markdown med SYNLIGE merker (hybrid): merkene er REDIGERBAR TEKST i
 *  .mrk-spans (dempet stil) — backspace kan slette dem, og formateringen følger
 *  ved neste linje-render. Styling span (.md-b/.md-i/…) beholder riktekst-uttrykket. */
function inlineMerkerHtml2(t) {
	return t
		.replace(/\^\{([^}]+)\}/g, '<sup class="vers">$1</sup>')
		.replace(/\*\*\*([^*\n]+)\*\*\*/g, '<span class="mrk">***</span><span class="md-b md-i">$1</span><span class="mrk">***</span>')
		.replace(/\*\*([^*\n]+)\*\*/g, '<span class="mrk">**</span><span class="md-b">$1</span><span class="mrk">**</span>')
		.replace(/(^|[^*\w<])\*([^*\n]+)\*(?!\*)/g, '$1<span class="mrk">*</span><span class="md-i">$2</span><span class="mrk">*</span>')
		.replace(/___([^_\n]+)___/g, '<span class="mrk">___</span><span class="md-b md-i">$1</span><span class="mrk">___</span>')
		.replace(/__([^_\n]+)__/g, '<span class="mrk">__</span><span class="md-b">$1</span><span class="mrk">__</span>')
		.replace(/(^|[^_\w<])_([^_\n]+)_/g, '$1<span class="mrk">_</span><span class="md-i">$2</span><span class="mrk">_</span>')
		.replace(/~~([^~\n]+)~~/g, '<span class="mrk">~~</span><span class="md-strike">$1</span><span class="mrk">~~</span>')
		.replace(/==([^=\n]+)==/g, '<span class="mrk">==</span><span class="md-mark">$1</span><span class="mrk">==</span>')
		.replace(/(^|[^~\w<])~([^~\n]+)~/g, '$1<span class="mrk">~</span><span class="md-sub">$2</span><span class="mrk">~</span>')
		.replace(/`([^`]+)`/g, '<span class="mrk">`</span><span class="md-kode">$1</span><span class="mrk">`</span>')
		.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<span class="mrk">![</span><span class="md-lenke">$1</span><span class="mrk">]($2)</span>')
		.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<span class="mrk">[</span><span class="md-lenke">$1</span><span class="mrk">]($2)</span>')
		.replace(/(^|[\s(])(https?:\/\/[^\s<&)]+)/g, '$1<span class="md-lenke">$2</span>')
		.replace(/\[\^([^\]\s]+)\]/g, '<span class="mrk">[^</span><sup class="md-fotnote-ref">$1</sup><span class="mrk">]</span>');
}

function inlineMerkerHtml(t) {
	let s = escapeHtml(t);
	s = s.replace(/\{\{r\}\}([\s\S]*?)\{\{\/r\}\}/g, (m, x) => '<span class="role">' + inlineMerkerHtml2(x) + '</span>');
	return inlineMerkerHtml2(s);
}

/** Hybrid-linje: riktekst-styling, men linjens markdown-prefiks (##, -, BIBELREF | …)
 *  vises dempet i samme stil og størrelse. data-prefiks beholdes — EditableTexts
 *  serialisering hopper over .mrk-spans, så verdien blir uendret. */
export function litLinjeMerkerHtml(linje) {
	let m;
	if (/^\{\{\/?refreng\}\}/.test(linje)) return litLinjeHtml(linje); // blokkmarkør-chips som før
	if ((m = /^\s*\|(.+)\|\s*$/.exec(linje))) {
		// tabellrad: cellene i .md-td-bokser, pipe-markene som redigerbar mrk-tekst
		const celler = m[1].split('|');
		const cellerHtml = celler.map((c) => {
			const sep = /^\s*:?-{3,}:?\s*$/.test(c);
			return `<span class="mrk">|</span><span class="md-td${sep ? ' md-td-sep' : ''}">${inlineMerkerHtml(c)}</span>`;
		}).join('') + '<span class="mrk">|</span>';
		return `<div class="et-linje" data-type="tabell" data-prefiks="">${cellerHtml}</div>`;
	}
	if ((m = /^(BIBELREF) \| ?(.*)$/.exec(linje))) return merkerLinje('bibelref', 'BIBELREF | ', 'fotnote', m[2]);
	if ((m = /^(FOTNOTE) \| ?(.*)$/.exec(linje))) return merkerLinje('fotnote', 'FOTNOTE | ', 'fotnote', m[2]);
	if ((m = /^@(?:NOTAT|n) ?\|? ?(.*)$/.exec(linje))) return merkerLinje('notat', '@NOTAT ', 'notat', m[1]);
	if ((m = /^@(?:COPYRIGHT|copyright|c)\b ?\|? ?(.*)$/.exec(linje))) return merkerLinje('copyright', '@COPYRIGHT ', 'copyright', m[1]);
	if ((m = /^(## ?)(.*)$/.exec(linje))) return merkerLinje('h2', m[1], 'md-h md-h2', m[2]);
	if ((m = /^(# ?)(.*)$/.exec(linje))) return merkerLinje('h1', m[1], 'md-h', m[2]);
	if ((m = /^(- ?)(.*)$/.exec(linje))) return merkerLinje('liste', m[1], 'md-li', m[2]);
	return merkerLinje('tekst', '', '', linje);
}

function merkerLinje(type, prefiks, klasse, innhold) {
	// prefiksen er REDIGERBAR TEKST (mrk-span) — serialiseres som en del av linjen
	const prefiksHtml = prefiks ? `<span class="mrk">${escapeHtml(prefiks)}</span>` : '';
	const indre = klasse ? `<span class="${klasse}">${inlineMerkerHtml(innhold)}</span>` : inlineMerkerHtml(innhold);
	const chip = ''; // liste-prefiksen («- ») er allerede synlig som mrk-tekst — ingen ekstra bullet
	// data-prefiks tom: prefiksen serialiseres som mrk-tekst (ellers dobler den)
	return `<div class="et-linje" data-type="${type}" data-prefiks="">${prefiksHtml}${chip}${indre}</div>`;
}

/** Hele teksten som redigerings-HTML (én div per linje). Linjer inne i en
 *  {{refreng}}-blokk vises i kursiv (span.refreng); start-/sluttmarkørene vises
 *  som chips. */
const LINJEMERKE_RE = { bibelref: /^BIBELREF \| /, fotnote: /^FOTNOTE \| /, notat: /^@(?:NOTAT|n) ?\|? /, copyright: /^@(?:COPYRIGHT|copyright|c)\b ?\|? / };

export function litEditHtml(text, merkerIdx = -1) {
	let iRefreng = false;
	const linjer = (text ?? '').split('\n');
	// merke-type per linje (for badge-plassering: enkeltlinje → slutt, avsnitt → over første linje)
	const typer = linjer.map((l, i) => {
		const t = Object.keys(LINJEMERKE_RE).find((t) => LINJEMERKE_RE[t].test(l)) ?? null;
		// copyright: hver linje er et selvstendig merke (T:/M:) — begge skal ha badge
		return t === 'copyright' ? 'copyright' + i : t;
	});
	// badge-POSISJON: enkeltlinje → SLUTT (etter teksten, roter ikke linjen);
	// flerlinjes-avsnitt → over første linje, ingen på de øvrige
	const tagPos = typer.map((t, i) => {
		if (!t) return 'ingen';
		const forrige = typer[i - 1] === t, neste = typer[i + 1] === t;
		if (!forrige && !neste) return 'slutt';
		return forrige ? 'ingen' : 'start';
	});
	return linjer.map((l, i) => {
		const linjeDiv = (html) => html.replace('<div class="et-linje"', `<div class="et-linje" data-linje="${i}"`);
		if (/^\{\{\/?refreng\}\}/.test(l)) {
			const erSlutt = l.trim() === '{{/refreng}}';
			iRefreng = !erSlutt;
			// start: badge «Refreng» over avsnittet + innholdet på samme linje;
			// slutt-linjen er bare markøren — tom visuell linje uten badge
			return linjeDiv(linjeEditHtml(erSlutt ? 'refreng-slutt' : 'refreng-start', erSlutt ? '{{/refreng}}' : '{{refreng}}', 'Refreng', erSlutt ? '' : l.replace(/^\{\{refreng\}\} ?/, ''), 'start'));
		}
		if (iRefreng) return linjeDiv(linjeEditHtml('refreng-inn', '', '', l));
		return linjeDiv(i === merkerIdx ? litLinjeMerkerHtml(l) : litLinjeHtml(l, tagPos[i]));
	}).join('');
}

/** Teksten som vises/eksporteres for et salmeledd: hodet (@COPYRIGHT-linjene i
 *  it.text) + valgt språkalternativ. Flerspråklige salmer lagres med språkene
 *  som alts (label = språknavnet), én oversettelse er valgt om gangen. */
export function salmeTekst(it) {
	if (!it?.alts?.length) return it?.text ?? '';
	const valgt = it.alts[it.selAlt ?? 0]?.text ?? '';
	return (it.text ?? '').trim() ? it.text.trim() + '\n\n' + valgt : valgt;
}

/** Del en formatert salmetekst i språkalternativer: ## -overskriftene (Bokmål /
 *  Sørsamisk / …) blir alts [{ label, text }] og hodet (@COPYRIGHT-linjene)
 *  forblir it.text. Færre enn to språkseksjoner → { text: hele, alts: [] }. */
export function salmeAlts(formatted) {
	const s = formatted ?? '';
	if (!/^## .+$/m.test(s)) return { text: s, alts: [] };
	const deler = s.split(/^(## .+)$/m);
	const hode = (deler[0] ?? '').trim();
	const alts = [];
	for (let i = 1; i < deler.length; i += 2) {
		const label = deler[i].replace(/^## /, '').trim();
		const tekst = (deler[i + 1] ?? '').replace(/^\n+/, '').replace(/\n+$/, '');
		if (tekst) alts.push({ label, text: tekst });
	}
	if (alts.length < 2) return { text: s, alts: [] };
	return { text: hode, alts };
}

/** Formater rå salmetekst fra gudstjeneste.no: T/M/O-hodet øverst og ©-linjene
 *  på slutten blir @COPYRIGHT-linjer (salmeinfo), «Refreng»-blokker pakkes i
 *  {{refreng}}…{{/refreng}} (kursiv), og tospråklige salmer får språkseksjonene
 *  (Bokmål / Sørsamisk / …) som ## -overskrifter. */
export function formaterSalme(raa) {
	if (!raa) return raa ?? '';
	const linjer = String(raa).replace(/\r\n/g, '\n').split('\n');
	const ut = [];
	let i = 0;
	// hodet: T:/M:/O:-linjer helt på toppen
	while (i < linjer.length && /^\s*[TMO]:\s/.test(linjer[i])) {
		ut.push('@COPYRIGHT ' + linjer[i].trim());
		i++;
	}
	// språknavn som står alene på en linje (NOS13: Bokmål/Nynorsk/samiske varianter/…)
	const SPRÅK = /^(bokmål|nynorsk|sørsamisk|nordsamisk|lulesamisk|samisk|norsk|engelsk|svensk|tysk|fransk|spansk|latin)$/i;
	let iRef = false;
	for (; i < linjer.length; i++) {
		const t = linjer[i].trim();
		if (!iRef && /^refreng:?$/i.test(t)) {
			// bare markøren — «Refreng»-teksten vises som badge i redigeringen
			ut.push('{{refreng}}');
			iRef = true;
			continue;
		}
		if (iRef) {
			if (!t) {
				ut.push('{{/refreng}}');
				ut.push('');
				iRef = false;
			} else {
				ut.push(t);
			}
			continue;
		}
		if (SPRÅK.test(t)) {
			ut.push('## ' + t);
			continue;
		}
		if (/^\s*©/.test(linjer[i])) {
			ut.push('@COPYRIGHT ' + t);
			continue;
		}
		ut.push(linjer[i]);
	}
	if (iRef) ut.push('{{/refreng}}');
	return ut.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}
