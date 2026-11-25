/**
 *  Oppslag bibelske bøker: forkortet referanse → fullt navn, hentet fra
 *  bibel.no/nettbibelen (nb-2024 og nn-2024, boklistene på /nettbibelen/les/*,
 *  inkl. deuterokanoniske bøker) med engelske aliaser fra
 *  logos.com/bible-book-abbreviations.
 *  Brukes til å «oversette» en referanse som «1 Mos 3,15-20» / «Gen 1,1» til
 *  alminnelig tekst («Første Mosebok, kapittel 1») i innledninger, mens BIBELREF
 *  beholder forkortelsen.
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
	['Åp', 'Op', "Johannes' åpenbaring", "Johannes' openberring"],
	// Deuterokanoniske bøker (bibel.no, begge målformer)
	['Tob', 'Tob', 'Tobit', 'Tobit'],
	['Judit', 'Judit', 'Judit', 'Judit'],
	['Gr Est', 'Gr Est', 'Den greske Ester-boken', 'Den greske Ester-boka'],
	['Visd', 'Visd', 'Visdommen', 'Visdomsboka'],
	['Sir', 'Sir', 'Sirak', 'Sirak'],
	['Bar', 'Bar', 'Baruk', 'Baruk'],
	['Jer br', 'Jer br', 'Jeremias brev', 'Jeremias brev'],
	['1 Makk', '1 Makk', 'Første Makkabeerbok', 'Første Makkabearbok'],
	['2 Makk', '2 Makk', 'Andre Makkabeerbok', 'Andre Makkabearbok']
];

/** Rådata som oppslagsliste: [{ nbFork, nnFork, nbNavn, nnNavn }, ...] */
export const BOKER_TABELL = RADER.map(([nbFork, nnFork, nbNavn, nnNavn]) =>
	({ nbFork, nnFork, nbNavn, nnNavn }));

// Nøkler normaliseres uten punktum («Matt. 6» ≡ «Matt 6», «1. Kor.» ≡ «1 Kor»)
const utenPunktum = (s) => s.toLowerCase().replace(/\./g, '');

const MAP = { nb: {}, nn: {} };
for (const [nbFork, nnFork, nbNavn, nnNavn] of RADER) {
	MAP.nb[utenPunktum(nbFork)] = nbNavn;
	MAP.nn[utenPunktum(nnFork)] = nnNavn;
}

// Aliaser: vanlige skriveformer som skal gi samme oppslag.
//  - «Salme 23» (liturgisk skrivemåte) → Salmenes bok / Salmane
//  - fullt navn som referanse («Jesaja 57,14–16», «Første Mosebok 3,15»)
//  - evangeliene uten «Evangeliet etter» («Lukas 2,41-52»)
for (const [nbFork, nnFork, nbNavn, nnNavn] of RADER) {
	MAP.nb[utenPunktum(nbNavn)] ??= nbNavn;
	MAP.nn[utenPunktum(nnNavn)] ??= nnNavn;
}
for (const kort of ['Matteus', 'Markus', 'Lukas', 'Johannes']) {
	const navn = 'Evangeliet etter ' + kort;
	MAP.nb[utenPunktum(kort)] ??= navn;
	MAP.nn[utenPunktum(kort)] ??= navn;
}
MAP.nb['salme'] ??= 'Salmenes bok';
MAP.nn['salme'] ??= 'Salmane';

