/** Render liturgitext til HTML: rollemerker ({{r}}…{{/r}}) i rødt, «@r |»- eller «@r»-linjer
 *  (hele linjen som rolle), «FOTNOTE | »-linjer som små urskrifts-fotnoter, og enkel markdown
 *  (**fet**, *urskrift*, «# overskrift», «- punktliste»). */
export function litHtml(text) {
	let out = (text ?? '')
		.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
		.replace(/^(FOTNOTE \| ?)(.*)$/gm, (m, p, t) => '<span class="fotnote">' + mdInline(t) + '</span>')
		.replace(/^@r ?\|? ?(.+)$/gm, (m, t) => '<span class="role">' + mdInline(t) + '</span>')
		.replace(/\{\{r\}\}([\s\S]*?)\{\{\/r\}\}/g, (m, t) => '<span class="role">' + mdInline(t) + '</span>');
	// blokk-nivå: overskrifter og punktliste (linjenivå, unngå å røre eksisterende spans)
	out = out
		.replace(/^## ?(.+)$/gm, (m, t) => '<span class="md-h md-h2">' + mdInline(t) + '</span>')
		.replace(/^# ?(.+)$/gm, (m, t) => '<span class="md-h">' + mdInline(t) + '</span>')
		.replace(/^- (.+)$/gm, (m, t) => '<span class="md-li"><span class="md-bullet">•</span>' + mdInline(t) + '</span>');
	return mdInlineOutsideTags(out);
}

/** Inline-markdown i ren tekst: fet og urskrift. */
function mdInline(t) {
	return t
		.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
		.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
}

/** mdInline på tekst utenfor eksisterende tags (rolle/fotnote/overskrift-spans). */
function mdInlineOutsideTags(html) {
	return html.split(/(<span class="(?:role|fotnote|md-h|md-h2|md-li)">[\s\S]*?<\/span>)/g)
		.map((seg) => seg.startsWith('<span') ? seg : mdInline(seg))
		.join('');
}
