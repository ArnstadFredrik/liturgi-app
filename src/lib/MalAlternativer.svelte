<script>
	/** «Alternativer» — undermodul i mal-redigeringen. Tynn innpakning rundt
	 *  den delte DelerTabell-komponenten (samme innhold som «Deler …»-modalen). */
	import { app } from '$lib/store.svelte.js';
	import DelerTabell from '$lib/DelerTabell.svelte';
</script>

<div id="maldeler-side">
	<DelerTabell mal={app.current} />
</div>
