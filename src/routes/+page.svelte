<script>
	import Sidebar from '$lib/Sidebar.svelte';
	import Modulfaner from '$lib/Modulfaner.svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { app, veksleSidebar, veksleToc, loadStore, huskFane, dokNoekkel } from '$lib/store.svelte.js';
	import { mdi } from '$lib/mdi.js';
	import Editor from '$lib/Editor.svelte';
	import Welcome from '$lib/Welcome.svelte';
	import Maler from '$lib/Maler.svelte';
	import Bibliotek from '$lib/Bibliotek.svelte';
	import Eksport from '$lib/Eksport.svelte';
	import Salmer from '$lib/Salmer.svelte';
	import Oversikt from '$lib/Oversikt.svelte';
	import MalAlternativer from '$lib/MalAlternativer.svelte';
	import Innstillinger from '$lib/Innstillinger.svelte';
	import Handbok from '$lib/Handbok.svelte';
	import { startTekstCacheBakgrunn } from '$lib/tekstcache.js';

	/** ⌥⌘@ veksler dokumentpanelet (høyremenyen). e.code === 'Backslash' er den
	 *  FYSISKE @-tasten på norsk tastatur (layout-uavhengig) — Electron-menyens
	 *  accelerator '\\\\' traff ikke @-tasten på norsk layout, så bindingen
	 *  ligger her i stedet (menyen har bare klikkbart punkt, ingen accelerator,
	 *  for å unngå dobbeltveksling). */
	function globalTaster(e) {
		if ((e.metaKey || e.ctrlKey) && e.altKey && e.code === 'Backslash') {
			e.preventDefault();
			veksleToc();
		}
	}
	import Kirkeaar from '$lib/Kirkeaar.svelte';
	import Forberedelse from '$lib/Forberedelse.svelte';
	import KirkeaarCache from '$lib/KirkeaarCache.svelte';
	import DokInsp from '$lib/DokInsp.svelte';
	import Modal from '$lib/Modal.svelte';
	import Kommandopalett from '$lib/Kommandopalett.svelte';
	import { saveCurrent, erOriginalMal } from '$lib/fileio.svelte.js';

	loadStore();

	// mac-menylinjen: dokumenthandlinger av/på etter tilstand
	$effect(() => {
		window.liturgi?.sendMenyTilstand?.({ dokumentÅpen: !!app.current, kind: app.kind, tema: app.theme, visning: app.visning, visInnhold: !!app.eksVisInnhold, koblet: app.eksKoblet !== false, harFil: !!app.current?.filePath, vim: app.vimModus, forbModul: app.forbModul, forbRediger: app.forbRediger, malKilde: app.kind === 'template' ? (app.current?.__devMal ? 'dev' : (erOriginalMal(app.current) ? 'original' : 'bruker')) : undefined, eks: app.eksMenyTilstand ? JSON.parse(JSON.stringify(app.eksMenyTilstand)) : undefined });
	});

	// DEV: hent dev-tilstand fra main (isPackaged) — styrer dev-verktøyene (Malverktøy)
	let Malverktoy = $state(null); // lastes bare inn i dev-bygg (__DEV_MODE__)
	let Diff = $state(null); // sammenlign .limal-filer side om side (les-kun modul)
	if (__DEV_MODE__ && typeof window !== 'undefined') {
		if (window.liturgi?.devTilstand) {
			window.liturgi.devTilstand().then((t) => { app.devModus = !!t?.devModus; });
		}
		import('$lib/Malverktoy.svelte').then((m) => { Malverktoy = m.default; });
		import('$lib/Diff.svelte').then((m) => { Diff = m.default; });
	}

	// hovedprosessen ber oss lagre og lukke (avsluttingsbekreftelse)
	if (typeof window !== 'undefined' && window.liturgi?.onSaveThenClose) {
		window.liturgi.onSaveThenClose(async () => {
			await saveCurrent();
			window.close();
		});
	}

	/** TOC-chevrons: seksjonene er lukket som standard; chevronen pner ledd-listen
	 *  og ledd-klikket navigerer direkte (redigering: scroll til leddet, eksport:
	 *  rull leddoversikten/forhåndsvisningen). */
	let tocAapen = $state({});
	function leddNavn(it) {
		const TYPE_LABEL = { tekst: 'Tekst', salme: 'Salme', instruks: 'Instruks', lesning: 'Lesning', bonn: 'Bnn' };
		if (it.type === 'salme') {
			const st = [it.salmeNr, it.salmeTittel].filter(Boolean).join(' ');
			return (it.heading ? it.heading + ': ' : '') + (st || 'Salme');
		}
		return it.heading || TYPE_LABEL[it.type] || 'Ledd';
	}
	function gotoLedd(si, it) {
		// eksportmodulen: rull leddoversikten til raden (og forhvisningen ved Skjerm)
		if (document.querySelector('#eksport-side')) {
			window.__eksTilLedd?.(si + ':' + (app.current?.sections?.[si]?.items ?? []).indexOf(it));
			return;
		}
		const el = document.getElementById('ledd-' + it.id);
		const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (el) el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
		else gotoSec(si);
	}
	function gotoSec(i) {
		// i eksportmodulen ruller Avsnitt-listen forhåndsvisningen til seksjonens side
		// (manuell scrollTop — scrollIntoView ville også forskjøvet foreldre-containerne)
		if (document.querySelector('#eksport-side')) {
			// glidende rull i forhåndsvisningen (Eksport.svelte) + rull i venstre oversikt
			const liste = document.querySelector('.eksport-liste');
			const hode = liste?.querySelector(`.eksport-seksjon[data-sec="${i}"]`);
			if (liste && hode) liste.scrollTo({ top: Math.max(0, hode.offsetTop - liste.offsetTop - 6), behavior: 'smooth' });
			window.__eksTilSec?.(i);
			return;
		}
		const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		document.getElementById('sec-' + i)?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
	}
	/** Modul-navigasjon: tittel + fane-stripe i SAMME posisjon for alle
	 *  moduler med undermoduler (Gudstjeneste, Bibliotek, Innstillinger). */
	/** Kompakt modul-heading ved rulling: fanestripen forblir synlig (sticky),
	 *  og tittelen krymper når innholdet ruller under den. */
	let mainEl = $state(null);

	/* Rullminne per dokument + fane: hver fane husker sin egen rulleposisjon,
	   så bytte frem og tilbake ikke flytter stedet mellom fanene. */
	let rullMinne = {};
	let aktivRull = '';
	// 'hjem' med åpent dokument = redigeringsvisningen (fallback) — samme rullslot
	const rullNoekkel = $derived(dokNoekkel(app.current, app.kind) + ':' + ((app.current && app.visning === 'hjem') ? 'editor' : app.visning));
	$effect.pre(() => {
		// foer fane-swap: lagre naavaerende rulleposisjon under GAMMEL noekkel
		if (aktivRull && aktivRull !== rullNoekkel && mainEl) rullMinne[aktivRull] = mainEl.scrollTop;
		aktivRull = rullNoekkel;
	});
	$effect(() => {
		const el = mainEl;
		if (!el) return;
		const lagret = rullMinne[rullNoekkel] ?? 0;
		// gjenopprett etter at den nye fanen er montert (dobbel rAF = layout ferdig)
		requestAnimationFrame(() => requestAnimationFrame(() => { el.scrollTop = lagret; }));
	});
	$effect(() => {
		const el = mainEl;
		if (!el) return;
		const onScroll = () => {
			el.classList.toggle('main-scrollt', el.scrollTop > 8);
			// lopende lagring: rulleposisjonen til AKTIV fane
			if (aktivRull) rullMinne[aktivRull] = el.scrollTop;
		};
		el.addEventListener('scroll', onScroll, { passive: true });
		onScroll();
		return () => el.removeEventListener('scroll', onScroll);
	});
	/* husk siste aktive fane per dokument (persistert i db/localStorage) */
	$effect(() => {
		const v = app.visning;
		const ok = ['editor', 'oversikt', 'salmer', 'eksport', 'maldeler'];
		if (app.current && ok.includes(v)) huskFane(dokNoekkel(app.current, app.kind), v);
	});

	const modul = $derived.by(() => {
		const andre = ['kirkeaar', 'forberedelse', 'bibliotek', 'maler', 'innstillinger', 'malverktoy', 'diff'];
		// en åpen gudstjeneste: redigering/salmer/eksport (visning kan stå på
		// 'hjem' mens dokumentet er åpent — fallback-renderer da editoren)
		if (app.current && app.kind === 'service' && !andre.includes(app.visning)) {
			return {
				tittel: 'Gudstjeneste',
				aktiv: app.visning === 'salmer' ? 'salmer' : app.visning === 'eksport' ? 'eksport' : app.visning === 'oversikt' ? 'oversikt' : 'redigering',
				faner: [
					{ id: 'redigering', navn: 'Redigering', velg: () => { app.visning = 'editor'; } },
					{ id: 'oversikt', navn: 'Oversikt', velg: () => { app.visning = 'oversikt'; } },
					{ id: 'salmer', navn: 'Salmer', velg: () => { app.visning = 'salmer'; } },
					{ id: 'eksport', navn: 'Eksport', velg: () => { app.visning = 'eksport'; } }
				]
			};
		}
		// isolert eksport (fra Eksportér-knappen i mal-listen): kun eksport-siden
		if (app.current && app.kind === 'template' && app.isolertEksport) {
			return { tittel: 'Mal — eksport', faner: [] };
		}
		// åpen mal: egne undermoduler (Mal/Alternativer/Oversikt/Eksport) —
		// bibliotek-navigasjonen er ikke gyldig i mal-redigeringen
		if (app.current && app.kind === 'template' && !andre.includes(app.visning)) {
			return {
				tittel: 'Mal',
				aktiv: app.visning === 'maldeler' ? 'alternativer' : app.visning === 'eksport' ? 'eksport' : app.visning === 'oversikt' ? 'oversikt' : 'mal',
				faner: [
					{ id: 'mal', navn: 'Mal', velg: () => { app.visning = 'editor'; } },
					{ id: 'alternativer', navn: 'Innstillinger', velg: () => { app.visning = 'maldeler'; } },
					{ id: 'oversikt', navn: 'Oversikt', velg: () => { app.visning = 'oversikt'; } },
					{ id: 'eksport', navn: 'Eksport', velg: () => { app.visning = 'eksport'; } }
				]
			};
		}
		if (app.visning === 'bibliotek' || app.visning === 'maler') {
			return {
				tittel: 'Bibliotek',
				aktiv: app.visning,
				faner: [
					{ id: 'bibliotek', navn: 'Bibliotek', velg: () => { app.visning = 'bibliotek'; } },
					{ id: 'maler', navn: 'Maler', velg: () => { app.visning = 'maler'; } }
				]
			};
		}
		if (app.visning === 'innstillinger') {
			return {
				tittel: 'Innstillinger',
				aktiv: app.innFane ?? 'generelt',
				faner: [
					{ id: 'generelt', navn: 'Generelt', velg: () => { app.innFane = 'generelt'; } },
					{ id: 'prekenforberedelse', navn: 'Prekenforberedelse', velg: () => { app.innFane = 'prekenforberedelse'; } }
				]
			};
		}
		return null;
	});

	onMount(() => {
		if (!window.liturgi?.isElectron) return;
		startTekstCacheBakgrunn();
		// salmeregistreringer gjort offline kjres nr appen kommer online;
		// markeringen 'Ikke registrert' p salmeleddene tmmes nr ken er utfrt
		const tmmSalmeMarkeringer = () => {
			for (const sec of app.current?.sections ?? []) {
				for (const it of sec.items ?? []) {
					if (it.salmeIkkeRegistrert) it.salmeIkkeRegistrert = false;
				}
			}
		};
		const flush = async () => {
			const r = await window.liturgi.salmeFlushKo?.();
			if (r?.ok && r.registrert > 0) {
				tmmSalmeMarkeringer();
				toast.success(r.registrert === 1 ? 'Salmen er registrert mot gudstjeneste.no' : r.registrert + ' salmer er registrert mot gudstjeneste.no');
			}
		};
		window.addEventListener('online', flush);
		window.liturgi.onSalmeKoFlushet?.((data) => {
			if (!data?.registrert) return;
			tmmSalmeMarkeringer();
			toast.success(data.registrert === 1 ? 'Salmen er registrert mot gudstjeneste.no' : data.registrert + ' salmer er registrert mot gudstjeneste.no');
		});
	});
