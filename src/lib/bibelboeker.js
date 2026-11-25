/**
 *  Oppslag bibelske bøker: forkortet referanse → fullt navn, hentet fra
 *  bibel.no/nettbibelen (nb-2024 og nn-2024, boklistene på /nettbibelen/les/*).
 *  Brukes til å «oversette» en referanse som «1 Mos 3,15-20» til alminnelig tekst
 *  («Første Mosebok, kapittel 3») i innledninger, mens BIBELREF beholder forkortelsen.
 */

// [forkortelse nb, forkortelse nn, fullt navn nb, fullt navn nn]
const RADER = [
	['1 Mos', '1 Mos', 'Første Mosebok', 'Første Mosebok'],
	['2 Mos', '2 Mos', 'Andre Mosebok', 'Andre Mosebok'],
	['3 Mos', '3 Mos', 'Tredje Mosebok', 'Tredje Mosebok'],
	['4 Mos', '4 Mos', 'Fjerde Mosebok', 'Fjerde Mosebok'],
	['5 Mos', '5 Mos', 'Femte Mosebok', 'Femte Mosebok'],
	['Jos', 'Jos', 'Josva', 'Josva'],
	['Dom', 'Dom', 'Dommerne', 'Dommarane'],
	['Rut', 'Rut', 'Rut', 'Rut'],
	['1 Sam', '1 Sam', 'Første Samuelsbok', 'Første Samuelsbok'],
	['2 Sam', '2 Sam', 'Andre Samuelsbok', 'Andre Samuelsbok'],
	['1 Kong', '1 Kong', 'Første Kongebok', 'Første Kongebok'],
	['2 Kong', '2 Kong', 'Andre Kongebok', 'Andre Kongebok'],
	['1 Krøn', '1 Krøn', 'Første Krønikebok', 'Første Krønikebok'],
	['2 Krøn', '2 Krøn', 'Andre Krønikebok', 'Andre Krønikebok'],
	['Esra', 'Esra', 'Esra', 'Esra'],
	['Neh', 'Neh', 'Nehemja', 'Nehemja'],
	['Est', 'Est', 'Ester', 'Ester'],
	['Job', 'Job', 'Job', 'Job'],
	['Sal', 'Sal', 'Salmenes bok', 'Salmane'],
	['Ordsp', 'Ordt', 'Salomos ordspråk', 'Salomos ordtak'],
	['Fork', 'Fork', 'Forkynneren', 'Forkynnaren'],
	['Høys', 'Høgs', 'Høysangen', 'Høgsongen'],
	['Jes', 'Jes', 'Jesaja', 'Jesaja'],
	['Jer', 'Jer', 'Jeremia', 'Jeremia'],
	['Klag', 'Klag', 'Klagesangene', 'Klagesongane'],
	['Esek', 'Esek', 'Esekiel', 'Esekiel'],
	['Dan', 'Dan', 'Daniel', 'Daniel'],
	['Hos', 'Hos', 'Hosea', 'Hosea'],
	['Joel', 'Joel', 'Joel', 'Joel'],
	['Am', 'Am', 'Amos', 'Amos'],
	['Ob', 'Ob', 'Obadja', 'Obadja'],
	['Jona', 'Jona', 'Jona', 'Jona'],
	['Mi', 'Mi', 'Mika', 'Mika'],
	['Nah', 'Nah', 'Nahum', 'Nahum'],
	['Hab', 'Hab', 'Habakkuk', 'Habakkuk'],
	['Sef', 'Sef', 'Sefanja', 'Sefanja'],
	['Hag', 'Hag', 'Haggai', 'Haggai'],
	['Sak', 'Sak', 'Sakarja', 'Sakarja'],
	['Mal', 'Mal', 'Malaki', 'Malaki'],
	['Matt', 'Matt', 'Evangeliet etter Matteus', 'Evangeliet etter Matteus'],
	['Mark', 'Mark', 'Evangeliet etter Markus', 'Evangeliet etter Markus'],
	['Luk', 'Luk', 'Evangeliet etter Lukas', 'Evangeliet etter Lukas'],
	['Joh', 'Joh', 'Evangeliet etter Johannes', 'Evangeliet etter Johannes'],
	['Apg', 'Apg', 'Apostlenes gjerninger', 'Apostelgjerningane'],
	['Rom', 'Rom', "Paulus' brev til romerne", "Paulus' brev til romarane"],
	['1 Kor', '1 Kor', "Paulus' første brev til korinterne", "Paulus' første brev til korintarane"],
	['2 Kor', '2 Kor', "Paulus' andre brev til korinterne", "Paulus' andre brev til korintarane"],
	['Gal', 'Gal', "Paulus' brev til galaterne", "Paulus' brev til galatarane"],
	['Ef', 'Ef', "Paulus' brev til efeserne", "Paulus' brev til efesarane"],
	['Fil', 'Fil', "Paulus' brev til filipperne", "Paulus' brev til filipparane"],
	['Kol', 'Kol', "Paulus' brev til kolosserne", "Paulus' brev til kolossarane"],
	['1 Tess', '1 Tess', "Paulus' første brev til tessalonikerne", "Paulus' første brev til tessalonikarane"],
	['2 Tess', '2 Tess', "Paulus' andre brev til tessalonikerne", "Paulus' andre brev til tessalonikarane"],
	['1 Tim', '1 Tim', "Paulus' første brev til Timoteus", "Paulus' første brev til Timoteus"],
	['2 Tim', '2 Tim', "Paulus' andre brev til Timoteus", "Paulus' andre brev til Timoteus"],
	['Tit', 'Tit', "Paulus' brev til Titus", "Paulus' brev til Titus"],
	['Filem', 'Filem', "Paulus' brev til Filemon", "Paulus' brev til Filemon"],
	['Hebr', 'Hebr', 'Brevet til hebreerne', 'Brevet til hebrearane'],
	['Jak', 'Jak', 'Jakobs brev', 'Jakobs brev'],
	['1 Pet', '1 Pet', 'Peters første brev', 'Peters første brev'],
	['2 Pet', '2 Pet', 'Peters andre brev', 'Peters andre brev'],
	['1 Joh', '1 Joh', "Johannes' første brev", "Johannes' første brev"],
	['2 Joh', '2 Joh', "Johannes' andre brev", "Johannes' andre brev"],
	['3 Joh', '3 Joh', "Johannes' tredje brev", "Johannes' tredje brev"],
	['Jud', 'Jud', "Judas' brev", "Judas' brev"],
	['Åp', 'Op', "Johannes' åpenbaring", "Johannes' openberring"]
];

