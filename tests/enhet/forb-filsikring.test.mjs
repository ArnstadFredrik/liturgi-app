import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Statisk vekt: generering av prekenforberedelse-dokumenter skal ALDRI
 *  overskrive filer som ligger p\u00e5 disk. Filen electron/main.cjs er ikke
 *  testbar uten Electron, s\u00e5 som salmer-struktur-testen tester vi kilden. */
const rot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const main = readFileSync(join(rot, 'electron', 'main.cjs'), 'utf8');

test('forb:lag-prosjekt oppretter mappen uansett (mkdir recursive)', () => {
	const i = main.indexOf("'forb:lag-prosjekt'");
	assert.ok(i > 0, 'ingen forb:lag-prosjekt-handler');
	const blokk = main.slice(i, main.indexOf('forb:migrer', i));
	assert.match(blokk, /mkdirSync\([^)]*recursive: true/);
});

test('forb:lag-prosjekt skriver bare filer som IKKE finnes fra f\u00f8r', () => {
	const i = main.indexOf("'forb:lag-prosjekt'");
	const blokk = main.slice(i, main.indexOf('forb:migrer', i));
	// skrivingen må stå inne i existsSync-grenen (klipp med balansert klamme-telling)
	const startG = blokk.indexOf('if (!fs.existsSync(full)) {');
	assert.ok(startG >= 0, 'mangler existsSync-guard');
	let dybde = 0;
	let sluttG = -1;
	for (let i = startG; i < blokk.length; i++) {
		if (blokk[i] === '{') dybde++;
		else if (blokk[i] === '}') { dybde--; if (dybde === 0) { sluttG = i; break; } }
	}
	assert.ok(sluttG > startG, 'fant ikke slutt p guarden');
	const gren = blokk.slice(startG, sluttG + 1);
	assert.match(gren, /writeFileSync\(full/, 'guarden inneholder ikke skrivingen');
	const utenfor = blokk.replace(gren, '');
	assert.doesNotMatch(utenfor, /writeFileSync\(full/,
		'writeFileSync(full) finnes utenfor sikringen');
});

test('forb:lag-prosjekt rapporterer hvor mange filer som allerede fantes', () => {
	const i = main.indexOf("'forb:lag-prosjekt'");
	const blokk = main.slice(i, main.indexOf('forb:migrer', i));
	assert.match(blokk, /eksisterende/, 'svaret innholder ikke eksisterende-antall');
});
