<script>
	import { app as appStore, veksleVim } from '$lib/store.svelte.js';
	import { valgModal } from '$lib/modal.svelte.js';
	import IkonKnapp from '$lib/IkonKnapp.svelte';
	import { mdi } from '$lib/mdi.js';
	import EditableText from './EditableText.svelte';
	import Cm6Kilde from './Cm6Kilde.svelte';
	import { uthev } from '$lib/markdown-uthev.js';
	import { nyVimTilstand, vimKeydown } from '$lib/vim.js';
	import { onMount, untrack } from 'svelte';
	import { openContextMenu } from '$lib/contextmenu.svelte.js';

	const isElectron = typeof window !== 'undefined' && !!window.liturgi?.isElectron;
	const STANDARD = '~/Documents/Liturgi/forberedelse';

	// mappe fra databasen (nøkkel 'prekenforberedelseMappe')
	let mappe = $state('');
	let klar = $state(false);

	/** Portal: flytt prosjekt-treet inn i høyre sidemenyen (#toc-side) mens modulen er åpen. */
	function portal(node, target) {
		document.querySelector(target)?.appendChild(node);
		return { destroy() { node.remove(); } };
	}

	$effect(() => {
		if (!mappe) return;
		appStore.portalToc = true; // vis høyre sidemenyen
		// untrack: tocSkjult skal IKKE være en avhengighet (ellers overskriver
		// effekten brukerens åpne/lukk-klikk)
		untrack(() => { if (appStore.tocSkjult) appStore.tocSkjult = false; });
		return () => { appStore.portalToc = false; };
	});

	// tre + editor (barn lastes LAZY per mapper — én IPC per utvidelse)
	let entries = $state([]); // [{ navn, sti, mappe }] — toppnivå
	let barn = $state({}); // sti → [{ navn, sti, mappe }] (lastet ved utvidelse)
	let lasterBarn = $state({}); // sti → true underlasting
	let aapneMapper = $state({}); // sti → true/false
	let valgtSti = $state('');
	let tekst = $state('');
	let lagretTekst = $state('');
	let jobber = $state(false);
	let feil = $state('');

	/** Relativ filsti (under prosjektmappen) til filnavn-visningen. */
	let valgtRel = $state('');
	// Obsidian-lignende visning: hybrid riktekst, delt (kilde + forhåndsvisning), kun kilde eller kun forhåndsvisning
	let visning = $state('hybrid'); // riktekst | hybrid | kilde
	// vim-binding (kilde-modus) — valget persisteres i localStorage
	let vim = $derived(appStore.vimModus); // global bryter (menylinje/kontekstmeny/innstillinger)
	let vimSt = $state(nyVimTilstand());
	$effect(() => { if (appStore.vimModus) vimSt = nyVimTilstand(); });
	let linjeTa = $state(null); // tekstfelt-element (scroll-synk for linjenumrene)
	let gutterEl = $state(null);
	let hlEl = $state(null); // syntax-highlight-laget bak tekstarealet
	let hlHtml = $derived(uthev(tekst));
	let blokkEl = $state(null); // blokkmarkør-overlay (normal/visual)
	let maalEl = $state(null); // skjult speil for å måle markørposisjonen
	let blokkPos = $state({ vis: false, x: 0, y: 0, w: 0, h: 0 });

	/** Plasser blokkmarkøren over tegnet markøren står på (normal/visual). */
	function oppdaterMarkor() {
		if (!linjeTa || !maalEl) { blokkPos = { ...blokkPos, vis: false }; return; }
		const aktiver = vim && visning === 'kilde' && vimSt.modus !== 'insert';
		if (!aktiver) { blokkPos = { ...blokkPos, vis: false }; return; }
		const ta = linjeTa;
		const pos = Math.min(ta.selectionStart ?? 0, (ta.value ?? '').length);
		// speil med identiske fonter/mål — tekst fram til markøren + merket tegn
		const tegn = ta.value[pos] ?? ' ';
		maalEl.style.width = Math.max(0, ta.clientWidth - 24) + 'px'; // 24 = textarea-padding
		maalEl.textContent = '';
		const foran = document.createTextNode(ta.value.slice(0, pos));
		const merke = document.createElement('span');
		merke.textContent = tegn === '\n' ? ' ' : tegn;
		maalEl.appendChild(foran);
		maalEl.appendChild(merke);
		const boks = merke.getBoundingClientRect();
		const maalBoks = maalEl.getBoundingClientRect();
		blokkPos = {
			vis: true,
			x: boks.left - maalBoks.left - ta.scrollLeft,
			y: boks.top - maalBoks.top - ta.scrollTop,
			w: Math.max(boks.width, 8),
			h: boks.height
		};
	}
	let markorKlasse = $derived(vimSt.modus === 'insert' ? 'ins' : vimSt.modus === 'visual' || vimSt.modus === 'vline' ? 'vis' : 'norm');
	let linjenumre = $derived(Array.from({ length: Math.max(1, (tekst ?? '').split('\n').length) }, (_, i) => i + 1));
	$effect(() => { visning; vim; vimSt.modus; requestAnimationFrame(oppdaterMarkor); });
	$effect(() => {
		if (!vim || visning !== 'kilde') return;
		const paa = (e) => requestAnimationFrame(oppdaterMarkor);
		document.addEventListener('selectionchange', paa);
		return () => document.removeEventListener('selectionchange', paa);
	});

	function synkGutter() {
		if (linjeTa && gutterEl) gutterEl.scrollTop = linjeTa.scrollTop;
	}
	let kildeUndo = []; // forrige verdier (u / ⌘Z) — beforeinput fangerer den gamle
	function kildeUndoTrykk() {
		kildeUndo.push(tekst);
		if (kildeUndo.length > 100) kildeUndo.shift();
	}
	function kildeAngre() {
		const v = kildeUndo.pop();
		if (v === undefined) return;
		tekst = v;
		requestAnimationFrame(() => {
			if (!linjeTa) return;
			const p = Math.min(linjeTa.value.length, linjeTa.value.length);
			linjeTa.setSelectionRange(p, p);
			oppdaterMarkor();
		});
	}
	function vimTast(e) {
		if (!vim || visning !== 'kilde') return;
		if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === 'z') { e.preventDefault(); kildeAngre(); return; }
		if (vimKeydown(e, linjeTa, vimSt, { lagre, undo: kildeAngre, palett: (f) => window.dispatchEvent(new CustomEvent('apen-palett', { detail: { forhand: f } })) })) e.preventDefault();
		requestAnimationFrame(oppdaterMarkor);
	}

	let dirty = $derived(tekst !== lagretTekst);

	onMount(async () => {
		// vim-modus: persisteres i databasen
		if (isElectron) {
			try {
				const r = await window.liturgi.dbGet('vimModus');
				vim = (r?.value ?? '0') === '1';
				vimSt = nyVimTilstand();
			} catch { /* db utilgjengelig */ }
		} else {
			try { vim = localStorage.getItem('forb-vim') === '1'; } catch {}
		}
		if (!isElectron) return;
		const r = await window.liturgi.dbGet('prekenforberedelseMappe');
		mappe = r?.ok ? (r.value ?? '') : '';
		klar = true;
		if (mappe) {
			await lastTre();
			// åpnet fra Kirkeåret: auto-åpne notat.md i det nye prosjektet
			if (appStore.forbAapneSti) {
				const sti = appStore.forbAapneSti;
				appStore.forbAapneSti = null;
				await aapneFil(sti);
			} else {
				// sist åpne dokument (db) — gjenopprett når modulen åpnes
				try {
					const sist = await window.liturgi.dbGet('prekenforberedelseSist');
					if (sist?.value) await aapneFil(sist.value);
				} catch { /* db utilgjengelig */ }
			}
		}
	});

	async function lastTre() {
		const r = await window.liturgi.forbMappe(mappe);
		if (r?.ok) {
			entries = r.entries ?? [];
			feil = '';
		} else feil = r?.error ?? 'Klarte ikke lese mappen';
	}

	/** Første gangs oppsett: dialogen foreslår standardmappen (defaultPath) og
	 *  lar brukeren velge en annen mappe. Valget lagres i databasen. */
	async function velgMappe() {
		const r = await window.liturgi.forbVelgMappe();
		if (!r?.ok) return;
		mappe = r.sti;
		await window.liturgi.dbSet('prekenforberedelseMappe', mappe);
		await lastTre();
	}

	async function toggleMappe(sti) {
		const aapne = !aapneMapper[sti];
		aapneMapper = { ...aapneMapper, [sti]: aapne };
		if (aapne && barn[sti] === undefined) {
			lasterBarn = { ...lasterBarn, [sti]: true };
			const r = await window.liturgi.forbMappe(sti);
			barn = { ...barn, [sti]: r?.ok ? (r.entries ?? []) : [] };
			lasterBarn = { ...lasterBarn, [sti]: false };
		}
	}

	/** Barn til en mapper-rad: lastede, eller tom liste mens de lastes. */
	function barnFor(e) {
		return barn[e.sti] ?? [];
	}

	/** Ulagrede endringer → spør om å forkaste (løser med true/false). */
	function bekreftForkast() {
		return new Promise((resolve) => {
			if (!dirty) return resolve(true);
			let svart = false;
			const svar = (v) => { if (!svart) { svart = true; resolve(v); } };
			valgModal('Ulagrede endringer', 'Du har endringer i «' + (valgtSti.split('/').pop() ?? '') + '» som ikke er lagret. Forkaste dem?', 'Forkast', 'Fortsett redigering', () => svar(true), () => svar(false));
		});
	}

	async function aapneFil(sti) {
		if (isElectron) window.liturgi.dbSet('prekenforberedelseSist', sti).catch(() => {});
		valgtRel = sti.startsWith(mappe + '/') ? sti.slice(mappe.length + 1) : sti.split('/').slice(-2).join('/');
		if (sti === valgtSti) return;
		if (dirty && !(await bekreftForkast())) return;
		const r = await window.liturgi.forbLesFil(sti);
		if (!r?.ok) { feil = r?.error ?? 'Klarte ikke lese filen'; return; }
		valgtSti = sti;
		tekst = r.tekst;
		lagretTekst = r.tekst;
		feil = '';
	}

	async function lagre() {
		if (!dirty || !valgtSti) return;
		jobber = true;
		const r = await window.liturgi.forbLagreFil(valgtSti, tekst);
		jobber = false;
		if (r?.ok) lagretTekst = tekst;
		else feil = r?.error ?? 'Klarte ikke lagre';
	}

	function vedTast(e) {
		if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); lagre(); }
	}
