<script>
	/** Cmd+K-kommandopalett: søk i alle menylinje-alternativene. */
	import { app, veksleSidebar, veksleToc, toggleTheme } from './store.svelte.js';
	import { saveCurrent, saveCurrentToFile, openFileToStore, kjorMenyId } from './fileio.svelte.js';

	let aapen = $state(false);
	let q = $state('');
	let valgt = $state(0);
	let inputEl = $state(null);

	// samme handlinger som mac-menylinjen
	const kommandoer = [
		{ id: 'ny-gudstjeneste', navn: 'Ny gudstjeneste …', kategori: 'Fil', taster: '⌘N', enabled: () => true, kjor: () => kjorMenyId('ny-gudstjeneste') },
		{ id: 'ny-gravferd', navn: 'Ny gravferd …', kategori: 'Fil', taster: '⇧⌘G', enabled: () => true, kjor: () => kjorMenyId('ny-gravferd') },
		{ id: 'apne-fil', navn: 'Åpne fil …', kategori: 'Fil', taster: '⌘O', enabled: () => true, kjor: () => kjorMenyId('apne-fil') },
		{ id: 'lagre', navn: 'Lagre', kategori: 'Fil', taster: '⌘S', enabled: () => !!app.current, kjor: () => kjorMenyId('lagre') },
		{ id: 'lagre-som', navn: 'Lagre som …', kategori: 'Fil', taster: '⇧⌘S', enabled: () => !!app.current, kjor: () => kjorMenyId('lagre-som') },
		{ id: 'lagre-som-mal', navn: 'Lagre som mal', kategori: 'Fil', taster: '', enabled: () => !!app.current, kjor: () => kjorMenyId('lagre-som-mal') },
		{ id: 'lukk-dok', navn: 'Lukk dokument', kategori: 'Fil', taster: '⌘W', enabled: () => !!app.current, kjor: () => kjorMenyId('lukk-dok') },
		{ id: 'hjem', navn: 'Hjem', kategori: 'Gå til', taster: '⌘1', enabled: () => true, kjor: () => kjorMenyId('hjem') },
		{ id: 'maler', navn: 'Maler', kategori: 'Gå til', taster: '⌘2', enabled: () => true, kjor: () => kjorMenyId('maler') },
		{ id: 'bibliotek', navn: 'Bibliotek', kategori: 'Gå til', taster: '⌘3', enabled: () => true, kjor: () => kjorMenyId('bibliotek') },
		{ id: 'innstillinger', navn: 'Innstillinger', kategori: 'Gå til', taster: '⌘,', enabled: () => true, kjor: () => kjorMenyId('innstillinger') },
		{ id: 'eksport', navn: 'Eksport', kategori: 'Gudstjeneste', taster: '⌘E', enabled: () => !!app.current && app.kind === 'service', kjor: () => kjorMenyId('eksport') },
		{ id: 'vis-leddinnhold', navn: 'Vis leddinnhold (eksport)', kategori: 'Gudstjeneste', taster: '', enabled: () => !!app.current && app.kind === 'service', kjor: () => kjorMenyId('vis-leddinnhold') },
		{ id: 'koblet-visning', navn: 'Koblet visning (eksport)', kategori: 'Gudstjeneste', taster: '', enabled: () => !!app.current && app.kind === 'service', kjor: () => kjorMenyId('koblet-visning') },
		{ id: 'apne-mappe', navn: 'Åpne mappe (vis filen i Finder)', kategori: 'Gudstjeneste', taster: '', enabled: () => !!app.current?.filePath, kjor: () => kjorMenyId('apne-mappe') },
		{ id: 'veksle-sidebar', navn: 'Vis/skjul sidemenyen', kategori: 'Visning', taster: '⌘\\', enabled: () => true, kjor: () => veksleSidebar() },
		{ id: 'veksle-toc', navn: 'Vis/skjul dokumentpanelet', kategori: 'Visning', taster: '⌥⌘\\', enabled: () => true, kjor: () => veksleToc() },
		{ id: 'tema', navn: app.theme === 'dark' ? 'Bytt til lyst utseende' : 'Bytt til mørkt utseende', kategori: 'Visning', taster: '', enabled: () => true, kjor: () => toggleTheme() }
	];

	const filtrert = $derived.by(() => {
		const qn = q.trim().toLowerCase();
		if (!qn) return kommandoer;
		return kommandoer.filter((k) => (k.navn + ' ' + k.kategori).toLowerCase().includes(qn));
	});

	function aapne() {
		aapen = true;
		q = '';
		valgt = 0;
		setTimeout(() => inputEl?.focus(), 30);
	}
	function lukk() { aapen = false; }

	function tast(e) {
		if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
			e.preventDefault();
			aapen ? lukk() : aapne();
			return;
		}
		if (!aapen) return;
		if (e.key === 'Escape') { e.preventDefault(); lukk(); return; }
		if (e.key === 'ArrowDown') { e.preventDefault(); valgt = Math.min(filtrert.length - 1, valgt + 1); }
		else if (e.key === 'ArrowUp') { e.preventDefault(); valgt = Math.max(0, valgt - 1); }
		else if (e.key === 'Enter') {
			e.preventDefault();
			const k = filtrert[valgt];
			if (k && k.enabled()) { lukk(); k.kjor(); }
		}
	}
</script>

<svelte:window onkeydown={tast} />

{#if aapen}
	<div class="kp-bakgrunn" onclick={lukk}>
		<div class="kp-boks" onclick={(e) => e.stopPropagation()}>
			<input
				bind:this={inputEl}
				bind:value={q}
				class="kp-sok"
				placeholder="Søk i menyene …"
				oninput={() => (valgt = 0)}
			/>
			<div class="kp-liste">
				{#if filtrert.length === 0}
					<div class="kp-tom">Ingen treff</div>
				{:else}
					{#each filtrert as k, i (k.id)}
						{@const ok = k.enabled()}
						<div
							class="kp-rad" class:sel={i === valgt} class:av={!ok}
							onclick={() => { if (!ok) return; lukk(); k.kjor(); }}
							onmousemove={() => (valgt = i)}
						>
							<span class="kp-navn">{k.navn}</span>
							<span class="kp-kategori">{k.kategori}</span>
							{#if k.taster}<span class="kp-taster">{k.taster}</span>{/if}
						</div>
					{/each}
				{/if}
			</div>
			<div class="kp-bunn">↑↓ velg · ⏎ kjør · esc lukk</div>
		</div>
	</div>
{/if}
