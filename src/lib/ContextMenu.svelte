<script>
	import {
		createMenuController,
		Menu,
		MenuContent,
		MenuItem,
		MenuSeparator,
		MenuSub,
		MenuSubContent,
		MenuSubTrigger
	} from '@ui-sdk/svelte/menu';
	import { untrack } from 'svelte';
	import { app } from '$lib/store.svelte.js';
	import { closeContextMenu } from '$lib/contextmenu.svelte.js';

	/** Kontekstmenyitt på ui-sdk Menu: piltaster, Escape, fokus og
	 *  plasseringskollisjon kommer fra sdk-et. */
	const meny = createMenuController();
	let anker; // usynlig 1×1-punkt som holder menyen ved museposisjonen

	const m = $derived(app.contextMenu);

	$effect(() => {
		const men = m;
		if (!men || !anker) return;
		anker.style.left = men.x + 'px';
		anker.style.top = men.y + 'px';
		untrack(() =>
			meny.open({ anchor: anker, payload: men.items }).then(() => {

			// bare lukk hvis det fortsatt er denne menyen som gjelder (raskt høyre-klikk i rekke)
				// bare lukk hvis det fortsatt er denne menyen som gjelder (raskt høyre-klikk i rekke)
				if (app.contextMenu === men) closeContextMenu();
			})
		);
	});

	function kjor(item) {
		closeContextMenu();
		meny.close();
		item.action();
	}
</script>

<div bind:this={anker} class="ctx-anker" aria-hidden="true"></div>
<Menu controller={meny} onOpenChange={(open) => { untrack(() => { if (!open && app.contextMenu) closeContextMenu(); }); }}>
	<MenuContent class="ctx-menu" side="bottom" align="start" collisionPadding={8}>
		{#snippet children()}
			{#if m}
				{#each m.items as item, i (i)}
					{#if item === 'sep'}
						<MenuSeparator class="ctx-sep" />
					{:else if item.submenu}
						<MenuSub>
							<MenuSubTrigger class="ctx-item ctx-sub" disabled={item.disabled}>
								{item.label}<span class="ctx-pil">▸</span>
							</MenuSubTrigger>
							<MenuSubContent class="ctx-menu">
								{#each item.submenu as sub, j (j)}
									<MenuItem class="ctx-item" onSelect={() => kjor(sub)}>
										{sub.checked ? '✓ ' : ''}{sub.label}
									</MenuItem>
								{/each}
							</MenuSubContent>
						</MenuSub>
					{:else}
						<MenuItem class="ctx-item {item.danger ? 'danger' : ''}" disabled={item.disabled}
							onSelect={() => kjor(item)}>
							{item.checked ? '✓ ' : ''}{item.label}
						</MenuItem>
					{/if}
				{/each}
			{/if}
		{/snippet}
	</MenuContent>
</Menu>
