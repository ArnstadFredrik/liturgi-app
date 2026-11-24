// Salmedatabasen (gudstjeneste.no) – henting av salmetekster.
//
// Flyt: login (POST doLogin) → abonnement (doSetSubscription) → søk
// (doAdvSearchMediatJson, JSON) → legg i kurv (doAddItemListToCart) →
// registrering (doRegisterItems med arrangement-navn + dato) → generert
// tekstfil (<mediaid>.txt) med hele salmeteksten.
//
// Innlogging lagres kryptert i settings-tabellen (Electron safeStorage).
// IPC: salme:lagre-login, salme:status, salme:test-login, salme:hent
const { app, safeStorage, ipcMain } = require('electron');
const { dbGet, dbSet } = require('./db.cjs');

const BASE = 'https://gudstjeneste.no/';
const PUB_NOS13 = '8'; // Norsk Salmebok 2013

let cookieJar = new Map(); // navn → verdi (CFID/CFTOKEN m.m.)
let innloggetTid = 0;

function lagreCookies(res) {
	try {
		for (const c of res.headers.getSetCookie()) {
			const pair = c.split(';')[0];
			const i = pair.indexOf('=');
			if (i > 0) cookieJar.set(pair.slice(0, i).trim(), pair.slice(i + 1).trim());
		}
	} catch { /* ingen cookies */ }
}

function cookieHeader() {
	return [...cookieJar.entries()].map(([k, v]) => k + '=' + v).join('; ');
}

async function hent(sti, opts = {}) {
	const res = await fetch(BASE + sti.replace(/^\//, ''), {
		...opts,
		headers: {
			cookie: cookieHeader(),
			referer: BASE + 'index.cfm/medialib/',
			'User-Agent': 'Liturgi-app/1.0',
			...(opts.headers || {})
		},
		redirect: 'follow'
	});
	lagreCookies(res);
	return res;
}

function erInnloggetSide(html) {
	// case-insensitivt: ved feil bruker/passord redirecter sidene til
	// dspLogin (stor L) — og viser innloggingsskjemaet med «Glemt passord?»
	const s = String(html || '').toLowerCase();
	return !s.includes('dsplogin')
		&& !s.includes('glemt passord')
		&& !s.includes('du må først logg inn');
}

/** POST doLogin + velg abonnement (første i listen). */
async function loggInn() {
	const login = dbGet('salmeLogin');
	if (!login?.user || !login?.passEnc) return { ok: false, error: 'Ikke konfigurert' };
	let pass = '';
	try {
		pass = safeStorage.decryptString(Buffer.from(login.passEnc, 'base64'));
	} catch {
		return { ok: false, error: 'Klarte ikke dekryptere passordet' };
	}
	cookieJar = new Map();
	// NB: redirect: 'manual' — cookies fra 302-redirecten (CFID/CFTOKEN) går ellers tapt
	const body = new URLSearchParams({ username: login.user, password: pass });
	let res = await fetch(BASE + 'index.cfm/users/doLogin/', {
		method: 'POST',
		redirect: 'manual',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'Liturgi-app/1.0' },
		body: body.toString()
	});
	lagreCookies(res);
	// følg redirects manuelt (sett-cookie på hvert steg)
	for (let i = 0; i < 6 && res.status >= 300 && res.status < 400; i++) {
		const lok = res.headers.get('location');
		if (!lok) break;
		res = await fetch(lok.startsWith('http') ? lok : BASE + lok.replace(/^\//, ''), {
			redirect: 'manual',
			headers: { cookie: cookieHeader(), 'User-Agent': 'Liturgi-app/1.0' }
		});
		lagreCookies(res);
	}
	const side = await res.text();
	if (!side.includes('dspSubsChoice') && !erInnloggetSide(side)) {
		return { ok: false, error: 'Feil brukernavn eller passord' };
	}
	// velg abonnement (første SubscriptionId i skjemaet)
	const sub = await hent('index.cfm/users/dspSubsChoice');
	const subSide = await sub.text();
	const m = subSide.match(/name="SubscriptionId"[^>]*>\s*<option[^>]*value="([^"]+)"/)
		|| subSide.match(/name="SubscriptionId"[^>]*value="([^"]+)"/);
	if (m) {
		const sett = await hent('index.cfm/users/doSetSubscription/', {
			method: 'POST',
			redirect: 'manual',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: 'SubscriptionId=' + encodeURIComponent(m[1])
		});
		lagreCookies(sett);
	}
	innloggetTid = Date.now();
	return { ok: true };
}

