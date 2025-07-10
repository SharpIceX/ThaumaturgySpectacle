import path from 'node:path';
import globals from 'globals';
import eslint from '@eslint/js';
import jsdoc from 'eslint-plugin-jsdoc';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import AstroParser from 'astro-eslint-parser';
import unocss from '@unocss/eslint-config/flat';
import eslintPluginAstro from 'eslint-plugin-astro';
import eslintConfigPrettier from 'eslint-config-prettier/flat';

export default tseslint.config(
	eslint.configs.recommended,
	tseslint.configs.strict,
	tseslint.configs.stylistic,
	jsdoc.configs['flat/recommended'],
	...eslintPluginAstro.configs.recommended,
	...pluginVue.configs['flat/vue2-recommended'],
	unocss,
	eslintConfigPrettier,
	{
		rules: {
			eqeqeq: ['error', 'always'],
			'unocss/order': 'off', // unocss 还没有插件支持格式化时排序
			'vue/multi-word-component-names': 'off',
		},
	},
	{
		languageOptions: {
			parserOptions: {
				sourceType: 'module',
				ecmaVersion: 'latest',
				projectService: true,
				tsconfigRootDir: path.resolve(import.meta.dirname, '../../../../'),
			},
			globals: {
				...globals['shared-node-browser'],
			},
		},
	},
	{
		files: ['*.ts'],
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				extraFileExtensions: ['.vue'],
			},
		},
	},
	{
		files: ['*.vue'],
		languageOptions: {
			parser: vueParser,
			parserOptions: {
				parser: tseslint.parser,
				extraFileExtensions: ['.vue'],
			},
		},
	},
	{
		files: ['**/*.astro'],
		languageOptions: {
			parser: AstroParser,
			parserOptions: {
				project: true,
				projectService: false,
				parser: tseslint.parser,
				extraFileExtensions: ['.astro'],
			},
		},
	},
	{
		files: ['**/*.js'],
		plugins: {
			jsdoc,
		},
		extends: [tseslint.configs.disableTypeChecked],
	},
	{
		ignores: ['**/*.d.ts', '**/node_modules/**', 'build/**', '.hsqx/**', 'project/website/.astro/**'],
	},
);
