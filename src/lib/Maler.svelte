<script>
	import { app, openTemplate, persist, uid } from '$lib/store.svelte.js';
	import { confirmBox, prompt } from '$lib/modal.svelte.js';
	import { loadTemplatesFromDisk, erOriginalMal, deleteTemplateFile, newTemplateOnDisk, importerMalFil } from '$lib/fileio.svelte.js';
	import { exportWord } from '$lib/export.js';
	import { malType } from '$lib/modal.svelte.js';

	const isElectron = typeof window !== 'undefined' && !!window.liturgi?.isElectron;

	$effect(() => {
		if (isElectron) loadTemplatesFromDisk();
	});

	const originaler = $derived(app.templates.filter((t) => erOriginalMal(t) || (!isElectron && t.builtinKey?.startsWith('original-'))));
	const brukermaler = $derived(app.templates.filter((t) => !originaler.includes(t)));

	/** Søk + filtre (type/kilde) + sortering etter type så navn. */
	let q = $state('');
	let typeFilter = $state('alle'); // alle | gudstjeneste | vigsel | gravferd
	let kildeFilter = $state('alle'); // alle | originaler | brukermaler

	const typeRekkefolge = { gudstjeneste: 0, vigsel: 1, gravferd: 2 };
	const typeNavn = { gudstjeneste: 'Gudstjeneste', vigsel: 'Vigsel', gravferd: 'Gravferd' };
	function passer(t) {
		if (q && !t.name.toLowerCase().includes(q.toLowerCase())) return false;
		if (typeFilter !== 'alle' && malType(t) !== typeFilter) return false;
		return true;
	}
	const visOriginaler = $derived(
		kildeFilter === 'brukermaler' ? [] : originaler.filter(passer).sort((a, b) => (typeRekkefolge[malType(a)] - typeRekkefolge[malType(b)]) || a.name.localeCompare(b.name, 'no'))
	);
	const visBrukere = $derived(
		kildeFilter === 'originaler' ? [] : brukermaler.filter(passer).sort((a, b) => (typeRekkefolge[malType(a)] - typeRekkefolge[malType(b)]) || a.name.localeCompare(b.name, 'no'))
	);

	async function eksporterMal(t) {
		try {
			await exportWord(t, t.visInstr ?? true);
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

	function importerMal() {
		if (isElectron) {
			window.liturgi.openFile().then((r) => {
				if (!r.ok) return;
				importerMalFil(r.json, r.filePath);
			});
		} else {
			const inp = document.createElement('input');
			inp.type = 'file';
			inp.accept = '.limal,.liturgi,.json,application/json';
			inp.onchange = async () => {
				const f = inp.files[0];
				if (!f) return;
				importerMalFil(await f.text(), f.name);
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
</script>

<div id="maler-side">
	<h2>Maler</h2>
	<p class="maler-ingress">
		Originalmalene («Ordning for hovedgudstjenesten») følger med appen og kan ikke slettes.
		Endrer du en original utover å velge alternativer, lagres endringene som en kopi i brukermaler.
	</p>

	<div class="mal-filter">
		<input class="mal-sok" placeholder="Søk i maler …" bind:value={q} />
		<div class="mal-chips" role="group" aria-label="Filtrer etter type">
			{#each [['alle', 'Alle'], ['gudstjeneste', 'Gudstjeneste'], ['vigsel', 'Vigsel'], ['gravferd', 'Gravferd']] as [verdi, navn]}
				<button class:sel={typeFilter === verdi} onclick={() => typeFilter = verdi}>{navn}</button>
			{/each}
		</div>
		<div class="mal-chips" role="group" aria-label="Filtrer etter kilde">
			{#each [['alle', 'Alle'], ['originaler', 'Originaler'], ['brukermaler', 'Brukermaler']] as [verdi, navn]}
				<button class:sel={kildeFilter === verdi} onclick={() => kildeFilter = verdi}>{navn}</button>
			{/each}
		</div>
	</div>

	{#if kildeFilter !== 'brukermaler'}
	<div class="malgruppe">
		<div class="sidehead">Originaler</div>
		{#each visOriginaler as t (t.id)}
			<div class="w-mal">
				<span class="w-mal-nm" onclick={() => openTemplate(t.id)} title="Åpne og rediger">{t.name}</span>
				<span class="w-mal-type">{typeNavn[malType(t)]}</span>
				<button onclick={() => eksporterMal(t)} title="Eksporter til Word">Eksportér</button>
				<button onclick={() => openTemplate(t.id)} title="Åpne og rediger">Åpne</button>
			</div>
		{:else}
			<p class="maler-tom">{q || typeFilter !== 'alle' ? 'Ingen treff.' : 'Ingen originalmaler.'}</p>
		{/each}
	</div>
	{/if}

	{#if kildeFilter !== 'originaler'}
	<div class="malgruppe">
		<div class="sidehead">Brukermaler</div>
		{#each visBrukere as t (t.id)}
			<div class="w-mal">
				<span class="w-mal-nm" onclick={() => openTemplate(t.id)} title="Åpne og rediger">{t.name}</span>
				<span class="w-mal-type">{typeNavn[malType(t)]}</span>
				<button onclick={() => eksporterMal(t)} title="Eksporter til Word">Eksportér</button>
				<button onclick={() => openTemplate(t.id)} title="Åpne og rediger">Åpne</button>
				<button class="w-mal-del" onclick={() => slettMal(t)} title="Slett malen">Slett</button>
			</div>
		{:else}
			<p class="maler-tom">{q || typeFilter !== 'alle' ? 'Ingen treff.' : 'Ingen brukermaler ennå.'}</p>
		{/each}
	</div>
	{/if}

	<div class="w-mal-handlinger">
		<button onclick={importerMal}>Importér mal …</button>
		<button onclick={nyLokalMal}>+ Ny lokal mal</button>
	</div>
</div>
