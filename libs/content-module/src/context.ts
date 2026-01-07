import type { createRender as createWikiRender } from '@ts/wiki-render';
import type { createRender as createNovelRender } from '@ts/novel-render';

export const storeContext = {
	WikiRenderer: undefined as unknown as Awaited<ReturnType<typeof createWikiRender>>,
	NovelRenderer: undefined as unknown as Awaited<ReturnType<typeof createNovelRender>>,
};
