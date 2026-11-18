/**
 * Vim-binding for tekstfeltet i prekenforberedelse-editoren.
 * Moduser: normal, insert, visual (v), visual-line (V).
 * Motions: h l j k 0 ^ $ g_ gg G w b e { } % f F t T (+ piltaster).
 * Operators: d c y — med motion (dw, d$, dgg …), dobling (dd/yy/cc) og tellere (2d3w).
 * Export: nyVimTilstand(), vimKeydown(e, ta, st, { lagre }) → true hvis konsumert.
 */

export function nyVimTilstand() {
	return {
		modus: 'normal', // normal | insert | visual | vline
		vAnker: null, // startposisjon i visual
		operator: null, // 'd' | 'c' | 'y' mens operatoren venter på motion
		opTeller: 1, // teller gitt FØR operatoren (2d3w = 6)
		fVent: null, // { type: 'f'|'F'|'t'|'T' } mens vi venter på søketegnet
		gVent: false, // g trykket (gg)
		teller: '',
		kolOensket: null, // j/k beholder kolonnen
		kommando: '',
		reg: { tekst: '', linewise: false } // unnavngitt register
	};
}

// ---------- posisjonshjelpere ----------

function posTilLK(linjer, pos) {
	let acc = 0;
	for (let i = 0; i < linjer.length; i++) {
		const L = linjer[i].length;
		if (pos <= acc + L) return { li: i, ko: pos - acc };
		acc += L + 1;
	}
	return { li: linjer.length - 1, ko: linjer[linjer.length - 1]?.length ?? 0 };
}

const lOff = (linjer, i) => linjer.slice(0, i).reduce((a, l) => a + l.length + 1, 0);
const forsteTegn = (l) => (l.match(/^\s*/) ?? [''])[0].length;
const sistTegn = (l) => Math.max(0, l.replace(/\s+$/, '').length - 1);
const PARANTEN = { '(': ')', '[': ']', '{': '}' };

// ---------- ordmotions (vim \w-ord) ----------

function ordTokene(v) {
	const ut = [];
	const re = /\w+|[^\w\s]+|\s+/g;
	let m;
	while ((m = re.exec(v))) ut.push({ start: m.index, slutt: m.index + m[0].length, ws: /^\s+$/.test(m[0]) });
	return ut;
}

function ordFrem(v, pos) {
	const t = ordTokene(v);
	let i = t.findIndex((x) => pos < x.slutt);
	if (i === -1) return pos;
	if (!t[i].ws) i++; // på/midt i et ord → neste token (vim: w går alltid videre)
	while (i < t.length && t[i].ws) i++;
	return i < t.length ? t[i].start : pos;
}

function ordBak(v, pos) {
	const t = ordTokene(v);
	let i = t.findIndex((x) => pos <= x.start) - 1;
	if (i < 0) i = t.length - 1;
	while (i >= 0 && t[i].ws) i--;
	if (i < 0) return 0;
	if (t[i].start < pos) return t[i].start;
	i--;
	while (i >= 0 && t[i].ws) i--;
	return i >= 0 ? t[i].start : 0;
}

function ordSlutt(v, pos) {
	const t = ordTokene(v);
	let i = t.findIndex((x) => pos < x.slutt);
	if (i === -1) return pos;
	if (!t[i].ws && pos < t[i].slutt - 1) return t[i].slutt - 1;
	i++;
	while (i < t.length && t[i].ws) i++;
	return i < t.length ? t[i].slutt - 1 : pos;
}

