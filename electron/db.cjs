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

module.exports = { openDb, dbGet, dbSet, recList, recTouch, recRemove };
