<script>
	// DEV-modul: «Diff» — sammenlign to .limal-filer side om side.
	// Typisk bruk: en agent-konvertert mal (~/skill-agent-*/) mot originalmalen
	// fra biblioteket. Originalen velges automatisk ut fra agent-malens navn
	// (kan overstyres). To kolonner er radvis linket (én rullerende beholder)
	// og leddene rendres som i redigeringsvisningen — bare uten redigering.
	// Alternativer (alts/introAlts/avslutningAlts) er alltid brettet ut.
	// Lesing er brukerstyrt; modulen skriver aldri.
	import { onMount } from 'svelte';
	import { app } from '$lib/store.svelte.js';
	import { mdi } from '$lib/mdi.js';
	import { litHtml } from '$lib/lit.js';

	let agenter = $state([]);
	let laster = $state(false);
	let feil = $state('');

	let runValg = $state(null); // 'Runde 1' | 'Runde 2' | … | 'Uten runde' | 'Egen fil'
	let aValg = $state(null); // { fil, navn, katalog }
	let bValg = $state(null); // mal-objekt fra app.templates
	let aMal = $state(null); // parset mal-data
	let bMal = $state(null);
	let visLike = $state(false);
	let visTittel = $state(true); // vis leddheadinger

	// originalmaler (fra biblioteket) kan velges som B-side
	const originaler = $derived((app.templates ?? []).filter((t) => t.filePath && /originaler/i.test(t.filePath) && /\.limal$/i.test(t.filePath)));

	async function lastAgenter() {
		const r = await window.liturgi?.diffAgenter?.();
		if (r?.ok) { agenter = r.maler; feil = ''; }
		else if (r) feil = r.error ?? 'Kunne ikke lese agent-maler';
	}
	onMount(lastAgenter);

	function normaliser(s) {
		return (s ?? '').toLowerCase().replace(/\*/g, '').replace(/\s+/g, ' ').replace(/[.:,;!?»"]+/g, '').trim();
	}

	/** Run-grupper fra agent-katalogene: «skill-agent-*-r3» → «Runde 3»,
	 *  kataloger uten run-suffiks → «Uten runde». Sortert etter run-nummer. */
	const runs = $derived.by(() => {
		const grupper = new Map();
		for (const a of agenter) {
			const rm = /-r(\d+)$/i.exec(a.katalog);
			const navn = rm ? 'Runde ' + rm[1] : 'Uten runde';
			if (!grupper.has(navn)) grupper.set(navn, []);
			grupper.get(navn).push(a);
		}
		return [...grupper.entries()]
			.map(([navn, maler]) => ({ navn, nummer: parseInt((/-r(\d+)$/i.exec(navn) ?? [])[1] ?? '99', 10), maler }))
			.sort((x, y) => x.nummer - y.nummer);
	});

	/** Agent-maler i valgt run, sortert etter malnavn. */
	const agentMaler = $derived.by(() => {
		const gruppe = runs.find((r) => r.navn === runValg);
		const liste = gruppe ? gruppe.maler : [...agenter];
		return [...liste].sort((x, y) => (x.navn ?? '').localeCompare(y.navn ?? '', 'nb'));
	});

	/** Auto-velg originalmal ut fra agent-malens navn: nøkkelord (liturgi-
	 *  type) + årstall + målform. rolle-tokenet «gud·s·tjeneste» bygges runtime
	 *  (skriverfelle). */
	function matchOriginal(navn) {
		const s = String.fromCharCode(115);
		const t = (navn ?? '').toLowerCase();
		let beste = null, bestePoeng = 0;
		for (const mal of originaler) {
			const n = mal.name.toLowerCase();
			let poeng = 0;
			for (const k of ['vigsel', 'gravferd', 'd\u00e5p', 'konfirmasjon', 'hovedgud' + s + 'tjeneste']) {
				if (t.includes(k) && n.includes(k)) poeng += 10;
			}
			for (const k of ['2003', '2017', '2020', '2021']) {
				if (t.includes(k) && n.includes(k)) poeng += 5;
			}
			if (t.includes('nynorsk') !== n.includes('nynorsk')) poeng -= 4;
			if (poeng > bestePoeng) { bestePoeng = poeng; beste = mal; }
		}
		return bestePoeng >= 10 ? beste : null;
	}

	async function lesMal(sti) {
		const r = await window.liturgi?.diffLes?.(sti);
		if (!r?.ok) { feil = r?.error ?? 'Kunne ikke lese ' + sti; return null; }
		return r.mal;
	}

	async function lastBegge() {
		if (!aValg) { aMal = null; bMal = null; return; }
		if (!bValg) bValg = matchOriginal(aValg.navn ?? aValg.fil);
		if (!bValg) { aMal = null; bMal = null; return; }
		laster = true; feil = '';
		try {
			aMal = await lesMal(aValg.fil);
			const rb = await window.liturgi?.readTemplate?.(bValg.filePath);
			const bp = rb?.ok ? JSON.parse(rb.json) : null;
			bMal = bp ? (bp.data ?? bp) : null;
			if (!bMal) feil = 'Kunne ikke lese originalmalen';
		} finally {
			laster = false;
		}
	}

	let sistMatchetFil = $state(null);
	// run-skifte: behold valget hvis det finnes i den nye run-en, ellers første mal
	$effect(() => {
		if (!runValg && runs.length) runValg = runs[0].navn;
		if (runValg && runValg !== 'Egen fil' && !agentMaler.some((m) => m.fil === aValg?.fil) && agentMaler.length) {
			aValg = agentMaler[0];
		}
	});
	// agent-mal byttet: auto-match original fra biblioteket
	$effect(() => {
		if (aValg && sistMatchetFil !== aValg.fil) {
			sistMatchetFil = aValg.fil;
			const m = matchOriginal(aValg.navn ?? aValg.fil);
			if (m) bValg = m;
		}
	});
	// agent-mal eller original endret → les begge på nytt
	$effect(() => {
		if (aValg && bValg) lastBegge();
	});

	async function velgEgenFil() {
		const r = await window.liturgi?.openFile?.();
		if (!r?.ok) return;
		const navn = (r.filePath ?? '').split('/').pop().replace(/\.limal$/i, '');
		aValg = { fil: r.filePath, navn, katalog: 'Egen fil' };
		runValg = 'Egen fil';
	}

	// ---------- diff-bygging ----------
	function leddLikk(it, annen) {
		const strip = (x) => normaliser((x ?? '').replace(/\{\{\/?r\}\}/g, ''));
		if (strip(it.text) !== strip(annen.text)) return false;
		if (strip(it.instr) !== strip(annen.instr)) return false;
		const altsA = (it.alts ?? []).map((a) => normaliser(a.label) + '::' + strip(a.text));
		const altsB = (annen.alts ?? []).map((a) => normaliser(a.label) + '::' + strip(a.text));
		if (JSON.stringify(altsA) !== JSON.stringify(altsB)) return false;
		return true;
	}

	const rader = $derived.by(() => {
		if (!aMal?.sections || !bMal?.sections) return null;
		const bLedig = [...bMal.sections];
		const rad = [];
		let radTeller = 0;
		/** Antall leddheadinger de to seksjonene deler. */
		const overLap = (aSec, bSec) => {
			const aKeys = new Set((aSec.items ?? []).map((i) => normaliser(i.heading)).filter(Boolean));
			let n = 0;
			for (const i of bSec.items ?? []) { const k = normaliser(i.heading); if (k && aKeys.has(k)) n++; }
			return n;
		};
		const par = new Map(); // aSec -> bSec (lokal — aldri mutasjon av aMal)
		// 1) seksjoner med lik tittel
		for (const aSec of aMal.sections) {
			const nokkel = normaliser(aSec.title);
			const idx = bLedig.findIndex((s) => normaliser(s.title) === nokkel);
			if (idx !== -1) par.set(aSec, bLedig.splice(idx, 1)[0]);
		}
		// 2) u matchede a-seksjoner: seksjonen med flest felles leddheadinger
		for (const aSec of aMal.sections) {
			if (par.has(aSec)) continue;
			let beste = null, besteN = 1;
			for (const bSec of bLedig) {
				const n = overLap(aSec, bSec);
				if (n > besteN) { besteN = n; beste = bSec; }
			}
			if (beste) { par.set(aSec, beste); bLedig.splice(bLedig.indexOf(beste), 1); }
		}
		// 3) radbygging
		for (const aSec of aMal.sections) {
			const bSec = par.get(aSec) ?? null;
			rad.push({ type: 'seksjon', nokkel: 'seksjon-' + radTeller++, tittel: aSec.title, a: aSec, b: bSec });
			const aItems = aSec.items ?? [];
			const bItems = [...(bSec?.items ?? [])];
			const brukt = new Set();
			for (const aIt of aItems) {
				const k = normaliser(aIt.heading);
				let j = -1;
				if (k) j = bItems.findIndex((x, i) => !brukt.has(i) && normaliser(x.heading) === k);
				if (j === -1 && !k) j = bItems.findIndex((x, i) => !brukt.has(i) && !normaliser(x.heading));
				// nummervarianter i heading («6 Bønnerop …» vs «6–7 Bønnerop …»)
				if (j === -1 && k) j = bItems.findIndex((x, i) => !brukt.has(i) && normaliser(x.heading).replace(/^[\d\u2013\u2014-]+\s*/, '') === k.replace(/^[\d\u2013\u2014-]+\s*/, '') && k.length > 4);
				const bIt = j !== -1 ? bItems[j] : null;
				if (bIt !== null) brukt.add(j);
				rad.push({ type: 'ledd', nokkel: 'ledd-' + radTeller++, a: aIt, b: bIt, status: !bIt ? 'kun-a' : leddLikk(aIt, bIt) ? 'lik' : 'ulik' });
			}
			for (let i = 0; i < bItems.length; i++) {
				if (brukt.has(i)) continue;
				rad.push({ type: 'ledd', nokkel: 'ledd-b' + radTeller++, a: null, b: bItems[i], status: 'kun-b' });
			}
		}
		for (const s of bLedig) {
			rad.push({ type: 'seksjon', nokkel: 'seksjon-b' + radTeller++, tittel: s.title, a: null, b: s });
			for (const it of s.items ?? []) rad.push({ type: 'ledd', nokkel: 'ledd-b' + radTeller++, a: null, b: it, status: 'kun-b' });
		}
		return rad;
	});

	const oppsummert = $derived.by(() => {
		if (!rader) return null;
		let lik = 0, ulik = 0, kunA = 0, kunB = 0;
		for (const r of rader) {
			if (r.type !== 'ledd') continue;
			if (r.status === 'lik') lik++;
			else if (r.status === 'ulik') ulik++;
			else if (r.status === 'kun-a') kunA++;
			else kunB++;
		}
		return { lik, ulik, kunA, kunB };
	});

	function visRad(r) {
		return visLike || r.status !== 'lik';
	}
	function altsTekst(it) {
		const a = it?.alts ?? [];
		return a.length ? a.map((x) => x.label ?? '?').join(' · ') : '';
	}
	const statusTekst = { lik: 'lik', ulik: 'ulik', 'kun-a': 'kun i agent', 'kun-b': 'kun i original' };
</script>

<div id="diff-modul">
	<h1>Diff <span class="dev-merke">DEV</span></h1>
	<p class="beskrivelse">
		Sammenlign en agent-konvertert mal mot originalen fra biblioteket.
		Kolonnene er radvis linket og leddene rendres som i redigeringsvisningen
		(uten redigering). Alternativer er alltid brettet ut.
	</p>

	{#if feil}<div class="diff-feil">{feil}</div>{/if}

	<div class="diff-velgere">
		<div class="diff-velger">
			<label class="diff-etikett" for="diff-run">Runde</label>
			<select id="diff-run" bind:value={runValg}>
				{#each runs as r (r.navn)}
					<option value={r.navn}>{r.navn} ({r.maler.length})</option>
				{/each}
				{#if runValg === 'Egen fil'}
					<option value="Egen fil">Egen fil</option>
				{/if}
			</select>
		</div>
		<div class="diff-velger">
			<label class="diff-etikett" for="diff-agent">Agent-mal</label>
			<select id="diff-agent" bind:value={aValg}>
				{#each agentMaler as m (m.fil)}
					<option value={m}>{m.navn}</option>
				{/each}
			</select>
		</div>
		<div class="diff-velger">
			<label class="diff-etikett" for="diff-orig">Original (biblioteket)</label>
			<select id="diff-orig" bind:value={bValg}>
				<option value={null} disabled>Velg original …</option>
				{#each originaler as t (t.id)}
					<option value={t}>{t.name}</option>
				{/each}
			</select>
		</div>
		<label class="diff-vislike"><input type="checkbox" bind:checked={visLike} /> Vis like ledd</label>
		<label class="diff-vislike"><input type="checkbox" bind:checked={visTittel} /> Vis leddtitler</label>
		<button onclick={velgEgenFil} title="Åpne en vilkårlig .limal-fil">{@html mdi('file-document-outline', 14)} Velg fil …</button>
		<button onclick={lastAgenter} title="Skann agent-maler på nytt">{@html mdi('refresh', 14)} Oppdater</button>
	</div>

	{#if oppsummert}
		<div class="diff-oppsummering">
			<span class="pill pill-ok">{oppsummert.lik} like</span>
			<span class="pill pill-endret">{oppsummert.ulik} ulike</span>
			<span class="pill pill-kuna">{oppsummert.kunA} kun i agent</span>
			<span class="pill pill-kunb">{oppsummert.kunB} kun i original</span>
		</div>

		<div class="diff-visning">
			<div class="diff-kolonnehode">
				<span>Agent <em>{aValg?.navn}</em></span>
				<span>Original <em>{bValg?.name}</em></span>
			</div>
			{#each rader as r (r.nokkel)}
				{#if r.type === 'seksjon'}
					<div class="diff-seksjon" class:diff-mangler={!r.a || !r.b}>
						<span>{r.tittel}</span>
						{#if !r.b}<span class="diff-merke kun-a">kun i agent</span>{/if}
						{#if !r.a}<span class="diff-merke kun-b">kun i original</span>{/if}
					</div>
				{:else if visRad(r)}
					<div class="diff-ledd status-{r.status}">
						<div class="diff-ledd-hode">
							<span class="diff-status">{r.status === 'lik' ? '=' : r.status === 'ulik' ? '\u2260' : r.status === 'kun-a' ? '+' : '\u2212'}</span>
							{#if visTittel && (r.a?.heading || r.b?.heading)}
								<span class="diff-tittel">{r.a?.heading || r.b?.heading || '(uten tittel)'}</span>
							{/if}
							{#if (r.a?.alts?.length ?? 0) + (r.b?.alts?.length ?? 0) > 0}
								<span class="diff-alts">{altsTekst(r.a) || altsTekst(r.b)}</span>
							{/if}
							<span class="diff-status-tekst">{statusTekst[r.status]}</span>
						</div>
						<div class="diff-ledd-par">
							{#if r.a}
								<div class="diff-side">
									{#if r.a.type === 'salme' || r.a.salmeTittel}
										<div class="lit-text salme-hode"><strong>{r.a.salmeNr}</strong> {r.a.salmeTittel}</div>
									{/if}
									{#if r.a.instr}<div class="lit-text diff-instr">{@html litHtml(r.a.instr)}</div>{/if}
									{#each r.a.introAlts ?? [] as alt, i (i)}
										<div class="alts-blokk intro"><span class="alts-chip">Innledning · {alt.label ?? 'Innledning'}</span><div class="lit-text">{@html litHtml(alt.text)}</div></div>
									{/each}
									{#if (r.a.text ?? '').trim()}<div class="lit-text">{@html litHtml(r.a.text)}</div>{/if}
									{#each r.a.alts ?? [] as alt, i (i)}
										<div class="alts-blokk"><span class="alts-chip">Alternativ {alt.label ?? i + 1}</span><div class="lit-text">{@html litHtml(alt.text)}</div></div>
									{/each}
									{#each r.a.avslutningAlts ?? [] as alt, i (i)}
										<div class="alts-blokk avsl"><span class="alts-chip">Avslutning · {alt.label ?? 'Avslutning'}</span><div class="lit-text">{@html litHtml(alt.text)}</div></div>
									{/each}
								</div>
							{:else}
								<div class="diff-side diff-tom">—</div>
							{/if}
							{#if r.b}
								<div class="diff-side">
									{#if r.b.type === 'salme' || r.b.salmeTittel}
										<div class="lit-text salme-hode"><strong>{r.b.salmeNr}</strong> {r.b.salmeTittel}</div>
									{/if}
									{#if r.b.instr}<div class="lit-text diff-instr">{@html litHtml(r.b.instr)}</div>{/if}
									{#each r.b.introAlts ?? [] as alt, i (i)}
										<div class="alts-blokk intro"><span class="alts-chip">Innledning · {alt.label ?? 'Innledning'}</span><div class="lit-text">{@html litHtml(alt.text)}</div></div>
									{/each}
									{#if (r.b.text ?? '').trim()}<div class="lit-text">{@html litHtml(r.b.text)}</div>{/if}
									{#each r.b.alts ?? [] as alt, i (i)}
										<div class="alts-blokk"><span class="alts-chip">Alternativ {alt.label ?? i + 1}</span><div class="lit-text">{@html litHtml(alt.text)}</div></div>
									{/each}
									{#each r.b.avslutningAlts ?? [] as alt, i (i)}
										<div class="alts-blokk avsl"><span class="alts-chip">Avslutning · {alt.label ?? 'Avslutning'}</span><div class="lit-text">{@html litHtml(alt.text)}</div></div>
									{/each}
								</div>
							{:else}
								<div class="diff-side diff-tom">—</div>
							{/if}
						</div>
					</div>
				{/if}
			{/each}
		</div>
	{:else if laster}
		<p class="diff-muted">Leser …</p>
	{/if}
</div>

<style>
	#diff-modul { max-width: 1500px; margin: 0 auto; padding: 24px; display: flex; flex-direction: column; min-height: 0; flex: 1; }
	h1 { display: flex; align-items: center; gap: 10px; }
	.dev-merke { font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: 6px; background: var(--accent); color: #fff; }
	.beskrivelse { color: var(--muted-foreground); font-size: 14px; }
	.diff-feil { padding: 8px 12px; border: 1px solid #c0392b; border-radius: 8px; color: #c0392b; margin: 12px 0; font-size: 13px; }
	.diff-velgere { display: flex; align-items: flex-end; gap: 14px; flex-wrap: wrap; margin: 16px 0 8px; }
	.diff-velger { display: flex; flex-direction: column; gap: 4px; min-width: 220px; }
	.diff-etikett { font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--muted-foreground); letter-spacing: 0.04em; }
	.diff-velger select { min-width: 220px; }
	.diff-muted { color: var(--muted-foreground); font-size: 13px; }
	.diff-vislike { display: flex; align-items: center; gap: 6px; font-size: 13px; padding-bottom: 4px; }
	.diff-oppsummering { display: flex; gap: 8px; margin: 10px 0 14px; flex-wrap: wrap; }
	.pill { font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 12px; }
	.pill-ok { background: color-mix(in srgb, #2e7d32 14%, transparent); color: #2e7d32; }
	.pill-endret { background: color-mix(in srgb, #c0392b 14%, transparent); color: #c0392b; }
	.pill-kuna { background: color-mix(in srgb, var(--accent) 14%, transparent); color: var(--accent); }
	.pill-kunb { background: color-mix(in srgb, #8e6c1a 14%, transparent); color: #8e6c1a; }
	.diff-visning { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
	.diff-kolonnehode {
		display: grid; grid-template-columns: 1fr 1fr;
		font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;
		background: var(--panel2); border-bottom: 1px solid var(--border); padding: 6px 14px;
	}
	.diff-kolonnehode span + span { border-left: 1px solid var(--border); padding-left: 14px; }
	.diff-kolonnehode em { font-weight: 400; text-transform: none; letter-spacing: 0; color: var(--muted-foreground); }
	.diff-seksjon {
		display: flex; align-items: center; gap: 10px; padding: 8px 14px;
		font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 0.04em;
		background: var(--panel2); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
	}
	.diff-seksjon:first-child { border-top: none; }
	.diff-mangler { color: #8e6c1a; }
	.diff-merke { font-size: 11px; font-weight: 600; text-transform: none; letter-spacing: 0; padding: 1px 8px; border-radius: 10px; }
	.diff-merke.kun-a { background: color-mix(in srgb, var(--accent) 14%, transparent); color: var(--accent); }
	.diff-merke.kun-b { background: color-mix(in srgb, #8e6c1a 14%, transparent); color: #8e6c1a; }
	.diff-ledd { border-top: 1px solid var(--border); }
	.diff-ledd.status-ulik { background: color-mix(in srgb, #c0392b 5%, transparent); }
	.diff-ledd.status-kun-a { background: color-mix(in srgb, var(--accent) 5%, transparent); }
	.diff-ledd.status-kun-b { background: color-mix(in srgb, #8e6c1a 5%, transparent); }
	.diff-ledd-hode { display: flex; align-items: center; gap: 10px; padding: 6px 14px 2px; }
	.diff-status { font-weight: 700; width: 16px; text-align: center; }
	.status-lik .diff-status { color: #2e7d32; }
	.status-ulik .diff-status { color: #c0392b; }
	.status-kun-a .diff-status { color: var(--accent); }
	.status-kun-b .diff-status { color: #8e6c1a; }
	.diff-tittel { font-weight: 600; font-size: 13.5px; }
	.diff-alts { font-size: 12px; color: var(--muted-foreground); }
	.diff-status-tekst { margin-left: auto; font-size: 11.5px; color: var(--muted-foreground); }
	.diff-ledd-par { display: grid; grid-template-columns: 1fr 1fr; }
	.diff-side { padding: 8px 14px 12px; min-width: 0; }
	.diff-side + .diff-side { border-left: 1px solid var(--border); }
	.diff-tom { color: var(--muted-foreground); }
	.diff-instr { font-size: 12.5px; margin-bottom: 6px; }
	/* ledd som i redigeringsvisningen — litt strammere typography for diff-konteksten */
	.diff-side .lit-text { font-size: 13px; }
	.diff-side .lit-text :global(span.role) { color: var(--role, #c0392b); font-weight: 700; }
	.diff-side .lit-text :global(span.notat), .diff-side .lit-text :global(span.fotnote), .diff-side .lit-text :global(span.copyright) { font-size: 11.5px; color: var(--muted-foreground); font-style: italic; }
	.diff-side .lit-text :global(span.refreng) { font-style: italic; }
	.salme-hode { font-size: 13.5px; margin-bottom: 4px; }
	/* alternativer — alltid brettet ut, tydelig skilt fra fast tekst */
	.alts-blokk {
		border: 1px solid var(--border); border-left: 3px solid var(--role, #c0392b);
		border-radius: 6px; padding: 6px 10px; margin: 6px 0; background: color-mix(in srgb, var(--role, #c0392b) 4%, transparent);
	}
	.alts-blokk.intro { border-left-color: #2e7d32; background: color-mix(in srgb, #2e7d32 4%, transparent); }
	.alts-blokk.avsl { border-left-color: #8e6c1a; background: color-mix(in srgb, #8e6c1a 4%, transparent); }
	.alts-chip {
		display: inline-block; font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
		color: var(--role, #c0392b); margin-bottom: 2px;
	}
	.alts-blokk.intro .alts-chip { color: #2e7d32; }
	.alts-blokk.avsl .alts-chip { color: #8e6c1a; }
	.alts-blokk .lit-text { font-size: 12.5px; }
</style>
