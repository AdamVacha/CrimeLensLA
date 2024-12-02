<script lang="ts">
	import { goto } from '$app/navigation';
	import { Chart } from 'chart.js/auto';
	import DateRangePicker from '$lib/components/DateRangePicker.svelte';
	import CrimeCategoriesSelect from '$lib/components/CrimeCategoriesSelect.svelte';
	import LaRegionSelect from '$lib/components/LaRegionSelect.svelte';
	import { CRIME_CATEGORIES, LA_REGIONS } from '../../constants';
	import { getChartColor } from '$lib/utils/chart-colors';

	// Get data from server
	let { data } = $props();
	// set loading spinner
	let isLoading = $state(false);

	// Event options and their corresponding date ranges
	const events = [
		{ label: 'COVID-19 Pandemic', startDate: '2020-01-01', endDate: '2023-05-05' },
		{ label: 'Economic Recession', startDate: '2021-01-01', endDate: '2022-12-31' },
		{ label: 'Custom Event', startDate: '', endDate: '' }
	];

	// Form Data Storage (empty string by default or URL loaded)
	let formData = $state({
		startDate: data.formParams.startDate ?? events[0].startDate,
		endDate: data.formParams.endDate ?? events[0].endDate,
		crimeCategories: data.formParams.crimeCategories,
		laRegions: data.formParams.laRegions,
		ageRange: data.formParams.ageRange ?? '',
		gender: data.formParams.gender ?? '',
		descent: data.formParams.descent ?? '',
		selectedEvent:
			events.find(
				(event) =>
					event.startDate === (data.formParams.startDate ?? events[0].startDate) &&
					event.endDate === (data.formParams.endDate ?? events[0].endDate)
			) ?? events[0],
		eventPeriodStart: 0,
		eventPeriodEnd: 6
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
		params.append('eventPeriodStart', formData.eventPeriodStart.toString());
		params.append('eventPeriodEnd', formData.eventPeriodEnd.toString());

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

			// initialize periods
			demographicMap.set('Before Event', {
				label: 'Before Event',
				monthlyData: new Map()
			});
			demographicMap.set('During Event', {
				label: 'During Event',
				monthlyData: new Map()
			});
			demographicMap.set('After Event', {
				label: 'After Event',
				monthlyData: new Map()
			});

			typedRows.forEach((row) => {
				const rowDate = new Date(row.date);
				const eventStart = new Date(formData.selectedEvent.startDate);
				const eventEnd = new Date(formData.selectedEvent.endDate);

				// calc ranges for before and after event
				const beforeStart = new Date(eventStart);
				beforeStart.setMonth(beforeStart.getMonth() - formData.eventPeriodStart);
				const afterEnd = new Date(eventEnd);
				afterEnd.setMonth(afterEnd.getMonth() + formData.eventPeriodEnd);

				let key = '';

				console.log(
					'row date: ',
					row.date,
					'before start: ',
					beforeStart,
					'event start: ',
					eventStart,
					'after end: ',
					afterEnd
				);

				if (rowDate >= beforeStart && rowDate < eventStart) {
					key = 'Before Event';
				} else if (rowDate >= eventStart && rowDate <= eventEnd) {
					key = 'During Event';
				} else if (rowDate > eventEnd && rowDate <= afterEnd) {
					key = 'After Event';
				}

				if (key === '') {
					console.log('why empty?: ', rowDate);
					return;
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
				const currentCount = entry.monthlyData.get(row.date) || 0;

				// add new incidents to total count for this date
				entry.monthlyData.set(row.date, currentCount + row.incidentCount);
			});

			// convert datasets
			const datasets = Array.from(demographicMap.values())
				.map(
					(demo, index) =>
						({
							label: demo.label,
							data: Array.from(demo.monthlyData.values()),
							borderColor: getChartColor(index),
							fill: false
						}) satisfies DataSet
				)
				.sort(
					(a: DataSet, b: DataSet) =>
						b.data.reduce((sum: number, val: number) => sum + val, 0) -
						a.data.reduce((sum: number, val: number) => sum + val, 0)
				)
				.slice(0, 10);

			// sort months chronilogically
			const months = [...new Set(typedRows.map((row) => row.date))].sort(
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
									// retrieve total incidents
									const value = context.raw as number;
									return `${value} incidents`;
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
	{JSON.stringify(formData)}
	<div class="flex min-h-screen justify-center p-10 text-black">
		<div class="w-full max-w-7xl rounded-lg bg-gray-100 p-8 pb-20 shadow-lg">
			<h1 class="mb-16 mt-8 text-center text-2xl font-semibold">
				External Events Influence on Crime
			</h1>
			<h2 class="text-grey text-grey-700 mb-8 mt-8 text-center text-lg font-semibold">
				“How do big events, like natural disasters or major political changes, affect crime rates?"
			</h2>
			<p class="mx-auto mb-12 max-w-4xl text-lg leading-relaxed text-gray-600">
				This query investigates the relationship between crime trends and major external events,
				such as economic recession caused by the COVID-19 pandemic. Users can specify the time
				period before, during, and after these events, as well as the types of crimes they wish to
				analyze. The query dynamically adjusts based on the chosen events, allowing for a comparison
				of crime rates in different periods.
			</p>

			<div class="grid grid-cols-1 gap-8 lg:grid-cols-[35%_62%]">
				<!-- Left Column: Controls -->
				<div class="space-y-6">
					<!-- Select or Add Event -->
					<div>
						<label class="mb-2 block font-medium">Select or Add an Event:</label>
						<select
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
									handleDateChange;
								}}
							/>
						</div>
					</div>

					<!-- Define Event Period -->
					<div>
						<label class="mb-2 block font-medium">Define Event Period (Months):</label>
						<div class="flex items-center space-x-4">
							<input
								type="range"
								min="0"
								max="12"
								bind:value={formData.eventPeriodStart}
								class="range range-primary"
							/>
							<span class="text-gray-600">{formData.eventPeriodStart} before</span>
						</div>
						<div class="mt-2 flex items-center space-x-4">
							<input
								type="range"
								min="0"
								max="12"
								bind:value={formData.eventPeriodEnd}
								class="range range-primary"
							/>
							<span class="text-gray-600">{formData.eventPeriodEnd} after</span>
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
