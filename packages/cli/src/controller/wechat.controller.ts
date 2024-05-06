import {
  Controller,
  Post,
  Get,
  Inject,
  ContentType,
  Query,
  Body,
  Param,
  Config
} from '@midwayjs/core';
import { StatusConfig } from '../entity/statusConfig.entity';
import { CodeSatus } from '../entity/codeSatus.entity';
import { BaseConfig } from '../entity/baseconfig.entity';
import { SimpleConfig, EventConfig } from '../entity/simple.entity';
import QRCode from 'qrcode';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { PageService } from '../service/page.service';
import { Material } from '../entity/material.entity'
import { Friend, Room } from '../entity/friendRoom.entity';
import { DefaultMqttProducer } from '@midwayjs/mqtt';

@Controller('/')
export class V1Controller {
  @InjectEntityModel(StatusConfig)
  StatusConfig: Repository<StatusConfig>;

  @InjectEntityModel(Friend)
  Friend: Repository<Friend>;

  @InjectEntityModel(Room)
  Room: Repository<Room>;

  @Inject()
  producer: DefaultMqttProducer;

  @Inject()
  PageService: PageService;

  @InjectEntityModel(CodeSatus)
  CodeSatus: Repository<CodeSatus>;

  @InjectEntityModel(BaseConfig)
  BaseConfig: Repository<BaseConfig>;

  @InjectEntityModel(SimpleConfig)
  SimpleConfig: Repository<SimpleConfig>;

  @InjectEntityModel(EventConfig)
  EventConfig: Repository<EventConfig>;

  @InjectEntityModel(Material)
  material: Repository<Material>;

  @Inject()
  ctx;

  @Config('verison')
  verison;

  @Config('mqtt.pub.clients.default')
  mqtt;

  SimpleFormat(value, flag = true){
    const replys = flag ? { replys: value.replys || [] } : {};
    return {
      ...value,
      ...replys,
      keywords: value.keywords || []
    };
  };

  SimpleTextFormat (value, flag = true) {
    const replys = flag ? { replys: value.replys || []} : {};
    return {
      ...value,
      ...replys,
      keywords: value.keywords || [],
    };
  };

  @Post('/worker/setverifycode')
  async saveCode() {
    await this.StatusConfig.update({
      userId: this.ctx.state.user.id,
    },{
      ...this.ctx.request.body,
    });
    return { message: 'OK', code: 200, data: {} };
  }

  @Get('/openApi/worker/clearverifycode', {ignoreGlobalPrefix: true})
  async clearCode() {
    await this.StatusConfig.update({
      userId: this.ctx.state.user.id,
    },{
      verifyCode: '',
    });
    return { message: 'OK', code: 200, data: {} };
  }

  @Post('/openApi/webPanel/version', {ignoreGlobalPrefix: true})
  async updateVersion(@Body() query) {
    await this.StatusConfig.update({
      userId: this.ctx.state.user.id,
    },{
      ...query,
    });
    return { message: 'OK', code: 200, data: {} };
  }

  @Post('/openApi/wechat/info', {ignoreGlobalPrefix: true})
  async updateWebChat(@Body() query) {
    await this.CodeSatus.update({
      userId: this.ctx.state.user.id,
    },{
      ...query,
    });
    return { message: 'OK', code: 200, data: {} };
  }

  @Get('/openApi/wechat/heart', {ignoreGlobalPrefix: true})
  async wechatHeart(@Query() query) {
    await this.CodeSatus.update({
      userId: this.ctx.state.user.id,
    },{
      ...query,
    });
    return { message: 'OK', code: 200, data: {} };
  }

  @Get('/openApi/wechat/asyncData', {ignoreGlobalPrefix: true})
  async weChatAsyncData(@Query() query) {
    if (query.type == 1) {
      await this.Friend.delete({
        userId: this.ctx.state.user.id
      })
    } else {
      await this.Room.delete({
        userId: this.ctx.state.user.id
      })
    }
    return { message: 'OK', code: 200, data: {} };
  }

  @Get('/openApi/mqtt/config', {ignoreGlobalPrefix: true})
  async mqttConfig() {
    return { message: 'OK', code: 200, data: this.mqtt };
  }

  @Get('/openApi/webPanel/version',  {ignoreGlobalPrefix: true})
  async getVersion() {
    return { message: 'OK', code: 200, data: this.verison };
  }


  @Get('/openApi/wechat/config', {ignoreGlobalPrefix: true})
  @Get('/config')
  async getConfig() {
    const baseConfig = await this.BaseConfig.findOneBy({
      userId: this.ctx.state.user.id,
    })
    const data = await this.StatusConfig.findOneBy({
      userId: this.ctx.state.user.id,
    });
    return { message: 'OK', code: 200, data: {
      ...data,
      config: baseConfig
    } };
  }

