<script lang="ts">
	import { goto } from '$app/navigation';
	import { Chart } from 'chart.js/auto';
	import DateRangePicker from '$lib/components/DateRangePicker.svelte';
	import CrimeCategoriesSelect from '$lib/components/CrimeCategoriesSelect.svelte';
	import LaRegionSelect from '$lib/components/LaRegionSelect.svelte';
	import { CRIME_CATEGORIES, LA_REGIONS } from '../../constants';
	import { getChartColor } from '$lib/utils/chart-colors';
	import QueryModal from '$lib/components/QueryModal.svelte';

	// Get data from server
	let { data } = $props();
	// Receive the raw SQL query from the server.
	let query = $state('');
	$effect(() => {
		query = data.query ?? '';
	});
	// set loading spinner
	let isLoading = $state(false);

	// Event options and their corresponding date ranges
	const events = [
		{ label: 'COVID-19 Pandemic', startDate: '2020-01-01', endDate: '2020-12-31' },
		{ label: 'Economic Recession', startDate: '2021-01-01', endDate: '2021-12-31' },
		{ label: 'Custom Event', startDate: '', endDate: '' }
	];

	// Form Data Storage (empty string by default or URL loaded)
	let formData = $state({
		startDate: data.formParams.startDate ?? events[0].startDate,
		endDate: data.formParams.endDate ?? events[0].endDate,
		crimeCategories: data.formParams.crimeCategories,
		laRegions: data.formParams.laRegions,
		selectedEvent:
			events.find(
				(event) =>
					event.startDate === (data.formParams.startDate ?? events[0].startDate) &&
					event.endDate === (data.formParams.endDate ?? events[0].endDate)
			) ?? events[0],
		monthsBeforeEvent: data.formParams.monthsBeforeEvent ?? 0,
		monthsAfterEvent: data.formParams.monthsAfterEvent ?? 6
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
		params.append('eventPeriodStart', formData.monthsBeforeEvent.toString());
		params.append('eventPeriodEnd', formData.monthsAfterEvent.toString());
		params.append('monthsBeforeEvent', formData.monthsBeforeEvent.toString());
		params.append('monthsAfterEvent', formData.monthsAfterEvent.toString());

		goto(`/external-events?${params.toString()}`, { noScroll: true });
	}

	// Function to update the date range when an event is selected
	function updateDateRange() {
		if (formData.selectedEvent) {
			formData.startDate = formData.selectedEvent.startDate;
			formData.endDate = formData.selectedEvent.endDate;
		}
	}

	// Function to detect manual date change and update the dropdown to "Custom Event"
	function handleDateChange() {
		if (
			formData.startDate !== formData.selectedEvent.startDate ||
			formData.endDate !== formData.selectedEvent.endDate
		) {
			formData.selectedEvent = events.find((event) => event.label === 'Custom Event') || {
				label: 'Custom Event',
				startDate: '',
				endDate: ''
			};
		}
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
				incidentCount: number;
				eventPeriod: string;
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
						date: row[2],
						location: row[3],
						incidentCount: row[4],
						eventPeriod: row[5]
					}) satisfies crimeRow
			);

			// group by period and date
			const eventMap = new Map<string, Map<string, number>>();

			['Before Event', 'During Event', 'After Event'].forEach((period) => {
				eventMap.set(period, new Map());
			});

			// process all dates first to ensure complete date range
			const allDates = [...new Set(typedRows.map((row) => formatDate(row.date)))].sort(
				(a, b) => new Date(a).getTime() - new Date(b).getTime()
			);

			// then initialize all dates for each period with 0
			eventMap.forEach((periodData) => {
				allDates.forEach((date) => {
					periodData.set(date, 0);
				});
			});

			// sum incident counts
			typedRows.forEach((row) => {
				const periodData = eventMap.get(row.eventPeriod);
				if (periodData) {
					const formattedDate = formatDate(row.date);
					const currentCount = periodData.get(formattedDate) || 0;
					periodData.set(formattedDate, currentCount + row.incidentCount);
				}
			});

			// convert datasets
			const datasets = Array.from(eventMap.entries()).map(([period, data], index) => ({
				label: period,
				data: allDates.map((date) => data.get(date) || 0),
				borderColor: getChartColor(index),
				fill: false,
				tension: 0.2,
				borderWidth: 3,
				pointRadius: 4,
				pointHoverRadius: 6,
				spanGaps: true
			}));
			// instantiate chart
			chart = new Chart(chartCanvas, {
				type: 'line',
				data: {
					labels: allDates,
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
							text: `Crime Incidents by External Events (${formData.startDate} to ${formData.endDate})`,
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
									const value = context.raw;
									return `${context.dataset.label}: ${(value as number).toLocaleString()} incidents`;
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
								callback: (_, index) => {
									return allDates[index] || '';
								},
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
	{JSON.stringify(formData)}
	<div class="flex min-h-screen justify-center p-10 text-black">
		<div class="max-w-8xl w-full rounded-lg bg-gray-100 p-10 pb-20 shadow-lg">
			<h1 class="mb-16 mt-8 text-center text-2xl font-semibold">
				External Events Influence on Crime
			</h1>

			<div class="grid grid-cols-1 gap-8 lg:grid-cols-[35%_62%]">
				<!-- Left Column: Controls -->
				<div class="space-y-6">
					<h2 class="text-grey text-grey-700 mb-2 text-lg">
						“How do big events, like natural disasters or major political changes, affect crime
						rates?" <div
							class="in-line tooltip tooltip-right"
							data-tip="This query investigates the relationship between crime trends and major external events, such as economic recession caused by the COVID-19 pandemic. Users can specify the time period before, during, and after these events, as well as the types of crimes they wish to analyze."
						>
							<div
								class="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-blue-400 font-bold text-white hover:bg-blue-500"
							>
								?
							</div>
						</div>
					</h2>
					<!-- Select or Add Event -->
					<div>
						<label for="event-select" class="mb-2 block font-medium">Select or Add an Event:</label>
						<select
							id="event-select"
							bind:value={formData.selectedEvent}
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
							<DateRangePicker
								startDate={formData.startDate}
								endDate={formData.endDate}
								minDate="2020-01-01"
								maxDate="2024-11-15"
								onStartDateChange={(newDate: any) => {
									formData.startDate = newDate;
									handleDateChange();
								}}
								onEndDateChange={(newDate: any) => {
									formData.endDate = newDate;
									handleDateChange();
								}}
							/>
						</div>
					</div>

					<!-- Define Event Period -->
					<div>
						<label for="monthsBeforeEvent" class="mb-2 block font-medium"
							>Define Event Period:</label
						>
						<div class="flex items-center space-x-4">
							<input
								id="monthsBeforeEvent"
								type="range"
								min="0"
								max="12"
								bind:value={formData.monthsBeforeEvent}
								class="range range-primary"
							/>
							<span class="text-gray-600">{formData.monthsBeforeEvent} months before</span>
						</div>
						<div class="mt-2 flex items-center space-x-4">
							<input
								id="monthsAfterEvent"
								type="range"
								min="0"
								max="12"
								bind:value={formData.monthsAfterEvent}
								class="range range-primary"
							/>
							<span class="text-gray-600">{formData.monthsAfterEvent} months after</span>
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

					<!-- Generate Crime Trend Button -->
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
					<!-- Chart Generation -->
					<div class="relative h-[90vh] w-full">
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
					<div class="absolute bottom-6 right-6">
						<QueryModal {query} />
					</div>
				</div>
			</div>
		</div>
	</div>
</form>
