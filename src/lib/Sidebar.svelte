<script>
	import { app, openService, deleteService, sortedServices, createService, toggleTheme } from '$lib/store.svelte.js';
	import { newServiceModal } from '$lib/modal.svelte.js';
	import { openFileToStore, openServiceFile, refreshRecentServices, loadTemplatesFromDisk } from '$lib/fileio.svelte.js';
	import { mdi } from '$lib/mdi.js';

	const isElectron = typeof window !== 'undefined' && !!window.liturgi?.isElectron;
	const MAX_RECENT = 5;

	$effect(() => {
		if (isElectron) {
			refreshRecentServices();
			loadTemplatesFromDisk();
		}
	});

	const recent = $derived(app.recentServices.slice(0, MAX_RECENT));
	const åpne = $derived(app.åpneTjenester);

	/** Vis navnet fra objektet (følger omdøping). */
	function navn(e) {
		return e.obj?.name || e.name || 'Uten navn';
	}

	function åpneNy(e) {
		if (app.current === e.obj) return;
		app.current = e.obj;
		app.kind = 'service';
		app.visning = 'hjem';
		app.dirty = !!e.obj.__dirty;
		window.liturgi?.setDirty?.(!!e.obj.__dirty);
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
	{#if åpne.length}
		<div class="sidegroup åpne-gruppe">
			<div class="sidehead">Åpne gudstjenester</div>
			<ul class="list">
				{#each åpne as e (e.åpenId)}
					<li class:active={app.current?.__åpenId === e.åpenId} class:dirty={app.current?.__åpenId === e.åpenId && app.dirty}>
						<span class="nm" onclick={() => åpneNy(e)} title={e.path ?? 'Ikke lagret ennå'}>
							{#if app.current?.__åpenId === e.åpenId && app.dirty}<span class="dirty-dot" title="Ulagrede endringer"></span>{/if}
							{navn(e)}
						</span>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
	<div class="sidegroup">
		<div class="sidehead">Sist brukt{#if isElectron}&nbsp;· siste {MAX_RECENT}{/if}</div>
		<ul class="list">
			{#if isElectron}
				{#each recent as s (s.path)}
					<li>
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
		<button class="wide" onclick={newService}>{@html mdi('church')} + Ny gudstjeneste</button>
	</div>
	<div class="sidefoot">
		<button class="wide" onclick={() => { app.current = null; app.kind = null; app.visning = 'hjem'; }}>
			{@html mdi('home')} Hjem
		</button>
		<button class="wide" onclick={() => { app.current = null; app.kind = null; app.visning = app.visning === 'maler' ? 'hjem' : 'maler'; }}>
			{@html mdi('book-open-variant')} Maler
		</button>
		<button class="wide" onclick={() => { app.current = null; app.kind = null; app.visning = app.visning === 'bibliotek' ? 'hjem' : 'bibliotek'; }}>
			{@html mdi('library')} Bibliotek
		</button>
		<button class="wide" onclick={() => { app.current = null; app.kind = null; app.visning = app.visning === 'innstillinger' ? 'hjem' : 'innstillinger'; }}>
			{@html mdi('cog')} Innstillinger
		</button>
		<button class="wide" onclick={openFileToStore} title="Åpne en lagret liturgi-fil">{@html mdi('folder-open-outline')} Åpne fil …</button>
		<div class="sidefoot-ikoner">
			<button class="ikon-btn" onclick={() => toggleTheme()} title={app.theme === 'dark' ? 'Lyst utseende' : 'Mørkt utseende'}>
				{@html mdi('theme-light-dark', 18)}
			</button>
		</div>
	</div>
</aside>