// Engelske aliaser (logos.com/bible-book-abbreviations): [alias, kanonisk forkortelse].
// Flertydige apokryfe skrifter som ikke finnes i bibel.no-listen (3–4 Makk,
// 1–2 Esdras, Susanna osv.) er utelatt.
const EN_ALIASER = [
	['Genesis', 'Gen', 'Ge', 'Gn', '1 Mos'],
	['Exodus', 'Ex', 'Exod', 'Exo', '2 Mos'],
	['Leviticus', 'Lev', 'Le', 'Lv', '3 Mos'],
	['Numbers', 'Num', 'Nu', 'Nm', 'Nb', '4 Mos'],
	['Deuteronomy', 'Deut', 'De', 'Dt', '5 Mos'],
	['Joshua', 'Josh', 'Jos', 'Jsh', 'Jos'],
	['Judges', 'Judg', 'Jdg', 'Jg', 'Jdgs', 'Dom'],
	['Ruth', 'Rth', 'Ru', 'Rut'],
	['1 Samuel', '1 Sam', '1 Sm', '1 Sa', '1 S', 'I Sam', 'I Sa', '1Sam', '1Sa', '1S', '1st Samuel', '1st Sam', 'First Samuel', 'First Sam', '1 Sam'],
	['2 Samuel', '2 Sam', '2 Sm', '2 Sa', '2 S', 'II Sam', 'II Sa', '2Sam', '2Sa', '2S', '2nd Samuel', '2nd Sam', 'Second Samuel', 'Second Sam', '2 Sam'],
	['1 Kings', '1 Kgs', '1 Ki', '1Kgs', '1Kin', '1Ki', '1K', 'I Kgs', 'I Ki', '1st Kings', '1st Kgs', 'First Kings', 'First Kgs', '1 Kong'],
	['2 Kings', '2 Kgs', '2 Ki', '2Kgs', '2Kin', '2Ki', '2K', 'II Kgs', 'II Ki', '2nd Kings', '2nd Kgs', 'Second Kings', 'Second Kgs', '2 Kong'],
	['1 Chronicles', '1 Chron', '1 Chr', '1 Ch', '1Chron', '1Chr', '1Ch', 'I Chron', 'I Chr', 'I Ch', '1st Chronicles', '1st Chron', 'First Chronicles', 'First Chron', '1 Krøn'],
	['2 Chronicles', '2 Chron', '2 Chr', '2 Ch', '2Chron', '2Chr', '2Ch', 'II Chron', 'II Chr', 'II Ch', '2nd Chronicles', '2nd Chron', 'Second Chronicles', 'Second Chron', '2 Krøn'],
	['Ezra', 'Ezr', 'Ez', 'Esra'],
	['Nehemiah', 'Neh', 'Ne', 'Neh'],
	['Esther', 'Est', 'Esth', 'Es', 'Est'],
	['Job', 'Jb', 'Job'],
	['Psalms', 'Ps', 'Psalm', 'Pslm', 'Psa', 'Psm', 'Pss', 'Sal'],
	['Proverbs', 'Prov', 'Pro', 'Prv', 'Pr', 'Ordsp'],
	['Ecclesiastes', 'Eccles', 'Eccle', 'Ecc', 'Ec', 'Qoh', 'Fork'],
	['Song of Solomon', 'Song', 'Song of Songs', 'SOS', 'So', 'Canticle of Canticles', 'Canticles', 'Cant', 'Høys'],
	['Isaiah', 'Isa', 'Is', 'Jes'],
	['Jeremiah', 'Jer', 'Je', 'Jr', 'Jer'],
	['Lamentations', 'Lam', 'La', 'Klag'],
	['Ezekiel', 'Ezek', 'Eze', 'Ezk', 'Esek'],
	['Daniel', 'Dan', 'Da', 'Dn', 'Dan'],
	['Hosea', 'Hos', 'Ho', 'Hos'],
	['Joel', 'Jl', 'Joel'],
	['Amos', 'Am', 'Am'],
	['Obadiah', 'Obad', 'Ob', 'Ob'],
	['Jonah', 'Jonah', 'Jnh', 'Jon', 'Jona'],
	['Micah', 'Mic', 'Mc', 'Mi'],
	['Nahum', 'Nah', 'Na', 'Nah'],
	['Habakkuk', 'Hab', 'Hb', 'Hab'],
	['Zephaniah', 'Zeph', 'Zep', 'Zp', 'Sef'],
	['Haggai', 'Hag', 'Hg', 'Hag'],
	['Zechariah', 'Zech', 'Zec', 'Zc', 'Sak'],
	['Malachi', 'Mal', 'Ml', 'Mal'],
	['Matthew', 'Matt', 'Mt', 'Matt'],
	['Mark', 'Mrk', 'Mar', 'Mk', 'Mr', 'Mark'],
	['Luke', 'Luke', 'Luk', 'Lk', 'Luk'],
	['John', 'Joh', 'Jhn', 'Jn', 'Joh'],
	['Acts', 'Acts', 'Act', 'Ac', 'Apg'],
	['Romans', 'Rom', 'Ro', 'Rm', 'Rom'],
	['1 Corinthians', '1 Cor', '1 Co', 'I Cor', 'I Co', '1Cor', '1Co', 'ICorinthians', '1Corinthians', '1st Corinthians', 'First Corinthians', '1 Kor'],
	['2 Corinthians', '2 Cor', '2 Co', 'II Cor', 'II Co', '2Cor', '2Co', 'IICorinthians', '2Corinthians', '2nd Corinthians', 'Second Corinthians', '2 Kor'],
	['Galatians', 'Gal', 'Ga', 'Gal'],
	['Ephesians', 'Eph', 'Ephes', 'Ef'],
	['Philippians', 'Phil', 'Php', 'Pp', 'Fil'],
	['Colossians', 'Col', 'Co', 'Kol'],
	['1 Thessalonians', '1 Thess', '1 Thes', '1 Th', 'I Thessalonians', 'I Thess', 'I Thes', 'I Th', '1Thessalonians', '1Thess', '1Thes', '1Th', '1st Thessalonians', '1st Thess', 'First Thessalonians', 'First Thess', '1 Tess'],
	['2 Thessalonians', '2 Thess', '2 Thes', '2 Th', 'II Thessalonians', 'II Thess', 'II Thes', 'II Th', '2Thessalonians', '2Thess', '2Thes', '2Th', '2nd Thessalonians', '2nd Thess', 'Second Thessalonians', 'Second Thess', '2 Tess'],
	['1 Timothy', '1 Tim', '1 Ti', 'ITimothy', 'I Tim', 'I Ti', '1Timothy', '1Tim', '1Ti', '1st Timothy', '1st Tim', 'First Timothy', 'First Tim', '1 Tim'],
	['2 Timothy', '2 Tim', '2 Ti', 'IITimothy', 'II Tim', 'II Ti', '2Timothy', '2Tim', '2Ti', '2nd Timothy', '2nd Tim', 'Second Timothy', 'Second Tim', '2 Tim'],
	['Titus', 'Tit', 'ti', 'Tit'],
	['Philemon', 'Philem', 'Phm', 'Pm', 'Filem'],
	['Hebrews', 'Heb', 'Hebr'],
	['James', 'James', 'Jas', 'Jm', 'Jak'],
	['1 Peter', '1 Pet', '1 Pe', '1 Pt', '1 P', 'IPet', 'IPt', 'IPe', '1Peter', '1Pet', '1Pe', '1Pt', '1P', 'IPeter', '1st Peter', 'First Peter', '1 Pet'],
	['2 Peter', '2 Pet', '2 Pe', '2 Pt', '2 P', 'IIPet', 'IIPt', 'IIPe', '2Peter', '2Pet', '2Pe', '2Pt', '2P', 'IIPeter', '2nd Peter', 'Second Peter', '2 Pet'],
	['1 John', '1 John', '1 Jhn', '1 Jn', '1 J', '1John', '1Jhn', '1Joh', '1Jn', '1Jo', '1J', 'I John', 'I Jhn', 'I Joh', 'I Jn', 'I Jo', '1st John', 'First John', '1 Joh'],
	['2 John', '2 John', '2 Jhn', '2 Jn', '2 J', '2John', '2Jhn', '2Joh', '2Jn', '2Jo', '2J', 'II John', 'II Jhn', 'II Joh', 'II Jn', 'II Jo', '2nd John', 'Second John', '2 Joh'],
	['3 John', '3 John', '3 Jhn', '3 Jn', '3 J', '3John', '3Jhn', '3Joh', '3Jn', '3Jo', '3J', 'III John', 'III Jhn', 'III Joh', 'III Jn', 'III Jo', '3rd John', 'Third John', '3 Joh'],
	['Jude', 'Jud', 'Jd', 'Jud'],
	['Revelation', 'Rev', 'Re', 'The Revelation', 'Åp'],
	// Apokryfe/deuterokanoniske (engelske former for bøkene bibel.no har)
	['Tobit', 'Tob', 'Tb', 'Tob'],
	['Judith', 'Jth', 'Jdth', 'Jdt', 'Judit'],
	['Additions to Esther', 'Add Esth', 'Add Es', 'Rest of Esther', 'The Rest of Esther', 'AEs', 'AddEsth', 'Gr Est'],
	['Wisdom of Solomon', 'Wisd of Sol', 'Wisdom', 'Wis', 'Ws', 'Visd'],
	['Sirach', 'Sir', 'Sir'],
	['Ecclesiasticus', 'Ecclus', 'Sir'],
	['Baruch', 'Bar', 'Bar'],
	['Letter of Jeremiah', 'Ep Jer', 'Let Jer', 'Ltr Jer', 'LJe', 'Jer br'],
	['1 Maccabees', '1 Macc', '1 Mac', '1Maccabees', '1Macc', '1Mac', '1Ma', '1M', 'I Maccabees', 'I Macc', 'I Mac', 'I Ma', '1st Maccabees', 'First Maccabees', '1 Makk'],
	['2 Maccabees', '2 Macc', '2 Mac', '2Maccabees', '2Macc', '2Mac', '2Ma', '2M', 'II Maccabees', 'II Macc', 'II Mac', 'II Ma', '2nd Maccabees', 'Second Maccabees', '2 Makk']
];
for (const gruppe of EN_ALIASER) {
	const fork = utenPunktum(gruppe[gruppe.length - 1]);
	const rad = RADER.find(([nbFork]) => utenPunktum(nbFork) === fork);
	if (!rad) throw new Error('EN_ALIASER: ukjent forkortelse ' + fork);
	for (const alias of gruppe.slice(0, -1)) {
		MAP.nb[utenPunktum(alias)] ??= rad[2];
		MAP.nn[utenPunktum(alias)] ??= rad[3];
	}
}

