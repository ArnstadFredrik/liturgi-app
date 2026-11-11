// SQLite-database for appinnstillinger (ligger i ~/.config/Liturgi, utenfor
// app-pakken, så den overlever appoppdateringer).
const os = require('os');
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

let db = null;

function openDb() {
	if (db) return db;
	const dir = path.join(os.homedir(), '.config', 'Liturgi');
	fs.mkdirSync(dir, { recursive: true });
	db = new Database(path.join(dir, 'liturgi.db'));
	db.pragma('journal_mode = WAL');
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
	`);
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

function bibSync(source, entries) {
	const db = openDb();
	db.prepare('DELETE FROM bibliotek WHERE kilde = ?').run(source);
	const ins = db.prepare(
		'INSERT INTO bibliotek (kilde, seksjon, ledd, alt_label, tekst) VALUES (?, ?, ?, ?, ?)'
	);
	db.transaction(() => {
		for (const e of entries) ins.run(source, e.seksjon, e.ledd, e.alt_label ?? '', e.tekst ?? '');
	})();
}

function bibSearch(q, limit = 30) {
	// Fuzzy: hent alle rader (registeret er lite) og score i JS.
	// Hvert søkeord telles hvis det er prefiks av et ord i ledd/seksjon —
	// ord i HVA SOM HELST rekkefølge («hellig sanctus» finner «Sanctus»).
	const rows = openDb()
		.prepare('SELECT kilde, seksjon, ledd, alt_label, tekst FROM bibliotek')
		.all();
	const words = (q ?? '').toLowerCase().split(/[\s,]+/).filter((w) => w.length >= 2);
	if (!words.length) {
		return rows
			.sort((a, b) => a.seksjon.localeCompare(b.seksjon, 'nb') || a.ledd.localeCompare(b.ledd, 'nb'))
			.slice(0, limit);
	}
	const scored = [];
	for (const r of rows) {
		const hay = (r.ledd + ' ' + r.seksjon).toLowerCase();
		let score = 0;
		for (const w of words) if (hay.includes(w)) score++;
		if (score > 0) scored.push({ row: r, score });
	}
	scored.sort((a, b) => b.score - a.score
		|| a.row.seksjon.localeCompare(b.row.seksjon, 'nb')
		|| a.row.ledd.localeCompare(b.row.ledd, 'nb')
		|| a.row.alt_label.localeCompare(b.row.alt_label, 'nb'));
	return scored.slice(0, limit).map((s) => s.row);
}

module.exports = { openDb, dbGet, dbSet, recList, recTouch, recRemove, bibSync, bibSearch };
