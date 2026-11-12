<script>
	import { app, markDirty } from '$lib/store.svelte.js';
	import { saveCurrent } from '$lib/fileio.svelte.js';
	import { exportWord, exportPptx, buildPdfBase64, nlDate, safeName } from '$lib/export.js';
	import { lookupKirkeaar } from '$lib/kirkeaar.js';
	import { prompt } from '$lib/modal.svelte.js';
	import { litHtml } from '$lib/lit.js';
	import { mdi } from '$lib/mdi.js';
	import { toast } from 'svelte-sonner';

	const isElectron = typeof window !== 'undefined' && !!window.liturgi?.isElectron;

	const INNBYGGET = ['Prest', 'Medarbeider', 'Menighet'];
	const PREKEN_RE = /preken|preker|tale|andakt|formidling|homili/i;
	const LESNING_RE = /lesning|evangelium/i;

	let egneProfiler = $state([]);   // egendefinerte profilnavn (i databasen)
	let aktiv = $state('Prest');
	let valg = $state({});           // per profil per dokument: { nokkel: bool }
	let visInnhold = $state(false);
	let formater = $state({ word: true, pptx: false, pdf: false });
	let appFormater = $state({ word: true, pptx: false, pdf: false }); // app-standard (DB)
	let tomSlide = $state(false);
	let eksporterer = $state(false);
	let nyProfilNavn = $state('');

	$effect(() => {
		// app-standard for formater (DB), brukes når dokumentet ikke har egne valg
		if (isElectron) {
			window.liturgi.dbGet('eksportFormater').then((r) => {
				if (r?.ok && r.value && typeof r.value === 'object') appFormater = r.value;
			});
			window.liturgi.dbGet('eksportProfiler').then((r) => {
				if (r?.ok && Array.isArray(r.value)) egneProfiler = r.value;
			});
		}
		if (o) {
			tomSlide = o.eksportTomSlide ?? false;
			// dokumentets egne formater-valg, ellers app-standard
			const egne = o.eksportFormater;
			formater = egne ?? { ...appFormater };
			// lagrede leddvalg per profil (persistert i .liturgi-filen)
			if (o.eksportValg) valg = JSON.parse(JSON.stringify(o.eksportValg));
		}
		// hurtigeksport fra høyremenyen
		if (typeof window !== 'undefined' && window.__eksportKunAktiv) {
			window.__eksportKunAktiv = false;
			setTimeout(() => eksporterKunAktiv(), 300);
		}
	});

	const o = $derived(app.current);
	const profiler = $derived(['Prest', 'Medarbeider', 'Menighet', ...egneProfiler]);
	const datoTekst = $derived(o?.date ? nlDate(o.date) : '');

	function nokkel(si, ii) { return si + ':' + ii; }

	function erLesning(it) { return LESNING_RE.test(it.heading || ''); }

	/** Standardmarkering per profil. */
	function standard(it) {
		if (aktiv === 'Medarbeider') return !PREKEN_RE.test(it.heading || '');
		if (aktiv === 'Menighet') {
			if (it.type === 'salme') return true;
			if (erLesning(it)) return true; // bibellesingene er med (kun referanse som standard)
			const tekst = (it.alts?.length ? it.alts[it.selAlt ?? 0]?.text ?? '' : it.text) || '';
			// ledd med A-rollen (A |, M/A | osv.) eller {{r}}A
			return /(^|\n)\s*(?:[A-Z]+\/)?A\s*\|/.test(tekst) || /\{\{r\}\}A/.test(tekst);
		}
		return true;
	}

	/** Innstillinger for aktiv profil (per dokument). */
	function profInnst() {
		return o?.eksportInnst?.[aktiv] ?? {};
	}

	function setInnst(k, v) {
		if (!o) return;
		o.eksportInnst = o.eksportInnst ?? {};
		o.eksportInnst[aktiv] = { ...profInnst(), [k]: v };
		markDirty();
	}

	function getInnst(k, def) {
		if (o?.eksportInnst?.[aktiv]?.[k] !== undefined) return o.eksportInnst[aktiv][k];
		if (k === 'kolonner') return aktiv === 'Menighet' ? 2 : 1;
		if (k === 'storrelse') return 'A5';
		if (k === 'bibel') return aktiv === 'Menighet' ? 'ref' : 'full';
		return def;
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
		if (o) {
			o.eksportValg = o.eksportValg ?? {};
			o.eksportValg[aktiv] = { ...valg[aktiv] };
		}
		markDirty();
	}

	function byttProfil(p) {
		aktiv = p;
		if (o?.eksportValg?.[aktiv]) valg[aktiv] = { ...o.eksportValg[aktiv] };
		else delete valg[aktiv];
	}

	function lagEgenProfil() {
		prompt('Ny profil', 'Navn på profilen', (navn) => {
			if (!navn?.trim()) return;
			if (profiler.some((p) => p.toLowerCase() === navn.toLowerCase())) { alert('Det finnes allerede en profil med det navnet'); return; }
			egneProfiler.push(navn);
			if (isElectron) window.liturgi.dbSet('eksportProfiler', [...egneProfiler]);
			byttProfil(navn);
		});
	}

	function slettEgenProfil(p) {
		egneProfiler = egneProfiler.filter((x) => x !== p);
		if (isElectron) window.liturgi.dbSet('eksportProfiler', [...egneProfiler]);
		if (aktiv === p) byttProfil('Prest');
	}

	function settFormater(k, v) {
		formater = { ...formater, [k]: v };
		if (o) { o.eksportFormater = { ...formater }; }
		markDirty();
	}

	/** Lagre gjeldende formatvalg som app-standard (gjelder nye dokumenter). */
	function lagreStandardFormater() {
		appFormater = { ...formater };
		if (isElectron) window.liturgi.dbSet('eksportFormater', { ...formater });
		toast.success('Formatvalgene er lagret som app-standard');
	}

	function settTomSlide(v) {
		tomSlide = v;
		if (o) { o.eksportTomSlide = v; }
		markDirty();
	}

	/** Standardmarkering uavhengig av aktiv fane (brukes ved kloning). */
	function standardFor(profil, it) {
		if (profil === 'Medarbeider') return !PREKEN_RE.test(it.heading || '');
		if (profil === 'Menighet') {
			if (it.type === 'salme') return true;
			if (erLesning(it)) return true;
			const tekst = (it.alts?.length ? it.alts[it.selAlt ?? 0]?.text ?? '' : it.text) || '';
			return /(^|\n)\s*(?:[A-Z]+\/)?A\s*\|/.test(tekst) || /\{\{r\}\}A/.test(tekst);
		}
		return true;
	}

	/** Kopi av gudstjenesten med bare valgte ledd aktivert for en profil. */
	function klonMedValg(svc, profil) {
		const kopi = JSON.parse(JSON.stringify(svc));
		// lagrede valg i filen går foran øktens midlertidige valg
		const lagret = valg[profil] ?? o?.eksportValg?.[profil];
		kopi.sections?.forEach((sec, si) => {
			sec.items?.forEach((it, ii) => {
				const original = svc.sections?.[si]?.items?.[ii];
				// «Fjern fra gudstjenesten» i kontekstmenyen gjelder også for eksport
				if (original && original.enabled === false) { it.enabled = false; return; }
				const v = lagret?.[nokkel(si, ii)];
				it.enabled = v !== undefined ? v : standardFor(profil, it);
			});
		});
		return kopi;
	}

	/** Kun bibelreferansen for lesningene (Word/PDF). Kjenner tre former: FOTNOTE-linjen,
	 *  «står skrevet i/hos [ref]:»-innledningen og malenes egen konvensjon med referansen
	 *  som siste linje (f.eks. «Sal 68,21»). Uten kjent referanse beholdes teksten. */
	function kunReferanse(svc) {
		const kopi = JSON.parse(JSON.stringify(svc));
		// kirkeårets referanser til lesningene (for ledd uten referanse i teksten)
		const k = svc?.date ? lookupKirkeaar(svc.date) : null;
		const kkRefs = k ? { første: k.L1, andre: k.L2, evangelium: k.E } : {};
		const finnRef = (tekst) => {
			if (!tekst) return null;
			const fn = tekst.match(/^FOTNOTE \| ?(.*)$/m);
			if (fn) return fn[1].trim();
			const intro = tekst.match(/står skrevet (?:i\/hos|i|hos) ([^:\n]+):/);
			if (intro && /\d/.test(intro[1])) return intro[1].trim();
			// siste linje som ligner en referanse (kort, uten rollemerk/skille/tegnsetting, med tall)
			const linjer = tekst.split('\n').map((l) => l.trim()).filter(Boolean);
			const siste = linjer.at(-1) ?? '';
			if (linjer.length > 1 && /^[^|:;.!?]{1,30}$/.test(siste) && /[,0-9]/.test(siste)) return siste;
			return null;
		};
		for (const sec of kopi.sections ?? []) {
			for (const it of sec.items ?? []) {
				if (!erLesning(it) || !it.enabled) continue;
				// ingress-leddene er prestens forord — røres ikke
				if ((it.heading || '').toLowerCase().includes('ingress')) continue;
				let ref = null;
				if (it.alts?.length) {
					for (const alt of it.alts) {
						ref = finnRef(alt.text);
						if (ref) alt.text = ref;
					}
				} else {
					ref = finnRef(it.text);
					if (ref) it.text = ref;
				}
				// leddet har ingen referanse i teksten — slå opp kirkeårets referanse
				// (Første/Andre lesning/Evangelium ↔ L1/L2/E), f.eks. B&G-malen
				if (!ref) {
					const h = (it.heading || '').toLowerCase();
					const kkr = h.includes('evangelium') ? kkRefs?.evangelium : h.includes('andre') ? kkRefs?.andre : h.includes('første') ? kkRefs?.første : null;
					if (kkr) {
						if (it.alts?.length) for (const alt of it.alts) alt.text = kkr;
						else it.text = kkr;
					}
				}
			}
		}
		return kopi;
	}

	function baseNavn(profil) {
		return safeName([o?.date ?? '', o?.name ?? '', profil].filter(Boolean).join(' - '));
	}

	async function eksporterProfil(profil) {
		const base = baseNavn(profil);
		let n = 0;
		if (formater.word) {
			let kopi = klonMedValg(o, profil);
			if (getInnst('bibel', 'ref') === 'ref') kopi = kunReferanse(kopi);
			const res = await exportWord(kopi, o.visInstr ?? true, base + '.docx', {
				storrelse: getInnst('storrelse', 'A5'),
				kolonner: getInnst('kolonner', 1)
			}, isElectron);
			if (res) {
				const r = await window.liturgi.lagrePdf(res.base64, res.filnavn, o.filePath);
				if (r.ok) { toast.success(res.filnavn + ' → ' + r.filePath); n++; }
				else toast.error('Klarte ikke lagre: ' + (r.error ?? 'ukjent feil'));
			} else n++;
		}
		if (formater.pptx) {
			// PowerPoint følger Menighet-utvalget og har alltid full bibeltekst
			const kopi = klonMedValg(o, 'Menighet');
			const res = await exportPptx(kopi, { tomSlide }, isElectron);
			if (res) {
				const r = await window.liturgi.lagrePdf(res.base64, res.filnavn, o.filePath);
				if (r.ok) { toast.success(res.filnavn + ' → ' + r.filePath); n++; }
				else toast.error('Klarte ikke lagre: ' + (r.error ?? 'ukjent feil'));
			} else n++;
		}
		if (formater.pdf && isElectron) {
			let kopi = klonMedValg(o, profil);
			if (getInnst('bibel', 'ref') === 'ref') kopi = kunReferanse(kopi);
			const { base64 } = buildPdfBase64(kopi, o.visInstr ?? true, {
				storrelse: getInnst('storrelse', 'A5'),
				kolonner: getInnst('kolonner', 1)
			});
			const r = await window.liturgi.lagrePdf(base64, base + '.pdf', o.filePath);
			if (r.ok) { toast.success('PDF: ' + r.filePath); n++; }
			else toast.error('Klarte ikke lagre PDF: ' + (r.error ?? 'ukjent feil'));
		}
		return n;
	}

	async function eksporterAlle() {
		if (!o) return;
		eksporterer = true;
		try {
			let n = 0;
			for (const p of profiler) n += await eksporterProfil(p);
			if (n) toast.success(n === 1 ? 'Eksportert 1 fil' : 'Eksportert ' + n + ' filer');
		} catch (e) {
			toast.error('Klarte ikke eksportere: ' + e.message);
		} finally {
			eksporterer = false;
		}
	}

	async function eksporterKunAktiv() {
		if (!o) return;
		eksporterer = true;
		try {
			const n = await eksporterProfil(aktiv);
			if (n) toast.success('Eksportert «' + aktiv + '»');
		} catch (e) {
			toast.error('Klarte ikke eksportere: ' + e.message);
		} finally {
			eksporterer = false;
		}
	}
