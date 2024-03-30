import { Controller, Get } from '@midwayjs/core';
import { ApiExcludeController } from '@midwayjs/swagger';

@ApiExcludeController()
@Controller('/home', {ignoreGlobalPrefix: true})
export class HomeController {
  @Get('/')
  async home(): Promise<string> {
    return 'Hello Midwayjs!';
  }
}
