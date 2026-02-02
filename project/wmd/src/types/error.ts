enum ParseErrorCode {
	// 通用
	TRAILING_CHARACTERS_AFTER_CLOSING = 'TRAILING_CHARACTERS_AFTER_CLOSING',

	// 标题
	INVALID_HEADING_LEVEL = 'INVALID_HEADING_LEVEL',

	// 图片
	INVALID_IMAGE_SCALE = 'INVALID_IMAGE_SCALE',
	INVALID_IMAGE_LAYOUT = 'INVALID_IMAGE_LAYOUT',
	MISSING_IMAGE_SOURCE = 'MISSING_IMAGE_SOURCE',
	IMAGE_SCALE_TOO_MANY_DECIMALS = 'IMAGE_SCALE_TOO_MANY_DECIMALS',

	// 引用块
	INVALID_BLOCKQUOTE_ALERT_TYPE = 'INVALID_BLOCKQUOTE_ALERT_TYPE',

	// 代码块
	UNCLOSED_CODE_BLOCK = 'UNCLOSED_CODE_BLOCK',

	// 公式块
	UNCLOSED_FORMULA_BLOCK = 'UNCLOSED_FORMULA_BLOCK',

	// 宏
	UNCLOSED_MACRO_BLOCK = 'UNCLOSED_MACRO_BLOCK',
}

/** 错误详情映射表 */
const ParseErrorMessage: Record<ParseErrorCode, string> = {
	// 通用
	[ParseErrorCode.TRAILING_CHARACTERS_AFTER_CLOSING]: '闭合标记后存在多余字符',

	// 标题
	[ParseErrorCode.INVALID_HEADING_LEVEL]: '标题级别错误：标题最高仅支持 6 级',

	// 图片
	[ParseErrorCode.INVALID_IMAGE_SCALE]: '图片缩放比例非法：必须是一个有效的数字（如 0.5）',
	[ParseErrorCode.INVALID_IMAGE_LAYOUT]: '图片布局参数错误：仅支持 "left" 或 "right"',
	[ParseErrorCode.MISSING_IMAGE_SOURCE]: '图片解析失败：缺少图片源链接',
	[ParseErrorCode.IMAGE_SCALE_TOO_MANY_DECIMALS]: '图片缩放比例警告：小数位超过 2 位，多余部分已被截断',

	// 引用块
	[ParseErrorCode.INVALID_BLOCKQUOTE_ALERT_TYPE]: '不支持的强调信息类型',

	// 代码块
	[ParseErrorCode.UNCLOSED_CODE_BLOCK]: '代码块语法错误：未找到闭合反引号',

	// 公式块
	[ParseErrorCode.UNCLOSED_FORMULA_BLOCK]: '公式块语法错误：数学公式未正确闭合 (缺少 $$)',

	// 宏
	[ParseErrorCode.UNCLOSED_MACRO_BLOCK]: '宏语法错误：未找到闭合标识 (:::)',
};

interface ParseError {
	code: ParseErrorCode;
	position: {
		start: { line: number; column: number; offset: number };
		end: { line: number; column: number; offset: number };
	};
}

export { ParseErrorCode, ParseErrorMessage };
export type { ParseError };
