import { test } from 'node:test';
import assert from 'node:assert/strict';
import { forbRekkeForDag } from '../../src/lib/kirkeaar.js';

const dager = [
	{ date: '2026-12-20', series: 'II' }, // 4. søndag i advent
	{ date: '2026-12-24', series: 'A' }, // Julaften
	{ date: '2026-12-25', series: 'A' }, // Juledag
	{ date: '2026-12-26', series: 'II' }, // 2. Juledag
	{ date: '2026-12-27', series: 'II' }, // Romjulssøndag
	{ date: '2027-01-06', series: 'III' }, // åpenbaring
	{ date: '2027-01-10', series: 'A' } // alternativ søndag
];

test('hovedrekker mapper direkte til mappenavn', () => {
	assert.equal(forbRekkeForDag({ date: '2026-12-20', series: 'I' }, dager), 'Første');
	assert.equal(forbRekkeForDag({ date: '2026-12-20', series: 'II' }, dager), 'Andre');
	assert.equal(forbRekkeForDag({ date: '2026-12-20', series: 'III' }, dager), 'Tredje');
});

test('alternative dager legger seg i nrmeste hovedrekkes mappe', () => {
	// Julaften (2026-12-24): nrmeste hovedrekke-dager er II p begge sider
	assert.equal(forbRekkeForDag({ date: '2026-12-24', series: 'A' }, dager), 'Andre');
	assert.equal(forbRekkeForDag({ date: '2026-12-25', series: 'A' }, dager), 'Andre');
	// 2027-01-10 er nrmere 01-06 (III, 4 dager) enn 12-27 (II, 14 dager)
	assert.equal(forbRekkeForDag({ date: '2027-01-10', series: 'A' }, dager), 'Tredje');
});

test('fallback: ingen dager/ingen dato gir Første', () => {
	assert.equal(forbRekkeForDag({ date: '2026-12-24', series: 'A' }, []), 'Første');
	assert.equal(forbRekkeForDag({ date: '2026-12-24', series: 'A' }, null), 'Første');
	assert.equal(forbRekkeForDag(null, dager), 'Første');
});
