import { app, persist, uid, openService, openTemplate, registrerÅpenMal, malEntryFor, closeEditor, entryFor, syncDirty, veksleSidebar, veksleToc, toggleTheme, createService, veksleVim, setAutoLagreFn, synkLenkedeSeksjoner } from './store.svelte.js';
import { BUILTIN_TEMPLATES, WIP_TEMPLATES } from './data.js';
import { prompt, lukkModal, closeModal, newServiceModal } from './modal.svelte.js';
import { toast } from 'svelte-sonner';

const isElectron = typeof window !== 'undefined' && !!window.liturgi?.isElectron;

/* ---------- Autolagring ---------- */
// Kjøres ved hver endring (markDirty → hook): gudstjenester med kjent filsti
// lagres automatisk til .liturgi-fila etter 2 s uten nye endringer; dev-maler
// (Malverktøyet) lagres som utkast i ~/.config/Liturgi/malutkast (én fast fil
// per mal, overskrives hver gang). Dokumenter uten filsti (nye gudstjenester)
// autolagres ikke — første lagring må være «Lagre»/«Lagre som».
let autoTimer = null;
/** Avbryt ventende autolagring (kalles etter eksplisitt lagring). */
export function avbrytAutolagre() {
	clearTimeout(autoTimer);
	autoTimer = null;
}
function autolagreNaa() {
	if (!isElectron) return;
	const o = app.current;
	if (!o || !o.__dirty) return;
	clearTimeout(autoTimer);
	autoTimer = setTimeout(() => {
		// fortsatt samme dokument og fortsatt ulagret?
		if (app.current !== o || !o.__dirty) return;
		if (o.kind === 'template' && o.__devMal) {
			// PLAIN kopi — shallow spread av $state-proxy kan ikke structured-clones
			// over IPC ('An object could not be cloned')
			const kopi = JSON.parse(JSON.stringify(o, (k, v) => (k === '__dirty' || k === 'filePath' ? undefined : v)));
			window.liturgi.lagreUtkast(kopi, true);
		} else if (o.kind !== 'template' && o.filePath) {
			saveCurrentToDisk(true);
		}
	}, 2000);
}
setAutoLagreFn(autolagreNaa);

/** Serialiser nåværende gudstjeneste eller mal til lagringsformat. */
export function currentJson() {
	const o = app.current;
	if (!o) return null;
	// lenket innhold i maler: behold __lenket-merket, men kopier innholdet
	// inn som backup (__lenketBackup) slik at en eksportert .limal fungerer
	// også uten den lenkede malen
	if ((o.kind ?? app.kind) === 'template') medLenketBackup(o);
	// __dirty/filePath er runtime-felter — skal aldri inn i filen (gjør at
	// gjenåpnede filer ellers markeres som endret uten endringer)
	return JSON.stringify({ liturgiFormat: 1, kind: o.kind ?? app.kind, data: o },
		(k, v) => (k === '__dirty' || k === 'filePath' || k === '__åpenMalId' ? undefined : v), '	');
}

/** Lenket backup: for hver lenket hoveddel kopieres innholdet inn i
 *  seksjonen som __lenketBackup. __lenket beholdes — ved åpning kobles
 *  lenken til den lenkede malen hvis den finnes, ellers brukes backupen. */
function medLenketBackup(mal) {
	for (const sec of mal.sections ?? []) {
		if (!sec.__lenket) { delete sec.__lenketBackup; continue; }
		sec.__lenketBackup = {
			tittel: sec.title,
			items: JSON.parse(JSON.stringify(sec.items ?? []))
		};
	}
}

/** Behandle lenket innhold ved import/åpning av en mal-fil: hvis den
 *  lenkede malen finnes, kobles seksjonen som før. Hvis IKKE: backupen
 *  kopieres inn, __lenket fjernes, og brukeren får beskjed. Returnerer
 *  true hvis noen lenker mistet sin kilde. NB: gammelt format
 *  __lenket: true (bool) er ikke en objekt-lenke — det konverteres av
 *  LENKE-SYNK etter innlesing og skal ikke røres her. */
function behandlLenketBackup(mal, kjenteIder = null) {
	let mistet = false;
	const kjente = kjenteIder ?? new Set(app.templates.map((t) => t.id));
	for (const sec of mal.sections ?? []) {
		if (!sec.__lenket || sec.__lenket === true) continue;
		const finnes = kjente.has(sec.__lenket?.malId);
		if (finnes) {
			delete sec.__lenketBackup;
			continue;
		}
		const backup = sec.__lenketBackup;
		if (backup?.items?.length) {
			sec.items = JSON.parse(JSON.stringify(backup.items));
			sec.title = backup.tittel || sec.title;
		}
		delete sec.__lenket;
		delete sec.__lenketBackup;
		mistet = true;
	}
	return mistet;
}

