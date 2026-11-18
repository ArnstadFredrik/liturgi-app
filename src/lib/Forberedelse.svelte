<script>
	import { litHtml } from '$lib/lit.js';
	import { app as appStore } from '$lib/store.svelte.js';
	import { valgModal } from '$lib/modal.svelte.js';
	import { mdi } from '$lib/mdi.js';
	import { onMount } from 'svelte';

	const isElectron = typeof window !== 'undefined' && !!window.liturgi?.isElectron;
	const STANDARD = '~/Documents/Liturgi/forberedelse';

	// mappe fra databasen (nøkkel 'prekenforberedelseMappe')
	let mappe = $state('');
	let klar = $state(false);

	// tre + editor
	let entries = $state([]); // [{ navn, sti, mappe, children }]
	let aapneMapper = $state({}); // sti → true/false
	let valgtSti = $state('');
	let tekst = $state('');
	let lagretTekst = $state('');
	let jobber = $state(false);
	let feil = $state('');
	// Obsidian-lignende visning: delt (kilde + forhåndsvisning), kun kilde eller kun forhåndsvisning
	let visning = $state('dele');

	let dirty = $derived(tekst !== lagretTekst);
	let forhandsvisningHtml = $derived(litHtml(tekst ?? ''));

	onMount(async () => {
		if (!isElectron) return;
		const r = await window.liturgi.dbGet('prekenforberedelseMappe');
		mappe = r?.ok ? (r.value ?? '') : '';
		klar = true;
		if (mappe) {
			await lastTre();
			// åpnet fra Kirkeåret: auto-åpne notat.md i det nye prosjektet
			if (appStore.forbAapneSti) {
				const sti = appStore.forbAapneSti;
				appStore.forbAapneSti = null;
				await aapneFil(sti);
			}
		}
	});

	async function lastTre() {
		const r = await window.liturgi.forbMappe(mappe);
		if (r?.ok) {
			entries = r.entries ?? [];
			feil = '';
		} else feil = r?.error ?? 'Klarte ikke lese mappen';
	}

	/** Første gangs oppsett: dialogen foreslår standardmappen (defaultPath) og
	 *  lar brukeren velge en annen mappe. Valget lagres i databasen. */
	async function velgMappe() {
		const r = await window.liturgi.forbVelgMappe();
		if (!r?.ok) return;
		mappe = r.sti;
		await window.liturgi.dbSet('prekenforberedelseMappe', mappe);
		await lastTre();
	}

	function toggleMappe(sti) {
		aapneMapper = { ...aapneMapper, [sti]: !aapneMapper[sti] };
	}

	/** Ulagrede endringer → spør om å forkaste (løser med true/false). */
	function bekreftForkast() {
		return new Promise((resolve) => {
			if (!dirty) return resolve(true);
			valgModal('Ulagrede endringer', 'Du har endringer i «' + (valgtSti.split('/').pop() ?? '') + '» som ikke er lagret. Forkaste dem?', 'Forkast', 'Fortsett redigering', () => resolve(true));
		});
	}

	async function aapneFil(sti) {
		if (sti === valgtSti) return;
		if (dirty && !(await bekreftForkast())) return;
		const r = await window.liturgi.forbLesFil(sti);
		if (!r?.ok) { feil = r?.error ?? 'Klarte ikke lese filen'; return; }
		valgtSti = sti;
		tekst = r.tekst;
		lagretTekst = r.tekst;
		feil = '';
	}

	async function lagre() {
		if (!dirty || !valgtSti) return;
		jobber = true;
		const r = await window.liturgi.forbLagreFil(valgtSti, tekst);
		jobber = false;
		if (r?.ok) lagretTekst = tekst;
		else feil = r?.error ?? 'Klarte ikke lagre';
	}

	function vedTast(e) {
		if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); lagre(); }
	}
</script>

<svelte:window onkeydown={vedTast} />

