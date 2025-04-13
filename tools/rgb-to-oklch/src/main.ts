import { oklch } from 'culori';
import readline from 'node:readline/promises';

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

console.log('输入十六进制颜色，Ctrl+C 退出\n');

process.on('SIGINT', () => process.exit(0));

(async function main() {
	while (true) {
		const answer = await rl.question('');
		let hex = answer.trim().replace(/#/g, ''); // 去掉"#"号

		if (!hex) continue; // 为空时跳过

		// 格式验证
		if (!/^[0-9a-f]{3}$|^[0-9a-f]{6}$/i.test(hex)) {
			console.log('无效颜色\n');
			continue;
		}

		// 处理简写格式
		if (hex.length === 3) {
			hex = hex.replace(/./g, '$&$&');
		}

		try {
			const color = oklch(`#${hex}`);

			if (!color) {
				console.log('无效颜色\n');
				continue;
			}

			const l = `${(color.l * 100).toFixed(1)}%`;
			const c = color.c.toFixed(3).replace(/\.?0+$/, '');
			const h = color.h ? `${color.h.toFixed(0)}` : '0';

			console.log(`oklch(${l} ${c} ${h})\n`);
		} catch {
			console.log('无效颜色\n');
		}
	}
})();
