import presetNord from '@ts-packages/unocss-preset-nord';
import arcanova_design from 'arcanova_design/src/unocss';
import { defineConfig, presetWind3, transformerDirectives } from 'unocss';

export default defineConfig({
	theme: {
		colors: {
			theme: '#679DE3',
		},
	},
	presets: [presetWind3(), presetNord(), arcanova_design()],
	transformers: [transformerDirectives()],
});
