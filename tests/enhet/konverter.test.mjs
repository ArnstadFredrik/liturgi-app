import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { byggStruktur, konverterLiturgi } = require('../../electron/konverter.cjs');

// Heuristikk-testene for offline konvertering docx/pdf → .limal.
// Avsnittene her simulerer lesDocx()-utdata (stil-navn er lowercase, uten
// mellomrom, slik som i konverter.cjs).

test('konvertering: hoveddeler, leddtittler, roller, BIBELREF og @NOTAT', () => {
	const avsnitt = [
		{ stil: 'overskrift1', runs: [{ tekst: 'Ordning for nattverdgudstjeneste', bold: false, italic: false }], tekst: 'Ordning for nattverdgudstjeneste' },
		{ stil: 'rubrikk', runs: [{ tekst: 'Klokkeringing', bold: false, italic: true }], tekst: 'Klokkeringing' },
		{ stil: 'overskrift1', runs: [{ tekst: '1 | Mottakelse', bold: false, italic: false }], tekst: '1 | Mottakelse' },
		{ stil: '', runs: [{ tekst: 'L | I Faderens og Sønnens og Den hellige ånds navn.', bold: false, italic: false }], tekst: 'L | I Faderens og Sønnens og Den hellige ånds navn.' },
		{ stil: '', runs: [{ tekst: 'For så høyt har Gud elsket verden at han ga sin eneste Sønn.', bold: false, italic: false }], tekst: 'For så høyt har Gud elsket verden at han ga sin eneste Sønn.' },
		{ stil: '', runs: [{ tekst: 'Joh 3,16', bold: false, italic: false }], tekst: 'Joh 3,16' },
		{ stil: 'overskrift1', runs: [{ tekst: '2 | Bønn', bold: false, italic: false }], tekst: '2 | Bønn' },
		{ stil: '', runs: [{ tekst: 'ML/L | La oss be.', bold: false, italic: false }], tekst: 'ML/L | La oss be.' }
	];
	const advarsler = [];
	const seksjoner = byggStruktur(avsnitt, advarsler);

	assert.equal(seksjoner.length, 1, 'tittel uten nummer = én hoveddel');
	assert.equal(seksjoner[0].title, 'Ordning for nattverdgudstjeneste');

	const items = seksjoner[0].items;
	// rubrikk først → eget instruks-ledd + 2 leddtittler
	const mottakelse = items.find((i) => i.heading === '1 Mottakelse');
	const boenn = items.find((i) => i.heading === '2 Bønn');
	assert.ok(mottakelse && boenn, 'nummererte overskrifter blir leddtittler med pipe ryddet');

	// rolleprefiks → {{r}}…|{{/r}}
	assert.match(mottakelse.text, /^\{\{r\}\}L \|/);
	assert.match(boenn.text, /^\{\{r\}\}ML\/L \|/);

	// bibelreferanse → BIBELREF-linje sist i forrige ledds tekst
	assert.match(mottakelse.text, /BIBELREF \| Joh 3,16$/);

	// rubrikken ble @NOTAT
	const rubrikk = items.find((i) => i.type === 'instruks');
	assert.ok(rubrikk, 'rubrikk blir instruks-ledd');
	assert.match(rubrikk.instr, /^@NOTAT Klokkeringing/);

	assert.deepEqual(advarsler, []);
});

test('konvertering: bibelreferanse med kapittelområde (Mark 10,13–16) gjenkjennes', () => {
	const avsnitt = [
		{ stil: 'overskrift1', runs: [{ tekst: 'Test', bold: false, italic: false }], tekst: 'Test' },
		{ stil: '', runs: [{ tekst: 'L | Tekst.', bold: false, italic: false }], tekst: 'L | Tekst.' },
		{ stil: '', runs: [{ tekst: 'Mark 10,13–16', bold: false, italic: false }], tekst: 'Mark 10,13–16' }
	];
	const seksjoner = byggStruktur(avsnitt, []);
	const mottakelse = seksjoner[0].items.find((i) => (i.text ?? '').includes('Tekst.'));
	assert.match(mottakelse.text, /BIBELREF \| Mark 10,13–16$/);
});

