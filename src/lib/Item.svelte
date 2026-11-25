<script>
	import { app, markDirty, uid, hentBibelteksterPåNytt } from '$lib/store.svelte.js';
	import { chooseOneModal, valgModal, fjernFlereModal, adminAltsModal, prompt } from '$lib/modal.svelte.js';
	import { bibSokModal } from '$lib/modal.svelte.js';
	import { toast } from 'svelte-sonner';
	import { openContextMenu } from '$lib/contextmenu.svelte.js';
	import { sorterPrefasjoner } from '$lib/modal.svelte.js';
	import { mdi } from '$lib/mdi.js';
	import { formaterSalme, salmeAlts } from '$lib/lit.js';
	import EditableText from './EditableText.svelte';
	import { nyVimTilstand } from '$lib/vim.js';
	import { veksleVim } from '$lib/store.svelte.js';
	import { saveCurrent, lagreMalSomKopi, erOriginalMal } from '$lib/fileio.svelte.js';
	let vimSt = nyVimTilstand();
	$effect(() => { if (app.vimModus) vimSt = nyVimTilstand(); });

	let { it, si, ii, bokstav = null } = $props();

	/** Tittel-spannet: innholdet styres av en action, IKKE av Svelte-{uttrykk}.
	 *  Da kan brukeren skrive i contenteditable uten at re-renderinger nullstiller
	 *  teksten/caret, og tomme titler får stabil placeholder + klikkbart felt. */
	function titler(node, params) {
		node.textContent = params?.tekst ?? '';
		return {
			update(p) {
				const v = p?.tekst ?? '';
				if (document.activeElement !== node && (node.textContent ?? '') !== v) node.textContent = v;
			}
		};
	}

	const TYPE_LABEL = { tekst: 'Tekst', instruks: 'Instruks', salme: 'Salme', lesning: 'Lesning', bønn: 'Bønn' };

	// dynamisk bibeltekst-kobling (Bibeltekster-fanen i mal-innstillingene)
	const BIBEL_TITTEL = { L1: 'Første lesning', L2: 'Andre lesning', E: 'Evangelium' };
	const bibelkobling = $derived(
		(() => {
			const kobling = (app.current?.bibeltekster ?? []).find((b) => b.leddId === it.id);
			return kobling ? { lesning: kobling.lesning, tittel: BIBEL_TITTEL[kobling.lesning] ?? kobling.lesning } : null;
		})()
	);

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
				navn: o.liturgiType === 'gravferd' ? 'Gravferd' : o.liturgiType === 'vigsel' ? 'Vigsel' : 'Gudstjeneste'
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

	/** Nytt hovedavsnitt (kontekstmeny): prompt + tom seksjon sist. */
	function nyttHovedavsnitt() {
		prompt('Nytt hovedavsnitt', 'Navn på avsnittet', (title) => {
			app.current.sections.push({ title: title || 'Nytt avsnitt', items: [] });
			markDirty();
		});
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
			...(har ? [{ label: 'Administrer alternativer …', action: () => adminAlts(liste, selNokkel) }] : []),
			...(har ? ['sep'] : []),
			...(har ? l.map((a, i) => ({
				label: (selNokkel && it[selNokkel] === i ? '✓ ' : '') + radLabel(i),
				action: () => { if (selNokkel) it[selNokkel] = i; markDirty(); }
			})) : []),
			...(har ? ['sep'] : []),
			...(!har ? [{ label: 'Opprett «' + label + '»-gruppe', action: () => opprettGruppe(liste, selNokkel, label) }] : []),
			...(har && (selNokkel === 'selIntro' || selNokkel === 'selAvsl') ? [
				{ label: 'Fjern hele ' + label.toLowerCase(), action: () => fjernGruppe(liste, selNokkel), danger: true }
			] : []),
			...(!har ? [{ label: 'Hent fra biblioteket …', action: () => hentGruppeFraBib(liste, selNokkel, label) }] : [])
		]);
	}