/** Parantes-match (%). Returnerer absolutt posisjon eller null. */
function parantMatch(v, pos0) {
	let pos = pos0;
	const linjer = v.split('\n');
	let fra = v[pos];
	if (!(fra in PARANTEN) && !')]}'.includes(fra)) {
		// ikke på en parantes — finn neste på linjen
		const { li, ko } = posTilLK(linjer, pos);
		const linje = linjer[li] ?? '';
		for (let k = ko + 1; k < linje.length; k++) {
			if (linje[k] in PARANTEN || ')]}'.includes(linje[k])) { pos = lOff(linjer, li) + k; break; }
		}
		fra = v[pos];
		if (!(fra in PARANTEN) && !')]}'.includes(fra)) return null;
	}
	const frem = fra in PARANTEN;
	const slutt = frem ? PARANTEN[fra] : fra;
	const apne = frem ? fra : Object.keys(PARANTEN).find((k) => PARANTEN[k] === fra);
	let dyp = 0;
	if (frem) {
		for (let i = pos; i < v.length; i++) {
			if (v[i] === apne) dyp++;
			else if (v[i] === slutt) { dyp--; if (!dyp) return i; }
		}
	} else {
		for (let i = pos; i >= 0; i--) {
			if (v[i] === slutt) dyp++;
			else if (v[i] === apne) { dyp--; if (!dyp) return i; }
		}
	}
	return null;
}

/**
 * Utfør en motion. Returnerer { pos, linewise, inklusiv } — eller null
 * (null = tasten venter på mer input, f.eks. gg eller f-måltegn) —
 * eller undefined (ukjent tast).
 */
function motion(st, v, pos, K) {
	const linjer = v.split('\n');
	const { li, ko } = posTilLK(linjer, pos);
	const n = parseInt(st.teller || '1', 10) || 1;
	const teller = st.operator ? st.opTeller * n : n;
	const linewise = (p) => ({ pos: p, linewise: true, inklusiv: false });

	switch (K) {
		case 'h': case 'ArrowLeft':
			st.kolOensket = null;
			return { pos: Math.max(0, pos - teller), linewise: false, inklusiv: false };
		case 'l': case 'ArrowRight': case ' ':
			st.kolOensket = null;
			return { pos: Math.min(v.length - 1, pos + teller), linewise: false, inklusiv: false };
		case 'j': case 'ArrowDown': {
			if (st.kolOensket === null) st.kolOensket = ko;
			const li2 = Math.min(linjer.length - 1, li + teller);
			return { pos: lOff(linjer, li2) + Math.min(st.kolOensket, linjer[li2]?.length ?? 0), linewise: false, inklusiv: false };
		}
		case 'k': case 'ArrowUp': {
			if (st.kolOensket === null) st.kolOensket = ko;
			const li2 = Math.max(0, li - teller);
			return { pos: lOff(linjer, li2) + Math.min(st.kolOensket, linjer[li2]?.length ?? 0), linewise: false, inklusiv: false };
		}
		case '0': return { pos: lOff(linjer, li), linewise: false, inklusiv: false };
		case '^': return { pos: lOff(linjer, li) + forsteTegn(linjer[li] ?? ''), linewise: false, inklusiv: false };
		case '$': {
			st.kolOensket = null;
			const li2 = Math.min(linjer.length - 1, li + teller - 1);
			return { pos: lOff(linjer, li2) + (linjer[li2]?.length ?? 0), linewise: false, inklusiv: true };
		}
		case 'g':
			if (st.gVent) { st.gVent = false; return { pos: 0, linewise: false, inklusiv: false }; }
			st.gVent = true;
			return null;
		case '_':
			if (st.gVent) {
				st.gVent = false;
				const li2 = Math.min(linjer.length - 1, li + teller - 1);
				return { pos: lOff(linjer, li2) + sistTegn(linjer[li2] ?? ''), linewise: false, inklusiv: true };
			}
			return { pos, linewise: false, inklusiv: false };
		case 'G': {
			st.kolOensket = null;
			const li2 = linjer.length - 1;
			return { pos: lOff(linjer, li2) + (linjer[li2]?.length ?? 0), linewise: false, inklusiv: false };
		}
		case 'w': {
			st.kolOensket = null;
			let p = pos;
			for (let i = 0; i < teller; i++) p = ordFrem(v, p);
			return { pos: p, linewise: false, inklusiv: false };
		}
		case 'b': {
			st.kolOensket = null;
			let p = pos;
			for (let i = 0; i < teller; i++) p = ordBak(v, p);
			return { pos: p, linewise: false, inklusiv: false };
		}
		case 'e': {
			st.kolOensket = null;
			let p = pos;
			for (let i = 0; i < teller; i++) p = ordSlutt(v, p);
			return { pos: p, linewise: false, inklusiv: true };
		}
		case '{': {
			st.kolOensket = null;
			let li2 = li - 1;
			while (li2 > 0 && !(linjer[li2]?.trim() === '' && linjer[li2 - 1]?.trim() !== '')) li2--;
			return linewise(lOff(linjer, Math.max(0, li2)));
		}
		case '}': {
			st.kolOensket = null;
			let li2 = li + 1;
			while (li2 < linjer.length - 1 && !(linjer[li2]?.trim() === '' && linjer[li2 + 1]?.trim() !== '')) li2++;
			return linewise(lOff(linjer, Math.min(linjer.length - 1, li2)));
		}
		case '%': {
			st.kolOensket = null;
			const m = parantMatch(v, pos);
			return m === null ? { pos, linewise: false, inklusiv: false } : { pos: m, linewise: false, inklusiv: true };
		}
		case 'f': case 'F': case 't': case 'T': st.fVent = { type: K }; return null;
		default:
			// måltegnet til f/F/t/T
			if (st.fVent && K.length === 1) {
				const { type } = st.fVent;
				st.fVent = null;
				if (type === 'f' || type === 't') {
					const idx = v.indexOf(K, pos + 1);
					if (idx === -1) return { pos, linewise: false, inklusiv: false };
					return { pos: type === 'f' ? idx : idx - 1, linewise: false, inklusiv: true };
				}
				const idx = v.lastIndexOf(K, pos - 1);
				if (idx === -1) return { pos, linewise: false, inklusiv: false };
				return { pos: type === 'F' ? idx : idx + 1, linewise: false, inklusiv: true };
			}
			return undefined;
	}
}

