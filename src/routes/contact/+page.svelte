<script>
	import { onMount } from 'svelte';
	import emailjs from 'emailjs-com';

	let firstName = '';
	let lastName = '';
	let email = '';
	let message = '';

	async function handleSubmit(event) {
		event.preventDefault();

		try {
			await emailjs.send(
				'service_1e7vy6s',
				'template_k3f65qt',
				{
					firstName,
					lastName,
					email,
					message
				},
				'sqOJqdqwLgGUfoHVC'
			);

			alert('Your message has been sent!');
			// Clear the form
			firstName = '';
			lastName = '';
			email = '';
			message = '';
		} catch (error) {
			console.error('Error sending email:', error);
			alert('Failed to send the message. Please try again later.');
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center">
	<div class="w-full max-w-md rounded-lg bg-gray-200 p-8 text-black shadow-md">
		<h2 class="mb-4 text-center text-2xl font-semibold">Contact Us</h2>
		<p class="mb-6 text-center">
			We're here to help. Reach out to us with any questions or concerns.
		</p>

		<form on:submit={handleSubmit} class="space-y-4">
			<div>
				<label class="mb-1 block text-sm font-medium">First Name</label>
				<input type="text" bind:value={firstName} class="w-full rounded-lg border p-2" required />
			</div>
			<div>
				<label class="mb-1 block text-sm font-medium">Last Name</label>
				<input type="text" bind:value={lastName} class="w-full rounded-lg border p-2" required />
			</div>
			<div>
				<label class="mb-1 block text-sm font-medium">Email</label>
				<input type="email" bind:value={email} class="w-full rounded-lg border p-2" required />
			</div>
			<div>
				<label class="mb-1 block text-sm font-medium">Message</label>
				<textarea bind:value={message} class="w-full rounded-lg border p-2" rows="4" required
				></textarea>
			</div>
			<button type="submit" class="w-full rounded-lg bg-black py-2 text-white">Submit</button>
		</form>
	</div>
</div>
