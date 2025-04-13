import globals from 'globals';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default tseslint.config([
	eslint.configs.recommended,
	tseslint.configs.strict,
	tseslint.configs.stylistic,
	...pluginVue.configs['flat/recommended'],
	eslintPluginPrettierRecommended,
	{
		languageOptions: {
			parserOptions: {
				project: './tsconfig.json',
				tsconfigRootDir: import.meta.dirname,
				extraFileExtensions: ['.vue'],
			},
		},
	},
	{
		files: ['**/*.js'],
		extends: [tseslint.configs.disableTypeChecked],
	},
	{
		languageOptions: {
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
			'prettier/prettier': ['off', 'always'],
		},
	},
	{
		ignores: ['**/node_modules/**', '**/build/**', '**/.hsqx/**'],
	},
]);
