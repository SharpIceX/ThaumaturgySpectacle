'use strict';

const { JSDOM } = require('jsdom');
const document = new JSDOM().window.document;

/**
 * 处理自定义信息框（custom）
 * @param {import("hexo")} hexo - Hexo 实例
 * @param {HTMLElement} body - JSDOM 的 body 元素
 * @param {Array<{content: string, content_right?: string}>} data - 信息框内容数组，每项包含左侧内容和可选的右侧内容
 */
const customProcessor = (hexo, body, data) => {
	if (!Array.isArray(data) || data.length === 0) return;

	const infoBox = document.createElement('table');
	infoBox.className = 'custom infobox';

	const tbody = document.createElement('tbody');

	data.forEach(item => {
		const tr = document.createElement('tr');

		// 左侧内容（th）
		const th = document.createElement('th');
		th.innerHTML = item.content;
		tr.appendChild(th);

		// 右侧内容（td）
		if (item.content_right) {
			const td = document.createElement('td');
			td.innerHTML = item.content_right;
			tr.appendChild(td);
		}

		tbody.appendChild(tr);
	});

	infoBox.appendChild(tbody);
	body.insertBefore(infoBox, body.firstChild);
};

module.exports = customProcessor;
