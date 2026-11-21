<script>
	/** «Oversikt» — undermodul i gudstjenestemodulen: hierarkisk liste over
	 *  hoveddeler med leddene som under-rader, med drag-and-drop på begge
	 *  nivåer (omorganisering uten å forlate oversikten). Ingen
	 *  alternativ-/variasjonskolonner — den detaljen ligger i «Deler …». */
	import { app, markDirty } from '$lib/store.svelte.js';
	import { mdi } from '$lib/mdi.js';

	let visLed = $state(true);
	let visningForklart = $state(true);

	// drag-tilstand: seksjonsdrag vs. ledddrag
	let dragSeksjon = $state(null);
	let overSeksjon = $state(null);
	let overSeksjonFor = $state(false);
	let dragLed = $state(null); // { sec, idx }
	let overLed = $state(null); // { sec, idx }
	let overLedFor = $state(false);

	function nullstillDrag() {
		dragSeksjon = null; overSeksjon = null; overSeksjonFor = false;
		dragLed = null; overLed = null; overLedFor = false;
	}

	function leddTekst(it) {
		// leddtittelen (heading) først — f.eks. «* 2 Inngangssalme» → «2 Inngangssalme»
		const h = (it?.heading ?? '').replace(/^[*=#\s]+/, '').trim();
		if (h) return h;
		if (it?.type === 'salme') {
			const salme = [it?.nr, it?.salmeTittel].filter(Boolean).join(' · ');
			if (salme) return salme;
		}
		const t = (it?.text ?? '').split('\n').map((s) => s.trim()).filter(Boolean)[0];
		if (t) return t;
		const alt = (it?.alts ?? []).map((a) => (a?.text ?? '').split('\n').map((s) => s.trim()).filter(Boolean)[0]).filter(Boolean)[0];
		return alt ?? '[tomt ledd]';
	}

	/* ---- seksjonsdrag (som i Deler-modalen) ---- */
	function startDragSeksjon(e, si) {
		dragSeksjon = si;
		const rad = e.currentTarget.closest('.ovr-seksjon');
		if (rad && e.dataTransfer.setDragImage) {
			const r = rad.getBoundingClientRect();
			e.dataTransfer.setDragImage(rad, Math.max(20, e.clientX - r.left), 18);
		}
		e.dataTransfer.effectAllowed = 'move';
	}
	function dragOverSeksjon(e, si) {
		if (dragSeksjon === null) return; // ledddrag: håndteres av droppPaaSeksjon
		if (si === dragSeksjon) return;
		e.preventDefault();
		e.dataTransfer.dropEffect = 'move';
		const r = e.currentTarget.getBoundingClientRect();
		overSeksjonFor = e.clientY < r.top + r.height / 2;
		overSeksjon = si;
	}
	function droppSeksjon(e, si) {
		e.preventDefault();
		if (dragSeksjon !== null && si !== dragSeksjon) {
			const secs = app.current.sections;
			let target = overSeksjonFor ? si : si + 1;
			if (dragSeksjon < target) target--;
			const flyttet = secs.splice(dragSeksjon, 1)[0];
			secs.splice(target, 0, flyttet);
			markDirty();
		}
		nullstillDrag();
	}

	/* ---- ledddrag: flytt/omorganiser ledd (også på tvers av hoveddeler) ---- */
	function startDragLed(e, si, ii) {
		dragLed = { sec: si, idx: ii };
		const rad = e.currentTarget.closest('.ovr-led');
		if (rad && e.dataTransfer.setDragImage) {
			const r = rad.getBoundingClientRect();
			e.dataTransfer.setDragImage(rad, Math.max(20, e.clientX - r.left), r.height / 2);
		}
		e.dataTransfer.effectAllowed = 'move';
	}
	function sammeLed(a, b) {
		return a && b && a.sec === b.sec && a.idx === b.idx;
	}
	function dragOverLed(e, si, ii) {
		if (!dragLed) return;
		e.preventDefault();
		e.dataTransfer.dropEffect = 'move';
		if (sammeLed(dragLed, { sec: si, idx: ii })) return;
		const r = e.currentTarget.getBoundingClientRect();
		overLedFor = e.clientY < r.top + r.height / 2;
		overLed = { sec: si, idx: ii };
	}
	function droppLed(e, si, ii) {
		e.preventDefault();
		if (dragLed && !sammeLed(dragLed, { sec: si, idx: ii })) {
			const secs = app.current.sections;
			const src = secs[dragLed.sec].items;
			const flyttet = src.splice(dragLed.idx, 1)[0];
			let target = overLedFor ? ii : ii + 1;
			if (dragLed.sec === si && dragLed.idx < target) target--;
			secs[si].items.splice(target, 0, flyttet);
			markDirty();
		}
		nullstillDrag();
	}
	/** ledd sluppet PÅ en seksjonsrad: legges sist i den hoveddelen */
	function dragOverSeksjonLed(e, si) {
		if (!dragLed) return;
		e.preventDefault();
		e.dataTransfer.dropEffect = 'move';
		overSeksjon = si;
	}
	function droppLedPaaSeksjon(e, si) {
		e.preventDefault();
		if (dragLed) {
			const secs = app.current.sections;
			const src = secs[dragLed.sec].items;
			const flyttet = src.splice(dragLed.idx, 1)[0];
			secs[si].items.push(flyttet);
			markDirty();
		}
		nullstillDrag();
	}

	/** klikk på en rad → til redigering, rull til hoveddelen */
	function tilRedigering(si) {
		app.visning = 'editor';
		setTimeout(() => {
			document.getElementById('sec-' + si)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}, 120);
	}
</script>

<div id="oversikt-side">
	<div class="ovr-verktoy">
		<button class="ovr-vis-led" onclick={() => { visLed = !visLed; }} title={visLed ? 'Skjul leddene' : 'Vis leddene'}>
			{@html mdi(visLed ? 'chevron-up' : 'chevron-down', 14)}
			<span>{visLed ? 'Skjul ledd' : 'Vis ledd'}</span>
		</button>
		<span class="muted ovr-hint">Dra hoveddelene og leddene for å endre rekkefølgen. Klikk på en rad for å redigere.</span>
	</div>

	{#if app.current?.sections?.length}
		<div class="ovr-liste">
			{#each app.current.sections as sec, si (si)}
				<div class="ovr-seksjon" class:deler-dragging={dragSeksjon === si}
					class:drag-target={overSeksjon === si && overSeksjonFor && dragSeksjon !== null}
					class:drag-target-etter={overSeksjon === si && !overSeksjonFor && dragSeksjon !== null}
					ondragover={(e) => { if (dragLed) dragOverSeksjonLed(e, si); else dragOverSeksjon(e, si); }}
					ondrop={(e) => { if (dragLed) droppLedPaaSeksjon(e, si); else droppSeksjon(e, si); }}>
					<div class="ovr-sec-rad">
						<span class="ovr-drag" class:aktiv={dragSeksjon !== null} draggable="true"
							ondragstart={(e) => startDragSeksjon(e, si)} ondragend={nullstillDrag}
							title="Dra for å endre rekkefølge på hoveddelen">{@html mdi('drag-vertical', 14)}</span>
						<span class="ovr-navn" onclick={() => tilRedigering(si)} role="button" tabindex="0"
							onkeydown={(e) => { if (e.key === 'Enter') tilRedigering(si); }}>{sec.title}</span>
						<span class="ovr-antall">{sec.items?.length ?? 0} ledd</span>
					</div>
					{#if visLed && sec.items?.length}
						<div class="ovr-led-liste">
							{#each sec.items as it, ii (ii)}
								<div class="ovr-led" class:borte={it.enabled === false} class:deler-dragging={dragLed && dragLed.sec === si && dragLed.idx === ii}
									class:drag-target={overLed && overLed.sec === si && overLed.idx === ii && overLedFor}
									class:drag-target-etter={overLed && overLed.sec === si && overLed.idx === ii && !overLedFor}
									ondragover={(e) => dragOverLed(e, si, ii)}
									ondrop={(e) => droppLed(e, si, ii)}>
									<span class="ovr-drag" class:aktiv={!!dragLed} draggable="true"
										ondragstart={(e) => startDragLed(e, si, ii)} ondragend={nullstillDrag}
										title="Dra for å flytte leddet">{@html mdi('drag-vertical', 13)}</span>
									<span class="ovr-led-tekst" onclick={() => tilRedigering(si)} role="button" tabindex="0"
										onkeydown={(e) => { if (e.key === 'Enter') tilRedigering(si); }}>{leddTekst(it)}</span>
									{#if it.enabled === false}<span class="ovr-led-ikke" title="Ledd er ikke tatt med">ikke med</span>{/if}
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{:else}
		<p class="muted">Gudstjenesten har ingen hoveddeler ennå.</p>
	{/if}
</div>
