import presetNord from '@ts/unocss-preset-nord';
import { defineConfig, presetWind3, transformerDirectives, transformerVariantGroup } from 'unocss';

export default defineConfig({
	theme: {
		colors: {
			theme: '#679DE3',
		},
	},
	presets: [presetWind3(), presetNord()],
	transformers: [transformerDirectives(), transformerVariantGroup()],
});
