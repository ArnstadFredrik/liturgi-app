// Felles logikk for Malverktøy (dev): åpne originalmaler for redigering og
// lagre dem tilbake til prosjektet (src/lib/data.js + seed-filer).
// Brukes av både Malverktøy-visningen og dokumentpanelet (DokInsp).
import { BUILTIN_TEMPLATES } from '$lib/data.js';
import { app, registrerÅpenMal, malEntryFor, syncDirty } from '$lib/store.svelte.js';
import { toast } from 'svelte-sonner';

// safeNavn er duplisert her (ikke importert fra fileio) for å unngå
// import-sirkel malverktoy ↔ fileio — Rollup duplicerer da store-modulen,
// og appen ender med to ulike state-instanser.
function safeNavn(n) {
	return (n || 'mal').replace(/[\\/:*?"<>|]+/g, '').trim() || 'mal';
}

const HELPER_FELTER = ['__devMal', '__devId', '__devKey', '__dirty', '__åpenMalId', 'filePath', 'kind'];

/** Åpne en arbeidskopi av en originalmal (BUILTIN) i editoren. */
export async function åpneOriginal(bt) {
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
	// Dåpsdelen i HG-ordningen er LINKET til «Dåp i hovedgudstjenesten»-malen
	// (samme ledd-id-er h-l-dap*) — innholdet kan ikke redigeres her. Kollapse
	// seksjonen til ett markeringsledd; lenke-synken bygger innholdet ved lagring.
	if (bt.id === 'hovedgudstjeneste2020') {
		const dopMal = BUILTIN_TEMPLATES.find((t) => t.id === 'dop-i-hovedgudstjenesten-2017');
		if (dopMal) {
			const dapSec = data.sections.find((s) => s.__lenket);
			if (dapSec) {
				// frøet har tom __lenket-seksjon (punkt 3): full struktur kommer fra dåp-malen
				const full = JSON.parse(JSON.stringify(dapSec));
				full.items = JSON.parse(JSON.stringify(dopMal.sections.flatMap((ds) => ds.items)));
				data.__dapSeksjon = full;
				dapSec.items = [{
					id: 'h-l-dap-lenke', type: 'tekst',
					heading: 'Dåp (lenket til «Dåp i hovedgudstjenesten» — kan ikke redigeres her)',
					text: '', alts: [], selAlt: 0, enabled: true, optional: false,
					__lenket: true
				}];
			}
		}
	}
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

/** Åpne et utkast fra ~/.config/Liturgi/malutkast som dev-mal i editoren. */
export async function åpneUtkast(fil) {
	const r = await window.liturgi.devLesUtkast(fil);
	if (!r?.ok) { toast.error(r?.error ?? 'Klarte ikke lese utkastet'); return; }
	const bt = r.mal;
	// samme normalisering som åpneOriginal
	for (const sec of bt.sections ?? []) {
		for (const it of sec.items ?? []) {
			if (it.text === undefined) it.text = '';
			for (const a of it.alts ?? []) { if (a.label === undefined) a.label = ''; if (a.text === undefined) a.text = ''; }
			for (const a of it.introAlts ?? []) { if (a.label === undefined) a.label = ''; if (a.text === undefined) a.text = ''; }
			for (const a of it.avslutningAlts ?? []) { if (a.label === undefined) a.label = ''; if (a.text === undefined) a.text = ''; }
		}
	}
	bt.__devMal = true;
	bt.__devId = bt.id;
	bt.__devKey = bt.builtinKey ?? null;
	bt.kind = 'template';
	delete bt.builtinKey;
	// Valgt-indeksene kan peke utenfor rekkevidden i utkast (f.eks. etter
	// sletting i adminAlts) — klem dem inn, ellers krasjer Item-renderen.
	for (const sec of bt.sections ?? []) {
		for (const it of sec.items ?? []) {
			for (const [liste, nokkel] of [['alts', 'selAlt'], ['introAlts', 'selIntro'], ['avslutningAlts', 'selAvsl']]) {
				const l = it[liste];
				if (Array.isArray(l) && l.length) {
					if (typeof it[nokkel] !== 'number' || it[nokkel] >= l.length) it[nokkel] = 0;
				}
			}
		}
	}
	registrerÅpenMal(bt, true);
	app.visning = 'hjem';
	app.dirty = false;
	toast.info('Utkast åpnet — rediger og velg «Lagre til prosjektet».');
}

/** Slett et utkast. */
export async function slettUtkast(fil) {
	const r = await window.liturgi.slettUtkast(fil);
	if (r?.ok) toast.success('Utkastet er slettet');
	else toast.error(r?.error ?? 'Klarte ikke slette utkastet');
	return r?.ok ?? false;
}

/** Lagre åpen dev-mal tilbake til src/lib/data.js + seed-filen på disk. */
export async function lagreTilProsjekt() {
	const o = app.current;
	if (!o?.__devMal) { toast.error('Ingen dev-mal er åpen'); return false; }
	const orig = BUILTIN_TEMPLATES.find((bt) => bt.id === o.__devId || bt.id === o.id || bt.name === o.name);
	if (!orig) { toast.error('Fant ikke originalmalen i data.js'); return false; }
	// Dåp-seksjonen (lenket) settes tilbake før sammenligningen/skrivingen
	if (o.__dapSeksjon) {
		const dapSec = o.sections.find((s) => s.items.some((i) => i.id === 'h-l-dap-lenke'));
		if (dapSec) {
			dapSec.items = JSON.parse(JSON.stringify(o.__dapSeksjon.items));
			delete o.__dapSeksjon;
		}
	}
	const mal = malForDataJs(orig, o);
	// seed-filen skrives fra den redigerte kopien (beholder normaliserte
	// tomme felter, slik som dagens seed-format: text/instr som «""»)
	const seed = JSON.parse(JSON.stringify(o));
	for (const k of HELPER_FELTER) delete seed[k];
	// 1) data.js
	const r = await window.liturgi.lagreDataJs(mal);
	if (!r?.ok) {
		toast.error((r?.error ?? 'Klarte ikke lagre til data.js') + (r?.utkast ? ' — utkast lagret i ~/.config/Liturgi/malutkast' : ''));
		return false;
	}
	// 2) seed-filen (~/.config/Liturgi/maler/originaler|brukermaler/<navn>.liturgi)
	let seedMelding = 'Ingen seed-fil (kjører ikke i Electron)';
	if (window.liturgi?.listTemplates) {
		const list = await window.liturgi.listTemplates();
		if (list?.ok) {
			const sub = (seed.erOriginal || /hovedgudstjeneste|gravferd/i.test(seed.name)) ? 'originaler' : 'brukermaler';
			if (o.__devKey && !seed.builtinKey) seed.builtinKey = o.__devKey;
			// gjenbruk eksisterende seed-sti for samme navn — en hardkodet .liturgi
			// ved siden av en eksisterende .limal ga TO filer med samme navn/id
			// → duplikat-nøkkel i Maler-listen → Svelte-krasj (frys)
			const eksisterende = [...(list.originaler ?? []), ...(list.brukermaler ?? [])]
				.find((x) => x.name === seed.name);
			const sti = eksisterende?.path ?? `${list.dirs[sub]}/${safeNavn(seed.name)}.liturgi`;
			const w = await window.liturgi.writeTemplate(sti, JSON.stringify({ liturgiFormat: 1, kind: 'template', data: seed }, null, '	'));
			seedMelding = w?.ok ? 'seed-fil oppdatert' : 'seed-fil FEILET: ' + (w?.error ?? '?');
		}
	}
	o.__dirty = false;
	app.dirty = false;
	const e = malEntryFor(o);
	if (e) e.dirty = false;
	syncDirty();
	// EditableText-flush etter lagringen kan sette dirty igjen (markDirty på
	// siste input-event) — slukk den i et tick så ikke «ulagrede endringer»
	// dukker opp rett etter vellykket lagring
	setTimeout(() => {
		o.__dirty = false;
		app.dirty = false;
		const e2 = malEntryFor(o);
		if (e2) e2.dirty = false;
		syncDirty();
	}, 60);
	toast.success('data.js oppdatert · ' + seedMelding);
	return true;
}
