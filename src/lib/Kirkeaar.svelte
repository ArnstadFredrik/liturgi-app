<script>
	import { onMount } from 'svelte';
	import church from 'church-year';
	import { lookupKirkeaar, hentTekster } from '$lib/kirkeaar.js';
	import { litHtml } from '$lib/lit.js';
	import { app } from '$lib/store.svelte.js';

	const isElectron = typeof window !== 'undefined' && !!window.liturgi?.isElectron;

	/** ISO-dato for lokal dag n dager fra nå (unngår toISOString-tidssoneskifte). */
	function isoLokal(d) {
		const pad = (n) => String(n).padStart(2, '0');
		return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
	}

	let iDag = $state('');
	let soendag = $state('');
	let soendagDag = $state(null); // { name, color, series, prayer, L1/L2/E, day }
	let soendagTekster = $state(null);
	let mellomDager = $state([]); // kirkeårsdager/merkedager mellom i dag og kommende søndag
	let laster = $state(true);
	let online = $state(typeof navigator !== 'undefined' ? navigator.onLine : true);
	let visMerkedager = $state(true); // innstilling — persistent i liturgi.db (nøkkel 'kirkeaarMerkedager')
	let valgtDag = $state(null); // dag valgt i søkefeltet
	let valgtTekster = $state(null);
	let valgtLaster = $state(false);
	let sok = $state(''); // fritekst: navn ELLER dato (åååå-mm-dd, dd.mm, dd/mm)

	const lesninger = [
		{ key: 'L1', tittel: 'Første lesning' },
		{ key: 'L2', tittel: 'Andre lesning' },
		{ key: 'E', tittel: 'Evangelium' }
	];

	/** Neste søndag (i dag medregnet helt til dagen er passert). */
	function nesteSoendag() {
		const d = new Date();
		d.setDate(d.getDate() + (7 - d.getDay()) % 7);
		return isoLokal(d);
	}

	function church_startYear(dateISO) {
		try { return church.calculateStartYear(dateISO); } catch { return null; }
	}
	function churchYearFiltered(startYear, fraISO, tilISO) {
		try {
			return church.churchYear({ year: startYear })
				.filter((d) => {
					const dt = d.day?.slice(0, 10) ?? '';
					return dt >= fraISO && dt <= tilISO;
				})
				.map((d) => {
					const cr = d.readings?.currentReadings;
					const text = cr?.text || {};
					return {
						date: d.day?.slice(0, 10) ?? '',
						name: d.name,
						color: d.liturgical_color?.name ?? '',
						series: cr?.name ?? '',
						prayer: (d.prayer || '').trim(),
						L1: text.L1 ?? '',
						L2: text.L2 ?? '',
						E: text.E ?? '',
						day: { id: d.id, years: d.years },
						erSoendag: new Date(d.day).getDay() === 0
					};
				});
		} catch {
			return [];
		}
	}

	/** Søk: navn (fuzzy innehold) eller dato (2026-12-24, 24.12, 24/12, 24-12). */
	function sokTreff(dag) {
		const q = sok.trim().toLowerCase();
		if (!q) return true;
		if (dag.name.toLowerCase().includes(q)) return true;
		// dato-søk
		const norm = q.replace(/\./g, '-').replace(/\//g, '-');
		if (dag.date.includes(norm)) return true;
		const p = norm.split('-').filter(Boolean);
		if (p.length === 2 && p.every((x) => /^\d{1,2}$/.test(x))) {
			const aa = p[0].padStart(2, '0'), bb = p[1].padStart(2, '0');
			return dag.date.includes('-' + bb + '-' + aa) || dag.date.includes('-' + aa + '-' + bb);
		}
		return false;
	}

	let alleKirkeaarsDager = $state([]); // hele kirkeåret (til søk)

	let sokTreffe = $state([]);
	// NB: $derived viste seg stale her (samme fenn som malerForType i Modal) → $effect
	$effect(() => {
		sokTreffe = alleKirkeaarsDager
			.filter((d) => sokTreff(d))
			.sort((a, b) => a.date.localeCompare(b.date))
			.slice(0, 12);
	});

	async function hentDag(dag) {
		valgtDag = dag;
		valgtTekster = null;
		valgtLaster = !!dag.day;
		if (!dag.day) { valgtLaster = false; return; }
		const t = online ? await hentTekster(dag.day) : null;
		valgtTekster = t;
		valgtLaster = false;
	}

	async function lagreInnstilling(v) {
		visMerkedager = v;
		if (isElectron) {
			try { await window.liturgi.dbSet('kirkeaarMerkedager', v ? '1' : '0'); } catch { /* db utilgjengelig */ }
		} else {
			try { localStorage.setItem('kirkeaarMerkedager', v ? '1' : '0'); } catch { /* full */ }
		}
		// re-filter mellom-dagene med ny innstilling
		mellomDager = raaMellom.filter((d) => visMerkedager || d.erSoendag);
	}

	let raaMellom = $state([]); // alle dager i vinduet (før merkedager-filter)

	onMount(async () => {
		try {
			iDag = isoLokal(new Date());
			soendag = nesteSoendag();
			online = navigator.onLine;
		// les innstillingen (db i Electron, localStorage ellers)
		if (isElectron) {
			try {
				const r = await window.liturgi.dbGet('kirkeaarMerkedager');
				if (r?.ok && r.value != null) visMerkedager = r.value === '1';
			} catch { /* standard på */ }
		} else {
			try { visMerkedager = (localStorage.getItem('kirkeaarMerkedager') ?? '1') === '1'; } catch { /* standard */ }
		}
		soendagDag = lookupKirkeaar(soendag);
		// dager i vinduet — churchYear for STARTÅRET til søndagen
		raaMellom = churchYearFiltered(church_startYear(soendag), iDag, soendag);
		mellomDager = raaMellom.filter((d) => visMerkedager || d.erSoendag);
		// hele kirkeåret + neste kirkeår til søkefeltet (så merkedager lenger frem også treffes)
		const detteAaret = churchYearFiltered(church_startYear(soendag), raaMellom[0]?.date ?? iDag, '9999-12-31');
		const nesteAaret = churchYearFiltered(church_startYear(soendag) + 1, '2000-01-01', '9999-12-31');
		alleKirkeaarsDager = [...detteAaret, ...nesteAaret];
			if (soendagDag?.day && online) {
				soendagTekster = await hentTekster(soendagDag.day);
			}
		} catch (e) {
			console.error('Kirkeåret: klarte ikke laste', e);
		}
		laster = false;
	});

	function visTekst(ref, tekst) {
		if (!tekst) return litHtml('*Klarte ikke hente teksten' + (online ? '' : ' (offline)') + '.*');
		const innhold = (tekst.title ? '**' + tekst.title + '**\n' : '') + tekst.text;
		return litHtml(innhold);
	}

	function visBønn(prayer) {
		return (prayer || '').split('\n').filter((l) => l.trim())
			.map((l) => l.replace(/^(L|M) \|/, '').trim())
			.join('\n');
	}
</script>

<div id="kirkeaar-modul">
	<div class="ka-topp">
		<h2>Kirkeåret</h2>
		<span class="ka-nett" class:off={!online}>{online ? 'Online — bibeltekster hentes fra bibel.no' : 'Offline — viser kun referanser'}</span>
	</div>

	<div class="ka-sok">
		<input
			type="search"
			bind:value={sok}
			placeholder="Søk etter kirkeårsdag eller dato (f.eks. «jul», «24.12», «2026-12-24») …"
			spellcheck="false"
		/>
		{#if sok.trim() && sokTreffe.length}
			<div class="ka-sok-treff">
				{#each sokTreffe as dag (dag.date + dag.name)}
					<button class="ka-treff" class:valgt={valgtDag?.date === dag.date && valgtDag?.name === dag.name} onclick={() => hentDag(dag)}>
						<span class="ka-treff-dato">{dag.date}</span>
						<span class="ka-treff-navn">{dag.name}</span>
						{#if dag.color}<span class="ka-treff-farge">{dag.color}</span>{/if}
					</button>
				{/each}
			</div>
		{:else if sok.trim()}
			<p class="ka-muted">Ingen kirkeårsdager treffet «{sok}».</p>
		{/if}
	</div>

	{#if laster}
		<p class="ka-muted">Henter kirkeåret …</p>
	{:else}
		{#if mellomDager.length > 1}
			<div class="ka-mellom">
				<h3>Dager frem til kommende søndag</h3>
				{#each mellomDager as dag (dag.date + dag.name)}
					<button class="ka-dag" class:erSoendag={dag.erSoendag} class:valgt={valgtDag?.date === dag.date && valgtDag?.name === dag.name} onclick={() => hentDag(dag)}>
						<span class="ka-dag-dato">{dag.date}</span>
						<span class="ka-dag-navn">{dag.name}</span>
						{#if dag.color}<span class="ka-dag-farge">{dag.color}</span>{/if}
					</button>
				{/each}
			</div>
		{/if}

		{#if valgtDag}
			<div class="ka-valgt">
				<h3>{valgtDag.name} · {valgtDag.date}</h3>
				<p class="ka-kirkeaar">☀️ {valgtDag.color}{valgtDag.series ? ' · ' + valgtDag.series : ''}</p>
				{#if valgtDag.prayer}
					<h4>Dagens bønn</h4>
					<div class="lit-text ka-bønn">{@html litHtml(visBønn(valgtDag.prayer).replace(/\n/g, '<br>'))}</div>
				{/if}
				<h4>Bibeltekster</h4>
				{#each lesninger as L}
					{#if valgtDag[L.key]}
						<details open={valgtDag.date === soendag}>
							<summary>{L.tittel} · {valgtDag[L.key]}</summary>
							{#if valgtLaster}
								<p class="ka-muted">Henter teksten fra bibel.no …</p>
							{:else if valgtTekster?.[L.key]}
								<div class="lit-text">{@html visTekst(valgtDag[L.key], valgtTekster[L.key])}</div>
							{:else}
								<p class="ka-muted">Klarte ikke hente teksten{online ? '' : ' (offline)'} — kun referansen vises.</p>
							{/if}
						</details>
					{/if}
				{/each}
			</div>
		{:else}
			<div class="ka-valgt">
				<h3>Kommende søndag · {soendag}</h3>
				{#if soendagDag}
					<p class="ka-kirkeaar">☀️ <strong>{soendagDag.name}</strong>{soendagDag.color ? ' · ' + soendagDag.color : ''}{soendagDag.series ? ' · ' + soendagDag.series : ''}</p>
					{#if soendagDag.prayer}
						<h4>Dagens bønn</h4>
						<div class="lit-text ka-bønn">{@html litHtml(visBønn(soendagDag.prayer).replace(/\n/g, '<br>'))}</div>
					{/if}
					<h4>Bibeltekster</h4>
					{#each lesninger as L}
						{#if soendagDag[L.key]}
							<details open>
								<summary>{L.tittel} · {soendagDag[L.key]}</summary>
								{#if soendagTekster?.[L.key]}
									<div class="lit-text">{@html visTekst(soendagDag[L.key], soendagTekster[L.key])}</div>
								{:else}
									<p class="ka-muted">Klarte ikke hente teksten{online ? '' : ' (offline)'} — kun referansen vises.</p>
								{/if}
							</details>
						{/if}
					{/each}
				{:else}
					<p class="ka-muted">Fant ingen kirkeårsdag for {soendag}.</p>
				{/if}
			</div>
		{/if}

		<div class="ka-innstilling">
			<button type="button" class="avpaa" role="checkbox" aria-checked={visMerkedager} onclick={() => lagreInnstilling(!visMerkedager)}>
				<span class="avpaa-tekst">Inkluder merkedager</span>
				<span class="avpaa-bryter" aria-hidden="true"><span class="avpaa-klump"></span></span>
			</button>
			<p class="ka-muted">Merkedager (Julaften, Askeonsdag o.l.) vises i dagslisten mellom i dag og kommende søndag. Valget lagres.</p>
		</div>
	{/if}
</div>
