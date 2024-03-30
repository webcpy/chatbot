import { Command } from '@oclif/core';
import { Bootstrap } from '@midwayjs/bootstrap';
import path from 'path';
import { InstanceSettings } from '../utils/InstanceSettings';
const ora = require('ora');

export abstract class BaseCommand extends Command {
  protected app: typeof Bootstrap;
  InstanceSettings: InstanceSettings;
  spinner = ora('服务启动中...');
  async init(): Promise<void> {
    this.app = Bootstrap.configure({
      appDir: path.join(__dirname, '../../'),
    });
    this.InstanceSettings = new InstanceSettings();
  }
}
