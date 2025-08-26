import chalk from 'chalk';
import process from 'node:process';

type LogLevel = 'Info' | 'Warn' | 'Error' | 'Debug';

const isDebug = process.env?.['DEBUG'] === 'true';

class Logger {
	private name: string;

	/**
	 * 创建一个新的日志记录器实例
	 * @param name 日志记录器名称，通常为模块或类的名称
	 */
	constructor(name: string) {
		this.name = name;
	}

	private log(level: LogLevel, message: string) {
		const time = new Date().toISOString();
		const prefix = `[${time}] [${level}] [${this.name}]`;
		switch (level) {
			case 'Info': {
				console.log(chalk.blueBright(`${prefix} ${message}`));
				break;
			}
			case 'Warn': {
				console.log(chalk.yellowBright(`${prefix} ${message}`));
				break;
			}
			case 'Error': {
				console.log(chalk.redBright(`${prefix} ${message}`));
				break;
			}
			case 'Debug': {
				console.log(chalk.greenBright(`${prefix} ${message}`));
				break;
			}
		}
	}

	/**
	 * 信息
	 * @param message 日志消息
	 */
	public info(message: string) {
		this.log('Info', message);
	}

	/**
	 * 警告
	 * @param message 日志消息
	 */
	public warn(message: string) {
		this.log('Warn', message);
	}

	/**
	 * 错误
	 * @param message 日志消息
	 */
	public error(message: string) {
		this.log('Error', message);
	}

	/**
	 * 调试
	 * @param message 日志消息
	 */
	public debug(message: string) {
		if (isDebug) {
			this.log('Debug', message);
		}
	}
}

export default Logger;
