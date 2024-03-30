// import aedes from 'aedes';
// import net from 'net';
// import { Level } from 'level';
// import aedesPersistencelevel from 'aedes-persistence-level';
const aedes = require('aedes')
const net = require('net')
const { Level } = require('level')
const aedesPersistencelevel = require('aedes-persistence-level')
//我只用到三个配置项，其他配置项有需要可以自行配置
const aedesApp = new aedes({
  persistence: aedesPersistencelevel(new Level('./mydb')),
  heartbeatInterval: 60000, //60s发送一次心跳包
});

//验证账号密码
aedesApp.authenticate = async function (client, username, password, callback) {
  const newPassword = password.toString();
  if (username === 'chatbot' && newPassword === 'chatbot') {
    callback(null, true);
  } else {
    callback(null, false);
  }
};

aedesApp.on('client', async client => {
  console.log('mqtt链接成功:', client.id);
});

aedesApp.on('clientDisconnect', async client => {
  console.log('clientDisconnect:', client.id);
});


//处理收到的消息,我们订阅所有主题收到的消息都可以通过这个事件获取(我们可以把订阅收到消息的处理函数写在上面订阅主题函数的第二个参数里面，或者统一写在下面)
aedesApp.on('publish', async function (packet, client) {
  console.log('Received message:', packet.payload.toString());
});

//创建服务器
const server = net.createServer(aedesApp.handle);
server.listen(1883, function () {
  console.log('server started and listening on port 1883');
});
