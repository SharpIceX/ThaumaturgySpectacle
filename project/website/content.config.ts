import { defineContentConfig, defineCollection } from '@nuxt/content';

export default defineContentConfig({
	collections: {
		wiki: defineCollection({
			type: 'page',
			source: '../content/content/**/*.lum',
		}),
	},
});
