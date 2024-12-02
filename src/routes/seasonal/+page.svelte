<script lang="ts">
	import { writable } from 'svelte/store';
	import { goto } from '$app/navigation';
	import { Chart } from 'chart.js/auto';
	import DateRangePicker from '$lib/components/DateRangePicker.svelte';
	import CrimeCategoriesSelect from '$lib/components/CrimeCategoriesSelect.svelte';
	import LaRegionSelect from '$lib/components/LaRegionSelect.svelte';
	import VictimDemographicsSelect from '$lib/components/VictimDemographicsSelect.svelte';
	import {
		CRIME_CATEGORIES,
		LA_REGIONS,
		VICTIM_AGE,
		VICTIM_GENDER,
		VICTIM_DESCENT
	} from '../../constants';
	import { getChartColor } from '$lib/utils/chart-colors';
	import { LA_REGIONS_MAP } from '$lib/utils/location-map';

	// Get data from server
	let { data } = $props();
	// set loading spinner
	let isLoading = $state(false);

	// Form Data Storage (empty string by default or URL loaded)
	let formData = $state({
		startDate: data.formParams.startDate ?? '',
		endDate: data.formParams.endDate ?? '',
		crimeCategories: data.formParams.crimeCategories,
		laRegions: data.formParams.laRegions,
		ageRange: data.formParams.ageRange ?? '',
		gender: data.formParams.gender ?? '',
		descent: data.formParams.descent ?? ''
	});

	function handleSubmission(e: any) {
		e.preventDefault();
		isLoading = true;

		// intantiate URL parameters object
		const params = new URLSearchParams();

		for (let categories of formData.crimeCategories) {
			params.append('crimeCategories', categories);
		}
		for (let region of formData.laRegions) {
			params.append('laRegions', region);
		}

		params.append('startDate', formData.startDate);
		params.append('endDate', formData.endDate);
		params.append('ageRange', formData.ageRange);
		params.append('gender', formData.gender);
		params.append('descent', formData.descent);

		goto(`/demographic?${params.toString()}`, { noScroll: true });
	}

	// State variables for form selections
	// TODO add these to formData to be tracked
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
	// TODO move to constants
	const seasons = ['All Seasons', 'Winter', 'Spring', 'Summer', 'Fall'];
	const holidays = ['All Holidays', "New Year's", 'Thanksgiving', 'Christmas'];
</script>

<form method="POST" onsubmit={handleSubmission}>
	{JSON.stringify(formData)}
	<div class="flex min-h-screen justify-center p-10 text-black">
		<div class="w-full max-w-7xl rounded-lg bg-gray-100 p-4 pb-10 shadow-lg">
			<h1 class="mb-2 mt-4 text-center text-2xl font-semibold">Seasonal Crime Trends</h1>
			<h2 class="text-grey text-grey-700 mb-2 mt-4 text-center text-lg font-semibold">
				"How do crime rates change during different seasons or holidays?"
			</h2>
			<p class="mx-auto mb-6 max-w-4xl text-lg leading-relaxed text-gray-600">
				This query explores how crime rates change during different seasons (e.g., summer vs.
				winter) or specific times like holidays (e.g., New Year’s Eve, Thanksgiving).
			</p>

			<div class="grid grid-cols-1 gap-8 lg:grid-cols-[35%_62%]">
				<!-- Left Column: Controls -->
				<div class="space-y-6">
					<!-- Filter By (Season/Holiday) -->
					<div>
						// TODO make these radios work again
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
					// TODO instate logic that converts this to start and end dates
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
						<CrimeCategoriesSelect
							categories={CRIME_CATEGORIES}
							selectedCategories={formData.crimeCategories}
							onCategoryChange={(categories: any) => (formData.crimeCategories = categories)}
						/>
					</div>

					<!-- LA Region Multi-Select -->
					<div>
						<LaRegionSelect
							regions={LA_REGIONS}
							selectedRegions={formData.laRegions}
							onRegionChange={(regions: any) => (formData.laRegions = regions)}
						/>
					</div>

					<!-- Generate Crime Trend Button -->
					<div class="flex w-full justify-center pt-4">
						<button type="submit" class="btn btn-primary w-60 text-base"
							>Generate Crime Trend
						</button>
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
</form>
