/** @type {import('stylelint').Config} */
export default {
	extends: ['stylelint-prettier/recommended', 'stylelint-config-standard', 'stylelint-config-html/astro'],
	plugins: ['stylelint-prettier', 'stylelint-less'],
	overrides: [
		{
			files: '*.less',
			customSyntax: 'postcss-less',
		},
	],
	rules: {
		// 允许使用已废弃的 at-rule，例如 @font-face
		'at-rule-no-deprecated': null,

		// 禁用声明和规则的空行规则
		'declaration-empty-line-before': null,
		'rule-empty-line-before': null,

		'at-rule-no-unknown': [
			true,
			{
				ignoreAtRules: [
					'apply',
					'screen',

					// 这些严格来说不是 at-rule，但可能会被某些解析器误识别
					'--at-apply',
					'theme',
				],
			},
		],
	},
	ignoreFiles: ['**/*', '!**/*.less', '!**/*.astro', '**/node_modules/**', '/build/**', '/.hsqx/**'],
};
