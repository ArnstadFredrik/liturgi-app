<script>
	/**
	 * Bakgrunnsforhåndshenting av kirkeårsinnhold til cache (liturgi.db-nøkkelen
	 * 'kirkeaarCache'). Ligger i eget komponent så det kjører uavhengig av visning.
	 * Format: { datoISO: { k: {…lookupKirkeaar}, tekster: {E,L1,L2,F} } }
	 * Brukes av createService: hvis dato/kirkeårsdag matcher cachen, fylles
	 * gudstjenesten umiddelbart uten eksterne kall.
	 */
	import { onMount } from 'svelte';
	import { lookupKirkeaar, hentTekster, kirkeaarDager } from '$lib/kirkeaar.js';

	const isElectron = typeof window !== 'undefined' && !!window.liturgi?.isElectron;

	function isoLokal(d) {
		const pad = (n) => String(n).padStart(2, '0');
		return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
	}

	function nesteSoendag() {
		const d = new Date();
		d.setDate(d.getDate() + ((7 - d.getDay()) % 7));
		return isoLokal(d);
	}

	// hele kirkeåret + neste (for å hente merkedager/dager utenfor dette kirkeåret)
	let cache = {};
	let alleDager = [];

	async function lesCache() {
		try {
			if (isElectron) {
				const r = await window.liturgi.dbGet('kirkeaarCache');
				// dbSet pakker verdien i JSON.stringify — pakk ut (dobbel-koding)
				if (r?.ok && r.value) {
					const v = typeof r.value === 'string' ? JSON.parse(r.value) : r.value;
					cache = typeof v === 'string' ? JSON.parse(v) : v;
				}
			} else {
				cache = JSON.parse(localStorage.getItem('kirkeaarCache') ?? '{}');
			}
		} catch { cache = {}; }
		return cache;
	}

	async function lagreCache() {
		try {
			// hold cachen liten: bare de 15 nyeste dagene
			const noekler = Object.keys(cache).sort();
			while (noekler.length > 15) delete cache[noekler.shift()];
			const v = JSON.stringify(cache);
			if (isElectron) await window.liturgi.dbSet('kirkeaarCache', v);
			else localStorage.setItem('kirkeaarCache', v);
		} catch { /* full/utilgjengelig — cachen er valgfri */ }
	}

	/** Hent og cache innholdet for én dato (brukes både ved oppstart og etter opprettelse). */
	async function forhaandHent(dato) {
		if (!dato || cache[dato]) return;
		const k = lookupKirkeaar(dato);
		if (!k?.day) return;
		// plassholder i cachen umiddelbart (unngår dobbelthenting i parallell)
		cache[dato] = { k, tekster: null };
		const tekster = navigator.onLine ? await hentTekster(k.day) : null;
		cache[dato] = { k, tekster };
		await lagreCache();
	}

	/** Kalt fra createService (store.svelte.js): dato/kirkeårsdag samsvarer med cachen? */
	function finnICache(dato, k) {
		const c = cache[dato];
		if (!c?.k) return null;
		// kirkeårsdagen må stemme (samme dag-id + år)
		if (c.k.day?.id !== k.day?.id || c.k.day?.years !== k.day?.years) return null;
		return c;
	}

	onMount(async () => {
		await lesCache();
		// eksponer for store.svelte.js (createService) — funksjoner, ikke data
		window.__kirkeaarCache = {
			finn: (dato, k) => finnICache(dato, k),
			hent: (dato) => forhaandHent(dato),
			ferdig: () => Object.keys(cache).length > 0
		};
		// hele kirkeåret + neste kirkeår (til bakgrunnshenting ved behov)
		const soendag = nesteSoendag();
		alleDager = kirkeaarDager(soendag);
		// kommende søndag + dagene mellom i dag og søndagen hentes ved oppstart
		const iDag = isoLokal(new Date());
		const naere = alleDager.filter((d) => d.date >= iDag && d.date <= soendag).map((d) => d.date);
		for (const dato of naere) await forhaandHent(dato);
	});
</script>

<!-- usynlig komponent: gjør ingenting visuelt -->
