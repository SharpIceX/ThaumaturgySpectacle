type Task = () => Promise<void>;
type GetTaskType = () => Promise<Task | undefined>;

/**
 * 自动异步任务队列管理
 * @description 能够自动管理异步任务，限制并发数量。
 */
class AsyncTaskQueue {
	private concurrency: number;
	private abortSignal?: AbortSignal;
	private getTask: GetTaskType;
	private errorCallback?: (error: unknown) => void;

	/**
	 * @param concurrency 最大并发数量
	 * @param getTask 获取任务的函数，必须保证线程安全
	 * @param abortSignal 可选的中止信号，当中止信号发出后，队列将停止获取新任务，但已经开始的任务会继续执行直至完成
	 * @param errorCallback 可选的错误回调函数，当任务执行出错时调用。请注意，你不应该依赖这个回调来控制错误，你应该在任务函数内部处理错误。
	 */
	constructor(
		concurrency: number,
		getTask: GetTaskType,
		abortSignal?: AbortSignal,
		errorCallback?: (error: unknown) => void,
	) {
		this.concurrency = concurrency;
		this.getTask = getTask;

		if (abortSignal) this.abortSignal = abortSignal;
		if (errorCallback) this.errorCallback = errorCallback;
	}

	private async taskExecutor(): Promise<void> {
		while (true) {
			// 检查中止信号
			if (this.abortSignal?.aborted) break;

			// 获取任务
			const task = await this.getTask();

			// 检查是否没有更多任务，或者是否终止
			if (!task || this.abortSignal?.aborted) break;

			// 运行
			try {
				await task();
			} catch (error: unknown) {
				if (this.errorCallback) this.errorCallback(error);
			}
		}
	}

	/**
	 * 开始运行所有任务
	 */
	public async runAll(): Promise<void> {
		// 根据并发数量创建任务执行器
		const executors = Array.from(
			{
				length: this.concurrency,
			},
			() => this.taskExecutor(),
		);

		// 等待所有执行器完成
		await Promise.all(executors);
	}
}

export default AsyncTaskQueue;
export type { GetTaskType };
