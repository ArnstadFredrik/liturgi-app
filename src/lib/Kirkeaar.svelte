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
	let valgtDag = $state(null); // dag valgt i søkefeltet/listen
	let valgtTekster = $state(null);
	let valgtLaster = $state(false);
	let sok = $state(''); // fritekst: navn ELLER dato (åååå-mm-dd, dd.mm, dd/mm)
	let alleKirkeaarsDager = $state([]); // hele kirkeåret + neste (til søk og høyrepanel)

	const lesninger = [
		{ key: 'L1', tittel: 'Første lesning' },
		{ key: 'L2', tittel: 'Andre lesning' },
		{ key: 'E', tittel: 'Evangelium' }
	];

	/** Liturgisk farge → hex (church-year gir code: purple/white/red/green). */
	const FARGE_HEX = { purple: '#7b4d96', white: '#f2efe6', red: '#c0392b', green: '#4e7a3c' };
	function fargeHex(code) {
		return FARGE_HEX[(code || '').toLowerCase()] ?? null;
	}

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
						colorCode: d.liturgical_color?.code ?? '',
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

	let sokTreffe = $state([]);
	// NB: $derived viste seg stale her (samme fenn som malerForType i Modal) → $effect
	$effect(() => {
		sokTreffe = alleKirkeaarsDager
			.filter((d) => sokTreff(d))
			.sort((a, b) => a.date.localeCompare(b.date))
			.slice(0, 12);
	});

	/** Høyrepanelets liste: hele kirkeåret, sortert etter dato, merkedager valgfritt.
	 *  Dager som ikke er kirkeårsdager (ukedager i ordinumtiden) representeres av
	 *  en «i dag»-markør på riktig plass, som også er ankeret for sentreringen. */
	let panelDager = $state([]);
	$effect(() => {
		const alle = visMerkedager
			? [...alleKirkeaarsDager].sort((a, b) => a.date.localeCompare(b.date))
			: alleKirkeaarsDager.filter((d) => d.erSoendag).sort((a, b) => a.date.localeCompare(b.date));
		const nøyaktig = alle.some((d) => d.date === iDag);
		if (nøyaktig) { panelDager = alle; return; }
		// sett inn markør før første dag ETTER i dag
		const idx = alle.findIndex((d) => d.date > iDag);
		const markor = { iDagMarkor: true, date: iDag };
		panelDager = idx === -1 ? [...alle, markor] : [...alle.slice(0, idx), markor, ...alle.slice(idx)];
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

	/** Sentrer «i dag»-posisjonen i høyrepanelet nær midten av høyden. */
	function sentrerIDag() {
		const liste = document.querySelector('.ka-liste');
		const anker = liste?.querySelector('.ka-liste-dag.i-dag') ?? liste?.querySelector('.ka-i-dag-markor');
		if (liste && anker) {
			const topp = anker.offsetTop - liste.clientHeight / 2 + anker.offsetHeight / 2;
			liste.scrollTop = Math.max(0, topp);
		}
	}

	// sentrer «i dag» i panelet når listen er lastet (og på nytt ved re-filter)
	let panelKlar = $state(false);
	$effect(() => {
		if (panelKlar && panelDager.length) sentrerIDag();
	});

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
			// hele kirkeåret + neste kirkeår (til søk og høyrepanel) — lista starter I DAG
			const detteAaret = churchYearFiltered(church_startYear(soendag), iDag, '9999-12-31');
			const nesteAaret = churchYearFiltered(church_startYear(soendag) + 1, '2000-01-01', '9999-12-31');
			alleKirkeaarsDager = [...detteAaret, ...nesteAaret];
			// forhåndsvalg: kommende søndag (som aktiv visning)
			if (soendagDag) {
				valgtDag = { ...soendagDag, date: soendag, erSoendag: true };
				if (online) soendagTekster = await hentTekster(soendagDag.day);
				valgtTekster = soendagTekster;
				valgtLaster = false;
			}
		} catch (e) {
			console.error('Kirkeåret: klarte ikke laste', e);
		}
		laster = false;
		panelKlar = true;
	});

	function visTekst(ref, tekst) {
		if (!tekst) return litHtml('*Klarte ikke hente teksten' + (online ? '' : ' (offline)') + '.*');
		const innhold = (tekst.title ? '**' + tekst.title + '**\n' : '') + tekst.text;
		return litHtml(innhold);
	}

	/** Undertittel: dato · liturgisk farge · tekstrekke. */
	function undertittel(dag) {
		const deler = [dag.date];
		if (dag.color) deler.push(dag.color);
		if (dag.series) deler.push(dag.series);
		return deler.join(' · ');
	}
