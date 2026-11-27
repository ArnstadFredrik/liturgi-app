import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inflateRawSync } from 'node:zlib';
import { mdHtml } from '../../src/lib/md.js';
import { mdTilDocxBase64 } from '../../src/lib/md-til-docx.js';

function docxXml(b64) {
	const zip = Buffer.from(b64, 'base64');
	// let etter lokal filhode med navnet word/document.xml
	const navn = Buffer.from('word/document.xml');
	for (let i = 0; i < zip.length - 30; i++) {
		if (zip.readUInt32LE(i) !== 0x04034b50) continue; // PK\x03\x04
		const navnLen = zip.readUInt16LE(i + 26);
		const ekstraLen = zip.readUInt16LE(i + 28);
		const dataStart = i + 30 + navnLen + ekstraLen;
		const detteNavn = zip.subarray(i + 30, i + 30 + navnLen);
		if (detteNavn.equals(navn)) {
			const kmpLen = zip.readUInt32LE(i + 18); // komprimert strrelse
			const data = zip.subarray(dataStart, dataStart + kmpLen);
			return inflateRawSync(data).toString('utf8');
		}
	}
	return '';
}

test('hevede versnummer ^{N} blir sup i html (forh\u00e5ndsvisningen)', () => {
	const html = mdHtml('Tekst^{4} fortsetter^{7a}.');
	assert.ok(html.includes('<sup class="vers">4</sup>'), html);
	assert.ok(html.includes('<sup class="vers">7a</sup>'), html);
	assert.ok(!html.includes('^{'), 'r\u00e5 versnummer igjen');
});

test('hevede versnummer blir ekte Word-superscript i docx-omformer', async () => {
	const b64 = await mdTilDocxBase64('Tekst^{12} med nummer.');
	const xml = docxXml(b64);
	assert.ok(xml.includes('<w:vertAlign w:val="superscript"/>'), 'mangler superscript-run');
	assert.ok(xml.includes('>12<'), 'mangler versnummerteksten');
});

test('frontmatter vises som metadata-kort i forhåndsvisningen', () => {
	const html = mdHtml('---\ntittel: 4. s\u00f8ndag i fasten\n---\n\n# Innhold');
	assert.ok(html.includes('md-frontmatter'), html);
	assert.ok(html.includes('md-fm-nkkel') && html.includes('tittel'));
	assert.ok(!html.startsWith('<hr'), 'frontmatter ble hr');
});

test('docx: frontmatter-kortet bruker creme + Georgia + sidetall-footer', async () => {
	const b64 = await mdTilDocxBase64('---\nfortelling: jul\n---\n\nBr\u00f8dtekst.');
	const xml = docxXml(b64);
	assert.ok(xml.toUpperCase().includes('F6F1E7'), 'mangler creme');
	assert.ok(xml.includes('Georgia'), 'mangler Georgia');
	assert.ok(xml.includes('w:footerReference') || xml.toUpperCase().includes('PAGE'), 'mangler sidetall-footer');
});
