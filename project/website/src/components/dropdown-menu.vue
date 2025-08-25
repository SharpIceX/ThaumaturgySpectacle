<template>
	<div tabindex="0" class="dropdown">
		<div class="dropdown-trigger">
			<slot name="trigger" />
		</div>
		<div class="dropdown-trigger-off">
			<slot name="trigger-off" />
		</div>
		<div class="dropdown-trigger-on">
			<slot name="trigger-on" />
		</div>
		<div class="dropdown-content" role="menu" @click="blurActiveElement" @mouseleave="blurActiveElement">
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
	display: flex;
	position: relative;

	.dropdown-content {
		top: 100%;
		position: absolute;
		padding: 0.5rem 1rem;

		ul {
			width: 10rem;
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

	// 默认状态
	&:not(:focus-within) {
		.dropdown-content {
			ul {
				display: none;
			}
		}

		.dropdown-trigger-on {
			display: none;
		}
	}

	// 焦点或悬停状态
	&:focus-within,
	&:hover {
		.dropdown-content {
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
