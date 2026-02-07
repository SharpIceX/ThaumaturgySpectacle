<template>
	<NuxtLayout name="wiki-container">
		<template #default>
			<div class="category">
				<ul>
					<li v-for="item in wikiRoutes" :key="item.path">
						<NuxtLink :to="item.path">{{ item.meta['title'] }}</NuxtLink>
					</li>
				</ul>
			</div>
		</template>
	</NuxtLayout>
</template>

<script lang="ts" setup>
definePageMeta({
	title: '所有页面',
});

const wikiRoutes = useRouter()
	.getRoutes()
	.filter((route) => route.meta?.type === 'wiki');
</script>

<style lang="less" scoped>
.category {
	ul {
		column-count: 5;
		column-gap: 1rem;
		list-style-type: disc;
		padding-left: 2em; // 恢复圆点位置
	}

	li {
		break-inside: avoid; // 避免li被拆分，体验更好
		margin-bottom: 0.5em; // 可选：增大行间距
	}
}
</style>
