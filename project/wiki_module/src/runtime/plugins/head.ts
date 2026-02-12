import { defineNuxtPlugin, useRouter, useHead } from '#app';

export default defineNuxtPlugin(() => {
	const router = useRouter();

	useHead(
		{
			meta: [
				{
					name: 'keywords',
					content: () => {
						const routeKeywords = (router.currentRoute.value.meta.keywords as string[]) || [];
						if (routeKeywords.length === 0) return undefined;

						return routeKeywords.join(', ');
					},
				},
			],
		},
		{
			tagPriority: 'low',
		},
	);
});
