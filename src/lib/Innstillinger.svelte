<script>
	import { onMount } from 'svelte';
	import { regenererBibliotek } from '$lib/fileio.svelte.js';
	import { valgModal } from '$lib/modal.svelte.js';
	import { app } from '$lib/store.svelte.js';
	import { mdi } from '$lib/mdi.js';

	const isElectron = typeof window !== 'undefined' && !!window.liturgi?.isElectron;

	let datamappe = '';

	/** Vis baner relative til hjemmekatalogen (~) — db-en lagrer absolutt bane. */
	const kortSti = (sti) => (sti || '').replace(/^\/Users\/[^/]+(?=\/|$)/, '~');
	let jobber = false;
	// aktiv undermodul: app.innFane ('generelt' | 'prekenforberedelse') — styres fra modul-topp
	let forbModul = $state(false); // Kirkeårets generering + prekenforberedelse-knappen
	let forbRediger = $state(false); // modulen i sidemenyen (redigeringsmodulen)
	let vimAktiv = $state(false); // global vim-modus
	let versjon = '';
	let bygg = '';

	onMount(async () => {
		if (!isElectron) return;
		try {
const fm = await window.liturgi.dbGet('forbModul');
			forbModul = (fm?.value ?? '0') === '1';
			app.forbModul = forbModul;
			const fr = await window.liturgi.dbGet('forbRediger');
			forbRediger = (fr?.value ?? '0') === '1';
			app.forbRediger = forbRediger;
			const vm = await window.liturgi.dbGet('vimModus');
			vimAktiv = app.vimModus = (vm?.value ?? '0') === '1';
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
	let salmeKonfigurert = $state(false);
	let salmeUser = $state('');
	let salmePass = $state('');
	let salmeJobber = $state(false);
	let salmeStatusTekst = $state('');

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
		if (!r?.ok) {
			salmeJobber = false;
			salmeStatusTekst = 'Klarte ikke lagre: ' + (r?.error ?? 'ukjent feil');
			return;
		}
		// verifiser mot gudstjeneste.no med én gang — ekte sjekk av brukernavn/passord
		salmeStatusTekst = 'Logger inn mot gudstjeneste.no …';
		const t = await window.liturgi.salmeTestLogin?.();
		salmeJobber = false;
		if (!t?.ok) {
			// oppgitt innlogging virket ikke — bli på skjemaet så brukeren kan rette
			salmeStatusTekst = 'Innlogging feilet: ' + (t?.error ?? 'ukjent feil') + '. Sjekk brukernavn og passord.';
			return;
		}
		salmeKonfigurert = true;
		salmePass = '';
		salmeStatusTekst = '';;
	}

	// prekenforberedelser: mappe (db-nøkkel 'prekenforberedelseMappe') + migrering
	let forbMappe = $state('');
	let forbJobber = $state(false);

	onMount(async () => {
		if (!isElectron) return;
		const r = await window.liturgi.dbGet('prekenforberedelseMappe');
		forbMappe = r?.ok ? (r.value ?? '') : '';
	});

	function settVim(v) {
		vimAktiv = v;
		app.vimModus = v;
		window.liturgi.dbSet('vimModus', v ? '1' : '0').catch(() => {});
	}

function settForbModul(v) {
		forbModul = v;
		app.forbModul = v;
		window.liturgi.dbSet('forbModul', v ? '1' : '0').catch(() => {});
		// modulen av → redigeringsmodulen kan ikke være på
		if (!v && forbRediger) settForbRediger(false);
	}

	function settForbRediger(v) {
		forbRediger = v;
		app.forbRediger = v;
		window.liturgi.dbSet('forbRediger', v ? '1' : '0').catch(() => {});
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
	{#if versjon}
		<p class="inn-versjon">Versjon {versjon}{bygg ? ` · bygg ${bygg}` : ''}</p>
	{/if}

	{#if app.innFane === 'generelt'}
	<div class="inn-seksjon">
		<div class="inn-seksjon-tittel">Generelt</div>
		<div class="inn-kort">
			{#if isElectron}
				<div class="inn-rad">
					<div class="inn-rad-tekst">
						<div class="inn-rad-tittel">Datamappe</div>
						<div class="inn-rad-beskriv">
							Appens data ligger i <code>{datamappe ? kortSti(datamappe) : '~/.config/Liturgi'}</code> og
							overlever appoppdateringer. Gudstjenestene lagres som
							<code>.liturgi</code>-filer der du velger (standard
							<code>~/Documents/Liturgi/</code>).
						</div>
						<div class="inn-stier">
							<span><code>{kortSti(datamappe)}/maler/originaler/</code> — originalmalene (følger med appen)</span>
							<span><code>{kortSti(datamappe)}/maler/brukermaler/</code> — dine lokale maler (<code>.limal</code>)</span>
							<span><code>{kortSti(datamappe)}/liturgi.db</code> — innstillinger, siste gudstjenester og biblioteket</span>
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
				<div class="inn-rad">
					<div class="inn-rad-tekst">
						<div class="inn-rad-tittel">Vim-modus</div>
						<div class="inn-rad-beskriv">
							Vim-bindinger i alle redigeringsfelt (normal/insert, hj/k/l,
							dd/yy/p osv.). Byttes også i menylinjen og kontekstmenyen.
						</div>
					</div>
					<button class="inn-bryter" role="switch" aria-checked={vimAktiv}
						title={vimAktiv ? 'Vim-modus er på' : 'Vim-modus er av'}
						onclick={() => settVim(!vimAktiv)}>
						<span class="inn-bryter-spore"><span class="inn-bryter-klump"></span></span>
					</button>
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
						<div class="inn-rad-tittel inn-logget-inn">{@html mdi('check-circle', 16)} Innlogget som <strong>{salmeUser}</strong></div>
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
					<div class="salme-handling">
						{#if salmeJobber}<span class="salme-spinner" aria-hidden="true"></span>{/if}
						<button class="inn-handling" onclick={lagreSalmeLogin} disabled={salmeJobber}>
							{salmeJobber ? 'Logger inn …' : 'Logg inn'}
						</button>
					</div>
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
						<div class="inn-rad-tittel">Prekenforberedelse-modulen</div>
						<div class="inn-rad-beskriv">
							Gjør modulen tilgjengelig: knappen «Prekenforberedelse» i
							Kirkeårsoversikten kan generere mapper og filer til
							kirkeårsdagen. Filene dine røres ikke.
						</div>
					</div>
					<button class="inn-handling" class:av={!forbModul} onclick={() => settForbModul(!forbModul)}>
						{forbModul ? 'På' : 'Av'}
					</button>
				</div>
				<div class="inn-rad">
					<div class="inn-rad-tekst">
						<div class="inn-rad-tittel">Redigeringsmodulen</div>
						<div class="inn-rad-beskriv">
							Viser «Prekenforberedelse» i sidemenyen, med redigering av
							notat, preken og tekster. Krever at modulen er på.
						</div>
					</div>
					<button class="inn-handling" class:av={!forbRediger} disabled={!forbModul} onclick={() => settForbRediger(!forbRediger)}>
						{forbRediger ? 'På' : 'Av'}
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
								Prosjektene dine ligger i <code>{kortSti(forbMappe) || 'ikke valgt'}</code>.
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