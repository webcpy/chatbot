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
import { PrivateForwards, RoomAsyncList, CallBackEvents } from '../entity/vip.entity';
import { Friend, Room, BatchSend } from '../entity/friendRoom.entity';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { PageService } from '../service/page.service';
import { DefaultMqttProducer } from '@midwayjs/mqtt';
import { BaseConfig } from '../entity/baseconfig.entity';
import { pickBy, isString } from 'lodash'

@Controller('/')
export class V1Controller {
  @Inject()
  PageService: PageService;

  @Inject()
  producer: DefaultMqttProducer;

  @InjectEntityModel(PrivateForwards)
  PrivateForwards: Repository<PrivateForwards>

  @InjectEntityModel(RoomAsyncList)
  RoomAsyncList: Repository<RoomAsyncList>

  @InjectEntityModel(CallBackEvents)
  CallBackEvents: Repository<CallBackEvents>


  @InjectEntityModel(BaseConfig)
  BaseConfig: Repository<BaseConfig>;

  @InjectEntityModel(BatchSend)
  BatchSend: Repository<BatchSend>;

  @InjectEntityModel(Friend)
  Friend: Repository<Friend>;

  @InjectEntityModel(Room)
  Room: Repository<Room>;

  @Inject()
  ctx;


  @Post('/saveBatchSend')
  async saveBatchSend(@Body() query: any) {
    await this.BatchSend.save({
      ...query,
      groups: query.groups || [],
      userId: this.ctx.state.user.id
    })
    return { code: 200, data: {} };
  }

  @Get('/delBatchSend/:id')
  async delBatchSend(@Param('id') id: any) {
    await this.BatchSend.delete(id.split(','))
    return { code: 200, data: null };
  }

  @Get('/openApi/rss/config', { ignoreGlobalPrefix: true })
  async getRssConfig() {
    return {
      code: 200,
      data: [],
    };
  }

  @Get('/detailBatchSend/:id')
  async detailBatchSend(@Param('id') id: any) {
    const data: any = await this.BatchSend.findOneBy({id})
    return { code: 200, data: {
      ...data,
      groups: data.group || [],
    } };
  }

  @Post('/updateBatchSend')
  async updateBatchSend(@Body() query: any) {
    const data = await this.BatchSend.update({
      userId: this.ctx.state.user.id,
      id: query.id
    }, {
      ...query,
      groups: query.groups || [],
    })
    return { code: 200, data: data };
  }

  @Post('/batch/send')
  async batchsend(@Body() query: any) {
    await this.producer.publishAsync(`aibotk/${this.ctx.state.user.id}/multisay`, JSON.stringify(query));
    return { code: 200, data: {} };
  }

  @Post('/event/send')
  async eventSend(@Body() query: any) {
    await this.producer.publishAsync(`aibotk/${this.ctx.state.user.id}/event`, JSON.stringify({
      ...query,
      ...query.names
    }));
    return { code: 200, data: {} };
  }

  @Get('/getBatchSend')
  async getBatchSend(@Query() query) {
    const { data, count } = await this.PageService.searchWithPagination(
      this.BatchSend,
      'BatchSend',
      pickBy({
        type: query.type,
        userId: this.ctx.state.user.id,
      }, isString),
      query.pageSize,
      query.current
    );
    return {
      code: 200,
      data: {
        list: data.map(it => {
          return {
            ...it,
            groups: it.groups || [],
          }
        }),
        count
      }
    };
  }

  @Post('/savePrivateForwards')
  async savePrivateForwards(@Body() query: any) {
    await this.PageService.saved(this.PrivateForwards, query, PrivateForwards,  'PrivateForwards')
    await this.producer.publishAsync(
      `aibotk/${this.ctx.state.user.id}/event`,
      JSON.stringify({
        target: 'privateForwards',
      })
    );
    return { code: 200, data: {} };
  }

  @Get('/delPrivateForwards/:id')
  async delKeywords(@Param('id') id: any) {
    await this.PageService.delete(this.PrivateForwards, id)
    await this.producer.publishAsync(
      `aibotk/${this.ctx.state.user.id}/event`,
      JSON.stringify({
        target: 'privateForwards',
      })
    );
    return { code: 200, data: null };
  }

