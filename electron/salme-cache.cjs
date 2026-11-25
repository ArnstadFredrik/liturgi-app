// Salmetekst-cache (db 'salmeCache') + bruksstatistikk (db 'salmeBruk').
// Tekster fra gudstjeneste.no caches i ubestemt tid; entrer for salmer som er
// lite brukt (ingen registrering de siste 3 mnedene) ryddes ut. TONO-
// registrering skjer for hver henting uansett, s cachen er trygg.
// Ren modul: bare db.cjs, testbar med node --test.
const { dbGet, dbSet } = require('./db.cjs');

const DAG_MS = 24 * 60 * 60 * 1000;
const OFTE_GRENS = 3; // antall bruk de siste 3 mnedene for "ofte brukt"
const OFTE_DAGER = 90;

function isoDato(d) {
	const pad = (n) => String(n).padStart(2, '0');
	return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

function lesCache() { return dbGet('salmeCache') ?? {}; }
function lagreCache(c) { dbSet('salmeCache', c); }
function lesBruk() { return dbGet('salmeBruk') ?? {}; }

/** Stabil nkkel for en salme: nummeret hvis det finnes, ellers normalisert tittel. */
function cacheNoekkel(q) {
	if (q?.nr) return 'nr:' + String(q.nr).toLowerCase().replace(/\s+/g, '');
	return 't:' + String(q?.tittel || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

/** Gyldighetsdato for en henting: gudstjenestens dato (pluss dagen), ellers +1 dag. */
function gyldighet(dato) {
	const base = dato ? new Date(dato + 'T23:59:59') : new Date(Date.now() + DAG_MS);
	if (isNaN(base.getTime())) return isoDato(new Date(Date.now() + DAG_MS));
	return isoDato(base);
}

/** Ofte brukt = OFTE_GRENS+ bruk de siste 3 mnedene. */
function erOfteBrukt(bruk) {
	const grense = isoDato(new Date(Date.now() - 90 * DAG_MS));
	return (bruk?.datoer ?? []).filter((d) => d >= grense).length >= OFTE_GRENS;
}

/** Lite brukt = ingen registrering de siste 3 mnedene (ryddes fra cachen). */
function erLiteBrukt(bruk) {
	if (!bruk) return true;
	const grense = isoDato(new Date(Date.now() - 90 * DAG_MS));
	const siste = [...(bruk.datoer ?? []), bruk.sist ?? ''].sort().pop() ?? '';
	return siste < grense;
}

/** Registrer bruken (TONO-statistikk) og gi ofte brukte salmer lang cache. */
function registrerBruk(q, dato) {
	const nk = cacheNoekkel(q);
	const bruk = lesBruk();
	const b = bruk[nk] ?? { nr: q?.nr ?? '', tittel: q?.tittel ?? '', antall: 0, datoer: [] };
	b.antall = (b.antall ?? 0) + 1;
	b.nr = b.nr || q?.nr || '';
	b.tittel = b.tittel || q?.tittel || '';
	b.datoer = [...(b.datoer ?? []), dato || isoDato(new Date())].slice(-40);
	b.sist = dato || isoDato(new Date());
	bruk[nk] = b;
	dbSet('salmeBruk', bruk);
	return erOfteBrukt(b);
}

/** Rydd cachen: salmer som har ligget der i over 3 mnd og er lite brukt
 *  (ingen registrering de siste 3 mnedene) kastes. */
function ryddCache() {
	const c = lesCache();
	const bruk = lesBruk();
	const grense = isoDato(new Date(Date.now() - 90 * DAG_MS));
	let ryddet = 0;
	for (const k of Object.keys(c)) {
		if ((c[k].hentet ?? '') < grense && erLiteBrukt(bruk[k])) { delete c[k]; ryddet++; }
	}
	if (ryddet) lagreCache(c);
	return ryddet;
}

/** Lagre en nytekst i cachen (ubegrenset) og rydd lite brukte entrer. */
function cacheTekst(q, valgt, tekst) {
	const c = lesCache();
	const nk = cacheNoekkel(q);
	c[nk] = {
		tekst, tittel: valgt?.title ?? '', tittel2: valgt?.title2 ?? '',
		tekstForfatter: valgt?.tekst ?? '', melodi: valgt?.melodi ?? '',
		rettighet: valgt?.rettighet ?? '', mediaid: valgt?.mediaid,
		nr: q?.nr ?? '', hentet: isoDato(new Date())
	};
	lagreCache(c);
	ryddCache();
}

/** Cache-treff (cachen gjelder i ubestemt tid; rydding skjer for lite brukte). */
function cacheTreff(q) {
	const c = lesCache();
	const e = c[cacheNoekkel(q)];
	return e ?? null;
}

module.exports = { isoDato, cacheNoekkel, gyldighet, registrerBruk, cacheTekst, cacheTreff, lesCache, lesBruk, erLiteBrukt, erOfteBrukt, ryddCache };
