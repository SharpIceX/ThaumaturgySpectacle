import 'vue-router';

declare module 'vue-router' {
	interface RouteMeta {
		title: string;
		description?: string;
		category?: string[];

		/** 页面类型，为空则为普通 Vue 页面 */
		type?: 'wiki' | 'novel';

		/** 全文总字数（不含格式） */
		wordCount?: number;

		time?: {
			createdAt: string;
			updatedAt: string;
		};
	}
}

declare module 'nuxt/schema' {
	interface AppConfig {
		/** 全局站点默认关键词 */
		defaultKeywords?: string[];
	}
}
