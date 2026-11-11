import { BUILTIN_TEMPLATES } from './data.js';

const LS_KEY = 'liturgi-store-v1';
const THEME_KEY = 'liturgi-theme';

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
	modal: null
});

/** Sett tema på <html> og lagre valget. */
export function setTheme(t) {
	app.theme = t;
	document.documentElement.dataset.theme = t;
	localStorage.setItem(THEME_KEY, t);
}

export function initTheme() {
	const saved = localStorage.getItem(THEME_KEY);
	const t = saved ?? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
	setTheme(t);
}

export function toggleTheme() {
	setTheme(app.theme === 'dark' ? 'light' : 'dark');
}

/* ---------- instansiering ---------- */

export function instantiate(it) {
	return {
		id: uid(), tplId: it.id ?? null, type: it.type ?? 'tekst',
		heading: it.heading ?? '', optional: !!it.optional,
		text: autoMark(it.text ?? ''), instr: autoMark(it.instr ?? ''),
		alts: (it.alts ?? []).map((a) => ({ label: a.label ?? '', text: autoMark(a.text ?? '') })),
		selAlt: it.selAlt ?? ((it.alts ?? []).length ? 0 : null), enabled: true,
		salmeNr: '', salmeTittel: '',
		role: it.role ?? ''
	};
}

/* konverter automatiske rolleprefikser (L |, ML | …) til eksplisitte {{r}}-markører */
export function autoMark(t) {
	return (t ?? '').replace(/^((?:L|ML|M|A|KA|K|L\/ML|ML\/L|L\/M|KA\/L))(\s*\|)/gm, '{{r}}$1$2{{/r}}');
}

function migrateItem(it) {
	it.text = autoMark(it.text);
	it.instr = autoMark(it.instr);
	if (it.alts) for (const a of it.alts) a.text = autoMark(a.text);
}

export function newServiceFromTemplate(tpl, include) {
	return {
		id: uid(), kind: 'service', templateId: tpl.id, templateName: tpl.name,
		name: tpl.name, date: '',
		sections: tpl.sections
			.filter((sec) => includeSection(sec.title, include))
			.map((sec) => ({ title: sec.title, items: sec.items.map(instantiate) }))
	};
}

/* Dåp og Nattverd kan slås av ved oppretting */
export function includeSection(title, include) {
	if (title === 'Dåp' && include && include.dåp === false) return false;
	if (/nattverd/i.test(title) && include && include.nattverd === false) return false;
	return true;
}

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
		svc.sections.splice(at, 0, { title: tsec.title, items: tsec.items.map(instantiate) });
	}
}

export function newBlankTemplate(name) {
	return {
		id: uid(), kind: 'template', name,
		sections: [{ title: 'I. Samling', items: [] }]
	};
}

/* ---------- lagring ---------- */

export function loadStore() {
	try {
		const raw = localStorage.getItem(LS_KEY);
		if (raw) {
			const s = JSON.parse(raw);
			app.templates = s.templates ?? [];
			app.services = s.services ?? [];
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
			for (const sec of copy.sections) for (const it of sec.items) migrateItem(it);
			app.templates.push(copy);
		} else if (JSON.stringify(stored.sections) !== JSON.stringify(bt.sections)) {
			// innebygd mal er oppdatert – erstatt strukturen (navn og egne maler røres ikke)
			stored.sections = JSON.parse(JSON.stringify(bt.sections));
		}
	}
	// migrer eksisterende brukerdata til eksplisitte rollemarkører
	for (const t of app.templates) for (const sec of t.sections) for (const it of sec.items) migrateItem(it);
	for (const s of app.services) for (const sec of s.sections) for (const it of sec.items) migrateItem(it);
	persist();
}

export function persist() {
	localStorage.setItem(
		LS_KEY,
		JSON.stringify({ templates: app.templates, services: app.services })
	);
	app.dirty = false;
}

export function markDirty() {
	app.dirty = true;
}

/* ---------- CRUD ---------- */

