<script lang="ts">
	import { goto } from '$app/navigation';
	import { Chart } from 'chart.js/auto';
	import CrimeCategoriesSelect from '$lib/components/CrimeCategoriesSelect.svelte';
	import LaRegionSelect from '$lib/components/LaRegionSelect.svelte';
	import { CRIME_CATEGORIES, LA_REGIONS, SEASONS, HOLIDAYS } from '../../constants';
	import { seasonColors } from '$lib/utils/season-chart-colors';
	import { holidayColors } from '$lib/utils/holiday-chart-colors';
	import DateRangePicker from '$lib/components/DateRangePicker.svelte';

	// Get data from server
	let { data } = $props();
	// set loading spinner
	let isLoading = $state(false);

	// Form Data Storage (empty string by default or URL loaded)
	let formData = $state({
		startDate: data.formParams.startDate ?? '2020-01-01',
		endDate: data.formParams.endDate ?? '2020-06-30',
		crimeCategories: data.formParams.crimeCategories,
		laRegions: data.formParams.laRegions,
		filterBy: data.formParams.filterBy ?? 'Season',
		selectedSeason: data.formParams.selectedSeason ?? 'Spring',
		selectedHoliday: data.formParams.selectedHoliday ?? 'StPatricksDay'
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

		params.append('seasons', formData.selectedSeason);
		params.append('holidays', formData.selectedHoliday);
		params.append('startDate', formData.startDate);
		params.append('endDate', formData.endDate);

		goto(`/seasonal?${params.toString()}`, { noScroll: true });
	}
	// instantiate chart data
	interface DataSet {
		label: string;
		data: number[];
		backgroundColor: string;
		borderColor: string;
		borderWidth: number;
	}
	// instantiate Chart Component
	let chartCanvas: HTMLCanvasElement;
	let chart: Chart;

	$effect(() => {
		if (chartCanvas && data.result?.rows) {
			if (chart) chart.destroy();

			if (formData.filterBy === 'Season') {
				type crimeRow = {
					crimeCode: string;
					crimeDesc: string;
					date: string;
					location: string;
					incidentCount: number;
					season: string;
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
							incidentCount: row[4],
							season: row[5]
						}) satisfies crimeRow
				);

				// Group data by region and season
				const processedData = new Map<string, Record<string, number>>();

				typedRows.forEach((row) => {
					if (!processedData.has(row.location)) {
						processedData.set(row.location, {
							Spring: 0,
							Summer: 0,
							Fall: 0,
							Winter: 0
						});
					}
					const regionData = processedData.get(row.location)!;
					regionData[row.season] += row.incidentCount;
				});

				// Prepare data for Chart.js
				const regions = Array.from(processedData.keys());

				const datasets: DataSet[] = SEASONS.map((season) => ({
					label: season,
					data: regions.map((region) => processedData.get(region)![season]),
					backgroundColor: seasonColors[season as keyof typeof seasonColors],
					borderColor: 'rgba(0,0,0,0.1)',
					borderWidth: 1
				}));

				// Create the chart
				chart = new Chart(chartCanvas, {
					type: 'bar',
					data: {
						labels: regions,
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
								text: `Seasonal Crime Incidents by Region (${formData.startDate} to ${formData.endDate})`,
								font: {
									size: 16,
									weight: 'bold'
								}
							},
							legend: {
								display: true,
								position: 'top'
							},
							tooltip: {
								callbacks: {
									label: (context) => {
										const value = context.raw as number;
										const season = context.dataset.label;
										return `${season}: ${value.toLocaleString()} incidents`;
									}
								}
							}
						},
						datasets: {
							bar: {
								barPercentage: 0.9,
								categoryPercentage: 0.8
							}
						},
						scales: {
							x: {
								title: {
									display: true,
									text: 'Regions'
								},
								ticks: {
									maxRotation: 45,
									minRotation: 45
								},
								stacked: true
							},
							y: {
								beginAtZero: true,
								title: {
									display: true,
									text: 'Number of Incidents'
								},
								stacked: true // Stack the bars for each region
							}
						}
					}
				});
			} else if (formData.filterBy === 'Holiday') {
				type crimeRow = {
					crimeCode: string;
					crimeDesc: string;
					date: string;
					location: string;
					incidentCount: number;
					holiday: string;
				};

				const formatDate = (dateStr: string) => {
					const date = new Date(dateStr);
					return date.toLocaleDateString('en-US', {
						month: 'short',
						year: 'numeric'
					});
				};
				console.log('Raw SQL row structure:', data.result.rows[0]); // See all columns
				const typedRows = data.result.rows.map(
					(row: any) =>
						({
							crimeCode: row[0],
							crimeDesc: row[1],
							date: formatDate(row[2]),
							location: row[3],
							incidentCount: row[4],
							holiday: row[6]
						}) satisfies crimeRow
				);

				// Group data by region and season
				const processedData = new Map<string, Record<string, number>>();

				typedRows.forEach((row) => {
					console.log('Holiday row:', row);
					if (!processedData.has(row.location)) {
						processedData.set(row.location, {
							StPatricksDay: 0,
							July4th: 0,
							Thanksgiving: 0,
							Christmas: 0,
							NewYears: 0
						});
					}
					const regionData = processedData.get(row.location)!;
					console.log('Holiday value:', row.holiday); // Check if this matches your holiday names exactly
					console.log('Before increment:', regionData[row.holiday]);
					regionData[row.holiday] += row.incidentCount;
					console.log('After increment:', regionData[row.holiday]);
				});

				// Prepare data for Chart.js
				const regions = Array.from(processedData.keys());

				const datasets: DataSet[] = HOLIDAYS.map((holiday) => ({
					label: holiday,
					data: regions.map((region) => processedData.get(region)![holiday]),
					backgroundColor: holidayColors[holiday as keyof typeof holidayColors],
					borderColor: 'rgba(0,0,0,0.1)',
					borderWidth: 1
				}));

				// Create the chart
				chart = new Chart(chartCanvas, {
					type: 'bar',
					data: {
						labels: regions,
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
								text: `Holiday Crime Incidents by Region (${formData.startDate} to ${formData.endDate})`,
								font: {
									size: 16,
									weight: 'bold'
								}
							},
							legend: {
								display: true,
								position: 'top'
							},
							tooltip: {
								callbacks: {
									label: (context) => {
										const value = context.raw as number;
										const holiday = context.dataset.label;
										return `${holiday}: ${value.toLocaleString()} incidents`;
									}
								}
							}
						},
						datasets: {
							bar: {
								barPercentage: 0.9,
								categoryPercentage: 0.8
							}
						},
						scales: {
							x: {
								title: {
									display: true,
									text: 'Regions'
								},
								ticks: {
									maxRotation: 45,
									minRotation: 45
								},
								stacked: true
							},
							y: {
								beginAtZero: true,
								title: {
									display: true,
									text: 'Number of Incidents'
								},
								// stack region bars
								stacked: true
							}
						}
					}
				});
			}
		}
	});
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
						<label class="mb-2 block font-medium">Filter by:</label>
						<div class="flex space-x-4">
							<label class="flex items-center space-x-2">
								<input
									type="radio"
									name="radio-2"
									bind:group={formData.filterBy}
									class="radio-primary radio"
									value="Season"
								/>
								<span>Season</span>
							</label>
							<label class="flex items-center space-x-2">
								<input
									type="radio"
									name="radio-2"
									bind:group={formData.filterBy}
									class="radio-primary radio"
									value="Holiday"
								/>
								<span>Holiday</span>
							</label>
						</div>
					</div>
					<label for="date-range-picker" class="mb-2 block text-base font-medium"
						>Select Date Range:</label
					>
					<DateRangePicker
						startDate={formData.startDate}
						endDate={formData.endDate}
						minDate="2020-01-01"
						maxDate="2024-11-15"
						onStartDateChange={(newDate: any) => (formData.startDate = newDate)}
						onEndDateChange={(newDate: any) => (formData.endDate = newDate)}
					/>

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
