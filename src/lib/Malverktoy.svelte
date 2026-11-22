<script>
	// DEV-modul: rediger originalmalene (BUILTIN_TEMPLATES i src/lib/data.js)
	// med hele den vanlige riktekst-editoren, og lagre dem tilbake i prosjektet
	// slik at de blir med i byggprosessen. Komponenten bygges ALDRI ut i
	// produksjon — +page.svelte gate'er den på __DEV_MODE__ + app.devModus,
	// og IPC-handleren i main.cjs nekter i pakket app.
	import { BUILTIN_TEMPLATES } from '$lib/data.js';
	import { malType } from '$lib/modal.svelte.js';
	import { målformLabel, malFormFor, erWip } from '$lib/maltyper.js';
	import { app, openTemplate } from '$lib/store.svelte.js';
	import { åpneOriginal, lagreTilProsjekt, åpneUtkast, slettUtkast, bekreftWipMal } from '$lib/malverktoy.svelte.js';
	import { erOriginalMal } from '$lib/fileio.svelte.js';
	import { mdi } from '$lib/mdi.js';

	/** S\u00f8k + type-filter + sortering etter type s\u00e5 navn (samme som malmodulen).
	 *  Tabellen viser ALLE maler fra disk (originaler + wip + brukermaler). */
	let q = $state('');
	let typeFilter = $state('alle'); // alle | gudstjeneste | vigsel | gravferd
	const typeRekkefolge = { gudstjeneste: 0, vigsel: 1, gravferd: 2 };
	const visMal = $derived(
		(app.templates ?? [])
			.filter((t) => (!q || t.name.toLowerCase().includes(q.toLowerCase())) && (typeFilter === 'alle' || malType(t) === typeFilter))
			.sort((a, b) => (typeRekkefolge[malType(a)] - typeRekkefolge[malType(b)]) || a.name.localeCompare(b.name, 'no'))
	);
	/** Har malen en seed i data.js (kan redigeres med \u00abLagre til prosjektet\u00bb)? */
	function harSeed(t) {
		return BUILTIN_TEMPLATES.some((bt) => bt.id === t.id);
	}
	function typeNavn(t) {
		return { gudstjeneste: 'Gudstjeneste', vigsel: 'Vigsel', gravferd: 'Gravferd' }[malType(t)] ?? malType(t);
	}

	/** Redigeres nå en dev-kopi av en originalmal? */
	const devDok = $derived(app.current?.__devMal ? app.current : null);

	/** Utkaster fra ~/.config/Liturgi/malutkast (skrevet ved feil i «Lagre til prosjektet»). */
	let utkast = $state([]);
	$effect(() => { window.liturgi?.devUtkast?.().then((r) => { if (r?.ok) utkast = r.utkast; }); });
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

	{#if utkast.length}
		<div class="utkast-boks">
			<div class="utkast-tittel">Utkaster ({utkast.length})</div>
			<p class="muted">Skrevet ved feil under «Lagre til prosjektet». Åpne, rediger og lagre tilbake — slett når det er tatt vare på.</p>
			{#each utkast as u (u.fil)}
				<div class="utkast-rad">
					<span class="utkast-navn">{u.name || u.id}<span class="utkast-tid"> · {u.tid}</span></span>
					<button onclick={() => åpneUtkast(u.fil)}>{@html mdi('pencil')} Åpne</button>
					<button onclick={async () => { if (await slettUtkast(u.fil)) utkast = utkast.filter((x) => x.fil !== u.fil); }}>Slett</button>
				</div>
			{/each}
		</div>
	{/if}

	<div class="mal-filter">
		<input class="mal-sok" placeholder="Søk i malene …" bind:value={q} />
		<div class="mal-chips" role="group" aria-label="Filtrer etter type">
			{#each [['alle', 'Alle'], ['gudstjeneste', 'Gudstjeneste'], ['vigsel', 'Vigsel'], ['gravferd', 'Gravferd']] as [verdi, navn]}
				<button class:sel={typeFilter === verdi} onclick={() => typeFilter = verdi}>{navn}</button>
			{/each}
		</div>
	</div>

	<div class="mal-tabell-kort">
		<table class="mal-tabell">
			<thead>
				<tr><th>Navn</th><th>Målform</th><th>Type</th><th>Kilde</th><th class="th-handlinger"></th></tr>
			</thead>
			<tbody>
				{#each visMal as t (t.id)}
					<tr>
						<td class="t-navn" onclick={() => openTemplate(t.id)} title="Åpne og se gjennom">{t.name}{#if erWip(t)} <span class="wip-merke" title="WIP — uverifisert mal, ikke med i Opprett før den er bekreftet">WIP</span>{/if}</td>
						<td>{målformLabel(malFormFor(t))}</td>
						<td>{typeNavn(t)}</td>
						<td>{erOriginalMal(t) ? 'Original' : 'Bruker'}</td>
						<td class="t-handlinger">
							{#if erWip(t)}
								<button class="w-mal-bekreft" onclick={() => bekreftWipMal(t)} title="Bekreft malen (fjern WIP)">{@html mdi('check', 13)} Bekreft</button>
							{/if}
							{#if harSeed(t)}
								<button onclick={() => åpneOriginal(BUILTIN_TEMPLATES.find((bt) => bt.id === t.id))} title="Rediger seed-malen i data.js (lagres til prosjektet)">{@html mdi('pencil', 13)} Rediger seed</button>
							{/if}
							<button onclick={() => openTemplate(t.id)} title="Åpne i den vanlige editoren">Åpne</button>
						</td>
					</tr>
				{:else}
					<tr><td colspan="5" class="maler-tom">Ingen treff.</td></tr>
				{/each}
			</tbody>
		</table>
	</div>
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
.utkast-boks {
	padding: 12px 14px; border: 1px solid var(--accent); border-radius: 8px;
	background: var(--card); margin: 16px 0;
}
.utkast-tittel { font-weight: 600; margin-bottom: 4px; }
.utkast-rad {
	display: flex; align-items: center; justify-content: space-between; gap: 12px;
	padding: 8px 0; border-top: 1px solid var(--border);
}
.utkast-navn { flex: 1; }
.utkast-tid { color: var(--muted-foreground); font-size: 13px; }
</style>
