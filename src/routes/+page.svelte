<script>
	import Trendcard from "../components/Trendcard.svelte";


</script>
<div
  class="hero min-h-screen"
  style="background-image: url(https://images.unsplash.com/photo-1619678369125-8470fa23a979?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGxvcyUyMGFuZ2VsZXMlMjBza3lsaW5lfGVufDB8fDB8fHww);">
  <div class="hero-overlay bg-opacity-60"></div>
  <div class="hero-content text-neutral-content text-center">
    <div class="max-w-md">
      <h1 class="mb-5 text-5xl font-bold fade-in-text" style="text-shadow: 7px 7px 2px #01030a;">
        Welcome to CrimeLens LA
      </h1>
    </div>
  </div>
</div>

<Trendcard
    imageSrc="https://datawrapper.dwcdn.net/y5Sm6/full.png"
    title="Long-Term Trends" 
    description="Track crime rates over the past years and compare crime categories such as theft, assault, and burglary. Adjust the time period and location to see how crime evolves in different regions" 
    buttonText="Analyze Crime Trends" 
    buttonLink="/long-term"
/>
<style>
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.fade-in-text {
		animation: fadeIn 1.5s ease-out;
	}
</style>