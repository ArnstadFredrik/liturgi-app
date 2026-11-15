import { app } from './store.svelte.js';

/**
 * Vis modal. typer:
 *  - {type:'prompt', title, label, def, ok}
 *  - {type:'confirm', title, message, ok}
 *  - {type:'newService', ok}
 */
export function showModal(modal) {
	app.modal = modal;
}

export function prompt(title, label, ok, def = '') {
	showModal({ type: 'prompt', title, label, def, ok });
}

export function confirmBox(title, message, ok) {
	showModal({ type: 'confirm', title, message, ok });
}

/** Bekreftelse ved lukking med ulagrede endringer: Avbryt / Lagre / Lukk uten å lagre. */
export function lukkModal(onLagre, onForkast) {
	showModal({
		type: 'lukk',
		title: 'Ulagrede endringer',
		message: 'Du har endringer som ikke er lagret. Vil du lagre før du lukker?',
		ok: onLagre,
		onForkast
	});
}

export function newServiceModal(ok, forhåndsvalgtType = 'gudtjeneste') {
	showModal({ type: 'newService', ok, forhåndsvalgtType });
}

export function chooseSectionsModal(titles, ok) {
	showModal({ type: 'choose', titles, ok });
}

export function chooseOneModal(options, sel, ok) {
	showModal({ type: 'chooseOne', options, sel, ok });
}

/** Søk i hovedgudstjenestens bibliotek. mode: 'innhold' (ett alternativ) | 'ledd' (hele leddet).
 *  ok(m Gruppe, alt) — alt er valgt alternativ i 'innhold'-moden. */
export function bibSokModal(def, mode, ok) {
	showModal({ type: 'bib', title: 'Hent fra biblioteket', def: def ?? '', mode, ok });
}

export function closeModal() {
	app.modal = null;
}

/** Bekreftelses-modal med to valg (f.eks. «Behold» / «Oppdater»). ok() = bekreft. */
export function valgModal(title, message, okLabel, cancelLabel, ok) {
	showModal({ type: 'valg', title, message, okLabel, cancelLabel, ok });
}

/** Manuelt valg av kirkeårsdag. ok(k) med fullt kirkeårsobjekt; onAvbryt kalles ved Avbryt. */
export function kirkeaarListeModal(dato, ok, onAvbryt) {
	showModal({ type: 'kirkeaarListe', title: 'Velg kirkeårsdag', dato, ok, onAvbryt });
}
