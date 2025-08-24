<template>
	<NuxtLayout name="wiki-content">
		<template #content>
			<div class="title">
				<h1>设置</h1>
			</div>
			<div class="content">
				<client-only class="custom setting">
					<div v-for="item in settingItems" :key="item.settingID" class="setting-item">
						<settingSwitch
							:name="item.name"
							:defaultState="item.defaultState"
							:settingID="item.settingID" />
					</div>
				</client-only>
			</div>
		</template>
	</NuxtLayout>
</template>

<script lang="ts" setup>
import settingSwitch from '@/components/switch/variants/setting-switch.vue';

type settingItemsType = {
	name: string;
	settingID: string;
	defaultState: boolean;
}[];

defineOptions({ name: 'SettingsPage' });
definePageMeta({
	title: '设置',
});

const settingItems: settingItemsType = [
	{
		name: '启用 Pangu',
		settingID: 'pangu.enable',
		defaultState: false,
	},
];
</script>

<style lang="less" scoped>
.custom.setting {
	//
}
</style>
