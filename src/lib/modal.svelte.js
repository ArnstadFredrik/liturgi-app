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

export function newServiceModal(ok) {
	showModal({ type: 'newService', ok });
}

export function chooseSectionsModal(titles, ok) {
	showModal({ type: 'choose', titles, ok });
}

export function chooseOneModal(options, sel, ok) {
	showModal({ type: 'chooseOne', options, sel, ok });
}

export function closeModal() {
	app.modal = null;
}
