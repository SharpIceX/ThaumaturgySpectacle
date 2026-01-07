<template>
	<div ref="rootRef" class="dropdown" @keydown.esc.stop.prevent="close" @focusout="onFocusOut">
		<div
			class="dropdown-trigger"
			role="button"
			:aria-disabled="props.disabled ? 'true' : undefined"
			:aria-expanded="isOpen"
			aria-haspopup="menu"
			:aria-controls="menuId"
			:tabindex="props.disabled ? -1 : 0"
			@click="toggle"
			@keydown.enter.prevent="toggle"
			@keydown.space.prevent="toggle"
			@keydown.arrow-down.prevent="openAndFocusFirst"
			@keydown.arrow-up.prevent="openAndFocusLast"
			@mouseenter="onMouseEnter"
			@mouseleave="onMouseLeave">
			<slot name="trigger" :is-open="isOpen" />
		</div>

		<transition name="dropdown-fade">
			<div
				v-show="isOpen"
				:id="menuId"
				ref="menuRef"
				class="dropdown-menu"
				role="menu"
				tabindex="-1"
				@mouseenter="onMouseEnter"
				@mouseleave="onMouseLeave">
				<div
					class="dropdown-content"
					role="none"
					@click="onContentClick"
					@keydown.arrow-down.prevent="focusNextItem"
					@keydown.arrow-up.prevent="focusPrevItem"
					@keydown.home.prevent="focusFirstItem"
					@keydown.end.prevent="focusLastItem">
					<slot name="content" />
				</div>
			</div>
		</transition>
	</div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = withDefaults(
	defineProps<{
		/** 受控模式下的打开状态；未传则为非受控 */
		modelValue?: boolean;
		/** 是否禁用 */
		disabled?: boolean;
		/** 是否悬停打开 */
		openOnHover?: boolean;
		/** 悬停关闭延迟（ms） */
		hoverCloseDelay?: number;
		/** 点击内容区域是否自动关闭 */
		closeOnContentClick?: boolean;
	}>(),
	{
		modelValue: undefined,
		disabled: false,
		openOnHover: false,
		hoverCloseDelay: 100,
		closeOnContentClick: true,
	},
);

const emit = defineEmits<{
	(e: 'update:modelValue', value: boolean): void;
	(e: 'open'): void;
	(e: 'close'): void;
	(e: 'toggle', value: boolean): void;
}>();

const isControlled = computed(() => props.modelValue !== undefined);
const innerOpen = ref(false);
const isOpen = computed(() => (isControlled.value ? !!props.modelValue : innerOpen.value));

const rootRef = ref<HTMLElement | null>(null);
const menuRef = ref<HTMLElement | null>(null);
const menuId = `dropdown-menu-${useId()}`;

let closeTimer: number | null = null;

const clearCloseTimer = () => {
	if (closeTimer) {
		clearTimeout(closeTimer);
		closeTimer = null;
	}
};

const setOpen = (value: boolean) => {
	if (props.disabled) return;
	if (isOpen.value === value) return;

	if (!isControlled.value) innerOpen.value = value;
	emit('update:modelValue', value);

	if (value) {
		emit('open');
	} else {
		emit('close');
	}

	emit('toggle', value);
};

const open = () => setOpen(true);
const close = () => setOpen(false);
const toggle = () => (isOpen.value ? close() : open());

const onMouseEnter = () => {
	if (!props.openOnHover) return;
	clearCloseTimer();
	open();
};

const onMouseLeave = () => {
	if (!props.openOnHover) return;
	clearCloseTimer();
	closeTimer = setTimeout(() => {
		close();
	}, props.hoverCloseDelay) as unknown as number;
};

const onFocusOut = (event: FocusEvent) => {
	if (!import.meta.client) return;

	const next = event.relatedTarget as Node | null;
	if (rootRef.value && (!next || !rootRef.value.contains(next))) close();
};

const onContentClick = () => {
	if (props.closeOnContentClick) close();
};

const getMenuItems = () => {
	if (!menuRef.value) return [];
	return Array.from(
		menuRef.value.querySelectorAll<HTMLElement>(
			'[role="menuitem"],[role="menuitemradio"],[role="menuitemcheckbox"]',
		),
	).filter((el) => {
		const ariaDisabled = el.getAttribute('aria-disabled');
		return !el.hasAttribute('disabled') && ariaDisabled !== 'true';
	});
};

const focusItemAt = (index: number) => {
	const items = getMenuItems();
	if (!items.length) return;
	const target = items[Math.max(0, Math.min(index, items.length - 1))];
	target?.focus();
};

const focusFirstItem = () => focusItemAt(0);
const focusLastItem = () => {
	const items = getMenuItems();
	focusItemAt(items.length - 1);
};

const focusNextItem = () => {
	if (!import.meta.client) return;

	const items = getMenuItems();
	const active = document.activeElement;
	const index = items.findIndex((el) => el === active);
	focusItemAt(index + 1);
};

const focusPrevItem = () => {
	if (!import.meta.client) return;

	const items = getMenuItems();
	const active = document.activeElement;
	const index = items.findIndex((el) => el === active);
	focusItemAt(index - 1);
};

const openAndFocusFirst = async () => {
	open();
	await nextTick();
	focusFirstItem();
};

const openAndFocusLast = async () => {
	open();
	await nextTick();
	focusLastItem();
};

const onDocumentClick = (event: MouseEvent) => {
	if (!rootRef.value) return;
	const target = event.target as Node | null;
	if (target && !rootRef.value.contains(target)) close();
};

watch(isOpen, async (value) => {
	if (value) {
		await nextTick();
		menuRef.value?.focus?.();
	}
});

onMounted(() => {
	document.addEventListener('click', onDocumentClick);
});

onBeforeUnmount(() => {
	document.removeEventListener('click', onDocumentClick);
	clearCloseTimer();
});
</script>

<style lang="less" scoped>
@import (reference) '$/nord/src/lesscss/nord.less';

.dropdown {
	position: relative;
	display: inline-flex;

	.dropdown-trigger {
		gap: 0.25rem;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		user-select: none;
	}

	.dropdown-menu {
		top: 100%;
		left: 100%;
		z-index: 1;
		outline: none;
		min-width: 100%;
		position: absolute;
		transform: translateX(-50%);
	}

	.dropdown-content {
		border-radius: 12px;
		background-color: @nord3;
		box-shadow: 2px 8px 12px fade(@nord13, 30%);
	}
}

.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
	transition:
		opacity 0.16s ease,
		transform 0.16s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
	opacity: 0;
	transform: translateX(-50%) translateY(-6px);
}
</style>
