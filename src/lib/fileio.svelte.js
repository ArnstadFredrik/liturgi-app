import { app, persist, uid, openService, openTemplate, closeEditor } from './store.svelte.js';
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

/** Åpne en gudstjenestefil fra disken. */
export async function openServiceFile(p) {
	try {
		if (app.dirty && !confirm('Du har ulagrede endringer. Åpne likevel?')) return;
		const r = await window.liturgi.readService(p);
		if (!r.ok) { toast.error('Klarte ikke åpne: ' + (r.error ?? 'ukjent feil')); return; }
		const data = parseLiturgi(r.json);
		if (!data) { toast.error('Filen ser ikke ut som en liturgi-fil'); return; }
		data.filePath = p;
		app.current = data;
		app.kind = 'service';
		app.dirty = false;
		await touchRecent(data);
		await refreshRecentServices();
	} catch (err) {
		toast.error('Klarte ikke åpne: ' + (err?.message ?? err));
	}
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

/** Lytt etter .liturgi-filer åpnet fra Finder (kun Electron). */
export function listenForFinderOpen() {
	if (!isElectron) return;
	window.liturgi.onOpenFile(async (json) => {
		if (app.dirty && !confirm('Du har ulagrede endringer. Åpne filen likevel?')) return;
		//Importer: kopier filen inn i tjenestemappen og åpne den derfra
		const r = await window.liturgi.importService(json);
		if (r.ok) {
			await openServiceFile(r.filePath);
			toast.success('Åpnet: ' + r.filePath.split('/').pop());
		} else {
			toast.error('Klarte ikke åpne: ' + (r.error ?? 'ukjent feil'));
		}
	});
}

/** Åpne via dialog («Åpne fil …»). */
export async function openFileToStore() {
	let json, path = null;
	if (isElectron) {
		const r = await window.liturgi.openFile();
		if (!r.ok) {
			if (!r.canceled) toast.error('Klarte ikke åpne: ' + (r.error ?? 'ukjent feil'));
			return;
		}
		json = r.json;
		path = r.filePath;
	} else {
		json = await pickFileBrowser();
		if (json == null) return;
	}
	if (app.dirty && !confirm('Du har ulagrede endringer. Åpne likevel?')) return;
	const data = parseLiturgi(json);
	if (!data) { toast.error('Filen ser ikke ut som en liturgi-fil'); return; }
	if (isElectron) {
		// kopier inn i tjenestemappen så den blir en vanlig app-fil
		const r = await window.liturgi.importService(json);
		if (!r.ok) { toast.error('Klarte ikke åpne: ' + (r.error ?? 'ukjent feil')); return; }
		await openServiceFile(r.filePath);
	} else {
		importJsonIntoStore(data);
	}
	if (data.kind !== 'template') toast.success('Åpnet «' + (data.name ?? 'gudstjeneste') + '»');
}

/** Filvelger for nettleser-versjonen. */
function pickFileBrowser() {
	return new Promise((resolve) => {
		const inp = document.createElement('input');
		inp.type = 'file';
		inp.accept = '.liturgi,.json,application/json';
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

/** Last lokale maler fra disk (og migrer gamle fra localStorage ved første oppstart). */
export async function loadTemplatesFromDisk() {
	if (!isElectron) return;
	try {
		// 1) migrer lokale maler fra localStorage til maler-mappen (én gang)
		const { pendingLocalTemplates } = await import('./store.svelte.js');
		if (pendingLocalTemplates?.length) {
			for (const t of pendingLocalTemplates) {
				const json = JSON.stringify({ liturgiFormat: 1, kind: 'template', data: t }, null, '	');
				const safe = (t.name || 'mal').replace(/[\\/:*?"<>|]+/g, '').trim() || 'mal';
				let p = null, n = 2;
				// finn et ledig filnavn
				const list = await window.liturgi.listTemplates();
				const taken = new Set((list.ok ? list.list : []).map((x) => x.path));
				p = `${list.dir}/${safe}.liturgi`;
				while (taken.has(p)) { p = `${list.dir}/${safe} (${n}).liturgi`; n++; }
				await window.liturgi.writeTemplate(p, json);
			}
			pendingLocalTemplates.length = 0;
		}
		// 2) les alle maler fra disk
		const r = await window.liturgi.listTemplates();
		if (!r.ok) return;
		const disk = [];
		for (const meta of r.list) {
			const rd = await window.liturgi.readTemplate(meta.path);
			if (!rd.ok) continue;
			const data = parseLiturgi(rd.json);
			if (!data) continue;
			data.filePath = meta.path;
			if (data.kind !== 'template') data.kind = 'template';
			disk.push(data);
		}
		// behold de innebygde, erstatt lokale med diskversjonene
		const builtinNames = new Set(app.templates.filter((t) => !t.filePath && !t.id?.startsWith('i')).map((t) => t.name));
		const builtins = app.templates.filter((t) => t.builtinKey || builtinNames.has(t.name));
		app.templates = [...builtins, ...disk];
	} catch (err) {
		toast.error('Klarte ikke lese malene: ' + (err?.message ?? err));
	}
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
		const safe = (t.name || 'mal').replace(/[\\/:*?"<>|]+/g, '').trim() || 'mal';
		const taken = new Set((list.ok ? list.list : []).map((x) => x.path));
		let p = `${list.dir}/${safe}.liturgi`, n = 2;
		while (taken.has(p)) { p = `${list.dir}/${safe} (${n}).liturgi`; n++; }
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
		const safe = (t.name || 'mal').replace(/[\\/:*?"<>|]+/g, '').trim() || 'mal';
		const taken = new Set((list.ok ? list.list : []).map((x) => x.path));
		let p = `${list.dir}/${safe}.liturgi`, n = 2;
		while (taken.has(p)) { p = `${list.dir}/${safe} (${n}).liturgi`; n++; }
		const r = await window.liturgi.writeTemplate(p, JSON.stringify({ liturgiFormat: 1, kind: 'template', data: t }, null, '\t'));
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
