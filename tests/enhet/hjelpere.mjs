/** Hjelpere for bibliotek-testene: kaller db.cjs-funksjonene direkte mot en
 *  TEMPORÆR db (LITURGI_DB_DIR settes av testen før første kall). bibSig
 *  er ikke eksportert per-kilde, så hash-sammenligningen gjøres på hele
 *  registeret via bibSig()-nøkler. */
import { openDb, closeDb, bibSync, bibCounts, bibSearch } from '../../electron/db.cjs';

/** Samme per-rad-hash som i db.cjs — for ordens-uavhengighetstesten. */
function radHash(s) {
	let h = 5381;
	for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
	return h;
}

function sigFor(kilde) {
	const rows = openDb()
		.prepare('SELECT kilde, seksjon, ledd, ledd_id, alt_label, tekst FROM bibliotek WHERE kilde = ?')
		.all(kilde);
	const sig = { n: rows.length, hash: 0 };
	for (const r of rows) {
		const s = r.seksjon + '\u0001' + r.ledd + '\u0001' + r.ledd_id + '\u0001' + r.alt_label + '\u0001' + r.tekst;
		sig.hash = (sig.hash + radHash(s)) >>> 0;
	}
	return sig;
}

export { openDb, closeDb, bibSync, bibCounts, bibSearch, sigFor };
