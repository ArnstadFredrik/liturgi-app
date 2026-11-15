import { app, persist, uid, openService, openTemplate, closeEditor, entryFor, syncDirty, veksleSidebar, veksleToc, toggleTheme, createService } from './store.svelte.js';
import { BUILTIN_TEMPLATES } from './data.js';
import { prompt, lukkModal, closeModal, newServiceModal } from './modal.svelte.js';
import { toast } from 'svelte-sonner';

const isElectron = typeof window !== 'undefined' && !!window.liturgi?.isElectron;

/** Serialiser nåværende gudstjeneste eller mal til lagringsformat. */
export function currentJson() {
	const o = app.current;
	if (!o) return null;
	// __dirty/filePath er runtime-felter — skal aldri inn i filen (gjør at
	// gjenåpnede filer ellers markeres som endret uten endringer)
	return JSON.stringify({ liturgiFormat: 1, kind: o.kind ?? app.kind, data: o },
		(k, v) => (k === '__dirty' || k === 'filePath' ? undefined : v), '\t');
}

/** Filnavn: "dato - navn - kirkeårsdag". */
export function fileNameFor(o) {
	const parts = [];
	if (o.date) parts.push(o.date);
	parts.push((o.name || 'gudstjeneste').replace(/[\\/:*?"<>|]+/g, '').trim() || 'gudstjeneste');
	if (o.kirkeaar?.name) parts.push(o.kirkeaar.name);
	return parts.join(' - ').replace(/\s+/g, ' ').trim() + '.liturgi';
}

/** Lagre det åpne objektet til disk (Electron). Gudstjenester skrives til
 *  tjenestemappen; første lagring viser lagre-dialog. */
export async function saveCurrentToDisk() {
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
			toast.success('Lagret: ' + r.filePath.split('/').pop());
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
		toast.info('Innebygde maler lagres med «Lagre som mal»');
		return;
	}
	if (erOriginalMal(o)) {
		const rd = await window.liturgi.readTemplate(o.filePath);
		const originalData = rd.ok ? parseLiturgi(rd.json) : null;
		if (!originalData || !malLikBortsettFraValg(originalData, o)) {
			await lagreOriginalSomBrukerKopi(o);
			return;
		}
	}
	const r = await window.liturgi.writeTemplate(o.filePath, currentJson());
	if (r.ok) { app.dirty = false; syncDirty(); toast.success('Malen er lagret'); }
	else toast.error('Klarte ikke lagre: ' + (r.error ?? 'ukjent feil'));
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
		app.current = data;
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
		// normaliser gammel skrivemåte: liturgiType 'gudtjeneste' (uten s) → 'gudstjeneste'
		if (data.liturgiType === 'gudtjeneste') data.liturgiType = 'gudstjeneste';
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
				let p = `${list.dirs.brukermaler}/${safe}.liturgi`, n = 2;
				while (taken.has(p)) { p = `${list.dirs.brukermaler}/${safe} (${n}).liturgi`; n++; }
				await window.liturgi.writeTemplate(p, json);
			}
			pendingLocalTemplates.length = 0;
		}

		// 2) seed originalmalene hvis de mangler
		const list = await window.liturgi.listTemplates();
		if (!list.ok) return;
		const eksisterende = new Set([...list.originaler, ...list.brukermaler].map((x) => x.name));
		for (const bt of BUILTIN_TEMPLATES) {
			if (eksisterende.has(bt.name)) continue;
			// «Ordning for hovedgudstjeneste» og gravferdsordningen er originaler; alle andre innebygde i brukermaler
			const sub = /hovedgudstjeneste|gravferd/i.test(bt.name) ? 'originaler' : 'brukermaler';
			const data = JSON.parse(JSON.stringify(bt));
			for (const sec of data.sections) for (const it of sec.items) autoMarkMigrate(it);
			if (!data.builtinKey) data.builtinKey = 'original-' + safeNavn(bt.name).toLowerCase().replace(/\s+/g, '-');
			const json = JSON.stringify({ liturgiFormat: 1, kind: 'template', data }, null, '	');
			await window.liturgi.writeTemplate(`${list.dirs[sub]}/${safeNavn(bt.name)}.liturgi`, json);
		}

		// 3) les alle maler fra disk (originaler først, så brukermaler)
		const list2 = await window.liturgi.listTemplates();
		if (!list2.ok) return;
		const disk = [];
		for (const meta of [...list2.originaler, ...list2.brukermaler]) {
			const rd = await window.liturgi.readTemplate(meta.path);
			if (!rd.ok) continue;
			const data = parseLiturgi(rd.json);
			if (!data) continue;
			data.filePath = meta.path;
			data.kind = 'template';
			if (!data.builtinKey) data.builtinKey = 'original-' + safeNavn(data.name).toLowerCase().replace(/\s+/g, '-');
			disk.push(data);
		}
		app.templates = disk;
		// synkroniser originalene inn i SQLite-biblioteket – kun hvis antall rader
		// ikke stemmer (f.eks. første oppstart eller etter oppdatert original)
		const cnt = isElectron && window.liturgi.bibCounts ? await window.liturgi.bibCounts() : null;
		const antall = cnt?.ok ? cnt.counts : {};
		for (const tpl of disk.filter((t) => !!t.builtinKey)) {
			const entries = [];
			for (const sec of tpl.sections) {
				for (const it of sec.items) {
					// innledning/avslutning komponeres inn i hver bibliotekrad
					const intro = it.introAlts?.[it.selIntro ?? 0]?.text ?? '';
					const avsl = it.avslutningAlts?.[it.selAvsl ?? 0]?.text ?? '';
					const komponer = (t) => [intro, t, avsl].filter((s) => s && s.trim()).join('\n\n');
					const alts = it.alts?.length
						? it.alts.map((a) => ({ alt_label: a.label || 'Alternativ', tekst: komponer(a.text) }))
						: [{ alt_label: '', tekst: komponer(it.text) }];
					for (const a of alts) {
						entries.push({ seksjon: sec.title, ledd: it.heading, alt_label: a.alt_label, tekst: a.tekst });
					}
				}
			}
			// stikkprøve: radantallet må stemme, ellers bygges biblioteket på nytt
			if ((antall[tpl.name] ?? 0) === entries.length) continue;
			await window.liturgi.bibSync(tpl.name, entries);
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
					const komponer = (t) => [intro, t, avsl].filter((s) => s && s.trim()).join('\n\n');
					const alts = it.alts?.length
						? it.alts.map((a) => ({ alt_label: a.label || 'Alternativ', tekst: komponer(a.text) }))
						: [{ alt_label: '', tekst: komponer(it.text) }];
					for (const a of alts) entries.push({ seksjon: sec.title, ledd: it.heading, alt_label: a.alt_label, tekst: a.tekst });
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

/** Opprett en ny, tom lokal mal direkte som fil på disk (kun Electron). */
export async function newTemplateOnDisk(name) {
	const t = {
		id: uid(), kind: 'template', name: name || 'Ny grunnordning',
		sections: [{ title: 'I. Samling', items: [] }]
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
	lukkModal(async () => {
		closeModal();
		const o = app.current;
		const haddeFilsti = !!o?.filePath;
		if (isElectron) {
			await saveCurrent();
			// lagre-dialog avbrutt → forbli i redigeringen
			if (!haddeFilsti && !app.current?.filePath) return;
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
function nyGudtjenesteFraMeny(type = 'gudstjeneste') {
	if (!app.templates.length) { toast.error('Ingen maler å base ny gudstjeneste på'); return; }
	newServiceModal((name, date, tplId, include, kirkeaar, tekster) => {
		createService(name, date, tplId, include, kirkeaar, tekster);
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
export function kjorMenyId(id) {
	switch (id) {
		case 'ny-gudstjeneste': nyGudtjenesteFraMeny(); break;
		case 'ny-gravferd': nyGudtjenesteFraMeny('gravferd'); break;
		case 'apne-fil': openFileToStore(); break;
		case 'lagre': saveCurrent(); break;
		case 'lagre-som': saveCurrentToFile(); break;
		case 'lagre-som-mal': lagreSomMalFraMeny(); break;
		case 'eksport': app.visning = 'eksport'; break;
		case 'vis-leddinnhold': app.eksVisInnhold = !app.eksVisInnhold; try { localStorage.setItem('eks-visInnhold', app.eksVisInnhold ? '1' : '0'); } catch {} break;
		case 'koblet-visning': app.eksKoblet = !app.eksKoblet; try { localStorage.setItem('eks-koblet', app.eksKoblet ? '1' : '0'); } catch {} break;
		case 'apne-mappe': if (app.current?.filePath) window.liturgi?.apneMappe?.(app.current.filePath); break;
		case 'lukk-dok': lukkRedigering(); break;
		case 'hjem': app.current = null; app.kind = null; app.visning = 'hjem'; break;
		case 'maler': app.current = null; app.kind = null; app.visning = 'maler'; break;
		case 'bibliotek': app.current = null; app.kind = null; app.visning = 'bibliotek'; break;
		case 'innstillinger': app.current = null; app.kind = null; app.visning = 'innstillinger'; break;
		case 'veksle-sidebar': veksleSidebar(); break;
		case 'veksle-toc': veksleToc(); break;
		case 'tema': toggleTheme(); break;
	}
}

if (typeof window !== 'undefined') {
	window.liturgi?.onMenyHandling?.((id) => kjorMenyId(id));
}