<script>
	import { app } from '$lib/store.svelte.js';
	import { closeModal } from '$lib/modal.svelte.js';
	import { litHtml } from '$lib/lit.js';
	import { lookupKirkeaar, hentTekster } from '$lib/kirkeaar.js';

	const m = $derived(app.modal);
	let name = $state('');
	let date = $state('');
	let tplId = $state('');
	let medDåp = $state(true);
	let medNattverd = $state(true);
	let valgte = $state([]);
	let valgtAlt = $state(0);
	let kirkeaar = $state(null);
	let tekster = $state(null);
	let teksterStatus = $state('');

	/** ISO-dato for kommende søndag (i dag hvis det er søndag). */
	function nextSundayISO() {
		const d = new Date();
		d.setDate(d.getDate() + ((7 - d.getDay()) % 7));
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
	}

	$effect(() => {
		if (m?.type === 'newService') {
			name = '';
			date = nextSundayISO();
			tplId = app.templates[0]?.id ?? '';
			medDåp = true;
			medNattverd = true;
		} else if (m?.type === 'prompt') {
			name = m.def ?? '';
		} else if (m?.type === 'choose') {
			valgte = [...m.titles];
		} else if (m?.type === 'chooseOne') {
			valgtAlt = m.sel ?? 0;
		}
	});

	// slå opp kirkeårsdag når datoen endres i ny-gudstjeneste-modalen
	let teksterReq = 0;
	$effect(() => {
		if (m?.type === 'newService' && date) {
			const k = lookupKirkeaar(date);
			kirkeaar = k;
			tekster = null;
			teksterStatus = 'laster';
			const req = ++teksterReq;
			hentTekster(k?.day).then((t) => {
				if (req !== teksterReq) return; // datoen ble endret underveis
				tekster = t;
				teksterStatus = t ? 'ok' : 'feil';
			});
		} else if (m?.type === 'newService') {
			kirkeaar = null;
			tekster = null;
			teksterStatus = '';
		}
	});

	function ok() {
		if (!m) return;
		if (m.type === 'prompt') m.ok(name.trim());
		else if (m.type === 'confirm') m.ok();
		else if (m.type === 'newService') m.ok(name.trim(), date, tplId, { dåp: medDåp, nattverd: medNattverd }, kirkeaar, tekster);
		else if (m.type === 'choose') m.ok([...valgte]);
		else if (m.type === 'chooseOne') m.ok(valgtAlt);
		closeModal();
	}

	function onKey(e) {
		if (e.key === 'Enter') ok();
		if (e.key === 'Escape') closeModal();
	}
</script>

{#if m}
	<div id="modal-back">
		<div id="modal" role="dialog">
			<h3>{m.title}</h3>
			{#if m.type === 'confirm'}
				<p>{m.message}</p>
			{:else if m.type === 'prompt'}
				<label>
					{m.label}
					<input bind:value={name} onkeydown={onKey} />
				</label>
			{:else if m.type === 'newService'}
				<label>
					Mal
					<select bind:value={tplId}>
						{#each app.templates as t (t.id)}
							<option value={t.id}>{t.name}</option>
						{/each}
					</select>
				</label>
				<label>
					Navn
					<input bind:value={name} onkeydown={onKey} placeholder="F.eks. Søndag 15. november" />
				</label>
				<label>
					Dato
					<input type="date" bind:value={date} />
				</label>
				{#if kirkeaar}
					<p class="m-kirkeaar">☀️ {kirkeaar.name}{#if kirkeaar.color}&nbsp;· {kirkeaar.color}{/if}</p>
					{#if teksterStatus === 'laster'}<p class="m-kirkeaar muted">Henter bibeltekster …</p>
					{:else if teksterStatus === 'feil'}<p class="m-kirkeaar muted">Klarte ikke hente bibeltekstene – kun referanser fylles inn.</p>
					{:else if teksterStatus === 'ok'}<p class="m-kirkeaar muted">✓ Bibeltekstene hentes inn i gudstjenesten.</p>
					{/if}
				{:else if date}
					<p class="m-kirkeaar muted">Ingen kirkeårsdag funnet for datoen.</p>
				{/if}
				<div class="m-chk">
					<label class="chk"><input type="checkbox" bind:checked={medDåp} /> Med dåp</label>
					<label class="chk"><input type="checkbox" bind:checked={medNattverd} /> Med nattverd</label>
				</div>
			{:else if m.type === 'choose'}
				<p>Velg deler som skal hentes inn fra malen:</p>
				<div class="m-chk">
					{#each m.titles as t (t)}
						<label class="chk"><input type="checkbox" value={t} bind:group={valgte} /> {t}</label>
					{/each}
				</div>
			{:else if m.type === 'chooseOne'}
				<p>Velg alternativ:</p>
				<div class="m-alts">
					{#each m.options as o, ai (ai)}
						<label class="m-alt" class:sel={valgtAlt === ai}>
							<input type="radio" name="m-alt" value={ai} bind:group={valgtAlt} />
							<span class="m-alt-col">
								<span class="alt-label">{o.label || 'Alternativ ' + String.fromCharCode(97 + ai)}</span>
								<span class="m-alt-text">{@html litHtml(o.text)}</span>
							</span>
						</label>
					{/each}
				</div>
			{/if}
			<div id="modal-actions">
				<button onclick={closeModal}>Avbryt</button>
				<button class="primary" onclick={ok}>
					{m.type === 'confirm' ? 'Slett' : m.type === 'newService' ? 'Opprett' : 'Hent inn'}
				</button>
			</div>
		</div>
	</div>
{/if}
