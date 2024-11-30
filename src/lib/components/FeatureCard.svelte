<script lang="ts">
  interface Props {
    imageSrc: string;
    title: string;
    description: string;
    buttonText: string;
    buttonLink?: string;
  }

  let {
    imageSrc,
    title,
    description,
    buttonText,
    buttonLink = '#'
  }: Props = $props();
  </script>
  
  <div class="hero bg-base-200 min-h-fit max-w-10xl" style="background-color: rgba(0, 0, 0, 0.3);">
    <div class="hero-content flex-col lg:flex-row-reverse max-w-100 mx-auto pt-20 pb-20">
      <img src={imageSrc} alt={title} class="w-100 h-auto lg:w-96 rounded-lg shadow-2xl" />
      <div class="lg me-6 lg:mt-0 max-w-5xl">
        <h1 class="text-xl font-bold">{title}</h1>
        <p class="py-8 text-md">{description}</p>
        <a href={buttonLink}>
          <button class="btn btn-secondary">{buttonText}</button>
        </a>
      </div>
    </div>
  </div>
  