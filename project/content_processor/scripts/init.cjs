'use strict';

const fs = require('node:fs');
const path = require('node:path');

const distPath = path.join(hexo.base_dir, hexo.config.public_dir, '../');

hexo.extend.filter.register(
	'after_init',
	function () {
		// 创建 dist 目录
		if (!fs.existsSync(distPath)) fs.mkdirSync(distPath, { recursive: true });

		// 创建 Nuxt 配置文件
		{
			const NuxtConfigPath = path.join(distPath, 'nuxt.config.ts');
			fs.writeFileSync(NuxtConfigPath, 'export default defineNuxtConfig({});', 'utf-8');
		}
	},
	1,
);
