<script lang="ts">
	import MonthYearPicker from './MonthYearPicker.svelte';

	// updated from event dispatch handler to props rune
	// TODO move all components in /src/components to /src/lib/components
	// TODO copy updated rune logic from DateRangePicker to other components
	let {
		startDate = '01/01/2020',
		endDate = '12/31/2024',
		minDate = '01/01/2020',
		maxDate = '12/31/2024',
		onStartDateChange = (date: string) => {},
		onEndDateChange = (date: string) => {}
	} = $props();
</script>

<div>
	<!-- Start Date Input -->
	<MonthYearPicker
		{startDate}
		{endDate}
		{minDate}
		{maxDate}
		{onStartDateChange}
		{onEndDateChange}
	/>
</div>
