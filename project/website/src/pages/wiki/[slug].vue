<template>
	<div class="w-[60%] m-a bg-nord1 h-full p-8">
		<h1>你好</h1>
	</div>
	<!--
	<ContentRenderer :value="post" />
	-->
</template>

<script setup>
defineOptions({
	name: 'WikiPage',
});

const slug = useRoute().params['slug'];
const { data: post } = await useAsyncData(`/${slug}`, () => {
	return queryCollection('wiki').path(`/${slug}`).first();
});
</script>
