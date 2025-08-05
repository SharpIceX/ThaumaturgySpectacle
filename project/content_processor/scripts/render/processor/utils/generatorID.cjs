'use strict';

/**
 * 将原始内容转换为用点分隔的十六进制 ID
 * @param {string} content - 原始内容
 * @returns {string} 生成的 ID
 */
function generatorID(content) {
	return Buffer.from(content.trim(), 'utf-8') // 去除首尾空格，然后以 UTF-8 编码转换到 Buffer
		.toString('hex') // 转换为十六进制字符串
		.match(/.{2}/g) // 每两个字符分为一组
		.join('.'); // 用点连接每组字符
}

module.exports = generatorID;
