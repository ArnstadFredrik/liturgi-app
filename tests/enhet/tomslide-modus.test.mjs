
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

test('smart: skjulte deler (intro/avslutning) gir blank, fortsatt maks ett mellom ledd', () => {
  const svc2 = {
    name: 'T2', sections: [{ title: 'I', items: [
      { id: 'a', type: 'tekst', heading: 'Lesning 1', text: 'Tekst a.', enabled: true, __skjultIntro: true },
      { id: 'b', type: 'tekst', heading: 'Syndsbekjennelse', text: 'Bekjennelse.', enabled: true, __skjultAvsl: true },
      { id: 'c', type: 'tekst', heading: 'Etterp\u00e5', text: 'Etterp\u00e5.', enabled: true },
    ] }]
  };
  const plan = byggSlidePlan(structuredClone(svc2), { tomSlideModus: 'smart' });
  const rekkef = plan.map((s) => s.blank ? 'TOM' : (s.notat || '').slice(0, 10));
  // ett blankt bilde: b hadde skjult avslutning -> blank f\u00f8r c.
  // (f\u00f8rste ledd f\u00e5r aldri blank f\u00f8r seg, som i 'alle'.)
  assert.equal(plan.filter((s) => s.blank).length, 1);
  assert.ok(rekkef[0].length === 0); // tittelslide
  assert.ok(rekkef.slice(1).some((r) => r.startsWith('Lesning')));
  // blanken ligger mellom b (skjult avslutning) og c
  assert.equal(rekkef[rekkef.length - 2], 'TOM');
  assert.ok(rekkef[rekkef.length - 1].startsWith('Etterp'));
  // 'alle' uendret: blanks mellom hvert ledd (2)
  const planAlle = byggSlidePlan(structuredClone(svc2), { tomSlideModus: 'alle' });
  assert.equal(planAlle.filter((s) => s.blank).length, 2);
});

test('smart: blank side til slutt n\u00e5r siste ledd har skjult avslutning', () => {
  const svc3 = {
    name: 'T3', sections: [{ title: 'I', items: [
      { id: 'a', type: 'tekst', heading: 'Velsignelsen', text: 'Herren velsigne deg.', enabled: true, __skjultAvsl: true },
    ] }]
  };
  const plan = byggSlidePlan(structuredClone(svc3), { tomSlideModus: 'smart' });
  assert.equal(plan.filter((s) => s.blank).length, 1);
  assert.equal(plan[plan.length - 1].blank, true); // blank til slutt
  assert.ok(!plan[plan.length - 2].blank); // innholdsslidene har ikke blank-flagget
  // 'alle' uten skjulte deler: ingen ekstra blank til slutt
  const svc4 = { name: 'T4', sections: [{ title: 'I', items: [
    { id: 'a', type: 'tekst', heading: 'Velsignelsen', text: 'Herren velsigne deg.', enabled: true } ] }] };
  assert.equal(byggSlidePlan(structuredClone(svc4), { tomSlideModus: 'smart' }).filter((s) => s.blank).length, 0);
});
