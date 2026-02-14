<template>
	<header>
		<nav class="navbar" aria-label="主导航">
			<AppHeaderListItem :data="headerConfig.left" />
			<p class="logo" aria-hidden="true">幻术奇象</p>
			<AppHeaderListItem :data="headerConfig.right" />
		</nav>
	</header>
</template>

<script lang="ts" setup>
import headerConfig from './config';
import AppHeaderListItem from './header.-list-item.vue';

defineOptions({ name: 'AppHeader' });
</script>

<style lang="less" scoped>
@import (reference) '$/nord/src/lesscss/nord.less';

.navbar {
	display: flex;
	font-size: 1.1em;
	column-gap: 0.5rem;
	align-items: center;
	justify-content: center;

	.logo {
		font-size: 1.1em;
	}
}
</style>
