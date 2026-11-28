<script>
	/** Chevron-knapp som viser/skjuler underliggende innhold.
	 *  Gjenbrukes av DelerTabell, Oversikt m.fl.; samme uttrykk
	 *  (klassen «m-deler-ekspander» kan overstyres med `klasse`). */
	import { mdi } from '$lib/mdi.js';

	let { apen = false, onclick = () => {}, title = '', klasse = '' } = $props();
</script>

<button type="button" class="m-deler-ekspander {klasse}" {title}
	onclick={(e) => { e.stopPropagation(); onclick(e); }}>
	{@html mdi(apen ? 'chevron-down' : 'chevron-right', 14)}
</button>
