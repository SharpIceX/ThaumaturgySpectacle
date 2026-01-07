<template>
	<TSDropdown :close-on-content-click="true" :open-on-hover="true">
		<template #trigger="{ isOpen }">
			<component :is="props.icon" class="dropdown-icon" />
			<span>{{ props.label }}</span>
			<ArrowDropDownIcon v-if="isOpen" />
			<ArrowRightIcon v-else />
		</template>

		<template #content>
			<ul class="content">
				<li v-for="subItem in props.children" :key="subItem.label">
					<NuxtLink :to="subItem.link">
						<component :is="subItem.icon" class="icon" />
						<span>{{ subItem.label }}</span>
					</NuxtLink>
				</li>
			</ul>
		</template>
	</TSDropdown>
</template>

<script lang="ts" setup>
import type { HeaderDropdownItem } from '../config';
import ArrowRightIcon from '@material-design-icons/svg/outlined/arrow_right.svg';
import ArrowDropDownIcon from '@material-design-icons/svg/outlined/arrow_drop_down.svg';

defineOptions({ name: 'AppHeaderDropdown' });

const props = defineProps<HeaderDropdownItem>();
</script>

<style lang="less" scoped>
@import (reference) '../mixins.less';
@import (reference) '$/nord/src/lesscss/nord.less';

@media (max-width: 768px) {
	.dropdown-icon {
		display: none;
	}
}

.content {
	padding: 1rem;

	li {
		display: flex;
		min-width: 100%;

		a {
			.a();
			color: @nord4;
			display: flex;
			padding: 0.8rem;
			min-width: 100%;
			text-wrap: nowrap;
			column-gap: 0.2rem;

			&:hover {
				border-radius: 3px;
			}
		}
	}
}
</style>
