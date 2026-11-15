<script>
	import { app, markDirty } from '$lib/store.svelte.js';
	import { saveCurrent } from '$lib/fileio.svelte.js';
	import { exportWord, exportPptx, buildPdfBase64, nlDate, safeName } from '$lib/export.js';
	import { lookupKirkeaar } from '$lib/kirkeaar.js';
	import { prompt } from '$lib/modal.svelte.js';
	import { litHtml, leddTekst } from '$lib/lit.js';
	import { mdi } from '$lib/mdi.js';
	import { toast } from 'svelte-sonner';

	const isElectron = typeof window !== 'undefined' && !!window.liturgi?.isElectron;

	const INNBYGGET = ['Prest', 'Medarbeider', 'Menighet'];
	const PREKEN_RE = /preken|preker|tale|andakt|formidling|homili/i;
	const LESNING_RE = /lesning|evangelium/i;

	let egneProfiler = $state([]);   // egendefinerte profilnavn (i databasen)
	let aktiv = $state('Prest');
	let valg = $state({});           // per profil per dokument: { nokkel: bool }
	let visInnhold = $derived(app.eksVisInnhold);
	let formater = $state({ word: true, pptx: false, pdf: false });
	let appFormater = $state({ word: true, pptx: false, pdf: false }); // app-standard (DB)
	let tomSlide = $state(false);
	let eksporterer = $state(false);
	let nyProfilNavn = $state('');
	let zoomNivå = $state(1); // kun visning (lagres i lokalStorage)
	try { zoomNivå = +(localStorage.getItem('eks-zoom') ?? 1) || 1; } catch {}
	function zoom(v) {
		zoomNivå = v;
		try { localStorage.setItem('eks-zoom', String(v)); } catch {}
	}
	// pinch-to-zoom (trackpad) + dra for å panorere i visningen
	function pinnehendelse(node) {
		let avstand = null;
		let start = null; // {x, y, scrollX, scrollY} for panning
		const bruk = (e) => e.ctrlKey || e.metaKey;
		function ned(e) {
			// pinch start (ctrl/meta + wheel håndteres på wheel) — trackpad-pinch gir ctrl+wheel
			if (e.pointerType === 'touch' && e.isPrimary) {
				start = { x: e.clientX, y: e.clientY, sx: node.scrollLeft, sy: node.scrollTop };
			}
		}
		function flytt(e) {
			if (e.pointerType === 'touch' && start) {
				node.scrollLeft = start.sx - (e.clientX - start.x);
				node.scrollTop = start.sy - (e.clientY - start.y);
			}
		}
		function opp() { start = null; avstand = null; }
		const hjul = (e) => {
			if (!bruk(e)) return; // vanlig scroll skal forbli vanlig scroll
			e.preventDefault();
			zoom(Math.min(2.5, Math.max(0.4, zoomNivå * (1 - e.deltaY * 0.004))));
		};
		node.addEventListener('wheel', hjul, { passive: false });
		node.addEventListener('pointerdown', ned);
		node.addEventListener('pointermove', flytt);
		node.addEventListener('pointerup', opp);
		node.addEventListener('pointercancel', opp);
		return { destroy() {
			node.removeEventListener('wheel', hjul);
			node.removeEventListener('pointerdown', ned);
			node.removeEventListener('pointermove', flytt);
			node.removeEventListener('pointerup', opp);
			node.removeEventListener('pointercancel', opp);
		} };
	}
	// manuell fontstørrelse per profil (pt, lagres som skala i eksportInnst)
	const grunnPt = { hoveddel: 11, ledd: 11, tekst: 10.5 };
	const skrift = $derived(o?.eksportInnst?.[aktiv]?.skriftSkala ?? {});
	function ptVerdi(omr, grunn) { return Math.round(grunn * (skrift[omr] ?? 1) * 10) / 10; }
	function settPt(omr, verdi, grunn) {
		const n = parseFloat(verdi);
		if (!o || !isFinite(n) || n <= 0) return;
		if (!o) return;
		o.eksportInnst = o.eksportInnst ?? {};
		const innst = o.eksportInnst[aktiv] ?? {};
		o.eksportInnst[aktiv] = { ...innst, skriftSkala: { ...(innst.skriftSkala ?? {}), [omr]: n / grunn } };
		markDirty();
	}
	function settSkrift(omr, v) {
		if (!o) return;
		o.eksportInnst = o.eksportInnst ?? {};
		const innst = o.eksportInnst[aktiv] ?? {};
		o.eksportInnst[aktiv] = { ...innst, skriftSkala: { ...(innst.skriftSkala ?? {}), [omr]: v } };
		markDirty();
	}
	function nullstillSkrift() {
		if (!o) return;
		const innst = o.eksportInnst?.[aktiv] ?? {};
		o.eksportInnst[aktiv] = { ...innst, skriftSkala: undefined };
		markDirty();
	}

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

	/** Portal: flytt panel-noden inn i høyre sidemeny (#toc-side) mens eksportvisningen er åpen. */
	function portal(node, target) {
		const host = document.querySelector(target);
		host?.appendChild(node);
		return { destroy() { node.remove(); } };
	}

	/** Forhåndsvisning: den EKTE eksporten (buildPdfBase64) rendres side for side
	 *  med pdf.js — visningen er garantert identisk med eksporten. */
	let pdfSideBilder = $state([]); // dataURL per side
	$effect(() => {
		if (!o || app.kind !== 'service') { pdfSideBilder = []; return; }
		let død = false;
		(async () => {
			try {
				const valg = { storrelse: getInnst('storrelse', 'A5'), kolonner: getInnst('kolonner', aktiv === 'Menighet' ? 2 : 1), marger: getInnst('marger', aktiv === 'Menighet' ? 'smal' : 'normal'), tittel: getInnst('tittel', true), skriftSkala: { hoveddel: 1, ledd: 1, tekst: 1, ...skrift } };
				const kopi = klonMedValg(o, aktiv);
				const { doc } = buildPdfBase64(kopi, true, valg);
				const mod = await import('pdfjs-dist');
				const pdfjsLib = mod.pdfjsLib ?? mod; // chunk-eksporten heter ikke alltid pdfjsLib
				// ekte worker: Vite bygger worker-filen fra pdfjs-dist
				const worker = new Worker(new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url), { type: 'module' });
				pdfjsLib.GlobalWorkerOptions.workerPort = worker;
				const buf = doc.output('arraybuffer');
				const pdf = await pdfjsLib.getDocument({ data: buf.slice(0) }).promise;
				const bilder = [];
				const sideTekster = []; // for Avsnitt → side-kartlegging i eksportmodulen
				for (let i = 1; i <= pdf.numPages; i++) {
					const side = await pdf.getPage(i);
					const viewport = side.getViewport({ scale: 1.4 });
					const c = document.createElement('canvas');
					c.width = viewport.width; c.height = viewport.height;
					await side.render({ canvasContext: c.getContext('2d'), viewport }).promise;
					const tc = await side.getTextContent();
					sideTekster.push(tc.items.map((x) => x.str).join(' '));
					if (død) return;
					bilder.push(c.toDataURL('image/jpeg', 0.85));
				}
				if (!død) {
					pdfSideBilder = bilder;
					// kartlegg avsnittstitler til sidenummer (brukes av Avsnitt-listen i høyremenyen)
					const kart = {};
					(app.current?.sections ?? []).forEach((sec, i) => {
						const t = (sec.title || '').replace(/\s+/g, ' ').trim();
						if (t.length < 2) return;
						const idx = sideTekster.findIndex((txt) => txt.replace(/\s+/g, ' ').includes(t));
						if (idx >= 0) kart[i] = idx + 1;
					});
					window.__eksSecSider = kart;
				}
			} catch (e) {
				if (!død) { console.error('Forhåndsvisning feilet:', e); pdfSideBilder = []; }
			}
		})();
		return () => { død = true; };
	});

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

	/** Skal leddets overskrift være med? Hovedboksen for leddet styrer også overskriften. */
	function visHode(si, ii) {
		return erMed(si, ii, {});
	}

	/** Skal leddets innhold være med? (default ja, lagres med «:t»-nøkkel) */
	function visTekstDel(si, ii) {
		const v = valg[aktiv]?.[nokkel(si, ii) + ':t'];
		if (v !== undefined) return v;
		const lagret = o?.eksportValg?.[aktiv]?.[nokkel(si, ii) + ':t'];
		return lagret !== undefined ? lagret : true;
	}

	/** Er leddet et bibeltekst-ledd? Defineres av BIBELREF-linjen i teksten
	 *  (ikke av overskriften — «Ingress til lesning» matcher ellers med).
	 *  FOTNOTE er kun generell liten tekstnotis-formatering. */
	function erBibel(it) {
		const tekster = [it.text, ...(it.alts || []).map((a) => a.text)];
		return tekster.some((t) => t && /^BIBELREF \|/m.test(t));
	}

	/** Skal leddet vise bibelreferanse i stedet for hele teksten? (lagres med «:br»-nøkkel;
	 *  standard: på for Menighet på lesningsledd) */
	function visBibel(si, ii, it) {
		const v = valg[aktiv]?.[nokkel(si, ii) + ':br'];
		if (v !== undefined) return v;
		const lagret = o?.eksportValg?.[aktiv]?.[nokkel(si, ii) + ':br'];
		if (lagret !== undefined) return lagret;
		return aktiv === 'Menighet' && erBibel(it);
	}

	/** Referansen som skal vises i overskriften (valgt alternativ eller leddteksten). */
	function bibelrefTxt(it) {
		const r = bibelref(it);
		if (!r) return '';
		return Array.isArray(r) ? (r[it.selAlt ?? 0] || r[0] || '') : r;
	}

	function settDel(si, ii, del, v) {
		if (!valg[aktiv]) valg[aktiv] = {};
		valg[aktiv][nokkel(si, ii) + del] = v;
		if (o) {
			o.eksportValg = o.eksportValg ?? {};
			o.eksportValg[aktiv] = { ...valg[aktiv] };
		}
		markDirty();
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
		// tittelen (navn + dato) styres av profilinnstillingen «tittel»
		kopi.__visTittel = getInnst('tittel', true);
		kopi.sections?.forEach((sec, si) => {
			sec.items?.forEach((it, ii) => {
				const original = svc.sections?.[si]?.items?.[ii];
				// «Fjern fra gudtjenesten» i kontekstmenyen gjelder også for eksport
				if (original && original.enabled === false) { it.enabled = false; return; }
				const v = lagret?.[nokkel(si, ii)];
				it.enabled = v !== undefined ? v : standardFor(profil, it);
				// per-ledd valg: hovedboksen styrer overskriften; «:t» styrer innholdet
				it.__visOverskrift = it.enabled;
				it.__visInnhold = lagret?.[nokkel(si, ii) + ':t'] !== undefined ? lagret[nokkel(si, ii) + ':t'] : true;
				// per-ledd bibelreferanse: er Bibelreferanse-valgt, skift innholdet til referansen
				// og legg referansen til overskriften
				const bref = lagret?.[nokkel(si, ii) + ':br'];
				if (bref !== undefined ? bref : (profil === 'Menighet' && erBibel(it))) {
					const r = bibelref(it);
					if (r) {
						if (it.alts?.length) {
							const refs = Array.isArray(r) ? r : it.alts.map(() => r);
							it.alts.forEach((alt, ai) => { if (refs[ai]) alt.text = refs[ai]; });
							if (it.alts[it.selAlt ?? 0]?.text) it.__ref = it.alts[it.selAlt ?? 0].text;
						} else {
							it.__ref = it.text;
							it.text = r;
						}
						// referansen skal frem i overskriften: «3. Andre lesning — Rom 4,1-8»
						if (it.__ref || r) it.heading = (it.heading || '').replace(/\s*—\s*[^—]*$/, '') + ' — ' + (Array.isArray(r) ? r[it.selAlt ?? 0] || r[0] || '' : r);
					}
				}
			});
		});
		return kopi;
	}

	/** Bibelreferanse-modus per ledd: finn referansen i teksten (tre former: BIBELREF-linjen,
	 *  «står skrevet i/hos [ref]:»-innledningen og referansen som siste linje, f.eks. «Sal 68,21»).
	 *  Uten kjent referanse brukes kirkeårets oppslag (Første/Andre lesning/Evangelium ↔ L1/L2/E). */
	function bibelref(it) {
		const k = o?.date ? lookupKirkeaar(o.date) : null;
		const kkRefs = k ? { første: k.L1, andre: k.L2, evangelium: k.E } : {};
		const finnRef = (tekst) => {
			if (!tekst) return null;
			const fn = tekst.match(/^BIBELREF \| ?(.*)$/m);
			if (fn) return fn[1].trim();
			const intro = tekst.match(/står skrevet (?:i\/hos|i|hos) ([^:\n]+):/);
			if (intro && /\d/.test(intro[1])) return intro[1].trim();
			// siste linje som ligner en referanse (kort, uten rollemerk/skille/tegnsetting, med tall)
			const linjer = tekst.split('\n').map((l) => l.trim()).filter(Boolean);
			const siste = linjer.at(-1) ?? '';
			if (linjer.length > 1 && /^[^|:;.!?]{1,30}$/.test(siste) && /[,0-9]/.test(siste)) return siste;
			return null;
		};
		if (it.alts?.length) {
			const refs = [];
			for (const alt of it.alts) refs.push(finnRef(alt.text));
			// leddet har ingen referanse i teksten — slå opp kirkeårets referanse
			const h = (it.heading || '').toLowerCase();
			if (refs.every((r) => !r)) {
				const kkr = h.includes('evangelium') ? kkRefs?.evangelium : h.includes('andre') ? kkRefs?.andre : h.includes('første') ? kkRefs?.første : null;
				if (kkr) refs.fill(kkr);
			}
			return refs;
		}
		const ref = finnRef(it.text);
		if (ref) return ref;
		const h = (it.heading || '').toLowerCase();
		const kkr = h.includes('evangelium') ? kkRefs?.evangelium : h.includes('andre') ? kkRefs?.andre : h.includes('første') ? kkRefs?.første : null;
		return kkr ?? null;
	}

	function baseNavn(profil) {
		return safeName([o?.date ?? '', o?.name ?? '', profil].filter(Boolean).join(' - '));
	}

	async function eksporterProfil(profil) {
		const base = baseNavn(profil);
		let n = 0;
		if (formater.word) {
			let kopi = klonMedValg(o, profil);
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
							const { base64 } = buildPdfBase64(kopi, o.visInstr ?? true, {
						storrelse: getInnst('storrelse', 'A5'),
						kolonner: getInnst('kolonner', 1),
						marger: getInnst('marger', aktiv === 'Menighet' ? 'smal' : 'normal'),
						tittel: getInnst('tittel', true)
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

		<div class="eks-baand">
			<div class="eks-baand-gruppe">
				<select value={getInnst('storrelse', 'A5') === 'A4' ? 'A4' : 'A5'} onchange={(e) => setInnst('storrelse', e.currentTarget.value)}>
					<option value="A4">A4</option>
					<option value="A5">A5</option>
				</select>
				<select value={String(getInnst('kolonner', 1))} onchange={(e) => setInnst('kolonner', +e.currentTarget.value)}>
					<option value="1">1 kolonne</option>
					<option value="2">2 kolonner</option>
				</select>
				<select value={getInnst('marger', aktiv === 'Menighet' ? 'smal' : 'normal')} onchange={(e) => setInnst('marger', e.currentTarget.value)} title="Marger i Word/PDF">
					<option value="bred">Bred marg</option>
					<option value="normal">Normal marg</option>
					<option value="smal">Smal marg</option>
				</select>
			</div>
			<div class="eks-baand-gruppe">
				<div class="eks-baand-rad">
					<label class="eks-chk-pt">Hov. <input type="number" min="6" max="20" step="any" value={ptVerdi('hoveddel', 11)} onchange={(e) => settPt('hoveddel', e.currentTarget.value, 11)} /></label>
					<label class="eks-chk-pt">Ledd <input type="number" min="6" max="20" step="any" value={ptVerdi('ledd', 11)} onchange={(e) => settPt('ledd', e.currentTarget.value, 11)} /></label>
					<label class="eks-chk-pt">Tekst <input type="number" min="6" max="20" step="any" value={ptVerdi('tekst', 10.5)} onchange={(e) => settPt('tekst', e.currentTarget.value, 10.5)} /></label>
					<button class="wide eks-tilbakestill" title="Tilbakestill fontstørrelsene (11 / 11 / 10,5 pt)" onclick={nullstillSkrift}>↺</button>
				</div>
			</div>
			<div class="eks-baand-gruppe">
				<label class="eks-chk"><input type="checkbox" checked={app.eksVisInnhold} onchange={(e) => { app.eksVisInnhold = e.currentTarget.checked; try { localStorage.setItem('eks-visInnhold', app.eksVisInnhold ? '1' : '0'); } catch {} }} /> Leddinnhold</label>
			</div>
		</div>
		<div class="eksport-kolonner">
			<div class="eksport-liste">
				{#if o.kind === 'service'}
					<div class="sidehead eksport-seksjon">Tittel</div>
					<div class="eksport-rad" class:med={getInnst('tittel', true)}>
						<input type="checkbox" checked={getInnst('tittel', true)} onchange={(e) => setInnst('tittel', e.currentTarget.checked)} title="Gudtjenestenavn og dato med i eksporten" />
						<div class="eksport-rad-tekst">
							<span class="eksport-rad-nm">{o.name}{o.date ? ' · ' + datoTekst : ''}</span>
						</div>
					</div>
				{/if}
				{#each o.sections as sec, si (si)}
					<div class="sidehead eksport-seksjon" data-sec={si}>{sec.title}</div>
					{#each sec.items as it, ii (nokkel(si, ii))}
						<div class="eksport-rad" class:med={erMed(si, ii, it)} class:deaktivert={it.enabled === false}>
							{#if it.enabled === false}
								<span class="eksport-fjernet-tag" title="Fjernet fra gudstjenesten i kontekstmenyen — kommer ikke med i eksport">fjernet</span>
							{:else}
								<label class="eksport-hovedchk" title="Leddet (inkl. overskriften) med i eksporten?">
									<input type="checkbox" checked={erMed(si, ii, it)} onchange={(e) => sett(si, ii, e.currentTarget.checked)} />
									<span class="eksport-hoved-ikon">{@html mdi('format-title')}</span>
								</label>
							{/if}
							{#if it.enabled !== false}
								<div class="eksport-rad-tekst">
									<span class="eksport-rad-nm">{it.heading || it.type}{it.type === 'salme' && (it.salmeNr || it.salmeTittel) ? ': ' + [it.salmeNr, it.salmeTittel].filter(Boolean).join(' ') : ''}{erBibel(it) && visBibel(si, ii, it) && bibelrefTxt(it) ? ' — ' + bibelrefTxt(it) : ''}</span>
									<div class="eksport-rad-knapper">
										{#if !visInnhold && (leddTekst(it) || '').trim()}
											<button type="button" class="eksport-innhold-indi" class:av={!visTekstDel(si, ii)}
												title={visTekstDel(si, ii) ? 'Innholdet er med i eksporten — klikk for å ta det bort' : 'Innholdet er ikke med i eksporten — klikk for å ta det med'}
												onclick={() => settDel(si, ii, ':t', !visTekstDel(si, ii))}>
												{@html mdi('table-of-contents')}
												<span>{visTekstDel(si, ii) ? 'Innhold med' : 'Innhold uten'}</span>
											</button>
										{/if}
										{#if erBibel(it)}
											<button type="button" class="eksport-innhold-indi eksport-bibel-indi" class:av={!visBibel(si, ii, it)}
												title={visBibel(si, ii, it) ? 'Bibelreferansen er med (overskriften og eventuell innholdstekst) — klikk for å bruke hele bibelteksten i stedet' : 'Hele bibelteksten brukes — klikk for å bruke bare bibelreferansen'}
												onclick={() => settDel(si, ii, ':br', !visBibel(si, ii, it))}>
												{@html mdi('book-open-variant')}
												<span>{visBibel(si, ii, it) ? 'Bibelreferanse' : 'Hele teksten'}</span>
											</button>
										{/if}
									</div>
								</div>
							{/if}
						</div>
						{#if visInnhold && it.enabled !== false && erMed(si, ii, it) && (leddTekst(it) || '').trim()}
							<div class="eksport-innhold-rad" class:ut={!visTekstDel(si, ii)}>
								<label class="eksport-del" title="Innholdet med i eksporten (overskriften styres av hovedboksen)">
									<input type="checkbox" checked={visTekstDel(si, ii)} onchange={(e) => settDel(si, ii, ':t', e.currentTarget.checked)} />
									{@html mdi('text')}
								</label>
								<div class="eksport-innhold lit-text">{@html litHtml(leddTekst(it))}</div>
							</div>
						{/if}
					{/each}
				{/each}
			</div>

			<div id="eks-forhvisning">
				<div class="eks-forh-inner" use:pinnehendelse>
				{#if pdfSideBilder.length === 0}
					<p class="eks-forhvisning-lader">Rendrer forhåndsvisning …</p>
				{:else}
					{#each pdfSideBilder as bilde, si}
						<div class="eks-side" class:a4={getInnst('storrelse', 'A5') === 'A4'} style="width: {250 * zoomNivå}px">
							<img src={bilde} alt="Side {si + 1}" draggable="false" style="width: {250 * zoomNivå}px" />
							<span class="eks-side-nr">{si + 1}</span>
						</div>
					{/each}
				{/if}
				</div>
				<div class="eks-flyt-zoom">
					<button class="ikon-btn" title="Zoom ut" onclick={() => zoom(Math.max(0.5, zoomNivå - 0.15))}>−</button>
					<span>{Math.round(zoomNivå * 100)} %</span>
					<button class="ikon-btn" title="Zoom inn" onclick={() => zoom(Math.min(2, zoomNivå + 0.15))}>+</button>
				</div>
			</div>
		</div>

		<aside id="eks-panel" use:portal={'#toc-side'}>
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
				<div class="biblio-kort-hode"><span class="sidehead">Eksportformat</span></div>
				<div class="eksport-innst-gruppe">
					<label class="eksport-chk"><input type="checkbox" checked={formater.word} onchange={(e) => settFormater('word', e.currentTarget.checked)} /> Word (.docx)</label>
					<label class="eksport-chk"><input type="checkbox" checked={formater.pdf} onchange={(e) => settFormater('pdf', e.currentTarget.checked)} /> PDF (til filsystemet)</label>
					<label class="eksport-chk"><input type="checkbox" checked={formater.pptx} onchange={(e) => settFormater('pptx', e.currentTarget.checked)} /> PowerPoint (skjerm)</label>
					{#if formater.pptx}
						<label class="eksport-chk"><input type="checkbox" checked={tomSlide} onchange={(e) => settTomSlide(e.currentTarget.checked)} /> Blank side mellom leddene</label>
					{/if}
					<button class="wide eksport-standard-btn" title="Lagre formatvalgene som app-standard" onclick={lagreStandardFormater}>Sett som standard</button>
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
		</aside>
	{/if}
</div>
