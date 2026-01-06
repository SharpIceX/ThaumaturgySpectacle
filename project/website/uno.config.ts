import presetNord from '@ts/unocss-preset-nord';
import { defineConfig, presetWind3, transformerDirectives, transformerVariantGroup } from 'unocss';

export default defineConfig({
	presets: [presetWind3(), presetNord()],
	transformers: [transformerDirectives(), transformerVariantGroup()],
});