/** Sikre at vi har en gyldig sesjon; re-login hvis siden krever innlogging. */
async function sikreSesjon() {
	if (cookieJar.size === 0 || Date.now() - innloggetTid > 10 * 60 * 1000) {
		const r = await loggInn();
		if (!r.ok) return r;
	}
	return { ok: true };
}

async function hentMedReLogin(sti, opts = {}) {
	let res = await hent(sti, opts);
	let tekst = res.headers.get('content-type')?.includes('json') ? await res.text() : await res.text();
	if (!erInnloggetSide(tekst)) return { res, tekst };
	// sesjonen er utløpt → én re-login og prøv igjen
	const r = await loggInn();
	if (!r.ok) return { res, tekst, feil: r.error };
	res = await hent(sti, opts);
	tekst = await res.text();
	return { res, tekst };
}

/** Søk i salmedatabasen. q = { nr?, tittel? } → liste av treff. */
async function soek(q) {
	const p = new URLSearchParams({
		ajaxUrl: '1',
		SearchTxt: q.tittel || '',
		vmediaTypelist: '1',
		vpublicationlist: PUB_NOS13,
		vNos13Number: q.nr || '',
		vgenrelist: '', vchurchdayslist: '', vtagslist: '', vcolumnlist: '',
		vlanguagelist: '', vreadingList: '', vChurchTimeofYearlist: '', vbiblereflist: '',
		aAuthorList: '', aAuthorList2: '', ExTagList: ''
	});
	const { tekst } = await hentMedReLogin('index.cfm/medialib/doAdvSearchMediatJson/?' + p.toString());
	let j;
	try { j = JSON.parse(tekst); } catch {
		return { ok: false, error: 'Uventet svar fra salmedatabasen' };
	}
	const treff = [];
	for (let i = 0; i < (j.recordcount || 0); i++) {
		treff.push({
			mediaid: j.data.mediaid[i],
			title: j.data.title[i],
			title2: j.data.title2[i] || '',
			tekst: j.data.authornamet[i] || '',
			melodi: j.data.authornamem[i] || '',
			rettighet: j.data.authornamearr[i] || '',
			productno: j.data.productno[i] || ''
		});
	}
	return { ok: true, treff };
}

/** Velg best treff blant søkeresultatene (tittel-ord-overlap). */
function velgTreff(treff, q) {
	if (!treff.length) return null;
	if (!q.tittel) return treff[0];
	const ord = q.tittel.toLowerCase().split(/\s+/).filter(Boolean);
 let best = null, bestPoeng = -1;
	for (const t of treff) {
		const s = (t.title + ' ' + t.title2).toLowerCase();
		const poeng = ord.filter((o) => s.includes(o)).length;
		if (poeng > bestPoeng) { best = t; bestPoeng = poeng; }
	}
	return best;
}

/** ISO-dato (2026-11-23) → dd.mm.åååå (skjemaformat). */
function tilSkjemaDato(iso) {
	const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
	if (m) return `${m[3]}.${m[2]}.${m[1]}`;
	return iso || '';
}

/** Søk og velg best treff for én salme (nr først, tittel-fallback). */
async function soekOgVelg(q) {
	let soekRes = q.nr ? await soek({ nr: q.nr }) : { ok: true, treff: [] };
	if (!soekRes.ok) return soekRes;
	if (!soekRes.treff.length && q.tittel) soekRes = await soek({ tittel: q.tittel });
	if (!soekRes.treff.length) return { ok: false, error: 'Ingen treff i salmedatabasen' };
	return { ok: true, valgt: velgTreff(soekRes.treff, q) };
}

/** Legg ett verk i registreringskurven. NB: svaret er alltid tomt (forAjax) —
 *  suksess sjekkes mot registreringsskjemaet i registrerValgte. */
async function leggIKurv(mediaid) {
	const kurv = await hent('index.cfm/medialib/doAddItemListToCart/', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: `cbMediaId=${mediaid}&LanguageList=1&forAjax=true&MusicSheetTypeId=0`
	});
	await kurv.text();
}

