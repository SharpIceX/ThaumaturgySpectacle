// 自定义信息板
interface InfoboxCustom {
	type: 'custom';
	data: {
		/** 左列内容 */
		content: string;
		/** 右列内容 */
		content_right?: string;
	}[];
}

// 自定义信息板
interface InfoboxCharacter {
	type: '角色信息';
	data: {
		名字: string;
		别名?: string;
		英文名?: string;

		/**
		 * @example `./images/character.webp`
		 */
		角色图片?: string;

		性别?: '男' | '女';
		物种?: string;
		属性?: string | string[];
		生活地区?: string;
	};
}

export interface Schema {
	InfoBox?: InfoboxCustom | InfoboxCharacter;
}
