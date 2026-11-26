import ejs from 'ejs';

/** Malmotor for prekenforberedelse-filene: ekte EJS (npm-pakken, browser-bygget).
 *  <% %> er kode, <%= %> escaper utdata, <%- %> gir rå tekst.
 *  Konteksten ligger i with-scope, så dag.navn o.l. kan brukes direkte.
 *  Maler lagres i db (nøkkel 'forbMaler') per filnavn (kanonisk .md-navn);
 *  manglende mal = en av standardmalene under. Eldre mustache-maler
 *  ({{{ }}}, {{# }}) migreres automatisk ved rendering. */

function del(ref, txt) {
	return {
		ref: ref || '',
		refVis: ref || '\u2014',
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
			farge: dag?.color || '—',
			rekke: dag?.series || '—',
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

/** Migrer gamle mustache-merker til EJS. Lesning-seksjonene
 *  (tekster.E/L1/L2) pakkes inn i en funksjon slik at de relative feltnavnene
 *  (ref, tittel, tekst, harInnhold) fortsatt virker inne i malen. */
export function migrerForbMal(mal) {
	if (!mal || !mal.includes('{{')) return mal;
	const TEKSTLESNING = ['tekster.E', 'tekster.L1', 'tekster.L2'];
	let ut = '';
	let i = 0;
	const n = mal.length;
	const lukkSti = [];
	while (i < n) {
		const start = mal.indexOf('{{', i);
		if (start < 0) { ut += mal.slice(i); break; }
		ut += mal.slice(i, start);
		const slutt = mal.indexOf('}}', start);
		if (slutt < 0) { ut += mal.slice(start); break; }
		const token = mal.slice(start + 2, slutt);
		i = slutt + 2;
		if (token.startsWith('{')) i++; // trippelklammer: ekstra '}' etter tokenet
		if (token.startsWith('{{')) {
			// trippelklammer {{{ x }}}: rå utdata
			ut += '<%= ' + token.replace(/\{|\}/g, '') + ' %>';
			continue;
		}
		if (token.startsWith('#')) {
			const sti = token.slice(1).trim();
			if (TEKSTLESNING.includes(sti)) {
				const k = 't' + lukkSti.length;
				lukkSti.push(sti);
				ut += '<% (function (tt) { const ' + k + ' = tt, ref = tt.ref, tittel = tt.tittel, tekst = tt.tekst, harInnhold = tt.harInnhold; %>';
				continue;
			}
			ut += '<% if (' + sti + ') { %>';
			continue;
		}
		if (token.startsWith('^')) {
			ut += '<% if (!(' + token.slice(1).trim() + ')) { %>';
			continue;
		}
		if (token.startsWith('/')) {
			const sti = token.slice(1).trim();
			if (TEKSTLESNING.includes(sti) && lukkSti.length) {
				ut += '<% })(' + lukkSti.pop() + '); %>';
				continue;
			}
			ut += '<% } %>';
			continue;
		}
		ut += '<%= ' + token.replace(/\{|\}/g, '').trim().replace(/\}+$/, '') + ' %>';
	}
	return ut;
}

const IKKE_HENTET = "*Teksten er ikke hentet — åpne Kirkeåret med nettforbindelse og prøv igjen.*";

export const FORB_STANDARD_MALER = {
	'notat.md': [
		"# <%= dag.navn %>",
		"",
		"- **Dato:** <%= dag.datoTekst %>",
		"- **Liturgisk farge:** <%= dag.farge %>",
		"- **Tekstrekke:** <%= dag.rekke %><% if (dag.periode) { %> · <%= dag.periode %><% } %>",
		"",
		"## Tekster",
		"- **Første lesning:** <%= tekster.L1.refVis %>",
		"- **Andre lesning:** <%= tekster.L2.refVis %>",
		"- **Evangelium:** <%= tekster.E.refVis %>",
		"",
		"<% if (dag.bonn) { %>",
		"## Dagens bønn",
		"",
		"<%= dag.bonn %>",
		"",
		"<% } %>",
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
		"# Tekstmeditasjon — <%= dag.navn %>",
		"",
		"<% const lesninger = [[\"Evangelium\", tekster.E], [\"Første lesning\", tekster.L1], [\"Andre lesning\", tekster.L2]]; %>",
		"<% for (const [navn, t] of lesninger) { %>",
		"## <%= navn %><% if (t.ref) { %> — <%= t.ref %><% } %>",
		"",
		"<% if (t.harInnhold) { %><% if (t.tittel) { %>**<%= t.tittel %>**",
		"",
		"<% } %><%= t.tekst %><% } else { %>",
		"*Teksten er ikke hentet — åpne Kirkeåret med nettforbindelse og prøv igjen.*",
		"",
		"<% } %>",
		"<% } %>"
	].join('\n'),
	'preken.md': [
		"# Preken — <%= dag.navn %>",
		""
	].join('\n')
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

/** Render en EJS-mal (streng) mot kontekst. Kaster ved feil i malen. */
export function renderForbMal(mal, kontekst) {
	return ejs.render(migrerForbMal(mal), kontekst);
}

/** Filinnholdet for ett filnavn (kanonisk .md-navn): brukermal > standardmal > tom. */
export function forbInnhold(navn, maler, kontekst) {
	const kilde = migrerForbMal(maler?.[navn] ?? FORB_STANDARD_MALER[navn] ?? '');
	if (!kilde) return '';
	return renderForbMal(kilde, kontekst);
}

/** Filnavn på disk for et kanonisk .md-navn gitt formatet (md|docx). */
export function forbEkstern(navn, fmt) {
	return fmt === 'docx' ? navn.replace(/\.md$/i, '.docx') : navn;
}
