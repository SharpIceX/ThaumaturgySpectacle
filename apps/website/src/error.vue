<template>
	<div class="error">
		<p class="code">{{ props.error?.status || `未知错误` }}</p>
		<p class="message">{{ props.error?.message || '发生了意外错误' }}</p>
		<button class="link" @click="handleError">返回首页</button>
	</div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app';

const props = defineProps({
	error: Object as () => NuxtError,
});

const handleError = () => clearError({ redirect: '/' });

useHead({
	title: '页面不存在',
});
</script>

<style lang="less" scoped>
@import (reference) '$/nord/src/lesscss/nord.less';

.error {
	height: 100%;
	display: flex;
	align-items: center;
	flex-direction: column;
	justify-content: center;

	.code {
		margin: 0;
		line-height: 1;
		font-size: 10em;
		font-weight: 900;
		color: transparent;
		letter-spacing: 0.1em;

		background: linear-gradient(135deg, @nord8, @nord10);
		background-clip: text;
	}

	.message {
		margin-top: 0;
		color: @nord13;
		font-size: 1.5em;
		margin-bottom: 2rem;
	}

	.link {
		color: @nord13;
		cursor: pointer;
		font-size: 1rem;
		font-weight: 600;
		border-radius: 12px;
		padding: 1rem 1.5rem;
		background: transparent;
		transition: all 0.3s ease;
		border: 1px solid fade(@nord13, 40%);

		&:hover {
			color: @nord10;
			border-color: @nord10;
			transform: translateY(-2px);
		}
	}
}
</style>
