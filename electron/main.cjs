// Electron-hovedprosess: serverer den statiske SvelteKit-bygget (build/)
// på localhost og legger på bibel.no-proxyen (samme som vite.config.js),
// så kirkeårsfunksjonen fungerer også i den pakkede appen.
const { app, BrowserWindow, shell, ipcMain, dialog, nativeTheme, Menu } = require('electron');
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const url = require('url');

// ---------- fil-dialoger: lagre/åpne liturgi-filer (.liturgi, json-innhold) ----------
ipcMain.on('app:dirty', (e, v) => {
	const win = BrowserWindow.fromWebContents(e.sender);
	if (win) win.__dirty = v;
});

// versjonsinfo til innstillingssiden: package.json-versjon + byggnummer (tidsstempel ved bygg)
ipcMain.handle('app:info', () => {
	const bygg = fs.existsSync(path.join(__dirname, 'byggnr.txt'))
		? fs.readFileSync(path.join(__dirname, 'byggnr.txt'), 'utf8').trim()
		: 'dev';
	return { versjon: app.getVersion(), bygg };
});

// renderer har lagret og ber om å avslutte (etter «app:save-then-close»)
ipcMain.on('app:force-close', (e) => {
	const win = BrowserWindow.fromWebContents(e.sender);
	if (win) win.__forceClose = true;
	app.exit(0); // app.quit() virker ikke etter kansellert quit
});

/** Lagre eksportfil (PDF base64) — i samme mappe som gudstjenesten, ellers Dokumenter/Liturgi. */
ipcMain.handle('eksport:lagre-pdf', (_e, { base64, filnavn, sti }) => {
	try {
		const dir = sti
			? path.dirname(sti)
			: path.join(app.getPath('documents'), 'Liturgi');
		fs.mkdirSync(dir, { recursive: true });
		const p = path.join(dir, filnavn);
		fs.writeFileSync(p, Buffer.from(base64, 'base64'));
		return { ok: true, filePath: p };
	} catch (err) {
		return { ok: false, error: String(err?.message ?? err) };
	}
});

ipcMain.handle('liturgi:save-file', async (_e, payload) => {
	try {
		const { defaultName = 'gudstjeneste.liturgi', json, testPath, filters: velgFilters } = payload ?? {};
		// JSON-eksporter (.json) må ikke foreslås som .liturgi-fil
		const filters = velgFilters
			?? (/\.json$/i.test(defaultName)
				? [{ name: 'JSON', extensions: ['json'] }]
				: [
					{ name: 'Liturgi-fil', extensions: ['liturgi'] },
					{ name: 'JSON', extensions: ['json'] }
				]);
		let filePath;
		if (testPath) {
			// direkte-skriv (brukes av automatisert testing)
			filePath = testPath;
		} else {
			const win = BrowserWindow.getFocusedWindow();
			const { canceled, filePath: chosen } = await dialog.showSaveDialog(win, {
				title: 'Lagre liturgi',
				defaultPath: path.join(app.getPath('documents'), defaultName),
				filters
			});
			if (canceled || !chosen) return { ok: false, canceled: true };
			filePath = chosen;
		}
		fs.writeFileSync(filePath, json, 'utf8');
		return { ok: true, filePath };
	} catch (err) {
		return { ok: false, error: String(err?.message ?? err) };
	}
});

ipcMain.handle('liturgi:open-file', async () => {
	try {
		const win = BrowserWindow.getFocusedWindow();
		const { canceled, filePaths } = await dialog.showOpenDialog(win, {
			title: 'Åpne liturgi',
			defaultPath: app.getPath('documents'),
			filters: [
				{ name: 'Liturgi-filer', extensions: ['liturgi', 'limal', 'json'] }
			],
			properties: ['openFile']
		});
		if (canceled || !filePaths?.length) return { ok: false, canceled: true };
		return { ok: true, json: fs.readFileSync(filePaths[0], 'utf8'), filePath: filePaths[0] };
	} catch (err) {
		return { ok: false, error: String(err?.message ?? err) };
	}
});

// Lokale maler lagres som .liturgi-filer i ~/.config/Liturgi/maler
// Lokale maler lagres som .liturgi-filer i ~/.config/Liturgi/maler/
//   - originaler/    : innebygde originalmaler (gjenopprettes hvis mangler)
//   - brukermaler/   : maler laget i appen
const TPL_SUBDIRS = ['originaler', 'brukermaler'];
let tplFolder = null;
function templatesDir(sub = 'brukermaler') {
	if (!tplFolder) {
		tplFolder = path.join(os.homedir(), '.config', 'Liturgi', 'maler');
	}
	const d = path.join(tplFolder, sub);
	try { fs.mkdirSync(d, { recursive: true }); } catch {}
	return d;
}

