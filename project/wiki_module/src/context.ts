import type { createRender } from './compiler/renderer/main';

export const storeContext = {
	renderer: undefined as unknown as Awaited<ReturnType<typeof createRender>>,
};
