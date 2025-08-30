<template>
	<header class="mb-4 bg-nord0 bg-op-80">
		<nav class="navbar">
			<div class="navbar-item">
				<ul>
					<li v-for="item in menuItems.left" :key="item.to">
						<NuxtLink :to="item.to" :aria-label="item.label" class="navbar-content">
							<span aria-hidden="true">
								<component :is="item.icon" />
							</span>
							<span class="navbar-text">{{ item.label }}</span>
						</NuxtLink>
					</li>
					<li>
						<DropdownMenu>
							<template #trigger>
								<button aria-label="百科-下拉菜单" class="navbar-content">
									<span aria-hidden="true">
										<DescriptionIcon aria-hidden="true" />
									</span>
									<span class="navbar-text">百科</span>
								</button>
							</template>
							<template #trigger-on>
								<ArrowDropDownIcon />
							</template>
							<template #trigger-off>
								<ArrowRightIcon aria-hidden="true" />
							</template>
							<template #content>
								<li>
									<NuxtLink :to="encodeURI('/wiki', true)" class="navbar-content">
										<span aria-hidden="true">
											<DescriptionIcon />
										</span>
										<span aria-label="Wiki 首页" class="ml-2">首页</span>
									</NuxtLink>
								</li>
								<li>
									<NuxtLink :to="encodeURI('/特殊页面/所有页面', true)" class="navbar-content">
										<span aria-hidden="true">
											<AllInclusiveIcon />
										</span>
										<span aria-label="所有页面" class="ml-2">所有页面</span>
									</NuxtLink>
								</li>
								<li>
									<NuxtLink :to="encodeURI('/分类', true)" class="navbar-content">
										<span aria-hidden="true">
											<FavoriteBorderIcon />
										</span>
										<span aria-label="分类" class="ml-2">分类</span>
									</NuxtLink>
								</li>
							</template>
						</DropdownMenu>
					</li>
				</ul>
				<div aria-hidden="true" class="mx-8 select-none text-nord8">
					<p>&lt; 幻术奇象 &gt;</p>
				</div>
				<ul>
					<li v-for="item in menuItems.right" :key="item.to">
						<NuxtLink :to="item.to" :aria-label="item.label" class="flex items-center space-x-1">
							<span aria-hidden="true">
								<component :is="item.icon" />
							</span>
							<span class="navbar-text">{{ item.label }}</span>
						</NuxtLink>
					</li>
				</ul>
			</div>
		</nav>
	</header>
</template>

<script setup>
import { encodeURI } from '@ts/utils';
import DropdownMenu from '@/components/dropdown-menu.vue';
import HomeIcon from '@material-design-icons/svg/outlined/home.svg';
import SettingsMenuIcon from '@material-design-icons/svg/outlined/settings.svg';
import ArrowRightIcon from '@material-design-icons/svg/outlined/arrow_right.svg';
import DescriptionIcon from '@material-design-icons/svg/outlined/description.svg';
import AllInclusiveIcon from '@material-design-icons/svg/outlined/all_inclusive.svg';
import ArrowDropDownIcon from '@material-design-icons/svg/outlined/arrow_drop_down.svg';
import FavoriteBorderIcon from '@material-design-icons/svg/outlined/favorite_border.svg';

defineOptions({ name: 'AppHeader' });

const menuItems = {
	left: [{ to: '/', label: '首页', icon: HomeIcon }],
	right: [
		{ to: '/about', label: '关于', icon: FavoriteBorderIcon },
		{ to: '/settings', label: '设置', icon: SettingsMenuIcon },
	],
};
</script>

<style lang="less" scoped>
@import 'nord/src/lesscss/nord.less';

.navbar {
	display: flex;
	padding: 1rem;
	position: relative;
	justify-content: center;

	.navbar-item {
		display: flex;
		ul {
			display: flex;
			gap: 1rem;
		}
	}

	.navbar-content {
		@apply 'flex items-center space-x-1';
	}
}
</style>

<style scoped>
/* 小屏幕 */
@screen lt-sm {
	.navbar {
		.navbar-text {
			display: none;
		}
	}
}
</style>
