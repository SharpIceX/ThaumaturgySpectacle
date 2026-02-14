<template>
	<ul class="header-item">
		<li v-for="item in props.data" :key="item.label">
			<!-- 下拉菜单 -->
			<TSDropdown v-if="'children' in item">
				<template #trigger="{ isOpen }">
					<component :is="item.icon" class="icon" />
					<span>{{ item.label }}</span>
					<ArrowDropDownIcon v-if="isOpen" />
					<ArrowRightIcon v-else />
				</template>

				<template #content>
					<li v-for="subItem in item.children" :key="subItem.label">
						<router-link :to="subItem.link" class="dropdown-item">
							<component :is="subItem.icon" class="icon-s" />
							<span>{{ subItem.label }}</span>
						</router-link>
					</li>
				</template>
			</TSDropdown>

			<!-- 普通 -->
			<headerItem v-else :data="item" />
		</li>
	</ul>
</template>

<script lang="ts" setup>
import headerItem from './header-item.vue';
import type { HeaderItemType } from './config';
import ArrowRightIcon from '@material-design-icons/svg/outlined/arrow_right.svg';
import ArrowDropDownIcon from '@material-design-icons/svg/outlined/arrow_drop_down.svg';

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
	align-items: center;

	li {
		display: inline-flex;
	}
}
</style>
