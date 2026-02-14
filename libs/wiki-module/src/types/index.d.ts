import 'vue-router';

declare module 'vue-router' {
	interface RouteMeta {
		title: string;
		description?: string;
		tags?: string[];
		category?: string[];
		type?: 'wiki' | 'novel';

		time?: {
			createdAt: string;
			updatedAt: string;
		};
	}
}
