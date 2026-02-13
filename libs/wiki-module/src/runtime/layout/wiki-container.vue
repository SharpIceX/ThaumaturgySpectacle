<template>
	<div class="wiki-container">
		<article class="body">
			<header class="title">
				<h1>{{ $route.meta['title'] }}</h1>
				<p v-if="$route.meta['description']">
					{{ $route.meta['description'] }}
				</p>
			</header>
			<slot :content-ref="contentRef" />
			<div v-if="$route.meta['category']" class="category">
				<p>分类：</p>
				<ul>
					<li v-for="item in $route.meta['category']" :key="item">
						<NuxtLink :to="`/分类/${item}`">{{ item }}</NuxtLink>
					</li>
				</ul>
			</div>
			<div v-if="$route.meta['time']" class="time">
				<p>创建时间（UTC+8）：{{ $route.meta['time'].createdAt }}</p>
				<p>更新时间（UTC+8）：{{ $route.meta['time'].updatedAt }}</p>
			</div>
		</article>

		<aside v-if="$slots['aside']" class="aside">
			<slot name="aside" />
		</aside>
	</div>
</template>

<script setup lang="ts">
import { ref, provide } from 'vue';

// 传递内容区域给子组件
const contentRef = ref<HTMLElement | null>(null);
provide('wiki-content-ref', contentRef);
</script>

<style lang="less" scoped>
@import (reference) '$/nord/src/lesscss/nord.less';

.wiki-container {
	gap: 2rem;
	display: flex;
	flex-direction: row;
	justify-content: center;

	.body {
		width: 60%;
		row-gap: 4px;
		padding: 2rem;
		display: flex;
		border-radius: 0.5rem;
		flex-direction: column;
		background-color: @nord1;

		// 当 body 是容器内唯一的子元素时，就是没有 aside 的时候
		&:only-child {
			width: 70%;
		}

		@media (max-width: 768px) {
			width: 100%;
			padding: 1rem;
			border-radius: 0;

			&:only-child {
				width: 100%;
			}
		}

		.title {
			@apply "border-b-1 border-b-nord4 border-b-op-20 pb-2";

			h1 {
				@apply "text-3xl font-bold mb-1";
			}

			p {
				@apply "text-sm";
			}

			.time {
				cursor: default;
			}
		}

		.category {
			display: flex;
			padding: 0.8rem;
			cursor: default;
			font-size: 1.2em;
			border: 1.5px solid lighten(@nord3, 20%);

			p {
				text-wrap: nowrap;
			}

			ul {
				display: flex;
				flex-wrap: wrap;
				column-gap: 1rem;

				a {
					color: @nord8;
					transition: color 0.2s ease;

					&:hover {
						color: @nord13;
						text-decoration: none;
					}
				}
			}
		}
	}

	.aside {
		width: 17%;
		position: relative;
		align-self: stretch;

		@media (max-width: 768px) {
			display: none;
		}
	}
}
</style>
