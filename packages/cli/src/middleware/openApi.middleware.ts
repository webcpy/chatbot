// src/middleware/jwt.middleware

import { Middleware, httpError, Config, IMiddleware } from '@midwayjs/core';
import { Context, NextFunction } from '@midwayjs/koa';
import { User } from '../entity/user.entity';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';

@Middleware()
export class OpenAiMiddleware implements IMiddleware<Context, NextFunction>  {
  @Config('swagger')
  apiKey;

  @InjectEntityModel(User)
  userModel: Repository<User>;

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      // 判断下有没有校验信息
      const key = 'chatbot_api_key';
      if (!ctx.headers[key]) {
        throw new httpError.UnauthorizedError();
      }

      // 从 header 上获取校验信息
      const apiKey = ctx.get(key);
      const getApiKey = await this.userModel.findOne({
        where: { apiKey },
      });
      if (!getApiKey) {
        throw new httpError.UnauthorizedError('apikey is not found');
      }
      ctx.state.user = getApiKey
      await next();
    };
  }

  match(ctx: Context): boolean {
    // 下面的匹配到的路由会执行此中间件
    if (ctx.path.includes('/openApi')) {
      return true;
    }
  }
}
