import { setLocalSchedule, delay, cancelAllSchedule } from "../lib/index";
// import { allConfig } from "../db/configDb";
import { Container } from 'typedi'
import { BaseConfig } from '../db/repositories/BaseConfig'
import { getScheduleList, updateSchedule, getCallbackApi } from "../proxy/chetbot";
import {
  getNewsContent, getEveryDayContent, roomSay, getRoomEveryDayContent, contactSay, getCountDownContent, getCustomContent
} from "../utils/index";
// import globalConfig from '../config'

const typeMap: any = {
  contact: "用户名", room: "群名"
};

/**
 * 查找发送的目标
 * type: contact  room
 * name: 目标名称
 * alias: 别名
 * wxid: wxid
 */
async function findTarget({ that, type, name, alias, wxid = "" }: any) {
  let target = null;
  if (type === "contact") {
    target = wxid && that.Contact.find({ id: wxid }) || name && (await that.Contact.find({ name: name })) || alias && (await that.Contact.find({ alias: alias })); // 获取你要发送的联系人
  } else {
    target = wxid && that.Room.find({ id: wxid }) || name && (await that.Room.find({ topic: name })); // 获取你要发送的群组
  }
  return target;
}

/**
 * 设置定时任务
 * @param that
 * @param item
 * @param name
 * @param callback
 * @return {Promise<void>}
 */
async function setTask(that: any, item: any, name: any, callback: any) {
  try {
    item = {
      ...item,
      ...item.names
    }
    let time = item.date;
    item.type = item.type ? item.type : "contact";
    const target = await findTarget({
      that, type: item.type, name: item.roomName || item.name, alias: item.alias || "", wxid: item.wxid || ""
    });
    if (!target) {
      log.fail(`查找不到${typeMap[item.type]}：${item.roomName || item.name}`);
    } else {
      log.success(`${typeMap[item.type]}：“${item.roomName || item.name}”设置定时任务成功`);
      setLocalSchedule(time, callback.bind(null, { that, target, item }), name);
    }
  } catch (error) {
    log.fail("设置自定义定时任务失败：", error);
  }
}

/**
 * 发送自定义内容
 * @param that
 * @param target
 * @param item
 * @param isMulti 是否多个目标
 * @param targets 发送的多个目标
 * @return {Promise<void>}
 */
const sendCustom = async ({ that, target, item, isMulti, targets }: any) => {
  for (let reply of item.contents) {
    log.success(["定时任务开始发送，内容：", `${reply.type === 1 ? reply.content : reply.url}`]);
    await delay(1000);
    if (item.type === "room") {
      if (!isMulti) {
        await roomSay.call(that, target, "", reply);
      } else {
        for (let single of targets) {
          try {
            await roomSay.call(that, single, "", reply);
            if (item.delay) {
              await delay(item.delay);
            } else {
              await delay(1000);
            }
          } catch (e) {
            log.fail(`定时任务失败，可能群已经解散或者好友不存在: ${e}`);
          }
        }
      }
    } else {
      if (!isMulti) {
        await contactSay.call(that, target, reply);
      } else {
        for (let single of targets) {
          try {
            await contactSay.call(that, single, reply);
            if (item.delay) {
              await delay(item.delay);
            } else {
              await delay(1000);
            }
          } catch (e) {
            log.success(`定时任务失败，可能群已经解散或者好友不存在: ${e}`);
          }
        }
      }
    }
  }
};

/**
 * 发送新闻资讯
 * @param that
 * @param target
 * @param item
 * @param isMulti 是否多个目标
 * @param targets 发送的多个目标
 * @return {Promise<void>}
 */
const sendNews = async ({ target, item, isMulti, targets }: any) => {
  let content = await getNewsContent(item.sortId, item.endWord, item.num || 10);
  log.success("新闻资讯开始发送，内容：", content);
  await delay(200);
  if (!isMulti) {
    await target.say(content);
  } else {
    for (let single of targets) {
      try {
        await single.say(content);
        if (item.delay) {
          await delay(item.delay);
        } else {
          await delay(1000);
        }
      } catch (e) {
        log.fail(`定时任务失败，可能群已经解散或者好友不存在: ${e}`);
      }
    }
  }
};


/**
 * 发送自定义定制内容
 * @param that
 * @param target
 * @param type 类型 room contact
 * @param item
 * @param isMulti 是否多个目标
 * @param targets 发送的多个目标
 * @return {Promise<void>}
 */
