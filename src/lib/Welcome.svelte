<script>
	import { onMount } from 'svelte';
	import { newServiceModal } from '$lib/modal.svelte.js';
	import { createService } from '$lib/store.svelte.js';
	import { lookupKirkeaar, hentTekster } from '$lib/kirkeaar.js';
	import { litHtml } from '$lib/lit.js';

	let dato = '';
	let kk = null;
	let tekster = null;
	let laster = true;

	const lesninger = [
		{ key: 'L1', tittel: 'Første lesning', evang: false },
		{ key: 'L2', tittel: 'Andre lesning', evang: false },
		{ key: 'E', tittel: 'Evangelium', evang: true }
	];

	function visTekst(ref, tekst, evang) {
		// bare bibelteksten med referanse — ingen liturgisk innledning/avslutning på hjemskjermen
		if (!tekst) return litHtml('*Klarte ikke hente teksten.*');
		const innhold = (tekst.title ? '**' + tekst.title + '**\n' : '') + tekst.text;
		return litHtml(innhold);
	}

	/** Dagens bønn som ren tekst — uten L/M-rollene som brukes i gudstjenestene. */
	function visBønn(prayer) {
		return (prayer || '').split('\n').filter((l) => l.trim())
			.map((l) => '<p>' + litHtml(l.trim()) + '</p>').join('');
	}

	function kommendeSoendag() {
		const d = new Date();
		const dag = d.getDay();
		const diff = (7 - dag) % 7 || 7;
		d.setDate(d.getDate() + diff);
		return d.toISOString().slice(0, 10);
	}

	const CACHE_KEY = 'liturgi-soendag-cache';

	onMount(async () => {
		dato = kommendeSoendag();
		// cachet visning hvis datoen fortsatt er kommende søndag
		try {
			const c = JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null');
			if (c?.dato === dato && c.kk && c.tekster) {
				kk = c.kk;
				tekster = c.tekster;
				laster = false;
			}
		} catch { /* cachet data ugyldig — hent på nytt */ }
		// oppdater i bakgrunnen (kirkeårsoppslag er lokalt, tekster fra bibel.no)
		kk = lookupKirkeaar(dato);
		if (kk?.day) {
			const t = await hentTekster(kk.day);
			if (t) {
				tekster = t;
				try { localStorage.setItem(CACHE_KEY, JSON.stringify({ dato, kk, tekster: t })); } catch { /* full lagring */ }
			}
		}
		laster = false;
	});
</script>

<div id="welcome">
	<h2>Liturgiverktøyet</h2>

	{#if laster}
		<p class="w-muted">Henter kommende søndag …</p>
	{:else if kk}
		<div class="w-sondag">
			<h3>Kommende søndag · {dato}</h3>
			<p class="w-kirkeaar">☀️ <strong>{kk.name}</strong>{kk.color ? ' · ' + kk.color : ''}{kk.series ? ' · ' + kk.series : ''}</p>
			{#if kk.prayer}
				<h4>Dagens bønn</h4>
				<div class="lit-text w-bønn">{@html visBønn(kk.prayer)}</div>
			{/if}
			<h4>Bibeltekster</h4>
			{#each lesninger as L}
				{#if kk[L.key]}
					<details>
						<summary>{L.tittel} · {kk[L.key]}</summary>
						{#if tekster?.[L.key]}
							<div class="lit-text">{@html visTekst(kk[L.key], tekster[L.key], L.evang)}</div>
							{#if kk[L.key]}<p class="w-ref">{kk[L.key]}</p>{/if}
						{:else}
							<p class="w-muted">Klarte ikke hente teksten fra bibel.no.</p>
						{/if}
					</details>
				{/if}
			{/each}
		</div>
	{/if}
</div>
