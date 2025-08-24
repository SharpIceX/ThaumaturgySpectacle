<!-- NOTE: 禁用此 ESLint 规则备注：此规则会导致 input 无法正常闭合 -->
<!-- eslint-disable vue/html-self-closing -->

<!--
	此组件是一个自定义的开关组件，基于 checkbox 实现。

	组件默认需要传入 on 和 off 插槽来定义开关状态显示的内容
-->

<template>
	<label tabindex="0" :aria-label="props.ariaLabel" class="switch">
		<input
			type="checkbox"
			:checked="props.modelValue"
			@change="handleChange"
			class="switch-input"
			role="switch"
			:aria-checked="props.modelValue" />
		<div class="switch-on">
			<slot name="on" />
		</div>
		<div class="switch-off">
			<slot name="off" />
		</div>
	</label>
</template>

<script lang="ts" setup>
const props = defineProps({
	modelValue: {
		type: Boolean,
		required: true,
	},
	ariaLabel: {
		type: String,
		default: 'Toggle Switch',
	},
});

const emit = defineEmits(['update:modelValue']);

const handleChange = (event: Event) => {
	emit('update:modelValue', (event.target as HTMLInputElement).checked);
};
</script>

<style lang="less" scoped>
.switch {
	display: inline-flex;

	input[type='checkbox'] {
		display: none;

		// 默认状态
		&:checked + .switch-on {
			display: inline-block;
		}

		// 打开状态
		&:not(:checked) + .switch-on {
			display: none;
		}

		// 关闭状态
		&:checked + .switch-on + .switch-off {
			display: none;
		}
	}
}
</style>
