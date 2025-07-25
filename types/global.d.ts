declare module '*.lum' {
	import type { DefineComponent } from 'vue';
	const component: DefineComponent<{}, {}, any>;
	export default component;
}

declare module '*/package.json' {
	import type { PackageJson } from 'type-fest';
	const value: PackageJson;
	export default value;
}
