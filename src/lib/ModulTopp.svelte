<script>
	/** Gjenbrukbar modul-header — samme uttrykk i alle undermoduler.
	 *
	 *  Props:
	 *   - tittel (påkrevd): modulens navn
	 *   - faner / aktiv: valgfri fane-stripe (Modulfaner) til høyre for tittelen
	 *   - klebet (valgfri): bind fra modulens rullespalte; gir den kompakte
	 *     varianten (padding 8px, bakgrunn + hairline) som #main.main-scrollt
	 *     gir hovedredigeringen.
	 *   - children (snippet): dag-spesifikt innhold (undertittel, knapper). */
	import Modulfaner from '$lib/Modulfaner.svelte';

	let { tittel = '', faner = [], aktiv = '', klebet = false, children } = $props();
</script>

<header class="modul-topp" class:klebet>
	<span class="modul-tittel">{tittel}</span>
	{#if faner.length}
		<Modulfaner faner={faner} aktiv={aktiv} />
	{/if}
	{#if children}
		{@render children()}
	{/if}
</header>
