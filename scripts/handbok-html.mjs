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
try {
	for (const [id, fil] of dokumenter) {
		const md = stripToc(fs.readFileSync(path.join(rot, fil), 'utf-8'));
		const html = execFileSync('pandoc', ['-f', 'gfm', '-t', 'html'], { input: md, encoding: 'utf-8', maxBuffer: 20 * 1024 * 1024 });
		deler.push('export const ' + id.replace(/-/g, '_') + 'Html = ' + JSON.stringify(html) + ';');
	}
} catch {
	// pandoc ikke installert (f.eks. i CI): behold den commitete genererte fila
	if (fs.existsSync(utFil)) {
		console.log('pandoc ikke funnet - beholder eksisterende handbok-html.js');
		process.exit(0);
	}
	console.error('Verken pandoc eller en generert handbok-html.js finnes');
	process.exit(1);
}
fs.mkdirSync(path.dirname(utFil), { recursive: true });
fs.writeFileSync(utFil, deler.join('\n') + '\n');

// synkroniser skjermbildene (kilde: docs/bilder) til src/assets/bilder for vite-bygget
const bildeKilde = path.join(rot, 'docs', 'bilder');
const bildeMal = path.join(rot, 'src', 'assets', 'bilder');
fs.mkdirSync(bildeMal, { recursive: true });
if (fs.existsSync(bildeKilde)) {
	const eksisterende = new Set();
	for (const f of fs.readdirSync(bildeKilde)) {
		if (!/\.(png|jpe?g|gif|webp|svg)$/i.test(f)) continue;
		fs.copyFileSync(path.join(bildeKilde, f), path.join(bildeMal, f));
		eksisterende.add(f);
	}
	for (const f of fs.readdirSync(bildeMal)) {
		if (!eksisterende.has(f)) fs.unlinkSync(path.join(bildeMal, f));
	}
}
console.log('handbok-html.js generert');
