import { z } from 'zod';
import { InfoboxSchema } from './infobox';

const FrontMatterSchema = z.object({
	/** 标题 */
	title: z.string(),
	description: z.string().optional(),
	category: z.array(z.string()).optional(),
	InfoBox: InfoboxSchema.optional(),
});

export { FrontMatterSchema };
