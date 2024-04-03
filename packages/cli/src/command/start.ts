import { BaseCommand } from './baseCommand';
import { Flags, type Config } from '@oclif/core';
import replaceStream from 'replacestream';
import { createReadStream, createWriteStream, existsSync } from 'fs';
import glob from 'fast-glob';
import stream from 'stream';
import { promisify } from 'util';
import path from 'path';
import { mkdir } from 'fs/promises';
import { config } from '../utils/config';
import { initMqtt } from '../utils/initmqtt';
import { initVoice } from '../utils/initVoice';
import { initWechat } from 'chatbot-core';
const { networkInterfaces } = require('os');
const chalk = require('chalk');

const pipeline = promisify(stream.pipeline);

export class Start extends BaseCommand {
  static description = '启动聊天机器人配置服务';
  static examples = ['$ chatbot start', '$ chatbot start -o'];

  static flags = {
    help: Flags.help({ char: 'h' }),
    open: Flags.boolean({
      char: 'o',
      description: '在浏览器中自动打开用户界面',
    }),
  };

  constructor(argv: string[], cmdConfig: Config) {
    super(argv, cmdConfig);
  }

  private async generateStaticAssets() {
    // Read the index file and replace the path placeholder
    const { chatPath, restEndpoint, hooksUrls, editorDir } = config;

    let scriptsString = '';
    if (hooksUrls) {
      scriptsString = hooksUrls.split(';').reduce((acc, curr) => {
        return `${acc}<script src="${curr}"></script>`;
      }, '');
    }

    const closingTitleTag = '</title>';
    const { staticCacheDir } = this.InstanceSettings;
    const compileFile = async (fileName: string) => {
      const filePath = path.join(editorDir, fileName);
      if (/(index\.html)|.*\.(js|css)/.test(filePath) && existsSync(filePath)) {
        const destFile = path.join(staticCacheDir, fileName);
        await mkdir(path.dirname(destFile), { recursive: true });
        const streams = [
          createReadStream(filePath, 'utf-8'),
          replaceStream('/{{BASE_PATH}}/', chatPath, { ignoreCase: false }),
          replaceStream('/static/', chatPath + 'static/', {
            ignoreCase: false,
          }),
        ];
        if (filePath.endsWith('index.html')) {
          streams.push(
            replaceStream('{{REST_ENDPOINT}}', restEndpoint, {
              ignoreCase: false,
            }),
            replaceStream(closingTitleTag, closingTitleTag + scriptsString, {
              ignoreCase: false,
            })
          );
        }
        streams.push(createWriteStream(destFile, 'utf-8'));
        return await pipeline(streams);
      }
    };

    await compileFile('index.html');
    const files = await glob('**/*.{css,js}', { cwd: editorDir });
    await Promise.all(files.map(compileFile));
  }

  async init() {
    this.spinner.start();
    await initVoice();
    await initMqtt();
    await super.init();
    await this.generateStaticAssets();
  }

  getLocalIP() {
    const interfaces = networkInterfaces();
    const addresses = [];
    for (const interfaceName of Object.keys(interfaces)) {
      for (const iface of interfaces[interfaceName]) {
        // 跳过非 IPv4 地址和环回地址
        if (iface.family === 'IPv4' && !iface.internal) {
          addresses.push(iface.address);
        }
      }
    }
    return addresses;
  }

  async run() {
    await this.app.run();
    this.spinner.succeed('启动成功');
    process.stdout.write = super.originalStdoutWrite;
    const localIp = this.getLocalIP()[0];
    console.log(
      chalk.blue('➜') +
        '  Local:    ' +
        chalk.green(`http://127.0.0.1:${config.port}/`)
    );
    console.log(
      chalk.green('➜') +
        chalk.gray(`  Network:  http://${localIp}:${config.port}/`)
    );
    initWechat();
  }
}
