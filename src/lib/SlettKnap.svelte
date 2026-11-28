<script>
	/** Ikon-knapp for å slette noe (søppelbøtte). Bekreftelsen (confirmBox)
	 *  holdes i modulen; komponenten gir kun samme utseende og 4,5 px
	 *  klikkmål. Klassene beholdes per bruk (ovr-slett, del-sec m.fl.). */
	import { mdi } from '$lib/mdi.js';

	let { onclick = () => {}, title = 'Slett', klasse = '', storrelse = 14 } = $props();
</script>

<button type="button" class={klasse} {title} onclick={onclick}>
	{@html mdi('delete-outline', storrelse)}
</button>
