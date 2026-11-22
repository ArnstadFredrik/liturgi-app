<script>
	import { toast } from 'svelte-sonner';
	import { loadTemplatesFromDisk } from '$lib/fileio.svelte.js';
	import { mdi } from '$lib/mdi.js';

	let { onLukk } = $props();

	const isElectron = typeof window !== 'undefined' && !!window.liturgi?.isElectron;
	let dragOver = $state(false);
	let konverterer = $state(false);

	const SKILL_URL = 'https://github.com/ArnstadFredrik/liturgi-limal-skill';
	const FORMAT_URL = 'https://github.com/ArnstadFredrik/liturgi-app/blob/main/docs/limal-format.md';

	async function konverterSti(sti) {
		if (konverterer) return;
		if (!/\.(docx|pdf)$/i.test(sti)) {
			toast.error('Filformatet støttes ikke — bruk .docx eller .pdf');
			return;
		}
		konverterer = true;
		try {
			const r = await window.liturgi.konverterMalSti(sti);
			if (!r.ok) {
				toast.error('Klarte ikke konvertere: ' + (r.error ?? 'ukjent feil'));
				return;
			}
			await loadTemplatesFromDisk();
			const advarsel = r.advarsler?.length ? ' — sjekk variant-gruppering og roller i redigeringsvisningen' : '';
			toast.success(`Konvertert: ${r.name} (${r.seksjoner} hoveddeler, ${r.ledd} ledd)${advarsel}`);
			onLukk?.();
		} finally {
			konverterer = false;
		}
	}

	function velgFil() {
		const inp = document.createElement('input');
		inp.type = 'file';
		inp.accept = '.docx,.pdf';
		inp.onchange = async () => {
			const f = inp.files?.[0];
			if (!f) return;
			const sti = window.liturgi?.stiFraFil?.(f);
			if (!sti) { toast.error('Fant ikke filstien'); return; }
			await konverterSti(sti);
		};
		inp.click();
	}

	function onDrop(e) {
		e.preventDefault();
		dragOver = false;
		const f = e.dataTransfer?.files?.[0];
		if (!f) return;
		const sti = window.liturgi?.stiFraFil?.(f);
		if (!sti) { toast.error('Fant ikke filstien'); return; }
		konverterSti(sti);
	}

	function onDragOver(e) {
		e.preventDefault();
		dragOver = true;
	}
</script>

