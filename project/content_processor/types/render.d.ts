import type hexo from 'hexo';
import type { StoreFunctionData } from 'hexo/dist/extend/renderer';

export type ProcessorFunc = (hexo: hexo, content: StoreFunctionData) => string;
