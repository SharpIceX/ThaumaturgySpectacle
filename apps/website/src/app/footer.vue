<template>
	<footer role="contentinfo" class="footer-container">
		<p>
			<span>Copyright © 2023-2026</span>
			<a href="https://github.com/SharpIceX" target="_blank" rel="noopener noreferrer">锐冰 (SharpIce)</a>
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
		padding-inline: 0.2rem;

		&:hover {
			text-decoration: underline;
		}
	}

	// 大屏幕
	@media (min-width: 768px) {
		p {
			column-gap: 0.25rem;
			flex-direction: row;
			display: inline-flex;
			justify-content: center;
		}

		br {
			display: none;
		}
	}
}
</style>
