<script>
	import LeftCard from '../lib/components/InvertedFeatureCard.svelte';
	import RightCard from '../lib/components/FeatureCard.svelte';
	import FeatureCard from '../lib/components/FeatureCard.svelte';
	import InvertedFeatureCard from '../lib/components/InvertedFeatureCard.svelte';
</script>

<div
	class="hero min-h-screen"
	style="background-image: url(https://images.unsplash.com/photo-1619678369125-8470fa23a979?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGxvcyUyMGFuZ2VsZXMlMjBza3lsaW5lfGVufDB8fDB8fHww);"
>
	<div class="hero-overlay bg-opacity-40"></div>
	<div class="hero-content text-center text-neutral-content">
		<div class="max-w-md">
			<h1 class="fade-in-text mb-5 text-4xl font-bold" style="text-shadow: 7px 7px 2px #01030a;">
				Welcome to CrimeLens LA
			</h1>
		</div>
	</div>
</div>

<FeatureCard
	imageSrc="/images/Long-term.png"
	title="Long-Term Trends"
	description="Track crime rates over the past years and compare crime categories such as theft, assault, and burglary. Adjust the time period and location to see how crime evolves in different regions"
	buttonText="Analyze Crime Trends"
	buttonLink="/long-term"
/>
<InvertedFeatureCard
	imageSrc="/images/Long-term.png"
	title="Demographic Influence on Crime"
	description="Understand the influence of demographic factors like age, gender, and descent on crime patterns. Filter by specific regions and crime types to get detailed insights."
	buttonText="Explore by Demographics"
	buttonLink="/demographic"
/>
<FeatureCard
	imageSrc="/images/Seasonal.png"
	title="Seasonal Insights"
	description="Examine how crime patterns shift during different seasons, months, and holidays. Find out which times of the year experience the highest or lowest crime rates."
	buttonText="Discover Seasonal Crime Patterns"
	buttonLink="/seasonal"
/>
<InvertedFeatureCard
	imageSrc="/images/Geographic.png"
	title="Geographic Hotspots"
	description="Use our interactive heatmap to visualize crime density across neighborhoods. Zoom in on specific areas or filter by crime type to identify crime hotspots."
	buttonText="View Crime Hotspots"
	buttonLink="/geographic"
/>
<FeatureCard
	imageSrc="/images/ExternalEvents.png"
	title="Impact of External Events"
	description="Analyze how major events, like the COVID-19 pandemic or natural disasters, affect crime rates. Compare crime before, during, and after these events."
	buttonText="Event Based Analysis"
	buttonLink="/external-events"
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