/** Registrer verk for bruk og hent den genererte tekstfilen. */
async function registrerOgHentTekst(mediaid, dato, navn) {
	// 1) legg i kurv
	await leggIKurv(mediaid);
	// 2) registreringsskjema + registrering av dette én verket
	const regSide = await registrerValgte([mediaid], dato, navn);
	if (!regSide.ok) return regSide;
	// 3) finn og hent tekstfilen for dette verket
	const sti = regSide.filer.find((f) => new RegExp('/' + mediaid + '\\.txt').test(f));
	if (!sti) return { ok: false, error: 'Fant ikke generert tekstfil' };
	const txt = await hent('/' + sti.replace(/^\//, ''));
	const innhold = (await txt.text()).replace(/\r\n/g, '\n').trim();
	if (!innhold) return { ok: false, error: 'Tekstfilen var tom' };
	return { ok: true, tekst: innhold + '\n' };
}

/** Registrer ALLE verkene i kurven i ÉN registrering. Kalleren har lagt verkene i
 *  kurven; her verifiseres de mot registreringsskjemaet og manglende verk settes
 *  opp på nytt (serveren kan miste tidligere kurvlegginger), før registreringen.
 *  Returnerer {ok, filer} — tekstfilene per verk. */
async function registrerValgte(mediaids, dato, navn) {
	let skjemaSide = '';
	for (let forsok = 0; forsok < 3; forsok++) {
		for (const m of mediaids) await leggIKurv(m);
		const skjema = await hent('index.cfm/medialib/doPurchaseItems');
		skjemaSide = await skjema.text();
		if (mediaids.every((m) => skjemaSide.includes('cbMedia' + m))) break;
	}
	const skjemaOk = mediaids.every((m) => skjemaSide.includes('cbMedia' + m));
	if (!skjemaOk) {
		const funnet = [...skjemaSide.matchAll(/name="(cbMedia\d+)/g)].map((mm) => mm[1]);
		const utdrag = skjemaSide.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
		return { ok: false, error: 'Registreringsskjemaet mangler verkene. Ventet: ' + mediaids.join(',') + ' | funnet: ' + [...new Set(funnet)].join(',') + ' | ' + utdrag.slice(0, 120) };
	}
	const felt = new URLSearchParams({
		church: navn || 'Gudstjeneste',
		period: 'on',
		dateFrom: tilSkjemaDato(dato),
		dateTo: '',
		numUses: '1'
	});
	for (const mediaid of mediaids) {
		felt.set(`MusicSheetTypeId_${mediaid}`, '0');
		felt.set(`cbMedia${mediaid}`, '-1'); // alle vers
		felt.set(`cbsheetmusic${mediaid}`, 'on');
		felt.set(`screen${mediaid}`, 'portrait');
		felt.set(`lang${mediaid}`, 'B');
	}
	const reg = await hent('index.cfm/medialib/doRegisterItems', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded', referer: BASE + 'index.cfm/medialib/doPurchaseItems' },
		body: felt.toString()
	});
	const regSide = await reg.text();
	if (!erInnloggetSide(regSide)) return { ok: false, error: 'Sesjonen utløpt under registrering' };
	// genererte tekstfiler (én per verk): data/generated/media/<hash>/<mediaid>.txt
	const filer = [...regSide.matchAll(/data\/generated\/media\/[^"']+\.txt/g)].map((m) => m[0]);
	return { ok: true, filer };
}

/** IPC: hent salmetekst. payload = { nr, tittel, dato, navn } */
ipcMain.handle('salme:hent', async (_e, payload = {}) => {
	try {
		const ses = await sikreSesjon();
		if (!ses.ok) return { ok: false, error: ses.error };
		const q = { nr: String(payload.nr || '').trim(), tittel: String(payload.tittel || '').trim() };
		if (!q.nr && !q.tittel) return { ok: false, error: 'Fyll inn salmenummer eller tittel' };
		const soekRes = await soekOgVelg(q);
		if (!soekRes.ok) return soekRes;
		const valgt = soekRes.valgt;
		// 2) registrer og hent tekst
		const reg = await registrerOgHentTekst(valgt.mediaid, payload.dato, payload.navn);
		if (!reg.ok) return reg;
		return {
			ok: true,
			tittel: valgt.title,
			tittel2: valgt.title2,
			tekst: reg.tekst, // hele salmeteksten fra den genererte tekstfilen
			tekstForfatter: valgt.tekst, // «T: <navn>»
			melodi: valgt.melodi, // «M: <navn>»
			rettighet: valgt.rettighet,
			mediaid: valgt.mediaid
		};
	} catch (err) {
		return { ok: false, error: String(err?.message ?? err) };
	}
});

/** IPC: hent FLERE salmer i ÉN registrering (én verksbruk per verk, én dato/arrangement).
 *  payload = { dato, navn, salmer: [{ key, nr, tittel }] } → { ok, resultater: [{ key, ok, tekst, tittel, error }] } */
ipcMain.handle('salme:hent-flere', async (_e, payload = {}) => {
	try {
		const ses = await sikreSesjon();
		if (!ses.ok) return { ok: false, error: ses.error };
		const dato = payload.dato ?? '';
		const navn = payload.navn ?? 'Gudstjeneste';
		const resultater = [];
		const valgte = [];
		// 1) søk + legg alle i kurven
		for (const s of (payload.salmer ?? [])) {
			const q = { nr: String(s.nr || '').trim(), tittel: String(s.tittel || '').trim() };
			if (!q.nr && !q.tittel) { resultater.push({ key: s.key, ok: false, error: 'Mangler nummer og tittel' }); continue; }
			const soekRes = await soekOgVelg(q);
			if (!soekRes.ok) { resultater.push({ key: s.key, ok: false, error: soekRes.error }); continue; }
			valgte.push({ key: s.key, valgt: soekRes.valgt });
		}
		if (!valgte.length) return { ok: false, error: 'Ingen treff i salmedatabasen', resultater };
		// 2) én registrering med alle verkene
		const reg = await registrerValgte(valgte.map((v) => v.valgt.mediaid), dato, navn);
		if (!reg.ok) return { ok: false, error: reg.error, resultater };
		// 3) hent tekstfilen per verk
		for (const { key, valgt } of valgte) {
			const sti = reg.filer.find((f) => new RegExp('/' + valgt.mediaid + '\\.txt').test(f));
			if (!sti) { resultater.push({ key, ok: false, error: 'Fant ikke tekstfil for «' + valgt.title + '»' }); continue; }
			const txt = await hent('/' + sti.replace(/^\//, ''));
			const innhold = (await txt.text()).replace(/\r\n/g, '\n').trim();
			resultater.push({
				key,
				ok: !!innhold,
				tekst: innhold ? innhold + '\n' : undefined,
				tittel: valgt.title,
				tittel2: valgt.title2,
				tekstForfatter: valgt.tekst,
				melodi: valgt.melodi,
				mediaid: valgt.mediaid,
				error: innhold ? undefined : 'Tekstfilen var tom'
			});
		}
		return { ok: true, resultater };
	} catch (err) {
		return { ok: false, error: String(err?.message ?? err) };
	}
});

/** IPC: lagre innlogging (passordet krypteres med Electron safeStorage). */
ipcMain.handle('salme:lagre-login', (_e, { user, pass }) => {
	try {
		if (!safeStorage.isEncryptionAvailable()) {
			return { ok: false, error: 'Kryptering utilgjengelig (Keychain/Secret Service)' };
		}
		const passEnc = safeStorage.encryptString(String(pass ?? '')).toString('base64');
		dbSet('salmeLogin', { user: String(user ?? '').trim(), passEnc });
		return { ok: true };
	} catch (err) {
		return { ok: false, error: String(err?.message ?? err) };
	}
});

ipcMain.handle('salme:status', () => {
	const l = dbGet('salmeLogin');
	return { ok: true, konfigurert: !!l?.user, bruker: l?.user ?? '' };
});

/** IPC: logg ut — slett lagret innlogging og dropp sesjonen. */
ipcMain.handle('salme:logg-ut', () => {
	try {
		dbSet('salmeLogin', null);
		cookieJar = new Map();
		innloggetTid = 0;
		return { ok: true };
	} catch (err) {
		return { ok: false, error: String(err?.message ?? err) };
	}
});

ipcMain.handle('salme:test-login', async () => {
	const r = await loggInn();
	return r;
});

module.exports = {};
