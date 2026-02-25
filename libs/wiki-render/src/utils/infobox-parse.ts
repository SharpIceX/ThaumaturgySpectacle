import { z } from 'zod';
import { InfoboxSchema } from '../zod/infobox';

function InfoBoxParse(infobox: z.infer<typeof InfoboxSchema>): string {
	let html = '';
	const { type, data } = infobox;

	// 判断是否为空
	if (
		!Object.values(infobox.data)
			.flat(Infinity)
			.some((v) => v !== '' && v != null)
	)
		return html;

	html += '<table class="infobox">\n';

	switch (type) {
		case '角色信息': {
			html += '<thead><tr><th colspan="2">角色信息</th></tr></thead>\n';
			html += '<tbody>\n';

			if (data.名字 && data.名字.length > 0) {
				html += `<tr><th>名字</th><td><ul>\n`;
				data.名字.forEach((name) => {
					html += `<li>${name}</li>\n`;
				});
				html += `</ul></td></tr>\n`;
			}

			if (data.性别) {
				html += `<tr><th>性别</th><td>${data.性别}</td></tr>\n`;
			}

			if (data.物种) {
				html += `<tr><th>物种</th><td>${data.物种}</td></tr>\n`;
			}

			html += '</tbody>\n';

			break;
		}
	}

	html += '</table>';
	return html;
}

export { InfoBoxParse };
