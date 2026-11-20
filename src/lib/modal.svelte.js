import { app } from './store.svelte.js';

/**
 * Vis modal. typer:
 *  - {type:'prompt', title, label, def, ok}
 *  - {type:'confirm', title, message, ok}
 *  - {type:'newService', ok}
 */
export function showModal(modal) {
	// id: +page.svelte keyer <Modal /> på type+id — garanterer remount (fersk $state)
	// ved HVER åpning; åpnings-tilbakestillingen i Modal kan ellers bli stående
	app.modal = { ...modal, id: (app.modalTeller = (app.modalTeller ?? 0) + 1) };
}

export function prompt(title, label, ok, def = '') {
	showModal({ type: 'prompt', title, label, def, ok });
}

export function confirmBox(title, message, ok) {
	showModal({ type: 'confirm', title, message, ok });
}

/** Bekreftelse ved lukking med ulagrede endringer: Avbryt / Lagre / Lukk uten å lagre. */
/** Bokstav for en skriftlesning: eksplisitt bokstav-felt, ellers posisjon
 *  i seksjonen (A = første ledd). Stemmer med docx-originalenes A.-B.-C.-
 *  nummerering (upperLetter). */
export function skriftBokstav(it, idx) {
	// KUN eksplisitt bokstav (fra docx-originalen) — posisjon-fallback gir feil
	// bokstaver når lista har et ubokstavført innledningsledd først.
	return it.bokstav ?? '';
}

/** Velg skriftlesninger: lista har mange tekster (A–Y), en gudtjeneste skal
 *  bare ha 2–4 av dem. Merk de ønskede — bare merkede ledd følger med
 *  (enabled). Bokstavfeltet lar brudeparets svar (f.eks. «B, E, H») sette
 *  merkingen direkte. */
/** Del-gruppe-modal: legg til / slett / velg del-grupper for en seksjon.
 *  Gruppelista lagres på malen (delGrupper); seksjonen merkes med
 *  delGruppe, og «Ny gravferd» viser bare avsnitt i den valgte gruppen. */
export function delGruppeModal(mal, seksjon) {
	showModal({
		type: 'delGruppe',
		title: 'Del-gruppe for «' + (seksjon.title ?? '') + '»',
		mal, seksjon,
		grupper: [...(mal.delGrupper ?? [])],
		valgt: seksjon.delGruppe ?? null
	});
}

export function velgTeksterModal(seksjon) {
	showModal({
		type: 'velgTekster',
		title: 'Velg skriftlesninger — ' + (seksjon.title ?? ''),
		seksjon,
		valgte: new Set((seksjon.items ?? []).map((it, i) => (it.enabled !== false ? i : -1)).filter((i) => i >= 0))
	});
}

export function lukkModal(onLagre, onForkast) {
	showModal({
		type: 'lukk',
		title: 'Ulagrede endringer',
		message: 'Du har endringer som ikke er lagret. Vil du lagre før du lukker?',
		ok: onLagre,
		onForkast
	});
}

export function newServiceModal(ok, forhåndsvalgtType = 'gudstjeneste') {
	showModal({ type: 'newService', ok, forhåndsvalgtType });
}

export function chooseSectionsModal(titles, ok) {
	showModal({ type: 'choose', titles, ok });
}

export function chooseOneModal(options, sel, ok, onAvbryt, title = 'Velg alternativ', okLabel = 'OK') {
	showModal({ type: 'chooseOne', options, sel, ok, onAvbryt, title, okLabel });
}

/** Fjern-flere-modal: checkboksliste, ok() kalles med de valgte INDEKSENE. */
export function fjernFlereModal(options, tittel, ok) {
	showModal({ type: 'fjernFlere', options, title: tittel, ok });
}

/** Administrer alternativer: navneendring, nytt tomt, slett merkede, hent fra
 *  biblioteket (enkeltledd eller hele leddet) — jobber LIVE på it[liste]. */
export function adminAltsModal(it, liste, selNokkel, tittel) {
	showModal({ type: 'adminAlts', it, liste, selNokkel, title: tittel });
}

/** Sorterte prefasjon-alternativer ved dato-valg: kirkeårsbestemte først
 *  (aktuell periode øverst), deretter generelle (nattverdbønn a–g).
 *  Rekkefølgen i dokumentet er uendret — sorteringen vises kun i velgeren. */
export function sorterPrefasjoner(options, dato, periode) {
	if (!options?.length || !options.some((o) => /nattverdb|treenighetstiden|advent|jul|åpenbaringstiden|faste|påske|himme|pinse|allehelgen/i.test(o.label ?? ''))) return options;
	const PERIODE_TITTEL = [
		[/^advent/i, 'Advent'],
		[/^jul og maria/i, 'Jul og Maria budskapsdag'],
		[/^åpenbaringstiden/i, 'Åpenbaringstiden'],
		[/^faste/i, 'Faste'],
		[/^påske/i, 'Påske'],
		[/^kristi himmel/i, 'Kristi himmelfartsdag og søndag før pinse'],
		[/^pinse$/i, 'Pinse'],
		[/^treenighetstiden/i, 'Treenighetstiden'],
		[/^allehelgen/i, 'Allehelgensdag, martyrdager']
	];
	const PERIODE_MAP = {
		advent: 'Advent', christmas: 'Jul og Maria budskapsdag', epiphany: 'Åpenbaringstiden',
		lent: 'Faste', easter: 'Påske', pentacost: 'Pinse', trinity: 'Treenighetstiden'
	};
	// periode kan være periodInfo-teksten («Åpenbaringstiden går fra …») — les
	// periodenavnet fra begynnelsen av teksten
	const aktuell = PERIODE_MAP[periode] ?? (periode ? PERIODE_TITTEL.find(([re]) => re.test(periode))?.[1] ?? null : null);
	const treffIndex = (label) => {
		for (const [re, tittel] of PERIODE_TITTEL) if (re.test(label)) return tittel;
		return null;
	};
	const score = (label) => {
		const kirkeaarTittel = treffIndex(label ?? '');
		if (kirkeaarTittel && aktuell) return kirkeaarTittel === aktuell ? 0 : 1;
		if (kirkeaarTittel) return 1;
		return 2; // generelle (Nattverdbønn a–g) sist
	};
	// stabil sortering med original-indeks som bindeledd
	return options
		.map((o, i) => ({ o, i, s: score(o.label) }))
		.sort((a, b) => a.s - b.s || a.i - b.i)
		.map((x) => x.o);
}

/** Søk i hovedgudstjenestens bibliotek. mode: 'innhold' (ett alternativ) | 'ledd' (hele leddet).
 *  ok(m Gruppe, alt) — alt er valgt alternativ i 'innhold'-moden. */
export function bibSokModal(def, mode, ok, onAvbryt) {
	showModal({ type: 'bib', title: 'Hent fra biblioteket', def: def ?? '', mode, ok, onAvbryt });
}

export function closeModal() {
	app.modal = null;
}

/** Bekreftelses-modal med to valg (f.eks. «Behold» / «Oppdater»). ok() = bekreft. */
export function valgModal(title, message, okLabel, cancelLabel, ok, onAvbryt) {
	showModal({ type: 'valg', title, message, okLabel, cancelLabel, ok, onAvbryt });
}

/** Manuelt valg av kirkeårsdag. ok(k) med fullt kirkeårsobjekt; onAvbryt kalles ved Avbryt. */
export function kirkeaarListeModal(dato, ok, onAvbryt) {
	showModal({ type: 'kirkeaarListe', title: 'Velg kirkeårsdag', dato, ok, onAvbryt });
}