// Regex per språk: forkortelsen først i strengen, fulgt av mellomrom eller slutten
// (lengste først, så «1 Joh» slår «Joh» og «Høys» ikke matches midt i «Høysangen»)
const RE = {};
for (const sprak of ['nb', 'nn']) {
	const nokler = Object.keys(MAP[sprak]).sort((a, b) => b.length - a.length);
	RE[sprak] = new RegExp('^(' + nokler.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')(?=$|\\s)', 'i');
}

/** Slå opp en bibelbok ut fra referansens forkortelse («1 Mos 3,15-20»).
 *  Tåler punktum-former («1. Kor. 13, 7-13», «Matt. 6, 25-31») og aliaser
 *  («Salme 23», fullt navn, «Lukas 2,41-52», engelske former som «Gen 1,1»,
 *  «Ps 23», «Rev 21,1»).
 *  Returnerer { navn, kapittel } (kapittel = '' hvis referansen ikke har vers) eller null. */
export function bibelBok(ref, sprak = 'nb') {
	if (!ref || typeof ref !== 'string') return null;
	const s = ref.trim().replace(/\./g, ''); // punktum-former: «1. Kor. 13» ≡ «1 Kor 13»
	const m = RE[sprak].exec(s);
	if (!m) return null;
	const rest = s.slice(m[0].length).trim();
	// kapittelet = tallet før første komma/punktum/dash («3,15-20» → «3», «Sal 68» → «68»)
	const kapittel = rest ? rest.split(/[,;.:–—-]/)[0].replace(/\.$/, '') : '';
	return { navn: MAP[sprak][m[1].toLowerCase()], kapittel };
}

/** Referansen som alminnelig tekst for innledninger: «1 Mos 3,15-20» → «Første Mosebok, kapittel 3».
 *  Ukjent referanse returneres uendret. For evangelietekst er bokens navn uten
 *  «Evangeliet etter» (innledningen har «evangeliet etter» forfra) og kapittelet
 *  føyes til med «i» («Matteus i kapittel 5» — liturgisk form for evangelielesning). */
export function innledningsNavn(ref, sprak = 'nb', evangelium = false) {
	const bok = bibelBok(ref, sprak);
	if (!bok) return ref;
	let navn = bok.navn;
	if (evangelium) navn = navn.replace(/^Evangeliet etter /, '');
	if (!bok.kapittel) return navn;
	return evangelium ? navn + ' i kapittel ' + bok.kapittel : navn + ', kapittel ' + bok.kapittel;
}
