<script>
	/** «Oversikt» — undermodul i gudstjenestemodulen: samme tabelltype som
	 *  DelerTabell (m-deler-*): rad per hoveddel med chevron og ledd i
	 *  under-rader, drag-and-drop på begge nivåer. Ingen
	 *  alternativ-/variasjonskolonner — den detaljen ligger i «Deler …». */
	import { app, markDirty, persist, uid, synkLenkedeSeksjoner } from '$lib/store.svelte.js';
	import { instantiate } from '$lib/store.svelte.js';
	import { hentDelerModal, confirmBox } from '$lib/modal.svelte.js';
	import { mdi } from '$lib/mdi.js';
	import SlettKnap from '$lib/SlettKnap.svelte';
	import Chevron from '$lib/Chevron.svelte';
	import DraHandel from '$lib/DraHandel.svelte';

	let apenSet = $state(new Set()); // per-hoveddel chevron
	let alleApne = $state(false);
	function erApen(si) { return alleApne || apenSet.has(si); }
	function veksleSek(si) {
		const s = new Set(apenSet);
		if (alleApne) {
			alleApne = false;
			for (let i = 0; i < app.current.sections.length; i++) if (i !== si) s.add(i);
		} else if (s.has(si)) s.delete(si);
		else s.add(si);
		apenSet = s;
	}
	function veksleAlle() {
		alleApne = !alleApne;
		apenSet = new Set();
	}

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
		<button class="ovr-vis-led" onclick={veksleAlle} title="Vis eller skjul leddene i alle hoveddelene">
			{@html mdi(alleApne ? 'chevron-up' : 'chevron-down', 14)}
			<span>{alleApne ? 'Skjul alle' : 'Åpne alle'}</span>
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
		<div class="m-deler-tabell ovr-deler-tabell">
			<div class="m-deler-rad m-deler-head"><span></span><span>Hoveddel</span><span>Ledd</span><span>Type</span><span></span><span></span></div>
			{#each app.current.sections as sec, si (si)}
				<div class="m-deler-rad ovr-sec-rad" class:deler-dragging={dragSeksjon === si}
					class:drag-target={overSeksjon === si && overSeksjonFor && dragSeksjon !== null}
					class:drag-target-etter={overSeksjon === si && !overSeksjonFor && dragSeksjon !== null}
					ondragover={(e) => { if (dragLed) dragOverSeksjonLed(e, si); else dragOverSeksjon(e, si); }}
					ondrop={(e) => { if (dragLed) droppLedPaaSeksjon(e, si); else droppSeksjon(e, si); }}>
					<DraHandel onstart={(e) => startDragSeksjon(e, si)} onend={nullstillDrag} aktiv={dragSeksjon !== null}
						klasse="m-deler-drag ovr-drag" title="Dra for å endre rekkefølge på hoveddelen" />
					<span class="m-deler-navn">
					<Chevron apen={erApen(si)} onclick={() => veksleSek(si)} title={erApen(si) ? 'Skjul leddene' : 'Vis leddene'} />
						<span class="m-deler-navn-tekst ovr-navn" onclick={() => tilRedigering(si)} role="button" tabindex="0"
							onkeydown={(e) => { if (e.key === 'Enter') tilRedigering(si); }}>{sec.title}</span>
						{#if sec.__lenket}<span class="ovr-lenket" title="Koblet til malen — innholdet fornyes ved åpning">{@html mdi('link-variant', 11)} lenket</span>{/if}
					</span>
					<span class="ovr-antall">{sec.items?.length ?? 0} ledd</span>
					<span></span>
					<span></span>
					<span class="m-deler-bryter-celle">
						<SlettKnap klasse="ovr-slett" onclick={() => slettSeksjon(si)} />
					</span>
				</div>
				{#if erApen(si)}
					{#each sec.items ?? [] as it, ii (ii)}
						<div class="m-deler-rad m-deler-ledd ovr-led" class:borte={it.enabled === false}
							class:deler-dragging={dragLed && dragLed.sec === si && dragLed.idx === ii}
							class:drag-target={overLed && overLed.sec === si && overLed.idx === ii && overLedFor}
							class:drag-target-etter={overLed && overLed.sec === si && overLed.idx === ii && !overLedFor}
							ondragover={(e) => dragOverLed(e, si, ii)}
							ondrop={(e) => droppLed(e, si, ii)}>
							<DraHandel onstart={(e) => startDragLed(e, si, ii)} onend={nullstillDrag} aktiv={!!dragLed}
								klasse="m-deler-drag ovr-drag ovr-ledd-drag" storrelse={13} title="Dra for å flytte leddet" />
							<span class="m-deler-navn m-deler-ledd-navn">
								<span class="m-deler-navn-tekst ovr-led-tekst" onclick={() => tilRedigering(si)} role="button" tabindex="0"
									onkeydown={(e) => { if (e.key === 'Enter') tilRedigering(si); }}>{leddTekst(it)}</span>
							</span>
							<span></span>
							<span class="ovr-type-badge">{typeEtikett(it)}</span>
							<span class="m-deler-bryter-celle">
								{#if it.enabled === false}<span class="ovr-led-ikke" title="Ledd er ikke tatt med">ikke med</span>{/if}
							</span>
							<span></span>
						</div>
					{/each}
				{/if}
			{/each}
		</div>
	{:else}
		<p class="muted">Gudstjenesten har ingen hoveddeler ennå.</p>
	{/if}
</div>