function readTplMeta(p) {
	try {
		const d = JSON.parse(fs.readFileSync(p, 'utf8'));
		const data = d?.liturgiFormat ? d.data : d;
		if (!data?.sections) return null;
		return { path: p, name: data.name ?? path.basename(p, '.liturgi'), mtime: fs.statSync(p).mtimeMs };
	} catch { return null; }
}

ipcMain.handle('tpl:list', async () => {
	try {
		const dirs = {};
		for (const sub of TPL_SUBDIRS) dirs[sub] = templatesDir(sub);
		const readDir = (dir) => fs.readdirSync(dir)
			.filter((f) => /\.(liturgi|limal)$/i.test(f))
			.map((f) => readTplMeta(path.join(dir, f)))
			.filter(Boolean)
			.sort((a, b) => a.name.localeCompare(b.name, 'nb'));
		return { ok: true, dirs, originaler: readDir(dirs.originaler), brukermaler: readDir(dirs.brukermaler) };
	} catch (err) {
		return { ok: false, error: String(err?.message ?? err) };
	}
});

ipcMain.handle('tpl:read', async (_e, { path: p }) => {
	try { return { ok: true, json: fs.readFileSync(p, 'utf8'), filePath: p }; }
	catch (err) { return { ok: false, error: String(err?.message ?? err) }; }
});

ipcMain.handle('tpl:write', async (_e, { path: p, json }) => {
	try {
		fs.mkdirSync(path.dirname(p), { recursive: true });
		fs.writeFileSync(p, json, 'utf8'); return { ok: true, filePath: p };
	}
	catch (err) { return { ok: false, error: String(err?.message ?? err) }; }
});

ipcMain.handle('tpl:delete', async (_e, { path: p }) => {
	try {
		await new Promise((res, rej) => {
			const { execFile } = require('child_process');
			execFile('osascript', ['-e', `tell app "Finder" to delete POSIX file "${p}"`], (err) => err ? rej(err) : res());
		});
		return { ok: true };
	} catch (err) {
		return { ok: false, error: String(err?.message ?? err) };
	}
});

const { dbGet, dbSet, recList, recTouch, recRemove, bibCounts, bibSync, bibSearch, bibUserList, bibUserAdd, bibUserUpdate, bibUserDelete } = require('./db.cjs');

ipcMain.handle('db:get', (_e, key) => { try { return { ok: true, value: dbGet(key) }; } catch (err) { return { ok: false, error: String(err?.message ?? err) }; } });
ipcMain.handle('db:set', (_e, { key, value }) => { try { dbSet(key, value); return { ok: true }; } catch (err) { return { ok: false, error: String(err?.message ?? err) }; } });
ipcMain.handle('rec:list', () => { try { return { ok: true, list: recList() }; } catch (err) { return { ok: false, error: String(err?.message ?? err) }; } });
ipcMain.handle('rec:touch', (_e, { path: p, name, date }) => { try { recTouch(p, name, date); return { ok: true }; } catch (err) { return { ok: false, error: String(err?.message ?? err) }; } });
ipcMain.handle('rec:remove', (_e, { path: p }) => { try { recRemove(p); return { ok: true }; } catch (err) { return { ok: false, error: String(err?.message ?? err) }; } });
ipcMain.handle('bib:counts', () => { try { return { ok: true, counts: bibCounts() }; } catch (err) { return { ok: false, error: String(err?.message ?? err) }; } });

// ---------- prekenforberedelser: mappe-tre, filer og prosjekt-oppsett ----------
const FORB_STD = () => path.join(app.getPath('documents'), 'Liturgi', 'forberedelse');
const forbMappeLagret = () => dbGet('prekenforberedelseMappe') || '';

/** Katalog-oppføring ÉN mapper-nivå om gangen (lazyes i treet): mapper + .md-filer.
 *  Ingen rekursjon og ingen symlink-following — en stor mappe (eller en sky-mappe
 *  med aliaser) kan ellers fryse appen i minutter ved mount/oppdatering. */
