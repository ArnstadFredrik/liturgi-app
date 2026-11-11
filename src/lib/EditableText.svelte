<script>
	import { tick } from 'svelte';
	import { markDirty } from '$lib/store.svelte.js';
	import { litHtml } from '$lib/lit.js';

	let { value = $bindable(''), kind = 'lit' } = $props(); // kind: 'lit' | 'instr'

	let editing = $state(false);
	let ta = $state(null);

	const cls = $derived(kind === 'instr' ? 'instr' : 'lit-text');

	function start() {
		editing = true;
		tick(() => { if (ta) { ta.focus(); ta.selectionStart = ta.value.length; } });
	}

	function done() {
		editing = false;
		markDirty();
	}

	function markRole() {
		if (!ta) return;
		const s = ta.selectionStart, e = ta.selectionEnd;
		if (s === e) return;
		const v = ta.value;
		ta.value = v.slice(0, s) + '{{r}}' + v.slice(s, e) + '{{/r}}' + v.slice(e);
		value = ta.value;
		ta.selectionStart = s;
		ta.selectionEnd = e + 10;
		ta.focus();
	}

	function unmarkRole() {
		if (!ta) return;
		let s = ta.selectionStart, e = ta.selectionEnd;
		const v = ta.value;
		// utvid til hele markørparet hvis deler av det er valgt
		const open = v.lastIndexOf('{{r}}', s - 1);
		const close = v.indexOf('{{/r}}', Math.max(e - 6, 0));
		const closeInside = v.slice(s, e).indexOf('{{/r}}');
		const openInside = v.slice(s, e).indexOf('{{r}}');
		if (openInside !== -1) {
			if (open !== -1 && open < s) s = open;
			const pe = v.indexOf('{{/r}}', s);
			if (pe !== -1) e = pe + 6;
		} else if (closeInside === -1 && open !== -1 && close !== -1 && open < s && close + 6 >= e) {
			s = open;
			e = close + 6;
		}
		const seg = v.slice(s, e).replace(/\{\{\/?r\}\}/g, '');
		ta.value = v.slice(0, s) + seg + v.slice(e);
		value = ta.value;
		ta.selectionStart = ta.selectionEnd = s;
		ta.focus();
	}

</script>

{#if editing}
	<div class="et-edit">
		<div class="et-tools">
			<span class="et-hint">Merk opp tekst, så:</span>
			<button onmousedown={(e) => e.preventDefault()} onclick={markRole} title="Merk valgt tekst som rolle">Markér rolle</button>
			<button onmousedown={(e) => e.preventDefault()} onclick={unmarkRole} title="Fjern rollemerke fra valgt tekst">Fjern rolle</button>
			<button class="primary" onclick={done}>Ferdig</button>
		</div>
		<textarea
			bind:this={ta}
			bind:value={value}
			spellcheck="false"
			rows={Math.max(3, (value || '').split('\n').length + 1)}
			onchange={markDirty}
			onkeydown={(e) => { if (e.key === 'Escape') done(); }}
		></textarea>
	</div>
{:else}
	<div class={cls} onclick={start}>
		{#if value}
			{@html litHtml(value)}
		{:else}
			<span class="et-empty">[Klikk for å skrive]</span>
		{/if}
	</div>
{/if}
