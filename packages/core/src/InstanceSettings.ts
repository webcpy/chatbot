import path from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { createHash, randomBytes } from 'crypto';

interface ReadOnlySettings {
  encryptionKey: string;
}

interface WritableSettings {
  tunnelSubdomain?: string;
}

type Settings = ReadOnlySettings & WritableSettings;

const inTest = process.env.NODE_ENV === 'test';

export function getUserHome() {
  const homeVarName = process.platform === 'win32' ? 'USERPROFILE' : 'HOME';
  return (
    process.env.N8N_USER_FOLDER ?? process.env[homeVarName] ?? process.cwd()
  );
}

export class InstanceSettings {
  private readonly userHome = getUserHome();

  /** The path to the n8n folder in which all n8n related data gets saved */
  readonly chatBotFolder = path.join(this.userHome, '.chatbot');

  /** The path to the folder where all generated static assets are copied to */
  readonly staticCacheDir = path.join(this.userHome, '.cache/chatbot/public');

  /** The path to the folder containing installed nodes (like community nodes) */
  readonly nodesDownloadDir = path.join(this.chatBotFolder, 'fileUpload');

  private readonly settingsFile = path.join(this.chatBotFolder, 'config');

  private settings = this.loadOrCreate();

  readonly instanceId = this.generateInstanceId();

  get encryptionKey() {
    return this.settings.encryptionKey;
  }

  get tunnelSubdomain() {
    return this.settings.tunnelSubdomain;
  }

  update(newSettings: WritableSettings) {
    this.save({ ...this.settings, ...newSettings });
  }

  /**
   * Load instance settings from the settings file. If missing, create a new
   * settings file with an auto-generated encryption key.
   */
  private loadOrCreate(): Settings {
    if (existsSync(this.settingsFile)) {
      const content = readFileSync(this.settingsFile, 'utf8');

      const settings = JSON.parse(content);

      if (!inTest)
        console.info(`User settings loaded from: ${this.settingsFile}`);

      const { encryptionKey, tunnelSubdomain } = settings;

      if (!encryptionKey) {
        throw new Error(
          `Mismatching encryption keys. The encryption key in the settings file ${this.settingsFile} does not match the N8N_ENCRYPTION_KEY env var. Please make sure both keys match. More information: https://docs.n8n.io/hosting/environment-variables/configuration-methods/#encryption-key`
        );
      }

      return { encryptionKey, tunnelSubdomain };
    }

    mkdirSync(this.chatBotFolder, { recursive: true });

    const encryptionKey = randomBytes(24).toString('base64');

    const settings: Settings = { encryptionKey };

    this.save(settings);

    return settings;
  }

  private generateInstanceId() {
    const { encryptionKey } = this;
    return createHash('sha256')
      .update(encryptionKey.slice(Math.round(encryptionKey.length / 2)))
      .digest('hex');
  }

  private save(settings: Settings) {
    this.settings = settings;
    writeFileSync(
      this.settingsFile,
      JSON.stringify(settings, null, '\t'),
      'utf-8'
    );
  }
}
