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
      await emailjs.send('service_1e7vy6s', 'template_k3f65qt', {
        firstName,
        lastName,
        email,
        message
      }, 'sqOJqdqwLgGUfoHVC');

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
  
  <div class="min-h-screen flex items-center justify-center">
    <div class="max-w-md w-full bg-gray-200 p-8 rounded-lg shadow-md text-black">
      <h2 class="text-2xl font-semibold text-center mb-4">Contact Us</h2>
      <p class="text-center mb-6">We're here to help. Reach out to us with any questions or concerns.</p>
      
      <form on:submit={handleSubmit} class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">First Name</label>
          <input type="text" bind:value={firstName} class="w-full border p-2 rounded-lg" required />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Last Name</label>
          <input type="text" bind:value={lastName} class="w-full border p-2 rounded-lg" required />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Email</label>
          <input type="email" bind:value={email} class="w-full border p-2 rounded-lg" required />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Message</label>
          <textarea bind:value={message} class="w-full border p-2 rounded-lg" rows="4" required></textarea>
        </div>
        <button type="submit" class="w-full bg-black text-white py-2 rounded-lg">Submit</button>
      </form>
    </div>
  </div>
  