#!/usr/bin/env node
/**
 * Genererer HTML fra docs/*.md med pandoc for Brukerhndbok-modulen.
 * Kjres fr build (prebuild/prebuild:dev); den genererte fila commit-s,
 * s appen fungerer offline og uten pandoc installert.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const utFil = path.join(rot, 'src/lib/generated/handbok-html.js');

// TOC-seksjonen (frste h2 med tittel som begynner p Innholdsfortegn) erstattes
// av sidekolonnen i appen, s den tas ut fr konvertering.
function stripToc(md) {
	const linjer = md.split('\n');
	const ut = [];
	let i = 0;
	while (i < linjer.length) {
		if (/^## Innholdsfortegnel\S*/.test(linjer[i])) {
			i++;
			while (i < linjer.length && !/^## /.test(linjer[i])) i++;
			continue;
		}
		ut.push(linjer[i]);
		i++;
	}
	return ut.join('\n');
}

const dokumenter = [
	['brukerhandbok', 'docs/brukerhandbok.md'],
	['api', 'docs/api.md'],
	['limal-format', 'docs/limal-format.md']
];

const deler = ['/** GENERATED AV scripts/handbok-html.mjs (pandoc) - ikke rediger for hånd. */', ''];
for (const [id, fil] of dokumenter) {
	const md = stripToc(fs.readFileSync(path.join(rot, fil), 'utf-8'));
	const html = execFileSync('pandoc', ['-f', 'gfm', '-t', 'html'], { input: md, encoding: 'utf-8', maxBuffer: 20 * 1024 * 1024 });
	deler.push('export const ' + id.replace(/-/g, '_') + 'Html = ' + JSON.stringify(html) + ';');
}
fs.mkdirSync(path.dirname(utFil), { recursive: true });
fs.writeFileSync(utFil, deler.join('\n') + '\n');
console.log('handbok-html.js generert');
