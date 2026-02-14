<template>
	<div class="toc-container">
		<h1>目录</h1>
		<nav ref="tocContent" role="navigation" class="toc-content">
			<slot />
		</nav>
	</div>
</template>

<script lang="ts" setup>
import { ref, shallowRef, inject, onMounted, onUnmounted, type Ref } from 'vue';
import { OverlayScrollbars } from 'overlayscrollbars';

defineOptions({ name: 'WikiToc' });

const tocContent = ref<HTMLElement>();
const osInstance = shallowRef<OverlayScrollbars>();
const contentRef = inject<Ref<HTMLElement | null>>('wiki-content-ref');

let cleanupScrollListener: (() => void) | undefined;

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
 * @returns 清理函数
 */
const initScrollObserver = (contentCache: HTMLElement[], tocLinksCache: HTMLElement[]): (() => void) => {
	let ticking = false;
	let lastId: string | undefined;

	const updateStatus = () => {
		const scrollPosition = window.scrollY || document.documentElement.scrollTop;
		const activeId = getActiveHeadingId(contentCache, scrollPosition);

		if (activeId && activeId !== lastId) {
			lastId = activeId;

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
	updateStatus();

	return () => window.removeEventListener('scroll', onScroll);
};

/**
 * 初始化目录功能
 * @param content - 正文容器
 * @param tocContainer - 目录容器
 */
const initTableOfContents = (content: HTMLElement, tocContainer: HTMLElement): void => {
	const headings = Array.from(content.querySelectorAll('h2, h3, h4, h5, h6')) as HTMLElement[];
	const links = Array.from(tocContainer.querySelectorAll('a[href^="#"]')) as HTMLElement[];

	if (headings.length === 0 || links.length === 0) return;

	cleanupScrollListener = initScrollObserver(headings, links);
};

const initScrollbars = () => {
	if (!tocContent.value) return;

	osInstance.value = OverlayScrollbars(tocContent.value, {
		scrollbars: {
			autoHideDelay: 300,
			autoHide: 'scroll',
			autoHideSuspend: true,
			theme: 'os-theme-nord',
		},
	});
};

const destroyScrollbars = () => {
	osInstance.value?.destroy();
	osInstance.value = undefined;
};

onMounted(() => {
	initScrollbars();

	const contentEl = contentRef?.value ?? null;
	const tocEl = tocContent.value ?? null;

	if (contentEl && tocEl) {
		initTableOfContents(contentEl, tocEl);
	}
});

onUnmounted(() => {
	cleanupScrollListener?.();
	cleanupScrollListener = undefined;
	destroyScrollbars();
});
</script>

<style lang="less" scoped>
@import (reference) '$/nord/src/lesscss/nord.less';

.toc-container {
	top: 1rem;
	gap: 0.75rem;
	color: @nord4;
	display: flex;
	position: sticky;
	padding: 1.25rem;
	max-height: 50vh;
	border-radius: 12px;
	flex-direction: column;
	background-color: @nord1;
}

.toc-container > h1 {
	color: @nord6;
	font-weight: 700;
	font-size: 1.35rem;
	letter-spacing: 0.02em;
}

.toc-container :deep(.toc-content) {
	ol {
		padding-left: 0;
		margin: 0;
		counter-reset: toc-section;
	}

	li {
		display: grid;
		column-gap: 0.6rem;
		align-items: baseline;
		margin-block: 0.35rem;
		counter-increment: toc-section;
		grid-template-columns: max-content 1fr;

		&::before {
			color: @nord9;
			font-size: 1.1rem;
			line-height: 1.6;
			padding-top: 0;
			content: counters(toc-section, '.');
		}

		a {
			display: block;
			color: @nord4;
			line-height: 1.6;
			font-size: 0.95rem;
			overflow-wrap: anywhere;
			word-break: break-word;
			transition:
				color 0.2s ease,
				opacity 0.2s ease;

			&:hover {
				color: @nord8;
			}
		}

		/* 子列表缩进收敛，避免 h6 被挤爆 */
		ol {
			grid-column: 2 / -1;
			padding-left: 0.5rem;
			margin: 0.25rem 0 0.35rem;
			border-left: 1px solid @nord3;

			li {
				margin: 0.25rem 0;
			}
		}
	}
}
</style>
