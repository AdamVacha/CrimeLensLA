<script lang="ts">
	import { goto } from '$app/navigation';
	import { Chart } from 'chart.js/auto';

	// Get data from server
	let { data } = $props();

	// Placeholder data for options
	const crimeCategories = ['Theft', 'Assault', 'Burglary'];
	const laRegions = ['Central', 'East', 'West', 'South', 'North'];
	const victimAge = ['0-18', '19-30', '31-50', '51+'];
	const victimGender = ['Female', 'Male', 'Other'];
	const victimDescent = ['Asian', 'Black', 'Hispanic', 'White', 'Other'];

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
	function onCrimeCategoryChange(e: { currentTarget: { checked: boolean; value: string } }) {
		// if checked add to array
		if (e.currentTarget.checked) {
			formData.crimeCategories.push(e.currentTarget.value);
			return;
		}
		// if not checked, keep the rest of the categories
		formData.crimeCategories = formData.crimeCategories.filter(
			(value) => value !== e.currentTarget.value
		);
	}
	function onRegionChange(e: { currentTarget: { checked: boolean; value: string } }) {
		// if checked add to array
		if (e.currentTarget.checked) {
			formData.laRegions.push(e.currentTarget.value);
			return;
		}
		// if not checked, keep the rest of the regions
		formData.laRegions = formData.laRegions.filter((value) => value !== e.currentTarget.value);
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
						<label class="mb-2 block text-base font-medium">Select Date Range:</label>
						<input
							type="date"
							bind:value={formData.startDate}
							class="custom-calendar-icon input input-bordered input-primary mb-2 mr-2 inline bg-white text-black"
							placeholder="Start Date"
							name="startDate"
						/>
						To
						<input
							type="date"
							bind:value={formData.endDate}
							class="custom-calendar-icon input input-bordered input-primary mb-2 mr-2 inline bg-white text-black"
							placeholder="End Date"
							name="endDate"
						/>
					</div>

					<!-- Crime Categories Multi-Select -->
					<div>
						<label class="mb-2 block font-medium">Select Crime Categories:</label>
						{#each crimeCategories as category}
							<div class="mb-2 mr-6 inline items-center">
								<input
									type="checkbox"
									onchange={onCrimeCategoryChange}
									class="checkbox-primary checkbox mr-1"
									value={category}
									name="category"
									checked={formData.crimeCategories.includes(category)}
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
									onchange={onRegionChange}
									class="checkbox-primary checkbox mr-2"
									value={region}
									name="region"
									checked={formData.laRegions.includes(region)}
								/>
								<span>{region}</span>
							</div>
						{/each}
					</div>

					<div class="space-y-6 text-base">
						<!-- Victim Demographics -->
						<div>
							<label class="mb-2 block font-medium">Select Victim Demographics:</label>

							<!-- Age Group Dropdown -->
							<select
								bind:value={formData.ageRange}
								class="select select-primary mb-2 w-full max-w-xs bg-white text-black"
								name="ageRange"
							>
								<option value="" disabled selected>Age Group</option>
								{#each victimAge as age}
									<option>{age}</option>
								{/each}
							</select>

							<!-- Gender Dropdown -->
							<select
								bind:value={formData.gender}
								class="select select-primary mb-2 w-full max-w-xs bg-white text-black"
								name="gender"
							>
								<option value="" disabled selected>Gender</option>
								{#each victimGender as gender}
									<option>{gender}</option>
								{/each}
							</select>

							<!-- Descent Dropdown -->
							<select
								bind:value={formData.descent}
								class="select select-primary mb-2 w-full max-w-xs bg-white text-black"
								name="descent"
							>
								<option value="" disabled selected>Descent</option>
								{#each victimDescent as descent}
									<option>{descent}</option>
								{/each}
							</select>
						</div>
					</div>
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

<style>
	.custom-calendar-icon::-webkit-calendar-picker-indicator {
		filter: invert(50%);
	}
</style>
