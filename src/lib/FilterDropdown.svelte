<script>
	/** FilterDropdown: knapp som \u00e5pner en flervalgs-meny (checkboxer).
	 *  `selected` er en bindbar liste med valgte verdier \u2014 tom = intet filter.
	 *  Brukes av mal-listene (Bibliotek + Malverkt\u00f8y). */
	let { label, options = [], selected = $bindable([]) } = $props();
	let apen = $state(false);
	let roten;

	function veksle(v) {
		selected = selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v];
	}
	function dokumentKlikk(e) {
		if (apen && roten && !roten.contains(e.target)) apen = false;
	}
	function labeltekst() {
		if (!selected.length) return label;
		if (selected.length <= 2) {
			const navn = selected.map((v) => options.find((o) => o.verdi === v)?.navn ?? v);
			return navn.join(', ');
		}
		return label + ' (' + selected.length + ')';
	}
</script>

<svelte:document onclick={dokumentKlikk} />

<div class="filter-dd" bind:this={roten}>
	<button type="button" class="filter-dd-knapp" class:aktiv={selected.length > 0}
		aria-expanded={apen} onclick={() => (apen = !apen)}>
		{labeltekst()} {@html '<svg class="filter-dd-pil" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>'}
	</button>
	{#if apen}
		<div class="filter-dd-meny" role="menu">
			{#each options as o (o.verdi)}
				<label class="filter-dd-rad">
					<input type="checkbox" checked={selected.includes(o.verdi)} onchange={() => veksle(o.verdi)} />
					<span>{o.navn}</span>
				</label>
			{/each}
			{#if selected.length}
				<button type="button" class="filter-dd-tom" onclick={() => (selected = [])}>T\u00f8m</button>
			{/if}
		</div>
	{/if}
</div>
