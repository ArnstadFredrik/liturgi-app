<script>
	import { app } from '$lib/store.svelte.js';
	import { closeContextMenu } from '$lib/contextmenu.svelte.js';

	const m = $derived(app.contextMenu);

	// hold menyen innenfor vinduet
	const pos = $derived.by(() => {
		if (!m) return { x: 0, y: 0 };
		const w = 200, h = m.items.length * 34 + 12;
		return {
			x: Math.min(m.x, window.innerWidth - w - 8),
			y: Math.min(m.y, window.innerHeight - h - 8)
		};
	});

	function run(item) {
		closeContextMenu();
		item.action();
	}
</script>

{#if m}
	<div class="ctx-overlay" onclick={closeContextMenu} oncontextmenu={(e) => { e.preventDefault(); closeContextMenu(); }}>
		<div class="ctx-menu" style="left:{pos.x}px; top:{pos.y}px" onclick={(e) => e.stopPropagation()}>			{#each m.items as item, i (i)}
				{#if item === 'sep'}
					<div class="ctx-sep"></div>
				{:else}
					<button class="ctx-item" class:danger={item.danger} disabled={item.disabled} onclick={() => run(item)}>
						{item.label}
					</button>
				{/if}
			{/each}
		</div>
	</div>
{/if}

<svelte:window onkeydown={(e) => { if (e.key === 'Escape' && m) closeContextMenu(); }} />
