<template>
	<div class="h-full flex flex-row justify-center space-x-4xl">
		<div class="w-[60%] bg-nord1 p-8 rounded-lg">
			<div class="wiki-content">
				<slot name="content" />
			</div>
		</div>

		<!-- TOC 部分只有在有内容时显示 -->
		<div v-if="$slots['toc']" class="w-[18%]">
			<div class="bg-nord1 rounded-lg p-6 sticky">
				<h1 class="text-xl">目录</h1>
				<div class="toc-content">
					<slot name="toc" />
				</div>
			</div>
		</div>
	</div>
</template>
