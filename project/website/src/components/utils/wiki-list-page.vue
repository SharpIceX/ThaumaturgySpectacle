<template>
	<ul class="container wiki-content">
		<li v-for="item in properties.data" :key="item.url">
			<NuxtLink :to="item.url">{{ item.name }}</NuxtLink>
		</li>
	</ul>
</template>

<script lang="ts" setup>
const properties = defineProps<{
	data: {
		name: string;
		url: string;
	}[];
}>();
</script>

<style lang="less" scoped>
.container {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;

	li {
		padding: 0.5rem 4rem;
		text-align: center;
	}
}
</style>
