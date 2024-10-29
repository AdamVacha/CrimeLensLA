<script>
	import Trendcard from "../components/Trendcard.svelte";


</script>
<div
  class="hero min-h-screen"
  style="background-image: url(https://img.daisyui.com/images/stock/photo-1507358522600-9f71e620c44e.webp);">
  <div class="hero-overlay bg-opacity-60"></div>
  <div class="hero-content text-neutral-content text-center">
    <div class="max-w-md">
      <h1 class="mb-5 text-5xl font-bold">Hello there</h1>
      <p class="mb-5">
        Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda excepturi exercitationem
        quasi. In deleniti eaque aut repudiandae et a id nisi.
      </p>
      <button class="btn btn-primary">Get Started</button>
    </div>
  </div>
</div>
<Trendcard
  imageSrc="https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.webp" 
  title="Long-Term Trends" 
  description="Track crime rates over the past years and compare crime categories such as theft, assault, and burglary. Adjust the time period and location to see how crime evolves in different regions" 
  buttonText="Analyze Crime Trends" 
  buttonLink="/long-term"
/>
