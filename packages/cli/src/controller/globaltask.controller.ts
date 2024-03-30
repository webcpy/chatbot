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
import { GlobalTask } from '../entity/globalTask.entity'
// import { pickBy, isString } from 'lodash'

@Controller('/')
export class Schedule {
  @Inject()
  PageService: PageService;

  @Inject()
  producer: DefaultMqttProducer;


  @InjectEntityModel(GlobalTask)
  GlobalTask: Repository<GlobalTask>;

  @Inject()
  ctx;

  @Post('/saveGlobalTask')
  async saveGlobalTask(@Body() query: any) {
    await this.GlobalTask.save({
      ...query,
      userId: this.ctx.state.user.id
    })
    return { code: 200, data: {} };
  }

  @Get('/delGlobalTask/:id')
  async delGlobalTask(@Param('id') id: any) {
    const query: any = `${id}`.split(',').map(it => {
      return {
        id: it,
        userId: this.ctx.state.user.id,
      };
    });
    await this.GlobalTask.delete([...query]);
    return { code: 200, data: null };
  }

  @Get('/openApi/detailGlobalTask/:id', {ignoreGlobalPrefix: true})
  @Get('/detailGlobalTask/:id')
  async detailGlobalTask(@Param('id') id: any) {
    const data = await this.GlobalTask.findOne({
      where: { id, userId: this.ctx.state.user.id },
    });
    return { code: 200, data };
  }

  @Post('/updateGlobalTask')
  async updateGlobalTask(@Body() query: any) {
    const data = this.GlobalTask.update({
      userId: this.ctx.state.user.id,
      id: query.id
    }, {
      ...query,
      userId: this.ctx.state.user.id,
    })
    return { code: 200, data: data };
  }

  @Get('/getGlobalTask')
  async getGlobalTask(@Query() query) {
    const { data, count } = await this.PageService.searchWithPagination(
      this.GlobalTask,
      'GlobalTask',
      {
        userId: this.ctx.state.user.id
      },
      query.pageSize || 500,
      query.current || 1
    );
    return {
      code: 200,
      data: {
        list: data,
        count
      }
    };
  }
}
