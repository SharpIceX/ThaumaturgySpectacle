<template>
	<AppHeader />
	<main>
		<NuxtPage />
	</main>
	<AppFooter />
</template>

<script lang="ts" setup>
import AppFooter from './app/footer.vue';
import AppHeader from './app/header/header.vue';

defineOptions({ name: 'App' });
</script>

<style lang="less">
#ts_app {
	display: flex;
	min-height: 100dvh;
	flex-direction: column;

	main {
		flex: 1;
	}
}
</style>
