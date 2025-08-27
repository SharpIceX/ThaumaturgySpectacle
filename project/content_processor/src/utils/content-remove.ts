import { contentType } from '../content';

const contentRemove = (content: contentType[], filePathList: Set<string>): void => {
	if (filePathList.size > 0) {
		for (let index = content.length - 1; index >= 0; index--) {
			const inputPath = content[index]?.inputPath;
			if (inputPath && filePathList.has(inputPath)) {
				content.splice(index, 1);
			}
		}
	}
};

export default contentRemove;