/** Rådata som oppslagsliste: [{ nbFork, nnFork, nbNavn, nnNavn }, ...] */
export const BOKER_TABELL = RADER.map(([nbFork, nnFork, nbNavn, nnNavn]) =>
	({ nbFork, nnFork, nbNavn, nnNavn }));

const MAP = { nb: {}, nn: {} };
for (const [nbFork, nnFork, nbNavn, nnNavn] of RADER) {
	MAP.nb[nbFork.toLowerCase()] = nbNavn;
	MAP.nn[nnFork.toLowerCase()] = nnNavn;
}

// Regex per språk: forkortelsen først i strengen, fulgt av mellomrom eller slutten
// (lengste først, så «1 Joh» slår «Joh» og «Høys» ikke matches midt i «Høysangen»)
const RE = {};
for (const sprak of ['nb', 'nn']) {
	const nokler = Object.keys(MAP[sprak]).sort((a, b) => b.length - a.length);
	RE[sprak] = new RegExp('^(' + nokler.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')(?=$|\\s)', 'i');
}

/** Slå opp en bibelbok ut fra referansens forkortelse («1 Mos 3,15-20»).
 *  Returnerer { navn, kapittel } (kapittel = '' hvis referansen ikke har vers) eller null. */
export function bibelBok(ref, sprak = 'nb') {
	if (!ref || typeof ref !== 'string') return null;
	const m = RE[sprak].exec(ref.trim());
	if (!m) return null;
	const rest = ref.trim().slice(m[1].length).trim();
	// kapittelet = tallet før første komma/punktum/dash («3,15-20» → «3», «Sal 68» → «68»)
	const kapittel = rest ? rest.split(/[,;.:–—-]/)[0].replace(/\.$/, '') : '';
	return { navn: MAP[sprak][m[1].toLowerCase()], kapittel };
}

/** Referansen som alminnelig tekst for innledninger: «1 Mos 3,15-20» → «Første Mosebok, kapittel 3».
 *  Ukjent referanse returneres uendret. For evangelietekst er bokens navn uten
 *  «Evangeliet etter» (innledningen har «evangeliet etter» forfra). */
export function innledningsNavn(ref, sprak = 'nb', evangelium = false) {
	const bok = bibelBok(ref, sprak);
	if (!bok) return ref;
	let navn = bok.navn;
	if (evangelium) navn = navn.replace(/^Evangeliet etter /, '');
	return bok.kapittel ? navn + ', kapittel ' + bok.kapittel : navn;
}
