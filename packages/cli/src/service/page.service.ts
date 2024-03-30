import { Provide, Inject } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { has } from 'lodash';
import { BaseConfig } from '../entity/baseconfig.entity';
import { GlobalTask } from '../entity/globalTask.entity';
import { Repository } from 'typeorm';
import { omit } from 'lodash';
import { Material } from '../entity/material.entity';
import { RoomTaskSchedule } from '../entity/simple.entity';

@Provide()
export class PageService {
  @Inject()
  ctx;

  jsonKey = [
    // 'names', 'ones'
  ];
  formatKeyMap = [
    // 'targets',
    // 'replys',
    // 'ones',
    // 'many',
    // 'manys',
    // 'parseMiniRooms',
    // 'acceptFriendKeyWords',
    // 'newFriendReplys',
    // 'keywordSystemMessages',
    // 'names',
    // 'cronDate',
    // 'keywords',
    // 'welcomes',
    // 'rooms',
    // 'contacts',
    // 'many',
    // 'moreData',
  ];

  @InjectEntityModel(BaseConfig)
  BaseConfig: Repository<BaseConfig>;

  @InjectEntityModel(RoomTaskSchedule)
  RoomTaskSchedule: Repository<RoomTaskSchedule>;

  @InjectEntityModel(GlobalTask)
  GlobalTask: Repository<GlobalTask>;

  @InjectEntityModel(Material)
  material: Repository<Material>;

  stringToArray(value) {
    const getKeys = this.formatKeyMap.filter(it => has(value, it));
    let formatMap = {};
    getKeys.forEach(it => {
      if (this.jsonKey.includes(it)) {
        formatMap[it] = JSON.parse(value[it] || '{}');
      } else {
        formatMap[it] = JSON.parse(value[it] || '[]');
      }
    });
    return {
      ...value,
      ...formatMap,
    };
  }

  arrayToString(value) {
    // const data = ['replys', 'keywords', 'welcomes', 'rooms', 'contacts']
    const getKeys = this.formatKeyMap.filter(it => has(value, it));
    let formatMap = {};
    getKeys.forEach(it => {
      if (this.jsonKey.includes(it)) {
        formatMap[it] = JSON.stringify(value[it] || {});
      } else {
        formatMap[it] = JSON.stringify(value[it] || []);
      }
    });
    return {
      ...value,
      ...formatMap,
    };
  }

  async getBaseConfig() {
    const data = await this.BaseConfig.findOneBy({
      userId: this.ctx.state.user.id,
    });
    return data;
  }

  async detail(entity, query, other = []) {
    const baseData = await this.getBaseConfig();
    if (!!baseData) {
      let data = await entity.findOneBy(query);
      if (other.includes('api')) {
        data = {
          ...data,
          api: this.stringToArray(data.api),
        };
      }
      return this.stringToArray(data);
    }
    return {};
  }

  async delete(entity, id) {
    const baseData = await this.getBaseConfig();
    if (!!baseData) {
      const query: any = `${id}`.split(',').map(it => {
        return {
          id: it,
          baseId: baseData.id,
        };
      });
      await entity.delete([...query]);
    }
    return {};
  }

  async getApiConfig(id) {
    const data = await this.GlobalTask.findOneBy({
      userId: this.ctx.state.user.id,
      id,
    });
    return data;
  }

  async saved(entity, query, entityClass, linkKey, type = []) {
    const data = await this.getBaseConfig();


    let saveMap: any = new entityClass();
    saveMap = {
      ...query,
      ...saveMap,
    };
    delete saveMap.friendNames

    if (type.includes('material')) {
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
      saveMap['contents'] = replys;
    }

    if (type.includes('api')) {
      const api = await this.getApiConfig(query.api);
      saveMap['api'] = api;
    }

    if (!data) {
      const parent: any = new BaseConfig();
      parent.userId = this.ctx.state.user.id;
      parent[linkKey] = [saveMap];
      await this.BaseConfig.save(parent);
    } else {
      saveMap.base = data;
      await entity.save(saveMap);
    }
    return {};
  }

