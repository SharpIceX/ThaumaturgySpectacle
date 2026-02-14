<template>
	<footer role="contentinfo" class="footer-container">
		<p>
			<span>Copyright © 2023-2025</span>
			<NuxtLink href="https://github.com/SharpIceX" target="_blank" class="mx-1">锐冰 (SharpIce)</NuxtLink>
			<span>保留所有权利。</span>
		</p>
	</footer>
</template>

<script setup>
defineOptions({ name: 'AppFooter' });
</script>

<style lang="less" scoped>
@import (reference) '$/nord/src/lesscss/nord.less';

.footer-container {
	text-align: center;
	border-top: 1px solid @nord3;
}
</style>
