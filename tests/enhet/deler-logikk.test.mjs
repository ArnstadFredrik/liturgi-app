import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	secAlternativer, erStyrt, includeItem, includeSection,
	malAlternativer, filterTemplateItems, filterValgfrie
} from '../../src/lib/deler-logikk.js';

/** Alternativ/variasjon-logikk for hoveddeler OG enkeltledd:
 *  - hoveddel styrt av alternativ/variasjon → ALLE ledd følger med
 *  - hoveddel uten merke → alternativ/variasjon gjelder per ledd
 *  - valgfrie ledd (optional) tas bare med når de er valgt i «Opprett» */

const mal = {
	alternativer: ['dåp', 'konfirmasjon'],
	delGrupper: ['kirke', 'kapell'],
	sections: [
		{ // styrt hoveddel: alle ledd følger
			title: 'I. Samling', alternativer: ['dåp'],
			items: [{ id: 'a1', heading: 'Inngang' }, { id: 'a2', heading: 'Valgfri', optional: true }]
		},
		{ // ustyrta hoveddel: leddene merkes hver for seg
			title: 'II. Ordning',
			items: [
				{ id: 'b1', heading: 'Fast ledd' },
				{ id: 'b2', heading: 'Alternativt ledd', alternativer: ['konfirmasjon'] },
				{ id: 'b3', heading: 'Kapell-ledd', delGruppe: 'kapell' },
				{ id: 'b4', heading: 'Valgfritt ledd', optional: true }
			]
		}
	]
};

test('secAlternativer støtter array og gammel enkelt-streng', () => {
	assert.deepEqual(secAlternativer({ alternativer: ['dåp', ''] }), ['dåp']);
	assert.deepEqual(secAlternativer({ alternativ: 'dåp' }), ['dåp']);
	assert.deepEqual(secAlternativer({}), []);
	assert.deepEqual(secAlternativer(null), []);
});

test('erStyrt: merke med alternativ eller delGruppe styrer hoveddelen', () => {
	assert.equal(erStyrt({ alternativer: ['dåp'] }), true);
	assert.equal(erStyrt({ delGruppe: 'kapell' }), true);
	assert.equal(erStyrt({}), false);
	assert.equal(erStyrt({ alternativ: 'dåp' }), true); // bakoverkompatibelt
});

test('styrt hoveddel: alle ledd følger, ustyrt: leddene filtreres hver for seg', () => {
	const include = { dåp: true, konfirmasjon: true };
	// styrt hoveddel — ingen ledd-filtrering (filterTemplateItems brukes ikke)
	const valgt = 'kapell';
	const ustyrt = mal.sections[1];
	assert.deepEqual(
		filterTemplateItems(ustyrt.items, include, valgt).map((i) => i.id),
		['b1', 'b2', 'b3', 'b4'] // b2 med (konfirmasjon på), b3 med (kapell valgt); optional håndteres av filterValgfrie
	);
});

test('alternativ av ved oppretting fjerner merkede enkeltledd', () => {
	const include = { dåp: true, konfirmasjon: false };
	const ustyrt = mal.sections[1];
	assert.deepEqual(
		filterTemplateItems(ustyrt.items, include, 'kirke').map((i) => i.id),
		['b1', 'b4'] // b2 ut (alternativ av), b3 ut (annen variasjon); optional håndteres av filterValgfrie
	);
});

test('valgfrie ledd tas bare med når de er valgt', () => {
	const items = mal.sections[1].items;
	assert.deepEqual(filterValgfrie(items, new Set(['b4'])).map((i) => i.id), ['b1', 'b2', 'b3', 'b4']);
	assert.deepEqual(filterValgfrie(items, null).map((i) => i.id), ['b1', 'b2', 'b3']);
});

test('malAlternativer samler merker fra hoveddeler OG enkeltledd', () => {
	const kat = malAlternativer(mal);
	for (const t of ['dåp', 'konfirmasjon']) assert.ok(kat.includes(t), t);
	assert.ok(kat.includes('nattverd') === false);
	// tittel-regler fortsatt med
	assert.ok(malAlternativer({ sections: [{ title: 'Dåp', items: [] }] }).includes('dåp'));
});

test('includeSection: tittel-reglene (Dåp/nattverd) gjelder fortsatt hoveddeler', () => {
	assert.equal(includeSection({ title: 'Dåp' }, { dåp: false }), false);
	assert.equal(includeSection({ title: 'Dåp', alternativer: [] }, { dåp: true }), true);
	assert.equal(includeItem({ alternativer: ['dåp'] }, { dåp: false }), false);
	// tittel-regler skal IKKE gjelde enkeltledd
	assert.equal(includeItem({ heading: 'Dåp' }, { dåp: false }), true);
});