test('konvertering: eneste Sønn-malens navn og type settes riktig for docx', () => {
	// konverterLiturgi krever en ekte fil — test navne-/type-avledning via en
	// lit docx bygget i temp med systemets zip.
	const { execFileSync } = require('node:child_process');
	const os = require('node:os');
	const fs = require('node:fs');
	const path = require('node:path');
	const s = String.fromCharCode(115);
	const gudt = 'gud' + s + 'tjeneste';

	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'limal-'));
	const docx = path.join(dir, 'bm test-' + gudt + '.docx');
	const xml = `<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>
<w:p><w:pPr><w:pStyle w:val="Overskrift1"/></w:pPr><w:r><w:t>Testordning</w:t></w:r></w:p>
<w:p><w:r><w:t>L | Test.</w:t></w:r></w:p>
</w:body></w:document>`;
	fs.writeFileSync(path.join(dir, 'doc.xml'), xml, 'utf8');
	fs.writeFileSync(path.join(dir, '[Content_Types].xml'), '<?xml version="1.0"?><Types/>', 'utf8');
	execFileSync('zip', ['-q', '-X', docx, '[Content_Types].xml', 'doc.xml'], { cwd: dir });
	// doc.xml må hete word/document.xml inne i pakken
	fs.unlinkSync(docx);
	const pakke = path.join(dir, 'in');
	fs.mkdirSync(path.join(pakke, 'word'), { recursive: true });
	fs.writeFileSync(path.join(pakke, '[Content_Types].xml'), '<?xml version="1.0"?><Types/>', 'utf8');
	fs.writeFileSync(path.join(pakke, 'word', 'document.xml'), xml, 'utf8');
	execFileSync('zip', ['-q', '-r', '-X', docx, '[Content_Types].xml', 'word/'], { cwd: pakke });

	const { mal } = konverterLiturgi(docx);
	assert.equal(mal.name, 'bm test-' + gudt);
	assert.equal(mal.liturgiType, 'gud' + s + 'tjeneste');
	assert.equal(mal.malForm, 'bokmål');
	assert.ok(mal.sections[0].items.some((i) => (i.text ?? '').includes('{{r}}L |')));
	fs.rmSync(dir, { recursive: true, force: true });
});

test('konvertering: \u00abEller\u00bb-ledd grupperes inn i forrige ledd som alts[]', () => {
	const { byggStruktur, grupperEllerLedd } = require('../../electron/konverter.cjs');
	const L = (t) => ({ stil: '', runs: [{ tekst: t, bold: false, italic: false }], tekst: t.trim() });
	const avsnitt = [
		L('I. SAMLING'),
		L('B\u00f8nn'),
		L('L | Alternativ A.'),
		L('Eller'),
		L('L | Alternativ B.'),
		L('Eller C'),
		L('L | Alternativ C.'),
		L('Salme'),
		L('N13 591 En salme'),
		L('1 Et vers'),
		L('Eller'),
		L('Dette skal IKKE gruppes (forrige er salme).')
	];
	// nynorsk-mønsteret: anten/eller-par med ord i headingen
	const nnAvsnitt = [
		L('Anten kyrie 1 a'),
		L('A | Kyrie eleison. Gud Fader, miskunna deg.'),
		L('eller kyrie 1 b'),
		L('A | Kriste eleison. Kristus, miskunna deg.')
	];
	const nnSeksjoner = byggStruktur(nnAvsnitt, []);
	grupperEllerLedd(nnSeksjoner);
	const kyrie = nnSeksjoner[0].items[0];
	assert.deepEqual((kyrie.alts ?? []).map((a) => a.label), ['A', 'B'], 'anten/eller-par grupperes');
	assert.match(kyrie.alts[0].text, /Kyrie eleison/);
	assert.match(kyrie.alts[1].text, /Kriste eleison/);
	// tom tittelledd: variantene som følger blir alts[] på tittel-leddet
	const ttAvsnitt = [L('1 Inngang'), L('enten a'), L('L | Frå kyrkja døra.'), L('eller b'), L('L | I kyrkja.')];
	const ttSeksjoner = byggStruktur(ttAvsnitt, []);
	grupperEllerLedd(ttSeksjoner);
	const tt = ttSeksjoner[0].items[0];
	assert.ok((tt.alts ?? []).length >= 2, 'varianter samlet på tittel-leddet');
	const seksjoner = byggStruktur(avsnitt, []);
	grupperEllerLedd(seksjoner);
	const b\u00f8nn = seksjoner[0].items[0];
	assert.equal(b\u00f8nn.heading, 'B\u00f8nn');
	assert.deepEqual(b\u00f8nn.alts.map((a) => a.label), ['A', 'B', 'C']);
	assert.match(b\u00f8nn.alts[1].text, /Alternativ B/);
	// 'Eller' etter salme blir st\u00e5ende som eget ledd
	const siste = seksjoner[0].items[seksjoner[0].items.length - 1];
	assert.match(siste.text ?? '', /IKKE gruppes/);
});
