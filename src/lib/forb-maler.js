import Mustache from 'mustache';

/** Mal-engine for prekenforberedelse-filene (punkt 3).
 *  Malsprøk: mustache-lignende klammemaler (i Jinja/EJS-familien, men trygg
 *  i både webview og node-tester). Tre klamrer = rå tekst, to klamrer
 *  escaper; seksjoner + ^ og /. Seksjonene tekster.E/L1/L2 gjoer nokklene
 *  (ref, tittel, tekst, harInnhold) relative inni seg.
 *  Maler lagres i db (økkel 'forbMaler') per filnavn (kanonisk .md-navn);
 *  manglende mal = den innebygde standarden under. */

/** E/L1/L2: kirkeårsdagens felt er referansen; tekstcachen gir tittel+tekst. */
function del(ref, txt) {
	return {
		ref: ref || '',
		refVis: ref || '—',
		tittel: txt?.title || '',
		tekst: txt?.text || '',
		harInnhold: !!(txt && (txt.text || txt.title))
	};
}

/** Kontekst-objektet malene kan bruke. Alt fra kirkeårsmodulen kan refereres. */
export function byggForbKontekst(dag, tekster, kirkeaar) {
	const dager = ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'];
	const mnd = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'];
	const d = dag?.date ? new Date(dag.date + 'T12:00:00') : null;
	const datoTekst = d ? dager[d.getDay()] + ' ' + d.getDate() + '. ' + mnd[d.getMonth()] + ' ' + d.getFullYear() : '';
	return {
		dag: {
			navn: dag?.name || '',
			dato: dag?.date || '',
			datoTekst,
			farge: dag?.color || 'æ',
			rekke: dag?.series || 'æ',
			periode: dag?.periodInfo || '',
			bonn: (dag?.prayer || '').trim()
		},
		tekster: {
			E: del(dag?.E, tekster?.E),
			L1: del(dag?.L1, tekster?.L1),
			L2: del(dag?.L2, tekster?.L2)
		},
		kirkeaar: kirkeaar || { start: '', slutt: '', rekke: '' }
	};
}

const IKKE_HENTET = "*Teksten er ikke hentet -- åpne Kirkeåret med nettforbindelse og prøv igjen.*";

export const FORB_STANDARD_MALER = {
	'notat.md': [
		"# {{{dag.navn}}}",
		"",
		"- **Dato:** {{{dag.datoTekst}}}",
		"- **Liturgisk farge:** {{{dag.farge}}}",
		"- **Tekstrekke:** {{{dag.rekke}}}{{#dag.periode}} · {{{dag.periode}}}{{/dag.periode}}",
		"",
		"## Tekster",
		"- **Første lesning:** {{{tekster.L1.refVis}}}",
		"- **Andre lesning:** {{{tekster.L2.refVis}}}",
		"- **Evangelium:** {{{tekster.E.refVis}}}",
		"",
		"{{#dag.bonn}}",
		"## Dagens bønn",
		"",
		"{{{dag.bonn}}}",
		"",
		"{{/dag.bonn}}",
		"## Salmer",
		"",
		"| Nr | Tittel | Liturgi |",
		"|----|--------|---------|",
		"|    |        |         |",
		"",
		"## Notater",
		""
	].join('\n'),
	'tekstmeditasjon.md': [
		"# Tekstmeditasjon æ {{{dag.navn}}}",
		"",
		"{{#tekster.E}}## Evangelium{{#ref}} æ {{{ref}}}{{/ref}}",
		"",
		"{{#harInnhold}}{{#tittel}}**{{{tittel}}}**{{/tittel}}\n{{{tekst}}}{{/harInnhold}}{{^harInnhold}}*Teksten er ikke hentet -- åpne Kirkeåret med nettforbindelse og prøv igjen.*{{/harInnhold}}{{/tekster.E}}",
		"",
		"{{#tekster.L1}}## Første lesning{{#ref}} æ {{{ref}}}{{/ref}}",
		"",
		"{{#harInnhold}}{{#tittel}}**{{{tittel}}}**{{/tittel}}\n{{{tekst}}}{{/harInnhold}}{{^harInnhold}}*Teksten er ikke hentet -- åpne Kirkeåret med nettforbindelse og prøv igjen.*{{/harInnhold}}{{/tekster.L1}}",
		"",
		"{{#tekster.L2}}## Andre lesning{{#ref}} æ {{{ref}}}{{/ref}}",
		"",
		"{{#harInnhold}}{{#tittel}}**{{{tittel}}}**{{/tittel}}\n{{{tekst}}}{{/harInnhold}}{{^harInnhold}}*Teksten er ikke hentet -- åpne Kirkeåret med nettforbindelse og prøv igjen.*{{/harInnhold}}{{/tekster.L2}}",
		""
	].join('\n'),
	'preken.md': ["# Preken æ {{{dag.navn}}}\n\n", ''].join('\n')
};

/** Eksempelkontekst (Julaften) for forhåndsvisning i Innstillinger og tester. */
export const FORB_KONTEKST_SAMPLE = byggForbKontekst(
	{
		name: 'Julaften',
		date: '2026-12-24',
		color: 'Hvit',
		series: 'A',
		periodInfo: 'Jul',
		prayer: 'Herre, vår Gud, la himlene åpne seg.'
	},
	{
		E: { title: 'Jesaja 9', text: 'For et barn er oss født.' },
		L1: null,
		L2: null
	},
	{ start: '2026', slutt: '2027', rekke: 'Andre' }
);

/** Render en mal (streng) mot kontekst. Kaster ved feil i malen. */
export function renderForbMal(mal, kontekst) {
	return Mustache.render(mal, kontekst, undefined, { strict: true });
}

/** Filinnholdet for ett filnavn (kanonisk .md-navn): brukermal > standardmal > tom. */
export function forbInnhold(navn, maler, kontekst) {
	const kilde = maler?.[navn] ?? FORB_STANDARD_MALER[navn] ?? '';
	if (!kilde) return '';
	return renderForbMal(kilde, kontekst);
}

/** Filnavn på disk for et kanonisk .md-navn gitt formatet (md|docx). */
export function forbEkstern(navn, fmt) {
	return fmt === 'docx' ? navn.replace(/\.md$/i, '.docx') : navn;
}
