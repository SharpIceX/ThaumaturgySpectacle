import 'vue-router';

declare module 'vue-router' {
	interface RouteMeta {
		title?: string;
		description?: boolean;
		category?: string | string[];

		time?: {
			createdAt: string;
			updatedAt: string;
		};
	}
}

export {};
