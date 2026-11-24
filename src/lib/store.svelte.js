import { BUILTIN_TEMPLATES } from './data.js';

const LS_KEY = 'liturgi-store-v1';
const THEME_KEY = 'liturgi-theme';

const isElectron = typeof window !== 'undefined' && !!window.liturgi?.isElectron;

export const uid = () => 'i' + Math.random().toString(36).slice(2, 9);

export const app = $state({
	templates: [],
	services: [],
	current: null, // referanse til objektet i templates/services
	kind: null, // 'service' | 'template'
	dirty: false,
	showInstr: true,
	showRoles: true,
	theme: 'dark', // 'light' | 'dark'
	contextMenu: null, // {x, y, items: [{label, action, danger?} | 'sep']}
	recentServices: [], // Electron: siste gudstjenestefiler på disk
	servicesDir: '', // Electron: stien til tjenestemappen
	innFane: 'generelt', // Innstillinger: aktiv undermodul (styres fra modul-fane-stripen)
	malFavoritter: [], // malnavn merket med stjerne i malmodulen
	maalformer: ['bokmål', 'nynorsk', 'engelsk'], // kjente målformer (utvides fra maalform-modalen)
	åpneTjenester: [], // åpne denne økten: {obj, name, path}
	visning: 'hjem', // 'hjem' | 'maler' | 'bibliotek' | 'innstillinger' | 'maldeler' | 'oversikt' | 'eksport' | 'editor'
	isolertEksport: false, // eksport-siden åpnet isolert fra mal-listen (ingen undermoduler)
	forbAapneSti: null, // Forberedelse: fil som skal åpnes når modulen åpnes fra Kirkeåret
	sidebarSkjult: false, // macOS-lignende skjulbar sidemeny
	tocSkjult: false, // skjulbar høyre sidemeny (TOC / prosjekt-tre)
	portalToc: false, // en modul (Forberedelse) viser innhold i høyre sidemeny
	forbModul: false, // prekenforberedelse-modulen (Kirkeåret kan generere mapper/filer) — standard AV
	forbRediger: false, // prekenforberedelse-modulen i sidemenyen (redigeringsmodulen) — standard AV
	vimModus: false, // global vim-binding i redigeringsfeltene
	eksVisInnhold: false, // eksport: vis leddinnhold (delt med mac-menyen)
	eksKoblet: true, // eksport: koblet rulling mellom leddliste og forhåndsvisning
	devModus: false, // DEV: malredigeringsverktøy — settes fra main via devTilstand()
	åpneMaler: [], // åpne maler for redigering: {obj, åpenMalId, dev, dirty}
	modal: null
});
if (typeof window !== 'undefined') window.__app = app; // TEMP-TEST

const SIDEBAR_KEY = 'liturgi-sidebar';
export function veksleSidebar() {
	app.sidebarSkjult = !app.sidebarSkjult;
	localStorage.setItem(SIDEBAR_KEY, app.sidebarSkjult ? 'skjult' : 'vis');
}
try {
	app.sidebarSkjult = localStorage.getItem(SIDEBAR_KEY) === 'skjult';
} catch {}

const TOC_KEY = 'liturgi-toc';
/** Global vim-modus: brukes av menylinjen, kontekstmenyen og innstillingene. */
export function veksleVim() {
	app.vimModus = !app.vimModus;
	if (isElectron) window.liturgi?.dbSet?.('vimModus', app.vimModus ? '1' : '0');
	else { try { localStorage.setItem('vim-modus', app.vimModus ? '1' : '0'); } catch {} }
}

