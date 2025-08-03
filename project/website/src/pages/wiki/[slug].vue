<template>
	<div v-if="content" class="w-[60%] m-a bg-nord1 h-full p-8 rounded-lg">
		<ContentRenderer :value="content" class="wiki-content" />
	</div>
</template>

<script setup>
defineOptions({
	name: 'WikiPage',
});

const slug = useRoute().params['slug'];

// 通用查询函数
const query = () => {
	return queryCollection('wiki').path(`/${slug}`).first();
};

// 获取内容
const { data: content } = await useAsyncData(`/${slug}`, () => {
	return query();
});

// 获取额外数据（实际获取了所有数据）
const data = await query();

useHead({
	title: data?.title,
	meta: [
		{
			name: 'description',
			content: data?.description,
		},
	],
});
</script>
