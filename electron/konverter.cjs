#!/usr/bin/env node
/**
 * konverter.cjs — offline konvertering docx/pdf → .limal-mal (hovedprosessen).
 * Port av liturgi-limal-skill/scripts/konverter-liturgi.mjs. Ingen
 * node-avhengigheter: docx leses med systemets unzip; pdf med pdftotext →
 * pypdf (python3) → macOS PDFKit/JXA. Heuristisk — resultatet skal
 * kontrolleres i appen.
 */
const { execFileSync } = require('node:child_process');
const path = require('node:path');

let idTeller = 0;
const uid = (prefiks = 'i') =>
  prefiks + '-' + Date.now().toString(36) + '-' + (idTeller++);
const trim = (s) => (s ?? '').replace(/\s+/g, ' ').trim();
const DEKOD = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'", '&nbsp;': ' ' };
const dekodXml = (s) => s.replace(/&(amp|lt|gt|quot|apos|nbsp);/g, (m) => DEKOD[m] ?? m);

// ---------- klassifiseringshjelpere (docx og pdf) ----------

const erRubrikkTekst = (t) => /^(ved |her |her, |eller$|evt\.|ev\.|jfr\.|jf\.|før[,.\s]|etter |under |mens |om\b|\()/i.test(t) && t.length < 160;
const erBibelref = (t) => /^(BIBELREF\s*\|\s*)?(\d?\s?)?[A-ZÆØÅ][a-zæøå]+\.?\s\d+(\s?[,;–-]\s?\d+)*([a-z])?(\s*[.,])?$/.test(trim(t));
const rolleRe = /^([A-Z]{1,4}(?:\/[A-Z]{1,4})*)\s*\|\s?/;
const erLeddTittel = (t) => /^\*?\s?\d+\.\s+\S/.test(t) && t.length < 80;

/** Sidetall fra pdf-eksport («1/ 16», «13 /16»). */
const erSidetall = (t) => /^\d+\s*\/\s*\d+$/.test(t);

/** Opphavsrett: «T 1973 Britt…», «M ©…», «O Tilbokmål1974…», «© Norsk Musikforlag…». */
const erCopyright = (t) => t.startsWith('©')
  || (/^[TMO]\s/.test(t) && /\d{4}|©/.test(t));

/** Salmemerke: «N13   591   Det skjer et under … v.1-3» eller «(N13  638) …». */
function salmeFraLinje(t) {
  let m = t.match(/^N\d{1,2}\s+(\d{1,4})\s+(.+)$/);
  if (m) return { nr: m[1], tittel: m[2] };
  m = t.match(/^(.*?)\s*\(N\d{1,2}\s+(\d{1,4})\)\s*(.*)$/);
  if (m) return { nr: m[2], tittel: trim(trim(m[1] + ' ' + m[3])) || m[1] };
  return null;
}

/** Hoveddel i versaler: «I.SAMLING», «I. SAMLING», «II. ORDET», «DÅP». */
const erVersalHoveddel = (t) => {
  const s = trim(t);
  if (s.length < 2 || s.length > 40) return false;
  if (s !== s.toUpperCase()) return false;
  return /^[IVXLC]+\.\s*[A-ZÆØÅ]/.test(s) || /^[IVXLC]{2,}\s+[A-ZÆØÅ]/.test(s) || /^[A-ZÆØÅ]+$/.test(s);
};
const normaliserVersalHoveddel = (t) =>
  trim(t).replace(/^([IVXLC]+)\.\s*(?=[A-ZÆØÅ])/, '$1. ');

/** Rolle uten/med skille: «L | …», «L  …», «ML/L: …», «Prest:», «Prest   …»,
 *  «Klokker / dåpsfølge  …». «Alle synger» er ikke en rolle. */
const ROLLEORD = new Set(['Alle', 'Prest', 'Liturg', 'Klokker', 'Medliturg', 'Menighet', 'Organist', 'Kirketjener', 'Dåpsfølge', 'Kor', 'Korett']);
function finnRolle(t) {
  const m = t.match(/^([A-ZÆØÅ][A-Za-zæøå]*(?:\s*\/\s*[A-Za-zæøå]+)*)(\s*[|:]|\s+)\s*(.*)$/);
  if (!m) return null;
  const ord = m[1].replace(/\s+/g, '');
  const skille = m[2].trim();
  const rest = m[3] ?? '';
  const erBokstaver = /^[A-ZÆØÅ]{1,4}(\/[A-ZÆØÅ]{1,4})*$/.test(ord);
  // flerdels-roller («Klokker/dåpsfølge») — alle deler må være rolleord
  const erOrdr = ord.split('/').every((d) => ROLLEORD.has(d) || [...ROLLEORD].some((r) => r.toLowerCase() === d.toLowerCase()));
  if (ord === 'I') return null; // «I dåpen …», «I Faderens navn» — ikke rolle
  if (!erBokstaver && !erOrdr) return null;
  if (ord === 'Alle' && /^synger\b/i.test(rest)) return null;
  // ordrroller krever kolon/strek, minst dobbelt mellomrom («Prest   …»,
  // «Klokker  …») eller enkeltmellomrom + stor forbokstav («Prest Ære være …»);
  // enbokstavsroller («L …», «A …») aksepteres med ett mellomrom
  if (!erBokstaver && !/[|:]/.test(skille) && m[2].length < 2 && !/^[A-ZÆØÅ]/.test(rest)) return null;
  // «Å leve sammen …» — enbokstavsrolle med ett mellomrom og små forbokstav er setningsstart
  if (erBokstaver && ord.length === 1 && !/[|:]/.test(skille) && m[2].length < 2 && !/^[A-ZÆØÅ]/.test(rest)) return null;
  return { rolle: ord, rest };
}

/** Bibelreferanse klebet på slutten av en tekstlinje («… liv.Joh3,16»). */
function refPaaSlutt(t) {
  const m = t.match(/([\s.»]|([a-zæøå]))([1-3]?\s?[A-ZÆØÅ][a-zæøå]+\.?\s*\d+(?:\s?[,;–-]\s?\d+)*[a-z]?)$/);
  if (!m) return null;
  const ref = trim(m[3]).replace(/^([1-3]?)\s*([A-ZÆØÅ][a-zæøå]+)\.?\s*(\d)/, (a, kap, bok, siffer) => (kap ? kap + ' ' : '') + bok + ' ' + siffer);
  const grense = m[2] ? trim(t.slice(0, m.index + 1)) + ' ' : trim(t.slice(0, m.index + 1));
  return { foran: grense, ref };
}

/** Leddtittel i ren tekst: kort linje uten avsluttende tegn. Siffer-start
 *  (salmevers «1 Måne og sol …») og refs er aldri titler. Hele
 *  parenteser («(x2)») er rubrikk — men «Hallelujaomkved (977.4 …)» er tittel. */
const erTittelLinje = (t) => t.length >= 2 && t.length <= 60
  && !/^\d/.test(t)
  && !/^\(.*\)$/.test(t)
  && !/^(BIBELREF|[a-zæøå]{2,}\.?\s?\d+(?:[,–-]\d+)*)$/i.test(t)
  && !/[.,:;!?»]$/.test(t);

// ---------- docx-parsing (unzip + XML) ----------
// docx = zip: prøv systemets unzip, fall tilbake til python3 (zipfile)
function hentDocxXml(fil) {
  try {
    return execFileSync('unzip', ['-p', fil, 'word/document.xml'], { maxBuffer: 64 * 1024 * 1024 }).toString('utf8');
  } catch {}
  try {
    return execFileSync('python3', ['-c',
      "import sys, zipfile; z = zipfile.ZipFile(sys.argv[1]); sys.stdout.buffer.write(z.read('word/document.xml'))",
      fil], { maxBuffer: 64 * 1024 * 1024 }).toString('utf8');
  } catch {}
  throw new Error('Klarte ikke lese docx: verken \u00abunzip\u00bb eller \u00abpython3\u00bb er tilgjengelig p\u00e5 systemet. Installer unzip (brew install unzip) og prøv igjen.');
}

function lesDocx(fil) {
  const xml = hentDocxXml(fil);
  const avsnitt = [];
  const pRe = /<w:p\b[^>]*>[\s\S]*?<\/w:p>/g;
  let m;
  while ((m = pRe.exec(xml)) !== null) {
    const p = m[0];
    const stil = ((p.match(/<w:pStyle w:val="([^"]+)"/) ?? [])[1] ?? '').toLowerCase().replace(/\s+/g, '');
    const runs = [];
    const rRe = /<w:r\b[^>]*>([\s\S]*?)<\/w:r>/g;
    let rm;
    while ((rm = rRe.exec(p)) !== null) {
      const r = rm[1];
      const tekst = (r.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g) ?? [])
        .map((t) => t.replace(/<[^>]+>/g, '')).join('');
      if (!tekst) continue;
      const bold = /<w:b\/>|<w:b /.test(r) && !/<w:b w:val="0"/.test(r);
      const italic = /<w:i\/>|<w:i /.test(r) && !/<w:i w:val="0"/.test(r);
      runs.push({ tekst: dekodXml(tekst).replace(/\uF058/g, '\u271d'), bold, italic });
    }
    if (!runs.length && !/<w:pStyle/.test(p)) continue;
    avsnitt.push({ stil, runs, tekst: trim(runs.map((r) => r.tekst).join('')) });
  }
  return avsnitt;
}

// ---------- pdf-parsing ----------
// Førstevalg: pdftotext (poppler) → pypdf layout-modus (python3) → macOS
// PDFKit via JXA (osascript). pypdf layout-modus gir best kolonnestruktur
// for Word-eksporterte liturgier.
const PDFKIT_JXA = 'ObjC.import("PDFKit"); function run(argv){ const doc = $.PDFDocument.alloc.initWithURL($.NSURL.fileURLWithPath(argv[0])); if (doc.isNil()) return ""; const n = doc.pageCount; let ut = []; for (let i=0;i<n;i++){ const s = doc.pageAtIndex(i).string; ut.push(s ? ObjC.unwrap(s) : ""); } return ut.join("\\n"); }';
const PYPDF_KODE = [
  'import sys',
  'try:',
  '    from pypdf import PdfReader',
  'except Exception:',
  '    sys.exit(3)',
  'r = PdfReader(sys.argv[1])',
  'ut = []',
  'for p in r.pages:',
  '    try: ut.append(p.extract_text(extraction_mode="layout"))',
  '    except Exception: ut.append("")',
  "print('\\n'.join(ut))"
].join('\n');

function lesPdf(fil) {
  let txt = null;
  try {
    txt = execFileSync('pdftotext', ['-layout', fil, '-'], { maxBuffer: 64 * 1024 * 1024 }).toString('utf8');
  } catch (err) {
    if (err?.code !== 'ENOENT') throw err;
    try {
      txt = execFileSync('python3', ['-c', PYPDF_KODE, fil], { maxBuffer: 64 * 1024 * 1024 }).toString('utf8');
    } catch (err2) {
      if (err2?.status !== 3) throw err2;
      txt = execFileSync('osascript', ['-l', 'JavaScript', '-e', PDFKIT_JXA, fil], { maxBuffer: 64 * 1024 * 1024 }).toString('utf8');
    }
  }
  return txt.split('\n')
    .map((l) => ({ stil: '', runs: [{ tekst: l, bold: false, italic: false }], tekst: trim(l) }))
    .filter((p) => p.tekst.length > 0);
}

// ---------- heuristisk strukturbygging ----------
function byggStruktur(avsnitt, advarsler) {
  const seksjoner = [];
  let sec = null;
  let item = null;
  let forrigeTekst = ''; // forrige ikke-tomme linje (for tittprediksjon)
  let forrigeVarTittel = false;
  let settHoveddel = false;

  const nySeksjon = (tittel) => {
    sec = { title: trim(tittel), items: [] };
    seksjoner.push(sec);
    item = null;
    settHoveddel = true;
  };
  const nyttLedd = (heading, type = 'tekst') => {
    if (!sec) nySeksjon('Uten tittel');
    item = { id: uid(), type, heading: heading ?? '', instr: '', text: '', alts: [], selAlt: 0, enabled: true, optional: false, salmeNr: '', salmeTittel: '' };
    sec.items.push(item);
  };
  const leggTilTekst = (linje) => {
    if (!item) nyttLedd('');
    item.text += (item.text ? '\n' : '') + linje;
  };

  for (let pi = 0; pi < avsnitt.length; pi++) {
    const p = avsnitt[pi];
    const t = p.tekst;
    if (!t) {
      // bevare tomme linjer mellom avsnitt (vers/refreng og øvrige avsnitt)
      if (item && item.text && !item.text.endsWith('\n')) item.text += '\n';
      forrigeTekst = '';
      continue;
    }
    const stil = p.stil || '';
    const forste = p.runs[0] ?? { bold: false, italic: false };
    const erRubrikkStil = stil === 'rubrikk' || stil === 'rubrikk1' || (forste.italic && !forste.bold);
    // UNNTAK fra @NOTAT: linjer som viser til et forslag («Det kan sies …»,
    // «Her kan liturgen si …», «til dømes …») og etterfølges av et avsnitt
    // med rolleformatering er vanlig tekst — rollen hører til forslaget.
    let nesteRolle = false;
    for (let ni = pi + 1; ni < avsnitt.length; ni++) {
      if (!avsnitt[ni].tekst) continue;
      nesteRolle = !!finnRolle(avsnitt[ni].tekst) || rolleRe.test(avsnitt[ni].tekst);
      break;
    }
    const rubrikk = erRubrikkStil || /^\(/.test(t) || (erRubrikkTekst(t) && !nesteRolle);

    // 1) toppmetadata før første hoveddel («Sted: …», «Dåp: Ja», «Gudstjeneste - …»)
    const erStilHoveddel = stil === 'heading1' || stil === 'heading 1' || stil === 'overskrift1' || stil === 'tittel1' || stil === 'tittel 1';
    if (!settHoveddel && !erStilHoveddel && !erVersalHoveddel(t) && /^[A-ZÆØÅ][a-zæøå]+(?:\s+[a-zæøå]+)*\s*[:\-–]/.test(t)) { forrigeTekst = ''; continue; }

    // 2) sidetall («1/ 16») — hopp over
    if (erSidetall(t)) { forrigeTekst = ''; continue; }

    // 3) opphavsrett («T 1973 …», «M ©…», «© Norsk Musikforlag…») → @COPYRIGHT.
    //    I salmer er T/M/O ALLTID kreditering (T = tekstforfatter, M = melodiforfatter,
    //    O = oversetter) — aldri roller.
    if (erCopyright(t) || (item?.type === 'salme' && /^[TMO]\s/.test(t))) {
      if (item) item.text += (item.text ? '\n' : '') + '@COPYRIGHT | ' + t;
      forrigeTekst = ''; continue;
    }

    // 4) salme («N13 591 Det skjer … v.1-3», «Velsignelsessang (N13 638) …»)
    const salme = salmeFraLinje(t);
    if (salme) {
      const tittel = trim((salme.tittel ?? '').replace(/\s*v\.?\s?\d+(\s*-\s*\d+)?\s*$/i, ''));
      nyttLedd('', 'salme');
      item.salmeNr = salme.nr;
      item.salmeTittel = tittel || salme.nr;
      forrigeTekst = ''; continue;
    }

    // 5) hoveddel: overskrifts-stiler (docx) eller versal-linjer (pdf)
    if (erStilHoveddel || erVersalHoveddel(t)) {
      // nummererte overskrifter («1 | Mottakelse …») = leddtittler; tittel
      // uten nummer = ny hoveddel
      if (/^\*?\s?\d+/.test(t) && sec && !erVersalHoveddel(t)) {
        nyttLedd(t.replace(/\s*\|\s*/g, ' ').replace(/^\*?\s?/, ''));
        forrigeTekst = ''; continue;
      }
      nySeksjon(erVersalHoveddel(t) && !erStilHoveddel ? normaliserVersalHoveddel(t) : t.replace(/\s*\|\s*/g, ' '));
      forrigeTekst = ''; continue;
    }

    // 6) leddtittel med nummer («2. Hilsen») eller heading-stiler
    if (stil === 'heading2' || stil === 'heading 2' || stil === 'heading3' || stil === 'heading 3' || stil === 'overskrift2' || stil === 'overskrift3' || erLeddTittel(t)) {
      nyttLedd(t.replace(/\s*\|\s*/g, ' ').replace(/^\*?\s?/, ''));
      forrigeTekst = ''; continue;
    }

    // 7) bibelreferanse som egen linje → sist i forrige ledd (før
    //    heading-sjekkene — «1 Pet 1,3»/«neh 9,19-21» starter ellers som tittel)
    const erRefLinje = erBibelref(t) || /^[a-zæøå]{2,}\.?\s?\d+(\s?[,;–-]\s?\d+)*$/.test(t);
    if (erRefLinje) {
      const ref = trim(t.replace(/^BIBELREF\s*\|\s*/i, ''));
      if (item) item.text += '\nBIBELREF | ' + ref;
      forrigeTekst = ''; continue;
    }

    // 7b) Enten/Enten A/enten 1/eller/ELLER B-standalone-linjer → leddheading
    //     (må komme før rubrikk-regelen — italics-rubrikker ellers havner som
    //     @NOTAT i instr og grupperEllerLedd får aldri gruppet)
    if (/^(enten|anten|eller)(\s+[A-Za-z0-9]+)?[.:]?$/i.test(t)) {
      const tittel = t.replace(/[.:]$/, '');
      nyttLedd(tittel[0].toUpperCase() + tittel.slice(1));
      forrigeVarTittel = true;
      continue;
    }

    // 8) rubrikker → instr
    if (rubrikk) {
      const linje = '@NOTAT ' + t;
      if (item) {
        item.instr = item.instr ? item.instr + '\n' + linje : linje;
      } else {
        nyttLedd('', 'instruks');
        item.instr = linje;
      }
      forrigeTekst = ''; continue;
    }

    // 9) rolle («L | …», «Prest:», «Klokker / dåpsfølge  …»). Rollelinjer
    //    hører til leddet de står i — i malene er leddgrensene titler, ikke
    //    rolleskifter (sml. seed-malene der ett ledd kan ha L- + ML/L-linjer).
    const rolle = finnRolle(t);
    if (rolle) {
      if (!item || item.type !== 'tekst') nyttLedd('');
      item.text += (item.text ? '\n' : '') + '{{r}}' + rolle.rolle + ' |{{/r}} ' + rolle.rest;
      forrigeTekst = t; // rollens tekstlinjer fortsetter — neste linje er ikke tittel
      continue;
    }

    // 10) leddtittel i ren tekst: kort linje uten avsluttende tegn, etter
    //     blank/punkt-slutt/annen tittel. «Omkved»/«Refreng» og vers i
    //     salmer er tekst. Ref klebt på tittelen («Evangelium: Matt 6,24-34»)
    //     flyttes ut som BIBELREF; leser-angivelse («Første lesning
    //     v/klokker: Neh 9,19-21») ryddes — v/del + ref blir BIBELREF.
    const grense = !forrigeTekst || /[.!?»]$/.test(forrigeTekst) || /^Amen\.?$/.test(forrigeTekst) || forrigeVarTittel;
    const erOmkved = /^(omkved|refreng|amen)\.?$/i.test(t);
    if (!erOmkved && item?.type !== 'salme' && !rolleRe.test(t) && grense && erTittelLinje(t)) {
      let tittel = t.replace(/\s*\|\s*/g, ' ');
      let tittelRef = null;
      // «… v/klokker: Neh 9,19-21» — leser-angivelse + ref etter tittelen
      const lesning = tittel.match(/^(.*?)\s+v\/[A-Za-zæøå]+\s*:?\s+([1-3]?\s?[A-ZÆØÅ][a-zæøå]+\.?\s+\d+(?:\s?[,;–-]\s?\d+)*[a-z]?)\s*$/);
      if (lesning) {
        tittel = trim(lesning[1]);
        tittelRef = trim(lesning[2]).replace(/^([1-3]?)\s*([A-ZÆØÅ][a-zæøå]+)\.?\s+(\d)/, (a, kap, bok, siffer) => (kap ? kap + ' ' : '') + bok + ' ' + siffer);
      } else {
        const tRef = refPaaSlutt(tittel);
        if (tRef?.foran) {
          tittel = tRef.foran.replace(/[:\s]+$/, '');
          tittelRef = tRef.ref;
        }
      }
      nyttLedd(tittel);
      if (tittelRef) item.text = 'BIBELREF | ' + tittelRef;
      forrigeVarTittel = true;
      continue;
    }
    forrigeVarTittel = false;

    // 11) vanlig tekst — bibelref klebet på slutten flyttes ut som BIBELREF
    const ref = refPaaSlutt(t);
    if (ref && ref.foran) {
      leggTilTekst(ref.foran);
      leggTilTekst('BIBELREF | ' + ref.ref);
      forrigeTekst = ref.foran; // grense for neste tittel
    } else {
      leggTilTekst(t);
      forrigeTekst = t;
    }
  }

  // rydd: ref-headinger uten egen tekst («Sal 118,1.24» som docx-heading
  // etter en lesning) slås inn i forrige ledd som BIBELREF-linje
  for (const sekn of seksjoner) {
    for (let i = sekn.items.length - 1; i > 0; i--) {
      const it = sekn.items[i];
      if (!(it.text ?? '').trim() && !(it.alts ?? []).length && erBibelref(it.heading ?? '') && (sekn.items[i - 1].text ?? '').trim()) {
        sekn.items[i - 1].text += '\nBIBELREF | ' + trim(it.heading.replace(/^BIBELREF\s*\|\s*/i, ''));
        sekn.items.splice(i, 1);
      }
    }
  }

  // rydd: tomme seksjoner (behold titler som ser ut som struktur)
  const ut = seksjoner.filter((s) => s.items.length || /samling|ordet|nattverd|sendelse|velsign/i.test(s.title));
  if (!ut.length) advarsler.push('Fant ingen innhold å konvertere.');
  return ut;
}

/** Refreng-formatering: «Omkved»/«Refreng»-linjen + teksten til neste vers
 *  pakkes i {{refreng}}…{{/refreng}} (kursiv i visningen — samme struktur
 *  som malene bruker). Vers gjenkjennes på ledende siffer. */
function pakkRefrenger(salmeTekst) {
  const linjer = salmeTekst.split('\n');
  const ut = [];
  let i = 0;
  while (i < linjer.length) {
    const l = linjer[i];
    if (/^(omkved|refreng)\b:?$/i.test(l.trim())) {
      const blokk = [l];
      i++;
      while (i < linjer.length && !/^\d/.test(linjer[i].trim()) && !/^(omkved|refreng)\b:?$/i.test(linjer[i].trim())) {
        blokk.push(linjer[i]);
        i++;
      }
      while (blokk.length && !blokk[blokk.length - 1].trim()) blokk.pop();
      ut.push('{{refreng}}');
      ut.push(...blokk);
      ut.push('{{/refreng}}');
    } else {
      ut.push(l);
      i++;
    }
  }
  return ut.join('\n');
}

/** Konverter docx/pdf → mal-objekt. Kaster med lesbar feil ved problemer. */
// ---------- grupper 'Eller'-ledd til alts[] ----------
// Heuristiske konverteringer lar variant-ledd stå som egne ledd med
// heading «Eller» / «Eller B». Grupper dem inn i forrige ledd som
// alts[] (label = suffikset, ellers A/B/C…), slik originalmalene gjør det.
// ---------- felles innledning/avslutning på alternativgrupper ----------
// Når alle alternativene deler første- og/eller siste-linjer («La oss be.» /
// «Amen.»), løftes de ut som introAlts/avslutningAlts — samme struktur som
// originalmalene (label «Innledning»/«Avslutning», selIntro/selAvsl).
function fellesLinjer(tekster, fraStart) {
  if (tekster.length < 2) return 0;
  const delte = tekster.map((t) => (t ?? '').split('\n'));
  const kortest = Math.min(...delte.map((d) => d.length));
  let ant = 0;
  for (let i = 0; i < kortest; i++) {
    const verdier = delte.map((d) => (fraStart ? d[i] : d[d.length - 1 - i]).trim());
    if (new Set(verdier).size !== 1) break;
    ant++;
  }
  return ant;
}

function trekkUtIntroAvslutning(item) {
  const alts = item.alts ?? [];
  if (alts.length < 2) return;
  if ((item.introAlts ?? []).length || (item.avslutningAlts ?? []).length) return;
  const tekster = alts.map((a) => a.text ?? '');
  const minLen = Math.min(...tekster.map((t) => t.split('\n').length));
  const p = fellesLinjer(tekster, true);
  let s = fellesLinjer(tekster, false);
  if (p + s > minLen) s = Math.max(0, minLen - p);
  if (p + s >= minLen) return; // alt innhold er felles — ingen reelle varianter
  const delte = tekster.map((t) => (t ?? '').split('\n'));
  const midt = delte.map((d, idx) => d.slice(p, d.length - s).join('\n').trim());
  if (midt.some((m) => !m)) return; // minst ett alternativ ville blitt tomt
  if (p > 0) item.introAlts = [{ label: 'Innledning', text: delte[0].slice(0, p).join('\n') }];
  if (s > 0) item.avslutningAlts = [{ label: 'Avslutning', text: delte[0].slice(delte[0].length - s).join('\n') }];
  for (let idx = 0; idx < alts.length; idx++) alts[idx].text = midt[idx];
  item.text = '';
  item.selAlt = item.selAlt ?? 0;
  item.selIntro = 0;
  item.selAvsl = 0;
}

function grupperEllerLedd(seksjoner) {
  for (const sec of seksjoner) {
    const items = sec.items ?? [];
    const ut = [];
    for (const it of items) {
      const h = (it.heading ?? '').trim();
      // Bokmål: «Eller» / «Eller B» / «Enten …». Nynorsk: «anten …» / «eller …».
      // Alt som starter med enten/anten/eller (eller er nøyaktig «Eller B»)
      // er en variant av forrige egnete ledd.
      const m = /^Eller(?:\s+([A-Z0-9]+))?\.?$/i.exec(h);
      const mV = /^(?:enten|anten|eller)\s+\S/i.exec(h);
      let slukt = false;
      if ((m || mV) && ut.length) {
        const base = ut[ut.length - 1];
        // nummererte leddheadinger («4 Samlingsbønn», «9 Første lesning») er
        // malens skjelett — de skal aldri slukes som varianter. UNNTAK: rene
        // «Enten A»/«Eller B»-par (mV) hører til nummererte ledd i gravferds-
        // og vigselordningene — bare den bare «Eller»-formen holdes unna.
        const nummerert = /^\d+[\s.]/.test((base.heading ?? '').trim());
        const egnet = base.type !== 'salme' && (mV || !nummerert) && ((base.text ?? '').trim() || (base.alts ?? []).length);
        // tom tittelledd (kun heading, ingen tekst): variantene som følger
        // hører til denne — de blir alts[] uten at tittelen blir en variant
        const tomTittel = !egnet && base.type !== 'salme' && !(base.text ?? '').trim() && !(base.alts ?? []).length && (base.heading ?? '').trim();
        if (egnet) {
          if (!(base.alts ?? []).length) {
            base.alts = [{ label: 'A', text: base.text ?? '' }];
            base.selAlt = 0;
          }
          const label = String.fromCharCode(65 + base.alts.length); // sekvensiell A/B/C…
          base.alts.push({ label, text: it.text ?? '' });
          slukt = true;
        } else if (tomTittel && (it.text ?? '').trim()) {
          if (!(base.alts ?? []).length) base.alts = [];
          const label = String.fromCharCode(65 + base.alts.length);
          base.alts.push({ label, text: it.text ?? '' });
          base.selAlt = 0;
          slukt = true;
        }
      }
      if (!slukt) ut.push(it);
    }
    sec.items = ut;
  }
}

// ---------- grupper leddserier (X a, X b, … X g) til alts[] ----------
// Kildedokumenter nummererer noen ganger varianter med slutt-bokstav i
// headingen («Nattverdsbøn a» … «Nattverdsbøn g»). Tre eller flere
// sammenhengende ledd med samme prefiks og ulik slutt-bokstav blir ett ledd
// med alts[] (label = serienummeret). Teksten i hver variant = leddets tekst
// + eventuelle etterfølgende under-ledd (f.eks. «Allmenn serie …»).
function grupperSerier(seksjoner) {
  for (const sec of seksjoner) {
    const items = sec.items ?? [];
    const ut = [];
    let i = 0;
    while (i < items.length) {
      const m = /^(.*\S)\s+([a-z])$/i.exec((items[i].heading ?? '').trim());
      if (!m) { ut.push(items[i]); i++; continue; }
      const prefiks = m[1].toLowerCase();
      const serier = [{ label: m[2].toUpperCase(), ledd: items[i], sub: [] }];
      let j = i + 1;
      while (j < items.length) {
        const hj = (items[j].heading ?? '').trim();
        const mj = new RegExp('^' + prefiks.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s+([a-z])$', 'i').exec(hj);
        if (mj) { serier.push({ label: mj[1].toUpperCase(), ledd: items[j], sub: [] }); j++; continue; }
        // under-ledd (tom heading eller «Allmenn serie …») tilhører siste serie
        if (serier.length && (!hj || /^Allmenn serie/i.test(hj))) { serier[serier.length - 1].sub.push(items[j]); j++; continue; }
        break;
      }
      if (serier.length < 3) { ut.push(items[i]); i++; continue; }
      // følgende under-ledd (tom-tittel) fordeles til siste serie før neste prefiks
      // holder: en tom tittelledd rett før serien (f.eks. «*21 Takkseiing …»)
      const forrige = ut[ut.length - 1];
      const brukForrige = forrige && !(forrige.text ?? '').trim() && !(forrige.alts ?? []).length && (forrige.heading ?? '').trim() && forrige.type !== 'salme' && !/^\d+[\s.]/.test((forrige.heading ?? '').trim());
      const holder = brukForrige
        ? forrige
        : { type: serier[0].ledd.type ?? 'tekst', heading: prefiks[0].toUpperCase() + prefiks.slice(1), text: '', alts: [], selAlt: 0 };
      for (const ser of serier) {
        let tekst = ser.ledd.text ?? '';
        for (const s of ser.sub) tekst += (tekst ? '\n\n' : '') + (s.text ?? '');
        holder.alts.push({ label: ser.label, text: tekst });
      }
      holder.selAlt = 0;
      if (!brukForrige) ut.push(holder);
      i = j;
    }
    sec.items = ut;
  }
}

function konverterLiturgi(fil, { navn, type, maalform } = {}) {
  const ext = path.extname(fil).toLowerCase();
  const advarsler = [];
  let avsnitt;
  if (ext === '.docx') {
    avsnitt = lesDocx(fil);
  } else if (ext === '.pdf') {
    avsnitt = lesPdf(fil);
  } else {
    throw new Error('Ustøttet filtype (bruk .docx eller .pdf): ' + ext);
  }
  const seksjoner = byggStruktur(avsnitt, advarsler);
  // refreng-formatering i salmer: «Omkved»/«Refreng»-blokker pakkes
  for (const sec of seksjoner) {
    for (const it of sec.items) {
      if (it.type === 'salme' && it.text) it.text = pakkRefrenger(it.text);
    }
  }
  const navn2 = navn ?? path.basename(fil, path.extname(fil));
  const mal = {
    id: navn2.toLowerCase().replace(/[^a-z0-9æøå]+/g, '-').replace(/^-|-$/g, '') || uid('mal'),
    name: navn2,
    malForm: maalform ?? 'bokmål',
    liturgiType: type ?? (/vigsel/i.test(navn2) ? 'vigsel' : /gravferd|bisettelse/i.test(navn2) ? 'gravferd' : 'gudstjeneste'),
    kanGudstjeneste: true,
    sections: seksjoner,
    visInstr: true,
    visRoles: true,
    visSalmeinfo: true
  };
  // tittelside: en første seksjon uten tittel og med ≤1 ledd er dokumentets
  // egen tittelside — den hører ikke med i malen
  while (seksjoner.length && (seksjoner[0].items ?? []).length <= 1 && (!(seksjoner[0].title ?? '').trim() || seksjoner[0].title === 'Uten tittel')) {
    seksjoner.shift();
  }
  grupperEllerLedd(seksjoner);
  grupperSerier(seksjoner);
  for (const sec of seksjoner) for (const it of sec.items ?? []) trekkUtIntroAvslutning(it);
  return { mal, advarsler };
}

module.exports = { konverterLiturgi, byggStruktur, grupperEllerLedd, trekkUtIntroAvslutning };
