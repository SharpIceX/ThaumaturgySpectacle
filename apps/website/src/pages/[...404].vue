<template>
	<div class="error">
		<p class="code">404</p>
		<p class="message">您所访问的页面不存在</p>
		<NuxtLink class="link" to="/">返回首页</NuxtLink>
	</div>
</template>

<script lang="ts" setup>
definePageMeta({
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
	}

	.link {
		color: @nord13;
		font-weight: 600;
		border-radius: 12px;
		padding: 1rem 1.5rem;
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
