import { test } from 'node:test';
import assert from 'node:assert/strict';
import { uthev, uthevSprak } from '../../src/lib/highlight.js';

test('uthev: ejs-mal gir token-markup med tag og innhold', () => {
	const html = uthev('<%= dag.navn %>\n<% if (dag.bonn) { %>', 'ejs');
	assert.ok(html.includes('token'), 'ingen token-klasser: ' + html);
	assert.ok(html.includes('navn'), html);
});

test('uthev: markdown og javascript finnes i samme pakke', () => {
	const md = uthev('# Salmer\n**fet**', 'markdown');
	assert.ok(md.includes('token'), md);
	const js = uthev('const x = 1;', 'javascript');
	assert.ok(js.includes('token'), js);
});

test('uthev: markdown med frontmatter utheves som yaml', () => {
	const html = uthev('---\ntittel: Jul\n---\n\n# Salme', 'markdown');
	assert.ok(html.includes('token frontmatter'), html);
	assert.ok(html.includes('tittel'), html);
	assert.ok(html.startsWith('<span class="token frontmatter">'), html);
});

test('uthev: ukjent sprk og feiler aldri (escaped tekst tilbake)', () => {
	const u = uthev('<b>hei', 'ruby');
	assert.equal(u, '&lt;b&gt;hei');
	assert.ok(uthevSprak().includes('ejs') && uthevSprak().includes('markdown'));
});
