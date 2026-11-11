import { app, persist, uid, openService, openTemplate, closeEditor } from './store.svelte.js';
import { BUILTIN_TEMPLATES } from './data.js';
import { toast } from 'svelte-sonner';

const isElectron = typeof window !== 'undefined' && !!window.liturgi?.isElectron;

/** Serialiser nåværende gudstjeneste eller mal til lagringsformat. */
export function currentJson() {
	const o = app.current;
	if (!o) return null;
	return JSON.stringify({ liturgiFormat: 1, kind: o.kind ?? app.kind, data: o }, null, '\t');
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
			app.dirty = false;
			toast.success('Lagret: ' + r.filePath.split('/').pop());
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
			app.dirty = false;
			toast.success('Lagret til ' + r.filePath);
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
			const o = app.current;
			if (o.filePath) {
				const r = await window.liturgi.writeTemplate(o.filePath, currentJson());
				if (r.ok) { app.dirty = false; toast.success('Malen er lagret'); }
				else toast.error('Klarte ikke lagre: ' + (r.error ?? 'ukjent feil'));
			} else {
				toast.info('Innebygde maler lagres med «Lagre som mal»');
			}
		}
	} else {
		persist();
		toast.success('Lagret');
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

/** Åpne en gudstjenestefil fra disken — der den ligger, uten å kopieres. */
export async function openServiceFile(p) {
	try {
		if (app.dirty && !confirm('Du har ulagrede endringer. Åpne likevel?')) return;
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

function åpneIFil(data, filePath) {
	data.filePath = filePath;
	data.kind = 'service';
	app.current = data;
	app.kind = 'service';
	app.dirty = false;
	touchRecent(data).then(() => refreshRecentServices());
}

function parseLiturgi(raw) {
	try {
		const parsed = JSON.parse(raw);
		const data = parsed?.liturgiFormat ? parsed.data : parsed;
		if (!data || !Array.isArray(data.sections)) return null;
		return data;
	} catch {
		return null;
	}
}

/** Lytt etter .liturgi/.limal-filer åpnet fra Finder (kun Electron). */
export function listenForFinderOpen() {
	if (!isElectron) return;
	window.liturgi.onOpenFile((payload) => {
		if (app.dirty && !confirm('Du har ulagrede endringer. Åpne filen likevel?')) return;
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
				parsed.filePath = payload.filePath;
				parsed.kind = 'template';
				app.current = parsed;
				app.kind = 'template';
				app.dirty = false;
				toast.success('Åpnet malen «' + (parsed.name ?? '') + '»');
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
			// «Ordning for hovedgudtjeneste» er original; alle andre innebygde i brukermaler
			const sub = bt.name.toLowerCase().includes('ordning for hovedgudstjeneste') ? 'originaler' : 'brukermaler';
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
		// synkroniser originalene inn i SQLite-biblioteket (oppslagsregister)
		for (const tpl of disk.filter((t) => t.builtinKey?.startsWith('original-'))) {
			const entries = [];
			for (const sec of tpl.sections) {
				for (const it of sec.items) {
					const alts = it.alts?.length
						? it.alts.map((a) => ({ alt_label: a.label || 'Alternativ', tekst: a.text }))
						: [{ alt_label: '', tekst: it.text }];
					for (const a of alts) {
						entries.push({ seksjon: sec.title, ledd: it.heading, alt_label: a.alt_label, tekst: a.tekst });
					}
				}
			}
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

function safeNavn(n) {
	return (n || 'mal').replace(/[\\/:*?"<>|]+/g, '').trim() || 'mal';
}

function autoMarkMigrate(it) {
	// samme migrering som store autoMark — rolleprefikser → {{r}}-markører
	it.text = (it.text ?? '').replace(/^((?:L|ML|M|A|KA|K|L\/ML|ML\/L|L\/M|KA\/L))(\s*\|)/gm, '{{r}}$1$2{{/r}}');
	it.instr = (it.instr ?? '').replace(/^((?:L|ML|M|A|KA|K|L\/ML|ML\/L|L\/M|KA\/L))(\s*\|)/gm, '{{r}}$1$2{{/r}}');
	if (it.alts) for (const a of it.alts) a.text = (a.text ?? '').replace(/^((?:L|ML|M|A|KA|K|L\/ML|ML\/L|L\/M|KA\/L))(\s*\|)/gm, '{{r}}$1$2{{/r}}');
}

/** Lagre en kopi av det åpne objektet som lokal mal (fil på disk). */
export async function saveAsTemplateOnDisk(name) {
	const o = app.current;
	if (!o) return;
	const t = {
		id: uid(), kind: 'template', name: name || o.name,
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