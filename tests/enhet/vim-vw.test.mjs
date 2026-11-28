import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nyVimTilstand, vimKeydown } from '../../src/lib/vim.js';

/** v + w i visual er CHARWISE (som vim): utvalget gr til neste ords start,
 *  vwd sletter akkurat 'Først ' (inkludert trailende mellomrom). Testen
 *  låser adferden s den ikke linewise-fikses bort ved et senere tidspunkt. */
const ta = (value, pos) => ({
	value,
	selectionStart: pos,
	selectionEnd: pos,
	setSelectionRange(a, b, dir) { const p = dir === 'backward' ? b : a; this.selectionStart = p; this.selectionEnd = p; },
	dispatchEvent() {},
});
const tast = (key, T, st) => {
	const e = { key, preventDefault: () => {} };
	return vimKeydown(e, T, st, {});
};

test('v + w + d sletter charwise til neste ords start', () => {
	const st = nyVimTilstand();
	const T = ta('Først salmen deretter teksten', 0);
	tast('v', T, st);
	tast('w', T, st);
	tast('d', T, st);
	assert.equal(T.value, 'salmen deretter teksten');
	assert.equal(st.modus, 'normal');
});

test('2w i visual hopper to ord charwise', () => {
	const st = nyVimTilstand();
	const T = ta('Først salmen deretter teksten', 0);
	tast('v', T, st);
	tast('2', T, st);
	tast('w', T, st);
	assert.equal(st.vMarkoer, 13, '2w: start av «deretter»');
});

test('v + w + y kopierer charwise uten linjeskiftflagg', () => {
	const st = nyVimTilstand();
	const T = ta('Først salmen deretter', 0);
	tast('v', T, st);
	tast('w', T, st);
	tast('y', T, st);
	assert.equal(st.reg.linewise, false);
	assert.equal(st.reg.tekst, 'Først ');
});
