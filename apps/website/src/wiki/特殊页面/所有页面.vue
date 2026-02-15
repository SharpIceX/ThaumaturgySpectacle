<template>
	<NuxtLayout name="wiki-container">
		<template #default>
			<wikiListPage :data="wikiRoutes" />
		</template>
	</NuxtLayout>
</template>

<script lang="ts" setup>
import wikiListPage from '~/components/utils/wiki-list-page.vue';

definePageMeta({
	title: '所有页面',
});

const wikiRoutes = useRouter()
	.getRoutes()
	.filter((route) => route.meta?.type === 'wiki')
	.map((route) => ({
		url: route.path,
		name: route.meta.title as string,
	}));
</script>
