/* Liturgi – gudstjenesteplanlegger */
'use strict';

/* ================= Data & lagring ================= */

const LS_KEY = 'liturgi-store-v1';
let store = { templates: [], services: [] };
let current = null;          // { kind: 'service'|'template', obj }
let dirty = false;

const uid = () => 'i' + Math.random().toString(36).slice(2, 9);

function load() {
  const raw = localStorage.getItem(LS_KEY);
  if (raw) { try { store = JSON.parse(raw); } catch (e) { store = { templates: [], services: [] }; } }
  if (!store.templates) store.templates = [];
  if (!store.services) store.services = [];
}

function persist() {
  localStorage.setItem(LS_KEY, JSON.stringify(store));
  dirty = false;
  renderLists();
  updateMeta();
}

function markDirty() {
  dirty = true;
  updateMeta();
}

/* bygg instans-item fra mal-item */
function instantiate(it) {
  return {
    id: uid(), tplId: it.id || null, type: it.type || 'tekst',
    heading: it.heading || '', optional: !!it.optional,
    text: it.text || '', instr: it.instr || '',
    alts: (it.alts || []).map(a => ({ label: a.label || '', text: a.text || '' })),
    selAlt: null, enabled: true,
    salmeNr: '', salmeTittel: '',
    role: it.role || ''
  };
}

function newServiceFromTemplate(tpl) {
  return {
    id: uid(), kind: 'service', templateId: tpl.id, templateName: tpl.name,
    name: tpl.name, date: '', sections: tpl.sections.map(sec => ({
      title: sec.title, items: sec.items.map(instantiate)
    }))
  };
}

function newBlankTemplate(name) {
  return { id: uid(), kind: 'template', name, sections: [{ title: 'I. Samling', items: [] }] };
}

/* ================= Visning ================= */

const $ = s => document.querySelector(s);
const esc = s => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const TYPE_LABEL = { tekst: 'Tekst', instruks: 'Instruks', salme: 'Salme', lesning: 'Lesning', bønn: 'Bønn' };

function litHtml(text) {
  // "L | tekst" -> rolle markert
  return esc(text).replace(/^(L|ML|M|A|KA|K)\s*\|/gm, '<span class="role">$1</span> |');
}

function renderLists() {
  const sl = $('#service-list'); sl.innerHTML = '';
  const sorted = [...store.services].sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999') || a.name.localeCompare(b.name));
  for (const s of sorted) {
    const li = document.createElement('li');
    if (current && current.kind === 'service' && current.obj.id === s.id) li.classList.add('active');
    li.innerHTML = `<span class="nm">${esc(s.name)}${s.date ? ` <span class="dt">${esc(s.date)}</span>` : ''}</span><button class="del" title="Slett">🗑</button>`;
    li.querySelector('.nm').onclick = () => openService(s.id);
    li.querySelector('.del').onclick = e => { e.stopPropagation(); confirmModal(`Slette «${s.name}»?`, () => {
      store.services = store.services.filter(x => x.id !== s.id); persist();
      if (current && current.obj.id === s.id) closeEditor();
    }); };
    sl.appendChild(li);
  }
  const tl = $('#template-list'); tl.innerHTML = '';
  for (const t of store.templates) {
    const li = document.createElement('li');
    if (current && current.kind === 'template' && current.obj.id === t.id) li.classList.add('active');
    li.innerHTML = `<span class="nm">${esc(t.name)}</span><button class="del" title="Slett">🗑</button>`;
    li.querySelector('.nm').onclick = () => openTemplate(t.id);
    li.querySelector('.del').onclick = e => { e.stopPropagation(); confirmModal(`Slette malen «${t.name}»?`, () => {
      store.templates = store.templates.filter(x => x.id !== t.id); persist();
      if (current && current.obj.id === t.id) closeEditor();
    }); };
    tl.appendChild(li);
  }
}

function updateMeta() {
  const m = $('#ed-meta');
  if (!current) { m.textContent = ''; return; }
  const src = current.kind === 'service' ? `Basert på mal: ${esc(current.obj.templateName || '?')}` : 'Lokal mal (grunnordning)';
  m.innerHTML = src + (dirty ? ' <span class="dirty">• ulagrede endringer</span>' : '');
}

function showDateLine() {
  const d = $('#ed-date').value;
  let el = document.getElementById('ed-date-line');
  if (!el) { el = document.createElement('div'); el.id = 'ed-date-line'; $('#ed-meta').after(el); }
  el.textContent = d ? new Date(d).toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '';
}

