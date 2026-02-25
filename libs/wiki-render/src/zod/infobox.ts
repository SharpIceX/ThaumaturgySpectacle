import { z } from 'zod';

const GenderEnum = z.enum(['男', '女', '无']);

/** 角色信息 */
const CharacterInfoBox = z.object({
	名字: z.array(z.string()).optional(),
	性别: GenderEnum.optional(),
	物种: z.string().optional(),
});

const InfoboxSchema = z.discriminatedUnion('type', [
	z.object({
		type: z.literal('角色信息'),
		data: CharacterInfoBox,
	}),
]);

export { InfoboxSchema };
