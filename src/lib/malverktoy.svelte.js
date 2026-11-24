// Felles logikk for Malverktøy (dev): åpne originalmaler for redigering og
// lagre dem tilbake til prosjektet (src/lib/data.js + seed-filer).
// Brukes av både Malverktøy-visningen og dokumentpanelet (DokInsp).
import { BUILTIN_TEMPLATES } from '$lib/data.js';
import { app, registrerÅpenMal, malEntryFor, syncDirty } from '$lib/store.svelte.js';
import { avbrytAutolagre } from '$lib/fileio.svelte.js';
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
				// generisk lenkeformat: fullt innhold fra dåp-malen + __lenket-objekt;
				// synkLenkedeSeksjoner fornyer innholdet, editor låser redigering
				dapSec.__lenket = { malId: dopMal.id, tittel: "Dåp i hovedgudstjenesten" };
				if (!(dapSec.items ?? []).length) {
					dapSec.items = JSON.parse(JSON.stringify(dopMal.sections.flatMap((ds) => ds.items)));
				}
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

/** Lagre wip-statusendringen for en dev-mal umiddelbart: filen på disk
 *  (wip bor i malen) + seeden i data.js for originaler med seed. Uten dette
 *  reverterer bryteren ved omstart, og seed-regenereringen kan gjenopprette
 *  gammel status. */
export async function lagreWipStatus(mal) {
	if (!mal?.__devMal || !mal.filePath) return;
	const data = JSON.parse(JSON.stringify(mal));
	for (const k of ['filePath', 'kind', 'builtinKey', '__devMal', '__devId', '__devKey']) delete data[k];
	const w = await window.liturgi.writeTemplate(mal.filePath, JSON.stringify({ liturgiFormat: 1, kind: 'template', data }, null, '\t'));
	if (!w?.ok) { toast.error('Klarte ikke lagre wip-statusen til filen'); return; }
	// originalmaler med seed i data.js: seeden må følge med, ellers
	// regenererer oppstartssjekken filen med gammel status
	if (BUILTIN_TEMPLATES.some((bt) => bt.id === (mal.__devId ?? mal.id))) {
		const r = await window.liturgi.lagreDataJs(data).catch(() => null);
		if (r && r.ok === false) {
			toast.error((r.error ?? 'Klarte ikke lagre seeden') + (r.utkast ? ' — utkast lagret i ~/.config/Liturgi/malutkast' : ''));
			return;
		}
	}
	toast.success('WIP-statusen er lagret');
}

/** Bekreft en WIP/utkast-mal: wip-flagget fjernes i malen og lagres til filen
 *  (originaler i dev, brukermaler fra biblioteket). Ingen db-nøkkel —
 *  wip-statusen bor i malen selv. */
export async function bekreftWipMal(t) {
	const { confirmBox } = await import('$lib/modal.svelte.js');
	confirmBox('Bekreft wip-mal', `Bekrefte «${t.name}» som ferdig kontrollert? Wip-statusen fjernes og malen lagres tilbake til prosjektet.`, async () => {
		t.wip = false;
		if (t.filePath) {
			const data = JSON.parse(JSON.stringify(t));
			for (const k of ['filePath', 'kind', 'builtinKey', '__devMal', '__devId', '__devKey']) delete data[k];
			await window.liturgi.writeTemplate(t.filePath, JSON.stringify({ liturgiFormat: 1, kind: 'template', data }, null, '\t'));
			// originalmaler har seed i src/lib/data.js — wip-fjerningen må inn i
			// seeden også, ellers regenererer oppstartssjekken filen med wip tilbake
			const r = await window.liturgi.lagreDataJs(data).catch(() => null);
			if (r && r.ok === false) {
				toast.error((r.error ?? 'Klarte ikke lagre seeden') + (r.utkast ? ' — utkast lagret i ~/.config/Liturgi/malutkast' : ''));
				return;
			}
		}
		toast.success('«' + t.name + '» er bekreftet og lagret til prosjektet — nå med i Opprett');
	}, 'Bekreft');
}

