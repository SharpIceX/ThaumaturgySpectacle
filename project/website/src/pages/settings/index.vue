<template>
	<NuxtLayout name="wiki-container">
		<template #default>
			<div class="setting">
				<div v-for="item in settingItems" :key="item.settingID" class="setting-item">
					<settingSwitch :default-state="item.defaultState" :setting-id="item.settingID" />
					<p>{{ item.name }}</p>
					<div v-if="item.description" :title="item.description">
						<InfoIcon class="w-4 h-4" />
					</div>
				</div>
			</div>
		</template>
	</NuxtLayout>
</template>

<script lang="ts" setup>
import settingSwitch from '~/components/utils/setting-toggle.vue';
import InfoIcon from '@material-design-icons/svg/outlined/info.svg';

type settingItemsType = {
	name: string;
	description?: string;
	settingID: string;
	defaultState: boolean;
}[];

defineOptions({ name: 'SettingsPage' });
definePageMeta({
	title: '设置',
});

const settingItems: settingItemsType = [
	{
		name: '可视化目录',
		description: '滚动页面时，自动高亮当前章节，并将 URL 更新为当前章节的锚点',
		settingID: 'toc.scroll_toc_visible.enable',
		defaultState: true,
	},
];
</script>

<style lang="less" scoped>
.setting {
	@apply gap-y-xl;
	display: flex;
	flex-direction: column;

	.setting-item {
		display: flex;
		align-items: center;

		/* 重置来自 Markdown 的样式 */
		p {
			margin: unset;
			margin-left: 1rem;
			margin-right: 0.5rem;
		}
	}
}
</style>
