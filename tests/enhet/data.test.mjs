import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BUILTIN_TEMPLATES, DEAKTIVERTE_MALER } from '../../src/lib/data.js';
import { litHtml, litEditHtml, litLinjeHtml } from '../../src/lib/lit.js';

/** KRITISKE INVARIANTER i Item.svelte-greinene (brudd = Svelte-krasj ved mount
 *  → reaktiviteten dør stille → appen «fryser». Dette var frys-feilen 19. nov):
 *  1. ledd UTEN alts rendres i else-greinen som binder it.text UBETINGET →
 *     text MÅ være streng på slike ledd.
 *  2. ledd MED alts binder it.alts[selAlt] → selAlt MÅ være gyldig indeks.
 *  3. introAlts/avslutningAlts binder [selIntro]/[selAvsl] → gyldige indekser.
 *  4. instr bindes bare når it.instr er satt — tomt/undefined er ok. */
test('alle malene (8 + deaktiverte): ledd-strukturen uten undefined-bindinger', () => {
	const alle = [...BUILTIN_TEMPLATES, ...(DEAKTIVERTE_MALER ?? [])];
	const brudd = [];
	for (const t of alle) {
		for (const sec of t.sections) {
			for (const it of sec.items) {
				const sted = `${t.name} · ${it.heading}`;
				if (it.type === 'salme') {
					// salme-grenen: text er valgfri (bindes kun når Tekst er åpen), men alts må være gyldige
					if (Array.isArray(it.alts) && it.alts.length && (it.selAlt ?? 0) >= it.alts.length)
						brudd.push(`${sted}: salme selAlt utenfor`);
					continue;
				}
				const harAlts = Array.isArray(it.alts) && it.alts.length > 0;
				if (harAlts) {
					const sel = it.selAlt ?? 0;
					if (sel < 0 || sel >= it.alts.length) brudd.push(`${sted}: selAlt=${sel} utenfor ${it.alts.length}`);
					if (typeof it.alts[sel]?.text !== 'string') brudd.push(`${sted}: alts[selAlt].text er ikke streng`);
					for (const a of it.alts) if (typeof a.text !== 'string') brudd.push(`${sted}: alts-label ${a.label} uten tekst`);
				} else if (typeof it.text !== 'string') {
					// else-greinen binder it.text ubetinget — undefined krasjer
					brudd.push(`${sted}: verken alts eller text (else-greinen binder it.text)`);
				}
				if (it.introAlts?.length) {
					const sel = it.selIntro ?? 0;
					if (sel < 0 || sel >= it.introAlts.length || typeof it.introAlts[sel]?.text !== 'string')
						brudd.push(`${sted}: selIntro utenfor/uten tekst`);
				}
				if (it.avslutningAlts?.length) {
					const sel = it.selAvsl ?? 0;
					if (sel < 0 || sel >= it.avslutningAlts.length || typeof it.avslutningAlts[sel]?.text !== 'string')
						brudd.push(`${sted}: selAvsl utenfor/uten tekst`);
				}
				if ('instr' in it && typeof it.instr !== 'string') brudd.push(`${sted}: instr er ikke streng`);
			}
		}
	}
	assert.deepEqual(brudd, [], brudd.slice(0, 8).join('; '));
});

test('hver enkelt mal: seksjoner, ledd, headings og type finnes', () => {
	const alle = [...BUILTIN_TEMPLATES, ...(DEAKTIVERTE_MALER ?? [])];
	assert.ok(alle.length >= 8, 'forventet ≥8 maler, fant ' + alle.length);
	for (const t of alle) {
		assert.ok(t.name, `${t.id}: mangler name`);
		assert.ok(Array.isArray(t.sections) && t.sections.length > 0, `${t.name}: ingen seksjoner`);
		let ledd = 0;
		for (const sec of t.sections) {
			assert.ok(Array.isArray(sec.items) && sec.items.length > 0, `${t.name} / ${sec.title}: tom seksjon`);
			for (const it of sec.items) {
				ledd++;
				assert.ok(it.heading, `${t.name} / ${sec.title}: ledd uten heading`);
				assert.ok(['tekst', 'instruks', 'salme', 'lesning', 'bønn', 'preken', 'kunngjoring'].includes(it.type),
					`${t.name} / ${it.heading}: ukjent type ${it.type}`);
			}
		}
		assert.ok(ledd > 0, `${t.name}: null ledd`);
	}
});

test('unike mal-id-er og unike ledd-id-er (duplikat = keyed each-krasj)', () => {
	const alle = [...BUILTIN_TEMPLATES, ...(DEAKTIVERTE_MALER ?? [])];
	const ider = alle.map((t) => t.id);
	assert.equal(new Set(ider).size, ider.length, 'duplikat mal-id: ' + ider.filter((v, i, a) => a.indexOf(v) !== i).join(', '));
	for (const t of alle) {
		const leddIder = t.sections.flatMap((s) => s.items).map((i) => i.id);
		const dup = leddIder.filter((v, i, a) => a.indexOf(v) !== i);
		assert.equal(dup.length, 0, `${t.name}: duplikat ledd-id ${[...new Set(dup)].join(', ')}`);
	}
});

test('bibelalternativer i gravferdens skriftlesning: de seks nyeste finnes', () => {
	const gf = BUILTIN_TEMPLATES.find((t) => /gravferd/i.test(t.name));
	const it = gf.sections.flatMap((s) => s.items).find((i) => i.id === 'gf-18');
	assert.ok(it, 'gf-18 (17 Skriftlesning) finnes');
	const labels = it.alts.map((a) => a.label);
	for (const forventet of ['Sal 23', 'Sal 50,15', 'Sal 121', 'Matt 11,28', 'Matt 28,1-10', 'Åp 21,1-5', 'Sal 68,21', 'Åp 1,17b-18']) {
		assert.ok(labels.includes(forventet), 'mangler alternativ: ' + forventet);
	}
	for (const a of it.alts) {
		assert.ok((a.text ?? '').trim(), `alternativet ${a.label} er tomt`);
		// de seks nye (20. nov) bruker BIBELREF-linjen; de to opprinnelige har
		// referansen inne i teksten
		if (['Sal 23', 'Sal 50,15', 'Sal 121', 'Matt 11,28', 'Matt 28,1-10', 'Åp 21,1-5'].includes(a.label)) {
			assert.ok(a.text.includes('BIBELREF'), `alternativet ${a.label} mangler BIBELREF-linje`);
		}
	}
});

test('litHtml: rollemerker og chipstruktur rendres', () => {
	const ut = litHtml('{{r}}L |{{/r}} Herre, få oss til å se.');
	assert.ok(ut.includes('span class="role"'), 'rollemerke {{r}} blir ikke til span.role');
	assert.ok(ut.includes('Herre, få oss til å se.'), 'teksten mangler');
});

test('litEditHtml: linjedeling gir .et-linje-elementer', () => {
	const ut = litEditHtml('linje én\nlinje to');
	const ant = (ut.match(/et-linje/g) ?? []).length;
	assert.ok(ant >= 2, 'forventet ≥2 linjer, fikk ' + ant);
});

test('litLinjeHtml: punktliste prefiks + chip', () => {
	const ut = litLinjeHtml('- punkt ett');
	assert.ok(ut.includes('chip') || ut.includes('liste'), 'punktliste-prefiks ikke rendret som chip/liste');
});