/** Administrer alternativer: navn/slett/nytt/hent i én modal (jobber live). */
	function adminAlts(liste, selNokkel) {
		adminAltsModal(it, liste, selNokkel, 'Administrer alternativer — ' + (it.heading || ''));
	}

	/** Fjern alternativer: multi-select-modal; slett merkede fra bunnen og opp. */
	function fjernFlere(liste, selNokkel) {
		const l = it[liste];
		fjernFlereModal(l, 'Fjern valgte ledd' + (it.heading ? ' — ' + it.heading : ''), (idxer) => {
			for (const idx of idxer) fjernAlt(liste, idx, selNokkel); // bunnen først
			toast.success(idxer.length + ' alternativ(er) slettet');
		});
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

	/** Lesningsledd? (typen «lesning» eller overskriften første/andre lesning / evangelium) */
	function erLesningsLedd(x) {
		const h = (x.heading || '').toLowerCase();
		return x.type === 'lesning' ||
			(!h.includes('ingress') && (h.includes('første lesning') || h.includes('andre lesning') || h.includes('evangelium')));
	}

	/** Hent bibeltekstene fra kirkeåret på nytt (lesningsledd + dynamiske koblinger). */
	async function hentPåNytt() {
		try {
			const n = await hentBibelteksterPåNytt(app.current);
			markDirty();
			toast.success(n ? 'Hentet ' + n + ' bibeltekster på nytt' : 'Fant ingen lesningsledd å fylle');
		} catch (e2) {
			toast.error('Klarte ikke hente bibeltekster: ' + (e2?.message ?? e2));
		}
	}

	function context(e) {
		e.preventDefault();
		const o = app.current;
		openContextMenu(e.clientX, e.clientY, [
			// lager-handlinger for maler (dokumentnivå):
			//  • brukermal → Lagre  • originalmal → Lagre som kopi  • dev-original → Lagre til prosjektet
			...(erMal && o?.__devMal ? [
				{ label: 'Lagre til prosjektet', action: () => saveCurrent() },
				{ label: 'Lagre som kopi', action: () => lagreMalSomKopi() }
			] : []),
			...(erMal && !o?.__devMal && erOriginalMal(o) ? [{ label: 'Lagre som kopi', action: () => lagreMalSomKopi() }] : []),
			...(erMal && !o?.__devMal && !erOriginalMal(o) ? [{ label: 'Lagre', action: () => saveCurrent() }] : []),
			'sep',
			{ label: 'Flytt opp', action: () => move(-1), disabled: ii === 0 },
			{ label: 'Flytt ned', action: () => move(1), disabled: ii === items.length - 1 },
			'sep',
			{ label: 'Legg til del over', action: () => nyttLedd(0) },
			{ label: 'Nytt hovedavsnitt …', action: () => nyttHovedavsnitt() },
			{ label: 'Legg til del under', action: () => nyttLedd(1) },
			{ label: 'Hent innhold fra biblioteket …', action: () => hentFraBibliotek('innhold') },
			{ label: 'Hent ledd fra biblioteket …', action: () => hentFraBibliotek('ledd') },
			...(erLesningsLedd(it) && !erMal ? [{ label: 'Hent bibeltekster på nytt', action: hentPåNytt }] : []),
			// malredigering: innledning/avslutning er TOGGLES (et ledd har høyst én av hver) —
			// optakt/fjerning av alternativer skjer i gruppens egen meny (tannhjul)
			...(erMal ? [
				{ label: 'Innledning', checked: introAltsLen > 0, action: () => introAltsLen ? fjernGruppe('introAlts', 'selIntro', 'Innledning') : opprettGruppe('introAlts', 'selIntro', 'Innledning') },
				{ label: 'Avslutning', checked: avslAltsLen > 0, action: () => avslAltsLen ? fjernGruppe('avslutningAlts', 'selAvsl', 'Avslutning') : opprettGruppe('avslutningAlts', 'selAvsl', 'Avslutning') }
			] : []),
			{ label: 'Skift type …', action: skiftType },
			// instruksjonsfelt: vises kun når det har innhold — denne legger
			// til et tomt redigerbart felt (' ') eller fjerner det igjen
			{ label: (it.instr ?? '').trim() ? 'Fjern instruksjonsfelt' : 'Legg til instruksjonsfelt', action: () => { it.instr = (it.instr ?? '').trim() ? '' : ' '; markDirty(); } },
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
				// kun hoveddelen erstattes — leddets egen innledning/avslutning
				// (og alternativgrupper) røres ikke
				it.text = alt.text;
			} else {
				// hele leddet: NYTT ledd OVER det nåværende (mindre destruktivt),
				// og det nåværende tas ut av gudstjenesten (beholdes i dokumentet)
				const intro = gruppe.rader[0]?.intro_tekst;
				const avsl = gruppe.rader[0]?.avsl_tekst;
				const nytt = {
					id: uid(), type: it.type, heading: gruppe.ledd,
					text: alts.length === 1 ? alts[0].text : '',
					instr: '', enabled: true, optional: false, salmeNr: '', salmeTittel: '',
					alts: alts.length > 1 ? alts : [],
					selAlt: alts.length > 1 ? 0 : null
				};
				if (intro) { nytt.introAlts = [{ label: 'Innledning', text: intro }]; nytt.selIntro = 0; }
				if (avsl) { nytt.avslutningAlts = [{ label: 'Avslutning', text: avsl }]; nytt.selAvsl = 0; }
				o.sections[si].items.splice(ii, 0, nytt);
				it.enabled = false;
			}
			markDirty();
			toast.success('Hentet «' + gruppe.ledd + '» fra ' + gruppe.kilde);
		});
	}
