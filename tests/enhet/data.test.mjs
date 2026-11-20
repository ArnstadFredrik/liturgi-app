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
			assert.ok(Array.isArray(sec.items), `${t.name} / ${sec.title}: items mangler`);
			// tom seksjon er bare OK hvis den er lenket (dåpen i HG — bygges fra dåp-malen)
			if (!sec.__lenket) assert.ok(sec.items.length > 0, `${t.name} / ${sec.title}: tom seksjon`);
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

test('HG-ordningen: dåpsdelen er lenket til «Dåp i hovedgudstjenesten»', () => {
	const hg = BUILTIN_TEMPLATES.find((t) => t.id === 'hovedgudstjeneste2020');
	const dop = BUILTIN_TEMPLATES.find((t) => t.id === 'dop-i-hovedgudstjenesten-2017');
	assert.ok(hg && dop, 'begge malene finnes');
	assert.equal(dop.kanGudstjeneste, false, 'dåp-malen kan ikke brukes som gudstjenestemal');
	const dapSec = hg.sections.find((s) => s.__lenket);
	assert.ok(dapSec, 'HG har en __lenket seksjon (Dåp)');
	assert.equal(dapSec.items.length, 0, 'lenket seksjon er tom i frøet (innholdet bygges fra dåp-malen)');
	const dopLedd = dop.sections.flatMap((s) => s.items);
	assert.equal(dopLedd.length, 15, 'dåp-malen har 15 ledd');
	for (const it of dopLedd) assert.ok(it.id.startsWith('h-l-dap'), 'dåp-malens ledd-id-er: ' + it.id);
});

test('vigsel-malene: skriftlesningene har docx-bokstavene (2017: A-Y, 2003: A-T)', () => {
	forventet = { 'vigsel-2017': 25, 'vigsel-2003': 20 };
	for (const [id, antall] of Object.entries(forventet)) {
		const t = BUILTIN_TEMPLATES.find((x) => x.id === id);
		assert.ok(t, id + ' finnes');
		const sec = t.sections.find((x) => /^Skriftlesninger ved/.test(x.title));
		assert.ok(sec, id + ': skriftlesninger-listen finnes');
		const medBokstav = sec.items.filter((it) => /^[A-Z]$/.test(it.bokstav ?? ''));
		assert.equal(medBokstav.length, antall, id + ': ' + antall + ' bokstaver');
		const forventede = Array.from({ length: antall }, (_, i) => String.fromCharCode(65 + i));
		assert.deepEqual(medBokstav.map((it) => it.bokstav), forventede, id + ': sekvensielle A, B, C ...');
	}
	var forventet;
});

test('valgt-indeksene (selAlt/selIntro/selAvsl) peker innenfor rekkevidde', () => {
	// Item.svelte leser alts[selAlt].text — en ugyldig indeks krasjer hele treet
	for (const t of BUILTIN_TEMPLATES) {
		for (const sec of t.sections) {
			for (const it of sec.items) {
				for (const [liste, nokkel] of [['alts', 'selAlt'], ['introAlts', 'selIntro'], ['avslutningAlts', 'selAvsl']]) {
					const l = it[liste];
					if (Array.isArray(l) && l.length) {
						const v = it[nokkel];
						// undefined er OK (runtime fallbacker med ?? 0) — men et TALL
						// utenfor rekkevidden krasjer (alts[selAlt].text → undefined)
						assert.ok(v === undefined || (typeof v === 'number' && v >= 0 && v < l.length),
							`${t.name} / ${it.heading}: ${nokkel}=${JSON.stringify(v)} utenfor 0..${l.length - 1}`);
					}
				}
			}
		}
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
