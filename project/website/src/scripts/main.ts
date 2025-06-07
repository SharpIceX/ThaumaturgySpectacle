// 样式
import '../styles/main.less';
import 'overlayscrollbars/overlayscrollbars.css';

// 字体
import '@fontsource/lxgw-wenkai/500.css'; // 简体中文
import '@fontsource/noto-color-emoji'; // 彩色 Emoji
import '@fontsource-variable/ysabeau'; // 英文

import { OverlayScrollbars } from 'overlayscrollbars';

window.osInstance = OverlayScrollbars(document.body, {
	//
});
