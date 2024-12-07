<script lang="ts">
	import { goto } from '$app/navigation';
	import { Chart } from 'chart.js/auto';
	import DateRangePicker from '$lib/components/DateRangePicker.svelte';
	import CrimeCategoriesSelect from '$lib/components/CrimeCategoriesSelect.svelte';
	import LaRegionSelect from '$lib/components/LaRegionSelect.svelte';
	import { CRIME_CATEGORIES, LA_REGIONS } from '../../constants';
	import { getChartColor } from '$lib/utils/chart-colors';
	import QueryModal from '$lib/components/QueryModal.svelte';
	import { LA_REGIONS_MAP } from '$lib/utils/location-map';
	import { onMount } from 'svelte';
	import 'leaflet/dist/leaflet.css';
	import type { Map as LeafletMap } from 'leaflet';
	import { getRegionBoundaries, getRegionColor } from '$lib/utils/location-map';

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
		startDate: data.formParams.startDate ?? '',
		endDate: data.formParams.endDate ?? '',
		crimeCategories: data.formParams.crimeCategories,
		laRegions: data.formParams.laRegions
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

		goto(`/geographic?${params.toString()}`, { noScroll: true });
	}

	function updateMap(crimeData: any[], map: LeafletMap, L: any) {
		if (!map || !L) return;

		map.eachLayer((layer) => {
			if (layer instanceof L.Polygon) {
				map.removeLayer(layer);
			}
		});

		const regionTotals = new Map<string, number>();
		const regionStats = new Map<string, { crime: string; count: number }>();
		const regionColors = new Map<string, string>();
		let colorIndex = 0;

		crimeData.forEach((row) => {
			let region = '';
			for (const [regionName, areas] of LA_REGIONS_MAP.entries()) {
				if (areas.includes(row.location)) {
					region = regionName;
					regionTotals.set(region, (regionTotals.get(region) || 0) + row.incidentCount);

					if (!regionStats.has(region) || row.incidentCount > regionStats.get(region)!.count) {
						regionStats.set(region, { crime: row.crimeType, count: row.incidentCount });
					}

					if (!regionColors.has(region)) {
						regionColors.set(region, getChartColor(colorIndex));
						colorIndex++;
					}

					break;
				}
			}

			const boundaries = getRegionBoundaries([row.location]);
			if (boundaries.length > 0) {
				const totalIncidents = regionTotals.get(region) || 0;
				const stats = regionStats.get(region);

				L.polygon(boundaries, {
					color: regionColors.get(region),
					fillColor: regionColors.get(region),
					fillOpacity: 0.01
				}).addTo(map).bindPopup(`
        <div class="p-2">
          <h3 class="font-bold">${region}</h3>
          <p>Total Incidents: ${totalIncidents.toLocaleString()}</p>
          <p>Most Common Crime: ${stats?.crime || 'None'}</p>
        </div>
      `);
			}
		});
	}

	// instantiate chart data
	interface DataSet {
		label: string;
		data: number[];
		borderColor: string;
		fill: boolean;
		tension: number;
	}
	// instantiate Chart Component
	let map: LeafletMap;
	let mapElement: HTMLDivElement;
	let chartCanvas: HTMLCanvasElement;
	let chart: Chart;
	let L: any = $state();

	// Los Angeles map instantiation
	onMount(async () => {
		L = (await import('leaflet')).default;
		map = L.map(mapElement).setView([34.0522, -118.2437], 10);
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

		if (data.result?.rows) {
			const crimeData = data.result.rows.map((row: any) => ({
				location: row[0],
				timePeriod: row[1],
				crimeType: row[2],
				weaponType: row[3] || 'Not Reported',
				incidentCount: row[4]
			}));
			updateMap(crimeData, map, L);
		}
	});

	$effect(() => {
		if (chartCanvas && data.result?.rows) {
			if (chart) chart.destroy();

			type crimeRow = {
				location: string;
				timePeriod: string;
				crimeType: string;
				weaponType: string;
				incidentCount: number;
			};

			const crimeData = data.result.rows.map(
				(row: any) =>
					({
						location: row[0],
						timePeriod: row[1],
						crimeType: row[2],
						weaponType: row[3] || 'Not Reported',
						incidentCount: row[4]
					}) satisfies crimeRow
			);

			const regionData = new Map<string, Map<string, number>>();
			const crimeStats = $state(
				new Map<string, Map<string, { crime: string; count: number; weapon: string }>>()
			);

			if (map && L) {
				updateMap(crimeData, map, L);
			}

			crimeData.forEach((row) => {
				let region = '';
				for (const [regionName, areas] of LA_REGIONS_MAP.entries()) {
					if (areas.includes(row.location)) {
						region = regionName;
						break;
					}
				}

				if (!regionData.has(region)) {
					regionData.set(region, new Map());
					crimeStats.set(region, new Map());
				}

				const timeMap = regionData.get(region)!;
				const currentCount = timeMap.get(row.timePeriod) || 0;
				timeMap.set(row.timePeriod, currentCount + row.incidentCount);

				const statsMap = crimeStats.get(region)!;
				if (
					!statsMap.has(row.timePeriod) ||
					row.incidentCount > statsMap.get(row.timePeriod)!.count
				) {
					statsMap.set(row.timePeriod, {
						crime: row.crimeType,
						count: row.incidentCount,
						weapon: row.weaponType
					});
				}
			});

			const timePeriods = [...new Set(crimeData.map((d) => d.timePeriod))].sort();
			const datasets = Array.from(regionData.entries())
				.map(
					([region, data], index) =>
						({
							label: region,
							data: timePeriods.map((t) => data.get(t) || 0),
							borderColor: getChartColor(index),
							fill: false,
							tension: 0.3
						}) satisfies DataSet
				)
				.sort(
					(a, b) =>
						b.data.reduce((sum, val) => sum + val, 0) - a.data.reduce((sum, val) => sum + val, 0)
				);

			const months = [...new Set(crimeData.map((row) => row.timePeriod))].sort(
				(a, b) => new Date(a).getTime() - new Date(b).getTime()
			);

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
							text: `Crime Incidents by GeoGraphic Region (${formData.startDate} to ${formData.endDate})`,
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
									const region = context.dataset.label || '';
									const period = timePeriods[context.dataIndex];
									const stats = crimeStats.get(region)?.get(period);

									return [
										`${region}: ${context.raw} incidents`,
										`Most common crime: ${stats?.crime || 'None'}`,
										`Weapon: ${stats?.weapon || 'Not Reported'}`
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
					}
				}
			});
		}
	});
