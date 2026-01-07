<template>
	<WikiContainer>
		<template #default>
			<TSWikiLinkGrid :data="categories ?? []" />
		</template>
	</WikiContainer>
</template>

<script lang="ts" setup>
import WikiContainer from '#content-module/wiki/wiki-container.vue';

definePageMeta({
	title: '所有小说分类',
});

const { data: categories } = await useAsyncData('novel-categories-list', async () => {
	const routes = useRouter().getRoutes();
	const categorySet = new Set<string>();

	// 筛出带分类的小说并去重
	routes.forEach((route) => {
		if (route.meta.type === 'novel' && Array.isArray(route.meta.category)) {
			route.meta.category.forEach((cat) => {
				if (cat) categorySet.add(cat);
			});
		}
	});

	return Array.from(categorySet).map((cat) => ({
		url: `/novel/特殊页面/分类/${cat}`,
		name: cat,
	}));
});
</script>
