<template>
	<WikiContainer>
		<template #default>
			<TSWikiLinkGrid :data="novelRoutes ?? []" />
		</template>
	</WikiContainer>
</template>

<script lang="ts" setup>
import WikiContainer from '#content-module/wiki/wiki-container.vue';

// TODO 后续如果按文件夹为一本书需要进行排序

definePageMeta({
	title: '所有小说页面',
});

const { data: novelRoutes } = await useAsyncData('wiki-routes-list', async () => {
	return useRouter()
		.getRoutes()
		.filter((route) => route.meta.type === 'novel')
		.map((route) => ({
			url: route.path,
			name: route.meta.title,
		}));
});
</script>
