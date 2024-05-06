import { Inject, Controller, Post, Files, Config } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { ApiExcludeController } from '@midwayjs/swagger';
import { File } from '../entity/file.entity';
import { Repository } from 'typeorm';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { v4 as uuidv4 } from 'uuid';
import wxVoice from 'wx-voice';
import { HttpService } from '@midwayjs/axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { traditionToSimple } from 'chinese-simple2traditional';
import { get } from 'lodash';

@ApiExcludeController()
@Controller('/openApi', { ignoreGlobalPrefix: true })
export class APIController {
  @InjectEntityModel(File)
  fileModel: Repository<File>;

  @Config('upload.tmpdir')
  filePath;

  @Config('api.voiceApi')
  voiceApi;
  @Config('api.imgTextApi')
  imgTextApi;

  @Inject()
  httpService: HttpService;

  @Inject()
  ctx: Context;

  async convertAudio(inputFilePath, outputFilePath) {
    const voice = new wxVoice();

    return new Promise((resolve, reject) => {
      voice.on('error', err => reject(err));

      voice.decode(inputFilePath, outputFilePath, { format: 'mp3' }, file =>
        resolve(file)
      );
    });
  }

  delFileList(fileList: any) {
    fileList.forEach(filePath => {
      fs.unlink(filePath, err => {
        if (err) {
          console.error(`Error deleting file ${filePath}:`, err);
        } else {
          console.log(`File ${filePath} deleted successfully`);
        }
      });
    });
  }

  @Post('/audio/text')
  async audioToText(@Files() files: any) {
    if (!this.voiceApi) return;
    try {
      const inputFilePath = files[0].data;
      const filePath: any = await this.convertAudio(
        inputFilePath,
        this.filePath + '/' + uuidv4() + '.mp3'
      );
      const fileData = fs.createReadStream(filePath);
      const formData = new FormData();

      formData.append('audio_file', fileData, {
        filename: path.basename(filePath),
        contentType: 'audio/mp3',
      });
      const data: any = await this.httpService.postForm(
        this.voiceApi,
        formData,
        {
          params: {
            encode: true,
            task: 'transcribe',
            word_timestamps: false,
            output: 'json',
          },
          headers: {
            accept: 'application/json',
            ...formData.getHeaders(), // 设置请求头为 FormData 对象的头部信息
            // 如果后端需要其他自定义的请求头，可以在这里添加
          },
        }
      );
      const text = get(data, 'data.text', '');
      this.delFileList([inputFilePath, filePath]);
      return {
        code: 200,
        data: traditionToSimple(text),
      };
    } catch (ex) {
      console.log(ex);
      throw new Error(ex);
    }
  }

  @Post('/textToAudio')
  async textToAudio() {
    return { code: 200, data: 'textToAudio' };
  }

  @Post('/img/text')
  async imgToText(@Files() files: any) {
    if (!this.imgTextApi) return;
    try {
      const inputFilePath = files[0].data;
      const fileData = fs.createReadStream(inputFilePath);
      const formData = new FormData();

      formData.append('file', fileData, {
        filename: path.basename(inputFilePath),
      });
      formData.append('compress', 1600);
      const data: any = await this.httpService.postForm(
        this.imgTextApi,
        formData,
        {
          headers: {
            ...formData.getHeaders(), // 设置请求头为 FormData 对象的头部信息
          },
        }
      );
      const text = get(data, 'data.data.raw_out', [])
        .map(it => it[1])
        .join('');
      this.delFileList([inputFilePath]);
      return {
        code: 200,
        data: text,
      };
    } catch (ex) {
      console.log(ex);
      throw new Error(ex);
    }
  }
}