const sendCustomContent = async ({ target, type, item, isMulti, targets }: any) => {
  let contents = await getCustomContent(item.sortId);
  log.success("定制内容发送", contents);

  if (!isMulti) {
    for(const reply of contents) {
      await contactSay(target, reply)
      await delay(200)
    }
  } else {
    for (let single of targets) {
      try {
        for(const reply of contents) {
          type === 'room' ? await roomSay(single, '', reply): await contactSay(single, reply)
          await delay(200)
        }
        if (item.delay) {
          await delay(item.delay);
        } else {
          await delay(800);
        }
      } catch (e) {
        log.success(`定时任务失败，可能群已经解散或者好友不存在: ${e}`);
      }
    }
  }
};

/**
 * 发送自定义API内容
 * @param that
 * @param target
 * @param type 类型 room contact
 * @param item
 * @param isMulti 是否多个目标
 * @param targets 发送的多个目标
 * @return {Promise<void>}
 */
const sendCustomApi = async ({ target, type, item, isMulti, targets }: any) => {
  let contents: any = await getCallbackApi(item.id );
  log.success("定制内容发送", contents);

  if (!isMulti) {
    for(const reply of contents) {
      await contactSay(target, reply)
      await delay(200)
    }
  } else {
    for (let single of targets) {
      try {
        for(const reply of contents) {
          type === 'room' ? await roomSay(single, '', reply): await contactSay(single, reply)
          await delay(200)
        }
        if (item.delay) {
          await delay(item.delay);
        } else {
          await delay(800);
        }
      } catch (e) {
        log.fail(`定时任务失败，可能群已经解散或者好友不存在: ${e}`);
      }
    }
  }
};


/**
 * 发送每日说
 * @param that
 * @param target
 * @param item
 * @return {Promise<void>}
 */
const sendEveryDay = async ({ target, item }: any) => {
  let content = "";
  if (item.type === "room") {
    content = await getRoomEveryDayContent(item.memorialDay, item.city, item.endWord);
  } else {
    content = await getEveryDayContent(item.memorialDay, item.city, item.endWord);
  }
  log.success(["每日说任务开始工作,发送内容：", content]);
  await delay(1000);
  await target.say(content);
};

/**
 * 发送倒计时
 * @param that
 * @param target
 * @param item
 * @param isMulti 是否多个目标
 * @param targets 发送的多个目标
 * @return {Promise<void>}
 */
const sendCountDown = async ({ target, item, isMulti, targets }: any) => {
  let content = await getCountDownContent(item.memorialDay, item.prefix, item.suffix, item.endWord);
  log.success(["倒计时任务开始工作,发送内容：", content]);
  await delay(1000);
  if (!isMulti) {
    await target.say(content);
  } else {
    for (let single of targets) {
      try {
        await single.say(content);
        if (item.delay) {
          await delay(item.delay);
        } else {
          await delay(1000);
        }
      } catch (e) {
        log.fail(`定时任务失败，可能群已经解散或者好友不存在，不影响其他群发消息: ${e}`);
      }
    }
  }
};

/**
 * 立即发送群消息
 * @param {*} that bot对象
 * @param {*} item 任务项  { target: 'Room', event: '', message: { roomName: '', type: 'news 新闻 ||task 定时任务', contents: [] } }
 */
async function sendTaskMessage(that: any, info: { messages: any; event: string; }) {
  try {
    const item = info.messages;
    item.type = item.type ? item.type : "room";
    const itemName = item.names || {}
    const target = await findTarget({
      that, type: item.type, name: itemName.roomName || itemName.name, alias: itemName.alias || "", wxid: itemName.wxid || ""
    });
    if (!target) {
      log.fail(`查找不到${typeMap[item.type]}：${itemName.roomName || itemName.name}`);
    } else {
      if (info.event === "roomNews" || info.event === "news") {
        await sendNews({ that, target, item });
      } else if (info.event === "roomTask" || info.event === "custom") {
        await sendCustom({ that, target, item });
      } else if (info.event === "wechatEveryday") {
        await sendEveryDay({ that, target, item });
      } else if (info.event === "countdown") {
        await sendCountDown({ that, target, item });
      }
    }
  } catch (error) {
    log.fail(["发送定时任务失败：", error]);
  }
}



