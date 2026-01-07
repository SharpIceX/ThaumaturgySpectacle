<template>
	<WikiContainer>
		<template #default>
			<TSWikiLinkGrid :data="wikiRoutes ?? []" />
		</template>
	</WikiContainer>
</template>

<script lang="ts" setup>
import WikiContainer from '#content-module/wiki/wiki-container.vue';

definePageMeta({
	title: '所有百科页面',
});

const { data: wikiRoutes } = await useAsyncData('novel-routes-list', async () => {
	return useRouter()
		.getRoutes()
		.filter((route) => route.meta.type === 'wiki')
		.map((route) => ({
			url: route.path,
			name: route.meta.title,
		}));
});
</script>
