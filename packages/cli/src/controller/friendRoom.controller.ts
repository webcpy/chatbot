import {
  Controller,
  Post,
  Get,
  Inject,
  // ContentType,
  Query,
  Body,
  Param,
} from '@midwayjs/core';
import { Friend, Room, RoomJoinKeywords } from '../entity/friendRoom.entity';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { PageService } from '../service/page.service';
import { DefaultMqttProducer } from '@midwayjs/mqtt';
import { BaseConfig } from '../entity/baseconfig.entity';
import { v4 as uuidv4 } from 'uuid';

@Controller('/')
export class V1Controller {
  @Inject()
  PageService: PageService;

  @Inject()
  producer: DefaultMqttProducer;

  @InjectEntityModel(RoomJoinKeywords)
  RoomJoinKeywords: Repository<RoomJoinKeywords>;

  @InjectEntityModel(BaseConfig)
  BaseConfig: Repository<BaseConfig>;

  @InjectEntityModel(Friend)
  Friend: Repository<Friend>;

  @InjectEntityModel(Room)
  Room: Repository<Room>;

  @Inject()
  ctx;

  @Get('/friend')
  async getFriend(@Query() query) {
    const { data, count } = await this.PageService.searchWithPagination(
      this.Friend,
      'Friend',
      {
        userId: this.ctx.state.user.id,
        name: query.name || '',
        alias: query.alias || '',
      },
      query.pageSize || 50,
      query.current || 1
    );
    return {
      code: 200,
      data: { list: data, count: count },
    };
  }

  @Get('/friends')
  async friends(@Query() query) {
    const { data, count } = await this.PageService.searchWithPagination(
      this.Friend,
      'Friend',
      {
        userId: this.ctx.state.user.id,
        name: query.name || '',
        alias: query.alias || '',
      },
      query.pageSize || 50,
      query.current || 1,
      'or'
    );
    return {
      code: 200,
      data: { list: data, count: count },
    };
  }

  @Get('/room')
  async getRoom(@Query() query) {
    const { data, count } = await this.PageService.searchWithPagination(
      this.Room,
      'Room',
      {
        userId: this.ctx.state.user.id,
        name: query.name || '',
      },
      query.pageSize || 50,
      query.current || 1
    );
    return {
      code: 200,
      data: { list: data, count: count },
    };
  }

  @Post('/synchronize')
  async synchronize(@Body() query) {
    if (query.event == 'reloadFriendOnly') {
      await this.Friend.delete({
        userId: this.ctx.state.user.id,
      });
    } else {
      await this.Room.delete({
        userId: this.ctx.state.user.id,
      });
    }

    await this.producer.publishAsync(
      `aibotk/${this.ctx.state.user.id}/event`,
      JSON.stringify(query)
    );

    return {
      code: 200,
      data: { list: [], count: 0 },
    };
  }

  @Post('/openApi/wechat/friend', { ignoreGlobalPrefix: true })
  async addFriend(@Body('friend') friend) {
    for (const item of friend) {
      // 判断是否已经添加
      const data = await this.Friend.findOneBy({
        userId: this.ctx.state.user.id,
        name: item.name,
      });
      if (!data) {
        await this.Friend.save({
          ...item,
          userId: this.ctx.state.user.id,
        });
      } else {
        await this.Friend.update(
          {
            name: item.name,
            userId: this.ctx.state.user.id,
          },
          {
            wxid: item.wxid,
          }
        );
      }
    }

    return {
      code: 200,
      data: {},
    };
  }

  @Post('/openApi/wechat/room', { ignoreGlobalPrefix: true })
  async addRoom(@Body('room') room) {
    for (const item of room) {
      const data = await this.Room.findOneBy({
        userId: this.ctx.state.user.id,
        topic: item.topic,
      });
      if (!data) {
        await this.Room.save({
          ...item,
          userId: this.ctx.state.user.id,
          uniqueId: uuidv4(),
          name: item.topic,
        });
      } else {
        await this.Room.update(
          {
            name: item.name,
            userId: this.ctx.state.user.id,
          },
          {
            roomId: item.roomId
          }
        );
      }
    }
    await this.Room.save(
      room.map(it => {
        return {
          ...it,
          userId: this.ctx.state.user.id,
          uniqueId: uuidv4(),
          name: it.topic,
        };
      })
    );
    return {
      code: 200,
      data: {},
    };
  }

  @Post('/contact/say')
  async say(@Body() query) {
    await this.producer.publishAsync(
      `aibotk/${this.ctx.state.user.id}/say`,
      JSON.stringify(query)
    );

    return {
      code: 200,
      data: { list: [], count: 0 },
    };
  }

  async getBaseConfig() {
    const data = await this.BaseConfig.findOneBy({
      userId: this.ctx.state.user.id,
    });
    return data;
  }

  @Post('/saveRoomJoinKeywords')
  async saveRoomJoinKeywords(@Body() query: any) {
    await this.PageService.saved(
      this.RoomJoinKeywords,
      query,
      RoomJoinKeywords,
      'roomJoinKeywords'
    );
    await this.producer.publishAsync(
      `aibotk/${this.ctx.state.user.id}/event`,
      JSON.stringify({
        target: 'roomJoinKeywords',
      })
    );
    return { code: 200, data: {} };
  }

  @Get('/delRoomJoinKeywords/:id')
  async delRoomJoinKeywords(@Param('id') id: any) {
    await this.PageService.delete(this.RoomJoinKeywords, id);
    await this.producer.publishAsync(
      `aibotk/${this.ctx.state.user.id}/event`,
      JSON.stringify({
        target: 'roomJoinKeywords',
      })
    );
    return { code: 200, data: null };
  }

  @Get('/detailRoomJoinKeywords/:id')
  async detailRoomJoinKeywords(@Param('id') id: any) {
    const data = await this.PageService.detail(this.RoomJoinKeywords, {
      id,
    });
    return { code: 200, data };
  }

  @Post('/updateRoomJoinKeywords')
  async updateRoomJoinKeywords(@Body() query: any) {
    const data = this.PageService.updated(this.RoomJoinKeywords, query);
    await this.producer.publishAsync(
      `aibotk/${this.ctx.state.user.id}/event`,
      JSON.stringify({
        target: 'roomJoinKeywords',
      })
    );
    return { code: 200, data: data };
  }

  @Get('/openApi/getRoomJoinKeywords', { ignoreGlobalPrefix: true })
  async openApiGetRoomJoinKeywords(@Query() query) {
    const baseConfig: any = await this.PageService.getBaseConfig()
    let data: any = []
    if (baseConfig) {
      data = baseConfig.roomJoinKeywords
    }
    return {
      code: 200,
      data,
    };
  }

  @Get('/getRoomJoinKeywords')
  async getRoomJoinKeywords(@Query() query) {
    const data = await this.PageService.getList(this.RoomJoinKeywords, query);
    return {
      code: 200,
      data,
    };
  }
}
