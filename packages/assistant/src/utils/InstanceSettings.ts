import path from 'path';
import { Service } from 'typedi';

export function getUserHome() {
  const homeVarName = process.platform === 'win32' ? 'USERPROFILE' : 'HOME';
  return (
    process.env.N8N_USER_FOLDER ?? process.env[homeVarName] ?? process.cwd()
  );
}

@Service()
export class InstanceSettings {
  private readonly userHome = getUserHome();
  readonly chatBotFolder = path.join(this.userHome, '.chatbot');
}