  async initConfig(id) {
    const statsConfig = new StatusConfig()
    statsConfig.userId = id
    await this.StatusConfig.save(statsConfig)
    const baseConfig = new BaseConfig()
    baseConfig.userId = id
    await this.BaseConfig.save(baseConfig)
  }

  @Get('/openApi/wechat/status', {ignoreGlobalPrefix: true})
  @Get('/status')
  async statusqrcode() {
    const data = await this.CodeSatus.findOneBy({
      userId: this.ctx.state.user.id,
    });
    return { message: 'OK', code: 200, data };
  }

  @Get('/create-qr-code')
  @ContentType('image/png')
  async createQrCode(@Query('url') url) {
    const options = {
      width: 200,
      height: 200,
      margin: 0.5,
      typeNumber: 14,
      version: 4,
      scale: 8,
      color: {
        dark: '#867762', // 设置前景色为蓝色
        light: '#FFFFFF', // 设置背景色为白色
      },
    };
    // 生成 QR 码并转换为 Base64 编码
    const qrCodeBase64 = await QRCode.toBuffer(url, options);
    // 将 Base64 编码作为数据 URI 发送给客户端
    return qrCodeBase64;
  }

  @Post('/saveKeywords')
  async saveKeywords(@Body() query: any) {
    const data = await this.getBaseConfig();
    let replyKeywords: any = new SimpleConfig();
    const findQuery = (query.replys || []).map(it => {
      return {
        materialId: it.materialId,
        type: it.type
      }
    })
    replyKeywords = {
      ...query,
      ...replyKeywords,
      keywords: query.keywords || [],
    };
    if (findQuery.length > 0) {
      const replys = await this.material.findBy(findQuery);
      replyKeywords.replys = replys
    }
    if (!data) {
      const parent: any = new BaseConfig();
      parent.userId = this.ctx.state.user.id;
      parent.replyKeywords = [replyKeywords];
      await this.BaseConfig.save(parent);
    } else {
      replyKeywords.base = data;
      await this.SimpleConfig.save(replyKeywords);
    }
    await this.producer.publishAsync(
      `aibotk/${this.ctx.state.user.id}/event`,
      JSON.stringify({
        target: 'replyKeywords',
      })
    );
    return { code: 200, data: {} };
  }

  async getBaseConfig() {
    const data = await this.BaseConfig.findOneBy({
      userId: this.ctx.state.user.id,
    });
    return data;
  }

  @Post('/putKeywords')
  async putKeywords(@Body() query: any) {
    const data = await this.getBaseConfig();
    let replyKeywords: any = new SimpleConfig();
    replyKeywords = this.SimpleTextFormat({
      ...query,
      ...replyKeywords
    });
    if (!data) {
      const parent: any = new BaseConfig();
      parent.userId = this.ctx.state.user.id;
      parent.replyKeywords = [replyKeywords];
      await this.BaseConfig.save(parent);
    } else {
      replyKeywords.baseId = data;
      await this.SimpleConfig.save(replyKeywords);
    }
    return { code: 200, data: null };
  }

  @Get('/openApi/wechat/getKeywords', { ignoreGlobalPrefix: true })
  async openApiGetKeywords() {
    const baseConfig: any = await this.PageService.getBaseConfig()
    let data: any = []
    if (baseConfig) {
      data = baseConfig.replyKeywords || []
    }
    return {
      code: 200,
      data,
    };
  }

  @Get('/getKeywords')
  async getKeywords(@Query() query) {
    const baseData = await this.getBaseConfig();
    if (baseData) {
      const { data, count } = await this.PageService.searchWithPagination(
        this.SimpleConfig,
        'SimpleConfig',
        {
          baseId: baseData.id,
        },
        query.pageSize,
        query.current,
        'and',
        ["SimpleConfig.replys", "replys"]
      );
      return {
        code: 200,
        message: 'OK',
        data: {
          list: data.map(it => {
            return this.SimpleFormat(it, false)
          }),
          count,
        },
      };
    }

    return {
      code: 200,
      data: { list: [], count: 0 },
    };
  }

  @Get('/delKeywords/:simpleId')
  async delKeywords(@Param('simpleId') simpleId: any) {
    const baseData = await this.getBaseConfig();
    if (!!baseData) {
      const query: any = `${simpleId}`.split(',').map(it => {
        return {
          id: it,
          baseId: baseData.id,
        };
      });
      await this.SimpleConfig.delete([...query]);
      await this.producer.publishAsync(
        `aibotk/${this.ctx.state.user.id}/event`,
        JSON.stringify({
          target: 'replyKeywords',
        })
      );

    }
    return { code: 200, data: null };
  }