/**
 * 设置定时任务
 * @param {*} that bot 对象
 * @param {*} item 定时任务项
 */
async function setScheduleTask(that: any, item: any, name: any) {
  try {
    let time = item.isLoop ? item.time : new Date(item.time);
    setLocalSchedule(time, async () => {
      try {
        let contact = await that.Contact.find({ name: item.subscribe });
        if (contact) {
          log.success(`${item.subscribe}的专属提醒开启啦！`);
          await contact.say(item.content);
        } else {
          log.fail(`没有找到联系人：${item.subscribe}`);
        }
        if (!item.isLoop) {
          await updateSchedule(item.id);
        }
      } catch (error) {
        log.fail(["设置定时任务错误", error]);
      }
    }, name);
  } catch (e) {
    log.fail(["setScheduleTask error", e]);
  }
}

/**
 * 初始化提醒任务
 * @param {}} that
 */
async function initTimeSchedule(that: any) {
  try {
    cancelAllSchedule("time_tips");
    let scheduleList = await getScheduleList(); // 获取定时任务
    if (scheduleList && scheduleList.length > 0) {
      for (let item of scheduleList) {
        void setScheduleTask(that, item, `time_tips_${item.id}`);
      }
    }
  } catch (e) {
    log.fail(["initTimeSchedule error", e]);
  }
}

/**
 * 初始化定时任务
 * @param {}} that
 */
async function initTaskLocalSchedule(that: any) {
  try {
    cancelAllSchedule("task");
    const config: any = await Container.get(BaseConfig).getAllConfig(); // 获取配置信息
    const { dayTaskSchedule, roomNewsSchedule, roomTaskSchedule, countDownTaskSchedule } = config;
    // 每日说定时任务
    if (dayTaskSchedule && dayTaskSchedule.length > 0) {
      dayTaskSchedule.forEach((item: any, index: any) => {
        setTask(that, { type: "contact", ...item }, `task_day_${index}`, sendEveryDay);
      });
    }
    // 新闻资讯定时任务
    if (roomNewsSchedule && roomNewsSchedule.length > 0) {
      roomNewsSchedule.forEach((item: any, index: any) => {
        setTask(that, { type: "room", ...item }, `task_news_${index}`, sendNews);
      });
    }
    // 自定义内容定时任务
    if (roomTaskSchedule && roomTaskSchedule.length > 0) {
      roomTaskSchedule.forEach((item: any, index: any) => {
        setTask(that, { type: "room", ...item }, `task_custom_${index}`, sendCustom);
      });
    }
    // 倒计时定时任务
    if (countDownTaskSchedule && countDownTaskSchedule.length > 0) {
      countDownTaskSchedule.forEach((item: any, index: any) => {
        setTask(that, item, `task_countdown_${index}`, sendCountDown);
      });
    }
  } catch (e) {
    log.fail(["initTaskLocalSchedule error", e]);
  }
}


async function getMultiTargets(that: any, type: any, task: any) {
  const targets = [];
  if (task.isAll) {
    const allTargets = type === "room" ? await that.Room.findAll() : await that.Contact.findAll();
    if (task.excludeTargets) {
      allTargets.forEach((target: any) => {
        const find = type === "room" ? task.excludeTargets.find((eItem: { id: any; name: any; }) => target.id === eItem.id || target.topic() === eItem.name) : task.excludeTargets.find((eItem: { id: any; name: any; }) => target.id === eItem.id || target.name() === eItem.name);
        if (type === "room") {
          if (!find) {
            targets.push(target);
          }
        } else {
          if (!find && target.friend()) {
            targets.push(target);
          }
        }
      });
    }
    log.success(`查询到全部${type === 'room' ? '群聊':'好友'}数量为：${targets.length}`);
  } else {
    for (let target of task.names) {
      const finalTarget = type === "room" ? await that.Room.find({
        id: target.id, topic: target.name
      }) : await that.Contact.find({ id: target.id, name: target.name });

      if (finalTarget) {
        targets.push(finalTarget);
      } else {
        log.fail(`定时任务查找不到${type === "room" ? "群" : "好友"}：${target.name}，请检查${type === "room" ? "群名" : "好友昵称"}是否正确`);
      }
    }
  }
  return targets;
}


/**
 * 立即发送批量任务消息
 * @param {*} that bot对象
 * @param {*} item 任务项  { target: 'Room', event: '', message: { roomName: '', type: 'news 新闻 ||task 定时任务', contents: [] } }
 */
