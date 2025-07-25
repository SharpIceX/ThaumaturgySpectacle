<template>
	<!-- 一包烟一杯茶，一个响应式导航栏搓一天 -->
	<header>
		<nav class="py-4 px-2 flex flex-row justify-between">
			<ul class="nav-link">
				<li v-for="item in menuItems" :key="item.to">
					<NuxtLink :to="item.to" exact-active-class="nav-link-active" class="flex items-center space-x-1">
						<span aria-hidden="true">
							<component :is="item.icon" />
						</span>
						<span>{{ item.label }}</span>
					</NuxtLink>
				</li>
			</ul>
			<ul class="nav-link">
				<li>
					<NuxtLink
						to="/settings"
						title="设置"
						class="nav-item flex items-center"
						aria-label="进入设置页面"
						exact-active-class="nav-link-active">
						<SettingsMenu />
					</NuxtLink>
				</li>
			</ul>
		</nav>
	</header>
</template>

<script setup>
import HomeIcon from '@material-design-icons/svg/outlined/home.svg';
import SettingsMenu from '@material-design-icons/svg/outlined/settings.svg';
import MenuBookModeIcon from '@material-design-icons/svg/outlined/menu_book.svg';
import DescriptionIcon from '@material-design-icons/svg/outlined/description.svg';
import LocationOnModeIcon from '@material-design-icons/svg/outlined/location_on.svg';
import FavoriteBorderIcon from '@material-design-icons/svg/outlined/favorite_border.svg';

defineOptions({ name: 'AppHeader' });

const menuItems = [
	{ to: '/', label: '首页', icon: HomeIcon },
	{ to: '/wiki', label: '百科', icon: DescriptionIcon },
	{ to: '/book', label: '小说', icon: MenuBookModeIcon },
	{ to: '/map', label: '地图', icon: LocationOnModeIcon },
	{ to: '/about', label: '关于', icon: FavoriteBorderIcon },
];
</script>

<style lang="less" scoped>
@import 'nord/src/lesscss/nord.less';

.nav-link {
	@apply flex;

	li {
		@apply px-2;

		// 悬浮效果
		&:hover {
			color: @nord10;
			transition: color 0.35s ease;
		}
	}
}

.nav-link-active {
	@apply "items-center justify-center";

	position: relative;

	&::after {
		content: '';
		left: 50%;
		width: 100%;
		height: 3px;
		bottom: -0.3rem;
		position: absolute;
		background-color: @nord8;
		transform: translateX(-50%);

		animation: nav-link-active 0.5s ease-in-out forwards;
		@keyframes nav-link-active {
			from {
				width: 0;
			}
			to {
				width: 100%;
			}
		}
	}
}
</style>