export function veksleToc() {
	app.tocSkjult = !app.tocSkjult;
	localStorage.setItem(TOC_KEY, app.tocSkjult ? 'skjult' : 'vis');
}
try {
	app.tocSkjult = localStorage.getItem(TOC_KEY) === 'skjult';
} catch {}

	/** Favoritt-maler: lagres i db (Electron) / lokalStorage, nøkkel = malnavn. */
	export function veksleMalFavoritt(navn) {
		const liste = app.malFavoritter.includes(navn)
			? app.malFavoritter.filter((n) => n !== navn)
			: [...app.malFavoritter, navn];
		app.malFavoritter = liste;
		try { localStorage.setItem('malFavoritter', JSON.stringify(liste)); } catch {}
		window.liturgi?.dbSet?.('malFavoritter', JSON.stringify(liste));
	}

	export function erMalFavoritt(navn) {
		return app.malFavoritter.includes(navn);
	}

	/** Kjente målformer: lagres i db ('maalformer') og holdes synkronisert
	 *  med malene (malFormFor) — nye målformer legges til fra maalform-modalen. */
	export function lagreMaalformer(liste) {
		app.maalformer = [...new Set(liste.map((m) => m.toLowerCase()))];
		try { localStorage.setItem('maalformer', JSON.stringify(app.maalformer)); } catch {}
		window.liturgi?.dbSet?.('maalformer', JSON.stringify(app.maalformer));
	}

	export function leggTilMaalform(mf) {
		const k = (mf ?? '').trim().toLowerCase();
		if (!k) return false;
		if (!app.maalformer.includes(k)) lagreMaalformer([...app.maalformer, k]);
		return true;
	}


/** Sett tema på <html> og lagre valget (lokalStorage + database i Electron). */
export function setTheme(t) {
	app.theme = t;
	document.documentElement.dataset.theme = t;
	localStorage.setItem(THEME_KEY, t);
	window.liturgi?.dbSet?.('tema', t);
	// vibrancy/nativeTheme i Electron følger appens tema
	window.liturgi?.setNativeTheme?.(t);
}

export function initTheme() {
	// eksport-visning: gjenopprett «Vis leddinnhold» + koblet visning fra forrige økt
	try { app.eksVisInnhold = localStorage.getItem('eks-visInnhold') === '1'; app.eksKoblet = localStorage.getItem('eks-koblet') !== '0'; } catch {}
	const saved = localStorage.getItem(THEME_KEY);
	const t = saved ?? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
	setTheme(t);
	// vibrancy-gjennomsiktighet kun i Electron (markert med .electron på <html>)
	if (typeof window !== 'undefined' && window.liturgi?.isElectron) {
		document.documentElement.classList.add('electron');
	}
	// brukerens lagrede tema i databasen vinner over lokalStorage/gjett
	try {
		const lagret = JSON.parse(localStorage.getItem('malFavoritter') ?? '[]');
		if (Array.isArray(lagret)) app.malFavoritter = lagret;
	} catch {}

	// kjente målformer fra db — slås sammen med standardene
	window.liturgi?.dbGet?.('maalformer')?.then?.((r) => {
		try {
			const liste = JSON.parse(r?.value ?? '[]');
			if (Array.isArray(liste) && liste.length) {
				app.maalformer = [...new Set(['bokmål', 'nynorsk', 'engelsk', ...liste.map((m) => String(m).toLowerCase())])];
			}
		} catch {}
	});

	// favoritter fra databasen vinner over lokalStorage
	window.liturgi?.dbGet?.('malFavoritter')?.then?.((r) => {
		try {
			const liste = JSON.parse(r?.value ?? '[]');
			if (Array.isArray(liste)) app.malFavoritter = liste;
		} catch {}
	});

	window.liturgi?.dbGet?.('tema')?.then?.((r) => {
		if (r?.ok && (r.value === 'dark' || r.value === 'light') && r.value !== app.theme) setTheme(r.value);
	});
}

export function toggleTheme() {
	setTheme(app.theme === 'dark' ? 'light' : 'dark');
}

import { secAlternativer, includeSection, includeItem, malAlternativer, filterTemplateItems, filterValgfrie } from '$lib/deler-logikk.js';

/* ---------- instansiering ---------- */

export function instantiate(it) {
	return {
		id: uid(), tplId: it.id ?? null, type: it.type ?? 'tekst',
		heading: it.heading ?? '', optional: !!it.optional,
		bokstav: it.bokstav ?? null, // skriftlesninger: bokstav fra docx-originalen (A–Y)
		text: autoMark(it.text ?? ''), instr: autoMark(it.instr ?? ''),
		alts: (it.alts ?? []).map((a) => ({ label: a.label ?? '', text: autoMark(a.text ?? '') })),
		selAlt: it.selAlt ?? ((it.alts ?? []).length ? 0 : null), enabled: it.enabled !== false,
		introAlts: (it.introAlts ?? []).map((a) => ({ label: a.label ?? '', text: autoMark(a.text ?? '') })),
		selIntro: it.selIntro ?? ((it.introAlts ?? []).length ? 0 : null),
		avslutningAlts: (it.avslutningAlts ?? []).map((a) => ({ label: a.label ?? '', text: autoMark(a.text ?? '') })),
		selAvsl: it.selAvsl ?? ((it.avslutningAlts ?? []).length ? 0 : null),
		salmeNr: '', salmeTittel: '',
		role: it.role ?? ''
	};
}

