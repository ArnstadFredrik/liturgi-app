<script>
	/** Ikon-knapp (eller tekstknapp i ikon-stil) med riktig aria-label.
	 *  Gjenbrukes av Eksport (zoom) og Forberedelse (oppdater) — en knapp uten
	 *  synlig tekst M ha aria-label for skjermleser. Ikkeplanlagt ikon sendes
	 *  som snippet. */
	import { mdi } from '$lib/mdi.js';

	let { label = '', onclick = () => {}, klasse = 'ikon-btn', ikon = '', storrelse = 15, children } = $props();
</script>

<button type="button" class={klasse} title={label} aria-label={label} onclick={onclick}>
	{#if ikon}{@html mdi(ikon, storrelse)}{/if}
	{@render children?.()}
</button>
