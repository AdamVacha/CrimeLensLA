<script lang="ts">
	import { writable } from 'svelte/store';

	// Event options and their corresponding date ranges
	const events = [
		{ label: 'COVID-19 Pandemic', startDate: '2020-01-01', endDate: '2023-05-05' },
		{ label: 'Economic Recession', startDate: '2021-01-01', endDate: '2022-12-31' },
		{ label: 'Custom Event', startDate: '', endDate: '' }
	];
	// Placeholder data for options
	const crimeCategories = ['Theft', 'Assault', 'Burglary'];
	const laRegions = ['Central', 'East', 'West', 'South', 'North'];

	// State variables for selected options
	let selectedCategories = writable<string[]>([]);
	let selectedRegions = writable<string[]>([]);
	let selectedEvent = events[0];
	let startDate = selectedEvent.startDate;
	let endDate = selectedEvent.endDate;
	let eventPeriodStart = 0;
	let eventPeriodEnd = 6;

	// Function to update the date range when an event is selected
	function updateDateRange() {
		startDate = selectedEvent.startDate;
		endDate = selectedEvent.endDate;
	}

	// Function to detect manual date change and update the dropdown to "Custom Event"
	function handleDateChange() {
		if (startDate !== selectedEvent.startDate || endDate !== selectedEvent.endDate) {
			selectedEvent = events.find((event) => event.label === 'Custom Event') || {
				label: 'Custom Event',
				startDate: '',
				endDate: ''
			};
		}
	}
	function toggleSelection(array: string[], item: string) {
		return array.includes(item) ? array.filter((i) => i !== item) : [...array, item];
	}

	// Placeholder function for generating the trend
	function generateTrend() {
		console.log({
			selectedEvent: selectedEvent.label,
			startDate,
			endDate,
			eventPeriodStart,
			eventPeriodEnd,
			selectedCategories,
			selectedRegions
		});
	}
</script>

<div class="flex min-h-screen justify-center p-10 text-black">
	<div class="w-full max-w-7xl rounded-lg bg-gray-100 p-8 pb-20 shadow-lg">
		<h1 class="mb-16 mt-8 text-center text-2xl font-semibold">
			External Events Influence on Crime
		</h1>

		<div class="grid grid-cols-1 gap-8 lg:grid-cols-[35%_62%]">
			<!-- Left Column: Controls -->
			<div class="space-y-6">
				<!-- Select or Add Event -->
				<div>
					<label class="mb-2 block font-medium">Select or Add an Event:</label>
					<select
						bind:value={selectedEvent}
						class="select select-primary mb-2 w-full max-w-xs bg-white text-black"
						onchange={updateDateRange}
					>
						{#each events as event}
							<option value={event}>{event.label}</option>
						{/each}
					</select>
				</div>

				<!-- Custom Event Date Range -->
				<div>
					<label class="mb-2 block font-medium">Select Date Range (Custom Event):</label>
					<div class="flex items-center space-x-4">
						<input
							type="date"
							bind:value={startDate}
							class="custom-calendar-icon input input-bordered input-primary mb-2 mr-2 inline bg-white text-black"
							placeholder="Start Date"
							oninput={handleDateChange}
						/>
						To
						<input
							type="date"
							bind:value={endDate}
							class="custom-calendar-icon input input-bordered input-primary mb-2 mr-2 inline bg-white text-black"
							placeholder="End Date"
							oninput={handleDateChange}
						/>
					</div>
				</div>

				<!-- Define Event Period -->
				<div>
					<label class="mb-2 block font-medium">Define Event Period:</label>
					<div class="flex items-center space-x-4">
						<input
							type="range"
							min="0"
							max="12"
							bind:value={eventPeriodStart}
							class="range range-primary"
						/>
						<span class="text-gray-600">{eventPeriodStart}m before</span>
					</div>
					<div class="mt-2 flex items-center space-x-4">
						<input
							type="range"
							min="0"
							max="12"
							bind:value={eventPeriodEnd}
							class="range range-primary"
						/>
						<span class="text-gray-600">{eventPeriodEnd}m after</span>
					</div>
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
	.custom-calendar-icon::-webkit-calendar-picker-indicator {
		filter: invert(50%); /* Adjust the percentage to control color intensity */
	}
</style>
