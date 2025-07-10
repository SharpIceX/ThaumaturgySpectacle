import crypto from 'node:crypto';

const generateAnchorId = (text: string): string => {
	return crypto
		.createHash('sha512') // 使用 SHA-512 哈希算法
		.update(text) // 将文本转换为哈希
		.digest('hex') // 将哈希转换为十六进制字符串
		.slice(0, 16) // 截取前 16 个字符作为锚点 ID。应该够用了。。。把？
		.toLowerCase(); // 转换为小写
};

export default generateAnchorId;
