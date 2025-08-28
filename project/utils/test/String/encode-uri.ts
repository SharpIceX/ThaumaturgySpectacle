import { describe, it, expect } from 'vitest';
import { encode, encodeURI } from '../../src/String/encode-uri';

describe('encode', () => {
	it('主要测试', () => {
		expect(encode('你好')).toBe('%E4%BD%A0%E5%A5%BD');
	});

	it('主要测试:输出小写', () => {
		expect(encode('你好', '', true)).toBe('%e4%bd%a0%e5%a5%bd');
	});

	it('主要测试:指定不编码字符', () => {
		expect(encode('你好', '好')).toBe('%E4%BD%A0好');
	});
});

describe('EncodeURI', () => {
	it('主要测试', () => {
		expect(encodeURI('你好')).toBe('%E4%BD%A0%E5%A5%BD');
	});
});
