<script>
	import { app, markDirty, applyKirkeaar } from '$lib/store.svelte.js';
	import { saveCurrent, lukkRedigering, erOriginalMal } from '$lib/fileio.svelte.js';
	import { lagreTilProsjekt } from '$lib/malverktoy.svelte.js';
	import { valgModal, kirkeaarListeModal } from '$lib/modal.svelte.js';
	import { lookupKirkeaar, hentTekster, lesTeksterCache } from '$lib/kirkeaar.js';
	import { mdi } from '$lib/mdi.js';
	import { toast } from 'svelte-sonner';

	const o = $derived(app.current);

	function onSave() {
		if (app.current?.__devMal) { lagreTilProsjekt(); return; } // ⌘S på dev-mal → «Lagre til prosjektet»
		saveCurrent();
	}

	function onLagreTilProsjekt() { lagreTilProsjekt(); }

	/** NATIV høyremeny for TOC-panelet/DokInsp (macOS Menu.popup).
	 *  Punktene kjøres via kjorMenyId — samme rute som menylinjen. */
	function natMeny(e) {
		e.preventDefault();
		if (!window.liturgi?.visNatMeny) return;
		const punkter = [];
		if (app.kind === 'service') {
			punkter.push({ id: 'lagre', label: 'Lagre', enabled: true });
			punkter.push({ id: 'lagre-som', label: 'Lagre som …' });
			punkter.push({ id: 'lagre-som-mal', label: 'Lagre som mal' });
			punkter.push('sep');
			punkter.push({ id: 'salmeoversikt', label: 'Salmeoversikt …' });
		punkter.push({ id: 'eksport', label: 'Eksport …' });
			if (o?.filePath) punkter.push({ id: 'apne-mappe', label: 'Åpne mappe' });
		} else if (o?.__devMal) {
			punkter.push({ id: 'lagre', label: 'Lagre til prosjektet' });
			punkter.push({ id: 'lagre-som-kopi', label: 'Lagre som kopi' });
		} else {
			punkter.push({ id: erOriginalMal(o) ? 'lagre-som-kopi' : 'lagre', label: erOriginalMal(o) ? 'Lagre som kopi' : 'Lagre' });
			punkter.push({ id: 'lagre-som', label: 'Lagre som …' });
		}
		punkter.push('sep');
		punkter.push({ id: 'lukk-dok', label: 'Lukk dokument' });
		window.liturgi.visNatMeny(punkter);
	}

	function tilEksport() { app.visning = 'eksport'; }
	function tilSalmer() { app.visning = 'salmer'; }

	/** Sjekk ved datoendring: gi beskjed hvis kirkeårsdagen endres. */
	function onDatoEndret() {
		markDirty();
		const k = lookupKirkeaar(o.date);
		if (!k || k.name === o.kirkeaar?.name) return;
		valgModal(
			'Kirkeårsdagen er endret',
			`Datoen peker nå på «${k.name}», men gudstjenesten har innhold fra «${o.kirkeaar?.name ?? 'ingen dag'}». Vil du oppdatere dagens bønn og bibeltekstene?`,
			'Oppdater', 'Behold innholdet',
			() => oppdaterInnhold(k)
		);
	}

	async function oppdaterInnhold(k) {
		try {
			const tekster = await hentTekster(k.day, await lesTeksterCache(), k.series);
			applyKirkeaar(o, k, tekster);
			o.kirkeaar = { name: k.name, color: k.color, periodInfo: k.periodInfo, series: k.series };
			markDirty();
			toast.success('Gudstjenesten er oppdatert til «' + k.name + '»');
		} catch (e) {
			toast.error('Klarte ikke oppdatere: ' + (e?.message ?? e));
		}
	}

	/** Manuelt kirkeårsdag-valg. */
	function velgKirkeaarManuelt() {
		kirkeaarListeModal(o.date, (k) => {
			if (!k) return;
			if (k.name === o.kirkeaar?.name) return;
			o.kirkeaar = { name: k.name, color: k.color, periodInfo: k.periodInfo, series: k.series };
			markDirty();
			valgModal(
				'Kirkeårsdag endret manuelt',
				`Gudstjenesten peker nå på «${k.name}». Vil du oppdatere dagens bønn og bibeltekstene?`,
				'Oppdater', 'Behold innholdet',
				() => oppdaterInnhold(k)
			);
		});
	}
