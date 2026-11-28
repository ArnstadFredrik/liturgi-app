import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nyVimTilstand, vimKeydown } from '../../src/lib/vim.js';

/** ":" i vim-normal skal vre en gate til kommandopaletten (ekstra.palett). */
const tast = (key, st, ekstra) => {
	const e = { key, preventDefault: () => {}, };
	return vimKeydown(e, { value: 'Hei på deg', selectionStart: 1, setSelectionRange: () => {}, dispatchEvent: () => {} }, st, ekstra);
};

test('viminal: ":" rekurses til palett-callbacken og konsumerer tasten', () => {
	const st = nyVimTilstand();
	const kalt = [];
	const konsumert = tast(':', st, { palett: (forhand) => kalt.push(forhand) });
	assert.equal(konsumert, true);
	assert.deepEqual(kalt, [':']);
});

test('uten palett-callback beholdes dagens kommandolinje (st.kommando)', () => {
	const st = nyVimTilstand();
	const konsumert = tast(':', st, {});
	assert.equal(konsumert, true);
	assert.equal(st.kommando, ':');
});

test('i insert-modus gr ":" rett inn som tekst', () => {
	const st = nyVimTilstand();
	st.modus = 'insert';
	const kalt = [];
	const konsumert = tast(':', st, { palett: (forhand) => kalt.push(forhand) });
	assert.equal(konsumert, false);
	assert.deepEqual(kalt, []);
});
