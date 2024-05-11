import { Inject, Controller, Get, Query, Param } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { UserService } from '../service/user.service';
import { JwtController } from './jwt.controller';
import { ApiTags } from '@midwayjs/swagger';
import { V1Controller } from './wechat.controller';
import { CodeSatus } from '../entity/codeSatus.entity';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { LocalIp } from '../service/local.service';
import { config } from '../utils/config';
import {omitBy, isNull} from 'lodash';
import { Material } from '../entity/material.entity';

@ApiTags(['hello'])
@Controller('/openApi', {ignoreGlobalPrefix: true})
export class APIController {
  @Inject()
  ctx: Context;

  @InjectEntityModel(Material)
  materialModel: Repository<Material>;

  @Inject()
  LocalIp: LocalIp;

  @InjectEntityModel(CodeSatus)
  CodeSatus: Repository<CodeSatus>;

  @Inject()
  V1Controller: V1Controller;

  @Inject()
  JwtController: JwtController;

  @Inject()
  userService: UserService;

  @Get('/get_user')
  async getUser() {
    const data = await this.JwtController.genJwt();
    return { success: true, message: 'OK', data };
  }
  @Get('/worker/verifycode')
  async verifycode() {
    const { data } = await this.V1Controller.getConfig();
    return { code: 200, message: 'OK', data };
  }

  @Get('/wechat/material/:materialId')
  async detail(@Param('materialId') materialId: number) {
    const data: any = await this.materialModel.findOneBy( { materialId, userId: this.ctx.state.user.id });
    const detail = omitBy(data, isNull);
    return {
      code: 200,
      message: 'OK',
      data: {
        ...detail,
        tag: data.tag,
      },
    };
  }

  @Get('/wechat/qrcode')
  async wechatQrcode(@Query() query) {
    const data = await this.CodeSatus.findOneBy({
      userId: this.ctx.state.user.id,
    });
    if (data) {
      await this.CodeSatus.update({
        userId: this.ctx.state.user.id
      }, {
        qrUrl: `http://${this.LocalIp.getLocalIP()}:${config.port}/wechat/create-qr-code?url=` + query.qrUrl,
        qrStatus: query.qrStatus,
      });
    } else {
      await this.CodeSatus.save({
        userId: this.ctx.state.user.id,
        qrUrl: `http://${this.LocalIp.getLocalIP()}:${config.port}/wechat/create-qr-code?url=` + query.qrUrl,
        qrStatus: query.qrStatus,
      });
    }
    return {
      code: 200,
      data: ''
    }
  }
}
