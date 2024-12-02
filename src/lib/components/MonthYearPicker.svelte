<script lang="ts">
	let {
		startDate = '2020-01-01',
		endDate = '12/31/2024',
		minDate = '01/01/2020',
		maxDate = '12/31/2024',
		onStartDateChange = (date: string) => {},
		onEndDateChange = (date: string) => {}
	} = $props();

	// cut dates to months / years for display
	let monthValueStart = $derived(
		startDate ? new Date(startDate).toISOString().substring(0, 7) : ''
	);
	let monthValueEnd = $derived(endDate ? new Date(endDate).toISOString().substring(0, 7) : '');

	// helper function to convert back to full date
	function formatDatefromMonth(monthString: string, isEndDate = false): string {
		const [year, month] = monthString.split('-');
		if (isEndDate) {
			// get last day of selected month
			const lastDay = new Date(Number(year), Number(month), 0).getDate();
			const fullEndDate = new Date(`${monthString}-${lastDay}`);

			// then format as MM/DD/YYYY
			return `${(fullEndDate.getMonth() + 1).toString().padStart(2, '0')}/${fullEndDate.getDate().toString().padStart(2, '0')}/${fullEndDate.getFullYear()}`;
		}
		// otherwise get first day of month
		const firstDay = new Date(Number(year), Number(month), 1).getDate();
		const fullStartDate = new Date(`${monthString}-${firstDay}`);
		return `${(fullStartDate.getMonth() + 1).toString().padStart(2, '0')}/${fullStartDate.getDate().toString().padStart(2, '0')}/${fullStartDate.getFullYear()}`;
	}

	const updateStartDate = (e: Event) => {
		const newMonth = (e.target as HTMLInputElement).value;
		const formattedDate = formatDatefromMonth(newMonth, false);
		onStartDateChange(formattedDate);

		// Ensure endDate respects the updated startDate
		if (endDate && new Date(endDate) < new Date(formattedDate)) {
			onEndDateChange(formattedDate);
		}
	};

	const updateEndDate = (e: Event) => {
		const newMonth = (e.target as HTMLInputElement).value;
		const formattedDate = formatDatefromMonth(newMonth, true);
		onEndDateChange(formattedDate);

		// Ensure endDate respects the updated startDate
		if (startDate && new Date(startDate) > new Date(formattedDate)) {
			onStartDateChange(formattedDate);
		}
	};
</script>

<div>
	<input
		type="month"
		value={monthValueStart}
		min={minDate?.substring(0, 7)}
		max={(endDate || maxDate)?.substring(0, 7)}
		class="custom-calendar-icon input input-bordered input-primary mb-2 mr-2 inline bg-white text-black"
		oninput={updateStartDate}
	/>

	<input
		type="month"
		value={monthValueEnd}
		min={(startDate || minDate)?.substring(0, 7)}
		max={maxDate?.substring(0, 7)}
		class="custom-calendar-icon input input-bordered input-primary mb-2 mr-2 inline bg-white text-black"
		oninput={updateEndDate}
	/>
</div>

<style>
	.custom-calendar-icon::-webkit-calendar-picker-indicator {
		filter: invert(60%);
	}
</style>
