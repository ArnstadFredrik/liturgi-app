import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	FORB_STANDARD_MALER,
	FORB_KONTEKST_SAMPLE,
	byggForbKontekst,
	renderForbMal,
	forbInnhold,
	forbEkstern,
	migrerForbMal
} from '../../src/lib/forb-maler.js';

test('standardmalene gir ikke tomme filer mot eksempelkonteksten', () => {
	for (const navn of ['notat.md', 'tekstmeditasjon.md', 'preken.md']) {
		const innhold = forbInnhold(navn, null, FORB_KONTEKST_SAMPLE);
		assert.ok(innhold.trim().length > 10, navn + ' ble tom');
	}
});

test('notat.md viser navn, dato, rekke og b\u00f8nn (EJS)', () => {
	const md = forbInnhold('notat.md', null, FORB_KONTEKST_SAMPLE);
	assert.ok(md.includes('# Julaften'));
	assert.ok(md.includes('torsdag 24. desember 2026'));
	assert.ok(md.includes('A \u00b7 Jul'));
	assert.ok(md.includes('## Dagens b\u00f8nn'));
	assert.ok(!md.includes('<%'), 'ingen urendererte EJS-tagger');
});

test('meditasjonsfilen har tekstseksjoner med fallback ved manglende tekst (EJS)', () => {
	const md = forbInnhold('tekstmeditasjon.md', null, FORB_KONTEKST_SAMPLE);
	assert.ok(md.includes('## Evangelium'));
	assert.ok(md.includes('**Jesaja 9**'));
	assert.ok(md.includes('Kirke\u00e5ret med nettforbindelse')); // fallback for L1/L2
	assert.ok(!md.includes('<%'), 'ingen urendererte EJS-tagger');
});

test('brukermal (EJS) overstyrer standardmal; ukjente filer blir tomme', () => {
	const md = forbInnhold('notat.md', { 'notat.md': '# Egen mal for <%= dag.navn %>' }, FORB_KONTEKST_SAMPLE);
	assert.ok(md.startsWith('# Egen mal for Julaften'));
	assert.equal(forbInnhold('min-fil.md', null, FORB_KONTEKST_SAMPLE), '');
});

test('full EJS: lkke og betingelser virker i malene', () => {
	const mal = '<% for (const x of ["a", "b"]) { %>- <%= x.toUpperCase() %><% } %>';
	const ut = renderForbMal(mal, {});
	assert.ok(ut.includes('A') && ut.includes('B'));
});

test('ugyldig EJS-mal kaster (fangstes av genereringen)', () => {
	assert.throws(() => renderForbMal('<% if (aldri) { %> aldri lukket', FORB_KONTEKST_SAMPLE));
});

test('eldre mustache-maler migreres automatisk til EJS', () => {
	const gammel = '{{#tekster.E}}## Evangelium{{#harInnhold}}{{#tittel}} \u2014 **{{{tittel}}}**{{/tittel}}{{/harInnhold}}{{/tekster.E}} | {{dag.navn}}';
	const md = renderForbMal(gammel, FORB_KONTEKST_SAMPLE);
	assert.ok(md.includes('## Evangelium \u2014 **Jesaja 9**'), md);
	assert.ok(md.includes('| Julaften'));
	assert.ok(!md.includes('{{'));
});

test('migrering: enkle mustache-merker', () => {
	assert.equal(migrerForbMal('{{{dag.navn}}}'), '<%= dag.navn %>');
	assert.equal(migrerForbMal('{{#dag.bonn}}x{{/dag.bonn}}'), '<% if (dag.bonn) { %>x<% } %>');
	assert.equal(migrerForbMal('{{^dag.bonn}}tom{{/dag.bonn}}'), '<% if (!(dag.bonn)) { %>tom<% } %>');
});

test('eksempelkonteksten har alle dag-feltene teksten refererer', () => {
	const k = byggForbKontekst({ name: 'Palmes\u00f8ndag', date: '2027-03-21', color: 'R\u00f8d', series: 'II', prayer: 'B\u00f8nn' }, null, { start: '2026', slutt: '2027', rekke: 'Andre' });
	assert.equal(k.dag.navn, 'Palmes\u00f8ndag');
	assert.ok(k.dag.datoTekst.includes('s\u00f8ndag 21. mars'));
	assert.equal(k.dag.farge, 'R\u00f8d');
	assert.equal(k.dag.bonn, 'B\u00f8nn');
	assert.equal(k.tekster.E.refVis, '\u2014');
});

test('forbEkstern: docx-format bytter endelse, md beholder', () => {
	assert.equal(forbEkstern('notat.md', 'docx'), 'notat.docx');
	assert.equal(forbEkstern('notat.md', 'md'), 'notat.md');
});