// ---------- operasjoner ----------

/** Anvend operatoren over spennet markør → beveg-resultat. */
function operer(st, ta, res) {
	const v = ta.value;
	const pos = ta.selectionStart;
	let start = Math.min(pos, res.pos);
	let slutt = Math.max(pos, res.pos);
	if (res.linewise) {
		const linjer = v.split('\n');
		const a = posTilLK(linjer, start);
		const b = posTilLK(linjer, slutt);
		start = lOff(linjer, a.li);
		slutt = lOff(linjer, b.li) + (linjer[b.li]?.length ?? 0);
		// hele linjen inkl. linjeskiftet (dd skal fjerne linjen helt)
		if (b.li < linjer.length - 1) slutt += 1;
	} else if (res.inklusiv) {
		slutt = Math.min(v.length, slutt + 1);
	}
	const tekst = v.slice(start, slutt);
	st.reg = { tekst, linewise: !!res.linewise };
	if (st.operator === 'y') {
		ta.setSelectionRange(start, start);
		return { modus: 'normal' };
	}
	// d / c — slett spennet
	const ny = v.slice(0, start) + v.slice(slutt);
	ta.value = ny;
	ta.dispatchEvent(new Event('input', { bubbles: true }));
	const p = Math.min(start, Math.max(0, ny.length - 1));
	ta.setSelectionRange(p, p);
	return { modus: st.operator === 'c' ? 'insert' : 'normal' };
}

/** x — slett n tegn fra markøren og legg i registeret. */
function slettTegn(st, ta, n) {
	const v = ta.value;
	const pos = ta.selectionStart;
	const slutt = Math.min(v.length, pos + n);
	if (slutt <= pos) return;
	st.reg = { tekst: v.slice(pos, slutt), linewise: false };
	ta.value = v.slice(0, pos) + v.slice(slutt);
	ta.dispatchEvent(new Event('input', { bubbles: true }));
	ta.setSelectionRange(pos, pos);
}

/** p/P — lim inn registeret etter/før markøren. */
function limInn(st, ta, etter) {
	if (!st.reg.tekst) return;
	const v = ta.value;
	const pos = ta.selectionStart;
	const linjer = v.split('\n');
	const { li } = posTilLK(linjer, pos);
	if (st.reg.linewise) {
		const li2 = Math.min(linjer.length, etter ? li + 1 : li);
		const start = lOff(linjer, li2);
		ta.value = v.slice(0, start) + st.reg.tekst + '\n' + v.slice(start);
		ta.dispatchEvent(new Event('input', { bubbles: true }));
		ta.setSelectionRange(start, start);
	} else {
		const p = etter ? Math.min(v.length, pos + 1) : pos;
		ta.value = v.slice(0, p) + st.reg.tekst + v.slice(p);
		ta.dispatchEvent(new Event('input', { bubbles: true }));
		ta.setSelectionRange(p, p);
	}
}

