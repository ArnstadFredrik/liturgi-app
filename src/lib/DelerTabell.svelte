<script>
	/** DelerTabell — DELT komponent for alternativ-/variasjons-modulen:
	 *  brukes både som undermodul-side (Alternativer) og som innhold i
	 *  «Deler …»-modalen. Samme komponent = samme uttrykk begge steder. */
	import { app, markDirty, secAlternativer } from '$lib/store.svelte.js';

	let { mal, visMalFelt = false } = $props();
	import { mdi } from '$lib/mdi.js';
	import { malType, malFormFor, målformLabel, kanBrukes } from '$lib/maltyper.js';
	import { confirmBox, maalformModal } from '$lib/modal.svelte.js';

	let fane = $state('hoveddeler');
	let apenCelle = $state(null);
	let katNyAlt = $state('');
	let katNyVar = $state('');
	let dragSi = $state(null);
	let dragOverSi = $state(null);
	let dragFor = $state(false);

	const alternativer = $derived(mal?.alternativer ?? []);
	const variasjoner = $derived(mal?.delGrupper ?? []);

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
	<p class="muted m-velg-hint">Merk hver hoveddel med alternativer (flervalg — delen tas kun med når alle merkede er på ved oppretting) og variasjon (enten/eller — bare den valgte tas med). Katalogene gjelder for malen og styrer valgene i «Opprett»-dialogen.</p>
	{#if apenCelle}<div class="m-deler-overlay" onclick={() => { apenCelle = null; }}></div>{/if}
	<div class="fb-visning-velger m-deler-faner" role="tablist">
		<button role="tab" aria-selected={fane === 'hoveddeler'} class:sel={fane === 'hoveddeler'} onclick={() => { fane = 'hoveddeler'; apenCelle = null; }}>Hoveddeler</button>
		<button role="tab" aria-selected={fane === 'innstillinger'} class:sel={fane === 'innstillinger'} onclick={() => { fane = 'innstillinger'; apenCelle = null; }}>Innstillinger</button>
		{#if visMalFelt}<button role="tab" aria-selected={fane === 'informasjon'} class:sel={fane === 'informasjon'} onclick={() => { fane = 'informasjon'; apenCelle = null; }}>Informasjon</button>{/if}
	</div>

	{#if fane === 'hoveddeler'}
		<div class="m-deler-tabell">
			<div class="m-deler-rad m-deler-head"><span></span><span>Hoveddel</span><span>Alternativ</span><span>Variasjon</span></div>
			{#each mal?.sections ?? [] as sec, si (si)}
				<div class="m-deler-rad" class:drag-target={dragOverSi === si && dragFor} class:drag-target-etter={dragOverSi === si && !dragFor} class:deler-dragging={dragSi === si}
					ondragover={(e) => dragOverRad(e, si)} ondrop={(e) => droppRad(e, si)} ondragend={() => { dragSi = null; dragOverSi = null; }}>
					<span class="m-deler-drag" class:aktiv={dragSi !== null} draggable="true"
						ondragstart={(e) => startDragRad(e, si)} title="Dra for å endre rekkefølge">{@html mdi('drag-vertical', 14)}</span>
					<span class="m-deler-navn">{sec.title}</span>
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
							<span>{sec.delGruppe ? sec.delGruppe[0].toUpperCase() + sec.delGruppe.slice(1) : 'Standard'}</span>
						</button>
						{#if apenCelle?.si === si && apenCelle?.kol === 'variasjon'}
							<div class="m-deler-meny" class:opp={apenCelle?.opp} role="menu">
								<button type="button" class="m-alt-rad" role="menuitemradio" aria-checked={!sec.delGruppe}
									onclick={() => { sec.delGruppe = undefined; markDirty(); }}>
									<span class="m-alt-ind">{#if !sec.delGruppe}{@html mdi('check', 14)}{/if}</span>
									<span class="m-alt-tekst">Standard</span>
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
				<p class="m-deler-adm-tittel">Bruk</p>
				<button type="button" class="avpaa" role="checkbox" aria-checked={mal.kanGudstjeneste !== false} title="Kan malen brukes til å opprette gudstjenester?" onclick={() => { mal.kanGudstjeneste = mal.kanGudstjeneste === false; markDirty(); }}>
					<span class="avpaa-tekst">Kan brukes til gudstjenester</span>
					<span class="avpaa-bryter" aria-hidden="true"><span class="avpaa-klump"></span></span>
				</button>
			</div>
		</div>
		</div>
		{/if}

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
