// Electron-hovedprosess: serverer den statiske SvelteKit-bygget (build/)
// på localhost og legger på bibel.no-proxyen (samme som vite.config.js),
// så kirkeårsfunksjonen fungerer også i den pakkede appen.
const { app, BrowserWindow, shell, ipcMain, dialog } = require('electron');
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');

// ---------- fil-dialoger: lagre/åpne liturgi-filer (.liturgi, json-innhold) ----------
ipcMain.handle('liturgi:save-file', async (_e, payload) => {
	try {
		const { defaultName = 'gudstjeneste.liturgi', json, testPath } = payload ?? {};
		let filePath;
		if (testPath) {
			// direkte-skriv (brukes av automatisert testing)
			filePath = testPath;
		} else {
			const win = BrowserWindow.getFocusedWindow();
			const { canceled, filePath: chosen } = await dialog.showSaveDialog(win, {
				title: 'Lagre liturgi',
				defaultPath: path.join(app.getPath('documents'), defaultName),
				filters: [
					{ name: 'Liturgi-fil', extensions: ['liturgi'] },
					{ name: 'JSON', extensions: ['json'] }
				]
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

const { dbGet, dbSet, recList, recTouch, recRemove, bibSync, bibSearch } = require('./db.cjs');

ipcMain.handle('db:get', (_e, key) => { try { return { ok: true, value: dbGet(key) }; } catch (err) { return { ok: false, error: String(err?.message ?? err) }; } });
ipcMain.handle('db:set', (_e, { key, value }) => { try { dbSet(key, value); return { ok: true }; } catch (err) { return { ok: false, error: String(err?.message ?? err) }; } });
ipcMain.handle('rec:list', () => { try { return { ok: true, list: recList() }; } catch (err) { return { ok: false, error: String(err?.message ?? err) }; } });
ipcMain.handle('rec:touch', (_e, { path: p, name, date }) => { try { recTouch(p, name, date); return { ok: true }; } catch (err) { return { ok: false, error: String(err?.message ?? err) }; } });
ipcMain.handle('rec:remove', (_e, { path: p }) => { try { recRemove(p); return { ok: true }; } catch (err) { return { ok: false, error: String(err?.message ?? err) }; } });
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
const BUILD = path.join(__dirname, '..', 'build');

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

// ---------- vindu ----------
function createWindow(port) {
	const win = new BrowserWindow({
		width: 1280,
		height: 900,
		minWidth: 900,
		minHeight: 600,
		title: 'Liturgi',
		webPreferences: {
			contextIsolation: true,
			sandbox: false,
			preload: path.join(__dirname, 'preload.cjs')
		}
	});
	win.removeMenu();
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
	if (process.platform !== 'darwin') app.quit();
});
