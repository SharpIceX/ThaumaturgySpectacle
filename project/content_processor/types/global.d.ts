import { PageSchema } from 'hexo/dist/types';

declare module 'hexo/dist/types' {
	interface PageSchemaExtra extends PageSchema {
		category?: string | string[];
		extra: {
			/** RFC 822 格式，UTC时间 */
			created_at: string;
			/** RFC 822 格式，UTC时间 */
			updated_at: string;
		};
	}
}
