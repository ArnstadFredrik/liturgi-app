<script>
	import { app } from '$lib/store.svelte.js';
	import { closeModal, showModal, kirkeaarListeModal } from '$lib/modal.svelte.js';
	import { litHtml } from '$lib/lit.js';
	import { lookupKirkeaar, hentTekster, kirkeaarDager } from '$lib/kirkeaar.js';

	const m = $derived(app.modal);
	let name = $state('');
	let date = $state('');
	let tplId = $state('');
	let medDåp = $state(true);
	let medNattverd = $state(true);
	let valgte = $state([]);
	let valgtAlt = $state(0);
	let kirkeaar = $state(null);
	let tekster = $state(null);
	let teksterStatus = $state('');
	let manuellK = $state(null);
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
				name = m.preserve.name;
				date = m.preserve.date;
				tplId = m.preserve.tplId;
				medDåp = m.preserve.dåp;
				medNattverd = m.preserve.nattverd;
				manuellK = m.preserve.kirkeaar;
				kirkeaar = m.preserve.kirkeaar;
			} else {
				name = '';
				date = nextSundayISO();
				tplId = app.templates[0]?.id ?? '';
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
	const filtrerteDager = $derived.by(() => {
		const q = kFilter.trim().toLowerCase();
		if (!q) return kDager;
		return kDager.filter((d) => (d.name + ' ' + d.date).toLowerCase().includes(q));
	});
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
	$effect(() => {
		if (m?.type === 'newService' && date && !manuellK) autoKirkeaar();
	});

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
			name, date, tplId, dåp: medDåp, nattverd: medNattverd,
			kirkeaar, tekster, teksterStatus
		};
		const tilbakeTilNyService = () => {
			showModal({
				type: 'newService', ok: forrige.ok,
				preserve: { name: forrige.name, date: forrige.date, tplId: forrige.tplId,
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

	function nullstillKirkeaar() {
		manuellK = null;
		autoKirkeaar();
	}

	function ok() {
		if (!m) return;
		const forrige = m;
		if (m.type === 'prompt') m.ok(name.trim());
		else if (m.type === 'confirm' || m.type === 'valg') m.ok();
		else if (m.type === 'newService') {
			const opprett = () => {
				m.ok(name.trim(), date, tplId, { dåp: medDåp, nattverd: medNattverd }, kirkeaar, tekster);
				if (app.modal === forrige) closeModal();
			};
			// vent på at tekstepplaget er ferdig (maks 6 s) før opprettelse
			if (kirkeaar && teksterStatus === 'laster') {
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
		<div id="modal" role="dialog">
			<h3>{m.title}</h3>
			{#if m.type === 'confirm'}
				<p>{m.message}</p>
			{:else if m.type === 'prompt'}
				<label>
					{m.label}
					<input bind:value={name} onkeydown={onKey} />
				</label>
			{:else if m.type === 'newService'}
				<label>
					Mal
					<select bind:value={tplId}>
						{#each app.templates as t (t.id)}
							<option value={t.id}>{t.name}</option>
						{/each}
					</select>
				</label>
				<label>
					Navn
					<input bind:value={name} onkeydown={onKey} placeholder="F.eks. Søndag 15. november" />
				</label>
				<label>
					Dato
					<input type="date" bind:value={date} />
				</label>
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
				<div class="m-chk">
					<label class="chk"><input type="checkbox" bind:checked={medDåp} /> Med dåp</label>
					<label class="chk"><input type="checkbox" bind:checked={medNattverd} /> Med nattverd</label>
				</div>
			{:else if m.type === 'choose'}
				<p>Velg deler som skal hentes inn fra malen:</p>
				<div class="m-chk">
					{#each m.titles as t (t)}
						<label class="chk"><input type="checkbox" value={t} bind:group={valgte} /> {t}</label>
					{/each}
				</div>
			{:else if m.type === 'chooseOne'}
				<p>Velg alternativ:</p>
				<div class="m-alts">
					{#each m.options as o, ai (ai)}
						<label class="m-alt" class:sel={valgtAlt === ai}>
							<input type="radio" name="m-alt" value={ai} bind:group={valgtAlt} />
							<span class="m-alt-col">
								<span class="alt-label">{o.label || 'Alternativ ' + String.fromCharCode(97 + ai)}</span>
								<span class="m-alt-text">{@html litHtml(o.text)}</span>
							</span>
						</label>
					{/each}
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
			{:else if m.type === 'kirkeaarListe'}
				<p class="m-kirkeaar muted">Velg kirkeårsdag for {m.dato}:</p>
				<input bind:value={kFilter} oninput={() => {}} placeholder='Filtrer, f.eks. «advent» …' spellcheck="false" />
				<div class="m-bib-list m-kirkeaar-liste">
					{#each filtrerteDager as d, di (d.day.id + d.date)}
						<button type="button" class="m-bib-gruppe" class:sel={kValgt === di}
							onclick={() => (kValgt = di)}>
							<span class="m-bib-ledd">{d.date} · {d.name}</span>
							{#if d.color}<span class="m-bib-antall">{d.color}{#if d.series}&nbsp;· {d.series}{/if}</span>{/if}
						</button>
					{/each}
				</div>
			{/if}
			<div id="modal-actions">
				<button onclick={() => { const f = m.onAvbryt; closeModal(); f?.(); }}>{m.cancelLabel ?? 'Avbryt'}</button>
				<button class="primary" onclick={ok} disabled={m.type === 'bib' && bibValgt === -1 || m.type === 'kirkeaarListe' && kValgt == null}>
					{m.okLabel ?? (m.type === 'confirm' ? 'Slett' : m.type === 'newService' ? 'Opprett' : 'Hent inn')}
				</button>
			</div>
		</div>
	</div>
{/if}
