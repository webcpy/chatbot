import path from 'path';
import { getUserHome, InstanceSettings } from '@chat-bot/core';
import {readFileSync} from 'fs';

const userHome = getUserHome();

const editorDir = path.join(path.dirname(require.resolve('@chat-bot/editor-ui')), 'dist');;

function getEncryKey() {
  const content = readFileSync(userHome + '/.chatbot/config', 'utf8');

  const settings = JSON.parse(content);
  return settings.encryptionKey;
}
new InstanceSettings();
export const config = {
  editorDir,
  chatPath: '/',
  restEndpoint: '',
  hooksUrls: '',
  port: 7001,
  mqttPath: path.join(userHome, '.chatbot/mqtt'),
  logPath: path.join(userHome, '.chatbot/log'),
  sqlite: path.join(userHome, '.chatbot/cli.sqlite'),
  staticCacheDir: path.join(userHome, '.cache/chatbot/public'),
  encryptionKey: getEncryKey(),
};
