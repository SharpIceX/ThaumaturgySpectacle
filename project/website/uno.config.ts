import presetNord from 'unocss-preset-nord';
import { defineConfig, presetWind3, transformerDirectives, transformerVariantGroup } from 'unocss';

export default defineConfig({
	presets: [presetNord(), presetWind3()],
	transformers: [transformerDirectives(), transformerVariantGroup()],
});
