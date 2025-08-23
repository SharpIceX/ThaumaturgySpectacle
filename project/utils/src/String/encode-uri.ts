/**
 * @description ASCII 所包含的字符
 */
const alwaysUnescaped = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.!~*'()";

/**
 * 编码
 * @see https://tc39.es/ecma262/#sec-encode
 * @param inputString - 未编码 URI 的值。
 * @param extraUnescaped - 额外不需要编码的字符。
 * @param toLowerCase - 是否将字符串转换为小写（默认 false，标准一般为大写）。
 * @returns 编码后的内容
 */
function encode(inputString: string, extraUnescaped = '', toLowerCase = false): string {
	const unescapedSet = new Set([...alwaysUnescaped, ...extraUnescaped]);
	let result = '';

	for (let index = 0; index < inputString.length; ) {
		const codePoint = inputString.codePointAt(index);
		if (codePoint === undefined) {
			throw new URIError(`Invalid code point at index ${index}`);
		}

		const char = String.fromCodePoint(codePoint);

		// 代理项检测
		if (codePoint >= 0xd8_00 && codePoint <= 0xdf_ff) {
			throw new URIError('Unpaired surrogate detected in input');
		}

		// 是否不用编码
		if (char.length === 1 && unescapedSet.has(char)) {
			result += char;
			index++;
			continue;
		}

		// 编码为 UTF-8 percent-encoding
		const utf8Bytes = new TextEncoder().encode(char);
		for (const byte of utf8Bytes) {
			let hex = byte.toString(16).padStart(2, '0');
			if (!toLowerCase) hex = hex.toUpperCase();
			result += `%${hex}`;
		}

		// 跳过代理对（高低位代理字符组成的 codePoint 占两个 codeUnit）
		index += char.length;
	}

	return result;
}

/**
 * 编码 URI
 * @see https://tc39.es/ecma262/#sec-encodeuri-uri
 * @param inputString - 未编码 URI 的值。
 * @param toLowerCase - 是否将字符串转换为小写（默认 false，标准一般为大写）。
 * @returns 编码后的内容
 */
const encodeURI = (inputString: string, toLowerCase = false): string => encode(inputString, ';/?:@&=+$,#', toLowerCase);

export { encode, encodeURI };
