import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const genFil = path.join(rot, 'src', 'lib', 'generated', 'handbok-html.js');

test('generert pandoc-HTML finnes for alle dokumentene', () => {
	assert.ok(fs.existsSync(genFil), 'src/lib/generated/handbok-html.js mangler - kjr npm run handbok');
	const gen = fs.readFileSync(genFil, 'utf-8');
	for (const navn of ['brukerhandbokHtml', 'apiHtml', 'limal_formatHtml']) {
		const m = gen.match(new RegExp('export const ' + navn + ' = "(.*)";'));
		assert.ok(m, navn + ' mangler i generert fil');
		assert.ok(m[1].length > 5000, navn + ' ser tom ut');
		assert.ok(m[1].includes('<h1'), navn + ' mangler overskrift');
	}
});

test('TOC-seksjonen er strippet ut (vises i sidekolonnen i stedet)', () => {
	const gen = fs.readFileSync(genFil, 'utf-8');
	const m = gen.match(/^export const brukerhandbokHtml = "(.*)";$/m);
	const html = JSON.parse('"' + m[1] + '"');
	assert.ok(!html.includes('>Innholdsfortegnelsen<'), 'TOC-seksjonen skal vre borte');
});

test('anker-id-er er github-stil (TOC-lenker fungerer)', () => {
	const gen = fs.readFileSync(genFil, 'utf-8');
	const m = gen.match(/^export const brukerhandbokHtml = "(.*)";$/m);
	const html = JSON.parse('"' + m[1] + '"');
	assert.ok(html.includes('<h2 id="oversikt-modulene-i-appen">'), 'anker mangler');
});

test('pandoc-konverteringen kan gjenopprettes med npm run handbok', () => {
	// pdviser at scriptet finnes og refererer pandoc
	const skript = fs.readFileSync(path.join(rot, 'scripts', 'handbok-html.mjs'), 'utf-8');
	assert.ok(skript.includes('pandoc'));
});
