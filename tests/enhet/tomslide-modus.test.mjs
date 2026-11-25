
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { byggSlidePlan } from '/Users/fredrikarnstad/05 projects/liturgi-app/src/lib/export.js';

const svc = {
  name: 'T', sections: [{ title: 'I', items: [
    { id: 'a', type: 'tekst', heading: 'Inngangssalme', text: 'Salmevers.', enabled: true },
    { id: 'b', type: 'tekst', heading: 'Hilsen', text: 'Hilsen.', enabled: true },
    { id: 'c', type: 'tekst', heading: 'Dagens b\u00f8nn', text: 'B\u00f8nn.', enabled: false },
    { id: 'd', type: 'tekst', heading: 'Syndsbekjennelse', text: 'Bekjennelse.', enabled: true },
  ] }]
};

test('tomSlideModus: av/alle/smart', () => {
  const plan = (modus) => byggSlidePlan(structuredClone(svc), { tomSlideModus: modus });
  const antall = (modus) => plan(modus).filter((s) => s.blank).length;
  assert.equal(antall('av'), 0);
  // alle: tomt mellom a-b og b-d (2)
  assert.equal(antall('alle'), 2);
  // smart: KUN ett tomt mellom b og d (c er skjult mellom dem) \u2014 ikke mellom a og b
  assert.equal(antall('smart'), 1);
  const rekkefolge = plan('smart').map((s) => s.blank ? 'TOM' : (s.notat || '').slice(0, 12));
  const tomIdx = rekkefolge.indexOf('TOM');
  assert.match(rekkefolge[tomIdx - 1], /Hilsen/);
  assert.match(rekkefolge[tomIdx + 1], /Syndsbekjenn/);
  // bakoverkompatibilitet: gammel boolsk tomSlide
  assert.equal(byggSlidePlan(structuredClone(svc), { tomSlide: true }).filter((s) => s.blank).length, 2);
  assert.equal(byggSlidePlan(structuredClone(svc), { tomSlide: false }).filter((s) => s.blank).length, 0);
});
