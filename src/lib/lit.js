/** Render liturgitext til HTML: rollemerker ({{r}}…{{/r}}) i rødt,
 *  «FOTNOTE | »-linjer som små urskrifts-fotnoter. */
export function litHtml(text) {
	return (text ?? '')
		.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
		.replace(/^(FOTNOTE \| ?)(.*)$/gm, '<span class="fotnote">$2</span>')
		.replace(/\{\{r\}\}([\s\S]*?)\{\{\/r\}\}/g, '<span class="role">$1</span>');
}
