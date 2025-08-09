'use strict';

const fs = require('node:fs');
const path = require('node:path');

// NOTE: 此处添加 jsdoc 的原因是因为 Ajv 上的类型定义错误导致 IDE 无法正确识别。期望未来 Ajv 能够修复此问题把。
/** @type {typeof import("ajv").default} */
const Ajv = require('ajv');

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(require('@ts-packages/schema/json/wiki.json'));

/**
 * 获取 Markdown 文件同级目录下的 JSON 文件数据
 * @param {import("hexo")} hexo - Hexo 实例
 * @param {string} markdownFilePath - Markdown 文件的完整路径
 * @returns {object} - JSON 文件数据
 */
function getMarkdownJson(hexo, markdownFilePath) {
	const dirname = path.dirname(markdownFilePath);
	const basename = path.basename(markdownFilePath, path.extname(markdownFilePath));

	// 拼接 JSON 文件的完整路径
	const jsonFilePath = path.join(dirname, `${basename}.json`);

	// 文件不存在直接返回空数据
	if (!fs.existsSync(jsonFilePath)) return {};

	const jsonContent = fs.readFileSync(jsonFilePath, 'utf-8');

	// 文件为空发出警告并返回空数据
	if (!jsonContent.trim()) {
		hexo.log.warn(`文件 ${jsonFilePath} 为空，或许应该删除这个文件`);
		return {};
	}

	try {
		const data = JSON.parse(jsonContent);

		// 校验 JSON 数据格式
		if (!validate(data)) {
			const errors = (validate.errors || [])
				.map(err => {
					const path = err.instancePath || err.dataPath || '';
					return `路径: ${path || '(根)'}\n错误: ${err.message}`;
				})
				.join('\n\n');
			hexo.log.error(`JSON 文件 ${jsonFilePath} 格式不正确:\n${errors}`);
			return {};
		}

		return data;
	} catch (error) {
		hexo.log.error(`解析 JSON 文件 ${jsonFilePath} 失败: ${error.message}`);
		return {};
	}
}

module.exports = getMarkdownJson;