function forbListe(dir) {
	const ut = [];
	for (const navn of fs.readdirSync(dir).sort((a, b) => a.localeCompare(b, 'nb'))) {
		if (navn.startsWith('.')) continue;
		const full = path.join(dir, navn);
		let st;
		try { st = fs.lstatSync(full); } catch { continue; } // f.eks. forsvunnet fil
		if (st.isSymbolicLink()) continue; // aldri følg lenker (loop- og skymappe-vern)
		if (st.isDirectory()) ut.push({ navn, sti: full, mappe: true });
		else if (navn.toLowerCase().endsWith('.md')) ut.push({ navn, sti: full, mappe: false });
	}
	return ut;
}

ipcMain.handle('forb:velg-mappe', async (_e, { defaultSti }) => {
	try {
		const win = BrowserWindow.getFocusedWindow();
		const { canceled, filePaths } = await dialog.showOpenDialog(win, {
			title: 'Velg mappe for prekenforberedelser',
			defaultPath: defaultSti || forbMappeLagret() || FORB_STD(),
			properties: ['openDirectory', 'createDirectory']
		});
		if (canceled || !filePaths?.length) return { ok: false, canceled: true };
		return { ok: true, sti: filePaths[0] };
	} catch (err) {
		return { ok: false, error: String(err?.message ?? err) };
	}
});

ipcMain.handle('forb:mappe', (_e, { path: p }) => {
	try {
		const mappe = forbMappeLagret() || p;
		if (!mappe || !fs.existsSync(mappe)) return { ok: true, entries: [], tom: true };
		return { ok: true, entries: forbListe(p || mappe) };
	} catch (err) {
		return { ok: false, error: String(err?.message ?? err) };
	}
});

ipcMain.handle('forb:les-fil', (_e, { path: p }) => {
	try {
		return { ok: true, tekst: fs.readFileSync(p, 'utf8'), mtime: fs.statSync(p).mtimeMs };
	} catch (err) {
		return { ok: false, error: String(err?.message ?? err) };
	}
});

ipcMain.handle('forb:lagre-fil', (_e, { path: p, tekst }) => {
	try {
		fs.mkdirSync(path.dirname(p), { recursive: true });
		fs.writeFileSync(p, tekst, 'utf8');
		return { ok: true, mtime: fs.statSync(p).mtimeMs };
	} catch (err) {
		return { ok: false, error: String(err?.message ?? err) };
	}
});

ipcMain.handle('forb:lag-prosjekt', (_e, { mappe, dagNavn, filer }) => {
	try {
		const dagMappe = path.join(mappe, dagNavn);
		fs.mkdirSync(dagMappe, { recursive: true });
		const laget = [];
		for (const [navn, innhold] of Object.entries(filer ?? {})) {
			const full = path.join(dagMappe, navn);
			if (!fs.existsSync(full)) {
				fs.writeFileSync(full, innhold, 'utf8');
				laget.push(navn);
			}
		}
		return { ok: true, sti: dagMappe, laget };
	} catch (err) {
		return { ok: false, error: String(err?.message ?? err) };
	}
});

ipcMain.handle('forb:migrer', (_e, { fra, til }) => {
	try {
		if (!fra || !til || fra === til) return { ok: true, antall: 0 };
		fs.mkdirSync(til, { recursive: true });
		let antall = 0;
		if (fs.existsSync(fra)) {
			for (const navn of fs.readdirSync(fra)) {
				fs.renameSync(path.join(fra, navn), path.join(til, navn));
				antall++;
			}
			// gammel mappe fjernes bare hvis den nå er tom (aldri slette innhold)
			try { fs.rmdirSync(fra); } catch { /* ikke tom — beholdes */ }
		}
		return { ok: true, antall };
	} catch (err) {
		return { ok: false, error: String(err?.message ?? err) };
	}
});
ipcMain.handle('bib:user:list', () => { try { return { ok: true, rows: bibUserList() }; } catch (err) { return { ok: false, error: String(err?.message ?? err) }; } });
ipcMain.handle('bib:user:add', (_e, r) => { try { return { ok: true, id: bibUserAdd(r) }; } catch (err) { return { ok: false, error: String(err?.message ?? err) }; } });
ipcMain.handle('bib:user:update', (_e, { id, r }) => { try { bibUserUpdate(id, r); return { ok: true }; } catch (err) { return { ok: false, error: String(err?.message ?? err) }; } });
ipcMain.handle('bib:user:delete', (_e, { id }) => { try { bibUserDelete(id); return { ok: true }; } catch (err) { return { ok: false, error: String(err?.message ?? err) }; } });
ipcMain.handle('bib:sync', (_e, { source, entries }) => { try { bibSync(source, entries); return { ok: true }; } catch (err) { return { ok: false, error: String(err?.message ?? err) }; } });
ipcMain.handle('bib:search', (_e, { q }) => { try { return { ok: true, rows: bibSearch(q) }; } catch (err) { return { ok: false, error: String(err?.message ?? err) }; } });

