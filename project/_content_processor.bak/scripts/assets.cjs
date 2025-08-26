'use strict';

const fs = require('fs-extra');
const path = require('node:path');
const { globSync } = require('glob');

const assetsDirectory = path.join(hexo.public_dir, '../public');

hexo.extend.filter.register('before_exit', function () {
	// 创建资源目录
	if (!fs.existsSync(assetsDirectory)) fs.mkdirSync(assetsDirectory, { recursive: true });

	// 获取所有文件
	const files = globSync('**', { cwd: hexo.public_dir, nodir: true });

	for (const file of files) {
		// 跳过 .vue 文件
		if (file.endsWith('.vue')) continue;

		// 获取源文件绝对路径
		const sourcePath = path.join(hexo.public_dir, file);

		// 获取目标文件绝对路径
		const destinationPath = path.join(assetsDirectory, file);

		// 创建目标目录
		fs.ensureDirSync(path.dirname(destinationPath));

		// 移动文件
		fs.moveSync(sourcePath, destinationPath, { overwrite: true });

		hexo.log.info(`移动 ${sourcePath} -> ${destinationPath}`);
	}
});
