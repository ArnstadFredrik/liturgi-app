/** Render liturgitext til HTML: rollemerker ({{r}}…{{/r}}) i rødt. */
export function litHtml(text) {
	return (text ?? '')
		.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
		.replace(/\{\{r\}\}([\s\S]*?)\{\{\/r\}\}/g, '<span class="role">$1</span>');
}
