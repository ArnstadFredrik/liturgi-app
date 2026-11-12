// Skriver byggnummer (YYYYMMDD.HHMM) til build/.byggnr — vises på innstillingssiden.
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const buildDir = join(root, 'electron');
const fil = join(buildDir, 'byggnr.txt');
const forrige = existsSync(fil) ? readFileSync(fil, 'utf8').trim() : '';
// behold samme byggnummer hvis vi bygger samme minutt (unngå unødvendig endring)
const naa = new Date();
const byggnummer = forrige.startsWith(naa.toISOString().slice(0, 10).replace(/-/g, ''))
	? forrige
	: `${naa.getFullYear()}${String(naa.getMonth() + 1).padStart(2, '0')}${String(naa.getDate()).padStart(2, '0')}.${String(naa.getHours()).padStart(2, '0')}${String(naa.getMinutes()).padStart(2, '0')}`;
mkdirSync(buildDir, { recursive: true });
writeFileSync(fil, byggnummer);
console.log('byggnr:', byggnummer);
