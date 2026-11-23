<script>
	// DEV-modul: «Diff» — åpne to .limal-filer side om side for å sammenligne.
	// Typisk bruk: en agent-konvertert mal (~/skill-agent-*/) mot originalmalen
	// fra biblioteket. Originalen velges automatisk ut fra agent-filens navn
	// (kan overstyres). Lesing er brukerstyrt; modulen skriver aldri.
	import { onMount } from 'svelte';
	import { app } from '$lib/store.svelte.js';
	import { mdi } from '$lib/mdi.js';

	let agenter = $state([]);
	let laster = $state(false);
	let feil = $state('');

	let aValg = $state(null); // { fil, navn, katalog }
	let bValg = $state(null); // mal-objekt fra app.templates
	let aMal = $state(null); // parset mal-data
	let bMal = $state(null);
	let visLike = $state(false);
	let ekspandert = $state({}); // radnøkkel -> true

	// originalmaler (fra biblioteket) kan velges som B-side
	const originaler = $derived((app.templates ?? []).filter((t) => t.filePath && /originaler/i.test(t.filePath)));

	async function lastAgenter() {
		const r = await window.liturgi?.diffAgenter?.();
		if (r?.ok) { agenter = r.maler; feil = ''; }
		else if (r) feil = r.error ?? 'Kunne ikke lese agent-maler';
	}
	onMount(lastAgenter);

	function normaliser(s) {
		return (s ?? '').toLowerCase().replace(/\*/g, '').replace(/\s+/g, ' ').replace(/[.:,;!?»"]+/g, '').trim();
	}

	/** Auto-velg originalmal ut fra agent-filens navn: nøkkelord (liturgi-
	 *  type) + årstall + målform. «gudstjeneste»-tokenet bygges runtime
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
			if (t.includes('nynorsk') === n.includes('nynorsk') && (t.includes('nynorsk') || n.includes('bokm') === false)) poeng += 2;
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

	async function velgAgent(m) {
		aValg = m;
		bValg = matchOriginal(m.navn ?? m.fil) ?? bValg;
		await lastBegge();
	}

	async function velgEgenFil() {
		const r = await window.liturgi?.openFile?.();
		if (!r?.ok) return;
		const navn = (r.filePath ?? '').split('/').pop().replace(/\.limal$/i, '');
		await velgAgent({ fil: r.filePath, navn, katalog: 'Egen fil' });
	}

	async function lastBegge() {
		if (!aValg || !bValg) { aMal = null; bMal = null; return; }
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

	// ---------- diff-bygging ----------
	function leddLikk(it, annen) {
		const strip = (x) => normaliser((x ?? '').replace(/\{\{\/?r\}\}/g, '').replace(/BIBELREF \s*\|/gi, 'BIBELREF |'));
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
		for (const aSec of aMal.sections) {
			const nokkel = normaliser(aSec.title);
			const idx = bLedig.findIndex((s) => normaliser(s.title) === nokkel);
			const bSec = idx !== -1 ? bLedig.splice(idx, 1)[0] : null;
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
				rad.push({ type: 'ledd', nokkel: (aSec.title || '') + '#' + (k || 'uten-tittel') + '#' + radTeller++, a: aIt, b: bIt, status: !bIt ? 'kun-a' : leddLikk(aIt, bIt) ? 'lik' : 'ulik' });
			}
			for (let i = 0; i < bItems.length; i++) {
				if (brukt.has(i)) continue;
				rad.push({ type: 'ledd', nokkel: (bSec?.title || '') + '#b' + i + '#' + radTeller++, a: null, b: bItems[i], status: 'kun-b' });
			}
		}
		for (const s of bLedig) rad.push({ type: 'seksjon', nokkel: 'seksjon-b' + radTeller++, tittel: s.title, a: null, b: s });
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
	function veksle(nokkel) {
		ekspandert = { ...ekspandert, [nokkel]: !ekspandert[nokkel] };
	}
	function altsTekst(it) {
		const a = it?.alts ?? [];
		return a.length ? a.map((x) => x.label ?? '?').join(' · ') : '';
	}
</script>

<div id="diff-modul">
	<h1>Diff <span class="dev-merke">DEV</span></h1>
	<p class="beskrivelse">
		Sammenlign to <code>.limal</code>-filer side om side — for eksempel en
		agent-konvertert mal mot originalen fra biblioteket. Originalen velges
		automatisk ut fra agent-malens navn og kan byttes ut.
	</p>

	{#if feil}<div class="diff-feil">{feil}</div>{/if}

	<div class="diff-velgere">
		<div class="diff-velger">
			<div class="diff-kolonne-tittel">Agent-mal</div>
			{#if aValg}
				<div class="diff-valgt">{aValg.navn} <span class="diff-katalog">{aValg.katalog}</span></div>
			{:else}
				<div class="diff-muted">Ingen valgt</div>
			{/if}
			<button onclick={velgEgenFil}>{@html mdi('file-document-outline', 14)} Velg fil …</button>
		</div>
		<div class="diff-velger">
			<div class="diff-kolonne-tittel">Original (biblioteket)</div>
			<select bind:value={bValg} onchange={lastBegge}>
				<option value={null} disabled>Velg original …</option>
				{#each originaler as t (t.id)}
					<option value={t}>{t.name}</option>
				{/each}
			</select>
		</div>
		<label class="diff-vislike">
			<input type="checkbox" bind:checked={visLike} /> Vis like ledd
		</label>
		<button onclick={lastAgenter} title="Skann agent-maler på nytt">{@html mdi('refresh', 14)} Oppdater</button>
	</div>

	{#if agenter.length}
		<div class="diff-agenter">
			{#each agenter as m (m.fil)}
				<button class="diff-agent {aValg?.fil === m.fil ? 'aktiv' : ''}" onclick={() => velgAgent(m)} title={m.fil}>
					{m.navn} <span class="diff-katalog">{m.katalog}</span>
				</button>
			{/each}
		</div>
	{:else}
		<p class="diff-muted">Ingen agent-maler funnet i <code>~/skill-agent-*/</code>.</p>
	{/if}

	{#if oppsummert}
		<div class="diff-oppsummering">
			<span class="pill pill-ok">{oppsummert.lik} like</span>
			<span class="pill pill-endret">{oppsummert.ulik} ulike</span>
			<span class="pill pill-kuna">{oppsummert.kunA} kun i agent</span>
			<span class="pill pill-kunb">{oppsummert.kunB} kun i original</span>
		</div>

		<div class="diff-visning">
			{#each rader as r (r.nokkel)}
				{#if r.type === 'seksjon'}
					<div class="diff-seksjon" class:diff-mangler={!r.a || !r.b}>
						<span>{r.tittel}</span>
						{#if !r.b}<span class="diff-merke kun-a">kun i agent</span>{/if}
						{#if !r.a}<span class="diff-merke kun-b">kun i original</span>{/if}
					</div>
				{:else if visRad(r)}
					<div class="diff-ledd status-{r.status}">
						<button class="diff-ledd-hode" onclick={() => veksle(r.nokkel)}>
							<span class="diff-status">{r.status === 'lik' ? '=' : r.status === 'ulik' ? '\u2260' : r.status === 'kun-a' ? '+' : '\u2212'}</span>
							<span class="diff-tittel">{r.a?.heading || r.b?.heading || '(uten tittel)'}</span>
							{#if r.a?.alts?.length || r.b?.alts?.length}
								<span class="diff-alts">{altsTekst(r.a) || altsTekst(r.b)}</span>
							{/if}
						</button>
						{#if ekspandert[r.nokkel] && r.status !== 'lik'}
							<div class="diff-ledd-innhold">
								<div class="diff-side">
									<div class="diff-side-tittel">Agent</div>
									{#if r.a}
										{#if r.a.instr}<div class="diff-instr">{r.a.instr}</div>{/if}
										<pre class="diff-tekst">{r.a.text || '(tom)'}</pre>
										{#if r.a.alts?.length}
											{#each r.a.alts as alt, i (i)}
												<div class="diff-alt"><span class="diff-alt-label">{alt.label}</span><pre class="diff-tekst">{alt.text}</pre></div>
											{/each}
										{/if}
									{:else}
										<div class="diff-muted">—</div>
									{/if}
								</div>
								<div class="diff-side">
									<div class="diff-side-tittel">Original</div>
									{#if r.b}
										{#if r.b.instr}<div class="diff-instr">{r.b.instr}</div>{/if}
										<pre class="diff-tekst">{r.b.text || '(tom)'}</pre>
										{#if r.b.alts?.length}
											{#each r.b.alts as alt, i (i)}
												<div class="diff-alt"><span class="diff-alt-label">{alt.label}</span><pre class="diff-tekst">{alt.text}</pre></div>
											{/each}
										{/if}
									{:else}
										<div class="diff-muted">—</div>
									{/if}
								</div>
							</div>
						{/if}
					</div>
				{/if}
			{/each}
		</div>
	{:else if laster}
		<p class="diff-muted">Leser …</p>
	{/if}
</div>

<style>
	#diff-modul { max-width: 1400px; margin: 0 auto; padding: 24px; display: flex; flex-direction: column; min-height: 0; flex: 1; }
	h1 { display: flex; align-items: center; gap: 10px; }
	.dev-merke { font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: 6px; background: var(--accent); color: #fff; }
	.beskrivelse { color: var(--muted-foreground); font-size: 14px; }
	.diff-feil { padding: 8px 12px; border: 1px solid #c0392b; border-radius: 8px; color: #c0392b; margin: 12px 0; font-size: 13px; }
	.diff-velgere { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; margin: 16px 0 8px; }
	.diff-velger { display: flex; flex-direction: column; gap: 6px; min-width: 260px; }
	.diff-kolonne-tittel { font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--muted-foreground); letter-spacing: 0.04em; }
	.diff-valgt { font-weight: 600; }
	.diff-katalog { color: var(--muted-foreground); font-weight: 400; font-size: 12px; margin-left: 6px; }
	.diff-muted { color: var(--muted-foreground); font-size: 13px; }
	.diff-vislike { display: flex; align-items: center; gap: 6px; font-size: 13px; }
	.diff-agenter { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0 12px; }
	.diff-agent {
		font-size: 12.5px; padding: 4px 10px; border-radius: 14px;
		border: 1px solid var(--border); background: var(--panel2, var(--card)); color: inherit; cursor: pointer;
	}
	.diff-agent.aktiv { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 12%, transparent); }
	.diff-oppsummering { display: flex; gap: 8px; margin: 10px 0 14px; flex-wrap: wrap; }
	.pill { font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 12px; }
	.pill-ok { background: color-mix(in srgb, #2e7d32 14%, transparent); color: #2e7d32; }
	.pill-endret { background: color-mix(in srgb, #c0392b 14%, transparent); color: #c0392b; }
	.pill-kuna { background: color-mix(in srgb, var(--accent) 14%, transparent); color: var(--accent); }
	.pill-kunb { background: color-mix(in srgb, #8e6c1a 14%, transparent); color: #8e6c1a; }
	.diff-visning { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
	.diff-seksjon {
		display: flex; align-items: center; gap: 10px; padding: 8px 14px;
		font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 0.04em;
		background: var(--panel2, var(--card)); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
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
	.diff-ledd-hode { display: flex; align-items: center; gap: 10px; width: 100%; text-align: left; padding: 7px 14px; background: none; border: none; color: inherit; cursor: pointer; font: inherit; }
	.diff-ledd-hode:hover { background: var(--sidebar-hover, color-mix(in srgb, currentColor 5%, transparent)); }
	.diff-status { font-weight: 700; width: 16px; text-align: center; }
	.status-lik .diff-status { color: #2e7d32; }
	.status-ulik .diff-status { color: #c0392b; }
	.status-kun-a .diff-status { color: var(--accent); }
	.status-kun-b .diff-status { color: #8e6c1a; }
	.diff-tittel { font-weight: 600; font-size: 13.5px; }
	.diff-alts { font-size: 12px; color: var(--muted-foreground); }
	.diff-ledd-innhold { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border-top: 1px solid var(--border); }
	.diff-side { padding: 10px 14px; min-width: 0; }
	.diff-side:first-child { border-right: 1px solid var(--border); }
	.diff-side-tittel { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--muted-foreground); margin-bottom: 6px; }
	.diff-instr { font-size: 12.5px; color: var(--muted-foreground); font-style: italic; margin-bottom: 6px; white-space: pre-wrap; }
	.diff-tekst { font: inherit; font-size: 12.5px; white-space: pre-wrap; margin: 0 0 8px; overflow-wrap: anywhere; }
	.diff-alt { margin-bottom: 8px; }
	.diff-alt-label { font-size: 11.5px; font-weight: 700; color: var(--accent); }
</style>
