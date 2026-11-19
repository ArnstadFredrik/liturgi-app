<script>
	import { app } from '$lib/store.svelte.js';
	import { closeContextMenu } from '$lib/contextmenu.svelte.js';

	const m = $derived(app.contextMenu);
	let openSub = $state(-1);

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
		if (item.submenu) { openSub = openSub === m.items.indexOf(item) ? -1 : m.items.indexOf(item); return; }
		closeContextMenu();
		item.action();
	}

	function runSub(sub) {
		closeContextMenu();
		sub.action();
	}
</script>

{#if m}
	<div class="ctx-overlay" onclick={closeContextMenu} oncontextmenu={(e) => { e.preventDefault(); closeContextMenu(); }}>
		<div class="ctx-menu" style="left:{pos.x}px; top:{pos.y}px" onclick={(e) => e.stopPropagation()}>
			{#each m.items as item, i (i)}
				{#if item === 'sep'}
					<div class="ctx-sep"></div>
				{:else if item.submenu}
					<button class="ctx-item ctx-sub" class:apen={openSub === i} onclick={() => run(item)}>
						{item.label}<span class="ctx-pil">▸</span>
					</button>
					{#if openSub === i}
						<div class="ctx-submenu">
							{#each item.submenu as sub, j (j)}
								<button class="ctx-item" onclick={() => runSub(sub)}>{sub.checked ? '✓ ' : ''}{sub.label}</button>
							{/each}
						</div>
					{/if}
				{:else}
					<button class="ctx-item" class:danger={item.danger} disabled={item.disabled} onclick={() => run(item)}>
						{item.checked ? '✓ ' : ''}{item.label}
					</button>
				{/if}
			{/each}
		</div>
	</div>
{/if}

<svelte:window onkeydown={(e) => { if (e.key === 'Escape' && m) closeContextMenu(); }} />