// Gudstjenester lagres som .liturgi-filer i ~/Documents/Liturgi
let svcFolder = null;
function servicesDir() {
	if (!svcFolder) {
		svcFolder = path.join(app.getPath('documents'), 'Liturgi');
		try { fs.mkdirSync(svcFolder, { recursive: true }); } catch {}
	}
	return svcFolder;
}

function readSvcMeta(p) {
	try {
		const d = JSON.parse(fs.readFileSync(p, 'utf8'));
		const data = d?.liturgiFormat ? d.data : d;
		if (!data?.sections) return null;
		return { path: p, name: data.name ?? path.basename(p, '.liturgi'), date: data.date ?? '' };
	} catch { return null; }
}

ipcMain.handle('svc:list', async () => {
	try {
		const dir = servicesDir();
		const files = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.liturgi'));
		const list = files
			.map((f) => {
				const p = path.join(dir, f);
				const m = readSvcMeta(p);
				return m ? { ...m, mtime: fs.statSync(p).mtimeMs } : null;
			})
			.filter(Boolean)
			.sort((a, b) => b.mtime - a.mtime);
		return { ok: true, list, dir };
	} catch (err) {
		return { ok: false, error: String(err?.message ?? err) };
	}
});

ipcMain.handle('svc:read', async (_e, { path: p }) => {
	try { return { ok: true, json: fs.readFileSync(p, 'utf8'), filePath: p }; }
	catch (err) { return { ok: false, error: String(err?.message ?? err) }; }
});

ipcMain.handle('svc:write', async (_e, { path: p, json }) => {
	try {
		fs.mkdirSync(path.dirname(p), { recursive: true });
		fs.writeFileSync(p, json, 'utf8'); return { ok: true, filePath: p };
	}
	catch (err) { return { ok: false, error: String(err?.message ?? err) }; }
});

ipcMain.handle('svc:save-as', async (_e, { defaultName, json }) => {
	try {
		const win = BrowserWindow.getFocusedWindow();
		const { canceled, filePath } = await dialog.showSaveDialog(win, {
			title: 'Lagre liturgi',
			defaultPath: path.join(servicesDir(), defaultName),
			filters: [
				{ name: 'Liturgi-fil', extensions: ['liturgi'] },
				{ name: 'JSON', extensions: ['json'] }
			]
		});
		if (canceled || !filePath) return { ok: false, canceled: true };
		fs.writeFileSync(filePath, json, 'utf8');
		return { ok: true, filePath };
	} catch (err) {
		return { ok: false, error: String(err?.message ?? err) };
	}
});

ipcMain.handle('svc:delete', async (_e, { path: p }) => {
	try {
		// flytt til papirkurven via skall-kommando (sikrere enn unlink)
		await new Promise((res, rej) => {
			const { execFile } = require('child_process');
			execFile('osascript', ['-e', `tell app "Finder" to delete POSIX file "${p}"`], (err) => err ? rej(err) : res());
		});
		return { ok: true };
	} catch (err) {
		return { ok: false, error: String(err?.message ?? err) };
	}
});

// Dobbeltklikk på .liturgi/.limal-filer i Finder: macOS sender open-file.
// Kan komme FØR appen/vinduet er klar — legg i kø og lever når siden er lastet.
// NB: hvis appen startes med filen som argument (ny prosess), ligger den i process.argv
// og open-file utløses aldri — fang den opp eksplisitt.
let pendingOpenPath = null;

function queueFileArg(p) {
	if (!p) return false;
	if (!/\.(liturgi|limal|json)$/i.test(p)) return false;
	const json = readLiturgiFile(p);
	if (json != null) { pendingOpenPath = JSON.stringify({ json, filePath: p }); return true; }
	return false;
}
// finn fil-argument blant argv (starter på indeks 2; flagg som --remote-debugging-port tar verdi)
for (let i = 2; i < process.argv.length; i++) {
	const a = process.argv[i];
	if (a.startsWith('--')) { if (a.includes('=') === false && !/debugging|inspect/i.test(a)) { /* flagg med verdi hoppes over av neste i++ når relevant */ } continue; }
	if (queueFileArg(a)) break;
}

