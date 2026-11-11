<script>
	import { app, openService, openTemplate, deleteService, deleteTemplate, sortedServices, persist, uid, newServiceFromTemplate, createService, toggleTheme } from '$lib/store.svelte.js';
	import { prompt, confirmBox, newServiceModal } from '$lib/modal.svelte.js';

	function newTemplate() {
		prompt('Ny lokal mal', 'Navn på malen', (name) => {
			const t = { id: uid(), kind: 'template', name: name || 'Ny grunnordning', sections: [{ title: 'I. Samling', items: [] }] };
			app.templates.push(t);
			persist();
			openTemplate(t.id);
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
		<div class="sidehead">Gudstjenester</div>
		<ul class="list">
			{#each sortedServices() as s (s.id)}
				<li class:active={app.current === s}>
					<span class="nm" onclick={() => openService(s.id)}>
						{s.name}{#if s.date}&nbsp;<span class="dt">{s.date}</span>{/if}
					</span>
					<button class="del" title="Slett" onclick={() => confirmBox('Slett', `Slette «${s.name}»?`, () => deleteService(s.id))}>🗑</button>
				</li>
			{/each}
		</ul>
		<button class="wide" onclick={newService}>+ Ny gudstjeneste</button>
	</div>
	<div class="sidegroup">
		<div class="sidehead">Maler</div>
		<ul class="list">
			{#each app.templates as t (t.id)}
				<li class:active={app.current === t}>
					<span class="nm" onclick={() => openTemplate(t.id)}>{t.name}</span>
					<button class="del" title="Slett" onclick={() => confirmBox('Slett', `Slette malen «${t.name}»?`, () => deleteTemplate(t.id))}>🗑</button>
				</li>
			{/each}
		</ul>
		<button class="wide" onclick={newTemplate}>+ Ny lokal mal</button>
	</div>
	<div class="sidefoot">
		<label class="chk"><input type="checkbox" bind:checked={app.showInstr} /> Vis instruksjoner</label>
		<label class="chk"><input type="checkbox" bind:checked={app.showRoles} /> Vis roller (L / M / ML / A)</label>
		<button class="wide" onclick={() => toggleTheme()}>
			{app.theme === 'dark' ? '☀️ Lyst utseende' : '🌙 Mørkt utseende'}
		</button>
	</div>
</aside>
