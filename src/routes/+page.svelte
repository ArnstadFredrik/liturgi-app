<script>
	import Sidebar from '$lib/Sidebar.svelte';
	import { app, veksleSidebar, veksleToc, loadStore } from '$lib/store.svelte.js';
	import { mdi } from '$lib/mdi.js';
	import Editor from '$lib/Editor.svelte';
	import Welcome from '$lib/Welcome.svelte';
	import Maler from '$lib/Maler.svelte';
	import Bibliotek from '$lib/Bibliotek.svelte';
	import Eksport from '$lib/Eksport.svelte';
	import Innstillinger from '$lib/Innstillinger.svelte';
	import DokInsp from '$lib/DokInsp.svelte';
	import Modal from '$lib/Modal.svelte';
	import Kommandopalett from '$lib/Kommandopalett.svelte';
	import { saveCurrent } from '$lib/fileio.svelte.js';

	loadStore();

	// mac-menylinjen: dokumenthandlinger av/på etter tilstand
	$effect(() => {
		window.liturgi?.sendMenyTilstand?.({ dokumentÅpen: !!app.current, kind: app.kind, tema: app.theme, visning: app.visning, visInnhold: !!app.eksVisInnhold, koblet: app.eksKoblet !== false, harFil: !!app.current?.filePath });
	});

	// DEV: hent dev-tilstand fra main (isPackaged) — styrer Malverkøy-modulen
	let Malverktoy = $state(null); // lastes bare inn i dev-bygg (__MALVERKOY__)
	if (__MALVERKOY__ && typeof window !== 'undefined') {
		if (window.liturgi?.devTilstand) {
			window.liturgi.devTilstand().then((t) => { app.devModus = !!t?.devModus; });
		}
		import('$lib/Malverktoy.svelte').then((m) => { Malverktoy = m.default; });
	}

	// hovedprosessen ber oss lagre og lukke (avsluttingsbekreftelse)
	if (typeof window !== 'undefined' && window.liturgi?.onSaveThenClose) {
		window.liturgi.onSaveThenClose(async () => {
			await saveCurrent();
			window.close();
		});
	}

	function gotoSec(i) {
		// i eksportmodulen ruller Avsnitt-listen forhåndsvisningen til seksjonens side
		// (manuell scrollTop — scrollIntoView ville også forskjøvet foreldre-containerne)
		if (document.querySelector('#eksport-side')) {
			// glidende rull i forhåndsvisningen (Eksport.svelte) + rull i venstre oversikt
			const liste = document.querySelector('.eksport-liste');
			const hode = liste?.querySelector(`.eksport-seksjon[data-sec="${i}"]`);
			if (liste && hode) liste.scrollTo({ top: Math.max(0, hode.offsetTop - liste.offsetTop - 6), behavior: 'smooth' });
			window.__eksTilSec?.(i);
			return;
		}
		const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		document.getElementById('sec-' + i)?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
	}
</script>

<div id="app" class:sidebar-skjult={app.sidebarSkjult} class:toc-skjult={app.tocSkjult}>
	<button class="ikon-btn sidebar-toggle" onclick={veksleSidebar}
		title={app.sidebarSkjult ? 'Vis sidemenyen' : 'Skjul sidemenyen'}>
		{@html mdi(app.sidebarSkjult ? 'menu-open' : 'page-layout-sidebar-left', 18)}
	</button>
	<Sidebar />
	<main id="main">
		{#if app.visning === 'eksport' && app.current}
			<Eksport />
		{:else if app.visning === 'malverktoy' && app.devModus && Malverktoy}
			<Malverktoy />
		{:else if app.current}
			<Editor />
		{:else if app.visning === 'maler'}
			<Maler />
		{:else if app.visning === 'bibliotek'}
			<Bibliotek />
		{:else if app.visning === 'eksport'}
			<Eksport />
		{:else if app.visning === 'innstillinger'}
			<Innstillinger />
		{:else}
			<Welcome />
		{/if}
	</main>
	{#if app.current}
		<button class="ikon-btn toc-toggle" class:aaapen={!app.tocSkjult} onclick={veksleToc}
			title={app.tocSkjult ? 'Vis dokumentpanelet' : 'Skjul dokumentpanelet'}>
			{@html mdi(app.tocSkjult ? 'menu-open' : 'page-layout-sidebar-right', 18)}
		</button>
		<aside id="toc-side">
			{#if app.current.sections && app.current.sections.length > 1}
				<div class="sidehead">Avsnitt</div>
				<ul class="list">
					{#each app.current.sections as sec, i (i)}
						<li onclick={() => gotoSec(i)}><span class="nm">{sec.title}</span></li>
					{/each}
				</ul>
				<hr class="side-skiller" />
			{/if}
			<DokInsp />
		</aside>
	{/if}
</div>

{#key (app.modal?.type ?? '') + ':' + (app.modal?.id ?? '')}
	<Modal />
{/key}

<Kommandopalett />

<svelte:window onbeforeunload={(e) => { if (app.dirty) e.preventDefault(); }} />
