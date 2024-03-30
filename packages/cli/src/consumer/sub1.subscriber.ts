// src/consumer/sub1.subscriber.ts
import { Inject } from '@midwayjs/core';
import { Context, IMqttSubscriber, MqttSubscriber } from '@midwayjs/mqtt';

@MqttSubscriber('test')
export class Sub1Subscriber implements IMqttSubscriber {

  @Inject()
  ctx: Context;

  async subscribe() {
    console.log(this.ctx.message.toString())
    // ...
  }
}
