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
	title: '所有百科分类',
});

const { data: categories } = await useAsyncData('wiki-categories-list', async () => {
	const routes = useRouter().getRoutes();
	const categorySet = new Set<string>();

	// 筛出带分类的 wiki 并去重
	routes.forEach((route) => {
		if (route.meta.type === 'wiki' && Array.isArray(route.meta.category)) {
			route.meta.category.forEach((cat) => {
				if (cat) categorySet.add(cat);
			});
		}
	});

	return Array.from(categorySet).map((cat) => ({
		url: `/wiki/特殊页面/分类/${cat}`,
		name: cat,
	}));
});
</script>
