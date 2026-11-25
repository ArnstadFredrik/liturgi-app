import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const fil = path.join(rot, 'electron', 'salmer.cjs');
const kilde = fs.readFileSync(fil, 'utf-8');

test('salmer.cjs: sesjonslaget er intakt (loggInn/sikreSesjon/hent)', () => {
	// regression: refaktoren 25.11 slettet hele sesjonslaget og ga
	// "sikreSesjon is not defined" ved salmehenting
	for (const fn of ['function lagreCookies', 'function cookieHeader', 'async function hent(',
		'function erInnloggetSide', 'async function loggInn', 'async function sikreSesjon',
		'async function hentMedReLogin', 'async function soek', 'async function soekOgVelg',
		'async function leggIKurv', 'async function registrerOgHentTekst', 'async function registrerValgte']) {
		assert.ok(kilde.includes(fn), fn + ' mangler i salmer.cjs');
	}
});

test('salmer.cjs: cache- og k-funksjoner er koblet til', () => {
	for (const fn of ['registrerIBakgrunn', 'function leggIKo', 'async function flushKo']) {
		assert.ok(kilde.includes(fn), fn + ' mangler');
	}
	for (const ipc of ["ipcMain.handle('salme:hent'", "ipcMain.handle('salme:hent-flere'",
		"ipcMain.handle('salme:ko-flush'", "ipcMain.handle('salme:ko-status'"]) {
		assert.ok(kilde.includes(ipc), ipc + ' mangler');
	}
});

test('salmer.cjs: definerer ikke navnekonflikter med salme-cache.cjs', () => {
	// cacheTreff/cacheNoekkel skal komme fra require, ikke vre redefinert lokalt
	const lokale = [...kilde.matchAll(/(?:async )?function (cache\w+)/g)].map((m) => m[1]);
	assert.deepEqual(lokale, [], 'cache-funksjoner skal ikke redefineres i salmer.cjs');
});
