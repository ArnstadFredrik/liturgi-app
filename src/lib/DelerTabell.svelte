<script>
	/** DelerTabell — DELT komponent for alternativ-/variasjons-modulen:
	 *  brukes både som undermodul-side (Alternativer) og som innhold i
	 *  «Deler …»-modalen. Samme komponent = samme uttrykk begge steder. */
	import { app, markDirty, secAlternativer } from '$lib/store.svelte.js';
import { erStyrt } from '$lib/deler-logikk.js';
import { erOriginalMal } from '$lib/fileio.svelte.js';

	let { mal, visMalFelt = false } = $props();
	import { mdi } from '$lib/mdi.js';
	import { malType, malFormFor, målformLabel, kanBrukes } from '$lib/maltyper.js';
	import { confirmBox, maalformModal } from '$lib/modal.svelte.js';

	let fane = $state('hoveddeler');
	let apenCelle = $state(null);
	let apenSek = $state(null); // ekspandert hoveddel (si)
	let katNyAlt = $state('');
	let katNyVar = $state('');
	let dragSi = $state(null);
	let dragOverSi = $state(null);
	let dragFor = $state(false);

	const alternativer = $derived(mal?.alternativer ?? []);
	const variasjoner = $derived(mal?.delGrupper ?? []);

	// dynamisk bibeltekst-kobling: lesning → ledd
	const BIBEL_LESNINGER = [
		{ key: 'L1', tittel: 'Første lesning' },
		{ key: 'L2', tittel: 'Andre lesning' },
		{ key: 'E', tittel: 'Evangelium' }
	];
	// gruppert per hoveddel til <optgroup>; titelløse ledd nummereres
	const bibelGrupper = $derived(
		(mal?.sections ?? []).map((sec, si) => ({
			tittel: sec.title,
			ledd: (sec.items ?? [])
				.filter((it) => it.type !== 'instruks')
				.map((it, n) => ({
					id: it.id,
					visning: it.heading || `Ledd ${n + 1} (uten tittel)`
				}))
		})).filter((g) => g.ledd.length)
	);
	function koblingFor(lesningKey) {
		return (mal?.bibeltekster ?? []).find((b) => b.lesning === lesningKey);
	}
	function velgLedd(lesningKey, leddId) {
		if (!mal) return;
		const liste = (mal.bibeltekster ?? []).filter((b) => b.lesning !== lesningKey);
		if (leddId) liste.push({ lesning: lesningKey, leddId });
		if (liste.length) mal.bibeltekster = liste;
		else delete mal.bibeltekster;
		markDirty();
	}

	// vigsel: vis «Skriftlesningenes kilde»-innstillingen
	const erVigsel = $derived((mal?.liturgiType ?? '') === 'vigsel' || /vigsel/i.test(mal?.name ?? ''));

	// oversettelser: koblingen ligger p\u00e5 mal.oversettelser; gruppen l\u00f8ses i begge retninger
	const tilkoblede = $derived(
		(mal?.oversettelser ?? [])
			.map((id) => (app.templates ?? []).find((t) => t.id === id))
			.filter(Boolean)
	);
	const koblebare = $derived(
		(app.templates ?? []).filter(
			(t) => t.id !== mal?.id && !(mal?.oversettelser ?? []).includes(t.id) && malType(t) === malType(mal)
		)
	);
	let kobleApen = $state(false);
	function kobleOversettelse(id) {
		if (!mal) return;
		mal.oversettelser = [...(mal.oversettelser ?? []), id];
		kobleApen = false;
		markDirty();
	}
	function fjernOversettelse(id) {
		if (!mal) return;
		const liste = new Set(mal.oversettelser ?? []);
		liste.delete(id);
		if (liste.size) mal.oversettelser = [...liste];
		else delete mal.oversettelser;
		markDirty();
	}

	const TYPER = [['gudstjeneste', 'Gudstjeneste'], ['vigsel', 'Vigsel'], ['gravferd', 'Gravferd']];

	function endreType(e) {
		mal.liturgiType = e.currentTarget.value;
		markDirty();
	}

	function vilBakOver(el) {
		const r = el.getBoundingClientRect();
		return window.innerHeight - r.bottom < 340;
	}

	function veksleSecAlt(sec, t, paa) {
		const n = secAlternativer(sec);
		const nye = paa ? (n.includes(t) ? n : [...n, t]) : n.filter((x) => x !== t);
		if (nye.length) sec.alternativer = nye;
		else delete sec.alternativer;
		markDirty();
	}

	function leggTilKatalog(hva, navnRaw) {
		const navn = (navnRaw ?? '').trim().toLowerCase();
		if (!navn) return;
		const nokkel = hva === 'alternativer' ? 'alternativer' : 'delGrupper';
		const liste = mal[nokkel] ?? [];
		if (liste.includes(navn)) return;
		mal[nokkel] = [...liste, navn];
		if (hva === 'alternativer') katNyAlt = '';
		else katNyVar = '';
		markDirty();
	}

	function slettKatalog(hva, navn) {
		if (!mal) return;
		const iBruk = (hva === 'alternativer'
			? (mal.sections ?? []).filter((sec) => (Array.isArray(sec.alternativer) && sec.alternativer.includes(navn)) || sec.alternativ === navn)
			: (mal.sections ?? []).filter((sec) => sec.delGruppe === navn));
		const utfor = () => slettKatalogNa(hva, navn);
		if (iBruk.length) {
			const nav = navn[0].toUpperCase() + navn.slice(1);
			confirmBox('Slettes fra katalogen?',
				'«' + nav + '» er i bruk på ' + iBruk.length + ' hoveddel' + (iBruk.length === 1 ? '' : 'er') + ' — merkingen fjernes fra alle delene. Vil du slette den fra katalogen?',
				utfor);
		} else utfor();
	}

	function slettKatalogNa(hva, navn) {
		if (!mal) return;
		if (hva === 'alternativer') {
			if (mal.alternativer) mal.alternativer = mal.alternativer.filter((t) => t !== navn);
			for (const sec of mal.sections ?? []) {
				if (Array.isArray(sec.alternativer)) sec.alternativer = sec.alternativer.filter((t) => t !== navn);
				if (sec.alternativ === navn) delete sec.alternativ;
			}
		} else {
			if (mal.delGrupper) mal.delGrupper = mal.delGrupper.filter((v) => v !== navn);
			for (const sec of mal.sections ?? []) {
				if (sec.delGruppe === navn) sec.delGruppe = undefined;
			}
		}
		apenCelle = null;
		markDirty();
	}

	/* drag-and-drop: rekkefølge på hoveddelene */
	function startDragRad(e, si) {
		dragSi = si;
		const rad = e.currentTarget.closest('.m-deler-rad');
		if (rad && e.dataTransfer.setDragImage) {
			const r = rad.getBoundingClientRect();
			e.dataTransfer.setDragImage(rad, Math.max(20, e.clientX - r.left), r.height / 2);
		}
		e.dataTransfer.effectAllowed = 'move';
	}
	function dragOverRad(e, si) {
		if (dragSi === null || si === dragSi) return;
		e.preventDefault();
		e.dataTransfer.dropEffect = 'move';
		const r = e.currentTarget.getBoundingClientRect();
		dragFor = e.clientY < r.top + r.height / 2;
		dragOverSi = si;
	}
	function droppRad(e, si) {
		e.preventDefault();
		if (dragSi === null) { dragSi = null; dragOverSi = null; return; }
		const secs = mal.sections;
		let target = dragFor ? si : si + 1;
		if (dragSi < target) target--;
		if (target !== dragSi) {
			const flyttet = secs.splice(dragSi, 1)[0];
			secs.splice(target, 0, flyttet);
			markDirty();
		}
		dragSi = null; dragOverSi = null; dragFor = false;
	}