/** Filnavn: "dato - navn - kirkeårsdag". */
export function fileNameFor(o) {
	const parts = [];
	if (o.date) parts.push(o.date);
	parts.push((o.name || 'gudstjeneste').replace(/[\\/:*?"<>|]+/g, '').trim() || 'gudstjeneste');
	if (o.kirkeaar?.name) parts.push(o.kirkeaar.name);
	return parts.join(' - ').replace(/\s+/g, ' ').trim() + (o.kind === 'template' ? '.limal' : '.liturgi');
}

/** Lagre det åpne objektet til disk (Electron). Gudstjenester skrives til
 *  tjenestemappen; første lagring viser lagre-dialog. */
export async function saveCurrentToDisk(stille = false) {
	const json = currentJson();
	if (!json) return;
	const o = app.current;
	try {
		let r;
		if (o.filePath) {
			r = await window.liturgi.writeService(o.filePath, json);
		} else {
			r = await window.liturgi.saveServiceAs(fileNameFor(o), json);
		}
		if (r.ok) {
			o.filePath = r.filePath;
			o.__dirty = false;
			app.dirty = false;
			syncDirty();
			if (!stille) toast.success('Lagret: ' + r.filePath.split('/').pop());
			// oppdater «åpne gudstjenester»-oppføringen med den nye stien
			const e = entryFor(o);
			if (e) { e.path = r.filePath; e.name = o.name ?? ''; e.dirty = false; }
			await touchRecent(o);
			await refreshRecentServices();
		} else if (!r.canceled) {
			toast.error('Klarte ikke lagre: ' + (r.error ?? 'ukjent feil'));
		}
	} catch (err) {
		toast.error('Klarte ikke lagre: ' + (err?.message ?? err));
	}
}

/** «Lagre som fil» — alltid lagre-dialog. */
export async function saveCurrentToFile() {
	const json = currentJson();
	if (!json) return;
	if (isElectron) {
		const o = app.current;
		const r = await window.liturgi.saveServiceAs(fileNameFor(o), json);
		if (r.ok) {
			o.filePath = r.filePath;
			o.__dirty = false;
			app.dirty = false;
			syncDirty();
			toast.success('Lagret til ' + r.filePath);
			const e = entryFor(o);
			if (e) { e.path = r.filePath; e.name = o.name ?? ''; e.dirty = false; }
			await touchRecent(o);
			await refreshRecentServices();
		} else if (!r.canceled) toast.error('Klarte ikke lagre: ' + (r.error ?? 'ukjent feil'));
	} else {
		// nettleser-fallback: nedlasting
		const o = app.current;
		const defaultName = fileNameFor(o);
		const blob = new Blob([json], { type: 'application/json' });
		const a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = defaultName;
		document.body.appendChild(a);
		a.click();
		setTimeout(() => URL.revokeObjectURL(a.href), 5000);
		a.remove();
		toast.success('Fil lastet ned: ' + defaultName);
	}
}

/** Lagre-knappen: skriv til fil i appen, eller vis dialog hvis filen er ny. */
export async function saveCurrent() {
	if (!app.current) return;
	if (isElectron) {
		if (app.kind === 'service') {
			await saveCurrentToDisk();
		} else if (app.kind === 'template') {
			await saveCurrentTemplate();
		}
	} else {
		persist();
		toast.success('Lagret');
	}
}

/** Er dette en originalmal (ligger i maler/originaler)? */
export function erOriginalMal(t) {
	return !!t?.filePath && t.filePath.includes('/originaler/');
}

/** Sammenlign maldata med unntak av valgt alternativ (selAlt), filsti og id. */
function malLikBortsettFraValg(a, b) {
	const strip = (x) => JSON.stringify(
		{ name: x.name, sections: x.sections },
		(k, v) => (k === 'selAlt' || k === 'filePath' || k === 'id' ? undefined : v)
	);
	return strip(a) === strip(b);
}

/** Lagre en mal. Originalmalen skrives kun hvis bare alternativvalg er endret;
 *  ellers opprettes en kopi som brukermal, så originalene forblir originaler. */
async function saveCurrentTemplate() {
	const o = app.current;
	if (!o.filePath) {
		if (o.__devMal) {
			// dev-mal uten filsti: «Lagre» = «Lagre til prosjektet» (⌘S / Lagre-knapp)
			const { lagreTilProsjekt } = await import('./malverktoy.svelte.js');
			await lagreTilProsjekt();
			return;
		}
		toast.info('Innebygde maler lagres med «Lagre som mal»');
		return;
	}
	if (erOriginalMal(o) && o.wip !== true) {
		const rd = await window.liturgi.readTemplate(o.filePath);
		const originalData = rd.ok ? parseLiturgi(rd.json) : null;
		if (!originalData || !malLikBortsettFraValg(originalData, o)) {
			await lagreOriginalSomBrukerKopi(o);
			return;
		}
	}
	const r = await window.liturgi.writeTemplate(o.filePath, currentJson());
	if (r.ok) {
		o.__dirty = false;
		app.dirty = false;
		syncDirty();
		const m = malEntryFor(o);
		if (m) m.dirty = false;
		toast.success('Malen er lagret');
	}
	else toast.error('Klarte ikke lagre: ' + (r.error ?? 'ukjent feil'));
}

/** «Lagre som kopi»: alltid en ny brukermal-kopi av den åpne malen
 *  (originalmaler skal aldri overskrives utover alternativvalg). */
export async function lagreMalSomKopi() {
	const o = app.current;
	if (!o || app.kind !== 'template') return;
	await lagreOriginalSomBrukerKopi(o);
}

/** Kopi av en originalmal med brukerens endringer, lagres i maler/brukermaler. */
async function lagreOriginalSomBrukerKopi(o) {
	try {
		const list = await window.liturgi.listTemplates();
		const data = JSON.parse(JSON.stringify(o));
		delete data.builtinKey;
		data.id = uid();
		data.name = o.name + ' (kopi)';
		const safe = safeNavn(data.name);
		const taken = new Set([...list.originaler, ...list.brukermaler].map((x) => x.path));
		let p = `${list.dirs.brukermaler}/${safe}.limal`, n = 2;
		while (taken.has(p)) { p = `${list.dirs.brukermaler}/${safe} (${n}).limal`; n++; }
		const r = await window.liturgi.writeTemplate(p, currentJson());
		if (!r.ok) { toast.error('Klarte ikke lagre kopien: ' + (r.error ?? 'ukjent feil')); return; }
		data.filePath = r.filePath;
		app.templates.push(data);
		// det åpne dokumentet er nå kopien — oppdater «Åpne maler» (uten dev-merke)
		const m = malEntryFor(o);
		if (m) app.åpneMaler.splice(app.åpneMaler.indexOf(m), 1);
		registrerÅpenMal(data, false);
		app.dirty = false;
		syncDirty();
		toast.success('Originalen er uendret – endringene er lagret som brukermalen «' + data.name + '»');
	} catch (err) {
		toast.error('Klarte ikke lagre kopien: ' + (err?.message ?? err));
	}
}

/** Siste åpnede gudstjenester (fra SQLite — filbaner uansett mappe). */
export async function refreshRecentServices() {
	if (!isElectron) return [];
	try {
		const r = await window.liturgi.listRecent();
		if (r.ok) app.recentServices = r.list;
		return r.ok ? r.list : [];
	} catch {
		return [];
	}
}

async function touchRecent(o) {
	if (!o?.filePath) return;
	try { await window.liturgi.touchRecent(o.filePath, o.name ?? '', o.date ?? ''); } catch {}
}

/** Åpne en gudstjenestefil fra disken — der den ligger, uten å kopieres.
 *  Flere kan være åpne samtidig; bytte skjer via «Åpne gudstjenester» i sidefeltet. */
export async function openServiceFile(p) {
	try {
		// allerede åpen? bare veksle til den
		const eksisterende = app.åpneTjenester.find((x) => x.path === p);
		if (eksisterende) {
			åpneNy(eksisterende.obj);
			return;
		}
		const r = await window.liturgi.readService(p);
		if (!r.ok) { toast.error('Klarte ikke åpne: ' + (r.error ?? 'ukjent feil')); return; }
		const data = parseLiturgi(r.json);
		if (!data) { toast.error('Filen ser ikke ut som en liturgi-fil'); return; }
		åpneIFil(data, p);
	} catch (err) {
		toast.error('Klarte ikke åpne: ' + (err?.message ?? err));
	}
}

/** Åpne allerede lest data fra en bestemt filsti (Finder/åpne-dialog). */
export function openFromData(rawOrData, filePath) {
	const data = typeof rawOrData === 'string' ? parseLiturgi(rawOrData) : rawOrData;
	if (!data) { toast.error('Filen ser ikke ut som en liturgi-fil'); return false; }
	åpneIFil(data, filePath);
	return true;
}

/** Sett visningsvalg på dokumentet (per gudstjeneste/mal). */
function dokumentValg(data) {
	data.visInstr = data.visInstr ?? true;
	data.visRoles = data.visRoles ?? true;
	data.visSalmeinfo = data.visSalmeinfo ?? true;
}

/** Bytt til en allerede åpen gudstjeneste. */
function åpneNy(obj) {
	app.current = obj;
	app.kind = 'service';
	app.visning = 'hjem';
	app.dirty = !!obj.__dirty;
	syncDirty();
}

function åpneIFil(data, filePath) {
	dokumentValg(data);
	// fyll lenkede hoveddeler fra malene deres først (generisk __lenket-synk)
	synkLenkedeSeksjoner(data);
	// stabil nøkkel for «åpne gudstjenester»-markering (ikke-enumerert: lagres ikke i filen)
	if (!data.__åpenId) Object.defineProperty(data, '__åpenId', { value: uid(), enumerable: false });
	data.filePath = filePath;
	data.kind = 'service';
	app.current = data;
	app.kind = 'service';
	app.visning = 'hjem';
	app.dirty = false;
	syncDirty();
	// registrer som «åpne gudstjeneste» (denne økten)
	if (!app.åpneTjenester.some((x) => x.path === filePath)) {
		app.åpneTjenester.push({ obj: data, name: data.name ?? '', path: filePath, åpenId: data.__åpenId, dirty: false });
	} else {
		const e = app.åpneTjenester.find((x) => x.path === filePath);
		if (e) { e.obj = data; e.name = data.name ?? ''; e.åpenId = data.__åpenId; e.dirty = false; }
	}
	touchRecent(data).then(() => refreshRecentServices());
}

function parseLiturgi(raw) {
	try {
		const parsed = JSON.parse(raw);
		const data = parsed?.liturgiFormat ? parsed.data : parsed;
		if (!data || !Array.isArray(data.sections)) return null;
		delete data.__dirty; // gamle filer kan ha flagget bakt inn — åpnes alltid rent
		data.malForm = data.malForm ?? 'bokmål'; // gamle filer: bokmål er standard
		return data;
	} catch {
		return null;
	}
}

/** Lytt etter .liturgi/.limal-filer åpnet fra Finder (kun Electron). */
export function listenForFinderOpen() {
	if (!isElectron) return;
	window.liturgi.onOpenFile((payload) => {
		// payload = {json, filePath} — filen åpnes der den ligger, uten å kopieres
		let data = payload;
		if (typeof payload === 'string') {
			try { payload = JSON.parse(payload); } catch { /* gammelt format: kun innhold */ }
		}
		if (payload && typeof payload === 'object' && 'json' in payload && 'filePath' in payload) {
			const parsed = parseLiturgi(payload.json);
			if (!parsed) { toast.error('Filen ser ikke ut som en liturgi-fil'); return; }
			const erMal = /\.limal$/i.test(payload.filePath) || parsed.kind === 'template';
			if (erMal) {
				// .limal-filer åpnes for import (navn kan endres, kopieres til brukermaler)
				importerMalFil(payload.json, payload.filePath);
			} else if (openFromData(parsed, payload.filePath)) {
				toast.success('Åpnet: ' + payload.filePath.split('/').pop());
			}
		} else if (typeof data === 'string') {
			// fallback for gamle meldinger uten sti
			const parsed = parseLiturgi(data);
			if (parsed && openFromData(parsed, parsed.filePath ?? null)) toast.success('Åpnet filen');
		}
	});
}

/** Avslutning med ulagrede endringer: lagre alt som er åpent, og si fra til main at appen kan avsluttes. */
export function listenForSaveThenClose() {
	if (!isElectron) return;
	window.liturgi.onSaveThenClose(async () => {
		try {
			// lagre alle åpne dokumenter med endringer (inkludert «lagre som …» for ulagrede)
			for (const e of app.åpneTjenester) {
				if (!e.obj?.__dirty) continue;
				app.current = e.obj;
				app.kind = e.obj.kind ?? 'service';
				await saveCurrentToFile();
			}
		} finally {
			window.liturgi.forceClose();
		}
	});
}

/** Åpne via dialog («Åpne fil …») — filen åpnes der den ligger. */
export async function openFileToStore() {
	let json, filePath = null;
	if (isElectron) {
		const r = await window.liturgi.openFile();
		if (!r.ok) {
			if (!r.canceled) toast.error('Klarte ikke åpne: ' + (r.error ?? 'ukjent feil'));
			return;
		}
		json = r.json;
		filePath = r.filePath;
	} else {
		json = await pickFileBrowser();
		if (json == null) return;
	}
	if (app.dirty && !confirm('Du har ulagrede endringer. Åpne likevel?')) return;
	const data = parseLiturgi(json);
	if (!data) { toast.error('Filen ser ikke ut som en liturgi-fil'); return; }
	if (isElectron && filePath && (data.kind ?? 'service') !== 'template') {
		if (openFromData(data, filePath)) toast.success('Åpnet «' + (data.name ?? 'gudstjeneste') + '»');
	} else if ((data.kind ?? 'service') === 'template') {
		importerMalFil(json, filePath);
	} else {
		importJsonIntoStore(data);
	}
}

/** Filvelger for nettleser-versjonen. */
function pickFileBrowser() {
	return new Promise((resolve) => {
		const inp = document.createElement('input');
		inp.type = 'file';
		inp.accept = '.liturgi,.limal,.json,application/json';
		inp.onchange = () => {
			const f = inp.files?.[0];
			if (!f) return resolve(null);
			f.text().then(resolve).catch(() => resolve(null));
		};
		inp.click();
	});
}

/** Nettleser-modus: legg importert objekt inn i localStorage-store. */
function importJsonIntoStore(data) {
	const isTemplate = (data.kind ?? 'service') === 'template';
	const list = isTemplate ? app.templates : app.services;
	const existing = list.find((x) => x.id === data.id);
	if (existing) data.id = uid();
	data.kind = isTemplate ? 'template' : 'service';
	if (!data.name) data.name = isTemplate ? 'Importert mal' : 'Importert gudstjeneste';
	list.push(data);
	persist();
	if (isTemplate) app.templates = [...app.templates];
	else app.services = [...app.services];
	if (isTemplate) openTemplate(data.id);
	else openService(data.id);
	toast.success(`Åpnet ${isTemplate ? 'malen' : 'gudstjenesten'} «${data.name}»`);
}

/** Slett en gudstjenestefil (kun Electron) — flyttes til papirkurven og fjernes fra listen. */
export async function deleteServiceFile(p) {
	const r = await window.liturgi.deleteService(p);
	if (r.ok) {
		try { await window.liturgi.removeRecent(p); } catch {}
		toast.success('Flyttet til papirkurven');
		await refreshRecentServices();
	}
	else toast.error('Klarte ikke slette: ' + (r.error ?? 'ukjent feil'));
}

/* ---------- lokale maler som filer i ~/.config/Liturgi/maler ---------- */

/** Last maler fra disk. Originalmaler seedes til maler/originaler hvis de mangler,
 *  maler laget i appen ligger i maler/brukermaler. Originalene synkroniseres
 *  samtidig inn i SQLite-biblioteket (oppslagsregister for ledd på tvers av maler). */
export async function loadTemplatesFromDisk() {
	if (!isElectron) return;
	try {
		// 1) migrer lokale maler fra localStorage til brukermaler (én gang)
		const { pendingLocalTemplates } = await import('./store.svelte.js');
		if (pendingLocalTemplates?.length) {
			for (const t of pendingLocalTemplates) {
				const json = JSON.stringify({ liturgiFormat: 1, kind: 'template', data: t }, null, '	');
				const safe = (t.name || 'mal').replace(/[\\/:*?"<>|]+/g, '').trim() || 'mal';
				const list = await window.liturgi.listTemplates();
				const taken = new Set([...list.originaler, ...list.brukermaler].map((x) => x.path));
				let p = `${list.dirs.brukermaler}/${safe}.limal`, n = 2;
				while (taken.has(p)) { p = `${list.dirs.brukermaler}/${safe} (${n}).limal`; n++; }
				await window.liturgi.writeTemplate(p, json);
			}
			pendingLocalTemplates.length = 0;
		}

		// 2) seed originalmalene hvis de mangler (BUILTIN + WIP-maler).
		// Identitet er ID og seed-filnavn, IKKE mal-navn: bm/nn-par deler navn
		// (målformen er ut av navnet og kategoriseres i appen).
		const list = await window.liturgi.listTemplates();
		if (!list.ok) return;
		const filEksisterende = new Set();
		const idEksisterende = new Set();
		for (const m of [...list.originaler, ...list.brukermaler]) {
			filEksisterende.add(m.path.split('/').pop());
			const rd0 = await window.liturgi.readTemplate(m.path);
			if (!rd0.ok) continue;
			try { const id0 = (JSON.parse(rd0.json)?.data ?? {})?.id; if (id0) idEksisterende.add(id0); } catch {}
		}
		for (const bt of [...BUILTIN_TEMPLATES, ...WIP_TEMPLATES]) {
			const filnavn = safeNavn(bt.filnavn ?? bt.name) + '.limal';
			if (filEksisterende.has(filnavn) || idEksisterende.has(bt.id)) continue;
			// originaler: hovedgudstjenesten, gravferdsordningen og maler flagget erOriginal
			// (dåp/vigsel/konfirmasjon/forbønn-ordningene); ellers brukermaler
			const sub = bt.erOriginal || /hovedgudstjeneste|gravferd/i.test(bt.name) ? 'originaler' : 'brukermaler';
			await window.liturgi.writeTemplate(`${list.dirs[sub]}/${filnavn}`, originalSeedJson(bt));
		}

		// 2b) INTEGRITETSSJEKK: originalmaler i maler/originaler skal være
		// identiske med seed-malene (kilden: src/lib/data.js). Avvik —
		// uventet redigering, skade, halvferdige skrivinger — regenereres
		// fra seed. Matching går på ID: bm/nn-par deler mal-navn, så navn
		// kan ikke brukes som nøkkel (da overskriver bm-seeden nn-filen).
		const list1b = await window.liturgi.listTemplates();
		if (list1b.ok) {
			const idTilMeta = new Map();
			for (const m of list1b.originaler) {
				const rd0 = await window.liturgi.readTemplate(m.path);
				if (!rd0.ok) continue;
				try {
					const id0 = (JSON.parse(rd0.json)?.data ?? {})?.id;
					if (id0 && !idTilMeta.has(id0)) idTilMeta.set(id0, m);
				} catch {}
			}
			for (const bt of [...BUILTIN_TEMPLATES, ...WIP_TEMPLATES]) {
				const erOriginal = bt.erOriginal || /hovedgudstjeneste|gravferd/i.test(bt.name);
				if (!erOriginal) continue;
				const meta = idTilMeta.get(bt.id);
				if (!meta) {
					// ingen fil med seedens id — gjenopprett på seed-filnavnet
					const filnavn = safeNavn(bt.filnavn ?? bt.name) + '.limal';
					await window.liturgi.writeTemplate(`${list1b.dirs.originaler}/${filnavn}`, originalSeedJson(bt));
					console.warn('[liturgi] Originalmal manglet, seedet på nytt:', bt.name);
					continue;
				}
				const rd = await window.liturgi.readTemplate(meta.path);
				if (!rd.ok) continue;
				const forventet = originalSeedJson(bt);
				if (rd.json !== forventet) {
					await window.liturgi.writeTemplate(meta.path, forventet);
					console.warn('[liturgi] Originalmal regenerert fra seed:', bt.name);
				}
			}
		}

		// 3) les alle maler fra disk (originaler først, så brukermaler).
		// Dedupe på ID-nivå: ekte duplikater (.liturgi + .limal etter en
		// seed-skriving) har samme id → behold nyeste. Like navn med ULIKT
		// innhold er to ulike maler (f.eks. nynorsk-kopi som heter det samme
		// som en original) og skal begge vises i listen.
		const list2 = await window.liturgi.listTemplates();
		if (!list2.ok) return;
		const idPerNyeste = new Map(); // id -> { meta, data, mtime }
		for (const meta of [...list2.originaler, ...list2.brukermaler]) {
			const rd = await window.liturgi.readTemplate(meta.path);
			if (!rd.ok) continue;
			const data = parseLiturgi(rd.json);
			if (!data) continue;
			const entry = { meta, data, mtime: meta.mtime ?? 0 };
			const gammel = idPerNyeste.get(data.id);
			if (!gammel || entry.mtime >= gammel.mtime) idPerNyeste.set(data.id, entry);
		}
		const disk = [];
		for (const { meta, data } of idPerNyeste.values()) {
			data.filePath = meta.path;
			data.kind = 'template';
			if (!data.builtinKey) data.builtinKey = 'original-' + safeNavn(data.name).toLowerCase().replace(/\s+/g, '-');
			disk.push(data);
		}
		// lenket innhold: backup hvis lenket mal ikke finnes. MÅ kjøre ETTER at
		// alle maler er lest — ellers ser kontrollen en tom mal-liste og meldør
		// feilaktig at gyldige lenker er tapt (sml. Konfirmasjon → HG-nattverden).
		const diskIder = new Set(disk.map((d) => d.id));
		for (const data of disk) {
			if (!behandlLenketBackup(data, diskIder)) continue;
			const meta = idPerNyeste.get(data.id)?.meta;
			if (meta) await window.liturgi.writeTemplate(meta.path, JSON.stringify({ liturgiFormat: 1, kind: 'template', data }, null, '	'));
			toast.info('Malen «' + (data.name ?? 'uten navn') + '» inneholdt lenket innhold som er kopiert inn (lenket mal finnes ikke).');
		}
		app.templates = disk;

		// LENKE-SYNK: «Dåp i hovedgudstjenesten» er KILDEN for dåpsdelen i
		// «Ordning for hovedgudstjeneste» (samme stabile ledd-id-er h-l-dap*).
		// Innholdet kopieres fra dåp-malen til HG ved hver innlesing — HG-ordningen
		// er dermed bare en visning av dåp-malen på sitt sted i gudstjenesten.
		const dopMal = disk.find((t) => t.id === 'dop-i-hovedgudstjenesten-2017');
		const hg = disk.find((t) => t.id === 'hovedgudstjeneste2020');
		if (dopMal && hg) {
			// __lenket Dåp-seksjon med markeringsledd (dev-mal) eller tom (frø/disk):
			// gjenopprett full seksjonsstruktur fra dåp-malen
			for (const sec of hg.sections) {
				if (!sec.__lenket) continue;
				// ny generisk lenkeformat: __lenket { malId, tittel } — får samme
				// behandling som alle lenkede hoveddeler (merke + redigeringslås,
				// innholdet fornyes av synkLenkedeSeksjoner)
				sec.__lenket = { malId: dopMal.id, tittel: "Dåp i hovedgudstjenesten" };
				// fjern gamle markeringsledd og marker-heading fra den gamle ordningen
				sec.items = (sec.items ?? []).filter((it) => it.id !== 'h-l-dap-lenke'
					&& !/^Dåp \(lenket til/i.test(it.heading ?? ''));
				if (sec.items.length === 0) {
					// frø/disk: seksjonen er tom — alle leddene kommer fra dåp-malen
					sec.items = JSON.parse(JSON.stringify(dopMal.sections.flatMap((ds) => ds.items)));
					console.log('[lenke-synk] Dåp-seksjonen i HG bygget fra dåp-malen (' + sec.items.length + ' ledd)');
				}
			}
			const dopLedd = new Map();
			for (const sec of dopMal.sections) for (const it2 of sec.items) dopLedd.set(it2.id, it2);
			let oppdatert = 0;
			for (const sec of hg.sections) {
				for (const it2 of sec.items) {
					const kilde = dopLedd.get(it2.id);
					if (!kilde) continue;
					// innholdsfeltene fra dåp-malen; heading/struktur beholdes fra HG
					for (const f of ['text', 'instr', 'alts', 'selAlt', 'introAlts', 'selIntro', 'avslutningAlts', 'selAvsl']) {
						if (f in kilde) it2[f] = kilde[f];
						else delete it2[f];
					}
					if (it2.alts && it2.selAlt === undefined) it2.selAlt = 0;
					oppdatert++;
				}
			}
			if (oppdatert) console.log('[lenke-synk] ' + oppdatert + ' dåpsledd i HG oppdatert fra dåp-malen');
		}
		// synkroniser originalene inn i SQLite-biblioteket – kun hvis antall rader
		// ikke stemmer (f.eks. første oppstart eller etter oppdatert original)
		const cnt = isElectron && window.liturgi.bibCounts ? await window.liturgi.bibCounts() : null;
		const antall = cnt?.ok ? cnt.counts : {};
		const sig = cnt?.ok ? (cnt.sig ?? {}) : {};

		/** Samme rask hash som bibSig() i db.cjs — ordens-uavhengig (sum av
		 *  per-rad-hasher), så malens rekkefølge er likegyldig. */
		function hashAv(entries) {
			let sum = 0;
			for (const e of entries) {
				const s = [e.seksjon, e.ledd, e.ledd_id ?? '', e.alt_label, e.tekst].join('\u0001');
				let h = 5381;
				for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
				sum = (sum + h) >>> 0;
			}
			return sum >>> 0;
		}
		// kirkeårsprefasjonene (KBM 2020) er en egen «virtuell kilde» i biblioteket:
		// 12 kirkeårsbestemte (først) + de generelle a–g — hentet fra
		// nattverd-prefasjon-leddet i hovedgudstjenesten (BUILTIN)
		// NB: det kan ligge flere (stale) disk-kopier av hovedgudstjenesten — velg
		// den versjonen av nattverd-prefasjonen som har FLEST alts (disk-kopiene
		// oppdateres ikke automatisk når data.js får nye alternativer)
		const builtinHovedmal = BUILTIN_TEMPLATES.find((t) => t.id === 'hovedgudstjeneste2020');
		const prefLeddKandidater = [
			...disk.filter((t) => t.id === 'hovedgudstjeneste2020')
				.map((t) => t.sections?.flatMap((x) => x.items).find((x) => x.id === 'nattverd-prefasjon')),
			builtinHovedmal?.sections?.flatMap((x) => x.items).find((x) => x.id === 'nattverd-prefasjon')
		].filter(Boolean);
		prefLeddKandidater.sort((a, b) => (b.alts?.length ?? 0) - (a.alts?.length ?? 0));
		const prefLedd = prefLeddKandidater[0];
		if (prefLedd?.alts?.length) {
			const kirkeaarEntries = [];
			for (const alt of prefLedd.alts) {
				kirkeaarEntries.push({ seksjon: 'Prefasjoner', ledd: 'Kirkeårsprefasjoner', ledd_id: prefLedd.id ?? '', alt_label: alt.label, tekst: alt.text });
			}
			if ((antall['Kirkeårsprefasjoner (2020)'] ?? 0) !== kirkeaarEntries.length) {
				await window.liturgi.bibSync('Kirkeårsprefasjoner (2020)', kirkeaarEntries);
			}
		}
		const kildeNavn = (t) => t.name + (t.malForm && t.malForm !== 'bokmål' ? ' (' + t.malForm + ')' : ''); // bm/nn deler navn — registeret må skille dem
		for (const tpl of disk.filter((t) => !!t.builtinKey)) {
			const entries = [];
			for (const sec of tpl.sections) {
				for (const it of sec.items) {
					// innledning/avslutning sendes som egne kolonner — strukturen
					// (innledning/hoveddel/avslutning) bevares ved «hent ledd»
					const intro = it.introAlts?.[it.selIntro ?? 0]?.text ?? '';
					const avsl = it.avslutningAlts?.[it.selAvsl ?? 0]?.text ?? '';
					// bibDup: alternativet er innholdsmessig identisk med originalmalen
					// (Ordning for hovedgudstjenesten) og skal ikke inn i bibliotekslisten
					if (it.bibDup) continue;
					const alts = (it.alts?.length ? it.alts : [{ label: '', text: it.text }])
						.filter((a) => !a.bibDup)
						.map((a) => ({ alt_label: a.label || 'Alternativ', tekst: a.text ?? '' }));
					for (const a of alts) {
						// ledd_id: mal-itemets stabile id — tittelen (heading) er kun visning
						entries.push({ seksjon: sec.title, ledd: it.heading, ledd_id: it.id ?? '', alt_label: a.alt_label, tekst: a.tekst, intro_tekst: intro, avsl_tekst: avsl });
					}
				}
			}
			// stikkprøve: antall OG innholds-hash må stemme, ellers bygges biblioteket
			// på nytt (fanger tittel-/tekstendringer som ikke endrer radantallet)
			const gammel = sig[kildeNavn(tpl)];
			if (gammel && gammel.n === entries.length && gammel.hash === hashAv(entries)) continue;
			// sikre unike (ledd, alt_label) — bibliotek-tabellens primærnøkkel
			const sett = new Set();
			for (const e of entries) {
				let l = e.alt_label, n = sett.has(e.ledd + '|' + l) ? 1 : 0;
				while (sett.has(e.ledd + '|' + l)) { n++; l = (e.alt_label || 'Alternativ') + ' ' + n; }
				sett.add(e.ledd + '|' + l);
				e.alt_label = l;
			}
			const syss = await window.liturgi.bibSync(kildeNavn(tpl), entries);
			if (syss && !syss.ok) toast.error('Bibliotekssynk feilet for «' + tpl.name + '»: ' + (syss.error ?? ''));
		}
	} catch (err) {
		toast.error('Klarte ikke lese malene: ' + (err?.message ?? err));
	}
}

/** Søk i biblioteket (hovedgudstjenesten m.fl.). */
export async function bibSearch(q) {
	if (!isElectron) return [];
	const r = await window.liturgi.bibSearch(q);
	return r.ok ? r.rows : [];
}

/* ---------- bibliotek_bruker: eget innhold i biblioteket ---------- */

export async function bibUserList() {
	if (!isElectron) return [];
	const r = await window.liturgi.bibUserList();
	return r.ok ? r.rows : [];
}

export async function bibUserAdd(r) {
	const res = await window.liturgi.bibUserAdd(r);
	if (!res.ok) toast.error('Klarte ikke lagre: ' + (res.error ?? 'ukjent feil'));
	return res.ok ? res.id : null;
}

export async function bibUserUpdate(id, r) {
	const res = await window.liturgi.bibUserUpdate(id, r);
	if (!res.ok) toast.error('Klarte ikke lagre: ' + (res.error ?? 'ukjent feil'));
	return res.ok;
}

export async function bibUserDelete(id) {
	const res = await window.liturgi.bibUserDelete(id);
	if (!res.ok) toast.error('Klarte ikke slette: ' + (res.error ?? 'ukjent feil'));
	return res.ok;
}

/** Eksporter alle brukeropprettede bibliotek-rader til en JSON-fil. */
export async function eksporterBibliotek(rows) {
	const json = JSON.stringify({ bibliotekEksport: 1, eksportert: new Date().toISOString(), rader: rows }, null, '	');
	const r = await window.liturgi.saveFile({ defaultName: 'bibliotek-eksport.json', json });
	if (r.ok) toast.success('Eksportert: ' + r.filePath.split('/').pop());
	else if (!r.canceled) toast.error('Klarte ikke eksportere: ' + (r.error ?? 'ukjent feil'));
	return r.ok;
}

/** Importer eget innhold (rader fra eksporterBibliotek-JSON) — dubletter
 *  (samme mappe/ledd/alternativ/tekst) hoppes over. */
export async function importerBibliotek(rader) {
	if (!isElectron || !Array.isArray(rader)) return { ok: false, n: 0, dup: 0 };
	const eksisterende = await bibUserList();
	const nokkel = (r) => [r.mappe ?? '', r.ledd ?? '', r.alt_label ?? '', r.tekst ?? ''].join('\u00a6');
	const sett = new Set(eksisterende.map(nokkel));
	let n = 0, dup = 0;
	for (const r of rader) {
		if (!r || typeof r !== 'object' || !r.ledd) { dup++; continue; }
		const k = nokkel(r);
		if (sett.has(k)) { dup++; continue; }
		await bibUserAdd({ mappe: r.mappe ?? '', ledd: r.ledd, alt_label: r.alt_label ?? '', tekst: r.tekst ?? '', tags: r.tags ?? '' });
		sett.add(k);
		n++;
	}
	return { ok: true, n, dup };
}

/** Regenerer SQLite-biblioteket manuelt fra originalmalene (Innstillinger). */
export async function regenererBibliotek() {
	if (!isElectron) return false;
	try {
		const list = await window.liturgi.listTemplates();
		if (!list.ok) throw new Error(list.error ?? 'ukjent feil');
		let n = 0;
		for (const meta of [...list.originaler, ...list.brukermaler]) {
			const rd = await window.liturgi.readTemplate(meta.path);
			if (!rd.ok) continue;
			const data = parseLiturgi(rd.json);
			if (!data || !data.builtinKey) continue; // bare innebygde maler i registeret
			const entries = [];
			for (const sec of data.sections) {
				for (const it of sec.items) {
					const intro = it.introAlts?.[it.selIntro ?? 0]?.text ?? '';
					const avsl = it.avslutningAlts?.[it.selAvsl ?? 0]?.text ?? '';
					const alts = it.alts?.length
						? it.alts.map((a) => ({ alt_label: a.label || 'Alternativ', tekst: a.text ?? '' }))
						: [{ alt_label: '', tekst: it.text ?? '' }];
					for (const a of alts) entries.push({ seksjon: sec.title, ledd: it.heading, alt_label: a.alt_label, tekst: a.tekst, intro_tekst: intro, avsl_tekst: avsl });
				}
			}
			await window.liturgi.bibSync(data.name, entries);
			n += entries.length;
		}
		toast.success('Biblioteket er gjenoppbygd (' + n + ' rader)');
		return true;
	} catch (err) {
		toast.error('Klarte ikke regenerere biblioteket: ' + (err?.message ?? err));
		return false;
	}
}

/** Seed-JSON for en originalmal, eksakt slik den skrives til
 *  maler/originaler/<navn>.limal ved seeding. Kilden er src/lib/data.js
 *  (BUILTIN_TEMPLATES) — brukes både ved seeding og integritetssjekken
 *  (2b i loadTemplatesFromDisk) som regenererer avvikende filer. */
export function originalSeedJson(bt) {
	const data = JSON.parse(JSON.stringify(bt));
	for (const sec of data.sections) for (const it of sec.items) autoMarkMigrate(it);
	if (!data.builtinKey) data.builtinKey = 'original-' + safeNavn(bt.name).toLowerCase().replace(/\s+/g, '-');
	return JSON.stringify({ liturgiFormat: 1, kind: 'template', data }, null, '\t');
}

export function safeNavn(n) {
	return (n || 'mal').replace(/[\\/:*?"<>|]+/g, '').trim() || 'mal';
}

function autoMarkMigrate(it) {
	// rolleprefikser («L | tekst») er førsteklasses syntaks i riktekst-editoren
	// (redigerbar chip) — pakkes ikke lenger automatisk inn i {{r}}…{{/r}}
}

/** Lagre en kopi av det åpne objektet som lokal mal (fil på disk). */
export async function saveAsTemplateOnDisk(name) {
	const o = app.current;
	if (!o) return;
	const t = {
		id: uid(), kind: 'template', name: name || o.name,
		liturgiType: o.liturgiType ?? 'gudstjeneste',
		sections: JSON.parse(JSON.stringify(o.sections)).map((sec) => ({
			title: sec.title,
			items: sec.items.map((x) => ({
				id: x.tplId ?? x.id, type: x.type, heading: x.heading, optional: x.optional,
				text: x.text, instr: x.instr, alts: x.alts, selAlt: x.selAlt, role: x.role ?? ''
			}))
		}))
	};
	try {
		const list = await window.liturgi.listTemplates();
		const safe = safeNavn(t.name);
		const taken = new Set([...list.originaler, ...list.brukermaler].map((x) => x.path));
		let p = `${list.dirs.brukermaler}/${safe}.limal`, n = 2;
		while (taken.has(p)) { p = `${list.dirs.brukermaler}/${safe} (${n}).limal`; n++; }
		const r = await window.liturgi.writeTemplate(p, JSON.stringify({ liturgiFormat: 1, kind: 'template', data: t }, null, '	'));
		if (!r.ok) { toast.error('Klarte ikke lagre malen: ' + (r.error ?? 'ukjent feil')); return; }
		t.filePath = r.filePath;
		app.templates.push(t);
		openTemplate(t.id);
		app.dirty = false;
		toast.success('Malen «' + t.name + '» er lagret');
	} catch (err) {
		toast.error('Klarte ikke lagre malen: ' + (err?.message ?? err));
	}
}

/** Opprett en ny lokal mal direkte som fil på disk (kun Electron).
 *  base = eksisterende mal som utgangspunkt (kopierer sections + målform), null = tom. */
export async function newTemplateOnDisk(name, malForm = 'bokmål', base = null) {
	const t = {
		id: uid(), kind: 'template', name: name || 'Ny grunnordning', malForm,
		sections: [{ title: 'I. Samling', items: [] }]
	};
	if (base) {
		t.malForm = base.malForm ?? 'bokmål';
		// NB: structuredClone kaster DataCloneError på Svelte 5-proxies — dyp-kopi via JSON
		// (sections er ren data: strenger/tall/lister)
		t.sections = JSON.parse(JSON.stringify(base.sections ?? [{ title: 'I. Samling', items: [] }]));
		t.visInstr = base.visInstr;
	}
	try {
		const list = await window.liturgi.listTemplates();
		const safe = safeNavn(t.name);
		const taken = new Set([...list.originaler, ...list.brukermaler].map((x) => x.path));
		let p = `${list.dirs.brukermaler}/${safe}.limal`, n = 2;
		while (taken.has(p)) { p = `${list.dirs.brukermaler}/${safe} (${n}).limal`; n++; }
		const r = await window.liturgi.writeTemplate(p, JSON.stringify({ liturgiFormat: 1, kind: 'template', data: t }, null, '	'));
		if (!r.ok) { toast.error('Klarte ikke lagre malen: ' + (r.error ?? 'ukjent feil')); return; }
		t.filePath = r.filePath;
		app.templates.push(t);
		openTemplate(t.id);
		toast.success('Malen «' + t.name + '» er opprettet');
	} catch (err) {
		toast.error('Klarte ikke opprette malen: ' + (err?.message ?? err));
	}
}

/** Importér en malfil (.limal/.liturgi) — spør om navn, sjekk navnekonflikt, kopier til brukermaler. */
export function importerMalFil(json, filePath) {
	const data = parseLiturgi(json);
	if (!data || (data.kind ?? 'template') !== 'template') {
		toast.error('Filen er ikke en mal');
		return;
	}
	const forslag = data.name
		|| (filePath ? filePath.split('/').pop().replace(/\.limal$/i, '') : '')
		|| 'Importert mal';
	prompt('Importér mal', 'Navn på malen', async (name) => {
		try {
			const list = await window.liturgi.listTemplates();
			// navnekonflikt mot eksisterende brukermaler → nummereres automatisk
			const eksisterende = new Set(
				app.templates.filter((t) => !erOriginalMal(t)).map((t) => t.name.toLowerCase())
			);
			let navn = (name || forslag).trim() || forslag;
			let n = 2;
			while (eksisterende.has(navn.toLowerCase())) { navn = `${navn} (${n})`; n++; }
			data.name = navn;
			data.kind = 'template';
			data.id = uid();
			delete data.builtinKey;
			data.filePath = null;
			// lenket innhold: backup hvis lenket mal ikke finnes i installasjonen
			if (behandlLenketBackup(data)) {
				toast.info('Malen inneholdt lenket innhold som ikke kunne kobles — innholdet er kopiert inn som vanlig tekst.');
			}
			const safe = safeNavn(navn);
			const taken = new Set([...list.originaler, ...list.brukermaler].map((x) => x.path));
			let p = `${list.dirs.brukermaler}/${safe}.limal`;
			n = 2;
			while (taken.has(p)) { p = `${list.dirs.brukermaler}/${safe} (${n}).limal`; n++; }
			const w = await window.liturgi.writeTemplate(p, JSON.stringify({ liturgiFormat: 1, kind: 'template', data }, null, '	'));
			if (!w.ok) { toast.error('Klarte ikke importere malen: ' + (w.error ?? 'ukjent feil')); return; }
			data.filePath = w.filePath;
			await loadTemplatesFromDisk();
			openTemplate(data.id);
			toast.success('Malen «' + navn + '» er importert');
		} catch (err) {
			toast.error('Klarte ikke importere malen: ' + (err?.message ?? err));
		}
	}, forslag);
}

/** Lukk redigering: uten ulagrede endringer lukkes det direkte,
 *  ellers vises Avbryt / Lagre / Lukk uten å lagre. */
export function lukkRedigering() {
	if (!app.current) return;
	if (!app.dirty) { closeEditor(); return; }
	const erDev = !!app.current.__devMal;
	lukkModal(async () => {
		closeModal();
		const o = app.current;
		const haddeFilsti = !!o?.filePath;
		if (isElectron) {
			if (erDev) {
				// dev-mal: «Lagre» betyr «Lagre til prosjektet» — feiler det, forbli i redigeringen
				const { lagreTilProsjekt } = await import('./malverktoy.svelte.js');
				const ok = await lagreTilProsjekt();
				if (!ok) return;
			} else {
				await saveCurrent();
				// lagre-dialog avbrutt → forbli i redigeringen
				if (!haddeFilsti && !app.current?.filePath) return;
			}
		} else {
			persist();
		}
		closeEditor();
	}, () => {
		if (app.current) app.current.__dirty = false;
		app.dirty = false;
		syncDirty();
		closeEditor();
	});
}

/** Slett en lokal malfil (kun Electron) — flyttes til papirkurven. */
export async function deleteTemplateFile(p) {
	const r = await window.liturgi.deleteTemplateFile(p);
	if (r.ok) {
		app.templates = app.templates.filter((t) => t.filePath !== p);
		if (app.current?.filePath === p) closeEditor();
		toast.success('Malen er flyttet til papirkurven');
	}
	else toast.error('Klarte ikke slette: ' + (r.error ?? 'ukjent feil'));
}

// aktiver Finder-lytten når modulen lastes (kun i Electron)
listenForFinderOpen();
// lytt etter «lagre og lukk» fra avsluttingsdialogen (kun i Electron)
listenForSaveThenClose();

// ---------- mac-menylinjen: handlinger fra toppmenyen ----------
function nyGudstjenesteFraMeny(type = 'gudstjeneste') {
	if (!app.templates.length) { toast.error('Ingen maler å base ny gudstjeneste på'); return; }
	newServiceModal((name, date, tplId, include, kirkeaar, tekster, valgLedd, valgtGruppe) => {
		createService(name, date, tplId, include, kirkeaar, tekster, valgLedd, valgtGruppe);
	}, type);
}

function lagreSomMalFraMeny() {
	const o = app.current;
	if (!o) return;
	const isElectron = typeof window !== 'undefined' && !!window.liturgi?.isElectron;
	if (isElectron) {
		prompt('Lagre som lokal mal', 'Navn på malen', (name) => saveAsTemplateOnDisk(name), o.name + ' (grunnordning)');
	} else {
		prompt('Lagre som lokal mal', 'Navn på malen', (name) => saveAsTemplate(name), o.name + ' (grunnordning)');
	}
}

/** Kjør en meny-handling (brukes av mac-menyen og Cmd+K-kommandopaletten). */
export async function kjorMenyId(id) {
	switch (id) {
		case 'ny-gudstjeneste': nyGudstjenesteFraMeny(); break;
		case 'ny-gravferd': nyGudstjenesteFraMeny('gravferd'); break;
		case 'apne-fil': openFileToStore(); break;
		case 'lagre': saveCurrent(); break;
		case 'lagre-som': saveCurrentToFile(); break;
		case 'lagre-som-mal': lagreSomMalFraMeny(); break;
		case 'lagre-som-kopi': lagreMalSomKopi(); break;
		case 'eksport': app.visning = 'eksport'; break;
		case 'eks-tittel': case 'eks-avsnitt': window.__eksMeny?.(id); break;
		case 'salmeoversikt': if (app.kind === 'service') app.visning = 'salmer'; break;
		case 'vis-leddinnhold': app.eksVisInnhold = !app.eksVisInnhold; try { localStorage.setItem('eks-visInnhold', app.eksVisInnhold ? '1' : '0'); } catch {} break;
		case 'koblet-visning': app.eksKoblet = !app.eksKoblet; try { localStorage.setItem('eks-koblet', app.eksKoblet ? '1' : '0'); } catch {} break;
		case 'apne-mappe': if (app.current?.filePath) window.liturgi?.apneMappe?.(app.current.filePath); break;
		case 'lukk-dok': lukkRedigering(); break;
		case 'hjem': app.current = null; app.kind = null; app.visning = 'hjem'; break;
		case 'maler': app.current = null; app.kind = null; app.visning = 'maler'; break;
		case 'bibliotek': app.current = null; app.kind = null; app.visning = 'bibliotek'; break;
		case 'kirkeaar': app.current = null; app.kind = null; app.visning = 'kirkeaar'; break;
		case 'innstillinger': app.current = null; app.kind = null; app.visning = 'innstillinger'; break;
		case 'veksle-vim': veksleVim(); break;
		case 'forb-modul': app.forbModul = true; app.current = null; app.kind = null; app.visning = 'kirkeaar'; break;
		case 'forb-apne-mappe': {
			const r = await window.liturgi?.dbGet?.('prekenforberedelseMappe');
			const m = r?.ok ? (r.value ?? '') : '';
			if (m) await window.liturgi.apneMappe(m);
			else { app.current = null; app.kind = null; app.visning = 'innstillinger'; }
			break;
		}
		case 'veksle-sidebar': veksleSidebar(); break;
		case 'veksle-toc': veksleToc(); break;
		case 'tema': toggleTheme(); break;
		default: if (id.startsWith('eks:')) { window.__eksMeny?.(id); return; } break;
	}
}

if (typeof window !== 'undefined') {
	window.liturgi?.onMenyHandling?.((id) => kjorMenyId(id));
}
