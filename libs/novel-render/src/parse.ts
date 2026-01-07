import { escapeHTML } from '@ts/shared/src/general/escape-html';

const HEADING_REGEXP = /^(#{2,6})\s+(\S.*)$/;
const SEGMENTER = new Intl.Segmenter('zh', { granularity: 'grapheme' });

/** 判断是否为常用 ASCII 字符 */
const isAscii = (char: string | undefined): boolean => {
	if (!char) return false;
	const code = char.charCodeAt(0);
	return code >= 0x20 && code <= 0x7f;
};

/** 字数统计 */
const countGraphemes = (text: string): number => {
	let count = 0;
	for (const _ of SEGMENTER.segment(text)) {
		count++;
	}
	return count;
};

interface ParseResult {
	html: string;
	wordCount: number;
}

function parse(content: string | undefined | null): ParseResult {
	if (!content) return { html: '', wordCount: 0 };

	let totalWordCount = 0;
	const htmlChunks: string[] = [];
	let buffer = '';

	const flushBuffer = () => {
		if (!buffer) return;
		totalWordCount += countGraphemes(buffer);
		htmlChunks.push(`<p>${escapeHTML(buffer)}</p>`);
		buffer = '';
	};

	const lines = content.split(/\r?\n/);

	for (const rawLine of lines) {
		const line = rawLine.trim();

		if (!line) {
			flushBuffer();
			continue;
		}

		const headingMatch = line.match(HEADING_REGEXP);
		if (headingMatch && headingMatch[1] && headingMatch[2]) {
			flushBuffer();
			const level = headingMatch[1].length;
			const text = headingMatch[2].trim();
			totalWordCount += countGraphemes(text);
			htmlChunks.push(`<h${level}>${escapeHTML(text)}</h${level}>`);
		} else {
			if (buffer.length > 0) {
				const lastChar = buffer[buffer.length - 1];
				const firstChar = line[0];

				if (isAscii(lastChar) && isAscii(firstChar)) {
					buffer += ' ';
				}
			}
			buffer += line;
		}
	}

	flushBuffer();

	return {
		html: htmlChunks.join(''),
		wordCount: totalWordCount,
	};
}

export { parse };