async function sendMultiTaskMessage(that: any, task: any) {
  try {
    const targets = await getMultiTargets(that, task.type, task);
    if (!targets.length) {
      log.fail("查找不到要发送的目标，请检查后重试");
      return;
    }

    if (task.taskType ==='news') {
      await sendNews({ that, isMulti: true, targets, item: task.taskInfo });
    } else if (task.taskType ==='custom') {
      await sendCustom({ that, isMulti: true, targets, item: { ...task.taskInfo, type: task.type } });
    } else if (task.taskType === "countdown") {
      await sendCountDown({ that, isMulti: true, targets, item: task.taskInfo });
    } else if (task.taskType === "customContent") {
      await sendCustomContent({ that, isMulti: true, targets, type: task.type, item: task.taskInfo });
    } else if (task.taskType === "customApi") {
      await sendCustomApi({ that, isMulti: true, targets, type: task.type, item: task.api });
    }
  } catch (error) {
    log.fail(["立即发送定时任务失败：", error]);
  }
}


async function startSendMultiTask({ that, task }: any) {
  const targets = await getMultiTargets(that, task.type, task);
  if (!targets.length) {
    return;
  }
  if (task.taskType === "news") {
   await sendNews({
      that,
      isMulti: true,
      targets,
      item: task.taskInfo
    })
  } else if (task.taskType === "custom") {
    await sendCustom({
      that,
      isMulti: true,
      targets,
      item: { ...task.taskInfo, type: task.type }
    })
  } else if (task.taskType === "countDown") {
    await sendCountDown({
      that,
      isMulti: true,
      targets,
      item: task.taskInfo
    });
  } else if (task.taskType === "customContent") {
    await sendCustomContent ({
      that,
      isMulti: true,
      targets,
      item: task.taskInfo
    });
  } else if (task.taskType === "customApi") {
    await sendCustomApi({ that, isMulti: true, targets, type: task.type, item: task.api });
  }
}

async function setMultiTask(that: any, task: { taskType: string; cron: any; id: any; }) {
  try {
    if (task.taskType === "news") {
      setLocalSchedule(task.cron, startSendMultiTask.bind(null, {
        that,
        task
      }), `schedule_news_${task.id}`);
    } else if (task.taskType === "custom") {
      setLocalSchedule(task.cron, startSendMultiTask.bind(null, {
        that,
        task
      }), `schedule_custom_${task.id}`);
    } else if (task.taskType === "countDown") {
      setLocalSchedule(task.cron, startSendMultiTask.bind(null, {
        that,
        task
      }), `schedule_countdown_${task.id}`);
    } else if (task.taskType === "customContent") {
      setLocalSchedule(task.cron, startSendMultiTask.bind(null, {
        that,
        task
      }), `schedule_customcontent_${task.id}`);
    } else if (task.taskType === "customApi") {
      setLocalSchedule(task.cron, startSendMultiTask.bind(null, {
        that,
        task
      }), `schedule_customcontent_${task.id}`);
    }
  } catch (e) {
    log.fail("catch error:" + e);
  }
}

/**
 * 初始化批量定时任务
 * @param that
 */
async function initMultiTask(that: any) {
  try {
    cancelAllSchedule("schedule");
    const config: any = await Container.get(BaseConfig).getAllConfig(); // 获取配置信息

    // const tasks = globalConfig.get('chatbot.allTasks'); // 获取所有任务
    const tasks = config.customContent; // 获取所有任务
    if (tasks && tasks.length) {
      tasks.forEach((item: any) => {
        void setMultiTask(that, item);
      });
    }
  } catch (e) {
    log.fail("initMultiTask error:" + e);
  }
}

/**
 * 初始化小助手任务
 * @param {*} that bot对象
 * @param {*} scheduleList 提醒任务列表
 * @param {*} daySayList 每日说任务列表
 * @param {*} RoomSayList 群资讯任务列表
 */
async function initAllSchedule(that: any) {
  await initTimeSchedule(that);
  await initTaskLocalSchedule(that);
}

export { initTaskLocalSchedule };
export { initAllSchedule };
export { initMultiTask };
export { initTimeSchedule };
export { sendTaskMessage };
export { sendMultiTaskMessage };
export default {
  initTaskLocalSchedule, initAllSchedule, initTimeSchedule
};
