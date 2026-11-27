<script>
	import { onMount } from 'svelte';
	import church from 'church-year';
	import { lookupKirkeaar, hentTekster, lesTeksterCache, forbRekkeForDag } from '$lib/kirkeaar.js';
	import { lesForbFiler } from '$lib/forb-filer.js';
	import { byggForbKontekst, forbInnhold, forbEkstern } from '$lib/forb-maler.js';
	import { mdTilDocxBase64 } from '$lib/md-til-docx.js';
	import { litHtml } from '$lib/lit.js';
	import { mdi } from '$lib/mdi.js';
	import { toast } from 'svelte-sonner';
	import { app } from '$lib/store.svelte.js';
	import { startTekstCacheBakgrunn } from '$lib/tekstcache.js';
	import { openContextMenu } from '$lib/contextmenu.svelte.js';

	const isElectron = typeof window !== 'undefined' && !!window.liturgi?.isElectron;

	/** ISO-dato for lokal dag n dager fra nå (unngå toISOString-tidssoneskifte). */
	function isoLokal(d) {
		const pad = (n) => String(n).padStart(2, '0');
		return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
	}

	// Alt fra church-year beregnes SYNKONT (rask pakke) — tekstene fra bibel.no hentes i bakgrunnen.
	let iDag = $state('');
	let soendag = $state('');
	let valgtDag = $state(null); // { date, name, color, colorCode, series, prayer, L1/L2/E, day, erSoendag }
	let valgtTekster = $state(null); // { L1, L2, E } — fylls inn når bakgrunnshentingen er ferdig
	let valgtHenter = $state(false);
	let mellomDager = $state([]); // kirkeårsdager/merkedager mellom i dag og kommende søndag
	let online = $state(typeof navigator !== 'undefined' ? navigator.onLine : true);
	let visMerkedager = $state(true); // innstilling — persistent i liturgi.db (nøkkel 'kirkeaarMerkedager')
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

	/** Kort ukedag (kort navn) for listene — ISO-datoen folk m lese selv. */
	function ukedag(iso) {
		try { return new Date(iso + 'T12:00:00').toLocaleDateString('nb-NO', { weekday: 'short' }); }
		catch { return ''; }
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
	function churchYearFiltered(startYear, fraISO, tilISO, commemorative = true) {
		try {
			return church.churchYear({ year: startYear, commemorative })
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
						period: d.period ?? '',
						erSoendag: new Date(d.day).getDay() === 0
					};
				});
		} catch {
			return [];
		}
	}

	/** Side-TOC: delene på hovedsiden (Dagens bønn + lesningene) for rask navigering
	 *  når tekstene er lastet og siden må scrolles. Offline er alt på én side — ingen TOC. */
	/** G til dags dato i hyrepanelet (valg + teksthent). */
	function gaTilIDag() {
		const d = alleKirkeaarsDager.find((x) => x.date === iDag);
		if (d) hentDag(d);
	}

	function seksjoner() {
		if (!online || !valgtDag) return [];
		const s = [];
		if (valgtDag.prayer) s.push({ nokkel: 'boenn', navn: 'Bønn for dagens dato' });
		for (const L of lesninger) {
			if (valgtDag[L.key]) s.push({ nokkel: L.key, navn: L.tittel + ' · ' + valgtDag[L.key] });
		}
		return s;
	}

	/** Rull hovedsiden til en seksjon; lesninger åpnes først hvis de er lukket. */
	function tilSeksjon(nokkel) {
		if (nokkel !== 'boenn' && !aapne[nokkel] && valgtTekster?.[nokkel]) {
			aapne = { ...aapne, [nokkel]: true };
		}
		// vent ett øyeblikk så Svelte har rendret eventuell utfoldet tekst, måle med
		// getBoundingClientRect (uavhengig av offsetParent)
		setTimeout(() => {
			const hoved = document.querySelector('.ka-hoved');
			const el = hoved?.querySelector(`[data-seksjon="${nokkel}"]`);
			if (!hoved || !el) return;
			const delta = el.getBoundingClientRect().top - hoved.getBoundingClientRect().top + hoved.scrollTop;
			hoved.scrollTop = Math.max(0, delta - 16);
		}, 60);
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

	/** Høyrepanelets liste: hele kirkeåret, sortert etter dato.
	 *  Merkedager styres av church-year-pakkens `commemorative`-flagg (true/false) —
	 *  ikke egen filtrering. Dager som ikke er kirkeårsdager representeres av en
	 *  «i dag»-markør på riktig plass, som også er ankeret for sentreringen. */
	let panelDager = $state([]);
	function byggPanel() {
		const alle = [
			...churchYearFiltered(church_startYear(soendag), iDag, '9999-12-31', visMerkedager),
			...churchYearFiltered(church_startYear(soendag) + 1, '2000-01-01', '9999-12-31', visMerkedager)
		].sort((a, b) => a.date.localeCompare(b.date));
		if (!iDag) { panelDager = alle; return; }
		if (alle.some((d) => d.date === iDag)) { panelDager = alle; return; }
		// sett inn markør før første dag ETTER i dag
		const idx = alle.findIndex((d) => d.date > iDag);
		const markor = { iDagMarkor: true, date: iDag };
		panelDager = idx === -1 ? [...alle, markor] : [...alle.slice(0, idx), markor, ...alle.slice(idx)];
	}

	/** Utfoldede lesninger (nøkkles per dag i hentTeksterBakgrunn). */
	let aapne = $state({ L1: false, L2: false, E: false });

	/** Hent bibeltekstene for en dag I BAKGRUNNEN — dato/navn/farge/bønn/referanser vises umiddelbart.
	 *  Tekstene ligger BAK folden — brukeren åpner dem via lesnings-overskriften. */
	async function hentTeksterBakgrunn(dag) {
		if (!dag?.day) { valgtTekster = null; valgtHenter = false; return; }
		const id = dag.date + dag.name; // anrop-identitet: rask klikking i sekvens
		valgtTekster = null;
		valgtHenter = true;
		aapne = { L1: false, L2: false, E: false };
		let t = null;
		if (online) {
			try { t = await hentTekster(dag.day, await lesTeksterCache(), dag.series); } catch { t = null; }
		}
		if (!valgtDag || (valgtDag.date + valgtDag.name) !== id) return; // brukeren valgte en annen dag
		valgtTekster = t;
		valgtHenter = false;
	}

	/** Velg en dag: alt unntatt selve bibelteksten vises umiddelbart fra church-year-data. */
	function hentDag(dag) {
		valgtDag = dag;
		valgtHenter = false;
		hentTeksterBakgrunn(dag);
	}

	async function lagreInnstilling(v) {
		visMerkedager = v;
		if (isElectron) {
			try { await window.liturgi.dbSet('kirkeaarMerkedager', v ? '1' : '0'); } catch { /* db utilgjengelig */ }
		} else {
			try { localStorage.setItem('kirkeaarMerkedager', v ? '1' : '0'); } catch { /* full */ }
		}
		// re-generer mellom-dagene med pakkens commemorative-flagg
		mellomDager = churchYearFiltered(church_startYear(soendag), iDag, soendag, visMerkedager);
		byggPanel();
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

	onMount(() => {
		// SYNKRONE deler først — modulen vises umiddelbart
		try {
			iDag = isoLokal(new Date());
			soendag = nesteSoendag();
			online = navigator.onLine;
			// selve kirkeåret — ren beregning, umiddelbar (med merkedager, standard)
			raaMellom = churchYearFiltered(church_startYear(soendag), iDag, soendag, true);
			mellomDager = raaMellom;
			// hele kirkeåret + neste kirkeår (til søk og høyrepanel) — lista starter I DAG
			const detteAaret = churchYearFiltered(church_startYear(soendag), iDag, '9999-12-31');
			const nesteAaret = churchYearFiltered(church_startYear(soendag) + 1, '2000-01-01', '9999-12-31');
			alleKirkeaarsDager = [...detteAaret, ...nesteAaret];
			byggPanel();
			const sd = lookupKirkeaar(soendag);
			if (sd) hentDag({ ...sd, date: soendag, erSoendag: true });
		} catch (e) {
			console.error('Kirkeåret: klarte ikke laste', e);
		}
		panelKlar = true;
		// PERSISTENT innstilling: dbGet er asynkron IPC — les den i bakgrunnen
		// og re-generer med pakkens commemorative-flagg hvis den avviker fra standarden
		if (isElectron) {
			window.liturgi.dbGet('kirkeaarMerkedager')
				.then((r) => {
					if (r?.ok && r.value != null) {
						const v = r.value === '1';
						if (v !== visMerkedager) {
							visMerkedager = v;
							mellomDager = churchYearFiltered(church_startYear(soendag), iDag, soendag, visMerkedager);
							byggPanel();
						}
					}
				})
				.catch(() => { /* standard */ });
		} else {
			try {
				const v = (localStorage.getItem('kirkeaarMerkedager') ?? '1') === '1';
				if (v !== visMerkedager) {
					visMerkedager = v;
					mellomDager = churchYearFiltered(church_startYear(soendag), iDag, soendag, visMerkedager);
					byggPanel();
				}
			} catch { /* standard */ }
		}
	});

	function visTekst(ref, tekst) {
		if (!tekst) return litHtml('*Klarte ikke hente teksten' + (online ? '' : ' (offline)') + '.*');
		const innhold = (tekst.title ? '**' + tekst.title + '**\n' : '') + tekst.text;
		return litHtml(innhold);
	}

	/** Prekenforberedelse: opprett prosjekt for valgt dag og åpne modulen. */
	function datoTekst(iso) {
		const d = new Date(iso + 'T12:00:00');
		const dager = ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'];
		const mnd = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'];
		return dager[d.getDay()] + ' ' + d.getDate() + '. ' + mnd[d.getMonth()] + ' ' + d.getFullYear();
	}
	/** Åpne prekenforberedelse-mappen i Finder. Ved valgt dag åpnes mappen
 *  for aktuell kirkeårsdag hvis den finnes (ellers åremappen/rotmappen). */
	async function apneForbMappe() {
		if (!isElectron) return;
		const r = await window.liturgi.dbGet('prekenforberedelseMappe');
		const mappe = r?.ok ? (r.value ?? '') : '';
		if (!mappe) { toast.info('Velg mappe for prekenforberedelser i Innstillinger først'); return; }
		if (valgtDag) {
			const start = church_startYear(valgtDag.date) ?? new Date(valgtDag.date).getFullYear();
			const rekke = forbRekkeForDag(valgtDag, alleKirkeaarsDager);
			const aaMappe = start + '-' + (start + 1) + ' - ' + rekke + ' Rekke';
			const kandidater = [
				mappe + '/' + aaMappe + '/' + valgtDag.name,
				mappe + '/' + aaMappe,
				mappe
			];
			for (const sti of kandidater) {
				const res = await window.liturgi.apneMappe(sti);
				if (res?.ok) return;
			}
			return;
		}
		await window.liturgi.apneMappe(mappe);
	}

	async function prekenforberedelse() {
		if (!valgtDag) return;
		let mappe = '';
		if (isElectron) {
			const r = await window.liturgi.dbGet('prekenforberedelseMappe');
			mappe = r?.ok ? (r.value ?? '') : '';
			if (!mappe) {
				// første gang: dialogen foreslår standardmappen og lar brukeren velge annen
				const v = await window.liturgi.forbVelgMappe();
				if (!v?.ok) return;
				mappe = v.sti;
				await window.liturgi.dbSet('prekenforberedelseMappe', mappe);
			}
		} else return;
		const start = church_startYear(valgtDag.date) ?? new Date(valgtDag.date).getFullYear();
		const rekke = forbRekkeForDag(valgtDag, alleKirkeaarsDager);
		const aaMappe = start + '-' + (start + 1) + ' - ' + rekke + ' Rekke';
		const f = app.forbFiler?.length ? app.forbFiler : lesForbFiler(null);
		const kontekst = byggForbKontekst(valgtDag, valgtTekster, {
			start: String(start),
			slutt: String(start + 1),
			rekke
		});
		const fmt = app.forbFmt === 'docx' ? 'docx' : 'md';
		const filer = {};
		const malFeil = [];
		for (const navn of f) {
			let innhold;
			try {
				innhold = forbInnhold(navn, app.forbMaler ?? {}, kontekst);
			} catch (e) {
				// feil i en mal: filen genereres tom (ikke blokkerer prosjektet), feilen meldes
				innhold = '';
				malFeil.push(navn + ': ' + (e?.message ?? e));
			}
			if (fmt === 'docx') {
				filer[forbEkstern(navn, fmt)] = { base64: await mdTilDocxBase64(innhold) };
			} else {
				filer[navn] = innhold;
			}
		}
		const r = await window.liturgi.forbLagProsjekt({
			mappe,
			dagNavn: aaMappe + '/' + valgtDag.name,
			filer
		});
		if (!r?.ok) return;
		// Eksisterende filer på disk blir aldri overskrevet av genereringen.
		if (r.eksisterende === Object.keys(filer).length) {
			toast.info('Alle filene finnes allerede i ' + r.sti + ' — ingenting ble overskrevet.');
			return;
		}
		// redigeringsmodulen av: bare generer filene, ikke åpner redigeringsvisningen
		if (!app.forbRediger || fmt === 'docx') {
			// docx støtter foreløpig kun generering (redigering er md-kun)
			toast.info(fmt === 'docx' ? 'Word-filene er generert i ' + r.sti : 'Filene er generert i ' + r.sti);
			return;
		}
		app.forbAapneSti = r.sti + '/notat.md';
		app.current = null;
		app.kind = null;
		app.visning = 'forberedelse';
	}

	/** Undertittel: dato · liturgisk farge · tekstrekke. */
	function undertittel(dag) {
		const deler = [dag.date];
		if (dag.color) deler.push(dag.color);
		if (dag.series) deler.push(dag.series);
		return deler.join(' · ');
	}
</script>

<div id="kirkeaar-modul" oncontextmenu={(e) => { e.preventDefault(); openContextMenu(e.clientX, e.clientY, [
			{ label: 'Prekenforberedelse', action: () => prekenforberedelse(), disabled: !valgtDag },
			{ label: 'Åpne prekenforberedelse-mappe', action: () => apneForbMappe() }
		]); }}>
	<div class="ka-hoved">
	{#if app.tekstCache.gaar}
		<div class="tekstcache-indikator" role="status">
			<span class="tekstcache-spinner" aria-hidden="true"></span>
			<span>Henter bibeltekster: {app.tekstCache.fase} — {app.tekstCache.ferdig}/{app.tekstCache.totalt}</span>
			<progress max={app.tekstCache.totalt} value={app.tekstCache.ferdig}></progress>
		</div>
	{:else if app.tekstCache.totalt > 0 && app.tekstCache.ferdig >= app.tekstCache.totalt}
		<div class="tekstcache-indikator tekstcache-ferdig" role="status">
			Bibeltekstene for kirkeåret er mellomlagret ({app.tekstCache.totalt} dager)
			<button class="ka-cache-oppdater" title="Henter det som mangler i mellomlageret" onclick={() => startTekstCacheBakgrunn()}>Oppdater</button>
		</div>
	{/if}
		<div class="ka-topp">
			<h2>Kirkeåret</h2>
			<span class="ka-nett" class:off={!online}>{online ? 'Online — bibeltekster hentes fra bibel.no' : 'Offline — viser kun referanser'}</span>
			{#if app.forbModul}
				<button class="ka-forberedelse" title="Opprett prekenforberedelse for {valgtDag?.name ?? 'valgt dag'}" onclick={prekenforberedelse} disabled={!valgtDag}>
					{@html mdi('pencil', 14)} Prekenforberedelse
				</button>
			{/if}
			<button class="ka-forberedelse" title="Åpne prekenforberedelse-mappen i Finder" onclick={apneForbMappe} disabled={!app.forbModul}>
				{@html mdi('folder-open-outline', 14)} Åpne mappe
			</button>
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

		{#if mellomDager.length > 1}
			<div class="ka-mellom">
				<h3>Dager frem til kommende søndag</h3>
				{#each mellomDager as dag (dag.date + dag.name)}
					<button class="ka-dag" class:erSoendag={dag.erSoendag} class:valgt={valgtDag?.date === dag.date && valgtDag?.name === dag.name} onclick={() => hentDag(dag)}>
						<span class="ka-prikk" style={fargeHex(dag.colorCode) ? `background:${fargeHex(dag.colorCode)}` : ''} aria-hidden="true"></span>
						<span class="ka-dag-dato">{dag.date} · {ukedag(dag.date)}</span>
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
					<h4 data-seksjon="boenn">Bønn for {valgtDag ? valgtDag.date : ''}</h4>
					<div class="lit-text ka-bønn">{@html litHtml(valgtDag.prayer)}</div>
				{/if}
				{#if valgtDag.L1 || valgtDag.L2 || valgtDag.E}
					<h4>Bibeltekster</h4>
					<div class="ka-lesninger">
						{#each lesninger as L}
							{#if valgtDag[L.key]}
								<div class="ka-lesning-item" data-seksjon={L.key}>
									<button
										type="button"
										class="ka-lesning"
										class:klar={!!valgtTekster?.[L.key]}
										onclick={() => { if (valgtTekster?.[L.key]) aapne = { ...aapne, [L.key]: !aapne[L.key] }; }}
										aria-expanded={aapne[L.key]}
										title={valgtTekster?.[L.key] ? 'Vis/skjul teksten' : (valgtHenter ? 'Henter teksten …' : 'Ingen tekst' + (online ? '' : ' (offline)'))}
									>
										<span class="ka-lesning-navn">{L.tittel} · {valgtDag[L.key]}</span>
										{#if valgtHenter && !valgtTekster?.[L.key]}
											<span class="ka-spinner" aria-hidden="true"></span>
										{:else if valgtTekster?.[L.key]}
											<span class="ka-chevron" class:aapen={aapne[L.key]} aria-hidden="true">▾</span>
										{/if}
									</button>
									{#if aapne[L.key] && valgtTekster?.[L.key]}
										<div class="lit-text ka-lesning-tekst">{@html visTekst(valgtDag[L.key], valgtTekster[L.key])}</div>
									{/if}
								</div>
							{/if}
						{/each}
					</div>
				{/if}
			</div>
		{:else}
			<p class="ka-muted">Fant ingen kirkeårsdag.</p>
		{/if}
	</div>

	<aside class="ka-panel">
		<div class="ka-panel-topp">
			<h3>Kirkeåret</h3>
			<button type="button" class="ka-idag-knapp" title="Gå til dags dato" onclick={gaTilIDag}>I dag</button>
			<button type="button" class="avpaa" role="checkbox" aria-checked={visMerkedager} title="Inkluder merkedager" onclick={() => lagreInnstilling(!visMerkedager)}>
				<span class="avpaa-tekst">Merkedager</span>
				<span class="avpaa-bryter" aria-hidden="true"><span class="avpaa-klump"></span></span>
			</button>
		</div>
		{#if seksjoner().length > 1}
			<nav class="ka-toc" aria-label="Innhold på siden">
				<h4>Innhold</h4>
				{#each seksjoner() as s (s.nokkel)}
					<button class="ka-toc-lenk" onclick={() => tilSeksjon(s.nokkel)} title={'Gå til ' + s.navn}>
						<span class="ka-toc-navn">{s.navn}</span>
					</button>
				{/each}
			</nav>
		{/if}
		<div class="ka-liste">
			{#each panelDager as dag (dag.iDagMarkor ? 'i-dag-' + dag.date : dag.date + dag.name)}
				{#if dag.iDagMarkor}
					<div class="ka-i-dag-markor"><span>I dag · {dag.date}</span></div>
				{:else}
					<button
						class="ka-liste-dag"
						title="Liturgisk farge: {dag.color || dag.colorCode || 'ukjent'}"
						class:i-dag={dag.date === iDag}
						class:valgt={valgtDag?.date === dag.date && valgtDag?.name === dag.name}
						onclick={() => hentDag(dag)}
					>
						<span class="ka-prikk" style={fargeHex(dag.colorCode) ? `background:${fargeHex(dag.colorCode)}` : ''} aria-hidden="true"></span>
						<span class="ka-liste-tekst">
							<span class="ka-liste-navn">{dag.name}</span>
							<span class="ka-liste-dato">{dag.date} · {ukedag(dag.date)}</span>
						</span>
					</button>
				{/if}
			{/each}
		</div>
	</aside>
</div>
