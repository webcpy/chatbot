
export const schema = {
  database: {
    sqlite: {
			database: {
				doc: 'SQLite 数据库文件名',
				format: String,
				default: 'wechatbot.sqlite',
				env: 'DB_SQLITE_DATABASE',
			},
			enableWAL: {
				doc: '启用 SQLite WAL 模式',
				format: Boolean,
				default: false,
				env: 'DB_SQLITE_ENABLE_WAL',
			},
			executeVacuumOnStartup: {
				doc: '在启动时运行 VACUUM 操作来重建数据库。减小文件大小并优化索引。警告：这是一个长时间运行的阻塞操作。会增加启动时间。',
				format: Boolean,
				default: false,
				env: 'DB_SQLITE_VACUUM_ON_STARTUP',
			},
		},
    tablePrefix: {
      doc: '表格名称的前缀',
      format: '*',
      default: '',
      env: 'DB_TABLE_PREFIX'
    },
    logging: {
      enabled: {
        doc: 'Typeorm 日志记录启用标志。',
        format: Boolean,
        default: false,
        env: 'DB_LOGGING_ENABLED'
      },
      options: {
        doc: '日志记录级别选项，默认为 "error"。可能的值：query,error,schema,warn,info,log。要启用所有日志记录，请指定 "all"。',
        format: String,
        default: 'error',
        env: 'DB_LOGGING_OPTIONS'
      },
      maxQueryExecutionTime: {
        doc: '查询执行的最大毫秒数，在记录器记录警告之前。设置为 0 表示禁用长时间运行查询警告',
        format: Number,
        default: 0, // 0 禁用慢查询日志
        env: 'DB_LOGGING_MAX_EXECUTION_TIME'
      }
    }
  },
  project: {

  },
  token: {
    local: {
      doc: '本地token',
      format: String,
      default: '',
      env: 'PAD_LOCAL_TOKEN'
    },
    work: {
      doc: '企业微信token',
      format: String,
      default: '',
      env: 'WORK_PRO_TOKEN'
    }
  },
  chatbot: {
    apiKey: {
      doc: 'chatbot apiKey',
      format: String,
      default: '',
      env: 'CHATBOT_API_KEY'
    },
    ignoreMessages: {
      // 需要忽略的关键词 [{type:'start', word: ''},{type:'end', word: ''},{type:'equal', word: ''},{type:'include', word: ''}]
      doc: '需要忽略的关键词',
      format: Array,
      default: [],
      env: 'CHATBOT_IGNORE_MESSAGE'
    },
    ignoreEvents: {
      // 需要忽略的事件 ['scan', 'login', 'logout', 'friendship', 'room-join', 'room-topic', 'room-leave', 'message', 'ready', 'heartbeat', 'error']
      doc: '需要忽略的事件',
      format: (val: any) => {
        if (!Array.isArray(val)) {
          throw new Error('ignoreEvents必须是一个数组');
        }
        // 验证数组中的每个值是否都在指定的事件列表中
        const allowedEvents = ['scan', 'login', 'logout', 'friendship', 'room-join', 'room-topic', 'room-leave', 'message', 'ready', 'heartbeat', 'error'];
        val.forEach(event => {
          if (!allowedEvents.includes(event)) {
            throw new Error(`不支持的事件类型：${event}`);
          }
        });
      },
      default: [],
      env: 'CHATBOT_IGNORE_EVENT'
    },
    scanTimes: {
      doc: '需要忽略的事件',
      format: Number,
      default: 50,
      env: 'CHATBOT_SCAN_TIME'
    },
    qrcodeKey: {
      doc: '企微二维码key',
      format: String,
      default: '',
      env: 'QR_CODE_KEy'
    },
    verifyCode: {
      doc: '企微验证码',
      format: String,
      default: '',
      env: 'VERIFY_CODE'
    },
    verifyId: {
      doc: '企微验证码id',
      format: String,
      default: '',
      env: 'VERIFY_ID'
    },
    gptconfig: {
      doc: 'chatgpt',
      format: Array,
      default: [],
      env: 'GPT_CONFIG'
    },
    allTasks: {
      doc: '定时任务',
      format: Array,
      default: [],
      env: 'ALL_TASK'
    },
    version: {
      doc: '版本号',
      format: String,
      default: '0.0.1',
      env: 'BOT_VERSION'
    },
    userId: {
      doc: '用户id',
      format: String,
      default: '',
      env: 'USERID'
    },
  },
  api: {
    chatbot: {
      doc: 'CHATBO_后台地址',
      format: String,
      default: 'http://127.0.0.1:7001/openApi',
      env: 'CHATBOT_API'
    },
    txApi: {
      doc: '天行API',
      format: String,
      default: 'http://api.tianapi.com',
      env: 'TX_API'
    },
    newTxApi: {
      doc: '天行API',
      format: String,
      default: 'http://apis.tianapi.com',
      env: 'NEW_TX_API'
    },
    audioTextApi: {
      doc: 'WhisperApi',
      format: String,
      default: 'http://1.92.99.25:9000/',
      env: 'AUDIO_TEXT_API'
    },
    tuling: {
      doc: '图灵API',
      format: String,
      default: 'http://openapi.tuling123.com/openapi/api/v2',
      env: 'TULING_API'
    },
    doutu: {
      doc: '斗图API',
      format: String,
      default: 'https://doutu.lccyy.com/t/doutu/items?pageNum=1&pageSize=20&',
      env: 'DOUTU_API'
    },
    img: {
      doc: '随机图片API',
      format: String,
      default: 'https://api.pixivweb.com/anime18r.php?return=json',
      env: 'IMG_API'
    }
  }
}
