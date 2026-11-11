<script>
	import '../app.css';
	import { initTheme, app } from '$lib/store.svelte.js';
	import { Toaster } from 'svelte-sonner';
	import ContextMenu from '$lib/ContextMenu.svelte';

	initTheme();
	let { children } = $props();
</script>

{@render children()}
<ContextMenu />
<Toaster position="bottom-right" theme={app.theme === 'light' ? 'light' : 'dark'} />
