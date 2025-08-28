<!--
	NOTE: 停用 eslint 的 vue/html-self-closing 规则备注：
	会错误的导致 <input> 标签报错，提示需要自闭合。
-->

<!-- eslint-disable vue/html-self-closing -->

<!--
	TIP: 只能在客户端渲染

	此组件是 Switch 组件的变体，用于在设置页面中显示和存储用户的设置选项。

	组件默认需要传入 defaultState 和 settingID 两个 props：
	- name: 字符串，表示该设置项的名称，将显示在开关旁边。
	- defaultState: 布尔值，表示该设置项的默认状态。
	- settingID: 字符串，表示该设置项在 localStorage 中存储的键名。

	settingsID 在传入后 config 开头会默认的加上 `setting.` 前缀，以避免与其他 localStorage 键名冲突。
-->

<template>
	<input v-model="checkedState" type="checkbox" class="toggle toggle-default" />
</template>

<script lang="ts" setup>
import { toast } from 'vue3-toastify';

defineOptions({ name: 'TSSettingSwitch' });
const properties = defineProps({
	defaultState: {
		type: Boolean,
		required: false,
	},
	settingId: {
		type: String,
		required: true,
	},
});

const checkedState = ref<boolean>(properties.defaultState);
const localStorageKey = `setting.${properties.settingId}`;

// 初始化
onMounted(() => {
	const localConfig = localStorage.getItem(localStorageKey);
	if (localConfig !== null) {
		checkedState.value = JSON.parse(localConfig);
	}

	// 监听状态变化并存储
	watch(checkedState, value => {
		localStorage.setItem(localStorageKey, String(value));
		toast('设置已保存', {
			position: toast.POSITION.TOP_RIGHT,
			type: 'success',
			autoClose: 500,
			transition: 'bounce',
		});
	});
});
</script>
