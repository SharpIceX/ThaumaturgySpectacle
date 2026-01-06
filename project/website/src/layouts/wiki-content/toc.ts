/**
 * 禁用 eslint 规则 unicorn/prefer-spread备注：
 * 类型“NodeListOf<Element>”必须具有返回迭代器的 "[Symbol.iterator]()" 方法。
 */
/* eslint-disable unicorn/prefer-spread */

/**
 * 获取当前视口正在阅读的标题
 * @param contentCache - 内容区域的 HTMLElement 数组
 * @param scrollPosition - 当前滚动位置
 * @returns 最近的标题 id
 */
const getActiveHeadingId = (contentCache: HTMLElement[], scrollPosition: number): string | undefined => {
	const offset = 100;
	const adjustedScroll = scrollPosition + offset;

	for (let index = contentCache.length - 1; index >= 0; index--) {
		const heading = contentCache[index];
		if (heading && heading.offsetTop <= adjustedScroll) {
			return heading.id;
		}
	}
	return contentCache[0]?.id;
};

/**
 * 合并滚动监听逻辑，并执行初始高亮
 * @param contentCache - 内容区域的 HTMLElement 数组
 * @param tocLinksCache - 目录链接的 HTMLElement 数组
 */
const initScrollObserver = (contentCache: HTMLElement[], tocLinksCache: HTMLElement[]): void => {
	let ticking = false;
	let lastId: string | undefined = undefined;

	// 封装更新逻辑，以便复用
	const updateStatus = () => {
		const scrollPosition = window.scrollY || document.documentElement.scrollTop;
		const activeId = getActiveHeadingId(contentCache, scrollPosition);

		if (activeId && activeId !== lastId) {
			lastId = activeId;

			// 避免初始加载时重复推送相同的 hash
			if (globalThis.location.hash !== `#${activeId}`) {
				history.replaceState(undefined, '', `#${activeId}`);
			}

			for (const link of tocLinksCache) {
				const isTarget = link.getAttribute('href') === `#${activeId}`;
				link.classList.toggle('select-toc', isTarget);

				if (isTarget) {
					link.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
				}
			}
		}
	};

	const onScroll = () => {
		if (!ticking) {
			globalThis.requestAnimationFrame(() => {
				updateStatus();
				ticking = false;
			});
			ticking = true;
		}
	};

	window.addEventListener('scroll', onScroll, { passive: true });

	// 【关键修复】：页面加载完成后立即执行一次，确保初始状态高亮
	updateStatus();
};

/**
 * 初始化目录功能
 * @param content - 正文容器
 * @param tocContainer - 目录容器
 */
const toc = (content: HTMLElement, tocContainer: HTMLElement): void => {
	const headings = Array.from(content.querySelectorAll('h1, h2, h3, h4, h5, h6')) as HTMLElement[];
	const links = Array.from(tocContainer.querySelectorAll('a[href^="#"]')) as HTMLElement[];

	if (headings.length === 0) return;

	initScrollObserver(headings, links);
};

export default toc;
