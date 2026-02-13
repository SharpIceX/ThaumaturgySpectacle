import { storeContext } from '../../context';
import type { NuxtHooks } from '@nuxt/schema';

const closeHook: NuxtHooks['close'] = async () => {
	await storeContext.renderer?.close();
};

export default closeHook;
