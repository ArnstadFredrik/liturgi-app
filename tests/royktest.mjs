#!/usr/bin/env node
/** RØYKTEST: starter den byggde Electron-appen med test-db og klikker gjennom
 *  de kritiske flytene via Chrome DevTools-protokollen. Fanger regresjoner som
 *  enhetstestene ikke kan se: frys (død reaktivitet), Maler-listen, malåpning,
 *  bibliotekssøk.
 *
 *  Bruk: npm run build && node tests/royktest.mjs
 *  (bygget må være fersk — testen kjører mot build/) */

import { spawn } from 'node:child_process';
import { openSync as fsOpen } from 'node:fs';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const PORT = 9877;
const ELLER_MALER = ['gravferd', 'Ordning for hovedgudtjeneste', 'Dåp i hovedgudtjenesten', 'Dåp i egen', 'Forbønn', 'Vigsel (bokmål, 2017)', 'Vigsel (bokmål, 2003)', 'Konfirmasjonstidens'];
const ELECTRON = join(fileURLToPath(new URL('..', import.meta.url)), 'node_modules', '.bin', 'electron');

let feil = 0, pass = 0;
function ok(navn, bet, ekstra = '') {
	if (bet) { pass++; console.log('✔ ' + navn); }
	else { feil++; console.log('✖ ' + navn + (ekstra ? ' — ' + ekstra : '')); }
}

