import { Controller, Inject, Get, Post, Config } from '@midwayjs/core';
import { CaptchaService } from '@midwayjs/captcha';
import { ApiResponseData } from '../service/data.service';
import { Repository } from 'typeorm';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { User } from '../entity/user.entity';
import { PasswordUtility } from '../service/password.service';
import { JwtService } from '@midwayjs/jwt';
import { ApiExcludeController } from '@midwayjs/swagger';
import { classToPlain } from 'class-transformer';
import { V1Controller } from './wechat.controller';

@ApiExcludeController()
@Controller('/', {ignoreGlobalPrefix: true})
export class HomeController {
  @InjectEntityModel(User)
  userModel: Repository<User>;

  @Inject()
  V1Controller: V1Controller;

  @Inject()
  jwt: JwtService;

  @Config('jwt.sign.expiresIn')
  expiresIn;

  @Inject()
  ctx;

  @Inject()
  PasswordUtility: PasswordUtility;

  @Inject()
  captchaService: CaptchaService;

  @Inject()
  apiResponse: ApiResponseData;

  // 示例：获取图像验证码
  @Get('/get-image-captcha')
  async getImageCaptcha() {
    const { id, imageBase64 } = await this.captchaService.image({
      width: 120,
      height: 40,
    });
    return this.apiResponse.wrap({
      id, // 验证码 id
      imageBase64, // 验证码 SVG 图片的 base64 数据，可以直接放入前端的 img 标签内
    });
  }

  // 验证验证码是否正确
  @Post('/check-captcha')
  async getCaptcha() {
    const { id, answer } = this.ctx.request.body;
    const passed: boolean = await this.captchaService.check(id, answer);
    if (passed) {
      return this.apiResponse.wrap();
    }
    return this.apiResponse.wrap('', -1, '验证码错误');
  }

  @Post('/setup')
  async setup() {
    const { password, username } = this.ctx.request.body;
    const findUser = await this.userModel.findOne({
      where: { username },
    });
    if (findUser) {
      return this.apiResponse.wrap('', -1, '用户已存在');
    }

    const brass = await this.PasswordUtility.hash(password);
    const apiKey = this.PasswordUtility.generateApiKey();

    const user = await this.userModel.save({
      username,
      password: brass,
      apiKey,
    });
    const signedToken: any = await this.jwt.sign(user);
    const time = this.PasswordUtility.convertToTimestamp(this.expiresIn);
    this.ctx.cookies.set('chatbot-auth', signedToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: time,
    });

    await this.V1Controller.initConfig(user.id)

    return this.apiResponse.wrap({
      token: signedToken,
      username,
    });
  }

  @Post('/user/login')
  async login() {
    const { password, username } = this.ctx.request.body;
    const findUser = await this.userModel.findOne({
      where: { username },
    });
    if (!findUser) {
      return this.apiResponse.wrap('', -1, '用户不存在');
    }

    const isPassword = await this.PasswordUtility.compare(
      password,
      findUser.password
    );
    if (!isPassword) {
      return this.apiResponse.wrap('', -1, '用户密码错误');
    }

    const signedToken: any = await this.jwt.sign(classToPlain(findUser));
    const time = this.PasswordUtility.convertToTimestamp(this.expiresIn);
    this.ctx.cookies.set('chatbot-auth', signedToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: time,
    });
    return this.apiResponse.wrap({
      token: signedToken,
      username,
    });
  }

  @Get('/user/loginOut')
  logout() {
    this.ctx.cookies.set('chatbot-auth', '', {
      expires: new Date(0), // 设置为过去的时间
      httpOnly: true, // 根据需要设置其他选项
    });
    return this.apiResponse.wrap('ok');
  }

  @Get('/user/appid')
  async getAppid() {
    const getUser = await this.getAppKeyModel()
    return {
      code: 200,
      data: getUser.apiKey
    }
  }

  @Get('/user/refreshAppKey')
  async refreshAppKey() {
    const apiKey = this.PasswordUtility.generateApiKey();
    const getUser = await this.getAppKeyModel()
    getUser.apiKey = apiKey
    await this.userModel.save(getUser)
    return {
      code: 200,
      data: getUser.apiKey
    }
  }

  async getAppKeyModel() {
    const getUser = await this.userModel.findOne({
      where: {
        id: this.ctx.state.user.id,
      },
    });
    return getUser
  }
}
