// src/strategy/jwt.strategy.ts

import { CustomStrategy, PassportStrategy } from '@midwayjs/passport';
import { Strategy } from 'passport-jwt';
import { Config } from '@midwayjs/core';
import { Inject } from '@midwayjs/core';
import { Repository } from 'typeorm';
import cookie from 'cookie';
import { get } from 'lodash';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { User } from '../entity/user.entity';

@CustomStrategy()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  @Config('jwt')
  jwtConfig;

  @InjectEntityModel(User)
  userModel: Repository<User>;

  @Inject()
  ctx;

  async validate(payload: any) {
    try {
      const user = await this.userModel.findOne({
        where: { id: payload.id },
      });
      if (user) {
        return payload;
      }
      throw new Error('error password');
    } catch (ex) {
      throw new Error('error password');
    }
  }

  getStrategyOptions(): any {
    // const cookies = this.ctx.cookies.get('chatbot-auth');
    return {
      secretOrKey: this.jwtConfig.secret,
      jwtFromRequest: req => {
        const getcookie = cookie.parse(req.header?.cookie);
        return get(getcookie, 'chatbot-auth', '');
      },
    };
  }
}
