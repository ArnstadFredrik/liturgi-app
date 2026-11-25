import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BOKER_TABELL, bibelBok, innledningsNavn } from '../../src/lib/bibelboeker.js';

test('75 bøker (66 kanoniske + 9 deuterokanoniske) i begge målformene, unike forkortelser', () => {
	assert.equal(BOKER_TABELL.length, 75);
	for (const sprak of ['nb', 'nn']) {
		const fork = BOKER_TABELL.map((r) => r[sprak + 'Fork']);
		const navn = BOKER_TABELL.map((r) => r[sprak + 'Navn']);
		assert.equal(new Set(fork).size, 75);
		assert.equal(new Set(navn).size, 75);
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

test('evangelium: navn uten «Evangeliet etter», kapittel med «i»', () => {
	assert.equal(innledningsNavn('Luk 4,16-22a', 'nb', true), 'Lukas i kapittel 4');
	assert.equal(innledningsNavn('Matt 5,1-12', 'nb', true), 'Matteus i kapittel 5');
	assert.equal(innledningsNavn('Joh 15,9-12', 'nb', true), 'Johannes i kapittel 15');
	assert.equal(innledningsNavn('Lukas 2,41-52', 'nb', true), 'Lukas i kapittel 2');
	assert.equal(innledningsNavn('Johannes 18,33–37', 'nb', true), 'Johannes i kapittel 18');
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
});

test('punktum-former («1. Kor.», «Matt.»)', () => {
	assert.equal(innledningsNavn('Matt. 6, 25-31. 33'), 'Evangeliet etter Matteus, kapittel 6');
	assert.equal(innledningsNavn('1. Kor. 13, 7-13'), "Paulus' første brev til korinterne, kapittel 13");
	assert.equal(innledningsNavn('1. Joh 4, 7-12'), "Johannes' første brev, kapittel 4");
	assert.equal(innledningsNavn('Joh. 14, 1-7'), 'Evangeliet etter Johannes, kapittel 14');
});

test('engelske aliaser (logos.com): GT', () => {
	assert.equal(innledningsNavn('Gen 1,1'), 'Første Mosebok, kapittel 1');
	assert.equal(innledningsNavn('Gen. 1,1'), 'Første Mosebok, kapittel 1');
	assert.equal(innledningsNavn('Ex 20,1'), 'Andre Mosebok, kapittel 20');
	assert.equal(innledningsNavn('Ps 23,1'), 'Salmenes bok, kapittel 23');
	assert.equal(innledningsNavn('Psalm 91,1'), 'Salmenes bok, kapittel 91');
	assert.equal(innledningsNavn('Prov 3,5'), 'Salomos ordspråk, kapittel 3');
	assert.equal(innledningsNavn('Isa 53,4'), 'Jesaja, kapittel 53');
	assert.equal(innledningsNavn('1 Kgs 3,9'), 'Første Kongebok, kapittel 3');
	assert.equal(innledningsNavn('II Chron 7,14'), 'Andre Krønikebok, kapittel 7');
});

test('engelske aliaser (logos.com): NT', () => {
	assert.equal(innledningsNavn('Mt 5,1'), 'Evangeliet etter Matteus, kapittel 5');
	assert.equal(innledningsNavn('Mt 5,1', 'nb', true), 'Matteus i kapittel 5');
	assert.equal(innledningsNavn('Mk 16,15'), 'Evangeliet etter Markus, kapittel 16');
	assert.equal(innledningsNavn('Jn 3,16'), 'Evangeliet etter Johannes, kapittel 3');
	assert.equal(innledningsNavn('Ac 2,1'), 'Apostlenes gjerninger, kapittel 2');
	assert.equal(innledningsNavn('1 Cor 13,4'), "Paulus' første brev til korinterne, kapittel 13");
	assert.equal(innledningsNavn('I Jn 4,8'), "Johannes' første brev, kapittel 4");
	assert.equal(innledningsNavn('2 Th 2,1'), "Paulus' andre brev til tessalonikerne, kapittel 2");
	assert.equal(innledningsNavn('Jas 1,5'), 'Jakobs brev, kapittel 1');
	assert.equal(innledningsNavn('Rev 21,1'), "Johannes' åpenbaring, kapittel 21");
	assert.equal(innledningsNavn('Rev 21,1', 'nn'), "Johannes' openberring, kapittel 21");
});

test('deuterokanoniske bøker (bibel.no nb/nn + engelske former)', () => {
	assert.equal(innledningsNavn('Tob 1,3'), 'Tobit, kapittel 1');
	assert.equal(innledningsNavn('Tb 1,3'), 'Tobit, kapittel 1');
	assert.equal(innledningsNavn('Judit 1,1'), 'Judit, kapittel 1');
	assert.equal(innledningsNavn('Jdt 1,1'), 'Judit, kapittel 1');
	assert.equal(innledningsNavn('Gr Est 1,1'), 'Den greske Ester-boken, kapittel 1');
	assert.equal(innledningsNavn('Gr Est 1,1', 'nn'), 'Den greske Ester-boka, kapittel 1');
	assert.equal(innledningsNavn('Wisd of Sol 3,1'), 'Visdommen, kapittel 3');
	assert.equal(innledningsNavn('Visd 3,1', 'nn'), 'Visdomsboka, kapittel 3');
	assert.equal(innledningsNavn('Ecclus 6,5'), 'Sirak, kapittel 6');
	assert.equal(innledningsNavn('Sir 6,5'), 'Sirak, kapittel 6');
	assert.equal(innledningsNavn('Bar 3,1'), 'Baruk, kapittel 3');
	assert.equal(innledningsNavn('Ep Jer 1,1'), 'Jeremias brev, kapittel 1');
	assert.equal(innledningsNavn('1 Macc 1,1'), 'Første Makkabeerbok, kapittel 1');
	assert.equal(innledningsNavn('2 Macc 7,1'), 'Andre Makkabeerbok, kapittel 7');
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
