<script>
	import { bibSearch, bibUserList, bibUserAdd, bibUserUpdate, bibUserDelete, eksporterBibliotek } from '$lib/fileio.svelte.js';
	import { confirmBox } from '$lib/modal.svelte.js';
	import { litHtml } from '$lib/lit.js';

	const isElectron = typeof window !== 'undefined' && !!window.liturgi?.isElectron;

	let q = $state('');
	let originaletreff = $state([]);
	let brukerrader = $state([]);
	let valgt = $state(null);       // valgt brukerrad (objekt)
	let rediger = $state(false);    // skjemamodus (ny eller eksisterende)
	let skjema = $state({ id: null, mappe: '', ledd: '', alt_label: '', tekst: '', tags: '' });

	async function lastRader() {
		try {
			if (!isElectron) return;
			brukerrader = await bibUserList() ?? [];
		} catch (e) {
			console.error('bibUserList feilet:', e);
		}
	}

	$effect(() => { lastRader(); });

	// fuzzy-søk over brukerrader (samme logikk som bibSearch i db.cjs)
	const filtrerteBruker = $derived.by(() => {
		const words = q.toLowerCase().split(/[\s,]+/).filter((w) => w.length >= 2);
		if (!words.length) return brukerrader;
		return brukerrader
			.map((r) => {
				const hay = (r.ledd + ' ' + r.mappe + ' ' + r.tags + ' ' + r.alt_label).toLowerCase();
				let score = 0;
				for (const w of words) if (hay.includes(w)) score++;
				return { r, score };
			})
			.filter((x) => x.score > 0)
			.sort((a, b) => b.score - a.score)
			.map((x) => x.r);
	});

	const mapper = $derived.by(() => {
		const m = new Map();
		for (const r of filtrerteBruker) {
			const k = r.mappe || '(uten mappe)';
			if (!m.has(k)) m.set(k, []);
			m.get(k).push(r);
		}
		return [...m.entries()];
	});

	async function sok() {
		originaletreff = q.trim().length >= 2 ? await bibSearch(q) : [];
	}

	async function nyttLedd() {
		valgt = null;
		rediger = true;
		skjema = { id: null, mappe: '', ledd: '', alt_label: '', tekst: '', tags: '' };
	}

	function velg(r) {
		valgt = r;
		rediger = false;
	}

	function redigerValgt() {
		skjema = { ...valgt };
		rediger = true;
	}

	async function lagre() {
		if (!skjema.ledd.trim()) { alert('Ledd må ha et navn'); return; }
		// $state-proxy kan ikke sendes over IPC — ta en ren kopi
		const kopi = { mappe: skjema.mappe, ledd: skjema.ledd, alt_label: skjema.alt_label, tekst: skjema.tekst, tags: skjema.tags };
		if (skjema.id) {
			await bibUserUpdate(skjema.id, kopi);
			await lastRader();
			valgt = brukerrader.find((r) => r.id === skjema.id) ?? null;
			rediger = false;
		} else {
			const id = await bibUserAdd(kopi);
			await lastRader();
			valgt = brukerrader.find((r) => r.id === id) ?? null;
			rediger = false;
		}
	}

	function slett(r) {
		confirmBox('Slett', `Slette «${r.ledd}» fra biblioteket?`, async () => {
			await bibUserDelete(r.id);
			if (valgt?.id === r.id) { valgt = null; rediger = false; }
			await lastRader();
		});
	}

	const forhvisning = $derived(litHtml(skjema.tekst || ''));

	/** Sett inn rollemerke (linjeprefiks) ved markøren i tekstfeltet. */
	function settInnRolle(event, rolle) {
		const ta = document.getElementById('biblio-tekst');
		if (!ta) return;
		const pos = ta.selectionStart ?? ta.value.length;
		const før = ta.value.slice(0, pos);
		const etter = ta.value.slice(ta.selectionEnd ?? pos);
		// allerede et rollemerke på linjen? bytt det
		const linjeStart = før.lastIndexOf('\n') + 1;
		const linje = før.slice(linjeStart);
		const utenRolle = linje.replace(/^(L|ML|M|A|KA|K|L\/ML|ML\/L|L\/M|KA\/L)\s*\|\s?/, '');
		const nyTekst = før.slice(0, linjeStart) + rolle + ' | ' + utenRolle + etter;
		skjema.tekst = nyTekst;
		settMarkør(ta, linjeStart + rolle.length + 3);
		event?.preventDefault?.();
	}

	function settMarkør(ta, pos) {
		requestAnimationFrame(() => {
			ta.focus();
			ta.setSelectionRange(pos, pos);
		});
	}

	const ROLLER = ['L', 'ML', 'M', 'A', 'L/ML'];
</script>

