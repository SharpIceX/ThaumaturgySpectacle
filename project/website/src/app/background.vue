<template>
	<div class="bg" aria-hidden="true"></div>
</template>

<script setup>
defineOptions({ name: 'AppBackground' });
</script>

<style lang="less" scoped>
.bg {
	&::before {
		inset: 0;
		content: '';
		z-index: -1;
		position: fixed;
		background: url('/background.webp') center/cover no-repeat;
	}
}
</style>
