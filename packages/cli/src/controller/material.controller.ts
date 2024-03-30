import {
  Inject,
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
} from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { UserService } from '../service/user.service';
import { PageService } from '../service/page.service';
import { ApiExcludeController } from '@midwayjs/swagger';
import { MaterialAddDTO, MaterialListDTO } from '../dto/material';
import { Material } from '../entity/material.entity';
import { Repository } from 'typeorm';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { classToPlain } from 'class-transformer';
import { omitBy, isNull } from 'lodash';

@ApiExcludeController()
@Controller('/material', {ignoreGlobalPrefix: true})
export class APIController {
  @InjectEntityModel(Material)
  materialModel: Repository<Material>;

  @Inject()
  ctx: Context;

  @Inject()
  userService: UserService;

  @Inject()
  PageService: PageService;

  @Post('/rich/add')
  async richAdd(@Body() query: MaterialAddDTO) {
    try {
      let materialQuery = classToPlain(query);
      if (query.materialId) {
        const updata = await this.materialModel.findOne({
          where: {
            materialId: query.materialId,
            userId: this.ctx.state.user.id,
          },
        });
        materialQuery = {
          ...updata,
          ...materialQuery,
        };
      }
      await this.materialModel.save({
        ...materialQuery,
        userId: this.ctx.state.user.id,
      });
      return { code: 200, message: 'OK', data: {} };
    } catch (ex) {
      return {
        code: -1,
        data: null,
        message: ex.code,
      };
    }
  }

  @Get('/list')
  async list(@Query() query: MaterialListDTO) {
    const { data, count } = await this.PageService.searchWithPagination(
      this.materialModel,
      'material',
      {
        type: query.type,
        tag: query.tag || '',
        userId: this.ctx.state.user.id,
        name: query.name || '',
      },
      query.pageSize,
      query.current
    );
    return {
      code: 200,
      message: 'OK',
      data: {
        list: data.map(it => {
          const result = omitBy(it, isNull);

          return {
            ...result,
            tag: it.tag,
          };
        }),
        count,
      },
    };
  }

  @Get('/detail/:materialId')
  async detail(@Param('materialId') materialId: number) {
    const data: any = await this.materialModel.findOneBy( { materialId, userId: this.ctx.state.user.id });
    const detail = omitBy(data, isNull);
    return {
      code: 200,
      message: 'OK',
      data: {
        ...detail,
        tag: data.tag,
      },
    };
  }

  @Get('/remove/:materialId')
  async remove(@Param('materialId') materialId: any) {
    const query: any = `${materialId}`.split(',').map(it => {
      return {
        materialId: it,
        userId: this.ctx.state.user.id,
      };
    });
    await this.materialModel.delete([...query]);
    return {
      code: 200,
      message: 'OK',
      data: {},
    };
  }
}
