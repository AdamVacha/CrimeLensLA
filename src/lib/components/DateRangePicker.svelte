<script lang="ts">
	// updated from event dispatch handler to props rune
	// TODO move all components in /src/components to /src/lib/components
	// TODO copy updated rune logic from DateRangePicker to other components
	let {
		startDate = '',
		endDate = '',
		minDate,
		maxDate,
		onStartDateChange = (date: string) => {},
		onEndDateChange = (date: string) => {}
	} = $props();

	const updateStartDate = (e: Event) => {
		const newStartDate = (e.target as HTMLInputElement).value;
		onStartDateChange(newStartDate);

		// ensure enddate respects updated startdate
		if (new Date(endDate) < new Date(newStartDate)) {
			onEndDateChange(newStartDate);
		}
	};

	const updateEndDate = (e: Event) => {
		const newEndDate = (e.target as HTMLInputElement).value;
		onEndDateChange(newEndDate);

		// ensure startdate respects updated enddate
		if (new Date(startDate) > new Date(newEndDate)) {
			onStartDateChange(newEndDate);
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
		oninput={updateStartDate}
	/>

	<!-- End Date Input -->
	<input
		type="date"
		bind:value={endDate}
		min={startDate || minDate}
		max={maxDate}
		class="custom-calendar-icon input input-bordered input-primary mb-2 mr-2 inline bg-white text-black"
		oninput={updateEndDate}
	/>
</div>

<style>
	.custom-calendar-icon::-webkit-calendar-picker-indicator {
		filter: invert(50%);
	}
</style>
