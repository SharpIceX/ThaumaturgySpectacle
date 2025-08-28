<template>
	<!-- 主要内容 -->
	<div class="h-full flex flex-row gap-10 justify-center max-md:flex-col-reverse max-md:items-center">
		<div class="w-[60%] max-md:w-[90%] bg-nord1 p-8 rounded-lg">
			<div ref="contentSlot" class="wiki-content">
				<slot name="content" />
			</div>
		</div>

		<!-- 扩展内容 -->
		<div v-if="$slots['toc']" class="extra-content">
			<!-- TOC 部分只有在有内容时显示 -->
			<div v-if="$slots['toc']" class="toc">
				<div class="bg-nord1 rounded-lg p-6">
					<h1 class="text-xl">目录</h1>
					<div ref="tocSlot" class="toc-content">
						<slot name="toc" />
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import toc from './toc';
import { ref, onMounted } from 'vue';
import { pangu } from 'pangu/browser';

const contentSlot = ref<HTMLElement | undefined>(undefined);
const tocSlot = ref<HTMLElement | undefined>(undefined);

if (import.meta.browser) {
	onMounted(() => {
		// 确保内容插槽存在
		if (contentSlot.value) {
			// Pangu 处理
			if (
				localStorage.getItem('setting.pangu.enable') === 'true' &&
				globalThis.location.pathname !== '/settings'
			) {
				const content = contentSlot.value.innerHTML;
				contentSlot.value.innerHTML = pangu.spacingText(content);
			}

			// 可视化 Toc 处理
			if (localStorage.getItem('setting.toc.scroll_toc_visible.enable') !== 'false' && tocSlot.value) {
				toc(contentSlot.value, tocSlot.value);
			}
		}
	});
}
</script>
