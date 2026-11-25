/**
 * Brukerhåndbok: dokumentasjonen (docs/*.md) konvertert til HTML med pandoc.
 * HTML-en genereres ved build (scripts/handbok-html.mjs, se prebuild i
 * package.json) og er commit-et, slik at appen fungerer offline uten pandoc.
 */
import { brukerhandbokHtml, apiHtml, limal_formatHtml } from './generated/handbok-html.js';

/** Innholdsfortegnelsen: alle dokumenter med tittel og ferdig HTML. */
export const handbokDokumenter = [
	{ id: 'brukerhandbok', tittel: 'Brukerhåndbok', html: brukerhandbokHtml },
	{ id: 'api', tittel: 'Utviklerdokumentasjon', html: apiHtml },
	{ id: 'limal-format', tittel: 'Limal-format', html: limal_formatHtml },
];
