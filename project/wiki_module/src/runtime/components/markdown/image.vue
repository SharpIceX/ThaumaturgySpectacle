<template>
	<h1>你好</h1>
</template>

<script setup lang="ts">
import preloadImage from '@ts/utils/src/web/preload-image';

interface Props {
	title?: string;
	left?: boolean;
	right?: boolean;
	scale?: number;
}

const props = defineProps<Props>();
</script>
