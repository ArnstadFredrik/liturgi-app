<script>
	import { app, markDirty, uid } from '$lib/store.svelte.js';
	import { chooseOneModal } from '$lib/modal.svelte.js';
	import { bibSokModal } from '$lib/modal.svelte.js';
	import { toast } from 'svelte-sonner';
	import { openContextMenu } from '$lib/contextmenu.svelte.js';
	import EditableText from './EditableText.svelte';

	let { it, si, ii } = $props();

	const TYPE_LABEL = { tekst: 'Tekst', instruks: 'Instruks', salme: 'Salme', lesning: 'Lesning', bønn: 'Bønn' };

	const o = $derived(app.current);
	const items = $derived(o.sections[si].items);
	const showSalmeTekst = $derived(it.showSalmeTekst ?? false);

	function velgAlt() {
		chooseOneModal(it.alts, it.selAlt ?? 0, (idx) => { it.selAlt = idx; markDirty(); });
	}

	function move(dir) {
		const j = ii + dir;
		if (j < 0 || j >= items.length) return;
		[items[ii], items[j]] = [items[j], items[ii]];
		markDirty();
	}

	function toggle() {
		it.enabled = !it.enabled;
		markDirty();
	}

	function del() {
		items.splice(ii, 1);
		markDirty();
	}

	function nyttLedd(offset) {
		items.splice(ii + offset, 0, {
			id: uid(), type: 'tekst', heading: 'Nytt ledd', text: '', instr: '',
			alts: [], selAlt: null, enabled: true, optional: false, salmeNr: '', salmeTittel: ''
		});
		markDirty();
	}

	function context(e) {
		e.preventDefault();
		openContextMenu(e.clientX, e.clientY, [
			{ label: 'Flytt opp', action: () => move(-1), disabled: ii === 0 },
			{ label: 'Flytt ned', action: () => move(1), disabled: ii === items.length - 1 },
			'sep',
			{ label: 'Legg til del over', action: () => nyttLedd(0) },
			{ label: 'Legg til del under', action: () => nyttLedd(1) },
			{ label: 'Hent innhold fra hovedgudstjenesten …', action: () => hentFraBibliotek('innhold') },
			{ label: 'Hent ledd fra hovedgudstjenesten …', action: () => hentFraBibliotek('ledd') },
			'sep',
			{ label: it.enabled ? 'Fjern fra gudstjenesten' : 'Ta med i gudstjenesten', action: toggle },
			{ label: 'Slett leddet', action: del, danger: true }
		]);
	}

	/** Hent fra hovedgudstjenesten (sqlite-biblioteket).
	 *  mode 'innhold': ett valgt alternativ erstatter leddets innhold.
	 *  mode 'ledd': hele leddet med alle alternativer erstatter dette leddet. */
	function hentFraBibliotek(mode) {
		// søkeforslag: heading uten nummerering
		const def = it.heading.replace(/^[*\d–\-\s]+/, '').trim();
		bibSokModal(def, mode, (gruppe, alt) => {
			if (!gruppe) return;
			const alts = gruppe.rader.map((r) => ({ label: r.label, text: r.text }));
			if (mode === 'innhold' && alt) {
				it.text = alt.text;
				it.alts = [];
				it.selAlt = null;
			} else {
				it.heading = gruppe.ledd;
				it.text = '';
				it.alts = alts.length > 1 ? alts : [];
				it.selAlt = alts.length > 1 ? 0 : null;
				if (alts.length === 1) it.text = alts[0].text;
			}
			markDirty();
			toast.success('Hentet «' + gruppe.ledd + '» fra ' + gruppe.kilde);
		});
	}
</script>

<div class="item" class:off={!it.enabled} oncontextmenu={context}>
	<div class="item-head">
		<span class="item-eyebrow">
			{TYPE_LABEL[it.type] ?? 'Tekst'}{#if it.alts && it.alts.length}&nbsp;· {it.alts.length} alternativer{/if}
		</span>
		<span class="item-title" contenteditable="plaintext-only" spellcheck="false"
			onblur={(e) => { if (e.target.textContent !== it.heading) { it.heading = e.target.textContent; markDirty(); } }}
		>{it.heading}</span>
	</div>
	<div class="item-body">
		{#if app.showInstr && it.instr}
			<div class="instr-wrap">
				<span class="item-eyebrow">instr</span>
				<EditableText bind:value={it.instr} kind="instr" />
			</div>
		{/if}

		{#if it.type === 'salme'}
			<div class="salme-row">
				<input class="nr" placeholder="Nr" spellcheck="false" bind:value={it.salmeNr} onchange={markDirty} />
				<input class="tittel" placeholder="Salmens tittel" spellcheck="false" bind:value={it.salmeTittel} onchange={markDirty} />
				<button
					title="Legg inn / rediger salmetekst"
					onclick={() => { it.showSalmeTekst = !showSalmeTekst; markDirty(); }}>
					{showSalmeTekst ? 'Skjul tekst' : 'Tekst'}
				</button>
			</div>
			{#if showSalmeTekst}
				<EditableText bind:value={it.text} kind="lit" />
			{/if}
		{:else if it.alts && it.alts.length}
			{#if app.kind === 'template'}
				<div class="alts">
					{#each it.alts as a, ai (ai)}
						<label class="alt" class:sel={it.selAlt === ai}>
							<input type="radio" name="alt-{it.id}" checked={it.selAlt === ai}
								onchange={() => { it.selAlt = ai; markDirty(); }} />
							<span class="alt-col">
								<span class="alt-label">{a.label}{#if it.selAlt === ai}&nbsp;· standard i malen{/if}</span>
								<EditableText bind:value={a.text} kind="lit" />
							</span>
						</label>
					{/each}
				</div>
			{:else}
				{@const sel = it.alts[it.selAlt ?? 0]}
				<div class="alt-cur">
					<EditableText bind:value={sel.text} kind="lit" />
					<button class="alt-btn" onclick={() => velgAlt()}>
						Bytt alternativ ({(it.selAlt ?? 0) + 1} av {it.alts.length})
					</button>
				</div>
			{/if}
			{#if app.kind === 'template' && it.selAlt == null}
				<div class="instr">Velg et alternativ ⬆</div>
			{/if}
		{:else}
			<EditableText bind:value={it.text} kind="lit" />
		{/if}
	</div>
</div>
