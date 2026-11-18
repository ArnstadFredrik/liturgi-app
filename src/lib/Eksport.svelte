<script>
	import { app, markDirty } from '$lib/store.svelte.js';
	import { saveCurrent } from '$lib/fileio.svelte.js';
	import { exportWord, exportPptx, buildPdfBase64, byggPdfSider, nlDate, safeName, roleSegments, splitChunks, delPptSider, delPptSegs, flytAvsnitt } from '$lib/export.js';
	import { lookupKirkeaar } from '$lib/kirkeaar.js';
	import { prompt } from '$lib/modal.svelte.js';
	import { openContextMenu } from '$lib/contextmenu.svelte.js';
	import { litHtml, leddTekst, salmeTekst } from '$lib/lit.js';
	import { mdi } from '$lib/mdi.js';
	import { toast } from 'svelte-sonner';

	const isElectron = typeof window !== 'undefined' && !!window.liturgi?.isElectron;

	const INNBYGGET = ['Prest', 'Medarbeider', 'Menighet', 'Skjerm'];
	const PREKEN_RE = /preken|preker|tale|andakt|formidling|homili/i;
	const LESNING_RE = /lesning|evangelium/i;

	let egneProfiler = $state([]);   // egendefinerte profilnavn (i databasen)
	let aktiv = $state('Prest');
	let valg = $state({});           // per profil per dokument: { nokkel: bool }
	let visInnhold = $derived(app.eksVisInnhold);
	// vis instruksjoner: per dokument (o.visInstr), default på. Menighetsprofilen
	// tar ALDRI med instruksjoner (hardkodet i Word/PDF-undermodulen).
	let visInstrValg = $state(true);
	// vis salmeinfo (@COPYRIGHT-linjer: T/M/O-hode og ©-linjer): per dokument (o.visSalmeinfo), default på
	let visSalmeinfoValg = $state(true);
	// PPTX-forhåndsvisning (undermodul): slidene som HTML
	let pptSlides = $state([]); // [{ big, tekstStorrelse, tittelStorrelse, deler }]
	let formater = $state({ word: true, pptx: false, pdf: false });
	let appFormater = $state({ word: true, pptx: false, pdf: false }); // app-standard (DB)
	let tomSlide = $state(false);
	// PowerPoint-innstillinger (følger Menighet-profilen, men har egen konfigurasjon)
	let pptVisTittel = $state(true);
	let pptTekstSkala = $state(1);      // skala på brødtekst-slides (24 pt grunn)
	let pptTittelSkala = $state(1);     // skala på tittelsliden (40 pt grunn)
	let pptEkstra = $state([]);         // ekstra sider: { tittel, innhold }
	let pptLeddtitler = $state(false);  // leddtitler på slidene (standard av)
	let pptJustering = $state('center');  // tekstjustering: left | center | right (standard senter)
	let pptVersjon = $state(0);         // økes ved utvalgsendring — live-oppdaterer slidevisningen
	let eksporterer = $state(false);
	let nyProfilNavn = $state('');
	let zoomNivå = $state(1.5); // kun visning (lagres i lokalStorage) — 150 % er ny standard
	try {
		const lagret = localStorage.getItem('eks-zoom2') ?? localStorage.getItem('eks-zoom');
		if (lagret !== null) zoomNivå = +lagret || 1.5; // gammel nøkkel med 1 (gammel standard) migreres ikke — 1,5 gjelder
		else localStorage.removeItem('eks-zoom');
	} catch {}
	function zoom(v) {
		const inner = document.querySelector('#eks-forhvisning .eks-forh-inner');
		if (!inner) { zoomNivå = v; try { localStorage.setItem('eks-zoom2', String(v)); } catch {} return; }
		// anker: siden (og relativ posisjon i den) som er midt i visningen følger med ved zoom
		const sider = [...inner.querySelectorAll('.eks-side')];
		const midt = inner.scrollTop + inner.clientHeight / 2;
		let idx = 0, rel = 0.5;
		for (let i = 0; i < sider.length; i++) {
			const top = sider[i].offsetTop - inner.offsetTop, h = sider[i].offsetHeight + 18;
			if (midt >= top) { idx = i; rel = Math.min(1, Math.max(0, (midt - top) / h)); }
		}
		zoomNivå = v;
		try { localStorage.setItem('eks-zoom2', String(v)); } catch {}
		requestAnimationFrame(() => {
			const s = [...inner.querySelectorAll('.eks-side')][idx];
			if (s) inner.scrollTop = Math.max(0, s.offsetTop - inner.offsetTop + rel * (s.offsetHeight + 18) - inner.clientHeight / 2);
		});
	}
	// pinch-to-zoom (trackpad) + dra for å panorere i visningen
	// koblet rulling mellom venstre liste og forhåndsvisningen (kan slås av i menyen)
	let kobletLås = 0;
	// engangsflagg: den programmatiske scrollen skal ikke utløse tilbake-rulling
	// (tids-lås alene sviktet ved scroll-momentum — siden "låste" seg fast)
	let hoppOver = { liste: false, visning: false };
	function fraForhvisning() {
		if (!app.eksKoblet || Date.now() < kobletLås) return;
		if (hoppOver.visning) { hoppOver.visning = false; return; }
		const inner = document.querySelector('#eks-forhvisning .eks-forh-inner');
		const liste = document.querySelector('.eksport-liste');
		if (!inner || !liste) return;
		const topp = inner.scrollTop + 40;
		const kart = window.__eksSecSider ?? {};
		let sec = null;
		for (const [s, p] of Object.entries(kart).map(([s, p]) => [+s, p]).sort((a, b) => a[1] - b[1])) {
			const el = inner.querySelectorAll('.eks-side')[p - 1];
			if (el && el.offsetTop - inner.offsetTop <= topp) sec = s;
		}
		if (sec == null) return;
		const hode = liste.querySelector(`.eksport-seksjon[data-sec="${sec}"]`);
		if (hode) { hoppOver.liste = true; liste.scrollTop = Math.max(0, hode.offsetTop - liste.offsetTop - 6); }
	}
	function fraListe() {
		if (!app.eksKoblet || Date.now() < kobletLås) return;
		if (hoppOver.liste) { hoppOver.liste = false; return; }
		const inner = document.querySelector('#eks-forhvisning .eks-forh-inner');
		const liste = document.querySelector('.eksport-liste');
		if (!inner || !liste) return;
		const topp = liste.scrollTop + 40;
		let sec = null;
		for (const hode of liste.querySelectorAll('.eksport-seksjon[data-sec]')) {
			if (hode.offsetTop - liste.offsetTop <= topp) sec = +hode.dataset.sec;
		}
		if (sec == null) return;
		const el = inner.querySelectorAll('.eks-side')[window.__eksSecSider?.[sec] - 1];
		if (el) { hoppOver.visning = true; inner.scrollTop = Math.max(0, el.offsetTop - inner.offsetTop - 8); }
	}
	function lenket(node) {
		const h = () => (node.classList.contains('eksport-liste') ? fraListe : fraForhvisning)();
		node.addEventListener('scroll', h, { passive: true });
		return { destroy: () => node.removeEventListener('scroll', h) };
	}
	// TOC-navigering (kalles fra Avsnitt-listen i +page.svelte): glidende rull til seksjonens side
	window.__eksTilSec = (sec) => {
		const inner = document.querySelector('#eks-forhvisning .eks-forh-inner');
		const el = inner?.querySelectorAll('.eks-side')[window.__eksSecSider?.[sec] - 1];
		if (inner && el) {
			kobletLås = Date.now() + 900; // unngå at koblet rulling slåss med animasjonen
			inner.scrollTo({ top: Math.max(0, el.offsetTop - inner.offsetTop - 8), behavior: 'smooth' });
		}
	};
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
			visInstrValg = o.visInstr ?? true;
			visSalmeinfoValg = o.visSalmeinfo ?? true;
			// PowerPoint-innstillinger (per dokument, serialiseres med .liturgi-filen)
			pptVisTittel = o.eksportPptx?.visTittel ?? true;
			pptTekstSkala = o.eksportPptx?.tekstSkala ?? 1;
			pptTittelSkala = o.eksportPptx?.tittelSkala ?? 1;
			pptEkstra = JSON.parse(JSON.stringify(o.eksportPptx?.ekstra ?? []));
			pptLeddtitler = o.eksportPptx?.leddtitler ?? false;
			pptJustering = o.eksportPptx?.justering ?? 'center';
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
	// 'Skjerm' er PowerPoint-modulen: gjenbruker ledd-listen med MENIGHETENS utvalg
	const profiler = $derived(['Prest', 'Medarbeider', 'Menighet', 'Skjerm', ...egneProfiler]);
	const datoTekst = $derived(o?.date ? nlDate(o.date) : '');

	/** Portal: flytt panel-noden inn i høyre sidemeny (#toc-side) mens eksportvisningen er åpen. */
	function portal(node, target) {
		const host = document.querySelector(target);
		host?.appendChild(node);
		return { destroy() { node.remove(); } };
	}

	/** Forhåndsvisning: PDF-layouten bygges av SAMME motor som eksporten
	 *  (buildPdfBase64 med tegnesporing) og rendres som SVG side for side —
	 *  identiske linjebrudd og paginering, uten pdf.js-rasterisering. */
	let pdfSider = $state([]); // { w, h, ops: [{ type: 'text'|'line', … }] } per side
	const PX_PER_MM = 250 / 148; // forhåndsvisningsskala: A5-kortet er 250 px bredt ved zoom 1
	let rendrerStatus = $state(''); // '' | 'oppdatert' — toast over visningen
	let innstVersjon = $state(0); // økes ved setInnst — garanterer at forhåndsvisningen re-rendrer
	$effect(() => {
		innstVersjon; // avhengighet: re-render når sideinnstillingene endres
		if (aktiv === 'Skjerm') { pdfSider = []; rendrerStatus = ''; return; }
		if (!o || app.kind !== 'service') { pdfSider = []; rendrerStatus = ''; return; }
		try {
			const valg = { storrelse: getInnst('storrelse', 'A5'), kolonner: getInnst('kolonner', aktiv === 'Menighet' ? 2 : 1), marger: getInnst('marger', aktiv === 'Menighet' ? 'smal' : 'normal'), tittel: getInnst('tittel', true), visAvsnittstitler: getInnst('visAvsnittstitler', true), skriftSkala: { hoveddel: 1, ledd: 1, tekst: 1, ...skrift } };
			// NB: les RESULTATET, aldri pdfSider-state her — effekten skriver pdfSider,
			// så å lese den i samme effekt gir en uendelig effekt-loop.
			const sider = byggPdfSider(klonMedValg(o, aktiv), aktiv === 'Menighet' ? false : visInstrValg, valg).sider;
			pdfSider = sider;
			// Avsnitt → side-kartlegging (brukes av Avsnitt-listen i høyremenyen)
			const kart = {};
			(app.current?.sections ?? []).forEach((sec, i) => {
				const t = (sec.title || '').replace(/\s+/g, ' ').trim();
				if (t.length < 2) return;
				const idx = sider.findIndex((side) => side.ops.some((op) => op.type === 'text' && op.text.replace(/\s+/g, ' ').includes(t)));
				if (idx >= 0) kart[i] = idx + 1;
			});
			window.__eksSecSider = kart;
			rendrerStatus = 'oppdatert';
			setTimeout(() => { rendrerStatus = ''; }, 1500);
		} catch (e) {
			console.error('Forhåndsvisning feilet:', e);
			rendrerStatus = '';
		}
	});

	function nokkel(si, ii) { return si + ':' + ii; }

	/** Skjerm-profilen deler utvalg med Menighet — endringer gjelder begge. */
	function valgProfil() { return aktiv === 'Skjerm' ? 'Menighet' : aktiv; }

	function erLesning(it) { return LESNING_RE.test(it.heading || ''); }

	/** Standardmarkering per profil. */
	function standard(it) {
		if (aktiv === 'Medarbeider') return !PREKEN_RE.test(it.heading || '');
		// Skjerm følger menighetens utvalg — endringer i en gjelder begge
		if (aktiv === 'Menighet' || aktiv === 'Skjerm') {
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
		innstVersjon++;
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
		const v = valg[valgProfil()]?.[nokkel(si, ii)];
		if (v !== undefined) return v;
		return standard(it);
	}

	/** Skal leddets overskrift være med? Hovedboksen for leddet styrer også overskriften. */
	function visHode(si, ii) {
		return erMed(si, ii, {});
	}

	/** Skal leddets innhold være med? (default ja, lagres med «:t»-nøkkel) */
	function visTekstDel(si, ii) {
		const v = valg[valgProfil()]?.[nokkel(si, ii) + ':t'];
		if (v !== undefined) return v;
		const lagret = o?.eksportValg?.[valgProfil()]?.[nokkel(si, ii) + ':t'];
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
		if (aktiv === 'Skjerm') {
			// Skjerm: full bibeltekst som standard; egne endringer lagres separat (eksportValg.Skjerm)
			const v = valg['Skjerm']?.[nokkel(si, ii) + ':br'];
			if (v !== undefined) return v;
			return o?.eksportValg?.Skjerm?.[nokkel(si, ii) + ':br'] ?? false;
		}
		const v = valg[valgProfil()]?.[nokkel(si, ii) + ':br'];
		if (v !== undefined) return v;
		const lagret = o?.eksportValg?.[valgProfil()]?.[nokkel(si, ii) + ':br'];
		if (lagret !== undefined) return lagret;
		return aktiv === 'Menighet' && erBibel(it);
	}

	/** Enten-eller for bibelledd: Bibelreferanse (innholdet bort) ↔ Hele teksten.
	 *  Skjerm lagrer sitt eget valg; Menighet deler som før. */
	function byttBibelmodus(si, ii, it) {
		const ref = !visBibel(si, ii, it);
		if (aktiv === 'Skjerm') {
			if (!valg['Skjerm']) valg['Skjerm'] = {};
			valg['Skjerm'][nokkel(si, ii) + ':br'] = ref;
			if (o) {
				o.eksportValg = o.eksportValg ?? {};
				o.eksportValg.Skjerm = { ...valg['Skjerm'] };
			}
			pptVersjon++;
			markDirty();
			return;
		}
		settDel(si, ii, ':br', ref);
	}

	/** Referansen som skal vises i overskriften (valgt alternativ eller leddteksten). */
	function bibelrefTxt(it) {
		const r = bibelref(it);
		if (!r) return '';
		return Array.isArray(r) ? (r[it.selAlt ?? 0] || r[0] || '') : r;
	}

	function settDel(si, ii, del, v) {
		const vp = valgProfil();
		if (!valg[vp]) valg[vp] = {};
		valg[vp][nokkel(si, ii) + del] = v;
		if (o) {
			o.eksportValg = o.eksportValg ?? {};
			o.eksportValg[vp] = { ...valg[vp] };
		}
		pptVersjon++;
		markDirty();
	}

	function sett(si, ii, m) {
		const vp = valgProfil();
		if (!valg[vp]) valg[vp] = {};
		valg[vp][nokkel(si, ii)] = m;
		if (o) {
			o.eksportValg = o.eksportValg ?? {};
			o.eksportValg[vp] = { ...valg[vp] };
		}
		pptVersjon++;
		markDirty();
	}

	function byttProfil(p) {
		aktiv = p;
		const vp = valgProfil();
		if (o?.eksportValg?.[vp]) valg[vp] = { ...o.eksportValg[vp] };
		else delete valg[vp];
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
		pptVersjon++;
		markDirty();
	}

	/** PowerPoint-innstillinger per dokument. */
	function setPptx(k, v) {
		if (!o) return;
		o.eksportPptx = { ...(o.eksportPptx ?? {}), [k]: v };
		pptVersjon++;
		markDirty();
	}

	/** Bygg slidene (samme logikk som exportPptx) til HTML-forhåndsvisning. */
	function byggPptSlides() {
		if (!o) { pptSlides = []; return; }
		const tekstStorrelse = Math.round((pptTekstSkala ?? 1) * 38); // grunn 38 pt
		const tittelStorrelse = Math.round((pptTittelSkala ?? 1) * 40);
		const slides = [];
		const push = (segs, big = false, blank = false) => slides.push({ big, blank, tekstStorrelse, tittelStorrelse, deler: blank ? [] : (typeof segs === 'string' ? [{ text: segs }] : segs) });
		pptSlidePos = {};
		pptSlotVed = [];
		const emitEkstra = (ekstra, slot) => {
			pptSlidePos[slot] = slides.length;
			pptSlotVed[slides.length] = slot;
			const joined = flytAvsnitt(((ekstra?.tittel ? ekstra.tittel + '\n' : '') + (ekstra?.innhold ?? '')).trim());
			const grupper = delPptSegs(roleSegments(joined), tekstStorrelse);
			if (grupper.length) for (const grp of grupper) push(grp);
			else push([{ text: '' }]);
		};
		const egne = (slot) => (pptEkstra ?? []).map((e, i) => ({ e, i })).filter(({ e }) => (e.etter ?? '') === slot);
		for (const { e, i } of egne('')) emitEkstra(e, 'e' + i);
		// blank side mellom leddene (unngå dobbelt-tom og tom først)
		const tom = () => { if (tomSlide && slides.length && !slides[slides.length - 1].blank) push(null, false, true); };
		if (pptVisTittel) push(o.name + (o.date ? '\n' + nlDate(o.date) : '') + (o.kirkeaar ? '\n' + o.kirkeaar.name : ''), true);
		// utvalg = Menighet (delt), bibelmodus = Skjerm — samme som eksporten
		const kopi = klonMedValg(o, 'Menighet', 'Skjerm');
		const seksjoner = kopi.sections ?? [];
		for (let si = 0; si < seksjoner.length; si++) {
			const items = seksjoner[si].items ?? [];
			for (let ii = 0; ii < items.length; ii++) {
				const it = items[ii];
				if (!it.enabled) {
					// egne slides plassert etter et deaktivert ledd kommer likevel
					for (const { e, i } of egne(nokkel(si, ii))) emitEkstra(e, 'e' + i);
					continue;
				}
				tom();
				const heading = pptLeddtitler
					? (it.heading || '') + (it.type === 'salme' && (it.salmeNr || it.salmeTittel)
						? (it.heading ? ': ' : '') + [it.salmeNr, it.salmeTittel].filter(Boolean).join(' ') : '')
					: '';
				if (it.type === 'salme' && salmeTekst(it)) {
					if (it.__visInnhold === false) continue; // «vis innhold» av
					pptSlidePos[nokkel(si, ii)] = slides.length;
					pptSlotVed[slides.length] = nokkel(si, ii);
					const vers = salmeTekst(it).split(/\n\s*\n/).map((v) => v.trim()).filter(Boolean);
					vers.forEach((v) => {
						const overskrift = heading ? heading + '\n' : '';
						for (const grp of delPptSegs(roleSegments(flytAvsnitt(overskrift + v)), tekstStorrelse)) push(grp);
					});
					for (const { e, i } of egne(nokkel(si, ii))) emitEkstra(e, 'e' + i);
					continue;
				}
				const lines = [];
				if (it.type !== 'salme') {
					if (it.__visInnhold === false) continue; // «vis innhold» av
					if (visInstrValg && it.instr) lines.push(it.instr.replace(/\{\{\/?r\}\}/g, '')); // samme som eksporten
					const t = leddTekst(it);
					if (t) lines.push(t);
				}
				const joined = flytAvsnitt(((heading ? heading + '\n' : '') + lines.join('\n')).trim());
				if (!joined) continue;
				pptSlidePos[nokkel(si, ii)] = slides.length;
				pptSlotVed[slides.length] = nokkel(si, ii);
				for (const grp of delPptSegs(roleSegments(joined), tekstStorrelse)) push(grp);
				for (const { e, i } of egne(nokkel(si, ii))) emitEkstra(e, 'e' + i);
			}
		}
		// aldri tom side til slutt
		while (slides.length && slides[slides.length - 1].blank) slides.pop();
		pptSlides = slides;
	}

	// bygg forhåndsvisningen når Skjerm-profilen er aktiv eller noe endres (live)
	$effect(() => {
		if (aktiv !== 'Skjerm') return;
		pptTekstSkala; pptTittelSkala; pptVisTittel; pptLeddtitler; pptJustering; tomSlide; pptEkstra.length; pptVersjon; o?.name; o?.date;
		Promise.resolve().then(() => {
			try { byggPptSlides(); } catch (e) { console.error('PPTX-forhåndsvisning:', e); window.__pptErr = e?.message + '\n' + (e?.stack ?? '').slice(0, 300); }
		});
	});

	/** Slideposisjoner for klikk-i-liste → scroll: leddnøkkel → slideindeks, 'e<i>' → egne slides. */
	let pptSlidePos = {};
	const regnNokler = () => {
		const n = [];
		o?.sections?.forEach((sec, si) => sec.items?.forEach((it, ii) => { if (it.enabled !== false) n.push(nokkel(si, ii)); }));
		return n;
	};

	/** Egne slides for en plassering: [{ i, e }] med originalindeks (each-nøkkel). */
	function ekstraEtter(slot) {
		return (pptEkstra ?? []).map((e, i) => ({ e, i })).filter(({ e }) => (e.etter ?? '') === slot);
	}

	/** Flytt egne slide ei én plass opp (-1) eller ned (+1) i layouten. */
	function flyttEkstra(ei, retning) {
		const ekstra = [...pptEkstra];
		const e = ekstra[ei];
		if (!e) return;
		const nokler = regnNokler();
		const gruppe = (slot) => ekstra.map((x, i) => ({ x, i })).filter(({ x }) => (x.etter ?? '') === slot);
		const slot = e.etter ?? '';
		const g = gruppe(slot);
		const pos = g.findIndex(({ i }) => i === ei);
		if (retning < 0) {
			if (pos > 0) {
				const annen = g[pos - 1].i;
				[ekstra[ei], ekstra[annen]] = [ekstra[annen], ekstra[ei]];
			} else if (slot !== '') {
				const idx = nokler.indexOf(slot);
				e.etter = idx <= 0 ? '' : nokler[idx - 1];
			} else return; // aller øverst
		} else {
			if (pos < g.length - 1) {
				const annen = g[pos + 1].i;
				[ekstra[ei], ekstra[annen]] = [ekstra[annen], ekstra[ei]];
			} else {
				const idx = nokler.indexOf(slot);
				if (idx < nokler.length - 1) e.etter = nokler[idx + 1];
				else return; // nederst
			}
		}
		pptEkstra = ekstra;
		setPptx('ekstra', pptEkstra);
	}

	/** Drag-drop: plasser egna slide ei etter et ledd (slot) eller etter en annen egna slide. */
	let dragEkstra = null;
	function flyttEkstraTil(ei, mal) {
		const ekstra = [...pptEkstra];
		const e = ekstra[ei];
		if (!e) return;
		if (mal.type === 'item') {
			e.etter = mal.slot;
			setPptx('ekstra', pptEkstra);
			return;
		}
		// manuell målt: samme slot som målet, rett etter den i rekkefølgen
		const malIdx = mal.idx;
		e.etter = ekstra[malIdx].etter ?? '';
		const [x] = ekstra.splice(ei, 1);
		const pos = malIdx > ei ? malIdx : malIdx + 1;
		ekstra.splice(pos, 0, x);
		pptEkstra = ekstra;
		setPptx('ekstra', pptEkstra);
	}

	/** Ny manuell side rett over/under en eksisterende manuell side (samme plassering i rekkefølgen). */
	function nyPptSideNær(ei, plass) {
		const ekstra = [...(pptEkstra ?? [])];
		const e = ekstra[ei];
		if (!e) return;
		ekstra.splice(plass === 'over' ? ei : ei + 1, 0, { tittel: '', innhold: '', etter: e.etter ?? '' });
		pptEkstra = ekstra;
		setPptx('ekstra', pptEkstra);
	}
	/** Ny manuell side over/under et ledd (slot) — «over» plasserer den etter forrige ledd. */
	function nyPptSideVed(slot, plass) {
		let etter = slot;
		if (plass === 'over') {
			const nokler = regnNokler();
			const idx = nokler.indexOf(slot);
			etter = idx <= 0 ? '' : nokler[idx - 1];
		}
		pptEkstra = [...(pptEkstra ?? []), { tittel: '', innhold: '', etter }];
		setPptx('ekstra', pptEkstra);
	}

	/** Høyreklikkmeny for en manuell side: flytting + ny side over/under + fjern. */
	function menyEkstra(e, ei) {
		e.preventDefault();
		openContextMenu(e.clientX, e.clientY, [
			{ label: 'Flytt sliden opp', action: () => flyttEkstra(ei, -1) },
			{ label: 'Flytt sliden ned', action: () => flyttEkstra(ei, 1) },
			'sep',
			{ label: 'Ny side over', action: () => nyPptSideNær(ei, 'over') },
			{ label: 'Ny side under', action: () => nyPptSideNær(ei, 'under') },
			'sep',
			{ label: 'Fjern sliden', action: () => fjernPptSide(ei), danger: true }
		]);
	}
	/** Høyreklikkmeny for et ledd (Skjerm): ny manuell side over/under leddet. */
	function menyLedd(e, si, ii) {
		if (aktiv !== 'Skjerm') return;
		e.preventDefault();
		openContextMenu(e.clientX, e.clientY, [
			{ label: 'Ny side over leddet', action: () => nyPptSideVed(nokkel(si, ii), 'over') },
			{ label: 'Ny side under leddet', action: () => nyPptSideVed(nokkel(si, ii), 'under') }
		]);
	}

	/** Klikk på et lysbilde → scroll leddoversikten til riktig rad. */
	function visListeRad(slot) {
		document.querySelector('.eksport-liste [data-slot="' + slot + '"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	/** Klikk på ET LYSBILDE → scroll leddoversikten til riktig ledd. */
	let pptSlotVed = []; // slideindeks → slot (fylles i byggPptSlides)
	function slotForSlide(idx) {
		for (let i = Math.min(idx, pptSlotVed.length - 1); i >= 0; i--) {
			if (pptSlotVed[i]) return pptSlotVed[i];
		}
		return null;
	}
	/** Klikk på et ledd i oversikten → scroll forhåndsvisningen til slidet. */
	function visSlide(slot) {
		const idx = pptSlidePos[slot];
		if (idx === undefined) return;
		const el = [...document.querySelectorAll('#eks-ppt .ppt-side')][idx];
		el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	function leggTilPptSide() {
		pptEkstra = [...pptEkstra, { tittel: '', innhold: '' }];
		setPptx('ekstra', pptEkstra);
	}
	function fjernPptSide(i) {
		pptEkstra = pptEkstra.filter((_, idx) => idx !== i);
		setPptx('ekstra', pptEkstra);
	}
	function oppdaterPptSide(i, k, v) {
		pptEkstra = pptEkstra.map((e, idx) => idx === i ? { ...e, [k]: v } : e);
		setPptx('ekstra', pptEkstra);
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

	/** Kopi av gudtjenesten med bare valgte ledd aktivert for en profil. */
	function klonMedValg(svc, profil, brProfil = null) {
		const kopi = JSON.parse(JSON.stringify(svc));
		// lagrede valg i filen går foran øktens midlertidige valg
		const lagret = valg[profil] ?? o?.eksportValg?.[profil];
		// brProfil: bibelmodus leses fra en annen profil (Skjerm — full tekst som standard)
		const brLagret = brProfil ? (valg[brProfil] ?? o?.eksportValg?.[brProfil]) : null;
		// tittelen (navn + dato) styres av profilinnstillingen «tittel»
		kopi.__visTittel = getInnst('tittel', true);
		// salmeinfo (@COPYRIGHT-linjer: T/M/O-hode og ©-linjer) kan ekskluderes per dokument
		const visSalmeinfo = visSalmeinfoValg;
		const stripSalmeinfo = (t) => !t ? t
			: t.replace(/^@(?:COPYRIGHT|copyright|c)\b ?\|? ?.*$\n?/gm, '').replace(/\n{3,}/g, '\n\n');
		kopi.sections?.forEach((sec, si) => {
			sec.items?.forEach((it, ii) => {
				const original = svc.sections?.[si]?.items?.[ii];
				// «Fjern fra gudtjenesten» i kontekstmenyen gjelder også for eksport
				if (original && original.enabled === false) { it.enabled = false; return; }
				if (!visSalmeinfo) {
					it.text = stripSalmeinfo(it.text);
					if (it.alts?.length) it.alts.forEach((a) => { a.text = stripSalmeinfo(a.text); });
				}
				const v = lagret?.[nokkel(si, ii)];
				it.enabled = v !== undefined ? v : standardFor(profil, it);
				// per-ledd valg: hovedboksen styrer overskriften; «:t» styrer innholdet
				it.__visOverskrift = it.enabled;
				it.__visInnhold = lagret?.[nokkel(si, ii) + ':t'] !== undefined ? lagret[nokkel(si, ii) + ':t'] : true;
				// per-ledd bibelreferanse: er Bibelreferanse-valgt, skift innholdet til referansen
				// og legg referansen til overskriften
				const bref = brProfil ? (brLagret?.[nokkel(si, ii) + ':br'] ?? false)
					: (lagret?.[nokkel(si, ii) + ':br'] !== undefined ? lagret[nokkel(si, ii) + ':br'] : (profil === 'Menighet' && erBibel(it)));
				if (bref) {
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
						it.__visInnhold = false; // kun referansen i overskriften — ingen innholdsslides/avsnitt
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
		if (profil === 'Skjerm') return eksporterPptx(); // Skjerm-profilen eksporterer PPTX
		const base = baseNavn(profil);
		let n = 0;
		// Menighetsprogrammet har aldri instruksjoner (uansett bryteren)
		const instr = profil === 'Menighet' ? false : visInstrValg;
		if (formater.word) {
			let kopi = klonMedValg(o, profil);
			const res = await exportWord(kopi, instr, base + '.docx', {
				storrelse: getInnst('storrelse', 'A5'),
				kolonner: getInnst('kolonner', 1),
				visAvsnittstitler: getInnst('visAvsnittstitler', true)
			}, isElectron);
			if (res) {
				const r = await window.liturgi.lagrePdf(res.base64, res.filnavn, o.filePath);
				if (r.ok) { toast.success(res.filnavn + ' → ' + r.filePath); n++; }
				else toast.error('Klarte ikke lagre: ' + (r.error ?? 'ukjent feil'));
			} else n++;
		}
		if (formater.pdf && isElectron) {
					let kopi = klonMedValg(o, profil);
							const { base64 } = buildPdfBase64(kopi, instr, {
						storrelse: getInnst('storrelse', 'A5'),
						kolonner: getInnst('kolonner', 1),
						marger: getInnst('marger', aktiv === 'Menighet' ? 'smal' : 'normal'),
						tittel: getInnst('tittel', true),
						visAvsnittstitler: getInnst('visAvsnittstitler', true)
					});
			const r = await window.liturgi.lagrePdf(base64, base + '.pdf', o.filePath);
			if (r.ok) { toast.success('PDF: ' + r.filePath); n++; }
			else toast.error('Klarte ikke lagre PDF: ' + (r.error ?? 'ukjent feil'));
		}
		return n;
	}

	/** PowerPoint-eksporten (Skjerm-profilen): følger Menighet-utvalget; instruksjoner per dokument. */
	async function eksporterPptx() {
		// utvalg = Menighet (delt), bibelmodus = Skjerm (full tekst som standard)
		const kopi = klonMedValg(o, 'Menighet', 'Skjerm');
		const res = await exportPptx(kopi, {
			tomSlide,
			showInstr: visInstrValg,
			tekstSkala: pptTekstSkala,
			tittelSkala: pptTittelSkala,
			ekstra: pptEkstra,
			visTittel: pptVisTittel,
			visLeddtitler: pptLeddtitler,
			justering: pptJustering
		}, isElectron);
		if (res) {
			const r = await window.liturgi.lagrePdf(res.base64, res.filnavn, o.filePath);
			if (r.ok) { toast.success(res.filnavn + ' → ' + r.filePath); return 1; }
			toast.error('Klarte ikke lagre: ' + (r.error ?? 'ukjent feil'));
		}
		return res ? 1 : 0;
	}

	async function eksporterAlle() {
		if (!o) return;
		eksporterer = true;
		try {
			let n = 0;
			for (const p of profiler) {
				if (p === 'Skjerm' && !formater.pptx) continue; // PPTX kun når formatet er valgt
				n += await eksporterProfil(p);
			}
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
			{#if aktiv === 'Skjerm'}
			<div class="eks-baand-gruppe">
				<div class="eks-baand-rad">
					<label class="eks-chk-pt" title="Skriftstørrelse på slidene (pt, grunn 24)">Tekst <input type="number" min="12" max="60" step="any" value={Math.round(pptTekstSkala * 38)} onchange={(e) => { pptTekstSkala = +e.currentTarget.value / 38; setPptx('tekstSkala', pptTekstSkala); }} /></label>
					<label class="eks-chk-pt" title="Tittelstørrelse på tittelsliden (pt, grunn 40)">Tittel <input type="number" min="20" max="90" step="any" value={Math.round(pptTittelSkala * 40)} onchange={(e) => { pptTittelSkala = +e.currentTarget.value / 40; setPptx('tittelSkala', pptTittelSkala); }} /></label>
					<select value={pptJustering} onchange={(e) => { pptJustering = e.currentTarget.value; setPptx('justering', pptJustering); }} title="Tekstjustering på slidene">
						<option value="left">Venstrejustert</option>
						<option value="center">Sentrert</option>
						<option value="right">Høyrejustert</option>
					</select>
				</div>
			</div>
			<div class="eks-baand-gruppe">
				<div class="eks-baand-rad">
					<button class="eks-toggle" class:paa={pptLeddtitler} title="Leddtitler med på slidene (standard uten)" onclick={() => { pptLeddtitler = !pptLeddtitler; setPptx('leddtitler', pptLeddtitler); }}>{@html mdi('format-title', 14)} Leddtitler</button>
					<button class="eks-toggle" class:paa={tomSlide} title="Blank side mellom leddene" onclick={() => settTomSlide(!tomSlide)}>{@html mdi('file-document-outline', 14)} Blank side</button>
					<button class="eks-toggle" class:paa={pptVisTittel} title="Tittelslide med navn og dato" onclick={() => { pptVisTittel = !pptVisTittel; setPptx('visTittel', pptVisTittel); }}>{@html mdi('presentation', 14)} Tittelslide</button>
					<button class="eks-toggle" class:paa={visInstrValg} title="Instruksjonene (rød kursiv) med på slidene" onclick={() => { visInstrValg = !visInstrValg; if (o) { o.visInstr = visInstrValg; markDirty(); } pptVersjon++; }}>{@html mdi('text', 14)} Instruksjoner</button>
					<button class="eks-toggle" class:paa={visSalmeinfoValg} title="Salmeinfo (tekst/melodi/oversettelse og ©-linjer fra salmedatabasen) med i eksporten. Gjelder alle profiler." onclick={() => { visSalmeinfoValg = !visSalmeinfoValg; if (o) { o.visSalmeinfo = visSalmeinfoValg; markDirty(); } innstVersjon++; }}>{@html mdi('copyright', 14)} Salmeinfo</button>
					<button class="wide eks-ppt-ekstra" title="Legg til en ekstra side med egen tittel og innhold" onclick={leggTilPptSide}>+ Ekstra side</button>
				</div>
			</div>
			{:else}
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
				<div class="eks-baand-rad">
					<button class="eks-toggle" class:paa={app.eksVisInnhold} title="Leddinnhold i listen" onclick={() => { app.eksVisInnhold = !app.eksVisInnhold; try { localStorage.setItem('eks-visInnhold', app.eksVisInnhold ? '1' : '0'); } catch {} }}>{@html mdi('table-of-contents', 14)} Leddinnhold</button>
					<button class="eks-toggle" class:paa={visInstrValg} title="Instruksjonene (rød kursiv) med i Word/PDF-eksporten. Menighetsprogrammet har aldri instruksjoner." onclick={() => { visInstrValg = !visInstrValg; if (o) { o.visInstr = visInstrValg; markDirty(); } }}>{@html mdi('text', 14)} Instruksjoner</button>
					<button class="eks-toggle" class:paa={visSalmeinfoValg} title="Salmeinfo (tekst/melodi/oversettelse og ©-linjer fra salmedatabasen) med i eksporten. Gjelder alle profiler." onclick={() => { visSalmeinfoValg = !visSalmeinfoValg; if (o) { o.visSalmeinfo = visSalmeinfoValg; markDirty(); } innstVersjon++; }}>{@html mdi('copyright', 14)} Salmeinfo</button>
				</div>
			</div>
			{/if}
		</div>
		<div class="eksport-kolonner">
			<div class="eksport-liste" use:lenket>
									{#each ekstraEtter('') as ee (ee.i)}
						<div class="eksport-rad eksport-egen" data-slot={'e' + ee.i}
						draggable="true"
						onclick={(e) => { if (!e.target.closest('button, input, textarea')) visSlide('e' + ee.i); }}
						oncontextmenu={(e) => menyEkstra(e, ee.i)}
						ondragstart={(e) => { dragEkstra = ee.i; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(ee.i)); }}
						ondragover={(e) => { if (dragEkstra !== null && dragEkstra !== ee.i) e.preventDefault(); }}
						ondrop={(e) => { if (dragEkstra !== null && dragEkstra !== ee.i) { e.preventDefault(); flyttEkstraTil(dragEkstra, { type: 'ekstra', idx: ee.i }); dragEkstra = null; } }}
						ondragend={() => { dragEkstra = null; }}>
							<span class="eks-egen-grep" title="Dra for å flytte sliden">{@html mdi('drag-vertical')}</span>
							<span class="eks-egen-merke" title="Manuelt lagt til slide">manuell</span>
							<div class="eks-egen-felter">
								<input class="ppt-ekstra-tittel" placeholder="Sidetittel (kan stå tom)" value={ee.e.tittel}
									oninput={(e) => oppdaterPptSide(ee.i, 'tittel', e.currentTarget.value)} />
								<textarea class="ppt-ekstra-innhold" rows="2" placeholder="Innhold — tekst til siden (rolle-markering i rødt støttes)"
									value={ee.e.innhold}
									oninput={(e) => oppdaterPptSide(ee.i, 'innhold', e.currentTarget.value)}></textarea>
							</div>
							<button class="eks-egen-slett" title="Fjern sliden" onclick={() => fjernPptSide(ee.i)}>×</button>
						</div>
					{/each}
				{#if o.kind === 'service' && aktiv !== 'Skjerm'}
					<div class="sidehead eksport-seksjon">Tittel</div>
					<div class="eksport-rad" class:med={getInnst('tittel', true)}>
						<input type="checkbox" checked={getInnst('tittel', true)} onchange={(e) => setInnst('tittel', e.currentTarget.checked)} title="gudstjenestenavn og dato med i eksporten" />
						<div class="eksport-rad-tekst">
							<span class="eksport-rad-nm">{o.name}{o.date ? ' · ' + datoTekst : ''}</span>
						</div>
					</div>
					<div class="eksport-rad" class:med={getInnst('visAvsnittstitler', true)}>
						<input type="checkbox" checked={getInnst('visAvsnittstitler', true)} onchange={(e) => setInnst('visAvsnittstitler', e.currentTarget.checked)} title="hoveddel-overskriftene («Forberedelse», «Hoveddel» …) med i eksporten" />
						<div class="eksport-rad-tekst">
							<span class="eksport-rad-nm">Hoveddeltitler</span>
						</div>
					</div>
				{/if}
				{#each o.sections as sec, si (si)}
					<div class="sidehead eksport-seksjon" data-sec={si}>{sec.title}</div>
					{#each sec.items as it, ii (nokkel(si, ii))}
						<div class="eksport-rad" class:med={erMed(si, ii, it)} class:deaktivert={it.enabled === false}
						data-slot={nokkel(si, ii)}
						onclick={(e) => { if (aktiv === 'Skjerm' && !e.target.closest('button, input, label, textarea, select, a')) visSlide(nokkel(si, ii)); }}
						oncontextmenu={(e) => menyLedd(e, si, ii)}
						ondragover={(e) => { if (aktiv === 'Skjerm' && dragEkstra !== null) e.preventDefault(); }}
						ondrop={(e) => { if (aktiv === 'Skjerm' && dragEkstra !== null) { e.preventDefault(); flyttEkstraTil(dragEkstra, { type: 'item', slot: nokkel(si, ii) }); dragEkstra = null; } }}>
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
										{#if !visInnhold && !erBibel(it) && (leddTekst(it) || '').trim()}
											<button type="button" class="eksport-innhold-indi" class:av={!visTekstDel(si, ii)}
												title={visTekstDel(si, ii) ? 'Innholdet er med i eksporten — klikk for å ta det bort' : 'Innholdet er ikke med i eksporten — klikk for å ta det med'}
												onclick={() => settDel(si, ii, ':t', !visTekstDel(si, ii))}>
												{@html mdi('table-of-contents')}
												<span>{visTekstDel(si, ii) ? 'Innhold med' : 'Innhold uten'}</span>
											</button>
										{/if}
										{#if erBibel(it)}
<button type="button" class="eksport-innhold-indi" class:av={visBibel(si, ii, it)}
	title={visBibel(si, ii, it) ? 'Hele bibelteksten brukes — klikk for bare bibelreferansen' : 'Hele bibelteksten'}
	onclick={() => { if (visBibel(si, ii, it)) byttBibelmodus(si, ii, it); }}>
	{@html mdi('book-open-variant')}
	<span>Hele teksten</span>
	</button>
	<button type="button" class="eksport-innhold-indi" class:av={!visBibel(si, ii, it)}
	title={!visBibel(si, ii, it) ? 'Bare bibelreferansen brukes — klikk for hele bibelteksten' : 'Bibelreferanse'}
	onclick={() => { if (!visBibel(si, ii, it)) byttBibelmodus(si, ii, it); }}>
	{@html mdi('book-open-variant')}
	<span>Bibelref.</span>
	</button>
										{/if}
									</div>
								</div>
							{/if}
						</div>
						{#if visInnhold && it.enabled !== false && erMed(si, ii, it) && ((leddTekst(it) || '').trim() || (erBibel(it) && bibelrefTxt(it)))}
										<div class="eksport-innhold-rad" class:ut={!erBibel(it) && !visTekstDel(si, ii)}>
											{#if erBibel(it)}
<button type="button" class="eksport-innhold-indi" class:av={visBibel(si, ii, it)}
	title={visBibel(si, ii, it) ? 'Hele bibelteksten brukes — klikk for bare bibelreferansen' : 'Hele bibelteksten'}
	onclick={() => { if (visBibel(si, ii, it)) byttBibelmodus(si, ii, it); }}>
	{@html mdi('book-open-variant')}
	<span>Hele teksten</span>
	</button>
	<button type="button" class="eksport-innhold-indi" class:av={!visBibel(si, ii, it)}
	title={!visBibel(si, ii, it) ? 'Bare bibelreferansen brukes — klikk for hele bibelteksten' : 'Bibelreferanse'}
	onclick={() => { if (!visBibel(si, ii, it)) byttBibelmodus(si, ii, it); }}>
	{@html mdi('book-open-variant')}
	<span>Bibelref.</span>
	</button>
											{:else}
												<label class="eksport-del" title="Innholdet med i eksporten (overskriften styres av hovedboksen)">
													<input type="checkbox" checked={visTekstDel(si, ii)} onchange={(e) => settDel(si, ii, ':t', e.currentTarget.checked)} />
													{@html mdi('text')}
												</label>
											{/if}
											<div class="eksport-innhold lit-text">{@html litHtml(erBibel(it) && visBibel(si, ii, it) && bibelrefTxt(it) ? bibelrefTxt(it) : leddTekst(it))}</div>
										</div>
									{/if}
	{#if aktiv === 'Skjerm'}
						{#each ekstraEtter(nokkel(si, ii)) as ee (ee.i)}
							<div class="eksport-rad eksport-egen" data-slot={'e' + ee.i}
							draggable="true"
							oncontextmenu={(e) => menyEkstra(e, ee.i)}
							ondragstart={(e) => { dragEkstra = ee.i; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(ee.i)); }}
							ondragover={(e) => { if (dragEkstra !== null && dragEkstra !== ee.i) e.preventDefault(); }}
							ondrop={(e) => { if (dragEkstra !== null && dragEkstra !== ee.i) { e.preventDefault(); flyttEkstraTil(dragEkstra, { type: 'ekstra', idx: ee.i }); dragEkstra = null; } }}
							ondragend={() => { dragEkstra = null; }}>
									<span class="eks-egen-grep" title="Dra for å flytte sliden">{@html mdi('drag-vertical')}</span>
									<span class="eks-egen-merke" title="Manuelt lagt til slide">manuell</span>
									<div class="eks-egen-felter">
										<input class="ppt-ekstra-tittel" placeholder="Sidetittel (kan stå tom)" value={ee.e.tittel}
											oninput={(e) => oppdaterPptSide(ee.i, 'tittel', e.currentTarget.value)} />
										<textarea class="ppt-ekstra-innhold" rows="2" placeholder="Innhold — tekst til siden (rolle-markering i rødt støttes)"
											value={ee.e.innhold}
											oninput={(e) => oppdaterPptSide(ee.i, 'innhold', e.currentTarget.value)}></textarea>
									</div>
									<button class="eks-egen-slett" title="Fjern sliden" onclick={() => fjernPptSide(ee.i)}>×</button>
							</div>
						{/each}
					{/if}
					{/each}
				{/each}
			</div>

						{#if aktiv === 'Skjerm'}
			<div id="eks-ppt">
				<div class="ppt-side-liste">
					{#each pptSlides as slide, si (si)}
						<div class="ppt-side" class:stor={slide.big} class:tom={slide.blank}
							onclick={() => { if (aktiv === 'Skjerm') { const slot = slotForSlide(si); if (slot) visListeRad(slot); } }}>
							{#if !slide.blank}
							<div class="ppt-side-innhold" style="font-size: {(slide.big ? slide.tittelStorrelse : slide.tekstStorrelse) * 0.67}px; text-align: {pptJustering}">
								{#each slide.deler as del}
									<span class:ppt-red={del.red} class:ppt-demp={del.small} class:ppt-bold={del.bold} class:ppt-kursiv={del.italics}>{del.text}</span>
								{/each}
							</div>
							{/if}
							<span class="ppt-side-nr">{si + 1}</span>
						</div>
					{/each}
				</div>
								</div>
							{:else}
			<div id="eks-forhvisning">
				<div class="eks-forh-inner" use:pinnehendelse use:lenket>
				{#if pdfSider.length === 0}
					<p class="eks-forhvisning-lader">Rendrer forhåndsvisning …</p>
				{:else}
					{#each pdfSider as side, si}
						<div class="eks-side" style="width: {side.w * PX_PER_MM * zoomNivå}px">
							<svg class="eks-pdf-svg" viewBox="0 0 {side.w} {side.h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Side {si + 1}" style="width: {side.w * PX_PER_MM * zoomNivå}px; display: block; background: white">
								{#each side.ops as op}
									{#if op.type === 'text'}
									<text x={op.x} y={op.y} font-size={op.size * 0.35278} font-family={op.font === 'helvetica' ? 'Helvetica, Arial, sans-serif' : '"Times New Roman", Times, serif'} fill={op.color} font-weight={op.style === 'bold' || op.style === 'bolditalic' ? 'bold' : 'normal'} font-style={op.style === 'italic' || op.style === 'bolditalic' ? 'italic' : 'normal'} xml:space="preserve">{op.text}</text>
									{:else if op.type === 'line'}
									<line x1={op.x1} y1={op.y1} x2={op.x2} y2={op.y2} stroke={op.color} stroke-width={op.width} />
									{/if}
								{/each}
							</svg>
							<span class="eks-side-nr">{si + 1}</span>
						</div>
					{/each}
				{/if}
				</div>
{#if rendrerStatus}
					<div class="eks-status" class:oppdatert={rendrerStatus === 'oppdatert'}>
						{rendrerStatus === 'rendrer' ? '⏳ Rendrer sidene …' : '✓ Oppdatert'}
					</div>
				{/if}
				<div class="eks-flyt-zoom">
					<button class="ikon-btn" title="Zoom ut" onclick={() => zoom(Math.max(0.5, zoomNivå - 0.15))}>−</button>
					<span>{Math.round(zoomNivå * 100)} %</span>
					<button class="ikon-btn" title="Zoom inn" onclick={() => zoom(Math.min(2, zoomNivå + 0.15))}>+</button>
				</div>
			</div>
			{/if}
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
