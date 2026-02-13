import type { createRender } from '@ts/wiki_render';

export const storeContext = {
	renderer: undefined as unknown as Awaited<ReturnType<typeof createRender>>,
};
