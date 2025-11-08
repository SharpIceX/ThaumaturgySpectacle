/**
 * 禁用 eslint 规则 unicorn/prefer-spread备注：
 * 类型“NodeListOf<Element>”必须具有返回迭代器的 "[Symbol.iterator]()" 方法。
 */
/* eslint-disable unicorn/prefer-spread */

/**
 * 获取离当前滚动位置最近的标题
 * @param contentCache 内容区域的 HTMLElement[]
 * @param scrollPosition 当前滚动位置
 * @returns 最近的标题 id
 */
const getClosestHeadingId = (contentCache: HTMLElement[], scrollPosition: number): string | undefined => {
	let closestHeadingId: string | undefined = undefined;
	let closestDistance = Infinity;

	for (const heading of contentCache) {
		const distance = Math.abs(heading.offsetTop - scrollPosition);
		if (distance < closestDistance) {
			closestDistance = distance;
			closestHeadingId = heading.id;
		}
	}

	return closestHeadingId;
};

/**
 * 通用的滚动处理逻辑
 * @param callback 滚动处理后的回调
 */
const handleScrollEvent = (callback: (scrollPosition: number) => void): void => {
	let ticking = false;
	let timer: ReturnType<typeof setTimeout> | undefined;

	const handleScroll = () => {
		if (!ticking) {
			ticking = true;
			if (timer) {
				clearTimeout(timer);
			}
			timer = globalThis.setTimeout(() => {
				const scrollPosition = window.scrollY || document.documentElement.scrollTop;
				callback(scrollPosition);
				ticking = false;
			}, 300);
		}
	};

	window.addEventListener('scroll', handleScroll);
};

/**
 * 滚动到最近的标题并更新 URL 锚点
 * @param contentCache 内容区域的 HTMLElement[]
 */
const scrollToNearestHeading = (contentCache: HTMLElement[]): void => {
	handleScrollEvent((scrollPosition) => {
		const closestHeadingId = getClosestHeadingId(contentCache, scrollPosition);

		// 只有在标题变化时才更新 URL
		if (closestHeadingId && globalThis.location.hash !== `#${closestHeadingId}`) {
			history.replaceState(undefined, '', `#${closestHeadingId}`);
		}
	});
};

/**
 * 更新目录的高亮显示
 * @param contentCache 内容区域的 HTMLElement[]
 * @param tocLinksCache 目录链接的 HTMLElement[]
 */
const updateTocHighlightOnScroll = (contentCache: HTMLElement[], tocLinksCache: HTMLElement[]): void => {
	handleScrollEvent((scrollPosition) => {
		const closestHeadingId = getClosestHeadingId(contentCache, scrollPosition);

		// 移除之前选中的链接
		const previousLink = tocLinksCache.find((l) => l.classList.contains('select-toc'));
		previousLink?.classList.remove('select-toc');

		// 高亮当前的标题链接
		const link = tocLinksCache.find((l) => l.getAttribute('href') === `#${closestHeadingId}`);
		if (link) {
			link.classList.add('select-toc');
			link.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
		}
	});
};

/**
 * 初始化滚动事件监听
 * @param content 内容区域的 HTMLElement
 * @param toc 目录区域的 HTMLElement
 */
const toc = (content: HTMLElement, toc: HTMLElement): void => {
	const contentCache = Array.from(content.querySelectorAll('h2, h3, h4, h5, h6')) as HTMLElement[];
	const tocLinksCache = Array.from(toc.querySelectorAll('a[href^="#"]')) as HTMLAnchorElement[];

	scrollToNearestHeading(contentCache);

	// 仅在非移动设备上启用目录高亮功能
	if (!globalThis.matchMedia('(max-width: 600px)').matches) {
		updateTocHighlightOnScroll(contentCache, tocLinksCache);
	}
};

export default toc;
