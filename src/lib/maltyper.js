/** Liturgityper for malene — ren modul (ingen Svelte-avhengigheter) slik at
 *  node-testene kan verifisere opprett-modulens klassifisering direkte.
 *  Brukes av Modal (Ny gudstjeneste), Maler og Malverktoy. */

export const TYPER = ['gudstjeneste', 'vigsel', 'gravferd'];

/** Hvilken liturgitype har malen? (egendefinert felt eller navn) */
export function malType(t) {
	return t.liturgiType ?? (/vigsel/i.test(t.name || '') ? 'vigsel' : /gravferd/i.test(t.name || '') ? 'gravferd' : 'gudstjeneste');
}

/** Kan malen brukes direkte til å opprette gudstjenester? */
export function kanBrukes(t) {
	return t.kanGudstjeneste !== false;
}

/** Malene av én type, i rekkefølgen opprett-modulen viser dem (type-rekkefølge
 *  gudstjeneste → vigsel → gravferd, deretter navn). */
export function malerForType(maler, type) {
	return maler
		.filter((t) => malType(t) === type && kanBrukes(t))
		.sort((a, b) => a.name.localeCompare(b.name, 'no'));
}
