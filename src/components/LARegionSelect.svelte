<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	// Props
	export let regions: string[] = []; // List of available regions
	export let selectedRegions: string[] = []; // List of selected regions

	// Set up event dispatcher
	const dispatch = createEventDispatcher();

	// Toggle a region's selection
	function toggleRegion(region: string, checked: boolean) {
		if (region === 'All Regions') {
			dispatch('regionChange', checked ? regions.filter((r) => r !== 'All Regions') : []);
		} else {
			if (checked) {
				dispatch('regionChange', [...selectedRegions, region]);
			} else {
				dispatch(
					'regionChange',
					selectedRegions.filter((r) => r !== region)
				);
			}
		}
	}
</script>

<div>
	<label for="region-select" class="mb-2 block font-medium">Select LA Regions:</label>
	{#each regions as region, index}
		<div class="mb-2 mr-6 flex items-center">
			<input
				type="checkbox"
				id={`region-select-${index}`}
				class="checkbox-primary checkbox mr-2"
				value={region}
				checked={selectedRegions.includes(region)}
				on:change={(e) => toggleRegion(region, e.currentTarget.checked)}
			/>
			<label for={`region-select-${index}`} class="mr-2">{region}</label>
		</div>
	{/each}
</div>
