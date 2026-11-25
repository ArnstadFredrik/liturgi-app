<script>
	/**
	 * Brukerhåndbok: dokumentasjonen (docs/*.md) rendret i appen.
	 * Åpnes fra Innstillinger eller menylinjen under «Hjelp».
	 */
	import { app } from './store.svelte.js';
	import { handbokDokumenter, mdTilHtml } from './handbok.js';
	import { mdi } from './mdi.js';

	let valgt = $state('brukerhandbok');
	const dok = $derived(handbokDokumenter.find((d) => d.id === valgt) ?? handbokDokumenter[0]);
	const html = $derived.by(() => {
		try { return mdTilHtml(dok.md); } catch { return '<p>Klarte ikke rendre dokumentasjonen.</p>'; }
	});
</script>

<div id="handbok-side">
	<div class="handbok-topp">
		<button class="handbok-tilbake" title="Tilbake til forrige visning" onclick={() => { app.visning = app.current ? 'editor' : 'hjem'; }}>
			{@html mdi('chevron-left', 15)} Tilbake
		</button>
		<h2>Brukerhåndbok</h2>
		<div class="handbok-faner">
			{#each handbokDokumenter as d (d.id)}
				<button class:valgt={valgt === d.id} onclick={() => { valgt = d.id; }}>{d.tittel}</button>
			{/each}
		</div>
	</div>
	<div class="handbok-innhold lit-text">
		{@html html}
	</div>
</div>

<style>
	#handbok-side {
		display: flex;
		flex-direction: column;
		height: 100%;
		overflow: hidden;
	}
	.handbok-topp {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 16px;
		border-bottom: 1px solid var(--border);
	}
	.handbok-topp h2 { margin: 0; font-size: 15px; }
	.handbok-tilbake {
		display: inline-flex; align-items: center; gap: 4px;
		background: none; border: 1px solid var(--border); border-radius: 6px;
		color: var(--accent); cursor: pointer; padding: 3px 9px; font-size: 12px;
	}
	.handbok-faner { display: flex; gap: 6px; margin-left: auto; }
	.handbok-faner button {
		background: none; border: 1px solid var(--border); border-radius: 6px;
		color: var(--muted-foreground); cursor: pointer; padding: 3px 10px; font-size: 12px;
	}
	.handbok-faner button.valgt { color: var(--accent); border-color: var(--accent); }
	.handbok-innhold {
		flex: 1;
		overflow-y: auto;
		padding: 18px 26px 60px;
		max-width: 860px;
		line-height: 1.55;
	}
	.handbok-innhold :global(h1) { font-size: 22px; margin: 0.4em 0 0.6em; }
	.handbok-innhold :global(h2) { font-size: 17px; margin: 1.6em 0 0.5em; border-bottom: 1px solid var(--border); padding-bottom: 4px; }
	.handbok-innhold :global(h3) { font-size: 14px; margin: 1.2em 0 0.4em; }
	.handbok-innhold :global(code) {
		font-family: ui-monospace, 'SF Mono', Menlo, monospace;
		font-size: 0.9em;
		background: var(--panel2);
		border-radius: 4px;
		padding: 1px 5px;
	}
	.handbok-innhold :global(pre) {
		background: var(--panel2);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 10px 14px;
		overflow-x: auto;
		font-size: 12px;
	}
	.handbok-innhold :global(pre code) { background: none; padding: 0; }
	.handbok-innhold :global(table) { border-collapse: collapse; margin: 0.6em 0; width: 100%; font-size: 13px; }
	.handbok-innhold :global(th), .handbok-innhold :global(td) {
		border: 1px solid var(--border);
		padding: 5px 10px;
		text-align: left;
		vertical-align: top;
	}
	.handbok-innhold :global(th) { background: var(--panel2); }
	.handbok-innhold :global(blockquote) { border-left: 3px solid var(--accent); margin: 0.6em 0; padding: 2px 14px; }
	.handbok-innhold :global(a) { color: var(--accent); }
	.handbok-innhold :global(hr) { border: none; border-top: 1px solid var(--border); margin: 1.4em 0; }
</style>
