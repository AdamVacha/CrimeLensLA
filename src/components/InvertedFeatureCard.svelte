<script lang="ts">
    export let imageSrc: string;
    export let title: string;
    export let description: string;
    export let buttonText: string;
    export let buttonLink: string = '#'; // Optional link for the button
  </script>
  
  <div class="hero bg-base-200 min-h-fit max-w-10xl">
    <div class="hero-content flex-col lg:flex-row max-w-100 mx-auto pt-20 pb-20">
      <img src={imageSrc} alt={title} class="w-100 h-auto lg:w-96 rounded-lg shadow-2xl" />
      <div class="lg:ml-16 mt-6 lg:mt-0 max-w-5x text-right">
        <h1 class="text-xl font-bold">{title}</h1>
        <p class="py-8 text-md">{description}</p>
        <a href={buttonLink} class="flex justify-end">
          <button class="btn btn-secondary">{buttonText}</button>
        </a>
      </div>
    </div>
  </div>
  