app.on('open-file', (_e, filePath) => {
	try {
		const json = readLiturgiFile(filePath);
		if (!json) return;
		// send både innhold og sti — filen åpnes der den ligger, ikke kopieres
		const payload = JSON.stringify({ json, filePath });
		const wins = BrowserWindow.getAllWindows();
		if (wins.length && rendererReady) {
			wins[0].webContents.send('liturgi:open-path', payload);
			wins[0].show();
		} else {
			pendingOpenPath = payload;
		}
	} catch (err) {
		console.error('open-file feilet:', err);
	}
});

// renderer melder fra når siden er lastet (og lytteren er registrert) — flush evt. kø
let rendererReady = false;
ipcMain.on('liturgi:renderer-ready', (e) => {
	rendererReady = true;
	if (pendingOpenPath) {
		e.sender.send('liturgi:open-path', pendingOpenPath);
		pendingOpenPath = null;
	}
});

function readLiturgiFile(p) {
	try { return fs.readFileSync(p, 'utf8'); } catch { return null; }
}

app.on('second-instance', () => {
	const w = BrowserWindow.getAllWindows()[0];
	if (w) { if (w.isMinimized()) w.restore(); w.focus(); }
});

const PORT = 42_317;
// LITURGI_BUILD_DIR lar dev-testing peke på en annen byggmappe (unngår kollisjon
// når flere sesjoner bygger parallelt): LITURGI_BUILD_DIR=/tmp/devbuild electron .
const BUILD = process.env.LITURGI_BUILD_DIR || path.join(__dirname, '..', 'build');

// ---------- statisk server + bibel-proxy ----------
const MIME = {
	'.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
	'.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
	'.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon',
	'.woff': 'font/woff', '.woff2': 'font/woff2', '.map': 'application/json'
};

function serveStatic(req, res) {
	let p = decodeURIComponent(req.url.split('?')[0]);
	if (p === '/' || p === '') p = '/index.html';
	let file = path.join(BUILD, p);
	if (!file.startsWith(BUILD)) { res.statusCode = 403; return res.end(); }
	if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
		// SPA-fallback
		file = path.join(BUILD, 'index.html');
	}
	res.setHeader('content-type', MIME[path.extname(file)] || 'application/octet-stream');
	// aldri cache: ellers kjører dev-utgaven gammel kode etter rebuild
	// (samme origin hver gang — porten er konstant)
	res.setHeader('Cache-Control', 'no-store');
	fs.createReadStream(file).pipe(res);
}

const server = http.createServer(async (req, res) => {
	if (req.url?.startsWith('/api/bibel/')) {
		try {
			const target = 'https://bibel.no' + req.url.replace('/api/bibel', '/nettbibelen');
			const r = await fetch(target, { headers: { 'user-agent': 'Mozilla/5.0 (liturgi-app)' } });
			res.setHeader('content-type', r.headers.get('content-type') || 'text/html');
			res.end(await r.text());
		} catch {
			res.statusCode = 502;
			res.end('Klarte ikke hente fra bibel.no');
		}
		return;
	}
	serveStatic(req, res);
});

// synkroniser nativeTheme med appens tema (vibrancy følger med)
ipcMain.on('tema:naativ', (_e, t) => {
	nativeTheme.themeSource = t === 'dark' ? 'dark' : 'light';
});

// «Åpne mappe»: vis gudstjenestefilen i Finder
ipcMain.handle('apne:mappe', (_e, p) => {
	if (typeof p === 'string' && p) shell.showItemInFolder(p);
});

