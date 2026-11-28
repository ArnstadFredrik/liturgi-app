<script>
	import { app as appStore } from '$lib/store.svelte.js';
	import { valgModal } from '$lib/modal.svelte.js';
	import IkonKnapp from '$lib/IkonKnapp.svelte';
	import { mdi } from '$lib/mdi.js';
	import EditableText from './EditableText.svelte';
	import Cm6Kilde from './Cm6Kilde.svelte';
	import { uthev } from '$lib/markdown-uthev.js';
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

	let dirty = $derived(tekst !== lagretTekst);

	onMount(async () => {
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
							<button class:sel={visning === 'kilde'} onclick={() => visning = 'kilde'} title="Kilde: ren markdown med syntax-highlight">Kilde</button>
						</div>
						<button class="fb-lagre" onclick={lagre} disabled={!dirty || jobber}>{@html mdi('content-save', 14)} {jobber ? 'Lagrer …' : 'Lagre'}</button>
					</div>
					{#if feil}<p class="fb-feil">{feil}</p>{/if}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div class="fb-felter" oncontextmenu={(e) => { e.preventDefault(); openContextMenu(e.clientX, e.clientY, [
						]); }}>
						{#if visning !== 'kilde'}
							<EditableText bind:value={tekst} startRedigering={true} visFerdig={false} dirty={false} plassholder="Skriv her …" hybrid={visning === 'hybrid'} mdModus={true} />
						{:else}
							<!-- CM6-eksperiment (dev-mode): CodeMirror 6 erstatter textarea + Prism
							     i kilde-modus. Vim = @replit/codemirror-vim (alltid p i kilde),
							     liturgi-merker som dekorasjoner. Se docs/cm6-migrering-plan.md. -->
							<Cm6Kilde bind:value={tekst} vimAktiv={true} lagreHandler={lagre} endret={() => { dirty = true; }} />
						{/if}
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
