import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { byggStruktur } = require('../../electron/konverter.cjs');

// Heuristikk for faktiske gudstjeneste-PDF-er (Flekkefjord-tilfellet):
// roller uten strek, N13-salmer, sidetall, copyright, versal-hoveddeler.

const L = (t) => ({ stil: '', runs: [{ tekst: t, bold: false, italic: false }], tekst: t.trim() });

test('pdf: sidetall strippes, versal-hoveddeler normaliseres, N13 blir salmeledd', () => {
	const avsnitt = [
		L('Gudstjeneste - 16.08.2026 11:00'),
		L('Sted: Flekkefjord kirke'),
		L('I.SAMLING'),
		L('Klokkeringing'),
		L('N13   591   Det skjer et under i verden   v.1-3'),
		L('T 1994, 1996 Gerd Grønvold Saue'),
		L('1 Det skjer et under i verden'),
		L('hver gang et barn blir til,'),
		L('1/ 16'),
		L('hver gang et barn blir til,'),
		L('II.ORDET'),
		L('Preken')
	];
	const advarsler = [];
	const seksjoner = byggStruktur(avsnitt, advarsler);
	assert.deepEqual(seksjoner.map((s) => s.title), ['I. SAMLING', 'II. ORDET']);
	assert.equal(seksjoner[0].items.some((i) => (i.text ?? '').includes('16.08.2026')), false, 'toppmetadata hoppes over');
	const salme = seksjoner[0].items.find((i) => i.type === 'salme');
	assert.ok(salme, 'N13-linje blir salmeledd');
	assert.equal(salme.salmeNr, '591');
	assert.equal(salme.salmeTittel, 'Det skjer et under i verden');
	const innhold = seksjoner[0].items.map((i) => (i.text ?? '') + (i.instr ?? '')).join('\n');
	assert.match(innhold, /@COPYRIGHT \| T 1994, 1996 Gerd Grønvold Saue/);
	assert.doesNotMatch(innhold, /^\d+\/ ?\d+$/m, 'sidetall strippes');
});

test('pdf: roller uten strek («L tekst», «Prest:», «Klokker / dåpsfølge»)', () => {
	const avsnitt = [
		L('I. SAMLING'),
		L('L  Kjære menighet.'),
		L('Nåde være med dere og fred fra Gud.'),
		L('Klokker / dåpsfølge  De bar små barn til ham.'),
		L('Prest:'),
		L('Guds fred være med dere.'),
		L('Alle  og fred på jorden.'),
		L('I dåpen tar Gud imot oss.'),
		L('Alle synger')
	];
	const seksjoner = byggStruktur(avsnitt, []);
	const tekst = seksjoner[0].items.map((i) => i.text ?? '').join('\n');
	assert.match(tekst, /\{\{r\}\}L \|/);
	assert.match(tekst, /\{\{r\}\}Klokker\/dåpsfølge \|/);
	assert.match(tekst, /\{\{r\}\}Prest \|{{\/r}}\s*\n?Guds fred/);
	assert.match(tekst, /\{\{r\}\}Alle \|{{\/r}} og fred på jorden/);
	assert.doesNotMatch(tekst, /\{\{r\}\}I \|/, '«I …» er ikke en rolle');
	// «Alle synger» er ikke rolle — blir tittel/rubrikk, aldri {{r}}
	const alleSyngerRolle = seksjoner[0].items.some((i) => (i.text ?? '').includes('{{r}}Alle |{{/r}} synger'));
	assert.equal(alleSyngerRolle, false);
});

test('pdf: bibelref klebet på linjeslutt og som egen linje', () => {
	const avsnitt = [
		L('II. ORDET'),
		L('L  For så høyt har Gud elsket verden at han ga sin Sønn, den enbårne, for'),
		L('at hver den som tror på ham, ikke skal gå fortapt, men ha evig liv. Joh3,16'),
		L('Første lesning v/klokker:      Neh    9,19-21'),
		L('Det står skrevet i Nehemjas bok:'),
		L('neh 9,19–21')
	];
	const seksjoner = byggStruktur(avsnitt, []);
	const tekst = seksjoner[0].items.map((i) => i.text ?? '').join('\n');
	assert.match(tekst, /men ha evig lif?.*\nBIBELREF \| Joh 3,16/m);
	assert.match(tekst, /BIBELREF \| Neh/);
	// «Evangelium: Matt 6,24-34»-tittel: ref flyttes ut
	const evg = seksjoner[0].items.find((i) => i.heading === 'Evangelium');
	if (evg) assert.match(evg.text, /BIBELREF \| Matt 6,24-34/);
});

test('pdf: salmevers uten N13-markør blir ikke titler; Amen/Omkved er tekst', () => {
	const avsnitt = [
		L('V. SENDELSE'),
		L('N13   899   Jeg tror på jordens forvandling'),
		L('T 1988 Eyvind Skeie'),
		L('1 Jeg tror på jordens forvandling'),
		L('en gang, en tid, et sted,'),
		L('Amen'),
		L('Omkved'),
		L('Ingen er for liten til å se Guds under.')
	];
	const seksjoner = byggStruktur(avsnitt, []);
	const titler = seksjoner[0].items.filter((i) => i.heading).map((i) => i.heading);
	assert.deepEqual(titler, [], 'vers, Amen og Omkved er aldri titler i salmer');
	const tekst = seksjoner[0].items.map((i) => i.text ?? '').join('\n');
	assert.match(tekst, /1 Jeg tror på jordens forvandling/);
	assert.match(tekst, /Amen/);
	assert.match(tekst, /Omkved/);
});
