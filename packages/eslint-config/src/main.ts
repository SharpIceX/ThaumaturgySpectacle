import path from 'node:path';
import globals from 'globals';
import eslint from '@eslint/js';
import jsdoc from 'eslint-plugin-jsdoc';
import pluginVue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import tseslint, { type InfiniteDepthConfigWithExtends } from 'typescript-eslint';

const TypeScriptConfig: InfiniteDepthConfigWithExtends = {
	extends: [tseslint.configs.strict, tseslint.configs.stylistic, jsdoc.configs['flat/recommended-typescript']],
	languageOptions: {
		parser: tseslint.parser,
		parserOptions: {
			projectService: true,
			sourceType: 'module',
			ecmaVersion: 'latest',
			tsconfigRootDir: path.resolve(import.meta.dirname, '../../../'),
		},
	},
};

export default tseslint.config(
	eslint.configs.recommended,
	...pluginVue.configs['flat/recommended'],
	...(await (await import('../../../project/website/.nuxt/eslint.config.mjs')).default()), //  这个是 Nuxt 4 的 ESLint 配置，嗯？
	eslintConfigPrettier,
	{
		rules: {
			eqeqeq: ['error', 'always'],
		},
	},
	{
		files: ['**/*.ts'],
		...TypeScriptConfig,
		languageOptions: {
			parserOptions: {
				extraFileExtensions: ['.vue'],
			},
			globals: {
				...globals.node,
				...globals.browser,
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
		files: ['**/*.cjs'],
		extends: [tseslint.configs.disableTypeChecked, jsdoc.configs['flat/recommended']],
		languageOptions: {
			parserOptions: {
				projectService: false,
				sourceType: 'script',
			},
			globals: {
				hexo: true,
				...globals.node,
				...globals.commonjs,
			},
		},
	},
	{
		ignores: ['**/*.d.ts', '**/dits/**', '**/node_modules/**'],
	},
);
