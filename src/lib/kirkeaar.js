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
 * Hent selve bibeltekstene fra bibel.no for en kirkeårsdag.
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

export async function hentTekster(day, cache) {
	if (!day?.id || !day?.years) return null;
	const startYear = day.years.split('-')[0];
	const noekkel = `${startYear}/${day.id}`;
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
		if (cache && (res.E || res.L1)) { cache[noekkel] = res; lagreTeksterCache(cache); }
		return res;
	} catch {
		return null;
	}
}
