import { defineNuxtPlugin, useRoute, useAppConfig, useHead } from '#imports';

export default defineNuxtPlugin(() => {
	const route = useRoute();
	const appConfig = useAppConfig();

	useHead(() => {
		const baseKeywords = appConfig.defaultKeywords || [];
		const categories = route.meta.category || [];

		const merged = Array.from(new Set([...baseKeywords, ...categories]));

		return {
			meta: [{ name: 'keywords', content: merged.join(',') }],
		};
	});
});
