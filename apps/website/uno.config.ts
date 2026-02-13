import presetNord from '@ts/unocss-preset-nord';
import { defineConfig, presetWind4, transformerDirectives, transformerVariantGroup } from 'unocss';

export default defineConfig({
	presets: [presetWind4(), presetNord()],
	transformers: [transformerDirectives(), transformerVariantGroup()],

	// ! 解决 unocss 将 Markdown 脚注作为类的问题
	blocklist: [
		/^\[\d+:\d+\]$/,

		// ! 这个是兜底的，有可能解析为变体
		/footnote-ref\d+:\d+$/,
	],
});
