import { useNProgress } from '@vueuse/integrations/useNProgress';

export default defineNuxtPlugin((nuxtApp) => {
	const { start, done } = useNProgress();

	const router = useRouter();

	router.beforeEach((to, from, next) => {
		start();
		next();
	});

	router.afterEach(() => {
		done();
	});

	return {
		provide: {
			progressBar: { start, done },
		},
	};
});
