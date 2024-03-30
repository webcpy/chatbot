// apiResponse.ts

import { Provide } from '@midwayjs/core';

@Provide()
export class ApiResponseData {
  wrap(data: any = {}, code = 200, message = 'Success') {
    return { code, data, message };
  }
}
