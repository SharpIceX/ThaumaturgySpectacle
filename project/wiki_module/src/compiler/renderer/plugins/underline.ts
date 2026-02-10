import type { PluginSimple } from 'markdown-it';

const underline: PluginSimple = (md) => {
	md.inline.ruler.before('emphasis', 'underline', (state, silent): boolean => {
		const start = state.pos;
		const max = state.posMax;

		// 匹配`--`标签
		if (state.src.codePointAt(start) !== 0x2d || state.src.codePointAt(start + 1) !== 0x2d) {
			return false;
		}

		if (silent) return false;

		// 寻找闭合标签
		state.pos = start + 2;
		let found = false;

		while (state.pos < max - 1) {
			if (
				state.src.codePointAt(state.pos) === 0x2d &&
				state.src.codePointAt(state.pos + 1) === 0x2d && // 确保不是三个减号`---`
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

		// oken 流
		state.push('u_open', 'u', 1);
		state.pos = start + 2;
		state.posMax = contentEnd;
		state.md.inline.tokenize(state);
		state.push('u_close', 'u', -1);
		state.pos = contentEnd + 2;
		state.posMax = max;

		return true;
	});
};

export { underline };
