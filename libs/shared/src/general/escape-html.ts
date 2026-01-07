/**
 * 将字符串中的 HTML 特殊字符转义为实体。
 * @param str 待转义的原始字符串
 * @returns 返回转义后的字符串
 */
function escapeHTML(str: string): string {
	let result = '';
	let lastIndex = 0;
	const len = str.length;

	for (let i = 0; i < len; i++) {
		const code = str.charCodeAt(i);
		let replacement = '';

		switch (code) {
			case 38:
				replacement = '&amp;';
				break; // &
			case 60:
				replacement = '&lt;';
				break; // <
			case 62:
				replacement = '&gt;';
				break; // >
			case 34:
				replacement = '&quot;';
				break; // "
			case 39:
				replacement = '&#39;';
				break; // '
			default:
				continue;
		}

		result += str.slice(lastIndex, i) + replacement;
		lastIndex = i + 1;
	}

	// 如果没有发生过替换，直接返回原字符串
	if (lastIndex === 0) return str;

	return result + str.slice(lastIndex);
}

export { escapeHTML };
