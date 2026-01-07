/**
 * 预加载图片资源
 * @param url 图片 URL
 * @param timeout 超时时间，默认 2000ms
 * @returns true: 成功, false: 失败, undefined: 超时
 */
async function preloadImage(url: string, timeout = 2000): Promise<undefined | boolean> {
	return new Promise((resolve) => {
		const img = new Image();
		let settled = false;

		// 统一出口
		const finish = (result?: boolean | undefined) => {
			if (settled) return;
			settled = true;

			// 释放
			if (timeoutId) clearTimeout(timeoutId);
			img.removeEventListener('load', load);
			img.removeEventListener('error', error);

			resolve(result);
		};

		// 超时
		const timeoutId = setTimeout(() => {
			finish();
		}, timeout);

		// 成功
		const load = () => {
			if (typeof img.decode === 'function') {
				img.decode()
					.then(() => finish(true))
					.catch((error_: unknown) => {
						console.error('图片解码失败', error_);
						finish(false);
					});
			} else {
				finish(true);
			}
		};

		// 错误
		const error = () => {
			console.error(`图片预加载失败: ${url}`);
			finish(false);
		};

		img.addEventListener('load', load);
		img.addEventListener('error', error);
		img.src = url;
	});
}

export default preloadImage;