/* konverter automatiske rolleprefikser (L |, ML | …) til eksplisitte {{r}}-markører */
export function autoMark(t) {
	// rolleprefikser («L | tekst») er førsteklasses syntaks i riktekst-editoren
	// (redigerbar chip) — pakkes ikke lenger automatisk inn i {{r}}…{{/r}}
	return t ?? '';
}

function migrateItem(it) {
	// rolleprefikser («L | tekst») er førsteklasses syntaks i riktekst-editoren
	// (redigerbar chip) — pakkes ikke lenger automatisk inn i {{r}}…{{/r}}
}

export function newServiceFromTemplate(tpl, include, valgLedd = null, valgtGruppe = null) {
	// valgLedd: Set med id-er på valgfrie ledd brukeren har slått på i
	// «Opprett»-dialogen; valgtGruppe: den valgte del-gruppen (variasjon)
	return {
		id: uid(), kind: 'service', templateId: tpl.id, templateName: tpl.name,
		malForm: tpl.malForm ?? 'bokmål',
		liturgiType: tpl.liturgiType ?? (/vigsel/i.test(tpl.name || '') ? 'vigsel' : /gravferd/i.test(tpl.name || '') ? 'gravferd' : 'gudstjeneste'),
		name: tpl.name, date: '',
		sections: tpl.sections
			.filter((sec) => includeSection(sec, include))
			.map((sec) => {
				// hoveddelen styrt av alternativ/variasjon? da folger ALLE leddene;
				// ellers gjelder alternativ/variasjon per enkeltledd
				const styrt = secAlternativer(sec).length > 0 || !!sec.delGruppe;
				const items = filterValgfrie(styrt ? (sec.items ?? []) : filterTemplateItems(sec.items, include, valgtGruppe), valgLedd);
				return { title: sec.title, delGruppe: sec.delGruppe, alternativer: secAlternativer(sec), items: items.map(instantiate) };
			}),
		// malens egne eksport-standarder følger med til den nye gudstjenesten
		...(tpl.eksportFormater ? { eksportFormater: { ...tpl.eksportFormater } } : {}),
		...(tpl.eksportValg ? { eksportValg: JSON.parse(JSON.stringify(tpl.eksportValg)) } : {}),
		...(tpl.eksportPptx ? { eksportPptx: JSON.parse(JSON.stringify(tpl.eksportPptx)) } : {}),
		...(tpl.eksportTomSlide != null ? { eksportTomSlide: tpl.eksportTomSlide } : {}),
		// dynamisk bibeltekst-kobling fra malen (lesning → ledd-id)
		...(tpl.bibeltekster?.length ? { bibeltekster: JSON.parse(JSON.stringify(tpl.bibeltekster)) } : {}),
		// vigsel: malens valgte kilde til skriftlesningene
		...(tpl.skriftlesningKilde ? { skriftlesningKilde: tpl.skriftlesningKilde } : {})
	};
}

/** Sekshjelpere for vigselens skriftlesning-kilde. Malen kan si eksplisitt
 *  hvilken hoveddel som er kilde til skriftlesningene (skriftlesningKilde =
 *  seksjonstittel); ellers gjelder den gamle heuristikken (tittelen inneholder
 *  «skriftlesning»). */
export function erSkriftlesningKilde(dok, secTitle) {
	if (dok?.skriftlesningKilde) return secTitle === dok.skriftlesningKilde;
	return /skriftlesning/i.test(secTitle ?? '');
}

export function finnSkriftlesningSeksjon(dok) {
	if (!dok?.sections) return null;
	if (dok.skriftlesningKilde) {
		const eksplisitt = dok.sections.find((s) => s.title === dok.skriftlesningKilde);
		if (eksplisitt) return eksplisitt;
	}
	return dok.sections.find((s) => /skriftlesning/i.test(s.title) && s.items.length >= 5) ?? null;
}

