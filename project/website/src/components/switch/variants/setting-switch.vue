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
	<div class="setting-item">
		<Switch v-model="checkedState">
			<template #on>开</template>
			<template #off>关</template>
		</Switch>
		<p>{{ props.name }}</p>
	</div>
</template>

<script lang="ts" setup>
import Switch from '../switch.vue';
import { toast } from 'vue3-toastify';

defineOptions({ name: 'TSSettingSwitch' });
const props = defineProps({
	name: {
		type: String,
		required: true,
	},
	defaultState: {
		type: Boolean,
		required: false,
	},
	settingID: {
		type: String,
		required: true,
	},
});

const checkedState = ref<boolean>(props.defaultState);

// 初始化
onMounted(() => {
	const localConfig = localStorage.getItem(`setting.${props.settingID}`);
	if (localConfig !== null) {
		checkedState.value = JSON.parse(localConfig);
	}

	// 监听状态变化并存储
	watch(checkedState, val => {
		localStorage.setItem(`setting.${props.settingID}`, String(val));
		toast('设置已重置', {
			position: toast.POSITION.TOP_RIGHT,
			type: 'success',
			autoClose: 800,
			transition: 'bounce',
		});
	});
});
</script>

<style lang="less" scoped>
.setting-item {
	display: flex;
}
</style>
