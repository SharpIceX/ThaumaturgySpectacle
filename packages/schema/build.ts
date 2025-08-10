import fs from 'node:fs';
import path from 'node:path';
import TypeToJsonSchema from 'ts-json-schema-generator';

const JSON_DIR = path.join(import.meta.dirname, './json');
// SPDX-FileCopyrightText: 2025 锐冰 <SharpIce@SharpIce.top>
// SPDX-License-Identifier: MIT

// 获取所有待处理的类型文件
const typeFiles = fs.readdirSync(path.join(import.meta.dirname, './types'));

console.info(`待处理的类型文件：\n${typeFiles.join('\n')}`);

// 创建输出目录
if (fs.existsSync(JSON_DIR)) fs.rmSync(JSON_DIR, { recursive: true }); // 删除已存在的目录（可能）
fs.mkdirSync(JSON_DIR, { recursive: true }); // 创建新的目录

// 处理每个类型文件
typeFiles.forEach(file => {
	const config: TypeToJsonSchema.Config = {
		path: path.join(import.meta.dirname, `./types/${file}`),
		tsconfig: path.join(import.meta.dirname, '../../tsconfig.json'),
		type: 'Schema',
	};

	const generator = TypeToJsonSchema.createGenerator(config);

	// 生成 JSON Schema
	const schema = generator.createSchema(config.type);

	fs.writeFileSync(path.join(JSON_DIR, file.replace('.d.ts', '.json')), JSON.stringify(schema, null, '\t'), 'utf-8');

	console.info(`已生成 JSON Schema：${file.replace('.d.ts', '.json')}`);
});
