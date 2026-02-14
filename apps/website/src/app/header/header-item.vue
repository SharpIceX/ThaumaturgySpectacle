<template>
	<NuxtLink :to="props.data.link" class="item">
		<component :is="props.data.icon" class="icon" />
		<span>{{ props.data.label }}</span>
	</NuxtLink>
</template>

<script lang="ts" setup>
import type { HeaderLinkItem } from './config';

defineOptions({ name: 'AppHeaderItem' });

const props = defineProps<{
	data: HeaderLinkItem;
}>();
</script>

<style lang="less" scoped>
@import (reference) '$/nord/src/lesscss/nord.less';

.item {
	gap: 0.2rem;
	color: @nord4;
	padding: 0.5rem;
	align-items: center;
	border-radius: 1rem;
	display: inline-flex;

	span {
		font-size: 1.1em;
	}

	&:hover {
		background-color: fade(@nord14, 8%);
	}

	&.router-link-active {
		color: @nord10;
		font-weight: bold;

		.icon {
			stroke: @nord10;
		}
	}
}
</style>
