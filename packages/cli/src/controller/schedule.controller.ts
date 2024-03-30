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
// import { pickBy, isString } from 'lodash'
import { Material } from '../entity/material.entity'
import { DayTaskSchedule, CountDownTaskSchedule, CustomContent, RoomNewsSchedule } from '../entity/schedule.entity'
import { RoomTaskSchedule } from '../entity/simple.entity';

@Controller('/')
export class Schedule {
  @Inject()
  PageService: PageService;

  @Inject()
  producer: DefaultMqttProducer;

  @InjectEntityModel(RoomNewsSchedule)
  RoomNewsSchedule: Repository<RoomNewsSchedule>

  // @InjectEntityModel(TextConfig)
  // SimpleConfig: Repository<TextConfig>

  @InjectEntityModel(RoomTaskSchedule)
  RoomTaskSchedule: Repository<RoomTaskSchedule>

  @InjectEntityModel(CustomContent)
  CustomContent: Repository<CustomContent>


  @InjectEntityModel(DayTaskSchedule)
  DayTaskSchedule: Repository<DayTaskSchedule>

  @InjectEntityModel(CountDownTaskSchedule)
  CountDownTaskSchedule: Repository<CountDownTaskSchedule>


  @InjectEntityModel(BaseConfig)
  BaseConfig: Repository<BaseConfig>;

  @InjectEntityModel(Material)
  material: Repository<Material>;

  @Inject()
  ctx;

  async updateShader(query: any, target = 'updateSchedule') {
    await this.producer.publishAsync(
      `aibotk/${this.ctx.state.user.id}/event`,
      JSON.stringify({
        target,
        query
      })
    );
  }

  @Post('/saveDayTaskSchedule')
  async saveDayTaskSchedule(@Body() query: any) {
    await this.PageService.saved(this.DayTaskSchedule, query, DayTaskSchedule,  'DayTaskSchedule')
    await this.updateShader('dayTaskSchedule')
    return { code: 200, data: {} };
  }

  @Get('/delDayTaskSchedule/:id')
  async delDayTaskSchedule(@Param('id') id: any) {
    await this.PageService.delete(this.DayTaskSchedule, id)
    await this.updateShader('dayTaskSchedule')

    return { code: 200, data: null };
  }

  @Get('/detailDayTaskSchedule/:id')
  async detailDayTaskSchedule(@Param('id') id: any) {
    const data = await this.PageService.detail(this.DayTaskSchedule, {
      id
    })
    return { code: 200, data };
  }

  @Post('/updateDayTaskSchedule')
  async updateDayTaskSchedule(@Body() query: any) {
    const data = this.PageService.updated(this.DayTaskSchedule, query)
    await this.updateShader('dayTaskSchedule')

    return { code: 200, data: data };
  }

  @Get('/getDayTaskSchedule')
  async getDayTaskSchedule(@Query() query) {
    const data = await this.PageService.getList(this.DayTaskSchedule, query)
    return {
      code: 200,
      data
    };
  }

  @Get('/openApi/task', {ignoreGlobalPrefix: true})
  @Get('/task')
  async task(@Query() query) {
    return { code: 200, data: [] };
  }

  @Post('/saveCountDownTaskSchedule')
  async saveCountDownTaskSchedule(@Body() query: any) {
    await this.PageService.saved(this.CountDownTaskSchedule, query, CountDownTaskSchedule,  'CountDownTaskSchedule')
    await this.updateShader('countDownTaskSchedule')

    return { code: 200, data: {} };
  }

  @Get('/delCountDownTaskSchedule/:id')
  async delCountDownTaskSchedule(@Param('id') id: any) {
    await this.PageService.delete(this.CountDownTaskSchedule, id)
    await this.updateShader('countDownTaskSchedule')

    return { code: 200, data: null };
  }

  @Get('/detailCountDownTaskSchedule/:id')
  async detailCountDownTaskSchedule(@Param('id') id: any) {
    const data = await this.PageService.detail(this.CountDownTaskSchedule, {
      id
    })
    return { code: 200, data };
  }

  @Post('/updateCountDownTaskSchedule')
  async updateCountDownTaskSchedule(@Body() query: any) {
    const data = this.PageService.updated(this.CountDownTaskSchedule, query)
    await this.updateShader('countDownTaskSchedule')

    return { code: 200, data: data };
  }

