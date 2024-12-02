<script lang="ts">
	// a wrapper around the current date picker that breaks the calender into month choices
	// start date auto = first day of chosen month
	// end date auto = last day of chosen month
	let {
		startDate = '',
		endDate = '',
		minDate = '',
		maxDate = '',
		onStartDateChange = (date: string) => {},
		onEndDateChange = (date: string) => {}
	} = $props();

	// Safely parse date string to YYYY-MM format
	function parseToMonthValue(dateStr: string): string {
		if (!dateStr) return '';
		try {
			const parts = dateStr.split('/');
			if (parts.length === 3) {
				const [month, day, year] = parts;
				return `${year}-${month.padStart(2, '0')}`;
			}
			return '';
		} catch (e) {
			return '';
		}
	}

	let monthValueStart = $derived(parseToMonthValue(startDate));
	let monthValueEnd = $derived(parseToMonthValue(endDate));

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

	const updateStartDate = (e: Event) => {
		const newMonth = (e.target as HTMLInputElement).value;
		const formattedDate = formatToISO(newMonth, false);
		if (formattedDate) onStartDateChange(formattedDate);

		if (endDate && formattedDate && new Date(endDate) < new Date(formattedDate)) {
			onEndDateChange(formattedDate);
		}
	};

	const updateEndDate = (e: Event) => {
		const newMonth = (e.target as HTMLInputElement).value;
		const formattedDate = formatToISO(newMonth, true);
		if (formattedDate) onEndDateChange(formattedDate);

		if (startDate && formattedDate && new Date(startDate) > new Date(formattedDate)) {
			onStartDateChange(formattedDate);
		}
	};
</script>

<div>
	<input
		type="month"
		value={monthValueStart}
		min={minDate ? parseToMonthValue(minDate) : undefined}
		max={endDate ? parseToMonthValue(endDate) : parseToMonthValue(maxDate)}
		class="custom-calendar-icon input input-bordered input-primary mb-2 mr-2 inline bg-white text-black"
		oninput={updateStartDate}
	/>

	<input
		type="month"
		value={monthValueEnd}
		min={startDate ? parseToMonthValue(startDate) : parseToMonthValue(minDate)}
		max={maxDate ? parseToMonthValue(maxDate) : undefined}
		class="custom-calendar-icon input input-bordered input-primary mb-2 mr-2 inline bg-white text-black"
		oninput={updateEndDate}
	/>
</div>

<style>
	.custom-calendar-icon::-webkit-calendar-picker-indicator {
		filter: invert(60%);
	}
</style>
