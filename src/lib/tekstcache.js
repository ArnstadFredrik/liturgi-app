/**
 * Bakgrunnscaching av bibeltekster for kirkeåret.
 *
 * Ved appoppstart hentes bibeltekstene for hele (kommende) kirkeår og de andre
 * tekstrekkene, slik at alt gjenbrukes offline fra db ('kirkeaarTekster').
 * Tekstene caches "for evig" (kirkeårsinnholdet endrer seg ikke mellom årene)
 * og gjenbrukes overalt appen henter bibeltekster: gudstjenester, kirkeårs-
 * modulen, prekenforberedelse osv.
 *
 * Prioritert rekkefølge:
 *   1. Den kommende kirkeårsdagen (den datoen peker på nå)
 *   2. Resten av det gjeldende kirkeåret (dager etter i dag)
 *   3. Resten av det gjeldende kirkeåret før i dag (det som mangler i cachen)
 *   4. Kirkeårsdager med annen struktur på tekstrekkene (festdager/unntak,
 *      allReadings uten standard I/II/III-struktur) i nabokirkeårene
 *   5. De andre to tekstrekkene: alle dager i de to nabokirkeårene
 *   6. Merkedager/enkeltdager som fortsatt ikke er hentet
 *
 * Hentingen er sekvensiell med hvile mellom hver henvendelse (vennlig mot
 * bibel.no, ingen rate-limit-spam), alt asynkront i bakgrunnen. Dager som
 * ligger i cachen fra før hoppes over, så appen kan lukkes og åpnes igjen
 * uten at hele prosessen starter på nytt.
 */

import { lesTeksterCache, hentTekster } from './kirkeaar.js';
import { app } from './store.svelte.js';
import { byggCacheOppgaver } from './tekstcache-plan.js';

const sovn = (ms) => new Promise((r) => setTimeout(r, ms));
const isoLokal = (d) => {
	const pad = (n) => String(n).padStart(2, '0');
	return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
};

/** Cache-nøkkelen for en dag (samme mønster som hentTekster bruker). */
function noekkel(dag, rekke) {
	const startYear = dag.years?.split('-')[0];
	return startYear + '/' + dag.id + (rekke ? '@' + rekke : '');
}
let kjorer = false;
let avbrutt = false;


/** Start bakgrunnscaching (idempotent — kjører bare én om gangen). */
export async function startTekstCacheBakgrunn() {
	if (kjorer) return;
	kjorer = true;
	avbrutt = false;
	try {
		await kjor();
	} catch (e) {
		console.error('[tekstcache]', e?.message ?? e);
	} finally {
		kjorer = false;
		app.tekstCache.gaar = false;
	}
}

async function kjor() {
	if (typeof navigator !== 'undefined' && !navigator.onLine) {
		app.tekstCache = { gaar: false, ferdig: 0, totalt: 0, fase: 'Offline — prøver ved neste oppstart' };
		return;
	}
	const cache = await lesTeksterCache();
	const idag = isoLokal(new Date());
	const oppgaver = byggCacheOppgaver(cache, idag);
	if (!oppgaver.length) {
		app.tekstCache = { gaar: false, ferdig: 0, totalt: 0, fase: 'Alt er cachet' };
		return;
	}

	app.tekstCache = { gaar: true, ferdig: 0, totalt: oppgaver.length, fase: oppgaver[0].fase };

	let feil = 0;
	for (let n = 0; n < oppgaver.length; n++) {
		if (avbrutt) break;
		const t = oppgaver[n];
		// kan være cachet av selve appen underveis — sjekk friskt mot db
		const frisk = await lesTeksterCache();
		if (frisk[noekkel(t.dag, t.rekke)]) {
			app.tekstCache.ferdig = n + 1;
			continue;
		}
		app.tekstCache.fase = t.navn + ' · ' + t.fase;
		try {
			// hentTekster: cache-first, henter og lagrer i cache selv
			const res = await hentTekster(t.dag, frisk, t.rekke);
			if (!res || (!res.E && !res.L1)) feil++;
		} catch {
			feil++;
		}
		app.tekstCache.ferdig = n + 1;
		// hvile mellom henvendelsene — vennlig mot bibel.no (ingen rate-limit-spam)
		if (n < oppgaver.length - 1) await sovn(1400);
		// lengre pause hvert 15. kall for et rolig trafikkmønster
		if ((n + 1) % 15 === 0 && n < oppgaver.length - 1) await sovn(12000);
	}

	app.tekstCache = {
		gaar: false,
		ferdig: oppgaver.length,
		totalt: oppgaver.length,
		fase: avbrutt ? 'Avbrutt' : 'Bakgrunnscaching ferdig' + (feil ? ' (' + feil + ' feilet)' : '')
	};
}

/** Avbryt bakgrunnscachingen (valgfritt). */
export function avbrytTekstCache() {
	avbrutt = true;
}
