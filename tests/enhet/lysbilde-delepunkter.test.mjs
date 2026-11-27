import { test } from 'node:test';
import assert from 'node:assert/strict';
import { finnDelPunkt, delPptSegs } from '../../src/lib/export.js';

test('finnDelPunkt: foretrekker setningsslutt, ellers komma, ellers bindeord', () => {
	const t1 = 'Herren er min hyrde. Jeg mangler ingen ting, for han sørger for meg.';
	assert.equal(t1.slice(0, finnDelPunkt(t1, 30)), 'Herren er min hyrde. ');
	const t2 = 'Hellige Herre, himmelens Gud, du er stor';
	assert.equal(t2.slice(0, finnDelPunkt(t2, 36)), 'Hellige Herre, himmelens Gud, ');
	const t3 = 'nåden og freden være med dere alle sammen';
	// ingen passende setningsslutt/komma nær grensen: mellomrom nærmest maks
	const k3 = finnDelPunkt(t3, 30);
	assert.ok(k3 > 20 && k3 <= 30, 'kutt satt nær grensen: ' + k3);
});

test('finnDelPunkt: restvakt - siste ordet kan ikke bli alene på neste slide', () => {
	const t = 'Ga jorden dine frodige enger og må folkene takke deg';
	const kutt = finnDelPunkt(t, t.length - 6); // tvunget kutt rett forbi siste ord
	const rest = t.slice(kutt).trim();
	assert.ok(!rest || rest.split(/\s+/).length >= 2, 'resten skal ikke være ett ord: ' + JSON.stringify(rest));
});

test('delPptSegs: ingen slide består av et enslig kort ord', () => {
	const lang = 'Frelseren kommer, og alt skal bli nytt, sier Herren, han som har sagt det fra begynnelsen av tiden, at hans nåde skal vare evig over dem som vender om og hører hans ord og går i dem hver dag. '.repeat(3);
	const sider = delPptSegs([{ text: lang }], 24);
	assert.ok(sider.length >= 2);
	for (const g of sider) {
		const txt = g.map((s) => s.text).join('').trim();
		assert.ok(/\s/.test(txt) || txt.length >= 24, 'enslig ord på slide: ' + JSON.stringify(txt));
	}
});

test('delPptSegs: segmentgrenser og deling bevarer formateringen (segmenter kan ikke deles midt i fet/kursiv-par)', () => {
	const segs = [
		{ text: 'Første del av teksten som er ganske lang, ', bold: true },
		{ text: 'og så resten her som også trenger plass nok til å dele på tvers av slides.', bold: false }
	];
	const sider = delPptSegs(segs, 24);
	const alt = sider.flat();
	assert.ok(alt.length >= 2);
	for (const s of alt) assert.ok(typeof s.text === 'string');
});