// secAlternativer / malAlternativer / includeSection ligger i deler-logikk.js
// (ren logikk — testbar) og re-eksporteres her for eksisterende import-steder.
export { secAlternativer, includeSection, includeItem, malAlternativer, filterTemplateItems, filterValgfrie };

/* Dåp og Nattverd kan slås av ved oppretting. To mekanismer:
 *  1. tittel-regler (hardkodet): seksjon «Dåp» / tittel med nattverd
 *  2. alternativ-merker fra malredigeringen (sec.alternativer, flervalg —
 *     en del kan være merket med både dåp og nattverd)
 * Godtar både seksjonsobjekt og gammel tittel-streng (bakoverkompatibelt). */


/** Legg inn manglende deler fra malen i en eksisterende gudstjeneste, på riktig plass. */
export function insertSectionsFromTemplate(svc, titles) {
	const tpl = app.templates.find((t) => t.id === svc.templateId);
	if (!tpl) return;
	for (const title of titles) {
		const tsec = tpl.sections.find((s) => s.title === title);
		if (!tsec || svc.sections.some((s) => s.title === title)) continue;
		// finn innsettingspunkt: før første senere mal-del som finnes i gudstjenesten
		const tIdx = tpl.sections.indexOf(tsec);
		let at = svc.sections.length;
		for (let j = tIdx + 1; j < tpl.sections.length; j++) {
			const pos = svc.sections.findIndex((s) => s.title === tpl.sections[j].title);
			if (pos !== -1) { at = pos; break; }
		}
		// gudstjenestens valgte variasjon: dersom den finnes (samme del-gruppe
		// hos de eksisterende delene) filtreres hoveddelens ledd likt
		const grupper = new Set(svc.sections.map((s) => s.delGruppe).filter(Boolean));
		const valgt = grupper.size === 1 ? [...grupper][0] : null;
		const styrt = secAlternativer(tsec).length > 0 || !!tsec.delGruppe;
		const items = styrt ? (tsec.items ?? []) : (tsec.items ?? []).filter((it) => !it.delGruppe || !valgt || it.delGruppe === valgt);
		svc.sections.splice(at, 0, { title: tsec.title, delGruppe: tsec.delGruppe, alternativer: secAlternativer(tsec), items: items.map(instantiate) });
	}
}

export function newBlankTemplate(name) {
	return {
		id: uid(), kind: 'template', name,
		sections: [{ title: 'I. Samling', items: [] }]
	};
}

/* ---------- lagring ---------- */

/** Electron: lokale maler som skal migreres fra localStorage til disk ved oppstart. */
export let pendingLocalTemplates = [];


