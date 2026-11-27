<script>
	import { Tabs, TabsList, TabsTab } from '@ui-sdk/svelte/tabs';

	/** Felles fane-stripe for undermoduler. Bygget på ui-sdk Tabs:
	 *  piltaster, roving tabindex og aria-selected kommer gratis.
	 *  Panelene ('modul-faner') rendres av forelderen. */
	export let faner = []; // [{ id, navn, velg }]
	export let aktiv = '';
</script>

<nav class="mod-faner">
	<Tabs value={aktiv} onValueChange={(v) => faner.find((f) => f.id === v)?.velg?.()}>
		<TabsList class="fb-visning-velger" aria-label="Moduler">
			{#each faner as f (f.id)}
				<TabsTab value={f.id} class={aktiv === f.id ? 'sel' : ''}>{f.navn}</TabsTab>
			{/each}
		</TabsList>
	</Tabs>
</nav>
