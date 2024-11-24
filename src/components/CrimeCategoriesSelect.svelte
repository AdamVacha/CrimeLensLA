<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	// Props
	export let categories: string[] = []; // List of available crime categories
	export let selectedCategories: string[] = []; // List of selected categories

	// Define the event type
	type CrimeCategoriesSelectEvents = {
		categoryChange: string[];
	};

	// Set up event dispatcher
	const dispatch = createEventDispatcher();

	// Toggle the category selection
	function toggleCategory(category: string, checked: boolean) {
		if (checked) {
			dispatch('categoryChange', [...selectedCategories, category]);
		} else {
			dispatch(
				'categoryChange',
				selectedCategories.filter((item) => item !== category)
			);
		}
	}
</script>

<div>
	<label for="crime-categories" class="mb-2 block font-medium">Select Crime Categories:</label>
	{#each categories as category, index}
		<div class="mb-2 mr-6 inline items-center">
			<input
				type="checkbox"
				id={`crime-category-${index}`}
				class="checkbox-primary checkbox mr-1"
				value={category}
				checked={selectedCategories.includes(category)}
				on:change={(e) => toggleCategory(category, e.currentTarget.checked)}
			/>
			<label for={`crime-category-${index}`}><span>{category}</span></label>
		</div>
	{/each}
</div>
