import { test } from 'node:test';
import assert from 'node:assert/strict';
import { byggSlidePlan, lysbildeTallFor } from '../../src/lib/export.js';

const tjeneste = {
	name: 'Test',
	date: '2026-11-29',
	sections: [
		{
			title: 'I. Samling',
			items: [
				{ id: 'a', type: 'tekst', heading: 'Hilsen', text: 'Kjære menighet.', enabled: true },
				{
					id: 'b', type: 'salme', heading: 'Inngangssalme', enabled: true,
					salmeNr: '2', salmeTittel: 'Her er det plass',
					text: 'Vers en her\n\nVers to her\n\nVers tre her'
				},
				{ id: 'c', type: 'tekst', heading: 'Samlingsbønn', text: 'La oss be.', enabled: true },
				{ id: 'd', type: 'tekst', heading: 'Kunngjøringer', text: 'Ikke på skjerm.', enabled: false }
			]
		}
	]
};

test('byggSlidePlan: tittelslide, tom-slide, salme-vers og nummerering', () => {
	const plan = byggSlidePlan(JSON.parse(JSON.stringify(tjeneste)), { tomSlide: true });
	// 1: tittel, 2: Hilsen, 3: tom, 4-6: salmens tre vers, 7: tom, 8: Samlingsbønn
	assert.equal(plan.length, 8);
	assert.equal(plan[0].big, true); // tittelsliden
	assert.equal(plan[1].nokkel, '0:0');
	assert.equal(plan[2].blank, true);
	assert.deepEqual(plan.filter((s) => s.nokkel === '0:1').map((s) => s.del), [0, 1, 2]);
	assert.equal(plan[0].nr, 1);
	assert.equal(plan[7].nr, 8);
	assert.equal(plan[7].nokkel, '0:2');
});

test('byggSlidePlan: uten tom-slide er rekkef\u00f8lgen kompakt', () => {
	const plan = byggSlidePlan(JSON.parse(JSON.stringify(tjeneste)), {});
	assert.equal(plan.length, 6); // tittel + Hilsen + 3 vers + Samlingsb\u00f8nn
	assert.ok(!plan.some((s) => s.blank));
});

test('lysbildeTallFor: ledd med egne slides f\u00e5r f\u00f8rste nummer med deler', () => {
	const plan = byggSlidePlan(JSON.parse(JSON.stringify(tjeneste)), { tomSlide: true });
	const tall = lysbildeTallFor(plan, JSON.parse(JSON.stringify(tjeneste)));
	// Hilsen: egen slide 2
	assert.deepEqual(tall['0:0'], [{ n: 2, del: 0 }]);
	// salmen: versene f\u00e5r 4, 5, 6
	assert.deepEqual(tall['0:1'].map((t) => t.n), [4, 5, 6]);
	// Samlingsb\u00f8nn: slide 8
	assert.deepEqual(tall['0:2'], [{ n: 8, del: 0 }]);
});

test('lysbildeTallFor: av-skjerm-ledd f\u00f8r et synlig ledd f\u00e5r blank-nummeret', () => {
	const skjerm = JSON.parse(JSON.stringify(tjeneste));
	skjerm.sections[0].items[3].enabled = false; // kunngj\u00f8ringene ikke p\u00e5 skjerm
	skjerm.sections[0].items.push({ id: 'e', type: 'tekst', heading: 'Velsignelse', text: 'Herren velsigne deg.', enabled: true });
	const plan = byggSlidePlan(skjerm, { tomSlide: true });
	const m = JSON.parse(JSON.stringify(tjeneste)); // manuset har kunngj\u00f8ringene med
	m.sections[0].items.push({ id: 'e', type: 'tekst', heading: 'Velsignelse', text: 'Herren velsigne deg.', enabled: true });
	const tall = lysbildeTallFor(plan, m);
	// velsignelsens f\u00f8rste slide = 10 (etter Samlingsb\u00f8nn 8 og blank 9) \u2192 kunngj\u00f8ringene = 9
	assert.deepEqual(tall['0:3'], [{ n: 9, del: 0 }]);
	assert.deepEqual(tall['0:4'], [{ n: 10, del: 0 }]);
});

test('lysbildeTallFor: av-skjerm-ledd etter siste slide f\u00e5r ingen tall', () => {
	const m = JSON.parse(JSON.stringify(tjeneste));
	m.sections[0].items[3].enabled = true; // kunngj\u00f8ringene sist, ikke p\u00e5 skjerm
	const plan = byggSlidePlan(JSON.parse(JSON.stringify(tjeneste)), { tomSlide: true });
	const tall = lysbildeTallFor(plan, m);
	assert.ok(!('0:3' in tall)); // ingenting vises etter siste slide (som eksempelet)
});

test('lysbildeTallFor: deaktiverte ledd f\u00e5r ingen tall (ikke i manuset)', () => {
	const plan = byggSlidePlan(JSON.parse(JSON.stringify(tjeneste)), { tomSlide: true });
	const tall = lysbildeTallFor(plan, JSON.parse(JSON.stringify(tjeneste)));
	assert.ok(!('0:3' in tall));
});
