import { Controller, Post, Get, Inject, Body } from '@midwayjs/core';
import { BaseConfig } from '../entity/baseconfig.entity';
import { StatusConfig } from '../entity/statusConfig.entity';

import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { PageService } from '../service/page.service';
import { DefaultMqttProducer } from '@midwayjs/mqtt';

@Controller('/')
export class BaseController {
  @Inject()
  PageService: PageService;

  @Inject()
  producer: DefaultMqttProducer;

  @InjectEntityModel(BaseConfig)
  BaseConfig: Repository<BaseConfig>;

  @InjectEntityModel(StatusConfig)
  StatusConfig: Repository<StatusConfig>;

  @Inject()
  ctx;

  @Post('/saveBaseConfig')
  async saveBaseConfig(@Body() query: any) {
    const baseMap = query
    let baseConfig: any = new BaseConfig()
    baseConfig = {
      ...baseMap,
      userId: this.ctx.state.user.id,
    }
    await this.BaseConfig.save(baseConfig);
    await this.producer.publishAsync(
      `aibotk/${this.ctx.state.user.id}/event`,
      JSON.stringify({
        target: 'system',
        event: 'updateConfig'
      })
    );
    return { code: 200, data: {} };
  }

  @Get('/detailBaseConfig')
  async detailBaseConfig() {
    const data = await this.BaseConfig.findOneBy({
      userId: this.ctx.state.user.id,
    });
    return { code: 200, data };
  }

  @Post('/updateBaseConfig')
  async updateBaseConfig(@Body() query: any) {
    const data = await this.BaseConfig.findOneBy(      { id: query.id, userId: this.ctx.state.user.id },
      )
    await this.BaseConfig.save(
     {
      ...data,
      ...query
     }
    );
    await this.producer.publishAsync(
      `aibotk/${this.ctx.state.user.id}/event`,
      JSON.stringify({
        target: 'system',
        event: 'updateConfig'
      })
    );
    return { code: 200, data: null };
  }
}
