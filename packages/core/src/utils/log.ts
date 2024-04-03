import ora from 'ora';
import chalk from 'chalk';
import { isArray, flatMap, isString, isObject } from 'lodash';
type message = string | any[];

export class Log {
	private spinner: ora.Ora;
	message: string;
	type: number;
	constructor(title: string = 'chatbot') {
		this.spinner = ora();
		this.message = '';
		this.type = 1;
		this.spinner.prefixText = chalk.blue(`[${title}]`);
	}

	getByteLength(str: string) {
		// 计算字符串的字节数
		return Buffer.byteLength(str, 'utf8');
	}

	getCurrentTime() {
		const now = new Date();
		return `${now.toLocaleTimeString()}`;
	}

	logTimeAtEnd(message: string) {
		const currentTime = this.getCurrentTime();
		let spaces = ' ';
		this.spinner.prefixText = chalk.gray(currentTime + ' ') + chalk.blue('[chatbot]');
		return message + spaces;
	}

	clear() {
		this.spinner.clear();
	}

	formatText(message: message, type = '') {
		if (isArray(message)) {
			this.type = 2;
			this.message = '';
			let newMessage = '';
			if (isArray(message)) {
				message = flatMap(message);
			}
			message.forEach((it, index) => {
				if (isString(it)) {
					it = it;
				}
				if (isObject(it)) {
					it = JSON.stringify(it, null, 2);
				}
				if (index == 0) {
					newMessage += `${it}  `;
				} else {
					if (type == 'fail') {
						console.error(it);
					} else {
						newMessage += chalk.white(it);
					}
				}
			});
			this.message = message.join('  ');
			return newMessage;
		}
		this.type = 1;
		this.message = message;
		return message;
	}

	// 显示 loading 类型的消息
	loading(message: message) {
		this.showMessage(this.formatText(message), 'loading', 'yellow');
	}

	// 显示 warn 类型的消息
	warn(message: message) {
		this.showMessage(this.formatText(message), 'warn', 'white');
	}

	// 显示 success 类型的消息
	success(...message: any) {
		this.showMessage(this.formatText(message), 'success', 'green');
	}

	// 显示 fail 类型的消息
	fail(...message: any) {
		this.showMessage(this.formatText(message, 'fail'), 'fail', 'red');
	}

	// 显示 info 类型的消息
	info(...message: any) {
		this.showMessage(this.formatText(message), 'info', 'red');
	}

	// 内部方法：显示不同类型和颜色的消息
	private showMessage(message: string, type = 'loading', color = 'yellow') {
		// @ts-ignore
		let coloredMessage = chalk[color](this.logTimeAtEnd(message));

		if (type == 'loading') {
			// @ts-ignore
			coloredMessage = chalk[color](this.logTimeAtEnd(message));
		}

		switch (type) {
			case 'loading':
				this.spinner.start(coloredMessage);
				break;
			case 'warn':
				this.spinner.info(coloredMessage);
				break;
			case 'fail':
				this.spinner.fail(coloredMessage);
				break;
			case 'info':
				this.spinner.info(coloredMessage);
				break;
			case 'success':
				this.spinner.succeed(coloredMessage);
				break;
			default:
				this.spinner.start(coloredMessage);
				break;
		}
	}
}
