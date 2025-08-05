export interface PagesDataType {
	title: string;
	path: string;
	category: string;
}

export interface ProcessorFuncResult {
	path: string;
	data: string;
}

export type ProcessorFunc = (data: PagesDataType[]) => ProcessorFuncResult[];
