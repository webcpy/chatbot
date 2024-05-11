import { Inject, Controller, Post, Files, Config, Body } from '@midwayjs/core';
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

  async encodeAudio(inputFilePath, outputFilePath) {
    const voice = new wxVoice();

    return new Promise((resolve, reject) => {
      voice.on('error', err => reject(err));

      voice.encode(inputFilePath, outputFilePath, { format: 'silk' }, file =>
        resolve(file)
      );
    });
  }

  async getAudioLength(path) {
    const voice = new wxVoice();
    return new Promise((resolve, reject) => {
      voice.on('error', err => reject(err));
      voice.duration(path, dur =>
        resolve(dur)
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

  @Post('/text/audio')
  async textToaudio(@Body() body: any) {
    try {
      const data: any = await this.httpService.post(
        body.proxyPass + '/audio/speech',
        {
          input: body.content,
          voice: body.voice,
          model: body.model
        },
        {
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${body.token}`
          },
          responseType: 'arraybuffer',
          timeout: 60 * 1000,
        }
      );
      const isWechaty = get(body, 'protocol', 'PuppetWechat4u')
      if (isWechaty) {
        return {
          code: 200,
          data: {
            name: uuidv4() + '.mp3',
            base: Buffer.from(data).toString('base64'),
          },
        }
      } else {
        const filePath = this.filePath + '/' + uuidv4().replace(/-/g, '') + '.mp3'
        const silPath = this.filePath + '/' + uuidv4().replace(/-/g, '') + '.sil'
        fs.writeFileSync(filePath, data.data);
        await this.encodeAudio(filePath, silPath);
        const voiceLength: any = await this.getAudioLength(filePath)
        const fileData = fs.readFileSync(silPath);
        setTimeout(() => {
          this.delFileList([silPath, filePath]);
        }, 600000)

        return {
          code: 200,
          data: {
            name: uuidv4() + '.sil',
            base: fileData.toString('base64'),
            voiceLength: (voiceLength * 1000).toFixed(0),
          },
        };
      }
    } catch (ex) {
      throw new Error(ex);
    }
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
