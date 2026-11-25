/**
 * Brukerhåndbok: leser dokumentasjonsfilene (docs/*.md) og renderer dem til HTML.
 * En liten egen markdown-renderer — dokumentasjonen skal være lesbar i appen
 * uten eksterne avhengigheter, også offline.
 */

import handbokMd from '../../docs/brukerhandbok.md?raw';
import apiMd from '../../docs/api.md?raw';
import limalMd from '../../docs/limal-format.md?raw';

/** Innholdsfortegnelsen: alle dokumenter med tittel. */
export const handbokDokumenter = [
	{ id: 'brukerhandbok', tittel: 'Brukerhåndbok', md: handbokMd },
	{ id: 'api', tittel: 'Utviklerdokumentasjon', md: apiMd },
	{ id: 'limal-format', tittel: 'Limal-format', md: limalMd },
];

export { mdTilHtml } from './md-doc.js';
