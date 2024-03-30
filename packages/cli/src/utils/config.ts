import path from 'path';
import { getUserHome } from './InstanceSettings';
import { readFileSync } from 'fs';

const userHome = getUserHome();
const editorDir = path.join(
  __dirname,
  '../../node_modules/chatbot-editor-ui/dist'
);
function getEncryKey() {
  const content = readFileSync(userHome + '/.chatbot/config', 'utf8');

  const settings = JSON.parse(content);
  return settings.encryptionKey;
}
export const config = {
  editorDir,
  chatPath: '/',
  restEndpoint: '',
  hooksUrls: '',
  port: 7001,
  staticCacheDir: path.join(userHome, '.cache/chatbot/public'),
  encryptionKey: getEncryKey(),
};
