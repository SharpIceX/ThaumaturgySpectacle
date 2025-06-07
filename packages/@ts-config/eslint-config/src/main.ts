import path from 'node:path';
import globals from 'globals';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import unocss from '@unocss/eslint-config/flat';
import eslintPluginAstro from 'eslint-plugin-astro';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default tseslint.config([
	eslint.configs.recommended,
	tseslint.configs.strict,
	tseslint.configs.stylistic,
	...eslintPluginAstro.configs.recommended,
	unocss,
	eslintPluginPrettierRecommended,
	{
		languageOptions: {
			parserOptions: {
				project: true,
				tsconfigRootDir: path.resolve(import.meta.dirname, '../../../../'),
			},
			globals: {
				...globals['shared-node-browser'],
			},
		},
	},
	{
		languageOptions: {
			parserOptions: {
				sourceType: 'module',
				ecmaVersion: 'latest',
			},
		},
		rules: {
			eqeqeq: ['error', 'always'],
			'prettier/prettier': 'off',
			'unocss/order': 'off', // unocss 还没有插件支持格式化时排序
		},
	},
	{
		files: ['**/*.js'],
		extends: [tseslint.configs.disableTypeChecked],
	},
	{
		ignores: ['**/node_modules/**', 'build/**', '.hsqx/**', 'project/website/.astro/**'],
	},
]);