<div class="kvm-bakgrunn" role="presentation" onclick={(e) => { if (e.target === e.currentTarget) onLukk?.(); }}>
	<div class="kvm-kort" role="dialog" aria-modal="true" aria-label="Konverter til liturgimal">
		<header class="kvm-hode">
			<h2>Konverter til liturgimal</h2>
			<button class="kvm-lukk" onclick={() => onLukk?.()} title="Lukk" aria-label="Lukk">{@html mdi('close', 16)}</button>
		</header>

		<div
			class="kvm-dropp {dragOver ? 'over' : ''}"
			role="button"
			tabindex="0"
			ondragover={onDragOver}
			ondragleave={() => (dragOver = false)}
			ondrop={onDrop}
			onclick={velgFil}
			onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') velgFil(); }}
		>
			<span class="kvm-dropp-ikon">{@html mdi(isElectron ? 'file-upload-outline' : 'file-cancel-outline', 28)}</span>
			{#if isElectron}
				<p class="kvm-dropp-tittel">{konverterer ? 'Konverterer …' : 'Dra en Word- eller PDF-liturgi hit'}</p>
				<p class="kvm-dropp-alt">eller <button class="kvm-velg" onclick={(e) => { e.stopPropagation(); velgFil(); }}>velg fil …</button></p>
			{:else}
				<p class="kvm-dropp-tittel">Konvertering krever Mac-appen</p>
			{/if}
		</div>

		<div class="kvm-info">
			<div class="kvm-blokk">
				<h3>{@html mdi('cog-outline', 14)} I appen (offline)</h3>
				<p>Skriptet <code>electron/konverter.cjs</code> leser filen lokalt og lager et førsteutkast: hoveddeler og leddtittler fra overskrifter/nummerering, rolleprefiks (<code>L |</code>) blir rolle-markering, bibelreferanser blir <code>BIBELREF |</code>, rubrikker blir <code>@NOTAT</code> og salmelinjer blir salmeledd. Resultatet er heuristisk — kontroller variant-gruppering («Eller»-tekster) og roller i redigeringsvisningen etterpå.</p>
			</div>
			<div class="kvm-blokk">
				<h3>{@html mdi('robot-outline', 14)} Foretrukket: konvertering med LLM</h3>
				<p>For best resultat, bruk konverterings-skillen i Hermes: lever docx/pdf-filen til agenten, som følger arbeidsflyten i <code>SKILL.md</code> (skript for utkast + finpuss av roller, varianter og <code>alts</code>-gruppering) og validerer mot formatspesifikasjonen.</p>
				<ul class="kvm-steg">
					<li>Skillen er installert i Hermes-profilen og lastes automatisk når en docx/pdf-liturgi skal bli mal.</li>
					<li>Reglene hentes alltid fra formatspesifikasjonen i liturgi-app-repoet, slik at konverteringen følger siste utgave av formatet.</li>
				</ul>
				<p class="kvm-lenker">
					<a href={SKILL_URL} target="_blank" rel="noreferrer">Skill-repo (konverteringsregler og skript)</a>
					<a href={FORMAT_URL} target="_blank" rel="noreferrer">Formatspesifikasjon (.limal)</a>
				</p>
			</div>
		</div>
	</div>
</div>

<style>
	.kvm-bakgrunn {
		position: fixed; inset: 0; z-index: 300;
		background: rgba(20, 16, 12, 0.45);
		display: flex; align-items: center; justify-content: center;
	}
	.kvm-kort {
		background: var(--panel2);
		border: 1px solid var(--border);
		border-radius: var(--radius-modal);
		box-shadow: var(--shadow);
		width: clamp(440px, 92vw, 640px);
		max-height: 86vh;
		overflow-y: auto;
		padding: 18px 20px 20px;
	}
	.kvm-hode { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
	.kvm-hode h2 { font-size: 16px; font-weight: 600; margin: 0; color: var(--text); }
	.kvm-lukk {
		border: none; background: transparent; color: var(--muted);
		cursor: pointer; padding: 4px; border-radius: 6px; display: flex;
	}
	.kvm-lukk:hover { color: var(--text); background: var(--sidebar-hover); }
	.kvm-dropp {
		border: 2px dashed var(--border);
		border-radius: var(--radius-kort);
		padding: 26px 16px;
		text-align: center;
		color: var(--muted);
		cursor: pointer;
		transition: border-color 120ms ease, background 120ms ease;
	}
	.kvm-dropp.over { border-color: var(--accent); background: var(--accent-dim); }
	.kvm-dropp-ikon { display: inline-flex; color: var(--accent); margin-bottom: 6px; }
	.kvm-dropp-tittel { margin: 0 0 4px; font-size: 14px; color: var(--text); }
	.kvm-dropp-alt { margin: 0; font-size: 13px; }
	.kvm-velg {
		border: none; background: transparent; padding: 0;
		color: var(--accent); cursor: pointer; font: inherit; text-decoration: underline;
	}
	.kvm-info { margin-top: 14px; display: grid; gap: 10px; }
	.kvm-blokk {
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 10px 12px;
	}
	.kvm-blokk h3 {
		display: flex; align-items: center; gap: 6px;
		margin: 0 0 6px; font-size: 12px; font-weight: 600;
		text-transform: uppercase; letter-spacing: 0.04em; color: var(--muted);
	}
	.kvm-blokk p { margin: 0 0 6px; font-size: 13px; line-height: 1.5; color: var(--text); }
	.kvm-blokk p:last-child { margin-bottom: 0; }
	.kvm-blokk code {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 12px;
		background: var(--sidebar-hover);
		border-radius: 4px;
		padding: 1px 5px;
	}
	.kvm-steg { margin: 0 0 6px; padding-left: 18px; font-size: 13px; line-height: 1.5; color: var(--text); }
	.kvm-lenker { display: flex; flex-direction: column; gap: 4px; }
	.kvm-lenker a { color: var(--accent); font-size: 13px; }
</style>