</script>

<div class="deler-tabell-rom">
	<p class="muted m-velg-hint">Merk hver hoveddel med alternativer (flervalg — delen tas kun med når alle merkede er på ved oppretting) og variasjon (enten/eller — bare den valgte tas med). En hoveddel uten merke kan styre enkeltleddene: åpne raden med chevronen og merk leddene der. Valgfrie ledd merkes med «Valgfri» og får «Standard»-bryter (forhåndsvalgt ved oppretting). Originalmaler uten egne standardvalg har alle valgfrie ledd med som standard. Katalogene gjelder for malen og styrer valgene i «Opprett»-dialogen.</p>
	{#if apenCelle}<div class="m-deler-overlay" onclick={() => { apenCelle = null; }}></div>{/if}
	<div class="fb-visning-velger m-deler-faner" role="tablist">
		<button role="tab" aria-selected={fane === 'hoveddeler'} class:sel={fane === 'hoveddeler'} onclick={() => { fane = 'hoveddeler'; apenCelle = null; }}>Hoveddeler</button>
		<button role="tab" aria-selected={fane === 'innstillinger'} class:sel={fane === 'innstillinger'} onclick={() => { fane = 'innstillinger'; apenCelle = null; }}>Innstillinger</button>
		{#if visMalFelt}<button role="tab" aria-selected={fane === 'bibeltekster'} class:sel={fane === 'bibeltekster'} onclick={() => { fane = 'bibeltekster'; apenCelle = null; }}>Bibeltekster</button>{/if}
		{#if visMalFelt}<button role="tab" aria-selected={fane === 'informasjon'} class:sel={fane === 'informasjon'} onclick={() => { fane = 'informasjon'; apenCelle = null; }}>Informasjon</button>{/if}
	</div>

	{#if fane === 'hoveddeler'}
		<div class="m-deler-tabell">
			<div class="m-deler-rad m-deler-head"><span></span><span>Hoveddel</span><span>Alternativ</span><span>Variasjon</span><span>Valgfri</span><span>Standard</span></div>
			{#each mal?.sections ?? [] as sec, si (si)}
				<div class="m-deler-rad" class:drag-target={dragOverSi === si && dragFor} class:drag-target-etter={dragOverSi === si && !dragFor} class:deler-dragging={dragSi === si}
					ondragover={(e) => dragOverRad(e, si)} ondrop={(e) => droppRad(e, si)} ondragend={() => { dragSi = null; dragOverSi = null; }}>
					<span class="m-deler-drag" class:aktiv={dragSi !== null} draggable="true"
						ondragstart={(e) => startDragRad(e, si)} title="Dra for å endre rekkefølge">{@html mdi('drag-vertical', 14)}</span>
					<span class="m-deler-navn">
					<button type="button" class="m-deler-ekspander" title={apenSek === si ? 'Skjul leddene' : 'Vis leddene'} onclick={() => { apenSek = apenSek === si ? null : si; }}>{@html mdi(apenSek === si ? 'chevron-down' : 'chevron-right', 14)}</button>
					<span class="m-deler-navn-tekst">{sec.title}</span>
					{#if erStyrt(sec)}<span class="m-deler-styrt" title="Hoveddelen styres av alternativ/variasjon — alle leddene følger med sammen med den">{@html mdi('subdirectory-arrow-right', 13)}</span>{/if}
				</span>
					<div class="m-deler-celle-wrap alt">
						<button type="button" class="m-deler-celle" class:merket={secAlternativer(sec).length} onclick={(e) => { apenCelle = apenCelle?.si === si && apenCelle?.kol === 'alternativ' ? null : { si, kol: 'alternativ', opp: vilBakOver(e.currentTarget) }; }}>
							<span>{secAlternativer(sec).length ? secAlternativer(sec).map((t) => t[0].toUpperCase() + t.slice(1)).join(', ') : '—'}</span>
						</button>
						{#if apenCelle?.si === si && apenCelle?.kol === 'alternativ'}
							<div class="m-deler-meny" class:opp={apenCelle?.opp} role="menu">
								{#each alternativer as t (t)}
									<button type="button" class="m-alt-rad" role="menuitemcheckbox" aria-checked={secAlternativer(sec).includes(t)}
										onclick={() => veksleSecAlt(sec, t, !secAlternativer(sec).includes(t))}>
										<span class="m-alt-ind">{#if secAlternativer(sec).includes(t)}{@html mdi('check', 14)}{/if}</span>
										<span class="m-alt-tekst">{t[0].toUpperCase() + t.slice(1)}</span>
									</button>
								{/each}
								{#if !alternativer.length}<span class="muted m-alt-tom">Ingen alternativer i katalogen.</span>{/if}
							</div>
						{/if}
					</div>
					<div class="m-deler-celle-wrap var">
						<button type="button" class="m-deler-celle" onclick={(e) => { apenCelle = apenCelle?.si === si && apenCelle?.kol === 'variasjon' ? null : { si, kol: 'variasjon', opp: vilBakOver(e.currentTarget) }; }}>
							<span>{sec.delGruppe ? sec.delGruppe[0].toUpperCase() + sec.delGruppe.slice(1) : '—'}</span>
						</button>
						{#if apenCelle?.si === si && apenCelle?.kol === 'variasjon'}
							<div class="m-deler-meny" class:opp={apenCelle?.opp} role="menu">
								<button type="button" class="m-alt-rad" role="menuitemradio" aria-checked={!sec.delGruppe}
									onclick={() => { sec.delGruppe = undefined; markDirty(); }}>
									<span class="m-alt-ind">{#if !sec.delGruppe}{@html mdi('check', 14)}{/if}</span>
									<span class="m-alt-tekst">—</span>
								</button>
								<div class="m-deler-sep"></div>
								{#each variasjoner as v (v)}
									<button type="button" class="m-alt-rad" role="menuitemradio" aria-checked={sec.delGruppe === v}
										onclick={() => { sec.delGruppe = v; markDirty(); }}>
										<span class="m-alt-ind">{#if sec.delGruppe === v}{@html mdi('check', 14)}{/if}</span>
										<span class="m-alt-tekst">{v[0].toUpperCase() + v.slice(1)}</span>
									</button>
								{/each}
								{#if !variasjoner.length}<span class="muted m-alt-tom">Ingen variasjoner i katalogen.</span>{/if}
							</div>
						{/if}
					</div>
				</div>
				{#if apenSek === si}
					{@const styrt = erStyrt(sec)}
					{#if styrt}
						<div class="m-deler-ledd-hint">Hoveddelen styres av alternativ/variasjon — alle leddene følger med sammen med den. Enkeltledd-merker gjelder ikke her.</div>
					{/if}
					{#each (sec.items ?? []).filter((it) => it.type !== 'instruks') as it, li (it.id ?? 'l' + li)}
						<div class="m-deler-rad m-deler-ledd">
							<span></span>
							<span class="m-deler-navn m-deler-ledd-navn">
								<span class="m-deler-navn-tekst">{it.heading || '(uten tittel)'}</span>
							</span>
							<div class="m-deler-celle-wrap alt">
								<button type="button" class="m-deler-celle" class:merket={secAlternativer(it).length} disabled={styrt} title={styrt ? 'Hoveddelen styres av alternativ/variasjon' : 'Alternativer for dette leddet'} onclick={(e) => { apenCelle = apenCelle?.si === si && apenCelle?.li === li && apenCelle?.kol === 'alternativ' ? null : { si, li, kol: 'alternativ', opp: vilBakOver(e.currentTarget) }; }}>
									<span>{secAlternativer(it).length ? secAlternativer(it).map((t) => t[0].toUpperCase() + t.slice(1)).join(', ') : '—'}</span>
								</button>
								{#if !styrt && apenCelle?.si === si && apenCelle?.li === li && apenCelle?.kol === 'alternativ'}
									<div class="m-deler-meny" class:opp={apenCelle?.opp} role="menu">
										{#each alternativer as t (t)}
											<button type="button" class="m-alt-rad" role="menuitemcheckbox" aria-checked={secAlternativer(it).includes(t)}
												onclick={() => veksleSecAlt(it, t, !secAlternativer(it).includes(t))}>
												<span class="m-alt-ind">{#if secAlternativer(it).includes(t)}{@html mdi('check', 14)}{/if}</span>
												<span class="m-alt-tekst">{t[0].toUpperCase() + t.slice(1)}</span>
											</button>
										{/each}
										{#if !alternativer.length}<span class="muted m-alt-tom">Ingen alternativer i katalogen.</span>{/if}
									</div>
								{/if}
							</div>
							<div class="m-deler-celle-wrap var">
								<button type="button" class="m-deler-celle" disabled={styrt} title={styrt ? 'Hoveddelen styres av alternativ/variasjon' : 'Variasjon (del-gruppe) for dette leddet'} onclick={(e) => { apenCelle = apenCelle?.si === si && apenCelle?.li === li && apenCelle?.kol === 'variasjon' ? null : { si, li, kol: 'variasjon', opp: vilBakOver(e.currentTarget) }; }}>
									<span>{it.delGruppe ? it.delGruppe[0].toUpperCase() + it.delGruppe.slice(1) : '—'}</span>
								</button>
								{#if !styrt && apenCelle?.si === si && apenCelle?.li === li && apenCelle?.kol === 'variasjon'}
									<div class="m-deler-meny" class:opp={apenCelle?.opp} role="menu">
										<button type="button" class="m-alt-rad" role="menuitemradio" aria-checked={!it.delGruppe}
											onclick={() => { it.delGruppe = undefined; markDirty(); }}>
											<span class="m-alt-ind">{#if !it.delGruppe}{@html mdi('check', 14)}{/if}</span>
											<span class="m-alt-tekst">—</span>
										</button>
										<div class="m-deler-sep"></div>
										{#each variasjoner as v (v)}
											<button type="button" class="m-alt-rad" role="menuitemradio" aria-checked={it.delGruppe === v}
												onclick={() => { it.delGruppe = v; markDirty(); }}>
												<span class="m-alt-ind">{#if it.delGruppe === v}{@html mdi('check', 14)}{/if}</span>
												<span class="m-alt-tekst">{v[0].toUpperCase() + v.slice(1)}</span>
											</button>
										{/each}
										{#if !variasjoner.length}<span class="muted m-alt-tom">Ingen variasjoner i katalogen.</span>{/if}
									</div>
								{/if}
							</div>
							<span class="m-deler-bryter-celle">
								<button type="button" class="avpaa-bryter-knapp" role="checkbox" aria-checked={it.optional === true}
									disabled={styrt}
									title="Valgfri: leddet kan slås av/på i «Opprett»-dialogen"
									onclick={() => { it.optional = !(it.optional === true); markDirty(); }}>
									<span class="avpaa-bryter" aria-hidden="true"><span class="avpaa-klump"></span></span>
								</button>
							</span>
							<span class="m-deler-bryter-celle">
								{#if it.optional === true}
									<button type="button" class="avpaa-bryter-knapp" role="checkbox" aria-checked={it.valgStandard === true}
										disabled={styrt}
										title="Valgt som standard når gudstjenesten opprettes (originalmaler uten egne standardvalg: alle valgfrie ledd er med)"
										onclick={() => { it.valgStandard = !(it.valgStandard === true); markDirty(); }}>
										<span class="avpaa-bryter" aria-hidden="true"><span class="avpaa-klump"></span></span>
									</button>
								{:else}<span class="muted" style="opacity: 0.5;">—</span>
								{/if}
							</span>
						</div>
					{/each}
				{/if}
			{/each}
		</div>
	{:else if fane === 'innstillinger'}
		<div class="minst-gruppe">
			<p class="minst-tittel">Kataloger</p>
		<div class="m-deler-admin">
			<div>
				<p class="m-deler-adm-tittel">Alternativer</p>
				{#each alternativer as t (t)}
					<div class="m-deler-adm-rad"><span>{t[0].toUpperCase() + t.slice(1)}</span><button type="button" class="m-dg-slett" title="Slett alternativet (fjernes fra alle deler)" onclick={() => slettKatalog('alternativer', t)}>{@html mdi('delete-outline', 14)}</button></div>
				{/each}
				{#if !alternativer.length}<p class="muted">Ingen alternativer ennå.</p>{/if}
				<div class="m-dg-ny"><input placeholder="Nytt alternativ" bind:value={katNyAlt} onkeydown={(e) => { if (e.key === 'Enter') { leggTilKatalog('alternativer', katNyAlt); e.preventDefault(); } }} /><button onclick={() => leggTilKatalog('alternativer', katNyAlt)}>Legg til</button></div>
			</div>
			<div>
				<p class="m-deler-adm-tittel">Variasjoner (del-grupper)</p>
				{#each variasjoner as v (v)}
					<div class="m-deler-adm-rad"><span>{v[0].toUpperCase() + v.slice(1)}</span><button type="button" class="m-dg-slett" title="Slett variasjonen (fjernes fra alle deler)" onclick={() => slettKatalog('variasjoner', v)}>{@html mdi('delete-outline', 14)}</button></div>
				{/each}
				{#if !variasjoner.length}<p class="muted">Ingen variasjoner ennå.</p>{/if}
				<div class="m-dg-ny"><input placeholder="Ny variasjon, f.eks. Bisettelse" bind:value={katNyVar} onkeydown={(e) => { if (e.key === 'Enter') { leggTilKatalog('variasjoner', katNyVar); e.preventDefault(); } }} /><button onclick={() => leggTilKatalog('variasjoner', katNyVar)}>Legg til</button></div>
			</div>
		</div>
		</div>

		{#if visMalFelt}
		<div class="minst-gruppe">
			<p class="minst-tittel">Malinnstillinger</p>
			<div class="m-deler-admin mal-felt">
			<div>
				<p class="m-deler-adm-tittel">Målform</p>
				<button type="button" class="hd-maal-btn" title="Velg eller legg til målform" onclick={() => maalformModal(mal)}>
					{@html mdi('pencil', 13)} {målformLabel(malFormFor(mal))} — endre …
				</button>
			</div>
			<div>
				<p class="m-deler-adm-tittel">Type</p>
				<select value={malType(mal)} onchange={endreType} title="Endre typen malen tilhører">
					{#each TYPER as [verdi, navn] (verdi)}<option value={verdi}>{navn}</option>{/each}
				</select>
			</div>
			<div>
				<p class="m-deler-adm-tittel">WIP</p>
				<button type="button" class="avpaa" role="checkbox" aria-checked={mal.wip === true} title="Merk malen som utkast (wip) — skjules fra Opprett og (originaler) biblioteket til den bekreftes. Lagres med malen."
					onclick={() => { mal.wip = mal.wip !== true; markDirty(); if (mal.__devMal) window.dispatchEvent(new CustomEvent('liturgi:lagre-wip', { detail: mal })); }}>
					<span class="avpaa-tekst">Merk som WIP</span>
					<span class="avpaa-bryter" aria-hidden="true"><span class="avpaa-klump"></span></span>
				</button>
			</div>
			<div>
				<p class="m-deler-adm-tittel">Bruk</p>
				<button type="button" class="avpaa" role="checkbox" aria-checked={mal.kanGudstjeneste !== false} title="Styrer om MALEN vises i «Opprett gudstjeneste» — noe annet enn valgfrie ledd, som styrer hvilke enkeltledd som er med som standard." onclick={() => { mal.kanGudstjeneste = mal.kanGudstjeneste === false; markDirty(); }}>
					<span class="avpaa-tekst">Kan brukes til gudstjenester</span>
					<span class="avpaa-bryter" aria-hidden="true"><span class="avpaa-klump"></span></span>
				</button>
			</div>
			{#if erVigsel}
			<div class="m-minst-bred">
				<p class="m-deler-adm-tittel">Skriftlesningenes kilde</p>
				<select class="m-bibel-velg" onchange={(e) => { mal.skriftlesningKilde = e.currentTarget.value || null; markDirty(); }} title="Hoveddelen brudeparet velger skriftlesninger fra («Velg tekster …»)">
					<option value="">— automatisk (tittel inneholder «skriftlesning») —</option>
					{#each mal?.sections ?? [] as sec (sec.title)}
						<option value={sec.title} selected={mal.skriftlesningKilde === sec.title}>{sec.title}</option>
					{/each}
				</select>
			</div>
			{/if}
		</div>
		</div>

		{#if visMalFelt}
		<div class="minst-gruppe">
			<p class="minst-tittel">Oversettelser</p>
			<p class="muted m-velg-hint">Andre maler som er samme liturgi på andre målformer. Ved opprettelse vises da gruppens målformer sammen, og valgt målform bruker riktig mal.</p>
			<table class="m-overs-tabell">
				<thead>
					<tr><th>Mal</th><th>Målform</th><th></th></tr>
				</thead>
					<tbody>
						<tr class="m-overs-last">
							<td>{mal.name} <span class="m-overs-last-tekst">(denne malen)</span></td>
							<td><span class="m-overs-form">{målformLabel(malFormFor(mal))}</span></td>
							<td class="m-overs-fjern"><span class="m-overs-laas" title="Denne malen er med i gruppen og kan ikke fjernes">{@html mdi('lock', 13)}</span></td>
						</tr>
						{#each tilkoblede as t (t.id)}
							<tr>
								<td>{t.name}</td>
								<td><span class="m-overs-form">{målformLabel(malFormFor(t))}</span></td>
								<td class="m-overs-fjern">
									<button type="button" class="ikon-knapp" title="Fjern koblingen"
										onclick={() => fjernOversettelse(t.id)}>{@html mdi('close', 14)}</button>
								</td>
							</tr>
						{/each}
				</tbody>
			</table>
			<div class="m-overs-koble">
				{#if kobleApen}
					<div class="m-overs-meny" role="menu">
						{#if koblebare.length === 0}
							<p class="muted m-overs-meny-tom">Ingen andre maler av denne typen å koble til.</p>
						{:else}
							{#each koblebare as t (t.id)}
								<button type="button" class="m-overs-meny-rad" role="menuitem" onclick={() => kobleOversettelse(t.id)}>
									<span class="m-overs-meny-navn">{t.name}</span>
									<span class="m-overs-form">{målformLabel(malFormFor(t))}</span>
								</button>
							{/each}
						{/if}
					</div>
				{/if}
				<button type="button" class="m-overs-knapp" onclick={() => (kobleApen = !kobleApen)}>
					{@html mdi('plus', 14)} Koble oversettelse {@html mdi('chevron-down', 13)}
				</button>
			</div>
		</div>
		{/if}
		{/if}

	{/if}
	{#if visMalFelt && fane === 'bibeltekster'}
		<div class="m-bibeltekster">
			<p class="muted m-velg-hint">Koble lesningene til ledd som skal hente bibeltekst dynamisk fra kirkeåret ved opprettelse av gudstjeneste. Innledning og avslutning i leddet røres ikke — teksten havner i hoveddelen. Ledd uten kobling fylles som før (via leddtittel).</p>
			<div class="m-bibel-tabell">
				<div class="m-bibel-head"><span>Lesning</span><span>Ledd som henter teksten</span></div>
				{#each BIBEL_LESNINGER as lesning (lesning.key)}
					<div class="m-bibel-rad">
						<span class="m-bibel-navn">{lesning.tittel}</span>
						<span>
							<select class="m-bibel-velg"
								onchange={(e) => velgLedd(lesning.key, e.currentTarget.value)}
								title="Velg leddet som skal fylles med dagens lesning">
								<option value="">— ingen kobling —</option>
								{#each bibelGrupper as gruppe (gruppe.tittel)}
									<optgroup label={gruppe.tittel}>
										{#each gruppe.ledd as ledd (ledd.id)}
											<option value={ledd.id} selected={koblingFor(lesning.key)?.leddId === ledd.id}>{ledd.visning}</option>
										{/each}
									</optgroup>
								{/each}
							</select>
						</span>
					</div>
				{/each}
			</div>
			{#if bibelGrupper.length === 0}
				<p class="muted m-velg-hint">Malen har ingen ledd å koble til.</p>
			{/if}
		</div>
	{/if}
	{#if visMalFelt && fane === 'informasjon'}
		<div class="hd-info">
			<div class="hd-info-rad"><span class="hd-info-nokkel">Navn</span><span class="hd-info-verdi">{mal.name}</span></div>
			<div class="hd-info-rad"><span class="hd-info-nokkel">Målform</span><span class="hd-info-verdi">{målformLabel(malFormFor(mal))}</span></div>
			<div class="hd-info-rad"><span class="hd-info-nokkel">Kilde</span><span class="hd-info-verdi">{mal.__devMal ? 'Original i prosjektet (dev)' : mal.filePath ? 'Lokal mal-fil' : 'Innebygd'}</span></div>
			{#if mal.filePath}<div class="hd-info-rad"><span class="hd-info-nokkel">Filsti</span><span class="hd-info-verdi"><code>{mal.filePath}</code></span></div>{/if}
			{#if mal.description}<div class="hd-info-rad"><span class="hd-info-nokkel">Beskrivelse</span><span class="hd-info-verdi">{mal.description}</span></div>{/if}
			<div class="hd-info-rad"><span class="hd-info-nokkel">Omfang</span><span class="hd-info-verdi">{mal.sections?.length ?? 0} hoveddeler, {(mal.sections ?? []).reduce((n, s2) => n + (s2.items?.length ?? 0), 0)} ledd</span></div>
			<div class="hd-info-rad"><span class="hd-info-nokkel">Bruk</span><span class="hd-info-verdi">{kanBrukes(mal) ? 'Kan brukes til gudstjenester' : 'Ikke i gudstjeneste-valg'}</span></div>
		</div>
	{/if}
</div>
