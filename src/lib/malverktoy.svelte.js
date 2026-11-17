// Felles logikk for Malverktøy (dev): åpne originalmaler for redigering og
// lagre dem tilbake til prosjektet (src/lib/data.js + seed-filer).
// Brukes av både Malverktøy-visningen og dokumentpanelet (DokInsp).
import { BUILTIN_TEMPLATES } from '$lib/data.js';
import { app, registrerÅpenMal, malEntryFor } from '$lib/store.svelte.js';
import { toast } from 'svelte-sonner';

// safeNavn er duplisert her (ikke importert fra fileio) for å unngå
// import-sirkel malverktoy ↔ fileio — Rollup duplicerer da store-modulen,
// og appen ender med to ulike state-instanser.
function safeNavn(n) {
	return (n || 'mal').replace(/[\\/:*?"<>|]+/g, '').trim() || 'mal';
}

const HELPER_FELTER = ['__devMal', '__devId', '__devKey', '__dirty', '__åpenMalId', 'filePath', 'kind'];

/** Åpne en arbeidskopi av en originalmal (BUILTIN) i editoren. */
export function åpneOriginal(bt) {
	const data = JSON.parse(JSON.stringify(bt));
	// Svelte 5 kaster props_invalid_value når EditableText får bind:value=undefined
	// (value = $bindable('')) — disk-seedene har «text: ""» på alle ledd; data.js har
	// det ikke på alle (f.eks. salme-ledd). Normaliser bare det editoren binder på
	// (formEtter fjerner tomme tilleggsfelter ved lagring, så data.js-formen bevares).
	for (const sec of data.sections) {
		for (const it of sec.items) {
			if (it.text === undefined) it.text = '';
			for (const a of it.alts ?? []) { if (a.label === undefined) a.label = ''; if (a.text === undefined) a.text = ''; }
			for (const a of it.introAlts ?? []) { if (a.label === undefined) a.label = ''; if (a.text === undefined) a.text = ''; }
			for (const a of it.avslutningAlts ?? []) { if (a.label === undefined) a.label = ''; if (a.text === undefined) a.text = ''; }
		}
	}
	data.__devMal = true;
	data.__devId = bt.id;          // hvilken data.js-entry denne kopien redigerer
	data.__devKey = bt.builtinKey ?? null; // originalens builtinKey (til seed-fil)
	data.kind = 'template';
	delete data.builtinKey; // unngå kollisjon med disk-malen i store-oppdateringer
	registrerÅpenMal(data, true);
	app.visning = 'hjem';
	app.dirty = false;
	toast.info('Rediger malen, og velg «Lagre til prosjektet» når du er ferdig.');
}

/** Fjerner felter lagt til under redigering: tomme strenger («text: ""» fra
 *  normaliseringen) som originalen ikke hadde, rekursivt. Nytt innhold i
 *  felter som finnes i originalen (eller reelt nye, ikke-tomme felter) beholdes. */
function formEtter(ny, orig) {
	if (Array.isArray(ny)) {
		return ny.map((v, i) => formEtter(v, Array.isArray(orig) ? orig[Math.min(i, orig.length - 1)] : undefined));
	}
	if (ny && typeof ny === 'object') {
		const okeys = orig && typeof orig === 'object' && !Array.isArray(orig) ? orig : {};
		const ut = {};
		for (const [k, v] of Object.entries(ny)) {
			if (!(k in okeys) && v === '') continue; // tom tilleggsfelt fra normaliseringen
			ut[k] = formEtter(v, okeys[k]);
		}
		return ut;
	}
	return ny;
}

/** Bygg mal-objektet for data.js: samme felternes rekkefølge og mengde som
 *  originalen, med de redigerte verdiene — ingen helper-felter blir med. */
function malForDataJs(orig, redigert) {
	const kopi = JSON.parse(JSON.stringify(redigert));
	for (const k of HELPER_FELTER) delete kopi[k];
	return formEtter(kopi, orig);
}

/** Lagre åpen dev-mal tilbake til src/lib/data.js + seed-filen på disk. */
export async function lagreTilProsjekt() {
	const o = app.current;
	if (!o?.__devMal) { toast.error('Ingen dev-mal er åpen'); return false; }
	const orig = BUILTIN_TEMPLATES.find((bt) => bt.id === o.__devId || bt.id === o.id || bt.name === o.name);
	if (!orig) { toast.error('Fant ikke originalmalen i data.js'); return false; }
	const mal = malForDataJs(orig, o);
	// seed-filen skrives fra den redigerte kopien (beholder normaliserte
	// tomme felter, slik som dagens seed-format: text/instr som «""»)
	const seed = JSON.parse(JSON.stringify(o));
	for (const k of HELPER_FELTER) delete seed[k];
	// 1) data.js
	const r = await window.liturgi.lagreDataJs(mal);
	if (!r?.ok) { toast.error(r?.error ?? 'Klarte ikke lagre til data.js'); return false; }
	// 2) seed-filen (~/.config/Liturgi/maler/originaler|brukermaler/<navn>.liturgi)
	let seedMelding = 'Ingen seed-fil (kjører ikke i Electron)';
	if (window.liturgi?.listTemplates) {
		const list = await window.liturgi.listTemplates();
		if (list?.ok) {
			const sub = /hovedgudstjeneste|gravferd/i.test(seed.name) ? 'originaler' : 'brukermaler';
			if (o.__devKey && !seed.builtinKey) seed.builtinKey = o.__devKey;
			const sti = `${list.dirs[sub]}/${safeNavn(seed.name)}.liturgi`;
			const w = await window.liturgi.writeTemplate(sti, JSON.stringify({ liturgiFormat: 1, kind: 'template', data: seed }, null, '\t'));
			seedMelding = w?.ok ? 'seed-fil oppdatert' : 'seed-fil FEILET: ' + (w?.error ?? '?');
		}
	}
	o.__dirty = false;
	app.dirty = false;
	const e = malEntryFor(o);
	if (e) e.dirty = false;
	toast.success('data.js oppdatert · ' + seedMelding);
	return true;
}
