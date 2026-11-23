<script>
	// DEV-modul: rediger originalmalene (BUILTIN_TEMPLATES i src/lib/data.js)
	// med hele den vanlige riktekst-editoren, og lagre dem tilbake i prosjektet
	// slik at de blir med i byggprosessen. Komponenten bygges ALDRI ut i
	// produksjon — +page.svelte gate'er den på __DEV_MODE__ + app.devModus,
	// og IPC-handleren i main.cjs nekter i pakket app.
	import { BUILTIN_TEMPLATES } from '$lib/data.js';
	import { malType } from '$lib/modal.svelte.js';
	import { målformLabel, malFormFor, erWip, kategoriFor, kategoriSort, KATEGORIER, TYPER } from '$lib/maltyper.js';
	import { app, openTemplate } from '$lib/store.svelte.js';
	import { åpneOriginal, lagreTilProsjekt, åpneUtkast, slettUtkast, bekreftWipMal, slettMalFraProsjektet, åpneForhåndsvisning } from '$lib/malverktoy.svelte.js';
	import FilterDropdown from '$lib/FilterDropdown.svelte';
	import { erOriginalMal } from '$lib/fileio.svelte.js';
	import { mdi } from '$lib/mdi.js';

	/** S\u00f8k + type-filter + sortering etter type s\u00e5 navn (samme som malmodulen).
	 *  Tabellen viser ALLE maler fra disk (originaler + wip + brukermaler). */
	const LS_MV = 'malverktoy-filtre';
	function lastMvFiltre() {
		try { return JSON.parse(localStorage.getItem(LS_MV) ?? '{}'); } catch { return {}; }
	}
	const _mv = lastMvFiltre();
	let q = $state(_mv.q ?? '');
	let typeSel = $state(_mv.typeSel ?? []);
	let kildeSel = $state(_mv.kildeSel ?? []);
	let katSel = $state(_mv.katSel ?? []);
	function lagreMvFiltre() {
		try { localStorage.setItem(LS_MV, JSON.stringify({ q, typeSel, kildeSel, katSel, sorterNokkel, sortRetning })); } catch {}
	}
	$effect(() => { lagreMvFiltre(); });
	function nullstillFiltre() {
		q = '';
		typeSel = [];
		kildeSel = [];
		katSel = [];
	}
	function noenFiltre() {
		return !!(q || typeSel.length || kildeSel.length || katSel.length);
	} // alle | gudstjeneste | vigsel | gravferd
	const typeRekkefolge = { gudstjeneste: 0, vigsel: 1, gravferd: 2 };
	let sorterNokkel = $state(_mv.sorterNokkel ?? 'navn'); // navn | kategori | maalform | type | kilde
	let sortRetning = $state(_mv.sortRetning ?? 1); // 1 = stigende, -1 = synkende
	const sorterVerdi = (t) => ({
		navn: (t.name ?? '').toLowerCase(),
		kategori: kategoriFor(t),
		maalform: målformLabel(malFormFor(t)),
		type: typeNavn(t),
		kilde: erOriginalMal(t) ? 'original' : 'bruker'
	});
	function klikkSorter(nokkel) {
		if (sorterNokkel === nokkel) sortRetning = -sortRetning;
		else { sorterNokkel = nokkel; sortRetning = 1; }
	}
	function sortIkon(nokkel) {
		if (sorterNokkel !== nokkel) return '';
		return sortRetning === 1 ? ' ↑' : ' ↓';
	}
	const visMal = $derived(
		(app.templates ?? [])
			.filter((t) => (!q || t.name.toLowerCase().includes(q.toLowerCase())) && (typeSel.length === 0 || typeSel.includes(malType(t))) && (kildeSel.length === 0 || kildeSel.includes(erOriginalMal(t) ? 'originaler' : 'brukermaler')) && (katSel.length === 0 || katSel.includes(kategoriFor(t))))
			.sort((a, b) => {
				const va = sorterVerdi(a);
				const vb = sorterVerdi(b);
				const cmp = String(va).localeCompare(String(vb), 'no') || (kategoriSort(a) - kategoriSort(b)) || a.name.localeCompare(b.name, 'no');
				return cmp * sortRetning;
			})
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

	/** Åpen rad-meny { id, top, left } — én om gangen. Menyen rendres ved
 *  komponentroten (utenfor tabellen) med position: fixed, så den aldri
 *  klippes av tabellens overflow og alltid klemmes innenfor vinduet. */
	let åpenMeny = $state(null);
	let menyEl = $state(null);
	function åpneMenyFor(t, e) {
		e.stopPropagation();
		if (åpenMeny?.id === t.id) { åpenMeny = null; return; }
		const r = e.currentTarget.getBoundingClientRect();
		const bredde = 200, hoyde = 180;
		let left = r.right - bredde;
		left = Math.max(8, Math.min(left, window.innerWidth - bredde - 8));
		let top = r.bottom + 4;
		if (top + hoyde > window.innerHeight - 8) top = Math.max(8, r.top - hoyde - 4);
		åpenMeny = { id: t.id, top, left };
	}
	// klem menyen innenfor vinduet etter rendering (faktisk hoyde)
	$effect(() => {
		if (!åpenMeny || !menyEl) return;
		const r = menyEl.getBoundingClientRect();
		if (r.right > window.innerWidth - 8) {
			åpenMeny = { ...åpenMeny, left: Math.max(8, window.innerWidth - r.width - 8) };
		}
		if (r.bottom > window.innerHeight - 8) {
			åpenMeny = { ...åpenMeny, top: Math.max(8, window.innerHeight - r.height - 8) };
		}
		const lukk = (e) => {
			if (menyEl?.contains(e.target) || e.target.closest?.('.rad-meny-knapp')) return;
			åpenMeny = null;
		};
		// pointerdown (IKKE click): menyen må være montert når menyvalgets
		// click-event fyre — click-lukking i capture-fasen unmountet menyen
		// før valget, så handlingene «aldri» ble utløst
		window.addEventListener('pointerdown', lukk, { capture: true });
		window.addEventListener('resize', lukk);
		return () => {
			window.removeEventListener('pointerdown', lukk, { capture: true });
			window.removeEventListener('resize', lukk);
		};
	});

	/** Utkaster fra ~/.config/Liturgi/malutkast (skrevet ved feil i «Lagre til prosjektet»). */
	let utkast = $state([]);
	$effect(() => { window.liturgi?.devUtkast?.().then((r) => { if (r?.ok) utkast = r.utkast; }); });
</script>

<div id="malverktoy">
	<h1>Malverktøy <span class="dev-merke">DEV</span></h1>
	<p class="beskrivelse">
		Rediger originalmalene som følger programmet. Alle endringer lagres
		tilbake i <code>src/lib/data.js</code> og i seed-filene under
		<code>~/.config/Liturgi/maler/</code>, slik at de blir med i byggprosessen.
		«Lagre til prosjektet» lagrer endringene dine (wip-status beholdes —
		malen forblir uverifisert). «Bekreft» fjerner wip-status OG lagrer
		til prosjektet — malen blir da offisiell og kommer med i Opprett.
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

	{#if åpenMeny}
		{@const menyMal = app.templates.find((x) => x.id === åpenMeny.id)}
		{#if menyMal}
			<div class="rad-meny-liste" role="menu" bind:this={menyEl} style="top: {åpenMeny.top}px; left: {åpenMeny.left}px;" onclick={(e) => e.stopPropagation()}>
				<button role="menuitem" onclick={() => { åpenMeny = null; åpneOriginal(harSeed(menyMal) ? BUILTIN_TEMPLATES.find((bt) => bt.id === menyMal.id) : menyMal); }} title="Åpner direkte i redigering; lagres til prosjektet med «Lagre til prosjektet»">{@html mdi('pencil', 14)} Rediger seed</button>
				<button role="menuitem" onclick={() => { åpenMeny = null; åpneForhåndsvisning(menyMal); }} title="Forhåndsvisning uten redigering">{@html mdi('script-text-outline', 14)} Åpne</button>
				{#if erWip(menyMal)}
					<button role="menuitem" onclick={() => { åpenMeny = null; bekreftWipMal(menyMal); }} title="Bekreft malen (fjern WIP) og lagre til prosjektet">{@html mdi('check', 14)} Bekreft</button>
				{/if}
				<hr />
				<button role="menuitem" class="rad-meny-fare" onclick={() => { åpenMeny = null; slettMalFraProsjektet(menyMal); }} title="Slett malen fra prosjektet (data.js-seed + fil)">{@html mdi('delete-outline', 14)} Slett</button>
			</div>
		{/if}
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
		<div class="mal-filter-rekke">
			<FilterDropdown label="Type" options={TYPER.map((t) => ({ verdi: t, navn: t[0].toUpperCase() + t.slice(1) }))} bind:selected={typeSel} />
			<FilterDropdown label="Kilde" options={[{ verdi: 'originaler', navn: 'Originaler' }, { verdi: 'brukermaler', navn: 'Brukermaler' }]} bind:selected={kildeSel} />
			<FilterDropdown label="Kategori" options={KATEGORIER.map((k) => ({ verdi: k, navn: k }))} bind:selected={katSel} />
			<button class="filter-nullstill" onclick={nullstillFiltre} disabled={!noenFiltre()} title="Nullstill alle filtre">{@html mdi('filter-variant-remove', 14)} Nullstill</button>
		</div>
	</div>

	<div class="mal-tabell-kort">
		<table class="mal-tabell">
			<thead>
				<tr>
					<th><button class="th-sort" onclick={() => klikkSorter('navn')}>Navn{sortIkon('navn')}</button></th>
					<th><button class="th-sort" onclick={() => klikkSorter('kategori')}>Kategori{sortIkon('kategori')}</button></th>
					<th><button class="th-sort" onclick={() => klikkSorter('maalform')}>Målform{sortIkon('maalform')}</button></th>
					<th><button class="th-sort" onclick={() => klikkSorter('type')}>Type{sortIkon('type')}</button></th>
					<th><button class="th-sort" onclick={() => klikkSorter('kilde')}>Kilde{sortIkon('kilde')}</button></th>
					<th class="th-handlinger"></th>
				</tr>
			</thead>
			<tbody>
				{#each visMal as t (t.id)}
					<tr>
						<td class="t-navn" onclick={() => åpneForhåndsvisning(t)} title="Åpne som forhåndsvisning (låst)">{t.name}{#if erWip(t)} <span class="wip-merke" title="Uverifisert mal — ikke med i Opprett før den bekreftes">{erOriginalMal(t) ? 'WIP' : 'Utkast'}</span>{/if}</td>
						<td>{kategoriFor(t)}</td>
						<td>{målformLabel(malFormFor(t))}</td>
						<td>{typeNavn(t)}</td>
						<td>{erOriginalMal(t) ? 'Original' : 'Bruker'}</td>
						<td class="t-handlinger">
							<div class="rad-meny">
								<button class="rad-meny-knapp" onclick={(e) => åpneMenyFor(t, e)} title="Handlinger">{@html mdi('chevron-down', 16)}</button>
							</div>
						</td>
					</tr>
				{:else}
					<tr><td colspan="6" class="maler-tom">Ingen treff.</td></tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	#malverktoy { max-width: 1400px; margin: 0 auto; padding: 24px; display: flex; flex-direction: column; min-height: 0; flex: 1; }
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
	.w-mal-slett { color: var(--muted); }
	.w-mal-slett:hover { color: #c0392b; border-color: #c0392b; }
	.w-mal-slett:hover :global(svg) { color: #c0392b; }
	.rad-meny-knapp:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; border-radius: 6px; }
	.th-sort {
		background: none; border: none; color: inherit; font: inherit;
		font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;
		font-size: 11px; cursor: pointer; padding: 0;
	}
	.th-sort:hover { color: var(--accent); }
</style>