</script>

<div id="eksport-side">
	<h2>
		<button class="eks-tilbake" title="Tilbake til redigering" onclick={() => { app.visning = 'editor'; }}>←</button>
		Eksport
		<button class="eks-lagre" title="Lagre gudstjenesten med eksportvalgene" onclick={() => saveCurrent()}>{@html mdi('content-save')} Lagre</button>
	</h2>
	{#if !o || app.kind !== 'service'}
		<p class="eksport-ingress">Åpne en gudstjeneste for å eksportere den.</p>
	{:else}
		<p class="eksport-ingress">
			<strong>{o.name}</strong>{o.date ? ` · ${datoTekst}` : ''} — velg profil til høyre, juster leddene som skal med, og eksportér.
		</p>

		<div class="eksport-kolonner">
			<div class="eksport-liste">
				{#each o.sections as sec, si (si)}
					<div class="sidehead eksport-seksjon">{sec.title}</div>
					{#each sec.items as it, ii (nokkel(si, ii))}
						<div class="eksport-rad" class:med={erMed(si, ii, it)} class:deaktivert={it.enabled === false}>
							{#if it.enabled === false}
								<span class="eksport-fjernet-tag" title="Fjernet fra gudstjenesten i kontekstmenyen — kommer ikke med i eksport">fjernet</span>
							{:else}
								<input type="checkbox" checked={erMed(si, ii, it)} onchange={(e) => sett(si, ii, e.currentTarget.checked)} />
							{/if}
							<div class="eksport-rad-tekst">
								<span class="eksport-rad-nm">{it.heading || it.type}{it.type === 'salme' && (it.salmeNr || it.salmeTittel) ? ': ' + [it.salmeNr, it.salmeTittel].filter(Boolean).join(' ') : ''}</span>
								{#if visInnhold && it.enabled !== false}
									<div class="eksport-innhold lit-text">{@html litHtml((it.alts?.length ? it.alts[it.selAlt ?? 0]?.text : it.text) || '*Ingen innhold*')}</div>
								{/if}
							</div>
							{#if it.type === 'salme' && it.enabled !== false}<span class="eksport-tag">salme</span>{/if}
							{#if it.enabled !== false && erLesning(it) && aktiv === 'Menighet'}<span class="eksport-tag">lesning</span>{/if}
						</div>
					{/each}
				{/each}
			</div>

			<div id="eksport-hoyre">
				<div class="biblio-kort">
					<div class="biblio-kort-hode"><span class="sidehead">Visning</span></div>
					<label class="eksport-chk"><input type="checkbox" bind:checked={visInnhold} /> Vis leddinnhold</label>
				</div>
				<div class="biblio-kort">
					<div class="biblio-kort-hode"><span class="sidehead">Profiler</span></div>
					<div class="eksport-profiler">
						{#each profiler as p (p)}
							<button class="eksport-profil" class:sel={aktiv === p} onclick={() => byttProfil(p)}>{p}</button>
							{#if !INNBYGGET.includes(p)}
								<button class="eksport-profil-slett" title="Slett profilen" onclick={() => slettEgenProfil(p)}>×</button>
							{/if}
						{/each}
					</div>
					<button class="wide" onclick={lagEgenProfil}>+ Ny profil</button>
				</div>

				<div class="biblio-kort">
					<div class="biblio-kort-hode"><span class="sidehead">Innstillinger for «{aktiv}»</span></div>
					<div class="eksport-innst-gruppe">
						<span class="sidehead">Format</span>
						<label class="eksport-chk"><input type="checkbox" checked={formater.word} onchange={(e) => settFormater('word', e.currentTarget.checked)} /> Word (.docx)</label>
						<label class="eksport-chk"><input type="checkbox" checked={formater.pdf} onchange={(e) => settFormater('pdf', e.currentTarget.checked)} /> PDF (til filsystemet)</label>
						<hr class="eksport-skiller" />
						<label class="eksport-chk"><input type="checkbox" checked={formater.pptx} onchange={(e) => settFormater('pptx', e.currentTarget.checked)} /> PowerPoint (skjerm)</label>
						{#if formater.pptx}
							<label class="eksport-chk"><input type="checkbox" checked={tomSlide} onchange={(e) => settTomSlide(e.currentTarget.checked)} /> Blank side mellom leddene (PowerPoint)</label>
						{/if}
						<button class="wide eksport-standard-btn" title="Lagre formatvalgene som app-standard" onclick={lagreStandardFormater}>Sett som standard</button>
					</div>
					<div class="eksport-innst-gruppe">
						<span class="sidehead">Sidestørrelse (Word/PDF)</span>
						<label class="eksport-chk"><input type="radio" name="st" checked={getInnst('storrelse', 'A5') === 'A4'} onchange={() => setInnst('storrelse', 'A4')} /> A4</label>
						<label class="eksport-chk"><input type="radio" name="st" checked={getInnst('storrelse', 'A5') === 'A5'} onchange={() => setInnst('storrelse', 'A5')} /> A5</label>
					</div>
					<div class="eksport-innst-gruppe">
						<span class="sidehead">Kolonner (Word/PDF)</span>
						<label class="eksport-chk"><input type="radio" name="ko" checked={getInnst('kolonner', 1) === 1} onchange={() => setInnst('kolonner', 1)} /> Én kolonne</label>
						<label class="eksport-chk"><input type="radio" name="ko" checked={getInnst('kolonner', 1) === 2} onchange={() => setInnst('kolonner', 2)} /> To kolonner</label>
					</div>
					<div class="eksport-innst-gruppe">
						<span class="sidehead">Bibellesninger</span>
						<label class="eksport-chk"><input type="radio" name="bb" checked={getInnst('bibel', 'ref') === 'ref'} onchange={() => setInnst('bibel', 'ref')} /> Kun bibelreferansen</label>
						<label class="eksport-chk"><input type="radio" name="bb" checked={getInnst('bibel', 'full') === 'full'} onchange={() => setInnst('bibel', 'full')} /> Med hele bibelteksten</label>
						<p class="maler-ingress" style="margin:0">PowerPoint har alltid hele bibelteksten.</p>
					</div>
				</div>

				<div class="biblio-kort">
					<div class="eksport-handling">
						<button class="primary" onclick={eksporterAlle} disabled={eksporterer}>
							{eksporterer ? 'Eksporterer …' : 'Eksportér alle profilene'}
						</button>
						<button onclick={eksporterKunAktiv} disabled={eksporterer}>Eksportér kun «{aktiv}»</button>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
