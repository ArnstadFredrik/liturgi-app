<script>
	import { app, persist, markDirty, uid, closeEditor, insertSectionsFromTemplate } from '$lib/store.svelte.js';
	import { mdi } from '$lib/mdi.js';
	import { confirmBox, chooseSectionsModal, prompt, velgTeksterModal, skriftBokstav, delGruppeModal, alternativModal } from '$lib/modal.svelte.js';
	import { nlDate } from '$lib/export.js';
	import { saveCurrent } from '$lib/fileio.svelte.js';
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
		// linje-markør: over/under midten bestemmer OM leddet (før) eller ETTER
		const r = e.currentTarget.getBoundingClientRect();
		dragOver = { si, ii, før: e.clientY < r.top + r.height / 2 };
	}
	function onDrop(e, si, ii) {
		e.preventDefault();
		try {
			const from = JSON.parse(e.dataTransfer.getData('text/plain'));
			const mål = dragOver ?? { si, ii, før: true };
			// samme posisjon? (samme seksjon og allerede rett før/etter målet)
			sammePosisjon: if (!(from.si === mål.si && from.ii === mål.ii && mål.før) &&
				!(from.si === mål.si && from.ii === mål.ii - 1 && !mål.før)) {
				// innsettingsindeks: før = ii, etter = ii + 1
				let target = mål.før ? ii : ii + 1;
				if (from.si === mål.si && from.ii < target) target--;
				const [moved] = o.sections[from.si].items.splice(from.ii, 1);
				o.sections[mål.si].items.splice(target, 0, moved);
				markDirty();
			}
		} catch { /* ugyldig data — ignorer */ }
		dragOver = null;
	}
	function onDragEnd() {
		dragOver = null;
	}

	const harDelGrupper = $derived(!!(app.current?.sections ?? []).some((s) => s.delGruppe));

	function velgDelGruppe(sec) {
		// del-gruppe: markerer seksjonen slik at «Ny gravferd» vet hvilken
		// variant den er — uavhengig av tittelen. Gruppelista lagres på malen
		// og kan utvides/slettes i modalen.
		delGruppeModal(app.current, sec);
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

	function flyttSeksjon(si, retning) {
		const til = si + retning;
		if (til < 0 || til >= o.sections.length) return;
		const [sec] = o.sections.splice(si, 1);
		o.sections.splice(til, 0, sec);
		markDirty();
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

<svelte:window
	onkeydown={(e) => {
		// ⌘S / Ctrl+S lagrer
		if ((e.metaKey || e.ctrlKey) && e.key === 's') {
			e.preventDefault();
			onSave();
		}
	}}
/>

<div id="editor" class:skjul-roller={!(app.current?.visRoles ?? true)} class:skjul-salmeinfo={!(app.current?.visSalmeinfo ?? true)}>	<header id="ed-head">
		<input id="ed-name" bind:value={o.name} oninput={markDirty} placeholder="Navn på gudstjenesten" spellcheck="false" />
	</header>
	<div id="ed-date-line">{nlDate(o.date)}{#if o.kirkeaar}&nbsp;– {o.kirkeaar.name}{/if}</div>

	{#each o.sections as sec, si (si)}
		<div class="section" id="sec-{si}">
			<div class="sec-head">
				<span class="sec-title" contenteditable="plaintext-only" spellcheck="false"
					onblur={(e) => { if (e.target.textContent !== sec.title) { sec.title = e.target.textContent; markDirty(); } }}
				>{sec.title}</span>
				{#if app.kind === 'template'}
					<button class="sec-delgruppe" title="Del-gruppe: bruker «Ny gravferd» til å velge denne delen (uavhengig av tittelen)" onclick={() => velgDelGruppe(sec)}>{@html mdi("tag-outline", 13)} {sec.delGruppe ?? 'Del-gruppe'}</button>
					<button class="sec-delgruppe" title="Alternativ: delen tas kun med når «Med dåp»/«Med nattverd» er på ved oppretting" onclick={() => alternativModal(sec)}>{@html mdi("checkbox-marked-outline", 13)} {sec.alternativ ? (sec.alternativ[0].toUpperCase() + sec.alternativ.slice(1)) : 'Alternativ'}</button>
				{:else if harDelGrupper}
					<span class="sec-delgruppe sec-delgruppe-stat" title="Del-gruppe">{sec.delGruppe ? sec.delGruppe[0].toUpperCase() + sec.delGruppe.slice(1) : 'Standard'}</span>
				{/if}
				{#if app.kind === 'service' && sec.alternativ}
					<span class="sec-delgruppe sec-delgruppe-stat" title="Alternativ">{sec.alternativ[0].toUpperCase() + sec.alternativ.slice(1)}</span>
				{/if}
				<button class="sec-flytt" title="Flytt avsnittet opp" onclick={() => flyttSeksjon(si, -1)} disabled={si === 0}>{@html mdi("arrow-up", 13)}</button>
				{#if /skriftlesning/i.test(sec.title) && sec.items.length >= 5}
					<button class="sec-velg-tekster" title="Velg hvilke tekster som skal være med" onclick={() => velgTeksterModal(sec)}>{@html mdi("format-list-bulleted", 14)} Velg tekster …</button>
				{/if}
				<button class="sec-flytt" title="Flytt avsnittet ned" onclick={() => flyttSeksjon(si, 1)} disabled={si === o.sections.length - 1}>{@html mdi("arrow-down", 13)}</button>
				<button onclick={() => addItem(si)}>+ ledd</button>
				<button class="del-sec" title="Slett hele avsnittet" onclick={() => delSection(si)}>{@html mdi("delete-outline", 14)}</button>
			</div>
			<div class="sec-items">
				{#each sec.items as it, ii (it.id)}
					{#if !(app.kind === 'service' && /skriftlesning/i.test(sec.title) && it.enabled === false)}
					<!-- uvalgte skriftlesninger er skjult i gudstjenester — velges på nytt via «Velg tekster …» -->
					<div
						class="dnd-wrap"
						class:drag-target={dragOver && dragOver.si === si && dragOver.ii === ii && dragOver.før}
						class:drag-target-etter={dragOver && dragOver.si === si && dragOver.ii === ii && !dragOver.før}
						draggable={draggable}
						onmousedown={(e) => {
							// kun dra fra leddhodet — ikke fra tittel/tekst/input/contenteditable
							draggable = !!e.target.closest('.item-head') && !e.target.closest('[contenteditable], input, textarea');
						}}
						ondragstart={(e) => onDragStart(e, si, ii)}
						ondragover={(e) => onDragOver(e, si, ii)}
						ondrop={(e) => onDrop(e, si, ii)}
						ondragend={onDragEnd}
					>
						<Item {it} {si} {ii} bokstav={/skriftlesning/i.test(sec.title) ? skriftBokstav(it, ii) : null} />
					</div>
					{/if}
				{/each}
			</div>
		</div>
	{/each}

	<div id="add-area">
		{#if app.kind === 'service'}
			<button onclick={hentFraMal}>Hent del fra mal</button>
		{/if}
	</div>
</div>
