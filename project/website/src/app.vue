<template>
	<div class="h-screen w-screen flex flex-col">
		<AppHeader />
		<main class="flex-1">
			<NuxtLayout>
				<NuxtPage />
			</NuxtLayout>
		</main>
		<AppFooter />
	</div>
</template>

<script lang="ts" setup>
import AppHeader from './app/header.vue';
import AppFooter from './app/footer.vue';

defineOptions({ name: 'App' });
</script>
