import { subProcessorFunction } from './main';

const main: subProcessorFunction = (document, data): string => {
	const time = data.metadata?.time;

	const timeElement = document.createElement('div');
	timeElement.className = 'content-time';

	const createdElement = document.createElement('p');
	createdElement.className = 'created-time';
	createdElement.textContent = `创建于 ${time?.created.toFormat('yyyy年M月d日 H时m分s秒')}`;

	const updatedElement = document.createElement('p');
	updatedElement.className = 'updated-time';
	updatedElement.textContent = `更新于 ${time?.updated.toFormat('yyyy年M月d日 H时m分s秒')}`;

	timeElement.append(createdElement);
	timeElement.append(updatedElement);

	return timeElement.outerHTML;
};

export default main;
