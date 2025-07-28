import { defineTransformer } from '@nuxt/content';
import { render as lumirayRender } from '@ts/lumiray';

export default defineTransformer({
	name: 'Lumiray',
	extensions: ['.lum'],
	parse: file => {
		const render = lumirayRender(file.body);
		return {
			...file,
			body: render.vue,
			data: {
				title: render.data.title,
				description: render.data.description,
				keywords: render.data.keywords,
			},
			toc: render.toc,
		};
	},
});
