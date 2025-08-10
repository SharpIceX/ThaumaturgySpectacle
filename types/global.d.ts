// SPDX-FileCopyrightText: 2025 锐冰 <SharpIce@SharpIce.top>
// SPDX-License-Identifier: MIT

declare module '*/package.json' {
	import type { PackageJson } from 'type-fest';
	const value: PackageJson;
	export default value;
}