</script>

<div id="kirkeaar-modul">
	<div class="ka-hoved">
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
							<span class="ka-prikk" style={fargeHex(dag.colorCode) ? `background:${fargeHex(dag.colorCode)}` : ''} aria-hidden="true"></span>
							<span class="ka-treff-dato">{dag.date}</span>
							<span class="ka-treff-navn">{dag.name}</span>
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
							<span class="ka-prikk" style={fargeHex(dag.colorCode) ? `background:${fargeHex(dag.colorCode)}` : ''} aria-hidden="true"></span>
							<span class="ka-dag-dato">{dag.date}</span>
							<span class="ka-dag-navn">{dag.name}</span>
						</button>
					{/each}
				</div>
			{/if}

			{#if valgtDag}
				<div class="ka-valgt">
					<h3 class="ka-tittel">{valgtDag.name}</h3>
					<p class="ka-kirkeaar">{undertittel(valgtDag)}</p>
					{#if valgtDag.prayer}
						<h4>Dagens bønn</h4>
						<div class="lit-text ka-bønn">{@html litHtml(valgtDag.prayer)}</div>
					{/if}
					{#each lesninger as L}
						{#if valgtDag[L.key]}
							<h4 class="ka-lesning">{L.tittel} · {valgtDag[L.key]}</h4>
							{#if valgtLaster}
								<p class="ka-muted">Henter teksten fra bibel.no …</p>
							{:else if valgtTekster?.[L.key]}
								<div class="lit-text">{@html visTekst(valgtDag[L.key], valgtTekster[L.key])}</div>
							{:else}
								<p class="ka-muted">Klarte ikke hente teksten{online ? '' : ' (offline)'} — kun referansen vises.</p>
							{/if}
						{/if}
					{/each}
				</div>
			{:else}
				<p class="ka-muted">Fant ingen kirkeårsdag.</p>
			{/if}
		{/if}
	</div>

	{#if !laster}
		<aside class="ka-panel">
			<div class="ka-panel-topp">
				<h3>Kirkeåret</h3>
				<button type="button" class="avpaa" role="checkbox" aria-checked={visMerkedager} title="Inkluder merkedager" onclick={() => lagreInnstilling(!visMerkedager)}>
					<span class="avpaa-tekst">Merkedager</span>
					<span class="avpaa-bryter" aria-hidden="true"><span class="avpaa-klump"></span></span>
				</button>
			</div>
			<div class="ka-liste">
				{#each panelDager as dag (dag.iDagMarkor ? 'i-dag-' + dag.date : dag.date + dag.name)}
					{#if dag.iDagMarkor}
						<div class="ka-i-dag-markor"><span>I dag · {dag.date}</span></div>
					{:else}
						<button
							class="ka-liste-dag"
							class:i-dag={dag.date === iDag}
							class:valgt={valgtDag?.date === dag.date && valgtDag?.name === dag.name}
							onclick={() => hentDag(dag)}
						>
							<span class="ka-prikk" style={fargeHex(dag.colorCode) ? `background:${fargeHex(dag.colorCode)}` : ''} aria-hidden="true"></span>
							<span class="ka-liste-tekst">
								<span class="ka-liste-navn">{dag.name}</span>
								<span class="ka-liste-dato">{dag.date}</span>
							</span>
						</button>
					{/if}
				{/each}
			</div>
		</aside>
	{/if}
</div>
