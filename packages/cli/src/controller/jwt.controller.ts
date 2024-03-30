import { Post, Inject, Controller } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { JwtService } from '@midwayjs/jwt';
import { ApiExcludeController } from '@midwayjs/swagger';

@ApiExcludeController()
@Controller('/', {ignoreGlobalPrefix: true})
export class JwtController {
  @Inject()
  jwt: JwtService;

  @Inject()
  ctx: Context;

  @Post('/passport/jwt')
  async jwtPassport() {
    return this.ctx.state.user;
  }

  @Post('/jwt')
  async genJwt() {
    return {
      t: await this.jwt.sign({ msg: 'Hello Midway' }),
    };
  }
}
