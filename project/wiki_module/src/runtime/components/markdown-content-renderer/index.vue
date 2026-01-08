<template>
	<div class="wiki-content">
		<slot />
	</div>
	<category v-if="$route.meta['category']" :category="$route.meta['category']" />
	<Time v-if="$route.meta['time']" :time="$route.meta['time']" />
</template>

<script lang="ts" setup>
import Time from './_components/time.vue';
import category from './_components/category.vue';

defineOptions({
	name: 'MarkdownContentRenderer',
});
</script>