<div id="biblio-side">
	<div id="biblio-hode">
		<h2>Bibliotek</h2>
		<p class="maler-ingress">
			Søk i originalene og dine egne ledd, og legg inn nytt innhold. Eget innhold
			organiseres i mapper og tagger, og røres ikke av «Regenerer biblioteket».
		</p>
		<div class="biblio-sok">
			<input bind:value={q} oninput={sok} placeholder='Søk, f.eks. «forbønn» eller «sanctus» …' spellcheck="false" />
			<button onclick={nyttLedd}>+ Nytt ledd</button>
			{#if isElectron && brukerrader.length}
				<button onclick={() => eksporterBibliotek(brukerrader)} title="Eksporter alt eget innhold til JSON">Eksportér eget innhold</button>
			{/if}
		</div>
	</div>

	{#if !isElectron}
		<p class="maler-ingress">Biblioteket gjelder kun Mac-appen (SQLite).</p>
	{:else}
		<div id="biblio-kolonner">
			<div id="biblio-liste">
				{#if filtrerteBruker.length}
					<div class="sidehead">Mine ledd</div>
					{#each mapper as [mappe, rader] (mappe)}
						<div class="biblio-mappe">
							<div class="sidehead biblio-mappe-navn">🗂 {mappe}</div>
							{#each rader as r (r.id)}
								<button type="button" class="m-bib-gruppe biblio-rad" class:sel={valgt?.id === r.id} onclick={() => velg(r)}>
									<span class="m-bib-ledd">{r.ledd}{r.alt_label ? ' · ' + r.alt_label : ''}</span>
									{#if r.tags}<span class="m-bib-antall">{r.tags}</span>{/if}
								</button>
							{/each}
						</div>
					{/each}
				{/if}
				{#if originaletreff.length}
					<div class="sidehead">Fra originalene</div>
					{#each originaletreff as r, i (i)}
						<div class="m-bib-gruppe biblio-rad statisk">
							<span class="m-bib-ledd">{r.ledd}{r.alt_label ? ' · ' + r.alt_label : ''}</span>
							<span class="m-bib-antall">{r.kilde}</span>
						</div>
					{/each}
				{/if}
				{#if !filtrerteBruker.length && !originaletreff.length}
					<p class="maler-ingress">{q ? 'Ingen treff.' : 'Ingen egne ledd ennå — bruk «+ Nytt ledd».'}</p>
				{/if}
			</div>

			<div id="biblio-detalj">
				{#if rediger}
					<div class="biblio-kort">
						<div class="biblio-kort-hode">
							<span class="sidehead">{skjema.id ? 'Rediger ledd' : 'Nytt ledd'}</span>
						</div>
						<label class="biblio-felt"><span>Mappe</span>
							<input bind:value={skjema.mappe} placeholder="F.eks. «Forbønner» eller «Bakke og Gyland»" spellcheck="false" list="biblio-mapper" />
							<datalist id="biblio-mapper">
								{#each [...new Set(brukerrader.map((r) => r.mappe).filter(Boolean))] as m (m)}<option value={m} />{/each}
							</datalist>
						</label>
						<div class="biblio-rad2">
							<label class="biblio-felt"><span>Ledd</span>
								<input bind:value={skjema.ledd} placeholder="Navnet på leddet" spellcheck="false" />
							</label>
							<label class="biblio-felt"><span>Alternativ</span>
								<input bind:value={skjema.alt_label} placeholder="Valgfri etikett" spellcheck="false" />
							</label>
						</div>
						<label class="biblio-felt"><span>Tagger (kommaseparert)</span>
							<input bind:value={skjema.tags} placeholder="F.eks. «advent, høymesse»" spellcheck="false" />
						</label>
						<label class="biblio-felt"><span>Tekst</span>
							<div class="biblio-verktøy" role="toolbar" aria-label="Rollemerker">
								{#each ROLLER as rolle (rolle)}
									<button type="button" class="biblio-rolle-btn" onclick={(e) => settInnRolle(e, rolle)}
										title={'Sett inn ' + rolle + '-rolle på linjen'}>{rolle} |</button>
								{/each}
								<span class="biblio-md-hint">Markdown: **fet**, *urskrift*, # overskrift, - punkt</span>
							</div>
							<textarea id="biblio-tekst" bind:value={skjema.tekst} rows="12" spellcheck="false"
								placeholder={'L | La oss alle be.\\n\\n**Tema:** *advent*\\n- Bønnopunkt ett\\n- Bønnopunkt to'}></textarea>
						</label>
						{#if skjema.tekst}
							<div class="sidehead">Forhåndsvisning</div>
							<div class="lit-text biblio-forhvisning">{@html forhvisning}</div>
						{/if}
						<div class="w-mal-handlinger">
							<button class="primary" onclick={lagre}>{skjema.id ? 'Lagre endringer' : 'Legg inn i biblioteket'}</button>
							<button onclick={() => { rediger = false; }}>Avbryt</button>
						</div>
					</div>
				{:else if valgt}
					<div class="biblio-kort">
						<div class="biblio-kort-hode">
							<div>
								<div class="biblio-tittel">{valgt.ledd}{valgt.alt_label ? ' · ' + valgt.alt_label : ''}</div>
								<p class="maler-ingress">🗂 {valgt.mappe || '(uten mappe)'}{valgt.tags ? ' · ' + valgt.tags : ''}</p>
							</div>
						</div>
						<div class="lit-text biblio-forhvisning">{@html litHtml(valgt.tekst)}</div>
						<div class="w-mal-handlinger">
							<button onclick={redigerValgt}>Endre</button>
							<button class="w-mal-del" onclick={() => slett(valgt)}>Slett</button>
						</div>
					</div>
				{:else}
					<div class="biblio-kort biblio-tom">
						<p class="maler-ingress">Velg et ledd i listen, eller lag et nytt.</p>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
