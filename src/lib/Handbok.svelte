<script>
	/**
	 * Brukerhåndbok: dokumentasjonen (docs/*.md) rendret i appen.
	 * Åpnes fra Innstillinger eller menylinjen under «Hjelp».
	 * Innholdsfortegnelsen vises i en sidekolonne; navigasjonen er sentrert
	 * i toppen. Lenker til andre .md-dokumenter bytter fane.
	 */
	import { app } from './store.svelte.js';
	import { handbokDokumenter } from './handbok.js';
	import { mdi } from './mdi.js';

	let valgt = $state('brukerhandbok');
	const dok = $derived(handbokDokumenter.find((d) => d.id === valgt) ?? handbokDokumenter[0]);
	const html = $derived(dok.html);
	// sidekolonne: alle h2-overskrifter med anker
	const toc = $derived.by(() => {
		const liste = [];
		const re = /<h2 id="([^"]+)">(.*?)<\/h2>/g;
		let m;
		while ((m = re.exec(html))) liste.push({ id: m[1], tekst: m[2].replace(/<[^>]+>/g, '') });
		return liste;
	});

	/** Lenker til andre dokumenter (.md) bytter fane i stedet for  navigere. */
	function klikk(e) {
		const a = e.target?.closest?.('a');
		if (!a) return;
		const href = a.getAttribute('href') ?? '';
		if (href.endsWith('.md')) {
			e.preventDefault();
			const id = href.replace(/^\.\//, '').replace(/\.md$/, '');
			if (handbokDokumenter.some((d) => d.id === id)) valgt = id;
		}
	}
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
	<div class="handbok-body">
		<nav class="handbok-toc" aria-label="Innholdsfortegnelse">
			<div class="handbok-toc-tittel">Innhold</div>
			{#each toc as punkt (punkt.id)}
				<a href={'#' + punkt.id}>{punkt.tekst}</a>
			{/each}
		</nav>
		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
		<div class="handbok-innhold lit-text" onclick={klikk}>
			{@html html}
		</div>
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
		position: relative;
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
	/* navigasjonen sentrert midt p headeren */
	.handbok-faner {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: 6px;
	}
	.handbok-faner button {
		background: none; border: 1px solid var(--border); border-radius: 6px;
		color: var(--muted-foreground); cursor: pointer; padding: 3px 10px; font-size: 12px;
	}
	.handbok-faner button.valgt { color: var(--accent); border-color: var(--accent); }
	.handbok-body {
		flex: 1;
		display: flex;
		min-height: 0;
	}
	/* innholdsfortegnelsen i sidekolonne */
	.handbok-toc {
		flex: 0 0 210px;
		overflow-y: auto;
		border-right: 1px solid var(--border);
		padding: 16px 12px 40px;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.handbok-toc-tittel {
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--muted-foreground);
		margin-bottom: 8px;
	}
	.handbok-toc a {
		color: var(--muted-foreground);
		text-decoration: none;
		font-size: 12.5px;
		padding: 4px 8px;
		border-radius: 6px;
		overflow-wrap: anywhere;
	}
	.handbok-toc a:hover { background: var(--panel2); color: var(--accent); }
	.handbok-innhold {
		flex: 1;
		overflow-y: auto;
		padding: 18px 26px 60px;
		max-width: 860px;
		width: 100%;
		margin: 0 auto;
		line-height: 1.55;
		/* normal: pandoc-kilden har linjeskift/tomlinjer som ellers rendres som ekstra tomme linjer */
		white-space: normal;
	}
	.handbok-innhold :global(img) {
		max-width: 100%;
		height: auto;
		display: block;
		border: 1px solid var(--border);
		border-radius: 8px;
		margin: 0.8em 0;
	}
	.handbok-innhold :global(h1) { font-size: 22px; margin: 0.4em 0 0.6em; }
	.handbok-innhold :global(p), .handbok-innhold :global(ul), .handbok-innhold :global(ol), .handbok-innhold :global(pre), .handbok-innhold :global(table), .handbok-innhold :global(blockquote) {
		margin: 0 0 0.4em;
	}
	.handbok-innhold :global(li) { margin: 0; }
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
