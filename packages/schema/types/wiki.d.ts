/** 幻术奇象 Wiki 数据 Schema */
export interface Schema {
	/** 页面组件 */
	components?: {
		/** 信息板 */
		infobox?:
			| {
					type: 'custom';
					data: {
						/* 左列内容 */
						content: string;
						/* 右列内容 */
						content_right?: string;
					}[];
			  }
			| {
					type: '角色信息';
					data: {
						名字: string;

						/**
						 * 以 `./` 开头的路径表示相对路径，会自动使用当前文件夹内内容
						 */
						角色图片?: string;

						种族?: string;
						职业?: string;
						生活地区?: string;
						能力值?: string;
					};
			  };
	};
}
