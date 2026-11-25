import { test } from 'node:test';
import assert from 'node:assert/strict';
import { byggCacheOppgaver } from '../../src/lib/tekstcache-plan.js';

const IDAG = '2026-11-29'; // 1. s\u00f8ndag i advent (start p\u00e5 kirke\u00e5r 2026-2027, rekke II)

function nokkel(dag, rekke) {
	const startYear = dag.years.split('-')[0];
	return startYear + '/' + dag.id + (rekke ? '@' + rekke : '');
}

test('byggCacheOppgaver: prioritert rekkeflge', () => {
	const oppg = byggCacheOppgaver({}, IDAG);
	assert.ok(oppg.length > 150, 'skal dekke tre kirke\u00e5r (' + oppg.length + ')');
	// fase 1 = kommende kirke\u00e5rsdag(er) frst
	assert.equal(oppg[0].fase, 'Kommende kirke\u00e5rsdag');
	assert.ok(oppg[0].dato >= IDAG && oppg[0].dato <= '2026-12-06', 'kommende dag er innen en uke');
	// s kommer resten av kirke\u00e5ret i dato-rekkeflge
	const rest = oppg.filter((o) => o.fase === 'Resten av kirkeåret');
	assert.ok(rest.length > 50, 'resten av kirkeåret: ' + rest.length);
	const datoer = rest.map((o) => o.dato);
	assert.deepEqual(datoer, [...datoer].sort());
	// ved rstart finnes ingen 'tidligere dager' — prv midt i kirkeåret
	const midt = byggCacheOppgaver({}, '2027-02-14');
	const forrige = midt.filter((o) => o.fase === 'Tidligere dager dette kirkeåret');
	assert.ok(forrige.length > 10, 'midt i kirkeåret finnes tidligere dager: ' + forrige.length);
	const forsteFremtid = midt.findIndex((o) => o.fase === 'Resten av kirkeåret');
	const forsteTidligere = midt.findIndex((o) => o.fase === 'Tidligere dager dette kirkeåret');
	assert.ok(forsteTidligere > forsteFremtid, 'tidligere dager etter resten');
	// nabokirke\u00e5rene (andre rekker) til slutt
	const andre = oppg.filter((o) => o.fase === 'Andre tekstrekker');
	assert.ok(andre.length > 100, 'to nabokirke\u00e5r: ' + andre.length);
	// fase-navnene kommer i prioritert rekkeflge (faser uten treff hoppes over)
	const fasene = ['Kommende kirkeårsdag', 'Resten av kirkeåret', 'Tidligere dager dette kirkeåret', 'Dager med annen tekststruktur', 'Andre tekstrekker', 'Merkedager'];
	const faseRekke = [...new Set(oppg.map((o) => o.fase))];
	const indekser = faseRekke.map((f) => fasene.indexOf(f));
	assert.deepEqual([...indekser].sort((a, b) => a - b), indekser, 'fasene i prioritert rekkeflge');
	const midtFaser = [...new Set(midt.map((o) => o.fase))];
	assert.deepEqual(midtFaser, fasene, 'midt i kirkeåret kommer alle seks fasene');
});

test('byggCacheOppgaver: hopper over det som ligger i cachen', () => {
	const oppg = byggCacheOppgaver({}, IDAG);
	// cach alt fra fasene 1-3 (dette kirkeåret)
	const cache = {};
	for (const o of oppg) {
		if (o.fase === 'Kommende kirkeårsdag' || o.fase === 'Resten av kirkeåret' || o.fase === 'Tidligere dager dette kirkeåret') {
			cache[nokkel(o.dag, o.rekke)] = { rekke: o.rekke };
		}
	}
	const igjen = byggCacheOppgaver(cache, IDAG);
	assert.ok(igjen.length <= oppg.length - 70, 'dette kirkeåret er fjernet: ' + igjen.length + ' av ' + oppg.length);
	assert.ok(!igjen.some((o) => o.fase === 'Kommende kirkeårsdag'), 'kommende dag er cachet');
	assert.ok(!igjen.some((o) => o.fase === 'Resten av kirkeåret'), 'resten er cachet');
	// nabokirke\u00e5rene gjenst\u00e5r fortsatt
	assert.ok(igjen.some((o) => o.fase === 'Andre tekstrekker'), 'andre rekker gjenstår');
});

test('byggCacheOppgaver: annen struktur-flagges som festdag/unntak', () => {
	const oppg = byggCacheOppgaver({}, IDAG);
	const annen = oppg.filter((o) => o.fase === 'Dager med annen tekststruktur');
	assert.ok(annen.length > 0, 'det finnes festdager med annen struktur');
	// de ligger i nabokirke\u00e5rene (dette kirke\u00e5ret er allerede dekket av fase 1-3)
	assert.ok(annen.every((o) => o.dag.years !== '2026-2027'), 'nabokirkeår');
});

test('byggCacheOppgaver: ugyldig dato gir ingen oppgaver', () => {
	assert.deepEqual(byggCacheOppgaver({}, 'ikke-en-dato'), []);
});