// ---- 1. start appen med egen db ----
const dbDir = mkdtempSync(join(tmpdir(), 'liturgi-royk-'));
const electron = spawn(ELECTRON, ['.', `--remote-debugging-port=${PORT}`], {
	cwd: fileURLToPath(new URL('..', import.meta.url)),
	env: { ...process.env, LITURGI_DB_DIR: dbDir },
	stdio: ['ignore', fsOpen('/tmp/liturgi-royk-electron.log', 'w'), 'inherit'],
	detached: true
});
try {
	// ---- 2. koble til via CDP (Node 26 har innebygd WebSocket) ----
	let ws = null;
	for (let i = 0; i < 40; i++) {
		await sleep(1000);
		try {
			const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
			const side = list.find((t) => t.type === 'page' && !t.url.startsWith('devtools'));
			if (side?.webSocketDebuggerUrl) {
				ws = new WebSocket(side.webSocketDebuggerUrl);
				await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error('ws feil')); });
				break;
			}
		} catch { /* ikke oppe ennå */ }
	}
	ok('appen starter og eksponerer CDP', !!ws);
	if (!ws) throw new Error('fikk ikke CDP-tilgang');

	let mid = 0;
	const ventende = new Map();
	ws.onmessage = (ev) => {
		const msg = JSON.parse(ev.data);
		if (msg.id && ventende.has(msg.id)) { ventende.get(msg.id)(msg); ventende.delete(msg.id); }
	};
	async function ev(expr, awaitPromise = false) {
		mid++;
		ws.send(JSON.stringify({ id: mid, method: 'Runtime.evaluate', params: { expression: expr, returnByValue: true, awaitPromise } }));
		return new Promise((res) => ventende.set(mid, res)).then((msg) => msg.result?.result?.value);
	}

	// ---- 3. fersk oppstart: state ok ----
	await sleep(2500);
	const start = await ev(`JSON.stringify({ maler: window.__app?.templates?.length ?? -1 })`);
	const s0 = JSON.parse(start ?? '{}');
	ok('malene er lastet inn i state (≥8)', s0.maler >= 8, 'fant ' + s0.maler);

	// duplikat-id i Maler-listen = frys-regresjonen
	const dup = await ev(`(() => {
		const ider = (window.__app?.templates ?? []).map((t) => t.id);
		return ider.filter((v, i, a) => a.indexOf(v) !== i).length;
	})()`);
	ok('ingen duplikat mal-id (duplikat = Svelte-krasj i Maler-listen)', dup === 0);

	// ---- 4. åpne ALLE maler — frys-regresjonen: mount dør ved props_invalid_value ----
	for (const mal of ELLER_MALER) {
		const åpnet = await ev(`(async () => {
			const klikk = (t) => [...document.querySelectorAll('button')].find(b => b.textContent.trim() === t)?.click();
			// forsikr at vi står i Maler-listen (redaktøren kan være åpen fra forrige runde)
			klikk('Hjem'); await new Promise(r => setTimeout(r, 300));
			klikk('Bibliotek'); await new Promise(r => setTimeout(r, 450));
			klikk('Maler'); await new Promise(r => setTimeout(r, 700));
			const bs = [...document.querySelectorAll('button')].filter(x => x.textContent.trim() === 'Åpne');
			const ord = ${JSON.stringify(mal)}.split(' ');
			const b = bs.find(x => ord.some(w => (x.parentElement?.textContent ?? '').toLowerCase().includes(w.toLowerCase())));
			if (!b) return 'fant-ikke: ' + bs.map(x => (x.parentElement?.textContent ?? '').slice(0, 22)).join(' | ');
			b.click();
			// poll: vent til leddene er montert (tunge maler kan ta noen hundre ms)
			let items = 0;
			for (let i = 0; i < 12; i++) {
				await new Promise(r => setTimeout(r, 300));
				items = document.querySelectorAll('.item').length;
				if (items > 0) break;
			}
			return JSON.stringify({ items, tittel: document.querySelector('.item-title')?.textContent?.slice(0, 30) ?? null });
		})()`, true);
		if (typeof åpnet === 'string' && åpnet.startsWith('fant-ikke')) {
			ok(`malen «${mal}» åpner i editoren (ledd montert)`, false, åpnet);
			continue;
		}
		const r = JSON.parse(åpnet ?? '{}');
		ok(`malen «${mal}» åpner i editoren (ledd montert)`, r.items > 0, 'items=' + r.items + ' tittel=' + r.tittel);
	}

	// ---- 5. biblioteket: søk gir treff ----
	await ev(`(async () => {
		const klikk = (t) => [...document.querySelectorAll('button')].find(b => b.textContent.trim() === t)?.click();
		klikk('Hjem'); await new Promise(r => setTimeout(r, 300));
		klikk('Bibliotek'); await new Promise(r => setTimeout(r, 600));
		// fana kan ha blitt stående på «Maler» fra malåpningene — bytt til Bibliotek-fanen
		[...document.querySelectorAll('.fb-visning-velger button')].find(b => b.textContent.trim() === 'Bibliotek')?.click();
		await new Promise(r => setTimeout(r, 400));
		return 1;
	})()`, true);
	const sok = await ev(`(async () => {
		const inp = document.querySelector('.biblio-sok input');
		if (!inp) return 'ingen-sok';
		inp.value = 'salme';
		inp.dispatchEvent(new Event('input', { bubbles: true }));
		await new Promise(r => setTimeout(r, 900));
		return JSON.stringify({ rader: [...document.querySelectorAll('.biblio-rad')].length });
	})()`, true);
	const sk = JSON.parse(sok ?? '{}');
	ok('bibliotekssøket gir treff', (sk.rader ?? 0) > 0, 'rader=' + sk.rader);

	// ---- 6. reaktiviteten lever fortsatt (frys-prøven) ----
	const lever = await ev(`(async () => {
		const f = () => [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Maler');
		f()?.click(); await new Promise(r => setTimeout(r, 350));
		const a = document.body.innerHTML.length;
		[...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Bibliotek')?.click();
		await new Promise(r => setTimeout(r, 350));
		return document.body.innerHTML.length !== a;
	})()`, true);
	ok('reaktiviteten lever etter alle navigeringene (ingen frys)', lever === true);

	console.log('');
	console.log(`— ${pass} passerte, ${feil} feilet —`);
	process.exitCode = feil ? 1 : 0;
} catch (err) {
	console.error('RØYKTEST krasjet:', err.message);
	process.exitCode = 1;
} finally {
	try { process.kill(-electron.pid, 'SIGKILL'); } catch { try { electron.kill('SIGKILL'); } catch { } }
	try { spawn('pkill', ['-f', `remote-debugging-port=${PORT}`]); } catch { }
	await sleep(500);
	rmSync(dbDir, { recursive: true, force: true });
}