function renderEditor() {
  if (!current) return;
  const o = current.obj;
  $('#ed-name').value = o.name;
  $('#ed-date').value = o.date || '';
  showDateLine();
  updateMeta();

  const wrap = $('#sections'); wrap.innerHTML = '';
  const showInstr = $('#opt-instr').checked;
  const showRoles = $('#opt-roles').checked;
  document.body.classList.toggle('hide-roles', !showRoles);

  o.sections.forEach((sec, si) => {
    const secEl = document.createElement('div'); secEl.className = 'section';
    secEl.innerHTML = `
      <div class="sec-head">
        <span class="sec-title">${esc(sec.title)}</span>
        <button data-act="additem" data-si="${si}" title="Legg til ledd her">+ ledd</button>
      </div>`;
    sec.items.forEach((it, ii) => {
      secEl.appendChild(renderItem(it, si, ii, showInstr, showRoles));
    });
    wrap.appendChild(secEl);
  });

  renderAddArea();
}

function renderItem(it, si, ii, showInstr, showRoles) {
  const el = document.createElement('div');
  el.className = 'item' + (it.enabled ? '' : ' off') + (it.optional ? ' opt' : '');
  el.dataset.si = si; el.dataset.ii = ii;

  const tools = `
    <div class="item-tools">
      <button data-act="up" title="Flytt opp">↑</button>
      <button data-act="down" title="Flytt ned">↓</button>
      <button data-act="toggle" title="${it.enabled ? 'Fjern fra denne gudstjenesten' : 'Ta med'}">${it.enabled ? '✕' : '↺'}</button>
      <button data-act="del" title="Slett helt">🗑</button>
    </div>`;

  let head = `<div class="item-head">
      <span class="item-eyebrow">${TYPE_LABEL[it.type] || 'Tekst'}</span>
      <span class="item-title" data-edit="heading">${esc(it.heading)}</span>
      ${tools}
    </div>`;

  let body = '';
  if (showInstr && it.instr) body += `<div class="instr" data-edit="instr">${esc(it.instr)}</div>`;

  if (it.type === 'salme') {
    body += `<div class="salme-row">
      <input class="nr" placeholder="Nr" value="${esc(it.salmeNr)}" data-field="salmeNr">
      <input class="tittel" placeholder="Salmens tittel" value="${esc(it.salmeTittel)}" data-field="salmeTittel">
    </div>`;
  } else if (it.alts && it.alts.length) {
    body += `<div class="alts">` + it.alts.map((a, ai) => `
      <label class="alt ${it.selAlt === ai ? 'sel' : ''}">
        <input type="radio" name="alt-${it.id}" ${it.selAlt === ai ? 'checked' : ''} data-alt="${ai}">
        <span><span class="alt-label">${esc(a.label)} </span><span class="alt-text" data-edit-alt="${ai}">${litHtml(a.text)}</span></span>
      </label>`).join('') + `</div>`;
    if (it.selAlt == null) body += `<div class="instr">Velg et alternativ ⬆</div>`;
  } else if (it.text) {
    body += `<div class="lit-text ${showRoles ? '' : 'plain'}" data-edit="text">${litHtml(it.text)}</div>`;
  }

  el.innerHTML = head + (body ? `<div class="item-body">${body}</div>` : '');
  return el;
}

function renderAddArea() {
  const area = $('#add-area');
  area.innerHTML = `
    <button data-act="addsec">+ Nytt hovedavsnitt</button>
    <button data-act="newalt">+ Alternativ til valgt ledd</button>`;
}

/* ================= Redigering ================= */

function editableText(el, get, set, multiline = true) {
  el.addEventListener('click', () => {
    if (el.querySelector('textarea')) return;
    const cur = get();
    const ta = document.createElement('textarea');
    ta.value = cur; ta.rows = multiline ? Math.max(3, cur.split('\n').length + 1) : 1;
    el.textContent = ''; el.appendChild(ta); ta.focus(); ta.selectionStart = ta.value.length;
    const commit = () => { set(ta.value); markDirty(); renderEditor(); };
    ta.addEventListener('blur', commit);
    ta.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !multiline) { e.preventDefault(); ta.blur(); } if (e.key === 'Escape') { ta.removeEventListener('blur', commit); renderEditor(); } });
  });
}

function flat(si, ii) {
  return current.obj.sections[si].items[ii];
}

