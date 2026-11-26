/** Fil-listen for prekenforberedelses-prosjekter (Innstillinger -> Prekenforberedelse).
 *  Rens og valider brukerredigert liste: alle navn trimmes, .md-endelse legges til
 *  om den mangler, duplikater fjernes (skill store/sm bokstaver), tomme navn droppes. */
export const FORB_FILER_STANDARD = ['notat.md', 'preken.md', 'tekstmeditasjon.md'];

export function normaliserForbFiler(liste, { standardHvisTom = true } = {}) {
	if (!Array.isArray(liste)) return standardHvisTom ? [...FORB_FILER_STANDARD] : [];
	const ut = [];
	const sett = new Set();
	for (const raa of liste) {
		if (typeof raa !== 'string') continue;
		let navn = raa.trim();
		if (!navn || navn === '.' || navn.includes('/') || navn.includes('\\')) continue;
		if (!/\.md$/i.test(navn)) navn += '.md';
		if (navn.length > 100) navn = navn.slice(0, 100);
		const nokkel = navn.toLowerCase();
		if (sett.has(nokkel)) continue;
		sett.add(nokkel);
		ut.push(navn);
	}
	if (!ut.length && standardHvisTom) return [...FORB_FILER_STANDARD];
	return ut;
}

/** Les listen fra db-verdi (JSON) med fallback til standard. */
export function lesForbFiler(verdi) {
	try {
		const liste = typeof verdi === 'string' ? JSON.parse(verdi) : verdi;
		return normaliserForbFiler(liste);
	} catch {
		return [...FORB_FILER_STANDARD];
	}
}
