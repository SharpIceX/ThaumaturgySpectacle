import { moduleStore } from '../../store';
import type { NuxtHooks } from '@nuxt/schema';

const closeHook: NuxtHooks['close'] = async () => {
	await moduleStore.renderer?.close();
	moduleStore.renderer = undefined;
};

export default closeHook;
