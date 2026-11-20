import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import Database from 'better-sqlite3';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { bibSearch, bibSync, bibCounts, sigFor, openDb } from './hjelpere.mjs';

/** Tester bibliotekslogikken (bibSearch/bibSync/bibSig) mot en TEMPORÆR db —
 *  aldri brukerens ekte liturgi.db. */

let tmp;
before(() => {
	tmp = mkdtempSync(join(tmpdir(), 'liturgi-test-db-'));
	process.env.LITURGI_DB_DIR = tmp;
});
after(() => {
	rmSync(tmp, { recursive: true, force: true });
});

const rader = [
	{ seksjon: 'Samling', ledd: 'Inngangssalme', ledd_id: 'hg-2', alt_label: '', tekst: 'Herren er min hyrde' },
	{ seksjon: 'Ordet', ledd: 'Tekstgruppe I', ledd_id: 'gf-tg-1', alt_label: 'Sal 23', tekst: 'En salme av David.' },
	{ seksjon: 'Ordet', ledd: 'Tekstgruppe I', ledd_id: 'gf-tg-1', alt_label: 'Sal 121', tekst: 'Jeg løfter mine øyne' },
	{ seksjon: 'Prefasjoner', ledd: 'Kirkeårsprefasjoner', ledd_id: 'pref', alt_label: 'Advent', tekst: 'I sannhet verdig og rett …' }
];

test('bibSync legger inn rader og bibCounts rapporterer antall', async () => {
	const r = await bibSync('Testkilde', rader);
	assert.ok(r.ok, 'bibSync feilet: ' + (r.error ?? ''));
	const cnt = await bibCounts();
	assert.equal(cnt['Testkilde'], 4);
});

test('bibSearch: «salme» treffer ledd-navn, tomme tekster filtreres bort', async () => {
	// to rader med samme (ledd, alt_label) — bibSync nummererer nå i stedet for å feile;
	// begge er tomme og skal derfor ikke komme med i søketreffet
	await bibSync('Tomradekilde', [
		{ seksjon: 'Samling', ledd: 'Dåpssalme', ledd_id: 'tom-1', alt_label: '', tekst: '' },
		{ seksjon: 'Samling', ledd: 'Dåpssalme', ledd_id: 'tom-2', alt_label: '', tekst: '   ' }
	]);
	const treff = await bibSearch('salme');
	const tomme = treff.filter((r) => !(r.tekst ?? '').trim());
	assert.equal(tomme.length, 0, 'tomme rader kommer med i søket');
	assert.ok(treff.some((r) => r.ledd === 'Inngangssalme'), 'Inngangssalme ikke funnet');
	assert.ok(!treff.some((r) => r.kilde === 'Tomradekilde'), 'tomme Dåpssalme-rader kommer med');
});

test('bibSearch: ord i hvilken som helst rekkefølge + prefiks', async () => {
	const a = await bibSearch('prefasjon kirkeår');
	assert.ok(a.some((r) => r.ledd === 'Kirkeårsprefasjoner'));
	const b = await bibSearch('tekst');
	assert.ok(b.some((r) => r.ledd === 'Tekstgruppe I'));
});

test('bibSig: samme innhold gir samme hash uavhengig av radrekkefølge', async () => {
	const a = sigFor('Testkilde');
	// reverser radene i db-en og sjekk at hashen er lik
	const rows = openDb().prepare('SELECT rowid FROM bibliotek WHERE kilde = ? ORDER BY rowid').all('Testkilde');
	const oppdatert = openDb().transaction(() => {
		const stmt = openDb().prepare('UPDATE bibliotek SET ledd_id = ledd_id WHERE rowid = ?');
	});
	// enklere: slett og legg inn reversert, hashen skal bli lik
	const kilde = rader.map((r) => ({ ...r }));
	await bibSync('Testkilde', [...kilde].reverse());
	const b = sigFor('Testkilde');
	assert.equal(a.hash, b.hash, 'hash er rekkefølgeavhengig');
	// endret tekst → ny hash
	const endret = kilde.map((r, i) => (i === 0 ? { ...r, tekst: r.tekst + ' endret' } : r));
	await bibSync('Testkilde', endret);
	assert.notEqual(a.hash, sigFor('Testkilde').hash);
});

test('bibSync: duplikat (ledd, alt_label) nummereres i stedet for å feile', async () => {
	const r = await bibSync('Duplikatkilde', [
		{ seksjon: 'S', ledd: 'Eller', ledd_id: 'd1', alt_label: 'Eller', tekst: 'variant én' },
		{ seksjon: 'S', ledd: 'Eller', ledd_id: 'd1', alt_label: 'Eller', tekst: 'variant to' }
	]);
	assert.ok(r.ok, 'bibSync med duplikat-label feilet: ' + (r.error ?? ''));
	const cnt = await bibCounts();
	assert.equal(cnt['Duplikatkilde'], 2);
});
