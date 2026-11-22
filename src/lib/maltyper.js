/** Liturgityper og målformer — ren modul (ingen Svelte-avhengigheter) slik at
 *  node-testene kan verifisere opprett-modulens klassifisering direkte.
 *  Brukes av Modal (Ny gudstjeneste), Maler og Malverktoy. */

export const TYPER = ['gudstjeneste', 'vigsel', 'gravferd'];

/** Målformer/språk malene kan ha. 'bokmål' er standard og den eneste
 *  målformen som følger med appen foreløpig; utvides etter hvert som
 *  flere ordninger legges inn. */
export const MÅLFORMER = ['bokmål', 'nynorsk', 'engelsk'];

export function målformLabel(mf) {
	const k = (mf ?? 'bokmål').toLowerCase();
	return k[0].toUpperCase() + k.slice(1);
}

/** Malens målform — mangler feltet (gamle maler) er det bokmål. */
export function malFormFor(t) {
	return (t?.malForm ?? 'bokmål').toLowerCase();
}

/** Hvilken liturgitype har malen? (egendefinert felt eller navn) */
export function malType(t) {
	return t.liturgiType ?? (/vigsel/i.test(t.name || '') ? 'vigsel' : /gravferd/i.test(t.name || '') ? 'gravferd' : 'gudstjeneste');
}

/** Kan malen brukes direkte til å opprette gudstjenester? */
export function kanBrukes(t) {
	return t.kanGudstjeneste !== false;
}

/** Er malen en WIP-mal (konvertert/importert, ikke verifisert ennå)?
 *  WIP-maler vises i mal-tabellen med WIP-merke, men tas ikke med i
 *  Opprett-modalen før de er bekreftet (db-nøkkelen «wipBekreftede»). */
export function erWip(t) {
	return t?.wip === true;
}

/** Malene av én type OG én målform, i rekkefølgen opprett-modulen viser dem
 *  (navn, norsk sortering). */
export function malerForType(maler, type, malForm = 'bokmål') {
	const mf = malForm.toLowerCase();
	return maler
		.filter((t) => malType(t) === type && kanBrukes(t) && !erWip(t) && malFormFor(t) === mf)
		.sort((a, b) => a.name.localeCompare(b.name, 'no'));
}

/** Oversettelses-gruppen til en mal: malen selv + maler som er koblet til den
 *  (i begge retninger — koblingen lagres på den ene siden). Manglende maler
 *  (slettede/ikke importerte) hoppes over. */
export function oversettelsesGruppe(mal, maler) {
	if (!mal) return [];
	const ider = new Set([mal.id]);
	for (const t of maler) {
		const koblinger = t.oversettelser ?? [];
		if (koblinger.includes(mal.id)) ider.add(t.id);
	}
	for (const id of mal.oversettelser ?? []) ider.add(id);
	return maler.filter((t) => ider.has(t.id));
}
