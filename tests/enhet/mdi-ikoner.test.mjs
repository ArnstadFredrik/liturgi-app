import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/** IKON-INVARIANT: alle mdi('navn')-kall i src/ må finnes i mdi.js.
 *  Mangler et nøkkel, returnerer mdi() en tom streng → ikonet blir usynlig
 *  (f.eks. chevronen i DelerTabell som «forsvant» 24. nov). */

const rot = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'src');
const mdiKilde = readFileSync(join(rot, 'lib', 'mdi.js'), 'utf8');

function samleFiler(dir, ut = []) {
	for (const navn of readdirSync(dir)) {
		const sti = join(dir, navn);
		if (statSync(sti).isDirectory()) samleFiler(sti, ut);
		else if (/\.(svelte|js)$/.test(navn) && !navn.endsWith('.svelte.js') || navn.endsWith('.svelte')) {
			if (navn.endsWith('.js') || navn.endsWith('.svelte')) ut.push(sti);
		}
	}
	return ut;
}

const nokler = new Set([...mdiKilde.matchAll(/"([a-z0-9-]+)":\s*"/g)].map((m) => m[1]));

const brukte = new Set();
for (const sti of samleFiler(rot)) {
	const inn = readFileSync(sti, 'utf8');
	// mdi( … )-kall: finn det balanserte parentesuttrykket og hent quoted
	// tokens inni det (ikke klassenavn o.l. etter kallet på samme linje)
	for (const linje of inn.split('\n')) {
		let idx = linje.indexOf('mdi(');
		while (idx !== -1) {
			let dyp = 0, slutt = -1;
			for (let i = idx + 3; i < linje.length; i++) {
				if (linje[i] === '(') dyp++;
				else if (linje[i] === ')') { dyp--; if (dyp === 0) { slutt = i; break; } }
			}
			if (slutt === -1) break;
			const kall = linje.slice(idx, slutt);
			for (const m of kall.matchAll(/['"]([a-z][a-z0-9-]+)['"]/g)) brukte.add(m[1]);
			idx = linje.indexOf('mdi(', slutt);
		}
	}
}

test('alle ikoner brukt i koden finnes i mdi.js', () => {
	const mangler = [...brukte].filter((n) => !nokler.has(n));
	assert.deepEqual(mangler, [], 'mdi() returnerer tomt for: ' + mangler.join(', '));
});

test('mdi() gir tom streng (ikke crash) for ukjent nøkkel', async () => {
	const { mdi } = await import('../../src/lib/mdi.js');
	assert.equal(mdi('finnes-ikke', 14), '');
	assert.ok(mdi('chevron-right', 14).includes('<svg'));
	assert.ok(mdi('subdirectory-arrow-right', 13).includes('<svg'));
});
