import { test } from 'node:test';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
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

test('gravferd-2003: jordpåkastelse-seksjonene har delGruppe (tittel-uavhengig opprettelse)', () => {
	const gf = BUILTIN_TEMPLATES.find((t) => t.id === 'gravferd-2003');
	const gr = gf.sections.filter((s) => s.delGruppe === 'gravferd');
	const bi = gf.sections.filter((s) => s.delGruppe === 'bisettelse');
	assert.equal(gr.length, 1, 'nøyaktig én gravferd-del');
	assert.equal(bi.length, 1, 'nøyaktig én bisettelse-del');
});

test('gravferd-2003: delGrupper-listen (dynamiske grupper til Ny gravferd)', () => {
	const gf = BUILTIN_TEMPLATES.find((t) => t.id === 'gravferd-2003');
	assert.deepEqual(gf.delGrupper, ['gravferd', 'bisettelse']);
});

test('forbønn for borgerlig inngått ekteskap er av typen vigsel', () => {
	const forb = BUILTIN_TEMPLATES.find((t) => t.id === 'forb-borgerlig-ekteskap-2017');
	assert.equal(forb.liturgiType, 'vigsel');
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

test('ingen «gudtjeneste» uten s i kodebasen (kernel-skrivefelle)', () => {
	// NB: macOS grep -i behandler «gudtjeneste» og «gudstjeneste» som like
	// (locale-kollasjon) — derfor leses filene med node og testes med regex,
	// som skiller dem korrekt. Mønsteret (feilstavingen, UTEN s etter «gud»)
	// bygges ved kjøretid med String.fromCharCode slik at denne filen selv
	// aldri kan få feilstavingen innført av skrivefeil.
	const feil = new RegExp('gud' + String.fromCharCode(116) + 'jeneste', 'i');
	const root = fileURLToPath(new URL('../../', import.meta.url));
	const unntak = ['data.test.mjs', '/.svelte-kit/', '/build/', '/app/', '/node_modules/'];
	const treff = [];
	const vis = (sti) => {
		if (unntak.some((u) => sti.includes(u))) return;
		if (!/\.(js|cjs|svelte|css|mjs|md|html)$/.test(sti)) return;
		const linjer = readFileSync(sti, 'utf8').split('\n');
		linjer.forEach((l, idx) => {
			if (feil.test(l)) treff.push(sti.replace(root, '') + ':' + (idx + 1) + ': ' + l.trim().slice(0, 80));
		});
	};
	const gaa = (dir) => {
		for (const navn of readdirSync(dir)) {
			if (navn === 'node_modules' || navn === '.svelte-kit' || navn === 'build' || navn === 'app' || navn.startsWith('.')) continue;
			const sti = join(dir, navn);
			if (statSync(sti).isDirectory()) gaa(sti);
			else vis(sti);
		}
	};
	gaa(root);
	assert.deepStrictEqual(treff, [], 'funnet «gudtjeneste» uten s: ' + treff.join(' | '));
});

test('dynamisk bibeltekst: originalmalenes koblinger peker på gyldige ledd', () => {
	const gyldige = { L1: 'Første lesning', L2: 'Andre lesning', E: 'Evangelium' };
	const maler = BUILTIN_TEMPLATES.filter((t) => t.bibeltekster);
	assert.ok(maler.length >= 2, 'HG og Konfirmasjon skal ha bibeltekster-koblinger');
	for (const t of maler) {
		const leddIder = new Set(t.sections.flatMap((sec) => sec.items.map((it) => it.id)));
		for (const k of t.bibeltekster) {
			assert.ok(gyldige[k.lesning], `${t.name}: ukjent lesning ${k.lesning}`);
			assert.ok(leddIder.has(k.leddId), `${t.name}: kobling ${k.lesning} peker på manglende ledd ${k.leddId}`);
		}
	}
});

test('prompt() må alltid importeres fra modal.svelte.js (window.prompt krasjer i Electron)', () => {
	// window.prompt er ikke støttet i Electron — «Nytt hovedavsnitt» krasjet
	// stille fordi Item.svelte manglet prompt-import (22. nov).
	const root = fileURLToPath(new URL('../../', import.meta.url));
	function gaa(dir) {
		for (const navn of readdirSync(dir)) {
			if (navn === 'node_modules' || navn === '.svelte-kit' || navn === 'build' || navn === 'app' || navn.startsWith('.')) continue;
			const sti = join(dir, navn);
			if (statSync(sti).isDirectory()) gaa(sti);
			else if (/\.(svelte|js)$/.test(sti) && !sti.includes('modal.svelte.js')) {
				const innhold = readFileSync(sti, 'utf8');
				const kaller = (innhold.match(/(?<![\w.])prompt\s*\(/g) ?? []).length;
				if (!kaller) continue;
				const importerer = /import\s*\{[^}]*\bprompt\b[^}]*\}\s*from/.test(innhold);
				assert.ok(importerer, sti.replace(root, '') + ' kaller prompt() uten å importere den fra modal.svelte.js');
			}
		}
	}
	gaa(join(root, 'src'));
});


// ---- opprett-modulen (Ny gudtjeneste): type-klassifisering og listene ----
import { malType, malerForType, kanBrukes, malFormFor, TYPER } from '../../src/lib/maltyper.js';

test('opprett-modulen: malType klassifiserer ALLE maler i de tre typene', () => {
	for (const t of [...BUILTIN_TEMPLATES, ...DEAKTIVERTE_MALER]) {
		assert.ok(TYPER.includes(malType(t)), t.name + ': ukjent type «' + malType(t) + '»');
	}
});

test('opprett-modulen: gudtjeneste-listen viser originalmalene (ikke dåp-i-HG)', () => {
	const liste = malerForType(BUILTIN_TEMPLATES, 'gudstjeneste');
	const ider = liste.map((t) => t.id);
	// hver brukbar gudstjeneste-mal fra frøet skal være i listen — unntatt dåp-i-HG
	// (kun lenket del av HG, kanGudstjeneste=false) og deaktiverte maler
	for (const t of BUILTIN_TEMPLATES) {
		if (t.id.startsWith('dop-i-hovedgudstjenesten')) {
			assert.ok(!ider.includes(t.id), 'dåp-i-HG skal ikke være opprettingsmal');
			assert.strictEqual(t.kanGudstjeneste, false, 'dåp-i-HG mangler kanGudstjeneste=false');
			continue;
		}
		if (malType(t) === 'gudstjeneste' && kanBrukes) assert.ok(ider.includes(t.id), 'gudstjeneste-listen mangler ' + t.id);
	}
	// deaktiverte (Bakke og Gyland) kommer ikke fra frøet
	assert.ok(!liste.some((t) => t.id === 'bakke-gyland-2025'), 'deaktivert mal i listen');
	// dåp-i-egen lastes fra disk (brukerens mal) — den skal klassifiseres som gudtjeneste
	assert.strictEqual(malType({ name: 'Dåp i egen gudtjeneste (bokmål, 2017)' }), 'gudstjeneste');
});

test('opprett-modulen: vigsel- og gravferd-listene viser originalmalene', () => {
	const vigsel = malerForType(BUILTIN_TEMPLATES, 'vigsel').map((t) => t.id);
	for (const id of ['vigsel-2003', 'vigsel-2017', 'forb-borgerlig-ekteskap-2017']) {
		assert.ok(vigsel.includes(id), 'vigsel-listen mangler ' + id);
	}
	const gravferd = malerForType(BUILTIN_TEMPLATES, 'gravferd').map((t) => t.id);
	assert.ok(gravferd.includes('gravferd-2003'), 'gravferd-listen mangler gravferd-2003');
});

test('opprett-modulen: liturgiType-feltet vinner over navn-gjetningen', () => {
	assert.strictEqual(malType({ name: 'Vigsel (bokmål, 2003)' }), 'vigsel');
	assert.strictEqual(malType({ name: 'Ordning for gravferd (bokmål, 2003)' }), 'gravferd');
	assert.strictEqual(malType({ name: 'Ukjent navn' }), 'gudstjeneste');
	assert.strictEqual(malType({ name: 'Prestens notatblokk', liturgiType: 'vigsel' }), 'vigsel');
});

test('målform: manglende felt = bokmål; malerForType filtrerer på målform', () => {
	assert.strictEqual(malFormFor({}), 'bokmål');
	assert.strictEqual(malFormFor({ malForm: 'nynorsk' }), 'nynorsk');
	const nn = { id: 'x', name: 'Test (nynorsk)', malForm: 'nynorsk' };
	assert.deepStrictEqual(malerForType([nn, { id: 'y', name: 'Annen' }], 'gudstjeneste', 'nynorsk').map((t) => t.id), ['x']);
	assert.deepStrictEqual(malerForType([nn, { id: 'y', name: 'Annen' }], 'gudstjeneste', 'bokmål').map((t) => t.id), ['y']);
});

test('newServiceFromTemplate arver malens eksport-standarder (formater/valg/pptx)', () => {
	const kilde = fileURLToPath(new URL('../../src/lib/store.svelte.js', import.meta.url));
	const kode = readFileSync(kilde, 'utf8');
	for (const nokkel of ['eksportFormater', 'eksportValg', 'eksportPptx', 'eksportTomSlide']) {
		assert.ok(kode.includes(nokkel), 'newServiceFromTemplate mangler arv av ' + nokkel);
	}
	// arven må være dypkopi (JSON) for valg/pptx
	assert.ok(kode.includes('JSON.parse(JSON.stringify(tpl.eksportValg))'), 'eksportValg skal dypkopieres');
	assert.ok(kode.includes('JSON.parse(JSON.stringify(tpl.eksportPptx))'), 'eksportPptx skal dypkopieres');
});