// ---------- visual-hjelp ----------

function visSpenn(st, v, pos) {
	let start = Math.min(st.vAnker, pos);
	let slutt = Math.max(st.vAnker, pos);
	if (st.modus === 'vline') {
		const linjer = v.split('\n');
		const a = posTilLK(linjer, start);
		const b = posTilLK(linjer, slutt);
		start = lOff(linjer, a.li);
		slutt = lOff(linjer, b.li) + (linjer[b.li]?.length ?? 0);
		// hele linjen inkl. linjeskiftet (samme regel som dd)
		if (b.li < linjer.length - 1) slutt += 1;
	} else {
		slutt = Math.min(v.length, slutt + 1); // charwise inkluderer slutttegnet
	}
	return { start, slutt };
}

function visOppdater(st, ta) {
	const v = ta.value;
	const pos = ta.selectionStart;
	const { start, slutt } = visSpenn(st, v, pos);
	ta.setSelectionRange(start, slutt, st.vAnker < pos ? 'forward' : 'backward');
}

// ---------- hovedhåndterer ----------

export function vimKeydown(e, ta, st, ekstra = {}) {
	if (e.metaKey || e.ctrlKey || e.altKey) return false; // la ⌘S/⌘C osv. passere
	const K = e.key;

	// ---------- INSERT ----------
	if (st.modus === 'insert') {
		if (K === 'Escape') {
			e.preventDefault();
			const p = Math.max(0, ta.selectionStart - 1);
			ta.setSelectionRange(p, p);
			st.modus = 'normal';
			return true;
		}
		return false; // vanlig skriving
	}

	// ---------- : -kommandoer ----------
	if (st.kommando) {
		e.preventDefault();
		if (K === 'Escape') { st.kommando = ''; return true; }
		if (K === 'Backspace') st.kommando = st.kommando.slice(0, -1);
		else if (K === 'Enter') {
			const cmd = st.kommando;
			st.kommando = '';
			if (cmd === ':w' || cmd === ':wq' || cmd === ':x') ekstra.lagre?.();
		} else if (K.length === 1) st.kommando += K;
		return true;
	}
	if (K === ':') {
		e.preventDefault();
		st.teller = ''; st.operator = null; st.fVent = null; st.gVent = false;
		st.kommando = ':';
		return true;
	}

	// ---------- VISUAL ----------
	if (st.modus === 'visual' || st.modus === 'vline') {
		if (K === 'd' || K === 'x' || K === 'y' || K === 'c') {
			e.preventDefault();
			const v = ta.value;
			const { start, slutt } = visSpenn(st, v, ta.selectionStart);
			st.reg = { tekst: v.slice(start, slutt), linewise: st.modus === 'vline' };
			if (K === 'y') {
				ta.setSelectionRange(start, start);
				st.modus = 'normal';
				return true;
			}
			ta.value = v.slice(0, start) + v.slice(slutt);
			ta.dispatchEvent(new Event('input', { bubbles: true }));
			const p = Math.min(start, ta.value.length);
			ta.setSelectionRange(p, p);
			st.modus = K === 'c' ? 'insert' : 'normal';
			return true;
		}
		if (K === 'o') { e.preventDefault(); const a = st.vAnker; st.vAnker = ta.selectionStart; ta.setSelectionRange(a, a); visOppdater(st, ta); return true; }
		if (K === 'v') { e.preventDefault(); st.modus = 'visual'; visOppdater(st, ta); return true; }
		if (K === 'V') { e.preventDefault(); st.modus = 'vline'; visOppdater(st, ta); return true; }
		if (K === 'Escape') { e.preventDefault(); const p = Math.min(st.vAnker, ta.selectionStart); ta.setSelectionRange(p, p); st.modus = 'normal'; return true; }
		if (K === ':') { e.preventDefault(); st.kommando = ':'; return true; }
		if (K.length === 1 && /[0-9]/.test(K)) { e.preventDefault(); st.teller += K; return true; }
		if (K === 'u') { e.preventDefault(); document.execCommand('undo'); visOppdater(st, ta); return true; }
		// bevegelse utvider utvalget
		const res = motion(st, ta.value, ta.selectionStart, K);
		if (res === undefined) return false;
		e.preventDefault();
		if (res) ta.setSelectionRange(res.pos, res.pos);
		visOppdater(st, ta);
		return true;
	}

	// ---------- NORMAL: operator venter på motion ----------
	if (st.operator) {
		if (K === st.operator) {
			// dobling (dd/yy/cc): linewise over opTeller linjer
			e.preventDefault();
			const op = st.operator;
			st.operator = null;
			st.teller = '';
			const v = ta.value;
			const linjer = v.split('\n');
			const { li } = posTilLK(linjer, ta.selectionStart);
			const li2 = Math.min(linjer.length - 1, li + st.opTeller - 1);
			const res = { pos: lOff(linjer, li2), linewise: true, inklusiv: false };
			const r = operer({ ...st, operator: op }, ta, res);
			if (r?.modus) st.modus = r.modus;
			return true;
		}
		const res = motion(st, ta.value, ta.selectionStart, K);
		if (res === undefined) { st.operator = null; return false; }
		e.preventDefault();
		if (!res) return true; // fortsatt ventende (gg / f-måltegn)
		const op = st.operator;
		st.operator = null;
		st.teller = '';
		const r = operer({ ...st, operator: op }, ta, res);
		if (r?.modus) st.modus = r.modus;
		return true;
	}

	// ---------- NORMAL: f/F/t/T venter på måltegn ----------
	if (st.fVent) {
		if (K.length === 1) {
			e.preventDefault();
			const res = motion(st, ta.value, ta.selectionStart, K);
			st.teller = '';
			if (res) ta.setSelectionRange(res.pos, res.pos);
		}
		return true;
	}

	// ---------- NORMAL: teller ----------
	if (/^[1-9]$/.test(K)) { e.preventDefault(); st.teller += K; return true; }
	if (K === '0' && !st.teller) {
		e.preventDefault();
		const linjer = ta.value.split('\n');
		const { li } = posTilLK(linjer, ta.selectionStart);
		const p = lOff(linjer, li);
		ta.setSelectionRange(p, p);
		return true;
	}

	// ---------- NORMAL: resten ----------
	switch (K) {
		case 'i': e.preventDefault(); st.modus = 'insert'; st.kolOensket = null; return true;
		case 'I': {
			e.preventDefault();
			const linjer = ta.value.split('\n');
			const { li } = posTilLK(linjer, ta.selectionStart);
			const p = lOff(linjer, li) + forsteTegn(linjer[li] ?? '');
			ta.setSelectionRange(p, p);
			st.modus = 'insert';
			return true;
		}
		case 'a': {
			e.preventDefault();
			const p = Math.min(ta.value.length, ta.selectionStart + 1);
			ta.setSelectionRange(p, p);
			st.modus = 'insert';
			return true;
		}
		case 'A': {
			e.preventDefault();
			const linjer = ta.value.split('\n');
			const { li } = posTilLK(linjer, ta.selectionStart);
			const p = lOff(linjer, li) + (linjer[li]?.length ?? 0);
			ta.setSelectionRange(p, p);
			st.modus = 'insert';
			return true;
		}
		case 'o': {
			e.preventDefault();
			const v = ta.value;
			const linjer = v.split('\n');
			const { li } = posTilLK(linjer, ta.selectionStart);
			const p = lOff(linjer, li) + (linjer[li]?.length ?? 0);
			ta.value = v.slice(0, p) + '\n' + v.slice(p);
			ta.dispatchEvent(new Event('input', { bubbles: true }));
			ta.setSelectionRange(p + 1, p + 1);
			st.modus = 'insert';
			return true;
		}
		case 'O': {
			e.preventDefault();
			const v = ta.value;
			const p = lOff(v.split('\n'), posTilLK(v.split('\n'), ta.selectionStart).li);
			ta.value = v.slice(0, p) + '\n' + v.slice(p);
			ta.dispatchEvent(new Event('input', { bubbles: true }));
			ta.setSelectionRange(p, p);
			st.modus = 'insert';
			return true;
		}
		case 'v': {
			e.preventDefault();
			st.modus = 'visual';
			st.vAnker = ta.selectionStart;
			visOppdater(st, ta);
			return true;
		}
		case 'V': {
			e.preventDefault();
			st.modus = 'vline';
			st.vAnker = ta.selectionStart;
			visOppdater(st, ta);
			return true;
		}
		case 'x': {
			e.preventDefault();
			const n = parseInt(st.teller || '1', 10) || 1;
			st.teller = '';
			slettTegn(st, ta, n);
			return true;
		}
		case 'X': {
			e.preventDefault();
			const n = parseInt(st.teller || '1', 10) || 1;
			st.teller = '';
			const p = Math.max(0, ta.selectionStart - n);
			const v = ta.value;
			st.reg = { tekst: v.slice(p, ta.selectionStart), linewise: false };
			ta.value = v.slice(0, p) + v.slice(ta.selectionStart);
			ta.dispatchEvent(new Event('input', { bubbles: true }));
			ta.setSelectionRange(p, p);
			return true;
		}
		case 's': { e.preventDefault(); slettTegn(st, ta, 1); st.modus = 'insert'; return true; }
		case 'S': case 'C': {
			e.preventDefault();
			const v = ta.value;
			const linjer = v.split('\n');
			const { li } = posTilLK(linjer, ta.selectionStart);
			const start = lOff(linjer, li);
			const slutt = start + (linjer[li]?.length ?? 0);
			st.reg = { tekst: v.slice(start, slutt), linewise: false };
			ta.value = v.slice(0, start) + v.slice(slutt);
			ta.dispatchEvent(new Event('input', { bubbles: true }));
			ta.setSelectionRange(start, start);
			st.modus = 'insert';
			return true;
		}
		case 'p': e.preventDefault(); limInn(st, ta, true); return true;
		case 'P': e.preventDefault(); limInn(st, ta, false); return true;
		case 'u': e.preventDefault(); document.execCommand('undo'); return true;
		case 'J': {
			e.preventDefault();
			const v = ta.value;
			const linjer = v.split('\n');
			const { li } = posTilLK(linjer, ta.selectionStart);
			const sluttA = lOff(linjer, li) + (linjer[li]?.length ?? 0);
			if (linjer[li + 1] !== undefined) {
				const ny = v.slice(0, sluttA) + ' ' + v.slice(sluttA + 1).replace(/^\s*/, ' ');
				ta.value = ny;
				ta.dispatchEvent(new Event('input', { bubbles: true }));
				ta.setSelectionRange(sluttA, sluttA);
			}
			return true;
		}
		case 'D': {
			e.preventDefault();
			const v = ta.value;
			const linjer = v.split('\n');
			const { li, ko } = posTilLK(linjer, ta.selectionStart);
			const start = lOff(linjer, li) + ko;
			const slutt = lOff(linjer, li) + (linjer[li]?.length ?? 0);
			st.reg = { tekst: v.slice(start, slutt), linewise: false };
			ta.value = v.slice(0, start) + v.slice(slutt);
			ta.dispatchEvent(new Event('input', { bubbles: true }));
			ta.setSelectionRange(start, start);
			return true;
		}
		case 'd': case 'c': case 'y': {
			e.preventDefault();
			st.operator = K;
			st.opTeller = parseInt(st.teller || '1', 10) || 1;
			st.teller = '';
			return true;
		}
		default: {
			const res = motion(st, ta.value, ta.selectionStart, K);
			if (res === undefined) {
				// ukjente enkelttegn konsumeres i normal-modus (vim-atferd)
				if (K.length === 1) { e.preventDefault(); return true; }
				return false;
			}
			e.preventDefault();
			if (res) ta.setSelectionRange(res.pos, res.pos);
			st.teller = '';
			return true;
		}
	}
}
