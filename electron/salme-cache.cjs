// Salmetekst-cache (db 'salmeCache') + bruksstatistikk (db 'salmeBruk').
// Tekster fra gudstjeneste.no caches til etter gudstjenestens dato har passert.
// Salmer som brukes ofte (3+ ganger de siste 3 mnedene) beholdes i 90 dager.
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

/** Lagre en nytekst i cachen og kast utlpte entrer (unntatt ofte brukte). */
function cacheTekst(q, valgt, tekst, dato, ofte) {
	const c = lesCache();
	const nk = cacheNoekkel(q);
	let gyldig = gyldighet(dato);
	if (ofte) gyldig = isoDato(new Date(Date.now() + OFTE_DAGER * DAG_MS));
	c[nk] = {
		tekst, tittel: valgt?.title ?? '', tittel2: valgt?.title2 ?? '',
		tekstForfatter: valgt?.tekst ?? '', melodi: valgt?.melodi ?? '',
		rettighet: valgt?.rettighet ?? '', mediaid: valgt?.mediaid,
		nr: q?.nr ?? '', gyldigTil: gyldig, hentet: isoDato(new Date())
	};
	const iDag = isoDato(new Date());
	const bruk = lesBruk();
	for (const k of Object.keys(c)) {
		if (c[k].gyldigTil < iDag && !erOfteBrukt(bruk[k])) delete c[k];
	}
	lagreCache(c);
}

/** Cache-treff som fortsatt er gyldig (gudstjenesten har ikke vrt), eller null. */
function cacheTreff(q) {
	const c = lesCache();
	const e = c[cacheNoekkel(q)];
	if (!e) return null;
	if ((e.gyldigTil ?? '') < isoDato(new Date())) return null;
	return e;
}

module.exports = { isoDato, cacheNoekkel, gyldighet, registrerBruk, cacheTekst, cacheTreff, lesCache, lesBruk };
