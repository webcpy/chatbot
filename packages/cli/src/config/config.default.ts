import { MidwayConfig } from '@midwayjs/core';
import path from 'path';
import { config } from '../utils/config';
import { uploadWhiteList } from '@midwayjs/upload';
import * as dotenv from 'dotenv';

// load .env file in process.cwd
dotenv.config();

export default {
  // use for cookie sign key, should change to your own and keep security
  keys: '1708246335822_6032',
  typeorm: {
    dataSource: {
      default: {
        type: 'sqlite',
        database: path.join(__dirname, '../../chatbot.sqlite'),
        synchronize: true,
        logging: false,
        // ...
        entities: ['**/entity/*.entity{.ts,.js}'],
      },
    },
  },
  verison: process.env.VERSION,
  midwayLogger: {
    clients: {
      coreLogger: {
        level: 'warn',
        consoleLevel: 'warn',
        // ...
      },
      appLogger: {
        level: 'error',
        consoleLevel: 'error',
        // ...
      },
    },
  },
  staticFile: {
    dirs: {
      default: {
        prefix: '/',
        dir: config.staticCacheDir,
        gzip: true,
        alias: {
          '/': '/index.html',
        },
      },
      other: {
        prefix: '/',
        dir: config.editorDir,
        gzip: true,
      },
    },
  },
  passport: {
    session: false,
  },
  jwt: {
    secret: config.encryptionKey, // fs.readFileSync('xxxxx.key')
    sign: {
      // signOptions
      expiresIn: '2d', // https://github.com/vercel/ms
    },
  },
  swagger: {
    title: '微信机器人开放api',
    description: '开放 API',
    contact: {
      name: '老李',
      url: 'https://wechat.aibotk.com/oapi/oapi',
      email: 'webcpy@163.com',
    },
    tags: [
      {
        name: '基础配置',
      },
      {
        name: '简单问答',
      },
      {
        name: '技能中心',
      },
      {
        name: '群发助手',
      },
      {
        name: '转发助手',
      },
      {
        name: '多群消息同步',
      },
      {
        name: '回调事件',
      },
      {
        name: 'rss订阅推送',
      },
      {
        name: 'GPT对话配置',
      },
      {
        name: '定时任务',
      },
      {
        name: '好友列表',
      },
      {
        name: '群管理',
      },
      {
        name: '素材中心',
      },
    ],
    // 外部文档
    externalDocs: {
      description: '用户手册',
      url: 'https://example.com',
    },
    auth: {
      authType: 'apikey',
      name: 'chatbot_api_key',
      in: 'header',
    },
  },
  api: {
    voiceApi: process.env.VOICE_API,
    imgTextApi: process.env.IMG_TEXT_API,
  },
  upload: {
    // mode: UploadMode, 默认为file，即上传到服务器临时目录，可以配置为 stream
    mode: 'file',
    // fileSize: string, 最大上传文件大小，默认为 10mb
    fileSize: '2mb',
    // whitelist: string[]，文件扩展名白名单
    whitelist: uploadWhiteList.concat(['.sil']).filter(ext =>
      {
        return ['.jpg', '.jpeg', '.png', '.silk', '.sil'].includes(ext)
      }
    ),
    // tmpdir: string，上传的文件临时存储路径
    tmpdir: path.join(config.staticCacheDir, 'upload'),
    // cleanTimeout: number，上传的文件在临时目录中多久之后自动删除，默认为 5 分钟
    cleanTimeout: 0,
    // base64: boolean，设置原始body是否是base64格式，默认为false，一般用于腾讯云的兼容
    base64: false,
    // 仅在匹配路径到 /api/upload 的时候去解析 body 中的文件信息
    match: /\/(file\/upload|openApi\/audio\/text|openApi\/img\/text)/,
  },
  koa: {
    port: config.port,
    globalPrefix: '/wechat'
  },
  validate: {
    validationOptions: {
      allowUnknown: true, // 全局生效
    },
  },
  qiniu: {
    AccessKey: process.env.ACCESSKEY, // 54321
    SecretKey: process.env.SECRET,
    Bucket: process.env.BUCKET,
    filePath: process.env.FILEPATH,
    url: process.env.URL,
  },
  mqtt: {
    sub: {
      sub1: {
        connectOptions: {
          host: '127.0.0.1',
          port: 1883,
          username: 'chatbot',
          password: 'chatbot'
        },
        subscribeOptions: {
          topicObject: ['sub1', 'test'],
        },
      }
    },
    pub: {
      clients: {
        default: {
          host: '127.0.0.1',
          port: 1883,
          username: 'chatbot',
          password: 'chatbot'
        }
      }
    }
  },
} as MidwayConfig;
