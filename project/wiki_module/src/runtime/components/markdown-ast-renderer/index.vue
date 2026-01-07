<template>
	<template v-for="(node, index) in nodes" :key="index">
		<template v-if="node.type === 'text'">
			{{ node.value }}
		</template>

		<p v-else-if="node.type === 'paragraph'">
			<MarkdownAstRenderer :ast="node" />
		</p>

		<component v-else-if="node.type === 'heading'" :is="`h${node.depth}`">
			<MarkdownAstRenderer :ast="node" />
		</component>

		<strong v-else-if="node.type === 'strong'">
			<MarkdownAstRenderer :ast="node" />
		</strong>

		<pre>
			<code>
				{{ ast }}
			</code>
		</pre>
	</template>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import type { Root, RootContent } from 'mdast';

defineOptions({
	name: 'MarkdownAstRenderer',
});

const props = defineProps<{
	// 接受 Root 或者任何一种 RootContent
	ast: Root | RootContent;
}>();

// 统一提取 children，方便 template 遍历
const nodes = computed(() => {
	if ('children' in props.ast) {
		return props.ast.children;
	}
	return [];
});
</script>
