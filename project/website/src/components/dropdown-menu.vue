<template>
	<div class="dropdown">
		<div class="dropdown-trigger-off">
			<slot name="trigger-off" />
		</div>
		<div class="dropdown-trigger-on">
			<slot name="trigger-on" />
		</div>
		<div class="dropdown-menu" role="menu" @click="blurActiveElement" @mouseleave="blurActiveElement">
			<ul>
				<slot name="content" />
			</ul>
		</div>
	</div>
</template>

<script lang="ts" setup>
/**
 * 使当前活动元素失去焦点（blur），如果可能的话。
 */
function blurActiveElement() {
	if (import.meta.browser) {
		(document.activeElement as HTMLElement).blur();
	}
}
</script>

<style lang="less" scoped>
@import url('nord/src/lesscss/nord.less');

.dropdown {
	position: relative;

	// 默认状态
	.dropdown-menu {
		padding: 0.5rem 1rem;
		position: absolute;

		ul {
			width: 10rem;
			display: none;
			padding: 0.5rem;
			border-radius: 0.5rem;
			flex-direction: column;
			background-color: fade(@nord2, 30%);

			:deep(a) {
				padding: 0.5rem 1rem;
				border-radius: 0.3rem;

				&:hover {
					background-color: fade(@nord3, 50%);
				}
			}
		}
	}
	.dropdown-trigger-on {
		display: none;
	}

	// 焦点或悬停状态
	&:focus-within,
	&:hover {
		.dropdown-menu {
			ul {
				display: flex;
				animation: fadeIn 0.3s ease-in-out;
			}
		}
		.dropdown-trigger-off {
			display: none;
		}
		.dropdown-trigger-on {
			display: block;
		}
	}
}
</style>
