<script>
	import { onMount } from 'svelte';
	import { app, openTemplate, createService, formaterBønn, persist, uid } from '$lib/store.svelte.js';
	import { newServiceModal, confirmBox, prompt } from '$lib/modal.svelte.js';
	import { loadTemplatesFromDisk, erOriginalMal, deleteTemplateFile, newTemplateOnDisk } from '$lib/fileio.svelte.js';
	import { exportWord } from '$lib/export.js';
	import { lookupKirkeaar, hentTekster } from '$lib/kirkeaar.js';
	import { litHtml } from '$lib/lit.js';

	const isElectron = typeof window !== 'undefined' && !!window.liturgi?.isElectron;

	let dato = '';
	let kk = null;
	let tekster = null;
	let laster = true;

	const lesninger = [
		{ key: 'L1', tittel: 'Første lesning', evang: false },
		{ key: 'L2', tittel: 'Andre lesning', evang: false },
		{ key: 'E', tittel: 'Evangelium', evang: true }
	];

	const originaler = $derived(app.templates.filter((t) => erOriginalMal(t) || (!isElectron && t.builtinKey?.startsWith('original-'))));
	const brukermaler = $derived(app.templates.filter((t) => !originaler.includes(t)));

	function visTekst(ref, tekst, evang) {
		if (!tekst) return litHtml('ML | ' + ref);
		const intro = evang
			? 'L/ML | Det hellige evangelium står skrevet hos ' + ref + ':'
			: 'ML | Det står skrevet i/hos ' + ref + ':';
		const outro = evang
			? 'L/ML | Slik lyder det hellige evangelium.'
			: 'ML | Slik lyder Herrens ord.';
		const innhold = (tekst.title ? tekst.title + '\n' : '') + tekst.text + '\nFOTNOTE | ' + ref;
		return litHtml(intro + '\n' + innhold + '\n' + outro);
	}

	async function eksporterMal(t) {
		try {
			await exportWord(t, app.showInstr);
		} catch (e) {
			alert('Klarte ikke eksportere: ' + e.message);
		}
	}

	function slettMal(t) {
		if (isElectron) {
			confirmBox('Slett mal', `Flytte malen «${t.name}» til papirkurven?`, async () => {
				await deleteTemplateFile(t.filePath);
			});
		} else {
			confirmBox('Slett mal', `Slette malen «${t.name}»?`, () => {
				app.templates = app.templates.filter((x) => x.id !== t.id);
				persist();
			});
		}
	}

	async function importerMal() {
		if (isElectron) {
			const r = await window.liturgi.openFile();
			if (!r.ok) return;
			let data;
			try {
				const parsed = JSON.parse(r.json);
				data = parsed?.liturgiFormat ? parsed.data : parsed;
			} catch { data = null; }
			if (!data || !Array.isArray(data.sections)) { alert('Filen ser ikke ut som en mal'); return; }
			if ((data.kind ?? 'template') !== 'template') { alert('Filen er en gudstjeneste, ikke en mal'); return; }
			const list = await window.liturgi.listTemplates();
			data.kind = 'template';
			data.id = uid();
			delete data.builtinKey;
			const safe = (data.name || 'mal').replace(/[\\/:*?"<>|]+/g, '').trim() || 'mal';
			const taken = new Set([...list.originaler, ...list.brukermaler].map((x) => x.path));
			let p = `${list.dirs.brukermaler}/${safe}.limal`, n = 2;
			while (taken.has(p)) { p = `${list.dirs.brukermaler}/${safe} (${n}).limal`; n++; }
			const w = await window.liturgi.writeTemplate(p, JSON.stringify({ liturgiFormat: 1, kind: 'template', data }, null, '\t'));
			if (!w.ok) { alert('Klarte ikke importere malen: ' + (w.error ?? 'ukjent feil')); return; }
			data.filePath = w.filePath;
			await loadTemplatesFromDisk();
			alert('Malen «' + data.name + '» er importert');
		} else {
			const inp = document.createElement('input');
			inp.type = 'file';
			inp.accept = '.limal,.liturgi,.json,application/json';
			inp.onchange = async () => {
				const f = inp.files[0];
				if (!f) return;
				try {
					const parsed = JSON.parse(await f.text());
					const data = parsed?.liturgiFormat ? parsed.data : parsed;
					if (!data || !Array.isArray(data.sections)) throw new Error();
					data.kind = 'template';
					data.id = uid();
					delete data.builtinKey;
					app.templates.push(data);
					persist();
					alert('Malen «' + data.name + '» er importert');
				} catch { alert('Filen ser ikke ut som en mal'); }
			};
			inp.click();
		}
	}

	function nyLokalMal() {
		prompt('Ny lokal mal', 'Navn på malen', async (name) => {
			if (isElectron) {
				await newTemplateOnDisk(name);
			} else {
				const t = { id: uid(), kind: 'template', name: name || 'Ny grunnordning', sections: [{ title: 'I. Samling', items: [] }] };
				app.templates.push(t);
				persist();
				openTemplate(t.id);
			}
		});
	}

	onMount(async () => {
		// kommende søndag
		const d = new Date();
		const dag = d.getDay();
		const diff = (7 - dag) % 7 || 7;
		d.setDate(d.getDate() + diff);
		dato = d.toISOString().slice(0, 10);
		kk = lookupKirkeaar(dato);
		if (kk?.day) tekster = await hentTekster(kk.day);
		laster = false;
	});
</script>

<div id="welcome">
	<h2>Liturgi</h2>
	<p>
		Lag gudstjenester fra malen «Hovedgudstjenesten» eller din lokale grunnordning,
		velg salmer, bytt ledd og alternativer, og eksporter til PDF, Word eller PowerPoint.
	</p>
	<p><button class="wide" onclick={() => newServiceModal(createService)}>Opprett gudstjeneste</button></p>

	{#if laster}
		<p class="w-muted">Henter kommende søndag …</p>
	{:else if kk}
		<div class="w-sondag">
			<h3>Kommende søndag · {dato}</h3>
			<p class="w-kirkeaar">☀️ <strong>{kk.name}</strong>{kk.color ? ' · ' + kk.color : ''}{kk.series ? ' · ' + kk.series : ''}</p>
			{#if kk.prayer}
				<h4>Dagens bønn</h4>
				<div class="lit-text">{@html litHtml(formaterBønn(kk.prayer))}</div>
			{/if}
			<h4>Bibeltekster</h4>
			{#each lesninger as L}
				{#if kk[L.key]}
					<details>
						<summary>{L.tittel} · {kk[L.key]}</summary>
						{#if tekster?.[L.key]}
							<div class="lit-text">{@html visTekst(kk[L.key], tekster[L.key], L.evang)}</div>
						{:else}
							<p class="w-muted">Klarte ikke hente teksten fra bibel.no.</p>
						{/if}
					</details>
				{/if}
			{/each}
		</div>
	{/if}

	<div class="w-maler">
		<h3>Maler</h3>
		{#each originaler as t (t.id)}
			<div class="w-mal">
				<span class="w-mal-nm" onclick={() => openTemplate(t.id)} title="Åpne og rediger">{t.name}</span>
				<span class="w-mal-tag">original</span>
				<button onclick={() => eksporterMal(t)} title="Eksporter til Word">Eksportér</button>
				<button onclick={() => openTemplate(t.id)} title="Åpne og rediger">Åpne</button>
			</div>
		{/each}
		{#each brukermaler as t (t.id)}
			<div class="w-mal">
				<span class="w-mal-nm" onclick={() => openTemplate(t.id)} title="Åpne og rediger">{t.name}</span>
				<button onclick={() => eksporterMal(t)} title="Eksporter til Word">Eksportér</button>
				<button onclick={() => openTemplate(t.id)} title="Åpne og rediger">Åpne</button>
				<button class="w-mal-del" onclick={() => slettMal(t)} title="Slett malen">Slett</button>
			</div>
		{/each}
		<div class="w-mal-handlinger">
			<button onclick={importerMal}>Importér mal …</button>
			<button onclick={nyLokalMal}>+ Ny lokal mal</button>
		</div>
	</div>
</div>
