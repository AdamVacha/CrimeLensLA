<script lang="ts">
	import { goto } from '$app/navigation';
	import { Chart } from 'chart.js/auto';
	import CrimeCategoriesSelect from '$lib/components/CrimeCategoriesSelect.svelte';
	import LaRegionSelect from '$lib/components/LaRegionSelect.svelte';
	import { CRIME_CATEGORIES, LA_REGIONS } from '../../constants';
	import QueryModal from '$lib/components/QueryModal.svelte';
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
		timeGranularity: data.formParams.timeGranularity ?? 'Year'
	});

	// TODO adjust query to location areas (from demographic), ignore descents / age / sex. non-performant condition currently.

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
		params.append('timeGranularity', formData.timeGranularity);

		goto(`/long-term?${params.toString()}`, { noScroll: true });
	}

	// instantiate Chart Component
	let chartCanvas: HTMLCanvasElement;
	let chart: Chart;

	$effect(() => {
		if (chartCanvas && data.result?.rows) {
			if (chart) chart.destroy();

			type CrimeRow = {
				crimeCode: string;
				crimeType: string;
				timePeriod: string;
				incidentCount: number;
			};

			const formatTimePeriod = (period: string) => {
				if (period.includes('-Q')) {
					const [year, quarter] = period.split('-Q');
					return `Q${quarter} ${year}`;
				}
				if (period.includes('-')) {
					const date = new Date(period);
					return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
				}
				return period; // Year only
			};

			const typedRows = data.result.rows.map(
				(row: any) =>
					({
						crimeCode: row[0],
						crimeType: row[1],
						timePeriod: formatTimePeriod(row[2]),
						incidentCount: row[3]
					}) satisfies CrimeRow
			);

			// group data by crime type
			const crimeMap = new Map<string, Map<string, number>>();
			typedRows.forEach((row) => {
				if (!crimeMap.has(row.crimeType)) {
					crimeMap.set(row.crimeType, new Map());
				}
				const timeMap = crimeMap.get(row.crimeType)!;
				timeMap.set(row.timePeriod, row.incidentCount);
			});

			// set datasets
			const datasets = Array.from(crimeMap.entries())
				.map(([crimeType, data], index) => ({
					label: crimeType,
					data: Array.from(data.values()),
					borderColor: getChartColor(index),
					fill: false
				}))
				.sort(
					(a, b) =>
						b.data.reduce((sum, val) => sum + val, 0) - a.data.reduce((sum, val) => sum + val, 0)
				)
				.slice(0, 10);

			// get time periods in chronological order
			const timePeriods = [...new Set(typedRows.map((row) => row.timePeriod))];
			const sortTimePeriods = (a: string, b: string) => {
				if (a.startsWith('Q') && b.startsWith('Q')) {
					const [aQ, aY] = a.split(' ');
					const [bQ, bY] = b.split(' ');
					return aY === bY ? aQ.localeCompare(bQ) : aY.localeCompare(bY);
				}
				return new Date(a).getTime() - new Date(b).getTime();
			};
			timePeriods.sort(sortTimePeriods);

			chart = new Chart(chartCanvas, {
				type: 'line',
				data: {
					labels: timePeriods,
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
							text: `Crime Incidents Over Time (${formData.startDate} to ${formData.endDate})`,
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
									const value = context.raw as number;
									return `${context.dataset.label}: ${value} incidents`;
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
								text:
									formData.timeGranularity === 'Year'
										? 'Year'
										: formData.timeGranularity === 'Quarter'
											? 'Quarter'
											: 'Month/Year'
							},
							ticks: {
								maxRotation: 45,
								minRotation: 45
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
				Long-Term Crime Trends
			</h1>
			<div class="grid grid-cols-1 gap-8 lg:grid-cols-[28%_70%]">
				<!-- Left Column: Controls -->
				<div class="space-y-8 text-base">
					<h2 class="text-grey text-grey-700 mb-2 text-lg">
						“How have different types of crimes evolved in Los Angeles from 2020 to present?”
						<div
							class="in-line tooltip tooltip-right"
							data-tip="This query analyzes the changes in specific crime types over time, focusing on the time period from 2020 to the present."
						>
							<div
								class="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-blue-400 font-bold text-white hover:bg-blue-500"
							>
								?
							</div>
						</div>
					</h2>
					<!-- Time Granularity Radio Buttons -->
					<div>
						<label for="timeGranularity" class="mb-2 block font-medium"
							>Adjust Time Granularity:</label
						>
						<div class="flex space-x-4">
							<label class="flex items-center space-x-2">
								<input
									type="radio"
									id="timeGranularity"
									name="radio-2"
									bind:group={formData.timeGranularity}
									class="radio-primary radio"
									value="Year"
								/>
								<span>Year</span>
							</label>

							<label class="flex items-center space-x-2">
								<input
									type="radio"
									id="timeGranularity"
									name="radio-2"
									bind:group={formData.timeGranularity}
									class="radio-primary radio"
									value="Month"
								/>
								<span>Month</span>
							</label>
							<label class="flex items-center space-x-2">
								<input
									type="radio"
									id="timeGranularity"
									name="radio-2"
									bind:group={formData.timeGranularity}
									class="radio-primary radio"
									value="Quarter"
								/>
								<span>Quarter</span>
							</label>
						</div>
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

					<!-- Generate Trend Button -->
					<div class="flex w-full justify-center pt-4">
						<button type="submit" class="btn btn-primary w-60 text-base"
							>Generate Crime Trend
						</button>
					</div>
				</div>

				<!-- Right Column: Chart Placeholder -->
				<div
					class="relative flex items-center justify-center rounded-lg bg-gray-200 p-6 shadow-inner"
				>
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