export function loadStore() {
	// prekenforberedelse på/av (innstillinger)
	window.liturgi?.dbGet?.('forbModul')?.then?.((r) => {
		app.forbModul = (r?.value ?? '0') === '1';
	});
	window.liturgi?.dbGet?.('forbRediger')?.then?.((r) => {
		app.forbRediger = (r?.value ?? '0') === '1';
	});
	window.liturgi?.dbSet?.('prekenforberedelseAktiv', null)?.catch?.(() => {}); // gammel nøkkel ryddes
	window.liturgi?.dbGet?.('vimModus')?.then?.((r) => {
		app.vimModus = (r?.value ?? '0') === '1';
	});
	if (isElectron) {
		// maler: innebygde + lokale fra ~/.config/Liturgi/maler (lastes async av fileio)
		// gamle lokale maler i localStorage migreres til maler-mappen én gang
		try {
			const s = JSON.parse(localStorage.getItem(LS_KEY) ?? '{}');
			const builtinNames = new Set(BUILTIN_TEMPLATES.map((bt) => bt.name));
			pendingLocalTemplates = (s.templates ?? []).filter(
				(t) => !t.builtinKey && !builtinNames.has(t.name)
			);
		} catch { pendingLocalTemplates = []; }
		app.templates = []; // maler lastes fra disk (maler/originaler + maler/brukermaler)
		app.services = [];
		persist();
		return;
	}
	try {
		const raw = localStorage.getItem(LS_KEY);
		if (raw) {
			const s = JSON.parse(raw);
			// normaliser: gamle/korraupte entries skal ikke krasje oppstarten
			app.templates = (s.templates ?? []).filter((t) => t && typeof t === 'object');
			for (const t of app.templates) {
				t.sections ??= [];
				t.id ??= 'mal-' + Math.random().toString(36).slice(2, 10);
				t.name ??= 'Uten navn';
			}
			// Electron: gudstjenester bor som filer på disk, ikke i localStorage
			if (!isElectron) app.services = s.services ?? [];
		}
	} catch {
		app.templates = [];
		app.services = [];
	}
	// rydd opp i gamle/dupliserte maler (f.eks. fra vanilla-versjonen som deler lagringsnøkkel):
	// 1) dropp kopier av de innebygde malene som mangler builtinKey (samme navn)
	const builtinNames = new Set(BUILTIN_TEMPLATES.map((bt) => bt.name));
	app.templates = app.templates.filter(
		(t) => t.builtinKey || !builtinNames.has(t.name)
	);
	// 2) dropp maler med duplisert id (behold evt. innebygd versjon)
	app.templates.sort((a, b) => (b.builtinKey ? 1 : 0) - (a.builtinKey ? 1 : 0));
	const seenIds = new Set();
	app.templates = app.templates.filter((t) => {
		if (seenIds.has(t.id)) return false;
		seenIds.add(t.id);
		return true;
	});
	// 3) dropp gudstjenester med duplisert id
	const seenSvc = new Set();
	app.services = app.services.filter((s) => {
		if (seenSvc.has(s.id)) return false;
		seenSvc.add(s.id);
		return true;
	});
	for (const bt of BUILTIN_TEMPLATES) {
		const stored = app.templates.find((t) => t.builtinKey === bt.builtinKey);
		if (!stored) {
			const copy = JSON.parse(JSON.stringify(bt));
			for (const sec of (copy.sections ?? [])) for (const it of (sec?.items ?? [])) migrateItem(it);
			app.templates.push(copy);
		} else if (JSON.stringify(stored.sections) !== JSON.stringify(bt.sections)) {
			// innebygd mal er oppdatert – erstatt strukturen (navn og egne maler røres ikke)
			stored.sections = JSON.parse(JSON.stringify(bt.sections));
		}
	}
	// migrer eksisterende brukerdata til eksplisitte rollemarkører
	for (const t of app.templates) for (const sec of (t.sections ?? [])) for (const it of (sec?.items ?? [])) migrateItem(it);
	for (const s of app.services) for (const sec of (s.sections ?? [])) for (const it of (sec?.items ?? [])) migrateItem(it);
	persist();
}

export function persist() {
	// Electron: maler bor på disk (~/.config/Liturgi/maler), gudstjenester som filer
	localStorage.setItem(
		LS_KEY,
		JSON.stringify(isElectron ? {} : { templates: app.templates, services: app.services })
	);
	app.dirty = false;
}

/* Autolagring: hook injisert av fileio.svelte.js (setAutoLagreFn) for å unngå
 * sirkulær import — markDirty kalles fra hele appen, autolagringen trenger
 * skrivefunksjonene i fileio. */
let autoLagreFn = null;
export function setAutoLagreFn(fn) { autoLagreFn = fn; }

export function markDirty() {
	app.dirty = true;
	if (app.current) app.current.__dirty = true;
	// dirty-status på listeraden — reaktivt (objektets eget __dirty er upålitelig i templaten)
	const e = entryFor(app.current);
	if (e) e.dirty = true;
	const m = malEntryFor(app.current);
	if (m) m.dirty = true;
	window.liturgi?.setDirty?.(true);
	autoLagreFn?.();
}

/** Finn «åpne gudstjenester»-oppføringen for et dokument (åpenId er stabil; identitet er det ikke). */
export function entryFor(obj) {
	const id = obj?.__åpenId;
	return app.åpneTjenester.find((x) => (id != null && x.åpenId === id) || x.obj === obj);
}

/** Hold hovedprosessen oppdatert om dirty-flagget (avsluttingsbekreftelse). */
export function syncDirty() {
	window.liturgi?.setDirty?.(!!app.dirty);
}

/* ---------- CRUD ---------- */

/** Generisk lenke-synk: seksjoner med __lenket { malId, tittel } fyller/
 *  fornyer innholdet sitt fra malen ved åpning (samme idé som den
 *  hardkodede dåp-i-HG-lenken, men generelt). */
