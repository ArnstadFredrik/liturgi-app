<script>
	import { app, applyKirkeaar, finnSkriftlesningSeksjon } from '$lib/store.svelte.js';
	import { erMalFavoritt, malAlternativer, secAlternativer } from '$lib/store.svelte.js';
	import { closeModal, showModal, confirmBox, kirkeaarListeModal, adminAltsModal, bibSokModal, chooseOneModal, valgModal, velgTeksterModal, skriftBokstav,	maalformModal, delerTabellModal, malType } from '$lib/modal.svelte.js';
	import DelerTabell from '$lib/DelerTabell.svelte';
	import { målformLabel, malFormFor } from '$lib/maltyper.js';
	import { erOriginalMal } from '$lib/fileio.svelte.js';
	import EditableText from '$lib/EditableText.svelte';
	import { litHtml } from '$lib/lit.js';
	import { mdi } from '$lib/mdi.js';
	import { lookupKirkeaar, hentTekster, kirkeaarDager, lesTeksterCache } from '$lib/kirkeaar.js';

	const m = $derived(app.modal);
	// Alle felt settes i $state-INIT: +page keyer <Modal /> på type+id, så komponenten
	// remountes (fersk init) ved HVER modal-åpning. $effect-åpningen lenger ned kjørte
	// upålitelig (dato ble aldri satt) — init garanterer ferske felt.
	const mInit = app.modal;
	const isNS = mInit?.type === 'newService';
	const pres = isNS ? (mInit.preserve ?? null) : null;
	const forhType = pres?.type ?? mInit?.forhåndsvalgtType ?? 'gudstjeneste';
	let name = $state(isNS ? (pres?.name ?? '') : (mInit?.def ?? ''));
	let date = $state(isNS ? (pres?.date ?? nextSundayISO()) : (mInit?.dato ?? ''));
	let malForm = $state((pres?.malForm ?? localStorage.getItem('opprettMalForm') ?? 'bokmål').toLowerCase());
	let tplId = $state(isNS ? (pres?.tplId ?? app.templates.find((t) => malType(t) === forhType && kanBrukes(t) && malFormFor(t) === malForm)?.id ?? '') : '');
	// Ny lokal mal: base = 'tom' | id på malen som utgangspunkt
	let nyMalBase = $state(mInit?.type === 'nyMal' ? 'tom' : '');
	let altValgte = $state(mInit?.type === 'alternativ' ? [...(mInit.valgte ?? [])] : []);
	let altNyttNavn = $state('');
	const malerBase = $derived(mInit?.type === 'nyMal'
		? app.templates.filter((t) => kanBrukes(t)).sort((a, b) => (erMalFavoritt(b.name) ? 1 : 0) - (erMalFavoritt(a.name) ? 1 : 0) || (a.name ?? '').localeCompare(b.name ?? '', 'no'))
		: []);
	// alternativer for den valgte malen (katalog fra malAlternativer) —
	// bryterne i «Ny gudstjeneste» genereres herfra (checkbox-logikk)
	let altListe = $state([]);
	let altPaa = $state({}); // alternativ -> på/av (flere kan være på samtidig)
	let nyType = $state(forhType);
	let jordpaa = $state('gravferd'); // valgt del-gruppe (fra malens delGrupper)
	let jordpaaGrupper = $state([]); // malens delGrupper — Dynamiske radioer
	// delerTabell: åpen dropdown-celle + administrer-visning
	let apenCelle = $state(null);
	let adminVisning = $state(0);
	let katNyAlt = $state('');
	let katNyVar = $state('');
	let delerFane = $state('hoveddeler');
	// Hent hoveddeler/ledd-modalen
	let hdFane = $state('bibliotek'); // bibliotek | framl
	let hdSoek = $state('');
	let hdRader = $state([]); // bibliotekrader (bibUserList)
	let hdValgt = $state(null); // valgt gruppe { ledd, rader }
	let hdMalId = $state('');
	let hdTil = $state(''); // 'sist' eller seksjonstittel (innsettingspunkt)
	let hdMaler = $state([]);
	let hdKoblet = $state(new Set()); // 's:<tittel>' — koblete hoveddeler denne økten
	let hdHentet = $state(new Set()); // 's:<tittel>' / 'l:<tittel>:<ii>' / 'b:<ledd>' — hentede denne økten // hoveddeler | innstillinger
	let dragSi = $state(null); // drag-and-drop av hoveddeler
	let dragOverSi = $state(null);
	let dragFor = $state(false);
		let maaltNyttNavn = $state(''); // ny målform i maalform-modalen
	let remountTeller = $state(0); // inkrementeres ved type-bytte: {#key} rundt innholdet

	/** Hvilken liturgitype har malen? (egendefinert felt eller navn) */
		/** Kan malen brukes direkte til å opprette gudstjenester? (malen kan selv
	 *  bestemme: «Dåp i hovedgudstjenesten» er bare en del av gudstjenesten.)
	 *  Standard er ja — malen må eksplisitt si kanGudstjeneste: false. */
	function kanBrukes(t) {
		return t.kanGudstjeneste !== false;
	}

	// $derived.by: Svelte 5 robust reaktivitet (stale $state + $effect-kombinasjonen
	// feilet ved type-bytt: mal-listen ble stående tom ved retur til gudstjeneste)
	let malerForType = $state(app.templates.filter((t) => malType(t) === nyType && kanBrukes(t) && malFormFor(t) === malForm));

	// Målformene som FAKTISK finnes blant brukbare maler av valgt type —
	// selector-listen genereres ut fra dette (tomme målformer vises ikke).
	const tilgjengeligeMålformer = $derived([...new Set(
		app.templates.filter((t) => malType(t) === nyType && kanBrukes(t)).map((t) => malFormFor(t))
	)]);

	/** Visningsnavn i mal-listen: målformen er fjernet (den er eget valg),
	 *  årstallet beholdes: «Vigsel (bokmål, 2003)» → «Vigsel (2003)». */
	function visningsNavn(t) {
		return (t.name ?? '').replace(/\s*(bokm\u00e5l|nynorsk|engelsk)\s*,?\s*/gi, '').replace(/\s{2,}/g, ' ').replace(/\(\s*\)/g, '').replace(/\s+,/g, ',').trim();
	}

	const nyListe = $derived.by(() => {
		const favoritter = malerForType.filter((t) => erMalFavoritt(t.name));
		const rest = malerForType.filter((t) => !erMalFavoritt(t.name));
		return { favoritter, originaler: rest.filter((t) => erOriginalMal(t)), brukere: rest.filter((t) => !erOriginalMal(t)) };
	});
	console.log('[modal-mount] maler=' + app.templates.length + ' nyType=' + nyType + ' filtrert=' + malerForType.length + ' typer=' + app.templates.map((t) => malType(t)).join(','));

	// sørg for at valgt mal passer typen når type byttes. NB: malerForType kan være
	// stale i denne effekten (oppdateres av en annen $effect) — filtrer direkte på
	// app.templates med malType, IKKE på malerForType.
	$effect(() => {
		if (m?.type === 'newService') {
			const t = app.templates.find((x) => x.id === tplId);
			if (!t || malType(t) !== nyType || !kanBrukes(t) || malFormFor(t) !== malForm) tplId = app.templates.find((x) => malType(x) === nyType && kanBrukes(x) && malFormFor(x) === malForm)?.id ?? '';
			// målformen må finnes blant typens maler — ellers bytt til første tilgjengelige
			if (tilgjengeligeMålformer.length && !tilgjengeligeMålformer.includes(malForm)) {
				malForm = tilgjengeligeMålformer[0];
				malerForType = app.templates.filter((x) => malType(x) === nyType && kanBrukes(x) && malFormFor(x) === malForm);
				tplId = malerForType[0]?.id ?? '';
			}
		}
	});
	let valgte = $state([]);
	let valgteFjern = $state([]); // fjernFlere: indekser krysset av for sletting
	let visAlt = $state(0); // fjernFlere: hvilket alternativ vises i høyre kolonne
	let fjernMerkede = $state(new Set()); // adminAlts: merkede indekser
	let bokstavInput = $state(''); // velgTekster: brudeparets bokstaver
	let dgNyttNavn = $state(''); // delGruppe: navn på ny gruppe
	let visAdmin = $state(0); // adminAlts: forhåndsvisning
	let valgtAlt = $state(0);
	let kirkeaar = $state(null);
	let tekster = $state(null);
	let teksterStatus = $state('');
	let manuellK = $state(pres?.kirkeaar ?? null);
	// init: slå opp kirkeårsdag for startdatoen direkte ($effect first-run ved
	// remount kjørte upålitelig i Svelte 5 — change-eventene dekkes fortsatt av
	// $effect-en lenger ned)


	// bibliotek-søk
	let bibQ = $state('');
	let bibValgt = $state(-1);
	let bibAltValgt = $state(0);

	/** ISO-dato for kommende søndag (i dag hvis det er søndag). */
	function nextSundayISO() {
		const d = new Date();
		d.setDate(d.getDate() + ((7 - d.getDay()) % 7));
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
	}

	$effect(() => {
		if (m?.type === 'newService') {
			if (m.preserve) {
				// tilbake etter manuell kirkeårsdag-valg: gjenopprett feltene
				nyType = m.preserve.type ?? 'gudstjeneste';
				name = m.preserve.name;
				date = m.preserve.date;
				tplId = m.preserve.tplId;
				altPaa = m.preserve.altPaa ?? {};
				manuellK = m.preserve.kirkeaar;
				kirkeaar = m.preserve.kirkeaar;
			} else {
				// NB: les forhåndsvalgtType inn i en LOKAL variabel — leser vi nyType her
				// blir den en dependency av effekten, og type-bytt-klikk re-triggere
				// effekten som da RESETTER typen tilbake (type-knappene virket ikke)
				const forhType = m.forhåndsvalgtType ?? 'gudstjeneste';
				nyType = forhType;
				jordpaa = 'gravferd';
				name = '';
				date = nextSundayISO();
				// malen forhåndsvalges fra riktig type-liste (IKKE app.templates[0], som kan være
				// en gravferdsmal — originalene lastes først og rekkefølgen er ikke garantert)
				tplId = (app.templates.find((t) => malType(t) === forhType && kanBrukes(t)))?.id ?? '';
				altPaa = {};
				manuellK = null;
			}
		} else if (m?.type === 'prompt') {
			name = m.def ?? '';
		} else if (m?.type === 'choose') {
			valgte = [...m.titles];
		} else if (m?.type === 'chooseOne') {
			valgtAlt = m.sel ?? 0;
		} else if (m?.type === 'fjernFlere') {
			valgteFjern = [];
			visAlt = 0;
		} else if (m?.type === 'adminAlts') {
			fjernMerkede = new Set();
			visAdmin = 0;
		} else if (m?.type === 'bib') {
			bibQ = m.def ?? '';
			bibValgt = -1;
			bibAltValgt = 0;
			bibSok(m.def ?? '');
		} else if (m?.type === 'kirkeaarListe') {
			kDager = kirkeaarDager(m.dato);
			kFilter = '';
			kValgt = null;
		}
		});

	let bibGrupper = $state([]);
	let bibReq = 0;
	// manuell kirkeårsdag-valg
	let kFilter = $state('');
	let kValgt = $state(null);
	let kDager = $state([]);
	/** Fuzzy-søk: alle søketermene må treffe navnet (subsequence, rekkefølge bevart)
	 *  eller datoen (token-likelihood, f.eks. «24-12», «15.11», «advent 24»). */
	const filtrerteDager = $derived.by(() => {
		const q = kFilter.trim().toLowerCase();
		if (!q) return kDager;
		return kDager.filter((d) => q.split(/\s+/).every((term) => subseq(term, d.name.toLowerCase()) || datoTreff(term, d.date)));
	});
	/** Subsequence-match: tegnene i q forekommer i rekkefølge i s. */
	function subseq(q, s) {
		let i = 0;
		for (const c of s) { if (c === q[i]) i++; if (i >= q.length) return true; }
		return q.length === 0;
	}
	/** Dato-treff: godtar «2026-12-24», «12-24», «24-12», «24.12», «24/12» (dd og mm bytter plass). */
	function datoTreff(term, dato) {
		if (!dato) return false;
		const norm = term.replace(/\./g, '-').replace(/\//g, '-');
		if (dato.includes(norm)) return true;
		const p = norm.split('-').filter(Boolean);
		if (p.length === 2 && p.every((x) => /^\d{1,2}$/.test(x))) {
			const [a, b] = p;
			const aa = a.padStart(2, '0'), bb = b.padStart(2, '0');
			return dato.includes(`-${bb}-${aa}`); // «24-12» → -12-24 (dd-mm)
		}
		return false;
	}
	/** Datoendring i modalen: hent dager for nytt kirkeår, behold filteret. */
	function endreDato(nyDato) {
		if (!nyDato) return;
		kDager = kirkeaarDager(nyDato);
		kValgt = null;
	}
	async function bibSok(q) {
		if (!window.liturgi?.bibSearch) { bibGrupper = []; return; }
		const sek = ++bibReq;
		const r = await window.liturgi.bibSearch((q ?? '').trim() || 'forbønn');
		if (sek !== bibReq) return;
		const rows = r.ok ? r.rows : [];
		// grupper per ledd; intro/avslutning følger med som struktur
		const grupper = new Map();
		for (const row of rows) {
			const key = row.kilde + '|' + row.ledd;
			if (!grupper.has(key)) grupper.set(key, { kilde: row.kilde, seksjon: row.seksjon, ledd: row.ledd, rader: [] });
			grupper.get(key).rader.push({ label: row.alt_label, text: row.tekst, intro_tekst: row.intro_tekst ?? '', avsl_tekst: row.avsl_tekst ?? '' });
		}
		// identiske grupper (samme ledd og samme innhold) slås sammen —
		// fire like dåpsbefalinger fra fire kilder er bare én gyldig variant
		const dedupe = new Map();
		for (const g2 of grupper.values()) {
			const nøkkel = g2.ledd.toLowerCase().trim() + '|' + JSON.stringify(g2.rader.map((x) => [x.label, x.text, x.intro_tekst, x.avsl_tekst]));
			if (!dedupe.has(nøkkel)) { g2.kilder = [g2.kilde]; dedupe.set(nøkkel, g2); }
			else if (!dedupe.get(nøkkel).kilder.includes(g2.kilde)) {
				const g1 = dedupe.get(nøkkel);
				g1.kilder.push(g2.kilde);
				g1.kilde = g1.kilder[0] + ' (+' + (g1.kilder.length - 1) + ' kilder)';
			}
		}
		bibGrupper = [...dedupe.values()];
		bibValgt = bibGrupper.length ? 0 : -1;
		bibAltValgt = 0;
		}

	// slå opp kirkeårsdag når datoen endres i ny-gudstjeneste-modalen
	// (manuelt valgt dag har forrang inntil den nullstilles)
	let teksterReq = 0;
	// init: slå opp kirkeårsdag for startdatoen. Kjøres i en $effect som kun leser
	// mount-konstanter (m/isNS/pres/forhType) — IKKE date/nyType (da re-fyrer den
	// ved type-bytte); dato-endringer dekkes av $effect-en under.
	// alternativ-bryterne følger den valgte malen (katalog fra malAlternativer).
	// $effect — ikke onchange — fordi select-bind setter tplId ETTER inline onchange
	// (rekkefølgen ga ellers gammel mal). Effekten skriver altListe KUN ved
	// innholds-endring (sammenlignet som tekst) — skriving hver gang ga en
	// uendelig Svelte-loop (effect_update_depth_exceeded).
	$effect(() => {
		if (m?.type !== 'newService') return;
		const mal = app.templates.find((t) => t.id === tplId);
		const liste = malAlternativer(mal);
		if (liste.join('\u0001') !== altListe.join('\u0001')) altListe = liste;
	});
	$effect(() => {
		if (m?.type === 'newService' && isNS && !pres?.kirkeaar && forhType === 'gudstjeneste') autoKirkeaar();
	});
	$effect(() => {
		if (m?.type === 'newService' && date && !manuellK && nyType === 'gudstjeneste') autoKirkeaar();
	});

	// navneforslag «gudstjeneste - [Kirkeårsdag]»: BRUKES IKKE Lenger som live-forslag
	// i modalen (den gjorde modalen treg) — createService fyller navnet ved opprettelse
	// hvis navnefeltet er tomt
	function navnEndret() { /* beholdt for oninput-kompatibilitet */ }

	function autoKirkeaar() {
		const k = lookupKirkeaar(date);
		kirkeaar = k;
		// CACHEN FØRST: har vi allerede hentet denne dagen (kommende søndag + dager
		// mellom i dag og søndag cachet ved oppstart), brukes den umiddelbart —
		// ingen eksterne kall og «Opprett» kan trykkes med én gang.
		const cached = window.__kirkeaarCache?.finn?.(date, k);
		if (cached) {
			tekster = cached.tekster ?? null;
			teksterStatus = cached.tekster ? 'ok' : 'laster';
			// tekster mangler i cachen (offline ved oppstart)? hent i bakgrunnen
			if (!cached.tekster) {
				const req = ++teksterReq;
				lesTeksterCache().then((c) => hentTekster(k.day, c, k.series)).then((t) => {
					if (req !== teksterReq) return;
					tekster = t;
					teksterStatus = t ? 'ok' : 'feil';
				});
			}
			return;
		}
		tekster = null;
		teksterStatus = k ? 'laster' : '';
		const req = ++teksterReq;
		if (!k) return;
		hentTekster(k.day).then((t) => {
			if (req !== teksterReq) return;
			tekster = t;
			teksterStatus = t ? 'ok' : 'feil';
		});
	}

	function manuellKirkeaar() {
		// husk newService-modalens tilstand og ok-callback, så vi kan komme tilbake
		const forrige = {
			ok: m.ok,
			type: nyType,
			name, date, tplId, altPaa: { ...altPaa },
			kirkeaar, tekster, teksterStatus
		};
		const tilbakeTilNyService = () => {
			showModal({
				type: 'newService', ok: forrige.ok,
				preserve: { type: forrige.type, name: forrige.name, date: forrige.date, tplId: forrige.tplId,
					altPaa: forrige.altPaa, kirkeaar: manuellK }
			});
		};
		kirkeaarListeModal(date, (k) => {
			if (!k) { tilbakeTilNyService(); return; }
			manuellK = k;
			kirkeaar = k;
			// cachen først (samme mønster som autoKirkeaar)
			const cached = window.__kirkeaarCache?.finn?.(k.date, k);
			if (cached) {
				tekster = cached.tekster ?? null;
				teksterStatus = cached.tekster ? 'ok' : 'laster';
				if (!cached.tekster) {
					const req0 = ++teksterReq;
					hentTekster(k.day).then((t) => {
						if (req0 !== teksterReq) return;
						tekster = t;
						teksterStatus = t ? 'ok' : 'feil';
					});
				}
			} else {
				tekster = null;
				teksterStatus = 'laster';
				const req = ++teksterReq;
				hentTekster(k.day).then((t) => {
					if (req !== teksterReq) return;
					tekster = t;
					teksterStatus = t ? 'ok' : 'feil';
				});
			}
			tilbakeTilNyService();
		}, tilbakeTilNyService);
	}

	/** Type-bytte: nullstill malerForType-listen eksplisitt og oppdater nyType.
	 *  Svelte 5 $derived.by som leser nyType var stale ved rask GF→GJ-bryting. */
	/** Målform-bytte: mal-listen viser kun valgt målform; valget huskes. */
	function velgMalForm(mf) {
		malForm = mf;
		try { localStorage.setItem('opprettMalForm', mf); } catch {}
		window.liturgi?.dbSet?.('opprettMalForm', mf);
		malerForType = app.templates.filter((t) => malType(t) === nyType && kanBrukes(t) && malFormFor(t) === malForm);
		tplId = malerForType[0]?.id ?? '';
	}

	function velgType(type) {
		nyType = type;
		malerForType = app.templates.filter((t) => malType(t) === type && kanBrukes(t) && malFormFor(t) === malForm);
		tplId = malerForType[0]?.id ?? ''; // preselect før øvrige effekter
		// del-gruppene er pr valgt mal — uansett type (gudstjeneste-maler kan
		// også ha del-grupper; mangler de, vises ingen del-gruppe-valg)
		oppdaterJordpaaGrupper();
		if (type === 'gudstjeneste') {
			manuellK = null;
			autoKirkeaar();
		}
	}

	function oppdaterJordpaaGrupper() {
		// del-gruppene hentes fra den valgte malen — ingen selvrefererende
		// $effect (den ga en uendelig Svelte-loop ved gravferd-valg)
		// ved type-bytte er tplId ennå ikke oppdatert ($effect kjører etter render)
		// — fall tilbake til den første malen i den nye typen
		const mal = app.templates.find((t) => t.id === tplId) ?? malerForType[0];
		jordpaaGrupper = (mal?.delGrupper ?? []).slice();
		if (!jordpaaGrupper.includes(jordpaa)) jordpaa = jordpaaGrupper[0] ?? null;
	}

	/** Nytt alternativ i malens katalog (brukes av alternativ-modalen) */
	function leggTilAlternativ() {
		const navn = altNyttNavn.trim().toLowerCase();
		if (!navn || !m || m.type !== 'alternativ') return;
		if (!m.liste.includes(navn)) m.liste = [...m.liste, navn];
		if (!m.mal.alternativer) m.mal.alternativer = [];
		if (!m.mal.alternativer.includes(navn)) m.mal.alternativer = [...m.mal.alternativer, navn];
		altNyttNavn = '';
	}

	/** Slett alternativ fra katalogen — fjerner merket fra alle deler i malen */
	function slettAlternativ(navn) {
		if (!m || m.type !== 'alternativ') return;
		m.liste = m.liste.filter((t) => t !== navn);
		if (m.mal.alternativer) m.mal.alternativer = m.mal.alternativer.filter((t) => t !== navn);
		for (const sec of m.mal.sections ?? []) {
			if (Array.isArray(sec.alternativer)) sec.alternativer = sec.alternativer.filter((t) => t !== navn);
			if (sec.alternativ === navn) delete sec.alternativ;
		}
		altValgte = altValgte.filter((t) => t !== navn);
	}

	/** include-objektet til createService: ett på/av per alternativ i katalogen */
	/** veksle ett alternativ-merke på en seksjon (delerTabell-dropdown) */
	/** åpne dropdownen oppover når det er for lite plass under cellen */
	function vilBakOver(el) {
		if (!el) return false;
		const r = el.getBoundingClientRect();
		return window.innerHeight - r.bottom < 340;
	}

	function veksleSecAlt(sec, t, paa) {
		const naa = secAlternativer(sec);
		const ny = paa ? (naa.includes(t) ? naa : [...naa, t]) : naa.filter((x) => x !== t);
		sec.alternativer = ny;
		if (sec.alternativ) delete sec.alternativ;
		if (!ny.length) delete sec.alternativer;
		markDirtyIModal();
	}

	/** Legg til / slett i katalogene (administrer-visningen) */
	function leggTilKatalog(hva, navnRaw) {
		const navn = navnRaw.trim().toLowerCase();
		if (!navn || !m || m.type !== 'delerTabell') return;
		if (hva === 'alternativer') {
			if (!m.alternativer.includes(navn)) m.alternativer = [...m.alternativer, navn];
			if (!m.mal.alternativer) m.mal.alternativer = [];
			if (!m.mal.alternativer.includes(navn)) m.mal.alternativer = [...m.mal.alternativer, navn];
			katNyAlt = '';
		} else {
			if (!m.variasjoner.includes(navn)) m.variasjoner = [...m.variasjoner, navn];
			if (!m.mal.delGrupper) m.mal.delGrupper = [];
			if (!m.mal.delGrupper.includes(navn)) m.mal.delGrupper = [...m.mal.delGrupper, navn];
			katNyVar = '';
		}
	}

	/* ---- Hent hoveddeler/ledd ---- */
	function hdLastRader() {
		if (!window.liturgi?.bibUserList) return;
		window.liturgi.bibUserList().then((r) => { hdRader = Array.isArray(r?.rows) ? r.rows : (Array.isArray(r) ? r : []); });
	}

	function hdGrupper(rader) {
		const m = new Map();
		for (const r of rader) {
			if (!m.has(r.ledd)) m.set(r.ledd, []);
			m.get(r.ledd).push(r);
		}
		return [...m.entries()].map(([ledd, rs]) => ({ ledd, rader: rs }));
	}

	function hdValgteGrupper() {
		const ord = hdSoek.toLowerCase().split(/[\s,]+/).filter((w) => w.length >= 2);
		let rader = hdRader;
		if (ord.length) {
			rader = hdRader
				.map((r) => {
					const hay = (r.ledd + ' ' + r.mappe + ' ' + (r.tags ?? '') + ' ' + (r.alt_label ?? '')).toLowerCase();
					return { r, score: ord.filter((w) => hay.includes(w)).length };
				})
				.filter((x) => x.score > 0)
				.sort((a, b) => b.score - a.score)
				.map((x) => x.r);
		}
		return hdGrupper(rader);
	}

	function hdVelgMal(id) {
		hdMalId = id;
	}

	function hdMalerListe() {
		return app.templates
			.slice()
			.sort((a, b) => String(a.name ?? '').localeCompare(String(b.name ?? ''), 'no'))
			.map((t) => ({ id: t.id, name: t.name }));
	}

	function hdMal() {
		return app.templates.find((t) => t.id === hdMalId) ?? null;
	}

	function hdKopi(items) {
		return JSON.parse(JSON.stringify(items ?? []));
	}

	function hdHentLedd(gruppe) {
		m.ok({ type: 'ledd', kilde: 'bibliotek', gruppe, til: hdTil });
		hdHentet.add('b:' + gruppe.ledd); hdHentet = new Set(hdHentet);
	}

	function hdHentSeksjon(tittel) {
		m.ok({ type: 'seksjon', kilde: 'mal', malId: hdMalId, tittel, til: hdTil });
		hdHentet.add('s:' + tittel); hdHentet = new Set(hdHentet);
	}

	function hdKoble(tittel) {
		m.ok({ type: 'lenk', malId: hdMalId, tittel, til: hdTil });
		hdKoblet.add('s:' + tittel); hdKoblet = new Set(hdKoblet);
	}

	function hdHentMalLedd(tittel, ii) {
		m.ok({ type: 'ledd', kilde: 'mal', malId: hdMalId, tittel, leddIdx: ii, til: hdTil });
		hdHentet.add('l:' + tittel + ':' + ii); hdHentet = new Set(hdHentet);
	}

	function slettKatalog(hva, navn) {
		if (!m || m.type !== 'delerTabell') return;
		const iBruk = (hva === 'alternativer'
			? (m.mal.sections ?? []).filter((sec) => (Array.isArray(sec.alternativer) && sec.alternativer.includes(navn)) || sec.alternativ === navn)
			: (m.mal.sections ?? []).filter((sec) => sec.delGruppe === navn));
		const utfør = () => slettKatalogNå(hva, navn);
		if (iBruk.length) {
			const nav = navn[0].toUpperCase() + navn.slice(1);
			confirmBox('Slettes fra katalogen?',
				`\u00ab${nav}\u00bb er i bruk på ${iBruk.length} hoveddel${iBruk.length === 1 ? '' : 'er'} \u2014 merkingen fjernes fra alle delene. Vil du slette den fra katalogen?`,
				utfør);
		} else utfør();
	}

	function slettKatalogNå(hva, navn) {
		if (!m || m.type !== 'delerTabell') return;
		if (hva === 'alternativer') {
			m.alternativer = m.alternativer.filter((t) => t !== navn);
			if (m.mal.alternativer) m.mal.alternativer = m.mal.alternativer.filter((t) => t !== navn);
			for (const sec of m.mal.sections ?? []) {
				if (Array.isArray(sec.alternativer)) sec.alternativer = sec.alternativer.filter((t) => t !== navn);
				if (sec.alternativ === navn) delete sec.alternativ;
			}
		} else {
			m.variasjoner = m.variasjoner.filter((v) => v !== navn);
			if (m.mal.delGrupper) m.mal.delGrupper = m.mal.delGrupper.filter((v) => v !== navn);
			for (const sec of m.mal.sections ?? []) {
				if (sec.delGruppe === navn) sec.delGruppe = undefined;
			}
		}
		apenCelle = null;
	}

	/** Drag-and-drop: endre rekkefølge på hoveddelene (håndtaket først i raden) */
	function startDragRad(e, si) {
		dragSi = si;
		const rad = e.currentTarget.closest('.m-deler-rad');
		if (rad && e.dataTransfer.setDragImage) {
			const r = rad.getBoundingClientRect();
			e.dataTransfer.setDragImage(rad, Math.max(20, e.clientX - r.left), r.height / 2);
		}
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('text/plain', 'deler-' + si);
	}

	function dragOverRad(e, si) {
		if (dragSi === null || si === dragSi) return;
		e.preventDefault();
		e.dataTransfer.dropEffect = 'move';
		const r = e.currentTarget.getBoundingClientRect();
		dragFor = e.clientY < r.top + r.height / 2;
		dragOverSi = si;
	}

	function droppRad(e, si) {
		e.preventDefault();
		if (dragSi === null) { dragSi = null; dragOverSi = null; return; }
		const secs = m.mal.sections;
		let target = dragFor ? si : si + 1;
		if (dragSi < target) target--;
		if (target !== dragSi) {
			const flyttet = secs.splice(dragSi, 1)[0];
			secs.splice(target, 0, flyttet);
			markDirtyIModal();
		}
		dragSi = null; dragOverSi = null; dragFor = false;
	}

	function includeObj() {
		const o = {};
		for (const t of altListe) o[t] = altPaa[t] !== false;
		return o;
	}

	function nullstillKirkeaar() {
		manuellK = null;
		autoKirkeaar();
	}

	function ok() {
		if (!m) return;
		if (m.type === 'hentDeler') { closeModal(); return; } // «Ferdig» — alt hentes via per-rad-knappene
		const forrige = m;
		if (m.type === 'prompt') m.ok(name.trim());
		else if (m.type === 'nyMal') m.ok(name.trim(), nyMalBase === 'tom' ? null : nyMalBase);
		else if (m.type === 'confirm' || m.type === 'valg') m.ok();
		else if (m.type === 'lukk') { m.ok(); return; } // onLagre lukker selv (kan bli avbrutt av lagre-dialog)
		else if (m.type === 'newService') {
			const opprett = () => {
							if (nyType === 'gravferd') {
					m.ok(name.trim(), date, tplId, { dåp: false, nattverd: false }, null, null);
					// bare del-gruppe-markert seksjon for valgt sted tas med — tittelen
					// kan være endret av brukeren (delGruppe settes på avsnittet i malen)
					const cur = app.current;
					if (cur) cur.sections = cur.sections.filter((s) => !s.delGruppe || s.delGruppe === jordpaa);
				}
				else m.ok(name.trim(), date, tplId, includeObj(), kirkeaar, tekster);
				if (app.modal === forrige) closeModal();
				// del-gruppe pr valgt mal (gjelder alle typer): bare deler uten del-gruppe
				// eller med den valgte gruppen tas med — hvis malen har del-grupper
				if (jordpaaGrupper.length && app.current) {
					app.current.sections = app.current.sections.filter((s) => !s.delGruppe || s.delGruppe === jordpaa);
				}
				if (nyType === 'vigsel' && app.current) {
					const sk = finnSkriftlesningSeksjon(app.current);
					if (sk) velgTeksterModal(sk); // spør om 2–4 tekster med en gang
				}
			};
			// BAKGRUNNSOPPRETTELSE: vent IKKE på tekstepplaget — opprett umiddelbart,
			// fyll tekstene i bakgrunnen så planleggingen kan begynne med én gang.
			// (kirkeaar-metadatene — navn/farge/tekstrekke/referanser — er synkrone fra
			// church-year-pakken; bare selve bibeltekstene er eksterne.)
			if (nyType === 'gudstjeneste' && kirkeaar && teksterStatus === 'laster') {
				// tekster kan komme i ettertid: lag dem i cachen og fyll gudstjenesten når de er der
				const k = kirkeaar;
				hentTekster(k.day).then((t) => {
					window.__kirkeaarCache?.hent?.(date); // oppdater cachen (få med tekstene til neste gang)
					// oppdater den AKTIVE gudstjenesten hvis den fortsatt matcher denne dagen/malen
					const cur = app.current;
					if (!cur || cur.date !== date || cur.templateName !== app.templates.find((x) => x.id === tplId)?.name) return;
					if (t) applyKirkeaar(cur, k, t); // eksportert fra store.svelte.js — samme fyll som ved opprettelse
				});
				m.ok(name.trim(), date, tplId, includeObj(), kirkeaar, null);
				if (app.modal === forrige) closeModal();
				return;
			}
			opprett();
			return;
		} else if (m.type === 'choose') m.ok([...valgte]);
		else if (m.type === 'chooseOne') m.ok(valgtAlt);
		else if (m.type === 'fjernFlere') m.ok([...valgteFjern].sort((a, b) => b - a));
		else if (m.type === 'adminAlts' || m.type === 'velgTekster' || m.type === 'delerTabell') return; // live-redigering — Ferdig lukker
		else if (m.type === 'bib') {
			const gruppe = bibGrupper[bibValgt];
			m.ok(gruppe, m.mode === 'innhold' ? gruppe?.rader[bibAltValgt] : null);
		} else if (m.type === 'kirkeaarListe') m.ok(kValgt != null ? filtrerteDager[kValgt] : null);
		// lukk kun hvis ok-callbacken ikke byttet til en ny modal
		if (app.modal === forrige) closeModal();
	}

	/** adminAlts-hjelpere: jobber direkte på m.it[m.liste] (Svelte-proxy). */
	function nyttTomt() {
		const l = m.it[m.liste];
		if (!Array.isArray(l)) m.it[m.liste] = [];
		m.it[m.liste].push({ label: 'Alternativ ' + String.fromCharCode(97 + m.it[m.liste].length), text: '' });
		visAdmin = m.it[m.liste].length - 1;
		markDirtyIModal();
	}
	function hentFraBib(mode) {
		// SNAPSHOTT lokalt: bibSokModal bytter app.modal, så `m` peker på
		// bib-modalen når callbacken kjører — ikke administratoren.
		const it = m.it, liste = m.liste, selNokkel = m.selNokkel, tittel = m.title;
		const def = (it?.heading ?? '').replace(/^[*\d–\-\s]+/, '').trim();
		bibSokModal(def, mode, (gruppe, alt) => {
			if (!gruppe) return;
			if (mode === 'innhold' && alt) {
				it[liste].push({ label: alt.label || 'Alternativ ' + String.fromCharCode(97 + it[liste].length), text: alt.text });
				visAdmin = it[liste].length - 1;
			} else if (mode === 'ledd') {
				// hele leddet: brukeren velger ERSTATT eller LEGG TIL (vanlig modal, to knapper)
				const alternativer = gruppe.rader.map((r) => ({ label: r.label || '', text: r.text }));
				const leggTil = () => {
					// hopp over de som finnes fra før (samme label og tekst)
					const eks = new Set((it[liste] ?? []).map((a) => (a.label || '') + '|' + (a.text || '').slice(0, 60)));
					for (const a of alternativer) {
						if (eks.has((a.label || '') + '|' + (a.text || '').slice(0, 60))) continue;
						it[liste].push({ ...a });
					}
					if (selNokkel) it[selNokkel] = 0;
					visAdmin = 0;
					fjernMerkede = new Set();
					markDirtyIModal();
					adminAltsModal(it, liste, selNokkel, tittel);
				};
				valgModal(
					'Hent «' + (it.heading ?? '') + '» fra biblioteket',
					alternativer.length + ' alternativer skal inn i leddet. Erstatt de nåværende, eller legg dem til som nye?',
					'Erstatt', 'Legg til',
					() => {
						it[liste] = alternativer;
						if (selNokkel) it[selNokkel] = 0;
						visAdmin = 0;
						fjernMerkede = new Set();
						markDirtyIModal();
						adminAltsModal(it, liste, selNokkel, tittel);
					},
					() => leggTil()
				);
				return;
			}
			fjernMerkede = new Set();
			markDirtyIModal();
			// gjenåpne administratoren over den oppdaterte listen
			adminAltsModal(it, liste, selNokkel, tittel);
		}, () => adminAltsModal(it, liste, selNokkel, tittel));
	}
	function settBokstaver() {
		if (!m || m.type !== 'velgTekster') return;
		const koder = bokstavInput.toUpperCase().replace(/[^A-Z]/g, '').split('');
		const n = new Set();
		for (const k of koder) {
			const idx = m.seksjon.items.findIndex((it, i) => skriftBokstav(it, i) === k);
			if (idx !== -1) n.add(idx);
		}
		m.valgte = n;
		bokstavInput = '';
	}

	function leggTilMaalform() {
		if (!m || m.type !== 'maalform') return;
		const navn = maaltNyttNavn.trim().toLowerCase();
		if (!navn) return;
		if (!m.former.includes(navn)) m.former = [...m.former, navn];
		m.valgt = navn;
		maaltNyttNavn = '';
	}




	function applyVelgTekster() {
		if (!m || m.type !== 'velgTekster') return;
		(m.seksjon.items ?? []).forEach((it, idx) => {
			if (!skriftBokstav(it, idx)) { it.enabled = true; return; } // tittel/innledning alltid med
			it.enabled = m.valgte.has(idx);
		});
	}

	function markDirtyIModal() {
		import('$lib/store.svelte.js').then((st) => st.markDirty());
	}

	function onKey(e) {
		if (e.key === 'Enter') ok();
		if (e.key === 'Escape') closeModal();
	}
	// Escape lukker modalen uansett hvor fokuset er (globalt — ikke bare i
	// tekstfeltene med onKey); Enter forblir lokalt for input-feltene
	$effect(() => {
		if (!m) return;
		const h = (e) => { if (e.key === 'Escape') closeModal(); };
		window.addEventListener('keydown', h);
		return () => window.removeEventListener('keydown', h);
	});
</script>

{#if m}
	<div id="modal-back">
		<div id="modal" class={m.type === 'chooseOne' || m.type === 'bib' || m.type === 'velgTekster' || m.type === 'delerTabell' ? 'bred' : ''} role="dialog">
			<h3>{m.title}</h3>
			{#if m.type === 'confirm'}
				<p>{m.message}</p>
			{:else if m.type === 'prompt'}
				<label>
					{m.label}
					<input bind:value={name} onkeydown={onKey} />
				</label>
			{:else if m.type === 'newService'}
				<div class="m-type" role="radiogroup" aria-label="Type">
					<button type="button" role="radio" aria-checked={nyType === 'gudstjeneste'} class={nyType === 'gudstjeneste' ? 'm-type-btn sel' : 'm-type-btn'} onclick={() => { velgType('gudstjeneste'); remountTeller += 1; }} title="Gudstjeneste">{@html mdi('church')}<span>Gudstjeneste</span></button>
					<button type="button" role="radio" aria-checked={nyType === 'vigsel'} class={nyType === 'vigsel' ? 'm-type-btn sel' : 'm-type-btn'} onclick={() => { velgType('vigsel'); remountTeller += 1; }} title="Vigsel">{@html mdi('heart')}<span>Vigsel</span></button>
					<button type="button" role="radio" aria-checked={nyType === 'gravferd'} class={nyType === 'gravferd' ? 'm-type-btn sel' : 'm-type-btn'} onclick={() => { velgType('gravferd'); remountTeller += 1; }} title="Gravferd">{@html mdi('flower-tulip')}<span>Gravferd</span></button>
				</div>
				<label>
					Målform
					<div class="fb-visning-velger" role="group" aria-label="Målform">
						{#each tilgjengeligeMålformer as mf (mf)}
							<button type="button" class:sel={malForm === mf} onclick={() => velgMalForm(mf)}>{målformLabel(mf)}</button>
						{/each}
					</div>
				</label>
				<label>
					Mal
					<select bind:value={tplId} onchange={() => oppdaterJordpaaGrupper()}>
						{#if malerForType.length === 0}
							<option value="">Ingen maler på {målformLabel(malForm).toLowerCase()} ennå</option>
						{/if}
						{#if nyListe.favoritter.length}
							<optgroup label="Favoritter">
								{#each nyListe.favoritter as t (t.id)}
									<option value={t.id}>{visningsNavn(t)}</option>
								{/each}
							</optgroup>
						{/if}
						<optgroup label="Originaler">
							{#each nyListe.originaler as t (t.id)}
								<option value={t.id}>{visningsNavn(t)}</option>
							{/each}
						</optgroup>
						{#if nyListe.brukere.length}
							<optgroup label="Brukermaler">
								{#each nyListe.brukere as t (t.id)}
									<option value={t.id}>{visningsNavn(t)}</option>
								{/each}
							</optgroup>
						{/if}
					</select>
				</label>
				<label>
					Navn
					<input bind:value={name} onkeydown={onKey} oninput={navnEndret} placeholder="F.eks. Gudstjeneste - 25. søndag i treenighetstiden" />
				</label>
				<label>
					Dato
					<input type="date" value={date} onchange={(e) => { date = e.currentTarget.value; manuellK = null; }} />
				</label>
				{#key remountTeller}
				{#if nyType === 'gudstjeneste'}
					{#if kirkeaar}
						<p class="m-kirkeaar">☀️ {kirkeaar.name}{#if kirkeaar.color}&nbsp;· {kirkeaar.color}{/if}
							<button class="link-btn" onclick={manuellKirkeaar}>endre …</button>
							{#if manuellK}<button class="link-btn" onclick={nullstillKirkeaar} title="Bruk datoens kirkeårsdag">tilbakestill</button>{/if}</p>
						{#if teksterStatus === 'laster'}<p class="m-kirkeaar muted">Henter bibeltekster …</p>
						{:else if teksterStatus === 'feil'}<p class="m-kirkeaar muted">Klarte ikke hente bibeltekstene – kun referanser fylles inn.</p>
						{:else if teksterStatus === 'ok' && !manuellK}<p class="m-kirkeaar muted">✓ Bibeltekstene hentes inn i gudstjenesten.</p>
						{:else if teksterStatus === 'ok' && manuellK}<p class="m-kirkeaar muted">✓ Bibeltekstene hentes for den valgte kirkeårsdagen.</p>
						{/if}
					{:else if date}
						<p class="m-kirkeaar muted">Ingen kirkeårsdag funnet for datoen.
							<button class="link-btn" onclick={manuellKirkeaar}>velg manuelt …</button></p>
					{/if}
					<!-- Av/på-knapper (mac-nativ switch-stil): logikken er fortsatt checkbox -->
					<div class="m-chk">
						{#each altListe as at (at)}
							<button type="button" class="avpaa" role="checkbox" aria-checked={altPaa[at] !== false} onclick={() => { altPaa = { ...altPaa, [at]: !(altPaa[at] !== false) }; }}>
								<span class="avpaa-tekst">Med {at[0].toUpperCase() + at.slice(1)}</span>
								<span class="avpaa-bryter" aria-hidden="true"><span class="avpaa-klump"></span></span>
							</button>
						{/each}
					</div>
					{#if jordpaaGrupper.length}
						<!-- del-gruppe pr valgt mal (radio-enten/eller) — vises bare når
						     malen faktisk har del-grupper -->
						<div class="m-chk m-chk-jord">
							<span class="m-jordpaa-label">Variant:</span>
							{#each jordpaaGrupper as g, gi (g)}
								<button type="button" class="avpaa" role="radio" aria-checked={jordpaa === g} onclick={() => { jordpaa = g; }}>
									<span class="avpaa-tekst">{g[0].toUpperCase() + g.slice(1)}</span>
									<span class="avpaa-bryter" aria-hidden="true"><span class="avpaa-klump"></span></span>
								</button>
							{/each}
						</div>
						<p class="m-kirkeaar muted">Bare delene uten del-gruppe eller med den valgte gruppen tas med.</p>
					{/if}
					{:else if nyType === 'gravferd'}
						<!-- Jordpåkastelse: av/på-knapper — logikken er fortsatt radioknapper
						     (bind:group, kun én av to kan være på) -->
						{#if jordpaaGrupper.length}
						<div class="m-chk m-chk-jord">
							<span class="m-jordpaa-label">Variant:</span>
							{#each jordpaaGrupper as g, gi (g)}
								<button type="button" class="avpaa" role="radio" aria-checked={jordpaa === g} onclick={() => { jordpaa = g; }}>
									<span class="avpaa-tekst">{g[0].toUpperCase() + g.slice(1)}</span>
									<span class="avpaa-bryter" aria-hidden="true"><span class="avpaa-klump"></span></span>
								</button>
							{/each}
						</div>
						<p class="m-kirkeaar muted">Gravferdsordningen bruker ikke kirkeårsdag, bibelteksthenting eller dåp/nattverd-valg. Bare den valgte jordpåkastelsesdelen tas med.</p>
						{/if}
				{/if}
				{/key}
			{:else if m.type === 'choose'}
				<p>Velg deler som skal hentes inn fra malen:</p>
				<div class="m-chk">
					{#each m.titles as t (t)}
						<label class="chk"><input type="checkbox" value={t} bind:group={valgte} /> {t}</label>
					{/each}
				</div>
			{:else if m.type === 'chooseOne'}
				<div class="m-velg-to-kolonner">
					<div class="m-velg-liste">
						<p class="muted m-velg-hint">Velg alternativ:</p>
						{#each m.options as o, ai (ai)}
							<button type="button" class="m-velg-rad" class:sel={valgtAlt === ai}
								onclick={() => (valgtAlt = ai)}>
								{o.label || 'Alternativ ' + String.fromCharCode(97 + ai)}
							</button>
						{/each}
					</div>
					<div class="m-velg-visning lit-text">
						{@html litHtml(m.options[valgtAlt]?.text || '')}
					</div>
				</div>
			{:else if m.type === 'fjernFlere'}
				<p class="muted m-velg-hint">Klikk på kortet for å se alternativet — krysse av for å markere det for sletting.</p>
				<div class="m-bib-cols">
					<div class="m-bib-list m-fjern-liste">
						{#each m.options as o, ai (ai)}
							<div class="m-fjern-rad">
								<input type="checkbox" checked={valgteFjern.includes(ai)}
									aria-label={'Marker «' + (o.label || 'Alternativ ' + String.fromCharCode(97 + ai)) + '» for sletting'}
									onchange={(e) => { if (e.currentTarget.checked) valgteFjern = [...valgteFjern, ai]; else valgteFjern = valgteFjern.filter((x) => x !== ai); }}
									onclick={(e) => e.stopPropagation()} />
								<button type="button" class="m-bib-alt-row m-fjern-kort" class:sel={visAlt === ai}
									onclick={() => (visAlt = ai)}>
									<span class="alt-label">{o.label || 'Alternativ ' + String.fromCharCode(97 + ai)}</span>
									<span class="m-bib-alt m-bib-lit">{@html litHtml(o.text || '')}</span>
								</button>
							</div>
						{/each}
					</div>
					<div class="m-bib-list m-bib-altliste m-fjern-visning lit-text">
						{@html litHtml(m.options[visAlt]?.text || '')}
					</div>
				</div>
			{:else if m.type === 'adminAlts'}
				<p class="muted m-velg-hint">Navn kan endres rett i feltet — klikk kortet for forhåndsvisning, hake markerer for sletting.</p>
				<div class="m-bib-cols">
					<div class="m-bib-list m-fjern-liste">
						{#each m.it[m.liste] as o, ai (ai)}
							<div class="m-fjern-rad">
								<input type="checkbox" checked={fjernMerkede.has(ai)}
									aria-label={'Marker «' + (o.label || 'Alternativ ' + String.fromCharCode(97 + ai)) + '» for sletting'}
									onchange={(e) => {
										const n = new Set(fjernMerkede);
										if (e.currentTarget.checked) n.add(ai); else n.delete(ai);
										fjernMerkede = n;
									}}
									onclick={(e) => e.stopPropagation()} />
								<button type="button" class="m-bib-alt-row m-fjern-kort" class:sel={visAdmin === ai}
									onclick={() => (visAdmin = ai)}>
									<span class="m-fjern-kort-navn">{o.label || 'Alternativ ' + String.fromCharCode(97 + ai)}</span>
								</button>
							</div>
						{/each}
						{#if !m.it[m.liste]?.length}<p class="m-kirkeaar muted">Ingen alternativer.</p>{/if}
					</div>
					<div class="m-bib-list m-bib-altliste m-fjern-visning">
						{#key visAdmin}
							{#if m.it[m.liste]?.[visAdmin]}
								<input class="m-alts-navn" value={m.it[m.liste][visAdmin].label ?? ''}
									placeholder="Navn på alternativet" spellcheck="false"
									oninput={(e) => { m.it[m.liste][visAdmin].label = e.currentTarget.value; markDirtyIModal(); }}
									onkeydown={(e) => e.stopPropagation()} />
								<EditableText bind:value={m.it[m.liste][visAdmin].text} kind="lit"
									startRedigering={true} visFerdig={false} />
							{/if}
						{/key}
					</div>
				</div>
			{:else if m.type === 'bib'}
				<label class="m-bib-q">
					Søk i hovedgudstjenesten
					<input bind:value={bibQ} oninput={() => bibSok(bibQ)} placeholder='F.eks. «forbønn», «velsignelse» …' spellcheck="false" />
				</label>
				{#if !bibGrupper.length}
					<p class="m-kirkeaar muted">Ingen treff. Prøv et annet søkeord.</p>
				{:else if m.mode === 'innhold'}
					<div class="m-bib-cols">
						<div class="m-bib-list" role="listbox">
							{#each bibGrupper as g, gi (g.kilde + '|' + g.ledd)}
								<button type="button" class="m-bib-gruppe" class:sel={bibValgt === gi}
									onclick={() => { bibValgt = gi; bibAltValgt = 0; }}>
									<span class="m-bib-seksjon">{g.seksjon}</span>
									<span class="m-bib-ledd">{g.ledd}</span>
									{#if g.rader.length > 1}<span class="m-bib-antall">{g.rader.length} alternativer</span>{/if}
								</button>
							{/each}
						</div>
						<div class="m-bib-list m-bib-altliste" role="listbox">
							{#if bibGrupper[bibValgt]}
								{#each bibGrupper[bibValgt].rader as r, ri (ri)}
									<button type="button" class="m-bib-alt-row" class:sel={bibAltValgt === ri}
										onclick={() => (bibAltValgt = ri)}>
										<span class="alt-label">{r.label || 'Fast tekst'}</span>
										<span class="m-bib-alt m-bib-lit">{@html litHtml(r.text)}</span>
									</button>
								{/each}
							{/if}
						</div>
					</div>
				{:else}
					<div class="m-bib-cols">
						<div class="m-bib-list" role="listbox">
							{#each bibGrupper as g, gi (g.kilde + '|' + g.ledd)}
								<button type="button" class="m-bib-gruppe" class:sel={bibValgt === gi}
									onclick={() => (bibValgt = gi)}>
									<span class="m-bib-seksjon">{g.seksjon}</span>
									<span class="m-bib-ledd">{g.ledd}</span>
									{#if g.rader.length > 1}<span class="m-bib-antall">{g.rader.length} alternativer</span>{/if}
								</button>
							{/each}
						</div>
						<div class="m-bib-list m-bib-altliste">
							{#if bibGrupper[bibValgt]}
								<p class="m-kirkeaar">Hele leddet hentes med alle alternativene:</p>
								{#each bibGrupper[bibValgt].rader as r, ri (ri)}
									<div class="m-bib-alt-row">
										<span class="alt-label">{r.label || 'Fast tekst'}</span>
										<span class="m-bib-alt m-bib-lit">{@html litHtml(r.text)}</span>
									</div>
								{/each}
							{/if}
						</div>
					</div>
				{/if}
			{:else if m.type === 'valg'}
				<p>{m.message}</p>
			{:else if m.type === 'lukk'}
				<p>{m.message}</p>
			{:else if m.type === 'kirkeaarListe'}
				<p class="m-kirkeaar muted">Velg kirkeårsdag</p>
				<label>
					Dato
					<input type="date" value={m.dato} onchange={(e) => endreDato(e.currentTarget.value)} />
				</label>
				<input bind:value={kFilter} placeholder='Søk, f.eks. «advent», «påske», «24-12» …' spellcheck="false" />
				<div class="m-bib-list m-kirkeaar-liste">
					{#each filtrerteDager as d, di (d.day.id + d.date)}
						<button type="button" class="m-bib-gruppe" class:sel={kValgt === di}
							onclick={() => (kValgt = di)}>
							<span class="m-bib-ledd">{d.name}</span>
							<span class="m-bib-antall">{d.date}{#if d.color}&nbsp;· {d.color}{/if}{#if d.series}&nbsp;· {d.series}{/if}</span>
						</button>
					{/each}
					{#if !filtrerteDager.length}<p class="m-kirkeaar muted">Ingen treff.</p>{/if}
				</div>
			{:else if m.type === 'velgTekster'}
				<p class="m-hint">Velg 2–4 tekster. Bare merkede tekster følger med gudstjenesten. Bokstavene stemmer med lista brudeparet har fått.</p>
				<div class="m-bokstav-rad">
					<input class="m-bokstav-inn" placeholder="Bokstaver, f.eks. B, E, H" bind:value={bokstavInput}
						onkeydown={(e) => { if (e.key === 'Enter') { settBokstaver(); e.preventDefault(); } }} />
					<button onclick={() => settBokstaver()}>Velg bokstaver</button>
					<span class="m-bokstav-telling" class:m-treng-merk={m.valgte.size < 2 || m.valgte.size > 4}>{m.valgte.size} valgt</span>
				</div>
				{#if m.valgte.size > 4}
					<p class="m-tekst-advarsel">{m.valgte.size} tekster er merket — leselista i ordningen blir lang. Vanlig er 2–4.</p>
				{/if}
				<div class="m-tekst-liste">
					{#each m.seksjon.items as it, idx (it.id)}
						{#if skriftBokstav(it, idx)}
							<label class="m-tekst-rad">
								<input type="checkbox" checked={m.valgte.has(idx)}
									onchange={(e) => {
										const n = new Set(m.valgte);
										if (e.target.checked) n.add(idx); else n.delete(idx);
										m.valgte = n;
									}} />
								<span class="m-tekst-bokstav">{skriftBokstav(it, idx)}</span>
								<span class="m-tekst-navn">{it.heading}</span>
							</label>
						{:else}
							<div class="m-tekst-tittel">{it.heading}</div>
						{/if}
					{/each}
				</div>
			{:else if m.type === 'nyMal'}
				<p class="muted m-velg-hint">Lag en egen mal — helt tom, eller med en eksisterende mal som utgangspunkt (kopien får samme struktur, innhold og målform).</p>
				<label>
					Navn på malen
					<input bind:value={name} onkeydown={onKey} />
				</label>
				<div class="m-dg-liste" role="radiogroup" aria-label="Utgangspunkt">
					<button type="button" class="m-dg-rad" class:sel={nyMalBase === 'tom'} role="radio" aria-checked={nyMalBase === 'tom'}
						onclick={() => { nyMalBase = 'tom'; }}>
						<span class="m-dg-navn">Tom mal</span>
					</button>
					<button type="button" class="m-dg-rad" class:sel={nyMalBase !== 'tom'} role="radio" aria-checked={nyMalBase !== 'tom'}
						onclick={() => { if (nyMalBase === 'tom') nyMalBase = malerBase[0]?.id ?? 'tom'; }}>
						<span class="m-dg-navn">Kopi av eksisterende mal</span>
					</button>
				</div>
				{#if nyMalBase !== 'tom' && malerBase.length}
					<label>
						Utgangspunkt
						<select bind:value={nyMalBase}>
							{#each malerBase as t (t.id)}
								<option value={t.id}>{visningsNavn(t)}</option>
							{/each}
						</select>
					</label>
				{/if}
			{:else if m.type === 'delerTabell'}
				<DelerTabell mal={m.mal} />
			{:else if m.type === 'hentDeler'}
				<div class="fb-visning-velger m-deler-faner" role="tablist">
					<button role="tab" aria-selected={hdFane === 'bibliotek'} class:sel={hdFane === 'bibliotek'} onclick={() => { hdFane = 'bibliotek'; hdLastRader(); }}>Bibliotek</button>
					<button role="tab" aria-selected={hdFane === 'framl'} class:sel={hdFane === 'framl'} onclick={() => { hdFane = 'framl'; hdMaler = hdMalerListe(); if (!hdMalId) hdMalId = hdMaler[0]?.id ?? ''; }}>Fra mal</button>
				</div>
				<label class="hd-til">
					Sett inn i
					<select bind:value={hdTil}>
						<option value="">Sist i gudstjenesten</option>
						{#each app.current?.sections ?? [] as s (s.title)}
							<option value={s.title}>Etter «{s.title}»</option>
						{/each}
					</select>
				</label>
				{#if hdFane === 'bibliotek'}
					<div class="hd-soek">
						<input placeholder="Søk i biblioteket …" bind:value={hdSoek} />
					</div>
					<div class="hd-liste">
						{#each hdValgteGrupper() as g2 (g2.ledd)}
							<div class="hd-gruppe" class:sel={hdValgt?.ledd === g2.ledd}
								onclick={() => { hdValgt = hdValgt?.ledd === g2.ledd ? null : g2; }}>
								<span class="hd-gruppe-navn">{g2.ledd}</span>
								<span class="hd-gruppe-antall">{g2.rader.length}</span>
							</div>
							{#if hdValgt?.ledd === g2.ledd}
								<div class="hd-varianter">
									{#each g2.rader as r (r.id)}
										<div class="hd-variant"><span>{r.alt_label || 'Variant'}</span></div>
									{/each}
									{#if hdHentet.has('b:' + hdValgt.ledd)}
										<button type="button" class="hd-hent hd-koblet" disabled>{@html mdi('check', 14)} Hentet</button>
									{:else}
										<button type="button" class="hd-hent" onclick={() => hdHentLedd(hdValgt)}>Hent inn ledd</button>
									{/if}
								</div>
							{/if}
						{/each}
						{#if !hdValgteGrupper().length}<p class="muted hd-tom">Ingen treff.</p>{/if}
					</div>
				{:else}
					<label class="hd-velg-mal">
						Mal
						<select bind:value={hdMalId} onchange={() => hdVelgMal(hdMalId)}>
							{#each hdMaler as t (t.id)}
								<option value={t.id}>{t.name}</option>
							{/each}
						</select>
					</label>
					<div class="hd-tre">
						{#each hdMal()?.sections ?? [] as sec (sec.title)}
							<div class="hd-sec">
								<div class="hd-sec-rad">
									<span class="hd-sec-navn">{sec.title}</span>
									<span class="hd-sec-knapper">
										{#if hdHentet.has('s:' + sec.title)}
										<button type="button" class="hd-koblet" disabled>{@html mdi('check', 13)} Hentet</button>
									{:else}
										<button type="button" onclick={() => hdHentSeksjon(sec.title)}>Hent inn</button>
									{/if}
									{#if hdKoblet.has('s:' + sec.title)}
										<button type="button" class="hd-koblet" disabled>{@html mdi('check', 13)} Koblet</button>
									{:else}
										<button type="button" title="Koble hoveddelen til malen — innholdet fornyes ved åpning" onclick={() => hdKoble(sec.title)}>Koble sammen</button>
									{/if}
									</span>
								</div>
								<div class="hd-led-liste">
									{#each sec.items ?? [] as it, ii (ii)}
										<div class="hd-led">
											<span class="hd-led-tekst">{(it.heading ?? '').replace(/^[*=#\s]+/, '').trim() || '[tomt ledd]'}</span>
											{#if hdHentet.has('l:' + sec.title + ':' + ii)}
											<button type="button" class="hd-koblet" disabled>{@html mdi('check', 13)} Hentet</button>
										{:else}
											<button type="button" title="Hent dette leddet" onclick={() => hdHentMalLedd(sec.title, ii)}>Hent inn</button>
										{/if}
										</div>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				{/if}
			{:else if m.type === 'maalform'}
				<p class="muted m-velg-hint">Velg målformen malen er skrevet i, eller legg til en ny. Målformen avgjør hvilken mal-liste den vises i.</p>
				<div class="m-dg-liste">
					{#each m.former as f (f)}
						<div class="m-dg-rad" class:sel={m.valgt === f} role="radio" aria-checked={m.valgt === f}
							onclick={() => { m.valgt = f; }}>
							<span class="m-dg-navn">{målformLabel(f)}</span>
						</div>
					{/each}
				</div>
				<div class="m-dg-ny">
					<input placeholder="Ny målform, f.eks. Sørsamisk" bind:value={maaltNyttNavn}
						onkeydown={(e) => { if (e.key === 'Enter') { leggTilMaalform(); e.preventDefault(); } }} />
					<button onclick={() => leggTilMaalform()}>Legg til</button>
				</div>
			{/if}
			<div id="modal-actions">
				<button onclick={() => { const f = m.onAvbryt; closeModal(); f?.(); }}>{m.cancelLabel ?? 'Avbryt'}</button>
				{#if m.type === 'lukk'}
					<button onclick={() => { const f = m.onForkast; closeModal(); f?.(); }}>Lukk uten å lagre</button>
				{/if}
				{#if m.type === 'maalform'}
					<button class="primary" onclick={() => { m.ok(m.valgt); markDirtyIModal(); closeModal(); }}>Ferdig</button>
				{:else if m.type === 'delerTabell'}
					<button class="primary" onclick={() => { markDirtyIModal(); closeModal(); }}>Ferdig</button>
				{:else if m.type === 'velgTekster'}
					<button onclick={() => { m.valgte = new Set(m.seksjon.items.map((it, i) => i)); }}>Velg alle</button>
					<button onclick={() => { m.valgte = new Set(); }}>Nullstill</button>
					<button class="primary" onclick={() => { applyVelgTekster(); markDirtyIModal(); closeModal(); }}>Ferdig</button>
				{:else if m.type === 'adminAlts'}
					<button onclick={() => nyttTomt()}>Nytt tomt alternativ</button>
					<button onclick={() => hentFraBib('innhold')}>Hent innhold fra biblioteket …</button>
					<button onclick={() => hentFraBib('ledd')}>Hent hele leddet fra biblioteket …</button>
					<button class="m-fare" disabled={fjernMerkede.size === 0}
						onclick={() => {
							const idxer = [...fjernMerkede].sort((a, b) => b - a);
							for (const idx of idxer) m.it[m.liste].splice(idx, 1);
							fjernMerkede = new Set();
							visAdmin = 0;
							// KRITISK: valgt-indeksen (selAlt/selIntro/selAvsl) kan peke utenfor
							// rekkevidden etter sletting — Item.svelte leser alts[selAlt].text
							// ved neste render og krasjer hele treet (frys, 20. nov).
							if (m.selNokkel) {
								const n = (m.it[m.liste] ?? []).length;
								const na = m.it[m.selNokkel];
								if (n === 0 || typeof na !== 'number' || na >= n) m.it[m.selNokkel] = Math.max(0, n - 1);
							}
							app.current && markDirtyIModal();
						}}>Slett {fjernMerkede.size} alternativ{fjernMerkede.size === 1 ? '' : 'er'}</button>
					<button class="primary" onclick={() => { markDirtyIModal(); closeModal(); }}>Ferdig</button>
				{:else if m.type === 'fjernFlere'}
					<button class="m-fare" onclick={ok} disabled={valgteFjern.length === 0}>
						Slett {valgteFjern.length} alternativ{valgteFjern.length === 1 ? '' : 'er'}
					</button>
				{:else}
					<button class="primary" onclick={ok} disabled={m.type === 'bib' && bibValgt === -1 || m.type === 'kirkeaarListe' && kValgt == null}>
						{m.okLabel ?? (m.type === 'confirm' ? 'Slett' : m.type === 'lukk' ? 'Lagre' : m.type === 'newService' || m.type === 'nyMal' ? 'Opprett' : m.type === 'hentDeler' ? 'Ferdig' : 'Hent inn')}
					</button>
				{/if}
			</div>
		</div>
	</div>
{/if}
