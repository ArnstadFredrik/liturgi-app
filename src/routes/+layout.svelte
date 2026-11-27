<script>
	import '../app.css';
	// ui-sdk: standardstiler importeres ved app-inngangen
	import '@ui-sdk/core/web.css';
	import { initTheme, app } from '$lib/store.svelte.js';
	import { Toaster } from 'svelte-sonner';
	import ContextMenu from '$lib/ContextMenu.svelte';

	initTheme();
	let { children } = $props();
</script>

{@render children()}
<ContextMenu />
<!-- Toastene rykker seg forbi den åpne høyremenyen (TOC) så de ikke dekker
	knappene nederst i menyen; ellers standard plassering. -->
<Toaster
	position="bottom-right"
	theme={app.theme === 'light' ? 'light' : 'dark'}
	offset={{ right: app.tocSkjult ? '24px' : 'calc(clamp(200px, 21vw, 340px) + 24px)', bottom: '24px' }}
/>
