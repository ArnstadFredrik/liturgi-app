// Exponer fil-dialoger til rendereren (contextIsolation) via window.liturgi
const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('liturgi', {
	saveFile: (payload) => ipcRenderer.invoke('liturgi:save-file', payload),
	openFile: () => ipcRenderer.invoke('liturgi:open-file'),
	/** Ring cb(payload) når en .liturgi-fil åpnes fra Finder. */
	onOpenFile: (cb) => {
		ipcRenderer.on('liturgi:open-path', (_e, payload) => cb(payload));
		// meld fra at lytteren er registrert, så eventuelle filer i kø leveres
		ipcRenderer.send('liturgi:renderer-ready');
	},
	// gudstjenester som filer på disk
	readService: (p) => ipcRenderer.invoke('svc:read', { path: p }),
	writeService: (p, json) => ipcRenderer.invoke('svc:write', { path: p, json }),
	saveServiceAs: (defaultName, json) => ipcRenderer.invoke('svc:save-as', { defaultName, json }),
	deleteService: (p) => ipcRenderer.invoke('svc:delete', { path: p }),
	// sqlite-oppsett: innstillinger + siste gudstjenester (filbaner)
	dbGet: (key) => ipcRenderer.invoke('db:get', key),
	dbSet: (key, value) => ipcRenderer.invoke('db:set', { key, value }),
	listRecent: () => ipcRenderer.invoke('rec:list'),
	touchRecent: (p, name, date) => ipcRenderer.invoke('rec:touch', { path: p, name, date }),
	removeRecent: (p) => ipcRenderer.invoke('rec:remove', { path: p }),
	// bibliotek: oppslagsregister over hovedgudstjenesten (sqlite)
	bibSync: (source, entries) => ipcRenderer.invoke('bib:sync', { source, entries }),
	bibCounts: () => ipcRenderer.invoke('bib:counts'),
	visNatMeny: (punkter) => ipcRenderer.invoke('ctx:nativ', punkter),
	bibUserList: () => ipcRenderer.invoke('bib:user:list'),
	bibUserAdd: (r) => ipcRenderer.invoke('bib:user:add', r),
	bibUserUpdate: (id, r) => ipcRenderer.invoke('bib:user:update', { id, r }),
	bibUserDelete: (id) => ipcRenderer.invoke('bib:user:delete', { id }),
	bibSearch: (q) => ipcRenderer.invoke('bib:search', { q }),
	setDirty: (v) => ipcRenderer.send('app:dirty', !!v),
	onSaveThenClose: (cb) => ipcRenderer.on('app:save-then-close', () => cb()),
	forceClose: () => ipcRenderer.send('app:force-close'),
	appInfo: () => ipcRenderer.invoke('app:info'),
	lagrePdf: (base64, filnavn, sti) => ipcRenderer.invoke('eksport:lagre-pdf', { base64, filnavn, sti }),
	// lokale maler som filer i ~/.config/Liturgi/maler
	listTemplates: () => ipcRenderer.invoke('tpl:list'),
	konverterMal: () => ipcRenderer.invoke('mal:konverter'),
	/** Konverter en spesifikk filsti (drag-and-drop / filvelger i modalen). */
	konverterMalSti: (sti) => ipcRenderer.invoke('mal:konverter-fil', { sti }),
	/** Filsti til en File fra drag-and-drop (Electron 32+ krever webUtils). */
	stiFraFil: (fil) => {
		try { return webUtils.getPathForFile(fil); } catch { return null; }
	},
	readTemplate: (p) => ipcRenderer.invoke('tpl:read', { path: p }),
	writeTemplate: (p, json) => ipcRenderer.invoke('tpl:write', { path: p, json }),
	deleteTemplateFile: (p) => ipcRenderer.invoke('tpl:delete', { path: p }),
	isElectron: true,
	platform: process.platform, // 'darwin' | 'win32' | 'linux'
	setNativeTheme: (t) => ipcRenderer.send('tema:naativ', t),
	apneMappe: (p) => ipcRenderer.invoke('apne:mappe', p),
	onMenyHandling: (cb) => ipcRenderer.on('meny:handling', (_e, id) => cb(id)),
	sendMenyTilstand: (st) => ipcRenderer.send('app:meny-tilstand', st),
	// DEV: malredigeringsverktøy — main-prosessen avgjør (isPackaged)
	devTilstand: () => ipcRenderer.invoke('dev:tilstand'),
	devUtkast: () => ipcRenderer.invoke('dev:utkast'),
	diffAgenter: () => ipcRenderer.invoke('dev:diff-agenter'),
	diffLes: (fil) => ipcRenderer.invoke('dev:diff-les', fil),
	devLesUtkast: (fil) => ipcRenderer.invoke('dev:les-utkast', fil),
	slettUtkast: (fil) => ipcRenderer.invoke('dev:slett-utkast', fil),
	lagreUtkast: (mal, fast) => ipcRenderer.invoke('dev:lagre-utkast', { mal, fast }),
	lagreDataJs: (mal) => ipcRenderer.invoke('dev:lagre-datajs', { mal }),
	// prekenforberedelser: mappe-tre, filer og prosjekt-oppsett
	forbVelgMappe: (defaultSti) => ipcRenderer.invoke('forb:velg-mappe', { defaultSti }),
	forbMappe: (p) => ipcRenderer.invoke('forb:mappe', { path: p }),
	forbLesFil: (p) => ipcRenderer.invoke('forb:les-fil', { path: p }),
	forbLagreFil: (p, tekst) => ipcRenderer.invoke('forb:lagre-fil', { path: p, tekst }),
	forbLagProsjekt: (payload) => ipcRenderer.invoke('forb:lag-prosjekt', payload),
	forbMigrer: (fra, til) => ipcRenderer.invoke('forb:migrer', { fra, til }),
	// salmedatabasen (gudstjeneste.no)
	salmeLagreLogin: (user, pass) => ipcRenderer.invoke('salme:lagre-login', { user, pass }),
	salmeStatus: () => ipcRenderer.invoke('salme:status'),
	salmeLoggUt: () => ipcRenderer.invoke('salme:logg-ut'),
	salmeHent: (payload) => ipcRenderer.invoke('salme:hent', payload),
	salmeTestLogin: () => ipcRenderer.invoke('salme:test-login'),
	salmeHentFlere: (payload) => ipcRenderer.invoke('salme:hent-flere', payload),
});
