import { useNProgress } from '@vueuse/integrations/useNProgress';

export default defineNuxtPlugin(() => {
	const { start, done } = useNProgress();

	const router = useRouter();

	router.beforeEach((_to, _from, next) => {
		start();
		next();
	});

	router.afterEach((_to, _from, failure) => {
		if (!failure) {
			done();
		}
	});

	return {
		provide: {
			progressBar: { start, done },
		},
	};
});
