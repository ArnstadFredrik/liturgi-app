<script>
	import { tick } from 'svelte';
	import { markDirty } from '$lib/store.svelte.js';
	import { litHtml } from '$lib/lit.js';
	import { mdi } from '$lib/mdi.js';

	let { value = $bindable(''), kind = 'lit', plassholder = '[Klikk for å skrive]' } = $props(); // kind: 'lit' | 'instr' | 'etikett'

	let editing = $state(false);
	let ta = $state(null);
	let sel = $state({ s: 0, e: 0 }); // sist kjente utvalg — styrer knappenes av/på

	const cls = $derived(kind === 'instr' ? 'instr' : kind === 'etikett' ? 'etikett' : 'lit-text');

	function start() {
		editing = true;
		tick(() => { if (ta) { ta.focus(); ta.selectionStart = ta.value.length; } oppdaterSel(); });
	}

	function done() {
		editing = false;
		markDirty();
	}

	function oppdaterSel() {
		if (!ta) return;
		sel = { s: ta.selectionStart, e: ta.selectionEnd };
	}

	/** Omslutter paret (open … close) det valgte? Returnerer [start, slutt] på hele spannet. */
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

	/** Er markert tekst omgitt av paret? (bold må sjekkes før italic — * er del av **) */
	function parAktiv(id) {
		if (!ta) return false;
		const v = ta.value, { s, e } = sel;
		if (id === 'italic') {
			// ikke aktiver italic hvis bold-omsluttet
			if (parOmslutter(v, s, e, PAR.bold.open, PAR.bold.close)) return false;
			const o = parOmslutter(v, s, e, '*', '*');
			if (!o) return false;
			// unngå at '*' fra '**' teller
			return v[o[0] + 1] !== '*' && v[o[1] - 2] !== '*';
		}
		return !!parOmslutter(v, s, e, PAR[id].open, PAR[id].close);
	}

	/** Valgt linje(r) har linjeprefikset? */
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
		markDirty();
	}

	/** Veksle par-markør rundt valgt tekst (utvid til hele spannet hvis delvis valgt). */
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
		if (v[o[0] + 1] === '*' || v[o[1] - 2] === '*') return null; // del av **
		return o;
	}

	/** Veksle linjeprefiks (BIBELREF/FOTNOTE) på alle markerte linjer. */
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
			// fjern eventuell annen linjemarkør først (BIBELREF og FOTNOTE utelukker hverandre)
			let ren = l;
			for (const p of andre) if (ren.startsWith(p)) ren = ren.slice(p.length);
			return alle ? ren.slice(prefiks.length).replace(/^ /, '') : (ren.startsWith(prefiks) ? ren : prefiks + ren);
		}).join('\n');
		const ny = v.slice(0, ls) + nyBlokk + v.slice(le);
		settVerdi(ny, ls, ls + nyBlokk.length);
	}

	// behold gamle funksjonsnavn som tynne omslag (brukes evt. andre steder)
	function markRole() { vekslePar('rolle'); }

</script>

{#if editing}
	<div class="et-edit">
		<div class="et-tools">
			{#if kind !== 'etikett'}
				<button class="et-tool" class:paa={parAktiv('rolle')} onmousedown={(e) => e.preventDefault()} onclick={() => vekslePar('rolle')} title={'Merk valgt tekst som rolle ({{r}} … {{/r}})'}>{@html mdi('account-voice', 15)}</button>
				<button class="et-tool" class:paa={parAktiv('bold')} onmousedown={(e) => e.preventDefault()} onclick={() => vekslePar('bold')} title="Fet (**tekst**)">{@html mdi('format-bold', 15)}</button>
				<button class="et-tool" class:paa={parAktiv('italic')} onmousedown={(e) => e.preventDefault()} onclick={() => vekslePar('italic')} title="Utskrift (*tekst*)">{@html mdi('format-italic', 15)}</button>
				<button class="et-tool" class:paa={parAktiv('sup')} onmousedown={(e) => e.preventDefault()} onclick={() => vekslePar('sup')} title={'Hevet versnummer (^{12})'}>{@html mdi('format-superscript', 15)}</button>
				<span class="et-skiller"></span>
				<button class="et-tool" class:paa={linjeAktiv('BIBELREF | ')} onmousedown={(e) => e.preventDefault()} onclick={() => veksleLinje('BIBELREF | ')} title="Merk linjen som bibelreferanse (BIBELREF | )">{@html mdi('book-open-variant', 15)}</button>
				<button class="et-tool" class:paa={linjeAktiv('FOTNOTE | ')} onmousedown={(e) => e.preventDefault()} onclick={() => veksleLinje('FOTNOTE | ')} title="Merk linjen som liten tekstnotis (FOTNOTE | )">{@html mdi('script-text-outline', 15)}</button>
				<span class="et-skiller"></span>
			{/if}
			<button class="primary" onclick={done}>Ferdig</button>
		</div>
		<textarea
			bind:this={ta}
			bind:value={value}
			spellcheck="false"
			rows={kind === 'etikett' ? 1 : Math.max(3, (value || '').split('\n').length + 1)}
			onchange={markDirty}
			onkeyup={oppdaterSel}
			onmouseup={oppdaterSel}
			oninput={oppdaterSel}
			onfocus={oppdaterSel}
			onkeydown={(e) => { if (e.key === 'Escape') done(); }}
		></textarea>
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
