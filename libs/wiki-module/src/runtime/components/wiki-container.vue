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
			<div v-if="$route.meta['category']" class="category">
				<p>分类：</p>
				<ul>
					<li v-for="category in $route.meta['category']" :key="category">
						<NuxtLink :to="`/wiki/特殊页面/分类/${category}`">{{ category }}</NuxtLink>
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
defineOptions({ name: 'WikiContainer' });
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
		padding: 2rem;
		border-radius: 0.5rem;
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
			margin-bottom: 8px;
			border-bottom: 1px solid fade(@nord4, 20%);

			h1 {
				margin: 0;
				font-size: 2em;
				font-weight: 700;
			}

			p {
				font-size: 1.1em;
				margin-block: 0.5rem;
			}
		}

		.time {
			cursor: default;
			margin-block: 1rem;

			p {
				margin: 0;
			}
		}

		.category {
			display: flex;
			padding: 0.8rem;
			cursor: default;
			font-size: 1.2em;
			border: 1.5px solid lighten(@nord3, 20%);

			p {
				margin: 0;
				text-wrap: nowrap;
			}

			ul {
				margin: 0;
				padding: 0;
				display: flex;
				flex-wrap: wrap;
				column-gap: 1rem;
				list-style: none;

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
