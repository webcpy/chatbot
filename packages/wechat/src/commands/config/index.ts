import { BaseCommand } from '../BaseCommand';
import inquirer from 'inquirer';

export default class Init extends BaseCommand {
  static description = '初始化配置'
  private initConfig = {}

  async init() {
    await super.init()
    this.initConfig = {
      ...this.setting,
    }
  }

  async run() {
    const configOptions = [
      {
        type: 'input',
        name: 'CHATBOT_API_KEY',
        message: '请输入api密钥',
        validate: (value) => {
          if (value.trim() === '') {
            return 'api密钥不能为空';
          }
          return true; // 输入有效
        },
        default: this.initConfig['CHATBOT_API_KEY'] || '',
      },
      {
        type: 'list',
        name: 'TYPE',
        message: '要使用的协议',
        choices: ['wechaty4u', 'wechatyPadlocal', 'wechatyService'],
      },
      {
        type: 'input',
        name: 'PAD_LOCAL_TOKEN',
        message: 'IPAD_token',
        validate: (value) => {
          if (value.trim() === '') {
            return 'padLocal不能为空';
          }
          return true; // 输入有效
        },
        when: (answers) => answers.type === 'wechatyPadlocal', // 如果选择了选项A则显示该问题
      },
      {
        type: 'input',
        name: 'WORK_PRO_TOKEN',
        message: '微信token',
        validate: (value) => {
          if (value.trim() === '') {
            return '企业微信token不能为空';
          }
          return true; // 输入有效
        },
        when: (answers) => answers.type === 'wechatyService', // 如果选择了选项A则显示该问题
      },
      {
        type: 'list',
        name: 'SERVER_TYPE',
        message: '服务配置',
        choices: ['default', 'custom'],
      },
      {
        type: 'input',
        name: 'CHATBOT_API_SERVER',
        message: '服务地址',
        validate: (value) => {
          if (value.trim() === '') {
            return '服务地址不能为空';
          }
          return true; // 输入有效
        },
        when: (answers) => answers.SERVER_TYPE == 'custom', // 如果选择了选项A则显示该问题
      },
      {
        type: 'input',
        name: 'MQTT_SERVER',
        message: 'mqtt-port',
        validate: (value) => {
          if (value.trim() === '') {
            return 'mqtt-port 不能为空';
          }
          return true; // 输入有效
        },
        when: (answers) => answers.SERVER_TYPE == 'custom', // 如果选择了选项A则显示该问题
      },
    ].map(it => {
      return {
        ...it,
        default: this.initConfig[it.name] || ''
      }
    });
    try {
      const answers = await inquirer.prompt(configOptions);
      this.update(answers)
    } catch (error) {
      console.error('初始化失败', error);
    }
  }
}
