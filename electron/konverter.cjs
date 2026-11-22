#!/usr/bin/env node
/**
 * konverter.cjs — offline konvertering docx/pdf → .limal-mal (hovedprosessen).
 * Port av liturgi-limal-skill/scripts/konverter-liturgi.mjs. Ingen
 * node-avhengigheter: docx leses med systemets unzip, pdf med pdftotext
 * (hvis den finnes). Heuristisk — resultatet skal kontrolleres i appen.
 */
const { execFileSync } = require('node:child_process');
const path = require('node:path');

let idTeller = 0;
const uid = (prefiks = 'i') =>
  prefiks + '-' + Date.now().toString(36) + '-' + (idTeller++);
const trim = (s) => (s ?? '').replace(/\s+/g, ' ').trim();
const DEKOD = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'", '&nbsp;': ' ' };
const dekodXml = (s) => s.replace(/&(amp|lt|gt|quot|apos|nbsp);/g, (m) => DEKOD[m] ?? m);

const erRubrikkTekst = (t) => /^(ved |her |her, |eller$|evt\.|ev\.|jfr\.|jf\.|klokke|før|etter|under|mens|om\b)/i.test(t) && t.length < 160;
const erBibelref = (t) => /^(BIBELREF\s*\|\s*)?(\d?\s?)?[A-ZÆØÅ][a-zæøå]+\.?\s\d+(\s?[,;–-]\s?\d+)*([a-z])?(\s*[.,])?$/.test(trim(t));
const rolleRe = /^([A-Z]{1,4}(?:\/[A-Z]{1,4})*)\s*\|\s?/;
const erHoveddelTittel = (t) => /^(?:[IVXLC]+\.\s+\S|[0-9]+\s{1,2}\S)/.test(t)
  || (t === t.toUpperCase() && t.length >= 3 && /[A-ZÆØÅ]/.test(t) && t.split(/\s+/).length <= 6);
const erLeddTittel = (t) => /^\*?\s?\d+\.?\s+\S/.test(t) && t.length < 80;

// ---------- docx-parsing (unzip + XML) ----------
function lesDocx(fil) {
  const xml = execFileSync('unzip', ['-p', fil, 'word/document.xml'], { maxBuffer: 64 * 1024 * 1024 }).toString('utf8');
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
      runs.push({ tekst: dekodXml(tekst), bold, italic });
    }
    if (!runs.length && !/<w:pStyle/.test(p)) continue;
    avsnitt.push({ stil, runs, tekst: trim(runs.map((r) => r.tekst).join('')) });
  }
  return avsnitt;
}

// ---------- pdf-parsing ----------
// Førstevalg: pdftotext (poppler). Fallback: macOS PDFKit via JXA (osascript) —
// følger med operativsystemet, ingen ekstra installasjon.
const PDFKIT_JXA = 'ObjC.import("PDFKit"); function run(argv){ const doc = $.PDFDocument.alloc.initWithURL($.NSURL.fileURLWithPath(argv[0])); if (doc.isNil()) return ""; const n = doc.pageCount; let ut = []; for (let i=0;i<n;i++){ const s = doc.pageAtIndex(i).string; ut.push(s ? ObjC.unwrap(s) : ""); } return ut.join("\\n"); }';

function lesPdf(fil) {
  let txt = null;
  try {
    txt = execFileSync('pdftotext', ['-layout', fil, '-'], { maxBuffer: 64 * 1024 * 1024 }).toString('utf8');
  } catch (err) {
    if (err?.code !== 'ENOENT') throw err;
    txt = execFileSync('osascript', ['-l', 'JavaScript', '-e', PDFKIT_JXA, fil], { maxBuffer: 64 * 1024 * 1024 }).toString('utf8');
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

  const nySeksjon = (tittel) => {
    sec = { title: trim(tittel), items: [] };
    seksjoner.push(sec);
    item = null;
  };
  const nyttLedd = (heading, type = 'tekst') => {
    if (!sec) nySeksjon('Uten tittel');
    item = { id: uid(), type, heading: heading ?? '', instr: '', text: '', alts: [], selAlt: 0, enabled: true, optional: false, salmeNr: '', salmeTittel: '' };
    sec.items.push(item);
  };

  for (const p of avsnitt) {
    const t = p.tekst;
    if (!t) continue;
    const stil = p.stil || '';
    const forste = p.runs[0] ?? { bold: false, italic: false };
    const erRubrikkStil = stil === 'rubrikk' || stil === 'rubrikk1' || (forste.italic && !forste.bold) || erRubrikkTekst(t);

    // bibelreferanse → legg på forrige ledd (før heading-sjekkene —
    // «1 Pet 1,3» starter med siffer og ville ellers blitt en tittel)
    if (erBibelref(t)) {
      const ref = trim(t.replace(/^BIBELREF\s*\|\s*/i, ''));
      if (item) item.text += '\nBIBELREF | ' + ref;
      continue;
    }
    // hoveddel?
    if (stil === 'heading1' || stil === 'heading 1' || stil === 'overskrift1' || stil === 'tittel1' || stil === 'tittel 1' || erHoveddelTittel(t)) {
      // nummererte overskrifter («1 | Mottakelse …») = leddtittler; tittel
      // uten nummer = ny hoveddel
      if (/^\*?\s?\d+/.test(t) && sec) {
        nyttLedd(t.replace(/\s*\|\s*/g, ' ').replace(/^\*?\s?/, ''));
        continue;
      }
      nySeksjon(t.replace(/\s*\|\s*/g, ' '));
      continue;
    }
    // leddtittel?
    if (stil === 'heading2' || stil === 'heading 2' || stil === 'heading3' || stil === 'heading 3' || stil === 'overskrift2' || stil === 'overskrift3' || erLeddTittel(t)) {
      nyttLedd(t.replace(/\s*\|\s*/g, ' ').replace(/^\*?\s?/, ''));
      continue;
    }
    // rubrikk → instr
    if (erRubrikkStil) {
      const linje = '@NOTAT ' + t;
      if (item) {
        item.instr = item.instr ? item.instr + '\n' + linje : linje;
      } else {
        nyttLedd('Rubrikk', 'instruks');
        item.instr = linje;
      }
      continue;
    }
    // salmer («Nr. 504», «504 Vi er barn …»)
    const salme = t.match(/^(?:Nr\.?\s*)?(\d{1,4})\s+([A-ZÆØÅ].{2,60})$/);
    if (salme && !rolleRe.test(t)) {
      nyttLedd('', 'salme');
      item.salmeNr = salme[1];
      item.salmeTittel = salme[2];
      continue;
    }
    // vanlig tekst (ev. rolleprefiks)
    if (!item) nyttLedd('');
    const rm = t.match(rolleRe);
    if (rm && !item.text) {
      item.text += '{{r}}' + rm[1] + ' |{{/r}} ' + t.slice(rm[0].length);
    } else if (rm && item.text) {
      item.text += '\n{{r}}' + rm[1] + ' |{{/r}} ' + t.slice(rm[0].length);
    } else {
      item.text += (item.text ? '\n' : '') + t;
    }
  }
  // rydd: tomme seksjoner (behold titler som ser ut som struktur)
  const ut = seksjoner.filter((s) => s.items.length || /samling|ordet|nattverd|sendelse|velsign/i.test(s.title));
  if (!ut.length) advarsler.push('Fant ingen innhold å konvertere.');
  return ut;
}

/** Konverter docx/pdf → mal-objekt. Kaster med lesbar feil ved problemer. */
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
  return { mal, advarsler };
}

module.exports = { konverterLiturgi, byggStruktur };
