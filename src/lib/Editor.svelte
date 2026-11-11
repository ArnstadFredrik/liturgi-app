<script>
	import { app, persist, markDirty, saveAsTemplate, uid, closeEditor, insertSectionsFromTemplate } from '$lib/store.svelte.js';
	import { prompt, confirmBox, chooseSectionsModal } from '$lib/modal.svelte.js';
	import { exportWord, exportPptx, exportPdf, nlDate } from '$lib/export.js';
	import { toast } from 'svelte-sonner';
	import { saveCurrentToFile, saveCurrent, saveAsTemplateOnDisk } from '$lib/fileio.svelte.js';
	import Item from './Item.svelte';

	const isElectron = typeof window !== 'undefined' && !!window.liturgi?.isElectron;

	const o = $derived(app.current);

	/* drag-and-drop: egen HTML5-implementasjon. si/ii bæres i dataTransfer slik at
	   drop alltid leser ferske verdier (unngår stale state mellom dragstart og drop). */
	let dragOver = $state(null); // {si, ii}
	let draggable = $state(false); // per-ledd: satt til true ved mousedown i leddhodet

	function onDragStart(e, si, ii) {
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('text/plain', JSON.stringify({ si, ii }));
		window.__dsLog?.push('onDragStart si=' + si + ' ii=' + ii);
	}
	function onDragOver(e, si, ii) {
		e.preventDefault();
		e.dataTransfer.dropEffect = 'move';
		dragOver = { si, ii };
	}
	function onDrop(e, si, ii) {
		e.preventDefault();
		window.__dsLog?.push('onDrop si=' + si + ' ii=' + ii);
		try {
			const from = JSON.parse(e.dataTransfer.getData('text/plain'));
			if (from && !(from.si === si && from.ii === ii)) {
				const [moved] = o.sections[from.si].items.splice(from.ii, 1);
				let target = ii;
				if (from.si === si && from.ii < ii) target = ii - 1;
				o.sections[si].items.splice(target, 0, moved);
				markDirty();
			}
		} catch { /* ugyldig data — ignorer */ }
		dragOver = null;
	}
	function onDragEnd() {
		dragOver = null;
	}

	function addItem(si) {
		prompt('Nytt ledd', 'Tittel på leddet', (title) => {
			o.sections[si].items.push({
				id: uid(), type: 'tekst', heading: title || 'Nytt ledd', text: '', instr: '',
				alts: [], selAlt: null, enabled: true, optional: false, salmeNr: '', salmeTittel: ''
			});
			markDirty();
		});
	}

	function addSection() {
		prompt('Nytt hovedavsnitt', 'Navn på avsnittet', (title) => {
			o.sections.push({ title: title || 'Nytt avsnitt', items: [] });
			markDirty();
		});
	}

	function delSection(si) {
		confirmBox('Slett avsnitt', `Slette hele avsnittet «${o.sections[si].title}» med ${o.sections[si].items.length} ledd?`, () => {
			o.sections.splice(si, 1);
			markDirty();
		});
	}

	function addAlt() {
		const items = o.sections.flatMap((s) => s.items);
		const item = items.at(-1);
		if (!item) return;
		item.alts = item.alts ?? [];
		item.alts.push({ label: `Alternativ ${String.fromCharCode(97 + item.alts.length)}`, text: '[Skriv tekst her]' });
		item.selAlt = item.alts.length - 1;
		markDirty();
	}

	function onSave() {
		saveCurrent();
	}

	function onSaveTpl() {
		if (isElectron) {
			prompt('Lagre som lokal mal', 'Navn på malen', (name) => saveAsTemplateOnDisk(name), o.name + ' (grunnordning)');
		} else {
			prompt('Lagre som lokal mal', 'Navn på malen', (name) => saveAsTemplate(name), o.name + ' (grunnordning)');
		}
	}

	async function doWord() {
		try {
			await exportWord(o, app.showInstr);
			toast.success('Word-fil eksportert');
		} catch (e) {
			toast.error('Klarte ikke eksportere Word: ' + e.message);
		}
	}
	async function doPptx() {
		try {
			await exportPptx(o);
			toast.success('PowerPoint eksportert');
		} catch (e) {
			toast.error('Klarte ikke eksportere PowerPoint: ' + e.message);
		}
	}

	function hentFraMal() {
		const tpl = app.templates.find((t) => t.id === o.templateId);
		if (!tpl) return;
		const missing = tpl.sections.map((s) => s.title).filter((t) => !o.sections.some((s) => s.title === t));
		if (!missing.length) {
			confirmBox('Hent del fra mal', 'Alle deler fra malen ligger allerede i gudstjenesten.', () => {});
			return;
		}
		chooseSectionsModal(missing, (valgte) => {
			if (!valgte.length) return;
			insertSectionsFromTemplate(o, valgte);
			markDirty();
		});
	}
