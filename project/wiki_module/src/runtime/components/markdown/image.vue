<template>
	<figure
		ref="containerReference"
		class="image-container"
		:data-position="left ? 'left' : right ? 'right' : 'center'"
		:style="status === 'loaded' ? { 'shape-outside': `url(${source})` } : {}">
		<!-- 加载完成 -->
		<img v-if="status === 'loaded'" :src="source" :title="title" />

		<!-- 加载中 -->
		<div v-else-if="status === 'loading'" class="loader" role="status" aria-busy="true" aria-label="加载中"></div>

		<!-- 加载错误 -->
		<div v-else-if="status === 'error'" role="alert">
			<p>图片加载失败</p>
		</div>

		<!-- 加载超时 -->
		<div v-else-if="status === 'timeout'" role="alert">
			<p>图片加载超时</p>
		</div>

		<figcaption v-if="title">
			{{ properties.title }}
		</figcaption>
	</figure>
</template>

<script lang="ts" setup>
import preloadImage from '@ts/utils/src/web/preload-image';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

defineOptions({
	name: 'MarkdownImage',
});

const properties = withDefaults(
	defineProps<{
		title: string;
		source: string;
		left?: boolean;
		right?: boolean;
		scale?: number;
	}>(),
	{
		scale: 1,
	},
);

const status = ref<'loading' | 'loaded' | 'error' | 'timeout'>('loading');
const containerReference = ref<HTMLElement>();
const site = computed(() => 200 * properties.scale);

let observer: IntersectionObserver | undefined;
let isUnmounted = false;

const loadImage = async () => {
	// 判断两次 isUnmounted 防止内存泄露
	if (isUnmounted) return;
	const result = await preloadImage(properties.source);
	if (isUnmounted) return;

	if (result === true) {
		status.value = 'loaded';
	} else if (result === false) {
		status.value = 'error';
	} else {
		status.value = 'timeout';
	}
};

onMounted(() => {
	if (!containerReference.value) return;

	observer = new IntersectionObserver(
		([entry]) => {
			if (entry?.isIntersecting) {
				loadImage();
				if (containerReference.value) {
					observer?.unobserve(containerReference.value);
				}
			}
		},
		{
			threshold: 0.01,
			rootMargin: '200px 0px',
		},
	);

	observer.observe(containerReference.value);
});

onBeforeUnmount(() => {
	isUnmounted = true;
	if (observer) {
		observer.disconnect();
		observer = undefined;
	}
});
</script>

<style lang="less" scoped>
@import (reference) '$/nord/src/lesscss/nord.less';

.loader {
	width: 60%;
	height: auto;
	flex-shrink: 0;
	position: relative;
	aspect-ratio: 1 / 1;

	&::after {
		content: '';
		width: 100%;
		height: 100%;
		position: absolute;
		border-radius: 50%;
		box-sizing: border-box;
		animation: image-loader-rotate 1s linear infinite;

		border: calc(v-bind("site + 'px'") / 40) solid @nord9;
		border-top-color: transparent;

		@keyframes image-loader-rotate {
			to {
				transform: rotate(360deg);
			}
		}
	}

	&::before {
		top: 50%;
		left: 50%;
		color: @nord9;
		content: '加载中';
		position: absolute;
		transform: translate(-50%, -50%);
		font-size: calc(v-bind("site + 'px'") / 13);
	}
}

.image-container {
	display: flex;
	margin-bottom: 1em;
	align-items: center;
	flex-direction: column;
	justify-content: center;
	width: v-bind("site + 'px'");
	min-height: v-bind("site + 'px'");

	&[data-position='center'] {
		margin-left: auto;
		margin-right: auto;
	}

	&[data-position='left'],
	&[data-position='right'] {
		shape-margin: 12px;
		shape-image-threshold: 0.3;
	}

	&[data-position='left'] {
		float: left;
		margin-right: 1em;
	}

	&[data-position='right'] {
		float: right;
		margin-left: 1em;
	}

	img {
		height: 100%;
		object-fit: contain;
	}

	figcaption {
		margin-top: 0.5em;
		font-size: 0.875rem;
		text-align: center;
		line-height: 1.4;
	}
}
</style>
