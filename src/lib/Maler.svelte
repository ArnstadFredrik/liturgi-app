<script>
	import { app, openTemplate, persist, uid } from '$lib/store.svelte.js';
	import { confirmBox, nyLokalMalModal } from '$lib/modal.svelte.js';
	import { loadTemplatesFromDisk, erOriginalMal, deleteTemplateFile, newTemplateOnDisk, importerMalFil } from '$lib/fileio.svelte.js';
	import { exportWord } from '$lib/export.js';
	import { malType } from '$lib/modal.svelte.js';
	import { veksleMalFavoritt, erMalFavoritt } from '$lib/store.svelte.js';
	import { målformLabel, malFormFor } from '$lib/maltyper.js';
	import { mdi } from '$lib/mdi.js';

	const isElectron = typeof window !== 'undefined' && !!window.liturgi?.isElectron;

	$effect(() => {
		if (isElectron) loadTemplatesFromDisk();
	});

	const originaler = $derived(app.templates.filter((t) => erOriginalMal(t) || (!isElectron && t.builtinKey?.startsWith('original-'))));
	const brukermaler = $derived(app.templates.filter((t) => !originaler.includes(t)));

	/** Søk + filtre (type/kilde) + sorterbar tabell. */
	let q = $state('');
	let typeFilter = $state('alle'); // alle | gudstjeneste | vigsel | gravferd
	let kildeFilter = $state('alle'); // alle | originaler | brukermaler

	const typeNavn = { gudstjeneste: 'Gudstjeneste', vigsel: 'Vigsel', gravferd: 'Gravferd' };
	function passer(t) {
		if (q && !t.name.toLowerCase().includes(q.toLowerCase())) return false;
		if (typeFilter !== 'alle' && malType(t) !== typeFilter) return false;
		return true;
	}

	/** Tabell: sortbar på kolonne; favoritter først når navn sorteres. */
	let sortNokkel = $state('navn');
	let sortRetn = $state(1);
	const KOLONNER = [
		['fav', ''], ['navn', 'Navn'], ['malform', 'Målform'], ['type', 'Type'], ['kilde', 'Kilde']
	];
	function settSort(nokkel) {
		if (sortNokkel === nokkel) sortRetn = -sortRetn;
		else { sortNokkel = nokkel; sortRetn = 1; }
	}
	function pil(nokkel) {
		if (sortNokkel !== nokkel) return '';
		return sortRetn === 1 ? '↑' : '↓';
	}
	function sortVerdi(t, nokkel) {
		switch (nokkel) {
			case 'fav': return erMalFavoritt(t.name) ? 1 : 0;
			case 'navn': return (t.name ?? '').toLowerCase();
			case 'malform': return malFormFor(t);
			case 'type': return malType(t);
			case 'kilde': return erOriginalMal(t) ? 'original' : 'bruker';
		}
	}
	const visMal = $derived.by(() => {
		const alle = [...originaler, ...brukermaler].filter(passer);
		return alle.sort((a, b) => {
			const va = sortVerdi(a, sortNokkel);
			const vb = sortVerdi(b, sortNokkel);
			if (va !== vb) return (va < vb ? -1 : 1) * sortRetn;
			// sekundær: navn
			return (a.name ?? '').localeCompare(b.name ?? '', 'no');
		});
	});

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
		nyLokalMalModal(async (name, baseId) => {
			if (!name) return;
			const base = baseId ? app.templates.find((t) => t.id === baseId) : null;
			if (isElectron) {
				await newTemplateOnDisk(name, base?.malForm ?? 'bokmål', base);
			} else {
				const t = {
					id: uid(), kind: 'template', name, malForm: base?.malForm ?? 'bokmål',
					sections: base ? $state.snapshot(base.sections ?? [{ title: 'I. Samling', items: [] }]) : [{ title: 'I. Samling', items: [] }]
				};
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

	<div class="mal-tabell-kort">
		<table class="mal-tabell">
			<thead>
				<tr>
					{#each KOLONNER as [nokkel, navn] (nokkel)}
						<th class:th-fav={nokkel === 'fav'} onclick={() => settSort(nokkel)} title="Sorter">
							{#if nokkel === 'fav'}{@html mdi('star', 13)}{:else}{navn}{/if}{#if sortNokkel === nokkel}<span class="sort-pil">{sortRetn === 1 ? '↑' : '↓'}</span>{/if}
						</th>
					{/each}
					<th class="th-handlinger"></th>
				</tr>
			</thead>
			<tbody>
				{#each visMal as t (t.id)}
					<tr>
						<td class="t-fav">
							<button class="w-mal-fav" class:av={erMalFavoritt(t.name)} title={erMalFavoritt(t.name) ? 'Fjern favoritt' : 'Merk som favoritt'} onclick={() => veksleMalFavoritt(t.name)}>{@html mdi(erMalFavoritt(t.name) ? 'star' : 'star-outline', 15)}</button>
						</td>
						<td class="t-navn" onclick={() => openTemplate(t.id)} title="Åpne og rediger">{t.name}</td>
						<td>{målformLabel(malFormFor(t))}</td>
						<td>{typeNavn[malType(t)]}</td>
						<td>{erOriginalMal(t) ? 'Original' : 'Bruker'}</td>
						<td class="t-handlinger">
							<button onclick={() => eksporterMal(t)} title="Eksporter til Word">Eksportér</button>
							<button onclick={() => openTemplate(t.id)} title="Åpne og rediger">Åpne</button>
							{#if !erOriginalMal(t)}
								<button class="w-mal-del" onclick={() => slettMal(t)} title="Slett malen">Slett</button>
							{/if}
						</td>
					</tr>
				{:else}
					<tr><td colspan="6" class="maler-tom">{q || typeFilter !== 'alle' || kildeFilter !== 'alle' ? 'Ingen treff.' : 'Ingen maler ennå.'}</td></tr>
				{/each}
			</tbody>
		</table>
	</div>

	<div class="w-mal-handlinger">
		<button onclick={importerMal}>Importér mal …</button>
		<button onclick={nyLokalMal}>+ Ny lokal mal</button>
	</div>
</div>
