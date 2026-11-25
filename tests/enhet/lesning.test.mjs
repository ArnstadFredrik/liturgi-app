import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fyllLesning, referanseIInnledning } from '/Users/fredrikarnstad/05 projects/liturgi-app/src/lib/lit.js';

const MAL = {
  introAlts: [
    { label: 'Innledning', text: '[Første Lesetekst]' },
    { label: 'Innledning', text: '{{r}}ML | {{/r}}Det står skrevet i...' }
  ],
  avslutningAlts: [{ label: 'Avslutning', text: '{{r}}ML |{{/r}} Slik lyder Herrens ord' }]
};
const TEKST = { title: 'Et nådens år', text: '^{"1 } Herren Guds ånd er over meg.' };

test('lesning med malens struktur: bibeltekst i hoveddelen, referanse i innledningen', () => {
  const it = structuredClone(MAL);
  fyllLesning(it, 'Jes 61,1-3', TEKST);
  // hoveddelen = kun bibelteksten (+ fotnote)
  assert.match(it.text, /^Et nådens år\n\^\{"1 \} Herren/);
  assert.match(it.text, /BIBELREF \| Jes 61,1-3$/);
  // ingen flatet intro/outro i hoveddelen
  assert.ok(!it.text.includes('står skrevet'));
  assert.ok(!it.text.includes('Slik lyder'));
  // referansen inn i innledningens «...» som fullt boknavn + kapittel
  assert.equal(it.introAlts[1].text, '{{r}}ML | {{/r}}Det står skrevet i Jesaja, kapittel 61:');
  assert.equal(it.introAlts[0].text, '[Første Lesetekst]'); // plassholder røres ikke
  // valgt innledning var plassholderen -> den reelle innledningen velges automatisk
  assert.equal(it.selIntro, 1);
  // avslutningen kommer fra malen
  assert.equal(it.avslutningAlts[0].text, '{{r}}ML |{{/r}} Slik lyder Herrens ord');
});

test('evangelium: referanse inn i «etter ...»', () => {
  const it = { introAlts: [{ label: 'Innledning', text: '{{r}}L | {{/r}}Det står skrevet i evangeliet etter ...' }], avslutningAlts: [{ label: 'Avslutning', text: '{{r}}L |{{/r}} Slik lyder det Hellige evangelium' }] };
  fyllLesning(it, 'Luk 4,16-22a', TEKST, true);
  assert.equal(it.introAlts[0].text, '{{r}}L | {{/r}}Det står skrevet i evangeliet etter Lukas, kapittel 4:');
});

test('gjenbruk: eksisterende referanse erstattes ved ny henting, idempotent ellers', () => {
  const t = referanseIInnledning('{{r}}ML | {{/r}}Det står skrevet i Jes 61,1-3:', 'Åp 5,1-5');
  assert.equal(t, '{{r}}ML | {{/r}}Det står skrevet i Åp 5,1-5:');
  const t2 = referanseIInnledning('{{r}}ML | {{/r}}Det står skrevet i Jes 61,1-3:', 'Jes 61,1-3');
  assert.equal(t2, '{{r}}ML | {{/r}}Det står skrevet i Jes 61,1-3:');
});

test('uten mal-struktur (B&G): flat bygging beholdes', () => {
  const it = { text: '[Lesningstekst]' };
  fyllLesning(it, '1 Joh 1,9', null);
  assert.equal(it.text, '1 Joh 1,9'); // referansen erstatter plassholderen
  const it2 = { text: '' };
  fyllLesning(it2, 'Sal 103,1', TEKST);
  assert.ok(it2.text.startsWith('{{r}}ML |{{/r}} Det står skrevet i Salmenes bok, kapittel 103:'));
	assert.ok(it2.text.endsWith('{{r}}ML |{{/r}} Slik lyder Herrens ord.'));
});

test('plassholder i tekst beholder malens egen innledning/avslutning', () => {
  const it = { text: '{{r}}L |{{/r}} Hør:\n[Lesningstekst]\n{{r}}L |{{/r}} Slik lyder.', introAlts: [], avslutningAlts: [] };
  fyllLesning(it, '1 Joh 1,9', TEKST);
  assert.match(it.text, /Hør:\nEt nådens år\n\^\{"1 \}/s);
  assert.match(it.text, /Slik lyder\.$/s);
});
