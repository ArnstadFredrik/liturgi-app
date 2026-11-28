<script>
	/** Dra-håndtak (padmere ikon) for omorganisering av rader.
	 *  Gjenbrukes av DelerTabell, Oversikt og Eksport — drag-logikken
	 *  (start/over/dropp) holdes i modulen; komponenten binder bare
	 * ommen til hendelsene. */
	import { mdi } from '$lib/mdi.js';

	let { onstart = () => {}, onend = () => {}, aktiv = false, title = 'Dra for å endre rekkefølge', klasse = 'm-deler-drag', storrelse = 14 } = $props();
</script>

<span class="{klasse}" class:aktiv draggable="true" {title} ondragstart={onstart} ondragend={onend}>
	{@html mdi('drag-vertical', storrelse)}
</span>
