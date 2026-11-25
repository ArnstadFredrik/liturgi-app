import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// egen throwaway-db for testen
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'liturgi-salme-cache-'));
process.env.LITURGI_DB_DIR = dir;
const { cacheNoekkel, gyldighet, registrerBruk, cacheTekst, cacheTreff, lesCache, lesBruk } =
	await import('../../electron/salme-cache.cjs');
const valgt = {
	title: 'Herren er min hyrde', title2: '', tekst: 'T: Noen', melodi: 'M: Noen',
	rettighet: 'TONO', mediaid: 12345
};

test('cacheNoekkel: nummer fregr tittel og er stabil', () => {
	assert.equal(cacheNoekkel({ nr: ' 280 ', tittel: 'Noe' }), 'nr:280');
	assert.equal(cacheNoekkel({ tittel: '  Min  Salme ' }), 't:min salme');
});

test('cacheTreff: treff innenfor gyldighet, ingen etter gudstjenesten har passert', () => {
	// dato langt fram i tid = gyldig lenge
	cacheTekst({ nr: '280' }, valgt, 'TEKST', '2099-06-01', false);
	assert.ok(cacheTreff({ nr: '280' }), 'gyldig treff');
	// dato langt tilbake = utlp
	cacheTekst({ nr: '281' }, valgt, 'TEKST', '2020-01-01', false);
	assert.equal(cacheTreff({ nr: '281' }), null, 'utlp => ingen treff');
});

test('gyldighet: gudstjenestedato + dagen', () => {
	assert.equal(gyldighet('2026-11-29'), '2026-11-29');
	// tommel: gyldigheten er ikke fr datoen
	const g = gyldighet('');
	assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(g));
});

test('registrerBruk: antall telles, ofte brukte (3+) flagges', () => {
	const q = { nr: '999' };
	const n = (dager) => {
		const d = new Date(Date.now() - dager * 24 * 60 * 60 * 1000);
		const pad = (x) => String(x).padStart(2, '0');
		return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
	};
	assert.equal(registrerBruk(q, n(80)), false, 'frste gang');
	assert.equal(registrerBruk(q, n(50)), false, 'andre gang');
	assert.equal(registrerBruk(q, n(10)), true, 'tredje gang i 3 mnd = ofte');
	const b = lesBruk()['nr:999'];
	assert.equal(b.antall, 3);
});

test('cacheTekst: ofte brukte fr lang gyldighet', () => {
	const q = { nr: '998' };
	const n = (dager) => {
		const d = new Date(Date.now() - dager * 24 * 60 * 60 * 1000);
		const pad = (x) => String(x).padStart(2, '0');
		return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
	};
	for (const d of [80, 50, 10]) registrerBruk(q, n(d));
	cacheTekst(q, valgt, 'TEKST', '2026-08-01', true);
	const e = lesCache()['nr:998'];
	// 90 dager fremover fra i dag = langt fram i tid (ikke bare gudstjenestedatoen)
	const om90 = new Date(Date.now() + 85 * 24 * 60 * 60 * 1000);
	const pad = (x) => String(x).padStart(2, '0');
	assert.ok(e.gyldigTil >= om90.getFullYear() + '-' + pad(om90.getMonth() + 1) + '-' + pad(om90.getDate()),
		'ofte brukt => lang gyldighet: ' + e.gyldigTil);
	assert.equal(cacheTreff(q).tekst, 'TEKST');
});

test('cacheTekst: rydder utlpte entrer, beholder ofte brukte', () => {
	cacheTekst({ nr: '997' }, valgt, 'GAMMEL', '2020-01-01', false);
	cacheTekst({ nr: '996' }, valgt, 'OFTE', '2099-01-01', false);
	const n = (dager) => {
		const d = new Date(Date.now() - dager * 24 * 60 * 60 * 1000);
		const pad = (x) => String(x).padStart(2, '0');
		return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
	};
	for (const d of [80, 50, 10]) registrerBruk({ nr: '995' }, n(d));
	cacheTekst({ nr: '995' }, valgt, 'OFTE2', '2020-01-01', true);
	const c = lesCache();
	assert.equal(c['nr:997'], undefined, 'gammel og ubrukt skal ryddes');
	assert.ok(c['nr:996'], 'gyldig behandles');
	assert.ok(c['nr:995'], 'ofte brukt beholdes selv om dato er passert');
});
