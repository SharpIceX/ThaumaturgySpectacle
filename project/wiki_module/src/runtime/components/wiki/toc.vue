<template>
	<div class="toc-container">
		<h1>目录</h1>
		<nav ref="tocContent" role="navigation" class="toc-content">
			<slot />
		</nav>
	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { OverlayScrollbars } from 'overlayscrollbars';

defineOptions({ name: 'WikiToc' });

const tocContent = ref<HTMLElement>();
let osInstance: OverlayScrollbars | undefined;

onMounted(() => {
	if (tocContent.value) {
		osInstance = OverlayScrollbars(tocContent.value, {
			scrollbars: {
				autoHideDelay: 300,
				autoHide: 'scroll',
				autoHideSuspend: true,
				theme: 'os-theme-nord',
			},
		});
	}
});

onUnmounted(() => {
	if (osInstance) {
		osInstance.destroy();
	}
});
</script>

<style lang="less" scoped>
@import (reference) '$/nord/src/lesscss/nord.less';

.toc-container {
	top: 1rem;
	gap: 0.75rem;
	color: @nord4;
	display: flex;
	position: sticky;
	padding: 1.25rem;
	max-height: 40vh;
	border-radius: 12px;
	flex-direction: column;
	background-color: @nord1;

	h1 {
		color: @nord6;
		font-weight: 700;
		font-size: 1.35rem;
		letter-spacing: 0.02em;
	}

	:deep(.toc-content) {
		overflow-y: auto;
		padding-right: 6px;

		/* 顶层计数器 */
		ol {
			counter-reset: toc-section;
		}

		li {
			display: grid;
			column-gap: 0.6rem;
			align-items: start;
			margin-block: 0.35rem;
			counter-increment: toc-section;
			grid-template-columns: 2.2rem 1fr;

			&::before {
				color: @nord9;
				font-size: 1.2rem;
				font-weight: 600;
				line-height: 1.6;
				text-align: right;
				min-width: 2.2rem;
				padding-top: 0.05rem;
				content: counters(toc-section, '.');
			}

			a {
				color: @nord4;
				line-height: 1.6;
				font-size: 0.95rem;
				transition:
					color 0.2s ease,
					opacity 0.2s ease;

				&:hover {
					color: @nord8;
				}
			}

			/* 子列表 */
			ol {
				grid-column: 2 / -1;
				padding-left: 0.9rem;
				margin: 0.25rem 0 0.35rem;
				border-left: 1px solid @nord3;

				li {
					margin: 0.25rem 0;
				}
			}
		}
	}
}
</style>
