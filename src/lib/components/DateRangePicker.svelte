<script lang="ts">
	// Props passed to the picker component
	let {
		startDate = '',
		endDate = '',
		minDate = '2020-01-01',
		maxDate = '2024-09-02',
		onStartDateChange = (date: string) => {},
		onEndDateChange = (date: string) => {}
	} = $props();

	// Utility function to parse `YYYY-MM-DD` to `YYYY-MM`
	function parseToMonthValue(dateStr: string): string {
		if (!dateStr) return '';
		const [year, month] = dateStr.split('-');
		return `${year}-${month}`;
	}

	// Utility function to format `YYYY-MM` to `YYYY-MM-DD` for start and end dates
	function formatToISO(monthStr: string, isEndDate = false): string {
		if (!monthStr) return '';
		const [year, month] = monthStr.split('-');
		if (!year || !month) return '';

		if (isEndDate) {
			const lastDay = new Date(Number(year), Number(month), 0).getDate();
			return `${year}-${month}-${lastDay.toString().padStart(2, '0')}`;
		}
		return `${year}-${month}-01`;
	}

	// Dynamically computed min and max values
	let computedMinEndDate = $derived(
		startDate ? parseToMonthValue(startDate) : parseToMonthValue(minDate)
	);
	let computedMaxStartDate = $derived(
		endDate ? parseToMonthValue(endDate) : parseToMonthValue(maxDate)
	);

	// Handle Start Date Change
	function handleStartDateChange(e: Event) {
		const newMonth = (e.target as HTMLInputElement).value;
		const formattedDate = formatToISO(newMonth, false);

		if (formattedDate) {
			if (endDate && new Date(formattedDate) > new Date(endDate)) {
				alert('Start date cannot be greater than the end date.');
				return;
			}
			onStartDateChange(formattedDate);
		}
	}

	// Handle End Date Change
	function handleEndDateChange(e: Event) {
		const newMonth = (e.target as HTMLInputElement).value;
		const formattedDate = formatToISO(newMonth, true);

		if (formattedDate) {
			if (startDate && new Date(formattedDate) < new Date(startDate)) {
				alert('End date cannot be earlier than the start date.');
				return;
			}
			onEndDateChange(formattedDate);
		}
	}
</script>

<div>
	<!-- Start Date Picker -->
	<input
		type="month"
		value={parseToMonthValue(startDate)}
		min={parseToMonthValue(minDate)}
		max={computedMaxStartDate}
		class="custom-calendar-icon input input-bordered input-primary mb-2 mr-2 inline bg-white text-black"
		oninput={handleStartDateChange}
	/>

	<!-- End Date Picker -->
	<input
		type="month"
		value={parseToMonthValue(endDate)}
		min={computedMinEndDate}
		max={parseToMonthValue(maxDate)}
		class="custom-calendar-icon input input-bordered input-primary mb-2 mr-2 inline bg-white text-black"
		oninput={handleEndDateChange}
	/>
</div>

<style>
	.custom-calendar-icon::-webkit-calendar-picker-indicator {
		filter: invert(60%);
	}
</style>
