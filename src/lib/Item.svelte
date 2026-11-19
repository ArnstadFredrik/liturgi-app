<script>
	import { app, markDirty, uid } from '$lib/store.svelte.js';
	import { chooseOneModal, valgModal } from '$lib/modal.svelte.js';
	import { bibSokModal } from '$lib/modal.svelte.js';
	import { toast } from 'svelte-sonner';
	import { openContextMenu } from '$lib/contextmenu.svelte.js';
	import { sorterPrefasjoner } from '$lib/modal.svelte.js';
	import { mdi } from '$lib/mdi.js';
	import { formaterSalme, salmeAlts } from '$lib/lit.js';
	import EditableText from './EditableText.svelte';
	import { nyVimTilstand } from '$lib/vim.js';
	import { veksleVim } from '$lib/store.svelte.js';
	let vimSt = nyVimTilstand();
	$effect(() => { if (app.vimModus) vimSt = nyVimTilstand(); });

	let { it, si, ii } = $props();

	const TYPE_LABEL = { tekst: 'Tekst', instruks: 'Instruks', salme: 'Salme', lesning: 'Lesning', bønn: 'Bønn' };

	const o = $derived(app.current);
	const items = $derived(o.sections[si].items);
	const showSalmeTekst = $derived(it.showSalmeTekst ?? false);
	const introAltsLen = $derived(it.introAlts?.length ?? 0);
	const avslAltsLen = $derived(it.avslutningAlts?.length ?? 0);

	function velgAlt() {
		// prefasjoner (kirkeårsprefasjoner + nattverdbønn a–g): sorter kirkeårsbestemte
		// først med aktuell periode øverst — gjenkjenning på labels
		const erPref = it.alts?.some((a) => /^(Advent|Jul og Maria|Åpenbaringstiden|Faste|Påske|Kristi himmel|Pinse$|Treenighetstiden|Allehelgen|Nattverdbønn)/i.test(a.label ?? ''));
		const sortert = erPref ? sorterPrefasjoner(it.alts, o?.date, o?.kirkeaar?.period) : it.alts;
		chooseOneModal(sortert, it.selAlt ?? 0, (idx) => {
			// velg-idx gjelder den SORTERTE lista — map tilbake til original
			const valgtObj = sortert[idx];
			const origIdx = it.alts.indexOf(valgtObj);
			it.selAlt = origIdx >= 0 ? origIdx : idx;
			markDirty();
		});
	}

	// salmedatabasen (gudstjeneste.no): hent salmetekst i bakgrunnen
	let henterSalme = $state(false);

	async function hentSalmeTekst() {
		if (henterSalme) return;
		const nr = String(it.salmeNr ?? '').trim();
		const tittel = String(it.salmeTittel ?? '').trim();
		if (!nr && !tittel) { toast.error('Fyll inn salmenummer eller tittel først'); return; }
		if (!window.liturgi?.salmeHent) { toast.error('Salmedatabasen er kun tilgjengelig i Mac-appen'); return; }
		henterSalme = true;
		try {
			const r = await window.liturgi.salmeHent({
				nr,
				tittel,
				dato: o.date ?? '',
				navn: o.liturgiType === 'gravferd' ? 'Gravferd' : 'Gudstjeneste'
			});
			if (!r?.ok) {
				toast.error(r?.error === 'Ikke konfigurert'
					? 'Registrer bruker for gudstjeneste.no i Innstillinger'
					: (r?.error ?? 'Klarte ikke hente salmen'));
				return;
			}
			it.salmeTittel = it.salmeTittel || (r.tittel ?? '');
			const d = salmeAlts(formaterSalme(r.tekst));
			it.text = d.text;
			if (d.alts.length > 1) { it.alts = d.alts; it.selAlt = 0; }
			it.showSalmeTekst = true;
			markDirty();
			toast.success('Hentet «' + r.tittel + '» fra salmedatabasen');
		} catch (err) {
			toast.error('Klarte ikke hente salmen: ' + (err?.message ?? err));
		} finally {
			henterSalme = false;
		}
	}

	/* ---------- alternativ-forvaltning i malredigering ---------- */
	const erMal = $derived(app.kind === 'template');

	/** Legg til et nytt (tomt) alternativ i listen — valgt som gjeldende. */
	function leggTilAlt(liste, nokkel, selNokkel) {
		if (!Array.isArray(it[liste])) it[liste] = [];
		it[liste].push({ label: nokkel === 'alts' ? 'Alternativ ' + String.fromCharCode(97 + it[liste].length) : '', text: '' });
		if (selNokkel) it[selNokkel] = it[liste].length - 1;
		markDirty();
	}

	/** Fjern alternativet fra listen (kontekstmeny/modal); selAlt/Intro/Avsl rettes. */
	function fjernAlt(liste, idx, selNokkel) {
		const l = it[liste];
		if (!Array.isArray(l) || l.length <= 1) { toast.error('Minst ett alternativ må være igjen'); return; }
		l.splice(idx, 1);
		if (selNokkel && it[selNokkel] != null) {
			if (it[selNokkel] >= idx) it[selNokkel] = Math.max(0, it[selNokkel] - 1);
			if (it[selNokkel] >= l.length) it[selNokkel] = l.length - 1;
		}
		markDirty();
	}

	/** Velg ett av alternativene i en liste (kontekstmeny-modal). */
	function velgFra(liste, idx, selNokkel, tittel) {
		const l = it[liste] ?? [];
		chooseOneModal(l, it[selNokkel] ?? 0, (ny) => { if (selNokkel) it[selNokkel] = ny; markDirty(); });
	}

	/** Innledning/avslutning: opprett gruppen ved første alternativ. */
	function opprettGruppe(liste, selNokkel, label) {
		it[liste] = [{ label, text: '' }];
		if (selNokkel) it[selNokkel] = 0;
		markDirty();
	}

	/** Kontekstmeny for en alternativgruppe i malredigering. */
	/** Fjern HELE gruppen — bekreftes hvis den har innhold (ikke forkast uten videre). */
	function fjernGruppe(liste, selNokkel, label) {
		const l = it[liste] ?? [];
		const harInnhold = l.some((a) => (a.text ?? '').trim());
		const slett = () => {
			delete it[liste];
			if (selNokkel) delete it[selNokkel];
			markDirty();
			toast.success(label + ' er fjernet');
		};
		if (!harInnhold) { slett(); return; }
		valgModal(
			'Fjern ' + label.toLowerCase() + '?',
			'«' + (it.heading || label) + '» har ' + l.length + ' alternativ(er) med innhold. Fjern hele gruppen?',
			'Fjern', 'Avbryt',
			slett
		);
	}

	function altMeny(e, liste, selNokkel, label) {
		e.preventDefault();
		const l = it[liste];
		const har = Array.isArray(l) && l.length;
		const radLabel = (i) => (l[i]?.label || 'Alternativ ' + String.fromCharCode(97 + i));
		openContextMenu(e.clientX, e.clientY, [
			...(har ? [{ label: 'Legg til alternativ', action: () => leggTilAlt(liste, selNokkel === 'selIntro' || selNokkel === 'selAvsl' ? liste : liste, selNokkel) }] : []),
			...(har ? [{ label: 'Legg til tomt alternativ fra biblioteket …', action: () => hentAltFraBib(liste, selNokkel) }] : []),
			...(har ? ['sep'] : []),
			...(har ? l.map((a, i) => ({
				label: (selNokkel && it[selNokkel] === i ? '✓ ' : '') + radLabel(i),
				action: () => { if (selNokkel) it[selNokkel] = i; markDirty(); }
			})) : []),
			...(har ? ['sep'] : []),
			...(har && l.length > 1 ? [{ label: 'Fjern dette alternativet …', action: () => velgFjern(liste, selNokkel, label) }] : []),
			...(har && l.length > 1 ? [{ label: 'Fjern siste alternativ', action: () => fjernAlt(liste, l.length - 1, selNokkel) }] : []),
			...(!har ? [{ label: 'Opprett «' + label + '»-gruppe', action: () => opprettGruppe(liste, selNokkel, label) }] : []),
			...(har && (selNokkel === 'selIntro' || selNokkel === 'selAvsl') ? [
				{ label: 'Fjern hele ' + label.toLowerCase(), action: () => fjernGruppe(liste, selNokkel), danger: true }
			] : []),
			...(!har ? [{ label: 'Hent fra biblioteket …', action: () => hentGruppeFraBib(liste, selNokkel, label) }] : [])
		]);
	}

	/** Fjern-alternativ: velg hvilken (modal). */
	function velgFjern(liste, selNokkel, label) {
		const l = it[liste];
		chooseOneModal(l, it[selNokkel] ?? 0, (ny) => fjernAlt(liste, ny, selNokkel));
	}

	/** Hent ET alternativ fra biblioteket inn i gruppen (legg til som nytt). */
	function hentAltFraBib(liste, selNokkel) {
		const def = it.heading.replace(/^[*\d–\-\s]+/, '').trim();
		bibSokModal(def, 'innhold', (gruppe, alt) => {
			if (!gruppe || !alt) return;
			if (!Array.isArray(it[liste])) it[liste] = [];
			it[liste].push({ label: alt.label || 'Alternativ ' + String.fromCharCode(97 + it[liste].length), text: alt.text });
			if (selNokkel) it[selNokkel] = it[liste].length - 1;
			markDirty();
			toast.success('Alternativet er lagt til ' + (liste === 'alts' ? 'i Alternativer' : liste === 'introAlts' ? 'i Innledningen' : 'i Avslutningen'));
		});
	}

	/** Hent en HELT bibliotek-gruppe som alternativgruppe (alle rader). */
	function hentGruppeFraBib(liste, selNokkel, label) {
		const def = it.heading.replace(/^[*\d–\-\s]+/, '').trim();
		bibSokModal(def, 'ledd', (gruppe) => {
			if (!gruppe) return;
			const alts = gruppe.rader.map((r) => ({ label: r.label || '', text: r.text }));
			if (alts.length) { it[liste] = alts; if (selNokkel) it[selNokkel] = 0; markDirty(); toast.success('Hentet ' + alts.length + ' alternativer fra ' + gruppe.kilde); }
			else toast.error('Gruppen har ingen alternativer');
		});
	}

	function velgIntro() {
		chooseOneModal(it.introAlts, it.selIntro ?? 0, (idx) => { it.selIntro = idx; markDirty(); });
	}

	function velgAvsl() {
		chooseOneModal(it.avslutningAlts, it.selAvsl ?? 0, (idx) => { it.selAvsl = idx; markDirty(); });
	}

	/** Skift leddets type (tekst/salme/instruks/lesning/bønn) — teksten beholder. */
	function skiftType() {
		const typer = ['tekst', 'salme', 'instruks', 'lesning', 'bønn'].map((t) => ({ label: TYPE_LABEL[t], text: t }));
		chooseOneModal(typer, Math.max(0, typer.findIndex((t) => t.text === it.type)), (idx) => {
			const ny = typer[idx]?.text;
			if (!ny || ny === it.type) return;
			it.type = ny;
			if (ny === 'salme') {
				it.salmeNr = it.salmeNr ?? '';
				it.salmeTittel = it.salmeTittel ?? '';
				it.showSalmeTekst = it.showSalmeTekst ?? false;
			}
			markDirty();
			toast.success('Leddets type er endret til ' + TYPE_LABEL[ny]);
		});
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
		const o = app.current;
		openContextMenu(e.clientX, e.clientY, [
			{ label: app.vimModus ? 'Skru av vim-modus' : 'Skru på vim-modus', action: () => veksleVim() },
			{ label: 'Flytt opp', action: () => move(-1), disabled: ii === 0 },
			{ label: 'Flytt ned', action: () => move(1), disabled: ii === items.length - 1 },
			'sep',
			{ label: 'Legg til del over', action: () => nyttLedd(0) },
			{ label: 'Legg til del under', action: () => nyttLedd(1) },
			{ label: 'Hent innhold fra biblioteket …', action: () => hentFraBibliotek('innhold') },
			{ label: 'Hent ledd fra biblioteket …', action: () => hentFraBibliotek('ledd') },
			// malredigering: innledning/avslutning er TOGGLES (et ledd har høyst én av hver) —
			// optakt/fjerning av alternativer skjer i gruppens egen meny (tannhjul)
			...(erMal ? [
				{ label: 'Innledning', checked: introAltsLen > 0, action: () => introAltsLen ? fjernGruppe('introAlts', 'selIntro', 'Innledning') : opprettGruppe('introAlts', 'selIntro', 'Innledning') },
				{ label: 'Avslutning', checked: avslAltsLen > 0, action: () => avslAltsLen ? fjernGruppe('avslutningAlts', 'selAvsl', 'Avslutning') : opprettGruppe('avslutningAlts', 'selAvsl', 'Avslutning') }
			] : []),
			{ label: 'Skift type …', action: skiftType },
			'sep',
			{ label: (o?.visInstr ?? true) ? '✓ Vis instruksjoner' : 'Vis instruksjoner', action: () => { if (o) { o.visInstr = !(o.visInstr ?? true); markDirty(); } } },
			{ label: (o?.visRoles ?? true) ? '✓ Vis roller' : 'Vis roller', action: () => { if (o) { o.visRoles = !(o.visRoles ?? true); markDirty(); } } },
			{ label: (o?.visSalmeinfo ?? true) ? '✓ Vis salmeinfo' : 'Vis salmeinfo', action: () => { if (o) { o.visSalmeinfo = !(o.visSalmeinfo ?? true); markDirty(); } } },
			'sep',
			{ label: it.enabled ? 'Fjern fra gudstjenesten' : 'Ta med i gudstjenesten', action: toggle },
			'sep',
			{ label: 'Eksportér …', action: () => { app.visning = 'eksport'; } },
			{ label: 'Eksportér aktiv profil', action: () => { app.visning = 'eksport'; window.__eksportKunAktiv = true; } },
			'sep',
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

<div class="item" class:off={it.enabled === false} oncontextmenu={context}>
	<div class="item-head">
		<span class="item-eyebrow">
			{TYPE_LABEL[it.type] ?? 'Tekst'}{#if it.alts && it.alts.length}&nbsp;· {it.alts.length} alternativer{/if}
		</span>
		<span class="item-title" contenteditable="plaintext-only" spellcheck="false"
			onblur={(e) => { if (e.target.textContent !== it.heading) { it.heading = e.target.textContent; markDirty(); } }}
		>{it.heading}</span>
		{#if app.kind === 'template'}
			<label class="ta-med" title="Skal leddet være med når en gudstjeneste opprettes fra malen?">
				<input type="checkbox" checked={it.enabled !== false} onchange={(e) => { it.enabled = e.currentTarget.checked; markDirty(); }} />
				ta med
			</label>
		{/if}
	</div>
	<div class="item-body">
		{#if (app.current?.visInstr ?? true) && it.instr}
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
					class="salme-hent"
					title="Søk opp og hent salmeteksten fra Den norske kirkes salmedatabase"
					onclick={hentSalmeTekst}
					disabled={henterSalme}>
					{#if henterSalme}{@html mdi('loading', 15)} Henter …{:else}{@html mdi('cloud-download', 15)} Hent tekst{/if}
				</button>
				<button
					title="Legg inn / rediger salmetekst"
					onclick={() => { it.showSalmeTekst = !showSalmeTekst; markDirty(); }}>
					{showSalmeTekst ? 'Skjul tekst' : 'Tekst'}
				</button>
			</div>
			{#if showSalmeTekst}
				{#if it.alts && it.alts.length}
					<button class="alt-btn" onclick={velgAlt} title="Velg språkversjon">
						Bytt språk ({(it.selAlt ?? 0) + 1} av {it.alts.length}{it.alts[it.selAlt ?? 0]?.label ? ': ' + it.alts[it.selAlt ?? 0].label : ''})
					</button>
					<EditableText bind:value={it.alts[it.selAlt ?? 0].text} kind="lit" vimAktiv={app.vimModus} vimSt={vimSt} />
				{:else}
					<EditableText bind:value={it.text} kind="lit" vimAktiv={app.vimModus} vimSt={vimSt} />
				{/if}
			{/if}
		{:else if it.alts && it.alts.length}
			{#if introAltsLen}
				<div class="alt-gruppe-tittel">Innledning{#if erMal}&nbsp;<button class="alt-red" onclick={(e) => altMeny(e, 'introAlts', 'selIntro', 'Innledning')} title="Administrer innledningsalternativer">{@html mdi('cog', 12)}</button>{/if}</div>
				<div class="alt-cur">
					<EditableText bind:value={it.introAlts[it.selIntro ?? 0].text} kind="lit" vimAktiv={app.vimModus} vimSt={vimSt} />
					<button class="alt-btn" onclick={() => velgIntro()}>
						Bytt innledning ({(it.selIntro ?? 0) + 1} av {introAltsLen})
					</button>
					{#if erMal}<button class="alt-red" onclick={() => leggTilAlt('introAlts', 'selIntro')} title="Nytt tomt innledningsalternativ">{@html mdi('plus', 13)}</button>{/if}
				</div>
			{/if}
			{#if it.text && it.text.trim()}
				<div class="alt-gruppe-tittel">Fast innledning</div>
				<EditableText bind:value={it.text} kind="lit" vimAktiv={app.vimModus} vimSt={vimSt} />
			{/if}
			<div class="alt-gruppe-tittel">Alternativer{#if erMal}&nbsp;<button class="alt-red" onclick={(e) => altMeny(e, 'alts', null, 'Alternativer')} title="Administrer alternativer">{@html mdi('cog', 12)}</button>{/if}</div>
			{@const sel = it.alts[it.selAlt ?? 0]}
			<div class="alt-cur">
				<EditableText bind:value={sel.text} kind="lit" vimAktiv={app.vimModus} vimSt={vimSt} />
				<button class="alt-btn" onclick={() => velgAlt()}>
					Bytt alternativ ({(it.selAlt ?? 0) + 1} av {it.alts.length})
				</button>
				{#if erMal}<button class="alt-red" onclick={() => leggTilAlt('alts', null)} title="Nytt tomt alternativ">{@html mdi('plus', 13)} Alternativ</button>{/if}
			</div>
			{#if avslAltsLen}
				<div class="alt-gruppe-tittel">Avslutning{#if erMal}&nbsp;<button class="alt-red" onclick={(e) => altMeny(e, 'avslutningAlts', 'selAvsl', 'Avslutning')} title="Administrer avslutningsalternativer">{@html mdi('cog', 12)}</button>{/if}</div>
				<div class="alt-cur">
					<EditableText bind:value={it.avslutningAlts[it.selAvsl ?? 0].text} kind="lit" vimAktiv={app.vimModus} vimSt={vimSt} />
					<button class="alt-btn" onclick={() => velgAvsl()}>
						Bytt avslutning ({(it.selAvsl ?? 0) + 1} av {avslAltsLen})
					</button>
					{#if erMal}<button class="alt-red" onclick={() => leggTilAlt('avslutningAlts', 'selAvsl')} title="Nytt tomt avslutningsalternativ">{@html mdi('plus', 13)}</button>{/if}
				</div>
			{/if}
		{:else}
			{#if erMal && introAltsLen}
				<div class="alt-gruppe-tittel">Innledning&nbsp;<button class="alt-red" onclick={(e) => altMeny(e, 'introAlts', 'selIntro', 'Innledning')} title="Administrer innledningsalternativer">{@html mdi('cog', 12)}</button></div>
				<div class="alt-cur">
					<EditableText bind:value={it.introAlts[it.selIntro ?? 0].text} kind="lit" vimAktiv={app.vimModus} vimSt={vimSt} />
					<button class="alt-btn" onclick={() => velgIntro()}>
						Bytt innledning ({(it.selIntro ?? 0) + 1} av {introAltsLen})
					</button>
					<button class="alt-red" onclick={() => leggTilAlt('introAlts', 'selIntro')} title="Nytt tomt innledningsalternativ">{@html mdi('plus', 13)}</button>
				</div>
			{/if}
			<EditableText bind:value={it.text} kind="lit" vimAktiv={app.vimModus} vimSt={vimSt} />
			{#if erMal}
				<div class="alt-gruppe-tittel">Alternativer&nbsp;<button class="alt-red" onclick={() => leggTilAlt('alts', 'selAlt')} title="Opprett alternativgruppe">{@html mdi('plus', 13)} Alternativ</button></div>
			{/if}
			{#if erMal && avslAltsLen}
				<div class="alt-gruppe-tittel">Avslutning&nbsp;<button class="alt-red" onclick={(e) => altMeny(e, 'avslutningAlts', 'selAvsl', 'Avslutning')} title="Administrer avslutningsalternativer">{@html mdi('cog', 12)}</button></div>
				<div class="alt-cur">
					<EditableText bind:value={it.avslutningAlts[it.selAvsl ?? 0].text} kind="lit" vimAktiv={app.vimModus} vimSt={vimSt} />
					<button class="alt-btn" onclick={() => velgAvsl()}>
						Bytt avslutning ({(it.selAvsl ?? 0) + 1} av {avslAltsLen})
					</button>
					<button class="alt-red" onclick={() => leggTilAlt('avslutningAlts', 'selAvsl')} title="Nytt tomt avslutningsalternativ">{@html mdi('plus', 13)}</button>
				</div>
			{/if}
		{/if}
	</div>
</div>
