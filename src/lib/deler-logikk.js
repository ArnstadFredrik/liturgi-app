/**
 * deler-logikk.js — ren logikk for alternativ/variasjon på hoveddeler og
 * enkeltledd (uten Svelte-runer, slik at node-testene kan importere den).
 *
 * Logikken:
 *  - Alternativ (flervalg): en hoveddel/enkeltledd tas kun med når ALLE
 *    merkede alternativer er på ved oppretting.
 *  - Variasjon (del-gruppe, enten/eller): bare deler med valgt gruppe (eller
 *    uten gruppe-merke) tas med.
 *  - En hoveddel som SELV er merket (alternativ eller variasjon) styrer hele
 *    hoveddelen — enkeltledd-merker gjelder ikke (de kan ikke plukkes med
 *    hvis hoveddelen ikke er med).
 *  - Hoveddeler UTEN merke kan ha alternativ/variasjon på enkeltledd.
 *  - Valgfrie ledd (optional) tas ikke med automatisk; brukeren velger dem
 *    i «Opprett»-dialogen (valgLedd = Set med ledd-id).
 */

/** alternativ-merkene på et del-objekt (hoveddel eller enkeltledd) — array;
 *  gammel enkelt-streng (alternativ) støttes fortsatt (bakoverkompatibel). */
export function secAlternativer(sec) {
	if (Array.isArray(sec?.alternativer)) return sec.alternativer.filter(Boolean);
	if (sec?.alternativ) return [sec.alternativ];
	return [];
}

/** Hoveddelen (eller leddet) er styrt av alternativ/variasjon. */
export function erStyrt(sec) {
	return secAlternativer(sec).length > 0 || !!sec?.delGruppe;
}

/** Alternativ-sjekk for enkeltledd (ingen tittel-regler her — de gjelder
 *  bare hoveddeler, jf. includeSection). */
export function includeItem(it, include) {
	for (const t of secAlternativer(it)) {
		if (include && include[t] === false) return false;
	}
	return true;
}

/** Alternativ-katalogen for en mal: eksplisitt liste + merker i bruk på
 *  hoveddeler OG enkeltledd + tittel-utledede standarder («Dåp»-seksjon →
 *  dåp, nattverd i tittel → nattverd). «Opprett gudstjeneste» bygger
 *  bryterne sine fra denne. */
export function malAlternativer(mal) {
	const sett = new Set(mal?.alternativer ?? []);
	for (const sec of mal?.sections ?? []) {
		for (const t of secAlternativer(sec)) sett.add(t);
		for (const it of sec.items ?? []) {
			for (const t of secAlternativer(it)) sett.add(t);
		}
		const title = sec?.title ?? '';
		if (title === 'Dåp') sett.add('dåp');
		if (/nattverd/i.test(title)) sett.add('nattverd');
	}
	return [...sett];
}

/** Alternativ-sjekk for hoveddeler: merker + de hardkodede tittel-reglene
 *  (Dåp/nattverd kan slås av ved oppretting). Godtar både seksjonsobjekt og
 *  gammel tittel-streng (bakoverkompatibelt). */
export function includeSection(sec, include) {
	const obj = typeof sec === 'string' ? { title: sec } : sec;
	for (const t of secAlternativer(obj)) {
		if (include && include[t] === false) return false;
	}
	if (obj.title === 'Dåp' && include && include.dåp === false) return false;
	if (/nattverd/i.test(obj.title ?? '') && include && include.nattverd === false) return false;
	return true;
}

/** Filtrer enkeltleddene i en hoveddel uten eget merke: alternativ-merker
 *  og variasjon (del-gruppe) gjelder per ledd. Hoveddeler med eget merke
 *  filtreres aldri her (hele hoveddelen følger alternativet/variasjonen). */
export function filterTemplateItems(items, include, valgtGruppe) {
	return (items ?? []).filter(
		(it) => includeItem(it, include) && (!it.delGruppe || it.delGruppe === valgtGruppe)
	);
}

/** Valgfrie ledd (optional) tas ikke med automatisk — de som er valgt i
 *  «Opprett»-dialogen (valgLedd = Set med ledd-id) følger med. */
export function filterValgfrie(items, valgLedd) {
	return (items ?? []).filter((it) => !it.optional || (valgLedd?.has?.(it.id) ?? false));
}

/** Standardvalg ved oppretting: hvilke valgfrie ledd er førvalgt?
 *  Originalmaler: ALLE valgfrie ledd er med som standard. Brukermaler:
 *  de leddene malen har merket med valgStandard (styres fra malredigeringen). */
export function valgLeddStandard(mal, erOriginal) {
	const ut = [];
	for (const sec of mal?.sections ?? []) {
		for (const it of sec.items ?? []) {
			if (it.optional && (erOriginal || it.valgStandard === true)) ut.push(it.id);
		}
	}
	return ut;
}
