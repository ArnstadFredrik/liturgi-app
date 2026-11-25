import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildOutline, stripNotat } from '../../src/lib/export.js';

/** @NOTAT regnes som instruksjon overalt: n\u00e5r \u00abvis instruksjoner\u00bb er av
 *  skal hele-linje @NOTAT/@n f\u00e5r bort fra ALLE tekstfelter \u2014 leddets tekst,
 *  innledning/avslutning og alternativer (der alternative-spesifikke
 *  instruksjoner ligger, jf. l\u00f8sning 2). N\u00e5r bryteren er p\u00e5 beholdes alt. */

const svc = {
	name: 'Test',
	sections: [{
		title: 'I. Samling',
		items: [{
			id: 'x1', type: 'tekst', heading: '1 D\u00e5p', instr: 'Felles instr', enabled: true, selAlt: 0,
			text: '',
			alts: [
				{ label: 'Ved d\u00e5p av born', text: '@NOTAT Ved d\u00e5p av born: fadrane svarar.\n{{r}}ML |{{/r}} Trur de?' },
				{ label: 'Annet', text: 'Vanlig tekst.\n@n annen instruksjon' },
			],
		}],
	}],
};

test('stripNotat fjerner @NOTAT- og @n-linjer og kollapser tomrom', () => {
	const t = stripNotat('F\u00f8rst.\n@NOTAT en instruksjon\n\nS\u00e5 dette.\n@n kort\nSlutt.');
	assert.equal(t, 'F\u00f8rst.\n\nS\u00e5 dette.\nSlutt.');
	assert.equal(stripNotat('uten notater'), 'uten notater');
	assert.equal(stripNotat(''), '');
});

test('buildOutline: visInstr av fjerner @NOTAT fra alternativer, on beholder', () => {
	const med = buildOutline(svc, true);
	const av = buildOutline(svc, false);
	const alle = (o) => o.filter((x) => x.text).map((x) => x.text).join('\n');
	assert.match(alle(med), /@NOTAT Ved d\u00e5p av born:/);
	// valgt alternativ er alts[0] — 'Annet' (med @n) får testes med selAlt 1
	const svc2 = { ...svc, sections: [{ ...svc.sections[0], items: [{ ...svc.sections[0].items[0], selAlt: 1 }] }] };
	assert.match(alle(buildOutline(svc2, true)), /@n annen instruksjon/);
	assert.doesNotMatch(alle(buildOutline(svc2, false)), /@NOTAT|@n\b/);
	assert.doesNotMatch(alle(av), /@NOTAT|@n\b/);
	assert.match(alle(av), /Trur de\?/); // selve teksten blir igjen
	// labelen (navnet formulert fra instruksjonen) følger vis instruksjoner:
	// skjules når bryteren er av, vises når den er på
	assert.doesNotMatch(alle(av), /Ved d\u00e5p av born/);
});
