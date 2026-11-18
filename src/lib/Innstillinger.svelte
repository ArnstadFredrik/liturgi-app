<script>
	import { onMount } from 'svelte';
	import { regenererBibliotek } from '$lib/fileio.svelte.js';
	import { valgModal } from '$lib/modal.svelte.js';
	import { app } from '$lib/store.svelte.js';

	const isElectron = typeof window !== 'undefined' && !!window.liturgi?.isElectron;

	let datamappe = '';
	let jobber = false;
	let innFane = $state('generelt'); // generelt | prekenforberedelse
	let forbAktiv = $state(true); // hele prekenforberedelse-modulen på/av
	let versjon = '';
	let bygg = '';

	onMount(async () => {
		if (!isElectron) return;
		try {
			const fa = await window.liturgi.dbGet('prekenforberedelseAktiv');
			forbAktiv = (fa?.value ?? '1') !== '0';
			app.forbAktiv = forbAktiv;
		} catch { /* db utilgjengelig */ }
		const list = await window.liturgi.listTemplates();
		if (list.ok) {
			datamappe = list.dirs.originaler.split('/maler/originaler')[0] || list.dirs.originaler;
		}
		const info = await window.liturgi.appInfo?.();
		if (info) { versjon = info.versjon; bygg = info.bygg; }
	});

	async function byggPåNytt() {
		jobber = true;
		await regenererBibliotek();
		jobber = false;
	}

	// salmedatabasen (gudstjeneste.no): innlogging lagres kryptert i databasen
	let salmeKonfigurert = false;
	let salmeUser = '';
	let salmePass = '';
	let salmeJobber = false;
	let salmeStatusTekst = '';

	onMount(async () => {
		if (!isElectron || !window.liturgi?.salmeStatus) return;
		const s = await window.liturgi.salmeStatus();
		if (s?.ok) {
			salmeKonfigurert = !!s.konfigurert;
			salmeUser = s.bruker ?? '';
		}
	});

	async function lagreSalmeLogin() {
		if (!salmeUser.trim() || !salmePass) {
			salmeStatusTekst = 'Fyll inn både brukernavn og passord.';
			return;
		}
		salmeJobber = true;
		salmeStatusTekst = '';
		const r = await window.liturgi.salmeLagreLogin(salmeUser.trim(), salmePass);
		salmeJobber = false;
		if (r?.ok) {
			salmeKonfigurert = true;
			salmePass = '';
		} else {
			salmeStatusTekst = 'Klarte ikke lagre: ' + (r?.error ?? 'ukjent feil');
		}
	}

	// prekenforberedelser: mappe (db-nøkkel 'prekenforberedelseMappe') + migrering
	let forbMappe = $state('');
	let forbJobber = $state(false);

	onMount(async () => {
		if (!isElectron) return;
		const r = await window.liturgi.dbGet('prekenforberedelseMappe');
		forbMappe = r?.ok ? (r.value ?? '') : '';
	});

	function settForbAktiv(v) {
		forbAktiv = v;
		app.forbAktiv = v;
		window.liturgi.dbSet('prekenforberedelseAktiv', v ? '1' : '0').catch(() => {});
	}

	async function velgForbMappe() {
		const r = await window.liturgi.forbVelgMappe();
		if (!r?.ok || !r.sti || r.sti === forbMappe) return;
		const gammel = forbMappe;
		forbJobber = true;
		const lagreNy = async () => {
			await window.liturgi.dbSet('prekenforberedelseMappe', r.sti);
			forbMappe = r.sti;
			forbJobber = false;
		};
		if (gammel) {
			// gammel mappe finnes — spør om innholdet skal flyttes til den nye plassen
			valgModal(
				'Flytte innholdet?',
				`Vil du flytte innholdet i «${gammel}» til «${r.sti}»? Den gamle mappen fjernes hvis den blir tom.`,
				'Flytt innholdet',
				'Behold gamle filer',
				async () => {
					try {
						const m = await window.liturgi.forbMigrer(gammel, r.sti);
						if (m?.ok) await lagreNy();
					} finally {
						forbJobber = false; // spinneren skal aldri henge, uansett feil
					}
				},
				async () => {
					try { await lagreNy(); } finally { forbJobber = false; }
				}
			);
		} else {
			try { await lagreNy(); } catch (err) { console.error('Kunne ikke lagre mappevalg:', err); } finally { forbJobber = false; }
		}
	}

	async function salmeLoggUt() {
		salmeJobber = true;
		const r = await window.liturgi.salmeLoggUt();
		salmeJobber = false;
		if (r?.ok) {
			salmeKonfigurert = false;
			salmeUser = '';
			salmePass = '';
			salmeStatusTekst = '';
		} else {
			salmeStatusTekst = 'Klarte ikke logge ut: ' + (r?.error ?? 'ukjent feil');
		}
	}
