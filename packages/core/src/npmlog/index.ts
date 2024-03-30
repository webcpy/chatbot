import ora from 'ora'
import chalk from 'chalk'
import { isArray, flatMap, isString } from 'lodash'

type message = string | any[]
class Log {
  private spinner: ora.Ora
  message: string
  type: number
  constructor() {
    this.spinner = ora()
    this.message = ''
    this.type = 1
    this.spinner.prefixText = chalk.blue('[chatbot]')
  }

  getByteLength(str: string) {
    // 计算字符串的字节数
    return Buffer.byteLength(str, 'utf8')
  }

  getCurrentTime() {
    const now = new Date()
    return `${now.toLocaleTimeString()}`
  }

  calculateStringLength(str: string) {
    let length = 0
    for (let i = 0; i < str.length; i++) {
      // 获取当前字符的 Unicode 编码
      // 判断是否为中文字符
      const char = str[i]
      let chieseReg =
        /[(\u4e00-\u9fa5)(\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3010|\u3011|\u007e)]+/g

      if (/[\u4e00-\u9fa5]/.test(char) || chieseReg.test(char)) {
        // 中文字符长度为2
        length += 2
      } else {
        // 非中文字符长度为1
        length += 1
      }
    }
    return length
  }

  logTimeAtEnd(message: string) {
    // const prefixTextlength = (this.spinner.prefixText || '').length
    // const terminalWidth = process.stdout.columns
    const currentTime = this.getCurrentTime()
    // const length = currentTime.length + this.calculateStringLength(this.message) + prefixTextlength / 2 + 2 * this.type
    let spaces = ' '
    // if (length < terminalWidth) {
    //   spaces = ' '.repeat(terminalWidth - length)
    // } else {
    //   const newLength = Math.floor((this.calculateStringLength(this.message) % terminalWidth))
    //   spaces = ' '.repeat(terminalWidth - newLength - currentTime.length - prefixTextlength / 2 - 4 )
    // }
    this.spinner.prefixText = chalk.gray(currentTime + ' ') + chalk.blue('[chatbot]')
    return message + spaces
  }

  clear() {
    this.spinner.clear()
  }

  formatText(message: message) {
    if (isArray(message)) {
      this.type = 2
      this.message = ''
      let newMessage = ''
      if (isArray(message)) {
        message = flatMap(message)
      }
      message.forEach((it, index) => {
        if (isString(it)) {
          it = it
        }
        if (index == 0) {
          newMessage += `${it}  `
        } else {
          newMessage += chalk.white(it)
        }
      })
      this.message = message.join('  ')
      return newMessage
    }
    this.type = 1
    this.message = message
    return message
  }

  // 显示 loading 类型的消息
  loading(message: message, color = 'yellow') {
    this.showMessage(this.formatText(message), 'loading', color)
  }

  // 显示 warn 类型的消息
  warn(message: message, color = 'white') {
    this.showMessage(this.formatText(message), 'warn', color)
  }

  // 显示 success 类型的消息
  success(...message: any) {
    this.showMessage(this.formatText(message), 'success', 'green')
  }

  // 显示 fail 类型的消息
  fail(...message: any) {
    this.showMessage(this.formatText(message), 'fail', 'red')
  }

  // 显示 info 类型的消息
  info(message: message, color = 'red') {
    this.showMessage(this.formatText(message), 'info', color)
  }

  // 内部方法：显示不同类型和颜色的消息
  private showMessage(message: string, type = 'loading', color = 'yellow') {
    // @ts-ignore
    let coloredMessage = chalk[color](this.logTimeAtEnd(message))

    if (type == 'loading') {
      // @ts-ignore
      coloredMessage = chalk[color](this.logTimeAtEnd(message))
    }

    switch (type) {
      case 'loading':
        this.spinner.start(coloredMessage)
        break
      case 'warn':
        this.spinner.info(coloredMessage)
        break
      case 'fail':
        this.spinner.fail(coloredMessage)
        break
      case 'info':
        this.spinner.info(coloredMessage)
        break
      case 'success':
        this.spinner.succeed(coloredMessage)
        break
      default:
        this.spinner.start(coloredMessage)
        break
    }
  }
}

declare global {
  var log: Log
}
global.log = new Log()
export default new Log()
