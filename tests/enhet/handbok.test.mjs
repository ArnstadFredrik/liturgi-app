import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mdTilHtml } from '../../src/lib/md-doc.js';
import fs from 'node:fs';

const docsMappe = new URL('../../docs/', import.meta.url);

test('mdTilHtml: overskrifter, lister og avsnitt', () => {
  const html = mdTilHtml('# Tittel\n\nAvsnitt med **fet** og *kursiv*.\n\n- punkt en\n- punkt to\n\n1. frste\n2. andre\n');
  assert.ok(html.includes('<h1>Tittel</h1>'));
  assert.ok(html.includes('<strong>fet</strong>'));
  assert.ok(html.includes('<em>kursiv</em>'));
  assert.ok(html.includes('<ul>') && html.includes('<li>punkt en</li>') && html.includes('<li>punkt to</li>'));
  assert.ok(html.includes('<ol>') && html.includes('<li>frste</li>') && html.includes('<li>andre</li>'));
  assert.ok(html.includes('<p>Avsnitt'));
});

test('mdTilHtml: tabeller og kodeblokker', () => {
  const html = mdTilHtml('| a | b |\n|---|---|\n| 1 | 2 |\n\n```js\nconst x = 1;\n```');
  assert.ok(html.includes('<th>a</th>') && html.includes('<th>b</th>'));
  assert.ok(html.includes('<td>1</td>'));
  assert.ok(html.includes('<pre><code>') && html.includes('const x = 1;'));
});

test('mdTilHtml: html-escaper innhold', () => {
  const html = mdTilHtml('Tekst med <tag> & sdant');
  assert.ok(!html.includes('<tag>'));
  assert.ok(html.includes('&lt;tag&gt;'));
});

test('dokumentene finnes og kan rendres', () => {
  for (const fil of ['brukerhandbok.md', 'api.md']) {
    const md = fs.readFileSync(new URL(fil, docsMappe), 'utf-8');
    assert.ok(md.length > 2000, fil + ' mangler innhold');
    assert.ok(md.includes('# Liturgi'), fil + ' mangler tittel');
    const html = mdTilHtml(md);
    assert.ok(html.includes('<h1>'), fil + ' renderer ikke overskrift');
    assert.ok(!html.includes('&lt;h1&gt;'), fil + ' har uescaped HTML');
  }
});
