<template>
	<div class="h-full flex flex-row gap-10 justify-center max-md:flex-col-reverse max-md:items-center">
		<div class="w-[60%] max-md:w-[90%] bg-nord1 p-8 rounded-lg">
			<div class="wiki-content">
				<slot name="content" />
			</div>
		</div>

		<!-- TOC 部分只有在有内容时显示 -->
		<div v-if="$slots['toc']" class="w-84 max-md:w-[90%]">
			<div class="bg-nord1 rounded-lg p-6">
				<h1 class="text-xl">目录</h1>
				<div class="toc-content">
					<slot name="toc" />
				</div>
			</div>
		</div>
	</div>
</template>