</script>

<form method="POST" onsubmit={handleSubmission}>
	<div class="flex min-h-screen justify-center p-10 text-black">
		<div class="max-w-8xl h-[160vh] w-full rounded-lg bg-gray-100 p-10 pb-20 shadow-lg">
			<h1 class="mb-16 mt-8 text-center text-2xl font-semibold text-black">
				Geographic Variation in Crime
			</h1>
			<div class="grid grid-cols-1 gap-8 lg:grid-cols-[28%_70%]">
				<!-- Left Column: Controls -->
				<div class="space-y-6 text-base">
					<h2 class="text-grey text-grey-700 mb-2 text-lg">
						“Which neighborhoods in Los Angeles have experienced the highest or lowest crime rates,
						and how has this changed over time?” <div
							class="in-line tooltip tooltip-right"
							data-tip="	This query focuses on the geographic distribution of crimes across different neighborhoods
					or reporting districts in Los Angeles."
						>
							<div
								class="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-blue-400 font-bold text-white hover:bg-blue-500"
							>
								?
							</div>
						</div>
					</h2>

					<div>
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

				<!-- Right Column: Chart + Map -->
				<div class="relative flex h-[130vh] rounded-lg bg-gray-200 p-6 shadow-inner">
					<div class="relative grid w-full grid-rows-2 gap-4">
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
						<div
							class="relative h-[60vh]"
							bind:this={mapElement}
							style="z-index: {isLoading ? '-1' : '1'}"
						></div>
						<div class="h-[60vh] w-full pb-10 pt-2">
							<canvas bind:this={chartCanvas}></canvas>
						</div>
						<div class="absolute bottom-1 right-1">
							<QueryModal {query} />
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</form>
