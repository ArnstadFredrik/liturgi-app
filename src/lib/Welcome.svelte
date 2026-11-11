<script>
	import { newServiceModal } from '$lib/modal.svelte.js';
	import { createService } from '$lib/store.svelte.js';
</script>

<div id="welcome">
	<h2>Liturgi</h2>
	<p>
		Lag gudstjenester fra malen «Hovedgudstjenesten» eller din lokale grunnordning,
		velg salmer, bytt ledd og alternativer, og eksporter til PDF, Word eller PowerPoint.
	</p>
	<p><button class="primary" onclick={() => newServiceModal(createService)}>Opprett gudstjeneste</button></p>
</div>
