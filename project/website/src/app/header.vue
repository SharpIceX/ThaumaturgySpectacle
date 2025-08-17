<template>
	<header class="mb-4 bg-nord0 bg-op-80">
		<nav class="navbar">
			<div class="navbar-item">
				<ul>
					<li v-for="item in menuItems.left" :key="item.to">
						<NuxtLink :to="item.to" :aria-label="item.label" class="flex items-center space-x-1">
							<span aria-hidden="true">
								<component :is="item.icon" />
							</span>
							<span class="navbar-text">{{ item.label }}</span>
						</NuxtLink>
					</li>
				</ul>
				<div class="mx-8">
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
import HomeIcon from '@material-design-icons/svg/outlined/home.svg';
import SettingsMenu from '@material-design-icons/svg/outlined/settings.svg';
import DescriptionIcon from '@material-design-icons/svg/outlined/description.svg';
import FavoriteBorderIcon from '@material-design-icons/svg/outlined/favorite_border.svg';

defineOptions({ name: 'AppHeader' });

const menuItems = {
	left: [
		{ to: '/', label: '首页', icon: HomeIcon },
		{ to: '/wiki', label: '百科', icon: DescriptionIcon },
	],
	right: [
		{ to: '/about', label: '关于', icon: FavoriteBorderIcon },
		{ to: '/settings', label: '设置', icon: SettingsMenu },
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
