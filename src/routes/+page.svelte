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
	import Modal from '$lib/Modal.svelte';
	import { saveCurrent } from '$lib/fileio.svelte.js';

	loadStore();

	// hovedprosessen ber oss lagre og lukke (avsluttingsbekreftelse)
	if (typeof window !== 'undefined' && window.liturgi?.onSaveThenClose) {
		window.liturgi.onSaveThenClose(async () => {
			await saveCurrent();
			window.close();
		});
	}

	function gotoSec(i) {
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
	{#if app.current && app.current.sections && app.current.sections.length > 1}
		<button class="ikon-btn toc-toggle" class:aaapen={!app.tocSkjult} onclick={veksleToc}
			title={app.tocSkjult ? 'Vis avsnittslisten' : 'Skjul avsnittslisten'}>
			{@html mdi(app.tocSkjult ? 'menu-open' : 'page-layout-sidebar-right', 18)}
		</button>
		<aside id="toc-side">
			<div class="sidehead">Avsnitt</div>
			<ul class="list">
				{#each app.current.sections as sec, i (i)}
					<li onclick={() => gotoSec(i)}><span class="nm">{sec.title}</span></li>
				{/each}
			</ul>
		</aside>
	{/if}
</div>

<Modal />

<svelte:window onbeforeunload={(e) => { if (app.dirty) e.preventDefault(); }} />
