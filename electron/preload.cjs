// Exponer fil-dialoger til rendereren (contextIsolation) via window.liturgi
const { contextBridge, ipcRenderer } = require('electron');

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
	bibSearch: (q) => ipcRenderer.invoke('bib:search', { q }),
	// lokale maler som filer i ~/.config/Liturgi/maler
	listTemplates: () => ipcRenderer.invoke('tpl:list'),
	readTemplate: (p) => ipcRenderer.invoke('tpl:read', { path: p }),
	writeTemplate: (p, json) => ipcRenderer.invoke('tpl:write', { path: p, json }),
	deleteTemplateFile: (p) => ipcRenderer.invoke('tpl:delete', { path: p }),
	isElectron: true
});
