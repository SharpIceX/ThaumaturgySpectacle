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
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AppHeader from './app/header.vue';
import AppFooter from './app/footer.vue';
import { OverlayScrollbars } from 'overlayscrollbars';
import { useNProgress } from '@vueuse/integrations/useNProgress';

defineOptions({ name: 'App' });

// 加载动画
const router = useRouter();
const { start, done } = useNProgress();
onMounted(() => {
	router.beforeEach((_to, _from, next) => {
		start(); // 开始加载
		next();
	});

	router.afterEach(() => {
		done(); // 加载完成
	});
});

// 滚动条
if (import.meta.browser) {
	OverlayScrollbars(document.body, {
		scrollbars: {
			autoHideDelay: 300,
			autoHide: 'scroll',
			autoHideSuspend: true,
			theme: 'os-theme-nord',
		},
	});
}
</script>