export function synkLenkedeSeksjoner(o) {
	if (!o?.sections) return;
	for (const sec of o.sections) {
		const l = sec.__lenket;
		if (!l?.malId || !l?.tittel) continue;
		const mal = app.templates.find((t) => t.id === l.malId);
		const kilde = mal?.sections?.find((s) => s.title === l.tittel);
		if (!kilde) continue;
		// bare skriv ved faktisk endring (hindrer reaktiv self-loop ved kall fra effekter)
		const nytt = JSON.stringify(kilde.items ?? []);
		// tittelen beholdes fra dokumentet («Dåp» — ikke malens lange tittel);
		// kun innholdet lenkes
		if (JSON.stringify(sec.items ?? []) !== nytt) sec.items = JSON.parse(nytt);
	}
}

export function openService(id) {
	const s = app.services.find((x) => x.id === id);
	if (!s) return;
	synkLenkedeSeksjoner(s);
	app.current = s;
	app.kind = 'service';
}

export function openTemplate(id) {
	const t = app.templates.find((x) => x.id === id);
	if (!t) return;
	registrerÅpenMal(t, false);
}

/** Finn «Åpne maler»-oppføringen for et mal-dokument (stabil id — identitet er
 *  upålitelig: app.current er en reaktiv proxy, obj-referansen er det ikke). */
export function malEntryFor(obj) {
	const id = obj?.__åpenMalId;
	return app.åpneMaler.find(
		(x) => (id != null && x.åpenMalId === id)
			|| x.obj === obj
			// NB: identitet holder ikke — loadTemplatesFromDisk erstatter
			// mal-objektene ved hver Maler-visning. Match på malens stabile id,
			// ellers kommer duplikat-oppføringer (samme m.obj.id to ganger i
			// sidemenyen) og Sidebar sitt keyed each krasjer Svelte.
			|| (x.obj?.id != null && x.obj.id === obj?.id)
			|| (x.obj?.name && x.obj.name === obj?.name && !obj?.filePath)
	);
}

/** Registrer et mal-dokument som åpent (importeres av malverktoy.svelte.js). */
export function registrerÅpenMal(obj, dev) {
	obj.visInstr = obj.visInstr ?? true;
	obj.visRoles = obj.visRoles ?? true;
	obj.visSalmeinfo = obj.visSalmeinfo ?? true;
	// NB: vanlig tellbar egenskap — ikke-tellbare (defineProperty) forsvinner gjennom
	// $state-proxyen. Fjernes ved lagring (currentJson + malverktoy HELPER_FELTER).
	if (!obj.__åpenMalId) obj.__åpenMalId = uid();
	let e = malEntryFor(obj);
	if (!e) {
		e = { obj, åpenMalId: obj.__åpenMalId, name: obj.name ?? '', dev: !!dev, dirty: false };
		app.åpneMaler.push(e);
	} else {
		e.obj = obj; // frisk objekt-identitet (loadTemplatesFromDisk erstatter dem)
		e.dev = !!dev;
	}
	const sider = ['maler', 'bibliotek', 'innstillinger', 'kirkeaar', 'forberedelse', 'malverktoy'];
	if (sider.includes(app.visning)) app.tilbakeVisning = app.visning;
	app.visning = 'editor';
	app.current = obj;
	app.kind = 'template';
}

export function closeEditor() {
	// fjern gudstjenesten/malen fra «åpne»-listene — alle lukkeveier går hit
	if (app.kind === 'service' && app.current) {
		const e = entryFor(app.current);
		if (e) app.åpneTjenester.splice(app.åpneTjenester.indexOf(e), 1);
	}
	if (app.kind === 'template' && app.current) {
		const m = malEntryFor(app.current);
		if (m) app.åpneMaler.splice(app.åpneMaler.indexOf(m), 1);
	}
	app.current = null;
	app.kind = null;
	// Tilbake-navigasjon: returner til siden brukeren sto på da dokumentet
	// ble åpnet (f.eks. Maler-siden i biblioteksmodulen) — ikke blindt hjem.
	const side = app.visning;
	const gyldigSide = ['maler', 'bibliotek', 'innstillinger', 'kirkeaar', 'forberedelse', 'malverktoy'];
	if (gyldigSide.includes(side)) app.visning = side;
	else { app.visning = app.tilbakeVisning ?? 'hjem'; app.tilbakeVisning = null; }
	app.isolertEksport = false;
}

