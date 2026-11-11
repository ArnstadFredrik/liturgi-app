import { app } from './store.svelte.js';

/** Åpne kontekstmeny på skjermkoordinater med menyvalg. */
export function openContextMenu(x, y, items) {
	app.contextMenu = { x, y, items };
}

export function closeContextMenu() {
	app.contextMenu = null;
}
