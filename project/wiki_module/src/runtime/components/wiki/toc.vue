<template>
	<div class="toc-container">
		<h1>目录</h1>
		<slot />
	</div>
</template>

<script lang="ts" setup>
defineOptions({ name: 'WikiToc' });
</script>

<style lang="less" scoped>
@import (reference) '$/nord/src/lesscss/nord.less';

.toc-container {
	top: 1.5rem;
	width: 100%;
	padding: 1rem;
	overflow: auto;
	max-height: 60vh;
	position: sticky;
	background-color: @nord1;

	@media (max-width: 768px) {
		width: 100%;
	}

	h1 {
		margin-bottom: 1rem;
		font-size: 1.25rem;
		color: @nord6;
	}

	:deep(.toc-content) {
		list-style: none;
		counter-reset: item;
		padding-left: 1.2rem;
		margin: 0;

		/* 横向不换行，超出可左右滚动 */
		white-space: nowrap;
		min-width: max-content;

		li {
			counter-increment: item;
			margin: 0.4rem 0;
			line-height: 1.5;

			&::before {
				content: counters(item, '.') ' ';
				color: @nord4;
				font-family: monospace;
				font-size: 0.85em;
				margin-right: 0.5em;
				opacity: 0.6;
			}

			a {
				color: @nord4;
				text-decoration: none;
				transition: all 0.2s;
				white-space: nowrap;

				&:hover {
					color: @nord8;
				}

				&.select-toc {
					background-color: @nord8;
					color: @nord0;
					font-weight: 600;
					padding: 2px 8px;
					border-radius: 4px;
					display: inline-block;
				}
			}

			ol {
				margin-top: 0.2rem;
				padding-left: 1rem;
				list-style: none;
				counter-reset: item;
				white-space: nowrap;
			}
		}
	}
}
</style>
