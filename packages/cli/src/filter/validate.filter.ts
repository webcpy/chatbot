// src/filter/validate.filter
import { Catch } from '@midwayjs/core';
import { MidwayValidationError } from '@midwayjs/validate';

@Catch(MidwayValidationError)
export class ValidateErrorFilter {
  async catch(err: MidwayValidationError) {
    // ...
    return {
      status: 422,
      message: '校验参数错误,' + err.message,
    };
  }
}
