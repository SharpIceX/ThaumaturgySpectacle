<template>
	<AppBackground />
	<div class="h-screen w-screen flex flex-col h-full">
		<AppHeader />
		<main class="flex-1">
			<NuxtPage />
		</main>
		<AppFooter />
	</div>
</template>

<script setup>
import './main.ts';
import AppHeader from './app/header.vue';
import AppFooter from './app/footer.vue';
import AppBackground from './app/background.vue';

defineOptions({ name: 'App' });
</script>
