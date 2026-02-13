<template>
	<div ref="root" class="code-container" :class="{ 'is-copied': copied }">
		<button :class="{ 'is-success': copied }" @click="handleCopy">
			{{ copied ? '已复制' : '复制' }}
		</button>
		<slot />
	</div>
</template>

<script lang="ts" setup>
import { ref, onBeforeUnmount } from 'vue';

defineOptions({ name: 'MarkdownCode' });

const copied = ref(false);
const root = ref<HTMLElement>();
let timer: ReturnType<typeof setTimeout> | undefined;

const handleCopy = async () => {
	const codeElement = root.value?.querySelector('code');
	const text = codeElement?.textContent?.trim() ?? '';

	if (!text) return;

	try {
		await navigator.clipboard.writeText(text);

		// 状态重置逻辑
		copied.value = true;
		if (timer) clearTimeout(timer);

		timer = setTimeout(() => {
			copied.value = false;
		}, 2000);
	} catch (error) {
		console.warn('Copy failed:', error);
	}
};

onBeforeUnmount(() => {
	if (timer) clearTimeout(timer);
});
</script>

<style lang="less" scoped>
@import (reference) '$/nord/src/lesscss/nord.less';

.code-container {
	position: relative;

	button {
		top: 10px;
		z-index: 1;
		opacity: 0;
		right: 10px;
		color: @nord4;
		font-size: 12px;
		cursor: pointer;
		padding: 4px 10px;
		border-radius: 6px;
		position: absolute;
		pointer-events: none;
		backdrop-filter: blur(4px);
		transition: all 0.2s ease-in-out;
		background-color: fade(@nord3, 40%);
		border: 1px solid fade(@nord3, 60%);
	}

	// 悬浮和成功时显示
	&:hover button,
	&.is-copied button {
		opacity: 1;
		pointer-events: auto;
	}

	button:hover {
		color: @nord6;
		border-color: @nord4;
		background-color: @nord3;
	}

	button.is-success {
		color: @nord14;
		border-color: @nord14;
		background-color: fade(@nord14, 15%);
	}
}
</style>
