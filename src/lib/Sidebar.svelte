<script>
	import { app, openService, deleteService, sortedServices, createService, toggleTheme, syncDirty } from '$lib/store.svelte.js';
	import { newServiceModal, valgModal } from '$lib/modal.svelte.js';
	import { openFileToStore, openServiceFile, refreshRecentServices, loadTemplatesFromDisk, lukkRedigering } from '$lib/fileio.svelte.js';
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
		app.dirty = !!e.dirty;
		window.liturgi?.setDirty?.(!!e.dirty);
	}

	async function newService() {
		// sørg for at malene er lastet (kan mangle rett etter app-oppstart)
		if (!app.templates.length && isElectron) await loadTemplatesFromDisk();
		if (!app.templates.length) return;
		newServiceModal((name, date, tplId, include, kirkeaar, tekster, valgLedd, valgtGruppe) => {
			createService(name, date, tplId, include, kirkeaar, tekster, valgLedd, valgtGruppe);
		});
	}

	/** Kryss på en åpen gudstjeneste: lukk den. Aktive med ulagrede endringer får
	 *  lagre/forkast-dialogen; ikke-aktive uten endringer fjernes rett fra listen. */
	function lukkFraListe(e) {
		if (app.current?.__åpenId === e.åpenId) { lukkRedigering(); return; }
		if (e.dirty) {
			app.current = e.obj;
			app.kind = 'service';
			app.visning = 'hjem';
			lukkRedigering();
			return;
		}
		const idx = app.åpneTjenester.indexOf(e);
		if (idx >= 0) app.åpneTjenester.splice(idx, 1);
	}

	/** Fjern fra «Sist brukt»-listen — filen på disken røres ikke. */
	async function fjernRecent(p) {
		if (typeof window !== 'undefined' && window.liturgi?.removeRecent) {
			await window.liturgi.removeRecent(p);
			refreshRecentServices();
		}
	}

	/** Åpne en mal fra «Åpne maler»-listen. */
	function åpneMalFraListe(m) {
		if (app.current?.__åpenMalId === m.åpenMalId) { app.visning = 'hjem'; return; }
		app.current = m.obj;
		app.kind = 'template';
		app.visning = 'hjem';
		app.dirty = !!m.dirty;
		syncDirty();
	}

	/** Kryss på en åpen mal: lukk den. Ulagrede endringer i en ikke-aktiv mal
	 *  bekreftes først (Lagre til prosjektet gjelder kun dev-maler). */
	function lukkMalFraListe(m) {
		if (app.current?.__åpenMalId === m.åpenMalId) { lukkRedigering(); return; }
		const idx = app.åpneMaler.indexOf(m);
		if (idx < 0) return;
		if (m.dirty) {
			valgModal(
				'Forkast endringer?',
				`«${m.obj.name}» har ulagrede endringer${m.dev ? '. De kan lagres til prosjektet i Malverktøy' : ''}.`,
				'Forkast', 'Avbryt',
				() => app.åpneMaler.splice(idx, 1)
			);
			return;
		}
		app.åpneMaler.splice(idx, 1);
	}
</script>

