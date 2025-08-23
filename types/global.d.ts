// SPDX-FileCopyrightText: 2025 锐冰 <SharpIce@SharpIce.top>
// SPDX-License-Identifier: MIT

declare module '*/package.json' {
	import type { PackageJson } from 'type-fest';
	const value: PackageJson;
	export default value;
}

declare module 'eslint-plugin-promise' {
	import type { Linter } from 'eslint';

	interface PluginPromise {
		configs: {
			recommended: { readonly rules: Readonly<Linter.RulesRecord> };
			'flat/recommended': { readonly rules: Readonly<Linter.RulesRecord> };
		};
	}

	const pluginPromise: PluginPromise;
	export default pluginPromise;
}
