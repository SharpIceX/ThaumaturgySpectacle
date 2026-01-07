import type { PluginSimple } from 'markdown-it';

const underline: PluginSimple = (md) => {
	md.inline.ruler.before('emphasis', 'underline', (state, silent): boolean => {
		const start = state.pos;
		const max = state.posMax;

		// 匹配 `--` 开头
		if (state.src.codePointAt(start) !== 0x2d || state.src.codePointAt(start + 1) !== 0x2d) return false;

		// 探测模式
		if (silent) {
			let pos = start + 2;
			while (pos < max - 1) {
				if (
					state.src.codePointAt(pos) === 0x2d &&
					state.src.codePointAt(pos + 1) === 0x2d &&
					(pos + 2 >= max || state.src.codePointAt(pos + 2) !== 0x2d)
				) {
					return pos > start + 2; // 有内容才算匹配
				}
				pos++;
			}
			return false;
		}

		// 正式解析模式
		state.pos = start + 2;
		let found = false;

		while (state.pos < max - 1) {
			if (
				state.src.codePointAt(state.pos) === 0x2d &&
				state.src.codePointAt(state.pos + 1) === 0x2d &&
				(state.pos + 2 >= max || state.src.codePointAt(state.pos + 2) !== 0x2d)
			) {
				found = true;
				break;
			}
			state.md.inline.skipToken(state);
		}

		if (!found || state.pos === start + 2) {
			state.pos = start;
			return false;
		}

		const contentEnd = state.pos;

		// 生成 token
		state.push('u_open', 'u', 1);
		state.pos = start + 2;
		state.posMax = contentEnd;
		state.md.inline.tokenize(state);
		state.push('u_close', 'u', -1);

		// 恢复原位置
		state.pos = contentEnd + 2;
		state.posMax = max;

		return true;
	});
};

export { underline };
