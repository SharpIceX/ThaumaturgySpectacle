<template>
	<div class="flex flex-col h-full">
		<AppHeader />
		<main class="flex-1">
			<NuxtPage />
		</main>
		<AppFooter />

		<AppNoScript />
	</div>
</template>

<script setup>
import './main.ts';
import AppHeader from './app/header.vue';
import AppFooter from './app/footer.vue';
import AppNoScript from './app/noscript.vue';

defineOptions({ name: 'App' });
</script>
