<script>
	import { onMount } from 'svelte';
	import { regenererBibliotek } from '$lib/fileio.svelte.js';
	import { valgModal } from '$lib/modal.svelte.js';
	import { app } from '$lib/store.svelte.js';
	import { mdi } from '$lib/mdi.js';
	import { lesForbFiler, normaliserForbFiler } from '$lib/forb-filer.js';
	import { FORB_STANDARD_MALER, FORB_KONTEKST_SAMPLE, renderForbMal } from '$lib/forb-maler.js';
	import { malsprakHtml } from '$lib/handbok.js';
	import { mdHtml } from '$lib/md.js';
	import { toast } from 'svelte-sonner';

	const isElectron = typeof window !== 'undefined' && !!window.liturgi?.isElectron;

	let datamappe = '';

	/** Vis baner relative til hjemmekatalogen (~) — db-en lagrer absolutt bane. */
	const kortSti = (sti) => (sti || '').replace(/^\/Users\/[^/]+(?=\/|$)/, '~');
	let jobber = false;
	// aktiv undermodul: app.innFane ('generelt' | 'prekenforberedelse') — styres fra modul-topp
	let forbModul = $state(false); // Kirkeårets generering + prekenforberedelse-knappen
	let forbRediger = $state(false); // modulen i sidemenyen (redigeringsmodulen)
	let vimAktiv = $state(false); // global vim-modus
	let versjon = $state(''); // $state: onMount-oppdateringen må trigge re-render (runes-modus)
	let bygg = $state('');

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
	// fil-listen for prekenforberedelses-prosjekter (db 'forbFiler')
	let forbFilListe = $state([]); // navn p filene som genereres
	let forbFilRedigerer = $state(-1); // indeks som endres (inline omdping)
	let forbFilNyttNavn = $state('');
	let forbFilNy = $state(''); // nytt filnavn i Legg til-feltet
	let forbFmt = $state('md'); // 'md' | 'docx'
	let forbMalRedigerer = $state(''); // filnavn med malen pen
	let forbMalTekst = $state('');
	let forbMalBredde = $state(0);
	let forbMalVisHtml = $state(''); // live HTML av malens utdata (md-motoren) // bind:clientWidth p kolonnebeholderen
	let forbMalVisOn = $state(false); // bryteren for forhåndsvisning (vis/skjul) // smal skjerm: vis forhandsvisning i stedet for redigeringsfelten
	const forbMalSmal = $derived(forbMalBredde > 0 && forbMalBredde < 700);

	// live: visningen oppdateresforløpende fr det skrives
	$effect(() => {
		void forbMalTekst;
		try {
			forbMalVisHtml = mdHtml(renderForbMal(forbMalTekst, FORB_KONTEKST_SAMPLE));
		} catch (e) {
			forbMalVisHtml = '<p><em><strong>Feil i malen:</strong> ' + (e?.message ?? e) + '</em></p>';
		}
	});

	onMount(async () => {
		if (!isElectron) return;
		const r = await window.liturgi.dbGet('forbFiler');
		forbFilListe = lesForbFiler(r?.value);
		const rf = await window.liturgi.dbGet('forbFmt');
		forbFmt = rf?.value === 'docx' ? 'docx' : 'md';
		const rm = await window.liturgi.dbGet('forbMaler');
		try { app.forbMaler = JSON.parse(rm?.value || '{}'); } catch { app.forbMaler = {}; }
	});

		async function settForbFmt(v) {
		forbFmt = v;
		app.forbFmt = v;
		await window.liturgi.dbSet('forbFmt', v).catch(() => {});
	}

	// innholdsmaler (punkt 3): en tekst per fil, ekte EJS
	function apneForbMal(navn) {
		if (forbMalRedigerer === navn) { lukkForbMal(); return; }
		forbMalRedigerer = navn;
		forbMalTekst = app.forbMaler?.[navn] ?? FORB_STANDARD_MALER[navn] ?? '';
		forhandsvisForbMal(); // visningsskolonnen fyres med en gang
	}

	let malDokVis = $state(false);
	function aapneMalDok() {
		malDokVis = true;
	}

	function lukkForbMal() {
		forbMalRedigerer = '';
		forbMalTekst = '';
		forbMalVisHtml = '';
	}

	async function lagreForbMal() {
		const maler = { ...(app.forbMaler ?? {}), [forbMalRedigerer]: forbMalTekst };
		app.forbMaler = maler;
		await window.liturgi.dbSet('forbMaler', JSON.stringify(maler)).catch(() => {});
		toast.info('Malen er lagret for ' + forbMalRedigerer);
	}

	function forhandsvisForbMal() {
		try {
			forbMalVisHtml = mdHtml(renderForbMal(forbMalTekst, FORB_KONTEKST_SAMPLE));
		} catch (e) {
			forbMalVisHtml = '<p><em><strong>Feil i malen:</strong> ' + (e?.message ?? e) + '</em></p>';
		}
	}

	// live: forhandsvisningen oppdateres fortlpende mens det skrives
	$effect(() => {
		if (!forbMalRedigerer) return;
		void forbMalTekst;
		forhandsvisForbMal();
	});

	async function tilbakestillForbMal(navn) {
		const maler = { ...(app.forbMaler ?? {}) };
		const fikk = navn in maler;
		delete maler[navn];
		app.forbMaler = maler;
		await window.liturgi.dbSet('forbMaler', JSON.stringify(maler)).catch(() => {});
		if (forbMalRedigerer === navn) forbMalTekst = FORB_STANDARD_MALER[navn] ?? '';
		toast.info(fikk ? 'Malen er tilbakestilt til standard for ' + navn : navn + ' bruker allerede standardmalen');
	}

	async function lagreForbFiler(liste) {
		forbFilListe = liste;
		app.forbFiler = liste;
		await window.liturgi.dbSet('forbFiler', JSON.stringify(liste)).catch(() => {});
	}

	function leggTilForbFil() {
		const n = normaliserForbFiler([...forbFilListe, forbFilNy], { standardHvisTom: false });
		forbFilNy = '';
		if (n.length > forbFilListe.length) lagreForbFiler(n);
	}

	function slettForbFil(i2) {
		lagreForbFiler(forbFilListe.filter((_, ix) => ix !== i2));
	}

	function ferdigForbFilRediger() {
		if (forbFilRedigerer < 0) return;
		const liste = forbFilListe.map((n, ix) => (ix === forbFilRedigerer ? forbFilNyttNavn : n));
		const n = normaliserForbFiler(liste, { standardHvisTom: false });
		forbFilRedigerer = -1;
		forbFilNyttNavn = '';
		// omdping som kolliderte med et eksisterende navn gir uendret liste
		if (n.length === liste.length) lagreForbFiler(n);
	}

	function startForbFilRediger(i2) {
		forbFilRedigerer = i2;
		forbFilNyttNavn = forbFilListe[i2];
	}
