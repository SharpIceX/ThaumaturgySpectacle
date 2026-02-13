import antfu from '@antfu/eslint-config';
import websiteNuxtConfig from './apps/website/.nuxt/eslint.config.mjs';

const config = antfu(
	{
		vue: true,
		markdown: false,
		stylistic: false,
		lessOpinionated: true,
		typescript: {
			tsconfigPath: 'tsconfig.json',
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	{
		rules: {
			eqeqeq: 'error',

			// 安全性
			'pnpm/yaml-enforce-settings': 'off',

			// 允许手动排序
			'yaml/sort-keys': 'off',
			'jsonc/sort-keys': 'off',
			'perfectionist/sort-imports': 'off',
			'perfectionist/sort-named-imports': 'off',
			'perfectionist/sort-named-exports': 'off',

			// 代码样式
			'no-cond-assign': 'off',
			'vue/block-order': 'off',
			'vue/dot-notation': 'off',
			'vue/html-self-closing': 'off',
			'ts/no-use-before-define': 'off',
			'ts/no-unsafe-assignment': 'off',
			'ts/promise-function-async': 'off',
			'ts/no-unsafe-member-access': 'off',
			'ts/consistent-type-imports': 'off',
			'unicorn/number-literal-case': 'off',
			'ts/strict-boolean-expressions': 'off',
			'ts/no-import-type-side-effects': 'off',
			'vue/html-closing-bracket-newline': 'off',
			'import/consistent-type-specifier-style': 'off',
			'vue/singleline-html-element-content-newline': 'off',
			'vue/html-indent': ['error', 'tab'],
		},
	},
).append(
	websiteNuxtConfig({
		files: ['apps/website/**/*.{ts,vue}'],
	}),
);

export default config;
