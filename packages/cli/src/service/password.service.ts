// apiResponse.ts

import { Provide } from '@midwayjs/core';
import { compare, genSaltSync, hash } from 'bcryptjs';
import crypto from 'crypto';

@Provide()
export class PasswordUtility {
  async hash(plaintext: string) {
    const SALT_ROUNDS = 10;
    const salt = genSaltSync(SALT_ROUNDS);
    return await hash(plaintext, salt);
  }

  generateApiKey() {
    return crypto.randomBytes(16).toString('hex');
  }

  async compare(plaintext: string, hashed: string) {
    return await compare(plaintext, hashed);
  }

  convertToTimestamp(interval) {
    const timeUnits = {
      s: 1000, // 秒
      m: 60 * 1000, // 分钟
      h: 60 * 60 * 1000, // 小时
      d: 24 * 60 * 60 * 1000, // 天
    };

    // 提取数字和单位
    const num = parseInt(interval);
    const unit = interval.slice(-1);

    // 如果单位不在预定义的单位中，返回错误
    if (!timeUnits[unit]) {
      throw new Error('Invalid time interval');
    }

    // 计算时间戳
    return num * timeUnits[unit];
  }
}
