<script lang="ts">
	import { goto } from '$app/navigation';
	import { Chart } from 'chart.js/auto';
	import DateRangePicker from '$lib/components/DateRangePicker.svelte';
	import CrimeCategoriesSelect from '$lib/components/CrimeCategoriesSelect.svelte';
	import LaRegionSelect from '$lib/components/LaRegionSelect.svelte';
	import VictimDemographicsSelect from '$lib/components/VictimDemographicsSelect.svelte';
	import QueryModal from '../../lib/components/QueryModal.svelte';
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
	// Receive the raw SQL query from the server.
	let query = $state('');
	$effect(() => {
		query = data.query ?? '';
	});
	// set loading spinner
	let isLoading = $state(false);

	// Form Data Storage (empty string by default or URL loaded)
	let formData = $state({
		startDate: data.formParams.startDate ?? '2020-01-01',
		endDate: data.formParams.endDate ?? '2024-09-02',
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
		tension: number;
		borderWidth: number;
		pointRadius: number;
		pointHoverRadius: number;
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

			const formatDate = (dateStr: string) => {
				const date = new Date(dateStr);
				return date.toLocaleDateString('en-US', {
					month: 'short',
					year: 'numeric'
				});
			};

			const typedRows = data.result.rows.map(
				(row: any) =>
					({
						crimeCode: row[0],
						crimeDesc: row[1],
						date: formatDate(row[2]),
						location: row[3],
						ethnicity: row[4],
						gender: row[5],
						age: row[6],
						incidentCount: row[7]
					}) satisfies crimeRow
			);

			// group by demographics and proportion
			const demographicMap = new Map<
				string,
				{
					label: string;
					monthlyData: Map<string, number>;
				}
			>();

			// track most common crime committed at that location from all those crimes
			const crimeStats = $state(new Map<string, Map<string, { crime: string; count: number }>>());

			typedRows.forEach((row) => {
				let key = '';

				// get YYYY-MM
				const monthKey = row.date.substring(0, 8);

				// set key to region name of crime commited
				for (const [regionName, areas] of LA_REGIONS_MAP.entries()) {
					if (areas.includes(row.location)) {
						key = regionName;
					}
				}
				// if this region doesnt exist, store date -> crime data in new map
				if (!crimeStats.has(key)) {
					crimeStats.set(key, new Map());
				}
				// get map of all dates for this region or if we havnt tracked this date yet, instantiate it
				const regionMap = crimeStats.get(key)!;
				if (!regionMap.has(monthKey)) {
					regionMap.set(monthKey, { crime: row.crimeDesc, count: 0 });
				}
				// get current crime stats on this date, store most committed crime
				const currentStats = regionMap.get(monthKey)!;
				if (row.incidentCount > currentStats.count) {
					currentStats.crime = row.crimeDesc;
					currentStats.count = row.incidentCount;
				}

				if (!demographicMap.has(key)) {
					demographicMap.set(key, {
						label: key,
						monthlyData: new Map()
					});
				}
				// get all demographic data at region
				const entry = demographicMap.get(key)!;

				// get current incident count
				const currentCount = entry.monthlyData.get(monthKey) || 0;

				// add new incidents to total count for this date
				entry.monthlyData.set(monthKey, currentCount + row.incidentCount);
			});

			// convert datasets
			const datasets = Array.from(demographicMap.values())
				.map(
					(demo, index) =>
						({
							label: demo.label,
							data: Array.from(demo.monthlyData.values()),
							borderColor: getChartColor(index),
							fill: false,
							tension: 0.2, // Add line smoothing
							borderWidth: 3, // Thicker lines
							pointRadius: 4, // Smaller points
							pointHoverRadius: 6 // Larger hover points
						}) satisfies DataSet
				)
				.sort(
					(a: DataSet, b: DataSet) =>
						b.data.reduce((sum: number, val: number) => sum + val, 0) -
						a.data.reduce((sum: number, val: number) => sum + val, 0)
				)
				.slice(0, 10);

			// sort months chronilogically
			const months = [...new Set(typedRows.map((row) => row.date.substring(0, 8)))].sort(
				(a, b) => new Date(a).getTime() - new Date(b).getTime()
			);

			// instantiate chart
			chart = new Chart(chartCanvas, {
				type: 'line',
				data: {
					labels: months,
					datasets
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					animation: {
						onComplete: () => {
							isLoading = false;
						}
					},
					plugins: {
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
						tooltip: {
							callbacks: {
								label: (context) => {
									// retrieve total incidents
									const value = context.raw as number;

									// get crime and incident count per region and date
									const region = context.dataset.label;
									const date = months[context.dataIndex];
									const stats = region ? crimeStats.get(region)?.get(date) : undefined;

									return [
										`${value} incidents`,
										`Most common crime: ${stats?.crime || 'None'} with: ${stats?.count || 0} incidents`
									];
								}
							}
						}
					},
					scales: {
						y: {
							beginAtZero: true,
							title: {
								display: true,
								text: 'Number of Incidents'
							}
						},
						x: {
							title: {
								display: true,
								text: 'Month/Year'
							},
							ticks: {
								callback: function (index) {
									// extra spacing after december
									const label = months[index as number];
									return label?.includes('Dec') ? label + '   ' : label;
								},
								maxRotation: 45, // angle labels
								minRotation: 45
							},
							grid: {
								color: (context) => {
									// mark year changes
									const label = months[context.index];
									return label?.includes('Jan') ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.1)';
								}
							}
						}
					}
				}
			});
		}
	});
