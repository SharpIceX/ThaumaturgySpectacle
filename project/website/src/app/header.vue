<template>
	<!-- 一包烟一杯茶，一个响应式导航栏搓一天 -->
	<header class="border-b border-b-nord4 border-op-30 mb-4 bg-nord0 bg-op-80">
		<nav class="p-4 flex flex-row justify-between">
			<div class="navbar">
				<div tabindex="0" role="button" class="navbar-toggle">
					<MenuIcon />
				</div>

				<!-- 导航内容区 -->
				<ul tabindex="0" class="navbar-content">
					<li v-for="item in menuItems" :key="item.to">
						<NuxtLink :to="item.to" exact-active-class="text-nord8" class="flex items-center space-x-1">
							<span aria-hidden="true">
								<component :is="item.icon" />
							</span>
							<span>{{ item.label }}</span>
						</NuxtLink>
					</li>
				</ul>
			</div>

			<ul>
				<li>
					<NuxtLink to="/settings" title="设置" class="flex items-center" aria-label="进入设置页面">
						<SettingsMenu />
					</NuxtLink>
				</li>
			</ul>
		</nav>
	</header>
</template>

<script setup>
import MenuIcon from '@material-design-icons/svg/outlined/menu.svg';
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

<style scoped>
/* 小屏幕 */
@screen lt-sm {
	/* 当焦点在导航栏时，则显示内容 */
	.navbar:focus-within {
		.navbar-content {
			display: flex;
		}
	}

	/* TODO: 当点击了 navbar-content 时，则隐藏内容 */

	/* TODO: 当焦点在导航栏并且再次被点击，则隐藏内容 */

	/* 当焦点不在导航栏时，则隐藏内容 */
	.navbar:not(:focus-within) {
		.navbar-content {
			display: none;
		}
	}
}

/* 大屏幕 */
@screen sm {
	.navbar-toggle {
		display: none;
	}
}
</style>

<style scoped>
/* 小屏幕 */
@screen lt-sm {
	.navbar {
		position: relative;
	}

	.navbar-content {
		@apply "rounded-lg";
		@apply "py-2 px-4 gap-3";
		@apply "bg-nord3 bg-op-70";

		@apply "flex flex-col justify-center items-center";

		min-width: 7rem;
		position: absolute;

		/* 动画效果 */
		animation: slideIn 0.3s ease-in-out;
		animation-fill-mode: forwards;
	}
}

@keyframes slideIn {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}

/* 大屏幕 */
@screen sm {
	.navbar {
		display: flex;
	}

	.navbar-content {
		gap: 1rem;
		display: flex;
	}
}
</style>