  @Get('/detailKeywords/:simpleId')
  async detailKeywords(@Param('simpleId') simpleId: any) {
    const baseData = await this.getBaseConfig();
    if (!!baseData) {
      const data = await this.SimpleConfig.findOneBy({
        id: simpleId
      });
      return { code: 200, data: this.SimpleFormat(data, false) };
    }
    return { code: 200, data: null };
  }

  @Post('/updateKeywords')
  async updateKeywords(@Body() query: any) {
    const baseData = await this.getBaseConfig();
    if (!!baseData) {
      const findQuery = (query.replys || []).map(it => {
        return {
          materialId: it.materialId,
          type: it.type
        }
      })
      let replys = []
      if (findQuery.length > 0) {
        replys = await this.material.findBy(findQuery);
      }
      await this.SimpleConfig.save({
        ...this.SimpleTextFormat(query),
        replys
      })
      await this.producer.publishAsync(
        `aibotk/${this.ctx.state.user.id}/event`,
        JSON.stringify({
          target: 'replyKeywords',
        })
      );
      return { code: 200, data: {} };
    }
    return { code: 200, data: null };
  }

  @Post('/saveEventKeywords')
  async saveEventKeywords(@Body() query: any) {
    const data = await this.getBaseConfig();
    let eventKeywords: any = new EventConfig();
    eventKeywords = this.SimpleTextFormat({
      ...query,
      ...eventKeywords
    }, false);
    if (!data) {
      const parent: any = new BaseConfig();
      parent.userId = this.ctx.state.user.id;
      parent.eventKeywords = [eventKeywords];
      await this.BaseConfig.save(parent);
    } else {
      eventKeywords.base = data;
      await this.EventConfig.save(eventKeywords);
    }
    await this.producer.publishAsync(
      `aibotk/${this.ctx.state.user.id}/event`,
      JSON.stringify({
        target: 'eventKeywords',
      })
    );
    return { code: 200, data: {} };
  }

  @Get('/openApi/wechat/getEventKeywords', { ignoreGlobalPrefix: true })
  async openApiGetEventKeywords() {
    const baseConfig: any = await this.PageService.getBaseConfig()
    let data: any = []
    if (baseConfig) {
      data = baseConfig.eventKeywords || []
    }
    return {
      code: 200,
      data,
    };
  }

  @Get('/getEventKeywords')
  async getEventKeywords(@Query() query) {
    const baseData = await this.getBaseConfig();
    if (baseData) {
      const { data, count } = await this.PageService.searchWithPagination(
        this.EventConfig,
        'EventConfig',
        {
          baseId: baseData.id,
        },
        query.pageSize,
        query.current
      );
      return {
        code: 200,
        message: 'OK',
        data: {
          list: data.map(it => {
            return this.SimpleFormat(it, false)
          }),
          count,
        },
      };
    }

    return {
      code: 200,
      data: { list: [], count: 0 },
    };
  }

  @Get('/delEventKeywords/:simpleId')
  async delEventKeywords(@Param('simpleId') simpleId: any) {
    const baseData = await this.getBaseConfig();
    if (!!baseData) {
      const query: any = `${simpleId}`.split(',').map(it => {
        return {
          id: it,
          baseId: baseData.id,
        };
      });
      await this.EventConfig.delete([...query]);
      await this.producer.publishAsync(
        `aibotk/${this.ctx.state.user.id}/event`,
        JSON.stringify({
          target: 'eventKeywords',
        })
      );
    }
    return { code: 200, data: null };
  }

  @Get('/detailEventKeywords/:simpleId')
  async detailEventKeywords(@Param('simpleId') simpleId: any) {
    const baseData = await this.getBaseConfig();
    if (!!baseData) {
      const data = await this.EventConfig.findOneBy({
        id: simpleId
      });
      return { code: 200, data: this.SimpleFormat(data, false) };
    }
    return { code: 200, data: null };
  }

  @Post('/updateEventKeywords')
  async updateEventKeywords(@Body() query: any) {
    const baseData = await this.getBaseConfig();
    if (!!baseData) {
      await this.EventConfig.update({id: query.id}, this.SimpleTextFormat(query, false))
      await this.producer.publishAsync(
        `aibotk/${this.ctx.state.user.id}/event`,
        JSON.stringify({
          target: 'eventKeywords',
        })
      );
      return { code: 200, data: {} };
    }
    return { code: 200, data: null };
  }
}