function handleDocClick(e) {
  const btn = e.target.closest('button[data-act]');
  if (btn) { handleAction(btn); return; }

  const altRadio = e.target.closest('input[data-alt]');
  if (altRadio) {
    const item = flat(altRadio.closest('.item').dataset.si, altRadio.closest('.item').dataset.ii);
    item.selAlt = +altRadio.dataset.alt; markDirty(); renderEditor(); return;
  }

  const altText = e.target.closest('[data-edit-alt]');
  if (altText) {
    const wrap = altText.closest('.item');
    const item = flat(wrap.dataset.si, wrap.dataset.ii);
    const ai = +altText.dataset.editAlt;
    editableText(altText, () => item.alts[ai].text, v => item.alts[ai].text = v);
    altText.click(); return;
  }

  const field = e.target.closest('input[data-field]');
  if (field) {
    field.addEventListener('change', () => {
      const wrap = field.closest('.item');
      flat(wrap.dataset.si, wrap.dataset.ii)[field.dataset.field] = field.value;
      markDirty();
    }, { once: true });
    return;
  }

  const ed = e.target.closest('[data-edit]');
  if (ed) {
    const wrap = ed.closest('.item');
    const item = flat(wrap.dataset.si, wrap.dataset.ii);
    const key = ed.dataset.edit;
    if (key === 'heading') editableText(ed, () => item.heading, v => item.heading = v, false);
    else editableText(ed, () => item[key], v => item[key] = v);
    ed.click();
  }
}

function handleAction(btn) {
  const act = btn.dataset.act;
  const itemEl = btn.closest('.item');
  const si = itemEl ? +itemEl.dataset.si : (btn.dataset.si != null ? +btn.dataset.si : null);
  const ii = itemEl ? +itemEl.dataset.ii : null;
  const o = current.obj;

  if (act === 'toggle' || act === 'up' || act === 'down' || act === 'del') {
    const items = o.sections[si].items;
    if (act === 'toggle') items[ii].enabled = !items[ii].enabled;
    if (act === 'del') items.splice(ii, 1);
    if (act === 'up' && ii > 0) [items[ii - 1], items[ii]] = [items[ii], items[ii - 1]];
    if (act === 'down' && ii < items.length - 1) [items[ii + 1], items[ii]] = [items[ii], items[ii + 1]];
    markDirty(); renderEditor(); return;
  }

  if (act === 'additem') {
    promptModal('Nytt ledd', 'Tittel på leddet', title => {
      o.sections[si].items.push({ id: uid(), type: 'tekst', heading: title || 'Nytt ledd', text: '', instr: '', alts: [], selAlt: null, enabled: true, optional: false, salmeNr: '', salmeTittel: '' });
      markDirty(); renderEditor();
    }); return;
  }

  if (act === 'addsec') {
    promptModal('Nytt hovedavsnitt', 'Navn på avsnittet', title => {
      o.sections.push({ title: title || 'Nytt avsnitt', items: [] });
      markDirty(); renderEditor();
    }); return;
  }

  if (act === 'newalt') {
    const sel = document.querySelector('.item.sel-focus') || document.querySelector('.item:hover') || document.querySelector('.item');
    if (!sel) return;
    const item = flat(sel.dataset.si, sel.dataset.ii);
    item.alts = item.alts || [];
    item.alts.push({ label: `Alternativ ${String.fromCharCode(97 + item.alts.length)}`, text: '[Skriv tekst her – klikk på teksten]' });
    item.selAlt = item.alts.length - 1;
    markDirty(); renderEditor();
  }
}

/* ================= Åpne / lukke / lagre ================= */

function openService(id) {
  const s = store.services.find(x => x.id === id);
  if (!s) return;
  current = { kind: 'service', obj: s };
  $('#welcome').hidden = true; $('#editor').hidden = false;
  $('#btn-savetpl').hidden = false; $('#ed-date').hidden = false;
  renderEditor(); renderLists();
}

function openTemplate(id) {
  const t = store.templates.find(x => x.id === id);
  if (!t) return;
  current = { kind: 'template', obj: t };
  $('#welcome').hidden = true; $('#editor').hidden = false;
  $('#btn-savetpl').hidden = true; $('#ed-date').hidden = true;
  renderEditor(); renderLists();
}

function closeEditor() {
  current = null;
  $('#editor').hidden = true; $('#welcome').hidden = false;
  renderLists();
}

/* ================= Modaler ================= */