export function openService(id) {
	const s = app.services.find((x) => x.id === id);
	if (!s) return;
	app.current = s;
	app.kind = 'service';
}

export function openTemplate(id) {
	const t = app.templates.find((x) => x.id === id);
	if (!t) return;
	app.current = t;
	app.kind = 'template';
}

export function closeEditor() {
	app.current = null;
	app.kind = null;
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
		sections: JSON.parse(JSON.stringify(app.current.sections)).map((sec) => ({
			title: sec.title,
			items: sec.items.map((x) => ({
				id: x.tplId ?? x.id, type: x.type, heading: x.heading, optional: x.optional,
				text: x.text, instr: x.instr, alts: x.alts, selAlt: x.selAlt, role: x.role ?? ''
			}))
		}))
	};
	app.templates.push(t);
	persist();
}

export function createService(name, date, tplId, include, kirkeaar, tekster) {
	const tpl = app.templates.find((t) => t.id === tplId);
	if (!tpl) return null;
	const s = newServiceFromTemplate(tpl, include);
	s.name = name || tpl.name;
	s.date = date;
	applyKirkeaar(s, kirkeaar, tekster);
	app.services.push(s);
	persist();
	openService(s.id);
	return s;
}

/** Gi bønnen fra kirkeåret rollemerker: L | foran, M | på avsluttende Amen. */
function formaterBønn(prayer) {
	const lines = (prayer || '').split('\n').map((s) => s.trim()).filter(Boolean);
	if (!lines.length) return '';
	lines[0] = 'L | ' + lines[0];
	const last = lines.length - 1;
	if (last > 0 && /^amen\.?$/i.test(lines[last])) lines[last] = 'M | ' + lines[last];
	return lines.join('\n');
}

/** Fyll inn dagens bønn og bibeltekster fra kirkeåret i en ny gudstjeneste. */
export function applyKirkeaar(svc, k, tekster) {
	if (!k) return;
	svc.kirkeaar = { name: k.name, color: k.color, periodInfo: k.periodInfo, series: k.series };
	for (const sec of svc.sections) {
		for (const it of sec.items) {
			const h = (it.heading || '').toLowerCase();
			if (h.includes('dagens bønn') && k.prayer) {
				const bønn = 'L | La oss alle be.\n' + formaterBønn(k.prayer);
				if (it.text?.includes('[Dagens bønn]')) {
					const innhold = formaterBønn(k.prayer);
					it.text = it.text.replace('[Dagens bønn]', innhold);
					// unngå dobbel avsluttende Amen fra malen
					if (/amen\.?$/i.test(innhold)) it.text = it.text.replace(/\n*M \| Amen\.\s*$/, '');
				} else if ((it.alts ?? []).length) {
					// lokal(e) alternativ(er) beholdes – kirkeårsbønnen skjøtes inn forrest
					if (!it.alts.some((a) => a.label === 'Dagens bønn (kirkeåret)')) {
						it.alts.unshift({ label: 'Dagens bønn (kirkeåret)', text: bønn });
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
			} else if (h.includes('første lesning') && k.L1) {
				fyllLesning(it, k.L1, tekster?.L1);
				it.instr = (it.instr ? it.instr + ' ' : '') + 'Tekstrekke ' + k.series;
			} else if (h.includes('andre lesning') && k.L2) {
				fyllLesning(it, k.L2, tekster?.L2);
			} else if (h.includes('evangelium') && k.E) {
				fyllLesning(it, k.E, tekster?.E, true);
			}
		}
	}
}

/** Fyll en lesning med referanse og (hvis hentet) selve teksten fra bibel.no. */
function fyllLesning(it, ref, tekst, evangelium = false) {
	if (tekst) {
		const innhold = (tekst.title ? tekst.title + '\n' : '') + tekst.text;
		if (it.text?.includes(evangelium ? '[Evangelietekst]' : '[Lesningstekst]')) {
			it.text = it.text
				.replace(evangelium ? '[Evangelietekst]' : '[Lesningstekst]', innhold)
				.replace('…', tekst.ref);
		} else {
			it.text = innhold;
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
