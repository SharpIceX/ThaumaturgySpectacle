import path from 'node:path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ command }) => {
	if (command === 'serve') {
		// 开发模式
		return {
			root: path.resolve(import.meta.dirname, './dev'),
			plugins: [vue(), tailwindcss()],
			server: {
				port: 8191,
			},
		};
	} else {
		// 生产模式
		return {
			plugins: [vue(), tailwindcss()],
			build: {
				lib: {
					entry: './components/navbar.vue',
					name: 'navbar',
					fileName: 'navbar',
					formats: ['es'],
				},
				rollupOptions: {
					external: ['vue'],
					output: {
						globals: {
							vue: 'Vue',
						},
					},
				},
			},
		};
	}
});
