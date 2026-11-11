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
export async function hentTekster(day) {
	if (!day?.id || !day?.years) return null;
	const startYear = day.years.split('-')[0];
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
			el.querySelectorAll('sup').forEach((sup) => {
				sup.replaceWith(document.createTextNode(' ' + sup.textContent.trim() + ' '));
			});
			const ref = el.querySelector('a[href*="/les/"]')?.textContent?.trim() ?? '';
			const title = el.querySelector('h3 span')?.textContent?.trim() ?? '';
			const body = [...el.querySelectorAll('p')]
				.map((p) => p.textContent.replace(/\s+/g, ' ').trim())
				.filter(Boolean)
				.join('\n');
			if (!body) return null;
			return { ref, title, text: body };
		};
		return { E: grab('E'), L1: grab('L1'), L2: grab('L2'), F: grab('F') };
	} catch {
		return null;
	}
}
