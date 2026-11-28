import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('standardtema er lyst (light) i app-tilstanden', () => {
	const kilde = readFileSync(new URL('../../src/lib/store.svelte.js', import.meta.url), 'utf8');
	const m = kilde.match(/theme: *'(light|dark)'/);
	assert.ok(m, 'theme-feltet finnes i app-tilstanden');
	assert.equal(m[1], 'light');
});
