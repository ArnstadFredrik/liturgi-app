<script>
	// DEV-modul: rediger originalmalene (BUILTIN_TEMPLATES i src/lib/data.js)
	// med hele den vanlige riktekst-editoren, og lagre dem tilbake i prosjektet
	// slik at de blir med i byggprosessen. Komponenten bygges ALDRI ut i
	// produksjon — +page.svelte gate'er den på __DEV_MODE__ + app.devModus,
	// og IPC-handleren i main.cjs nekter i pakket app.
	import { BUILTIN_TEMPLATES } from '$lib/data.js';
	import { app } from '$lib/store.svelte.js';
	import { åpneOriginal, lagreTilProsjekt } from '$lib/malverktoy.svelte.js';
	import { mdi } from '$lib/mdi.js';

	/** Redigeres nå en dev-kopi av en originalmal? */
	const devDok = $derived(app.current?.__devMal ? app.current : null);
</script>

<div id="malverktoy">
	<h1>Malverktøy <span class="dev-merke">DEV</span></h1>
	<p class="beskrivelse">
		Rediger originalmalene som følger programmet. Endringene lagres tilbake i
		<code>src/lib/data.js</code> og i seed-filene under
		<code>~/.config/Liturgi/maler/</code>, slik at de blir med i byggprosessen.
		Denne modulen finnes ikke i pakkede utgaver.
	</p>

	{#if devDok}
		<div class="apen-boks">
			<span>Åpen for redigering: <strong>{devDok.name}</strong></span>
			<button class="primary" onclick={lagreTilProsjekt}>
				{@html mdi('content-save')} Lagre til prosjektet
			</button>
		</div>
	{/if}

	<ul class="mal-liste">
		{#each BUILTIN_TEMPLATES as bt (bt.id)}
			<li>
				<div class="mal-info">
					<span class="navn">{bt.name}</span>
					{#if bt.description}<span class="beskr">{bt.description}</span>{/if}
				</div>
				<button onclick={() => åpneOriginal(bt)}>
					{@html mdi('pencil')} Åpne i redigering
				</button>
			</li>
		{/each}
	</ul>
</div>

<style>
	#malverktoy { max-width: 720px; margin: 0 auto; padding: 24px; }
	h1 { display: flex; align-items: center; gap: 10px; }
	.dev-merke {
		font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: 6px;
		background: var(--accent); color: #fff;
	}
	.beskrivelse { color: var(--muted-foreground); font-size: 14px; }
	.apen-boks {
		display: flex; align-items: center; justify-content: space-between; gap: 12px;
		padding: 12px 14px; border: 1px solid var(--border); border-radius: 8px;
		background: var(--card); margin: 16px 0;
	}
	.mal-liste { list-style: none; padding: 0; margin: 16px 0 0; display: grid; gap: 10px; }
	.mal-liste li {
		display: flex; align-items: center; justify-content: space-between; gap: 14px;
		padding: 12px 14px; border: 1px solid var(--border); border-radius: 8px; background: var(--card);
	}
	.mal-info { display: grid; gap: 2px; }
	.navn { font-weight: 600; }
	.beskr { font-size: 13px; color: var(--muted-foreground); }
</style>