function modal(title, bodyHtml, onOk) {
  $('#modal-title').textContent = title;
  $('#modal-body').innerHTML = bodyHtml;
  $('#modal-back').hidden = false;
  const ok = $('#modal-ok');
  const clone = ok.cloneNode(true); ok.replaceWith(clone);
  clone.onclick = () => { if (onOk() !== false) $('#modal-back').hidden = true; };
  $('#modal-cancel').onclick = () => $('#modal-back').hidden = true;
  const inp = $('#modal-body').querySelector('input,select');
  if (inp) inp.focus();
  return clone;
}
function promptModal(title, label, cb, def = '') {
  const ok = modal(title, `<label>${esc(label)}<input id="m-input" value="${esc(def)}"></label>`, () => {
    cb($('#m-input').value.trim());
  });
  ok.textContent = 'OK';
  $('#m-input').addEventListener('keydown', e => { if (e.key === 'Enter') ok.click(); });
}
function confirmModal(msg, cb) {
  const ok = modal('Bekreft', `<p>${esc(msg)}</p>`, cb);
  ok.textContent = 'Slett';
}
function chooseModal(title, optionsHtml, onOk) {
  modal(title, optionsHtml, onOk);
}

/* ================= Ny gudstjeneste / mal ================= */

function newServiceFlow() {
  if (!store.templates.length) { alert('Ingen maler funnet.'); return; }
  const opts = store.templates.map(t => `<option value="${t.id}">${esc(t.name)}</option>`).join('');
  const ok = modal('Ny gudstjeneste', `
    <label>Mal<select id="m-tpl">${opts}</select></label>
    <label>Navn<input id="m-name" placeholder="F.eks. Søndag 15. november"></label>
    <label>Dato<input id="m-date" type="date"></label>`, () => {
    const tpl = store.templates.find(t => t.id === $('#m-tpl').value);
    const s = newServiceFromTemplate(tpl);
    s.name = $('#m-name').value.trim() || tpl.name;
    s.date = $('#m-date').value;
    store.services.push(s); persist();
    openService(s.id);
  });
  ok.textContent = 'Opprett';
  ok.classList.add('primary');
}

function newTemplateFlow() {
  promptModal('Ny lokal mal', 'Navn på malen', name => {
    const t = newBlankTemplate(name || 'Ny grunnordning');
    store.templates.push(t); persist();
    openTemplate(t.id);
  });
}

function saveAsTemplate() {
  if (!current || current.kind !== 'service') return;
  promptModal('Lagre som lokal mal', 'Navn på malen', name => {
    const t = {
      id: uid(), kind: 'template', name: name || current.obj.name,
      sections: JSON.parse(JSON.stringify(current.obj.sections)).map(sec => ({
        title: sec.title,
        items: sec.items.map(x => ({ id: x.tplId || x.id, type: x.type, heading: x.heading, optional: x.optional, text: x.text, instr: x.instr, alts: x.alts, role: x.role || '' }))
      }))
    };
    store.templates.push(t); persist();
  }, current.obj.name + ' (grunnordning)');
}

/* ================= Eksport ================= */

