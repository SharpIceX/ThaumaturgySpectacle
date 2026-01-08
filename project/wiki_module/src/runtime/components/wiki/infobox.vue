<template>
	<p>TODO</p>
</template>

<script lang="ts" setup>
defineOptions({
	name: 'InfoBox',
});

defineProps<{
	data: {
		left: string;
		right: string;
	}[];
}>();
</script>
