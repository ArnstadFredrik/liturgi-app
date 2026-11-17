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
		// {{refreng}}…{{/refreng}} — hele refrenget i kursiv (spennet beskyttes mot videre md)
		.replace(/\{\{refreng\}\}([\s\S]*?)\{\{\/refreng\}\}/g, (m, t) => '<span class="refreng">' + t + '</span>')
		.replace(/^(?:BIBELREF|FOTNOTE) \| ?(.*)$/gm, (m, t) => '<span class="fotnote">' + mdInline(t) + '</span>')
		// hele-linje notis: @NOTAT eller @n — rød kursiv, litt mindre enn brødteksten
		.replace(/^@(?:NOTAT|n) ?\|? ?(.+)$/gm, (m, t) => '<span class="notat">' + mdInline(t) + '</span>')
		// hele-linje salmeinfo (T/M/O-hode og ©-linjer): @COPYRIGHT eller @c — samme stil som fotnote
		.replace(/^@(?:COPYRIGHT|copyright|c)\b ?\|? ?(.+)$/gm, (m, t) => '<span class="copyright">' + mdInline(t) + '</span>')
		// rene rolleprefiks-linjer: «L |», «ML |», «L/ML |», «KA/L |» osv. → rolle merket rødt, resten inline
		.replace(/^(L\/ML|ML\/L|L\/M|KA\/L|L|ML|M|A|KA|K)(\s*\| ?)/gm, '<span class="role">$1 |</span> ')
		.replace(/^@r ?\|? ?(.+)$/gm, (m, t) => '<span class="role">' + mdInline(t) + '</span>')
		.replace(/\{\{r\}\}([\s\S]*?)\{\{\/r\}\}/g, (m, t) => '<span class="role">' + mdInline(t) + '</span>');
	// blokk-nivå: overskrifter og punktliste (linjenivå, unngå å røre eksisterende spans) — før <br>
	out = out
		.replace(/^## ?(.+)$/gm, (m, t) => '<span class="md-h md-h2">' + mdInline(t) + '</span>')
		.replace(/^# ?(.+)$/gm, (m, t) => '<span class="md-h">' + mdInline(t) + '</span>')
		.replace(/^- (.+)$/gm, (m, t) => '<span class="md-li"><span class="md-bullet">•</span>' + mdInline(t) + '</span>')
		.replace(/\n/g, '<br>');
	return mdInlineOutsideTags(out);
}

/** Inline-markdown i ren tekst: fet, urskrift og hevet versnummer ^{N}. */
function mdInline(t) {
	return t
		.replace(/\^\{([^}]+)\}/g, '<sup class="vers">$1</sup>')
		.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
		.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
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
export function litLinjeHtml(linje) {
	let m;
	if ((m = /^\{\{refreng\}\} ?(.*)$/.exec(linje))) return linjeEditHtml('refreng-start', '{{refreng}}', 'Refreng ↓', m[1]);
	if ((m = /^\{\{\/refreng\}\} ?(.*)$/.exec(linje))) return linjeEditHtml('refreng-slutt', '{{/refreng}}', 'Refreng slutt ↑', m[1]);
	if ((m = /^(BIBELREF) \| ?(.*)$/.exec(linje))) return linjeEditHtml('bibelref', 'BIBELREF | ', 'Bibelref', m[2]);
	if ((m = /^(FOTNOTE) \| ?(.*)$/.exec(linje))) return linjeEditHtml('fotnote', 'FOTNOTE | ', 'Notis', m[2]);
	if ((m = /^@(?:NOTAT|n) ?\|? ?(.*)$/.exec(linje))) return linjeEditHtml('notat', '@NOTAT ', '', m[1]);
	if ((m = /^@(?:COPYRIGHT|copyright|c)\b ?\|? ?(.*)$/.exec(linje))) return linjeEditHtml('copyright', '@COPYRIGHT ', 'Copyright', m[1]);
	if ((m = /^@r ?\|? ?(.*)$/.exec(linje))) return linjeEditHtml('@r', (m[0].slice(0, m[0].length - m[1].length)), '@r', m[1]);
	if ((m = new RegExp(ROLLE_PREFIKS_RE.source + '(.*)$').exec(linje))) return linjeEditHtml('rolle', '', m[1], m[3]);
	if ((m = /^(## ?)(.*)$/.exec(linje))) return linjeEditHtml('h2', m[1], '', m[2]);
	if ((m = /^(# ?)(.*)$/.exec(linje))) return linjeEditHtml('h1', m[1], '', m[2]);
	if ((m = /^(- ?)(.*)$/.exec(linje))) return linjeEditHtml('liste', m[1], '•', m[2]);
	return linjeEditHtml('tekst', '', '', linje);
}

function linjeEditHtml(type, prefiks, chip, innhold) {
	const klasse = { bibelref: 'fotnote', fotnote: 'fotnote', notat: 'notat', copyright: 'copyright', 'refreng-inn': 'refreng', '@r': 'rline', h1: 'md-h', h2: 'md-h md-h2', liste: 'md-li', rolle: '', tekst: '', 'refreng-start': '', 'refreng-slutt': '' }[type];
	// rolleprefiks-linjer: rollen («L |») vises som vanlig rød rolle-span (redigerbar tekst),
	// serialiseres tilbake som {{r}}L |{{/r}} — ingen chips for roller
	let chipHtml = '';
	if (type === 'rolle') {
		chipHtml = `<span class="role">${escapeHtml(chip)} |</span> `;
	} else if (type === 'refreng-start' || type === 'refreng-slutt') {
		// blokkmarkøren er hele linjen — vises bare som chip (tomt innhold)
		chipHtml = `<span class="chip">${escapeHtml(chip)}</span>`;
	}
	const indreBase = klasse ? `<span class="${klasse}">${inlineEditHtml(innhold)}</span>` : inlineEditHtml(innhold);
	// linjemerker (Notis/Bibelref/Copyright) vises som parentes-tag ETTER teksten — tydelig at det
	// gjelder linjen, ikke innholdet; legges INNI tekst-spanet så størrelsen matcher
	let indre = indreBase;
	if (type === 'bibelref' || type === 'fotnote' || type === 'notat' || type === 'copyright') {
		const tag = ` <span class="chip linje-tag">(${escapeHtml(chip)})</span>`;
		indre = klasse ? indreBase.replace(/<\/span>$/, tag + '</span>') : indreBase + tag;
	}
	return `<div class="et-linje" data-type="${type}" data-prefiks="${escapeHtml(prefiks)}">${chipHtml}${indre}</div>`;
}

/** Inline-markdown for riktekst-visning (fluktet): {{r}}-spans + fet/urskrift/hevet. */
function inlineEditHtml(t) {
	let s = escapeHtml(t);
	s = s.replace(/\{\{r\}\}([\s\S]*?)\{\{\/r\}\}/g, (m, x) => '<span class="role">' + mdInline(x) + '</span>');
	return mdInline(s);
}

/** Hele teksten som redigerings-HTML (én div per linje). Linjer inne i en
 *  {{refreng}}-blokk vises i kursiv (span.refreng); start-/sluttmarkørene vises
 *  som chips. */
export function litEditHtml(text) {
	let iRefreng = false;
	return (text ?? '').split('\n').map((l) => {
		if (/^\{\{\/?refreng\}\}/.test(l)) {
			iRefreng = l.trim() !== '{{/refreng}}';
			return litLinjeHtml(l);
		}
		if (iRefreng) return linjeEditHtml('refreng-inn', '', '', l);
		return litLinjeHtml(l);
	}).join('');
}

/** Formater rå salmetekst fra gudstjeneste.no: T/M/O-hodet øverst og ©-linjene
 *  på slutten blir @COPYRIGHT-linjer (salmeinfo), «Refreng»-blokker pakkes i
 *  {{refreng}}…{{/refreng}} (kursiv). */
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
	let iRef = false;
	for (; i < linjer.length; i++) {
		const t = linjer[i].trim();
		if (!iRef && /^refreng:?$/i.test(t)) {
			ut.push('{{refreng}}');
			ut.push(t.replace(/:$/, ''));
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
		if (/^\s*©/.test(linjer[i])) {
			ut.push('@COPYRIGHT ' + t);
			continue;
		}
		ut.push(linjer[i]);
	}
	if (iRef) ut.push('{{/refreng}}');
	return ut.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}
