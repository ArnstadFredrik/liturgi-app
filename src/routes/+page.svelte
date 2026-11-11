<script>
	import Sidebar from '$lib/Sidebar.svelte';
	import Editor from '$lib/Editor.svelte';
	import Welcome from '$lib/Welcome.svelte';
	import Modal from '$lib/Modal.svelte';
	import { app, loadStore } from '$lib/store.svelte.js';

	loadStore();

	function gotoSec(i) {
		const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		document.getElementById('sec-' + i)?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
	}
</script>

<div id="app">
	<Sidebar />
	<main id="main">
		{#if !app.current}
			<Welcome />
		{:else}
			<Editor />
		{/if}
	</main>
	{#if app.current && app.current.sections && app.current.sections.length > 1}
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
