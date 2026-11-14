<script>
	import { app, markDirty, applyKirkeaar, saveAsTemplate } from '$lib/store.svelte.js';
	import { saveCurrent, saveCurrentToFile, lukkRedigering, saveAsTemplateOnDisk } from '$lib/fileio.svelte.js';
	import { valgModal, kirkeaarListeModal, prompt } from '$lib/modal.svelte.js';
	import { lookupKirkeaar, hentTekster } from '$lib/kirkeaar.js';
	import { mdi } from '$lib/mdi.js';
	import { toast } from 'svelte-sonner';

	const isElectron = typeof window !== 'undefined' && !!window.liturgi?.isElectron;
	const o = $derived(app.current);

	function onSave() { saveCurrent(); }

	function onSaveTpl() {
		if (isElectron) {
			prompt('Lagre som lokal mal', 'Navn på malen', (name) => saveAsTemplateOnDisk(name), o.name + ' (grunnordning)');
		} else {
			prompt('Lagre som lokal mal', 'Navn på malen', (name) => saveAsTemplate(name), o.name + ' (grunnordning)');
		}
	}

	function tilEksport() { app.visning = 'eksport'; }

	/** Sjekk ved datoenesring: gi beskjed hvis kirkeårsdagen endres. */
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
			const tekster = await hentTekster(k.day);
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

<div class="insp-gruppe">
	<div class="sidehead">{app.kind === 'template' ? 'Mal' : 'Gudstjeneste'}</div>
	<div class="insp-rad">
		<input type="date" bind:value={o.date} onchange={onDatoEndret} />
	</div>
	<div class="insp-info">
		{#if app.kind === 'service'}
			<span class="insp-linje">Basert på mal: {o.templateName ?? '—'}</span>
			<button class="link-btn insp-linje" onclick={velgKirkeaarManuelt} title="Velg kirkeårsdag manuelt">{@html mdi('calendar-edit')} {o.kirkeaar ? 'endre kirkeårsdag' : 'velg kirkeårsdag'}</button>
			{#if o.kirkeaar}<span class="insp-linje">{o.kirkeaar.name}{#if o.kirkeaar.color}&nbsp;({o.kirkeaar.color}){/if}</span>{/if}
			{#if app.dirty}<span class="dirty insp-linje">• ulagrede endringer</span>{/if}
		{:else}
			<span class="insp-linje">Lokal mal (grunnordning)</span>
		{/if}
	</div>
	<div class="insp-knapper">
		<hr class="side-skiller" />
		<button class="wide" onclick={onSave} title="Lagre">{@html mdi('content-save', 13)} Lagre</button>
		<button class="wide" onclick={() => saveCurrentToFile()} title="Lagre som ny fil på disk">{@html mdi('lagre-som', 13)} Lagre som …</button>
		<button class="wide" onclick={onSaveTpl} title="Lagre som lokal mal">{@html mdi('lagre-som-mal', 11)} Lagre som mal</button>
		{#if app.kind === 'service'}
			<button class="wide" onclick={tilEksport} title="Eksport med profiler (Word, PowerPoint, PDF)">{@html mdi('download', 13)} Eksport …</button>
		{/if}
		<button class="wide" onclick={lukkRedigering} title="Lukk">{@html mdi('close')} Lukk</button>
	</div>
</div>