</script>


<div id="app" class:sidebar-skjult={app.sidebarSkjult} class:toc-skjult={app.tocSkjult} class:toc-aktiv={!!app.current || app.portalToc}>
	<button class="ikon-btn sidebar-toggle" onclick={veksleSidebar}
		title={app.sidebarSkjult ? 'Vis sidemenyen' : 'Skjul sidemenyen'}>
		{@html mdi(app.sidebarSkjult ? 'menu-open' : 'page-layout-sidebar-left', 18)}
	</button>
	<Sidebar />
	<main id="main" bind:this={mainEl}>
		{#if modul}
			<header class="modul-topp">
				<span class="modul-tittel">{modul.tittel}</span>
				<Modulfaner faner={modul.faner} aktiv={modul.aktiv} />
			</header>
		{/if}
		{#if app.visning === 'eksport' && app.current}
			<Eksport />
		{:else if app.visning === 'maldeler' && app.current && app.kind === 'template'}
			<MalAlternativer />
		{:else if app.visning === 'oversikt' && app.current}
			<Oversikt />
		{:else if app.visning === 'salmer' && app.current}
			<Salmer />
		{:else if app.visning === 'malverktoy' && app.devModus && Malverktoy}
			<Malverktoy />
		{:else if app.visning === 'diff' && app.devModus && Diff}
			<Diff />
		{:else if app.visning === 'handbok'}
			<Handbok />
		{:else if app.current}
			<Editor />
		{:else if app.visning === 'maler'}
			<Maler />
		{:else if app.visning === 'bibliotek'}
			<Bibliotek />
		{:else if app.visning === 'eksport'}
			<Eksport />
		{:else if app.visning === 'kirkeaar'}
			<Kirkeaar />
		{:else if app.visning === 'forberedelse'}
			<Forberedelse />
		{:else if app.visning === 'innstillinger'}
			<Innstillinger />
	{:else}
			<Welcome />
		{/if}
	</main>
	{#if app.current || app.portalToc}
		<button class="ikon-btn toc-toggle" class:aaapen={!app.tocSkjult} onclick={veksleToc}
			title={app.tocSkjult ? 'Vis dokumentpanelet' : 'Skjul dokumentpanelet'}>
			{@html mdi(app.tocSkjult ? 'menu-open' : 'page-layout-sidebar-right', 18)}
		</button>
	{/if}
	<aside id="toc-side">
		{#if app.current?.sections && app.current.sections.length >= 1}
			<div class="toc-avsnitt">
			<div class="sidehead">Avsnitt</div>
			<ul class="list">
				{#each app.current.sections as sec, i (i)}
					{@const aapen = !!tocAapen[i]}
					<li class="toc-sec" class:aapen>
						<button class="toc-chev" title={aapen ? 'Skjul leddene' : 'Vis leddene i avsnittet'}
							onclick={(e) => { e.stopPropagation(); tocAapen[i] = !tocAapen[i]; }}>
							{@html mdi(aapen ? 'chevron-down' : 'chevron-right', 14)}
						</button>
						<span class="nm" onclick={() => gotoSec(i)} role="button" tabindex="0"
							onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') gotoSec(i); }}>{sec.title}</span>
						{#if aapen}
							<ul class="toc-ledd">
								{#each (sec.items ?? []).filter((it) => it.enabled !== false) as it (it.id)}
									<li onclick={() => gotoLedd(i, it)} title="Gå til leddet">
										<span class="nm">{leddNavn(it)}</span>
									</li>
								{/each}
								{#if !(sec.items ?? []).some((it) => it.enabled !== false)}
									<li class="toc-tom">(ingen ledd)</li>
								{/if}
							</ul>
						{/if}
					</li>
				{/each}
			</ul>
			</div>
			<hr class="side-skiller" />
		{/if}
		{#if app.current}
			<DokInsp />
		{/if}
		{#if app.visning === 'eksport' && app.current}
			<hr class="side-skiller" />
			<div class="toc-avsnitt">
				<div class="sidehead">Eksport</div>
				<label class="lys-manus-valg" title="Genererer et lysbildemanus (medarbeiderutvalg) med lysbildenummer i venstre marg sammen med PowerPoint-eksporten. Lagres per profil (Skjerm).">
					<input type="checkbox" checked={app.current?.eksportInnst?.Skjerm?.lysManus ?? false}
						onchange={(e) => { app.current.eksportInnst = { ...(app.current.eksportInnst ?? {}), Skjerm: { ...(app.current.eksportInnst?.Skjerm ?? {}), lysManus: e.currentTarget.checked } }; }} />
					Lysbildemanus
				</label>
			</div>
		{/if}
	</aside>
</div>

{#key (app.modal?.type ?? '') + ':' + (app.modal?.id ?? '')}
	<Modal />
{/key}

<Kommandopalett />
<KirkeaarCache />

<svelte:window onbeforeunload={(e) => { if (app.dirty) e.preventDefault(); }} onkeydown={globalTaster} />
