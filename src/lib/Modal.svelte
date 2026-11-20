<script>
	import { app, applyKirkeaar } from '$lib/store.svelte.js';
	import { closeModal, showModal, kirkeaarListeModal, adminAltsModal, bibSokModal, chooseOneModal, valgModal, velgTeksterModal, skriftBokstav, delGruppeModal } from '$lib/modal.svelte.js';
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
	let tplId = $state(isNS ? (pres?.tplId ?? app.templates.find((t) => malType(t) === forhType && kanBrukes(t))?.id ?? '') : '');
	let medDåp = $state(isNS ? (pres?.dåp ?? true) : true);
	let medNattverd = $state(isNS ? (pres?.nattverd ?? true) : true);
	let nyType = $state(forhType); // 'gudstjeneste' | 'gravferd'
	let jordpaa = $state('gravferd'); // valgt del-gruppe (fra malens delGrupper)
	let jordpaaGrupper = $state([]); // malens delGrupper — Dynamiske radioer
	let remountTeller = $state(0); // inkrementeres ved type-bytte: {#key} rundt innholdet

	/** Hvilken liturgitype har malen? (egendefinert felt eller navn) */
	function malType(t) {
		return t.liturgiType ?? (/vigsel/i.test(t.name || '') ? 'vigsel' : /gravferd/i.test(t.name || '') ? 'gravferd' : 'gudstjeneste');
	}
	/** Kan malen brukes direkte til å opprette gudstjenester? (malen kan selv
	 *  bestemme: «Dåp i hovedgudstjenesten» er bare en del av gudstjenesten.)
	 *  Standard er ja — malen må eksplisitt si kanGudstjeneste: false. */
	function kanBrukes(t) {
		return t.kanGudstjeneste !== false;
	}

	// $derived.by: Svelte 5 robust reaktivitet (stale $state + $effect-kombinasjonen
	// feilet ved type-bytt: mal-listen ble stående tom ved retur til gudstjeneste)
	let malerForType = $state(app.templates.filter((t) => malType(t) === nyType && kanBrukes(t)));
	console.log('[modal-mount] maler=' + app.templates.length + ' nyType=' + nyType + ' filtrert=' + malerForType.length + ' typer=' + app.templates.map((t) => malType(t)).join(','));

	// sørg for at valgt mal passer typen når type byttes. NB: malerForType kan være
	// stale i denne effekten (oppdateres av en annen $effect) — filtrer direkte på
	// app.templates med malType, IKKE på malerForType.
	$effect(() => {
		if (m?.type === 'newService') {
			const t = app.templates.find((x) => x.id === tplId);
			if (!t || malType(t) !== nyType || !kanBrukes(t)) tplId = app.templates.find((x) => malType(x) === nyType && kanBrukes(x))?.id ?? '';
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
				medDåp = m.preserve.dåp;
				medNattverd = m.preserve.nattverd;
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
				medDåp = true;
				medNattverd = true;
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
			name, date, tplId, dåp: medDåp, nattverd: medNattverd,
			kirkeaar, tekster, teksterStatus
		};
		const tilbakeTilNyService = () => {
			showModal({
				type: 'newService', ok: forrige.ok,
				preserve: { type: forrige.type, name: forrige.name, date: forrige.date, tplId: forrige.tplId,
					dåp: forrige.dåp, nattverd: forrige.nattverd, kirkeaar: manuellK }
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
	function velgType(type) {
		nyType = type;
		malerForType = app.templates.filter((t) => malType(t) === type && kanBrukes(t));
		tplId = malerForType[0]?.id ?? ''; // preselect før øvrige effekter
		if (type === 'gravferd') oppdaterJordpaaGrupper();
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

	function nullstillKirkeaar() {
		manuellK = null;
		autoKirkeaar();
	}

	function ok() {
		if (!m) return;
		const forrige = m;
		if (m.type === 'prompt') m.ok(name.trim());
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
				else m.ok(name.trim(), date, tplId, { dåp: medDåp, nattverd: medNattverd }, kirkeaar, tekster);
				if (app.modal === forrige) closeModal();
				if (nyType === 'vigsel' && app.current) {
					const sk = app.current.sections.find((x) => /skriftlesning/i.test(x.title) && x.items.length >= 5);
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
				m.ok(name.trim(), date, tplId, { dåp: medDåp, nattverd: medNattverd }, kirkeaar, null);
				if (app.modal === forrige) closeModal();
				return;
			}
			opprett();
			return;
		} else if (m.type === 'choose') m.ok([...valgte]);
		else if (m.type === 'chooseOne') m.ok(valgtAlt);
		else if (m.type === 'fjernFlere') m.ok([...valgteFjern].sort((a, b) => b - a));
		else if (m.type === 'adminAlts' || m.type === 'velgTekster' || m.type === 'delGruppe') return; // live-redigering — Ferdig lukker
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

	function leggTilGruppe() {
		if (!m || m.type !== 'delGruppe') return;
		const navn = dgNyttNavn.trim();
		if (!navn) return;
		if (!m.grupper.includes(navn)) m.grupper.push(navn);
		m.valgt = navn;
		dgNyttNavn = '';
	}

	function slettGruppe(navn) {
		if (!m || m.type !== 'delGruppe') return;
		m.grupper = m.grupper.filter((g) => g !== navn);
		// rydd gruppen fra alle seksjonene i malen
		for (const sec of m.mal.sections ?? []) {
			if (sec.delGruppe === navn) sec.delGruppe = null;
		}
		if (m.valgt === navn) m.valgt = null;
		markDirtyIModal();
	}

	function applyDelGruppe() {
		if (!m || m.type !== 'delGruppe') return;
		// lagre gruppelista på malen + sett seksjonens delGruppe
		m.mal.delGrupper = [...m.grupper];
		m.seksjon.delGruppe = m.valgt;
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
		<div id="modal" class={m.type === 'chooseOne' || m.type === 'bib' || m.type === 'velgTekster' ? 'bred' : ''} role="dialog">
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
					Mal
					<select bind:value={tplId} onchange={() => oppdaterJordpaaGrupper()}>
						{#each malerForType as t (t.id)}
							<option value={t.id}>{t.name}</option>
						{/each}
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
						<button type="button" class="avpaa" role="checkbox" aria-checked={medDåp} onclick={() => { medDåp = !medDåp; }}>
							<span class="avpaa-tekst">Med dåp</span>
							<span class="avpaa-bryter" aria-hidden="true"><span class="avpaa-klump"></span></span>
						</button>
						<button type="button" class="avpaa" role="checkbox" aria-checked={medNattverd} onclick={() => { medNattverd = !medNattverd; }}>
							<span class="avpaa-tekst">Med nattverd</span>
							<span class="avpaa-bryter" aria-hidden="true"><span class="avpaa-klump"></span></span>
						</button>
					</div>
					{:else if nyType === 'gravferd'}
						<!-- Jordpåkastelse: av/på-knapper — logikken er fortsatt radioknapper
						     (bind:group, kun én av to kan være på) -->
						<div class="m-chk m-chk-jord">
							<span class="m-jordpaa-label">Del-gruppe:</span>
							{#each jordpaaGrupper as g, gi (g)}
								<button type="button" class="avpaa" role="radio" aria-checked={jordpaa === g} onclick={() => { jordpaa = g; }}>
									<span class="avpaa-tekst">{g[0].toUpperCase() + g.slice(1)}</span>
									<span class="avpaa-bryter" aria-hidden="true"><span class="avpaa-klump"></span></span>
								</button>
							{/each}
						</div>
						<p class="m-kirkeaar muted">Gravferdsordningen bruker ikke kirkeårsdag, bibelteksthenting eller dåp/nattverd-valg. Bare den valgte jordpåkastelsesdelen tas med.</p>
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
			{:else if m.type === 'delGruppe'}
				<p class="muted m-velg-hint">Velg hvilken del-gruppe avsnittet tilhører. «Ny gravferd» viser bare avsnitt i den valgte gruppen. Grupper uten avsnitt kan slettes.</p>
				<div class="m-dg-liste">
					<button type="button" class="m-dg-rad" class:sel={!m.valgt} onclick={() => { m.valgt = null; }}>
						<span>Ingen (alltid med)</span>
					</button>
					{#each m.grupper as g, gi (g)}
						<div class="m-dg-rad" class:sel={m.valgt === g} role="radio" aria-checked={m.valgt === g}
							onclick={() => { m.valgt = g; }}>
							<span class="m-dg-navn">{g}</span>
							<button type="button" class="m-dg-slett" title="Slett gruppen (ryddes fra alle avsnitt)"
								onclick={(e) => { e.stopPropagation(); slettGruppe(g); }}>{@html mdi('delete-outline', 14)}</button>
						</div>
					{/each}
				</div>
				<div class="m-dg-ny">
					<input placeholder="Ny gruppe, f.eks. Bisettelse i kapell" bind:value={dgNyttNavn}
						onkeydown={(e) => { if (e.key === 'Enter') { leggTilGruppe(); e.preventDefault(); } }} />
					<button onclick={() => leggTilGruppe()}>Legg til</button>
				</div>
			{/if}
			<div id="modal-actions">
				<button onclick={() => { const f = m.onAvbryt; closeModal(); f?.(); }}>{m.cancelLabel ?? 'Avbryt'}</button>
				{#if m.type === 'lukk'}
					<button onclick={() => { const f = m.onForkast; closeModal(); f?.(); }}>Lukk uten å lagre</button>
				{/if}
				{#if m.type === 'delGruppe'}
					<button class="primary" onclick={() => { applyDelGruppe(); markDirtyIModal(); closeModal(); }}>Ferdig</button>
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
						{m.okLabel ?? (m.type === 'confirm' ? 'Slett' : m.type === 'lukk' ? 'Lagre' : m.type === 'newService' ? 'Opprett' : 'Hent inn')}
					</button>
				{/if}
			</div>
		</div>
	</div>
{/if}
