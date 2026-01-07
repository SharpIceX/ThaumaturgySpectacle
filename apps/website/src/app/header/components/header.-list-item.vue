<template>
	<ul class="header-item">
		<li v-for="item in props.data" :key="item.label">
			<headerDropdown v-if="'children' in item" v-bind="item" />
			<headerItem v-else v-bind="item" />
		</li>
	</ul>
</template>

<script lang="ts" setup>
import headerItem from './header-item.vue';
import type { HeaderItemType } from '../config';
import headerDropdown from './header-dropdown.vue';

defineOptions({ name: 'AppHeaderListItem' });

const props = defineProps<{
	data: HeaderItemType[];
}>();
</script>

<style lang="less" scoped>
.header-item {
	margin: 0;
	padding: 0;
	display: flex;
	column-gap: 0.5rem;

	li {
		display: inline-flex;
	}
}
</style>