</script>

<div id="innstillinger">
	<h2>Innstillinger</h2>
	<div class="inn-faner">
		<div class="fb-visning-velger">
			<button class:sel={innFane === 'generelt'} onclick={() => innFane = 'generelt'}>Generelt</button>
			<button class:sel={innFane === 'prekenforberedelse'} onclick={() => innFane = 'prekenforberedelse'}>Prekenforberedelse</button>
		</div>
	</div>
	{#if versjon}
		<p class="inn-versjon">Versjon {versjon}{bygg ? ` · bygg ${bygg}` : ''}</p>
	{/if}

	{#if innFane === 'generelt'}
	<div class="inn-seksjon">
		<div class="inn-seksjon-tittel">Generelt</div>
		<div class="inn-kort">
			{#if isElectron}
				<div class="inn-rad">
					<div class="inn-rad-tekst">
						<div class="inn-rad-tittel">Datamappe</div>
						<div class="inn-rad-beskriv">
							Appens data ligger i <code>{datamappe || '~/.config/Liturgi'}</code> og
							overlever appoppdateringer. Gudstjenestene lagres som
							<code>.liturgi</code>-filer der du velger (standard
							<code>~/Documents/Liturgi/</code>).
						</div>
						<div class="inn-stier">
							<span><code>{datamappe}/maler/originaler/</code> — originalmalene (følger med appen)</span>
							<span><code>{datamappe}/maler/brukermaler/</code> — dine lokale maler (<code>.limal</code>)</span>
							<span><code>{datamappe}/liturgi.db</code> — innstillinger, siste gudstjenester og biblioteket</span>
						</div>
					</div>
				</div>
				<div class="inn-rad">
					<div class="inn-rad-tekst">
						<div class="inn-rad-tittel">Biblioteket</div>
						<div class="inn-rad-beskriv">
							Oppslagsregister over originalmalene, brukes av «Hent innhold» og
							«Hent ledd». Det bygges automatisk — regenerer om noe ikke virker.
						</div>
					</div>
					<button class="inn-handling" onclick={byggPåNytt} disabled={jobber}>{jobber ? 'Bygger …' : 'Regenerer'}</button>
				</div>
			{:else}
				<div class="inn-rad">
					<div class="inn-rad-tekst">
						<div class="inn-rad-tittel">Lagring</div>
						<div class="inn-rad-beskriv">
							I nettleser-versjonen lagres data i nettleserens localStorage
							(nøkkel <code>liturgi-store-v1</code>). Datamappe, bibliotek og
							siste gudstjenester gjelder kun Mac-appen.
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>

	<div class="inn-seksjon">
		<div class="inn-seksjon-tittel">Salmedatabasen (gudstjeneste.no)</div>
		<div class="inn-kort">
			{#if !isElectron}
				<div class="inn-rad">
					<div class="inn-rad-tekst">
						<div class="inn-rad-tittel">Ikke tilgjengelig</div>
						<div class="inn-rad-beskriv">Salmedatabasen er kun tilgjengelig i Mac-appen.</div>
					</div>
				</div>
			{:else if salmeKonfigurert}
				<div class="inn-rad">
					<div class="inn-rad-tekst">
						<div class="inn-rad-tittel">Innlogget som <strong>{salmeUser}</strong></div>
						<div class="inn-rad-beskriv">
							Kontoen brukes når salmetekster hentes inn i salmeledd. Passordet
							lagres kryptert i appens database.
						</div>
						{#if salmeStatusTekst}<div class="inn-rad-beskriv">{salmeStatusTekst}</div>{/if}
					</div>
					<button class="inn-handling" onclick={salmeLoggUt} disabled={salmeJobber}>
						{salmeJobber ? 'Logger ut …' : 'Logg ut'}
					</button>
				</div>
			{:else}
				<div class="inn-rad">
					<div class="inn-rad-tekst">
						<div class="inn-rad-tittel">Innlogging</div>
						<div class="inn-rad-beskriv">
							Bruker og passord for din konto på gudstjeneste.no, brukes når
							salmetekster hentes inn i salmeledd. Passordet lagres kryptert i
							appens database.
						</div>
					</div>
				</div>
				<div class="inn-rad inn-rad-felt">
					<div class="salme-login">
						<label for="salmeUser">Brukernavn</label>
						<input id="salmeUser" bind:value={salmeUser} spellcheck="false" autocomplete="off" />
						<label for="salmePass">Passord</label>
						<input id="salmePass" type="password" bind:value={salmePass} autocomplete="new-password" />
						{#if salmeStatusTekst}<p class="salme-status">{salmeStatusTekst}</p>{/if}
					</div>
					<button class="inn-handling" onclick={lagreSalmeLogin} disabled={salmeJobber}>
						{salmeJobber ? 'Lagrer …' : 'Lagre'}
					</button>
				</div>
			{/if}
		</div>
	</div>

	{:else}
		<div class="inn-seksjon">
			<div class="inn-seksjon-tittel">Prekenforberedelse</div>
			<div class="inn-kort">
				<div class="inn-rad">
					<div class="inn-rad-tekst">
						<div class="inn-rad-tittel">Aktiver prekenforberedelser</div>
						<div class="inn-rad-beskriv">
							Slår av/på hele modulen: knappen i sidemenyen og knappen i
							Kirkeåret skjules når modulen er av. Filene dine røres ikke.
						</div>
					</div>
					<button class="inn-handling" class:av={!forbAktiv} onclick={() => settForbAktiv(!forbAktiv)}>
						{forbAktiv ? 'På' : 'Av'}
					</button>
				</div>
			{#if !isElectron}
				<div class="inn-rad">
					<div class="inn-rad-tekst">
						<div class="inn-rad-tittel">Ikke tilgjengelig</div>
						<div class="inn-rad-beskriv">Prekenforberedelser er kun tilgjengelig i Mac-appen.</div>
					</div>
				</div>
			{:else}
				<div class="inn-rad">
					<div class="inn-rad-tekst">
						<div class="inn-rad-tittel">Mappe for prekenforberedelser</div>
						<div class="inn-rad-beskriv">
							{#if forbMappe}
								Prosjektene dine ligger i <code>{forbMappe}</code>.
							{:else}
								Ikke valgt ennå — standardmappen (<code>~/Documents/Liturgi/forberedelse</code>)
								foreslås første gang du starter en prekenforberedelse fra Kirkeåret.
							{/if}
							Endrer du mappen spørres du om innholdet skal flyttes til den nye plassen.
						</div>
					</div>
					<button class="inn-handling" onclick={velgForbMappe} disabled={forbJobber}>{forbJobber ? 'Lagrer …' : 'Velg mappe …'}</button>
				</div>
			{/if}
		</div>
	</div>

	{/if}
</div>