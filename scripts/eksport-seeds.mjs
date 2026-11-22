#!/usr/bin/env node
// eksport-seeds.mjs — skriver seed-malene (BUILTIN_TEMPLATES + DEAKTIVERTE_MALER)
// til seeds/<id>.limal i repoet. Kjøres ved malendringer i data.js:
//   node scripts/eksport-seeds.mjs
// Seedene lastes ned av liturgi-limal-skillen (scripts/hent-siste.sh) og brukes
// som referanse-maler når agenten ikke kjører på maskinen med appen installert.
import { mkdirSync, writeFileSync, readdirSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BUILTIN_TEMPLATES, DEAKTIVERTE_MALER } from '../src/lib/data.js';

const roten = join(dirname(fileURLToPath(import.meta.url)), '..');
const maal = join(roten, 'seeds');
mkdirSync(maal, { recursive: true });

const alle = [...BUILTIN_TEMPLATES, ...(DEAKTIVERTE_MALER ?? [])];
for (const mal of alle) {
	writeFileSync(
		join(maal, `${mal.id}.limal`),
		JSON.stringify({ liturgiFormat: 1, kind: 'template', data: mal }, null, '\t')
	);
	console.log(`${mal.id}.limal`);
}

// rydd bort seed-filer som ikke lenger finnes i data.js
const gyldige = new Set(alle.map((mal) => `${mal.id}.limal`));
for (const fil of readdirSync(maal)) {
	if (!gyldige.has(fil)) {
		unlinkSync(join(maal, fil));
		console.log(`slettet ${fil} (finnes ikke i data.js lenger)`);
	}
}
