<script>
	/** Cm6Kilde — eksperiment: CodeMirror 6 som kilde-redigeringsfelt i
	 *  prekenforberedelse-modulen (erstatter textarea + Prism-overlay).
	 *  - vim-støtte via @replit/codemirror-vim (motions, operators, Ex)
	 *  - liturgi-merker som dekorasjoner: @NOTAT/@n (rød kursiv),
	 *    rollemerker "L |"/"ML |" (rød fet), BIBELREF `...` (blå)
	 */
	import { onMount, onDestroy } from 'svelte';
	import { EditorView, keymap, lineNumbers, Decoration, ViewPlugin } from '@codemirror/view';
	import { Compartment, RangeSetBuilder } from '@codemirror/state';
	import { vim, Vim } from '@replit/codemirror-vim';
	import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';

	let { value = '', vimAktiv = false, lagreHandler = () => {}, endret = () => {} } = $props();

	let vert = $state(null);
	let view = null;
	const vimRom = new Compartment();

	/** Finn liturgi-merker i teksten: liste av {from, to, klasse}.
	 *  Ren funksjon slik at den kan enhetstestes uten DOM. */
	export function finnMerker(text) {
		const ut = [];
		if (!text) return ut;
		const linjer = text.split('\n');
		let off = 0;
		for (const linje of linjer) {
			let m = linje.match(/^@(NOTAT|n)\b/);
			if (m) ut.push({ from: off, to: off + linje.length, klasse: 'lit-notat' });
			if ((m = linje.match(/^((?:ML|P|KA|K|M|A|Prek|L)\s*\|)/))) {
				ut.push({ from: off, to: off + m[1].length, klasse: 'lit-rolle' });
			}
			if ((m = linje.match(/BIBELREF \| (\S.*)/))) {
				const fra = off + m.index + 'BIBELREF | '.length;
				ut.push({ from: fra, to: fra + m[1].length, klasse: 'lit-bibel' });
			}
			off += linje.length + 1;
		}
		return ut;
	}

	function byggDekor(text) {
		const b = new RangeSetBuilder();
		for (const m of finnMerker(text)) {
			try { b.add(m.from, m.to, Decoration.mark({ class: m.klasse })); } catch {}
		}
		return b.finish();
	}

	function lag() {
		if (view) value = view.state.doc.toString();
		lagreHandler();
	}

	onMount(() => {
		const oppdater = EditorView.updateListener.of((u) => {
			if (u.docChanged) { value = u.state.doc.toString(); endret(); }
		});
		view = new EditorView({
			doc: value,
			parent: vert,
			extensions: [
				vimRom.of(vimAktiv ? vim() : []),
				lineNumbers(),
				history(),
				keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
				EditorView.lineWrapping,
				merkePlugin,
				EditorView.theme({
					'&': { height: '100%', fontSize: '13.5px' },
					'.cm-content': { fontFamily: 'inherit', padding: '8px 0' },
					'.lit-notat': { color: '#c0392b', fontStyle: 'italic' },
					'.lit-rolle': { color: '#c0392b', fontWeight: '700' },
					'.lit-bibel': { color: '#2563eb' },
					'.cm-gutters': { background: 'transparent', border: 'none' },
				}),
				oppdater,
			],
		});
		Vim.defineEx('write', 'w', () => lag());
	});
	onDestroy(() => view?.destroy());

	// ekstern verdiendring (lagre/ny fil): synk inn i CM6
	$effect(() => {
		if (!view) return;
		const naverende = view.state.doc.toString();
		if (value !== naverende) view.dispatch({ changes: { from: 0, to: naverende.length, insert: value ?? '' } });
	});
	// vim-bryter i sanntid
	$effect(() => {
		if (view) view.dispatch({ effects: vimRom.reconfigure(vimAktiv ? vim() : []) });
	});
</script>

<div class="cm6-vert" bind:this={vert}></div>

<style>
	.cm6-vert {
		flex: 1 1 auto;
		min-height: 0;
		overflow: auto;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--panel2);
	}
	.cm6-vert :global(.cm-editor) { height: 100%; background: transparent; }
	.cm6-vert :global(.cm-scroller) { font-family: inherit; line-height: 1.55; }
</style>
