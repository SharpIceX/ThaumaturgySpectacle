'use strict';

const processorMap = {
	components: require('./processor/components/main.cjs'),
};

/**
 * 处理 Markdown JSON 数据
 * @param {import("hexo")} hexo - Hexo 实例
 * @param {HTMLElement} body - JSDOM 的 body 元素
 * @param {import("@ts/schema/types/wiki").Schema} data - Markdown JSON 数据
 */
function markdownJson(hexo, body, data) {
	for (const key of Object.keys(data)) {
		if (processorMap[key]) {
			if (data[key]) processorMap[key](hexo, body, data[key]);
		} else {
			hexo.log.warn(`未知的 Markdown JSON 处理器: ${key}`);
		}
	}
}

module.exports = markdownJson;