  async manyUpdated(entity, query) {
    const baseData = await this.getBaseConfig();
    let roomTaskSchedule: any = new RoomTaskSchedule();
    const findQuery = (query.contents || []).map(it => {
      return {
        materialId: it.materialId,
        type: it.type
      }
    })
    roomTaskSchedule = {
      ...roomTaskSchedule,
      ...query,
    };
    if (findQuery.length > 0) {
      const contents = await this.material.findBy(findQuery);
      roomTaskSchedule.contents = contents
    }
    if (!baseData) {
      const parent: any = new BaseConfig();
      parent.userId = this.ctx.state.user.id;
      parent.roomTaskSchedule = [roomTaskSchedule];
      await this.BaseConfig.save(parent);
    } else {
      roomTaskSchedule.base = baseData;
      await this.RoomTaskSchedule.save(roomTaskSchedule);
    }
    return {};
  }

  async updated(entity, query) {
    const baseData = await this.getBaseConfig();
    if (!!baseData) {
      await entity.update({ id: query.id }, this.arrayToString(query));
    }
    return {};
  }

  async getList(entity, query, other: any = []) {
    const baseData = await this.getBaseConfig();
    if (baseData) {
      const newQuery = omit(query, ['pageSize', 'current']);
      const { data, count } = await this.searchWithPagination(
        entity,
        entity.metadata.name,
        {
          baseId: baseData.id,
          ...newQuery,
        },
        query.pageSize || 1,
        query.current || 1000,
        'and',
        other
      );
      return {
        list: data.map(it => {
          return this.stringToArray(it);
        }),
        count,
      };
    }
    return {
      list: [],
      count: 0,
    };
  }

  async searchWithPagination(
    model,
    entity: any,
    keywords: Record<string, any>,
    pageNumber: number,
    pageSize: number,
    type: string = 'and',
    other: any = []
  ) {
    let queryBuilder = model.createQueryBuilder(entity);
    if (entity == 'material') {
      queryBuilder.orderBy(`${entity}.materialId`, 'DESC')

    } else {
      queryBuilder.orderBy(`${entity}.id`, 'DESC')

    }

    if (other.length > 0) {
      queryBuilder.leftJoinAndSelect(other[0], other[1]);
    }

    Object.entries(keywords).forEach(([field, keyword], index) => {
      if (type == 'and') {
        queryBuilder.andWhere(`${entity}.${field} LIKE :keyword${index}`, {
          [`keyword${index}`]: `%${keyword}%`,
        });
      } else {
        if (field == 'userId') {
          queryBuilder.where(`${entity}.${field} LIKE :keywords${index}`, {
            [`keywords${index}`]: `%${keyword}%`,
          });
        }
      }
    });

    if (type == 'or') {
      queryBuilder.andWhere(qb => {
        Object.entries(omit(keywords, ['userId'])).forEach(
          ([field, keyword], index) => {
            if (index == 0) {
              qb.where(`${entity}.${field} LIKE :keyword${index}`, {
                [`keyword${index}`]: `%${keyword}%`,
              });
            } else {
              qb.orWhere(`${entity}.${field} LIKE :keyword${index}`, {
                [`keyword${index}`]: `%${keyword}%`,
              });
            }
          }
        );
      });
    }
    const entities = queryBuilder
      .skip((pageSize - 1) * pageNumber)
      .take(pageNumber);

    let data = await entities.getMany();
    const count = await entities.getCount();
    if (other.includes('api')) {
      data = data.map(it => {
        return {
          ...it,
          api: this.stringToArray(it.api),
        };
      });
    }
    return { data, count };
  }

  async deleteByConditions(model, conditions) {
    const whereConditions: any[] = [];

    conditions.forEach(condition => {
      const whereCondition: any = {};

      Object.entries(condition).forEach(([field, value]) => {
        whereCondition[field] = value;
      });

      whereConditions.push(whereCondition);
    });
    await model
      .createQueryBuilder()
      .delete()
      .from(model)
      .where(whereConditions)
      .execute();
  }
}
