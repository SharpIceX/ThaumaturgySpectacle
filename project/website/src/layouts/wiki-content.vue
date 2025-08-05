<template>
	<div class="h-full flex flex-row justify-center space-x-4xl">
		<div class="w-[60%] bg-nord1 p-8 rounded-lg">
			<div class="wiki-content">
				<slot name="content" />
			</div>
		</div>
		<div class="w-[15%]">
			<div class="bg-nord1 rounded-lg p-6 sticky">
				<div class="max-h-[25rem] overflow-y-auto">
					<slot name="toc" />
				</div>
			</div>
		</div>
	</div>
</template>
