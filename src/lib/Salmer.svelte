<script>
	// Salmeoversikt: alle salmeleddene i gudstjenesten i én liste — fyll inn
	// nummer og/eller tittel og hent alle tekstene i ÉN registrering.
	import { app, markDirty } from '$lib/store.svelte.js';
	import Modulfaner from './Modulfaner.svelte';
	import { formaterSalme, salmeAlts } from '$lib/lit.js';
	import { mdi } from '$lib/mdi.js';
	import { toast } from 'svelte-sonner';

	const o = $derived(app.current);

	// rader: {si, ii, it} for hvert salmeledd i gudstjenesten
	const salmer = $derived.by(() => {
		const ut = [];
		if (!o?.sections) return ut;
		o.sections.forEach((sec, si) => {
			(sec.items ?? []).forEach((it, ii) => {
				if (it.type === 'salme') ut.push({ si, ii, it });
			});
		});
		return ut;
	});

	const manglerTekst = (it) => !(it.text ?? '').trim();

	let henter = $state(false);
	let henterRad = $state(''); // item-id for per-rad indikator (enkeltvis henting)
	let ventende = $state([]);  // item-id-er under henting i «Hent alle»
	let ferdigMelding = $state('');

	const venterRad = (id) => henterRad === id || ventende.includes(id);

	async function hentEn(it) {
		if (henter) return;
		if (!String(it.salmeNr ?? '').trim() && !String(it.salmeTittel ?? '').trim()) {
			toast.error('Fyll inn salmenummer eller tittel først');
			return;
		}
		if (!window.liturgi?.salmeHent) { toast.error('Salmedatabasen er kun tilgjengelig i Mac-appen'); return; }
		henter = true;
		henterRad = it.id;
		try {
			const r = await window.liturgi.salmeHent({
				nr: String(it.salmeNr ?? '').trim(),
				tittel: String(it.salmeTittel ?? '').trim(),
				dato: o.date ?? '',
				navn: o.liturgiType === 'gravferd' ? 'Gravferd' : o.liturgiType === 'vigsel' ? 'Vigsel' : 'Gudstjeneste'
			});
			if (!r?.ok) {
				toast.error(r?.error === 'Ikke konfigurert' ? 'Registrer bruker for gudstjeneste.no i Innstillinger' : (r?.error ?? 'Klarte ikke hente salmen'));
				return;
			}
			it.salmeTittel = it.salmeTittel || (r.tittel ?? '');
			const d = salmeAlts(formaterSalme(r.tekst));
			it.text = d.text;
			if (d.alts.length > 1) { it.alts = d.alts; it.selAlt = 0; }
			markDirty();
			toast.success('Hentet «' + r.tittel + '»');
		} finally {
			henter = false;
			henterRad = '';
		}
	}

	/** Hent alle rader som mangler tekst i ÉN registrering (flere verk samtidig). */
	async function hentAlle() {
		if (henter) return;
		const rene = salmer.filter(({ it }) => manglerTekst(it) && (String(it.salmeNr ?? '').trim() || String(it.salmeTittel ?? '').trim()));
		if (!rene.length) { toast.info('Ingen salmer mangler tekst'); return; }
		if (!window.liturgi?.salmeHentFlere) { toast.error('Salmedatabasen er kun tilgjengelig i Mac-appen'); return; }
		henter = true;
		ventende = rene.map(({ it }) => it.id);
		ferdigMelding = '';
		try {
			const r = await window.liturgi.salmeHentFlere({
				dato: o.date ?? '',
				navn: o.liturgiType === 'gravferd' ? 'Gravferd' : o.liturgiType === 'vigsel' ? 'Vigsel' : 'Gudstjeneste',
				salmer: rene.map(({ it }) => ({
					key: it.id,
					nr: String(it.salmeNr ?? '').trim(),
					tittel: String(it.salmeTittel ?? '').trim()
				}))
			});
			if (!r?.ok) {
				toast.error(r?.error === 'Ikke konfigurert' ? 'Registrer bruker for gudstjeneste.no i Innstillinger' : (r?.error ?? 'Klarte ikke hente salmene'));
				return;
			}
			let antall = 0;
			const feil = [];
			for (const res of (r.resultater ?? [])) {
				const rad = salmer.find(({ it }) => it.id === res.key);
				if (!rad) continue;
				if (res.ok) {
					rad.it.salmeTittel = rad.it.salmeTittel || (res.tittel ?? '');
					const d = salmeAlts(formaterSalme(res.tekst));
					rad.it.text = d.text;
					if (d.alts.length > 1) { rad.it.alts = d.alts; rad.it.selAlt = 0; }
					antall++;
				} else {
					feil.push((rad.it.heading || '') + ': ' + (res.error ?? 'ukjent feil'));
				}
			}
			if (antall) markDirty();
			ferdigMelding = feil.length ? `Hentet ${antall} — feil: ${feil.join('; ')}` : `Hentet ${antall} ${antall === 1 ? 'salme' : 'salmer'}`;
			if (feil.length) toast.warning(ferdigMelding);
			else toast.success(ferdigMelding);
		} finally {
			henter = false;
			ventende = [];
		}
	}
