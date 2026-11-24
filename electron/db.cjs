// SQLite-database for appinnstillinger (ligger i ~/.config/Liturgi, utenfor
// app-pakken, så den overlever appoppdateringer).
const os = require('os');
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

let db = null;

function openDb() {
	if (db) return db;
	// LITURGI_DB_DIR: test-instanser kan bruke egen db og røre aldri brukerens
	// Windows: %APPDATA%\Liturgi (userData); mac/linux: ~/.config/Liturgi
	// (Electrons userData på linux ER ~/.config/<navn>, så stien er identisk).
	const dir = process.env.LITURGI_DB_DIR || (process.platform === 'win32'
		? path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), 'Liturgi')
		: path.join(os.homedir(), '.config', 'Liturgi'));
	fs.mkdirSync(dir, { recursive: true });
	db = new Database(path.join(dir, 'liturgi.db'));
	db.pragma('journal_mode = WAL');
	// vent på lås i stedet for å kaste SQLITE_BUSY ved samtidige skrivere (f.eks. eksterne verktøy)
	db.pragma('busy_timeout = 5000');
	db.exec(`
		CREATE TABLE IF NOT EXISTS settings (
			key TEXT PRIMARY KEY,
			value TEXT
		);
		CREATE TABLE IF NOT EXISTS recent_services (
			path TEXT PRIMARY KEY,
			name TEXT NOT NULL DEFAULT '',
			date TEXT NOT NULL DEFAULT '',
			last_opened INTEGER NOT NULL DEFAULT 0
		);
		CREATE TABLE IF NOT EXISTS bibliotek (
			kilde     TEXT NOT NULL,
			seksjon   TEXT NOT NULL DEFAULT '',
			ledd      TEXT NOT NULL,
			alt_label TEXT NOT NULL DEFAULT '',
			tekst     TEXT NOT NULL DEFAULT '',
			PRIMARY KEY (kilde, ledd, alt_label)
		);
		CREATE TABLE IF NOT EXISTS bibliotek_bruker (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			mappe TEXT NOT NULL DEFAULT '',
			ledd TEXT NOT NULL,
			alt_label TEXT NOT NULL DEFAULT '',
			tekst TEXT NOT NULL DEFAULT '',
			tags TEXT NOT NULL DEFAULT '',
			opprettet TEXT NOT NULL DEFAULT ''
		);
	`);
	// migrering: ledd_id (stabil id fra mal-item, tittelen er kun visning)
	const kolonner = db.prepare('PRAGMA table_info(bibliotek)').all().map((k) => k.name);
	if (!kolonner.includes('ledd_id')) {
		db.exec('ALTER TABLE bibliotek ADD COLUMN ledd_id TEXT NOT NULL DEFAULT \'\'');
		// gamle rader: ledd_id = ledd (tittelen var identiteten fram til nå)
		db.exec('UPDATE bibliotek SET ledd_id = ledd');
	}
	for (const kol of ['intro_tekst', 'avsl_tekst']) {
		if (!kolonner.includes(kol)) db.exec(`ALTER TABLE bibliotek ADD COLUMN ${kol} TEXT NOT NULL DEFAULT ''`);
	}
	return db;
}

function dbGet(key) {
	const row = openDb().prepare('SELECT value FROM settings WHERE key = ?').get(key);
	return row ? JSON.parse(row.value) : null;
}

function dbSet(key, value) {
	openDb()
		.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
		.run(key, JSON.stringify(value ?? null));
}

function recList(limit = 8) {
	return openDb()
		.prepare('SELECT path, name, date, last_opened FROM recent_services ORDER BY last_opened DESC LIMIT ?')
		.all(limit);
}

function recTouch(p, name, date) {
	openDb()
		.prepare(`INSERT INTO recent_services (path, name, date, last_opened) VALUES (?, ?, ?, ?)
			ON CONFLICT(path) DO UPDATE SET name = excluded.name, date = excluded.date, last_opened = excluded.last_opened`)
		.run(p, name ?? '', date ?? '', Date.now());
}

function recRemove(p) {
	openDb().prepare('DELETE FROM recent_services WHERE path = ?').run(p);
}

/* ---------- bibliotek: oppslagsregister over hovedgudstjenesten ---------- */

/** Antall rader i biblioteket per kilde (for rask gyldighetssjekk ved oppstart). */
function bibCounts() {
	const rows = openDb().prepare('SELECT kilde, COUNT(*) AS n FROM bibliotek GROUP BY kilde').all();
	return Object.fromEntries(rows.map((r) => [r.kilde, r.n]));
}

/* ---------- bibliotek_bruker: brukeropprettet innhold (røres ikke av regenerering) ---------- */

function bibUserList() {
	return openDb()
		.prepare('SELECT id, mappe, ledd, alt_label, tekst, tags, opprettet FROM bibliotek_bruker ORDER BY mappe, ledd, id')
		.all();
}

function bibUserAdd(r) {
	const info = openDb()
		.prepare('INSERT INTO bibliotek_bruker (mappe, ledd, alt_label, tekst, tags, opprettet) VALUES (?, ?, ?, ?, ?, ?)')
		.run(r.mappe ?? '', r.ledd ?? '', r.alt_label ?? '', r.tekst ?? '', r.tags ?? '', new Date().toISOString());
	return info.lastInsertRowid;
}