<aside id="sidebar">
	<h1>Liturgi</h1>
	<button class="wide" onclick={newService}>{@html mdi('church')} Ny gudstjeneste</button>
	<hr class="side-skiller" />
	{#if åpne.length}
		<div class="sidegroup åpne-gruppe">
			<div class="sidehead">Åpne gudstjenester</div>
			<ul class="list">
				{#each åpne as e (e.åpenId)}
					<li class:active={app.current?.__åpenId === e.åpenId} class:dirty={e.dirty}>
						<span class="nm" onclick={() => åpneNy(e)} title={e.path ?? 'Ikke lagret ennå'}>
							{#if e.dirty}<span class="dirty-dot" title="Ulagrede endringer"></span>{/if}
							{navn(e)}
						</span>
						<button class="åpne-x" title="Lukk gudstjenesten" onclick={(ev) => { ev.stopPropagation(); lukkFraListe(e); }}>
							{@html mdi('close', 13)}
						</button>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
	{#if åpne.length}<hr class="side-skiller" />{/if}
	{#if app.åpneMaler.length}
		<div class="sidegroup åpne-gruppe">
			<div class="sidehead">Åpne maler</div>
			<ul class="list">
						{#each app.åpneMaler as m (m.åpenMalId)}
					<li class:active={app.current?.__åpenMalId === m.åpenMalId} class:dirty={m.dirty}>
						<span class="nm" onclick={() => åpneMalFraListe(m)} title={m.obj.name}>
							{#if m.dirty}<span class="dirty-dot" title="Ulagrede endringer"></span>{/if}
							{m.obj.name ?? m.name}
							{#if m.dev}<span class="dev-merke" title="Åpnet fra Malverktøy — lagres tilbake til prosjektet">dev</span>{/if}
						</span>
						<button class="åpne-x" title="Lukk malen" onclick={(ev) => { ev.stopPropagation(); lukkMalFraListe(m); }}>
							{@html mdi('close', 13)}
						</button>
					</li>
				{/each}
			</ul>
		</div>
		<hr class="side-skiller" />
	{/if}
	<div class="sidegroup">
		<div class="sidehead">Sist brukt{#if isElectron}&nbsp;· siste {MAX_RECENT}{/if}</div>
		<ul class="list">
			{#if isElectron}
				{#each recent as s (s.path)}
					<li>
						<span class="nm" onclick={() => openServiceFile(s.path)} title={s.path}>
							{#if s.date}<span class="dt">{s.date}</span>{/if}
							<span class="nm-t">{s.name}</span>
						</span>
						<button class="fjern" title="Fjern fra listen (filen beholdes)" onclick={(e) => { e.stopPropagation(); fjernRecent(s.path); }}>
							{@html mdi('close', 14)}
						</button>
					</li>
				{:else}
					<li class="empty">Ingen lagrede gudstjenester ennå</li>
				{/each}
			{:else}
				{#each sortedServices() as s (s.id)}
					<li class:active={app.current === s}>
						<span class="nm" onclick={() => openService(s.id)}>
							{#if s.date}<span class="dt">{s.date}</span>{/if}
							<span class="nm-t">{s.name}</span>
						</span>
						<button class="fjern" title="Slett" onclick={() => confirmBox('Slett', `Slette «${s.name}»?`, () => deleteService(s.id))}>
							{@html mdi('delete-outline', 14)}
						</button>
					</li>
				{/each}
			{/if}
		</ul>
	</div>
	<div class="sidefoot">
		<button class="wide" onclick={() => { app.current = null; app.kind = null; app.visning = 'hjem'; }}>
			{@html mdi('home')} Hjem
		</button>
		<button class="wide" onclick={() => { app.current = null; app.kind = null; app.visning = app.visning === 'bibliotek' ? 'hjem' : 'bibliotek'; }}>
			{@html mdi('library')} Bibliotek
		</button>
		<button class="wide" onclick={() => { app.current = null; app.kind = null; app.visning = app.visning === 'kirkeaar' ? 'hjem' : 'kirkeaar'; }}>
			{@html mdi('calendar-edit')} Kirkeåret
		</button>
		{#if app.forbRediger}
			<button class="wide" onclick={() => { app.current = null; app.kind = null; app.visning = app.visning === 'forberedelse' ? 'hjem' : 'forberedelse'; }}>
				{@html mdi('pencil')} Prekenforberedelse
			</button>
		{/if}
		<button class="wide" onclick={() => { app.current = null; app.kind = null; app.visning = app.visning === 'innstillinger' ? 'hjem' : 'innstillinger'; }}>
			{@html mdi('cog')} Innstillinger
		</button>
		{#if app.devModus}
			<button class="wide" onclick={() => {
				app.current = null; app.kind = null; app.visning = app.visning === 'diff' ? 'hjem' : 'diff';
			}}>
				{@html mdi('code-tags')} Diff
			</button>
			<button class="wide" onclick={() => {
				// beholder åpent dev-dokument (malverktøy-redigering), slik at «Lagre til prosjektet» kan nås
				if (app.current?.__devMal) { app.visning = app.visning === 'malverktoy' ? 'hjem' : 'malverktoy'; return; }
				app.current = null; app.kind = null; app.visning = app.visning === 'malverktoy' ? 'hjem' : 'malverktoy';
			}}>
				{@html mdi('pencil')} Malverktøy
			</button>
		{/if}
		<button class="wide" onclick={() => toggleTheme()} title={app.theme === 'dark' ? 'Lyst utseende' : 'Mørkt utseende'}>
			{@html mdi('theme-light-dark')} {app.theme === 'dark' ? 'Lyst utseende' : 'Mørkt utseende'}
		</button>
	</div>
</aside>
