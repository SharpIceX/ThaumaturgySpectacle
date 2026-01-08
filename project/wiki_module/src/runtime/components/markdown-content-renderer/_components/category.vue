<template>
	<div class="category">
		<strong>分类：</strong>

		<template v-if="Array.isArray(category)">
			<div v-for="(item, index) in category" :key="index" class="category-item">
				<nuxt-link :to="`/分类/${item}`">
					{{ item }}
				</nuxt-link>
			</div>
		</template>

		<template v-else-if="typeof category === 'string'">
			<nuxt-link :to="`/分类/${category}`">
				{{ category }}
			</nuxt-link>
		</template>
	</div>
</template>

<script lang="ts" setup>
defineProps<{
	category: string | string[];
}>();
</script>

<style lang="less" scoped>
@import (reference) '$/nord/src/lesscss/nord.less';

.category {
	@apply "max-md:overflow-x-auto max-md:flex-nowrap";
	@apply "border-1 border-nord4 border-op-20 rounded-md";

	display: flex;
	flex-wrap: wrap;
	padding: 1rem;
	margin: 1rem 0;
	font-size: 1.2rem;
	white-space: nowrap;

	a {
		color: @nord8;
		transition: color 0.2s ease;

		&:hover {
			color: @nord10;
			text-decoration: underline;
		}
	}
}
</style>
