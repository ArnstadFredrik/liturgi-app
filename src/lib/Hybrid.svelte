<script>
	/**
	 * Hybrid-visning (Obsidian live preview): hver linje rendres som riktekst,
	 * MEN linjen markøren står i vises som rå markdown (uthevet). Klikk på en
	 * linje gjør den aktiv; pil opp/ned ved kantene bytter linje.
	 */
	import { litHtml } from '$lib/lit.js';
	import { uthev } from '$lib/markdown-uthev.js';

	let { value = $bindable(''), nokkel = '' } = $props();

	let aktiv = $state(-1); // aktiv linje-indeks (-1 = ingen)
	let buffer = $state(''); // rå tekst i den aktive linjen
	let ta = $state(null);
	let linjer = $derived((value ?? '').split('\n'));

	function velgLinje(i) {
		if (i === aktiv) return;
		aktiv = i;
		buffer = linjer[i] ?? '';
		requestAnimationFrame(() => {
			if (!ta) return;
			ta.focus();
			const n = ta.value.length;
			ta.setSelectionRange(n, n);
			ta.style.height = 'auto';
			ta.style.height = ta.scrollHeight + 'px';
		});
	}

	function skrev(e) {
		const l = [...linjer];
		l[aktiv] = e.target.value;
		value = l.join('\n');
	}

	function tast(e) {
		if (e.key === 'ArrowDown' && e.target.selectionStart === e.target.value.length && aktiv < linjer.length - 1) {
			e.preventDefault();
			velgLinje(aktiv + 1);
		} else if (e.key === 'ArrowUp' && e.target.selectionStart === 0 && aktiv > 0) {
			e.preventDefault();
			velgLinje(aktiv - 1);
		} else if (e.key === 'Escape') {
			e.target.blur();
		}
	}

	// ny fil → ingen aktiv linje
	$effect(() => {
		void nokkel;
		aktiv = -1;
	});

	// auto-høyde på aktiv linje når innholdet endres
	$effect(() => {
		void buffer;
		if (ta) {
			ta.style.height = 'auto';
			ta.style.height = ta.scrollHeight + 'px';
		}
	});
</script>

<div class="hyb">
	{#each linjer as linje, i (i)}
		{#if i === aktiv}
			<div class="hyb-aktiv-rad">
				<pre class="hyb-hl" aria-hidden="true">{@html uthev(buffer)}</pre>
				<textarea class="hyb-aktiv" bind:this={ta} bind:value={buffer} oninput={skrev} onkeydown={tast} rows="1" spellcheck="false"></textarea>
			</div>
		{:else}
			<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
			<div class="hyb-linje lit-text" onclick={() => velgLinje(i)}>{@html litHtml(linje)}</div>
		{/if}
	{/each}
	{#if !value && aktiv !== 0}
		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
		<div class="hyb-linje lit-text hyb-tom" onclick={() => velgLinje(0)}>Skriv her …</div>
	{/if}
</div>
