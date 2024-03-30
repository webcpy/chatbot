import { Rule, RuleType } from '@midwayjs/validate';

export class PageDTO {
  @Rule(RuleType.number().required())
  pageSize: number;

  @Rule(RuleType.number().required())
  current: number;
}
