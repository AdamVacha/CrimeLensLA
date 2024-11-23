<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	// Props
	export let victimAge: string[] = [];
	export let victimGender: string[] = [];
	export let victimDescent: string[] = [];
	export let selectedAge: string = '';
	export let selectedGender: string = '';
	export let selectedDescent: string = '';

	// Define the event type
	type VictimDemographicsSelectEvents = {
		ageChange: string;
		genderChange: string;
		descentChange: string;
	};

	// Set up event dispatcher
	const dispatch = createEventDispatcher();

	// Dispatchers for the dropdowns
	function handleAgeChange(value: string) {
		dispatch('ageChange', value);
	}

	function handleGenderChange(value: string) {
		dispatch('genderChange', value);
	}

	function handleDescentChange(value: string) {
		dispatch('descentChange', value);
	}
</script>

<div>
	<label class="mb-2 block font-medium">Select Victim Demographics:</label>

	<!-- Age Group Dropdown -->
	<select
		bind:value={selectedAge}
		class="select select-primary mb-2 w-full max-w-xs bg-white text-black"
		on:change={(e) => handleAgeChange(e.target.value)}
	>
		<option value="" disabled selected>Age Group</option>
		{#each victimAge as age}
			<option>{age}</option>
		{/each}
	</select>

	<!-- Gender Dropdown -->
	<select
		bind:value={selectedGender}
		class="select select-primary mb-2 w-full max-w-xs bg-white text-black"
		on:change={(e) => handleGenderChange(e.target.value)}
	>
		<option value="" disabled selected>Gender</option>
		{#each victimGender as gender}
			<option>{gender}</option>
		{/each}
	</select>

	<!-- Descent Dropdown -->
	<select
		bind:value={selectedDescent}
		class="select select-primary mb-2 w-full max-w-xs bg-white text-black"
		on:change={(e) => handleDescentChange(e.target.value)}
	>
		<option value="" disabled selected>Descent</option>
		{#each victimDescent as descent}
			<option>{descent}</option>
		{/each}
	</select>
</div>
