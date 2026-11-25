import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formaterSalme } from '../../src/lib/lit.js';

test('formaterSalme: både Refreng- og Omkved-linjer pakkes i {{refreng}}', () => {
	const raa = [
		'T: Børn og unge',
		'M: Tekst og melodi: Noen',
		'',
		'1. Første vers her',
		'2. Andre vers her',
		'Refreng',
		'Her er refrenget',
		'',
		'3. Tredje vers',
		'Omkved:',
		'Her er omkvedet',
		'© Noen'
	].join('\n');
	const f = formaterSalme(raa);
	assert.ok(f.includes('{{refreng}}\nHer er refrenget\n{{/refreng}}'), f);
	assert.ok(f.includes('{{refreng}}\nHer er omkvedet\n{{/refreng}}'), f);
	// versene utenfor blokkene
	assert.ok(!f.includes('{{refreng}}\n2.'), f);
});

test('formaterSalme: (Omkved) med parentes gjenkjennes', () => {
	const f = formaterSalme('1. Vers\n(Omkved)\nRefrengtekst');
	assert.ok(f.includes('{{refreng}}\nRefrengtekst\n{{/refreng}}'), f);
});

test('formaterSalme: idempotent på allerede formatert salme', () => {
	const f1 = formaterSalme('1. Vers\nOmkved\nTekst');
	const f2 = formaterSalme(f1);
	assert.equal(f2, f1);
});