// ---------- DEV: malredigeringsverktøy (aldri med i pakkede bygg) ----------
// Rendereren spør om den kjører i en dev-utgave; malredigeringsvisningen vises
// bare når byggflagget __DEV_MODE__ er satt OG appen er upakket.
ipcMain.handle('dev:tilstand', () => ({ devModus: !app.isPackaged }));
// Skriv en redigert originalmal tilbake til src/lib/data.js så den blir med
// i byggprosessen. Handleren nekter å kjøre i en pakket app.
ipcMain.handle('dev:lagre-datajs', async (_e, { mal }) => {
	if (app.isPackaged) return { ok: false, error: 'Kun tilgjengelig i dev-modus' };
	if (!mal || typeof mal !== 'object' || !mal.id) return { ok: false, error: 'Ugyldig mal-objekt' };
	const fil = path.join(app.getAppPath(), 'src', 'lib', 'data.js');
	let src;
	try { src = fs.readFileSync(fil, 'utf8'); }
	catch (err) { return { ok: false, error: 'Fant ikke data.js: ' + err.message }; }
	const linjer = src.split('\n');
	const idLinje = linjer.findIndex((l) => l.includes(`"id": "${mal.id}"`));
	if (idLinje < 0) return { ok: false, error: `Fant ikke id "${mal.id}" i data.js` };
	// data.js er tab-innrykket: toppnivå-entries åpner med en linje som kun er
	// «\t{» og lukker med «\t},»/«\t}». (Den gamle /^},?$/-regexen passet aldri —
	// hver dev-lagring feilet med «Ugyldige entry-grenser i data.js».)
	let start = idLinje;
	while (start > 0 && !/^\t\{$/.test(linjer[start])) start--;
	let slutt = idLinje;
	while (slutt < linjer.length && !/^\t},?$/.test(linjer[slutt])) slutt++;
	if (start <= 0 || slutt >= linjer.length) return { ok: false, error: 'Ugyldige entry-grenser i data.js' };
	const komma = linjer[slutt].trim().endsWith(',');
	const ny = JSON.stringify(mal, null, '	').split('\n');
	ny[0] = '	' + ny[0]; // entry-objektet innrykkes ett hakk (filens format)
	if (komma) ny[ny.length - 1] += ',';
	linjer.splice(start, slutt - start + 1, ...ny);
	fs.writeFileSync(fil, linjer.join('\n'));
	// valider ved å importere; rull tilbake ved feil
	try {
		await import(url.pathToFileURL(fil).href + '?v=' + Date.now());
		return { ok: true };
	} catch (err) {
		fs.writeFileSync(fil, src);
		return { ok: false, error: 'data.js var ugyldig etter skriving (gjenopprettet): ' + err.message };
	}
});

// Salmedatabasen (gudstjeneste.no) – login + henting av salmetekster
require('./salmer.cjs');

// ---------- mac-menylinjen ----------
// Alle handlingene fra venstre og høyre sidemeny; dokumenthandlinger deaktivert
// uten åpne dokument (renderer melder tilstand på 'app:meny-tilstand').
// alle eksportverktøylinje-valgene som menylinje-submeny (6)
function eksMenyMal(st, send) {
	const t = st.eks ?? {};
	if (t.skjerm) {
		return [
			{ label: 'Leddtitler', type: 'checkbox', checked: !!t.leddtitler, click: () => send('eks:leddtitler') },
			{ label: 'Blank side mellom ledd', type: 'checkbox', checked: !!t.blank, click: () => send('eks:blank') },
			{ label: 'Tittelslide', type: 'checkbox', checked: !!t.tittelslide, click: () => send('eks:tittelslide') },
			{ label: 'Instruksjoner', type: 'checkbox', checked: !!t.instr, click: () => send('eks:instr') },
			{ label: 'Salmeinfo', type: 'checkbox', checked: !!t.salmeinfo, click: () => send('eks:salmeinfo') },
			{ label: 'Lys bakgrunn', type: 'checkbox', checked: !!t.lys, click: () => send('eks:lys') },
			{ type: 'separator' },
			{ label: 'Justering', submenu: [
				{ label: 'Venstrejustert', type: 'radio', checked: t.justering === 'left', click: () => send('eks:justering:left') },
				{ label: 'Sentrert', type: 'radio', checked: t.justering !== 'left' && t.justering !== 'right', click: () => send('eks:justering:center') },
				{ label: 'Høyrejustert', type: 'radio', checked: t.justering === 'right', click: () => send('eks:justering:right') }
			] }
		];
	}
	return [
		{ label: 'Vis navn', type: 'checkbox', checked: t.tittel !== false, click: () => send('eks:tittel') },
		{ label: 'Hovedtitler', type: 'checkbox', checked: t.avsnitt !== false, click: () => send('eks:avsnitt') },
		{ label: 'Instruksjoner', type: 'checkbox', checked: !!t.instr, click: () => send('eks:instr') },
		{ label: 'Salmeinfo', type: 'checkbox', checked: !!t.salmeinfo, click: () => send('eks:salmeinfo') },
		{ type: 'separator' },
		{ label: 'Format', submenu: [
			{ label: 'A4', type: 'radio', checked: t.format === 'A4', click: () => send('eks:format:A4') },
			{ label: 'A5', type: 'radio', checked: t.format !== 'A4', click: () => send('eks:format:A5') }
		] },
		{ label: 'Kolonner', submenu: [
			{ label: '1 kolonne', type: 'radio', checked: t.kolonner !== 2, click: () => send('eks:kolonner:1') },
			{ label: '2 kolonner', type: 'radio', checked: t.kolonner === 2, click: () => send('eks:kolonner:2') }
		] },
		{ label: 'Marger', submenu: [
			{ label: 'Bred', type: 'radio', checked: t.marger === 'bred', click: () => send('eks:marger:bred') },
			{ label: 'Normal', type: 'radio', checked: t.marger !== 'bred' && t.marger !== 'smal', click: () => send('eks:marger:normal') },
			{ label: 'Smal', type: 'radio', checked: t.marger === 'smal', click: () => send('eks:marger:smal') }
		] },
		{ label: 'Avstand', submenu: [
			{ label: 'Tett', type: 'radio', checked: t.avstand === 'tett', click: () => send('eks:avstand:tett') },
			{ label: 'Normal', type: 'radio', checked: t.avstand !== 'tett' && t.avstand !== 'luft', click: () => send('eks:avstand:normal') },
			{ label: 'Luftig', type: 'radio', checked: t.avstand === 'luft', click: () => send('eks:avstand:luft') }
		] }
	];
}

