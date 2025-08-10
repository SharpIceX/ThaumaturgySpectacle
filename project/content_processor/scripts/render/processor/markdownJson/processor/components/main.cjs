'use strict';

const ProcessorMap = {
	InfoBox: require('./InfoBox.cjs'),
};

/**
 * 处理 Markdown JSON 内的 Components 数据
 * @param {import("hexo")} hexo - Hexo 实例
 * @param {HTMLElement} body - JSDOM 的 body 元素
 * @param {import("@ts/schema/types/wiki").Schema["components"]} data - Markdown JSON 数据
 */
function ComponentsProcessor(hexo, body, data) {
	Object.keys(data).forEach(key => {
		if (ProcessorMap[key]) {
			if (data[key]) ProcessorMap[key](hexo, body, data[key]);
		} else {
			hexo.log.warn(`未知的 Components 处理器: ${key}`);
		}
	});
}

module.exports = ComponentsProcessor;
