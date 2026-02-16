<template>
	<footer role="contentinfo" class="footer-container">
		<p>
			<span>Copyright © 2023-2026</span>
			<NuxtLink href="https://github.com/SharpIceX" target="_blank">锐冰 (SharpIce)</NuxtLink>
			<br />
			<span>All rights reserved. 保留所有权利。</span>
		</p>
	</footer>
</template>

<script setup>
defineOptions({ name: 'AppFooter' });
</script>

<style lang="less" scoped>
@import (reference) '$/nord/src/lesscss/nord.less';

.footer-container {
	color: @nord4;
	text-align: center;
	padding-block: 0.8rem;
	border-top: 1px solid @nord3;

	p {
		margin: 0;
	}

	a {
		color: @nord8;
		margin-left: 0.4em;

		&:hover {
			text-decoration: underline;
		}
	}
}
</style>