function byggMeny(win, st = {}) {
	const dok = !!st.dokumentÅpen;
	const erTjeneste = st.kind === 'service';
	const send = (id) => win.webContents.send('meny:handling', id);
	const mal = [
		{
			label: 'Liturgi',
			submenu: [
				{ role: 'about', label: 'Om Liturgi' },
				{ type: 'separator' },
				{ label: 'Innstillinger …', accelerator: 'CmdOrCtrl+,', click: () => send('innstillinger') },
				{ type: 'separator' },
				{ role: 'quit', label: 'Avslutt Liturgi' }
			]
		},
		{
			label: 'Fil',
			submenu: [
				{ label: 'Ny gudstjeneste …', accelerator: 'CmdOrCtrl+N', click: () => send('ny-gudstjeneste') },
			{ label: 'Ny gravferd …', accelerator: 'CmdOrCtrl+Shift+G', click: () => send('ny-gravferd') },
				{ label: 'Åpne fil …', accelerator: 'CmdOrCtrl+O', click: () => send('apne-fil') },
				{ type: 'separator' },
				{ label: 'Lagre', accelerator: 'CmdOrCtrl+S', enabled: dok, click: () => send('lagre') },
				{ label: 'Lagre som …', accelerator: 'CmdOrCtrl+Shift+S', enabled: dok, click: () => send('lagre-som') },
				{ label: 'Lagre som mal', enabled: dok, click: () => send('lagre-som-mal') },
				{ type: 'separator' },
				{ label: 'Lukk dokument', accelerator: 'CmdOrCtrl+W', enabled: dok, click: () => send('lukk-dok') }
			]
		},
		{
			label: 'Rediger',
			submenu: [
				{ role: 'undo', label: 'Angre' },
				{ role: 'redo', label: 'Gjør om' },
				{ type: 'separator' },
				{ role: 'cut', label: 'Klipp ut' },
				{ role: 'copy', label: 'Kopier' },
				{ role: 'paste', label: 'Lim inn' },
				{ role: 'selectAll', label: 'Velg alt' }
			]
		},
		{
			label: 'Vis',
			submenu: [
				{ label: 'Sidemeny', accelerator: 'CmdOrCtrl+\\', click: () => send('veksle-sidebar') },
				{ label: 'Dokumentpanel', accelerator: 'CmdOrCtrl+Alt+\\', click: () => send('veksle-toc') },
				{ label: 'Vim-modus', type: 'checkbox', checked: !!st.vim, click: () => send('veksle-vim') },
				{ type: 'separator' },
				{ label: 'Prekenforberedelse', enabled: !!st.forbModul, click: () => send('forb-modul') },
				{ type: 'separator' },
				{ label: 'Vis navn (eksport)', enabled: st.visning === 'eksport' && st.kind === 'service', click: () => send('eks-tittel') },
				{ label: 'Hovedtitler (eksport)', enabled: st.visning === 'eksport' && st.kind === 'service', click: () => send('eks-avsnitt') },
				{ label: 'Eksportvalg', enabled: st.visning === 'eksport' && st.kind === 'service', submenu: eksMenyMal(st, send) },
				{ label: 'Åpne prekenforberedelse-mappe', enabled: !!st.forbModul, click: () => send('forb-apne-mappe') },
				{ type: 'separator' },
				{ label: 'Hjem', accelerator: 'CmdOrCtrl+1', click: () => send('hjem') },
				{ label: 'Maler', accelerator: 'CmdOrCtrl+2', click: () => send('maler') },
				{ label: 'Bibliotek', accelerator: 'CmdOrCtrl+3', click: () => send('bibliotek') },
				{ label: 'Kirkeåret', accelerator: 'CmdOrCtrl+4', click: () => send('kirkeaar') },
				{ type: 'separator' },
				{ label: st.tema === 'dark' ? 'Bytt til lyst utseende' : 'Bytt til mørkt utseende', click: () => send('tema') }
			]
		},
		{
			label: 'Gudstjeneste',
			submenu: [
				{ label: 'Salmeoversikt …', enabled: dok && erTjeneste, click: () => send('salmeoversikt') },
				{ label: 'Eksport …', accelerator: 'CmdOrCtrl+E', enabled: dok && erTjeneste, click: () => send('eksport') },
				{ label: 'Vis leddinnhold', type: 'checkbox', checked: !!st.visInnhold, enabled: dok && erTjeneste && st.visning === 'eksport', click: () => send('vis-leddinnhold') },
				{ label: 'Koblet visning (liste + forhåndsvisning)', type: 'checkbox', checked: st.koblet !== false, enabled: dok && erTjeneste && st.visning === 'eksport', click: () => send('koblet-visning') },
				{ label: 'Åpne mappe', enabled: dok && erTjeneste && st.harFil, click: () => send('apne-mappe') }
			]
		}
	];
	Menu.setApplicationMenu(Menu.buildFromTemplate(mal));
}
ipcMain.on('app:meny-tilstand', (e, st) => {
	const win = BrowserWindow.fromWebContents(e.sender);
	if (win) byggMeny(win, st);
});

