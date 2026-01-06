<template>
	<div class="h-full flex flex-row gap-10 justify-center max-md:flex-col-reverse max-md:items-center">
		<div class="w-[60%] max-md:w-[90%] bg-nord1 p-8 rounded-lg">
			<div ref="contentReference" class="wiki-content">
				<slot name="content" />
			</div>
		</div>

		<div v-if="$slots['toc']" class="extra-content">
			<div class="toc">
				<div class="bg-nord1 rounded-lg p-6">
					<h1 class="text-xl">目录</h1>
					<div ref="tocReference" class="toc-content">
						<slot name="toc" />
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { pangu } from 'pangu/browser';
import initTableOfContents from './toc';

const contentReference = ref<HTMLElement | undefined>(undefined);
const tocReference = ref<HTMLElement | undefined>(undefined);

// 使用 Pangu 处理间隙
const applyPanguSpacing = (element: HTMLElement): void => {
	const isEnabled = localStorage.getItem('setting.pangu.enable') === 'true';
	const isNotSettingsPage = globalThis.location.pathname !== '/settings';

	if (isEnabled && isNotSettingsPage) {
		// spacingNode 会递归处理子节点，比直接操作 innerHTML 更安全、性能更好
		pangu.spacingNode(element);
	}
};

// 初始化目录
const setupTableOfContents = (contentElement: HTMLElement, tocElement: HTMLElement): void => {
	const isEnabled = localStorage.getItem('setting.toc.scroll_toc_visible.enable') !== 'false';

	if (isEnabled) {
		initTableOfContents(contentElement, tocElement);
	}
};

onMounted(async () => {
	if (!contentReference.value) {
		return;
	}

	// 等待插槽渲染完成
	await nextTick();

	// 处理 Pangu
	applyPanguSpacing(contentReference.value);

	// 处理目录
	if (tocReference.value) {
		setupTableOfContents(contentReference.value, tocReference.value);
	}
});
</script>
