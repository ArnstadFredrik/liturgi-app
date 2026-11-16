<script>
	// DEV-modul: rediger originalmalene (BUILTIN_TEMPLATES i src/lib/data.js)
	// med hele den vanlige riktekst-editoren, og lagre dem tilbake i prosjektet
	// slik at de blir med i byggprosessen. Komponenten bygges ALDRI ut i
	// produksjon — +page.svelte gate'er den på import.meta.env.DEV +
	// window.liturgi.devModus, og IPC-handleren i main.cjs nekter i pakket app.
	import { BUILTIN_TEMPLATES } from '$lib/data.js';
	import { app } from '$lib/store.svelte.js';
	import { safeNavn } from '$lib/fileio.svelte.js';
	import { toast } from 'svelte-sonner';
	import { mdi } from '$lib/mdi.js';

	const erDev = __DEV_MODE__ && !!window.liturgi?.lagreDataJs;
	if (!erDev) window.location.href = '/';

	/** Redigeres nå en dev-kopi av en originalmal? */
	const devDok = $derived(app.current?.__devMal ? app.current : null);

	/** Åpne en arbeidskopi av originalmalen i den vanlige editoren. */
	function åpne(bt) {
		const data = JSON.parse(JSON.stringify(bt));
		// Svelte 5 kaster props_invalid_value når EditableText får bind:value=undefined
		// (value = $bindable('')) — disk-seedene har «text: ""» på alle ledd; data.js har
		// det ikke på alle (f.eks. salme-ledd). Normaliser bare det editoren binder på
		// (malForDataJs fjerner tomme tilleggsfelt ved lagring, så data.js-formen bevares).
		for (const sec of data.sections) {
			for (const it of sec.items) {
				if (it.text === undefined) it.text = '';
				for (const a of it.alts ?? []) { if (a.label === undefined) a.label = ''; if (a.text === undefined) a.text = ''; }
				for (const a of it.introAlts ?? []) { if (a.label === undefined) a.label = ''; if (a.text === undefined) a.text = ''; }
				for (const a of it.avslutningAlts ?? []) { if (a.label === undefined) a.label = ''; if (a.text === undefined) a.text = ''; }
			}
		}
		data.__devMal = true;
		data.__devId = bt.id;          // hvilken data.js-entry denne kopien redigerer
		data.__devKey = bt.builtinKey ?? null; // originalens builtinKey (til seed-fil)
		data.kind = 'template';
		delete data.builtinKey; // unngå kollisjon med disk-malen i store-oppdateringer
		app.current = data;
		app.kind = 'template';
		app.visning = 'hjem';
		app.dirty = false;
		toast.info('Rediger malen, og velg «Lagre til prosjektet» i Malverktøy når du er ferdig.');
	}

	/** Fjerner felter lagt til under redigering: tomme strenger («text: ""» fra
	 *  normaliseringen) som originalen ikke hadde, rekursivt. Nytt innhold i
	 *  felter som finnes i originalen (eller reelt nye, ikke-tomme felter) beholdes. */
	function formEtter(ny, orig) {
		if (Array.isArray(ny)) {
			return ny.map((v, i) => formEtter(v, Array.isArray(orig) ? orig[Math.min(i, orig.length - 1)] : undefined));
		}
		if (ny && typeof ny === 'object') {
			const okeys = orig && typeof orig === 'object' && !Array.isArray(orig) ? orig : {};
			const ut = {};
			for (const [k, v] of Object.entries(ny)) {
				if (!(k in okeys) && v === '') continue; // tom tilleggsfelt fra normaliseringen
				ut[k] = formEtter(v, okeys[k]);
			}
			return ut;
		}
		return ny;
	}

	/** Bygg mal-objektet for data.js: samme felternes rekkefølge og mengde som
	 *  originalen, med de redigerte verdiene — ingen helper-felter blir med. */
	function malForDataJs(orig, redigert) {
		const kopi = JSON.parse(JSON.stringify(redigert));
		for (const k of ['__devMal', '__devId', '__devKey', '__dirty', 'filePath', 'kind']) delete kopi[k];
		return formEtter(kopi, orig);
	}

	/** Lagre åpen dev-mal tilbake til src/lib/data.js + seed-filen på disk. */
	async function lagreTilProsjekt() {
		const o = devDok;
		if (!o) return;
		const orig = BUILTIN_TEMPLATES.find((bt) => bt.id === o.__devId || bt.id === o.id || bt.name === o.name);
		if (!orig) { toast.error('Fant ikke originalmalen i data.js'); return; }
		const mal = malForDataJs(orig, o);
		// seed-filen skrives fra den redigerte kopien (beholder normaliserte
		// tomme felter, slik som dagens seed-format: text/instr som «""»)
		const seed = JSON.parse(JSON.stringify(o));
		for (const k of ['__devMal', '__devId', '__devKey', '__dirty', 'filePath', 'kind']) delete seed[k];
		// 1) data.js
		const r = await window.liturgi.lagreDataJs(mal);
		if (!r?.ok) { toast.error(r?.error ?? 'Klarte ikke lagre til data.js'); return; }
		// 2) seed-filen (~/.config/Liturgi/maler/originaler|brukermaler/<navn>.liturgi)
		let seedMelding = 'Ingen seed-fil (kjører ikke i Electron)';
		if (window.liturgi?.listTemplates) {
			const list = await window.liturgi.listTemplates();
			if (list?.ok) {
				const sub = /hovedgudstjeneste|gravferd/i.test(seed.name) ? 'originaler' : 'brukermaler';
				if (o.__devKey && !seed.builtinKey) seed.builtinKey = o.__devKey;
				const sti = `${list.dirs[sub]}/${safeNavn(seed.name)}.liturgi`;
				const w = await window.liturgi.writeTemplate(sti, JSON.stringify({ liturgiFormat: 1, kind: 'template', data: seed }, null, '\t'));
				seedMelding = w?.ok ? 'seed-fil oppdatert' : 'seed-fil FEILET: ' + (w?.error ?? '?');
			}
		}
		o.__dirty = false;
		app.dirty = false;
		toast.success('data.js oppdatert · ' + seedMelding);
	}
</script>

<div id="malverktoy">
	<h1>Malverktøy <span class="dev-merke">DEV</span></h1>
	<p class="beskrivelse">
		Rediger originalmalene som følger programmet. Endringene lagres tilbake i
		<code>src/lib/data.js</code> og i seed-filene under
		<code>~/.config/Liturgi/maler/</code>, slik at de blir med i byggprosessen.
		Denne modulen finnes ikke i pakkede utgaver.
	</p>

	{#if devDok}
		<div class="apen-boks">
			<span>Åpen for redigering: <strong>{devDok.name}</strong></span>
			<button class="primer" onclick={lagreTilProsjekt}>
				{@html mdi('content-save')} Lagre til prosjektet
			</button>
		</div>
	{/if}

	<ul class="mal-liste">
		{#each BUILTIN_TEMPLATES as bt (bt.id)}
			<li>
				<div class="mal-info">
					<span class="navn">{bt.name}</span>
					{#if bt.description}<span class="beskr">{bt.description}</span>{/if}
				</div>
				<button onclick={() => åpne(bt)}>
					{@html mdi('pencil')} Åpne i redigering
				</button>
			</li>
		{/each}
	</ul>
</div>

<style>
	#malverktoy { max-width: 720px; margin: 0 auto; padding: 24px; }
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
</style>
