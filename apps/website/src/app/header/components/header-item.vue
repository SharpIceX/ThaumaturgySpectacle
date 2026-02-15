<template>
	<NuxtLink :to="props.link" class="item">
		<component :is="props.icon" class="icon" />
		<span>{{ props.label }}</span>
	</NuxtLink>
</template>

<script lang="ts" setup>
import type { HeaderLinkItem } from '../config';

defineOptions({ name: 'AppHeaderItem' });

const props = defineProps<HeaderLinkItem>();
</script>

<style lang="less" scoped>
@import (reference) '../mixins.less';
@import (reference) '$/nord/src/lesscss/nord.less';

.item {
	.a();
	color: @nord4;
	padding: 0.6rem;
	column-gap: 0.2rem;
	height: min-content;
	align-items: center;
	display: inline-flex;

	@media (max-width: 768px) {
		.icon {
			display: none;
		}
	}
}
</style>
