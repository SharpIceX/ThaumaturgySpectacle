import presetNord from 'unocss-preset-nord';
import { defineConfig, presetWind3, transformerDirectives, transformerVariantGroup } from 'unocss';

export default defineConfig({
	theme: {
		extend: {
			colors: {
				theme: '#679DE3',
			},
		},
	},
	presets: [presetNord(), presetWind3()],
	transformers: [transformerDirectives(), transformerVariantGroup()],
});
