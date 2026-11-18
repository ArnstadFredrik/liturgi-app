/**
 * Minimal vim-binding for tekstfeltet i prekenforberedelse-editoren.
 * Normal/insert-modus med de vanligste bevegelsene og endringene.
 * Export: nyVimTilstand(), vimKeydown(e, ta, st, { lagre }) → true hvis konsumert.
 */

export function nyVimTilstand() {
	return { modus: 'normal', ventende: null, teller: '', kommando: '', yank: null };
}

/** Finn linje- og kolonneindeks for en absolutt posisjon. */
function posTilLK(linjer, pos) {
	let acc = 0;
	for (let i = 0; i < linjer.length; i++) {
		const L = linjer[i].length;
		if (pos <= acc + L) return { li: i, ko: pos - acc };
		acc += L + 1;
	}
	return { li: linjer.length - 1, ko: linjer[linjer.length - 1]?.length ?? 0 };
}

const linjeOffset = (linjer, i) => linjer.slice(0, i).reduce((a, l) => a + l.length + 1, 0);

/** Første ikke-mellomrom-tegn i linjen (vim I). */
const forsteTegn = (l) => (l.match(/^\s*/) ?? [''])[0].length;

export function vimKeydown(e, ta, st, ekstra = {}) {
	if (e.metaKey || e.ctrlKey || e.altKey) return false; // la ⌘S/⌘C osv. passere

	const verd = () => ta.value;
	const sett = (v, pos) => {
		ta.value = v;
		ta.setSelectionRange(pos, pos);
		// bind:value (Svelte) må vite om endringen — ellers skrives DOM-en tilbake ved neste render
		ta.dispatchEvent(new Event('input', { bubbles: true }));
		ta.setSelectionRange(pos, pos);
	};

	// ---------- INSERT ----------
	if (st.modus === 'insert') {
		if (e.key === 'Escape') {
			e.preventDefault();
			// vim: avslutt insert med markøren ÉN tilbake
			const pos = Math.max(0, ta.selectionStart - 1);
			ta.setSelectionRange(pos, pos);
			st.modus = 'normal';
			return true;
		}
		return false; // vanlig skriving
	}

	// ---------- NORMAL ----------
	const linjer = verd().split('\n');
	const pos = ta.selectionStart;
	const { li, ko } = posTilLK(linjer, pos);
	const L = linjer[li] ?? '';
	const teller = parseInt(st.teller || '1', 10) || 1;
	const flytt = (nli, nko) => {
		const li2 = Math.max(0, Math.min(nli, linjer.length - 1));
		const p = linjeOffset(linjer, li2) + Math.min(Math.max(0, nko), linjer[li2]?.length ?? 0);
		ta.setSelectionRange(p, p);
	};
	const slettLinje = (i) => {
		const start = linjeOffset(linjer, i);
		const slutt = start + (linjer[i]?.length ?? 0) + (i < linjer.length - 1 ? 1 : 0);
		sett(verd().slice(0, start) + verd().slice(slutt), Math.max(0, start - 1));
	};
	const settLinje = (i, nyLinje) => {
		const start = linjeOffset(linjer, i);
		const slutt = start + (linjer[i]?.length ?? 0);
		sett(verd().slice(0, start) + nyLinje + verd().slice(slutt), start + nyLinje.length);
	};

	const K = e.key;

	// :w-kommandolinje
	if (st.kommando) {
		e.preventDefault();
		if (K === 'Escape') { st.kommando = ''; return true; }
		if (K === 'Backspace') st.kommando = st.kommando.slice(0, -1);
		else if (K === 'Enter') {
			if (st.kommando === ':w' || st.kommando === ':wq') ekstra.lagre?.();
			st.kommando = '';
		} else if (K.length === 1) st.kommando += K;
		return true;
	}
	if (K === ':') { e.preventDefault(); st.kommando = ':'; return true; }

	// teller (0 er bevegelse, ikke teller)
	if (/^[1-9]$/.test(K)) { e.preventDefault(); st.teller += K; return true; }
	if (K === '0' && !st.teller) { e.preventDefault(); flytt(li, 0); return true; }

	// ventende to-taster (gg, dd, yy)
	if (st.ventende) {
		e.preventDefault();
		const v = st.ventende;
		st.ventende = null;
		if (v === 'g' && K === 'g') { flytt(0, 0); return true; }
		if (v === 'd' && K === 'd') {
			for (let n = 0; n < teller; n++) slettLinje(Math.min(li, linjer.length - 1));
			return true;
		}
		if (v === 'y' && K === 'y') {
			st.yank = linjer.slice(li, li + teller).join('\n');
			return true;
		}
		return true; // ukjent to-tast — konsumér
	}

	switch (K) {
		case 'h': e.preventDefault(); flytt(li, ko - teller); return true;
		case 'l': e.preventDefault(); flytt(li, ko + teller); return true;
		case 'j': e.preventDefault(); flytt(li + teller, ko); return true;
		case 'k': e.preventDefault(); flytt(li - teller, ko); return true;
		case '$': e.preventDefault(); flytt(li, Math.max(0, L.length - 1)); return true;
		case 'G': e.preventDefault(); flytt(linjer.length - 1, 0); return true;
		case 'g': e.preventDefault(); st.ventende = 'g'; return true;
		case 'w': {
			e.preventDefault();
			const etter = verd().slice(pos);
			const m = etter.match(/^\s*\S+/);
			const n = m ? m[0].length : 1;
			ta.setSelectionRange(pos + n, pos + n);
			return true;
		}
		case 'b': {
			e.preventDefault();
			const foran = verd().slice(0, pos);
			const m = foran.match(/\S+\s*$/);
			const n = m ? m[0].length : 1;
			ta.setSelectionRange(pos - n, pos - n);
			return true;
		}
		case 'x': {
			e.preventDefault();
			for (let n = 0; n < teller; n++) {
				const p = ta.selectionStart;
				if (p < verd().length) sett(verd().slice(0, p) + verd().slice(p + 1), p);
			}
			return true;
		}
		case 'd': e.preventDefault(); st.ventende = 'd'; return true;
		case 'y': e.preventDefault(); st.ventende = 'y'; return true;
		case 'p': {
			e.preventDefault();
			if (st.yank == null) return true;
			const start = linjeOffset(linjer, li) + L.length;
			sett(verd().slice(0, start) + '\n' + st.yank + verd().slice(start), start + 1 + st.yank.length);
			return true;
		}
		case 'u': e.preventDefault(); document.execCommand('undo'); return true;
		case 'i': e.preventDefault(); st.modus = 'insert'; return true;
		case 'I': e.preventDefault(); flytt(li, forsteTegn(L)); st.modus = 'insert'; return true;
		case 'a': e.preventDefault(); flytt(li, ko + 1); st.modus = 'insert'; return true;
		case 'A': e.preventDefault(); flytt(li, L.length); st.modus = 'insert'; return true;
		case 'o': {
			e.preventDefault();
			const start = linjeOffset(linjer, li) + L.length;
			sett(verd().slice(0, start) + '\n' + verd().slice(start), start + 1);
			st.modus = 'insert';
			return true;
		}
		case 'O': {
			e.preventDefault();
			const start = linjeOffset(linjer, li);
			sett(verd().slice(0, start) + '\n' + verd().slice(start), start);
			st.modus = 'insert';
			return true;
		}
		default:
			// ukjente taster i normal-modus konsumeres (vim-atferd) — unntak: mellomrom for scrolling? nei, h/l er bevegelse
			if (K.length === 1) { e.preventDefault(); return true; }
			return false;
	}
}
