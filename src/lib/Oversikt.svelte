<script>
	/** «Oversikt» — undermodul i gudstjenestemodulen: hierarkisk liste over
	 *  hoveddeler med leddene som under-rader, med drag-and-drop på begge
	 *  nivåer (omorganisering uten å forlate oversikten). Ingen
	 *  alternativ-/variasjonskolonner — den detaljen ligger i «Deler …». */
	import { app, markDirty, persist, uid, synkLenkedeSeksjoner } from '$lib/store.svelte.js';
	import { instantiate } from '$lib/store.svelte.js';
	import { hentDelerModal, confirmBox } from '$lib/modal.svelte.js';
	import { mdi } from '$lib/mdi.js';

	let visLed = $state(true);

	/* ---- Valgfrie ledd (fra malen) — legg til / fjern i denne gudstjenesten ---- */
	const tpl = $derived(app.templates.find((t) => t.id === app.current?.templateId));
	const valgLeddListe = $derived(
		(tpl?.sections ?? []).flatMap((sec) =>
			(sec.items ?? [])
				.filter((it) => it.optional)
				.map((it) => ({ id: it.id, sec: sec.title, navn: it.heading || 'Ledd uten tittel' }))
		)
	);
	let valgLeddApen = $state(false);
	function leddIDok(id) {
		for (const sec of app.current?.sections ?? []) {
			for (const it of sec.items ?? []) {
				if (it.tplId === id) return it;
			}
		}
		return null;
	}
	function settValgLedd(id, paa) {
		if (paa) {
			if (leddIDok(id)) return;
			for (let si = 0; si < (tpl?.sections ?? []).length; si++) {
				const tsec = tpl.sections[si];
				const idx = (tsec.items ?? []).findIndex((it) => it.id === id);
				if (idx === -1) continue;
				const sec = app.current.sections.find((s2) => s2.title === tsec.title) ?? app.current.sections[si];
				if (!sec) return;
				// sett inn etter siste mal-ledd som kommer foer dette i malen
				let at = 0;
				(sec.items ?? []).forEach((it, i) => {
					const ti = (tsec.items ?? []).findIndex((x) => x.id === it.tplId);
					if (ti !== -1 && ti < idx) at = i + 1;
				});
				sec.items.splice(at, 0, instantiate(tsec.items[idx]));
				break;
			}
		} else {
			for (const sec of app.current?.sections ?? []) {
				sec.items = (sec.items ?? []).filter((it) => it.tplId !== id);
			}
		}
		markDirty();
		persist?.();
	}
	function dokumentLukk(e) {
		if (valgLeddApen && !e.target.closest?.('.ovr-valgledd')) valgLeddApen = false;
	}
	let valgLeddRot = $state(null);
	function valgLedeTeller() {
		return valgLeddListe.filter((vl) => leddIDok(vl.id)).length;
	}

	// lenkede hoveddeler fornyes fra malene hver gang Oversikten besøkes
	$effect(() => {
		if (app.visning === 'oversikt' && app.kind === 'service') {
			synkLenkedeSeksjoner(app.current);
		}
	});
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

	/** Lemma-etikett (badge): typen til leddet på norsk. */