function exportDoc() {
  if (!current) return;
  const o = current.obj;
  const out = [];
  out.push({ text: o.name, heading: 'Heading1' });
  if (o.date) out.push({ text: new Date(o.date).toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' }), heading: 'Heading3' });

  const showInstr = $('#opt-instr').checked;
  for (const sec of o.sections) {
    out.push({ text: sec.title, heading: 'Heading2' });
    for (const it of sec.items) {
      if (!it.enabled) continue;
      let head = it.heading || '';
      if (it.type === 'salme' && (it.salmeNr || it.salmeTittel)) head += `: ${it.salmeNr} ${it.salmeTittel}`.replace(': ', ': ');
      if (head) out.push({ text: head, heading: 'Heading3' });
      if (showInstr && it.instr) out.push({ text: it.instr, italics: true, color: '555555' });
      if (it.type === 'salme') {
        if (!it.salmeNr && !it.salmeTittel) out.push({ text: '[Salme: settes inn]', italics: true, color: '888888' });
      } else if (it.alts && it.alts.length) {
        if (it.selAlt == null) out.push({ text: '[Velg alternativ]', italics: true, color: '888888' });
        else {
          const a = it.alts[it.selAlt];
          if (a.label) out.push({ text: a.label, italics: true, color: '555555' });
          out.push({ text: a.text });
        }
      } else if (it.text) out.push({ text: it.text });
      out.push({ text: '' });
    }
  }
  return out;
}

function exportWord() {
  const out = exportDoc(); if (!out) return;
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = window.docx;
  const paras = out.map(p => new Paragraph({
    heading: p.heading === 'Heading1' ? HeadingLevel.HEADING_1 : p.heading === 'Heading2' ? HeadingLevel.HEADING_2 : p.heading === 'Heading3' ? HeadingLevel.HEADING_3 : undefined,
    children: [new TextRun({ text: p.text, italics: p.italics || false, color: p.color, bold: p.heading === 'Heading3' })],
    spacing: { after: 120 }
  }));
  const doc = new Document({ sections: [{ properties: {}, children: paras }] });
  Packer.toBlob(doc).then(blob => {
    download(blob, safeName(oName()) + '.docx');
  });
}

function exportPptx() {
  const o = current.obj;
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';
  const slide = txt => {
    const s = pptx.addSlide();
    s.background = { color: '0D0D0F' };
    s.addText(txt, { x: 0.6, y: 0.6, w: 8.8, h: 4.2, fontFace: 'Arial', fontSize: 28, color: 'E8E8EC', align: 'left', valign: 'top' });
    return s;
  };
  // tittel
  const s0 = pptx.addSlide();
  s0.background = { color: '0D0D0F' };
  s0.addText(o.name, { x: 0.6, y: 2.2, w: 8.8, h: 1.2, fontSize: 40, bold: true, color: 'E8E8EC' });
  if (o.date) s0.addText(new Date(o.date).toLocaleDateString('nb-NO'), { x: 0.6, y: 3.4, w: 8.8, h: 0.6, fontSize: 20, color: '9A9AA4' });

  for (const sec of o.sections) {
    for (const it of sec.items) {
      if (!it.enabled) continue;
      let lines = [];
      if (it.type === 'salme') {
        if (it.salmeNr || it.salmeTittel) lines.push(`${it.salmeNr} ${it.salmeTittel}`.trim());
      } else if (it.alts && it.alts.length) {
        if (it.selAlt != null) lines.push(it.alts[it.selAlt].text);
      } else if (it.text) {
        lines.push(it.text);
      }
      const joined = lines.join('\n').trim();
      if (!joined) continue;
      // del lange tekster på flere lysbilder (ca. 350 tegn)
      for (const chunk of splitChunks(joined, 350)) slide(chunk);
    }
  }
  pptx.write({ outputType: 'blob' }).then(blob => download(blob, safeName(oName()) + '.pptx'));
}

function splitChunks(t, n) {
  if (t.length <= n) return [t];
  const parts = []; let buf = '';
  for (const para of t.split('\n')) {
    if ((buf + '\n' + para).length > n && buf) { parts.push(buf); buf = para; }
    else buf = buf ? buf + '\n' + para : para;
  }
  if (buf) parts.push(buf);
  return parts;
}

function oName() { return current.obj.name; }
function safeName(s) { return (s || 'gudstjeneste').replace(/[^\wæøåÆØÅ \-]+/g, '').trim() || 'gudstjeneste'; }
function download(blob, filename) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

function exportPdf() { window.print(); }

/* ================= Init ================= */

async function seedTemplates() {
  // innebygde maler (data.js generert fra docx-filene)
  const builtins = window.BUILTIN_TEMPLATES || [];
  for (const bt of builtins) {
    if (!store.templates.some(t => t.builtinKey === bt.builtinKey)) {
      store.templates.push(JSON.parse(JSON.stringify(bt)));
    }
  }
  persist();
}

document.addEventListener('DOMContentLoaded', async () => {
  load();
  await seedTemplates();
  renderLists();

  $('#btn-new-service').onclick = newServiceFlow;
  $('#btn-start').onclick = newServiceFlow;
  $('#btn-new-template').onclick = newTemplateFlow;
  $('#btn-close').onclick = () => { if (!dirty || confirm('Ulagrede endringer vil gå tapt. Lukke?')) closeEditor(); };
  $('#btn-save').onclick = () => { current.obj.name = $('#ed-name').value; current.obj.date = $('#ed-date').value; persist(); };
  $('#btn-savetpl').onclick = saveAsTemplate;
  $('#btn-pdf').onclick = exportPdf;
  $('#btn-docx').onclick = exportWord;
  $('#btn-pptx').onclick = exportPptx;
  $('#ed-name').addEventListener('input', () => { current.obj.name = $('#ed-name').value; markDirty(); });
  $('#ed-date').addEventListener('change', () => { current.obj.date = $('#ed-date').value; markDirty(); showDateLine(); });
  $('#opt-instr').addEventListener('change', renderEditor);
  $('#opt-roles').addEventListener('change', renderEditor);
  document.addEventListener('click', handleDocClick);
  window.addEventListener('beforeunload', e => { if (dirty) e.preventDefault(); });
});
