import church from 'church-year';

/** Slå opp kirkeårsdag for en dato. Returnerer null ved ugyldig dato. */
export function lookupKirkeaar(dateISO) {
	if (!dateISO) return null;
	try {
		const res = church.nextByDate({ date: dateISO, commemorative: true });
		if (!res?.length) return null;
		const main = res[0];
		const extra = res.slice(1).map((d) => d.name);
		const cr = main.readings?.currentReadings;
		const text = cr?.text || {};
		return {
			name: [main.name, ...extra].join(' + '),
			color: main.liturgical_color?.name ?? '',
			periodInfo: main.periodInfo ?? '',
			series: cr?.name ?? '',
			prayer: (main.prayer || '').trim(),
			L1: text.L1 ?? '',
			L2: text.L2 ?? '',
			E: text.E ?? '',
			day: { id: main.id, years: main.years }
		};
	} catch {
		return null;
	}
}

/** Alle kirkeårsdager for kirkeåret som dato-en ligger i (for manuell valg). */
export function kirkeaarDager(dateISO) {
	try {
		const startYear = church.calculateStartYear(dateISO);
		if (startYear == null) return [];
		return church.churchYear({ year: startYear }).map((d) => {
			const cr = d.readings?.currentReadings;
			const text = cr?.text || {};
			return {
				date: d.day?.slice(0, 10) ?? '',
				name: d.name,
				color: d.liturgical_color?.name ?? '',
				periodInfo: d.periodInfo ?? '',
				series: cr?.name ?? '',
				prayer: (d.prayer || '').trim(),
				L1: text.L1 ?? '',
				L2: text.L2 ?? '',
				E: text.E ?? '',
				day: { id: d.id, years: d.years }
			};
		});
	} catch {
		return [];
	}
}

/**
 /**
 * Rekke-navn for prekenforberedelse-mappen. Hovedrekker (I/II/III) mappe direkte;
 * alternative dager (Julaften m.m. som kun har rekke A/F) legger seg i rekke-mappen
 * til nærmeste kirkeårsdag med en hovedrekke — samme startår-sluttår-struktur.
 */
export function forbRekkeForDag(dag, dager) {
	const HOVED = { I: 'Første', II: 'Andre', III: 'Tredje' };
	const s = dag?.series ?? '';
	if (HOVED[s]) return HOVED[s];
	const dato = dag?.date ?? '';
	if (!dato || !Array.isArray(dager)) return HOVED.I;
	let best = null;
	for (const d of dager) {
		if (d?.date === dato || !HOVED[d?.series]) continue;
		const avstand = Math.abs(Date.parse(d.date) - Date.parse(dato));
		if (!Number.isNaN(avstand) && (best === null || avstand < best.avstand)) best = { avstand, series: d.series };
	}
	return best ? HOVED[best.series] : HOVED.I;
}

 /** Hent selve bibeltekstene fra bibel.no for en kirkeårsdag.
 * URL-mønster: /nettbibelen/kirkearets-tekster/nb-2024/{startår}/{dag-id}
 * Returnerer { E, L1, L2, F } der hver er { ref, title, text } – eller null.
 */
/** Bibeltekst-cache (db 'kirkeaarTekster') — gjenbrukes offline og raskere ved gjenåpning. */
export async function lesTeksterCache() {
	try {
		const r = await window.liturgi?.dbGet?.('kirkeaarTekster');
		if (r?.value) { try { return JSON.parse(r.value); } catch { return {}; } }
	} catch { /* db utilgjengelig */ }
	return {};
}

function lagreTeksterCache(cache) {
	if (!cache) return;
	try {
		window.liturgi?.dbSet?.('kirkeaarTekster', JSON.stringify(cache));
	} catch { /* db utilgjengelig */ }
}

export async function hentTekster(day, cache, rekke) {
	if (!day?.id || !day?.years) return null;
	const startYear = day.years.split('-')[0];
	// rekken med i nøkkelen: (kirkeår, dag, tekstrekke) — rekken følger normalt
	// av kirkeåret, men lagres eksplisitt slik at koblingen er entydig
	const noekkel = `${startYear}/${day.id}${rekke ? '@' + rekke : ''}`;
	if (cache && cache[noekkel]) return cache[noekkel];
	try {
		const r = await fetch(
			`/api/bibel/kirkearets-tekster/nb-2024/${startYear}/${day.id}`
		);
		if (!r.ok) return null;
		const html = await r.text();
		const doc = new DOMParser().parseFromString(html, 'text/html');
		const grab = (id) => {
			const el = doc.querySelector(`section#${id}`);
			if (!el) return null;
			const ref = el.querySelector('a[href*="/les/"]')?.textContent?.trim() ?? '';
			const title = el.querySelector('h3 span')?.textContent?.trim() ?? '';
			// behold struktur fra bibel.no: avsnitt (p), underskrifter (h4/h5),
			// versnummer som hevet skrift ^{N} og kursiv (i) som *…*
			const tmp = doc.createElement('div');
			const body = [...el.querySelectorAll('h4, h5, p')]
				.map((node) => {
					tmp.innerHTML = node.innerHTML
						.replace(/<sup[^>]*>([\s\S]*?)<\/sup>/g, (m, c) => ' ^{' + c.replace(/<[^>]+>/g, '').trim() + '} ')
						.replace(/<i[^>]*>([\s\S]*?)<\/i>/g, (m, c) => ' *' + c.replace(/<[^>]+>/g, '').trim() + '* ');
					const t = tmp.textContent.replace(/\s+/g, ' ').trim();
					if (!t) return '';
					return node.tagName !== 'P' ? '# ' + t : t;
				})
				.filter(Boolean)
				.join('\n');
			if (!body) return null;
			return { ref, title, text: body };
		};
		const res = { E: grab('E'), L1: grab('L1'), L2: grab('L2'), F: grab('F') };
		if (cache && (res.E || res.L1)) { cache[noekkel] = { rekke: rekke || null, ...res }; lagreTeksterCache(cache); }
		return res;
	} catch {
		return null;
	}
}