function bibUserUpdate(id, r) {
	openDb()
		.prepare('UPDATE bibliotek_bruker SET mappe = ?, ledd = ?, alt_label = ?, tekst = ?, tags = ? WHERE id = ?')
		.run(r.mappe ?? '', r.ledd ?? '', r.alt_label ?? '', r.tekst ?? '', r.tags ?? '', id);
}

function bibUserDelete(id) {
	openDb().prepare('DELETE FROM bibliotek_bruker WHERE id = ?').run(id);
}

function bibSync(source, entries) {
	const db = openDb();
	db.prepare('DELETE FROM bibliotek WHERE kilde = ?').run(source);
	const ins = db.prepare(
		'INSERT INTO bibliotek (kilde, seksjon, ledd, ledd_id, alt_label, tekst, intro_tekst, avsl_tekst) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
	);
	// sikre unike (ledd, alt_label) — tabellens primærnøkkel. Hjemme her (i stedet
	// for hos hver kaller) slik at alle synkveier er trygge.
	const sett = new Set();
	try {
		db.transaction(() => {
			for (const e of entries) {
				let l = e.alt_label ?? '', n = sett.has(e.ledd + '|' + l) ? 1 : 0;
				while (sett.has(e.ledd + '|' + l)) { n++; l = (e.alt_label || 'Alternativ') + ' ' + n; }
				sett.add(e.ledd + '|' + l);
				ins.run(source, e.seksjon, e.ledd, e.ledd_id ?? '', l, e.tekst ?? '', e.intro_tekst ?? '', e.avsl_tekst ?? '');
			}
		})();
		return { ok: true };
	} catch (err) {
		return { ok: false, error: String(err?.message ?? err) };
	}
}

/** Signatur per kilde: antall + rask hash av innholdet (titler/tekst kan endre
 *  seg uten at antallet gjør det — stikkprøven må fange begge deler). */
function bibSig() {
	// ordens-uavhengig: summen av per-rad-hasher er lik uansett rekkefølge
	const rows = openDb().prepare('SELECT kilde, seksjon, ledd, ledd_id, alt_label, tekst, intro_tekst, avsl_tekst FROM bibliotek').all();
	const sig = {};
	for (const r of rows) {
		const s = r.seksjon + '\u0001' + r.ledd + '\u0001' + r.ledd_id + '\u0001' + r.alt_label + '\u0001' + r.tekst + '\u0001' + (r.intro_tekst ?? '') + '\u0001' + (r.avsl_tekst ?? '')
		let h = 5381;
		for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
		if (!sig[r.kilde]) sig[r.kilde] = { n: 0, hash: 0 };
		sig[r.kilde].n++;
		sig[r.kilde].hash = (sig[r.kilde].hash + h) >>> 0;
	}
	return sig;
}

function bibSearch(q, limit = 500) {
	// Fuzzy: hent alle rader (registeret er lite) og score i JS.
	// Hvert søkeord telles hvis det er prefiks av et ord i ledd/seksjon —
	// ord i HVA SOM HELST rekkefølge («hellig sanctus» finner «Sanctus»).
	const rows = openDb()
		.prepare('SELECT kilde, seksjon, ledd, ledd_id, alt_label, tekst, intro_tekst, avsl_tekst FROM bibliotek')
		.all();
	// egne ledd fra bibliotek_bruker kommer med som kilde «Mine ledd» (+ mappe)
	const egne = openDb()
		.prepare('SELECT mappe, ledd, alt_label, tekst, tags FROM bibliotek_bruker')
		.all()
		.map((r) => ({
			kilde: 'Mine ledd' + (r.mappe ? ' · ' + r.mappe : ''),
			seksjon: r.mappe || 'Mine ledd',
			ledd: r.ledd,
			alt_label: r.alt_label,
			tekst: r.tekst,
			tags: r.tags
		}));
	// tomme ledd (f.eks. salme-plassholdere uten tekst) er meningsløse i søket
	const alle = [...egne, ...rows].filter((r) => (r.tekst ?? '').trim());
	const words = (q ?? '').toLowerCase().split(/[\s,]+/).filter((w) => w.length >= 2);
	const score = (r) => {
		const hay = (r.ledd + ' ' + r.seksjon + ' ' + (r.tags ?? '')).toLowerCase();
		let s = 0;
		for (const w of words) if (hay.includes(w)) s++;
		return s;
	};
	if (!words.length) {
		return alle
			.sort((a, b) => a.seksjon.localeCompare(b.seksjon, 'nb') || a.ledd.localeCompare(b.ledd, 'nb'))
			.slice(0, limit);
	}
	const scored = [];
	for (const r of alle) {
		const s = score(r);
		if (s > 0) scored.push({ row: r, score: s + (r.kilde.startsWith('Mine ledd') ? 0.5 : 0) });
	}
	scored.sort((a, b) => b.score - a.score
		|| a.row.seksjon.localeCompare(b.row.seksjon, 'nb')
		|| a.row.ledd.localeCompare(b.row.ledd, 'nb')
		|| a.row.alt_label.localeCompare(b.row.alt_label, 'nb'));
	return scored.slice(0, limit).map((s) => s.row);
}

function closeDb() {
	try { db?.close(); } catch {}
	db = null;
}

module.exports = { openDb, closeDb, dbGet, dbSet, recList, recTouch, recRemove, bibCounts, bibSig, bibSync, bibSearch, bibUserList, bibUserAdd, bibUserUpdate, bibUserDelete };
