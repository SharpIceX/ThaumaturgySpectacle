<template>
	<article class="novel-container">
		<header class="meta">
			<dl>
				<template v-if="$route.meta['description']">
					<dt>描述：</dt>
					<dd>{{ $route.meta['description'] }}</dd>
				</template>

				<dt>分类：</dt>
				<dd>
					<ul class="category">
						<li v-for="category in $route.meta['category']" :key="category">
							<NuxtLink :to="`/novel/特殊页面/分类/${category}`">{{ category }}</NuxtLink>
						</li>
					</ul>
				</dd>

				<template v-if="$route.meta['time']">
					<dt>创建时间（UTC+8）：</dt>
					<dd>{{ $route.meta['time'].createdAt }}</dd>

					<dt>更新时间（UTC+8）：</dt>
					<dd>{{ $route.meta['time'].updatedAt }}</dd>
				</template>

				<dt>总字数：</dt>
				<dd>{{ $route.meta['wordCount'] }}</dd>
			</dl>
		</header>

		<section class="novel-content">
			<h1>{{ $route.meta['title'] }}</h1>
			<slot />
		</section>
	</article>
</template>

<script setup lang="ts">
defineOptions({ name: 'NovelContainer' });
</script>

<style lang="less" scoped>
@import (reference) '$/nord/src/lesscss/nord.less';

.novel-container {
	display: flex;
	margin-block: 1rem;
	align-items: center;
	flex-direction: column;

	.meta {
		width: 50%;
		padding: 2rem;
		font-size: 1.05em;
		border-radius: 10px;
		margin-bottom: 2rem;
		background-color: @nord2;

		dl {
			display: grid;
			grid-template-columns: 35% 65%;

			dd {
				overflow-wrap: break-word;
			}

			.category {
				padding: 0;
				display: flex;
				flex-wrap: wrap;
				column-gap: 1rem;
				list-style-type: none;
			}
		}
	}
}
</style>
