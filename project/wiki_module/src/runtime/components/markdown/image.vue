<template>
	<div
		ref="containerReference"
		class="image-container"
		:class="{
			'image-left': left,
			'image-right': right,
			'image-center': !left && !right,
		}"
		,
		:style="
			status === 'loaded'
				? {
						'shape-outside': `url(${source})`,
					}
				: {}
		">
		<!-- 加载完成 -->
		<img v-if="status === 'loaded'" :src="source" :title="title" :alt="title" class="h-auto w-full object-cover" />

		<!-- 加载中 -->
		<div v-else-if="status === 'loading'" class="loader" role="status" aria-label="图片加载中"></div>

		<!-- 错误 -->
		<div v-else-if="status === 'error'" class="error-state" role="alert">
			<p>图片加载失败</p>
		</div>

		<!-- 超时 -->
		<div v-else-if="status === 'timeout'" class="timeout-state" role="alert">
			<p>连接超时，请检查网络</p>
		</div>
	</div>
</template>

<script lang="ts" setup>
import preloadImage from '@ts/utils/src/web/preload-image';

defineOptions({
	name: 'Image',
});

const props = defineProps<{
	source: Promise<{ default: string }>;
	title?: string;

	left?: boolean;
	right?: boolean;
	scale?: number;
}>();

const status = ref<'loading' | 'loaded' | 'error' | 'timeout'>('loading');

/** 图片地址 */
const source = (await props.source).default;

/** 图片容器大小 */
const BASE_SIZE = 200;
const site = computed(() => {
	return props.scale ? BASE_SIZE * props.scale : BASE_SIZE;
});

const containerReference = ref<HTMLElement>();
let observer: IntersectionObserver | undefined;

const loadImage = async () => {
	console.log('进入视口，准备加载:', source);
	const result = await preloadImage(source);

	if (result === true) {
		status.value = 'loaded';
		console.log('图片加载完成:', source);
	} else if (result === false) {
		status.value = 'error';
		console.log('图片加载错误:', source);
	} else if (typeof result === 'undefined') {
		status.value = 'timeout';
		console.log('图片加载超时:', source);
	}
};

onMounted(() => {
	if (!containerReference.value) return;
	requestIdleCallback?.(() => {
		observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						loadImage();
						if (containerReference.value) observer?.unobserve(containerReference.value);
					}
				}
			},
			{
				threshold: 0.1,
				rootMargin: '200px 0px',
			},
		);
		observer!.observe(containerReference.value as HTMLElement);
		console.log('开始监听懒加载图片:', source);
	});
});

onBeforeUnmount(() => {
	if (observer) {
		observer.disconnect();
		console.log('取消监听:', source);
		observer = undefined;
	}
});
</script>

<style lang="less" scoped>
@import (reference) '$/nord/src/lesscss/nord.less';

.loader {
	width: 90%;
	height: 90%;
	position: relative;

	&::after {
		content: '';
		width: 100%;
		height: 100%;
		position: absolute;
		border-radius: 50%;
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
		font-size: calc(v-bind("site + 'px'") / 10);
	}
}

.image-container {
	display: flex;
	margin-bottom: 1em;
	align-items: center;
	justify-content: center;
	width: v-bind("site + 'px'");
	height: v-bind("site + 'px'");

	img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
}

/** 默认无环绕 */
.image-center {
	margin: 0 auto;
}

.image-left,
.image-right {
	shape-margin: 12px;
	shape-image-threshold: 0.5;
}

/** 左环绕 */
.image-left {
	float: left;
}

/** 右环绕 */
.image-right {
	float: right;
}
</style>
