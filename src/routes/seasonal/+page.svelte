<script lang="ts">
	import { writable } from 'svelte/store';

	// Placeholder data for options
	const crimeCategories = ['Theft', 'Assault', 'Burglary'];
	const laRegions = ['Central', 'East', 'West', 'South', 'North'];

	// State variables for selected options
	let selectedCategories = writable<string[]>([]);
	let selectedRegions = writable<string[]>([]);
	// State variables for form selections
	let filterBy = 'Season';
	let selectedSeason = 'All Seasons';
	let selectedHoliday = 'All Holidays';
	let startYear = 2020;
	let endYear = 2024;

	function validateYearRange() {
		if (endYear < startYear) {
			endYear = startYear;
		}
	}
	// Options for dropdowns
	const seasons = ['All Seasons', 'Winter', 'Spring', 'Summer', 'Fall'];
	const holidays = ['All Holidays', "New Year's", 'Thanksgiving', 'Christmas'];

	function toggleSelection(array: string[], item: string) {
		return array.includes(item) ? array.filter((i) => i !== item) : [...array, item];
	}
	function generateTrend() {
		console.log('Generating crime trend...');
	}
</script>

<div class="flex min-h-screen justify-center p-10 text-black">
	<div class="w-full max-w-7xl rounded-lg bg-gray-100 p-8 pb-20 shadow-lg">
		<h1 class="mb-16 mt-8 text-center text-2xl font-semibold">Seasonal Crime Trends</h1>

		<div class="grid grid-cols-1 gap-8 lg:grid-cols-[35%_62%]">
			<!-- Left Column: Controls -->
			<div class="space-y-6">
				<!-- Filter By (Season/Holiday) -->
				<div>
					<label class="mb-2 block font-medium">Filter by:</label>
					<div class="flex space-x-4">
						<label class="flex items-center space-x-2">
							<input
								type="radio"
								name="radio-2"
								bind:group={filterBy}
								class="radio-primary radio"
								value="Season"
							/>
							<span>Season</span>
						</label>
						<label class="flex items-center space-x-2">
							<input
								type="radio"
								name="radio-2"
								bind:group={filterBy}
								class="radio-primary radio"
								value="Holiday"
							/>
							<span>Holiday</span>
						</label>
					</div>
				</div>

				<!-- Select Season -->
				<div>
					<label class="mb-2 block font-medium">Select Season:</label>
					<select
						class="select select-primary mb-2 w-full max-w-xs bg-white disabled:border-none disabled:bg-gray-200 disabled:text-gray-500"
						bind:value={selectedSeason}
						disabled={filterBy !== 'Season'}
					>
						{#each seasons as season}
							<option>{season}</option>
						{/each}
					</select>
				</div>

				<!-- Select Holiday -->
				<div>
					<label class="mb-2 block font-medium">Select Holiday:</label>
					<select
						class="select select-primary mb-2 w-full max-w-xs bg-white disabled:border-none disabled:bg-gray-200 disabled:text-gray-500"
						bind:value={selectedHoliday}
						disabled={filterBy !== 'Holiday'}
					>
						{#each holidays as holiday}
							<option>{holiday}</option>
						{/each}
					</select>
				</div>

				<!-- Select Year Range -->
				<div class="year-input">
					<label>Start Year:</label>
					<input
						type="number"
						bind:value={startYear}
						min="2020"
						max="2024"
						oninput={validateYearRange}
					/>

					<label>End Year:</label>
					<input
						type="number"
						bind:value={endYear}
						min="2020"
						max="2024"
						oninput={validateYearRange}
					/>
				</div>
				<!-- Crime Categories Multi-Select -->
				<div>
					<label class="mb-2 block font-medium">Select Crime Categories:</label>
					{#each crimeCategories as category}
						<div class="mb-2 mr-6 inline items-center">
							<input
								type="checkbox"
								onchange={() =>
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
								onchange={() => selectedRegions.set(toggleSelection($selectedRegions, region))}
								class="checkbox-primary checkbox mr-2"
								checked={$selectedRegions.includes(region)}
							/>
							<span>{region}</span>
						</div>
					{/each}
				</div>

				<!-- Generate Crime Trend Button -->
				<div class="flex w-full justify-center pt-4">
					<button onclick={generateTrend} class="btn btn-primary mt-2 w-60 text-base"
						>Generate Crime Trend</button
					>
				</div>
			</div>

			<!-- Right Column: Chart Placeholder -->
			<div class="flex items-center justify-center rounded-lg bg-gray-200 p-6 shadow-inner">
				<!-- Placeholder for the Chart -->
				<div class="text-center">
					<h2 class="mb-4 text-xl font-semibold">Chart Title</h2>
					<p class="text-gray-500">Chart goes here.</p>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
</style>
