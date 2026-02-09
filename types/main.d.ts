/**
 * SPDX-License-Identifier: Zero-Clause BSD
 */

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
