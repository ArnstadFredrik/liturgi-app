import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

test('standardtema er lyst (light) i app-tilstanden', () => {
	const repo = path.join(os.homedir(), '05 projects', 'liturgi-app');
	const kilde = readFileSync(path.join(repo, 'src/lib/store.svelte.js'), 'utf8');
	const m = kilde.match(/theme: *'(light|dark)'/);
	assert.ok(m, 'theme-feltet finnes i app-tilstanden');
	assert.equal(m[1], 'light');
});