</script>

<div id="innstillinger" class:inn-mal-side={app.innFane === 'prekenforberedelse' && !!forbMalRedigerer}>
	{#if versjon}
		<p class="inn-versjon">Versjon {versjon}{bygg ? ` · bygg ${bygg}` : ''}</p>
	{/if}

	{#if app.innFane === 'generelt'}
	<div class="inn-seksjon">
		<div class="inn-seksjon-tittel">Generelt</div>
		<div class="inn-kort">
			<div class="inn-rad" style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
				<div>
					<div>Brukerhåndbok</div>
					<div style="opacity:0.6; font-size:12px;">Slik fungerer appen: maler, bibliotek, redigering, eksport og profiler.</div>
				</div>
				<button class="inn-knapp" onclick={() => { app.visning = 'handbok'; }}>Åpne håndbok</button>
			</div>
		</div>
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
			{#if forbMalRedigerer}
				<div class="inn-seksjon">
					<div class="inn-seksjon-topp">
						<button class="inn-handling" onclick={lukkForbMal}>{@html mdi('chevron-left', 15)} Tilbake</button>
						<button class="inn-handling" title="Åpner  Malspråket-siden i Brukerhåndboken" onclick={aapneMalDok}>{@html mdi('book-open-variant', 15)} Malvariabler</button>
						<div class="inn-seksjon-tittel">Mal for {forbMalRedigerer}</div>
						<div class="forb-mal-handlinger">
							<button class="inn-handling" class:av={forbMalVisOn} onclick={() => (forbMalVisOn = !forbMalVisOn)}>
								{#if forbMalVisOn}{@html mdi('pencil', 14)} Redigeringsmal{:else}{@html mdi('file-document-outline', 15)} Forhåndsvisning{/if}
							</button>
							<button class="inn-handling" onclick={lagreForbMal}>Lagre mal</button>
							<button class="inn-handling" onclick={() => tilbakestillForbMal(forbMalRedigerer)}>Tilbakestill</button>
						</div>
					</div>
					<div class="inn-kort">
						<div class="forb-mal-kolonner" bind:clientWidth={forbMalBredde}>
							{#if forbMalSmal ? !forbMalVisOn : true}
								<div class="forb-mal-kol">
									<div class="forb-mal-kol-tittel">Redigering</div>
									<textarea class="forb-mal-tekst" bind:value={forbMalTekst} spellcheck="false"></textarea>
								</div>
							{/if}
							{#if forbMalSmal ? forbMalVisOn : !forbMalVisOn}
								<div class="forb-mal-kol">
									<div class="forb-mal-kol-tittel">Forhåndsvisning (Julaften)</div>
									{#if forbMalVisHtml}
										<div class="forb-mal-vis hb-md">{@html forbMalVisHtml}</div>
									{:else}
										<div class="forb-mal-tom">Klikk «Forhåndsvisning» når du vil se utdata.</div>
										<div class="forb-mal-tom">Klikk «Forhåndsvisning» for å se utdata.</div>
									{/if}
								</div>
							{/if}
						</div>
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
						<div class="inn-rad-tittel">Redigeringsmodulen <span class="inn-eks-merke">Eksperimentell</span></div>
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

				<div class="inn-rad">
					<div class="inn-rad-tekst">
						<div class="inn-rad-tittel">Filformat</div>
						<div class="inn-rad-beskriv">Word-filene kan ikke redigeres i modulen (kun generering); markdown-filene redigeres som vanlig.</div>
					</div>
					<div class="inn-format">
						<button class="inn-handling" class:av={forbFmt !== 'md'} onclick={() => settForbFmt('md')}>Markdown (.md)</button>
						<button class="inn-handling" class:av={forbFmt !== 'docx'} onclick={() => settForbFmt('docx')}>Word (.docx)</button>
					</div>
				</div>

				<div class="inn-rad inn-rad-kolonne forb-maler-rad">
					<div class="inn-rad-tekst">
						<div class="inn-rad-tittel">Filer som genereres</div>
						<div class="inn-rad-beskriv">Liste over filene som opprettes i dagens mappe. Nye egendefinerte filer startes tomme; filer uten .md får endelsen automatisk.</div>
					</div>
					<div class="forb-filer">
						{#each forbFilListe as navn, ix}
							<div class="forb-fil-rad">
								{#if forbFilRedigerer === ix}
									<input class="forb-fil-input" bind:value={forbFilNyttNavn}
										onkeydown={(e) => { if (e.key === 'Enter') ferdigForbFilRediger(); if (e.key === 'Escape') { forbFilRedigerer = -1; } }}
										onblur={ferdigForbFilRediger} />
								{:else}
									<span class="forb-fil-navn">{navn}</span>
								{/if}
								<button class="inn-liten inn-liten-hall" title="Endre malen for denne filen" onclick={() => apneForbMal(navn)}>Endre</button>
							<button class="inn-liten" title="Endre filnavn" onclick={() => (forbFilRedigerer === ix ? ferdigForbFilRediger() : startForbFilRediger(ix))}>{forbFilRedigerer === ix ? 'Lagre' : 'Navn'}</button>
								<button class="inn-liten inn-liten-fare" title="Slett filen fra listen" onclick={() => slettForbFil(ix)}>Slett</button>
							</div>
						{/each}
						<div class="forb-fil-rad">
							<input class="forb-fil-input" placeholder="ny-fil.md" bind:value={forbFilNy}
								onkeydown={(e) => { if (e.key === 'Enter') leggTilForbFil(); }} />
							<button class="inn-liten" onclick={leggTilForbFil}>Legg til</button>
						</div>
					</div>
				</div>
				{/if}
			</div>
		</div>
			{/if}
		{/if}

	{#if malDokVis}
		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
		<div class="skjerm-lag" role="presentation" onclick={() => (malDokVis = false)}>
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<div class="forb-dok-modal" role="dialog" aria-modal="true" aria-label="Malspråket" onclick={(e) => e.stopPropagation()}>
				<div class="forb-dok-topp">
					<div class="forb-dok-tittel">Malspråket for prekenforberedelse</div>
					<button class="inn-handling" onclick={() => (malDokVis = false)}>Lukk</button>
				</div>
				<div class="forb-dok-innhold handbok-innhold">{@html malsprakHtml}</div>
			</div>
		</div>
	{/if}
	</div>
