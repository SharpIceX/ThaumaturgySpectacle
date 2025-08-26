'use strict';

const customProcessor = require('./custom.cjs');

/**
 * 处理角色信息类型 InfoBox
 * @param {import("hexo")} hexo - Hexo 实例
 * @param {HTMLElement} body - JSDOM 的 body 元素
 * @param {Extract<import("@ts/schema/types/wiki").Schema["components"]["InfoBox"], { type: "角色信息" }>["data"]} data - Markdown JSON 数据
 */
const characterInfoProcessor = (hexo, body, data) => {
	if (!data) return;

	/** @type {Array<{content: string, content_right?: string}>} data */
	const ProcessorData = [];

	// 表头
	ProcessorData.push({ content: '角色信息' });

	// 角色图片
	if (data.角色图片) {
		ProcessorData.push({ content: `<img src="${data.角色图片}" alt="角色图片">` });
	}

	// 名字
	ProcessorData.push({ content: '名字', content_right: data.名字 });

	// 别名
	if (data.别名) ProcessorData.push({ content: '别名', content_right: data.别名 });

	// 英文名
	if (data.英文名) ProcessorData.push({ content: '英文名', content_right: data.英文名 });

	// 性别
	if (data.性别) ProcessorData.push({ content: '性别', content_right: data.性别 });

	// 物种
	if (data.物种) ProcessorData.push({ content: '物种', content_right: data.物种 });

	// 生活地区
	if (data.生活地区) ProcessorData.push({ content: '生活地区', content_right: data.生活地区 });

	customProcessor(hexo, body, ProcessorData);
};

const ProcessorMap = {
	custom: customProcessor,
	角色信息: characterInfoProcessor,
};

/**
 * 处理 Markdown JSON 内的 components.InfoBox 数据
 * @param {import("hexo")} hexo - Hexo 实例
 * @param {HTMLElement} body - JSDOM 的 body 元素
 * @param {import("@ts/schema/types/wiki").Schema["components"]["InfoBox"]} data - Markdown JSON 数据
 */
function InfoBoxProcessor(hexo, body, data) {
	const Processor = ProcessorMap[data.type];
	if (Processor) {
		Processor(hexo, body, data.data);
	} else {
		hexo.log.warn(`未知的 InfoBox 处理器: ${data.type}`);
	}
}

module.exports = InfoBoxProcessor;
