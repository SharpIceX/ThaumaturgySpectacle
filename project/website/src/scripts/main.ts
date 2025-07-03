// 样式
import '../styles/main.less';
import '@ts-packages/ts-bulma';
import 'overlayscrollbars/overlayscrollbars.css';

// 字体
import '@fontsource/noto-color-emoji'; // 彩色 Emoji

import { OverlayScrollbars } from 'overlayscrollbars';

window.osInstance = OverlayScrollbars(document.body, {
	scrollbars: {
		autoHideDelay: 300,
		autoHide: 'scroll',
		autoHideSuspend: true,
		theme: 'os-theme-nord',
	},
});

window.addEventListener('load', () => {
	// 当页面加载完成后，移除 FOUC 和预加载样式
	const styles = document.querySelectorAll('head style[data-fouc-fix], head style[data-pre-fix]');
	styles.forEach(style => {
		style.remove();
	});
});
