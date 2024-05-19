import {Command } from '@oclif/core'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export abstract class BaseCommand extends Command {
  static enableJsonFlag = true

  protected setting = { 'CHATBOT_API_KEY': '', 'WORK_PRO_TOKEN': '', 'MQTT_SERVER': '','CHATBOT_API_SERVER': '', 'SERVER_TYPE': 'default', TYPE: 'wechaty4u', 'PAD_LOCAL_TOKEN': '' }

  private settingsFilePath = join(this.config.configDir, 'config.json')

  private settings = this.loadOrCreate();

  update(newSettings) {
    this.save({ ...this.settings, ...newSettings });
  }

  /**
   * Load instance settings from the settings file. If missing, create a new
   * settings file with an auto-generated encryption key.
   */
  private loadOrCreate() {
    if (existsSync(this.settingsFilePath)) {

      const content = readFileSync(this.settingsFilePath, 'utf8');

      const settings = JSON.parse(content);
      const { CHATBOT_API_KEY, WORK_PRO_TOKEN, PAD_LOCAL_TOKEN, TYPE, CHATBOT_API_SERVER, SERVER_TYPE, MQTT_SERVER} = settings;
      return { CHATBOT_API_KEY, WORK_PRO_TOKEN, PAD_LOCAL_TOKEN, TYPE, CHATBOT_API_SERVER, SERVER_TYPE, MQTT_SERVER };
    }
    mkdirSync(this.config.configDir, { recursive: true });
    this.save(this.setting);
    return this.setting;
  }

  private save(settings) {
    this.settings = settings;
    writeFileSync(
      this.settingsFilePath,
      JSON.stringify(settings, null, '\t'),
      'utf-8'
    );
  }

  async init() {
    this.setting = {
      ...this.setting,
      ...this.settings
    }
    // return this.settings
  }
}