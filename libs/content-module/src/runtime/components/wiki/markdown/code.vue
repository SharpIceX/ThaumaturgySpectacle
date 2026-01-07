<template>
	<div ref="root" class="code-container">
		<button
			type="button"
			class="copy-btn"
			:class="{ 'is-success': copied }"
			:aria-label="copied ? '已复制代码' : '复制代码'"
			@click="handleCopy">
			{{ copied ? '已复制' : '复制' }}
		</button>
		<slot />
	</div>
</template>

<script lang="ts" setup>
import { ref, onScopeDispose } from 'vue';

defineOptions({ name: 'WikiMarkdownCode' });

const root = ref<HTMLElement>();
const copied = ref(false);
let timer: ReturnType<typeof setTimeout> | null = null;

const handleCopy = async () => {
	const codeEl = root.value?.querySelector('code');
	const text = codeEl?.textContent ?? '';

	if (!text || copied.value) return;

	try {
		await navigator.clipboard.writeText(text);
		copied.value = true;

		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			copied.value = false;
			timer = null;
		}, 2000);
	} catch (error) {
		console.error('复制失败:', error);
	}
};

onScopeDispose(() => {
	if (timer) clearTimeout(timer);
});
</script>

<style lang="less" scoped>
@import (reference) '$/nord/src/lesscss/nord.less';

.code-container {
	position: relative;
	display: block;

	.copy-btn {
		top: 8px;
		right: 8px;
		z-index: 1;
		opacity: 0.4;
		color: @nord4;
		font-size: 12px;
		cursor: pointer;
		padding: 6px 12px;
		user-select: none;
		border-radius: 6px;
		position: absolute;
		backdrop-filter: blur(8px);
		border: 1px solid fade(@nord4, 20%);
		background-color: fade(@nord0, 60%);
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

		&:hover,
		&:focus-visible {
			opacity: 1;
			outline: none;
			border-color: @nord4;
			background-color: fade(@nord0, 90%);
			box-shadow: 0 0 0 2px fade(@nord6, 30%);
		}

		// 触摸屏（移动端）
		@media (pointer: coarse) {
			opacity: 0.8;
			background-color: fade(@nord0, 50%);
		}

		&:active {
			transform: scale(0.92);
		}

		&.is-success {
			color: @nord13;
			opacity: 1 !important;
			border-color: @nord13;
			background-color: fade(@nord13, 15%);
		}
	}

	&:hover .copy-btn {
		opacity: 0.9;
	}
}
</style>
