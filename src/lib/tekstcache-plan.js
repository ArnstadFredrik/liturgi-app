/**
 * Ren planleggingsmodul for bakgrunnscaching av kirkeårsbibeltekster.
 * Ingen app-tilstand her — kan testes direkte med node --test.
 * Se tekstcache.js for hentingen og indikatoren.
 */

import church from 'church-year';

const isoLokal = (d) => {
	const pad = (n) => String(n).padStart(2, '0');
	return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
};

/** Cache-nøkkelen for en dag (samme mønster som hentTekster bruker). */
function noekkel(dag, rekke) {
	const startYear = dag.years?.split('-')[0];
	return startYear + '/' + dag.id + (rekke ? '@' + rekke : '');
}

/** Kirkeårsdagene for et kirkeårstart-år, med dag/rekke/struktur. */
function dagerForAr(ar) {
	try {
		return (church.churchYear({ year: ar }) ?? []).map((d) => ({
			id: d.id,
			years: d.years,
			date: d.day?.slice(0, 10) ?? '',
			name: d.name,
			rekke: d.readings?.currentReadings?.name ?? '',
			// struktur-signatur: allReadings-nøklene (festdager/unntak har annen struktur)
			struktur: Object.keys(d.readings?.allReadings ?? {}).sort().join(','),
			ar
		}));
	} catch {
		return [];
	}
}

/** Standard tekstrekkke-struktur: rekke I/II/III (+ ev. festtekst F). */
function standardStruktur(struktur) {
	return struktur === 'F,I,II,III' || struktur === 'F,I,II' || struktur === 'I,II,III' || struktur === 'F,I,II,III,IV';
}

/**
 * Bygg den prioriterte oppgavelisten:
 * [{ dag: {id, years}, rekke, dato, navn, fase }] — bare det som mangler i cachen.
 */
export function byggCacheOppgaver(cache, idag) {
	let startAr;
	try {
		startAr = church.calculateStartYear(idag);
	} catch {
		return [];
	}
	if (startAr == null) return [];

	const aarDager = {};
	for (const ar of [startAr, startAr + 1, startAr - 1]) aarDager[ar] = dagerForAr(ar);
	const naavaerende = aarDager[startAr] ?? [];
	const andreAr = [startAr + 1, startAr - 1].flatMap((ar) => aarDager[ar] ?? []);

	// fasene i prioritert rekkefølge
	const omUker = nyDato(idag, 7);
	const naavaerendeAr = (d) => d.ar === startAr;
	const faser = [
		['Kommende kirkeårsdag', (d) => naavaerendeAr(d) && d.date >= idag && d.date <= omUker],
		['Resten av kirkeåret', (d) => naavaerendeAr(d) && d.date > omUker],
		['Tidligere dager dette kirkeåret', (d) => naavaerendeAr(d) && d.date < idag],
		['Dager med annen tekststruktur', (d) => !naavaerendeAr(d) && d.struktur && !standardStruktur(d.struktur)],
		['Andre tekstrekker', (d) => !naavaerendeAr(d) && d.struktur && standardStruktur(d.struktur)],
		['Merkedager', (d) => !naavaerendeAr(d)]
	];

	const samlet = [];
	const sett = new Set();
	const pool = naavaerende.concat(andreAr);
	for (const [fase, passa] of faser) {
		for (const d of pool) {
			if (!passa(d)) continue;
			const nok = noekkel({ id: d.id, years: d.years }, d.rekke);
			if (sett.has(nok) || cache[nok]) continue; // hopp over det som er cachet
			sett.add(nok);
			samlet.push({
				dag: { id: d.id, years: d.years },
				rekke: d.rekke,
				dato: d.date,
				navn: d.name,
				fase
			});
		}
	}
	return samlet;
}

function nyDato(idag, dager) {
	const d = new Date(idag + 'T12:00:00');
	d.setDate(d.getDate() + dager);
	return isoLokal(d);
}
