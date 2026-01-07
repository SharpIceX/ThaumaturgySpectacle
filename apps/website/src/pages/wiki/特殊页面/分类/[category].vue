<template>
	<WikiContainer>
		<TSWikiLinkGrid :data="wikiList" />
	</WikiContainer>
</template>

<script lang="ts" setup>
import WikiContainer from '#content-module/wiki/wiki-container.vue';

const route = useRoute();
const router = useRouter();

const categoryName = (route.params as { category: string }).category;

// 筛选出对应分类的 Wiki
const wikiList = await (async () => {
	const list = router
		.getRoutes()
		.filter(
			(r) => r.meta.type === 'wiki' && Array.isArray(r.meta.category) && r.meta.category.includes(categoryName),
		)
		.map((r) => ({
			url: r.path,
			name: r.meta.title,
		}));

	if (list.length === 0) {
		throw showError({
			fatal: true,
			statusCode: 404,
		});
	}

	return list;
})();

route.meta.title = `百科分类：${categoryName}`;
</script>