</script>

<div class="insp-gruppe" oncontextmenu={natMeny}>
	<div class="sidehead">{app.kind === 'template' ? 'Mal' : 'Gudtjeneste'}</div>
	{#if app.kind === 'service'}
		<div class="insp-rad">
			<input type="date" bind:value={o.date} onchange={onDatoEndret} />
		</div>
	{/if}
	<div class="insp-info">
		{#if app.kind === 'service'}
			<span class="insp-linje">Basert på mal: {o.templateName ?? '—'}</span>
			<button class="link-btn insp-linje" onclick={velgKirkeaarManuelt} title="Velg kirkeårsdag manuelt">{@html mdi('calendar-edit')} {o.kirkeaar ? 'endre kirkeårsdag' : 'velg kirkeårsdag'}</button>
			{#if o.kirkeaar}<span class="insp-linje">{o.kirkeaar.name}{#if o.kirkeaar.color}&nbsp;({o.kirkeaar.color}){/if}</span>{/if}
			{#if app.dirty}<span class="dirty insp-linje">• ulagrede endringer</span>{/if}
		{:else if o?.__devMal}
			<span class="insp-linje">Original i prosjektet — endringene skrives til <code>src/lib/data.js</code> og seed-filen ved «Lagre til prosjektet».</span>
			{#if app.dirty}<span class="dirty insp-linje">• ulagrede endringer</span>{/if}
		{:else}
			<span class="insp-linje">Lokal mal (grunnordning)</span>
			<div class="insp-rad insp-avpaa-rad">
				<button type="button" class="avpaa" role="checkbox" aria-checked={o?.kanGudstjeneste !== false} title="Kan malen brukes til å opprette gudstjenester?" onclick={() => { if (o) { o.kanGudstjeneste = o.kanGudstjeneste === false; markDirty(); } }}>
					<span class="avpaa-tekst">Kan brukes til gudstjenester</span>
					<span class="avpaa-bryter" aria-hidden="true"><span class="avpaa-klump"></span></span>
				</button>
			</div>
			{#if app.dirty}<span class="dirty insp-linje">• ulagrede endringer</span>{/if}
		{/if}
	</div>
</div>

<hr class="side-skiller insp-skiller" />

<div class="insp-gruppe insp-bunn">
	<div class="insp-knapper">
		{#if app.kind === 'template'}
			{#if o?.__devMal}
				<button class="wide primary" onclick={onLagreTilProsjekt} title="Skriv originalen tilbake til src/lib/data.js og seed-filen">{@html mdi('content-save', 17)} Lagre til prosjektet</button>
			{/if}
		{:else}
			<button class="wide" onclick={onSave} title="Lagre">{@html mdi('content-save', 17)} Lagre</button>
			<button class="wide" onclick={() => saveCurrentToFile()} title="Lagre som ny fil på disk">{@html mdi('lagre-som', 17)} Lagre som …</button>
		{/if}
		{#if app.kind === 'service'}
			<button class="wide" onclick={tilSalmer} title="Salmeoversikt — fyll inn og hent alle salmetekstene samlet">{@html mdi('library', 16)} Salmer …</button>
			<button class="wide" onclick={tilEksport} title="Eksport med profiler (Word, PowerPoint, PDF)">{@html mdi('download', 16)} Eksport …</button>
		{/if}
		<button class="wide" onclick={lukkRedigering} title="Lukk">{@html mdi('close')} Lukk</button>
	</div>
</div>
