/** Komponert tekst for et ledd: fast innledning/valgt innledning + kropp (valgt alternativ)
 *  + valgt avslutning. Konvensjon: hvis leddet har alts OG text, er text en fast innledning. */
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
 *  (hele linjen som rolle), «FOTNOTE | »-linjer som små urskrifts-fotnoter, og enkel markdown
 *  (**fet**, *urskrift*, «# overskrift», «- punktliste»). */
export function litHtml(text) {
	let out = (text ?? '')
		.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
		.replace(/^(FOTNOTE \| ?)(.*)$/gm, (m, p, t) => '<span class="fotnote">' + mdInline(t) + '</span>')
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

/** mdInline på tekst utenfor eksisterende tags (rolle/fotnote/overskrift-spans). */
function mdInlineOutsideTags(html) {
	return html.split(/(<span class="(?:role|fotnote|md-h|md-h2|md-li)">[\s\S]*?<\/span>)/g)
		.map((seg) => seg.startsWith('<span') ? seg : mdInline(seg))
		.join('');
}
