enum ParseErrorCode {
	INVALID_IMAGE_LAYOUT = 'INVALID_IMAGE_LAYOUT',
	INVALID_IMAGE_SCALE = 'INVALID_IMAGE_SCALE',
}

/** 错误详情映射表 */
const ParseErrorMessage: Record<ParseErrorCode, string> = {
	[ParseErrorCode.INVALID_IMAGE_LAYOUT]: '图片布局参数错误：仅支持 "left" 或 "right"',
	[ParseErrorCode.INVALID_IMAGE_SCALE]: '图片缩放比例非法：必须是一个有效的数字（如 0.5）',
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
