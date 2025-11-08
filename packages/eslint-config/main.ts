// SPDX-FileCopyrightText: 2025 锐冰 <SharpIce@SharpIce.top>
// SPDX-License-Identifier: MIT

import path from 'node:path';
import globals from 'globals';
import eslint from '@eslint/js';
import jsdoc from 'eslint-plugin-jsdoc';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import { defineConfig } from 'eslint/config';
import regexpPlugin from 'eslint-plugin-regexp';
import pluginPromise from 'eslint-plugin-promise';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import type { ConfigWithExtends } from '@eslint/config-helpers';

/**
 * @description 项目根目录路径
 */
const ProjectPath = path.resolve(import.meta.dirname, '../../');

/**
 * @description 通用 TypeScript 配置
 */
const TypeScriptConfig: ConfigWithExtends = {
	extends: [tseslint.configs.strict, tseslint.configs.stylistic, jsdoc.configs['flat/recommended-typescript']],
	languageOptions: {
		parser: tseslint.parser,
		parserOptions: {
			sourceType: 'module',
			tsconfigRootDir: ProjectPath,
		},
	},
};

const config = defineConfig(
	eslint.configs.recommended,
	eslintPluginUnicorn.configs.recommended,
	pluginPromise.configs['flat/recommended'],
	regexpPlugin.configs['flat/recommended'],
	...pluginVue.configs['flat/recommended'],
	eslintConfigPrettier,
	// 通用配置
	{
		rules: {
			eqeqeq: 'error',
			'unicorn/no-immediate-mutation': 'off',
		},
		languageOptions: {
			parserOptions: {
				projectService: true,
				ecmaVersion: 'latest',
			},
		},
	},
	{
		...TypeScriptConfig,
		files: ['**/*.ts'],
		languageOptions: {
			parserOptions: {
				extraFileExtensions: ['.vue'],
			},
			globals: {
				...globals['shared-node-browser'],
			},
		},
	},
	{
		...TypeScriptConfig,
		files: ['**/*.vue'],
		languageOptions: {
			parser: vueParser,
			parserOptions: {
				parser: tseslint.parser,
				extraFileExtensions: ['.vue'],
			},
		},
	},
	// Nuxt 项目
	{
		basePath: path.join(ProjectPath, '/project/website'),
		extends: [
			...(await (async () => {
				const nuxtConfigModule = await import(
					path.join(ProjectPath, '/project/website/.nuxt/eslint.config.mjs')
				);
				return nuxtConfigModule.default();
			})()), //  这个是 Nuxt 的 ESLint 配置
		],
	},
	{
		ignores: [
			// TypeScript 类型
			'**/*.d.ts',
			// 构建输出
			'**/dist/**',
			// 构建/编译缓存
			'**/.cache/**',
			// C# 项目
			'**/dotnet-packages/**',
			// Nuxt 项目文件
			'**/.nuxt/**',
			// Node 模块
			'**/node_modules/**',
		],
	},
);

export default config;
