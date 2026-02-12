<template>
	<div ref="dropdownRef" class="dropdown-container" @keydown.esc="closeDropdown" @focusout="handleFocusOut">
		<div
			class="dropdown-trigger-btn"
			role="button"
			:aria-expanded="isOpen"
			aria-haspopup="menu"
			tabindex="0"
			@click="toggleDropdown"
			@keydown.enter.prevent="toggleDropdown"
			@keydown.space.prevent="toggleDropdown"
			@mouseenter="handleMouseEnter"
			@mouseleave="handleMouseLeave">
			<slot name="trigger" :isOpen="isOpen" />
		</div>

		<transition name="fade">
			<div
				v-show="isOpen"
				class="dropdown-content"
				role="menu"
				@mouseenter="handleMouseEnter"
				@mouseleave="handleMouseLeave">
				<ul class="dropdown-list" @click="handleContentClick">
					<slot name="content" />
				</ul>
			</div>
		</transition>
	</div>
</template>

<script lang="ts" setup>
const emit = defineEmits<{
	(e: 'open'): void;
	(e: 'close'): void;
	(e: 'toggle', visibles: boolean): void;
}>();

const isOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);
let closeTimer: number | null = null;

/** 取消并清除“关闭”定时器 */
const clearCloseTimer = () => {
	if (closeTimer) {
		clearTimeout(closeTimer);
		closeTimer = null;
	}
};

/** 打开/关闭逻辑 */
const setOpen = (visibles: boolean) => {
	if (isOpen.value === visibles) return;
	isOpen.value = visibles;

	if (visibles) {
		emit('open');
	} else {
		emit('close');
	}
	emit('toggle', visibles);
};

const openDropdown = () => setOpen(true);
const closeDropdown = () => setOpen(false);

const toggleDropdown = () => {
	isOpen.value ? closeDropdown() : openDropdown();
};

const handleMouseEnter = () => {
	clearCloseTimer();
	openDropdown();
};

const handleMouseLeave = () => {
	closeTimer = window.setTimeout(() => {
		closeDropdown();
	}, 200);
};

/**
 * 焦点移出组件时关闭
 */
const handleFocusOut = (event: FocusEvent) => {
	const nextFocus = event.relatedTarget as Node | null;
	if (dropdownRef.value && (!nextFocus || !dropdownRef.value.contains(nextFocus))) {
		closeDropdown();
	}
};

const handleContentClick = () => {
	closeDropdown();
};

onBeforeUnmount(() => {
	clearCloseTimer();
});
</script>

<style lang="less" scoped>
@import (reference) '$/nord/src/lesscss/nord.less';

.dropdown-container {
	position: relative;
	display: inline-block;

	.dropdown-trigger-btn {
		gap: 0.25rem;
		display: flex;
		align-items: center;
	}

	.dropdown-arrow {
		display: flex;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
	}

	.dropdown-content {
		top: 100%;
		left: 50%;
		min-width: 100%;
		position: absolute;
		padding-top: 0.5rem;
		transform: translateX(-50%);

		.dropdown-list {
			margin: 0;
			display: flex;
			padding: 0.5rem;
			min-width: 8rem;
			list-style: none;
			width: max-content;
			border-radius: 0.5rem;
			flex-direction: column;
			background-color: @nord1;
			border: 1px solid fade(@nord3, 30%);
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		}
	}
}

/** 动画 */
.fade-enter-active,
.fade-leave-active {
	transition:
		opacity 0.2s ease,
		transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
	opacity: 0;
	transform: translateX(-50%) translateY(-5px);
}
</style>
