import { OverlayScrollbars } from 'overlayscrollbars';

export default defineNuxtPlugin(() => {
	OverlayScrollbars(document.body, {
		scrollbars: {
			autoHideDelay: 300,
			autoHide: 'scroll',
			autoHideSuspend: true,
			theme: 'os-theme-nord',
		},
	});
});
