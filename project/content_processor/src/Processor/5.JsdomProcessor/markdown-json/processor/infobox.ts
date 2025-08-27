import type { Schema as WikiSchema } from '@ts/schema/types/wiki.d.ts';

const customProcessor = (
	document: Document,
	data: Extract<WikiSchema['InfoBox'], { type: 'custom' }>['data'],
): void => {
	// 创建 InfoBox 表格
	const infoBox = document.createElement('table');
	infoBox.className = 'custom infobox';

	// 创建表格内容
	const tbody = document.createElement('tbody');
	for (const { content, content_right } of data) {
		const tr = document.createElement('tr');
		const th = document.createElement('th');
		th.innerHTML = content;
		tr.append(th);

		if (content_right) {
			const td = document.createElement('td');
			td.innerHTML = content_right;
			tr.append(td);
		}

		tbody.append(tr);
	}

	// 插入表格到文档最前面
	infoBox.append(tbody);
	document.body.insertBefore(infoBox, document.body.firstChild);
};

const characterInfoProcessor = (
	document: Document,
	data: Extract<WikiSchema['InfoBox'], { type: '角色信息' }>['data'],
): void => {
	const ProcessorData: Extract<WikiSchema['InfoBox'], { type: 'custom' }>['data'] = [];

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

	customProcessor(document, ProcessorData);
};

const main = (document: Document, data: WikiSchema['InfoBox']) => {
	if (!data) return;
	switch (data.type) {
		case 'custom': {
			customProcessor(document, data.data);
			break;
		}
		case '角色信息': {
			characterInfoProcessor(document, data.data);
			break;
		}
	}
};

export default main;
