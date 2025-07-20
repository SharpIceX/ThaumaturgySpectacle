import postcssImport from 'postcss-import';
import postcssPresetEnv from 'postcss-preset-env';
import type { Config } from 'postcss-load-config';

const config: Config = {
	plugins: [
		postcssImport(),
		postcssPresetEnv({
			stage: 0,
		}),
	],
};

export default config;
