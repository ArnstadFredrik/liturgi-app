import { test } from 'node:test';
import assert from 'node:assert/strict';

/** finnMerker er ren funksjon, men ligger i Cm6Kilde.svelte (CM6-imports
 *  krever DOM). Kopien her dokumenterer kontrakten — hold de to i sync
 *  (flytt til felles modul om CM6 etableres i hovedredigeringen). */
const finnMerker = (text) => {
	const ut = [];
	if (!text) return ut;
	const linjer = text.split('\n');
	let off = 0;
	for (const linje of linjer) {
		let m = linje.match(/^@(NOTAT|n)\b/);
		if (m) ut.push({ from: off, to: off + linje.length, klasse: 'lit-notat' });
		if ((m = linje.match(/^((?:ML|P|KA|K|M|A|Prek|L)\s*\|)/))) {
			ut.push({ from: off, to: off + m[1].length, klasse: 'lit-rolle' });
		}
		if ((m = linje.match(/BIBELREF \| (\S.*)/))) {
			const fra = off + m.index + 'BIBELREF | '.length;
			ut.push({ from: fra, to: fra + m[1].length, klasse: 'lit-bibel' });
		}
		off += linje.length + 1;
	}
	return ut;
};

test('@NOTAT-linje får lit-notat over hele linjen', () => {
	const r = finnMerker('@NOTAT Klokkeringing');
	assert.deepEqual(r, [{ from: 0, to: 20, klasse: 'lit-notat' }]);
});

test('rollemerke L | får lit-rolle over merket', () => {
	const r = finnMerker('L | Vår Herre sier:');
	assert.deepEqual(r, [{ from: 0, to: 3, klasse: 'lit-rolle' }]);
});

test('BIBELREF-verdien får lit-bibel (merket fratrukket)', () => {
	const r = finnMerker('BIBELREF | Jes 61,1-3');
	assert.deepEqual(r, [{ from: 11, to: 21, klasse: 'lit-bibel' }]);
});

test('offsets over flere linjer summerer linjeskift', () => {
	const r = finnMerker('Første linje\nL | andre linje');
	assert.deepEqual(r, [{ from: 13, to: 16, klasse: 'lit-rolle' }]);
});
