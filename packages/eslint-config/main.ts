import path from 'node:path';
import globals from 'globals';
import eslint from '@eslint/js';
import jsdoc from 'eslint-plugin-jsdoc';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';
import regexpPlugin from 'eslint-plugin-regexp';
import pluginPromise from 'eslint-plugin-promise';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import eslintConfigPrettier from 'eslint-config-prettier/flat';

/**
 * @description 项目根目录路径
 */
const ProjectPath = path.resolve(import.meta.dirname, '../../');

const config = defineConfig(
	eslint.configs.recommended,
	tseslint.configs.strict,
	tseslint.configs.stylistic,
	eslintPluginUnicorn.configs.recommended,
	pluginPromise.configs['flat/recommended'],
	regexpPlugin.configs['flat/recommended'],
	jsdoc.configs['flat/recommended-typescript'],
	eslintConfigPrettier,
	{
		languageOptions: {
			parserOptions: {
				sourceType: 'module',
				projectService: true,
				ecmaVersion: 'latest',
				tsconfigRootDir: ProjectPath,
			},
			globals: {
				...globals['shared-node-browser'],
			},
		},
		rules: {
			eqeqeq: 'error',
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
			// Nuxt 项目文件
			'**/.nuxt/**',
			// Node 模块
			'**/node_modules/**',
		],
	},
);

export default config;
