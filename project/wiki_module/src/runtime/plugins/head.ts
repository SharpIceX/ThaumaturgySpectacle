import { watchEffect } from 'vue';
import { defineNuxtPlugin, useRouter, useHead } from '#app';

export default defineNuxtPlugin(() => {
	const router = useRouter();

	watchEffect(() => {
		const route = router.currentRoute.value;
		const keywords = route.meta.keywords;

		if (keywords) {
			useHead({
				meta: [
					{
						name: 'keywords',
						content: Array.isArray(keywords) ? keywords.join(', ') : (keywords as string),
					},
				],
			});
		}
	});
});
