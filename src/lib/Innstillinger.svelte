<script>
	import { onMount } from 'svelte';
	import { regenererBibliotek } from '$lib/fileio.svelte.js';

	const isElectron = typeof window !== 'undefined' && !!window.liturgi?.isElectron;

	let datamappe = '';
	let gudstjenester = '';
	let jobber = false;
	let versjon = '';
	let bygg = '';

	onMount(async () => {
		if (!isElectron) return;
		const list = await window.liturgi.listTemplates();
		if (list.ok) {
			datamappe = list.dirs.originaler.split('/maler/originaler')[0] || list.dirs.originaler;
			gudstjenester = list.dirs.originaler.replace('/maler/originaler', '');
		}
		const info = await window.liturgi.appInfo?.();
		if (info) { versjon = info.versjon; bygg = info.bygg; }
	});

	async function byggPåNytt() {
		jobber = true;
		await regenererBibliotek();
		jobber = false;
	}
</script>

<div id="innstillinger">
	<h2>Innstillinger</h2>
	{#if versjon}
		<p class="inn-versjon">Versjon {versjon}{bygg ? ` · bygg ${bygg}` : ''}</p>
	{/if}

	<div class="inn-gruppe">
		<div class="sidehead">Datamappe</div>
		{#if isElectron}
			<p>
				Appens data ligger i <code>{datamappe || '~/.config/Liturgi'}</code> og overlever appoppdateringer:
			</p>
			<ul>
				<li><code>{datamappe}/maler/originaler/</code> — originalmalene (følger med appen, kan ikke slettes)</li>
				<li><code>{datamappe}/maler/brukermaler/</code> — dine lokale maler (<code>.limal</code>)</li>
				<li><code>{datamappe}/liturgi.db</code> — SQLite: innstillinger, siste gudstjenester og biblioteket (oppslagsregister)</li>
				<li>Gudstjenestene lagres som <code>.liturgi</code>-filer der du velger (standard <code>~/Documents/Liturgi/</code>)</li>
			</ul>
		{:else}
			<p>
				I nettleser-versjonen lagres data i nettleserens localStorage (nøkkel
				<code>liturgi-store-v1</code>). Datamappe, bibliotek og siste-gudstjenester gjelder
				kun Mac-appen.
			</p>
		{/if}
	</div>

	<div class="inn-gruppe">
		<div class="sidehead">Biblioteket</div>
		<p>
			Biblioteket er et oppslagsregister over originalmalene som brukes av
			«Hent innhold» og «Hent ledd». Det bygges automatisk ved oppstart når det
			mangler eller mangler rader — her kan du tvinge det i gang på nytt om noe
			ikke fungerer som det skal.
		</p>
		{#if isElectron}
			<button onclick={byggPåNytt} disabled={jobber}>{jobber ? 'Bygger …' : 'Regenerer biblioteket'}</button>
		{/if}
	</div>
</div>
