import { Rule, RuleType } from '@midwayjs/validate';
import { PageDTO } from './page';
import { isArray } from 'lodash';

const type = val => {
  return RuleType.when('type', {
    is: RuleType.valid(isArray(val) ? val.join(',') : val),
    then: RuleType.string().required(),
    otherwise: RuleType.string().allow('').optional(),
  });
};
export class MaterialAddDTO {
  @Rule(RuleType.number().allow('').optional())
  materialId: number;

  @Rule(RuleType.string().required())
  name: string;

  @Rule(RuleType.string().required())
  tag: string;

  @Rule(RuleType.number().valid(1, 2, 3, 4).required())
  type: number;

  @Rule(type(1))
  content: string;

  @Rule(type(2))
  fileType: string;

  @Rule(type([2, 4]))
  url: string;

  @Rule(type([4, 5]))
  description: string;

  @Rule(type(4))
  title: string;

  @Rule(type([4, 5]))
  thumbUrl: string;

  @Rule(type(5))
  appid: string;

  @Rule(type(5))
  iconUrl: string;

  @Rule(type(5))
  pagePath: string;

  @Rule(type(5))
  username: string;
}

export class MaterialListDTO extends PageDTO {
  @Rule(RuleType.number().required())
  type: number;

  @Rule(RuleType.string().allow('').optional())
  name: string;

  @Rule(RuleType.string().allow('').optional())
  tag: string;
}
