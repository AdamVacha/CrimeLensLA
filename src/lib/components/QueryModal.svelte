<script lang="ts">
	let { query = '' } = $props();
	import { writable } from 'svelte/store';

	let isModalOpen = writable(false);
	function openModal() {
		isModalOpen.set(true);
	}
	function closeModal() {
		isModalOpen.set(false);
	}
</script>

<div class="relative">
	<!-- Display Query Button -->
	<button type="button" class="btn btn-secondary btn-xs text-black" onclick={openModal}>
		Display Query
	</button>
	{#if $isModalOpen}
		<!-- Modal -->
		<div class="modal modal-open">
			<div class="modal-box flex flex-col text-white">
				<h3 class="text-lg font-bold">SQL Query:</h3>
				<pre class="flex-1 overflow-y-auto whitespace-pre-wrap rounded-lg p-4">
					{query}
				</pre>
				<div class="modal-action">
					<button class="btn btn-secondary" type="button" onclick={closeModal}> Close </button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	pre {
		overflow-x: auto;
		white-space: pre-wrap;
		word-wrap: break-word;
	}
</style>
