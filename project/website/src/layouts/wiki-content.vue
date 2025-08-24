<template>
	<div class="h-full flex flex-row gap-10 justify-center max-md:flex-col-reverse max-md:items-center">
		<div class="w-[60%] max-md:w-[90%] bg-nord1 p-8 rounded-lg">
			<div class="wiki-content" ref="contentSlot">
				<slot name="content" />
			</div>
		</div>

		<!-- TOC 部分只有在有内容时显示 -->
		<div v-if="$slots['toc']" class="w-84 max-md:w-[90%]">
			<div class="bg-nord1 rounded-lg p-6">
				<h1 class="text-xl">目录</h1>
				<div class="toc-content">
					<slot name="toc" />
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { pangu } from 'pangu/browser';

const contentSlot = ref<HTMLElement | null>(null);

onMounted(() => {
	// Pangu 处理
	if (
		import.meta.browser && // 确保在浏览器环境中运行
		localStorage.getItem('setting.pangu.enable') === 'true' && // 检查设置
		contentSlot.value && // 确保内容插槽存在
		window.location.pathname !== '/settings' // 排除设置页面
	) {
		const content = contentSlot.value.innerHTML;
		contentSlot.value.innerHTML = pangu.spacingText(content);
	}

	// 可视化 Toc 处理
});
</script>
