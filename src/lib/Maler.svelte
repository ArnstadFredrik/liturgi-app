<script>
	import { app, openTemplate, persist, uid, registrerÅpenMal } from '$lib/store.svelte.js';
	import { confirmBox, nyLokalMalModal } from '$lib/modal.svelte.js';
	import { loadTemplatesFromDisk, erOriginalMal, deleteTemplateFile, newTemplateOnDisk, importerMalFil } from '$lib/fileio.svelte.js';
	import { exportWord } from '$lib/export.js';
	import { malType } from '$lib/modal.svelte.js';
	import { veksleMalFavoritt, erMalFavoritt } from '$lib/store.svelte.js';
	import { målformLabel, malFormFor, kategoriFor, kategoriSort, KATEGORIER, TYPER } from '$lib/maltyper.js';
	import { mdi } from '$lib/mdi.js';
	import { toast } from 'svelte-sonner';
	import KonverterModal from '$lib/KonverterModal.svelte';
	import FilterDropdown from '$lib/FilterDropdown.svelte';

	const isElectron = typeof window !== 'undefined' && !!window.liturgi?.isElectron;

	let konverterApen = $state(false);

	$effect(() => {
		if (isElectron) loadTemplatesFromDisk();
	});

	const originaler = $derived(app.templates.filter((t) => erOriginalMal(t) || (!isElectron && t.builtinKey?.startsWith('original-'))));
	const brukermaler = $derived(app.templates.filter((t) => !originaler.includes(t)));

	/** Søk + filtre (type/kilde) + sorterbar tabell. */
	let q = $state('');
	let typeSel = $state([]); // multiselect: gudstjeneste | vigsel | gravferd
	let kildeSel = $state([]); // multiselect: originaler | brukermaler
	let katSel = $state([]); // multiselect: KATEGORIER
	function nullstillFiltre() {
		q = '';
		typeSel = [];
		kildeSel = [];
		katSel = [];
	}
	function noenFiltre() {
		return !!(q || typeSel.length || kildeSel.length || katSel.length);
	}

	const typeNavn = { gudstjeneste: 'Gudstjeneste', vigsel: 'Vigsel', gravferd: 'Gravferd' };
	function passer(t) {
		if (q && !t.name.toLowerCase().includes(q.toLowerCase())) return false;
		if (typeSel.length && !typeSel.includes(malType(t))) return false;
		if (kildeSel.length && !kildeSel.includes(erOriginalMal(t) ? 'originaler' : 'brukermaler')) return false;
		if (katSel.length && !katSel.includes(kategoriFor(t))) return false;
		return true;
	}

	/** Tabell: sortbar på kolonne; favoritter først når navn sorteres.
	 *  Standard sortering: kategori i ressursbankens banner-rekkefølge. */
	let sortNokkel = $state('kategori');
	let sortRetn = $state(1);
	const KOLONNER = [
		['fav', ''], ['navn', 'Navn'], ['kategori', 'Kategori'], ['malform', 'Målform'], ['type', 'Type'], ['kilde', 'Kilde']
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
			case 'kategori': return kategoriSort(t);
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

	/** Konverter Word/PDF → mal: åpner konverter-modalen (drag-and-drop + info). */
	function konverterMal() {
		konverterApen = true;
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

	/** Eksportér-knappen: åpner eksportmodulen isolert for malen — ingen
	 *  andre undermoduler; Lukk i sidepanelet returnerer til mal-listen. */
	function aapneIsolertEksport(t) {
		registrerÅpenMal(t, false);
		app.isolertEksport = true;
		app.visning = 'eksport';
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
		<div class="mal-filter-rekke">
			<FilterDropdown label="Type" options={TYPER.map((t) => ({ verdi: t, navn: t[0].toUpperCase() + t.slice(1) }))} bind:selected={typeSel} />
			<FilterDropdown label="Kilde" options={[{ verdi: 'originaler', navn: 'Originaler' }, { verdi: 'brukermaler', navn: 'Brukermaler' }]} bind:selected={kildeSel} />
			<FilterDropdown label="Kategori" options={KATEGORIER.map((k) => ({ verdi: k, navn: k }))} bind:selected={katSel} />
			<button class="filter-nullstill" onclick={nullstillFiltre} disabled={!noenFiltre()} title="Nullstill alle filtre">{@html mdi('filter-variant-remove', 14)} Nullstill</button>
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
						<td class="t-navn" onclick={() => openTemplate(t.id)} title="Åpne og rediger">{t.name}{#if t.wip === true} <span class="wip-merke" title="WIP — uverifisert mal, ikke med i Opprett før den er bekreftet">WIP</span>{/if}</td>
						<td>{kategoriFor(t)}</td>
						<td>{målformLabel(malFormFor(t))}</td>
						<td>{typeNavn[malType(t)]}</td>
						<td>{erOriginalMal(t) ? 'Original' : 'Bruker'}</td>
						<td class="t-handlinger">
							<button onclick={() => aapneIsolertEksport(t)} title="Åpne eksportmodulen for malen">Eksportér</button>
							<button onclick={() => openTemplate(t.id)} title="Åpne og rediger">Åpne</button>
							{#if !erOriginalMal(t)}
								<button class="w-mal-del" onclick={() => slettMal(t)} title="Slett malen">Slett</button>
							{/if}
						</td>
					</tr>
				{:else}
					<tr><td colspan="7" class="maler-tom">{q || typeFilter !== 'alle' || kildeFilter !== 'alle' ? 'Ingen treff.' : 'Ingen maler ennå.'}</td></tr>
				{/each}
			</tbody>
		</table>
	</div>

	<div class="w-mal-handlinger">
		<button onclick={importerMal}>Importér mal …</button>
		<button onclick={konverterMal} title="Konverter en Word- eller PDF-liturgi til mal (heuristisk)">Konverter Word/PDF …</button>
		<button onclick={nyLokalMal}>+ Ny lokal mal</button>
	</div>
</div>

{#if konverterApen}
	<KonverterModal onLukk={() => (konverterApen = false)} />
{/if}
