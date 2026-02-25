<template>
	<div class="toc-container">
		<h1 id="toc-title">目录</h1>
		<nav ref="tocNavRef" role="navigation" class="toc-content" aria-labelledby="toc-title" @click="handleTocClick">
			<slot />
		</nav>
	</div>
</template>

<script lang="ts" setup>
import { inject, type Ref, onMounted, onUnmounted, ref, nextTick } from 'vue';

defineOptions({
	name: 'WikiToc',
});

const wikiContentRef = inject<Ref<HTMLElement | null>>('wikiContentRef');
const tocNavRef = ref<HTMLElement | null>(null);
const activeId = ref<string>('');

let observer: IntersectionObserver | null = null;
let isClickScrolling = false;
let tocLinks: HTMLAnchorElement[] = [];

let fastDebounceTimer: ReturnType<typeof setTimeout> | null = null;

const isClient = () => typeof window !== 'undefined';

const clearTimers = () => {
	if (fastDebounceTimer) clearTimeout(fastDebounceTimer);
	fastDebounceTimer = null;
};

const getHeaders = () =>
	Array.from(
		wikiContentRef?.value?.querySelectorAll('h2[id], h3[id], h4[id], h5[id], h6[id]') || [],
	) as HTMLElement[];

const highlightTocLink = (id: string): HTMLAnchorElement | null => {
	let activeLink: HTMLAnchorElement | null = null;

	tocLinks.forEach((link) => {
		const href = link.getAttribute('href');
		const isMatch = href === `#${id}` || href === `#${encodeURIComponent(id)}`;

		if (isMatch) {
			link.classList.add('select');
			activeLink = link;
		} else {
			link.classList.remove('select');
		}
	});

	return activeLink;
};

/**
 * Toc 高亮和 URL 锚点更新
 */
const updateState = (id: string, immediate: boolean = false) => {
	if (!isClient() || !id) return;

	clearTimers();

	const performUpdate = () => {
		if (activeId.value === id) return;

		activeId.value = id;

		requestAnimationFrame(() => {
			const activeLink = highlightTocLink(id);

			if (activeLink && !isClickScrolling) {
				(activeLink as HTMLElement).scrollIntoView({ block: 'nearest', behavior: 'smooth' });
			}

			if (window.location.hash !== `#${id}`) {
				history.replaceState(null, '', `#${id}`);
			}
		});
	};

	if (immediate) {
		performUpdate();
	} else {
		fastDebounceTimer = setTimeout(performUpdate, 120);
	}
};

const initObserver = () => {
	if (!wikiContentRef?.value || typeof IntersectionObserver === 'undefined') return;

	const headers = getHeaders();

	observer = new IntersectionObserver(
		(entries) => {
			if (isClickScrolling) return;
			const visibleEntry = entries.find((entry) => entry.isIntersecting);
			if (visibleEntry) {
				updateState(visibleEntry.target.id, false);
			}
		},
		{
			rootMargin: '-15% 0px -80% 0px',
			threshold: 0,
		},
	);

	headers.forEach((h) => observer?.observe(h));
};

onMounted(async () => {
	await nextTick();
	if (!isClient()) return;

	if (tocNavRef.value) {
		tocLinks = Array.from(tocNavRef.value.querySelectorAll('a'));
	}

	const hash = decodeURIComponent(window.location.hash.slice(1));
	const headers = getHeaders();

	if (hash && headers.some((h) => h.id === hash)) {
		updateState(hash, true);
	} else if (headers.length > 0) {
		const firstId = headers[0]?.id;
		if (firstId) {
			updateState(firstId, true);
		}
	}

	initObserver();
});

onUnmounted(() => {
	observer?.disconnect();
	clearTimers();
});

const handleTocClick = (e: Event) => {
	const link = (e.target as HTMLElement).closest('a');
	if (!link) return;

	const href = link.getAttribute('href');
	if (!href) return;

	const id = decodeURIComponent(href.replace('#', ''));
	isClickScrolling = true;
	updateState(id, true);

	setTimeout(() => {
		isClickScrolling = false;
	}, 1000);
};
</script>

<style lang="less" scoped>
@import (reference) '$/nord/src/lesscss/nord.less';

.toc-container {
	top: 1rem;
	display: flex;
	padding: 1.25rem;
	position: sticky;
	max-height: 50dvh;
	background: @nord1;
	border-radius: 10px;
	flex-direction: column;

	h1 {
		color: @nord6;
		font-weight: 700;
		font-size: 1.1rem;
		margin-bottom: 0.4rem;
		padding-bottom: 0.6rem;
		letter-spacing: 0.02em;
		border-bottom: 1px solid fade(@nord3, 60%);
	}

	:deep(.toc-content) {
		flex: 1;
		overflow-y: auto;

		ol {
			margin: 0;
			padding-left: 1rem;
			list-style-type: none;
			counter-reset: toc-counter;
		}

		& > ol {
			padding-left: 0;
			padding-right: 1.2rem;

			li {
				line-height: 1.5;
				margin: 0.45rem 0;
				font-size: 0.95rem;
				counter-increment: toc-counter;

				a {
					display: block;
					border-radius: 6px;
					padding: 0.35rem 0.55rem;
					color: fade(@nord4, 85%);
					transition: all 0.2s ease;
					box-decoration-break: clone;

					&::before {
						font-size: 0.9em;
						margin-right: 0.5rem;
						color: fade(@nord13, 75%);
						font-family: ui-monospace, monospace;
						content: counters(toc-counter, '.');
					}

					&.select {
						color: @nord8;
						font-weight: 600;
						box-shadow: inset 2px 0 0 0 fade(@nord8, 80%);
						background: linear-gradient(90deg, fade(@nord8, 20%), fade(@nord8, 6%));
					}

					&:hover {
						color: @nord8;
						background-color: fade(@nord8, 10%);
					}
				}
			}
		}
	}
}
</style>
