<template>
	<div class="dropdown">
		<div class="dropdown-trigger">
			<slot name="trigger"></slot>
		</div>
		<div class="dropdown-menu" role="menu" @click="blurActiveElement" @mouseleave="blurActiveElement">
			<ul>
				<slot name="content"></slot>
			</ul>
		</div>
	</div>
</template>

<script setup>
// TODO: 鼠标点击trigger后，直接绕开content移动到外面不会触发mouseleave事件
function blurActiveElement() {
	const el = document.activeElement;
	if (el && el !== document.body && typeof el.blur === 'function') {
		el.blur();
	}
}
</script>

<style lang="less" scoped>
@import url('nord/src/lesscss/nord.less');

.dropdown {
	position: relative;

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

	&:focus-within,
	&:hover {
		.dropdown-menu {
			ul {
				display: flex;

				@keyframes fadeIn {
					from {
						opacity: 0;
					}
					to {
						opacity: 1;
					}
				}
				animation: fadeIn 0.3s ease-in-out;
			}
		}
	}
}
</style>
