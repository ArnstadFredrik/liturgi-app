/**
 * Brukerhåndbok: leser dokumentasjonsfilene (docs/*.md) og renderer dem til HTML.
 * En liten egen markdown-renderer — dokumentasjonen skal være lesbar i appen
 * uten eksterne avhengigheter, også offline.
 */

import handbokMd from '../../docs/brukerhandbok.md?raw';
import apiMd from '../../docs/api.md?raw';

/** Innholdsfortegnelsen: alle dokumenter med tittel. */
export const handbokDokumenter = [
	{ id: 'brukerhandbok', tittel: 'Brukerhåndbok', md: handbokMd },
	{ id: 'api', tittel: 'Utviklerdokumentasjon', md: apiMd },
];

export { mdTilHtml } from './md-doc.js';
