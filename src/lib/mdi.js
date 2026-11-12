/** Material Design Icons (Pictogrammers) — path-data importert offline. */
const paths = import.meta.glob('./icons/*.path', { query: '?raw', import: 'default', eager: true });

const ikoner = {};
for (const [file, d] of Object.entries(paths)) {
	const navn = file.split('/').pop().replace('.path', '');
	ikoner[navn] = d;
}

/** Inline SVG for et MDI-ikon. */
export function mdi(navn, size = 16) {
	const d = ikoner[navn];
	if (!d) return '';
	return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="currentColor" aria-hidden="true"><path d="${d}"/></svg>`;
}
