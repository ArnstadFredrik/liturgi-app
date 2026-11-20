<script>
	/** Felles fane-stripe for undermoduler (designplanen: «én navigasjons-
	 *  grammatikk»). Gjenbruker segmentkontrollen .fb-visning-velger slik at
	 *  Bibliotek/Innstillinger/Editor/Salmer/Eksport ser identiske ut. */
	export let faner = []; // [{ id, navn, velg }]
	export let aktiv = '';
</script>

<nav class="mod-faner">
	<div class="fb-visning-velger" role="tablist">
		{#each faner as f (f.id)}
			<button role="tab" aria-selected={aktiv === f.id} class:sel={aktiv === f.id}
				onclick={() => f.velg?.()}>{f.navn}</button>
		{/each}
	</div>
</nav>
