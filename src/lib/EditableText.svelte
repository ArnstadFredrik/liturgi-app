<script>
	import { tick, untrack } from 'svelte';
	import { nyVimTilstand, vimKeydown } from '$lib/vim.js';
	import { markDirty } from '$lib/store.svelte.js';
	import { litHtml, litEditHtml, litLinjeHtml, litLinjeMerkerHtml } from '$lib/lit.js';
	import { mdi } from '$lib/mdi.js';

	let { value = $bindable(''), kind = 'lit', plassholder = '[Klikk for å skrive]', startRedigering = false, visFerdig = true, dirty = true, hybrid = false , vimAktiv = false, vimSt = null, vimLagre = null } = $props(); // hybrid: markdown-merker synlige på markørlinjen // kind: 'lit' | 'instr' | 'etikett'

	let editing = $state(false);
	$effect(() => {
		if (startRedigering && !editing) {
			start();
			visFerdig = false;
		}
	});
	let ta = $state(null);          // textarea (kildevisning)
	let rikel = $state(null);       // contenteditable (riktekst)
	let kilde = $state(false);      // vis markdown-kilde i stedet for riktekst
	let html = $state('');
	let sistSer = '';               // sist serialiserte verdi (hindrer re-render ved egen skriving)
	let sel = $state({ s: 0, e: 0 });
	let rikPaa = $state({ rolle: false, bold: false, italic: false, sup: false, bibelref: false, fotnote: false, notat: false, liste: false });

	const cls = $derived(kind === 'instr' ? 'instr' : kind === 'etikett' ? 'etikett' : 'lit-text');
	const etikett = $derived(kind === 'etikett');

	function start() {
		editing = true;
		merkerIdx = -1;
		sistSer = value;
		html = litEditHtml(value);
		tick().then(() => {
			const el = kilde || etikett ? ta : rikel;
			el?.focus();
			if (el && el.setSelectionRange) el.setSelectionRange(el.value.length, el.value.length);
			oppdaterTilstand();
		});
	}

	function done() {
		editing = false;
		if (dirty) markDirty();
	}

	/* ---------- tilstand for knappene ---------- */

	/** DOM-linje → markdown (samme regler som serialiser()). */
	function linjeMd(le) {
		return [...le.childNodes].map(mdFraNode).join('');
	}

	/** HYBRID: merket linje + blokk-regioner. Blokker (kode/tabell/hr/setext)
	 *  rendres som ekte elementer når markøren er utenfor dem, og som rå linjer
	 *  når markøren er inni dem (Obsidian-modellen). Alt via Svelte-styrt
	 *  re-rendering (merkerVersjon) — ingen manuell DOM-kirurgi. */
	let merkerIdx = -1; // linjen med synlige merker
	let merkerVersjon = $state(0);
	let venterCaret = null; // { linje, kol } — kol = innholdsoffset i linjen

	/** HYBRID + VIM: kjør vim-motoren mot råverdien via en shim
	 *  (value/selectionStart/End) — map caret'en tilbake til (linje, kol). */
	function hybridVim(e) {
		if (!vimSt || !vimAktiv) return false;
		const s = window.getSelection();
		const node = s?.anchorNode;
		const el = node && rikel.contains(node) ? (node.nodeType === 3 ? node.parentElement : node) : null;
		const le = el?.closest('.et-linje') ?? null;
		if (!le) return false;
		const linje = +(le.dataset.linje ?? -1);
		if (linje < 0) return false;
		const verdiLinjer = value.split('\n');
		const pre = document.createRange();
		pre.selectNodeContents(le);
		try { pre.setEnd(s.getRangeAt(0).startContainer, s.getRangeAt(0).startOffset); } catch { }
		const off = pre.toString().length; // innholdsoffset (uten prefiks/chips)
		const verdLinje = verdiLinjer[linje] ?? '';
		const domTekst = le.textContent.length;
		const prefiksLen = Math.max(0, verdLinje.length - domTekst);
		const abs = verdiLinjer.slice(0, linje).reduce((a, l) => a + l.length + 1, 0) + prefiksLen + off;
		const shim = {
			_v: value, _p: abs,
			get value() { return this._v; },
			set value(v) { this._v = v; },
			get selectionStart() { return this._p; },
			set selectionStart(p) { this._p = p; },
			get selectionEnd() { return this._p; },
			set selectionEnd(p) { this._p = p; },
			setSelectionRange(a) { this._p = a; },
			dispatchEvent() {},
			focus() {}
		};
		const konsumert = vimKeydown(e, shim, vimSt, { lagre: vimLagre });
		if (!konsumert) return true;
		e.preventDefault();
		const nyLinjer = shim._v.split('\n');
		let acc = 0, nl = 0, nk = 0, funnet = false;
		for (let i = 0; i < nyLinjer.length; i++) {
			const L = nyLinjer[i].length;
			if (shim._p <= acc + L) { nl = i; nk = shim._p - acc; funnet = true; break; }
			acc += L + 1;
		}
		if (!funnet) { nl = nyLinjer.length - 1; nk = nyLinjer[nl].length; }
		const pl = nyLinjer[nl].match(/^(?:\s{0,3}#{1,6} |\s*(?:[-*+]|\d+[.)]) |BIBELREF \| |FOTNOTE \| |@NOTAT )/)?.[0]?.length ?? 0;
		venterCaret = { linje: nl, kol: Math.max(0, nk - pl) };
		merkerIdx = nl;
		value = shim._v;
		sistSer = shim._v;
		merkerVersjon++;
		if (dirty) markDirty();
		return true;
	}

	function oppdaterMerkerLinje() {
		if (!hybrid || kilde || !rikel || !editing) return;
		const s = window.getSelection();
		const node = s?.anchorNode;
		const el = node && rikel.contains(node) ? (node.nodeType === 3 ? node.parentElement : node) : null;
		const le = el?.closest('.et-linje') ?? null;
		const L = le ? +(le.dataset.linje ?? -1) : -1;
		if (L < 0) return;
		const off = (() => {
			if (!le || !s || s.rangeCount === 0) return 0;
			const r = s.getRangeAt(0);
			const pre = document.createRange();
			pre.selectNodeContents(le);
			try { pre.setEnd(r.startContainer, r.startOffset); } catch { return 0; }
			return pre.toString().length;
		})();
		if (L === merkerIdx) return;
		venterCaret = { linje: L, kol: off };
		merkerIdx = L;
		merkerVersjon++;
	}

	/** Gjenopprett caret-en i (linje, kol) etter re-renderingen. */
	$effect(() => {
		if (!hybrid || kilde || !editing) return;
		void merkerVersjon;
		if (merkerIdx < 0 || !venterCaret) return;
		const { linje, kol } = venterCaret;
		venterCaret = null;
		tick().then(() => tick().then(() => {
			const le = rikel?.querySelector(`[data-linje="${linje}"]`);
			if (!le) return;
			const nySel = window.getSelection();
			if (!nySel) return;
			const nyOff = Math.min(kol, le.textContent.length);
			const w = document.createTreeWalker(le, NodeFilter.SHOW_TEXT, {
				acceptNode: (n) => n.parentElement?.closest('.chip') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
			});
			let n, acc = 0, plassert = false;
			while ((n = w.nextNode())) {
				if (acc + n.textContent.length >= nyOff) {
					const r = document.createRange();
					r.setStart(n, Math.min(nyOff - acc, n.textContent.length));
					r.collapse(true);
					nySel.removeAllRanges();
					nySel.addRange(r);
					plassert = true;
					break;
				}
				acc += n.textContent.length;
			}
			if (!plassert || !le.contains(nySel.anchorNode)) {
				const r = document.createRange();
				r.selectNodeContents(le);
				r.collapse(true);
				nySel.removeAllRanges();
				nySel.addRange(r);
			}
		}));
	});


	function oppdaterTilstand() {
		oppdaterMerkerLinje();
		if (kilde || etikett) {
			if (ta) sel = { s: ta.selectionStart ?? 0, e: ta.selectionEnd ?? 0 };
			return;
		}
		if (!rikel) return;
		const s = window.getSelection();
		const node = s?.anchorNode;
		if (!node || !rikel.contains(node)) return;
		const el = node.nodeType === 3 ? node.parentElement : node;
		rikPaa = {
			rolle: !!el?.closest('span.role'),
			bold: document.queryCommandState('bold'),
			italic: document.queryCommandState('italic'),
			sup: document.queryCommandState('superscript'),
			bibelref: el?.closest('.et-linje')?.dataset.type === 'bibelref',
			fotnote: el?.closest('.et-linje')?.dataset.type === 'fotnote',
			notat: el?.closest('.et-linje')?.dataset.type === 'notat',
			liste: el?.closest('.et-linje')?.dataset.type === 'liste'
		};
	}

	$effect(() => {
		if (!editing) return;
		document.addEventListener('selectionchange', oppdaterTilstand);
		return () => document.removeEventListener('selectionchange', oppdaterTilstand);
	});

	// ekstrene verdiendringer (fyllLesning osv.) → re-render riktekst
	$effect(() => {
		if (value !== sistSer) {
			sistSer = value;
			merkerIdx = -1;
			if (editing && !kilde && !etikett) html = litEditHtml(value);
		}
	});

	/** Hybrid: merket linje i html-en — Svelte-eid re-rendering (untrack: verdi-
	 *  endringer ved egen skriving må IKKE re-rendere, caret'en skal stå stille). */
	$effect(() => {
		if (kilde || !editing) return;
		void merkerVersjon;
		if (!hybrid) merkerIdx = -1;
		untrack(() => {
			html = litEditHtml(value, hybrid ? merkerIdx : -1);
		});
	});

	/* ---------- serialisering: DOM → markdown ---------- */

	function mdFraNode(n) {
		if (n.nodeType === 3) return n.textContent;
		if (n.nodeType !== 1) return '';
		if (n.tagName === 'BR') return '\n';
		const cl = n.classList;
		if (cl.contains('chip')) return '';
		if (cl.contains('mrk')) return ''; // hybrid: merkene representeres av data-prefiks/strong
		const indre = [...n.childNodes].map(mdFraNode).join('');
		const tag = n.tagName;
		if (tag === 'B' || tag === 'STRONG') return '**' + indre + '**';
		if (tag === 'I' || tag === 'EM') return '*' + indre + '*';
		if (tag === 'SUP') return '^{' + indre + '}';
		if (tag === 'SPAN' && cl.contains('role')) return '{{r}}' + indre + '{{/r}}';
		if (tag === 'DIV') return (n.dataset.prefiks ?? '') + indre + '\n';
		return indre;
	}

	function serialiser() {
		if (!rikel) return null;
		return [...rikel.childNodes].map(mdFraNode).join('')
			.replace(/\n{2,}/g, '\n\n').replace(/^\n+/, '').replace(/\n+$/, '');
	}

	function rikOppdatert() {
		const ny = serialiser();
		if (ny == null) return;
		sistSer = ny;
		value = ny;
		if (dirty) markDirty();
		planleggKonvertering();
	}

	/* ---------- live markdown-konvertering i riktekst ---------- */
	// fullførte *kursiv*-/**fet**-blokker som skrives, konverteres til em/strong
	// (debounced) med caret-gjenoppretting på samme visuelle posisjon
	let konvTid = null;
	function planleggKonvertering() {
		clearTimeout(konvTid);
		konvTid = setTimeout(() => {
			if (!rikel) return;
			const v = serialiser();
			if (v == null) return;
			// er det noe å konvertere (fullførte markdown-par som ikke allerede er em/strong)?
			if (!/(^|[^*])\*[^*\n]+\*/.test(v) && !/\*\*[^*\n]+\*\*/.test(v)) return;
			// lagre caret: linjeindeks + visuell tekst-offset i linjen (stabil før/etter)
			const s = window.getSelection();
			const caret = (() => {
				if (!s || s.rangeCount === 0) return null;
				const r = s.getRangeAt(0);
				const le = ((n) => (n.nodeType === 3 ? n.parentElement : n))(r.startContainer)?.closest('.et-linje');
				if (!le) return null;
				const idx = [...rikel.children].indexOf(le);
				const pre = document.createRange();
				pre.selectNodeContents(le);
				try { pre.setEnd(r.startContainer, r.startOffset); } catch { return { idx, off: 0 }; }
				return { idx, off: pre.toString().length };
			})();
			html = litEditHtml(v, hybrid ? merkerIdx : -1);
			sistSer = v;
			if (hybrid && caret) venterCaret = { off: caret.off };
			// gjenopprett caret på samme visuelle posisjon i samme linje
			if (caret && caret.idx >= 0 && rikel.children[caret.idx]) {
				const le = rikel.children[caret.idx];
				const w = document.createTreeWalker(le, NodeFilter.SHOW_TEXT);
				let n, acc = 0, plassert = false;
				while ((n = w.nextNode())) {
					if (acc + n.textContent.length >= caret.off) {
						const r = document.createRange();
						r.setStart(n, Math.min(caret.off - acc, n.textContent.length));
						r.collapse(true);
						s.removeAllRanges();
						s.addRange(r);
						plassert = true;
						break;
					}
					acc += n.textContent.length;
				}
				if (!plassert) {
					const r = document.createRange();
					r.selectNodeContents(le);
					r.collapse(false);
					s.removeAllRanges();
					s.addRange(r);
				}
			}
		}, 700);
	}

	/** Hindrer at skrevet tekst arver rolleformatering når utvalget bare BERØRER et
	 *  rollespan (Chromium ellers beholder den røde stilen): tekst som går ut av
	 *  spanet, eller som skrives rett etter spanet, settes inn som ren tekst. */
	function rikBeforeInput(e) {
		if (!['insertText', 'insertReplacementText', 'insertCompositionText', 'insertFromPaste'].includes(e.inputType)) return;
		const s = window.getSelection();
		if (!s || s.rangeCount === 0) return;
		const r = s.getRangeAt(0);
		const el = (n) => (n.nodeType === 3 ? n.parentElement : n);
		const startSpan = el(r.startContainer)?.closest('span.role');
		const endSpan = el(r.endContainer)?.closest('span.role');
		const tekst = e.data ?? (e.dataTransfer ? e.dataTransfer.getData('text/plain') : '');
		// A) utvalg som starter i et rollespan men går utover det → erstatt som ren tekst
		if (!s.isCollapsed && (startSpan || endSpan) && !(startSpan && startSpan === endSpan)) {
			e.preventDefault();
			r.deleteContents();
			const tn = document.createTextNode(tekst);
			r.insertNode(tn);
			s.removeAllRanges();
			const nr = document.createRange();
			nr.setStart(tn, tn.length);
			nr.collapse(true);
			s.addRange(nr);
			rikOppdatert();
			return;
		}
		// B) caret helt på slutten av et rollespan → ny tekst havner etter spanet
		if (s.isCollapsed && startSpan && r.startContainer === startSpan.lastChild && r.startOffset === startSpan.lastChild.textContent.length) {
			e.preventDefault();
			const tn = document.createTextNode(tekst);
			startSpan.after(tn);
			s.removeAllRanges();
			const nr = document.createRange();
			nr.setStart(tn, tn.length);
			nr.collapse(true);
			s.addRange(nr);
			rikOppdatert();
		}
	}

	/* ---------- riktekst-knapper ---------- */

	function rikPar(id) {
		const s = window.getSelection();
		if (!s || s.rangeCount === 0) return;
		if (id === 'bold') { document.execCommand('bold'); }
		else if (id === 'italic') { document.execCommand('italic'); }
		else if (id === 'sup') { document.execCommand('superscript'); }
		else if (id === 'rolle') {
			if (rikPaa.rolle) {
				const span = (s.anchorNode.nodeType === 3 ? s.anchorNode.parentElement : s.anchorNode)?.closest('span.role');
				if (span) {
					const forelder = span.parentNode;
					while (span.firstChild) forelder.insertBefore(span.firstChild, span);
					span.remove();
				}
			} else {
				if (s.isCollapsed) return;
				const r = s.getRangeAt(0);
				const span = document.createElement('span');
				span.className = 'role';
				span.appendChild(r.extractContents());
				r.insertNode(span);
				s.removeAllRanges();
				const ny = document.createRange();
				ny.selectNodeContents(span);
				s.addRange(ny);
			}
		}
		rikOppdatert();
		oppdaterTilstand();
	}

	function rikLinje(prefiks, type) {
		const node = window.getSelection()?.anchorNode;
		const linje = (node?.nodeType === 3 ? node.parentElement : node)?.closest('.et-linje');
		if (!linje) return;
		const av = linje.dataset.type === type;
		const indreMd = [...linje.childNodes]
			.filter((n) => !(n.nodeType === 1 && n.classList.contains('chip')))
			.map(mdFraNode).join('');
		const nyPrefiks = av ? '' : prefiks;
		const fullLinje = nyPrefiks + indreMd;
		linje.outerHTML = litLinjeHtml(fullLinje);
		rikOppdatert();
		oppdaterTilstand();
	}

	/* ---------- kildevisning (textarea, markdown) ---------- */

	function parOmslutter(v, s, e, open, close) {
		let o = v.lastIndexOf(open, s);
		while (o !== -1) {
			const c = v.indexOf(close, o + open.length);
			if (c !== -1 && c + close.length >= e && o <= s) return [o, c + close.length];
			if (o === 0) break;
			o = v.lastIndexOf(open, o - 1);
		}
		return null;
	}

	const PAR = {
		rolle: { open: '{{r}}', close: '{{/r}}' },
		bold: { open: '**', close: '**' },
		italic: { open: '*', close: '*' },
		sup: { open: '^{', close: '}' }
	};

	function parAktiv(id) {
		if (!ta) return false;
		const v = ta.value, { s, e } = sel;
		if (id === 'italic') {
			if (parOmslutter(v, s, e, PAR.bold.open, PAR.bold.close)) return false;
			const o = parOmslutter(v, s, e, '*', '*');
			if (!o) return false;
			return v[o[0] + 1] !== '*' && v[o[1] - 2] !== '*';
		}
		return !!parOmslutter(v, s, e, PAR[id].open, PAR[id].close);
	}

	function linjeAktiv(prefiks) {
		if (!ta) return false;
		const v = ta.value, { s, e } = sel;
		const ls = v.lastIndexOf('\n', s - 1) + 1;
		let le = v.indexOf('\n', e); if (le === -1) le = v.length;
		const linjer = v.slice(ls, le).split('\n');
		return linjer.length > 0 && linjer.every((l) => l.startsWith(prefiks));
	}

	function settVerdi(ny, s, e) {
		ta.value = ny;
		value = ny;
		ta.selectionStart = s;
		ta.selectionEnd = e;
		ta.focus();
		sel = { s, e };
		if (dirty) markDirty();
	}

	function vekslePar(id) {
		if (!ta) return;
		const p = PAR[id];
		const v = ta.value;
		let s = sel.s, e = sel.e;
		if (s === e) return;
		const omsluttet = id === 'italic' ? omOmsluttetItalic(v, s, e) : parOmslutter(v, s, e, p.open, p.close);
		if (omsluttet) {
			const [o, c] = omsluttet;
			const ny = v.slice(0, o) + v.slice(o + p.open.length, c - p.close.length) + v.slice(c);
			settVerdi(ny, o, c - p.open.length - p.close.length);
		} else {
			const ny = v.slice(0, s) + p.open + v.slice(s, e) + p.close + v.slice(e);
			settVerdi(ny, s, e + p.open.length + p.close.length);
		}
	}

	function omOmsluttetItalic(v, s, e) {
		const o = parOmslutter(v, s, e, '*', '*');
		if (!o) return null;
		if (v[o[0] + 1] === '*' || v[o[1] - 2] === '*') return null;
		return o;
	}

	function veksleLinje(prefiks) {
		if (!ta) return;
		const v = ta.value;
		const s = sel.s, e = sel.e;
		const ls = v.lastIndexOf('\n', s - 1) + 1;
		let le = v.indexOf('\n', e); if (le === -1) le = v.length;
		const linjer = v.slice(ls, le).split('\n');
		const andre = ['BIBELREF | ', 'FOTNOTE | '].filter((p) => p !== prefiks);
		const alle = linjer.every((l) => l.startsWith(prefiks));
		const nyBlokk = linjer.map((l) => {
			let ren = l;
			for (const p of andre) if (ren.startsWith(p)) ren = ren.slice(p.length);
			return alle ? ren.slice(prefiks.length).replace(/^ /, '') : (ren.startsWith(prefiks) ? ren : prefiks + ren);
		}).join('\n');
		const ny = v.slice(0, ls) + nyBlokk + v.slice(le);
		settVerdi(ny, ls, ls + nyBlokk.length);
	}

	function byttModus(tilKilde) {
		if (tilKilde === kilde) return;
		if (!tilKilde) {
			merkerIdx = -1;
			sistSer = value;
			html = litEditHtml(value);
		}
		kilde = tilKilde;
		tick().then(() => {
			const el = kilde ? ta : rikel;
			el?.focus();
			oppdaterTilstand();
		});
	}

	function knapp(id) {
		if (etikett) return;
		if (kilde) {
			if (id === 'bibelref') veksleLinje('BIBELREF | ');
			else if (id === 'fotnote') veksleLinje('FOTNOTE | ');
			else if (id === 'notat') veksleLinje('@NOTAT ');
			else vekslePar(id);
		} else {
			if (id === 'bibelref') rikLinje('BIBELREF | ', 'bibelref');
			else if (id === 'fotnote') rikLinje('FOTNOTE | ', 'fotnote');
			else if (id === 'notat') rikLinje('@NOTAT ', 'notat');
			else if (id === 'liste') rikLinje('- ', 'liste');
			else rikPar(id);
		}
	}

	function paa(id) {
		if (kilde) {
			if (id === 'bibelref') return linjeAktiv('BIBELREF | ');
			if (id === 'fotnote') return linjeAktiv('FOTNOTE | ');
			if (id === 'notat') return linjeAktiv('@NOTAT ');
			if (id === 'liste') return linjeAktiv('- ');
			return parAktiv(id);
		}
		return rikPaa[id];
	}

</script>

{#if editing}
	<div class="et-edit">
		<div class="et-tools">
			{#if !etikett}
				<button class="et-tool" class:paa={paa('rolle')} onmousedown={(e) => e.preventDefault()} onclick={() => knapp('rolle')} title={'Rolle (hele linjen: prefiks, ellers {{r}}-markering)'}>{@html mdi('account-voice', 15)}</button>
				<button class="et-tool" class:paa={paa('bold')} onmousedown={(e) => e.preventDefault()} onclick={() => knapp('bold')} title="Fet (**tekst**)">{@html mdi('format-bold', 15)}</button>
				<button class="et-tool" class:paa={paa('italic')} onmousedown={(e) => e.preventDefault()} onclick={() => knapp('italic')} title="Utskrift (*tekst*)">{@html mdi('format-italic', 15)}</button>
				<button class="et-tool" class:paa={paa('sup')} onmousedown={(e) => e.preventDefault()} onclick={() => knapp('sup')} title={'Hevet versnummer (^{12})'}>{@html mdi('format-superscript', 15)}</button>
				<span class="et-skiller"></span>
				<button class="et-tool" class:paa={paa('liste')} onmousedown={(e) => e.preventDefault()} onclick={() => knapp('liste')} title="Punktliste (- tekst)">{@html mdi('format-list-bulleted', 15)}</button>
				<button class="et-tool" class:paa={paa('bibelref')} onmousedown={(e) => e.preventDefault()} onclick={() => knapp('bibelref')} title="Bibelreferanse (BIBELREF | )">{@html mdi('book-open-variant', 15)}</button>
				<button class="et-tool" class:paa={paa('fotnote')} onmousedown={(e) => e.preventDefault()} onclick={() => knapp('fotnote')} title="Liten tekstnotis (FOTNOTE | )">{@html mdi('script-text-outline', 15)}</button>
				<button class="et-tool" class:paa={paa('notat')} onmousedown={(e) => e.preventDefault()} onclick={() => knapp('notat')} title="Scenenotat (@NOTAT )">{@html mdi('comment-quote-outline', 15)}</button>
				<span class="et-skiller"></span>
				<button class="et-tool" class:paa={kilde} onmousedown={(e) => e.preventDefault()} onclick={() => byttModus(!kilde)} title={kilde ? 'Vis riktekst' : 'Vis kildekode (markdown)'}>{@html mdi('code-tags', 15)}</button>
			{/if}
			{#if visFerdig}<button class="primary" onclick={done}>Ferdig</button>{/if}
		</div>
		{#if etikett || kilde}
			<textarea
				bind:this={ta}
				bind:value={value}
				spellcheck="false"
				rows={kind === 'etikett' ? 1 : Math.max(3, (value || '').split('\n').length + 1)}
				onchange={markDirty}
				onkeyup={oppdaterTilstand}
				onmouseup={oppdaterTilstand}
				oninput={oppdaterTilstand}
				onfocus={oppdaterTilstand}
				onkeydown={(e) => { if (e.key === 'Escape') done(); }}
			></textarea>
		{:else}
			<div
				class="et-rik lit-text"
				bind:this={rikel}
				contenteditable="true"
				spellcheck="false"
				oninput={rikOppdatert}
				onbeforeinput={rikBeforeInput}
				onkeydown={(e) => { if (hybrid && vimAktiv && hybridVim(e)) return; if (e.key === 'Escape') done(); }}
			>{@html html}</div>
		{/if}
	</div>
{:else}
	<div class={cls} onclick={start}>
		{#if value}
			{@html kind === 'etikett' ? value : litHtml(value)}
		{:else}
			<span class="et-empty">{plassholder}</span>
		{/if}
	</div>
{/if}
