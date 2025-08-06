import path from 'node:path';
import globals from 'globals';
import eslint from '@eslint/js';
import jsdoc from 'eslint-plugin-jsdoc';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import eslintConfigPrettier from 'eslint-config-prettier/flat';

export default tseslint.config(
	eslint.configs.recommended,
	tseslint.configs.strict,
	tseslint.configs.stylistic,
	jsdoc.configs['flat/recommended-typescript'],
	...pluginVue.configs['flat/recommended'],
	...(await (await import('../../../project/website/.nuxt/eslint.config.mjs')).default()), //  这个是 Nuxt 4 的 ESLint 配置，嗯？
	eslintConfigPrettier,
	{
		rules: {
			eqeqeq: ['error', 'always'],
		},
	},
	{
		languageOptions: {
			parserOptions: {
				projectService: true,
				sourceType: 'module',
				ecmaVersion: 'latest',
				tsconfigRootDir: path.resolve(import.meta.dirname, '../../../'),
			},
			globals: {
				...globals.node
				...globals.browser,
			},
		},
	},
	{
		files: ['**/*.ts'],
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				extraFileExtensions: ['.vue'],
			},
		},
	},
	{
		files: ['**/*.vue'],
		languageOptions: {
			parser: vueParser,
			parserOptions: {
				parser: tseslint.parser,
				extraFileExtensions: ['.vue'],
			},
		},
	},
	{
		files: ['**/*.js'],
		extends: [tseslint.configs.disableTypeChecked],
	},
	{
		ignores: ['**/*.d.ts', '**/*.cjs', '**/node_modules/**'],
	},
);