  @Get('/detailPrivateForwards/:id')
  async detailKeywords(@Param('id') id: any) {
    const data = await this.PageService.detail(this.PrivateForwards, {
      id
    })

    return { code: 200, data };
  }

  @Post('/updatePrivateForwards')
  async updateKeywords(@Body() query: any) {
    const data = this.PageService.updated(this.PrivateForwards, query)
    await this.producer.publishAsync(
      `aibotk/${this.ctx.state.user.id}/event`,
      JSON.stringify({
        target: 'privateForwards',
      })
    );
    return { code: 200, data: data };
  }

  @Get('/getPrivateForwards')
  async getPrivateForwards(@Query() query) {
    const data = await this.PageService.getList(this.PrivateForwards, query)
    return {
      code: 200,
      data
    };
  }

  @Post('/saveRoomAsyncList')
  async saveRoomAsyncList(@Body() query: any) {
    await this.PageService.saved(this.RoomAsyncList, query, RoomAsyncList,  'RoomAsyncList')
    await this.producer.publishAsync(
      `aibotk/${this.ctx.state.user.id}/event`,
      JSON.stringify({
        target: 'roomAsyncList',
      })
    );
    return { code: 200, data: {} };
  }

  @Get('/delRoomAsyncList/:id')
  async delRoomAsyncList(@Param('id') id: any) {
    await this.PageService.delete(this.RoomAsyncList, id)
    await this.producer.publishAsync(
      `aibotk/${this.ctx.state.user.id}/event`,
      JSON.stringify({
        target: 'roomAsyncList',
      })
    );
    return { code: 200, data: null };
  }

  @Get('/detailRoomAsyncList/:id')
  async detailRoomAsyncList(@Param('id') id: any) {
    const data = await this.PageService.detail(this.RoomAsyncList, {
      id
    })
    return { code: 200, data };
  }

  @Post('/updateRoomAsyncList')
  async updateRoomAsyncList(@Body() query: any) {
    const data = this.PageService.updated(this.RoomAsyncList, query)
    await this.producer.publishAsync(
      `aibotk/${this.ctx.state.user.id}/event`,
      JSON.stringify({
        target: 'roomAsyncList',
      })
    );
    return { code: 200, data: data };
  }

  @Get('/getRoomAsyncList')
  async getRoomAsyncList(@Query() query) {
    const data = await this.PageService.getList(this.RoomAsyncList, query)
    return {
      code: 200,
      data
    };
  }

  @Post('/saveCallBackEvents')
  async saveCallBackEvents(@Body() query: any) {
    await this.PageService.saved(this.CallBackEvents, query, CallBackEvents,  'CallBackEvents', ['api'])
    await this.producer.publishAsync(
      `aibotk/${this.ctx.state.user.id}/event`,
      JSON.stringify({
        target: 'callBackEvents',
      })
    );
    return { code: 200, data: {} };
  }

  @Get('/delCallBackEvents/:id')
  async delCallBackEvents(@Param('id') id: any) {
    await this.PageService.delete(this.CallBackEvents, id)
    await this.producer.publishAsync(
      `aibotk/${this.ctx.state.user.id}/event`,
      JSON.stringify({
        target: 'callBackEvents',
      })
    );
    return { code: 200, data: null };
  }

  @Get('/detailCallBackEvents/:id')
  async detailCallBackEvents(@Param('id') id: any) {
    const data = await this.PageService.detail(this.CallBackEvents, {
      id
    }, ['api'])
    return { code: 200, data };
  }

  @Post('/updateCallBackEvents')
  async updateCallBackEvents(@Body() query: any) {
    const data = this.PageService.updated(this.CallBackEvents, query)
    await this.producer.publishAsync(
      `aibotk/${this.ctx.state.user.id}/event`,
      JSON.stringify({
        target: 'callBackEvents',
      })
    );
    return { code: 200, data: data };
  }

  @Get('/getCallBackEvents')
  async getCallBackEvents(@Query() query) {
    const data = await this.PageService.getList(this.CallBackEvents, query, ["CallBackEvents.api", "apis"])
    return {
      code: 200,
      data
    };
  }
}