</script>

<div id="editor">
	<header id="ed-head">
		<input id="ed-name" bind:value={o.name} oninput={markDirty} placeholder="Navn på gudstjenesten" spellcheck="false" />
		{#if app.kind === 'service'}
			<input type="date" bind:value={o.date} onchange={markDirty} />
		{/if}
		<div id="ed-actions">
			<button onclick={onSave} title="Lagre">💾 Lagre</button>
			<button onclick={saveCurrentToFile} title="Lagre som ny fil på disk">Lagre som …</button>
			{#if app.kind === 'service'}
				<button onclick={onSaveTpl} title="Lagre som lokal mal">Lagre som mal</button>
			{/if}
			<button onclick={exportPdf}>PDF</button>
			<button onclick={doWord}>Word</button>
			<button onclick={doPptx}>PowerPoint</button>
			<button onclick={() => confirmBox('Lukk', 'Lukke redigeringen?', closeEditor)}>✕</button>
		</div>
	</header>
	<div id="ed-meta">
		{#if app.kind === 'service'}
			Basert på mal: {o.templateName}
			{#if o.kirkeaar}&nbsp;· ☀️ {o.kirkeaar.name}{#if o.kirkeaar.color}&nbsp;({o.kirkeaar.color}){/if}{/if}
		{:else}
			Lokal mal (grunnordning)
		{/if}
		{#if app.dirty}<span class="dirty">• ulagrede endringer</span>{/if}
	</div>
	<div id="ed-date-line">{nlDate(o.date)}{#if o.kirkeaar}&nbsp;– {o.kirkeaar.name}{/if}</div>

	{#each o.sections as sec, si (si)}
		<div class="section" id="sec-{si}">
			<div class="sec-head">
				<span class="sec-title" contenteditable="plaintext-only" spellcheck="false"
					onblur={(e) => { if (e.target.textContent !== sec.title) { sec.title = e.target.textContent; markDirty(); } }}
				>{sec.title}</span>
				<button onclick={() => addItem(si)}>+ ledd</button>
				<button class="del-sec" title="Slett hele avsnittet" onclick={() => delSection(si)}>🗑</button>
			</div>
			<div class="sec-items">
				{#each sec.items as it, ii (it.id)}
					<div
						class="dnd-wrap"
						class:drag-target={dragOver && dragOver.si === si && dragOver.ii === ii}
						draggable={draggable}
						onmousedown={(e) => {
							// kun dra fra leddhodet — ikke fra tittel/tekst/input/contenteditable
							draggable = !!e.target.closest('.item-head') && !e.target.closest('[contenteditable], input, textarea');
						}}
						ondragover={(e) => onDragOver(e, si, ii)}
						ondrop={(e) => onDrop(e, si, ii)}
						ondragend={onDragEnd}
					>
						<Item {it} {si} {ii} />
					</div>
				{/each}
			</div>
		</div>
	{/each}

	<div id="add-area">
		{#if app.kind === 'service'}
			<button onclick={hentFraMal}>Hent del fra mal</button>
		{/if}
		<button onclick={addSection}>+ Nytt hovedavsnitt</button>
		<button onclick={addAlt}>+ Alternativ til siste ledd</button>
	</div>
</div>