export function deleteService(id) {
	app.services = app.services.filter((x) => x.id !== id);
	if (app.current && app.current.id === id) closeEditor();
	persist();
}

export function deleteTemplate(id) {
	app.templates = app.templates.filter((x) => x.id !== id);
	if (app.current && app.current.id === id) closeEditor();
	persist();
}

export function saveAsTemplate(name) {
	const t = {
		id: uid(), kind: 'template', name: name || app.current.name,
		liturgiType: app.current.liturgiType ?? 'gudstjeneste',
		sections: JSON.parse(JSON.stringify(app.current.sections)).map((sec) => ({
			title: sec.title,
			items: sec.items.map((x) => ({
				id: x.tplId ?? x.id, type: x.type, heading: x.heading, optional: x.optional, valgStandard: x.valgStandard,
				text: x.text, instr: x.instr, alts: x.alts, selAlt: x.selAlt, role: x.role ?? ''
			}))
		}))
	};
	app.templates.push(t);
	persist();
}

export function createService(name, date, tplId, include, kirkeaar, tekster, valgLedd = null, valgtGruppe = null) {
	const tpl = app.templates.find((t) => t.id === tplId);
	if (!tpl) return null;
	const s = newServiceFromTemplate(tpl, include, valgLedd, valgtGruppe);
	s.visInstr = true;
	s.visRoles = true;
	s.visSalmeinfo = true;
	// navneforslag: tom navn → «[dato] - [gudstjeneste|Gravferd] - [Kirkeårsdag]»
	// (kirkeårsdag bare for gudstjenester — gravferd har ingen)
	const typeNavn = s.liturgiType === 'gravferd' ? 'Gravferd' : s.liturgiType === 'vigsel' ? 'Vigsel' : 'Gudstjeneste';
	const navneDeler = [date, typeNavn, kirkeaar?.name].filter(Boolean);
	s.name = name || (navneDeler.length > 1 ? navneDeler.join(' - ') : tpl.name);
	s.date = date;
	applyKirkeaar(s, kirkeaar, tekster);
	if (isElectron) {
		// gudstjenester lagres som fil — ligger i minnet til «Lagre»
		if (!s.__åpenId) Object.defineProperty(s, '__åpenId', { value: uid(), enumerable: false });
		app.current = s;
		app.kind = 'service';
		app.dirty = true;
		window.liturgi?.setDirty?.(true);
		if (!app.åpneTjenester.some((x) => x.åpenId === s.__åpenId)) {
			app.åpneTjenester.push({ obj: app.current, name: s.name, path: null, åpenId: s.__åpenId, dirty: true });
		}
		return s;
	}
	app.services.push(s);
	persist();
	openService(s.id);
	return s;
}

/** Gi bønnen fra kirkeåret rollemerker: L | foran, M | på avsluttende Amen. */
export function formaterBønn(prayer) {
	const lines = (prayer || '').split('\n').map((s) => s.trim()).filter(Boolean);
	if (!lines.length) return '';
	lines[0] = '{{r}}L |{{/r}} ' + lines[0];
	const last = lines.length - 1;
	if (last > 0 && /^amen\.?$/i.test(lines[last])) lines[last] = '{{r}}M |{{/r}} ' + lines[last];
	return lines.join('\n');
}

