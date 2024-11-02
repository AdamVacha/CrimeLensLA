<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	// Placeholder data for options
	const crimeCategories = ['Theft', 'Assault', 'Burglary'];
	const laRegions = ['Central', 'East', 'West', 'South', 'North'];

	// State variables for selected options
	let selectedCategories = writable<string[]>([]);
	let selectedRegions = writable<string[]>([]);
	let timeGranularity = 'Month';
	let startDate = ''; // Placeholder for date range picker
	let endDate = ''; // Placeholder for date range picker

	function toggleSelection(array: string[], item: string) {
		return array.includes(item) ? array.filter((i) => i !== item) : [...array, item];
	}

	function generateTrend() {
		// Placeholder function for generating trend chart
		console.log('Selected Categories:', $selectedCategories);
		console.log('Selected Regions:', $selectedRegions);
		console.log('Generating crime trend...');
	}
</script>

<div class="flex min-h-screen justify-center p-10 text-black">
	<div class="w-full max-w-6xl rounded-lg bg-white p-8 pb-20 shadow-lg">
		<h1 class="mb-16 mt-8 text-center text-2xl font-semibold text-black">
			Geographic Variation in Crime
		</h1>

		<div class="grid grid-cols-1 gap-8 lg:grid-cols-[38%_60%]">
			<!-- Left Column: Controls -->
			<div class="space-y-6 text-base">
				<!-- Date Range Picker -->
				<div>
					<label class="mb-2 block text-base font-medium">Select Date Range:</label>
					<input
						type="date"
						bind:value={startDate}
						class="custom-calendar-icon input input-bordered input-primary mb-2 mr-2 inline bg-white text-black"
						placeholder="Start Date"
					/>
					To
					<input
						type="date"
						bind:value={endDate}
						class="custom-calendar-icon input input-bordered input-primary mb-2 mr-2 inline bg-white text-black"
						placeholder="End Date"
					/>
				</div>

				<!-- Crime Categories Multi-Select -->
				<div>
					<label class="mb-2 block font-medium">Select Crime Categories:</label>
					{#each crimeCategories as category}
						<div class="mb-2 mr-6 inline items-center">
							<input
								type="checkbox"
								on:change={() =>
									selectedCategories.set(toggleSelection($selectedCategories, category))}
								class="checkbox-primary checkbox mr-1"
								checked={$selectedCategories.includes(category)}
							/>
							<span>{category}</span>
						</div>
					{/each}
				</div>

				<!-- LA Region Multi-Select -->
				<div>
					<label class="mb-2 block font-medium">Select LA Regions:</label>
					{#each laRegions as region}
						<div class="mb-2 mr-6 flex items-center">
							<input
								type="checkbox"
								on:change={() => selectedRegions.set(toggleSelection($selectedRegions, region))}
								class="checkbox-primary checkbox mr-2"
								checked={$selectedRegions.includes(region)}
							/>
							<span>{region}</span>
						</div>
					{/each}
				</div>

				<!-- Generate Trend Button -->
				<div class="flex w-full justify-center pt-2">
					<button on:click={generateTrend} class="btn btn-primary w-60 text-base"
						>Generate Crime Trend</button
					>
				</div>
			</div>

			<!-- Right Column: Chart Placeholder -->
			<div class="flex items-center justify-center rounded-lg bg-gray-100 p-6 shadow-inner">
				<!-- Placeholder for the Chart -->
				<div class="text-center">
					<h2 class="mb-4 text-xl font-semibold">Chart Title</h2>
					<p class="text-gray-500">Chart goes here.</p>
					<!-- Add chart library code here -->
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.custom-calendar-icon::-webkit-calendar-picker-indicator {
		filter: invert(50%); /* Adjust the percentage to control color intensity */
	}
</style>
