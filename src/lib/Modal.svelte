<script>
	import { app } from '$lib/store.svelte.js';
	import { closeModal, showModal, kirkeaarListeModal } from '$lib/modal.svelte.js';
	import { litHtml } from '$lib/lit.js';
	import { mdi } from '$lib/mdi.js';
	import { lookupKirkeaar, hentTekster, kirkeaarDager } from '$lib/kirkeaar.js';

	const m = $derived(app.modal);
	// Alle felt settes i $state-INIT: +page keyer <Modal /> på type+id, så komponenten
	// remountes (fersk init) ved HVER modal-åpning. $effect-åpningen lenger ned kjørte
	// upålitelig (dato ble aldri satt) — init garanterer ferske felt.
	const mInit = app.modal;
	const isNS = mInit?.type === 'newService';
	const pres = isNS ? (mInit.preserve ?? null) : null;
	const forhType = pres?.type ?? mInit?.forhåndsvalgtType ?? 'gudstjeneste';
	let name = $state(isNS ? (pres?.name ?? '') : (mInit?.def ?? ''));
	let date = $state(isNS ? (pres?.date ?? nextSundayISO()) : (mInit?.dato ?? ''));
	let tplId = $state(isNS ? (pres?.tplId ?? app.templates.find((t) => malType(t) === forhType && kanBrukes(t))?.id ?? '') : '');
	let medDåp = $state(isNS ? (pres?.dåp ?? true) : true);
	let medNattverd = $state(isNS ? (pres?.nattverd ?? true) : true);
	let nyType = $state(forhType); // 'gudstjeneste' | 'gravferd'
	let jordpaa = $state('graven'); // gravferd: 'graven' | 'krematorium'
	let remountTeller = $state(0); // inkrementeres ved type-bytte: {#key} rundt innholdet

	/** Hvilken liturgitype har malen? (egendefinert felt eller navn) */
	function malType(t) {
		return t.liturgiType ?? (/gravferd/i.test(t.name || '') ? 'gravferd' : 'gudstjeneste');
	}
	/** Kan malen brukes direkte til å opprette gudstjenester? (malen kan selv
	 *  bestemme: «Dåp i hovedgudstjenesten» er bare en del av gudstjenesten.)
	 *  Standard er ja — malen må eksplisitt si kanGudstjeneste: false. */
	function kanBrukes(t) {
		return t.kanGudstjeneste !== false;
	}

	// $derived.by: Svelte 5 robust reaktivitet (stale $state + $effect-kombinasjonen
	// feilet ved type-bytt: mal-listen ble stående tom ved retur til gudtjeneste)
	let malerForType = $state(app.templates.filter((t) => malType(t) === nyType && kanBrukes(t)));

	// sørg for at valgt mal passer typen når type byttes. NB: malerForType kan være
	// stale i denne effekten (oppdateres av en annen $effect) — filtrer direkte på
	// app.templates med malType, IKKE på malerForType.
	$effect(() => {
		if (m?.type === 'newService') {
			const t = app.templates.find((x) => x.id === tplId);
			if (!t || malType(t) !== nyType || !kanBrukes(t)) tplId = app.templates.find((x) => malType(x) === nyType && kanBrukes(x))?.id ?? '';
		}
	});
	let valgte = $state([]);
	let valgtAlt = $state(0);
	let kirkeaar = $state(null);
	let tekster = $state(null);
	let teksterStatus = $state('');
	let manuellK = $state(pres?.kirkeaar ?? null);
	// init: slå opp kirkeårsdag for startdatoen direkte ($effect first-run ved
	// remount kjørte upålitelig i Svelte 5 — change-eventene dekkes fortsatt av
	// $effect-en lenger ned)


	// bibliotek-søk
	let bibQ = $state('');
	let bibValgt = $state(-1);
	let bibAltValgt = $state(0);

	/** ISO-dato for kommende søndag (i dag hvis det er søndag). */
	function nextSundayISO() {
		const d = new Date();
		d.setDate(d.getDate() + ((7 - d.getDay()) % 7));
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
	}

	$effect(() => {
		if (m?.type === 'newService') {
			if (m.preserve) {
				// tilbake etter manuell kirkeårsdag-valg: gjenopprett feltene
				nyType = m.preserve.type ?? 'gudstjeneste';
				name = m.preserve.name;
				date = m.preserve.date;
				tplId = m.preserve.tplId;
				medDåp = m.preserve.dåp;
				medNattverd = m.preserve.nattverd;
				manuellK = m.preserve.kirkeaar;
				kirkeaar = m.preserve.kirkeaar;
			} else {
				// NB: les forhåndsvalgtType inn i en LOKAL variabel — leser vi nyType her
				// blir den en dependency av effekten, og type-bytt-klikk re-triggere
				// effekten som da RESETTER typen tilbake (type-knappene virket ikke)
				const forhType = m.forhåndsvalgtType ?? 'gudstjeneste';
				nyType = forhType;
				jordpaa = 'graven';
				name = '';
				date = nextSundayISO();
				// malen forhåndsvalges fra riktig type-liste (IKKE app.templates[0], som kan være
				// en gravferdsmal — originalene lastes først og rekkefølgen er ikke garantert)
				tplId = (app.templates.find((t) => malType(t) === forhType && kanBrukes(t)))?.id ?? '';
				medDåp = true;
				medNattverd = true;
				manuellK = null;
			}
		} else if (m?.type === 'prompt') {
			name = m.def ?? '';
		} else if (m?.type === 'choose') {
			valgte = [...m.titles];
		} else if (m?.type === 'chooseOne') {
			valgtAlt = m.sel ?? 0;
		} else if (m?.type === 'bib') {
			bibQ = m.def ?? '';
			bibValgt = -1;
			bibAltValgt = 0;
			bibSok(m.def ?? '');
		} else if (m?.type === 'kirkeaarListe') {
			kDager = kirkeaarDager(m.dato);
			kFilter = '';
			kValgt = null;
		}
		});

	let bibGrupper = $state([]);
	let bibReq = 0;
	// manuell kirkeårsdag-valg
	let kFilter = $state('');
	let kValgt = $state(null);
	let kDager = $state([]);
	/** Fuzzy-søk: alle søketermene må treffe navnet (subsequence, rekkefølge bevart)
	 *  eller datoen (token-likelihood, f.eks. «24-12», «15.11», «advent 24»). */
	const filtrerteDager = $derived.by(() => {
		const q = kFilter.trim().toLowerCase();
		if (!q) return kDager;
		return kDager.filter((d) => q.split(/\s+/).every((term) => subseq(term, d.name.toLowerCase()) || datoTreff(term, d.date)));
	});
	/** Subsequence-match: tegnene i q forekommer i rekkefølge i s. */
	function subseq(q, s) {
		let i = 0;
		for (const c of s) { if (c === q[i]) i++; if (i >= q.length) return true; }
		return q.length === 0;
	}
	/** Dato-treff: godtar «2026-12-24», «12-24», «24-12», «24.12», «24/12» (dd og mm bytter plass). */
	function datoTreff(term, dato) {
		if (!dato) return false;
		const norm = term.replace(/\./g, '-').replace(/\//g, '-');
		if (dato.includes(norm)) return true;
		const p = norm.split('-').filter(Boolean);
		if (p.length === 2 && p.every((x) => /^\d{1,2}$/.test(x))) {
			const [a, b] = p;
			const aa = a.padStart(2, '0'), bb = b.padStart(2, '0');
			return dato.includes(`-${bb}-${aa}`); // «24-12» → -12-24 (dd-mm)
		}
		return false;
	}
	/** Datoendring i modalen: hent dager for nytt kirkeår, behold filteret. */
	function endreDato(nyDato) {
		if (!nyDato) return;
		kDager = kirkeaarDager(nyDato);
		kValgt = null;
	}
	async function bibSok(q) {
		if (!window.liturgi?.bibSearch) { bibGrupper = []; return; }
		const sek = ++bibReq;
		const r = await window.liturgi.bibSearch((q ?? '').trim() || 'forbønn');
		if (sek !== bibReq) return;
		const rows = r.ok ? r.rows : [];
		// grupper per ledd
		const grupper = new Map();
		for (const row of rows) {
			const key = row.kilde + '|' + row.ledd;
			if (!grupper.has(key)) grupper.set(key, { kilde: row.kilde, seksjon: row.seksjon, ledd: row.ledd, rader: [] });
			grupper.get(key).rader.push({ label: row.alt_label, text: row.tekst });
		}
		bibGrupper = [...grupper.values()];
		bibValgt = bibGrupper.length ? 0 : -1;
		bibAltValgt = 0;
		}

	// slå opp kirkeårsdag når datoen endres i ny-gudstjeneste-modalen
	// (manuelt valgt dag har forrang inntil den nullstilles)
	let teksterReq = 0;
	// init: slå opp kirkeårsdag for startdatoen. Kjøres i en $effect som kun leser
	// mount-konstanter (m/isNS/pres/forhType) — IKKE date/nyType (da re-fyrer den
	// ved type-bytte); dato-endringer dekkes av $effect-en under.
	$effect(() => {
		if (m?.type === 'newService' && isNS && !pres?.kirkeaar && forhType === 'gudstjeneste') autoKirkeaar();
	});
	$effect(() => {
		if (m?.type === 'newService' && date && !manuellK && nyType === 'gudstjeneste') autoKirkeaar();
	});

	// navneforslag «gudstjeneste - [Kirkeårsdag]»: BRUKES IKKE Lenger som live-forslag
	// i modalen (den gjorde modalen treg) — createService fyller navnet ved opprettelse
	// hvis navnefeltet er tomt
	function navnEndret() { /* beholdt for oninput-kompatibilitet */ }

	function autoKirkeaar() {
		const k = lookupKirkeaar(date);
		kirkeaar = k;
		tekster = null;
		teksterStatus = k ? 'laster' : '';
		const req = ++teksterReq;
		if (!k) return;
		hentTekster(k.day).then((t) => {
			if (req !== teksterReq) return;
			tekster = t;
			teksterStatus = t ? 'ok' : 'feil';
		});
	}

	function manuellKirkeaar() {
		// husk newService-modalens tilstand og ok-callback, så vi kan komme tilbake
		const forrige = {
			ok: m.ok,
			type: nyType,
			name, date, tplId, dåp: medDåp, nattverd: medNattverd,
			kirkeaar, tekster, teksterStatus
		};
		const tilbakeTilNyService = () => {
			showModal({
				type: 'newService', ok: forrige.ok,
				preserve: { type: forrige.type, name: forrige.name, date: forrige.date, tplId: forrige.tplId,
					dåp: forrige.dåp, nattverd: forrige.nattverd, kirkeaar: manuellK }
			});
		};
		kirkeaarListeModal(date, (k) => {
			if (!k) { tilbakeTilNyService(); return; }
			manuellK = k;
			kirkeaar = k;
			tekster = null;
			teksterStatus = 'laster';
				const req = ++teksterReq;
			hentTekster(k.day).then((t) => {
				if (req !== teksterReq) return;
				tekster = t;
				teksterStatus = t ? 'ok' : 'feil';
			});
			tilbakeTilNyService();
		}, tilbakeTilNyService);
	}

	/** Type-bytte: nullstill malerForType-listen eksplisitt og oppdater nyType.
	 *  Svelte 5 $derived.by som leser nyType var stale ved rask GF→GJ-bryting. */
	function velgType(type) {
		nyType = type;
		malerForType = app.templates.filter((t) => malType(t) === type && kanBrukes(t));
		if (type === 'gudstjeneste') {
			manuellK = null;
			autoKirkeaar();
		}
	}

	function nullstillKirkeaar() {
		manuellK = null;
		autoKirkeaar();
	}

	function ok() {
		if (!m) return;
		const forrige = m;
		if (m.type === 'prompt') m.ok(name.trim());
		else if (m.type === 'confirm' || m.type === 'valg') m.ok();
		else if (m.type === 'lukk') { m.ok(); return; } // onLagre lukker selv (kan bli avbrutt av lagre-dialog)
		else if (m.type === 'newService') {
			const opprett = () => {
							if (nyType === 'gravferd') {
					m.ok(name.trim(), date, tplId, { dåp: false, nattverd: false }, null, null);
					// bare den valgte jordpåkastelsesdelen skal være med
					const cur = app.current;
					if (cur) cur.sections = cur.sections.filter((s) =>
						!s.title.includes('Jordpåkastelse') ||
						(jordpaa === 'graven' ? s.title.includes('graven') : s.title.includes('krematorium')));
				}
				else m.ok(name.trim(), date, tplId, { dåp: medDåp, nattverd: medNattverd }, kirkeaar, tekster);
				if (app.modal === forrige) closeModal();
			};
			// vent på at tekstepplaget er ferdig (maks 6 s) før opprettelse
			if (nyType === 'gudstjeneste' && kirkeaar && teksterStatus === 'laster') {
				const t0 = Date.now();
				const vent = () => {
					if (teksterStatus !== 'laster' || Date.now() - t0 > 6000) opprett();
					else setTimeout(vent, 250);
				};
				vent();
			} else opprett();
			return;
		} else if (m.type === 'choose') m.ok([...valgte]);
		else if (m.type === 'chooseOne') m.ok(valgtAlt);
		else if (m.type === 'bib') {
			const gruppe = bibGrupper[bibValgt];
			m.ok(gruppe, m.mode === 'innhold' ? gruppe?.rader[bibAltValgt] : null);
		} else if (m.type === 'kirkeaarListe') m.ok(kValgt != null ? filtrerteDager[kValgt] : null);
		// lukk kun hvis ok-callbacken ikke byttet til en ny modal
		if (app.modal === forrige) closeModal();
	}

	function onKey(e) {
		if (e.key === 'Enter') ok();
		if (e.key === 'Escape') closeModal();
	}
</script>

{#if m}
	<div id="modal-back">
		<div id="modal" class={m.type === 'chooseOne' || m.type === 'bib' ? 'bred' : ''} role="dialog">
			<h3>{m.title}</h3>
			{#if m.type === 'confirm'}
				<p>{m.message}</p>
			{:else if m.type === 'prompt'}
				<label>
					{m.label}
					<input bind:value={name} onkeydown={onKey} />
				</label>
			{:else if m.type === 'newService'}
				<div class="m-type" role="radiogroup" aria-label="Type">
					<button type="button" role="radio" aria-checked={nyType === 'gudstjeneste'} class={nyType === 'gudstjeneste' ? 'm-type-btn sel' : 'm-type-btn'} onclick={() => { velgType('gudstjeneste'); remountTeller += 1; }} title="Gudstjeneste">{@html mdi('church')}<span>Gudstjeneste</span></button>
					<button type="button" role="radio" aria-checked={nyType === 'gravferd'} class={nyType === 'gravferd' ? 'm-type-btn sel' : 'm-type-btn'} onclick={() => { velgType('gravferd'); remountTeller += 1; }} title="Gravferd">{@html mdi('flower-tulip')}<span>Gravferd</span></button>
				</div>
				<label>
					Mal
					<select bind:value={tplId}>
						{#each malerForType as t (t.id)}
							<option value={t.id}>{t.name}</option>
						{/each}
					</select>
				</label>
				<label>
					Navn
					<input bind:value={name} onkeydown={onKey} oninput={navnEndret} placeholder="F.eks. Gudstjeneste - 25. søndag i treenighetstiden" />
				</label>
				<label>
					Dato
					<input type="date" value={date} onchange={(e) => { date = e.currentTarget.value; manuellK = null; }} />
				</label>
				{#key remountTeller}
				{#if nyType === 'gudstjeneste'}
					{#if kirkeaar}
						<p class="m-kirkeaar">☀️ {kirkeaar.name}{#if kirkeaar.color}&nbsp;· {kirkeaar.color}{/if}
							<button class="link-btn" onclick={manuellKirkeaar}>endre …</button>
							{#if manuellK}<button class="link-btn" onclick={nullstillKirkeaar} title="Bruk datoens kirkeårsdag">tilbakestill</button>{/if}</p>
						{#if teksterStatus === 'laster'}<p class="m-kirkeaar muted">Henter bibeltekster …</p>
						{:else if teksterStatus === 'feil'}<p class="m-kirkeaar muted">Klarte ikke hente bibeltekstene – kun referanser fylles inn.</p>
						{:else if teksterStatus === 'ok' && !manuellK}<p class="m-kirkeaar muted">✓ Bibeltekstene hentes inn i gudstjenesten.</p>
						{:else if teksterStatus === 'ok' && manuellK}<p class="m-kirkeaar muted">✓ Bibeltekstene hentes for den valgte kirkeårsdagen.</p>
						{/if}
					{:else if date}
						<p class="m-kirkeaar muted">Ingen kirkeårsdag funnet for datoen.
							<button class="link-btn" onclick={manuellKirkeaar}>velg manuelt …</button></p>
					{/if}
					<!-- Av/på-knapper (mac-nativ switch-stil): logikken er fortsatt checkbox -->
					<div class="m-chk">
						<button type="button" class="avpaa" role="checkbox" aria-checked={medDåp} onclick={() => { medDåp = !medDåp; }}>
							<span class="avpaa-tekst">Med dåp</span>
							<span class="avpaa-bryter" aria-hidden="true"><span class="avpaa-klump"></span></span>
						</button>
						<button type="button" class="avpaa" role="checkbox" aria-checked={medNattverd} onclick={() => { medNattverd = !medNattverd; }}>
							<span class="avpaa-tekst">Med nattverd</span>
							<span class="avpaa-bryter" aria-hidden="true"><span class="avpaa-klump"></span></span>
						</button>
					</div>
					{:else}
						<!-- Jordpåkastelse: av/på-knapper — logikken er fortsatt radioknapper
						     (bind:group, kun én av to kan være på) -->
						<div class="m-chk m-chk-jord">
							<span class="m-jordpaa-label">Jordpåkastelse:</span>
							<button type="button" class="avpaa" role="radio" aria-checked={jordpaa === 'graven'} onclick={() => { jordpaa = 'graven'; }}>
								<span class="avpaa-tekst">Ved graven</span>
								<span class="avpaa-bryter" aria-hidden="true"><span class="avpaa-klump"></span></span>
							</button>
							<button type="button" class="avpaa" role="radio" aria-checked={jordpaa === 'krematorium'} onclick={() => { jordpaa = 'krematorium'; }}>
								<span class="avpaa-tekst">I krematorium</span>
								<span class="avpaa-bryter" aria-hidden="true"><span class="avpaa-klump"></span></span>
							</button>
						</div>
						<p class="m-kirkeaar muted">Gravferdsordningen bruker ikke kirkeårsdag, bibelteksthenting eller dåp/nattverd-valg. Bare den valgte jordpåkastelsesdelen tas med.</p>
				{/if}
				{/key}
			{:else if m.type === 'choose'}
				<p>Velg deler som skal hentes inn fra malen:</p>
				<div class="m-chk">
					{#each m.titles as t (t)}
						<label class="chk"><input type="checkbox" value={t} bind:group={valgte} /> {t}</label>
					{/each}
				</div>
			{:else if m.type === 'chooseOne'}
				<div class="m-velg-to-kolonner">
					<div class="m-velg-liste">
						<p class="muted m-velg-hint">Velg alternativ:</p>
						{#each m.options as o, ai (ai)}
							<button type="button" class="m-velg-rad" class:sel={valgtAlt === ai}
								onclick={() => (valgtAlt = ai)}>
								{o.label || 'Alternativ ' + String.fromCharCode(97 + ai)}
							</button>
						{/each}
					</div>
					<div class="m-velg-visning lit-text">
						{@html litHtml(m.options[valgtAlt]?.text || '')}
					</div>
				</div>
			{:else if m.type === 'bib'}
				<label class="m-bib-q">
					Søk i hovedgudstjenesten
					<input bind:value={bibQ} oninput={() => bibSok(bibQ)} placeholder='F.eks. «forbønn», «velsignelse» …' spellcheck="false" />
				</label>
				{#if !bibGrupper.length}
					<p class="m-kirkeaar muted">Ingen treff. Prøv et annet søkeord.</p>
				{:else if m.mode === 'innhold'}
					<div class="m-bib-cols">
						<div class="m-bib-list" role="listbox">
							{#each bibGrupper as g, gi (g.kilde + '|' + g.ledd)}
								<button type="button" class="m-bib-gruppe" class:sel={bibValgt === gi}
									onclick={() => { bibValgt = gi; bibAltValgt = 0; }}>
									<span class="m-bib-seksjon">{g.seksjon}</span>
									<span class="m-bib-ledd">{g.ledd}</span>
									{#if g.rader.length > 1}<span class="m-bib-antall">{g.rader.length} alternativer</span>{/if}
								</button>
							{/each}
						</div>
						<div class="m-bib-list m-bib-altliste" role="listbox">
							{#if bibGrupper[bibValgt]}
								{#each bibGrupper[bibValgt].rader as r, ri (ri)}
									<button type="button" class="m-bib-alt-row" class:sel={bibAltValgt === ri}
										onclick={() => (bibAltValgt = ri)}>
										<span class="alt-label">{r.label || 'Fast tekst'}</span>
										<span class="m-bib-alt m-bib-lit">{@html litHtml(r.text)}</span>
									</button>
								{/each}
							{/if}
						</div>
					</div>
				{:else}
					<div class="m-bib-cols">
						<div class="m-bib-list" role="listbox">
							{#each bibGrupper as g, gi (g.kilde + '|' + g.ledd)}
								<button type="button" class="m-bib-gruppe" class:sel={bibValgt === gi}
									onclick={() => (bibValgt = gi)}>
									<span class="m-bib-seksjon">{g.seksjon}</span>
									<span class="m-bib-ledd">{g.ledd}</span>
									{#if g.rader.length > 1}<span class="m-bib-antall">{g.rader.length} alternativer</span>{/if}
								</button>
							{/each}
						</div>
						<div class="m-bib-list m-bib-altliste">
							{#if bibGrupper[bibValgt]}
								<p class="m-kirkeaar">Hele leddet hentes med alle alternativene:</p>
								{#each bibGrupper[bibValgt].rader as r, ri (ri)}
									<div class="m-bib-alt-row">
										<span class="alt-label">{r.label || 'Fast tekst'}</span>
										<span class="m-bib-alt m-bib-lit">{@html litHtml(r.text)}</span>
									</div>
								{/each}
							{/if}
						</div>
					</div>
				{/if}
			{:else if m.type === 'valg'}
				<p>{m.message}</p>
			{:else if m.type === 'lukk'}
				<p>{m.message}</p>
			{:else if m.type === 'kirkeaarListe'}
				<p class="m-kirkeaar muted">Velg kirkeårsdag</p>
				<label>
					Dato
					<input type="date" value={m.dato} onchange={(e) => endreDato(e.currentTarget.value)} />
				</label>
				<input bind:value={kFilter} placeholder='Søk, f.eks. «advent», «påske», «24-12» …' spellcheck="false" />
				<div class="m-bib-list m-kirkeaar-liste">
					{#each filtrerteDager as d, di (d.day.id + d.date)}
						<button type="button" class="m-bib-gruppe" class:sel={kValgt === di}
							onclick={() => (kValgt = di)}>
							<span class="m-bib-ledd">{d.name}</span>
							<span class="m-bib-antall">{d.date}{#if d.color}&nbsp;· {d.color}{/if}{#if d.series}&nbsp;· {d.series}{/if}</span>
						</button>
					{/each}
					{#if !filtrerteDager.length}<p class="m-kirkeaar muted">Ingen treff.</p>{/if}
				</div>
			{/if}
			<div id="modal-actions">
				<button onclick={() => { const f = m.onAvbryt; closeModal(); f?.(); }}>{m.cancelLabel ?? 'Avbryt'}</button>
				{#if m.type === 'lukk'}
					<button onclick={() => { const f = m.onForkast; closeModal(); f?.(); }}>Lukk uten å lagre</button>
				{/if}
				<button class="primary" onclick={ok} disabled={m.type === 'bib' && bibValgt === -1 || m.type === 'kirkeaarListe' && kValgt == null}>
					{m.okLabel ?? (m.type === 'confirm' ? 'Slett' : m.type === 'lukk' ? 'Lagre' : m.type === 'newService' ? 'Opprett' : 'Hent inn')}
				</button>
			</div>
		</div>
	</div>
{/if}