/** Åpne malen som LÅST forhåndsvisning: klikk og redigering er deaktivert.
 *  DokInsp viser en «Rediger seed»-knapp som åpner redigeringsmodus. */
export function åpneForhåndsvisning(t) {
	const kopi = JSON.parse(JSON.stringify(t));
	kopi.__låst = true;
	kopi.__devId = t.id; // DokInsp bruker den for å finne seeden til «Rediger seed»
	kopi.kind = 'template';
	registrerÅpenMal(kopi, false);
	app.visning = 'hjem';
	app.dirty = false;
}

/** Rediger seed fra en låst forhåndsvisning: finn seeden på __devId
 *  og åpne redigeringsmodus. Feiler tydelig hvis seeden mangler. */
export function redigerSeedForhåndsvisning(o) {
	if (!o?.__devId) { toast.error('Ingen seed-kobling funnet for «' + (o?.name ?? '?') + '»'); return; }
	const bt = BUILTIN_TEMPLATES.find((b) => b.id === o.__devId);
	if (!bt) { toast.error('Fant ikke seeden for «' + (o.name ?? '?') + '»'); return; }
	åpneOriginal(bt);
}

/** Slett en originalmal FRA PROSJEKTET: seed-entry i data.js + seed-fil på disk.
 *  Filen flyttes til papirkurven av handleren; bekreftelse kreves først. */
export async function slettMalFraProsjektet(t) {
	const { confirmBox } = await import('$lib/modal.svelte.js');
	confirmBox('Slett mal fra prosjektet', `Slette «${t.name}» fra prosjektet? Seed-entryen i data.js og seed-filen på disk fjernes (filen flyttes til papirkurven).`, async () => {
		const r = await window.liturgi.slettSeed(t.id, t.name);
		if (r?.ok) {
			app.templates = app.templates.filter((x) => x.id !== t.id);
			toast.success('«' + t.name + '» er slettet fra prosjektet' + (r.filSlettet ? ' (filen ligger i papirkurven)' : ' (ingen fil på disk)'));
			if (app.current?.id === t.id) { app.current = null; app.kind = null; app.visning = 'malverktoy'; }
		} else {
			toast.error(r?.error ?? 'Klarte ikke slette seeden');
		}
	}, 'Slett');
}

/** Lagre åpen dev-mal tilbake til src/lib/data.js + seed-filen på disk. */
export async function lagreTilProsjekt() {
	const o = app.current;
	if (!o?.__devMal) { toast.error('Ingen dev-mal er åpen'); return false; }
	const orig = BUILTIN_TEMPLATES.find((bt) => bt.id === o.__devId || bt.id === o.id || bt.name === o.name);
	// NY SEED: wip-mal som ikke finnes i data.js fra før — 'Lagre til
	// prosjektet' legger den inn som nytt entry (wip-flagget beholdes, så
	// malen forblir uverifisert i prod til den bekreftes og flagget fjernes).
	const mal = orig ? malForDataJs(orig, o) : (() => {
		const kopi = JSON.parse(JSON.stringify(o));
		for (const k of HELPER_FELTER) delete kopi[k];
		delete kopi.builtinKey;
		return kopi;
	})();
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
	toast.success((r?.nySeed ? 'Ny seed lagt til i data.js · start appen på nytt for å se den i seed-listen · ' : 'data.js oppdatert · ') + seedMelding);
	// autolagringsutkastet er nå eldre enn prosjektlagringen — rydd det bort
	avbrytAutolagre();
	try {
		for (const id of [o.__devId, o.id]) {
			if (!id) continue;
			const fil = 'auto-' + String(id).replace(/[^a-zA-Z0-9_-]/g, '_') + '.json';
			await window.liturgi?.slettUtkast?.(fil);
		}
	} catch { }
	return true;
}
