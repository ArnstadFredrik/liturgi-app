<script>
	import { onMount } from 'svelte';
	import { newServiceModal } from '$lib/modal.svelte.js';
	import { createService, formaterBønn } from '$lib/store.svelte.js';
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
		if (!tekst) return litHtml('ML | ' + ref);
		const intro = evang
			? 'L/ML | Det hellige evangelium står skrevet hos ' + ref + ':'
			: 'ML | Det står skrevet i/hos ' + ref + ':';
		const outro = evang
			? 'L/ML | Slik lyder det hellige evangelium.'
			: 'ML | Slik lyder Herrens ord.';
		const innhold = (tekst.title ? tekst.title + '\n' : '') + tekst.text + '\nFOTNOTE | ' + ref;
		return litHtml(intro + '\n' + innhold + '\n' + outro);
	}

	onMount(async () => {
		// kommende søndag
		const d = new Date();
		const dag = d.getDay();
		const diff = (7 - dag) % 7 || 7;
		d.setDate(d.getDate() + diff);
		dato = d.toISOString().slice(0, 10);
		kk = lookupKirkeaar(dato);
		if (kk?.day) tekster = await hentTekster(kk.day);
		laster = false;
	});
</script>

<div id="welcome">
	<h2>Liturgi</h2>
	<p>
		Lag gudstjenester fra malen «Hovedgudstjenesten» eller din lokale grunnordning,
		velg salmer, bytt ledd og alternativer, og eksporter til PDF, Word eller PowerPoint.
	</p>
	<p><button class="wide" onclick={() => newServiceModal(createService)}>Opprett gudstjeneste</button></p>

	{#if laster}
		<p class="w-muted">Henter kommende søndag …</p>
	{:else if kk}
		<div class="w-sondag">
			<h3>Kommende søndag · {dato}</h3>
			<p class="w-kirkeaar">☀️ <strong>{kk.name}</strong>{kk.color ? ' · ' + kk.color : ''}{kk.series ? ' · ' + kk.series : ''}</p>
			{#if kk.prayer}
				<h4>Dagens bønn</h4>
				<div class="lit-text">{@html litHtml(formaterBønn(kk.prayer))}</div>
			{/if}
			<h4>Bibeltekster</h4>
			{#each lesninger as L}
				{#if kk[L.key]}
					<details>
						<summary>{L.tittel} · {kk[L.key]}</summary>
						{#if tekster?.[L.key]}
							<div class="lit-text">{@html visTekst(kk[L.key], tekster[L.key], L.evang)}</div>
						{:else}
							<p class="w-muted">Klarte ikke hente teksten fra bibel.no.</p>
						{/if}
					</details>
				{/if}
			{/each}
		</div>
	{/if}
</div>
