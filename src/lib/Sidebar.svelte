<script>
	import { app, openService, openTemplate, deleteService, deleteTemplate, sortedServices, persist, uid, createService, toggleTheme } from '$lib/store.svelte.js';
	import { prompt, confirmBox, newServiceModal } from '$lib/modal.svelte.js';
	import { openFileToStore, openServiceFile, refreshRecentServices, deleteServiceFile, loadTemplatesFromDisk, deleteTemplateFile, newTemplateOnDisk } from '$lib/fileio.svelte.js';

	const isElectron = typeof window !== 'undefined' && !!window.liturgi?.isElectron;
	const MAX_RECENT = 5;

	$effect(() => {
		if (isElectron) {
			refreshRecentServices();
			loadTemplatesFromDisk();
		}
	});

	const recent = $derived(app.recentServices.slice(0, MAX_RECENT));

	function newTemplate() {
		prompt('Ny lokal mal', 'Navn på malen', async (name) => {
			if (isElectron) {
				await newTemplateOnDisk(name);
			} else {
				const t = { id: uid(), kind: 'template', name: name || 'Ny grunnordning', sections: [{ title: 'I. Samling', items: [] }] };
				app.templates.push(t);
				persist();
				openTemplate(t.id);
			}
		});
	}

	function newService() {
		if (!app.templates.length) return;
		newServiceModal((name, date, tplId, include, kirkeaar, tekster) => {
			createService(name, date, tplId, include, kirkeaar, tekster);
		});
	}
</script>

<aside id="sidebar">
	<h1>Liturgi</h1>
	<div class="sidegroup">
		<div class="sidehead">Gudstjenester{#if isElectron}&nbsp;· siste {MAX_RECENT}{/if}</div>
		<ul class="list">
			{#if isElectron}
				{#each recent as s (s.path)}
					<li class:active={app.current?.filePath === s.path}>
						<span class="nm" onclick={() => openServiceFile(s.path)} title={s.path}>
							{s.name}{#if s.date}&nbsp;<span class="dt">{s.date}</span>{/if}
						</span>
					</li>
				{:else}
					<li class="empty">Ingen lagrede gudstjenester ennå</li>
				{/each}
			{:else}
				{#each sortedServices() as s (s.id)}
					<li class:active={app.current === s}>
						<span class="nm" onclick={() => openService(s.id)}>
							{s.name}{#if s.date}&nbsp;<span class="dt">{s.date}</span>{/if}
						</span>
						<button class="del" title="Slett" onclick={() => confirmBox('Slett', `Slette «${s.name}»?`, () => deleteService(s.id))}>🗑</button>
					</li>
				{/each}
			{/if}
		</ul>
		<button class="wide" onclick={newService}>+ Ny gudstjeneste</button>
	</div>
	<div class="sidegroup">
		<div class="sidehead">Maler</div>
		<ul class="list">
			{#each app.templates as t (t.id)}
				<li class:active={app.current === t}>
					<span class="nm" onclick={() => openTemplate(t.id)} title={t.name}>{t.name}</span>
					{#if isElectron && t.filePath && !t.builtinKey}
						<button class="del" title="Flytt til papirkurven" onclick={() => confirmBox('Slett', `Flytte malen «${t.name}» til papirkurven?`, () => deleteTemplateFile(t.filePath))}>🗑</button>
					{:else if !isElectron}
						<button class="del" title="Slett" onclick={() => confirmBox('Slett', `Slette malen «${t.name}»?`, () => deleteTemplate(t.id))}>🗑</button>
					{/if}
				</li>
			{/each}
		</ul>
		<button class="wide" onclick={newTemplate}>+ Ny lokal mal</button>
	</div>
	<div class="sidefoot">
		<button class="wide" onclick={openFileToStore} title="Åpne en lagret liturgi-fil">📂 Åpne fil …</button>
		<label class="chk"><input type="checkbox" bind:checked={app.showInstr} /> Vis instruksjoner</label>
		<label class="chk"><input type="checkbox" bind:checked={app.showRoles} /> Vis roller (L / M / ML / A)</label>
		<button class="wide" onclick={() => toggleTheme()}>
			{app.theme === 'dark' ? '☀️ Lyst utseende' : '🌙 Mørkt utseende'}
		</button>
	</div>
</aside>