</script>

<svelte:window onkeydown={vedTast} />

<div id="forberedelse">
	<h2>Prekenforberedelse</h2>
	{#if !isElectron}
		<p class="fb-ingress">Prekenforberedelser er kun tilgjengelig i Mac-appen.</p>
	{:else if !klar}
		<p class="fb-ingress">Laster …</p>
	{:else if !mappe}
		<div class="fb-oppsett">
			<div class="fb-oppsett-ikon">{@html mdi('notebook', 34)}</div>
			<div class="fb-oppsett-tittel">Prekenforberedelse</div>
			<p class="fb-ingress">
				Velg mappen der prosjektene skal ligge. Standard er
				<code>{STANDARD}</code> — du kan velge en annen mappe i dialogen.
				Valget lagres og kan endres i innstillingene.
			</p>
			<button class="fb-hovedknapp" onclick={velgMappe}>{@html mdi('folder-open-outline', 16)} Velg mappe …</button>
		</div>
	{:else}
		<div class="fb-kolonner">

			<div class="fb-editor">
				{#if !valgtSti}
					<div class="fb-tom fb-editor-tom">
						<p class="fb-ingress">Velg en fil i listen.</p>
						<p class="fb-ingress">Nye prosjekter opprettes fra <strong>Kirkeåret</strong>-modulen.</p>
					</div>
				{:else}
					<div class="fb-editor-hode">
						<span class="fb-filnavn" title={valgtSti}>{valgtRel}</span>
						{#if dirty}<span class="fb-dirty">ulagret</span>{/if}
						<div class="fb-visning-velger">
							<button class:sel={visning === 'riktekst'} onclick={() => visning = 'riktekst'} title="Riktekst: formater som i et tekstbehandler-program">Riktekst</button>
							<button class:sel={visning === 'hybrid'} onclick={() => visning = 'hybrid'} title="Hybrid: markdown-kilderedigering med riktekst-styling; merkene synlige på linjen du redigerer">Hybrid</button>
							<button class:sel={visning === 'kilde'} onclick={() => visning = 'kilde'} title="Kilde: ren markdown med syntax-highlight (vim: aktiver vim-bryteren)">Kilde</button>
						</div>
						<button class="fb-lagre" onclick={lagre} disabled={!dirty || jobber}>{@html mdi('content-save', 14)} {jobber ? 'Lagrer …' : 'Lagre'}</button>
					</div>
					{#if feil}<p class="fb-feil">{feil}</p>{/if}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div class="fb-felter" oncontextmenu={(e) => { e.preventDefault(); openContextMenu(e.clientX, e.clientY, [
						{ label: appStore.vimModus ? 'Skru av vim-modus' : 'Skru på vim-modus', action: () => veksleVim() }
					]); }}>
						{#if visning !== 'kilde'}
							<EditableText bind:value={tekst} startRedigering={true} visFerdig={false} dirty={false} plassholder="Skriv her …" hybrid={visning === 'hybrid'} vimAktiv={appStore.vimModus} vimSt={vimSt} vimLagre={lagre} mdModus={true} />
						{:else}
							<!-- CM6-eksperiment: CodeMirror 6 erstatter textarea + Prism i
							     kilde-modus (vim via @replit/codemirror-vim, liturgi-merker som
							     dekorasjoner). Se docs/cm6-vurdering.md. -->
							<Cm6Kilde bind:value={tekst} vimAktiv={appStore.vimModus} lagreHandler={lagre} endret={() => { dirty = true; }} />
						{/if}
					</div>
				{/if}
				{#if vim}
					<div class="fb-statuslinje">
						<span class="fb-vim-modus" class:ins={vimSt.modus === 'insert'}>{vimSt.kommando || (vimSt.modus === 'insert' ? 'INSERT' : vimSt.modus === 'visual' ? 'VISUAL' : vimSt.modus === 'vline' ? 'V-LINE' : 'NORMAL')}</span>
						<span class="fb-status-fil">{valgtRel || '—'}</span>
						<span class="fb-status-rom">markdown</span>
					</div>
				{/if}
			</div>
			<aside class="fb-tre" use:portal={'#toc-side'}>
				<div class="fb-tre-hode">
					<span class="sidehead">Prosjekter</span>
					<IkonKnapp label="Oppdater mappen" ikon="refresh" />
				</div>
				{#if !entries.length}
					<div class="fb-tom">
					<p class="fb-ingress">Mappen er tom.</p>
					<p class="fb-ingress">Opprett prosjekter fra <strong>Kirkeåret</strong>-modulen.</p>
				</div>
				{/if}
				{#snippet rad(e, nivaa)}
					{#if e.mappe}
						<button class="fb-mappe" style="padding-left: {8 + nivaa * 14}px" onclick={() => toggleMappe(e.sti)}>
							{@html mdi(aapneMapper[e.sti] ? 'folder-open-outline' : 'folder-outline', 15)} {e.navn}
						</button>
						{#if aapneMapper[e.sti]}
							{#if lasterBarn[e.sti]}
								<p class="fb-laster" style="padding-left: {8 + (nivaa + 1) * 14}px">Laster …</p>
							{:else}
								{#each barnFor(e) as b (b.sti)}
									{@render rad(b, nivaa + 1)}
								{/each}
							{/if}
						{/if}
					{:else}
						<button class="fb-fil" class:sel={valgtSti === e.sti} style="padding-left: {8 + nivaa * 14 + 4}px" onclick={() => aapneFil(e.sti)}>
							{@html mdi('file-document-outline', 14)} {e.navn.replace(/\.md$/i, '')}
						</button>
					{/if}
				{/snippet}
				{#each entries as e (e.sti)}
					{@render rad(e, 0)}
				{/each}
			</aside>
		</div>
	{/if}
</div>
