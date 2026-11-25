import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BOKER_TABELL, bibelBok, innledningsNavn } from '/Users/fredrikarnstad/05 projects/liturgi-app/src/lib/bibelboeker.js';

test('66 bøker i begge målformene, unike forkortelser', () => {
	assert.equal(BOKER_TABELL.length, 66);
	for (const sprak of ['nb', 'nn']) {
		const fork = BOKER_TABELL.map((r) => r[sprak + 'Fork']);
		const navn = BOKER_TABELL.map((r) => r[sprak + 'Navn']);
		assert.equal(new Set(fork).size, 66);
		assert.equal(new Set(navn).size, 66);
	}
});

test('referanse til alminnelig tekst: bokmål', () => {
	assert.equal(innledningsNavn('1 Mos 3,15-20'), 'Første Mosebok, kapittel 3');
	assert.equal(innledningsNavn('Jes 61,1-3'), 'Jesaja, kapittel 61');
	assert.equal(innledningsNavn('Sal 68,21'), 'Salmenes bok, kapittel 68');
	assert.equal(innledningsNavn('Sal 100'), 'Salmenes bok, kapittel 100');
	assert.equal(innledningsNavn('Høys 2,9-10a.13b-14'), 'Høysangen, kapittel 2');
	assert.equal(innledningsNavn('Rut 1,16b-17a'), 'Rut, kapittel 1');
});

test('referanse til alminnelig tekst: nynorsk', () => {
	assert.equal(innledningsNavn('Sal 23,1', 'nn'), 'Salmane, kapittel 23');
	assert.equal(innledningsNavn('Dom 6,12', 'nn'), 'Dommarane, kapittel 6');
	assert.equal(innledningsNavn('Apg 2,1-4', 'nn'), 'Apostelgjerningane, kapittel 2');
	assert.equal(innledningsNavn('Op 5,1-5', 'nn'), "Johannes' openberring, kapittel 5");
});

test('evangelium: navn uten «Evangeliet etter» (innledningen har det forfra)', () => {
	assert.equal(innledningsNavn('Luk 4,16-22a', 'nb', true), 'Lukas, kapittel 4');
	assert.equal(innledningsNavn('Matt 5,1-12', 'nb', true), 'Matteus, kapittel 5');
	assert.equal(innledningsNavn('Joh 15,9-12', 'nb', true), 'Johannes, kapittel 15');
});

test('flertydige forkortelser: lengste vinner, ordgrense respekteres', () => {
	assert.equal(innledningsNavn('1 Joh 1,9'), "Johannes' første brev, kapittel 1");
	assert.equal(innledningsNavn('Joh 3,16'), 'Evangeliet etter Johannes, kapittel 3');
	assert.equal(innledningsNavn('1 Sam 16,7'), 'Første Samuelsbok, kapittel 16');
	// fullt navn som referanse gjenkjennes via alias
	assert.equal(innledningsNavn('Høysangen 2,9'), 'Høysangen, kapittel 2');
});

test('alias «Salme» (liturgisk skrivemåte) i begge målformene', () => {
	assert.equal(innledningsNavn('Salme 23'), 'Salmenes bok, kapittel 23');
	assert.equal(innledningsNavn('Salme 91,1-2.4.9'), 'Salmenes bok, kapittel 91');
	assert.equal(innledningsNavn('Salme 139, 1–12. 23–24'), 'Salmenes bok, kapittel 139');
	assert.equal(innledningsNavn('Salme 130,1-5', 'nn'), 'Salmane, kapittel 130');
});

test('alias: fullt navn som referanse', () => {
	assert.equal(innledningsNavn('Jesaja 57,14–16'), 'Jesaja, kapittel 57');
	assert.equal(innledningsNavn('Første Mosebok 3,15'), 'Første Mosebok, kapittel 3');
	assert.equal(innledningsNavn('Amos 6,1'), 'Amos, kapittel 6');
	assert.equal(innledningsNavn('Høysangen 2,9'), 'Høysangen, kapittel 2');
});

test('alias: evangeliene uten «Evangeliet etter»', () => {
	assert.equal(innledningsNavn('Lukas 2,41-52'), 'Evangeliet etter Lukas, kapittel 2');
	assert.equal(innledningsNavn('Lukas 2,41-52', 'nb', true), 'Lukas, kapittel 2');
	assert.equal(innledningsNavn('Johannes 18,33–37', 'nb', true), 'Johannes, kapittel 18');
});

test('punktum-former («1. Kor.», «Matt.»)', () => {
	assert.equal(innledningsNavn('Matt. 6, 25-31. 33'), 'Evangeliet etter Matteus, kapittel 6');
	assert.equal(innledningsNavn('1. Kor. 13, 7-13'), "Paulus' første brev til korinterne, kapittel 13");
	assert.equal(innledningsNavn('1. Joh 4, 7-12'), "Johannes' første brev, kapittel 4");
	assert.equal(innledningsNavn('Joh. 14, 1-7'), 'Evangeliet etter Johannes, kapittel 14');
});

test('ukjent/avvikende referanse returneres uendret', () => {
	assert.equal(innledningsNavn('Ukjentbok 91,1-2'), 'Ukjentbok 91,1-2');
	assert.equal(innledningsNavn(''), '');
	assert.equal(innledningsNavn(null), null);
});

test('bibelBok returnerer navn og kapittel separat', () => {
	assert.deepEqual(bibelBok('1 Mos 3,15-20'), { navn: 'Første Mosebok', kapittel: '3' });
	assert.deepEqual(bibelBok('Esra 2'), { navn: 'Esra', kapittel: '2' });
	assert.equal(bibelBok('Ukjent 1,2'), null);
});
