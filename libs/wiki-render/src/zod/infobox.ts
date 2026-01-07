import { z } from 'zod';
import { escapeHTML } from '@ts/shared/src/general/escape-html';

const GenderEnum = z.enum(['男', '女', '无']);

/** 角色信息 */
const CharacterInfoBox = z.object({
	名字: z.array(z.string().transform(escapeHTML)).optional(),
	性别: GenderEnum.optional(),
	物种: z.string().transform(escapeHTML).optional(),
});

const InfoboxSchema = z.discriminatedUnion('type', [
	z.object({
		type: z.literal('角色信息'),
		data: CharacterInfoBox,
	}),
]);

export { InfoboxSchema };
