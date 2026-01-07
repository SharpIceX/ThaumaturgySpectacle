import { z } from 'zod';
import { InfoboxSchema } from './infobox';
import { escapeHTML } from '@ts/shared/src/general/escape-html';

const FrontMatterSchema = z.object({
	/** 标题 */
	title: z.string().transform(escapeHTML),
	description: z.string().transform(escapeHTML).optional(),
	category: z.array(z.string().transform(escapeHTML)).optional(),
	InfoBox: InfoboxSchema.optional(),
});

export { FrontMatterSchema };
