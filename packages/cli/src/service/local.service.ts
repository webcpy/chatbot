// apiResponse.ts

import { Provide } from '@midwayjs/core';
const { networkInterfaces } = require('os');

@Provide()
export class LocalIp {
  getLocalIP() {
    const interfaces = networkInterfaces();
    const addresses = [];
    for (const interfaceName of Object.keys(interfaces)) {
      for (const iface of interfaces[interfaceName]) {
        // 跳过非 IPv4 地址和环回地址
        if (iface.family === 'IPv4' && !iface.internal) {
          addresses.push(iface.address);
        }
      }
    }
    return '127.0.0.1';
  }
}
