import { OverlayScrollbars } from 'overlayscrollbars';

// 仅在 Nuxt 客户端加载
if (import.meta.client) {
	// 滚动条
	window.osInstance = OverlayScrollbars(document.body, {
		scrollbars: {
			autoHideDelay: 300,
			autoHide: 'scroll',
			autoHideSuspend: true,
			theme: 'os-theme-nord',
		},
	});
}
