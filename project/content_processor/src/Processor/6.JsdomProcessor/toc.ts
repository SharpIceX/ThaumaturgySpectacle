const main = (document: Document): string | undefined => {
	// 获取所有 h2-h6 标题
	const headings = document.querySelectorAll('h2, h3, h4, h5, h6');
	if (headings.length === 0) {
		return undefined;
	}

	const nav = document.createElement('nav');
	nav.setAttribute('role', 'navigation');
	nav.setAttribute('aria-label', 'Table of Contents');

	const rootOl = document.createElement('ol');
	nav.append(rootOl);

	const stack: HTMLOListElement[] = [rootOl];

	// 记录 ID 防止重复
	const usedIds = new Set<string>();

	for (const heading of headings) {
		const rawText = heading.textContent ?? '';

		let baseId =
			heading.id ||
			rawText
				.trim() // 去除首尾空格
				.toLowerCase() // 转小写
				.replaceAll(/\s+/g, '-') // 空格替换为连字符
				.replaceAll(/[^\w\u4E00-\u9FA5-]/g, '') // 仅保留字母、数字、下划线、中文和连字符
				.replaceAll(/-+/g, '-') // 连续连字符合并
				.replaceAll(/^-+|-+$/g, '') // 去除首尾连字符
				.slice(0, 50);

		// 如果清理后的 ID 为空，则设置默认 ID
		if (!baseId) baseId = 'section';

		// 处理重复 ID
		let finalId = baseId;
		let counter = 1;
		while (usedIds.has(finalId)) {
			finalId = `${baseId}-${counter}`;
			counter++;
		}
		usedIds.add(finalId);

		// 写入新 ID
		heading.id = finalId;

		// 计算层级
		const level = Number.parseInt(heading.tagName.slice(1), 10) - 1;

		// 4. 创建列表项
		const li = document.createElement('li');
		const anchor = document.createElement('a');
		anchor.href = `#${finalId}`;
		anchor.textContent = rawText;
		li.append(anchor);

		// 嵌套处理（含跳级处理）
		while (level > stack.length) {
			const lastContainer = stack.at(-1);
			let lastLi = lastContainer?.lastElementChild as HTMLLIElement | null;

			if (!lastLi) {
				lastLi = document.createElement('li');
				lastLi.setAttribute('aria-hidden', 'true');
				lastContainer?.append(lastLi);
			}

			const newSubList = document.createElement('ol');
			lastLi.append(newSubList);
			stack.push(newSubList);
		}

		while (level < stack.length) {
			stack.pop();
		}

		stack.at(-1)?.append(li);
	}

	return nav.outerHTML;
};

export default main;
