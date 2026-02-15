<template>
	<ul class="wiki-link-grid" role="list">
		<li v-for="item in data" :key="item.url" role="listitem">
			<NuxtLink :to="item.url" :title="item.name">
				<span class="symbol" aria-hidden="true">#</span>
				<span class="text">{{ item.name }}</span>
			</NuxtLink>
		</li>
	</ul>
</template>

<script lang="ts" setup>
interface WikiRouteItem {
	url: string;
	name: string;
}

defineProps<{
	data: WikiRouteItem[];
}>();
</script>

<style lang="less" scoped>
@import (reference) '$/nord/src/lesscss/nord.less';

.wiki-link-grid {
	gap: 16px;
	display: grid;
	padding: 24px 0;
	list-style: none;
	grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));

	@media (max-width: 640px) {
		gap: 10px;
		grid-template-columns: repeat(2, 1fr);
	}

	li {
		min-width: 0;

		a {
			display: flex;
			color: @nord13;
			position: relative;
			padding: 12px 14px;
			align-items: center;
			text-decoration: none;
			background: rgba(235, 203, 139, 0.02);
			border: 1px solid rgba(235, 203, 139, 0.15);
			transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

			&::after {
				top: -1px;
				content: '';
				right: -1px;
				width: 10px;
				height: 10px;
				position: absolute;
				transition: all 0.25s ease;
				border-top: 2px solid @nord10;
				border-right: 2px solid @nord10;
			}

			.symbol {
				opacity: 0.5;
				line-height: 1;
				font-weight: 800;
				margin-right: 8px;
				transform: translateY(-1px);
				font-family: ui-monospace, monospace;
			}

			.text {
				flex: 1;
				font-size: 14px;
				font-weight: 600;
				overflow: hidden;
				white-space: nowrap;
				text-overflow: ellipsis;
			}

			&:hover {
				background: rgba(235, 203, 139, 0.06);
				border-color: rgba(235, 203, 139, 0.4);

				&::after {
					width: 20px;
					height: 20px;
					border-top-width: 3px;
					border-right-width: 3px;
				}

				.symbol {
					opacity: 1;
					color: @nord10;
				}
			}
		}
	}
}
</style>