</script>

<div class="item" class:off={it.enabled === false} oncontextmenu={context}>
	<div class="item-head" title="Dra i linjen over for å flytte leddet">
		{#if bokstav}<span class="bokstav-badge" title="Bokstav i skriftlesningslista">{bokstav}</span>{/if}
		<span class="item-eyebrow">
			{TYPE_LABEL[it.type] ?? 'Tekst'}{#if it.alts && it.alts.length}&nbsp;· {it.alts.length} alternativer{/if}
		</span>
		<span class="item-title" class:tom={!it.heading}
			contenteditable={it.__lenket ? 'false' : 'plaintext-only'} spellcheck="false"
			data-ph="Legg til tittel"
			use:titler={{ tekst: it.heading }}
			onclick={(e) => { if (!it.__lenket) e.currentTarget.focus(); }}
			onblur={(e) => {
				const span = e.currentTarget;
				const v = (span.textContent ?? '').replace(/[\u00a0\u200b]/g, ' ').trim();
				span.textContent = v;
				if (v !== it.heading) { it.heading = v; markDirty(); }
			}}
		></span>
		{#if bibelkobling}
			<span class="dyn-badge" title="Dette leddet henter innhold dynamisk fra kirkeårets bibeltekster (koblet i malens Bibeltekster-innstillinger).">{@html mdi('database-outline', 13)} {bibelkobling.tittel}</span>
		{/if}
		{#if it.optional}
			<span class="dyn-badge" title="Valgfritt ledd — tas bare med når det er slått på i Opprett-dialogen (valgfrie ledd).">{@html mdi('check-decagram', 12)} valgfri</span>
		{/if}
		{#if it.alts && it.alts.length && it.type !== 'salme'}
			<span class="dyn-badge" title="Ledd med alternativer — bytt mellom dem med «Bytt alternativ»-knappen.">{@html mdi('shuffle-variant', 12)} {it.alts.length} alternativ{it.alts.length > 1 ? 'er' : ''}</span>
		{/if}
		{#if it.delGruppe}
			<span class="dyn-badge" title="Variasjon (enten/eller) — tas bare med når gruppen «{it.delGruppe}» er valgt ved oppretting.">{@html mdi('source-branch', 12)} {it.delGruppe[0].toUpperCase() + it.delGruppe.slice(1)}</span>
		{/if}
		{#if it.__lenket}
			<span class="lenket-info" title="Dette leddet hentes automatisk fra malen «Dåp i hovedgudstjenesten» — innholdet redigeres i den malen, ikke her. Åpne «Dåp i hovedgudstjenesten» i Maler-listen for å redigere dåpsdelen.">{@html mdi('information-outline', 14)}</span>
		{/if}
		{#if app.kind === 'template'}
			<label class="ta-med" title="Skal leddet være med når en gudstjeneste opprettes fra malen?">
				<input type="checkbox" checked={it.enabled !== false} onchange={(e) => { it.enabled = e.currentTarget.checked; markDirty(); }} />
				ta med
			</label>
		{/if}
	</div>
	<div class="item-body">
		{#if (app.current?.visInstr ?? true) && it.instr !== '' && it.instr != null}
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
					<EditableText bind:value={it.alts[Math.min(it.selAlt ?? 0, it.alts.length - 1)].text} kind="lit" vimAktiv={app.vimModus} vimSt={vimSt} />
				{:else}
					<EditableText bind:value={it.text} kind="lit" vimAktiv={app.vimModus} vimSt={vimSt} />
				{/if}
			{/if}
		{:else if it.alts && it.alts.length}
			{#if introAltsLen}
				<div class="alt-gruppe-tittel">Innledning{#if erMal}&nbsp;<button class="alt-red" onclick={(e) => altMeny(e, 'introAlts', 'selIntro', 'Innledning')} title="Administrer innledningsalternativer">{@html mdi('cog', 12)}</button>{/if}</div>
				<div class="alt-cur">
					<EditableText bind:value={it.introAlts[Math.min(it.selIntro ?? 0, it.introAlts.length - 1)].text} kind="lit" vimAktiv={app.vimModus} vimSt={vimSt} />
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
			<div class="alt-gruppe-tittel">Alternativer{#if erMal}&nbsp;<button class="alt-red" onclick={(e) => altMeny(e, 'alts', 'selAlt', 'Alternativer')} title="Administrer alternativer">{@html mdi('cog', 12)}</button>{/if}</div>
			{@const sel = it.alts[Math.min(it.selAlt ?? 0, it.alts.length - 1)]}
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
					<EditableText bind:value={it.avslutningAlts[Math.min(it.selAvsl ?? 0, it.avslutningAlts.length - 1)].text} kind="lit" vimAktiv={app.vimModus} vimSt={vimSt} />
					<button class="alt-btn" onclick={() => velgAvsl()}>
						Bytt avslutning ({(it.selAvsl ?? 0) + 1} av {avslAltsLen})
					</button>
					{#if erMal}<button class="alt-red" onclick={() => leggTilAlt('avslutningAlts', 'selAvsl')} title="Nytt tomt avslutningsalternativ">{@html mdi('plus', 13)}</button>{/if}
				</div>
			{/if}
		{:else}
			{#if introAltsLen}
				<div class="alt-gruppe-tittel">Innledning{#if erMal}&nbsp;<button class="alt-red" onclick={(e) => altMeny(e, 'introAlts', 'selIntro', 'Innledning')} title="Administrer innledningsalternativer">{@html mdi('cog', 12)}</button>{/if}</div>
				<div class="alt-cur">
					<EditableText bind:value={it.introAlts[Math.min(it.selIntro ?? 0, introAltsLen - 1)].text} kind="lit" vimAktiv={app.vimModus} vimSt={vimSt} />
					<button class="alt-btn" onclick={() => velgIntro()}>
						Bytt innledning ({(it.selIntro ?? 0) + 1} av {introAltsLen})
					</button>
					{#if erMal}<button class="alt-red" onclick={() => leggTilAlt('introAlts', 'selIntro')} title="Nytt tomt innledningsalternativ">{@html mdi('plus', 13)}</button>{/if}
				</div>
			{/if}
			<EditableText bind:value={it.text} kind="lit" vimAktiv={app.vimModus} vimSt={vimSt} />
			{#if erMal}
				<div class="alt-gruppe-tittel">Alternativer&nbsp;<button class="alt-red" onclick={() => leggTilAlt('alts', 'selAlt')} title="Opprett alternativgruppe">{@html mdi('plus', 13)} Alternativ</button></div>
			{/if}
			{#if avslAltsLen}
				<div class="alt-gruppe-tittel">Avslutning{#if erMal}&nbsp;<button class="alt-red" onclick={(e) => altMeny(e, 'avslutningAlts', 'selAvsl', 'Avslutning')} title="Administrer avslutningsalternativer">{@html mdi('cog', 12)}</button>{/if}</div>
				<div class="alt-cur">
					<EditableText bind:value={it.avslutningAlts[Math.min(it.selAvsl ?? 0, avslAltsLen - 1)].text} kind="lit" vimAktiv={app.vimModus} vimSt={vimSt} />
					<button class="alt-btn" onclick={() => velgAvsl()}>
						Bytt avslutning ({(it.selAvsl ?? 0) + 1} av {avslAltsLen})
					</button>
					{#if erMal}<button class="alt-red" onclick={() => leggTilAlt('avslutningAlts', 'selAvsl')} title="Nytt tomt avslutningsalternativ">{@html mdi('plus', 13)}</button>{/if}
				</div>
			{/if}
		{/if}
	</div>
</div>
