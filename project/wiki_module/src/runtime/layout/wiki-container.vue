<template>
	<div class="wiki-container">
		<article class="body">
			<header class="title">
				<h1>{{ $route.meta['title'] }}</h1>
				<p v-if="$route.meta['description']">
					{{ $route.meta['description'] }}
				</p>
			</header>
			<slot />
		</article>

		<aside v-if="$slots['aside']" class="wiki-aside">
			<slot name="aside" />
		</aside>
	</div>
</template>

<script lang="ts" setup>
defineOptions({
	name: 'WikiContainerLayout',
});
</script>

<style lang="less" scoped>
@import (reference) '$/nord/src/lesscss/nord.less';

.wiki-container {
	display: flex;
	flex-direction: row;
	justify-content: center;

	.body {
		@apply 'gap-y-2';

		width: 60%;
		padding: 2rem;
		display: flex;
		flex-direction: column;
		border-radius: 0.5rem;
		background-color: @nord1;

		// 当 body 是容器内唯一的子元素时，就是 aside 没有的时候
		&:only-child {
			width: 80%;
		}

		.title {
			@apply "border-b-1 border-b-nord4 border-b-op-20 pb-2";

			h1 {
				@apply "text-3xl font-bold mb-1";
			}

			p {
				@apply "text-sm";
			}
		}
	}

	.aside {
		// aside 存在时的样式
	}
}
</style>
