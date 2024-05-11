import {
  Controller,
  Post,
  Get,
  Inject,
  // ContentType,
  Query,
  Body,
  Param
} from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { PageService } from '../service/page.service';
import { DefaultMqttProducer } from '@midwayjs/mqtt';
import { BaseConfig } from '../entity/baseconfig.entity';
import { AiBotPromot, AiBotCustomchat } from '../entity/aibot.entity';
import { get, map, find, flatMap } from 'lodash'

@Controller('/')
export class Schedule {
  @Inject()
  PageService: PageService;

  @Inject()
  producer: DefaultMqttProducer;

  @InjectEntityModel(AiBotPromot)
  AiBotPromot: Repository<AiBotPromot>

  @InjectEntityModel(AiBotCustomchat)
  AiBotCustomchat: Repository<AiBotCustomchat>


  @InjectEntityModel(BaseConfig)
  BaseConfig: Repository<BaseConfig>;

  @Inject()
  ctx;

  async sendMessage(updateId, type = 'save') {
    await this.producer.publishAsync(
      `aibotk/${this.ctx.state.user.id}/gptconfig`,
      JSON.stringify({
        event: type,
        updateId
      })
    );
  }

  @Post('/saveAiBotPromot')
  async saveAiBotPromot(@Body() query: any) {
    await this.AiBotPromot.save({
      ...query,
      userId: this.ctx.state.user.id
    })
    return { code: 200, data: {} };
  }

  @Get('/delAiBotPromot/:id')
  async delAiBotPromot(@Param('id') id: any) {
    const query: any = `${id}`.split(',').map(it => {
      return {
        id: it,
        userId: this.ctx.state.user.id,
      };
    });
    await this.AiBotPromot.delete([...query]);
    return { code: 200, data: null };
  }

  @Post('/copyAiBotPromot')
  async copyAiBotPromot(@Body() query: any) {
    delete query.id
    this.saveAiBotPromot(query)
    return { code: 200, data: null };
  }


  @Get('/openApi/promot/info/:id', {ignoreGlobalPrefix: true})
  @Get('/detailAiBotPromot/:id')
  async detailAiBotPromot(@Param('id') id: any) {
    const data = await this.AiBotPromot.findOne({
      where: { id, userId: this.ctx.state.user.id },
    });
    return { code: 200, data: data };
  }

  @Post('/updateAiBotPromot')
  async updateAiBotPromot(@Body() query: any) {
    const data = this.AiBotPromot.update({
      userId: this.ctx.state.user.id,
      id: query.id
    }, {
      ...query,
      userId: this.ctx.state.user.id,
    })
    return { code: 200, data: data };
  }

  @Get('/getAiBotPromot')
  async getAiBotPromot(@Query() query) {
    const { data, count } = await this.PageService.searchWithPagination(
      this.AiBotPromot,
      'AiBotPromot',
      {
        userId: this.ctx.state.user.id
      },
      query.pageSize || 500,
      query.current || 1
    );
    return {
      code: 200,
      data: {
        list: data.map(it => it),
        count
      }
    };
  }

  @Post('/saveAiBotCustomchat')
  async saveAiBotCustomchat(@Body() query: any) {
    let aibotMap: any = new AiBotCustomchat();
    const { data } = await this.getAibotConfig(query.keywordSystemMessages)
    aibotMap = {
      ...query,
      ...aibotMap,
      keywordSystemMessages: data,
      userId: this.ctx.state.user.id,
    };
    const id = get(query, 'promotId.id', '');
    if (id) {
      const getId = await this.AiBotPromot.findOneBy(query.promotId.id);
      aibotMap.promot = getId
    }
    await this.AiBotCustomchat.save(aibotMap);
    await this.sendMessage('save')
    return { code: 200, data: {} };
  }

  @Get('/delAiBotCustomchat/:id')
  async delAiBotCustomchat(@Param('id') id: any) {
    await this.PageService.delete(this.AiBotCustomchat, id)
    await this.sendMessage(id, 'delete')

    return { code: 200, data: null };
  }

