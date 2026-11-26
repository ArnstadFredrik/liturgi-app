import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normaliserForbFiler, lesForbFiler, FORB_FILER_STANDARD } from '../../src/lib/forb-filer.js';

test('standardlisten brukes uten lagret verdi', () => {
	assert.deepEqual(lesForbFiler(null), FORB_FILER_STANDARD);
	assert.deepEqual(lesForbFiler(undefined), FORB_FILER_STANDARD);
	assert.deepEqual(lesForbFiler('ikke json'), FORB_FILER_STANDARD);
});

test('trim, .md-endelse og duplikatfjerning', () => {
	const ut = normaliserForbFiler([' notat ', 'preken', 'PREKEN.MD', 'tekstmeditasjon.md', '']);
	assert.deepEqual(ut, ['notat.md', 'preken.md', 'tekstmeditasjon.md']);
});

test('tom liste gir standard (kan sl av)', () => {
	assert.deepEqual(normaliserForbFiler([]), FORB_FILER_STANDARD);
	assert.deepEqual(normaliserForbFiler([], { standardHvisTom: false }), []);
});

test('farlige navn avvises (stier), lange navnkortnes', () => {
	assert.deepEqual(normaliserForbFiler(['../x.md', 'a/b.md', 'c\\d.md'], { standardHvisTom: false }), []);
	const lang = normaliserForbFiler(['x'.repeat(200) + '.md'], { standardHvisTom: false });
	assert.equal(lang[0].length, 100);
});
