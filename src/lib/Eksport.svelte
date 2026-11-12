<script>
	import { app, markDirty } from '$lib/store.svelte.js';
	import { exportWord, nlDate, safeName } from '$lib/export.js';
	import { toast } from 'svelte-sonner';

	const isElectron = typeof window !== 'undefined' && !!window.liturgi?.isElectron;

	const INNBYGGET = ['Prest', 'Medarbeider', 'Menighet'];
	const PREKEN_RE = /preken|preker|tale|andakt|formidling|homili/i;

	let egneProfiler = $state([]);   // egendefinerte profilnavn (i databasen)
	let aktiv = $state('Prest');
	let valg = $state({});          // svc.eksportValg-mirror: { profil: { nokkel: bool } }
	let eksporterer = $state(false);
	let nyProfilNavn = $state('');

	$effect(() => {
		if (isElectron) {
			window.liturgi.dbGet('eksportProfiler').then((r) => {
				if (r?.ok && Array.isArray(r.value)) egneProfiler = r.value;
			});
		}
	});

	const o = $derived(app.current);
	const profiler = $derived(['Prest', 'Medarbeider', 'Menighet', ...egneProfiler]);
	const datoTekst = $derived(o?.date ? nlDate(o.date) : '');

	function nokkel(si, ii) { return si + ':' + ii; }

	/** Standardmarkering per profil. */
	function standard(it) {
		if (aktiv === 'Medarbeider') return !PREKEN_RE.test(it.heading || '');
		if (aktiv === 'Menighet') {
			if (it.type === 'salme') return true;
			const tekst = (it.alts?.length ? it.alts[it.selAlt ?? 0]?.text ?? '' : it.text) || '';
			// ledd med A-rollen (A |, M/A | osv.) eller {{r}}A
			return /(^|\n)\s*(?:[A-Z]+\/)?A\s*\|/.test(tekst) || /\{\{r\}\}A/.test(tekst);
		}
		return true; // Prest og egne profiler: alt med
	}

	/** Er leddet med i den aktive profilen? */
	function erMed(si, ii, it) {
		const v = valg[aktiv]?.[nokkel(si, ii)];
		if (v !== undefined) return v;
		return standard(it);
	}

	function sett(si, ii, m) {
		if (!valg[aktiv]) valg[aktiv] = {};
		valg[aktiv][nokkel(si, ii)] = m;
		// speil til dokumentet så valgene følger gudstjenesten
		if (o) {
			o.eksportValg = o.eksportValg ?? {};
			o.eksportValg[aktiv] = { ...valg[aktiv] };
		}
		markDirty();
	}

	/** Gjenopprett valg fra dokumentet når aktiv profil bytter. */
	function lastValg() {
		if (o?.eksportValg?.[aktiv]) {
			valg[aktiv] = { ...o.eksportValg[aktiv] };
		} else {
			delete valg[aktiv]; // fallback til standardmarkering
		}
	}

	function byttProfil(p) {
		aktiv = p;
		lastValg();
	}

	function lagEgenProfil() {
		const navn = nyProfilNavn.trim();
		if (!navn) return;
		if (profiler.some((p) => p.toLowerCase() === navn.toLowerCase())) { alert('Det finnes allerede en profil med det navnet'); return; }
		egneProfiler.push(navn);
		if (isElectron) window.liturgi.dbSet('eksportProfiler', [...egneProfiler]);
		nyProfilNavn = '';
		byttProfil(navn);
	}

	function slettEgenProfil(p) {
		egneProfiler = egneProfiler.filter((x) => x !== p);
		if (isElectron) window.liturgi.dbSet('eksportProfiler', [...egneProfiler]);
		if (aktiv === p) byttProfil('Prest');
	}

	function klonMedValg(svc) {
		// dyp kopi med bare valgte ledd aktivert for aktiv profil
		const kopi = JSON.parse(JSON.stringify(svc));
		kopi.sections?.forEach((sec, si) => {
			sec.items?.forEach((it, ii) => {
				it.enabled = erMed(si, ii, it);
			});
		});
		return kopi;
	}

	async function eksporter() {
		if (!o) return;
		eksporterer = true;
		try {
			let n = 0;
			for (const p of profiler) {
				aktiv = p;
				lastValg();
				const kopi = klonMedValg(o);
				const harInnhold = kopi.sections?.some((sec) => sec.items?.some((it) => it.enabled));
				if (!harInnhold) continue;
				const filnavn = safeName([o.date ?? '', o.name ?? '', p].filter(Boolean).join(' - ')) + '.docx';
				await exportWord(kopi, o.visInstr ?? true, filnavn);
				n++;
			}
			toast.success(n === 1 ? 'Eksportert 1 fil' : 'Eksportert ' + n + ' filer');
		} catch (e) {
			toast.error('Klarte ikke eksportere: ' + e.message);
		} finally {
			eksporterer = false;
		}
	}
</script>

<div id="eksport-side">
	<h2>Eksport</h2>
	{#if !o || app.kind !== 'service'}
		<p class="eksport-ingress">Åpne en gudstjeneste for å eksportere den.</p>
	{:else}
		<p class="eksport-ingress">
			<strong>{o.name}</strong>{o.date ? ` · ${datoTekst}` : ''} — velg profil, juster leddene som skal med, og eksportér.
			Filnavn: <code>{o.date ?? ''} - {o.name} - [profil].docx</code>
		</p>

		<div class="eksport-profiler">
			{#each profiler as p (p)}
				<button class="eksport-profil" class:sel={aktiv === p} onclick={() => byttProfil(p)}>
					{p}
				</button>
				{#if !INNBYGGET.includes(p)}
					<button class="eksport-profil-slett" title="Slett profilen" onclick={() => slettEgenProfil(p)}>×</button>
				{/if}
			{/each}
		</div>
		<div class="eksport-nyprofil">
			<input bind:value={nyProfilNavn} placeholder="Nytt profilnavn …" spellcheck="false" onkeydown={(e) => e.key === 'Enter' && lagEgenProfil()} />
			<button onclick={lagEgenProfil}>+ Legg til profil</button>
		</div>

		<div class="eksport-kolonner">
			<div class="eksport-liste">
				{#each o.sections as sec, si (si)}
					<div class="sidehead eksport-seksjon">{sec.title}</div>
					{#each sec.items as it, ii (nokkel(si, ii))}
						<label class="eksport-rad" class:med={erMed(si, ii, it)}>
							<input type="checkbox" checked={erMed(si, ii, it)} onchange={(e) => sett(si, ii, e.currentTarget.checked)} />
							<span class="eksport-rad-nm">{it.heading || it.type}</span>
							{#if it.type === 'salme'}<span class="eksport-tag">salme</span>{/if}
						</label>
					{/each}
				{/each}
			</div>
		</div>

		<div class="eksport-handling">
			<button class="primary" onclick={eksporter} disabled={eksporterer}>
				{eksporterer ? 'Eksporterer …' : 'Eksportér alle profilene'}
			</button>
			<span class="maler-ingress">Én Word-fil per profil, navngitt [dato] - [navn] - [profil].</span>
		</div>
	{/if}
</div>