  @Get('/detailAiBotCustomchat/:id')
  async detailAiBotCustomchat(@Param('id') id: any) {
    const dataMap = await this.AiBotCustomchat.findOneBy({
      id,
      userId: this.ctx.state.user.id
    })
    const newData = dataMap
    const { data } = await this.getAibotConfig(newData.keywordSystemMessages)
    return { code: 200, data: {
      ...newData,
      keywordSystemMessages: data
    } };
  }

  @Post('/openApi/gpt/updateConfig', {ignoreGlobalPrefix: true})
  async updateAiBotConfig(@Body() query: any) {
    await this.AiBotCustomchat.update({
      userId: this.ctx.state.user.id,
      id: query.id
    }, {
      limitWord: query.limitWord,
    })
    return { code: 200, data: {} };
  }

  @Post('/updateAiBotCustomchat')
  async updateAiBotCustomchat(@Body() query: any) {
    const { data } = await this.getAibotConfig(query.keywordSystemMessages)
    const newQuery = {
      ...query,
      keywordSystemMessages: data,
      userId: this.ctx.state.user.id,
    };
    await this.AiBotCustomchat.update({
      userId: this.ctx.state.user.id,
      id: query.id
    }, newQuery)
    await this.sendMessage(query.id, 'update')

    return { code: 200, data: {} };
  }

  @Get('/reseveAiBotCustomchat/:id')
  async reseveAiBotCustomchat(@Param('id') id: any) {
    await this.AiBotCustomchat.update({
      userId: this.ctx.state.user.id,
      id
    }, {
      limitWord: 0
    })
    await this.sendMessage('update')
    return { code: 200, data: {} };
  }

  @Post('/copyAiBotCustomchat')
  async copyAiBotCustomchat(@Body() query: any) {
    const { data } = await this.getAibotConfig(query.keywordSystemMessages)
    const newQuery = {
      ...query,
      keywordSystemMessages: data,
      userId: this.ctx.state.user.id,
    };
    await this.AiBotCustomchat.save(newQuery)
    return { code: 200, data: {} };
  }

  async getAibotConfig(query) {
    const newQuery = query.filter(it => !!it.value).map(it => it.value)
    const allId = map(newQuery, 'id').map(it => {
      return {
        id: it,
        userId: this.ctx.state.user.id,
      }
    })
    const allPromotMap = await this.AiBotPromot.findBy(allId)
    return {
      data : this.findAllProtMap(query, allPromotMap),
      allPromotMap
    }
  }

  findAllProtMap(query, allPromotMap) {
    return query.map(it => {
      const id = get(it, 'promotId.id', null)
      return {
        keyword: it.keyword,
        promotId: id ? find(allPromotMap, { id }) : it.promotId
      }
    })
  }


  @Get('/openApi/gpt/config', {ignoreGlobalPrefix: true})
  @Get('/getAiBotCustomchat')
  async getAiBotCustomchat(@Query() query) {
    const { data, count } = await this.PageService.searchWithPagination(
      this.AiBotCustomchat,
      'AiBotCustomchat',
      {
        userId: this.ctx.state.user.id
      },
      query.pageSize || 1000,
      query.current || 1,
      'and',
      ['AiBotCustomchat.promotId', 'promot']
    );

    const flatKeywordSystemMessagesMap = flatMap((data || []).map(it => {
      return it.keywordSystemMessages || ''
    }))
    const { allPromotMap } = await this.getAibotConfig(flatKeywordSystemMessagesMap)

    return {
      code: 200,
      data: {
        list: data.map(item => {
          const data = item
          return {
            ...data,
            keywordSystemMessages: this.findAllProtMap(data.keywordSystemMessages, allPromotMap),
            botConfig: {
              "tts": item.tts,
              "voice": item.voice,
              "debug": item.debug,
              "model": item.model,
              "token": item.token,
              "filter": item.filter,
              "open4v": item.open4v,
              "promotId": item.promotId,
              "isAiAgent": item.isAiAgent,
              "proxyPass": item.proxyUrl,
              "timeoutMs": item.timeoutMs,
              "showQuestion": item.showQuestion,
              "showDownloadUrl": item.showDownloadUrl,
              "robotType": item.robotType,
              "keywordSystemMessages": item.keywordSystemMessages
            },
            filterConfig: {
              appId: item.filterAppid,
              secretKey: item.filterSecretKey,
              apiKey: item.filterApiKey,
            }
          }
        }),
        count
      }
    };
  }
}