  @Get('/getCountDownTaskSchedule')
  async getCountDownTaskSchedule(@Query() query) {
    const data = await this.PageService.getList(this.CountDownTaskSchedule, query)
    return {
      code: 200,
      data
    };
  }

  @Post('/saveRoomNewsSchedule')
  async saveRoomNewsSchedule(@Body() query: any) {
    await this.PageService.saved(this.RoomNewsSchedule, query, RoomNewsSchedule,  'RoomNewsSchedule')
    await this.updateShader('roomNewsSchedule')

    return { code: 200, data: {} };
  }

  @Get('/delRoomNewsSchedule/:id')
  async delRoomNewsSchedule(@Param('id') id: any) {
    await this.PageService.delete(this.RoomNewsSchedule, id)
    await this.updateShader('roomNewsSchedule')

    return { code: 200, data: null };
  }

  @Get('/detailRoomNewsSchedule/:id')
  async detailRoomNewsSchedule(@Param('id') id: any) {
    const data = await this.PageService.detail(this.RoomNewsSchedule, {
      id
    })
    return { code: 200, data };
  }

  @Post('/updateRoomNewsSchedule')
  async updateRoomNewsSchedule(@Body() query: any) {
    const data = this.PageService.updated(this.RoomNewsSchedule, query)
    await this.updateShader('roomNewsSchedule')

    return { code: 200, data: data };
  }

  @Get('/getRoomNewsSchedule')
  async getRoomNewsSchedule(@Query() query) {
    const data = await this.PageService.getList(this.RoomNewsSchedule, query)
    return {
      code: 200,
      data
    };
  }

  async getBaseConfig() {
    const data = await this.BaseConfig.findOneBy({
      userId: this.ctx.state.user.id,
    });
    return data;
  }

  @Post('/saveRoomTaskSchedule')
  async saveRoomTaskSchedule(@Body() query: any) {
    await this.PageService.saved(this.RoomTaskSchedule, query, RoomTaskSchedule,  'RoomTaskSchedule', ['material'])
    await this.updateShader('roomTaskSchedule')

    return { code: 200, data: {} };
  }

  @Get('/delRoomTaskSchedule/:id')
  async delRoomTaskSchedule(@Param('id') id: any) {
    await this.PageService.delete(this.RoomTaskSchedule, id)
    await this.updateShader('roomTaskSchedule')

    return { code: 200, data: null };
  }

  @Get('/detailRoomTaskSchedule/:id')
  async detailRoomTaskSchedule(@Param('id') id: any) {
    const data = await this.PageService.detail(this.RoomTaskSchedule, {
      id
    })

    return { code: 200, data };
  }

  @Post('/updateRoomTaskSchedule')
  async updateRoomTaskSchedule(@Body() query: any) {
    const data = this.PageService.manyUpdated(this.RoomTaskSchedule, query)
    await this.updateShader('roomTaskSchedule')

    return { code: 200, data: data };
  }

  @Get('/getRoomTaskSchedule')
  async getRoomTaskSchedule(@Query() query) {
    const data = await this.PageService.getList(this.RoomTaskSchedule, query, ['RoomTaskSchedule.contents', 'contents'])
    return {
      code: 200,
      data
    };
  }

  @Post('/saveCustomContent')
  async saveCustomContent(@Body() query: any) {
    await this.PageService.saved(this.CustomContent, query, CustomContent,  'CustomContent')
    await this.updateShader('customContent', 'updateScheduleCustom')

    return { code: 200, data: {} };
  }

  @Get('/delCustomContent/:id')
  async delCustomContent(@Param('id') id: any) {
    await this.PageService.delete(this.CustomContent, id)
    await this.updateShader('customContent', 'updateScheduleCustom')

    return { code: 200, data: null };
  }

  @Get('/detailCustomContent/:id')
  async detailCustomContent(@Param('id') id: any) {
    const data = await this.PageService.detail(this.CustomContent, {
      id
    })
    return { code: 200, data };
  }

  @Post('/updateCustomContent')
  async updateCustomContent(@Body() query: any) {
    const data = this.PageService.updated(this.CustomContent, query)
    await this.updateShader('customContent', 'updateScheduleCustom')

    return { code: 200, data: data };
  }

  @Get('/openApi/user/task', {ignoreGlobalPrefix: true})
  @Get('/getCustomContent')
  async getCustomContent(@Query() query) {
    const data = await this.PageService.getList(this.CustomContent, query, ["CustomContent.api", "apis"])
    return {
      code: 200,
      data
    };
  }
}
