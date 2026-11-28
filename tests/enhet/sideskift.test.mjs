import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildOutline, byggPdfSider } from '../../src/lib/export.js';

const svc = {
	name: 'Test',
	date: '',
	sections: [{
		title: 'I. Samling',
		items: [
			{ id: 'a1', type: 'tekst', heading: 'Første', enabled: true, text: 'Første leddets tekst som er lang nok til å fylle litt.' },
			{ id: 'a2', type: 'tekst', heading: 'Andre', enabled: true, sideskift: true, text: 'Andre leddet har sideskift før seg.' },
		],
	}],
};

test('buildOutline plasserer sideskift-merket før leddet', () => {
	const out = buildOutline(svc, true, {});
	const i = out.findIndex((e) => e.heading === 'sideskift');
	assert.ok(i > 0, 'sideskift-merket finnes');
	assert.equal(out[i + 1]?.heading, 'h3');
	assert.equal(out[i + 1]?.text, 'Andre');
});

test('byggPdfSider gir to sider med sideskift (og én uten)', () => {
	const med = byggPdfSider(svc, false, {});
	assert.equal(med.sider.length, 2);
	const uten = byggPdfSider({ ...svc, sections: [{ ...svc.sections[0], items: svc.sections[0].items.map((it) => ({ ...it, sideskift: undefined })) }] }, false, {});
	assert.equal(uten.sider.length, 1);
});
