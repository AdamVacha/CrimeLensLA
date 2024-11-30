<script lang="ts">
	let {
		categories = [],
		selectedCategories = [],
		onCategoryChange = (categories: string[]) => {}
	} = $props();

	// Toggle the category selection
	const toggleCategory = (category: string, checked: boolean) => {
		if (checked) {
			onCategoryChange([...selectedCategories, category]);
		} else {
			onCategoryChange(selectedCategories.filter((item) => item !== category));
		}
	};
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
				onchange={(e) => toggleCategory(category, e.currentTarget.checked)}
			/>
			<label for={`crime-category-${index}`}><span>{category}</span></label>
		</div>
	{/each}
</div>
