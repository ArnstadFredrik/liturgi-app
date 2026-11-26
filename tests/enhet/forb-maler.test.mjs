import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	FORB_STANDARD_MALER,
	FORB_KONTEKST_SAMPLE,
	byggForbKontekst,
	renderForbMal,
	forbInnhold,
	forbEkstern
} from '../../src/lib/forb-maler.js';

test('standardmalene gir ikke tomme filer mot eksempelkonteksten', () => {
	for (const navn of ['notat.md', 'tekstmeditasjon.md', 'preken.md']) {
		const innhold = forbInnhold(navn, null, FORB_KONTEKST_SAMPLE);
		assert.ok(innhold.length > 20, navn + ' ble tom');
	}
});

test('notat.md viser navn, dato, rekke og b overn', () => {
	const md = forbInnhold('notat.md', null, FORB_KONTEKST_SAMPLE);
	assert.ok(md.includes('# Julaften'));
	assert.ok(md.includes('torsdag 24. desember 2026'));
	assert.ok(md.includes('A · Jul'));
	assert.ok(md.includes('## Dagens bønn'));
});

test('meditasjonsfilen har tekstseksjoner med fallback ved manglende tekst', () => {
	const md = forbInnhold('tekstmeditasjon.md', null, FORB_KONTEKST_SAMPLE);
	assert.ok(md.includes('## Evangelium'));
	assert.ok(md.includes('**Jesaja 9**'));
	assert.ok(md.includes('Kirkeåret med nettforbindelse')); // fallback for L1/L2
	assert.ok(!md.includes('{{')); // ingen urendererte malstrenger
});

test('brukermaal overstyrer standardmal; ukjente filer blir tomme', () => {
	const md = forbInnhold('notat.md', { 'notat.md': '# Egen mal for {{{dag.navn}}}' }, FORB_KONTEKST_SAMPLE);
	assert.ok(md.startsWith('# Egen mal for Julaften'));
	assert.equal(forbInnhold('min-fil.md', null, FORB_KONTEKST_SAMPLE), '');
});

test('ugyldig mal kaster (fangstes av genereringen)', () => {
	assert.throws(() => renderForbMal('{{#dag.navn}}aldri lukket', FORB_KONTEKST_SAMPLE));
});

test('eksempelkonteksten har alle dag-feltene teksten refererer', () => {
	const k = byggForbKontekst({ name: 'Palmesøndag', date: '2027-03-21', color: 'Rød', series: 'II', prayer: 'Bønn' }, null, { start: '2026', slutt: '2027', rekke: 'Andre' });
	assert.equal(k.dag.navn, 'Palmesøndag');
	assert.ok(k.dag.datoTekst.includes('søndag 21. mars'));
	assert.equal(k.dag.farge, 'Rød');
	assert.equal(k.dag.bonn, 'Bønn');
	assert.equal(k.tekster.E.refVis, '—');
});

test('forbEkstern: docx-format bytter endelse, md beholder', () => {
	assert.equal(forbEkstern('notat.md', 'docx'), 'notat.docx');
	assert.equal(forbEkstern('notat.md', 'md'), 'notat.md');
});
