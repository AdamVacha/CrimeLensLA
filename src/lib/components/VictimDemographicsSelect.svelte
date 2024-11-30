<script lang="ts">
	let {
		victimAge = [],
		victimGender = [],
		victimDescent = [],
		selectedAge = '',
		selectedGender = '',
		selectedDescent = '',
		onAgeChange = (age: string) => {},
		onGenderChange = (gender: string) => {},
		onDescentChange = (descent: string) => {}
	} = $props();
</script>

<div id="victim-demographics">
	<label for="victim-demographics" class="mb-2 block font-medium">Select Victim Demographics:</label
	>

	<!-- Age Group Dropdown -->
	<select
		bind:value={selectedAge}
		class="select select-primary mb-2 w-full max-w-xs bg-white text-black"
		onchange={(e) => onAgeChange((e.target as HTMLSelectElement).value ?? '')}
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
		onchange={(e) => onGenderChange((e.target as HTMLSelectElement).value ?? '')}
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
		onchange={(e) => onDescentChange((e.target as HTMLSelectElement).value ?? '')}
	>
		<option value="" disabled selected>Descent</option>
		{#each victimDescent as descent}
			<option>{descent}</option>
		{/each}
	</select>
</div>
