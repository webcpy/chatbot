import {
  Inject,
  Controller,
  Post,
  Files,
  Config,
  Del,
  Query,
} from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { UserService } from '../service/user.service';
import { ApiExcludeController } from '@midwayjs/swagger';
import { config } from '../utils/config';
import { LocalIp } from '../service/local.service';
import { File } from '../entity/file.entity';
import { Repository } from 'typeorm';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { QiniuService } from '../service/qiniu.service';
import path from 'path';
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid';

@ApiExcludeController()
@Controller('/file', {ignoreGlobalPrefix: true})
export class APIController {
  @InjectEntityModel(File)
  fileModel: Repository<File>;

  @Config('qiniu.filePath')
  filePath;

  @Config('qiniu.url')
  url;

  @Config('upload.tmpdir')
  localPath;

  @Inject()
  ctx: Context;

  @Inject()
  userService: UserService;

  @Inject()
  qiniuService: QiniuService;

  @Inject()
  LocalIp: LocalIp;

  // @Post('/upload')
  async upload() {
    try {
      const stream: any = this.ctx.files[0].data;
      const fileName = this.ctx.files[0].filename;
      const data: any = await this.qiniuService.uploadImage(
        stream,
        (this.filePath || '') + uuidv4() + fileName
      );
      await this.fileModel.save(data);
      return { success: true, data, code: 200 };
    } catch (error) {
      return {
        code: -1,
        data: null,
        message: '上传失败：' + error.message,
      };
    }
  }

  // @Del('/del')
  async delFile(@Query('key') fileKey: string) {
    try {
      let key = fileKey;
      if (this.url) {
        key = fileKey.replace(new RegExp(this.url), '');
      }
      await this.qiniuService.deleteFile(key);
      await this.fileModel.delete({ key: fileKey });
      // await this.fileModel.save();
      return { success: true, data: null, code: 200 };
    } catch (error) {
      return {
        code: -1,
        data: null,
        message: error.message,
      };
    }
  }

  @Del('/del')
  async delLocalFile(@Query('key') fileKey: string) {
    try {
      await this.fileModel.delete({ key: fileKey });
      await fs.unlinkSync(path.join(this.localPath,path.basename(fileKey)))
      // await this.fileModel.save();
      return { success: true, data: null, code: 200 };
    } catch (error) {
      return {
        code: -1,
        data: null,
        message: error.message,
      };
    }
  }

  @Post('/upload')
  async fileUplod(@Files() files) {
    const network = `http://${this.LocalIp.getLocalIP()}:${config.port}/upload/`;
    const fileNameMap = files.map(it => {
      return {
        key: network + path.basename(it.data),
        hash: uuidv4(),
        userId: this.ctx.state.user.id,
      };
    });
    await this.fileModel.save(fileNameMap);
    return {
      code: 200,
      message: 'ok',
      data: fileNameMap[0],
    };
  }
}
