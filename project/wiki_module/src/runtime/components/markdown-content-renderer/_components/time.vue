<template>
	<div class="time">
		<p class="created-time">创建于 {{ time.createdAt }}（UTC+8）</p>
		<p class="updated-time">更新于 {{ time.updatedAt }}（UTC+8）</p>
	</div>
</template>

<script lang="ts" setup>
const props = defineProps<{
	time: {
		createdAt: string;
		updatedAt: string;
	};
}>();
</script>

<style lang="less" scoped>
.time {
	@apply 'gap-y-3';
	display: flex;
	flex-direction: column;
}
</style>
