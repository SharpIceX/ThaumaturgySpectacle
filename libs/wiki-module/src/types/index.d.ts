import 'vue-router';

declare module 'vue-router' {
	interface RouteMeta {
		type: 'wiki' | 'novel';

		title: string;
		description?: string;
		keywords?: string[];
		category?: string[];

		time?: {
			createdAt: string;
			updatedAt: string;
		};
	}
}
