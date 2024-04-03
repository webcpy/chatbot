import { Configuration, App } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import * as info from '@midwayjs/info';
import { join } from 'path';
import * as orm from '@midwayjs/typeorm';
import * as staticFile from '@midwayjs/static-file';
import * as captcha from '@midwayjs/captcha';
import * as jwt from '@midwayjs/jwt';
import * as passport from '@midwayjs/passport';
import { JwtPassportMiddleware } from './middleware/jwt.middleware';
import { OpenAiMiddleware } from './middleware/openApi.middleware';
import * as mqtt from '@midwayjs/mqtt';
import * as swagger from '@midwayjs/swagger';
import * as upload from '@midwayjs/upload';
import * as axios from '@midwayjs/axios';

@Configuration({
  imports: [
    mqtt,
    orm,
    koa,
    staticFile,
    captcha,
    validate,
    jwt,
    passport,
    swagger,
    upload,
    axios,
    {
      component: info,
      enabledEnvironment: ['local'],
    },
  ],
  importConfigs: [join(__dirname, './config')],
})
export class MainConfiguration {
  @App('koa')
  app: koa.Application;

  async onReady() {
    // add middleware
    this.app.useMiddleware([JwtPassportMiddleware, OpenAiMiddleware]);
    // add filter
    // this.app.useFilter([NotFoundFilter, DefaultErrorFilter]);
  }
}
