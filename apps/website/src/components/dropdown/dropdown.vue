<template>
	<div ref="rootRef" class="dropdown" @keydown.esc.stop.prevent="close" @focusout="onFocusOut">
		<div
			ref="triggerRef"
			class="dropdown-trigger"
			role="button"
			:aria-expanded="isOpen"
			aria-haspopup="menu"
			:aria-controls="menuId"
			tabindex="0"
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
				@mouseenter="onMouseEnter"
				@mouseleave="onMouseLeave">
				<ul
					class="dropdown-list"
					role="none"
					@click="onContentClick"
					@keydown.arrow-down.prevent="focusNextItem"
					@keydown.arrow-up.prevent="focusPrevItem"
					@keydown.home.prevent="focusFirstItem"
					@keydown.end.prevent="focusLastItem">
					<slot name="content" />
				</ul>
			</div>
		</transition>
	</div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = withDefaults(
	defineProps<{
		modelValue?: boolean;
		disabled?: boolean;
		openOnHover?: boolean;
		hoverCloseDelay?: number;
	}>(),
	{
		modelValue: undefined,
		disabled: false,
		openOnHover: false,
		hoverCloseDelay: 200,
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
const triggerRef = ref<HTMLElement | null>(null);
const menuRef = ref<HTMLElement | null>(null);
const menuId = `dropdown-menu-${Math.random().toString(36).slice(2)}`;

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
	closeTimer = window.setTimeout(() => {
		close();
	}, props.hoverCloseDelay);
};

const onFocusOut = (event: FocusEvent) => {
	const next = event.relatedTarget as Node | null;
	if (rootRef.value && (!next || !rootRef.value.contains(next))) close();
};

const onContentClick = () => close();

const getMenuItems = () => {
	if (!menuRef.value) return [];
	return Array.from(
		menuRef.value.querySelectorAll<HTMLElement>(
			'[role="menuitem"],[role="menuitemradio"],[role="menuitemcheckbox"]',
		),
	).filter((el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-disabled'));
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
	const items = getMenuItems();
	const active = document.activeElement;
	const index = items.findIndex((el) => el === active);
	focusItemAt(index + 1);
};

const focusPrevItem = () => {
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
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		cursor: pointer;
		user-select: none;
	}

	.dropdown-menu {
		top: 100%;
		left: 50%;
		min-width: 100%;
		position: absolute;
		padding-top: 0.5rem;
		transform: translateX(-50%);
		outline: none;
	}

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

		> * + * {
			margin-top: 0.25rem;
		}
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
