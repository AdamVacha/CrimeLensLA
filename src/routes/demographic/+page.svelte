<script lang="ts">
	import { goto } from '$app/navigation';
	import { Chart } from 'chart.js/auto';
	import DateRangePicker from '../../components/DateRangePicker.svelte';
	import CrimeCategoriesSelect from '../../components/CrimeCategoriesSelect.svelte';
	import LARegionSelect from '../../components/LARegionSelect.svelte';
	import VictimDemographicsSelect from '../../components/VictimDemographicsSelect.svelte';
	import {
		CRIME_CATEGORIES,
		LA_REGIONS,
		VICTIM_AGE,
		VICTIM_GENDER,
		VICTIM_DESCENT
	} from '../../constants';

	// Get data from server
	let { data } = $props();

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

		goto(`/demographic?${params.toString()}`);
	}
</script>

<form method="POST" onsubmit={handleSubmission}>
	{JSON.stringify(formData)}
	<div class="flex min-h-screen justify-center p-10 text-black">
		<div class="w-full max-w-7xl rounded-lg bg-gray-100 p-8 pb-20 shadow-lg">
			<h1 class="mb-16 mt-8 text-center text-2xl font-semibold text-black">
				Demographic Influence on Crime
			</h1>

			<div class="grid grid-cols-1 gap-8 lg:grid-cols-[35%_62%]">
				<!-- Left Column: Controls -->
				<div class="space-y-6 text-base">
					<!-- Date Range Picker -->
					<div>
						<label for="date-range-picker" class="mb-2 block text-base font-medium"
							>Select Date Range:</label
						>
						<DateRangePicker
							startDate={formData.startDate}
							endDate={formData.endDate}
							minDate="2020-11-10"
							maxDate="2024-11-15"
							on:startDateChange={(e) => (formData.startDate = e.detail)}
							on:endDateChange={(e) => (formData.endDate = e.detail)}
						/>
					</div>

					<CrimeCategoriesSelect
						categories={CRIME_CATEGORIES}
						selectedCategories={formData.crimeCategories}
						on:categoryChange={(e) => (formData.crimeCategories = e.detail)}
					/>

					<LARegionSelect
						regions={LA_REGIONS}
						selectedRegions={formData.laRegions}
						on:regionChange={(e) => (formData.laRegions = e.detail)}
					/>

					<VictimDemographicsSelect
						victimAge={VICTIM_AGE}
						victimGender={VICTIM_GENDER}
						victimDescent={VICTIM_DESCENT}
						selectedAge={formData.ageRange}
						selectedGender={formData.gender}
						selectedDescent={formData.descent}
						on:ageChange={(e) => (formData.ageRange = e.detail)}
						on:genderChange={(e) => (formData.gender = e.detail)}
						on:descentChange={(e) => (formData.descent = e.detail)}
					/>

					<!-- Generate Trend Button -->
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
						<!-- Add chart library code here -->
					</div>
				</div>
			</div>
		</div>
	</div>
</form>
