<script lang="ts">
	import { goto } from '$app/navigation';
	import { Chart } from 'chart.js/auto';
	import { onMount } from 'svelte';
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
	import { getAgeGroup } from '$lib/utils/age-helper';
	import { getChartColor } from '$lib/utils/chart-colors';

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
	// instantiate chart data
	interface DataSet {
		label: string;
		data: number[];
		borderColor: string;
		fill: boolean;
	}
	// instantiate Chart Component
	let chartCanvas: HTMLCanvasElement;
	let chart: Chart;

	$effect(() => {
		if (chartCanvas && data.result?.rows) {
			if (chart) chart.destroy();

			type crimeRow = {
				crimeCode: string;
				crimeDesc: string;
				date: string;
				location: string;
				ethnicity: string;
				gender: string;
				age: number;
				incidentCount: number;
			};

			const typedRows = data.result.rows.map(
				(row: any) =>
					({
						crimeCode: row[0],
						crimeDesc: row[1],
						date: new Date(row[2]).toLocaleDateString('en-US', {
							year: 'numeric',
							month: 'short'
						}),
						location: row[3],
						ethnicity: row[4],
						gender: row[5],
						age: row[6],
						incidentCount: row[7]
					}) satisfies crimeRow
			);
			// get unique months for X-axis
			const months = [...new Set(typedRows.map((row) => row.date))].sort(
				(a, b) => new Date(a).getTime() - new Date(b).getTime()
			);

			// get unique locations for each line
			const locations = [...new Set(typedRows.map((row) => row.location))].sort();

			// create datasets
			const datasets = locations.map((location, index) => {
				// for each location, map out its incidents over months
				const monthlyData = months.map((month) => {
					const incidents = typedRows
						.filter((row) => row.location === location && row.date === month)
						.reduce((sum, row) => sum + row.incidentCount, 0);
					return incidents;
				});
				return {
					label: location,
					data: monthlyData,
					borderColor: getChartColor(index),
					fill: false
				};
			});

			chart = new Chart(chartCanvas, {
				// define chart type
				type: 'line',

				// define data structure
				data: {
					// get CRIME_TYPE from each row (X-labels)
					labels: months,
					datasets
				},
				options: {
					responsive: true, // chart initial resize to container
					maintainAspectRatio: false, // allow resize

					plugins: {
						// configure chart title
						title: {
							display: true,
							text: `Crime Incidents by Demographics (${formData.startDate} to ${formData.endDate})`,
							font: {
								size: 16,
								weight: 'bold'
							}
						},
						legend: {
							display: true,
							position: 'right'
						},
						// configure floating tool tips
						tooltip: {
							callbacks: {
								label: (context) => {
									const value = context.raw as number;
									return `${value} incidents`;
								}
							}
						}
					},
					// configure axis scales
					scales: {
						y: {
							// Y-axis
							beginAtZero: true,
							title: {
								display: true,
								text: 'Number of Incidents'
							}
						},
						x: {
							// X-axis
							title: {
								display: true,
								text: 'Month/Year'
							},
							ticks: {
								maxRotation: 45,
								minRotation: 45
							},
							grid: {
								color: (context) => {
									const label = months[context.index];
									return label?.includes('Jan') ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.1)';
								}
							}
						}
					},

					animation: {
						onComplete: () => {
							isLoading = false;
						}
					}
				}
			});
		}
	});
	// cleanup
	onMount(() => {
		return () => {
			if (chart) chart.destroy();
		};
	});
</script>

<form method="POST" onsubmit={handleSubmission}>
	{JSON.stringify(formData)}
	<div class="flex min-h-screen justify-center p-10 text-black">
		<div class="w-full max-w-7xl rounded-lg bg-gray-100 p-8 pb-20 shadow-lg">
			<h1 class="mb-8 mt-8 text-center text-2xl font-bold text-black">
				Demographic Influence on Crime
			</h1>
			<h2 class="text-grey text-grey-700 mb-8 mt-8 text-center text-lg font-semibold">
				How do crime rates vary by the age, gender, or descent of victims in different areas of Los
				Angeles?
			</h2>
			<p class="mx-auto mb-12 max-w-4xl text-lg leading-relaxed text-gray-600">
				This query evaluates how demographic factors like age, gender, and descent influence crime
				rates in specific areas of Los Angeles. Users can filter the data by specific demographic
				groups and crime categories to understand how these factors impacted crime trends. Crime
				category filter represents nearly a hundred crime types combined. Descent filter combines
				nearly 20 demographics.
			</p>
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
							onStartDateChange={(newDate: any) => (formData.startDate = newDate)}
							onEndDateChange={(newDate: any) => (formData.endDate = newDate)}
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

				<!-- Chart -->
				<div class="flex items-center justify-center rounded-lg bg-gray-200 p-6 shadow-inner">
					<!-- Chart Generation (80% viewport height) -->
					<div class="relative h-[80vh] w-full">
						{#if isLoading}
							<div
								class="bg-grey-100/80 absolute inset-0 flex items-center justify-center backdrop-blur-sm"
							>
								<div class="text-center">
									<div
										class="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"
									></div>
									<p class="text-grey-700 text-lg font-medium">Generating Chart...</p>
								</div>
							</div>
						{/if}
						<canvas bind:this={chartCanvas}></canvas>
					</div>
				</div>
			</div>
		</div>
	</div>
</form>
