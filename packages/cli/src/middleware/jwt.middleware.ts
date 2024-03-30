import { Middleware } from '@midwayjs/core';
import { PassportMiddleware, AuthenticateOptions } from '@midwayjs/passport';
import { JwtStrategy } from '../strategy/jwt.strategy';

@Middleware()
export class JwtPassportMiddleware extends PassportMiddleware(JwtStrategy) {
  getAuthenticateOptions(): Promise<AuthenticateOptions> | AuthenticateOptions {
    return {};
  }
  ignore(ctx): boolean {
    // 下面的路由将忽略此中间件
    const ignoreMap = [
      '/user/login',
      '/',
      '/login',
      '/setup',
      '/jwt',
      '/get-image-captcha',
      '/check-captcha',
      '/wechat/create-qr-code'
    ];
    return ctx.path.includes('/openApi') || ignoreMap.includes(ctx.path);
  }
}