// ---------- vindu ----------
function createWindow(port) {
	const win = new BrowserWindow({
		width: 1280,
		height: 900,
		minWidth: 900,
		minHeight: 600,
		title: 'Liturgi',
		titleBarStyle: 'hiddenInset',
		trafficLightPosition: { x: 14, y: 16 },
		vibrancy: 'sidebar',
		backgroundColor: '#00000000',
		webPreferences: {
			contextIsolation: true,
			sandbox: false,
			preload: path.join(__dirname, 'preload.cjs')
		}
	});
	byggMeny(win);
	win.loadURL(`http://localhost:${port}/`);
	// merknad: filer som åpnes ved oppstart leveres når rendereren melder 'liturgi:renderer-ready'
	// (did-finish-load fyrer før SPA-modulene har registrert lytteren)
	// åpne eksterne lenker (f.eks. bibel.no) i standardnettleseren
	win.webContents.setWindowOpenHandler(({ url }) => {
		if (!url.startsWith(`http://localhost:${port}`)) {
			shell.openExternal(url);
			return { action: 'deny' };
		}
		return { action: 'allow' };
	});
	// avsluttingsbekreftelse ved ulagrede endringer
	let quitting = false;
	app.on('before-quit', () => { quitting = true; if (process.env.LITURGI_DEBUG) console.log('[lukk] before-quit'); });
	win.on('close', async (e) => {
		if (win.__forceClose || !win.__dirty) return;
		e.preventDefault();
		if (process.env.LITURGI_DEBUG) console.log('[lukk] close forhindret, dialog vises');
		let response;
		if (process.env.LITURGI_TEST_CLOSE === 'lukk-uten') response = 1;
		else if (process.env.LITURGI_TEST_CLOSE === 'lagre') response = 0;
		else ({ response } = await dialog.showMessageBox(win, {
			type: 'warning',
			message: 'Du har ulagrede endringer',
			detail: 'Vil du lagre gudstjenesten/malen før appen avsluttes?',
			buttons: ['Lagre', 'Lukk uten å lagre', 'Avbryt'],
			defaultId: 0,
			cancelId: 2
		}));
		if (process.env.LITURGI_DEBUG) console.log('[lukk] svar:', response);
		if (response === 0) {
			// renderer lagrer og kaller app:force-close når den er ferdig
			win.webContents.send('app:save-then-close');
		} else if (response === 1) {
			win.__forceClose = true;
			// app.quit() virker ikke etter at quit er kansellert med preventDefault — avslutt hardt
			app.exit(0);
		}
	});
	return win;
}

app.whenReady().then(() => {
	// prøv ønsket port, fall tilbake til senere porter hvis opptatt (f.eks. hvis appen allerede kjører)
	let port = PORT;
	server.on('error', () => {
		port += 1;
		server.listen(port, '127.0.0.1');
	});
	server.on('listening', () => createWindow(port));
	server.listen(port, '127.0.0.1');
	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) createWindow(port);
	});
});

app.on('window-all-closed', () => {
	// enkeltvindus-app: avslutt hele appen når vinduet lukkes (også på macOS)
	app.quit();
});
