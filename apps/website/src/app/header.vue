<template>
	<header>
		<nav class="navbar" aria-label="主导航">
			<div class="navbar-inner">
				<ul class="nav-group">
					<li v-for="item in menuItems.left" :key="item.to">
						<NuxtLink :to="item.to" :aria-label="item.label" class="nav-link-item">
							<component :is="item.icon" class="nav-icon" aria-hidden="true" />
							<span class="nav-text">{{ item.label }}</span>
						</NuxtLink>
					</li>

					<li>
						<DropdownMenu>
							<template #trigger="{ isOpen }">
								<div class="nav-link-content">
									<DescriptionIcon class="nav-icon" aria-hidden="true" />
									<span class="nav-text">百科</span>
									<component
										:is="isOpen ? ArrowDropDownIcon : ArrowRightIcon"
										class="arrow-icon"
										aria-hidden="true" />
								</div>
							</template>

							<template #content>
								<li v-for="sub in wikiSubItems" :key="sub.to">
									<NuxtLink :to="sub.to" class="dropdown-item">
										<component :is="sub.icon" class="nav-icon small" aria-hidden="true" />
										<span class="dropdown-text">{{ sub.label }}</span>
									</NuxtLink>
								</li>
							</template>
						</DropdownMenu>
					</li>
				</ul>

				<div class="brand-center" aria-hidden="true">
					<span class="brand-text">&lt;幻术奇象&gt;</span>
				</div>

				<ul class="nav-group right-group">
					<li v-for="item in menuItems.right" :key="item.to">
						<NuxtLink :to="item.to" :aria-label="item.label" class="nav-link-item">
							<component :is="item.icon" class="nav-icon" aria-hidden="true" />
							<span class="nav-text">{{ item.label }}</span>
						</NuxtLink>
					</li>
				</ul>
			</div>
		</nav>
	</header>
</template>

<script lang="ts" setup>
import DropdownMenu from '~/components/base/dropdown-menu.vue';
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

const wikiSubItems = [
	{ to: '/wiki', label: '百科首页', icon: DescriptionIcon },
	{ to: '/特殊页面/所有页面', label: '所有页面', icon: AllInclusiveIcon },
	{ to: '/分类', label: '分类', icon: FavoriteBorderIcon },
];
</script>

<style lang="less" scoped>
@import (reference) '$/nord/src/lesscss/nord.less';

.navbar {
	display: flex;
	padding: 0.5rem 1rem;
	justify-content: center;

	.navbar-inner {
		gap: 1.5rem;
		display: flex;
		align-items: center;

		ul {
			display: flex;
		}
	}

	.nav-link-item,
	.nav-link-content {
		gap: 0.4rem;
		color: @nord4;
		display: flex;
		align-items: center;
		white-space: nowrap;
		border-radius: 0.5rem;
		padding: 0.5rem 0.75rem;
		transition: all 0.2s ease;

		&:hover {
			color: @nord8;
			background-color: fade(@nord3, 40%);
		}
	}

	.nav-icon {
		width: 1.25rem;
		height: 1.25rem;

		&.small {
			width: 1.1rem;
			height: 1.1rem;
		}
	}
}

.arrow-icon {
	width: 1.25rem;
	height: 1.25rem;
}

.brand-center {
	color: @nord8;
	user-select: none;
	font-weight: bold;
}

.dropdown-item {
	width: 100%;
	gap: 0.75rem;
	color: @nord4;
	display: flex;
	align-items: center;
	flex-direction: row;
	padding: 0.6rem 1rem;
	text-decoration: none;
	border-radius: 0.25rem;
	transition: background-color 0.2s;

	&:hover {
		color: @nord8;
		background-color: fade(@nord3, 50%);
	}
}

/** 平板 */
@media (max-width: 768px) {
	.navbar .nav-text {
		display: none;
	}

	.navbar-inner {
		gap: 1rem;
	}

	.brand-center {
		font-size: 0.9rem;
	}
}

/** 小屏幕 */
@media (max-width: 480px) {
	.brand-center {
		display: none;
	}

	.navbar-inner {
		gap: 0.5rem;
		justify-content: space-around;
	}
}
</style>
