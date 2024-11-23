<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let startDate = '';
	export let endDate = '';
	export let minDate: string;
	export let maxDate: string;

	const dispatch = createEventDispatcher();

	const updateStartDate = (e: Event) => {
		const newStartDate = (e.target as HTMLInputElement).value;
		dispatch('startDateChange', newStartDate);

		// Ensure endDate respects the updated startDate
		if (new Date(endDate) < new Date(newStartDate)) {
			dispatch('endDateChange', newStartDate);
		}
	};

	const updateEndDate = (e: Event) => {
		const newEndDate = (e.target as HTMLInputElement).value;
		dispatch('endDateChange', newEndDate);

		// Ensure startDate respects the updated endDate
		if (new Date(startDate) > new Date(newEndDate)) {
			dispatch('startDateChange', newEndDate);
		}
	};
</script>

<div>
	<!-- Start Date Input -->
	<input
		type="date"
		bind:value={startDate}
		min={minDate}
		max={endDate || maxDate}
		class="custom-calendar-icon input input-bordered input-primary mb-2 mr-2 inline bg-white text-black"
		on:input={updateStartDate}
	/>

	<!-- End Date Input -->
	<input
		type="date"
		bind:value={endDate}
		min={startDate || minDate}
		max={maxDate}
		class="custom-calendar-icon input input-bordered input-primary mb-2 mr-2 inline bg-white text-black"
		on:input={updateEndDate}
	/>
</div>

<style>
	.custom-calendar-icon::-webkit-calendar-picker-indicator {
		filter: invert(50%);
	}
</style>
