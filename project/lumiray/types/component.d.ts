import type { Component, DefineComponent } from 'vue';

declare module '@vue/runtime-core' {
	interface GlobalComponents {
		// 构建时用库
		'Ly-Build-Info': DefineComponent<{
			// 网页基本信息
			title: string;
			description?: string;
			keywords?: string;

			// 构建时信息
			publish?: boolean;
		}>;
	}
}