</script>

<form method="POST" onsubmit={handleSubmission}>
	<div class="flex min-h-screen justify-center p-10 text-black">
		<div class="max-w-8xl w-full rounded-lg bg-gray-100 p-10 pb-20 shadow-lg">
			<h1 class="mb-16 mt-8 text-center text-2xl font-semibold text-black">
				Demographic Influence on Crime
			</h1>
			<div class="grid grid-cols-1 gap-8 lg:grid-cols-[28%_70%]">
				<!-- Left Column: Controls -->
				<div class="space-y-6 text-base">
					<h2 class="text-grey text-grey-700 mb-2 text-lg">
						"How do crime rates vary by the age, gender, or descent of victims in different areas of
						Los Angeles?"
						<div
							class="in-line tooltip tooltip-right"
							data-tip="Explore how demographic factors such as age, gender, and descent have influenced crime rates during the specified time period, highlighting which victim groups were most impacted by different types of crimes."
						>
							<div
								class="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-primary font-bold text-white hover:bg-blue-500"
							>
								?
							</div>
						</div>
					</h2>
					<!-- Date Range Picker -->
					<div>
						<label for="date-range-picker" class="mb-2 block text-base font-medium"
							>Select Date Range:</label
						>
						<DateRangePicker
							startDate={formData.startDate}
							endDate={formData.endDate}
							onStartDateChange={(newDate: any) => (formData.startDate = newDate)}
							onEndDateChange={(newDate: any) => (formData.endDate = newDate)}
						/>
					</div>

					<CrimeCategoriesSelect
						categories={CRIME_CATEGORIES}
						selectedCategories={formData.crimeCategories}
						onCategoryChange={(categories: any) => (formData.crimeCategories = categories)}
					/>

					<LaRegionSelect
						regions={LA_REGIONS}
						selectedRegions={formData.laRegions}
						onRegionChange={(regions: any) => (formData.laRegions = regions)}
					/>

					<VictimDemographicsSelect
						victimAge={VICTIM_AGE}
						victimGender={VICTIM_GENDER}
						victimDescent={VICTIM_DESCENT}
						selectedAge={formData.ageRange}
						selectedGender={formData.gender}
						selectedDescent={formData.descent}
						onAgeChange={(age: any) => (formData.ageRange = age)}
						onGenderChange={(gender: any) => (formData.gender = gender)}
						onDescentChange={(descent: any) => (formData.descent = descent)}
					/>

					<!-- Generate Trend Button -->
					<div class="flex w-full justify-center pt-4">
						<button type="submit" class="btn btn-primary w-60 text-base"
							>Generate Crime Trend
						</button>
					</div>
				</div>
				<!-- Right Column: Chart -->
				<div
					class="relative flex items-center justify-center rounded-lg bg-gray-200 p-6 shadow-inner"
				>
					<!-- Chart Area -->
					<div class="relative h-[90vh] w-full">
						{#if isLoading}
							<div
								class="bg-grey-100/80 absolute inset-0 flex items-center justify-center backdrop-blur-sm"
							>
								<div class="flex flex-col items-center">
									<div
										class="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"
									></div>
									<p class="text-grey-700 mt-4 text-lg font-medium">Generating Chart...</p>
								</div>
							</div>
						{/if}
						<canvas bind:this={chartCanvas}></canvas>
					</div>
					<div class="absolute bottom-6 right-6">
						<QueryModal {query} />
					</div>
				</div>
			</div>
		</div>
	</div>
</form>