<div id="forberedelse">
	<h2>Prekenforberedelse</h2>
	{#if !isElectron}
		<p class="fb-ingress">Prekenforberedelser er kun tilgjengelig i Mac-appen.</p>
	{:else if !klar}
		<p class="fb-ingress">Laster …</p>
	{:else if !mappe}
		<div class="fb-oppsett">
			<div class="fb-oppsett-ikon">{@html mdi('notebook', 34)}</div>
			<div class="fb-oppsett-tittel">Prekenforberedelse</div>
			<p class="fb-ingress">
				Velg mappen der prosjektene skal ligge. Standard er
				<code>{STANDARD}</code> — du kan velge en annen mappe i dialogen.
				Valget lagres og kan endres i innstillingene.
			</p>
			<button class="fb-hovedknapp" onclick={velgMappe}>{@html mdi('folder-open-outline', 16)} Velg mappe …</button>
		</div>
	{:else}
		<div class="fb-kolonner">
			<div class="fb-tre">
				<div class="fb-tre-hode">
					<span class="sidehead">Prosjekter</span>
					<button class="ikon-btn" title="Oppdater mappen" onclick={lastTre}>{@html mdi('refresh', 15)}</button>
				</div>
				{#if !entries.length}
					<div class="fb-tom">
					<p class="fb-ingress">Mappen er tom.</p>
					<p class="fb-ingress">Opprett prosjekter fra <strong>Kirkeåret</strong>-modulen.</p>
				</div>
				{/if}
				{#snippet tre(liste, nivaa)}
					{#each liste as e (e.sti)}
						{#if e.mappe}
							<button class="fb-mappe" style="padding-left: {8 + nivaa * 14}px" onclick={() => toggleMappe(e.sti)}>
								{@html mdi('folder-open-outline', 15)} {e.navn}
							</button>
							{#if aapneMapper[e.sti]}
								{@render tre(e.children ?? [], nivaa + 1)}
							{/if}
						{:else}
							<button class="fb-fil" class:sel={valgtSti === e.sti} style="padding-left: {8 + nivaa * 14 + 4}px" onclick={() => aapneFil(e.sti)}>
								{@html mdi('file-document-outline', 14)} {e.navn.replace(/\.md$/i, '')}
							</button>
						{/if}
					{/each}
				{/snippet}
				{@render tre(entries, 0)}
			</div>
			<div class="fb-editor">
				{#if !valgtSti}
					<div class="fb-tom fb-editor-tom">
						<p class="fb-ingress">Velg en fil i listen.</p>
						<p class="fb-ingress">Nye prosjekter opprettes fra <strong>Kirkeåret</strong>-modulen.</p>
					</div>
				{:else}
					<div class="fb-editor-hode">
						<span class="fb-filnavn">{valgtSti.slice(mappe.length + 1) || valgtSti}</span>
						{#if dirty}<span class="fb-dirty">ulagret</span>{/if}
						<div class="fb-visning-velger">
							<button class:sel={visning === 'dele'} onclick={() => visning = 'dele'}>Delt</button>
							<button class:sel={visning === 'kilde'} onclick={() => visning = 'kilde'}>Kilde</button>
							<button class:sel={visning === 'forhandsvisning'} onclick={() => visning = 'forhandsvisning'}>Forhåndsvisning</button>
						</div>
						<button class="fb-lagre" onclick={lagre} disabled={!dirty || jobber}>{@html mdi('content-save', 14)} {jobber ? 'Lagrer …' : 'Lagre'}</button>
					</div>
					{#if feil}<p class="fb-feil">{feil}</p>{/if}
					<div class="fb-felter" class:dele={visning === 'dele'}>
						{#if visning !== 'forhandsvisning'}
							<textarea class="fb-kilde" bind:value={tekst} spellcheck="true" placeholder="Skriv her …"></textarea>
						{/if}
						{#if visning !== 'kilde'}
							<div class="fb-forhandsvisning lit-text">{@html forhandsvisningHtml}</div>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
