import postcssImport from 'postcss-import';
import postcssPresetEnv from 'postcss-preset-env';
import type { Config } from 'postcss-load-config';
import postcssRemoveFontFormat from 'postcss-remove-format-fonts';

const config: Config = {
	plugins: [
		postcssImport(),
		postcssPresetEnv({
			stage: 0,
		}),
		postcssRemoveFontFormat('woff'),
	],
};

export default config;
