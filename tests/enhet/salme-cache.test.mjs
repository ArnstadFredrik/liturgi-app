import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// egen throwaway-db for testen
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'liturgi-salme-cache-'));
process.env.LITURGI_DB_DIR = dir;
const { cacheNoekkel, gyldighet, registrerBruk, cacheTekst, cacheTreff, lesCache, lesBruk, erLiteBrukt, ryddCache } =
	await import('../../electron/salme-cache.cjs');
const { dbSet } = await import('../../electron/db.cjs');
const nDager = (dager) => {
	const d = new Date(Date.now() - dager * 24 * 60 * 60 * 1000);
	const pad = (x) => String(x).padStart(2, '0');
	return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
};
const datoFor = nDager;

const valgt = {
	title: 'Herren er min hyrde', title2: '', tekst: 'T: Noen', melodi: 'M: Noen',
	rettighet: 'TONO', mediaid: 12345
};

test('cacheNoekkel: nummer fregr tittel og er stabil', () => {
	assert.equal(cacheNoekkel({ nr: ' 280 ', tittel: 'Noe' }), 'nr:280');
	assert.equal(cacheNoekkel({ tittel: '  Min  Salme ' }), 't:min salme');
});

test('cacheTreff: cachen gjelder i ubestemt tid', () => {
	// gamle hentinger forblir gyldige (ryddes frst nr de er lite brukt i 3 mnd)
	cacheTekst({ nr: '280' }, valgt, 'TEKST');
	assert.ok(cacheTreff({ nr: '280' }), 'treff uansett alder');
	assert.ok(cacheTreff({ nr: 'ikke-cachet' }) === null, 'ingen treff');
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

test('rydding: lite brukte salmer fjernes etter 3 mnd, brukte beholdes', () => {
	// lite brukt: cachet for lenge siden, ingen bruk de siste 3 mnd
	cacheTekst({ nr: '997' }, valgt, 'GAMMEL');
	const c0 = lesCache();
	c0['nr:997'].hentet = '2020-01-01'; // simulr gammel
	dbSet('salmeCache', c0);
	ryddCache();
	assert.equal(lesCache()['nr:997'], undefined, 'lite brukt og gammel => ryddet');
	// nylig brukt med gammel hentet beholdes
	cacheTekst({ nr: '995' }, valgt, 'BRUKT');
	const c1 = lesCache();
	c1['nr:995'].hentet = '2020-01-01';
	dbSet('salmeCache', c1);
	registrerBruk({ nr: '995' }, datoFor(5)); // brukt for 5 dager siden
	ryddCache();
	assert.ok(lesCache()['nr:995'], 'nylig brukt beholdes');
});

test('erLiteBrukt: uten bruk = lite brukt, med ny bruk = ikke', () => {
	assert.equal(erLiteBrukt(null), true);
	assert.equal(erLiteBrukt({ datoer: [], sist: '' }), true);
	assert.equal(erLiteBrukt({ datoer: [datoFor(5)], sist: datoFor(5) }), false);
});