const TYPE_ETIKETT = { salme: 'Salme', tekst: 'Tekst', bibel: 'Bibel', instr: 'Instruksjon', notat: 'Notat' };
const typeEtikett = (it) => TYPE_ETIKETT[it?.type] ?? 'Tekst';

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

	/** Slett en hoveddel fra oversikten (bekreftelse når den har ledd). */
	function slettSeksjon(si) {
		const sec = app.current.sections[si];
		if (!sec) return;
		const ant = sec.items?.length ?? 0;
		const utfor = () => {
			app.current.sections.splice(si, 1);
			markDirty();
		};
		if (ant) {
			confirmBox('Slette hoveddelen?', `\u00ab${sec.title}\u00bb har ${ant} ledd og slettes med alt innholdet. Vil du slette den?`, utfor);
		} else utfor();
	}

	/** Innsettingspunkt: index i sections ut fra 'til' ('sist' eller tittel). */
	function innsettingsIdx(til) {
		const secs = app.current.sections;
		if (!til) return secs.length;
		const i = secs.findIndex((s) => s.title === til);
		return i === -1 ? secs.length : i + 1;
	}

	/** Lag et ledd-objekt fra en bibliotekgruppe (samme mapping som
	 *  «Hent ledd fra biblioteket» i Item.svelte). */
	function leddFraBib(gruppe) {
		const alts = gruppe.rader.map((r) => ({ label: r.alt_label || r.label || 'Variant', text: r.tekst ?? r.text ?? '' }));
		const nytt = {
			id: uid(), type: 'tekst', heading: gruppe.ledd,
			text: alts.length === 1 ? alts[0].text : '',
			instr: '', enabled: true, optional: false, salmeNr: '', salmeTittel: '',
			alts: alts.length > 1 ? alts : [],
			selAlt: alts.length > 1 ? 0 : null
		};
		const intro = gruppe.rader[0]?.intro_tekst;
		const avsl = gruppe.rader[0]?.avsl_tekst;
		if (intro) { nytt.introAlts = [{ label: 'Innledning', text: intro }]; nytt.selIntro = 0; }
		if (avsl) { nytt.avslutningAlts = [{ label: 'Avslutning', text: avsl }]; nytt.selAvsl = 0; }
		return nytt;
	}

	/** Hent-modalens ok-behandler: legger inn hoveddel/ledd i dokumentet. */
	function hentOk(p) {
		const o = app.current;
		if (!o) return;
		if (p.type === 'ledd') {
			let item = null;
			if (p.kilde === 'bibliotek') item = leddFraBib(p.gruppe);
			else {
				const mal = app.templates.find((t) => t.id === p.malId);
				const kilde = mal?.sections?.find((s) => s.title === p.tittel);
				const it = kilde?.items?.[p.leddIdx];
				item = it ? JSON.parse(JSON.stringify(it)) : null;
			}
			if (!item) return;
			const sec = o.sections.find((s) => s.title === p.til) ?? o.sections[0];
			if (!sec) { app.visning = 'editor'; markDirty(); return; }
			sec.items.push(item);
		} else {
			const mal = app.templates.find((t) => t.id === p.malId);
			const kilde = mal?.sections?.find((s) => s.title === p.tittel);
			if (!kilde) return;
			const ny = {
				title: kilde.title,
				delGruppe: kilde.delGruppe,
				alternativer: kilde.alternativer ? [...kilde.alternativer] : undefined,
				items: JSON.parse(JSON.stringify(kilde.items ?? []))
			};
			if (p.type === 'lenk') ny.__lenket = { malId: p.malId, tittel: p.tittel };
			const at = innsettingsIdx(p.til);
			o.sections.splice(at, 0, ny);
		}
		markDirty();
		persist?.();
	}

	function åpneHentModal() {
		hentDelerModal(hentOk);
	}

	/** klikk på en rad → til redigering, rull til hoveddelen */
	function tilRedigering(si) {
		app.visning = 'editor';
		setTimeout(() => {
			document.getElementById('sec-' + si)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}, 120);
	}

</script>

<svelte:document onclick={dokumentLukk} />

<div id="oversikt-side">
	<div class="ovr-verktoy">
		<button class="ovr-vis-led" onclick={() => { visLed = !visLed; }} title={visLed ? 'Skjul leddene' : 'Vis leddene'}>
			{@html mdi(visLed ? 'chevron-up' : 'chevron-down', 14)}
			<span>{visLed ? 'Skjul ledd' : 'Vis ledd'}</span>
		</button>
		<span class="muted ovr-hint">Dra hoveddelene og leddene for å endre rekkefølgen. Klikk på en rad for å redigere.</span>
		{#if valgLeddListe.length}
		<div class="ovr-valgledd" bind:this={valgLeddRot}>
			<button class="ovr-vis-led" class:aktiv={valgLeddApen} onclick={() => (valgLeddApen = !valgLeddApen)} title="Valgfrie ledd fra malen — legg til eller fjern fra gudstjenesten">
				{@html mdi('format-list-checks', 14)}
				<span>Valgfrie ledd{valgLedeTeller() ? ' (' + valgLedeTeller() + ')' : ''}</span>
				{@html mdi('chevron-down', 12)}
			</button>
			{#if valgLeddApen}
				<div class="ovr-valgledd-meny" role="menu">
					{#each valgLeddListe as vl (vl.id)}
						<label class="ovr-valgledd-rad">
							<input type="checkbox" checked={!!leddIDok(vl.id)} onchange={(e) => settValgLedd(vl.id, e.currentTarget.checked)} />
							<span>{vl.sec} · {vl.navn}</span>
						</label>
					{/each}
				</div>
			{/if}
		</div>
		{/if}
		<button class="ovr-vis-led" onclick={åpneHentModal} title="Hent hoveddeler og ledd fra biblioteket eller en mal">{@html mdi('download', 14)}<span>Hent …</span></button>
	</div>

	{#if app.current?.sections?.length}
		<div class="ovr-liste">
			{#if visLed}<div class="ovr-tabell-hode" aria-hidden="true"><span></span><span>Ledd</span><span>Type</span><span></span><span></span></div>{/if}

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
						{#if sec.__lenket}<span class="ovr-lenket" title="Koblet til malen — innholdet fornyes ved åpning">{@html mdi('link-variant', 11)} lenket</span>{/if}
						<span class="ovr-antall">{sec.items?.length ?? 0} ledd</span>
						<button class="ovr-slett" title="Slett hoveddelen" onclick={() => slettSeksjon(si)}>{@html mdi('delete-outline', 14)}</button>
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
									<span class="ovr-type-badge">{typeEtikett(it)}</span>
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
