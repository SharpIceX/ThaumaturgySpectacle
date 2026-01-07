import { storeContext } from '../../context';
import type { NuxtHooks } from '@nuxt/schema';

const closeHook: NuxtHooks['close'] = async () => {
	await storeContext.WikiRenderer?.close();
	await storeContext.NovelRenderer?.close();
};

export default closeHook;