/** Fyll inn dagens bønn og bibeltekster fra kirkeåret i en ny gudstjeneste. */
export function applyKirkeaar(svc, k, tekster) {
	if (!k) return;
	svc.kirkeaar = { name: k.name, color: k.color, periodInfo: k.periodInfo, period: k.period, series: k.series };
	for (const sec of svc.sections) {
		for (const it of sec.items) {
			const h = (it.heading || '').toLowerCase();
			const erIngress = h.includes('ingress');
			// dynamisk kobling fra malen (Bibeltekster-fanen) styrer først
			const kobling = (svc.bibeltekster ?? []).find((b) => b.leddId === it.id);
			if (kobling) {
				const nokkel = kobling.lesning;
				const ref = nokkel === 'E' ? k.E : nokkel === 'L2' ? k.L2 : k.L1;
				if (ref) {
					fyllLesning(it, ref, tekster?.[nokkel], nokkel === 'E');
					if (nokkel === 'L1') it.instr = (it.instr ? it.instr + ' ' : '') + 'Tekstrekke ' + k.series;
					continue;
				}
			}
			if (h.includes('dagens bønn') && !erIngress && k.prayer) {
				const bønn = '{{r}}L |{{/r}} La oss alle be.\n' + formaterBønn(k.prayer);
				if (it.text?.includes('[Dagens bønn]')) {
					const innhold = formaterBønn(k.prayer);
					it.text = it.text.replace('[Dagens bønn]', innhold);
					// unngå dobbel avsluttende Amen fra malen (tåler både ren og {{r}}-pakket form)
					if (/amen\.?$/i.test(innhold)) it.text = it.text.replace(/\n*(?:\{\{r\}\}M \|\{\{\/r\}\} ?|M \| ?)Amen\.?\s*$/, '');
				} else if ((it.alts ?? []).length) {
					// lokal(e) alternativ(er) beholdes – kirkeårsbønnen settes inn/oppdateres forrest
					const idx = it.alts.findIndex((a) => a.label === 'Dagens bønn (kirkeåret)');
					if (idx === -1) {
						it.alts.unshift({ label: 'Dagens bønn (kirkeåret)', text: bønn });
					} else {
						it.alts[idx] = { label: 'Dagens bønn (kirkeåret)', text: bønn };
					}
					it.selAlt = it.alts.findIndex((a) => a.label === 'Dagens bønn (kirkeåret)');
				} else if (it.text) {
					// lokal bønn beholdes som alternativ
					it.alts = [
						{ label: 'Dagens bønn (kirkeåret)', text: bønn },
						{ label: 'Lokal bønn', text: it.text }
					];
					it.selAlt = 0;
					it.text = '';
				} else {
					it.text = bønn;
				}
			} else if (h.includes('første lesning') && !erIngress && k.L1) {
				fyllLesning(it, k.L1, tekster?.L1);
				it.instr = (it.instr ? it.instr + ' ' : '') + 'Tekstrekke ' + k.series;
			} else if (h.includes('andre lesning') && !erIngress && k.L2) {
				fyllLesning(it, k.L2, tekster?.L2);
			} else if (h.includes('evangelium') && !erIngress && k.E) {
				fyllLesning(it, k.E, tekster?.E, true);
			}
		}
	}
}

/** Fyll en lesning med referanse og (hvis hentet) selve teksten fra bibel.no. */
function fyllLesning(it, ref, tekst, evangelium = false) {
	// teksten innledes/avsluttes som i ordningen; referansen settes som fotnote
	const intro = evangelium
		? '{{r}}L |{{/r}} Det står skrevet i evangeliet etter ' + ref + ':'
		: '{{r}}ML |{{/r}} Det står skrevet i ' + ref + ':';
	const outro = evangelium
		? '{{r}}L |{{/r}} Slik lyder det hellige evangelium.'
		: '{{r}}ML |{{/r}} Slik lyder Herrens ord.';
	const fotnote = tekst ? '\nBIBELREF | ' + ref : '';
	if (tekst) {
		const innhold = (tekst.title ? tekst.title + '\n' : '') + tekst.text + fotnote;
		if (it.text?.includes(evangelium ? '[Evangelietekst]' : '[Lesningstekst]')) {
			// malen har plassholder med egen innledning/avslutning – behold den
			it.text = it.text
				.replace(evangelium ? '[Evangelietekst]' : '[Lesningstekst]', innhold)
				.replace('…', ref);
		} else {
			// frittstående ledd (f.eks. B&G): bygg med innledning/avslutning
			it.text = intro + '\n' + innhold + '\n' + outro;
		}
	} else {
		// kun referanse
		if (it.text?.includes('[Lesningstekst]')) it.text = it.text.replace('[Lesningstekst]', ref);
		else if (it.text?.includes('[Evangelietekst]')) it.text = it.text.replace('[Evangelietekst]', ref);
		else it.text = (evangelium ? '[Evangelietekst: ' : '[Lesningstekst: ') + ref + ']';
	}
	if (it.instr?.includes('(eksempel)')) it.instr = '';
}

export function sortedServices() {
	return [...app.services].sort(
		(a, b) => (a.date || '9999').localeCompare(b.date || '9999') || a.name.localeCompare(b.name)
	);
}