</script>

<div id="salmer-modul">
	<Modulfaner aktiv="salmer" faner={[
		{ id: 'redigering', navn: 'Redigering', velg: () => { app.visning = 'editor'; } },
		{ id: 'salmer', navn: 'Salmer' },
		{ id: 'eksport', navn: 'Eksport', velg: () => { app.visning = 'eksport'; } }
	]} />
	<header class="sal-overhode">
		<div class="sal-tittel">
			<h2>Salmeoversikt</h2>
			<span class="sal-under">{o?.name ?? ''}{o?.date ? ' · ' + o.date : ''}</span>
		</div>
		<div class="sal-handlinger">
			{#if ferdigMelding}<span class="sal-ferdig">{ferdigMelding}</span>{/if}
			<button class="wide sal-hent-alle" onclick={hentAlle} disabled={henter}
				title="Søker og registrerer alle salmer som mangler tekst i én registrering hos gudstjeneste.no">
				{#if henter}{@html mdi('loading', 15)} Henter …{:else}{@html mdi('cloud-download', 15)} Hent alle ({salmer.filter(({ it }) => manglerTekst(it) && (String(it.salmeNr ?? '').trim() || String(it.salmeTittel ?? '').trim())).length}){/if}
			</button>
		</div>
	</header>

	{#if salmer.length === 0}
		<p class="sal-tom">Gudtjenesten har ingen salmeledd. Legg til et ledd og skift typen til «Salme», eller opprett salmeleddene her.</p>
	{:else}
		<div class="sal-liste">
			{#each salmer as { si, ii, it } (it.id)}
				<div class="sal-rad" class:hentes={venterRad(it.id)}>
					<div class="sal-rad-hode">
						<span class="item-eyebrow">{it.heading || 'Salme'}</span>
						{#if !manglerTekst(it)}<span class="sal-status ok">tekst hentet</span>{:else}<span class="sal-status tom">mangler tekst</span>{/if}
					</div>
					<div class="sal-rad-felt">
						<input class="nr" placeholder="Nr" spellcheck="false" bind:value={it.salmeNr} onchange={markDirty} />
						<input class="tittel" placeholder="Salmens tittel" spellcheck="false" bind:value={it.salmeTittel} onchange={markDirty} />
						<button class="sal-hent-rad" class:venter={venterRad(it.id)} onclick={() => hentEn(it)} disabled={henter}
							title="Søk opp og hent denne salmen (eget verksbruk registreres)">
							{#if venterRad(it.id)}{@html mdi('loading', 14)} Henter …{:else}{@html mdi('cloud-download', 14)} Hent{/if}
						</button>
					</div>
				</div>
			{/each}
		</div>
		<p class="sal-notis">«Hent alle» søker og registrerer salmer som mangler tekst i én samlet registrering (dato og gudstjenestetype fra gudstjenesten). Rader med tekst fra før hentes bare enkeltvis.</p>
	{/if}
</div>
